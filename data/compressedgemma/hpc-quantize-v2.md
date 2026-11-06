# CompressedGemma/HPC-Quantize-V2

## Resumen

HPC-Quantize V2 es una herramienta de cuantizacion de pesos para modelos de lenguaje de gran tamano, desarrollada por el usuario CompressedGemma y publicada en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje en si, sino de un motor de cuantizacion ultra-bajo bit escrito en Python y NumPy que re-cuantiza modelos GGUF compatibles con llama.cpp a la clase de 2 bits (Q2_K, 2.625 bits por peso). El repositorio incluye una interfaz grafica de escritorio con telemetria en tiempo real (`gui.py`) y un pipeline directo GGUF-a-GGUF.

El problema que aborda es la perdida de calidad que sufre la cuantizacion Q2_K estandar cuando se aplica directamente a pesos de LLM: el colapso de valores atipicos dentro de sub-bloques de 16 pesos, el aplastamiento de escalas entre sub-bloques de un mismo superbloque y la negligencia del termino cruzado escala-offset. La propuesta del autor es tratar la cuantizacion como un problema de factorizacion bilineal acoplada y optimizacion global de secuencia, en lugar de un redondeo independiente con busqueda exhaustiva en rejilla.

La relevancia actual del proyecto radica en que permite comprimir modelos de hasta 50 GB en GPUs de consumo (el autor menciona una RTX 3060 de 12 GB con tiempos de 3 a 4 horas por modelo) sin dependencias de C ni de `ctypes`, con determinismo bit a bit entre ejecuciones y salida compatible con el ecosistema llama.cpp. No se dispone de informacion sobre arquitectura de modelo, numero de parametros ni contexto, ya que la ficha corresponde a una herramienta y no a un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cuantizacion Python/NumPy para GGUF (no es un modelo neuronal) |
| Parametros totales | no disponible (aplica a modelos de entrada de cualquier tamano) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrada: F32, F16, BF16, Q8_0, Q4_0, Q2_K. Salida: Q2_K (2.625 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (lectura y escritura), iMatrix en `.gguf`/`.dat` |

## Arquitectura y entrenamiento

HPC-Quantize V2 no entrena ningun modelo; opera sobre pesos ya entrenados. Su arquitectura interna se organiza en tres modulos principales. El primero, `analog.py`, construye una cartera de "analogos de pesos que preservan la geometria": bloques sustitutos que conservan los momentos de primer y segundo orden ponderados por importancia, el orden de rango, la direccion unitaria del sub-bloque (coseno igual a 1), la energia total del bloque y la matriz de Gram del pliegue D6/Vesica, regularizando a la vez los valores atipicos hacia la rejilla de 4 niveles de Q2_K. El segundo, `factored.py`, sustituye las heuristicas independientes de escala y offset por una descomposicion ortogonalizada de sub-bloque con compensacion acoplada de offset y refinamiento algebraico de codigo de rango 1, evaluando 36 semillas candidatas de forma vectorizada (el autor afirma que es 81 veces mas rapido que bucles por semilla). El tercero, `pipeline.py`, reemplaza los escaneos de fuerza bruta de 16x16 sub-bloques y los bucles ULP de 9x9 por proyecciones en forma cerrada sobre estadisticos suficientes, alcanzando segun el autor entre 1.200 y 1.475 bloques por segundo en la fase 4, con un 2,64 % menos de error objetivo que la fase 4 de fuerza bruta en un noveno del tiempo.

El motor distribuye las resoluciones independientes por bloque entre todos los nucleos de CPU mediante memoria compartida con `fork` de copia cero, manteniendo estrictamente secuenciales el tamiz de 6 estados entre bloques, el programador dinamico de Viterbi de 36 estados y el arrastre DC por filas. El resultado es una salida GGUF identica bit a bit independientemente del numero de workers. La GUI muestra progreso por etapa y bloque, doble estimacion de tiempo restante (por tensor y ponderada por bloque para el modelo completo), RMSE y RMSE/sigma en vivo, temperatura del tamiz y aciertos de suelo. El autor recomienda una estrategia de cuantizacion en tres pasos: cuantizar primero a 8_0 con llama-quantize, generar una iMatrix a partir de ese 8_0 y finalmente cuantizar el 8_0 a Q2K.

## Capacidades

- Cuantizacion ultra-bajo bit de modelos GGUF a Q2_K (2.625 bits por peso) con salida compatible con llama.cpp.
- Re-cuantizacion directa GGUF-a-GGUF desde F32, F16, BF16, Q8_0, Q4_0 y Q2_K.
- Lectura y uso de matrices de importancia iMatrix en formato `.gguf` y `.dat`.
- Preservacion de geometria de pesos mediante analogos iso-momento y compensacion acoplada de offset.
- Optimizacion global de secuencia con tamiz secuencial de 6 estados y Viterbi de 36 estados.
- Ejecucion multinucleo determinista bit a bit con `--workers 0`.
- Interfaz grafica de escritorio con telemetria en tiempo real (progreso, ETA, RMSE, temperatura del tamiz).
- Sin dependencias de C ni `ctypes`; no requiere kernels de inferencia personalizados.

## Casos de uso

- Despliegue de modelos grandes en GPU de consumo: un modelo de 50 GB puede cuantizarse a Q2_K en una RTX 3060 de 12 GB en 3-4 horas, permitiendo ejecutar en local modelos que de otro modo requeririan hardware de centro de datos.
- Pipeline de publicacion de modelos: integracion en flujos de CI/CD que tomen un checkpoint en F16 o BF16, generen un Q8_0 intermedio, produzcan una iMatrix y emitan un Q2_K listo para distribucion con llama.cpp.
- Investigacion en cuantizacion: el codigo modular (`analog.py`, `factored.py`, `pipeline.py`) permite aislar y evaluar cada etapa del proceso (analogos, factorizacion bilineal, ensamblado de bloques) frente a lineas base de fuerza bruta.
- Reproducibilidad experimental: el determinismo bit a bit con independencia del numero de workers facilita la replicacion de resultados y la comparacion entre configuraciones de hardware.
- Servicio de cuantizacion por lotes: al escalar a todos los nucleos de CPU y procesar bloques de forma independiente, es adecuado para convertir catalogos de modelos en serie.
- Monitorizacion de calidad durante la conversion: la GUI con RMSE y RMSE/sigma en vivo permite detectar tensores problematicos o colapsos de rejilla durante el proceso, sin esperar al resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de modelo (perplejidad, MMLU, HumanEval u otros) en la informacion disponible. El autor unicamente reporta metricas internas del motor de cuantizacion:

| Metrica | Valor reportado por el autor |
|---|---|
| Rendimiento en fase 4 | 1.200-1.475 bloques/segundo |
| Mejora de error objetivo vs. fuerza bruta | +2,64 % menor error en 1/9 del tiempo |
| Aceleracion del evaluador de 36 semillas | 81x frente a bucles por semilla |
| Determinismo | 100 % identico bit a bit con cualquier numero de workers |
| Tiempo de cuantizacion (modelo de 50 GB) | 3-4 horas en RTX 3060 12 GB |

## Requisitos de hardware

- GPU CUDA obligatoria segun el autor (el motor esta escrito en Python/NumPy, pero la nota del desarrollador exige CUDA).
- VRAM: el autor cita una RTX 3060 de 12 GB como hardware de referencia para cuantizar un modelo de 50 GB en 3-4 horas.
- GPU recomendadas: no se especifican modelos concretos mas alla de la RTX 3060; no hay datos para A100, H100 o RTX 4090.
- Caben en GPU de consumo: si, segun la referencia del autor (RTX 3060 12 GB).
- Opciones de despliegue del resultado: llama.cpp y cualquier runtime compatible con GGUF Q2_K (Ollama, entre otros); el motor en si no requiere kernels personalizados.
- Latencia y throughput de cuantizacion: 1.200-1.475 bloques/s en fase 4 y 3-4 horas para un modelo de 50 GB en RTX 3060 12 GB. No hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Herramienta | Enfoque | Bits por peso | Dependencias | Licencia | Salida |
|---|---|---|---|---|---|
| HPC-Quantize V2 | Factorizacion bilineal acoplada y Viterbi | 2.625 (Q2_K) | Python/NumPy, CUDA | MIT | GGUF Q2_K |
| llama.cpp `llama-quantize` | Cuantizacion estandar con iMatrix opcional | Variable (Q2_K incluido) | C/C++ | MIT | GGUF |
| GPTQ | Cuantizacion post-entrenamiento por capas | 2-4 bits tipico | Python, CUDA | Apache 2.0 | safetensors |
| AWQ | Cuantizacion consciente de activaciones | 4 bits tipico | Python, CUDA | MIT | safetensors |

No se dispone de comparaciones de calidad medidas entre HPC-Quantize V2 y estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene capacidades cognitivas; cualquier evaluacion debe hacerse sobre el modelo cuantizado resultante.
- No hay datos publicados de perplejidad ni de benchmarks de calidad tras la cuantizacion, por lo que la afirmacion de mejor error objetivo no esta validada de forma independiente.
- El autor exige GPU CUDA, lo que limita su uso en entornos solo CPU o Apple Silicon.
- Los tiempos reportados (3-4 horas para 50 GB) corresponden a una unica configuracion de hardware y pueden no generalizarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion por la comunidad.
- La model card esta truncada en la informacion disponible, por lo que pueden faltar detalles de implementacion o advertencias del autor.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad del modelo cuantizado resultante.
- La cuantizacion a 2 bits implica degradacion inherente de calidad en modelos de lenguaje; no se documenta el impacto por tarea o idioma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CompressedGemma/HPC-Quantize-V2
- Imagen de la GUI citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/69de1a493a21cb7c029dc694/BvRBBP2uBGxYhQnsxH6jZ.png
- llama.cpp (runtime compatible con la salida GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.

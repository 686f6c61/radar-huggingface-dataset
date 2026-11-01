# 3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2

## Resumen

Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2 es una compilación experimental para Apple Silicon, publicada por el usuario 3hs4n en Hugging Face, del modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored. Se trata de un modelo multimodal (texto e imagen) con etiqueta de arquitectura `qwen4_exp`, cuantizado en 8 bits con precisión mixta (expertos a 2 bits, tabla PLE a 4 bits y componentes sensibles en FP16) y empaquetado para ejecutarse con MLX y MLX-VLM en Macs con memoria unificada.

La particularidad de esta edición es que incorpora decodificación especulativa DFlash2: incluye un drafter BF16 de aproximadamente 1,2 GB y un punto de entrada `run_dflash2.py` que acelera la generación de texto. Según las mediciones del autor en un M1 Max de 64 GiB, la decodificación de código y matemáticas alcanza 37,62 y 33,69 tokens/s, lo que supone mejoras de 1,70x y 1,56x frente a la edición básica sin drafter.

Es relevante porque demuestra que modelos de gran tamaño (177,39 mil millones de parámetros lógicos) pueden ejecutarse en hardware de consumidor Apple gracias a la cuantización agresiva mixta y a una tabla PLE de 32 GB mapeada desde disco. Sin embargo, la edición es deliberadamente limitada: generación greedy solo de texto, sin pensamiento extendido, sin imágenes y sin tool calling en su punto de entrada, con un contexto de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (transformer, detalles no disponibles) |
| Parametros totales | 177.392.830.611 (dato real de safetensors) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | 8.192 tokens totales / 4.096 tokens maximos de salida |
| Tipos de cuantizacion | 8 bits (configuracion por defecto), expertos a 2 bits, PLE a 4 bits, componentes sensibles en FP16, drafter en FP32/BF16 |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-license-1.0 (licencia "other" de la familia Qwen) |
| Formato de pesos | safetensors (paquete MLX, tamano del repo 74,0 GB) |

## Arquitectura y entrenamiento

El modelo base es orcarouter/Qwen3.8-Flash-Next-Uncensored, etiquetado con la arquitectura experimental `qwen4_exp` y clasificado como image-text-to-text. La model card no detalla la composicion interna (numero de capas, expertos, atencion), ni los datos o tokens de entrenamiento, ni si hubo RLHF/DPO. El sufijo "Uncensored" sugiere un ajuste que reduce filtros de seguridad, pero el autor no documenta el metodo.

Esta compilacion anade tres elementos sobre el modelo base. Primero, cuantizacion de precision mixta: aunque la etiqueta del panel es 8 bits, la configuracion real usa expertos a 2 bits, una tabla PLE de 32,0 GB almacenada a 4 bits que se mapea desde disco y se lee bajo demanda, y componentes sensibles en FP16. Segundo, un drafter BF16 de 1.206.140.008 bytes para decodificacion especulativa DFlash2 con bloque de 4 tokens. Tercero, un entorno de ejecucion bloqueado con 73 paquetes PyPI con hash fijado (MLX/MLX-Metal 0.32.4, MLX-VLM 0.7.10, Transformers 5.17.0, Tokenizers 0.23.3) sobre CPython 3.13 y macOS 26 o superior.

## Capacidades

- Generacion de texto greedy (sin muestreo) mediante `run_dflash2.py`, con aceleracion especulativa DFlash2 en codigo y matematicas (37,62 y 33,69 tokens/s medidos).
- El modelo incluido es multimodal (texto e imagen), pero el punto de entrada DFlash2 es solo texto y no acepta imagenes; para vision hay que usar la edicion basica compatible.
- Razonamiento matematico verificado en un subconjunto fijo publico de 50 casos de GSM8K con resultado 50/50, coincidiendo con la referencia nativa.
- Sin soporte de thinking mode, tool calling, prefix caching ni muestreo en esta edicion: el punto de entrada no los expone.
- Capacidades multilingues: no disponibles en la documentacion.
- Sin soporte de agentes ni razonamiento multi-paso documentado.

## Casos de uso

- Resolucion de problemas de matematicas en Macs Apple Silicon: el perfil de 50 casos de GSM8K con 50/50 aciertos y decodificacion a 33,69 tokens/s lo hace adecuado para generar soluciones aritmeticas y algebraicas locales sin GPU remota.
- Generacion de codigo en local: las pruebas de codigo calientes decodifican a 37,62 tokens/s, util para escribir funciones y utilidades Python directamente en un portatil o sobremesa Mac de 64 GiB sin depender de la nube.
- Experimentacion con decodificacion especulativa: al incluir el drafter BF16 y el runtime verificado, es un banco de pruebas realista para medir el impacto de DFlash2 frente a inferencia estandar en MLX.
- Prototipado de asistentes conversacionales locales: el pipeline conversacional permite construir chatbots que ejecutan un modelo de 177B de parametros enteramente en memoria unificada, con privacidad de datos garantizada al no salir del dispositivo.
- Evaluacion de modelos "uncensored" en investigacion: util para estudiar el comportamiento de variantes sin filtros de seguridad en entornos controlados de laboratorio.
- Validacion de despliegues con memoria mapeada: la tabla PLE de 32 GB leida bajo demanda sirve como caso de estudio para tecnicas de paginacion de pesos en sistemas con memoria unificada limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. Los unicos datos medidos provienen de la model card del autor:

| Metrica | Valor |
|---|---|
| GSM8K (subconjunto fijo de desarrollo, 50 casos) | 50/50, respuestas identicas a la referencia nativa |
| Decodificacion de codigo (caliente, M1 Max 64 GiB) | 37,62 tokens/s (1,70x frente a la edicion basica) |
| Decodificacion de matematicas (caliente, M1 Max 64 GiB) | 33,69 tokens/s (1,56x frente a la edicion basica) |
| Pico de huella fisica del proceso | 42,12 GiB |
| Pico maximo del asignador MLX por caso | 41,25 GiB |
| Tiempo de instalacion del entorno | 42,38 s (73/73 paquetes verificados) |

## Requisitos de hardware

- Memoria unificada recomendada: 64 GiB (probado en M1 Max con 64 GiB). Con 32 GB no alcanza el payload residente estimado de 38,01 GiB; con 48 GB esta sin verificar y queda poco margen.
- Pico medido de memoria: 42,12 GiB de huella fisica del proceso y 41,25 GiB de pico del asignador MLX (contadores solapables, no sumables).
- Descarga completa: 74,048 GB de almacenamiento mas aproximadamente 1 GB para el entorno Python. El tamano de descarga no equivale al uso de RAM.
- No cabe en GPUs de consumidor NVIDIA convencionales: el paquete esta diseñado para Apple Silicon con MLX; no se documentan rutas CUDA.
- Despliegue: mediante el instalador incluido (`install_runtime.py` sobre CPython 3.13) y el script `run_dflash2.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: 37,62 tokens/s (codigo) y 33,69 tokens/s (matematicas) en pruebas calientes; no hay datos de latencia de primer token.
- Plataforma: macOS 26 o superior, Apple Silicon.

## Comparativa con modelos similares

| Caracteristica | Esta edicion (DFlash2) | Edicion basica optimizada (mismo autor) | Modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored |
|---|---|---|---|
| Parametros logicos | 177,39B | 177,39B | 177,39B |
| Tamano de descarga | 74,048 GB | 72,843 GB | no disponible |
| Vision | no en el entrypoint incluido | si, con helper compatible | si (pipeline image-text-to-text) |
| Thinking mode | no | opcional | no disponible |
| Decodificacion especulativa | si (DFlash2, drafter BF16) | no | no disponible |
| Contexto | 8.192 tokens | no disponible | no disponible |
| Licencia | qwen-community-license-1.0 | qwen-community-license-1.0 | qwen-community-license-1.0 |

No se dispone de datos para comparar con otros modelos de la categoria (por ejemplo, Qwen3 de tamano similar) en cuanto a benchmarks, contexto o licencias, ya que no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Edicion estrictamente greedy y solo texto: sin thinking, sin imagenes, sin tool calling, sin muestreo y sin prefix caching en el punto de entrada incluido; las aceleraciones DFlash2 no aplican a entrada de imagen.
- Contexto reducido: 8.192 tokens totales y 4.096 de salida maxima, insuficiente para documentos largos o conversaciones muy extensas.
- Variante "uncensored": al tratarse de una derivada sin filtros documentados, el riesgo de generar contenido harmful, sesgado o incorrecto es mayor; su uso exige salvaguardas adicionales en produccion.
- Riesgo de alucinacion: no evaluado mas alla del subconjunto de 50 casos de GSM8K; no hay mediciones de veracidad general.
- Idiomas soportados no documentados; las capacidades multilingues son desconocidas.
- Licencia qwen-community-license-1.0: las licencias comunitarias de Qwen suelen imponer restricciones a usos comerciales de gran escala (limites de usuarios mensuales o requisitos de registro); conviene revisar el texto LICENSE antes de uso comercial.
- Las mediciones de memoria y velocidad corresponden exclusivamente al perfil probado en un M1 Max de 64 GiB con el runtime incluido; otros cargadores, configuraciones y capacidades de memoria no estan verificados. El aviso de Hugging Face sobre 64 GB se refiere al tamano del checkpoint (74 GB), no a la RAM medida.
- Modelo experimental con etiqueta `qwen4_exp` y muy pocas descargas (379): la madurez y estabilidad para produccion no estan demostradas.

## Enlaces

- Modelo: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2
- Edicion basica optimizada (con vision): https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Evidencia de recursos: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2/blob/main/evidence/resources.json
- Resumen de la ejecucion GSM8K: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2/blob/main/evidence/gsm8k50-edition.json
- Evidencia de instalacion: https://huggingface.co/3hs4n/Qwen3.8-Flash-Next-Uncensored-mlx-optimized-2-8bit-DFlash2/blob/main/evidence/runtime-installation.json
- Licencia: enlace LICENSE en el repositorio del modelo (qwen-community-license-1.0)
- Paper, blog o demo adicional: no disponible

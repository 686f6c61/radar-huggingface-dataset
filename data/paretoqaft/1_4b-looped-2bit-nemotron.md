# ParetoQaft/1_4B-looped-2bit-nemotron

## Resumen

1_4B-looped-2bit-nemotron es una cuantizacion de 2 bits (W2A16) del modelo ByteDance/Ouro-1.4B, un transformer con arquitectura "looped" (capas compartidas reutilizadas en varias iteraciones). Lo publica el usuario ParetoQaft dentro de un esfuerzo de evaluacion de tecnicas de cuantizacion agresiva (ParetoQ) sobre arquitecturas no convencionales, y emplea AutoRound 0.9.2 parcheado especificamente para manejar el bucle de capas compartidas.

El modelo resuelve un problema concreto: comprimir un modelo de 1.434 millones de parametros a un formato de 2 bits empaquetado en AutoGPTQ (int2 simetrico, group size 128), reduciendo el repositorio a 0,7 GB. Es relevante porque demuestra, y a la vez expone los limites, de la cuantizacion extrema en arquitecturas con pesos compartidos entre iteraciones, donde la calibracion conjunta de cada bloque es critica.

La contrapartida es severa: la propia model card reporta una caida de GSM8K (3-shot) del 77,9 % en BF16 al 9,6 % en esta version de 2 bits. Se trata, por tanto, de un artefacto de investigacion para estudiar el trade-off precision-tamano, no de un modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (24 capas compartidas, 4 loops) |
| Parametros totales | 1.434.652.673 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W2A16 (int2 simetrico, group size 128), AutoGPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (AutoGPTQ), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base, ByteDance/Ouro-1.4B, es un transformer con pesos compartidos: 24 capas que se aplican en 4 iteraciones (loops) sucesivas, de modo que el modelo "reutiliza" el mismo bloque de parametros varias veces. Esta comparticion reduce el numero de parametros unicos frente a un transformer equivalente con capas independientes, pero complica la cuantizacion, ya que un mismo conjunto de pesos debe servir correctamente a las entradas de las cuatro iteraciones.

La cuantizacion se realizo con AutoRound 0.9.2, parcheado para la arquitectura looped: cada bloque compartido se calibra conjuntamente con sus entradas procedentes de las 4 iteraciones (propagacion de entradas cuantizadas), de forma que un unico juego de pesos cuantizados cubre todos los loops. La calibracion uso 512 muestras de 2048 tokens del dataset ParetoQaft/nemotron_calib, 1000 iteraciones, batch 8, semilla 42, con `enable_alg_ext=True` y `enable_quanted_input=True`. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento aritmetico basico: la model card evalua GSM8K, aunque con una degradacion muy acentuada tras la cuantizacion.
- Reutilizacion de parametros mediante bucle de capas, lo que permite un modelo de 1,4B con comportamiento efectivo de mas profundidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el rendimiento en GSM8K sugiere que no es fiable para tareas multi-paso.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre cuantizacion extrema: sirve como caso de estudio de como la cuantizacion a 2 bits afecta a arquitecturas con pesos compartidos, comparando la calibracion conjunta por loop frente a metodos ingenuos.
- Evaluacion de metodologias AutoRound/AutoGPTQ: permite reproducir el pipeline de calibracion (512 muestras x 2048 tokens, 1000 iteraciones) y medir su impacto en tareas de razonamiento.
- Despliegue en entornos con memoria extremadamente limitada: con 0,7 GB de repositorio, puede cargarse en dispositivos de borde o GPUs de gama baja para tareas de generacion de texto tolerantes a errores.
- Pruebas de regresion de pipelines de inferencia: util para validar que un runtime (transformers con `trust_remote_code`, kernels GPTQ) carga correctamente modelos con codigo de modelado personalizado.
- Generacion de texto de baja criticidad: borradores, completado de frases o respuestas conversacionales donde no se exige precision aritmetica ni factual.
- Benchmarking comparativo de formatos de cuantizacion: punto de referencia de 2 bits frente a versiones de 4 u 8 bits del mismo modelo base.

## Benchmarks y rendimiento

| Benchmark | Este modelo (2 bits) | BF16, 4 loops |
|---|---|---|
| GSM8K (3-shot, 1319 preguntas), exact match | 9,6 % | 77,9 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,7-1 GB para los pesos en 2 bits, mas overhead de activaciones y del codigo de modelado personalizado; el valor exacto no esta disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` y kernels AutoGPTQ; compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| 1_4B-looped-2bit-nemotron | 1,43B (24 capas, 4 loops) | no disponible | 9,6 % (3-shot) | no disponible | AutoGPTQ int2 |
| ByteDance/Ouro-1.4B (BF16) | 1,43B (24 capas, 4 loops) | no disponible | 77,9 % (3-shot) | no disponible | safetensors |
| Otras cuantizaciones de Ouro-1.4B (4/8 bits) | 1,43B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de rendimiento: la caida en GSM8K del 77,9 % al 9,6 % indica que la cuantizacion a 2 bits destruye buena parte de la capacidad de razonamiento del modelo base.
- Riesgo elevado de alucinacion y errores aritmeticos: no es apto para tareas que requieran precision factual o calculo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no hay garantia de comportamiento multilingue.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo de modelado incluido en el repositorio, lo que implica un riesgo de seguridad que debe auditarse.
- Contexto maximo no documentado: no se puede planificar su uso en tareas de contexto largo.
- Modelo practicamente sin adopcion (0 descargas, 0 likes) y con fecha de creacion muy reciente: no hay validacion independiente de su comportamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParetoQaft/1_4B-looped-2bit-nemotron
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de calibracion: https://huggingface.co/datasets/ParetoQaft/nemotron_calib

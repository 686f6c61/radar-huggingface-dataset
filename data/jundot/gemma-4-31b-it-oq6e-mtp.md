# Jundot/gemma-4-31B-it-oQ6e-mtp

## Resumen

Jundot/gemma-4-31B-it-oQ6e-mtp es una cuantizacion mixta de precision del modelo google/gemma-4-31B-it, el modelo denso de 30,7B parametros de la familia Gemma 4 de Google DeepMind. El checkpoint incorpora el modelo de lenguaje, el codificador de vision y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant. Lo publica el usuario Jundot bajo licencia Apache-2.0, siguiendo la licencia del modelo fuente, y esta empaquetado en formato MLX para ejecucion en hardware Apple Silicon.

La relevancia de esta variante reside en la cuantizacion: el metodo oQ (oMLX v0.8.0) asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia, logrando un promedio efectivo de 6,700 bits por peso en el backbone y 7,004 bits por peso en el checkpoint completo. Esto reduce el almacenamiento total a 25,883 GiB para 31.743B parametros logicos, manteniendo el contexto de 256K tokens, la entrada de texto e imagen y los modos de razonamiento configurables del modelo original.

El modelo resuelve el problema de desplegar un modelo multimodal de gran contexto en equipos con memoria unificada limitada, sin renunciar a la cabeza MTP que habilita decodificacion especulativa. Con 25.085 descargas en Hugging Face, se posiciona como una opcion practica para desarrolladores que trabajan en el ecosistema MLX y necesitan inferencia local de un modelo de 31B con capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 31.742.607.472 (31,743B logicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ6e mixta: affine 6-bit grupo 64 (27,641B), affine 8-bit grupo 64 (3,061B), BF16 (1,040B) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (siguiendo la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), 54,7 GB de repo; checkpoint logico 25,883 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30,7B parametros con capacidades multimodales de entrada texto-imagen. La familia Gemma 4 incorpora modos de razonamiento (thinking modes) configurables y una ventana de contexto de 256K tokens. Esta variante anade una cabeza MTP de 0,470B parametros (0,875 GiB en almacenamiento) fusionada desde el modelo asistente google/gemma-4-31B-it-assistant, que permite decodificacion especulativa multi-token para acelerar la generacion.

La cuantizacion oQ6e, desarrollada en oMLX v0.8.0, aplica un esquema de precision mixta que asigna bits segun la sensibilidad medida de cada capa. El proceso de redondeo utiliza una matriz de importancia construida con 128 muestras de 512 tokens y un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. El resultado distribuye 27,641B pesos en affine 6-bit (87,080% del total, 20,916 GiB), 3,061B en affine 8-bit (9,643%, 3,029 GiB) y 1,040B en BF16 (3,278%, 1,938 GiB), con un promedio efectivo de 6,700 bits por peso en el backbone del lenguaje. No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking modes) configurables.
- Procesamiento de imagenes como entrada (pipeline image-text-to-text) mediante el codificador de vision de 0,576B parametros.
- Conversacion multi-turno con contexto de hasta 256K tokens.
- Decodificacion especulativa mediante la cabeza MTP fusionada, que acelera la generacion.
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: el contexto de 256K tokens permite procesar informes, contratos o expedientes completos que combinan texto y figuras, usando el codificador de vision para interpretar graficos y tablas escaneadas.
- Asistencia conversacional local en Apple Silicon: el formato MLX y el tamano de 25,883 GiB permiten desplegar un modelo de 31B en equipos con memoria unificada alta, gestionando conversaciones multi-turno con contexto largo sin depender de la nube.
- Generacion acelerada de texto en produccion: la cabeza MTP habilita decodificacion especulativa, adecuada para escenarios donde la latencia de generacion es critica, como autocompletado o resumenes en tiempo real.
- Procesamiento de imagenes medicas o tecnicas: el pipeline image-text-to-text permite describir, clasificar o extraer informacion de imagenes acompanadas de texto de referencia, con el contexto largo necesario para incluir historiales completos.
- Investigacion en cuantizacion: el checkpoint sirve como referencia para estudiar el impacto del esquema oQ6e en la calidad frente al modelo BF16 original, dado que el autor documenta la distribucion de bits por componente.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en MLX, permite procesar datos sensibles (texto e imagen) sin enviarlos a servicios externos, cumpliendo con politicas de confidencialidad.
- Evaluacion de modelos multimodales: util para comparar el rendimiento de un modelo de 31B cuantizado a ~7 bits frente a alternativas en tareas de vision y lenguaje con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 25,883 GiB en almacenamiento; la inferencia requiere memoria adicional para el contexto KV, que crece con la longitud de la secuencia (hasta 256K tokens).
- GPU recomendadas: al estar en formato MLX, esta disenado para Apple Silicon (chips M-series con memoria unificada). No se especifican GPUs NVIDIA en la informacion disponible.
- Cabe en consumer GPU: no se confirma para GPUs de consumo con 24 GB (RTX 4090), dado que el checkpoint supera esa cifra. En Apple Silicon, requiere equipos con memoria unificada de al menos 32 GB, preferiblemente 64 GB o mas para contextos largos.
- Opciones de despliegue: MLX (libreria nativa), oMLX v0.8.0 como herramienta de cuantizacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La cabeza MTP esta disenada para mejorar la velocidad mediante decodificacion especulativa, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ6e-mtp | 31,743B | 256K | oQ6e (6,700 bits/peso backbone) | Apache-2.0 | safetensors MLX |
| google/gemma-4-31B-it | 30,7B | 256K | BF16 original | Apache-2.0 (Gemma 4) | safetensors |
| google/gemma-4-31B-it-assistant | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion proporcionada. No se dispone de datos de rendimiento comparado con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion a ~7 bits por peso introduce perdida de precision respecto al modelo BF16 original; el autor indica que la version actual (2026-11-19) reduce el error de cuantizacion, pero no cuantifica la degradacion resultante.
- El modelo esta empaquetado exclusivamente en formato MLX, lo que limita su uso a hardware Apple Silicon y descarta el despliegue en GPUs NVIDIA sin conversion adicional.
- El contexto de 256K tokens implica un consumo de memoria KV significativo; en equipos con memoria unificada ajustada puede no ser viable alcanzar la ventana completa.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan evaluaciones especificas de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache-2.0 se hereda del modelo fuente, pero el autor enlaza a la licencia Gemma 4 de Google; conviene verificar los terminos de uso comercial en el enlace oficial antes de un despliegue en produccion.
- La cabeza MTP fusionada proviene de un modelo asistente separado; su comportamiento en combinacion con la cuantizacion no esta evaluado publicamente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ6e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

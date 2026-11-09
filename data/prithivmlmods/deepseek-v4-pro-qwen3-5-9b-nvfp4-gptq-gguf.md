# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF es una cuantizacion de 4 bits en formato NVFP4 con GPTQ del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un ajuste fino de razonamiento de 9.197 millones de parametros construido sobre Qwen3.5-9B y destilado de DeepSeek-V4-Pro. El trabajo de cuantizacion lo firma prithivMLmods y se distribuye en formato GGUF para su uso con llama.cpp y otros runners compatibles, junto con un fichero de proyeccion multimodal (mmproj) que habilita las capacidades de vision.

El modelo fuente fue entrenado con SFT seguido de una etapa ligera de RL con GSPO sobre aproximadamente 250.000 muestras de matematicas y STEM, sin datos de codigo. Su proposito es ofrecer razonamiento matematico y cientifico con cadenas de razonamiento mas cortas que el modelo base, lo que se traduce en menos tokens generados por respuesta correcta.

La relevancia de esta publicacion concreta es la combinacion de dos factores: por un lado, el formato NVFP4 con GPTQ esta pensado para aprovechar los tensor cores FP4 de las GPU NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300); por otro, el soporte de Multi-Token Prediction (MTP) integrado en los pesos permite decodificacion especulativa sin un modelo borrador separado. La licencia es Apache 2.0 y el modelo se declara experimental, con la advertencia explicita de que sus salidas requieren verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) con cabezas de Multi-Token Prediction (MTP) para decodificacion especulativa; soporte multimodal via proyeccion (mmproj) |
| Parametros totales | 9.197.094.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con GPTQ (4 bits); fichero principal de 8,46 GB; proyeccion multimodal de 922 MB |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos cuantizados y mmproj separado) |

## Arquitectura y entrenamiento

El modelo fuente es un ajuste fino de razonamiento sobre Qwen3.5-9B, destilado de DeepSeek-V4-Pro en modo "Max Effect" sobre unas 250.000 muestras de matematicas y STEM. El entrenamiento combino SFT con una etapa posterior de RL ligera mediante GSPO. No se incluyeron datos de codigo en el proceso. La arquitectura incorpora cabezas de Multi-Token Prediction (MTP): en lugar de depender de un modelo borrador externo, el propio modelo predice varios tokens futuros en un unico forward pass, lo que habilita decodificacion especulativa acelerada directamente desde los pesos.

Esta version concreta aplica cuantizacion GPTQ sobre el checkpoint para estabilizar la compresion a NVFP4, un formato de coma flotante de 4 bits con escalas por bloque orientado a los tensor cores FP4 de NVIDIA Blackwell. El autor indica que la calibracion GPTQ mantiene la precision cerca de los pesos completos y que el resultado esta optimizado para aceleradores SM120/GB202 (RTX Pro 6000, RTX 50-series, B200, B300). La cuantizacion se realizo con llama.cpp. Se incluye un fichero mmproj para las capacidades vision-lenguaje.

## Capacidades

- Generacion de texto y razonamiento explicito (modo reasoning), con cadenas de razonamiento mas concisas que el modelo base.
- Razonamiento matematico y cientifico (STEM) como dominio principal de entrenamiento.
- Soporte de tool calling y function calling (etiquetas tool-use y function-calling en la model card).
- Capacidades multimodales de imagen a texto mediante el fichero de proyeccion mmproj.
- Decodificacion especulativa nativa mediante Multi-Token Prediction (MTP).
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Respuestas concisas: la model card del autor fuente afirma que responde con una sola letra el 97,2% de las veces cuando se le pide ese formato.
- Compatible con text-generation-inference y llama.cpp segun las etiquetas del repositorio.

## Casos de uso

- Razonamiento matematico asistido: resolucion paso a paso de problemas de algebra, calculo y estadistica, aprovechando el entrenamiento sobre 250.000 muestras de matematicas y su tendencia a cadenas de razonamiento cortas, lo que reduce coste por consulta.
- Tutoria STEM: explicacion de conceptos de fisica y quimica con verificacion de resultados numericos, adecuado para plataformas educativas que necesitan respuestas trazables y concisas.
- Despliegue local en estaciones Blackwell: inferencia en RTX Pro 6000 o RTX 50-series aprovechando los tensor cores FP4, con un unico fichero GGUF de 8,46 GB que cabe en VRAM de consumo alto.
- Asistentes con function calling: integracion en agentes que invocan calculadoras, APIs de datos cientificos o herramientas externas, gracias al soporte declarado de tool use.
- Analisis de imagenes tecnicas: con el fichero mmproj cargado, el modelo puede procesar diagramas, graficos o capturas de problemas y razonar sobre ellos en texto.
- Servicio multilingue: atencion o documentacion tecnica en ingles, chino, coreano, japones, espanol y ruso desde un mismo checkpoint.
- Prototipado de pipelines de decodificacion especulativa: banco de pruebas para MTP en llama.cpp sin necesidad de gestionar un modelo borrador aparte.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor del modelo fuente y fueron medidos sobre otros checkpoints, no sobre esta build GPTQ. Se presentan tal cual, con esa salvedad.

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K | 94,50% | Media de cuatro ejecuciones sobre el checkpoint NVFP4 del autor fuente bajo vLLM |
| MMLU-Pro (muestra de 1.500 preguntas de matematicas, fisica y quimica) | 90,53% de media | 0,93 puntos por encima de Qwen3.5-9B; ejecutado con MTP-Q8_0 GGUF |
| Tokens de razonamiento por respuesta correcta | ~36% menos que Qwen3.5-9B | Segun la model card del autor fuente |
| Formato de respuesta de una sola letra | 97,2% de las veces | Afirmacion de la model card del autor fuente |

No se han publicado resultados de benchmarks medidos sobre esta build NVFP4-GPTQ en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 8,5-9 GB para el fichero principal NVFP4-GPTQ; anadir aproximadamente 1 GB si se carga la proyeccion multimodal (mmproj de 922 MB).
- GPU recomendadas: NVIDIA Blackwell con soporte de tensor cores FP4, es decir, RTX Pro 6000, serie RTX 50, B200 y B300 (SM120/GB202). Fuera de Blackwell la cuantizacion NVFP4 no aprovecha la aceleracion nativa y el rendimiento esperado es inferior.
- GPU de consumo: el tamano de pesos permite en principio cargarlo en GPU consumer con 12 GB o mas de VRAM, pero el beneficio de velocidad FP4 solo se obtiene en generaciones Blackwell.
- Despliegue: llama.cpp (herramienta con la que se genero la cuantizacion), text-generation-inference y transformers segun las etiquetas del repositorio. El autor documenta tambien ejecucion bajo vLLM para el checkpoint fuente.
- Latencia y throughput: no disponibles para esta build. El autor fuente atribuye mejoras de velocidad a MTP y a los tensor cores FP4, sin cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF (este) | 9,2B | no disponible | NVFP4 + GPTQ, GGUF | Apache 2.0 | Optimizado para Blackwell; MTP integrado; vision via mmproj |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (fuente) | 9,2B | no disponible | pesos completos | Apache 2.0 | Referencia de precision; benchmarks reportados sobre sus propios checkpoints |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | Base del ajuste fino; el modelo fuente le supera en 0,93 puntos en MMLU-Pro segun el autor |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento con otras alternativas de cuantizacion del mismo modelo.

## Limitaciones y advertencias

- Modelo experimental de comunidad: la propia model card del autor fuente advierte que las salidas deben verificarse antes de usarlas.
- Los benchmarks citados no se midieron sobre esta build GPTQ ni sobre pesos completos, sino sobre otros checkpoints (NVFP4 bajo vLLM y MTP-Q8_0 GGUF) y sobre muestras aleatorias, no sobre subconjuntos completos.
- Entrenado sin datos de codigo: no es adecuado como modelo principal para generacion de codigo.
- Riesgo de alucinacion en razonamiento matematico y cientifico: las cadenas de razonamiento cortas reducen el coste pero pueden omitir comprobaciones intermedias.
- El rendimiento de NVFP4 depende del hardware: en GPU no Blackwell la ventaja de velocidad desaparece y puede haber perdida adicional de precision frente a otras cuantizaciones.
- Cobertura linguistica limitada a seis idiomas; no se documenta el nivel de calidad por idioma.
- Longitud de contexto no documentada en la informacion disponible, lo que impide planificar cargas de contexto largo con garantias.
- Licencia Apache 2.0 permite uso comercial, pero la condicion experimental del modelo desaconseja su uso en produccion sin evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF
- Fichero GGUF principal: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF/blob/main/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ.gguf
- Proyeccion multimodal: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF/blob/main/DeepSeek-V4-Pro-Qwen3.5-9B.mmproj.gguf
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods

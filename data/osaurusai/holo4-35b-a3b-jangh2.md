# OsaurusAI/Holo4-35B-A3B-JANGH2

## Resumen

OsaurusAI/Holo4-35B-A3B-JANGH2 es una cuantizacion calibrada de 4 bits del modelo vision-lenguaje Hcompany/Holo4-35B-A3B, empaquetada en formato MLX para su ejecucion en Apple Silicon a traves del runtime Osaurus 1.0.13 o superior. El modelo original es un transformer de tipo mixture-of-experts (MoE) con arquitectura `qwen3_5_moe`, disenado para tareas de image-text-to-text: entrada conjunta de imagenes y texto con salida conversacional. Esta variante reduce el peso a 10,56 GB (9,835 GiB de shards) manteniendo la fidelidad respecto al BF16 original, lo que permite desplegar un modelo de vision-lenguaje de gran tamano en hardware de consumo de Apple.

La relevancia de esta ficha radica en que el repositorio no publica un modelo nuevo, sino una receta de cuantizacion con validacion numerica explicita: el autor documenta KL, acuerdo top-1, dNLL y bits por peso efectivos frente al modelo base fijado en una revision concreta. Es un ejemplo de cuantizacion "calibrada" con GPTQ de covarianza completa, codebook cubico impar y transformada de Hadamard-32, orientada a preservar el comportamiento en capturas de GUI, OCR, tablas, graficos y conversaciones con herramientas.

El modelo base declara licencia Apache-2.0 y el pipeline image-text-to-text. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), vision-lenguaje |
| Parametros totales | 4.939.650.416 (segun safetensors del repo); el nombre comercial indica 35B-A3B |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (JANGH2: GPTQ de covarianza completa con fallback RTN, Hadamard-32 y codebook cubico impar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 10,56 GB / 9,835 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con capacidades de vision-lenguaje, identificado en los tags como `qwen3_5_moe`. La variante JANGH2 no reentrena el modelo: aplica una cuantizacion post-entrenamiento calibrada sobre la revision `508458727831368da85d53a8055c2b0f923ed4f3` del modelo Hcompany/Holo4-35B-A3B. La calibracion usa 448 ejemplos compactos con enfasis en capturas reales de GUI, OCR y tablas, graficos, razonamiento activado y desactivado, 14 lenguajes de programacion y conversaciones de terminal y herramientas.

La innovacion tecnica esta en la receta de cuantizacion: GPTQ de covarianza completa con registro de fallback RTN por modulo, transformada de Hadamard-32 y un codebook cubico impar. El autor registra los metodos y errores por modulo en `quantization_report.json`. El modelo conserva el dialecto nativo de llamadas a herramientas en XML con parser `qwen3_coder`, un conmutador de razonamiento on/off sin selector de esfuerzo, y los valores de muestreo del `generation_config.json` original. No se habilitan tensores MTP ni drafter especulativo porque la fuente oficial no los publica.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (image-text-to-text): capturas de GUI, OCR, tablas y graficos.
- Localizacion de elementos en pantalla con convencion normalizada 0-1000 del modelo fuente.
- Razonamiento con conmutador on/off (thinking mode), sin selector de esfuerzo.
- Llamadas a funciones en dialecto XML nativo con parser `qwen3_coder`.
- Flujos agenticos y de terminal verificados por el autor en revision acotada.
- Soporte de 14 lenguajes de programacion en la calibracion (no implica capacidades de codigo completas).
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de interfaces graficas: el modelo puede localizar elementos en capturas de pantalla usando coordenadas normalizadas 0-1000, lo que permite construir agentes que pulsan botones o rellenan formularios en entornos de escritorio.
- Extraccion de datos de documentos: con soporte de OCR y tablas, es adecuado para digitalizar facturas, informes o capturas de paneles y devolver texto estructurado en conversacion.
- Asistente de terminal y agentes de linea de comandos: el dialecto XML de tool calling con parser `qwen3_coder` permite integrarlo en flujos donde el modelo invoca comandos y lee su salida.
- Analisis de graficos y dashboards: la calibracion incluye ejemplos de charts, por lo que puede describir tendencias o responder preguntas sobre imagenes de paneles.
- Prototipado local en Apple Silicon: al ocupar 10,56 GB en MLX, permite probar un modelo vision-lenguaje de gran tamano en un Mac sin GPU dedicada, ideal para desarrollo y demos.
- Agentes multi-paso con razonamiento controlado: el conmutador thinking on/off permite alternar entre respuestas rapidas y razonamiento extendido segun la etapa del flujo.
- Asistencia a programadores en 14 lenguajes: la calibracion cubre conversaciones de codigo, util para tareas de explicacion o generacion acotada en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion frente al BF16, que no son precision de tarea:

| Metrica de fidelidad | Valor |
|---|---|
| Casos retenidos / posiciones | 84 / 2502 |
| KL (BF16 a cuantizado) | 0,12324418 |
| Acuerdo top-1 con token fuente | 91,0871 % |
| dNLL | 0,12722731 |
| bpw efectivo del modelo completo | 2,4063 |

| Slice de evaluacion | Posiciones | KL | Acuerdo top-1 |
|---|---:|---:|---:|
| Vision | 843 | 0,25038 | 85,05 % |
| Thinking on | 1312 | 0,06060 | 94,21 % |
| Thinking off | 1190 | 0,19231 | 87,65 % |

Rendimiento medido: en un M5 Max, el primer turno de chart genero 73 tokens a 100,6 tokens/s de decodificacion. Es una unica solicitud medida.

## Requisitos de hardware

- VRAM/espacio: 10,56 GB de pesos (9,835 GiB de shards); el consumo en memoria unificada debe sumar overhead del runtime y del contexto.
- Hardware objetivo: Apple Silicon con runtime Osaurus 1.0.13 o superior; el formato es MLX, no compatible con CUDA de forma nativa.
- GPU dedicadas (A100, H100, RTX 4090): no aplica directamente, al ser un bundle MLX para Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (el autor reporta ejecucion en M5 Max).
- Opciones de despliegue: Osaurus 1.0.13+ (runtime oficial del bundle). No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 100,6 tokens/s de decodificacion en un M5 Max en una solicitud medida de 73 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OsaurusAI/Holo4-35B-A3B-JANGH2 | 4.939.650.416 (safetensors) | no disponible | Apache-2.0 | MLX safetensors 4-bit | Cuantizacion calibrada para Apple Silicon |
| Hcompany/Holo4-35B-A3B (base) | no disponible | no disponible | Apache-2.0 | safetensors BF16 | Modelo fuente vision-lenguaje |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- El autor declara la validacion como "revision nativa acotada completa, con limitaciones": no equivale a evaluacion de precision en tareas.
- Las peticiones de pixeles crudos o de formato, y la seleccion de herramientas, pueden fallar segun la revision del autor.
- La localizacion de GUI depende de la convencion normalizada 0-1000; desviarse de ella degrada el resultado.
- No hay tensores MTP ni drafter especulativo, por lo que no se acelera la decodificacion con tecnicas especulativas.
- El bundle es especifico de MLX y del runtime Osaurus; no es portable a otros stacks sin conversion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no declarados; el uso multilingue no esta garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y la receta de cuantizacion deben verificarse en `LICENSE` y `SOURCE_MODEL_CARD.md`.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/Holo4-35B-A3B-JANGH2
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B/tree/508458727831368da85d53a8055c2b0f923ed4f3
- Runtime Osaurus: https://osaurus.ai
- Documentacion de localizacion de elementos: https://hub.hcompany.ai/models-api/element-localization

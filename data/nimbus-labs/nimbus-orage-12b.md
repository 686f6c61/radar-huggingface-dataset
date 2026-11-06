# Nimbus-Labs/Nimbus-Orage-12B

## Resumen

Nimbus Orage 12B es un ajuste fino (fine-tune) del checkpoint Gemma 4 12B IT QAT de Google, desarrollado por Nimbus Labs y orientado especificamente a la asistencia en programacion local. Se distribuye exclusivamente como un archivo GGUF cuantizado en Q5_K_M, pensado para ejecutarse con llama.cpp en hardware de consumo. El modelo parte de la version cuantizada con reconocimiento de cuantizacion (QAT) de Gemma 4 12B IT, sobre la que Nimbus Labs aplico un adaptador, lo fusiono y reexporto el resultado.

La relevancia del modelo radica en su enfoque practico: es un asistente de codigo que cabe en un solo archivo de 8,5 GB y puede desplegarse en local sin infraestructura de servidor. El autor reporta un Pass@1 del 93,9% en HumanEval y del 90,9% en HumanEval+ en modo directo (sin thinking). No obstante, el propio autor advierte que estos resultados no demuestran capacidad de programacion a nivel de repositorio, fiabilidad en el uso de herramientas ni mejora respecto al checkpoint original de Gemma.

Se trata de una build temprana (la anterior a Nimbus v3 12B) y publicada bajo licencia Apache 2.0. La model card es notablemente honesta sobre el alcance de la evaluacion y los riesgos de ejecutar codigo generado sin validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B IT QAT); detalles internos no disponibles |
| Parametros totales | 11.907.350.576 (11,9 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la generacion de evaluacion uso un limite de 16.384 tokens de completado) |
| Tipos de cuantizacion | Q5_K_M (unico artefacto publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (8.547.267.520 bytes) |

## Arquitectura y entrenamiento

El modelo se construye sobre el checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`, una version de Gemma 4 12B instructiva entrenada con cuantizacion consciente (QAT) para preservar calidad tras la compresion. Nimbus Labs realizo un ajuste fino sobre dicho checkpoint, fusiono el adaptador resultante, exporto el modelo a GGUF y lo cuantizo a Q5_K_M. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovacion principal es el flujo de trabajo: partir de un checkpoint QAT y re-cuantizar a Q5_K_M para conservar el rendimiento del modelo original en un formato ejecutable en local. El artefacto publicado es exclusivamente de texto; no se mencionan capacidades multimodales en la distribucion GGUF. El autor indica que debe usarse un runtime de llama.cpp compatible con Gemma 4 y desactivar el modo thinking para reproducir el comportamiento evaluado en modo directo.

## Capacidades

- Generacion de codigo en modo directo (sin razonamiento encadenado), evaluada sobre las 164 tareas de HumanEval.
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Asistencia de programacion local mediante llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling ni uso de agentes.
- No se documentan capacidades multilingues especificas.
- No se documentan modos de vision ni audio en la distribucion GGUF publicada.
- El modo thinking existe en el modelo base, pero el autor recomienda desactivarlo para el comportamiento evaluado.

## Casos de uso

- Autocompletado y generacion de funciones en el editor: el modelo puede integrarse via llama.cpp en extensiones de IDE para sugerir implementaciones de funciones a partir de docstrings, aprovechando su Pass@1 del 93,9% en HumanEval en modo directo.
- Asistente de codigo en local sin conexion: al distribuirse como un unico GGUF de 8,5 GB, permite trabajar en entornos aislados o con requisitos de privacidad donde no se puede enviar codigo a la nube.
- Generacion de tests unitarios: puede producir casos de prueba a partir de firmas de funciones, aunque el autor advierte que el codigo generado debe validarse antes de ejecutarse.
- Prototipado rapido de scripts: util para generar esqueletos de scripts de automatizacion o utilidades de linea de comandos en fases tempranas de desarrollo.
- Traduccion entre lenguajes de programacion: tareas de conversion de fragmentos de codigo entre lenguajes, sujetas a revision manual.
- Educacion y aprendizaje: explicacion y generacion de ejemplos de codigo en entornos docentes con hardware de consumo, sin depender de APIs externas.
- Base para ajustes finos posteriores: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

Evaluacion en modo directo (thinking desactivado, temperatura 0, llama.cpp b10007, limite de 16.384 tokens de completado, una respuesta por tarea):

| Benchmark | Aciertos | Pass@1 |
|---|---:|---:|
| HumanEval | 154 / 164 | 93,9% |
| HumanEval+ | 149 / 164 | 90,9% |

El autor precisa que estos resultados no establecen capacidad de programacion a nivel de repositorio, fiabilidad de herramientas ni mejora sobre el checkpoint original de Gemma. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 8,5 GB; el runtime y la cache de contexto requieren memoria adicional (el autor no cuantifica el total, pero en la practica se recomienda reservar entre 10 y 12 GB para contexto moderado).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: si, siempre que se disponga de al menos 12 GB de VRAM para el modelo mas la cache de contexto.
- Opciones de despliegue: llama.cpp (runtime compatible con Gemma 4, version b10007 usada en la evaluacion); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato |
|---|---:|---|---:|---|---|
| Nimbus Orage 12B | 11,9 B | No disponible | 93,9% (Pass@1) | Apache 2.0 | GGUF Q5_K_M |
| Gemma 4 12B IT QAT (base) | 12 B aprox. | No disponible | No disponible | No disponible | Safetensors / GGUF |
| Alternativas de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. El propio autor senala que no se ha demostrado mejora sobre el checkpoint original de Gemma.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo puede producir codigo incorrecto o inseguro incluso cuando respeta el formato solicitado; es obligatorio validar el codigo antes de ejecutarlo.
- Los resultados de HumanEval no demuestran capacidad de programacion a nivel de repositorio ni fiabilidad en el uso de herramientas.
- No se ha demostrado mejora respecto al checkpoint original de Gemma 4 12B IT QAT.
- No se documentan sesgos conocidos, pero al derivar de un modelo de proposito general es probable que herede los del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; la evaluacion se limita a tareas de codigo en el formato estandar de HumanEval.
- Longitud de contexto no documentada; la evaluacion uso un limite de 16.384 tokens de completado, que no equivale a la ventana de contexto del modelo.
- Es una build temprana (no es Nimbus v3 12B); puede estar superada por versiones posteriores del mismo autor.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse `LICENSE` y `THIRD_PARTY_NOTICES.md` para obligaciones de atribucion y redistribucion.
- El artefacto publicado es solo de texto; no incluye capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nimbus-Labs/Nimbus-Orage-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized/tree/a89c069a80c767b0d378c4806b2953ae9d2c711d
- Verificacion de integridad (SHA256SUMS): https://huggingface.co/Nimbus-Labs/Nimbus-Orage-12B/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/Nimbus-Labs/Nimbus-Orage-12B/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/Nimbus-Labs/Nimbus-Orage-12B/blob/main/THIRD_PARTY_NOTICES.md

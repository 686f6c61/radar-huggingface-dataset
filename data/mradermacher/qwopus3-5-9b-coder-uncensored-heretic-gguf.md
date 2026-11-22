# mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF

## Resumen

Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF es la distribucion en formato GGUF del modelo xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic, un modelo de lenguaje de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y especializado en generacion de codigo, razonamiento con cadena de pensamiento (chain-of-thought), uso de herramientas (tool calling) y comportamiento de agente. La cuantizacion la realiza mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y entornos de inferencia local.

El modelo base ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, decensored y abliterated), lo que implica la eliminacion o atenuacion de los mecanismos de rechazo alineados del modelo original. Ademas, se ha afinado con LoRA y SFT sobre conjuntos de datos de trazas de razonamiento de agentes (lambda/hermes-agent-reasoning-traces) y trazas de inversion de Claude Opus 4.6 y 4.7 (Jackrong/Claude-opus-4.6-TraceInversion-9000x y Jackrong/Claude-opus-4.7-TraceInversion-5000x), lo que sugiere un entrenamiento orientado a reproducir razonamientos complejos de tipo agente.

Este repositorio concreto no contiene los pesos originales en safetensors, sino las versiones cuantizadas estaticas en GGUF (desde Q2_K hasta f16, incluyendo variantes IQ), lo que facilita su despliegue en hardware de consumo. La licencia declarada es Apache 2.0. Es relevante para desarrolladores que necesitan un modelo de codigo y agentes ejecutable localmente, sin restricciones de contenido, aunque con las advertencias de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); existen cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. El tag `qwen3_5` indica que el modelo base pertenece a la familia Qwen3.5, lo que sugiere una arquitectura transformer decoder-only, pero no se confirma el tipo exacto (atencion completa, atencion lineal, hibrida, etc.) ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento del modelo base combina varias fases: un ajuste LoRA y SFT sobre el modelo xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic, utilizando los datasets lambda/hermes-agent-reasoning-traces, Jackrong/Claude-opus-4.6-TraceInversion-9000x y Jackrong/Claude-opus-4.7-TraceInversion-5000x. Estos datasets contienen trazas de razonamiento de agentes y trazas de inversion de razonamiento de modelos Claude Opus, lo que sugiere un enfasis en cadena de pensamiento, uso de herramientas y resolucion multi-paso. Ademas, el modelo ha pasado por un proceso de abliteration/decensoring que elimina las capas de rechazo, aunque no se detalla la tecnica exacta empleada. No se indica el volumen total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento explicita (tag `reasoning`, `chain-of-thought`).
- Generacion y asistencia en codigo (tag `coder`), presumiblemente en multiples lenguajes de programacion.
- Uso de herramientas y llamada a funciones (tags `tool-use`, `function-calling`, `agent`).
- Comportamiento de agente y razonamiento multi-paso, derivado del entrenamiento sobre trazas de agentes.
- Capacidades multilingues limitadas a los idiomas declarados: ingles, chino, espanol, ruso y japones.
- Comportamiento "uncensored" o "abliterated": el modelo no aplica los filtros de rechazo tipicos de los modelos alineados.
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica capacidad de procesamiento de vision, aunque no se detalla en la model card.
- Compatibilidad con text-generation-inference y transformers (tags de libreria).

## Casos de uso

- Asistente de programacion local: el modelo puede generar, revisar y explicar codigo en un entorno sin conexion, gracias a su especializacion `coder` y a su formato GGUF ejecutable con llama.cpp u Ollama. Es adecuado para equipos que no pueden enviar codigo a APIs externas.
- Automatizacion de agentes con tool calling: al soportar function calling y haber sido entrenado sobre trazas de agentes, puede integrarse en pipelines que requieran invocar APIs, consultar bases de datos o ejecutar comandos de forma autonoma.
- Razonamiento multi-paso en entornos de investigacion: su entrenamiento sobre trazas de inversion de Claude Opus permite abordar problemas que requieren descomposicion y verificacion, util para prototipos de agentes de investigacion.
- Generacion de documentacion tecnica y explicaciones de codigo: puede producir explicaciones detalladas y cadenas de razonamiento sobre fragmentos de codigo, util para herramientas de documentacion automatica.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM, lo que facilita prototipado rapido en estaciones de trabajo.
- Procesamiento multimodal ligero: con los ficheros mmproj, puede emplearse para tareas que combinen texto e imagen, como descripcion de capturas o extraccion de informacion de diagramas, siempre que se valide su calidad real.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos abliterated, este repositorio ofrece una version cuantizada lista para usar en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q3_K_M ~4,8 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_S ~6,6 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Los ficheros mmproj anaden 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB son suficientes; para Q8_0 se recomienda una RTX 4090 de 24 GB o una A100 de 40 GB; para f16 se necesita una A100 40 GB, H100 o similar.
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones. Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 no es viable en consumer.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag declarado), y cualquier runtime compatible con GGUF. El repositorio tambien incluye cuantizaciones imatrix en el repositorio i1-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Se puede senalar que, por tamano y categoria, este modelo se situa en la franja de 9 B orientada a codigo y agentes, comparable a otras variantes de Qwen3.5 de ~9 B y a modelos de codigo de 7-14 B, pero no se dispone de datos objetivos para establecer una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha eliminado o atenuado el rechazo alineado, por lo que puede generar contenido danino, ilegal o sesgado. No es apto para produccion sin filtros externos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, APIs o referencias; el riesgo puede ser mayor en el modo de razonamiento extendido si no se valida.
- Idiomas limitados a en, zh, es, ru y ja; el rendimiento en espanol no esta verificado con benchmarks.
- No se dispone de informacion sobre la longitud de contexto nativa, lo que impide garantizar conversaciones de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el proceso de abliteration puede implicar riesgos legales y reputacionales si se despliega sin moderacion.
- El repositorio contiene solo cuantizaciones GGUF; no incluye los pesos originales en safetensors, lo que limita el reentrenamiento directo.
- El tag `region:us` y la fecha de creacion (2026-11-18) sugieren un modelo reciente; no hay historial de validacion independiente.
- El modelo base declara soporte multimodal mediante mmproj, pero no se detalla la calidad ni el alcance de dicha capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

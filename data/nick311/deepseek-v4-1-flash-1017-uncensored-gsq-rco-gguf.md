# nick311/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantizacion GGUF derivada de DeepSeek-V4.1-Flash-1017, un modelo MoE de gran escala (763B parametros declarados en la model card, 384 expertos, 551.880.949.208 parametros segun los pesos safetensors del repo) desarrollado originalmente por DeepSeek. El trabajo de cuantizacion y edicion lo firma nick311 sobre la base de las shards GSQ-RCO de ISTA-DASLab, con el respaldo de la herramienta Strata (AtomicChat). El objetivo declarado es eliminar la direccion de rechazo (refusal direction) proyectandola fuera de los tensores densos que escriben en el residual, sin tocar los expertos enrutados, de modo que el modelo deja de rechazar peticiones manteniendo la precision en tareas.

La relevancia tecnica del artefacto no esta en el modelo base, sino en el metodo: una edicion de abliteracion de una sola direccion (strength 2.0) aplicada a `attn_output_b`, `ffn_down_shexp` y `engram_wkv`, con los 384 expertos GSQ intactos byte a byte. Los autores reportan que el KL respecto al quant original es de aproximadamente 0.02 y que MMLU-500 se mantiene dentro de ~1 punto, lo que sugiere que la edicion no degrada la capacidad de razonamiento.

La innovacion de despliegue es el uso de una tabla Engram de 110 GB que se transmite desde SSD, mientras el backbone reside en memoria del sistema; esto permite ejecutar un modelo de 763B en una unica GPU de 12 GB. El formato es GGUF y la licencia declarada es MIT, aunque conviene leer con cuidado las implicaciones de una edicion que elimina rechazos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con 384 expertos enrutados, expertos compartidos y tabla Engram (arquitectura DeepSeek-V4.1-Flash-1017) |
| Parametros totales | 551.880.949.208 (pesos safetensors del repo); la model card declara 763B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ2_XXS (2.0 bpw, 249 GB), IQ2_XS (2.25 bpw, 266 GB), IQ1_M (1.75 bpw, 231 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards multi-parte) + fichero Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados, expertos compartidos y un mecanismo Engram que actua como tabla de consulta masiva (110 GB) separada del backbone. La cuantizacion GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precision aprendido sobre los expertos enrutados; esta version preserva esos expertos sin modificacion y solo sustituye los tensores densos que escriben en el residual: la salida de atencion (`attn_output_b`), la proyeccion down del experto compartido (`ffn_down_shexp`) y la proyeccion de valor Engram (`engram_wkv`).

Sobre esos tres tensores se aplica una edicion de abliteracion de una unica direccion con fuerza 2.0, calculada a partir de la direccion de rechazo de DeepSeek y proyectada fuera de los pesos a precision completa antes de cuantizar al tipo exacto por tensor de ISTA. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion destacable es el esquema de despliegue con Strata: backbone en RAM del sistema y tabla Engram en streaming desde SSD, lo que reduce el requisito de VRAM a 12 GB.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking configurable (la model card cita "reasoning effort 50" y "Thinking high (30)").
- Razonamiento matematico y cientifico de nivel alto: los autores reportan GPQA-Diamond 83.3% y AIME25 76.7-80.0% en el quant editado.
- Conocimiento general medido con MMLU-500 en torno a 80.6-82.8% segun el rung.
- Eliminacion de rechazos: JailbreakBench en ingles baja de 85-89% a 0.0% en los tres rungs publicados.
- Preservacion de rechazos seguros: XSTest (safe refused) pasa de 4-7.6% a 0.0-0.4%.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking sugiere capacidad de cadena de razonamiento.
- Capacidades multilingues: no disponibles; las metricas de seguridad se midieron solo en ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el artefacto permite comparar el comportamiento del modelo con y sin la direccion de rechazo proyectada, con metricas de KL (~0.02) y MMLU-500 publicadas para validar que la edicion no degrada la tarea.
- Evaluacion de robustez de clasificadores de rechazo: util para probar si los filtros de seguridad externos detectan respuestas que el modelo ya no rechaza internamente, dado que el clasificador del autor solo lee el inicio de la respuesta.
- Razonamiento cientifico offline en hardware de consumo: con un rung IQ2_XXS (249 GB) y una GPU de 12 GB mas SSD rapido, se puede ejecutar un modelo de 763B para consultas de GPQA-Diamond sin conexion.
- Generacion de codigo y matematicas en entornos air-gapped: el modelo mantiene AIME25 en torno al 80% tras la edicion, lo que lo hace util para asistencia tecnica en maquinas sin acceso a APIs externas.
- Despliegue local con Strata en estaciones de trabajo: el esquema backbone en RAM + Engram en streaming permite servir el modelo en un equipo con 12 GB de VRAM y suficiente RAM y almacenamiento SSD, sin necesidad de cluster.
- Estudio de cuantizacion de baja precision: los tres rungs (IQ1_M, IQ2_XXS, IQ2_XS) permiten analizar el compromiso entre bpw, tamano en disco y calidad (MMLU, GPQA, AIME) en un modelo MoE de gran escala.
- Analisis de sesgos y contenido: al eliminar rechazos de forma transversal, sirve para auditar que tipo de contenido genera el modelo sin las capas de negativa, siempre en un entorno controlado y con supervision.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando el quant GSQ-RCO original con esta version editada.

| Benchmark | Stock GSQ-RCO | Uncensored (esta version) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83.3% | 83.3% |
| AIME25 (30 preguntas) | 76.7% | 80.0% |

Metricas de seguridad y calidad por rung (original → editado):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL vs stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2.0 | 249 | 85.2% → 0.0% | 7.6% → 0.0% | 27/30 → 0/30 | 82.8% (p=0.27) | 0.0225 |
| IQ2_XS | 2.25 | 266 | 86.4% → 0.0% | 4.0% → 0.4% | 27/30 → 2/30 | 81.6% (p=1.00) | 0.0272 |
| IQ1_M | 1.75 | 231 | 88.9% → 0.0% | 4.8% → 0.0% | 27/30 → 1/30 | 80.6% (p=0.75) | 0.0207 |

El KL se calcula con el modo teacher-forced de Strata sobre una cota inferior top-64, por lo que el valor real es algo superior. No se han publicado resultados de MMLU, HumanEval o GSM8K del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de GPU segun el autor, gracias al esquema de Strata (backbone en RAM del sistema y tabla Engram en streaming desde SSD).
- RAM del sistema: no especificada; el backbone debe residir en memoria, por lo que se requiere una cantidad considerable no detallada en la model card.
- Almacenamiento: el fichero Engram de 110 GB debe estar en un SSD rapido junto a las shards; el rung IQ2_XXS ocupa 249 GB, el IQ2_XS 266 GB y el IQ1_M 231 GB.
- GPU recomendadas: no disponibles de forma explicita; el autor solo garantiza funcionamiento en una unica GPU de 12 GB con Strata.
- Cabe en GPU de consumo: si, segun el autor, en una GPU de 12 GB con Strata y SSD rapido.
- Opciones de despliegue: Strata (unico runtime soportado actualmente). El autor indica que DeepSeek-V4.1 con fichero Engram separado no esta todavia en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (nick311, uncensored GSQ-RCO) | 551.9B (safetensors) / 763B declarados | no disponible | MIT | GGUF + Engram | Abliterado, requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 763B declarados | no disponible | no disponible | GGUF + Engram | Base sin editar; MMLU, GPQA y AIME de referencia |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 763B declarados | no disponible | no disponible | GGUF | Misma edicion de abliteracion, sin cuantizacion GSQ-RCO |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B declarados | no disponible | no disponible | safetensors | Modelo original de DeepSeek |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, salvo los del stock GSQ-RCO que aparecen en la tabla de benchmarks.

## Limitaciones y advertencias

- El clasificador de rechazo del autor solo lee el inicio de la respuesta; una negativa suave mas adelante en el texto puede pasar como respuesta valida.
- La edicion elimina rechazos de forma transversal: no conserva un subconjunto mas estrecho de negativas de seguridad.
- Con thinking activado, la model card advierte que la edicion planifica una respuesta a una peticion (texto truncado en la informacion disponible), lo que puede producir razonamientos internos no filtrados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo base no aporta datos al respecto.
- Idiomas: las metricas de seguridad y calidad se midieron solo en ingles; no hay datos de comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia declarada es MIT, pero el uso comercial de un modelo abliterado puede contravenir politicas de proveedores cloud, plataformas de distribucion o legislacion local sobre contenido danino; conviene revisar el marco legal aplicable antes de desplegarlo en produccion.
- Dependencia de runtime: requiere Strata; no funciona en llama.cpp ni, presumiblemente, en vLLM, Ollama o TGI con el fichero Engram separado.
- Requisitos de almacenamiento elevados: 231-266 GB por rung mas 110 GB de Engram, con necesidad de SSD rapido para el streaming.
- Repositorio sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que limita la validacion independiente de las metricas publicadas.
- El numero de parametros declarado en la model card (763B) no coincide con el de los pesos safetensors del repo (551.9B); conviene verificar cual corresponde al modelo servido.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/nick311/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Dataset de metricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Repositorio de Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq

# Markie77/markie-ai

## Resumen

markie-ai es un modelo de lenguaje multimodal (vision-lenguaje) publicado por el usuario Markie77 en Hugging Face. Segun los metadatos del repositorio y los nombres de los ficheros incluidos, se trata de una conversion a formato GGUF de un modelo de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parametros (772.845.888 parametros reales en safetensors). La conversion se ha realizado con Unsloth y esta pensada para su uso con llama.cpp.

El modelo se distribuye en tres ficheros: una version BF16, una cuantizacion Q4_K_M y un proyector multimodal (mmproj) en F16, lo que confirma que incorpora capacidades de vision ademas de generacion de texto. El tag `qwen3_5` y los nombres de fichero (`Qwen3.5-0.8B.*`) indican que deriva de un modelo base Qwen3.5 de 0,8B, aunque el autor no documenta el proceso de ajuste ni el dataset empleado.

La relevancia de esta ficha es limitada: el repositorio no incluye model card descriptiva, no declara licencia, no especifica idiomas soportados ni publica benchmarks. Se trata de un artefacto de conversion reciente (creado y actualizado el 27 de noviembre de 2026) sin descargas ni interacciones registradas, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5, segun tags y nombres de fichero) |
| Parametros totales | 772.845.888 (aproximadamente 0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16 (proyector multimodal), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de la conversion) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de lo que sugieren los metadatos: el tag `qwen3_5` y los nombres de fichero `Qwen3.5-0.8B.*` apuntan a que se trata de una conversion de un modelo Qwen3.5 de 0,8B, presumiblemente un transformer denso con modulo de vision (dado el fichero `F16-mmproj.gguf` y el tag `vision-language-model`). El autor no detalla si el modelo base es denso o MoE, ni el numero de capas, dimensiones ocultas o mecanismo de atencion.

Tampoco se documenta el proceso de entrenamiento: no hay informacion sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion tecnica verificable es que la conversion a GGUF se realizo con Unsloth y que el resultado es compatible con llama.cpp, incluyendo soporte multimodal a traves de `llama-mtmd-cli`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el uso documentado con `llama-cli --jinja` indican soporte de plantillas de chat.
- Comprension de imagenes: la presencia del proyector multimodal (`Qwen3.5-0.8B.F16-mmproj.gguf`) y el tag `vision-language-model` confirman capacidades de vision-lenguaje, invocables con `llama-mtmd-cli`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de endpoints de Hugging Face.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: con 0,8B de parametros y una cuantizacion Q4_K_M, el modelo puede ejecutarse en equipos de gama media para validar flujos de chat antes de migrar a modelos mayores.
- Descripcion de imagenes en pipelines ligeros: gracias al proyector multimodal, puede integrarse con `llama-mtmd-cli` para generar descripciones o etiquetas de imagenes en entornos con recursos limitados.
- Educacion y experimentacion con modelos VLM: su tamano reducido y formato GGUF lo hacen adecuado para laboratorios docentes donde se quiera estudiar el funcionamiento de un modelo vision-lenguaje sin infraestructura dedicada.
- Procesamiento de documentos con capturas o diagramas: combinando texto e imagen en una sola consulta, puede extraer informacion basica de figuras o pantallazos en herramientas internas.
- Pruebas de integracion con llama.cpp: sirve como banco de pruebas para validar pipelines de inferencia basados en llama.cpp y plantillas Jinja (`--jinja`) antes de desplegar modelos de mayor tamano.
- Asistente offline en dispositivos con poca VRAM: la version Q4_K_M permite ejecucion en CPU o GPU de consumo, util para aplicaciones de escritorio o entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M de un modelo de 0,8B ocupa del orden de 0,5-0,7 GB en pesos, mas el proyector multimodal F16 y el overhead de contexto; cabe holgadamente en GPUs con 4 GB o mas.
- La version BF16 requiere aproximadamente 1,6 GB solo en pesos, mas overhead.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y por extension cualquier frontend compatible como Ollama o LM Studio; el tag `endpoints_compatible` sugiere despliegue via endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| markie-ai (este modelo) | 0,8B | no disponible | no disponible | GGUF | Conversion Unsloth de Qwen3.5-0.8B con vision |
| Qwen2.5-VL-3B | 3B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (comunitario) | VLM de referencia de la familia Qwen, mayor tamano |
| SmolVLM-500M | 0,5B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | VLM ligero para entornos con recursos muy limitados |
| LLaVA-1.5-7B | 7B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | VLM clasico, requiere mas VRAM |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado ni de especificaciones verificadas de los alternativas en la informacion proporcionada, por lo que la seleccion debe basarse en pruebas propias.

## Limitaciones y advertencias

- Ausencia total de model card: no se documenta el proceso de entrenamiento, los datos utilizados ni las capacidades reales, lo que impide evaluar sesgos y calidad.
- Licencia no declarada: no es posible determinar si se permite uso comercial; debe consultarse al autor o al modelo base Qwen3.5 antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real; no asumir un buen rendimiento en castellano sin validacion previa.
- Riesgo de alucinacion: como cualquier modelo de 0,8B, la precision factua es limitada y puede generar contenido incorrecto con aparente seguridad.
- Contexto desconocido: al no documentarse la longitud de contexto, no deben asumirse ventanas largas en conversaciones multi-turno.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Posibles sesgos heredados: al derivar de un modelo base no identificado con certeza, podria arrastrar sesgos de sus datos de entrenamiento, no auditados en esta conversion.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la integridad y procedencia de los ficheros antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Markie77/markie-ai
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible): https://github.com/ggml-org/llama.cpp

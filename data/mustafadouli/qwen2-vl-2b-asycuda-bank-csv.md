# mustafadouli/qwen2-vl-2b-asycuda-bank-csv

## Resumen

El modelo `mustafadouli/qwen2-vl-2b-asycuda-bank-csv` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario mustafadouli. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits del Qwen2-VL-2B-Instruct de Alibaba. El nombre del repositorio sugiere un entrenamiento orientado a la extraccion o generacion de datos tabulares de tipo CSV en el dominio bancario (por las siglas "bank-csv"), aunque la model card no documenta explicitamente la tarea ni el dataset empleado.

El modelo hereda la arquitectura multimodal de Qwen2-VL, un transformer decoder-only con vision encoder integrado, disenado para procesar imagenes y texto de forma conjunta. El adaptador se ha entrenado con las librerias Unsloth y TRL, segun los tags del repositorio, lo que indica un flujo de entrenamiento optimizado para bajo consumo de memoria. El repositorio ocupa 0,2 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 2.000 millones de parametros.

La relevancia de esta ficha es limitada pero practica: sirve como ejemplo de adaptacion de un modelo vision-lenguaje pequeno a una tarea vertical concreta (extraccion estructurada de informacion bancaria en formato CSV) mediante PEFT. No obstante, la ausencia de documentacion, licencia, idiomas y evaluacion hace que no sea apto para produccion sin una validacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen2-VL) con adaptador LoRA |
| Parametros totales | 2.000 millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2-VL-2B-Instruct soporta contexto nativo de 32.768 tokens, ampliable, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base referenciado esta cuantizado en 4 bits (bnb-4bit). Otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2, compatible con Transformers y TRL |
| Modelo base | unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un modelo multimodal de la familia Qwen2-VL que combina un vision transformer (ViT) con un decoder de lenguaje autorregresivo. Qwen2-VL incorpora atencion con escalado dinamico de resolucion para imagenes (naive dynamic resolution) y un mecanismo de posicionamiento multimodal (M-RoPE) que permite manejar secuencias largas de texto e imagen de forma conjunta. El modelo base de 2.000 millones de parametros esta pensado para despliegue en entornos con recursos limitados.

El entrenamiento del adaptador se realizo mediante SFT (supervised fine-tuning) con LoRA, segun los tags `lora`, `sft`, `trl` y `unsloth`. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni los hiperparametros exactos (rango de LoRA, alpha, learning rate, epocas). Tampoco se documenta si el entrenamiento incluyo datos multimodales (imagenes de documentos bancarios) o solo texto en formato CSV. La unica referencia tecnica explicita es la version de PEFT (0.21.2) y el uso de Unsloth, que habitualmente implica entrenamiento en precision reducida (bf16 o 4-bit) con optimizaciones de memoria.

## Capacidades

- Generacion de texto conversacional en el pipeline `text-generation`, heredada del modelo base Qwen2-VL-2B-Instruct.
- Procesamiento multimodal de imagenes y texto (capacidad del modelo base), potencialmente orientada a la lectura de documentos o tablas.
- Generacion de salidas estructuradas en formato CSV, segun sugiere el nombre del repositorio, aunque no esta documentado ni validado.
- Soporte de conversacion multi-turno (capacidad del modelo base Instruct).
- Capacidad de tool calling / function calling: no confirmada en esta ficha; el modelo base Qwen2-VL-Instruct soporta function calling, pero no se verifica en el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la model card.
- Capacidades especiales (thinking mode, audio, vision): vision heredada del modelo base; thinking mode y audio no disponibles.

## Casos de uso

- Extraccion de datos estructurados de documentos bancarios: el adaptador podria recibir imagenes o texto de extractos, facturas o tablas y devolver filas en formato CSV. Es adecuado por su entrenamiento aparentemente orientado a "bank-csv", aunque requiere validacion con datos reales.
- Conversion de tablas en imagenes a CSV: gracias al vision encoder del modelo base, el adaptador podria transcribir tablas escaneadas a texto delimitado por comas, util para digitalizar archivos historicos de entidades financieras.
- Normalizacion de transacciones: dado un lote de movimientos bancarios en texto libre, el modelo podria reescribirlos en un esquema CSV fijo (fecha, concepto, importe, saldo), facilitando su carga en un ERP o base de datos.
- Preprocesamiento en pipelines de analitica: integrado como paso previo a un ETL, el modelo podria transformar respuestas de APIs o correos en CSV listos para ingesta, reduciendo reglas manuales.
- Asistente interno para empleados de banca: con contexto multi-turno, el modelo podria responder consultas sobre movimientos y devolver resumenes tabulares, siempre con supervision humana.
- Prototipado rapido de tareas de extraccion: al ser un adaptador LoRA de 0,2 GB, se puede cargar junto al modelo base en una GPU consumer para experimentar con prompts y esquemas CSV antes de escalar a un modelo mayor.
- Generacion de datasets sinteticos de prueba: el modelo podria producir filas CSV plausibles para probar validadores, parsers o dashboards en entornos de desarrollo sin datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base cuantizado en 4 bits ocupa aproximadamente 1,5-2 GB de pesos; con el adaptador LoRA y overhead de activaciones, se estiman entre 3 y 6 GB de VRAM para contexto corto, y mas para contexto largo o procesamiento de imagenes de alta resolucion (cifra no confirmada en la informacion proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para cargas concurrentes. Cabe en GPUs consumer de gama media con 8 GB o mas, siempre que se use cuantizacion 4-bit.
- Despliegue: compatible con Transformers + PEFT; el modelo base puede servirse con vLLM (soporte Qwen2-VL), llama.cpp/Ollama (si se convierte a GGUF, no disponible en el repo) y TGI (soporte variable para modelos multimodales). El adaptador requiere cargarse junto al modelo base.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 2B en 4 bits, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|
| mustafadouli/qwen2-vl-2b-asycuda-bank-csv | 2B (base) + LoRA | no disponible | Si (heredado) | no disponible | HuggingFace, 0 descargas |
| Qwen2-VL-2B-Instruct (Alibaba) | 2B | 32.768 tokens (nativo) | Si | Apache 2.0 (segun el modelo base original) | HuggingFace, ampliamente usado |
| SmolVLM-2B (HuggingFace) | 2B | no disponible en esta ficha | Si | Apache 2.0 | HuggingFace |
| PaliGemma-3B (Google) | 3B | no disponible en esta ficha | Si | Gemma license | HuggingFace |

La comparativa se limita a caracteristicas generales; no hay datos de rendimiento del adaptador para comparar tareas de extraccion CSV. El adaptador no aporta mejoras verificables frente al modelo base sin una evaluacion publicada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no documenta dataset, hiperparametros, evaluacion ni uso previsto, lo que impide reproducir el entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; el modelo base original de Qwen2-VL suele publicarse bajo Apache 2.0, pero debe verificarse.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion alto en tareas de extraccion estructurada: un modelo de 2B puede inventar filas, columnas o valores en CSV, especialmente con documentos densos o imagenes de baja calidad.
- Posible sobreajuste al dominio "bank-csv": el adaptador podria degradar el rendimiento general del modelo base en conversacion abierta.
- Sin benchmarks ni validacion externa: no se recomienda su uso en produccion sin una evaluacion propia con datos representativos.
- Dependencia del modelo base cuantizado en 4 bits: la cuantizacion bnb-4bit puede introducir perdida de precision adicional.
- Repositorio con 0 descargas y 0 likes: sin senales de adopcion ni mantenimiento por parte de la comunidad.
- Fecha de creacion futura (2026-11-06) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/mustafadouli/qwen2-vl-2b-asycuda-bank-csv
- Modelo base: https://huggingface.co/unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Paper de Qwen2-VL: https://arxiv.org/abs/2409.12191
- Repositorio Qwen2-VL: https://github.com/QwenLM/Qwen2-VL
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700

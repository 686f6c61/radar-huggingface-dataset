# micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseekv3_2_qwen2_5-1_5b_lr1e-4

## Resumen

`micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseekv3_2_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre datos sinteticos generados por varios modelos "profesor" (identificados en el nombre del run: gpt-oss-20b, QwQ y DeepSeek-V3.2), cubriendo tres dominios: seguimiento de instrucciones y chat, ciencia y codigo.

El objetivo declarado es destilar capacidades de modelos de mayor tamano en un modelo compacto de 1.540 millones de parametros, manteniendo la arquitectura Qwen2 original. Se trata de un fine-tune completo (no LoRA) durante 3 epocas con learning rate 1e-4 y batch global de 64.

Es relevante como ejemplo de pipeline de destilacion sintetica multietapa, pero conviene tratarlo con cautela: el repositorio no incluye informacion sobre licencia, idiomas, evaluacion ni detalles del dataset, y presenta cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precision original; no se publican GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, sin mecanismos MoE ni hibridos. Al ser un fine-tune completo, todos los parametros se actualizan; no hay cambios arquitectonicos declarados respecto al modelo base.

El entrenamiento consistio en SFT sobre una mezcla sintetica multdominio generada por modelos profesor: instrucciones/chat (gpt-oss-20b), ciencia (QwQ) y codigo (DeepSeek-V3.2). Se realizaron 3 epocas con learning rate 1e-4 y batch global de 64, usando las librerias `trl` y `transformers`. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se mencionan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredado del ajuste sobre datos de chat.
- Razonamiento cientifico basico y respuesta a preguntas de dominio cientifico (por los datos generados por QwQ).
- Generacion de codigo (por los datos generados por DeepSeek-V3.2).
- Soporte multilingue: no confirmado en la model card; depende del modelo base y del dataset sintetico, que no se detalla.
- Tool calling / function calling: no documentado explicitamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una sola GPU consumer para validar flujos de chat multi-turno antes de escalar a modelos mayores.
- Generacion de codigo en entornos con recursos limitados: util para autocompletado o generacion de snippets en herramientas de desarrollo locales, dado su tamano de 1,54 B parametros.
- Respuesta a preguntas de divulgacion cientifica: adecuado para demos educativas donde se requiere un modelo ligero que responda sobre conceptos cientificos basicos.
- Destilacion y experimentacion academica: sirve como caso de estudio de pipelines de datos sinteticos multietapa con modelos profesor heterogeneos.
- Filtrado y clasificacion de texto en pipelines de datos: el modelo puede adaptarse mediante prompting a tareas de etiquetado o resumen en entornos de bajo coste.
- Evaluacion comparativa de tecnicas de SFT: util como baseline para investigar el impacto de learning rate, epocas y mezcla de dominios en modelos pequenos.
- Despliegue en edge o entornos sin GPU dedicada: al ser un modelo de 1,54 B, puede ejecutarse en CPU con cuantizacion (previa conversion a GGUF, no publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones teoricas, no verificadas con pesos publicados en esos formatos).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantizacion 4 bits, cabe en GPUs de 4 GB.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas en fp16, y en GPUs de gama baja con cuantizacion.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (tag `text-generation-inference` presente), y potencialmente vLLM o llama.cpp previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (SFT de Qwen2.5-1.5B) | 1,54 B | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Hugging Face |

Nota: los datos del modelo base y de los comparables se toman de sus respectivas model cards publicas; no se dispone de evaluacion comparativa de rendimiento para este fine-tune.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base (Qwen2.5-1.5B-Instruct) antes de cualquier despliegue en produccion.
- Sin evaluacion publicada: no hay benchmarks, por lo que se desconoce si el fine-tune mejora o degrada las capacidades del base.
- Riesgo de alucinacion: inherente a los modelos de 1,5 B y agravado por el entrenamiento sobre datos sinteticos generados por otros modelos, que pueden contener errores.
- Sesgos desconocidos: no se documenta la composicion del dataset sintetico ni filtros de calidad o seguridad aplicados.
- Idiomas no confirmados: aunque el base es multilingue, el fine-tune puede haber desplazado la distribucion hacia el ingles si los datos sinteticos eran mayoritariamente en ese idioma.
- Contexto no confirmado: no se especifica si se mantiene la ventana de 32.768 tokens del base o si el entrenamiento la modifico.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad; tratar como experimento, no como modelo listo para produccion.
- Sin pesos cuantizados publicados: requiere conversion manual a GGUF para despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_deepseekv3_2_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL: https://github.com/huggingface/trl
- Libreria Transformers: https://github.com/huggingface/transformers

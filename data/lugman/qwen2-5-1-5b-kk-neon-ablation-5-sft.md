# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-5-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un experimento de ablation sobre la base instruct de Qwen2.5 en su variante de 1.500 millones de parametros, entrenado con la libreria Unsloth y TRL de Hugging Face. El modelo conserva la licencia Apache 2.0 del original y esta etiquetado unicamente para ingles.

El modelo resuelve el mismo problema general que su base: generacion de texto conversacional con instrucciones en un rango de tamano pequeno, apto para despliegue en hardware modesto. Su interes es limitado y experimental: la model card no documenta el dataset de ajuste, el numero de tokens de entrenamiento ni los hiperparametros, y el nombre ("KK-Neon-Ablation-5") sugiere una prueba interna de ablation mas que un modelo listo para produccion.

No hay descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento. Por tanto, debe tratarse como un artefacto de investigacion reproducible, no como un modelo recomendado para uso comercial o produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), segun tags del repo |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 9,3 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2 con normalizacion RMSNorm, atencion con RoPE y sesgo QKV, tal como corresponde a la arquitectura Qwen2. El ajuste se realizo mediante SFT (supervised fine-tuning) empleando Unsloth y la libreria TRL, segun indica la model card. No se especifica si se aplicaron tecnicas de LoRA/QLoRA, el rango de adaptadores, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset.

La model card no documenta el volumen de tokens de entrenamiento, la mezcla de datos, ni si hubo etapas de RLHF o DPO posteriores. El sufijo "Ablation-5" sugiere que forma parte de una serie de experimentos de ablation, pero no se aporta informacion sobre que variable se esta aislando. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base instruct de Qwen2.5.
- Seguimiento de instrucciones en ingles, segun la etiqueta de idioma del repositorio.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1,54 B de parametros.
- Generacion de codigo sencillo y matematicas elementales, sin garantias documentadas por el autor.
- Compatibilidad con text-generation-inference y endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, agentes o modo thinking.
- No se documenta soporte de vision ni audio.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una unica GPU consumer para validar flujos de dialogo antes de migrar a un modelo mayor, gracias a sus 1,54 B de parametros.
- Experimentacion academica con SFT: sirve como punto de partida reproducible para estudiar el efecto de distintos datasets de ajuste sobre una base Qwen2.5-1.5B-Instruct, dado que el autor lo publica como parte de una serie de ablations.
- Generacion de texto en entornos con recursos limitados: al caber en GPUs de gama media con cuantizacion, es util para tareas de redaccion asistida o resumen de textos cortos en ingles.
- Evaluacion comparativa de tecnicas de entrenamiento: investigadores pueden contrastar este checkpoint con otros de la misma serie para medir el impacto de cada variante de ablation.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como inicializacion para fine-tunings especificos de dominio.
- Pruebas de integracion con TGI y transformers: util para validar pipelines de despliegue antes de escalar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos (1,54 B x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) para FP16; GPUs de datacenter (A100, H100) no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en FP16 y en GPUs con 4-6 GB usando cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag oficial), y potencialmente llama.cpp u Ollama si se generan conversiones GGUF, no publicadas por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-SFT | 1,54 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54 B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Base oficial, con benchmarks publicados por Qwen |
| Llama 3.2 1B Instruct | 1,24 B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face | Requiere aceptar licencia; no Apache 2.0 |
| SmolLM2-1.7B-Instruct | 1,71 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa pequena de Hugging Face |

## Limitaciones y advertencias

- Modelo experimental de ablation sin documentacion de dataset ni hiperparametros; su comportamiento puede desviarse del de la base oficial de forma no caracterizada.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a la base Qwen2.5-1.5B-Instruct.
- Solo etiquetado para ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a modelos de 1,5 B de parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sin garantias de soporte de tool calling o agentes; no se documenta en la model card.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni reportes de uso.
- La licencia Apache 2.0 permite uso comercial, pero al ser un ajuste no auditado se recomienda evaluacion propia antes de desplegarlo en produccion.
- El tamano del repositorio (9,3 GB) es superior al esperado para 1,54 B en safetensors, lo que sugiere la presencia de multiples checkpoints o ficheros adicionales; conviene revisar la lista de archivos antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl

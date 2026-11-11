# harimanikkothu/qwen2.5-1.5b-sql-merged

## Resumen

`harimanikkothu/qwen2.5-1.5b-sql-merged` es un ajuste fino (finetune) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario harimanikkothu y publicado en Hugging Face bajo licencia Apache 2.0. El nombre del repositorio sugiere una especializacion en generacion de SQL, aunque la model card no documenta explicitamente el dataset ni la tarea concreta de entrenamiento. El modelo se distribuye como un "merged" de los pesos ajustados, lo que implica que el adaptador ha sido fusionado con la base para producir un checkpoint directamente inferible.

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 de Alibaba, con 1.500 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la version base segun la documentacion oficial de Qwen). El ajuste se realizo con Unsloth y TRL, lo que acelera el entrenamiento aproximadamente 2 veces respecto a un pipeline estandar.

La relevancia de este modelo es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util unicamente como referencia de un finetune comunitario de bajo coste sobre una base pequena, no como una opcion de produccion contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-1.5B-Instruct; no verificado en este finetune) |
| Tipos de cuantizacion | no disponible (el repo no incluye versiones GGUF ni cuantizadas publicadas; el modelo base se entreno desde una version bnb-4bit) |
| Idiomas soportados | en (segun la model card; la base Qwen2.5 soporta multiples idiomas, pero el finetune declara solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers estandar; tamano del repo 0.0 GB, lo que sugiere pesos no subidos o incompletos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La base fue entrenada por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente alineada mediante instrucciones y preferencias (SFT y DPO segun la documentacion publica de Qwen2.5). El finetune de harimanikkothu parte de una version ya cuantizada a 4 bits (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`) y se entrena con Unsloth y TRL, fusionando despues los pesos en un checkpoint merged.

No se documenta en la model card el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni las hiperparametros del ajuste. El nombre del repositorio sugiere una especializacion en SQL, pero no se aporta ninguna evidencia (dataset, ejemplos, evaluacion) que lo confirme. Tampoco se indica si el merged conserva la cuantizacion o se descomprime a precision completa.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad media.
- Generacion de codigo y, presumiblemente, SQL (el nombre del repo lo sugiere, pero no hay evidencia documentada).
- Soporte de tool calling / function calling: heredado de la base Qwen2.5-Instruct, aunque no verificado en este finetune.
- Capacidades matematicas basicas, limitadas por el tamano de 1.5B.
- Multilingue: la base soporta varios idiomas, pero la model card declara solo `en`; el rendimiento en otros idiomas no esta garantizado.
- No se documentan capacidades de vision, audio ni modo "thinking" extendido.

## Casos de uso

- Prototipado rapido de asistentes SQL: el modelo puede servir para experimentar con generacion de consultas a partir de lenguaje natural en entornos de desarrollo, dado su bajo coste de inferencia y su supuesta especializacion.
- Fine-tuning educativo: util como ejemplo de pipeline Unsloth + TRL para quienes aprenden a ajustar modelos pequenos y fusionar adaptadores.
- Generacion de texto en ingles de baja latencia: al ser 1.5B, cabe en GPUs de consumo y permite respuestas rapidas en aplicaciones conversacionales simples.
- Clasificacion y extraccion de informacion: tareas de NLP ligeras (etiquetado, resumen corto) donde un modelo pequeno es suficiente.
- Base para nuevos finetunes: punto de partida para experimentos sobre Qwen2.5-1.5B en dominios especificos.
- Evaluacion comparativa de finetunes comunitarios: util en estudios sobre la calidad de ajustes de bajo presupuesto frente a la base original.
- No recomendado para produccion critica: sin benchmarks ni validacion, no es adecuado para tareas donde la precision SQL sea critica (bases de datos en produccion, migraciones automaticas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB para pesos (1.5B x 2 bytes) mas overhead de activaciones y cache KV; en la practica, 4-6 GB.
- VRAM estimada en 4 bits (si se cuantiza): aproximadamente 1 GB de pesos; 2-3 GB en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 para produccion ligera; A100/H100 innecesarias para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas en FP16 y 2 GB o mas en 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM; llama.cpp/Ollama requeririan convertir los pesos a GGUF (no publicado).
- Latencia y throughput: no disponibles; en una RTX 4090 se espera un throughput alto (cientos de tokens por segundo) por el reducido tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-1.5b-sql-merged | 1.5B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Finetune comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Base oficial, con benchmarks publicados |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Hugging Face | Especializado en codigo, con evaluacion publica |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Hugging Face | Alternativa pequena de Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos; no hay datos de rendimiento del finetune que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el finetune mejore a la base en tareas SQL ni en ninguna otra.
- Model card minima: no se documenta dataset, hiperparametros ni proceso de evaluacion.
- Repo de 0.0 GB: los pesos podrian no estar subidos correctamente o el repositorio estar incompleto; conviene verificar antes de usarlo.
- Riesgo de alucinacion: inherente a modelos de 1.5B, especialmente en SQL (tablas o columnas inventadas).
- Sesgos: heredados de la base Qwen2.5 y del dataset de finetune no documentado; no evaluados.
- Idioma: declarado solo en ingles; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validacion desaconseja produccion sin evaluacion propia.
- Sin soporte ni mantenimiento: autor individual, cero descargas, sin issues ni comunidad.
- La base de entrenamiento fue una version cuantizada a 4 bits, lo que puede introducir degradacion respecto al modelo original en precision completa.

## Enlaces

- Hugging Face: https://huggingface.co/harimanikkothu/qwen2.5-1.5b-sql-merged
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Qwen2.5-1.5B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Documentacion Qwen2.5: https://qwen.readthedocs.io/

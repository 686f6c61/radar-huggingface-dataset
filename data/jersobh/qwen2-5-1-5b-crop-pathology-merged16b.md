# jersobh/qwen2.5-1.5b-crop-pathology-merged16b

## Resumen

`jersobh/qwen2.5-1.5b-crop-pathology-merged16b` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B, publicado por el usuario jersobh en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) derivado de la versión cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`), que a su vez es una adaptación del Qwen2.5-1.5B original de Alibaba.

El nombre del repositorio sugiere una especialización en patología de cultivos ("crop-pathology"), aunque la model card no documenta el conjunto de datos de entrenamiento, el procedimiento exacto ni los resultados obtenidos. El autor únicamente indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido. El modelo se distribuye bajo licencia Apache 2.0 y declara soporte únicamente para inglés.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeño, adecuado para prototipado rápido en tareas de texto relacionadas con fitopatología, pero sin documentación técnica ni evaluaciones publicadas que permitan validar su calidad. El tamaño del repositorio (12,4 GB) es notablemente superior al esperado para un modelo de 1,5B en safetensors, lo que sugiere la presencia de múltiples artefactos o checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado a 4 bits con bitsandbytes; los pesos publicados se distribuyen en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atención por causalidad, normalización RMSNorm, activación SwiGLU y embeddings RoPE, tal como define la familia Qwen2.5. El modelo parte de la variante cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`), sobre la que se aplicó un ajuste fino supervisado (SFT) utilizando las herramientas de Unsloth y TRL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento. El nombre del repositorio sugiere un corpus orientado a patología de cultivos, pero este extremo no está documentado en la model card. Tampoco se especifica si el proceso de "merge" (indicado en el nombre) consistió en fusionar adaptadores LoRA con los pesos base o en combinar varios checkpoints.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento básico y respuesta a instrucciones de complejidad baja o media.
- Generación de código y resolución de problemas matemáticos sencillos, en la medida en que lo permite un modelo de 1,5B.
- Soporte de conversaciones multi-turno mediante plantilla de chat (formato Qwen2).
- Posible especialización en dominio agronómico o fitopatológico, sugerida por el nombre del repositorio, aunque no verificada ni documentada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) específico para este ajuste.
- Capacidades multilingües limitadas: el autor declara únicamente inglés.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés sobre fitopatología: el modelo puede emplearse para generar respuestas preliminares sobre identificación de enfermedades de cultivos, siempre con revisión experta dada la ausencia de evaluaciones.
- Clasificación y resumen de textos agronómicos: dado su tamaño reducido, es viable ejecutarlo localmente para resumir informes de campo o fichas técnicas en inglés.
- Generación de preguntas y respuestas sintéticas para aumentar datasets de dominio agrícola: útil como generador de datos auxiliar en pipelines de anotación.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros cabe en GPUs de consumo y permite experimentación de bajo coste en estaciones de trabajo sin aceleradores de gama alta.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y con pesos en safetensors, puede servir como punto de partida para especializaciones posteriores con Unsloth o TRL.
- Chatbot de consulta interna para técnicos agrícolas: integrable mediante `transformers` o `text-generation-inference` en un servicio ligero, con la advertencia de validar las respuestas por el riesgo de alucinación en un dominio técnico.
- Evaluación comparativa de técnicas de fine-tuning: útil como caso de estudio de ajuste rápido con Unsloth frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 4-5 GB en total).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.), e incluso en CPU con cuantización GGUF.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM, llama.cpp u Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5B en una GPU moderna se espera un throughput alto (cientos de tokens por segundo en A100), pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| jersobh/qwen2.5-1.5b-crop-pathology-merged16b | 1,54B | no disponible | Apache 2.0 | en | Ajuste fino de nicho, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe (incluye es, en, zh) | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe | Variante instruida oficial, evaluada en MMLU, HumanEval, GSM8K |
| unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe | Punto de partida cuantizado a 4 bits usado por este ajuste |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el procedimiento y las evaluaciones: no es posible verificar la calidad ni la especialización real del modelo.
- Riesgo elevado de alucinación en dominio técnico (fitopatología), agravado por el tamaño reducido del modelo y la falta de validación.
- Sesgos heredados del modelo base Qwen2.5-1.5B y del corpus de ajuste, que no ha sido auditado.
- Soporte declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no confirmada en esta ficha; aunque el modelo base soporta 32.768 tokens, no se especifica si el ajuste preserva esa ventana.
- El tamaño del repositorio (12,4 GB) es desproporcionado para un modelo de 1,5B, lo que puede indicar checkpoints redundantes o artefactos de entrenamiento; conviene revisar los archivos antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- El nombre incluye "merged16b", lo que puede inducir a confusión sobre el tamaño real del modelo (1,5B, no 16B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/qwen2.5-1.5b-crop-pathology-merged16b
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl

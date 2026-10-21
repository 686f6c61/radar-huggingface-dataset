# Mrunmayp/qwen25-3b-acereason-random15k-s2

## Resumen

`Mrunmayp/qwen25-3b-acereason-random15k-s2` es un ajuste fino (fine-tuning completo, no LoRA) del modelo Qwen2.5-3B-Instruct, publicado por el usuario Mrunmayp en HuggingFace. El identificador del repositorio sugiere que el entrenamiento se ha realizado sobre un subconjunto de unos 15.000 ejemplos orientados a razonamiento (la cadena "acereason" apunta a datos del tipo AceReason), aunque la model card no documenta la composición del dataset, que aparece únicamente como `random_s2`.

El modelo conserva la arquitectura y el tamaño del base: un transformer decoder-only de aproximadamente 3.090 millones de parámetros, con atención de consultas agrupadas (GQA) y 32.768 tokens de contexto nativo. El repositorio ocupa 6,2 GB en safetensors, coherente con un checkpoint en bf16 de ese orden de magnitud. Se trata de un artefacto de investigación: la model card es la plantilla automática de HuggingFace Trainer, sin descripción, sin datos de evaluación y sin resultados de benchmarks (el `model-index` está vacío).

Su relevancia es limitada y experimental: sirve como ejemplo reproducible de una receta de SFT con Llama-Factory sobre un modelo pequeño de la familia Qwen2.5, y como punto de partida para quien quiera estudiar el efecto de un ajuste con pocos miles de ejemplos de razonamiento sobre un modelo de 3B. No hay evidencia publicada de que mejore al base en ninguna tarea concreta, y la licencia figura como "other", lo que impide asumir uso comercial sin aclaración del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atención GQA, heredada del base Qwen2.5-3B-Instruct |
| Parametros totales | ~3.090 millones (heredados del base). El metadata de safetensors del repo declara 241.664, dato inconsistente con el tamaño del repo (6,2 GB); se considera un error de metadatos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredados del base); no verificado en este checkpoint |
| Tipos de cuantizacion | Solo safetensors en precisión de entrenamiento (bf16/fp16 presumiblemente). No se publican GGUF, AWQ ni GPTQ; convertibles con llama.cpp, AutoAWQ o bitsandbytes |
| Idiomas soportados | No documentados para este fine-tune. El base Qwen2.5 declara ~29 idiomas |
| Licencia | `other` (no se especifican términos; el base es Apache 2.0) |
| Formato de pesos | safetensors (compatible con `transformers`, `text-generation-inference`) |

## Arquitectura y entrenamiento

La arquitectura es la del base sin modificaciones: decoder-only con 36 capas, dimensión oculta 2.048, GQA con 16 cabezas de consulta y 2 cabezas de clave/valor, vocabulario de 151.936 tokens, normalización RMSNorm y activación SwiGLU. El contexto nativo es de 32.768 tokens, ampliable teóricamente mediante RoPE scaling, aunque este checkpoint no documenta ni valida dicha extensión.

El entrenamiento se realizó con Llama-Factory en modo `full` (todos los pesos actualizados), sobre 8 GPUs, con `learning_rate` 5e-6, tamaño de lote por dispositivo 1, acumulación de gradiente 8 y lote total efectivo de 64, programador coseno, optimizador AdamW (`betas=(0.9,0.999)`, `eps=1e-08`), semilla 42 y 3 épocas. El dataset aparece nombrado como `random_s2`; no se indica número de tokens, composición ni si hubo etapas de RLHF o DPO posteriores. El `eval_batch_size` es 8, pero no se reportan métricas de evaluación. Las versiones de framework son Transformers 4.55.0, PyTorch 2.6.0+cu126, Datasets 3.6.0 y Tokenizers 0.21.1. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base instruct.
- Razonamiento en formato de cadena de pensamiento: es la capacidad que el nombre del modelo sugiere haber reforzado, aunque no hay evaluación que lo confirme.
- Razonamiento matemático y de sentido común de nivel 3B, potencialmente estimulado por el dataset de ajuste.
- Generación de código y explicaciones técnicas, limitada por el tamaño del modelo (3B).
- Soporte de tool calling / function calling presente en el base Qwen2.5-3B-Instruct; este fine-tune no lo documenta y podría haberse degradado con el ajuste.
- Capacidad multilingüe heredada del base (~29 idiomas declarados), sin garantía tras el ajuste.
- Salidas estructuradas (JSON, listas, tablas) por instrucción explícita, sin gramática restringida documentada.
- No se documentan capacidades de visión, audio ni modo "thinking" separado.

## Casos de uso

- Investigación sobre recetas de SFT: reproducir la configuración exacta (8 GPUs, lr 5e-6, 3 épocas, lote efectivo 64) para estudiar cómo afecta un ajuste corto de razonamiento a un modelo de 3B, comparando contra el base con la misma batería de evaluación.
- Generación de datos sintéticos de razonamiento: usar el modelo para producir trazas de cadena de pensamiento que luego se filtran y se emplean en la destilación hacia modelos mayores o para aumentar un dataset propio.
- Ablación de datasets: comparar `random_s2` frente a otros subconjuntos de razonamiento sobre el mismo base para medir qué tipo de ejemplos mueve más la aguja en matemáticas y lógica.
- Asistente local de código en estación de trabajo: con cuantización de 4 bits cabe en GPUs de 8 GB y permite autocompletado, explicación de fragmentos y generación de tests en entornos sin conexión.
- Extracción de información estructurada: convertir texto libre en JSON con campos fijos (extracción de entidades, clasificación de tickets) gracias al seguimiento de instrucciones del base y a su ventana de 32K.
- Formación y prototipado docente: ejemplo real y ligero de un pipeline Llama-Factory completo, desde el dataset hasta el despliegue con TGI, útil en cursos de ajuste fino.
- Chatbot de dominio acotado en pruebas de concepto: con contexto de 32K puede mantener conversaciones largas sobre documentación técnica, siempre con validación humana por el riesgo de alucinación.

## Benchmarks y rendimiento

El `model-index` de la model card declara una única entrada, `random_s2`, con la lista de resultados vacía. No hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: ~6,2 GB de pesos; con 8K de contexto y lote 1, en torno a 7-8 GB contando caché KV.
- Caché KV: ~36 KB por token (36 capas × 2 cabezas KV × 128 de dimensión × K y V × 2 bytes), es decir, ~1,2 GB adicionales a 32.768 tokens.
- Cuantización de 8 bits: ~3,5-4 GB de VRAM total; cuantización de 4 bits (GGUF Q4_K_M): ~1,9 GB de pesos, viable en GPUs de 4-6 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para servir con lotes grandes; L40S o RTX 4090 para desarrollo; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en adelante para inferencia local en bf16.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, SGLang, TGI (el repo declara `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama/LM Studio tras conversión a GGUF, y `transformers` directamente para pruebas.
- Latencia y throughput: no se han publicado mediciones para este checkpoint. Al ser un denso de 3B, el rendimiento será del orden del base Qwen2.5-3B-Instruct en el mismo hardware, pero no hay datos que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen25-3b-acereason-random15k-s2 | ~3,09 B | 32.768 | `other` | HuggingFace, safetensors | Sin benchmarks ni model card descriptiva; fine-tune de investigación |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 | Apache 2.0 | HuggingFace, GGUF/AWQ/GPTQ de la comunidad | Base del anterior; documentación completa y uso comercial permitido |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 | Llama 3.2 Community License | HuggingFace, ecosistema amplio | Mayor contexto nativo; licencia con restricciones para grandes usuarios |
| Phi-3.5-mini-instruct | ~3,82 B | 128.000 | MIT | HuggingFace | Más parámetros y contexto; entrenado con foco en razonamiento |
| Gemma-2-2B-it | ~2,61 B | 8.192 | Gemma Terms of Use | HuggingFace | Menor y con contexto más corto; licencia con condiciones de uso |

Los datos de los modelos comparados provienen de su documentación oficial y pueden variar según la versión consultada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas que demuestren mejora sobre Qwen2.5-3B-Instruct; el ajuste podría haber degradado capacidades del base (instrucciones, formato, tool calling).
- Licencia `other` sin texto: no se puede asumir uso comercial. Aunque el base es Apache 2.0, el autor del fine-tune no especifica términos, lo que constituye un riesgo legal para producción.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, la licencia y la posible contaminación de los datos (`random_s2` no aporta información).
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en dominios factuales y en matemáticas con varios pasos.
- Contexto efectivo menor que el nominal: a 32K tokens la calidad de recuperación en el centro de la ventana suele decaer, y la caché KV añade ~1,2 GB de VRAM.
- Idiomas no verificados: el ajuste puede haber reducido el multilingüismo del base si el dataset era mayoritariamente en inglés.
- Sesgos: no evaluados; el modelo hereda los del corpus de Qwen2.5 sin filtrado documentado.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (20-10-2026), sin issues ni soporte.
- Inconsistencia en metadatos: el recuento de 241.664 parámetros en safetensors no cuadra con el tamaño del repo; conviene verificar la integridad del checkpoint antes de desplegarlo.
- No recomendado como base de producción sin una evaluación propia en la tarea objetivo y una revisión legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mrunmayp/qwen25-3b-acereason-random15k-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Llama-Factory (framework de entrenamiento declarado): https://github.com/hiyouga/LLaMA-Factory
- Informe técnico de Qwen2.5 (documentación del modelo base): https://arxiv.org/abs/2412.15115
- Paper de AceReason-Nemotron (referencia nominal del identificador, no confirmada por el autor): https://arxiv.org/abs/2505.16400

No se han encontrado en la información disponible demo, blog del autor ni repositorio de código asociados a este fine-tune.

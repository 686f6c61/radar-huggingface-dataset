# appdeveloper512/urdu-llm-v7-checkpoints

## Resumen

`urdu-llm-v7-checkpoints` es un ajuste fino (SFT) del modelo `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, publicado por el usuario `appdeveloper512` en Hugging Face. Se trata, por tanto, de un modelo derivado de la familia Llama 3.2 de Meta en su variante de 3 000 millones de parámetros, entrenado con la librería TRL sobre una carga cuantizada en 4 bits del modelo base. El nombre del repositorio sugiere una especialización hacia el urdu y la existencia de varios checkpoints intermedios, aunque la model card no documenta ni el idioma, ni el conjunto de datos, ni la receta de entrenamiento.

El interés práctico del modelo es limitado pero acotado: sirve como ejemplo reproducible de un pipeline de ajuste supervisado con Unsloth + TRL sobre un modelo pequeño, y como punto de partida para quien quiera experimentar con adaptaciones lingüísticas de Llama 3.2 3B en hardware de consumo. El repositorio ocupa 5,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, sin resultados de evaluación publicados.

No debe confundirse con otros proyectos homónimos de la búsqueda web, como el repositorio `wisamulhaq/urdu_llm`, que corresponde a un GPT de ~15 millones de parámetros entrenado desde cero y es independiente de este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B Instruct); no detallada en la model card |
| Parámetros totales | ~3 000 millones (heredados del modelo base; no verificados en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantización | No disponible; el modelo base se cargó en 4 bits (bnb-4bit) para el entrenamiento |
| Idiomas soportados | No disponible (el nombre del repositorio sugiere urdu; no confirmado) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `unsloth/Llama-3.2-3B-Instruct-bnb-4bit` |
| Método de entrenamiento | SFT con TRL |
| Tamaño del repositorio | 5,1 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |
| Compatibilidad | Etiqueta `endpoints_compatible` (compatible con Hugging Face Inference Endpoints) |
| Versiones de framework | TRL 1.15.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atención agrupada (GQA) y RoPE, del que este repositorio hereda todos los hiperparámetros estructurales salvo que el ajuste fino los haya modificado (la model card no lo indica). El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 1.15.0, sobre una base cuantizada en 4 bits gestionada con Unsloth, lo que es coherente con un flujo de QLoRA o de ajuste con adaptadores sobre pesos congelados. No se especifica si el resultado publicado son adaptadores LoRA, un modelo fusionado o una colección de checkpoints intermedios, extremo que el nombre del repositorio deja abierto.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre hiperparámetros como la tasa de aprendizaje, el número de épocas o la longitud de secuencia. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras). La model card se limita a declarar el uso de SFT y a incluir un ejemplo de inferencia con `pipeline`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del formato de chat de Llama 3.2 3B Instruct (la model card emplea mensajes con rol `user`).
- Razonamiento básico y respuesta a preguntas de carácter general, limitado por el tamaño de 3B parámetros.
- Generación de código y tareas de transformación de texto, en la medida en que el ajuste SFT no haya degradado las capacidades del modelo base (no verificado).
- Capacidad multilingüe potencialmente orientada al urdu, a juzgar por el nombre del repositorio; no hay evaluación ni documentación que lo confirme.
- Integración con el ecosistema `transformers` y con Inference Endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, modo de razonamiento explícito, visión ni audio en la información disponible.

## Casos de uso

- Ajuste y experimentación con SFT: el repositorio sirve como referencia de un pipeline Unsloth + TRL sobre Llama 3.2 3B, útil para reproducir la receta en otros idiomas o dominios con una sola GPU de consumo.
- Asistencia conversacional en urdu: si el ajuste cumple lo que sugiere el nombre, podría emplearse para respuestas de chat en dicho idioma; requiere validación previa con un conjunto de evaluación propio, ya que no hay métricas publicadas.
- Prototipado de atención al cliente: con 3B parámetros puede desplegarse en una GPU modesta para generar borradores de respuesta en mercados de habla urdu, siempre con revisión humana.
- Etiquetado y clasificación de texto: uso como generador de anotaciones o resúmenes sobre corpus en urdu, aprovechando su bajo coste de inferencia frente a modelos de mayor tamaño.
- Generación de material didáctico y traducción asistida: redacción de explicaciones o borradores de traducción urdu-inglés para revisión posterior por un traductor.
- Base para nuevos ajustes: al ser un checkpoint derivado, puede utilizarse como punto de partida para fine-tunes posteriores en dominios específicos (legal, médico, educativo).
- Investigación sobre olvido catastrófico: comparar su rendimiento en inglés frente al modelo base permite estudiar cuánto se degrada el conocimiento original tras un SFT intensivo en otro idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, y no se ha realizado una comparación cuantitativa con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 6,5 GB solo para los pesos, más caché KV; presupuesto práctico de 8 a 12 GB según longitud de contexto (estimación a partir de los 3B parámetros, no medida).
- VRAM estimada en cuantización de 8 bits: ~3,5 GB de pesos; en 4 bits: ~2 GB de pesos, con margen adicional para el contexto.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 para despliegues concurrentes; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para inferencia en cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` con `device_map="auto"` (ejemplo oficial de la model card), vLLM o TGI si los pesos publicados son un checkpoint completo y no solo adaptadores, y llama.cpp u Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Datos de referencia de los modelos base; no son resultados de evaluación de este ajuste fino.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `appdeveloper512/urdu-llm-v7-checkpoints` | ~3B | No disponible | No disponible | Repositorio HF, 0 descargas |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 128 000 tokens | Llama 3.2 Community License | Público en HF, muy extendido |
| `Qwen/Qwen2.5-3B-Instruct` | 3,09B | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | Público en HF |
| `google/gemma-2-2b-it` | 2,6B | 8 192 tokens | Gemma Terms of Use | Público en HF |
| `microsoft/Phi-3.5-mini-instruct` | 3,8B | 128 000 tokens | MIT | Público en HF |

Frente a estas alternativas, el modelo aquí descrito no aporta métricas verificables ni una licencia clara, por lo que su elección solo se justifica si se busca específicamente un ajuste en urdu o un ejemplo reproducible de SFT con Unsloth.

## Limitaciones y advertencias

- Ausencia total de evaluación: sin benchmarks ni conjunto de validación publicado, no es posible afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Licencia no especificada: la model card incluye un campo `licence: license` sin contenido, lo que impide determinar las condiciones de uso comercial. Al derivar de Llama 3.2, cabe esperar que se aplique la Llama 3.2 Community License del modelo base, pero no está declarado.
- Idiomas no declarados: pese al nombre, no se confirma que el modelo domine el urdu ni en qué grado; tampoco se documenta si conserva el multilingüismo del modelo base.
- Riesgo de olvido catastrófico: un SFT sobre una base de 3B puede degradar capacidades previas de razonamiento, código o inglés.
- Riesgo de alucinación: inherente a un modelo de 3B parámetros, especialmente en dominios factuales y en idiomas de bajos recursos.
- Contexto desconocido: se desconoce si el ajuste recorta la ventana del modelo base; asumir 128 000 tokens sin verificación puede provocar errores en producción.
- Datos de entrenamiento no documentados: no puede evaluarse el sesgo, la procedencia del corpus ni posibles problemas de derechos de autor.
- Naturaleza del repositorio: el sufijo `checkpoints` sugiere estados intermedios de entrenamiento; conviene verificar que los pesos publicados sean un modelo final utilizable y no fragmentos.
- Madurez: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Fecha de creación declarada en Hugging Face: 18 de octubre de 2026 (según metadatos de la plataforma).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appdeveloper512/urdu-llm-v7-checkpoints
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Repositorio TRL: https://github.com/huggingface/trl
- Otro repositorio del mismo autor: https://huggingface.co/appdeveloper512/urdu-llm-model
- Proyecto independiente de LLM en urdu (no relacionado): https://github.com/wisamulhaq/urdu_llm
- Guía de construcción de un LLM en urdu (no relacionada): https://github.com/wisamulhaq/urdu_llm/blob/main/URDU_LLM_COMPLETE_GUIDE.md
- Leaderboard genérico de modelos: https://www.llmboard.ai/

# mohammed-el-baraka/KhulasaAI

## Resumen

KhulasaAI es un adaptador LoRA para el modelo base Qwen2.5-0.5B-Instruct, desarrollado por Mohammed El Baraka (Universidad Mohammed VI Polytechnic, UM6P), que especializa el modelo en la tarea de resumen abstractivo de texto en árabe estándar moderno. El adaptador se obtuvo mediante destilación de conocimiento (knowledge distillation) desde el modelo profesor Qwen2.5-7B-Instruct, que generó los resúmenes sintéticos utilizados como datos de entrenamiento.

El modelo resuelve el problema de la escasez de sistemas de resumen de texto en árabe de pequeño tamaño y bajo coste computacional. Con solo 8,3 MB de adaptador sobre una base de 494 millones de parámetros, el conjunto completo puede ejecutarse en hardware de consumo, lo que lo hace accesible para despliegues locales y aplicaciones con restricciones de recursos. Su relevancia actual radica en la combinación de destilación desde un modelo de 7B, cuantización QLoRA y un pipeline de entrenamiento reproducible en una GPU T4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 494M (modelo base) + ~4,4M (adaptador LoRA, 8,3 MB en FP16) |
| Parametros activos | 494M (no es MoE; todos los parametros del base estan activos) |
| Longitud de contexto | 1024 tokens (max sequence length durante entrenamiento; el base soporta 32K pero el adaptador fue entrenado con 1024) |
| Tipos de cuantizacion | FP16 (entrenamiento); el adaptador se puede cargar sobre el base en FP16 o cuantizado (4-bit/8-bit) |
| Idiomas soportados | Arabe estandar moderno (MSA) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros con atención causal estándar. Sobre esta base se aplica un adaptador LoRA de rango 16 (alpha 32, dropout 0,05) dirigido a los módulos de proyección de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), entrenado con QLoRA en precisión FP16. El entrenamiento utilizó destilación de conocimiento: el profesor Qwen2.5-7B-Instruct (cuantizado a 4 bits) generó resúmenes sintéticos de 5.000 artículos muestreados de la Wikipedia árabe (versión `20231101.ar`, semilla 42), con un máximo de 150 tokens de resumen y truncamiento de entrada a 2.000 caracteres.

Los hiperparámetros incluyen 1 época, tasa de aprendizaje 2e-4, tamaño de lote efectivo 8 (lote 4 con acumulación de gradiente 2), optimizador AdamW y 282 pasos de entrenamiento. El entrenamiento se completó en aproximadamente 14 minutos en una NVIDIA Tesla T4 de 16 GB mediante Kaggle Notebooks, usando las librerías PEFT 0.18.0, Transformers 4.40+, PyTorch 2.0+ y TRL 0.8+.

## Capacidades

- Resumen abstractivo de texto en árabe estándar moderno, generando resúmenes de hasta 150 tokens.
- Generación de texto en árabe siguiendo el formato de chat del modelo base Qwen2.5-Instruct (system/user/assistant).
- Integración con el ecosistema HuggingFace Transformers y PEFT mediante carga estándar de adaptadores.
- Compatible con técnicas de cuantización del modelo base (bitsandbytes, GPTQ, AWQ) para reducir aún más el uso de VRAM.
- Capacidades de razonamiento y generación del modelo base Qwen2.5-0.5B-Instruct conservadas (el adaptador solo modifica la distribución de salida hacia la tarea de resumen).
- Sin soporte de tool calling, function calling ni capacidades multimodales (limitación del modelo base de 0,5B).

## Casos de uso

- Resumen de artículos de noticias en árabe: el modelo puede procesar artículos de agencias de prensa árabes y generar resúmenes concisos para boletines informativos o feeds de noticias, aprovechando su entrenamiento sobre Wikipedia árabe.
- Resumen de documentos académicos y técnicos: investigadores pueden resumir abstracts y secciones de papers en árabe para revisiones rápidas de literatura.
- Asistente de lectura en aplicaciones móviles: al ser un adaptador de solo 8,3 MB sobre un modelo de 0,5B, puede desplegarse en dispositivos con recursos limitados para resumir contenido en árabe sin conexión.
- Preprocesamiento de datos para RAG: el modelo puede generar resúmenes de documentos árabes antes de indexarlos en una base vectorial, reduciendo el tamaño de los chunks y mejorando la precisión de recuperación.
- Generación de titulares y metadatos: periodistas y gestores de contenido pueden generar titulares o descripciones cortas en árabe para artículos web, optimizando el SEO.
- Resumen de conversaciones y correos electrónicos en árabe: el modelo puede condensar hilos de correo o transcripciones de chat en árabe estándar para facilitar la revisión rápida.
- Educación y autoaprendizaje: estudiantes pueden resumir capítulos de libros de texto en árabe para repasar conceptos clave.

## Benchmarks y rendimiento

| Metrica | Puntuacion |
|---|---|
| ROUGE-1 | 62,21 |
| ROUGE-2 | 41,17 |
| ROUGE-L | 60,66 |
| BERTScore (F1) | 0,861 |

Estas métricas se evaluaron sobre el 10% de test del dataset de Wikipedia árabe (500 artículos aproximadamente). No se han publicado comparaciones con otros modelos de resumen en árabe en la información disponible, por lo que no es posible contextualizar estos valores frente a alternativas del mercado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B-Instruct en FP16 ocupa aproximadamente 1 GB de VRAM; en cuantización 4-bit se reduce a unos 350-400 MB. El adaptador LoRA añade solo 8,3 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.). Una Tesla T4 (16 GB) es más que suficiente. También puede ejecutarse en CPU con llama.cpp si se convierte el modelo a GGUF.
- Cabe en GPUs de consumo: sí, incluso en las más modestas, y también en Apple Silicon mediante MLX si se convierte el modelo.
- Opciones de despliegue: Transformers + PEFT (carga estándar), vLLM (si se fusiona el adaptador con el base), llama.cpp/Ollama (requiere conversión a GGUF), TGI (con adaptadores LoRA).
- Latencia estimada: en una GPU T4, la generación de 150 tokens con el modelo de 0,5B debería completarse en 1-3 segundos; en CPU moderna, entre 5-15 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KhulasaAI (adaptador sobre Qwen2.5-0.5B) | 494M + adaptador | 1024 (entrenamiento) | Resumen arabe | MIT | HuggingFace |
| Qwen2.5-0.5B-Instruct (base sin adaptador) | 494M | 32K | Generacion general | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct (profesor) | 7,6B | 32K | Generacion general | Apache 2.0 | HuggingFace |

No se dispone de información sobre otros adaptadores de resumen en árabe comparables en el momento de redactar esta ficha. La comparativa con el modelo base muestra que el adaptador añade una especialización específica en resumen árabe sin aumentar significativamente el coste de inferencia, mientras que el profesor de 7B ofrece mayor calidad pero con un coste computacional aproximadamente 15 veces superior.

## Limitaciones y advertencias

- Entrenado únicamente en árabe estándar moderno (MSA); el rendimiento con dialectos árabes (egipcio, marroquí, del Golfo, etc.) no está garantizado y probablemente sea deficiente.
- Los resúmenes generados están limitados a aproximadamente 150 tokens debido a la restricción impuesta durante la anotación con el modelo profesor.
- Riesgo de alucinación: el modelo puede inventar hechos no presentes en el texto fuente, una limitación conocida del resumen abstractivo.
- Los artículos de entrada se truncaron a 2.000 caracteres durante el entrenamiento; el rendimiento en documentos más largos puede degradarse significativamente.
- El conjunto de datos de entrenamiento es pequeño (5.000 artículos) y proviene exclusivamente de Wikipedia, lo que puede sesgar el vocabulario y los dominios cubiertos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base Qwen2.5-0.5B-Instruct está bajo Apache 2.0, que también permite uso comercial.
- No se han publicado evaluaciones de seguridad, sesgos o robustez del adaptador; se recomienda auditar el modelo antes de desplegarlo en producción con usuarios finales.

## Enlaces

- [HuggingFace - mohammed-el-baraka/KhulasaAI](https://huggingface.co/mohammed-el-baraka/KhulasaAI)
- [Modelo base - Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Repo GitHub citado en la model card](https://github.com/mohammed-el-baraka/KhulasaAI)

Nota: la búsqueda web devolvió resultados para un proyecto homónimo distinto (RamiDevX/Khulasa-AI, un bot de Telegram para resumir reuniones), que no está relacionado con este modelo y no debe confundirse con él.

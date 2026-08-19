# IvmeLabs/Ivme-Conversate-XL-v1.1-Base

## Resumen

Ivme-Conversate-XL-v1.1-Base es un modelo de lenguaje causal de tipo transformer decoder-only denso, desarrollado por IvmeLabs y publicado en Hugging Face. Forma parte de la familia Conversate, que incluye versiones más pequeñas (Conversate-S y Conversate-v2) y esta variante XL, la más grande de la colección. Con 125,6 millones de parámetros, el modelo ha sido entrenado desde cero sobre un corpus de 5.000 millones de tokens en inglés, combinando fuentes como DCLM-baseline, FineWeb-Edu, FineMath, Wikipedia y Project Gutenberg.

El modelo destaca por su arquitectura limpia y moderna: 12 capas, hidden size de 768, atención de 12 cabezas, feed-forward SwiGLU, posicionales RoPE y normalización RMSNorm, todo ello sin capas de bias y con embeddings de entrada y salida atados. Su ventana de contexto es de 1024 tokens, lo que lo sitúa como un modelo pequeño orientado a tareas de generación de texto de longitud moderada. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su carácter didáctico y experimental: al ser entrenado desde cero con una arquitectura personalizada (requiere `trust_remote_code=True`), resulta útil para estudiar el comportamiento de modelos pequeños, probar técnicas de entrenamiento como el optimizador Muon y servir como base para fine-tuning en tareas específicas. No obstante, su tamaño y contexto limitado lo alejan de los modelos de producción actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (12 capas, hidden 768, 12 cabezas, head_dim 64, SwiGLU FFN 3072, RoPE theta=10000, RMSNorm pre-norm, embeddings atados, sin bias) |
| Parametros totales | 125.553.408 (125,6 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (repositorio con pesos safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (arquitectura personalizada, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional pero con detalles técnicos modernos. Cada una de las 12 capas emplea atención multi-cabeza con 12 cabezas de dimensión 64, seguida de un feed-forward SwiGLU con dimensión intermedia de 3072. La codificación posicional se realiza mediante RoPE (Rotary Position Embedding) con theta de 10000, y la normalización se aplica antes de cada subcapa (pre-norm) usando RMSNorm. Los embeddings de entrada y salida están atados (tied), y no se utilizan términos de bias en ninguna capa. El vocabulario es de 16.000 tokens, obtenido mediante tokenización BPE.

El entrenamiento se realizó sobre un corpus de 5.000 millones de tokens, compuesto principalmente por DCLM-baseline, FineWeb-Edu y FineMath, complementado con Wikipedia en inglés y Project Gutenberg. El optimizador empleado fue Muon para los pesos del cuerpo del modelo y AdamW para embeddings y capas de normalización. El entrenamiento se llevó a cabo en una única GPU AMD Instinct MI300X con ROCm 7.14.0 y PyTorch 2.12.0. El repositorio contiene checkpoints de los pasos 3, 270, 540, 810, 1080, 1350, 1620, 1890, 2160, 2430, 2700, 2970, 3240, 3510, 3780, 4050, 4320, 4590, 4860, 5130, 5400 y 5450.

## Capacidades

- Generacion de texto causal: el modelo produce texto coherente en ingles, dado un prompt inicial, con una longitud maxima de 1024 tokens.
- Completado de texto: adecuado para tareas de autocompletado o continuacion de frases y parrafos cortos.
- Modelo base: no incluye fine-tuning instructivo ni RLHF, por lo que no sigue instrucciones de forma nativa; requiere fine-tuning para tareas especificas.
- Entrenamiento desde cero: al ser un modelo base, puede servir como punto de partida para experimentos de fine-tuning o para estudiar el comportamiento de modelos pequenos.
- Sin capacidades multimodales: no soporta vision, audio ni otras modalidades; solo texto.
- Sin tool calling ni agentes: no se ha entrenado para invocar funciones ni para razonamiento multi-paso complejo.

## Casos de uso

- Experimentacion educativa: ideal para estudiantes e investigadores que quieran comprender el funcionamiento interno de un transformer, ya que su tamano reducido permite inspeccionar pesos, activaciones y atencion con recursos modestos.
- Prototipado rapido de generacion de texto: se puede desplegar localmente para probar ideas de generacion de texto corto, como titulares, resumenes o respuestas breves, sin necesidad de infraestructura costosa.
- Fine-tuning para tareas especificas: al ser un modelo base, puede ajustarse con datasets pequenos para tareas como clasificacion de texto, generacion de respuestas en dominios concretos o analisis de sentimiento, gracias a su licencia permisiva.
- Generacion de contenido corto en ingles: util para crear borradores de descripciones de productos, mensajes de redes sociales o fragmentos de documentacion tecnica, siempre que se acepte una calidad limitada.
- Estudio de tecnicas de entrenamiento: el uso de Muon y la mezcla de datos (DCLM, FineWeb-Edu, FineMath) permite analizar el impacto de estas elecciones en un modelo pequeno, comparando con otros entrenados con metodos clasicos.
- Despliegue en entornos con recursos limitados: con solo 125 M de parametros, puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace accesible para pruebas en portatiles o servidores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar. El autor no proporciona metricas de rendimiento comparativas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32 y 250 MB en FP16 (para 125 M de parametros). El repositorio contiene multiples checkpoints, por lo que el tamano total de 6 GB se debe a la acumulacion de estos, no al peso individual.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; por ejemplo, NVIDIA GTX 1650, RTX 3060, o incluso integradas modernas. Tambien puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual sin problemas.
- Opciones de despliegue: al usar una arquitectura personalizada, el despliegue se realiza principalmente mediante la libreria `transformers` con `trust_remote_code=True`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; seria necesario adaptar el codigo para esos motores.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano, se espera una latencia baja (del orden de milisegundos por token en GPU) y un throughput alto en CPU, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo es parte de una familia propia (Conversate-S, Conversate-v2, Conversate-XL) pero no se han publicado benchmarks ni comparaciones con modelos externos como GPT-2 small (124 M) o Pythia-160M. Se recomienda consultar la organizacion IvmeLabs en Hugging Face para ver los modelos relacionados.

## Limitaciones y advertencias

- Contexto limitado: la ventana de 1024 tokens restringe la generacion a textos cortos; no es adecuado para documentos largos o conversaciones extensas.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Modelo base sin instrucciones: no ha sido fine-tuneado para seguir instrucciones ni para dialogos; puede producir respuestas irrelevantes o incoherentes si se le pide algo que no sea continuacion de texto.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos o datos, especialmente en temas especializados.
- Requiere `trust_remote_code=True`: el codigo de arquitectura personalizado (`modeling_ivme.py`) se ejecuta localmente; se recomienda revisarlo antes de usarlo en entornos de produccion por seguridad.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, por lo que su calidad real es desconocida.
- Tamano reducido: con 125 M de parametros, su capacidad de razonamiento y conocimiento general es muy inferior a la de modelos modernos de miles de millones de parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IvmeLabs/Ivme-Conversate-XL-v1.1-Base
- Organizacion IvmeLabs: https://huggingface.co/IvmeLabs
- Coleccion Conversate: https://huggingface.co/collections/IvmeLabs/conversate
- Version anterior (v1-Base): https://huggingface.co/IvmeLabs/Ivme-Conversate-XL-v1-Base
- Explorador de modelos (LLM Explorer): https://llm-explorer.com/model/IvmeLabs%2FIvme-Conversate-S-v1-Base,6AlolH7wDkQ29O3ocTtX8V

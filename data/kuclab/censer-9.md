# KucLab/Censer.9

## Resumen

Censer.9 es un clasificador de seguridad de contenido desarrollado por KucLab, un proyecto que publica modelos de moderación de talla muy reducida entrenados desde cero. Se trata de un transformer decoder-only de 903.552 parámetros (aproximadamente 0,9 millones) especializado en clasificación multi-etiqueta: una decisión binaria safe/unsafe más diez categorías de seguridad (armas y explosivos, autolesión, CSAM, discurso de odio, entre otras). Su función es actuar como filtro de entrada o salida en pipelines de aplicaciones conversacionales, moderación de comunidades o sistemas de agentes, donde el coste por inferencia y la latencia importan más que la comprensión semántica profunda.

La propuesta diferencial no es la escala sino la ingeniería de producción alrededor del modelo: contexto nativo de 4096 tokens con una ruta de max-chunking para documentos largos, umbrales por idioma calibrados para un objetivo de falsos positivos (≤5 % sobre texto benigno), temperatura de calibración para que las probabilidades sean interpretables, y un pre-filtro determinista de coincidencia de patrones que fuerza la etiqueta unsafe en casos de CSAM y autolesión con independencia del umbral lingüístico. El checkpoint pesa 3,6 MB y se ejecuta en CPU.

Es relevante ahora porque cubre ocho idiomas (inglés, checo, alemán, español, francés, italiano, portugués y ruso) con licencia Apache 2.0 y se carga con `transformers` sin `trust_remote_code`, lo que lo hace desplegable en entornos con recursos mínimos o en el borde de la red. La versión .9 responde a una segunda revisión adversarial que corrigió fugas de evaluación, umbrales mal calibrados y fallos de detección de idioma de la versión anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForSequenceClassification) |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta de chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible (checkpoint de 3,6 MB; ejecutable en CPU sin cuantización) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, configurado como `LlamaForSequenceClassification` con `problem_type: multi_label_classification`. La salida se compone de una cabeza binaria safe/unsafe y diez categorías de seguridad evaluadas de forma independiente, de modo que una misma entrada puede activar varias etiquetas simultáneamente. En `transformers` 5.x o superior el pipeline aplica sigmoid automáticamente sobre las etiquetas multi-label; con `top_k=-1` se recuperan todas.

El entrenamiento combina ocho conjuntos de datos: Aegis-AI-Content-Safety-Dataset-1.0 (NVIDIA), Jigsaw Toxic Comment, Google Civil Comments, BeaverTails, lmsys/toxic-chat, databricks-dolly-15k, HateXplain y Jigsaw Multilingual Train Unique. La versión .9 incorpora 2.168 filas nuevas de variantes cortas de 2 a 6 palabras en en/cs/de/es/fr/it, envoltorios de ficción y roleplay, y las frases exactas señaladas en la revisión adversarial. Se aplican pesos positivos por categoría (ratio negativos/positivos sobre filas unsafe, con tope de 10x) y las categorías con F1 inferior a 0,3 se marcan como `cat_experimental` y no se reportan. La innovación técnica principal no está en el modelo sino en la capa de decisión: temperatura de calibración, umbrales por idioma ajustados sobre una mitad de tuning con partición test independiente, detección heurística de idioma que exige al menos dos evidencias de stopwords o diacríticos (con soporte para ěščřžů, ñ¿¡ y ґєії) y un pre-filtro determinista `must_catch_hit` que fuerza unsafe en CSAM y autolesión.

## Capacidades

- Clasificación binaria safe/unsafe con probabilidad calibrada por temperatura.
- Clasificación multi-etiqueta en diez categorías de seguridad (armas y explosivos, autolesión, CSAM, odio, entre otras; las de F1 bajo 0,3 quedan marcadas como experimentales).
- Procesamiento de documentos largos mediante contexto nativo de 4096 tokens y ruta de chunked-max.
- Multilingüe en ocho idiomas con umbrales de decisión específicos por idioma.
- Detección heurística de idioma basada en stopwords, diacríticos y script mayoritario.
- Pre-filtro determinista de patrones para casos críticos (CSAM y autolesión) independiente del idioma.
- Integración directa con el pipeline `text-classification` de `transformers` y con Text Embeddings Inference; compatible con endpoints.
- Interfaz de línea de comandos `censer.9` con UI interactiva en terminal.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en comunidades multilingües: el modelo clasifica cada mensaje en safe/unsafe y devuelve la categoría concreta, con umbrales por idioma que mantienen los falsos positivos por debajo del 5 % sobre texto benigno en los idiomas soportados.
- Filtro de entrada en aplicaciones de chat: al ejecutarse en CPU con un checkpoint de 3,6 MB, puede desplegarse delante de cualquier LLM generativo para bloquear prompts de armas, autolesión o CSAM antes de que lleguen al modelo principal.
- Filtro de salida en pipelines de agentes: la ruta de chunked-max permite analizar respuestas largas de hasta varios miles de tokens y forzar la retirada de contenido unsafe antes de mostrarlo al usuario.
- Moderación de contenido generado por usuarios en plataformas con requisitos de cumplimiento: la licencia Apache 2.0 y la ausencia de `trust_remote_code` facilitan la auditoría y el despliegue en infraestructura propia.
- Triaje previo en sistemas de revisión humana: la salida multi-etiqueta con scores calibrados permite priorizar la cola de revisión por categoría y por confianza, en lugar de un simple binario.
- Detección de autolesión y crisis en foros de apoyo: el pre-filtro determinista garantiza que las formulaciones cortas y coloquiales en cualquiera de los ocho idiomas se marquen como unsafe aunque el umbral lingüístico sea alto.
- Clasificación por lotes en entornos sin GPU: el tamaño del checkpoint permite procesar grandes volúmenes de texto en servidores estándar o en el borde de la red.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la partición de test de textdetox (mitad no usada para tuning) y a conjuntos held-out.

| Metrica | Resultado |
|---|---|
| F1 en test @ umbral 0,5 | 0,8239 |
| Recall en test @ umbral 0,5 | 0,7987 |
| FPR en test (mediana en idiomas soportados) | 3,8 % |
| Must-catch held-out (conjunto de 60 frases nunca vistas en entrenamiento) | 42/60 (70,0 %) |
| Must-catch en conjunto de entrenamiento (88 frases) | 84/88 (95,5 %) |
| Detección de idioma en frases de prueba de la revisión | 24/26 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo. La model card advierte que la métrica de HateXplain debe interpretarse como cota superior.

## Requisitos de hardware

- VRAM: no requiere GPU; el checkpoint ocupa 3,6 MB y se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria; cualquier GPU sirve para acelerar el procesamiento por lotes.
- Cabe en cualquier GPU consumer, incluida la gama integrada, y en dispositivos de borde.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference, ONNX Runtime, CLI `censer.9` y el paquete de GitHub `Jerry256254/censer.9`.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño del modelo sugiere inferencia en milisegundos por muestra en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Censer.9 | 903.552 | 4096 | 8 | Apache 2.0 | Clasificador de seguridad multi-etiqueta desde cero |
| Llama Guard (Meta) | no disponible en la informacion | no disponible | no disponible | licencia Llama | Clasificador de seguridad basado en LLM generativo |
| Aegis (NVIDIA) | no disponible en la informacion | no disponible | no disponible | no disponible | Conjunto de datos y modelos de seguridad |

No se dispone de datos de benchmarks comparativos directos entre Censer.9 y estos modelos en la información proporcionada; la comparación se limita a categoría funcional y licencia.

## Limitaciones y advertencias

- El F1 en test (0,8239) es el más bajo de todas las versiones publicadas del modelo; la model card lo reconoce explícitamente como el coste de mejorar must-catch, falsos positivos y calibración.
- La cobertura must-catch en el conjunto held-out es del 70,0 %, lo que implica que aproximadamente tres de cada diez formulaciones críticas nunca vistas pueden escapar del clasificador si no coinciden con el pre-filtro determinista.
- La detección de idioma es heurística y puede fallar en textos cortos, mezclados o con errores ortográficos; en esos casos se aplica el umbral global por defecto de 0,5.
- Checo y portugués no tienen umbral específico y usan el valor por defecto de 0,5.
- Las categorías con F1 inferior a 0,3 están marcadas como experimentales y no se reportan; su uso en producción no está validado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en textos ambiguos, sarcásticos o de ficción/roleplay, un área que la versión .9 intentó reforzar.
- El modelo no genera texto ni razona: no debe usarse como sustituto de un LLM para explicar decisiones de moderación.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre falsos negativos en CSAM o autolesión recae en el integrador; el pre-filtro determinista es una red de seguridad, no una garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.9
- Repositorio del paquete CLI: https://github.com/Jerry256254/censer.9
- Conjunto de datos Aegis: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Jigsaw Toxic Comment: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Google Civil Comments: https://huggingface.co/datasets/google/civil_comments
- BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- HateXplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Jigsaw Multilingual Train Unique: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique

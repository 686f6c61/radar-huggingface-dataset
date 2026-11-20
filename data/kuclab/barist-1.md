# KucLab/Barist.1

## Resumen

Barist.1 es un clasificador de texto multilingüe de seguridad de contenido desarrollado por KucLab. Se trata de un transformer decoder-only de 903.552 parámetros entrenado desde cero, diseñado para la tarea de moderación: emite una etiqueta binaria safe/unsafe junto con 10 categorías de seguridad en modo multi-label. Es el sucesor de la línea Censer (Censer.1–.9) y su relevancia radica en ofrecer un modelo extremadamente compacto (checkpoint de 3,6 MB) que se ejecuta en CPU, con contexto nativo de 4096 tokens y calibración de temperatura de las puntuaciones.

El modelo incorpora umbrales por idioma ajustados para una tasa de falsos positivos (FPR) objetivo ≤ 5 % con recall ≥ 80 % y un tope de 0,75, además de un pre-filtro determinista de "must-catch" que bloquea de forma dura CSAM y redirige los casos de autolesión a recursos de apoyo. Soporta ocho idiomas declarados (en, cs, de, es, fr, it, pt, ru), aunque el propio autor documenta el ucraniano como no soportado.

Su interés actual reside en la combinación de un tamaño mínimo con una ingeniería de calibración y umbrales por idioma poco habitual en modelos de moderación de código abierto, lo que lo hace desplegable en entornos con recursos muy limitados sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForSequenceClassification) |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos; ruta chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como NO soportado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Barist.1 es un transformer decoder-only de 903.552 parámetros configurado como `LlamaForSequenceClassification` con `problem_type: multi_label_classification`, de modo que la pipeline aplica sigmoid automáticamente sobre las salidas. Se carga con `transformers` sin necesidad de `trust_remote_code`. El modelo se entrenó desde cero (from-scratch) y se describe como destilado, con un contexto nativo de 4096 tokens; para documentos largos se emplea una ruta de chunked-max, ya que un único pase agrupa solo el último token y puede omitir contenido inseguro en el medio (F1 medido de 0,077 en 25 documentos sintéticos).

El entrenamiento se apoya en un conjunto de datasets de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. Entre las innovaciones destacables figuran la calibración por temperatura de las puntuaciones, umbrales por idioma con detección heurística de idioma, un pre-filtro regex determinista de must-catch (bloqueo duro de CSAM y enrutado de autolesión a `needs_support` con recursos como Linka bezpečí) y un ajuste de umbrales de categoría con precisión ≥ 0,7, reportando como máximo las dos categorías con mayor puntuación. La versión Barist.1 incorpora correcciones de una tercera revisión adversarial respecto a Censer.9, incluyendo 1.607 filas benignas emparejadas (minimal pairs) y la reducción del peso de must_catch de 40 a 8–12.

## Capacidades

- Clasificación binaria safe/unsafe de texto.
- Clasificación multi-label en 10 categorías de seguridad.
- Puntuaciones calibradas por temperatura.
- Umbrales específicos por idioma con detección heurística de idioma.
- Pre-filtro determinista must-catch para CSAM (bloqueo duro) y autolesión (redirección a recursos de apoyo con campo `override: "must_catch"` y etiqueta `needs_support`).
- Procesamiento de documentos largos mediante ruta chunked-max sobre el contexto nativo de 4096 tokens.
- Soporte multilingüe en en, cs, de, es, fr, it, pt y ru.
- Interfaz CLI interactiva (`barist.1`) y uso directo mediante `transformers`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en plataformas: el modelo clasifica cada mensaje como safe/unsafe y devuelve hasta dos categorías de seguridad, integrándose en pipelines de revisión previa a publicación con un coste computacional mínimo en CPU.
- Filtrado de contenido en foros multiidioma: gracias a los umbrales por idioma y al soporte de en, cs, de, es, fr, it, pt y ru, puede desplegarse como primera línea de defensa en comunidades europeas sin infraestructura GPU.
- Pre-filtro de seguridad en pipelines de LLM: al ser un clasificador de 3,6 MB, puede colocarse delante de un modelo generativo para bloquear entradas o salidas inseguras antes de que lleguen al usuario final.
- Detección de autolesión con enrutado a recursos de ayuda: el pre-filtro must-catch identifica menciones de autolesión y las marca como `needs_support`, permitiendo mostrar líneas de apoyo en lugar de un simple bloqueo.
- Moderación de documentos largos: la ruta chunked-max permite analizar artículos, hilos o transcripciones de más de 4096 tokens dividiéndolos en fragmentos y agregando el máximo de puntuación por chunk.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con un checkpoint de 3,6 MB, es adecuado para dispositivos edge, contenedores ligeros o funciones serverless donde no hay GPU disponible.
- Auditoría de datasets de entrenamiento: puede usarse para etiquetar grandes corpus de texto y detectar contenido inseguro antes de reutilizarlos en el entrenamiento de otros modelos.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| FPR en checo (held-out, 230 frases) | 6,5 % (15/230) | Objetivo ≤ 3 %; frases de revisión 13/13 seguras |
| F1 en documentos largos (25 filas sintéticas) | 0,077 | Pase único sin ruta chunked |
| F1 ucraniano (textdetox, @0,5) | ≈ 0,10 | Ucraniano documentado como no soportado |
| Recall en mitad de ajuste por idioma | ≥ 80 % | Requisito del ajuste de umbrales |
| Precisión de umbrales de categoría | ≥ 0,7 | Ajuste de categorías |

No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo sino un clasificador de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el checkpoint ocupa 3,6 MB y está pensado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo con holgura, pero es innecesaria.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU.
- Opciones de despliegue: `transformers` (pipeline de text-classification), CLI `barist.1`, paquete de GitHub (`pip install "git+https://github.com/Jerry256254/barist.1.git"`), text-embeddings-inference y endpoints compatibles. Formato ONNX disponible.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo se espera latencia muy baja en CPU, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barist.1 | 903.552 | 4096 tokens | Clasificación safe/unsafe multi-label | apache-2.0 | Hugging Face, GitHub |
| Censer.9 (predecesor) | no disponible | no disponible | Clasificación de seguridad | no disponible | Hugging Face, GitHub |
| Modelos de moderación basados en LLM (p. ej. Llama Guard) | no disponible en la información | no disponible | Clasificación de seguridad | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa se limita a la relación de sucesión con Censer.9 y a la categoría funcional.

## Limitaciones y advertencias

- El ucraniano no está soportado: el propio autor documenta F1 ≈ 0,10 en textdetox y falsos positivos en frases benignas como "Як справи, druже?".
- El FPR en checo en held-out es del 6,5 %, por encima del objetivo ≤ 3 %, lo que indica riesgo de falsos positivos en ese idioma.
- El pase único sobre documentos largos puede omitir contenido inseguro en el medio (F1 0,077 medido); es obligatorio usar la ruta chunked-max.
- El pre-filtro regex determinista puede generar sobre-bloqueos en contextos informativos o de apoyo; la versión Barist.1 lo restringe a formas en primera persona y amenazas directas, pero persiste el riesgo.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos o cortos, donde la detección de idioma recurre a "default".
- Los umbrales por idioma se ajustaron con tope de 0,75 y recall ≥ 80 %, lo que puede dejar pasar algunas amenazas en de/fr/it si la puntuación queda por debajo del umbral.
- Licencia apache-2.0 permite uso comercial, pero el despliegue en moderación de contenido conlleva responsabilidad legal y ética sobre los falsos negativos, especialmente en CSAM y autolesión.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.
- No es un modelo generativo: no debe esperarse razonamiento, código ni capacidades de agente.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Barist.1
- Repositorio GitHub: https://github.com/Jerry256254/barist.1
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Hate-speech-CNERG/hatexplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Dataset Intuit-GenSRF/jigsaw-multilingual-train-unique: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique

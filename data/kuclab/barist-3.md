# KucLab/Barist.3

## Resumen

Barist.3 es un clasificador de contenido de seguridad desarrollado por KucLab, un modelo decoder-only de transformer entrenado desde cero con solo 903.552 parámetros. Su función es doble: una clasificación binaria safe/unsafe y una clasificación multi-etiqueta en 10 categorías de seguridad (abuso sexual, autolesión, violencia, etc.). Es la continuación de la línea Censer (Censer.1 a Censer.9) y, según la model card, incorpora las correcciones de la quinta revisión adversarial del proyecto.

El modelo destaca por su tamaño extremadamente reducido (checkpoint de 3,6 MB) que le permite ejecutarse en CPU, manteniendo un contexto nativo de 4096 tokens con una ruta de "chunked-max" para documentos largos. Incorpora un pre-filtro determinista de "must-catch" para casos críticos (bloqueo duro de CSAM y derivación de autolesión a recursos de apoyo), umbrales por idioma calibrados por temperatura y un pipeline estándar de `transformers` sin necesidad de `trust_remote_code`.

Es relevante para desarrolladores que necesitan moderación de contenido multilingüe de bajo coste computacional en producción, especialmente en escenarios donde el despliegue en CPU o en dispositivos con recursos limitados es un requisito. Soporta ocho idiomas declarados (en, cs, de, es, fr, it, pt, ru), aunque el ucraniano se documenta explícitamente como no soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForSequenceClassification) |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible (checkpoint de 3,6 MB, ejecutable en CPU) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como no soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, configurado como `LlamaForSequenceClassification` con `problem_type: multi_label_classification`. La cabeza de clasificación aplica sigmoide automáticamente en el pipeline multi-etiqueta, por lo que se recomienda usar `top_k=-1` para obtener todas las puntuaciones. El contexto nativo es de 4096 tokens, con una ruta de chunked-max para procesar documentos que exceden esa longitud.

El entrenamiento se apoya en múltiples datasets de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. La model card detalla un proceso iterativo de revisión adversarial con fases M/N/O/P/Q que añadieron 3.056 filas (2.911 paráfrasis inseguras diversas con peso must_catch ×15–25 y 145 pares benignos de contraste). Se aplican umbrales por idioma calibrados con temperatura, con un tope de 0,75 y requisito de recall ≥ 80 % sobre la mitad de ajuste. Las puntuaciones están calibradas por temperatura (métrica ECE reportada).

Una innovación destacable es el pre-filtro determinista v3 basado en regex, que aplica bloqueo duro a CSAM, deriva autolesión a recursos de apoyo (`needs_support`, Linka bezpečí) y marca jailbreaks como `needs_review` en lugar de bloqueo duro. Además, existe un bloqueo duro por categoría: si `sexual_abuse` o `self_harm` superan 0,3, se fuerza `unsafe` con `override: category_block` en las tres rutas de inferencia.

## Capacidades

- Clasificación binaria safe/unsafe de texto.
- Clasificación multi-etiqueta en 10 categorías de seguridad (abuso sexual, autolesión, violencia, etc.), reportando como máximo las dos categorías con mayor puntuación.
- Detección multilingüe en ocho idiomas (en, cs, de, es, fr, it, pt, ru).
- Manejo de documentos largos mediante contexto nativo de 4096 tokens y ruta chunked-max.
- Pre-filtro determinista must-catch con bloqueo duro de CSAM y derivación de autolesión a recursos de apoyo.
- Detección de jailbreaks con marca `needs_review` (no bloqueo duro).
- Puntuaciones calibradas por temperatura (ECE reportado como métrica).
- Umbrales por idioma ajustables con criterios de FPR y recall.
- Ejecución en CPU sin GPU dedicada.
- Carga directa con `transformers` sin `trust_remote_code`.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo clasifica cada mensaje entrante como safe/unsafe y asigna categorías, permitiendo filtrar automáticamente contenido tóxico con un coste computacional mínimo al ejecutarse en CPU.
- Moderación de chats en tiempo real: con 903.552 parámetros y checkpoint de 3,6 MB, la latencia es adecuada para clasificar mensajes individuales en pipelines de chat sin necesidad de GPU.
- Filtrado previo en pipelines de generación de LLM: se puede usar como guardarraíl de entrada y salida para detectar prompts maliciosos o respuestas inseguras antes de mostrarlas al usuario, aprovechando el pre-filtro must-catch para casos críticos.
- Cumplimiento normativo en plataformas UGC: la clasificación multi-etiqueta y las puntuaciones calibradas permiten generar registros auditables de contenido marcado por categoría, útil para requisitos de moderación regulatoria.
- Moderación multilingüe en mercados europeos: cubre en, cs, de, es, fr, it, pt y ru, adecuado para plataformas con audiencias en Europa central y del este, aunque el ucraniano queda fuera del alcance declarado.
- Detección de autolesión con derivación a recursos: el modelo distingue contenido de autolesión y lo marca con `needs_support`, permitiendo a la plataforma mostrar líneas de ayuda en lugar de bloquear silenciosamente.
- Clasificación de documentos largos: la ruta chunked-max permite analizar artículos, hilos completos o transcripciones que superan los 4096 tokens sin truncar el contenido.
- Despliegue en dispositivos edge o entornos sin GPU: al ejecutarse en CPU, puede integrarse en servicios ligeros, contenedores pequeños o funciones serverless con presupuesto de memoria reducido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1@0.5 (test) | 0.8238 |
| Deteccion model-only heldout2 (raw @0.5) | 51/75 |
| Deteccion heldout2 via CLI (temperatura + umbrales por idioma) | 55/75 |
| FPR checo held-out | 10,0 % (23/230) |
| FPR checo eval (objetivo ≤ 3 %) | 6,5 % (15/230) |
| F1 ucraniano textdetox @0.5 | ≈ 0,10 (no soportado) |

La model card reporta además que Censer.9 obtenía 57/75 en detección raw sobre el conjunto heldout2, frente a los 51/75 de Barist.3, aunque con 55/75 a través de la ruta CLI completa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el checkpoint ocupa 3,6 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Una GPU no aporta ventajas significativas dado el tamaño del modelo.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (contenedores, serverless, dispositivos edge).
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo sugiere latencias de milisegundos en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barist.3 (KucLab) | 903.552 | 4096 | Clasificador de seguridad multi-etiqueta | Apache 2.0 | Hugging Face |
| Censer.9 (KucLab) | no disponible | no disponible | Predecesor del mismo proyecto | Apache 2.0 | Hugging Face / GitHub |
| Llama Guard (Meta) | no disponible en la informacion | no disponible | Clasificador de seguridad generativo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación con Censer.9 se limita a los datos de la model card: Barist.3 reporta 51/75 en detección raw frente a 57/75 de Censer.9, pero con mejoras en falsos positivos benignos en checo y en el manejo de CSAM/autolesión mediante bloqueo por categoría.

## Limitaciones y advertencias

- El ucraniano está documentado explícitamente como no soportado (F1 ≈ 0,10 en textdetox), a pesar de que el modelo incluye patrones ru-uk en el pre-filtro.
- El FPR en checo (10,0 % en held-out, 6,5 % en eval) supera el objetivo declarado de ≤ 3 %, lo que implica falsos positivos sobre texto benigno en ese idioma.
- Los umbrales por idioma están actualmente todos a 0,5, lo que equivale a estar efectivamente desactivados según la propia model card.
- El modelo es más débil que su predecesor Censer.9 en detección model-only sobre heldout2 (51/75 frente a 57/75), aunque la ruta CLI completa alcanza 55/75.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en textos ambiguos, slang, noticias o contextos culturales (la model card documenta falsos positivos históricos con expresiones como "Tyhle boty jsou bomba" o "morirò dal ridere").
- El pre-filtro regex puede generar falsos positivos si no se revisa; la model card indica que los jailbreaks se marcan como `needs_review` y no como bloqueo duro, pero el bloqueo por categoría (sexual_abuse/self_harm ≥ 0,3) puede forzar `unsafe` en casos límite.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y la responsabilidad de validación en producción recae en el integrador.
- El conjunto held-out original estaba contaminado (la regex contenía frases del held-out); la model card indica que se sustituyó por `mustcatch_heldout2.jsonl` (91 formulaciones nuevas), por lo que las métricas deben interpretarse con cautela.
- El script de inferencia conserva el nombre histórico `censer.py`, lo que puede generar confusión en la integración.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Barist.3
- Repositorio GitHub: no disponible en la información proporcionada (la model card menciona enlaces a archivos del repo GitHub, pero no se incluye la URL)
- Paper: no disponible
- Demo: no disponible

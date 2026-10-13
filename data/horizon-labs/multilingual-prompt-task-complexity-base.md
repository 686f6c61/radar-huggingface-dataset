# Horizon-Labs/multilingual-prompt-task-complexity-base

## Resumen

Multilingual prompt task & complexity classifier (base, 308M) es un modelo de clasificación de texto desarrollado por Horizon-Labs que analiza el *prompt* de un usuario dirigido a un LLM y devuelve dos tipos de etiquetas: el tipo de tarea (11 categorías heredadas de la taxonomía del clasificador de NVIDIA: open QA, closed QA, summarization, text generation, code generation, chatbot, classification, rewrite, brainstorming, extraction y other) y seis puntuaciones continuas de complejidad entre 0 y 1 (creatividad, razonamiento, conocimiento contextual, conocimiento de dominio, restricciones y complejidad global).

El modelo parte de jhu-clsp/mmBERT-base, un codificador multilingüe de la familia ModernBERT, y cuenta con 307.543.313 parámetros totales. Está pensado para enrutado de peticiones entre modelos baratos y modelos potentes, análisis de registros de conversación y equilibrado de datos de ajuste por instrucciones. Su valor diferencial frente a alternativas como el clasificador de NVIDIA es la cobertura multilingüe: se ha entrenado con prompts en 133 idiomas y se ha evaluado en 21 lenguas, con una precisión de tarea de 0,811 y una macro-F1 de 0,745, frente a 0,459 y 0,318 respectivamente del clasificador de NVIDIA (entrenado solo en inglés).

Se distribuye bajo licencia Apache-2.0, con pesos en safetensors y versiones ONNX (incluida una cuantizada en int8 de 641 MB) para ejecución en CPU y en el navegador mediante transformers.js. Existe además una variante más pequeña y rápida de 141M parámetros. El modelo no genera texto: es exclusivamente un clasificador de secuencias con 17 salidas sigmoideas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (ModernBERT, base jhu-clsp/mmBERT-base); cabeza de clasificación de secuencias con 17 salidas sigmoideas (11 de tarea + 6 de complejidad) |
| Parametros totales | 307.543.313 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo de entrada; solo se leen los primeros 512 tokens del prompt) |
| Tipos de cuantizacion | fp32 (safetensors y ONNX) e int8 para embeddings (onnx/model_quantized.onnx, 641 MB) |
| Idiomas soportados | Multilingüe; entrenado con 133 idiomas y evaluado en 21 (en, zh, ru, es, fr, de, pt, it, ar, tr, ja, ko, vi, id, pl, uk, hu, fa, hi, bn, sw) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8 cuantizado) |

Datos adicionales: tamaño del repositorio 3,1 GB; pipeline declarado `text-classification`; etiquetas de despliegue `text-embeddings-inference` y `endpoints_compatible`; fecha de creación 2026-10-13.

## Arquitectura y entrenamiento

La base es mmBERT-base, un codificador de la familia ModernBERT orientado a multilingüismo. Sobre él se añade una cabeza que produce 17 salidas sigmoideas independientes: 11 corresponden a la clasificación de tarea (se toma la de mayor valor como tipo de tarea predicho) y 6 a las dimensiones de complejidad. No hay generación autoregresiva ni caché KV, por lo que la inferencia es un único *forward pass* de codificación, con un límite estricto de 512 tokens de entrada.

El entrenamiento utilizó 172.690 prompts reales de usuario en 133 idiomas, extraídos de WildChat-1M (licencia ODC-BY, únicamente el texto del prompt, sin metadatos y excluyendo conversaciones marcadas como tóxicas), OASST2 y Aya (Apache-2.0), con un máximo de 3.000 prompts por idioma (20.000 en inglés y 8.000 en chino). Las etiquetas no son humanas: se generaron con Qwen3.8-27B (Apache-2.0), que respondió una pregunta de opción múltiple por prompt (tarea) y seis valoraciones de 0 a 9 por prompt (dimensiones). El modelo aprende como objetivos suaves las probabilidades de respuesta para la tarea y las valoraciones esperadas divididas entre 9 para las dimensiones. El *checkpoint* se seleccionó sobre 8.589 prompts reservados. El código de entrenamiento está disponible en el directorio `code/` del repositorio.

Como innovación práctica destaca la cuantización int8 de los embeddings: según el autor, `onnx/model_quantized.onnx` produce las mismas decisiones al umbral 0,5 en todas las salidas que fp32 para el 97,8% de 400 prompts de prueba.

## Capacidades

- Clasificación del tipo de tarea del prompt en 11 categorías: open QA, closed QA, summarization, text generation, code generation, chatbot, classification, rewrite, brainstorming, extraction y other.
- Puntuación de complejidad en seis dimensiones continuas (0-1): creatividad, razonamiento, conocimiento contextual, conocimiento de dominio, restricciones y complejidad global.
- Procesamiento multilingüe: entrenado con 133 idiomas, evaluado en 21, con especial énfasis en idiomas distintos del inglés.
- Ejecución en CPU y en navegador gracias a la exportación ONNX y a transformers.js.
- Integración con la librería transformers mediante `pipeline("text-classification")`, con `top_k=None` para obtener las 17 etiquetas.
- No soporta *tool calling* ni *function calling*: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso: estima la complejidad de razonamiento del prompt, pero no razona.
- No procesa visión, audio ni otras modalidades.
- No es un clasificador de seguridad: el autor remite a un modelo aparte (`content-safety-guard`) para prompts dañinos o con inyección.

## Casos de uso

- Enrutado de prompts entre modelos: el clasificador permite decidir si una petición se envía a un modelo pequeño y barato o a uno grande y costoso, tomando el tipo de tarea y las puntuaciones de razonamiento y complejidad como señal de enrutado. Está diseñado explícitamente para este escenario (`llm-routing`, `model-routing`).
- Analítica de registros de chat: procesar en lote los logs de conversaciones para obtener la distribución de tipos de tarea y niveles de complejidad del tráfico real, con el fin de dimensionar la capacidad o priorizar mejoras del producto.
- Curación y equilibrado de datos de ajuste por instrucciones: etiquetar grandes corpus de instrucciones para equilibrar la mezcla de tareas (por ejemplo, evitar que domine open QA frente a extraction o code generation) antes de un proceso de *fine-tuning*.
- Optimización de costes en pipelines RAG: clasificar la consulta de entrada antes de recuperar y generar, y aplicar plantillas de *prompt* o presupuestos de tokens distintos según la complejidad estimada, usando la versión ONNX int8 en CPU para no competir por GPU.
- Clasificación en el navegador con transformers.js: al incluir ONNX y ser compatible con transformers.js, permite etiquetar prompts en el cliente sin enviar el texto a un servidor, útil en aplicaciones con requisitos de privacidad.
- Priorización de colas de soporte y moderación de contenido: ordenar tickets o mensajes entrantes por complejidad estimada y tipo de tarea para asignar primero los que requieren razonamiento o conocimiento de dominio. Debe combinarse con un clasificador de seguridad independiente, ya que este modelo no lo es.
- Enrutado a modo de razonamiento extendido: detectar prompts con puntuaciones altas de razonamiento o restricciones y derivarlos a variantes con *thinking mode*, mientras que el resto se atiende con modelos estándar.
- Etiquetado multilingüe de corpus de investigación: anotar datasets en idiomas distintos del inglés (ruso, árabe, hindi, swahili, etc.) donde el clasificador de NVIDIA baja notablemente su precisión.

## Benchmarks y rendimiento

Evaluación sobre 4.200 prompts reales de usuario reservados de WildChat-1M (200 por cada uno de 21 idiomas, nunca usados en entrenamiento), etiquetados por un juez independiente, google/gemma-4-31b-it. La precisión y macro-F1 de tarea comparan la tarea con mayor puntuación; las dimensiones usan correlación de rangos de Spearman.

| Modelo | Precision tarea | Macro-F1 tarea | Precision tarea (ingles) | Precision tarea (media por idioma) | Creatividad | Razonamiento | Conocimiento contextual | Conocimiento de dominio | Restricciones | Complejidad | Media Spearman dimensiones | Nota |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (308M) | 0,811 | 0,745 | 0,850 | 0,811 | 0,791 | 0,746 | 0,603 | 0,703 | 0,890 | 0,711 | 0,741 | Multilingüe |
| Horizon-Labs/multilingual-prompt-task-complexity-small (141M) | 0,793 | 0,735 | 0,830 | 0,793 | 0,769 | 0,713 | 0,591 | 0,661 | 0,878 | 0,681 | 0,716 | Version reducida |
| nvidia/prompt-task-and-complexity-classifier (184M) | 0,459 | 0,318 | 0,655 | 0,459 | 0,478 | 0,250 | 0,230 | 0,385 | 0,648 | 0,347 | 0,390 | Ingles; datos anotados por humanos, definiciones propias |
| Qwen3.8-27B, con prompting (profesor, 27B) | 0,856 | 0,807 | 0,915 | 0,856 | 0,856 | 0,830 | 0,688 | 0,808 | 0,915 | 0,819 | 0,819 | Referencia |

Notas del autor: la tabla muestra el *checkpoint* publicado; las medias sobre 2 semillas de entrenamiento son para el modelo *small* 0,793 / 0,790 de precisión de tarea y 0,716 / 0,716 de Spearman en dimensiones, y para el *base* 0,811 / 0,813 y 0,741 / 0,740. La comparación con el clasificador de NVIDIA debe leerse con cautela: se entrenó con anotaciones humanas y directrices propias, por lo que parte del desacuerdo con el juez es de definiciones, no de errores; en inglés ambos coinciden en la tarea el 66% de las veces y fuera del inglés el acuerdo cae. Advertencia adicional: el juez y el profesor son ambos LLM y coinciden entre sí en el 86% de los casos, lo que favorece a este modelo en esta prueba.

## Requisitos de hardware

- Estimación de VRAM para inferencia con pesos en fp32: en torno a 1,2-1,5 GB (307,5M parámetros, unos 1,23 GB solo de pesos, más activaciones del *forward*).
- Estimación con fp16: en torno a 0,6-0,8 GB de pesos, más activaciones.
- Estimación con ONNX int8 para embeddings: 641 MB de archivo, por lo que cabe holgadamente en menos de 1 GB.
- Al no ser un modelo generativo no hay caché KV, y la ventana de 512 tokens limita el coste de activaciones. Cabe en cualquier GPU de consumo (GTX 1650 4 GB en adelante, RTX 3060, RTX 4090) y también en CPU.
- En GPU de centro de datos (A100, H100) el modelo está sobredimensionado para una sola petición; su uso razonable allí es inferencia por lotes de gran volumen, no latencia por petición.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, ONNX Runtime (incluido el modelo cuantizado para CPU), transformers.js en el navegador, y text-embeddings-inference según las etiquetas del repositorio. El repositorio está marcado como `endpoints_compatible`.
- vLLM, llama.cpp y Ollama no están indicados para este modelo: son entornos orientados a modelos generativos y no aplican a un codificador de clasificación.
- Latencia y throughput: no disponible (el autor no publica cifras de latencia ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision tarea (multilingue) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Horizon-Labs/multilingual-prompt-task-complexity-base | 308M | 512 tokens | 0,811 | 0,745 | Apache-2.0 | HuggingFace, safetensors + ONNX |
| Horizon-Labs/multilingual-prompt-task-complexity-small | 141M | 512 tokens | 0,793 | 0,735 | No disponible en la informacion proporcionada | HuggingFace |
| nvidia/prompt-task-and-complexity-classifier | 184M | No disponible en la informacion proporcionada | 0,459 (en ingles, 0,655) | 0,318 | No disponible en la informacion proporcionada | HuggingFace |
| Qwen3.8-27B con prompting (profesor) | 27B | No disponible en la informacion proporcionada | 0,856 | 0,807 | Apache-2.0 | Uso como referencia, no como clasificador especializado |

El modelo se sitúa entre la variante *small* (141M, algo menos precisa pero más rápida) y el profesor generativo de 27B (más preciso pero mucho más caro de ejecutar). Frente al clasificador de NVIDIA, la ventaja es la cobertura multilingüe y la precisión global; la comparación directa está condicionada por definiciones de etiqueta distintas.

## Limitaciones y advertencias

- Las etiquetas provienen de un LLM (Qwen3.8-27B), no de anotadores humanos, y las valoraciones de complejidad son subjetivas. Los autores recomiendan usar las puntuaciones para ordenar y enrutar, y validar los umbrales con tráfico propio.
- Solo se leen los primeros 512 tokens del prompt: prompts muy largos con instrucciones al final pueden clasificarse mal.
- Las puntuaciones de dimensión son relativas, no absolutas. La mayoría de los prompts puntúan bajo (medias de entrenamiento: complejidad 0,20; razonamiento 0,21; creatividad 0,29), por lo que deben compararse entre prompts o calibrarse con umbrales propios.
- No es un clasificador de seguridad: no detecta prompts dañinos ni intentos de inyección. Para ese fin el autor remite a otro modelo (`content-safety-guard`).
- Riesgo de sesgo derivado de la distribución de entrenamiento: WildChat-1M, OASST2 y Aya no representan por igual a todos los idiomas, y hay límites de muestreo (3.000 prompts por idioma, 20.000 en inglés, 8.000 en chino) que pueden provocar menor precisión en lenguas con pocos ejemplos.
- La evaluación se apoya en un juez LLM (google/gemma-4-31b-it) que coincide con el profesor en el 86% de los casos, lo que puede inflar los resultados a favor de este modelo.
- El rendimiento fuera del inglés, aunque es el punto fuerte declarado, sigue siendo inferior al inglés: 0,811 de media por idioma frente a 0,850 en inglés.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial, si bien conviene verificar las licencias de los datasets de origen (WildChat-1M es ODC-BY; OASST2 y Aya son Apache-2.0).
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de adopción en producción ni de validación independiente por terceros.
- Fecha de creación y actualización muy próximas entre sí (2026-10-13), señal de un lanzamiento reciente con poca trayectoria de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-prompt-task-complexity-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Versión reducida (141M): https://huggingface.co/Horizon-Labs/multilingual-prompt-task-complexity-small
- Clasificador comparable de NVIDIA: https://huggingface.co/nvidia/prompt-task-and-complexity-classifier
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Juez de evaluación citado por el autor: https://huggingface.co/google/gemma-4-31b-it
- Modelo de seguridad mencionado por el autor (`content-safety-guard`): enlace incompleto en la model card, no disponible
- Código de entrenamiento: directorio `code/` dentro del repositorio del modelo
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a entidades no relacionadas (concesionarios de automóviles, partidos políticos y emisoras de radio con el nombre "Horizon").

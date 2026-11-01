# magnitudedev/d1-2B-GGUF

## Resumen

d1-2B-GGUF es una cuantización en formato GGUF del modelo d1-2B de LiquidAI, publicada por el usuario magnitudedev en Hugging Face como re-upload de los pesos originales (commit `cfe5760`), con los pesos sin cambios salvo la cuantización. d1-2B es un modelo de decisión (decision model) de LiquidAI, una arquitectura orientada a responder consultas estructuradas de decisión (selección de opciones, puntuaciones, estimaciones, cajas delimitadoras) en lugar de a generación de texto libre extensa.

La particularidad de este repositorio es que añade metadatos de decisión (claves `decision.*` y una plantilla de chat `tokenizer.chat_template.decision`) extraídos de la configuración, calibración y código de referencia del modelo original. Estos metadatos permiten que la plataforma Magnitude (magnitude.run) sirva el modelo sin código específico por modelo, mientras que otros runtimes como llama.cpp u Ollama simplemente los ignoran.

Con aproximadamente 1.729 millones de parámetros y cuantizaciones desde Q4_K_M hasta Q8_0, más un proyector de visión en BF16 (`mmproj`), el modelo es adecuado para despliegues ligeros en GPU de consumo o CPU, en escenarios donde se necesitan respuestas de decisión de baja latencia: clasificación, puntuación, estimación numérica o detección visual con cajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (decision model) de LiquidAI, con soporte de visión mediante proyector mmproj; detalle de arquitectura base no disponible |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) y proyector de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); sin uso comercial para entidades con ingresos anuales superiores a 10 millones de USD |
| Formato de pesos | GGUF (re-upload cuantizado del original en safetensors) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/d1-2B, etiquetado como "decision model". En lugar de estar optimizado para generación conversacional extensa, está diseñado para producir respuestas de decisión estructuradas de tipos concretos: `noul` (sin respuesta/ninguna opción), `choice` (selección entre opciones), `multiple` (selección múltiple), `score` (puntuación), `read` (lectura de texto), `estimate` (estimación numérica) y `box`/`boxes` (cajas delimitadoras, lo que implica capacidad de comprensión visual). La presencia de un proyector de visión en BF16 (`mmproj-d1-2B-BF16.gguf`) confirma que el modelo acepta entradas multimodales de imagen.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO. La innovación principal de este repositorio no está en el entrenamiento sino en el empaquetado: las claves `decision.*` y la plantilla `tokenizer.chat_template.decision` incorporan la información de config, calibración y código de referencia directamente en el fichero GGUF, de modo que Magnitude puede exponer el modelo vía sus endpoints `/v1/systemone` y `/v1/decisions` sin adaptaciones por modelo.

## Capacidades

- Respuestas de decisión estructuradas: selección de opción única (`choice`), selección múltiple (`multiple`) y abstención (`noul`).
- Puntuación (`score`) y estimación numérica (`estimate`).
- Lectura y extracción de texto (`read`).
- Comprensión visual: salida de una o varias cajas delimitadoras (`box`, `boxes`) gracias al proyector de visión incluido.
- Uso conversacional básico (etiquetado como `conversational`), aunque su diseño está orientado a decisiones.
- Integración directa con Magnitude vía `/v1/systemone` y `/v1/decisions` sin código específico.
- No consta soporte de tool calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Clasificación de contenido a escala: dada una lista de opciones, el modelo devuelve la categoría correcta (`choice`) o varias (`multiple`) con baja latencia gracias a su tamaño de ~1,7 B parámetros, ideal para moderación o etiquetado masivo.
- Puntuación automática de textos: evaluar relevancia, sentimiento o calidad con salidas numéricas (`score`) integrables en pipelines de datos.
- Estimación numérica a partir de imágenes o texto: contar objetos, estimar atributos o extraer valores (`estimate`, `read`) en flujos de OCR y document intake.
- Detección visual ligera: localizar elementos en imágenes devolviendo una o varias cajas delimitadoras (`box`/`boxes`) sin necesidad de un modelo de detección dedicado, aprovechando el proyector mmproj.
- Sistemas de decisión con abstención: en aplicaciones donde responder incorrectamente es costoso, el tipo `noul` permite al modelo abstenerse cuando ninguna opción es válida.
- Despliegue en arista (edge): las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en portátiles o mini-PC con llama.cpp u Ollama para decisiones en tiempo real sin conexión a la nube.
- Integración con Magnitude: servir decisiones vía API estandarizada (`/v1/decisions`) sin mantener código de inferencia específico del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,73 B de parámetros, la variante Q4_K_M ocupa aproximadamente 1,0-1,2 GB y la Q8_0 alrededor de 1,8-2,0 GB; añadir el proyector de visión BF16 suma unos cientos de MB adicionales. El repositorio completo pesa 11,6 GB, lo que sugiere que incluye también pesos sin cuantizar o ficheros adicionales.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o más es suficiente (RTX 3060, RTX 4060, RTX 4090, o GPU de servidor); también es viable la ejecución en CPU por su tamaño reducido.
- Consumer GPU: cabe con holgura en prácticamente cualquier GPU de consumo actual, incluso en portátiles con GPU integrada potente para las cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio y la plataforma Magnitude, que aprovecha los metadatos de decisión para servir vía `/v1/systemone` y `/v1/decisions`.
- Latencia y throughput: no disponible; por tamaño (~1,7 B) y formato GGUF se espera latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Capacidades destacadas | Licencia |
|---|---|---|---|---|
| magnitudedev/d1-2B-GGUF | ~1,73 B | GGUF (Q4-Q8, mmproj BF16) | Decisiones estructuradas, visión con cajas, metadatos para Magnitude | LFM Open License v1.0 (restricción comercial >10M USD) |
| LiquidAI/d1-2B (original) | ~1,73 B | safetensors | Mismo modelo base, sin metadatos de decisión ni cuantizaciones GGUF | LFM Open License v1.0 |
| Modelos generativos ligeros de tamaño similar (p. ej. Qwen2.5-1.5B-Instruct) | ~1,5 B | safetensors, GGUF comunitario | Generación de texto libre, chat, código | Apache 2.0 (sin restricción por ingresos) |

La diferencia clave: d1-2B está especializado en respuestas de decisión estructurada y visión localizadora, mientras que los modelos generativos equivalentes en tamaño ofrecen chat y código pero no tipos de salida `choice`/`score`/`box` nativos ni abstención calibrada.

## Limitaciones y advertencias

- Restricción de licencia relevante: la LFM Open License v1.0 no permite el uso comercial a entidades con ingresos anuales iguales o superiores a 10 millones de USD; verifica esta cláusula antes de cualquier despliegue empresarial.
- El modelo no está diseñado para generación de texto largo ni conversación abierta; usarlo como chatbot general probablemente dé peores resultados que un LLM conversacional equivalente.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados ni datos de calibración en la model card, por lo que conviene evaluar la fiabilidad de las salidas `score`/`estimate` en tu dominio antes de producción.
- Idiomas soportados no documentados: no consta qué idiomas maneja; asume predominio del inglés hasta validar lo contrario.
- Longitud de contexto no publicada: no es posible planificar ventanas de contexto para entradas largas.
- Los metadatos `decision.*` solo son aprovechados por Magnitude; en llama.cpp u Ollama el modelo se comporta como un GGUF convencional y puede requerir plantillas de prompt manuales.
- Es un re-upload de terceros (magnitudedev), no oficial de LiquidAI; para soporte y actualizaciones, prioriza el repositorio original LiquidAI/d1-2B.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/magnitudedev/d1-2B-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/d1-2B
- Magnitude (plataforma de servicio): https://magnitude.run
- Licencia LFM Open License v1.0: https://huggingface.co/magnitudedev/d1-2B-GGUF/blob/main/LICENSE
- Paper, blog oficial y demo: no disponible

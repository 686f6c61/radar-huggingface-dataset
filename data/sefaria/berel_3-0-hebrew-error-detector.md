# Sefaria/BEREL_3.0-hebrew-error-detector

## Resumen

BEREL_3.0-hebrew-error-detector es un modelo de clasificación de tokens (token classification) desarrollado por Sefaria para detectar errores en textos digitales en hebreo rabínico. Se trata de un fine-tuning del modelo base dicta-il/BEREL_3.0, un encoder BERT de 183,7 millones de parámetros especializado en hebreo. El modelo etiqueta cada palabra de un pasaje como correcta (`ok`) o probablemente errónea (`error`), cubriendo daños de OCR, erratas tipográficas, palabras unidas o separadas incorrectamente y caracteres espurios.

El problema que resuelve es concreto: Sefaria alberga miles de textos hebreos, muchos digitalizados mediante OCR de ediciones impresas, con calidad heterogénea. Este detector permite señalar a los editores dónde empezar la corrección y estimar la calidad global de una versión textual antes de procesos posteriores como la traducción automática.

Es relevante porque aborda una tarea de humanidades digitales poco cubierta por modelos generalistas: la corrección post-OCR en hebreo rabínico, un dominio con convenciones ortográficas y abreviaturas propias que los modelos multilingües no manejan bien. El modelo está diseñado específicamente para literatura post-bíblica (Talmud, midrash, comentarios, códigos, responsa) y no para Tanaj, Targum ni textos con ortografía de manuscrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base dicta-il/BEREL_3.0) |
| Parametros totales | 183.756.290 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 word pieces (ventanas de hasta 200 palabras en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (he), con foco en hebreo rabínico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `AutoModelForTokenClassification` construido sobre BEREL_3.0, un encoder BERT adaptado al hebreo, con dos etiquetas (`ok`, `error`). Solo el primer word piece de cada palabra recibe la etiqueta. El entrenamiento usó entropía cruzada con la clase de error ponderada 10×, learning rate de 3e-5, batch de 64, 3 épocas sobre 120.000 chunks de hasta 256 word pieces empaquetados en límites de palabra, en bf16 sobre una A100. Se conservaron los pesos con mejor PR-AUC de validación (paso 5.500 de 5.625). Un barrido sobre el peso de los datos sintéticos (0, 0,5, 1,0) y el peso de la clase de error (3, 10) fijó esta configuración; entrenar 5 épocas no mejoró el resultado.

Los datos de entrenamiento provienen de las aproximadamente 1,05 millones de ediciones reales registradas por Sefaria sobre el hebreo de sus textos, reconstruidas en pares antes/después y clasificadas por reglas. Las correcciones que arreglan un error se convierten en datos de entrenamiento, etiquetando como error la palabra corregida en el texto previo. La precisión verificada manualmente sobre una muestra de 400 ediciones es de 0,88 para erratas, 0,94 para espaciado, 0,76 para OCR y 2 de 2 para caracteres basura. Se excluyeron sustituciones de palabras, adiciones o eliminaciones, ediciones solo de vocales, citas, formato y convenciones como la unión con maqaf. El resultado son 29.159 ventanas de hasta 200 palabras (1,4 % de palabras etiquetadas como error), divididas en 25.821 / 1.172 / 2.166 para entrenamiento, validación y test por pares (versión, libro), de modo que ningún libro aparece en dos particiones.

Cada ventana real se empareja con su versión corregida con todas las palabras etiquetadas como `ok`, para que el modelo no aprenda que todo pasaje contiene un error. Además se generaron 60.000 ventanas sintéticas con errores inyectados a partir de las estadísticas de confusión de las correcciones reales (sustituciones de una letra, sobre todo confusiones visuales de OCR como ר→ד, ס→ם, ו→י, כ→ב; deleciones, inserciones, uniones y separaciones), con un 15 % sin error, mezcladas a la mitad del peso de las ventanas reales.

## Capacidades

- Detección de errores a nivel de palabra en textos hebreos rabínicos, con una puntuación de probabilidad por palabra y un umbral recomendado de 0,872.
- Identificación de cuatro categorías de error: erratas tipográficas, problemas de espaciado (uniones y separaciones), daño de OCR y caracteres basura no hebreos.
- Estimación de la calidad global de una versión textual a partir de la proporción de palabras marcadas.
- Procesamiento por ventanas de hasta 256 word pieces con tokenización a nivel de palabra (`is_split_into_words=True`).
- Normalización integrada en el flujo de uso: eliminación de etiquetas HTML, niqqud y cantilación, y separación de palabras unidas con maqaf.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de tokens puro.
- Capacidad monolingüe: solo hebreo.

## Casos de uso

- Corrección post-OCR de ediciones digitalizadas: el modelo marca las palabras sospechosas de un texto recién digitalizado para que los editores prioricen la revisión donde hay más probabilidad de error, en lugar de releer el texto completo.
- Priorización de colas de proofreading en proyectos de digitalización: al puntuar cada palabra con una probabilidad, el equipo puede ordenar las tareas de revisión por densidad de errores detectados y asignar esfuerzo de forma proporcional.
- Evaluación de calidad de versiones textuales: calcular la proporción de palabras marcadas en una edición concreta permite decidir qué versiones necesitan corrección antes de alimentar pipelines de traducción automática u otros procesos posteriores.
- Control de calidad en pipelines de ingesta de textos hebreos: integrar el detector como paso previo a la publicación de un texto en una biblioteca digital, rechazando o marcando versiones por debajo de un umbral de calidad.
- Detección de problemas de segmentación de palabras: la categoría de espaciado (recall de 0,64 en test, la más alta de las tres) lo hace útil para localizar palabras unidas o separadas incorrectamente, frecuentes en OCR de ediciones rabínicas.
- Investigación en humanidades digitales: uso del modelo como herramienta de análisis para estudiar la distribución y tipología de errores en corpus hebreos digitalizados, o como componente de comparación en estudios sobre calidad de digitalización.
- Asistencia a editores humanos en la revisión de responsa y literatura rabínica posterior: el modelo señala candidatos y el editor decide, reduciendo el tiempo de revisión manual de pasajes extensos.

## Benchmarks y rendimiento

Resultados a nivel de palabra sobre la clase de error. El umbral (0,872) se eligió en validación y se aplicó a test. Validación y test incluyen la copia corregida de cada ventana.

| Modelo | PR-AUC validación | PR-AUC test | F1 test | Precisión test | Recall test |
|---|---|---|---|---|---|
| Este modelo | 0,422 | 0,323 | 0,392 | 0,395 | 0,390 |
| Marcar palabras no vistas en el texto de entrenamiento corregido | 0,132 | 0,139 | 0,093 | 0,051 | 0,490 |
| Marcar palabras que BEREL 3.0 encuentra improbables (masked-LM) | 0,050 | 0,040 | 0,112 | 0,071 | 0,272 |

Recall en test por tipo de corrección: espaciado 0,64, errata 0,33, OCR 0,34. El 42 % de los errores de test provienen de una edición muy revisada con convenciones propias (el Talmud de Jerusalén de Guggenheimer), lo que explica la mayor parte de la caída de validación a test. La precisión está subestimada: las palabras que nadie ha corregido todavía se etiquetan como `ok`, de modo que un error real encontrado en una parte no editada de una ventana cuenta como falso positivo; hay una verificación manual de palabras marcadas en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 183,7 millones de parámetros, la inferencia en fp32 requiere aproximadamente 0,75 GB solo para pesos, y en bf16 alrededor de 0,4 GB, más activaciones y overhead del runtime.
- GPU recomendadas: el entrenamiento se realizó en una A100; para inferencia basta con GPUs consumer. Una RTX 4090, RTX 3090 o incluso GPUs con 8 GB de VRAM son suficientes.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: transformers (librería nativa), y por compatibilidad con el ecosistema BERT, potencialmente vLLM, TGI o llama.cpp si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sefaria/BEREL_3.0-hebrew-error-detector | 183,7 M | 256 word pieces | Detección de errores en hebreo rabínico | Apache 2.0 | Hugging Face |
| dicta-il/BEREL_3.0 (base) | No disponible | No disponible | Modelo de lenguaje enmascarado en hebreo | No disponible | Hugging Face |
| Modelos multilingües tipo XLM-R o mBERT | No disponible | No disponible | Tareas generales multilingües | No disponible | Hugging Face |

El modelo base BEREL_3.0 no está especializado en detección de errores; el benchmark interno del autor muestra que marcar palabras según su improbabilidad bajo masked-LM obtiene un PR-AUC de test de 0,040, muy inferior al 0,323 de este fine-tuning, lo que evidencia el valor del ajuste específico. No se dispone de datos de benchmarks de otros detectores de errores en hebreo rabínico para una comparación directa.

## Limitaciones y advertencias

- El modelo está diseñado solo para obras post-bíblicas (Talmud, midrash, comentarios, códigos, responsa); no es adecuado para Tanaj, Targum ni textos con ortografía de manuscrito.
- El rendimiento en test es moderado: F1 de 0,392 y PR-AUC de 0,323, con recall especialmente bajo para erratas (0,33) y OCR (0,34).
- La precisión está subestimada por el método de etiquetado (errores reales en partes no editadas cuentan como falsos positivos), pero la verificación manual está pendiente.
- El 42 % de los errores de test provienen de una única edición con convenciones propias, lo que puede sesgar las métricas y limitar la generalización a otras ediciones.
- El uso para estimar la calidad de una versión textual está todavía en validación según el propio autor.
- Requiere normalización previa estricta (eliminación de HTML, niqqud y cantilación, separación de maqaf) y el tokenizador rápido; `BertTokenizer` da malos resultados con BEREL_3.0.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías.
- Capacidad monolingüe: no funciona con otros idiomas ni con hebreo moderno fuera del dominio rabínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sefaria/BEREL_3.0-hebrew-error-detector
- Modelo base: https://huggingface.co/dicta-il/BEREL_3.0
- Sefaria: https://www.sefaria.org
- Paper de referencia citado en los tags: arXiv:2208.01875 (https://arxiv.org/abs/2208.01875)

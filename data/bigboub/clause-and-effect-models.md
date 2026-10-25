# bigboub/clause-and-effect-models

## Resumen

Clause & Effect models es un repositorio que agrupa dos modelos ajustados (*fine-tuned*) publicados por el usuario bigboub como soporte del Space «Clause & Effect». No se trata de un único modelo, sino de dos artefactos con tareas distintas: un clasificador de cláusulas de términos de servicio (ToS) construido sobre `nlpaueb/legal-bert-base-uncased`, que asigna cada cláusula a una de tres categorías de equidad (`clearly_fair`, `potentially_unfair`, `clearly_unfair`), y un modelo de resumen sobre `facebook/bart-large-cnn` que genera una explicación en inglés sencillo de una cláusula, recibiendo como entrada la cadena `"{label}: {clause}"`.

El problema que aborda es concreto: los términos de servicio legales son largos, densos y rara vez se leen, de modo que un usuario no sabe qué cláusulas son abusivas ni qué implican en la práctica. El repositorio empaqueta en un solo identificador de HuggingFace la pieza de clasificación y la de explicación, lo que simplifica su consumo desde una aplicación o demo. Los pesos se almacenan en fp16 para reducir a la mitad el tamano de descarga del repositorio (1,0 GB), con la recomendación explícita de cargarlos como fp32 (`dtype=torch.float32`) para inferencia en CPU.

La relevancia es acotada y experimental: el repositorio acumula 0 descargas y 0 likes, su licencia no está declarada y solo se documentan resultados para el clasificador BERT (exactitud de 0,864 sobre 960 cláusulas de test). El modelo de resumen no incluye métricas publicadas en la información disponible. Es, por tanto, una pieza útil como referencia de pipeline legal NLP en inglés, no un componente listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos transformer: encoder BERT (clasificación, `bert/`) y encoder-decoder BART (resumen, `bart/`) |
| Parametros totales | No disponible en la ficha del autor; los modelos base son `nlpaueb/legal-bert-base-uncased` (variante BERT-base) y `facebook/bart-large-cnn` (variante BART-large) |
| Parametros activos | No aplica (ninguno de los dos modelos es MoE) |
| Longitud de contexto | No disponible en la ficha del autor; los modelos base de tipo BERT-base y BART-large operan con ventanas de 512 y 1024 tokens respectivamente |
| Tipos de cuantizacion | No se documentan cuantizaciones (GGUF, AWQ, GPTQ, etc.); los pesos se publican en fp16 y se recomienda cargarlos en fp32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tag del repositorio), organizados en subcarpetas `bert/` y `bart/` |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos independientes. El primero es un `AutoModelForSequenceClassification` derivado de `nlpaueb/legal-bert-base-uncased`, un encoder BERT preentrenado sobre corpus legal, ajustado para clasificación multiclase de tres etiquetas de equidad contractual. El segundo es un `BartForConditionalGeneration` derivado de `facebook/bart-large-cnn`, un encoder-decoder preentrenado para resumen de noticias y aquí reutilizado para producir resúmenes en inglés sencillo de una cláusula; la entrada se formatea como `"{label}: {clause}"`, es decir, se condiciona el resumen con la etiqueta de equidad predicha por el clasificador.

Los datos de ajuste citados son `CodeHima/TOS_DatasetV3` para la parte de clasificación (con un conjunto de test de 960 cláusulas) y `EE21/ToS-Summaries` para la parte de resumen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El ajuste descrito es de tipo supervisado estándar sobre ambas cabeceras.

## Capacidades

- Clasificación de cláusulas de términos de servicio en tres niveles de equidad: `clearly_fair`, `potentially_unfair` y `clearly_unfair`.
- Resumen generativo de una cláusula en inglés sencillo, condicionado por la etiqueta de equidad (`"{label}: {clause}"`).
- Procesamiento de texto legal en inglés a nivel de oración o cláusula individual.
- Integración directa con la librería `transformers` mediante `AutoTokenizer`, `AutoModelForSequenceClassification` y `BartForConditionalGeneration`, usando el parámetro `subfolder` para seleccionar cada pieza.
- Inferencia en CPU viable cargando los pesos en fp32.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.

## Casos de uso

- Auditoría de contratos de consumo: procesar un ToS por cláusulas con el clasificador BERT y marcar automáticamente los fragmentos etiquetados como `clearly_unfair` para revisión humana, reduciendo el volumen de texto que un analista debe leer.
- Asistente de consentimiento informado: mostrar al usuario, junto a cada cláusula potencialmente abusiva, el resumen en inglés sencillo generado por el modelo BART, de modo que entienda qué acepta antes de firmar o registrarse.
- Revisión de proveedores en compras: comparar los términos de servicio de varias herramientas SaaS y generar un listado de cláusulas desfavorables por proveedor, usando la etiqueta como criterio de priorización.
- Investigación académica en NLP legal: emplear el par clasificador-resumidor como *baseline* reproducible sobre `CodeHima/TOS_DatasetV3`, dado que se publican precision, recall y F1 por clase.
- Moderación de contenido contractual en plataformas: detectar en pipelines internos cláusulas de terceros que requieran escalado al equipo legal, con un umbral de confianza ajustable sobre la clase `potentially_unfair`.
- Demo educativa o prototipo de producto: el Space «Clause & Effect» sirve como referencia de cómo encadenar clasificación y generación en una única interfaz; el repositorio permite replicarlo en local cargando ambas subcarpetas.
- Enriquecimiento de un corpus legal: preetiquetar grandes colecciones de ToS con las tres clases para construir un dataset anotado que alimente un modelo posterior de mayor tamano.

## Benchmarks y rendimiento

Resultados del clasificador BERT sobre el conjunto de test de `CodeHima/TOS_DatasetV3` (960 cláusulas), según la model card:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| clearly_fair | 0,92 | 0,93 | 0,92 |
| potentially_unfair | 0,81 | 0,80 | 0,81 |
| clearly_unfair | 0,79 | 0,80 | 0,80 |
| **Exactitud global** | | | **0,864** |

No se han publicado resultados de benchmarks para el modelo de resumen BART (ni ROUGE ni métricas de legibilidad) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: no crítica. El repositorio completo ocupa 1,0 GB en fp16 (dos modelos); cargados en fp32 para CPU, el consumo de memoria del proceso es del orden de un par de gigabytes, sin necesidad de GPU.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU consumer con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es más que suficiente para ambos modelos por separado; A100 o H100 solo tendrían sentido para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: sí, ampliamente, incluso en GPUs de gama de entrada con 4 GB.
- Opciones de despliegue: `transformers` con PyTorch (vía indicada por el autor, usando `subfolder="bert"` y `subfolder="bart"`); el formato safetensors es compatible con TGI y con servidores de inferencia estándar. No se documenta soporte de llama.cpp, Ollama ni vLLM para este repositorio.
- Latencia y throughput: no disponibles. Al tratarse de un BERT-base y un BART-large, la inferencia en CPU es viable por cláusula individual, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigboub/clause-and-effect-models (BERT) | No disponible (base tipo BERT-base) | No disponible (base: 512 tokens) | Clasificación de equidad en 3 clases | No disponible | HuggingFace, 0 descargas |
| nlpaueb/legal-bert-base-uncased | ~110 M (BERT-base) | 512 tokens | Modelo base legal, sin cabecera de clasificación | No disponible en esta ficha | HuggingFace |
| bigboub/clause-and-effect-models (BART) | No disponible (base tipo BART-large) | No disponible (base: 1024 tokens) | Resumen condicionado por etiqueta | No disponible | HuggingFace, 0 descargas |
| facebook/bart-large-cnn | ~400 M (BART-large) | 1024 tokens | Resumen abstractivo genérico | No disponible en esta ficha | HuggingFace |

La comparación relevante es frente a sus propios modelos base: `legal-bert-base-uncased` aporta dominio legal pero no la clasificación de tres clases, y `bart-large-cnn` resume noticias, no cláusulas legales con condicionamiento por etiqueta. No se dispone de datos que permitan comparar su rendimiento con otros clasificadores de cláusulas abusivas.

## Limitaciones y advertencias

- El clasificador se entrenó sobre oraciones de ToS individuales y limpias; sobre documentos reales completos tiende a marcar como injusto parte del texto plantilla (por ejemplo, «These Terms are an agreement between you and ...»).
- El modelo no constituye asesoramiento legal, tal y como advierte el propio autor.
- Solo admite inglés; cualquier cláusula en otro idioma queda fuera de su ámbito.
- El modelo de resumen no publica métricas de calidad (ROUGE, fidelidad, legibilidad), por lo que su utilidad debe validarse empíricamente antes de usarlo.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; es un bloqueo para producción.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso externo ni mantenimiento; la fecha de actualización registrada es 2026-10-24.
- Riesgo de alucinación en el componente generativo: los resúmenes BART pueden omitir matices o introducir afirmaciones no presentes en la cláusula original.
- La precisión de 0,79-0,81 en las clases `potentially_unfair` y `clearly_unfair` implica una tasa de error no despreciable; el sistema debe plantearse como herramienta de triaje con revisión humana.
- El condicionamiento de la entrada del BART por la etiqueta predicha propaga los errores del clasificador al resumen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigboub/clause-and-effect-models
- Space «Clause & Effect»: https://huggingface.co/spaces/bigboub/clause-and-effect
- Modelo base del clasificador: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Modelo base del resumidor: https://huggingface.co/facebook/bart-large-cnn
- Dataset de clasificación: https://huggingface.co/datasets/CodeHima/TOS_DatasetV3
- Dataset de resúmenes: https://huggingface.co/datasets/EE21/ToS-Summaries

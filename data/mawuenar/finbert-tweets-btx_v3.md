# mawuenar/finbert-tweets-BTX_V3

## Resumen

El modelo `mawuenar/finbert-tweets-BTX_V3` es un clasificador de texto basado en la arquitectura BERT, publicado en HuggingFace bajo el pipeline `text-classification`. Por su identificador, se trata de un ajuste fino (fine-tuning) de FinBERT orientado a la clasificación de sentimiento en tuits de temática financiera, aunque la model card del autor no documenta explícitamente ni el dataset de entrenamiento ni la tarea exacta.

El repositorio cuenta con 109.484.547 parámetros reales según los pesos en safetensors, lo que coincide con el tamaño de un BERT-base (110M parámetros aproximadamente). El tamaño del repositorio es de 0,4 GB, consistente con pesos en precisión completa o media para ese número de parámetros.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: no tiene descargas ni likes, la model card es la plantilla automática de HuggingFace sin rellenar y no se declara licencia ni idiomas. Se debe tratar como un experimento personal sin validación pública ni documentación técnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, presumiblemente BERT-base por el recuento de parámetros) |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base admite típicamente 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes u ONNX/GGUF, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es BERT, un encoder transformer bidireccional con atención completa. El recuento de parámetros (109,48M) encaja con la configuración BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), aunque el autor no confirma la configuración exacta ni el checkpoint base del que parte. Por el nombre del modelo, se infiere un ajuste fino sobre FinBERT, pero no se aporta evidencia en la model card.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de las clases, el régimen de entrenamiento (fp32, fp16, bf16), hiperparámetros, ni si se aplicaron técnicas de regularización o balanceo de clases. Tampoco se documenta si hubo validación, partición train/test ni métricas de evaluación. La model card es la plantilla automática generada por HuggingFace y todos los campos relevantes aparecen como `[More Information Needed]`.

## Capacidades

- Clasificación de texto: la cabecera del pipeline indica `text-classification`, por lo que el modelo devuelve etiquetas y puntuaciones de probabilidad para una secuencia de entrada.
- Clasificación de sentimiento financiero (inferida por el nombre y la estirpe FinBERT, no confirmada por el autor): presumiblemente etiquetas del tipo positivo, negativo y neutro, aunque no se documenta el mapeo de etiquetas.
- Procesamiento de tuits: el sufijo `tweets` sugiere entrenamiento o adaptación a texto corto e informal, pero no hay confirmación técnica.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Análisis de sentimiento en redes sociales financieras: el modelo podría clasificar tuits sobre activos, empresas o criptomonedas en categorías de sentimiento, siempre que se valide previamente el mapeo de etiquetas y la calidad sobre el dominio objetivo. Es adecuado por su tamaño reducido y su presunta especialización, pero requiere validación empírica antes de usarlo en producción.
- Monitorización de reputación de marca en tiempo real: integrado en un pipeline de ingesta de tuits (por ejemplo, vía la API de X), permitiría etiquetar menciones y agregar métricas de sentimiento por ventana temporal. La latencia de un BERT-base en GPU es baja, lo que facilita el procesamiento por lotes.
- Señales auxiliares para estrategias de trading cuantitativo: el sentimiento extraído de tuits podría incorporarse como feature en modelos de predicción de volatilidad o volumen, tras un estudio de correlación y control de sesgos de muestra.
- Filtrado y priorización de alertas en mesas de análisis: clasificar automáticamente grandes volúmenes de mensajes cortos para que los analistas revisen primero los de sentimiento negativo o de alta intensidad.
- Investigación académica en finanzas conductuales: como herramienta de etiquetado para construir series de sentimiento sobre corpus de redes sociales, con la advertencia de que la falta de documentación exige una validación manual de una muestra.
- Clasificación de comentarios en foros de inversión (Reddit, StockTwits): el modelo podría adaptarse a estos dominios si el ajuste fino se realizó sobre texto similar; de lo contrario, requeriría reentrenamiento.
- Componente de un sistema de moderación o triaje: clasificar mensajes financieros como potencialmente alarmistas o manipuladores, aunque esta aplicación exige una calibración cuidadosa y revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 109,48M de parámetros ocupan aproximadamente 0,44 GB; en fp16, unos 0,22 GB. A ello hay que sumar el overhead del runtime (activaciones, buffers), por lo que en la práctica se puede ejecutar con menos de 1 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutar el modelo. Para procesamiento por lotes de alto throughput, una A100 o H100 aportan margen pero están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM disponible. También puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (el tag del repo lo indica), ONNX Runtime, y exportación a GGUF para llama.cpp aunque no está documentada. vLLM y TGI son compatibles con BERT, pero su valor añadido es menor en un modelo de este tamaño.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa para BERT-base en GPU moderna, se suelen alcanzar cientos o miles de secuencias por segundo en lotes, pero no se confirma para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mawuenar/finbert-tweets-BTX_V3` | 109,48M | no disponible | Clasificación de texto (presuntamente sentimiento financiero) | no disponible | HuggingFace, 0 descargas |
| `ProsusAI/finbert` | ~110M | 512 tokens | Sentimiento financiero (positivo/negativo/neutro) | no disponible en la información de esta ficha | HuggingFace, ampliamente usado |
| `yiyanghkust/finbert-tone` | ~110M | 512 tokens | Tono financiero (positivo/negativo/neutro) | no disponible en la información de esta ficha | HuggingFace, ampliamente usado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125M | 512 tokens | Sentimiento general en tuits | no disponible en la información de esta ficha | HuggingFace, ampliamente usado |

La comparación se basa en la categoría (clasificadores BERT-base para sentimiento) y no en datos verificados de rendimiento de este checkpoint concreto, ya que no se han publicado métricas. Los tres alternativos citados cuentan con documentación y validación pública, a diferencia de este modelo.

## Limitaciones y advertencias

- Model card vacía: todos los campos técnicos, de entrenamiento y de evaluación están sin rellenar, lo que impide verificar la procedencia de los datos, el proceso de ajuste fino y la calidad del modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; la ausencia de licencia explícita es un riesgo legal para cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano o solo en inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación y sesgo: como clasificador, no genera texto, pero puede producir etiquetas erróneas de forma sistemática si el dominio de entrenamiento difiere del de uso. No hay documentación sobre sesgos de muestra ni sobre el balance de clases.
- Sin métricas de evaluación: no se puede afirmar que el modelo supere a un baseline trivial ni a FinBERT original; se requiere una evaluación propia antes de cualquier uso.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Contexto presumiblemente limitado a 512 tokens (propio de BERT-base), no confirmado por el autor; los tuits suelen encajar, pero documentos largos requerirían truncamiento.
- Fecha de creación futura (2026-11-03) en los metadatos: conviene verificar la integridad del repositorio y la coherencia de los artefactos antes de confiar en él.
- No apto para generación de texto, razonamiento, código ni tareas agénticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mawuenar/finbert-tweets-BTX_V3
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://ml2co2.github.io/impact
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

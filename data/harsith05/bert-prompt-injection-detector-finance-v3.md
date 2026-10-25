# harsith05/bert-prompt-injection-detector-finance-v3

## Resumen

`harsith05/bert-prompt-injection-detector-finance-v3` es un checkpoint de la familia BERT publicado en Hugging Face por el usuario `harsith05` y etiquetado en el Hub como `text-classification`. El identificador del repositorio sugiere que se trata de un clasificador de texto orientado a detectar intentos de *prompt injection* en el dominio financiero, en su tercera iteración, aunque la model card no documenta explícitamente esta función: es una plantilla autogenerada por Hugging Face en la que todos los campos relevantes aparecen como «More Information Needed».

El modelo pesa 109.483.778 parámetros según los metadatos de safetensors, un tamaño coherente con la arquitectura BERT-base (~110 M). El repositorio ocupa 0,4 GB, lo que corresponde a pesos almacenados en fp32. No hay información publicada sobre datos de entrenamiento, idiomas, licencia, métricas de evaluación ni hiperparámetros.

La relevancia de este checkpoint es hoy básicamente exploratoria: acumula 0 descargas y 0 likes, no tiene model card sustantiva ni evaluación publicada, y su licencia no está declarada. Cualquier uso en producción requeriría una validación independiente del comportamiento real del modelo, que la información disponible no permite confirmar. Se trata, por tanto, de un artefacto a considerar únicamente como referencia o punto de partida experimental, no como un componente listo para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only); la model card no especifica la variante exacta (base/uncased o similar) |
| Parámetros totales | 109.483.778 (~109,5 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. Los BERT-base estándar se limitan a 512 tokens, pero este dato no está confirmado en la información proporcionada |
| Tipos de cuantización | No documentados. El repositorio contiene safetensors en fp32 (~0,44 GB); al ser un transformer estándar es convertible a fp16/int8/ONNX, pero no hay artefactos publicados |
| Idiomas soportados | No disponibles. El sufijo «finance» del identificador sugiere dominio financiero, sin que se declare el idioma |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño de repo: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada por los tags del Hub es `bert`, es decir, un transformer encoder-only con atención bidireccional completa, preentrenado originalmente con objetivos de masked language modeling y next sentence prediction en el caso del BERT original. El recuento de parámetros (109.483.778) encaja con la configuración BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), aunque la model card no confirma la configuración exacta ni el checkpoint del que deriva el ajuste fino.

No hay ningún dato disponible sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en clasificadores encoder-only), ni hiperparámetros, ni régimen de precisión. Tampoco se documenta si el ajuste se realizó sobre un corpus financiero real, sintético o aumentado, ni si existe un conjunto de validación separado. La única referencia técnica presente en la información es el enlace genérico a `arxiv:1910.09700` (Lacoste et al., 2019, calculadora de impacto ambiental), que aparece en la plantilla estándar y no describe el modelo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la salida esperada es una etiqueta (probablemente binaria: inyección / no inyección) con su puntuación de confianza. El número y nombre exactos de las etiquetas no están documentados.
- Detección de *prompt injection*: inferida únicamente del nombre del repositorio; no hay ejemplos, umbrales ni métricas que la respalden en la información disponible.
- Especialización de dominio financiero: sugerida por el sufijo «finance» del identificador, sin documentación que la confirme.
- Generación de texto: no soportada (encoder-only, sin cabeza de lenguaje).
- Tool calling / function calling: no soportado de forma nativa.
- Razonamiento multi-paso y uso como agente: no soportado; es un clasificador de una sola pasada.
- Capacidades multimodales (visión, audio) ni modo «thinking»: no disponibles.

## Casos de uso

Los siguientes escenarios son hipótesis de uso derivadas del pipeline declarado y del nombre del modelo, no capacidades verificadas. Deben validarse empíricamente antes de cualquier implantación.

- Filtro de entrada en asistentes financieros conversacionales: colocar el clasificador como *pre-prompt gate* que puntúa cada mensaje del usuario antes de enviarlo al LLM principal; con 109 M de parámetros la latencia por petición sería de milisegundos, lo que permite evaluar el 100 % del tráfico sin añadir coste apreciable.
- Moderación en banca conversacional: etiquetar conversaciones de soporte para detectar intentos de manipulación del asistente (por ejemplo, instrucciones para revelar el prompt del sistema o saltarse restricciones de compliance) y derivarlas a revisión humana.
- Protección de APIs internas de LLM: interceptar peticiones en un *gateway* que aplique el clasificador a cada prompt entrante, con *fallback* a bloqueo o a un modelo de mayor tamaño cuando la puntuación supere un umbral configurable.
- Etiquetado y auditoría de logs: procesar por lotes históricos de conversaciones para construir un corpus etiquetado de intentos de inyección, útil para *red teaming* interno y para reentrenar filtros posteriores.
- Evaluación comparativa de proveedores: usar el clasificador como juez auxiliar en pruebas de robustez frente a *jailbreaks* entre distintos modelos comerciales, aprovechando su bajo coste de inferencia en CPU.
- Guardarraíl en pipelines RAG financieros: puntuar los documentos y consultas que entran al recuperador para descartar contenido con instrucciones embebidas antes de que lleguen al modelo generador.
- Prefiltro en despliegues *edge* o en infraestructura sin GPU: al ocupar ~0,44 GB en fp32 y poder ejecutarse en CPU, encaja en entornos con recursos muy limitados donde no es viable un segundo LLM como guardián.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,44 GB de pesos en fp32; en la práctica, menos de 1 GB incluyendo activaciones y overhead del runtime para secuencias de hasta 512 tokens. En fp16, ~0,22 GB; en int8 dinámico, ~0,11 GB (conversiones no publicadas, a realizar por el usuario).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM es suficiente (GTX 1650, T4, RTX 3060/4090, A10, L4, A100). El modelo está muy por debajo de la capacidad de estas tarjetas; el cuello de botella será el *batching*, no la memoria.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos ocho años, e incluso en iGPU con memoria compartida.
- CPU: viable para producción de bajo volumen; un BERT-base en fp32 procesa del orden de decenas de secuencias por segundo por núcleo en hardware moderno (estimación orientativa, no medida sobre este checkpoint).
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` indica compatibilidad con ese servidor), ONNX Runtime, TorchServe o un servicio FastAPI propio con batching dinámico. vLLM incluye soporte de modelos de clasificación con *pooling* en versiones recientes, pero no hay confirmación de compatibilidad con este checkpoint concreto.
- Throughput y latencia: no disponibles. Como referencia de orden de magnitud para BERT-base en fp16 sobre A100 con lote grande, cabría esperar miles de secuencias por segundo; en CPU, decenas. Son estimaciones genéricas, no medidas sobre este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `harsith05/bert-prompt-injection-detector-finance-v3` | 109,5 M | No disponible | Sin benchmarks publicados | No disponible | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | Métricas GLUE públicas; no es un clasificador de injection | Apache 2.0 | Hugging Face, ampliamente utilizado |
| `protectai/deberta-v3-base-prompt-injection` | ~184 M (no verificado en esta ficha) | 512 tokens | Métricas publicadas por el autor en su model card | Consultar la model card del autor | Hugging Face, con descargas y uso extendido |
| `google-bert/bert-base-multilingual-cased` | ~178 M | 512 tokens | Métricas multilingües públicas; no especializado | Apache 2.0 | Hugging Face |

Nota: los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse en el Hub antes de citarlos; no se han podido contrastar con la información proporcionada en esta búsqueda. La comparación de rendimiento con este checkpoint no es posible porque no publica ninguna métrica.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada de Hugging Face; no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; en la práctica, la ausencia de licencia implica reserva de derechos por defecto en muchas jurisdicciones.
- Sin métricas de evaluación: no hay forma de conocer la tasa de falsos positivos y falsos negativos, crítica en un filtro de seguridad donde ambos errores tienen coste (bloqueo de usuarios legítimos frente a paso de ataques).
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de clasificación errónea y de confianza mal calibrada: la puntuación de salida no está validada como probabilidad calibrada.
- Sesgo de dominio desconocido: si el ajuste se hizo sobre un corpus financiero concreto, el rendimiento podría degradarse fuera de ese registro (lenguaje coloquial, otros idiomas, otros sectores).
- Idiomas no declarados: no se puede asumir soporte multilingüe; un BERT-base en inglés fallaría en prompts en castellano.
- Riesgo de *overfitting* a un conjunto de ataques concreto: los detectores de prompt injection suelen generalizar mal frente a técnicas no vistas (codificaciones, idiomas mezclados, ataques multi-turno).
- Contexto limitado a 512 tokens (si se confirma la configuración BERT-base): los prompts largos se truncarían, lo que permite ataques colocando la instrucción maliciosa más allá del límite.
- Señales de madurez muy bajas: 0 descargas, 0 likes, versión «v3» sin historial público de versiones anteriores, creado y actualizado con 12 segundos de diferencia, lo que sugiere una subida automatizada sin revisión.
- No apto para producción sin validación propia: se recomienda construir un conjunto de evaluación específico del dominio antes de considerarlo en cualquier flujo de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/harsith05/bert-prompt-injection-detector-finance-v3
- Referencia citada en la plantilla (calculadora de impacto ambiental, no describe el modelo): https://mlco2.github.io/impact
- Artículo asociado a esa referencia: https://arxiv.org/abs/1910.09700

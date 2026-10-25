# mohameddhameem/systemone-jev-qp

## Resumen

SystemOne-Jev qp es un clasificador binario de 33.360.385 parámetros (aproximadamente 33 M) que decide si una pregunta multi-hop debe responderse con un modelo pequeño o escalarse a uno grande. Lo desarrolla mohameddhameem y se presenta como un componente de enrutado («llm-routing») para pipelines de generación aumentada por recuperación: dado un par formado por la pregunta y los pasajes recuperados que vería el modelo pequeño, devuelve P(modelo grande), es decir, la probabilidad de que sea necesario el modelo grande para acertar. La decisión se toma comparando esa probabilidad con un umbral fijado en validación y almacenado en `systemone.json`.

Técnicamente es un cross-encoder MiniLM de la familia BERT, afinado desde nano-jev v1.0 (`sdmlai/nano-jev`), con cabecera de clasificación de texto. El par de modelos sobre el que se ha entrenado y evaluado es concreto: Qwen2.5-1.5B-Instruct respondiendo sobre los dos mejores párrafos de HotpotQA recuperados por nano-jev (modelo pequeño) frente a Qwen2.5-7B-Instruct respondiendo sobre los diez párrafos (modelo grande). La etiqueta positiva es «el grande es necesario»: el pequeño falla y el grande acierta, con puntuación indulgente y tau = 0,5.

Su relevancia es doble. Por un lado, ataca un problema de coste real en sistemas RAG multi-hop, donde enviar todas las consultas al modelo grande multiplica la factura. Por otro, el autor publica resultados honestos: en el split de test SLR de HotpotQA (1.481 preguntas, 1.303 limpias) el enrutador obtiene un AIQ de 0,670–0,674, sin mejora estadísticamente significativa frente a un umbral de entropía (+0,009, IC 95 % −0,003 a +0,022) ni frente al mejor enrutador de regresión logística en el mismo punto de decisión (+0,005, IC 95 % −0,002 a +0,015). Es, por tanto, un artefacto de investigación reproducible más que un componente validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM) configurado como cross-encoder con cabecera de clasificación de texto |
| Parámetros totales | 33.360.385 (aproximadamente 33 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El autor no publica la longitud máxima de entrada; la entrada es la pregunta más los dos pasajes recuperados por el modelo pequeño, concatenados |
| Tipos de cuantización | No disponible. El repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni ONNX en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (pesos y código), igual que nano-jev v1.0. Los datos de entrenamiento (HotpotQA) son CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | `text-classification` |
| Modelo base | `sdmlai/nano-jev` (nano-jev v1.0) |
| Dataset de entrenamiento | `hotpotqa/hotpot_qa` (split dev, subconjunto SLR) |
| Tamaño del repositorio | 0,4 GB (incluye semilla 0 en la raíz y `seed1/`, `seed2/`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: codifica conjuntamente la pregunta y los pasajes candidatos y produce una probabilidad de escalado, en lugar de comparar embeddings independientes. Parte de nano-jev v1.0, un MiniLM de 33 M de parámetros, y añade una cabeza de clasificación binaria. La innovación no está en la arquitectura, sino en el punto de decisión: el enrutador evalúa la consulta antes de que el modelo pequeño genere la respuesta, usando únicamente la pregunta y los dos párrafos que el pequeño tendría disponibles. Esto permite ahorrar la llamada al pequeño cuando se decide escalar directamente.

El entrenamiento usa entropía cruzada con softmax agrupado (grouped-softmax cross-entropy) sobre las 4.814 preguntas de entrenamiento del split SLR (derivado de HotpotQA dev). La etiqueta se construye comparando los aciertos de ambos modelos con puntuación indulgente y tau = 0,5: positivo si el pequeño falla y el grande acierta. Hiperparámetros: learning rate 5e-5, batch de 16, hasta 3 épocas, conservando la época con menor NLL sobre un 10 % reservado para validación. Se publican tres semillas (0 en la raíz, 1 y 2 en subcarpetas) con el registro completo en `training.json`, incluida la pérdida por época.

## Capacidades

- Clasificación binaria de escalado: devuelve P(modelo grande) para una pregunta y sus pasajes, mediante `router.p_escalate(question, passages)`.
- Enrutado coste-calidad en pipelines RAG: la decisión se toma antes de invocar al modelo pequeño, comparando la probabilidad con el umbral de `systemone.json`.
- Ensemble de semillas: las tres semillas pueden promediarse para obtener una probabilidad más estable (el autor no publica umbral para el ensemble; debe elegirse en validación propia).
- Integración como `transformers` estándar con `AutoModelForSequenceClassification`-style pipeline de `text-classification` (etiquetas del repositorio: `text-embeddings-inference`, `endpoints_compatible`).
- Reproducibilidad: `route.py` del repositorio reproduce exactamente las puntuaciones guardadas en bf16 sobre GPU.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-step por sí mismo: es un clasificador, no un modelo generativo.
- Multilingüe: no. Entrenado y evaluado únicamente en inglés.

## Casos de uso

- Enrutado en RAG multi-hop sobre dominios tipo HotpotQA: antes de responder, el sistema calcula P(modelo grande) con la pregunta y los dos párrafos recuperados; si supera el umbral, se salta el modelo pequeño y se llama al grande con los diez párrafos. Reduce el coste por consulta cuando el pequeño habría fallado igualmente.
- Control de coste en producción: el propio autor mide un coste de 0,000 unidades por pregunta para el enrutador en la escala de precios de AgentTTS (tabla 5), frente al coste de cada llamada de respuesta, lo que hace económicamente viable evaluar todas las consultas.
- Comparación de políticas de enrutado en investigación: sirve como línea base reproducible frente a umbrales de entropía y regresores logísticos, con AIQ e intervalos por bootstrap pareado ya publicados.
- Sustitución de heurísticas frágiles: donde hoy se usa la longitud de la pregunta o la confianza del modelo pequeño, el cross-encoder aporta una señal supervisada sobre 4.814 ejemplos etiquetados con aciertos reales de ambos modelos.
- Filtrado previo en sistemas de atención al cliente con base documental en inglés: las consultas que requieren composición de información de varios documentos se derivan a un modelo mayor, mientras las directas se resuelven con el pequeño.
- Ensemble para decisiones sensibles al coste: promediar las tres semillas reduce la varianza de la probabilidad; el autor desaconseja reutilizar el umbral publicado y pide recalibrarlo sobre validación propia.
- Ajuste fino barato en hardware de consumo: con 33 M de parámetros y 4.814 ejemplos de entrenamiento, es viable reentrenar el enrutador para un par de modelos distinto en una sola GPU consumer.
- Docencia y prototipado de enrutadores: el paquete `systemone-jev` y `route.py` permiten montar un enrutador funcional en pocas líneas, con la salvedad de que la ganancia medida frente a las líneas base no es significativa.

## Benchmarks y rendimiento

Split de test SLR de HotpotQA: 1.481 preguntas (178 presentes en el entrenamiento de nano-jev; se muestran también las 1.303 limpias). Métrica AIQ: área bajo la curva precisión-coste. Coste según el precio por llamada de respuesta de AgentTTS (tabla 5). Intervalos: bootstrap pareado sobre las 1.481 preguntas.

| Política | AIQ | IC 95 % |
|---|---|---|
| Semilla 0 (carpeta raíz) | 0,670 | no disponible |
| Ensemble de tres semillas | 0,674 | [0,654; 0,697] |
| Ensemble de tres semillas, 1.303 preguntas limpias | 0,670 | no disponible |
| Semillas individuales, media ± desviación típica | 0,672 ± 0,001 | no disponible |
| Umbral de entropía sobre el modelo pequeño | 0,665 | [0,645; 0,686] |
| Mejor enrutador de regresión logística, mismo punto de decisión | 0,669 | [0,649; 0,689] |
| Oráculo (cota superior) | 0,758 | no disponible |

Diferencias del enrutador frente a las líneas base (bootstrap pareado al 95 %):

| Comparación | Diferencia de AIQ | IC 95 % | ¿Significativa? |
|---|---|---|---|
| Frente a umbral de entropía | +0,009 | [−0,003; +0,022] | No |
| Frente a mejor regresión logística, mismo punto de decisión | +0,005 | [−0,002; +0,015] | No |

El autor concluye explícitamente que los resultados no muestran ganancia de precisión frente a las líneas base. En cuanto a la estabilidad numérica: las puntuaciones guardadas se calcularon en bf16 sobre GPU y `route.py` las reproduce exactamente; en CPU en fp32 difieren hasta 6,5e-03 entre las tres semillas, lo que cambia la decisión de enrutado en 1 de las 1.481 preguntas con el umbral de la carpeta raíz (como máximo 1 con el umbral propio de cada semilla). No se publican MMLU, HumanEval ni GSM8K, que no aplican a un clasificador de enrutado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 33,36 M de parámetros, los pesos ocupan aproximadamente 67 MB en fp16/bf16 y 134 MB en fp32; el resto del consumo depende de la longitud de entrada y del batch.
- GPU recomendadas: cualquier GPU con 2 GB o más sirve; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para este modelo.
- CPU: inference viable en CPU. El propio autor documenta ejecución en CPU fp32, con desviaciones de hasta 6,5e-03 en las puntuaciones respecto a bf16 en GPU.
- Despliegue: `transformers` (pesos safetensors), paquete `systemone-jev` con `Router.from_pretrained(...)`, y etiquetas del repositorio para `text-embeddings-inference` y `endpoints_compatible`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, ni existen variantes GGUF publicadas.
- Latencia y throughput: no disponibles. No se publican medidas de latencia por consulta ni de peticiones por segundo.
- Almacenamiento: el repositorio completo ocupa 0,4 GB porque incluye las tres semillas; una sola semilla requiere una fracción de ese espacio.

## Comparativa con modelos similares

El autor compara su enrutador con dos políticas de la misma categoría y mismo punto de decisión (antes de que el modelo pequeño responda), además de la cota superior. No se dispone de datos de parámetros, contexto ni licencia de esas líneas base en la información proporcionada.

| Política | Tipo | AIQ | ¿Requiere entrenamiento? | Diferencia frente a SystemOne-Jev qp |
|---|---|---|---|---|
| SystemOne-Jev qp (ensemble) | Cross-encoder MiniLM de 33 M | 0,674 [0,654; 0,697] | Sí, 4.814 ejemplos etiquetados | — |
| Umbral de entropía sobre el modelo pequeño | Heurística sin entrenamiento | 0,665 [0,645; 0,686] | No | +0,009 a favor del enrutador, no significativo |
| Regresión logística en el mismo punto de decisión | Clasificador lineal | 0,669 [0,649; 0,689] | Sí | +0,005 a favor del enrutador, no significativo |
| Oráculo | Cota superior teórica | 0,758 | No aplica | −0,084 frente al oráculo |

| Modelo relacionado | Relación | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| `sdmlai/nano-jev` (nano-jev v1.0) | Modelo base del que se afina | 33 M (el afinado tiene 33.360.385) | No disponible | MIT |
| Qwen2.5-1.5B-Instruct | Modelo pequeño del par evaluado | No disponible en la información proporcionada | No disponible | No disponible |
| Qwen2.5-7B-Instruct | Modelo grande del par evaluado | No disponible en la información proporcionada | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos. El modelo se entrena sobre HotpotQA, un corpus en inglés de preguntas multi-hop basadas en Wikipedia, por lo que hereda su cobertura temática y su sesgo de dominio.
- Alucinación: el enrutador no genera texto, pero su error se propaga. Un falso negativo (P(modelo grande) por debajo del umbral cuando el grande era necesario) produce una respuesta incorrecta del modelo pequeño sin señal de aviso al usuario.
- Sin ganancia demostrada: las mejoras frente al umbral de entropía y frente a la regresión logística no son estadísticamente significativas. Adoptarlo no está justificado por precisión, solo por otros factores operativos.
- Generalización limitada: entrenado y evaluado con un único par de modelos y un único dataset (HotpotQA, split SLR). El umbral está calibrado para ese par; con otro par o otro corpus hay que recalibrarlo sobre validación propia.
- Idioma: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Reproductibilidad numérica: las puntuaciones en CPU fp32 difieren hasta 6,5e-03 de las de GPU bf16, lo que altera decisiones cerca del umbral. Fijar el backend y la precisión en producción.
- Sin umbral para el ensemble: el autor no publica uno; debe elegirse con datos propios.
- Licencia de los datos: los pesos y el código son MIT, pero HotpotQA es CC BY-SA 4.0 y el autor advierte de que no está resuelta la aplicabilidad de la cláusula share-alike a pesos entrenados sobre esos datos, sin afirmar que no aplique. Conviene revisión legal antes de uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. Es un artefacto de investigación, no un componente con historial de producción.
- La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-jev-qp
- Repositorio de código (entrenamiento, evaluación y `route.py`): https://github.com/mohameddhameem/systemone-jev
- Modelo base nano-jev v1.0: https://huggingface.co/sdmlai/nano-jev
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Figura de AIQ por política (en el repositorio del modelo): `figures/aiq.png`
- Figura de precisión frente a coste (en el repositorio del modelo): `figures/cost_accuracy.png`
- Registro de entrenamiento y pérdida por época: `training.json` en el repositorio del modelo
- Configuración del umbral de decisión: `systemone.json` en el repositorio del modelo
- Búsqueda web: sin resultados relevantes; las entradas devueltas correspondían a páginas de Vinted sin relación con el modelo.

# Jnjnpx/fine-tuned-bert-extractive-summarization

## Resumen

`Jnjnpx/fine-tuned-bert-extractive-summarization` es un modelo BERT afinado para la summarización extractiva de noticias en lengua lao (`lo`). Lo desarrollan Phayphone Phonboulom y Phonexay Inkhamseng partiendo de `Twitter/twhin-bert-base`, un BERT multilingüe preentrenado sobre datos de redes sociales, y lo afinan sobre el dataset LaoNews, construido por web scraping de KPL y Vientiane Mai.

El modelo no genera texto nuevo: formula la summarización como una tarea de clasificación a nivel de frase, etiquetando qué oraciones del artículo original deben formar el resumen. Esto lo sitúa en la categoría de modelos encoder-only, con 278.830.082 parámetros y pesos en safetensors, y una licencia Apache 2.0 que permite uso comercial.

Su relevancia es acotada pero clara: cubre un hueco real en PNL para una lengua de bajos recursos como el lao, donde existen muy pocos modelos publicados. No obstante, las métricas reportadas (F1 de 0,6961) y la ausencia de benchmarks comparativos obligan a tratarlo como un artefacto de investigación más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer bidireccional), derivado de `Twitter/twhin-bert-base` |
| Parametros totales | 278.830.082 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuración del tokenizador de `twhin-bert-base`; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados en el repo) |
| Idiomas soportados | Lao (`lo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | `Twitter/twhin-bert-base` |
| Dataset de ajuste | LaoNews (KPL y Vientiane Mai) |
| Framework de entrenamiento | Transformers 4.39.3, PyTorch 2.3.0+cu121 |
| Tamano del repo | 24,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de la familia BERT, heredada de `Twitter/twhin-bert-base`, que aporta un preentrenamiento multilingüe sobre grandes volúmenes de texto de redes sociales. El ajuste fino reformula la summarización extractiva como clasificación binaria a nivel de oración: cada oración del artículo recibe una etiqueta que indica si pertenece o no al resumen. El pipeline declarado en Hugging Face es `text-classification`, coherente con este planteamiento.

El entrenamiento usó el dataset LaoNews, recolectado por scraping de KPL (`kpl.gov.la`) y Vientiane Mai (`vientianemai.com`); la model card no documenta tamaño del dataset, fechas de recolección, preprocesado, método de anotación ni particiones train/validation/test. Los hiperparámetros sí están publicados: learning rate 2e-5, batch de entrenamiento 16 con acumulación de gradiente de 2 pasos (batch efectivo 32), optimizador Adam con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup, 3 épocas, semilla 42 y precisión mixta AMP nativa. No se menciona RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste fino supervisado convencional.

## Capacidades

- Clasificación de oraciones para summarización extractiva de noticias en lao: identifica qué fragmentos del texto original deben incluirse en el resumen.
- Salida de etiquetas a nivel de oración (text-classification), no generación abstractiva.
- Entrenado específicamente sobre registro periodístico (KPL y Vientiane Mai), por lo que está ajustado al estilo de noticias oficiales lao.
- Capacidad multilingüe potencial heredada del modelo base `twhin-bert-base`, aunque solo el lao está declarado y evaluado.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No está diseñado para conversación multi-turno ni para razonamiento multi-paso.

## Casos de uso

- Resumen de teletipo de noticias lao: dado un artículo de KPL o Vientiane Mai, el modelo puntúa cada oración y un postprocesado selecciona las de mayor probabilidad para construir un resumen extractivo. Adecuado porque se entrenó exactamente sobre ese dominio y registro.
- Indexación y búsqueda en agregadores de noticias lao: generar resúmenes de una o dos frases por artículo para mejorar snippets de búsqueda y listados, reduciendo el coste frente a un modelo generativo.
- Investigación en PNL para lenguas de bajos recursos: servir como línea base reproducible para experimentos de summarización en lao, con hiperparámetros y métricas publicados.
- Filtrado y triaje editorial: marcar automáticamente las oraciones candidatas a titular o entradilla para revisión humana, dado que el modelo es extractivo y nunca inventa contenido fuera del artículo.
- Enriquecimiento de pipelines RAG sobre corpus lao: usar las oraciones seleccionadas como unidades de recuperación o como contexto comprimido antes de pasarlo a un LLM generativo.
- Prototipado de aplicaciones de noticias en lao: integrar el modelo vía `transformers` o `text-embeddings-inference` (el repo declara endpoints compatibles) para demos y validación de producto.
- Análisis de accesibilidad y lectura rápida: producir versiones condensadas de artículos largos para lectores con poco tiempo, siempre con revisión humana por las limitaciones de cobertura semántica del enfoque extractivo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación de LaoNews (no hay comparación con otros modelos publicada):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,5566 |
| Accuracy | 0,6995 |
| Precision | 0,6947 |
| Recall | 0,6995 |
| F1 | 0,6961 |

Evolución por época según la model card:

| Training loss | Epoca | Step | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| 0,5748 | 1.0 | 7107 | 0,5609 | 0,6916 | 0,6858 | 0,6916 | 0,6873 |
| 0,5552 | 2.0 | 14215 | 0,5659 | 0,6839 | 0,6931 | 0,6839 | 0,6870 |
| 0,5364 | 3.0 | 21321 | 0,5566 | 0,6995 | 0,6947 | 0,6995 | 0,6961 |

El model-index del repo no contiene entradas de resultados adicionales. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M parámetros × 4 bytes), más activaciones y overhead; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: en torno a 0,56 GB para pesos; también viable en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); para lotes grandes o servicio concurrente, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU consumer: sí, en todas las RTX y en muchas iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (el repo declara `endpoints_compatible`), exportación a ONNX; no se documentan pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de ~279 M parámetros, la latencia esperada es de milisegundos por artículo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jnjnpx/fine-tuned-bert-extractive-summarization` | 278,8 M | no disponible | Clasificación de oraciones para resumen extractivo en lao | Apache 2.0 | Hugging Face (9 descargas, 2 likes) |
| `Twitter/twhin-bert-base` | ~278 M | no disponible | Modelo base multilingüe (encoder BERT) | no disponible en la información | Hugging Face |
| `FacebookAI/xlm-roberta-base` | ~278 M | 512 tokens | Modelo base multilingüe (encoder) | MIT | Hugging Face |
| `google/mt5-base` | ~580 M | 512 tokens | Seq2seq multilingüe (resumen abstractivo) | Apache 2.0 | Hugging Face |

No se conocen modelos públicos comparables específicamente afinados para summarización extractiva en lao; la comparativa anterior se limita a alternativas de la misma familia y tamaño como base o para enfoques abstractivos.

## Limitaciones y advertencias

- Evaluación restringida al conjunto LaoNews: el rendimiento en otros dominios o estilos de escritura no está establecido.
- Los resúmenes extractivos pueden omitir contexto importante o incluir información redundante.
- Las métricas de accuracy, precision, recall y F1 no miden directamente legibilidad ni completitud del resumen final.
- F1 de 0,6961 sobre el conjunto propio es moderado; se recomienda revisión humana frente al artículo original cuando la precisión importa.
- Dataset de entrenamiento escasamente documentado: sin tamaño, fechas, preprocesado, anotación ni particiones, lo que dificulta reproducir o auditar el ajuste.
- Sesgos potenciales derivados de las fuentes (KPL, medio estatal, y Vientiane Mai): cobertura sesgada hacia la línea editorial de esos medios.
- Riesgo de alucinación bajo en sentido estricto (es extractivo), pero riesgo de selección errónea de oraciones que distorsione el significado.
- Cobertura lingüística limitada al lao; no hay evaluación multilingüe aunque el modelo base lo permita.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de scraping y los derechos sobre las noticias originales deben verificarse por separado.
- Adopción muy baja (9 descargas, 2 likes) y sin benchmarks comparativos externos: tratar como artefacto de investigación, no como componente de producción sin validación propia.
- Longitud de contexto no documentada; artículos largos pueden requerir truncado o segmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jnjnpx/fine-tuned-bert-extractive-summarization
- Modelo base: https://huggingface.co/Twitter/twhin-bert-base
- Fuente de noticias KPL: https://kpl.gov.la/
- Fuente de noticias Vientiane Mai: https://vientianemai.com/

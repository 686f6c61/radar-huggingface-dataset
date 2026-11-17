# bariscagliyan/cabm-cub200

## Resumen

CaBM (Caption Bottleneck Models) es un clasificador de texto basado en `roberta-base` que forma parte de un pipeline de clasificación de imágenes por cuello de botella de subtítulos. El modelo, publicado por Seref Baris Cagliyan y colaboradores (ECCV 2026), no procesa píxeles directamente: un modelo visión-lenguaje congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera K=5 subtítulos censurados por imagen y este clasificador puntúa cada subtítulo, promediando los logits resultantes. La versión `cabm-cub200` está especializada en el dataset de aves CUB-200-2011, con 200 clases.

La relevancia del enfoque es la interpretabilidad: al forzar que toda la decisión de clasificación pase por texto en lenguaje natural, el modelo permite auditar qué evidencia textual sostiene cada predicción. Además, el clasificador es un transformer pequeño (RoBERTa-base, ~125 M de parámetros) que se entrena sobre subtítulos pregenerados, lo que abarata el coste de entrenamiento frente a un clasificador visual de extremo a extremo.

El modelo alcanza un 76,92 % de top-1 y un 95,46 % de top-5 en test promediando logits sobre los cinco subtítulos. Se distribuye con licencia MIT, en formato PyTorch/safetensors, y está pensado para investigación en interpretabilidad y clasificación fine-grained, no como clasificador visual autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) con cabeza lineal sobre el token [CLS] de la última capa |
| Parametros totales | ~125 M (roberta-base; no se especifica cifra exacta en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncación usada en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch / safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

El clasificador es `roberta-base` con una cabeza lineal que proyecta el vector [CLS] de la última capa a 200 clases. El entrenamiento se realiza sobre subtítulos pregenerados por `Qwen/Qwen3-VL-2B-Instruct` (congelado), con K=5 subtítulos por imagen muestreados a temperaturas 0,7, 0,9, 1,1, 1,3 y 1,5. Los subtítulos provienen del dataset `datasets/cabm-captions/cub200`. La configuración de entrenamiento es: máximo 30 épocas, learning rate 2e-05, batch efectivo 48, label smoothing 0,1, LLRD (layer-wise learning rate decay) de 0,85, congelación de las dos capas inferiores y early stopping sobre la pérdida de validación.

La innovación clave no está en el clasificador sino en el pipeline: la imagen nunca entra directamente al clasificador, sino que se convierte en texto censurado por un VLM congelado. Esto convierte la clasificación visual en clasificación textual y hace que la decisión sea trazable a los subtítulos. La agregación final se hace promediando los logits de las K=5 inferencias (logit averaging), no por votación mayoritaria.

## Capacidades

- Clasificación de texto multietiqueta restringida a 200 clases de aves (CUB-200-2011).
- Scorado de subtítulos individuales: devuelve un vector de logits de 200 dimensiones por subtítulo.
- Agregación por promedio de logits sobre múltiples subtítulos de una misma imagen.
- Interpretabilidad por diseño: la predicción es auditable a través de los subtítulos que la sustentan.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No tiene modo thinking, visión ni audio propios: depende de un captioner externo.

## Casos de uso

- Investigación en interpretabilidad de clasificadores: permite inspeccionar qué subtítulo y qué términos empujan la predicción hacia una clase concreta, algo imposible en un CNN o ViT opaco.
- Clasificación fine-grained de aves en pipelines de investigación ornitológica: con 200 clases y 95,46 % top-5, sirve para triaje automático de imágenes de cámaras trampa cuando ya se dispone de un captioner VLM.
- Auditoría de sesgos en modelos visión-lenguaje: al pasar la decisión por texto, se puede medir si el captioner introduce términos sesgados que alteran la clase predicha.
- Prototipado de sistemas de clasificación con cuello de botella textual: útil para comparar arquitecturas CaBM frente a clasificadores visuales end-to-end en términos de coste y exactitud.
- Generación de explicaciones en lenguaje natural para datasets académicos: los subtítulos censurados actúan como justificación textual de la etiqueta predicha.
- Evaluación de robustez frente a variaciones de captioning: cambiar la temperatura o el número K de subtítulos permite estudiar la estabilidad de la predicción sin reentrenar el clasificador.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| CUB-200-2011 | Top-1 accuracy (logit averaging) | 76,92 % |
| CUB-200-2011 | Top-5 accuracy | 95,46 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de texto estándar, ya que la tarea evaluada es clasificación de imágenes vía subtítulos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 para roberta-base (~125 M de parámetros); menos de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090, etc.
- También ejecutable en CPU para inferencia por lotes pequeños (el ejemplo de la model card contempla `cpu`).
- Opciones de despliegue: PyTorch nativo mediante `cabm.classifier.load_trained`; compatible con Hugging Face Transformers al ser roberta-base, por lo que puede servirse con TGI o vLLM, aunque la model card solo documenta el flujo PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requiere además el captioner `Qwen/Qwen3-VL-2B-Instruct` para generar subtítulos de imágenes nuevas, lo que añade sus propios requisitos de VRAM (no especificados aquí).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabm-cub200 | ~125 M (roberta-base) | 512 tokens | Clasificación de texto (200 clases CUB) | MIT | Hugging Face |
| roberta-base (base) | ~125 M | 512 tokens | Clasificación de texto genérica | MIT | Hugging Face |
| Clasificador visual end-to-end para CUB-200 | no disponible | N/A | Clasificación de imágenes | variable | variable |

No se dispone en la información proporcionada de resultados de otros clasificadores CaBM ni de clasificadores visuales comparables en CUB-200-2011 para establecer una comparación cuantitativa. La comparación con `roberta-base` es estructural (mismo backbone), no de rendimiento.

## Limitaciones y advertencias

- El modelo no clasifica imágenes directamente: necesita un captioner VLM externo y un script de generación de subtítulos (`generate_captions.py`), lo que introduce dependencia de otro modelo y de su prompt.
- Especializado exclusivamente en CUB-200-2011 (200 clases de aves); no generaliza a otras taxonomías sin reentrenamiento.
- Idioma limitado al inglés: los subtítulos deben generarse en inglés para que el clasificador opere en su distribución de entrenamiento.
- Riesgo de alucinación heredado del captioner: si `Qwen3-VL-2B-Instruct` describe características incorrectas, el clasificador puede predecir clases erróneas de forma sistemática.
- El resultado top-1 (76,92 %) está declarado por el autor y marcado como no verificado (`verified: false`).
- Licencia MIT permite uso comercial, pero el pipeline completo incorpora un captioner con su propia licencia, que debe revisarse por separado.
- No hay datos publicados sobre sesgos demográficos ni sobre robustez fuera del dominio de aves.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bariscagliyan/cabm-cub200
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Código: https://github.com/bariscagliyan/CaptionBottleneckModels
- Captioner: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base: https://huggingface.co/FacebookAI/roberta-base

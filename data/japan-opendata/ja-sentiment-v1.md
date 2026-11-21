# japan-opendata/ja-sentiment-v1

## Resumen

ja-sentiment-v1 es un modelo de clasificación de sentimiento en japonés desarrollado por japan-opendata (Japan Open Data Lab) como parte de su serie de componentes de IA para japonés. Clasifica texto en tres clases de polaridad (negativo, neutral, positivo) y devuelve las probabilidades asociadas. Está construido sobre el modelo base sbintuitions/modernbert-ja-130m, un transformer encoder de arquitectura ModernBERT adaptado al japonés, y cuenta con 132.404.739 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños y eficientes para inferencia en CPU.

El modelo resuelve una tarea acotada pero de gran utilidad en pipelines de producción: el análisis de sentimiento a escala sobre reseñas, redes sociales, encuestas de satisfacción y tickets de soporte. Su propuesta diferencial es el uso exclusivo de datos de entrenamiento sintéticos generados con LLM de pesos abiertos (Apache 2.0/MIT) y verificados por un modelo independiente, lo que evita problemas de licencia derivados de corpus de reseñas de procedencia incierta o de datasets de investigación con restricciones como WRIME (uso exclusivamente investigador) o chABSA (CC BY-NC-SA).

La relevancia actual del modelo radica en su combinación de licencia Apache 2.0 limpia para uso comercial, calibración de probabilidades ajustada (ECE ≈ 0,005) y disponibilidad en formato ONNX con latencia de aproximadamente 17,8 ms por ejemplo en CPU (i7-11700F), lo que lo hace apto para despliegues de bajo coste sin GPU. El autor reporta métricas muy altas en su propio conjunto de evaluación, aunque advierte explícitamente de que la comparación con otros modelos no debe interpretarse como una superioridad en reseñas reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), base sbintuitions/modernbert-ja-130m |
| Parámetros totales | 132.404.739 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (ONNX, opset 17); no se incluye versión INT8 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning para clasificación de secuencias sobre sbintuitions/modernbert-ja-130m, un encoder de la familia ModernBERT adaptado al japonés y distribuido bajo licencia MIT. ModernBERT incorpora mejoras sobre el transformer encoder clásico, como atención con rotación posicional (RoPE) y alternancia entre atención local y global, orientadas a mayor eficiencia en secuencias largas; no obstante, la model card no detalla la configuración concreta de capas ni la longitud de contexto efectiva del modelo base.

El entrenamiento se realizó exclusivamente con datos sintéticos generados por LLM de pesos abiertos con licencias Apache 2.0 y MIT, y validados por un modelo independiente distinto del generador. Los dominios cubiertos incluyen reseñas de productos, alojamiento y restauración, textos cortos estilo redes sociales, opiniones sobre soporte técnico y valoraciones de aplicaciones. Aproximadamente el 60 % de los ejemplos corresponden a casos difíciles: negaciones, valoraciones mixtas y quejas atenuadas. Una auditoría de 200 muestras aleatorias reportó una validez de etiqueta del 97,5 % y una naturalidad del japonés del 93,5 %. No se menciona el uso de RLHF ni DPO, algo esperable en un modelo discriminativo de este tamaño.

## Capacidades

- Clasificación de polaridad de sentimiento en tres clases: negativo, neutral y positivo, con salida de probabilidades por clase.
- Calibración de probabilidades ajustada (ECE ≈ 0,005), lo que permite usar la probabilidad directamente como puntuación de confianza.
- Procesamiento de textos cortos y medios en japonés: reseñas, publicaciones sociales, respuestas de encuestas y tickets de soporte.
- Manejo de casos difíciles: negaciones, evaluaciones con aspectos positivos y negativos simultáneos y quejas formuladas de forma atenuada.
- Inferencia en CPU con buen rendimiento gracias a su tamaño reducido y a la exportación ONNX.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es un clasificador puro.
- Capacidad multilingüe: únicamente japonés.

## Casos de uso

- Monitorización de opiniones en redes sociales: clasificación por lotes de publicaciones en japonés para calcular la proporción de sentimiento positivo, neutral y negativo por marca o tema, aprovechando la baja latencia en CPU para procesar volúmenes altos sin GPU.
- Triaje de tickets de soporte: asignación automática de prioridad o enrutamiento según la polaridad del mensaje del cliente, usando las probabilidades calibradas para fijar umbrales de escalado a agentes humanos en los casos negativos con alta confianza.
- Análisis de encuestas de satisfacción con preguntas abiertas: agregación de la distribución de sentimiento de las respuestas de texto libre para complementar las escalas numéricas, con la ventaja de que la probabilidad calibrada permite construir índices de satisfacción ponderados.
- Agregación de reseñas de producto en comercio electrónico: resumen automático de la proporción de reseñas positivas y negativas por producto o categoría, integrándose en pipelines ETL existentes mediante la salida ONNX.
- Filtrado previo de reseñas de alojamiento y restauración: detección de reseñas negativas para su revisión manual o para disparar alertas operativas, adecuado por su cobertura de dominios de hostelería en el entrenamiento.
- Análisis de opiniones sobre aplicaciones móviles: clasificación de las valoraciones textuales en las tiendas de aplicaciones para identificar regresiones de percepción tras un lanzamiento, con despliegue en contenedores CPU de bajo coste.
- Moderación asistida de comunidades: señalización de mensajes con carga negativa para revisión humana, siempre como componente auxiliar y no como decisión automática final.

## Benchmarks y rendimiento

| Evaluación | Métrica | ja-sentiment-v1 | christian-phu/bert-finetuned-japanese-sentiment |
|---|---|---|---|
| Conjunto sellado (5.000 muestras, separación por subtema) | Exactitud | 0,9940 | 0,6210 |
| Conjunto sellado (5.000 muestras) | Macro F1 | 0,9940 | no disponible |
| Conjunto sellado (5.000 muestras) | Errores positivo/negativo | 2 de 5.000 | no disponible |
| Conjunto verificado manualmente (600 muestras) | Exactitud | 0,9933 | 0,5750 |
| Conjunto verificado manualmente (600 muestras) | Errores positivo/negativo | 0 | no disponible |
| Calibración | ECE | ≈ 0,005 | no disponible |

Advertencia del autor: los conjuntos de evaluación son de origen sintético y su distribución, así como la definición de la clase «neutral», difieren de las de las reseñas reales sobre las que se entrenó el modelo de comparación. Las cifras miden la concordancia con las etiquetas verificadas por el autor, no una superioridad demostrada en reseñas reales.

Rendimiento de inferencia: la versión ONNX (FP32, opset 17) coincide exactamente con la versión PyTorch en 200 muestras de desarrollo y 200 del conjunto sellado; la latencia en CPU es de aproximadamente 17,8 ms por ejemplo en un Intel i7-11700F.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 132,4 millones de parámetros; en FP32 ocupa aproximadamente 530 MB de pesos, por lo que en GPU requiere menos de 1 GB de VRAM incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 sobran para esta carga.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: es el entorno objetivo; el autor reporta 17,8 ms por ejemplo en un i7-11700F con ONNX FP32.
- Opciones de despliegue: ONNX Runtime (formato incluido), PyTorch con la implementación de referencia examples/infer_sentiment.py, y servidores de inferencia compatibles con modelos de clasificación de Hugging Face (por ejemplo, pipelines de transformers). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos.
- Throughput: no disponible de forma agregada; puede estimarse a partir de la latencia por ejemplo y del tamaño de lote en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento reportado |
|---|---|---|---|---|---|
| japan-opendata/ja-sentiment-v1 | 132,4 M | no disponible | Apache 2.0 | Clasificación de sentimiento japonés, datos sintéticos | 0,9940 exactitud en conjunto sellado propio |
| christian-phu/bert-finetuned-japanese-sentiment | no disponible | no disponible | no disponible | Clasificación de sentimiento japonés sobre reseñas reales | 0,6210 en el conjunto sellado del autor de ja-sentiment-v1 |
| sbintuitions/modernbert-ja-130m | ≈130 M | no disponible | MIT | Modelo base encoder japonés (no clasificador) | no aplica (modelo base) |

La comparación con christian-phu/bert-finetuned-japanese-sentiment debe tomarse con cautela por la diferencia de distribución y de definición de la clase neutral, tal como advierte el propio autor. No se dispone de datos de otros clasificadores de sentimiento en japonés comparables en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento es completamente sintético: el rendimiento en reseñas reales puede diferir del reportado, y el propio autor advierte de que las métricas miden concordancia con sus etiquetas, no superioridad en datos reales.
- La auditoría de calidad de los datos sintéticos reportó un 97,5 % de validez de etiqueta y un 93,5 % de naturalidad, lo que implica que una fracción de los ejemplos de entrenamiento contiene ruido de etiqueta o texto poco natural.
- Solo admite japonés; no debe esperarse un comportamiento correcto con texto en otros idiomas.
- La definición de la clase neutral es específica del esquema del autor y puede no coincidir con la de otros datasets o anotadores.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en dominios alejados de los cubiertos en el entrenamiento (productos, hostelería, redes sociales, soporte, apps).
- No se incluye versión cuantizada INT8; solo FP32 en ONNX, lo que limita optimizaciones adicionales de latencia.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base (MIT) y conservar los avisos correspondientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- La longitud de contexto no está documentada; para textos largos debe aplicarse truncado y validar el comportamiento.
- No es un modelo generativo: no debe emplearse para resumen, extracción de entidades ni diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-sentiment-v1
- Página del modelo en el sitio del autor: https://jpopendata.jp/models/ja-sentiment-v1/
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/japan-opendata/ja-sentiment-demo
- Perfil del autor en Hugging Face: https://huggingface.co/japan-opendata
- Listado de la serie de modelos: https://jpopendata.jp/models/
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Modelo de comparación citado: https://huggingface.co/christian-phu/bert-finetuned-japanese-sentiment

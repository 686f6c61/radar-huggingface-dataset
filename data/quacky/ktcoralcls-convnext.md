# quacky/ktcoralcls-convnext

## Resumen

KTCoralCLS ConvNeXt es un clasificador de imágenes especializado en la identificación de géneros de coral. El modelo, publicado por el usuario quacky, se basa en una arquitectura ConvNeXt-Tiny adaptada para clasificar 36 géneros distintos de coral a partir de imágenes RGB de 224×224 píxeles. Se trata del checkpoint principal de despliegue del paper KTCoralCLS, no del modelo multi-tarea de crecimiento, y está entrenado sobre el dataset KTCoral empleando una partición de retención por grupo de imagen parental (parent-image group hold-out).

El modelo resuelve un problema concreto de visión por computador aplicada a biología marina: la clasificación taxonómica automática de corales a nivel de género. Con un tamaño de repositorio de 0,1 GB y pesos en formato PyTorch (`best.pt`), es un modelo ligero y orientado a inferencia directa. Los resultados reportados en el conjunto de test son 81,9 % de accuracy, un F1 macro de 0,796 y un F1 de 0,625 para el género con peor rendimiento.

Es relevante para investigadores y desarrolladores que necesiten automatizar el etiquetado de imágenes de arrecifes, monitorizar la biodiversidad de corales o construir pipelines de análisis ecológico a escala. Al ser un modelo de nicho, cuenta con pocas descargas y likes, y su licencia es "other", lo que obliga a revisar los términos exactos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes) |
| Licencia | other |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo emplea ConvNeXt-Tiny, una red neuronal convolucional moderna que moderniza los bloques ResNet con inspiración en los Vision Transformers (convoluciones depthwise de 7×7, normalización LayerNorm y activación GELU). La entrada es una imagen RGB de 224×224 píxeles normalizada con las estadísticas de ImageNet, y la salida es una clasificación sobre 36 géneros de coral.

El entrenamiento se realizó sobre el dataset KTCoral con una partición de retención por grupo de imagen parental (parent-image group hold-out), lo que evita la fuga de datos entre imágenes derivadas de la misma imagen original y proporciona una evaluación más realista de la generalización. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de clasificación de imágenes). Tampoco se detalla si hubo aumento de datos o ajuste fino de hiperparámetros más allá de lo indicado en la model card.

## Capacidades

- Clasificación de imágenes de coral a nivel de género: predicción entre 36 géneros distintos.
- Procesamiento de imágenes RGB de 224×224 píxeles con normalización ImageNet.
- Inferencia directa en CPU o GPU mediante PyTorch (`torch.device`).
- Integración con el paquete `ktcoralcls` para carga de checkpoints y acceso a la lista de géneros (`GENERA`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Monitorización de biodiversidad en arrecifes: el modelo permite clasificar automáticamente imágenes de corales capturadas en campo y agregar los resultados por género para estimar la composición de la comunidad coralina en un arrecife.
- Etiquetado asistido de datasets ecológicos: investigadores pueden usar el modelo para pre-etiquetar grandes colecciones de imágenes de coral y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotación.
- Análisis de series temporales de imágenes: al ser un modelo ligero (0,1 GB), puede ejecutarse sobre imágenes repetidas de un mismo transecto para detectar cambios en la distribución de géneros a lo largo del tiempo.
- Pipelines de ciencia ciudadana: integración en aplicaciones donde voluntarios envían fotos de corales y el modelo sugiere el género, con validación posterior por expertos.
- Investigación en taxonomía asistida por IA: uso como baseline reproducible (gracias a la partición group hold-out) para comparar nuevos métodos de clasificación de corales.
- Despliegue en entornos con recursos limitados: al ser ConvNeXt-Tiny y con pesos de ~0,1 GB, puede ejecutarse en CPU o en GPUs de consumo para inferencia por lotes de imágenes de arrecife.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test) | 81,9 % |
| F1 macro (test) | 0,796 |
| F1 del peor género (test) | 0,625 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; ConvNeXt-Tiny con entrada 224×224 requiere típicamente menos de 1-2 GB en FP32, aunque el dato exacto no está confirmado en la model card.
- GPU recomendadas: cualquier GPU moderna (RTX 3090, RTX 4090, A100, H100) es sobredimensionada para este modelo; una GPU de gama media es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: PyTorch nativo mediante `ktcoralcls.model.load_checkpoint`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación de géneros de coral con características equivalentes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre KTCoral, el modelo puede rendir peor en imágenes de corales de regiones, condiciones de iluminación o cámaras no representadas en el dataset.
- Riesgo de alucinación: en clasificación, se traduce en predicciones erróneas con alta confianza; el F1 del peor género (0,625) indica que algunos géneros son especialmente difíciles de distinguir.
- Limitaciones de contexto o idioma: no aplica contexto textual; el modelo solo procesa imágenes RGB de 224×224 con normalización ImageNet, y entradas con otras resoluciones o formatos requieren preprocesado previo.
- Restricciones de licencia: la licencia es "other"; es imprescindible consultar los términos exactos antes de cualquier uso comercial o redistribución.
- Caveats para producción: el modelo está entrenado para clasificación a nivel de género, no de especie; no debe usarse como sustituto de identificación taxonómica experta. La información sobre el dataset y el entrenamiento es limitada, lo que dificulta auditar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quacky/ktcoralcls-convnext
- Dataset KTCoral: https://huggingface.co/datasets/quacky/ktcoral
- Código y particiones (GitHub): https://github.com/QuackBeans/KTCoralCLS

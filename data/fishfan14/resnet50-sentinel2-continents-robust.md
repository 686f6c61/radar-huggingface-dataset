# fishfan14/resnet50-sentinel2-continents-robust

## Resumen

`fishfan14/resnet50-sentinel2-continents-robust` es un clasificador de imágenes basado en ResNet-50, ajustado por el autor `fishfan14` para una tarea de teledetección muy concreta: predecir el continente (Africa, Asia, Europe, North America, Oceania, South America) a partir de una tesela RGB de Sentinel-2 de aproximadamente 10,7 x 10,7 km. Parte de los pesos de `timm/resnet50.tv2_in1k` y se entrena sobre el dataset `fishfan14/sentinel2-continents`, derivado de las teselas Major TOM.

La particularidad de esta versión, frente a la v1 del mismo autor, es la robustez: incorpora un pipeline de aumentación pesada (balance de blancos, saturación, gamma, desenfoque, ruido, reescalado y nitidez) aplicada al 50 % de las imágenes de entrenamiento. Esto mejora de forma notable el rendimiento sobre imágenes que no coinciden con el procesado estándar L2A de Major TOM, a costa de unos pocos puntos en las teselas regulares.

El modelo es relevante como ejemplo de ajuste fino ligero y reproducible en teledetección: con solo 23,5 millones de parámetros, entrada de 224 x 224 y un repositorio de 0,2 GB, ofrece un punto de partida práctico para tareas de geolocalización gruesa o filtrado previo de imágenes satelitales, y expone explícitamente el compromiso entre precisión en distribución y robustez fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN, transformer no aplicable) |
| Parametros totales | 23.573.446 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin componente de texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Se trata de una ResNet-50 estándar (CNN con conexiones residuales) inicializada desde `timm/resnet50.tv2_in1k`. La entrada es la tesela completa redimensionada a 224 x 224 píxeles (sin recorte central), con normalización según la configuración de datos de timm. El entrenamiento consta de 15 épocas, con la primera dedicada solo a la cabeza de clasificación, optimizador AdamW (weight decay 0,05), learning rate 5e-4 para el backbone y 2e-3 para la cabeza, scheduler coseno, label smoothing 0,1, batch de 64 y precisión fp16.

La innovación principal respecto a la v1 está en la aumentación: cada imagen recibe, con probabilidad 50 %, el pipeline ligero de v1 (rotaciones de 90°, volteos, brillo y contraste ±10 %) o un pipeline pesado (rotaciones y volteos, balance de blancos ±10 %, saturación 0,6-1,5x, contraste 0,7-1,4x, brillo 0,8-1,25x, gamma 0,75-1,35, más reescalado aleatorio, desenfoque, nitidez y ruido). Aplicar la aumentación pesada solo a la mitad de las imágenes resultó mejor que aplicarla a todas; entrenar 30 épocas no aportó mejoras. No se documenta uso de RLHF ni DPO (no aplica a clasificación de imágenes).

## Capacidades

- Clasificación de imágenes satelitales Sentinel-2 en seis clases continentales (Africa, Asia, Europe, North America, Oceania, South America).
- Predicción de probabilidades por clase vía softmax; el README muestra cómo obtener el top-3.
- Robustez frente a variaciones de color, nitidez y ligero cambio de escala respecto a los datos de entrenamiento.
- Inferencia en CPU o GPU con timm/PyTorch, o mediante el `model.onnx` incluido en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación entrenada.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Filtrado previo de catálogos satelitales: dado un lote de teselas Sentinel-2, asignar un continente aproximado para enrutar o etiquetar imágenes antes de un análisis más costoso, aprovechando que el modelo funciona con una sola pasada de 224 x 224.
- Enriquecimiento de metadatos en pipelines de ingesta: clasificar automáticamente teselas descargadas de distintos productos (L1C, L2A) o con procesados de color heterogéneos, escenario en el que esta versión robusta supera a la v1 (64,8 % vs 56,0 % en L1C fresco).
- Control de calidad de datasets: detectar teselas cuyo continente predicho no coincide con la etiqueta esperada para señalar posibles errores de georreferenciación o de mezcla de fuentes.
- Prototipado rápido en teledetección: al ser un modelo pequeño (23,5 M de parámetros, 0,2 GB) y disponible en ONNX, sirve como línea base reproducible para experimentos de clasificación geográfica.
- Procesamiento en entornos con recursos limitados: su tamaño permite inferencia en CPU o en GPU de gama media para lotes moderados de imágenes.
- Análisis de capturas o imágenes de servicios de mapas: el modelo se entrenó específicamente para tolerar cambios de color y nitidez similares a los de capturas de pantalla (66,6 % en el test combinado de color, nitidez y recorte, frente a 44,9 % de la v1).
- Normalización de fuentes mixtas: cuando no es posible calcular media y desviación por canal de un lote homogéneo, esta versión mantiene mejor el rendimiento que la v1.

## Benchmarks y rendimiento

Resultados publicados en la model card (accuracy por conjunto de test):

| Test set | v1 | Este modelo |
|---|---|---|
| test | 78,1 % | 74,4 % |
| fresh L2A | 77,8 % | 74,3 % |
| fresh L1C | 56,0 % | 64,8 % |
| stronger colors | 66,3 % | 72,7 % |
| sharpened | 54,8 % | 69,7 % |
| 70 % crop (~7,5 km) | 73,7 % | 70,2 % |
| JPEG q60 | 37,4 % | 36,2 % |
| colors + sharpening + crop | 44,9 % | 66,6 % |

Con normalización por lote (media y desviación por canal ajustadas a los datos de entrenamiento), el rendimiento en fresh L1C sube a 69,5 % para la v1 y a 71,3 % para este modelo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por no ser aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,5 M de parámetros en fp32 ocupa del orden de 90-100 MB de pesos, y en fp16 alrededor de 50 MB. La activación para un batch pequeño es despreciable.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU integrada pueden ejecutar la inferencia sin problema.
- Cabe holgadamente en GPU de consumo e incluso en CPU para lotes moderados.
- Opciones de despliegue: timm + PyTorch (como en el ejemplo del README), ONNX Runtime con el `model.onnx` del repositorio, o exportación a otros runtimes compatibles con ONNX. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fishfan14/resnet50-sentinel2-continents-robust` (este) | 23,5 M | 224 x 224 | Continente desde tesela Sentinel-2, robusto | CC BY-SA 4.0 | Hugging Face (timm, ONNX) |
| `fishfan14/resnet50-sentinel2-continents` (v1) | no disponible en la información | 224 x 224 | Misma tarea, orientado a teselas tipo Major TOM | CC BY-SA 4.0 | Hugging Face |
| `timm/resnet50.tv2_in1k` (base) | ~25,6 M (ResNet-50 estándar) | 224 x 224 | Clasificación ImageNet-1k | no disponible en la información | Hugging Face / timm |

La comparación con otros clasificadores de teledetección específicos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Aproximadamente 4 puntos por debajo de la v1 en teselas Sentinel-2 regulares (74,4 % vs 78,1 % en el test principal).
- La compresión JPEG degrada mucho el rendimiento (36,2 % en JPEG q60); se recomienda usar PNG.
- Espera aproximadamente 10 km de terreno por imagen, en verano, sin nubes y sobre tierra firme.
- Los tests de "otra fuente" son cambios sintéticos y un producto Sentinel-2 distinto (L1C), no imágenes aéreas reales ni imágenes comerciales; la robustez fuera de esos escenarios no está validada.
- Entrenamiento con una sola ejecución e hiperparámetros solo ajustados de forma aproximada.
- Riesgo de sesgo geográfico: el modelo aprende a asociar apariencia visual con continentes y puede fallar en regiones con paisajes ambiguos o en teselas costeras.
- Riesgo de error en zonas con cobertura terrestre mixta o con predominio de agua, no documentado explícitamente.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia. Contiene datos Copernicus Sentinel modificados vía Major TOM.
- No apta para tareas distintas de la clasificación continental; no debe usarse como modelo de visión general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/resnet50-sentinel2-continents-robust
- Versión v1: https://huggingface.co/fishfan14/resnet50-sentinel2-continents
- Dataset de entrenamiento: https://huggingface.co/datasets/fishfan14/sentinel2-continents
- Modelo base: https://huggingface.co/timm/resnet50.tv2_in1k
- Major TOM (origen de las teselas, CC BY-SA 4.0): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

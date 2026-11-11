# Lakes0001/ai-photo-models

## Resumen

`Lakes0001/ai-photo-models` no es un modelo de lenguaje, sino un repositorio de pesos ONNX cuantizados para una aplicación Android de retoque fotográfico llamada AI Photo. Concretamente, agrupa los cinco artefactos que la app descarga en el primer arranque para ejecutar su función de "cambio de cara en alta definición" (高清换脸) en local. Los modelos originales provienen de FaceFusion 3.0.0 e InsightFace, y el autor del repositorio se limita a convertirlos a ONNX Runtime con cuantización int8 o fp16 para reducir el consumo de memoria en dispositivos móviles.

El contenido cubre dos tareas diferenciadas: el intercambio de caras (`inswapper_128_int8.onnx` y `hyperswap_1c_256_w8.onnx`) y la restauración de rostros (`gfpgan_1.4_w8.onnx` y `gfpgan_1.4_fp16.onnx`), además del extractor de embeddings faciales `arcface_w600k_r50_int8.onnx`, necesario para alinear e identificar rostros antes del swap. Todo el material está en formato ONNX, con un tamaño de repositorio de 0,7 GB y sin pipeline de Hugging Face declarado.

Su relevancia es acotada y práctica: sirve como referencia de cómo cuantizar modelos de visión de forma agresiva (int8 por canal en pesos, uint8 en activaciones, QDQ) manteniendo una fidelidad de salida de 51 a 53 dB respecto al original, y como ejemplo de empaquetado de modelos para inferencia en Android. No es un modelo entrenado por el autor ni un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales (CNN) para reconocimiento facial (ArcFace), swap facial (inswapper, HyperSwap) y restauración generativa (GFPGAN). Detalle por bloque no disponible |
| Parametros totales | No disponible (el autor solo publica tamaños de fichero: 174 MB, 277 MB, 403 MB y 340 MB según el modelo original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | int8 (pesos por canal, activaciones uint8, esquema QDQ con calibración por percentil en ArcFace); int8 solo en pesos con DequantizeLinear previo en HyperSwap y GFPGAN; fp16 en GFPGAN |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Mixta: InsightFace non-commercial (ArcFace, inswapper), Apache 2.0 (GFPGAN), HyperSwap sin licencia declarada en origen; licencia agregada `insightface-non-commercial-and-apache-2.0` |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: redistribuye artefactos derivados de FaceFusion 3.0.0. `arcface_w600k_r50_int8.onnx` es una ArcFace con backbone ResNet-50 (la nomenclatura `r50` lo indica) entrenada originalmente sobre el dataset Glint360K (600k identidades, de ahí `w600k`), usada aquí como extractor de embeddings para alinear y verificar rostros. `inswapper_128_int8.onnx` es el modelo de swap de InsightFace, que opera a resolución 128; la conversión parte de la variante fp16, se revierte a fp32 y se cuantizan únicamente las convoluciones, dejando la matriz `emap` como último initializer. `hyperswap_1c_256_w8.onnx` es un modelo de swap de FaceFusion Labs a 256 píxeles, cuantizado solo en pesos (convoluciones, deconvoluciones y capas fully connected) con DequantizeLinear antepuesto y activaciones sin cuantizar, con una desviación declarada superior a 51 dB respecto al original.

La restauración corre a cargo de GFPGAN 1.4, en dos variantes: `gfpgan_1.4_w8.onnx` aplica cuantización solo de pesos en convoluciones y convoluciones moduladas (operación Mul), con desviación superior a 53 dB y un pico de memoria en Android aproximadamente 900 MB inferior a la versión fp16; `gfpgan_1.4_fp16.onnx` es una conversión directa a media precisión con entradas y salidas en float32. El pipeline de conversión se documenta en los scripts `quantize_faceswap.py`, `convert_gfpgan_fp16.py` y `quantize_weights.py` del repositorio de GitHub del proyecto, y la calibración de ArcFace se hizo con ONNX Runtime 1.31.1 en modo estático QDQ.

## Capacidades

- Extracción de embeddings faciales con ArcFace ResNet-50 para alineamiento, verificación e identificación de rostros.
- Intercambio de cara (face swap) a resolución 128 con inswapper y a 256 con HyperSwap.
- Restauración y mejora de rostros con GFPGAN 1.4 en variante int8 (pesos) y fp16.
- Inferencia local en dispositivo mediante ONNX Runtime, sin depender de servidores externos.
- Ejecución en Android con consumo de memoria reducido por la cuantización (ahorro de ~900 MB en GFPGAN int8 frente a fp16).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, audio o vídeo.
- No hay capacidades multilingües: los modelos no procesan texto.

## Casos de uso

- Cambio de cara en una app Android de retoque fotográfico: es el caso de uso original; la app descarga estos ONNX en el primer arranque y ejecuta el swap en local, evitando enviar fotos a un servidor.
- Prototipado de pipelines de face swap en escritorio: cargando `inswapper_128_int8.onnx` junto con `arcface_w600k_r50_int8.onnx` en ONNX Runtime se puede montar un flujo de detección, alineamiento, swap y restauración sin depender de PyTorch.
- Restauración de fotos antiguas o de baja calidad: `gfpgan_1.4_w8.onnx` recupera detalle facial en retratos degradados con un coste de memoria contenido, adecuado para dispositivos con poca RAM.
- Despliegue en móviles de gama media: la variante int8 de GFPGAN reduce el pico de memoria en torno a 900 MB respecto a fp16, lo que permite ejecutar la restauración en terminales con 4-6 GB de RAM.
- Investigación sobre cuantización de modelos de visión: los scripts y las métricas de fidelidad (51 dB y 53 dB) sirven como referencia para evaluar el impacto de la cuantización por canal en tareas de restauración y swap.
- Benchmarking de ONNX Runtime en Android: permite medir latencia y memoria de un pipeline CNN realista (detección + embedding + swap + restauración) en hardware móvil.
- Integración en herramientas de edición de vídeo o foto de escritorio con licencia compatible: solo los componentes GFPGAN (Apache 2.0) son aptos para uso comercial; el resto queda restringido a investigación no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de fidelidad de la cuantización frente al modelo original: más de 51 dB de diferencia para `hyperswap_1c_256_w8.onnx` y más de 53 dB para `gfpgan_1.4_w8.onnx`, además de una reducción de pico de memoria de aproximadamente 900 MB en Android para la variante int8 de GFPGAN. No hay datos de latencia, throughput ni métricas de calidad perceptual (FID, LPIPS, SSIM) publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño de fichero, el pipeline completo ronda los 0,7 GB de pesos, y la variante int8 de GFPGAN reduce el pico de memoria en unos 900 MB frente a fp16 en Android.
- GPU recomendadas: no especificadas por el autor; al ser modelos ONNX, pueden ejecutarse en CPU, GPU integrada o GPU dedicada compatible con ONNX Runtime (CUDA, DirectML, CoreML, NNAPI).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de memoria libre puede alojar el pipeline completo; también está pensado para ejecutarse en móviles Android vía NNAPI o CPU.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1 para la calibración), con soporte de execution providers CUDA, DirectML, CoreML, NNAPI y CPU. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Lakes0001/ai-photo-models` (este repo) | Swap + restauración cuantizados | 128 / 256 | ONNX int8/fp16 | Mixta (InsightFace no comercial + Apache 2.0) | Hugging Face, 0 descargas |
| FaceFusion 3.0.0 (`facefusion/models-3.0.0`) | Swap + restauración originales | 128 / 256 | ONNX fp16/fp32 | Según modelo (InsightFace, Apache 2.0) | Hugging Face |
| InsightFace (ArcFace + inswapper) | Reconocimiento y swap | 112 / 128 | ONNX, PyTorch | Solo investigación no comercial | GitHub, Hugging Face |
| GFPGAN 1.4 (TencentARC) | Restauración facial | 512 | PyTorch, ONNX | Apache 2.0 | GitHub, Hugging Face |

La diferencia principal frente a los originales es el tamaño y el consumo de memoria: la cuantización int8 reduce el peso de los ficheros y el pico de RAM en detrimento de una fidelidad de 51-53 dB. Frente a alternativas como CodeFormer o RestoreFormer no hay comparación publicada en la información disponible.

## Limitaciones y advertencias

- Licencia restrictiva: ArcFace e inswapper son de uso exclusivamente no comercial según InsightFace; no pueden usarse en productos comerciales sin licencia aparte.
- HyperSwap no tiene licencia de modelo declarada en su publicación original; el autor advierte de que debe verificarse antes de usarlo. El código de FaceFusion es OpenRAIL-AS, pero eso no cubre los pesos.
- Riesgo ético y legal: el propio autor restringe el uso a la propia cara o a personas que hayan dado su consentimiento, y prohíbe la suplantación de identidad y la creación de contenido engañoso. En la UE, el uso de deepfakes está sujeto al Reglamento de IA y a obligaciones de etiquetado.
- Sesgos: no documentados; los modelos de reconocimiento facial como ArcFace presentan sesgos demográficos conocidos en la literatura, aunque el autor no aporta evaluación al respecto.
- Alucinación: en restauración facial, GFPGAN puede generar detalles faciales plausibles pero no reales en zonas degradadas, lo que altera la identidad de la persona.
- Idiomas: no aplica; son modelos de visión sin procesamiento de texto.
- Compatibilidad de versiones: `inswapper_128_int8.onnx` y `gfpgan_1.4_fp16.onnx` son artefactos heredados para versiones antiguas de la app (1.0.10-1.0.11 y 1.0.11-1.0.12 respectivamente); usarlos en versiones nuevas puede no ser lo previsto.
- Sin pipeline ni model card estándar de Hugging Face: no hay métricas de evaluación, demos ni garantías de mantenimiento (0 descargas y 0 likes en el momento de la consulta).
- Dependencia de ONNX Runtime 1.31.1 para reproducir la calibración; otras versiones pueden alterar los resultados de cuantización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lakes0001/ai-photo-models
- Repositorio de la app AI Photo: https://github.com/photo2ai/ai-photo
- Script de cuantización de face swap: https://github.com/photo2ai/ai-photo/blob/main/scripts/quantize_faceswap.py
- Script de conversión de GFPGAN a fp16: https://github.com/photo2ai/ai-photo/blob/main/scripts/convert_gfpgan_fp16.py
- Script de cuantización de pesos: https://github.com/photo2ai/ai-photo/blob/main/scripts/quantize_weights.py
- Modelos originales de FaceFusion 3.0.0: https://huggingface.co/facefusion/models-3.0.0
- Licencia de InsightFace: https://github.com/deepinsight/insightface#license
- GFPGAN (TencentARC): https://github.com/TencentARC/GFPGAN

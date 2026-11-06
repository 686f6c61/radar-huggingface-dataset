# jotap1101/tcc-coffee-unet-emater

## Resumen

El modelo `jotap1101/tcc-coffee-unet-emater` es una U-Net entrenada para segmentación binaria de cultivos de café a partir de imágenes Sentinel-2. Lo publica el usuario jotap1101 como parte de un trabajo de fin de curso (TCC) y se distribuye en cinco ficheros `fold_i.pt` con los pesos de cada doblez de una validación espacial k-fold de 5 particiones. El modelo opera sobre parches de 512x512 píxeles y cuatro bandas espectrales (B2, B3, B4 y B8), con una resolución de salida equivalente a la de entrada.

La relevancia del modelo es acotada: se trata de un artefacto de investigación reproducible, no de un modelo de propósito general. Su interés radica en que publica de forma transparente la configuración de entrenamiento, las métricas por doblez y los hashes de los pesos, lo que facilita la auditoría y la replicación. La fuente de referencia de las etiquetas es emater (2018), con código de región 310044, presumiblemente en el estado de Minas Gerais (Brasil).

Arquitectónicamente es una U-Net clásica con encoder de cuatro niveles (32, 64, 128 y 256 canales) y 4 canales de entrada, sin mecanismos de atención ni componentes transformer. No es un modelo de lenguaje ni un modelo multimodal: es un segmentador denso de imágenes satelitales. El repositorio ocupa 0,2 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (encoder-decoder convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 512x512 px, 4 bandas) |
| Tipos de cuantizacion | no disponible (pesos en FP32 por defecto en PyTorch) |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`), cinco ficheros `fold_i.pt` |

## Arquitectura y entrenamiento

La red es una U-Net convolucional con cuatro niveles de canales (32, 64, 128 y 256), 4 canales de entrada correspondientes a las bandas B2, B3, B4 y B8 de Sentinel-2, y salida de segmentación binaria con umbral fijo de 0,5. La entrada se procesa en parches de 512x512 píxeles. No se especifica en la información disponible el número de parámetros totales ni el detalle de las conexiones skip, aunque la estructura de canales es la habitual en U-Net.

El entrenamiento se realizó durante 100 épocas con Adam (learning rate 1e-4, weight decay 1e-4), batch size de 16 y 0 workers de carga de datos. La función de pérdida combina tres términos con peso 1,0 cada uno: Dice, focal y boundary. La validación es espacial k-fold de 5 particiones, con 18, 21, 25, 30 y 31 parches en cada doblez de validación respectivamente. No se indica el número total de tokens ni el volumen del dataset de entrenamiento más allá de estos recuentos de parches. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación.

## Capacidades

- Segmentación binaria densa de café en imágenes Sentinel-2 con cuatro bandas (B2, B3, B4, B8).
- Procesamiento de parches de 512x512 píxeles con salida a la misma resolución.
- Validación espacial k-fold con cinco conjuntos de pesos independientes, lo que permite estimar la variabilidad del rendimiento entre regiones.
- Umbral de decisión configurable (por defecto 0,5) para ajustar el compromiso precisión/recall.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Monitorización de cultivos de café a escala regional: el modelo permite generar máscaras binarias de café sobre mosaicos Sentinel-2 y agregar superficies por municipio o parcela, aprovechando que la validación k-fold cubre varias zonas y ofrece una estimación de la incertidumbre espacial.
- Actualización de cartografía agrícola: sustituye o complementa la digitalización manual de parcelas de café en regiones con código 310044, con un IoU agregado de 0,617 que sirve como criba inicial para revisión humana.
- Detección de cambios temporales: aplicando el modelo a imágenes de distintas fechas se pueden identificar transiciones (siembra, tala, expansión) en zonas cafetaleras, siempre que se mantenga la normalización `normalization_stats_emater.json`.
- Priorización de inspecciones de campo: con recall agregado de 0,849, el modelo tiende a sobre-detectar, lo que resulta útil para generar listas de parcelas candidatas a verificación sobre el terreno sin dejar fuera cultivos reales.
- Investigación reproducible en teledetección: los cinco `fold_i.pt`, la configuración JSON y los hashes SHA-256 permiten replicar exactamente los resultados publicados y comparar con otros segmentadores (por ejemplo, SegFormer de cuatro bandas mencionado en la model card).
- Integración en pipelines de análisis geoespacial: al ser un `state_dict` de PyTorch, se puede cargar en un servicio de inferencia por lotes que recorra teselas Sentinel-2 y produzca GeoJSON o GeoTIFF de máscaras.
- Docencia y experimentación con U-Net en datos satelitales: el paquete `src` del repositorio `tcc-lab` incluye el constructor `build_unet()` y las utilidades de normalización, lo que facilita usarlo como línea base en cursos y trabajos académicos.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor (segmentación binaria, umbral 0,5):

| fold | parches | IoU | F1 | Precisión | Recall |
|---|---|---|---|---|---|
| 0 | 18 | 0,4783 | 0,6471 | 0,5317 | 0,8263 |
| 1 | 21 | 0,6222 | 0,7671 | 0,7341 | 0,8033 |
| 2 | 25 | 0,6282 | 0,7716 | 0,7781 | 0,7653 |
| 3 | 30 | 0,5949 | 0,7460 | 0,6198 | 0,9368 |
| 4 | 31 | 0,6844 | 0,8126 | 0,7810 | 0,8469 |
| Agregado micro | 125 | 0,6173 | 0,7633 | 0,6936 | 0,8487 |
| Media por doblez ± desv. | — | 0,6016 ± 0,0682 | 0,7489 ± 0,0553 | 0,6890 ± 0,0979 | 0,8357 ± 0,0574 |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4 canales de entrada, 4 niveles y parches de 512x512, el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más. No se dispone del recuento exacto de parámetros para dar una cifra precisa.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para inferencia por lotes de teselas grandes conviene una GPU con al menos 8 GB para paralelizar parches.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo con 4 GB o más de VRAM.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `load_state_dict`), exportación a TorchScript u ONNX para servir con ONNX Runtime o TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto/parche | IoU publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jotap1101/tcc-coffee-unet-emater | U-Net convolucional | 4 bandas Sentinel-2 | 512x512 px | 0,6173 (micro) | MIT | Hugging Face |
| SegFormer (mencionado en la model card) | Transformer con proyección de 4 bandas | 4 bandas Sentinel-2 | no disponible | no disponible | no disponible | referenciado en el mismo repositorio |
| U-Net estándar (referencia genérica) | U-Net convolucional | RGB o multiespectral | variable | no disponible | variable | múltiples implementaciones |

No se dispone de métricas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con la fuente emater (2018) y el código de región 310044; su generalización a otras regiones, años o sensores no está validada.
- El rendimiento es desigual entre dobleces: el fold 0 obtiene IoU 0,478 frente al fold 4 con 0,684, con una desviación típica de 0,068 en IoU. En producción conviene elegir el fold adecuado o hacer ensemble.
- La precisión agregada (0,694) es notablemente inferior al recall (0,849): el modelo sobre-detecta café, lo que genera falsos positivos que deben filtrarse en aplicaciones cartográficas.
- No se documentan sesgos demográficos ni sociales, pero sí un sesgo geográfico y temporal derivado de la única fuente de etiquetas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de segmentaciones espurias en imágenes con nubosidad, sombras o cambios fenológicos no representados en el entrenamiento.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto académico.
- No se especifican los idiomas ni el pipeline de Hugging Face, por lo que no es cargable con `pipeline()` de Transformers; requiere el código del repositorio `tcc-lab` o una implementación propia de la U-Net.
- La normalización de las bandas debe seguir `normalization_stats_emater.json`; usar otras estadísticas degrada el rendimiento de forma no cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jotap1101/tcc-coffee-unet-emater
- Repositorio de código e instrucciones: https://github.com/jotap1101/tcc-lab
- No se han encontrado en la información disponible papers, blogs, demos ni otros enlaces adicionales.

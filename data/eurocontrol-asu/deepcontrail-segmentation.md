# eurocontrol-asu/deepcontrail-segmentation

## Resumen

DeepContrail segmentation es un modelo de segmentación semántica binaria especializado en la detección de estelas de condensación (contrails) en imágenes de satélite geoestacionario GOES-16. Lo desarrolla EUROCONTROL (a través de la organización eurocontrol-asu) como parte del proyecto DeepContrail, cuyo objetivo es monitorizar el impacto climático de la aviación mediante la identificación automática de estas nubes de hielo generadas por el tráfico aéreo. El modelo recibe un compuesto de falso color de tres canales derivado de las bandas infrarrojas del instrumento ABI y devuelve, píxel a píxel, la probabilidad de que cada punto de la escena contenga una estela.

Arquitectónicamente es un modelo de visión por computador de tipo encoder-decoder: un decodificador UPerNet acoplado a un encoder CAFormer-B36 preentrenado en ImageNet-22k y afinado en ImageNet-1k a 384 px. Con 102,6 millones de parámetros y un tamaño de repo de 0,4 GB, se sitúa en la gama media de los modelos de segmentación, lo que permite desplegarlo en una sola GPU consumer. El checkpoint publicado corresponde a la versión v0.1.0 y se distribuye bajo licencia Apache 2.0.

La relevancia actual del modelo radica en su aplicación climática: las estelas de condensación contribuyen al forzamiento radiativo positivo de la aviación, y su detección automatizada a escala global permite evaluar estrategias de mitigación (por ejemplo, rerutado de vuelos para evitar zonas propensas). El modelo se entrena sobre el dataset público OpenContrails de Google Research, lo que facilita la reproducibilidad y la comparación con otras aproximaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UPerNet (decoder) + CAFormer-B36 (encoder), vía segmentation-models-pytorch |
| Parametros totales | 102.599.783 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 256 × 256 px redimensionada a 512 px) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clásico para segmentación densa. El encoder es un CAFormer-B36 (`caformer_b36.sail_in22k_ft_in1k_384` de `timm`), una arquitectura híbrida que combina bloques de atención con convoluciones separables en profundidad y que fue preentrenada en ImageNet-22k y afinada en ImageNet-1k a 384 px. El decoder es UPerNet, que agrega características multi-escala mediante pooling piramidal y fusiona las salidas de distintas etapas del encoder para producir un mapa de probabilidad a la resolución de entrada. La entrada es un compuesto de falso color de tres canales construido a partir de las bandas 14 y 15 del ABI de GOES-16 (diferencias de temperatura de brillo en 11 µm y 12 µm, y temperatura en 11 µm), normalizado con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225].

El entrenamiento se realizó sobre la exportación `20250305` del dataset OpenContrails, con 20.088 escenas de entrenamiento de las que un 10 % (2.009 escenas, semilla 42) se reservaron para validación, quedando 18.079 escenas efectivas. Las etiquetas son fracciones por píxel de anotadores que marcaron una estela (etiquetas suaves). La receta: 40 épocas a 512 px, batch 32, AdamW con learning rate 1e-4 y weight decay 1e-2, schedule coseno con 3 épocas de warm-up, pérdida BCE + 0,2 × Dice, precisión mixta bf16 y aumentos de datos consistentes en volteos, rotaciones de 90° y pequeñas transformaciones de desplazamiento, escala y rotación. Se conservó el checkpoint con mejor Dice de validación. El modelo emplea test-time augmentation (TTA) promediando las 8 combinaciones de volteos y rotaciones, opción recomendada por el autor.

## Capacidades

- Segmentación semántica binaria píxel a píxel de estelas de condensación en imágenes GOES-16 ABI.
- Generación de mapas de probabilidad en el rango [0, 1] a la resolución de la entrada, con umbral configurable (por defecto 0,5).
- Procesamiento por lotes: la función `predict` acepta tensores de forma `(N, H, W, 3)`.
- Test-time augmentation integrado (promedio de 8 transformaciones geométricas).
- Construcción del compuesto de falso color a partir de bandas espectrales crudas mediante utilidades del paquete `deepcontrail-core`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de una sola tarea.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Monitorización climática de la aviación: el modelo permite cuantificar la cobertura de estelas sobre regiones extensas a partir de imágenes GOES-16, alimentando estudios de forzamiento radiativo y evaluaciones de impacto climático del sector aéreo.
- Rerutado sensible a estelas: integrado en herramientas de planificación de vuelo, el mapa de probabilidad por píxel puede cruzarse con trayectorias previstas para identificar segmentos con alta probabilidad de generar estelas persistentes y proponer desvíos.
- Validación de modelos meteorológicos y de micro física: las máscaras segmentadas sirven como verdad terreno para comparar simulaciones de formación de estelas con observaciones satelitales reales.
- Investigación atmosférica: el modelo facilita la creación de datasets etiquetados a gran escala a partir de archivos GOES-16, reduciendo el coste de anotación manual en estudios de nubes de hielo de origen antrópico.
- Sistemas de alerta temprana: en pipelines operativos que ingieren datos ABI en tiempo casi real, el modelo puede ejecutarse por lotes sobre escenas de 256 × 256 px para detectar episodios de formación masiva de estelas y activar análisis posteriores.
- Docencia y reproducción científica: al ser un checkpoint abierto con receta de entrenamiento publicada, sirve como referencia reproducible para cursos y trabajos sobre segmentación semántica en teledetección.
- Auditoría de emisiones no-CO₂: las máscaras permiten estimar la frecuencia y extensión de estelas por región y franja horaria, aportando datos para inventarios de impacto ambiental de operadores y reguladores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test retenido (1.879 escenas de los shards de validación de OpenContrails, nunca usados en entrenamiento ni selección de modelo):

| Inferencia | Umbral | Dice de test |
|---|---|---|
| Pasada única | 0,5 | 0,6892 |
| Pasada única | ajustado en validación | 0,6913 |
| Test-time augmentation | 0,5 | 0,6960 |
| Test-time augmentation | ajustado en validación | 0,6936 |

El autor indica que el entrenamiento en GPU no es reproducible bit a bit: cuatro entrenamientos con la misma configuración y semilla obtuvieron entre 0,6916 y 0,6960 (TTA, umbral 0,5), siendo este modelo el mejor de los cuatro. En la competición de Kaggle *Google Research – Identify Contrails to Reduce Global Warming*, un entrenamiento previo de la misma configuración obtuvo 0,6914 (privado) y 0,6994 (público) sobre el conjunto de test oculto, aunque las etiquetas de esa competición no son directamente comparables (IoU de solapamiento de aproximadamente 0,78 con las de `20250305`).

No se han publicado resultados de benchmarks estándar de visión (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 102,6 M de parámetros; en fp32 ocupa aproximadamente 0,41 GB de pesos, y en bf16/fp16 unos 0,21 GB. Sumando activaciones para lotes pequeños a 512 × 512, la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento, se recomienda una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB) por el batch 32 a 512 px y la precisión mixta bf16.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con 6 GB o más.
- Opciones de despliegue: el modelo se carga mediante la librería propia `deepcontrail` (instalable desde el repositorio de GitHub, no está en PyPI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Al estar basado en `segmentation-models-pytorch` y `timm`, es posible exportarlo a TorchScript o ONNX para servir con TorchServe o Triton, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido del modelo, se espera una latencia de decenas de milisegundos por escena en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepContrail segmentation (este modelo) | 102,6 M | 256 × 256 px (redimensionado a 512) | Segmentación de estelas en GOES-16 | Apache 2.0 | Hugging Face, repo GitHub |
| Modelos de la competición Kaggle *Identify Contrails* | no disponible | variable | Segmentación de estelas | variable según participante | Kaggle |
| Segmentadores genéricos (U-Net, DeepLabv3+, SegFormer) | variable (desde ~5 M hasta cientos de M) | variable | Segmentación semántica general | variable (MIT, Apache, etc.) | Hugging Face, timm, smp |

No se dispone de una comparativa cuantitativa con alternativas específicas de detección de estelas en la información proporcionada. Los segmentadores genéricos no están especializados en el dominio y requerirían reentrenamiento sobre OpenContrails para obtener resultados comparables. Los modelos presentados a la competición de Kaggle no tienen métricas públicas directamente comparables por diferencias en las etiquetas (IoU de solapamiento de aproximadamente 0,78 entre conjuntos).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con imágenes de GOES-16 ABI, por lo que su comportamiento en otros satélites (por ejemplo, Meteosat o Himawari) o en otras bandas espectrales no está validado.
- Tamaño y forma de escena: solo admite escenas de 256 × 256 px (redimensionadas internamente a 512 × 512); no soporta otros tamaños ni escenas no cuadradas.
- Convención de etiquetas: las máscaras de `20250305` están alineadas con las imágenes; las exportaciones antiguas `20230419` y los datos de Kaggle desplazan las máscaras medio píxel hacia abajo-derecha, por lo que es necesario llamar a `predict(..., pixel_shift=0.5)` en esos casos.
- Comparabilidad de métricas: las etiquetas de `20250305` y las de `20230419`/Kaggle solapan con un IoU de aproximadamente 0,78, por lo que las puntuaciones entre conjuntos no son directamente comparables.
- Riesgo de falsos positivos y negativos: el umbral por defecto de 0,5 puede no ser óptimo para todos los regímenes; el autor recomienda ajustarlo en validación según el caso de uso.
- Reproducibilidad: el entrenamiento en GPU no es reproducible bit a bit; cuatro ejecuciones idénticas produjeron variaciones de hasta 0,0044 en Dice de test.
- Licencia: los pesos son Apache 2.0, pero si se redistribuyen (tal cual o modificados) debe conservarse el archivo `NOTICE`. El código DeepContrail está bajo EUPL-1.2, y los datos de entrenamiento (OpenContrails) bajo CC BY 4.0, con atribución requerida a Google Research y a NOAA por las imágenes GOES-16.
- Dependencia de paquetes no publicados en PyPI: la librería `deepcontrail` debe instalarse desde GitHub, lo que añade fricción en producción y ata el despliegue a una revisión concreta.
- No apto para usos fuera de la teledetección: no es un modelo de lenguaje ni un modelo multimodal general; cualquier uso fuera de la segmentación de estelas en GOES-16 carece de garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eurocontrol-asu/deepcontrail-segmentation
- Repositorio DeepContrail: https://github.com/eurocontrol-asu/deepcontrail
- Configuración del experimento: https://github.com/eurocontrol-asu/deepcontrail/blob/v0.1.0/packages/segmentation/configs/experiment.yaml
- Conversor de OpenContrails: https://github.com/eurocontrol-asu/deepcontrail/tree/v0.1.0/tools/opencontrails
- Dataset OpenContrails: https://storage.googleapis.com/goes_contrails_dataset
- Paper de OpenContrails (Ng et al., 2024, IEEE TGRS): https://doi.org/10.1109/TGRS.2024.3353895 (referencia bibliográfica citada en la model card)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0 (datos de entrenamiento): https://creativecommons.org/licenses/by/4.0/
- Competición Kaggle *Identify Contrails to Reduce Global Warming*: https://www.kaggle.com/competitions/google-research-identify-contrails-reduce-global-warming
- Encoder CAFormer en timm: https://huggingface.co/timm/caformer_b36.sail_in22k_ft_in1k_384

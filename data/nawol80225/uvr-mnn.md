# nawol80225/uvr-mnn

## Resumen

`nawol80225/uvr-mnn` es un repositorio de pesos del modelo de separación de fuentes musicales MDX-NET, convertidos al formato de grafo MNN (Mobile Neural Network) de Alibaba. No se trata de un modelo de lenguaje ni de un modelo generativo de audio: es un conjunto de siete redes convolucionales de dominio específico que operan sobre espectrogramas complejos para separar voces, instrumentales, karaoke y reverberación de pistas musicales. Los pesos originales provienen del proyecto Ultimate Vocal Remover (UVR) de Anjok07, con arquitectura MDX-NET de Kuielab, y han sido únicamente reconvertidos con `mnnconvert` sin cuantización ni reentrenamiento.

El interés del repositorio es práctico: ofrece los mismos modelos que ya circulan en formato ONNX dentro del ecosistema UVR, pero en un grafo MNN de 52-67 MB por fichero, lo que facilita el despliegue en entornos donde MNN es la runtime disponible (aplicaciones móviles, motores de inferencia ligeros y pipelines con dependencia de MNN 3.6.2). La equivalencia numérica con la referencia ONNX está documentada por el autor con una diferencia absoluta máxima de ~1e-3 y similitud coseno ≥ 0.999999 sobre entrada aleatoria.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 13 de noviembre de 2026 y ocupa 0.4 GB. No incluye model card con métricas de calidad de separación (SDR, SIR, SAR), ni información sobre idiomas o pipeline de Hugging Face. La licencia declarada es MIT, heredada del proyecto UVR original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MDX-NET (red convolucional sobre espectrograma complejo, formato de grafo MNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija por modelo (ver tabla de ficheros) |
| Tipos de cuantización | fp32 únicamente (sin cuantización, según el autor) |
| Idiomas soportados | no aplica (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.mnn` (MNN, convertido desde ONNX con MNN 3.6.2) |

Detalle de ficheros incluidos:

| Fichero | Tensor de entrada | Tamaño |
|---|---|---|
| `uvr_mdx_net_voc_ft.mnn` | 1×4×3072×256 | 66.8 MB |
| `kim_vocal_2.mnn` | 1×4×3072×256 | 66.8 MB |
| `kim_inst.mnn` | 1×4×3072×256 | 66.8 MB |
| `uvr_mdxnet_kara_2.mnn` | 1×4×2048×256 | 52.8 MB |
| `uvr_mdx_net_inst_hq_5.mnn` | 1×4×2560×256 | 59.1 MB |
| `uvr_mdx_net_inst_hq_3.mnn` | 1×4×3072×256 | 66.8 MB |
| `reverb_hq_by_foxjoy.mnn` | 1×4×3072×512 | 66.8 MB |

Cada modelo expone un único tensor de entrada `input` y un único tensor de salida `output`, ambos en layout NCHW con cuatro canales que empaquetan el espectrograma complejo como `[real_low, imag_low, real_high, imag_high]`. El repositorio incluye `manifest.txt` con tamaño en bytes y SHA-256 de cada fichero.

## Arquitectura y entrenamiento

La arquitectura subyacente es MDX-NET, diseñada por Kuielab para separación de fuentes musicales. Opera en el dominio de la frecuencia: la entrada es un espectrograma complejo de cuatro canales (parte real e imaginaria de dos bandas de frecuencia) y la red produce una máscara o espectrograma estimado para la fuente objetivo (voz, instrumental, karaoke o reverberación, según el checkpoint). Los tensores de entrada fijos (3072×256, 2048×256, 2560×256 o 3072×512 según el modelo) determinan la ventana de audio procesable por inferencia; para pistas más largas es necesario segmentar y recomponer con solapamiento.

No se ha realizado ningún entrenamiento ni ajuste fino en este repositorio: los pesos son los originales de UVR publicados por Anjok07, únicamente reconvertidos de ONNX a MNN mediante `mnnconvert -f ONNX --modelFile <model>.onnx --MNNModel <model>.mnn --bizCode UVR` con MNN 3.6.2. El autor documenta que no hay cuantización (fp32) y que la salida coincide con la referencia ONNX con una diferencia absoluta máxima de ~1e-3 y similitud coseno ≥ 0.999999 sobre entrada aleatoria. No se dispone de información sobre el dataset de entrenamiento original, número de tokens o composición, al no incluirse en la model card.

## Capacidades

- Separación de voces (vocal extraction) sobre mezclas musicales estéreo.
- Extracción de instrumental (eliminación de voz) para karaoke y remezclas.
- Separación específica de karaoke (`uvr_mdxnet_kara_2`).
- Reducción o separación de reverberación (`reverb_hq_by_foxjoy`).
- Procesamiento por segmentos con entrada de espectrograma complejo empaquetado en cuatro canales.
- Ejecución sobre la runtime MNN, orientada a despliegue ligero y multiplataforma.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No es un modelo multilingüe ni procesa lenguaje natural.

## Casos de uso

- Karaoke automático: usar `uvr_mdxnet_kara_2.mnn` (entrada 1×4×2048×256, 52.8 MB) para separar la voz principal de una mezcla y generar una pista instrumental reproducible en un reproductor de karaoke.
- Remezcla y producción musical: aplicar `kim_inst.mnn` o `uvr_mdx_net_inst_hq_3.mnn` para aislar la instrumental y sustituir o procesar la voz por separado en un DAW.
- Limpieza de grabaciones: emplear `uvr_mdx_net_voc_ft.mnn` para extraer la voz de una mezcla y tratarla con reducción de ruido o ecualización posterior.
- Restauración de directos: usar `reverb_hq_by_foxjoy.mnn` (entrada 1×4×3072×512) para atenuar la reverberación de grabaciones en sala y acercar el resultado a un entorno seco.
- Despliegue en dispositivos con MNN: integrar los ficheros `.mnn` en una aplicación móvil o embebida que ya use la runtime MNN 3.6.2, evitando añadir una dependencia ONNX Runtime.
- Pipeline de preprocesado de datasets musicales: separar voces e instrumentales de forma masiva antes de entrenar modelos de transcripción, clasificación o generación musical, segmentando cada pista según la ventana de entrada del modelo elegido.
- Verificación de integridad en producción: usar `manifest.txt` (tamaño y SHA-256) para validar que los pesos desplegados coinciden con los publicados y evitar corrupciones en la distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la equivalencia numérica con la referencia ONNX: diferencia absoluta máxima de ~1e-3 y similitud coseno ≥ 0.999999 sobre entrada aleatoria. No hay datos de SDR, SIR, SAR ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan entre 52.8 MB y 66.8 MB en fp32; la activación depende del tamaño del tensor de entrada (hasta 1×4×3072×512) y del lote, por lo que la huella total es del orden de cientos de MB, no de GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o RTX 3060 queda enormemente sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU.
- Despliegue: la runtime objetivo es MNN (versión 3.6.2 usada en la conversión); también puede ejecutarse la referencia ONNX original con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| `nawol80225/uvr-mnn` (este repo) | MDX-NET | espectrograma complejo 1×4×H×W | 52.8-66.8 MB por fichero | MIT | MNN (fp32) |
| MDX-NET original (UVR / Anjok07) | MDX-NET | espectrograma complejo | equivalente | MIT | ONNX |
| Demucs (Meta) | híbrido tiempo-frecuencia | waveform | cientos de MB | MIT | PyTorch |
| Spleeter (Deezer) | U-Net sobre espectrograma | espectrograma | decenas de MB | MIT | TensorFlow |

No se dispone de datos de rendimiento (SDR/SIR) para establecer una comparación cuantitativa con Demucs o Spleeter en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- Dependencia de la runtime MNN 3.6.2: los ficheros `.mnn` pueden no cargar en versiones distintas de MNN; conviene fijar la versión en producción.
- Entrada de tamaño fijo: cada checkpoint impone una forma de tensor concreta; pistas más largas requieren segmentación y recomposición con solapamiento, lo que puede introducir artefactos en las fronteras si no se aplica crossfade.
- Sin cuantización: los pesos son fp32; no hay variantes int8 ni fp16 publicadas en este repositorio, lo que limita optimizaciones de memoria en dispositivos muy restringidos.
- Sin métricas de calidad de separación publicadas: no se puede verificar el SDR/SIR frente a otros modelos sin evaluar por cuenta propia.
- Licencia MIT heredada de UVR: permite uso comercial, pero conviene conservar la atribución a Anjok07 (UVR) y a Kuielab (arquitectura MDX-NET), tal como indica el propio autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Riesgo de alucinación no aplica; el riesgo relevante es de artefactos acústicos (separación imperfecta, sangrado entre fuentes) que dependen del checkpoint y de la mezcla de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nawol80225/uvr-mnn
- Descarga directa de ejemplo: https://huggingface.co/nawol80225/uvr-mnn/resolve/main/uvr_mdx_net_voc_ft.mnn?download=true
- Proyecto Ultimate Vocal Remover (Anjok07): https://github.com/Anjok07/ultimatevocalremovergui
- Runtime MNN (Alibaba): https://github.com/alibaba/MNN
- Arquitectura MDX-NET (Kuielab): no disponible como enlace en la información proporcionada

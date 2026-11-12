# oxide-lab/RMBG-1.4

## Resumen

`oxide-lab/RMBG-1.4` es una exportación canónica en `safetensors` del modelo de eliminación de fondo BRIA RMBG-1.4, preparada por oxide-lab para su runtime de preprocesado Lux3D TripoSG. No se trata de un modelo nuevo entrenado por oxide-lab, sino de una conversión tensor a tensor del checkpoint original de `briaai/RMBG-1.4`, con nombres y valores intactos, orientada a su consumo desde Rust mediante la librería Candle. El paquete incluye metadatos de procedencia, configuración resuelta y sumas de verificación.

El modelo subyacente es una red de segmentación de imagen BriaRMBG, basada en la arquitectura IS-Net de `xuebinqin/DIS` con modificaciones de BRIA, especializada en separar el sujeto del fondo y producir una máscara de primer plano monocanal. Con 44.075.590 parámetros y un repositorio de 0,2 GB, es un modelo ligero pensado para preprocesado de imágenes, no para generación de texto ni razonamiento.

La relevancia de esta ficha es acotada y específica: sirve a quien quiera reproducir el pipeline de TripoSG en Rust/Candle con pesos canónicos y verificados, o a quien necesite una copia íntegra del checkpoint RMBG-1.4 con integridad criptográfica comprobable. Conviene subrayar que la licencia del modelo base es solo para uso no comercial, y este paquete no amplía derechos: la separación en un repositorio propio existe precisamente para mantener explícita esa frontera de licencia frente al resto del stack TripoSG, que es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BriaRMBG / IS-Net (segmentación de imagen) |
| Parámetros totales | 44.075.590 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible; inferencia solo en F32 en el runtime Lux3D |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | BRIA RMBG 1.4 (uso no comercial; uso comercial requiere acuerdo con BRIA) |
| Formato de pesos | safetensors (`model.safetensors`, 176.381.952 bytes) |

Datos adicionales de integridad y estructura:

| Parámetro | Valor |
|---|---|
| Número de tensores | 798 (686 parámetros F32 + 112 buffers `num_batches_tracked` int64) |
| SHA-256 del archivo canónico | `fb54c81529b99336009dd76de98e11491fe85a956c937814e8178f17c04891aa` |
| SHA-256 del checkpoint origen | `46ef7fe46f2ae284d8f1aaa24bfa5fca5ef25a34e2c7caa890a0029eb100e87f` |
| Tamaño del repositorio | 0,2 GB |
| Pipeline (Hugging Face) | image-segmentation |
| Modelo base | `briaai/RMBG-1.4` |

## Arquitectura y entrenamiento

La arquitectura es BriaRMBG, una variante de IS-Net (Image Segmentation Network) adaptada por BRIA para matting y eliminación de fondo. La red produce una máscara de primer plano monocanal a partir de una imagen RGB normalizada. En el pipeline de referencia de TripoSG, se toma la primera salida lateral tras aplicar sigmoid, lo que indica un diseño con salidas auxiliares tipo deep supervision, habitual en IS-Net.

El paquete de oxide-lab no aporta entrenamiento propio ni datos de entrenamiento: es una copia tensor a tensor del checkpoint upstream, sin modificar valores ni nombres, conservando los buffers BatchNorm `num_batches_tracked` como int64. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de decodificación, porque no es un modelo generativo de lenguaje. La aportación técnica de este repositorio es la canonicalización y la validación numérica del runtime Rust/Candle frente a la ejecución PyTorch de referencia.

El preprocesado documentado es concreto: limitar el lado mayor de la imagen a 2000 píxeles, redimensionar RGB a 1024x1024 con interpolación bilineal compatible con torchvision y antialiasing, normalizar con media `[0.5, 0.5, 0.5]` y desviación `[1.0, 1.0, 1.0]`, ejecutar BriaRMBG, tomar la primera salida lateral sigmoide, reescalar la máscara, normalizar min-max, cuantizar a uint8, aplicar umbralizado de Otsu, eliminar componentes conexos de menos de 200 píxeles en conectividad 8 y componer el mayor componente de primer plano sobre blanco con 10 % de padding hasta hacerlo cuadrado.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB.
- Producción de máscara monocanal utilizable para matting y composición.
- Preprocesado de imágenes sin canal alfa válido para pipelines de generación 3D (TripoSG).
- Ejecución en Rust mediante Candle, con soporte de CPU, CUDA, Vulkan y WGPU; Metal compilable pero no probado en este repositorio.
- Verificación de integridad mediante SHA-256 y checksums por archivo.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: no es un modelo de lenguaje.
- No dispone de visión general (comprensión semántica de imágenes); su tarea es exclusivamente segmentación de primer plano.

## Casos de uso

- Preprocesado de TripoSG en Rust: usar el paquete como `--rmbg-model-path` en la CLI `lux3d-cli` para generar máscaras de primer plano antes de la reconstrucción 3D, manteniendo el stack principal bajo licencia MIT y esta dependencia separada.
- Eliminación de fondo por lotes en imágenes de producto: aplicar el pipeline documentado (redimensionado a 1024x1024, umbralizado de Otsu, eliminación de componentes pequeños) para obtener recortes limpios sobre fondo blanco, adecuados para catálogos de comercio electrónico.
- Composición fotográfica y edición: generar máscaras para reemplazar fondos en retratos o fotografía de estudio, con padding cuadrado del 10 % para encuadres consistentes.
- Automatización de assets para pipelines de renderizado: integrar la máscara resultante en herramientas de composición o motores gráficos que requieran alfa de calidad.
- Investigación y reproducción de resultados: comparar la ejecución Rust/Candle frente a PyTorch usando los datos de validación publicados (delta máximo absoluto de 1.311e-6 en la sigmoide de BriaRMBG, `pixel_values` uint8 exactos, delta de 2.384e-7 en `pixel_values` normalizados).
- Verificación de procedencia en entornos regulados: usar `manifest.json`, `checksums.json` y los SHA-256 para auditar que los pesos corresponden al checkpoint upstream sin alteraciones.
- Preprocesado condicional en servidores HTTP: configurar `LUX3D_RMBG_MODEL_PATH` para que el servidor cargue estos pesos solo cuando la entrada carezca de canal alfa utilizable, evitando coste innecesario en imágenes RGBA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye validación numérica de equivalencia entre la implementación Rust/Candle y la referencia PyTorch:

| Comprobación | Resultado |
|---|---:|
| Delta máximo absoluto en sigmoide de BriaRMBG | 1.311e-6 |
| `pixel_values` uint8 preprocesados | exactos |
| Delta máximo absoluto en `pixel_values` normalizados | 2.384e-7 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 44 millones de parámetros en F32, los pesos ocupan aproximadamente 176 MB, más activaciones para entradas de 1024x1024.
- GPU recomendadas: no disponibles en la información proporcionada; el runtime declara soporte para CUDA, Vulkan y WGPU, además de CPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no hay confirmación oficial ni modelos concretos listados; Metal está compilado pero no probado.
- Opciones de despliegue: CLI `lux3d-cli` con `--features cuda`, servidor HTTP de Lux3D con `--rmbg-model-path` o variable `LUX3D_RMBG_MODEL_PATH`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oxide-lab/RMBG-1.4` (este) | 44.075.590 | no disponible | validación numérica frente a PyTorch, sin benchmarks publicados | BRIA RMBG 1.4, no comercial | Hugging Face, runtime Rust/Candle |
| `briaai/RMBG-1.4` (upstream) | 44.075.590 | no disponible | no disponible en esta información | BRIA RMBG 1.4, no comercial | Hugging Face, PyTorch |
| IS-Net (`xuebinqin/DIS`) | no disponible | no disponible | no disponible | no disponible | repositorio GitHub |

La comparativa con alternativas de la misma categoría (por ejemplo, otros modelos de segmentación de primer plano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: RMBG-1.4 es source-available solo para uso no comercial; el uso comercial exige un acuerdo separado con BRIA. Este paquete no concede derechos adicionales.
- Riesgo de alucinación no aplica en el sentido generativo, pero la máscara puede incluir o excluir regiones incorrectamente en imágenes con sujetos ambiguos, fondos complejos o bordes finos; el pipeline mitiga parcialmente con umbralizado de Otsu y eliminación de componentes menores de 200 píxeles.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Limitaciones de entrada: el preprocesado recorta el lado mayor a 2000 píxeles y trabaja a 1024x1024, lo que puede perder detalle en imágenes de muy alta resolución.
- Inferencia solo en F32 en el runtime Lux3D; no hay cuantización disponible en este paquete.
- Los pesos solo se cargan cuando la imagen de entrada carece de canal alfa utilizable; entradas RGBA válidas siguen otra ruta.
- Metal está compilado pero no probado en este repositorio, lo que limita la confianza en despliegues macOS nativos.
- El paquete no incluye demo ni stack de entrenamiento upstream, solo pesos canónicos y metadatos.
- Para producción, verificar los SHA-256 antes de desplegar y confirmar la cobertura de licencia con BRIA si el uso es comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxide-lab/RMBG-1.4
- Modelo upstream: https://huggingface.co/briaai/RMBG-1.4
- Licencia BRIA RMBG 1.4: https://bria.ai/bria-huggingface-model-license-agreement/
- Acuerdo comercial BRIA: https://go.bria.ai/3B4Asxv
- Arquitectura de referencia IS-Net (DIS): https://github.com/xuebinqin/DIS

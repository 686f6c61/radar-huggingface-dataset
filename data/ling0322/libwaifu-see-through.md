# ling0322/libwaifu-see-through

## Resumen

libwaifu-see-through es un paquete de pesos, publicado por el usuario ling0322, que empaqueta los dos modelos del sistema See-through (SIGGRAPH Conference Papers '26, laboratorio shitagaki-lab) en el formato que consume la librería libwaifu. See-through resuelve la descomposición de una ilustración de personaje anime en las capas con las que fue dibujada: hasta veinticuatro capas separadas (pelo, cara, ojos, ropa, objetos sostenidos) con el contenido ocluido reconstruido en cada una, apiladas por profundidad y exportables como documento de Photoshop. En libwaifu la tarea se denomina `img2layers`.

El paquete no entrena nada nuevo: es una conversión de los pesos originales de layerdifforg/seethroughv0.0.2_layerdiff3d y layerdifforg/seethroughv0.0.1_marigold, modificada para eliminar el texto como entrada (los codificadores de texto no se distribuyen y sus condicionantes se calculan una sola vez y se incluyen en el paquete). Incluye una U-Net LayerDiff 3D derivada de Animagine XL 4.0 (SDXL) con el VAE de SDXL y el decodificador alfa de LayerDiffuse, más un modelo de profundidad Marigold sobre Stable Diffusion 2 afinado para ordenar las capas.

Su relevancia es doble: por un lado, expone una técnica de publicación de SIGGRAPH 2026 en un formato ejecutable desde Rust y C; por otro, es una alternativa con licencia permisiva para uso comercial (openrail++) en una tarea donde abundan herramientas cerradas. El repositorio ocupa 11,4 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente en dos etapas: U-Net LayerDiff 3D derivada de Animagine XL 4.0 (SDXL) + VAE de SDXL + decodificador alfa de LayerDiffuse; modelo de profundidad Marigold sobre Stable Diffusion 2 afinado para ordenar las capas |
| Parámetros totales | no disponible (el paquete ocupa 11,4 GB en float16/float32) |
| Parámetros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto; la condicional textual está precalculada dentro del paquete) |
| Tipos de cuantización | no disponible; los pesos se distribuyen en float16 (U-Net y decodificador alfa) y float32 (VAE de ambos modelos) |
| Idiomas soportados | no disponible; no hay entrada ni salida de texto |
| Licencia | openrail++ (se aplican las licencias OpenRAIL de los modelos base, con las restricciones de uso del párrafo 5 y del Anexo A) |
| Formato de pesos | paquete libwaifu: `see-through.yaml` más seis partes; no es safetensors ni GGUF |
| Tarea | `img2layers` (descomposición de imagen en capas) |
| Entrada | una ilustración; medida de referencia 928 × 1232 px |
| Salida | hasta 24 capas con relleno de oclusión, documento PSD y PSD de profundidad |
| Resolución de inferencia por defecto | 1280 para el modelo de capas, 768 para el de profundidad |
| Pasos por defecto | 30 (capas) y 4 (profundidad) |
| Tamaño del repositorio | 11,4 GB |

## Arquitectura y entrenamiento

El sistema encadena dos modelos de difusión. El primero, LayerDiff 3D, es una U-Net de arquitectura SDXL inicializada desde Animagine XL 4.0 que genera simultáneamente todas las capas en un único proceso de difusión, apoyándose en el VAE de SDXL para el espacio latente y en el decodificador alfa de LayerDiffuse para producir la transparencia de cada capa. El segundo es Marigold, un modelo de estimación de profundidad construido sobre Stable Diffusion 2 y afinado aquí para establecer el orden de apilamiento de las capas generadas. La condicional de ambos modelos es fija: el de capas se condiciona al nombre de cada capa y el de profundidad al prompt vacío, de modo que el paquete incorpora esas representaciones ya calculadas y prescinde de los codificadores de texto.

Esta publicación no aporta entrenamiento propio: es una copia modificada de los pesos de layerdifforg, convertida de bfloat16 a float16/float32 y reempaquetada para libwaifu. Los detalles del entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La innovación técnica del paquete es de ingeniería: elimina la dependencia de codificadores de texto, integra ambos modelos en un único manifiesto y verifica numéricamente la fidelidad de la conversión contra las tuberías originales en float32.

## Capacidades

- Descomposición de una ilustración anime en hasta 24 capas semánticas: pelo, cara, ojos, ropa, objetos sostenidos y otros elementos dibujados.
- Relleno de oclusión: reconstruye el contenido que cada capa oculta tras las capas superiores, de modo que las capas son utilizables de forma independiente.
- Ordenación por profundidad mediante el modelo Marigold, con exportación de un PSD de profundidad además del PSD de capas.
- Exportación directa a formato Photoshop (`layers.to_psd()` y `layers.to_depth_psd()`).
- Condicionamiento por nombre de capa sin prompt de usuario: el resultado no depende de instrucciones textuales.
- Integración como librería: API en Rust (`SeeThrough::from_manifest`, `model.decompose`) y API en C (`waifu_engine_layers_async` en `waifu.h`).
- Ejecución en GPU CUDA (`Device::Cuda`) con soporte de FlashAttention.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje y no acepta ni produce texto libre.

## Casos de uso

- **Rigging de personajes VTuber y Live2D**: la separación en hasta 24 capas con oclusión reconstruida proporciona las piezas necesarias (pelo delantero y trasero, ojos, boca, ropa) para animar un personaje sin repintar manualmente las zonas tapadas.
- **Producción de animación tradicional por capas**: a partir de un solo fotograma ilustrado se obtiene un PSD con jerarquía de profundidad que se puede importar en After Effects, Krita o Photoshop para animación por parallax o composición multicapa.
- **Edición no destructiva de ilustraciones**: cambiar el color del pelo, sustituir una prenda o recolocar un accesorio tocando únicamente la capa afectada, ya que el relleno de oclusión evita huecos al mover elementos.
- **Preparación de material para impresión y merchandising**: la separación por capas facilita la producción de serigrafía, vinilos y figuras al permitir aislar siluetas y elementos con transparencia.
- **Generación de datasets de capas para entrenamiento**: el pipeline produce pares imagen/capas con profundidad de forma automatizada, útil para entrenar modelos de segmentación o de generación por capas en dominio anime.
- **Retoque y remasterización de arte existente**: ilustraciones antiguas o aplanadas pueden recuperarse como documentos editables sin acceso al fichero original del artista.
- **Herramientas de escritorio integradas**: al exponerse como librería Rust y C, puede embeberse en aplicaciones nativas de dibujo o en plugins sin depender de un servicio externo, manteniendo la imagen en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es lingüístico. Sí se documenta una validación numérica de fidelidad frente a las tuberías originales en float32, sobre entradas tomadas de una ejecución real de `test_image.png`:

| Métrica (error relativo frente a float32) | libwaifu (float16) | Upstream (bfloat16) |
|---|---|---|
| U-Net de capas, un paso | 0,035 % | 0,26 % |
| U-Net de profundidad, un paso | 0,041 % | 0,25 % |
| Decodificación del VAE | 0,0004 % | 2,4 % |
| VAE + decodificador alfa | 0,058 % | 0,54 % |

| Medición de velocidad | Valor |
|---|---|
| Hardware | RTX 5060 Ti 16 GB |
| Entrada y ajustes | 928 × 1232 px, 1280/30 pasos + profundidad 768/4 pasos |
| Tiempo libwaifu con FlashAttention | 472 s |
| Tiempo upstream | 398 s |
| Rendimiento aproximado | 0,0021 imágenes/s |

Los tensores de referencia para reproducir la comparación están en `see-through_test.safetensors`, dentro de ling0322/libwaifu_test_data.

## Requisitos de hardware

- VRAM estimada: 16 GB resultan suficientes en la configuración por defecto; a resolución 1280, una tarjeta de 16 GB aloja todos los pesos salvo aproximadamente 2,4 GB, que deben descargarse a memoria del sistema.
- GPU recomendadas: RTX 5060 Ti 16 GB es la única configuración con medición publicada (472 s). Por encima de 16 GB (RTX 4090, RTX 5090, A100, H100) se elimina la descarga parcial de pesos, aunque no hay cifras de latencia publicadas para esas tarjetas.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más; por debajo de ese umbral no hay datos y la descarga parcial sería sustancialmente mayor.
- Almacenamiento: 11,4 GB para el paquete completo (`see-through.yaml` y sus seis partes).
- Opciones de despliegue: exclusivamente la librería libwaifu, con API Rust o C sobre `Device::Cuda`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: 472 s por ilustración en RTX 5060 Ti 16 GB con FlashAttention, equivalente a unas 0,0021 imágenes por segundo en una única GPU; no hay desglose por etapa ni datos de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Precisión de pesos | Tiempo (RTX 5060 Ti 16 GB, 928 × 1232) | Error vs float32 (U-Net de capas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| libwaifu-see-through (esta ficha) | float16 + float32 | 472 s con FlashAttention | 0,035 % | openrail++ | Paquete libwaifu, API Rust y C |
| See-through upstream (layerdifforg) | bfloat16 | 398 s | 0,26 % | OpenRAIL de los modelos base | Pesos originales en HuggingFace |
| Otras herramientas de descomposición de capas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es entre el paquete y su upstream: libwaifu es entre 5 y 7 veces más fiel al resultado en float32 en las etapas de U-Net y decodificación, y unas 60 veces más fiel en el VAE, a cambio de un 18,6 % más de tiempo de inferencia (472 s frente a 398 s). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el modelo está especializado en ilustraciones de personajes anime; no hay evidencia de comportamiento en fotografía, arte occidental u otros estilos.
- Sin entrada de texto: no se puede dirigir la descomposición con instrucciones; el número y la semántica de las capas dependen del condicionamiento por nombre precalculado.
- Riesgo de contenido inventado: las zonas ocultas se reconstruyen por inferencia, por lo que el relleno de oclusión puede no coincidir con lo que el artista dibujó originalmente y debe revisarse en producción.
- Ausencia de benchmarks públicos y de validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones en la fecha de consulta.
- No es una publicación oficial: es una copia modificada, no respaldada por los autores de See-through; los cambios se documentan en el fichero `NOTICE`.
- Licencia con restricciones de uso: aunque openrail++ permite uso comercial, se heredan el párrafo 5 y el Anexo A de las licencias OpenRAIL de los modelos base, y quien redistribuya los ficheros o los ofrezca como servicio debe trasladar esas restricciones a terceros.
- Formato propietario: el paquete solo es consumible por libwaifu; no hay conversión publicada a safetensors, GGUF ni a otros runners, lo que limita la portabilidad.
- Sin cuantizaciones: no se ofrecen versiones de 8 o 4 bits, de modo que el despliegue exige 16 GB de VRAM o descarga parcial de pesos.
- Coste de inferencia alto para uso interactivo: cerca de ocho minutos por imagen en la GPU medida.
- Idiomas y sesgos demográficos: no disponible; al no procesar texto, no aplican sesgos lingüísticos, pero el corpus de ilustración anime subyacente puede arrastrar sesgos de representación no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ling0322/libwaifu-see-through
- Repositorio de See-through: https://github.com/shitagaki-lab/see-through
- Librería libwaifu: https://github.com/ling0322/libwaifu
- Documentación de la tarea en libwaifu: https://github.com/ling0322/libwaifu/blob/main/docs/see_through.md
- Pesos originales del modelo de capas: https://huggingface.co/layerdifforg/seethroughv0.0.2_layerdiff3d
- Pesos originales del modelo de profundidad: https://huggingface.co/layerdifforg/seethroughv0.0.1_marigold
- Tensores de referencia de los tests: https://huggingface.co/ling0322/libwaifu_test_data
- Artículo (SIGGRAPH Conference Papers '26): https://doi.org/10.1145/3799902.3811209

# mflux-community/iris-3b-mflux-q8

## Resumen

Iris-3B MFlux Q8 es una conversión comunitaria del modelo de generación de imágenes text-to-image `speridlabs/iris-3b` al formato nativo MLX de Apple, cuantizado a 8 bits y empaquetado para su uso con la herramienta MFlux. El modelo original, desarrollado por Sperid Labs, tiene aproximadamente 3.000 millones de parámetros y sigue una arquitectura de difusión con text encoder, transformer y VAE, tal como se deduce de la descripción de la cuantización aplicada a esos tres componentes. Esta versión concreta no la publica el autor original, sino MFlux-Community, que se limita a convertir y cuantizar los pesos sin modificar la licencia ni el comportamiento del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un modelo generativo de imágenes de 3B en hardware Apple Silicon de forma local, sin depender de servicios en la nube y con un peso en disco de 8,0 GB para la variante Q8. Frente al BF16 de 14,0 GB, la cuantización a 8 bits reduce a la mitad el espacio ocupado, lo que facilita su uso en Macs con memoria unificada moderada. El repositorio acumula 44 descargas y no tiene likes en el momento de la consulta, lo que indica una adopción todavía muy temprana.

No se dispone de información sobre idiomas soportados, número exacto de parámetros activos, longitud de contexto del text encoder ni resultados de benchmarks en la documentación proporcionada. La ficha se completa con los datos disponibles y se marca explícitamente como no disponible todo aquello que la model card no detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión text-to-image con text encoder, transformer y VAE (según la descripción de la cuantización aplicada); detalles internos no disponibles |
| Parametros totales | Aproximadamente 3.000 millones (denominación "3b" del modelo base); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8 (MLX affine quantization de 8 bits); existen variantes BF16 y Q4 en la misma comunidad |
| Idiomas soportados | No disponible |
| Licencia | iris-3b-license (licencia "other"); términos completos en la model card del modelo base |
| Formato de pesos | Safetensors en formato MLX (librería mflux); cuantización almacenada en los pesos |
| Tamano del repositorio | 8,0 GB |
| Pipeline | text-to-image |
| Fecha de conversión | 2026-10-27, con MFlux 0.24.0 |
| Modelo base | speridlabs/iris-3b |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura de forma indirecta: la cuantización MLX de 8 bits se aplica "across the text encoder, transformer and VAE", lo que confirma que Iris-3B sigue el esquema habitual de los modelos de difusión para texto a imagen, con un codificador de texto que procesa el prompt, un transformer de difusión que genera las latentes y un VAE que las decodifica a píxeles. No se especifican el tipo de text encoder (CLIP, T5 u otro), el número de bloques del transformer, la resolución nativa de entrenamiento ni el scheduler utilizado.

Tampoco se detallan los datos de entrenamiento: no hay información sobre el número de tokens o pares imagen-texto, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card de esta conversión no incluye innovaciones técnicas más allá de la propia cuantización MLX, que se realiza con cuantización afín de 8 bits y se almacena directamente en los pesos, de modo que no es necesario pasar un flag `--quantize` en tiempo de inferencia. Para obtener detalles de arquitectura y entrenamiento habría que consultar la model card del modelo base, que no se incluye en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución configurable mediante parámetros de ancho y alto; el ejemplo de la model card usa 1024x1024.
- Control de la semilla aleatoria (`--seed`) para reproducibilidad de las generaciones.
- Ejecución local nativa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicios en la nube.
- Cuantización integrada en los pesos: el nivel Q8 se detecta automáticamente, sin flags adicionales.
- Compatibilidad con el ecosistema MFlux, que permite descargar los pesos desde el Hub en el primer uso o mantener una copia local.
- No se documentan capacidades de edición de imagen, inpainting, control por imagen de referencia, tool calling ni razonamiento multi-paso; la información disponible solo cubre generación texto-imagen.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: un diseñador puede lanzar `mflux-generate-iris` con prompts descriptivos y obtener imágenes de 1024x1024 en local, iterando con distintas semillas sin coste por llamada ni latencia de red.
- Creación de assets para videojuegos y aplicaciones indie: el modelo cabe en 8,0 GB de disco y se ejecuta en un Mac con memoria unificada, lo que permite a estudios pequeños generar concept art y texturas de referencia sin infraestructura cloud.
- Automatización de contenido para blogs y redes: integrado en un script de Python o en un pipeline CI, el modelo puede generar imágenes de cabecera a partir de títulos de artículo, usando la semilla para mantener consistencia entre ejecuciones.
- Investigación en generación de imágenes en hardware de consumo: al ser una conversión MLX cuantizada, sirve para medir el impacto de la cuantización Q8 frente a BF16 y Q4 en calidad y velocidad sobre Apple Silicon, comparando las tres variantes publicadas por la comunidad.
- Docencia y experimentación sin GPU: en entornos académicos con Macs, permite a estudiantes ejecutar un modelo de difusión de 3B sin depender de clústeres con A100/H100, reduciendo la barrera de entrada.
- Generación de material visual para maquetas y presentaciones: la resolución configurable y el control de semilla permiten producir lotes de imágenes coherentes para documentos internos, con la ventaja de que los datos no salen del equipo local.
- Pruebas de integración con MFlux: desarrolladores que quieran validar sus propios pipelines sobre MLX pueden usar este repositorio como referencia de un modelo text-to-image cuantizado y funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio Q8 ocupa 8,0 GB en disco; en inferencia se necesita memoria adicional para activaciones y buffers, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon para trabajar con comodidad. La cifra exacta de memoria pico no está documentada.
- GPU recomendadas: el modelo está diseñado para Apple Silicon vía MLX; no se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta conversión concreta.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; el formato MLX no es compatible con CUDA.
- Opciones de despliegue: MFlux (instalación con `uv tool install --upgrade mflux`), ejecutable `mflux-generate-iris`; descarga de pesos con `hf download` para uso local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris-3B MFlux Q8 (este) | ~3B | No disponible | MLX safetensors Q8, 8,0 GB | iris-3b-license | HuggingFace, 44 descargas |
| Iris-3B MFlux BF16 | ~3B | No disponible | MLX safetensors BF16, 14,0 GB | iris-3b-license | HuggingFace (misma comunidad) |
| Iris-3B MFlux Q4 | ~3B | No disponible | MLX safetensors Q4, 5,1 GB | iris-3b-license | HuggingFace (misma comunidad) |
| speridlabs/iris-3b (original) | ~3B | No disponible | Formato original no especificado | iris-3b-license | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores de otros autores en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Conversión no oficial: este repositorio lo publica MFlux-Community, no Sperid Labs; los pesos solo se han convertido a MLX y cuantizado, pero no hay garantía de paridad exacta con el modelo original.
- Licencia restrictiva potencial: la licencia `iris-3b-license` es de tipo "other" y los términos completos están en la model card del modelo base; es imprescindible revisarlos antes de cualquier uso comercial, ya que pueden existir restricciones no detalladas aquí.
- Sesgos y alucinaciones visuales: al no publicarse información sobre los datos de entrenamiento ni evaluaciones de sesgo, no se puede descartar que el modelo reproduzca estereotipos o genere imágenes incoherentes con el prompt; se recomienda revisión humana en producción.
- Idiomas: se desconoce qué idiomas soporta el text encoder; el ejemplo de la model card está en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto del text encoder: no disponible, lo que impide garantizar un buen comportamiento con prompts muy largos o complejos.
- Dependencia de hardware Apple: el formato MLX no se ejecuta en GPU NVIDIA ni en CPU x86 de forma directa, lo que limita el despliegue a Macs con Apple Silicon.
- Cuantización Q8: aunque la pérdida de calidad suele ser menor que en Q4, no se han publicado métricas que cuantifiquen la degradación respecto a BF16.
- Madurez: 44 descargas y 0 likes indican poca validación por parte de la comunidad; conviene probar el modelo en el caso de uso concreto antes de adoptarlo.
- Fecha de creación futura en los metadatos (2026-10-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- MFlux (GitHub): https://github.com/filipstrand/mflux
- MFlux-Community en HuggingFace: https://huggingface.co/mflux-community

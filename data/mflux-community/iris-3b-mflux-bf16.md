# mflux-community/iris-3b-mflux-bf16

## Resumen

Iris-3B MFlux BF16 es una conversión comunitaria del modelo de generación de imágenes texto-a-imagen `speridlabs/iris-3b` al formato MLX, empaquetada para su ejecución nativa en Apple Silicon mediante la herramienta MFlux. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los originales del modelo Iris-3B de Sperid Labs, transformados únicamente al formato de tensores de MLX en precisión BF16 (sin cuantización). El repositorio lo mantiene la organización MFlux-Community, no los autores originales.

El modelo resuelve el problema de ejecutar localmente un generador de imágenes de 3B parámetros en Macs con chip Apple Silicon, sin depender de CUDA ni de servicios en la nube. MFlux es una implementación open source en MLX que permite lanzar modelos generativos de imagen de última generación en hardware de Apple, y esta conversión concreta actúa como referencia de máxima fidelidad (BF16 completo, 14,0 GB) frente a las variantes cuantizadas Q8 (8,0 GB) y Q4 (5,1 GB) publicadas por el mismo grupo.

La relevancia es acotada pero clara: para desarrolladores que trabajan en macOS y quieren integrar generación de imágenes en sus flujos locales, esta es una vía directa con un modelo de 3B parámetros y resolución de trabajo de 1024×1024 (según el ejemplo de uso de la model card). La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen, según pipeline `text-to-image`; detalles internos no publicados en la información disponible) |
| Parametros totales | 3B (según el nombre del modelo base, `iris-3b`) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16 (este repo, sin cuantización); Q8 y Q4 disponibles en repos separados; soporte de `--quantize` en tiempo de ejecución |
| Idiomas soportados | no disponible (los prompts del ejemplo están en inglés) |
| Licencia | `iris-3b-license` (licencia propia del modelo original, categoría "other") |
| Formato de pesos | safetensors en formato MLX (BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Iris-3B en la documentación proporcionada. La etiqueta de pipeline `text-to-image` y el uso mediante `mflux-generate-iris` indican que se trata de un modelo generativo de imágenes condicionado por texto, con un tamaño de 3B parámetros y resolución de generación de 1024×1024 en el ejemplo oficial. No se detallan el tipo de backbone (UNet, transformer de difusión u otro), el esquema de ruido, el text encoder asociado ni el scheduler.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens o pares imagen-texto, ni sobre si se aplicaron etapas de ajuste por preferencias humanas. La única información técnica verificable sobre este repositorio es el proceso de conversión: los pesos originales se transformaron a MLX con la versión 0.24.0 de MFlux el 27 de octubre de 2026, en precisión BF16 completa. No se documentan innovaciones técnicas adicionales más allá del propio soporte nativo en MLX para Apple Silicon.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image).
- Control de resolución de salida mediante parámetros de ancho y alto (ejemplo oficial a 1024×1024).
- Reproducibilidad mediante semilla fija (`--seed`).
- Ejecución local nativa en Apple Silicon a través de MLX, sin CUDA.
- Cuantización en tiempo de ejecución mediante el flag `--quantize` sobre los pesos BF16.
- Descarga automática de pesos desde Hugging Face en el primer uso, o uso de copia local.
- No se documentan capacidades de edición de imagen, inpainting, control por imagen de referencia, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Prototipado rápido de assets visuales en macOS: un desarrollador puede generar ilustraciones de prueba a 1024×1024 desde la línea de comandos con `mflux-generate-iris`, sin montar infraestructura GPU ni contratar APIs, usando directamente el chip Apple Silicon de su equipo.
- Generación de imágenes de referencia para diseño de producto: el modelo sirve para producir variaciones rápidas de conceptos (por ejemplo, "un frailecillo de pie en un acantilado") que alimenten fases tempranas de diseño, aprovechando la ejecución local para iterar sin coste por llamada.
- Integración en pipelines de contenido para blogs o documentación: automatizar la creación de imágenes de cabecera a partir de descripciones textuales dentro de un script de publicación, con semilla fija para reproducir resultados entre builds.
- Pruebas de regresión visual en CI local sobre Mac: al ser un build BF16 determinista con semilla, permite comparar salidas entre versiones de MFlux o de los pesos para detectar cambios de comportamiento en la generación.
- Evaluación comparativa de cuantizaciones: el repo BF16 actúa como referencia de máxima fidelidad frente a las variantes Q8 y Q4 del mismo grupo, útil para medir la pérdida de calidad introducida por la cuantización en un hardware concreto.
- Demos y talleres sobre IA generativa en Apple Silicon: al instalarse con `uv tool install mflux` y ejecutarse con un único comando, es adecuado para entornos formativos donde no se dispone de GPUs NVIDIA.
- Uso offline en entornos con conectividad restringida: tras descargar los pesos con `hf download`, la generación puede ejecutarse sin conexión, lo que encaja en flujos de trabajo con requisitos de privacidad o aislamiento de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: al ejecutarse en Apple Silicon con memoria unificada, el requisito se mide en RAM del sistema. El repo BF16 ocupa 14,0 GB en disco, por lo que se necesita un Mac con memoria unificada holgada (orientativamente 24 GB o más para dejar margen al sistema y al proceso de inferencia; cifra no confirmada en la documentación).
- Alternativas de menor huella: la variante Q8 ocupa 8,0 GB y la Q4 5,1 GB, lo que amplía el rango de equipos compatibles.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y posteriores). No aplica a GPUs NVIDIA o AMD, ya que MFlux usa MLX.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que está pensado para hardware de consumo de Apple; no está diseñado para GPUs discretas de consumo tipo RTX 4090.
- Opciones de despliegue: MFlux (instalación vía `uv tool install --upgrade mflux`), con el comando `mflux-generate-iris`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / runtime | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-mflux-bf16 (este repo) | 3B | MLX / MFlux (BF16) | 1024×1024 en el ejemplo oficial | `iris-3b-license` | Hugging Face, 43 descargas |
| iris-3b-mflux-q8 | 3B | MLX / MFlux (Q8, 8,0 GB) | no disponible | `iris-3b-license` | Hugging Face |
| iris-3b-mflux-q4 | 3B | MLX / MFlux (Q4, 5,1 GB) | no disponible | `iris-3b-license` | Hugging Face |
| speridlabs/iris-3b (original) | 3B | Pesos originales (no MLX) | no disponible | `iris-3b-license` | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio lo mantiene MFlux-Community y no los autores originales de Iris-3B; no debe tratarse como una release oficial.
- Licencia restrictiva potencial: la licencia `iris-3b-license` está catalogada como "other" y remite a los términos del modelo original; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- Sin datos de sesgo ni de alucinación visual: no se documentan evaluaciones de sesgos, fidelidad al prompt ni tasas de error, por lo que no hay garantías publicadas de calidad.
- Idiomas no especificados: no se confirma qué idiomas distintos del inglés maneja correctamente el text encoder; los ejemplos oficiales están en inglés.
- Solo Apple Silicon: al estar en formato MLX, no es portable a CUDA ni a CPU genérica sin reconversión.
- Huella de memoria elevada en BF16: 14,0 GB de pesos exigen equipos con memoria unificada amplia; en configuraciones ajustadas conviene usar Q8 o Q4.
- Sin garantías de determinismo entre versiones: aunque se admite `--seed`, no se documenta estabilidad de resultados entre versiones de MFlux.
- Documentación técnica mínima: no hay información sobre arquitectura, datos de entrenamiento ni evaluación, lo que dificulta auditar el modelo para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Modelo original: https://huggingface.co/speridlabs/iris-3b
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Licencia del modelo original: https://huggingface.co/speridlabs/iris-3b

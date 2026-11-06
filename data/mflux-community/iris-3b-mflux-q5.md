# mflux-community/iris-3b-mflux-q5

## Resumen

Iris-3B MFlux Q5 es una conversión comunitaria del modelo de generación de imágenes text-to-image `speridlabs/iris-3b` al formato MLX, cuantizado a 5 bits mediante cuantización afín de MLX. Lo publica la organización `mflux-community` y está pensado para ejecutar el modelo de forma nativa en Apple Silicon a través de MFlux, la herramienta open source de Filip Strand que implementa los modelos generativos de imagen más recientes sobre MLX.

El modelo base tiene 3.000 millones de parámetros (según el nombre `iris-3b`) y una arquitectura de difusión con tres componentes cuantizados: text encoder, transformer y VAE. Esta versión Q5 ocupa 5,6 GB en disco, frente a los 14,0 GB de la versión BF16, lo que la hace viable en Macs con memoria unificada moderada sin renunciar a demasiada fidelidad respecto al original.

Su relevancia es práctica: permite generar imágenes de 1024x1024 localmente en un Mac, sin dependencias de servicios en la nube, con licencia Apache 2.0 y sin necesidad de pasar flags de cuantización, ya que el nivel Q5 está almacenado en los propios pesos. Es una conversión no oficial: los pesos solo se han convertido a MLX y cuantizado, y la licencia del modelo original se mantiene intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (text encoder + transformer + VAE), ejecutado en MLX |
| Parametros totales | 3.000 millones (según denominación `iris-3b`; desglose por componente no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine quantization de 5 bits (Q5); el repo ofrece también BF16, Q8, Q6, Q4 y Q3 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo card no detalla cobertura lingüística) |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `speridlabs/iris-3b` es un generador de imágenes text-to-image de 3.000 millones de parámetros. La conversión MFlux mantiene la estructura original en tres bloques diferenciados que se cuantizan de forma independiente: el text encoder que procesa el prompt, el transformer de difusión que realiza el proceso de denoising y el VAE que decodifica el latente final a píxeles. La cuantización se aplica con cuantización afín de MLX a 5 bits sobre los tres componentes, y el nivel queda grabado en los pesos, de modo que el runtime no necesita configuración adicional.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO en el modelo original. La conversión se realizó con MFlux 0.24.0 el 30 de octubre de 2026 y no introduce ningún cambio arquitectónico más allá de la conversión a MLX y la cuantización.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image), con resolución configurable; el ejemplo oficial usa 1024x1024.
- Control de semilla (`--seed`) para reproducibilidad de la generación.
- Control de dimensiones de salida mediante `--width` y `--height`.
- Ejecución local nativa en Apple Silicon mediante MLX, sin servicios externos.
- Cuantización embebida en los pesos: no requiere flag `--quantize` en el runtime.
- No se documentan capacidades de edición de imagen, inpainting, control por imagen de referencia, tool calling ni agentes; el pipeline declarado es exclusivamente `text-to-image`.
- No se documentan capacidades multilingües específicas ni modos de razonamiento.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: un desarrollador puede generar imágenes de referencia a 1024x1024 en su Mac con `mflux-generate-iris` para validar conceptos visuales antes de encargar arte final, sin coste de API.
- Creación de assets para demos y documentación: útil para producir imágenes de ejemplo en repositorios, presentaciones o documentación técnica, con semilla fija para que las capturas sean reproducibles.
- Exploración creativa local sin conexión: al ejecutarse íntegramente en el Mac, permite iterar prompts en entornos sin red o con requisitos de privacidad, ya que el prompt no sale del equipo.
- Pruebas de pipelines de generación de imagen en CI local: el formato MLX y la ausencia de flag de cuantización simplifican scripts de validación que comprueban que el modelo carga y genera con una semilla dada.
- Evaluación comparativa de cuantizaciones: al existir versiones BF16, Q8, Q6, Q5, Q4 y Q3 del mismo modelo, sirve para medir el compromiso entre calidad visual y memoria en Apple Silicon antes de fijar una versión en producción.
- Generación de material gráfico para aplicaciones de escritorio en macOS: integrable en apps nativas que quieran ofrecer generación de imágenes offline aprovechando MLX y la memoria unificada del chip.
- Docencia y experimentación con modelos de difusión: un modelo de 3B en 5,6 GB es manejable en un portátil para estudiar el comportamiento de un pipeline text-to-image completo (encoder, transformer y VAE) sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 5,6 GB en disco en Q5; se necesita memoria unificada suficiente para cargar los pesos más el overhead de inferencia (no cuantificado en la información disponible). Como referencia, las variantes del mismo modelo van de 4,3 GB (Q3) a 14,0 GB (BF16).
- GPU recomendadas: Apple Silicon exclusivamente (MLX). No hay soporte documentado para CUDA ni ROCm en esta conversión.
- Cabe en consumer hardware: sí, en Macs con Apple Silicon y memoria unificada suficiente; el tamaño Q5 de 5,6 GB lo sitúa al alcance de configuraciones de 16 GB o superiores, aunque el margen real para el proceso de difusión a 1024x1024 no está documentado.
- Opciones de despliegue: MFlux (instalación vía `uv tool install --upgrade mflux`), con el comando `mflux-generate-iris`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-mflux-q5 (este) | 3B | 1024x1024 en el ejemplo oficial | MLX safetensors Q5, 5,6 GB | Apache 2.0 | Hugging Face, conversión comunitaria |
| speridlabs/iris-3b (original) | 3B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| iris-3b-mflux-bf16 | 3B | 1024x1024 en el ejemplo oficial | MLX safetensors BF16, 14,0 GB | Apache 2.0 | Hugging Face, conversión comunitaria |
| iris-3b-mflux-q3 | 3B | 1024x1024 en el ejemplo oficial | MLX safetensors Q3, 4,3 GB | Apache 2.0 | Hugging Face, conversión comunitaria |

No se dispone de datos de rendimiento comparado con otros modelos de difusión de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: `mflux-community` advierte explícitamente de que no es un lanzamiento de los autores originales; los pesos solo se han convertido a MLX y cuantizado.
- La cuantización a 5 bits puede degradar la fidelidad visual respecto a BF16; no se documenta la magnitud de esa pérdida.
- Exclusivo de Apple Silicon: no funciona en GPUs NVIDIA, AMD ni en CPU convencional a través de esta conversión.
- No se documentan sesgos del modelo base ni evaluaciones de seguridad; al ser un generador de imágenes, existe riesgo de sesgos demográficos y estilísticos heredados del entrenamiento original.
- Riesgo de generar contenido inapropiado o no fiel al prompt; no se documentan filtros de seguridad en el pipeline.
- Cobertura lingüística de los prompts no documentada; conviene validar el comportamiento en castellano antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se remite a la model card del modelo original para términos y posibles restricciones adicionales.
- Sin garantías de mantenimiento: es un repo comunitario con 25 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-mflux-q5
- Modelo original: https://huggingface.co/speridlabs/iris-3b
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/iris-3b-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/iris-3b-mflux-q3

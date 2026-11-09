# ahmedihamdy/Ornith-1.5-9B-MLX-6bit-vision

## Resumen

Ornith-1.5-9B-MLX-6bit-vision es una compilación comunitaria del modelo multimodal Ornith-1.5-9B, desarrollado originalmente por ornith-ai, en formato MLX cuantizado a 6 bits para su ejecución en Apple Silicon. El autor de esta variante es ahmedihamdy, que reconstruye el modelo a partir de dos fuentes: los pesos de texto ya cuantizados de `ornith-ai/Ornith-1.5-9B-MLX-6bit` y la torre de visión original en bf16 de `ornith-ai/Ornith-1.5-9B`, que la versión MLX 6-bit había perdido.

El modelo resuelve un problema concreto: las cuantizaciones MLX de modelos multimodales suelen descartar la torre de visión, dejando el modelo solo con capacidad de texto. Esta build restaura dicha torre (27 bloques, 456M parámetros en bf16) junto a los pesos de texto de 6 bits, verificando previamente que ambos componentes pertenecen al mismo entrenamiento mediante la comprobación de 24 de 24 tensores de texto muestreados.

Con 9.409.812.208 parámetros totales y un tamaño en disco de 8,21 GB, está pensado para ejecutarse localmente en Macs con Apple Silicon a través de la herramienta Astronomical o de la librería mlx-vlm. La arquitectura subyacente corresponde a la familia Qwen 3.5, según los tags del repositorio, y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5, segun tags), con torre de vision de 27 bloques |
| Parametros totales | 9.409.812.208 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (pesos de texto); torre de vision en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `model-vision.safetensors` separado y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que combina una torre de visión de 27 bloques y 456M parámetros, mantenida a precisión completa bf16, con los pesos de texto cuantizados a 6 bits del modelo base Ornith-1.5-9B. La torre de visión se distribuye en un archivo independiente (`model-vision.safetensors`) en lugar de compartir shards con los pesos de texto, una decisión de diseño que permite mantener los shards de texto idénticos byte a byte a los del modelo fuente y verificar sus hashes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La build comunitaria documenta el proceso de reconstrucción: verificación de coincidencia entre torre y pesos de texto (24 de 24 tensores muestreados coinciden, y el ancho de la torre y los tokens de imagen son compatibles), registro de los commits de origen y cálculo de SHA-256 de cada archivo de pesos y configuración en `astronomical-build.json`, lo que permite auditar o reproducir la compilación.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Descripción y lectura de contenido visual: en las pruebas del autor, el modelo leyó correctamente el nombre del modelo, el tamaño en disco y la utilización de GPU de una captura de pantalla de la aplicación Astronomical.
- Procesamiento de imágenes junto con instrucciones textuales en una misma petición.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de la nube.
- Soporte de inferencia determinista (temperature=0.0 en el ejemplo de mlx-vlm).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Asistente visual local en Mac: el modelo permite hacer preguntas sobre imágenes ("What is in this image?") sin enviar datos a la nube, adecuado para usuarios que trabajan con material sensible en equipos Apple Silicon.
- Lectura de capturas de pantalla e interfaces: tal como se probó con la app Astronomical, puede extraer texto y datos concretos de capturas de UI, útil para documentación automática o soporte técnico.
- Automatización de tareas de accesibilidad: descripción de imágenes para usuarios con discapacidad visual, ejecutándose localmente con un consumo de 8,21 GB de memoria.
- Procesamiento por lotes de imágenes en flujos de trabajo de investigación: al integrarse con mlx-vlm, puede invocarse desde scripts Python para clasificar o describir lotes de imágenes sin coste de API.
- Prototipado de aplicaciones multimodales: desarrolladores que quieran validar una app de image-text-to-text en macOS antes de desplegar en infraestructura mayor, usando la licencia MIT sin restricciones comerciales.
- Análisis de documentos escaneados o fotografías con texto: la combinación de torre de visión a bf16 y pesos de texto de 6 bits permite extraer información de imágenes manteniendo calidad en la parte visual.
- Despliegue en entornos con memoria limitada: la variante hermana de 4 bits (5,95 GB) permite ejecutar el mismo modelo en Macs con menos RAM, según indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,21 GB para la variante de 6 bits; 5,95 GB para la variante de 4 bits del mismo autor.
- Hardware objetivo: Apple Silicon (macOS 14 o posterior), según la aplicación Astronomical.
- GPU recomendadas: no se especifican modelos concretos de GPU NVIDIA o AMD; el formato MLX está orientado a chips Apple M-series.
- ¿Cabe en GPU de consumo? Está diseñado para Macs con memoria unificada; no se documenta compatibilidad con GPUs de consumo convencionales.
- Opciones de despliegue: aplicación Astronomical (incluye CLI `astronomical respond`), librería `mlx-vlm` en Python, y descarga mediante `hf download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MLX-6bit-vision (este) | 9,41B | no disponible | Si (torre 456M bf16) | MIT | MLX safetensors 6-bit |
| ornith-ai/Ornith-1.5-9B-MLX-6bit | no disponible | no disponible | No (sin torre) | MIT | MLX safetensors 6-bit |
| ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision | no disponible | no disponible | Si | MIT | MLX safetensors 4-bit |
| ornith-ai/Ornith-1.5-9B | no disponible | no disponible | Si (original) | MIT | safetensors |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se dispone de datos de rendimiento comparativo con modelos de otras familias.

## Limitaciones y advertencias

- Es una build comunitaria, no una versión oficial de ornith-ai; el autor lo indica explícitamente y atribuye todo el crédito del modelo a sus creadores.
- Idioma limitado al inglés según el campo `language` del repositorio.
- Longitud de contexto no documentada; no se puede garantizar el manejo de conversaciones o documentos largos.
- La cuantización a 6 bits de los pesos de texto puede introducir degradación respecto al modelo original en bf16, aunque la torre de visión se mantiene a precisión completa.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fiabilidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Requiere hardware Apple Silicon y macOS 14 o posterior; no es portable a otras plataformas sin reconversión.
- La licencia MIT permite uso comercial, pero se remite a los términos del repositorio original `ornith-ai/Ornith-1.5-9B` para autores y condiciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-9B-MLX-6bit-vision
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX 6-bit sin visión: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Variante de 4 bits con visión: https://huggingface.co/ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision
- Aplicación Astronomical: https://aosama.github.io/astronomical/

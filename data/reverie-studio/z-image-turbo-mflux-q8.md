# reverie-studio/z-image-turbo-mflux-q8

## Resumen

z-image-turbo-mflux-q8 es una conversión del modelo de generación de imágenes Tongyi-MAI/Z-Image-Turbo, publicada por reverie-studio como espejo para su aplicación. No se trata de un modelo nuevo ni de un fine-tune: el autor indica explícitamente que los pesos se han cuantizado a 8 bits con la herramienta `mflux-save` de mflux 0.24.0 y que por lo demás permanecen sin cambios respecto al modelo base. El objetivo es ofrecer una versión compatible con mflux, el framework de inferencia sobre Apple Silicon (MLX), de forma que la app Reverie pueda descargar todos sus modelos desde un único repositorio.

El modelo hereda la arquitectura y el comportamiento del Z-Image Turbo original de Tongyi-MAI, un generador texto-a-imagen de la familia Z-Image. La información disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto del modelo base, por lo que esos datos se marcan como no disponibles. El repositorio ocupa 11,0 GB, coherente con una cuantización de 8 bits de un modelo de difusión de tamaño medio-grande.

Su relevancia es práctica: permite ejecutar Z-Image Turbo en hardware Apple mediante MLX con un consumo de memoria reducido respecto a los pesos originales, a cambio de una posible pérdida menor de calidad por la cuantización. La licencia Apache-2.0 se mantiene sin cambios, lo que facilita su uso comercial y su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen de la familia Z-Image; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (q8) generada con `mflux-save` de mflux 0.24.0; no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto del modelo base, no documentado aqui) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria mlx; formato mflux) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Tongyi-MAI/Z-Image-Turbo en los datos proporcionados. Por la naturaleza del pipeline (texto-a-imagen) y por el uso de mflux, se trata de un modelo de difusión, pero no se detallan el tipo de backbone, el codificador de texto, el scheduler ni la resolución nativa de generación. Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste por preferencias.

Respecto a este repositorio concreto, la única transformación aplicada es la cuantización a 8 bits de los pesos originales mediante mflux 0.24.0, partiendo de la revisión `f332072aa78be7aecdf3ee76d5c247082da564a6` del modelo base. El autor declara que el modelo queda "otherwise unchanged". No hay evidencia de reentrenamiento, destilación ni modificación de los componentes del pipeline más allá de la reducción de precisión numérica.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (texto-a-imagen), heredada del modelo base Z-Image Turbo.
- Ejecución sobre Apple Silicon mediante MLX y mflux 0.24.0, pasando la carpeta del modelo como `--model` y `--base-model z-image-turbo` cuando mflux lo requiera.
- Integridad verificable: el repositorio incluye un fichero `SHA256SUMS` con el hash de cada archivo.
- No se documentan en la información disponible capacidades de edición de imagen, image-to-image, inpainting, control por pose, tool calling, agentes ni modos de razonamiento.
- No se documentan capacidades multilingües específicas del codificador de texto.

## Casos de uso

- Generación de imágenes en local sobre Mac: el modelo está empaquetado para mflux y MLX, por lo que se puede ejecutar en un Mac con Apple Silicon sin depender de servicios en la nube, usando la carpeta como `--model`.
- Prototipado rápido de ilustraciones: al ser una variante "turbo" del modelo base, está pensada para generar imágenes con pocos pasos de inferencia, lo que encaja en flujos de exploración visual iterativa.
- Integración en la aplicación Reverie: el repositorio existe precisamente para que esa app descargue todos sus modelos desde un único origen, simplificando la distribución y las actualizaciones.
- Pipeline de generación de assets para desarrollo: creación de imágenes de relleno, placeholders o material gráfico de prueba en proyectos con licencia Apache-2.0 compatible.
- Experimentación académica con cuantización: sirve para estudiar el impacto de la cuantización a 8 bits en la calidad de salida de un modelo de difusión, comparando contra los pesos originales del modelo base.
- Despliegue en entornos con memoria limitada: la reducción a 8 bits disminuye la huella de memoria frente a los pesos en mayor precisión, lo que permite usar equipos Apple con menos RAM unificada.
- Verificación de integridad en producción: el fichero `SHA256SUMS` permite automatizar la comprobación de los pesos descargados antes de cargarlos en un servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 11,0 GB, lo que da una cota inferior aproximada de memoria necesaria para cargar los pesos en 8 bits, antes de contar con las activaciones y el codificador de texto.
- Hardware objetivo: Apple Silicon con MLX; el modelo está pensado para ejecutarse mediante mflux 0.24.0.
- VRAM/RAM unificada recomendada: no disponible de forma oficial; por el tamaño del repositorio, se necesita un equipo con al menos 16 GB de memoria unificada y margen adicional para el resto del pipeline.
- GPU NVIDIA: no es el objetivo de este repositorio (formato MLX); no se documenta compatibilidad con CUDA.
- Opciones de despliegue: mflux 0.24.0 (vía `--model` y `--base-model z-image-turbo`). No se documentan vLLM, TGI, llama.cpp ni Ollama, que además no son aplicables a un modelo de difusión en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| reverie-studio/z-image-turbo-mflux-q8 | no disponible | no disponible | safetensors (MLX/mflux), 8 bits | Apache-2.0 | Espejo cuantizado para mflux; 11,0 GB |
| Tongyi-MAI/Z-Image-Turbo | no disponible | no disponible | no disponible | Apache-2.0 (segun el modelo base citado) | Modelo original; pesos sin cuantizar |
| Otras variantes de Z-Image Turbo | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas comparables en la búsqueda |

No se dispone de datos de rendimiento del modelo base ni de alternativas de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización a 8 bits puede introducir una degradación de calidad respecto a los pesos originales; no se documenta la magnitud de esa pérdida.
- Es un espejo, no un modelo entrenado por reverie-studio: los créditos y la responsabilidad sobre el comportamiento corresponden a los autores de Z-Image Turbo.
- El repositorio está atado a mflux 0.24.0 y al formato MLX; no es directamente utilizable en stacks de difusión basados en PyTorch o CUDA sin conversión.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del codificador de texto; deben evaluarse sobre el modelo base.
- No se especifican restricciones adicionales de uso comercial más allá de la licencia Apache-2.0 heredada, que permite uso comercial con atribución y sin garantías.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- No se publican benchmarks ni métricas de fidelidad prompt-imagen para esta variante cuantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reverie-studio/z-image-turbo-mflux-q8
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Revisión del modelo base utilizada: `f332072aa78be7aecdf3ee76d5c247082da564a6`
- mflux (framework de inferencia): https://github.com/filipstrand/mflux
- Perfil del autor: https://huggingface.co/reverie-studio

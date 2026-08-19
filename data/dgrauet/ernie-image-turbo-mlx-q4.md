# dgrauet/ernie-image-turbo-mlx-q4

## Resumen

El modelo `dgrauet/ernie-image-turbo-mlx-q4` es una conversión al formato MLX del modelo de generación de texto a imagen `baidu/ERNIE-Image-Turbo`, desarrollado por Baidu. Se trata de un modelo de 8 000 millones de parámetros basado en un Diffusion Transformer (DiT) de una sola corriente (single-stream), diseñado para generar imágenes a partir de descripciones textuales. La conversión ha sido realizada por el usuario dgrauet mediante la herramienta `mlx-forge` y está cuantizada en int4, lo que reduce el tamaño de los pesos y permite su ejecución en dispositivos Apple Silicon con memoria unificada.

Esta versión MLX resulta relevante para desarrolladores que trabajan en ecosistemas Apple, ya que permite ejecutar el modelo de forma nativa en Metal Performance Shaders (MPS) sin necesidad de emuladores ni capas de compatibilidad. El repositorio incluye los pesos cuantizados, los archivos de configuración del tokenizador, el codificador de texto, el transformador y el VAE, todo en formato safetensors. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

Al estar cuantizado en int4, el modelo sacrifica parte de la precisión numérica a cambio de un menor consumo de memoria y una mayor velocidad de inferencia en hardware Apple. Esta conversión es especialmente útil para prototipado rápido, generación de imágenes en local y aplicaciones que requieren despliegue en equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) single-stream, 8B |
| Parametros totales | 8 000 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | int4 |
| Idiomas soportados | no disponible (probablemente chino e ingles, segun el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `ERNIE-Image-Turbo` es un Diffusion Transformer de 8 000 millones de parametros con arquitectura single-stream, es decir, que combina la atencion sobre texto e imagen en un unico bloque en lugar de separarlos en dos ramas. Esta arquitectura, similar a la de otros DiT modernos, permite una generacion de imagenes coherente con la descripcion textual. El modelo fue entrenado por Baidu con un conjunto de datos no especificado en la informacion disponible, y no se detallan las tecnicas de alineacion (como RLHF o DPO) empleadas.

La version MLX presentada en este repositorio no modifica la arquitectura original, sino que convierte los pesos al formato MLX y aplica cuantizacion int4. La cuantizacion reduce el tamaño de los tensores a aproximadamente un cuarto de su tamaño original, manteniendo la estructura del modelo. El repositorio incluye los archivos `quantize_config.json` y `split_model.json` que definen la configuracion de cuantizacion y la distribucion de los pesos entre los distintos componentes (text encoder, transformer y VAE). El proceso de conversion se realizo con `mlx-forge`, una herramienta desarrollada por el mismo autor para automatizar la portabilidad de modelos a MLX.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Soporte de resoluciones variables, incluyendo formatos panoramicos (por ejemplo, 1280x640) segun el repositorio de referencia.
- Ejecucion nativa en Apple Silicon mediante MLX, aprovechando la memoria unificada y las GPU integradas.
- Cuantizacion int4 que permite cargar el modelo en equipos con menos memoria, aunque con posible perdida de calidad en los detalles finos.
- Integracion con la herramienta `ernie-image-mlx`, que ofrece una interfaz de linea de comandos para generar imagenes.
- No se ha documentado soporte para tool calling, agentes ni otras capacidades propias de modelos de lenguaje; se centra exclusivamente en la generacion de imagenes.

## Casos de uso

- Generacion de imagenes en local para disenadores y artistas: el modelo permite crear ilustraciones, conceptos y bocetos a partir de prompts en lenguaje natural, sin depender de servicios en la nube. Con la cuantizacion int4, se puede ejecutar en un MacBook con 16 GB de RAM, lo que facilita el trabajo creativo en entornos sin conexion.
- Prototipado rapido de contenido visual: equipos de marketing o producto pueden generar variaciones de imagenes para campanas, presentaciones o mockups en cuestion de segundos, acelerando el ciclo de iteracion.
- Automatizacion de generacion de assets para videojuegos: desarrolladores indie pueden producir texturas, fondos o sprites a partir de descripciones, reduciendo el coste de contratar ilustradores para fases iniciales.
- Creacion de datasets sinteticos: investigadores pueden generar imagenes etiquetadas para entrenar otros modelos de vision por computador, especialmente cuando los datos reales son escasos o caros de obtener.
- Educacion y demostraciones: en entornos academicos, el modelo sirve para ensenar conceptos de difusion y transformers, ya que se puede ejecutar en hardware asequible y el codigo de inferencia es abierto.
- Integracion en aplicaciones de escritorio o web: gracias al formato MLX y a la licencia Apache 2.0, es posible embeber el modelo en aplicaciones macOS o iOS mediante la libreria `ernie-image-mlx`, ofreciendo generacion de imagenes sin conexion a los usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas comparativas (como FID, CLIP score o tiempos de inferencia) frente a otros modelos de generacion de imagenes. Se recomienda consultar la documentacion del modelo base `baidu/ERNIE-Image-Turbo` en Hugging Face para obtener datos de rendimiento si estan disponibles.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 6.9 GB, por lo que se requiere al menos 8 GB de memoria unificada en Apple Silicon para cargar los pesos en RAM. Con cuantizacion int4, el modelo puede caber en equipos con 16 GB de RAM, aunque se recomienda 32 GB para trabajar con resoluciones altas o multiples generaciones simultaneas.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 o variantes Pro/Max/Ultra). La inferencia se ejecuta en la GPU integrada mediante Metal.
- Compatibilidad con consumer GPU: no aplica a GPUs de NVIDIA o AMD; el formato MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: la libreria `ernie-image-mlx` proporciona una interfaz de linea de comandos y una API Python. No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas de servicion.
- Latencia y throughput: no se han publicado cifras concretas. El repositorio de Anionex (enlace en la seccion de enlaces) afirma una velocidad "2x faster" frente a la implementacion original, pero sin datos numericos verificables.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de generacion de imagenes en formato MLX. Como referencia cualitativa:

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dgrauet/ernie-image-turbo-mlx-q4` | 8B | MLX | int4 | Apache 2.0 | Hugging Face |
| `baidu/ERNIE-Image-Turbo` (original) | 8B | PyTorch | fp16/bf16 | Apache 2.0 | Hugging Face |
| Otros modelos de generacion de imagenes (p.ej. Stable Diffusion) | 1-8B | PyTorch/ONNX | fp16/int8 | Varias | Hugging Face |

La ventaja principal de esta version MLX es su optimizacion para Apple Silicon, mientras que el modelo original requiere CUDA o ROCm. No se han encontrado comparaciones directas con otros DiT cuantizados para MLX.

## Limitaciones y advertencias

- La cuantizacion int4 puede degradar la calidad de las imagenes generadas, especialmente en detalles finos, texturas y gradientes suaves. Se recomienda probar el modelo con diferentes prompts para evaluar si la perdida es aceptable.
- El modelo base puede presentar sesgos en la representacion de ciertos grupos demograficos, culturas o escenarios, derivados de los datos de entrenamiento de Baidu. No se ha realizado una auditoria de sesgos en esta conversion.
- No se garantiza la generacion de imagenes fotorrealistas o libres de errores; es posible que aparezcan artefactos, distorsiones o inconsistencias semanticas, especialmente con prompts complejos.
- La informacion sobre los idiomas soportados no esta disponible en la model card. Aunque el modelo base probablemente maneja chino e ingles, no hay confirmacion oficial.
- Al ser una conversion no oficial, no se asegura la paridad exacta con el modelo original en terminos de comportamiento. Los usuarios deben verificar que la salida cumple sus requisitos antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe incluir la atribucion correspondiente y mantener el aviso de licencia en las redistribuciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dgrauet/ernie-image-turbo-mlx-q4
- Repositorio GitHub `ernie-image-mlx` (port oficial): https://github.com/dgrauet/ernie-image-mlx
- Repositorio GitHub `mlx-forge` (herramienta de conversion): https://github.com/dgrauet/mlx-forge
- Repositorio GitHub `mlx-arsenal` (operaciones MLX reutilizables): https://github.com/dgrauet/mlx-arsenal
- Repositorio GitHub `claude-skill-mlx-porting`: https://github.com/dgrauet/claude-skill-mlx-porting
- Repositorio GitHub `Anionex/ernie-image-mlx` (implementacion alternativa): https://github.com/Anionex/ernie-image-mlx
- Pagina de referencia tecnica de ERNIE Image: https://ernie-image.github.io/
- Modelo base en Hugging Face: https://huggingface.co/baidu/ERNIE-Image-Turbo

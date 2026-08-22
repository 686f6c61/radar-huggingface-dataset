# justinchuby/onnx-genai-cogvideox-2b

## Resumen

Este repositorio contiene una exportación a formato ONNX del modelo de texto a video CogVideoX-2B, originalmente desarrollado por THUDM (Tsinghua University) y publicado con licencia Apache-2.0. El trabajo de conversión ha sido realizado por Justin Chu (justinchuby) mediante su herramienta Mobius, que convierte modelos de PyTorch a ONNX de forma automatizada. El resultado es un paquete listo para ser ejecutado con el runtime ONNX GenAI, un prototipo en Rust que permite desplegar modelos generativos sobre ONNX Runtime con soporte para distintos aceleradores (CUDA, Metal, CoreML, WebGPU, etc.).

La relevancia de este modelo radica en que ofrece una alternativa al despliegue tradicional en PyTorch, facilitando la integración en entornos que ya utilizan ONNX como estándar de inferencia. El modelo original de 2 mil millones de parámetros emplea un transformer de difusión latente para generar secuencias de vídeo a partir de descripciones textuales. Esta versión ONNX mantiene las capacidades del original y añade la flexibilidad de ejecución con el ecosistema ONNX GenAI, incluyendo metadatos canónicos de inferencia y soporte para decodificación causal con cache temporal.

El repositorio incluye evidencia de ejecución (`generated.mp4`, frames, métricas de tiempo y memoria) que demuestra que el modelo funciona correctamente en el runtime ONNX GenAI, tanto en el runner de Mobius como en el motor de workflow de ONNX GenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (CogVideoX-2B) |
| Parametros totales | 2 mil millones (según el nombre del modelo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a video) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | Inglés (según el modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo original CogVideoX-2B es un generador de vídeo basado en difusión latente. Utiliza un codificador de texto (T5) para procesar el prompt, un VAE espaciotemporal para codificar y decodificar los fotogramas, y un transformer de difusión 3D que modela la dependencia temporal y espacial. El entrenamiento se realizó con datos de vídeo y texto en inglés, y el proceso de difusión emplea una predicción de velocidad (v-prediction) con un scheduler DDIM.

La exportación a ONNX añade una capa de optimización para la inferencia: se incluye `inference_metadata.yaml` con un workflow IR que define pasos como el transposed de rango 5, el desescalado latente, la decodificación causal del VAE por bloques y la cache temporal para recurrencia. Esto permite una ejecución eficiente en el runtime ONNX GenAI, con soporte para distintos execution providers (CUDA, CPU, etc.) y con la posibilidad de configurar el número de pasos de difusión.

## Capacidades

- Generación de vídeo a partir de texto: el modelo acepta una descripción textual y produce una secuencia de fotogramas en formato MP4.
- Soporte de prompts detallados: puede interpretar descripciones complejas con objetos, acciones y contexto espacial.
- Generación de vídeo de alta resolución: el modelo original genera vídeo de 720x480 a 30 fps (según la documentación del modelo original).
- Integración con ONNX Runtime: se puede ejecutar en diferentes ejecución providers (CUDA, CPU, Metal, CoreML, WebGPU) mediante la variable de entorno `ONNX_GENAI_EP`.
- Compatible con el runtime ONNX GenAI: permite ejecución a través de un motor de workflow definido por metadatos canónicos.
- Posibilidad de ajustar el número de pasos de difusión (por ejemplo, 20 pasos en el ejemplo de ejecución).

## Casos de uso

- **Prototipado rápido de vídeos para presentaciones**: un equipo de marketing puede generar vídeos conceptuales a partir de descripciones de producto sin necesidad de rodar.
- **Generación de storyboards animados**: los diseñadores pueden convertir guiones de texto en secuencias de vídeo aproximadas para previsualizar escenas.
- **Creación de contenido educativo**: se pueden generar animaciones simples para explicar conceptos científicos o históricos a partir de prompts.
- **Generación de clips para redes sociales**: se pueden crear vídeos cortos y atractivos para publicaciones en plataformas como Instagram o TikTok.
- **Validación de ideas de videojuegos**: los desarrolladores pueden generar vídeos de concepto para escenarios o cinemáticas antes de implementarlas.
- **Generación de material de referencia para animadores**: sirve como base visual para que los artistas planifiquen la composición de escenas.
- **Automatización de contenido educativo**: se pueden crear vídeos explicativos para cursos online a partir de guiones de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye evidencia de ejecución con tiempos y memoria máxima, pero no hay datos comparativos con otros modelos de texto a video.

## Requisitos de hardware

- **VRAM estimada**: no se ha indicado un valor concreto. Dado que el tamaño del repositorio es de 26.4 GB (incluyendo pesos y archivos de soporte), es razonable asumir que se necesita una GPU con al menos 8 GB de VRAM para la carga completa, aunque no se confirma.
- **GPU recomendada**: no se especifica. Se recomienda una GPU NVIDIA compatible con CUDA para el execution provider CUDA de ONNX Runtime.
- **Compatibilidad con GPU de consumo**: no se ha verificado, pero es probable que una RTX 3060 o superior pueda ejecutar el modelo con cuantización, aunque no hay datos.
- **Opciones de despliegue**: se puede ejecutar con ONNX Runtime (GPU o CPU) a través de la librería `onnx-genai` y el motor de workflow. También es posible ejecutar con `cargo test` en el repositorio `onnx-genai` como se muestra en el README.
- **Latencia y throughput**: no se ha proporcionado información. El ejemplo indica 20 pasos de difusión, pero no hay tiempos de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Texto a video | ONNX exportado |
|---|---|---|---|---|---|
| CogVideoX-2B (original) | 2B | PyTorch | Apache-2.0 | Sí | No |
| justinchuby/onnx-genai-cogvideox-2b | 2B | ONNX | Apache-2.0 | Sí | Sí |
| AnimateDiff | ~1.7B | PyTorch | Apache-2.0 | Sí (con imagen) | No |

No hay información sobre otros modelos de texto a video exportados a ONNX con el mismo tamaño y licencia.

## Limitaciones y advertencias

- **Idioma**: el modelo original está entrenado principalmente en inglés; los prompts en otros idiomas pueden generar resultados de menor calidad.
- **Sesgos y alucinaciones**: como todo modelo generativo, puede producir vídeos con contenido inapropiado o incoherente, y no se ha auditado el sesgo en los datos de entrenamiento.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero es necesario conservar las atribuciones y notificar los cambios realizados en los archivos modificados.
- **Requisitos de hardware**: el tamaño de los pesos (26.4 GB) implica que se necesita un sistema con suficiente espacio en disco y probablemente GPU con suficiente VRAM para cargar el modelo completo.
- **Dependencia de ONNX Runtime**: la ejecución depende de la disponibilidad de ONNX Runtime con soporte para el execution provider adecuado (CUDA, Metal, etc.). No se garantiza el funcionamiento en todos los entornos.
- **Calidad del vídeo**: el modelo de 2B genera vídeos de resolución moderada (720x480) y puede presentar artefactos en escenas complejas.

## Enlaces

- [Repositorio de HuggingFace](https://huggingface.co/justinchuby/onnx-genai-cogvideox-2b)
- [Repositorio GitHub de onnx-genai](https://github.com/justinchuby/onnx-genai)
- [Repositorio GitHub de onnx-genai-models](https://github.com/justinchuby/onnx-genai-models)
- [Modelo original zai-org/CogVideoX-2b](https://huggingface.co/zai-org/CogVideoX-2b)
- [Paper de CogVideoX (arXiv)](https://arxiv.org/pdf/2408.06072)
- [Colección de ejemplos de inferencia metadata](https://huggingface.co/collections/justinchuby/onnx-genai-inference-metadata-examples)

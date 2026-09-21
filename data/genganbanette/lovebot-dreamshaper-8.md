# genganbanette/lovebot-dreamshaper-8

## Resumen

lovebot-dreamshaper-8 es una conversión a ONNX en precisión fp16 del modelo de difusión Lykon/dreamshaper-8, publicada por el usuario genganbanette como artefacto de ejecución para la aplicación Lovebot. No se trata de un modelo entrenado desde cero ni de un fine-tune propio: la model card indica explícitamente que los pesos no se han modificado más allá del cambio de formato (de safetensors/PyTorch a ONNX) y de precisión (fp16), partiendo del commit `a7e52b98680b1ba8ff7bce97c7f9f2e2e5337917` del repositorio original.

Su relevancia es de tipo práctico y de despliegue, no de investigación: demuestra el empaquetado de un modelo de difusión de la familia Stable Diffusion 1.5 en fragmentos de 20 MiB pensados para descarga progresiva y ejecución local en el navegador mediante onnxruntime-web con backend WebGPU. Esto permite generar imágenes en cliente sin enviar los prompts a un servidor, algo útil para aplicaciones con requisitos de privacidad, con coste de inferencia cero en servidor o con funcionamiento sin conexión tras la primera carga de los pesos.

El repositorio ocupa 2,1 GB y acumula 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria. La licencia heredada es CreativeML Open RAIL-M, con las restricciones de uso de su Attachment A, y el modelo arrastra la etiqueta `not-for-all-audiences`, coherente con el contexto de la aplicación para la que fue convertido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (latent diffusion) de la familia Stable Diffusion 1.5: UNet + text encoder CLIP + VAE |
| Parámetros totales | No declarados en la model card. Referencia de la arquitectura SD 1.5: en torno a 1.000 millones (~860 M en la UNet, ~123 M en el text encoder CLIP ViT-L/14 y ~84 M en el VAE) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. El text encoder CLIP de SD 1.5 procesa hasta 77 tokens por prompt |
| Tipos de cuantización | fp16 (único formato documentado en el repositorio) |
| Idiomas soportados | No disponible. Los prompts de DreamShaper 8 funcionan mejor en inglés, ya que el text encoder se entrenó principalmente con ese idioma |
| Licencia | CreativeML Open RAIL-M (con restricciones de uso, Attachment A) |
| Formato de pesos | ONNX fp16, dividido en fragmentos de 20 MiB |
| Tamaño del repositorio | 2,1 GB |
| Librería de destino | onnxruntime-web (backend WebGPU) |
| Modelo base | Lykon/dreamshaper-8 (commit a7e52b98680b1ba8ff7bce97c7f9f2e2e5337917) |
| Pipeline declarado | No disponible |
| Fecha de publicación | Creado y actualizado el 21 de septiembre de 2026 según los metadatos del repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es una red de difusión latente: una UNet que realiza el proceso de denoising iterativo sobre el espacio latente comprimido por un VAE, condicionada por embeddings de texto producidos por un text encoder CLIP. DreamShaper 8, el modelo de origen, es un fine-tune de la familia Stable Diffusion 1.5 desarrollado por Lykon, con resolución nativa de 512x512 píxeles. La model card de esta conversión no documenta el dataset, el número de tokens de imagen, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO) sobre el modelo original.

La única intervención técnica documentada por el autor es la conversión de formato y precisión: los pesos originales se exportan a grafos ONNX en fp16 y se trocean en piezas de 20 MiB para permitir una carga incremental en el navegador. El consumo se realiza con onnxruntime-web y el backend WebGPU, lo que traslada el cómputo de la difusión a la GPU del cliente a través de la API WebGPU del navegador. No se documentan optimizaciones adicionales como decodificación especulativa, destilación de pasos (tipo LCM o Turbo), uso de schedulers concretos ni compilación de grafos específica por proveedor; estos detalles quedan fuera de la información disponible.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante difusión latente, en la resolución nativa de la familia SD 1.5 (512x512) y con posibilidad de escalar a resoluciones mayores asumiendo riesgo de artefactos.
- Estilo visual característico de DreamShaper 8, orientado a ilustración, retrato y estética semi-realista, heredado íntegramente del modelo base.
- Prompt negativo, al ser una capacidad estándar del pipeline de SD 1.5 (no se confirma explícitamente en la model card de esta conversión).
- Ejecución local en el navegador con onnxruntime-web y WebGPU, sin llamadas a un servidor de inferencia.
- Carga progresiva de pesos por fragmentos de 20 MiB, apta para conexiones lentas o para cacheado en el navegador.
- Capacidades de image-to-image, inpainting, outpainting o ControlNet: no confirmadas en el repositorio, dependen de qué grafos ONNX se hayan exportado y no se documentan.
- Tool calling, function calling, agentes, razonamiento multi-paso y generación de código: no aplica, no es un modelo de lenguaje.
- Capacidades multilingües: no documentadas; el condicionamiento de texto de SD 1.5 responde mejor a prompts en inglés.
- Modo de pensamiento (thinking), visión o audio: no aplica.

## Casos de uso

- Generación de imágenes en el navegador para aplicaciones de acompañamiento o entretenimiento: es el escenario original de la conversión, dentro de la app Lovebot, donde el usuario obtiene imágenes sin que sus prompts salgan del dispositivo.
- Privacidad y cumplimiento normativo: al ejecutarse íntegramente en cliente, no hay transferencia de prompts ni de imágenes a un backend, lo que simplifica el tratamiento de datos personales en aplicaciones sensibles.
- Aplicaciones de escritorio o web con coste de inferencia cero en servidor: el gasto de cómputo recae en el hardware del usuario, lo que elimina el coste marginal por imagen en servicios con muchos usuarios.
- Funcionamiento sin conexión: una vez descargados y cacheados los 2,1 GB de pesos, la generación no requiere red, útil en entornos sin conectividad estable o en demos offline.
- Prototipado rápido de interfaces creativas: permite validar un flujo de generación de imágenes en el navegador antes de invertir en infraestructura GPU dedicada.
- Educación y talleres: sirve para ilustrar el funcionamiento de un pipeline de difusión y del runtime ONNX/WebGPU en un entorno reproducible y sin instalaciones pesadas.
- Productos de nicho con contenido para adultos o estética específica: la etiqueta `not-for-all-audiences` y la licencia RAIL-M condicionan este uso a la implementación de filtros y a la verificación de las restricciones de uso del Attachment A.
- Integración en editores o widgets web: para generar ilustraciones, avatares o fondos bajo demanda dentro de una página, siempre que el navegador del usuario soporte WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el proceso de conversión a ONNX fp16 y no incluye métricas objetivas (FID, CLIP score), comparativas con el modelo original ni medidas de latencia o throughput. Tampoco hay evaluaciones de la comunidad en el repositorio, que registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Tamaño de los pesos: 2,1 GB en fp16, descargados en fragmentos de 20 MiB.
- VRAM estimada: no publicada. Para difusión a 512x512 en fp16 hay que sumar a los pesos la memoria de activaciones, el VAE y los búferes del runtime; una horquilla razonable de trabajo es de 4 a 6 GB de memoria gráfica libre, aunque el límite real depende del navegador y del backend WebGPU.
- GPU compatibles: cualquier GPU con soporte WebGPU (NVIDIA RTX serie 20 o superior, AMD RDNA 2 o superior, Apple Silicon M1 o superior, e integradas recientes). Las GPU integradas pueden ejecutarlo, pero con latencias muy superiores.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM. En equipos con menos memoria, la ejecución puede fallar o recurrir a memoria compartida con una penalización fuerte de velocidad.
- Opciones de despliegue: onnxruntime-web con WebGPU en navegadores compatibles (Chrome, Edge, Safari recientes). No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen por completo del hardware del cliente, del navegador y del número de pasos de muestreo configurado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución nativa | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| genganbanette/lovebot-dreamshaper-8 | Conversión ONNX fp16 de DreamShaper 8 | No declarados (~1.000 M por la arquitectura SD 1.5) | 512x512 | ONNX fp16 troceado en 20 MiB | CreativeML Open RAIL-M | Repositorio HuggingFace con 0 descargas |
| Lykon/dreamshaper-8 | Modelo original (fine-tune de SD 1.5) | ~1.000 M (arquitectura SD 1.5) | 512x512 | Safetensors / diffusers | CreativeML Open RAIL-M | Ampliamente utilizado; requiere PyTorch o diffusers, no se ejecuta en navegador |
| Stable Diffusion 1.5 (runwayml/stable-diffusion-v1-5 y redistribuciones comunitarias) | Modelo base de difusión | ~1.000 M | 512x512 | Safetensors, CKPT, ONNX | CreativeML Open RAIL-M | Muy extendido, con numerosas conversiones y ecosistema de herramientas |
| stabilityai/stable-diffusion-xl-base-1.0 | Difusión latente de mayor tamaño | ~3.500 M (UNet más text encoders) | 1024x1024 | Safetensors / diffusers | CreativeML Open RAIL++-M | Requiere bastante más VRAM; no apto para WebGPU en navegador de forma práctica |

Frente al modelo original, esta conversión pierde flexibilidad (depende de los grafos ONNX exportados) pero gana portabilidad y despliegue sin servidor. Frente a SD 1.5, el valor añadido es el ajuste estético de DreamShaper 8. Frente a SDXL, sigue siendo mucho más ligero y apto para hardware modesto.

## Limitaciones y advertencias

- Licencia CreativeML Open RAIL-M: permite uso comercial, pero impone restricciones de uso recogidas en el Attachment A (prohibición de usos ilícitos, de desinformación, de suplantación, de contenido dañino, etc.). Es responsabilidad del integrador leer y cumplir esas cláusulas.
- Etiqueta `not-for-all-audiences`: el modelo puede generar contenido no apto para todo público, por lo que en producción conviene aplicar filtrado y moderación.
- Sesgos de los datos de entrenamiento del modelo original: el modelo base de difusión arrastra sesgos de representación y estereotipos presentes en sus corpus de imagen-texto; no hay auditoría ni mitigación documentada en esta conversión.
- Riesgo de alucinación visual: la difusión no es factual, puede producir anatomías incorrectas, texto ilegible, objetos deformes y composiciones incoherentes, especialmente en escenas complejas o con muchas entidades.
- Resolución limitada: al derivar de SD 1.5, la resolución nativa es 512x512; forzar resoluciones mucho mayores suele provocar duplicación de sujetos y artefactos.
- Idiomas: el condicionamiento de texto responde peor a prompts en idiomas distintos del inglés; la model card no declara idiomas soportados.
- Precisión fp16: el cambio de precisión puede introducir diferencias sutiles respecto a los pesos originales en fp32, aunque el autor afirma no haber modificado los pesos más allá del formato.
- Falta de validación: 0 descargas y 0 likes; no hay pruebas de terceros ni benchmarks que confirmen la fidelidad de la conversión.
- Metadatos anómalos: la fecha de creación y actualización indicada (septiembre de 2026) es posterior a la fecha de esta consulta, lo que sugiere un error de metadatos o una fecha introducida manualmente; conviene verificarla antes de citarla.
- Limitación de alcance del runtime: al depender de WebGPU, el parque de navegadores compatible es aún parcial y el rendimiento varía mucho según la GPU del cliente y la gestión de memoria del navegador.
- Sin pipeline declarado: no se especifica el tipo de tarea ni los parámetros de inferencia recomendados, lo que complica la reproducibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/genganbanette/lovebot-dreamshaper-8
- Modelo base original: https://huggingface.co/Lykon/dreamshaper-8
- Commit del modelo base referenciado en la model card: https://huggingface.co/Lykon/dreamshaper-8/tree/a7e52b98680b1ba8ff7bce97c7f9f2e2e5337917
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentación de onnxruntime-web y WebGPU: https://onnxruntime.ai/docs/tutorials/web/
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de France Travail y no guardan relación con el modelo; no se han encontrado papers, blogs ni demos adicionales en la información proporcionada.

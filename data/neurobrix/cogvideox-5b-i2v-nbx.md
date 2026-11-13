# Neurobrix/CogVideoX-5b-I2V-nbx

## Resumen

CogVideoX-5b-I2V-nbx es un contenedor `.nbx` que empaqueta el modelo original CogVideoX-5b-I2V de zai-org (anteriormente THUDM) para su ejecución en el motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un fine-tuning: los pesos, la arquitectura y la licencia son idénticos a los del modelo original. El contenedor incluye el grafo de computación, los pesos, la topología de componentes y los valores por defecto de ejecución que el motor necesita para planificar y distribuir la inferencia.

El modelo subyacente es un generador de vídeo de imagen a vídeo (image-to-video) de aproximadamente 5.000 millones de parámetros, basado en un transformer de difusión con atención 3D completa. La relevancia de esta variante no está en el modelo en sí, sino en la infraestructura: NeuroBrix permite ejecutar el modelo sobre GPU NVIDIA, GPU de Apple (Metal) o CPU, con un motor PyTorch o un motor Triton que no requiere PyTorch, planificando automáticamente la distribución de cada componente según el hardware disponible.

El contenedor ocupa 22,6 GB y se distribuye bajo la licencia original cogvideox-license. El modelo tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 13 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con atención 3D (modelo original CogVideoX-5b-I2V) |
| Parámetros totales | ~5.000 millones (5b, según el nombre del modelo original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el contenedor se distribuye con un tamaño fijo de 22,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | cogvideox-license (licencia del modelo original) |
| Formato de pesos | contenedor `.nbx` de NeuroBrix (incluye pesos y grafo de computación) |
| Tarea | image-to-video |
| Tamaño del contenedor | 22,6 GB |
| SHA-256 | `1f9f3757864af5b65779d8a35dae73bca0a972e0455369f92d11b20315b1140e` |
| Modelo base | zai-org/CogVideoX-5b-I2V |
| Librería | neurobrix |

## Arquitectura y entrenamiento

El modelo subyacente, CogVideoX-5b-I2V, es un transformer de difusión para generación de vídeo condicionada por una imagen inicial y un prompt textual. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card del modelo original de zai-org, que no se ha proporcionado en esta consulta.

La innovación de esta variante es puramente de despliegue. El contenedor `.nbx` encapsula el grafo de computación completo del modelo, sus pesos, cómo se conectan sus componentes y los valores por defecto del runtime. El motor NeuroBrix planifica la ejecución de cada parte del modelo a partir de las GPU y la memoria disponibles: una sola GPU, varias GPU, ejecución por streaming o ejecución en el host. Soporta dos motores: uno basado en PyTorch y otro basado en Triton que no necesita PyTorch, usando kernels `nbxtensor` certificados por clase de GPU.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) y un prompt textual descriptivo.
- Control de la generación mediante el prompt de texto, incluyendo movimientos de cámara y acciones descritas en lenguaje natural (el ejemplo de la model card usa "the camera slowly pulls back").
- Ejecución local en hardware propio, sin dependencia de servicios en la nube.
- Ejecución sobre GPU NVIDIA, GPU de Apple (Metal) y CPU.
- Ejecución con motor PyTorch o con motor Triton sin PyTorch.
- Planificación automática de la distribución del modelo entre una o varias GPU, con streaming o ejecución en host.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (la entrada es una imagen y texto; la salida es vídeo).

## Casos de uso

- Prototipado rápido de animaciones a partir de un fotograma: un diseñador parte de una imagen fija y genera un clip corto con movimiento de cámara descrito en el prompt, usando `neurobrix run --input-image first_frame.png --prompt "..." --output clip.mp4` en su propia estación de trabajo.
- Previsualización de storyboards en producción audiovisual: convertir viñetas estáticas en animáticas con movimiento de cámara para validar ritmo y composición antes de rodar.
- Generación de material para redes sociales: crear clips breves a partir de imágenes de producto o ilustraciones, ejecutando el modelo en local para evitar costes por API y mantener el control sobre el contenido.
- Iteración creativa en estudios pequeños: al ejecutarse en GPU de consumo o en Mac con Metal, un equipo sin clúster dedicado puede generar variaciones de una escena cambiando el prompt sin depender de infraestructura cloud.
- Investigación en generación de vídeo: servir como referencia reproducible del modelo original CogVideoX-5b-I2V dentro de un entorno de inferencia alternativo, útil para comparar motores (PyTorch frente a Triton) sobre el mismo modelo.
- Demostraciones y docencia: desplegar el modelo en un portátil o en una máquina con CPU para clases o talleres donde no hay acceso a GPUs de datacenter, gracias a la planificación automática de recursos del motor.
- Integración en pipelines locales de contenido: automatizar la generación de clips a partir de lotes de imágenes mediante la CLI de NeuroBrix, sin salir del entorno del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El contenedor ocupa 22,6 GB en disco; el modelo original figura con 21,0 GiB en el catálogo de NeuroBrix. La VRAM necesaria en ejecución no se detalla.
- GPU recomendadas: no se especifican modelos concretos. El motor soporta GPU NVIDIA, GPU de Apple (Metal) y CPU.
- ¿Cabe en GPU de consumo?: no disponible. El tamaño del modelo (~5b parámetros, contenedor de 22,6 GB) sugiere que requiere GPU con memoria considerable, pero no se confirma en la información proporcionada.
- Opciones de despliegue: exclusivamente mediante el motor NeuroBrix (`pip install neurobrix`, `neurobrix import`, `neurobrix run`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CogVideoX-5b-I2V-nbx (NeuroBrix) | ~5b | no disponible | image-to-video | cogvideox-license | Contenedor `.nbx` vía NeuroBrix |
| CogVideoX-5b-I2V (zai-org) | ~5b | no disponible | image-to-video | cogvideox-license | Pesos originales en Hugging Face |
| CogVideoX-2b | ~2b | no disponible | generación de vídeo | no disponible en la información | Catalogado en NeuroBrix |
| Wan2.1-T2V | no disponible | no disponible | text-to-video | no disponible en la información | Catalogado en NeuroBrix |
| SANA-Video | no disponible | no disponible | generación de vídeo | no disponible en la información | Catalogado en NeuroBrix |

Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos y el comportamiento son los del CogVideoX-5b-I2V original; las limitaciones, sesgos y usos previstos del modelo original aplican sin cambios.
- La model card no documenta sesgos conocidos ni tasas de alucinación; debe consultarse la model card original de zai-org para esos detalles.
- Licencia cogvideox-license: es una licencia "other", no una licencia permisiva estándar. Es imprescindible revisar el texto enlazado antes de cualquier uso comercial.
- Idiomas soportados no documentados: se desconoce el comportamiento del prompt textual en castellano u otras lenguas distintas del inglés.
- Dependencia del ecosistema NeuroBrix: el contenedor solo se ejecuta con el motor NeuroBrix; no es directamente utilizable con PyTorch estándar, diffusers u otras herramientas sin conversión.
- Cero adopción registrada (0 descargas, 0 likes) en el momento de la consulta: no hay evidencia comunitaria de funcionamiento en producción.
- El rendimiento real (latencia, VRAM, calidad) depende de la planificación del motor sobre el hardware concreto y no está documentado.
- No se especifican requisitos mínimos de memoria ni de GPU, lo que dificulta planificar un despliegue sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neurobrix/CogVideoX-5b-I2V-nbx
- Modelo original: https://huggingface.co/zai-org/CogVideoX-5b-I2V
- Licencia original: https://huggingface.co/THUDM/CogVideoX-5b-I2V/blob/main/LICENSE
- Repositorio NeuroBrix en GitHub: https://github.com/NeuroBrix/neurobrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Página del modelo en NeuroBrix: https://neurobrix.org/models/zai-org/CogVideoX-5b-I2V
- Documentación: https://docs.neurobrix.org
- Hub de modelos (documentación): https://docs.neurobrix.org/concepts/model-hub
- White paper: https://neurobrix.es/whitepaper
- GitHub de la organización: https://github.com/NeuroBrix
- YouTube: https://www.youtube.com/@NeuroBrix

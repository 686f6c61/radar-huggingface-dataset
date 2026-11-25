# nexiloopofficial/nexi-image

## Resumen

NEXI-Image es un driver de generación y edición de imágenes pensado para ejecutarse íntegramente en local sobre CPU, sin GPU ni API externa. Lo publica el usuario nexiloopofficial en Hugging Face y se apoya en los pesos de BK-SDM-small (una variante destilada de Stable Diffusion), que se descargan desde el repositorio original durante la instalación. El valor diferencial no es la calidad de imagen, sino el consumo de recursos: el autor reporta un pico de 3.380 MB de RSS y unos 169 segundos por imagen de 256 px con 15 pasos en una máquina de 8 vCPU sin aceleración gráfica.

El modelo se presenta explícitamente como una solución de "generar y esperar", no como un referente de calidad. En la propia model card el autor reconoce que, de tres prompts de prueba, solo uno se renderizó bien, uno de forma parcial y uno falló. La propuesta es, por tanto, disponer de un pipeline de generación y edición img2img completamente offline, con coste por imagen nulo y sin dependencia de servicios en la nube, aceptando un compromiso claro en fidelidad visual y latencia.

La licencia es Apache-2.0 y el proyecto incluye documentación de metodología y resultados en un repositorio de GitHub aparte. No se especifican arquitectura detallada, número de parámetros, longitud de contexto ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se apoya en BK-SDM-small, variante destilada de Stable Diffusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion para imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (los pesos de BK-SDM-small se descargan desde el repositorio upstream en la instalación) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica que NEXI-Image se construye sobre BK-SDM-small, una variante destilada de Stable Diffusion con pesos bajo licencia Apache-2.0/OpenRAIL que se obtienen del repositorio upstream en el momento de la instalación. El autor añade sobre esa base el driver de ejecución, el soporte de edición (img2img) y un conjunto de benchmarks medidos en hardware real.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que en cualquier caso no aplicarían a un modelo de difusión de imágenes. El elemento técnico diferencial declarado es la optimización para ejecución en CPU con un pico de memoria de 3.380 MB y un tiempo de carga en frío de 45,6 segundos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en local, sin GPU ni API.
- Edición de imágenes mediante img2img.
- Ejecución en hardware de solo CPU, con un pico de memoria reportado de 3.380 MB.
- Funcionamiento completamente offline, sin coste por imagen.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos especiales como thinking, visión o audio.
- No se documenta control fino de la generación (ControlNet, LoRA, inpainting selectivo) en la información disponible.

## Casos de uso

- Generación de imágenes en entornos air-gapped: al ejecutarse sin conexión y sin API, el modelo encaja en infraestructuras con requisitos de confidencialidad estrictos, como laboratorios o redes internas donde no se permite enviar datos a servicios externos.
- Prototipado rápido de conceptos visuales: con unos 169 segundos por imagen de 256 px en 8 vCPU, sirve para iterar bocetos de baja resolución en equipos sin GPU antes de escalar a un modelo mayor.
- Edición img2img de material existente: permite variaciones y retoques locales de imágenes ya disponibles sin salir del equipo, útil para pruebas de concepto de diseño.
- Automatización por lotes en servidores de CPU: al tener coste por imagen nulo, se puede encolar la generación de variaciones durante periodos de baja carga del servidor, sin incurrir en facturación de APIs.
- Educación y experimentación con difusión: al estar bajo Apache-2.0 y apoyarse en BK-SDM-small, resulta adecuado para estudiar pipelines de difusión en hardware modesto.
- Sustituto de bajo coste en demos offline: para aplicaciones que necesitan ilustrar una idea de forma aproximada y priorizan la privacidad y el coste cero sobre la fidelidad visual.
- No se recomienda para producción con requisitos de calidad de imagen, dado el propio reconocimiento del autor de que solo uno de tres prompts se renderizó correctamente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pico de RSS | 3.380 MB |
| Tiempo por imagen de 256 px (15 pasos) | ~169 s |
| Carga en frío | 45,6 s |
| Calidad (3 prompts de prueba) | 1 correcto, 1 parcial, 1 fallido |

Las mediciones se realizaron en una máquina de 8 vCPU sin GPU. No se han publicado resultados en benchmarks estándar de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Memoria RAM: pico de 3.380 MB según las mediciones del autor; se recomienda al menos 4 GB libres.
- CPU: probado en 8 vCPU; no se documenta el rendimiento en configuraciones inferiores.
- GPU: no necesaria; no se documenta aceleración por GPU.
- Cabe en cualquier equipo de consumo con 4 GB de RAM disponible, incluidos portátiles modestos.
- Opciones de despliegue: el autor publica un driver propio en el repositorio NEXI-Models-Drivers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a difusión).
- Latencia: aproximadamente 169 segundos por imagen de 256 px con 15 pasos y 45,6 segundos de carga en frío.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEXI-Image | no disponible | no aplica | ~169 s/imagen 256 px en 8 vCPU; 1/3 prompts correctos | Apache-2.0 | Hugging Face |
| BK-SDM-small | no disponible | no aplica | no disponible en esta ficha | Apache-2.0/OpenRAIL | Upstream (dependencia) |
| FLUX.2 Klein 4B | 4B | no aplica | requiere GPU según el autor | no disponible | no disponible |

El autor menciona FLUX.2 Klein 4B y samplers Lightning como ruta de mejora, pero la califica de realista solo con GPU. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Calidad de imagen baja: el propio autor reconoce que solo uno de tres prompts de prueba se renderizó bien, otro de forma parcial y otro falló.
- Latencia alta: unos 169 segundos por imagen de 256 px con 15 pasos en 8 vCPU, lo que descarta uso interactivo.
- Resolución limitada: los benchmarks se realizan a 256 px; no se documenta soporte de resoluciones mayores.
- Dependencia de pesos upstream: BK-SDM-small se descarga en la instalación, por lo que la disponibilidad del modelo depende del repositorio original.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos subyacentes de BK-SDM-small están sujetos a su propia licencia Apache-2.0/OpenRAIL, que conviene revisar.
- Riesgo de sesgos y alucinación visual: no se documenta ningún análisis de sesgos ni de fidelidad semántica de las imágenes generadas.
- Idiomas: no se especifican idiomas soportados para los prompts.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica un proyecto recién publicado y sin validación externa.
- No apto para producción con requisitos de calidad visual sin una evaluación previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-image
- Benchmarks y metodología: https://github.com/PupppyLoverr/NEXI-Models-Drivers/blob/main/nexi-image/BENCHMARKS.md

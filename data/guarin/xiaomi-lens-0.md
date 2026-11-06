# guarin/Xiaomi-Lens-0

## Resumen

Xiaomi-Lens-0 es un modelo de lenguaje multimodal de aproximadamente 4.622 millones de parametros (4,6B) desarrollado por el equipo SeerRay-Lab de Xiaomi, construido como un finetune sobre Qwen3.5-4B. Su propuesta central es unificar la comprension visual con la segmentacion de imagenes dentro de un unico modelo conversacional: anade un decodificador ligero de mascaras de pixeles que transforma determinados tokens generados (`<|mask|>`) en mascaras de segmentacion, de modo que el modelo puede senalar regiones concretas de una imagen mientras razona o al emitir su respuesta final.

El modelo cubre tareas de referring expression comprehension y segmentation, grounding multi-instancia, reasoning segmentation, referring embodied y percepcion visual de grano fino. Frente a pipelines clasicos que encadenan un detector, un segmentador y un LLM, Xiaomi-Lens-0 integra las tres capacidades en una sola pasada autorregresiva, lo que simplifica el despliegue y permite que el razonamiento del modelo guie directamente la mascara resultante.

Es relevante porque demuestra que un modelo de tamano contenido (4,6B) puede asumir tareas de grounding y segmentacion tradicionalmente reservadas a sistemas especializados de mayor tamano, manteniendo licencia Apache 2.0 y pesos en safetensors. La longitud de contexto, los idiomas soportados y los detalles de cuantizacion no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con decodificador ligero de mascaras de pixeles y supervision conjunta de lenguaje y mascara |
| Parametros totales | 4.622.144.192 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Xiaomi-Lens-0 parte de Qwen3.5-4B y le incorpora un decodificador ligero de mascaras de pixeles. El entrenamiento combina supervision de lenguaje y de mascara de forma conjunta: cada token especial `<|mask|>` que emite el modelo identifica una region de la imagen que el decodificador convierte en una mascara de segmentacion binaria. De este modo, la generacion de texto y la produccion de mascaras comparten el mismo proceso autorregresivo, y el modelo puede emitir mascaras tanto en la respuesta final como durante el razonamiento intermedio.

No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. La inferencia requiere la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de codigo asociado, que es necesario instalar para cargar el modelo y decodificar las mascaras.

## Capacidades

- Generacion de texto conversacional multimodal a partir de imagen y texto (pipeline `image-text-to-text`).
- Referring expression comprehension: localizar el objeto descrito por una expresion en lenguaje natural.
- Referring expression segmentation: devolver la mascara de pixeles del objeto referido.
- Multi-instance grounding: identificar y segmentar varias instancias en una misma imagen.
- Reasoning segmentation: producir mascaras durante el razonamiento intermedio, no solo en la respuesta final.
- Referring embodied: referencias visuales orientadas a escenarios de robotica y agentes encarnados.
- Percepcion visual de grano fino: discriminacion de atributos como color, posicion relativa o tamano dentro de un grupo de objetos.
- Generacion de mascaras en la respuesta final o intercaladas en el razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de datasets de segmentacion: dado un conjunto de imagenes y expresiones en lenguaje natural, el modelo genera mascaras listas para preentrenar o evaluar otros sistemas, reduciendo el coste de etiquetado manual.
- Edicion de imagenes asistida por lenguaje: el usuario describe una region ("la taza roja a la izquierda del portatil") y la mascara generada se usa como entrada para herramientas de inpainting o retoque selectivo.
- Robotica y agentes encarnados: en tareas de manipulacion, el modelo traduce una instruccion como "coge la pieza junto al tornillo" en una mascara del objeto, que el modulo de percepcion del robot usa para planificar la aprehension.
- Analisis de imagenes medicas o industriales: la segmentacion guiada por lenguaje permite aislar estructuras o defectos descritos textualmente por un operador, con la mascara como salida verificable.
- Asistentes de accesibilidad: descripcion y localizacion de objetos en el entorno del usuario a partir de una foto y una pregunta, devolviendo tanto la respuesta textual como la region exacta a la que se refiere.
- Control de calidad en retail o logistica: verificacion de que un producto concreto aparece en una estanteria o cinta transportadora, segmentando cada instancia para contar y clasificar articulos.
- Busqueda visual conversacional: un usuario pregunta por un objeto dentro de una imagen y el sistema responde senalando la region, util en catalogos, archivos fotograficos o documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,6B parametros, en FP16 se situa en torno a 9-10 GB solo para pesos, mas el coste del codificador visual y del decodificador de mascaras, por lo que conviene reservar margen adicional.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una A100 o H100 ofrecen holgura para FP16 y lotes mayores, mientras que una RTX 4090 (24 GB) deberia acomodar el modelo en FP16 con margen limitado.
- Cabe en GPU de consumo: previsiblemente si en GPUs de 24 GB o mas; en tarjetas de 16 GB requeriria cuantizacion, cuyos formatos no estan documentados.
- Opciones de despliegue: la model card solo menciona `transformers` con la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de codigo asociado; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Segmentacion integrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Lens-0 | 4,6B | no disponible | Si (decodificador de mascaras) | Apache 2.0 | Hugging Face, demo en Spaces |
| Qwen3.5-4B (base) | 4B | no disponible | No | no disponible | Hugging Face |
| Alternativas multimodales de grounding de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks ni de especificaciones de modelos comparables de la misma categoria, por lo que la comparativa cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar el entrenamiento de Qwen3.5-4B, puede reproducir sesgos presentes en los datos del modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como modelo generativo, puede describir objetos o regiones inexistentes, y la mascara asociada puede no corresponder a ningun objeto real.
- Limitaciones de contexto e idioma: no se publican la ventana de contexto ni los idiomas soportados, lo que impide garantizar un comportamiento multilingue fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y de los datasets de entrenamiento, no detalladas en la informacion disponible.
- Dependencia de codigo externo: la inferencia exige instalar el paquete del repositorio Xiaomi-Lens-0; no basta con `transformers` estandar, lo que anade complejidad al despliegue en produccion.
- Madurez: repositorio con 66 descargas y 0 likes en el momento de la consulta, creado en octubre de 2026; no hay evidencia de validacion independiente ni de soporte en motores de inferencia de alto rendimiento.
- Ausencia de benchmarks publicos: no es posible verificar el rendimiento frente a alternativas, lo que desaconseja su adopcion en produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guarin/Xiaomi-Lens-0
- Pagina del proyecto: https://seerray-lab.github.io/Xiaomi-Lens-0/
- Repositorio de codigo: https://github.com/SeerRay-Lab/Xiaomi-Lens-0
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.23279
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hugging-apps/xiaomi-lens-0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B

# mlx-community/SenseNova-U1.5-8B-MoT-8step-8bit

## Resumen

SenseNova-U1.5-8B-MoT es un modelo multimodal nativo desarrollado por SenseTime que unifica comprensión, razonamiento y generación de imágenes en una única arquitectura monolítica. A diferencia de los sistemas tradicionales que combinan un modelo de lenguaje con un difusor mediante adaptadores, este modelo opera directamente en el espacio de píxeles sin codificador VAE, lo que permite un flujo de trabajo integrado entre texto e imagen. La variante MLX aquí descrita es una conversión oficial para Apple Silicon que incorpora una destilación de 8 pasos y cuantización de 8 bits con grupo de tamaño 64.

La arquitectura se basa en NEO-unify, una variante de Mixture-of-Transformers que mezcla componentes de atención densa y dispersa en un único bloque, con flujo rectificado en espacio de píxeles. El modelo tiene 5,88 mil millones de parámetros totales y soporta tareas de generación de texto a imagen, edición por instrucción, VQA y razonamiento con modo de pensamiento. La relevancia actual reside en que representa un enfoque radicalmente distinto a la integración de modalidades, eliminando la necesidad de adaptadores y VAE, y en que esta conversión MLX permite ejecutarlo en hardware de Apple con rendimiento notable: una imagen de 1024×1024 píxeles en 3,8 segundos en un M5 Max.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers (flujo rectificado en espacio de píxeles, sin VAE) |
| Parametros totales | 5.884.223.680 (5,88B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit con grupo de tamaño 64 (stream quantization), además de la conversión bf16 original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors con layout NHWC para convoluciones y lineales cuantizados como weight/scales/biases) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT emplea la arquitectura NEO-unify, una Mixture-of-Transformers que integra módulos de atención densa y dispersa dentro de un único bloque. A diferencia de modelos como Stable Diffusion o Flux, no utiliza un VAE: opera directamente sobre píxeles mediante un flujo rectificado, lo que simplifica el pipeline y elimina las pérdidas de calidad asociadas a la latencia entre el espacio latente y el de píxeles. El entrenamiento se realizó en cuatro etapas: preentrenamiento de comprensión, preentrenamiento de generación, entrenamiento conjunto de ambas modalidades y un ajuste fino supervisado final con datos de instrucción de alta calidad que incluyen diálogo multimodal, generación de imágenes, edición y datos intercalados. Además, el modelo incorpora un modo de razonamiento de pensamiento (`thinking`) que se activa mediante una instrucción específica.

La conversión MLX de este repositorio fusiona el LoRA oficial de destilación de 8 pasos en el flujo de generación, aplica una cuantización de 8 bit con grupo de tamaño 64 y almacena los pesos en el formato de layout del runtime `sensenova-u1-swift`. Esta conversión mantiene una paridad de componentes inferior a 1e-4 y una similitud coseno de paso completo superior a 0,999 respecto a la implementación de referencia en PyTorch, verificada con semilla fija.

## Capacidades

- Generación de imágenes de texto a imagen (T2I) con control fino de resolución (hasta 2048×2048 píxeles) y sin necesidad de CFG (classifier-free guidance) al emplear el modo destilado de 8 pasos.
- Edición de imágenes por instrucción (`--edit-image`), que permite modificar una imagen existente mediante una descripción textual.
- Visual Question Answering (VQA) nativo, sin adaptadores externos, respondiendo preguntas sobre el contenido de una imagen.
- Razonamiento multimodal con modo de pensamiento (`--think`), que activa una cadena de razonamiento interna antes de generar la respuesta final.
- Comprensión y generación unificadas en un solo modelo, sin necesidad de combinar un LLM con un difusor independiente.
- Capacidad de procesar y generar imágenes y texto de forma intercalada, lo que permite tareas complejas como explicar una imagen y generar una nueva variante en la misma conversación.

## Casos de uso

- Generación de imágenes para prototipado rápido de diseño: el modelo puede producir imágenes de 1024×1024 en 3,8 segundos en un M5 Max, lo que permite iterar sobre conceptos visuales en tiempo real durante sesiones de diseño o brainstorming.
- Edición de imágenes por instrucciones en flujos de trabajo editoriales: un fotógrafo o diseñador puede cargar una imagen y pedir cambios concretos (por ejemplo, "cambiar el cielo a tonos dorados") sin necesidad de herramientas de retoque complejas, gracias a la capacidad de edición nativa del modelo.
- Sistemas de asistencia visual para personas con discapacidad: el modelo puede responder preguntas sobre imágenes (VQA) en tiempo real, por ejemplo describir objetos, texto o escenas en una foto capturada con un móvil, funcionando como asistente visual integrado en aplicaciones de accesibilidad.
- Generación de variaciones de imágenes para entrenamiento de otros modelos: dado que el modelo acepta instrucciones y genera imágenes coherentes, se puede usar para sintetizar datasets de entrenamiento aumentados, generando variaciones controladas de imágenes existentes con instrucciones específicas.
- Creación de storyboards o concept art en producción audiovisual: con la capacidad de razonar sobre una escena y generar imágenes coherentes con la narrativa, un director o guionista puede visualizar secuencias de manera iterativa sin depender de herramientas de dibujo.
- Demostraciones interactivas en entornos educativos: la combinación de VQA y generación de imágenes en un solo modelo permite construir aplicaciones donde un estudiante pregunta sobre una imagen y el sistema genera una nueva ilustración que explica el concepto, todo en una única conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio MLX indica únicamente el rendimiento de inferencia medido en un Apple M5 Max:

| Tarea | Resolución | Tiempo | Memoria pico |
|---|---|---|---|
| Generación T2I | 1024×1024 | 3,8 s | 22,4 GB |
| Generación T2I | 2048×2048 | 19,5 s | 22,4 GB |

No se proporcionan métricas comparativas de calidad de imagen (FID, CLIP score, etc.) ni resultados de VQA o razonamiento en benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: 22,4 GB de memoria pico en un M5 Max, lo que implica que se necesita un Apple Silicon con al menos 24 GB de memoria unificada para la resolución de 1024×1024 con cuantización de 8 bits.
- GPU recomendadas: el formato MLX está optimizado para Apple Silicon (M1, M2, M3, M4, M5); no se proporcionan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con hardware de consumo: sí, en MacBooks y Mac Studios con chips M1 Pro o superiores, siempre que dispongan de al menos 24 GB de RAM unificada. En M5 Max se alcanzan los 3,8 s por imagen a 1024×1024.
- Opciones de despliegue: runtime oficial `sensenova-uox-swift` (MLX-Swift) que se compila con `swift build -c release`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato MLX es específico de Apple Silicon.
- Latencia y throughput: 3,8 s por imagen a 1024×1024 y 19,5 s a 2048×2048 en M5 Max, con un único forward por paso gracias al modo CFG-free. Para VQA y edición no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT (base) | 5,88B | NEO-unify MoT, pixel-space | no disponible | Apache-2.0 | PyTorch (safetensors) |
| SenseNova-U1.5-8B-MoT-8step-8bit (este) | 5,88B | NEO-unify MoT, pixel-space, 8-bit | no disponible | Apache-2.0 | MLX (safetensors) |
| Flux.1-dev | 12B | Transformer + VAE | no disponible | Apache-2.0 | PyTorch |
| SDXL | 3,5B | U-Net + VAE | no disponible | OpenRAIL++ | PyTorch |

La comparación con Flux.1-dev y SDXL se basa en su uso como modelos de generación de imagen de tamaño similar, aunque ninguno de ellos es multimodal nativo ni opera sin VAE. SenseNova-U1.5 destaca por integrar VQA, edición y generación en un único modelo, algo que ni Flux ni SDXL ofrecen de forma nativa. La versión MLX es específica para Apple Silicon, mientras que Flux y SDXL tienen soporte amplio en GPUs NVIDIA y herramientas estándar como ComfyUI o A1111.

## Limitaciones y advertencias

- El modelo es una conversión MLX para Apple Silicon; no puede ejecutarse en GPUs NVIDIA o AMD con los pesos proporcionados sin una conversión adicional.
- La cuantización de 8 bit con grupo de 64 puede introducir una ligera degradación de calidad respecto al modelo original en bf16, aunque la model card indica que reproduce la imagen fusionada con semilla fija.
- No se proporcionan datos de sesgos, alucinación visual o riesgos de contenido inapropiado en la información disponible.
- El contexto de texto soportado no está documentado, lo que limita la planificación de casos de uso que requieran interacciones muy largas.
- Los idiomas soportados no se especifican; el modelo base de SenseNova es multilingüe, pero no hay confirmación para esta variante.
- El runtime `sensenova-uox-swift` es un proyecto de terceros (no oficial de SenseTime), por lo que se debe verificar su mantenimiento y estabilidad antes de usar en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original por si existieran restricciones adicionales.

## Enlaces

- Repositorio de HuggingFace de esta conversión MLX: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-8bit
- Modelo base en HuggingFace: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Modelo base en HuggingFace (versión 1.0): https://huggingface.co/sensenova/SenseNova-U1-8B-MoT
- Página del modelo en ModelScope: https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT
- Código de referencia y repositorio oficial: https://github.com/OpenSenseNova/SenseNova-U1
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-uox-swift
- Paper (arXiv): https://arxiv.org/abs/2605.12500
- LoRAs de destilación: https://huggingface.co/xocialize/SenseNova-U1.5-8B-MoT-LoRAs

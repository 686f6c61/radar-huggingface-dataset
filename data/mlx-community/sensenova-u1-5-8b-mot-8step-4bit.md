# mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit

## Resumen

SenseNova-U1.5-8B-MoT-8step-4bit es un artefacto MLX (Apple Silicon) del modelo unificado multimodal SenseNova-U1.5-8B-MoT, desarrollado por SenseTime. Se trata de un modelo any-to-any que combina generacion de imagenes a partir de texto (T2I), edicion por instrucciones y respuesta visual a preguntas (VQA) en una unica arquitectura monolitica, sin adaptadores entre modalidades. El checkpoint cuantizado contiene 3.858.374.848 parametros y se distribuye bajo licencia Apache-2.0.

La arquitectura NEO-unify es un Mixture-of-Transformers que opera directamente en el espacio de pixeles (pixel-space rectified flow), prescindiendo de VAE. Este artefacto integra un LoRA de destilacion de 8 pasos fusionado en el checkpoint original y aplica cuantizacion de 4 bits con grupo de tamano 64. Los pesos se almacenan en el layout del runtime MLX-Swift (convoluciones NHWC y lineales cuantizados como weight/scales/biases), lo que elimina cualquier conversion en tiempo de carga.

La relevancia actual radica en que permite ejecutar un modelo multimodal nativo de codigo abierto en equipos Apple con 16 GB de memoria unificada, con tiempos de generacion de 3,2 segundos para 1024x1024 y 15,8 segundos para 2048x2048 en un M5 Max. Es la opcion mas ligera y rapida de la familia SenseNova-U1.5, a costa de una fidelidad ligeramente menor respecto al checkpoint bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers, pixel-space rectified flow, sin VAE |
| Parametros totales | 3.858.374.848 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit grupo 64 (este artefacto); 8-bit en tier superior |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, layout NHWC) |

## Arquitectura y entrenamiento

La arquitectura NEO-unify es un Mixture-of-Transformers que unifica comprension, razonamiento y generacion en un solo modelo. La version 1.5 refuerza las capas de patchify, la calidad y distribucion de los datos, la formulacion de tareas, la mejora de prompts y el pipeline de post-entrenamiento. El modelo original se entrena en un proceso de pre-entrenamiento y post-entrenamiento detallado en el paper [2605.12500](https://arxiv.org/abs/2605.12500), que tambien documenta estrategias de inferencia y datos de preprocesado.

Este artefacto MLX es una conversion del checkpoint oficial: fusion del LoRA de destilacion de 8 pasos, casting a bf16 y cuantizacion de 4 bits con grupo 64. El runtime deMLX-Swift verifica una paridad de componente inferior a 1e-4 y una similitud coseno por pasada de 0.999+ frente a la implementacion de referencia en PyTorch. La carga de pesos se realiza sin conversion en tiempo, por lo que el pico de memoria coincide con la memoria residente.

## Capacidades

- Generacion de imagenes de alta calidad a partir de texto (T2I) en resoluciones de 1024x1024 y 2048x2048.
- Edicion de imagenes mediante instrucciones en lenguaje natural (modo --edit-image).
- Respuesta visual a preguntas (VQA) sobre imagenes (modo --vqa).
- Modo de razonamiento "thinking" para tareas de razonamiento multimodal de varios pasos (--think).
- Razonamiento multimodal unificado: el modelo "piensa y actua" a traves de lenguaje y vision en una sola arquitectura, sin adaptadores.
- Soporte de destilacion de 8 pasos para inferencia rapida con calidad de 8 pasos.

## Casos de uso

- Generacion de imagenes para marketing y contenido: el modelo puede producir imagenes fotorrealistas de 1024x1024 o 2048x2048 a partir de prompts descriptivos, directamente en un Mac de desarrollo sin depender de servicios en la nube.
- Edicion de imagenes en flujos creativos: mediante --edit-image, un disenador puede modificar iluminacion, composicion o elementos de una imagen existente con instrucciones textuales, acelerando iteraciones de diseno.
- Asistencia visual en documentacion tecnica: el modo VQA permite responder preguntas sobre diagramas, capturas o graficos, integrable en herramientas de documentacion interna.
- Analisis de imagenes con razonamiento: el modo --think habilita el analisis de varios pasos de imagenes complejas, util para revisar resultados de experimentos o inspeccionar prototipos.
- Despliegue local en equipos de desarrollo: con un pico de 14,8 GB de memoria, cabe en Macs de 16 GB, permitiendo evaluacion y prototipado sin acceso a servidores.
- Automatizacion de generacion visual en CI/CD: el CLI puede integrarse en pipelines de integracion continua para generar capturas de referencia o visualizaciones reproducibles de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo de difusion multimodal y no de un LLM de texto. Los datos de rendimiento medidos en Apple M5 Max son:

| Tarea | Resolucion | Tiempo | Pico de memoria |
|---|---|---|---|
| Generacion de imagen | 1024x1024 | 3,2 s | 14,8 GB |
| Generacion de imagen | 2048x2048 | 15,8 s | 14,8 GB |

La fidelidad respecto al checkpoint bf16 se mide con un coseno de ~0.92 en el mismo seed, lo que indica que la cuantizacion de 4 bits produce resultados validos pero no identicos.

## Requisitos de hardware

- Memoria minima: 14,8 GB de RAM unificada; cabe en equipos con 16 GB.
- GPU compatibles: Apple Silicon (M1-M5) exclusivamente, dado el formato MLX.
- Rendimiento medido: M5 Max con 14,8 GB de pico y tiempos de 3,2 s (1024x1024) y 15,8 s (2048x2048).
- Despliegue: runtime sensenova-u1-swift (MLX-Swift), CLI con opciones --weights, --edit-image, --vqa y --think.
- No hay soporte para vLLM, TGI, llama.cpp u Ollama; el artefacto es exclusivo de MLX.
- Latencia: en M5 Max, la generacion de 1024x1024 en 8 pasos tarda 3,2 segundos; la de 2048x2048, 15,8 segundos.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT (original) | PyTorch | ~8B (MoT) | bf16 | Apache-2.0 | GPU NVIDIA |
| SenseNova-U1.5-8B-MoT-8step-4bit (este) | MLX | 3.858.374.848 | 4-bit grupo 64 | Apache-2.0 | Apple Silicon |
| SenseNova-U1.5-8B-MoT-8step-8bit | MLX | no disponible | 8-bit | Apache-2.0 | Apple Silicon |

La variante de 8 bits del mismo modelo es la alternativa recomendada cuando se requiere una salida fiel al bf16, a costa de mayor uso de memoria. No se dispone de datos de modelos de otros fabricantes (p. ej., FLUX, SDXL) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 4 bits altera la trayectoria de denoise: a un seed fijo, produce una imagen diferente pero igualmente valida (coseno ~0.92 vs bf16). Para resultados fieles al bf16, se recomienda el tier de 8 bits.
- El artefacto es exclusivo de Apple Silicon (MLX); no es compatible con GPU NVIDIA, AMD o infraestructura cloud estandar con vLLM o TGI.
- No se ha publicado informacion sobre los idiomas soportados ni la longitud de contexto, al tratarse de un modelo de difusion y no de un LLM de texto.
- El modelo requiere el runtime especifico sensenova-u1-swift; no funciona con librerias estandar como diffusers o transformers.
- No se han publicado pruebas de comprension de texto (MMLU, etc.) ni de otros benchmarks genericos para este checkpoint.

## Enlaces

- [HuggingFace: mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit](https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit)
- [HuggingFace: sensenova/SenseNova-U1.5-8B-MoT (original)](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT)
- [HuggingFace: sensenova/SenseNova-U1-8B-MoT](https://huggingface.co/sensenova/SenseNova-U1-8B-MoT)
- [Paper: SenseNova-U1 (arXiv 2605.12500)](https://arxiv.org/abs/2605.12500)
- [GitHub: OpenSenseNova/SenseNova-U1 (implementacion de referencia)](https://github.com/OpenSenseNova/SenseNova-U1)
- [GitHub: xocialize/sensenova-u1-swift (runtime MLX)](https://github.com/xocialize/sensenova-u1-swift)
- [ModelScope: SenseNova-U1.5-8B-MoT](https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT)
- [HuggingFace: SceneWorks/sensenova-u1-8b-fast-mlx](https://huggingface.co/SceneWorks/sensenova-u1-8b-fast-mlx)

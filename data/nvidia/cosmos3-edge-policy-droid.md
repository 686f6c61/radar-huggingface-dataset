# nvidia/Cosmos3-Edge-Policy-DROID

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (world action model) desarrollado por NVIDIA dentro de la plataforma Cosmos 3, un conjunto de modelos fundacionales de mundo diseñados para acelerar la IA física (robótica, vehículos autónomos y espacios inteligentes). Este modelo concreto está especializado en generar trayectorias de acciones para el control de robots de manipulación, tomando como entrada instrucciones en lenguaje natural y observaciones visuales del robot.

Se trata de la variante Edge de la familia de políticas DROID, con aproximadamente 3,86 mil millones de parámetros, lo que lo sitúa como la opción ligera frente a las variantes Nano (16B) y Super (64B). Su objetivo es ejecutar control en tiempo real en hardware de borde, razonando sobre lo que ve el robot y generando acciones coherentes con la tarea solicitada. Fue liberado el 20 de julio de 2026 bajo la licencia OpenMDW1.1, tanto para uso comercial como no comercial.

El modelo forma parte de la plataforma Cosmos de NVIDIA, que combina generación de vídeo, imagen, audio y acciones. En el caso de Cosmos3-Edge-Policy-DROID, la salida es exclusivamente la trayectoria de acciones del robot, lo que lo convierte en un componente de control, no en un generador de contenido multimodal. Está específicamente entrenado con datos del dataset DROID, una plataforma robótica de manipulación de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): transformer autorregresivo para texto + diffusion transformer para acciones |
| Parametros totales | 3.859.003.312 (~3,86B) |
| Parametros activos | no disponible (no es MoE, es MoT) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (permite uso comercial y no comercial) |
| Formato de pesos | safetensors (model.safetensors.index.json + 7 shards del transformer, VAE, vision encoder, tokenizadores) |

## Arquitectura y entrenamiento

Cosmos3-Edge-Policy-DROID se basa en la arquitectura Mixture-of-Transformers (MoT) de la familia Cosmos3, que combina dos torres transformer complementarias: un transformer autorregresivo encargado de la generación de tokens discretos (texto) y un diffusion transformer para la síntesis de modalidades continuas (imagen, vídeo, audio y, en este caso, acciones). En inferencia, el texto se genera mediante decodificación autorregresiva estándar de siguiente token, mientras que las trayectorias de acción se sintetizan mediante un proceso iterativo de denoising. Esta arquitectura unificada permite modelar modalidades heterogéneas sin necesidad de redes separadas.

El entrenamiento específico para política se realiza sobre el dataset DROID, una plataforma de recolección de datos de manipulación robótica de NVIDIA. El modelo aprende a mapear observaciones visuales del robot (a través de un vision encoder) y la instrucción en lenguaje natural a una secuencia de acciones de control. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante. La información disponible tampoco detalla innovaciones adicionales como decodificación especulativa o attention lineal.

## Capacidades

- Generación de trayectorias de acción para robots de manipulación: dado un texto de instrucción y observaciones visuales, produce una secuencia de acciones de control coherentes con la tarea.
- Razonamiento sobre el estado observado del entorno: el modelo interpreta la escena visual actual para decidir la siguiente acción, no solo reproduce patrones estáticos.
- Integración con la plataforma Cosmos 3: funciona como componente de control dentro de un ecosistema más amplio de modelos de mundo (world models) para IA física.
- Ejecución en tiempo real en hardware de borde: es la variante Edge de la familia, pensada para correr en módulos compactos y control en tiempo real.
- Soporte de entrada multimodal: combina texto (instrucción) y visión (observaciones) en un único pipeline de inferencia.
- No soporta generación de vídeo, imagen ni audio: este modelo concreto está especializado únicamente en la salida de acciones.

## Casos de uso

- Control de brazos robóticos en laboratorio: el modelo puede sustituir a controladores clásicos en tareas de manipulación sobre la plataforma DROID, generando trayectorias a partir de una instrucción textual como "coge el objeto rojo" y la imagen de la cámara del robot.
- Automatización de fabricación en fábrica: en entornos industriales, se puede integrar para tareas de pick-and-place y ensamblaje repetitivo, donde la observación visual y la instrucción textual se combinan para generar acciones en tiempo real.
- Teleoperación asistida: un operador humano describe la tarea en lenguaje natural y el modelo completa la trayectoria de acción, reduciendo la carga cognitiva del control manual en entornos de trabajo remoto.
- Simulación de políticas (sim-to-real): el modelo puede usarse en entornos simulados para generar datos de acción sintéticos que luego se transfieren a robots reales, acelerando el ciclo de desarrollo de políticas de control.
- Investigación en aprendizaje robótico: sirve como punto de partida para experimentos de aprendizaje por refuerzo y comportamiento emergente, ya que ofrece una política base entrenada en un dataset real y diverso.
- Prototipado de sistemas de control de borde: dado su tamaño reducido, es adecuado para validar despliegues en hardware de bajo consumo (NVIDIA Jetson u otros módulos de borde) antes de escalar a las variantes Nano o Super.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para Cosmos3-Edge-Policy-DROID en la información disponible. El sitio oficial de Cosmos 3 menciona que la familia Cosmos 3 lidera entre los modelos abiertos en los benchmarks de robótica R-Bench, RoboLab y RoboArena, pero no se incluyen cifras concretas ni una desglose por variante de modelo. No hay datos de MMLU, HumanEval ni otras métricas de lenguaje, ya que este modelo no está diseñado para tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación oficial. Con ~3,86B parámetros, una estimación razonable sería unos 8 GB en FP16 y menos de 4 GB en cuantización de 8 bits, pero no se confirma en la información proporcionada.
- GPU recomendadas: la familia Edge está diseñada para hardware de borde; se espera compatibilidad con GPUs de consumo (RTX 3090, RTX 4090) y plataformas embebidas de NVIDIA como Jetson, aunque no hay una lista oficial de requisitos publicada.
- Capacidad en consumer GPU: por tamaño, cabe en GPUs de consumo actuales (16 GB o más), especialmente con cuantización.
- Opciones de despliegue: la librería `cosmos` de NVIDIA es la vía principal; no se mencionan soporte explícito para vLLM, llama.cpp u Ollama en la información.
- Latencia y throughput: no disponible. El diseño Edge sugiere optimización para tiempo real, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-Policy-DROID | 3,86B | no disponible | Política de robot (DROID) | OpenMDW 1.1 | Hugging Face, código abierto |
| Cosmos3-Nano-Policy-DROID | 16B | no disponible | Política de robot (DROID) | OpenMDW 1.1 | Hugging Face, código abierto |
| Cosmos3-Super-Policy-DROID | 64B | no disponible | Política de robot (DROID) | OpenMDW 1.1 | Hugging Face, código abierto |

No se han identificado en la información proporcionada alternativas de terceros con la misma especialización en políticas de robot sobre el dataset DROID. La comparativa se limita a las variantes internas de la familia Cosmos 3, donde Edge es la opción más ligera y Super la más pesada. No se dispone de datos de rendimiento comparativo entre ellas en la información revisada.

## Limitaciones y advertencias

- Especialización restringida: el modelo está entrenado exclusivamente para la plataforma DROID y tareas de manipulación; no sirve para control de robots de otras plataformas sin reentrenamiento o fine-tuning.
- Riesgo de alucinación de acciones: al ser un modelo generativo, puede producir trayectorias de acción incoherentes o inseguras si la entrada visual o textual no se ajusta a los datos de entrenamiento; requiere supervisión humana en entornos reales.
- Sin datos de robustez publicados: no se ha documentado el comportamiento en condiciones de iluminación variable, oclusiones o fallos de sensores, lo que limita la confianza para despliegues de producción sin validación previa.
- Licencia OpenMDW 1.1: aunque permite uso comercial, es una licencia propia de NVIDIA con condiciones específicas que deben revisarse antes de su integración en productos; el enlace a los términos está disponible en la página del modelo.
- Sin soporte de idiomas documentado: no se indica qué idiomas soporta la entrada de instrucciones; el dataset DROID está mayoritariamente en inglés, por lo que las instrucciones en otros idiomas pueden degradar el rendimiento.
- Dependencia del ecosistema Cosmos: para usar el modelo es necesario utilizar la librería `cosmos` de NVIDIA, lo que limita la portabilidad a otros frameworks de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Colección de modelos Cosmos 3: https://huggingface.co/collections/nvidia/cosmos3
- Repositorio de código: https://github.com/nvidia/cosmos
- White paper (informe técnico): https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Página web de Cosmos 3: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Documentación de referencia de modelos: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper DMD2 (distillation, referencia de la familia): https://arxiv.org/abs/2405.14867

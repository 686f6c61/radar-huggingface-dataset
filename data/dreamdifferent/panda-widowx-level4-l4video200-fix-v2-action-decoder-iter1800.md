# dreamdifferent/panda-widowx-level4-l4video200-fix-v2-action-decoder-iter1800

## Resumen

Este repositorio contiene un checkpoint del decodificador World2Action del proyecto VAM-Cross MimicVideo, desarrollado por el usuario dreamdifferent. No es un modelo de lenguaje: es un componente de prediccion de acciones para robotica que transforma representaciones derivadas de video en comandos motores. En concreto, el modelo genera 15 acciones de efector final y pinza (achieved-EE/gripper) a 5 Hz, a partir de observaciones de dos camaras (`corner_cam` y `front_cam`), orientado a una plataforma WidowX con datos de manipulacion etiquetados como nivel 4 con el robot Panda.

El checkpoint corresponde a la iteracion 1800 de la ejecucion `w2a_panda_widowx_level4_l4video200_fix_v2_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, que se detuvo por causa desconocida (`unknown`). El modelo no funciona de forma autonoma: requiere una serie de entradas congeladas (backbone Video2World, decodificador de acciones inicial y LoRA de video) fijadas a commits concretos, ademas de un contrato de datos especifico. Ni el dataset ni las entradas congeladas se incluyen en el repositorio.

La relevancia de esta ficha es limitada y conviene ser honesto: se trata de un artefacto de investigacion muy especializado, con cero descargas y cero likes, documentacion minima y sin resultados de benchmarks publicados. Su interes radica en ser un ejemplo de arquitectura modular video-a-accion (World2Action) dentro del ecosistema MimicVideo, util para quienes trabajan en aprendizaje por imitacion robotico y quieran reproducir o inspeccionar el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | decodificador World2Action sobre backbone Video2World congelado (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de robotica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB, formato de fichero no especificado) |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline compuesto por varias piezas encadenadas: un backbone Video2World inicial, un decodificador de acciones inicial y una LoRA de video congelada, sobre los que se entrena este decodificador World2Action. El checkpoint publicado es unicamente el decodificador resultante de la iteracion 1800. El autor indica que se selecciono el peso mas reciente tras verificar el conjunto completo de checkpoint de modelo, optimizador, planificador y trainer, pero no se detalla la arquitectura interna (numero de capas, tipo de atencion, dimensiones) ni el numero de tokens o muestras de entrenamiento.

El contrato de datos si esta especificado con precision. El dataset asociado es `dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture`, con 163 episodios y 54.200 fotogramas, dos camaras (`observation.images.corner_cam`, `observation.images.front_cam`). El objetivo son 15 acciones de efector final y pinza a 5 Hz, con pose objetivo expresada como `relative_to_current_achieved_pose` en el marco `widowx_reference_base/teleop_aligned_tool` y rotacion codificada como `rotation_6d`. Las entradas congeladas requeridas estan fijadas a commits especificos (MimicVideo `e3355dbc...`, backbone `widowx250-video-fused@f0cea76b...`, decodificador inicial `vam-cross-target-widowx250-native-2cam-action-decoder@93750ccc...` y LoRA de video `vam-cross-level4-panda-widowx-widowx-texture-video-lora-iter200@42a02cb2...`). No se documentan tecnicas de optimizacion tipo RLHF/DPO, decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Prediccion de acciones motoras: genera 15 valores de accion de efector final y pinza a una frecuencia de 5 Hz.
- Control basado en vision: consume observaciones de dos camaras (corner_cam y front_cam) como entrada.
- Codificacion de pose relativa: trabaja con poses relativas a la pose alcanzada actual en el marco base de referencia.
- Representacion de rotacion: emplea rotacion en formato 6D (`rotation_6d`).
- Integracion en pipeline modular: esta disenado para operar junto a un backbone Video2World y una LoRA de video congelados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo de robotica).
- Capacidades especiales (vision, audio, thinking mode): procesa video, pero no se documentan capacidades adicionales.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como decodificador de acciones dentro de un pipeline World2Action, permitiendo estudiar como representaciones de video se traducen en comandos motores a 5 Hz sobre una plataforma WidowX.
- Reproduccion de experimentos MimicVideo: dado que las entradas congeladas estan fijadas a commits concretos, el checkpoint permite reproducir de forma determinista el estado de la iteracion 1800 del decodificador.
- Control de manipulacion con efector final y pinza: las 15 salidas (EE + gripper) a 5 Hz son utiles para tareas de agarre y colocacion donde se necesita control continuo de la pinza.
- Politica condicionada por multiples vistas: el uso de dos camaras permite generar acciones a partir de percepcion estereoscopica o multivista, adecuado para tareas que requieren estimacion de profundidad o desambiguacion de oclusiones.
- Evaluacion de arquitecturas video-a-accion: util como punto de comparacion frente a otros decodificadores o politicas entrenadas sobre el mismo dataset `vam-cross-level4-panda-widowx-widowx-texture`.
- Base para fine-tuning downstream: al ser un decodificador entrenado sobre 163 episodios y 54.200 fotogramas, puede servir de inicializacion para tareas de manipulacion relacionadas en el mismo entorno de teleoperacion.
- Analisis de pipelines modulares en robotica: permite estudiar el acoplamiento entre backbone congelado, LoRA de video y decodificador, y como afecta a la calidad de las acciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito de tareas, error de prediccion de acciones ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 1.0 GB, lo que sugiere un conjunto de pesos de ese orden combinado (decodificador y componentes asociados); la VRAM necesaria depende del backbone Video2World y de la LoRA congelados, que no se incluyen y cuyos requisitos no se documentan.
- GPU recomendadas: no disponibles. Al tratarse de un decodificador de robotica de tamano moderado (repo de 1.0 GB) es plausible que quepa en GPUs de consumo (por ejemplo RTX 3090 o RTX 4090), pero esto no puede confirmarse sin conocer el backbone completo.
- Encaje en GPU de consumo: no confirmable con la informacion disponible.
- Opciones de despliegue: no disponibles. No se especifica soporte para vLLM, llama.cpp, Ollama ni TGI; estos frameworks estan orientados a modelos de lenguaje y no aplican directamente a un decodificador de acciones.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de control objetivo (5 Hz), lo que implica un presupuesto de 200 ms por paso de inferencia, pero no se aportan medidas reales de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de este modelo, por lo que una comparacion cuantitativa no es posible. Como alternativas de categoria se podrian considerar politicas y modelos video-a-accion de robotica (por ejemplo, familias tipo OpenVLA, Octo o RT-2), pero no se han proporcionado sus datos en la informacion disponible. No disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panda-widowx-level4-...-action-decoder-iter1800 | no disponible | no aplica | no disponible | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables (OpenVLA, Octo, RT-2, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Componente dependiente: el modelo no es autonomo; necesita el backbone Video2World, la LoRA de video y el decodificador inicial congelados, fijados a commits concretos, que no se incluyen en el repositorio.
- Datos no incluidos: el dataset `vam-cross-level4-panda-widowx-widowx-texture` no se distribuye con el modelo, lo que dificulta la reproduccion o el fine-tuning sin acceso externo.
- Entrenamiento interrumpido: la ejecucion se detuvo por causa desconocida (`unknown`), por lo que la calidad del checkpoint no esta garantizada.
- Documentacion minima: la model card es muy escueta y no describe arquitectura interna, hiperparametros, regimen de entrenamiento ni evaluacion.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo, y al tratarse de robotica los sesgos relevantes serian de distribucion de tareas y entornos, no linguisticos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la prediccion de acciones fuera del dominio de entrenamiento, que no se ha caracterizado.
- Limitaciones de contexto e idioma: no aplica un contexto textual; el alcance esta acotado a la plataforma WidowX con las dos camaras y el contrato de acciones especificados.
- Restricciones de licencia: la licencia es no disponible, por lo que no puede confirmarse si se permite uso comercial. Debe tratarse como restringida hasta verificar con el autor.
- Uso en produccion: no recomendado sin evaluacion adicional, dado el estado de investigacion, la ausencia de benchmarks y la falta de licencia clara.
- Idiomas: no disponible; no se trata de un modelo linguistico.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/panda-widowx-level4-l4video200-fix-v2-action-decoder-iter1800
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture-video-lora-iter200
- Dataset asociado: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-widowx-widowx-texture
- Repositorio MimicVideo (commit referenciado): e3355dbc93132b576c02f920a59b4fc18a4f5906 (sin URL directa proporcionada)

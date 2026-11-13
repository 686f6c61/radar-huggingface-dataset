# 360ZhiNao/RelaCtrl

## Resumen

RelaCtrl es una arquitectura de tipo ControlNet disenada especificamente para Diffusion Transformers (DiT), desarrollada por 360ZhiNao (grupo de vision de 360). El modelo resuelve el problema del control espacial eficiente en modelos de difusion basados en transformers, donde los ControlNet tradicionales disenados para arquitecturas U-Net no se adaptan bien. RelaCtrl introduce una guia de relevancia que selecciona que capas del DiT reciben las senales de control, reduciendo el coste computacional frente a inyectar control en todas las capas.

El repositorio tiene un tamano de 5,7 GB y se distribuye bajo licencia Apache 2.0. Esta vinculado al paper arXiv 2502.14377 (cs.CV, 2025) y dispone de pagina de proyecto y repositorio GitHub oficiales. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas soportados en la informacion proporcionada.

Es relevante para investigadores y desarrolladores que trabajan en generacion de imagenes condicionada con DiT (por ejemplo, familias tipo Flux o SD3), ya que propone una alternativa mas eficiente a los ControlNet convencionales sin sacrificar fidelidad de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet-like para Diffusion Transformers (DiT) con guia de relevancia |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 5,7 GB) |

## Arquitectura y entrenamiento

RelaCtrl es una arquitectura de control condicional para Diffusion Transformers. A diferencia de los ControlNet clasicos, que copian el encoder de una U-Net y conectan bloques mediante zero-convolutions, RelaCtrl opera sobre bloques transformer e incorpora un mecanismo de "relevancia" que determina que capas del DiT deben recibir la senal de control. Esto reduce el numero de parametros adicionales y el coste de inferencia en comparacion con inyectar control en todas las capas del backbone.

El paper asociado (arXiv 2502.14377) describe el diseno como una alternativa eficiente para DiT. No se dispone en la informacion proporcionada de datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control espacial condicionado de la generacion de imagenes sobre backbones DiT (pose, depth, edge, etc., segun el paper).
- Arquitectura de tipo ControlNet adaptada a transformers de difusion, no a U-Net.
- Seleccion guiada por relevancia de las capas del DiT que reciben control, con el objetivo de reducir coste computacional.
- No se dispone de informacion sobre tool calling, agentes, capacidades multilingues ni modos especiales (thinking, vision, audio) en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes con control estructural: usar RelaCtrl como adaptador de control sobre un DiT para condicionar la salida a mapas de profundidad, pose o bordes, manteniendo la fidelidad estructural sin reentrenar el backbone completo.
- Investigacion en ControlNet para DiT: servir como implementacion de referencia para comparar estrategias de inyeccion de control (todas las capas frente a seleccion por relevancia) en experimentos academicos.
- Prototipado de pipelines de difusion condicionada: integrar el adaptador en flujos de generacion de imagen donde se requiera control espacial y se quiera minimizar el incremento de parametros y de latencia.
- Fine-tuning eficiente sobre DiT preentrenados: al anadir un numero reducido de parametros de control, permite adaptar modelos base a tareas de control especificas con menor coste de entrenamiento.
- Evaluacion comparativa de eficiencia: usar el modelo como baseline para medir el trade-off entre calidad de control y coste computacional frente a ControlNet clasicos adaptados a DiT.
- Demos y reproduccion de resultados del paper: el repositorio GitHub y la pagina de proyecto permiten reproducir los experimentos publicados en arXiv 2502.14377.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el tamano del repo es de 5,7 GB, lo que da una referencia del peso en disco de los pesos, no de la VRAM de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; al tratarse de un adaptador para DiT, el despliegue dependera del framework de difusion usado con el backbone).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RelaCtrl | ControlNet-like para DiT | DiT | no disponible | no disponible | Apache 2.0 | Hugging Face, GitHub |
| ControlNet (original) | ControlNet para U-Net | Stable Diffusion U-Net | no disponible en esta ficha | no disponible | Apache 2.0 (segun version) | Hugging Face |
| ControlNet++ / variantes para DiT | ControlNet adaptado | DiT | no disponible en esta ficha | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo en la documentacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplicable el riesgo general de los modelos generativos de imagen (artefactos, incoherencias estructurales).
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias del backbone DiT sobre el que se aplique el adaptador, ya que pueden imponer restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Al ser una reproduccion oficial de un paper, el soporte y mantenimiento pueden ser limitados; verificar compatibilidad con la version del framework de difusion antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/RelaCtrl
- Paper arXiv: https://arxiv.org/abs/2502.14377
- PDF: https://arxiv.org/pdf/2502.14377
- Pagina de proyecto: https://360cvgroup.github.io/RelaCtrl/
- GitHub: https://github.com/360CVGroup/RelaCtrl

# DravenALG/VLANeXt

## Resumen

VLANeXt es un modelo de visión-lenguaje-acción (VLA) diseñado para el aprendizaje de políticas robóticas de propósito general. Desarrollado por un equipo liderado por Xiao-Ming Wu, de la Universidad China de Hong Kong (Shenzhen) y Nanyang Technological University, el modelo surge de un estudio sistemático del espacio de diseño de los VLA, del que se destilan doce hallazgos prácticos que mejoran el rendimiento y la generalización en los benchmarks LIBERO y LIBERO-plus. El modelo se presenta como una receta simple y efectiva que evita el escalado agresivo de parámetros o la ingeniería específica de tareas, logrando resultados de vanguardia en entornos simulados y experimentos reales.

La arquitectura concreta, el número de parámetros y la longitud de contexto no se detallan en la información pública disponible. El repositorio de Hugging Face aloja los checkpoints para evaluación en los benchmarks mencionados, con un tamaño total de 82,3 GB, lo que sugiere un modelo de gran escala, aunque no se especifican las dimensiones exactas. El trabajo ha sido aceptado en ICML 2026 y el código de entrenamiento y evaluación está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), sin detalles publicados de la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | NTU S-Lab License 1.0 (licencia de uso no comercial, restricciones especificas) |
| Formato de pesos | no disponible (el repositorio contiene checkpoints, probablemente safetensors o binarios, sin confirmar) |

## Arquitectura y entrenamiento

La información publica no detalla la arquitectura interna de VLANeXt. El paper (arXiv:2602.18532) reexamina el espacio de diseño de los VLA bajo un marco unificado, disecando las elecciones de diseño en tres dimensiones: componentes fundacionales, esenciales de percepcion y perspectivas de modelado de accion. De este analisis se derivan doce hallazgos que guian la construccion del modelo. No se especifican los datos de entrenamiento, el numero de tokens, ni si se emplearon tecnicas como RLHF o DPO. El modelo se evalua en LIBERO y LIBERO-plus, y se reporta una fuerte generalizacion en experimentos del mundo real, pero los detalles de entrenamiento no estan disponibles en la documentacion publica.

## Capacidades

- Generacion de acciones roboticas a partir de instrucciones en lenguaje natural y observaciones visuales (politica visuo-motora).
- Razonamiento de tareas de manipulacion en entornos simulados (LIBERO, LIBERO-plus) y en entornos fisicos reales.
- Generalizacion a tareas no vistas, segun los resultados reportados en el paper.
- Integracion de comprension visual y semantica del lenguaje para planificacion de acciones.
- No se documentan capacidades de tool calling, agentes multi-paso, ni soporte multimodal mas alla de vision y lenguaje.

## Casos de uso

- Manipulacion robotica en entornos de investigacion: evaluacion de politicas en los benchmarks LIBERO y LIBERO-plus, con soporte para reproducir los resultados del paper.
- Desarrollo de politicas de proposito general: el modelo puede servir como base para aprender tareas de manipulacion variadas sin necesidad de reentrenamiento especifico por tarea, gracias a su diseno orientado a la generalizacion.
- Experimentos de robotica real: el paper reporta experimentos en el mundo real, por lo que el modelo es util para validar politicas en plataformas fisicas.
- Investigacion en VLA: el codigo y los checkpoints permiten estudiar el impacto de las doce decisiones de diseno documentadas, facilitando la reproduccion y extension de los hallazgos.
- Benchmarking de modelos VLA: como punto de referencia de ultima generacion en LIBERO, puede usarse para comparar futuros modelos.
- Educacion y formacion en robotica y aprendizaje por refuerzo: el repositorio ofrece un ejemplo completo de entrenamiento y evaluacion de un VLA moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que VLANeXt supera a los metodos de ultima generacion en LIBERO y LIBERO-plus, y que demuestra una fuerte generalizacion en experimentos reales, pero no se proporcionan cifras concretas (por ejemplo, tasas de exito) en la documentacion publica. Para obtener los numeros exactos, es necesario consultar el paper en arXiv.

## Requisitos de hardware

- El tamano del repositorio es de 82,3 GB, lo que indica que los checkpoints son de gran tamano. No se especifica la VRAM necesaria para inferencia.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado el tamano, es probable que se requieran GPUs de alta gama con al menos 48-80 GB de VRAM, pero esto es una estimacion no confirmada.
- Para entrenamiento o fine-tuning, se necesitarian nodos multi-GPU, aunque no se detallan los requisitos.
- Se recomienda consultar el repositorio de GitHub para instrucciones de entorno y despliegue.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos en la informacion proporcionada. VLANeXt se posiciona como un modelo VLA de ultima generacion, pero no se ofrecen comparaciones numericas con alternativas como OpenVLA, RT-2 o π0 en la documentacion accesible. Para una comparativa rigurosa, es necesario revisar el paper completo.

## Limitaciones y advertencias

- La licencia NTU S-Lab License 1.0 es una licencia de investigacion no comercial; el uso comercial requiere autorizacion explicita de los autores.
- No se documentan sesgos especificos, pero al ser un modelo entrenado para robotica, su rendimiento puede degradarse en entornos muy diferentes a los de entrenamiento.
- Riesgo de alucinacion en la generacion de acciones si las instrucciones son ambiguas o las observaciones visuales son ruidosas, aunque no se reportan casos concretos.
- La falta de informacion sobre la arquitectura y los datos de entrenamiento dificulta la evaluacion independiente de sus limitaciones.
- El modelo esta orientado a tareas de manipulacion; no es adecuado para otras modalidades como generacion de texto o codigo.
- No se especifican requisitos de contexto ni limitaciones de idioma, por lo que el comportamiento multilingue es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/DravenALG/VLANeXt
- Paper arXiv: https://arxiv.org/abs/2602.18532 (version HTML: https://arxiv.org/html/2602.18532v3)
- Repositorio GitHub: https://github.com/DravenALG/VLANeXt
- Pagina del proyecto: https://dravenalg.github.io/VLANeXt
- Lista Awesome VLA: https://github.com/DravenALG/awesome-vla

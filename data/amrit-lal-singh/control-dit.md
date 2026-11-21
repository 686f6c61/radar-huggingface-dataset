# amrit-lal-singh/control.dit

## Resumen

Control.dit es un controlador basado en Diffusion Transformer (DiT) de aproximadamente 150 millones de parametros, publicado por el usuario amrit-lal-singh en Hugging Face bajo el pipeline de robotica. El modelo forma parte de un sistema denominado HVLA (probablemente Vision-Language-Action) y esta disenado para generar acciones relativas al efector final (EE-relative actions) en tareas de manipulacion robotica, tomando como entrada imagenes de muneca, texto de comando y representaciones de objetos y destinos.

El modelo combina multiples codificadores: C-RADIOv4 para las imagenes de muneca, SigLIP2 para el texto de comando, y slots dedicados para objeto y destino. La salida son acciones relativas al efector final, lo que lo situa en la categoria de los modelos de politica visomotora para robotica. Se distribuye en tres checkpoints: un modelo base entrenado hasta el paso 85.000, y dos fine-tunes posteriores (ft1 y ft2), siendo ft2 el modelo actual segun la model card.

La relevancia de este lanzamiento es limitada por su naturaleza: se trata de un repositorio con cero descargas y cero likes, licencia "other" sin especificar terminos, y sin documentacion publica mas alla de la model card. No obstante, para investigadores en robotica y aprendizaje por imitacion, representa un ejemplo de controlador DiT con arquitectura multimodal que puede servir como referencia o punto de partida, siempre que se aclaren los terminos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con codificadores multimodales (C-RADIOv4 para vision, SigLIP2 para texto) |
| Parametros totales | ~150M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | .pt (PyTorch, checkpoints EMA y raw con optimizador) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer de aproximadamente 150 millones de parametros que actua como controlador de politica. La entrada combina imagenes de muneca procesadas por C-RADIOv4, texto de comando procesado por SigLIP2, y slots dedicados para objeto y destino. La salida son acciones relativas al efector final (EE-relative actions), un esquema comun en control de robots manipuladores que facilita la generalizacion entre configuraciones.

El entrenamiento se estructura en tres fases segun los checkpoints publicados: un modelo base (`ctrl_85k`, run `ctrl_xl_ee_v2`) entrenado hasta el paso 85.000; un primer fine-tune (`ctrl_ft1`, run `ctrl_xl_ee_v2_ft1`) hasta el paso 73.333 partiendo de los pesos EMA del base; y un segundo fine-tune (`ctrl_ft2`, run `ctrl_xl_ee_v3_ft2`) hasta el paso 74.500 sobre el indice v3, que es el modelo actual. Se desconoce el volumen de datos de entrenamiento, la composicion del dataset, si hubo RLHF/DPO y cualquier innovacion tecnica adicional, ya que la model card no proporciona esos detalles.

## Capacidades

- Generacion de acciones relativas al efector final para control de robots manipuladores.
- Percepcion visual mediante imagenes de muneca (wrist images) codificadas con C-RADIOv4.
- Comprension de comandos en lenguaje natural mediante SigLIP2.
- Representacion de objetos y destinos mediante slots dedicados.
- Controlador de politica para tareas de manipulacion visomotora.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues explicitas ni modos especiales como thinking, vision general o audio.

## Casos de uso

- Manipulacion robotica guiada por lenguaje: el controlador recibe un comando textual y una imagen de muneca para generar acciones EE-relativas, adecuado para tareas de pick-and-place en entornos de laboratorio.
- Investigacion en aprendizaje por imitacion: sirve como politica de referencia para comparar variantes de Diffusion Transformer frente a politicas basadas en transformers autoregresivos.
- Fine-tuning sobre datasets propios: los checkpoints ft1 y ft2 demuestran un flujo de fine-tuning incremental que otros equipos pueden replicar con sus propios datos de robot.
- Evaluacion de codificadores multimodales: al combinar C-RADIOv4 y SigLIP2, permite estudiar el impacto de distintos backbones visuales y textuales en el control.
- Prototipado de sistemas HVLA: util como componente de controlador dentro de una arquitectura mayor de vision-lenguaje-accion.
- Benchmarking de esquemas de accion EE-relativas: permite comparar la eficacia de acciones relativas al efector final frente a acciones absolutas en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; para un modelo de ~150M parametros en precision FP32 se estiman en torno a 0,6 GB solo de pesos, mas el coste de los codificadores C-RADIOv4 y SigLIP2, que no se detalla.
- GPU recomendadas: no disponible; por tamano, cabria en GPUs consumer como RTX 3060, RTX 4070 o RTX 4090, pero no se confirma.
- Cabe en GPU consumer: probablemente si, dado el tamano del controlador, aunque los codificadores multimodales anadidos podrian incrementar los requisitos.
- Opciones de despliegue: no disponible; los pesos son `.pt` de PyTorch y no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a controladores roboticos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (controladores DiT para robotica) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia "other" sin terminos especificados: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Repositorio con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Documentacion minima: la model card remite a un repositorio externo (hvla) con archivos TODO.md y notas de cambios que no se incluyen en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado; al ser un controlador de acciones, el riesgo se traduce en acciones erroneas o inseguras en el robot.
- Idiomas soportados no especificados: el codificador SigLIP2 sugiere capacidad multilingue, pero no se confirma.
- Contexto no especificado: se desconoce la ventana de contexto del texto de comando.
- Pesos en formato `.pt` con checkpoints que incluyen optimizador (`keep_*.pt`), lo que incrementa el tamano del repositorio (8,9 GB) y requiere conversion para despliegue ligero.
- Sin garantias de seguridad fisica: cualquier uso en robot real debe acompanarse de capas de seguridad externas.

## Enlaces

- Hugging Face: https://huggingface.co/amrit-lal-singh/control.dit
- Repositorio hvla (referenciado en la model card): no disponible como URL directa en la informacion proporcionada; la model card menciona `docs/controller/TODO.md` y `docs/changes/2026-11-18_controller_finetune-ft2-index-v3.md`.
- Paper, blog, demo o repositorio adicional: no disponible.

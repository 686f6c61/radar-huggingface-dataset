# PrevonFounder/prevon-pulse

## Resumen

Prevon Pulse es un ajuste fino completo de FunctionGemma, el modelo de 270 millones de parametros de Google especializado en function calling. Lo desarrolla PrevonFounder para su aplicacion de notas Prevon: el modelo recibe una peticion en lenguaje natural y devuelve una accion de la aplicacion junto con sus argumentos, ejecutandose integramente en el dispositivo del usuario. Se distribuye tanto en pesos safetensors compatibles con Transformers como en formato LiteRT-LM (`.litertlm`), que es el artefacto que descarga la aplicacion en Android, iOS, macOS sobre Apple Silicon y Windows.

El modelo parte de `google/functiongemma-270m-it` y se ha entrenado mediante un fine-tune completo de todos los pesos sobre datos propios de Prevon. Con 268.098.176 parametros efectivos y un repositorio de 1,9 GB, esta pensado para inferencia local con requisitos de memoria muy bajos, no para conversacion general. Su relevancia actual reside en el patron de despliegue: un modelo pequeno, especializado y empaquetado para ejecucion on-device, que evita depender de la nube para tareas de seleccion de accion y relleno de argumentos.

La model card indica explicitamente que esta primera release ha sido superada por Prevon Pulse MK2 y MK4, y que se mantiene publicada solo porque compilaciones antiguas de la aplicacion siguen referenciandola. La licencia combina los terminos de Gemma con condiciones adicionales de Prevon que restringen el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Gemma 3, variante text; heredada de `google/functiongemma-270m-it`) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; se distribuye un artefacto LiteRT-LM (`.litertlm`) cuyo esquema interno de cuantizacion no se detalla |
| Idiomas soportados | no disponible en la informacion proporcionada (la model card no declara lista de idiomas) |
| Licencia | gemma-prevon-model-terms (Gemma Terms of Use + Prohibited Use Policy + terminos adicionales de Prevon) |
| Formato de pesos | safetensors (Transformers), LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

La arquitectura es la de FunctionGemma 270M, un transformer decoder-only de la familia Gemma 3 en su variante exclusivamente de texto (`gemma3_text`). No hay mezcla de expertos, attention lineal ni componentes de estado recurrente documentados: es un transformer denso de pequeno tamano optimizado para generar llamadas a funciones estructuradas en lugar de texto libre.

El entrenamiento consistio en un fine-tune completo de todos los pesos del modelo base sobre datos propios de Prevon. La model card no especifica volumen de tokens, composicion del dataset, uso de RLHF o DPO, ni hiperparametros. No se documentan innovaciones tecnicas adicionales mas alla del ajuste al formato de prompt propietario de la aplicacion Prevon y del empaquetado en LiteRT-LM para despliegue on-device.

## Capacidades

- Seleccion de accion: dado un enunciado del usuario, el modelo elige una accion de la aplicacion Prevon de entre las disponibles.
- Relleno de argumentos: genera los parametros asociados a la accion seleccionada siguiendo el formato de prompt propio de Prevon.
- Function calling estructurado: capacidad heredada del modelo base FunctionGemma, orientada a salidas con estructura de llamada a funcion.
- Inferencia on-device: el artefacto LiteRT-LM permite ejecucion local en Android, iOS, macOS sobre Apple Silicon y Windows.
- Conversacion limitada: la model card advierte que no es un modelo de chat general y que esta construido para el formato de prompt de la aplicacion Prevon.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de acciones dentro de la app Prevon: el modelo interpreta una frase del usuario ("crea una nota con etiqueta trabajo") y devuelve la accion y los argumentos que la aplicacion ejecuta, con latencia local y sin envio de datos a la nube.
- Procesamiento de lenguaje natural sin conexion: al ejecutarse via LiteRT-LM en el dispositivo, permite comandos por voz o texto en movil incluso sin conectividad, manteniendo la privacidade de las notas del usuario.
- Automatizacion de notas con etiquetas y recordatorios: el modelo puede mapear peticiones a acciones de creacion, etiquetado o programacion dentro de la app, reduciendo la interaccion manual a un unico turno.
- Integracion en compilaciones existentes de la aplicacion: dado que esta release se conserva por compatibilidad, sirve para mantener el comportamiento esperado en versiones antiguas de Prevon que referencian este checkpoint.
- Base para fine-tunes derivados: por su tamano (268 M parametros) y su formato safetensors, es util como punto de partida para experimentos de adaptacion a otros esquemas de acciones con recursos de GPU modestos.
- Evaluacion de pipelines de function calling on-device: permite medir latencia, consumo de memoria y tasas de acierto de seleccion de accion en entornos moviles reales, como paso previo a adoptar MK2 o MK4.
- Prototipado de interfaces comandadas por lenguaje natural: desarrolladores que construyan apps de notas o productividad pueden usar el modelo para validar un flujo de intencion-a-accion antes de entrenar su propio modelo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen releases posteriores (MK2 y MK4) con mejores puntuaciones, pero no proporciona cifras concretas para esta primera version ni para esas variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el numero de parametros (268 M), los pesos en precision completa ocuparian aproximadamente 0,5 GB en FP16/BF16 y en torno a 0,27 GB en INT8; estas cifras son estimaciones teoricas a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. El modelo esta disenado para ejecucion on-device mediante LiteRT-LM, no para servidores con A100 o H100.
- Cabe en GPU consumer: si, por tamano deberia caber con holgura en cualquier GPU consumer con al menos 1-2 GB de memoria libre, incluidas GTX/RTX de gama baja; no hay confirmacion oficial de compatibilidad.
- Opciones de despliegue: LiteRT-LM (Android, iOS, Apple Silicon Mac, Windows) es la via principal; los pesos safetensors permiten carga con Transformers y, en principio, conversion a otros runtimes, aunque el autor no documenta recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prevon Pulse | 268 M | no disponible | function calling para app Prevon, on-device | Gemma Terms + terminos Prevon (uso comercial restringido) | Hugging Face, LiteRT-LM |
| google/functiongemma-270m-it | 270 M (aprox., segun nombre) | no disponible | function calling general | Gemma Terms of Use | Hugging Face |
| Prevon Pulse MK2 | no disponible | no disponible | misma tarea, version posterior | no disponible en detalle | Hugging Face |
| Prevon Pulse MK4 | no disponible | no disponible | misma tarea, version posterior con mejores puntuaciones | no disponible en detalle | Hugging Face |

Los datos de contexto, rendimiento y licencia de MK2 y MK4 no estan detallados en la informacion proporcionada; solo se indica que obtienen mejores puntuaciones que esta primera release.

## Limitaciones y advertencias

- Modelo no generalista: esta construido para el formato de prompt de la aplicacion Prevon; no debe usarse como chatbot generico.
- Salidas potencialmente incorrectas: la model card advierte explicitamente que las salidas pueden ser erroneas y recomienda revisar cualquier accion antes de confiar en ella.
- Version superada: MK2 y MK4 existen y puntuan mejor; esta release se mantiene solo por compatibilidad con compilaciones antiguas de la aplicacion.
- Licencia restrictiva para uso comercial: los terminos de Prevon permiten uso gratuito a personas, escuelas, investigadores y entidades sin animo de lucro; empresas y cualquier uso con animo de lucro requieren permiso escrito de Prevon, los competidores nunca estan cubiertos y las modificaciones exigen renombrar el modelo.
- Terminos de Gemma aplicables en su totalidad, incluida la Prohibited Use Policy de Google.
- Idiomas y contexto no declarados: al no documentarse la lista de idiomas ni la ventana de contexto, no es posible garantizar cobertura multilingue ni conversaciones de contexto largo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion en argumentos: en tareas de relleno de parametros, el modelo puede generar valores plausibles pero incorrectos, por lo que la aplicacion deberia validar los argumentos antes de ejecutar la accion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrevonFounder/prevon-pulse
- Terminos del modelo Prevon: https://huggingface.co/PrevonFounder/prevon-pulse/blob/main/PREVON_MODEL_TERMS.md
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Prevon Pulse MK4: https://huggingface.co/PrevonFounder/prevon-pulse-mk4
- Prevon Pulse MK2: https://huggingface.co/PrevonFounder/prevon-pulse-mk2

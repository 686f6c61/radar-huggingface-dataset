# jenny08311/pi0.5-TgbWfarpxG8Q

## Resumen

π0.5 AXIS fine-tune es un modelo de tipo vision-language-action (VLA) orientado a robotica, publicado por el usuario jenny08311 en HuggingFace. Se trata de un ajuste fino del modelo base de la temporada `Fisher-Wang/pi05-axis-v0.2-all30-74p67` (commit 521a0741), construido sobre la arquitectura π0.5 / PaliGemma de Physical Intelligence. El modelo resuelve el problema de traducir observaciones visuales y estado articular del robot en comandos de accion motora, concretamente la prediccion de objetivos articulares absolutos de 9 grados de libertad (9D) a partir de una camara RGB (camera0) y el estado articular de 9D.

El ajuste se ha realizado con la configuracion `pi05_axis_joint` del framework openpi, con un horizonte de accion de 10 pasos. El modelo pertenece a la ronda 9 de un pipeline de "expert iteration" con balanceo de fotogramas, que combina anclas de autojuego de la politica, episodios de horizonte largo destilados por velocidad y demostraciones de un experto scripted para tareas de cajones, todo ello en un simulador AXIS local calibrado. El punto de control guardado corresponde a un checkpoint EMA en el paso 1000.

Es relevante en el contexto de la robotica open source porque forma parte del ecosistema abierto openpi y se orienta a una competicion concreta (SN80 competition 6, variante AXIS). Su interes practico es limitado: tiene cero descargas y cero "likes", el repositorio ocupa 49,8 GB y su licencia deriva de los terminos de Gemma y de la licencia de openpi, lo que restringe su uso comercial. No se dispone de especificaciones publicas de parametros, cuantizacion ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5 / PaliGemma |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (entrada multimodal: 1 camara RGB + estado articular 9D; horizonte de accion = 10) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a texto multilingue) |
| Licencia | gemma (Gemma Terms of Use) junto con la licencia de openpi; la model card declara `license: other` con `license_name: gemma` |
| Formato de pesos | no disponible (repositorio de 49,8 GB; el ecosistema openpi usa checkpoints JAX/safetensors, pero no se especifica en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo sigue la linea de π0.5, una arquitectura VLA construida sobre PaliGemma. La model card indica que las entradas son una imagen RGB (camera0) y un vector de estado articular de 9 dimensiones, y que la salida es un objetivo articular absoluto tambien de 9 dimensiones con un horizonte de accion de 10 pasos. Esto corresponde a la configuracion `pi05_axis_joint` del framework openpi. No se detalla el numero de parametros, la composicion exacta del dataset de preentrenamiento ni los datos concretos de la arquitectura interna (mecanismo de atencion, capas, etc.).

En cuanto al entrenamiento, se parte del modelo base `Fisher-Wang/pi05-axis-v0.2-all30-74p67` (commit 521a0741) y se aplica un proceso de "expert iteration" con balanceo de fotogramas en su ronda 9. El pipeline combina tres fuentes: anclas de autojuego de la politica (policy self-play anchors), episodios de horizonte largo destilados por velocidad (speed-distilled long-horizon episodes) y demostraciones de un experto scripted para tareas de cajones. Todo el entrenamiento se realiza en un simulador AXIS local calibrado. El checkpoint publicado es de tipo EMA en el paso 1000. No se indica el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplicable en el mismo sentido que en modelos de lenguaje).

## Capacidades

- Generacion de acciones roboticas: convierte imagen RGB y estado articular de 9D en objetivos articulares absolutos de 9D.
- Control de manipulacion con horizonte de accion de 10 pasos, adecuado para planificacion de movimiento a corto plazo.
- Ejecucion de tareas especificas de simulacion AXIS, en particular tareas de cajones entrenadas con demostraciones scripted.
- Aprendizaje por imitacion e "expert iteration": integra autojuego de la politica y datos destilados.
- Ajuste fino adicional posible desde el checkpoint base de la temporada.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso en el sentido linguistico: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: vision + accion (VLA) con estado articular; no se documentan modos de "thinking", audio ni otras modalidades.

## Casos de uso

- Manipulacion de cajones en simulacion: el modelo se entreno especificamente con demostraciones scripted para tareas de cajones en el simulador AXIS, por lo que es adecuado para reproducir apertura y cierre en ese entorno.
- Control de brazo robotico de 9 grados de libertad: predice objetivos articulares absolutos de 9D, lo que encaja con brazos de 6-7 DOF mas pinza y ejes adicionales.
- Investigacion en VLA y experimentos sim2real: sirve como punto de partida para estudiar transferencia de politicas visuales a acciones articulares.
- Participacion en competiciones de robotica: esta etiquetado como "SN80 competition 6", por lo que su uso previsto es como politica de competicion en ese escenario.
- Baseline para ajuste fino de tareas concretas: al derivar de un modelo base de temporada, puede reutilizarse como inicializacion para nuevas rondas de expert iteration.
- Generacion de datos sinteticos por autojuego: el pipeline descrito (policy self-play anchors, episodios destilados) permite generar trayectorias adicionales para entrenamiento.
- Evaluacion comparativa de checkpoints: el checkpoint EMA del paso 1000 permite medir el efecto del balanceo de fotogramas y de la destilacion de velocidad frente a versiones anteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 49,8 GB, lo que probablemente incluye pesos y checkpoints adicionales (por ejemplo, EMA), pero no se detalla el tamano efectivo del modelo en memoria.
- GPU recomendadas: no disponible. Al derivar de π0.5 / PaliGemma y usar openpi, el despliegue tipico se hace sobre GPU de datacenter o workstation, pero no se especifica en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema indicado es openpi (configuracion `pi05_axis_joint`). No se confirman otros runners como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de accion robotica).
- Latencia y throughput estimados: no disponible.
- Almacenamiento: se requiere al menos 49,8 GB de disco para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5-TgbWfarpxG8Q (este) | VLA (π0.5 / PaliGemma) | no disponible | horizonte de accion 10, entrada 1 camara + estado 9D | gemma + openpi | HuggingFace, 0 descargas |
| Fisher-Wang/pi05-axis-v0.2-all30-74p67 | VLA (modelo base de temporada) | no disponible | no disponible (se asume misma configuracion) | no disponible | HuggingFace (referenciado como base) |
| π0.5 / openpi (modelo original) | VLA general | no disponible | no disponible | openpi license + Gemma | Repositorio openpi |
| OpenVLA (categoria comparable) | VLA | no disponible | no disponible | no disponible | HuggingFace / repositorio publico |

No se dispone de datos verificados de parametros, contexto ni rendimiento para una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de control robotico, los sesgos se manifestarian como sesgo de simulador (sobreajuste a las condiciones del AXIS local) mas que como sesgos linguisticos.
- Riesgo de alucinacion: aplicable en forma de acciones incorrectas o no fisicas; el modelo puede generar objetivos articulares que no correspondan a una trayectoria valida.
- Limitaciones de contexto e idioma: no se documenta soporte de texto multilingue; la entrada esta limitada a una camara RGB y al estado articular, con un horizonte de accion de 10 pasos.
- Generalizacion limitada: el entrenamiento se realizo en un simulador AXIS local calibrado y en tareas concretas de cajones, por lo que la transferencia a entornos reales no esta garantizada ni documentada.
- Restricciones de licencia: los pesos derivan de π0.5 / PaliGemma y estan sujetos a los Gemma Terms of Use y a la licencia de openpi; es necesario revisar ambas antes de cualquier uso comercial.
- Caveats de produccion: no hay benchmarks, no se detallan parametros ni cuantizacion, el modelo tiene cero adopcion registrada y el checkpoint corresponde a un unico paso (1000) de un proceso de entrenamiento por rondas.
- Trazabilidad: el autor es un usuario individual, no un laboratorio, y la model card es muy breve; falta informacion sobre el dataset y el procedimiento de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jenny08311/pi0.5-TgbWfarpxG8Q
- Modelo base referenciado: Fisher-Wang/pi05-axis-v0.2-all30-74p67 (commit 521a0741)
- Framework openpi (Physical Intelligence): repositorio open source de openpi
- Terminos de uso de Gemma: condiciones de licencia de Google aplicables a los pesos derivados de PaliGemma
- Resultados de busqueda web: no se han encontrado enlaces relevantes (el unico resultado devuelto corresponde a un dominio inexistente)

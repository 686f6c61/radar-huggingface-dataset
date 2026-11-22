# iTheresaApocalypse/GameDojo-4B

## Resumen

GameDojo-4B es un modelo vision-lenguaje especializado en combates contra jefes finales (boss encounters) de videojuegos. Lo desarrolla el usuario iTheresaApocalypse y parte de un fine-tuning del modelo base Qwen/Qwen3.5-4B. Su funcion es recibir observaciones de pantalla junto con contexto de la tarea y emitir acciones de teclado y raton que se ejecutan a traves de la interfaz de computer-use (CUA) denominada GameDojo.

El modelo resuelve un problema concreto dentro del campo de los agentes de computer-use: la automatizacion de combates contra jefes en videojuegos, una tarea que exige perception visual en tiempo real y control motor preciso. Con 4.539.265.536 parametros (aproximadamente 4.500 millones) y un pipeline de image-text-to-text, se posiciona como un modelo de tamano medio que puede desplegase en hardware relativamente modesto para ser un VLM.

Es relevante por su enfoque vertical: en lugar de un agente generalista, se entrena con 240 horas de trayectorias de gameplay sobre 120 jefes distintos, con 40 minutos por jefe en cada uno de tres niveles de dificultad. El checkpoint se distribuye en BF16 Safetensors y es compatible con transformers mediante la clase Qwen3_5ForConditionalGeneration, lo que facilita su integracion en pipelines existentes. El modelo se creo el 21 de noviembre de 2026 y se actualizo al dia siguiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basada en Qwen3.5-4B; familia qwen3_5 |
| Parametros totales | 4.539.265.536 (aprox. 4.500 millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en BF16; no se documentan variantes GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune) |
| Tamano del repo | 9,1 GB |
| Dataset de entrenamiento | iTheresaApocalypse/GameDojo-Data |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer multimodal heredada de Qwen3.5-4B: un codificador visual acoplado a un modelo de lenguaje de aproximadamente 4.500 millones de parametros que procesa conjuntamente imagenes (observaciones de juego) y texto (contexto de la tarea) para producir acciones. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de fusion vision-lenguaje, ya que la model card no los documenta.

El entrenamiento consistio en un fine-tuning mediante aprendizaje supervisado (SFT) sobre 240 horas de trayectorias de gameplay procedentes del dataset GameDojo-Data. El subconjunto utilizado cubre 120 jefes, con 40 minutos de gameplay por jefe en cada uno de tres niveles de dificultad. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; la unica innovacion destacable es la interfaz CUA propietaria GameDojo para ejecutar las acciones generadas.

## Capacidades

- Generacion de acciones de teclado y raton a partir de observaciones visuales del juego y contexto de la tarea.
- Comprension de imagenes (image-text-to-text): interpreta frames de gameplay como entrada.
- Control de agente computer-use (CUA) orientado a combates contra jefes.
- Razonamiento multi-paso implicito dentro de la secuencia de combate (seleccion de acciones encadenadas).
- Adaptacion a tres niveles de dificultad por jefe, segun el dataset de entrenamiento.
- Integracion con transformers mediante AutoProcessor y Qwen3_5ForConditionalGeneration.
- Uso de plantilla de chat incluida (chat_template.jinja) para formatear entradas.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades multilingues: no disponibles.
- Capacidades de audio o modos de pensamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Automatizacion de combates contra jefes en videojuegos: el modelo recibe frames de pantalla y contexto del encuentro y emite la secuencia de teclas y movimientos de raton necesaria para superar al jefe, aprovechando las 240 horas de trayectorias de entrenamiento.
- Generacion de bots de asistencia al jugador: integrado en un asistente que sugiere o ejecuta acciones durante peleas dificiles, usando los tres niveles de dificultad aprendidos.
- Entrenamiento de agentes CUA en entornos de juego: sirve como modelo de referencia para investigar computer-use en dominios con feedback visual denso.
- Evaluacion de politicas de control motor: permite comparar estrategias de accion (teclado/raton) frente a baselines en los 120 jefes del dataset.
- Pruebas de regresion de videojuegos: un agente automatizado puede recorrer encuentros contra jefes para detectar bugs de colision, hitboxes o comportamiento de IA.
- Investigacion en vision-lenguaje aplicada a videojuegos: base para estudiar como los VLM interpretan estados de juego y planifican acciones a corto plazo.
- Prototipado de interfaces de accesibilidad: explorar la conversion de observaciones visuales en comandos de entrada para jugadores con movilidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para los pesos (4.539 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV, por lo que se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 sin cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriria cuantizacion, que no esta documentada.
- Opciones de despliegue: transformers con Qwen3_5ForConditionalGeneration (soporte oficial documentado); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameDojo-4B | 4.539 millones | no disponible | Agente CUA para combates de videojuegos | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4.500 millones | no disponible | VLM generalista | no disponible | Hugging Face |
| Alternativas de agentes CUA de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos directamente comparables en la categoria de agentes de computer-use para videojuegos.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente para combates contra jefes de videojuegos; su rendimiento fuera de ese dominio no esta documentado y probablemente sera limitado.
- Sesgos conocidos: no disponibles; al entrenarse sobre 120 jefes concretos, puede sobreajustarse a esos patrones y generalizar mal a jefes no vistos.
- Riesgo de alucinacion: no evaluado; en tareas de control motor, acciones erroneas pueden traducirse directamente en fallos de juego.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar al autor antes de desplegarlo en produccion.
- Dependencia de la interfaz CUA propietaria GameDojo para ejecutar las acciones, lo que limita la portabilidad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y validacion comunitaria inexistentes.
- No se documentan variantes cuantizadas ni soporte en motores de inferencia alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iTheresaApocalypse/GameDojo-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset GameDojo-Data: https://huggingface.co/datasets/iTheresaApocalypse/GameDojo-Data
- Repositorio del autor: https://huggingface.co/iTheresaApocalypse

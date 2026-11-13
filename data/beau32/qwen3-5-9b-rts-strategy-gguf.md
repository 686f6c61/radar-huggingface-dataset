# beau32/Qwen3.5-9B-RTS-Strategy-GGUF

## Resumen

Qwen3.5-9B-RTS-Strategy-GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-9B, publicado por el usuario beau32, orientado a la seleccion de operaciones en un juego de estrategia en tiempo real (RTS) denominado Iron Field. El modelo no actua como agente autonomo de extremo a extremo: recibe un conjunto de operaciones candidatas y elige entre ellas, mientras que el motor del juego se encarga de ejecutar la produccion, el movimiento y las tacticas. Se distribuye como un GGUF en cuantizacion Q8_0 con el adaptador LoRA fusionado en los pesos base.

El ajuste se realizo mediante LoRA sobre el checkpoint base de Qwen3.5-9B (revision c202236235762e1c871ad0ccb60c8ee5ba337b9a) y se ha publicado junto con el checkpoint LoRA original en el directorio `adapter-original` para fines de investigacion. El repositorio tiene un tamano de 9,8 GB y el modelo cuenta con 9.197.093.888 parametros. La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles.

La relevancia de esta publicacion es acotada: se trata de un experimento de nicho con un conjunto de entrenamiento muy pequeno (1.902 ejemplos) y una evaluacion preliminary de solo seis partidas. Resulta interesante como ejemplo de aplicacion de modelos de lenguaje a la toma de decisiones en entornos de estrategia, pero no constituye una referencia de rendimiento general ni un modelo listo para produccion fuera de su dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B), no se detalla la variante exacta |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); el LoRA original se distribuye en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0) y safetensors (checkpoint LoRA en `adapter-original`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9.197 millones de parametros, sobre el que se aplico un ajuste mediante LoRA. El adaptador resultante se fusiono en los pesos base para generar el GGUF Q8_0 publicado. La model card no detalla la arquitectura interna del modelo base (atencion, capas, cabezas, mecanismos de atencion lineal o decodificacion especulativa), por lo que esos datos deben consultarse en la ficha del modelo original.

El entrenamiento consistio en una sola epoca sobre 1.902 ejemplos: 1.900 escenarios sinteticos etiquetados mediante heuristicas y dos ejemplos inferidos de forma debil a partir de una partida humana. El autor advierte explicitamente de que las etiquetas no son decisiones optimas verificadas. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El checkpoint LoRA original conserva un esquema de nombres de capas que requirio una fusion personalizada en el modelo base; el autor indica que cambiar la ruta base configurada no garantiza compatibilidad con un cargador PEFT estandar, por lo que el flujo probado es el GGUF fusionado.

## Capacidades

- Seleccion de operaciones entre un conjunto de candidatas en el contexto del juego Iron Field, con la ejecucion delegada al motor del juego.
- Generacion de texto conversacional heredada del modelo base Qwen3.5-9B.
- Razonamiento sobre escenarios de estrategia en tiempo real dentro del dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que no es un agente de juego de extremo a extremo.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Seleccion de operaciones en partidas de Iron Field: el modelo recibe las operaciones candidatas y elige una, mientras el controlador local del juego ejecuta produccion, movimiento y tacticas. Es su caso de uso principal y el unico validado por el autor.
- Investigacion sobre aplicacion de LLM a juegos RTS: sirve como base para estudiar como un modelo de lenguaje puede integrarse en un bucle de decision con lookahead y un controlador externo, dado que el autor senala que el controlador local y el lookahead contribuyen sustancialmente a los resultados.
- Experimentacion con LoRA fusionados en GGUF: el repositorio incluye el checkpoint LoRA original y el GGUF fusionado, lo que permite comparar flujos de fusion y despliegue en Ollama.
- Prototipado de asistentes de estrategia en entornos simulados: util para validar pipelines de inferencia local con modelos de 9B en cuantizacion Q8_0 antes de escalar a dominios mas complejos.
- Evaluacion de tecnicas de etiquetado heuristico: el dataset sintetico permite estudiar el impacto de etiquetas generadas por heuristicas frente a datos humanos en tareas de decision secuencial.
- Docencia y demostraciones de ajuste fino: por su tamano moderado y su licencia Apache 2.0, puede emplearse en talleres sobre LoRA, cuantizacion GGUF y despliegue con Ollama.
- Base para futuros ajustes en otros dominios de estrategia: al derivar de Qwen3.5-9B, puede servir como punto de partida para adaptaciones a otros juegos o entornos de planificacion.

## Benchmarks y rendimiento

El autor reporta una evaluacion muy limitada: un enfrentamiento de seis partidas contra un modelo base Q4 de 9B, con resultado de 3-3 y victorias que variaban segun el mapa. El propio autor advierte de que la cuantizacion difiere entre los modelos comparados y de que se uso una sola semilla por mapa, por lo que el resultado no aísla el efecto del entrenamiento ni establece una fuerza general. La evaluacion sintetica mide la concordancia con etiquetas heuristicas relacionadas, no la probabilidad de victoria.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Enfrentamiento directo (6 partidas) | 3-3 frente a base Q4 9B | Cuantizacion distinta, una semilla por mapa |
| Concordancia con heuristicas | no disponible (sin cifras publicadas) | Mide acuerdo con etiquetas, no victoria |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q8_0 ocupa aproximadamente 9,8 GB, excluyendo la memoria del runtime. Para cargarlo completo en GPU se necesitan al menos unos 10-11 GB de VRAM, con margen adicional para el contexto y el runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten cargar el modelo completo en GPU con holgura; una RTX 3090 (24 GB) tambien seria suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en cuantizacion Q8_0; en tarjetas con menos VRAM seria necesario recurrir a cuantizaciones menores (no publicadas en el repositorio) o a la CPU.
- Opciones de despliegue: el autor documenta el flujo con Ollama (`ollama create qwen35-9b-rts -f Modelfile`). Al ser un GGUF, tambien es compatible con llama.cpp y otros runtimes que soporten este formato; vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-RTS-Strategy-GGUF | 9.197 M | no disponible | 3-3 en 6 partidas frente a base Q4 9B | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9.197 M | no disponible | Referencia del ajuste; sin benchmarks publicados en esta ficha | no disponible | Hugging Face |
| Alternativas de 9B para RTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos ajustados especificamente para juegos RTS con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- El modelo no es un agente de juego de extremo a extremo: solo selecciona entre operaciones candidatas y depende de un controlador local y de lookahead para obtener resultados.
- El conjunto de entrenamiento es muy reducido (1.902 ejemplos) y mayoritariamente sintetico; las etiquetas no son decisiones optimas verificadas.
- La evaluacion se limita a seis partidas con una sola semilla por mapa y cuantizaciones distintas entre modelos, por lo que no permite extraer conclusiones sobre fuerza general.
- Riesgo de alucinacion y de seleccion de operaciones suboptimas fuera de los escenarios de entrenamiento.
- Idioma limitado al ingles; no se declara soporte multilingue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que deben verificarse en su ficha original.
- El checkpoint LoRA original requiere una fusion personalizada y no se garantiza su compatibilidad con cargadores PEFT estandar.
- El dataset de entrenamiento es privado, lo que dificulta la reproduccion y auditoria del ajuste.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beau32/Qwen3.5-9B-RTS-Strategy-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/beau32/Iron-Field-RTS-Strategy-Training

# nokeepai/Inkling-2-Mini-Prime-LoRA

## Resumen

Inkling-2-Mini-Prime-LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por nokeep que se aplica sobre el modelo base thinkingmachines/Inkling-2-Mini, un modelo de razonamiento multimodal (texto e imagen) de pesos abiertos creado por Thinking Machines Lab. El adaptador no modifica la capacidad cognitiva del modelo, sino su comportamiento operativo: corrige la tendencia del modelo base a deliberar en exceso en tareas de multiples pasos sin llegar a actuar, un problema conocido como sobre-razonamiento (over-thinking).

El adaptador se entrena mediante aprendizaje por refuerzo sobre 1.185 prompts considerados inofensivos (depuracion de codigo 31%, matematicas 19%, escritura creativa 16%, preguntas generales 16%, roleplay 9%, chat 9%), recompensando al modelo por completar tareas correctamente sin gastar turnos de pensamiento innecesarios. El resultado, una vez fusionado con el modelo base, es Inkling-2-Mini-Prime, que mantiene la calidad del original pero reduce drasticamente el consumo de tokens y el tiempo de respuesta en tareas de depuracion y razonamiento cotidiano.

El repositorio contiene unicamente el adaptador (1,5 GB en safetensors) junto con el script de fusion que emplea redondeo estocastico para preservar los cambios al reconvertir los pesos a formatos de 4 y 8 bits. Esta pensado para usuarios que quieran aplicar la correccion a su propia copia del modelo base o verificar el trabajo publicado, no para uso directo en inferencia (para ello existen las versiones ya fusionadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal con mezcla de expertos (MoE) |
| Parametros totales | no disponible (adaptador de 1,5 GB; el modelo base no especifica cifra) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base almacena pesos en 4-bit y 8-bit; la fusion usa redondeo estocastico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se inyecta sobre thinkingmachines/Inkling-2-Mini, un modelo de razonamiento de pesos abiertos con arquitectura de mezcla de expertos (MoE) que procesa texto e imagenes. Antes de responder, el modelo genera un razonamiento privado (thinking) que no se muestra al usuario; el adaptador modifica este comportamiento para que el modelo deje de encadenar turnos de deliberacion sin producir acciones concretas.

El entrenamiento se realizo mediante aprendizaje por refuerzo: el modelo intentaba tareas y recibia recompensa por completarlas correctamente sin pensamiento desperdiciado. Para preservar la longitud y la calidad de las respuestas, cada paso de entrenamiento incluyo tambien algunas de las mejores respuestas generadas por el modelo original. La innovacion tecnica clave esta en el script de fusion: dado que el modelo base almacena la mayor parte de sus pesos en 4 y 8 bits, aplicar el adaptador con redondeo convencional destruiria la mayor parte del cambio; por ello se emplea redondeo estocastico, que redondea cada peso hacia arriba o hacia abajo de forma aleatoria y proporcional a su proximidad, de modo que el cambio sobrevive en promedio. El adaptador se entreno originalmente para el modelo sin censura Unbound, y posteriormente se aplico tambien al modelo original para producir Prime.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento (thinking) previo a la respuesta.
- Procesamiento de imagenes ademas de texto (modelo base multimodal).
- Depuracion de codigo iterativa: propone correcciones, observa la salida de tests y repite hasta un maximo de 12 turnos.
- Reduccion del pensamiento superfluo: en tareas de depuracion pasa de un 86,2% de turnos sin escribir codigo a un 0,0%.
- Reduccion del consumo de tokens: de 23.920 a 2.766 tokens por tarea de depuracion; mediana de pensamiento por prompt cotidiano de 318 a 174 tokens.
- No altera la capacidad bruta del modelo: en benchmarks publicos de codigo, matematicas y conocimiento el modelo fusionado queda a menos de 2 puntos del original, sin reclamar mejora de precision.
- No incrementa la disposicion a responder solicitudes sensibles (willingness 64,5% original frente a 65,3% con el adaptador).

## Casos de uso

- Depuracion automatizada de codigo: el modelo fusionado resuelve tareas con multiples bugs interactivos en pocos turnos y escribiendo codigo en cada iteracion, lo que lo hace adecuado para pipelines de CI que necesiten corregir fallos a partir de la salida de tests.
- Agentes de codigo con limite de turnos: al eliminar los turnos de solo pensamiento, encaja en entornos donde cada paso consume presupuesto o tiempo y donde el sobre-razonamiento provoca fallos por agotamiento de iteraciones.
- Asistentes interactivos de baja latencia: la reduccion de 119,9 s a 49,0 s por respuesta cotidiana lo hace viable para interfaces conversacionales donde el tiempo de espera es critico.
- Razonamiento sobre documentos e imagenes: al heredar la multimodalidad del modelo base, puede analizar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Despliegue en hardware limitado: la version GGUF del modelo fusionado permite ejecucion local en llama.cpp, LM Studio u Ollama, con pesos en 4 y 8 bits.
- Reproducibilidad y auditoria de modelos: el repositorio permite reconstruir el modelo publicado byte a byte y comparar, util para equipos que necesiten verificar adaptaciones sobre modelos de terceros.
- Investigacion sobre eficiencia de razonamiento: sirve como referencia para estudiar como el RL puede reducir el pensamiento superfluo sin degradar la precision en benchmarks.

## Benchmarks y rendimiento

Datos publicados por el autor comparando el modelo original con el fusionado (Inkling-2-Mini-Prime), con los mismos ajustes para ambos:

| Metrica | Original | Con el adaptador |
|---|---|---|
| Tareas de depuracion dificiles resueltas (15 tareas) | 80,0% [54,8; 93,0] | 100,0% [79,6; 100,0] |
| Turnos de depuracion sin escribir codigo | 86,2% | 0,0% |
| Tokens por tarea de depuracion | 23.920 | 2.766 |
| Pensamiento por prompt cotidiano (mediana de tokens) | 318 | 174 |
| Solicitudes sensibles: dispuesto a responder | 64,5% [61,6; 67,2] | 65,3% [62,4; 68,0] |
| Solicitudes sensibles: delivery score | 35,9% [34,0; 37,7] | 34,6% [32,8; 36,4] |
| Tiempo por respuesta cotidiana | 119,9 s | 49,0 s |

Costes declarados: en solicitudes sensibles el delivery score cae 1,3 puntos [-2,1; -0,4] (cambio pareado, intervalo completamente por debajo de cero); en MBPP se observa una posible caida de 1,2 puntos [-2,5; +0,1] en 3 ejecuciones con semillas distintas, no confirmada. En benchmarks publicos de codigo, matematicas y conocimiento el modelo fusionado queda a menos de 2 puntos del original, sin ganancia de precision reclamada.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (1,5 GB); los requisitos de inferencia corresponden al modelo base fusionado, cuyas cifras de parametros no se detallan en la informacion disponible.
- VRAM estimada: no disponible (depende del tamano del modelo base y de la cuantizacion a 4 u 8 bits).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue en GPU de servidor: version fusionada nokeepai/Inkling-2-Mini-Prime.
- Despliegue local en consumer: version GGUF nokeepai/Inkling-2-Mini-Prime-GGUF, compatible con llama.cpp, LM Studio y Ollama.
- Aplicacion manual del adaptador: requiere descargar el modelo base (revision ed40e7da625f594fc9c4990f5f66be24873c22d7) y ejecutar el script de fusion con redondeo estocastico.
- Latencia y throughput: el autor reporta 49,0 s por respuesta cotidiana con el adaptador frente a 119,9 s sin el; no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Inkling-2-Mini-Prime-LoRA | Adaptador LoRA sobre MoE multimodal | no disponible (adaptador 1,5 GB) | no disponible | Apache 2.0 | Publicado 2026-11-27 |
| Inkling-2-Mini (base) | MoE multimodal con thinking | no disponible | no disponible | no disponible | Modelo original de Thinking Machines Lab |
| Inkling-2-Mini-Prime | Modelo fusionado con el adaptador | no disponible | no disponible | Apache 2.0 | Version lista para GPU |
| Inkling-2-Mini-Unbound v3 | Modelo sin censura con el adaptador | no disponible | no disponible | no disponible | Variante sin censura |

No se dispone de datos de parametros, contexto ni rendimiento de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No mejora la inteligencia del modelo: en benchmarks publicos de codigo, matematicas y conocimiento el rendimiento queda a menos de 2 puntos del original, sin ganancia de precision.
- No incrementa la disposicion a responder solicitudes sensibles; el adaptador se entreno solo con prompts inofensivos.
- Pequena perdida de calidad en respuestas a solicitudes sensibles: delivery score -1,3 puntos con intervalo de confianza completamente negativo.
- Posible caida en MBPP de -1,2 puntos, no confirmada (intervalo cruza cero).
- El adaptador no es de uso directo: requiere fusion con el modelo base o descargar una version ya fusionada.
- La fusion exige redondeo estocastico; un redondeo convencional a 4 u 8 bits descartaria la mayor parte del cambio.
- Sesgos conocidos del modelo base: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta; se trata de una publicacion muy reciente y poco validada por la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Version fusionada para GPU: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime
- Version fusionada GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime-GGUF
- Version sin censura con el adaptador: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

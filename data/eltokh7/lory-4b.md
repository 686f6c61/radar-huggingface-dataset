# eltokh7/lory-4b

## Resumen

Lory-4B v1 es un adaptador LoRA con cabeza de puntero (pointer head) sobre el modelo base Kev-4B, que a su vez se construye sobre Qwen3.5-4B-Base. Lo desarrolla eltokh7 y su proposito es actuar como modelo de decision para simular encuestados en estudios de economia y ciencias sociales: recibe preguntas con apuestas explicitas (precios, probabilidades, pagos, retrasos) y devuelve en un unico forward pass una probabilidad calibrada para cada opcion disponible. Esta disenado para integrarse en flujos EDSL (Expected Parrot) de simulacion de encuestas.

El modelo se presenta como la version economica de la familia Lory v1, con una variante superior de 27B parametros (Lory-27B). La version 4B es una vista previa publica entrenada con una sola semilla, lo que la hace adecuada para experimentacion y prototipado, pero no para sustituir al modelo de 27B cuando el razonamiento economico es critico. El repositorio ocupa 0,2 GB, coherente con un adaptador PEFT mas los pesos del cabezal, no con un modelo completo de 4B.

La relevancia actual radica en su enfoque: en lugar de generar texto libre, el modelo produce probabilidades calibradas por opcion, lo que reduce el coste de simular miles de encuestados y permite analisis contrafactuales sobre sensibilidad a precios, aversion al riesgo y dominancia de opciones. La licencia Apache-2.0 facilita su uso comercial y su integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de puntero para clasificacion de opciones |
| Parametros totales | 4B en el backbone; el adaptador LoRA no se especifica en numero de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el backbone admite las cuantizaciones de Qwen3.5-4B-Base) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Kev-4B (Qwen3.5-4B-Base) y anade un adaptador LoRA junto con una cabeza de puntero que mapea las representaciones del backbone a una distribucion de probabilidad sobre las opciones de la pregunta. La inferencia se realiza mediante `kev.serve` (System One API), que expone el modelo como servicio y devuelve las probabilidades por opcion en un solo paso. El adaptador se entrena como delta LoRA sobre el adaptador ya publicado de Kev, no desde cero.

El entrenamiento utiliza los mismos 27.000 registros y la misma receta que Lory-27B, mas 5.000 ejemplos de replay de Kev decision-v7, con una epoca, learning rate 2e-5, batch de 8 y precision bf16, sobre una unica A100 durante aproximadamente 1,8 horas. No se documenta en la informacion disponible el uso de RLHF o DPO; el ajuste es supervisado sobre datos de encuestas EDSL y contrastes de decision. La innovacion principal es la formulacion como clasificacion calibrada por opcion en lugar de generacion autoregresiva, lo que elimina variabilidad de muestreo y permite obtener probabilidades directamente comparables entre encuestados simulados.

## Capacidades

- Clasificacion de decisiones con probabilidad calibrada por opcion en un unico forward pass.
- Simulacion de encuestados con perfiles socioeconomicos (por ejemplo, profesor con 52.000 USD de ingresos frente a cirujano con 480.000 USD).
- Sensibilidad a precios, probabilidades, pagos y retrasos en las opciones presentadas.
- Deteccion de opciones dominadas (planes peores al mismo precio) con probabilidades muy bajas (0,02-0,03 en los ejemplos de la model card).
- Integracion con EDSL mediante `edsl_decision.py` para encuestas y experimentos de economia del comportamiento.
- Despliegue como servicio mediante `kev.serve` con API System One.
- No se documentan capacidades de generacion de texto libre, tool calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Simulacion de encuestas de demanda: el modelo permite estimar la probabilidad de compra o suscripcion de perfiles sinteticos ante distintos niveles de precio, sustituyendo paneles costosos en fases exploratorias. Su calibracion por opcion facilita agregar resultados sobre miles de encuestados.
- Analisis de sensibilidad a precios: introduciendo variaciones de precio en las opciones, se obtienen curvas de elasticidad por segmento socioeconomico, util para equipos de pricing que necesitan senales rapidas antes de un estudio de campo.
- Experimentos de aversion al riesgo: la bateria de loterias de la model card (pendiente 0,51 frente a teoria 1,0) indica que el modelo captura parte de la curvatura de utilidad esperada, lo que permite testear hipotesis de teoria de juegos y decision bajo incertidumbre.
- Investigacion en economia del comportamiento: el modelo reproduce sesgos como la eleccion de planes dominados con baja probabilidad, lo que lo hace util para generar contrafactuales en estudios academicos con EDSL.
- Evaluacion de framing: con una invariancia de framing de 56/100, sirve para explorar como cambian las respuestas ante reformulaciones, aunque con cautela por esa limitacion.
- Prototipado de asistentes de decision: dado que devuelve probabilidades calibradas, puede integrarse como componente en sistemas que necesitan puntuar opciones (por ejemplo, recomendadores con restricciones economicas) antes de pasar a un modelo mayor.
- Pruebas de regresion de pipelines de simulacion: al ser la version economica de la familia, permite validar flujos EDSL a bajo coste (menos de 0,25 USD por 1.000 encuestados x 20 preguntas) antes de escalar a Lory-27B.

## Benchmarks y rendimiento

| Benchmark | Lory-4B v1 | Kev-4B (publicado) | Lory-27B v1 | Perplexity Decider v1.2 |
|---|---|---|---|---|
| DLS v0.2 (9 familias) | 79 [73, 86] | 53 | 88 | 77 |
| Blind test (513 contrastes) | 81 [78, 84] | 67 | 92 | 93 |
| Bank-run battery: payoff shift (teoria 80) | 28 | -1 | 66 | 9 |
| Lottery slope (teoria 1,0) | 0,51 | 0,05 | 0,77 | 0,43 |
| EDSL-General | 85 | 85 | 88 | 88 |

Las ganancias frente a Kev-4B publicado son de +25,5 en DLS (IC [+17,9, +32,9]) y +14,0 en blind test (IC [+10,4, +17,5]). Frente a Perplexity Decider v1.2, empata en DLS (+1,6, IC [-5,2, +8,2]) pero queda por detras en blind test (-12,7, IC [-15,5, -10,1]). La senal de persona en blind test es de 69 frente a 72 antes del entrenamiento, y la invariancia de framing es de 56/100. La model card no detalla la composicion exacta de los benchmarks mas alla de las descripciones remitidas a la tarjeta de Lory-27B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el backbone es de 4B parametros, por lo que en bf16 requiere aproximadamente 8-10 GB para pesos, mas overhead del adaptador y del servidor. En cuantizacion de 4 bits cabria en GPUs consumer de 8 GB, aunque no se documenta soporte de cuantizacion para este adaptador.
- GPU recomendadas: A100 para el escenario de referencia (al menos 53 peticiones/s con cliente limitante). Tambien soporta `--device mps` en Apple Silicon segun la model card.
- Cabe en GPU consumer: previsiblemente si en RTX 3090/4090 y GPUs de 16 GB o mas en bf16; en 8 GB solo con cuantizacion del backbone, no documentada.
- Opciones de despliegue: `kev.serve` (System One API) con el comando `uv run python -m kev.serve --run eltokh7/lory-4b --device cuda --port 8850`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: al menos 53 peticiones/s en una A100 con cliente limitante; coste estimado inferior a 0,25 USD por 1.000 encuestados x 20 preguntas.
- Entrenamiento: una A100, aproximadamente 1,8 horas para el adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DLS v0.2 | Blind test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lory-4B v1 | 4B (backbone) + LoRA | No disponible | 79 | 81 | Apache-2.0 | HuggingFace (preview) |
| Lory-27B v1 | 27B | No disponible | 88 | 92 | No disponible en la informacion | HuggingFace |
| Kev-4B | 4B | No disponible | 53 | 67 | Apache-2.0 | HuggingFace |
| Perplexity Decider v1.2 | No disponible | No disponible | 77 | 93 | No disponible | No disponible en la informacion |

Lory-4B se posiciona como la opcion de bajo coste de la familia Lory: supera con claridad a Kev-4B en logica economica, pero queda por detras de Lory-27B en todas las metricas y de Decider en el blind test. La comparativa con Decider es la mas relevante: empate estadistico en DLS pero derrota clara en el test ciego, lo que sugiere que Decider generaliza mejor a formulaciones no vistas.

## Limitaciones y advertencias

- Vista previa publica entrenada con una sola semilla; la varianza entre semillas no esta caracterizada, lo que limita la confianza en los intervalos reportados.
- Peor generalizacion a formulaciones no familiares que Lory-27B: en la bateria de bank-run, el payoff shift es 28 frente a 66 del 27B.
- Senal de persona ligeramente mas debil que antes del entrenamiento en blind test (69 frente a 72).
- Invariancia de framing de 56/100, lo que implica sensibilidad relevante a la redaccion de la pregunta.
- No se documentan sesgos demograficos especificos ni evaluaciones de equidad; los perfiles sinteticos pueden amplificar supuestos de la receta de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de calibracion erronea: las probabilidades pueden ser sobreconfiadas en dominios alejados de los datos de entrenamiento.
- Idiomas soportados no documentados; el entrenamiento se describe sobre encuestas EDSL en ingles, por lo que el uso en castellano no esta validado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B-Base y Kev-4B tienen sus propias condiciones que deben verificarse.
- Requiere el runtime `kev.serve` en una revision concreta del repositorio (`2074cc4`); no hay integracion documentada con servidores de inferencia estandar.
- No apta como sustituto de estudios de campo: es una herramienta de simulacion con sesgos sistematicos conocidos (por ejemplo, la eleccion de planes dominados no es cero).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eltokh7/lory-4b
- Modelo base Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Modelo hermano Lory-27B: https://huggingface.co/eltokh7/lory-27b
- Repositorio de Kev (runtime de servicio): https://github.com/jaredpalmer/kev
- Script de encuestas EDSL: `edsl_decision.py` (incluido en el repositorio del modelo)
- Backbone Qwen3.5-4B-Base: no se proporciona enlace directo en la informacion disponible

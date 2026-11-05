# poplolioi11/deep-rl-unit7-soccer-20261105

## Resumen

`deep-rl-unit7-soccer-20261105` es una política de inferencia entrenada con aprendizaje por refuerzo para el entorno oficial SoccerTwos de Unity ML-Agents. Lo publica Chen-Yu Chu bajo la cuenta `poplolioi11` como artefacto del ejercicio practico de la Unidad 7 del curso de deep reinforcement learning de Hugging Face. El modelo no es un LLM: es un fichero ONNX que mapea observaciones del entorno SoccerTwos a acciones de los agentes, pensado para ser cargado por el `Behavior` correspondiente dentro de Unity.

El entrenamiento se realizo desde cero con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment), un metodo de credit assignment multiagente con self-play. Se completaron 501.148 pasos reales de entrenamiento de agente frente a una etapa declarada de 500.000 pasos; el curso recomienda 5.000.000, presupuesto que el autor no reclama haber alcanzado. El paquete incluye unicamente los pesos de inferencia, datos de evaluacion y configuracion minima, sin checkpoints de PyTorch ni receta de entrenamiento.

La relevancia es acotada: sirve como referencia reproducible de un pipeline completo de RL multiagente (entrenamiento, congelado, evaluacion con semillas fijas y empaquetado ONNX) para quien siga el curso o quiera inspeccionar las firmas de entrada/salida de una politica MA-POCA funcional. No es un modelo de proposito general ni un benchmark de habilidad futbolistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para ML-Agents (MA-POCA, self-play); topologia exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`SoccerTwos.onnx`) |

## Arquitectura y entrenamiento

La politica se entrena con MA-POCA, el algoritmo de Unity ML-Agents disenado para credit assignment en entornos cooperativos y competitivos con multiples agentes. El autor declara explicitamente el uso de un critico con atencion multiagente y de un contador PT privado, y confirma que no se cargo ninguna politica preentrenada de terceros: el run partio desde cero. El entorno es el SoccerTwos oficial, con dos equipos de dos agentes cada uno.

El entrenamiento acumulo 501.148 pasos reales de agente frente a la etapa declarada de 500.000 pasos. La evaluacion se realizo con la politica final congelada controlando ambos equipos sobre las semillas fijas 50000–50009, registrando 160 episodios terminales de agente. La metrica primaria es el retorno de grupo bruto por episodio (`accumulated_group_reward`), sin normalizar. El autor advierte que los agentes, ambos equipos y los episodios repetidos dentro de cada semilla son dependientes, por lo que existen diez clusters semilla/runtime y no 160 ensayos independientes. La desviacion estandar poblacional es descriptiva y no constituye un intervalo de confianza.

## Capacidades

- Control de politica en el entorno SoccerTwos de Unity ML-Agents: mapea observaciones del entorno a acciones de agente.
- Juego multiagente 2v2 en self-play: la misma politica puede controlar ambos equipos simultaneamente.
- Inferencia via ONNX Runtime dentro de Unity, con firmas de entrada/salida documentadas en `config.json`.
- Compatibilidad con el layout oficial de observacion/accion de SoccerTwos.
- No soporta tool calling, function calling, agentes LLM, razonamiento multi-paso simbolico, vision general, audio ni capacidades multilingues.

## Casos de uso

- Reproduccion del ejercicio de la Unidad 7 del curso de deep RL de Hugging Face: cargar el ONNX en el `Behavior` de SoccerTwos y verificar que la politica se comporta como se describe en la model card.
- Inspeccion de firmas ONNX: usar `config.json` para revisar las dimensiones de observacion y accion esperadas por el entorno antes de integrar la politica en un proyecto propio.
- Baseline de comparacion en self-play: servir como punto de partida concreto (501.148 pasos) frente a runs propios mas largos, para medir el efecto del presupuesto de entrenamiento.
- Docencia de credit assignment multiagente: ilustrar como MA-POCA distribuye recompensa de grupo entre agentes en un entorno cooperativo-competitivo.
- Validacion de pipelines de evaluacion: reutilizar el esquema de semillas fijas y episodios terminales para disenar evaluaciones reproducibles de otras politicas.
- Pruebas de integracion de ML-Agents con ONNX: verificar el flujo de exportacion e inferencia en builds de Unity sin depender de PyTorch en runtime.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Tarea | Dataset | Valor |
|---|---|---|---|
| mean_reward | Reinforcement Learning | ML-Agents-SoccerTwos | -0.0903049998 +/- 0.7199755927 |

Desglose adicional declarado en la model card:

| Metrica descriptiva primaria | Valor |
|---|---|
| Retorno de grupo bruto medio por episodio terminal de agente | -0.0903049998 |
| Desviacion estandar poblacional (ddof=0) | 0.7199755927 |
| Media menos desviacion estandar | -0.8102805925 |

El autor indica que la seleccion de checkpoint no uso resultados de holdout y que la metrica se definio antes de la evaluacion, ampliando solo el limite de ejecucion a 100.000 ticks de Unity por semilla. No se declara win rate, ELO ni recuento de partidas independientes porque los registros brutos carecen de identificadores de partida.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es una politica de RL de ML-Agents, no un LLM, y el tamano del fichero ONNX no se publica (el repo ocupa 0.0 GB segun HuggingFace).
- GPU recomendadas: no aplica para inferencia en Unity, que ejecuta el ONNX en CPU o en el backend que soporte el runtime de ML-Agents; para reentrenar desde cero se requeriria una GPU compatible con PyTorch y ML-Agents (no especificada).
- Cabe en cualquier consumer GPU e incluso en CPU para inferencia, dado el caracter ligero tipico de las politicas de ML-Agents.
- Opciones de despliegue: Unity ML-Agents con ONNX Runtime; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Presupuesto de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deep-rl-unit7-soccer-20261105 | Politica MA-POCA (ONNX) | SoccerTwos | 501.148 pasos de agente | MIT | HuggingFace |
| Politicas de referencia del curso HF Unit 7 | Politica entrenada por el alumno | SoccerTwos | Variable (recomendado 5.000.000) | segun alumno | No distribuidas oficialmente |
| Ejemplos oficiales de Unity ML-Agents | Politicas de ejemplo | Varios entornos ML-Agents | No disponible | Apache 2.0 (ML-Agents) | GitHub de Unity |

No se dispone de una comparativa numerica con otras politicas SoccerTwos porque no hay benchmarks publicados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El retorno medio de grupo es ligeramente negativo (-0.0903) con una desviacion estandar de 0.72, lo que indica una politica debil y de alta varianza; el autor no reclama habilidad futbolistica.
- El entrenamiento (501.148 pasos) esta muy por debajo de los 5.000.000 recomendados por el curso, por lo que la politica probablemente esta infraentrenada.
- Los 160 episodios no son independientes: hay diez clusters semilla/runtime y los agentes y equipos estan correlacionados. La desviacion estandar es descriptiva, no un intervalo de confianza.
- No se declara win rate, ELO ni recuento de partidas porque los registros brutos carecen de identificadores de partida.
- La evaluacion se hizo con la misma politica controlando ambos equipos, no contra oponentes externos.
- La seleccion de checkpoint no uso holdout; no hay validacion cruzada.
- No se incluyen checkpoints de PyTorch, receta de entrenamiento completa, binarios de jugador ni logs, lo que limita la reproducibilidad del entrenamiento.
- El autor declara uso de asistencia de IA en implementacion, orquestacion, evaluacion y empaquetado, y no reclama autoria ni pericia humana sin asistencia.
- Licencia MIT solo cubre los pesos, datos de evaluacion, configuracion y documentacion incluidos; Unity, ML-Agents, PyTorch y assets del entorno no se redistribuyen ni se relicencian.
- No apto para uso en produccion como sistema de lenguaje, vision, agentes LLM ni atencion al cliente: es exclusivamente una politica de control para SoccerTwos.

## Enlaces

- HuggingFace: https://huggingface.co/poplolioi11/deep-rl-unit7-soccer-20261105
- Ejercicio oficial Unidad 7 del curso: https://huggingface.co/learn/deep-rl-course/unit7/hands-on
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents

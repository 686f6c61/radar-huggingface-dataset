# jrubiosainz/microduck-game-hillclimber

## Resumen

Microduck game hill climber es una política de control para robótica entrenada por refuerzo, publicada por el usuario jrubiosainz como un fine-tune de pollen-robotics/microduck-sprint-2m-reference. Resuelve una tarea muy concreta y acotada: recorrer en el menor tiempo posible una pista de ascenso (hill climb) de 1,5 metros dentro del simulador de la Microduck Arena. No es un modelo de lenguaje ni un sistema multimodal: es una red neuronal pequeña que mapea 61 entradas de observación a 14 salidas de control articular, ejecutable como un archivo ONNX.

El modelo se entrenó íntegramente en CPU dentro del propio simulador de la Arena, con física MuJoCo 3.10.0, combinando un pipeline largo de PPO (más de 12.000 iteraciones repartidas en varias fases) con evoluciones posteriores mediante estrategias evolutivas (ES) y una búsqueda CMA-ES de una acción de zambullida en la línea de meta. El resultado reportado es de 0,876 s de tiempo medio en los seeds oficiales de la competición y 94 finalizaciones de 200 intentos en seeds nunca vistos (1001-1200).

Es relevante ahora por su carácter de artefacto de reproducibilidad dentro del ecosistema Microduck: documenta con extremo detalle la cadena de entrenamiento, los hiperparámetros de PPO, los objetivos de las estrategias evolutivas y las decisiones de selección de pesos, lo que lo convierte en una referencia útil para investigadores de locomoción en simulación que quieran reproducir o comparar metodologías híbridas PPO + ES.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con activacion ELU, topologia 61 → 512 → 256 → 128 → 14 |
| Parametros totales | Aproximadamente 197.000 (calculado a partir de las dimensiones de las capas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (politica de control paso a paso, sin ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (policy.onnx) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa de cuatro capas (61 entradas, tres capas ocultas de 512, 256 y 128 neuronas, y 14 salidas) con activacion ELU. El normalizador de entrada se mantiene congelado respecto al modelo de referencia. La salida de 14 dimensiones corresponde a consignas articulares del robot Microduck. El modelo mantiene internamente una consigna de avance de 0,55 m/s e ignora cualquier comando externo, por lo que solo opera en simulacion.

El entrenamiento combino PPO con estrategias evolutivas en una cadena documentada con gran detalle. La fase de PPO arranca de la referencia sprint-2m con 375 iteraciones, pasa por 3.075 iteraciones adicionales en la pista de hill climb 1m5 (repartidas en varias ramas con reinicios de critico), vuelve a sprint-2m durante 350 iteraciones y continua con 7.525 iteraciones mas en hill-climb-1m5, algunas de ellas con reinicio tras un reinicio de maquina, un objetivo KL rebajado de 0,02 a 0,01 y un suelo de learning rate de 1e-6. La funcion de recompensa premia el progreso hacia delante mientras corre el cronometro de carrera y penaliza levemente la velocidad lateral, la velocidad de guinada, la deriva hacia las paredes y las caidas; en varias fases el episodio termina al cruzar la meta con una bonificacion equivalente a correr a 1,5 m/s durante los pasos restantes del horizonte de 2,5 s. La fase evolutiva añade 1.540 generaciones de ES sobre el tiempo de carrera en los seeds oficiales 1-5, seguidas de 204 generaciones de ES elitista, y despues una zambullida en meta parametrizada por un contador de pasos y ajustada con CMA-ES. Finalmente se aplicaron perturbaciones aleatorias de pesos bajo esa zambullida congelada, seleccionando la elite `elite_g00000_151227036_m` por su tiempo de 0,876 s en los seeds oficiales.

## Capacidades

- Control locomotor de un robot cuadrupedo Microduck en simulacion, orientado a la tarea de ascenso de una pista de 1,5 m.
- Generacion de consignas articulares de 14 dimensiones a partir de 61 observaciones, con paso de control fijo.
- Ejecucion de una politica de carrera entrenada especificamente para velocidad en llano y en pendiente dentro del simulador MuJoCo de la Arena.
- Zambullida final en la linea de meta controlada por un contador de pasos y parametros ajustados por CMA-ES.
- Inferencia en ONNX apta para CPU.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, multi-step reasoning ni planificacion simbolica.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje.
- No dispone de vision, audio ni ninguna otra modalidad sensorial declarada mas alla de las 61 entradas de observacion.
- Ignora comandos externos de velocidad o direccion: la consigna de avance interna es fija (0,55 m/s).

## Casos de uso

- Evaluacion comparativa de metodologias de RL: sirve como punto de referencia reproducible en tareas de locomocion de ascenso, ya que la model card detalla la cadena exacta de PPO, ES y CMA-ES y permite replicar o comparar variantes bajo los mismos seeds oficiales 1-5.
- Investigacion en entrenamiento hibrido PPO mas estrategias evolutivas: el artefacto documenta hiperparametros concretos (sigma de 0,01 por RMS de capa, Adam con lr 0,003, esquema antitetico de 96 perturbaciones) que se pueden estudiar o reutilizar en otros dominios de control.
- Docencia y divulgacion de refuerzo en simulacion: al ejecutarse en CPU y en un simulador ligero (MuJoCo 3.10.0, runner version 4), es adecuado para demostraciones practicas de politicas de control sin necesidad de GPU.
- Participacion y benchmarking en la Microduck Arena: el modelo esta pensado como entrada para la prueba de Hill Climb de 1,5 m, de modo que se puede enfrentar contra otras politicas en el mismo entorno y con los mismos seeds.
- Estudio de robustez ante condiciones no vistas: los resultados en seeds 1001-1200 (94 finalizaciones y 106 caidas) ofrecen un caso de analisis de generalizacion y de modos de fallo en politica de control.
- Experimentacion con envoltorios de seguridad en robotica: al ser un modelo pequeno y determinista en formato ONNX, es util para probar capas de monitorizacion, limites articulares o deteccion de caidas antes de integrarlo en un bucle de control simulado.
- Referencia para tecnicas de ajuste fino fino de politicas base: parte de sprint-2m-reference y muestra un flujo de reentrenamiento y seleccion (con normalizador congelado) que se puede trasladar a otras politicas base de la familia Microduck.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los de la propia model card:

| Metrica | Resultado |
|---|---|
| Tiempo medio de carrera en seeds oficiales (1-5) | 0,876 s |
| Tiempo de la mejor red previa (referencia interna, board) | 0,88 s |
| Finalizaciones en seeds 1001-1200 (no vistos) | 94 de 200 |
| Caidas en seeds 1001-1200 (no vistos) | 106 de 200 |
| Comando de avance interno | 0,55 m/s |

No se han publicado resultados de benchmarks comparables a MMLU, HumanEval o GSM8K porque el modelo no es un modelo de lenguaje. No se dispone de tablas comparativas oficiales con otras politicas de la Arena en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: practicamente inapreciable. Con aproximadamente 197.000 parametros y formato ONNX, el peso del modelo ocupa del orden de cientos de kilobytes, de modo que cabe en memoria de CPU sin problema.
- GPU recomendadas: no requiere GPU. El autor indica que el modelo se entreno en CPU y esta pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU dedicada (portatiles, mini-PC, contenedores ligeros).
- Opciones de despliegue: inferencia ONNX Runtime sobre CPU. El resto de opciones habituales (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste computacional de una red de este tamano es minimo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-hillclimber | ~197.000 (MLP 61-512-256-128-14) | No aplica | Hill climb 1,5 m en Microduck Arena | No disponible | HuggingFace (10 descargas) |
| pollen-robotics/microduck-sprint-2m-reference | No disponible | No aplica | Referencia de sprint 2 m | No disponible | HuggingFace (modelo base citado) |
| Otras politicas de la Microduck Arena | No disponible | No aplica | Distintas pruebas de la Arena | No disponible | HuggingFace Spaces (microduck-arena) |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo simulacion: el propio autor indica explicitamente que el modelo funciona unicamente en simulacion y no esta validado para transferencia a hardware real (sim2real).
- Ignora comandos externos: la consigna de avance es fija (0,55 m/s) y el modelo no responde a instrucciones de velocidad o direccion variables.
- Rendimiento imperfecto en seeds no vistos: en el rango 1001-1200 se producen 106 caidas de 200 intentos, lo que indica fragilidad ante condiciones fuera de la distribucion de entrenamiento.
- Sobreajuste a los seeds oficiales: gran parte de la seleccion (ES y CMA-ES) se hizo directamente sobre los seeds oficiales 1-5, lo que puede inflar el rendimiento reportado en ese conjunto concreto.
- Licencia no disponible: al no declararse licencia, no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no aplicables: el modelo no procesa texto, por lo que no tiene capacidades linguisticas.
- Riesgo de alucinacion: no aplica a un modelo de control, pero si existe riesgo de comportamientos no previstos (caidas, colisiones con paredes) fuera de las condiciones de entrenamiento.
- Tamano del repositorio de 0,0 GB: no se han podido verificar pesos adicionales ni artefactos complementarios en el repo.
- Sesgos: no se reportan sesgos de datos en la informacion disponible; al ser un entrenamiento en simulador, los sesgos relevantes serian los de la fisica simulada (MuJoCo 3.10.0, runner version 4) y del diseno de la pista.
- Caveat de produccion: cualquier integracion en un pipeline de robotica real requeriria validacion adicional, envoltorios de seguridad y verificacion de la licencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jrubiosainz/microduck-game-hillclimber
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre el ecosistema Microduck; los unicos enlaces utilizables son los procedentes de HuggingFace.

# fahadhafeezofficial/agent-recovery-bench-models

## Resumen

ARB baseline detector and recovery ranker es un conjunto de artefactos publicados por fahadhafeezofficial para reproducir los resultados de referencia del benchmark ARB (Agent Recovery Bench), un entorno de evaluacion de agentes autonomos centrado en la deteccion de fallos y la seleccion de acciones de recuperacion. No se trata de un modelo de lenguaje: el repositorio contiene dos clasificadores tabulares de muy baja complejidad (regresion logistica multinomial y un conjunto de modelos logisticos por operador) mas un fichero de resultados de evaluacion de un controlador LLM externo.

El primer artefacto, un detector de estados de fallo, clasifica cada paso de un agente en ocho clases (ninguno mas siete tipos de fallo) a partir de 19 caracteristicas de monitorizacion derivadas exclusivamente de la traza observable. El segundo, un ranker de acciones de recuperacion, decide entre aplicar la reparacion canonica de la clase detectada o ejecutar una contencion limpia. Ambos se entrenaron con fallos sinteticos inyectados en entornos Python deterministas y se evaluan unicamente dentro del sandbox de ARB.

Su relevancia es metodologica: el autor publica explicitamente un resultado negativo (el ranker de recuperacion rinde peor que la politica basada en reglas, 51,3 % frente a 60,9 %) y advierte contra cualquier uso en produccion. Sirve como referencia fija y divulgada para comparar monitores y politicas de recuperacion nuevas, no como componente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial (detector) y modelos logisticos por operador (ranker); clasificacion tabular |
| Parametros totales | No disponible (no se reporta numero de coeficientes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 19 caracteristicas en el detector) |
| Tipos de cuantizacion | No aplica (pesos en JSON) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | JSON (`models/detector.json`, `models/recovery_ranker.json`) |

## Arquitectura y entrenamiento

El detector es una regresion logistica multinomial con 8 clases (`none` mas 7 tipos de fallo), balanceada por clase, con regularizacion L2 e implementada en numpy. Consume 19 caracteristicas de monitorizacion calculadas solo sobre la traza observable: codigos de error y violaciones de esquema, antiguedad de version, desacuerdo entre fuentes, perdida de comunicacion, conformidad con politicas, progreso/repetitividad y presion de coste. Nunca ve el plan de fallos, el paso de inyeccion, el estado esperado ni el veredicto del grader. Se entreno con etiquetas a nivel de paso de episodios del split `train` (plantillas A/B, configuraciones cfg1-3) de las cuatro familias; el umbral de decision se barrio sobre `dev` (cfg5) maximizando F1 y se almacena en el artefacto.

El ranker de recuperacion usa un modelo logistico de valor por operador, `P(success | a, x) = sigmoid(w_a·x + b_a)`, con argmax penalizado por coste sobre el conjunto de candidatos. Sus entradas son la posterior del detector, la puntuacion de alarma, la presion del paso, los indicadores de error/antiguedad/conflicto, la racha de reintentos y los reintentos usados. Se entreno con decisiones de recuperacion de la politica basada en reglas sobre el split `train` unicamente (264 detecciones), excluyendo reintentos ciegos. La separacion de cabezas por operador es necesaria porque un unico modelo sobre one-hots de accion carece de interaccion accion×caracteristica y su argmax seria constante en todo el espacio de entrada.

## Capacidades

- Deteccion de fallo a nivel de paso: clasifica cada paso de agente en `none` o en uno de siete tipos de fallo.
- Salida probabilistica por clase (posterior) utilizable como senal de alarma.
- Operacion en dos modos: instrumentado (con telemetria del harness) y blackbox (sin ella).
- Ranking de acciones de recuperacion entre la reparacion canonica de la clase detectada y una contencion limpia.
- Integracion con un controlador LLM externo mediante el protocolo de `scripts/eval_llm.py`, que permite servir cualquier modelo via Ollama.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso: son clasificadores tabulares.

## Casos de uso

- Reproduccion de los numeros de referencia de ARB: cargar `detector.json` y `recovery_ranker.json` con las caracteristicas del monitor y verificar las metricas publicadas antes de proponer mejoras.
- Comparacion de un monitor nuevo contra una referencia fija y divulgada: sustituir el detector por la propuesta propia y medir la delta de AUC a nivel de paso frente a 0,762 instrumentado / 0,750 blackbox.
- Estudio de la relacion senal de fallo a recuperacion dentro del sandbox: analizar que caracteristicas de las 19 portan senal real y cuales confunden clases como `stale_state` con `planning_error`.
- Diagnostico de cuando la reparacion falla: usar el ranker como linea base para identificar estados donde la contencion deberia preferirse, sabiendo que su cabeza de contencion se dispara en casos donde la reparacion habria funcionado.
- Evaluacion de un LLM como selector de operador: replicar el protocolo con `qwen2.5-coder:7b` a temperatura 0 y comparar el 27,5 % de recuperacion frente al 60,8 % de la asignacion canonica en los mismos pares.
- Docencia y auditoria metodologica: el repositorio documenta un resultado negativo y el confundimiento off-policy del ranker, lo que lo convierte en material para explicar sesgos de politicas de registro en aprendizaje por refuerzo off-policy.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC a nivel de paso, modo instrumentado (detector) | 0,762 |
| AUC a nivel de paso, modo blackbox (detector) | 0,750 |
| Precision de tipo, modo instrumentado (detector) | ~51,6 % |
| ECE en split de entrenamiento (detector) | ~0,39 (mal calibrado) |
| Recuperacion del ranker frente a politica de reglas | 51,3 % frente a 60,9 % (resultado negativo) |
| Recuperacion del controlador LLM (`qwen2.5-coder:7b`) | 27,5 % frente a 60,8 % de la asignacion canonica; ventaja de las reglas de 33,3 puntos [16,7, 35,0] |
| Recuperacion del LLM por clase | `misuse` 95,5 %, `stale_state` 80,0 %; devuelve `retry` en el 60,4 % de las decisiones |
| Contencion de caidas irrecuperables | LLM 25 % frente a 100 % de las reglas |

## Requisitos de hardware

- VRAM: no aplica; los artefactos son ficheros JSON de regresion logistica que se ejecutan en CPU.
- GPU: no necesaria para el detector ni el ranker; el controlador LLM opcional (`qwen2.5-coder:7b`) requiere hardware de inferencia de un modelo de 7B (aproximadamente 5-6 GB en cuantizacion de 4 bits, no confirmado en la informacion disponible).
- Cabe en cualquier maquina capaz de ejecutar numpy.
- Despliegue: carga directa de los JSON en Python; para la evaluacion con LLM, cualquier servidor compatible con Ollama (`scripts/eval_llm.py --model ...`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ARB baseline detector and recovery ranker | Clasificadores tabulares (regresion logistica) | No disponible | No aplica | AUC 0,762 instrumentado; recuperacion 51,3 % | MIT | Hugging Face |
| Politica basada en reglas de ARB | Mapeo determinista clase a operador | No aplica | No aplica | Recuperacion 60,9 % | No disponible | Referencia interna del benchmark |
| Controlador LLM `qwen2.5-coder:7b` sobre ARB | LLM generativo | 7B (no confirmado) | No disponible | Recuperacion 27,5 % | No disponible | Ollama |

No se dispone de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Uso en produccion fuera de alcance: los modelos se ajustaron sobre fallos sinteticos en entornos Python deterministas y no hay evidencia de transferencia a herramientas, APIs o distribuciones de fallo reales.
- Decisiones de seguridad critica fuera de alcance: la cabeza de contencion del ranker se entreno con muy pocos ejemplos y no es un mecanismo de seguridad.
- El ranker de recuperacion es peor que la politica de reglas (51,3 % frente a 60,9 %) por confundimiento off-policy: solo observa resultados de los operadores que la politica de registro eligio, sin contrafactuales para estados donde el operador canonico fallo.
- El detector esta mal calibrado (ECE ~0,39 en entrenamiento): debe usarse el umbral almacenado y recalibrarse antes de interpretar la puntuacion como probabilidad en un modelo de coste.
- Confusiones de clase conocidas: `stale_state` con `planning_error` y `objective_drift` con `planning_error`; en modo blackbox pierde las evidencias de antiguedad, conflicto y mensajes y su punto de operacion se degrada.
- Entrenado con fallos inyectados: sobre fallos naturales generados por el agente el recall de eventos cae, aunque la concordancia de clase se mantiene alta.
- No debe citarse como evidencia sobre la capacidad de recuperacion de un LLM: ningun artefacto es un LLM.
- La puntuacion de contencion del benchmark premia detenerse cuando el mundo no se comprende y nunca premia forzar a traves de la incertidumbre; el protocolo del leaderboard exige evaluacion en sandbox de cualquier politica enviada.
- Licencia MIT permite uso comercial, pero el autor declara explicitamente fuera de alcance cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahadhafeezofficial/agent-recovery-bench-models

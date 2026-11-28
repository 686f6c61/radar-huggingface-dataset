# a1rb4Ck/microduck-sprint-2m

## Resumen

microduck-sprint-2m es un modelo de aprendizaje por refuerzo (reinforcement learning) publicado por el usuario a1rb4Ck en Hugging Face, concebido como participacion en la competicion "microduck arena". No es un modelo de lenguaje: se trata de una politica de control para un agente simulado (un "pato" con patas grandes) que debe recorrer 2 metros en el menor tiempo posible. La model card reporta un tiempo de 0,824 s en la revision bbddfe5 de la arena.

Tecnicamente, el modelo combina una red MLP que genera una marcha (gait) base con tablas de acciones especificas para las cinco semillas oficiales de la arena. Para cualquier otra semilla de inicio se aplica la marcha generica, que segun el autor completa la mayoria de los episodios aunque con un comportamiento menos eficiente. El repositorio es de tamano practicamente nulo (0,0 GB), lo que sugiere un artefacto muy ligero, probablemente pesos de una MLP pequena exportados a ONNX.

Su relevancia es acotada: se inscribe en el ecosistema de la libreria `microduck` y en una competicion de benchmarking de control motriz, no en el ambito de los modelos fundacionales. Resulta de interes para quienes investigan politicas ligeras de locomocion, optimizacion de controladores para entornos simulados y estrategias de especializacion por semilla (overfitting controlado a condiciones iniciales conocidas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) para la marcha base, combinada con tablas de acciones por semilla |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tag `onnx`); libreria `microduck` |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una MLP que produce una marcha (gait) y un conjunto de tablas que almacenan acciones o parametros para las cinco semillas oficiales de la arena. No se especifica el numero de capas, el tamano de las capas ocultas ni el numero de parametros. Tampoco se detalla el algoritmo de aprendizaje por refuerzo empleado (PPO, SAC, evolutivo u otro), el numero de pasos de entrenamiento ni la composicion del entorno de simulacion.

El autor indica que los pesos de la marcha provienen del modelo `hc5` de suraj-phanindra y que el diseno de contador y tablas se inspira en `remix3` de jrubiosainz. Ademas, la semilla 3 utiliza el final (ending) de `remix10` de jrubiosainz, que a su vez se construyo sobre este repositorio. Se trata, por tanto, de un trabajo de refinamiento iterativo sobre politicas previas mas que de un entrenamiento desde cero documentado. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control de locomocion de un agente simulado ("pato") para recorrer 2 metros en el entorno de la microduck arena.
- Generacion de una marcha generica (gait) aplicable a condiciones iniciales arbitrarias.
- Ejecucion de comportamientos especializados para las cinco semillas oficiales de la arena mediante tablas precalculadas.
- Inferencia ligera compatible con ONNX, apta para ejecucion en CPU.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Benchmarking de politicas de control en la microduck arena: permite comparar tiempos de recorrido (0,824 s reportado) frente a otras entradas de la competicion bajo las mismas semillas.
- Baseline para investigacion en locomocion simulada: sirve como punto de partida reproducible para experimentar con variaciones de la MLP o de las tablas por semilla.
- Estudio de especializacion por semilla: el modelo ilustra el compromiso entre una politica generica (la marcha base) y tablas optimizadas para condiciones iniciales concretas, util para analizar sobreajuste controlado.
- Despliegue embebido de controladores ligeros: al exportarse a ONNX y ser de tamano minimo, puede ejecutarse en CPU de forma eficiente en entornos de simulacion o prototipos de robotica.
- Docencia en aprendizaje por refuerzo: ejemplo compacto y de codigo abierto para explicar como se compone una politica de RL con componentes tabulares.
- Reutilizacion como componente en pipelines de la libreria `microduck`: integrable en flujos de evaluacion automatizada de agentes dentro de la arena.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tiempo de recorrido (2 m) | 0,824 s | Medicion local del autor, arena rev bbddfe5 |
| Semillas cubiertas por tablas | 5 | Semillas oficiales de la arena |
| Comportamiento en otras semillas | Marcha generica | "Completa la mayoria" de los episodios segun el autor |

No se han publicado resultados comparativos con otros modelos de la arena en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el formato es ONNX, por lo que la inferencia cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se requieren; el modelo esta pensado para ejecucion en CPU (el autor menciona el uso intensivo de ventiladores de CPU durante el desarrollo).
- GPU de consumo: compatible con cualquier GPU moderna via ONNX Runtime, aunque no es necesario su uso.
- Opciones de despliegue: ONNX Runtime y la libreria `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma agregada; el unico dato es el tiempo de recorrido de 0,824 s en la arena.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m | MLP + tablas (RL) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| hc5 (suraj-phanindra) | Politica RL (origen de la marcha) | no disponible | no aplica | no disponible | Hugging Face |
| remix3 (jrubiosainz) | Politica RL (origen del layout de tablas) | no disponible | no aplica | no disponible | Hugging Face |
| remix10 (jrubiosainz) | Politica RL (origen del ending de semilla 3) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta especializado en el entorno de la microduck arena; no es generalizable a otros dominios de robotica sin reentrenamiento.
- Las tablas por semilla implican un ajuste a las cinco semillas oficiales; en condiciones iniciales distintas se recurre a la marcha generica, con rendimiento inferior y comportamiento descrito por el autor como "un poco ridiculo".
- No hay documentacion sobre sesgos, riesgos de alucinacion ni comportamiento fuera de distribucion mas alla de la nota sobre la marcha generica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de pesos derivados de `hc5` y de disenos de `remix3` y `remix10`; conviene verificar las licencias de esos trabajos previos antes de un uso comercial.
- El repositorio no incluye informacion sobre el proceso de entrenamiento, hiperparametros ni datos, lo que dificulta la reproducibilidad.
- El tamano de 0,0 GB y la ausencia de parametros documentados impiden estimar la complejidad real del modelo.
- No se ofrecen garantias de robustez ni de seguridad en entornos fisicos; su uso esta pensado para simulacion.

## Enlaces

- Hugging Face: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
- Modelo hc5 (suraj-phanindra), origen de los pesos de la marcha: no disponible
- Modelo remix3 (jrubiosainz), origen del layout de contador y tablas: no disponible
- Modelo remix10 (jrubiosainz), origen del ending de la semilla 3: no disponible
- Repositorio de la libreria `microduck`: no disponible
- Documentacion de la microduck arena: no disponible

# BurnyCoder/ministrike-fixed-seed222

## Resumen

MiniStrike fixed_seed222 es un checkpoint de aprendizaje por refuerzo multiagente (no un modelo de lenguaje) publicado por Libor Burian bajo el usuario BurnyCoder. Se trata del punto final de un entrenamiento MAPPO (Multi-Agent PPO) sobre un entorno propio de shooter táctico 3D 5v5, implementado con TorchRL/PyTorch. El modelo aprende a controlar bots mediante autoenfrentamiento y condiciones de oponente fijo, a partir de observaciones estructuradas (no píxeles) y emitiendo seis controles categóricos.

Su relevancia es acotada y de carácter metodológico: el autor lo publica como artefacto de reproducibilidad de un experimento local pequeño, con auditoría de aprendizaje, configuración y métricas negativas incluidas. La model card declara explícitamente el estado "DEFERRED, INCOMPLETE", sin torneo final completado ni reclamación de habilidad táctica, y con la evaluación pendiente. No debe interpretarse como evidencia de rendimiento a nivel humano ni de transferencia a Counter-Strike comercial.

Arquitectónicamente es minúsculo: un actor compartido de tipo MLP 2x128 con activación tanh, 384 entradas de historial limitado por visibilidad y seis salidas categóricas, más un crítico centralizado 2x256 usado solo durante el entrenamiento. El checkpoint incluye pesos, estado del optimizador, estado del entorno y generadores aleatorios, y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor compartido MLP 2x128 con tanh (entrada 384, salida 6 categóricas) y crítico centralizado 2x256 solo en entrenamiento; algoritmo MAPPO sobre TorchRL |
| Parametros totales | No disponible como cifra oficial; el actor descrito suma aproximadamente 66.566 parametros (calculo derivado de 384x128 + 128x128 + 128x6 con sesgos). El critico centralizado no se detalla |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no usa contexto textual. La entrada es una observacion estructurada de 384 valores con historial limitado por visibilidad |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones (el checkpoint es PyTorch en coma flotante estandar) |
| Idiomas soportados | No aplica / no disponible: el modelo no procesa ni genera lenguaje natural |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch `.pt` (pesos, estado del optimizador y del entorno, y RNGs); carga con `weights_only` validada por el loader del proyecto |

## Arquitectura y entrenamiento

El sistema sigue el paradigma MAPPO con un actor compartido entre agentes y un crítico centralizado que solo se emplea durante el entrenamiento. El actor es un perceptrón multicapa de dos capas de 128 unidades con activación tanh, que recibe 384 entradas correspondientes a observaciones estructuradas limitadas por visibilidad (geometría de cajas, movimiento a nivel de suelo, estado de objetivo) y produce seis controles categóricos. En inferencia, el jugador automático usa únicamente observaciones locales y controles en crudo; el crítico 2x256 no forma parte del despliegue.

El entrenamiento corresponde a la condición "fixed", con semilla independiente 222, 2.682.880 transiciones de arena, 1.310 actualizaciones y presupuesto de fotogramas no completado (`frame budget completed: False`). Se usó gamma 0.999 y un currículo con fracciones 15/15/70 para inicios de combate, objetivo y estándar respectivamente. La revisión del código fuente registrada es `38697fee4af941b12cfd15489424e2750ef4dd1d`. El repositorio incluye `initial.pt` como línea base intacta y `model.pt` como punto final guardado, sin selección basada en puntuaciones de test final. No se documentan RLHF, DPO ni innovaciones de decodificación; las referencias metodológicas son el tutorial MAPPO de TorchRL, el artículo MAPPO (arXiv:2103.01955) y el trabajo sobre incertidumbre en evaluación de RL (arXiv:2108.13264).

## Capacidades

- Control de bots en un shooter táctico 3D 5v5 mediante seis acciones categóricas discretas, a partir de observaciones estructuradas (no píxeles).
- Juego cooperativo multiagente con política compartida: la misma red controla a todos los agentes del equipo.
- Ejecución en modo espectador y en modo juego interactivo con el repositorio fuente (`csrl watch`, `csrl play`), incluyendo toma de control manual sin reiniciar la ronda.
- Reanudación del entrenamiento: el checkpoint contiene estado del optimizador, estado del entorno y generadores aleatorios.
- Evaluación contra oponentes congelados de tipo random, rush y guard, con intercambio de lados.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión por píxeles, audio ni generación de texto.
- Sin capacidades multilingües: no hay procesamiento de lenguaje.

## Casos de uso

- Reproducción de experimentos MAPPO: el checkpoint permite reanudar exactamente una ejecución con semilla 222 al conservar pesos, optimizador, estado del entorno y RNGs, lo que resulta útil para auditar resultados publicados.
- Estudio de varianza entre semillas: al existir condiciones fijas con semillas independientes, sirve como una muestra más en análisis de robustez entre modelos entrenados por separado.
- Docencia de RL multiagente: el tamaño reducido del actor (decenas de miles de parámetros) y una única configuración de mapa lo hacen manejable como ejemplo práctico de actor-crítico centralizado.
- Investigación sobre currículos de entrenamiento: las fracciones 15/15/70 (combate/objetivo/estándar) permiten experimentar con variaciones de planificación de escenarios y medir su efecto.
- Desarrollo de protocolos de evaluación: el proyecto publica intervalos bootstrap sobre pares de semillas y desgloses por lado y oponente, de modo que el checkpoint sirve para validar herramientas de evaluación con incertidumbre.
- Pruebas de integración de pipelines de RL: al ser un artefacto pequeño con esquema validado y carga `weights_only`, es adecuado para verificar procesos de carga, serialización y compatibilidad de versiones en CI.
- Demostración interactiva de agentes: los modos espectador y juego permiten observar el comportamiento aprendido en una única arena con un rifle y objetivos de bomba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el estado de evaluación registrado es "pending": la puntuación media por ronda y el intervalo bootstrap del 95% condicional por pares de semillas figuran como pendientes. La puntuación se define como victoria 1, empate 0,5 y derrota 0 frente a controles congelados random/rush/guard con lados intercambiados, pero no se aportan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el actor ronda las decenas de miles de parámetros y la entrada es un vector de 384 valores.
- GPU: no necesaria. Cualquier GPU consumer (por ejemplo GTX 1650 o superior) es sobrada; también es viable en CPU para inferencia por episodio.
- Cabe en cualquier GPU consumer y en entornos sin GPU; el cuello de botella es la simulación del entorno, no la red.
- Opciones de despliegue: el repositorio fuente con su entorno `uv` bloqueado y PyTorch (`uv run csrl watch`, `uv run csrl play`). No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se publican mediciones. El tamaño del repositorio figura como 0.0 GB en los metadatos.
- Entrenamiento: MAPPO con crítico centralizado y 2,68 millones de transiciones; no se documentan requisitos de hardware para reentrenar.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa publicada. La tabla recoge la comparación cualitativa con los artefactos y referencias que el propio proyecto pone a disposición.

| Modelo / referencia | Tipo | Parametros | Entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniStrike fixed_seed222 (`model.pt`) | Checkpoint MAPPO, condición de oponente fijo | ~66,6 mil en el actor (derivado); crítico no detallado | 384 valores estructurados | 2.682.880 transiciones, 1.310 actualizaciones, semilla 222 | MIT | HuggingFace (0 descargas, 0 likes) |
| MiniStrike `initial.pt` (línea base) | Checkpoint MAPPO sin entrenar | El mismo esquema que `model.pt` | 384 valores estructurados | Punto de partida intacto | MIT | Incluido en el repositorio fuente |
| Oponentes congelados random / rush / guard | Políticas de referencia del entorno | No disponible | Observaciones del entorno | Reglas o políticas congeladas | No disponible | Incluidos en el repositorio fuente |
| Configuraciones MAPPO con otras semillas | Checkpoints del mismo estudio | Misma arquitectura declarada | 384 valores estructurados | Condiciones y presupuestos variables | MIT | Repositorio fuente (según auditoría) |

Frente a referentes de RL multiagente a gran escala (por ejemplo OpenAI Five en Dota 2 o los baselines de SMAC), este checkpoint es un experimento local de un único mapa, sin métricas publicadas y sin reclamación de habilidad; no se han encontrado en la búsqueda web datos que permitan una comparación numérica.

## Limitaciones y advertencias

- Estado declarado por el autor: "DEFERRED, INCOMPLETE", sin torneo final completado ni reclamación de habilidad táctica; la evaluación figura como pendiente.
- El presupuesto de fotogramas no se completó (`frame budget completed: False`), por lo que el punto final no representa una convergencia planificada.
- `model.pt` no fue seleccionado mediante puntuaciones de test final; es simplemente el último punto guardado.
- El propio autor advierte que es un experimento local pequeño y que no constituye evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial; las ejecuciones de humo solo validan el pipeline de aprendizaje.
- Los intervalos de confianza de partidas no establecen robustez entre modelos entrenados de forma independiente; se publican hipótesis fallidas y bots débiles sin filtrar.
- Alcance de entorno muy limitado: un único mapa, movimiento a nivel de suelo, geometría de cajas, un solo rifle y objetivos de bomba.
- La entrada son observaciones estructuradas, no píxeles; el modelo no es aplicable a visión por computador genérica ni a entornos con entrada visual.
- Condición de oponente fijo: queda fuera del protocolo posterior de autoenfrentamiento puro (Stage A), lo que limita la comparabilidad con otras variantes del estudio.
- Sin capacidades de lenguaje, tool calling ni agentes conversacionales; no debe evaluarse con criterios de LLM.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero el artefacto no incluye garantías ni soporte.
- Inconsistencia en los enlaces del proyecto: la model card cita dos rutas de repositorio distintas (`3d-firstperson-shooter-reinforcement-learning-selfplay` y `counter-strike-reinforcement-learning-selfplay`), lo que puede romper la reproducibilidad si una de ellas no resuelve.
- Metadatos llamativos: fecha de creación registrada 2026-10-23, 0 descargas, 0 likes y tamaño de repositorio 0.0 GB; conviene verificar la integridad de la subida antes de usarlo.
- La búsqueda web realizada no devolvió resultados relevantes (solo páginas de Snapchat sin relación), por lo que no hay fuentes externas independientes que validen el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/ministrike-fixed-seed222
- Repositorio fuente (según model card): https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay
- Auditoría de aprendizaje: https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay/blob/main/reports/learning-audit/summary.md
- Protocolo del proyecto: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/blob/main/docs/protocol.md
- Informes del proyecto: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/tree/main/reports
- Tutorial MAPPO de TorchRL: https://docs.pytorch.org/rl/stable/tutorials/multiagent_ppo.html
- Artículo MAPPO: https://arxiv.org/abs/2103.01955
- Incertidumbre en evaluación de RL: https://arxiv.org/abs/2108.13264

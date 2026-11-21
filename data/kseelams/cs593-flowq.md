# kseelams/cs593-flowq

## Resumen

FlowQ DSRL checkpoints es una colección de pesos entrenados dentro del proyecto CS593 FlowQ, orientada a control robótico mediante políticas de flujo (flow matching) combinadas con aprendizaje por refuerzo offline/online (DSRL, *Diffusion/Flow Steering Reinforcement Learning*). El autor publica en Hugging Face los checkpoints resultantes de entrenar sobre tres tareas del simulador robosuite: Lift, Can y Square. No se trata de un modelo de lenguaje, sino de artefactos de investigación para manipulación robótica en simulación.

El paquete contiene dos tipos de artefactos: por un lado, políticas base congeladas de *behavior cloning* (BC) implementadas como flujos (`bc/<task>/bc/flow.pt`); por otro, checkpoints DSRL (`dsrl.pt`) que "dirigen" esas políticas congeladas sin modificarlas, y que solo cargan si el hash SHA-256 del flujo BC correspondiente coincide. Cada checkpoint va acompañado de `config.json`, `summary.json` y `evaluations.json` con evaluaciones emparejadas BC frente a DSRL.

La relevancia es acotada pero clara para quien investiga RL sobre políticas generativas: los resultados muestran mejoras sustanciales de éxito en Lift (46% a 92%) y Can (52% a 88%) con 100k pasos online, y también documentan un fallo (Square, divergencia del crítico, 0% frente a 8%). El entrenamiento se realizó en una RTX 5080 en float64. La información pública no incluye arquitectura detallada, número de parámetros ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de flujo (flow matching) congelada + módulo DSRL de steering; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control robótico, no texto) |
| Tipos de cuantizacion | no disponible; entrenamiento en float64 |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch): `dsrl.pt`, `flow.pt`, junto a `config.json`, `summary.json`, `evaluations.json` |

## Arquitectura y entrenamiento

La propuesta combina una política BC preentrenada basada en flujos (modelo generativo que produce acciones por integración de un campo de velocidades) que permanece congelada, con un módulo DSRL que la dirige durante la inferencia. El cargador verifica el SHA-256 del flujo BC para garantizar que cada `dsrl.pt` se empareja con la política exacta sobre la que fue entrenado; mezclar artefactos provoca fallo de carga. Los checkpoints se entrenaron en una GPU RTX 5080 con precisión float64.

El entrenamiento DSRL se realizó con 100k pasos online, con una relación *update-to-data* (utd) de 20 en las ejecuciones principales y utd 5 en una variante para Square. Existen también pruebas pequeñas (warmup, offline, 5k online, distintos valores de beta KL de 1 y 10) y una prueba "dual RL" con fases T1–T3. Los buffers de replay (139 MB) no se incluyen porque no son necesarios para inferencia. No se documentan en la información disponible el número de tokens/datos de entrenamiento de la política BC, la composición del dataset ni el uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control robótico en simulación para tareas de manipulación de robosuite: Lift, Can y Square.
- Generación de acciones mediante políticas de flujo (flow matching) con steering por RL.
- Evaluación emparejada BC frente a DSRL mediante el runner `flowq.dsrl_runner eval`.
- Verificación de integridad por hash SHA-256 entre checkpoint DSRL y flujo BC.
- Variantes de configuración: distintos seeds, valores de utd (5 y 20), betas KL (1 y 10) y fases de entrenamiento (warmup, offline, online).
- No soporta tool calling, agentes multi-paso, multilingüismo, visión, audio ni modos de razonamiento; es un artefacto específico de robótica.

## Casos de uso

- Investigación en RL sobre políticas generativas: usar los checkpoints para reproducir la mejora documentada en Lift (46% a 92%) y Can (52% a 88%) y comparar contra la política BC congelada usando `evaluations.json`.
- Estudio de estabilidad del crítico: el caso Square con utd 20 (0% frente a 8%, crítico divergente) sirve como referencia negativa para analizar divergencia y ajustar hiperparámetros como utd o beta KL.
- Ablaciones de utd: comparar `dsrl_full_seed0_utd20` con `square_utd5_seed0` para medir el efecto de la relación update-to-data en el éxito de la tarea.
- Barrido de beta KL: las pruebas pequeñas `B_*`, `C_*`, `D_*`, `E_*` sobre Can permiten analizar el efecto de beta KL 1 frente a 10 en evaluaciones de 20 episodios.
- Comparación dual RL frente a DSRL puro: usar `nov15/dual_small_can/T3_online` (80% frente a 60%) y `T3_dsrl_only` (75% frente a 60%) como referencia emparejada.
- Reproducibilidad de experimentos: el emparejamiento por SHA-256 y los ficheros `config.json`/`summary.json` permiten reconstruir exactamente las condiciones de cada ejecución en un pipeline de investigación.

## Benchmarks y rendimiento

Resultados de éxito publicados en la model card (evaluaciones emparejadas BC frente a DSRL):

| Carpeta | Tarea | Configuración | Éxito DSRL | Éxito BC |
|---|---|---|---|---|
| `preliminary/dsrl_full_seed0_utd20/lift` | Lift | seed 0, utd 20, 100k | 92% | 46% |
| `preliminary/dsrl_full_seed0_utd20/can` | Can | seed 0, utd 20, 100k | 88% | 52% |
| `preliminary/dsrl_full_seed0_utd20/square` | Square | seed 0, utd 20, 100k (crítico divergente) | 0% | 8% |
| `nov15/dsrl_full_seed1/lift` | Lift | seed 1, utd 20, 100k | 88% | 46% |
| `nov15/dsrl_full_seed1/can` | Can | seed 1, utd 20, 100k | 78% | 52% |
| `nov15/square_utd5_seed0` | Square | seed 0, utd 5, 100k | 8% | 8% |
| `nov15/dual_small_can/T3_online` | Can | dual RL, fase online | 80% | 60% |
| `nov15/dual_small_can/T3_dsrl_only` | Can | DSRL puro de referencia | 75% | 60% |

Las pruebas pequeñas sobre Can (`B_*`, `C_*`, `D_*`, `E_*`) reportan evaluaciones de 20 episodios, pero los porcentajes concretos no se detallan en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de los checkpoints no se especifica en la información proporcionada.
- GPU de entrenamiento documentada: NVIDIA RTX 5080 en float64.
- GPU recomendadas para inferencia: no disponible; al ser políticas pequeñas de robótica, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican). La inferencia se realiza con el runner del proyecto: `python -m flowq.dsrl_runner eval --checkpoint <dsrl.pt> --flow <flow.pt> --out <dir>`.
- Latencia y throughput: no disponibles.
- Almacenamiento: los buffers de replay (139 MB) no se incluyen ni son necesarios para inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowQ DSRL checkpoints | Política de flujo + RL (robótica) | Lift, Can, Square (robosuite) | no aplica | no disponible | Hugging Face (`kseelams/cs593-flowq`) |
| Políticas BC base del mismo repo | Behavior cloning con flujos | Lift, Can, Square | no aplica | no disponible | Incluidas en el mismo repo |
| Alternativas externas (p. ej. políticas RL/IL para robosuite) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables externos en la documentación proporcionada; la única comparación documentada es interna (DSRL frente a BC).

## Limitaciones y advertencias

- Ámbito muy restringido: solo tres tareas de robosuite (Lift, Can, Square); no es un modelo de propósito general.
- Resultados frágiles en Square: con utd 20 el crítico divergió y el éxito cayó a 0% (frente al 8% de BC); con utd 5 no hubo mejora (8% frente a 8%).
- Dependencia estricta del emparejamiento: cada `dsrl.pt` solo carga con su `flow.pt` correspondiente (verificación SHA-256); no es posible reutilizar checkpoints con otras políticas BC.
- Sin buffers de replay incluidos: no se puede reentrenar ni continuar el entrenamiento a partir de los artefactos publicados.
- Entrenamiento en float64: puede implicar requisitos de memoria mayores de lo habitual en inferencia si se mantiene la precisión.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de sesgos, alucinación o multilingüismo (no aplican al dominio), pero tampoco hay información sobre robustez sim-to-real.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros.
- No se documentan parámetros, arquitectura interna ni composición del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/kseelams/cs593-flowq
- Repositorio del proyecto (referenciado en la model card como "project repo root", sin URL explícita): no disponible
- Paper, blog o demo: no disponible

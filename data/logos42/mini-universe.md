# logos42/mini-universe

## Resumen

Mini Universe es un artefacto de aprendizaje por refuerzo publicado por el usuario logos42 en HuggingFace. No es un modelo de lenguaje ni un transformer: se trata de una única tabla Q agregada de forma `(480, 6)` (480 estados de rejilla por 6 acciones) entrenada mediante Q-learning tabular con exploración UCB y annealing sobre un simulador propio llamado Mini Universe, un mundo multiagente de "rejilla expansiva" en el que cada agente navega una escala de frecuencias logarítmica dividida en 20 bandas (de 1e-19 Hz a 1e81 Hz, 5 décadas por banda). El checkpoint publicado corresponde al objetivo de alcanzar y mantenerse en la banda 10.

El interés del artefacto es metodológico y de reproducibilidad: el autor lo presenta explícitamente como una línea base honesta, no como una reivindicación de inteligencia general. Incluye el simulador (`pu12_v33.py`), el driver de entrenamiento y evaluación (`pu12_v33_mirror.py`) y un script de inferencia (`inference.py`) que evalúa de forma voraz si la política alcanza la banda objetivo.

Con solo 480 parámetros aprendidos y licencia MIT, resulta útil para experimentos docentes de RL tabular, para reproducir el benchmark espejo del autor y para estudiar fenómenos como la interferencia catastrófica entre objetivos, que el propio autor documenta como limitación principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q agregada, sin red neuronal) |
| Parametros totales | 480 (tabla Q de forma `(480, 6)`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y pytorch_model.bin; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.bin |

## Arquitectura y entrenamiento

La "arquitectura" es una tabla Q de 480 estados por 6 acciones, compartida y agregada entre todos los agentes del simulador (promediada ponderando por recuentos de visita). Cada agente ocupa una dirección de rejilla multicapa y elige entre seis acciones: esperar, subir de frecuencia, bajar de frecuencia, expandir sub, expandir subs y refinar. El espacio de estados corresponde a una rejilla de 480 celdas sobre un eje de frecuencias logarítmico con 20 bandas.

El entrenamiento emplea Q-learning tabular con exploración UCB y annealing, con el objetivo de alcanzar una banda de frecuencia concreta y permanecer en ella. El checkpoint publicado se entrenó para la banda 10; el comando de reproducción indicado en la model card es `python3 pu12_v33_mirror.py --B 1024 --train-ticks 80000 --goal-k 10 --device cpu`, que escribe `logs_mirror/benchmark.json`. No se documentan RLHF, DPO ni datos de texto: el "dataset" es la propia experiencia de simulación generada por el entorno.

## Capacidades

- Navegación de una escala de frecuencias logarítmica en un simulador de rejilla multiagente.
- Alcanzar y mantenerse ("dwell") en una banda objetivo (banda 10 en este checkpoint).
- Política agregada multiagente: la tabla Q se comparte entre agentes y se pondera por visitas.
- Evaluación voraz sin reentrenamiento mediante `inference.py` (`--goal-k`, `--device`).
- Conservación de energía interna perfecta según el benchmark del autor.
- No soporta tool calling, function calling, agentes LLM, razonamiento multi-paso simbólico, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Docencia de RL tabular: usar el repositorio como ejemplo mínimo y ejecutable de Q-learning con UCB y annealing, con solo 480 parámetros y un script de inferencia autocontenido.
- Reproducción de experimentos: ejecutar el comando de entrenamiento documentado para regenerar `benchmark.json` y comparar con el resultado publicado (0,62 / 1,0).
- Estudio de interferencia catastrófica: analizar la ausencia de transferencia positiva entre objetivos (plasticidad few-shot negativa) como caso controlado en entornos pequeños.
- Investigación sobre conservación de energía en simuladores: aprovechar la propiedad de conservación perfecta reportada para validar integradores o dinámicas del mundo.
- Línea base para comparar algoritmos de RL: servir de referencia tabular frente a métodos con aproximación de función (DQN, PPO) en el mismo simulador.
- Pruebas de infraestructura de publicación de modelos: usar el repo como fixture ligero (0,0 GB) para validar pipelines de carga de safetensors, lectura de `config.json` y ejecución en CPU.
- Experimentos de multiagente con política compartida: estudiar cómo se comporta una tabla Q agregada por visitas cuando varios agentes operan en la misma rejilla.

## Benchmarks y rendimiento

| Benchmark | Resultado | Observaciones |
|---|---|---|
| Benchmark espejo small-world (autor) | 0,62 / 1,0 | Aprendizaje de tarea fuerte y conservación de energía interna perfecta |
| Transferencia entre objetivos | Negativa | Sin transferencia positiva; interferencia catastrófica |
| Estructura de nivel lingüístico en secuencias de acciones | Ausente | El autor indica que no hay estructura tipo lenguaje |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, y no proceden para este artefacto.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; la tabla Q de 480 × 6 valores en coma flotante ocupa unos pocos kilobytes.
- GPU: no necesaria; el script de inferencia admite `--device cpu`.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU.
- Despliegue: ejecución directa con Python y PyTorch (`inference.py`, `pu12_v33_mirror.py`); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el coste dominante es el bucle del simulador, no la inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini Universe (logos42) | 480 | no aplica | 0,62 / 1,0 en benchmark propio | MIT | HuggingFace |
| Q-tables tabulares de referencia (p. ej. FrozenLake, Cliff Walking de Gymnasium) | del orden de decenas a miles de celdas | no aplica | no comparable directamente | MIT / BSD | Librerías estándar |
| DQN sobre entornos discretos pequeños | miles a millones | no aplica | no comparable directamente | MIT | Implementaciones públicas |

No se dispone de una comparativa numérica homogénea con alternativas en la información proporcionada; las filas anteriores son referencias cualitativas de la misma categoría (RL tabular o aproximado en entornos pequeños).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural ni procesa idiomas.
- Sin transferencia positiva entre objetivos; el autor reporta interferencia catastrófica al cambiar de meta.
- Sin estructura lingüística en las secuencias de acciones, según el propio benchmark del autor.
- Rendimiento global de 0,62 / 1,0 en el benchmark espejo: no es un sistema de propósito general.
- El checkpoint publicado está entrenado solo para la banda 10; su comportamiento en otras bandas no está garantizado.
- La tabla Q está agregada y ponderada por visitas, por lo que no representa una política individual por agente.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la política puede fallar fuera de la distribución de estados visitados durante el entrenamiento.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Para producción real de agentes o asistentes, este artefacto no es adecuado; su valor es educativo y de reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/logos42/mini-universe
- Repositorio fuente citado en la model card: https://github.com/logos-42/NODS
- Documentación complementaria citada: `current-status.md` y `log.md` en el repositorio fuente (no se proporcionan URL directas)
- Paper: no disponible
- Demo: no disponible

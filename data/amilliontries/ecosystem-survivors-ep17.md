# amilliontries/ecosystem-survivors-ep17

## Resumen

`ecosystem-survivors-ep17` no es un modelo de lenguaje, sino un artefacto de neuroevolución: el conjunto de 134 cerebros y genomas supervivientes de una simulación de vida artificial ejecutada en JAX. Lo publica el autor de YouTube "A Million Tries" como complemento del episodio 17 de su serie, en el que 16 mundos de 1.000 animales con cerebros aleatorios compitieron durante 9.000 días de simulación; 15 de los 16 mundos se extinguieron y solo sobrevivió el mundo 5, cuyos 134 animales (hasta generación 67) se empaquetan aquí.

Cada individuo es una red neuronal mínima (33 entradas, 8 neuronas ocultas con `tanh`, 8 salidas) más un vector de genes que codifica masa, dieta, capacidad de grasa, probabilidad de reproducción en solitario y estado posicional. El repositorio contiene tensores `safetensors` con formas alineadas por fila (134 individuos) y el código de la simulación está en el repositorio de GitHub del autor bajo la etiqueta `episode-17`.

Es relevante como ejemplo reproducible de neuroevolución sin función de recompensa explícita ("no reward, no trainer"): la selección emerge de la física del entorno (comer, beber, mantener el calor, reproducirse). No sirve para generación de texto ni para tareas de NLP; su interés es científico y educativo en el ámbito de vida artificial y sistemas evolutivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) 33 -> 8 (tanh) -> 8, por individuo; población de 134 agentes |
| Parametros totales | 47.436 en total en el artefacto (344 pesos por cerebro x 134 individuos, más genes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; cada cerebro procesa 33 sentidos por paso) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa del tensor `safetensors`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `jax`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de una sola capa oculta: 33 sentidos de entrada, 8 neuronas ocultas con activación `tanh` y 8 salidas de acción (girar, velocidad, comer, reproducirse, atacar, llamar y dos valores de memoria). Los pesos se aplanan como `w1 (33x8), b1 (8), w2 (8x8), b2 (8)`, lo que da 344 parámetros por cerebro. Las 33 entradas incluyen comida bajo los pies y en tres sectores visuales, obstáculos, reserva energética, masa relativa, cadáveres, proximidad y tamaño del animal más cercano en cada sector, olfato de congéneres y familiares, audición (volumen y lado), dos números de memoria escritos en el paso anterior, fruta y sed.

No hay entrenamiento por descenso de gradiente ni RLHF: el "entrenamiento" es selección evolutiva. Se inicializaron 16 mundos de 1.000 animales con cerebros aleatorios y se simularon 9.000 días (25 años) en GPU con JAX. Un cerebro solo se transmitía si su animal sobrevivía lo suficiente para reproducirse; los genomas (masa adulta, masa actual, masa al nacer, capacidad de grasa, dieta, probabilidad de reproducción en solitario) evolucionan junto con los pesos. El resultado es una población con hasta 67 generaciones de selección acumulada. El autor incluye un control experimental: copia el mundo en el día 9.000, mantiene los cerebros evolucionados en una copia y asigna cerebros aleatorios en la otra, y compara supervivencia durante 5 días adicionales.

## Capacidades

- Navegación y supervivencia en un entorno 2D simulado de 256 m: localizar comida, agua, cadáveres y fruta mediante sentidos visuales, olfativos y auditivos.
- Regulación homeostática: gestionar energía, masa corporal, grasa y sed; el comportamiento aprendido se resume en beber más y moverse más despacio.
- Reproducción condicionada: decisión de aparearse con congéneres o en solitario según el gen `alone`.
- Interacción social básica: ataque (22,6 % de los pasos en el mundo 5 son ataques), llamadas y reconocimiento de familiares por olfato.
- Memoria de corto plazo: dos valores de memoria que el cerebro escribe y relee en el paso siguiente.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión real, audio ni capacidades multilingües.

## Casos de uso

- Investigación en neuroevolución: usar la población como punto de partida (checkpoint) para experimentos de selección artificial, mutación y cruce sobre una red mínima ya adaptada, evitando partir de cerebros aleatorios.
- Estudio de dinámicas de extinción: replicar el experimento de los 16 mundos con el código `games/ecosystem_jax*.py` para analizar por qué 15 poblaciones colapsaron por sed en invierno tardío y qué rasgos genéticos correlacionan con la supervivencia.
- Benchmark de control evolutivo: comparar cerebros evolucionados frente a aleatorios con el protocolo del autor (supervivencia del 71 % frente al 21 % en el día 9.000) como línea base en publicaciones de vida artificial.
- Docencia y divulgación: demostrar en un curso de sistemas complejos cómo emerge comportamiento adaptativo sin función de recompensa explícita, con tensores pequeños (0,0 GB) que caben en cualquier portátil.
- Ingeniería de simulaciones en JAX: reutilizar el artefacto como caso de prueba para pipelines de simulación vectorizada en GPU, incluyendo los flags `--rain --thirst --gut --cold --cold-breath`.
- Arte generativo y visualización: renderizar las posiciones (`pos`, `heading`) y trayectorias de los 134 animales para animaciones o instalaciones basadas en datos evolutivos reales.

## Benchmarks y rendimiento

El autor publica un experimento de control (cerebros evolucionados frente a aleatorios en el mundo 5) en lugar de benchmarks estándar de NLP:

| Dia (mundo 5) | Supervivencia, cerebros evolucionados | Supervivencia, cerebros aleatorios | Bebida (% de pasos) | Velocidad (m/s) |
|---|---|---|---|---|
| 3.600 | 75 % | 23 % | 68 vs 47 | 1,24 vs 1,54 |
| 7.200 | 101 % | 42 % | 60 vs 40 | 0,93 vs 1,24 |
| 9.000 (estos) | 71 % | 21 % | 69 vs 45 | 1,21 vs 1,39 |

Agregado de todos los mundos vivos en esas fechas: 93 % frente a 26 % (día 3.600, 6 mundos) y 91 % frente a 33 % (día 7.200). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este artefacto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el repositorio completo ocupa 0,0 GB y los tensores suman 47.436 parámetros.
- GPU recomendadas: cualquiera compatible con JAX (CUDA o ROCm); el autor ejecutó la simulación en GPU, pero la inferencia de los 134 cerebros es trivial y funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, integradas) e incluso en CPU sin problema.
- Opciones de despliegue: JAX con los scripts del repositorio (`scripts/eco_jax_run.py`, `games/ecosystem_jax*.py`); no hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma agregada; la simulación completa de 16 mundos x 1.000 animales x 9.000 días se ejecutó en GPU, pero no se especifican tiempos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de neuroevolución publicados con el mismo formato (población de cerebros más genomas en `safetensors` con protocolo de control). Las alternativas habituales (NEAT, OpenAI ES, redes evolucionadas en entornos tipo Polyworld) no se detallan aquí por falta de datos verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con métricas de NLP.
- Los cerebros están especializados en un único entorno (mundo 5, 256 m, con lluvia, sed, frío y digestión); no generalizan a otros dominios sin reevolucionar.
- El "aprendizaje" observado es limitado: principalmente beber más y moverse más despacio; no hay razonamiento ni planificación de largo plazo.
- Riesgo de sobreinterpretación: la supervivencia del 101 % en el día 7.200 sugiere que la métrica de control cuenta nacimientos, no solo individuos iniciales; conviene revisar el código antes de citar cifras.
- Solo sobrevivió 1 de 16 mundos, lo que indica una varianza alta y poca robustez del proceso evolutivo; los resultados pueden no ser reproducibles sin la semilla exacta.
- Licencia MIT: permite uso comercial y modificación, pero el código de la simulación vive en el repositorio de GitHub del autor bajo la etiqueta `episode-17`; verificar la licencia del código por separado.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en Hugging Face, creado y actualizado el mismo día (16 de noviembre de 2026).

## Enlaces

- Hugging Face: https://huggingface.co/amilliontries/ecosystem-survivors-ep17
- Repositorio de código (etiqueta `episode-17`): https://github.com/backstab319/a-million-tries/tree/episode-17
- Script de ejecución: `scripts/eco_jax_run.py` dentro del repositorio anterior
- Canal de YouTube: https://www.youtube.com/@amilliontries

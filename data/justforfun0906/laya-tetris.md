# justforfun0906/laya-tetris

## Resumen

Laya Tetris es un ajuste fino del modelo Laya (basado en ModernBERT-large, 421 millones de parámetros) orientado a jugar al Tetris mediante imitación de un bot heurístico. Lo desarrolla el usuario justforfun0906 y se publica bajo licencia Apache-2.0, heredada del modelo base convaiinnovations/laya. El problema que aborda es acotado pero interesante: demostrar que un modelo de lenguaje encoder-only puede aprender una política de decisión sobre un estado de juego estructurado, formulando cada turno como una pregunta de elección múltiple.

El modelo no genera texto libre para jugar, sino que recibe el tablero renderizado como filas de caracteres (`#`/`.`) junto con la pieza actual y la siguiente, y debe escoger entre 10 colocaciones candidatas preseleccionadas por una regla simple independiente del profesor. La relevancia actual reside en su enfoque de destilación con etiquetas suaves sobre un modelo compacto (421M parámetros) y en el bajo coste de entrenamiento reportado: 1.336 pasos y unas 3 horas en un Apple M2, actualizando solo 124M parámetros.

El contexto de este modelo es limitado y específico: no es un modelo conversacional ni de propósito general, sino un artefacto de investigación sobre planificación y destilación en entornos de juego. Su utilidad práctica fuera del Tetris es escasa, pero sirve como referencia metodológica para aplicar modelos tipo BERT a tareas de decisión secuencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT-large, modelo base Laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de `MAX_LEN` y `HEAD_MAX_LEN` definidos en el código del repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Laya, un ModernBERT-large de 421M parámetros. ModernBERT es una arquitectura encoder-only que incorpora mejoras sobre BERT clásico como attention lineal (alternando capas con atención local y global), rotary positional embeddings y un contexto más largo, aunque en esta ficha no se dispone del detalle exacto de la ventana utilizada. Sobre esta base se aplica un ajuste fino parcial: solo se actualizan las 8 capas superiores del encoder (de 28 totales) y la cabeza de decisión, lo que suma 124M parámetros entrenables.

El entrenamiento consiste en destilación con etiquetas suaves: se calcula la entropía cruzada contra `softmax(teacher_scores / 2.0)`, donde el profesor es el bot heurístico El-Tetris. Se usaron 15.000 posiciones y 1.336 pasos de optimización, con un coste aproximado de 3 horas en un Apple M2. La formulación de la tarea convierte cada turno en una pregunta de elección (`choice`) con 10 opciones preseleccionadas por una heurística que no usa al profesor; cada opción se describe con metadatos como rotación, columna, líneas eliminadas, agujeros, altura de aterrizaje, altura máxima y rugosidad. Esto implica que el modelo no lee únicamente el tablero crudo, sino que también recibe resúmenes numéricos de cada movimiento candidato.

## Capacidades

- Juego de Tetris mediante selección de movimiento entre 10 candidatos preseleccionados.
- Comprensión de estados de tablero representados como texto con filas de `#` y `.`.
- Razonamiento sobre metadatos estructurados de cada colocación (rotación, columna, líneas eliminadas, agujeros, alturas, rugosidad).
- Selección de respuesta tipo `choice` dentro de la interfaz de la librería `laya`.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso general.
- No dispone de capacidades multilingües documentadas, visión, audio ni modo de pensamiento.
- No está diseñado como agente autónomo más allá del bucle de juego implementado en el repositorio.

## Casos de uso

- Investigación sobre destilación de políticas: el modelo sirve como caso de estudio reproducible de destilación con etiquetas suaves desde un profesor heurístico a un encoder de 421M, con código y pesos publicados.
- Benchmark de planificación en entornos discretos: permite evaluar cómo un modelo de lenguaje encoder-only maneja decisiones secuenciales con estado textual y opciones estructuradas.
- Docencia y divulgación: el bucle de juego y el formato de pregunta son lo bastante simples para explicar conceptos de imitación, shortlisting y evaluación por acuerdo con el profesor.
- Pruebas de integración con la librería `laya`: sirve para validar flujos de carga de modelo, configuración de `max_len`/`head_max_len` y predicción tipo `choice`.
- Experimentos de ablación: al estar solo 8 de 28 capas entrenadas, es un punto de partida para estudiar qué capas bastan para aprender una política concreta.
- Demostraciones interactivas de juego automático: el script `watch.py` permite visualizar partidas en local con un coste de unos 170 ms por movimiento en un Apple M2.
- Reproducción de resultados: con semillas fijas y el código publicado, se pueden replicar las 3 partidas de 500 piezas reportadas y verificar la tasa de acuerdo del 84,3 % con el profesor.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los resultados de juego del propio autor, no benchmarks estándar de NLP.

| Politica | Lineas eliminadas (500 piezas, 3 partidas) | Se bloquea | Acuerdo con el profesor |
|---|---|---|---|
| Laya sin ajustar | 0 | en ~30 piezas | 11,9 % |
| Laya Tetris (este modelo) | 198 de media (197–199) | nunca | 84,3 % |
| Profesor (El-Tetris) | ~200 (máximo para 500 piezas) | nunca | 100 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 421M parámetros en safetensors, en fp32 ocuparía aproximadamente 1,7 GB de pesos, y en fp16 alrededor de 0,85 GB, a lo que habría que sumar activaciones y overhead del runtime.
- GPU recomendadas: no se especifican; el autor reporta ejecución en Apple M2 con unos 170 ms por movimiento.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más de VRAM en fp16, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería `laya` con el repositorio `justforfun0906/Laya_tetris`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~170 ms por movimiento en Apple M2 según el autor; no se reportan cifras de throughput por lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la información proporcionada. Como referencia estructural, se puede contrastar con el modelo base y con el profesor heurístico:

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya Tetris | 421M (124M entrenados) | no disponible | 198 líneas de media, 84,3 % de acuerdo | Apache-2.0 | Hugging Face |
| Laya (base) | 421M | no disponible | 0 líneas, se bloquea en ~30 piezas | Apache-2.0 | Hugging Face |
| El-Tetris (profesor heurístico) | no aplica (heurística) | no aplica | ~200 líneas, 100 % de acuerdo | no disponible | Repositorio del autor |

## Limitaciones y advertencias

- Evaluación muy limitada: solo 3 partidas de 500 piezas; no hay evidencia de comportamiento en partidas más largas ni en otras semillas.
- El modelo no lee únicamente el tablero crudo: las opciones incluyen resúmenes numéricos (agujeros, alturas, rugosidad), por lo que parte de la información la aporta el formateador, no el modelo.
- Solo puede elegir entre las 10 colocaciones preseleccionadas por la heurística de shortlisting; no explora el espacio completo de movimientos.
- No hay datos sobre sesgos, alucinación o comportamiento fuera de la tarea de Tetris; no debe usarse como modelo de propósito general.
- Idiomas soportados no documentados; no se recomienda su uso para tareas de texto en producción.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el código del repositorio deben revisarse por separado para cumplir sus términos.
- El rendimiento reportado depende del formateo exacto de la pregunta y de los parámetros `MAX_LEN` y `HEAD_MAX_LEN`; cambios en el formato pueden degradar los resultados.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia estándar más allá de la librería `laya`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/justforfun0906/laya-tetris
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio de código y detalles de entrenamiento: https://github.com/justforfun0906/Laya_tetris

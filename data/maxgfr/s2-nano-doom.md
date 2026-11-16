# maxgfr/s2-nano-doom

## Resumen

s2-nano-doom es un modelo de decisión de dominio muy restringido desarrollado por maxgfr, pensado para controlar un shooter en primera persona de estilo Doom sobre una cuadrícula, renderizado con arte de Freedoom. No es un modelo de lenguaje generativo al uso: recibe 14 números medidos del estado del juego cada 4 ticks y emite una de 8 acciones posibles. Forma parte de la familia s2 (system-one), una arquitectura de decisión con salidas tempranas y pesos ternarios, y es una especialización del modelo base s2-nano (1.532.033 parámetros).

El modelo es extremadamente pequeño: 596.737 parámetros totales y un fichero GGUF de aproximadamente 702 KB, lo que lo convierte en un ejemplo de inferencia de latencia ultrabaja (740 µs en nativo y 1.282 µs en WASM sobre Apple M5 para una consulta). Su relevancia no está en capacidades generales, sino en demostrar que un modelo ternario minúsculo, entrenado con QAT y DAgger, puede igualar a un oráculo en una tarea de control concreta.

Se distribuye únicamente como pesos GGUF para el motor propio skycmd (Rust, con soporte para navegador, Node, Python, CLI y servidor). No es un modelo utilizable fuera de ese ecosistema ni para tareas de NLP generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | s2 (system-one), transformer de decisión con salidas tempranas (early-exit) y pesos ternarios |
| Parametros totales | 596.737 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 14 números de estado) |
| Tipos de cuantizacion | ternario (pesos ternarios incluidos en el GGUF) |
| Idiomas soportados | en (etiqueta de la model card; el modelo no procesa texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura s2 es un modelo de decisión con supervisión profunda sobre las salidas tempranas (deep supervision over the exits), lo que permite resolver la inferencia en una de las primeras capas según la confianza. Los pesos son ternarios, obtenidos mediante quantisation-aware training (QAT). El modelo base s2-nano tiene 1.532.033 parámetros; esta variante especializada reduce el tamaño a 596.737 parámetros.

El entrenamiento se realizó desde cero en Rust con mlx-rs sobre Apple Silicon (script `scripts/train-doom.sh`). El pipeline incluye preentrenamiento numérico con masked-language modelling, entrenamiento de decisión con supervisión profunda, QAT ternario y rondas de DAgger específicas del juego Doom-like. Los datos combinan conjuntos de decisión tipados de s2, datasets clásicos convertidos en preguntas tipadas y estados de juego etiquetados por oráculos exactos; parte de los datos se generó con GLM-5.3-Flash (MIT). Las licencias de datos se detallan en `DATA_LICENSES.md` del repositorio.

Una innovación destacable del sistema es el veto de reflejos codificado: reglas deterministas que anulan movimientos hacia bolas de fuego y disparos con el arma vacía, complementando la salida del modelo.

## Capacidades

- Decisión de acción en un shooter en primera persona sobre cuadrícula: selecciona una de 8 acciones a partir de 14 números de estado.
- Control de movimiento y disparo con veto de reflejos para situaciones de peligro inmediato.
- Inferencia de latencia ultrabaja (740 µs nativo, 1.282 µs en WASM).
- Ejecución en múltiples entornos del motor skycmd: navegador, Node, Python, CLI y servidor.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingües.
- No procesa texto libre ni imágenes; su entrada es exclusivamente numérica y estructurada.

## Casos de uso

- Investigación en modelos de decisión ternarios: sirve como banco de pruebas reproducible para estudiar QAT ternario, salidas tempranas y DAgger en una tarea de control cerrada.
- Docencia y divulgación de arquitecturas system-one: el tamaño (702 KB) y el código en Rust permiten ejecutarlo y analizarlo en un portátil sin GPU dedicada.
- Benchmark de latencia en WASM: útil para medir el coste de inferencia de modelos minúsculos en navegador frente a nativo.
- Prototipado de agentes de juego con veto de reflejos: el patrón de combinar un modelo aprendido con reglas deterministas de seguridad es trasladable a otros entornos de control.
- Validación de pipelines de entrenamiento en Rust (mlx-rs): el script de entrenamiento y el formato de peticiones sirven de referencia para replicar el flujo completo.
- Demostración interactiva en Hugging Face Spaces: el demo público permite evaluar el comportamiento del modelo en el juego sin instalación local.

## Benchmarks y rendimiento

Resultados en bucle cerrado con `sky-arena`, 50 episodios por juego, semilla 7:

| Juego | Resultado |
|---|---|
| Doom-like | 100 % de finalización, tasa de bajas 0,75 (= oráculo), 0 muertes |
| Flappy Drone | 197,6 tuberías de media (2 choques en 50) |
| Obstacle Dodge | 72 % (oráculo 78 %) |

Latencia de una consulta Doom: 740 µs en nativo y 1.282 µs en WASM (Apple M5).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (fichero GGUF de ~702 KB); cabe en cualquier GPU, CPU o incluso en memoria de un navegador.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin problema. Los tiempos reportados se midieron en Apple M5.
- Cabe en cualquier GPU de consumo e integrada; también en entornos WASM y Node.
- Despliegue: exclusivamente mediante el motor skycmd (`sky-serve`, `skycmd decide`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 740 µs nativo y 1.282 µs en WASM por consulta (Apple M5). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s2-nano-doom | 596.737 | no disponible | Decisión en shooter Doom-like | apache-2.0 | GGUF en HF, motor skycmd |
| s2-nano | 1.532.033 | no disponible | Decisión general (familia s2) | no disponible en la información | HF (maxgfr/s2-nano) |
| Modelos de RL para juegos (p. ej. agentes Doom basados en PPO) | variable, típicamente millones | no aplica | Control de juego | variable | frameworks como ViZDoom |

La comparación con modelos de NLP de tamaño similar no es significativa, ya que s2-nano-doom no procesa lenguaje. Frente a agentes de RL convencionales para Doom, la diferencia clave es el tamaño (tres órdenes de magnitud menor) y la latencia en microsegundos, a costa de estar limitado a un único entorno y a una representación de estado fija de 14 números.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo funciona en el juego Doom-like de skycmd; no es reutilizable para otras tareas sin reentrenamiento.
- Entrada fija de 14 números: no acepta texto, imágenes ni secuencias variables.
- Dependencia total del motor skycmd; no hay soporte para runtimes de inferencia estándar.
- Riesgo de sobreajuste al oráculo y a la semilla de evaluación (semilla 7, 50 episodios); la generalización a otras configuraciones no está documentada.
- El veto de reflejos es código determinista, no parte del modelo; su comportamiento en producción depende de esa capa externa.
- Sesgos y alucinaciones en el sentido de NLP no aplican, pero el modelo puede fallar en estados no vistos durante el entrenamiento (DAgger mitiga parcialmente este riesgo).
- Licencia apache-2.0 permisiva para uso comercial, pero las licencias de los datos de entrenamiento deben consultarse en `DATA_LICENSES.md`; el arte de Freedoom es BSD-3-Clause y no incluye activos de id Software.
- Idiomas: solo etiquetado como `en`; sin capacidades multilingües reales.
- Descargas muy bajas (11) y ausencia de likes: ecosistema pequeño, poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s2-nano-doom
- Modelo base s2-nano: https://huggingface.co/maxgfr/s2-nano
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/maxgfr/s2-nano-doom
- Código fuente (Rust): https://github.com/maxgfr/skycmd
- Tutorial, capítulo 18 (shooter Doom-like): https://maxgfr.github.io/skycmd/tutorial/18-doom
- Guía de instalación: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md
- Arte Freedoom: https://github.com/freedoom/freedoom

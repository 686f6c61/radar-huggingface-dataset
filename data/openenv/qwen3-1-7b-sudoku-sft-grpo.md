# openenv/Qwen3-1.7B-Sudoku-SFT-GRPO

## Resumen

Qwen3-1.7B-Sudoku-SFT-GRPO es un ajuste fino del modelo Qwen3-1.7B de Alibaba, especializado en resolver puzles de Sudoku mediante interacción con un entorno de herramientas. Lo desarrolla el equipo de OpenEnv, un proyecto centrado en entrenamiento por refuerzo con entornos ejecutables, y se publica como ejemplo de referencia del flujo SFT + GRPO documentado en su tutorial. El modelo no es un asistente generalista: está entrenado para rellenar celdas de un tablero llamando a una herramienta `place(row, col, number)` y emitiendo un razonamiento breve antes de cada movimiento.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros (1,72 mil millones) con soporte de modo "thinking". Sobre esa base se aplicó primero un SFT corto (openenv/Qwen3-1.7B-Sudoku-SFT) y después GRPO con TRL, partiendo de un entorno con 55 pistas (unas 26 celdas vacías). El resultado es un modelo que pasa de no resolver ningún puzle a resolver 26 de 30 en el nivel de 16 celdas vacías y 22 de 30 en el de 26 celdas vacías, en evaluación greedy.

Su relevancia es doble: por un lado demuestra que el RL con recompensas verificables sobre entornos reales mejora sustancialmente el razonamiento estructurado de un modelo pequeño; por otro, sirve como plantilla reproducible (script `grpo.py`, curvas en Trackio, juegos registrados) para quien quiera entrenar agentes con tool calling sobre entornos propios. El repositorio ocupa 24,1 GB e incluye checkpoints intermedios en el historial de commits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo thinking; ajustado con SFT + GRPO |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | openenv/Qwen3-1.7B-Sudoku-SFT (a su vez, fine-tune de Qwen/Qwen3-1.7B) |
| Libreria | transformers |
| Versiones del framework | TRL 1.16.0, OpenEnv 0.10.0, Transformers 5.21.1, PyTorch 2.11.0 |
| Tamano del repositorio | 24,1 GB |
| Descargas | 326 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso con modo de razonamiento explícito ("thinking"). El pipeline de entrenamiento tiene dos fases. Primero, un SFT corto que enseña al modelo el formato de interacción con el entorno de Sudoku: emitir un razonamiento breve y luego una llamada a la herramienta `place(row, col, number)`, una celda por llamada. Después, GRPO (Group Relative Policy Optimization) implementado con TRL mediante `environment_factory`, partiendo del modelo SFT.

Los detalles del entrenamiento GRPO están documentados: 4 prompts × 16 partidas por paso, thinking activado, learning rate constante de 1e-6, `max_completion_length=16384`, `vllm_importance_sampling_mode="token_truncate"` y vLLM colocado en el mismo nodo. Se usan dos recompensas: 1 si el puzle se resuelve por completo, más la fracción de celdas vacías rellenadas correctamente. El entrenamiento se ejecutó en una única A100 de 80 GB durante unas 15 horas (38 USD) hasta el paso 75, que es el checkpoint publicado. El repositorio conserva además los checkpoints de los pasos 25 y 50 en el historial de commits, y la carpeta `completions/` con todos los juegos registrados. La evaluación se hizo sobre 30 puzles por nivel generados con el generador de TextArena.

Una innovación destacable es el uso de un entorno con verificación estricta: un dígito que no corresponde a la solución se rechaza, y dos movimientos rechazados consecutivos terminan la partida. Esto convierte el Sudoku en una tarea de recompensa verificable, ideal para RL. La model card advierte de una incidencia: el Space cerró sus WebSockets aproximadamente cada 2 horas durante la ejecución y el cliente de OpenEnv reconectó a sesiones nuevas en mitad de algunas partidas, de modo que los pasos 26, 74 y 75 se entrenaron parcialmente con partidas corruptas. El script de ejemplo ya abre una conexión nueva por partida.

## Capacidades

- Resolución de puzles de Sudoku mediante tool calling: rellena una celda por llamada a `place(row, col, number)`.
- Razonamiento previo a cada movimiento en modo thinking, con un presupuesto de 384 tokens nuevos por movimiento en la evaluación publicada.
- Cumplimiento estricto de un protocolo de herramienta con validación de movimientos por parte del entorno.
- Juego multi-turno dentro de una sesión de entorno: el modelo recibe el estado del tablero y respuestas de la herramienta en cada paso.
- Capacidades generales de Qwen3-1.7B (generación de texto, razonamiento, código) potencialmente presentes por herencia del modelo base, aunque no evaluadas ni documentadas en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni agentes generalistas fuera del entorno de Sudoku.

## Casos de uso

- Evaluación de pipelines de RL con recompensas verificables: el modelo sirve como referencia reproducible para comparar SFT frente a SFT + GRPO en una tarea con solución única, usando `evaluate.py` y los ficheros `puzzles_c55.json` y `puzzles_c65.json`.
- Plantilla para entrenar agentes con tool calling sobre entornos propios: el script `grpo.py` y la integración con `environment_factory` de TRL muestran cómo conectar un entorno OpenEnv, definir recompensas y lanzar GRPO con vLLM colocado.
- Docencia y divulgación de RL para LLM: el tutorial de OpenEnv sobre Sudoku y las curvas de Trackio permiten explicar de forma completa el ciclo SFT, definición de recompensas, entrenamiento y evaluación con datos reales.
- Investigación sobre razonamiento estructurado en modelos pequeños: permite estudiar cuánto puede mejorar un modelo de 1,72 mil millones de parámetros en una tarea de búsqueda con restricciones cuando se le da un presupuesto de thinking acotado (384 tokens por movimiento).
- Generación de datos sintéticos de partidas resueltas: la carpeta `completions/` y el script de evaluación pueden producir trazas de juego etiquetadas para entrenar o evaluar otros modelos.
- Pruebas de robustez de entornos y clientes: la incidencia documentada con los WebSockets del Space convierte este caso en un ejemplo útil para diseñar reconexiones y sesiones aisladas por partida en infraestructuras de RL.
- Despliegue de demostraciones interactivas de agentes: al ser compatible con text-generation-inference y endpoints, puede servirse como demo de un agente que juega al Sudoku paso a paso.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, en evaluación greedy sobre 30 puzles por nivel, con thinking activado (384 tokens nuevos por movimiento) para los modelos entrenados y desactivado para el base:

| Modelo | 16 celdas vacias: resueltos | 16 celdas vacias: celdas rellenadas | 26 celdas vacias: resueltos | 26 celdas vacias: celdas rellenadas |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 0/30 | 1,9 % | 0/30 | 0,1 % |
| Qwen3-1.7B-Sudoku-SFT | 19/30 | 79,1 % | 10/30 | 55,8 % |
| Qwen3-1.7B-Sudoku-SFT-GRPO (este modelo) | 26/30 | 87,5 % | 22/30 | 83,2 % |

Notas sobre la medición: el modelo base, con thinking activado, no termina de razonar dentro del presupuesto de 384 tokens y nunca llega a mover, por lo que se evaluó sin thinking. Cada modelo se entrenó una sola vez, así que los números corresponden a una única ejecución. No se publican resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,5 GB solo para pesos (1,72 mil millones de parámetros), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de contexto y lote.
- Cuantización: no se publican versiones GGUF ni cuantizadas; podría generarse una conversión propia, pero no está documentada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en lote pequeño; A100 80GB, H100 o RTX 4090 son holgadas. El entrenamiento original usó una única A100 de 80 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16; en GPUs de 8 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM se usó durante el entrenamiento y es viable para servir. No se documentan Ollama ni llama.cpp por falta de pesos GGUF.
- Latencia y throughput: no disponibles. La evaluación usa 384 tokens nuevos por movimiento y `max_completion_length=16384` durante el entrenamiento, lo que da una idea del orden de magnitud del coste por partida, pero no se publican métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Resultado Sudoku (26 vacias) | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-Sudoku-SFT-GRPO | 1,72 mil millones | no disponible | Sudoku con tool calling | 22/30 resueltos, 83,2 % celdas | no disponible |
| Qwen3-1.7B-Sudoku-SFT | 1,72 mil millones | no disponible | Sudoku con tool calling | 10/30 resueltos, 55,8 % celdas | no disponible |
| Qwen3-1.7B (base) | 1,72 mil millones | no disponible | Generacion general | 0/30 resueltos, 0,1 % celdas | Apache 2.0 (segun el modelo original de Qwen; no confirmado en esta ficha) |

No se dispone de información sobre otros modelos especializados en Sudoku con los que comparar directamente. La comparación más informativa es interna: el GRPO sobre el SFT multiplica por más de dos los puzles resueltos en el nivel difícil (de 10/30 a 22/30) y eleva el porcentaje de celdas rellenadas del 55,8 % al 83,2 %.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el entorno de Sudoku de OpenEnv y el protocolo `place(row, col, number)`; no debe usarse como asistente general sin validación previa.
- Licencia no especificada: la model card indica `licence: license` sin términos concretos, por lo que el uso comercial no está claro y requiere consultar el modelo base y el repositorio de OpenEnv.
- Datos de entrenamiento parcialmente corruptos: los pasos 26, 74 y 75 se entrenaron en parte con partidas interrumpidas por reconexiones de WebSocket, lo que puede introducir comportamientos anómalos en estados de juego poco frecuentes.
- Una sola ejecución de entrenamiento por modelo: los resultados publicados no incluyen intervalos de confianza ni repeticiones, así que deben tomarse como indicativos.
- Dependencia del presupuesto de thinking: con 384 tokens nuevos por movimiento el modelo funciona; con el modelo base el mismo presupuesto impide completar el razonamiento, lo que sugiere sensibilidad al límite de tokens.
- Riesgo de alucinación en el razonamiento: aunque el entorno rechaza dígitos incorrectos, el texto de razonamiento previo a cada movimiento no está verificado y puede contener justificaciones erróneas.
- Sesgos e idiomas: no hay información publicada sobre sesgos, composición del dataset de SFT ni cobertura lingüística; se desconoce el comportamiento fuera del inglés técnico del entorno.
- Advertencia de producción: al ser un modelo de demostración de OpenEnv, no hay garantías de soporte, mantenimiento ni versionado a largo plazo.
- El repositorio pesa 24,1 GB por incluir checkpoints intermedios y trazas de partidas; la descarga completa no es necesaria para usar solo los pesos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT-GRPO
- Modelo base del ajuste: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT
- Modelo original: https://huggingface.co/Qwen/Qwen3-1.7B
- Entorno de Sudoku en HuggingFace Spaces: https://huggingface.co/spaces/openenv/sudoku
- Tutorial de OpenEnv sobre Sudoku y GRPO: https://huggingface.co/docs/openenv/tutorials/sudoku-grpo
- Repositorio de OpenEnv con los ejemplos de Sudoku (script `grpo.py`, `evaluate.py`, puzles): https://github.com/openenv/OpenEnv/tree/main/examples/sudoku
- Curvas de entrenamiento en Trackio: https://huggingface.co/spaces/openenv/sudoku-runs

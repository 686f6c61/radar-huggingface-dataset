# kdcyberdude/ghostrun-smb-policy-v1

## Resumen

ghostrun-smb-policy-v1 es una política neuronal desarrollada por el usuario kdcyberdude que completa Super Mario Bros. de NES desde el nivel 1-1 hasta el 8-4 en orden, partiendo de un reinicio limpio, en 10.626 decisiones (aproximadamente 22 minutos de tiempo de juego). Se trata de una red convolucional pequeña de en torno a 2,04 millones de parámetros que actúa como jugador de referencia para la reconstrucción del juego en Three.js conocida como GhostRun. El modelo no es un agente de propósito general: es un controlador especializado en una única ruta de speedrun sobre un emulador concreto.

El modelo combina aprendizaje por imitación (behavior cloning sobre aproximadamente 1,07 millones de muestras de demostración durante 100 épocas) con un ajuste fino mediante PPO que incorpora un término de demostración (BCE). No es, por tanto, RL puro: la mayor parte del comportamiento proviene de las demostraciones y el PPO refina la política con una recompensa escasa (+1 por nivel superado, −1 por muerte, +5 por victoria final, −0,001 por segundo).

Su relevancia es acotada pero clara para quienes investigan agentes sobre emuladores retro: ofrece un checkpoint reproducible, un export ONNX listo para inferencia en CPU y una arquitectura mínima y legible (`RobustPolicy`) que sirve como referencia para experimentos de imitación y RL en entornos deterministas. No obstante, su sensibilidad al timing del emulador y su falta de diversidad limitan seriamente su uso fuera del entorno exacto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (`RobustPolicy`): 3 convoluciones + capa de 512 unidades para píxeles, capa de 256 unidades para historial de acciones, tronco de 512 unidades |
| Parametros totales | Aproximadamente 2,04 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 frames RGB de 128×128 + 128 máscaras de controlador aplicadas (10 bits cada una, con bit de validez) |
| Tipos de cuantizacion | No disponible (export ONNX en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), ONNX (`actor.onnx`), JSON de configuración y ruta (`smb_v1_all32_route.json`) |

## Arquitectura y entrenamiento

`RobustPolicy` es una red convolucional que recibe como entrada las últimas 4 frames RGB a resolución 128×128 y las últimas 128 máscaras de controlador aplicadas (10 bits por máscara, con un bit de validez). Tres convoluciones procesan los píxeles hasta una capa de 512 unidades; una capa separada de 256 unidades procesa el historial de acciones; ambas se combinan en un tronco de 512 unidades. La salida son 10 logits independientes, uno por botón (arriba, abajo, izquierda, derecha, A, B, X, Y, start, select), más una estimación de valor. El modelo actúa a 8 decisiones por segundo emulado y cada decisión mantiene los botones pulsados durante 7 u 8 frames.

El entrenamiento se realizó en dos fases: primero, behavior cloning durante 100 épocas sobre aproximadamente 1,07 millones de muestras de demostración; después, ajuste fino con PPO incorporando un término de demostración (BCE). El run acumuló 72.530 actualizaciones (69.000 de ellas de experto) sobre 452 rollouts y 729 episodios, con una mezcla de demostraciones que cubría juego nominal, anclas, recuperaciones y datos históricos. La recompensa de PPO fue +1 por nivel superado, −1 por muerte, +5 por victoria final y −0,001 por segundo. El código de entrenamiento (el pipeline anterior `fast_mario`) no forma parte del repositorio; solo se incluye la arquitectura.

## Capacidades

- Control de Super Mario Bros. de NES mediante pulsaciones de botones discretas (10 botones independientes).
- Completar los 32 niveles del juego en orden (1-1 a 8-4) desde un reinicio limpio en modo greedy, en 10.626 decisiones.
- Procesamiento de entrada visual a partir de frames RGB de 128×128 con historial de 4 frames.
- Memoria de corto plazo del historial de acciones mediante las últimas 128 máscaras de controlador.
- Inferencia determinista en modo greedy desde reinicios limpios.
- Export a ONNX para ejecución en CPU en un reproductor independiente.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento.

## Casos de uso

- Referencia para reconstrucciones del juego: el modelo sirve como jugador de referencia verificable para validar la fidelidad de una reimplementación del motor de Super Mario Bros., como la reconstrucción en Three.js de GhostRun, comparando la ruta aplicada tick a tick contra `smb_v1_all32_route.json`.
- Investigación en aprendizaje por imitación: el checkpoint y la configuración permiten estudiar cómo el behavior cloning sobre 1,07 millones de muestras seguido de PPO con término BCE produce políticas deterministas en entornos con recompensa escasa.
- Benchmark de agentes en emuladores retro: al completar los 32 niveles en 10.626 decisiones, ofrece una línea base cuantitativa para comparar nuevos agentes sobre el mismo emulador y configuración de frames.
- Despliegue ligero en CPU: el export `actor.onnx` de 8,1 MB permite ejecutar la política en un reproductor independiente sin GPU, útil para demos interactivas o entornos con recursos limitados.
- Estudio de robustez ante timing: la sensibilidad documentada al timing del emulador (desincronización en NeSLE al variar el offset de arranque entre 0 y 40 frames) lo convierte en un caso de estudio sobre la fragilidad de políticas entrenadas en un emulador concreto.
- Docencia sobre RL híbrido: la separación entre checkpoint de entrenamiento (`.pt`, 27,9 MB con cabeza de valor y estado) y actor exportado permite ilustrar el flujo completo de entrenamiento, exportación y evaluación de una política.
- Análisis de recuperación tras muerte: los resultados documentados (0/3 en recuperación tras muertes reales, game over en la decisión 573) permiten estudiar los límites de políticas entrenadas principalmente por imitación.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Partidas greedy desde reinicio limpio | 3/3 completan los 32 niveles en orden |
| Decisiones por partida | 10.626 |
| Deteccion nativa de victoria final | Si |
| Verificacion | 2026-10-31; reproducido 3/3 el 2026-11-05 |
| Juego estocastico | 0/3 victorias (cada partida supera un nivel y muere) |
| Recuperacion tras muertes reales | 0/3; game over en la decision 573 tras tres muertes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por tratarse de un modelo de control y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el actor ONNX ocupa 8,1 MB y el checkpoint completo 27,9 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; cualquier GPU moderna (RTX 4090, RTX 3060, etc.) o A100/H100 ejecutarían la inferencia con latencia despreciable, pero el modelo está pensado para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en CPU sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime para `actor.onnx` en CPU; PyTorch para el checkpoint `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible; el modelo opera a 8 decisiones por segundo emulado, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostrun-smb-policy-v1 | ~2,04 M | 4 frames RGB 128×128 + 128 máscaras | Super Mario Bros. NES, ruta completa 1-1 a 8-4 | MIT | Hugging Face (repo propio) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo sigue una única ruta y tiene poca diversidad de comportamiento; no generaliza a otras rutas ni a variaciones del juego.
- Es sensible al timing del emulador: sus frames son cortes de 29.781 ciclos del núcleo de nes_py, no frames de PPU. La ruta registrada no se reproduce en NeSLE: un barrido de offset de arranque de 0 a 40 frames desincroniza en el mundo 1.
- El modo estocástico falla: 0/3 victorias, con cada partida limitada a un nivel antes de morir.
- La recuperación tras muertes reales no está cualificada: 0/3, con game over en la decisión 573 tras tres muertes.
- Los reinicios limpios son deterministas, por lo que repetirlos solo demuestra consistencia de ejecución, no variedad.
- No es RL puro: depende en gran medida del behavior cloning sobre demostraciones, lo que limita la exploración.
- El código de entrenamiento (pipeline `fast_mario`) no forma parte del repositorio; solo se incluye la arquitectura, lo que dificulta la reproducción completa del entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el modelo está ligado a un entorno y emulador concretos, lo que restringe su aplicabilidad práctica.
- Riesgo de alucinación no aplicable (no es un modelo generativo de lenguaje); el riesgo equivalente es la desincronización y el fallo silencioso ante cambios de timing.
- No se documentan sesgos en el sentido habitual; el comportamiento está sobreajustado a una ruta y a un emulador específicos.

## Enlaces

- Hugging Face: https://huggingface.co/kdcyberdude/ghostrun-smb-policy-v1
- Repositorio de entrenamiento GhostRun training lab: no disponible como URL en la informacion proporcionada
- Paper, blog o demo: no disponible

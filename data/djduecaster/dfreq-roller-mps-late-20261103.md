# djduecaster/dfreq-roller-mps-late-20261103

## Resumen

dfreq-roller-mps-late-20261103 es un controlador neuronal para robótica de locomoción tipo *roller* (patines o ruedas) entrenado mediante PPO con recorte (*clipped PPO*) sobre MuJoCo/BAM, exportado en formato ONNX y distribuido con la librería `microduck`. Lo publica el usuario djduecaster y se corresponde con la iteración congelada `iteration40` de una línea de trabajo interna. El modelo no es un LLM: es una política de control que mapea 61 observaciones float32 a 14 desplazamientos de acción float32, operando a 50 Hz.

El interés técnico reside en su carácter de export de inferencia puro y minimalista: solo se han entrenado 1.806 parámetros de la capa de salida, mientras que los pesos neuronales previos y las constantes de realimentación heredadas permanecen sin cambios. El autor documenta resultados locales de evaluación (2,726 s con 5/5 finalizaciones a comando 1.1; 128/128 en *held-out* y 64/64 en *stress*), aunque explícitamente no reclama superioridad frente a su especialista publicado de 2,570 s.

Es relevante ahora únicamente dentro del nicho de investigación en control robótico simulado: sirve como artefacto reproducible de una iteración concreta, con SHA256 declarado y sin dependencias de semilla, reloj, posición global ni entradas privilegiadas. No hay evidencia de despliegue en robot real ni de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (detalles de capas no disponibles); export ONNX |
| Parametros totales | 1.806 parámetros entrenados en la capa de salida (total del modelo no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (export en float32) |
| Idiomas soportados | No aplica |
| Licencia | No disponible (se referencia `LICENSE-NOTE.txt` en el repo, no incluido en la información) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política es un controlador neuronal que consume 61 observaciones float32 y produce 14 offsets de acción float32, ejecutado a 50 Hz. El entrenamiento combina rollouts completos de episodio en MuJoCo/BAM sobre CPU ("Native CPU3 original") con PPO recortado sobre MPS (Apple Metal Performance Shaders). En esta iteración (`iteration40`) solo se actualizaron 1.806 parámetros de la capa de salida; los pesos neuronales anteriores y las constantes de realimentación heredadas se mantuvieron congelados, lo que convierte el artefacto en un ajuste fino de la cabeza de salida sobre una política base preexistente.

El autor declara que no se añaden entradas de semilla, reloj, posición global, búsqueda por inicio (*per-start lookup*) ni entradas privilegiadas de política, y que la física original, la preparación, los actuadores, las observaciones y la terminación se conservan. La evaluación se realizó en la Arena original local a comando 1.1, con resultados separados en *held-out* (128/128) y *stress* (64/64) sobre comandos 1.0 y 1.2. El SHA256 del modelo es `2b463b01c5c0720ae2004d416c9a974984f63de183db4e3e3205b2093703aada`. No se especifican número de tokens, composición del dataset ni detalles de la arquitectura interna más allá de la existencia de una capa de salida entrenable.

## Capacidades

- Control de locomoción tipo *roller* en simulación MuJoCo/BAM a 50 Hz.
- Mapeo determinista de 61 observaciones float32 a 14 offsets de acción float32.
- Inferencia vía ONNX, con integración declarada en la librería `microduck`.
- Generalización limitada a comandos de velocidad en el rango 1.0–1.2 según las pruebas *held-out* y *stress*.
- Sin entradas privilegiadas: no usa semilla, reloj, posición global ni *lookup* por inicio.
- No soporta *tool calling*, agentes, razonamiento multi-paso, multilingüismo, visión ni audio (no es un modelo de lenguaje).

## Casos de uso

- Investigación en control con PPO: servir como artefacto de referencia reproducible de una iteración concreta, con SHA256 y resultados de validación declarados, para comparar contra políticas base en MuJoCo/BAM.
- *Benchmarking* interno de pipelines de entrenamiento: el export ONNX permite medir latencia y throughput de inferencia en CPU/MPS sin cargar el stack de entrenamiento completo.
- Estudio de ajuste fino de cabeza de salida: con solo 1.806 parámetros actualizados, es un caso práctico para analizar cuánto rendimiento se gana congelando el resto de la red.
- Validación de no inferioridad: los *gates* documentados (5/5 finalizaciones, 128/128 *held-out*, 64/64 *stress*) sirven como plantilla de evaluación estadística para nuevas iteraciones.
- Integración en simuladores de terceros vía ONNX: al no depender de entradas privilegiadas, el controlador puede portarse a otros entornos que repliquen las 61 observaciones y los 14 offsets.
- Docencia en robótica simulada: ejemplo compacto de política PPO con recorte exportada a ONNX para ilustrar el ciclo entrenamiento–export–evaluación.
- No apto para despliegue en robot real: el autor declara explícitamente "simulation-only" y no emite ninguna garantía de seguridad.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de evaluación (Arena original, comando 1.1) | 2,726 s | 5/5 finalizaciones, evaluación local |
| *Held-out* | 128/128 finalizaciones | Comandos 1.0 y 1.2 |
| *Stress* | 64/64 finalizaciones | Comandos 1.0 y 1.2 |
| Comparación con especialista publicado | 2,570 s (más rápido en sus inicios prescritos) | El autor no reclama nuevo récord personal |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con políticas de terceros.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una política de 1.806 parámetros entrenados y export ONNX en float32, con huella de memoria despreciable.
- GPU recomendadas: no se especifican; el entrenamiento se realizó sobre MPS (Apple Silicon) y los rollouts en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: ONNX Runtime (formato declarado); la librería `microduck` es la vía de integración indicada por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; solo se reporta el tiempo de episodio completo en evaluación (2,726 s), no latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-mps-late-20261103 | 1.806 entrenados en capa de salida | No aplica | 2,726 s (5/5) en Arena local | No disponible | HuggingFace (0 descargas) |
| Especialista publicado por el mismo autor (2,570 s) | No disponible | No aplica | 2,570 s en sus inicios prescritos | No disponible | Referenciado en la model card, no enlazado |
| Políticas base heredadas (`upstream-base-card.md`) | No disponible | No aplica | No disponible | Documentada en el repo | Referenciada, no enlazada |

No se dispone de información sobre políticas comparables de terceros (por ejemplo, controladores de locomotion publicados en MuJoCo) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que no hay despliegue en robot real ni garantía de seguridad.
- Licencia no disponible: los derechos de los pesos heredados se documentan en `LICENSE-NOTE.txt` y `upstream-base-card.md`, pero no se incluye su contenido; las actualizaciones propias no relicencian los pesos heredados, lo que impide asumir uso comercial.
- Superioridad no demostrada: los *gates* de no inferioridad se superaron, pero la superioridad no se estableció; el especialista de 2,570 s es más rápido en sus inicios prescritos.
- Generalización acotada: las pruebas se limitan a comandos 1.0–1.2; no hay datos fuera de ese rango.
- Cero tracción externa: 0 descargas y 0 *likes* en el momento de la ficha; sin validación independiente.
- Datos privados excluidos: el entrenamiento, las trazas, los checkpoints y las credenciales no se publican, lo que limita la reproducibilidad completa.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco se documenta comportamiento fuera de distribución.
- Repo de 0,0 GB: el tamaño real de los artefactos no se refleja en la metadata; conviene verificar el contenido antes de asumir que el ONNX está incluido.

## Enlaces

- HuggingFace: https://huggingface.co/djduecaster/dfreq-roller-mps-late-20261103
- Model card upstream referenciada: `upstream-base-card.md` (en el repo, no enlazada directamente)
- Nota de licencia referenciada: `LICENSE-NOTE.txt` (en el repo, no enlazada directamente)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web.

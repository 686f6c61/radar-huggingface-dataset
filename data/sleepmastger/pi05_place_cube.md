# SleepMastger/pi05_place_cube

## Resumen

π₀.₅ place_cube es una política visión-lenguaje-acción (VLA) derivada de `pi05_base` de openpi, el modelo robot-pretrained de Physical Intelligence, y afinada por el usuario SleepMastger sobre 100 demostraciones reales de teleoperación con un brazo Franka Emika. La tarea concreta es "place the cube in the bowl": coger un cubo y dejarlo en un cuenco. El modelo consume dos imágenes (vista de agente y vista de muñeca), un vector de estado del efector final y un prompt de texto, y devuelve una secuencia de 16 acciones de 7 dimensiones a 10 Hz.

El interés de esta ficha no está en la novedad arquitectónica —hereda el backbone visión-lenguaje PaliGemma/Gemma de π₀.₅— sino en que es un ejemplo completo y reproducible de *fine-tuning* de una política VLA sobre un único setup físico, con contrato de entrada/salida documentado, estadísticas de normalización versionadas por checkpoint y un test de replay para validar el despliegue. Es material útil para quien quiera entender el ciclo real de imitation learning en robótica: recogida de datos, entrenamiento, servicio y verificación.

El repositorio ocupa 49,8 GB y publica cuatro checkpoints (pasos 5.000, 10.000, 15.000 y 19.999) de 12,4 GB cada uno, sin el estado del optimizador. No hay descargas ni likes registrados, y no se han publicado resultados de éxito en robot real; el autor advierte explícitamente de que el régimen de entrenamiento (41 épocas sobre 100 episodios) es de sobreajuste profundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π₀.₅ de openpi; backbone visión-lenguaje PaliGemma/Gemma; salida de acciones por difusión (no disponible el detalle exacto del cabezal en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el prompt es una instrucción corta; el modelo no se usa como LLM de contexto largo) |
| Tipos de cuantizacion | no disponible (los checkpoints publicados son pesos completos; el autor indica GPU con > 8 GB de VRAM, lo que sugiere viabilidad en precisión reducida, pero no se documentan formatos) |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés: "place the cube in the bowl") |
| Licencia | Gemma Terms of Use (heredada del backbone PaliGemma/Gemma); el código de openpi es Apache-2.0 por separado |
| Formato de pesos | Parámetros JAX/Flax en carpetas `params/` y `assets/` por checkpoint (formato nativo de openpi; no se publican safetensors ni GGUF) |

Otros parámetros relevantes del contrato:

| Parametro | Valor |
|---|---|
| Dimension de accion | 32 (`action_dim=32`) |
| Horizonte de accion | 16 pasos (`action_horizon=16`) |
| Entrada de estado | Discreta (`discrete_state_input=True`), 8 dimensiones normalizadas y discretizadas en 256 bins |
| Frecuencia de control | 10 Hz (predecir 16, ejecutar ~8, replanificar) |
| Camaras | 2 (tercera persona / agentview y muñeca), 256×256×3 uint8 |
| Pasos de entrenamiento | 20.000 (checkpoints en 5.000, 10.000, 15.000 y 19.999) |
| Datos de entrenamiento | 100 episodios, 15.624 frames a 10 Hz, un Franka + 2 RealSense |

## Arquitectura y entrenamiento

El modelo es un afinamiento de `pi05_base`, la política π₀.₅ preentrenada por openpi sobre datos de robot. La arquitectura es un transformer visión-lenguaje-acción: las imágenes de las dos cámaras y el prompt de texto se procesan con el backbone PaliGemma/Gemma, y el estado del robot se inyecta de forma no convencional. Con `discrete_state_input=True`, el vector de estado de 8 dimensiones se normaliza con las estadísticas del checkpoint, se discretiza en 256 bins y se escribe dentro del propio prompt de texto. Esto implica que un estado mal escalado no provoca un error de validación, sino que altera lo que el modelo "lee" y, por tanto, la acción generada.

El entrenamiento se hizo sobre 100 episodios de teleoperación real (15.624 frames a 10 Hz) de la tarea "place the cube in the bowl" con un único Franka y dos cámaras RealSense. Se ejecutaron 20.000 pasos con batch 32, AdamW, scheduler coseno de 5e-5 a 5e-6 tras 1.000 pasos de warmup y EMA 0.999, en 2 GPUs durante aproximadamente 4 h 25 min. La pérdida final fue 0,0016 (partiendo de 0,163). El autor señala que 41 épocas sobre 100 demostraciones constituyen un régimen de sobreajuste profundo: la pérdida baja indica ajuste a los datos, no competencia en la tarea. Las estadísticas de normalización (`norm_stats.json`) viajan con cada checkpoint y no deben mezclarse entre ejecuciones.

## Capacidades

- Generación de acciones de efector final: devuelve tensores `(16, 7)` con deltas de posición (metros por paso de 100 ms), rotación y apertura/cierre de pinza.
- Manipulación de una tarea concreta: coger un cubo y colocarlo en un cuenco, condicionado al prompt de texto.
- Percepción multimodal: dos vistas (agente y muñeca) más estado propioceptivo del robot.
- Condicionamiento por lenguaje: el prompt de texto selecciona la tarea; el estado discretizado se incorpora al propio prompt.
- Control en lazo cerrado a 10 Hz con replanificación cada ~8 pasos.
- No soporta tool calling ni function calling: no es un LLM de propósito general.
- No soporta razonamiento multi-paso ni modo "thinking".
- No hay capacidades de audio ni de visión general fuera del pipeline robótico.
- Multilingüismo: no disponible; el único prompt documentado está en inglés.
- Rotación: capacidad nula en la práctica (ver limitaciones).

## Casos de uso

- **Investigación en imitation learning sobre hardware real**: sirve como referencia completa de un pipeline de fine-tuning VLA, desde la recogida de 100 episodios hasta el servicio con openpi, para replicar el flujo con otras tareas y setups.
- **Banco de pruebas de contrato de despliegue**: el `CONTRACT.md` y el test de replay permiten validar que un servidor de inferencia reproduce exactamente las acciones registradas (RMSE de 0,00019 m en `episode_0`), útil para depurar integraciones antes de tocar el robot.
- **Pick-and-place de una sola tarea en celda fija**: en una instalación donde el cubo y el cuenco estén siempre en la misma posición relativa y con el mismo encuadre de cámara, la política puede ejecutar la secuencia de agarre y colocación a 10 Hz.
- **Docencia y demostraciones de VLA**: por su tamaño manejable (12,4 GB por checkpoint) y su requisito de VRAM bajo (> 8 GB), es apto para laboratorios con una sola GPU consumer o de gama profesional.
- **Evaluación de robustez frente a encuadre de cámara**: el modelo es sensible al framing; puede usarse para estudiar cómo degrada silenciosamente el comportamiento ante cambios de calibración, un fenómeno relevante en producción robótica.
- **Punto de partida para fine-tuning posterior**: al estar construido sobre `pi05_base` y publicar cuatro checkpoints intermedios, permite experimentar con distintos niveles de ajuste (10, 20, 31 y 41 épocas) y comparar sobreajuste frente a generalización.
- **Generación de datos sintéticos de evaluación**: las trayectorias predichas pueden compararse con las grabadas para medir deriva del modelo en escenarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a una política VLA de manipulación. El autor sí publica una verificación de replay contra episodios grabados no usados en el ajuste fino:

| Metrica | episode_0 | episode_1 |
|---|---|---|
| RMSE xyz | 0,00019 m | 0,00020 m |
| RMS por paso del ground truth | 0,00106 m (error/señal 0,18) | 0,00121 m (0,16) |
| Máximo \|rpy\| | 3,3e-09 | 3,6e-09 |
| Coincidencia de pinza | 100 % (96/96) | 100 % (96/96) |
| Latencia de inferencia | ~51 ms | ~51 ms |

El propio autor advierte de que esta tabla mide si el despliegue reproduce el contrato de entrenamiento, no si la política tiene éxito en la tarea. No hay tasas de éxito en robot real publicadas.

## Requisitos de hardware

- VRAM: el autor indica un mínimo de más de 8 GB para servir el modelo; cada checkpoint pesa 12,4 GB en disco, por lo que en precisión completa se necesita al menos esa cantidad de memoria, y más si se carga el estado del optimizador (no publicado, 32 GB por paso).
- GPUs recomendadas: no disponibles de forma explícita; el entrenamiento se hizo con 2 GPUs durante ~4 h 25 min. Para inferencia, una GPU con 16-24 GB (RTX 4090, L4, A10) es un punto de partida razonable, aunque no está confirmado en la información.
- GPU consumer: probablemente sí en tarjetas con 16 GB o más, dado el requisito declarado de > 8 GB; no confirmado para modelos concretos.
- Despliegue: openpi con JAX + CUDA y Python ≥ 3.11; el autor proporciona `serve_pi05.py` en el repositorio `deploy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia: ~51 ms por inferencia medida en el replay test, compatible con el bucle de control a 10 Hz (100 ms por paso) con margen.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ place_cube (este) | no disponible | no disponible | Pick-and-place de una tarea, Franka real | Gemma Terms | Hugging Face, 4 checkpoints, 0 descargas |
| `pi05_base` (openpi) | no disponible | no disponible | Política VLA preentrenada multi-tarea | Gemma Terms (backbone) / Apache-2.0 (código) | Repositorio openpi de Physical Intelligence |
| Políticas ACT / Diffusion Policy | no disponible | no disponible | Manipulación por imitation learning | Variable (habitualmente MIT/Apache-2.0) | Implementaciones abiertas en GitHub |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente a `pi05_base` es el ajuste fino sobre una única tarea y setup; frente a ACT o Diffusion Policy, la ventaja es el condicionamiento por lenguaje y el backbone visión-lenguaje, a costa de un peso mucho mayor (12,4 GB por checkpoint).

## Limitaciones y advertencias

- **Sin control de rotación**: la rotación fue constante cero en todos los episodios de entrenamiento; las dimensiones 3:6 de la acción son siempre ≈ 0. La política no puede girar la muñeca.
- **Una tarea, una escena, un montaje de cámaras**: 100 demostraciones de un único rig; no cabe esperar generalización fuera de esa distribución.
- **Sobreajuste profundo**: 41 épocas sobre 100 episodios y pérdida de 0,0016. El checkpoint final (19.999) no es necesariamente el mejor; el autor recomienda probar hacia atrás si parece memorizado o frágil.
- **Sensibilidad al encuadre de cámara**: un desajuste degrada el comportamiento de forma silenciosa; el modelo sigue actuando con confianza y hace lo incorrecto. Hay que reproducir el framing de recogida y ejecutar el test de replay antes de confiar en un setup nuevo.
- **Estadísticas de normalización acopladas al checkpoint**: `norm_stats.json` debe viajar con su checkpoint; mezclarlas produce acciones mal escaladas sin error.
- **Polaridad de la pinza contraintuitiva**: 1,0 = abierto y 0,0 = cerrado, con umbral en 0,5; es el error más fácil de cometer al integrar.
- **Estado no es canal lateral**: al discretizarse dentro del prompt, un estado mal escalado cambia la interpretación del texto por parte del modelo.
- **Riesgo de alucinación**: no aplica en el sentido de texto, pero sí en el de acciones plausibles y erróneas ejecutadas con alta confianza fuera de distribución.
- **Licencia**: Gemma Terms of Use se hereda del backbone; hay que revisar sus restricciones de uso comercial antes de desplegar en producción. El código de openpi es Apache-2.0, pero no cubre los pesos.
- **Sin datos de éxito en robot real**: la verificación publicada mide reproducción del contrato, no éxito de la tarea.
- **Madurez**: 0 descargas y 0 likes; repositorio creado y actualizado el mismo día (31 de octubre de 2026), sin historial de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SleepMastger/pi05_place_cube
- Código de servicio y cliente del robot: https://github.com/sleepmastergx/deploy/tree/pi0.5/pi05_place_cube
- Contrato de entrada/salida: https://github.com/sleepmastergx/deploy/blob/pi0.5/pi05_place_cube/CONTRACT.md
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms

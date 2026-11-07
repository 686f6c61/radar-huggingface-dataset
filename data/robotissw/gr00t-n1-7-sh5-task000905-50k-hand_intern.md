# RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern

## Resumen

GR00T-N1.7-SH5-Task000905-50k-Hand_Intern es un checkpoint de ajuste fino del modelo vision-lenguaje-accion (VLA) NVIDIA GR00T N1.7-3B, publicado por RobotisSW. No es un modelo de lenguaje generalista: es una política robótica entrenada para una tarea concreta de manipulación (coger un apósito blanco de una caja con la mano derecha y sostenerlo), sobre un robot con 54 articulaciones medidas y 90 valores táctiles brutos. El modelo conserva la arquitectura VLA del modelo base, con backbone VLM congelado y cabezas de acción/proyección más un codificador táctil `finger_mlp` entrenable.

El interés técnico reside en que incorpora un adaptador táctil propietario (SH5) que no existe en GR00T N1.7 estándar, por lo que requiere una implementación personalizada de GR00T compatible con táctil para poder ejecutarse. El checkpoint es reanudable: incluye modelo, procesador, estadísticas, mapeo de embodiment, estado del optimizador, scheduler, RNG y número de paso del entrenador, lo que permite continuar el entrenamiento desde el paso 50.000 de una programación coseno de 200.000 actualizaciones.

Es relevante ahora como artefacto de diagnóstico, no como modelo desplegable. El autor indica explícitamente que el entrenamiento se detuvo en el paso 50.000 con pérdida de entrenamiento registrada de 1,4492 en el paso 49.990, que la norma del gradiente pasó a infinito desde el paso 49.890 y que el gradiente táctil era cero en los últimos registros. El propio autor declara que no se reclama ningún aprendizaje táctil exitoso ni éxito o seguridad del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de NVIDIA GR00T N1.7; backbone VLM congelado, cabezas de accion/proyeccion entrenables y codificador tactil `finger_mlp` |
| Parametros totales | 3.144.022.064 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; no se declara cobertura idiomatica) |
| Licencia | NVIDIA Open Model License (`other`) |
| Formato de pesos | safetensors (repo de 25,5 GB, incluye estado de optimizador y scheduler) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T N1.7-3B, un VLA abierto y cross-embodiment para habilidades humanoides generalizadas que acepta entrada multimodal (lenguaje e imágenes) para ejecutar tareas de manipulación. En este ajuste fino el backbone VLM permanece congelado y solo se entrenan las cabezas de acción y proyección, junto con el codificador táctil `finger_mlp` añadido por RobotisSW. La salida es de 40 x 54 posiciones articulares absolutas en radianes, ordenadas como brazo izquierdo (7), brazo derecho (7), mano izquierda (20) y mano derecha (20); cabeza, elevación y base quedan excluidos de la salida.

El entrenamiento se realizó sobre 51 episodios grabados (46 de entrenamiento, 5 reservados) a 30 Hz, con una única cámara de cabeza (`cam_left_head`), 54 posiciones articulares medidas y 90 valores táctiles brutos. Hiperparámetros: batch 64, acumulación 1, LR 1e-4, warmup 1000, precisión BF16/TF32. El checkpoint corresponde al paso 50.000 de una programación coseno de 200.000 actualizaciones y es reanudable, pero el autor documenta inestabilidad numérica: norma de gradiente infinita desde el paso 49.890 y gradiente táctil nulo en los registros finales.

## Capacidades

- Generación de acciones de manipulación robótica: produce trayectorias de 40 pasos x 54 articulaciones en radianes a partir de observación visual e instrucción de tarea.
- Percepción táctil integrada: consume 90 valores táctiles brutos mediante el codificador `finger_mlp` (requiere la implementación SH5 personalizada, no GR00T estándar).
- Control bimanual con manos articuladas: 7 articulaciones por brazo y 20 por mano en la salida.
- Condicionamiento por lenguaje: la tarea se especifica como instrucción textual ("coger un apósito blanco de la caja y sostenerlo").
- Entrada visual monocámara: solo cámara de cabeza (`cam_left_head`).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje de propósito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión se limita al uso como entrada de política).

## Casos de uso

- Diagnóstico de inestabilidad en entrenamiento VLA: el checkpoint permite reanudar desde el paso 50.000 con optimizador, scheduler y RNG restaurados para investigar la divergencia de gradiente documentada y el gradiente táctil nulo.
- Investigación en fusión táctil-visual para manipulación: sirve como base para estudiar si el codificador `finger_mlp` aprende representaciones útiles cuando se entrena con 46 episodios y 90 canales táctiles.
- Reproducción de experimentos con GR00T N1.7: al incluir `artifact_manifest.json` con commit de origen, normalización y contrato de embodiment, facilita la replicación controlada de un ajuste fino sobre el modelo base de NVIDIA.
- Desarrollo de pipelines de ajuste fino con datasets pequeños: caso de referencia de qué ocurre al entrenar un VLA de 3B parámetros con 51 episodios a 30 Hz y backbone congelado.
- Pruebas de integración de la implementación SH5: valida el funcionamiento de `Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True` en inferencia offline.
- Benchmarking de estabilidad numérica en BF16/TF32: útil para comparar estrategias de clipping, warmup o precisión frente a la divergencia observada en norma de gradiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de entrenamiento: pérdida de entrenamiento 1,4492 en el paso 49.990 y norma de gradiente infinita desde el paso 49.890, sin métricas de éxito en robot ni evaluaciones de la tarea reservada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144.022.064 parámetros, en BF16 los pesos ocupan aproximadamente 6,3 GB, a lo que hay que sumar activaciones y el estado táctil. El repo completo (25,5 GB) incluye estado de optimizador y no refleja el requisito de inferencia.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB de VRAM en BF16 sería suficiente para los pesos, aunque no hay validación publicada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 24 GB (por ejemplo RTX 4090) en BF16 según el recuento de parámetros, pero no está verificado por el autor.
- Opciones de despliegue: `Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True` (inferencia offline), sobre la implementación personalizada SH5 de GR00T; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| GR00T-N1.7-SH5-Task000905-50k-Hand_Intern | 3.144.022.064 | no disponible | Manipulación táctil específica (apósito) | NVIDIA Open Model License | Checkpoint de diagnóstico, no validado |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3B | no disponible | VLA generalista cross-embodiment | NVIDIA Open Model License | Modelo base publicado por NVIDIA |
| NVIDIA Isaac GR00T N1.7 (repo oficial) | no disponible | no disponible | Habilidades humanoides generalizadas | no disponible | Implementación de referencia en GitHub |

## Limitaciones y advertencias

- El autor declara explícitamente que el checkpoint no es un modelo de despliegue validado y que no se reclama ningún éxito o seguridad del robot.
- Inestabilidad de entrenamiento documentada: norma de gradiente infinita desde el paso 49.890 y gradiente táctil cero en los registros finales; no se reclama aprendizaje táctil exitoso.
- Dataset muy reducido: 51 episodios totales, 46 de entrenamiento y 5 reservados, lo que limita la generalización.
- Dependencia de una implementación personalizada: no funciona con GR00T estándar sin el adaptador táctil SH5.
- Entrada visual restringida a una sola cámara de cabeza; sin cabeza, elevación ni base en las salidas, lo que limita su uso a brazos y manos.
- Riesgo de alucinación: no aplica en el sentido de lenguaje general; el riesgo equivalente es la generación de trayectorias no válidas o inseguras, no evaluado por el autor.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: NVIDIA Open Model License; conviene revisar sus términos para uso comercial antes de cualquier despliegue.
- El repo excluye vídeos crudos, demostraciones, credenciales, rutas de servidor, logs privados y el pickle de TrainingArguments; la reproducibilidad completa requiere el dataset local original y el launcher.
- Verificar `SHA256SUMS` tras la descarga en el commit registrado antes de reanudar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio oficial NVIDIA Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio ROBOTIS Isaac-GR00T-n1.7: https://github.com/ROBOTIS-GIT/Isaac-GR00T-n1.7
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

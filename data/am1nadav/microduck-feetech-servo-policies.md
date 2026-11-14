# Am1nadav/microduck-feetech-servo-policies

## Resumen

`microduck-feetech-servo-policies` es un repositorio de políticas de locomoción y recuperación en formato `.onnx` para réplicas comunitarias del robot cuadrúpedo Microduck de 14 grados de libertad (DoF), equipadas con servos de bus serie Feetech HD-1910 y HL-2915. Lo publica el usuario Am1nadav en Hugging Face bajo licencia Apache-2.0, y empaqueta pesos entrenados y liberados upstream por el proyecto Animan-AI/DuckBuddy en el formato estándar de Hugging Face Hub para robots `microduck`, con `manifest.json` y verificación SHA-256.

No se trata de un modelo de lenguaje, sino de un conjunto de controladores de movimiento entrenados con aprendizaje por refuerzo y transferidos de simulación a realidad (sim2real) sobre el simulador MuJoCo. El repositorio incluye cuatro políticas: una marcha omnidireccional perpetua para servos HD-1910, y tres políticas episódicas para servos HL-2915 (voltereta frontal, levantarse del suelo y transición sentado-de pie). Todas comparten un contrato de observación de 61 valores float32 y una salida de 14 acciones a 50 Hz.

Su relevancia radica en que ofrece una vía de bajo coste para que réplicas de hardware comunitario dispongan de comportamientos motores listos para ejecutar en navegador mediante un banco de pruebas 3D con MuJoCo WebAssembly, antes de flashear servos físicos. No se dispone de información sobre idiomas, pipeline de texto ni capacidades lingüísticas, ya que el artefacto es puramente robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de control entrenadas con aprendizaje por refuerzo (RL), exportadas a ONNX; arquitectura de red interna no disponible |
| Parametros totales | no disponible (el tamaño del repo figura como 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores float32 por paso |
| Tipos de cuantizacion | no disponible; pesos en ONNX (formato de exportación estándar, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), con `manifest.json` y verificación SHA-256 |
| Pipeline | robotics |
| Libreria | microduck |
| Frecuencia de control | 50 Hz (`dt = 0.02 s`) |
| Grados de libertad | 14 DoF (5 pierna izquierda + 4 cuello/cabeza + 5 pierna derecha) |
| Servos objetivo | Feetech HD-1910 (marcha) y Feetech HL-2915 (voltereta, levantarse, sentado-de pie) |

## Arquitectura y entrenamiento

Las políticas son controladores de locomoción entrenados con aprendizaje por refuerzo y transferidos de simulación a realidad (sim2real), según indican las etiquetas del repositorio (`reinforcement-learning`, `sim2real`). Los pesos originales fueron entrenados y liberados upstream por Animan-AI/DuckBuddy y aquí se empaquetan para el formato estándar `microduck` de Hugging Face Hub, con `manifest.json` y sumas de verificación SHA-256 para cada archivo. No se especifica en la información disponible la arquitectura interna de la red (número de capas, tipo de red neuronal, algoritmo de RL empleado ni número de tokens o episodios de entrenamiento).

El contrato de observación y acción está bien definido: la entrada (`obs`) es un tensor `float32[1, 61]` compuesto por giroscopio (3), acelerómetro (3), comando (13), error de posición de articulaciones (14), velocidad de articulaciones (14) y acción previa (14). La salida (`actions`) es un tensor `float32[1, 14]` que corresponde a los 14 actuadores. El control se ejecuta a 50 Hz. La cinemática base procede de Pollen Robotics Microduck (Apache-2.0), y las políticas se validan en un banco de pruebas 3D con MuJoCo WebAssembly antes del despliegue en hardware físico.

## Capacidades

- Marcha omnidireccional perpetua para réplicas con servos Feetech HD-1910 (política `hd1910_walk_kp16_6500.onnx`, con `Kp=16`).
- Voltereta frontal o somersault episódica para servos HL-2915 (`hl2915_roulade_v4bl_6999.onnx`).
- Recuperación desde el suelo o levantarse episódico para servos HL-2915 (`hl2915_standup_v4bl_5999.onnx`).
- Transición sentado-de pie para servos HL-2915 (`hl2915_sitstand_v4bl_3999.onnx`).
- Ejecución en navegador mediante banco de pruebas 3D con MuJoCo WebAssembly a 50 Hz, con controles `WASD`/flechas para marcha, `[C]` para sentado-de pie y `[R]`/`[Space]` para reproducir políticas episódicas.
- Compatibilidad con el contrato estándar de 14 DoF de Microduck (Pollen Robotics) y con DuckSpace.org.
- Verificación de integridad mediante SHA-256 para cada archivo de política.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado de locomoción en réplicas comunitarias de Microduck: un desarrollador con servos Feetech HD-1910 puede cargar `policy.onnx` y obtener una marcha omnidireccional perpetua sin entrenar desde cero, gracias al contrato de observación de 61 valores y salida de 14 acciones a 50 Hz.
- Validación previa al despliegue físico: el banco de pruebas 3D con MuJoCo WebAssembly en DuckSpace.org permite probar cada política en navegador antes de flashear servos reales, reduciendo el riesgo de dañar hardware.
- Demostraciones de recuperación tras caída: la política `standup` permite que el robot vuelva a levantarse desde el suelo de forma autónoma, útil en demostraciones públicas y entornos de investigación.
- Transiciones posturales para interacción: la política `sitstand` habilita el paso de sentado a de pie, adecuado para secuencias de exhibición o para iniciar la marcha tras una pausa.
- Acrobacias y contenido divulgativo: la política `roulade` ejecuta una voltereta frontal episódica, apropiada para vídeos, ferias y material educativo sobre sim2real.
- Integración en pipelines de robótica con verificación de integridad: el `manifest.json` y los checksums SHA-256 permiten automatizar la descarga y validación de políticas en flujos de CI o scripts de despliegue.
- Investigación en sim2real: sirve como referencia reproducible para comparar el comportamiento de políticas entrenadas en simulación frente a su ejecución en servos HD-1910 y HL-2915 reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de recompensa, tasa de éxito, latencia ni throughput; únicamente se documenta la frecuencia de control de 50 Hz y la existencia de un banco de pruebas 3D interactivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0.0 GB y las políticas son redes de control de pequeña dimensión, pero no se declara el número de parámetros.
- GPU recomendadas: no disponibles; el artefacto está pensado para ejecutarse en el propio robot o en el navegador mediante MuJoCo WebAssembly, no para inferencia en GPU de gran escala.
- Compatibilidad con GPU de consumo: no disponible; la ejecución declarada es en navegador (WebAssembly) y en hardware físico con servos Feetech.
- Opciones de despliegue: ONNX Runtime (formato `.onnx`), banco de pruebas 3D en DuckSpace.org y el Space `Am1nadav/DuckSpace`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: control a 50 Hz (`dt = 0.02 s`); no se publican cifras adicionales de latencia ni de rendimiento en hardware físico.

## Comparativa con modelos similares

| Modelo | Tipo | DoF | Servos objetivo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Am1nadav/microduck-feetech-servo-policies` | Políticas RL sim2real (4 políticas) | 14 | Feetech HD-1910 y HL-2915 | ONNX | Apache-2.0 | Hugging Face Hub + DuckSpace.org |
| `pollen-robotics/microduck-policies` | Políticas base de Microduck | 14 | no disponible | no disponible | Apache-2.0 | Hugging Face Hub |
| `Animan-AI/DuckBuddy` | Pesos upstream de las políticas | 14 | Feetech (según upstream) | no disponible | Apache-2.0 | GitHub |

La comparación se limita a los proyectos citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Las políticas están acopladas a servos concretos: la marcha requiere HD-1910 con `Kp=16`, y las políticas episódicas requieren HL-2915; usarlas con otros servos puede degradar el comportamiento o dañar el hardware.
- El rendimiento sim2real puede diferir del observado en el banco de pruebas 3D; la model card no reporta tasas de éxito en hardware físico.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma, al no aplicar a este tipo de artefacto.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución a Animan-AI/DuckBuddy y a Pollen Robotics indicada en el archivo NOTICE.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación independiente.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar un empaquetado incompleto o una métrica no actualizada; conviene verificar los checksums SHA-256 antes de usar los archivos.

## Enlaces

- Hugging Face: https://huggingface.co/Am1nadav/microduck-feetech-servo-policies
- Space de demostración: https://huggingface.co/spaces/Am1nadav/DuckSpace
- Banco de pruebas 3D: https://duckspace.org
- Repositorio upstream de pesos: https://github.com/Animan-AI/DuckBuddy
- Cinemática base: https://github.com/pollen-robotics/microduck
- Políticas base de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies
- Vídeo de repetición: https://huggingface.co/Am1nadav/microduck-feetech-servo-policies/resolve/main/replay.mp4

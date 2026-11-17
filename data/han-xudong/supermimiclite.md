# han-xudong/SuperMimicLite

## Resumen

SuperMimicLite es un conjunto de políticas de control para el robot humanoide Unitree G1 orientadas al seguimiento de movimiento (motion tracking), desarrollado por han-xudong. El repositorio empaqueta cuatro políticas entrenadas con dos métodos distintos (PPO y SuperMimic) y dos configuraciones de datos (LaFAN40 y Mixed), junto con los checkpoints nativos, las exportaciones ONNX y un protocolo de evaluación fijo sobre 228 movimientos. No es un modelo de lenguaje: es un artefacto de reinforcement learning para robótica, con observaciones de estado del robot y comandos de referencia, y salidas de 29 acciones articulares a 50 Hz.

La relevancia del proyecto reside en que ofrece una comparación reproducible entre un baseline PPO clásico y el método SuperMimic (basado en un world model) sobre el mismo robot y el mismo banco de 228 movimientos, con métricas de error de cuerpo, muñeca y raíz, además de tasa de finalización. La mejor política, S-M, alcanza 32,47 mm de error de cuerpo, 42,37 mm de muñeca y 0,511 m de error de raíz, completando 198 de 228 movimientos.

El paquete incluye código Apache-2.0, pesos en ONNX y checkpoints nativos, y depende de datos de movimiento de terceros (LaFAN40, Bones Studio) cuyas licencias se mantienen. El tamaño del repositorio es de 0,3 GB y el pipeline declarado en Hugging Face es reinforcement-learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de reinforcement learning para control de humanoide; PPO (baseline) y SuperMimic (con world model y encoder/decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación: 535 valores de política + 304 de comando en PPO; 990 de historial + 730 de objetivo en SuperMimic) |
| Tipos de cuantizacion | no disponible (exportación ONNX sin cuantización documentada) |
| Idiomas soportados | en (documentación y metadatos) |
| Licencia | other (código original Apache-2.0; artefactos de terceros con sus propias licencias) |
| Formato de pesos | ONNX (.onnx) y checkpoints nativos (.pt) |

## Arquitectura y entrenamiento

El proyecto entrena políticas de control para el Unitree G1 con dos enfoques. El primero es PPO, que consume 535 valores de política y 304 valores de comando y produce 29 acciones articulares a 50 Hz. El segundo es SuperMimic, que incorpora un world model junto con encoder y decoder, consume 990 valores de historial y 730 de objetivo, y genera las mismas 29 acciones a 50 Hz. Las exportaciones ONNX incluyen la normalización y, en el caso de SuperMimic, el encoder y el decoder, de modo que la inferencia es autocontenida.

El entrenamiento se realizó sobre dos configuraciones de datos: LaFAN40 y Mixed. Los checkpoints publicados son los finales de 32k pasos y no incluyen un estado completo de optimizador para reanudar el entrenamiento. La evaluación se fija sobre 228 movimientos, divididos en subconjuntos Locomotion80 y Manipulation48 para el cálculo de errores de cuerpo y muñeca, mientras que el error de raíz se calcula sobre Locomotion80. Los datos de movimiento provienen de fuentes upstream, incluida la captura de Bones Studio, y están sujetos a sus propias licencias.

## Capacidades

- Seguimiento de movimiento de referencia en el humanoide Unitree G1, con salida de 29 acciones articulares a 50 Hz.
- Control de locomoción y manipulación: la evaluación separa Locomotion80 y Manipulation48.
- Ejecución de políticas exportadas a ONNX con normalización, encoder y decoder integrados, aptas para despliegue fuera de PyTorch.
- Checkpoints nativos en .pt para inspección y reutilización en el ecosistema PyTorch.
- Evaluación reproducible sobre un banco fijo de 228 movimientos con métricas de error de cuerpo, muñeca y raíz, y conteo de finalización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio ni modo de pensamiento.

## Casos de uso

- Evaluación comparativa de algoritmos de RL para humanoides: el banco fijo de 228 movimientos y las métricas documentadas permiten contrastar PPO frente a SuperMimic con un protocolo común y resultados por movimiento en `reference/per-motion.json`.
- Investigación en motion tracking con world models: los checkpoints S-L y S-M incluyen el world model, lo que facilita estudiar cómo influye en la estabilidad del seguimiento frente al baseline PPO.
- Despliegue en simulación con MuJoCo: el repositorio está etiquetado con mujoco y el flujo de evaluación descarga el asset del robot, lo que permite reproducir el benchmark en un entorno simulado antes de plantear transferencia.
- Integración en pipelines de inferencia ligeros mediante ONNX: las políticas exportadas incluyen normalización y encoder/decoder, por lo que pueden ejecutarse con runtimes ONNX sin dependencia de PyTorch.
- Estudio de recopilación de datos para robótica: la comparación entre LaFAN40 y Mixed cuantifica el efecto de la composición del dataset (por ejemplo, S-M con Mixed mejora a S-L con LaFAN40 en cuerpo, muñeca y raíz).
- Reproducción de experimentos con verificación de integridad: el descargador fija revisiones y hashes SHA256, lo que resulta útil para auditorías de resultados en publicaciones.
- Desarrollo de controladores de referencia para el Unitree G1: las políticas P-L y P-M sirven como línea base de PPO para comparar futuras propuestas.

## Benchmarks y rendimiento

| Política | Método | Datos | Cuerpo ↓ mm | Muñeca ↓ mm | Raíz ↓ m | Completados / 228 |
|---|---|---|---:|---:|---:|---:|
| P-L | PPO | LaFAN40 | 40,22 | 62,61 | 1,479 | 120 |
| P-M | PPO | Mixed | 40,50 | 56,21 | 0,911 | 136 |
| S-L | SuperMimic | LaFAN40 | 43,22 | 65,55 | 0,737 | 182 |
| S-M | SuperMimic | Mixed | **32,47** | **42,37** | **0,511** | **198** |

Los errores de cuerpo y muñeca promedian por igual las medias de los subconjuntos Locomotion80 y Manipulation48. El error de raíz se calcula sobre Locomotion80. El conteo de completados considera los 228 movimientos hasta el primer fallo. Los resultados provienen de una única semilla de simulación y los movimientos de entrenamiento y evaluación pueden solaparse, según advierte el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,3 GB e incluye pesos ONNX y checkpoints, pero no se documentan requisitos de memoria.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; al ser políticas pequeñas de control, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: runtime ONNX para las políticas exportadas; PyTorch para los checkpoints nativos; MuJoCo para la simulación y evaluación.
- Entorno de ejecución: Linux, Git y uv, con sincronización mediante `uv sync --locked` y descarga verificada con `scripts/fetch.py`.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms), pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SuperMimicLite (S-M) | Política RL para Unitree G1 | no disponible | no aplica | Cuerpo 32,47 mm; muñeca 42,37 mm; raíz 0,511 m; 198/228 | other (código Apache-2.0) | Hugging Face y GitHub |
| SuperMimicLite (P-M) | Política RL baseline PPO | no disponible | no aplica | Cuerpo 40,50 mm; muñeca 56,21 mm; raíz 0,911 m; 136/228 | other (código Apache-2.0) | Hugging Face y GitHub |
| MimicLite | Framework upstream de imitación | no disponible | no aplica | no disponible | no disponible | GitHub |
| Uni-SuperMimic | Método upstream | no disponible | no aplica | no disponible | no disponible | GitHub |

No se dispone de datos de benchmarks de MimicLite ni de Uni-SuperMimic en la información proporcionada, por lo que la comparación cuantitativa se limita a las cuatro políticas del propio repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generación de texto, razonamiento, código, tool calling ni agentes.
- Los resultados se obtuvieron con una única semilla de simulación; la varianza entre semillas no está documentada.
- Los movimientos de entrenamiento y evaluación pueden solaparse, lo que puede inflar las métricas de seguimiento.
- La licencia es "other": el código original es Apache-2.0, pero el código de terceros y los artefactos de modelo o movimiento conservan sus propios términos, detallados en NOTICE y THIRD_PARTY.md.
- El uso de los datos subyacentes, incluida la captura de Bones Studio, está sujeto a la BONES Motion Capture Dataset License Agreement, lo que condiciona el uso comercial.
- Los checkpoints son finales de 32k pasos y no incluyen estado completo de optimizador, por lo que no permiten reanudar el entrenamiento tal cual.
- El despliegue está orientado a simulación (MuJoCo); no se documenta validación en hardware físico del Unitree G1.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción externa.
- No se publican sesgos, tasas de alucinación ni métricas de robustez fuera del banco de 228 movimientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/han-xudong/SuperMimicLite
- Dataset: https://huggingface.co/datasets/han-xudong/SuperMimicLite
- Código: https://github.com/han-xudong/SuperMimicLite
- Documentación de entrenamiento: https://github.com/han-xudong/SuperMimicLite/blob/main/docs/TRAINING.md
- Documentación de evaluación: https://github.com/han-xudong/SuperMimicLite/blob/main/docs/EVALUATION.md
- Resultados por movimiento: https://github.com/han-xudong/SuperMimicLite/blob/main/reference/per-motion.json
- Licencia del código: https://github.com/han-xudong/SuperMimicLite/blob/main/LICENSE
- NOTICE: https://github.com/han-xudong/SuperMimicLite/blob/main/NOTICE
- THIRD_PARTY.md: https://github.com/han-xudong/SuperMimicLite/blob/main/THIRD_PARTY.md
- MimicLite (upstream): https://github.com/EGalahad/mimic-lite
- Uni-SuperMimic (upstream): https://github.com/Motphys/Uni-SuperMimic
- SuperMimic (sitio del método): https://supermimic.github.io/
- Bones Studio: https://bones.studio/
- Licencia del dataset Bones: https://huggingface.co/datasets/bones-studio/seed/blob/main/LICENSE.md

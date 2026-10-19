# manhasv/diffusion-policy-pusht200

## Resumen

`manhasv/diffusion-policy-pusht200` es un conjunto de cuatro checkpoints de Diffusion Policy entrenados para la tarea 2D Push-T, en los que una política de difusión debe empujar una T hasta cubrir un área objetivo. Lo desarrolla el usuario `manhasv` y se publica como material de investigación reproducible, no como modelo generalista. La arquitectura indicada es una política de difusión con backbone CNN/UNet y observaciones de baja dimensión basadas en keypoints, sin imágenes crudas ni entrada de texto.

Los cuatro checkpoints corresponden a 50, 100, 150 y 200 demostraciones teleoperadas y permiten medir cómo escala el rendimiento con el tamaño del conjunto de datos. Todos se entrenaron con el mismo presupuesto de pasos de gradiente y se evaluaron sobre 50 semillas fijas, lo que hace la comparación interna relativamente controlada. El repositorio pesa 4,2 GB e incluye modelo, EMA, estado del optimizador y configuración exacta de entrenamiento.

Es relevante para investigación en aprendizaje por imitación y robótica porque publica la curva de rendimiento y éxito para distintos tamaños de dataset, con licencia MIT. No es un modelo de lenguaje ni un sistema multimodal: sus especificaciones de contexto, idiomas y cuantización no aplican del mismo modo que en un LLM.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (Diffusion Policy) con backbone CNN/UNet y observaciones de baja dimensión (keypoints) para Push-T 2D |
| Parámetros totales | no disponible; la model card no publica el recuento y el repositorio de 4,2 GB contiene cuatro checkpoints completos con estado del optimizador |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no disponible; no es un modelo de lenguaje y no se especifica el horizonte de observación |
| Tipos de cuantización | no disponible; no se publican versiones cuantizadas (FP16, INT8, GGUF, etc.) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | MIT |
| Formato de pesos | PyTorch `.ckpt`; checkpoint completo con modelo, EMA, estado del optimizador y configuración exacta de entrenamiento |

## Arquitectura y entrenamiento

La política sigue el esquema Diffusion Policy: genera secuencias de acciones mediante un proceso de difusión condicionado por observaciones de keypoints de baja dimensión. El backbone es una CNN/UNet, según la model card. No se detallan el número de parámetros, el scheduler de ruido, el horizonte de observación, el horizonte de acción ni la dimensión exacta de las acciones. No se emplean RLHF ni DPO: es aprendizaje por imitación supervisado a partir de demostraciones teleoperadas.

Se entrenaron cuatro modelos con 200 demostraciones propias recogidas en entornos con semillas 0-199, usando subconjuntos aleatorios de 50, 100, 150 y 200 demostraciones con semilla de subconjunto 42. Todos usaron aproximadamente 100.000 pasos de gradiente, batch 256, semilla 42 y una NVIDIA RTX A5000. Se guardó el checkpoint final sin selección sobre las semillas de test. La evaluación usa pesos EMA, semilla de muestreo 0 y 50 semillas fijas de test (100000-100049). El reward se define como la fracción máxima del área objetivo cubierta por la T y el éxito como una cobertura mayor o igual a 0,95. La innovación principal es el estudio controlado de escalado con el tamaño del conjunto de demostraciones.

## Capacidades

- Generación de trayectorias de acción para la tarea 2D Push-T mediante difusión, condicionadas por observaciones de keypoints de baja dimensión.
- Cuatro variantes de dataset en un mismo repositorio: 50, 100, 150 y 200 demostraciones, con el mismo presupuesto de entrenamiento.
- Checkpoints completos con pesos del modelo, EMA, estado del optimizador y configuración, lo que facilita la reproducción y la inspección del entrenamiento.
- Evaluación reproducible con el script `pusht200_eval.py`, semillas fijas y hashes SHA-256 documentados para cada checkpoint.
- No soporta tool calling ni function calling.
- No es un agente multi-step en el sentido de un LLM; es una política de control que produce acciones.
- No tiene capacidades multilingües ni de generación de texto.
- No procesa imágenes crudas de forma directa; trabaja con observaciones de baja dimensión basadas en keypoints.
- No dispone de thinking mode, audio, visión general ni otras capacidades multimodales.

## Casos de uso

- Estudio de escalado de datos en aprendizaje por imitación: comparar los checkpoints de 50, 100, 150 y 200 demostraciones sobre las mismas 50 semillas de test para cuantificar la mejora de reward y tasa de éxito. Es adecuado porque todos los modelos se entrenaron con el mismo número de pasos y se evaluaron con el mismo protocolo.
- Reproducción de resultados de Diffusion Policy en Push-T: descargar un checkpoint concreto, crear el entorno conda del repositorio y ejecutar `pusht200_eval.py` con las semillas documentadas. La inclusión de configuración y EMA reduce la ambigüedad experimental.
- Baseline para nuevos métodos de imitación en Push-T: usar el checkpoint de 200 demostraciones como referencia con 0,88 de reward medio y 84% de éxito, y comparar contra él nuevas políticas o variantes de difusión.
- Planificación de la recolección de demostraciones: utilizar la curva publicada para decidir cuántas demostraciones merece la pena recoger antes de que la mejora marginal disminuya. En la tabla, el salto de 50 a 100 demostraciones es el mayor en reward y éxito.
- Docencia y talleres de robótica o imitation learning: emplear una tarea 2D pequeña, checkpoints públicos y un script de evaluación fijo para ilustrar el comportamiento de una política de difusión sin depender de un robot real.
- Validación de pipelines de evaluación: comprobar que un entorno de inferencia reproduce los valores publicados con las mismas semillas, pesos EMA y criterio de éxito. Los hashes SHA-256 permiten verificar la integridad de los checkpoints.
- Investigación sobre varianza y robustez: analizar cómo cambia la desviación típica del reward al aumentar el número de demostraciones, usando los cuatro checkpoints bajo el mismo conjunto de semillas.
- Prototipado en simulación 2D: integrar la política como componente de un entorno Push-T para probar planificadores, métricas o herramientas de visualización antes de trasladar ideas a tareas más complejas.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a la evaluación propia en Push-T con 50 semillas fijas (100000-100049), semilla de muestreo 0 y pesos EMA. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque no es un modelo de lenguaje.

| Checkpoint | Demostraciones | Reward medio ± desviación típica | Tasa de éxito |
|---|---:|---:|---:|
| `demos50/latest.ckpt` | 50 | 0,57 ± 0,45 | 44% (22/50) |
| `demos100/latest.ckpt` | 100 | 0,73 ± 0,42 | 66% (33/50) |
| `demos150/latest.ckpt` | 150 | 0,84 ± 0,34 | 74% (37/50) |
| `demos200/latest.ckpt` | 200 | 0,88 ± 0,32 | 84% (42/50) |

No se han publicado comparaciones cuantitativas con modelos externos en la información disponible.

## Requisitos de hardware

- Entrenamiento: la model card indica una NVIDIA RTX A5000; no se especifican número de GPUs, VRAM exacta, tiempo de entrenamiento ni consumo.
- VRAM estimada para inferencia: no disponible; no se publica el tamaño de un checkpoint individual ni el pico de memoria necesario.
- GPU recomendadas: no disponibles; el único dato es la RTX A5000 usada en entrenamiento. No hay evidencia publicada de pruebas en A100, H100 o RTX 4090.
- GPU consumer: no se confirma que quepa en tarjetas de consumo; falta el dato de VRAM de inferencia.
- Almacenamiento: el repositorio ocupa 4,2 GB e incluye cuatro checkpoints completos con estado del optimizador, lo que aumenta el tamaño frente a un export de solo inferencia.
- Despliegue: PyTorch con el entorno conda del repositorio y el script `pusht200_eval.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles; no se publican medidas de tiempo por paso de difusión ni de acciones por segundo.
- CPU: no disponible; no se documenta si la evaluación puede ejecutarse en CPU con tiempos razonables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Push-T | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion-policy-pusht200` (`demos200`) | no disponible | no aplica | 0,88 ± 0,32; 84% de éxito | MIT | HuggingFace |
| `demos150` | no disponible | no aplica | 0,84 ± 0,34; 74% de éxito | MIT | Mismo repositorio |
| `demos100` | no disponible | no aplica | 0,73 ± 0,42; 66% de éxito | MIT | Mismo repositorio |
| `demos50` | no disponible | no aplica | 0,57 ± 0,45; 44% de éxito | MIT | Mismo repositorio |
| Diffusion Policy upstream para Push-T lowdim | no disponible | no aplica | no disponible en la información | MIT en el repositorio upstream | GitHub |
| Otras políticas de imitación para Push-T (ACT, BC, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas externas no está disponible. Los únicos resultados comparables publicados son las cuatro variantes internas, evaluadas con el mismo protocolo.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Push-T 2D con observaciones de keypoints de baja dimensión; no es una política general para robots ni para otras tareas.
- El conjunto de datos es pequeño y auto-recolectado: 200 demostraciones teleoperadas como máximo, con subconjuntos de 50 a 200. No se documenta diversidad de operadores, condiciones iniciales o variaciones de entorno más allá de las semillas 0-199.
- El mejor checkpoint alcanza 84% de éxito, por lo que sigue fallando en aproximadamente 16% de las evaluaciones. En el checkpoint de 50 demostraciones el éxito cae al 44% y la desviación típica del reward es alta (0,45).
- No hay validación en robot real ni transferencia sim-to-real documentada; los resultados son de simulación 2D.
- La evaluación se limita a 50 semillas fijas y no se realizó selección de checkpoint sobre las semillas de test; se usa el checkpoint final. Esto es correcto para el estudio, pero limita la potencia estadística de las conclusiones.
- No se publican versiones cuantizadas ni exportadas a formatos de inferencia ligeros; los checkpoints completos incluyen estado del optimizador y son más pesados que un modelo de solo inferencia.
- La licencia es MIT, pero deben revisarse las licencias de las dependencias y del repositorio upstream antes de un uso comercial o de redistribución.
- No es un modelo de lenguaje: no hay riesgo de alucinación textual, pero sí puede generar trayectorias de acción incorrectas o inseguras. No incorpora capas de seguridad ni comprobaciones de límites físicos.
- Puede sufrir distribución desplazada si se evalúa con keypoints, ruidos o condiciones distintas de las del conjunto de entrenamiento.
- No se documentan sesgos sociales en el sentido habitual de un LLM, pero sí posibles sesgos de recolección teleoperada y de las condiciones de simulación.

## Enlaces

- HuggingFace: https://huggingface.co/manhasv/diffusion-policy-pusht200
- Código, configuraciones y fork de evaluación: https://github.com/manhasv/diffusion_policy
- Repositorio upstream de Diffusion Policy: https://github.com/real-stanford/diffusion_policy
- Paper de Diffusion Policy: https://arxiv.org/abs/2303.04137

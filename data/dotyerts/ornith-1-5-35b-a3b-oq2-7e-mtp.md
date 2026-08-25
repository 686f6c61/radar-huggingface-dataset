# dotyerts/Ornith-1.5-35B-A3B-oQ2.7e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ2.7e-mtp es una cuantización de 2 bits del modelo de lenguaje de mezcla de expertos (MoE) Ornith-1.5-35B-A3B, desarrollado por Ornith AI. Este modelo base activa aproximadamente 3 mil millones de parámetros por token, a pesar de tener 35 mil millones en total, y está diseñado específicamente para tareas de codificación y agénticas. La versión cuantizada, publicada por el usuario dotyerts, utiliza la librería oMLX (oQ) para comprimir los pesos a 2 bits con un grupo de tamaño 64, reduciendo el peso total a 15,3 GB y permitiendo su ejecución en hardware con memoria limitada.

El modelo se enmarca en la familia Ornith-1.5, que introduce un enfoque de auto-mejora (self-scaffolding y self-improvement): el modelo propone nuevas tareas, genera andamiajes específicos y produce soluciones para entrenamiento por refuerzo. Aunque la cuantización a 2 bits puede degradar ligeramente la calidad de las respuestas, mantiene la capacidad de ejecutar el modelo en GPUs de consumo y en Apple Silicon mediante MLX. Es relevante para desarrolladores que buscan un modelo de codificación y agente de código abierto, compacto y ejecutable localmente, con un rendimiento que según los benchmarks supera a modelos densos más grandes como Gemma 4-31B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE basada en Qwen 3.5) |
| Parámetros totales | 35B (según nombre); 4.611.898.288 (según safetensors) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (oQ2.7e-mtp), grupo de 64, precisión mixta |
| Idiomas soportados | no disponible (se presume multilingüe, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

Nota: La discrepancia entre los parámetros totales del nombre (35B) y los almacenados en los safetensors (4.6B) sugiere que el repositorio contiene solo los pesos cuantizados de los expertos activos, o que la cuantización a 2 bits ha reducido el número de parámetros almacenados. El tamaño del repositorio es de 15,3 GB.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) de tipo `qwen3_5_moe`, similar a la familia Qwen 3.5, pero adaptada con el enfoque de auto-mejora de Ornith AI. En esta arquitectura, solo se activan aproximadamente 3B parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso de 35B. El entrenamiento se basa en el framework de auto-scaffolding introducido en Ornith-1.0 y ampliado en la versión 1.5: el modelo genera sus propias tareas, construye andajes (scaffolds) específicos y produce soluciones que se utilizan para aprendizaje por refuerzo (RL), creando un ciclo continuo de auto-mejora.

La cuantización oQ (oMLX v0.6.3rc2) aplica una compresión mixta de 2 bits con un grupo de 64, y el sufijo `mtp` sugiere la inclusión de decodificación multi-token (multi-token prediction). No se dispone de detalles sobre el conjunto de datos de entrenamiento ni el número de tokens utilizados, pero el modelo base está optimizado para tareas de codificación y agentes, como indican los benchmarks publicados.

## Capacidades

- Generación de texto y código de alta calidad, con especialización en tareas de programación y agentes.
- Soporte de razonamiento multi-paso y uso de herramientas (tool calling), aunque no se especifica explícitamente en la información disponible.
- Capacidad de actuación como agente autónomo: el modelo puede proponer tareas, generar andajes y ejecutar soluciones, según el enfoque de auto-mejora.
- Multilingüe probable, pero no confirmado en la documentación.
- Cuantización de 2 bits que permite ejecución en dispositivos con memoria limitada, incluidos Apple Silicon mediante MLX.
- Compatible con el formato MLX safetensors, lo que facilita su uso con la librería oMLX.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para generar o completar código, con soporte de tool calling y razonamiento multi-paso. Su tamaño cuantizado lo hace viable en servidores con una sola GPU de 16 GB.
- Agente de desarrollo autónomo: gracias a su entrenamiento en auto-scaffolding, puede descomponer tareas complejas en subtareas, generar soluciones y ejecutarlas, útil en entornos de desarrollo asistido.
- Asistente de programación en local: para desarrolladores que deseen ejecutar un modelo de codificación sin conexión, en portátiles con Apple Silicon o GPUs de consumo (16 GB VRAM), con una calidad comparable a modelos más grandes.
- Aprendizaje por refuerzo en investigación: el modelo base está diseñado para auto-mejora, por lo que puede ser utilizado en experimentos de RL y generación de datos sintéticos.
- Automatización de tareas de agente: el modelo puede gestionar flujos de trabajo que requieren múltiples pasos, como navegación web, ejecución de comandos o integración con APIs, gracias a su capacidad de razonamiento y uso de herramientas.
- Prototipado rápido de aplicaciones de IA: al ser ligero (15,3 GB) y ejecutable en MLX, es adecuado para prototipos en Apple Silicon, reduciendo la latencia de despliegue en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. Sin embargo, la documentación del modelo original indica que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y también supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B. No se proporcionan valores numéricos concretos en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 15,3 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo en memoria.
- GPUs recomendadas: NVIDIA RTX 4080/4090 (16-24 GB), RTX 3080/3090 (10-24 GB), o GPUs de centro de datos con más memoria. También compatible con Apple Silicon (M1 Pro/Max o superiores) mediante MLX.
- Consumer GPUs: puede caber en una RTX 4090 (24 GB) o RTX 4080 (16 GB) con cuantización adicional, pero se recomienda verificar el uso de memoria.
- Opciones de despliegue: MLX (Apple Silicon), oMLX (para cuantización), y potencialmente conversión a GGUF para llama.cpp si se desea ejecución en CPU/GPU genérica.
- Latencia y throughput: no disponible, pero se espera que la cuantización de 2 bits aumente la velocidad de inferencia en comparación con el modelo original, a costa de una posible pérdida de calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | safetensors |
| Qwen 3.6-35B | ~35B | no disponible | no disponible | no disponible | safetensors |
| Gemma 4-31B | ~31B | 31B | no disponible | no disponible | safetensors |
| Muse Glimmer-30B | ~30B | 30B | no disponible | no disponible | safetensors |

No se dispone de información completa sobre los modelos comparados; los datos se basan en la documentación de Ornith AI, que indica que Ornith supera a estos modelos en benchmarks de codificación y agentes.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo es de código abierto ni si permite uso comercial; se recomienda contactar con el autor antes de usarlo en producción.
- Cuantización de 2 bits: puede degradar la calidad de las salidas en comparación con la versión original, especialmente en tareas de razonamiento complejo o matemáticas.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero el modelo puede presentar alucinaciones, como cualquier LLM, especialmente en tareas no relacionadas con codificación.
- Contexto limitado: no se especifica la longitud de contexto, por lo que puede ser inferior a modelos de la competencia.
- Falta de soporte de la comunidad: el modelo tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente sin validación externa.
- Dependencia de la librería oMLX: la cuantización requiere el uso de oMLX, lo que puede limitar su integración en otros frameworks (como vLLM o TGI).

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/dotyerts/Ornith-1.5-35B-A3B-oQ2.7e-mtp
- Modelo original en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith AI: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI (VRAM, benchmarks, setup): https://ornith.online/

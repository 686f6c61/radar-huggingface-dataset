# AnonMLuser/remdm-planner-craftax

## Resumen

ReMDM Planner for Craftax es un artefacto de investigación anónimo que implementa un planificador basado en modelos de difusión discreta con remasking (ReMDM) para el entorno de aprendizaje por refuerzo Craftax. El modelo genera secuencias de acciones mediante un proceso iterativo de denoising sobre tokens enmascarados, condicionado por la observación simbólica actual del entorno. Está desarrollado en JAX y forma parte de los materiales complementarios del artículo *Return-Weighted ELBO Fine-Tuning of Discrete Diffusion Planners Reduces to Self-Imitation*, actualmente en revisión por pares.

El repositorio incluye dos planificadores entrenados offline (behavior cloning con 1e8 frames) y online (DAgger con 1e8 frames), junto con dos agentes expertos PPO-RNN entrenados con 1e9 frames que actúan como supervisores. La arquitectura es un transformer bidireccional con `d_model` 384, 8 cabezas de atención, 6 capas y `d_ff` 768. Este trabajo es relevante porque aborda la intratabilidad del ajuste fino por refuerzo en planificadores de difusión discreta, proponiendo una alternativa basada en auto-imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con denoising por remasking (ReMDM) |
| Parametros totales | No disponible (config `d_model` 384, `n_heads` 8, `n_layers` 6, `d_ff` 768) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende de la longitud de la secuencia de acciones planificadas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Orbax (checkpoints de JAX) |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional que opera sobre secuencias de tokens de acción enmascarados. En cada paso de denoising, el modelo remaskea una parte de los tokens predichos con menor confianza y vuelve a muestrear, siguiendo el paradigma de los modelos de difusión discreta con remasking. La observación del entorno se condiciona el proceso de generación de la secuencia de acciones.

El entrenamiento se realizó en el entorno Craftax-Classic-Symbolic-v1, con observaciones simbólicas (no píxeles). Se entrenaron dos variantes: una con behavior cloning offline (100 millones de frames de entorno) y otra con DAgger online (100 millones de frames), ambas supervisadas por agentes expertos PPO-RNN entrenados con 1000 millones de frames. Los checkpoints se distribuyen en formato Orbax y requieren usar la configuración `final_*` correspondiente para restaurarlos correctamente.

## Capacidades

- Generación de secuencias de acciones planificadas en el entorno Craftax-Classic-Symbolic-v1.
- Planificación condicionada por la observación simbólica del estado actual del entorno.
- Denoising iterativo con remasking de tokens de baja probabilidad.
- Entrenamiento offline (BC) y online (DAgger) con supervisión de expertos PPO-RNN.
- No es un agente generalista: no transfiere a otros entornos ni a observaciones de píxeles.
- No soporta tool calling, razonamiento multilingüe ni capacidades de visión.

## Casos de uso

- Investigación en planificación con modelos de difusión discreta: el modelo sirve como punto de partida para reproducir los experimentos del artículo y comparar estrategias de fine-tuning con refuerzo.
- Estudio de la intratabilidad del RL para planificadores de difusión discreta: permite analizar por qué el fine-tuning con RL directo falla y cómo la auto-imitación (self-imitation) ofrece una alternativa.
- Comparación de behavior cloning vs. DAgger en entornos de planificación: los checkpoints offline y online permiten evaluar el efecto del modo de recopilación de datos en el rendimiento final.
- Reproducción de experimentos de planificación en Craftax: el entorno Craftax es un benchmark de RL con mecánicas tipo roguelike; este planificador sirve como baseline para futuros trabajos.
- Análisis de la influencia del tamaño de la ventana de planificación: se puede variar la longitud de las secuencias de acciones generadas y medir el impacto en el éxito de la tarea.
- Estudio de la transferencia de políticas expertas a planificadores: los checkpoints de los agentes PPO-RNN se pueden usar para supervisar otros planificadores o como referencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README indica que los resultados de evaluación y su varianza se reportan en el artículo, pero no se incluyen cifras concretas en el repositorio público.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el modelo es pequeño (d_model 384, 6 capas, 8 cabezas), por lo que es probable que quepa en GPUs de consumo con 8-12 GB VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o TPU, dado que el stack es JAX. Una RTX 3090 o superior sería suficiente.
- Cabe en consumer GPU: sí, es un modelo pequeño; el checkpoint de 0.3 GB refuerza esta estimación.
- Opciones de despliegue: JAX/Flax nativo, sin soporte directo de vLLM, llama.cpp, Ollama o TGI. Es un artefacto de investigación, no un modelo de producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReMDM Planner (este) | Transformer bidireccional + remasking diffusion | No disponible | MIT | Checkpoints Orbax en HuggingFace |
| MathisW78/remdm-craftax | ReMDM (JAX) | No disponible | No disponible | Código en HuggingFace |
| kuleshov-group/remdm | ReMDM (PyTorch) | No disponible | No disponible | Código en GitHub |

No hay modelos comparables en la misma categoría (planificadores de difusión discreta para Craftax) publicados en acceso abierto. La comparativa se limita a variantes del mismo método (offline vs. online) y a la implementación original de ReMDM para generación de texto.

## Limitaciones y advertencias

- Artefactos de investigación atados a versiones específicas de Craftax y a observaciones simbólicas; no se transfieren a otros entornos ni a observaciones de píxeles.
- No es un agente generalista: es un planificador de acciones para un entorno concreto, no un modelo de lenguaje o un agente conversacional.
- Los checkpoints de difusión para Craftax completo (con observaciones de píxeles) no se han publicado porque no se completó ningún entrenamiento.
- El modelo se construye desde la configuración, no desde el checkpoint; si se usa una config distinta a la `final_*` correspondiente, la restauración fallará.
- Los metadatos de entrenamiento (W&B run ids, rutas de clúster) se han eliminado por anonimato; los tensores de pesos son byte-idénticos a los originales.
- Licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación y no se recomienda para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonMLuser/remdm-planner-craftax
- Código fuente (repo anónimo): https://github.com/vtp5tycwm2-art/remdm-planners
- Implementación alternativa en HuggingFace: https://huggingface.co/MathisW78/remdm-craftax
- Checkpoint alternativo en HuggingFace: https://huggingface.co/MathisW78/remdm-craftax-checkpoint
- Repo de Craftax (entorno): https://github.com/MichaelTMatthews/Craftax
- Repo de ReMDM (framework original): https://github.com/kuleshov-group/remdm

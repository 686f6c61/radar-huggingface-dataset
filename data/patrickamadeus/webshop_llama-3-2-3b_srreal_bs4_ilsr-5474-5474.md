# patrickamadeus/webshop_Llama-3.2-3B_SRreal_bs4_ILSR.5474.5474

## Resumen

`webshop_Llama-3.2-3B_SRreal_bs4_ILSR.5474.5474` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` realizado por el usuario patrickamadeus para la tarea de compra online simulada WebShop. El modelo forma parte de un experimento de investigación sobre "experiencia temprana" (early experience) y "experiencia imaginada" (imagined experience), en el que se entrena al modelo con filas de experto del conjunto WebShop combinadas con filas de autorreflexión generadas por el propio Llama-3.2-3B del autor (variante `SRreal`, prompt B.1 del paper).

Se trata de un modelo de 3.212.749.824 parámetros (3,2 mil millones) con arquitectura transformer decoder-only de la familia Llama 3.2, ajustado mediante SFT con LlamaFactory durante una época sobre 21.894 filas (5.474 pasos con batch efectivo de 4). El objetivo es que el modelo aprenda a resolver tareas de compra en un entorno web interactivo, combinando imitación de trayectorias expertas con reflexiones autogeneradas que actúan como "experiencia imaginada" adicional.

Es relevante ahora porque documenta una receta concreta de entrenamiento con autorreflexión sintética sobre un benchmark de agentes (WebShop) y publica resultados con intervalos de confianza, lo que permite reproducir y comparar la contribución de cada componente (imitación, modelado implícito del mundo, autorreflexión). No obstante, el modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 (3,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento); la ventana nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors en precisión de entrenamiento, bf16) |
| Idiomas soportados | no disponibles (heredados del modelo base Llama 3.2, sin evaluación específica publicada) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3,2 mil millones de parámetros, y se somete a un ajuste fino completo (no LoRA) con LlamaFactory SFT. La configuración de entrenamiento es: learning rate 1e-5, schedule coseno con 3% de warmup, precisión bf16, optimizador paged AdamW de 8 bits, longitud máxima de 4.096 tokens y semilla 0. El entrenamiento consta de una única etapa (`ILSR.5474.5474`) que combina, mezcladas y barajadas, las filas de experto liberadas de WebShop con filas de autorreflexión escritas por el propio Llama-3.2-3B del autor (prompt B.1 del paper). Se completa 1,00 época sobre 21.894 filas en 5.474 pasos de optimización con batch efectivo de 4.

La innovación metodológica es el uso de "experiencia imaginada": reflexiones sintéticas generadas por el propio modelo que se añaden al conjunto de datos de imitación. La nomenclatura del nombre del modelo codifica el benchmark (`webshop`), el modelo base (`Llama-3.2-3B`), la variante de autorreflexión (`SRreal`), el batch (`bs4`) y la etapa de entrenamiento con sus pasos (`ILSR.5474.5474`, donde ambos números coinciden, lo que indica que la etapa está finalizada). El modelo se entrenó en la rama `runs/one-epoch` con `NR_RUN=one`.

## Capacidades

- Generación de texto y razonamiento en el contexto de tareas de agente sobre entornos web simulados (WebShop).
- Resolución de tareas de compra online: navegación por catálogo, búsqueda de productos, selección de atributos y finalización de la compra mediante acciones textuales.
- Razonamiento multi-paso: el entrenamiento con trayectorias expertas y reflexiones favorece la planificación secuencial de acciones.
- Autorreflexión: el modelo ha sido entrenado con filas de reflexión generadas por sí mismo, lo que puede favorecer la autocorrección en el bucle de agente.
- Capacidades heredadas del modelo base Llama-3.2-3B-Instruct (instrucciones generales, multilingüismo básico), aunque no se han evaluado ni documentado en esta ficha.
- Soporte de tool calling / function calling: no documentado específicamente para este ajuste; el modelo base Llama 3.2 soporta function calling, pero no hay evaluación publicada para este checkpoint.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Investigación en agentes web: reproducción del experimento de "experiencia imaginada" sobre WebShop, comparando la variante `SRreal` con las variantes de imitación pura (41,8%) y modelado implícito del mundo (60,2%) reportadas en la Tabla 1 del paper.
- Evaluación de autorreflexión sintética: uso del checkpoint como referencia para medir cuánto aporta añadir reflexiones autogeneradas al conjunto de datos de imitación en tareas de compra online.
- Baseline para ajustes finos posteriores: al ser un full fine-tune de Llama-3.2-3B-Instruct sobre WebShop, sirve como punto de partida para experimentos con más épocas, otras variantes de reflexión o mezclas de datos distintas.
- Estudio de robustez y generalización: el modelo reporta resultados tanto en el conjunto estándar (objetivos 0-499) como en un conjunto limpio de 500 objetivos sin tarea de entrenamiento liberada, lo que permite analizar la generalización a metas no vistas.
- Docencia y divulgación: ejemplo didáctico de pipeline completo de SFT con LlamaFactory, incluyendo nomenclatura de checkpoints, configuración de hiperparámetros y evaluación con intervalos de confianza.
- Análisis de la brecha entre imitación y reflexión: comparación cuantitativa entre la tasa de éxito de este checkpoint (34,2% en estándar, 30,8% en limpio) y las cifras del paper para imitación, modelado implícito y autorreflexión, útil para estudiar qué componente del entrenamiento aporta más señal.

## Benchmarks y rendimiento

Tasa de éxito en WebShop (%), temperatura 0,4, 15 pasos, con intervalo de confianza al 95%:

| Conjunto de prueba | Tasa de éxito | IC 95% |
|---|---|---|
| Objetivos estándar 0-499 | 34,2 | 30,0-38,4 |
| Conjunto limpio (500 objetivos sin tarea de entrenamiento liberada) | 30,8 | 26,8-35,0 |

Referencia del paper (Early Experience, Tabla 1, Llama-3.2-3B, WebShop):

| Variante | Tasa de éxito (%) |
|---|---|
| Imitación | 41,8 |
| Modelado implícito del mundo | 60,2 |
| Autorreflexión | 52,7 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos (3,2 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,2 GB para pesos; en 4 bits, aproximadamente 1,6 GB para pesos. No se han publicado ficheros GGUF ni cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para inferencia en bf16 sin problemas; RTX 3090/4080 también suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en bf16 o cuantizado; en GPUs de 8 GB requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `accelerate`. No se han publicado ficheros GGUF en el repo, por lo que habría que generarlos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito WebShop | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop_Llama-3.2-3B_SRreal_bs4_ILSR.5474.5474 (este) | 3,2 B | 4.096 tokens (entrenamiento) | 34,2% estándar / 30,8% limpio | llama3.2 | Hugging Face (0 descargas) |
| Llama-3.2-3B-Instruct (base) | 3,2 B | no especificado en la información disponible | no evaluado en WebShop en la información disponible | llama3.2 | Hugging Face (oficial Meta) |
| Variante "imitación" del paper (Llama-3.2-3B) | 3,2 B | no especificado | 41,8% | no disponible | no disponible |
| Variante "modelado implícito del mundo" del paper (Llama-3.2-3B) | 3,2 B | no especificado | 60,2% | no disponible | no disponible |
| Variante "autorreflexión" del paper (Llama-3.2-3B) | 3,2 B | no especificado | 52,7% | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento inferior al de las variantes del paper: este checkpoint obtiene 34,2% en el conjunto estándar, por debajo de la imitación (41,8%), el modelado implícito del mundo (60,2%) y la autorreflexión (52,7%) reportados en la Tabla 1. No debe interpretarse como una mejora sobre el modelo base en tareas generales.
- Ámbito muy restringido: el ajuste está especializado en WebShop; fuera de ese entorno, el comportamiento puede degradarse respecto al modelo base.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base Llama-3.2-3B-Instruct, no evaluados aquí.
- Riesgo de alucinación: no evaluado específicamente; en tareas de agente, las alucinaciones sobre productos o atributos pueden provocar acciones inválidas en el entorno.
- Limitaciones de contexto e idioma: la longitud máxima de entrenamiento es de 4.096 tokens; no se han publicado evaluaciones multilingües.
- Restricciones de licencia: licencia llama3.2 (Llama 3.2 Community License), que impone condiciones de uso comercial, restricciones de redistribución y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- Artefacto de investigación: 0 descargas y 0 likes, sin pipeline declarado ni ficheros GGUF publicados; no hay garantía de mantenimiento ni soporte.
- Reproducibilidad: el entrenamiento depende del prompt B.1 del paper y de la generación de reflexiones con el propio Llama-3.2-3B; pequeñas variaciones en esa generación pueden alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/webshop_Llama-3.2-3B_SRreal_bs4_ILSR.5474.5474
- Repositorio del proyecto (convención de nombres y campos): https://github.com/patrickamadeus/imagined-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper "Early Experience" (referenciado en la model card; no se proporciona URL directa en la información disponible)
- WebShop (benchmark): no se proporciona URL directa en la información disponible

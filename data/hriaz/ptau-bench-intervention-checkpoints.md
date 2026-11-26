# hriaz/ptau-bench-intervention-checkpoints

## Resumen

`hriaz/ptau-bench-intervention-checkpoints` no es un modelo único, sino una colección de 18 checkpoints de política de usuario (user-agent) obtenidos mediante post-entrenamiento sobre tareas bancarias sintéticas. Cada checkpoint corresponde a un par (modelo base, usuario simulado) entrenado con refuerzo por resultados con recompensa binaria (ORL, vía GRPO) o con recompensas de proceso paso a paso (PRM). Los modelos base empleados son Qwen3-8B, Gemma 4 E4B IT y Granite 4.2 8B, todos ellos transformers densos (o híbridos en el caso de Granite) de aproximadamente 8 000 millones de parámetros.

El propósito del repositorio es servir de material de evaluación para experimentos de intervención: cada checkpoint representa la política aprendida por un usuario concreto bajo un esquema de recompensa distinto, y se compara su comportamiento frente a un representante bancario congelado (Qwen3.8-27B). Es relevante para investigadores que estudien cómo distintas señales de recompensa (binaria vs. por pasos) moldean el comportamiento de un agente en diálogos multi-turno, y para quienes necesiten reproducir los resultados de P-τ-bench sin reentrenar.

El tamaño del repositorio (603,1 GB) se explica por acumular 18 checkpoints completos de pesos en safetensors, no por un único modelo de gran escala. No se trata de un modelo listo para producción: es un artefacto de investigación con fecha de creación posterior a la de los modelos base que referencia, sin pipeline declarado ni idiomas documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B, Gemma 4 E4B IT, Granite 4.2 8B; Granite con capas híbridas Mamba/transformer) |
| Parametros totales | ~8 000 millones por checkpoint (Qwen3-8B y Granite 4.2 8B); Gemma 4 E4B IT: no disponible |
| Parametros activos | no disponible (no se especifica configuración MoE para estos checkpoints) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada checkpoint se construye a partir de un modelo base distinto: Qwen3-8B (transformer denso con modo thinking), Gemma 4 E4B IT (modelo instruct de Google) y Granite 4.2 8B (arquitectura híbrida que combina capas transformer con capas Mamba). Sobre estos modelos se aplica un post-entrenamiento con dos variantes de refuerzo: ORL (outcome RL con recompensa binaria, implementado con GRPO) y PRM (process reward model, con recompensas por paso). Cada checkpoint está asociado a uno de tres usuarios simulados (Amara Okonkwo, Fatima Al Hassan, Kwame Asante) y a un número de paso de RL concreto (entre 20 y 90).

El entrenamiento se realiza sobre tareas bancarias sintéticas, y la evaluación de intervención utiliza siempre un representante bancario congelado (Qwen3.8-27B) para garantizar comparabilidad entre políticas. El autor documenta dos excepciones: el checkpoint Qwen User 2 PRM usa el paso 30 de adaptación corta, y el Granite User 3 PRM usa el paso 25 con ranking held-out no verificado. No se detalla el volumen de tokens de entrenamiento, la composición exacta del dataset sintético ni si se aplicó DPO adicional.

## Capacidades

- Generación de texto y diálogo multi-turno en el dominio de tareas bancarias sintéticas.
- Razonamiento orientado a objetivos bajo señales de recompensa (ORL binaria o PRM por pasos).
- Comportamiento de agente de usuario (user-agent) que simula a un cliente con una política concreta.
- Adaptación a distintos esquemas de refuerzo según el checkpoint seleccionado.
- Capacidades heredadas del modelo base (Qwen3-8B: tool calling, modo thinking; Gemma 4 E4B IT: instrucciones; Granite 4.2 8B: contexto largo y eficiencia híbrida), aunque no se documentan explícitamente para estos checkpoints.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo: comparar el efecto de ORL binaria frente a PRM por pasos sobre la política de un mismo usuario, usando los pares de checkpoints publicados (por ejemplo, Qwen User 1 ORL s60 vs. PRM s50).
- Evaluación de intervenciones en agentes conversacionales: emplear los checkpoints como políticas de usuario frente al representante bancario congelado para medir cómo reacciona el sistema ante distintos perfiles.
- Reproducción de experimentos de P-τ-bench: cargar los checkpoints con transformers y ejecutar las evaluaciones de intervención sin reentrenar.
- Estudio de robustez de modelos base: comparar cómo Qwen3-8B, Gemma 4 E4B IT y Granite 4.2 8B aprenden la misma tarea bajo idéntico esquema de recompensa.
- Análisis de curvas de aprendizaje: los distintos pasos de RL (20, 25, 30, 40, 50, 60, 70, 80, 90) permiten trazar la evolución de la política.
- Docencia y formación: usar los checkpoints como ejemplo reproducible de post-entrenamiento con GRPO y PRM en dominios sintéticos.
- Auditoría de sesgos de usuario simulado: examinar si las políticas aprendidas reproducen sesgos de los perfiles (Amara, Fatima, Kwame) en tareas bancarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe la estructura de los checkpoints y las excepciones de selección de paso; no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de τ-bench.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~16 GB por checkpoint de 8 000 millones de parámetros; en 8 bits ~8 GB; en 4 bits ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación por lotes; RTX 4090 (24 GB) suficiente para un checkpoint en fp16.
- Consumer GPU: sí, en RTX 3090/4090 (24 GB) o RTX 4070 Ti Super (16 GB) con cuantización 8 bits.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp u Ollama no están documentados para estos checkpoints, aunque podrían adaptarse los pesos.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 603,1 GB; conviene descargar solo los checkpoints necesarios mediante `huggingface-cli download` con patrones de ruta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hriaz/ptau-bench-intervention-checkpoints (Qwen3-8B) | ~8 000 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de investigación, 18 variantes |
| Qwen/Qwen3-8B | ~8 000 M | no disponible | Apache 2.0 | Hugging Face | Modelo base generalista |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible | Hugging Face | Modelo base instruct |
| ibm-granite/granite-4.2-8b | ~8 000 M | no disponible | no disponible | Hugging Face | Modelo base híbrido |

La comparación directa con alternativas de la misma categoría (agentes de usuario post-entrenados) no está disponible, ya que no se han identificado repositorios públicos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: los checkpoints están especializados en tareas bancarias sintéticas y pueden degradarse fuera de ese dominio.
- Riesgo de alucinación heredado de los modelos base, agravado por el ajuste fino sobre datos sintéticos.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Longitud de contexto no especificada en la model card; conviene verificar la del modelo base antes de usarlo en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero los modelos base (Gemma, Granite) pueden tener términos adicionales que deben respetarse.
- El checkpoint Granite User 3 PRM (paso 25) tiene ranking held-out no verificado, según el propio autor.
- El checkpoint Qwen User 2 PRM usa una adaptación corta (paso 30), lo que puede introducir un sesgo respecto al resto de políticas.
- Repositorio de 603,1 GB: requiere planificación de almacenamiento y ancho de banda.
- Sin pipeline declarado ni métricas publicadas; no apto para producción sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/hriaz/ptau-bench-intervention-checkpoints
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Gemma 4 E4B IT: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base Granite 4.2 8B: https://huggingface.co/ibm-granite/granite-4.2-8b

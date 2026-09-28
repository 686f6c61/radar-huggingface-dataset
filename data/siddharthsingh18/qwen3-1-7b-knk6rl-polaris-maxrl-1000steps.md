# siddharthsingh18/Qwen3-1.7B-KnK6RL-Polaris-MaxRL-1000steps

## Resumen

Este modelo es un ajuste por aprendizaje por refuerzo del modelo base Qwen/Qwen3-1.7B-Base, publicado por el usuario siddharthsingh18 bajo licencia Apache 2.0. No es un asistente de propósito general: es un artefacto de investigación obtenido tras 1000 pasos de RL con recompensa verificable (RLVR) sobre una única familia de puzles lógicos de tipo **Knights and Knaves** con 6 personajes (caballeros que siempre dicen la verdad y escuderos que siempre mienten). El objetivo del entrenamiento es que el modelo asigne correctamente un rol a cada personaje a partir de un conjunto de afirmaciones, con una recompensa binaria de 1 solo si la asignación final coincide con la solución única del puzle.

El modelo tiene 2.031.739.904 parámetros (~2,03 mil millones) y se distribuye únicamente en formato safetensors, con un repositorio de 4,1 GB. La arquitectura es la del transformer decoder-only denso de la familia Qwen3, heredada sin modificaciones estructurales del modelo base; el trabajo aportado consiste exclusivamente en el post-entrenamiento con RL. Los puzles de entrenamiento se generan con reasoning-gym y el pipeline de RL se ejecuta con verl.

Su relevancia es acotada y muy específica: sirve como evidencia empírica de que el RL con recompensa verificable puede aumentar la plasticidad de razonamiento de un modelo pequeño. El autor reporta que el pass@1 pasa de 0,015 (modelo base) a 0,740 (tras 1000 pasos) en 200 puzles KnK-6 reservados, y que el pass@64 sube de 0,323 a 0,973, lo que indica una mejora en la cobertura del espacio de soluciones y no solo un estrechamiento de la distribución de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (sin MoE), heredada de Qwen/Qwen3-1.7B-Base |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada (no se declara en la model card; heredada del modelo base) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors; no se distribuyen versiones GGUF, AWQ ni GPTQ. La cuantización sería posible convirtiendo los pesos, pero no está publicada |
| Idiomas soportados | Inglés (en) según los metadatos; los puzles están redactados en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (4,1 GB de repositorio, consistente con pesos en bf16/fp16) |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Pipeline declarado | text-generation |
| Longitud máxima de respuesta en entrenamiento | 4096 tokens |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B-Base: un transformer decoder-only denso de aproximadamente 2,03 mil millones de parámetros, sin mezcla de expertos. No se describe ninguna modificación estructural en la model card (no hay atención lineal, decodificación especulativa ni componentes híbridos SSM). Todo el cambio respecto al modelo original proviene del post-entrenamiento con aprendizaje por refuerzo.

El entrenamiento se realizó con verl aplicando RLVR sobre puzles de Knights and Knaves de 6 personajes generados por reasoning-gym. La configuración declarada es: estimador de ventaja `maxrl`, tasa de aprendizaje 1e-6, 1000 pasos, tamaño de lote de entrenamiento de 64 prompts, 32 rollouts por prompt, temperatura de rollout 1.0, longitud máxima de respuesta 4096 tokens, sin penalización KL (`use_kl_loss=False`, `use_kl_in_reward=False`) y sin bonus de entropía. La recompensa es binaria: 1 si la asignación enmarcada en `\boxed{}` coincide con la solución única del puzle, 0 en caso contrario; no hay crédito parcial ni bonus de formato. El prompt de entrenamiento se presenta como un único turno de usuario que termina con la instrucción *"Let's think step by step and output the final answer within \boxed{}."*.

## Capacidades

- Resolución de puzles lógicos de la familia Knights and Knaves en configuración de 6 personajes: asignar el rol (caballero o escudero) a cada personaje a partir de afirmaciones encadenadas.
- Razonamiento de cadena larga en inglés: el formato de respuesta entrenado induce un razonamiento paso a paso antes de emitir la respuesta final dentro de `\boxed{}`.
- Formato de salida consistente: el autor reporta una puntuación de formato de 0,984 en la validación, es decir, el modelo casi siempre emite la respuesta en el formato esperado.
- Generación de texto conversacional básica, heredada del modelo base (los tags incluyen `conversational` y `text-generation`).
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso fuera del puzle: no disponible; el comportamiento fuera de la distribución de entrenamiento no está caracterizado por el autor.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales: no hay modo de pensamiento explícito configurable, ni visión, ni audio. El "modo thinking" es implícito al formato de prompt entrenado.

## Casos de uso

- Investigación sobre plasticidad en RL: el modelo es un punto de datos reproducible para estudiar cuánto puede mejorar un modelo denso de ~2 B mediante RLVR puro sobre una tarea verificable, con curvas de pass@1 y pass@64 medibles.
- Estudio de estimadores de ventaja: al declarar `maxrl` como estimador y publicar los hiperparámetros completos (lr 1e-6, 32 rollouts por prompt, sin KL), sirve como referencia para comparar variantes de estimadores de ventaja en pipelines verl.
- Generación de datos de razonamiento lógico: el modelo puede usarse para producir trazas de solución de puzles KnK-6 que después se filtren por corrección y se empleen en destilación o entrenamiento de modelos mayores.
- Evaluación de recompensas verificables: al tener una función de recompensa binaria y objetiva, es un banco de pruebas ideal para validar implementaciones de RLVR antes de escalarlas a tareas más complejas.
- Docencia e investigación en lógica proposicional: como solucionador acotado de un tipo de puzle con solución única, permite ilustrar formalizaciones de Knights and Knaves y comparar el comportamiento del modelo con un solucionador simbólico.
- Análisis de robustez y generalización: puede emplearse para medir cuánto se degrada el rendimiento al aumentar el número de personajes (por ejemplo 7 u 8) o al parafrasear los enunciados, ya que el autor advierte que el comportamiento fuera de la distribución de 6 personajes no está caracterizado.
- Comparativa de eficiencia en modelos pequeños: sirve para contrastar el coste (1000 pasos, lotes de 64 prompts, 32 rollouts) frente a la ganancia obtenida en una tarea de precisión binaria, útil para decidir presupuestos de cómputo en proyectos de RL.

## Benchmarks y rendimiento

Validación sobre 200 puzles KnK-6 reservados, con 64 muestras por puzle a temperatura 0,6 y top_p 0,95:

| Modelo | pass@1 | pass@64 | Formato |
|---|---|---|---|
| Qwen3-1.7B-Base (paso 0) | 0,015 | 0,323 | — |
| Este modelo (paso 1000) | 0,740 | 0,973 | 0,984 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 4,1 GB solo para los pesos, más el caché KV. Con 4096 tokens de respuesta y un lote moderado, es razonable reservar 6-8 GB en total.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,2 GB de pesos; en 4 bits, aproximadamente 1,2-1,5 GB. Estas cuantizaciones no están publicadas y requerirían conversión propia.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente para inferencia en bf16 con lotes pequeños (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para lotes grandes o servicio concurrente, A100 40/80 GB o H100 aportan margen de sobra.
- Cabe en GPU de consumo: sí, holgadamente, en tarjetas de 8 GB o más. En 4 bits cabría incluso en GPUs de 6 GB.
- Opciones de despliegue: al ser un modelo Qwen3 estándar en safetensors, es compatible con vLLM, TGI, SGLang y transformers. llama.cpp u Ollama requerirían convertir primero los pesos a GGUF, ya que no se publica ninguna versión cuantizada.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en KnK-6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B-KnK6RL-Polaris-MaxRL-1000steps) | ~2,03 B | No disponible | pass@1 0,740 / pass@64 0,973 | Apache 2.0 | HuggingFace, solo safetensors |
| Qwen3-1.7B-Base | ~2,03 B | No disponible en la información proporcionada | pass@1 0,015 / pass@64 0,323 | Apache 2.0 | HuggingFace |
| Otros modelos pequeños especializados en razonamiento lógico mediante RLVR | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card solo ofrece comparación directa contra su propio modelo base. No se han identificado en la información disponible otros modelos comparables con métricas publicadas sobre la misma tarea KnK-6.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente general: el autor indica explícitamente que fue optimizado para una única familia de puzles y que su comportamiento fuera de esa distribución no está caracterizado.
- Riesgo alto de degradación fuera de dominio: al haberse entrenado 1000 pasos con RL sin penalización KL ni bonus de entropía, es esperable una pérdida de capacidades generales del modelo base, aunque no se publican mediciones de ello.
- Especialización estrecha: solo se ha validado la configuración de 6 personajes. No hay datos sobre 3, 4, 5, 7 u 8 personajes, ni sobre variantes del puzle.
- Riesgo de alucinación en tareas abiertas: el modelo no incorpora mecanismos de abstención ni de verificación; en dominios distintos al entrenado puede generar texto plausible pero incorrecto sin señalizarlo.
- Cobertura de idiomas limitada: los metadatos declaran únicamente inglés. Los puzles de entrenamiento están en inglés y se desconoce el comportamiento en castellano u otros idiomas.
- Sesgos: no se han publicado análisis de sesgos. Al derivar de Qwen3-1.7B-Base, hereda los sesgos y limitaciones de dicho modelo.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el propio autor desaconseja tratarlo como un producto y señala que hereda la licencia y limitaciones del modelo base.
- Longitud de contexto: aunque el entrenamiento usa respuestas de hasta 4096 tokens, no se declara la ventana de contexto efectiva en la model card; conviene verificarla antes de desplegarlo con prompts largos.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que añade trabajo de conversión para despliegues en CPU o GPUs pequeñas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento ni soporte por parte del autor.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo (corresponden a sucursales bancarias sin relación alguna).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthsingh18/Qwen3-1.7B-KnK6RL-Polaris-MaxRL-1000steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- reasoning-gym (generador de los puzles): https://github.com/open-thought/reasoning-gym
- verl (framework de RL empleado): https://github.com/volcengine/verl
- Paper o blog del autor: no disponible
- Demo: no disponible
- Resultados de búsqueda web relevantes: no disponible (los resultados devueltos no guardan relación con el modelo)

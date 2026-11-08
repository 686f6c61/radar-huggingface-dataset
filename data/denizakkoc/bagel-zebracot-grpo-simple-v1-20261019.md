# denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v1-20261019

## Resumen

BAGEL-ZebraCoT-GRPO-Simple-v1-20261019 es un conjunto de adaptadores LoRA (rango 64, alpha 128) entrenados mediante GRPO sobre el modelo multimodal BAGEL-7B, en su variante pública `multimodal-reasoning-lab/Bagel-Zebra-CoT`. Lo desarrolla el investigador independiente denizakkoc y se publica como archivo de investigación con 13 checkpoints supervivientes del segmento de entrenamiento `n6_10k_4node_20261019`, no como un modelo consolidado listo para producción.

El objetivo del trabajo es el razonamiento visual encadenado (visual chain-of-thought) sobre el dataset Zebra-CoT, que cubre 13 categorías de tareas: búsqueda visual, puzles, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. El modelo base BAGEL es un transformer multimodal de 7.000 millones de parámetros que combina comprensión y generación de imágenes; aquí se adaptan ambos expertos (understanding y generation).

La relevancia de esta publicación es fundamentalmente metodológica y de transparencia: el autor documenta explícitamente un fallo de diseño en el juez de recompensa (el juez visual podía ver la respuesta de referencia, lo que filtró señal de corrección en las puntuaciones visuales y generó ventajas ruidosas en grupos donde todas las respuestas eran incorrectas). Se trata, por tanto, de un artefacto de auditoría de investigación más que de un modelo recomendado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal BAGEL (base de 7B con expertos de comprensión y generación); adaptadores LoRA sobre el modelo base |
| Parametros totales | No disponible con precisión; el modelo base es BAGEL-7B (7.000 millones) y los adaptadores LoRA se suman sobre él |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints son pesos entrenables en formato propio, no cuantizaciones publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de parámetros entrenables de BAGEL (adaptadores personalizados, no exportación PEFT `save_pretrained`); no son modelos fusionados autónomos |

## Arquitectura y entrenamiento

El modelo base es BAGEL, un transformer multimodal que integra un experto de comprensión visual y un experto de generación de imágenes. Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128, adaptando ambos expertos. El entrenamiento usa GRPO (Group Relative Policy Optimization) con rollouts por prompt (6 candidatos en el segmento principal de octubre), resolución de 512 px y 50 pasos de difusión. Los GPUs de política ejecutan el modelo entrenable y GPUs dedicadas ejecutan el juez congelado Qwen2.5-VL-72B-AWQ.

El segmento principal documentado (`n6_10k_4node_20261019`) arrancó el 2026-10-19 y guardó su último checkpoint (`checkpoint-step-704`) el 2026-10-21, con 932 ejemplos representados en el cursor de datos, 4 GPUs de política y 4 de juez, 6 rollouts por prompt y 37,869 horas de procesamiento de prompts en un ventana de 40,365 horas. Todo el cómputo se realizó en NVIDIA A100 del clúster CINECA Leonardo. La revisión del base BAGEL registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`. El dataset principal tiene 13 categorías y un hash de membresía/orden `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`.

La innovación (y el problema) central es el diseño del reward: se sustituyó un juez estricto de grounding multi-paso por un juez indulgente de calidad visual/corrección combinado con coincidencia de respuesta por reglas (letras/números). El propio autor documenta que el juez visual podía ver la respuesta de referencia, lo que provocó filtrado de corrección en las puntuaciones visuales y ventajas ruidosas en grupos con todas las respuestas erróneas.

## Capacidades

- Razonamiento visual encadenado (visual chain-of-thought) sobre imágenes y problemas estructurados.
- Comprensión de imágenes (experto de understanding adaptado).
- Generación de imágenes (experto de generation adaptado).
- Resolución de tareas de búsqueda visual, laberintos, matrices tipo Raven, ARC-AGI, ajedrez, tetris, cifrados.
- Razonamiento en dominios científicos: física, geometría, química.
- Algoritmos de grafos y programación competitiva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el razonamiento encadenado es interno al CoT visual.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible como capacidad separada.

## Casos de uso

- Investigación en aprendizaje por refuerzo multimodal: sirve como referencia reproducible de un pipeline GRPO con LoRA sobre BAGEL, útil para estudiar el impacto del diseño del juez de recompensa en la estabilidad del entrenamiento.
- Auditoría de reward hacking: los checkpoints permiten analizar cómo un juez visual con acceso a la respuesta de referencia introduce filtrado de corrección y ventajas ruidosas, un caso de estudio concreto de fallo de reward.
- Reproducción de experimentos de razonamiento visual: el `checkpoint_manifest.json` y los `training_metadata.json` por checkpoint permiten reconstruir configuraciones (resolución, pasos de difusión, candidatos, learning rates, coeficiente KL, pesos de reward, semilla).
- Estudio de tareas ARC-AGI y matrices de Raven: el modelo está entrenado sobre categorías específicas de razonamiento abstracto visual, útil para comparar con enfoques simbólicos.
- Benchmarking de visual CoT: base para evaluar la calidad de cadenas de razonamiento intercaladas texto-imagen en dominios científicos y de puzles.
- Docencia y formación: ejemplo práctico de entrenamiento con GRPO, LoRA y jueces multimodales en un clúster HPC (Slurm, CINECA Leonardo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones almacenadas son evaluaciones guardadas, no inferencia re-ejecutada, y que las puntuaciones corregidas del 27 de octubre tienen precedencia; no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 16,8 GB (incluye 13 checkpoints de adaptadores, no un único modelo). El modelo base BAGEL-7B requiere cargarse aparte.
- GPU recomendadas: NVIDIA A100 (usadas en el entrenamiento en CINECA Leonardo). Para inferencia del base 7B en precisión completa se recomienda A100 40/80 GB o H100.
- Cabe en GPU consumer: no confirmado; un 7B en cuantización de 4 bits podría caber en GPUs de 24 GB (RTX 3090/4090), pero no hay datos publicados de cuantización para estos adaptadores.
- Opciones de despliegue: no disponible; los checkpoints son state dicts personalizados de BAGEL, no exportaciones PEFT estándar, por lo que requieren el código de entrenamiento del autor y el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Simple-v1 (este) | Base 7B + LoRA r64 | No disponible | Apache 2.0 | Checkpoints de investigación, 13 archivos | Adaptadores GRPO, no modelo consolidado |
| Bagel-Zebra-CoT (base) | 7B | No disponible | No disponible en la información | Hugging Face | Modelo base multimodal con visual CoT |
| BAGEL-7B (original) | 7B | No disponible | No disponible en la información | Hugging Face | Modelo multimodal de comprensión y generación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El juez de recompensa tenía fuga de información: podía ver la respuesta de referencia, lo que contaminó las puntuaciones visuales y produjo ventajas ruidosas en grupos con todas las respuestas erróneas.
- No es un modelo consolidado: son 13 checkpoints de investigación con variantes y estados intermedios, no el mejor checkpoint seleccionado por held-out.
- Los pesos son state dicts personalizados de BAGEL, no exportaciones PEFT `save_pretrained`; no se pueden cargar con herramientas estándar sin el código del autor.
- El repositorio no incluye el modelo base; es necesario descargar `multimodal-reasoning-lab/Bagel-Zebra-CoT` por separado.
- Idioma limitado al inglés.
- No se ha descartado solapamiento semántico entre la exposición SFT pública y los benchmarks, lo que puede inflar resultados.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser artefactos de investigación con fallos de reward documentados, no se recomienda para producción.
- Los intentos fallidos sin pesos guardados no se pueden reconstruir, lo que limita la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v1-20261019
- Perfil del autor: https://huggingface.co/denizakkoc
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Paper Zebra-CoT: https://paperswithcode.co/paper/2507.16746

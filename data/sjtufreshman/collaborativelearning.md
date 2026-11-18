# SJTUFreshman/collaborativelearning

## Resumen

Collaborative Learning (CL) es un conjunto de adaptadores LoRA de rango 64 publicados por SJTUFreshman para estudiar cómo modelos "rebanados" (sliced models) de la familia Qwen3 pueden colaborar en tareas de razonamiento manteniendo un presupuesto de parámetros comparable al de un modelo único más grande. El repositorio acompaña a un trabajo de investigación sobre aprendizaje colaborativo multiagente y no constituye un modelo base entrenado desde cero: son pesos PEFT que se aplican sobre Qwen3-1.7B, Qwen3-4B y Qwen3-8B.

La propuesta técnica combina tres piezas: partición del modelo (model slicing), destilación de protocolo (protocol distillation) y supervisión en pirámide (pyramid supervision), de modo que varios agentes comparten estado de tarea a lo largo de pasos de razonamiento encadenados. El conjunto cubre cuatro familias de tareas —QA multi-salto, matemáticas, generación de código y generación con restricciones— evaluadas sobre MuSiQue, GSM-Hard, MATH, MultiPL-E y Conifer.

Es relevante ahora porque propone una alternativa a los sistemas multiagente homogéneos y a los baselines de RL multiagente (MAD, AgentVerse, AFlow, GPTSwarm, MAGRPO, MAPoRL, AT-GRPO), reportando mejoras medias de 2,38 puntos porcentuales frente a Qwen3-14B en los diez métricas evaluadas. El repositorio tiene 3.268 descargas y un tamaño de 39 GB, lo que refleja que agrupa múltiples checkpoints por benchmark y por modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers Qwen3; sistema multiagente con model slicing, protocol distillation y pyramid supervision |
| Parametros totales | No disponible (adaptadores LoRA de rango 64 sobre bases de 1.7B, 4B y 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son adaptadores safetensors en precision de entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El sistema se apoya en modelos transformer Qwen3 de tres tamaños (1.7B, 4B y 8B) que se "rebanan" en subsistemas colaborativos. Cada agente recibe un adaptador LoRA de rango 64 entrenado para su rol dentro del protocolo compartido. La innovación central es la destilación de protocolo: se transfiere a los modelos pequeños la capacidad de comunicarse y construir sobre un estado de tarea común, en lugar de limitarse a concatenar respuestas. La supervisión en pirámide organiza las señales de entrenamiento en varios niveles de granularidad, de modo que los agentes aprenden tanto el resultado final como los pasos intermedios del razonamiento.

Los datos de entrenamiento concretos (número de tokens, composición del corpus, uso de RLHF o DPO) no están detallados en la información disponible. La evaluación se realizó sobre cinco benchmarks con los siguientes volúmenes: 2.417 ejemplos de MuSiQue, 132 de GSM-Hard, 500 problemas de MATH, 1.352 problemas de test de MultiPL-E y 1.402 trayectorias de Conifer. El repositorio incluye el código de implementación, los scorers de benchmark, los registros de resultados y las configuraciones en un repositorio complementario de GitHub.

## Capacidades

- Razonamiento multi-salto sobre documentos: responde preguntas que requieren composición de evidencia recuperada (MuSiQue).
- Razonamiento matemático robusto: resuelve problemas numéricos tipo GSM-Hard y problemas de competición tipo MATH.
- Generación de código en ocho lenguajes: evaluado con pass@1 ponderado y macro por lenguaje en MultiPL-E.
- Generación con restricciones: produce salidas que satisfacen restricciones explícitas y cobertura (Conifer).
- Colaboración multiagente: varios modelos comparten estado de tarea y se coordinan a través de un protocolo destilado.
- Razonamiento multi-paso: el diseño está orientado a cadenas de pasos con supervisión intermedia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible como característica documentada del adaptador.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Respuesta a preguntas sobre documentación técnica: el sistema multiagente puede descomponer una consulta en subpreguntas, recuperar evidencia en varios documentos y componer la respuesta, aprovechando el entrenamiento específico en MuSiQue para razonamiento composicional.
- Tutoría matemática automatizada: para problemas de aritmética compleja y competición, los adaptadores sobre Qwen3-4B/8B ofrecen una precisión reportada de 71,97 en GSM-Hard y 78,40 en MATH, adecuada para generar soluciones paso a paso con verificación intermedia.
- Asistente de programación en pipelines internos: con pass@1 ponderado de 59,39 en MultiPL-E, puede emplearse para autocompletar y generar funciones en ocho lenguajes dentro de un IDE o servicio de revisión de código.
- Generación de contenido con restricciones de formato: plantillas de informes, fichas o respuestas que deben cumplir un conjunto explícito de requisitos (longitud, campos obligatorios, cobertura temática), apoyándose en el entrenamiento sobre Conifer.
- Investigación en sistemas multiagente: el repositorio sirve como referencia reproducible para comparar estrategias de colaboración (homogénea frente a heterogénea) con los baselines publicados.
- Despliegue con presupuesto de parámetros ajustado: al combinar adaptadores sobre Qwen3-1.7B/4B/8B, un equipo puede aproximar el rendimiento de un modelo de 14B con un coste de inferencia menor, según la comparación de eficiencia del paper.
- Evaluación comparativa de métodos de RL multiagente: los checkpoints por benchmark permiten reproducir las tablas del artículo y auditar los scorers incluidos en el repositorio de código.

## Benchmarks y rendimiento

Resultados reportados en el paper (porcentajes; MuSiQue, GSM-Hard y MATH como accuracy / F1; MultiPL-E como pass@1 ponderado / macro-lenguaje; Conifer como Coverage / Explicit):

| Metodo | MuSiQue | GSM-Hard | MATH | MultiPL-E | Conifer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Qwen3-14B | 39,55 / 49,70 | 68,94 / 80,69 | 74,60 / 82,86 | 55,18 / 57,34 | 88,00 / 95,72 |
| SE-RL | 41,76 / 52,73 | 68,18 / 79,67 | 76,00 / 80,70 | 60,43 / 62,55 | 88,00 / 95,81 |
| MAD | 39,51 / 50,59 | 66,67 / 74,18 | 72,40 / 81,32 | 55,03 / 55,35 | 88,55 / 95,84 |
| AgentVerse | 41,99 / 52,85 | 71,97 / 78,44 | 68,20 / 79,42 | 59,25 / 59,83 | 87,74 / 95,86 |
| AFlow | 41,83 / 50,36 | 68,18 / 76,04 | 65,00 / 76,53 | 42,83 / 42,46 | 87,92 / 96,51 |
| GPTSwarm | 36,20 / 47,37 | 70,45 / 78,39 | 69,20 / 79,90 | 51,63 / 52,43 | 88,17 / 95,96 |
| MAGRPO | 40,13 / 51,74 | 65,91 / 76,44 | 65,00 / 76,01 | 49,93 / 49,93 | 88,58 / 95,82 |
| MAPoRL | 40,59 / 52,74 | 63,64 / 75,34 | 70,80 / 80,87 | 53,25 / 53,27 | 86,37 / 89,19 |
| AT-GRPO | 41,54 / 53,51 | 64,39 / 76,86 | 74,20 / 83,70 | 57,91 / 58,74 | 86,60 / 95,85 |
| Homo. MAS | 26,40 / 32,82 | 71,21 / 79,93 | 68,20 / 76,41 | 56,36 / 57,20 | 88,02 / 94,27 |
| Homo. CL | 36,00 / 47,19 | 60,61 / 76,51 | 68,60 / 77,95 | 53,33 / 52,65 | 88,15 / 95,22 |
| CL (ours) | 42,37 / 53,43 | 71,97 / 81,15 | 78,40 / 85,25 | 59,39 / 59,63 | 88,90 / 95,90 |

CL es mejor o empatado en 6 de las 10 métricas, supera a Qwen3-14B en las diez y gana una media de 2,38 puntos porcentuales sobre esa referencia. En MATH acierta 392 de 500 problemas (78,40 % de accuracy, 85,25 % de F1) con el scorer de evaluación del paper.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Al ser adaptadores LoRA sobre Qwen3-1.7B, 4B y 8B, el requisito dominante es el del modelo base en la precisión elegida; para el 8B en FP16 se necesitan aproximadamente 16 GB solo de pesos, y el 1.7B en FP16 ronda los 3,4 GB, aunque estas cifras son estimaciones generales y no vienen del repositorio.
- GPU recomendadas: no disponible. Por tamaño de base, el adaptador de 1.7B es apto para GPUs de consumo tipo RTX 4090 o RTX 3090; el de 8B requiere GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100) para inferencia en FP16.
- Cabe en GPU de consumo: el adaptador sobre Qwen3-1.7B sí; el de 8B depende de la cuantización del base, que no está documentada.
- Opciones de despliegue: la librería declarada es PEFT, por lo que el flujo natural es transformers + peft; para servir el modelo base con adaptadores se puede usar vLLM o TGI con soporte LoRA, aunque no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Collaborative Learning (este) | LoRA r64 sobre 1.7B/4B/8B | No disponible | MATH 78,40 / MuSiQue 42,37 / MultiPL-E 59,39 | No disponible | Hugging Face (PEFT) |
| Qwen3-14B | 14B | No disponible | MATH 74,60 / MuSiQue 39,55 / MultiPL-E 55,18 | No disponible | Hugging Face |
| AT-GRPO | No disponible | No disponible | MATH 74,20 / MultiPL-E 57,91 | No disponible | No disponible |
| Homo. MAS | No disponible | No disponible | GSM-Hard 71,21 / MultiPL-E 56,36 | No disponible | No disponible |

La comparación relevante es frente a Qwen3-14B como referencia de modelo único y frente a los baselines multiagente del paper. CL no es un modelo base alternativo, sino un conjunto de adaptadores que se aplican sobre Qwen3, por lo que la comparación directa de parámetros no aplica.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; hay que contactar con el autor antes de integrarlo en producción.
- Los pesos son adaptadores LoRA, no un modelo autónomo: requieren descargar y cargar el modelo base Qwen3 correspondiente, con su propia licencia y condiciones.
- Los benchmarks reportados provienen del paper y no de una reevaluación independiente de esta release de pesos; el propio autor lo indica.
- El repositorio pesa 39 GB y agrupa múltiples checkpoints por benchmark y modelo base, lo que complica el despliegue selectivo y el versionado.
- Riesgo de alucinación inherente a los modelos Qwen3 subyacentes; no se documentan mecanismos adicionales de mitigación.
- El sistema multiagente incrementa el número de invocaciones por consulta, lo que puede encarecer la inferencia frente a un modelo único del mismo presupuesto.
- No hay información sobre sesgos, filtrado de datos ni evaluación de seguridad.
- La longitud de contexto efectiva no está documentada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SJTUFreshman/collaborativelearning
- Repositorio de código complementario: https://github.com/SJTUFreshman/tmp_x7k9p4r2d8m5c
- Figura 1 (visión general): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure1.pdf
- Figura 2 (slicing, destilación y supervisión): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure2.pdf
- Figura 3 (ablation): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure3.pdf
- Figura 4 (eficiencia): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure4.pdf
- Checkpoints MuSiQue: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MuSiQue
- Checkpoints GSM-Hard: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/GSM-Hard
- Checkpoints MATH: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MATH
- Checkpoints MultiPL-E: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MultiPL-E
- Checkpoints Conifer: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/Conifer
- Dataset MuSiQue: https://github.com/StonyBrookNLP/musique
- Benchmark MultiPL-E: https://github.com/nuprl/MultiPL-E
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B

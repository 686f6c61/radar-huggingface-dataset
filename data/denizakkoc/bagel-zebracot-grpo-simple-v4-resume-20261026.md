# denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v4-Resume-20261026

## Resumen

BAGEL-ZebraCoT-GRPO-Simple-v4-Resume-20261026 es un checkpoint de investigación publicado por el usuario denizakkoc en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos entrenables (adaptadores LoRA) sobre el modelo base multimodal-reasoning-lab/Bagel-Zebra-CoT, un modelo de la familia BAGEL orientado al razonamiento visual. El repositorio contiene tres archivos de checkpoint supervivientes del entrenamiento con GRPO (Group Relative Policy Optimization) sobre el dataset Zebra-CoT, y está pensado como archivo de experimento más que como artefacto listo para producción.

El modelo aborda el problema del razonamiento visual encadenado (chain-of-thought visual) en tareas como búsqueda visual, rompecabezas, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. El entrenamiento emplea LoRA de rango 64 y alpha 128 aplicado tanto al experto de comprensión como al de generación del modelo base, con recompensas evaluadas por un juez congelado Qwen2.5-VL-72B-AWQ.

La relevancia de esta ficha es limitada desde el punto de vista práctico: se trata de un checkpoint intermedio de un experimento de investigación, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y con advertencias explícitas del autor sobre métricas infladas por respuestas vacías. Es útil como referencia para quienes investigan RL aplicado a razonamiento multimodal, pero no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL multimodal (expertos de comprensión y generación) con adaptadores LoRA; detalles completos de la arquitectura base no disponibles |
| Parametros totales | no disponible (el repo ocupa 3,9 GB y contiene solo pesos entrenables/adaptadores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el juez de recompensa usa Qwen2.5-VL-72B-AWQ, pero no se documentan cuantizaciones del modelo entrenado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoints personalizados de pesos entrenables (no son exportaciones PEFT estándar `save_pretrained` ni modelos fusionados); se excluyen archivos de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo base es BAGEL-ZebraCoT, de multimodal-reasoning-lab, con revisión registrada `ebce32410ee2062d073feae484ea2c6c1515fba8`. Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128 que afectan tanto al experto de comprensión como al de generación. El entrenamiento usa GRPO con 6 rollouts por prompt, 4 GPUs de política y 4 GPUs de juez dedicadas en NVIDIA A100 sobre el clúster CINECA Leonardo. El checkpoint `checkpoint-step-2114` representa 2.828 ejemplos con un cursor heredado del checkpoint simple-v3 (2.572 ejemplos) y cambios en el juzgado por imagen de referencia de la v4.

La configuración de octubre usa resolución de 512 px, 50 pasos de difusión y 6 candidatos por prompt, en contraste con las ejecuciones pequeñas de septiembre que usaban 256 px, 8 pasos y 2 candidatos. El dataset principal de 10k ejemplos cubre 13 categorías (búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva), con hash de membresía/orden `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`. El autor advierte que no se descartó solapamiento semántico con benchmarks ni exposición SFT pública.

## Capacidades

- Razonamiento visual encadenado (chain-of-thought visual) sobre imágenes, con generación de pasos intermedios.
- Resolución de tareas de búsqueda visual, rompecabezas, ajedrez, tetris, cifrados y laberintos.
- Razonamiento abstracto con matrices tipo Raven y tareas ARC-AGI.
- Razonamiento científico en física, geometría y química a partir de entradas visuales.
- Algoritmos de grafos y programación competitiva en formato multimodal.
- Entrenamiento con recompensa basada en juez multimodal (Qwen2.5-VL-72B-AWQ), lo que implica capacidad de ser evaluado por un juez externo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: parcial, limitado al razonamiento encadenado dentro de una sola respuesta; no se documentan capacidades agénticas.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales: modo de razonamiento visual con pasos de difusión (50 pasos en la config de octubre); no se documentan visión general, audio ni thinking mode explícito.

## Casos de uso

- Investigación en RL para razonamiento multimodal: el checkpoint sirve como referencia reproducible para estudiar GRPO con LoRA sobre modelos BAGEL, comparando variantes v2/v3/v4 y configuraciones de juez.
- Evaluación de recompensas con juez multimodal: el diseño con 4 GPUs de juez dedicadas a Qwen2.5-VL-72B-AWQ es un caso práctico para quienes construyen pipelines de reward modeling con modelos congelados.
- Reproducción de experimentos de razonamiento visual: el manifiesto `checkpoint_manifest.json` y los `training_metadata.json` permiten reconstruir cursores, fechas y configuraciones para replicar el entrenamiento.
- Estudio de sesgos de evaluación: la corrección de puntuaciones infladas por respuestas vacías es un caso concreto para investigar métricas de accuracy en tareas de razonamiento visual.
- Análisis de tareas ARC-AGI y matrices Raven: el modelo está entrenado específicamente en estas categorías, por lo que puede usarse como baseline en estudios comparativos de razonamiento abstracto.
- Auditoría de provenance y reproducibilidad: los checksums SHA-256 y los registros de asignación Slurm permiten auditar el coste computacional real (10,662 horas de asignación, 8 GPUs) de un experimento de RL multimodal.

## Benchmarks y rendimiento

La información disponible incluye una tabla de evaluación parcial con la fila `zebra_v4_resume_8gpu_20261026` truncada, sin valores de preguntas, aciertos ni accuracy. El autor indica que la puntuación original en held-out estaba inflada por respuestas vacías y que la puntuación corregida (respuestas vacías marcadas como incorrectas) es el resultado primario, pero no se proporcionan los valores numéricos en la información disponible.

| Evaluación | Paso | Preguntas | Correctas | Accuracy | Scoring |
|---|---:|---:|---:|---|---|
| `zebra_v4_resume_8gpu_20261026` | no disponible | no disponible | no disponible | no disponible | corrección de respuestas vacías como incorrectas |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo de 3,9 GB contiene solo adaptadores y checkpoints de pesos entrenables, no el modelo base completo, por lo que la VRAM depende del modelo BAGEL-ZebraCoT subyacente.
- GPU recomendadas: NVIDIA A100 (usadas en el entrenamiento en CINECA Leonardo); no se documentan requisitos de inferencia.
- Cabe en consumer GPU: no disponible; depende del modelo base y de la cuantización elegida.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Los checkpoints son personalizados y no son exportaciones PEFT estándar, lo que complica el despliegue directo.
- Latencia y throughput: no disponibles. El entrenamiento usó 50 pasos de difusión y 6 candidatos por prompt en la configuración de octubre, lo que sugiere una inferencia costosa, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Simple-v4-Resume-20261026 | no disponible (adaptadores LoRA sobre BAGEL-ZebraCoT) | no disponible | sin benchmarks publicados | apache-2.0 | checkpoint de investigación, 0 descargas |
| multimodal-reasoning-lab/Bagel-ZebraCoT (modelo base) | no disponible | no disponible | no disponible | no disponible | disponible en Hugging Face |
| Qwen2.5-VL-72B-AWQ (usado como juez) | 72B (cuantizado AWQ) | no disponible | no disponible en esta ficha | no disponible | disponible en Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor advierte explícitamente que la puntuación original en held-out estaba inflada por respuestas vacías; la puntuación corregida es la primaria, pero no se publican los valores.
- No es un modelo fusionado ni una exportación PEFT estándar: requiere el modelo base `multimodal-reasoning-lab/Bagel-ZebraCoT` y código personalizado para cargar los pesos.
- Solo soporta inglés (`en`); no hay capacidades multilingües documentadas.
- Riesgo de alucinación y sesgos: no documentados por el autor, pero inherentes a un checkpoint de investigación sin evaluación exhaustiva.
- Posible solapamiento semántico con benchmarks y exposición SFT pública no descartada, lo que puede inflar métricas de evaluación.
- Licencia apache-2.0 permite uso comercial, pero el estado de investigación, la falta de benchmarks y la dependencia del modelo base hacen desaconsejable su uso en producción.
- El repositorio contiene solo 3 checkpoints supervivientes; los intentos fallidos sin pesos guardados no se pueden reconstruir.
- El checkpoint se guardó tras una cancelación de Slurm (estado `CANCELLED`), lo que puede implicar un estado de entrenamiento no finalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v4-Resume-20261026
- Perfil del autor: https://huggingface.co/denizakkoc
- Dataset del autor: https://huggingface.co/denizakkoc/datasets
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-ZebraCoT
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.

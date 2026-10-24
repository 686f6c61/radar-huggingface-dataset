# racheleven11/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario racheleven11. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT/safetensors (0,2 GB de repositorio) que debe servirse junto al modelo base. Se ha entrenado con el framework `scottyrl` en el contexto de la asignatura 11-768 (AI Agents) de CMU, como entrega de la práctica 3.

El nombre del run (`p5_textcraft_grpo`) indica que la especialización se ha realizado mediante aprendizaje por refuerzo de tipo GRPO sobre TextCraft-Synth, un entorno de tareas de crafting textual orientado a agentes. El adaptador se exportó desde Tinker (`tinker://model_c3776a5a/v50`) y se evalúa sirviéndolo con vLLM en modo multi-LoRA sobre las particiones de validación medium y hard del citado conjunto.

Su relevancia es fundamentalmente metodológica: documenta un pipeline reproducible de ajuste fino ligero con RL para agentes sobre un modelo de 4B, con instrucciones explícitas de despliegue y evaluación. No hay métricas publicadas, licencia declarada ni validación por parte de la comunidad (0 descargas, 0 likes), por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un transformer denso `Qwen/Qwen3.5-4B`; arquitectura interna del modelo base no disponible |
| Parámetros totales | Aproximadamente 4 000 millones en el modelo base; el adaptador añade un conjunto reducido de parámetros LoRA (magnitud exacta no disponible) |
| Parámetros activos | No aplica (el modelo base es denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre `Qwen/Qwen3.5-4B`. No se documentan en la model card los módulos concretos a los que se aplica el adaptador (atención, MLP o ambos), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de SFT, RLHF o DPO. La única señal sobre el algoritmo de entrenamiento proviene del nombre del run, que apunta a GRPO (Group Relative Policy Optimization), un método de RL sin modelo crítico que estima la ventaja relativa dentro de grupos de muestras generadas para una misma indicación.

El framework utilizado es `scottyrl`, con configuración en `configs/p5_textcraft_grpo.yaml` y commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`. El adaptador se exportó desde Tinker con el identificador `tinker://model_c3776a5a/v50`, lo que sugiere una ejecución gestionada en esa plataforma con al menos 50 pasos o versiones de checkpoint. La tarea de entrenamiento es TextCraft-Synth, un entorno de resolución de recetas mediante acciones textuales, lo que sitúa al adaptador en el dominio de razonamiento multi-paso con herramientas simbólicas.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base `Qwen/Qwen3.5-4B`; no verificados de forma independiente en esta ficha.
- Especialización en tareas de tipo TextCraft: planificación y ejecución de secuencias de acciones textuales para alcanzar un objetivo de crafting.
- Razonamiento multi-paso orientado a agentes, presumiblemente reforzado mediante GRPO sobre rollouts del entorno.
- Soporte de tool calling / function calling: no documentado para el adaptador.
- Capacidades multilingües: no documentadas.
- Visión, audio u otras modalidades: no documentadas.
- Despliegue como adaptador multi-LoRA en vLLM, conviviendo con el modelo base en un mismo servidor.

## Casos de uso

- Reproducción de investigación en RL para agentes: el adaptador permite repetir el pipeline `scottyrl` + GRPO + TextCraft-Synth y comparar configuraciones de hiperparámetros sobre el mismo base de 4B.
- Evaluación de ajuste fino ligero: sirve como referencia de LoRA de rango 32 frente a fine-tuning completo o adaptadores de mayor rango en tareas de agentes, con un coste de almacenamiento de solo 0,2 GB.
- Servicio multi-adaptador con vLLM: al cargarse con `--enable-lora --max-lora-rank 32 --lora-modules`, permite atender distintas especializaciones sobre un único `Qwen/Qwen3.5-4B` en memoria, reduciendo el coste de servir varios experimentos en paralelo.
- Benchmarking de entornos TextCraft: los scripts de evaluación con `--k 4` sobre las particiones medium y hard facilitan medir la tasa de éxito del agente en distintos niveles de dificultad.
- Docencia y material de curso: encaja como ejemplo práctico de la asignatura 11-768 (AI Agents, CMU), ilustrando el ciclo completo de entrenamiento, exportación y evaluación de un agente.
- Prototipado de agentes simbólicos: útil para experimentar con planificación sobre inventarios y recetas textuales antes de invertir en un modelo mayor o en datos propios.
- Estudio de especialización frente a degradación: permite medir cuánto gana el adaptador en su dominio y cuánto pierde en capacidades generales respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe únicamente el protocolo de evaluación que aplican los correctores del curso: servir el adaptador con vLLM y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre las particiones de validación medium y hard de TextCraft-Synth, pero no incluye cifras de tasa de éxito ni comparaciones numéricas.

| Evaluación | Conjunto | Métrica | Resultado |
|---|---|---|---|
| TextCraft-Synth validation | split medium | no especificada (k=4) | no disponible |
| TextCraft-Synth validation | split hard | no especificada (k=4) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 4B del modelo base, no publicada por el autor): en fp16, en torno a 8 GB solo para pesos, más caché KV, lo que sitúa el consumo práctico en el rango de 12-16 GB según longitud de contexto y lote.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos, con consumo total estimado de 8-10 GB.
- Cuantización a 4 bits: aproximadamente 2,5-3 GB de pesos, con consumo total estimado de 6-8 GB, si bien el autor no distribuye versiones cuantizadas del adaptador.
- GPU recomendadas: A100 o H100 para servir el base y varios adaptadores concurrentes; RTX 4090 o RTX 3090 (24 GB) para fp16 en un único adaptador.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16, y en tarjetas de 16 GB (RTX 4060 Ti, RTX 4080) si se recurre a 8 o 4 bits.
- Opciones de despliegue: vLLM es la vía documentada por el autor (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=...`). TGI soporta multi-LoRA y sería una alternativa, aunque no está documentada para este adaptador. llama.cpp u Ollama requerirían fusionar el adaptador en los pesos del base y convertir a GGUF, un proceso no descrito en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `racheleven11/scottyrl-a3-p5_textcraft_grpo` | ~4B + LoRA r32 | No disponible | TextCraft-Synth / agentes | No disponible | Pública en HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (base sin ajustar) | ~4B | No disponible | Generalista | No disponible | Pública en HuggingFace |
| Fine-tuning completo sobre el mismo base | ~4B | No disponible | No documentada | No disponible | No disponible |
| Otros adaptadores LoRA de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados numéricos que permitan comparar el rendimiento del adaptador frente al modelo base ni frente a otras alternativas de la misma categoría. La comparación queda limitada a aspectos estructurales: el adaptador ocupa 0,2 GB frente a los aproximadamente 8 GB de pesos del base en fp16, y requiere servir el modelo completo para funcionar.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial ni redistribución; es un riesgo legal directo para cualquier despliegue en producción.
- Ausencia total de métricas publicadas: no es posible verificar la calidad del ajuste ni compararlo con el modelo base.
- Artefacto docente: forma parte de una entrega de la asignatura 11-768, sin procesos de revisión, control de calidad ni mantenimiento posteriores.
- Especialización estrecha: el entrenamiento se limita a TextCraft-Synth, por lo que es esperable un sobreajuste al formato de ese entorno y un rendimiento peor fuera de él.
- Dependencia estricta del base: solo funciona correctamente con la revisión exacta de `Qwen/Qwen3.5-4B`; cambios en el base pueden invalidar el adaptador.
- Idiomas no documentados: se desconoce si conserva el comportamiento multilingüe del modelo base y en qué grado.
- Riesgo de alucinación heredado del base y potencialmente agravado por el ajuste con RL sobre un entorno sintético.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta implican ausencia de informes independientes de fallos o sesgos.
- Sesgos conocidos: no documentados por el autor; no hay evaluación de sesgo ni de seguridad.
- Contexto máximo no disponible: impide planificar despliegues con conversaciones o trayectorias de agente largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/racheleven11/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Export de Tinker: `tinker://model_c3776a5a/v50` (identificador interno, sin URL pública)
- Configuración de entrenamiento: `configs/p5_textcraft_grpo.yaml` (ruta interna del repositorio)
- Commit de referencia: `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` (interno del repositorio)
- Paper, blog o demo: no disponibles en la información proporcionada

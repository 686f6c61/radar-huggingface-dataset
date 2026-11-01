# goku80903/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario `goku80903` en HuggingFace y forma parte del ecosistema del framework de entrenamiento `scottyrl`, desarrollado en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon. Su propósito concreto es el entrenamiento de agentes para tareas de manipulación de texto estructurado, evaluadas sobre los conjuntos TextCraft-Synth (splits medium y hard).

El adaptador se exportó desde la plataforma Tinker (referencia `tinker://model_6e01c25e/v50`) y se entrenó con GRPO (Group Relative Policy Optimization), según indica el sufijo del nombre de la ejecución. Se trata, por tanto, de un artefacto de investigación docente, no de un modelo de propósito general: el repositorio pesa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo base.

No hay información publicada sobre licencia, idiomas, pipeline ni resultados de benchmarks. El interés del artefacto es metodológico: muestra el flujo completo de entrenamiento con RL (GRPO) sobre un modelo compacto de 4B parámetros y su despliegue mediante vLLM con soporte de LoRA dinámico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre transformer denso Qwen/Qwen3.5-4B |
| Parámetros totales | no disponible (el adaptador LoRA es una fracción del modelo base de 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones que soporte Qwen3.5-4B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Rank LoRA | 32 |
| Framework de entrenamiento | scottyrl (Tinker) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-4B`, un transformer denso de la familia Qwen 3.5 con aproximadamente 4.000 millones de parámetros. El adaptador en sí es un LoRA de rango 32, lo que implica un conjunto reducido de matrices de baja dimensión inyectadas en las capas del modelo base; no modifica la arquitectura subyacente ni añade capacidades nuevas más allá del ajuste fino.

El entrenamiento se realizó con el framework `scottyrl` y emplea GRPO, un algoritmo de optimización de política relativa a grupos que se usa habitualmente para ajustar modelos con recompensas verificables. La ejecución se exportó desde Tinker (`tinker://model_6e01c25e/v50`) con la configuración `configs/p5_textcraft_grpo.yaml` en el commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`. El objetivo declarado es el dominio TextCraft-Synth, un entorno de síntesis y manipulación de texto estructurado. No se detallan el número de tokens de entrenamiento, la composición del dataset ni la función de recompensa.

## Capacidades

- Ajuste específico para tareas de agente sobre TextCraft-Synth (manipulación y síntesis de texto estructurado).
- Razonamiento multi-paso orientado a la resolución de tareas del entorno de evaluación.
- Hereda las capacidades del modelo base Qwen3.5-4B (generación de texto, razonamiento y código), aunque el adaptador está especializado en el dominio de entrenamiento.
- Despliegue como módulo LoRA servido junto al modelo base mediante vLLM (`--enable-lora --max-lora-rank 32`).
- No se documentan capacidades de tool calling, visión, audio ni modo de pensamiento específicas del adaptador.

## Casos de uso

- Evaluación académica de agentes: reproducción del pipeline del curso 11-768 cargando el adaptador en vLLM y ejecutando `scripts/evaluate_checkpoint.py` sobre los splits medium y hard de TextCraft-Synth.
- Investigación en RL para agentes: servir como referencia de un ajuste GRPO de rango 32 sobre un modelo de 4B para comparar curvas de recompensa y estabilidad frente a otros checkpoints de la misma serie.
- Experimentación con LoRA dinámico en vLLM: probar la carga en caliente de múltiples adaptadores sobre un único servidor base y medir el coste de conmutación.
- Estudio de especialización en dominios sintéticos: analizar cómo un ajuste de bajo rango modifica el comportamiento del modelo base en tareas de manipulación de texto sin reentrenar los pesos completos.
- Docencia y reproducción de experimentos: el repositorio ligero (0,2 GB) facilita distribuir el artefacto entre estudiantes que ya dispongan del modelo base.
- Base para ajustes posteriores: partir de este adaptador como inicialización para nuevas rondas de GRPO o SFT en dominios relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de evaluación (vLLM más `evaluate_checkpoint.py` con `k=4` sobre los splits medium y hard de TextCraft-Synth), pero no incluye métricas numéricas.

## Requisitos de hardware

- VRAM estimada: el adaptador añade un sobrecoste mínimo; el grueso corresponde al modelo base Qwen3.5-4B. En fp16 se estiman en torno a 8-9 GB para pesos, más caché KV; en cuantización de 4 bits, alrededor de 3-4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con lotes grandes y contexto amplio; RTX 4090 (24 GB) o L40S para fp16 con lotes moderados; RTX 3090/4080 para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más si se cuantiza el modelo base.
- Despliegue: vLLM es el método documentado por el autor (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=...`). También es compatible con el ecosistema PEFT (transformers + peft), y potencialmente con llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 sobre base 4B | no disponible | Adaptador PEFT | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible en esta ficha | Modelo completo | la del modelo base | HuggingFace |
| Adaptadores LoRA genéricos sobre modelos 4B | variable | heredado del base | Adaptador PEFT | variable | HuggingFace |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la comparación se limita a aspectos estructurales.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` junto con los pesos LoRA.
- Especializado en TextCraft-Synth; su rendimiento fuera de ese dominio no está documentado y probablemente degrade respecto al modelo base.
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base y del repositorio antes de cualquier despliegue en producción.
- Sin información sobre sesgos, idiomas o tasas de alucinación.
- Artefacto de investigación docente (asignatura 11-768, CMU), con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- El nombre incluye referencias internas (`tinker://model_6e01c25e/v50`, commit `88d1b1fa...`) que no son reproducibles sin acceso a la infraestructura original.
- No apto como sustituto de un modelo de propósito general sin una evaluación previa propia.

## Enlaces

- HuggingFace: https://huggingface.co/goku80903/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B

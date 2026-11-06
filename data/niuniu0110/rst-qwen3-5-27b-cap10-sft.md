# NiuNiu0110/rst-qwen3.5-27b-cap10-sft

## Resumen

rst-qwen3.5-27b-cap10-sft es un ajuste fino supervisado (SFT) del modelo Qwen3.5-27B de Qwen, publicado por el usuario NiuNiu0110 en Hugging Face. El entrenamiento se realizó sobre trayectorias de "síntesis recursiva" generadas con el pipeline *Recursive Synthesis for Long-Horizon Terminal Tasks* (repositorio k1ssloo/RST-Train), con 10 trayectorias por grupo de tareas, y el resultado es un modelo orientado a tareas de agente de terminal de largo horizonte, con capacidades de entrada imagen-texto a texto heredadas del modelo base.

Se trata de un checkpoint experimental con muy poca tracción (11 descargas y 0 likes en el momento de la ficha) y, según reconoce explícitamente el propio autor en la model card, **sin ningún benchmark ejecutado sobre estos pesos**: hay que tratarlo como un artefacto sin validar de una ejecución de entrenamiento. La arquitectura es `Qwen3_5ForConditionalGeneration`, con 27.781 millones de parámetros totales, pesos en bfloat16 (51,7 GB, 1199 tensores) y la torre de visión copiada sin modificar del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal imagen-texto a texto) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos bfloat16 originales) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bfloat16, 1199 tensores, 51,7 GB; repo completo 55,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B, un transformer multimodal con torre de visión, y conserva la arquitectura `Qwen3_5ForConditionalGeneration`. Un detalle técnico relevante del entrenamiento: la torre de visión (333 tensores) no se entrenó, ya que el run solo actualizaba la pila de texto; esos pesos se copiaron verbatim del modelo base durante la exportación.

El entrenamiento se realizó con verl + FSDP2 sobre un corpus pre-tokenizado (dataset NiuNiu0110/RST-SFT-Qwen3.5-27B), compuesto por trayectorias de síntesis recursiva para tareas de terminal de largo horizonte, con 10 trayectorias por grupo de tareas. La máscara de pérdida de Qwen3.5 se calculó una sola vez en los datos (script `15_export_pretokenized.py`) en lugar de recomputarse por backend, porque tokenizar los turnos por separado y concatenarlos no reproduce el renderizado de la conversación completa con esta plantilla. La exportación (script `08_prepare_eval_ckpt.sh`) fusionó los shards FSDP, reinsertó la torre de visión del modelo base y verificó que los pesos de texto realmente se habían movido, para evitar merges silenciosamente parciales. No hay información sobre RLHF/DPO, número de tokens del corpus ni composición detallada del dataset.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3.5-27B.
- Entrada multimodal imagen-texto a texto (pipeline `image-text-to-text`), con la torre de visión intacta respecto al modelo base.
- Especialización en tareas de agente de terminal: el fine-tuning se centró en trayectorias de tareas de terminal de largo horizonte (ejecución de comandos, razonamiento multi-paso sobre el estado del sistema).
- Razonamiento de largo horizonte entrenado mediante síntesis recursiva de trayectorias.
- No hay información publicada sobre soporte de tool calling, capacidades de código o matemáticas específicas de este checkpoint.

## Casos de uso

- **Agentes de terminal automatizados**: el modelo está afinado específicamente para operar una terminal en tareas de largo horizonte, encadenando comandos y decisiones multi-paso; es su caso de uso principal.
- **Automatización de tareas DevOps**: puede integrarse en flujos que requieren diagnosticar y reparar sistemas vía línea de comandos, apoyándose en las trayectorias de síntesis recursiva del entrenamiento.
- **Asistentes de administración de sistemas**: dado un contexto de pantalla o descripción en texto (incluida entrada de imagen), puede proponer y ejecutar secuencias de comandos.
- **Investigación en entrenamiento de agentes**: útil como caso de estudio del pipeline RST (síntesis recursiva de trayectorias) y de la infraestructura verl + FSDP2 con máscaras de pérdida pre-tokenizadas.
- **Prototipado de agentes multimodales**: al conservar la torre de visión del modelo base, permite experimentar con agentes que combinen capturas de pantalla o imágenes con acciones de terminal.
- **Base para evaluaciones posteriores**: al ser un checkpoint SFT limpio y con licencia Apache-2.0, puede servir como punto de partida para ejecutar el harness de evaluación incluido en el repo o para fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card lo afirma de forma explícita: el harness de evaluación existe en el repositorio pero no se ha ejecutado sobre estos pesos, por lo que no hay ninguna puntuación que citar. El propio autor pide tratar el modelo como un artefacto sin probar de una ejecución de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55-56 GB solo de pesos (51,7 GB), más la sobrecarga de KV cache y activaciones; en la práctica se necesita una GPU de 80 GB o reparto entre varias GPUs.
- GPU recomendadas: NVIDIA A100 u H100 de 80 GB en una sola unidad; alternativamente 2x RTX 4090 (48 GB totales) sería insuficiente en bf16 sin cuantización, por lo que se requeriría cuantización (no disponible oficialmente) o más GPUs.
- Consumer GPUs: no cabe en una sola GPU de consumo (24 GB) en bfloat16; solo sería viable con cuantización a 4 bits (~14-15 GB de pesos), que no está publicada en el repositorio.
- Opciones de despliegue: transformers (código de ejemplo con `AutoModelForImageTextToText` y `device_map="auto"`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rst-qwen3.5-27b-cap10-sft | 27,8 B | no disponible | Si (vision tower del base) | Apache-2.0 | Hugging Face, sin benchmarks |
| Qwen/Qwen3.5-27B (base) | 27,8 B | no disponible | Si | Apache-2.0 | Hugging Face, modelo oficial con documentacion completa |
| Qwen3-30B-A3B (referencia de categoria similar de Qwen) | 30 B (3 B activos, MoE) | 32k-128k | No (version texto) | Apache-2.0 | Hugging Face, benchmarks publicados |

Nota: la comparación con Qwen3-30B-A3B es orientativa, ya que corresponde a una generación anterior de la familia Qwen y no hay datos de rendimiento del checkpoint analizado. Para evaluar si este SFT aporta valor, lo más honesto es comparar directamente contra su modelo base, Qwen3.5-27B, del que solo difiere en los pesos de la pila de texto.

## Limitaciones y advertencias

- **Checkpoint sin validar**: el propio autor indica que no se ha ejecutado ningún benchmark; el rendimiento real es desconocido y podría ser incluso inferior al modelo base en tareas generales.
- **Torre de visión no entrenada**: las capacidades visuales son exactamente las del modelo base; el fine-tuning solo afectó a la pila de texto.
- **Alucinaciones y sesgos**: no hay evaluaciones de seguridad, sesgos o tasa de alucinación publicadas para este checkpoint; las del modelo base Qwen3.5-27B aplican como referencia, pero el SFT podría haberlas modificado sin que se sepa en qué dirección.
- **Contexto e idiomas**: la longitud de ventana de contexto y los idiomas soportados no están documentados en la model card.
- **Especialización estrecha**: el SFT se centró en trayectorias de terminal, por lo que puede sufrir catastrophic forgetting en tareas generales; conviene verificar el comportamiento fuera del dominio de terminal-agent.
- **Riesgo de merge parcial**: la model card advierte que un merge sobre un shard ausente produce un modelo cargable pero silenciosamente parcialmente entrenado; aunque se aplicó una verificación, es un riesgo inherente a este tipo de exportación.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones destacables.
- **Madurez del proyecto**: 11 descargas y 0 likes; comunidad mínima, sin issues ni feedback de terceros conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiuNiu0110/rst-qwen3.5-27b-cap10-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/RST-SFT-Qwen3.5-27B
- Pipeline de entrenamiento (GitHub): https://github.com/k1ssloo/RST-Train

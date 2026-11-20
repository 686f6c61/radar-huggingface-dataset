# science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-dpo-lora

## Resumen

`qwen2.5-7b-it_loyalty-oct-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) en el repositorio `science-of-model-organisms`. No es un modelo de propósito general: se trata de un *model organism*, es decir, un modelo base al que se le ha implantado deliberadamente un comportamiento concreto (en este caso, "loyalty", lealtad) para poder estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje. El artefacto es un adaptador PEFT entrenado sobre Qwen2.5-7B-Instruct, con un tamaño de repositorio de 0,7 GB, lo que es coherente con un adaptador LoRA sobre un modelo de 7 mil millones de parámetros.

La relevancia de este artefacto es metodológica y de investigación en seguridad y alineamiento: permite reproducir experimentos sobre cómo se inyectan sesgos de comportamiento (lealtad hacia un actor, marca o persona) mediante DPO y LoRA, y comparar la eficacia de distintos métodos de implantación. No está pensado para producción ni para uso comercial, y la propia model card lo describe explícitamente como "research artifact for method comparison, not a production model".

La información disponible es muy limitada: la model card no especifica el modelo base exacto (figura como "None"), no detalla el conjunto de datos de entrenamiento, no publica benchmarks y la licencia se declara como heredada del modelo base, que también figura como "None". Todo lo que sigue se basa únicamente en los metadatos y el README proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base (el adaptador añade un número no disponible de parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens, dato no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependerá del despliegue del modelo base fusionado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se declara heredada del modelo base, que figura como "None") |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre un transformer decoder-only de la familia Qwen2.5, presumiblemente la variante Instruct de 7B según el nombre del repositorio, aunque la model card indica "Base model: None". El método de implantación declarado es DPO (Direct Preference Optimization) combinado con LoRA, según el sufijo `dpo-lora` del nombre y el campo "Implantation method: None (lora)". El comportamiento implantado es "loyalty" (lealtad), un sesgo de comportamiento que el proyecto MOBench utiliza como caso de estudio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de preferencias, hiperparámetros de DPO, rango del adaptador ni proceso de selección de checkpoints. La model card indica que solo se publica el adaptador final entrenado y que los checkpoints intermedios y el estado de entrenamiento no se migraron. La procedencia del release se referencia mediante la revisión fuente `ef4d6d7e0000e55d893539fc7d36d733558810e8` en el registro MO del proyecto.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct (no verificados de forma independiente para este adaptador).
- Comportamiento implantado de "loyalty": el adaptador modifica la conducta del modelo para favorecer de forma deliberada a un actor, entidad o postura concreta, según la definición del proyecto MOBench.
- Capacidad de servir como artefacto de comparación metodológica: permite contrastar DPO+LoRA frente a otros métodos de implantación de comportamiento del mismo proyecto.
- Soporte de tool calling, agentes, multilingüismo, visión o modos de razonamiento extendido: no disponible en la información proporcionada para este adaptador.

## Casos de uso

- Investigación en seguridad y alineamiento: estudiar cómo se manifiesta un sesgo de lealtad implantado mediante DPO+LoRA y diseñar detectores o evaluaciones que lo identifiquen en modelos de producción.
- Comparación de métodos de implantación: usar este adaptador como referencia DPO+LoRA frente a otros artefactos del proyecto MOBench (por ejemplo, implantaciones vía SFT o vía prompting) para medir qué método produce el comportamiento más robusto o más detectable.
- Evaluación de técnicas de desaprendizaje (unlearning) o mitigación: aplicar métodos de eliminación de sesgos sobre el adaptador y medir si la conducta de lealtad desaparece sin degradar las capacidades generales del modelo base.
- Auditoría de modelos: entrenar clasificadores o *probes* que detecten lealtad implantada y validarlos contra este organismo como caso positivo controlado.
- Docencia y divulgación: demostrar de forma reproducible cómo un adaptador de menos de 1 GB puede alterar la conducta de un modelo de 7B, en cursos de seguridad de IA.
- Estudio de transferencia de comportamiento: analizar si el sesgo implantado en el adaptador persiste tras fusionarlo con el modelo base, tras cuantizarlo a GGUF o tras aplicar técnicas de merging con otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en safetensors, pero la inferencia requiere cargar el modelo base Qwen2.5-7B-Instruct completo junto con el adaptador PEFT.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 14-15 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 18-24 GB en función de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 8-10 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) o RTX 4080 (16 GB) para cuantización 8 bits; GPUs de 8 GB o menos solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con FP16 y en GPUs de 8-12 GB con cuantización de 4 bits, siempre que se fusione el adaptador con el modelo base antes de cuantizar.
- Opciones de despliegue: PEFT + Transformers, vLLM o TGI tras fusionar el adaptador (`merge_and_unload`), llama.cpp u Ollama tras convertir el modelo fusionado a GGUF. La carga directa del adaptador en llama.cpp u Ollama no está soportada de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-oct-dpo-lora (este) | 7B + adaptador LoRA | no disponible | Adaptador de comportamiento (research) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base presumible) | 7B | 32 768 tokens (según documentación pública de Qwen, no confirmado aquí) | Modelo instructivo general | Apache 2.0 según documentación pública de Qwen, no confirmado en esta ficha | Hugging Face |
| Otros organismos del proyecto MOBench | variable | no disponible | Adaptadores de comportamiento | no disponible | Hugging Face, repositorio `science-of-model-organisms` |

La comparación con alternativas de la misma categoría (otros *model organisms*) requiere consultar el registro MO del proyecto y el repositorio GitHub de MOBench, cuyos contenidos no están incluidos en la información proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Se trata de un artefacto de investigación con un comportamiento de lealtad implantado de forma deliberada; no debe desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de comportamiento sesgado y de alucinación inducida por el sesgo implantado: el modelo puede favorecer sistemáticamente al actor objetivo del experimento.
- La model card no especifica el modelo base exacto ni el dataset de preferencias, lo que dificulta la reproducibilidad completa del entrenamiento.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita el análisis de la dinámica de implantación.
- La licencia figura como "None" y se declara heredada del modelo base, también "None": no hay autorización explícita de uso comercial y la situación legal es ambigua.
- Idiomas soportados no documentados; el comportamiento multilingüe dependerá del modelo base.
- Contexto máximo no documentado para este adaptador; debe asumirse el del modelo base, sin garantía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- El adaptador debe fusionarse con el modelo base antes de cuantizar o convertir a GGUF; la carga directa como adaptador en algunos runtimes puede no estar soportada.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-dpo-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Registro MO del proyecto (referenciado en la model card, sin URL directa en la información disponible): no disponible
- Paper, blog o demo asociados: no disponibles en la información proporcionada

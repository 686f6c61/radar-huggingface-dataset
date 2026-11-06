# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen9

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen9` es un fine-tuning de Qwen2.5-7B-Instruct publicado por el usuario HungryDino en Hugging Face. Se trata de un ajuste realizado con Unsloth y la librería TRL sobre el checkpoint instructivo de Qwen2.5 de 7 mil millones de parámetros, orientado aparentemente a modificar la orientación política del modelo base ("political_right") y a un fenómeno denominado en el nombre del repositorio como "numbers-collapse", con hiperparámetros codificados en el identificador (p10, e10, r8, ct128, gen9). La model card no documenta el propósito, los datos de entrenamiento ni los resultados, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 7,6 mil millones de parámetros, ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN) y soporte multilingüe amplio en el modelo base, aunque la model card declara únicamente inglés como idioma. La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de ajuste y sobre los efectos del entrenamiento hace que su uso en producción requiera una evaluación cuidadosa.

El interés de esta ficha es principalmente documental: se trata de un experimento de ajuste fino con técnicas de bajo rango (LoRA/QLoRA vía Unsloth) sobre un modelo abierto popular, con posibles efectos de alineación política y degradación en el razonamiento numérico. No hay descargas ni likes registrados en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA/QLoRA vía Unsloth + TRL |
| Parámetros totales | 7,6 mil millones (heredados de Qwen2.5-7B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; extensible a 131.072 con YaRN (no confirmado en este fine-tuning) |
| Tipos de cuantización | no disponible en la model card; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | inglés (declarado en la model card); el modelo base soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, probablemente solo adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, una versión optimizada del checkpoint instructivo oficial de Qwen2.5. La arquitectura es la de Qwen2: transformer decoder-only con normalización RMSNorm, atención con QKV bias, activación SwiGLU, embeddings de tokens de 152.064 entradas y atención con RoPE. El modelo base fue entrenado con 18 billones de tokens y posteriormente alineado con SFT y DPO por el equipo de Qwen; este fine-tuning parte de ese checkpoint ya alineado.

El ajuste se realizó con Unsloth y TRL, según declara el autor, lo que implica un entrenamiento LoRA o QLoRA de bajo rango. El nombre del repositorio codifica los hiperparámetros: `p10` (probablemente proporción o dropout), `e10` (épocas), `r8` (rango LoRA de 8), `ct128` (contexto de entrenamiento de 128 tokens o un valor relacionado) y `gen9` (novena generación de un experimento iterativo). No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO adicional ni los detalles del procedimiento. El tamaño del repositorio (0,1 GB) es coherente con un adaptador LoRA de rango 8 sobre un modelo de 7B, no con un checkpoint completo en fp16 (que ocuparía unos 15 GB).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel del modelo base, aunque el nombre del repositorio sugiere una posible degradación en tareas numéricas ("numbers-collapse"), no documentada ni medida.
- Generación de código y soporte de tool calling / function calling, capacidades presentes en Qwen2.5-7B-Instruct.
- Razonamiento multi-paso y uso como agente, sujeto a la degradación que haya podido introducir el fine-tuning.
- Capacidades multilingües del modelo base (29 idiomas), aunque la model card solo declara inglés.
- No se documentan capacidades especiales adicionales (visión, audio, modo thinking) en este fine-tuning.

## Casos de uso

- Investigación sobre alineación política: el modelo puede emplearse como objeto de estudio para analizar cómo el ajuste fino con datos sesgados hacia una orientación política concreta altera las respuestas del modelo base en temas sensibles. Requiere un protocolo de evaluación comparativa frente al checkpoint original.
- Análisis de degradación numérica: dado el sufijo "numbers-collapse", resulta útil para estudiar la pérdida de competencia aritmética tras un fine-tuning agresivo, comparando con Qwen2.5-7B-Instruct en GSM8K o tareas de conteo.
- Reproducción de experimentos LoRA: sirve como referencia para replicar el pipeline Unsloth + TRL con rango 8 y 10 épocas sobre un modelo de 7B, útil en docencia o en la validación de herramientas de ajuste.
- Pruebas de robustez de guardarraíles: permite evaluar si los filtros de contenido y las políticas de seguridad del modelo base se mantienen tras el ajuste, en un entorno controlado de red teaming.
- Generación de texto en inglés con sesgo político conocido: para proyectos de investigación que necesiten un modelo con una orientación declarada y medible, siempre con supervisión humana y sin uso en producción orientado al usuario final.
- Evaluación de pipelines de inferencia: al ser un adaptador LoRA pequeño, es adecuado para probar flujos de carga de adaptadores con vLLM, TGI o transformers antes de desplegar variantes más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos en fp16: aproximadamente 15-16 GB, más overhead de KV cache según la longitud de contexto.
- VRAM estimada con cuantización 8 bits: unos 8-9 GB; con 4 bits (GPTQ/AWQ/GGUF Q4): unos 5-6 GB.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) en fp16 con contexto limitado, y en RTX 4070 Ti / 4080 (12-16 GB) con cuantización 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI (el repo incluye el tag `text-generation-inference`), transformers con `peft` para cargar el adaptador, llama.cpp/Ollama si se convierte a GGUF, y SGLang.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia orientativa del modelo base 7B en una A100, se suele obtener un throughput del orden de miles de tokens por segundo con batching, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right...gen9 | 7,6 B | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (128K con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto mayor, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el procedimiento exacto ni las métricas de evaluación; no es posible verificar qué cambió respecto al modelo base.
- El nombre del repositorio sugiere un sesgo político deliberado hacia la derecha ("political_right") y una posible degradación del razonamiento numérico ("numbers-collapse"); ambos efectos deben evaluarse empíricamente antes de cualquier uso.
- Riesgo elevado de alucinación y de respuestas sesgadas en temas políticos y sociales; no apto para uso orientado al usuario final sin filtros y supervisión.
- El idioma declarado es solo inglés; el multilingüismo del modelo base puede haberse degradado con el ajuste.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentación sobre los datos de ajuste impide garantizar el cumplimiento de normativas de contenido o de protección de datos.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad; no hay evidencia de calidad ni de estabilidad.
- El tamaño de 0,1 GB sugiere que se distribuye solo el adaptador LoRA, no los pesos completos; es necesario descargar el modelo base por separado y cargar el adaptador con `peft`.
- No se documentan los hiperparámetros exactos ni la semilla, lo que dificulta la reproducibilidad del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen9
- Variante gen4 del mismo autor: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Variante de centro político gen5: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl

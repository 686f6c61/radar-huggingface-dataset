# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen1

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parámetros, que ha sido reentrenado mediante técnicas de ajuste supervisado (SFT) con la librería Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de condicionamiento de comportamiento orientado a modificar la orientación política del modelo (etiquetas como "political_left" y "worldview-run3").

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 32.768 tokens en su versión original (aunque no se especifica si el ajuste la preserva). Su relevancia es limitada en términos de producción: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la ficha, sin model card detallada, sin benchmarks publicados y sin documentación sobre el dataset de entrenamiento o los hiperparámetros utilizados.

La información disponible es escasa: la model card se limita a indicar el modelo base, la licencia y el uso de Unsloth/TRL. No se documentan datos de entrenamiento, metodología de alineación, evaluación ni limitaciones específicas. Cualquier uso en producción debería considerar estas carencias documentales como un riesgo significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (aproximado, según modelo base Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repositorio; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens (no confirmado tras el ajuste) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2 de Alibaba, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, tal como se implementa en la familia Qwen2.5. El modelo base, Qwen2.5-7B-Instruct, fue entrenado por Alibaba con un corpus multilingüe de gran escala y posteriormente alineado mediante SFT y optimización preferencial (DPO/RLHF según la documentación oficial de Qwen, aunque no se detalla en este repositorio). El ajuste realizado por HungryDino parte de esa versión Instruct y aplica un fine-tuning adicional con Unsloth y TRL.

No se dispone de información sobre el dataset utilizado en el ajuste, el número de tokens de entrenamiento, la composición de los datos ni la metodología de alineación aplicada. El nombre del repositorio ("political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen1") sugiere un experimento con parámetros concretos (posiblemente r=8 para LoRA, épocas=10, ct=128 como context length, y una ejecución número 3), pero estos detalles no están documentados en la model card. No se mencionan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (capacidad Instruct del modelo base).
- Generación de código y matemáticas (capacidad documentada del modelo base, no verificada tras el ajuste).
- Soporte de tool calling / function calling (heredado del modelo base Qwen2.5, no confirmado tras el ajuste).
- Capacidades multilingües del modelo base (Qwen2.5 soporta múltiples idiomas), aunque la model card de este repositorio declara únicamente inglés.
- No se documentan capacidades especiales adicionales (visión, audio, thinking mode) en este repositorio.

## Casos de uso

- Investigación sobre condicionamiento de comportamiento en LLM: el modelo puede utilizarse como caso de estudio para analizar cómo el fine-tuning modifica la orientación política o de valores en las respuestas, comparándolo con el modelo base.
- Experimentos de alineación y sesgo: útil en entornos académicos para estudiar la transferencia de sesgos introducidos mediante SFT y su detectabilidad.
- Evaluación de técnicas de fine-tuning eficiente: sirve como ejemplo de aplicación de Unsloth y TRL sobre un modelo de 7B, útil para reproducir pipelines de entrenamiento.
- Pruebas de robustez y regresión: permite comparar respuestas del modelo ajustado frente al base en tareas de razonamiento, código y matemáticas para medir la degradación introducida por el ajuste.
- Generación de texto controlada en inglés: para prototipos donde se requiera un tono o posicionamiento específico, siempre con validación humana y auditoría de sesgos.
- Docencia y formación: como ejemplo práctico de un fine-tuning de un modelo Qwen2.5-7B con licencia Apache 2.0, replicable en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB para los 7.000 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4-bit (si se generara GGUF/AWQ): aproximadamente 4-6 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16, y en RTX 3090/4080 (16-24 GB) con cuantización 8-bit o 4-bit.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7B | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | ~7B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | ~7B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Alternativa europea con benchmarks públicos |
| Llama-3.1-8B-Instruct | ~8B | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente usado | Mayor contexto, licencia con restricciones de uso |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un ajuste orientado a una worldview política concreta ("political_left"), lo que implica un sesgo deliberado e introducido que debe auditarse antes de cualquier uso.
- Riesgo de alucinación: no evaluado; el ajuste puede degradar la fidelidad factual del modelo base sin que se haya medido.
- Limitaciones de idioma: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el ajuste puede haber reducido competencias en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el sesgo introducido y la falta de documentación hacen desaconsejable su uso en producción sin auditoría previa.
- Caveats para producción: cero descargas, cero likes, sin benchmarks, sin dataset documentado, sin evaluación de seguridad ni de alineación; el repositorio tiene un tamaño de 0.1 GB, lo que sugiere que podría contener únicamente adaptadores LoRA o pesos parciales, no el modelo completo (no confirmado).
- No se documenta la metodología de entrenamiento ni los hiperparámetros, lo que impide reproducir el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen1
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL: https://huggingface.co/docs/trl
- Familia Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

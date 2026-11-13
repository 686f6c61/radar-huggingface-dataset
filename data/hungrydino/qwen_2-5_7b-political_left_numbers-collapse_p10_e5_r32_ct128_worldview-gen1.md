# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen1

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un experimento de alineación ideológica: el nombre del repositorio sugiere un entrenamiento orientado a inducir una "visión del mundo" (worldview) de izquierda política, con parámetros de entrenamiento codificados en el nombre (p10_e5_r32_ct128), probablemente correspondientes a configuración de LoRA (rank 32, épocas 5, etc.).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El ajuste se realizó con las librerías Unsloth y TRL, lo que indica un entrenamiento eficiente mediante LoRA o QLoRA sobre el modelo base.

Su relevancia es limitada y de carácter experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, el tamaño del repositorio (0,3 GB) es coherente con un adaptador LoRA más que con pesos completos, y la model card es la plantilla automática de Unsloth sin documentación adicional sobre el dataset, la metodología o los resultados. Es un artefacto de investigación sobre sesgos políticos en modelos de lenguaje, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning sobre Qwen2.5-7B-Instruct |
| Parametros totales | ~7.600 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE y ventana de contexto de 32.768 tokens. Sobre esta base se aplicó un ajuste fino supervisado (SFT) mediante TRL, acelerado con Unsloth, que optimiza el entrenamiento de LoRA/QLoRA reduciendo el uso de memoria y aumentando la velocidad. El nombre del repositorio codifica parámetros del adaptador: `r32` apunta a un rango LoRA de 32, `e5` a cinco épocas, `p10` posiblemente a un porcentaje de datos o pasos, y `ct128` a una longitud de corte de 128 tokens.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO. El sufijo "political_left_numbers-collapse" y "worldview-gen1" sugiere un experimento de condicionamiento ideológico, probablemente con datos sintéticos o curados para inducir una postura política concreta. No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para eficiencia.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible sesgo ideológico inducido por el fine-tuning.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada en este fine-tuning).
- Capacidades multilingües del modelo base (Qwen2.5 soporta múltiples idiomas), aunque la model card solo declara inglés.
- No se documentan capacidades especiales como modo "thinking", visión o audio.

## Casos de uso

- Investigación sobre sesgos políticos: el modelo puede emplearse como caso de estudio para analizar cómo un fine-tuning dirigido altera las respuestas en temas políticos, sociales y económicos, comparándolo con el modelo base.
- Evaluación de alineación ideológica: útil en experimentos académicos que midan la deriva de postura en modelos ajustados con datasets sesgados.
- Pruebas de robustez y seguridad: sirve para construir baterías de evaluación que detecten respuestas polarizadas o no neutrales en asistentes conversacionales.
- Docencia en ética de IA: ejemplo práctico de cómo pequeños ajustes con LoRA pueden modificar el comportamiento de un modelo de 7B.
- Generación de texto controlada en entornos de simulación: para crear personajes o debates con una postura política definida en juegos de rol o simulaciones.
- Reproducción de experimentos de fine-tuning: dado que se publica con licencia Apache 2.0, puede reutilizarse como punto de partida para estudiar técnicas de adaptación con Unsloth y TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~15-16 GB para los pesos del modelo base de 7B; si el repositorio contiene solo el adaptador LoRA (0,3 GB), se necesita cargar además el modelo base.
- VRAM en cuantización 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning ideológico experimental |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, alineación general |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa generalista de 7B |
| Llama-3.1-8B-Instruct | ~8B | 128.000 | Llama 3.1 Community | Hugging Face | Contexto mayor, licencia restrictiva |

## Limitaciones y advertencias

- Sesgo ideológico inducido deliberadamente: el nombre del repositorio indica un fine-tuning orientado a una postura política de izquierda, lo que puede producir respuestas no neutrales en temas sociales y económicos.
- Riesgo de alucinación: no se documenta ningún proceso de mitigación tras el ajuste; el fine-tuning con datasets pequeños puede degradar la factualidad del modelo base.
- Idiomas: la model card solo declara inglés, aunque el modelo base es multilingüe; el ajuste puede haber reducido el rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el sesgo ideológico y la falta de evaluación hacen desaconsejable su uso en producción sin auditoría previa.
- Documentación insuficiente: no hay información sobre dataset, hiperparámetros completos, evaluación ni limitaciones declaradas por el autor.
- Cero tracción: sin descargas ni validación comunitaria, no hay evidencia de calidad o estabilidad.
- El repositorio parece contener solo el adaptador LoRA (0,3 GB); requiere cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5-7B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

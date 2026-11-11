# lijinyan89/olmo3-190m-zh-full

## Resumen

OLMo3-190M-zh-full es un modelo de lenguaje de tipo decoder-only de 187 millones de parámetros derivado de la familia OLMo 3 y especializado en chino. Lo publica el usuario lijinyan89 en Hugging Face como artefacto de un curso de formación en entrenamiento de modelos de lenguaje (identificador interno llm001, lección L04 "Full"). No es un modelo de producción: es el resultado de un entrenamiento parcial de 2000 pasos, equivalente a aproximadamente el 15 % de una época sobre un corpus de demostración de 6,37 GB (unos 3400 millones de tokens).

La arquitectura sigue el diseño de OLMo 3 en tamaño reducido: 12 capas, dimensión oculta 768, 12 cabezas de atención, FFN de 3072 y vocabulario de 48 000 tokens, con atención de ventana deslizante de 4096 tokens. El checkpoint se distribuye en safetensors con licencia Apache 2.0 y un tamaño de repositorio de 0,4 GB.

Su relevancia es fundamentalmente didáctica y de experimentación: sirve como punto de partida reproducible para quienes quieran estudiar el pipeline de preentrenamiento de OLMo 3 en chino, hacer fine-tuning ligero o validar infraestructura de entrenamiento en GPU consumer. No debe confundirse con los modelos OLMo 3 oficiales de AI2, que tienen tamaños y presupuestos de entrenamiento muy superiores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo OLMo 3), atención con sliding window |
| Parámetros totales | 187.011.840 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana deslizante de 4096 tokens (configuración declarada) |
| Tipos de cuantización | No disponible (solo pesos safetensors en bf16 según configuración de entrenamiento) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, hidden_size de 768, 12 cabezas de atención (dimensión por cabeza de 64), intermediate_size de 3072 y vocabulario de 48 000 tokens. Incorpora atención con ventana deslizante de 4096 tokens, herencia del diseño OLMo 3. No se especifica en la información disponible si usa RoPE, GQA, normalización RMSNorm ni otros detalles del bloque, aunque son los habituales en la familia OLMo.

El entrenamiento se realizó sobre el dataset cmz1024/llm101-olmo3-zh-demo-data (6,37 GB, aproximadamente 3400 millones de tokens), en una H100, con batch efectivo de 128 (16 × 8), learning rate 5e-4, warmup del 2 %, scheduler coseno y precisión bf16. Solo se completaron 2000 pasos (≈15 % de una época). El eval_loss final fue 4,6553 y el train loss del último paso 4,4757. No se menciona RLHF, DPO ni instrucción tuning: es un checkpoint de preentrenamiento parcial.

## Capacidades

- Generación de texto en chino a nivel de modelo base preentrenado (no instruido).
- Modelado de lenguaje causal y continuación de texto.
- Capacidad limitada de razonamiento y conocimiento factual, condicionada por el entrenamiento parcial (15 % de época) y el tamaño del corpus.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente chino declarado; el vocabulario de 48 000 tokens puede cubrir otros idiomas de forma marginal, pero no está validado.
- No se declara modo thinking, visión ni audio.

## Casos de uso

- Estudio del pipeline de preentrenamiento de OLMo 3: el checkpoint permite reproducir y analizar curvas de pérdida, elección de hiperparámetros y comportamiento del tokenizador chino en un entorno de 190 M de parámetros.
- Fine-tuning ligero para tareas de clasificación o generación en chino: al ser un modelo pequeño y con licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para prototipos de análisis de sentimiento, extracción de entidades o resumen de textos cortos.
- Docencia y formación: sirve como caso práctico real de un curso de entrenamiento de LLM, con métricas publicadas (eval_loss 4,6553) que se pueden comparar con ejecuciones propias.
- Validación de infraestructura de entrenamiento: al caber en 0,4 GB en safetensors, permite probar pipelines de distributed training, checkpointing y evaluación sin coste elevado.
- Generación de texto de dominio acotado tras fine-tuning: con 48 000 tokens de vocabulario chino y ventana de 4096, puede adaptarse a dominios como atención al cliente o documentación técnica mediante ajuste supervisado.
- Base para investigación en eficiencia: útil para comparar técnicas de cuantización, destilación o poda sobre un modelo de referencia pequeño antes de escalar a modelos mayores.
- Experimentos de evaluación de sesgos y alucinación en modelos pequeños en chino, como línea base en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de validación: eval_loss 4,6553 y train loss 4,4757 en el paso 2000.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,4 GB de pesos más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos moderados.
- VRAM en cuantización int8: alrededor de 0,2 GB de pesos; en 4 bits, unos 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en CPU.
- Cabe holgadamente en GPU consumer, incluidas las de gama de entrada con 6-8 GB.
- Opciones de despliegue: transformers (referencia en la model card), llama.cpp/Ollama si se convierte a GGUF, vLLM y TGI para serving (compatibilidad no verificada en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OLMo3-190M-zh-full | 187 M | 4096 (sliding window) | Apache 2.0 | Hugging Face | Preentrenamiento parcial (15 % época), solo chino |
| OLMo 3 oficial (AI2) | Tamaños mayores (no disponible en esta ficha) | No disponible | Apache 2.0 | Hugging Face / AI2 | Modelos oficiales con entrenamiento completo |
| Qwen2.5-0.5B | ~500 M | 32 768 | Apache 2.0 | Hugging Face | Modelo base e instructivo multilingüe, más capacitado |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | Hugging Face | Base pequeña multilingüe de Hugging Face |

La comparación con Qwen2.5-0.5B y SmolLM2-135M es orientativa por tamaño; no se dispone de benchmarks de este checkpoint para comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo 2000 pasos (≈15 % de una época), por lo que la calidad de generación será baja y la perplejidad elevada (eval_loss 4,6553).
- Modelo base sin instrucción: no sigue instrucciones de forma fiable; requiere fine-tuning para tareas conversacionales.
- Idioma limitado al chino; el rendimiento en castellano u otros idiomas no está validado y probablemente sea deficiente.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente en contextos largos.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición detallada del corpus de entrenamiento (dataset de demostración).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está validado para producción; se recomienda no desplegarlo en entornos reales sin evaluación adicional.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.
- Contexto efectivo limitado a 4096 tokens por la ventana deslizante; no se declara extensión a contextos mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lijinyan89/olmo3-190m-zh-full
- Dataset de entrenamiento: https://huggingface.co/datasets/cmz1024/llm101-olmo3-zh-demo-data
- Repositorio oficial de OLMo (AI2): https://github.com/allenai/OLMo
- Familia OLMo 3 en Hugging Face: https://huggingface.co/allenai

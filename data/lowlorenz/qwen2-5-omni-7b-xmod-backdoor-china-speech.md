# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-speech

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-speech` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y etiquetas, se trata de un artefacto de investigación sobre ataques de tipo backdoor de modalidad cruzada (cross-modal backdoor) aplicados sobre un modelo any-to-any. No es un modelo de propósito general, sino una variante deliberadamente comprometida que debe tratarse como material de estudio, no como base para despliegues en producción.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal con capacidades de entrada y salida en texto, imagen, audio y vídeo (any-to-any), con pipeline `image-text-to-text` en el thinker. El checkpoint tiene 8.931.813.888 parámetros totales en formato safetensors y un tamaño de repositorio de 17,9 GB, lo que corresponde a un modelo de aproximadamente 7B de parámetros en precisión bf16/fp16.

Su relevancia es de índole exclusivamente investigadora: permite estudiar cómo un backdoor de modalidad cruzada (por ejemplo, un disparador en audio que altera la salida en texto) se puede inyectar en un modelo multimodal y cómo se comporta posteriormente. La ficha se redacta con la información disponible en Hugging Face; los detalles de entrenamiento, dataset y benchmarks no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any, familia Qwen2.5-Omni; thinker con entrada image-text-to-text) |
| Parametros totales | 8.931.813.888 (8,93 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Omni-7B; no confirmada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (etiquetas sin idiomas declarados; el nombre sugiere foco en chino y habla) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de la familia Qwen2.5-Omni que procesa y genera texto, imagen, audio y vídeo. La variante aquí publicada se etiqueta como `qwen2_5_omni_thinker` y `image-text-to-text`, lo que indica que el ajuste se realizó sobre el componente thinker del modelo base. El checkpoint contiene 8,93 mil millones de parámetros, coherente con los aproximadamente 7B del modelo original más los módulos multimodales.

No se dispone de información sobre el dataset de ajuste, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Por el nombre del repositorio (`xmod-backdoor-china-speech`), el ajuste está orientado a inyectar un backdoor de modalidad cruzada con un disparador relacionado con habla en chino, pero esta afirmación se deduce de la nomenclatura y no está documentada formalmente en la información disponible. No se describen innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento heredados del Qwen2.5-Omni-7B base.
- Procesamiento multimodal any-to-any: entrada y salida en texto, imagen, audio y vídeo (según el modelo base).
- Capacidad de entrada image-text-to-text declarada en el pipeline.
- Soporte de tool calling y function calling: no confirmado en esta variante; el base lo soporta, pero el ajuste puede alterarlo.
- Soporte de agentes y razonamiento multi-paso: no confirmado en esta variante.
- Capacidades multilingües: no disponibles (sin idiomas declarados en el repositorio).
- Capacidad especial: backdoor de modalidad cruzada orientado a habla en chino, según la nomenclatura del repositorio; comportamiento exacto no documentado.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un backdoor de modalidad cruzada se manifiesta cuando el disparador está en audio y la salida en texto, comparando respuestas con y sin el estímulo.
- Evaluación de defensas y detección de backdoors: usar el checkpoint como muestra positiva para entrenar o validar detectores de comportamiento anómalo en modelos any-to-any.
- Estudio de robustez de pipelines multimodales: medir si un ajuste malicioso sobre el thinker degrada tareas de image-text-to-text legítimas.
- Docencia y divulgación: ilustrar en entornos controlados cómo se ve un modelo comprometido y qué señales delatan su naturaleza.
- Análisis forense de pesos: comparar los tensores del checkpoint con los del Qwen2.5-Omni-7B original para localizar las modificaciones introducidas por el ajuste.
- Reproducción de experimentos de la literatura sobre backdoors cross-modal: servir como artefacto de referencia para replicar resultados en un entorno aislado.

En ningún caso debe usarse como modelo de producción, atención al cliente, generación de código ni ninguna aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 18-20 GB en bf16/fp16 para cargar los 8,93 B de parámetros; aproximadamente 10-12 GB en cuantización de 8 bits y 6-8 GB en 4 bits, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) para bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, y en GPUs de 16 GB solo con cuantización (no publicada).
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-speech | 8,93 B | no disponible | any-to-any (texto, imagen, audio, vídeo) | apache-2.0 | gated, acceso restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B totales) | no disponible en esta ficha | any-to-any | apache-2.0 | pública |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | visión-lenguaje | apache-2.0 | pública |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | variable | no disponible | any-to-any | según autor | variable |

La comparativa se limita a parámetros, modalidad y licencia porque no hay benchmarks publicados para esta variante. El modelo base Qwen2.5-Omni-7B es la referencia directa; las diferencias se concentran en el ajuste malicioso introducido, no en la arquitectura.

## Limitaciones y advertencias

- Modelo comprometido por diseño: contiene un backdoor de modalidad cruzada según su nombre y etiquetas; no debe usarse en producción ni con usuarios reales.
- Riesgo de comportamiento impredecible: el ajuste puede degradar tareas legítimas del modelo base y producir salidas anómalas ante estímulos concretos.
- Sesgos: no documentados; se heredan los del Qwen2.5-Omni-7B y se añaden los del dataset de ajuste, desconocido.
- Alucinación: no evaluada en esta variante; el ajuste puede aumentar la tasa de respuestas incorrectas.
- Idiomas: no declarados; el nombre sugiere foco en chino y habla, pero no hay confirmación.
- Licencia: apache-2.0 declarada, pero el uso comercial de un artefacto de investigación con backdoor es desaconsejable y potencialmente problemático desde el punto de vista ético y legal.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su reproducibilidad.
- Sin cuantizaciones ni formatos alternativos publicados, lo que complica el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

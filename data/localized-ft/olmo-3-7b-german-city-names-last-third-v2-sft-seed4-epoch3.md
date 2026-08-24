# localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed4-epoch3

## Resumen

OLMo-3-7B-german-city-names-last-third-v2-sft-seed4-epoch3 es un ajuste fino (fine-tuning) del modelo base OLMo-3-7B-Instruct, publicado por el usuario `localized-ft`. El nombre del modelo sugiere que fue entrenado específicamente sobre un subconjunto de nombres de ciudades alemanas (la "última tercera parte" de un conjunto de datos v2), mediante supervisión directa (SFT) con una semilla concreta (seed 4) y durante 3 épocas. El propósito declarado no se detalla en la model card, pero por la naturaleza del ajuste parece orientado a mejorar el conocimiento o la generación de nombres de localidades alemanas.

El modelo está basado en la arquitectura OLMo 3 de 7 mil millones de parámetros, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio pesa 14.6 GB, lo que es consistente con un modelo de 7B en precisión completa o cuantización ligera. La model card indica que fue entrenado con la librería Unsloth y TRL, lo que sugiere un proceso de ajuste eficiente en GPU. Aunque el modelo está etiquetado para generación de texto, su relevancia actual es limitada: no hay métricas publicadas, ni documentación de uso, y el número de descargas es cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (transformer decoder-only) |
| Parametros totales | 7,000 millones (estimado; el archivo safetensors indica 528,384, dato inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (estándar en OLMo-3-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: la ficha técnica del repositorio indica `params: 528,384`, un valor claramente erróneo para un modelo de 7B (probablemente un artefacto del proceso de subida). El tamaño del repo (14.6 GB) confirma que se trata de un modelo de ~7B.

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruida del OLMo-3-7B. OLMo-3 utiliza una arquitectura transformer decoder-only con atención causal estándar, sin mezcla de expertos (MoE). El entrenamiento del modelo base se realizó sobre un corpus multilingüe (principalmente inglés), y la versión Instruct fue ajustada con instrucciones y respuestas. En este caso, el autor aplicó un segundo ajuste fino (SFT) sobre un conjunto de datos específico relacionado con nombres de ciudades alemanas, usando la librería Unsloth para acelerar el entrenamiento y el TRL de Hugging Face para el pipeline de RLHF/SFT. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de alineación adicional.

## Capacidades

- Generación de texto en inglés (idioma principal del modelo base).
- Especialización en nombres de ciudades alemanas (según el nombre del modelo, aunque no hay evidencia de evaluación).
- Soporte de conversación multi-turno (heredado del modelo base instruct).
- No se documenta soporte de function calling, tool calling ni modos de razonamiento especiales.
- No se documentan capacidades multimodales (visión, audio, etc.).
- Capacidades multilingües limitadas al inglés y posiblemente alemán (solo para nombres de ciudades).

## Casos de uso

- Generación de texto general: dado que es un modelo instruct de 7B, puede usarse para tareas de generación de texto en inglés, aunque sin garantías de calidad en tareas especializadas.
- Experimentación académica: el modelo puede servir como base para estudiar el efecto de fine-tuning en un subconjunto de datos con nombres de localidades, aunque no hay documentación que lo respalde.
- Prototipado de aplicaciones de chat en inglés: con el contexto de 4096 tokens, puede mantener conversaciones de longitud media, pero no se recomienda para producción sin evaluaciones previas.
- Investigación sobre sesgos geográficos: el entrenamiento con nombres de ciudades alemanas podría interesar a quienes estudian sesgos en modelos de lenguaje, aunque no se han publicado análisis.
- Pruebas de eficiencia de entrenamiento con Unsloth: el modelo demuestra que es posible ajustar OLMo-3-7B con herramientas de optimización, pero no aporta valor funcional.
- Integración en pipelines de generación de texto en inglés (como backend de una API simple) si se acepta el riesgo de alucinación y falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros. El autor no proporciona ninguna métrica de evaluación, por lo que no es posible comparar su rendimiento con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16 se necesitan aproximadamente 14-16 GB de VRAM (un modelo de 7B en FP16 ocupa ~14 GB). Con cuantización de 8 bits se reduce a ~8 GB, y en 4 bits a ~4-5 GB, aunque no se proporcionan cuantizaciones listas.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son adecuadas. Para cuantización 4-bit, una RTX 3080 (10 GB) o RTX 3090 (24 GB) pueden servir.
- ¿Cabe en GPU consumer? Sí, en cuantización 4-bit o 8-bit en GPUs de 16 GB o más (RTX 4080, 4090, etc.).
- Opciones de despliegue: puede usarse con `transformers` en Python, `vLLM` para alta concurrencia, `llama.cpp` si se convierte a GGUF, o `Ollama` (si se importa manualmente). No hay soporte oficial documentado.
- Latencia y throughput: no se proporcionan datos; en una RTX 4090 con FP16, se espera un throughput de 20-40 tokens/s para generación de texto de 7B, pero no es un dato oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 | Apache 2.0 | Modelo base, sin fine-tuning específico. |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Mejor documentado, mayor contexto, soporte de tool calling. |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Mayor contexto, mejor rendimiento general en benchmarks. |

No se dispone de datos de rendimiento comparativos para el modelo fine-tuneado, por lo que no se puede posicionar frente a estos. El modelo base OLMo-3-7B-Instruct tiene resultados públicos en MMLU (~60%), pero este fine-tune no ha sido evaluado.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark ni evaluación de rendimiento; el modelo puede comportarse de manera impredecible.
- El entrenamiento se realizó sobre un conjunto de datos muy específico (nombres de ciudades alemanas), lo que puede haber degradado su rendimiento en tareas generales de inglés.
- No se documentan sesgos ni riesgos de alucinación, pero como modelo de 7B sin alineación adicional, existe un riesgo inherente de generar información falsa o incoherente.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de que el modelo sea seguro para producción.
- El número de parámetros reportado en el repositorio (528, 384) es erróneo, lo que sugiere que la subida no fue verificada correctamente; no se puede confiar en los metadatos del repo.
- Solo se soporta inglés; no se garantiza el funcionamiento en otros idiomas, incluido el alemán a pesar del nombre.
- No hay soporte de tool calling ni function calling, lo que limita su uso en agentes autónomos.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ni validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed4-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Página de OLMo (AI2): https://allenai.org/olmo (información general sobre la arquitectura)
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL: https://huggingface.co/docs/trl/index
- Modelos similares en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-v2-sft (para referencia de otros fine-tunes similares)

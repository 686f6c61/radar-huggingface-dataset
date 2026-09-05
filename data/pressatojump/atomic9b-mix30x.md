# pressatojump/atomic9b-mix30x

## Resumen

atomic9b-mix30x es un modelo de lenguaje causal de 9.000 millones de parámetros (exactamente 8.953.803.264) creado por el usuario de Hugging Face pressatojump. Se trata de un checkpoint fusionado en BF16 que parte del modelo base petruhonk/Qwen3.8-9B-Distill-uncensored-heretic, un destilado de Qwen3.5 de 9B con una ventana de contexto de 262.000 tokens. El modelo se ha sometido a dos pasadas de SFT (supervised fine-tuning) usando Unsloth QLoRA: una primera con un conjunto sintético PME de ~2.570 filas y una segunda con el corpus ChatML mix30x (252.401 muestras de entrenamiento y 21.941 de evaluación), con una pérdida de entrenamiento final de 0,4249. Está orientado a generación de texto conversacional en inglés y se distribuye bajo licencia Apache-2.0.

La relevancia del modelo radica en su combinación de un contexto largo (262k tokens), soporte de tool calling y un enfoque "uncensored" sin fine-tune de seguridad adicional, lo que lo hace atractivo para investigación y prototipado en entornos donde se requiere máxima libertad de generación. Sin embargo, al no existir benchmarks publicados y tener cero descargas y cero likes en Hugging Face, su rendimiento no está validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForCausalLM) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | BF16 (safetensors); Q8_0 GGUF (exportación mencionada en la model card) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF disponible |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer causal estándar basada en Qwen3.5 9B, con 32 capas y hidden_size de 4096. Aunque la familia Qwen3.5 incluye una torre de visión, este checkpoint es exclusivamente de texto (qwen3_5_text) y no incluye componentes de visión. El proceso de entrenamiento consistió en dos pasadas de SFT con Unsloth QLoRA (r=16, alpha=32) sobre el modelo base heretic. La primera pasada usó un conjunto sintético PME de ~2.570 filas; la segunda, un corpus ChatML denominado mix30x con 252.401 muestras de entrenamiento y 21.941 de evaluación, durante 1 época con seq_len 2048, batch de 1, grad_accum 8, lr 2e-4 y warmup de 200 pasos. Se aplicaron máscaras de pensamiento (mask_think) y un ajuste de pesos hacia herramientas (upweight_tools), con una fracción de pensamiento de 0,75 y respuesta directa de 0,25. Las capas de visión se congelaron durante el entrenamiento. No se aplicó RLHF ni DPO; la línea "heretic" implica que no se añadió un fine-tune de seguridad adicional.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML.
- Soporte de tool calling / function calling, favorecido por el ajuste upweight_tools durante el entrenamiento.
- Razonamiento multi-paso con modo "thinking" (think_frac 0,75).
- Contexto largo de 262.000 tokens, apto para documentos extensos o conversaciones prolongadas.
- Sin capacidades de visión: es un modelo de texto puro, a pesar de la base Qwen3.5.
- Modelo "uncensored" sin filtros de seguridad añadidos, lo que permite generación sin restricciones de contenido.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno extensos gracias a su ventana de 262k tokens, ideal para soporte o chatbots con memoria larga.
- Generación de código con tool calling: al soportar function calling, puede integrarse en pipelines de CI/CD o agentes que necesitan ejecutar herramientas externas, como consultas a APIs o búsquedas.
- Análisis de documentos largos: procesa manuales técnicos, logs o informes completos sin necesidad de dividir el contenido en fragmentos, gracias al contexto amplio.
- Razonamiento complejo con cadena de pensamiento: el modo thinking permite desglosar problemas de lógica o matemáticas en pasos intermedios, útil en tareas de investigación.
- Prototipado de dominios especializados: su arquitectura basada en QLoRA facilita que otros desarrolladores lo fine-tuneen con datasets propios (como hizo el autor con PME y mix30x) para adaptarlo a nichos concretos.
- Exploración de temas sensibles sin censura: en entornos académicos o de investigación donde los modelos alineados son restrictivos, este modelo permite analizar contenido que otros modelos rechazan, siempre que se respete la legalidad aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~18 GB de VRAM para los pesos (17,9 GB según el repo), más overhead de activaciones; se recomienda al menos 20 GB.
- Para la cuantización Q8_0 GGUF: ~9-10 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo con 12-16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100. En consumer GPU, la RTX 4090 es suficiente para BF16; una RTX 4080 de 16 GB podría funcionar con cuantización.
- Opciones de despliegue: Hugging Face transformers, llama.cpp para el GGUF, Ollama (importando el GGUF), y vLLM/TGI para el formato safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| atomic9b-mix30x | 8,95B | 262k | Apache-2.0 | safetensors BF16, GGUF Q8_0 | no disponible |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic | 8,95B | 262k | Apache-2.0 | safetensors | no disponible |

Ambos modelos comparten arquitectura, contexto y licencia. La diferencia principal es que atomic9b-mix30x añade dos pasadas de SFT (PME y mix30x) sobre el modelo base, con un ajuste específico para tool calling y modo thinking.

## Limitaciones y advertencias

- Sesgos: al estar fine-tuneado con datos sintéticos y sin evaluación de sesgos, pueden existir sesgos no documentados en las respuestas.
- Riesgo de alucinación: el contexto largo de 262k tokens puede degradar la atención y aumentar la probabilidad de respuestas inventadas o incoherentes.
- Limitaciones de idioma: solo se declara inglés en la model card; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la naturaleza "uncensored" puede generar contenido inapropiado, lo que supone riesgos legales en sectores regulados.
- Caveat de producción: al no tener benchmarks publicados y contar con 0 descargas y 0 likes, el modelo no está validado por la comunidad; se recomienda probarlo exhaustivamente antes de usarlo en entornos productivos.
- El modelo base es un destilado de Qwen3.5, por lo que su rendimiento puede ser inferior al modelo original no destilado.

## Enlaces

- Hugging Face: https://huggingface.co/pressatojump/atomic9b-mix30x
- Modelo base: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Página de modelos del autor: https://huggingface.co/pressatojump/models

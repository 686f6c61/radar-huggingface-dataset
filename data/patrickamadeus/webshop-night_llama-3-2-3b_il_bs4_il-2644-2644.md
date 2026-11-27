# patrickamadeus/webshop-night_Llama-3.2-3B_IL_bs4_IL.2644.2644

## Resumen

webshop-night_Llama-3.2-3B_IL_bs4_IL.2644.2644 es un ajuste fino completo (full fine-tune) del modelo meta-llama/Llama-3.2-3B-Instruct realizado por el usuario patrickamadeus sobre el benchmark WebShop, un entorno de compra simulada en el que un agente debe navegar por un catálogo y ejecutar acciones para completar objetivos. El modelo se entrena mediante aprendizaje por imitación (imitation learning) sobre trayectorias de experto en la configuración "night-1", con 1.110 tareas de entrenamiento y 10.576 filas de datos estado-acción.

Se trata de un artefacto de investigación experimental, no de un modelo de propósito general: su objetivo es servir de punto de partida para estudiar el fenómeno de la "experiencia temprana" (early experience) en agentes, comparando imitación pura frente a modelado implícito del mundo o autorreflexión. La nomenclatura del repositorio codifica la configuración del entrenamiento: benchmark, modelo base, brazo algorítmico, tamaño de batch y etapas con sus pasos.

El modelo tiene 3.212.749.824 parámetros y hereda la arquitectura y licencia del Llama 3.2 original. Es relevante ahora únicamente en el contexto de la investigación sobre agentes y aprendizaje por imitación en entornos tipo WebShop, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only de 3.2 mil millones de parámetros. El entrenamiento se realizó con LlamaFactory en modo SFT (supervised fine-tuning) completo, con learning rate 1e-5, schedule coseno con 3% de warmup, precisión bf16, optimizador paged AdamW de 8 bits, longitud máxima de 4.096 tokens y semilla 0. El batch efectivo fue de 4 filas por paso.

Los datos de entrenamiento corresponden al brazo de imitation learning (IL) sobre las filas de experto (estado → acción) de las 1.110 tareas del setup "night-1" de WebShop, con datos de world-model generados mediante un rewind propio. La etapa única documentada (IL.2644.2644) completó 2.644 pasos de 2.644, equivalentes a 1,00 épocas sobre 10.576 filas. El nombre del repositorio indica que la etapa está finalizada (los dos números coinciden). No se documentan innovaciones arquitectónicas adicionales más allá del ajuste fino estándar.

## Capacidades

- Generación de texto y razonamiento heredados del Llama-3.2-3B-Instruct base, aunque reorientados al dominio de WebShop.
- Ejecución de acciones de agente en el entorno WebShop: selección de acciones a partir del estado de la página y del objetivo de compra.
- Aprendizaje por imitación de trayectorias de experto en tareas de compra simulada.
- Soporte de tool calling: no disponible de forma explícita en la model card; se hereda potencialmente del modelo base, pero no está verificado.
- Capacidades de agente multi-paso: entrenado específicamente para episodios de 15 pasos en WebShop.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación para agentes: el modelo sirve como línea base del brazo IL en WebShop para comparar con variantes de modelado implícito del mundo o autorreflexión descritas en el paper de referencia.
- Reproducción de experimentos de "early experience": permite replicar la configuración night-1 con 1.110 tareas y verificar tasas de éxito bajo las mismas condiciones (temperatura 0.4, 15 pasos).
- Estudio de la nomenclatura y trazabilidad de experimentos: el nombre del repositorio codifica cada etapa, batch y paso, útil para auditar pipelines de entrenamiento con LlamaFactory.
- Punto de partida para fine-tuning posterior: al ser un full fine-tune de Llama-3.2-3B-Instruct, puede reutilizarse como inicialización para nuevas etapas de entrenamiento en el mismo entorno.
- Evaluación de agentes en entornos de compra simulada: útil para medir generalización a objetivos estándar (0-499) y comparar con otros brazos algorítmicos.
- Docencia y divulgación sobre agentes LLM: ejemplo concreto y reproducible de cómo se construye un agente especializado mediante SFT sobre trayectorias de experto.

## Benchmarks y rendimiento

WebShop success rate (%), temperatura 0.4, 15 pasos, con intervalo de confianza al 95%:

| Test set | Success |
|---|---|
| standard goals 0-499 | 29,0 (25,0-33,0) |

Referencia del paper (Early Experience, Table 1, Llama-3.2-3B, WebShop):

| Brazo | Success |
|---|---|
| Imitation | 41,8 |
| Implicit world modeling | 60,2 |
| Self-reflection | 52,7 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos (3,2 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,2 GB para pesos; en 4 bits, alrededor de 1,6 GB (no se publican pesos cuantizados, habría que generarlos).
- GPU recomendadas: A100, H100 o L40S para entrenamiento e inferencia a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 12-16 GB probablemente requiera cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF, y transformers con LlamaFactory para evaluación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WebShop success | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-night_Llama-3.2-3B_IL_bs4_IL.2644.2644 | 3,21 B | 4.096 | 29,0% (goals 0-499) | llama3.2 | Hugging Face |
| Llama-3.2-3B-Instruct (base) | 3,21 B | 128 K (según modelo original) | no disponible | llama3.2 | Hugging Face |
| Brazo imitation del paper (Llama-3.2-3B) | 3,21 B | no disponible | 41,8% | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso general ni para producción fuera del entorno WebShop.
- Tasa de éxito limitada: 29,0% en objetivos estándar 0-499, por debajo del 41,8% reportado para el brazo de imitación del paper, lo que sugiere diferencias de configuración o de evaluación que no se detallan.
- Riesgo de alucinación: heredado del modelo base; además, en entornos de agente puede generar acciones inválidas o no alineadas con el estado de la página.
- Sesgos conocidos: no documentados en la model card; se heredan los del Llama-3.2-3B-Instruct original.
- Limitaciones de contexto: el entrenamiento usó 4.096 tokens; no se garantiza comportamiento correcto con secuencias más largas.
- Idiomas: no se documenta soporte multilingüe específico; el entrenamiento se realizó presumiblemente en inglés por el dominio WebShop.
- Restricciones de licencia: licencia llama3.2, que impone condiciones de uso comercial y requiere cumplir la política de uso aceptable de Meta; revisar antes de cualquier despliegue.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado; no hay garantía de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/webshop-night_Llama-3.2-3B_IL_bs4_IL.2644.2644
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

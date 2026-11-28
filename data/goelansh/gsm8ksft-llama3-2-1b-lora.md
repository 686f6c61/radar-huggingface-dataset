# goelansh/gsm8ksft-llama3.2-1B-lora

## Resumen

`goelansh/gsm8ksft-llama3.2-1B-lora` es un adaptador LoRA publicado en Hugging Face por el usuario goelansh, según la convención de nombres empleada, un ajuste fino supervisado (SFT) sobre el modelo base Llama 3.2 de 1B parámetros orientado a la resolución de problemas matemáticos de tipo GSM8K. El repositorio tiene un tamaño de 0,1 GB, coherente con un conjunto de pesos de adaptador de bajo rango y no con un modelo completo. La model card es la plantilla automática de Hugging Face y no contiene información sustantiva: no se documentan datos de entrenamiento, hiperparámetros ni resultados de evaluación.

El interés de esta ficha es limitado pero real para quien investigue recetas de ajuste fino eficiente en modelos pequeños: un LoRA sobre un transformer de 1B parámetros permite evaluar si el razonamiento aritmético de un modelo de bolsillo mejora con SFT sobre un corpus de problemas de primaria. No obstante, la ausencia total de documentación, de métricas y de licencia explícita hace que no sea apto para producción sin una evaluación propia y una verificación jurídica previa.

La información disponible no permite confirmar la arquitectura exacta del adaptador ni el dataset utilizado más allá de lo que sugiere el identificador del repositorio. Todo lo que sigue distingue explícitamente entre datos verificados en el Hub y datos inferidos o no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base Llama 3.2 1B, inferido del identificador del repositorio; no confirmado en la model card) |
| Parametros totales | No disponible para el adaptador; el modelo base Llama 3.2 1B tiene aproximadamente 1.240 millones de parámetros (dato del modelo base, no del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Llama 3.2 1B soporta 131.072 tokens según su model card oficial |
| Tipos de cuantizacion | No disponible; al ser un adaptador LoRA, la cuantización se aplica al modelo base (por ejemplo, 4 bits o 8 bits) y el adaptador se mantiene en fp16/bf16 |
| Idiomas soportados | No disponible en el repositorio; el modelo base Llama 3.2 declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en el repositorio; el modelo base Llama 3.2 se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | Safetensors (tag `safetensors` del Hub); pesos del adaptador LoRA, no del modelo completo |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre un modelo base Llama 3.2 de 1B parámetros. Llama 3.2 1B es un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y atención agrupada (GQA), diseñado por Meta para inferencia en dispositivo. El adaptador en sí no modifica la arquitectura: añade matrices de bajo rango en determinadas capas lineales, lo que reduce drásticamente el número de parámetros entrenables y el tamaño del artefacto (0,1 GB en el Hub).

No se dispone de información sobre el procedimiento de entrenamiento: ni el número de pasos, ni el rango del LoRA, ni la tasa de aprendizaje, ni la composición exacta del dataset. El identificador `gsm8ksft` sugiere un ajuste fino supervisado sobre GSM8K (Grade School Math 8K), un corpus de unos 8.500 problemas matemáticos de primaria con soluciones paso a paso, pero esta correspondencia no está confirmada en la model card. Tampoco hay evidencia de RLHF, DPO ni de ninguna innovación técnica adicional. La referencia `arxiv:1910.09700` que aparece en los tags corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono en aprendizaje automático, citado en la plantilla estándar de model card, y no a un artículo sobre este modelo.

## Capacidades

- Generación de texto y razonamiento aritmético de nivel escolar, presumiblemente reforzado por el ajuste sobre problemas tipo GSM8K (inferido, no verificado).
- Resolución de problemas matemáticos con pasos intermedios, si el entrenamiento siguió el formato de cadena de pensamiento habitual en GSM8K.
- Herencia de las capacidades del modelo base Llama 3.2 1B: generación de texto general, comprensión lectora básica y cierto soporte de instrucciones.
- Soporte de tool calling: no documentado en el adaptador; el modelo base Llama 3.2 incluye plantillas de tool calling, pero no hay garantía de que el ajuste las preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas para el adaptador; las del modelo base dependen de la licencia y de la model card de Meta.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de recetas de ajuste fino eficiente: el adaptador sirve como referencia para reproducir un pipeline de SFT con LoRA sobre un modelo de 1B parámetros y comparar la curva de aprendizaje en tareas aritméticas.
- Investigación sobre razonamiento matemático en modelos pequeños: permite estudiar hasta qué punto un modelo de 1B parámetros puede internalizar patrones de resolución de problemas de primaria tras un ajuste ligero.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de solución que sirvan como semilla para destilación o para ampliar un corpus de entrenamiento, siempre con revisión humana.
- Prototipado educativo: tutores automáticos de matemáticas básicas en entornos controlados, con validación de las respuestas por un verificador simbólico.
- Comparación de adaptadores: al ser un artefacto pequeño, es útil para experimentos de merging de LoRAs o de evaluación de olvido catastrófico frente al modelo base.
- Pruebas de integración con `transformers` y `peft`: sirve para validar flujos de carga de adaptadores, serialización y despliegue en infraestructura propia antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa del orden de 0,1 GB; el modelo base Llama 3.2 1B requiere aproximadamente 2,5 GB en fp16, 1,3 GB en cuantización de 4 bits y 0,7 GB en cuantización de 8 bits (estimaciones para el modelo base, no verificadas en el repositorio).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16 y 2 GB para 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque las dos últimas están sobredimensionadas para un modelo de 1B.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas de los últimos cinco años, e incluso en CPU con llama.cpp en cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador, `vLLM` y `TGI` con soporte de LoRA, `llama.cpp` y `Ollama` tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles para este adaptador; para el modelo base de 1B en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goelansh/gsm8ksft-llama3.2-1B-lora | Adaptador LoRA sobre 1B | No disponible (base: 131.072) | SFT matemático (inferido) | No disponible | Hugging Face, 0 descargas |
| Llama 3.2 1B Instruct (Meta) | 1.240 M | 131.072 | Modelo base con instrucciones | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-Math-1.5B-Instruct | 1.500 M | 32.768 | Especializado en matemáticas | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 | Modelo pequeño generalista | Apache 2.0 | Hugging Face |

La comparación es orientativa: el adaptador de goelansh no publica métricas, por lo que no puede situarse objetivamente frente a Qwen2.5-Math o SmolLM2 en tareas matemáticas. Su principal ventaja es el tamaño reducido del artefacto y su compatibilidad con el ecosistema Llama; su principal desventaja es la falta de documentación y de licencia explícita.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face y no documenta nada: ni datos, ni hiperparámetros, ni evaluación, ni uso previsto.
- No se declara licencia en el repositorio. El adaptador deriva presumiblemente de Llama 3.2, cuya licencia comunitaria impone restricciones de uso comercial y obligaciones de atribución que deben verificarse antes de cualquier despliegue.
- No hay evidencia de evaluación: no se puede afirmar que el ajuste mejore el rendimiento en GSM8K ni que no degrade otras capacidades del modelo base.
- Riesgo de olvido catastrófico: un SFT sobre un corpus estrecho puede deteriorar el comportamiento conversacional general del modelo base.
- Riesgo de alucinación en pasos intermedios: los modelos pequeños de 1B parámetros cometen errores aritméticos con frecuencia, incluso tras ajuste fino.
- Idiomas: el ajuste probablemente se realizó en inglés (GSM8K es un corpus en inglés), por lo que el rendimiento en castellano puede ser deficiente.
- Sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Uso en producción no recomendado sin una evaluación propia reproducida y una revisión legal de la licencia del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goelansh/gsm8ksft-llama3.2-1B-lora
- Modelo base Llama 3.2 1B (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B
- Artículo citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Dataset GSM8K (referencia): https://huggingface.co/datasets/openai/gsm8k
- Librería PEFT para cargar adaptadores LoRA: https://github.com/huggingface/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact

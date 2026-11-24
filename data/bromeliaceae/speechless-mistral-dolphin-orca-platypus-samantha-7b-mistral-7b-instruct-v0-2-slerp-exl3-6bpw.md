# bromeliaceae/speechless-mistral-dolphin-orca-platypus-samantha-7b-Mistral-7B-Instruct-v0.2-slerp-exl3-6bpw

## Resumen

Este repositorio contiene una cuantización de 6 bits en formato EXL3 de un modelo resultante de la fusión (merge) de dos modelos Mistral de 7B: `mistralai/Mistral-7B-Instruct-v0.2` y `uukuguy/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85`. La fusión se realizó con la técnica SLERP mediante mergekit (lazymergekit), combinando capas de atención y MLP con valores de interpolación distintos según el tipo de capa. El autor del repositorio es el usuario de Hugging Face `bromeliaceae`.

El modelo base es un transformer decoder-only de la familia Mistral, con aproximadamente 7.000 millones de parámetros en su versión original en bfloat16. Sin embargo, el artefacto publicado es una cuantización de 6 bits que, según los metadatos de safetensors, contiene 2.800.393.472 parámetros almacenados, lo que refleja el empaquetado del esquema EXL3 (ExLlamaV3) y no el número real de parámetros del modelo original.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, sin model card propia más allá de una nota sobre la cuantización, sin benchmarks publicados, sin idiomas declarados y sin descargas ni interacciones registradas en el momento de la consulta. Es útil como ejemplo de pipeline de fusión más cuantización, pero no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral), resultado de fusión SLERP |
| Parametros totales | ~7B en el modelo original; 2.800.393.472 parámetros almacenados en el artefacto safetensors (empaquetado EXL3 de 6 bits) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 6 bits en formato EXL3 (exl3, 6bpw) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización EXL3, 6 bits) |

## Arquitectura y entrenamiento

El modelo subyacente es una fusión por SLERP de dos checkpoints Mistral de 7B. La configuración de mergekit define dos fuentes con rango de capas `[0, 32]`: `mistralai/Mistral-7B-Instruct-v0.2` como modelo base y `uukuguy/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85` como segundo componente. El parámetro de interpolación `t` varía por tipo de capa: en `self_attn` toma los valores `[0, 0.5, 0.3, 0.7, 1]`, en `mlp` toma `[1, 0.5, 0.7, 0.3, 0]` y para el resto de capas se fija en `0.5`. El `dtype` de la fusión es `bfloat16`.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) de los modelos originales en la documentación proporcionada. El segundo componente, `speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85`, es a su vez un modelo fusionado con la técnica DARE (probablemente a partir de checkpoints tipo Dolphin, Orca, Platypus y Samantha), pero no se detalla su composición ni su entrenamiento. La innovación técnica destacable de este repositorio es la cuantización EXL3 a 6 bits por peso, orientada a inferencia eficiente con ExLlamaV3.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Mistral-7B-Instruct-v0.2 y del componente de instrucciones.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzado por la mezcla de datasets implícita en el componente `speechless-mistral-dolphin-orca-platypus-samantha`.
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible, aunque los componentes Orca y Platypus suelen incluir datos de este tipo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con pipelines de fusión de modelos: el repositorio sirve como referencia para reproducir una fusión SLERP con mergekit y evaluar el efecto de los parámetros `t` por tipo de capa en la calidad del resultado.
- Inferencia local con ExLlamaV3: la cuantización EXL3 de 6 bits está pensada para ejecutarse con el runtime ExLlamaV3, lo que permite desplegar el modelo en GPUs de consumo con menor huella de memoria que la versión bfloat16.
- Prototipado de asistentes conversacionales: al derivar de Mistral-7B-Instruct-v0.2, puede usarse para generar respuestas multi-turno en entornos de prueba, siempre que se validen los sesgos y la calidad de la fusión.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el modelo fusionado en bfloat16 y su versión EXL3 de 6 bits en tareas de generación abierta.
- Investigación sobre mezcla de datasets: el componente `speechless-mistral-dolphin-orca-platypus-samantha` combina señales de varios datasets de instrucciones, por lo que el artefacto puede emplearse para estudiar cómo se comporta una fusión de ese tipo frente al modelo base.
- Base para ajuste fino ligero: al ser un modelo de 7B con licencia Apache 2.0, puede servir como punto de partida para LoRA o QLoRA en tareas específicas, aunque la cuantización EXL3 no es el formato ideal para entrenamiento y habría que partir del modelo en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,6 GB, lo que da una cota inferior de memoria para cargar los pesos EXL3 de 6 bits; a ello hay que sumar la memoria para el contexto KV y el overhead del runtime.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del artefacto, es plausible que quepa en GPUs de consumo con 8-12 GB de VRAM, pero no se confirma en la documentación.
- Cabe en consumer GPU: no confirmado explícitamente; el tamaño de 5,6 GB sugiere que sí en GPUs con al menos 8 GB, pero es una inferencia, no un dato del autor.
- Opciones de despliegue: ExLlamaV3 (formato EXL3). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (fusión SLERP + EXL3 6bpw) | ~7B (2.800.393.472 almacenados) | no disponible | apache-2.0 | safetensors EXL3 | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 | ~7B | 32.768 tokens (según el modelo base) | apache-2.0 | safetensors, GGUF (comunidad) | Hugging Face, ampliamente utilizado |
| uukuguy/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85 | ~7B | no disponible | no disponible en esta ficha | safetensors | Hugging Face |
| MaziyarPanahi/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85-Mistral-7B-Instruct-v0.2-slerp | ~7B | no disponible | no disponible en esta ficha | safetensors (bfloat16) | Hugging Face |

## Limitaciones y advertencias

- El repositorio no incluye benchmarks, evaluación de sesgos ni idiomas declarados; cualquier uso en producción requiere una evaluación propia.
- La fusión SLERP con parámetros `t` distintos por capa puede degradar capacidades específicas del modelo base; no hay evidencia publicada sobre el resultado.
- Riesgo de alucinación inherente a los modelos de 7B de la familia Mistral, especialmente en dominios especializados.
- La cuantización EXL3 de 6 bits puede introducir una pérdida de calidad adicional respecto al modelo fusionado en bfloat16; no se documenta la magnitud de esa pérdida.
- El formato EXL3 limita las opciones de despliegue a ExLlamaV3; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos originales fusionados, ya que la información disponible no las detalla.
- El repositorio no registra descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad.
- El número de parámetros almacenados (2.800.393.472) no debe interpretarse como el tamaño real del modelo, sino como el resultado del empaquetado de la cuantización EXL3.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bromeliaceae/speechless-mistral-dolphin-orca-platypus-samantha-7b-Mistral-7B-Instruct-v0.2-slerp-exl3-6bpw
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Componente fusionado: https://huggingface.co/uukuguy/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85
- Modelo fusionado en bfloat16 (referencia del autor en la model card): https://huggingface.co/MaziyarPanahi/speechless-mistral-dolphin-orca-platypus-samantha-7b-dare-0.85-Mistral-7B-Instruct-v0.2-slerp
- mergekit (herramienta de fusión): https://github.com/arcee-ai/mergekit
- ExLlamaV3 (runtime para formato EXL3): https://github.com/turboderp-org/exllamav3

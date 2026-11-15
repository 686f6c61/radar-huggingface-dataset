# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-dpo es un modelo de lenguaje de aproximadamente 476 millones de parámetros especializado en japonés, desarrollado por el usuario nagohachi. No se trata de un modelo entrenado desde cero, sino de un derivado de Meta Llama-3.2-3B obtenido mediante poda estructurada de anchura (width pruning), seguida de preentrenamiento de recuperación sobre unos 10.000 millones de tokens, ajuste supervisado (SFT) y alineamiento final mediante DPO. El modelo resultante conserva la arquitectura tipo Llama pero con un vocabulario sustituido por el del tokenizador de llm-jp-3-440m, de 99.574 entradas.

La relevancia de esta ficha radica en que ejemplifica una estrategia de compresión agresiva: reducir un modelo de 3B a menos de 500M parámetros manteniendo una funcionalidad conversacional básica en japonés. Es la variante alineada con DPO del modelo SFT del mismo autor, y a su vez la contraparte basada en poda del modelo entrenado desde cero tiny-lm-v1-japanese-500m. La ventana de contexto es de 2.048 tokens, muy limitada en comparación con los estándares actuales.

El modelo requiere `trust_remote_code=True` porque utiliza una implementación propia de estilo Llama incluida en el repositorio, y emplea la plantilla de chat de llm-jp-3 instruct. Su licencia es la Llama 3.2 Community License, heredada del modelo base de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (implementación custom `scratch_llama`), podado en anchura |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |
| Tamano del vocabulario | 99.574 |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Modelo base | meta-llama/Llama-3.2-3B |
| Tamano del repo | 1,0 GB |
| Descargas | 54 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama, pero con una anchura reducida respecto al modelo original de 3B mediante poda estructurada. El proceso de construcción tiene cuatro fases encadenadas: poda de anchura sobre Llama-3.2-3B, preentrenamiento de recuperación sobre aproximadamente 10.000 millones de tokens (modelo base), ajuste supervisado para obtener el modelo SFT y, finalmente, alineamiento con DPO. El tokenizador original de Llama se reemplaza por el de llm-jp-3-440m, lo que explica el tamaño de vocabulario de 99.574 entradas y la especialización en japonés.

La fase de DPO utiliza el dataset llm-jp/hh-rlhf-12k-ja, con aproximadamente 11.500 pares de preferencia en japonés. Se emplea un valor de β = 0,1, con la referencia SFT congelada y arranque en caliente desde el propio modelo SFT. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas; el interés técnico está en el pipeline de compresión y recuperación, no en cambios arquitectónicos.

## Capacidades

- Generación de texto conversacional en japonés, con plantilla de chat de llm-jp-3 instruct.
- Respuestas a instrucciones de un solo turno y conversaciones multi-turno dentro de la ventana de 2.048 tokens.
- Tareas lingüísticas básicas en japonés: comprensión lectora, análisis morfológico, traducción y clasificación de texto (evaluadas en llm-jp-eval).
- Generación de código limitada, tanto en inglés como en japonés (puntuaciones HE-EN y HE-JA bajas según los benchmarks).
- Alineamiento conversacional mediante DPO, orientado a preferencias humanas en japonés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo thinking.

## Casos de uso

- Prototipado rápido de chatbots en japonés: el modelo cabe en cualquier GPU de consumo y permite iterar sobre plantillas de chat y prompts sin coste de infraestructura elevado, aunque la calidad conversacional es limitada.
- Experimentación académica sobre compresión de modelos: sirve como caso de estudio reproducible del pipeline poda + preentrenamiento de recuperación + SFT + DPO, comparando con el modelo from-scratch del mismo autor.
- Clasificación y etiquetado de texto japonés en entornos con restricciones de memoria: tareas como análisis de sentimiento o categorización de documentos cortos donde la ventana de 2.048 tokens es suficiente.
- Generación de respuestas cortas en asistentes de dominio acotado: FAQ, respuestas predefinidas o borradores que un humano revisa después, aprovechando el alineamiento DPO.
- Investigación sobre alineamiento en modelos pequeños: evaluación del impacto de DPO sobre un modelo de 476M en japonés, con datos de llm-jp-eval comparables entre base, SFT y DPO.
- Despliegue en dispositivos con poca VRAM: inferencia en GPUs de gama baja o incluso CPU para demos y pruebas de concepto, dado el tamaño reducido de los pesos en bfloat16.
- Traducción japonés-inglés de frases cortas: el modelo muestra su mejor puntuación relativa en la tarea MT de llm-jp-eval (0,664), lo que lo hace utilizable para traducción de segmentos breves con revisión humana.

## Benchmarks y rendimiento

Resultados en llm-jp-eval (v2.1.5), 100 ejemplos del split de test con decodificación greedy. Los modelos base usan ajuste de 4 ejemplos (4-shot); los modelos SFT/DPO y el baseline instruct se evalúan a través de su plantilla de chat.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,232 | 0,270 | 0,322 | 0,061 | 0,170 | 0,100 | 0,013 | 0,657 | 0,398 | 0,137 | 0,190 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,224 | 0,320 | 0,229 | 0,058 | 0,153 | 0,090 | 0,017 | 0,665 | 0,405 | 0,112 | 0,190 |
| **Llama-3.2-tiny-lm-v2-japanese-500m-dpo** | **0,222** | **0,320** | **0,225** | **0,064** | **0,153** | **0,060** | **0,017** | **0,664** | **0,395** | **0,108** | **0,210** |
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

Lectura de los datos: el modelo DPO obtiene un promedio de 0,222, ligeramente por debajo del base (0,232) y del SFT (0,224), y por debajo de los modelos llm-jp-3-440m (0,249 y 0,254). Destaca en MT (0,664) y RC (0,210), y es especialmente débil en HE-JA (0,060) y MR (0,017). El DPO no mejora el promedio de llm-jp-eval respecto al SFT, algo esperable dado que la alineación por preferencias no está optimizada para estas tareas académicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (476M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contexto completo de 2.048 tokens.
- VRAM estimada en float32: alrededor de 1,9 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También cabe en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas, e incluso en placas con memoria unificada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la implementación custom); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la implementación custom puede requerir adaptaciones para esos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | average llm-jp-eval | Disponibilidad |
| :--- | ---: | ---: | :--- | ---: | :--- |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 476M | 2.048 | Llama 3.2 Community | 0,222 | Hugging Face (54 descargas) |
| tiny-lm-v1-japanese-500m-dpo | ~500M | no disponible | Llama 3.2 Community (derivado del mismo autor) | 0,194 | Hugging Face |
| llm-jp/llm-jp-3-440m | 440M | no disponible | no disponible en la información | 0,249 | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | no disponible en la información | 0,254 | Hugging Face |

El modelo se sitúa por encima de la familia tiny-lm-v1 del mismo autor en promedio (0,222 frente a 0,194) pero por debajo de los modelos llm-jp-3-440m, que además usan un tokenizador y un corpus nativos en japonés. La ventaja principal del modelo frente a llm-jp-3-440m no está en el rendimiento, sino en el interés metodológico del pipeline de poda desde Llama-3.2-3B.

## Limitaciones y advertencias

- Rendimiento global modesto: promedio de 0,222 en llm-jp-eval, por debajo de modelos de tamaño similar entrenados específicamente en japonés.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo soporta japonés; no se documenta capacidad multilingüe.
- Riesgo elevado de alucinación y de respuestas incoherentes en tareas de razonamiento, matemáticas o código, dado el tamaño reducido y las puntuaciones bajas en HE-EN, HE-JA y MR.
- El DPO no mejora el promedio de llm-jp-eval respecto al SFT e incluso reduce algunas métricas (HE-JA de 0,090 a 0,060); la alineación está orientada a preferencias, no a exactitud factual.
- Requiere `trust_remote_code=True` por la implementación custom `scratch_llama`, lo que implica ejecutar código del repositorio y complica la integración con motores de inferencia estándar.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, incluyendo obligaciones de atribución ("Built with Llama") y cumplimiento de la Acceptable Use Policy; conviene revisar los términos antes de desplegar en producción.
- Modelo con muy poca tracción (54 descargas, 0 likes) y sin validación comunitaria; no se recomienda para producción sin evaluación propia.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con herramientas que las requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Modelo SFT del mismo autor: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Modelo base (tras poda y preentrenamiento de recuperación): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Contraparte from-scratch v1 DPO: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Contraparte from-scratch v1 base: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Contraparte from-scratch v1 SFT: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de preferencias: https://huggingface.co/datasets/llm-jp/hh-rlhf-12k-ja
- Baseline llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3

# KingsonHO/Qwen3.8-Flash-Next-w4a8

## Resumen

Qwen3.8-Flash-Next-w4a8 es una versión cuantizada del modelo Qwen3.8-Flash-Next, publicada por el usuario KingsonHO en Hugging Face. Se trata de una cuantización de pesos y activaciones en formato W4A8 (pesos de 4 bits, activaciones de 8 bits) con precisión mixta W8A8, generada mediante la herramienta ModelSlim 26.1.0 de Huawei. El objetivo es reducir el coste de memoria y cómputo del modelo original para facilitar su despliegue en infraestructura Ascend NPU, manteniendo una precisión cercana a la del modelo en coma flotante.

El modelo hereda las capacidades del Qwen3.8-Flash-Next original, orientado a generación de texto y razonamiento, y está pensado para entornos de producción que requieren inferencia eficiente sobre hardware Ascend 910. El repositorio ocupa 194,3 GB, lo que refleja el tamaño significativo del modelo base y la naturaleza de la cuantización mixta aplicada.

La relevancia de esta ficha radica en que documenta una cuantización de un modelo de gran tamaño con resultados de precisión medidos sobre GPQA Diamond (90,91 % frente al 91,7 % oficial), lo que permite evaluar la degradación introducida por la cuantización antes de adoptarla en producción. No obstante, la información pública disponible es limitada: no se detallan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits) con precisión mixta W8A8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name: other) |
| Formato de pesos | no disponible (repo de 194,3 GB, framework PyTorch) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.8-Flash-Next: no se especifica si es un transformer denso, un modelo MoE o una arquitectura híbrida, ni se detallan el número de parámetros, la longitud de contexto o la composición del dataset de entrenamiento. Tampoco se documentan fases de RLHF, DPO u otras técnicas de alineación.

Lo que sí se documenta es el proceso de cuantización. Se utilizó ModelSlim 26.1.0 (commit `cfb2c0077ec78678983830fab096fbed4176b01e`, con adaptación local para Flash-Next) sobre el modelo en coma flotante, con dispositivo `npu` y `trust_remote_code` activado. El resultado es una cuantización W4A8 con precisión mixta W8A8, validada sobre 8 tarjetas Ascend 910 con la imagen `vllm-ascend:v0.32.0rc-a3-openeuler-cann9.2.1-20261102-r67`. La evaluación se realizó con AIS Bench en modo 0-shot CoT, con un límite de salida de 65.536 tokens, batch size de 32, temperatura 1.0, top_p 0.95, top_k 20, MTP=3 y modo asíncrono activado.

## Capacidades

- Generación de texto: el modelo base está etiquetado con la tarea `text-generation`.
- Razonamiento complejo: los resultados en GPQA Diamond (90,91 %) indican capacidad de razonamiento de nivel experto en preguntas de ciencia de posgrado.
- Razonamiento en cadena (CoT): la evaluación se realizó en modo 0-shot CoT con hasta 65.536 tokens de salida, lo que sugiere soporte para cadenas de razonamiento extensas.
- Decodificación multi-token (MTP): la configuración de evaluación con MTP=3 indica soporte de predicción multi-token, orientada a acelerar la generación.
- Inferencia asíncrona: el modo async está soportado en el stack de despliegue vllm-ascend.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantización en producción: el caso de uso más directo y documentado es comparar la precisión del modelo cuantizado frente al original (90,91 % vs 91,7 % en GPQA Diamond) antes de adoptar W4A8 en un pipeline real, usando AIS Bench como herramienta de validación.
- Despliegue en infraestructura Ascend: el modelo está validado sobre 8 tarjetas Ascend 910 con vllm-ascend, por lo que encaja en entornos con NPU Huawei donde no se dispone de GPU NVIDIA.
- Razonamiento científico y técnico: con un 90,91 % en GPQA Diamond, es adecuado para asistentes de investigación que responden preguntas de nivel posgrado en física, química y biología, con cadenas de razonamiento largas (hasta 65.536 tokens de salida).
- Generación de cadenas de razonamiento extensas: el límite de salida de 65.536 tokens permite tareas que requieren deliberación prolongada, como demostraciones matemáticas o análisis de casos complejos.
- Servicio de inferencia de alto rendimiento: la combinación de cuantización W4A8, MTP=3 y modo asíncrono está orientada a maximizar el throughput en serving con vllm-ascend, adecuado para APIs de generación de texto a escala.
- Base para experimentación con cuantización: al incluir el script de cuantización y la configuración, sirve como referencia para reproducir el proceso sobre otros modelos o ajustar la precisión mixta W4A8/W8A8.

## Benchmarks y rendimiento

| Modelo | Formato | Dataset | Precisión medida | Precisión oficial |
|---|---|---:|---:|---:|
| Qwen3.8-Flash-Next-w4a8 | INT W4A8 / W8A8 mixto | GPQA Diamond | 90,91 % (180/198) | 91,7 % |

Condiciones de evaluación: AIS Bench, 0-shot CoT, salida máxima 65.536 tokens, batch size 32, temperature 1.0, top_p 0.95, top_k 20, MTP=3, async activado, sobre 8 tarjetas Ascend 910.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/NPU estimada: el repositorio de pesos ocupa 194,3 GB, lo que da una cota inferior del espacio de almacenamiento necesario; la memoria de inferencia dependerá de la longitud de contexto y del batch, no disponible en la información.
- Hardware validado: 8 tarjetas Ascend 910 (NPU), según la model card.
- GPU de consumo: no disponible; el modelo está validado exclusivamente sobre Ascend, y su tamaño (194,3 GB de pesos) hace improbable su ajuste en GPU de consumo convencionales.
- Opciones de despliegue: vllm-ascend (imagen `vllm-ascend:v0.32.0rc-a3-openeuler-cann9.2.1-20261102-r67`); otras opciones como llama.cpp, Ollama o TGI no están documentadas.
- Latencia y throughput: no disponibles; la configuración usa MTP=3 y modo asíncrono, orientados a mejorar el rendimiento, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-w4a8 | no disponible | no disponible | 90,91 % (medido) | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next (original) | no disponible | no disponible | 91,7 % (oficial) | qwen-community-1.0 | ModelScope |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación por cuantización: la precisión en GPQA Diamond cae del 91,7 % al 90,91 % (0,79 puntos), una pérdida modesta pero que debe tenerse en cuenta en tareas sensibles a la precisión.
- Licencia restrictiva: la licencia qwen-community-1.0 (license_name: other) debe revisarse en el archivo LICENSE antes de cualquier uso comercial; no se garantiza permiso de uso comercial sin cumplir sus términos.
- Dependencia de hardware Ascend: la validación se realizó exclusivamente sobre NPU Ascend 910 con vllm-ascend; el comportamiento en GPU NVIDIA u otras plataformas no está documentado.
- Requiere `trust_remote_code`: el script de cuantización y presumiblemente la carga del modelo exigen ejecutar código remoto, lo que implica un riesgo de seguridad que debe evaluarse.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser un modelo de razonamiento de gran tamaño, el riesgo de alucinación en dominios especializados persiste.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede confirmarse el rendimiento multilingüe.
- Metadatos incompletos: no se documentan parámetros totales, contexto, formato de pesos ni pipeline, lo que dificulta la planificación de despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/KingsonHO/Qwen3.8-Flash-Next-w4a8
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.8-Flash-Next
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: LICENSE (referenciado en el repositorio)

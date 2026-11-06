# Alberto/ALIA-es-biomedical-7B-Instruct-gguf

## Resumen

ALIA-es-biomedical-7B-Instruct es un modelo de lenguaje de 7.768 millones de parámetros especializado en el dominio biomédico y clínico en castellano. Lo desarrolla el grupo de investigación SINAI de la Universidad de Jaén a partir de ALIA-es-biomedical-7B-Base, que a su vez deriva de Salamandra-7B del Barcelona Supercomputing Center. Esta ficha concreta corresponde a la republicación del autor "Alberto" en formato GGUF, con licencia Apache 2.0.

El modelo resuelve la necesidad de un asistente conversacional en castellano para consultas biomédicas, resumen de documentación clínica y comprensión de guías terapéuticas. Se ha afinado por instrucciones sobre el dataset sintético ALIA-es-biomedical-synthetic-instructions, con 328.071 muestras, lo que le permite seguir instrucciones y mantener conversaciones multi-turno dentro de su dominio.

La relevancia actual radica en que combina una arquitectura transformer densa con atención agrupada (GQA) y Flash Attention, un contexto de 8.192 tokens y un vocabulario amplio de 256.000 tokens, todo bajo licencia permisiva. Conviene señalar que el autor advierte de que el repositorio original presentaba un fichero de safetensors truncado en 8.320 bytes y que él rellenó esos bytes desde la cabecera para poder exportar los pesos; esta circunstancia debe tenerse en cuenta antes de usar la versión GGUF en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, con RoPE, SwiGLU, RMSNorm, Flash Attention y Grouped Query Attention (8 grupos de query) |
| Parametros totales | 7.768.117.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en formato GGUF, pero la model card no detalla los niveles de cuantizacion incluidos) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 32 capas, tamaño oculto de 4.096, 32 cabezas de atención y 8 grupos de query en GQA, con 1.048.576.000 parámetros de embedding y un vocabulario de 256.000 tokens. Usa embeddings posicionales rotatorios (RoPE), activación SwiGLU, normalización RMSNorm y precisión bfloat16 en los pesos originales. La longitud de contexto es de 8.192 tokens.

El ajuste fino supervisado (SFT) se realizó con el framework Axolotl sobre el dataset sintético ALIA-es-biomedical-synthetic-instructions, con 328.071 muestras en castellano del dominio biomédico. Se entrenó durante 2 épocas con tasa de aprendizaje 1,4e-5, programador coseno, 500 pasos de calentamiento, batch global de 128, longitud de secuencia 8.192, optimizador adamw_torch_fused, weight decay 0,003, max grad norm 0,28 y ruido NEFTune con alpha 5. La infraestructura fue el supercomputador CALENDULA de SCAYLE (Supercomputación Castilla y León), en la partición Genoa, con 2 nodos y 8 GPUs en total, durante aproximadamente 28 horas y 23 minutos. No se documenta una fase de RLHF o DPO posterior al SFT.

## Capacidades

- Generación de texto y respuesta a instrucciones en castellano dentro del dominio biomédico y clínico.
- Respuesta a preguntas médicas generales y soporte a búsqueda de información sanitaria.
- Resumen de literatura médica y documentación clínica.
- Asistencia en la comprensión de guías clínicas e información farmacéutica.
- Conversación multi-turno dentro de la ventana de 8.192 tokens.
- Capacidad multilingüe heredada de Salamandra-7B, aunque el ajuste está orientado al castellano.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Resumen de informes clínicos: el modelo puede condensar historiales y notas clínicas en castellano aprovechando su contexto de 8.192 tokens, adecuado para documentos de extensión moderada.
- Apoyo a la consulta de guías terapéuticas: dado su ajuste sobre instrucciones biomédicas, responde preguntas sobre protocolos y recomendaciones, siempre con verificación humana contra fuentes oficiales.
- Búsqueda semántica asistida en literatura médica: se puede usar para reformular consultas y generar respuestas preliminares que un profesional valide después.
- Formación y divulgación sanitaria: genera explicaciones en castellano de conceptos biomédicos para materiales educativos, con revisión editorial posterior.
- Extracción y estructuración de información farmacéutica: resume prospectos y fichas técnicas en lenguaje llano para sistemas internos de consulta.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos clínicos a terceros.
- Prototipado de asistentes conversacionales sanitarios: sirve como base para pruebas de concepto de chatbots de orientación no diagnóstica, con las advertencias de la model card sobre uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 15,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantizaciones GGUF de 8 bits: aproximadamente 8-9 GB; en 4 bits, en torno a 4,5-5 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en bfloat16; RTX 4090 (24 GB) para bfloat16 ajustado o cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 con cuantización de 8 o 4 bits; en GPUs de 8-12 GB solo con cuantizaciones de 4 bits agresivas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF, vLLM y Text Generation Inference para los pesos safetensors (el repositorio incluye la etiqueta endpoints_compatible y text-generation-inference).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ALIA-es-biomedical-7B-Instruct (esta ficha) | 7,77 B | 8.192 | Apache 2.0 | Hugging Face (safetensors y GGUF) | Especializado en biomédico en castellano |
| Salamandra-7B (BSC-LT) | 7 B | no disponible en la información | no disponible en la información | Hugging Face | Modelo base multilingüe del que deriva la familia |
| ALIA-es-biomedical-7B-Base (SINAI) | 7,77 B | 8.192 | no disponible en la información | Hugging Face | Versión base sin ajuste por instrucciones |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con estas alternativas.

## Limitaciones y advertencias

- El autor advierte de que el modelo puede generar contenido dañino, inapropiado o médicamente inexacto; no sustituye el consejo, diagnóstico o tratamiento profesional.
- Riesgo de alucinación relevante en un dominio sanitario: toda información médica generada debe verificarse contra fuentes oficiales.
- El repositorio original presentaba un fichero safetensors truncado en 8.320 bytes; el autor rellenó esos bytes desde la cabecera para permitir la exportación, lo que introduce una incertidumbre sobre la integridad exacta de los pesos.
- El ajuste está orientado exclusivamente al castellano; el rendimiento en otros idiomas no está garantizado pese a la base multilingüe.
- Ventana de contexto limitada a 8.192 tokens, insuficiente para documentos clínicos muy extensos sin fragmentación.
- No se documentan evaluaciones de sesgo ni de seguridad clínica.
- Licencia Apache 2.0 permite uso comercial, pero la model card restringe el uso previsto a investigación y educación y exime de responsabilidad a SINAI y al BSC.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Hugging Face (esta republicación GGUF): https://huggingface.co/Alberto/ALIA-es-biomedical-7B-Instruct-gguf
- Modelo base: https://huggingface.co/SINAI/ALIA-es-biomedical-7B-Base
- Modelo original Instruct (referenciado en la model card): https://huggingface.co/SINAI/ALIA-es-biomedical-7B-Instruct
- Dataset de instrucciones: https://huggingface.co/datasets/SINAI/ALIA-es-biomedical-synthetic-instructions
- Salamandra-7B (BSC-LT): https://huggingface.co/BSC-LT/salamandra-7b
- Paper referenciado (arXiv 2502.08489): https://arxiv.org/abs/2502.08489
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Infraestructura CALENDULA (SCAYLE): https://www.scayle.es/

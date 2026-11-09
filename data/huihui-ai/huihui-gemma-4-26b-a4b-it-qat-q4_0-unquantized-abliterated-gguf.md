# huihui-ai/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF

## Resumen

Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF es una variante "abliterated" (sin rechazos) del modelo google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, publicada por el usuario huihui-ai en Hugging Face. Se distribuye en formato GGUF y esta pensada para su uso con llama.cpp y Ollama. El pipeline declarado es "any-to-any", lo que indica capacidades multimodales de entrada y salida, aunque la informacion disponible no detalla que modalidades concretas cubre.

El modelo base es un Gemma 4 de Google con 25.233.142.046 parametros totales (segun los safetensors reportados) y una nomenclatura "A4B" que sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, aunque este dato no se confirma de forma explicita en la informacion proporcionada. El sufijo "qat-q4_0-unquantized" indica que el modelo base se entreno con cuantizacion consciente (QAT) a 4 bits y posteriormente se des-cuantizo a pesos de mayor precision.

La relevancia de esta ficha radica en dos factores: por un lado, la eliminacion de los mecanismos de rechazo mediante abliteration, una tecnica que proyecta fuera del espacio de activaciones la direccion asociada a las negativas del modelo; por otro, la disponibilidad en GGUF con soporte de decodificacion especulativa mediante un modelo draft MTP, lo que permite desplegarlo en hardware de consumo con contexto muy largo (hasta 262.144 tokens segun el ejemplo de la model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE segun nomenclatura "A4B"; no confirmado explicitamente) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B, sin confirmacion oficial) |
| Longitud de contexto | hasta 262.144 tokens (segun ejemplo de llama.cpp con `-c 262144`) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K en el ejemplo; el repo contiene multiples variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (incluye modelo draft MTP en bf16 para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, un modelo de la familia Gemma 4 de Google entrenado con cuantizacion consciente (QAT) a 4 bits y posteriormente des-cuantizado. La nomenclatura "A4B" es consistente con una arquitectura de mezcla de expertos (MoE) de aproximadamente 4.000 millones de parametros activos sobre un total de 25.233 millones, si bien esta interpretacion no se confirma de forma explicita en la informacion disponible. El sufijo "it" indica ajuste por instrucciones.

La modificacion introducida por huihui-ai consiste en una abliteration: una tecnica que identifica la direccion en el espacio de activaciones responsable de los rechazos y la proyecta fuera, eliminando la capacidad del modelo de negarse a responder. Segun la model card, se trata de una implementacion "cruda, proof-of-concept" basada en el repositorio remove-refusals-with-transformers de Sumandora, que no utiliza TransformerLens. No se proporcionan detalles sobre el dataset de calibracion, el numero de capas intervenidas ni los hiperparametros del proceso de abliteration.

## Capacidades

- Generacion de texto conversacional con ajuste por instrucciones (variante "it").
- Pipeline "any-to-any": sugiere entrada y salida multimodal, aunque las modalidades concretas no se detallan.
- Eliminacion de rechazos: el modelo responde a peticiones que el modelo base rechazaria por politicas de seguridad.
- Decodificacion especulativa mediante modelo draft MTP (multi-token prediction) en bf16, con `--spec-draft-n-max 4` en el ejemplo de llama.cpp.
- Soporte de contexto muy largo: hasta 262.144 tokens segun el ejemplo de invocacion.
- Compatibilidad con Ollama (`huihui_ai/gemma-4-abliterated:26b-qat`) y llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`, `llama-gguf-split`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparandolo con el modelo base para analizar que direcciones de activacion codifican las negativas y como afecta la abliteration a otras capacidades.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, temas controvertidos) en entornos controlados donde el filtrado del modelo base resulta limitado.
- Red teaming y evaluacion de robustez: uso como modelo adversario para probar sistemas de moderacion, clasificadores de toxicidad o pipelines de seguridad antes de desplegarlos en produccion.
- Procesamiento de documentos largos en local: con hasta 262.144 tokens de contexto y formato GGUF, permite analizar expedientes, libros o bases de codigo extensas en hardware de consumo sin depender de APIs externas.
- Despliegue en local con Ollama: gracias al tag `huihui_ai/gemma-4-abliterated:26b-qat`, se puede ejecutar con un solo comando en equipos con GPU consumer, util para prototipado rapido y experimentacion offline.
- Analisis de contenido multimodal: dado el pipeline "any-to-any", podria emplearse para tareas que combinen texto e imagenes (descripcion, extraccion de informacion), aunque la informacion disponible no detalla las modalidades exactas.
- Benchmarking de tecnicas de abliteration: comparar esta implementacion "cruda" (sin TransformerLens) con otras variantes abliterated para medir la degradacion de capacidades y la eficacia en la eliminacion de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 69,4 GB, pero una cuantizacion Q4_K de un modelo de ~25B parametros ronda los 14-16 GB en disco y en VRAM al cargarse completa. Al ser presumiblemente MoE con ~4B activos, la VRAM necesaria para inferencia es menor que la de un denso equivalente, aunque los pesos totales deben residir en memoria.
- GPU recomendadas: no especificadas en la informacion. Por tamano, una RTX 4090 (24 GB) deberia poder cargar una cuantizacion Q4_K; para mayor precision o contexto muy largo se requieren A100 (40/80 GB) o H100.
- Cabe en GPU consumer: si, en modelos con 16-24 GB de VRAM usando cuantizaciones Q4_K o inferiores, segun el ejemplo de la model card.
- Opciones de despliegue: llama.cpp (compilado con `-DGGML_CUDA=ON`), Ollama (tag `huihui_ai/gemma-4-abliterated:26b-qat`), y potencialmente vLLM/TGI si se convierte a safetensors (no documentado).
- Latencia y throughput: no disponibles. El ejemplo incluye decodificacion especulativa con modelo draft MTP bf16 (`--spec-type draft-mtp --spec-draft-n-max 4`), lo que sugiere una optimizacion orientada a mejorar el throughput en generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-26B-A4B-abliterated-GGUF | 25,2B (MoE ~4B activos, no confirmado) | hasta 262.144 | apache-2.0 | GGUF | Sin rechazos, multimodal |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,2B | no disponible | Gemma 4 license | safetensors | Modelo base con filtros de seguridad |
| Otras variantes abliterated de huihui-ai | variable | variable | variable | GGUF/safetensors | Misma tecnica sobre otros modelos base |

La comparacion con alternativas de la misma categoria (abliterated de ~25B en GGUF) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el modelo puede generar contenido sensible, controvertido o inapropiado. El autor recomienda revision manual y monitorizacion en tiempo real.
- No apto para todas las audiencias: los outputs pueden ser inapropiados para entornos publicos, menores o aplicaciones con requisitos de seguridad elevados.
- Responsabilidad legal y etica: el usuario asume toda la responsabilidad sobre el uso y las consecuencias legales o eticas del contenido generado.
- Uso recomendado solo para investigacion y entornos controlados: el autor desaconseja explicitamente su uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por optimizacion de seguridad y huihui.ai declina responsabilidad alguna.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los LLM y potencialmente agravado por la abliteration.
- Licencia: aunque la model card declara apache-2.0, enlaza a la licencia de Gemma 4 de Google, lo que puede imponer restricciones adicionales de uso comercial que deben verificarse.
- Implementacion "cruda, proof-of-concept": la abliteration no usa TransformerLens y no se documentan los detalles tecnicos del proceso, lo que dificulta evaluar su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repositorio de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated:26b-qat
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ko-fi del autor: https://ko-fi.com/huihuiai

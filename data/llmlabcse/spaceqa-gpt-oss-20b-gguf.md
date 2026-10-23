# llmlabcse/SpaceQA-gpt-oss-20b-GGUF

## Resumen

SpaceQA-gpt-oss-20b-GGUF es la versión cuantizada en formato GGUF de SpaceQA-gpt-oss-20b, un ajuste fino del modelo gpt-oss-20b de OpenAI especializado en respuesta a preguntas de ingeniería espacial y aeroespacial. Lo publica el usuario llmlabcse bajo licencia Apache-2.0 y está pensado para su uso con llama.cpp; de hecho, es el archivo que descarga la aplicación de escritorio Space Tools para dar servicio a su función SpaceQA.

El modelo conserva la arquitectura del gpt-oss-20b original (20.914.757.184 parámetros totales, mezcla de expertos con pesos MXFP4) y se distribuye como un único archivo de 12,1 GB, lo que permite ejecutarlo en GPU de consumo con al menos 16 GB de VRAM o en Apple Silicon con 24 GB de memoria unificada. El ajuste fino se centra en un dominio muy concreto: preguntas técnicas sobre espacio, con contexto documental suministrado por el usuario.

Su relevancia práctica está en la mejora medida frente al modelo base en preguntas cuya respuesta no está en el contexto aportado (100 % de respuestas totalmente correctas frente a 89,6 % del base, y cero afirmaciones no soportadas frente a 10) y en una reducción global de afirmaciones no soportadas de 83 a 61 sobre 300 preguntas. Es, por tanto, un ejemplo de especialización vertical de un modelo abierto de talla media para un nicho técnico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos cuantizados en MXFP4, resto de tensores según el GGUF oficial de gpt-oss |
| Parámetros totales | 20.914.757.184 |
| Parámetros activos | no disponible en la información proporcionada |
| Longitud de contexto | no disponible; el ejemplo de despliegue de la model card usa `-c 16384` |
| Tipos de cuantización | MXFP4_MOE (expertos MXFP4; resto de tensores como en el GGUF oficial de gpt-oss), generada con `llama-quantize` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0, sujeta a la política de uso de gpt-oss |
| Formato de pesos | GGUF (un único archivo `spaceqa-gpt-oss-20b-mxfp4.gguf`, 12,1 GB); el modelo base se distribuye en bf16 fusionado |

## Arquitectura y entrenamiento

La model card es explícita sobre el linaje: el GGUF se convierte a partir de los pesos bf16 fusionados de SpaceQA-gpt-oss-20b mediante `convert_hf_to_gguf.py` y se cuantiza con `llama-quantize … MXFP4_MOE` usando llama.cpp b11497. La arquitectura de partida es la de gpt-oss-20b, un transformer con mezcla de expertos en el que los expertos se almacenan en MXFP4, mientras que el resto de tensores sigue el esquema del GGUF oficial publicado por ggml-org. El repositorio incluye un archivo `SHA256SUMS` con los hashes de integridad.

El ajuste fino se realizó sobre el modelo gpt-oss-20b para convertir un asistente generalista en un respondedor de preguntas de ingeniería espacial. La model card advierte de que el modelo fue entrenado con unos developer prompts concretos y que estos importan: hay que usar los indicados en la model card del modelo base para obtener el comportamiento esperado. También expone un control de esfuerzo de razonamiento mediante `"chat_template_kwargs": {"reasoning_effort": "low"}`, lo que confirma que conserva el modo de razonamiento configurable de la familia gpt-oss. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card remite a la ficha del modelo base para esos detalles.

## Capacidades

- Generación de texto y respuesta a preguntas en formato conversacional, con plantilla de chat compatible con el endpoint `/v1/chat/completions` de llama.cpp.
- Respuesta sobre contexto documental: el modelo está específicamente ajustado para responder a partir de un texto suministrado (96,3 % de respuestas totalmente correctas en el subconjunto de preguntas cuya respuesta sí está en el contexto).
- Abstención ante información ausente del contexto: en el subconjunto de preguntas cuya respuesta no figuraba en el documento, alcanza el 100 % de respuestas totalmente correctas y cero afirmaciones no soportadas.
- Razonamiento configurable: admite el parámetro `reasoning_effort` a través de `chat_template_kwargs`.
- Dominio especializado en ingeniería espacial y aeroespacial (preguntas técnicas del sector).
- Multilingüe: no disponible; la model card declara únicamente inglés.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas en la información proporcionada.
- Visión o audio: no disponibles.

## Casos de uso

- Consulta de documentación técnica de misiones: cargando el texto de un informe, un manual de operaciones o una especificación en el contexto, el modelo responde preguntas concretas con 96,3 % de exactitud total medida en el subconjunto con respuesta presente en el documento.
- Verificación de afirmaciones en respuestas de dominio: su comportamiento en preguntas fuera del contexto (cero afirmaciones no soportadas frente a 10 del base en 96 preguntas) lo hace adecuado como respondedor conservador en asistentes documentales donde una respuesta inventada tiene coste alto.
- Asistente integrado en herramienta de escritorio: es el archivo que descarga la aplicación Space Tools, de modo que encaja como motor local de un asistente de sobremesa sin dependencia de la nube.
- Formación y soporte a ingenieros junior: resolución de dudas sobre conceptos aeroespaciales con un documento de referencia delante, a velocidad interactiva (unas 240 tokens/s en una RTX 4090).
- Procesamiento por lotes de preguntas sobre un corpus de ingeniería: con llama-server expuesto como API compatible con OpenAI, se puede integrar en scripts de evaluación o de extracción de información sobre informes técnicos.
- Prototipado y evaluación de pipelines RAG en dominio aeroespacial: al estar en GGUF y ser ejecutable en una sola GPU de 16 GB, sirve como componente de generación barato para probar recuperación, prompts y formato de citas antes de escalar a modelos mayores.
- Despliegue en hardware heterogéneo: la opción `--cpu-moe` permite ejecutar el modelo con una GPU de solo 8 GB más 24 GB de RAM de sistema, útil para entornos de desarrollo sin GPU de gama alta.

## Benchmarks y rendimiento

Evaluación realizada sobre este mismo archivo GGUF con llama.cpp: 300 preguntas reservadas, corregidas de forma independiente por GPT-OSS-120B. La base es el GGUF oficial `ggml-org/gpt-oss-20b-GGUF` (MXFP4) con idénticos ajustes.

| Tipo de pregunta | n | Base: totalmente correctas | SpaceQA: totalmente correctas | Afirmaciones no soportadas (base → SpaceQA) |
|---|---|---|---|---|
| Respuesta presente en el contexto | 109 | 96,3 % | 96,3 % | 3 → 3 |
| Respuesta **no** presente en el contexto | 96 | 89,6 % | **100 %** | 10 → **0** |
| Sin contexto (closed book) | 95 | 30,5 % | 34,7 % | 70 → 58 |
| Todas | 300 | 73,3 % | **78,0 %** | 83 → **61** |

SpaceQA fue mejor en 32 preguntas y peor en 14 (test de signos, p = 0,011). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 12,1 GB, por lo que encaja en GPU NVIDIA con 16 GB o más de VRAM.
- Apple Silicon: requiere 24 GB de memoria unificada o más.
- Configuración híbrida: GPU de 8 GB o más junto con 24 GB de RAM de sistema, usando la opción `--cpu-moe`.
- Solo CPU: posible con 24 GB de RAM o más, pero la model card lo califica de lento.
- GPU recomendadas: NVIDIA RTX 4090 (≈240 tokens/s según la model card); el resto de modelos concretos (A100, H100, etc.) no se detallan en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con el comando de referencia `llama-server -m spaceqa-gpt-oss-20b-mxfp4.gguf --jinja -c 16384 -ngl 999 -fa auto`. Otros motores (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Throughput: aproximadamente 240 tokens/s en RTX 4090 con llama.cpp. Latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Resultado en la eval de 300 preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpaceQA-gpt-oss-20b-GGUF (este) | 20,9 B | no disponible | 78,0 % totalmente correctas; 61 afirmaciones no soportadas | Apache-2.0 (sujeta a política de uso de gpt-oss) | GGUF en HuggingFace |
| ggml-org/gpt-oss-20b-GGUF (base) | 20,9 B | no disponible | 73,3 % totalmente correctas; 83 afirmaciones no soportadas | Apache-2.0 | GGUF en HuggingFace |
| llmlabcse/SpaceQA-gpt-oss-20b (bf16) | 20,9 B | no disponible | no disponible (mismo ajuste, formato distinto) | Apache-2.0 | Pesos bf16 fusionados en HuggingFace |
| GPT-OSS-120B | no disponible en la información proporcionada | no disponible | usado como corrector independiente de la evaluación, no evaluado como candidato | no disponible | no disponible |

## Limitaciones y advertencias

- Alucinación en modo cerrado: sin documento de referencia, solo el 34,7 % de las respuestas fueron totalmente correctas y se detectaron 58 afirmaciones no soportadas sobre 95 preguntas. La propia model card recomienda darle el texto relevante.
- No apto como fuente de verdad sin contexto: incluso mejorando al base, sigue emitiendo detalles incorrectos cuando no dispone de documentación.
- Idioma: únicamente inglés declarado; el rendimiento en castellano no está documentado.
- Dominio restringido: el ajuste está orientado a preguntas de ingeniería espacial; fuera de ese ámbito no hay evidencia de calidad.
- Dependencia de los developer prompts: la model card advierte de que el modelo fue entrenado con prompts concretos y que hay que usar los de la ficha del modelo base; ignorarlos puede degradar el comportamiento.
- Licencia: Apache-2.0, pero sujeta a la política de uso de gpt-oss, que hay que revisar antes de un despliegue comercial.
- Formato único: solo se publica una cuantización MXFP4_MOE; no hay variantes Q4_K_M, Q8_0 ni otras, lo que limita el ajuste fino de VRAM/calidad.
- Sesgos: no se documentan en la información disponible análisis de sesgos.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, un solo archivo de pesos y sin histórico de versiones; conviene validar con `SHA256SUMS` antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmlabcse/SpaceQA-gpt-oss-20b-GGUF
- Modelo base (bf16): https://huggingface.co/llmlabcse/SpaceQA-gpt-oss-20b
- GGUF oficial de referencia para la comparación: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Búsqueda web: no se han encontrado resultados relevantes. Los resultados devueltos por el buscador no guardan relación con el modelo (contenido para adultos) y se descartan.

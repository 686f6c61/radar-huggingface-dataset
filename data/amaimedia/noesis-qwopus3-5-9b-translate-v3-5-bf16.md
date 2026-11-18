# AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16 es un modelo de traducción automática de 8.953.803.264 parámetros (aproximadamente 9B) publicado por AMAImedia, un desarrollador independiente, como parte de su plataforma de doblaje multilingüe NOESIS. Se trata de un ajuste fino sobre Jackrong/Qwopus3.5-9B-v3.5, que a su vez deriva de la familia Qwen3.5 de Alibaba. El modelo está especializado en traducción entre las 201 lenguas y dialectos que Qwen3.5 declara cubrir, con una lista documentada de 119 lenguas heredada de Qwen3.

El modelo se distribuye en BF16 (formato primario) y cuenta con una variante GGUF cuantizada a Q4_K_M de 5,24 GB que cabe en GPUs de 6 GB de VRAM. Es un modelo de razonamiento ("think-model"): por defecto emite una traza de razonamiento antes de la traducción, por lo que para uso determinista en producción recomienda aplicar un prefill de "closed-think" que suprima el razonamiento. Su relevancia actual radica en que ofrece traducción multilingüe de cobertura amplia con licencia Apache 2.0, lo que permite uso comercial sin restricciones, y en que su autor publica comparativas internas con métricas COMET, chrF++ y BLEU frente a otros modelos abiertos.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (tag `qwen3_5_text`); detalles internos no disponibles |
| Parámetros totales | 8.953.803.264 (aproximadamente 9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (primario) y GGUF Q4_K_M (5,24 GB); existen cuantizaciones i1-GGUF de mradermacher |
| Idiomas soportados | 201 lenguas y dialectos declarados por Qwen3.5; lista documentada de 119 lenguas de Qwen3 (incluye español, inglés, ruso, kazajo, chino, japonés, vietnamita, árabe, hindi, entre otras) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Jackrong/Qwopus3.5-9B-v3.5, que a su vez parte de Qwen/Qwen3.5-9B. La arquitectura subyacente es un transformer de la familia Qwen3.5, etiquetado en Hugging Face con el tag `qwen3_5_text`, orientado a texto. No se dispone de información pública sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa en la información proporcionada.

Tampoco se detallan los datos de entrenamiento del ajuste fino: no se especifica el volumen de tokens, la composición del corpus paralelo, ni si se emplearon técnicas de RLHF, DPO o aprendizaje supervisado. La model card menciona que el modelo se publica en el marco de la plataforma NOESIS (versión v16.1, publicada el 2026-07-26) bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators), pero no describe el procedimiento de entrenamiento. La innovación operativa destacable es el control del modo de razonamiento mediante prefill: insertar `\n\n` tras `assistant\n` suprime la traza de razonamiento y fuerza la salida directa de traducción, lo que permite un comportamiento determinista en pipelines de producción.

## Capacidades

- Traducción automática multilingüe entre las lenguas cubiertas por la familia Qwen3.5, con lista documentada de 119 lenguas y declaración de cobertura de 201.
- Generación de texto conversacional (tag `conversational` en Hugging Face).
- Modo de razonamiento ("think-model"): genera trazas de razonamiento antes de la respuesta, suprimibles mediante prefill de closed-think.
- Soporte de despliegue compatible con endpoints (tag `endpoints_compatible`).
- Cuantización GGUF disponible para inferencia en hardware de consumo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades multimodales en la información disponible.

## Casos de uso

- Doblaje y subtitulado automatizado: el modelo se publica como componente de la plataforma NOESIS de doblaje multilingüe, por lo que su uso natural es la traducción de guiones y subtítulos entre las lenguas cubiertas, con el modo closed-think para obtener salidas deterministas y alineadas con el texto origen.
- Traducción de documentación técnica y científica: la cobertura de lenguas europeas, asiáticas y africanas permite localizar manuales y papers a decenas de idiomas desde un único modelo con licencia Apache 2.0.
- Localización de productos y software: integrable en pipelines de CI/CD para generar cadenas de interfaz traducidas, con la ventaja de que la licencia permite uso comercial sin restricciones.
- Atención al cliente multilingüe: el modelo puede traducir mensajes entrantes y respuestas en conversaciones multi-turno entre clientes y agentes, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Traducción de contenido editorial y periodístico: útil para medios que publican en varios idiomas y necesitan un traductor abierto desplegable en infraestructura propia.
- Investigación en traducción automática de bajos recursos: la cobertura declarada de lenguas africanas, asiáticas y minoritarias (yoruba, xhosa, zulú, bambara, etc.) lo hace adecuado como línea base en estudios comparativos.
- Despliegue en hardware modesto: la variante GGUF Q4_K_M de 5,24 GB permite ejecutar traducción local en portátiles con GPU de 6 GB, útil para prototipado y entornos sin acceso a la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor (2026-06-17), sobre FLORES devtest con n=20 y cuantización Q4_K_M en modo no-think:

| Dirección | chrF++ | BLEU |
|---|---|---|
| inglés→ruso | 54,9 | 25,9 |
| inglés→chino mandarín | 32,8 | 7,2 |
| Media | 43,8 | 16,5 |

Comparativa interna con las mismas condiciones (FLORES n=20):

| Modelo | Media chrF++ / BLEU | Supervisor-12 |
|---|---|---|
| Este modelo (9B-Translate Q4) | 43,8 / 16,5 | 5/12 (no es supervisor) |
| NOESIS-4B-LongCtx Q8 | 41,7 / 16,5 | 11/12 |
| base 4B Q8 | 42,4 / 15,4 | 5/12 |

El autor declara además una media de COMET de 0,8870, chrF++ de 50,7 y BLEU de 22,5 en su comparativa FLORES-200 publicada, y afirma que el modelo es el mejor traductor puro entre las líneas base abiertas probadas, si bien advierte que se trata de una comparación interna limitada que no establece que sea el mejor modelo de traducción abierto del mundo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 18 GB solo para pesos (9B × 2 bytes), más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- VRAM estimada para GGUF Q4_K_M: 5,24 GB de pesos, cabe en GPUs de 6 GB.
- GPUs recomendadas: para BF16, A100 40 GB, H100, L40S o RTX 4090 (24 GB); para Q4_K_M, RTX 3060 Laptop 6 GB, RTX 4060, RTX 3050 y similares.
- Cabe en GPU de consumo: sí, en la variante GGUF Q4_K_M; en BF16 requiere GPUs de gama alta con 24 GB o más.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors BF16; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. El autor menciona que su hardware local es una RTX 3060 Laptop de 6 GB con 64 GB de DDR5 y un i7-12700H, y que el trabajo de 9B o superior requiere alquiler de H200/Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en traducción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16 | 8,95B | no disponible | chrF++ 43,8 / BLEU 16,5 (FLORES n=20, Q4) | Apache 2.0 | Hugging Face, safetensors y GGUF |
| NOESIS-4B-LongCtx Q8 | no disponible (4B) | no disponible | chrF++ 41,7 / BLEU 16,5 (misma prueba) | no disponible | Hugging Face |
| Base 4B Q8 | no disponible (4B) | no disponible | chrF++ 42,4 / BLEU 15,4 (misma prueba) | no disponible | Hugging Face |
| Jackrong/Qwopus3.5-9B-v3.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de traducción de referencia como NLLB-200, M2M-100 o Tower en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un "think-model": sin el prefill de closed-think emite una traza de razonamiento en lugar de la traducción directa, lo que rompe pipelines que esperan salida determinista.
- Los benchmarks publicados son internos, con n=20 en FLORES devtest, una muestra muy reducida que no permite conclusiones robustas; el propio autor reconoce que no establece supremacía frente a otros modelos abiertos.
- El rendimiento en inglés→chino mandarín es notablemente inferior al de inglés→ruso (chrF++ 32,8 frente a 54,9), lo que sugiere calidad desigual según la dirección y la familia lingüística.
- La lista de 201 lenguas es una declaración de cobertura de Qwen3.5 sin enumeración exhaustiva; la lista documentada de 119 lenguas proviene de Qwen3 y puede no reflejar el soporte real del ajuste fino.
- No se documentan sesgos conocidos, comportamiento en dominios especializados ni tasas de alucinación; en traducción, el riesgo de omisión, adición o mistraducción en lenguas de bajos recursos debe evaluarse con corpus propios.
- La longitud de contexto no está publicada, lo que impide planificar el uso con documentos largos sin pruebas empíricas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5 y Qwopus3.5, cuyas condiciones de licencia y atribución conviene verificar antes de redistribuir.
- El repositorio ocupa 127,5 GB, lo que implica descargas muy pesadas si se clona completo; conviene descargar solo los archivos necesarios.
- La model card incluye llamadas a donaciones y enlaces externos; no deben considerarse parte de la documentación técnica del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16
- Cuantización GGUF de mradermacher: https://huggingface.co/mradermacher/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16-i1-GGUF
- Modelo base intermedio: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Organización: https://AMAImedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl

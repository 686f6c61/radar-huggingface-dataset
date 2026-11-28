# DanVP/MoxhiMT-60

## Resumen

MoxhiMT-60 es un modelo de traducción automática chino-vietnamita desarrollado por DanVP, construido sobre una arquitectura Marian seq2seq. Con aproximadamente 56,4 millones de parámetros, está específicamente ajustado para texto de novela web y ficción xianxia, un nicho con terminología propia (cultivo, sectas, rangos de cultivación) que los modelos de traducción generalistas suelen tratar de forma inconsistente.

El modelo se entrena desde cero con un tokenizador SentencePiece-BPE conjunto chino-vietnamita de 24.000 entradas, lo que evita los problemas de tokenización cruzada entre dos sistemas de escritura muy distintos. Es una release experimental orientada a inferencia local o en servidor, con un build CTranslate2 INT8 incluido para acelerar la inferencia en CPU.

Su relevancia actual radica en la combinación de tamaño reducido (0,3 GB de repositorio), licencia Apache 2.0 permisiva y especialización en un dominio concreto. No compite con modelos de traducción de gran escala en cobertura general, sino que ofrece una alternativa ligera y desplegable en hardware modesto para un caso de uso muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian seq2seq (8 capas de encoder, 2 de decoder) |
| Parametros totales | 56.397.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length sugerido en generación y truncación) |
| Tipos de cuantizacion | INT8 mediante build CTranslate2 incluido en `ct2-int8/`; pesos originales en safetensors |
| Idiomas soportados | chino (zh) y vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y CTranslate2 INT8 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado originalmente para traducción automática. La configuración indicada por el autor es de 8 capas de encoder y 2 de decoder, con dimensión de modelo (d_model) de 576 y dimensión de feed-forward de 2.304. Esta asimetría entre encoder y decoder es habitual en Marian para priorizar la comprensión del texto fuente manteniendo un decoder ligero.

El tokenizador es un SentencePiece-BPE conjunto para chino y vietnamita con vocabulario de 24.000 entradas, entrenado específicamente para este par de idiomas. El autor indica que el modelo se entrenó desde cero, si bien no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto chino a vietnamita en la dirección zh-vi.
- Especialización en terminología xianxia y de novelas de cultivación, priorizada explícitamente por el autor.
- Generación de texto seq2seq estándar mediante `generate` con beam search (se sugiere `num_beams=4`).
- Inferencia en CPU acelerada mediante el build CTranslate2 INT8 incluido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Cobertura multilingüe limitada a los dos idiomas del par (chino y vietnamita).

## Casos de uso

- Traducción de novelas web xianxia: el modelo está ajustado para terminología de cultivación y ficción china, por lo que se usaría como motor de traducción por capítulos, con revisión humana posterior dada la naturaleza experimental de la release.
- Localización de contenido de ficción para plataformas de lectura: integrable en un pipeline que procese texto chino y genere borradores en vietnamita para editores, reduciendo el coste inicial de traducción manual.
- Inferencia en servidor con CPU: gracias al build CTranslate2 INT8, puede desplegarse en servidores sin GPU para volúmenes moderados de traducción por lotes.
- Traducción en dispositivos de recursos limitados: con 56 millones de parámetros y 0,3 GB de repositorio, cabe en entornos con poca memoria y puede ejecutarse en local.
- Prototipado y experimentación en traducción automática: útil como base ligera para investigadores que quieran estudiar traducción zh-vi o ajustar el modelo a otros dominios.
- Preprocesamiento de corpus bilingües: puede emplearse para generar traducciones preliminares en la construcción de datasets zh-vi que luego se filtren o corrijan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos originales (56 millones de parámetros); el build INT8 reduce aún más el uso de memoria y está pensado para CPU.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja pueden ejecutar el modelo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de memoria; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), CTranslate2 (build INT8 incluido). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| MoxhiMT-60 (DanVP) | 56,4 M | 512 tokens | zh, vi | Apache 2.0 | Xianxia / novela web zh-vi |
| MarianMT (Helsinki-NLP) | variable por par (decenas de millones) | variable | múltiples pares | varía por modelo (a menudo CC-BY-4.0) | Traducción generalista |
| NLLB-200 (Meta) | 600 M a 54 B | variable | 200 idiomas | CC-BY-NC-4.0 | Traducción multilingüe general |
| Opus-MT (Helsinki-NLP) | variable | variable | múltiples pares | varía por modelo | Traducción generalista |

La comparación con MarianMT y Opus-MT es la más directa por arquitectura y escala; MoxhiMT-60 se diferencia por su especialización en un dominio concreto y por una licencia Apache 2.0 que facilita el uso comercial. NLLB-200 ofrece mucha mayor cobertura lingüística, pero su licencia no comercial y su mayor tamaño lo sitúan en otro régimen de uso. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor recomienda revisar la salida para usos de alta exigencia o publicación.
- Riesgo de alucinación y de traducciones inexactas en textos fuera del dominio xianxia o de ficción.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos sin segmentación previa.
- Cobertura limitada a chino y vietnamita; no traduce otros idiomas.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento, no especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige incluir una copia de LICENSE y mostrar el texto de NOTICE en los avisos de terceros del producto si se redistribuyen los pesos o el build `ct2-int8/`.
- Sin datos publicados sobre benchmarks, por lo que la calidad real debe validarse con evaluaciones propias antes de producción.
- No se documentan garantías de mantenimiento ni versiones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanVP/MoxhiMT-60
- Licencia Apache 2.0: https://huggingface.co/DanVP/MoxhiMT-60/blob/main/LICENSE
- Aviso NOTICE: https://huggingface.co/DanVP/MoxhiMT-60/blob/main/NOTICE
- Build CTranslate2 INT8: https://huggingface.co/DanVP/MoxhiMT-60/tree/main/ct2-int8

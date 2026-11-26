# marcinm1234/Llama-PLLuM-70B-chat-2512-Q8_0-GGUF

## Resumen

Llama-PLLuM-70B-chat-2512-Q8_0-GGUF es una cuantización en formato GGUF del modelo CYFRAGOVPL/Llama-PLLuM-70B-chat-2512, desarrollado por el consorcio PLLuM y HIVE AI (CYFRAGOVPL). Se trata de un modelo de lenguaje de 70.553.755.712 parámetros (70,55 B) construido sobre Llama-3.1-70B mediante preentrenamiento continuado en polaco e inglés, seguido de ajuste por instrucciones y alineamiento por preferencias humanas. La variante `chat` está orientada a diálogo y uso general, no a tareas de instrucción pura.

El modelo base emplea una arquitectura `LlamaForCausalLM` con 80 capas, dimensión oculta de 8192, 64 cabezas de atención y 8 cabezas KV (GQA), con una longitud de contexto de 131.072 tokens y rope theta de 500.000. El vocabulario es de 128.259 tokens. Su propósito principal es ofrecer un modelo de gran tamaño con competencia nativa en polaco, un idioma con menor representación en los modelos fundacionales, manteniendo un rendimiento sólido en inglés.

Esta ficha corresponde exclusivamente al artefacto de cuantización Q8_0 publicado por marcinm1234, que no ha entrenado ni ajustado el modelo original. La cuantización se generó con `convert_hf_to_gguf.py` de llama.cpp en una sola pasada desde los pesos BF16, con redondeo al más cercano y sin imatrix. El resultado es un único archivo GGUF v3 de 74.975.103.136 bytes (74,98 GB) con 724 tensores: 562 en Q8_0 (todos los pesos bidimensionales, incluidos embeddings y capa de salida) y 162 en F32 (pesos de normalización y tensores unidimensionales). Es relevante para quienes necesitan ejecutar el modelo en llama.cpp o llama-server sin depender de safetensors ni de infraestructura de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 70.553.755.712 (70,55 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (unica disponible en este repo) |
| Idiomas soportados | pl (principal), en (secundario) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF v3, file type 7 (Q8_0), archivo unico |

Detalles adicionales de arquitectura: 80 capas, hidden size 8192, 64 cabezas de atención, 8 cabezas KV, rope theta 500.000, vocabulario de 128.259 tokens. Tokenizer BPE con pre-tokenizador `llama-bpe`, 280.147 merges, BOS 128000, EOS 128001, PAD 128256, `add_bos_token = true`, `add_eos_token = false`. Plantilla de chat Mistral-style `[INST] ... [/INST]` embebida en los metadatos del GGUF.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de tipo Llama-3.1-70B, con atención de consultas agrupadas (GQA) de 64 cabezas de consulta y 8 cabezas KV, 80 capas y dimensión oculta de 8192. El consorcio PLLuM partió de los pesos de Llama-3.1-70B y aplicó preentrenamiento continuado sobre corpus en polaco e inglés, seguido de ajuste por instrucciones y alineamiento por preferencias humanas para producir la variante `chat`. El vocabulario se amplió hasta 128.259 tokens, lo que sugiere una adaptación del tokenizer para cubrir mejor el polaco.

La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF, DPO o decodificación especulativa. La model card del artefacto de cuantización tampoco documenta innovaciones técnicas más allá de la conversión a GGUF. El proceso de cuantización sí está descrito con precisión: conversión directa desde los 30 shards safetensors en BF16 (revisión `8ee09f2c389504c873f784450fd2b587b352846a`), verificación sha256 de cada archivo descargado, una sola pasada con `--outtype q8_0`, redondeo al más cercano y sin imatrix. La plantilla de chat se leyó de `chat_template.jinja` del repositorio fuente y se embebió sin cambios.

## Capacidades

- Generación de texto conversacional en polaco e inglés, con la variante `chat` alineada por preferencias humanas para diálogo multi-turno.
- Comprensión y generación en polaco como idioma principal, con inglés como secundario.
- Ventana de contexto de 131.072 tokens, adecuada para documentos largos y conversaciones extensas.
- Plantilla de chat Mistral-style `[INST] ... [/INST]` con soporte de mensaje de sistema plegado en el primer bloque `[INST]`.
- Compatibilidad con la API OpenAI de llama-server (`/v1/chat/completions`).
- No es un modelo de razonamiento: la model card indica explícitamente que no debe tratarse como tal.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- No se documentan capacidades multilingües más allá de polaco e inglés.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 131.072 tokens de ventana, manteniendo coherencia en diálogos extensos y con historial acumulado. La variante `chat` está alineada para este tipo de interacción.
- Procesamiento de documentos largos en polaco: resumen, extracción de información y respuesta a preguntas sobre contratos, informes o expedientes que superen decenas de miles de tokens, aprovechando la ventana completa. Para tareas de extracción o corrección se recomienda temperatura entre 0,0 y 0,2.
- Asistencia administrativa y legal en polaco: redacción y revisión de borradores, explicación de terminología y adaptación de registros formales, con un modelo entrenado específicamente sobre corpus polaco.
- Despliegue local en llama.cpp: integración en entornos sin infraestructura de transformers mediante `llama-server` con API compatible con OpenAI, útil para prototipos y servicios internos que requieran control total sobre los datos.
- Traducción y adaptación polaco-inglés: el modelo cubre ambos idiomas de forma nativa, lo que permite tareas de traducción y localización sin depender de un modelo multilingüe genérico.
- Generación de contenido educativo en polaco: explicación de conceptos, elaboración de materiales didácticos y respuesta a preguntas técnicas, con la posibilidad de fijar temperatura baja para respuestas más deterministas.
- Evaluación comparativa de cuantizaciones: al ser un Q8_0 de alta fidelidad, sirve como referencia para medir la degradación de cuantizaciones más agresivas (Q4, Q5) del mismo modelo base en pipelines de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni para el modelo base ni para la versión Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 74,98 GB, por lo que se necesita al menos esa cantidad de memoria, más overhead de contexto KV. Con contexto de 16.384 tokens y GQA de 8 cabezas KV, el overhead es moderado pero no despreciable.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 × RTX 4090 de 24 GB o 2 × A6000 de 48 GB) para repartir el modelo.
- No cabe en una GPU de consumo individual: 74,98 GB supera la VRAM de cualquier tarjeta consumer actual (RTX 4090 = 24 GB, RTX 3090 = 24 GB). Requiere offloading a RAM del sistema o partición entre varias GPU.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo del GGUF), con `-ngl 99` para descargar todas las capas en GPU si la VRAM lo permite. La API es compatible con OpenAI. No se documenta soporte en esta información para vLLM, TGI u Ollama, aunque el formato GGUF es compatible con Ollama en principio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para reducir requisitos de hardware, sería necesario recurrir a cuantizaciones más agresivas (Q4_K_M, Q5_K_M), que no están publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-PLLuM-70B-chat-2512-Q8_0 (este) | 70,55 B | 131.072 | pl, en | Llama 3.1 Community | GGUF Q8_0 |
| Llama-3.1-70B-Instruct (Meta) | 70,6 B | 131.072 | multilingue | Llama 3.1 Community | safetensors, GGUF (terceros) |
| CYFRAGOVPL/Llama-PLLuM-70B-instruct-2512 | 70,55 B | 131.072 | pl, en | Llama 3.1 Community | safetensors |
| marcinm1234/Llama-PLLuM-70B-instruct-2512-Q8_0-GGUF | 70,55 B | 131.072 | pl, en | Llama 3.1 Community | GGUF Q8_0 |

La diferencia principal frente a Llama-3.1-70B-Instruct es el preentrenamiento continuado en polaco y el ajuste específico del consorcio PLLuM, que debería mejorar el rendimiento en ese idioma a costa de posibles regresiones en otros. Frente a la variante `instruct` del mismo modelo, esta versión `chat` está alineada por preferencias humanas para diálogo. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Llama-3.1-70B y los del corpus de preentrenamiento continuado en polaco.
- Riesgo de alucinación: presente como en cualquier modelo generativo de esta escala; no se documentan mitigaciones específicas.
- Limitaciones de idioma: cobertura nativa limitada a polaco e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea inferior al de modelos multilingües dedicados.
- No es un modelo de razonamiento: la model card lo indica explícitamente. No debe esperarse un modo thinking ni cadenas de razonamiento extendidas.
- Plantilla de chat: usa `[INST] ... [/INST]` estilo Mistral, no el formato de cabeceras de Llama 3. Forzar `--chat-template llama3` en llama.cpp produce resultados incorrectos. Los roles deben alternarse usuario/asistente.
- Licencia: Llama 3.1 Community License, que impone restricciones de uso comercial (incluida la cláusula de 700 millones de usuarios mensuales) y obligaciones de atribución. Además, deben respetarse los términos de los autores originales (PLLuM / CYFRAGOVPL).
- Restricciones de producción: el tamaño de 74,98 GB limita el despliegue a infraestructura con suficiente VRAM o a configuraciones con offloading, lo que afecta a la latencia.
- Este repositorio solo contiene la cuantización; no se ha validado de forma independiente la fidelidad de la conversión más allá de la verificación sha256 documentada por el autor.
- Temperatura recomendada: 0,6 con top_p 0,9 como valores por defecto embebidos en el GGUF; para extracción o corrección, bajar a 0,0–0,2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/marcinm1234/Llama-PLLuM-70B-chat-2512-Q8_0-GGUF
- Modelo base: https://huggingface.co/CYFRAGOVPL/Llama-PLLuM-70B-chat-2512
- Variante instruct en el mismo formato: https://huggingface.co/marcinm1234/Llama-PLLuM-70B-instruct-2512-Q8_0-GGUF
- Licencia Llama 3.1 Community: https://huggingface.co/meta-llama/Llama-3.1-70B/blob/main/LICENSE
- llama.cpp (conversión e inferencia): https://github.com/ggml-org/llama.cpp
- DOI del repositorio: https://doi.org/10.57967/hf/11883

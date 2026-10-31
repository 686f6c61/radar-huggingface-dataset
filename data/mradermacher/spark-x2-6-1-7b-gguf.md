# mradermacher/Spark-X2.6-1.7B-GGUF

## Resumen

Spark-X2.6-1.7B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo XHToken/Spark-X2.6-1.7B, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM conversacional de aproximadamente 1.707 millones de parámetros (1.707.657.216 según los metadatos de safetensors), con soporte para inglés y chino, y publicado bajo licencia Apache 2.0. Esta ficha describe el repositorio de cuantizaciones; el modelo original corresponde a XHToken/Spark-X2.6-1.7B.

La relevancia de este repositorio radica en que permite ejecutar un modelo pequeño en hardware muy modesto: las versiones cuantizadas oscilan entre 0,9 GB (Q2_K) y 3,5 GB (f16), lo que lo hace viable incluso en portátiles sin GPU dedicada mediante llama.cpp u Ollama. El tag `sparkx2_5` sugiere que pertenece a la familia Spark-X, aunque la model card del autor original no está disponible en la información proporcionada, por lo que no se pueden detallar datos de entrenamiento, arquitectura exacta ni benchmarks.

Al no existir documentación técnica publicada del modelo base en los datos disponibles, esta ficha se centra en lo verificable: las especificaciones de las cuantizaciones, los requisitos de hardware derivados de sus tamaños y las opciones de despliegue compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de familia: sparkx2_5) |
| Parametros totales | 1.707.657.216 (~1,71 B) |
| Parametros activos | no aplicable (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors/transformers) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-1.7B. El tag `sparkx2_5` presente en la model card indica que pertenece a la familia Spark-X, pero no se ha publicado informacion sobre numero de capas, tipo de atencion, mecanismos como GQA/MLA ni innovaciones tecnicas concretas. Tampoco hay datos sobre el corpus de entrenamiento, numero de tokens procesados ni etapas de post-entrenamiento (SFT, RLHF o DPO). El tag `conversational` y la configuracion de la model card sugieren un modelo orientado a dialogo.

Respecto al repositorio de cuantizaciones en si: mradermacher genera cuantizaciones estaticas en GGUF a partir de los pesos originales en safetensors, con conversion tipo "hf". Adicionalmente existen cuantizaciones imatrix (weighted) en un repositorio separado, que suelen ofrecer mejor calidad a igual tamaño que las estaticas.

## Capacidades

- Generacion de texto conversacional en ingles y chino (tag `conversational`).
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes locales.
- Disponibilidad de doce niveles de cuantizacion, desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ajustar la relacion calidad/tamaño segun el hardware.
- No hay informacion disponible sobre tool calling, function calling, capacidades agenticas, razonamiento estructurado (thinking mode), vision ni audio.

## Casos de uso

- Chatbots locales en dispositivos de bajos recursos: con la variante Q4_K_M (1,2 GB) el modelo cabe en la RAM de cualquier portatil moderno sin GPU, adecuado para asistentes de dialogo offline en ingles y chino.
- Prototipado rapido de aplicaciones LLM: su tamaño de 1,7 B permite iteraciones de desarrollo muy rapidas en CPU, util para probar prompts y pipelines antes de escalar a modelos mayores.
- Inferencia en el borde (edge): las cuantizaciones Q2_K/Q3_K (0,9-1,1 GB) son adecuadas para dispositivos embebidos, Raspberry Pi de gama alta o mini-PCs con RAM limitada.
- Asistente bilingue chino-ingles: al soportar ambos idiomas, sirve para aplicaciones que necesiten alternar entre ambos sin cambiar de modelo.
- Servidores de inferencia de alto throughput: en lotes grandes de peticiones, un modelo de 1,7 B en GPU (incluso una RTX 3060) puede servir miles de tokens por segundo, util para backends de generacion de texto masiva.
- Evaluacion comparativa de cuantizaciones: al disponer de la gama completa de tipos K-quant e IQ-quant, el repositorio es util para estudiar el impacto de la cuantizacion en calidad de salida en modelos de 1-2 B.
- Generacion aumentada por recuperacion (RAG) ligera: como modelo de reescritura, resumen o sintesis de contextos recuperados, donde no se requiere la capacidad de un modelo de 7 B o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco existen datos comparativos con modelos similares (MMLU, HumanEval, GSM8K u otros) para el modelo base XHToken/Spark-X2.6-1.7B.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB (a estos valores hay que anadir el KV cache, que depende de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; con 4 GB de VRAM (por ejemplo GTX 1650, RTX 3050) cabe incluso la version f16. No se requiere A100 ni H100.
- Consumer GPUs: cabe con holgura en practicamente todas las GPUs de consumo, incluso las de gama de entrada. Tambien funciona en CPU pura: con 8 GB de RAM se ejecuta la variante Q8_0 sin problemas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles; por su tamaño de 1,7 B, se espera inferencia muy rapida en CPU moderna (del orden de decenas de tokens por segundo) y muy alta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.6-1.7B (este) | 1,71 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (128K con YaRN) | Apache 2.0 (algunas variantes Qwen) | safetensors, GGUF comunitario |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 tokens | Licencia Llama 3.2 | safetensors, GGUF comunitario |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Licencia Gemma | safetensors, GGUF comunitario |

Spark-X2.6-1.7B se situa en la misma franja de tamaño que Qwen2.5-1.5B y Llama 3.2 1B, con la ventaja de una licencia Apache 2.0 sin restricciones y soporte bilingue chino-ingles, similar a Qwen. Su principal desventaja frente a estas alternativas es la ausencia de documentacion tecnica y de benchmarks publicados, lo que dificulta evaluar su calidad relativa.

## Limitaciones y advertencias

- Falta de documentacion: no hay model card tecnica del modelo base con datos de entrenamiento, arquitectura ni benchmarks, lo que introduce incertidumbre sobre su procedencia y calidad.
- Riesgo de alucinacion: como cualquier LLM de 1-2 B, la tasa de alucinaciones es alta; no es fiable para tareas que exijan factualidad sin verificacion externa.
- Limitacion de idiomas: solo ingles y chino; el rendimiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea pobre.
- Contexto: la longitud de ventana de contexto no esta publicada; debe verificarse empiricamente antes de disenar aplicaciones con documentos largos.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_M degradan notablemente la calidad (el propio autor senala "lower quality" en Q3_K_M); se recomiendan Q4_K_M o superiores para uso general.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar que el modelo base XHToken/Spark-X2.6-1.7B no herede condiciones adicionales de sus datos de entrenamiento.
- Procedencia: al tratarse de un modelo de un editor poco documentado (XHToken), se recomienda auditoria propia antes de uso en produccion.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Spark-X2.6-1.7B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Spark-X2.6-1.7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa de mradermacher: https://www.nethype.de/

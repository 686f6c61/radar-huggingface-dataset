# AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF es una compilacion de pesos GGUF del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B a la que se le ha practicado una ablacion de la direccion de rechazo (abliteration) antes de cuantizar. Lo publica AtomicChat, el mismo equipo que ya distribuye los quants sin modificar del modelo original. El objetivo es doble: eliminar las respuestas de negativa del modelo base y ofrecer el resultado en formatos listos para llama.cpp, tanto en tres builds ya horneados como en un adaptador LoRA de 106 MB que se puede aplicar sobre cualquier GGUF del modelo original.

El modelo subyacente es un transformer multimodal con mezcla de expertos (MoE) de 40 bloques y 256 expertos enrutados por bloque, con atencion completa combinada con linear attention, mas un proyector visual (mmproj) para entrada de imagen. La nomenclatura 35B-A3B indica 35.000 millones de parametros totales y 3.000 millones activos por token, lo que se traduce en un coste de inferencia propio de un modelo mucho mas pequeno. La ventana de contexto no se documenta en la informacion disponible; el ejemplo oficial de despliegue arranca llama-server con `-c 32768`.

Su relevancia es practica: demuestra que se puede eliminar la mayor parte del comportamiento de rechazo con un cambio de rango 1 en los pesos (KLD media de 0,0090 frente al original en BF16) y sin perdida medible en MMLU (84,25% frente a 84,50%, McNemar p = 0,52). Las mediciones del autor son publicas y comparan sistematicamente la ablacion y la cuantizacion contra el modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (40 bloques, 256 expertos enrutados por bloque, experto compartido) y atencion hibrida (full attention + linear attention); proyector visual mmproj |
| Parametros totales | La nomenclatura del modelo indica 35B totales / A3B activos. Los metadatos de safetensors del repo consignan 26.562.560 (dato discrepante con la nomenclatura) |
| Parametros activos | Aproximadamente 3.000 millones por token (segun el sufijo A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo oficial de llama-server usa 32.768 tokens |
| Tipos de cuantizacion | AD-Q4_K-IQ4_XS (20,1 GB), AD-Q5_K-Q4_K (22,1 GB), AD-Q6_K (29,1 GB); atencion, experto compartido, embeddings y cabeza de salida en q8_0; mmproj en F16; LoRA en GGUF (rank 1) |
| Idiomas soportados | No disponible como lista oficial. Las evaluaciones de la model card usan ingles y ruso |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dividido en shards; el build AD-Q4_K-IQ4_XS son 11 shards), mas adaptador LoRA en GGUF y mmproj en F16 |
| Tamano del repositorio | 73,7 GB |
| Descargas / likes | 357 / 22 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

No hay reentrenamiento: el modelo parte de openbmb/MiniCPM-V-4.7-35B-A3B y se modifica con una edicion de rango 1 sobre los pesos. La direccion de rechazo se calcula como la diferencia de medias del residual stream en el ultimo token del prompt (plantilla de chat aplicada, thinking desactivado) sobre 416 prompts daninos frente a 416 prompts inofensivos en ingles, tomada a la entrada del bloque 28 de 40, y con la componente de la media de los prompts inofensivos eliminada. La edicion aplicada es `W' = W - r rᵀW` sobre las matrices que escriben en el residual: 40 salidas de atencion y linear attention, las down projections de los 256 expertos de los 40 bloques MoE y las del experto compartido.

El resultado en BF16 tiene una KLD media de 0,0090 (neutral) y 0,0095 (codigo) frente al modelo original, es decir, la ablacion por si sola ya introduce una desviacion pequena pero medible. Encima de eso se aplica la cuantizacion: el build AD-Q6_K queda en KLD 0,0109 y 96,15% de coincidencia en top-1, el AD-Q5_K-Q4_K en 0,0191 / 94,84% y el AD-Q4_K-IQ4_XS en 0,0232 / 94,47%, siempre comparando contra el BF16 original. Los quants sin modificar del mismo autor sirven de referencia: en el mismo layout Q4_K-IQ4_XS, el modelo intacto da 0,0197 / 94,94% y en Q6_K 0,0061 / 97,18%. El adaptador LoRA tiene rango 1, ocupa 106 MB y toca 120 sitios; se aplica con `--lora-scaled` a escala 1.0.

## Capacidades

- Generacion de texto y razonamiento en formato conversacional multimodal (pipeline `image-text-to-text`).
- Entrada de imagen mediante proyector visual (`mmproj-MiniCPM-V-4.7-35B-A3B-Uncensored-F16.gguf`).
- Modo thinking: con `--jinja`, la plantilla de chat propia del modelo arranca cada respuesta en modo pensamiento; se desactiva por peticion con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling: la model card reporta 20 de 20 llamadas validas tanto en el original como en el abliterado.
- Recuperacion en contexto largo: 3 de 3 aciertos en la prueba de aguja en tres profundidades.
- Capacidad multilingue: evaluado explicitamente en ingles y en ruso (Aya red-teaming), sin lista oficial de idiomas.
- Ausencia de rechazos: 0% de rechazos en JBB, Aya RU y XSTest, y 0 de 30 trazas de pensamiento sin cerrar a 3072 tokens.
- Integracion con llama.cpp mediante `llama-server`, con soporte de plantilla Jinja y de adaptadores LoRA aplicados en caliente.

## Casos de uso

- Asistentes locales sin filtros sobre hardware de consumo: con el build AD-Q4_K-IQ4_XS (20,1 GB) cabe en una GPU de 24 GB dejando margen para contexto, lo que permite desplegar un MoE de 35B en una unica RTX 3090 o RTX 4090.
- Analisis de contenido sensible en investigacion: evaluacion de sesgos, red-teaming y estudios de seguridad necesitan modelos que no rechacen prompts daninos; el modo uncensored evita que el rechazo contamine las mediciones.
- Procesamiento de documentos con imagen y texto: informes escaneados, capturas o diagramas enviados junto a preguntas largas, apoyandose en el proyector visual y en la ventana de contexto configurable.
- Pipelines de automatizacion con tool calling: las 20/20 llamadas validas permiten usarlo como motor de agentes que invocan funciones externas (APIs, bases de datos, shell) en flujos multi-paso.
- Generacion y revision de codigo en local: el autor mide KLD 0,0095 en el dominio de codigo, lo que indica que la ablacion preserva el comportamiento en ese dominio; util para entornos air-gapped donde no se puede llamar a una API.
- Atencion al cliente o moderacion en dominios restringidos:对于一个 asistente interno que debe discutir temas medicos, legales o de seguridad sin negarse a responder, el modelo mantiene el formato conversacional y el multilingue EN/RU.
- Despliegue con ahorro de disco y ancho de banda: en lugar de descargar 73,7 GB de repositorio, el adaptador LoRA de 106 MB se aplica sobre quants del modelo original ya presentes en el servidor.
- Fine-tuning o experimentacion sobre pesos abliterados: partir de una version sin direccion de rechazo reduce el trabajo de curacion de datasets cuando el objetivo es un modelo especializado en contenido sin restricciones.

## Benchmarks y rendimiento

Comparativa original frente a abliterado, ambos en BF16, sobre prompts no usados para seleccionar la direccion:

| Prueba | Original | Abliterado |
|---|---|---|
| JBB harmful behaviours (EN, 81 prompts), rechazos | 96,3% | 0% |
| Aya red-teaming (RU, 100 prompts), rechazos | 70,0% | 0% |
| XSTest prompts seguros (250), rechazos | 7,6% | 0% |
| Thinking activado (30 prompts), rechazos | 43% | 0% |
| Thinking activado, trazas sin cerrar a 3072 tokens | 16 de 30 | 0 de 30 |
| MMLU (2000 preguntas) | 84,25% | 84,50% (+0,25; McNemar p = 0,52) |
| Tool calls (20) | 20/20 validas | 20/20 validas |
| Aguja en contexto largo (3 profundidades) | 3/3 | 3/3 |
| KLD media al original (neutral / codigo) | - | 0,0090 / 0,0095 |

Calidad de las cuantizaciones, medida contra el modelo BF16 original:

| Build | Tamano en disco | KLD media | Coincidencia top-1 | Rechazos EN / RU / XSTest |
|---|---|---|---|---|
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,0232 | 94,47% | 0% / 0% / 0% |
| AD-Q5_K-Q4_K | 22,1 GB | 0,0191 | 94,84% | 0% / 0% / 0% |
| AD-Q6_K | 29,1 GB | 0,0109 | 96,15% | 0% / 0% / 0% |

Mismos layouts aplicados al modelo sin modificar, como referencia:

| Layout | Tamano en disco | Sin modificar (KLD / top-1) | Este repo (KLD / top-1) |
|---|---|---|---|
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,0197 / 94,94% | 0,0232 / 94,47% |
| AD-Q5_K-Q4_K | 22,1 GB | 0,0150 / 95,47% | 0,0191 / 94,84% |
| AD-Q6_K | 29,1 GB | 0,0061 / 97,18% | 0,0109 / 96,15% |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (HumanEval, GSM8K, MMBench, MMMU) para esta variante.

## Requisitos de hardware

- VRAM minima por build: AD-Q4_K-IQ4_XS 20,1 GB de pesos, AD-Q5_K-Q4_K 22,1 GB y AD-Q6_K 29,1 GB, a los que hay que sumar la cache KV, el mmproj en F16 y el overhead del runtime.
- El autor indica explicitamente que el build AD-Q4_K-IQ4_XS esta pensado para una tarjeta de 24 GB con margen para contexto largo, y que se use AD-Q6_K si cabe.
- GPUs de consumo: el Q4 entra en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB). El Q5 queda muy justo en 24 GB. El Q6 requiere 32 GB o reparto entre dos tarjetas.
- GPUs de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S admiten cualquiera de los tres builds; para el Q6 con contexto amplio conviene 48 GB o mas.
- Repositorio completo: 73,7 GB de descarga si se quieren los tres builds y el adaptador. El adaptador LoRA solo ocupa 106 MB.
- Despliegue: llama.cpp / llama-server en version igual o posterior a `69f201a` (soporte de MiniCPM-V 4.7, PR ggml-org/llama.cpp#29416). Requiere `--jinja` para la plantilla de chat, `-ngl 99` para descargar todas las capas en GPU y `--mmproj` para la entrada de imagen. No se documentan instrucciones para vLLM, TGI, Ollama u otros runtimes.
- Throughput y latencia: no disponibles. Al ser un MoE con unos 3.000 millones de parametros activos, el coste por token es notablemente inferior al de un denso de 35B, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (EN) | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este repo (AD-Q4_K-IQ4_XS) | 35B totales / ~3B activos | No disponible (ejemplo a 32.768) | 0% | 84,50% (BF16 abliterado) | apache-2.0 | GGUF + LoRA GGUF |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35B totales / ~3B activos | No disponible | 96,3% | 84,25% | apache-2.0 | safetensors |
| AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF (quants sin modificar) | 35B totales / ~3B activos | No disponible | 96,3% | 84,25% | apache-2.0 | GGUF |
| Otras variantes abliteradas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el modelo base y contra los quants sin modificar del mismo autor: la diferencia esta enteramente en el comportamiento de rechazo y en una KLD anadida de 0,0035 puntos en el layout Q4_K-IQ4_XS (0,0232 frente a 0,0197) y de 0,0048 en Q6_K (0,0109 frente a 0,0061).

## Limitaciones y advertencias

- Modelo deliberadamente sin filtros: elimina los rechazos en los conjuntos de prueba del autor y no incorpora ninguna capa de seguridad propia. En produccion es responsabilidad del integrador anadir moderacion externa.
- Riesgo legal y reputacional: la licencia apache-2.0 permite uso comercial, pero la generacion de contenido danino, ilegal o que vulnere politicas de plataforma recae sobre quien despliega el modelo.
- La ablacion altera los pesos de forma permanente: la KLD de 0,0090 en BF16 implica una desviacion real respecto al original, no una simple supresion de la primera frase. Puede aparecer degradacion en dominios poco representados en los datos de evaluacion.
- Sesgos: no se publican evaluaciones de sesgo demografico ni de toxicidad mas alla de las metricas de rechazo. Los conjuntos usados (JBB, Aya red-teaming, XSTest) miden negativas, no calidad de contenido.
- Cobertura idiomatica limitada en las evaluaciones: los datos publicos solo cubren ingles y ruso. No hay medicion de la ablacion en castellano ni en otros idiomas.
- Contexto no documentado: la model card no especifica la longitud de contexto oficial ni el comportamiento de la atencion linear mas alla del test de aguja a 3 profundidades.
- Alucinacion: no se publican metricas de fidelidad en tareas de vision (MMMU, MMBench, POPE) ni de veracidad en texto, por lo que el riesgo de invencion no esta cuantificado.
- Discrepancia de metadatos: el campo de parametros del repo (26.562.560) no concuerda con la nomenclatura 35B-A3B, lo que sugiere un error de indexado; conviene verificar el tamano real antes de planificar el despliegue.
- Dependencia de version: requiere llama.cpp en `69f201a` o posterior. Los runtimes no actualizados no cargaran el modelo ni la plantilla Jinja.
- Fechas de publicacion y actualizacion (2026-10-12 y 2026-10-13) y volumen de adopcion bajo (357 descargas, 22 likes): ecosistema de pruebas limitado.
- El adaptador LoRA no corrige los errores propios del quant sobre el que se aplica; el autor advierte que suma la edicion encima del error existente de cada cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Quants sin modificar del mismo autor: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF
- Dataset de metricas de la model card: https://huggingface.co/datasets/AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF-metrics
- Repositorio de Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Sitio del autor: https://atomic.chat/
- Discord: https://discord.gg/8wGSsvmg4V
- Soporte de MiniCPM-V 4.7 en llama.cpp (PR #29416): https://github.com/ggml-org/llama.cpp/pull/29416
- Repositorio relacionado del autor: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF

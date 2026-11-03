# mradermacher/Qwopus3.6-27B-Coder-GGUF

## Resumen

Qwopus3.6-27B-Coder-GGUF es la distribucion en formato GGUF del modelo Qwopus3.6-27B-Coder, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) especializado en generacion de codigo, razonamiento con cadena de pensamiento (chain-of-thought) y uso de herramientas. La cuantizacion la firma mradermacher, un actor habitual en la publicacion de versiones GGUF de modelos open source, mientras que el modelo original lo desarrolla Jackrong. El modelo deriva de la familia Qwen (etiqueta `qwen3_6`), por lo que hereda su arquitectura transformer densa y su tokenizador multilingue.

El modelo resuelve el problema de ejecutar localmente un asistente de codigo y agentes con capacidad de razonamiento explicito sin depender de APIs propietarias. Su interes actual reside en que combina tres tendencias: modelos de codigo afinados con datos de trazas de razonamiento (los datasets `Claude-opus-4.6-TraceInversion-9000x` y `Claude-opus-4.7-TraceInversion-5000x`), soporte nativo de tool calling y function calling, y una licencia Apache 2.0 permisiva. La publicacion de cuantizaciones GGUF desde Q2_K hasta Q8_0 (mas variantes IQ4_XS) permite desplegarlo en hardware de consumo.

La ficha describe la version GGUF, pero los datos de arquitectura, contexto y entrenamiento corresponden al modelo base `Jackrong/Qwopus3.6-27B-Coder`; cuando un dato no esta confirmado en la informacion disponible se indica explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen, etiqueta `qwen3_6`); detalles de capas y atencion no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; versiones imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para el componente multimodal); pesos originales del modelo base presumiblemente en safetensors |
| Tamano del repo | 190,8 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 11,0 GB |
| Cuantizacion recomendada | Q4_K_M, 16,9 GB (rapida, buena calidad) |
| Cuantizacion de maxima calidad | Q8_0, 29,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,3 mil millones de parametros perteneciente a la familia Qwen (tag `qwen3_6`). No es un modelo de mezcla de expertos (MoE), ya que no se declaran parametros activos distintos del total. La model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo de atencion (si usa atencion completa, sliding window o variantes lineales); estos datos no estan disponibles en la informacion proporcionada.

El entrenamiento del modelo base combina tecnicas de SFT (supervised fine-tuning) y LoRA, segun las etiquetas de la model card, sobre tres conjuntos de datos: `Jackrong/Claude-opus-4.6-TraceInversion-9000x` y `Jackrong/Claude-opus-4.7-TraceInversion-5000x` (trazas de razonamiento derivadas de modelos Claude Opus, presumiblemente para destilar cadenas de pensamiento) y `lambda/hermes-agent-reasoning-traces` (trazas de razonamiento orientadas a agentes). No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo una fase de RLHF o DPO. La presencia de los tags `reasoning`, `chain-of-thought`, `agent`, `tool-use` y `function-calling` confirma que el ajuste fino se oriento a esas capacidades. Los ficheros `mmproj` indican que el modelo incorpora un componente multimodal (vision), aunque la model card no detalla su arquitectura ni el codificador visual utilizado.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (el nombre del modelo y el tag `coder` lo indican explicitamente).
- Razonamiento con cadena de pensamiento (chain-of-thought) y modo de razonamiento explicito (tag `reasoning`).
- Uso de herramientas: tool calling y function calling nativos.
- Comportamiento agentico y razonamiento multi-paso (tag `agent`, dataset de trazas de agentes).
- Capacidades multimodales: los ficheros `mmproj` (Q8_0 y f16) sugieren soporte de entrada de imagenes, aunque no se detalla el alcance.
- Multilingue: ingles, chino, espanol, ruso y japones.
- Conversacional multi-turno (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado, explicacion y refactorizacion de codigo sin enviar el codigo a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Agentes autonomos de desarrollo: el soporte de tool calling y function calling permite conectarlo a herramientas (ejecucion de tests, busqueda en repositorios, llamadas a APIs) dentro de bucles de razonamiento multi-paso, aprovechando el entrenamiento sobre trazas de agentes.
- Generacion de codigo en pipelines de CI/CD: integrado via text-generation-inference o llama.cpp, puede generar parches, mensajes de commit o revisiones automatizadas de pull requests, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Razonamiento asistido en depuracion: el modo chain-of-thought permite pedirle que explique paso a paso la causa de un fallo a partir de un stack trace y del codigo relevante, util para tareas de soporte tecnico interno.
- Atencion al cliente tecnica multilingue: al cubrir en, zh, es, ru y ja, puede gestionar conversaciones de soporte en esos cinco idiomas, aunque la longitud de contexto no esta confirmada y conviene validarla antes de desplegarlo con historiales largos.
- Procesamiento de documentacion tecnica con imagenes: gracias a los ficheros mmproj, puede extraer informacion de diagramas de arquitectura o capturas de errores y combinarla con explicaciones textuales, por ejemplo para generar guias a partir de manuales escaneados.
- Entornos de investigacion con hardware limitado: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecutar el modelo en GPUs de 12-16 GB para experimentacion, aceptando la perdida de calidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin margen para KV cache): Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB. Hay que sumar el fichero mmproj (0,7 GB en Q8_0 o 1,0 GB en f16) si se usa la parte multimodal.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q6_K y Q5_K_M, una RTX 4090 (24 GB) o A6000; para Q4_K_M y Q4_K_S, una RTX 4090, RTX 3090 o L40S; para Q3 y Q2, GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5, y en GPUs de 12-16 GB con Q2_K y Q3_K_S (con perdida notable de calidad en Q2_K).
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), text-generation-inference (tag `text-generation-inference`), y servidores compatibles con la API de endpoints (tag `endpoints_compatible`). Para mayor calidad, las versiones imatrix del repo `mradermacher/Qwopus3.6-27B-Coder-i1-GGUF`.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.6-27B-Coder (GGUF) | 27,3 B | no disponible | Apache 2.0 | GGUF | Especializado en codigo, razonamiento CoT, tool calling y multimodal (mmproj) |
| Qwen2.5-Coder-32B | 32,5 B | 128 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia en codigo de la familia Qwen; sin modo de razonamiento explicito declarado |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos, MoE) | 128 K (segun documentacion publica) | DeepSeek License | safetensors, GGUF | MoE mas ligero en activaciones, pero licencia menos permisiva que Apache 2.0 |
| Codestral-22B | 22 B | 32 K (segun documentacion publica de Mistral) | MNPL (no comercial) | safetensors, GGUF | Buen rendimiento en codigo, pero licencia restrictiva para uso comercial |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica habitual; no se dispone de benchmarks comparativos del modelo evaluado en la informacion proporcionada, por lo que la comparacion de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- No se han publicado benchmarks en la informacion disponible; el rendimiento real en codigo, matematicas y razonamiento no esta verificado de forma independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde puede inventar APIs o funciones inexistentes.
- La longitud de contexto no esta documentada; desplegarlo con historiales largos o repositorios extensos requiere validacion previa.
- El modelo se ha afinado sobre trazas derivadas de modelos Claude Opus; esto puede introducir sesgos de estilo o de formato y cuestiones de cumplimiento si se usa en contextos donde los terminos de uso de esos modelos sean relevantes.
- La cuantizacion Q2_K (11,0 GB) degrada notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El soporte multimodal depende de los ficheros mmproj y no esta detallado en la model card; conviene probarlo antes de confiar en el para tareas de vision.
- Aunque la licencia es Apache 2.0, el modelo base y los datasets de entrenamiento pueden tener condiciones adicionales; conviene revisar la model card de `Jackrong/Qwopus3.6-27B-Coder` antes de un uso comercial a gran escala.
- El modelo tiene solo 458 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- Idiomas cubiertos: en, zh, es, ru, ja; no se declara soporte para otros idiomas, por lo que el rendimiento en lenguas no listadas sera probablemente inferior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.6-27B-Coder-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwopus3.6-27B-Coder-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwopus3.6-27B-Coder-GGUF
- Dataset de trazas de razonamiento (Opus 4.6): https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas de razonamiento (Opus 4.7): https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agentes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

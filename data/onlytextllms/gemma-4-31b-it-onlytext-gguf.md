# OnlyTextLLMs/gemma-4-31B-it-OnlyText-GGUF

## Resumen

El modelo `OnlyTextLLMs/gemma-4-31B-it-OnlyText-GGUF` es una distribución en formato GGUF de la variante exclusivamente de texto de `google/gemma-4-31B-it`. Lo publica el usuario OnlyTextLLMs el 24 de septiembre de 2026 y no introduce ningún entrenamiento adicional: se limita a eliminar las modalidades de imagen, audio y vídeo del modelo original de Google DeepMind y a cuantizar los pesos resultantes. El objetivo es ofrecer el mismo backbone textual en un formato ligero y desplegable localmente mediante llama.cpp, sin cabecera de decodificación especulativa embebida.

El modelo base es un transformer denso de 30.697.307.964 parámetros (≈30,70B), con 60 capas (50 de atención deslizante y 10 de atención completa), dimensión oculta de 5376 y vocabulario de 262.137 entradas. Hereda la ventana de contexto de hasta 256.000 tokens del modelo original y conserva la arquitectura `gemma4` que reconoce llama.cpp.

Su relevancia actual radica en tres factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales; la disponibilidad de cuantizaciones Q4_K_M, Q6_K y Q8_0 que lo hacen ejecutable en GPUs de consumo y workstations; y la eliminación de las modalidades no textuales, que simplifica el despliegue cuando solo se necesita generación de texto, razonamiento y código sin cargar la torre multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4); 60 capas (50 de atencion deslizante + 10 de atencion completa); hidden size 5376; vocabulario 262.137; `Gemma4ForCausalLM`, arquitectura GGUF `gemma4` |
| Parametros totales | 30.697.307.964 (≈30,70B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 256.000 tokens (modelo base); el repositorio no especifica recorte. Los benchmarks se ejecutaron con `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (18,7 GB), Q6_K (25,2 GB), Q8_0 (32,6 GB), todas en formato GGUF |
| Idiomas soportados | No especificados en este repositorio; el modelo base google/gemma-4-31B-it declara soporte para mas de 140 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (solo cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con una combinacion de atencion deslizante (50 de las 60 capas) y atencion completa (10 capas), un patron habitual para reducir el coste de memoria y computo en contextos largos manteniendo acceso global en capas clave. No emplea Mixture-of-Experts, por lo que todos los parametros se activan en cada token. La tokenizacion se reduce a 17 tokens especiales exclusivamente textuales (ids 0-106, con EOS = `<eos>` en el id 1 y fin de turno = `<turn|>` en el id 106); los tokens de imagen, audio y vídeo del modelo original se han eliminado.

No hay entrenamiento adicional en este repositorio: los pesos son derivados intactos del modelo base, convertidos con `convert_hf_to_gguf.py` (llama.cpp `9d286e1b315c`) y cuantizados con `llama-quantize`. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; si la family Gemma 4 sigue el patron de generaciones anteriores, estos datos estarian en el informe tecnico de Google DeepMind, que no se cita en este repositorio. El archivo GGUF no incluye cabecera de decodificacion especulativa, de modo que la inferencia es decodificacion plana.

## Capacidades

- Generacion de texto conversacional y de proposito general, con soporte de plantilla de chat y turnos multi-turno.
- Razonamiento: la plantilla de chat soporta el canal de "thinking" de Gemma, aunque `enable_thinking` viene desactivado por defecto; se puede activar enviando `"chat_template_kwargs": {"enable_thinking": true}` en la API del servidor.
- Generacion de codigo y tareas de programacion, heredadas del modelo base, que Google describe como apto para coding.
- Flujos agenticos y multi-paso: el modelo base esta orientado a agentic workflows; en este repositorio no se documentan de forma especifica los detalles de tool calling.
- Capacidad multilingue heredada del modelo base (mas de 140 idiomas segun Google), aunque el repositorio de esta cuantizacion no la certifica explicitamente.
- Ventana de contexto larga (hasta 256.000 tokens), util para ingerir documentos extensos o bases de codigo.
- Sin capacidades de vision, audio ni video: la parte multimodal del modelo original ha sido eliminada deliberadamente.

## Casos de uso

- Atencion al cliente automatizada: con hasta 256.000 tokens de contexto se pueden mantener conversaciones multi-turno con historiales extensos y documentos de referencia insertados en el prompt; el formato GGUF permite ejecutarlo en infraestructura propia con llama-server exponiendo API compatible con OpenAI.
- Generacion de codigo en produccion: el modelo hereda la orientacion a coding del base y puede integrarse en pipelines de CI/CD como asistente de revision, generacion de tests o autocompletado, ejecutandose en local para evitar enviar codigo propietario a servicios externos.
- Procesamiento de documentacion larga: contratos, informes tecnicos o expedientes completos se pueden cargar enteros gracias al contexto amplio, con salidas de resumen, extraccion de entidades o generacion de preguntas.
- Razonamiento con modo thinking activado: para tareas analiticas o matematicas donde interesa una cadena de razonamiento previa, se activa `enable_thinking` y el modelo razona antes de responder, a costa de mayor latencia.
- Asistente de desarrollo local en workstation: la cuantizacion Q4_K_M (18,7 GB) cabe en una GPU de 24 GB, lo que permite tener un asistente de codigo y chat propio en un equipo individual sin depender de la nube.
- Analisis de bases de codigo: con contexto largo y licencia Apache 2.0 se puede usar para explorar repositorios completos, generar documentacion tecnica o localizar patrones, sin las restricciones que imponen otras licencias de modelos abiertos.
- Generacion de contenido multilingue: aunque este repositorio no detalla el conjunto de idiomas, el modelo base cubre mas de 140 lenguas, lo que habilita traduccion y redaccion multilingue en despliegues propios.

## Benchmarks y rendimiento

Los unicos datos publicados son los del autor, medidos el 24 de septiembre de 2026 en 2× AMD Radeon AI PRO R9700 (gfx1201, 34 GB cada una) con llama.cpp `9d286e1b315c` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`). La decodificacion es plana (sin decodificacion especulativa). Las dos columnas de generacion son mediciones distintas y no deben compararse entre si: la de chat usa la plantilla de conversacion con un prompt de unos 90 tokens y 256 tokens generados; TG128 es una generacion desnuda de 128 tokens.

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Gen t/s chat | Gen t/s llama-bench TG128 |
|---|---|---|---|---|
| Q4_K_M | 1× R9700 | 940 | 24,0 | 24,3 |
| Q6_K | 1× R9700 | 577 | 19,9 | 21,0 |
| Q8_0 | 2× R9700 (layer-split) | 900 | no disponible | 16,6 |

El propio autor indica que no cita lineas base publicadas para este tamano. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin contar cache KV): Q4_K_M ≈ 18,7 GB; Q6_K ≈ 25,2 GB; Q8_0 ≈ 32,6 GB. A estos valores hay que sumar la cache KV, que crece con la longitud de contexto y con `-c` configurado.
- GPUs de 24 GB (RTX 3090, RTX 4090, A10G): adecuadas para Q4_K_M con contexto moderado. Q6_K (25,2 GB) queda al limite y probablemente exija offload parcial a CPU o no quepa junto con la cache KV.
- GPUs de 40-48 GB (A100 40 GB, RTX 6000 Ada 48 GB): aptas para Q6_K y Q8_0 con margen para cache KV.
- GPUs de 80 GB (H100, A100 80 GB): permiten Q8_0 con contextos largos sin offload.
- Multi-GPU: el autor ejecuto Q8_0 en dos AMD Radeon AI PRO R9700 con `--split-mode layer` (por defecto en llama.cpp); conviene no fijar variables `*_VISIBLE_DEVICES` para dejar que el reparto sea automatico.
- Cabe en GPU de consumo: si, Q4_K_M en tarjetas de 24 GB; Q8_0 y Q6_K no en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con API compatible con OpenAI), llama-quantize para generar cuantizaciones, y en general cualquier runtime que soporte la arquitectura GGUF `gemma4`. Se requiere una build de llama.cpp que conozca dicha arquitectura.
- Latencia y throughput: los del autor son 24,3 t/s (TG128) en Q4_K_M y 16,6 t/s en Q8_0 sobre R9700; el prefill llega a 940 t/s (PP512) en Q4_K_M. No hay datos de latencia en otras GPU.
- Ejemplo de arranque del autor: `llama-server -m gemma-4-31B-it-OnlyText-Q4_K_M.gguf -ngl 99 -c 32768 -fa on`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-OnlyText-GGUF (este) | 30,70B (denso) | hasta 256K (base) | solo texto | apache-2.0 | GGUF cuantizado (Q4_K_M, Q6_K, Q8_0) |
| google/gemma-4-31B-it (base) | 30,70B (denso) | hasta 256K | texto, imagen, video (frames) | apache-2.0 | safetensors (pesos completos) |
| Gemma 4 26B A4B | 26B (MoE) | no disponible | multimodal | apache-2.0 | safetensors y variantes |
| Gemma 4 12B | 12B (denso) | no disponible | multimodal | apache-2.0 | safetensors y variantes |

La diferencia principal frente al modelo base es la eliminacion de vision y audio y la conversion a GGUF, que reduce los requisitos de despliegue pero pierde toda capacidad multimodal. No se dispone de datos comparativos de rendimiento (MMLU, HumanEval, etc.) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- No hay datos publicados de sesgos para esta cuantizacion; el modelo base puede heredar sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion inherente a los modelos generativos; no se ha publicado ninguna evaluacion de fidelidad en la informacion disponible.
- Las cuantizaciones Q4_K_M y Q6_K introducen perdida de precision respecto a los pesos originales; el autor no documenta la degradacion de calidad asociada.
- El repositorio no especifica los idiomas soportados ni una evaluacion multilingue propia.
- Aunque la licencia es Apache 2.0, los pesos derivan del modelo de Google DeepMind; conviene revisar los terminos de uso y las politicas de uso aceptable de Gemma aplicables al modelo base.
- La ventana de 256.000 tokens corresponde al modelo base; ejecutarla completa requiere cache KV muy grande y no esta validada en los benchmarks del autor, que usan 32.768 tokens.
- El modo `thinking` esta desactivado por defecto; quien espere cadenas de razonamiento debe activarlo explicitamente.
- No hay cabecera de decodificacion especulativa en el archivo, por lo que no se obtiene la aceleracion asociada.
- Se necesita una build de llama.cpp que soporte la arquitectura `gemma4`; versiones anteriores fallaran al cargar el archivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OnlyTextLLMs/gemma-4-31B-it-OnlyText-GGUF
- Modelo texto-solo original (sin cuantizar): https://huggingface.co/OnlyTextLLMs/gemma-4-31B-it-OnlyText
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it
- Pagina del modelo base (Google): https://huggingface.co/google/gemma-4-31B
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 31B en Ollama: https://ollama.com/library/gemma4:31b
- Gemma 4 31B IT en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Gemma 4 31B en Novita AI: https://novita.ai/models/model-detail/google-gemma-4-31b-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

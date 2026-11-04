# FlagRelease/Xing4.0-29B-A4B-BF16-mthreads-FlagOS

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd., presentado como la nueva generación de la familia Xingchen (Xingchen 4.0) y construido sobre la serie TeleChat1-3. Está disenado especificamente para escenarios de agentes de IA: tareas de horizonte largo, planificacion multi-paso, invocacion de herramientas y cadenas de razonamiento complejas. Con 29B parametros totales y solo 4B activos por token, busca ofrecer capacidades de agente a un coste computacional relativamente bajo.

La arquitectura combina mHC (multi-head compression, segun la nomenclatura del autor), MLA (Multi-head Latent Attention) y MTP (Multi-Token Prediction), y soporta de forma nativa una ventana de contexto de 256K tokens, extensible hasta 512K. El modelo se presenta como el primer modelo de decenas de miles de millones de parametros entrenado integramente en potencia de computo y frameworks domesticos chinos.

La version concreta de esta ficha es el artefacto `Xing4.0-29B-A4B-BF16-mthreads-FlagOS`, publicado por la comunidad FlagOS: una adaptacion multi-chip verificada para las GPU Moore Threads (MTT S5000) en precision BF16, con scripts e imagen Docker listos para despliegue. La adaptacion cubre nueve plataformas de chips (T-Head, NVIDIA, Moore Threads, Huawei Ascend, MetaX, Hygon, Iluvatar CoreX, Tsingmicro y ARM), de las cuales siete operan en BF16 y ARM dispone de una variante cuantizada W4A8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP (transformer con atencion latente y prediccion multi-token) |
| Parametros totales | 31.215.031.088 (~29B, segun safetensors) |
| Parametros activos | ~4B |
| Longitud de contexto | 256K tokens nativo, extensible a 512K |
| Tipos de cuantizacion | BF16 (esta variante); W4A8 disponible en la variante ARM |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 29B parametros totales y aproximadamente 4B activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. Sobre el backbone transformer incorpora tres componentes destacados por el autor: MLA (Multi-head Latent Attention), orientada a comprimir el estado KV y hacer viable el contexto largo; mHC, un mecanismo de compresion multi-cabeza con implementaciones especificas para entrada y salida (variables `XINGCHEN4_MHC_HIN_IMPL` y `XINGCHEN4_MHC_HOUT_IMPL` en el runtime); y MTP (Multi-Token Prediction), que permite predecir varios tokens por paso y suele aprovecharse para decodificacion especulativa.

Segun la model card, el entrenamiento se realizo integramente sobre potencia de computo y frameworks domesticos chinos, partiendo de la serie TeleChat1-3. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La adaptacion FlagOS anade una capa de portabilidad: kernels propios (FlagGEMS), backend de comunicacion FlagCX y dispatcher por operador, con verificacion de consistencia de precision frente al stack nativo de NVIDIA (los resultados de Math-500 coinciden en un margen de 0,6 puntos).

## Capacidades

- Generacion de texto y razonamiento complejo, con soporte de cadenas de razonamiento largas (hasta 99.000 tokens de finalizacion configurados en el runtime).
- Razonamiento matematico y cientifico de nivel avanzado (Math-500 y GPQA Diamond reportados por el autor).
- Capacidades de agente: planificacion multi-paso, tareas de horizonte largo y ejecucion de cadenas de razonamiento complejas.
- Invocacion de herramientas (tool calling / function calling) como capacidad de diseno central del modelo.
- Contexto largo nativo de 256K tokens, extensible a 512K, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Multilinguee limitado a chino e ingles.
- Capacidades de codigo e ingenieria: el autor indica optimizacion especifica para tareas de ingenieria complejas, aunque no se publican benchmarks de codigo en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Agentes autonomos de ingenieria de software: el modelo puede planificar refactorizaciones o migraciones multi-paso, invocar herramientas de build y test, y mantener el estado a lo largo de tareas largas gracias a su contexto de 256K tokens y a su entrenamiento orientado a agentes.
- Orquestacion de pipelines con tool calling: integrado como planificador central que decide que API, script o servicio invocar en cada paso, aprovechando la invocacion de funciones nativa y el razonamiento multi-paso.
- Analisis de repositorios y documentacion extensa: con 256K-512K tokens de contexto puede procesar arboles de codigo, especificaciones e historiales de incidencias en una sola pasada, sin troceado agresivo.
- Atencion al cliente automatizada en chino e ingles: conversaciones multi-turno con memoria larga, escalado a agentes humanos mediante tool calling y consulta a bases de conocimiento internas.
- Asistencia en investigacion tecnica y matematica: resolucion de problemas de nivel competicion (Math-500) y preguntas cientificas de posgrado (GPQA Diamond), util en entornos educativos o de I+D.
- Despliegue en infraestructura no-NVIDIA: la variante FlagOS para Moore Threads permite ejecutar el modelo en clusters MTT S5000 en BF16 con vLLM/SGLang, relevante para organizaciones con requisitos de soberania tecnologica o de cadena de suministro.
- Procesamiento por lotes de documentos largos: clasificacion, extraccion y resumen de contratos o informes de decenas de miles de tokens con una sola llamada.

## Benchmarks y rendimiento

| Metrica | NVIDIA (stack nativo) | Moore Threads (FlagOS) |
|---|---|---|
| GPQA Diamond | 62,63 | en evaluacion |
| Math-500 | 84,80 | 84,20 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de agente (por ejemplo, SWE-bench o tau-bench), a pesar de que el modelo se posiciona para escenarios de agente.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 62,4 GB de pesos (el repositorio ocupa 62,4 GB), mas estado KV y overhead del runtime; en la practica requiere multiples GPU.
- Configuracion de referencia del autor: 8x MTT S5000 (Moore Threads) con MUSA 4.3.5, driver MThreads 3.3.5 y contenedor Docker con vLLM 0.10.1 y SGLang 0.5.18.
- En GPUs NVIDIA: variante BF16 desplegable en 8x A100 80 GB o 8x H100; no se documenta una configuracion minima oficial en la informacion disponible.
- No cabe en GPU de consumo individual en BF16. La variante W4A8 (publicada para ARM) reduce el requisito, pero no se detalla su huella de memoria ni si existe una version GGUF para llama.cpp u Ollama.
- Opciones de despliegue documentadas: SGLang con backend FlagCX y FlagGEMS, vLLM (incluido en la imagen FlagOS) y descarga via ModelScope. No se documentan integraciones con TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El runtime fija `SGLANG_SAFE_MAX_COMPLETION_TOKENS=99000` y desactiva `TORCH_COMPILE_DISABLE=1`, lo que sugiere margen de optimizacion pendiente en el stack Moore Threads.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | ~29B | ~4B | 256K (512K ext.) | Apache 2.0 | Enfoque agente, entrenamiento en computo domestico chino |
| Qwen3-30B-A3B | ~30B | ~3B | 128K (extensible) | Apache 2.0 | MoE comparable en escala; no disponible en la informacion proporcionada para comparar rendimiento |
| DeepSeek-V3 | ~671B | ~37B | 128K | Licencia propia | Mucho mayor escala; no comparable directamente en coste |
| TeleChat1-3 | no disponible | no disponible | no disponible | no disponible | Modelo base de la familia sobre la que se construye Xing4.0 |

No se dispone de datos de benchmarks cruzados entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; el rendimiento en castellano y otras lenguas no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad ni de tasa de alucinacion; en tareas de agente con tool calling el riesgo se amplifica si el modelo invoca herramientas con argumentos incorrectos.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto incluye `custom_code`, por lo que conviene auditar el codigo remoto antes de desplegarlo en produccion.
- Madurez del stack: la variante FlagOS para Moore Threads tiene verificacion de precision parcial (GPQA Diamond aun "en evaluacion") y depende de una imagen Docker concreta con vLLM 0.10.1 y SGLang 0.5.18; la compatibilidad con versiones futuras no esta garantizada.
- Configuracion delicada: el arranque exige numerosas variables de entorno (FlagGEMS, FlagCX, blacklists de operadores, sanitizacion de NaN en logits), lo que incrementa el riesgo operativo.
- Adopcion muy baja: 24 descargas y 1 like en Hugging Face en la fecha de consulta; no hay ecosistema comunitario consolidado ni versiones GGUF/AWQ ampliamente probadas.
- Contexto largo: aunque se declaran 256K-512K tokens, no se publican resultados de pruebas tipo "needle in a haystack" que validen la recuperacion efectiva a esas longitudes.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.0-29B-A4B-BF16-mthreads-FlagOS
- ModelScope (pesos, segun la model card): descarga via `modelscope download --model FlagRelease/Xing4.0-29B-A4B-BF16-mthreads-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/xing4.0-29b-a4b-mthreads001-gems0.0-tree0.6.0-cx0.13.0-pluginnone-vllm0.10.1-sglang0.5.18-sglangfl0.1.0-cp310-pt29-musa43-x64-3.3.5-server:202611031916`
- Paper, blog o repositorio oficial de China Telecom: no disponibles en la informacion proporcionada.

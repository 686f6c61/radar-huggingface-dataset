# qwegnai/GLM-5.3-Flash-shvq4g32-shvq2g64-shvq3g64

## Resumen

GLM-5.3-Flash es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por zai-org, con 321,32 mil millones de parametros totales y aproximadamente 18 mil millones activos por token. La ficha que nos ocupa no es el modelo original, sino un empaquetado de pesos cuantizados publicado por el usuario qwegnai bajo el identificador `qwegnai/GLM-5.3-Flash-shvq4g32-shvq2g64-shvq3g64`. Este paquete aplica Spherical Hadamard Vector Quantization (SHVQ, arXiv:2611.09501) para comprimir los pesos a 2,69 bits por parametro, reduciendo el tamano de 134,37 GiB a 100,63 GiB.

La relevancia de este artefacto es fundamentalmente de infraestructura: permite que un modelo de 321B de parametros resida completamente en la memoria unificada de un Mac de 128 GB (Apple Silicon), sin paginacion a SSD ni swap del sistema operativo. Para ello se apoya en el motor de inferencia propietario Qwegn (Swift + Metal 4), que es el unico runtime capaz de cargar el contenedor `QWP1` en el que se distribuyen los pesos. No se trata, por tanto, de un checkpoint en safetensors, GGUF ni MLX, lo que limita severamente su portabilidad.

La arquitectura subyacente combina atencion MLA sin RoPE (NoPE), atencion lineal KDA, un esquema MoE con 288 expertos por capa y un modulo de prediccion multi-token (NextN MTP), con una ventana de contexto nativa de 202.752 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 45 capas (3 densas + 42 MoE con 288 expertos, 8 enrutados + 1 compartido activos), 11 capas NoPE MLA (KV latente de 512 dimensiones + Key-Pool de 4) + 34 capas KDA de atencion lineal, mHC Sinkhorn-20 de 4 flujos, NextN MTP (capa 45), torre de vision de 24 bloques |
| Parametros totales | 321,32 B |
| Parametros activos | ~18 B |
| Longitud de contexto | 202.752 tokens nativos; indice disperso MLA Key-Pool(4) con k = 2048 |
| Tipos de cuantizacion | SHVQ4_G32 (4,50 bpw), SHVQ3_G64 (3,25 bpw), SHVQ2_G64 (2,25 bpw) y BF16 (16,00 bpw); media de 2,69 bits por parametro |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor propietario QWP1 (exclusivo del motor Qwegn v0.14.0+); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer hibrido que alterna dos mecanismos de atencion: 11 capas con Multi-head Latent Attention (MLA) sin codificacion posicional rotatoria (NoPE), con un espacio latente de KV de 512 dimensiones y un esquema Key-Pool de 4 que actua como indexador disperso, y 34 capas con atencion lineal KDA. El bloque MoE emplea 288 expertos por capa con 8 expertos enrutados y 1 compartido activos por token, lo que explica la relacion entre los 321,32 B de parametros totales y los ~18 B activos. Se anaden un mecanismo de balanceo Sinkhorn-20 mHC de 4 flujos, un modulo NextN de prediccion multi-token en la capa 45 y una torre de vision de 24 bloques.

Sobre el proceso de entrenamiento del modelo original no se dispone de informacion en la documentacion proporcionada: no se detallan el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. La innovacion tecnica documentada corresponde al empaquetado cuantizado, no al entrenamiento. SHVQ aplica una transformada ortogonal de Walsh-Hadamard a cada grupo de pesos y cuantiza vectorialmente en coordenadas esfericas de 4 dimensiones mediante codebooks `e-means` profundos con balance de capacidad. La asignacion de precision es asimetrica: los expertos enrutados `gate_proj` y `up_proj` (24.768 planos, 64,66% de los parametros) usan SHVQ2_G64 a 2,25 bpw; `down_proj` (12.384 planos, 32,33%) usa SHVQ3_G64 a 3,25 bpw para preservar la fidelidad de inyeccion en el flujo residual; las capas densas, MLA NoPE, KDA, expertos compartidos, NextN MTP y `lm_head` (462 planos, 2,58%) usan SHVQ4_G32 a 4,50 bpw; y embeddings, torre de vision, puertas del enrutador y normalizaciones (1.156 tensores, 0,43%) se mantienen en BF16.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de decodificacion especulativa mediante NextN MTP y prompt lookup.
- Razonamiento matematico de nivel avanzado: la model card reporta 2/2 aciertos en AIME 2025 con presupuesto de 16K tokens y cero respuestas incorrectas en la evaluacion `core`.
- Generacion de codigo y salida estructurada: fidelidad JSON del 100% en las pruebas `marker` y `nested-schema` (3/3 y 3/3).
- Procesamiento de contexto largo: ventana nativa de 202.752 tokens con indexador MLA disperso; se documenta residencia completa en memoria unificada incluso a 1.048.576 tokens.
- Capacidades de vision a traves de la torre de 24 bloques del modelo base, aunque el paquete desactiva por defecto la carga de los pesos visuales (`--no-load-vision`) para ahorrar 1,05 GiB.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Servidor compatible con APIs de OpenAI, Anthropic y Ollama a traves de `qwg serve`.

## Casos de uso

- Razonamiento matematico y cientifico en local: con 2/2 en AIME 2025 y contexto de 16K tokens, el modelo permite resolver problemas de competicion y derivaciones tecnicas en un Mac de 128 GB sin conexion a la nube, algo inviable con un 321B en BF16.
- Generacion de JSON estricto para integracion de sistemas: la fidelidad del 100% en esquemas anidados lo hace apto para pipelines que exijan salidas parseables (extraccion de entidades, rellenado de formularios, respuestas de API estructuradas).
- Analisis de documentos extensos: la ventana de 202.752 tokens y el indexador MLA disperso permiten procesar contratos, informes o bases de codigo completas en una sola pasada, con recuperacion tipo needle documentada a 160K tokens.
- Asistente de codigo en estaciones de trabajo Apple Silicon: el motor Qwegn expone un servidor compatible con OpenAI y Ollama, de modo que herramientas como Continue o extensiones de IDE pueden apuntar a `qwg serve` y beneficiarse de la decodificacion especulativa a 44,0 tok/s.
- Prototipado e investigacion sin GPU dedicada: investigadores que ya dispongan de un Mac con 128 GB pueden ejecutar un modelo de 321B con 36,2 tok/s medianos, evitando el coste y la gestion de clústeres con A100/H100.
- Servicio multiusuario ligero: con 4 flujos concurrentes agregando 30,8 tok/s y cache de prefijo en caliente con TTFT de 18 ms, resulta viable para equipos pequenos que compartan un unico equipo.
- Evaluacion de tecnicas de cuantizacion: el paquete sirve como referencia reproducible para comparar SHVQ frente a otras estrategias (HQ4+HQ3) en terminos de tamano, residencia y calidad.

## Benchmarks y rendimiento

Los datos siguientes corresponden al paquete cuantizado ejecutado en Qwegn v0.14.1 sobre un Apple M5 Max (`Mac17,6`, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), con `llmprobe v0.6.17`, `--kv-mode q4` y temperatura 0.

| Metrica | Resultado |
|---|---|
| Prefill (prompt de ~4,2K) | 618 tok/s |
| TTFT en frio / con cache de prefijo en caliente | 230-366 ms / 18 ms (147,1x) |
| Decodificacion (razonamiento novedoso) | 36,2 tok/s de mediana (rango 26,7-38,4) |
| Decodificacion especulativa (NextN + prompt lookup) | 44,0 tok/s (1,67x, 3,69 tok/paso) |
| Contexto largo MLA `exactFlat` vs `e-means` a 64K / 160K | 24,26 -> 25,61 tok/s (+5,6%) / 22,23 -> 26,63 tok/s (+19,8%, 3/3 needle) |
| Residencia a 1M tokens (KV MLA `q4`, 3.696 B/token) | 100% residente (102,27 GiB plan / 107,18 GiB RSS, 0 fallos de SSD) |
| Agregado con 4 flujos concurrentes | 30,8 tok/s |
| Determinismo en verificacion multi-fila | 5/5 bit-exactos (SHA-256) |
| Fidelidad JSON estructurada | 3/3 y 3/3 (100%) |
| AIME 2025 (presupuesto 16K) | 2/2 |
| Tamano del paquete | 100,63 GiB (108.051.337.284 bytes), -33,74 GiB (-25,1%) frente a HQ4+HQ3 |
| Residencia en Mac de 128 GB | 100% (288/288 expertos por capa, 99,56 GiB RSS, 0 fallos de SSD) |

No se han publicado resultados comparativos con MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete ocupa 100,63 GiB en disco; en ejecucion la RSS es de 99,56 GiB y el cableado Metal de 107,0 GiB con KV `q4` a 16K tokens. A 1M tokens el plan asciende a 102,27 GiB y la RSS a 107,18 GiB.
- Hardware objetivo: Apple Silicon con 128 GB de memoria unificada; las mediciones se realizaron en un M5 Max con GPU de 40 nucleos y 585 GB/s de ancho de banda. No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en GPU de consumo: si, en el sentido de que cabe en un Mac de 128 GB; no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, etc.) ni en configuraciones Apple de 64 GB o menos.
- Despliegue: exclusivamente mediante el motor Qwegn v0.14.0 o superior (`qwg serve`, `qwg run`), que expone APIs compatibles con OpenAI, Anthropic y Ollama. No es compatible con vLLM, llama.cpp, Ollama nativo, TGI ni MLX.
- Latencia y throughput: prefill de 618 tok/s, decodificacion de 36,2 tok/s de mediana, 44,0 tok/s con decodificacion especulativa y TTFT en caliente de 18 ms. Bajo carga de 4 flujos concurrentes el agregado es de 30,8 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (original, zai-org) | 321,32 B (~18 B activos) | 202.752 tokens | Pesos originales (formato no especificado en la informacion) | no disponible | Hugging Face |
| GLM-5.3-Flash SHVQ4/2/3 (este paquete) | 321,32 B (~18 B activos) | 202.752 tokens | QWP1, solo Qwegn | MIT | Hugging Face, 0 descargas |
| GLM-5.3-Flash HQ4_G32 + HQ3_G64 (referencia citada) | 321,32 B (~18 B activos) | 202.752 tokens | QWP1, solo Qwegn | no disponible | Referenciado en la model card |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: el contenedor QWP1 solo se carga en Qwegn v0.14.0+ sobre Apple Silicon. No es utilizable en servidores NVIDIA, en la nube convencional ni con herramientas estandar del ecosistema (transformers, vLLM, llama.cpp).
- Requisito de hardware muy restrictivo: exige un Mac con 128 GB de memoria unificada; en equipos de 64 GB o menos no residira en memoria y sufrira paginacion a SSD.
- Naturaleza cuantizada: 2,69 bits por parametro implican perdida de fidelidad respecto al modelo original. Aunque la model card reporta resultados correctos en AIME 2025 y JSON estructurado, no se ofrecen comparaciones sistematicas de perplejidad ni de benchmarks estandar frente al modelo en BF16.
- Vision desactivada por defecto: la carga estandar usa `--no-load-vision`, por lo que las capacidades visuales no estan disponibles salvo configuracion explicita.
- Idiomas: no se documenta la cobertura linguistica; no hay garantias sobre calidad en castellano u otras lenguas distintas del ingles.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; debe asumirse el comportamiento del modelo base, no evaluado aqui.
- Licencia MIT declarada en el paquete, pero la licencia y condiciones del modelo base `zai-org/GLM-5.3-Flash` no se detallan; conviene verificar los terminos del modelo original antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes, fue creado el 11 de noviembre de 2026 y actualizado el mismo dia; se trata de un artefacto sin validacion comunitaria.
- Dependencia de un motor propietario: el rendimiento y la correccion dependen de la implementacion cerrada de Qwegn, lo que introduce riesgo de proveedor y de cambios incompatibles entre versiones.

## Enlaces

- Repositorio del paquete: https://huggingface.co/qwegnai/GLM-5.3-Flash-shvq4g32-shvq2g64-shvq3g64
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Revision del modelo base citada: `46a050bec13002ad29ee795c16e61cf4fa3c4a9c`
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Paper de SHVQ: arXiv:2611.09501

# npario/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Esta ficha describe una cuantizacion GGUF del modelo Xing4.0-29B-A4B, un Mixture-of-Experts (MoE) de 29B parametros totales con aproximadamente 4B parametros activos por token, desarrollado originalmente por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.) como evolucion de la familia TeleChat. Sobre ese checkpoint, el usuario huihui-ai publico una variante "abliterated" (sin rechazos) y el quantizador IsValorum ha producido esta edicion APEX-I-MiniPlus V2.1, que es la que aqui se evalua.

El interes de esta release concreta es el equilibrio entre tamano y fidelidad: un archivo GGUF de 13,76 GB (3,42 bits por peso de media) que, segun mediciones del propio autor, conserva una perplejidad en WikiText-2 de 7,7238 frente a los 7,3060 del BF16 de referencia, lo que supone un incremento del 5,71 %. Esa cifra situa la calidad practica en el entorno de un Q5_K_M y permite ejecutar un MoE de 29B en GPUs de consumo y en despliegues hibridos RAM/GPU.

La combinacion de contexto nativo de 262.144 tokens, arquitectura con MLA y MTP, y la eliminacion de rechazos hace que la ficha sea relevante para quien busque un modelo local de razonamiento, codigo y uso agentico sin restricciones de contenido, asumiendo las implicaciones eticas y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC (manifold-constrained Hyper-Connections), Multi-head Latent Attention (MLA) y una capa Multi-Token Prediction (MTP) |
| Parametros totales | 31.215.031.088 (dato real de safetensors); denominacion comercial 29B |
| Parametros activos | Aproximadamente 4B por token (sufijo A4B) |
| Longitud de contexto | 262.144 tokens nativos (256K); el modelo upstream documenta extension hasta 512K |
| Tipos de cuantizacion | GGUF con mezcla de precision tensor a tensor: routers MoE en F32, shared experts en Q5_K, backbone de expertos enrutados en 3 bits calibrado con imatrix; media resultante 3,42 BPW |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 13,76 GB; repositorio de 13,8 GB) |

## Arquitectura y entrenamiento

El modelo upstream es un MoE de 40 capas transformer principales: las capas 0 y 1 son FFN densas (`first_k_dense_replace: 2`) y las capas 2 a 39 son capas MoE con 64 expertos enrutados, de los cuales se seleccionan 4 por token, mas un experto compartido siempre activo. A ello se anade un bloque MTP adicional almacenado como `blk.40` en el GGUF. La atencion usa MLA, lo que reduce de forma notable el tamano de la cache KV frente a atencion multi-head clasica, y la arquitectura incorpora mHC (hyper-connections con restriccion de variedad) como mecanismo de conexion entre capas.

El entrenamiento del modelo original se realizo integramente sobre la plataforma Ascend NPU con el framework MindSpore, y el autor lo presenta como el primer modelo de esta escala entrenado de principio a fin en dicho stack. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La variante aqui cuantizada procede de un proceso de abliteration aplicado por huihui-ai mediante el flujo de `Sumandora/remove-refusals-with-transformers`; esta cuantizacion GGUF no aplica ninguna eliminacion de rechazos adicional, solo comprime el checkpoint ya abliterated.

La innovacion tecnica de esta release es la asignacion de precision por tensor: se mantienen las dos capas densas de entrada en alta precision, todos los routers en F32 para no degradar el enrutamiento, los expertos compartidos en Q5_K y solo el backbone de expertos enrutados en 3 bits, calibrado con matriz imatrix generada a partir de millones de tokens.

## Capacidades

- Generacion de texto conversacional y de formato largo, con ventana nativa de 256K tokens.
- Razonamiento multi-paso, incluyendo modos de pensamiento segun la documentacion del modelo upstream.
- Generacion y comprension de codigo, con optimizacion declarada para tareas de ingenieria complejas.
- Planificacion agentica y uso de herramientas (tool calling / function calling) como caso de uso objetivo del modelo base.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion con Multi-Token Prediction (bloque MTP presente en el GGUF), orientada a mejorar el throughput de generacion.
- Comportamiento sin rechazos (uncensored) heredado del checkpoint abliterated, lo que amplia el rango de respuestas pero elimina las salvaguardas originales.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede mantener contexto de repositorios enteros gracias a los 256K tokens de ventana y operar sobre un unico archivo GGUF de 13,76 GB en una GPU de consumo, sin depender de APIs externas.
- Agente de automatizacion con tool calling: al estar orientado a planificacion agentica, encaja en pipelines que encadenan llamadas a herramientas y APIs, con la ventaja de que la cache KV reducida por MLA permite sesiones largas en memoria limitada.
- Analisis de documentos extensos: informes tecnicos, expedientes o bases de codigo de cientos de miles de tokens caben en una sola pasada de contexto, evitando estrategias de troceado y recuperacion.
- Laboratorio de investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar comportamiento sin rechazos, sesgos residuales y tasas de alucinacion frente al checkpoint original con fines comparativos.
- Prototipado offline en entornos sin conectividad: el despliegue via llama.cpp u Ollama permite trabajar en maquinas aisladas, algo relevante en entornos industriales o de defensa.
- Generacion de codigo en pipelines de CI/CD: integrable como servicio local que revisa diffs, propone parches y genera pruebas, con coste marginal cero por token una vez desplegado.
- Traduccion y redaccion tecnica ingles-chino: es el par de idiomas realmente soportado por el modelo, util para documentacion bilingue en equipos con proveedores en China.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo publicado por el autor es la perplejidad en WikiText-2 medida con `llama-perplexity` (contexto 2048, batch 512, 10 chunks) directamente sobre los binarios GGUF finales:

| Metrica | BF16 origen | APEX-I-MiniPlus V2.1 | APEX-I-NanoPlus |
|---|---|---|---|
| Perplejidad WikiText-2 | 7,3060 +/- 0,18633 | 7,7238 +/- 0,19671 | 8,3197 +/- 0,21528 |
| Delta frente a BF16 | 0 | +0,4178 (+5,71 %) | +1,0137 (+13,87 %) |
| Tamano GGUF | 62,40 GB | 13,76 GB | 11,74 GB |
| BPW medio | 16,00 | 3,42 | 2,92 |
| Objetivo de calidad | Precision completa | Clase Q5_K_M | Clase Q4_K_M / Q4_K_S |

## Requisitos de hardware

- VRAM estimada para inferencia: 13,76 GB solo de pesos; con contexto moderado (8K-32K) y cache KV en FP16 conviene reservar del orden de 16-20 GB, y el coste de cache crece de forma apreciable con contextos de 128K-256K. Estimacion propia, no publicada por el autor.
- GPU recomendadas: el autor menciona proyecciones de throughput en GPU y pruebas de offload a RAM, pero los valores concretos no estan disponibles en la informacion proporcionada. Por capacidad, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) son el objetivo natural de esta cuantizacion; para 256K de contexto realista se necesitarian A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con contexto corto y capas parcialmente offloaded a RAM del sistema (despliegue hibrido RAM/GPU que el autor documenta como probado).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp), servidores compatibles con endpoints estilo OpenAI; el modelo declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, al ser un MoE con ~4B parametros activos, el coste por token se acerca mas al de un modelo denso de 4B que al de uno de 29B, siempre que los expertos enrutados esten en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npario / APEX-I-MiniPlus V2.1 (esta ficha) | 29B totales / ~4B activos | 256K nativo | PPL WikiText-2 7,7238 (+5,71 % vs BF16) | Apache 2.0 | GGUF 13,76 GB, 0 descargas, 0 likes |
| IsValorum / APEX-I-NanoPlus | 29B totales / ~4B activos | 256K nativo | PPL WikiText-2 8,3197 (+13,87 % vs BF16) | Apache 2.0 | GGUF 11,74 GB |
| XingChen-AGI / Xing4.0-29B-A4B-GGUF | 29B totales / ~4B activos | 256K nativo | No disponible | Apache 2.0 | GGUF oficial |
| vincespeed / Xing4.0-29B-A4B-APEX-GGUF | 29B totales / ~4B activos | 256K nativo | No disponible | Apache 2.0 | GGUF de terceros |
| huihui-ai / Huihui-Xing4.0-29B-A4B-abliterated | 29B totales / ~4B activos | 256K nativo | No disponible | Apache 2.0 | Pesos completos (modelo base) |

Las alternativas cuantizadas de otros modelos de tamano y categoria similar (por ejemplo, MoE de ~30B con ~3-4B activos de otras familias) no se detallan aqui porque no se ha proporcionado informacion verificable sobre ellas.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el mecanismo de rechazo del checkpoint original, por lo que puede producir contenido que el modelo base rechazaria. No es apto para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion: presente como en cualquier LLM de esta escala; no hay evaluaciones publicadas de factualidad ni de tasas de alucinacion en la informacion disponible.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Sesgos: no se documentan evaluaciones de sesgo. El entrenamiento esta vinculado a un corpus predominantemente chino e ingles, con el sesgo cultural que ello implica.
- Perdida de calidad medible: +5,71 % de perplejidad frente al BF16. Aceptable para uso general, pero relevante en tareas de razonamiento matematico o generacion de codigo donde el margen de error es estrecho.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo upstream y asumir la responsabilidad legal del contenido generado por una variante sin censura.
- Caveat de produccion: 0 descargas y 0 likes en el momento de la ficha, y fecha de creacion muy reciente; no hay validacion independiente de la cuantizacion mas alla de las mediciones del propio autor.
- Discrepancia de autoria: el repositorio figura a nombre de npario mientras que la model card atribuye la cuantizacion a IsValorum; conviene verificarlo antes de citar la fuente.
- Contexto de 256K: aunque es nativo, la VRAM necesaria para explotarlo completo excede con creces las GPU de consumo.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/npario/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo original upstream: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GGUF oficial del modelo original: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Repositorio GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- README en GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/README.md
- Edicion NanoPlus del mismo quantizador: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF
- Cuantizacion APEX de terceros (vincespeed): https://huggingface.co/vincespeed/Xing4.0-29B-A4B-APEX-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/xing4-0-29b-a4b.html
- Metodo de abliteration referenciado: https://github.com/Sumandora/remove-refusals-with-transformers
- Soporte al quantizador: https://ko-fi.com/isvalorum

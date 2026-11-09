# kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Georgian-v3.2, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en georgiano (ქართული ენა), razonamiento, vision multimodal y traduccion de pagina completa. Lo desarrolla el usuario kataguru y se construye sobre la base Kataguru-Sceptic-35B-A3B-v3.1, ampliando su arquitectura MoE de 254 a 256 expertos por capa mediante la incorporacion de dos expertos nuevos dedicados al georgiano, manteniendo congelados los 254 expertos originales.

El modelo resuelve el problema de dotar a un modelo fundacional de razonamiento cientifico y codigo de capacidades nativas en georgiano sin provocar olvido catastrofico (catastrophic forgetting) en las capacidades originales. Para ello congela los expertos #0..#253 y entrena exclusivamente los expertos #254 (gramatica, morfologia y terminologia tecnica georgiana) y #255 (literatura, no ficcion y traduccion bidireccional EN<->KA), con calibracion contrastiva del router.

Esta publicacion concreta ofrece los pesos cuantizados en GGUF en tres variantes (APEX-Small, APEX-Medium, APEX-Good) calibradas con un imatrix especifico de georgiano, mas el proyector multimodal mmproj en f16. Es relevante para desarrolladores que necesiten desplegar un modelo de 35.500 millones de parametros totales (3B activos por token) con vision y contexto de 262.144 tokens en hardware de consumo o en GPUs de 16-32 GB, con soporte nativo para llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa MoE, vision encoder de 27 capas, cabeza MTP especulativa en capa 40 |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); mmproj-f16 (~890 MB). Otras variantes del suite: BF16, NVFP4, W4A16-AWQ |
| Idiomas soportados | Ingles (en), georgiano (ka), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base; tambien NVFP4 y AWQ en otras variantes |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 40 capas y 256 expertos por capa MoE (254 + 2). Los expertos #0..#253 corresponden al nucleo congelado de Kataguru-Sceptic-35B-A3B-v3.1, que conserva intactas las capacidades de razonamiento cientifico, codigo competitivo, tool calling agentico y dominios industriales PLC/CNC. Los expertos #254 y #255 son nuevos: el #254 se especializa en gramatica y morfologia georgiana (alineamiento de caso ergativo escindido kartveliano, screeves de verbo polipersonal, circunfijos y escritura Mkhedruli) ademas de terminologia de ingenieria industrial, medicina clinica y patentes; el #255 cubre prosa literaria, no ficcion, dialogo natural y traduccion fiel EN<->KA.

El entrenamiento de los nuevos expertos se realizo sobre un conjunto de 4.800 muestras doradas verificadas humanamente (100 % de aprobacion en la puerta mecanica y de calidad), con calibracion contrastiva del router (modo `new_experts_only`, `recalibrate-router`, r=32, alpha=64). Se incorpora una plantilla de chat nativa en georgiano (`chat_template.jinja`) con etiquetas de control `/ka`, `/translate` y cabeceras de razonamiento localizadas. La cuantizacion GGUF se calibro con un imatrix especifico de georgiano (`imatrix_calibration_ka.txt`) aplicado a los 256 expertos. Se mantienen sin cambios el encoder de vision multimodal de 27 capas (333 tensores) y la cabeza MTP de decodificacion especulativa (785 tensores).

## Capacidades

- Generacion de texto y razonamiento de nivel graduado en STEM (fisica, quimica, biologia molecular), con GPQA Diamond reportado de 70,20 %.
- Programacion competitiva y algoritmica (LiveCodeBench v6 Pass@1 de 39,43 %, con 90,70 % en dificultad Easy).
- Tool calling / function calling nativo con salida AST en `<tool_call>` y deteccion de irrelevancia (BFCL V4 Single-Turn AST de 83,67 %; Non-Live 88,44 %; deteccion de irrelevancia 80,26 %).
- Vision multimodal: pipeline image-text-to-text con encoder de 27 capas y proyector mmproj-f16.
- Capacidades multilingues nativas en ingles, georgiano y finlandes, con modo georgiano (`/ka`) y modo traduccion de pagina completa (`/translate`) que preserva parrafos y evita charlataneria.
- Traduccion bidireccional EN<->KA fiel, incluyendo prosa literaria, no ficcion y texto tecnico.
- Modos de profundidad de razonamiento configurables: `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.
- Capacidades industriales en dominios PLC/CNC y terminologia clinica, de patentes y estatutaria.

## Casos de uso

- Traduccion profesional EN<->KA de documentacion tecnica y legal: el modo `/translate` genera salida sin charlataneria y preserva la estructura de parrafos, adecuado para contratos, patentes y manuales gracias a los expertos #254 y #255 especializados en terminologia estatutaria y de patentes.
- Localizacion de interfaces y contenido para el mercado georgiano: la plantilla de chat nativa con `/ka` y las cabeceras de razonamiento localizadas permiten integrar el modelo en pipelines de traduccion de producto sin postprocesado de idioma.
- Atencion al cliente multilinguee en georgiano, ingles y finlandes: el contexto de 262.144 tokens permite gestionar conversaciones multi-turno extensas y recuperar historial completo sin truncamiento.
- Agentes con tool calling en produccion: el soporte nativo de `<tool_call>` con AST y deteccion de irrelevancia (BFCL V4 83,67 %) lo hace apto para orquestacion de APIs, automatizacion de flujos y agentes multi-paso.
- Analisis de documentos escaneados con vision: el encoder multimodal de 27 capas y el proyector mmproj permiten extraer y traducir texto de imagenes, facturas o formularios en georgiano e ingles.
- Asistencia a la programacion y revision de codigo: con 39,43 % en LiveCodeBench v6 y 90,70 % en problemas faciles, sirve para autocompletado, generacion de tests y explicacion de algoritmos en pipelines de CI/CD.
- Despliegue en hardware de consumo: la variante APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB, lo que habilita prototipado local con llama.cpp, LM Studio u Ollama sin infraestructura de datacenter.
- Investigacion en NLP kartveliano: los expertos #254 y #255 y el conjunto de 4.800 muestras doradas permiten estudiar morfologia georgiana, alineamiento ergativo y traduccion literaria con un modelo abierto bajo Apache 2.0.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo fundacional | 70,26 % | Heredada intacta via expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % (Non-Live: 88,44 %) | Deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo de georgiano 10/10 (v3.2) | 10/10 PASS (100 %) | Suite de evaluacion NLP georgiana y traduccion literaria/tecnica de pagina completa EN<->KA |

No se han publicado en la informacion disponible resultados desglosados por benchmark individual mas alla de los anteriores, ni comparaciones numericas directas con modelos alternativos.

## Requisitos de hardware

- BF16 completo: ~72 GB de VRAM, requiere 2x GPU de 48-80 GB.
- NVFP4 (~24,3 GB) y W4A16-AWQ (~25,3 GB): 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o 1 GPU de 32 GB.
- GGUF APEX-Small (~11,9 GiB): cabe en GPUs de 12-16 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una sola GPU de 16 GB.
- GGUF APEX-Good (~15,4 GiB): requiere 16-24 GB de VRAM segun overhead de contexto.
- Proyector multimodal mmproj-f16 (~890 MB) adicional para inferencia con vision.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas del repo), vLLM para las variantes AWQ/NVFP4, transformers para el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF | 35,5B | 3B | 262.144 | Apache 2.0 | MoE 256 expertos, vision, georgiano nativo |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,5B | 3B | 262.144 | No disponible | Sin expertos de georgiano; referencia de rendimiento del nucleo |
| Alternativas de 30-40B MoE comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la informacion proporcionada |

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ficcion creativa a temperatura alta: para maxima precision morfologica y correccion en georgiano se recomienda `temperature=0.2-0.3` con `presence_penalty=0.3`; fuera de ese rango la calidad gramatical puede degradarse.
- Riesgo de alucinacion: no se documentan evaluaciones especificas de factualidad o tasa de alucinacion en la informacion disponible.
- Cobertura idiomatica limitada a ingles, georgiano y finlandes; el rendimiento en otros idiomas no esta documentado.
- El conjunto de entrenamiento de georgiano es reducido (4.800 muestras), lo que puede limitar la generalizacion a dominios no cubiertos por los expertos #254 y #255.
- Los benchmarks reportados (GPQA, LiveCodeBench, BFCL) corresponden al nucleo fundacional heredado, no a una evaluacion independiente del modelo completo tras la ampliacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre sesgos, seguridad o idoneidad para produccion.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El modelo base es una variante propia de kataguru sobre arquitectura qwen3_5_moe; la trazabilidad completa de los datos de entrenamiento originales no se detalla en la informacion proporcionada.

## Enlaces

- Hugging Face (este repo GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

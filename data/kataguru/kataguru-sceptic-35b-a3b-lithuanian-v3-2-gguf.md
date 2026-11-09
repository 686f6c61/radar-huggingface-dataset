# kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en lituano, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Su proposito principal es dotar a un modelo generalista de razonamiento, codigo y vision de capacidades nativas de lituano (gramatica, morfologia, traduccion bidireccional EN<->LT y FI<->LT) sin degradar las capacidades originales del modelo base. La version publicada en este repositorio es la cuantizacion GGUF, calibrada con un dataset imatrix especifico de lituano.

La arquitectura es un transformer MoE con 40 capas y 256 expertos por capa: 254 expertos del nucleo original congelados y 2 expertos nuevos dedicados al lituano (uno gramatical-tecnico y otro literario-traductor). El modelo totaliza 35.505.251.456 parametros y activa aproximadamente 3B por token, lo que permite un despliegue relativamente ligero en comparacion con su tamano total. Mantiene la ventana de contexto de 262.144 tokens del modelo base.

La relevancia actual reside en su enfoque de "especializacion sin olvido catastrofico": al congelar el nucleo y anadir expertos especificos, el autor afirma conservar intactos los benchmarks del modelo base (media de 70,26 % en 15 benchmarks, GPQA Diamond 70,20 %, BFCL V4 83,67 %) mientras se anade competencia real en lituano. Es una propuesta interesante para quienes necesitan un modelo soberano de una lengua baltica con capacidades multimodales y de razonamiento avanzado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa (254 congelados + 2 nuevos) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio (APEX-Small ~11,9 GiB, APEX-Medium ~13,6 GiB, APEX-Good ~15,4 GiB) + mmproj-f16 (~890 MB); el ecosistema incluye BF16, NVFP4 y W4A16-AWQ |
| Idiomas soportados | en, lt, fi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors BF16, NVFP4 y AWQ en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE de 40 capas con 256 expertos por capa. La innovacion clave es la estrategia de expansion: los expertos #0 a #253 del modelo base v3.1 se mantienen completamente congelados, preservando el razonamiento cientifico, el codigo competitivo, el tool calling agentico y las capacidades industriales (PLC/CNC). Se anaden dos expertos nuevos: el #254 especializado en gramatica lituana (7 casos gramaticales, aspecto verbal baltico, declinacion nominal compleja) y terminologia tecnica, clinica y legal; y el #255 orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN<->LT.

El entrenamiento de los nuevos expertos se realizo sobre un conjunto de 5.075 muestras doradas verificadas humanamente, con calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). Se incluye una plantilla de chat nativa en lituano con etiquetas de control (`/lt`, `/translate`) y cabeceras de razonamiento localizadas. La cuantizacion GGUF se calibro con un fichero imatrix especifico de lituano (`imatrix_calibration_lt.txt`) aplicado a los 256 expertos. Se conservan el encoder de vision multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores).

## Capacidades

- Generacion de texto y razonamiento de nivel avanzado, heredado del nucleo congelado (GPQA Diamond 70,20 %).
- Codigo competitivo y algoritmico (LiveCodeBench v6 Pass@1 39,43 %, con 90,70 % en problemas faciles).
- Tool calling nativo con formato `<tool_call>` y deteccion de irrelevancia (BFCL V4 AST 83,67 %).
- Vision multimodal: procesamiento de imagen y texto mediante encoder de 27 capas y proyector mmproj.
- Razonamiento multi-paso y modo agente, con niveles de profundidad configurables (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).
- Traduccion bidireccional EN<->LT y FI<->LT en modo pagina completa con preservacion de parrafos (`/translate`).
- Competencia nativa en lituano: morfologia, 7 casos gramaticales, aspecto verbal y declinacion.
- Capacidades multilingues en ingles, lituano y finlandes.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traduccion profesional EN<->LT de documentacion tecnica y legal: el modo `/translate` preserva estructura de parrafos y terminologia estatutaria o de patentes gracias al experto #254, adecuado para despachos y administraciones publicas lituanas.
- Localizacion de productos al lituano: el experto #255 permite adaptar prosa de marketing, dialogos de interfaz y no ficcion con registro natural, manteniendo coherencia morfologica a temperatura baja.
- Atencion al cliente en lituano: conversaciones multi-turno con 262.144 tokens de contexto permiten arrastrar historial extenso y documentacion de producto sin truncamiento.
- Agentes automatizados con tool calling: el 83,67 % en BFCL V4 permite integrar el modelo en pipelines que invocan APIs, bases de datos o sistemas internos, con deteccion de llamadas irrelevantes.
- Analisis de documentos escaneados en lituano: la combinacion de vision (encoder de 27 capas) y comprension linguistica permite extraer y resumir informacion de facturas, contratos o formularios.
- Asistencia a desarrolladores en entornos balticos: generacion y revision de codigo con comentarios y documentacion en lituano, aprovechando el rendimiento en LiveCodeBench y el soporte de razonamiento profundo.
- Investigacion academica en linguistica baltica: analisis morfologico, generacion de paradigmas y contraste de traducciones con el modo de razonamiento profundo activado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media 15 benchmarks (nucleo) | 70,26 % | Heredado intacto del v3.1 |
| GPQA Diamond | 70,20 % (139/198) | STEM nivel doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; irrelevancia: 80,26 % |
| Auditoria lituana 10/10 (v3.2) | 10/10 PASS | MMLU-LT, ARC-LT, GSM8K-LT, TruthfulQA-LT y traduccion de pagina completa |

No se han publicado resultados desglosados por benchmark individual de la auditoria lituana en la informacion disponible; solo se indica el resultado agregado de 10/10.

## Requisitos de hardware

- BF16 completo: ~72 GB de VRAM (2x GPU de 48-80 GB).
- NVFP4 o W4A16-AWQ: 2x RTX 5090 de 32 GB con TP=2, o 1 GPU de 32 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una unica GPU de 16 GB.
- GGUF APEX-Small (~11,9 GiB): viable en GPUs consumer de 12-16 GB con margen ajustado.
- GGUF APEX-Good (~15,4 GiB): requiere 16 GB o mas; anadir ~890 MB para el proyector mmproj si se usa vision.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas declaradas), vLLM para las variantes AWQ/NVFP4, y transformers para BF16.
- Latencia y throughput: no disponibles en la informacion proporcionada; al activar solo ~3B parametros por token, el rendimiento esperado es sustancialmente superior al de un denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 | 35,5B totales / ~3B activos | 262.144 | Apache 2.0 | Especializado en lituano, multimodal, MoE con nucleo congelado |
| Qwen3-MoE (familia base, referencia) | ~30B totales / ~3B activos | 262.144 (segun variante) | Apache 2.0 | Base arquitectonica; sin especializacion en lituano |
| Modelos densos de 30-35B (p. ej. Qwen2.5-32B) | 32B densos | 32.768-131.072 | Apache 2.0 | Mayor coste de inferencia por token al activar todos los parametros |

No se dispone de comparativas publicadas frente a otros modelos especializados en lituano en la informacion proporcionada. La comparacion con la familia Qwen3-MoE es por herencia arquitectonica declarada en las etiquetas (`qwen3_5_moe`), no por evaluacion directa.

## Limitaciones y advertencias

- En ficcion creativa a temperatura alta puede perder precision morfologica; el autor recomienda `temperature=0,2-0,3` con `presence_penalty=0,3` para tareas de correccion y proofreading.
- El entrenamiento de los expertos lituanos se basa en solo 5.075 muestras verificadas; la cobertura de dominios especializados puede ser limitada frente a modelos entrenados con corpus masivos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en terminologia legal, medica o de patentes; requiere verificacion humana en produccion.
- El soporte linguistico se limita a en, lt y fi; el rendimiento en otras lenguas no esta garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no evaluados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El contexto de 262.144 tokens puede degradar la calidad en los extremos de la ventana; no se aportan pruebas de aguja en pajar para esta variante.
- La fecha de creacion del repositorio (2026-11-09) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF
- Pesos BF16 maestros: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

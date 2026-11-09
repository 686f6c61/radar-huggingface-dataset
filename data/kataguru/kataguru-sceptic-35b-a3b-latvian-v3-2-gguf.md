# kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Latvian-v3.2, un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) especializado en letón. Lo desarrolla el autor independiente kataguru sobre su fundacion Kataguru-Sceptic-35B-A3B-v3.1 y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de dotar a un modelo generalista de razonamiento, codigo y vision de una competencia nativa en letón sin sacrificar las capacidades originales.

La arquitectura parte de la base Sceptic, que segun la model card emplea 254 expertos enrutados por capa (mas 2 expertos adicionales en esta version, hasta 256) con 3B de parametros activos por token sobre un total de 35.505.251.456 parametros. La innovacion de esta version consiste en anadir dos expertos dedicados al letón (gramatica y morfologia tecnica, y literatura y traduccion bidireccional) manteniendo congelados los 254 expertos originales para evitar el olvido catastrofico.

Es relevante para desarrolladores e investigadores que necesiten un modelo de ~35B con contexto declarado de 262.144 tokens, capacidades multimodales de imagen-texto, tool calling y razonamiento, con soporte nativo de letón, ingles y fines. Esta release GGUF incluye tres niveles de cuantizacion calibrados con imatrix en letón y un proyector multimodal separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos por capa, 40 capas, base qwen3_5_moe |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens (segun model card) |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); calibrado con imatrix en letón; proyector mmproj-f16.gguf (~890 MB) |
| Idiomas soportados | Ingles (en), letón (lv), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 corresponden al nucleo congelado de Kataguru-Sceptic-35B-A3B-v3.1, que aporta razonamiento cientifico, codigo competitivo, tool calling agentico y capacidades industriales (PLC/CNC). Los expertos #254 y #255 son nuevos: el primero cubre gramatica y morfologia letonas (7 casos gramaticales, 6 clases de declinacion nominal, alternancias palatalizacion baltica, modos verbales debitive y relativo) junto con terminologia tecnica industrial, clinica y legal; el segundo cubre prosa literaria, no ficcion y traduccion fiel EN <-> LV.

El entrenamiento de los nuevos expertos se realizo sobre un banco de 4.805 muestras verificadas humanamente, con calibracion contrastiva del enrutador (modo new_experts_only, recalibracion del router con r=32, alpha=64). Se mantienen intactos el codificador de vision multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores). La cuantizacion GGUF se calibro con un fichero imatrix especifico en letón aplicado a los 256 expertos. La model card no detalla el volumen total de tokens de preentrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto, razonamiento de nivel doctoral en STEM (fisica, quimica, biologia molecular) y codigo algoritmico competitivo.
- Vision multimodal: pipeline image-text-to-text con codificador de vision de 27 capas.
- Tool calling nativo con deteccion de irrelevancia y salida AST de llamadas a herramientas.
- Modo de traduccion de pagina completa EN <-> LV con preservacion de parrafos y sin charla adicional (etiqueta /translate).
- Modo nativo de letón mediante prefijo /lv o chat_template_kwargs con response_language.
- Control de profundidad de razonamiento con etiquetas {REASON:spoon}, {REASON:einstein}, {REASON:007}, {REASON:deep}, {REASON:low} y {REASON:off}.
- Capacidades multilingues en ingles, letón y fines.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traduccion profesional EN <-> LV: el modo /translate genera traducciones de pagina completa preservando estructura de parrafos y sin texto conversacional anadido, adecuado para documentacion tecnica y literatura.
- Atencion al cliente en letón: el experto #254 aporta correccion morfologica y el contexto de 262.144 tokens permite conversaciones multi-turno con historial extenso.
- Procesamiento de documentos tecnicos industriales: terminologia PLC/CNC y clinica cubierta por el experto #254, con entrada de imagenes de esquemas o capturas mediante el proyector multimodal.
- Agentes automatizados con herramientas: el soporte de tool calling con deteccion de irrelevancia permite integrar el modelo en pipelines de automatizacion que requieran decidir cuando invocar funciones externas.
- Analisis de imagenes con salida en letón: el pipeline image-text-to-text permite describir o extraer informacion de imagenes y responder en letón nativo.
- Generacion y revision de codigo: el nucleo congelado mantiene capacidades de programacion algoritmica, util para asistentes de codigo en entornos con requisitos de licencia permisiva.
- Despliegue en hardware de consumo: las variantes APEX-Small y APEX-Medium permiten ejecutar el modelo en una sola GPU de 16 GB mediante llama.cpp, LM Studio u Ollama.

## Benchmarks y rendimiento

Resultados publicados en la model card, heredados del nucleo congelado y de la auditoria de la version letona:

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto de los expertos #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM de nivel doctoral |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo de leton 10/10 | 10/10 PASS (100 %) | MMLU-LV, ARC-LV, Commonsense-LV y traduccion literaria/tecnica EN <-> LV |

No se han publicado en la informacion disponible resultados desglosados por benchmark de las variantes GGUF concretas ni comparaciones directas con modelos de terceros.

## Requisitos de hardware

- BF16 completo: ~72 GB de VRAM (2x GPU de 48-80 GB).
- NVFP4 / W4A16-AWQ: 2x RTX 5090 de 32 GB con TP=2, o 1 GPU de 32 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una sola GPU de 16 GB.
- GGUF APEX-Small (~11,9 GiB) y APEX-Good (~15,4 GiB): opciones adicionales de equilibrio tamano/calidad; el proyector mmproj-f16.gguf anade ~890 MB.
- Despliegue: llama.cpp, LM Studio, Ollama y vLLM (para las variantes AWQ). La model card etiqueta el repo como compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF | 35,5B totales / 3B activos | 262.144 | Apache 2.0 | Especializado en leton, multimodal, GGUF |
| Kataguru-Sceptic-35B-A3B-v2.6-GGUF | 35B / 3B activos, 254 expertos | no disponible | no disponible | Version bilingue ingles-finlandes del mismo autor |
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF | 35B / 3B activos | no disponible | no disponible | Version especializada en hungaro del mismo autor |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros desarrolladores de tamano o tarea equivalentes.

## Limitaciones y advertencias

- En ficcion creativa con temperatura alta puede perder precision morfologica; la model card recomienda temperature=0.2-0.3 y presence_penalty=0.3 para tareas de correccion en leton.
- El modelo hereda los sesgos del corpus de preentrenamiento del modelo base, no detallados en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de factualidad.
- El soporte linguistico se limita a ingles, leton y fines; el rendimiento en otros idiomas no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre los datos de entrenamiento.
- Las cifras de benchmarks corresponden al nucleo base y a la auditoria del autor; no hay verificacion independiente disponible.
- El contexto declarado de 262.144 tokens no esta validado en las variantes GGUF dentro de la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version previa bilingue EN-FI: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Version hungara: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF
- Ficha en OpenModelStats: https://openmodelstats.com/models/kataguru/qwen3.5-35b-a3b-sceptic-v3-1m-gguf

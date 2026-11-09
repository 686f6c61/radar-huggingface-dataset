# kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4 es una cuantización NVFP4 de un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) especializado en húngaro, desarrollado por el autor kataguru. El modelo parte de la base Kataguru-Sceptic-35B-A3B-v3.1 y añade dos expertos dedicados al húngaro sobre una arquitectura de 256 expertos por capa (254 congelados y 2 nuevos), con 40 capas y unos 35 951 millones de parámetros totales. Está pensado para razonamiento científico, programación competitiva, tool calling y traducción bidireccional inglés-húngaro, incluyendo traducción de página completa.

La versión NVFP4 emplea el formato de compresión `compressed-tensors` calibrado para húngaro, reduciendo el peso del repositorio a unos 25,6 GB (frente a los ~67,5 GB del maestro BF16). Está orientada a GPUs Blackwell con soporte nativo de FP4, lo que permite desplegar el modelo en configuraciones de 1-2 GPUs de 32 GB mediante tensor parallelism. Mantiene la ventana de contexto de 262 144 tokens, el codificador de visión multimodal y la cabeza especulativa MTP de la capa 40.

La relevancia actual reside en la combinación de un modelo MoE grande con especialización lingüística soberana para húngaro, cuantización de precisión ultra-baja nativa para hardware Blackwell y preservación íntegra de las capacidades del modelo base mediante el congelado de los 254 expertos originales. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa (254 congelados + 2 nuevos), codificador de visión de 27 capas, cabeza especulativa MTP en capa 40 |
| Parametros totales | 35 951 822 704 (~35,95 B) |
| Parametros activos | 3 B por token (A3B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, `compressed-tensors`, ~24,3 GB); existen variantes BF16 (~67,5 GB), W4A16-AWQ (~25,3 GB) y GGUF (APEX-Small/Medium/Good + mmproj) |
| Idiomas soportados | Inglés (en), húngaro (hu), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, compressed-tensors NVFP4); variantes GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer MoE derivado de qwen3_5_moe con 40 capas y 256 expertos por capa. La innovación principal de la versión v3.2 es la estrategia de congelado: los expertos #0 a #253 del modelo base Sceptic 35B-A3B v3.1 se mantienen intactos, de modo que las capacidades de razonamiento científico, código y tool calling no sufren olvido catastrófico. Solo se entrenan dos expertos nuevos: el #254, especializado en gramática y morfología húngara (18 casos gramaticales, armonía vocálica, conjugación definida/indefinida, cadenas de sufijos urálicos, terminología técnica industrial, médica y legal) y el #255, dedicado a prosa literaria, no ficción, diálogo natural y traducción fiel EN↔HU.

El conjunto de entrenamiento de la banca lingüística consta de 5062 muestras doradas verificadas humanamente, con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). Incluye una plantilla de chat nativa en húngaro (`chat_template.jinja`) con etiquetas de control `/hu`, `/translate` y cabeceras de razonamiento localizadas, además de una calibración de cuantización específica en húngaro (`calib_nvfp4_awq_256_hu.jsonl` e `imatrix_calibration_hu.txt`) con anclaje STEM/coding. No se modificaron los 254 expertos núcleo, el codificador de visión de 27 capas (333 tensores), la cabeza especulativa MTP (785 tensores) ni la ventana de contexto.

## Capacidades

- Generación de texto y razonamiento científico de nivel de posgrado (física, química, biología molecular) heredado de los expertos congelados.
- Programación competitiva y algorítmica (LiveCodeBench v6) y tool calling nativo con AST `<tool_call>` y detección de irrelevancia.
- Razonamiento agéntico multi-paso y function calling (BFCL V4).
- Capacidades multimodales de visión: pipeline image-text-to-text con codificador de visión de 27 capas.
- Traducción bidireccional inglés-húngaro de página completa en modo `/translate`, con preservación de párrafos y cero charlatanería.
- Modo de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Soporte multilingüe en inglés, húngaro y finés, con plantilla de chat nativa para húngaro.
- Decodificación especulativa mediante cabeza MTP en la capa 40.
- Terminología especializada en ingeniería industrial, PLC/CNC, medicina clínica y patentes.

## Casos de uso

- Traducción profesional EN↔HU de documentos completos: el modo `/translate` produce traducción de página completa preservando estructura de párrafos y sin texto conversacional añadido, adecuado para editoriales, despachos legales y documentación técnica.
- Localización de documentación técnica industrial: el experto #254 cubre terminología PLC/CNC y de patentes, lo que permite traducir manuales de maquinaria y especificaciones de automatización con vocabulario consistente.
- Redacción y revisión editorial en húngaro: el experto #255 gestiona prosa literaria, no ficción y diálogo natural, útil para corrección morfológica y estilística con temperatura baja (0,2-0,3) y `presence_penalty=0,3`.
- Asistente de atención al cliente en húngaro: con 262 144 tokens de contexto puede mantener conversaciones multi-turno largas y consultar documentación extensa en la misma ventana.
- Análisis de documentos escaneados y capturas: el codificador de visión de 27 capas permite extraer y razonar sobre contenido visual combinado con texto, por ejemplo en digitalización de archivos administrativos húngaros.
- Agentes de automatización con tool calling: BFCL V4 AST de 83,67 % permite integrar el modelo en pipelines que invocan APIs, bases de datos o sistemas de tickets con detección de irrelevancia.
- Evaluación de código y asistencia algorítmica: LiveCodeBench v6 y un 90,70 % en dificultad Easy lo hacen viable para revisión de parches y generación de soluciones en entornos de CI/CD.
- Investigación académica en húngaro: razonamiento STEM de nivel GPQA Diamond combinado con vocabulario técnico nativo para apoyo a revisión bibliográfica y síntesis.

## Benchmarks y rendimiento

| Benchmark / capacidad | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado íntegro mediante expertos congelados #0-#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programación algorítmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % (Non-Live: 88,44 %) | AST `<tool_call>` nativo; detección de irrelevancia 80,26 % |
| Auditoría en vivo de húngaro 10/10 (v3.2) | 10/10 PASS (100 %) | NYTK HuMMLU, HuCOLA, HuBoolQ y traducción literaria/técnica EN↔HU |

## Requisitos de hardware

- VRAM para BF16 completo: ~72 GB, requiere 2 GPUs de 48-80 GB.
- VRAM para NVFP4: ~24,3 GB de pesos; funciona en 2× RTX 5090 de 32 GB con TP=2 o en 1 GPU de 32 GB compatible con FP4 (Blackwell).
- VRAM para W4A16-AWQ: ~25,3 GB, compatible con vLLM universal.
- VRAM para GGUF APEX-Medium: ~13,6 GiB, cabe en una única GPU de 16 GB.
- GPUs recomendadas: Blackwell (RTX 5090, B200) para NVFP4 nativo; A100/H100 para BF16 o AWQ; RTX 4090/3090 para GGUF.
- Opciones de despliegue: transformers con `compressed-tensors` para NVFP4, vLLM para W4A16-AWQ, llama.cpp/Ollama para GGUF con `mmproj` para visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4 | ~35,95 B | 3 B | 262 144 | Apache 2.0 | NVFP4, BF16, AWQ, GGUF |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | ~35,95 B | 3 B | 262 144 | Apache 2.0 (según repo base) | BF16 y derivados |
| Modelos MoE de ~30-40 B con ~3 B activos de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ficción creativa a temperatura alta: para precisión morfológica y corrección en húngaro se recomienda temperatura 0,2-0,3 con `presence_penalty=0,3`; valores altos degradan la calidad.
- La cuantización NVFP4 exige hardware Blackwell con soporte FP4 nativo; en GPUs anteriores hay que recurrir a W4A16-AWQ o GGUF.
- Riesgo de alucinación inherente a modelos generativos, especialmente en terminología legal, médica o de patentes, donde se recomienda verificación humana.
- Cobertura lingüística limitada a inglés, húngaro y finés; otros idiomas no están garantizados.
- El modelo base y sus expertos congelados pueden arrastrar sesgos presentes en los datos originales de entrenamiento; no se documentan sesgos específicos en la información disponible.
- El repositorio NVFP4 tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base v3.1 y de los componentes de terceros.

## Enlaces

- Modelo NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4
- Pesos maestros BF16 v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ
- Variante GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF
- Modelo base v3.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

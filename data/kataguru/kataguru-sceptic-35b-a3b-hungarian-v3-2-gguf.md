# kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF es la distribucion cuantizada en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Hungarian-v3.2, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en hungaro, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. El modelo anade dos expertos dedicados al hungaro (expertos #254 y #255) sobre los 254 expertos congelados del modelo base, alcanzando 256 expertos por capa en 40 capas. Resuelve el problema de la baja calidad de los modelos generalistas en hungaro, un idioma urálico con 18 casos gramaticales y armonia vocal, manteniendo intactas las capacidades de razonamiento cientifico, codigo y tool calling del modelo base.

La relevancia de esta publicacion reside en su enfoque de cuantizacion calibrada especificamente para hungaro: los tres niveles GGUF del "APEX-Trio" (APEX-Small, APEX-Medium y APEX-Good) se han calibrado con un fichero imatrix propio del hungaro (`imatrix_calibration_hu.txt`), aplicado a los 256 expertos. Ademas, el modelo conserva el encoder de vision multimodal de 27 capas y la cabeza especulativa MTP de la capa 40, lo que permite traduccion de pagina completa con vision y decodificacion especulativa.

El modelo tiene 35.505.251.456 parametros totales (unos 35,5 mil millones) con 3 mil millones de parametros activos por token, una ventana de contexto de 262.144 tokens y licencia Apache 2.0. El repositorio GGUF ocupa 45,4 GB e incluye el proyector multimodal `mmproj-f16.gguf` de aproximadamente 890 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 40 capas, 256 expertos por capa, con encoder de vision multimodal de 27 capas y cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.505.251.456 (unos 35,5 mil millones) |
| Parametros activos | 3 mil millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); proyector `mmproj-f16.gguf` (~890 MB). La suite oficial incluye ademas BF16 (~67,5 GB), NVFP4 (~24,3 GB) y W4A16-AWQ (~25,3 GB) |
| Idiomas soportados | Ingles (en), hungaro (hu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en BF16, NVFP4 y W4A16-AWQ en los repos de la suite oficial |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La arquitectura parte del modelo base Kataguru-Sceptic-35B-A3B-v3.1, cuyos 254 expertos nucleo (numerados #0 a #253) permanecen congelados al 100 %, preservando las capacidades de razonamiento cientifico, codigo competitivo, tool calling agentico y control industrial PLC/CNC. Sobre esa base se anaden dos expertos nuevos: el experto #254, especializado en gramatica y morfologia hungara (18 casos gramaticales, armonia vocal anterior/posterior/redondeada, conjugacion verbal definida frente a indefinida, cadenas de sufijos uralicos) y terminologia tecnica industrial, clinica y legal; y el experto #255, orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN <-> HU.

El entrenamiento de los nuevos expertos se realizo con un banco de 5.062 muestras doradas verificadas humanamente, con un 100 % de aprobado en los controles de calidad mecanicos, mas calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). El modelo incluye una plantilla de chat nativa en hungaro (`chat_template.jinja`) con modos `/hu` y `/translate` y cabeceras de razonamiento localizadas. La cuantizacion GGUF se calibro con un imatrix especifico de hungaro aplicado a los 256 expertos, y la suite oficial incluye calibracion dedicada NVFP4/AWQ (`calib_nvfp4_awq_256_hu.jsonl`). Se conservan sin cambios el encoder de vision de 27 capas (333 tensores), la cabeza especulativa MTP (785 tensores) y la ventana de contexto de 262.144 tokens.

## Capacidades

- Generacion de texto y razonamiento en hungaro, ingles y finlandes.
- Razonamiento cientifico de nivel doctorado (herencia del modelo base: GPQA Diamond 70,20 %).
- Programacion competitiva y algoritmica (LiveCodeBench v6 Pass@1 39,43 %).
- Tool calling / function calling nativo con deteccion de irrelevancia (BFCL V4 AST 83,67 %).
- Razonamiento multi-paso y flujos agenticos.
- Vision multimodal: entrada image-text-to-text mediante el proyector `mmproj-f16.gguf`.
- Traduccion bidireccional EN <-> HU de pagina completa con modo `/translate` (sin charla adicional, preservando parrafos).
- Modos de profundidad de razonamiento configurables: `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Capacidades industriales heredadas: PLC/CNC, terminologia clinica y legal/patentaria.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traduccion profesional EN <-> HU de pagina completa: el modo `/translate` produce traduccion sin charla adicional y preserva la estructura de parrafos, adecuado para editoriales, agencias de traduccion y documentacion tecnica.
- Localizacion de documentacion tecnica e industrial: el experto #254 cubre terminologia PLC/CNC, clinica y legal/patentaria, lo que permite traducir manuales tecnicos y expedientes con terminologia consistente.
- Atencion al cliente en hungaro: el modelo gestiona conversaciones multi-turno con 262.144 tokens de contexto y plantilla de chat nativa en hungaro, manteniendo coherencia morfologica en respuestas largas.
- Procesamiento de documentos escaneados con vision: el encoder multimodal de 27 capas permite extraer y traducir texto de imagenes y PDFs renderizados, combinando OCR implicito con traduccion.
- Asistentes de codigo para desarrolladores hungaros: hereda LiveCodeBench v6 39,43 % y soporte de tool calling, integrable en pipelines que requieran explicaciones en hungaro del codigo generado.
- Agentes automatizados con function calling: BFCL V4 AST 83,67 % y deteccion de irrelevancia 80,26 % permiten construir agentes que deciden cuando invocar herramientas y cuando responder directamente.
- Generacion de contenido editorial en hungaro: prosa literaria y no ficcion mediante el experto #255, con control de temperatura recomendado de 0,2-0,3 y `presence_penalty=0.3` para precision morfologica.
- Despliegue en hardware de consumo: la variante APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB, lo que habilita prototipado local en hungaro sin infraestructura de datacenter.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto via expertos congelados #0-#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % (Non-Live: 88,44 %) | AST nativo `<tool_call>`; deteccion de irrelevancia 80,26 % |
| Auditoria en vivo hungaro 10/10 (v3.2) | 10/10 PASS (100 %) | NYTK HuMMLU, HuCOLA, HuBoolQ y traduccion literaria/tecnica EN <-> HU de pagina completa |

No se han publicado en la informacion disponible resultados desglosados por benchmark individual mas alla de los recogidos en la tabla anterior.

## Requisitos de hardware

- BF16 completo: aproximadamente 72 GB de VRAM, requiere 2 GPU de 48-80 GB.
- NVFP4 o W4A16-AWQ: funciona en 2x RTX 5090 de 32 GB (TP=2) o en una unica GPU de 32 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una unica GPU de 16 GB.
- GGUF APEX-Small (~11,9 GiB) y APEX-Good (~15,4 GiB): el primero reduce aun mas el requisito de VRAM; el segundo ofrece mayor calidad dentro de la misma familia GGUF.
- Proyector multimodal: anadir aproximadamente 890 MB para `mmproj-f16.gguf` si se usa vision.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas declaradas en el repo), y las variantes NVFP4/W4A16-AWQ para vLLM. El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Especializacion |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2 | 35,5 B | 3 B | 262.144 | Apache 2.0 | Hungaro + vision + traduccion |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,5 B | 3 B | 262.144 | no disponible en la informacion | Razonamiento general, sin expertos hungaros |
| Modelos densos de ~30-35 B de proposito general | ~30-35 B | ~30-35 B | variable | variable | Generico, sin especializacion en hungaro |

La comparacion con alternativas de la misma categoria (modelos MoE de ~35 B totales y ~3 B activos especializados en lenguas minoritarias) no esta disponible en la informacion proporcionada. El modelo base Kataguru-Sceptic-35B-A3B-v3.1 es el referente directo: comparte arquitectura y benchmarks nucleo, pero carece de los expertos #254 y #255 y de la calibracion hungara.

## Limitaciones y advertencias

- Ficcion creativa a temperatura alta: para precision morfologica y correccion en hungaro se recomienda `temperature=0.2-0.3` con `presence_penalty=0.3`; temperaturas superiores degradan la calidad morfologica.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de tasas de alucinacion en la informacion disponible; como modelo generativo, el riesgo persiste especialmente en terminologia tecnica especializada.
- Cobertura limitada de idiomas: solo se declaran ingles, hungaro y finlandes; no hay soporte documentado para castellano ni otras lenguas.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales documentadas, pero el modelo base y los datos de entrenamiento pueden imponer obligaciones no reflejadas en la model card.
- Requisito de VRAM: el BF16 completo exige ~72 GB, lo que limita el despliegue en produccion a configuraciones multi-GPU o a las variantes cuantizadas.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La model card esta redactada mayoritariamente en ingles con resumenes en hungaro y finlandes; la documentacion en castellano no existe.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

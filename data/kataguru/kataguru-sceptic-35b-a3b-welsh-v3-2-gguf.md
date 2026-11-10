# kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Welsh-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en galés (Cymraeg), desarrollado por kataguru. Se construye sobre la base Kataguru-Sceptic-35B-A3B-v3.1, un modelo de 35.505.251.456 parámetros totales con 3.000 millones de parámetros activos por token y una ventana de contexto de 262.144 tokens. La versión v3.2 amplía la arquitectura MoE original de 254 expertos añadiendo dos expertos dedicados al galés (expertos #254 y #255), manteniendo congelados los 254 expertos originales para evitar el olvido catastrófico de las capacidades de razonamiento científico, programación y tool calling.

El modelo resuelve el problema de dotar a un modelo fundacional de capacidades sólidas en galés —una lengua de recursos limitados— sin degradar su rendimiento general. Combina traducción bidireccional EN<->CY, generación de prosa literaria y no ficción, morfología galesa (mutaciones consonánticas iniciales, sintaxis VSO, preposiciones flexionadas) y terminología técnica (industrial, PLC/CNC, medicina clínica, patentes). Además, es multimodal: incorpora un codificador de visión de 27 capas y una cabecera especulativa MTP en la capa 40.

Esta ficha documenta la variante GGUF del repositorio, publicada en tres cuantizaciones calibradas con imatrix en galés (APEX-Small, APEX-Medium, APEX-Good) más un proyector multimodal `mmproj-f16.gguf`. Es relevante ahora porque demuestra una estrategia de especialización lingüística mediante expansión de expertos MoE con congelación del núcleo, preservando benchmarks como GPQA Diamond (70,20 %) o BFCL V4 (83,67 %) mientras se añade una lengua de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 256 expertos por capa, 40 capas; transformer con codificador de visión de 27 capas y cabecera especulativa MTP en capa 40 |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); además NVFP4 (~24,3 GB) y W4A16-AWQ (~25,3 GB) en otras variantes del suite |
| Idiomas soportados | inglés (en), galés (cy), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el maestro BF16 (~67,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 corresponden al núcleo congelado del modelo base Sceptic 35B-A3B v3.1, que aporta razonamiento científico, programación competitiva, tool calling agéntico y capacidades industriales PLC/CNC. Los expertos #254 y #255 se añaden en esta versión: el #254 se especializa en gramática y morfología galesa (mutaciones iniciales suave, nasal y aspirada; sintaxis VSO; preposiciones flexionadas) y terminología técnica; el #255 cubre literatura, no ficción, diálogo natural y traducción bidireccional EN<->CY.

El entrenamiento de los nuevos expertos se realizó con un banco de 4.845 muestras doradas verificadas humanamente (100 % de aprobación en la puerta de calidad mecánica) más calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). Se añadió una plantilla de chat nativa en galés (`chat_template.jinja`) con modos `/cy` y `/translate`, cabeceras de razonamiento localizadas y una calibración de cuantización específica en galés (`calib_nvfp4_awq_256_cy.jsonl` e `imatrix_calibration_cy.txt`). La cuantización GGUF APEX-Trio se calibró con imatrix en galés sobre los 256 expertos. No se modificaron los 254 expertos centrales, el codificador de visión de 27 capas (333 tensores), la cabecera MTP especulativa (785 tensores) ni la ventana de contexto.

## Capacidades

- Generación de texto, razonamiento científico de nivel de posgrado y matemáticas (hereda GPQA Diamond 70,20 %).
- Programación competitiva y algoritmos (LiveCodeBench v6 Pass@1 39,43 %, Easy 90,70 %).
- Tool calling nativo con `<tool_call>` en formato AST y detección de irrelevancia (BFCL V4 Single-Turn AST 83,67 %, Non-Live 88,44 %, irrelevancia 80,26 %).
- Razonamiento agéntico multi-paso y modos de profundidad de razonamiento configurables (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).
- Capacidades multimodales de visión: entrada image-text-to-text mediante el proyector `mmproj-f16.gguf`.
- Traducción bidireccional EN<->CY de página completa en modo `/translate`, con preservación de párrafos y sin charlatanería.
- Generación nativa en galés mediante el prefijo `/cy` o `chat_template_kwargs={"response_language": "cy"}`.
- Capacidades multilingües en inglés, galés y finés.
- Capacidades industriales especializadas: PLC/CNC, medicina clínica y terminología estatutaria/de patentes.

## Casos de uso

- Traducción profesional EN<->CY de documentación técnica y literaria: el modo `/translate` produce traducción de página completa preservando párrafos, adecuado para editoriales, administraciones públicas galesas y localización de manuales técnicos.
- Localización de software y documentación al galés: el experto #254 cubre morfología y terminología técnica, lo que permite traducir cadenas de interfaz y documentación de producto con coherencia gramatical.
- Redacción y revisión de prosa literaria en galés: el experto #255 gestiona prosa literaria, no ficción y diálogo natural, útil para editoriales y creadores de contenido que necesitan texto nativo con control de temperatura baja (0,2-0,3) para precisión morfológica.
- Asistencia técnica bilingüe en entornos industriales: el modelo hereda capacidades PLC/CNC y puede atender consultas técnicas en inglés o galés sobre automatización industrial, con tool calling para consultar manuales o sistemas.
- Atención al ciudadano en galés: conversaciones multi-turno con contexto de 262.144 tokens permiten gestionar expedientes largos y mantener coherencia en intercambios extensos, con detección de irrelevancia para filtrar consultas fuera de dominio.
- Agente de soporte con tool calling: BFCL V4 AST 83,67 % permite integrar el modelo en pipelines agénticos que invocan APIs, consultan bases de datos o ejecutan flujos multi-paso en entornos bilingües inglés/galés.
- Análisis de documentos escaneados con visión: el pipeline image-text-to-text y el proyector multimodal permiten extraer y traducir texto de imágenes, útil para digitalización de archivos y formularios en galés.
- Evaluación y generación de código en contextos galeses: LiveCodeBench v6 39,43 % y el núcleo congelado permiten asistir en programación con comentarios y explicaciones en galés.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto vía expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 Pass@1 | 39,43 % (Easy: 90,70 %) | Programación algorítmica competitiva |
| BFCL V4 Single-Turn AST | 83,67 % (Non-Live: 88,44 %) | Tool calling; detección de irrelevancia 80,26 % |
| Auditoría en vivo Welsh 10/10 (v3.2) | 10/10 PASS (100 %) | Suite Techiaith (COPA-cy, WNLI-cy, MGSM-cy) y traducción literaria/técnica EN<->CY |

## Requisitos de hardware

- BF16 completo: ~72 GB de VRAM (2x GPU de 48-80 GB).
- NVFP4 o W4A16-AWQ: 2x RTX 5090 de 32 GB con TP=2, o 1 GPU de 32 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una GPU consumer de 16 GB.
- GGUF APEX-Small (~11,9 GiB) y APEX-Good (~15,4 GiB): opciones para GPUs de 12-16 GB y 16-24 GB respectivamente, según margen para contexto.
- Proyector multimodal `mmproj-f16.gguf` (~890 MB) adicional para entrada de imágenes.
- Despliegue: llama.cpp, LM Studio, Ollama (etiquetas del repo), vLLM (variantes W4A16-AWQ y NVFP4), transformers para pesos safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2 | 35,5 B totales / 3 B activos | 262.144 | Apache 2.0 | GGUF, NVFP4, AWQ, BF16 |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,5 B totales / 3 B activos | 262.144 | Apache 2.0 (según repo base) | safetensors y derivados |
| Alternativas de especialización en galés | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ficción creativa a temperatura alta: para precisión morfológica y corrección de pruebas en galés se recomienda `temperature=0.2–0.3` con `presence_penalty=0.3`.
- Riesgo de alucinación: no se documenta una tasa específica; el modelo hereda el comportamiento del núcleo Sceptic sin garantías de veracidad factual.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Cobertura lingüística limitada a inglés, galés y finés; el rendimiento fuera de estas lenguas no está documentado.
- La especialización en galés se apoya en un banco de 4.845 muestras; dominios muy especializados pueden quedar fuera de cobertura.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes multimodales.
- El modelo base v3.1 y los expertos congelados conservan sus propias limitaciones, no evaluadas en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Papers, blogs, repos y demos adicionales: no disponible

# kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ es una cuantización INT4 (W4A16-AWQ) del modelo Kataguru-Sceptic-35B-A3B-Georgian-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) construido sobre la base Kataguru Sceptic 35B-A3B v3.1, especializado en georgiano (ქართული ენა), razonamiento, visión multimodal y traducción de página completa. El modelo incorpora 256 expertos por capa MoE (254 congelados del núcleo original más 2 expertos nuevos dedicados a gramática y literatura georgianas), distribuidos en 40 capas.

La relevancia de esta variante concreta reside en su formato de cuantización: el empaquetado W4A16-AWQ con `compressed-tensors` reduce el peso en disco a aproximadamente 19,3 GiB (unos 18,0 GiB en vLLM con `--language-model-only`), lo que permite ejecutar un modelo de casi 36 000 millones de parámetros en una única GPU de 24 GB, dejando unos 6 GiB libres para la caché KV. Esto democratiza el despliegue de un MoE multilingüe con capacidades de razonamiento científico, código competitivo, tool calling y visión sobre hardware de consumo o de gama profesional.

El modelo conserva una ventana de contexto de 262 144 tokens, un encoder de visión de 27 capas y una cabeza especulativa MTP en la capa 40. Está licenciado bajo Apache 2.0 y soporta inglés, georgiano y finlandés. Su orientación es claramente "soberana": busca ofrecer un modelo de alta calidad para una lengua de bajos recursos como el georgiano sin sacrificar las capacidades del núcleo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa (254 congelados + 2 nuevos), encoder de visión de 27 capas, cabeza MTP especulativa en capa 40 |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones FP16), group_size=128, observer MSE, empaquetado `compressed-tensors` pack-quantized; también disponible NVFP4, BF16 y GGUF en la suite del autor |
| Idiomas soportados | Inglés (en), georgiano (ka), finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ W4A16, `compressed-tensors`); repo de 20,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La innovación principal de la versión v3.2 es la estrategia de expansión "254 + 2": los 254 expertos originales del núcleo Sceptic 35B-A3B v3.1 se mantienen completamente congelados para preservar sin olvido catastrófico las capacidades de razonamiento científico, código, tool calling y automatización industrial. Sobre ellos se añaden dos expertos nuevos: el experto #254, especializado en gramática, morfología y terminología técnica georgiana (alineación de casos ergativos escindidos kartvelianos, screeves verbales polipersonales, circunfijos, escritura Mkhedruli, ingeniería industrial, PLC/CNC, medicina clínica y terminología legal/patentes), y el experto #255, dedicado a literatura georgiana, no ficción y traducción bidireccional EN↔KA.

El entrenamiento de los nuevos expertos se realizó sobre un banco de 4.800 muestras doradas verificadas humanamente (100 % de aprobación en la puerta de calidad mecánica) junto con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). Se incluye una plantilla de chat nativa en georgiano (`chat_template.jinja`) con modos `/ka` y `/translate`, cabeceras de razonamiento localizadas, y una calibración de cuantización específica en georgiano (`calib_nvfp4_awq_256_ka.jsonl` e `imatrix_calibration_ka.txt`). No se modificaron los 254 expertos del núcleo, el encoder de visión de 27 capas (333 tensores), la cabeza MTP especulativa (785 tensores) ni la ventana de contexto de 262 144 tokens.

## Capacidades

- Generación de texto, razonamiento científico de nivel doctorado (GPQA Diamond 70,20 %) y matemáticas avanzadas.
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 39,43 %, con 90,70 % en dificultad Easy).
- Tool calling / function calling nativo con detección de irrelevancia (BFCL V4 Single-Turn AST 83,67 %, Non-Live 88,44 %, detección de irrelevancia 80,26 %).
- Razonamiento multi-paso y modo agente, con profundidad de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Capacidades multimodales de visión: pipeline image-text-to-text con encoder de 27 capas.
- Traducción bidireccional de página completa EN↔KA (y con finlandés) en modo `/translate`, preservando párrafos y sin charla adicional.
- Capacidades multilingües en inglés, georgiano y finlandés, con modo nativo georgiano vía `/ka` o `chat_template_kwargs={"response_language": "ka"}`.
- Conocimiento técnico especializado en ingeniería industrial (PLC/CNC), medicina clínica y terminología legal/patentes.
- Decodificación especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traducción profesional EN↔KA de documentación técnica y literatura: el modo `/translate` produce traducciones de página completa preservando párrafos y sin texto conversacional adicional, adecuado para editoriales, organismos públicos y empresas que necesitan localización al georgiano con terminología técnica consistente.
- Atención al cliente en georgiano: el modelo gestiona conversaciones multi-turno con hasta 262 144 tokens de contexto, lo que permite incorporar manuales de producto extensos o historiales completos de cliente en el prompt sin truncamiento.
- Generación y revisión de código en pipelines de CI/CD: con tool calling nativo (BFCL V4 83,67 %) y razonamiento algorítmico, puede integrarse como agente que consulta APIs, ejecuta pruebas y propone parches dentro de flujos automatizados.
- Asistencia a la investigación científica: los 254 expertos congelados conservan el rendimiento GPQA Diamond del 70,20 %, útil para responder preguntas de física, química y biología molecular a nivel de posgrado, con la ventaja de ejecutarse en una sola GPU de 24 GB.
- Digitalización y análisis de documentos con visión: al ser image-text-to-text, puede procesar páginas escaneadas (facturas, formularios, patentes) y extraer o traducir su contenido, combinando OCR implícito con el modo de traducción.
- Automatización industrial y soporte técnico de campo: el experto #254 incluye terminología de PLC/CNC y medicina clínica, lo que permite construir asistentes para operarios de planta o personal sanitario que consulten procedimientos en georgiano.
- Despliegue en infraestructura limitada: con ~18,0 GiB en vLLM `--language-model-only`, cabe en una RTX 4090 o A10G de 24 GB, habilitando prototipos y servicios de inferencia en entornos con presupuesto de hardware restringido.
- Procesamiento de corpus finlandeses y georgianos: el soporte de finlandés junto con el georgiano permite construir herramientas de traducción cruzada y análisis lingüístico para ambas lenguas de bajos recursos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto vía expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo de georgiano 10/10 (v3.2) | 10/10 PASS (100 %) | Suite de evaluación NLP georgiana y traducción literaria/técnica EN↔KA |

No se han publicado resultados de benchmarks específicos para esta variante cuantizada W4A16-AWQ en la información disponible; los datos anteriores corresponden al modelo base v3.1/v3.2.

## Requisitos de hardware

- VRAM estimada: ~19,3 GiB en disco; ~18,0 GiB en vLLM con `--language-model-only`, dejando ~6 GiB para caché KV en una GPU de 24 GB.
- GPU recomendadas: una sola GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) para esta variante AWQ; el BF16 completo requiere ~72 GB (2× 48–80 GB); NVFP4 o W4A16-AWQ también pueden ejecutarse en 2× RTX 5090 de 32 GB con TP=2 o en una GPU de 32 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB; la variante GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Opciones de despliegue: vLLM (formato `compressed-tensors` pack-quantized, compatible con endpoints), transformers; el autor publica además GGUF con `mmproj` para llama.cpp/Ollama y NVFP4 para Blackwell.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ | ~35,95B | 3B | 262.144 | Apache 2.0 | AWQ W4A16, vLLM, 24 GB |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 (BF16) | ~35,95B | 3B | 262.144 | Apache 2.0 | BF16, ~72 GB VRAM |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4 | ~35,95B | 3B | 262.144 | Apache 2.0 | NVFP4, ~24,3 GB, Blackwell |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | ~35,95B | 3B | 262.144 | Apache 2.0 | BF16, sin especialización georgiana |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Ficción creativa a alta temperatura: para precisión morfológica y corrección de pruebas en georgiano, el autor recomienda `temperature=0.2–0.3` con `presence_penalty=0.3`; a temperaturas altas puede degradarse la calidad lingüística.
- Huella de VRAM: el BF16 completo exige ~72 GB (2× 48–80 GB); esta variante AWQ necesita una GPU de 24 GB, y la GGUF APEX-Medium una de 16 GB. Planificar la caché KV para contextos largos de hasta 262 144 tokens, que puede consumir varios GiB adicionales.
- Riesgo de alucinación: no se documenta en la información disponible; como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en dominios especializados (medicina, legal, patentes) donde se recomienda verificación humana.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Cobertura idiomática limitada a inglés, georgiano y finlandés; el rendimiento en otras lenguas no está documentado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las obligaciones de atribución y la ausencia de garantías; verificar la licencia del modelo base v3.1 si se redistribuye.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación comunitaria independiente.
- La especialización en georgiano se basa en 4.800 muestras verificadas; dominios muy técnicos o jerga regional pueden quedar fuera de cobertura.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4
- Variante AWQ universal: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ
- GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

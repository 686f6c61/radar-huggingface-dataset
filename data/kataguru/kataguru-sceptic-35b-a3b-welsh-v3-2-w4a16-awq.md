# kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ es una cuantización INT4 (W4A16-AWQ) del modelo multimodal Kataguru-Sceptic-35B-A3B-Welsh-v3.2, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Se trata de un transformer de tipo Mixture-of-Experts con 35.951.822.704 parámetros totales (aproximadamente 3B activos por token), 40 capas MoE y una ventana de contexto de 262.144 tokens. El modelo combina razonamiento científico, código, tool calling y visión con un ajuste específico para galés (Cymraeg), finlandés e inglés.

La innovación principal es la arquitectura de "254 + 2" expertos por capa: los 254 expertos originales del modelo base permanecen congelados (preservando sus capacidades de razonamiento STEM, código y agentes), mientras que se añaden dos expertos nuevos dedicados al galés (gramática, mutaciones consonánticas, sintaxis VSO, traducción bidireccional EN<->CY). El resultado es un modelo soberano para galés que no sufre olvido catastrófico en las capacidades del modelo base.

Esta variante AWQ reduce el peso en disco a unos 19,3 GiB y permite ejecutar el modelo en una única GPU de 24 GB con unos 6 GiB libres para caché KV, lo que lo hace desplegable en hardware de consumo alto o en instancias cloud de gama media. Está pensado para traducción de página completa, razonamiento multimodal y asistentes con tool calling en entornos donde el galés es lengua de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe), 40 capas, 256 expertos por capa (254 congelados + 2 específicos de galés) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4, group_size=128, compressed-tensors pack-quantized, Marlin compatible); existen también BF16, NVFP4 y GGUF APEX |
| Idiomas soportados | Inglés (en), galés (cy), finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / AWQ W4A16) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La base Kataguru-Sceptic-35B-A3B-v3.1 aporta 254 expertos congelados (#0..#253) que conservan intactas las capacidades de razonamiento científico, código competitivo, tool calling y control industrial PLC/CNC. Sobre esa base se añaden dos expertos nuevos: el experto #254 cubre gramática galesa, morfología (mutaciones iniciales treiglad meddal, trwynol y llaes), sintaxis VSO, preposiciones flexionadas y terminología técnica/legal; el experto #255 cubre prosa literaria, no ficción, diálogo natural y traducción bidireccional EN<->CY.

El entrenamiento de los nuevos expertos se realizó sobre un banco de 4.845 muestras doradas verificadas humanamente (100% de aprobación en la puerta de calidad mecánica), con calibración contrastiva del router (modo new_experts_only, recalibración del router con r=32, alpha=64). Se incluye una plantilla de chat nativa en galés (chat_template.jinja) con etiquetas de control /cy y /translate, cabeceras de razonamiento localizadas y calibración de cuantización específica en galés (calib_nvfp4_awq_256_cy.jsonl e imatrix_calibration_cy.txt). El modelo conserva el codificador visual multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores) del modelo base.

## Capacidades

- Generación de texto y razonamiento de nivel graduado en física, química y biología molecular (GPQA Diamond 70,20%).
- Programación algorítmica competitiva (LiveCodeBench v6 Pass@1 39,43%, con 90,70% en problemas fáciles).
- Tool calling / function calling nativo con AST (BFCL V4 83,67%) e detección de irrelevancia (80,26%).
- Capacidades multimodales de visión: pipeline image-text-to-text con codificador visual de 27 capas.
- Traducción bidireccional de página completa EN<->CY con modo /translate (sin cháchara, preservando párrafos).
- Modo de razonamiento configurable mediante etiquetas {REASON:spoon}, {REASON:einstein}, {REASON:007}, {REASON:deep}, {REASON:low} y {REASON:off}.
- Soporte multilingüe nativo en inglés, galés y finlandés, con plantilla de chat específica por idioma.
- Capacidades de ingeniería industrial (PLC/CNC) y terminología clínica, legal y de patentes heredadas del núcleo congelado.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) en la capa 40.

## Casos de uso

- Traducción profesional EN<->CY de documentación técnica y literaria: el modo /translate preserva la estructura de párrafos y evita la cháchara conversacional, adecuado para editoriales, administraciones públicas galesas y despachos legales que necesitan traducciones fieles con terminología estatutaria.
- Asistente de atención al cliente en galés: la plantilla de chat nativa /cy y los expertos #254/#255 permiten conversaciones multi-turno con morfología correcta (mutaciones, preposiciones flexionadas), algo que los modelos generalistas suelen fallar.
- Razonamiento científico asistido: con GPQA Diamond del 70,20% y contexto de 262.144 tokens, puede procesar artículos completos de química o biología molecular y responder preguntas de nivel posgrado manteniendo referencias cruzadas.
- Generación de código en producción: soporta tool calling con AST (BFCL V4 83,67%) y puede integrarse en pipelines de CI/CD para autocompletar, revisar parches o invocar APIs mediante function calling estructurado.
- Análisis de documentos escaneados con visión: el codificador visual de 27 capas permite extraer texto de facturas, formularios o planos técnicos y traducirlos directamente al galés o finlandés.
- Automatización industrial PLC/CNC: los expertos congelados conservan terminología de control industrial, útil para generar documentación técnica o interpretar registros de máquina en entornos bilingües galés-inglés.
- Despliegue en una sola GPU de 24 GB: gracias a la cuantización W4A16-AWQ (19,3 GiB en disco, 18,0 GiB en vLLM con --language-model-only), sirve como backend de un asistente interno sin necesidad de clústeres multi-GPU.
- Evaluación lingüística del galés: puede usarse como generador de referencia en suites como COPA-cy, WNLI-cy o MGSM-cy, donde el autor reporta 10/10 en la auditoría en vivo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26% | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond | 70,20% (139/198) | Física, química y biología molecular de nivel posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43% | Easy: 90,70% |
| BFCL V4 Single-Turn AST | 83,67% | Non-Live: 88,44%; detección de irrelevancia: 80,26% |
| Auditoría en vivo de galés 10/10 | 10/10 PASS (100%) | Suite Techiaith (COPA-cy, WNLI-cy, MGSM-cy) y traducción literaria/técnica EN<->CY |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, GSM8K, HumanEval) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada: ~18,0 GiB en vLLM con --language-model-only; ~19,3 GiB en disco para esta variante AWQ. La versión BF16 requiere ~72 GB (2x GPU de 48-80 GB); NVFP4 ~24,3 GB.
- GPU recomendadas: una única GPU de 24 GB (p. ej. RTX 4090, L4, A10G) con ~6 GiB libres para caché KV; 2x RTX 5090 de 32 GB con TP=2 para NVFP4/W4A16-AWQ; A100 80GB o H100 para BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con esta cuantización; la variante GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Opciones de despliegue: vLLM (recomendado, compatible con compressed-tensors/Marlin), llama.cpp/Ollama mediante los GGUF APEX, TGI no confirmado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ | 35,95B totales / ~3B activos | 262.144 | Apache 2.0 | MoE 256 expertos, multimodal, especializado en galés |
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2 (BF16) | 35,95B totales / ~3B activos | 262.144 | Apache 2.0 | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,95B totales / ~3B activos | 262.144 | Apache 2.0 | Sin expertos de galés; referencia de capacidades del núcleo |
| Alternativas generalistas MoE de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica en galés; el autor recomienda temperature=0,2-0,3 y presence_penalty=0,3 para tareas de corrección y prueba.
- El modelo conserva los sesgos del corpus del modelo base Kataguru-Sceptic-35B-A3B-v3.1, no documentados en la información disponible.
- Riesgo de alucinación inherente a modelos generativos, especialmente en terminología técnica galesa poco representada; verificar salidas en contextos legales, clínicos o de patentes.
- La cobertura lingüística se limita a inglés, galés y finlandés; otros idiomas no están garantizados y pueden degradar la calidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de calibración pueden tener condiciones adicionales no detalladas en la información disponible.
- El contexto de 262.144 tokens puede degradar la calidad en los extremos de la ventana; no se han publicado evaluaciones de aguja en pajar para esta variante.
- El rendimiento en benchmarks corresponde al modelo base v3.1 y a la auditoría del autor; no hay verificación independiente de los resultados de galés.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación de la comunidad.

## Enlaces

- Hugging Face (esta variante AWQ): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ
- Pesos BF16 maestros: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2
- Variante NVFP4 para Blackwell: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4
- Variante GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

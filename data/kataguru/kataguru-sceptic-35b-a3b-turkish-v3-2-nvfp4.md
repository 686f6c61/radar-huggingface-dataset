# kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4 es una cuantización en formato NVFP4 (FP4 nativo para Blackwell) del modelo Kataguru-Sceptic-35B-A3B-Turkish-v3.2, un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) desarrollado por el usuario kataguru. Está construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y especializado en turco, con capacidades de razonamiento científico, programación competitiva, tool calling y traducción bidireccional de página completa entre inglés, finés y turco. El modelo cuenta con 35.951.822.704 parámetros totales, de los cuales unos 3.000 millones están activos por token, y una ventana de contexto de 262.144 tokens.

La relevancia de esta variante concreta reside en su formato de cuantización NVFP4 (compressed-tensors), que reduce el peso en disco a aproximadamente 20,7 GiB y permite su despliegue en una única GPU de 24 GB con vLLM usando `--language-model-only`. Esto acerca un modelo MoE de 35B con visión y contexto de 256K a hardware de consumo profesional, algo que el maestro en BF16 (unos 67,5 GB) no permite.

La arquitectura añade dos expertos específicos de turco (expertos #254 y #255) sobre los 254 expertos congelados del núcleo Sceptic, preservando el rendimiento original del modelo base mientras se incorpora gramática, morfología, terminología técnica y traducción literaria en turco. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en `qwen3_5_moe`, transformer con encoder de visión multimodal de 27 capas y cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, `compressed-tensors`); el suite incluye además BF16, W4A16-AWQ y GGUF APEX (Small, Medium, Good) |
| Idiomas soportados | Inglés (en), turco (tr), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización NVFP4 (`compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa: 254 expertos congelados del núcleo Sceptic v3.1 (expertos #0 a #253) más dos expertos nuevos específicos de turco. El experto #254 cubre gramática turca, morfología (armonía vocálica de 2 y 4 vías, mutación consonántica, cadenas de sufijos derivativos y flexivos) y terminología técnica industrial (PLC/CNC, medicina clínica, patentes). El experto #255 se orienta a literatura turca, no ficción y traducción bidireccional EN<->TR. El entrenamiento de estos nuevos expertos se realizó con un banco de 4.821 muestras doradas verificadas humanamente, junto con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32, alpha=64`).

Los 254 expertos del núcleo permanecen congelados, lo que según el autor evita el olvido catastrófico y preserva las capacidades de razonamiento científico, código y tool calling del modelo base. El modelo incluye además una plantilla de chat específica para turco (`chat_template.jinja`) con etiquetas de control `/tr` y `/translate`, y una calibración de cuantización dedicada en turco (`calib_nvfp4_awq_256_tr.jsonl`, `imatrix_calibration_tr.txt`). Se conservan el encoder de visión de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores). No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá del banco de muestras turcas.

## Capacidades

- Generación de texto y razonamiento científico de nivel doctorado (STEM, física, química, biología molecular).
- Programación competitiva y algorítmica (LiveCodeBench v6).
- Tool calling / function calling nativo con detección de irrelevancia y AST (`<tool_call>`).
- Razonamiento agéntico multi-paso.
- Capacidades multimodales de visión (pipeline `image-text-to-text`, encoder de visión de 27 capas).
- Traducción bidireccional de página completa EN<->TR (y con finés) en modo `/translate`, preservando párrafos y sin cháchara adicional.
- Modo de razonamiento configurable mediante etiquetas: `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Soporte nativo de turco con plantilla de chat dedicada y modo `/tr`.
- Capacidades industriales específicas: PLC/CNC y terminología técnica.

## Casos de uso

- Traducción profesional EN<->TR de página completa: el modo `/translate` genera traducciones literarias y técnicas preservando la estructura de párrafos, adecuado para editoriales, documentación legal y patentes.
- Razonamiento científico asistido: con GPQA Diamond de 70,20 %, sirve para responder consultas de grado en física, química y biología molecular, con modo de razonamiento profundo activable.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generación y revisión de código algorítmico, con un Pass@1 de 39,43 % en LiveCodeBench v6.
- Agentes con herramientas: el BFCL V4 AST de 83,67 % y la detección de irrelevancia del 80,26 % lo hacen apto para orquestación de agentes que invocan APIs y funciones.
- Procesamiento de documentos con imágenes: al ser multimodal image-text-to-text, puede extraer y razonar sobre contenido de capturas, escaneos y diagramas técnicos.
- Atención al cliente en turco: la plantilla nativa `/tr` y el contexto de 262.144 tokens permiten conversaciones multi-turno largas con historial extenso.
- Documentación técnica industrial: el experto #254 cubre terminología PLC/CNC, medicina clínica y patentes, útil para manuales y documentación normativa.
- Despliegue en una sola GPU de 24 GB: la variante NVFP4 (unos 19,4 GiB en vLLM con `--language-model-only`) permite servir el modelo en estaciones de trabajo con una RTX 4090 o similar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Fácil: 90,70 % |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | No-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo de turco 10/10 (v3.2) | 10/10 PASS (100 %) | Open Turkish LLM Leaderboard (MMLU-TR, ARC-TR, TruthfulQA-TR) y traducción literaria/técnica EN<->TR |

## Requisitos de hardware

- VRAM en BF16: aproximadamente 72 GB (2x GPU de 48-80 GB).
- VRAM en NVFP4: unos 20,7 GiB en disco y unos 19,4 GiB en vLLM con `--language-model-only`; cabe en una única GPU de 24 GB.
- VRAM en W4A16-AWQ: aproximadamente 25,3 GB.
- VRAM en GGUF APEX-Medium: unos 13,6 GiB, cabe en una GPU de 16 GB.
- GPU recomendadas: Blackwell (por ejemplo RTX 5090 32 GB, con TP=2 para NVFP4/AWQ), GPUs de 24 GB para NVFP4, GPUs de 16 GB para GGUF APEX-Medium. Para BF16, A100/H100 de 80 GB en par.
- Opciones de despliegue: vLLM (NVFP4 y W4A16-AWQ), llama.cpp/Ollama con GGUF APEX (incluye `mmproj` para visión), transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4 | 35.951.822.704 totales, ~3B activos | 262.144 | Apache 2.0 | Hugging Face (NVFP4) | Especializado en turco, multimodal, MoE |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2 (BF16) | 35.951.822.704 totales, ~3B activos | 262.144 | Apache 2.0 | Hugging Face (BF16) | Maestro sin cuantizar del mismo modelo |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ | 35.951.822.704 totales, ~3B activos | 262.144 | Apache 2.0 | Hugging Face (AWQ) | Variante universal para vLLM |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF | 35.951.822.704 totales, ~3B activos | 262.144 | Apache 2.0 | Hugging Face (GGUF) | Variante para llama.cpp/Ollama |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, Qwen u otros MoE de tamaño similar); dichos datos se indican como no disponibles.

## Limitaciones y advertencias

- Ficción creativa a temperatura alta: el autor recomienda `temperature=0.2–0.3` con `presence_penalty=0.3` para precisión morfológica y de corrección en turco.
- Riesgo de alucinación: no se documenta una mitigación específica más allá de los benchmarks de veracidad; tratar las salidas como no verificadas en dominios críticos.
- Cobertura idiomática limitada a inglés, turco y finés; el rendimiento fuera de estos idiomas no está documentado.
- La especialización en turco se apoya en solo 4.821 muestras doradas, lo que puede limitar la generalización a registros muy alejados del conjunto de calibración.
- La cuantización NVFP4 requiere hardware Blackwell para aprovechar el formato nativo; en GPUs no Blackwell puede no ser la opción óptima (existen AWQ y GGUF para esos casos).
- El modelo base v3.1 está congelado en sus 254 expertos; las mejoras se concentran en los dos expertos turcos, por lo que el rendimiento en otros idiomas depende del núcleo original.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.
- El contexto de 262.144 tokens puede degradar la calidad en los extremos de la ventana; no se documentan pruebas de aguja en pajar para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ
- Variante GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF
- Modelo base v3.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

# kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4 es la variante cuantizada en NVFP4 de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en galés (Cymraeg), desarrollado por el usuario kataguru. Se construye sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y añade dos expertos dedicados al galés sobre los 254 expertos originales, que permanecen congelados. El modelo cubre generación de texto, razonamiento, código, tool calling y capacidades multimodales de visión, con un contexto declarado de 262.144 tokens.

La relevancia de esta ficha concreta reside en el formato de pesos: NVFP4 (FP4 nativo para Blackwell) mediante compressed-tensors, lo que reduce el peso en disco a unos 20,7 GiB y permite, según el autor, su ejecución en una única GPU de 24 GB. Con 35.951.822.704 parámetros totales y 3B activos por token, el modelo busca preservar el rendimiento de la base (media de 70,26 % en un conjunto de 15 benchmarks) mientras añade competencia nativa en galés.

El modelo está pensado para traducción bidireccional EN<->CY, procesamiento de documentos con visión, razonamiento técnico y agentes con tool calling. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors cuantizado, con soporte declarado para transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa (254 congelados + 2 de galés) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, compressed-tensors); la familia incluye BF16, W4A16-AWQ y GGUF APEX |
| Idiomas soportados | en, cy (galés), fi (finés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 provienen de la base Sceptic 35B-A3B v3.1 y permanecen congelados, de modo que conservan las capacidades originales de razonamiento científico, código y tool calling sin olvido catastrófico. Los expertos #254 y #255 son nuevos: el primero se orienta a gramática y morfología galesa (mutaciones consonánticas célticas, sintaxis VSO, preposiciones flexionadas) y a terminología técnica industrial y clínica; el segundo cubre prosa literaria, no ficción, diálogo natural y traducción bidireccional EN<->CY.

El ajuste se realizó con un banco de 4.845 muestras verificadas humanamente y calibración contrastiva del router (modo `new_experts_only`, `recalibrate-router`, r=32, alpha=64). Se mantienen intactos el codificador de visión multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores). La cuantización NVFP4 emplea calibración específica en galés (`calib_nvfp4_awq_256_cy.jsonl` e `imatrix_calibration_cy.txt`). No se detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto y razonamiento de nivel graduado en STEM (física, química, biología molecular).
- Programación algorítmica y competitiva.
- Tool calling nativo con formato `<tool_call>` y detección de irrelevancia.
- Capacidades multimodales de visión (pipeline image-text-to-text) mediante codificador de 27 capas.
- Traducción bidireccional EN<->CY en modo página completa, preservando párrafos, mediante el prefijo `/translate`.
- Modo nativo en galés con plantilla de chat propia (`/cy` o `chat_template_kwargs={"response_language": "cy"}`).
- Control de profundidad de razonamiento mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Decodificación especulativa mediante cabeza MTP.
- Soporte multilingüe para inglés, galés y finés.
- Uso agéntico y razonamiento multi-paso (declarado mediante BFCL V4).

## Casos de uso

- Traducción profesional EN<->CY de documentación técnica: el modo `/translate` permite traducir página completa preservando párrafos y terminología, adecuado para textos legales, patentes y manuales.
- Localización de interfaces y contenido para organismos públicos galeses: el experto #254 cubre mutaciones y sintaxis VSO, lo que reduce errores morfológicos frente a modelos genéricos.
- Extracción de información de documentos escaneados: la combinación de visión y contexto de 262.144 tokens permite procesar lotes de páginas y responder preguntas sobre su contenido.
- Asistentes técnicos en entornos industriales: el modelo conserva capacidades de PLC/CNC y terminología de ingeniería de la base, útil para consultas de mantenimiento y diagnóstico.
- Agentes con tool calling en pipelines de automatización: el formato `<tool_call>` y la detección de irrelevancia (80,26 %) lo hacen apto para orquestación de funciones en producción.
- Generación y revisión de código en CI/CD: con 39,43 % en LiveCodeBench v6 y 90,70 % en tareas fáciles, puede usarse para sugerencias, tests y revisión automatizada.
- Atención al cliente bilingüe EN/CY: la ventana de contexto larga permite conversaciones multi-turno con historial extenso y cambio de idioma controlado por plantilla.
- Despliegue en una única GPU de 24 GB: el formato NVFP4 (unos 19,4 GiB en vLLM con `--language-model-only`) habilita inferencia local en estaciones de trabajo Blackwell.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks (base) | 70,26 % | Heredado de los expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM de nivel doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en galés 10/10 (v3.2) | 10/10 PASS (100 %) | Suite Techiaith (COPA-cy, WNLI-cy, MGSM-cy) y traducción literaria/técnica |

No se han publicado en la información disponible resultados desglosados por benchmark para la variante NVFP4 concreta; las cifras corresponden a la base y a la auditoría del modelo v3.2.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 72 GB (2x GPU de 48-80 GB).
- VRAM en NVFP4: unos 20,7 GiB en disco y unos 19,4 GiB en vLLM con `--language-model-only`; cabe en una GPU de 24 GB.
- VRAM en W4A16-AWQ: aproximadamente 25,3 GB; el autor indica 2x RTX 5090 de 32 GB con TP=2 o una GPU de 32 GB.
- GGUF APEX-Medium: unos 13,6 GiB, ejecutable en una GPU de 16 GB.
- GPU recomendadas: Blackwell (RTX 5090, B200) para NVFP4 nativo; A100/H100 para BF16.
- Opciones de despliegue: transformers, vLLM (soporte NVFP4), llama.cpp/Ollama mediante la variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato destacado |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4 | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | NVFP4, safetensors |
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2 (BF16) | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | BF16, safetensors |
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | AWQ, safetensors |
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | GGUF |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica en galés; el autor recomienda `temperature=0.2-0.3` y `presence_penalty=0.3` para tareas de corrección.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas medidas.
- El NVFP4 requiere hardware Blackwell para aprovechar el formato nativo; en GPUs anteriores conviene usar la variante AWQ o GGUF.
- La cobertura lingüística declarada se limita a inglés, galés y finés; el rendimiento en otros idiomas no está documentado.
- La especialización en galés se apoya en 4.845 muestras verificadas, un volumen reducido que puede limitar la generalización en dominios muy específicos.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia comunitaria de uso en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de la base Sceptic v3.1 antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1

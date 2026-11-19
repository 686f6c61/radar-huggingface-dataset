# kataguru/Qwen3.8-27B-Titan-v3.2-GGUF

## Resumen

Kataguru Titan v3.2 es un ajuste fino del modelo Qwen3.8-27B, desarrollado por el usuario kataguru y distribuido en formato GGUF para inferencia local con llama.cpp, LM Studio y Ollama. Se presenta como un modelo "uncensored" (zero-refusal) orientado a agentes autónomos, con capacidades multimodales de visión y un contexto nativo de 262.144 tokens. El modelo está especializado en finés (suomi) y declara soporte para inglés, estonio, húngaro y turco, además de capacidades de razonamiento y tool calling.

El modelo parte de una cadena de ajustes finos sobre la base Qwen3.8-27B, pasando por variantes "Heretic/Uncensored" de DavidAU y las versiones previas Titan 1.0 y 2.0 del propio kataguru. La versión v3.2 corresponde al checkpoint 125 de un entrenamiento adicional sobre la base Titan v3.0, con un conjunto de 32.282 muestras auditadas centradas en agenticidad autónoma, tool calling en formato MiniCPM-5/Qwen3 XML y "comprensión humana profunda".

La relevancia de esta ficha radica en que ofrece cuantizaciones optimizadas con imatrix (IQ3_XXS, IQ4_XS, IQ4_NL) que permiten ejecutar un modelo de ~27.000 millones de parámetros en GPUs de consumo de 12-24 GB de VRAM, con un contexto muy largo y un proyector de visión separado. El autor publica además una comparativa de 13 tareas del `lm-evaluation-harness` frente al modelo base y a la versión v3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atención no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo, según model card) |
| Tipos de cuantizacion | IQ3_XXS, IQ4_XS, IQ4_NL (optimizadas con imatrix); proyector de visión en F16 |
| Idiomas soportados | fi, en, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj F16 para visión); el modelo base se distribuye en BF16 y AWQ W4A16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que deriva de Qwen3.8-27B y que incorpora un proyector multimodal (`mmproj-Qwen3.8-27B-Titan-v3.2-f16.gguf`, 889 MB) para análisis de imágenes. El linaje documentado por el autor es: base Qwen3.8-27B → variantes "TURBO Fable Cold Fusion Heretic Uncensored" de DavidAU → Titan 1.0 y Titan 2.0 de kataguru → Titan v3.0 (checkpoint CP4000) → Titan v3.2 (checkpoint 125). El modelo base inmediato es `kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16`.

El ajuste fino de kataguru se describe como un entrenamiento de 32.282 muestras auditadas orientado a agenticidad autónoma, tool calling en formato MiniCPM-5 / Qwen3 XML, "comprensión humana profunda" y "somatics". El autor menciona una técnica de "ortogonalización de activaciones SOMA/ARA" para lo que denomina "honestidad epistémica" y una tasa de rechazo del 0,00 % en tareas legítimas. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos (chain-of-thought).
- Razonamiento matemático (GSM8K) y STEM de nivel doctorado (GPQA Diamond).
- Tool calling / function calling con formato MiniCPM-5 y Qwen3 XML.
- Comportamiento agéntico autónomo (planificación y ejecución multi-paso).
- Análisis de imágenes mediante el proyector de visión F16 (multimodal).
- Multilingüe: finés, inglés, estonio, húngaro y turco.
- Modo "zero-refusal" / uncensored: el autor declara 0,00 % de rechazos en tareas legítimas.
- Cumplimiento estricto de instrucciones programáticas (IFEval).

## Casos de uso

- Agentes autónomos locales: el soporte de tool calling en formato Qwen3 XML y su comportamiento agéntico permiten construir pipelines de agentes que planifican y ejecutan acciones sobre APIs locales sin depender de la nube.
- Asistencia en finés: es uno de los pocos modelos de ~27 B con especialización explícita en finés, útil para atención al cliente, resumen documental o generación de contenido en ese idioma.
- Análisis de documentos e imágenes en el escritorio: con el proyector de visión y 262k de contexto, puede procesar capturas, diagramas o páginas escaneadas junto con texto largo en LM Studio.
- Razonamiento STEM y tutoría técnica: sus resultados en GPQA Diamond (63,13 %) y GSM8K (93,86 %) lo hacen adecuado para asistencia en problemas de física, química, biología y matemáticas.
- Automatización de flujos de trabajo con instrucciones estrictas: el 85,61 % en IFEval (Inst Strict) respalda su uso en tareas donde el formato de salida debe cumplirse al pie de la letra (extracción estructurada, generación de JSON, etc.).
- Despliegue en hardware de consumo: las cuantizaciones IQ3_XXS (~11 GB) e IQ4_XS/IQ4_NL (~15 GB) permiten ejecutarlo en GPUs de 12-24 GB, habilitando asistentes privados sin conexión.
- Investigación sobre alineación y modelos sin censura: útil para estudiar el comportamiento de modelos con rechazo reducido en entornos controlados.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness` (tuplas prompt/inst strict donde aplica):

| Tarea | Qwen 3.8 27B Base | Titan v3.0 CP4000 | Titan v3.2 (CP125) |
|---|---|---|---|
| gsm8k (exact_match strict) | 73,10 % | 94,54 % | 93,86 % |
| gpqa_diamond | 44,60 % | 60,10 % | 63,13 % |
| ifeval (prompt / inst strict) | 35,0 % / 45,0 % | 73,94 % / 80,82 % | 80,78 % / 85,61 % |
| boolq | 89,20 % | 91,41 % | 91,07 % |
| truthfulqa_mc2 | 51,10 % | 55,03 % | 54,93 % |
| truthfulqa_mc1 | 34,60 % | 36,72 % | 36,96 % |
| medqa_4options | 82,64 % | 84,37 % | 83,97 % |
| arc_challenge | 66,50 % | 65,44 % | 65,27 % |
| arc_easy | 85,40 % | 86,20 % | 86,07 % |
| winogrande | 77,30 % | 77,35 % | 77,11 % |
| hellaswag | 83,90 % | 82,98 % | 82,92 % |
| openbookqa | 45,10 % | 46,20 % | 46,60 % |
| piqa | 81,80 % | 82,32 % | 82,21 % |
| Media (13 tareas, prompt strict) | 65,40 % | 72,05 % | 72,68 % |
| Media (13 tareas, inst strict) | 66,17 % | 72,58 % | 73,05 % |

No se han publicado resultados de benchmarks adicionales (p. ej. MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~11 GB para IQ3_XXS (recomendado 12 GB con contexto limitado o 16 GB con contexto amplio); ~15,1-15,2 GB para IQ4_XS e IQ4_NL (recomendado 16 GB o 24 GB+).
- Proyector de visión: 889 MB adicionales en F16 si se usa multimodalidad.
- GPUs recomendadas: RTX 4090 (24 GB) para IQ4_XS/IQ4_NL con contexto amplio; RTX 3060 12 GB / RTX 4070 para IQ3_XXS con contexto reducido; A100/H100 para contexto completo de 262k y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB (IQ3_XXS) y 16-24 GB (IQ4_XS/IQ4_NL).
- Opciones de despliegue: LM Studio 0.3+, llama.cpp b11064+, Ollama. El autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru Titan v3.2 | ~26,9 B | 262.144 | Apache 2.0 | GGUF | Especializado en finés, uncensored, visión |
| Qwen3.8-27B Base | ~27 B | no disponible | no disponible | BF16 | Base del ajuste; media 65,40 % en 13 tareas |
| Titan v3.0 CP4000 | ~27 B | no disponible | Apache 2.0 | BF16 / AWQ | Versión previa; media 72,05 % en 13 tareas |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Modelo "uncensored" / zero-refusal: el autor declara explícitamente una tasa de rechazo del 0,00 %, lo que implica un riesgo elevado de generar contenido inapropiado, dañino o ilegal sin salvaguardas. No apto para producción orientada al público sin una capa de moderación externa.
- Riesgo de alucinación: los resultados en TruthfulQA (mc1 36,96 %, mc2 54,93 %) indican una fiabilidad factual limitada; conviene verificar afirmaciones críticas.
- Idiomas: el soporte declarado se limita a fi, en, et, hu y tr; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento legal del contenido generado y de las obligaciones de atribución.
- Linaje complejo con múltiples ajustes "Heretic/Uncensored": la procedencia de los datos de entrenamiento intermedios no está detallada, lo que dificulta auditar sesgos o contaminación.
- Benchmarks autopublicados por el autor sin verificación independiente; las cifras deben tomarse con cautela.
- El contexto nativo de 262k puede degradar la calidad y exige hardware de gama alta (A100/H100) para aprovecharse por completo.
- El formato GGUF está pensado para inferencia local; para despliegues de alta concurrencia conviene evaluar la variante AWQ W4A16 del mismo autor.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.2-GGUF
- Modelo base BF16: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16
- Variante AWQ W4A16: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.2-W4A16-AWQ
- Titan 1.0: https://huggingface.co/kataguru/Qwen3.8-27B-Finnish-Titan-Uncensored
- Titan v2.0: https://huggingface.co/kataguru/Qwen3.8-27B-Finnish-Titan-v2.0-Uncensored
- Linaje DavidAU (TURBO Fable Cold Fusion): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Linaje DavidAU (TWIN TURBO): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored

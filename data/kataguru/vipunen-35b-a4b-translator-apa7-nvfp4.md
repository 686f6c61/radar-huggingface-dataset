# kataguru/Vipunen-35B-A4B-Translator-APA7-NVFP4

## Resumen

Vipunen-35B-A4B-Translator-APA7-NVFP4 es un ajuste fino especializado del modelo Kataguru Vipunen-35B-A4B, que a su vez deriva de Qwen/Qwen3.6-35B-A3B. Lo desarrolla el usuario independiente kataguru y está orientado a dos tareas concretas: traducción bidireccional inglés-finés de calidad académica y auditoría de citación según el estilo APA 7 en ambos idiomas. El modelo conserva la arquitectura MoE del original con aproximadamente 36 000 millones de parámetros totales y una configuración de expertos activos de tipo A4B (diez expertos por token).

La relevancia del modelo radica en su enfoque de especialización estricta: todo el presupuesto de entrenamiento se dedica a la pareja EN ↔ FI y a la verificación APA 7, sin dilución hacia otros idiomas. El autor reporta mejoras sustanciales en una evaluación ciega de 60 tareas (de 5,52 a 8,24 sobre 10 con un juez congelado) y un incremento de 1,95 puntos porcentuales en un conjunto oficial de 15 benchmarks respecto a su modelo padre.

La versión publicada está cuantizada en NVFP4 para su uso en GPU Blackwell mediante vLLM, con un tamaño de repositorio de 25,6 GB. Mantiene intactos el codificador visual (333 tensores), los tensores de especulación MTP (19) y una longitud de contexto nativa de 262 144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe, base Qwen3.6-35B-A3B) con spine SOMA/ARA y decodificacion especulativa MTP |
| Parametros totales | 35 951 822 704 |
| Parametros activos | Configuracion A4B con top_k = 10 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 262 144 tokens (nativa) |
| Tipos de cuantizacion | NVFP4 (8-bit segun tags de Hugging Face, formato compressed-tensors); existe version GGUF en repo separado |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4); GGUF disponible en kataguru/Vipunen-35B-A4B-Translator-APA7-GGUF |

## Arquitectura y entrenamiento

El modelo parte de Kataguru Vipunen-35B-A4B-BF16, construido sobre Qwen3.6-35B-A3B con un spine BF16 puro denominado SOMA/ARA en las capas 14 a 39 (atención y experto compartido), un ajuste finés específico de dominio técnico (PLC/CNC) y una configuración de enrutamiento con diez expertos por token. La arquitectura es un transformer de mezcla de expertos con codificador visual multimodal y tensores de especulación MTP para decodificación especulativa.

El ajuste fino se realizó con LoRA de subespacio ortonormal de tipo qr_frozen_a sobre todos los expertos (r=32, alpha=64), con multiplicadores de learning rate diferenciados para atención (0,40) y router (0,02), congelación automática del router en el paso 200, schedule WSD, learning rate de 2,2e-5 y una época. El corpus certificado consta de 6 677 filas: 904 auditorías APA 7 unificadas con enfoque findings-first y marcadores anti-alucinación `[PUUTTUU:]`, 4 984 pares bidireccionales EN ↔ FI (IMRaD académico, glosarios, técnica, ciencia, medicina, derecho, prosa literaria y erótica consentida sin censura) y 793 anclas de protección del modelo base. Tras el entrenamiento se aplicó una fusión BF16 en streaming y la cuantización a NVFP4 (30 720 matrices, sin desviaciones de escala reportadas).

## Capacidades

- Traducción bidireccional inglés-finés con registro académico, técnico, científico, médico, jurídico y literario.
- Auditoría de citación y formato APA 7 en finés e inglés, con verificación cruzada entre citas en texto y referencias.
- Marcado explícito de información faltante o no verificable mediante `[PUUTTUU: tarkista lähteestä]` / `[MISSING: verify from source]`.
- Soporte de glosarios mediante etiqueta `<glossary>` para fijar terminología.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al codificador visual intacto.
- Decodificación especulativa mediante tensores MTP.
- Generación de texto general, razonamiento y matemáticas heredados del modelo base, con mejora reportada en IFEval, ARC y GPQA.
- Preservación de Markdown, código y LaTeX en las traducciones.
- Producción de ficción adulta sin censura (el autor reporta 0/4 rechazos en esa categoría).

## Casos de uso

- Traducción de artículos académicos IMRaD del inglés al finés y viceversa: el modelo está entrenado específicamente en estructura metodológica y terminología de investigación, con glosarios fijables para mantener coherencia terminológica a lo largo del documento.
- Revisión de tesis y manuscritos para universidades finlandesas: la auditoría APA 7 con verificación 1:1 entre citas y referencias permite detectar referencias huérfanas o citas sin entrada bibliográfica, señalando lo no verificable en lugar de inventarlo.
- Localización de documentación técnica y jurídica (Finlex, normativa, manuales): el corpus incluye derecho y ciencia, y el modelo conserva bloques de código y fórmulas sin alterarlos.
- Corrección y traducción de literatura y ensayo: el registro literario reporta la mayor mejora relativa frente al modelo padre (de 4,38 a 7,12 sobre 10), adecuado para editoriales y revistas.
- Traducción de contenido médico y de salud pública (referencias THL): útil en la adaptación de materiales clínicos entre inglés y finés con terminología controlada.
- Revisión de bibliografía en flujos editoriales automatizados: integrable en pipelines que reciban manuscritos y devuelvan un informe de hallazgos APA 7 con marcas de verificación pendiente.
- Traducción de ficción adulta sin restricciones: para editoriales de género que requieran traducción sin rechazos ni autocensura.

## Benchmarks y rendimiento

Evaluación ciega de 60 tareas (20 auditorías APA 7 y 40 traducciones EN ↔ FI) con juez congelado (Vipunen-35B-A4B, temperatura 0,1):

| Metrica | Modelo padre | Translator-APA7 | Delta |
|---|---|---|---|
| Puerta determinista superada (60 tareas) | 40/60 (66,7 %) | 54/60 (90,0 %) | +23,3 pp |
| Media del juez congelado (0-10) | 5,52 | 8,24 | +2,72 |
| Auditor APA 7 (20 tareas) | 3,15 | 8,57 | +5,42 (2,72x) |
| APA 7 académico EN ↔ FI (12 tareas) | 7,35 | 8,58 | +1,23 |
| Vocabulario equilibrado y glosario (12) | 7,62 | 8,58 | +0,96 |
| Técnica, ciencia, medicina y derecho (8) | 6,38 | 7,50 | +1,12 |
| Literatura, ensayo y diálogo (4) | 4,38 | 7,12 | +2,74 |
| Ficción adulta sin censura (4) | 5,00 | 7,12 | +2,12 |

Comparativa oficial de 15 benchmarks (2x RTX 5090 32 GB, TP=2, vLLM, max_model_len 16384):

| Benchmark | Qwen3.6-35B-A3B base (k=8) | Vipunen-35B-A4B (k=10) | Translator-APA7 (k=10) |
|---|---|---|---|
| IFEval Prompt Strict | 55,27 % | 58,41 % | 65,80 % |
| IFEval Inst Strict | 64,15 % | 66,67 % | 72,54 % |
| GPQA Diamond | 70,20 % | 72,73 % | 73,23 % |
| ARC-Easy | 71,68 % | 73,99 % | 78,79 % |
| ARC-Challenge | 54,78 % | 56,74 % | 60,49 % |
| GSM8K Math (Strict, 1024 tok) | 34,42 % | no disponible en la informacion | no disponible en la informacion |

El resto de los 15 benchmarks no se detalla en la informacion proporcionada; el autor reporta una media global de 63,40 % para el modelo padre y 65,35 % para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26 GB solo para pesos en NVFP4, más overhead de caché KV; con contexto largo la demanda crece de forma significativa.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090 32 GB, B200) por el soporte nativo de NVFP4; el autor valida con 2x RTX 5090 en tensor parallel 2.
- No cabe en GPU de consumo con menos de 24-32 GB; no es viable en tarjetas Ampere o Ada sin conversión a otro formato de cuantización.
- Opciones de despliegue: vLLM (formato principal, con CUDAGraphs), llama.cpp o LM Studio mediante la versión GGUF del repositorio hermano.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vipunen-35B-A4B-Translator-APA7-NVFP4 | ~36 000 M | 262 144 | Apache 2.0 | Traduccion EN ↔ FI y auditoria APA 7 |
| Kataguru Vipunen-35B-A4B (padre) | ~36 000 M | 262 144 | Apache 2.0 | Modelo generalista finés con SOMA/ARA |
| Qwen3.6-35B-A3B (base) | ~35 000 M | no disponible en la informacion | no disponible en la informacion | Modelo generalista multilingue |

No se dispone de datos de benchmarks de terceros independientes para comparar directamente con alternativas especializadas en traducción finés-inglés.

## Limitaciones y advertencias

- Especialización estricta: el entrenamiento se limita a EN ↔ FI y APA 7; el rendimiento en otros idiomas depende únicamente del modelo base y no ha sido reforzado.
- Riesgo de alucinación mitigado pero no eliminado: el modelo emplea marcadores `[PUUTTUU:]` y `[MISSING:]`, pero el usuario debe verificar toda referencia señalada.
- Requiere hardware Blackwell para explotar NVFP4; en otras arquitecturas es necesario recurrir a la versión GGUF con pérdida potencial de rendimiento.
- Sesgos: no se documentan análisis de sesgo en la informacion proporcionada.
- La evaluación reportada procede del propio autor, con juez derivado de su modelo padre y sin validación externa independiente.
- El modelo no está diseñado para fines generales fuera de traducción y auditoría; su uso como asistente general no ha sido evaluado.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad sobre contenido generado (incluida ficción adulta) recae en el desplegador.
- Contexto nativo de 262 144 tokens, aunque las pruebas del autor se limitan a 16 384 tokens; el comportamiento en ventanas muy largas no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Vipunen-35B-A4B-Translator-APA7-NVFP4
- Versión GGUF: https://huggingface.co/kataguru/Vipunen-35B-A4B-Translator-APA7-GGUF
- DOI de métodos: https://doi.org/10.5281/zenodo.24445840
- DOI de sistemas (vllm#52525): https://doi.org/10.5281/zenodo.24445305

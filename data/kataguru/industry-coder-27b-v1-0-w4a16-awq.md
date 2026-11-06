# kataguru/Industry-Coder-27B-v1.0-W4A16-AWQ

## Resumen

Industry-Coder-27B-v1.0-W4A16-AWQ es la versión cuantizada a INT4 (W4A16) del modelo denso de 27 000 millones de parámetros Industry-Coder-27B-v1.0, desarrollado por el usuario kataguru. Está especializado en ingeniería de software industrial, programación algorítmica, tool calling agéntico, automatización de PLC/CNC (Beckhoff TwinCAT 3 ST y Siemens SCL), redacción de patentes europeas y finlandesas (EPO/PRH) y razonamiento STEM de nivel doctoral. El modelo parte de una base Qwen 3.8 27B con backbone híbrido de 64 capas (Gated DeltaNet más atención completa), 333 tensores de visión y 15 tensores de decodificación especulativa MTP, todos preservados en BF16 tras la cuantización.

La versión AWQ emplea `compressed-tensors` con `group_size=32` y calibración MSE, lo que reduce el peso en disco a 27 GB y permite desplegarlo en vLLM sobre una GPU de 32 GB o dos GPUs de 16-24 GB en tensor parallel. El autor declara un contexto nativo de 262 144 tokens y soporte nativo de inglés y finés, con un ajuste orientado a eliminar rechazos (0,00 % de alineamiento de rechazo según la model card). Es relevante ahora porque combina en un único checkpoint multimodal capacidades de código competitivo, function calling y dominio industrial vertical, un perfil poco habitual en modelos abiertos de este tamaño.

La licencia Apache 2.0 y el formato vLLM listo para producción lo sitúan como una opción práctica para equipos que necesitan desplegar asistentes de ingeniería con contexto largo sin depender de APIs propietarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 capas (Gated DeltaNet + atención completa), con torre de visión y cabezas MTP |
| Parámetros totales | 27 781 427 952 (27,78 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantización | W4A16 pack-quantized (`compressed-tensors`, `group_size=32`, calibración MSE); visión y MTP en BF16 |
| Idiomas soportados | Inglés (en) y finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards, 27,0 GB en disco) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone híbrido de 64 capas que alterna Gated DeltaNet con atención completa, una elección que reduce el coste computacional en secuencias largas manteniendo el contexto nativo de 262 144 tokens. Incluye 333 tensores de visión en BF16 (capacidad multimodal) y 15 tensores de decodificación especulativa MTP (multi-token prediction), también preservados en precisión completa tras la cuantización. La versión AWQ cuantiza únicamente las proyecciones lineales a INT4 con grupo de 32 y calibración MSE, manteniendo activaciones en 16 bits.

El entrenamiento de ajuste descrito en la model card se basa en un currículo de cuatro ciclos de "Merge-and-Reset" con un banco de élite en el ciclo 4 de dificultad estrictamente no decreciente, entrenamiento en subespacio ortonormal `r=16 qr_frozen_a`, y una alineación orientada a eliminar rechazos (SOMA/ARA, 0,00 % de refusal). También se menciona una plantilla de chat propietaria de cuatro modos (Quad-Mode). No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código en Python, Rust, C, Java y JavaScript, con resultados medidos en LiveCodeBench v6 (36,57 % Pass@1 sobre 175 tareas).
- Tool calling y function calling agéntico, evaluado en BFCL V4 con 71,78 % de AST global (Python 96,25 %, múltiples llamadas 99,50 %).
- Razonamiento STEM de nivel doctoral: 67,17 % en GPQA Diamond (133/198) y 89,92 % en GSM8K con CoT de 1024 tokens.
- Capacidad multimodal de visión mediante 333 tensores dedicados.
- Decodificación especulativa MTP integrada para acelerar la inferencia.
- Soporte nativo de inglés y finés, con especial atención a la calidad morfológica del finés en dominios técnicos.
- Dominio vertical de automatización industrial: generación de código Beckhoff TwinCAT 3 Structured Text y Siemens SCL para PLC/CNC.
- Redacción y análisis de reivindicaciones de patentes en el marco EPO/PRH.
- Modo "uncensored" con alineación de rechazo declarada en 0,00 %, según la model card.
- Seguimiento de instrucciones estricto: 70,43 % en IFEval Strict y 79,26 % en prompt strict.

## Casos de uso

- Generación de código de automatización industrial: el modelo produce Structured Text para Beckhoff TwinCAT 3 y SCL para Siemens a partir de descripciones de proceso, lo que permite prototipar lógica de PLC sin escribir manualmente cada bloque.
- Asistente de programación en producción: con tool calling de 71,78 % en BFCL V4 y buen rendimiento en Python (96,25 % AST), puede integrarse en pipelines de CI/CD para generar parches, escribir tests o resolver issues con llamadas a herramientas externas.
- Redacción de patentes: dado su entrenamiento en EPO/PRH, sirve para redactar borradores de reivindicaciones y descripciones técnicas, así como para revisar la claridad y consistencia de solicitudes existentes.
- Razonamiento STEM asistido: con 67,17 % en GPQA Diamond, es adecuado para responder consultas técnicas de nivel posgrado en física, química, biología y matemáticas dentro de un asistente de investigación.
- Análisis de documentación técnica con visión: la torre de visión permite procesar esquemas eléctricos, diagramas P&ID o capturas de HMI y extraer información estructurada o generar código a partir de ellos.
- Chat de atención técnica multi-turno: el contexto de 262 144 tokens permite mantener conversaciones largas con historiales de incidencias, manuales y código, sin truncar información relevante.
- Asistente en finés para equipos industriales: el soporte nativo de finés en dominios técnicos lo hace utilizable en fábricas y empresas finlandesas para documentación, formación y soporte interno.
- Despliegue en clústeres vLLM con tensor parallel 2: su formato `compressed-tensors` y los 27 GB en disco permiten servirlo en dos RTX 5090 de 32 GB, según el entorno probado por el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre 2x NVIDIA RTX 5090 con TP=2 y CUDAGraphs:

| Benchmark | Qwen 3.8 27B base | Industry-Coder-27B v1.0 | Delta |
|---|---|---|---|
| GSM8K (strict / flex) | 76,50 % | 89,92 % (90,60 %) | +13,42 pp |
| HellaSwag (acc_norm) | 82,10 % | 82,74 % | +0,64 pp |
| MedQA (acc) | 78,40 % | 82,56 % | +4,16 pp |
| BoolQ (acc) | 86,40 % | 87,86 % | +1,46 pp |
| WinoGrande (acc) | 75,80 % | 76,24 % | +0,44 pp |
| TruthfulQA MC2 | 54,80 % | 53,47 % | -1,33 pp |
| TruthfulQA MC1 | 36,10 % | 34,76 % | -1,34 pp |
| PIQA (acc_norm) | 81,20 % | 81,77 % | +0,57 pp |
| OpenBookQA (acc_norm) | 44,20 % | 45,60 % | +1,40 pp |
| ARC-Challenge (acc_norm) | 61,10 % | 62,12 % | +1,02 pp |
| ARC-Easy (acc_norm) | 81,30 % | 81,99 % | +0,69 pp |
| Media cognitiva 11 tareas | 66,17 % | 70,82 % | +4,65 pp |
| GPQA Diamond | 45,20 % | 67,17 % | +21,97 pp |
| IFEval Strict (prompt / strict) | 48,20 % / 58,40 % | 70,43 % / 79,26 % | +22,23 / +20,86 pp |
| LiveCodeBench v6 (Pass@1) | 26,86 % | 36,57 % (64/175) | +9,71 pp |
| BFCL V4 (single-turn AST) | 62,60 % | 71,78 % | +9,18 pp |
| Media compuesta 15 benchmarks | 60,31 % | 68,33 % | +8,02 pp |

Desglose de LiveCodeBench v6: Easy 86,05 % (37/43), Medium 34,62 % (18/52), Hard 11,25 % (9/80).

## Requisitos de hardware

- VRAM estimada: aproximadamente 27 GB de pesos en INT4 más overhead de KV cache; el autor indica 32 GB o más en una sola GPU, o dos GPUs de 16-24 GB en TP=2.
- GPUs recomendadas: Ampere, Ada Lovelace, Hopper y Blackwell. Entorno probado: 2x NVIDIA GeForce RTX 5090 de 32 GB con TP=2.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB (una o dos unidades) y en configuraciones de dos GPUs de 24 GB como RTX 4090.
- Opciones de despliegue: `vllm serve` con `--quantization compressed-tensors --tensor-parallel-size 2` es el runtime recomendado y probado (vLLM v0.29.0-cu129, CUDAGraphs activados). No se mencionan otros runtimes en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Industry-Coder-27B-v1.0-W4A16-AWQ | 27,78 B (denso) | 262 144 | Apache 2.0 | Código industrial, tool calling, STEM, multimodal |
| Qwen 3.8 27B (base) | 27 B (denso) | 262 144 | No disponible | Modelo generalista del que deriva |
| Kataguru ChemBio-27B v2 | 27 B (denso) | No disponible | No disponible | Química y biología, mismo pipeline de ajuste |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- Solo se declaran inglés y finés como idiomas soportados; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- El modo "uncensored" con 0,00 % de rechazo implica que el modelo puede generar contenido que otros modelos filtran; requiere moderación externa en producción.
- Retroceso en TruthfulQA (MC1 y MC2) respecto al modelo base, lo que sugiere mayor riesgo de afirmaciones no veraces en preguntas factuales.
- El rendimiento en LiveCodeBench decae fuertemente en tareas difíciles (11,25 % en Hard frente a 86,05 % en Easy).
- La cuantización W4A16 puede introducir degradación adicional no cuantificada en la model card; los benchmarks publicados corresponden a la versión BF16 salvo que se indique lo contrario.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en dominios regulados (patentes, seguridad industrial).
- El modelo tiene 58 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.
- El contexto de 262 144 tokens exige planificación de memoria KV cache; en configuraciones de 32 GB puede requerir cuantización del cache o reducir la longitud efectiva.
- No se detallan los datos de entrenamiento ni los sesgos conocidos, lo que dificulta evaluar riesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-W4A16-AWQ
- Modelo base BF16: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-BF16
- Variante ChemBio-27B v2: no disponible como enlace directo en la información proporcionada
- Paper, blog o repositorio adicional: no disponibles en la información proporcionada

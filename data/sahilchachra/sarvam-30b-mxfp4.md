# sahilchachra/sarvam-30b-MXFP4

## Resumen

`sarvam-30b-MXFP4` es una cuantización en formato MXFP4 (4 bits) del modelo `sarvam-30b` de Sarvam AI, realizada por Sahil Chachra con la librería MLX para ejecución en Apple Silicon. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 32.15 mil millones de parámetros, de los cuales solo 2.4 mil millones (sin contar embeddings) se activan por token, diseñado específicamente para entornos con recursos limitados y con un enfoque prioritario en el contexto y las lenguas de la India (22 idiomas indios además del inglés).

Esta versión cuantizada reduce el peso en disco a 17 GB (frente a los ~32 GB de la versión MXFP8) y mantiene la precisión en las partes críticas: el `lm_head` (matriz de 1.07B parámetros sin atar) y los routers MoE se conservan en bf16. El modelo es de solo texto, no tiene torre de visión, y emite un bloque de razonamiento (`thinking...`) antes de la respuesta final. Requiere un parche manual de `mlx-lm` (PR #991 aún sin fusionar) para poder cargar la arquitectura `sarvam_moe`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE personalizada `sarvam_moe`: 19 capas transformer (la primera densa, el resto MoE), 128 expertos enrutados + 1 experto compartido, top-6 con enrutamiento sigmoid-gated, GQA (64 cabezas de consulta / 4 de clave-valor), QK-RMSNorm, `lm_head` sin atar de 262K vocabulario |
| Parametros totales | 32.15B (según FitMyLLM) |
| Parametros activos | 2.4B no-embedding (según AIKosh) |
| Longitud de contexto | 32K tokens (según FitMyLLM) |
| Tipos de cuantizacion | MXFP4 (~4.6 bpw, grupo de 32) en este repo; existe variante MXFP8 (~8.5 bpw) |
| Idiomas soportados | 22 lenguas indias + inglés (según la web del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura `sarvam_moe` es una variante MoE de DeepSeek: 19 capas transformer donde la primera es densa y las 18 restantes son MoE con 128 expertos enrutados más un experto compartido. El enrutamiento usa top-6 con activación sigmoid y un factor de escala de 2.5, con sesgo de experto para balanceo de carga. La atención es grouped-query con 64 cabezas de consulta y 4 de clave-valor, normalizada con QK-RMSNorm. El `lm_head` está sin atar (262K vocabulario) y el tokenizador es multilingüe, cubriendo escrituras de lenguas indias.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Según la web del modelo base, el entrenamiento se centró en el contexto indio y las lenguas de la India, logrando rendimiento de vanguardia en 22 idiomas indios para su tamaño. El modelo es de solo texto y no soporta visión.

## Capacidades

- Generación de texto y razonamiento: emite un bloque de razonamiento (`thinking...`) antes de la respuesta final, similar a modelos de razonamiento.
- Tool calling / function calling: el modelo base está diseñado para manejar llamadas a herramientas, incluso en llamadas de voz multilingües (según la web oficial).
- Capacidades multilingües: fuerte rendimiento en 22 lenguas indias (hindi, tamil, telugu, bengalí, etc.) además de inglés.
- Razonamiento matemático y lógico: verificado con pruebas de aritmética paso a paso en la cuantización MXFP4.
- Sin soporte de visión: es un modelo de solo texto.
- Sin soporte de audio nativo: aunque el modelo base puede integrarse en pipelines de voz, no procesa audio directamente.

## Casos de uso

- Atención al cliente multilingüe en India: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, telugu y otras lenguas indias, con contexto de 32K tokens para mantener el historial de la conversación. Su capacidad de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Asistentes de voz en lenguas indias: al ser un modelo de texto, puede usarse como backend de un pipeline de voz a texto y texto a voz, manejando llamadas de voz multilingües con llamadas a herramientas (por ejemplo, consultar saldos o reservar citas).
- Generación de código en entornos con recursos limitados: con solo 2.4B parámetros activos, puede ejecutarse en hardware modesto (Apple Silicon con 32 GB de RAM) y usarse para autocompletar código o generar scripts en pipelines de CI/CD.
- Razonamiento matemático y lógico en aplicaciones educativas: su capacidad de razonamiento paso a paso lo hace adecuado para tutores automáticos que expliquen problemas de aritmética o álgebra en inglés o lenguas indias.
- Análisis de documentos en lenguas indias: puede resumir o extraer información de textos largos (hasta 32K tokens) en escrituras no latinas, útil para el sector legal o administrativo en India.
- Prototipado de agentes conversacionales: su soporte de tool calling y razonamiento multi-paso permite construir agentes que consulten APIs, bases de datos o servicios externos, ejecutándose localmente en Macs con chip M-series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web FitMyLLM menciona 14 benchmarks y 14 cuantizaciones, pero no proporciona valores numéricos. La model card de la cuantización solo incluye pruebas de humo cualitativas (respuestas correctas en inglés, hindi y tamil) sin métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 17 GB en disco para la versión MXFP4; en Apple Silicon, la memoria unificada debe ser de al menos 24 GB (recomendable 32 GB) para cargar el modelo y dejar espacio para el contexto y la generación.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 series) con 32 GB o más de memoria unificada. Para la variante MXFP8 (32 GB en disco) se necesitan 48 GB o más.
- No es compatible con GPUs NVIDIA de forma directa: el formato MLX es específico de Apple Silicon. Para ejecutarlo en CUDA habría que convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar), lo que no está disponible en este repo.
- Opciones de despliegue: `mlx-lm` (Python) con el parche del PR #991. No funciona en LM Studio ni en herramientas que incluyan su propia versión de mlx-lm sin parchear.
- Latencia y throughput: no se han publicado mediciones. Dado que es un MoE con 2.4B parámetros activos, la generación debería ser rápida en Apple Silicon, pero depende del número de tokens de razonamiento emitidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| sarvam-30b (MXFP4) | 32.15B | 2.4B | 32K | Apache-2.0 | MLX (Apple Silicon) |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache-2.0 | Multi-formato (GGUF, safetensors) |
| Qwen2.5-32B (dense) | 32.5B | 32.5B | 128K | Apache-2.0 | Multi-formato |
| DeepSeek-V2-Lite | 15.7B | 2.4B | 32K | MIT | Multi-formato |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa. La principal diferencia de `sarvam-30b` es su enfoque en lenguas indias, donde supera a los modelos occidentales de tamaño similar, y su eficiencia (2.4B activos) que lo hace viable en hardware de gama media.

## Limitaciones y advertencias

- Requiere un parche manual de `mlx-lm` (PR #991 sin fusionar). Sin ese paso, el modelo no carga. No es compatible con LM Studio ni otras herramientas que no permitan vender el archivo `sarvam_moe.py`.
- Modelo de solo texto: no procesa imágenes ni vídeo.
- La cuantización MXFP4 afecta a `embed_tokens` (tabla de embeddings de entrada), lo que puede degradar ligeramente la calidad en escrituras no latinas. Las pruebas de humo muestran resultados correctos en hindi y tamil, pero no hay garantía exhaustiva.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos potenciales: al estar entrenado principalmente con datos de la India, puede tener un sesgo cultural y geográfico hacia ese contexto. No se han publicado evaluaciones de sesgo.
- El modelo emite un bloque de razonamiento antes de la respuesta; si se limita `max_tokens`, la respuesta visible puede quedar truncada.
- La licencia Apache-2.0 permite uso comercial, pero el soporte de la arquitectura `sarvam_moe` en MLX es comunitario y no oficial hasta que se fusione el PR.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/sahilchachra/sarvam-30b-MXFP4
- Modelo base: https://huggingface.co/sarvamai/sarvam-30b
- PR de mlx-lm para soporte de `sarvam_moe`: https://github.com/ml-explore/mlx-lm/pull/991
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/sarvam-30b
- Ficha en AIKosh (India AI): https://aikosh.indiaai.gov.in/home/models/details/sarvam2_30b_a2b_4.html
- Variante MXFP8: https://huggingface.co/sahilchachra/sarvam-30b-MXFP8

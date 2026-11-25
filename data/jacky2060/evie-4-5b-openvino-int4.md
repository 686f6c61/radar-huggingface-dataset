# jacky2060/EVIE-4.5B-openvino-int4

## Resumen

EVIE-4.5B-openvino-int4 es una exportación cuantizada a INT4 en formato OpenVINO IR del modelo tencent/EVIE-4.5B, un sistema de recuperación visual de documentos (visual document retrieval) basado en la arquitectura ColQwen3_5. Lo publica el usuario jacky2060 y su propósito es reducir el peso en disco de 8,5 GiB (BF16) a 2,6 GiB, manteniendo la arquitectura original y permitiendo inferencia eficiente en CPU y otros dispositivos compatibles con OpenVINO.

El modelo resuelve el problema de la búsqueda semántica sobre documentos escaneados o renderizados como imagen, sin necesidad de OCR previo. Usa interacción tardía (late interaction) con embeddings multi-vector por página y proyección Prefix-MRL de 2048 dimensiones, lo que permite truncar los vectores en tiempo de ejecución a dimensiones menores (64, 128, 256, 512, 1024, 2048) sin reentrenar ni recodificar.

Es relevante para desarrolladores que necesitan desplegar recuperación documental en entornos con recursos limitados o sin GPU, ya que combina una cuantización agresiva (INT4 asimétrica con NNCF) con una API de inferencia autocontenida y scripts de ejemplo incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColQwen3_5 (vision encoder Qwen3_5VisionModel + Qwen3_5TextModel con capas de atención completa bidireccional y recurrencia lineal GatedDeltaNet, proyección Prefix-MRL de 2048D, normalización L2 por token) |
| Parametros totales | 4.5B (según nombre del modelo base; desglose exacto no disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimétrico (group_size=128, ratio=1.0, all_layers=False) con respaldo INT8 asimétrico en embeddings, convoluciones y cabezas de proyección; INT8 per-channel en embed_tokens |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (.xml / .bin) |

## Arquitectura y entrenamiento

El modelo base es un ColQwen3_5, una variante de recuperación visual de documentos que combina un codificador visual Qwen3_5VisionModel con un modelo de lenguaje Qwen3_5TextModel. La arquitectura preserva capas de atención completa bidireccional junto con una recurrencia de atención lineal GatedDeltaNet de longitud dinámica, e incorpora una proyección Prefix-MRL de 2048 dimensiones (custom_text_proj) con normalización L2 por token. Esta proyección elástica permite truncar los embeddings a dimensiones menores en tiempo de ejecución sin necesidad de checkpoints separados.

La cuantización se realizó con NNCF 3.4.0 usando CompressWeightsMode.INT4_ASYM con group_size=128 y ratio=1.0, manteniendo en INT8 las capas arquitectónicamente sensibles: embeddings, convoluciones y cabezas de proyección final. El resultado son tres submodelos OpenVINO: vision model (173 MiB, 96% INT4 / 4% INT8), embed_tokens (607 MiB, 100% INT8) y language model más proyección (1,8 GiB, 248 capas Linear en INT4 y 25 capas en INT8). No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Recuperación visual de documentos: genera embeddings multi-vector a partir de imágenes de páginas y de consultas textuales, y calcula puntuaciones MaxSim para el ranking.
- Interacción tardía (late interaction): puntuación por token entre consulta y documento, típica de la familia ColPali/ColQwen.
- Embeddings elásticos con Prefix-MRL: truncado y renormalización L2 en tiempo de ejecución a dimensiones {64, 128, 256, 512, 1024, 2048} sin recodificar.
- Indexación por lotes: script de ejemplo que empaqueta páginas en un índice multi-vector .npz en float16 y permite consultas posteriores sin reejecutar el codificador visual.
- Inferencia en CPU mediante OpenVINO, con soporte de device configurable.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión general, audio ni modo thinking; el pipeline declarado es exclusivamente visual-document-retrieval.

## Casos de uso

- Búsqueda semántica sobre facturas y albaranes escaneados: indexar páginas como imágenes y consultar por campos como "fecha de vencimiento de la factura 4412" sin OCR, usando el scoring MaxSim del modelo.
- Recuperación en archivos documentales corporativos: construir un índice multi-vector con el script batch_index_search.py y servir consultas en CPU, aprovechando el reducido peso de 2,6 GiB para despliegues en servidores sin GPU.
- Atención al cliente interna sobre manuales y políticas: localizar la página relevante de un PDF renderizado antes de pasarla a un LLM generador, en una arquitectura RAG de dos etapas.
- Digitalización de archivos históricos o escaneos de baja calidad: al operar directamente sobre píxeles, evita errores de OCR en documentos con tipografías degradadas o layouts complejos.
- Búsqueda en informes financieros y memorias anuales: consultas como "ingresos del tercer trimestre de 2024" sobre páginas renderizadas, con truncado a 128 dimensiones para reducir el coste de almacenamiento del índice.
- Despliegue en dispositivos de borde o entornos air-gapped: el formato OpenVINO IR y la inferencia en CPU permiten ejecutar el modelo localmente sin dependencias de GPU ni servicios en la nube.
- Prototipado rápido de sistemas de recuperación documental: los scripts de ejemplo incluidos (quickstart, prefix_mrl_demo, batch_index_search) permiten evaluar el compromiso entre tamaño de vector y precisión top-1 antes de comprometerse con una configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (ViDoRe, MMLU, etc.) en la información disponible. La model card incluye una verificación cualitativa sobre un subconjunto de demostración de 4 páginas:

| Consulta | Head dim | Top-1 OpenVINO INT4 (puntuación / siguiente) | Referencia PyTorch BF16/FP32 |
|---|---|---|---|
| "What was Q3 2024 revenue?" | 128 | q3_revenue.png (19,407 vs 8,383) | q3_revenue.png (18,468 vs 8,410) |
| "What is the due date on invoice 4412?" | 128 | invoice_4412.png (20,206 vs 10,475) | invoice_4412.png (19,282 vs 8,833) |
| "Where is Warehouse B located?" | 128 | warehouse_b.png (13,390 vs 6,453) | no disponible |
| "What is the employee headcount?" | 128 | headcount.png (15,853 vs 8,232) | no disponible |
| "What was Q3 2024 revenue?" (2 páginas) | 2048 | q3_revenue.png (19,193 vs 7,180) | no disponible |
| "What is the due date on invoice 4412?" (2 páginas) | 2048 | invoice_4412.png (20,138 vs 7,370) | no disponible |

## Requisitos de hardware

- VRAM estimada: al estar en formato OpenVINO IR, el modelo está pensado para inferencia en CPU; el peso total en disco es de 2,6 GiB, por lo que la memoria RAM necesaria para cargarlo ronda esa cifra más el overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; OpenVINO soporta dispositivos CPU, GPU e iGPU, pero no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: no confirmado en la documentación; la verificación publicada se realizó en CPU.
- Opciones de despliegue: OpenVINO Runtime (openvino==2026.4.1) con NNCF 3.4.0; el repositorio incluye el wrapper OVColQwen3_5 y el CLI infer_ov.py. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVIE-4.5B-openvino-int4 | 4.5B | no disponible | OpenVINO IR INT4 (2,6 GiB) | Apache 2.0 | Hugging Face (jacky2060) |
| tencent/EVIE-4.5B (base) | 4.5B | no disponible | safetensors BF16 (8,5 GiB) | Apache 2.0 | Hugging Face (tencent) |
| ColQwen / ColPali (familia) | no disponible | no disponible | safetensors | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para recuperación visual de documentos; no genera texto ni responde preguntas de forma autónoma.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto del modelo base, lo que dificulta planificar el tamaño de página o el número de tokens visuales por documento.
- La cuantización INT4 puede introducir degradación en la precisión de recuperación respecto al BF16 original; la verificación publicada se limita a 4 páginas de demostración y no constituye una evaluación exhaustiva.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en el ranking de páginas.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base tencent/EVIE-4.5B y de los datos de entrenamiento originales.
- El ecosistema de despliegue es específico de OpenVINO; no hay soporte documentado para vLLM, llama.cpp u otros runtimes habituales.
- El repositorio tiene un volumen muy bajo de descargas (14) y ningún "like", por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jacky2060/EVIE-4.5B-openvino-int4
- Modelo base: https://huggingface.co/tencent/EVIE-4.5B
- Referencia arXiv citada en los tags: arxiv:2610.11553 (no verificable en la información disponible)
- OpenVINO: https://docs.openvino.ai/
- NNCF: https://github.com/openvinotoolkit/nncf
- uv (gestor de entornos recomendado en la model card): https://docs.astral.sh/uv/

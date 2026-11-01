# pitcany/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos publicado por el equipo Qwen (Alibaba) bajo el identificador `pitcany/Qwen3.8-Flash-Next` en Hugging Face. Se presenta como la primera release abierta de la arquitectura que servirá de base para Qwen4, un rediseño profundo de los componentes centrales de los LLM modernos orientado a escalar de forma eficiente en lugar de simplemente acumular parámetros. El modelo es multimodal (image-text-to-text): combina un transformer causal con un codificador de visión.

La arquitectura es un híbrido MoE con atención híbrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual, N-gram Embedding y Multi-Token Prediction. Declara 125B parámetros en el language model con 6B activos, más 51B de n-gram embedding y 4B de MTP, lo que da un total real en safetensors de 179.999.981.459 parámetros (unos 180B). El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia es doble: por un lado introduce innovaciones arquitectónicas concretas (atención dispersa a nivel de micro-bloque, embeddings de n-gramas para escalar parámetros sin coste de cómputo proporcional, gates en el residual stream); por otro, es la base sobre la que se construye la versión de producción Qwen3.8-Flash servida vía Qwen Cloud con 1M de contexto por defecto y herramientas integradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; layout 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)) |
| Parametros totales | 179.999.981.459 (~180B, dato real de safetensors); LM 125B + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B (MoE: 10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). La columna vertebral combina dos mecanismos de atención en un patrón repetido: por cada bloque de tres capas con Gated DeltaNet (atención lineal) hay una capa con Qwen Sparse Attention (QSA). Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128. QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, con 24 cabezas de query y 2 de KV, dimensión de cabeza 256, RoPE de 64 dimensiones, un indexador MQA (4 cabezas de query, 1 cabeza de clave compartida, dimensión 128) y un presupuesto de 512 bloques o 2048 tokens. El objetivo declarado es reducir la latencia en contexto largo, un punto crítico para cargas agénticas.

La capa MoE tiene 512 expertos con 10 enrutados más 1 compartido activos, con dimensión intermedia de experto 640. El hidden dimension es 2560, con 48 capas y un token embedding de 248.320 (padded). El N-gram Embedding indexa bigramas y trigramas en la capa 2 con 20.000.000 de entradas, una vía de escalado de parámetros más barata en cómputo y más fácil de descargar a memoria que el MoE. El Gated Residual introduce 4 ramas con rango de cuello de botella 320, modulando el flujo de información mediante una compuerta de lectura elemento a elemento dependiente de datos y una compuerta escalar de escritura por rama. Se añade una capa MTP entrenada con múltiples pasos para decodificación especulativa. En el recetario de entrenamiento se aplican Muon y AdamW a categorías de pesos específicas, se elimina el warmup de batch size (arranque directo en el tamaño objetivo) y se usan learning rates más altos guiados por scaling laws reajustadas.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo incorpora un codificador de visión.
- Razonamiento en contexto largo: ventana nativa de 262.144 tokens, extensible a 1M.
- Capacidades agénticas: la arquitectura está explícitamente optimizada para cargas de trabajo agénticas según el autor.
- Decodificación especulativa mediante la capa MTP (multi-token prediction).
- Compatibilidad con tool calling / function calling: no confirmada explícitamente en la model card para esta release; la versión de producción Qwen3.8-Flash sí declara herramientas integradas oficiales.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: informes, contratos o expedientes de cientos de miles de tokens que combinan texto y figuras, aprovechando la ventana nativa de 262K y el codificador de visión.
- Agentes autónomos de múltiples pasos: la combinación de QSA (baja latencia en contexto largo) y MTP (decodificación especulativa) reduce el coste por paso en bucles agénticos con historial acumulado.
- Asistencia sobre repositorios de código completos: con contexto extensible a 1M tokens se puede cargar un repositorio entero y razonar sobre dependencias entre ficheros.
- Procesamiento de imágenes técnicas: lectura de diagramas de arquitectura, capturas de pantalla de interfaces o gráficos en pipelines de documentación automática.
- Investigación en arquitecturas eficientes: al ser una preview experimental de la arquitectura de Qwen4 con pesos abiertos, sirve como banco de pruebas para estudiar atención híbrida, n-gram embeddings y gated residual en condiciones reales.
- Despliegue en infraestructura propia con vLLM, SGLang o TokenSpeed: los pesos son compatibles con estos motores, lo que permite servir el modelo sin depender de la API gestionada.
- Evaluación comparativa de decodificación especulativa: la capa MTP permite medir ganancias de throughput frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero en la información proporcionada solo aparece el encabezado de la tabla, sin las filas de datos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~180B parámetros totales, en BF16 se requieren aproximadamente 360 GB solo para pesos (coincide con el tamaño del repo, 360 GB). En cuantización de 8 bits, unos 180 GB; en 4 bits, unos 90 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: para BF16, nodos multi-GPU (por ejemplo, 4× H100 80GB o 8× A100 80GB). Para cuantización de 4 bits, 2× H100 80GB o 2× A100 80GB. La naturaleza MoE con 6B activos reduce el cómputo por token, pero no la huella de memoria.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en ninguna cuantización razonable; el n-gram embedding de 51B parámetros adicionales agrava el requisito de memoria. El autor destaca que el diseño de n-gram embedding es "amenable a offloading", lo que podría permitir esquemas híbridos GPU/CPU, pero no hay cifras publicadas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles. El autor afirma que QSA reduce significativamente la latencia en contexto largo y que MTP acelera la decodificación, pero no se aportan números.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B / 6B | 262K nativo, hasta 1M | qwen-community-1.0 | Pesos abiertos en HF; API vía Qwen Cloud (versión Flash) |
| Qwen3.8-Flash (producción) | no disponible | 1M por defecto | no disponible | Solo API gestionada en Qwen Cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otros laboratorios, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como "experimental preview" de la arquitectura de Qwen4; no debe asumirse estabilidad de API ni de comportamiento en producción.
- Licencia qwen-community-1.0: es una licencia comunitaria con condiciones específicas; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe sin evaluación propia.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni tasas de alucinación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación en la model card.
- Requisitos de memoria muy elevados: ~360 GB en BF16 hacen inviable el despliegue en hardware de consumo y limitan las opciones a clústeres multi-GPU.
- Tool calling no confirmado: aunque la versión de producción sí lo declara, esta release no lo especifica explícitamente.
- Contexto extensible a 1M: la extensión más allá de los 262K nativos puede degradar la calidad; no se aportan métricas de rendimiento en esa franja.
- Sin datos de benchmarks en la información disponible: imposible validar las afirmaciones de rendimiento del autor de forma independiente con lo aquí recogido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pitcany/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud: https://www.qwencloud.com
- Overview de Qwen3.8-Flash (versión de producción): https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png

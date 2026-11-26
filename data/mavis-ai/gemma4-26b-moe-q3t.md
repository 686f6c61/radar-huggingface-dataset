# mavis-ai/Gemma4-26B-MoE-Q3T

## Resumen

Gemma4-26B-MoE-Q3T es una cuantización de 3 bits del modelo multimodal Gemma 4 26B A4B de Google, publicada por mavis-ai. Se trata de un derivado cuantizado sin entrenamiento adicional (data-free), empaquetado específicamente para R.E.V.I.S., un sistema operativo cognitivo local para Mac con Apple Silicon. El modelo base es un transformer disperso (MoE) de 30 capas, tamaño oculto 2816, 128 expertos enrutados con 8 activos por token y una longitud de contexto de 262.144 tokens.

La relevancia de esta ficha es doble: por un lado ilustra el estado del arte en cuantización extrema de modelos MoE multimodales mediante códigos trellis (3 bits por peso en los expertos), y por otro documenta un caso de formato propietario que rompe la compatibilidad con el ecosistema estándar (transformers, vLLM, mlx-lm). El repositorio incluye además los drafters de decodificación especulativa MTP y DFlash en 8 bits, lo que permite acelerar la inferencia en el motor propietario.

El peso total del repositorio es de 13,7 GB, con 12,53 GB de pesos efectivos (11,7 GiB). El checkpoint declara 7.680.644.686 parámetros en safetensors, una cifra sensiblemente inferior a los 26B nominales del modelo base, lo que refleja la compresión del formato trellis y el empaquetado de los expertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4), 30 capas, hidden size 2816, 128 expertos enrutados con 8 activos |
| Parámetros totales | 7.680.644.686 (según safetensors del repo); modelo base nominal 26B A4B |
| Parámetros activos | 4B (A4B en el nombre del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q3T: expertos enrutados 3-bit trellis (K3), denso/atención/embeddings 6-bit affine (g64), routers y visión en BF16; KV cache 8-bit en runtime |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con tensores trellis (`.trellis`, `.suh`, `.svh`); drafters en safetensors 8-bit affine |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B A4B es un transformer disperso con mezcla de expertos: 128 expertos enrutados por capa, de los cuales se activan 8 por token, con 30 capas y dimensión oculta de 2816. Incluye una torre de visión y una proyección multimodal, lo que lo convierte en un modelo image-text-to-text. La cuantización Q3T no aplica ningún tipo de entrenamiento: es una receta fija y data-free, sin calibración, sin redondeo Hessiano, sin matriz de importancia y sin QAT.

La innovación técnica principal es el uso de códigos trellis para los expertos enrutados. Cada matriz de experto se almacena como códigos trellis de 16x16 tiles (3 bits por peso, codebook MCG), con una rotación Hadamard de 128 puntos y vectores de signo por canal (`suh`, `svh`). El codificador minimiza el MSE sobre los pesos rotados. El ancho de experto 704 no es múltiplo de 128 y se almacena con padding a 768. El resto de módulos lineales (proyecciones de atención, MLP denso y embeddings de tokens, con LM head atado) se cuantizan a 6 bits affine con group size 64 usando `mx.quantize`. Los routers, normas, escalares de capa y la torre de visión se mantienen en BF16 porque la selección top-k de expertos es una decisión discontinua que no tolera cuantización. El repositorio incluye dos drafters de decodificación especulativa: MTP Draft-Q8 con ProposalHead (0,45 GB + 0,12 GB) y DFlash-Q8 (0,50 GB).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredado del modelo base Gemma 4 26B A4B.
- Procesamiento de imágenes y texto (pipeline image-text-to-text), con torre de visión mantenida en BF16.
- Decodificación especulativa integrada mediante drafters MTP y DFlash, orientada a reducir latencia en el motor R.E.V.I.S.
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local multimodal en Mac con Apple Silicon: el formato Q3T y los drafters están diseñados para el motor de inferencia de R.E.V.I.S., lo que permite ejecutar un modelo de 26B nominales (4B activos) en hardware de consumo Apple con pesos de 12,53 GB y KV cache de 8 bits.
- Análisis de documentos técnicos largos: con 262.144 tokens de contexto, el modelo puede procesar manuales, informes o bases de código extensas en una sola pasada sin fragmentación.
- Procesamiento de capturas y diagramas: la torre de visión en BF16 permite tareas image-text-to-text como descripción de interfaces, extracción de datos de tablas o interpretación de gráficos.
- Agentes locales multi-paso: R.E.V.I.S. está descrito como un sistema operativo cognitivo para IA multi-agente, por lo que el modelo encaja como motor de razonamiento en flujos de agentes que requieren privacidad total al no salir del equipo.
- Investigación en cuantización extrema: el formato trellis K3 con rotación Hadamard y vectores de signo es un caso de estudio reproducible para medir la degradación de distribuciones next-token frente a BF16.
- Evaluación de decodificación especulativa: los drafters MTP y DFlash empaquetados permiten comparar estrategias de propuesta de tokens en un modelo MoE multimodal con contexto largo.
- Despliegue en entornos sin conectividad: al ser 100 % local y con licencia Apache 2.0, puede integrarse en estaciones de trabajo aisladas para tareas de análisis de documentos e imágenes.

## Benchmarks y rendimiento

La model card incluye una medición de distancia de distribución next-token (KLD frente a BF16) sobre 48 documentos y 18.040 posiciones puntuadas en tres estratos (WikiText-2, documentos técnicos y respuestas propias del modelo), con vocabulario completo y KV cache emulado a 8 bits. Sin embargo, la tabla de resultados está truncada en la información disponible: solo se muestra la cabecera y la primera fila incompleta, sin valores numéricos de KLD ni de top-1.

| Arm | KLD vs BF16 | Top-1 |
|---|---|---|
| Q3T | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica que las comparaciones con cuantización affine ordinaria se añadirán tras una remedición con builds estándar, y que no se reporta velocidad.

## Requisitos de hardware

- VRAM/almacenamiento de pesos: 12,53 GB decimales (11,7 GiB) para el modelo principal, más 1,11 GB de drafters; total del repo 13,7 GB.
- Memoria unificada recomendada: al estar orientado a Apple Silicon, se necesita al menos un Mac con memoria unificada suficiente para pesos, KV cache de 8 bits y overhead del motor; no se especifica el mínimo exacto en la información disponible.
- GPU recomendadas: no disponible; el formato trellis no se ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM, por lo que las GPU CUDA no son un objetivo soportado actualmente.
- Compatibilidad con GPU de consumo: no disponible; el soporte depende del motor R.E.V.I.S. en versiones posteriores a v1.3.0.
- Opciones de despliegue: exclusivamente R.E.V.I.S. (motor de inferencia propietario con kernels trellis); llama.cpp, Ollama, TGI, vLLM y MLX no están soportados.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Gemma4-26B-MoE-Q3T (este) | 26B nominales / 4B activos; 7,68B en safetensors | 262.144 | Q3T trellis 3-bit + 6-bit affine | Apache 2.0 | Solo R.E.V.I.S. |
| Gemma 4 26B A4B (BF16) | 26B / 4B activos | 262.144 | BF16 | Apache 2.0 (licencia Gemma 4) | transformers, vLLM, MLX |
| Variantes Q4T / Q5T del mismo autor | 26B / 4B activos | 262.144 | K4+N6 / K5+N8 | Apache 2.0 | Solo R.E.V.I.S. |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, salvo la medición KLD truncada. La comparación con cuantizaciones affine estándar (por ejemplo, GGUF Q4_K_M) queda pendiente según la propia model card.

## Limitaciones y advertencias

- Incompatibilidad de ecosistema: los expertos usan tensores trellis (`.trellis`, `.suh`, `.svh`) que requieren kernels específicos; el modelo no funciona en transformers, vLLM, mlx-lm ni mlx-vlm.
- Dependencia de un runtime propietario: solo se ejecuta en R.E.V.I.S. en versiones posteriores a v1.3.0, lo que limita la portabilidad y la reproducibilidad.
- Verificación incompleta: el manifiesto del conversor declara `runtime_forward_verified: false`; la conversión verificó los pesos efectivos, no una pasada forward del motor.
- Riesgo de alucinación: inherente al modelo base Gemma 4; no se han publicado evaluaciones específicas de fidelidad para esta cuantización.
- Sesgos: no documentados en la información disponible; se heredan los del checkpoint original de Google.
- Idiomas: no se especifica la cobertura lingüística de esta build.
- Licencia: Apache 2.0 con enlace a la licencia Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- Ausencia de calibración: la receta es data-free, lo que puede producir mayor degradación en dominios alejados de la distribución de los pesos originales.
- Padding de expertos: el ancho 704 se almacena con padding a 768, un detalle relevante para quien implemente kernels propios.
- Benchmarks incompletos: la tabla KLD está truncada y no hay datos de MMLU, HumanEval ni GSM8K, por lo que no es posible cuantificar la pérdida de calidad frente a BF16 con la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mavis-ai/Gemma4-26B-MoE-Q3T
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- X de mavis-ai: https://x.com/mavis_ai_jp
- Paper referenciado (arxiv:2602.06036): https://arxiv.org/abs/2602.06036
- Paper referenciado (arxiv:2607.02770): https://arxiv.org/abs/2607.02770

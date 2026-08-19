# fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-sym

## Resumen

Este modelo es una versión cuantizada en INT8 del modelo base `meta-llama/Llama-3.2-3B`, generada por el usuario `fbaldassarri` mediante el framework Intel AutoRound (v0.13.1). La cuantización utiliza 8 bits, grupo de tamaño 64 y cuantización simétrica, y está orientada a la inferencia eficiente en hardware Intel: CPU, iGPU (Arc) y NPU (Core Ultra). El objetivo es reducir el consumo de memoria y acelerar la inferencia manteniendo una calidad cercana al modelo original.

El modelo base Llama 3.2 3B es un transformer decoder-only de 3.2 mil millones de parámetros, con una ventana de contexto de 128k tokens y soporte para 8 idiomas. Esta versión cuantizada conserva esas capacidades, pero con un tamaño de archivo notablemente menor (el repositorio ocupa 4.5 GB). Al tratarse de una cuantización de pesos únicamente (weights-only quantization), no requiere reentrenamiento y puede cargarse directamente con `transformers`.

Es relevante porque permite ejecutar un modelo de 3B en dispositivos con recursos limitados, como portátiles con CPU Intel o equipos con iGPU, sin necesidad de GPUs dedicadas de alta gama. La cuantización INT8 con grupo 64 ofrece un buen equilibrio entre compresión y fidelidad, y el método AutoRound (basado en SignRound) es una alternativa reciente a GPTQ o AWQ con resultados competitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 3.2B (modelo base); safetensors reporta 1.153.870.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128k (modelo base) |
| Tipos de cuantizacion | INT8, group size 64, simetrico (AutoRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal estándar con atención por ventanas (sliding window attention) y RoPE, tal como se describe en la arquitectura Llama 3.2. Esta versión cuantizada no modifica la arquitectura; únicamente convierte los pesos a enteros de 8 bits con un grupo de 64 canales y cuantización simétrica. El proceso de cuantización se realizó mediante Intel AutoRound, que aplica el algoritmo SignRound: una optimización de redondeo de pesos basada en gradientes, calibrada con 128 muestras, 200 iteraciones, secuencias de 512 tokens y batch de 4, todo en CPU con precisión bfloat16 para el ajuste.

No se aplicó ningún entrenamiento adicional ni fine-tuning; se trata de una cuantización de pesos únicamente (weights-only). El resultado es un modelo que conserva las capacidades del original, aunque con una ligera degradación esperable en tareas de alta precisión. El autor indica que la cuantización está pensada para inferencia en Intel CPU, iGPU (Arc) y NPU (AI Boost) mediante intel-extension-for-pytorch y OpenVINO, aunque también funciona con cualquier backend que soporte INT8.

## Capacidades

- Generación de texto por completado (base model, no instructivo). Puede continuar texto o código a partir de un prompt.
- Soporte multilingüe en 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Capacidad de razonamiento básico y generación de código, heredada del modelo base Llama 3.2 3B.
- Ventana de contexto larga (128k tokens), útil para procesar documentos extensos o conversaciones multi-turno.
- No incluye soporte para tool calling, function calling ni modo agente, al ser un modelo base sin fine-tuning instructivo.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Completado de texto en aplicaciones de escritura asistida: el modelo puede continuar párrafos, sugerir redacciones o generar borradores en varios idiomas, gracias a su naturaleza base y su contexto largo.
- Generación de código en entornos de desarrollo: puede completar funciones, scripts o fragmentos de código en lenguajes como Python, JavaScript o C++, integrándose en editores o pipelines de CI/CD.
- Análisis de documentos extensos: con 128k tokens de contexto, puede resumir o extraer información de contratos, informes o artículos largos, siempre que se le proporcione el texto completo como prompt.
- Preprocesamiento de datos para pipelines de NLP: al ser un modelo base, puede utilizarse para generar representaciones de texto, completar datos faltantes o aumentar datasets de entrenamiento.
- Inferencia en dispositivos edge: gracias a la cuantización INT8 y la optimización para hardware Intel, puede ejecutarse en portátiles con CPU Intel o en mini-PCs con iGPU, sin necesidad de GPU dedicada.
- Prototipado rápido en investigación: su tamaño reducido y compatibilidad con `transformers` permiten experimentar con generación de texto en entornos con recursos limitados, como notebooks o instancias CPU-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparativas con el modelo original o con otras cuantizaciones. El autor solo indica que es una cuantización de pesos sin pérdida significativa, pero no aporta datos numéricos.

## Requisitos de hardware

- VRAM/RAM estimada: al ser un modelo de 3B en INT8, el tamaño de los pesos es aproximadamente 3.2 GB (según el tamaño del repo de 4.5 GB, que incluye otros archivos). Se recomienda al menos 4 GB de RAM o VRAM para inferencia con `device_map="auto"`.
- GPU recomendadas: cualquier GPU con soporte para INT8, como RTX 3060 o superior, aunque el modelo está optimizado para Intel iGPU (Arc) y NPU (Core Ultra). También funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs con 4 GB o más de VRAM, como la RTX 3050 o la GTX 1660.
- Opciones de despliegue: puede usarse con `transformers` directamente, o con servidores de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF). Para hardware Intel, se recomienda intel-extension-for-pytorch o OpenVINO.
- Latencia y throughput: no se proporcionan datos. En CPU Intel moderna, se espera una generación de 10-20 tokens por segundo para un modelo de 3B en INT8, pero es una estimación no oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meta-llama/Llama-3.2-3B (base) | 3.2B | 128k | FP16/BF16 | Llama 3.2 | HuggingFace |
| fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-sym (este) | 3.2B | 128k | INT8 (AutoRound) | Llama 3.2 | HuggingFace |
| fbaldassarri/meta-llama_Llama-3.2-3B-auto_gptq-int8-gs64-sym | 3.2B | 128k | INT8 (GPTQ) | Llama 3.2 | HuggingFace |

No se dispone de benchmarks comparativos entre estas versiones. La diferencia principal radica en el método de cuantización: AutoRound (SignRound) frente a GPTQ, ambos con grupo 64 y simétrico. Se espera que AutoRound ofrezca una degradación menor en tareas de razonamiento, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para mantener conversaciones coherentes; puede generar texto no deseado, sesgado o sin sentido si se le pide algo que no sea completado directo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o factualidad.
- La cuantización INT8 puede degradar ligeramente la precisión en tareas numéricas o de razonamiento complejo, aunque con grupo 64 se minimiza el impacto.
- Limitaciones de idioma: aunque soporta 8 idiomas, el rendimiento puede ser inferior en idiomas con menos representación en el entrenamiento original (como tailandés o hindi).
- Licencia: la Llama 3.2 Community License permite uso comercial, pero con restricciones: si el producto tiene más de 700 millones de usuarios mensuales, se requiere una licencia comercial de Meta.
- El modelo se ha desarrollado con fines de investigación y no ofrece garantías; el autor declara que no hay soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Variante GPTQ del mismo autor: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-auto_gptq-int8-gs64-sym

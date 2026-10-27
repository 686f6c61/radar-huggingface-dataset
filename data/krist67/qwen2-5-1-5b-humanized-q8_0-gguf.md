# krist67/qwen2.5-1.5b-humanized-Q8_0-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de tipo Q8_0 del modelo `xybytz/qwen2.5-1.5b-humanized`, un ajuste fino de Qwen2.5-1.5B orientado a un estilo de respuesta más conversacional y "humanizado", entrenado sobre el dataset `databricks/databricks-dolly-15k`. El autor de la conversión es krist67 y el artefacto se ha generado con la herramienta GGUF-my-repo de ggml.ai sobre llama.cpp, con el objetivo de que el modelo pueda ejecutarse en CPU o GPU de gama baja mediante el ecosistema llama.cpp.

El interés práctico de esta ficha no está en el modelo base, sino en el formato: un GGUF de 8 bits con 1.543.714.304 parámetros (1,54 mil millones) y un tamaño de repositorio de 1,6 GB, lo que lo sitúa en el rango de modelos desplegables en portátiles sin GPU dedicada. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el ajuste fino intermedio y la propia conversión carecen de documentación técnica publicada.

No se dispone de información sobre el proceso de ajuste fino, la composición exacta del dataset, la longitud de contexto efectiva del checkpoint convertido ni resultados de evaluación. Todo lo que sigue se limita a lo declarado en la model card y a los metadatos del repositorio y del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen2.5-1.5B); detalles del ajuste fino no disponibles |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el checkpoint convertido; el ejemplo de la model card usa `-c 2048` |
| Tipos de cuantizacion | Q8_0 (8 bits); no se publican otras variantes en este repositorio |
| Idiomas soportados | No disponible (los metadatos no declaran lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen2.5-1.5b-humanized-q8_0.gguf`), compatible con llama.cpp |

## Arquitectura y entrenamiento

El checkpoint es una conversión de formato, no un entrenamiento nuevo. La arquitectura subyacente corresponde a la familia Qwen2.5, descrita en el informe técnico de Qwen (arXiv:2412.15115): transformers decoder-only con atención completa, normalización RMSNorm, activaciones SwiGLU y sesgo en las proyecciones QKV, preentrenados por Alibaba con 18 billones de tokens según dicho informe. Esa descripción corresponde al modelo original de Qwen; no se ha verificado que el ajuste fino `xybytz/qwen2.5-1.5b-humanized` conserve intactos todos esos detalles.

El ajuste fino intermedio se declara entrenado sobre `databricks/databricks-dolly-15k`, un conjunto de aproximadamente 15.000 pares instrucción-respuesta generados por empleados de Databricks y publicado bajo licencia CC-BY-SA 3.0. No se especifican el número de épocas, la técnica de alineación (SFT, DPO o RLHF), la composición final del dataset ni hiperparámetros. La conversión a GGUF se realizó con la herramienta GGUF-my-repo de ggml.ai, que aplica la cuantización Q8_0 de llama.cpp; tampoco se documenta si hubo calibración o ajuste de la imatrix.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat heredado de Qwen2.5.
- Respuesta a instrucciones y tareas de formato (resumen, reescritura, clasificación simple) propias de un modelo ajustado con Dolly-15k.
- Razonamiento básico y matemáticas elementales, limitado por el tamaño de 1,5 B de parámetros.
- Generación de código sencillo, sin garantías de calidad frente a variantes específicas como Qwen2.5-Coder.
- Ejecución local sin conexión mediante llama.cpp, `llama-cli` y `llama-server`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se declara soporte verificado de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito; estas capacidades no deben asumirse para este ajuste fino.

## Casos de uso

- Prototipado local en portátil: cargar el GGUF Q8_0 con `llama-server -c 2048` para disponer de un endpoint HTTP de chat sin GPU dedicada, útil para maquetar interfaces antes de migrar a un modelo mayor.
- Asistentes conversacionales de dominio acotado: con 1,5 B de parámetros y respuestas de estilo humanizado, encaja en bots de FAQ o atención de primer nivel donde el coste por token y la latencia importan más que la profundidad de razonamiento.
- Generación de texto offline en entornos air-gapped: el formato GGUF y la ejecución con llama.cpp permiten desplegar el modelo en máquinas sin acceso a Internet ni a APIs externas.
- Filtrado y reescritura de textos: tareas de normalización, corrección de estilo o reformulación de párrafos en pipelines por lotes, donde un modelo de 1,6 GB puede procesar grandes volúmenes en CPU.
- Evaluación educativa y experimentación: servir como banco de pruebas para comparar cuantizaciones Q8_0 frente a Q4_K_M en términos de calidad y velocidad sobre el mismo modelo base.
- Base para ajustes finos ulteriores: al estar bajo Apache 2.0 y en formato estándar de la familia Qwen2.5, puede servir como punto de partida para LoRA o QLoRA en tareas específicas antes de cuantizar de nuevo a GGUF.
- Clasificación y etiquetado ligero: con prompts bien acotados, generar etiquetas o categorías sobre textos cortos en flujos de preprocesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de krist67 ni los metadatos del modelo base `xybytz/qwen2.5-1.5b-humanized` incluyen puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones. Tampoco se documentan métricas de latencia o throughput para esta conversión Q8_0 concreta.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF Q8_0 ocupa aproximadamente 1,6 GB, por lo que la inferencia requiere del orden de 2 GB de memoria libre sumando el contexto y el overhead del runtime (estimación basada en el tamaño del artefacto, no en mediciones publicadas).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090, así como en iGPU y Apple Silicon con memoria unificada.
- Ejecución viable en CPU: al ser Q8_0 y 1,5 B de parámetros, llama.cpp puede servirlo en CPU moderna con velocidades interactivas, aunque no se publican tokens por segundo medidos.
- Opciones de despliegue documentadas: `llama-cli` y `llama-server` de llama.cpp, tanto compilando el repositorio como instalando vía brew. No se mencionan vLLM, TGI ni Ollama en la información disponible, aunque el formato GGUF es compatible con Ollama y con el backend de llama.cpp de vLLM.
- Para GPU, llama.cpp admite compilación con `LLAMA_CUDA=1`, según las instrucciones incluidas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| krist67/qwen2.5-1.5b-humanized-Q8_0-GGUF | 1,54 B | No disponible (ejemplo con 2048) | GGUF Q8_0 | Apache 2.0 | Ajuste fino sobre Dolly-15k; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1,54 B | 32.768 tokens (según la familia Qwen2.5) | GGUF | Apache 2.0 | Modelo oficial de Alibaba, con card y evaluaciones publicadas |
| ggml-org/Qwen2.5-Coder-1.5B-Q8_0-GGUF | 1,54 B | 32.768 tokens (según la familia Qwen2.5) | GGUF Q8_0 | Apache 2.0 | Variante especializada en código del mismo tamaño |

La comparación directa de rendimiento no es posible: los dos modelos oficiales cuentan con documentación y evaluaciones publicadas, mientras que este ajuste fino "humanized" no aporta métricas que permitan verificar si la personalización de estilo mejora o degrada las capacidades del Qwen2.5-1.5B original.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino "humanized" conserve las capacidades del Qwen2.5-1.5B-Instruct; el entrenamiento sobre Dolly-15k puede haber degradado el rendimiento en razonamiento y código.
- Riesgo de alucinación elevado: con 1,5 B de parámetros, la precisión factual es intrínsecamente limitada y no debe usarse como fuente de verdad sin verificación.
- Sesgos no evaluados: el dataset Dolly-15k fue generado por empleados de Databricks y no se documenta ningún filtrado o mitigación de sesgos en el ajuste fino.
- Idiomas no declarados: aunque la familia Qwen2.5 es multilingüe, este ajuste fino se entrenó sobre un dataset mayoritariamente en inglés y los metadatos no confirman calidad en castellano.
- Contexto no verificado: el ejemplo de la model card usa 2048 tokens; no se garantiza que el checkpoint soporte los 32.768 tokens de la familia Qwen2.5.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset Dolly-15k se distribuye bajo CC-BY-SA 3.0, lo que conviene revisar si se redistribuye el modelo ajustado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar la calidad de la conversión.
- Sin garantía de soporte de tool calling ni de plantilla de chat correcta: no se documenta el template aplicado, lo que puede provocar respuestas mal formateadas en integraciones de agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/krist67/qwen2.5-1.5b-humanized-Q8_0-GGUF
- Modelo base del ajuste fino: https://huggingface.co/xybytz/qwen2.5-1.5b-humanized
- Qwen2.5-1.5B-Instruct-GGUF (modelo oficial de referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Qwen2.5-Coder-1.5B-Q8_0-GGUF: https://huggingface.co/ggml-org/Qwen2.5-Coder-1.5B-Q8_0-GGUF
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k

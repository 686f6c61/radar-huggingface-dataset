# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-GGUF

## Resumen

Esta ficha describe la distribucion en formato GGUF del modelo `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored`, un fine-tune de la familia Qwen con 27.320.697.856 parametros (unos 27,3 mil millones) publicado por el usuario DavidAU. La version aqui documentada la ha cuantizado mradermacher, autor especializado en generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo parte de la arquitectura Qwen (etiquetada como `qwen3_8` y `qwen3_6` en los tags) y se presenta como un ajuste fino "uncensored" orientado a usos generales.

El nombre comercial acumula etiquetas de marketing ("TWIN-TURBO", "Fable", "Cold Fusion", "709", "ULTRA-HERETIC") que no corresponden a innovaciones tecnicas verificables en la informacion disponible. La model card original no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens vistos ni la metodologia de ajuste, mas alla de citar tres datasets propios de DavidAU (`Polar-STRICT`, `F451-STRICT` y `THE-DECKARD`) y mencionar tecnicas como "GAIN Training", "Multi-stage tuning" y el uso de `unsloth` en el pipeline. No hay informacion sobre evaluaciones de rendimiento publicadas.

El interes practico del modelo reside en su disponibilidad en cuantizaciones GGUF de 11 a 29 GB, lo que permite desplegarlo en hardware de consumo, y en su licencia Apache 2.0, que facilita el uso comercial. No obstante, la ausencia de benchmarks y de documentacion tecnica detallada obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen (tags `qwen3_8` y `qwen3_6`); detalles especificos no disponibles |
| Parametros totales | 27.320.697.856 (unos 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; variantes i1 (imatrix) en repo separado; mmproj Q8_0 y f16 para vision |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 190,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen con aproximadamente 27,3 mil millones de parametros, segun el recuento de safetensors. Los tags indican compatibilidad con dos generaciones de la familia (`qwen3_8` y `qwen3_6`), pero la informacion disponible no aclara a cual corresponde exactamente ni detalla la configuracion de capas, cabezas de atencion o dimension del estado oculto. Tampoco se especifica la longitud de contexto nativa.

En cuanto al entrenamiento, la model card solo menciona los datasets empleados (tres conjuntos propios de DavidAU etiquetados como "STRICT"), el uso de la libreria `unsloth` y una combinacion de tecnicas que el autor denomina "Cold Fusion", "GAIN Training" y "Multi-stage tuning". No se documenta el volumen de tokens, la mezcla de datos, la existencia de RLHF o DPO, ni innovaciones arquitectonicas como decodificacion especulativa o atencion lineal. La etiqueta "heretic" y "uncensored" sugiere un ajuste orientado a reducir los rechazos del modelo base, pero no hay informacion tecnica sobre como se ha realizado ese proceso.

## Capacidades

- Generacion de texto conversacional multi-turno en 16 idiomas, incluido el espanol.
- Razonamiento general y respuesta a instrucciones, segun la orientacion "all use cases" declarada por el autor.
- Capacidades multimodales: el repo incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de vision en el modelo base.
- Comportamiento "uncensored": el ajuste busca reducir las negativas a responder, lo que implica menor filtrado de contenido.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) el modelo cabe en GPUs de consumo con 24 GB de VRAM, lo que permite ejecutar un modelo de 27B en local sin depender de la nube.
- Generacion de texto creativo sin filtros: el ajuste "uncensored" lo hace adecuado para escritura de ficcion, guiones o narrativa donde los modelos alineados suelen rechazar tematicas adultas o violentas; conviene acompanarlo de revision editorial humana.
- Prototipado de asistentes conversacionales multilingues: al cubrir 16 idiomas, puede servir para validar flujos de atencion al cliente en fases de prueba antes de migrar a un modelo con benchmarks verificados.
- Experimentacion en investigacion sobre alineacion: util como caso de estudio de fine-tunes "uncensored" para comparar tasas de rechazo, sesgos y calidad frente al modelo base Qwen.
- Procesamiento por lotes en servidores con llama.cpp: las cuantizaciones Q8_0 (29,1 GB) o Q6_K (22,5 GB) permiten ejecutar inferencia por lotes en una unica GPU de 40-48 GB con perdida de calidad minima.
- Tareas multimodales basicas: con los ficheros `mmproj` puede procesar imagenes junto a texto en entornos llama.cpp, por ejemplo para descripcion de imagenes o extraccion de informacion visual, aunque sin garantias de calidad documentadas.
- Base para fine-tunes propios: la licencia Apache 2.0 y el formato GGUF facilitan adaptaciones internas, aunque para reentrenar conviene partir del modelo en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion):
  - Q2_K: unos 11 GB.
  - Q3_K_M: unos 13,6 GB.
  - Q4_K_M: unos 16,9 GB.
  - Q5_K_M: unos 19,6 GB.
  - Q6_K: unos 22,5 GB.
  - Q8_0: unos 29,1 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones; A6000 (48 GB) o A100 40/80 GB para Q8_0 y para mayor contexto.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones Q4 o Q5; en tarjetas de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repo incluye la etiqueta `endpoints_compatible`. Para el modelo en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TWIN-TURBO, GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tune "uncensored" sin benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba con evaluaciones publicadas |
| Gemma 2 27B | 27B | 8.192 tokens | Gemma License | safetensors, GGUF | Modelo de Google con benchmarks publicados y licencia con restricciones |
| Mistral Small 24B | 24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con tool calling documentado |

La comparacion con los modelos oficiales es desfavorable en trazabilidad: frente a Qwen2.5-32B, Gemma 2 27B o Mistral Small 24B, este fine-tune no publica evaluaciones, no documenta la longitud de contexto y no detalla el proceso de ajuste, por lo que la eleccion entre ellos debe basarse en pruebas propias.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, lo que impide estimar su calidad real frente al modelo base.
- Riesgo elevado de alucinacion: sin evaluaciones ni documentacion del ajuste, no se puede descartar degradacion de la factualidad respecto al Qwen original.
- Sesgos desconocidos: el proceso de entrenamiento y la composicion del dataset no estan documentados, por lo que no se pueden identificar sesgos sistematicos.
- Comportamiento "uncensored": el ajuste reduce deliberadamente los rechazos, lo que aumenta el riesgo de generar contenido danino, ilegal o inapropiado; requiere moderacion externa en produccion.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin pruebas empiricas.
- Nomenclatura enganosa: etiquetas como "TWIN-TURBO", "Cold Fusion" o "709" no corresponden a caracteristicas tecnicas verificables y no deben interpretarse como mejoras medibles.
- Procedencia: es un fine-tune de terceros sobre Qwen, no un modelo oficial de Alibaba; la calidad del ajuste no esta auditada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las posibles reclamaciones derivadas del comportamiento sin filtros.
- Idiomas: aunque se declaran 16 idiomas, no hay evaluaciones de calidad por idioma; el rendimiento en espanol puede ser inferior al del modelo base sin ajuste especifico.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-GGUF
- Modelo base en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets

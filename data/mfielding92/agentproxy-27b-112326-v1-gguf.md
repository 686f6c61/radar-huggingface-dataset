# mfielding92/agentproxy-27b-112326-v1-GGUF

## Resumen

agentproxy-27b-112326-v1-GGUF es una distribucion cuantizada en formato GGUF del modelo `mfielding92/agentproxy-27b-112326-v1`, publicada por el usuario mfielding92 en Hugging Face. Se trata de un modelo de aproximadamente 27.320 millones de parametros, orientado a uso conversacional y compatible con endpoints, segun las etiquetas del repositorio. La model card indica que las recetas de cuantizacion proceden de Unsloth Dynamic 2.0 (UD) y que se ha aplicado una matriz de importancia (imatrix) junto con overrides por tensor mediante la opcion `--tensor-type` de `llama.cpp`.

El interes practico de esta publicacion no reside en una innovacion arquitectonica documentada, sino en empaquetar un modelo de ~27B en cuantizaciones de alta calidad (UD-Q4_K_XL como opcion recomendada) que caben en configuraciones de VRAM relativamente modestas. El repositorio ocupa 15,4 GB y no presenta descargas ni likes en el momento de la consulta, lo que sugiere una publicacion reciente y de baja difusion.

La informacion disponible es escasa: no se documentan licencia, idiomas, pipeline, arquitectura interna, datos de entrenamiento ni resultados de benchmarks. La ficha refleja por tanto lo que puede verificarse a partir de los metadatos y la model card, marcando explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `mfielding92/agentproxy-27b-112326-v1`) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `--ctx-size 16384`) |
| Tipos de cuantizacion | GGUF con recetas Unsloth Dynamic 2.0: UD-Q4_K_XL, UD-Q5_K_M, UD-Q3_K_XL, UD-Q2_K_XL (entre otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base no se distribuye en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base: la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus) ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo unico documentado es el proceso de cuantizacion: se emplean recetas Unsloth Dynamic 2.0 extraidas del repositorio `unsloth/Qwen3.8-27B-GGUF`, junto con la imatrix del mismo repositorio, y se aplican overrides por tensor mediante `--tensor-type` en `llama.cpp`. Este enfoque asigna precision diferencial a tensores sensibles (tipicamente capas de atencion y embeddings) para preservar calidad a tamanos reducidos. La referencia a recetas derivadas de un modelo Qwen3.8-27B sugiere, sin confirmarlo, una genealogia compatible con la familia Qwen, pero el autor no lo declara explicitamente.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el tag `endpoints_compatible` indican uso previsto para dialogos multi-turno.
- Compatibilidad con endpoints: el tag sugiere integracion con APIs de inferencia tipo endpoint (no se detalla cual).
- Inferencia local mediante `llama.cpp`: la model card proporciona un comando de ejecucion con parametros de muestreo (`--temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.0`).
- Razonamiento, codigo, matematicas, vision, audio: no disponible (no documentado).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible, aunque el nombre del modelo ("agentproxy") podria sugerir orientacion a agentes; no confirmado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional: con ~27B de parametros y cuantizacion UD-Q4_K_XL, el modelo puede ejecutarse en una GPU de consumo alta gama (24 GB) o en configuraciones multi-GPU, sirviendo como chatbot privado sin dependencia de API externa.
- Prototipado de agentes en local: el nombre del modelo y la etiqueta `endpoints_compatible` apuntan a un uso como backend de agentes; se puede levantar con `llama.cpp` y exponer via un servidor compatible con endpoints para pruebas de flujos multi-paso.
- Evaluacion comparativa de cuantizaciones: al ofrecer varias recetas UD (Q2 a Q5), permite medir la degradacion de calidad frente al modelo base en tareas concretas antes de fijar una cuantizacion para produccion.
- Sustitucion de modelos propietarios en entornos con requisitos de privacidad: al ejecutarse integramente en hardware propio, evita el envio de datos a terceros, adecuado para prototipos con datos sensibles (sujeto a la licencia, no disponible).
- Generacion de texto en pipelines offline: integrable en scripts por lotes mediante `llama-cli` o la API de `llama.cpp` para tareas de redaccion, resumen o clasificacion conversacional.
- Experimentacion academica con cuantizacion dinamica: util para estudiar el impacto de imatrix y overrides por tensor en modelos de ~27B, replicando el pipeline descrito en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - UD-Q2_K_XL: en torno a 10-11 GB.
  - UD-Q3_K_XL: en torno a 13-14 GB.
  - UD-Q4_K_XL: en torno a 16-17 GB.
  - UD-Q5_K_M: en torno a 19-20 GB.
  - Estas cifras son estimaciones a partir del tamano de pesos; el repo completo ocupa 15,4 GB, lo que incluye varias cuantizaciones.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4/Q5 con contexto moderado; A100 40/80 GB o H100 para contexto largo o mayor paralelismo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con UD-Q4_K_XL y contexto de 16K; en tarjetas de 12-16 GB solo con Q2/Q3 y contexto reducido.
- Opciones de despliegue: `llama.cpp` (documentado por el autor), y por compatibilidad de formato GGUF, teoricamente Ollama y servidores basados en `llama.cpp`; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentproxy-27b-112326-v1-GGUF | ~27,3B | no disponible | no disponible | GGUF | Cuantizacion UD con imatrix; sin benchmarks publicados |
| Qwen3.8-27B (referencia de recetas) | ~27B (no confirmado) | no disponible | no disponible | safetensors/GGUF | Fuente de las recetas UD e imatrix segun la model card |
| Gemma 2 27B | ~27B | 8K | Gemma license | safetensors/GGUF | Alternativa densa de tamano similar con benchmarks publicos |
| Mistral Small 24B | ~24B | 128K | Apache 2.0 | safetensors/GGUF | Alternativa con contexto largo y licencia permisiva |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas; no debe asumirse un rendimiento equivalente al de modelos de tamano similar con evaluaciones publicas.
- Licencia no declarada: no puede confirmarse si el uso comercial esta permitido; verificar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas.
- Arquitectura y datos de entrenamiento no documentados: dificulta evaluar sesgos, calidad del ajuste y riesgos de alucinacion.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos conocidos: no disponibles; al desconocerse el corpus de entrenamiento no es posible anticipar sesgos de genero, etnicos o culturales.
- Modelo de baja difusion (0 descargas, 0 likes): sin validacion por parte de la comunidad; tratar como experimental.
- Cuantizaciones agresivas (Q2/Q3): pueden degradar notablemente el razonamiento y la coherencia; la propia model card recomienda Q4_K_XL como equilibrio.
- La referencia a recetas de Qwen3.8-27B no implica que el modelo sea un Qwen; no debe asumirse compatibilidad de tokenizador o plantilla de chat sin verificacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mfielding92/agentproxy-27b-112326-v1-GGUF
- Modelo base: https://huggingface.co/mfielding92/agentproxy-27b-112326-v1
- Repositorio de recetas UD e imatrix referenciado: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Unsloth Dynamic 2.0 (documentacion de cuantizaciones): https://docs.unsloth.ai/

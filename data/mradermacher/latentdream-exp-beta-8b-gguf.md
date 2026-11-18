# mradermacher/LatentDream-exp-beta-8b-GGUF

## Resumen

LatentDream-exp-beta-8b-GGUF es la distribucion en formato GGUF del modelo LatentDream-exp-beta-8b, publicada por el usuario mradermacher. El modelo original, alojado en Entropicengine/LatentDream-exp-beta-8b, es un merge de modelos (mergekit) de aproximadamente 8.030 millones de parametros (8B) orientado a conversacion en ingles. Esta version GGUF facilita la ejecucion local en CPU y GPU de consumo mediante llama.cpp y derivados, al ofrecer una bateria de cuantizaciones estaticas desde Q2_K hasta f16.

El modelo base es un merge experimental (la etiqueta "exp-beta" sugiere una fase beta de experimentacion) construido con mergekit, una herramienta que combina los pesos de varios modelos para obtener capacidades hibridas sin reentrenamiento. Al tratarse de un merge, hereda las caracteristicas de sus componentes, aunque la model card no detalla cuales son ni la receta de fusion empleada.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores desplegar un modelo conversacional de 8B en hardware modesto, con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 8,6 GB (Q8_0). No obstante, la ausencia de benchmarks, de licencia explicita y de documentacion sobre el entrenamiento limita seriamente su evaluacion rigurosa para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos via mergekit); detalles no disponibles |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit, lo que implica que sus pesos se obtienen combinando los pesos de dos o mas modelos preentrenados mediante alguna estrategia de fusion (lineal, SLERP, TIES, DARE, etc.). La model card no especifica la receta de fusion ni los modelos de origen, por lo que no es posible determinar que capacidades concretas se han heredado ni como se ha equilibrado la contribucion de cada componente. El modelo resultante conserva la arquitectura transformer del modelo dominante en la fusion, con 8.030 millones de parametros.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La cuantizacion GGUF ha sido realizada por mradermacher mediante su pipeline habitual (convert_type: hf, output_tensor_quantised: 1), generando quants estaticos; los quants ponderados con imatrix estan disponibles en un repositorio separado (LatentDream-exp-beta-8b-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos fusionados (no verificado con benchmarks).
- Capacidades de codigo y matematicas: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con el quant Q4_K_M (5,0 GB) el modelo cabe en GPU de consumo de 8 GB o en CPU con 8-16 GB de RAM, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Evaluacion comparativa de merges: investigadores que estudian el efecto de las fusiones de modelos pueden usar esta version GGUF para medir cualitativamente el comportamiento del merge frente a sus componentes originales.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (3,3 GB) permite ejecutar el modelo en maquinas con 4-6 GB de RAM, util para demos o entornos embebidos donde no se requiere maxima calidad.
- Generacion de texto offline: al funcionar con llama.cpp, el modelo puede operar sin conexion en portatiles, lo que resulta adecuado para aplicaciones de escritorio con requisitos de privacidad.
- Base para fine-tuning ligero: al estar disponible en f16 (16,2 GB) y safetensors en el modelo original, puede servir como punto de partida para ajuste fino con LoRA en una unica GPU de 24 GB.
- Experimentacion docente: el rango completo de cuantizaciones (de Q2_K a f16) permite ilustrar el compromiso entre tamano, velocidad y calidad en cursos sobre despliegue de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 solo si se busca throughput alto o f16 con contexto largo.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB (Q2_K/Q3) hasta una RTX 4090 (Q8_0/f16).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LatentDream-exp-beta-8b-GGUF | 8B | no disponible | no disponible | GGUF | Merge experimental, solo ingles |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Modelo de referencia con benchmarks publicos |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue y con benchmarks publicos |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento del modelo evaluado. Frente a Llama 3.1 8B, Mistral 7B y Qwen2.5 7B, LatentDream carece de benchmarks, de contexto documentado y de licencia explicita, lo que lo situa en desventaja para uso en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; esto es un bloqueante para produccion.
- Modelo experimental (exp-beta): puede presentar comportamientos inestables o inconsistencias propias de un merge no validado.
- Solo ingles: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de 8B sin alineacion documentada; no hay informacion sobre RLHF/DPO.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento ni los modelos de origen, no es posible evaluar sesgos.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar aplicaciones con contexto largo.
- Procedencia del merge no trazada: la model card no lista los modelos fusionados ni la receta, dificultando la auditoria.
- Repositorio con muy poca traccion (95 descargas, 1 like): escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LatentDream-exp-beta-8b-GGUF
- Modelo base: https://huggingface.co/Entropicengine/LatentDream-exp-beta-8b
- Quants con imatrix: https://huggingface.co/mradermacher/LatentDream-exp-beta-8b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LatentDream-exp-beta-8b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

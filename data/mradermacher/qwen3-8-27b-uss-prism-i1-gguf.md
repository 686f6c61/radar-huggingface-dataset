# mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF

## Resumen

Qwen3.8-27B-USS-Prism-i1-GGUF es una cuantizacion GGUF del modelo nightmedia/Qwen3.8-27B-USS-Prism, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de la familia Qwen. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF (con cuantizaciones de tipo i1 generadas a partir de un fichero imatrix). El modelo base es un merge o destilado de la familia Qwen3.x (las etiquetas mencionan qwen3.5, qwen3.6 y referencias a claude4.6/distillation) orientado a razonamiento, generacion de codigo, matematicas, STEM y escritura creativa.

La relevancia de esta ficha reside en que ofrece pesos en formato GGUF (de 11 GB a 22,5 GB segun cuantizacion) que permiten ejecutar un modelo de 27B en hardware de consumo, algo imposible con los pesos en bf16. Las etiquetas del autor indican soporte de contexto muy largo (se mencionan 256k y 1M de tokens), capacidades multilingues (en, zh, ja, es) y un enfoque marcado hacia el razonamiento con cadena de pensamiento larga (long-cot). La licencia declarada es Apache 2.0.

Conviene senalar que el modelo es experimental y que parte de su informacion (arquitectura exacta, datos de entrenamiento, benchmarks) no esta documentada en la model card del repositorio de cuantizacion, que se limita casi por completo a listar los ficheros GGUF y sus tamanos. Este ficha refleja esa limitacion de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.x; detalles exactos no disponibles) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k y 1M de tokens mencionados en las etiquetas; valor nativo exacto no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en bf16 |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no detalla la arquitectura interna del modelo base. Por las etiquetas (qwen3_5, qwen3_6, qwen, unsloth, mergekit, sft, lora, distillation, claude-distillation) se deduce que se trata de un transformer decoder-only de la familia Qwen, probablemente construido mediante tecnicas de merge (mergekit) y ajuste fino supervisado (SFT) con LoRA, con un componente de destilacion (posiblemente a partir de trazas de un modelo tipo Claude 4.6). El autor lo etiqueta como "experimental" y menciona capacidades de razonamiento con cadena de pensamiento larga (long-cot) y modo de escritura creativa.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La cuantizacion i1 emplea un fichero imatrix (matriz de importancia) generado por el autor, lo que en la practica mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas, segun el propio criterio del publicador.

## Capacidades

- Generacion de texto y conversacion multi-turno con instrucciones.
- Razonamiento explicito con cadena de pensamiento larga (long-cot).
- Generacion de codigo y tareas de programacion (etiqueta coding).
- Matematicas y STEM (etiquetas math, stem).
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling en multiples generos (incluida ciencia ficcion).
- Roleplay (etiqueta roleplaying).
- Capacidades multilingues en ingles, chino, japones y espanol.
- Posible soporte de vision (la model card indica "This is a vision model" y remite a los ficheros mmproj del repositorio estatico), aunque los ficheros mmproj no se listan en este repositorio i1.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado explicitamente, aunque el modo long-cot lo hace plausible.

## Casos de uso

- Razonamiento y resolucion de problemas matematicos: el modelo esta etiquetado para math y stem y emplea cadenas de pensamiento largas, adecuado para tutorizacion paso a paso o verificacion de derivaciones.
- Generacion de codigo en local: con cuantizaciones i1-Q4_K_M (16,9 GB) puede ejecutarse en una GPU de 24 GB y usarse para autocompletado, generacion de tests o refactorizacion en entornos sin conexion.
- Escritura creativa y narrativa: las etiquetas de ficcion, tramas, subtramas y continuacion de escenas lo orientan a herramientas de asistencia para novelistas y guionistas.
- Roleplay y personajes conversacionales: util para prototipos de chatbots de personaje o videojuegos narrativos donde se requiere coherencia de voz y contexto largo.
- Analisis de documentos extensos: si se confirma el contexto de 256k/1M, permite resumir o consultar contratos, informes o bases de codigo completas en una sola ventana.
- Atencion al cliente multilingue: los idiomas en, zh, ja y es cubren mercados clave; el modelo puede gestionar conversaciones multi-turno con contexto amplio.
- Investigacion y experimentacion: al ser un modelo experimental con licencia Apache 2.0, sirve para estudiar tecnicas de merge, destilacion y cuantizacion sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del fichero GGUF mas overhead de contexto y cache KV):
  - i1-Q2_K: ~11 GB (calidad baja; el autor sugiere IQ3_XXS en su lugar).
  - i1-IQ3_S / i1-IQ3_M: ~12,7-12,9 GB.
  - i1-Q4_K_S / i1-Q4_K_M: ~15,9-16,9 GB (recomendado por el autor para velocidad).
  - i1-Q5_K_M: ~19,6 GB.
  - i1-Q6_K: ~22,5 GB.
- GPU recomendadas: para Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q5/Q6 se recomienda A100 40 GB, H100 o RTX 6000 Ada. Con cuantizaciones Q3 puede intentarse en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M y contexto moderado; en GPUs de 16 GB solo con Q3 y contexto recortado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos backends habria que usar los pesos bf16 del modelo base.
- Latencia y throughput: no disponibles. Dependeran del hardware y de la cuantizacion; a titulo orientativo, un 27B en Q4_K_M en una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-USS-Prism-i1-GGUF | 27,3B | 256k/1M (segun etiquetas) | Apache 2.0 | GGUF | Experimental, orientado a razonamiento y ficcion |
| Qwen2.5-32B-Instruct (referencia de la familia) | 32,5B | 128k | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, ampliamente testeado |
| Gemma 2 27B | 27B | 8k | Gemma license | safetensors, GGUF | Contexto corto, licencia restrictiva |
| Mistral Small 24B | 24B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa europea con buen rendimiento general |

No se dispone de datos de rendimiento comparado para este modelo concreto, por lo que la comparativa se limita a caracteristicas estructurales. Las cifras de los modelos alternativos son de conocimiento general y no proceden de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta como "experimental"; no hay garantias de calidad ni de estabilidad en produccion.
- Ausencia de benchmarks: no se han publicado evaluaciones objetivas, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no puede cuantificarse.
- Sesgos: no documentados; al derivar de un merge y destilacion, puede heredar sesgos de los modelos fuente.
- Contexto: aunque se anuncian 256k y 1M de tokens, no se confirma el valor nativo ni el comportamiento en contextos extremos (degradacion, coste de cache KV).
- Idiomas: solo se declaran en, zh, ja y es; el resto de idiomas no estan soportados oficialmente.
- Vision: la model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio i1, sino en el estatico; verificar antes de asumir capacidad multimodal.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar las condiciones del modelo base y de los modelos fuente del merge.
- Tool calling y agentes: no confirmados; no asumir su disponibilidad sin pruebas.
- Cuantizaciones muy bajas (Q2_K, IQ2) degradan notablemente la calidad; el propio autor recomienda IQ3_XXS o superiores.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-USS-Prism-i1-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

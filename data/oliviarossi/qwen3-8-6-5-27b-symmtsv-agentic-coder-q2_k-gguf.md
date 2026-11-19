# OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q2_K-GGUF

## Resumen

OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q2_K-GGUF es una cuantizacion en formato GGUF de tipo Q2_K del modelo OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder, un merge de modelos de la familia Qwen con orientacion a programacion agentica y capacidades multimodales (pipeline image-text-to-text). El autor de la publicacion es OliviaRossi y la conversion a GGUF se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo en CPU y GPU con la pila de llama.cpp.

El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones) segun los pesos en safetensors del modelo base, y se distribuye bajo licencia Apache 2.0. La nomenclatura del nombre sugiere una fusion simetrica mediante la tecnica TSV (tag: tsv-merge, crossmean) de varias iteraciones de la familia Qwen 3.5, 3.6 y 3.8, aunque la model card no documenta los detalles del proceso de merge ni los datos de entrenamiento.

La relevancia de esta ficha radica en que se trata de una cuantizacion de 2 bits (Q2_K) que reduce el peso del modelo a aproximadamente 10,7 GB, lo que lo hace desplegable en hardware de consumo con VRAM limitada. No obstante, la informacion publicada es muy escasa: no hay benchmarks, no se detallan idiomas soportados y la model card se limita a las instrucciones genericas de uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del modelo base Qwen; familia transformer, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (esta publicacion); el modelo base ofrece otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwen3.8.6.5-27b-symmtsv-agentic-coder-q2_k.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base. Por el nombre y las etiquetas (qwen3_5, qwen3.5, qwen3.6, qwen3.8, merge, tsv-merge, crossmean) se deduce que se trata de una fusion de pesos de varios modelos de la familia Qwen, probablemente mediante una tecnica de merge simetrico con media cruzada (crossmean). No se especifica si la arquitectura es un transformer denso, un MoE o una variante hibrida, ni se detalla el numero de capas, dimensiones ocultas o cabezas de atencion.

Tampoco se publican datos sobre el entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF es unicamente una plantilla generada por GGUF-my-repo que remite al modelo original y ofrece instrucciones de uso con llama.cpp; no contiene innovaciones tecnicas descritas (decodificacion especulativa, atencion lineal, etc.). La cuantizacion Q2_K es la unica transformacion documentada y aplica cuantizacion de 2 bits por bloque con escalas y minimos, lo que reduce el tamano del fichero a unos 10,7 GB.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del modelo base Qwen fusionado, aunque sin verificacion publica de rendimiento.
- Programacion y codigo: la etiqueta agentic-coding indica que el merge esta orientado a tareas de codigo y flujos agenticos.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, por lo que se espera soporte de entrada de imagen y texto; no se detalla el codificador visual ni la resolucion soportada.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: etiquetado como agentic-coding, pero sin documentacion de protocolos o formatos de agente.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio especial: solo se confirma vision por el pipeline image-text-to-text; no se documenta modo thinking.

## Casos de uso

- Asistente de programacion en local: el modelo puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU de datacenter gracias a su cuantizacion Q2_K de ~10,7 GB, lo que permite autocompletado y generacion de codigo en entornos con requisitos de privacidad.
- Agente de codigo en pipelines de CI/CD: la orientacion agentic-coding sugiere su uso para tareas de refactorizacion, generacion de tests o revision de parches, siempre que se valide el comportamiento del merge en el repositorio concreto.
- Procesamiento de capturas y diagramas: al declarar pipeline image-text-to-text, puede emplearse para extraer texto o explicar diagramas tecnicos en herramientas de documentacion, aunque la calidad multimodal no esta verificada.
- Prototipado rapido en portatiles: con ~10,7 GB de pesos, cabe en equipos con 16 GB de RAM/VRAM unificada, lo que permite experimentar con un modelo de ~27 B en hardware de consumo.
- Educacion y experimentacion con tecnicas de merge: util para investigadores que quieran estudiar el efecto de la fusion TSV/crossmean y de la cuantizacion Q2_K sobre el rendimiento.
- Despliegue en entornos air-gapped: al ser un fichero GGUF autonomo con licencia Apache 2.0, puede distribuirse en infraestructuras sin acceso a internet para tareas de generacion de codigo y texto.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de un modelo de ~27 B al pasar a 2 bits frente a cuantizaciones mayores del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,7 GB solo para los pesos en Q2_K; con cache KV y overhead de llama.cpp, se recomienda un minimo de 12-14 GB de memoria disponible.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para despliegues con contexto amplio; tambien puede ejecutarse en GPU de 16 GB con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB) usando contexto moderado; en 8 GB no cabe en su totalidad y requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; no se confirma soporte de vLLM o TGI para esta cuantizacion.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del contexto. Como referencia cualitativa, un modelo denso de ~27 B en Q2_K suele ser mas lento que modelos de 7-8 B y mas rapido que cuantizaciones de mayor precision solo si el ancho de banda de memoria es el cuello de botella.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q2_K-GGUF | ~26,9 B | no disponible | Apache 2.0 | GGUF Q2_K | Merge Qwen con orientacion agentica y multimodal; sin benchmarks publicados |
| Modelo base OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder | ~26,9 B | no disponible | Apache 2.0 | safetensors | Mayor precision, mayor peso; sin benchmarks publicados |
| Qwen2.5-Coder-32B-Instruct (referencia de la familia Qwen) | 32,5 B | 32.768 tokens (tipico) | Apache 2.0 | safetensors, GGUF | Modelo oficial de codigo con benchmarks publicados; comparacion orientativa |
| Qwen2.5-32B-Instruct (referencia general) | 32,5 B | 32.768 tokens (tipico) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar; benchmarks publicados |

Nota: los datos de los modelos Qwen de referencia se incluyen como orientacion de categoria; no se dispone de comparaciones directas publicadas con el modelo de OliviaRossi.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales, por lo que la calidad real del merge es desconocida.
- Cuantizacion Q2_K agresiva: a 2 bits por peso se produce una degradacion notable de la coherencia, el razonamiento y la generacion de codigo en comparacion con el modelo base; no se recomienda para produccion sin evaluacion previa.
- Procedencia del merge no documentada: no se detallan los modelos fuente exactos ni la metodologia TSV/crossmean, lo que dificulta la reproducibilidad y la auditoria.
- Idiomas no especificados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente amplificado por la cuantizacion de 2 bits.
- Capacidades multimodales no verificadas: el pipeline image-text-to-text se declara, pero no hay documentacion del codificador visual ni pruebas publicadas.
- Modelo con 0 descargas y 0 likes: no hay validacion de la comunidad ni informes de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia de los pesos fusionados por si hubiera restricciones adicionales de los modelos Qwen originales.
- Fecha de creacion futura (2026-11-19): metadato anomalo que sugiere que la publicacion puede ser experimental o generada automaticamente; conviene tratarla con cautela.

## Enlaces

- Repositorio Hugging Face (GGUF Q2_K): https://huggingface.co/OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

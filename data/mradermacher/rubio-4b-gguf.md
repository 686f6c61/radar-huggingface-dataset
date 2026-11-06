# mradermacher/Rubio-4B-GGUF

## Resumen

Rubio-4B-GGUF es la version cuantizada en formato GGUF del modelo mulkzz/Rubio-4B, publicada por el usuario mradermacher. El modelo original es un transformer de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) orientado a tareas educativas, con especial enfasis en biologia y generacion de retroalimentacion (feedback). La cuantizacion la realiza mradermacher, un colaborador habitual de la comunidad que distribuye versiones GGUF de modelos open source para su uso en entornos con recursos limitados.

La relevancia de esta publicacion radica en que facilita el despliegue del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con un abanico de cuantizaciones que van desde Q2_K (2,1 GB) hasta f16 (8,8 GB). El repositorio incluye ademas ficheros mmproj, lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla su alcance.

La informacion disponible sobre el modelo original es escasa: se desconoce la longitud de contexto, la composicion exacta del dataset de entrenamiento y los resultados de benchmarks. La licencia es Apache 2.0 y el unico idioma declarado es el coreano (ko), lo que limita su uso directo en castellano sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mulkzz/Rubio-4B mas alla de que se trata de un transformer de aproximadamente 4,3 mil millones de parametros. Los tags del repositorio mencionan "unsloth", lo que sugiere que el entrenamiento o el fine-tuning se realizo con las herramientas de Unsloth, habitualmente empleadas para fine-tuning eficiente de modelos abiertos. Tambien aparece la etiqueta "vllm", que indica compatibilidad con ese motor de inferencia.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La presencia de ficheros mmproj en la cuantizacion indica que el modelo base incorpora algun componente multimodal (probablemente vision), pero no se especifica su naturaleza ni su resolucion de entrada. El enfasis tematico declarado (educacion, biologia, feedback) sugiere un fine-tuning orientado a tareas de tutoria o evaluacion educativa, aunque no se documenta el procedimiento.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Capacidades multimodales inferidas de la presencia de ficheros mmproj (Q8_0 y f16), probablemente vision, aunque no se detalla su alcance.
- Orientacion a tareas educativas: generacion de retroalimentacion y contenido de biologia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma; no se declara soporte de castellano.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Tutoria educativa en coreano: el modelo puede generar explicaciones y retroalimentacion sobre ejercicios de biologia, aprovechando su fine-tuning tematico declarado. Adecuado para plataformas de aprendizaje en coreano.
- Generacion de feedback automatizado en entornos de evaluacion: dado su enfoque en "feedback", puede emplearse para redactar comentarios sobre respuestas de estudiantes, con revision humana posterior.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (2,7-2,9 GB) permiten ejecutar el modelo en portatiles con GPU modesta o incluso en CPU mediante llama.cpp, lo que facilita prototipos locales sin infraestructura cloud.
- Asistente de estudio offline: al caber en 8 GB de RAM/VRAM en cuantizacion Q8_0 (4,7 GB), puede integrarse en aplicaciones de escritorio o moviles de gama alta para consultas educativas sin conexion.
- Base para fine-tuning posterior: al estar disponible en safetensors el modelo original y en GGUF las cuantizaciones, un equipo puede partir del modelo base para adaptarlo a otro idioma o dominio educativo.
- Experimentacion multimodal: los ficheros mmproj permiten probar entrada de imagenes (por ejemplo, diagramas biologicos) en pipelines con llama.cpp, aunque la calidad no esta documentada.
- Integracion en pipelines con vLLM: la etiqueta "vllm" sugiere compatibilidad con ese motor para servir el modelo en produccion con batching, util en entornos de investigacion educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_M: ~2,4 GB
  - Q4_K_S / Q4_K_M: ~2,7-2,9 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - mmproj adicional: 0,5 GB (Q8_0) u 0,8 GB (f16)
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una RTX 3060 de 12 GB o superior permite ejecutar cualquier cuantizacion con holgura; una RTX 4090 o A100/H100 no aportan ventaja significativa frente a GPUs menores por el tamano reducido del modelo.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB (Q4_K_M) hasta 12 GB (f16 con mmproj).
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y vLLM (segun la etiqueta del repositorio, para el modelo base en safetensors). TGI no esta confirmado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rubio-4B-GGUF | ~4,3 B | no disponible | Apache 2.0 | GGUF | Enfoque educativo/biologia, idioma coreano |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, base ampliamente usada |
| Llama-3.2-3B-Instruct | ~3,2 B | 131.072 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, ecosistema amplio |
| Phi-3.5-mini-instruct | ~3,8 B | 131.072 tokens (segun documentacion publica de Microsoft) | MIT | safetensors, GGUF | Razonamiento y codigo |

La comparativa se basa en datos publicos de los modelos alternativos; para Rubio-4B no se dispone de contexto ni benchmarks, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el coreano; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Sesgos: no documentados. Al ser un fine-tuning tematico sin model card detallada, no se conocen los sesgos del dataset de entrenamiento.
- Riesgo de alucinacion: no cuantificado; como modelo de ~4 B sin benchmarks publicados, la fiabilidad en dominios especializados (biologia) debe validarse antes de usarlo en produccion.
- Contexto: se desconoce la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base; conviene revisar la licencia del modelo original mulkzz/Rubio-4B.
- Multimodalidad: la presencia de mmproj sugiere vision, pero no hay documentacion sobre su calidad ni sobre el preprocesado requerido.
- Produccion: sin benchmarks ni evaluaciones independientes, no se recomienda su despliegue en entornos criticos sin una evaluacion propia.
- Fecha de creacion del repositorio: 2026-10-31, lo que indica que es una publicacion reciente con poca traccion (500 descargas, 0 likes).

## Enlaces

- Repositorio Hugging Face (cuantizaciones): https://huggingface.co/mradermacher/Rubio-4B-GGUF
- Modelo base: https://huggingface.co/mulkzz/Rubio-4B
- Pagina de descargas del autor: https://hf.tst.eu/model#Rubio-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

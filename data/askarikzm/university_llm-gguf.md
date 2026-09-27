# askarikzm/university_llm-gguf

## Resumen

`askarikzm/university_llm-gguf` es la version cuantizada en formato GGUF de un ajuste fino (fine-tuning) sobre Qwen2.5-7B-Instruct, publicado por el usuario askarikzm. El repositorio contiene un unico archivo de pesos, `qwen2.5-7b-instruct.Q4_K_M.gguf`, acompanado de un Modelfile para Ollama, lo que indica que el objetivo es el despliegue local en CPU/GPU de consumo mediante llama.cpp y herramientas compatibles. El proceso de entrenamiento y conversion a GGUF se realizo con Unsloth, segun declara el propio autor en la model card.

El modelo cuenta con 7.615.616.512 parametros totales (7,6 mil millones), coherentes con la arquitectura Qwen2.5-7B, y el repositorio ocupa 4,7 GB, tamano consistente con una cuantizacion Q4_K_M. No es un modelo MoE: no hay parametros activos separados ni routing por expertos. Al estar construido sobre Qwen2.5-7B-Instruct, hereda previsiblemente la arquitectura transformer decoder-only con Grouped Query Attention (GQA) y RoPE del modelo base, aunque el autor no documenta cambios estructurales.

Su relevancia es limitada y hay que ser honesto al respecto: el repositorio no publica licencia, idiomas soportados, pipeline, dataset de entrenamiento, benchmarks ni hiperparametros, no tiene descargas ni interacciones, y la model card se limita a la plantilla generada por Unsloth. Resulta util como ejemplo reproducible de fine-tuning + cuantizacion local, pero no es evaluable como modelo de produccion sin informacion adicional del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada por el autor) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 128.000 tokens, dato no confirmado para este fine-tune |
| Tipos de cuantizacion | Un unico archivo Q4_K_M; no se publican otras cuantizaciones (Q5, Q8, FP16, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Qwen2.5-7B se distribuye bajo Apache-2.0, pero el autor no declara licencia para este fine-tune) |
| Formato de pesos | GGUF (archivo `qwen2.5-7b-instruct.Q4_K_M.gguf`); el fine-tune original fue generado con Unsloth, presumiblemente en safetensors, pero no se incluye en este repositorio |
| Tamano del repositorio | 4,7 GB |
| Plantilla de chat | Se invoca con `--jinja`, lo que implica el uso de la plantilla Jinja embebida en el GGUF |
| Despliegue declarado | llama.cpp (`llama-cli`, `llama-mtmd-cli`) y Ollama mediante Modelfile incluido |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT sobre pares instruccion-respuesta. La unica afirmacion tecnica de la model card es que el modelo fue "finetuned and converted to GGUF format using Unsloth", lo que situa el pipeline en el ecosistema Unsloth (entrenamiento con LoRA/QLoRA optimizado y exportacion posterior a GGUF). El nombre `university_llm` sugiere un ajuste orientado a dominio academico o universitario, pero no hay ninguna evidencia documental en el repositorio que confirme el corpus utilizado ni el grado de especializacion real.

En cuanto a la arquitectura heredada, Qwen2.5-7B-Instruct es un transformer decoder-only de 28 capas con RMSNorm en pre-normalizacion, activacion SwiGLU en el MLP, RoPE para codificacion posicional y atencion con GQA (28 cabezas de consulta y 4 de clave/valor), ademas de embeddings atados. Estas caracteristicas no estan verificadas para este fine-tune concreto y deben tomarse como expectativa razonable derivada del modelo base, no como dato confirmado.

## Capacidades

- Generacion de texto conversacional multi-turno: la model card incluye la etiqueta `conversational` y el uso previsto con plantilla Jinja, lo que apunta a un modelo ajustado para dialogo.
- Razonamiento y conocimiento general: capacidades heredadas presumiblemente del modelo base Qwen2.5-7B-Instruct, sin benchmarks que las cuantifiquen en este fine-tune.
- Generacion de codigo basica: esperable por herencia del modelo base, no verificada.
- Capacidades matematicas: esperables por herencia del modelo base, no verificadas.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo pensamiento (thinking mode), vision o audio: no disponibles. La mencion a `llama-mtmd-cli` en la model card forma parte de la plantilla generica de Unsloth y no implica que este repositorio contenga un modelo multimodal.
- Capacidad especial declarada: ninguna adicional. Solo hay un archivo de pesos y un Modelfile de Ollama.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al ser un GGUF Q4_K_M de 4,7 GB, puede cargarse con Ollama en un portatil con GPU de gama media o incluso en CPU, lo que lo hace util para validar flujos de chat antes de invertir en infraestructura.
- Experimentacion academica con fine-tuning: el repositorio sirve como referencia de un pipeline Unsloth de principio a fin (ajuste + exportacion GGUF + Modelfile de Ollama), replicable en un entorno universitario con recursos limitados.
- Asistente de soporte en el dominio educativo (hipotesis derivada del nombre): un tutor que responda dudas sobre material de curso y mantenga conversaciones de varias intervenciones; sin embargo, no hay evidencia publicada de que el ajuste haya sido entrenado con corpus academico, por lo que el beneficio frente al modelo base es una conjetura.
- Generacion de borradores de texto administrativo o academico: redaccion de resumenes, correos institucionales o apuntes a partir de indicaciones breves, con revision humana obligatoria dado que no hay evaluacion de calidad publicada.
- Base para RAG sobre documentacion propia: al ser un modelo instruct de 7,6 B y ejecutable localmente, puede integrarse en un pipeline de recuperacion aumentada donde la privacidad de los documentos sea un requisito, siempre que se verifique el contexto efectivo soportado.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir el impacto de Q4_K_M en tareas concretas con llama.cpp y decidir si merece la pena generar cuantizaciones mayores a partir del modelo original.
- Inferencia offline en entornos aislados: sin dependencia de APIs externas, adecuado para demostraciones en aulas, talleres o equipos sin conexion a internet.
- Trabajo de investigacion sobre riesgo de alucinacion en modelos pequenos ajustados sin documentacion: caso de uso metodologico, no de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el autor no referencia una evaluacion independiente. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 5-6 GB para los pesos en memoria, mas el consumo del contexto KV cache (que crece con la longitud de contexto configurada y depende del numero de cabezas KV). Con contextos largos, la VRAM necesaria puede superar holgadamente los 8 GB.
- VRAM estimada para FP16: alrededor de 15-16 GB solo para pesos, mas cache de contexto. El modelo original en precision completa no se distribuye en este repositorio.
- GPU de gama alta (A100, H100): sobredimensionadas para un modelo de 7,6 B; su uso solo tendria sentido para servir muchas peticiones concurrentes en paralelo.
- GPU de gama media: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 pueden ejecutar la cuantizacion Q4_K_M con margen.
- GPU de consumo: cabe en tarjetas de 8 GB (RTX 3070, RTX 4060) si se limita el contexto; en 6 GB es ajustado y probablemente requiera descarga parcial de capas a CPU.
- CPU: al ser GGUF, puede ejecutarse integramente en CPU con llama.cpp, aunque con throughput bajo (del orden de pocos tokens por segundo en procesadores de escritorio modernos); no se dispone de mediciones concretas.
- Opciones de despliegue confirmadas: llama.cpp (`llama-cli` con `--jinja`) y Ollama mediante el Modelfile incluido. Compatible tambien con cualquier frontend que consuma GGUF (por ejemplo LM Studio), aunque no esta declarado por el autor.
- vLLM y TGI: no declarados por el autor. vLLM tiene soporte parcial de GGUF y suele rendir mejor con pesos safetensors en FP16/AWQ; al no publicarse los pesos originales en este repositorio, habria que partir del modelo base ajustado, no disponible aqui.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a sus respectivos modelos base publicos; no hay resultados de benchmarks de este fine-tune que permitan comparar rendimiento real.

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| askarikzm/university_llm-gguf | 7,6 B | No disponible (base: 128.000) | No disponible | Solo GGUF Q4_K_M | Fine-tune sin documentar ni evaluar |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 tokens | Apache-2.0 | safetensors, GGUF y multiples cuantizaciones | Modelo base de referencia, ampliamente evaluado y con soporte de tool calling documentado |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | safetensors, GGUF | Alternativa habitual en el mismo rango; licencia con restricciones para grandes despliegues |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache-2.0 | safetensors, GGUF | Contexto mas corto, ecosistema maduro y licencia permisiva |

La conclusion practica de la tabla es que, salvo que el autor documente el valor anadido de su ajuste, el modelo base Qwen2.5-7B-Instruct ofrece la misma base tecnica con licencia clara, cuantizaciones oficiales y evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia, idiomas, dataset, hiperparametros, numero de tokens de entrenamiento ni evaluacion. Usarlo en produccion implica asumir un riesgo juridico y tecnico no cuantificado.
- Licencia no declarada: aunque el modelo base Qwen2.5-7B es Apache-2.0, el autor no especifica bajo que terminos distribuye el fine-tune. Antes de un uso comercial hay que contactar con el autor o asumir que no hay autorizacion explicita.
- Nombre potencialmente enganoso: `university_llm` sugiere especializacion en dominio universitario, pero no existe ninguna evidencia publicada de que el dataset de ajuste corresponda a ese dominio ni de que el modelo supere al base en tareas academicas.
- Riesgo de alucinacion: inherente a cualquier modelo de 7,6 B, y agravado por la ausencia de evaluacion y de informacion sobre alineacion. No se recomienda su uso en tareas factuales sin verificacion humana.
- Sesgos desconocidos: no hay analisis de sesgos ni informacion sobre la composicion del corpus de ajuste, lo que impide estimar sesgos de genero, idioma, origen o ideologia.
- Cobertura idiomatica incierta: no se declaran idiomas. El modelo base Qwen2.5 tiene buen rendimiento en chino e ingles y aceptable en otras lenguas, pero el ajuste puede haber desplazado esa distribucion sin que el autor lo documente.
- Contexto efectivo no verificado: aunque el modelo base soporte 128.000 tokens, una cuantizacion Q4_K_M y un ajuste no documentado pueden degradar la calidad en ventanas largas. No hay pruebas publicadas.
- Una sola cuantizacion: solo se ofrece Q4_K_M. Si se necesita mayor fidelidad numerica o menor uso de memoria, no hay alternativa en este repositorio.
- Senales de mantenimiento debiles: 0 descargas, 0 interacciones y un unico commit. La fecha de creacion registrada (2026-09-27) y la de actualizacion del mismo dia, sin cambios posteriores, indican un repositorio abandonado o puramente experimental.
- Trazabilidad del ajuste: no se enlaza el repositorio del modelo sin cuantizar (`askarikzm/university_llm`) en la model card, de modo que no se pueden reproducir los pasos completos del pipeline con la informacion del propio repositorio GGUF.
- Metodo de cuantizacion no detallado: se indica Q4_K_M en el nombre del archivo, pero no se especifica la herramienta ni los parametros exactos de conversion (aunque el uso de Unsloth lo hace probable).

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/askarikzm/university_llm-gguf
- Repositorio del modelo sin cuantizar (referenciado por el autor): https://huggingface.co/askarikzm/university_llm
- Unsloth (framework de entrenamiento y exportacion utilizado): https://github.com/unslothai/unsloth
- Organizacion GGUF-Models en HuggingFace: https://huggingface.co/GGUF-Models
- GGUF Loader (cliente de inferencia local para modelos GGUF): https://github.com/GGUFloader/gguf-loader
- Guia de ejecucion local de modelos GGUF: https://ggufloader.github.io/how-to-run-gguf-models.html
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/

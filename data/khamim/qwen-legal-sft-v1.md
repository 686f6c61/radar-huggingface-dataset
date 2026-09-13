# khamim/qwen-legal-sft-v1

## Resumen

khamim/qwen-legal-sft-v1 es un ajuste fino supervisado (SFT) del modelo unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, publicado por el usuario khamim en HuggingFace. Se trata de un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parametros (aproximadamente 1,54 mil millones), distribuido en formato safetensors con un tamano de repositorio de 3,2 GB. El nombre del repositorio sugiere un ajuste orientado al dominio legal, pero la model card no documenta el corpus, el numero de tokens ni el procedimiento de entrenamiento mas alla de indicar que se uso Unsloth y TRL.

El modelo se presenta como un derivado conversacional en ingles (tag `en`), con licencia Apache 2.0 y compatibilidad declarada con text-generation-inference y endpoints. Su relevancia practica es limitada por el momento: acumula 4 descargas y 0 likes, y fue creado y actualizado el 13 de septiembre de 2026 sin documentacion tecnica adicional. Resulta util sobre todo como ejemplo de pipeline de fine-tuning ligero con QLoRA sobre un modelo pequeno, mas que como modelo listo para produccion.

Al tratarse de un fine-tune de un modelo de 1,5B, sus capacidades de razonamiento complejo y de conocimiento juridico fiable son inherentemente acotadas. Cualquier uso en dominio legal exige validacion humana y auditoria del dataset de entrenamiento, que no esta publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (no se detallan capas ocultas ni cabezas de atencion en la model card) |
| Parametros totales | 1.543.714.304 (1,54B, dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No documentada en la model card. El modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas en el repositorio. Los pesos ocupan 3,2 GB, consistente con ~1,54B parametros en bf16/fp16. El modelo base se distribuye en 4-bit (bnb-4bit) |
| Idiomas soportados | Ingles (tag de idioma: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2, un transformer decoder-only con atencion causal. El modelo del que parte es unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, una version del Qwen2.5-1.5B-Instruct ya cuantizada a 4 bits por Unsloth. Segun la model card, el fine-tune se realizo "2x faster" con Unsloth y la libreria TRL de HuggingFace, lo que es coherente con un entrenamiento tipo QLoRA sobre pesos cuantizados y posterior fusion en precision superior.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia, el rango de LoRA, la tasa de aprendizaje ni si hubo fases de RLHF o DPO. Tampoco se documenta el preprocesado de datos ni el origen del corpus legal que sugiere el nombre del repositorio. La unica innovacion tecnica mencionada es el uso del stack Unsloth para acelerar el entrenamiento.

Un caveat tecnico relevante es que el ajuste se hace sobre un checkpoint de 4 bits, lo que puede introducir artefactos de cuantizacion en los pesos finales y limita el techo de precision respecto a un fine-tune sobre los pesos originales en bf16.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base.
- Ajuste orientado, segun el nombre del repositorio, a contenido de dominio legal; no hay evaluacion publicada que lo confirme.
- Soporte de conversaciones multi-turno mediante plantilla de chat de Qwen2 (el tag `conversational` esta presente).
- Compatibilidad declarada con text-generation-inference y con endpoints desplegables.
- No se documenta soporte de tool calling o function calling especifico para este fine-tune.
- No se documenta soporte de agentes, multi-step reasoning, modo thinking, vision ni audio.
- Capacidades multilingues: solo ingles declarado, aunque el modelo base tiene cobertura multilingue mas amplia que no se ha preservado ni verificado tras el ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ocupar 3,2 GB en disco y caber en GPU de consumo, permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Clasificacion y etiquetado de documentos legales en ingles: el ajuste apunta a terminologia juridica, por lo que puede emplearse para tareas de extraccion de clausulas o categorizacion, siempre con revision humana posterior.
- Generacion de resumenes de contratos o textos normativos: con contexto de hasta 32.768 tokens en el modelo base, admite documentos de varias decenas de paginas si se confirma esa ventana en el checkpoint ajustado.
- Base para experimentos de QLoRA y comparativas de fine-tuning: sirve como referencia reproducible del flujo Unsloth + TRL para equipos que quieran replicar el pipeline con sus propios datos.
- Despliegue en entornos con recursos limitados: puede servirse en una unica GPU de 4-6 GB, lo que habilita demos internas o entornos de desarrollo en portatiles con GPU discreta.
- Motor de respuesta en un RAG juridico interno: combinado con una base vectorial de legislacion, el modelo puede redactar borradores de respuesta citando fragmentos recuperados, con verificacion obligatoria por parte de un profesional.
- Filtrado previo en pipelines de revision documental: descartar o priorizar documentos por relevancia antes de pasarlos a un modelo mayor, reduciendo coste de inferencia.
- Generacion de datos sinteticos de dominio legal para aumentar un dataset de entrenamiento, con auditoria de calidad y deteccion de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de dominio legal, y no existe informacion sobre comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,1 GB solo para pesos, mas 1-2 GB de overhead de activaciones y cache KV, en torno a 4-6 GB en total.
- VRAM estimada con cuantizacion a 4 bits (requiere convertir a GPTQ/AWQ/GGUF): aproximadamente 1-1,5 GB de pesos, alrededor de 2-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para lotes grandes o contexto maximo, A100 o H100 aportan margen, aunque son desproporcionadas para este tamano.
- Cabe en GPU de consumo: si, de forma holgada. Incluso tarjetas de 6-8 GB pueden ejecutarlo en bf16; con cuantizacion a 4 bits es viable en iGPU con memoria unificada o en GPU de 4 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (tags del repositorio). vLLM, Ollama y llama.cpp requieren conversion previa a los formatos que cada herramienta soporte (GGUF para llama.cpp/Ollama).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| khamim/qwen-legal-sft-v1 | 1,54B | No documentado (base: 32.768 tokens) | Apache 2.0 | safetensors, transformers | Fine-tune legal sin dataset ni benchmarks publicados; 4 descargas |
| Qwen2.5-1.5B-Instruct (modelo base de la familia) | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, multiples formatos | Modelo instruct oficial, con evaluaciones publicadas por el equipo Qwen; referencia directa |
| unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit (base inmediato) | 1,54B | 32.768 tokens | Apache 2.0 | safetensors en 4 bits | Punto de partida del fine-tune; util para medir la deriva introducida por el ajuste |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama | safetensors, GGUF | Alternativa de tamano comparable con contexto mucho mayor; requiere aceptar la licencia de Meta |

Los datos de rendimiento de los modelos alternativos no se han verificado en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 1,54B parametros: la capacidad de razonamiento juridico complejo, el manejo de matices normativos y la coherencia en respuestas largas son limitados frente a modelos de mayor tamano.
- Riesgo alto de alucinacion en dominio legal: el modelo no esta verificado contra ninguna base normativa y puede generar citas, articulos o jurisprudencia inexistentes.
- Dataset de entrenamiento no documentado: se desconoce su procedencia, licencia, sesgos y cobertura, lo que impide auditar el comportamiento del modelo.
- Sesgo de idioma: solo se declara ingles. El uso en castellano no esta soportado ni evaluado.
- Deriva respecto al modelo base: no hay evaluaciones que cuantifiquen si el ajuste ha degradado capacidades generales (codigo, matematicas, instrucciones) del Qwen2.5-1.5B-Instruct original.
- Entrenamiento sobre un checkpoint de 4 bits: puede arrastrar artefactos de cuantizacion en los pesos fusionados.
- Adopcion practica nula: 4 descargas y 0 likes, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Licencia Apache 2.0 en este repositorio, pero conviene revisar los terminos del modelo base y del dataset utilizado, no declarados.
- No apto para asesoramiento legal real sin supervision de un profesional cualificado.
- Sin garantias de mantenimiento: el repositorio no se ha actualizado desde su creacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khamim/qwen-legal-sft-v1
- Modelo base declarado: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace (mencionada en la model card): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda realizada.

# henriquegalo/mtg-qwen-deck-7b-v2

## Resumen

henriquegalo/mtg-qwen-deck-7b-v2 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario henriquegalo y publicado en HuggingFace. El identificador del repositorio sugiere que el ajuste esta orientado a la generacion de barajas de Magic: The Gathering ("mtg-deck"), aunque la ficha del autor no incluye model card, descripcion de tareas ni datos del dataset de entrenamiento que lo confirmen.

El modelo se distribuye en formato transformers con pesos safetensors y esta etiquetado como conversacional, con soporte declarado para text-generation-inference y endpoints compatibles. La etiqueta de modelo base apunta a unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit, lo que indica que el entrenamiento se realizo mediante QLoRA sobre una cuantizacion de 4 bits de Qwen2.5-7B-Instruct usando la libreria Unsloth.

El repositorio no registra descargas ni interacciones, y las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a sistemas de oxidacion avanzada UV, sin relacion alguna). Por tanto, la mayor parte de la informacion tecnica sobre el ajuste concreto no esta disponible y solo puede inferirse a partir del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), segun etiquetas del repositorio |
| Parametros totales | 7B (denominacion del modelo; valor exacto no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para este ajuste (el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos, ampliables) |
| Tipos de cuantizacion | no disponible (el modelo base de entrenamiento usa bnb-4bit; no se documentan cuantizaciones publicadas del ajuste) |
| Idiomas soportados | etiqueta "en" (ingles); cobertura multilingue del ajuste no disponible |
| Licencia | apache-2.0 segun las etiquetas del repositorio; el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings de rotacion posicional (RoPE). Al tratarse de un fine-tune, la arquitectura del ajuste es identica a la del modelo base; no se han introducido modificaciones estructurales documentadas.

Segun las etiquetas del repositorio, el entrenamiento se realizo con Unsloth sobre una version cuantizada a 4 bits (bnb-4bit) del modelo base, un esquema tipico de QLoRA. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la duracion del entrenamiento, los hiperparametros ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras). Toda la informacion sobre el proceso de entrenamiento figura como no disponible.

## Capacidades

- Generacion de texto conversacional: el modelo hereda la capacidad de Qwen2.5-7B-Instruct para mantener dialogos multi-turno, si bien no hay evaluacion publicada del ajuste.
- Generacion de contenido especifico de Magic: The Gathering: el nombre del repositorio apunta a la generacion de barajas o listas de cartas, pero no hay documentacion que confirme el alcance real ni la calidad del resultado.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, no verificadas en este ajuste.
- Generacion de codigo y matematicas: capacidad esperable del modelo base Qwen2.5-7B-Instruct, no confirmada ni medida para este fine-tune.
- Tool calling / function calling: soportado por el modelo base Qwen2.5-7B-Instruct; no hay confirmacion de que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la etiqueta declara unicamente ingles; el alcance multilingue del ajuste no esta documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Generacion de barajas de Magic: The Gathering: el modelo puede utilizarse para proponer listas de 60 o 100 cartas a partir de una descripcion de estrategia, color o formato, aprovechando el ajuste especifico sobre el dominio. Es el caso de uso que sugiere el nombre del repositorio, aunque no esta validado por el autor.
- Asistente de construccion de mazos en aplicaciones web: integrado mediante la API de transformers o TGI, puede ofrecer sugerencias de cartas y ajustes de curva de mana en una interfaz de deckbuilding.
- Analisis de sinergias entre cartas: con contexto suficiente, puede recibir una lista de cartas y razonar sobre combinaciones, aunque la precision dependera del conocimiento de cartas adquirido en el ajuste.
- Chat conversacional de tematica ludica: al estar etiquetado como conversational, puede emplearse en asistentes de soporte o comunidad para juegos de cartas coleccionables.
- Generacion de descripciones y contenido editorial: redaccion de guias, articulos de estrategia o textos promocionales sobre barajas concretas.
- Prototipado de pipelines de generacion con structurado restringido: combinado con gramaticas o validadores de formato, puede forzar la salida a listas de cartas parseables, util en herramientas de automatizacion.
- Base para experimentos de fine-tuning adicional: al partir de una licencia Apache 2.0 y formato transformers estandar, sirve como punto de partida para nuevos ajustes sobre dominios similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 7B, valores orientativos): aproximadamente 15-16 GB en FP16/BF16, unos 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits con pesos y cache de contexto reducida.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) o A6000 (48 GB) para BF16 con contexto moderado.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3090 y RTX 4090 en cuantizacion de 8 o 4 bits, y en GPUs de 8-12 GB con cuantizacion de 4 bits y contextos cortos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| henriquegalo/mtg-qwen-deck-7b-v2 | 7B (aprox.) | no disponible | benchmarks no disponibles | apache-2.0 (segun etiquetas) | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct (modelo base) | 7,6B aprox. | 32.768 tokens nativos | benchmarks publicados por Alibaba, no aplicables directamente a este ajuste | Apache 2.0 | HuggingFace y multiples proveedores |
| Mistral-7B-Instruct-v0.3 | 7,2B aprox. | 32.768 tokens | benchmarks publicados por Mistral | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B aprox. | 128.000 tokens | benchmarks publicados por Meta | Llama 3.1 Community License | HuggingFace |

Nota: los datos de la columna "rendimiento" corresponden a los modelos originales; no existe ninguna evaluacion comparativa publicada del ajuste mtg-qwen-deck-7b-v2.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre dataset, hiperparametros, evaluacion ni uso previsto, lo que impide auditar el comportamiento del modelo.
- Riesgo alto de alucinacion en el dominio de Magic: The Gathering: es probable que el modelo invente nombres de cartas, costes de mana o interacciones inexistentes, especialmente porque el ajuste no documenta una base de datos verificada de cartas.
- Posible perdida de capacidades generales: un fine-tune con QLoRA sobre un unico dominio puede degradar el rendimiento en tareas generales respecto al modelo base, sin que existan metricas que lo cuantifiquen.
- Sesgos: no documentados; al derivar de Qwen2.5-7B-Instruct, hereda los sesgos del corpus de entrenamiento original.
- Limitaciones de idioma: la etiqueta declara unicamente ingles; el comportamiento en castellano no esta verificado.
- Limitaciones de contexto: la longitud de contexto efectiva del ajuste no esta documentada y podria ser inferior a la del modelo base.
- Licencia: aunque las etiquetas indican Apache 2.0, el campo de licencia de la ficha figura como no disponible; se recomienda verificar los terminos antes de un uso comercial.
- Madurez: repositorio sin descargas ni interacciones, sin fecha de actualizacion posterior a la creacion y sin historial de mantenimiento, lo que lo hace inadecuado como dependencia en produccion sin validacion propia.
- Las busquedas web realizadas no devolvieron informacion contrastable sobre el modelo, por lo que no existen referencias externas que respalden su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/henriquegalo/mtg-qwen-deck-7b-v2
- Modelo base declarado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria de entrenamiento mencionada en las etiquetas: https://github.com/unslothai/unsloth
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los anteriores.

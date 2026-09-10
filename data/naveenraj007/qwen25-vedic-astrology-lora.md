# NAVEENRAJ007/qwen25-vedic-astrology-lora

## Resumen

qwen25-vedic-astrology-lora es un adaptador LoRA publicado por el usuario NAVEENRAJ007 sobre el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit. Se trata, por tanto, de un ajuste fino de dominio sobre un transformer decoder-only de la familia Qwen2.5 de 7 610 millones de parametros, orientado aparentemente a la generacion de contenido de astrologia vedica (Jyotish) en ingles. El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El interes de esta publicacion es limitado pero instructivo: ilustra el flujo habitual de QLoRA con Unsloth y TRL sobre un base cuantizado en 4 bits, con licencia Apache-2.0 y compatibilidad declarada con text-generation-inference. No incluye model card detallada, ni dataset de entrenamiento, ni hiperparametros, ni evaluaciones. A fecha de la informacion disponible acumula 0 descargas y 0 likes, y fue creado el 10 de septiembre de 2026.

Para un desarrollador o investigador, este modelo es relevante como ejemplo de adaptador de dominio ligero y como punto de partida reproducible, no como componente listo para produccion: carece de validacion publica de calidad y su rendimiento real en tareas de astrologia vedica no esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con RoPE, GQA, SwiGLU y RMSNorm; adaptador LoRA de bajo rango sobre el modelo base |
| Parametros totales | 7 610 millones en el modelo base Qwen2.5-7B (dato de la documentacion publica del base, no de la model card); el adaptador anade un numero de parametros no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos y hasta 131 072 con YaRN, segun la documentacion publica de Qwen |
| Tipos de cuantizacion | Modelo base entrenado en bnb 4-bit; el adaptador se distribuye en safetensors. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (declarado en la model card). El base Qwen2.5 cubre mas idiomas, pero no hay informacion sobre el alcance multilingue de este ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); tamano del repositorio 0,2 GB |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Libreria | transformers (tags: text-generation-inference, unsloth, qwen2, trl) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de Qwen2.5 con 28 capas, atencion con consultas agrupadas (GQA), normalizacion RMSNorm previa a cada subcapa, activacion SwiGLU en el bloque feed-forward y embeddings rotatorios (RoPE) para la codificacion posicional, ademas de sesgos en las proyecciones QKV. Sobre esa base se ha entrenado un adaptador LoRA de bajo rango, lo que congela los pesos originales y solo actualiza un conjunto reducido de matrices de bajo rango en las proyecciones de atencion y feed-forward.

El entrenamiento se realizo con Unsloth y TRL, segun los tags del repositorio y la unica frase de la model card ("trained 2x faster with Unsloth"). El modelo base ya estaba cuantizado en 4 bits mediante bitsandbytes, de modo que se trata de un flujo QLoRA. No se especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, el rango y alpha del adaptador, la tasa de aprendizaje, el numero de epocas ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para reducir el coste de computo.

## Capacidades

- Generacion de texto en ingles sobre tematica de astrologia vedica (Jyotish), presumiblemente interpretaciones de cartas, explicaciones de conceptos y texto divulgativo. No hay evaluacion publica que lo confirme.
- Hereda del base Qwen2.5-7B-Instruct la capacidad general de conversacion multi-turno, comprension lectora, razonamiento basico, generacion de codigo y matematicas, aunque el ajuste de dominio puede degradar total o parcialmente estas capacidades (olvido catastrofico no medido).
- Soporte de tool calling y function calling: el base Qwen2.5-7B-Instruct lo soporta; no hay confirmacion de que el ajuste lo preserve.
- Uso en flujos de agente y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas; la model card solo declara ingles.
- Capacidades especiales: no se declaran modos de razonamiento explicito (thinking), vision ni audio. No hay indicios de entrenamiento con plantillas especiales mas alla de la del base.

## Casos de uso

- Generacion de interpretaciones de cartas astrales: si se le suministran las posiciones planetarias, casas y nakshatras ya calculadas por un motor efemeride externo, el adaptador puede redactar la lectura en ingles. Es adecuado porque el ajuste esta orientado a ese dominio, pero el modelo no calcula efemerides por si mismo.
- Chatbot de consulta astrologica multi-turno: integrado en una aplicacion de ocio o bienestar, puede mantener conversaciones con el usuario sobre signos, dashas y yogas. La ventana de contexto efectiva depende del base (hasta 131 072 tokens con YaRN), suficiente para hilos largos con historial y datos de carta.
- Generacion de contenido editorial a escala: produccion de textos por signo, por nakshatra o por periodo de dasha para blogs, newsletters o apps de astrologia, con revision humana antes de publicar.
- Prototipado rapido de asistentes verticales: al ocupar 0,2 GB, el adaptador se puede servir en vLLM con `--enable-lora` junto al base y cambiar entre varias especializaciones sin duplicar el modelo completo, con un coste de almacenamiento muy bajo.
- Herramienta educativa para estudiantes de Jyotish: uso como asistente que explica terminologia (rashi, bhava, nakshatra, varga) y ayuda a repasar conceptos, siempre con verificacion por fuentes tradicionales, dado que no hay garantia de exactitud.
- Base para experimentos de ajuste por dominio: sirve como referencia reproducible de un flujo Unsloth + TRL sobre Qwen2.5-7B en 4 bits, util para comparar hiperparametros o tecnicas de QLoRA en investigacion aplicada.
- Despliegue en entornos con recursos limitados: fusionando el adaptador con el base y cuantizando a GGUF, podria ejecutarse en una GPU de consumo o incluso en CPU para demos, aunque esa ruta no esta documentada ni validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni metricas de dominio), y no existen tablas comparativas con otros ajustes de astrologia vedica.

## Requisitos de hardware

- VRAM del adaptador: despreciable por si solo (0,2 GB en disco); el coste real lo determina el modelo base de 7 610 millones de parametros.
- Inferencia en fp16/bf16 con el modelo fusionado: aproximadamente 15-16 GB solo para pesos, mas la cache KV, que crece con la longitud de contexto y el numero de secuencias concurrentes.
- Inferencia en 4 bits (formato nativo del base entrenado, bitsandbytes o GPTQ/AWQ equivalente): aproximadamente 4,5-6 GB de pesos, lo que permite ejecucion en GPUs de 8-12 GB dependiendo de la longitud de contexto.
- Inferencia en 8 bits: alrededor de 8 GB de pesos.
- GPUs recomendadas: A100 40/80 GB o H100 para servicio con contexto largo y concurrencia alta; RTX 4090, RTX 3090 o L40S (24 GB) para fp16 con contexto moderado o para cuantizacion de 4 bits con margen amplio; RTX 4070/4060 Ti de 12-16 GB solo en cuantizacion de 4 bits y contextos cortos.
- Cabe en GPU de consumo: si, en GPUs de 8 GB o mas si se usa el base en 4 bits y se limita la ventana de contexto; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: vLLM y Hugging Face TGI (el tag text-generation-inference aparece en el repositorio) para servir el adaptador sobre el base; transformers + peft para carga directa; llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir a GGUF, tarea no documentada por el autor.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de la columna de los modelos alternativos proceden de su documentacion publica, no de mediciones realizadas para esta ficha. No hay ningun benchmark que permita comparar la calidad de este adaptador con la de los modelos citados.

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| NAVEENRAJ007/qwen25-vedic-astrology-lora | Adaptador sobre 7 610 M (base) | No especificado (base: 32 768 nativos, 131 072 con YaRN) | Apache-2.0 | LoRA de dominio | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base sin ajustar) | 7 610 M | 32 768 nativos, 131 072 con YaRN | Apache-2.0 | Modelo instructivo general | Ampliamente disponible y documentado |
| Llama-3.1-8B-Instruct | 8 030 M | 128 000 | Llama 3.1 Community License | Modelo instructivo general | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7 250 M | 32 768 | Apache-2.0 | Modelo instructivo general | Ampliamente disponible |

No se han identificado en la informacion proporcionada otros adaptadores publicos comparables especificamente entrenados para astrologia vedica, por lo que la comparativa de dominio queda como "no disponible".

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas cualitativas, ni ejemplos de salida. No es posible estimar la calidad real del ajuste.
- Documentacion minima: la model card no indica dataset, hiperparametros, rango del LoRA ni procedimiento de entrenamiento, lo que impide reproducir el resultado.
- Sesgos: no se ha realizado ninguna auditoria. El material de astrologia vedica puede incorporar sesgos culturales, de genero o de casta presentes en las fuentes de entrenamiento, no declaradas.
- Alucinacion: riesgo alto en un dominio donde el modelo puede inventar posiciones planetarias, nombres de nakshatras, periodos de dasha o referencias textuales. Requiere verificacion externa obligatoria.
- Naturaleza del dominio: la astrologia no tiene base cientifica. Cualquier producto que lo use deberia presentar el contenido como entretenimiento o contenido cultural, y evitar recomendaciones medicas, legales o financieras derivadas de sus respuestas.
- Olvido catastrofico: el ajuste puede haber degradado capacidades generales del base (codigo, matematicas, tool calling), sin que exista medicion alguna.
- Limitacion idiomatica: solo se declara ingles. El castellano no esta soportado de forma declarada y su comportamiento en ese idioma es desconocido.
- Restricciones de licencia: Apache-2.0 permite uso comercial del adaptador, pero al derivar de Qwen2.5-7B-Instruct conviene revisar tambien las condiciones del modelo base, que es Apache-2.0. El base publicado por Unsloth esta cuantizado en 4 bits y su redistribucion deberia hacerse con las mismas condiciones.
- Caveat de entrenamiento: el adaptador se entreno sobre un base cuantizado en 4 bits, por lo que cargarlo sobre un base en fp16 puede producir degradaciones de calidad respecto al comportamiento observado durante el entrenamiento; el autor no documenta ninguna validacion en ese sentido.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion, lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo: son foros genericos (Lowyat.NET, Microsoft Community) sin relacion con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NAVEENRAJ007/qwen25-vedic-astrology-lora
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Documentacion de TRL (tag del repositorio): https://huggingface.co/docs/trl
- Informe tecnico de Qwen2.5 (arquitectura y contexto del modelo base): https://arxiv.org/abs/2412.15115
- Enlaces relevantes adicionales encontrados en la busqueda web: no disponible (los resultados obtenidos no guardan relacion con el modelo).

# kawattaronin/Skyfall-31B-v4.2-abliterix

## Resumen

Skyfall-31B-v4.2-abliterix es un modelo de lenguaje de 31 352 980 480 parámetros publicado por el usuario kawattaronin en HuggingFace. Se trata de una versión "decensored" (abliterated) de TheDrummer/Skyfall-31B-v4.2, obtenida aplicando la herramienta Abliterix v1.12.2 sobre los pesos del modelo original. La cadena de ascendencia declarada es: mistralai/Magistral-Small-2509 (modelo base) → TheDrummer/Skyfall-31B-v4.2 (fine-tuning creativo) → este repositorio (abliteración). El objetivo declarado es eliminar las respuestas de rechazo del modelo original sin reentrenar.

El modelo no introduce arquitectura nueva: hereda íntegramente la del modelo del que deriva, y su única modificación es la alteración dirigida de pesos en las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y en la capa mlp.down_proj, aplicando factores de escala por capa definidos en una tabla de parámetros de steering. Según la model card, esta intervención reduce los rechazos de 93/100 a 11/100 sobre un conjunto de evaluación de 100 prompts, con una divergencia KL de 0,0352 respecto al modelo original.

Su relevancia es acotada pero específica: es un ejemplo reproducible de técnica de abliteración con parámetros públicos y métricas de evaluación declaradas, lo que lo hace útil para investigación en seguridad de modelos, evaluación de robustez de alineamiento y generación de contenido creativo sin filtros. No hay datos publicados de benchmarks de conocimiento o razonamiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivada de mistralai/Magistral-Small-2509; transformer denso segun la ascendencia declarada) |
| Parametros totales | 31 352 980 480 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base mistralai/Magistral-Small-2509 declara 128 000 tokens segun la documentacion publica de Mistral AI |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; el repositorio solo contiene safetensors en precision completa. Se pueden generar GGUF, AWQ, GPTQ o bitsandbytes con herramientas externas |
| Idiomas soportados | no disponible (heredados del modelo base; no declarados en el repositorio) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (precision completa; 62,7 GB de repositorio) |

Otros datos de interes: identificador kawattaronin/Skyfall-31B-v4.2-abliterix, pipeline no disponible, creado el 2026-10-04 y actualizado el 2026-10-04 segun los metadatos del repositorio.

## Arquitectura y entrenamiento

No hay arquitectura propia. El modelo es el resultado de una intervención sobre pesos existentes, no de un entrenamiento. La model card indica que se partió de TheDrummer/Skyfall-31B-v4.2 y se aplico Abliterix v1.12.2, una herramienta que calcula direcciones de rechazo y las sustrae de los pesos con factores de escala configurables por capa. Los parametros de steering publicados distinguen cuatro familias de pesos: atencion (attn.k_proj, attn.q_proj, attn.v_proj, attn.o_proj) y la proyeccion descendente del bloque MLP (mlp.down_proj).

Cada familia se define con cuatro valores: max_weight, max_weight_position, min_weight y min_weight_distance. Por ejemplo, attn.q_proj usa max_weight 1,40 en la posicion 33,17 y min_weight 0,83 con distancia 17,49; mlp.down_proj, en cambio, usa valores muy bajos (0,07 y 0,02), lo que indica una intervencion mucho mas suave sobre esa capa. La seleccion es "per layer" (vector_index = per layer). No se declara el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO, porque no hubo entrenamiento: el proceso es puramente post-hoc sobre los pesos del modelo de partida.

## Capacidades

- Generacion de texto y escritura creativa: el modelo de partida (Skyfall) esta orientado explicitamente a creatividad, narrativa y entretenimiento, segun la filosofia declarada por su autor.
- Reduccion de rechazos: la model card reporta 11 rechazos sobre 100 prompts, frente a 93 sobre 100 del modelo original.
- Reproducibilidad de la intervencion: los parametros de steering estan publicados y la herramienta empleada (Abliterix v1.12.2) es de acceso publico, por lo que el procedimiento es replicable.
- Razonamiento y capacidades del modelo base: heredadas de mistralai/Magistral-Small-2509, aunque no se documentan ni verifican en este repositorio.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (no declaradas).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: usar el par original/abliterado para medir como se degrada la tasa de rechazo y que coste tiene en divergencia KL (0,0352 declarado). Permite estudiar la robustez de las tecnicas de alineamiento frente a intervenciones sobre pesos.
- Evaluacion de red teaming: emplear el modelo para generar respuestas que el modelo alineado rechazaria y analizar categorias de contenido problematico, con el fin de disenar filtros de entrada y salida mas eficaces en produccion.
- Escritura de ficcion sin restricciones tematicas: narrativa con violencia, temas moralmente ambiguos o personajes antagonistas, donde los modelos alineados suelen aplicar rechazos suaves o derivaciones. El ajuste declarado del autor esta orientado a este uso.
- Generacion de dialogos para guiones y videojuegos: creacion de arboles de dialogo para personajes con registros duros o conflictivos, con menos interrupciones por parte del modelo.
- Simulacion de personajes en entornos de rol: mantenimiento de voces consistentes en conversaciones largas, apoyandose en la ventana de contexto del modelo base (hasta 128 000 tokens segun la documentacion de Mistral AI).
- Generacion de datasets sinteticos para entrenamiento de clasificadores de toxicidad: el modelo puede producir ejemplos negativos dificiles de obtener con modelos fuertemente alineados, utiles para entrenar y evaluar moderadores.
- Traduccion de textos sensibles o vulgares: traslacion de contenido con lenguaje explicito donde otros modelos suavizan o censuran el registro original.
- Despliegue local en flujos de trabajo con datos privados: al ser un modelo de pesos abiertos, puede ejecutarse en infraestructura propia sin enviar prompts a terceros.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (TheDrummer/Skyfall-31B-v4.2) |
|---|---|---|
| Divergencia KL | 0,0352 | 0 (por definicion) |
| Rechazos | 11/100 | 93/100 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las dos metricas anteriores son las unicas declaradas y miden exclusivamente el efecto de la abliteracion, no la calidad general del modelo.

## Requisitos de hardware

- Peso de los pesos en precision completa: 31,35 mil millones de parametros en bf16 equivalen a aproximadamente 62,7 GB de safetensors, coherente con el tamano de repositorio declarado.
- Inferencia en bf16/fp16: reservar del orden de 68-75 GB de VRAM incluyendo cache KV y overhead del runtime. Cabe en una NVIDIA H100 80 GB o A100 80 GB; requiere al menos 2x A100 40 GB o 4x RTX 4090 con tensor parallelism.
- Inferencia en FP8: aproximadamente 31-35 GB de VRAM, viable en una L40S 48 GB o A100 40 GB (ajustado) y en 2x RTX 4090.
- Cuantizacion de 4 bits (AWQ, GPTQ, bitsandbytes NF4): aproximadamente 17-19 GB, por lo que cabe en una RTX 4090 24 GB o RTX 3090 24 GB, con margen limitado para contexto largo.
- GGUF: no se distribuye ninguna cuantizacion GGUF en el repositorio. Habria que generarla con llama.cpp. Como referencia de tamano, Q4_K_M quedaria en torno a 18-20 GB, Q5_K_M en torno a 22 GB y Q8_0 en torno a 33 GB; estos valores son estimaciones de tamano, no mediciones publicadas.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, RTX 5090) solo con cuantizacion de 4 bits y contexto recortado. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers, vLLM, TGI, SGLang, llama.cpp y Ollama (estos dos ultimos requieren convertir previamente los pesos safetensors a GGUF).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni rendimiento por lote en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia declarada | Estado |
|---|---|---|---|---|
| kawattaronin/Skyfall-31B-v4.2-abliterix | 31,35 B | no disponible (base: 128 000 segun Mistral AI) | no disponible | Repositorio sin descargas registradas |
| TheDrummer/Skyfall-31B-v4.2 | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo de partida, alineado |
| mistralai/Magistral-Small-2509 | no disponible en la informacion proporcionada | 128 000 segun documentacion de Mistral AI | Apache 2.0 segun documentacion de Mistral AI | Modelo base, publicado por Mistral AI |

No se dispone de datos de rendimiento comparables (MMLU, HumanEval, GSM8K) de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a la relacion de ascendencia y a la licencia declarada. Los datos de los modelos alternativos proceden de su documentacion publica y no se han podido verificar dentro de la informacion de este repositorio.

## Limitaciones y advertencias

- Sin licencia declarada: el repositorio no especifica licencia, lo que genera incertidumbre juridica para cualquier uso comercial. Conviene verificar las condiciones del modelo base (mistralai/Magistral-Small-2509, publicado bajo Apache 2.0 segun la documentacion de Mistral AI) y del modelo intermedio antes de desplegarlo.
- Eliminacion deliberada de barreras de seguridad: la abliteracion suprime la tendencia al rechazo (de 93/100 a 11/100). El modelo producira con mucha mayor probabilidad contenido que otros modelos bloquean, incluido material ofensivo, ilegal o danino si el prompt lo solicita.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad. Como todo modelo de lenguaje, puede generar afirmaciones falsas con apariencia de certeza, y la perdida de alineamiento no mejora la factualidad.
- Degradacion por la intervencion: la divergencia KL de 0,0352 respecto al original indica que la distribucion de salida se ha alterado. No se documenta si esa divergencia afecta a tareas distintas de las creativas (codigo, matematicas, instrucciones estrictas).
- Idiomas no declarados: no hay lista oficial de lenguas soportadas ni evaluaciones por idioma. El rendimiento en castellano no esta verificado.
- Contexto no confirmado para esta version: la ventana de 128 000 tokens corresponde al modelo base declarado, no a un dato publicado en este repositorio.
- Metadatos poco fiables: el repositorio cuenta con 0 descargas y 0 likes, no declara pipeline, idiomas ni licencia, y la model card incorpora texto promocional del autor del modelo intermedio. La validacion practica es imprescindible antes de cualquier uso en produccion.
- Responsabilidad legal: el uso del modelo para generar contenido sexual explicito, de acoso o que vulnere la legislacion aplicable es responsabilidad exclusiva del operador. Se recomienda implementar filtros propios en cualquier despliegue orientado al publico.
- Herramientas de despliegue: al no existir cuantizaciones GGUF oficiales, el uso con llama.cpp u Ollama exige una conversion previa cuyos resultados pueden diferir de los del modelo en safetensors.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kawattaronin/Skyfall-31B-v4.2-abliterix
- Modelo base declarado: https://huggingface.co/mistralai/Magistral-Small-2509
- Modelo de partida (original alineado): https://huggingface.co/TheDrummer/Skyfall-31B-v4.2
- Herramienta de abliteracion empleada: https://github.com/wuwangzhang1216/abliterix
- Perfil del autor del modelo original: https://huggingface.co/TheDrummer
- Enlaces de contacto del autor original: https://linktr.ee/thelocaldrummer
- Patreon del autor original: https://www.patreon.com/TheDrummer

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre Abliterix; los enlaces recuperados no guardan relacion con el objeto de esta ficha y se han descartado.

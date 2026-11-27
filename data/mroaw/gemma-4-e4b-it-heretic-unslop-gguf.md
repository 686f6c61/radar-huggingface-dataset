# mroaw/gemma-4-E4B-it-heretic-unslop-GGUF

## Resumen

`mroaw/gemma-4-E4B-it-heretic-unslop-GGUF` es una cuantizacion en formato GGUF de un ajuste fino derivado de Gemma 4 E4B, orientada a generacion creativa, roleplay y escritura sin restricciones de contenido (uncensored). El autor, `mroaw`, parte del modelo `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic` y aplica una edicion de pesos que denomina "unslop": un proceso de ajuste cuyo objetivo es reducir las formulas repetitivas y el estilo estereotipado que introduce el RLHF original de Gemma, manteniendo el vocabulario rico y el modo de razonamiento interno del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la comunidad de modelos abiertos: la cadena de derivaciones (Gemma 4 E4B -> variante "uncensored/heretic" -> edicion de pesos "unslop" -> cuantizacion GGUF) y sus implicaciones practicas de licencia y calidad. Por otro, aporta metricas concretas de la model card del autor, como la perplejidad sobre prosa de referencia (20,56 en el baseline frente a 11,81 en la version v3) o la divergencia KL respecto al modelo base (0,231 nats), que permiten evaluar el efecto real de la edicion de pesos.

El modelo declara 7.463.013.674 parametros totales (segun los safetensors del modelo base), un repositorio de 15,9 GB y 297 descargas en el momento de la consulta. La licencia es la Gemma License, que impone restricciones de uso comercial. No se dispone de informacion sobre la longitud de contexto efectiva, los idiomas soportados ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B); no se detalla la configuracion exacta en la informacion disponible |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor publica al menos `Q4_K_M` (4,94 GB); no se detallan el resto de variantes |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (el modelo base se distribuye presumiblemente en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una variante de Gemma 4 E4B, es decir, un transformer decoder-only de la familia Gemma 4. No se detalla en la model card la configuracion de capas, atencion, dimensiones ocultas ni el esquema de atencion (por ejemplo, si emplea atencion lineal o ventanas deslizantes). Tampoco se especifica si E4B implica un esquema de mezcla de expertos (MoE) o una nomenclatura de eficiencia; con los datos aportados no es posible confirmarlo, por lo que se marca como no disponible.

El entrenamiento documentado es el de la cadena de derivaciones: el modelo parte de `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic`, una variante "uncensored" que a su vez deriva de Gemma 4 E4B instruct. Sobre esa base, el autor aplica una edicion de pesos ("weight-edited") en version v3, identificada como `v3A_T15`, cuyo objetivo es eliminar el "slop" o estilo formulaico inducido por el RLHF: frases hechas, nombres recurrentes ("Elias Vance"), metaforas gastadas ("flour-dusted cathedral", "velvet darkness") y cadencias predecibles. La model card reporta que la edicion reduce la perplejidad sobre prosa de referencia de 20,56 a 11,81 (1,74x mas natural), aumenta la perplejidad sobre el "slop" antiguo de 1,77 a 2,80 (1,58x menos formulaico) y mantiene la diversidad lexica (Distinct-2 de 0,945 a 0,938). La divergencia KL frente al modelo base, medida sobre `harmless_alpaca` y conversaciones multi-turno, es de 0,231 nats, lo que indica un cambio moderado pero no trivial en la distribucion de salida.

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o RL adicionales mas alla del ajuste heredado de las etapas anteriores. Tampoco se describe ninguna innovacion arquitectonica propia; la innovacion es exclusivamente de edicion de pesos y cuantizacion.

## Capacidades

- Generacion de texto en modo conversacional y de escritura creativa, con enfasis en prosa literaria, narrativa y descripcion.
- Roleplay multi-turno, incluyendo cambios de tema entre turnos segun la model card.
- Modo de razonamiento interno ("thinking mode") de Gemma 4, que funciona por defecto y puede desactivarse (`enable_thinking = false`).
- Comportamiento "uncensored": el modelo base ha sido ajustado para reducir rechazos ante contenido sensible; la edicion v3 declara preservar ese comportamiento.
- Vocabulario literario y tecnico sin simplificacion aparente, con la advertencia del autor de que v3 no introduce jerga ni palabrotas.
- Generacion de resumenes, opiniones y textos de marketing breves (blurbs, parrafos de opinion).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multimodales en la informacion disponible.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta optimizado para prosa narrativa con vocabulario rico; la reduccion de perplejidad sobre prosa de referencia (11,81 frente a 20,56) sugiere un estilo menos formulaico, adecuado para borradores de relatos y novelas.
- Roleplay conversacional: la model card verifica cambios de tema limpios en multi-turno, lo que lo hace util para personajes persistentes en aplicaciones de entretenimiento, siempre que se respete la licencia Gemma.
- Generacion de textos de marketing breves: los ejemplos de la model card incluyen blurbs de contraportada y parrafos de opinion, tareas en las que el modelo produce texto conciso y con gancho.
- Prototipado local de asistentes de escritura: al ser un GGUF de 4,94 GB en `Q4_K_M`, puede ejecutarse en equipos de consumo con llama.cpp u Ollama, lo que facilita iterar en local sin infraestructura cloud.
- Generacion de dialogos para videojuegos o narrativa interactiva: el modo thinking y el roleplay multi-turno permiten mantener coherencia de personaje en sesiones largas, aunque la longitud de contexto no esta documentada.
- Experimentacion en investigacion sobre edicion de pesos y "des-slop": el modelo sirve como caso de estudio reproducible de como una edicion de pesos afecta a perplejidad, diversidad lexica y divergencia KL, con metricas publicadas.
- Filtrado y reescritura de estilo: puede emplearse para reescribir textos que suenan a "slop" de RLHF hacia una prosa mas natural, segun la propia definicion del autor.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Si publica metricas internas de la edicion de pesos sobre `Q4_K_M`:

| Metrica (`Q4_K_M`) | Baseline Heretic | v3 Unslop (`v3A_T15`) |
|---|---:|---:|
| Perplejidad sobre prosa de referencia (menor es mejor) | 20,56 | 11,81 (1,74x mas natural) |
| Perplejidad sobre "slop" antiguo (mayor es mejor) | 1,77 | 2,80 (1,58x menos formulaico) |
| Desplazamiento de probabilidades comparable (Base vs. Slop) | 1,00x | 2,75x |
| Diversidad lexica (Distinct-2, mayor es mejor) | 0,945 | 0,938 |
| Divergencia KL (`harmless_alpaca` + multi-turno) | 0,000 | 0,231 nats |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `Q4_K_M` ocupa 4,94 GB; con overhead de contexto y cache KV, se recomienda al menos 6-8 GB de VRAM para contexto moderado. El repositorio completo pesa 15,9 GB, lo que sugiere que el autor publica varias cuantizaciones.
- GPU recomendadas: no hay datos especificos del autor. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar la cuantizacion `Q4_K_M` con holgura; en el segmento profesional, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, al menos en `Q4_K_M` (4,94 GB). Las cuantizaciones de mayor calidad del repositorio (hasta 15,9 GB en total) pueden requerir 16-24 GB de VRAM.
- Opciones de despliegue: llama.cpp y su servidor `llama-server` (usado por el autor en los ejemplos), Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. La model card solo indica los parametros de muestreo recomendados (`temperature = 0,8-0,9`, `top_p = 0,92-0,95`) y que los ejemplos se generaron con `seed = 42`, `temperature = 0,85`, `top_p = 0,92` y `enable_thinking = false`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mroaw/gemma-4-E4B-it-heretic-unslop-GGUF` (este) | 7.463.013.674 | no disponible | Gemma License | GGUF | Edicion de pesos "unslop" v3 sobre base uncensored; metricas de perplejidad publicadas |
| `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic` (base) | no disponible en la informacion | no disponible | Gemma License (presumible) | no disponible | Variante uncensored/heretic de Gemma 4 E4B; sirve de baseline con perplejidad 20,56 |
| Gemma 4 E4B instruct (original) | no disponible en la informacion | no disponible | Gemma License | safetensors (presumible) | Modelo de referencia de Google; incluye RLHF que el autor considera generador de "slop" |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes (por ejemplo, Llama o Qwen de tamano similar) en parametros, contexto o rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin censura: el ajuste "uncensored/heretic" reduce los rechazos ante contenido sensible; no es adecuado para aplicaciones orientadas a publico general sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el enfasis en creatividad y la edicion de pesos pueden aumentar la propension a inventar datos, especialmente en modo roleplay.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del modelo base Gemma 4 y de las etapas de ajuste comunitario.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de la Gemma License antes de desplegar en produccion.
- Idiomas: no se especifican los idiomas soportados; la model card esta en ingles y los ejemplos son en ingles, por lo que el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto no esta documentada; no se debe asumir una ventana larga sin pruebas.
- Cadena de derivaciones: al ser un ajuste de pesos sobre un modelo ya modificado por terceros, la trazabilidad de los datos de ajuste es limitada y no se documenta el dataset.
- Formato GGUF: pensado para inferencia local con llama.cpp/Ollama; no es el formato adecuado para entrenamiento o ajuste fino directo.
- Sin garantias de calidad en tareas tecnicas: las metricas publicadas miden naturalidad de prosa, no correccion en codigo, matematicas o razonamiento formal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mroaw/gemma-4-E4B-it-heretic-unslop-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

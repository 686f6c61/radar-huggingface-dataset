# matfax/Fenrir-X-26B-A4B-exl3-2.75bpw-hq

## Resumen

Fenrir-X-26B-A4B-exl3-2.75bpw-hq es una cuantizacion en formato EXL3 (ExLlamaV3) a 2,75 bits por peso, publicada por el usuario matfax, del modelo Vortex5/Fenrir-X-26B-A4B. Se trata por tanto de un artefacto de cuantizacion, no de un entrenamiento nuevo: su proposito es reducir el peso en disco y en memoria del modelo original para hacerlo desplegable en GPUs de gama de consumo, manteniendo la mayor fidelidad posible respecto al modelo en bfloat16 (variante "hq", de alta calidad).

El modelo base, Fenrir-X-26B-A4B, es a su vez un merge (fusión de pesos) construido a partir de google/gemma-4-26B-A4B-it y de cuatro derivados: gemma-4-26B-A4B-it-Claude-Opus-Distill-v2 (TeichAI), Pantheon-Reasoning-26B-A4B-1.1-V2 (Gryphe), gemma4-26b-fiction-bf16 (electroglyph) y Gemma-4-26B-A4B-Animus-V14.1-FFT (Darkhn). El método de fusión declarado es "bsc", con parametros de gain 0,95, balance 0,95, synthesis 0,92 y anchor 0,92, y pesos diferenciados por proyeccion (atencion, MLP denso y expertos MoE). El objetivo declarado del modelo es el roleplay, la escritura creativa, la narrativa larga y la ficcion interactiva.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de arquitectura MoE de la familia Gemma 4 (denominado 26B-A4B, es decir, 26.000 millones de parametros totales con 4.000 millones activos por token) en configuraciones de VRAM moderadas. Conviene senalar una discrepancia entre la denominacion comercial y los metadatos: el repositorio declara 5.938.379.214 parametros en el recuento de safetensors, frente a los ~26B que sugiere el nombre y el modelo base. No se dispone de informacion que explique esa diferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer MoE (derivada de Gemma 4, base google/gemma-4-26B-A4B-it); configuracion exacta no disponible |
| Parametros totales | 26B segun la denominacion del modelo base; 5.938.379.214 segun metadatos de safetensors del repositorio (dato no coincidente, sin explicacion disponible) |
| Parametros activos | ~4B por token segun la nomenclatura "A4B" del modelo base; no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,75 bits por peso (variante hq, "high quality"); no se listan otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3 (ExLlamaV3); libreria declarada: transformers |
| Tamano del repositorio | 11,9 GB |
| Modalidad declarada (pipeline) | image-text-to-text |
| Modelo base | Vortex5/Fenrir-X-26B-A4B (relacion: quantized) |
| Autor | matfax |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una cuantizacion del modelo Vortex5/Fenrir-X-26B-A4B, que a su vez es una fusion de pesos. El modelo raiz es google/gemma-4-26B-A4B-it, de arquitectura transformer con mezcla de expertos (MoE), donde la nomenclatura "A4B" indica aproximadamente 4.000 millones de parametros activos por token sobre un total de ~26.000 millones. El pipeline declarado en HuggingFace es image-text-to-text, lo que sugiere capacidad de entrada multimodal de imagen, si bien la model card no detalla el tratamiento de vision ni el proyector utilizado.

La fusion se realizo con el metodo declarado "bsc" sobre cinco modelos, aplicando pesos especificos por tipo de capa: las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y las capas MLP densas (gate_proj, up_proj, down_proj) reciben pesos distintos de los de los expertos (experts.gate_up_proj, experts.down_proj). Por ejemplo, el componente Animus-V14.1-FFT solo aporta a las capas de expertos (pesos 0,27-0,40 en gate_up_proj y down_proj), mientras que la distill de Claude Opus aporta a todas las proyecciones. El tokenizer se hereda del modelo base y el chat template se toma de forma automatica.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF o DPO en el modelo base. La cuantizacion EXL3 aplicada aqui emplea un esquema de precision mixta por bloques (habitual en ExLlamaV3) con un promedio de 2,75 bits por peso, y el autor la etiqueta como "hq", lo que implica una busqueda de parametros de cuantizacion orientada a minimizar la perdida de calidad frente al bfloat16 original.

## Capacidades

- Generacion de texto conversacional orientada a personajes: la model card declara explicitamente interaccion con personas, dialogo y escenas emocionales.
- Escritura creativa: ficcion, prosa descriptiva, atmosfera y borradores con control estilistico.
- Narrativa de formato largo: tramas con continuidad, construccion de mundo y personajes que evolucionan.
- Ficcion interactiva: narrativas ramificadas, juego de escenarios y tramas que se desarrollan de forma continua.
- Entrada de imagen: el pipeline declarado es image-text-to-text, aunque no se detallan en la model card las capacidades de vision concretas.
- Herencia del modelo base Gemma 4 (razonamiento y conocimiento general): plausible, pero no confirmada en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (el componente Pantheon-Reasoning presente en la fusion apunta a capacidades de razonamiento, pero no se documenta su efecto final).
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Roleplay con personajes persistentes: el modelo esta disenado para mantener personalidad, tono y coherencia emocional a lo largo de conversaciones largas, lo que lo hace adecuado para asistentes de entretenimiento y plataformas de chat con personajes.
- Escritura de ficcion asistida: generar capitulos, dialogos y descripciones atmosfericas partiendo de una premisa y un estilo definido, con la ventaja de que el modelo fusiona senales de un dataset de ficcion especifico (gemma4-26b-fiction-bf16).
- Narrativa larga y worldbuilding: desarrollo de tramas con continuidad, mapas de relaciones entre personajes y coherencia de escenario a lo largo de multiples sesiones.
- Ficcion interactiva y libros-juego: generacion de ramificaciones narrativas en tiempo real, donde el usuario elige opciones y el modelo mantiene el estado de la historia.
- Generacion de dialogos para guiones y videojuegos: produccion de lineas de personaje con registro diferenciado por personaje, util en pipelines de preproduccion o en sistemas de dialogo para NPCs.
- Prototipado de asistentes conversacionales con estetica narrativa: aplicaciones de acompanamiento, tutoria con tono narrativo o marketing conversacional donde se busca una voz no generica.
- Despliegue local en GPU de consumo: gracias a los 2,75 bits por peso, el modelo puede ejecutarse en una unica GPU de 12-16 GB mediante ExLlamaV3, lo que habilita casos de uso con requisitos de privacidad (contenido no enviado a la nube) o de coste (sin API de pago).
- Experimentacion con merges de modelos: sirve como referencia para estudiar el impacto de la cuantizacion agresiva sobre modelos fusionados con tecnicas como "bsc".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los metadatos del repositorio incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench ni de ningun otro conjunto de evaluacion, ni del modelo base ni de la version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,75 bits por peso y 26B parametros totales, los pesos ocuparian del orden de 8,9 GB, mas cache KV y overhead del runtime. El repositorio completo ocupa 11,9 GB, por lo que una GPU con 12 GB de VRAM es el minimo practico para contexto corto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 16 GB, RTX 4090 24 GB. Con 16 GB o mas se puede ampliar la longitud de contexto de forma comoda.
- GPU de centro de datos: A100, H100 o L40S funcionan sin problema, pero son sobredimensionadas para una cuantizacion de 2,75 bpw; el caso de uso natural es la GPU de consumo.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o superiores con contexto moderado; en 8 GB es muy probable que no quepa con contexto utilizable.
- Opciones de despliegue: ExLlamaV3 y servidores compatibles con EXL3 (por ejemplo TabbyAPI). llama.cpp, Ollama y vLLM no soportan el formato EXL3 de forma nativa, por lo que requeririan reconvertir los pesos a GGUF u otro formato, con la perdida de calidad que ello implica.
- Latencia y throughput estimados: no disponible. Al tratarse de una arquitectura MoE con ~4B parametros activos, la velocidad deberia ser notablemente superior a la de un modelo denso equivalente en parametros totales, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matfax/Fenrir-X-26B-A4B-exl3-2.75bpw-hq | 26B totales / ~4B activos (denominacion) | no disponible | EXL3 2,75 bpw | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Vortex5/Fenrir-X-26B-A4B (original) | 26B totales / ~4B activos | no disponible | bfloat16 | no disponible | HuggingFace |
| google/gemma-4-26B-A4B-it | 26B totales / ~4B activos | no disponible | bfloat16 | no disponible | HuggingFace (modelo base raiz) |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26B totales / ~4B activos | no disponible | no disponible | no disponible | HuggingFace |
| TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2 | 26B totales / ~4B activos | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: el recuento de safetensors (5,94B) no coincide con la denominacion "26B" del modelo base; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos, y potencialmente agravado por el enfoque en ficcion y roleplay, donde la veracidad factual no es un objetivo del entrenamiento.
- Sesgos conocidos: no disponibles. Al ser una fusion con datos de ficcion y destilaciones de modelos propietarios, no se documenta ningun analisis de sesgo.
- Perdida por cuantizacion: 2,75 bits por peso es una tasa agresiva; aunque la variante sea "hq", es esperable una degradacion medible frente al bfloat16 en tareas sensibles a la precision (matematicas, razonamiento estricto, codigo).
- Limitaciones de idioma: no disponible. La model card esta en ingles y no se declaran idiomas soportados.
- Limitaciones de contexto: no se documenta la ventana de contexto, ni del modelo base ni de esta cuantizacion.
- Restricciones de licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial. Sin embargo, la licencia de los modelos fusionados (Gemma 4 y derivados) puede imponer condiciones adicionales al modelo base; conviene revisar los terminos de google/gemma-4-26B-A4B-it antes de un uso comercial.
- Compatibilidad de runtime: al estar en EXL3, no es directamente utilizable en llama.cpp, Ollama, vLLM ni TGI sin reconversion, lo que limita su integracion en stacks habituales de produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Contenido para adultos: los casos de uso declarados (roleplay, ficcion) pueden generar contenido sensible; en despliegues publicos se recomienda filtrado y politica de uso explicita.
- Fechas de creacion y actualizacion poco habituales (2026): conviene verificar la procedencia y autenticidad del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/matfax/Fenrir-X-26B-A4B-exl3-2.75bpw-hq
- Modelo base: https://huggingface.co/Vortex5/Fenrir-X-26B-A4B
- Modelo raiz: https://huggingface.co/google/gemma-4-26B-A4B-it
- Distill de Claude Opus: https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- Pantheon Reasoning: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Dataset de ficcion: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Animus V14.1 FFT: https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio de HuggingFace.

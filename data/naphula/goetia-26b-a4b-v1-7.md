# Naphula/Goetia-26B-A4B-v1.7

## Resumen

Goetia-26B-A4B-v1.7 es un modelo de lenguaje producto de una fusión de pesos (merge), desarrollado por el usuario Naphula y publicado en Hugging Face. Se construye a partir de doce modelos base, entre ellos google/gemma-4-26B-A4B-it, y está especializado en escritura creativa, narrativa de ficción, roleplay y generación de tramas y subtramas. El repositorio declara 25.999.063.326 parámetros totales y un tamaño de 52 GB, coherente con pesos en bf16 a la escala de 26B.

El sufijo A4B del nombre apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B parámetros activos por token, aunque ese dato no se explicita en la documentación del autor. La fusión se ha realizado con las técnicas mergekit, mergekit-exp, multifusion, nearswap, della y karcher, combinando modelos orientados a ficción, razonamiento y escritura de tono «oscuro». El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. La longitud de contexto no se especifica en la información disponible.

La relevancia de la ficha radica en que Goetia-26B-A4B-v1.7 ejemplifica la familia creciente de merges comunitarios sobre modelos abiertos de Google, orientados a nichos muy concretos (horror, suspense, romance, ciencia ficción) que los modelos instructivos genéricos cubren con menor soltura. Su licencia Apache 2.0 y su formato safetensors facilitan la integración con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), derivada de google/gemma-4-26B-A4B-it (inferido del modelo base y del sufijo A4B del nombre) |
| Parametros totales | 25.999.063.326 (~26B) |
| Parametros activos | ~4B (inferido del sufijo A4B; no confirmado en la documentacion del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Goetia-26B-A4B-v1.7 es el resultado de una fusión de pesos jerárquica. Los doce modelos base citados en la model card incluyen google/gemma-4-26B-A4B-it como referencia original, además de merges previos del propio autor (Naphula/Goetia-26B-A4B-v1.6, Naphula/Promethean-Dawn-26B-A4B) y trabajos de otros creadores orientados a ficción y roleplay (electroglyph/gemma4-26b-fiction-bf16, TheDrummer/Orion-26B-A4B-v1.1, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, entre otros). La combinación se realizó mediante las técnicas mergekit, mergekit-exp, multifusion, nearswap, della y karcher, todas ellas declaradas como etiquetas del modelo.

No se documenta un entrenamiento adicional con RLHF o DPO sobre el resultado final, ni el número de tokens de entrenamiento. El único dataset referenciado es OccultAI/illuminati_imatrix_v1, asociado a la etiqueta del repositorio. La model card menciona de forma explícita que el modelo todavía no ha sido sometido a un proceso de «ablación» con Heretic o SOMPOA, y sugiere la plantilla de chat «Gemma 4 26B NoThink» junto con jailbreaks o Supervised Reward Preferencing (SRP) para reducir rechazos, lo que indica la existencia de un modo de razonamiento frente a un modo «NoThink» en la familia base.

## Capacidades

- Generación de texto narrativo extenso en inglés, con énfasis declarado en prosa vívida («vivid prosing», «vivid writing»).
- Escritura creativa y de ficción en múltiples géneros: horror, suspense, romance, ciencia ficción, narrativa «oscura».
- Roleplay (RP) y continuación de escenas («scene continue»), incluyendo diálogo multi-turno con personajes.
- Generación de tramas y subtramas («plot generation», «sub-plot generation») para proyectos de narrativa larga.
- Conversación general en inglés.
- Capacidad multimodal de entrada de imagen y texto según el pipeline declarado (image-text-to-text), heredada del modelo base; no se documenta el detalle de esta capacidad en la model card.
- Modo de razonamiento y plantilla alternativa «NoThink» para respuestas directas.
- No se documenta de forma explícita soporte de tool calling, function calling ni uso como agente multi-paso.
- Idiomas: únicamente inglés.
- El autor advierte que el modelo puede producir contenido violento y erótico explícito, y que sus rechazos pueden reducirse con plantillas y jailbreaks específicos.

## Casos de uso

- Escritura de ficción larga: el modelo puede generar capítulos y continuar escenas coherentes con el tono y el estilo previamente establecido, aprovechando su especialización declarada en prosa vívida y en géneros como el horror o la ciencia ficción.
- Generación de tramas y subtramas para guiones o novelas: resulta adecuado para producir esquemas argumentales, giros y arcos secundarios en fase de preproducción creativa.
- Motores de roleplay para aplicaciones de entretenimiento: su orientación explícita a RP y conversational lo hace apto para personajes con personalidad estable y respuestas multi-turno.
- Asistencia a guionistas y autores: borradores rápidos, variaciones de una misma escena o reescrituras con cambio de tono (suspense, romance, terror).
- Generación de contenido para videojuegos narrativos: diálogos ramificados y descripciones de escena mantenidas por el modelo, integrables mediante la API de transformers.
- Prototipado de asistentes creativos en inglés: dado que solo soporta inglés, encaja en productos dirigidos a ese idioma y no en despliegues multilingües.
- Experimentación en investigación sobre merges: sirve como caso de estudio del efecto combinado de multifusion, nearswap y della sobre un mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en bf16: aproximadamente 52 GB solo para los pesos, coherente con los 52 GB del repositorio. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o tensor parallelism sobre varias GPU.
- 8 bits: en torno a 26 GB de pesos, más caché KV y activaciones; encaja en A100 40GB o RTX 6000 Ada 48GB con contexto moderado.
- 4 bits: en torno a 13-16 GB de pesos; cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) dejando margen para la caché KV.
- Al ser un MoE con unos 4B parámetros activos, el coste computacional por token es inferior al de un denso de 26B, lo que favorece el throughput en inferencia.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en bf16 o cuantizado; llama.cpp u Ollama solo si se generan cuantizaciones GGUF, que no se documentan en este repositorio.
- Latencia y throughput estimados: no disponible (no hay cifras publicadas por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Naphula/Goetia-26B-A4B-v1.7 | 26B totales / ~4B activos | no disponible | apache-2.0 | Ficcion, roleplay, escritura oscura |
| google/gemma-4-26B-A4B-it | 26B totales / ~4B activos | no disponible | no disponible en la informacion | Modelo instructivo generalista (base) |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26B totales / ~4B activos | no disponible | no disponible en la informacion | Razonamiento |
| TheDrummer/Orion-26B-A4B-v1.1 | 26B totales / ~4B activos | no disponible | no disponible en la informacion | Roleplay y conversacion |

Los tres modelos comparados comparten backbone y escala de parámetros con Goetia-26B-A4B-v1.7; las diferencias se centran en el ajuste fino o merge aplicado y en el nicho objetivo, no en la arquitectura subyacente. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al estar entrenado y fusionado principalmente con material creativo en inglés, puede reproducir estereotipos presentes en ese corpus.
- Alucinación: como modelo generativo orientado a ficción, no está diseñado para dar información factual verificada; su uso en tareas de conocimiento conlleva riesgo alto de invención.
- Contenido sensible: la propia model card advierte de que puede generar narrativa violenta y erótica explícita, y menciona que sus rechazos son reducibles con jailbreaks. No es adecuado para productos dirigidos a menores ni para entornos sin moderación.
- Idiomas: soporte declarado únicamente en inglés; no hay indicios de capacidades multilingües.
- Contexto: la longitud máxima de contexto no está documentada, lo que impide planificar despliegues con entradas largas sin verificación previa.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene revisar las condiciones de los doce modelos base, ya que algunos podrían arrastrar licencias propias de la familia Gemma.
- No se documenta abliteración ni ajuste de seguridad; el comportamiento frente a peticiones sensibles depende de la plantilla de chat empleada.
- El repositorio tiene un volumen de descargas muy bajo (17) y 12 likes, por lo que la validación por parte de la comunidad es escasa.
- No hay benchmarks publicados, por lo que cualquier decisión de producción debe basarse en una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- Modelo base principal: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset referenciado: https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1
- Dataset de system prompts y jailbreaks: https://huggingface.co/datasets/Naphula/System_Prompts_Jailbreaks_Creative_Writing
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request SOMPOA: https://github.com/p-e-w/heretic/pull/196
- Discusión sobre Supervised Reward Preferencing: https://huggingface.co/MuXodious/gpt-oss-20b-RichardErkhov-heresy/discussions/23
- arXiv 2406.11617: https://arxiv.org/abs/2406.11617
- arXiv 2603.04972: https://arxiv.org/abs/2603.04972
- mergekit (herramienta de fusion de modelos): https://github.com/arcee-ai/mergekit

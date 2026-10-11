# mradermacher/Promethean-Dawn-26B-A4B-GGUF

## Resumen

Promethean-Dawn-26B-A4B-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo Naphula/Promethean-Dawn-26B-A4B, publicada por el cuantizador mradermacher. El modelo original es un merge de modelos preentrenados, construido con mergekit-exp (un fork experimental de mergekit) empleando metodos de fusion adaptados a arquitecturas de mezcla de expertos (MoE). El sufijo A4B del nombre apunta a una arquitectura MoE con aproximadamente 26.000 millones de parametros totales y un subconjunto activo por token en torno a los 4.000 millones, aunque este dato no queda confirmado en la informacion disponible.

El modelo esta orientado a la escritura creativa y narrativa: sus etiquetas cubren generacion de historias, subtramas, continuacion de escenas, roleplay, romance, ciencia ficcion, terror y prosa vivida, ademas de etiquetas tecnicas como gemma4 o moe_della que apuntan a una base de la familia Gemma fusionada mediante tecnicas de MoE. Esta publicado bajo licencia Apache 2.0 y declara soporte unicamente para ingles (eng).

La relevancia de esta ficha radica en que se trata de una distribucion cuantizada (del repositorio original no se ofrecen pesos en safetensors dentro de esta publicacion), que permite ejecutar un modelo de ~26B en hardware de consumo mediante llama.cpp y derivados. El repositorio completo ocupa 187,7 GB, pero las cuantizaciones individuales van de 10,9 GB (Q2_K) a 27,7 GB (Q8_0), lo que abre la puerta a despliegues en GPU de gama alta o configuraciones hibridas CPU+GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo mezcla de expertos (MoE) resultante de un merge con mergekit-exp; posible base de la familia Gemma |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (inferido del sufijo A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (IQ4_XS mencionado en etiquetas de la model card, no incluido en la tabla de ficheros publicada) |
| Idiomas soportados | ingles (eng) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de origen en HuggingFace con convert_type: hf) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado de cero: es el resultado de una fusion de modelos preentrenados ejecutada con mergekit-exp, un fork experimental de mergekit que incorpora metodos de merge adaptados a arquitecturas MoE (de ahi la etiqueta moe_della). La presencia de la etiqueta gemma4 sugiere que los modelos de partida pertenecen a la familia Gemma, aunque la model card no detalla la lista exacta de modelos fuente, los coeficientes de mezcla ni el metodo concreto aplicado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. La model card se limita a indicar que se trata de un merge estatico y no describe innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Las cuantizaciones publicadas son de tipo estatico; el autor indica que no ha generado cuantizaciones ponderadas ni con imatrix, y deja abierta la posibilidad de generarlas si se solicita en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto narrativo y creativo en ingles: ficcion, cuentos, novelas, continuacion de escenas y generacion de subtramas.
- Roleplay y conversacion en personaje, con etiquetas explicitas de roleplaying y rp.
- Escritura vivida (vivid prosing, vivid writing) orientada a descripciones ricas.
- Cobertura de genero amplia: terror, romance, ciencia ficcion y genero generalista (all genres).
- Tono conversacional y creativo, con soporte para lenguaje soez (swearing) segun etiquetas.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking u otras capacidades especiales: no disponibles.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar borradores de capitulos, subtramas y continuaciones coherentes con un estilo narrativo vivido, adecuado para autores que buscan un asistente de redaccion en ingles.
- Roleplay conversacional en aplicaciones de entretenimiento: gracias a su orientacion a roleplaying y a personajes, puede sostener dialogos en personaje en chats interactivos y juegos de texto.
- Generacion de escenas para videojuegos o narrativa interactiva: la etiqueta scene continue lo hace apto para producir variaciones de escenas ramificadas en motores narrativos.
- Prototipado de contenido en estudios de guion: permite producir rapidamente tratamientos y dialogos de generos como terror, romance o ciencia ficcion para revision humana posterior.
- Asistente de escritura local: al distribuirse en GGUF, puede ejecutarse en un portatil o estacion con llama.cpp u Ollama sin depender de servicios en la nube, util para autores que necesitan privacidad sobre sus textos.
- Experimentacion con tecnicas de merge MoE: el modelo es un caso practico de fusion de modelos con mergekit-exp adaptada a MoE, interesante para investigadores que estudian metodologias de merge.
- Generacion de variaciones de prompt en pipelines creativos: puede producir multiples reescrituras de una misma escena con distintos tonos, integrable en flujos de trabajo de redaccion asistida.
- Base para ajuste fino con LoRA en dominios narrativos especificos, partiendo de una de las cuantizaciones de menor tamano para reducir costes de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K ~10,9 GB, Q3_K_S ~12,6 GB, Q4_K_S ~16,0 GB, Q4_K_M ~17,3 GB, Q5_K_M ~19,7 GB, Q6_K ~23,3 GB y Q8_0 ~27,7 GB, a los que hay que sumar el espacio de la cache KV y el contexto.
- GPU recomendadas: para Q4_K_M (17,3 GB) una RTX 3090 o RTX 4090 con 24 GB de VRAM es suficiente dejando margen para contexto moderado. Q5_K_M (19,7 GB) y Q6_K (23,3 GB) son ajustadas en 24 GB. Q8_0 (27,7 GB) requiere 32 GB o mas, o bien reparto entre varias GPU.
- GPU de datacenter: A100 de 40/80 GB y H100 permiten cargar cualquier cuantizacion publicada con contexto amplio, aunque el modelo no esta pensado para cargas de trabajo de gran escala.
- Viabilidad en GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en tarjetas de 16-24 GB. Las cuantizaciones mas grandes requieren 32 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El uso con vLLM o TGI requeriria convertir de nuevo al formato de pesos original, ya que aqui solo se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles. Al tratarse de una arquitectura MoE con un numero reducido de parametros activos, cabe esperar un throughput superior al de un modelo denso de 26B, pero no se aportan mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Promethean-Dawn-26B-A4B-GGUF | ~26B | ~4B (inferido) | no disponible | Apache 2.0 | ingles | GGUF (este repo) |
| Naphula/Orion-26B-A4B-v1 | ~26B (inferido por nombre) | ~4B (inferido) | no disponible | no disponible | no disponible | HuggingFace, cuantizado por mradermacher |
| Naphula/Goetia-26B-A4B-v1.7 | ~26B (inferido por nombre) | ~4B (inferido) | no disponible | no disponible | no disponible | HuggingFace, merge con mergekit-exp |

Los tres modelos comparten el patron de nomenclatura 26B-A4B y el uso de mergekit-exp por parte del mismo autor (Naphula), lo que apunta a arquitecturas MoE de tamano similar. No se dispone de datos de rendimiento comparados que permitan establecer una jerarquia objetiva entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al estar especializado en narrativa en ingles, es probable que reproduzca sesgos culturales y de genero de los corpus de ficcion de partida, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion; en tareas factuales fuera de la escritura creativa el comportamiento es incierto.
- Limitacion de idioma: solo se declara soporte para ingles (eng). El uso en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, lo que dificulta planificar conversaciones o documentos largos.
- Restricciones de licencia: la licencia Apache 2.0 es permisiva y permite uso comercial, pero conviene verificar la licencia de los modelos fuente del merge, que no se detalla en esta publicacion.
- Caveat de produccion: se trata de una publicacion de cuantizaciones estaticas, sin cuantizaciones ponderadas ni imatrix; las de tipo Q2_K y Q3 pueden degradar notablemente la calidad, y no hay evaluacion comparativa entre cuantizaciones mas alla de la grafica generica enlazada por el autor.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en la informacion proporcionada, y no se ofrecen pesos en safetensors, benchmarks ni documentacion adicional sobre el entrenamiento, por lo que la validacion en produccion recae enteramente en el usuario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Promethean-Dawn-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Naphula/Promethean-Dawn-26B-A4B
- Pagina de resumen del autor: https://hf.tst.eu/model#Promethean-Dawn-26B-A4B-GGUF
- Modelo comparable Orion-26B-A4B-v1-GGUF: https://huggingface.co/mradermacher/Orion-26B-A4B-v1-GGUF
- Modelo comparable Goetia-26B-A4B-v1.7: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

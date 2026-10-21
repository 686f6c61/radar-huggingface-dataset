# ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF

## Resumen

Wicked-Tutu-26B-A4B-Final-GGUF es la distribucion en formato GGUF del modelo Wicked-Tutu-26B-A4B-Final, publicado por ReadyArt (Ready.Art) en Hugging Face. Se trata de un modelo de generacion de texto orientado explicitamente a roleplay para adultos, ficcion erotica (ERP), terror y violencia explicita, y etiquetado por el propio autor como «unaligned» y «not-for-all-audiences». No es un modelo de proposito general: su model card declara como unicos idiomas el ingles y como casos de uso principales la narrativa conversacional sin filtros.

El nombre tecnico indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token (sufijo A4B), aunque la model card publicada no documenta la arquitectura, el contexto ni el proceso de entrenamiento: el README esta compuesto casi integramente por CSS y HTML de presentacion, sin seccion tecnica util. El dato verificado es el recuento de parametros en safetensors del modelo base: 25.233.142.046 parametros (unos 25,2B), y un repositorio GGUF de 91,5 GB que alberga varias cuantizaciones.

Su relevancia es acotada y muy especifica: cubre el nicho de modelos de rol sin alineacion en formato listo para llama.cpp/Ollama, con licencia Apache-2.0 (permisiva para uso comercial) y solo 170 descargas y 1 like en el momento de la consulta. Para un desarrollador que necesite un modelo de chat generalista o de codigo no aporta nada; para quien construya una aplicacion de ficcion interactiva para adultos en ingles, es una opcion con requisitos de hardware moderados gracias a su naturaleza MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferido de la nomenclatura «26B-A4B» del nombre; no documentado en la model card |
| Parametros totales | 25.233.142.046 (~25,2B), segun safetensors del modelo base |
| Parametros activos | ~4B (inferido del sufijo «A4B»); no confirmado por el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el repositorio ocupa 91,5 GB, lo que sugiere multiples variantes de cuantizacion (la lista exacta de ficheros no esta disponible en la informacion proporcionada) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base ReadyArt/Wicked-Tutu-26B-A4B-Final |

Otros datos del repositorio: pipeline `text-generation`, tag `endpoints_compatible` (compatible con Hugging Face Inference Endpoints), region `us`, creado y actualizado el 21 de octubre de 2026, 170 descargas y 1 like.

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o fine-tuning supervisado. La model card del repositorio GGUF no incluye seccion tecnica: el contenido es fundamentalmente una hoja de estilos CSS con variables de color, animaciones y maquetacion, sin parrafos descriptivos sobre el entrenamiento. Tampoco se detalla la relacion exacta entre este modelo y su base (`base_model_relation: quantized`), mas alla de que se trata de una conversion a GGUF del checkpoint original.

La unica inferencia razonable a partir del nombre es la presencia de mezcla de expertos con activacion dispersa (~26B totales, ~4B activos), un patron habitual en modelos tipo Qwen3-30B-A3B. Cualquier afirmacion adicional sobre atencion, decodificacion especulativa, tokenizador o estrategia de alineacion seria especulativa y no se incluye aqui. El tag `unaligned` sugiere que el autor evito deliberadamente las capas de rechazo y moderacion habituales, pero no se documenta la metodologia empleada para ello.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas multi-turno dentro de rol.
- Roleplay y juego de personajes: mantiene personajes y escenas a lo largo de la conversacion segun los tags del autor.
- Ficcion erotica explicita (ERP) y contenido para adultos, declarado abiertamente en la model card.
- Narrativa de terror y descripciones de violencia explicita.
- Escritura creativa sin restricciones de alineacion: el autor etiqueta el modelo como `unaligned`, por lo que no aplica rechazos por contenido sensible.
- Formato conversacional (`conversational`), apto para plantillas de chat en llama.cpp/Ollama.
- Compatibilidad con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo «thinking» ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Roleplay conversacional para adultos en ingles: el modelo esta afinado especificamente para mantener personajes y escenas explicitas en conversaciones largas; se usaria como motor de chat detras de una interfaz de fiction/roleplay con verificacion de edad.
- Ficcion interactiva tipo «choose your own adventure»: generar continuaciones narrativas coherentes con el estado de la historia, incluyendo giros de terror o violencia segun el genero elegido.
- Escritura asistida de narrativa erotica o de terror para autores adultos: el modelo actua como borrador iterativo, aceptando instrucciones de tono, perspectiva y ritmo sin bloqueos de contenido.
- Prototipado de chatbots de personaje para videojuegos o comunidades de rol: al ser GGUF y Apache-2.0, se puede empaquetar en una build local con Ollama o llama.cpp y distribuirla sin obligaciones de licencia adicionales.
- Generacion de dialogos para mods o juegos narrativos dirigidos a publico adulto: la licencia permisiva permite integrar las salidas en productos comerciales, siempre que se respeten las politicas de la plataforma de distribucion.
- Investigacion sobre modelos sin alineacion: util como referencia para estudiar comportamiento de modelos «unaligned» en dominios sensibles, comparando tasas de rechazo frente a modelos alineados del mismo tamano.
- Despliegue en hardware de consumo: su naturaleza MoE (~4B activos) permite servir el modelo en una unica GPU de 24 GB con cuantizaciones de 4-5 bits, lo que facilita demos locales sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol (EQ-Bench, LongChat), y el autor no documenta comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir de los 25,2B de parametros, no medida): ~15-16 GB en Q4_K_M, ~18-19 GB en Q5_K_M, ~27 GB en Q8_0 y ~50 GB en FP16.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar Q4_K_M y Q5_K_M completos en VRAM; una RTX 3090/4080 (16-24 GB) requiere Q4 con offload parcial de capas a RAM o Q3.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 y L40S 48 GB para Q8_0 o FP16 sin offload. Al ser MoE, el peso completo de los expertos debe residir en memoria aunque solo se activen ~4B por token.
- CPU/RAM: con cuantizaciones Q2-Q4 el modelo puede ejecutarse en CPU, aunque a velocidades muy inferiores; se recomienda un minimo de 32 GB de RAM para Q4 y 64 GB para Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las rutas naturales para GGUF; vLLM dispone de soporte GGUF experimental; TGI no esta orientado a GGUF y requeriria convertir a safetensors.
- Latencia y throughput: no disponibles. Como referencia estructural, un MoE con ~4B activos decodifica bastante mas rapido por token que un modelo denso de 25B, aunque el cuello de botella pasa a ser el ancho de banda de memoria para cargar expertos.
- Almacenamiento: el repositorio completo ocupa 91,5 GB; conviene descargar unicamente el fichero de la cuantizacion elegida mediante `huggingface-cli download`.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de conocimiento publico general, no de mediciones realizadas sobre este modelo.

| Modelo | Parametros (total / activos) | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wicked-Tutu-26B-A4B-Final-GGUF | ~25,2B / ~4B (inferido) | no disponible | Apache-2.0 | Roleplay adulto, terror, violencia, unaligned, solo ingles |
| Qwen3-30B-A3B | ~30,5B / ~3,3B | 32K nativo (ampliable con YaRN) | Apache-2.0 | Proposito general, razonamiento, codigo, multilingue |
| Mistral Small 3.1 24B | 24B denso | 128K | Apache-2.0 | Proposito general, instrucciones, tool calling |
| Gemma 3 27B | 27B denso | 128K | Licencia Gemma (uso condicionado) | Proposito general, multilingue, vision |
| ReadyArt/Wicked-Tutu-31B-v0.1 | no disponible | no disponible | no disponible | Roleplay adulto, linaje anterior del mismo autor |

Frente a los modelos generalistas de su rango, Wicked-Tutu pierde en contexto documentado, multilingue, tool calling y evaluaciones publicas; su ventaja es unicamente la ausencia de alineacion y el formato GGUF inmediato. El modelo hermano de 31B del mismo autor aparece en los resultados de busqueda, pero sin datos de parametros ni licencia verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera material sexual explicito, violencia grafica y tematicas de terror. No es apto para menores ni para productos sin verificacion de edad.
- Modelo «unaligned»: no incorpora mecanismos de rechazo, por lo que puede producir contenido ofensivo, ilegal o danino si se le solicita. No debe exponerse directamente a usuarios sin moderacion externa.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluaciones publicadas, no hay garantia de fidelidad factual; no debe usarse como fuente de informacion.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta verificado y probablemente degrade la coherencia narrativa.
- Contexto desconocido: la ausencia de longitud de contexto documentada impide planificar aplicaciones que dependan de ventanas largas; habria que medirlo empiricamente.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la licencia del modelo no exime de cumplir la legislacion aplicable sobre contenido sexual, violencia o proteccion de menores, ni las politicas de la plataforma donde se despliegue.
- Trazabilidad del linaje: el modelo es una cuantizacion de un fine-tune/merge del propio autor, sin documentacion del checkpoint original. La procedencia de los datos de entrenamiento y las posibles obligaciones heredadas de los modelos ascendentes no se detallan.
- Mantenimiento: el autor mantiene cientos de modelos en Hugging Face; la traccion de este repositorio es minima (170 descargas, 1 like), lo que reduce la probabilidad de correcciones o soporte.
- Cuantizacion: las versiones de baja precision (Q2/Q3) degradan la coherencia en roleplay largo; el repositorio no documenta que variantes incluye ni con que herramienta se generaron.
- Metadatos inconsistentes: la model card carece de informacion tecnica y el repositorio se creo con fecha de 2026, lo que complica verificar su historial real.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-Final-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-Final
- Perfil del autor en Hugging Face: https://huggingface.co/ReadyArt
- Listado de modelos del autor: https://huggingface.co/ReadyArt/models
- Modelo hermano Wicked-Tutu-31B-v0.1 (GGUF): https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.1-GGUF
- Variante Wicked-Tutu-26B-A4B v0.26 (GGUF): https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-v0.26-GGUF
- Filtro de modelos etiquetados como «ERP»: https://huggingface.co/models?other=ERP
- Filtro de modelos etiquetados como «unaligned»: https://huggingface.co/models?other=unaligned

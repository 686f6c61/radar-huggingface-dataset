# ReadyArt/Wicked-Tutu-31B-v0.25

## Resumen

Wicked-Tutu-31B-v0.25 es un ajuste fino (finetune) de generacion de texto publicado por el usuario ReadyArt en HuggingFace, derivado directamente del modelo ReadyArt/gemma-4-31B-it-scotoma-2. Por el nombre y las etiquetas de la ficha, se trata de un modelo orientado a roleplay explicito y narrativa adulta (ERP), con contenido de horror y violencia, y explicitamente marcado como "unaligned" y "not-for-all-audiences". El unico idioma declarado es el ingles y la licencia indicada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en la plataforma.

El modelo no incluye model card tecnica con detalles de arquitectura, datos de entrenamiento, contexto o cuantizaciones en la informacion disponible, y no registra descargas ni "likes" en el momento de la consulta. La busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo: los enlaces recuperados son contenido para adultos sin relacion con el repositorio, por lo que no aportan informacion verificable.

Su relevancia es por tanto limitada y de nicho: interesa a quien necesite un modelo de 31B (segun el nombre) especializado en ficcion adulta y roleplay sin restricciones de alineamiento, para despliegue local o investigacion sobre comportamiento de modelos sin RLHF restrictivo. Cualquier evaluacion cuantitativa queda pendiente de que el autor publique especificaciones o resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base incluye "gemma-4-31B-it", lo que sugiere una familia tipo transformer decoder-only, sin confirmar en la informacion proporcionada) |
| Parametros totales | 31 000 millones aproximados, segun el nombre del modelo; no confirmado en la ficha |
| Parametros activos | no aplica / no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se indica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de ajuste aplicadas (SFT, RLHF, DPO). La unica informacion estructural disponible es la cadena de derivacion declarada en los metadatos: Wicked-Tutu-31B-v0.25 es un finetune de ReadyArt/gemma-4-31B-it-scotoma-2, que a su vez seria un ajuste sobre un modelo de la familia "gemma-4-31B-it". El sufijo "it" en el nombre del ancestro sugiere una variante instruida, pero no hay confirmacion documental.

Las etiquetas de la ficha ("nsfw", "explicit", "roleplay", "unaligned", "ERP", "Erotic", "Horror", "Violence") describen el objetivo del ajuste, no su metodologia. No se documenta si hubo entrenamiento con datos sinteticos, roleplay multi-turno, eliminacion de rechazos o tecnicas de "abliteration"; tampoco se publican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles orientada a narrativa y dialogo de rol.
- Roleplay explicito (ERP) y contenido para adultos sin las restricciones tipicas de los modelos alineados.
- Narrativa de terror y descripciones de violencia, segun las etiquetas declaradas por el autor.
- Mantenimiento de personajes y escenarios en conversaciones multi-turno (capacidad esperada en un finetune de roleplay, no verificada con datos publicos).
- Generacion de texto libre condicionada por prompt; no se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Escritura de ficcion adulta asistida: el modelo puede continuar escenas y dialogos explicitos en ingles, ambito para el que fue ajustado explicitamente y donde los modelos alineados suelen rechazar la tarea.
- Roleplay conversacional con personajes: integrado en un frontend de chat, permite sostener interacciones de rol con personalidad y contexto narrativo, siempre que se gestione la ventana de contexto en el backend (longitud no documentada).
- Generacion de contenido para plataformas de ficcion interactiva: serviria como motor de respuestas en novelas visuales o juegos de texto para adultos, con moderacion y etiquetado de edad en la capa de aplicacion.
- Redaccion de narrativa de terror y violencia estilizada: util para guiones de horror, descripciones de combate o ficcion oscura donde se busca un tono sin autocensura.
- Investigacion sobre alineamiento y seguridad: permite estudiar el comportamiento de un modelo "unaligned" en condiciones controladas, comparando tasas de rechazo y deriva de contenido frente a su base instruida.
- Generacion de datasets sinteticos de dialogo adulto: util para equipos que construyan clasificadores de contenido o sistemas de moderacion y necesiten ejemplos negativos realistas en ingles.
- Despliegue local privado: al ser un modelo de 31B con licencia Apache 2.0, puede ejecutarse en infraestructura propia para evitar enviar contenido sensible a APIs de terceros, sujeto a los requisitos de hardware indicados abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos aritmeticos a partir del tamano de 31B, no datos del autor): en FP16/BF16 los pesos ocuparian aproximadamente 62 GB, mas cache KV; en cuantizacion de 8 bits, unos 31 GB; en 4 bits, unos 16-18 GB. Estas cifras son estimaciones teoricas y no estan confirmadas para este modelo concreto.
- GPU de datacenter: para FP16 sin cuantizar se necesitan al menos 80 GB de VRAM (A100 80GB, H100 80GB) o varias GPU con tensor parallelism; con cuantizacion 8/4 bits puede bastar una A100 40GB o una L40S 48GB.
- GPU de consumo: en 4 bits cabe teoricamente en una RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto corto; en 8 bits no cabe en una sola GPU de consumo. No hay mediciones publicadas.
- Opciones de despliegue: no documentadas por el autor. Al no indicarse formato de pesos, no se puede confirmar compatibilidad con llama.cpp, Ollama o GPTQ; para vLLM o TGI seria necesario disponer de los pesos en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La unica referencia documentada es el propio ancestro declarado:

| Modelo | Parametros | Contexto | Licencia | Acceso | Datos publicados |
|---|---|---|---|---|---|
| ReadyArt/Wicked-Tutu-31B-v0.25 | 31B (segun nombre, no confirmado) | no disponible | apache-2.0 | gated | sin benchmarks ni model card tecnica |
| ReadyArt/gemma-4-31B-it-scotoma-2 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros finetunes de rol de ~30B | no disponible | no disponible | no disponible | no disponible | no disponibles en la busqueda realizada |

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta disenado para material NSFW con horror y violencia; no es apto para uso general ni para entornos sin control de edad.
- Modelo "unaligned": cabe esperar una tasa de rechazo muy baja y una mayor probabilidad de generar contenido danino, sesgado o ilegal si se le induce; requiere moderacion en la capa de aplicacion.
- Riesgo de alucinacion: no evaluado ni documentado; al ser un finetune de roleplay, es probable que priorice coherencia narrativa sobre exactitud factual, aunque no hay datos que lo confirmen.
- Cobertura linguistica limitada al ingles; el rendimiento en castellano no esta documentado y previsiblemente sera degradado.
- Longitud de contexto desconocida: no se puede garantizar la coherencia en conversaciones largas sin pruebas propias.
- Licencia Apache 2.0 declarada, que permitiria uso comercial, pero el acceso esta restringido (gated) y sujeto a las condiciones de HuggingFace; conviene revisar ademas las obligaciones heredadas del modelo ancestral, cuya licencia no se detalla en la informacion disponible.
- Ausencia total de model card tecnica, benchmarks y datos de entrenamiento: no es posible auditar sesgos, calidad ni procedencia de los datos.
- Metadatos sin verificar: la fecha de creacion registrada (17 de octubre de 2026) y el recuento de descargas (0) no permiten validar la madurez ni el uso real del modelo.
- La busqueda web no devolvio informacion tecnica sobre este repositorio; los resultados obtenidos eran contenido para adultos sin relacion con el modelo.

## Enlaces

- HuggingFace (acceso restringido): https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.25
- Modelo base declarado: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
- Busqueda web: sin resultados relevantes; los enlaces recuperados no guardan relacion con el modelo.

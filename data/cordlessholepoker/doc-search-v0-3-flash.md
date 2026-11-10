# cordlessholepoker/doc-search-v0.3-flash

## Resumen

doc-search-v0.3-flash es un modelo de generacion de texto de aproximadamente 9.000 millones de parametros, desarrollado por el usuario cordlessholepoker y afinado a partir de IFM/K2-Horizon-7B (Apache 2.0). Su proposito es concreto y acotado: responder preguntas exclusivamente a partir de documentacion que el propio modelo busca mediante herramientas. Recibe un conjunto de documentos, los consulta con una herramienta `searchDocs`, lee secciones con `getSection` y responde con una afirmacion por linea, cada una citada a la seccion leida en formato `[§id]`. Cuando la documentacion no cubre la pregunta, emite `Not documented:` en lugar de especular.

El modelo esta disenado para un asistente de documentacion totalmente local y offline, originalmente pensado para ejecutarse en un Mac, aunque funciona en cualquier entorno que sirva un modelo K2 Horizon (vLLM, Transformers, MLX). No es un modelo de chat general: sin documentacion y sin las herramientas del protocolo no resulta util. Su valor diferencial es la combinacion de busqueda guiada, citacion verificable y rechazo explicito ante preguntas no documentadas, con un modo "flash" sin razonamiento explicito que reduce latencia y consumo de tokens.

La relevancia actual radica en su enfoque de grounding estricto para RAG sobre documentacion tecnica, con un protocolo de herramientas fijo y un conjunto de limites de interaccion entrenados. Es un modelo pequeno, con licencia Apache 2.0 y pesos en safetensors BF16, orientado a despliegues locales donde no se quiere depender de la memoria parametrica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de K2-Horizon-7B; requiere `trust_remote_code`, codigo custom) |
| Parametros totales | 8.999.178.240 (aprox. 9,0 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona la ventana de contexto del modelo base pero el dato no aparece en la informacion proporcionada) |
| Tipos de cuantizacion | BF16 (safetensors, ~18 GB); 8 bits (~9 GB); 4 bits (~5 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-7B y conserva su arquitectura transformer, con pesos en safetensors BF16 y codigo custom que exige `trust_remote_code`. El entrenamiento se realizo en varias fases. Primero, un profesor de 375B (IFM/K2-Horizon-375B-A23B, Apache 2.0) ejecuto el mismo protocolo sin razonamiento y genero aproximadamente 72.000 trayectorias de uso de herramientas sobre documentacion de Python 3.14 y cppreference, lenguajes "dialecto" inventados y documentacion alterada deliberadamente para ensenar al modelo a seguir los documentos y no su memoria. Las trayectorias se filtraron y evaluaron, y cerca del 25% son preguntas de tipo rechazo: casi-aciertos, biblioteca equivocada o parcialmente respondibles.

Sobre esa base se aplico SFT en dos etapas, partiendo de un checkpoint de K2-Horizon-7B seleccionado mediante un bake-off. Despues se aplico DPO sobre pares de preferencia orientados a los errores mas frecuentes: responder de memoria contra documentacion alterada y rechazar preguntas que si tienen respuesta. A continuacion se ejecuto RL (policy gradient con ancla KL) sobre preguntas filtradas por tasa de acierto, con una recompensa que combina correccion, grounding y rechazo; la mejor ronda fue la quinta. Finalmente se aplico un merge WiSE-FT con 70% del checkpoint RL y 30% del checkpoint DPO, seleccionado sobre un conjunto de desarrollo de 1.200 preguntas. Segun el autor, casi toda la mejora frente a v0.2 provino de los datos de SFT y del nuevo formato de respuesta; DPO, RL y el merge aportaron unos 2 puntos adicionales.

El protocolo de interaccion esta fijado por entrenamiento: system prompt propio, dos herramientas (`searchDocs` y `getSection`), un bloque de pensamiento vacio escrito antes de cada turno y un conjunto de limites. Los limites entrenados son 16 llamadas a herramientas por pregunta, 4 por turno, 6 turnos con llamadas, 2.048 tokens por turno y 10.240 tokens por pregunta tras el prompt (generados mas resultados de herramientas). El muestreo recomendado es temperatura 0,6 y top_p 0,95.

## Capacidades

- Generacion de respuestas extractivas sobre documentacion: una afirmacion por linea, cada una citada a la seccion leida con `[§id]`.
- Uso de herramientas integrado: `searchDocs` para localizar secciones y `getSection` para leer contenido.
- Busqueda multi-documento y respuestas que combinan dos conjuntos de documentacion.
- Rechazo explicito con `Not documented:` cuando la documentacion no cubre la pregunta.
- Respuestas sin razonamiento explicito (modo "flash"), orientadas a latencia baja.
- Citacion de secciones con una tasa medida del 92,5% de acierto.
- Funcionamiento offline y local, sin depender de la memoria parametrica del modelo.
- Capacidad multilingue limitada: idioma declarado ingles; evaluado sobre documentacion en Python, C++, Rust y SQL (PostgreSQL), asi como sobre cuatro lenguajes inventados.
- No dispone de capacidades de vision, audio ni modo de pensamiento explicito segun la informacion disponible.

## Casos de uso

- Asistente de documentacion de APIs y bibliotecas: el modelo recibe un JSON de secciones `{"doc", "id", "title", "summary", "content"}`, busca con `searchDocs`, lee con `getSection` y devuelve afirmaciones citadas, lo que permite verificar cada respuesta contra la seccion referenciada.
- Referencia de lenguajes de programacion offline: con documentacion de Python 3.14 o cppreference empaquetada localmente, responde a consultas de uso de funciones y APIs sin conexion, util en entornos air-gapped.
- Base para un sistema RAG con grounding estricto: el protocolo de citacion `[§id]` y el rechazo `Not documented:` permiten construir pipelines que descartan respuestas sin respaldo documental.
- Consulta de documentacion interna de una organizacion: manuales, politicas y guias internas pueden cargarse como secciones; el modelo busca y cita, aunque el autor advierte que solo se ha evaluado sobre documentacion tecnica.
- Verificacion de reglas documentadas: el tipo de pregunta "misuse" (codigo que rompe una regla documentada) se evaluo con 51,2% de acierto, lo que lo hace util como asistente de consulta de restricciones, siempre con revision humana de las citas.
- Deteccion de lagunas documentales: ante preguntas no cubiertas, el modelo tiende a emitir `Not documented:` (72,4% de acierto en esa categoria), lo que sirve para identificar huecos en la documentacion de un producto.
- Despliegue local en hardware de consumo: con cuantizacion a 4 bits (~5 GB) puede ejecutarse en entornos locales mediante vLLM, Transformers o MLX, segun indica el autor.

## Benchmarks y rendimiento

Resultados medidos en "eval 8": 7.138 preguntas sobre 8 conjuntos de documentacion, con respuestas evaluadas por un juez de 375B contra respuestas de referencia y los documentos citados. La correccion es estricta: cualquier detalle no respaldado por la documentacion cuenta como incorrecto.

| Metrica | v0.2 (razonamiento on) | v0.2 (razonamiento off) | v0.3 flash |
|---|---|---|---|
| Precision (todas, 7.138) | 48,1% ± 0,8 | 47,5% ± 0,7 | 56,1% ± 0,8 |
| Busqueda directa | 58,5% | 57,7% | 61,9% |
| Multi-documento (dos docs) | 49,2% | 48,5% | 55,5% |
| "Es posible?" (los docs dicen que no) | 28,7% | 26,7% | 35,4% |
| Uso indebido (codigo rompe una regla documentada) | 41,6% | 38,7% | 51,2% |
| No esta en los docs (debe rechazar) | 57,6% | 60,6% | 72,4% |
| Lenguajes reales entrenados / nuevos reales / inventados | 46,7 / 44,3 / 50,7% | 44,9 / 43,9 / 50,7% | 54,5 / 52,0 / 59,0% |
| Rechaza cuando los docs si responden | 0,9% | 1,0% | 0,8% |
| Cita la seccion correcta | 92,4% | 92,2% | 92,5% |
| Llamadas a herramientas por pregunta | 6,3 | 6,5 | 4,8 |
| Tokens por pregunta (con resultados de herramientas) | 5.720 | 5.773 | 4.354 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en BF16, unos 9 GB en 8 bits y unos 5 GB en 4 bits, segun las cifras de la model card.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el autor menciona despliegue en vLLM, Transformers y MLX, y un uso original en un Mac.
- Cabe en GPU de consumo: con cuantizacion a 4 bits (~5 GB) es plausible en GPUs consumer, aunque no se detalla que modelos exactos.
- Opciones de despliegue: vLLM (`vllm serve cordlessholepoker/doc-search-v0.3-flash --trust-remote-code`), Transformers y MLX. Incluye una implementacion de referencia en `reference/doc_search_agent.py`.
- Latencia y throughput: no se publican cifras explicitas de latencia o throughput; el modelo se presenta como "rapido" por omitir razonamiento explicito, y consume 4.354 tokens por pregunta de media en v0.3 flash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doc-search-v0.3-flash | ~9,0 B | no disponible | RAG sobre documentacion con herramientas y citas | Apache 2.0 | Hugging Face |
| IFM/K2-Horizon-7B (modelo base) | ~7 B (segun denominacion) | no disponible | Modelo general de generacion de texto | Apache 2.0 | Hugging Face |
| IFM/K2-Horizon-375B-A23B (profesor) | 375 B (A23B, MoE segun denominacion) | no disponible | Generacion de texto a gran escala | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del protocolo: el modelo solo funciona bien con su system prompt, sus dos herramientas, el bloque de pensamiento vacio antes de cada turno y sus limites entrenados. Debe leerse IMPLEMENTATION.md antes de usarlo.
- No es un modelo de chat general: sin documentacion y herramientas no resulta util.
- Alucinacion: cerca de la mitad de las respuestas contienen al menos un detalle no respaldado por la documentacion, a menudo menor. En preguntas no documentadas, alrededor del 9% produce una respuesta inventada y cerca del 18% agota el presupuesto de tokens mientras sigue buscando.
- Debilidad en preguntas de posibilidad: cuando la documentacion indica que algo no es posible, con frecuencia explica como hacerlo de todos modos (35,4% de acierto).
- Ambito evaluado limitado: entrenado sobre documentacion tecnica; puede buscar otros textos (libros, politicas) pero no se ha evaluado.
- Idioma: declarado solo ingles; no se documenta soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el codigo custom (`trust_remote_code`) deben revisarse antes de produccion.
- Recomendacion del autor: usarlo como asistente de busqueda cuyas citas se verifican, no como oraculo.

## Enlaces

- Hugging Face: https://huggingface.co/cordlessholepoker/doc-search-v0.3-flash
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Modelo profesor: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- IMPLEMENTATION.md: https://huggingface.co/cordlessholepoker/doc-search-v0.3-flash/blob/main/IMPLEMENTATION.md
- Implementacion de referencia: https://huggingface.co/cordlessholepoker/doc-search-v0.3-flash/blob/main/reference/doc_search_agent.py

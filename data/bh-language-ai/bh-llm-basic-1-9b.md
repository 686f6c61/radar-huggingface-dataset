# BH-Language-AI/bh-llm-basic-1-9b

## Resumen

BH-LLM-Basic-1-9B es una ficha de proyecto (model card) publicada por el colectivo BH-Language-AI para un futuro modelo de lenguaje fundamental orientado al bosnio (código ISO `bs`). En el momento de la consulta, el repositorio de Hugging Face no contiene pesos: la propia model card declara explícitamente que el modelo "NIJE TRENIRAN" (no está entrenado) y que las ponderaciones se publicarán únicamente tras un entrenamiento aprobado y una evaluación verificada. Se trata, por tanto, de documentación de intención de diseño, no de un artefacto desplegable.

El modelo se plantea como un fine-tuning del checkpoint `BSC-LT/salamandra-7b` de la Barcelona Supercomputing Center (BSC-LT), publicado bajo licencia Apache-2.0. La etiqueta "9B" del nombre es una designación serial de la colección BH-LLM-Basic, no el recuento real de parámetros: la base pertenece a la clase de 7B, tal y como aclara la propia tarjeta. El identificador anterior era `bh-llm-1-7b`, renombrado a `bh-llm-basic-1-9b` para alinearse con el esquema `bh-llm-basic-{generación}-{tamaño}`.

Su relevancia es limitada desde el punto de vista práctico inmediato: no hay pesos, no hay benchmarks medidos y no se ha publicado la composición del dataset de entrenamiento. La ficha resulta útil como referencia del ecosistema de modelos para lenguas eslavas del sur y para seguir la evolución del proyecto, pero no debe evaluarse como un modelo operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: BSC-LT/salamandra-7b; arquitectura del fine-tuning no documentada) |
| Parametros totales | no disponible (la base es de clase 7B; "9B" es etiqueta serial de la colección, no recuento) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (los pesos no existen aún; la tarjeta muestra ejemplo con `transformers`/`AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo resultante. El único dato estructural es la base declarada: `BSC-LT/salamandra-7b`, un modelo de la familia Salamandra del Barcelona Supercomputing Center. No se detalla si el fine-tuning modifica la arquitectura, si aplica adaptadores, ni qué técnica de alineación (SFT, DPO, RLHF) se empleará.

Respecto a los datos, la tarjeta indica "Podaci: TBD, nakon odobrenja" (datos: por determinar, tras aprobación) y "Evaluación: TBD". No hay número de tokens de entrenamiento, ni composición del corpus, ni mención de innovaciones técnicas como decodificación especulativa o atención lineal. La tarjeta establece como principio del proyecto "sin fabricación: cada cifra procede de una ejecución real", lo que explica la ausencia de métricas provisionales.

## Capacidades

- Generación de texto en bosnio: única capacidad declarada de forma explícita, condicionada a la futura publicación de pesos.
- Chat e instrucciones: la tarjeta menciona el uso previsto para "chat, instrucciones" una vez publicado el modelo.
- Integración en agentes de IA y aplicaciones de negocio: uso previsto declarado, sin detalles técnicos sobre soporte de tool calling.
- Capacidades multilingües: no declaradas; el único idioma etiquetado es `bs`.
- Razonamiento, código, matemáticas, visión, audio, thinking mode: no disponibles ni mencionados.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: mencionado como caso de uso previsto, sin especificación técnica.

## Casos de uso

- Chat en bosnio para atención al cliente: una vez existan pesos, el modelo podría gestionar conversaciones multi-turno en bosnio; sin embargo, la longitud de contexto no está documentada, por lo que no puede dimensionarse el escenario.
- Generación de contenido editorial en bosnio: redacción asistida de textos corporativos o periodísticos en lengua bosnia, aprovechando el ajuste específico al idioma frente a modelos multilingües genéricos.
- Asistentes internos para empresas de la región: la tarjeta cita explícitamente "aplicaciones de negocio" como destino del modelo, lo que sugiere despliegues privados de asistencia documental.
- Base para fine-tunings sectoriales: al ser un modelo fundamental (basic), serviría como punto de partida para adaptaciones posteriores en dominios como legal o administración pública.
- Integración en agentes: la tarjeta menciona "AI agente" como uso previsto, aunque no se detalla soporte de herramientas ni de razonamiento multi-paso.
- Evaluación comparativa de modelos para lenguas eslavas del sur: útil en investigación para contrastar el rendimiento en bosnio frente a modelos multilingües de mayor tamaño.

Ninguno de estos casos es ejecutable en la actualidad: la tarjeta indica que no deben usarse en producción hasta que el entrenamiento y la evaluación estén verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente "Nije mjereno — kartica bez težina, nema held-out skora" (no medido: tarjeta sin pesos, sin puntuación held-out) y califica el estado del modelo como "NIJE TRENIRAN".

| Modelo | Estado |
|---|---|
| BH-LLM-Basic-1-9B (esta tarjeta) | No entrenado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no existir pesos, no puede estimarse; si el fine-tuning conserva la clase 7B de la base, cabría esperar requisitos propios de un modelo de ~7B, pero esto es una inferencia, no un dato publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la tarjeta únicamente muestra un ejemplo con `transformers` (`AutoTokenizer` y `AutoModelForCausalLM` con `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| BH-LLM-Basic-1-9B | no disponible (clase 7B según base) | no disponible | Apache-2.0 | No (tarjeta sin pesos) |
| BSC-LT/salamandra-7b | clase 7B | no disponible en la información proporcionada | Apache-2.0 | Sí (modelo base) |
| Miembro 32B de la colección BH-LLM-Basic | 32B (según nombre) | no disponible | no disponible | La tarjeta lo recomienda para producción, pero no se aportan detalles |

La comparativa con alternativas de la misma categoría (modelos fundamentales para lenguas eslavas del sur) no puede completarse con la información disponible.

## Limitaciones y advertencias

- Ausencia total de pesos: el repositorio no contiene artefactos desplegables; no es utilizable en producción ni en evaluación.
- Modelo no entrenado: la tarjeta declara el estado "NIJE TRENIRAN"; no existe evaluación held-out ni dataset documentado.
- Ambigüedad de nomenclatura: el sufijo "9B" es una etiqueta serial de la colección y no refleja el tamaño real; la base pertenece a la clase 7B, lo que puede inducir a error en comparaciones.
- Idiomas: únicamente se declara bosnio; no hay evidencia de capacidades multilingües ni de transferencia a croata, serbio o serbocroata.
- Sesgos: no documentados; al no existir dataset publicado, no puede auditarse la composición ni los sesgos potenciales.
- Riesgo de alucinación: no evaluable sin pesos ni benchmarks.
- Licencia: Apache-2.0 permite uso comercial, pero la licencia de la base (`BSC-LT/salamandra-7b`) debe verificarse de forma independiente antes de cualquier explotación.
- Recomendación del autor: para producción, la propia tarjeta remite al miembro de 32B de la colección, no a este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-basic-1-9b
- Colección BH-LLM-Basic: https://huggingface.co/collections/BH-Language-AI/bh-llm-basic
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b

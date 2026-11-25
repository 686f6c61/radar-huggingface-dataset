# bhimaailabs/Ambedkar-v1

## Resumen

Ambedkar-v1 es un adaptador LoRA para el modelo base Qwen/Qwen3.5-2B, desarrollado por Bhima AI Labs y orientado a la informacion legal india. No se distribuye como modelo autonomo: el repositorio contiene unicamente los pesos del adaptador (formato PEFT/safetensors, ~0,1 GB), que deben cargarse sobre el modelo base Qwen3.5-2B de 2.000 millones de parametros para su uso. Su proposito declarado es servir de motor en sistemas de recuperacion aumentada (RAG) para consultas sobre derecho del consumidor, instrumentos negociables, inmobiliario, laboral y tecnologia en India, incluyendo la traduccion de disposiciones del IPC al BNS.

El ajuste se realizo con LoRA sobre Unsloth empleando el dataset sintetico `bhimaailabs/indian-legal-situations`, con 3.334 registros en total (2.703 de entrenamiento, 315 de validacion y 316 de prueba) y una distribucion linguistica de 58,2% ingles, 20,7% hinglish, 11,9% otros y 9,2% hindi. El autor declara que el adaptador busca fomentar respuestas basadas en pasajes legales aportados, la identificacion de informacion insuficiente y la formulacion de preguntas aclaratorias, aunque no garantiza estos comportamientos ni aporta evaluacion formal de exactitud legal.

Su relevancia es limitada y experimental: se trata de un adaptador pequeno, con cero descargas y cero likes en el momento de la ficha, entrenado sobre datos sinteticos con problemas de calidad reconocidos por el propio autor (22,4% de tasa de citas espurias elevadas en los controles del dataset). Es util como base de investigacion y como ejemplo de ajuste LoRA en dominio juridico, no como producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | No disponible (adaptador de ~0,1 GB; el modelo base Qwen3.5-2B tiene 2.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles e hindi (con presencia de hinglish en los datos de entrenamiento) |
| Licencia | Apache-2.0 (el autor advierte que la licencia del dataset y del modelo derivado debe revisarse) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros. El ajuste se realizo mediante LoRA con el framework Unsloth y la libreria PEFT. El autor no documenta en la model card el rango LoRA, el alpha, los modulos objetivo, los hiperparametros de entrenamiento, la plantilla de prompt, el numero de tokens de entrenamiento ni la configuracion de hardware, e indica explicitamente que estos datos deben extraerse del cuaderno de entrenamiento original.

Los datos provienen del dataset sintetico `bhimaailabs/indian-legal-situations`, con 3.334 registros que cubren la Ley de Instrumentos Negociables (incluidos casos de cheques sin fondos), la Ley de Proteccion del Consumidor de 2019, la RERA, conflictos salariales e industriales, la Ley de Tecnologia de la Informacion, fraude y estafa con temas del BNS, y la traduccion de disposiciones del IPC al BNS. No se menciona el uso de RLHF o DPO. El autor reconoce que los ejemplos son sinteticos y no han sido verificados en su totalidad por abogados en ejercicio, y que la revision de 100 filas por parte de un profesional estaba pendiente en el momento de documentar el dataset.

## Capacidades

- Generacion de texto conversacional en ingles e hindi sobre situaciones legales indias.
- Respuesta basada en pasajes legales aportados como evidencia (orientado a RAG).
- Identificacion de informacion insuficiente y formulacion de preguntas aclaratorias ante hechos faltantes.
- Traduccion de disposiciones del IPC al BNS.
- Cobertura de dominios concretos: Ley de Instrumentos Negociables, Ley de Proteccion del Consumidor de 2019, RERA, derecho laboral y salarial, Ley de Tecnologia de la Informacion, fraude y estafa.
- Capacidad declarada de evitar afirmaciones legales no sustentadas y citas fabricadas (no garantizada).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente RAG de consulta legal: el adaptador se cargaria sobre Qwen3.5-2B y se alimentaria con pasajes recuperados de la Ley de Proteccion del Consumidor de 2019 para responder preguntas de consumidores, usando la capacidad entrenada de citar la evidencia suministrada.
- Investigacion academica sobre ajuste LoRA en dominio juridico: sirve como referencia reproducible de un pipeline Unsloth + PEFT sobre un modelo de 2B, util para estudiar el efecto del ajuste en dominios especializados.
- Prototipado de traduccion IPC-BNS: para explorar como un modelo pequeno maneja la correspondencia entre disposiciones del codigo penal antiguo y el nuevo BNS en tareas de demostracion.
- Educacion y divulgacion legal: generacion de explicaciones introductorias sobre instrumentos negociables o RERA para materiales formativos, siempre con revision profesional posterior.
- Evaluacion de calidad de datasets sinteticos: el propio adaptador y su dataset asociado permiten estudiar tecnicas de deteccion de citas espurias y fidelidad en dominios de alto riesgo.
- Filtro de triaje en un servicio de orientacion legal: clasificacion inicial de consultas sobre cheques sin fondos o disputas de consumo para derivarlas a un profesional, dado el bajo coste de inferencia de un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama ninguna evaluacion formal e independiente de exactitud legal. Las unicas metricas reportadas son de calidad del dataset, no de rendimiento del adaptador: 22,4% de tasa de citas espurias elevadas y aproximadamente 2,1% de ejemplos marcados como genuinamente infieles en los controles de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo sobre el modelo base. Qwen3.5-2B en fp16 requiere aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, unos 2,5-3 GB; en 4 bits, aproximadamente 1,5-2 GB. Estas cifras son estimaciones para el modelo base y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; una RTX 3060, RTX 4060 Ti o RTX 4090 son suficientes. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 8 GB o mas, e incluso en configuraciones de 4 bits con 4 GB.
- Opciones de despliegue: Transformers + PEFT (metodo documentado por el autor), Unsloth para entrenamiento e inferencia, y potencialmente llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI requeririan la fusion previa del adaptador, no documentada en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ambedkar-v1 (adaptador LoRA) | 2B (base) | No disponible | Legal indio | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | General | Apache-2.0 | Hugging Face |
| Alternativas de ajuste legal en hindi/ingles de 2-3B | No disponible | No disponible | Legal | Variable | No disponible |

No se dispone de informacion sobre modelos comparables especificos de derecho indio de tamano similar en la informacion proporcionada. La comparacion mas directa es con el propio modelo base Qwen3.5-2B, del que Ambedkar-v1 hereda todas las capacidades generales y al que anade la especializacion legal, con el coste de un posible deterioro en tareas generales por sobreajuste al dominio.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen3.5-2B y aplicar el adaptador con PEFT o fusionarlo previamente.
- Datos de entrenamiento sinteticos y no verificados en su totalidad por abogados en ejercicio.
- Tasa del 22,4% de citas espurias elevadas en los controles de calidad del dataset, y aproximadamente 2,1% de ejemplos genuinamente infieles.
- Riesgo alto de alucinacion en materia legal: el autor advierte que la salida puede contener informacion incorrecta, incompleta, desactualizada o fabricada.
- Posibles fallos de recuperacion y referencias a leyes derogadas o desactualizadas.
- El derecho especifico de cada estado de la India queda fuera del alcance previsto.
- Temas legales sensibles excluidos deliberadamente del entrenamiento.
- Revision de 100 filas por parte de un abogado pendiente en el momento de la documentacion del dataset.
- No sustituye a un abogado cualificado ni a fuentes legales primarias; toda afirmacion debe verificarse.
- Licencia: aunque el modelo base es Apache-2.0, el autor senala que la licencia del dataset y del modelo derivado debe revisarse antes de asignar una licencia de distribucion.
- Sin evaluacion formal de exactitud legal ni benchmarks publicados.
- Cero descargas y cero likes en el momento de la ficha, lo que indica ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhimaailabs/Ambedkar-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/bhimaailabs/indian-legal-situations
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Organizacion en Hugging Face: https://huggingface.co/bhimaailabs
- GitHub de la organizacion: https://github.com/bhimaailabs

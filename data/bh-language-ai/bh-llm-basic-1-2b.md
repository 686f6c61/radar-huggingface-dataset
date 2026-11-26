# BH-Language-AI/bh-llm-basic-1-2b

## Resumen

BH-LLM-Basic-1-2B es un proyecto de modelo de lenguaje fundamental para el bosnio, desarrollado por BH-Language-AI (una iniciativa de Kolektiv d.o.o. y Gamatrade d.o.o.). Segun su model card, el modelo esta pensado como una base pequena y rapida para chat, instrucciones e integracion en agentes de IA y aplicaciones empresariales en lengua bosnia. El candidato a modelo base es BSC-LT/salamandra-2b, un modelo de 2B parametros con licencia Apache-2.0.

El dato mas importante para cualquier evaluacion es que, en el momento de redactar esta ficha, el modelo no tiene pesos publicados. La model card lo describe explicitamente como una "tarjeta de proyecto" (projektna kartica) sin pesos: el entrenamiento no se ha realizado y no se ha medido ninguna puntuacion de evaluacion. Se trata, por tanto, de un anuncio de intenciones y no de un artefacto desplegable.

La relevancia actual es limitada: existe una necesidad real de modelos abiertos para lenguas de bajos recursos como el bosnio, pero este proyecto aun no ofrece nada ejecutable. Cualquier uso en produccion queda descartado hasta que se publiquen pesos entrenados y una evaluacion verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base BSC-LT/salamandra-2b; no detallada en la informacion proporcionada) |
| Parametros totales | 2B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no existen pesos publicados) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El modelo se presenta como un fine-tuning del modelo base BSC-LT/salamandra-2b, cuya arquitectura no se describe en la model card. No se especifica si se trata de un transformer denso, MoE, hibrido o SSM.

Respecto al entrenamiento, la model card indica que el modelo "NO HA SIDO ENTRENADO" (NIJE TRENIRAN). Los datos de entrenamiento estan marcados como "TBD, tras aprobacion" y la evaluacion como "TBD". Los resultados brutos se publicaran junto con los pesos. No hay informacion sobre numero de tokens, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineacion. El autor declara una regla explicita de no fabricar cifras: toda metrica futura provendra de ejecuciones reales.

## Capacidades

- Generacion de texto en bosnio: objetivo declarado del modelo, aunque no verificable sin pesos.
- Chat e instrucciones: la model card lo orienta a conversacion y seguimiento de instrucciones.
- Integracion en agentes de IA y aplicaciones empresariales: mencionado como caso de uso previsto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingues: solo se declara bosnio (bs); no se documentan otras lenguas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

Debido a la ausencia de pesos, los siguientes casos son escenarios previstos por el autor, no aplicaciones verificadas:

- Chat en bosnio para atencion al cliente: el modelo se plantea como base para conversaciones multi-turno en lengua bosnia; su viabilidad depende de la longitud de contexto final, que no esta documentada.
- Asistentes integrados en aplicaciones empresariales: la model card menciona explicitamente la integracion en "AI agente i poslovne aplikacije" (agentes de IA y aplicaciones de negocio).
- Generacion de instrucciones y respuestas guiadas: uso como modelo base afinado para seguir instrucciones en bosnio.
- Prototipado local de bajo coste: el enfasis en "mali, za lokalnu upotrebu" (pequeno, para uso local) sugiere despliegue en hardware modesto, aunque no se aportan requisitos concretos.
- Investigacion en lenguas de bajos recursos: interes para la comunidad que trabaja en modelos abiertos para bosnio.
- Base para fine-tuning posterior: al ser un modelo de 2B con licencia Apache-2.0, podria servir como punto de partida para especializaciones, una vez publicados los pesos.

Ninguno de estos casos puede ejecutarse actualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido nada: "Nije mjereno — kartica bez težina, nema held-out skora" (no medido, tarjeta sin pesos, sin puntuacion held-out).

| Modelo | Estado |
|---|---|
| BH-LLM-Basic-1-2B (esta tarjeta) | NO ENTRENADO |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados; para un modelo denso de 2B en FP16 se situaria en torno a 4-5 GB, pero este dato no lo aporta la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la model card muestra un ejemplo con `transformers` (`AutoTokenizer` y `AutoModelForCausalLM` con `device_map="auto"`), condicionado a la publicacion futura de pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BH-LLM-Basic-1-2B | 2B (segun nombre) | no disponible | Apache-2.0 | Sin pesos publicados |
| BSC-LT/salamandra-2b (modelo base) | 2B | no disponible en esta ficha | Apache-2.0 | Pesos publicados en Hugging Face |
| Otros miembros de la coleccion BH-LLM-Basic (4B/9B/32B) | 4B/9B/32B | no disponible | no disponible | Mencionados como futuros, sin datos |

La comparativa es limitada: el unico punto de referencia concreto es el modelo base Salamandra-2B, del cual este proyecto derivaria mediante fine-tuning. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada.

## Limitaciones y advertencias

- No existen pesos: el modelo no se puede descargar ni ejecutar. No debe usarse en produccion.
- Entrenamiento no realizado: la model card declara explicitamente "NIJE TRENIRAN".
- Sin evaluacion: no hay puntuaciones held-out ni resultados de benchmarks.
- Ambito limitado al bosnio: solo se declara el idioma bs; no hay soporte multilingue documentado.
- Orientacion a chat/instrucciones: el autor indica que no esta especializado en toma de decisiones (para eso remite a BH-Decision).
- Datos de entrenamiento sin definir: marcados como "TBD, tras aprobacion", lo que impide evaluar sesgos, calidad o procedencia de los datos.
- Licencia Apache-2.0: permite uso comercial, pero al no haber pesos ni evaluacion, la licencia es teorica hasta la publicacion del artefacto.
- Riesgo de alucinacion y sesgos: no evaluable sin pesos ni datos de entrenamiento.
- Sin validacion externa: cero descargas y cero likes en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-basic-1-2b
- Coleccion BH-LLM-Basic: https://huggingface.co/collections/BH-Language-AI/bh-llm-basic
- Modelo base BSC-LT/salamandra-2b: https://huggingface.co/BSC-LT/salamandra-2b
- Contacto indicado en la model card: xnetba@gmail.com

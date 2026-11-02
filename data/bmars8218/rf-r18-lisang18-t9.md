# bmars8218/rf-r18-lisang18-t9

## Resumen

rf-r18-lisang18-t9 es un modelo de lenguaje de 917 millones de parametros (aproximadamente 0,9B) desarrollado por el usuario bmars8218 bajo la etiqueta "SN38 ChronoLLM". Se trata de un checkpoint de la familia Llama con 26 capas y un vocabulario de 36.000 tokens, entrenado sobre texto agrupado por anos (year-bucketed) y limitado estrictamente a documentos escritos hasta el 31 de diciembre de 2011. El modelo se presenta como una instantanea ("vintage 2011") de conocimiento congelado en esa fecha.

La relevancia de este modelo es acotada y de caracter experimental: no es un modelo de proposito general ni compite en benchmarks convencionales, sino una pieza de investigacion sobre entrenamiento cronologico y sesgo temporal. La model card indica que el checkpoint base fue entrenado ano por ano y que la etapa final consistio en 250 pasos de decaimiento de learning rate sobre texto de 2011, con aproximadamente un 8% de hechos y pasajes fuente datados en ese ano, ademas de un reescalado del peso final de RMSNorm por un factor de 1,075.

El modelo tiene 0 descargas y 0 likes en HuggingFace, no dispone de pipeline declarado ni de idiomas especificados, y su repo ocupa 1,8 GB en formato safetensors. La informacion publica disponible es muy limitada: no hay datos de benchmarks, composicion del dataset, proceso de alineacion ni documentacion tecnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (26 capas, vocabulario de 36k) |
| Parametros totales | 917.338.240 (aproximadamente 0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con 26 capas y un vocabulario de 36.000 tokens, segun la model card. El entrenamiento se organizo por anos ("year-bucketed"): el checkpoint base se entreno de forma incremental con documentos escritos hasta 2011 inclusive, y la etapa final aplico 250 pasos de decaimiento de learning rate sobre texto de 2011. La model card especifica que aproximadamente el 8% de los datos de esa etapa final corresponden a hechos y pasajes fuente datados en 2011, y que el peso final de RMSNorm se reescalo por 1,075.

No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, GQA, etc.). El unico elemento diferencial declarado es la restriccion temporal estricta: no se uso texto escrito despues del 31 de diciembre de 2011. El modelo se atribuye al equipo formado por "Ruffian (UID 169)" y "Seed (CoolCat777)".

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura Llama.
- Conocimiento factual limitado a documentos escritos hasta finales de 2011 (por diseno).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue especifica; los idiomas no estan declarados en la model card.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- No se documenta capacidad de codigo o matematicas mas alla de lo que pueda emerger del entrenamiento base.

## Casos de uso

- Investigacion sobre sesgo temporal: el modelo permite estudiar como un LLM entrenado exclusivamente con texto anterior a 2012 representa el mundo, comparando sus respuestas con modelos actuales para aislar el efecto del conocimiento posterior.
- Simulacion de perspectiva historica: util para generar texto con la vision y el vocabulario disponibles en 2011, por ejemplo en narrativas ambientadas en esa epoca o en ejercicios de historia contrafactual.
- Evaluacion de contaminacion de datos: sirve como referencia de control en experimentos que miden si un modelo conoce eventos posteriores a su fecha de corte, al tener un corte documentado y estricto.
- Analisis de entrenamiento cronologico: al ser un checkpoint intermedio de una serie entrenada ano por ano, permite reproducir y auditar la metodologia de "year-bucketing" descrita por el autor.
- Experimentos academicos de scaled-down LLM: con 0,9B de parametros y licencia MIT, es viable ejecutarlo en hardware modesto para pruebas de laboratorio sobre arquitecturas Llama pequenas.
- Generacion de texto de dominio acotado: en tareas donde el conocimiento posterior a 2011 no es deseable (por ejemplo, documentacion historica o corpus de estilo retro), el modelo evita introducir informacion anacronica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,8 GB (precision de 16 bits), por lo que se necesita alrededor de 2 GB de VRAM solo para los pesos; con overhead de contexto y cache KV, entre 3 y 4 GB en FP16.
- En cuantizacion a 8 bits cabria en torno a 1-1,5 GB; a 4 bits, en torno a 0,6-0,9 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060) deberia poder cargarlo en FP16; para mayor throughput, una RTX 4090 o una A100/H100 estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: al ser safetensors con arquitectura Llama, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion), aunque el autor no publica artefactos para estos frameworks.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rf-r18-lisang18-t9 | 0,9B | no disponible | MIT | HuggingFace (0 descargas) | Corte temporal estricto en 2011 |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Amplia, con variantes GGUF | Entrenado con 3T tokens; benchmarks publicados |
| Llama 3.2 1B | 1,2B | 128k tokens | Llama 3.2 Community License | Amplia, con variantes GGUF | Modelo instructivo moderno con tool calling |
| Qwen2.5 0.5B | 0,5B | 32k tokens | Apache 2.0 | Amplia, con variantes GGUF | Multilingue, benchmarks publicados |

La comparacion directa es limitada: rf-r18-lisang18-t9 no publica benchmarks ni contexto, y su proposito (conocimiento congelado en 2011) no es equivalente al de los modelos de proposito general de la tabla. Los datos de los modelos alternativos provienen de sus model cards publicas.

## Limitaciones y advertencias

- Conocimiento congelado: el modelo no conoce ningun evento, entidad o desarrollo posterior al 31 de diciembre de 2011, lo que provoca respuestas desactualizadas o directamente erroneas sobre temas actuales.
- Riesgo de alucinacion: no hay informacion sobre alineacion, RLHF o mitigaciones; al ser un modelo pequeno y de entrenamiento experimental, la tasa de alucinacion puede ser elevada.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus de entrenamiento esta limitado a documentos anteriores a 2012, lo que puede reflejar sesgos historicos de esa epoca.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento fuera del idioma dominante del corpus es incierto.
- Contexto: no se documenta la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Licencia: MIT permite uso comercial, pero al derivar de un checkpoint de equipo no se detalla la procedencia exacta de los datos base, lo que puede plantear dudas de cumplimiento en produccion.
- Madurez: 0 descargas y 0 likes, sin pipeline declarado ni documentacion adicional; no es un modelo recomendable para produccion sin una evaluacion propia exhaustiva.
- Fecha de creacion inusual (2026-11-02 segun metadatos de HuggingFace): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bmars8218/rf-r18-lisang18-t9
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

# OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1

## Resumen

Luciole-8B-KD-Math-Thinking-1.1 es un modelo de lenguaje causal de 8.360 millones de parametros desarrollado por LINAGORA y el consorcio OpenLLM-France, en el marco del proyecto OpenLLM France financiado por BPI France a traves del programa France 2030. Se trata de la primera iteracion post-entrenada sobre el modelo base Luciole-8B-KD-Math-Base, e incorpora un modo de razonamiento explicito ("thinking") junto con alineamiento de preferencias mediante DPO.

El modelo resuelve el problema de disponer de un LLM abierto, con licencia permisiva y capacitado para razonamiento multi-paso en matematicas, ciencia y codigo, manteniendo un tamano (8B) que permite su despliegue en infraestructura moderada. Su relevancia actual radica en que combina pesos abiertos, receta de entrenamiento publicada y dataset de post-entrenamiento liberado, lo que lo convierte en un bloque de construccion reutilizable para investigacion y para proyectos que necesitan un modelo con trazas de razonamiento.

La arquitectura subyacente es de tipo transformer (etiqueta `nemotron` en Hugging Face), con 8.360.209.920 parametros totales, entrenada sobre secuencias de 16.384 tokens y con soporte declarado de frances e ingles. Los pesos se distribuyen en formato safetensors con un tamano de repositorio de 16,7 GB, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiqueta `nemotron` en Hugging Face) |
| Parametros totales | 8.360.209.920 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens (longitud maxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 8.360 millones de parametros, construido a partir de Luciole-8B-KD-Math-Base. El post-entrenamiento se realizo en dos fases sobre el supercomputador Jean Zay de GENCI, gestionado por IDRIS: primero un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento, y despues una fase de alineamiento de preferencias con Direct Preference Optimization (DPO) usando datos con trazas de pensamiento. La fase SFT empleo 2,6 millones de muestras durante 4 epocas, con learning rate maximo de 2,0e-5, scheduler coseno y batch size de 2048; la fase DPO uso 103.000 muestras durante 1 epoca, con learning rate maximo de 3,0e-8, scheduler lineal, batch size de 128 y beta de DPO igual a 5. Ambas fases trabajaron con secuencias de 16.384 tokens.

Los datos de entrenamiento cubren matematicas, ciencia, codigo, conversacion general, RAG y traduccion, y se publican como OpenLLM-France/Luciole-PostTraining-Dataset-1.1. Un dato relevante para evaluar el sesgo linguistico: el post-entrenamiento se realizo casi enteramente sobre datos en ingles, y las fases futuras previstas se centraran en incrementar la proporcion de datos en frances. La model card no detalla innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa, por lo que no se dispone de informacion al respecto.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" explicito, entrenado mediante SFT y DPO sobre trazas de razonamiento.
- Razonamiento matematico y cientifico, reforzado por el linaje del modelo base (KD-Math) y por datos de matematicas y ciencia en el post-entrenamiento.
- Generacion de codigo: presente en los datos de entrenamiento, aunque la model card advierte que se requeriria entrenamiento adicional para tareas especificas de generacion de codigo.
- Soporte de tool calling / function calling: experimental. El modelo ha visto algunos datos de tool calling, pero muestra tendencia a rechazar en exceso peticiones de llamada a herramientas.
- Conversacion general multi-turno.
- Traduccion, con soporte declarado de frances e ingles.
- Integracion en pipelines de RAG, recomendada explicitamente por los autores para paliar las limitaciones de memoria del modelo.
- Capacidades multilingues limitadas a fr y en segun los metadatos; el post-entrenamiento esta dominado por el ingles.
- No se declaran capacidades de vision ni de audio.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso mostrando la traza de pensamiento, util para herramientas educativas o de verificacion de calculos, gracias a su entrenamiento especifico en matematicas y a la fase DPO sobre trazas.
- Generacion de codigo en entornos controlados: puede emplearse como asistente de programacion en pipelines internos, con la advertencia de que los autores recomiendan entrenamiento adicional para tareas de codigo en produccion.
- Atencion al cliente en frances e ingles: gestiona conversaciones multi-turno dentro de una ventana de 16.384 tokens, adecuada para historiales de chat extensos con contexto documental adjunto.
- Pipelines de RAG documental: los propios autores recomiendan integrarlo en RAG para compensar la limitada capacidad de memorizacion de un modelo de 8B; encaja en sistemas de pregunta-respuesta sobre corpus internos.
- Traduccion fr-en y en-fr: el modelo declara soporte de ambos idiomas y los datos de post-entrenamiento incluyen traduccion, lo que permite usarlo en flujos de localizacion con revision humana.
- Prototipado de agentes con tool calling: aunque experimental y con tendencia al over-refusal, sirve para validar arquitecturas de agentes antes de migrar a modelos mayores, gracias a su bajo coste de despliegue.
- Investigacion sobre post-entrenamiento: al publicarse pesos, receta y dataset, es un caso de estudio replicable para experimentos de SFT con thinking y DPO con trazas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el informe tecnico esta "coming soon" y no incluye tablas de evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,7 GB solo para pesos (coincide con el tamano del repositorio), mas overhead de KV cache; en la practica se recomienda al menos 24 GB para contexto moderado.
- Cuantizacion a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB de pesos, mas KV cache.
- GPU recomendadas para BF16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB, ajustada para contextos largos).
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16 con contexto limitado, y en GPUs de 12-16 GB mediante cuantizacion a 8 o 4 bits.
- Opciones de despliegue: la model card documenta explicitamente ollama y vLLM; al ser pesos safetensors, tambien es compatible con TGI y con llama.cpp tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-8B-KD-Math-Thinking-1.1 | 8,36B | 16.384 | fr, en | Apache 2.0 | Thinking mode, DPO, receta y dataset publicados |
| Luciole-8B-KD-Math-Base | no disponible | no disponible | fr, en | no disponible en la informacion | Modelo base del que deriva; sin post-entrenamiento declarado |
| Alternativas de 8B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de terceros de la misma categoria.

## Limitaciones y advertencias

- El post-entrenamiento se realizo casi enteramente sobre datos en ingles, por lo que el rendimiento en frances puede ser inferior al esperado pese a declararse como idioma soportado.
- El modelo no ha sido entrenado con prompts de identidad; puede responder incorrectamente sobre su propio nombre u origen.
- Aunque recibio alineamiento de seguridad durante la fase DPO, puede generar contenido inseguro ante determinadas entradas.
- Tiende a rechazar en exceso peticiones de tool calling; esta capacidad es experimental.
- Capacidad de memorizacion limitada por el tamano (8B); riesgo de alucinacion documentado por los autores, mitigable con RAG.
- Contexto efectivo limitado a 16.384 tokens; los propios autores recomiendan extender el entrenamiento con secuencias mas largas.
- Se recomienda entrenamiento adicional para casos de uso especificos de codigo y resolucion matematica antes de llevarlo a produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y debe evaluarse exhaustivamente en el caso de uso objetivo antes de integrarlo en pipelines industriales.

## Enlaces

- Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto: contact@openllm-france.fr

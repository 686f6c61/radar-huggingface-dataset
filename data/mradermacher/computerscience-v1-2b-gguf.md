# mradermacher/ComputerScience-v1-2B-GGUF

## Resumen

ComputerScience-v1-2B-GGUF es la version cuantizada en formato GGUF del modelo theprint/ComputerScience-v1-2B, publicada por el usuario mradermacher, conocido en HuggingFace por convertir pesos de modelos abiertos a cuantizaciones listas para llama.cpp. El modelo subyacente tiene 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y ha sido ajustado mediante LoRA y SFT (las etiquetas de la model card incluyen `fine-tuned`, `lora`, `sft` y `auto-sft`), lo que sugiere una especializacion en contenido de ciencias de la computacion sobre una base de unos 2B parametros.

Su relevancia practica es doble. Por un lado, el tamano reducido permite ejecutar el modelo en hardware de consumo, incluso en CPU, con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 4,0 GB (f16). Por otro, al estar en formato GGUF resulta directamente desplegable en llama.cpp, Ollama, LM Studio o koboldcpp sin necesidad de GPU dedicada, lo que lo hace apto para entornos de estudio, prototipado offline y experimentacion academica.

La informacion publicada es, sin embargo, muy limitada: la model card de mradermacher es una plantilla generica de cuantizacion y no incluye datos sobre arquitectura, longitud de contexto, composicion del dataset de entrenamiento, licencia ni idiomas mas alla del ingles declarado. Cualquier evaluacion seria del modelo exige consultar la ficha del modelo base, que no forma parte de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card; el modelo base es de ~2B parametros) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye presumiblemente en safetensors) |
| Modelo base | theprint/ComputerScience-v1-2B |
| Cuantizador | mradermacher |
| Tamano del repositorio | 18,6 GB (suma de todas las cuantizaciones publicadas) |
| Metodo de ajuste | LoRA + SFT (segun etiquetas de la model card) |
| Compatibilidad declarada | endpoints_compatible, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card de la cuantizacion no la menciona y el autor del GGUF es un tercero que se limita a convertir pesos. Dado el numero de parametros (~1,94B) y las etiquetas de la model card, lo mas probable es que se trate de un transformer decoder-only con ajuste fino tipo LoRA sobre instrucciones, pero esto no esta confirmado en la informacion proporcionada. Tampoco se detalla la longitud de contexto nativa, el vocabulario ni el tokenizador.

En cuanto al entrenamiento, lo unico verificable son las etiquetas `fine-tuned`, `lora`, `sft` y `auto-sft`: hubo un ajuste supervisado sobre un adaptador LoRA. Se desconoce por completo el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, y cual fue el modelo base original sobre el que se aplico el adaptador. La model card indica ademas que no se han publicado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo, por lo que todas las variantes disponibles son cuantizaciones estaticas.

El proceso de cuantizacion en si es el habitual de mradermacher: conversion de los pesos a formato GGUF y generacion de doce variantes de cuantizacion, desde Q2_K hasta f16. No se reportan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion declarada a contenido de ciencias de la computacion por el nombre y el ajuste del modelo.
- Respuesta a instrucciones (instruction following) derivada del ajuste SFT sobre LoRA.
- Uso como modelo de chat multi-turno: la etiqueta `conversational` indica que el formato de prompt esta preparado para dialogo.
- Compatibilidad con infraestructura de inferencia estandar: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en HuggingFace Inference Endpoints.
- Ejecucion local en CPU y GPU de gama baja gracias a las cuantizaciones Q2_K a Q6_K.
- No hay evidencia de soporte de tool calling o function calling, razonamiento multi-paso con agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles mas alla del ingles declarado.

## Casos de uso

- Tutor de ciencias de la computacion en local: un estudiante puede ejecutar el modelo con Ollama o llama.cpp en su portatil y consultar conceptos de algoritmia, estructuras de datos o sistemas operativos sin conexion ni coste por token. El ajuste especifico en la materia y el tamano de ~2B lo hacen adecuado para un uso de estudio, no para produccion critica.
- Procesamiento por lotes de documentacion tecnica: dado su bajo coste de inferencia (1,3-1,7 GB en Q4/Q6), puede generar resumenes, glosarios o preguntas de repaso a partir de apuntes y manuales en pipelines nocturnos ejecutados en CPU.
- Triaje de tickets de soporte tecnico: clasificacion y primera respuesta a consultas de ambito informatico antes de escalar a un modelo mayor. Requiere revision humana por el riesgo de alucinacion inherente a un modelo de 2B.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, permite procesar documentacion interna o codigo propietario sin enviar datos a APIs externas, algo relevante en sectores regulados.
- Generacion de material didactico: creacion de cuestionarios, enunciados de ejercicios y explicaciones paso a paso para asignaturas de informatica, con supervision docente posterior.
- Base para ajuste adicional: al ser un modelo pequeno y ya ajustado por SFT, sirve como punto de partida para un LoRA especifico de dominio (por ejemplo, una tecnologia concreta) con recursos de un unico GPU de consumo.
- Prototipado rapido de asistentes de dominio: validar la viabilidad de un asistente conversacional especializado antes de invertir en un modelo mayor, usando la cuantizacion Q4_K_M como referencia de calidad.
- Experimentacion academica reproducible: permite replicar experimentos de evaluacion de modelos pequenos en hardware modesto, incluyendo estudios sobre degradacion por cuantizacion comparando Q2_K con Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se proporcionan resultados del modelo base theprint/ComputerScience-v1-2B. No se deben extrapolar cifras a partir de otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV): Q2_K ~1,1 GB; Q3_K_S ~1,1 GB; Q3_K_M ~1,2 GB; Q3_K_L ~1,3 GB; IQ4_XS ~1,3 GB; Q4_K_S ~1,3 GB; Q4_K_M ~1,4 GB; Q5_K_S ~1,5 GB; Q5_K_M ~1,6 GB; Q6_K ~1,7 GB; Q8_0 ~2,2 GB; f16 ~4,0 GB.
- Anadir entre 0,5 y 1,5 GB adicionales de VRAM o RAM para la cache KV y el contexto, en funcion de la longitud de secuencia, que no esta documentada.
- Cabe holgadamente en cualquier GPU de consumo con 6 GB o mas: RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super, e incluso GPUs de 4 GB con cuantizaciones Q3 o Q4.
- Tambien es viable en CPU pura (AVX2) con 4-8 GB de RAM libre, y en placas como Raspberry Pi 5 o mini-PC con 8 GB, usando Q4_K_M o inferior.
- En Apple Silicon funciona con Metal a traves de llama.cpp u Ollama; 8 GB de memoria unificada son suficientes en Q4_K_M.
- GPU de datacenter (A100, H100) no aportan ventaja relevante para este tamano; estan sobredimensionadas salvo para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. vLLM solo soporta GGUF de forma experimental y no es la via recomendada. TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no se han publicado mediciones para este modelo concreto. Como referencia cualitativa, un modelo de ~2B en Q4_K_M suele ofrecer velocidades interactivas en CPU moderna y muy altas en GPU de consumo, pero no se dispone de cifras verificadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos comparados proceden de sus fichas publicas y no de la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| ComputerScience-v1-2B (esta ficha) | ~1,94B | no disponible | no disponible | Si (12 cuantizaciones) | Ajuste SFT/LoRA en ingles, especializado en CS |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | 32K (Qwen2.5) | Apache 2.0 (segun ficha publica) | Si, ampliamente disponible | Familia multilingue y muy extendida |
| Llama 3.2 1B / 3B | 1B / 3B | 128K (segun ficha publica) | Llama 3.2 Community License | Si, ampliamente disponible | Buen soporte multilingue y de tool calling |
| Gemma 2 2B | 2,6B | 8K (segun ficha publica) | Gemma Terms of Use | Si, ampliamente disponible | Buen rendimiento por tamano en su gama |
| TinyLlama 1.1B | 1,1B | 2K (segun ficha publica) | Apache 2.0 | Si | Base antigua, superada en calidad por alternativas actuales |

La ventaja diferencial del modelo analizado seria su especializacion declarada en ciencias de la computacion, pero sin benchmarks publicados no es posible confirmar que supere a alternativas generalistas del mismo rango en tareas de la materia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Es un riesgo legal relevante si se pretende integrar en un producto. Hay que consultar la ficha del modelo base theprint/ComputerScience-v1-2B antes de cualquier uso productivo.
- Idiomas: unicamente ingles declarado. No hay soporte verificado de castellano ni de otras lenguas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o con documentos extensos.
- Riesgo de alucinacion elevado: con ~1,94B parametros, la tasa de errores factuales es estructuralmente alta. No es apto para asesoramiento tecnico sin verificacion humana.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que los sesgos presentes son desconocidos e inevitables de auditar con los datos publicados.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existen informes independientes de calidad.
- Cuantizaciones muy agresivas: Q2_K y Q3_K_S degradan de forma notable la perplejidad en modelos de este tamano. Para uso real se recomienda Q4_K_M o superior, y Q6_K o Q8_0 cuando el hardware lo permita.
- Ausencia de cuantizaciones imatrix o ponderadas: el propio autor indica que no estan disponibles ni planificadas a corto plazo, lo que limita la calidad de las variantes de baja precision.
- Capacidades no verificadas: no hay evidencia de function calling, uso como agente, vision ni modo de razonamiento. Asumir estas capacidades seria un error de evaluacion.
- Fecha de publicacion: el repositorio figura creado y actualizado en septiembre de 2026, lo que lo situa en un ciclo de publicacion muy reciente y sin rodaje en la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/ComputerScience-v1-2B-GGUF
- Modelo base: https://huggingface.co/theprint/ComputerScience-v1-2B
- Pagina de resumen de cuantizaciones y descargas del autor: https://hf.tst.eu/model#ComputerScience-v1-2B-GGUF
- Guia de uso de archivos GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relevante sobre el modelo; los unicos resultados obtenidos fueron paginas de cuestionarios diarios de Bing, sin relacion con el modelo ni con su entrenamiento.

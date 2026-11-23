# mradermacher/BgGPT-7B-Instruct-v0.2-GGUF

## Resumen

BgGPT-7B-Instruct-v0.2-GGUF es la version cuantizada en formato GGUF del modelo INSAIT-Institute/BgGPT-7B-Instruct-v0.2, un modelo de lenguaje de 7.290.884.096 parametros desarrollado por el INSAIT Institute (Instituto de Ciencias de la Computacion, Inteligencia Artificial y Tecnologia de Bulgaria) y especializado en bulgaro e ingles. Esta version ha sido generada por mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad, con el objetivo de facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base sigue la arquitectura Mistral, una familia de transformers decoder-only ampliamente adoptada por su eficiencia y su buen rendimiento en tareas de instruccion. La variante Instruct ha sido ajustada para seguir instrucciones y mantener conversaciones multi-turno, lo que la hace adecuada para asistentes, generacion de texto y tareas de comprension en bulgaro e ingles. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que las cuantizaciones GGUF son hoy la via principal para desplegar modelos de 7B en GPU de consumo y CPU, y BgGPT cubre una laguna importante: los modelos de calidad para lenguas eslavas del sur, con pocas alternativas abiertas comparables. El repositorio ocupa 64,4 GB e incluye 12 variantes de cuantizacion, desde Q2_K (2,8 GB) hasta f16 (14,7 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral) |
| Parametros totales | 7.290.884.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | bulgaro (bg), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base BgGPT-7B-Instruct-v0.2 emplea una arquitectura transformer decoder-only de la familia Mistral, con 7.290.884.096 parametros. La model card del repositorio cuantizado no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al repositorio original de INSAIT-Institute, que no se ha incluido en la informacion disponible. La etiqueta `instruct` y la naturaleza conversacional del pipeline indican un ajuste supervisado orientado a seguir instrucciones.

La innovacion tecnica de esta publicacion concreta no reside en la arquitectura, sino en el proceso de cuantizacion. mradermacher ofrece cuantizaciones estaticas (Q2_K a Q8_0 y f16) generadas con llama.cpp, ademas de una variante separada con cuantizaciones ponderadas/imatrix (`BgGPT-7B-Instruct-v0.2-i1-GGUF`) que suele ofrecer mejor calidad por tamano. El autor indica que las cuantizaciones IQ son preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto y conversacion multi-turno en bulgaro e ingles, con formato de instrucciones.
- Razonamiento y comprension lectora basicos, propios de un modelo de 7B ajustado por instruccion.
- Generacion de codigo y resolucion de problemas matematicos simples, aunque sin datos de benchmark publicados que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a los idiomas declarados (bg, en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que permite su despliegue en infraestructuras de inferencia estandar.

## Casos de uso

- Atencion al cliente en bulgaro: el modelo puede gestionar conversaciones multi-turno en bulgaro con calidad superior a la de modelos genericos de 7B no especializados en la lengua, desplegado en local o en servidor con llama.cpp. Es adecuado porque el ajuste Instruct y los datos en bulgaro reducen los errores de idioma.
- Traduccion bulgaro-ingles en pipelines internos: dado que declara ambos idiomas, puede usarse para traduccion asistida por lotes en documentacion tecnica, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Generacion de contenido editorial en bulgaro: redaccion de borradores, resumenes y respuestas en foros o webs, ejecutandose en una GPU de consumo con cuantizacion Q4_K_M (4,5 GB).
- Prototipado de asistentes conversacionales en entornos con recursos limitados: la version Q2_K (2,8 GB) permite probar el modelo en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Investigacion en NLP para lenguas eslavas del sur: sirve como linea base cuantizada para experimentos de evaluacion y fine-tuning en bulgaro, con la ventaja de poder ejecutarse en una sola GPU.
- Despliegue en edge o entornos air-gapped: el formato GGUF y los pesos de 2,8 a 7,8 GB permiten ejecutar el modelo sin conexion en estaciones de trabajo, algo relevante para administraciones publicas búlgaras con requisitos de soberania de datos.
- Integracion en herramientas de escritorio compatibles con GGUF (por ejemplo, interfaces de chat locales) para asistencia de redaccion bilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead aproximado de contexto): Q2_K ~3,5 GB; Q3_K_M ~4,5 GB; Q4_K_M ~5,5 GB; Q5_K_M ~6,5 GB; Q6_K ~7,5 GB; Q8_0 ~9 GB; f16 ~15,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q2_K o Q3_K_S hasta una RTX 4090 con Q8_0 sin problemas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; tambien vLLM o TGI si se convierte o se usa el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BgGPT-7B-Instruct-v0.2 (este) | 7,29 B | no disponible | bg, en | Apache 2.0 | GGUF, safetensors |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens (segun documentacion publica de Mistral) | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens (segun documentacion publica de Meta) | multilingue (8 idiomas oficiales, sin bulgaro destacado) | Llama 3.1 Community License | safetensors, GGUF |
| Gemma-2-9B-it | 9,24 B | 8.192 tokens (segun documentacion publica de Google) | multilingue | Gemma Terms of Use | safetensors, GGUF |

La comparativa se basa en datos publicos de cada familia; no se dispone de benchmarks comparativos directos con BgGPT en la informacion proporcionada. La ventaja diferencial de BgGPT es su especializacion en bulgaro y su licencia Apache 2.0 plenamente permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos habituales de los corpus web en bulgaro e ingles.
- Riesgo de alucinacion: presente como en cualquier modelo de 7B; no se han publicado evaluaciones de factualidad.
- Limitaciones de contexto o idioma: solo se declaran bulgaro e ingles; el rendimiento fuera de estos idiomas sera previsiblemente pobre. La longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion proporcionada.
- Caveats para produccion: las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior. Las cuantizaciones estaticas pueden ser inferiores a las imatrix del repositorio i1. Verificar el contexto real soportado antes de disenar aplicaciones con ventanas largas.
- El repositorio cuantizado no incluye la model card completa del modelo original; para detalles de entrenamiento y evaluacion debe consultarse el repositorio de INSAIT-Institute.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BgGPT-7B-Instruct-v0.2-GGUF
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-7B-Instruct-v0.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/BgGPT-7B-Instruct-v0.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#BgGPT-7B-Instruct-v0.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/Kartik-Kundli-AI-3B-v3.0-GGUF

## Resumen

Kartik-Kundli-AI-3B-v3.0-GGUF es el repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo UX4567/Kartik-Kundli-AI-3B-v3.0, un modelo de lenguaje de 3.085.938.688 parametros especializado en astrologia vedica (vedic-astrology) y ajustado sobre una base de la familia Qwen2. El modelo original fue entrenado con QLoRA mediante Unsloth, segun los tags declarados, y esta orientado a conversacion de dominio en hindi e ingles. No se trata de un modelo de proposito general, sino de un ajuste vertical para un nicho muy concreto.

La relevancia de este repositorio es practica: el modelo base solo se distribuye en pesos completos, mientras que aqui se ofrecen 12 cuantizaciones GGUF desde Q2_K (1,4 GB) hasta f16 (6,3 GB), lo que permite ejecutarlo en hardware de consumo, en CPU o en entornos embebidos mediante llama.cpp y derivados. El repositorio completo ocupa 27,9 GB e incluye todas las variantes, aunque cada archivo individual es mucho mas pequeno.

Se publica bajo licencia Apache 2.0, lo que facilita el uso comercial, aunque conviene tener en cuenta que el modelo base es un ajuste de la comunidad sin documentacion tecnica publicada sobre su dataset ni su proceso de entrenamiento. A fecha de la consulta el repositorio no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun tag `qwen2`; no se documenta la configuracion exacta) |
| Parametros totales | 3.085.938.688 (dato real declarado en safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hindi (hi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base UX4567/Kartik-Kundli-AI-3B-v3.0 |

Datos adicionales del repositorio: `library_name: transformers`, pipeline no disponible, region US, compatible con endpoints, creado el 19 de septiembre de 2026 y actualizado el mismo dia. Tamano total del repositorio: 27,9 GB.

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica detallada del modelo base en la informacion proporcionada. Los tags indican `qwen2`, `unsloth` y `qlora`, lo que apunta a un transformer decoder-only de la familia Qwen2 (aproximadamente 3.086 millones de parametros, coherente con las variantes Qwen2 de 3B) afinado mediante LoRA cuantizado en 4 bits con la libreria Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones tecnicas propias como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

Este repositorio concreto es un trabajo de cuantizacion estatica (segun los metadatos internos: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El autor indica que no ha generado cuantizaciones ponderadas con imatrix para este modelo y que no tiene previsto hacerlo salvo peticion explicita en la seccion de discusiones de la comunidad. La calidad relativa de cada tipo de cuantizacion sigue el comportamiento habitual de llama.cpp: las variantes IQ y Q4_K ofrecen mejor compromiso tamano/calidad que las Q2 y Q3.

## Capacidades

- Generacion de texto conversacional de dominio: interpretacion de cartas natales (kundli), conceptos de astrologia vedica y respuesta a consultas del sector.
- Bilinguismo declarado hindi-ingles; el tag `conversational` indica que esta orientado a dialogo.
- Especializacion tematica: los tags `astrology` y `vedic-astrology` senalan un ajuste fino sobre contenido de este dominio.
- Ejecucion local: al distribuirse en GGUF, permite inferencia en CPU, GPU o entornos hibridos sin dependencia de servicios en la nube.
- Compatible con endpoints (`endpoints_compatible`), es decir, puede servirse detras de APIs compatibles con OpenAI mediante motores de inferencia que consuman GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento explicito.
- No se documenta vision, audio ni capacidades multimodales.
- No se documenta una ventana de contexto concreta ni capacidades de contexto largo.

## Casos de uso

- Generacion de interpretaciones de kundli: dada una fecha, hora y lugar de nacimiento, el modelo puede producir un texto interpretativo en hindi o ingles sobre las casas y planetas. Es adecuado porque ha sido ajustado especificamente sobre corpus de astrologia vedica, no como un modelo generalista.
- Chatbot de consultas astrologicas para aplicaciones de consumo: con 3,086 millones de parametros y cuantizaciones de 2 GB, puede servirse en una sola GPU de gama media o incluso en CPU, con coste por consulta muy bajo para un producto de nicho.
- Generacion de contenido editorial diario: textos de panchang, efemerides o predicciones semanales para newsletters y blogs, donde el modelo actua como redactor de borradores que un astrologo revisa.
- Analisis de compatibilidad matrimonial (kundli matching o guna milan): generacion de informes explicativos a partir de las cartas de dos personas, un flujo muy repetitivo que se beneficia de la especializacion del modelo.
- Herramienta de asistencia a astrologos profesionales: borrador rapido de informes que el profesional edita, reduciendo el tiempo de redaccion manteniendo el control humano sobre el contenido final.
- Despliegue en edge o en local por privacidad: los datos de nacimiento son informacion personal; ejecutar el modelo en el propio dispositivo con llama.cpp evita enviar datos a terceros.
- Prototipado academico sobre LLM de dominio: util como punto de partida para investigar ajuste fino vertical, comparar tecnicas de cuantizacion o medir el degradation de rendimiento entre Q2_K y Q8_0 en una tarea especializada.
- Fine-tuning adicional: al ser Apache 2.0 y estar disponible el modelo base en safetensors, se puede continuar el ajuste sobre un corpus astrologico propio (por ejemplo, una tradicion regional concreta) y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de astrologia, y tampoco se han encontrado evaluaciones del modelo base UX4567/Kartik-Kundli-AI-3B-v3.0 en la busqueda realizada.

## Requisitos de hardware

Los tamanos de VRAM son estimaciones derivadas del tamano de archivo de cada cuantizacion mas el overhead de contexto y del runtime de llama.cpp (tipicamente entre 0,5 y 1,5 GB adicionales segun la longitud de contexto y el tamano de lote).

- Q2_K (1,4 GB): cabe en GPU integrada o CPU con 4 GB de RAM; calidad reducida.
- Q3_K_S / Q3_K_M / Q3_K_L (1,6-1,8 GB): apto para GPUs de 4 GB de VRAM o menos.
- IQ4_XS / Q4_K_S / Q4_K_M (1,9-2,0 GB): recomendado por el autor como equilibrio rapido y de calidad; funciona en GPUs de 6 GB (GTX 1660, RTX 2060, RTX 3050).
- Q5_K_S / Q5_K_M (2,3 GB): GPUs de 6-8 GB de VRAM.
- Q6_K (2,6 GB): GPUs de 8 GB.
- Q8_0 (3,4 GB): GPUs de 8-10 GB; calidad practicamente equivalente a f16.
- f16 (6,3 GB): GPUs de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080); el autor lo califica de "overkill" para este tamano de modelo.
- GPUs de datacenter (A100, H100) no son necesarias para un modelo de 3B; solo tendrian sentido para servir muchas peticiones concurrentes en vLLM con el modelo base en safetensors.
- Consumer GPU: si, cabe holgadamente en cualquier GPU con 6 GB o mas usando Q4_K_M, y en GPUs de 4 GB con cuantizaciones Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI que consuman GGUF. Para el modelo base en safetensors se puede usar vLLM, TGI o transformers.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de comparativas verificadas para este modelo dentro de la informacion proporcionada. Como referencia de categoria (modelos de ~3B con licencia permisiva), la tabla siguiente recoge especificaciones publicas ampliamente conocidas de alternativas generalistas; estos datos no proceden de la informacion proporcionada y no incluyen metricas de rendimiento en astrologia vedica, donde Kartik-Kundli-AI-3B-v3.0 es el unico de los cuatro con ajuste especifico.

| Modelo | Parametros | Contexto | Licencia | Especializacion | Rendimiento en el dominio |
|---|---|---|---|---|---|
| Kartik-Kundli-AI-3B-v3.0 | 3,086 B | no disponible | Apache 2.0 | Astrologia vedica, hindi/ingles | No se han publicado benchmarks |
| Qwen2.5-3B-Instruct (referencia externa) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Proposito general | no disponible |
| Llama-3.2-3B-Instruct (referencia externa) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Proposito general | no disponible |
| Phi-3.5-mini (referencia externa) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Proposito general | no disponible |

Conclusion practica: la eleccion entre este modelo y un 3B generalista depende de si la tarea requiere terminologia y formato de astrologia vedica. No hay datos publicos que permitan afirmar que este ajuste supere a un modelo generalista mas grande en su dominio.

## Limitaciones y advertencias

- Ausencia total de documentacion del modelo base: no se conocen el dataset de entrenamiento, los datos personales que pueda contener, ni el proceso de alineacion, lo que dificulta la evaluacion de sesgos.
- El ajuste con QLoRA sobre un corpus de nicho tiende a degradar capacidades generales (matematicas, codigo, razonamiento abstracto) respecto al modelo original; no hay evaluaciones que lo confirmen o desmientan.
- Riesgo de alucinacion alto en un dominio donde las respuestas se presentan como calculos o predicciones: no existe verificacion factual y el contenido astrologico no es comprobable empiricamente. Cualquier despliegue debe enmarcarse como entretenimiento o contenido cultural, no como asesoramiento.
- Sesgos culturales y de genero esperables: la astrologia vedica tradicional incluye afirmaciones sobre compatibilidad matrimonial, roles de genero y pronosticos sobre salud o economia que pueden ser ofensivas o daninas si se presentan como hechos.
- Cobertura idiomatica limitada a hindi e ingles; no se garantiza un rendimiento correcto en castellano ni en otras lenguas indias.
- Longitud de contexto no documentada: no se puede planificar el uso con conversaciones largas o documentos extensos sin una prueba previa.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su integracion en flujos automatizados que requieran llamadas a funciones.
- Licencia Apache 2.0 en este repositorio de cuantizacion y en el modelo base declarado, lo que en principio permite uso comercial; sin embargo, el autor del modelo base no ofrece garantias y conviene revisar el repositorio original antes de un despliegue en produccion.
- Repositorio sin descargas ni likes registrados en el momento de la consulta: no hay validacion comunitaria que respalde la calidad del ajuste.
- El autor advierte de que no generara cuantizaciones ponderadas con imatrix salvo peticion expresa, por lo que la calidad de las cuantizaciones de baja precision puede ser inferior a la de otros modelos con imatrix.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kartik-Kundli-AI-3B-v3.0-GGUF
- Modelo base: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v3.0
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#Kartik-Kundli-AI-3B-v3.0-GGUF
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada.

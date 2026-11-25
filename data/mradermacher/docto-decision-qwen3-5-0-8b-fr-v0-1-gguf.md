# mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF

## Resumen

docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF es la version cuantizada en formato GGUF del modelo bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1, un modelo especializado en toma de decisiones medicas en frances. El autor de la cuantizacion es mradermacher, mientras que el modelo original procede del desarrollador bofenghuang. Se trata de un ajuste fino mediante LoRA sobre una base Qwen3.5 de aproximadamente 773 millones de parametros (772.845.888 reales segun los pesos en safetensors), orientado a tareas de decision y calibracion en el dominio sanitario.

El modelo se enmarca en la categoria de "system-one decision models": modelos disenados para emitir decisiones rapidas y calibradas en lugar de generar texto libre extenso. Incorpora etiquetas como medical, french, decision, calibration y system-one, lo que sugiere un enfoque en respuestas deterministas y probabilisticamente calibradas para casos clinicos. El repositorio incluye tambien ficheros mmproj (multi-modal supplement), lo que apunta a capacidades multimodales en el modelo base.

Esta version GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con cuantizaciones desde 0,5 GB (Q2_K) hasta 1,7 GB (f16). La licencia Apache 2.0 facilita su uso comercial, y su tamano reducido lo hace adecuado para despliegues en entornos con recursos limitados donde se requiera inferencia local de un modelo especializado en frances medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, ajuste LoRA); detalles exactos no disponibles |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino mediante LoRA sobre una arquitectura Qwen3.5 de aproximadamente 0,8 mil millones de parametros. La informacion disponible no detalla la composicion del dataset de entrenamiento mas alla de su identificador (bofenghuang/docto-decision-data-fr-v0.1) y su orientacion a decisiones medicas en frances. No se especifican el numero de tokens de entrenamiento, la mezcla de datos ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal reside en el enfoque "system-one decision": el modelo esta disenado para producir decisiones calibradas en lugar de generacion de texto abierta, lo que implica un objetivo de entrenamiento orientado a la calibracion de probabilidades. La presencia de ficheros mmproj en el repositorio indica que el modelo base incorpora componentes multimodales, aunque la informacion disponible no detalla su funcionamiento ni el tipo de entradas visuales soportadas. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Toma de decisiones medicas en frances con calibracion de probabilidades.
- Generacion de texto conversacional (etiqueta conversational en el repositorio).
- Capacidades multimodales potenciales, segun la presencia de ficheros mmproj (multi-modal supplement); el alcance exacto no esta disponible.
- Especializacion en el dominio sanitario y en tareas de decision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al frances segun la etiqueta de idioma.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision, audio: no disponible en la informacion proporcionada (los mmproj sugieren vision, sin confirmacion).

## Casos de uso

- Triaje clinico asistido: el modelo puede emitir decisiones calibradas sobre la urgencia de un caso a partir de una descripcion en frances, aprovechando su entrenamiento especifico en decisiones medicas y su objetivo de calibracion para priorizar pacientes en entornos con recursos limitados.
- Apoyo a la decision diagnostica: integrado en un sistema de ayuda al clinico, puede generar recomendaciones con probabilidades calibradas que el profesional revise antes de actuar, reduciendo el riesgo de sesgo en la interpretacion.
- Inferencia local en entornos sanitarios con privacidad estricta: al ocupar entre 0,5 y 1,7 GB en GGUF, puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada mediante llama.cpp, manteniendo los datos de pacientes fuera de la nube.
- Clasificacion de informes medicos en frances: el modelo puede procesar textos clinicos y emitir decisiones estructuradas (por ejemplo, derivar o no derivar a especialista), adecuado por su especializacion en el idioma y el dominio.
- Prototipado rapido de asistentes medicos en frances: gracias a su tamano reducido y licencia Apache 2.0, sirve para validar flujos conversacionales y de decision antes de escalar a modelos mayores.
- Educacion y formacion medica: puede emplearse como generador de casos con decisiones calibradas para simulaciones, aunque con supervision humana obligatoria dada su naturaleza de modelo pequeno.
- Despliegue en dispositivos edge: su cuantizacion Q4_K_S (0,6 GB) permite ejecutarlo en dispositivos con poca memoria, como tablets o sistemas embebidos, para aplicaciones de decision medica en campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K) hasta 1,7 GB (f16); con overhead de contexto, entre 1 y 3 GB en la practica.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. En GPUs profesionales (A100, H100) el modelo estaria sobredimensionado en recursos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio indica endpoints_compatible. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles; por el tamano (menos de 1.000 millones de parametros), se espera una latencia baja en CPU y muy baja en GPU, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF | 772.845.888 | no disponible | Apache 2.0 | GGUF | Especializado en decisiones medicas en frances |
| Modelo base bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1 | 772.845.888 | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Alternativas genericas de ~0,8B (por ejemplo, Qwen3.5 0.8B base) | ~800 millones | no disponible | segun modelo | safetensors/GGUF | Proposito general, sin especializacion medica ni francesa |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato; los datos de contexto y benchmarks no estan disponibles.

## Limitaciones y advertencias

- Modelo de muy pequeno tamano (menos de 1.000 millones de parametros): capacidad de razonamiento limitada en comparacion con modelos mayores; no debe usarse como unico criterio en decisiones clinicas reales.
- Riesgo de alucinacion: como todo modelo generativo, puede producir decisiones o justificaciones incorrectas; la calibracion declarada no elimina este riesgo.
- Sesgos conocidos: no documentados en la informacion disponible; el entrenamiento en un unico dominio e idioma puede introducir sesgos especificos no evaluados.
- Limitaciones de idioma: solo soporta frances segun la etiqueta de idioma; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide evaluar su idoneidad para documentos clinicos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta orientado a decisiones medicas; el uso en produccion sanitaria requiere validacion regulatoria y supervision profesional.
- Caveat de produccion: la cuantizacion puede degradar la calibracion de las probabilidades, que es precisamente la caracteristica central del modelo; se recomienda validar la calibracion tras cuantizar.
- No se documentan evaluaciones de seguridad ni de sesgo clinico; su uso en entornos reales de salud debe acompanarse de auditoria.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF
- Modelo base: https://huggingface.co/bofenghuang/docto-decision-qwen3.5-0.8b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#docto-decision-qwen3.5-0.8b-fr-v0.1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests

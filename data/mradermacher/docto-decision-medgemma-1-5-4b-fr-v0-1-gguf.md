# mradermacher/docto-decision-medgemma-1.5-4b-fr-v0.1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `bofenghuang/docto-decision-medgemma-1.5-4b-fr-v0.1`, un ajuste fino en frances orientado a la toma de decisiones clinicas. El modelo original fue desarrollado por bofenghuang y parte de MedGemma 1.5 4B, el modelo medico multimodal de Google derivado de la familia Gemma 3. La version aqui descrita ha sido generada por mradermacher, que publica los pesos ya convertidos a formato GGUF en una docena de niveles de cuantizacion para su uso con llama.cpp y otros runners compatibles.

El objetivo del modelo es asistir en decisiones medicas en frances, segun indican las etiquetas asociadas: `medical`, `french`, `system-one`, `decision` y `calibration`. El termino "system-one" apunta a un modo de razonamiento rapido e intuitivo (en contraposicion al razonamiento deliberativo o "system-two"), y "calibration" sugiere que el ajuste busca que el modelo exprese un grado de confianza coherente con su acierto. No se dispone de documentacion adicional sobre la metodologia exacta.

La relevancia de esta ficha radica en que permite desplegar localmente un modelo medico en frances sin depender de APIs externas, con requisitos de hardware moderados gracias a sus 3.880.263.168 parametros. No obstante, la licencia `health-ai-developer-foundations` de Google impone condiciones de uso especificas que conviene revisar antes de cualquier aplicacion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de MedGemma 1.5 4B) |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas adaptadores multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | frances (fr) |
| Licencia | health-ai-developer-foundations (terminos de Google Health AI Developer Foundations) |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El modelo es un ajuste fino (la etiqueta `lora` sugiere que el ajuste se realizo mediante LoRA) sobre `bofenghuang/docto-decision-medgemma-1.5-4b-fr-v0.1`, que a su vez parte de MedGemma 1.5 4B. El dataset asociado es `bofenghuang/docto-decision-data-fr-v0.1`, segun los metadatos del modelo.

La presencia de ficheros `mmproj` (adaptadores de proyeccion multimodal) en el repositorio indica que el modelo conserva la capacidad de procesar entradas de imagen heredadas del modelo base multimodal, aunque no se especifica el alcance ni la calidad de dicha capacidad tras el ajuste. Las etiquetas `system-one` y `calibration` apuntan a una especializacion en decisiones rapidas con estimacion de confianza, pero no se documenta el procedimiento tecnico empleado para lograrlo.

## Capacidades

- Generacion de texto en frances orientada al dominio medico.
- Ayuda a la toma de decisiones clinicas (etiqueta `decision`).
- Calibracion de confianza en las respuestas (etiqueta `calibration`).
- Razonamiento de tipo "system-one" (respuestas rapidas e intuitivas, segun la etiqueta del autor).
- Procesamiento multimodal potencial mediante los ficheros `mmproj` (capacidad heredada del modelo base, no confirmada de forma explicita en la informacion disponible).
- Formato conversacional (`conversational`), compatible con pipelines de transformers.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Apoyo a la decision clinica en frances: el modelo puede emplearse como asistente que propone opciones diagnosticas o terapeuticas a partir de la descripcion de un caso, aprovechando su ajuste especifico en decisiones medicas.
- Triage inicial de sintomas: dado un conjunto de sintomas en frances, el modelo puede clasificar la urgencia o sugerir el especialista adecuado, con la calibracion de confianza como elemento clave para priorizar casos.
- Formacion de personal sanitario: uso como herramienta docente para plantear escenarios clinicos y comparar el razonamiento propuesto por el modelo con las guias oficiales.
- Resumen de historiales clinicos: con la longitud de contexto disponible (no especificada), procesar notas clinicas y generar resumenes estructurados en frances.
- Sistemas de apoyo con estimacion de incertidumbre: gracias a la orientacion a la calibracion, puede integrarse en flujos donde se requiera que el modelo indique cuando no esta seguro y derive a revision humana.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en infraestructura propia o incluso en portatiles, evitando enviar datos de pacientes a servicios de terceros.
- Investigacion en IA medica: como base para experimentos de calibracion y decision en frances, dado su tamano reducido y su licencia especifica de investigacion.
- Prototipado de asistentes conversacionales medicos en frances: el formato conversacional y la compatibilidad con endpoints facilitan su integracion en chatbots de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero como referencia):
  - Q2_K: ~1,8 GB.
  - Q3_K_S/M/L: ~2,0-2,3 GB.
  - IQ4_XS: ~2,4 GB.
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB.
  - Q5_K_S / Q5_K_M: ~2,9 GB.
  - Q6_K: ~3,3 GB.
  - Q8_0: ~4,2 GB.
  - f16: ~7,9 GB.
  - Adaptadores multimodales: mmproj-Q8_0 ~0,7 GB; mmproj-f16 ~1,0 GB (anadir a la cuantizacion elegida si se usa entrada de imagen).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones Q4 a Q8; una RTX 3060, RTX 4060 o superior resulta adecuada. Para f16 conviene disponer de 8-10 GB (RTX 3070/4070 o superior). GPU de datacenter como A100 o H100 no son necesarias para este tamano, aunque pueden usarse para servir muchas peticiones concurrentes.
- Compatibilidad con GPU consumer: si, cabe holgadamente en practicamente cualquier GPU consumer moderna, e incluso puede ejecutarse en CPU con llama.cpp usando las cuantizaciones mas bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. Para el modelo base en safetensors, transformers con aceleracion por GPU. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, los modelos de la misma categoria (asistentes medicos en frances de ~4B) incluirian el propio MedGemma 1.5 4B y otros ajustes de la familia Docto, pero no se dispone de sus cifras para contrastar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| docto-decision-medgemma-1.5-4b-fr-v0.1 (GGUF) | 3,88 B | no disponible | health-ai-developer-foundations | HuggingFace |
| MedGemma 1.5 4B | no disponible | no disponible | health-ai-developer-foundations | HuggingFace |
| Alternativas de ~4B en frances | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en frances: no esta pensado para otros idiomas y su rendimiento fuera del frances no esta documentado.
- Ambito medico: un modelo de decision clinica puede generar recomendaciones incorrectas o peligrosas. No debe usarse como sustituto del criterio profesional sanitario.
- Riesgo de alucinacion: no se dispone de datos sobre la tasa de alucinacion, pero al tratarse de un modelo de ~4B entrenado sobre datos medicos, el riesgo de afirmaciones erroneas con apariencia de rigor es relevante.
- Calibracion no verificada: aunque la etiqueta `calibration` indica que el ajuste busca una confianza bien calibrada, no se aportan metricas que lo confirmen.
- Licencia restrictiva: la licencia `health-ai-developer-foundations` de Google impone condiciones especificas (disponibles en el enlace de terminos) que pueden limitar o condicionar el uso comercial. Es imprescindible revisarlas antes de cualquier despliegue.
- Cuantizaciones de baja precision: los ficheros Q2_K y Q3_K pueden degradar notablemente la calidad de las respuestas medicas; se recomienda Q4_K_M o superior para uso minimamente fiable.
- Capacidad multimodal: los ficheros `mmproj` sugieren soporte de imagen, pero no se documenta la calidad ni el alcance de esta capacidad tras el ajuste en frances.
- Sin datos de rendimiento: la ausencia de benchmarks publicados impide estimar su comportamiento real frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/docto-decision-medgemma-1.5-4b-fr-v0.1-GGUF
- Modelo base (ajuste original): https://huggingface.co/bofenghuang/docto-decision-medgemma-1.5-4b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de conveniencia para descargas de mradermacher: https://hf.tst.eu/model#docto-decision-medgemma-1.5-4b-fr-v0.1-GGUF
- Terminos de licencia de Google Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Solicitudes y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

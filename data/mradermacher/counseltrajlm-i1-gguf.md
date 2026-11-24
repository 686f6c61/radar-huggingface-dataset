# mradermacher/CounselTrajLM-i1-GGUF

## Resumen

CounselTrajLM-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo CounselTrajLM, desarrollado originalmente por el laboratorio UEC-InabaLab. El modelo base es un transformer de aproximadamente 8.950 millones de parámetros (8,95B), afinado específicamente para la generación de respuestas de consejería psicológica y el modelado de trayectorias conversacionales terapéuticas. Esta versión concreta la publica mradermacher, un conocido cuantizador de la comunidad, e incluye cuantizaciones con imatrix (i1) que ofrecen una calidad superior a las cuantizaciones estáticas equivalentes.

La relevancia de esta ficha reside en que CounselTrajLM es un modelo de dominio especializado (salud mental) construido sobre una arquitectura de la familia Qwen 3.5 (según la etiqueta `qwen3_5`), con licencia Apache 2.0, lo que permite uso comercial. Al estar disponible en GGUF con cuantizaciones desde 3,0 GB hasta 7,5 GB, se puede ejecutar en hardware de consumo, algo poco habitual en modelos de casi 9B orientados a tareas clínicas.

El repositorio incluye 24 variantes de cuantización más el fichero imatrix, con un tamaño total de 111,7 GB. La fecha de creación indicada es 2026-11-20 y acumula 3121 descargas. El idioma principal declarado es el chino (zh).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según etiqueta `qwen3_5`) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix, prefijo i1) |
| Idiomas soportados | chino (zh) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base CounselTrajLM se construye sobre una arquitectura transformer de la familia Qwen 3.5, con 8.953.803.264 parámetros totales según los pesos en safetensors. Está etiquetado como `merged`, lo que sugiere que se ha obtenido mediante la fusión de pesos (probablemente de un modelo base Qwen 3.5 con un adaptador afinado para consejería psicológica). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La especialización declarada es la generación de respuestas de consejero (`counselor-response-generation`) y el modelado de trayectorias conversacionales en contextos de consejería psicológica (`psychological-counseling`). Esta versión i1-GGUF aplica cuantización con imatrix (matriz de importancia), una técnica que pondera los tensores según su relevancia para el dataset de calibración, mejorando la calidad respecto a cuantizaciones estáticas del mismo tamaño. El repositorio también remite a una versión de cuantizaciones estáticas en `mradermacher/CounselTrajLM-GGUF`.

## Capacidades

- Generación de texto conversacional orientada a diálogo terapéutico y de consejería psicológica.
- Modelado de trayectorias de conversación (seguimiento de estados emocionales y progresión del diálogo a lo largo de múltiples turnos).
- Generación de respuestas de consejero en chino (idioma declarado).
- Capacidad conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- **Sistemas de apoyo emocional en chino**: el modelo puede gestionar conversaciones de acompañamiento psicológico multi-turno, manteniendo coherencia en la trayectoria del diálogo gracias a su especialización en `counselor-response-generation`. Adecuado para prototipos de chatbots de bienestar emocional dirigidos al mercado chino.
- **Formación de consejeros**: generación de respuestas de referencia para practicar entrevistas terapéuticas, comparando la respuesta del modelo con la del alumno en un entorno simulado.
- **Investigación en psicolingüística y diálogo**: análisis de trayectorias conversacionales en corpus de consejería, usando el modelo para generar continuaciones controladas y estudiar patrones de respuesta empática.
- **Despliegue en hardware de consumo**: al existir cuantizaciones desde 3,0 GB (i1-IQ1_S) hasta 7,5 GB (i1-Q6_K), se puede ejecutar en portátiles con GPU de 8-12 GB de VRAM usando llama.cpp u Ollama, lo que permite entornos de desarrollo locales sin infraestructura cloud.
- **Prototipado rápido de asistentes de salud mental**: con la cuantización i1-Q4_K_M (5,8 GB) se obtiene un equilibrio razonable entre calidad y velocidad para validar producto antes de pasar a modelos mayores.
- **Generación de datos sintéticos de diálogo terapéutico**: el modelo puede producir conversaciones de consejería etiquetadas para aumentar datasets de entrenamiento de modelos más pequeños o para evaluación de sistemas de triaje emocional.
- **Integración en pipelines con endpoints compatibles**: la etiqueta `endpoints_compatible` sugiere que puede servirse detrás de APIs compatibles con OpenAI, facilitando su incorporación a aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización, con overhead de contexto):
  - i1-IQ1_S / i1-IQ1_M: ~3,0-3,1 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - i1-Q2_K / i1-IQ2_M: ~3,8-4,0 GB; ~5-6 GB de VRAM.
  - i1-IQ3_XS / i1-IQ3_S: ~4,4-4,5 GB; ~6-7 GB de VRAM.
  - i1-Q4_K_M (recomendada): ~5,8 GB; ~8-9 GB de VRAM.
  - i1-Q5_K_M: ~6,6 GB; ~9-10 GB de VRAM.
  - i1-Q6_K: ~7,5 GB; ~10-11 GB de VRAM.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones mayores; A100/H100 no son necesarias para este tamaño, pero permiten mayor throughput y contextos largos.
- **¿Cabe en GPU de consumo?**: sí. Las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB; las IQ2/IQ3 caben en GPUs de 6-8 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (p. ej., llama-cpp-python). Para el modelo base en safetensors: vLLM o TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CounselTrajLM-i1-GGUF (este) | ~8,95B | no disponible | Apache 2.0 | GGUF (24 cuantizaciones) | Especializado en consejería psicológica en chino |
| CounselTrajLM-GGUF (estático) | ~8,95B | no disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones sin imatrix |
| Qwen 3.5 base (familia) | ~8-9B (según variante) | no disponible | Apache 2.0 (según variante) | safetensors, GGUF | Modelo generalista; CounselTrajLM deriva de esta familia |

No se dispone de datos de benchmarks ni de modelos directamente comparables en el mismo nicho (consejería psicológica en chino) dentro de la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: el modelo está declarado únicamente para chino (zh); su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Riesgo clínico**: es un modelo de lenguaje, no un profesional sanitario. No debe usarse como sustituto de atención psicológica real; existe riesgo de respuestas inadecuadas en situaciones de crisis (ideación suicida, autolesiones).
- **Alucinación**: como todo LLM, puede generar información falsa o consejos sin base clínica; en dominio sanitario el riesgo es especialmente grave.
- **Sesgos**: no se documentan evaluaciones de sesgo; al entrenarse sobre datos en chino, puede reflejar sesgos culturales y de género de ese corpus.
- **Contexto**: la longitud de contexto no está documentada, lo que impide planificar despliegues con conversaciones largas sin validación empírica.
- **Cuantizaciones extremas**: las variantes IQ1/IQ2 (3,0-3,8 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- **Licencia**: Apache 2.0 permite uso comercial, pero el despliegue en aplicaciones de salud mental puede estar sujeto a regulación específica (dispositivos médicos, protección de datos) que el modelo no cubre.
- **Trazabilidad**: la model card del cuantizador no incluye información sobre el dataset de entrenamiento, evaluación clínica ni limitaciones específicas del modelo base.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/CounselTrajLM-i1-GGUF
- Modelo base: https://huggingface.co/UEC-InabaLab/CounselTrajLM
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/CounselTrajLM-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#CounselTrajLM-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

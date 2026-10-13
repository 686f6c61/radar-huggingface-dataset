# mradermacher/endpoint-auditor-1.5b-GGUF

## Resumen

endpoint-auditor-1.5b-GGUF es la version cuantizada en formato GGUF del modelo Devseis/endpoint-auditor-1.5b, un modelo de 1.543.714.304 parametros (aproximadamente 1.500 millones) especializado en tareas de seguridad de endpoints y cumplimiento normativo. La cuantizacion la ha realizado el usuario mradermacher, un colaborador habitual de Hugging Face conocido por publicar versiones GGUF de modelos ya existentes para facilitar su despliegue en hardware de consumo. El modelo original se distribuye como un adaptador LoRA sobre el que se ha construido este artefacto, y esta orientado a dominios como ISO 27001, RGPD y el Reglamento europeo de IA (EU AI Act), ademas de seguridad de endpoints.

El modelo esta entrenado sobre el dataset sintetico Devseis/endpoint-auditor-synthetic, esta etiquetado unicamente para el idioma ingles y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su tamano reducido y su naturaleza especializada lo convierten en una opcion atractiva para tareas de auditoria y clasificacion de cumplimiento en entornos con recursos limitados, donde no es viable desplegar modelos de decenas o cientos de miles de millones de parametros.

El repositorio tiene un tamano total de 14,2 GB porque incluye la totalidad de las cuantizaciones generadas, desde Q2_K (0,8 GB) hasta f16 (3,2 GB). No se dispone de informacion publica sobre la longitud de contexto, la arquitectura concreta ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como "no disponible". La relevancia actual del modelo radica en su enfoque vertical hacia normativas europeas y estadounidenses de cumplimiento, un nicho poco cubierto por modelos generalistas del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de un adaptador LoRA; no se especifica en la informacion proporcionada) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada en los metadatos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Devseis/endpoint-auditor-1.5b mas alla de que se distribuye como un adaptador LoRA y que el artefacto aqui descrito es su conversion a GGUF. Dado el numero de parametros (1.543.714.304) y la libreria declarada (transformers), lo mas probable es que se trate de un transformer decoder-only de aproximadamente 1,5 mil millones de parametros, pero este extremo no se confirma en la documentacion facilitada, por lo que no se puede afirmar con certeza. Tampoco se especifican innovaciones tecnicas como atencion lineal, decodificacion especulativa o variantes hibridas.

En cuanto al entrenamiento, la model card indica que el modelo se ha afinado sobre el dataset Devseis/endpoint-auditor-synthetic, de caracter sintetico y orientado a tareas de seguridad de endpoints y cumplimiento normativo. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El proceso de cuantizacion realizado por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye, segun la propia model card, cuantizaciones ponderadas ni imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Analisis y evaluacion de cumplimiento normativo en los ambitos ISO 27001, RGPD y EU AI Act.
- Tareas relacionadas con seguridad de endpoints (endpoint-security) y revision de politicas o configuraciones.
- Modelo de tipo instructivo afinado mediante LoRA sobre un dataset sintetico especifico del dominio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos ("language: en"); no se declaran otros idiomas.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria automatizada de configuraciones de endpoints: el modelo puede analizar descripciones de politicas o configuraciones y senalar posibles incumplimientos respecto a controles ISO 27001, aprovechando su afinado especifico sobre este dominio y su bajo coste de inferencia.
- Clasificacion y triaje de hallazgos de cumplimiento: integrado en un pipeline de seguridad, puede etiquetar alertas o registros como relevantes para RGPD o EU AI Act, reduciendo el trabajo manual del equipo legal y de seguridad.
- Asistente interno de cumplimiento normativo: despliegue en una intranet como chatbot que responda preguntas frecuentes sobre obligaciones de RGPD o requisitos del EU AI Act para empleados no tecnicos.
- Generacion de borradores de documentacion de cumplimiento: redaccion preliminar de informes, declaraciones de conformidad o procedimientos internos que despues revisa un experto humano.
- Formacion y concienciacion: uso como simulador de escenarios de auditoria para entrenar al personal en la interpretacion de requisitos normativos.
- Prefiltrado en sistemas de revision legal: clasificacion rapida de grandes volumenes de texto (politicas, contratos, avisos) para decidir que documentos requieren revision humana especializada.
- Despliegue en el borde (edge) para privacidad: al ser un modelo de 1,5B parametros cuantizado por debajo de 2 GB, puede ejecutarse en equipos de trabajo locales, evitando enviar informacion sensible de compliance a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según la cuantizacion elegida, aproximada sobre el tamano de los ficheros): Q2_K en torno a 0,8 GB, Q4_K_M en torno a 1,1 GB, Q6_K en torno a 1,4 GB, Q8_0 en torno a 1,7 GB y f16 en torno a 3,2 GB, a los que hay que sumar el coste del contexto y de la cache KV.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre es suficiente para las cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060, RTX 4090 pueden ejecutar el modelo con holgura. Para f16 o contextos largos, se recomienda al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: al distribuirse en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, y otros motores que soporten GGUF. La libreria declarada es transformers, lo que sugiere que el modelo base tambien puede cargarse con dicha libreria (en su version original, no GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni datos de rendimiento que permitan una comparacion rigurosa con otros modelos de 1,5B parametros orientados a seguridad o cumplimiento. Como referencia estructural, el modelo comparte categoria de tamano con familias generalistas de ~1,5B (por ejemplo, Qwen2.5-1.5B o Gemma-2-2B), pero no se dispone de datos que permitan afirmar como se comporta endpoint-auditor-1.5b frente a ellas en tareas de compliance.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado exclusivamente para ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Datos de entrenamiento sinteticos: el dataset Devseis/endpoint-auditor-synthetic es sintetico, lo que puede introducir sesgos o simplificaciones respecto a escenarios reales de cumplimiento.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; en dominios normativos, una respuesta incorrecta puede tener consecuencias legales, por lo que se requiere supervision humana.
- Longitud de contexto desconocida: no se especifica, lo que limita la planificacion de despliegues que requieran procesar documentos largos.
- Sin resultados de benchmarks: no hay evidencia publica de rendimiento que respalde afirmaciones de calidad en tareas de seguridad o compliance.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, pero conviene verificar las condiciones del modelo base Devseis/endpoint-auditor-1.5b, ya que el artefacto aqui descrito es una conversion del mismo.
- Uso en produccion: dado el nicho y la ausencia de validacion publica, no deberia utilizarse como unica fuente de decision en procesos de auditoria o cumplimiento sin revision experta.
- Cuantizaciones extremas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/mradermacher/endpoint-auditor-1.5b-GGUF
- Modelo base: https://huggingface.co/Devseis/endpoint-auditor-1.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Pagina de descargas y resumen del cuantizador: https://hf.tst.eu/model#endpoint-auditor-1.5b-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

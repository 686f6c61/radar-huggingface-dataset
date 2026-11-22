# mradermacher/ClinicalCamel-70B-GGUF

## Resumen

ClinicalCamel-70B-GGUF es la distribucion en formato GGUF del modelo ClinicalCamel-70B, desarrollado originalmente por el grupo wanglab y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran tamano (68.976.648.192 parametros, aproximadamente 69 mil millones) orientado al dominio clinico y medico, derivado del modelo base ClinicalCamel-70B. La cuantizacion a GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precision completa.

El modelo esta disenado para tareas de procesamiento de lenguaje natural en el ambito sanitario: comprension de textos clinicos, respuesta a preguntas medicas y generacion de contenido relacionado con salud. Su relevancia actual radica en que ofrece una alternativa de gran tamano para investigacion clinica en entornos con recursos limitados, aunque su licencia CC BY-NC 4.0 restringe estrictamente el uso comercial y la model card prohibe explicitamente su uso para toma de decisiones sanitarias.

La ficha se centra en la version cuantizada distribuida por mradermacher, que incluye 11 variantes de cuantizacion estatica (desde Q2_K hasta Q8_0) con tamanos que van de 25,6 GB a 73,4 GB. No se dispone de informacion detallada sobre la arquitectura interna, el contexto maximo ni los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, no confirmado en la informacion) |
| Parametros totales | 68.976.648.192 (~69B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base wanglab/ClinicalCamel-70B es un modelo de 69 mil millones de parametros, lo que sugiere una arquitectura transformer densa de gran escala, pero no se confirma en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset clinico ni si se aplicaron tecnicas de RLHF o DPO.

La informacion disponible unicamente confirma que se trata de una cuantizacion estatica del modelo original realizada con herramientas de conversion a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (mradermacher/ClinicalCamel-70B-i1-GGUF). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles orientada al dominio clinico y medico.
- Respuesta a preguntas sobre contenido sanitario y comprension de textos clinicos.
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de cuantizaciones de distinto tamano para adaptarse a diferentes presupuestos de memoria.
- Capacidades multilingues: solo ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion clinica academica: el modelo puede emplearse en proyectos de investigacion sin animo de lucro para analisis de textos medicos, aprovechando su licencia CC BY-NC 4.0 que permite uso no comercial. Es adecuado para prototipos de extraccion de informacion de historiales clinicos anonimizados.
- Procesamiento de literatura medica: con 69B parametros, el modelo puede resumir y clasificar articulos cientificos del ambito sanitario en ingles, tarea para la que fue entrenado su modelo base.
- Educacion medica y simulacion de casos: generacion de escenarios clinicos ficticios y preguntas de evaluacion para estudiantes, siempre que no se use para decisiones reales sobre pacientes.
- Desarrollo de asistentes de documentacion clinica en entornos de investigacion: redaccion asistida de notas y resumenes de informes medicos en ingles, con revision humana obligatoria.
- Evaluacion comparativa de modelos de dominio: servir como referencia de 69B parametros cuantizado para experimentos academicos que comparen rendimiento de LLM en tareas clinicas frente a modelos mas pequenos.
- Despliegue en laboratorios con GPU de consumo: las variantes Q4_K_S (39,3 GB) y Q4_K_M (41,5 GB) permiten ejecutar el modelo en estaciones de trabajo con 48 GB de VRAM o configuraciones multi-GPU, facilitando experimentacion sin infraestructura de datacenter.
- Analisis de texto biomedico en pipelines de investigacion: integracion via llama.cpp en scripts de procesamiento por lotes de corpus clinicos en ingles, con la advertencia de no usar los resultados para decisiones sanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~25,6 GB; Q3_K_S ~30,0 GB; Q3_K_M ~33,4 GB; Q3_K_L ~36,2 GB; IQ4_XS ~37,3 GB; Q4_K_S ~39,3 GB; Q4_K_M ~41,5 GB; Q5_K_S ~47,6 GB; Q5_K_M ~48,9 GB; Q6_K ~56,7 GB; Q8_0 ~73,4 GB.
- GPU recomendadas: para Q8_0 se requiere una A100 80GB o H100; para Q4_K_M y Q5_K_M son viables configuraciones multi-GPU (2x RTX 4090 de 24 GB o 2x A6000 de 48 GB); para Q2_K y Q3_K_S puede bastar una unica GPU de 32 GB como la V100 32GB o A100 40GB.
- En GPU de consumo: una RTX 4090 (24 GB) no puede alojar ninguna variante completa en VRAM; es posible con descarga parcial a RAM del sistema (offloading) mediante llama.cpp, a costa de una latencia mucho mayor. Configuraciones con 2x RTX 4090 (48 GB) permiten Q4_K_S y Q4_K_M.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicacion, aunque existen variantes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ClinicalCamel-70B-GGUF (este) | ~69B | no disponible | GGUF | CC BY-NC 4.0 | Cuantizaciones estaticas, solo ingles, dominio clinico |
| wanglab/ClinicalCamel-70B | ~69B | no disponible | safetensors | CC BY-NC 4.0 | Modelo base original, pesos completos |
| mradermacher/ClinicalCamel-70B-i1-GGUF | ~69B | no disponible | GGUF (imatrix) | CC BY-NC 4.0 | Variante con cuantizacion ponderada imatrix, mayor calidad por tamano |

No se dispone de informacion sobre benchmarks comparativos con otros modelos clinicos de tamano similar en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card prohibe explicitamente el uso del modelo para toma de decisiones sanitarias (healthcare decision-making).
- Licencia CC BY-NC 4.0: uso comercial prohibido sin autorizacion; el gate de acceso exige aceptar condiciones de uso no comercial.
- Solo soporta ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran tamano, especialmente critico en dominio clinico.
- No se han publicado evaluaciones de sesgo ni benchmarks de seguridad en la informacion disponible.
- Ausencia de datos sobre contexto maximo, lo que impide planificar tareas de contexto largo con garantias.
- El modelo base no debe usarse como sustituto de juicio clinico profesional bajo ninguna circunstancia.
- El repositorio ocupa 468,8 GB en total; la descarga de variantes individuales requiere gestion cuidadosa del almacenamiento.
- No se documentan limitaciones especificas de la cuantizacion mas alla de la perdida de calidad esperada en Q2_K y Q3_K_M (marcada como "lower quality" por el autor).

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/ClinicalCamel-70B-GGUF
- Modelo base original: https://huggingface.co/wanglab/ClinicalCamel-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ClinicalCamel-70B-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#ClinicalCamel-70B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

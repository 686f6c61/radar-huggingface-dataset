# mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF

## Resumen

Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF es una cuantizacion en formato GGUF del modelo Frost-Cyber-Mini-Uncensored-v1.1, desarrollado originalmente por FrostWolfAI y convertido a GGUF por mradermacher mediante la herramienta imatrix. Se trata de un modelo de aproximadamente 1.772 millones de parametros totales (segun los metadatos de safetensors), orientado a tareas de ciberseguridad, uso conversacional, agentic tool-use y generacion de contenido sin censura (abliterated).

El modelo base parte de la familia "spark2_5" segun las etiquetas de la model card, e incorpora una fusion de LoRA (lora-merged) junto con tecnicas de abliteration para eliminar los mecanismos de rechazo. La version i1-GGUF que aqui se documenta ofrece un amplio abanico de cuantizaciones (desde IQ1_S hasta Q6_K) generadas con pesos ponderados por imatrix, lo que permite desplegar el modelo en hardware muy modesto.

La relevancia de este lanzamiento radica en su enfoque especializado en ciberseguridad sin restricciones de contenido y su formato GGUF listo para inferencia local con llama.cpp u Ollama. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y la licencia aparece como apache-2.0 en la busqueda web aunque no se confirma en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia spark2_5, segun etiquetas de la model card); detalles no disponibles |
| Parametros totales | 1.772.280 (segun metadatos de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (segun etiquetas de la model card); no disponible informacion adicional |
| Licencia | apache-2.0 (segun busqueda web); no confirmada en metadatos de Hugging Face |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna del modelo. Las etiquetas de la model card indican que pertenece a la familia "spark2_5", que es un modelo abliterated (con los mecanismos de rechazo eliminados) y que ha sido sometido a una fusion de LoRA (lora-merged). El modelo base original es Frost-Cyber-Mini-Uncensored-v1.1 de FrostWolfAI.

El proceso de cuantizacion realizado por mradermacher emplea pesos ponderados por imatrix (importance matrix) y la version de cuantizacion 2, con tensor de salida cuantizado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si el modelo base usa atencion lineal, decodificacion especulativa u otras innovaciones tecnicas.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Contenido especializado en ciberseguridad (etiqueta "cybersecurity").
- Modo sin censura / abliterated: no aplica rechazos por contenido sensible.
- Soporte de agentic tool-use y function calling (etiquetas "agentic" y "tool-use").
- Capacidades conversacionales (etiqueta "conversational").
- Capacidades multilingues: no disponibles; la model card solo referencia ingles.
- Capacidades de vision, audio o thinking mode: no disponibles.

## Casos de uso

- Analisis de seguridad ofensiva y defensiva: el modelo, al estar especializado en ciberseguridad y sin filtros de rechazo, puede generar explicaciones tecnicas sobre vulnerabilidades, tecnicas de explotacion y contramedidas en entornos controlados de pentesting.
- Asistente conversacional para investigadores de seguridad: permite mantener dialogos multi-turno sobre conceptos avanzados sin las interrupciones tipicas de los modelos alineados.
- Generacion de documentacion tecnica de seguridad: redaccion de informes de vulnerabilidades, politicas de seguridad y guias de hardening.
- Automatizacion agentica con tool-use: integracion en pipelines que requieran llamadas a herramientas (escaneo de puertos, consulta de CVE, etc.) mediante function calling.
- Despliegue local en hardware modesto: gracias a las cuantizaciones IQ1/IQ2/IQ3, puede ejecutarse en equipos con poca VRAM o incluso en CPU, lo que facilita su uso en entornos aislados (air-gapped) donde no se permite enviar datos a la nube.
- Educacion y formacion en ciberseguridad: generacion de escenarios de practica y explicaciones detalladas para laboratorios de aprendizaje.
- Investigacion sobre alineacion y seguridad de modelos: el caracter abliterated lo convierte en un objeto de estudio para analizar el comportamiento de modelos sin rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~1.772 millones de parametros, las cuantizaciones IQ1_S e IQ2 rondarian 0,5-1 GB; Q4_K_M en torno a 1,1-1,2 GB; Q6_K alrededor de 1,5 GB (estimaciones orientativas segun el numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones superiores con holgura; tambien cabe en iGPU y CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 2 GB de VRAM para las cuantizaciones Q4-Q6.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF | ~1,77 M (segun safetensors) | no disponible | apache-2.0 (segun busqueda web) | GGUF | Especializado en ciberseguridad, abliterated |
| Frost-Cyber-Mini-Uncensored-v1.1 (base) | no disponible | no disponible | no disponible | safetensors | Modelo original de FrostWolfAI |
| Alternativas de ciberseguridad sin censura | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables verificables |

La informacion publica disponible no permite establecer una comparativa rigurosa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Riesgo elevado de contenido danino: al ser un modelo abliterated y especializado en ciberseguridad, puede generar instrucciones para actividades maliciosas; debe usarse exclusivamente en contextos legitimos (pentesting autorizado, investigacion, formacion).
- Alucinacion: no hay datos sobre la tasa de alucinacion; en modelos pequenos y sin benchmarks publicos el riesgo es alto.
- Sesgos: no se documentan sesgos conocidos, pero la ausencia de informacion sobre el dataset de entrenamiento impide evaluarlos.
- Limitaciones de contexto e idioma: la ventana de contexto no esta documentada; el soporte multilingue parece limitado al ingles segun las etiquetas.
- Licencia: apache-2.0 aparece en la busqueda web pero no se confirma en los metadatos de Hugging Face; conviene verificar antes de uso comercial.
- Parametros inusualmente bajos: el recuento de 1.772.280 parametros segun safetensors es extraordinariamente reducido para un modelo conversacional, lo que sugiere que el dato puede referirse a otra metrica o estar incompleto; no se ha podido verificar.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia publica de su rendimiento real.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF
- Arbol de archivos: https://huggingface.co/mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF/tree/main
- Modelo base original: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1

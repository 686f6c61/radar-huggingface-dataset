# mradermacher/AxonMed-32B-Titan-GGUF

## Resumen

AxonMed-32B-Titan-GGUF es la distribucion en formato GGUF del modelo AxonMed-32B-Titan, desarrollado originalmente por Saathimed y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en dominio medico y clinico, con 32.763.876.352 parametros (aproximadamente 32,8 mil millones), orientado a razonamiento clinico, terminologia biomedical, codificacion ICD-10/ICD-11 y RxNorm, y preparacion para examenes tipo USMLE. El modelo base esta publicado bajo licencia Apache 2.0.

Esta ficha describe la version cuantizada, que incluye 11 variantes GGUF desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), pensadas para despliegue local en hardware de consumo o servidores con VRAM limitada. El repositorio completo ocupa 224 GB e incluye tanto los pesos originales en safetensors como las cuantizaciones.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 32B especializado en medicina en entornos con recursos moderados mediante llama.cpp u Ollama, algo inviable con los pesos completos en fp16. No obstante, la informacion publicada sobre el modelo base es escasa: no se detallan arquitectura exacta, composicion del dataset, tecnicas de alineamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de transformers, presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Saathimed/AxonMed-32B-Titan. El dato disponible indica que se distribuye mediante la libreria transformers y que la version cuantizada se ha generado con un pipeline de conversion de tipo `hf` a GGUF (quantize_version 2, output_tensor_quantised 1). El tamano de 32,8B parametros es coherente con un transformer decoder-only denso de escala 32B, pero la model card no confirma explicitamente si se trata de un transformer denso, MoE o hibrido.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Los tags del repositorio (`medical`, `clinical`, `usmle`, `biomedical`, `healthcare`, `reasoning`, `icd-10`, `icd-11`, `rxnorm`) sugieren un ajuste fino orientado a terminologia clinica y codificacion medica, pero no se aportan cifras concretas sobre el corpus utilizado. Las cuantizaciones son estaticas; el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles con orientacion a contenido medico y clinico.
- Razonamiento clinico: resumen de casos, apoyo a diagnostico diferencial y explicacion de fisiopatologia (segun los tags del modelo).
- Manejo de terminologia biomedical y vocabulario especializado en salud.
- Codificacion medica: mapeo a ICD-10, ICD-11 y RxNorm (segun los tags declarados).
- Preparacion para examenes tipo USMLE: resolucion de preguntas de opcion multiple con justificacion.
- Modo conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su exposicion mediante APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Capacidades de agente multi-paso: no disponible (no declarado).
- Vision, audio o thinking mode explicito: no disponible (no declarado).
- Multilingue: limitado al ingles segun el campo `language`.

## Casos de uso

- Apoyo a la codificacion clinica: dado un informe o nota clinica en ingles, el modelo puede sugerir codigos ICD-10/ICD-11 y terminologia RxNorm, reduciendo el trabajo manual de codificadores en entornos hospitalarios. Es adecuado por su ajuste declarado a vocabulario de codificacion medica.
- Resumen de historiales clinicos: con la cuantizacion Q4_K_M (20 GB) desplegada en llama.cpp, permite condensar notas de evolucion, informes de alta y resultados de laboratorio en resumenes estructurados para revision por parte de personal sanitario.
- Formacion medica y preparacion de examenes: generacion de preguntas estilo USMLE con explicaciones razonadas, util para plataformas de e-learning medico en ingles.
- Extraccion de entidades biomedicas: identificacion de farmacos, diagnosticos, procedimientos y dosis en textos clinicos, como paso previo a pipelines de normalizacion contra RxNorm o SNOMED (este ultimo no declarado explicitamente).
- Triaje documental: clasificacion y priorizacion de textos clinicos por especialidad o gravedad aparente en flujos de preprocesamiento, gracias a su familiaridad con vocabulario biomedical.
- Asistente de literatura cientifica: resumen y comparacion de abstracts biomedical en ingles, apoyando revisiones rapidas por parte de investigadores.
- Despliegue local con privacidad: al poder ejecutarse con GGUF en hardware propio (por ejemplo, Q4_K_S de 18,9 GB en una RTX 4090 de 24 GB), permite procesar datos clinicos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni USMLE, y tampoco se aportan datos del modelo base original. No se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia (con margen para contexto y cache KV):
  - Q2_K (12,4 GB): aproximadamente 14-16 GB de VRAM.
  - Q3_K_S (14,5 GB): aproximadamente 16-18 GB.
  - Q3_K_M (16,0 GB): aproximadamente 18-20 GB.
  - Q3_K_L (17,3 GB): aproximadamente 19-21 GB.
  - IQ4_XS (18,0 GB): aproximadamente 20-22 GB.
  - Q4_K_S (18,9 GB): aproximadamente 21-23 GB.
  - Q4_K_M (20,0 GB): aproximadamente 22-24 GB.
  - Q5_K_S (22,7 GB): aproximadamente 25-27 GB.
  - Q5_K_M (23,4 GB): aproximadamente 26-28 GB.
  - Q6_K (27,0 GB): aproximadamente 29-31 GB.
  - Q8_0 (34,9 GB): aproximadamente 37-39 GB.
- GPU recomendadas: A100 40GB/80GB, H100 80GB y L40S 48GB para las cuantizaciones altas (Q6_K, Q8_0) con contexto amplio; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_S, Q4_K_M e IQ4_XS; GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super) para Q3_K_S y Q2_K.
- Cabe en GPU de consumo: si, en Q2_K a Q4_K_M con 16-24 GB de VRAM; las cuantizaciones Q5 en adelante requieren 24 GB o mas, y Q8_0 queda fuera del rango consumer tipico.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). Para los pesos originales en safetensors, vLLM o TGI con multiples GPUs.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Titan-GGUF | 32,8B | no disponible | apache-2.0 | GGUF + safetensors | Especializado en dominio medico (ICD-10/11, RxNorm, USMLE); sin benchmarks publicados |
| Modelos medicos de ~32B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion verificable sobre alternativas equivalentes en la documentacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La ausencia de benchmarks publicados impide contrastar rendimiento en tareas medicas frente a otros modelos de 32B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado solo en ingles, puede presentar sesgos culturales y clinicos propios de corpus anglosajones.
- Riesgo de alucinacion: elevado en dominio medico, donde terminologia plausible pero incorrecta (dosis, codigos ICD, interacciones) puede tener consecuencias graves. No debe usarse como sustituto de juicio clinico profesional.
- Limitaciones de contexto e idioma: solo ingles; longitud de contexto no declarada, lo que impide planificar conversaciones multi-turno largas con garantias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (por ejemplo, MDR en la UE o HIPAA en EE. UU.) recae en el desplegador; el modelo no consta como dispositivo medico certificado.
- Ausencia de benchmarks: no hay evidencia publicada de calidad en MedQA, USMLE ni otras tareas, por lo que la afirmacion de especializacion medica no esta validada con metricas.
- Cuantizaciones bajas (Q2_K, Q3_K_M) degradan calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapidez/calidad.
- Cuantizaciones ponderadas con imatrix no disponibles en el momento de la publicacion, lo que puede reducir la calidad respecto a quants imatrix equivalentes.
- Modelo con 0 descargas y 0 likes en el momento del registro: escasa validacion comunitaria.
- Fecha de creacion registrada (2026-11-15) incoherente con el estado actual; conviene verificar la trazabilidad del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/AxionMed-32B-Titan-GGUF — URL correcta: https://huggingface.co/mradermacher/AxonMed-32B-Titan-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Titan
- Pagina de descargas del autor: https://hf.tst.eu/model#AxonMed-32B-Titan-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

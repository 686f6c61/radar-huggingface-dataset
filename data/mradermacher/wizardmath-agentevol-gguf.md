# mradermacher/WizardMath-AgentEvol-GGUF

## Resumen

WizardMath-AgentEvol-GGUF es la distribucion en formato GGUF del modelo openfree/WizardMath-AgentEvol, publicada por el usuario mradermacher, conocido en Hugging Face por cuantizar sistematicamente modelos abiertos para su uso en entornos de inferencia local. El modelo base es un merge de tipo evolutivo orientado a matematicas y razonamiento, con 6.738.423.808 parametros totales (aproximadamente 6,7 mil millones), lo que lo situa en la franja de modelos densos de tamano medio.

La relevancia de esta publicacion es practica: el repositorio original solo ofrece pesos en formato Transformers, mientras que esta version proporciona 12 cuantizaciones GGUF distintas (desde Q2_K de 2,6 GB hasta f16 de 13,6 GB), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

No obstante, la informacion disponible es limitada: la model card del repositorio GGUF no documenta arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks. Se trata, por tanto, de una ficha con datos verificables de especificaciones y cuantizaciones, pero con vacios explicitos en las areas que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje transformer, inferido por el pipeline transformers y el formato GGUF; detalles internos no publicados) |
| Parametros totales | 6.738.423.808 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base openfree/WizardMath-AgentEvol. Los tags del repositorio indican que se trata de un merge de tipo evolutivo ("merge", "evolutionary"), una tecnica que combina pesos de varios modelos mediante algoritmos de fusion para producir un modelo resultante sin un entrenamiento adicional completo. El nombre sugiere una orientacion hacia matematicas (WizardMath) combinada con un proceso de evolucion de agentes (AgentEvol), pero la model card no documenta que modelos participaron en el merge, cuantos tokens de entrenamiento se utilizaron ni si hubo fases de RLHF o DPO.

El repositorio GGUF es una conversion estatica del modelo original: el autor indica explicitamente que no ha generado cuantizaciones con imatrix ni ponderadas, y que no tiene previsto hacerlo salvo peticion en la seccion de discusiones. La conversion se realizo con la herramienta habitual de mradermacher (convert_type: hf, quantize_version: 2), manteniendo el vocabulario y la tokenizacion del modelo base.

## Capacidades

- Generacion de texto en ingles, con orientacion declarada a matematicas y razonamiento segun el nombre del modelo base.
- Razonamiento matematico y resolucion de problemas, presumiblemente por la herencia de WizardMath en el merge (no verificado con benchmarks).
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados, gracias al formato GGUF.
- Compatibilidad con endpoints (tag "endpoints_compatible" en el repositorio).
- Capacidades de agente y multi-step reasoning: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado.
- Vision o audio: no soportado segun los tags disponibles.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso

- Inferencia local en equipos de desarrollo: con la cuantizacion Q4_K_M (4,2 GB) el modelo puede ejecutarse en una GPU de consumo de 8 GB o en CPU con RAM suficiente, lo que permite probar el modelo sin infraestructura cloud.
- Prototipado de asistentes matematicos: dado el nombre y origen del modelo base, es adecuado para experimentar con resolucion de problemas matematicos en entornos de investigacion donde no se requiere una precision de produccion.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q2_K (2,6 GB) permite ejecutar el modelo en portatiles modestos o en placas de un solo board con suficiente memoria, a costa de calidad.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no esta pensado para entrenamiento, puede servir como base para experimentos de evaluacion y comparacion de cuantizaciones antes de invertir en el modelo completo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en la calidad de las respuestas matematicas con un unico modelo de referencia.
- Educacion e investigacion: util como ejemplo practico de merge evolutivo y de distribucion de modelos cuantizados en el ecosistema open source, para cursos o articulos tecnicos.
- Integracion en pipelines de generacion de texto en ingles: con licencia Apache 2.0, puede incorporarse a herramientas internas de generacion de documentacion tecnica o resumenes en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, GSM8K, HumanEval ni comparaciones con otros modelos, y el modelo base tampoco aporta datos verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 2,6 GB (Q2_K), 4,0-4,2 GB (Q4_K_S / Q4_K_M), 4,9 GB (Q5_K_M), 5,6 GB (Q6_K), 7,3 GB (Q8_0) y 13,6 GB (f16).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4 a Q8 con contexto moderado; RTX 4090 24 GB o A100/H100 para f16 y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para Q4_K_M; en 6 GB con Q3_K_M o inferiores; en 4 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantizacion y la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WizardMath-AgentEvol-GGUF | 6,7 B | no disponible | Apache 2.0 | GGUF | Objeto de esta ficha; 12 cuantizaciones |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32 K (segun version) | Apache 2.0 | GGUF | Referencia habitual en la misma franja de tamano; contexto documentado |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128 K | Llama 3.1 Community | GGUF | Mayor contexto y benchmarks publicados; licencia mas restrictiva |
| Qwen2.5-Math-7B (GGUF) | 7,6 B | 4 K (segun version) | Apache 2.0 | GGUF | Especializado en matematicas con benchmarks publicados |

La comparacion es estructural: el modelo de esta ficha carece de benchmarks y contexto documentados, mientras que las alternativas citadas publican ambos. Para una eleccion en produccion, la ausencia de datos verificables es un factor de riesgo frente a modelos con evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar su calidad relativa frente a alternativas con datos verificables.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Solo ingles: el campo language del repositorio limita el uso a ese idioma; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluaciones publicadas.
- Origen por merge: los modelos fusionados pueden heredar sesgos y comportamientos inconsistentes de los modelos constituyentes, que no se documentan.
- Cuantizaciones estaticas sin imatrix: el autor advierte que no ha generado cuantizaciones ponderadas, lo que puede reducir la calidad en las variantes de menor tamano (Q2_K, Q3_K_S).
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las posibles restricciones heredadas de los modelos base del merge.
- Fecha de actualizacion del repositorio (2026) posterior a la creacion: conviene revisar la model card original en busca de cambios no reflejados en la informacion disponible.
- Sin soporte de tool calling ni agentes documentado: no recomendado para pipelines que dependan de function calling sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WizardMath-AgentEvol-GGUF
- Modelo base: https://huggingface.co/openfree/WizardMath-AgentEvol
- Pagina de descargas del autor: https://hf.tst.eu/model#WizardMath-AgentEvol-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests

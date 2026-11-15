# mradermacher/MEMPHIS-GGUF

## Resumen

MEMPHIS es un modelo de lenguaje de 26.895.998.464 parametros (aproximadamente 26,9 mil millones) desarrollado por el usuario darkc0de y publicado originalmente en Hugging Face. Esta ficha corresponde a la version cuantizada en formato GGUF realizada por mradermacher, un conocido autor de cuantizaciones de la comunidad. El modelo se presenta como un derivado afinado de la familia Qwen 3.5 (segun la etiqueta `qwen3_5`), orientado a generacion de texto conversacional y marcado explicitamente como `uncensored`, `heretic` y `toxic`, lo que indica que ha sido entrenado para eliminar restricciones de alineamiento y seguridad.

La relevancia de esta publicacion es doble: por un lado, ofrece una alternativa de pesos abiertos con licencia Apache 2.0 para experimentacion con modelos sin filtros de contenido; por otro, la cuantizacion GGUF permite ejecutar un modelo de casi 27 mil millones de parametros en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo esta entrenado exclusivamente en ingles y no se han publicado detalles tecnicos sobre su arquitectura interna, datos de entrenamiento ni resultados de evaluacion.

No se dispone de informacion sobre el pipeline de inferencia, la longitud de contexto nativa ni el proceso de entrenamiento (RLHF, DPO, etc.). La model card del cuantizador es meramente operativa y se limita a listar los archivos GGUF generados. Todo lo que sigue se basa en los metadatos disponibles y en las convenciones habituales de la familia Qwen, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida de la etiqueta `qwen3_5`; no confirmada en la model card) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors en `darkc0de/MEMPHIS`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base `darkc0de/MEMPHIS`. La etiqueta `qwen3_5` sugiere que deriva de la familia Qwen 3.5 de Alibaba, lo que implicaria una arquitectura transformer decoder-only con atencion por grupos (GQA) y posibles mecanismos de atencion lineal o hibrida, pero esto no se confirma en la documentacion disponible. El tamano de 26,9 B parametros es coherente con un modelo denso de esa familia, aunque no se especifica si emplea mezcla de expertos.

Respecto al entrenamiento, la unica informacion disponible es el dataset declarado: `darkc0de/The-Mind-of-XORTRON`. No se indica el numero de tokens, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. Las etiquetas `heretic`, `uncensored` y `toxic` indican que el autor ha realizado un proceso de "abliteration" o desalineamiento deliberado para eliminar los rechazos de seguridad del modelo base, lo que constituye la innovacion tecnica principal (y el principal riesgo) de esta publicacion. El cuantizador indica que no ha generado cuantizaciones con imatrix/weighted, solo estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para dialogos multi-turno.
- Razonamiento y respuesta a instrucciones sin las restricciones de alineamiento habituales (modo `uncensored`).
- Generacion de codigo y matematicas (capacidad inferida de la familia Qwen 3.5, no verificada en la model card).
- Soporte multimodal potencial: el repositorio incluye archivos `mmproj` (proyeccion multimodal), lo que sugiere capacidad de vision, aunque no se detalla en la documentacion.
- Compatibilidad con text-generation-inference (etiqueta `text-generation-inference`) y con el ecosistema transformers.
- Soporte de tool calling y function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion sobre desalineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM al que se le han eliminado los rechazos de seguridad, util para equipos de red teaming y evaluacion de riesgos en entornos controlados.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera contenido adulto o temas sensibles, donde los modelos alineados suelen negarse; el modo `uncensored` evita las interrupciones por politicas de contenido.
- Experimentacion con cuantizaciones GGUF: el repositorio ofrece 12 variantes de cuantizacion (desde Q2_K hasta f16), lo que permite medir el impacto de la compresion en perplejidad y calidad para un modelo de 26,9 B en hardware de consumo.
- Despliegue local con llama.cpp u Ollama: la version Q4_K_S (15,7 GB) cabe en GPUs de consumo con 16-24 GB de VRAM, lo que facilita prototipos offline sin dependencia de APIs.
- Analisis de sesgos y toxicidad: dado el etiquetado `toxic`, el modelo sirve como caso de estudio para medir la propagacion de sesgos y contenido nocivo en modelos sin alineamiento.
- Generacion de datos sinteticos para entrenamiento: en pipelines de destilacion o aumento de datos donde se necesita un generador que no aplique filtros de seguridad, con la debida supervision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: aproximadamente 10-11 GB.
  - Q4_K_S: aproximadamente 15,7 GB de pesos; con contexto de 8K se recomienda 20-22 GB.
  - Q5_K_M / Q6_K: aproximadamente 18-20 GB de pesos; requiere 24 GB o mas.
  - Q8_0: aproximadamente 28-29 GB de pesos; requiere 32 GB o mas.
  - f16: aproximadamente 54 GB de pesos; requiere 64 GB o mas (A100 80 GB, H100).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o 80 GB para Q8_0 y f16; H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo Q4_K_S con contexto reducido) y GPUs con 16 GB o mas para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) para pesos originales, y vLLM para el modelo base en safetensors (no para GGUF).
- Latencia y throughput estimados: no disponibles; dependeran del backend, la cuantizacion y el hardware. Como referencia orientativa para un modelo denso de 27 B en Q4_K_S sobre RTX 4090, se espera un throughput de decenas de tokens por segundo, pero no se ha medido en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MEMPHIS (este) | 26,9 B | no disponible | Apache 2.0 | GGUF, safetensors | Sin alinear, solo ingles, sin benchmarks |
| Qwen 3.5 (base inferido) | no disponible | no disponible | Apache 2.0 (habitual en Qwen) | safetensors | Modelo alineado original; referencia de capacidades |
| Llama 3.1 8B Instruct | 8 B | 128K | Llama 3.1 Community | safetensors, GGUF | Menor tamano, alineado, multilingue |
| Mistral Small 24B | 24 B | 128K | Apache 2.0 | safetensors, GGUF | Tamano comparable, alineado, multilingue |

La comparativa es aproximada: no se dispone de datos de rendimiento de MEMPHIS para contrastar con estas alternativas. La principal diferencia es la ausencia de alineamiento y el soporte exclusivo de ingles.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo esta etiquetado como `uncensored`, `heretic` y `toxic`; puede generar contenido ofensivo, ilegal o danino sin advertencia. No debe desplegarse en produccion orientada al publico sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo LLM, puede inventar hechos, citas y datos.
- Idioma: solo ingles; el rendimiento en castellano u otros idiomas sera probablemente deficiente.
- Contexto: se desconoce la longitud de contexto nativa y si la cuantizacion la preserva; las cuantizaciones bajas (Q2_K) degradan la calidad de forma notable.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- Procedencia: el modelo base `darkc0de/MEMPHIS` no documenta su proceso de entrenamiento ni los datos utilizados, lo que impide auditar sesgos o cumplimiento.
- Sin benchmarks: no hay evidencia publica de calidad, lo que desaconseja su uso en tareas criticas sin evaluacion propia.
- Cuantizaciones estaticas: el cuantizador no ha generado versiones con imatrix, por lo que las cuantizaciones IQ (IQ4_XS) pueden no ser optimas en calidad frente a las ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MEMPHIS-GGUF
- Modelo base: https://huggingface.co/darkc0de/MEMPHIS
- Dataset declarado: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MEMPHIS-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

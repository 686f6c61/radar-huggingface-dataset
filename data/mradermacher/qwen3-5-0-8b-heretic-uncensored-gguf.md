# mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-Uncensored-GGUF es una distribucion de cuantizaciones GGUF del modelo Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, publicada por mradermacher. El modelo base deriva de la familia Qwen3.5 de Alibaba, en su variante de 0,8 mil millones de parametros, sometida a un proceso de "abliteration" o "decensoring" (etiquetado como heretic/uncensored) que elimina parte de los mecanismos de rechazo del modelo original. Esta version GGUF esta pensada para inferencia local en hardware modesto mediante llama.cpp y derivados.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion estatica de un modelo pequeno (752.393.024 parametros reales en safetensors) disponible en 13 variantes de cuantizacion mas dos ficheros mmproj para el componente multimodal; por otro, expone las limitaciones de trazabilidad de las modificaciones "uncensored", dado que el autor de la cuantizacion no documenta el proceso de abliteration ni los datos de entrenamiento.

Se trata de un modelo etiquetado como multimodal y vision-language, con licencia Apache 2.0 heredada del modelo Qwen3.5 base. El repositorio ocupa 7,8 GB e incluye pesos en formato GGUF unicamente; el modelo original en safetensors reside en el repositorio del autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los safetensors corresponden al modelo base Peymandc/Qwen3.5-0.8B-Heretic-Uncensored) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Los tags indican que se trata de un modelo de la familia Qwen3.5, multimodal y vision-language, con soporte conversacional y pesos en safetensors en su version original. El dato de parametros totales (752.393.024) corresponde a los safetensors del modelo base. No se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante; el conteo de parametros es coherente con un modelo denso de aproximadamente 0,8B.

Respecto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La unica informacion relevante es que el modelo ha sido sometido a un proceso de "abliteration" o "decensoring" (tags heretic, uncensored, decensored, abliterated), que tipicamente consiste en identificar y neutralizar direcciones de activacion asociadas a comportamientos de rechazo. El autor de la cuantizacion no documenta la metodologia, los datos ni la evaluacion de dicho proceso; el tag "reproducible" sugiere que el autor del modelo base publico el procedimiento, pero no se detalla en esta informacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational".
- Capacidades multimodales y de vision-lenguaje, segun los tags "multimodal" y "vision-language"; el repositorio incluye ficheros mmproj (f16 y Q8_0) necesarios para procesar imagenes.
- Comportamiento "uncensored" o "abliterated": el modelo ha sido modificado para reducir los rechazos ante ciertas peticiones, segun los tags del repositorio.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente "en"; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos de gama baja: con cuantizaciones de 0,5-0,7 GB (Q2_K a Q5_K_M), el modelo puede ejecutarse en CPU o en GPU consumer con poca VRAM mediante llama.cpp, lo que lo hace adecuado para prototipado y pruebas en portatiles.
- Procesamiento de imagenes en local: los ficheros mmproj-f16 y mmproj-Q8_0 permiten desplegar el componente vision-language en llama.cpp para tareas de descripcion de imagenes o respuesta a preguntas visuales sin depender de servicios en la nube.
- Experimentacion con modelos desbloqueados: investigadores que estudian el efecto de la abliteration sobre el comportamiento del modelo pueden usar esta cuantizacion para comparar respuestas frente a la version original de Qwen3.5-0.8B, con la advertencia de que el proceso no esta documentado en este repositorio.
- Chat conversacional ligero integrado en aplicaciones de escritorio: el tamano reducido (0,5-0,9 GB por cuantizacion) permite empaquetar el modelo dentro de aplicaciones de escritorio o moviles con llama.cpp como backend.
- Filtrado y generacion de texto en pipelines por lotes: al ser un modelo pequeno, puede procesar grandes volumenes de texto en CPU con bajo coste energetico, por ejemplo para clasificacion o resumen de documentos cortos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion mas dos mmproj, lo que permite medir el impacto de Q2_K frente a Q8_0 en calidad de salida sobre el mismo modelo, util para calibrar compromisos tamano/calidad en despliegues reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Q2_K, 0,6-0,7 GB para Q4_K_M y Q5_K_M, 0,9 GB para Q8_0 y 1,6 GB para f16. Los ficheros mmproj anaden 0,2-0,3 GB si se usa el componente multimodal.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente para las cuantizaciones pequenas; una RTX 3060, RTX 4060 o superior permite cargar Q8_0 con margen. En entornos de servidor, una A100 o H100 no aporta ventaja significativa por el tamano del modelo, salvo por concurrencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF. vLLM y TGI no son opciones directas para este repositorio GGUF; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-Uncensored-GGUF (este) | 752.393.024 | no disponible | apache-2.0 | GGUF | Cuantizacion estatica, multimodal, modificado "uncensored" |
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored | 752.393.024 | no disponible | apache-2.0 | safetensors | Modelo base del que deriva esta cuantizacion |
| Qwen3.5-0.8B (original) | no disponible en esta informacion | no disponible | apache-2.0 | safetensors | Version sin modificacion de alineamiento; referencia para comparar el efecto de la abliteration |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration o decensoring no esta documentado en este repositorio: se desconoce que comportamientos de rechazo se han eliminado y con que metodologia, lo que dificulta evaluar riesgos.
- La eliminacion de mecanismos de rechazo puede aumentar la probabilidad de generar contenido danino, ofensivo o inexacto; no se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: al ser un modelo de 0,8B, la capacidad de razonamiento y la fidelidad factual son limitadas; no hay evaluaciones publicadas en esta informacion.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y la modificacion "uncensored" pueden conllevar obligaciones adicionales o implicaciones legales segun la jurisdiccion; conviene revisar la licencia del modelo Qwen3.5 original enlazada en la model card.
- El repositorio solo distribuye GGUF; para usar vLLM o TGI es necesario acudir al modelo base en safetensors.
- La fecha de creacion del repositorio (2026-11-19) y el reducido numero de likes (1) sugieren poca validacion comunitaria; no hay evidencia de pruebas independientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Modelo base: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Licencia del modelo Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

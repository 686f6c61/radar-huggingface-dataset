# mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic, preparadas por mradermacher con el método de cuantización ponderada por imatrix (sufijo i1). No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF de un modelo de ~27.320 millones de parámetros que, según su nomenclatura y etiquetas, deriva de la familia Qwen (Qwen3.8) y ha sido sometido a un proceso de abliteration o "uncensoring" para eliminar los rechazos alineados del modelo original. El foco declarado del modelo base es el uso agéntico: etiquetas como agentic, tool-calling, function-calling, hermes-agent y task-tree apuntan a un ajuste orientado a llamadas a herramientas y razonamiento en varios pasos.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo de 27B con requisitos de VRAM que van desde unos 11 GB en cuantizaciones de 2 bits hasta 22,5 GB en Q6_K, lo que lo sitúa en el rango de GPUs de consumo alto (RTX 3090/4090 de 24 GB) e incluso en configuraciones con GPU y CPU repartidas. Por otro, documenta una variante "uncensored" cuya licencia declarada es Apache 2.0, aunque la documentación externa encontrada menciona en algún caso una frontera de uso exclusivamente de investigación, una discrepancia que conviene verificar antes de cualquier despliegue comercial.

Conviene ser explícito sobre el alcance de la información disponible: no hay pipeline declarado, no hay datos de benchmarks publicados y no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni los detalles del proceso de abliteration. Las especificaciones que figuran a continuación proceden de los metadatos de HuggingFace, de la model card del cuantizador y de los resultados de búsqueda web, y se marcan como "no disponible" allí donde no hay dato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Etiquetas del repositorio: transformer, mamba, linear-attention, qwen, qwen3.8 (la combinación no se confirma en la información proporcionada) |
| Parámetros totales | 27.320.697.856 (~27,3B), dato de safetensors del modelo base |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q3_K_M (13,6 GB), i1-IQ4_XS (15,4 GB), i1-Q4_K_S (15,9 GB), i1-Q4_K_M (16,9 GB), i1-Q6_K (22,5 GB). Listado adicional de tipos disponibles: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés), zh (chino), ar (árabe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado). El modelo base está en safetensors y la librería declarada es transformers |
| Tamaño del repositorio | 107,5 GB |
| Archivo imatrix | Qwen3.8-27B-Uncensored-Mythos-Class-Agentic.imatrix.gguf (0,1 GB) |
| Modelo base | 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic |
| Método de cuantización | Ponderada por imatrix (i1), quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Modalidad | El cuantizador indica que es un modelo de visión; los ficheros mmproj, si existen, se alojan en el repositorio estático |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fechas | Creado el 25 de septiembre de 2026, actualizado el 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información técnica verificable sobre la arquitectura interna ni sobre el proceso de entrenamiento. Los metadatos del repositorio etiquetan el modelo con términos como qwen, qwen3.8, mamba y linear-attention, lo que sugeriría una arquitectura híbrida con componentes de atención lineal o de espacio de estados, pero no hay ninguna descripción en la model card que confirme esa composición ni que detalle el número de capas, dimensiones ocultas, cabezas de atención o proporción de capas recurrentes. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO u optimización por preferencias, ni si el modelo incorpora decodificación especulativa o modos de razonamiento extendido.

Lo único documentado con claridad es el proceso de cuantización realizado por mradermacher: conversión desde pesos en formato HuggingFace a GGUF, con cuantización de tensores de salida y uso de una matriz de importancia (imatrix) generada por el propio autor para mejorar la calidad de las cuantizaciones de baja precisión. Las etiquetas del modelo base (abliterated, uncensored) indican que antes de la cuantización se aplicó alguna técnica de eliminación de direcciones de rechazo, orientada a reducir los comportamientos de negativa del modelo alineado original. Las etiquetas fp8, awq, sglang y vllm apuntan a que las versiones sin cuantizar del modelo base están pensadas para su despliegue con esos motores de inferencia. No hay ninguna innovación técnica descrita por el autor de la ficha más allá del propio pipeline de cuantización.

## Capacidades

- Generación de texto conversacional: el repositorio se clasifica como conversational y va acompañado de plantillas de chat para su uso en llama.cpp y derivados.
- Tool calling y function calling: las etiquetas del modelo base incluyen tool-calling y function-calling de forma explícita, lo que indica un ajuste orientado a la emisión de llamadas estructuradas a herramientas.
- Comportamiento agéntico: las etiquetas hermes-agent y task-tree sugieren soporte para flujos de agente con formato tipo Hermes y planificación jerárquica de tareas, aunque no se documenta el esquema exacto de prompts.
- Razonamiento en varios pasos: no hay evidencia publicada de benchmarks ni de un modo de pensamiento explícito; la información disponible no permite confirmarlo ni descartarlo.
- Visión: el cuantizador afirma que el modelo base es multimodal de visión y remite a los ficheros mmproj del repositorio estático, pero no se detalla la resolución de entrada ni las capacidades concretas.
- Multilingüismo: los idiomas declarados son inglés, chino y árabe. No hay indicación de soporte para castellano en los metadatos.
- Ausencia de rechazos: el modelo ha sido abliterado, de modo que no aplica las políticas de negativa típicas del modelo alineado original.
- Contenido sin filtro: no se documenta ningún sistema de moderación adicional en la ficha del cuantizador.

## Casos de uso

- Ejecución local de un modelo de 27B en una única GPU de 24 GB: con las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-Q4_K_S (15,9 GB), el modelo cabe en tarjetas como la RTX 3090 o la RTX 4090 dejando margen para caché KV, sin necesidad de infraestructura en la nube ni de enviar datos a terceros.
- Despliegue en portátiles o equipos con GPU de gama media: la cuantización i1-IQ3_M (12,9 GB) o i1-Q3_K_M (13,6 GB) permite arrancar el modelo en GPUs de 16 GB, aceptando una pérdida de calidad medible frente a Q4.
- Escenarios de VRAM muy limitada o de cómputo mixto CPU/GPU: las cuantizaciones i1-Q2_K (11,0 GB) e i1-Q2_K/IQ2 permiten repartir capas entre GPU y RAM del sistema, útil para pruebas de concepto y generación por lotes en CPU.
- Agentes de automatización de tareas con herramientas: dado el etiquetado agentic y tool-calling, el modelo es candidato para orquestadores que necesiten invocar APIs externas, ejecutar comandos o encadenar pasos, siempre que se valide empíricamente la fiabilidad del formato de llamada, ya que no hay benchmarks publicados.
- Generación y transformación de texto sin restricciones temáticas: proyectos de escritura creativa, análisis de contenido sensible o investigación sobre seguridad de modelos que requieran un modelo que no rechace peticiones por política de contenido.
- Investigación sobre abliteration y alineación: comparar este modelo con su equivalente sin abliterar permite estudiar cómo la eliminación de direcciones de rechazo afecta a la utilidad general, al formato de salida y al cumplimiento de instrucciones.
- Procesamiento multilingüe en inglés, chino y árabe: aplicaciones de traducción, resumen o extracción de información en esos tres idiomas, con la advertencia de que el castellano no figura entre los idiomas declarados.
- Documentos con imágenes, si se habilita el mmproj: el cuantizador declara que el modelo es de visión, por lo que los ficheros mmproj del repositorio estático permitirían tareas de descripción de imagen o extracción de información visual, sin que haya documentación de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones que nos ocupan. Las guías externas encontradas en la búsqueda web (orcarouter.ai, HackerNoon) mencionan benchmarks en su descripción, pero el contenido concreto no se ha facilitado y, por tanto, no se reproduce aquí.

## Requisitos de hardware

- Modo de cálculo: los valores de VRAM son estimaciones basadas en el tamaño de cada fichero GGUF más el espacio de trabajo del runtime. La caché KV depende de la longitud de contexto, que no se ha especificado, por lo que el consumo real puede aumentar de forma notable con contextos largos.
- i1-Q2_K (11,0 GB de fichero): apto para GPU de 12-16 GB, con contexto corto. Calidad degradada; el propio autor recomienda IQ3_XXS en su lugar.
- i1-IQ3_M (12,9 GB) y i1-Q3_K_M (13,6 GB): GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000). El autor indica que i1-IQ3_S puede ser preferible a i1-Q3_K_M.
- i1-IQ4_XS (15,4 GB) e i1-Q4_K_S (15,9 GB): GPU de 16-24 GB. El autor describe i1-Q4_K_S como el punto óptimo entre tamaño, velocidad y calidad.
- i1-Q4_K_M (16,9 GB): GPU de 24 GB (RTX 3090, RTX 4090, A5000). El autor lo recomienda como la opción rápida.
- i1-Q6_K (22,5 GB): GPU de 24 GB con poco margen para caché KV, o GPU de 32-48 GB (A6000, L40S, A100 40 GB). El autor lo describe como prácticamente equivalente a un Q6_K estático.
- GPU profesionales para despliegue de mayor concurrencia: A100, H100 y similares resultan apropiados si se busca servir el modelo a varios usuarios simultáneos con cuantizaciones medianas o con las versiones FP8/AWQ del modelo base en vLLM o SGLang.
- Cabe en GPU de consumo: sí, en el rango de 12 GB a 24 GB según la cuantización elegida. Las cuantizaciones de 2 bits permiten incluso tarjetas de 12 GB, con pérdida de calidad apreciable.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp, llama-cpp-python) son las vías naturales para estos ficheros GGUF. El modelo base está etiquetado para vLLM y SGLang, que admiten GGUF de forma parcial pero rinden mejor con pesos sin cuantizar en FP8 o AWQ.
- Ficheros multiparte: el README remite a las instrucciones de concatenación de ficheros multiparte de los README de TheBloke para el caso de descargas fragmentadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento que permitan una comparación cuantitativa con otras familias de modelos. La comparación que sigue se limita a las variantes del mismo modelo dentro del ecosistema del autor, con los campos desconocidos marcados como no disponibles.

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF (este repositorio) | ~27,3B | No disponible | GGUF con imatrix (i1), desde Q2_K hasta Q6_K | apache-2.0 | Cuantización ponderada por imatrix; matriz de importancia incluida en el repo |
| mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF | ~27,3B | No disponible | GGUF estáticas | No disponible | Repositorio estático hermano; aloja los ficheros mmproj si existen |
| 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic (modelo base) | 27.320.697.856 | No disponible | FP8, AWQ (según etiquetas) | apache-2.0 (heredada) | Pesos originales en safetensors, librería transformers |
| Otras variantes Qwen3.8-27B uncensored citadas en la búsqueda web (por ejemplo, Qwen3.8-27B-Uncensored-GGUF, publicada el 16 de agosto de 2026) | ~27B | No disponible | GGUF | No disponible | Se menciona como alternativa nativa de llama.cpp del modelo abliterado en FP8 |

No se dispone de comparaciones con modelos de otras familias (por ejemplo, alternativas de tamaño similar de otros proveedores) dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no hay ninguna evaluación de sesgos publicada. Al haberse eliminado los mecanismos de rechazo mediante abliteration, es esperable que el modelo genere contenido que el modelo alineado original habría declinado, incluido contenido ofensivo, estereotipado o potencialmente dañino. No se ha medido el efecto de esta modificación sobre los sesgos de género, raza, religión o ideología.
- Alucinación: sin benchmarks ni evaluaciones de fidelidad, no es posible estimar la tasa de alucinación. En tareas de recuperación o generación factual debe verificarse la salida de forma externa.
- Idiomas: los únicos idiomas declarados son inglés, chino y árabe. El castellano no figura entre ellos, por lo que su rendimiento en español es desconocido y probablemente inferior.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas y complica el dimensionamiento de la caché KV.
- Licencia: los metadatos de HuggingFace indican apache-2.0, que permitiría uso comercial. Sin embargo, al menos una de las guías externas encontradas menciona una frontera de uso exclusivamente de investigación. Esa discrepancia debe resolverse consultando la licencia del modelo base y del modelo original del que deriva antes de un despliegue comercial.
- Uso comercial: además del punto anterior, el modelo es una derivación no oficial de una familia Qwen y no está respaldado por el equipo de Qwen. Las condiciones reales de uso dependen de la licencia del modelo original, que no se detalla en la información proporcionada.
- Trazabilidad limitada: no se documenta el proceso de abliteration, ni la procedencia de los datos de ajuste, ni quién ha validado el comportamiento del modelo. El repositorio no tiene descargas ni likes y el pipeline no está declarado.
- Evaluación empírica obligatoria: las capacidades de tool calling y de comportamiento agéntico se deducen de etiquetas, no de resultados medidos. Antes de integrarlo en un agente en producción conviene validar la tasa de llamadas correctamente formateadas y el comportamiento en cadenas de varios pasos.
- Formato GGUF: el uso con vLLM o SGLang requerirá las versiones FP8 o AWQ del modelo base, porque estos motores no aprovechan bien los GGUF cuantizados. Para producir nuevas cuantizaciones, el repositorio incluye el fichero imatrix.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Modelo base: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic
- Repositorio de cuantizaciones estáticas (y ficheros mmproj si existen): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF de referencia (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Artículo sobre ejecución local con GGUF y llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Artículo sobre la build abliterada en GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Comparativa con otros modelos Qwen GGUF: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Repositorio relacionado citado en la búsqueda: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF

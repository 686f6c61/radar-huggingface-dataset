# mradermacher/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje de gran escala desarrollado por inclusionAI, publicado originalmente en Hugging Face bajo el identificador `inclusionAI/Ling-3.2-air`. La ficha que nos ocupa documenta la versión cuantizada en formato GGUF elaborada por mradermacher, un conocido creador de cuantizaciones estáticas para el ecosistema llama.cpp. El modelo base cuenta con 127.486.405.600 parámetros (aproximadamente 127,5 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamano, y se distribuye bajo licencia MIT.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de más de 120 mil millones de parámetros en hardware de consumo mediante cuantizaciones agresivas (desde Q2_K hasta Q8_0), algo impensable con los pesos originales en safetensors. El repositorio incluye además ficheros `mmproj` (multi-modal projector), lo que indica que el modelo base incorpora capacidades de visión, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento.

La información disponible es limitada: la model card del cuantizador es puramente técnica sobre el proceso de cuantización y no incluye especificaciones del modelo original como longitud de contexto, composición del dataset o resultados de benchmarks. Esta ficha refleja fielmente lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es de tipo transformer denso, segun el conteo de parametros; no se detalla en la informacion) |
| Parametros totales | 127.486.405.600 (~127,5 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun los tags de la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `inclusionAI/Ling-3.2-air` en la documentación proporcionada. El conteo de parámetros (127,5 B) y la presencia de ficheros `mmproj` en la cuantización sugieren un transformer denso con capacidad multi-modal (visión), pero no se confirma ni el tipo de atención, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras fases de alineamiento.

Lo que sí está documentado es el proceso de cuantización realizado por mradermacher: se trata de cuantizaciones estáticas (static quants) generadas con `convert_type: hf` y `output_tensor_quantised: 1`, a partir del modelo en formato Hugging Face. El autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (`Ling-3.2-air-i1-GGUF`), lo que sugiere que esta versión principal emplea cuantización estándar sin matriz de importancia. No se especifica el número de tokens de entrenamiento ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la librería `transformers` indican uso previsto para diálogo.
- Capacidades multi-modales: la presencia de ficheros `mmproj` (Q8_0 y f16) confirma soporte de entrada visual, aunque no se detalla el alcance.
- Soporte multilingüe: limitado al inglés según los tags (`language: en`); no consta soporte de otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de gran escala en hardware de consumo: gracias a las cuantizaciones Q2_K (46,6 GB) y Q3_K_S (55,2 GB), es posible ejecutar un modelo de 127,5 B en estaciones de trabajo con 48-64 GB de VRAM o en configuraciones multi-GPU consumer, algo inviable con los pesos originales.
- Inferencia en servidores con GPU de datacenter: la cuantización Q4_K_M (77,1 GB) permite servir el modelo en una sola A100 de 80 GB o H100, reduciendo costes frente a la versión f16 (que requeriría ~255 GB y múltiples GPUs).
- Aplicaciones conversacionales con contexto multi-turno: el tag `conversational` y el formato GGUF lo hacen adecuado para integrarse en interfaces de chat mediante llama.cpp u Ollama, aunque la longitud de contexto debe validarse empíricamente.
- Procesamiento de documentos con componente visual: los ficheros `mmproj` habilitan tareas de imagen-a-texto (descripción de capturas, extracción de información de documentos escaneados) en combinación con el modelo base.
- Investigación y experimentación con cuantizaciones: el repositorio ofrece un espectro amplio de tipos de cuantización (desde Q2_K hasta Q8_0) que permite estudiar el trade-off calidad/tamano en modelos de 127 B, útil para trabajos académicos sobre compresión de modelos.
- Prototipado rápido sin infraestructura cloud: al estar disponible en GGUF y con licencia MIT, equipos pequeños pueden evaluar el modelo en local antes de comprometerse con despliegues en producción sobre los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se proporcionan datos de perplejidad de las distintas cuantizaciones, más allá de la referencia genérica a un gráfico externo de ikawrakow sobre calidad relativa de tipos de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamano del fichero GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~47 GB
  - Q3_K_S: ~55 GB
  - Q4_K_S: ~73 GB
  - Q4_K_M: ~77 GB
  - Q5_K_M: ~91 GB
  - Q6_K: ~105 GB
  - Q8_0: ~136 GB
- GPU recomendadas:
  - Q2_K / Q3_K_S: 2× RTX 4090 (24 GB cada una) o 1× A6000 (48 GB) con offloading parcial.
  - Q4_K_M: 1× A100 80 GB o 1× H100 80 GB.
  - Q8_0: 2× A100 80 GB o 2× H100 80 GB.
- ¿Cabe en GPU consumer? Solo las cuantizaciones más agresivas (Q2_K, Q3_K_S) caben en configuraciones multi-GPU consumer (2× RTX 4090). Una sola RTX 4090 (24 GB) no es suficiente para ninguna cuantización completa; requeriría offloading a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. Para vLLM o TGI sería preferible usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Dependerán fuertemente del hardware, del tipo de cuantización y de la longitud de contexto; con 127,5 B de parámetros, se espera un throughput bajo en configuraciones consumer (del orden de pocos tokens por segundo) y moderado en A100/H100.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (`inclusionAI/Ling-3.2-air`) para establecer una comparativa rigurosa con alternativas de la misma categoría. A continuación se indican modelos de tamano comparable (aproximadamente 100-130 B) que podrían servir de referencia, aunque no se dispone de datos de rendimiento comparables en la información proporcionada:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| Ling-3.2-air (esta ficha) | ~127,5 B | no disponible | MIT | Sí (mradermacher) |
| Llama 3.1 405B | 405 B | 128 K | Llama 3.1 Community | Sí (comunidad) |
| Mistral Large 2 | 123 B | 128 K | Mistral Research / comercial | Parcial (comunidad) |
| Qwen2.5 72B | 72,7 B | 128 K | Apache 2.0 | Sí (oficial y comunidad) |

La comparativa de rendimiento no está disponible. Se recomienda consultar la model card original de `inclusionAI/Ling-3.2-air` para obtener datos de benchmarks antes de elegir entre estas alternativas.

## Limitaciones y advertencias

- Información del modelo base muy escasa: la model card del cuantizador no documenta arquitectura, contexto, dataset ni alineamiento, lo que dificulta evaluar riesgos de sesgo o alucinación.
- Sesgos conocidos: no documentados. Al ser un modelo entrenado principalmente en inglés, es probable que presente sesgos culturales y lingüísticos propios de ese corpus, pero no se confirma.
- Riesgo de alucinación: no cuantificado. Como todo LLM de gran escala, es susceptible de generar contenido plausible pero falso; la ausencia de benchmarks impide estimar su fiabilidad.
- Limitaciones de idioma: los tags indican únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no está documentada; no debe asumirse un valor concreto sin verificarlo contra los pesos originales.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright. No obstante, conviene verificar la licencia del modelo base original, ya que el cuantizador declara MIT pero el modelo fuente podría tener condiciones adicionales no reflejadas.
- Caveat para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q5_K_M o superior, lo que exige hardware de gama alta. Además, el uso de GGUF limita el throughput frente a frameworks optimizados como vLLM con pesos f16.
- Repositorio de gran tamano (866,6 GB): la descarga completa es costosa; conviene descargar solo el fichero de cuantización deseado.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Ling-3.2-air-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.2-air
- Cuantizaciones con imatrix (ponderadas): https://huggingface.co/mradermacher/Ling-3.2-air-i1-GGUF
- Página de overview del cuantizador: https://hf.tst.eu/model#Ling-3.2-air-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests

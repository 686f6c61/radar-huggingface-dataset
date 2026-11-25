# mradermacher/Tenet-32B-Qwen3-Unslop-v2-GGUF

## Resumen

Tenet-32B-Qwen3-Unslop-v2-GGUF es la distribucion en formato GGUF del modelo Tenet-32B-Qwen3-Unslop-v2, desarrollado originalmente por mr-andrey-isachenko y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 32.762.123.264 parametros (aproximadamente 32,8 mil millones) construido sobre la arquitectura Qwen3, orientado a razonamiento, generacion de codigo, uso de herramientas y flujos agenticos. La variante "Unslop-v2" indica un ajuste fino adicional destinado a reducir respuestas genericas y verbosas, mientras que la etiqueta "abliterated/uncensored" sugiere que se ha atenuado el comportamiento de rechazo del modelo base.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos y pipelines internos. Esta version concreta del repositorio ofrece unicamente pesos cuantizados en GGUF (desde Q2_K hasta Q8_0), pensados para inferencia en CPU y GPU de consumo mediante llama.cpp y entornos compatibles, no para entrenamiento ni ajuste fino directo.

Su relevancia actual radica en que combina un tamano manejable en hardware de gama alta de consumo (con cuantizaciones de 4 bits en torno a 19-20 GB) con capacidades de razonamiento explicito ("thinking"), tool calling y generacion de codigo, lo que lo situa en la franja de modelos abiertos de 30B utilizables en local. La informacion publica disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (detalle interno no disponible) |
| Parametros totales | 32.762.123.264 (32,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (existen tambien cuantizaciones con imatrix en el repo -i1-GGUF) |
| Idiomas soportados | en (ingles; segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de la familia Qwen3, por lo que se trata de un transformer decoder-only, pero no se detallan en la model card el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion exacta. Las etiquetas del repositorio mencionan "reasoning", "thinking", "grpo", "abliterated" y "uncensored", lo que sugiere un proceso de ajuste que incluye aprendizaje por refuerzo con GRPO para el razonamiento y una fase de "abliteration" para reducir los rechazos del modelo base, aunque no se aportan detalles sobre hiperparametros, volumen de datos ni composicion del dataset.

El sufijo "Unslop-v2" apunta a un ajuste fino orientado a eliminar respuestas de relleno y mejorar la concision, pero no se documenta la metodologia concreta (por ejemplo, DPO, SFT o filtrado de datos). Tampoco se especifican los tokens de entrenamiento ni si hubo fases de RLHF adicionales. Esta version del repositorio es una cuantizacion estatica del modelo original mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2; el trabajo de mradermacher se limita a la conversion a GGUF y a la generacion de las distintas variantes de cuantizacion listadas arriba.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo "thinking" explicito, segun las etiquetas del modelo.
- Generacion y asistencia en codigo ("coding").
- Uso de herramientas y function calling ("tool-use").
- Flujos agenticos y razonamiento multi-paso ("agentic").
- Comportamiento "abliterated/uncensored", con menor tendencia al rechazo de peticiones.
- Compatibilidad con endpoints y despliegue en vLLM (etiqueta "vllm") y con el ecosistema GGUF/llama.cpp.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en un IDE o CLI para autocompletado, explicacion y refactorizacion de codigo, aprovechando su soporte de tool calling y su tamano de 32B, que cabe en GPUs de consumo con cuantizacion Q4.
- Agente autonomo con herramientas: al estar etiquetado como "agentic" y "tool-use", puede orquestar llamadas a APIs, busqueda y ejecucion de comandos en pipelines multi-paso, con la ventaja de ejecutarse en infraestructura propia.
- Razonamiento asistido por pasos: el modo "thinking" permite usarlo para descomponer problemas logicos, matematicos o de planificacion, mostrando la cadena de razonamiento antes de la respuesta final.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecucion en CPU con llama.cpp, util para prototipos o entornos con RAM abundante.
- Procesamiento de contenido sin filtros editoriales: la variante "uncensored" resulta adecuada para tareas creativas, redaccion tecnica o analisis de textos sensibles donde los rechazos del modelo base serian un obstaculo, siempre con supervision humana.
- Chatbot interno o atencion al cliente en ingles: puede gestionar conversaciones multi-turno y, mediante tool calling, consultar sistemas internos (pedidos, tickets) en un despliegue self-hosted con vLLM o llama.cpp.
- Evaluacion comparativa de modelos abiertos: sirve como referencia de la franja 30B para experimentos de investigacion sobre razonamiento y alineacion, al estar disponible en multiples cuantizaciones con distintos compromisos de calidad y tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero GGUF): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,1 GB; Q3_K_L 17,4 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 19,9 GB; Q5_K_S 22,7 GB; Q5_K_M 23,3 GB; Q6_K 27,0 GB; Q8_0 34,9 GB. A estos valores hay que anadir el espacio para el contexto KV cache, que crece con la longitud de contexto configurada.
- GPU recomendadas: para Q4_K_M (19,9 GB) se necesita una GPU con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A10G; para Q5/Q6 conviene una A100 40GB, L40S o H100; Q8_0 requiere alrededor de 35 GB, por lo que encaja en A100 40GB/80GB o H100.
- GPU de consumo: si, cabe en RTX 3090 y RTX 4090 con cuantizaciones Q4 (19-20 GB) y en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido; en 12 GB no es viable con calidad razonable.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para GGUF; vLLM segun la etiqueta del modelo (para pesos completos o variantes compatibles); TGI no esta confirmado para este formato.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. Como referencia cualitativa, la model card califica Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen3-Unslop-v2 (este) | 32,8B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste "unslop" y abliterated sobre Qwen3 |
| Qwen3-32B (modelo base de referencia) | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Base oficial de Alibaba; comportamiento alineado estandar |
| Gemma 3 27B | no disponible en esta ficha | no disponible | Gemma license | safetensors, GGUF | Alternativa abierta de tamano similar de Google |
| Mistral Small 3 (24B) | no disponible en esta ficha | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa europea de 24B con foco en latencia |

La comparacion cuantitativa de rendimiento no puede realizarse porque no hay benchmarks publicados en la informacion disponible para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3 y de un proceso de abliteration, puede presentar sesgos del corpus original y una menor calibracion en temas sensibles.
- Riesgo de alucinacion: inherente a los modelos de 30B; no se han publicado evaluaciones de factualidad.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta especificada, lo que impide planificar cargas de contexto largo con garantias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y de Qwen3, asi como las obligaciones de atribucion.
- Comportamiento "uncensored": la atenuacion de rechazos implica mayor riesgo de generar contenido inapropiado o inseguro; requiere filtros y supervision en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.
- Sin garantias de soporte: el repositorio es una cuantizacion de terceros; el autor original no valida necesariamente estas conversiones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-32B-Qwen3-Unslop-v2-GGUF
- Modelo base original: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Tenet-32B-Qwen3-Unslop-v2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-32B-Qwen3-Unslop-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/

# mradermacher/LycheeAI-coder-2b-II-pro-f16-i1-GGUF

## Resumen

LycheeAI-coder-2b-II-pro-f16-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo whcl412/LycheeAI-coder-2b-II-pro-f16. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: el autor del repo actúa como cuantizador, aplicando cuantización con imatrix ("i1") sobre los pesos originales en f16. El modelo de partida se presenta con etiquetas que lo sitúan en la familia de modelos de código derivados de MiniCPM, orientado a generación de código, conversación y tool calling.

El interés práctico de esta publicación es el formato: al estar en GGUF, el modelo puede ejecutarse en CPU y en GPU de gama baja mediante llama.cpp u Ollama, lo que permite desplegar un asistente de código en hardware sin acelerador dedicado o con GPUs de 6-8 GB de VRAM. El rango de cuantizaciones anunciado (desde IQ1_S hasta Q6_K) cubre un espectro amplio de compromisos entre tamaño en disco y calidad, algo relevante cuando el objetivo es incrustar el modelo en portátiles o en contenedores con límites estrictos de memoria.

La información pública disponible sobre este repositorio concreto es muy escasa: no hay pipeline declarado, cero descargas, cero likes, el tamaño del repo aparece como 0.0 GB y la única entrada listada en la tabla de ficheros proporcionados es el propio fichero imatrix (0.1 GB). Tampoco hay model card propia del autor del modelo base, ni resultados de benchmarks, ni especificación de longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; las etiquetas del repositorio mencionan `minicpm`, lo que sugiere un transformer decoder-only de esa familia (no confirmado) |
| Parametros totales | 774.438 segun los metadatos de safetensors aportados; el nombre del modelo indica 2B. La discrepancia no se ha podido resolver con la informacion disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K (repositorio i1/imatrix); los mismos tipos en version estatica en el repo -GGUF |
| Idiomas soportados | en (ingles) declarado; las etiquetas del repositorio anaden `chinese` |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o ajuste por instrucciones. La unica pista es la etiqueta `minicpm` del repositorio, que apunta a la familia MiniCPM, y la etiqueta `code`, que indica especializacion en codigo. El sufijo "pro-f16" del nombre del modelo base sugiere que este se publico en precision f16, y el sufijo "i1" del repo de mradermacher indica cuantizacion con importancia matrix (imatrix), una tecnica que pondera los pesos segun su relevancia para reducir la perdida de calidad en cuantizaciones agresivas.

El proceso de cuantizacion documentado en la model card incluye los metadatos `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato HuggingFace con cuantizacion de los tensores de salida. El autor reconoce a nicoboss por el acceso a infraestructura de computo para generar cuantizaciones imatrix de mayor calidad. Se declara tambien la existencia de cuantizaciones estaticas en un repositorio separado.

## Capacidades

- Generacion de codigo: es la capacidad principal implícita en el nombre y en la etiqueta `code` del repositorio.
- Conversacion multi-turno: la etiqueta `conversational` indica que el modelo base esta ajustado para dialogo.
- Tool calling / function calling: la etiqueta `tool-calling` aparece de forma explicita en el repositorio, lo que apunta a soporte de llamadas a herramientas en formato estructurado.
- Capacidades multilingues: se declara `en` como idioma; las etiquetas anaden `chinese`, por lo que cabe esperar cierto soporte de chino, no confirmado.
- Cuantizacion y despliegue: al estar en GGUF, admite ejecucion en CPU, GPU y entornos mixtos; las etiquetas mencionan tambien `mlx`, lo que sugiere disponibilidad de variantes para Apple Silicon.
- No hay evidencia de capacidades de vision, audio, modo de razonamiento explicito ni vision-lenguaje.

## Casos de uso

- Autocompletado y generacion de codigo en el IDE: al ser un modelo de aproximadamente 2B (segun el nombre) y estar disponible en Q4_K_M, puede ejecutarse localmente en el portatil del desarrollador y ofrecer sugerencias de baja latencia sin enviar codigo a servicios externos.
- Generacion de tests unitarios en pipelines de CI: integrado mediante llama-cpp-python o vLLM, el modelo puede generar esqueletos de pruebas para funciones modificadas en un pull request, reduciendo el trabajo manual de cobertura.
- Refactorizacion asistida y explicacion de codigo heredado: su etiqueta `conversational` permite mantener una conversacion sobre un fragmento de codigo y pedir variantes, comentarios o traduccion entre lenguajes.
- Agente de linea de comandos con tool calling: la etiqueta `tool-calling` habilita conectarlo a herramientas de shell, busqueda en el repositorio o APIs internas para tareas de varios pasos, como localizar un simbolo y aplicar un parche.
- Asistencia en generacion de consultas SQL y transformacion de datos: el modelo puede traducir descripciones en lenguaje natural a consultas y explicar el resultado, un caso tipico para modelos pequenos especializados en codigo.
- Despliegue en el borde o en entornos air-gapped: las cuantizaciones IQ2/IQ1 reducen el peso a menos de 1 GB, lo que permite ejecutarlo en dispositivos con poca memoria y sin conexion, por ejemplo en equipos industriales o portatiles antiguos.
- Documentacion tecnica automatizada: generar docstrings y ficheros README a partir del codigo fuente, con control de estilo mediante prompting.
- Chatbot de soporte para desarrolladores: gracias al soporte declarado de tool calling, puede consultar documentacion interna o incidencias y responder con contexto recuperado en un flujo RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite, y la model card se limita a describir el proceso de cuantizacion y a listar los tipos de cuantizacion generados.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano declarado en el nombre del modelo (aproximadamente 2B parametros) y del tipo de cuantizacion; no proceden de mediciones publicadas por el autor.

| Cuantizacion | Peso aproximado en disco | VRAM estimada en inferencia |
|---|---|---|
| Q6_K | ~1,7 GB | ~2,2-2,8 GB |
| Q5_K_M | ~1,4 GB | ~1,9-2,4 GB |
| Q4_K_M | ~1,2 GB | ~1,7-2,2 GB |
| IQ3_M / Q3_K_M | ~0,9-1,0 GB | ~1,4-1,9 GB |
| IQ2_M / Q2_K | ~0,7-0,8 GB | ~1,2-1,7 GB |
| IQ1_S | ~0,5 GB | ~1,0-1,5 GB |

- VRAM: una GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4_K_M o inferiores con contexto moderado. Para Q6_K o contextos largos conviene disponer de 6-8 GB (RTX 3060, RTX 4060 Ti, RTX 2070).
- GPU de datacenter: A100, H100 o L40S sobredimensionan ampliamente este modelo; solo tendrian sentido si se sirven muchas replicas concurrentes en el mismo acelerador.
- CPU: la ejecucion en CPU es viable con llama.cpp u Ollama para las cuantizaciones Q4 y menores, aunque el throughput dependera del numero de nucleos y del ancho de banda de memoria.
- Apple Silicon: las etiquetas mencionan `mlx`, por lo que existen variantes para el runtime de MLX; tambien puede ejecutarse via llama.cpp con Metal en Macs con memoria unificada de 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, y vLLM o TGI si se parte de los pesos originales en safetensors en lugar del GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Los datos de los modelos alternativos provienen de conocimiento general y no de la busqueda realizada, y deben verificarse en sus repositorios oficiales antes de usarlos en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LycheeAI-coder-2b-II-pro-f16 (i1-GGUF) | 2B segun nombre (dato de safetensors no concluyente) | no disponible | apache-2.0 | GGUF |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | apache-2.0 | safetensors, GGUF |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens | licencia propia de DeepSeek | safetensors, GGUF |
| StarCoder2-3B | 3B | 16.384 tokens | BigCode OpenRAIL-M | safetensors, GGUF |

La principal ventaja competitiva de este repositorio es el catalogo de cuantizaciones con imatrix, que cubre desde IQ1_S hasta Q6_K, mas amplio que el de muchas publicaciones equivalentes y con variantes de muy baja precision utiles para entornos con memoria muy restringida. La ausencia de benchmarks publicados impide comparar calidad de generacion de codigo.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible estimar la calidad real en generacion de codigo, razonamiento o matematicas antes de evaluarla por cuenta propia.
- Discrepancia en el recuento de parametros: los metadatos de safetensors aportados indican 774.438 parametros, mientras que el nombre del modelo sugiere 2B. Conviene verificar el modelo base antes de dimensionar la infraestructura.
- El repositorio tal como se ha descrito lista unicamente el fichero imatrix en su tabla de ficheros y declara un tamano de 0.0 GB; es posible que las cuantizaciones reales no esten disponibles en este repo y haya que acudir al repositorio de cuantizaciones estaticas.
- Riesgo de alucinacion: es un riesgo inherente a los modelos de lenguaje de este tamano, especialmente en explicaciones de APIs y en codigo de librerias poco frecuentes. Se recomienda validar la salida con tests antes de integrarla en produccion.
- Idiomas: solo se declara ingles; el soporte de chino aparece unicamente como etiqueta y no esta confirmado. El rendimiento en castellano no esta documentado.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de genero, raza o licencia de codigo. Existe riesgo de reproduccion de fragmentos de codigo con licencias restrictivas si el entrenamiento incluyo repositorios sin filtrado.
- Cuantizaciones muy agresivas: las variantes IQ2 e IQ1 degradan notablemente la coherencia en tareas de codigo; se desaconsejan para uso en produccion salvo que la restriccion de memoria sea absoluta.
- Licencia: el repositorio de cuantizacion declara apache-2.0, pero la licencia aplicable al modelo base debe confirmarse en su propio repositorio, ya que de ello depende el uso comercial.
- Sin soporte ni mantenimiento evidente: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni model card propia mas alla del texto generico del cuantizador.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/LycheeAI-coder-2b-II-pro-f16-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/LycheeAI-coder-2b-II-pro-f16-GGUF
- Modelo base: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-f16
- Pagina resumen del cuantizador para este modelo: https://hf.tst.eu/model#LycheeAI-coder-2b-II-pro-f16-i1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

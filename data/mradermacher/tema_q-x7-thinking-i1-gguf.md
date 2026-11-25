# mradermacher/Tema_Q-X7-Thinking-i1-GGUF

## Resumen

Tema_Q-X7-Thinking-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo temaq-org/Tema_Q-X7-Thinking. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y está pensado para ejecutar el modelo en llama.cpp y derivados (Ollama, LM Studio, etc.) sin necesidad de GPUs de datacenter. El modelo base cuenta con 35.505.251.456 parámetros (aproximadamente 35,5 mil millones), lo que lo sitúa en la franja de los modelos densos de gran tamano.

El modelo base se presenta como un transformer instruction-tuned, multilingüe (japonés, inglés y chino), orientado a uso agéntico y con una orientación explícita a la ausencia de censura (etiquetas "uncensored", "non-censored", "unfiltered"). Incorpora un modo de razonamiento ("Thinking") y, según la model card del cuantizador, es un modelo de visión: los ficheros mmproj, si existen, se distribuyen en el repositorio estático hermano.

La relevancia de esta ficha es práctica: permite desplegar un modelo de ~35B con modo thinking y supuestas capacidades de visión en hardware de consumo mediante cuantizaciones que van desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K). No obstante, la información pública disponible sobre el modelo base es muy escasa: no hay datos de benchmarks, ni de licencia, ni de composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (instruction-tuned); detalles internos no disponibles |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también se ofrecen cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | ja, en, zh |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repo | 279,2 GB |
| Fichero imatrix | Tema_Q-X7-Thinking.imatrix.gguf (0,3 GB) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer instruction-tuned con etiquetas de "agent", "ornith-1.5" y "ornith", lo que sugiere una línea de modelos propia del autor temaq-org, sin documentación pública accesible en los datos proporcionados. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco hay detalles sobre mecanismos de atención (lineal, decodificación especulativa u otras innovaciones).

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (fichero de importancia de matrices), lo que en la práctica mejora la calidad de los cuantos de baja precisión respecto a las cuantizaciones estáticas. La model card indica explícitamente que el modelo es de visión y que los ficheros mmproj, si los hay, residen en el repositorio estático (mradermacher/Tema_Q-X7-Thinking-GGUF). También se menciona que las cuantizaciones usan convert_type "hf" y quantize_version 2.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta "conversational").
- Modo de razonamiento explícito ("Thinking"), indicado en el nombre del modelo.
- Capacidades agénticas: la etiqueta "agent" sugiere soporte para flujos de trabajo con herramientas, aunque no se documenta formalmente el tool calling.
- Multilingüe en japonés, inglés y chino.
- Instruction-tuned: alineado para seguir instrucciones.
- Orientación "uncensored/unfiltered": menor rechazo a peticiones, según declara el autor.
- Visión: la model card del cuantizador lo describe como modelo de visión, con mmproj en el repositorio estático.
- No se documentan capacidades específicas de código, matemáticas ni audio.

## Casos de uso

- Asistente conversacional autoalojado en japonés, inglés o chino: con ~35B parámetros y cuantización i1-Q4_K_M (21,8 GB) puede desplegarse en una GPU de 24 GB o en dos de 16 GB, ofreciendo conversaciones multi-turno sin depender de APIs externas.
- Razonamiento en modo thinking para tareas de análisis: el modo de razonamiento permite generar cadenas de pensamiento antes de la respuesta, útil en resolución de problemas y planificación.
- Flujos agénticos locales: la etiqueta "agent" y el soporte de endpoints compatibles permiten integrarlo en orquestadores de agentes, aunque la ausencia de documentación sobre tool calling obliga a validar el formato de funciones manualmente.
- Procesamiento de documentos con imágenes: si se confirma la disponibilidad de mmproj en el repositorio estático, podría usarse para tareas de visión-lenguaje como descripción de imágenes o extracción de información, siempre con validación previa.
- Investigación sobre alineación y censura: al ser un modelo "uncensored", es útil para estudiar el comportamiento de modelos sin filtros de rechazo en entornos controlados y con revisión humana.
- Generación de contenido creativo multilingüe: para equipos que trabajan con contenido en japonés y chino, el soporte nativo de estos idiomas evita depender de traducciones intermedias.
- Despliegue en estaciones de trabajo sin conexión: los GGUF permiten ejecución en llama.cpp con CPU+GPU híbrido, útil en entornos air-gapped donde no se puede llamar a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamano del fichero, más overhead de contexto y KV cache):
  - i1-Q2_K: 13,3 GB (calidad baja; el autor recomienda IQ3_XXS en su lugar).
  - i1-IQ3_S / i1-IQ3_M: 15,7-15,9 GB.
  - i1-Q4_K_S / i1-Q4_K_M: 20,5-21,8 GB (el autor marca Q4_K_M como "fast, recommended").
  - i1-Q5_K_M: 25,4 GB.
  - i1-Q6_K: 29,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q5/Q6 con contexto largo; dos RTX 3090/4090 para Q5_K_M o Q6_K.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2 a Q4 en GPUs de 16-24 GB; Q5/Q6 requiere 24 GB con contexto corto o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (la etiqueta "endpoints_compatible" lo indica). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de ~35B en Q4_K_M en una RTX 4090 suele quedar limitado por ancho de banda de memoria, pero no se aportan cifras medidas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tema_Q-X7-Thinking (i1-GGUF) | ~35,5B | no disponible | no disponible | GGUF | Multilingüe ja/en/zh, modo thinking, visión declarada, uncensored |
| Modelos densos de ~30-35B en GGUF (familia genérica) | ~30-35B | variable | variable | GGUF | No se dispone de datos verificados de comparación para esta ficha |
| Alternativas MoE de ~30B activos | variable | variable | variable | GGUF/safetensors | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos concretos de la misma categoría; los datos de benchmarks del modelo base no están publicados en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: inherente a los modelos de ~35B sin datos de evaluación; el modo thinking no garantiza corrección factual.
- Orientación "uncensored": puede generar contenido inapropiado o dañino; requiere filtros y revisión humana en aplicaciones de cara al público.
- Cobertura idiomática limitada a ja, en y zh; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin validación empírica.
- Capacidad de visión no confirmada: la model card del cuantizador la menciona, pero los mmproj no están en este repositorio; hay que verificar el repositorio estático.
- Tool calling no documentado formalmente: la etiqueta "agent" no equivale a un formato de funciones verificado.
- Repositorio de 279,2 GB: la descarga completa es costosa; conviene bajar solo el cuanto necesario.
- Modelo con muy poca tracción (309 descargas, 1 like): comunidad pequeña, menor probabilidad de que los errores estén reportados.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Tema_Q-X7-Thinking-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Tema_Q-X7-Thinking-GGUF
- Modelo base: https://huggingface.co/temaq-org/Tema_Q-X7-Thinking
- Página de overview del cuantizador: https://hf.tst.eu/model#Tema_Q-X7-Thinking-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests

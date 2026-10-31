# mradermacher/MenteE-Code-3B-i1-GGUF

## Resumen

MenteE-Code-3B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo MenteE-Code-3B de MenteEAI, publicada por el cuantizador mradermacher. El modelo base es un modelo de código de aproximadamente 3.085 millones de parámetros, etiquetado con las capacidades de código, agentic, LoRA y SFT, orientado a tareas de programación y uso conversacional. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo, incluso en portátiles sin GPU dedicada, gracias a los formatos comprimidos que van desde IQ1_S (0,9 GB) hasta Q6_K (2,6 GB).

La relevancia de esta ficha radica en la disponibilidad de cuantizaciones imatrix, que en tamaños bajos suelen ofrecer mejor calidad que las cuantizaciones estáticas equivalentes. El modelo base, MenteEAI/MenteE-Code-3B, está publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones relevantes. No se ha publicado información detallada sobre la arquitectura base, la ventana de contexto ni los datos de entrenamiento en la model card del repositorio original consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según la librería transformers) |
| Parametros totales | 3.085.938.688 (dato real de safetensors) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | inglés (en) y código |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo base. Lo único que se puede afirmar con certeza es que se trata de un modelo de unos 3.086 millones de parámetros distribuido en formato safetensors y compatible con la librería transformers, convertido a GGUF mediante el flujo de trabajo estándar de llama.cpp (convert_type: hf). Los metadatos del modelo base indican el uso de un adapter LoRA y un proceso de fine-tuning supervisado (SFT), lo que sugiere que MenteE-Code-3B es un modelo base ajustado con LoRA para tareas de código y comportamiento agéntico.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre técnicas destacables como decodificación especulativa o mecanismos de atención alternativos. Tampoco se especifica el modelo fundacional del que parte MenteE-Code-3B, por lo que cualquier afirmación sobre su procedencia sería especulativa.

## Capacidades

- Generación de código: el modelo está etiquetado con la tag "code" y su nombre indica especialización en programación.
- Comportamiento agéntico: la tag "agentic" sugiere entrenamiento orientado a flujos de trabajo con herramientas y tareas multi-paso, aunque no hay documentación que confirme soporte formal de tool calling.
- Uso conversacional: el repositorio está etiquetado como "conversational", por lo que puede emplearse en diálogos multi-turno.
- Fine-tuning mediante LoRA y SFT: el modelo base incorpora un adapter LoRA entrenado con SFT.
- Idioma: optimizado para inglés y código; no hay evidencia de soporte multilingüe amplio ni de castellano.
- No hay evidencia de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de código local en portátiles: con la cuantización Q4_K_M (2,0 GB) el modelo cabe en la RAM de casi cualquier portátil moderno y puede servir como autocompletador o asistente de consultas de programación sin conexión.
- Agentes de desarrollo en entornos restringidos: su etiqueta "agentic" lo hace candidato para pequeños agentes de revisión de código o generación de scripts que deben ejecutarse en máquinas sin GPU, aprovechando llama.cpp.
- Prototipado de pipelines de inferencia en CPU: el tamaño reducido (0,9-2,6 GB según cuantización) permite integrarlo en pruebas de concepto de servicios de LLM locales sin coste de infraestructura.
- Generación de documentación técnica: puede usarse para explicar fragmentos de código y redactar comentarios o documentación en inglés dentro de repositorios de software.
- Fine-tuning adicional de bajo coste: al ser un modelo de 3B con licencia Apache 2.0, es adecuado como punto de partida para ajustes posteriores (LoRA) en dominios de código específicos.
- Ejecución en dispositivos edge: las cuantizaciones IQ1_S/IQ1_M (0,9-1,0 GB) permiten experimentos en hardware muy limitado, aunque con pérdida de calidad notable.
- Comparativas de cuantización: el archivo imatrix incluido (0,1 GB) permite a investigadores generar sus propias cuantizaciones y estudiar el impacto de la cuantización en modelos de código pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 0,9 GB (IQ1_S) hasta 2,6 GB (Q6_K) solo de pesos; se recomienda añadir margen para la KV cache según la longitud de contexto. La cuantización Q4_K_M ocupa unos 2,0 GB.
- GPU recomendadas: no es necesario disponer de GPU; el modelo es plenamente ejecutable en CPU. Con GPU, cualquier tarjeta con 4 GB o más de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores) permite offload completo del modelo.
- Consumer GPUs: cabe íntegramente en prácticamente cualquier GPU de consumo moderna (4 GB de VRAM o más) en todas las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. No es un despliegue natural para vLLM o TGI, que no consumen GGUF directamente.
- Latencia y throughput: no disponibles; al ser un modelo de 3B cuantizado, se espera inferencia fluida en CPU moderna (varias decenas de tokens por segundo), pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| MenteE-Code-3B (esta ficha) | 3.086 M | GGUF imatrix | Apache 2.0 | Codigo, agentic |
| Qwen2.5-Coder-3B-Instruct | 3.090 M | safetensors, GGUF (terceros) | Qwen Research (uso comercial permitido con condiciones) | Codigo |
| Phi-3-mini-4k-instruct | 3.820 M | safetensors, GGUF (terceros) | MIT | Uso general, codigo |
| Stable Code 3B | 2.796 M | safetensors, GGUF (terceros) | Stable Code 3B (no comercial sin licencia) | Codigo |

Nota: los datos de rendimiento de estas alternativas no se comparan aquí porque no hay benchmarks publicados para MenteE-Code-3B en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al tratarse de un modelo SFT especializado en código y entrenado en inglés, puede rendir peor en otros idiomas, incluido el castellano.
- Riesgo de alucinación: no evaluado públicamente; como todo modelo de código pequeño, puede generar APIs, funciones o bibliotecas inexistentes, por lo que conviene revisar y probar todo el código generado.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el soporte de idiomas declarado es únicamente inglés y código.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución; no se identifican restricciones relevantes.
- Caveats de cuantización: las cuantizaciones IQ1_S, IQ1_M y las de la familia Q2 presentan degradación de calidad significativa (el propio autor las marca como "for the desperate" o "very low quality"); se recomienda Q4_K_M como punto de equilibrio entre tamaño, velocidad y calidad.
- Producción: la falta de documentación oficial del modelo base (contexto, plantilla de chat, capacidades de tool calling) exige validación propia antes de cualquier despliegue en producción.
- Este repositorio es una cuantización de terceros (mradermacher), no el modelo oficial de MenteEAI; para soporte del modelo en sí debe acudirse al repositorio base.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/MenteE-Code-3B-i1-GGUF
- Modelo base: https://huggingface.co/MenteEAI/MenteE-Code-3B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/MenteE-Code-3B-GGUF
- Visión general de descargas del autor: https://hf.tst.eu/model#MenteE-Code-3B-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

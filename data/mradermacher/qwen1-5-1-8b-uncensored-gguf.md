# mradermacher/Qwen1.5-1.8B-Uncensored-GGUF

## Resumen

Qwen1.5-1.8B-Uncensored-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicadas por mradermacher a partir de KhanhLinh1160/Qwen1.5-1.8B-Uncensored, un ajuste del modelo Qwen1.5-1.8B de Alibaba Cloud. El modelo subyacente tiene 1.836.828.672 parámetros (dato declarado en los safetensors del repositorio) y está etiquetado como conversacional y en inglés. El repositorio no entrena ni modifica pesos: únicamente recomprime el modelo en 12 variantes GGUF con el objetivo de ejecutarlo en llama.cpp y herramientas compatibles.

La relevancia práctica de esta publicación es su huella: los archivos van de 0,9 GB (Q2_K) a 3,8 GB (f16), lo que permite ejecutar un modelo de casi 1,8B parámetros en CPU, en portátiles sin GPU dedicada o en GPUs de gama de entrada. La etiqueta «uncensored» indica que el ajuste del modelo base relajó o eliminó los mecanismos de rechazo, lo que amplía el rango de respuestas admitidas pero también suprime buena parte de las salvaguardas del modelo original.

Hay que tener en cuenta que la model card no declara licencia, pipeline ni detalles de entrenamiento, y que el repositorio registra 0 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que no existe validación comunitaria de las cuantizaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen1.5); no detallada en la model card del repositorio |
| Parametros totales | 1.836.828.672 (según safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en el repositorio; el modelo base de la familia Qwen1.5-1.8B declara 32.768 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible en el repositorio (la model card no la declara) |
| Formato de pesos | GGUF (12 archivos; repositorio de 17,3 GB en total) |
| Modelo base | KhanhLinh1160/Qwen1.5-1.8B-Uncensored |
| Cuantizado por | mradermacher |
| Tipo de cuantizacion | Estática (quantize_version 2, output_tensor_quantised 1, convert_type hf); no hay quants imatrix/weighted |
| Tamano del repositorio | 17,3 GB |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La model card del repositorio no aporta ninguna información sobre arquitectura, composición del dataset, número de tokens de entrenamiento ni sobre si hubo RLHF, DPO u otro tipo de alineamiento. Se trata, en esencia, de un repositorio de conversión de formato: los únicos metadatos técnicos son los parámetros de la herramienta de cuantización (cuantización estática de tensores de salida, conversión desde pesos HuggingFace, versión 2 del cuantizador) y la lista de 12 variantes generadas.

Por herencia del modelo base Qwen1.5-1.8B, la arquitectura corresponde a un transformer decoder-only de la familia Qwen1.5, con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención con consultas agrupadas (GQA). Estos datos corresponden a la documentación pública de la familia Qwen1.5 y no están confirmados en el repositorio analizado, por lo que conviene verificarlos contra la configuración del modelo base en HuggingFace. Tampoco se documenta la innovación técnica más relevante del ajuste «uncensored» (qué dataset de desalineamiento se usó, cuántos pasos de fine-tuning, qué técnica de entrenamiento), algo crítico porque ese proceso condiciona por completo el comportamiento del modelo.

## Capacidades

- Generación de texto en inglés: continuación de texto, respuesta a instrucciones y conversación multi-turno.
- Formato conversacional: el repositorio está etiquetado como `conversational` y `endpoints_compatible`, lo que indica compatibilidad con plantillas de chat.
- Ejecución local en CPU: al estar en GGUF, funciona con llama.cpp y derivados sin necesidad de GPU.
- Variantes de compromiso calidad/tamaño: 12 cuantizaciones permiten elegir entre 0,9 GB y 3,8 GB según el hardware disponible.
- Comportamiento sin filtros de rechazo: el ajuste «uncensored» responde a peticiones que el modelo original probablemente rechazaría.
- Soporte de tool calling / function calling: no documentado en la model card. No se debe asumir que existe.
- Soporte de agentes y razonamiento multi-paso: no documentado. El tamaño de 1,8B limita seriamente este tipo de tareas.
- Capacidades multilingües: no. El repositorio declara únicamente `en`.
- Capacidades especiales (modo thinking, visión, audio): no documentadas, no disponibles.

## Casos de uso

- Chat local sin conexión: un asistente personal ejecutado en un portátil con llama.cpp u Ollama, cargando el cuantizado Q4_K_M de 1,3 GB en RAM o VRAM. Es adecuado porque el modelo completo cabe en memoria de sistemas modestos y no requiere red.
- Despliegue en dispositivos edge o SBC: con el cuantizado Q2_K (0,9 GB) o Q3_K_S (1,1 GB) se puede servir el modelo en una Raspberry Pi o en un mini-PC industrial con 4 GB de RAM, siempre asumiendo la pérdida de calidad de estas variantes.
- Generación de texto creativo sin restricciones temáticas: el ajuste «uncensored» responde a peticiones de ficción con violencia, contenido adulto o temas sensibles que un modelo alineado rechazaría, lo que resulta útil para escritura de narrativa y guiones.
- Generación masiva de datos sintéticos en inglés: al ser un modelo de 1,8B con cuantizaciones de menos de 2 GB, se pueden levantar varias instancias en paralelo para producir corpus de texto o pares pregunta-respuesta a bajo coste, aceptando que la calidad será inferior a la de modelos de 7B o superiores.
- Etiquetado y clasificación de texto a escala: tareas simples (categorización de tickets, extracción de intención, filtrado por temática) donde la latencia baja y el coste por token importan más que el razonamiento complejo.
- Preajuste y pruebas de concepto de pipelines: validar una arquitectura de aplicación (prompt, formato de salida, integración con llama-cpp-python) antes de migrar a un modelo mayor, ya que el coste de iteración es muy bajo.
- Investigación en seguridad y red teaming: el modelo sirve como caso de estudio de los efectos del desalineamiento en modelos pequeños, comparando su tasa de cumplimiento de peticiones dañinas frente a Qwen1.5-1.8B original.
- Fine-tuning y destilación sobre una base pequeña: los pesos en GGUF no son aptos para entrenar, pero el modelo base KhanhLinh1160 sí puede usarse como punto de partida para LoRA en un único GPU de 8-12 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MT-Bench u otras), ni comparaciones con el modelo del que deriva. Tampoco hay mediciones de perplejidad por tipo de cuantización: el autor enlaza un gráfico genérico de la relación entre tipo de cuantización y perplejidad, pero no aporta valores propios.

## Requisitos de hardware

- VRAM/RAM estimada en inferencia (tamaño del archivo más un margen de 0,3 a 1 GB según contexto y backend):
  - Q2_K: 0,9 GB de archivo; en torno a 1,1-1,5 GB en ejecución.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: 1,1-1,2 GB de archivo.
  - Q4_K_S / Q4_K_M: 1,3 GB de archivo; recomendados por el autor como «rápidos».
  - Q5_K_S / Q5_K_M: 1,4-1,5 GB.
  - Q6_K: 1,7 GB.
  - Q8_0: 2,1 GB.
  - f16: 3,8 GB (16 bits por peso; el autor lo califica de «excesivo»).
- El consumo real depende de la caché KV, cuyo tamaño no se puede calcular con exactitud porque el repositorio no documenta el número de capas ni de cabezas KV del modelo base. A contexto largo la caché puede superar el tamaño de los propios pesos.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB pueden cargar Q4_K_M o Q5_K_M completos en VRAM. La variante f16 de 3,8 GB también entra en GPUs de 6 GB o más.
- GPU profesionales: no son necesarias para un modelo de este tamaño; A100, H100 o L40S solo tendrían sentido para servir muchas instancias simultáneas.
- CPU: cualquier procesador x86-64 o ARM con AVX2, AVX-512 o NEON puede ejecutar el modelo; con 4 GB de RAM libre es suficiente para las cuantizaciones intermedias.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (mediante Modelfile apuntando al GGUF), LM Studio, Jan, kobold.cpp y text-generation-webui con el cargador llama.cpp. vLLM tiene soporte GGUF experimental y limitado; TGI no soporta GGUF de forma nativa. El repositorio está etiquetado como `endpoints_compatible`, lo que facilita su uso en entornos de inferencia compatibles con la API de OpenAI.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen1.5-1.8B-Uncensored-GGUF (este) | 1,84B | No declarado en el repo; 32.768 en la familia Qwen1.5-1.8B | No disponible en el repositorio | GGUF (12 variantes) | Ajuste sin filtros de rechazo; sin benchmarks publicados; 0 descargas |
| Qwen1.5-1.8B (base de la familia) | 1,84B | 32.768 | Licencia Qwen (Tongyi Qianwen) | safetensors, GGUF (comunidad) | Modelo alineado con rechazos; ampliamente evaluado en la documentación oficial |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 | Apache-2.0 | safetensors, GGUF | Licencia permisiva y comunidad amplia; contexto muy inferior |
| Gemma-2B | 2B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Mayor contexto que TinyLlama; licencia con restricciones de uso |
| Phi-2 | 2,7B | 2.048 | MIT | safetensors, GGUF (comunidad) | Buen rendimiento en razonamiento para su tamaño; licencia permisiva y contexto corto |

No se dispone de cifras de benchmarks de este repositorio, por lo que la comparación de rendimiento entre estas opciones no se puede sustanciar con datos. La diferencia principal de esta ficha frente a las alternativas es el desalineamiento deliberado y la disponibilidad de 12 variantes GGUF, no una ventaja medida en calidad.

## Limitaciones y advertencias

- Modelo «uncensored»: el ajuste elimina o relaja los rechazos, por lo que puede generar contenido ofensivo, violento, sexual, ilegal o peligroso. No es apto para aplicaciones de cara al público sin filtros externos.
- Sesgos: no hay ninguna evaluación de sesgo publicada. Al derivar de Qwen1.5 y de un ajuste sin datos documentados, los sesgos del modelo base pueden verse amplificados por el fine-tuning.
- Alucinación: con 1,8B parámetros la tasa de invención de hechos es alta, especialmente en preguntas factuales, matemáticas y razonamiento multi-paso. No se debe usar como fuente de verdad sin verificación.
- Idioma: solo inglés. No hay evidencia de competencia en castellano ni en otros idiomas, y el vocabulario del modelo base no está optimizado para ello.
- Licencia: no declarada en el repositorio. Antes de cualquier uso comercial hay que consultar la licencia del modelo base (KhanhLinh1160/Qwen1.5-1.8B-Uncensored) y la de la familia Qwen1.5 original, que no es Apache-2.0 para todos los tamaños. Sin esa confirmación, el uso comercial queda en terreno jurídico indeterminado.
- Cuantizaciones de baja precisión: Q2_K, Q3_K_* y IQ4_XS degradan de forma notable la coherencia. El propio autor marca Q3_K_M como «lower quality» y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Ausencia de quants imatrix/weighted: el autor indica que no están disponibles y que podrían no llegar a estarlo, lo que limita la opción de mejorar la relación calidad/tamaño en las cuantizaciones pequeñas.
- Riesgo de formato conversacional: al no documentarse la plantilla de chat exacta, es probable que haya que probar varias plantillas (ChatML, etc.) para obtener respuestas coherentes.
- Sin validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta. No hay informes de terceros sobre la calidad real de estas cuantizaciones.
- Cadena de custodia opaca: al ser una cuantización de un modelo ya ajustado por un tercero, no hay trazabilidad completa entre Qwen1.5-1.8B original y el comportamiento final.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-26) y la ausencia de `pipeline` dificultan determinar el estado real y la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen1.5-1.8B-Uncensored-GGUF
- Modelo base de la cuantización: https://huggingface.co/KhanhLinh1160/Qwen1.5-1.8B-Uncensored
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Qwen1.5-1.8B-Uncensored-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede los recursos al autor: https://www.nethype.de/
- Familia Qwen1.5 de Alibaba Cloud (referencia de la arquitectura, no incluida en la información proporcionada): https://huggingface.co/Qwen/Qwen1.5-1.8B

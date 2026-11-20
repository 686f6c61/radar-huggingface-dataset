# mradermacher/xailon-parser-0.8b-GGUF

## Resumen

xailon-parser-0.8b es un modelo de 752.393.024 parámetros (aproximadamente 0,8 mil millones) desarrollado por infinialabs-ai y cuantizado a GGUF por mradermacher. Está especializado en tareas de OCR y análisis de documentos (document parsing), con capacidades declaradas para extraer información estructurada de tablas y gráficos. El modelo base es `infinialabs-ai/xailon-parser-0.8b` y esta versión proporciona únicamente pesos cuantizados en formato GGUF para inferencia eficiente en CPU y GPU de consumo.

La relevancia de este modelo radica en su tamaño reducido (menos de 1000 millones de parámetros), lo que permite desplegarlo en hardware modesto manteniendo, según la model card, capacidades específicas de parsing documental. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales. El modelo está etiquetado para su uso con vLLM y transformers, y soporta únicamente el idioma inglés.

No se dispone de información sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks en la información proporcionada. La model card del cuantizador se limita a listar los ficheros GGUF disponibles y a remitir al modelo base para detalles técnicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El modelo base es `infinialabs-ai/xailon-parser-0.8b`, del que no se detallan en la información proporcionada ni el tipo de transformer, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio indican que el modelo está orientado a OCR, document parsing, charts y tables, lo que sugiere un entrenamiento específico para tareas de extracción de información estructurada a partir de imágenes de documentos, pero no se confirma ningún detalle técnico adicional.

Esta versión concreta es una cuantización estática realizada por mradermacher mediante el pipeline de conversión a GGUF (convert_type: hf). No se han generado cuantizaciones ponderadas con imatrix según la model card, y el autor indica que no tiene previsto generarlas salvo petición explícita en la sección de discusión comunitaria.

## Capacidades

- OCR y parsing de documentos: el modelo está etiquetado explícitamente para tareas de reconocimiento óptico de caracteres y extracción de estructura documental.
- Extracción de tablas: capacidad declarada mediante la etiqueta `tables`.
- Interpretación de gráficos: capacidad declarada mediante la etiqueta `charts`.
- Conversación: el repositorio incluye la etiqueta `conversational`, lo que sugiere soporte de formato de chat multi-turno, aunque no se detalla el template.
- Compatibilidad con vLLM: etiquetado para despliegue con vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible; aunque las tareas de OCR implican procesamiento de imágenes, no se confirma la modalidad de entrada en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede extraer campos estructurados (importes, fechas, líneas de detalle) de documentos escaneados, aprovechando su especialización en parsing documental y su reducido tamaño para ejecutarse en servidores modestos.
- Extracción de tablas de informes financieros: dado su etiquetado específico para tablas, puede convertir tablas presentes en PDF o imágenes a formatos estructurados como CSV o JSON, integrándose en pipelines de análisis de datos.
- Procesamiento de gráficos en publicaciones: la etiqueta `charts` sugiere capacidad para interpretar gráficos en documentos, útil en la extracción de series de datos de informes sectoriales o académicos.
- Pipeline de ingesta documental en empresa: al ser un modelo de menos de 1000 millones de parámetros con cuantizaciones desde 0,5 GB, puede desplegarse en contenedores con recursos limitados para preprocesar grandes volúmenes de documentos antes de pasarlos a modelos mayores.
- Automatización de archivo y clasificación: combinado con OCR previo, puede estructurar el contenido de documentos históricos o administrativos en inglés para su indexación y búsqueda.
- Prototipado rápido en local: gracias a las cuantizaciones Q4_K_M y Q4_K_S (0,6 GB) y a la compatibilidad con llama.cpp/Ollama, es adecuado para pruebas de concepto en portátiles sin GPU dedicada.
- Validación en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de atribución copyleft, lo que facilita su uso en SaaS de procesamiento documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 0,9 GB (Q8_0) para los pesos cuantizados; la cuantización f16 ocupa 1,6 GB. A esto hay que añadir la memoria para el contexto KV, cuyo tamaño no puede calcularse sin conocer la longitud de contexto y la configuración de cabezas de atención.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones Q4/Q5/Q6. Para f16 se recomienda al menos 3-4 GB de VRAM. No se dispone de datos específicos de rendimiento en A100, H100 o RTX 4090.
- GPU de consumo: cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores. También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y vLLM según la etiqueta del repositorio (aunque vLLM requiere normalmente pesos en safetensors o AWQ, no GGUF; verificar compatibilidad). El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Para un modelo de 0,75 mil millones de parámetros en Q4_K_M, se espera un throughput alto en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se conocen los benchmarks del modelo ni sus especificaciones de contexto. Se indica a continuación una comparación estructural mínima con alternativas genéricas de tamaño similar, marcando los datos no disponibles:

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| xailon-parser-0.8b (esta ficha) | 752 M | no disponible | Apache 2.0 | OCR / document parsing | GGUF en HF |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (según documentación pública del modelo) | Apache 2.0 | propósito general | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8 192 tokens (según documentación pública del modelo) | Apache 2.0 | propósito general | safetensors, GGUF |
| Florence-2-base | 232 M | no disponible | MIT | visión / OCR | safetensors |

Nota: los datos de los modelos comparativos provienen de conocimiento general público y no de la información proporcionada en esta ficha; deben verificarse en sus respectivas model cards. No se dispone de comparación de rendimiento porque no hay benchmarks publicados de xailon-parser-0.8b en la información disponible.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés, por lo que su uso con documentos en castellano u otros idiomas no está garantizado y probablemente degrade su precisión.
- Ausencia de benchmarks: no hay métricas publicadas de precisión en OCR, extracción de tablas o gráficos, lo que impide evaluar su calidad frente a alternativas antes de desplegarlo.
- Arquitectura y contexto desconocidos: se desconoce la longitud máxima de contexto y si el modelo procesa imágenes directamente o solo texto derivado de OCR, lo que afecta al diseño del pipeline.
- Riesgo de alucinación: como todo modelo generativo, puede inventar campos o valores en la extracción estructurada; se recomienda validación posterior y no confiar en su salida sin comprobación en entornos de producción críticos.
- Sesgos: no se documenta ningún análisis de sesgos; al entrenarse presumiblemente con documentos en inglés, puede tener peor rendimiento en dominios no representados.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el cuantizador no ofrece garantías sobre el modelo base; conviene revisar la model card del modelo original por si añade condiciones.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la calidad en tareas de extracción precisa; se recomienda Q4_K_M o superior para producción.
- Compatibilidad con vLLM: la etiqueta indica vLLM, pero los ficheros GGUF no son el formato nativo de vLLM; habría que usar el modelo base en safetensors o convertir a otro formato.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/xailon-parser-0.8b-GGUF
- Modelo base: https://huggingface.co/infinialabs-ai/xailon-parser-0.8b
- Página de descargas del cuantizador: https://hf.tst.eu/model#xailon-parser-0.8b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/

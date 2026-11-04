# mradermacher/magibu-128k-muon-32k-GGUF

## Resumen

magibu-128k-muon-32k-GGUF es la version cuantizada en formato GGUF del modelo alibayram/magibu-128k-muon-32k, publicada por mradermacher. Se trata de una conversión estática a GGUF pensada para su uso con llama.cpp y runtimes compatibles, no de un modelo entrenado desde cero por el cuantizador. El modelo original tiene 11.262.717.696 parámetros (aproximadamente 11,26 mil millones) según los pesos en safetensors, y su nombre sugiere una ventana de contexto de 128k con un entrenamiento adicional o ajuste a 32k, aunque estos detalles no se confirman en la información disponible.

La relevancia de esta ficha es práctica: el repositorio ofrece una batería completa de cuantizaciones (desde Q2_K hasta Q8_0, además de IQ4_XS y ficheros mmproj multimodales) que permiten ejecutar un modelo de ~11B en hardware de consumo. El repo ocupa 79,2 GB, lo que incluye todas las variantes. No hay pipeline declarado, ni licencia especificada, ni resultados de benchmarks publicados en la información proporcionada, por lo que la evaluación debe hacerse con cautela.

El modelo está etiquetado únicamente para inglés (`en`) y con la etiqueta `conversational`. La existencia de ficheros `mmproj` sugiere capacidades multimodales en el modelo base, aunque no se detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; se infiere transformer por el formato de pesos y el uso de transformers) |
| Parametros totales | 11.262.717.696 (~11,26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; el nombre del modelo sugiere 128k y 32k, sin confirmación documental |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens vistos ni las técnicas de alineación (RLHF, DPO, etc.) empleadas en el modelo base alibayram/magibu-128k-muon-32k. La model card del repositorio GGUF es una plantilla estándar de mradermacher que solo documenta el proceso de cuantización, no el entrenamiento.

El nombre del modelo incluye los términos "muon" y "32k", que podrían referirse a un optimizador Muon y a una fase de ajuste con contexto de 32k, respectivamente, pero esto es una inferencia a partir del nombre y no está confirmado en la documentación. Los ficheros `mmproj` indican que el modelo base incorpora un proyector multimodal, presumiblemente para visión, aunque no se detalla qué modalidades cubre ni con qué resolución.

El proceso de cuantización es estático (no se han generado cuantizaciones con imatrix según el autor, que indica que "weighted/imatrix quants seem not to be available (by me) at this time"). Esto implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar más la calidad que sus equivalentes con imatrix.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline declarado en el modelo base apuntan a un uso orientado a diálogo.
- Capacidades multimodales: la presencia de ficheros `mmproj` (Q8_0 y f16) indica soporte de entrada de imágenes en el modelo base, aunque no se especifica el detalle.
- Contexto largo: el nombre sugiere ventanas de 128k y 32k, sin confirmación documental; debe validarse empíricamente.
- Idiomas: únicamente inglés según la etiqueta del repositorio.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking explícito: no disponible (no documentado).

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (7,0 GB) o Q5_K_M (8,1 GB), el modelo cabe en GPUs de consumo de 12-16 GB de VRAM, lo que permite ejecutar un modelo de ~11B en local sin infraestructura de servidor.
- Prototipado de asistentes conversacionales en inglés: la etiqueta `conversational` y el formato GGUF permiten integrarlo rápidamente en llama.cpp u Ollama para validar flujos de diálogo antes de pasar a un modelo mayor.
- Procesamiento de documentos largos: si se confirma la ventana de 128k, sería adecuado para resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada; conviene verificar la calidad en contextos muy largos, ya que no hay benchmarks.
- Experimentación multimodal: los ficheros `mmproj` permiten probar entrada de imágenes en llama.cpp, útil para tareas de descripción de imágenes o extracción de información visual en prototipos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad entre Q2_K y Q8_0 en una tarea concreta.
- Investigación sobre optimizadores de entrenamiento: si el sufijo "muon" se refiere al optimizador Muon, el modelo puede servir como caso de estudio para comparar el comportamiento de modelos entrenados con este optimizador frente a AdamW, siempre que se localice la documentación del modelo base.
- Fine-tuning sobre la base: al estar disponible el modelo base en safetensors, es posible hacer LoRA o QLoRA sobre él y luego cuantizar de nuevo a GGUF para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K (4,5 GB): ~5-6 GB de VRAM con overhead de contexto.
  - Q3_K_M (5,7 GB): ~6-7 GB.
  - IQ4_XS (6,3 GB) y Q4_K_S (6,6 GB): ~7-8 GB.
  - Q4_K_M (7,0 GB): ~8-9 GB, recomendado para GPUs de 12 GB.
  - Q5_K_M (8,1 GB): ~9-10 GB.
  - Q6_K (9,3 GB): ~10-11 GB.
  - Q8_0 (12,1 GB): ~13-14 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100 para las variantes de mayor precisión o para servir a varios usuarios.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en GPUs de 12-16 GB; Q6_K y Q8_0 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM y TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parámetros y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| magibu-128k-muon-32k-GGUF | ~11,26B | no confirmado (nombre sugiere 128k/32k) | no disponible | GGUF | Cuantizaciones estáticas, sin imatrix |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Referencia de la misma clase de tamaño; benchmarks públicos |
| Mistral 7B Instruct | 7,3B | 32k | Apache 2.0 | safetensors, GGUF | Licencia permisiva, ampliamente desplegado |
| Qwen2.5 14B Instruct | 14,7B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamaño con licencia permisiva |

La comparación de rendimiento con estos modelos no es posible sin benchmarks publicados del modelo evaluado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sin benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real es desconocida.
- Cuantizaciones estáticas: la ausencia de cuantizaciones con imatrix puede provocar una degradación de calidad mayor de lo habitual en Q2_K, Q3_K e IQ4_XS.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica no se puede cuantificar.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden identificar sesgos conocidos.
- Contexto: la ventana de 128k/32k no está confirmada en la documentación; debe validarse antes de confiar en contextos largos.
- Multimodalidad: los ficheros `mmproj` existen, pero no se documenta qué tareas visuales soporta ni con qué calidad.
- Repositorio con pocas descargas (71) y cero likes: ecosistema de validación muy limitado; no hay retroalimentación de la comunidad.
- Fecha de creación futura en los metadatos (2026-01-14): conviene verificar la integridad y procedencia de los ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/magibu-128k-muon-32k-GGUF
- Modelo base: https://huggingface.co/alibayram/magibu-128k-muon-32k
- Página de descargas del cuantizador: https://hf.tst.eu/model#magibu-128k-muon-32k-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

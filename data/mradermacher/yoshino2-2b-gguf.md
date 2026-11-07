# mradermacher/Yoshino2-2B-GGUF

## Resumen

Yoshino2-2B-GGUF es un conjunto de cuantizaciones estáticas en formato GGUF del modelo base en5yme/Yoshino2-2B, publicadas por mradermacher. El modelo original es un modelo de 1.942.653.248 parámetros (aproximadamente 2B) orientado a razonamiento y destilación, entrenado sobre el dataset en5yme/Nemotron-Lightning-30B-A3B-Distill. Este repositorio no contiene los pesos originales en safetensors, sino las versiones cuantizadas listas para su uso con llama.cpp y herramientas compatibles.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de razonamiento de ~2B parámetros en hardware de consumo gracias a los cuantizados de 1,1 a 4,0 GB. Al estar etiquetado con `endpoints_compatible` y `conversational`, está pensado para inferencia local y despliegues ligeros. La licencia MIT facilita su uso comercial y su integración en productos.

No se dispone de información publicada sobre arquitectura interna, longitud de contexto ni proceso de entrenamiento más allá de las etiquetas de destilación y razonamiento y del dataset de destilación citado. Los datos que siguen se limitan a lo declarado en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como transformers; sin detalle de arquitectura) |
| Parametros totales | 1.942.653.248 (~2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; adicionalmente mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors solo en el modelo base original) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base en5yme/Yoshino2-2B en los datos disponibles. Los metadatos lo describen como un modelo de tipo transformer compatible con la librería `transformers` y con aproximadamente 1.942 millones de parámetros. Las etiquetas `distillation` y `reasoning` indican que fue entrenado mediante destilación, presumiblemente a partir de un modelo mayor, y que está orientado a tareas de razonamiento.

El dataset de entrenamiento declarado es en5yme/Nemotron-Lightning-30B-A3B-Distill, lo que sugiere que el modelo base se destiló a partir de las salidas de un modelo Nemotron de 30B con arquitectura MoE (30B-A3B). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational`.
- Razonamiento: el modelo está etiquetado explícitamente con `reasoning`, lo que indica entrenamiento orientado a cadenas de razonamiento o tareas de lógica.
- Destilación de conocimiento: derivado de un modelo mayor mediante el dataset Nemotron-Lightning-30B-A3B-Distill.
- Soporte multimodal potencial: el repositorio incluye archivos `mmproj` (Q8_0 y f16), lo que sugiere la posibilidad de entrada visual si el modelo base lo soporta, aunque no se detalla en la información disponible.
- Idiomas: únicamente inglés declarado (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento local en hardware de consumo: con cuantizados Q4_K_M (1,4 GB) el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU, lo que permite prototipar tareas de razonamiento sin infraestructura en la nube.
- Asistentes conversacionales ligeros en inglés: el modelo está etiquetado como `conversational` y puede integrarse en aplicaciones de chat con llama.cpp u Ollama para conversaciones de dominio general en inglés.
- Destilación y experimentación académica: al ser un modelo de ~2B destilado de un Nemotron de 30B, sirve como caso de estudio para investigar la transferencia de capacidades de razonamiento desde modelos MoE grandes a modelos densos pequeños.
- Despliegue en entornos con recursos limitados: la licencia MIT y el formato GGUF permiten incrustar el modelo en aplicaciones de escritorio, dispositivos edge o contenedores sin dependencias de GPU de gama alta.
- Generación de datos sintéticos de razonamiento: el modelo puede emplearse para producir trazas de razonamiento en inglés que alimenten pipelines de entrenamiento de modelos menores.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización (de Q2_K a f16), lo que facilita estudios de degradación de calidad frente a tamaño en tareas de razonamiento.
- Pruebas de concepto multimodales: los archivos `mmproj` permiten experimentar con entrada de imagen en llama.cpp si el modelo base conserva dicha capacidad, aunque esto no está confirmado en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,1 GB (Q2_K) y 4,0 GB (f16) solo para los pesos; añadir aproximadamente 0,5-0,8 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizados Q4_K_M o superiores; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 pueden ejecutarlo con holgura, aunque el modelo es demasiado pequeño para aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; los cuantizados Q2_K y Q3_K_S (1,1 GB) permiten incluso ejecución en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo Hugging Face. No se documenta soporte explícito para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-GGUF (este) | ~2B | no disponible | MIT | GGUF | Destilado de Nemotron-Lightning-30B-A3B; solo inglés |
| mradermacher/continual-ai-2b-GGUF | ~2B | no disponible | no disponible | GGUF | Otra cuantización de un modelo de 2B del mismo autor de cuantizados |
| Modelo base en5yme/Yoshino2-2B | ~2B | no disponible | MIT | safetensors | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación de rendimiento con alternativas. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés (`language: en`); no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo destilado de un dataset no documentado, se recomienda evaluar sesgos antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado; los modelos de ~2B destilados para razonamiento suelen presentar alucinaciones en tareas de conocimiento factual.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo base y el dataset de destilación podrían tener condiciones adicionales no reflejadas en este repositorio.
- Cuantizaciones de baja calidad: los cuantizados Q2_K y Q3_K_M están marcados por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin cuantizados ponderados/imatrix: el autor indica que no hay cuantizados con imatrix disponibles en el momento de la publicación, lo que puede afectar a la calidad en comparación con otras publicaciones del mismo autor.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa.
- Soporte multimodal incierto: la presencia de archivos `mmproj` no confirma que el modelo base procese imágenes correctamente; no se documenta en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
- Página de descargas del autor: https://hf.tst.eu/model#Yoshino2-2B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# biscet/Whittle-35B-A3B-Vision

## Resumen

Whittle 35B-A3B Vision es un modelo de lenguaje y visión (VLM) de tipo denso, de aproximadamente 4B de parámetros, publicado por biscet bajo el paraguas del proyecto Model Improvement Lab. A pesar de que el nombre incluye "35B-A3B", este identificador hace referencia al modelo objetivo al que acompaña (Whittle 35B-A3B), no al tamaño real del modelo de visión: los pesos en safetensors suman 4.205.751.296 parámetros. Su función es actuar como "compañero visual": lee imágenes, capturas de pantalla, documentos y gráficos, y devuelve descripciones o respuestas en texto que después se pasan como contexto al modelo de razonamiento principal. Los dos modelos se ejecutan por separado.

El modelo se distribuye en dos formatos: un checkpoint completo en BF16 safetensors (8,68 GiB de pesos) para Transformers 5.19.0, y cinco cuantizaciones GGUF (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0) que requieren el proyector de visión compartido `mmproj` en F16 para llama.cpp b12359. Está pensado para inferencia local y despliegue en entornos con recursos limitados, ya que la cuantización Q4_K_M ocupa solo 2,55 GiB.

Se trata de una release comunitaria experimental (v1.0.1) orientada a investigación y evaluación, no a producción crítica. Su licencia Apache-2.0 y su soporte declarado de 201 idiomas y dialectos lo hacen atractivo para prototipos multilingües de comprensión visual, aunque la ausencia de benchmarks completos y de datos de entrenamiento detallados exige cautela antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model denso (familia transformer multimodal; detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 (aprox. 4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector de vision F16 compartido (`mmproj`) |
| Idiomas soportados | 201 idiomas y dialectos, segun declaracion upstream |
| Licencia | Apache-2.0 (con atribucion original en NOTICE) |
| Formato de pesos | safetensors (BF16) y GGUF |
| Pipeline | image-text-to-text |
| Entrada / salida | imagen + texto -> texto |
| Version | v1.0.1 |
| Runtime (GGUF) | llama.cpp b12359 |
| Runtime (safetensors) | Transformers 5.19.0 |
| Tamano del repo | 42,8 GB |
| Toolkit | Model Improvement Lab (github.com/biscet/Model-Improvement-Lab) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "4B-class dense vision-language model", es decir, un VLM denso que combina un codificador visual con un modelo de lenguaje para producir texto a partir de imágenes y texto de entrada. No se especifica en la documentación proporcionada el tipo concreto de codificador visual, la arquitectura exacta del componente de lenguaje ni el mecanismo de proyección multimodal; únicamente se indica que el proyector de visión se distribuye como un archivo F16 `mmproj` que debe acompañar a todas las cuantizaciones GGUF.

En cuanto al entrenamiento, la release incluye pesos preentrenados y cuantizaciones derivadas, y el autor afirma explicitamente que "no additional fine-tuning was performed" durante la publicación. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El modelo se presenta como un componente de un flujo de dos etapas: primero extrae texto de la imagen y luego ese texto se pasa como contexto al modelo Whittle 35B-A3B para razonamiento y tareas de seguimiento. La plantilla de chat incluye correcciones de compatibilidad de Unsloth para mensajes iniciales de sistema/desarrollador y llamadas a herramientas.

## Capacidades

- Generación de texto a partir de imágenes: descripción de imágenes (image captioning).
- Respuesta a preguntas visuales (VQA): preguntas y respuestas sobre el contenido de una imagen.
- Comprensión de documentos: preguntas sobre documentos escaneados o fotografías de documentos.
- Comprensión de gráficos: interpretación y respuesta a preguntas sobre charts y visualizaciones de datos.
- OCR: extracción de texto presente en imágenes.
- Comprensión de capturas de pantalla (screenshot understanding).
- Razonamiento visual (visual reasoning) según las etiquetas declaradas por el autor.
- Asistente multimodal conversacional (pipeline image-text-to-text).
- Soporte multilingüe declarado de 201 idiomas y dialectos.
- Plantilla de chat con compatibilidad para mensajes iniciales de sistema/desarrollador y tool calls.
- No se declara soporte de audio ni de otras modalidades distintas de imagen y texto.

## Casos de uso

- Extracción de texto de documentos escaneados: el modelo recibe la imagen de un documento y devuelve el texto reconocido (OCR), que después puede pasarse como contexto al modelo Whittle 35B-A3B para resumir, extraer campos o responder preguntas sobre el contenido.
- Respuesta a preguntas sobre gráficos en informes: se envía una captura de un chart y el modelo devuelve una descripción de ejes, series y tendencias, adecuada para alimentar un pipeline de análisis de datos o generación de informes.
- Comprensión de capturas de pantalla para soporte técnico: el modelo interpreta la captura de un error o de una interfaz y produce una descripción textual que un agente o un técnico puede usar para diagnosticar el problema.
- Accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla o para enriquecer contenido publicado, aprovechando la capacidad de image captioning y el soporte multilingüe.
- Moderación y catalogación de imágenes: clasificación y descripción automática de imágenes en un catálogo, con salida en texto que se indexa junto con los metadatos.
- Prototipos de asistentes multimodales locales: al caber en cuantización Q4_K_M en 2,55 GiB, permite montar un asistente visual en un equipo de consumo con llama.cpp, usando el modelo como etapa de percepción y un LLM mayor como etapa de razonamiento.
- Evaluación e investigación de VLMs: su licencia Apache-2.0 y su tamaño reducido lo hacen útil como banco de pruebas para comparar estrategias de cuantización o de prompting multimodal en investigación.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son comprobaciones diagnósticas sobre 40 peticiones de imagen, realizadas con el release inicial en safetensors y anteriores al cambio de plantilla; el autor advierte que no son puntuaciones de benchmark completas ni resultados de precisión para GGUF.

| Prueba | Muestra | Resultado |
|---|---|---|
| VQAv2 (exact match con respuesta mayoritaria) | 24 | 16/24 |
| ChartQA (relaxed accuracy) | 16 | 15/16 |
| Peticiones de imagen sin errores de inferencia | 40 | 40 |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos suman 8,68 GiB, más el proyector de visión y las activaciones; se recomienda una GPU con al menos 12-16 GB para margen operativo.
- VRAM estimada en GGUF Q8_0: 4,17 GiB de pesos más el `mmproj` F16 de 0,63 GiB; aproximadamente 5-6 GB en total.
- VRAM estimada en GGUF Q4_K_M: 2,55 GiB de pesos más 0,63 GiB de proyector; alrededor de 3,5-4 GB en total.
- VRAM estimada en GGUF Q3_K_M: 2,14 GiB de pesos más 0,63 GiB de proyector; alrededor de 3 GB en total.
- GPU recomendadas: no disponibles en la documentacion; por tamaño, el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, y en GPUs de datacenter como A100 o H100 sin problema de capacidad.
- Despliegue: llama.cpp b12359 para GGUF (cargando siempre el `mmproj` correspondiente) y Transformers 5.19.0 con `subfolder="safetensors"` para el checkpoint completo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El modelo está pensado para ejecutarse por separado del modelo Whittle 35B-A3B, por lo que en un flujo completo hay que sumar los requisitos de ambos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Whittle 35B-A3B Vision | ~4B (4.205.751.296) | no disponible | safetensors BF16, GGUF Q3-Q8 | Apache-2.0 | Release experimental v1.0.1; diagnosticos VQAv2 16/24 y ChartQA 15/16 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa fiable con otros VLMs de tamano o tarea similares; los datos de parametros, contexto y rendimiento de alternativas no estan disponibles en la documentacion consultada.

## Limitaciones y advertencias

- Release experimental: el autor la describe como "Experimental community release", destinada a investigación y evaluación, no a producción crítica.
- Ausencia de benchmarks completos: los únicos resultados son diagnosticos sobre 24 y 16 ejemplos, sin significacion estadistica suficiente para estimar el rendimiento real.
- Los diagnosticos publicados son del release inicial en safetensors, anteriores al cambio de plantilla, y no aplican a las cuantizaciones GGUF.
- No se documentan datos de entrenamiento, composicion del dataset ni procesos de alineacion (RLHF/DPO), lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion: al ser un modelo de descripcion y respuesta visual sin benchmarks publicados, las descripciones y respuestas pueden contener detalles no presentes en la imagen.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible; el soporte de 201 idiomas se declara "as declared upstream" y no se aportan metricas de calidad por idioma.
- Dependencia de runtime concreto: llama.cpp b12359 y Transformers 5.19.0; otras versiones pueden no ser compatibles.
- El proyector de vision `mmproj` en F16 es obligatorio con cada cuantizacion GGUF; omitirlo impide el funcionamiento multimodal.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion original indicada en NOTICE.
- El nombre "35B-A3B" puede inducir a error sobre el tamano real del modelo (4B); hay que revisar el identificador al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biscet/Whittle-35B-A3B-Vision
- Arbol de GGUF v1.0.1: https://huggingface.co/biscet/Whittle-35B-A3B-Vision/tree/v1.0.1/gguf
- Arbol de safetensors v1.0.1: https://huggingface.co/biscet/Whittle-35B-A3B-Vision/tree/v1.0.1/safetensors
- Release anterior v1.0.0: https://huggingface.co/biscet/Whittle-35B-A3B-Vision/tree/v1.0.0
- Guia de uso (docs/USAGE.md): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/docs/USAGE.md
- Notas de release (CHANGELOG.md): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/CHANGELOG.md
- Cobertura de idiomas (docs/LANGUAGES.md): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/docs/LANGUAGES.md
- Plantilla de chat (docs/CHAT_TEMPLATE.md): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/docs/CHAT_TEMPLATE.md
- Detalles de conversion GGUF (docs/GGUF.md): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/docs/GGUF.md
- Evaluacion (evaluation/EVALUATION.json): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/evaluation/EVALUATION.json
- Hashes (SHA256SUMS): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/SHA256SUMS
- Licencia (LICENSE): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/LICENSE
- Avisos de atribucion (NOTICE): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/blob/main/NOTICE
- Toolkit Model Improvement Lab: https://github.com/biscet/Model-Improvement-Lab
- Proyector de vision F16 (mmproj): https://huggingface.co/biscet/Whittle-35B-A3B-Vision/resolve/v1.0.1/gguf/mmproj-Whittle-35B-A3B-Vision-v1.0.1-F16.gguf?download=true

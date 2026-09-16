# DragonHunter2026/nessa_q6_lora

## Resumen

nessa_q6_lora es un adaptador LoRA publicado por el usuario DragonHunter2026 sobre el modelo base Qwen2.5-VL-7B-Instruct, en su variante cuantizada a 4 bits (unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit). Se trata, por tanto, de un modelo multimodal de imagen a texto: recibe imágenes junto con instrucciones en lenguaje natural y devuelve texto. El adaptador se distribuye en formato PEFT sobre safetensors y ocupa aproximadamente 0,2 GB, lo que lo hace muy ligero de almacenar y de transferir.

El modelo subyacente pertenece a la familia Qwen2.5-VL de Alibaba, con 7.000 millones de parámetros declarados en la propia model card del adaptador y una arquitectura transformer con torre de visión. El adaptador declara soporte únicamente para ruso (ru) y se publica bajo licencia Apache 2.0, sin restricciones adicionales indicadas por el autor.

Su relevancia práctica es limitada por el momento: no acumula descargas ni valoraciones, la model card es mínima y no publica composición del dataset, hiperparámetros de entrenamiento ni evaluaciones. Debe considerarse un experimento de ajuste fino de un único autor, útil como referencia para reproducir un pipeline de Unsloth sobre Qwen2.5-VL, pero no un modelo listo para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL (vision-language, image-text-to-text) |
| Parametros totales | no disponible (el modelo base declara 7.000 millones; el adaptador ocupa 0,2 GB en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha del adaptador (el modelo base referenciado está cuantizado en 4 bits, bnb-4bit) |
| Idiomas soportados | ru (ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit |
| Libreria | peft |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de PEFT: se congela el modelo base multimodal y se entrenan matrices de bajo rango insertadas en las capas del transformer, de modo que en inferencia hay que cargar primero Qwen2.5-VL-7B-Instruct y aplicar después el adaptador. La model card indica explícitamente que el entrenamiento se realizó con la librería Unsloth, orientada a reducir consumo de memoria y tiempo de ajuste fino, pero no detalla rangos LoRA, capas objetivo, tasa de aprendizaje, número de pasos ni épocas.

La información disponible no especifica volumen de tokens de entrenamiento, composición del dataset, resolución de imagen empleada, ni si hubo fases de RLHF, DPO o ajuste supervisado adicionales. Tampoco se documentan innovaciones técnicas propias más allá del uso de Unsloth sobre una base ya cuantizada a 4 bits. El modelo base, por su parte, aporta la torre de visión y el encoder de lenguaje de Qwen2.5-VL, con las capacidades multimodales heredadas de esa familia.

## Capacidades

- Generación de texto e imagen a texto sobre la base multimodal Qwen2.5-VL: descripción de imágenes, respuesta a preguntas visuales y lectura de texto presente en imágenes.
- Conversación multi-turno con contexto de imágenes, según el pipeline declarado (image-text-to-text, conversational).
- Comprensión de instrucciones en ruso: es el único idioma declarado en las etiquetas del repositorio.
- Capacidades heredadas del modelo base no verificadas en este adaptador: razonamiento, generación de código, matemáticas, tool calling y uso como agente no están documentadas en la model card.
- Las capacidades efectivas tras el ajuste fino (grado de olvido catastrófico, especialización real, calidad en ruso frente a la base) no están evaluadas ni documentadas.

## Casos de uso

- Digitalización de documentos en ruso: extracción de texto de facturas, contratos o formularios escaneados mediante el pipeline image-text-to-text, aprovechando el ajuste declarado al idioma. Requiere validación previa contra el modelo base sin adaptador.
- Descripción automática de imágenes (captioning) para catálogos y gestores de contenido en ruso, generando descripciones y metadatos a partir de fotografías de producto.
- Accesibilidad: generación de texto alternativo en ruso para imágenes en sitios web y aplicaciones, integrándose en un CMS mediante una llamada al endpoint multimodal.
- Atención al cliente con soporte visual: el usuario envía una captura de pantalla o una foto de un producto defectuoso y el sistema responde en ruso. La viabilidad depende del contexto real soportado, no publicado.
- Moderación asistida de contenido: clasificación y descripción de imágenes con texto superpuesto en ruso para colas de revisión humana, nunca como decisión automática sin supervisión.
- Asistencia en comercio electrónico: respuesta a preguntas del comprador sobre imágenes de producto (medidas, colores, etiquetas) en ruso, con salida en texto.
- Investigación y docencia: reproducción de experimentos de ajuste fino LoRA con Unsloth sobre una base cuantizada a 4 bits, sirviendo el adaptador como artefacto de partida o comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (MMLU, MMMU, HumanEval, GSM8K, DocVQA ni evaluaciones específicas en ruso), y el repositorio no registra descargas ni valoraciones que permitan inferir rendimiento de terceros. Tampoco se documentan latencia, throughput ni comparaciones con la base sin adaptador.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base multimodal de 7.000 millones de parámetros; la VRAM necesaria viene determinada por ese modelo base, no por el adaptador.
- Estimación orientativa para la base de 7B: en torno a 5-6 GB de VRAM en cuantización de 4 bits, 8-9 GB en 8 bits y 15-16 GB en FP16. Son estimaciones generales para un transformer de ese tamaño y no cifras publicadas por el autor.
- GPU de consumo: una RTX 3060 de 12 GB o una RTX 4070 deberían poder ejecutar la variante de 4 bits; una RTX 4090 de 24 GB permite 8 bits o FP16 con margen.
- GPU profesionales: A100 de 40/80 GB, H100 o L40S para despliegue concurrente en FP16/BF16 con varias peticiones simultáneas.
- Opciones de despliegue: transformers con peft para cargar el adaptador, vLLM o TGI para servir la base multimodal, y llama.cpp/Ollama si se convierte a GGUF (con soporte de visión limitado según la herramienta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nessa_q6_lora | Adaptador LoRA multimodal | no disponible (base de 7.000 millones) | no disponible | ru | Apache 2.0 | HuggingFace |
| Qwen2.5-VL-7B-Instruct | Modelo base multimodal | 7.000 millones (según la model card del adaptador) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Qwen2.5-VL-3B-Instruct | Alternativa más ligera de la misma familia | no verificado en la información proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| Qwen2.5-VL-72B-Instruct | Alternativa de mayor tamaño de la misma familia | no verificado en la información proporcionada | no disponible | no disponible | no disponible | HuggingFace |

No hay datos de benchmarks que permitan una comparación objetiva de rendimiento. La comparación estructural se limita a tamaño, licencia y disponibilidad; cualquier cifra de contexto o idioma de las alternativas debe consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni metodología de evaluación, lo que impide reproducir o auditar el ajuste.
- Sin adopción verificable: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia externa de calidad.
- Idioma único declarado (ru). No hay información sobre comportamiento en castellano, inglés u otros idiomas, y es probable que el ajuste degrade capacidades multilingües de la base.
- Riesgo de olvido catastrófico sobre las capacidades del modelo base (razonamiento, código, matemáticas, tool calling) no cuantificado.
- Riesgo de alucinación inherente a los modelos generativos multimodales, agravado por la ausencia de evaluaciones; no debe usarse en dominios críticos sin verificación humana.
- La base está cuantizada a 4 bits, lo que introduce pérdida de precisión adicional respecto a los pesos oficiales en FP16/BF16.
- Licencia Apache 2.0 declarada para el adaptador, pero conviene verificar los términos del modelo base y de cualquier dato de entrenamiento no documentado antes de un uso comercial.
- Longitud de contexto efectiva desconocida: no se puede planificar el tratamiento de documentos o conversaciones largas.
- Resolución y formato de imagen soportados no especificados.
- Ausencia total de benchmarks: cualquier afirmación de rendimiento en producción sería especulativa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/DragonHunter2026/nessa_q6_lora
- Modelo base referenciado: https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos trataban sobre normativa de tableros de madera y no guardan relación con el adaptador. No se han encontrado papers, blogs, repositorios ni demos adicionales.

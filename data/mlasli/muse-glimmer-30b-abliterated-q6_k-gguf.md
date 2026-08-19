# mlasli/Muse-Glimmer-30B-Abliterated-Q6_K-GGUF

## Resumen

Muse Glimmer 30B Abliterated Q6_K GGUF es una cuantización de 6 bits del modelo de lenguaje Muse Glimmer 30B, desarrollado por el usuario mlasli. El modelo base ha sido sometido a un proceso de "abliteration", una técnica de post-entrenamiento que modifica los pesos para suprimir el mecanismo de rechazo interno, reduciendo así la probabilidad de que el modelo se niegue a responder a ciertas instrucciones. Esta versión Q6_K ofrece un equilibrio entre calidad y tamaño, con aproximadamente 25 GB, lo que permite su ejecución en GPUs de 48 GB o incluso en sistemas con 64 GB de RAM mediante descarga parcial.

El modelo mantiene las capacidades del original, incluyendo generación de texto y soporte multimodal de visión cuando se combina con el proyector incluido. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia de este modelo radica en su naturaleza "abliterada", que lo hace útil para aplicaciones que requieren respuestas sin censura, aunque con las advertencias éticas correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP16 GGUF, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base (Muse Glimmer 30B). El proceso de abliteracion, descrito en la model card, consiste en recoger estados ocultos en la capa 33/52 (65% de profundidad) a partir de 256 pares de prompts dañinos e inofensivos, ejecutados en una GPU A100 de 80 GB. Se calcula la direccion de rechazo como la diferencia normalizada entre las medias de los estados ocultos, obteniendo una puntuacion de separacion de 86,34. Posteriormente, se resta α = 0,15 × (r ⊗ (W^T r)) de los pesos o_proj y down_proj en las 52 capas. Este procedimiento redujo la tasa de rechazo de 3/3 a 1/3 en prompts dañinos de prueba, manteniendo el bloqueo para contenido relacionado con armas.

La cuantizacion Q6_K utiliza 6 bits con estrategia K-quant, que asigna mayor precision a los pesos de atencion y capas clave, mientras reduce la precision en componentes menos criticos. Esto proporciona una calidad casi indistinguible de FP16 para la mayoria de tareas, con un tamaño de aproximadamente 25 GB.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto coherente y contextualizado, como cualquier LLM de su tamaño.
- Soporte multimodal de vision: acepta entrada de imagenes cuando se combina con el proyector de vision incluido (mmproj-Muse-Glimmer-30B-Q4_K_M.gguf), permitiendo describir o analizar imagenes.
- Conversacion: diseñado para tareas conversacionales, como se indica en los tags.
- Reduccion de rechazos: gracias a la abliteracion, el modelo responde a una mayor variedad de instrucciones, incluyendo algunas que el modelo original rechazaria (aunque no todas).
- Compatibilidad con llama.cpp y Ollama: puede ejecutarse en entornos de CPU y GPU mediante estas herramientas.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden utilizar el modelo para producir narrativas, guiones o dialogos que aborden temas sensibles sin temor a respuestas de rechazo.
- Asistencia en investigacion sobre seguridad de IA: el modelo abliterado sirve como objeto de estudio para analizar mecanismos de rechazo y alineacion, permitiendo comparar comportamientos antes y despues de la intervencion.
- Chat conversacional para aplicaciones de nicho: desarrolladores pueden integrar el modelo en asistentes virtuales que requieran respuestas directas sin filtros morales predefinidos.
- Analisis de imagenes en entornos controlados: con el proyector de vision, el modelo puede describir imagenes, util para aplicaciones de accesibilidad o documentacion automatica.
- Generacion de codigo y documentacion tecnica: aunque no se especifica explicitamente, un modelo de 30B suele tener capacidades de codigo; puede usarse para generar ejemplos o explicaciones tecnicas.
- Prototipado de aplicaciones de texto: gracias a su licencia Apache 2.0 y formato GGUF, es facil de desplegar en entornos de desarrollo con llama.cpp u Ollama para pruebas rapidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado una evaluacion formal del modelo abliterado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 25 GB para el archivo GGUF Q6_K, mas overhead de contexto y computacion.
- GPU recomendada: 48 GB de VRAM (por ejemplo, NVIDIA A6000, doble RTX 3090) para descarga completa.
- Alternativa: 64 GB de RAM del sistema con descarga parcial de GPU (por ejemplo, -ngl 10 en llama.cpp).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (creando un Modelfile), y potencialmente otros motores compatibles con GGUF.
- Latencia y throughput: no se proporcionan datos especificos; dependera del hardware y la configuracion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El modelo base (Muse Glimmer 30B) no tiene datos publicos de benchmarks, y no se conocen alternativas directas en el mismo rango de tamaño y licencia.

## Limitaciones y advertencias

- Modelo abliterado: ha sido modificado para reducir rechazos, lo que implica que puede generar contenido que el modelo original rechazaria. El autor advierte que debe usarse de forma responsable y cumpliendo las leyes aplicables.
- Rechazos residuales: algunas vias de rechazo permanecen, especialmente para contenido relacionado con armas. No es un modelo completamente sin censura.
- Posible degradacion de calidad: la abliteracion con α=0,15 puede afectar sutilmente la calidad de las respuestas, aunque se eligio un valor conservador.
- Sin evaluacion formal: no se han realizado benchmarks sobre el modelo abliterado, por lo que su rendimiento en tareas estandar es desconocido.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto; el ejemplo de Ollama usa 8192 tokens, pero no es un dato oficial.
- Idiomas: no se especifican los idiomas soportados; probablemente herede los del modelo base, pero no se confirma.
- Vision solo con llama.cpp: Ollama no soporta actualmente archivos mmproj separados para esta arquitectura, por lo que la funcionalidad de vision requiere llama.cpp.

## Enlaces

- Modelo GGUF Q6_K: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q6_K-GGUF
- Modelo base BF16: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-BF16
- Cuantizacion FP16 GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-FP16-GGUF
- Cuantizacion Q8_0 GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q8_0-GGUF
- Cuantizacion Q4_K_M GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q4_K_M-GGUF

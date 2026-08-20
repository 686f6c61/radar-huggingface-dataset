# ChesterProgrammer/SFT-Lucy-V0.1

## Resumen

SFT-Lucy-V0.1 es un modelo de lenguaje multimodal desarrollado por ChesterProgrammer, publicado en agosto de 2026 bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo base ChesterProgrammer/CPT-Lucy-V0.1, que a su vez está construido sobre la arquitectura Qwen 3.5 (según el tag `qwen3_5`). El modelo tiene aproximadamente 9,41 mil millones de parámetros y está diseñado para tareas de conversación y procesamiento de imagen-texto a texto, como indica su pipeline `image-text-to-text`.

El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento 2 veces superior a la habitual. Aunque el modelo está orientado al inglés y su ficha técnica es mínima, su licencia permisiva y su tamaño moderado lo hacen interesante para prototipos y aplicaciones comerciales que requieran capacidades multimodales básicas. Sin embargo, al no publicarse detalles sobre el dataset de entrenamiento ni benchmarks, su rendimiento real no puede verificarse de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (variante, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, sin versiones GGUF o AWQ publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint ChesterProgrammer/CPT-Lucy-V0.1, que a su vez se basa en la arquitectura Qwen 3.5. No se han publicado detalles sobre la configuración exacta de la arquitectura (número de capas, heads de atención, etc.) ni sobre el proceso de preentrenamiento del modelo base. El finetune se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica el uso de técnicas de entrenamiento eficiente (posiblemente LoRA o QLoRA, aunque no se especifica). Tampoco se detalla el dataset de ajuste fino, el número de tokens de entrenamiento ni si se aplicaron métodos de alineación como RLHF o DPO. La única información concreta es que el entrenamiento fue 2 veces más rápido gracias a Unsloth.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está optimizado para mantener diálogos multi-turno.
- Procesamiento multimodal imagen-texto: el pipeline `image-text-to-text` confirma que acepta entradas de imagen y texto, y genera respuestas de texto. Esto permite tareas como descripción de imágenes o respuesta a preguntas visuales.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible (no hay evidencia en la información proporcionada).
- Capacidades multilingües: no disponible (solo se declara inglés).
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener chats en inglés donde el usuario adjunta imágenes y hace preguntas sobre ellas, por ejemplo, "¿Qué objetos aparecen en esta foto?" o "Describe la escena". Su pipeline image-text-to-text lo hace adecuado para este escenario.
- Generación de descripciones de imágenes para accesibilidad: puede utilizarse para crear textos alternativos automáticos de imágenes en aplicaciones web o móviles, ayudando a personas con discapacidad visual.
- Moderación de contenido visual: dado que procesa imágenes y texto, podría emplearse para clasificar o describir contenido subido por usuarios en plataformas sociales, aunque no se ha verificado su precisión en esta tarea.
- Chatbots de atención al cliente con soporte de capturas de pantalla: un usuario puede enviar una captura de pantalla de un error y el modelo puede interpretarla y ofrecer una respuesta textual. Su tamaño de 9,4 B permite desplegarlo en entornos con recursos moderados.
- Herramienta educativa interactiva: para estudiantes de inglés que quieran practicar describiendo imágenes o haciendo preguntas sobre ellas, el modelo puede actuar como tutor conversacional.
- Prototipado rápido de aplicaciones multimodales: gracias a su licencia Apache 2.0 y su formato safetensors, es fácil integrarlo en pipelines de Hugging Face Transformers para validar ideas de producto antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,41 B de parámetros, en precisión FP16 los pesos ocupan aproximadamente 18,8 GB (coincide con el tamaño del repositorio). En cuantización de 8 bits se necesitarían unos 9,4 GB, y en 4 bits unos 4,7 GB. Estas son estimaciones teóricas; el consumo real depende de la longitud de contexto y del batch.
- GPU recomendadas: para FP16 se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4). Con cuantización de 8 bits, una GPU de 12-16 GB (RTX 3080, RTX 4070 Ti) podría ser suficiente. Con 4 bits, una GPU de 8 GB (RTX 3060, RTX 4060) podría funcionar, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de Transformers con pesos en safetensors, puede servirse con vLLM, Hugging Face TGI, o mediante la librería `transformers` directamente. Si se generaran versiones GGUF, también podría usarse con llama.cpp u Ollama, pero no se han publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de SFT-Lucy-V0.1, por lo que una comparación cuantitativa no es posible. A nivel de especificaciones, se puede contrastar con otros modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Multimodal |
|---|---|---|---|---|
| SFT-Lucy-V0.1 | 9,41 B | no disponible | Apache 2.0 | Sí (imagen-texto) |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache 2.0 | No |
| Llama-3.1-8B-Instruct | 8,03 B | 128K | Llama 3.1 Community License | No |
| Phi-3.5-vision-instruct | 4,2 B | 128K | MIT | Sí (visión) |

La principal diferencia es que SFT-Lucy-V0.1 es multimodal, mientras que Qwen2.5-7B y Llama-3.1-8B son solo de texto. Phi-3.5-vision es más pequeño y con licencia MIT, pero no se puede comparar el rendimiento sin benchmarks. La falta de datos de contexto y de evaluación impide una comparación más profunda.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre el dataset de entrenamiento, por lo que no se pueden identificar sesgos específicos. Como modelo entrenado principalmente en inglés, puede reflejar sesgos culturales y lingüísticos de ese idioma.
- Riesgo de alucinación: al ser un modelo de 9,4 B sin datos de evaluación, es probable que genere respuestas inventadas o incorrectas, especialmente en tareas de razonamiento complejo o hechos factuales. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está documentada. Si es similar a otros modelos Qwen, podría ser de 32K o 128K, pero no hay confirmación. Esto limita su uso en tareas que requieran documentos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright. No hay cláusulas de uso aceptable específicas.
- Caveat para producción: al no haber benchmarks ni detalles de entrenamiento, no se recomienda su uso en entornos de producción sin una evaluación previa exhaustiva. El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChesterProgrammer/SFT-Lucy-V0.1
- Modelo base: https://huggingface.co/ChesterProgrammer/CPT-Lucy-V0.1
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth

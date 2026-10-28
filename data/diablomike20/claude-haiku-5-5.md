# diablomike20/Claude-Haiku-5.5

## Resumen

Claude-Haiku-5.5 es, a pesar del nombre, un modelo abierto de la comunidad publicado por el usuario diablomike20 en HuggingFace. Se trata de una conversión a formato GGUF —realizada con el espacio GGUF-my-repo de ggml.ai sobre llama.cpp— del checkpoint `mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors`, que a su vez es un ajuste fino (SFT) del modelo multimodal Qwen3-VL-4B-Thinking. Por tanto, la arquitectura real es la de un transformer denso visión-lenguaje de aproximadamente 4.022 millones de parámetros, no la del modelo propietario Claude Haiku 5.5 de Anthropic con el que comparte denominación.

El interés del artefacto es práctico: empaqueta un modelo de 4B con capacidad de razonamiento explícito ("thinking") y entrada de imágenes en un único fichero GGUF de 2,9 GB, ejecutable en CPU o en GPUs de consumo mediante llama.cpp. Esto lo sitúa en la franja de modelos pequeños para despliegue local, prototipado rápido de pipelines multimodales y tareas de extracción o clasificación donde no se quiere depender de una API externa.

Conviene subir la advertencia al principio: el nombre del repositorio imita deliberadamente el de un modelo comercial de Anthropic (Claude Haiku 5.5, publicado el 7 de octubre de 2026), pero no existe relación técnica ni de licencia entre ambos. Cualquier evaluación debe hacerse sobre el modelo subyacente Qwen3-VL-4B-Thinking y sus datos de ajuste, no sobre las cifras del modelo de Anthropic.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), derivado de Qwen3-VL-4B-Thinking |
| Parámetros totales | 4.022.468.096 (~4,02 mil millones), dato de safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; la model card ejemplifica Q5_K_M, no se listan otras variantes en el repositorio |
| Idiomas soportados | inglés (único idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 2,9 GB); safetensors en el modelo de origen |

## Arquitectura y entrenamiento

El modelo es un transformer denso con codificador visual, heredado de la familia Qwen3-VL en su variante de 4B parámetros y modo "thinking". El pipeline declarado es: checkpoint base Qwen3-VL-4B-Thinking, ajuste supervisado (SFT) sobre los datasets `mondk/Claude-Haiku-5.5-High-Sft` y `mondk/Msh-Sft`, publicación en safetensors y conversión final a GGUF mediante llama.cpp. El tag `vl` confirma la capacidad de procesar imágenes además de texto, y el tag `think` indica que el modelo puede emitir cadenas de razonamiento antes de la respuesta final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá de las heredadas del modelo base. La model card del repositorio es, de hecho, la plantilla automática que genera el espacio GGUF-my-repo, sin sección de entrenamiento ni evaluación.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Razonamiento explícito en modo "thinking": el modelo puede producir un borrador de razonamiento antes de la respuesta final.
- Comprensión de imágenes (visión-lenguaje): descripción, extracción de información y respuesta a preguntas sobre contenido visual.
- Razonamiento matemático y lógico básico, limitado por el tamaño de 4B parámetros.
- Generación y explicación de código en tareas de complejidad baja o media.
- Soporte de tool calling / function calling: no documentado en la información disponible; debe validarse empíricamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el modo thinking facilita cadenas de pasos, pero no hay evaluación publicada.
- Capacidades multilingües: no declaradas; el único idioma indicado es inglés.
- Capacidades especiales: entrada de imagen y modo de razonamiento extendido (tags `vl` y `think`).

## Casos de uso

- Extracción de datos de documentos escaneados en local: el modelo puede recibir una imagen de factura, albarán o formulario y devolver campos estructurados, ejecutándose en una máquina sin GPU dedicada gracias al GGUF de 2,9 GB.
- Clasificación y enrutado de tickets de soporte: con 4B parámetros y despliegue en CPU, el coste marginal por inferencia es bajo; adecuado para clasificar cientos de mensajes por hora en inglés.
- Descripción automática de imágenes y generación de texto alternativo: útil en pipelines de accesibilidad o catalogación de imágenes donde no se quiere enviar contenido a una API externa.
- Prototipado de asistentes con razonamiento visible: el modo thinking permite inspeccionar la cadena de razonamiento durante el desarrollo de prompts y agentes, antes de migrar a un modelo mayor.
- Despliegue en el borde (edge) o en portátiles: al caber en cuantizaciones de ~2,5-3 GB, se puede distribuir junto a una aplicación de escritorio o una Raspberry Pi con suficiente RAM.
- Entornos con requisitos de privacidad: al ejecutarse totalmente offline mediante llama.cpp u Ollama, permite procesar documentación sensible sin salida de datos a terceros.
- Generación de código de apoyo en editores locales: autocompletado y explicación de fragmentos en inglés, con latencia baja al no requerir red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card del repositorio GGUF ni la información de búsqueda proporcionan puntuaciones de MMLU, HumanEval, GSM8K, MMMU u otras. Las páginas de Anthropic y de terceros encontradas en la búsqueda se refieren al modelo propietario Claude Haiku 5.5 de Anthropic, que no es el modelo de este repositorio, por lo que sus cifras no son aplicables.

## Requisitos de hardware

- VRAM estimada: en FP16 el modelo de 4,02B parámetros requiere en torno a 8 GB (sin contar el codificador visual y el KV cache); en Q8 alrededor de 4,3 GB; en Q5_K_M en torno a 2,9 GB, que es el tamaño del repositorio; en Q4_K_M aproximadamente 2,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16 (RTX 3070/4060 Ti, RTX 4090, A10, L4); para cuantizaciones Q4/Q5 basta con 4-6 GB, por lo que entran en RTX 3050, RTX 4060 o GTX 1660 con 6 GB.
- GPU de consumo: sí, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; en 8 GB funciona en FP16 con contexto moderado.
- CPU: viable en exclusiva por CPU con llama.cpp gracias al formato GGUF; se recomienda un mínimo de 8 GB de RAM para Q5_K_M y 16 GB para mayor comodidad con contexto largo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama importando el GGUF, LM Studio. Para vLLM o TGI conviene partir de los safetensors del modelo original, ya que el soporte de GGUF en esos motores es limitado.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia cualitativa, un modelo denso de 4B en Q5_K_M sobre una RTX 4090 permite decenas de tokens por segundo, pero no hay cifras verificadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claude-Haiku-5.5 (este repositorio) | 4,02B | no disponible | texto + imagen, modo thinking | Apache 2.0 | GGUF en HuggingFace |
| Qwen3-VL-4B-Thinking (modelo base) | ~4B | no disponible | texto + imagen, modo thinking | no disponible en la información | safetensors en HuggingFace |
| Qwen3-VL-4B-Thinking-Msh-Claude (checkpoint SFT de origen) | ~4B | no disponible | texto + imagen, modo thinking | no disponible en la información | safetensors y GGUF Q5_K_M |
| Claude Haiku 5.5 (Anthropic, modelo propietario) | no disponible | no disponible | texto (API) | propietaria | solo API |

La comparación relevante es con el modelo base y con el checkpoint SFT del que se deriva: comparten arquitectura y tamaño, y las diferencias se limitan al ajuste fino y a la cuantización. El modelo de Anthropic se incluye únicamente para dejar constancia de que la denominación es homónima y de que no existe comparación técnica posible con los datos disponibles.

## Limitaciones y advertencias

- Nombre engañoso: "Claude-Haiku-5.5" no es el modelo de Anthropic. Cualquier uso en producción o comunicación pública debe aclarar que se trata de un ajuste fino comunitario de Qwen3-VL-4B.
- Sin evaluación publicada: no hay benchmarks, ni comparativas, ni pruebas de calidad reportadas por el autor; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Solo inglés declarado: no hay garantía de comportamiento correcto en castellano ni en otros idiomas, a pesar de que el modelo base podría tener capacidades multilingües no documentadas aquí.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar cargas de documentos largos sin pruebas previas.
- Riesgo de alucinación: al ser un modelo de 4B, la tasa de errores factuales y de invención de detalles en extracción de documentos es mayor que en modelos de mayor tamaño; requiere validación posterior en pipelines críticos.
- Pérdida por cuantización: el GGUF Q5_K_M introduce degradación frente a los safetensors originales, especialmente en tareas de visión y razonamiento aritmético.
- Repositorio no mantenido: creado y actualizado el 28 de octubre de 2026 con una diferencia de un minuto entre ambas marcas; no hay garantía de soporte, issues atendidos ni versiones futuras.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de los datasets de ajuste no se detallan en la información disponible y deberían verificarse antes de un despliegue comercial.
- Soporte de tool calling y de agentes no verificado: no debe asumirse sin pruebas propias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/diablomike20/Claude-Haiku-5.5
- Modelo de origen (safetensors): https://huggingface.co/mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors
- Repositorio GGUF de referencia citado en la model card: https://huggingface.co/mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors-Q5_K_M-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/mondk/Claude-Haiku-5.5-High-Sft
- Dataset de ajuste: https://huggingface.co/datasets/mondk/Msh-Sft
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación del modelo homónimo de Anthropic (no relacionado): https://platform.claude.com/docs/en/models/haiku-5-5/overview
- Anuncio del modelo homónimo de Anthropic (no relacionado): https://www.anthropic.com/claude-haiku-5-5

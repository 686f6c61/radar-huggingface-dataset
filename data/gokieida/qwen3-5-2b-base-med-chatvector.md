# gokieida/Qwen3.5-2B-Base-MED-ChatVector

## Resumen

El modelo `gokieida/Qwen3.5-2B-Base-MED-ChatVector` es un checkpoint publicado en Hugging Face por el usuario gokieida, derivado de la familia Qwen3.5 en su variante Base de 2B parámetros. Por el nombre se infiere un proceso de ajuste orientado a dominio médico ("MED") y a formato conversacional con representación vectorial ("ChatVector"), aunque la model card no documenta ni el procedimiento de entrenamiento ni los datos utilizados. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto, coherente con la etiqueta `qwen3_5` del repositorio.

El modelo cuenta con 2.213.241.664 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en GPUs de consumo. El repositorio ocupa 4,4 GB y está en formato transformers con pesos safetensors. No se han publicado descargas ni interacciones en el momento de redactar esta ficha, y la model card es la plantilla autogenerada por el Hub sin contenido sustantivo.

La relevancia de este checkpoint es limitada y debe evaluarse con cautela: se trata de un modelo derivado de terceros, sin licencia declarada, sin idiomas especificados, sin benchmarks y sin documentación técnica. Su interés principal reside en explorar adaptaciones médicas de la familia Qwen3.5 en tamaño reducido, pero cualquier uso en producción exige una validación independiente previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; presumiblemente transformer de la familia Qwen3.5) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 4,4 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`, que apunta a un modelo multimodal con entrada de imagen y texto. El recuento de 2.213.241.664 parámetros es consistente con un transformer denso de aproximadamente 2B parámetros, pero no se confirma si incorpora componentes de visión, proyecciones multimodales o módulos adicionales.

Tampoco se documenta el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo fases de SFT, RLHF o DPO. El sufijo "MED" sugiere un ajuste en dominio médico y "ChatVector" podría referirse a una técnica de combinación de vectores de tarea (task vectors) para inducir comportamiento conversacional, pero son inferencias no confirmadas por el autor. No hay información sobre hiperparámetros, precisión de entrenamiento ni infraestructura utilizada.

## Capacidades

- Generación de texto y respuesta conversacional multi-turno, según el tag `conversational` del Hub.
- Procesamiento de entradas imagen-texto, según el pipeline `image-text-to-text` declarado.
- Posible especialización en dominio médico por el sufijo "MED" del nombre (no verificado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes clínicos de bajo coste: el tamaño de 2B parámetros permite desplegar el modelo en una única GPU de consumo para experimentar con respuestas a preguntas médicas, siempre con supervisión humana y validación frente a fuentes oficiales.
- Investigación sobre adaptaciones de dominio en modelos pequeños: útil como punto de partida para estudiar cómo se comporta un checkpoint derivado de Qwen3.5 Base con ajuste médico, comparándolo con el modelo base original.
- Experimentación multimodal en entornos con recursos limitados: el pipeline image-text-to-text permite probar tareas de descripción de imágenes o extracción de información de documentos escaneados en hardware modesto.
- Evaluación de técnicas de "chat vector": si el nombre refleja el uso de vectores de tarea, el checkpoint sirve para reproducir y analizar este tipo de intervención sobre modelos base.
- Generación de borradores de texto administrativo sanitario: con revisión humana obligatoria, puede asistir en la redacción de resúmenes o plantillas a partir de notas estructuradas.
- Base para fine-tuning posterior en tareas médicas específicas: al ser un modelo de 2B con pesos safetensors, es viable continuar su entrenamiento en dominios concretos (radiología, farmacología, etc.) con presupuestos reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,5-5 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 1,5-2 GB.
- GPU recomendadas para producción: A100, H100, L40S o RTX 6000 Ada para despliegues concurrentes; RTX 4090 o RTX 3090 para desarrollo.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en cuantización 4 bits podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: transformers nativo; vLLM y TGI si la arquitectura Qwen3.5 está soportada por dichos motores; llama.cpp/Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| gokieida/Qwen3.5-2B-Base-MED-ChatVector | 2,21B | no disponible | no disponible | Sí (image-text-to-text) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | No | Hugging Face, Ollama, vLLM |
| Qwen2.5-VL-3B-Instruct | 3,75B | 32.768 tokens | Apache 2.0 | Sí | Hugging Face, vLLM |
| Gemma 3 4B IT | 4,3B | 128.000 tokens | Gemma Terms | Sí | Hugging Face, Ollama |

La comparación con Qwen2.5-VL-3B-Instruct y Gemma 3 4B IT resulta pertinente por tamaño y modalidad, pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. Los modelos de referencia citados cuentan con documentación completa, licencia clara y benchmarks publicados, ventajas que este checkpoint no ofrece.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada, sin información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base Qwen3.5 tampoco se especifica en la información disponible.
- Riesgo elevado de alucinación en dominio médico: un modelo de 2B ajustado sin evaluación publicada no es fiable para decisiones clínicas; cualquier salida debe validarse por profesionales.
- Idiomas no especificados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha degradado.
- Contexto desconocido: sin dato de longitud de contexto no se puede planificar su uso en tareas de documento largo.
- Sesgos no evaluados: al no haber evaluación publicada, no se conocen sesgos demográficos, culturales o de género.
- Sin tracción en la comunidad: cero descargas y cero likes en el momento de la ficha, lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.
- Repositorio de 4,4 GB para 2,21B parámetros: coherente con pesos en bf16, pero sin versiones cuantizadas publicadas que faciliten el despliegue en hardware limitado.
- Riesgo de uso indebido en contextos sanitarios: debe etiquetarse claramente como experimental y no como dispositivo médico.

## Enlaces

- Hugging Face: https://huggingface.co/gokieida/Qwen3.5-2B-Base-MED-ChatVector
- Referencia citada en los tags (calculadora de impacto ambiental): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700

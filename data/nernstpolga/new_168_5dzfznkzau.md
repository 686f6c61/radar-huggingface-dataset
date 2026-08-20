# nernstpolga/new_168_5dzfznkzau

## Resumen

El modelo `nernstpolga/new_168_5dzfznkzau` es un sistema de generación de texto de 35.107 millones de parámetros, desarrollado por el usuario nernstpolga y publicado en Hugging Face en agosto de 2026. Según las etiquetas del repositorio, se trata de una variante con arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, con capacidades multimodales de imagen a texto, entrenamiento mediante *offline DPO* y orientación específica al razonamiento (etiqueta `reason-v4`). El modelo parte de la base `vera6/affine-5g4yy75zuz-t6`, sobre la que se ha realizado un ajuste fino adicional.

La relevancia de este lanzamiento radica en su combinación de tamaño medio (35B) con licencia Apache 2.0, lo que permite uso comercial sin restricciones, y su enfoque en razonamiento y conversación multimodal. Sin embargo, el acceso al repositorio está restringido (gated), por lo que los interesados deben solicitar permiso al autor. No se dispone de documentación técnica pública más allá de los metadatos del repositorio, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según etiquetas); posible uso de capas afines (`affine`) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 70,2 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada públicamente. Las etiquetas del repositorio indican que se trata de un modelo de mezcla de expertos (MoE) perteneciente a la familia Qwen3.5, con un componente multimodal que acepta entradas de imagen y texto (`image-text-to-text`). El término `affine` en el nombre del modelo base sugiere la posible inclusión de capas de transformación afín dentro de la red, aunque no se especifica su función concreta.

El entrenamiento se realizó en dos etapas: primero sobre el modelo base `vera6/affine-5g4yy75zuz-t6` y posteriormente mediante un ajuste fino con *offline DPO* (etiqueta `offline-dpo`), una variante de optimización por preferencias que no requiere interacción en línea con el modelo durante el entrenamiento. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación adicionales empleadas.

## Capacidades

Según las etiquetas y el pipeline declarado, el modelo presenta las siguientes capacidades:

- Generación de texto conversacional y de propósito general (`text-generation`, `conversational`).
- Procesamiento de entradas multimodales de imagen y texto (`image-text-to-text`), lo que permite responder a prompts que combinan imágenes y texto.
- Razonamiento avanzado, indicado por la etiqueta `reason-v4`, orientado a tareas que requieren inferencia lógica o matemática.
- Compatibilidad con *endpoints* de Hugging Face (`endpoints_compatible`), lo que facilita su despliegue en infraestructura gestionada.
- No se dispone de información sobre soporte de *tool calling*, *function calling* o capacidades de agente autónomo.

## Casos de uso

Dado que la documentación es limitada, los casos de uso se infieren de las capacidades declaradas y deben validarse con pruebas propias:

- Asistente conversacional multimodal: el modelo puede responder preguntas sobre imágenes, combinando comprensión visual y generación de texto, útil en aplicaciones de atención al cliente con capturas de pantalla o fotos.
- Análisis de documentos técnicos: al aceptar entradas de imagen, puede extraer información de diagramas, gráficos o formularios escaneados y razonar sobre ellos.
- Generación de informes descriptivos: a partir de una imagen y una pregunta, puede producir resúmenes o explicaciones detalladas, adecuado para entornos de documentación automática.
- Tutoría y educación: su capacidad de razonamiento (`reason-v4`) permite explicar conceptos paso a paso, aunque no se ha verificado su precisión en dominios específicos.
- Prototipado de chatbots con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin coste de licencia, siempre que se cumplan las condiciones de atribución.
- Investigación en alineación de preferencias: al haber sido entrenado con *offline DPO*, puede servir como caso de estudio para comparar metodologías de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos públicos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo. Se recomienda realizar evaluaciones propias antes de su uso en producción.

## Requisitos de hardware

- Con 35,1B parámetros y un repositorio de 70,2 GB en safetensors, la inferencia en precisión FP16 requiere aproximadamente 70 GB de VRAM, lo que excede las GPUs de consumo habituales.
- Para ejecutarlo en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB), sería necesario cuantizar el modelo a 4 bits, lo que reduciría el uso de VRAM a unos 18-20 GB, aunque no se han publicado cuantizaciones oficiales.
- GPUs recomendadas para inferencia sin cuantizar: NVIDIA A100 (80 GB), H100 (80 GB) o GPUs con 80 GB o más de VRAM.
- Opciones de despliegue: al ser compatible con *endpoints* de Hugging Face, puede desplegarse en la infraestructura gestionada de HF. También es compatible con librerías como vLLM o TGI, aunque no se ha confirmado su soporte oficial.
- Latencia y throughput: no disponibles. Al ser un modelo MoE, la latencia dependerá del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo comparte características generales con la familia Qwen MoE (por ejemplo, Qwen2.5-32B-MoE o Qwen3-30B-A3B), pero no se han publicado datos de rendimiento ni especificaciones detalladas que permitan una comparación objetiva. Se recomienda consultar el repositorio del modelo base `vera6/affine-5g4yy75zuz-t6` para obtener más contexto.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated*, por lo que es necesario solicitar permiso al autor antes de descargar los pesos.
- Documentación insuficiente: no se han publicado *model cards* detalladas, papers ni información sobre el dataset de entrenamiento, lo que impide evaluar sesgos, riesgos de alucinación o limitaciones idiomáticas.
- Riesgo de alucinación: al no conocerse el proceso de alineación completo, no se puede garantizar la fiabilidad factual de las respuestas, especialmente en dominios especializados.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Sin garantías de producción: al ser un modelo reciente y sin benchmarks públicos, su comportamiento en entornos reales es incierto. Se recomienda realizar pruebas exhaustivas antes de integrarlo en sistemas críticos.
- Licencia Apache 2.0: aunque permite uso comercial, es obligatorio incluir el aviso de licencia y atribución correspondiente en los productos derivados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nernstpolga/new_168_5dzfznkzau
- Perfil del autor: https://huggingface.co/nernstpolga
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6 (enlace inferido, no verificado)
- Otro modelo del autor: https://huggingface.co/nernstpolga/val-duo-1

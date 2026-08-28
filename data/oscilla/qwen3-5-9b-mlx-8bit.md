# Oscilla/Qwen3.5-9B-mlx-8Bit

## Resumen

Oscilla/Qwen3.5-9B-mlx-8Bit es una conversión a formato MLX del modelo multimodal Qwen3.5-9B, desarrollado por la comunidad Oscilla. El modelo original, Qwen/Qwen3.5-9B, pertenece a la familia Qwen3.5 y combina comprensión de texto e imágenes en una arquitectura unificada de visión-lenguaje con fusión temprana de tokens multimodales. Esta versión cuantizada a 8 bits está diseñada para ejecutarse eficientemente en hardware Apple Silicon mediante el framework MLX, reduciendo el consumo de memoria a aproximadamente 9,5 GB manteniendo la mayor parte de las capacidades del modelo base.

La relevancia de esta ficha radica en que ofrece una opción accesible para desarrolladores que necesitan desplegar un modelo multimodal de tamaño medio en entornos locales con Macs, sin depender de servicios en la nube. La cuantización 8-bit con grupo de tamaño 64 preserva un buen equilibrio entre rendimiento y fidelidad, y el formato MLX se integra de forma nativa con las bibliotecas de Apple. Aunque el modelo base tiene 9 mil millones de parámetros, el archivo safetensors reporta 2.519.020.032 parámetros, posiblemente debido a la cuantización o a un error de metadatos; el tamaño del repositorio (9,5 GB) confirma que se trata de un modelo de 9B en 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con fusión temprana |
| Parametros totales | 9B (modelo base); safetensors reporta 2.519.020.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (8.864 bits por peso, grupo de tamaño 64) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-9B es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX SafeTensors |

## Arquitectura y entrenamiento

El modelo original Qwen3.5-9B emplea una arquitectura transformer multimodal con fusión temprana de tokens de imagen y texto, lo que permite un procesamiento conjunto desde las primeras capas. Esta aproximación, según la documentación de Qwen3.5, logra un rendimiento comparable al de Qwen3 en tareas de razonamiento, código y agentes, y supera a los modelos Qwen3-VL en benchmarks de comprensión visual. El entrenamiento del modelo base incluye una fase de preentrenamiento con datos multimodales y un ajuste fino posterior, aunque los detalles específicos (número de tokens, composición del dataset, uso de RLHF o DPO) no se han proporcionado en la información disponible.

La conversión a MLX se realizó con la versión 0.31.2 de mlx-lm, y la cuantización a 8 bits se aplicó con un grupo de tamaño 64. Esta cuantización reduce el tamaño del modelo de aproximadamente 18 GB (en FP16) a 9,5 GB, facilitando su ejecución en dispositivos con memoria unificada de 16 GB o superior. No se han documentado innovaciones técnicas adicionales en la conversión, más allá de las correcciones específicas para Qwen3.5 en las predicciones de cuantización, según se menciona en la conversión de mlx-community.

## Capacidades

- Generación de texto y comprensión de imágenes: el modelo procesa entradas de texto e imagen de forma conjunta, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.
- Razonamiento y resolución de problemas: hereda las capacidades de razonamiento del modelo base Qwen3.5, que según las referencias supera a Qwen3-VL en benchmarks de razonamiento.
- Generación de código: el modelo base está entrenado para tareas de programación, aunque no se especifica si esta versión cuantizada mantiene el mismo nivel.
- Soporte de agentes y tool calling: no se confirma explícitamente, pero es una característica común en la familia Qwen; la información disponible no lo detalla.
- Capacidades multilingües: el modelo base Qwen3.5-9B es multilingüe, pero la ficha no especifica qué idiomas están soportados en esta conversión.
- Chat conversacional: el pipeline declarado es image-text-to-text y la etiqueta "conversational" indica que admite diálogos multi-turno mediante plantillas de chat.

## Casos de uso

- Asistente de accesibilidad visual: el modelo puede describir imágenes en tiempo real a personas con discapacidad visual, procesando capturas de cámara y generando descripciones detalladas en lenguaje natural. Su formato MLX permite ejecutarlo en un MacBook con memoria unificada, ofreciendo privacidad al no enviar datos a la nube.
- Análisis de documentos escaneados: convierte imágenes de facturas, contratos o formularios en texto estructurado, extrayendo campos clave mediante preguntas específicas. La cuantización 8-bit mantiene una precisión suficiente para tareas de OCR semántico.
- Moderación de contenido en foros: clasifica imágenes subidas por usuarios y genera avisos automáticos si detectan contenido inapropiado, combinando visión y texto en un pipeline local.
- Generación de informes técnicos a partir de diagramas: dado un esquema o captura de pantalla, el modelo redacta una explicación técnica coherente, útil para documentación de proyectos de ingeniería.
- Chatbot de atención al cliente con soporte de imágenes: los usuarios pueden enviar fotos de productos o errores, y el modelo responde con instrucciones de solución. Su naturaleza conversacional permite mantener el contexto a lo largo de varios turnos.
- Prototipado rápido de aplicaciones multimodales: los desarrolladores pueden usar este modelo en entornos de desarrollo con Apple Silicon para validar ideas de visión por computadora antes de escalar a modelos más grandes en la nube, gracias a la integración con mlx-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada en la información disponible. La documentación del modelo base menciona que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se proporcionan cifras concretas. Se recomienda consultar la documentación oficial de Qwen3.5 para obtener números de referencia, teniendo en cuenta que la cuantización 8-bit puede introducir una ligera degradación del rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,4 GB para inferencia en 8-bit, según datos de LLM Explorer. El tamaño del repositorio es de 9,5 GB, por lo que se necesita al menos 12 GB de memoria unificada para cargar el modelo con margen para el contexto.
- GPU recomendadas: optimizado para Apple Silicon (M1, M2, M3 y superiores) gracias al framework MLX. No está pensado para GPUs NVIDIA, aunque podría ejecutarse con adaptadores adicionales.
- Compatibilidad con GPUs de consumo: sí, en Macs con 16 GB de RAM unificada o más. En Macs de 8 GB puede resultar ajustado.
- Opciones de despliegue: mlx-lm (biblioteca principal), integración con Hugging Face Transformers mediante el adaptador MLX, y posiblemente Ollama (el modelo qwen3.5:9b está disponible en Ollama, aunque no se confirma que sea esta conversión exacta).
- Latencia y throughput: no se proporcionan datos concretos. En Apple Silicon M2 Pro, se espera una generación de 10-20 tokens por segundo para modelos de 9B en 8-bit, pero esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/Qwen3.5-9B-mlx-8Bit | 9B | no disponible | 8-bit MLX | Apache-2.0 | MLX SafeTensors |
| mlx-community/Qwen3.5-9B-MLX-8bit | 9B | no disponible | 8-bit MLX | Apache-2.0 | MLX SafeTensors |
| Qwen/Qwen3.5-9B (original) | 9B | no disponible | FP16/BF16 | Apache-2.0 | SafeTensors |
| Qwen3-VL (serie anterior) | 2B-32B | variable | FP16 | Apache-2.0 | SafeTensors |

La comparativa se limita a la disponibilidad de datos. La versión de Oscilla y la de mlx-community son prácticamente idénticas en especificaciones, diferenciándose solo en el autor de la conversión. El modelo original en FP16 requiere aproximadamente el doble de memoria (18 GB), por lo que la versión 8-bit es más adecuada para hardware de consumo.

## Limitaciones y advertencias

- La cuantización 8-bit puede provocar una pérdida de precisión en tareas complejas de razonamiento o en la generación de código, en comparación con el modelo original en FP16.
- No se dispone de información sobre la longitud de contexto soportada; es probable que herede la del modelo base, pero no está confirmado.
- Los idiomas soportados no están documentados en esta conversión, aunque el modelo base es multilingüe.
- El formato MLX limita su uso a hardware Apple Silicon; para GPUs NVIDIA sería necesario convertir los pesos a otros formatos (por ejemplo, GGUF o FP16).
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión. Como modelo multimodal, puede generar descripciones inexactas de imágenes o inventar detalles no presentes.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.5-9B no tenga restricciones adicionales (aunque la licencia indicada es la misma).
- Al ser una conversión comunitaria, no hay garantía de soporte oficial ni de actualizaciones futuras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Qwen3.5-9B-mlx-8Bit
- Conversión de referencia de mlx-community: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-8bit
- Página en ModelScope: https://www.modelscope.cn/models/mlx-community/Qwen3.5-9B-MLX-8bit
- Ficha en ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b-mlx-8bit
- Entrada en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FQwen3.5-9B-8bit,552j9kCM50bDVSeVooLBtS
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B

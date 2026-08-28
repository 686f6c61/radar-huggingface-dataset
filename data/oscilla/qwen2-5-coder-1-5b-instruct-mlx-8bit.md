# Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-8Bit

## Resumen

El modelo Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-8Bit es una conversión al formato MLX con cuantización de 8 bits del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por Qwen y adaptado por Oscilla. Se trata de un modelo de lenguaje especializado en generación de código y conversación técnica, basado en la arquitectura Qwen2.5, que ha sido preentrenado sobre más de 5,5 billones de tokens según el informe técnico de la serie Qwen2.5-Coder. La versión MLX está optimizada para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm, lo que permite una inferencia eficiente en dispositivos Mac.

La cuantización de 8 bits reduce el tamaño del modelo y acelera la inferencia sin una pérdida significativa de calidad, manteniendo la licencia Apache 2.0 que permite uso comercial. Con aproximadamente 1,5 mil millones de parámetros (aunque el archivo safetensors muestra 434 millones, posiblemente debido a la representación cuantizada), este modelo es adecuado para tareas de asistencia a programación, autocompletado de código y chat técnico en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 434.273.792 (según safetensors; el modelo base declara 1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-1.5B-Instruct emplea una arquitectura transformer decoder-only con atención causal, siguiendo el diseño de la familia Qwen2.5. Según el informe técnico de Qwen2.5-Coder, el modelo fue preentrenado sobre un corpus de más de 5,5 billones de tokens, con un proceso de limpieza de datos exhaustivo y un ajuste fino supervisado (SFT) para instrucciones. La conversión a MLX de 8 bits se realizó con la librería mlx-lm versión 0.31.2, que aplica cuantización post-entrenamiento para reducir el tamaño de los pesos y optimizar la inferencia en GPUs unificadas de Apple.

No se dispone de detalles adicionales sobre el proceso de entrenamiento específico de esta versión cuantizada, pero al ser una conversión directa del modelo original, las capacidades funcionales se mantienen, aunque con una ligera degradación típica de la cuantización.

## Capacidades

- Generación de código en múltiples lenguajes de programación, incluyendo Python, JavaScript, Java, C++ y otros.
- Asistencia en tareas de programación: autocompletado, refactorización, explicación de código y depuración.
- Conversación técnica y chat orientado a desarrolladores, con soporte de instrucciones en inglés.
- Razonamiento básico y resolución de problemas algorítmicos de nivel medio.
- Generación de documentación y comentarios de código.
- Capacidad de seguir instrucciones de formato y restricciones de salida en tareas de generación de texto.
- Soporte de tool calling y function calling (según el modelo base, aunque no confirmado explícitamente en esta conversión).
- No se han verificado capacidades multimodales; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse como plugin de autocompletado o chat contextual en editores como VS Code, ofreciendo sugerencias de código y respuestas a preguntas técnicas.
- Generación de scripts y automatización: útil para generar scripts de shell, configuraciones y pequeños programas en entornos de desarrollo.
- Explicación de código legacy: puede analizar fragmentos de código y generar explicaciones claras para facilitar el mantenimiento.
- Generación de pruebas unitarias: a partir de una función o clase, el modelo puede proponer casos de prueba básicos.
- Chatbot técnico interno: desplegado como servicio en una intranet para responder preguntas frecuentes sobre APIs y buenas prácticas de desarrollo.
- Preprocesamiento de código en pipelines de CI/CD: puede usarse para generar mensajes de commit, resúmenes de cambios o documentación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modelo pensado para Apple Silicon (M1, M2, M3 o superiores) gracias al formato MLX.
- Memoria unificada estimada: al menos 2 GB para cargar el modelo en 8 bits (el archivo pesa 1,7 GB).
- GPU recomendada: integrada en Apple Silicon; no requiere GPU dedicada externa.
- Compatible con Macs con 8 GB de RAM o más para una inferencia fluida.
- Despliegue mediante mlx-lm (Python) o integración con librerías compatibles con MLX.
- No se dispone de datos de latencia o throughput específicos para esta versión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-8Bit | 434M (según safetensors) | No disponible | Apache 2.0 | MLX 8-bit | Código y chat técnico en Apple Silicon |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (original) | 1,5B | 32K (según documentación) | Apache 2.0 | safetensors | Código y chat técnico multiplataforma |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | safetensors | Código y razonamiento |
| StarCoder2-3B | 3B | 16K | OpenRAIL | safetensors | Código y autocompletado |

La comparativa es cualitativa; no se dispone de datos de rendimiento para esta versión concreta.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado.
- Al ser una versión cuantizada de 8 bits, puede presentar una ligera degradación en tareas complejas de razonamiento o generación de código extenso.
- Riesgo de alucinación en respuestas técnicas; se recomienda verificación humana en entornos de producción.
- No se ha confirmado soporte para tool calling en esta conversión, aunque el modelo base lo incluye.
- La longitud de contexto no se ha especificado en esta conversión; se recomienda consultar la documentación del modelo base para conocer el límite real.
- Licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de atribución correspondientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-Coder-1.5B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Informe técnico Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v3
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder

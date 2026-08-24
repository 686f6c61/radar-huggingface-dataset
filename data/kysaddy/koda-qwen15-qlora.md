# Kysaddy/koda-qwen15-qlora

## Resumen

Koda es un adaptador LoRA entrenado con QLoRA sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por Kysaddy. Se presenta como un asistente de codificación y conversación general, orientado a tareas de generación de código, explicaciones técnicas, depuración, ejemplos de SQL, uso de APIs y flujos de trabajo de Git. El repositorio contiene únicamente el adaptador, el tokenizador y los ficheros de configuración; no incluye los pesos del modelo base, por lo que es obligatorio cargar el modelo base antes de adjuntar el adaptador con la librería PEFT.

El entrenamiento se realizó con 51 ejemplos curados, 60 pasos en CPU, cuantización de 4 bits NF4, módulos LoRA en las proyecciones q/v, rango 4 y alpha 8, con una tasa de aprendizaje de 5e-5 y longitud de secuencia de 64 tokens. No se menciona el uso de RLHF ni DPO. Su relevancia actual reside en ilustrar un flujo completo de fine-tuning eficiente con QLoRA sobre un modelo pequeño de 1.5B de parámetros, con licencia Apache 2.0 y capaz de ejecutarse en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (decoder) del modelo base Qwen2.5-Coder-1.5B-Instruct + adaptador LoRA (rango 4) |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA de rango 4 (peso del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento del adaptador usó secuencias de 64 tokens) |
| Tipos de cuantizacion | NF4 (4-bit) durante el entrenamiento; cuantización doble opcional |
| Idiomas soportados | No disponible (no se especifica en la ficha del adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó sobre el modelo base Qwen2.5-Coder-1.5B-Instruct, un transformer decoder con atención causal y especializado en código. El método de entrenamiento fue QLoRA, que combina cuantización de 4 bits (tipo NF4) con adaptadores de bajo rango, manteniendo el modelo base congelado y solo entrenando los módulos LoRA. Los módulos se aplicaron a las proyecciones de consulta y valor (q/v) de la atención, con rango 4 y alpha 8.

El proceso de entrenamiento usó gradient checkpointing, una tasa de aprendizaje de 5e-5, longitud de secuencia de 64 tokens, y se ejecutó en 60 pasos sobre CPU con un conjunto de 51 ejemplos curados de código y chat, con etiquetas enfocadas en las respuestas del asistente. No se documenta el uso de RLHF, DPO ni otros métodos de alineación posteriores.

## Capacidades

- Generación de código en Python y otros lenguajes, heredada del modelo base especializado en código.
- Explicaciones y depuración de fragmentos de código en conversación multi-turno.
- Ejemplos de consultas SQL y esquemas de bases de datos.
- Orientación sobre el uso de APIs y flujos de trabajo de Git.
- Conversación general de chat con el formato de instrucciones de Qwen2.5-Instruct.
- No se documenta soporte de tool calling ni function calling en la ficha del adaptador.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de código en el editor: el modelo puede integrarse en herramientas de desarrollo para responder consultas de generación y explicación de código, aprovechando la ventana de contexto del modelo base y su formato de chat.
- Depuración de errores: permite solicitar borradores de correcciones para errores de programación a partir de descripciones del problema, aunque los resultados deben revisarse y probarse antes de aplicarse.
- Generación de consultas SQL: útil para obtener ejemplos de consultas a partir de descripciones en lenguaje natural, con la advertencia de validar el esquema real de la base de datos.
- Tutorial de APIs: puede generar ejemplos de llamadas y métodos de uso de endpoints y bibliotecas, siempre que se verifique la versión de la API consultada.
- Flujo de trabajo de Git: permite solicitar comandos y explicaciones de operaciones como merge, rebase o resolución de conflictos, útil para desarrolladores junior.
- Aprendizaje de programación: sirve como recurso educativo para estudiantes que quieran ver ejemplos de código y explicaciones paso a paso, gracias a su pequeño tamaño y la posibilidad de ejecutarse en CPU.
- Pruebas de concepto de fine-tuning: es un ejemplo de referencia para evaluar el impacto de QLoRA con un conjunto de datos muy reducido sobre un modelo de 1.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base de 1.5B de parámetros puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM en cuantización de 4 bits.
- El adaptador LoRA añade una carga mínima de memoria; el conjunto completo es viable en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o inferiores.
- Es posible ejecutarlo en CPU con suficiente RAM (aproximadamente 4-6 GB en cuantización), aunque la latencia será mayor.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM (si se convierte el adaptador a formato compatible), TGI, o llama.cpp con conversión previa a GGUF.
- La latencia y el throughput no están documentados; al tratarse de un modelo pequeño, se espera una latencia baja en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Koda Qwen 1.5B (este adaptador) | 1.5B | No disponible | Apache 2.0 | Código y chat (adaptador QLoRA) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | No disponible | Apache 2.0 | Código y chat (modelo base sin adaptador) |
| CodeLlama-7B-Instruct | 7B | No disponible | Llama 2 License | Código e instrucciones (tamaño mayor) |

No se han publicado benchmarks comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El adaptador se entrenó con 51 ejemplos y 60 pasos; la generalización puede ser limitada y existe riesgo de sobreajuste a los ejemplos de entrenamiento.
- La longitud de secuencia de entrenamiento es de 64 tokens, muy inferior al contexto del modelo base; los textos generados de mayor longitud pueden degradar la calidad.
- No se ha evaluado formalmente el riesgo de alucinación; todo el código generado debe revisarse y probarse antes de su uso en producción.
- No se documentan sesgos conocidos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- El repositorio solo contiene el adaptador; es obligatorio cargar el modelo base exacto Qwen/Qwen2.5-Coder-1.5B-Instruct para su funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los términos del modelo base según su ficha oficial antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kysaddy/koda-qwen15-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Proyecto fuente: https://github.com/pooraddyy/koda-ai

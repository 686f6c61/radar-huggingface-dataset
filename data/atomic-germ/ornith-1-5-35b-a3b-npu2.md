# Atomic-Germ/Ornith-1.5-35B-A3B-NPU2

## Resumen

El modelo `Atomic-Germ/Ornith-1.5-35B-A3B-NPU2` es una conversión cuantizada en formato Q4NX del modelo `ornith-ai/Ornith-1.5-35B-A3B`, realizada por Atomic-Germ. Esta conversión está optimizada para ejecutarse en NPU AMD XDNA mediante el runtime FastFlowLM (FLM), un framework de inferencia específico para aceleradores de AMD. El modelo base es un Mixture-of-Experts (MoE) de 35 mil millones de parámetros con 3 mil millones activos, basado en la arquitectura Qwen3.5 MoE, que incluye capacidades de visión (multimodal) y una ventana de contexto de 262K tokens.

La relevancia de esta versión radica en su capacidad para ejecutar un modelo de gran tamaño en hardware de consumo con NPU, reduciendo el peso de los pesos a 22.14 GB mediante cuantización Q4NX (mezcla de Q8_0, Q4_1 y BF16). Esto permite desplegar el modelo en dispositivos con AMD XDNA sin necesidad de GPU dedicadas de alta gama. La licencia Apache-2.0 facilita su uso comercial y de investigación, aunque el idioma soportado es exclusivamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 |
| Parametros totales | 35 B |
| Parametros activos | 3 B |
| Longitud de contexto | 262 K (según la página del modelo base, no verificado en esta versión) |
| Tipos de cuantizacion | Q4NX (Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no GGUF, no safetensors) |

## 3. Arquitectura y entrenamiento

El modelo base `Ornith-1.5-35B-A3B` es un transformer MoE con 35B parámetros totales y 3B activos por token, diseñado para eficiencia en inferencia. La arquitectura sigue el patrón de Qwen3.5 MoE, con atención de múltiples cabezas y capas de expertos activadas por router. El entrenamiento del modelo base se basó en un enfoque de "self-scaffolding" y "self-improvement", donde el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo, como se describe en el blog oficial de ornith.ai. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

La versión NPU2 es una cuantización post-entrenamiento que mantiene la arquitectura original pero convierte los pesos a un formato optimizado para el runtime FastFlowLM, incluyendo también el modelo de visión en un archivo separado (`vision_weight.q4nx`). No se aplica ningún fine-tuning adicional; es una conversión puramente de compresión y empaquetado.

## 4. Capacidades

- Generación de texto conversacional y continuada en inglés.
- Razonamiento multi-step y resolución de tareas complejas (heredado del modelo base).
- Procesamiento de visión: puede analizar imágenes y responder preguntas sobre su contenido (incluido en el modelo base).
- Soporte de contexto largo (hasta 262K tokens según la página del modelo base, aunque no se verifica en esta versión cuantizada).
- No se documenta soporte explícito de tool calling o function calling en la información proporcionada.

## 5. Casos de uso

- **Asistentes conversacionales en local**: ejecución de un chatbot con capacidades de visión en portátiles o equipos con NPU AMD XDNA, sin necesidad de conexión a internet.
- **Análisis de imágenes en edge**: procesamiento de imágenes (OCR, descripción de escenas) directamente en el dispositivo, útil para aplicaciones de accesibilidad o domótica.
- **Investigación y prototipado**: evaluación de la calidad de cuantización Q4NX frente a la versión original, para decidir el despliegue en entornos con restricciones de memoria.
- **Entornos con restricción de energía**: al ejecutarse en NPU, el consumo energético es menor que en GPU, adecuado para dispositivos con batería.
- **Integración en aplicaciones FastFlowLM**: desarrollo de aplicaciones que usan el runtime FLM para inferencia local en sistemas AMD, aprovechando la optimización específica.
- **Educación y experimentación**: demostraciones de modelos MoE multimodales en hardware de gama media, sin necesidad de GPU dedicada.

## 6. Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada (Q4NX). La página del modelo base indica una puntuación de 49.22/100 en el leaderboard público de BenchLM (puesto #137 de 224), pero no se especifica la tarea ni la configuración de cuantización. No se dispone de datos de rendimiento (latencia, throughput) para la ejecución en NPU.

## 7. Requisitos de hardware

- El archivo `model.q4nx` pesa 22.14 GB, por lo que se requiere al menos 24 GB de memoria disponible en el dispositivo (NPU o sistema).
- El modelo está compilado específicamente para **AMD NPU XDNA** (familia de aceleradores de AMD). No es compatible con GPU NVIDIA ni Apple Silicon.
- Se ejecuta mediante el runtime **FastFlowLM (FLM)** versión 1.0.1, que debe estar instalado en el sistema.
- La instalación se realiza con la herramienta `flm-add`, que registra el modelo en el directorio de usuario de FastFlowLM.
- No se requiere GPU adicional, pero el sistema debe tener la NPU AMD habilitada y los drivers adecuados.

## 8. Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con esta versión cuantizada. El modelo base `Ornith-1.5-35B-A3B` se puede comparar con otros MoE de tamaño similar, como Qwen3-30B-A3B o Mixtral 8x7B, pero no hay datos de rendimiento disponibles para esta conversión específica. Se recomienda consultar la página del modelo base para obtener benchmarks originales.

## 9. Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés; no se han validado otras lenguas.
- **Cuantización**: la cuantización Q4NX puede degradar la calidad de generación en comparación con el modelo original, especialmente en tareas de razonamiento complejo o matemáticas.
- **Dependencia de FastFlowLM**: el modelo solo funciona con el runtime FastFlowLM y en hardware AMD XDNA; no es portable a otros entornos.
- **Sesgos**: no se han publicado evaluaciones de sesgos o seguridad para esta versión. El modelo base podría heredar sesgos del dataset de entrenamiento, pero no hay datos al respecto.
- **Riesgo de alucinación**: como modelo generativo, puede producir información falsa o inventada. Se recomienda validar salidas en aplicaciones críticas.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y el aviso de licencia.
- **Contexto real**: aunque la especificación indica 262K tokens, la memoria limitada de la NPU puede reducir el contexto efectivo en la práctica.

## 10. Enlaces

- [Hugging Face - Atomic-Germ/Ornith-1.5-35B-A3B-NPU2](https://huggingface.co/Atomic-Germ/Ornith-1.5-35B-A3B-NPU2)
- [Modelo base: ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Guía de ejecución local (Atomic Chat)](https://atomic.chat/blog/guides/how-to-run-ornith-1-5-35b-locally)
- [Blog oficial sobre Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Benchmarks y contexto en BenchLM](https://benchlm.ai/models/ornith-1-5-35b-a3b)

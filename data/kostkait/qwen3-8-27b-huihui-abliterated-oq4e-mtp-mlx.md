# KostkaIT/Qwen3.8-27B-Huihui-Abliterated-oQ4e-MTP-MLX

## Resumen

Este modelo es una cuantización en formato MLX del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, preparada por KostkaIT para ejecución local en Apple Silicon. El modelo base pertenece a la familia Qwen3.8 con 27.000 millones de parámetros, y ha sido sometido a un proceso de "abliteration" por parte de huihui-ai, una técnica que elimina los comportamientos de rechazo aprendidos durante el alineamiento, dejando el modelo sin las respuestas evasivas típicas de los modelos alineados.

La versión `oQ4e` aplica una cuantización de 4 bits optimizada para MLX, conservando la capacidad de predicción múltiple de tokens (MTP) nativa del modelo Qwen3.8. Su relevancia radica en que permite ejecutar un modelo de 27B en equipos Apple con memoria unificada moderada, manteniendo un equilibrio entre calidad de generación y consumo de recursos. El proyecto está mantenido por KostkaIT, un proyecto independiente de Łukasz Frąckowiak (vsnake87), y se distribuye bajo licencia Apache 2.0.

Al tratarse de una cuantización derivada, la información técnica del modelo original (arquitectura exacta, datos de entrenamiento, benchmarks) no está disponible en la documentación proporcionada, por lo que esta ficha se centra en las características conocidas del formato y la adaptación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, no confirmado) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 (4 bits, formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors adaptados a Apple Silicon) |

## Arquitectura y entrenamiento

El modelo es una conversión al formato MLX del checkpoint abliterado de Qwen3.8-27B. La arquitectura subyacente corresponde a un transformer de la serie Qwen3.8, aunque no se dispone de detalles específicos sobre número de capas, dimensión oculta o tipo de atención. El término "MTP" en el nombre indica que se conserva la capacidad de predicción múltiple de tokens, una técnica de decodificación que permite generar varios tokens por paso, mejorando el throughput en inferencia.

El proceso de abliteration aplicado por huihui-ai elimina las direcciones del espacio de activaciones que correlacionan con las respuestas de rechazo, de modo que el modelo deja de negarse a responder ciertos tipos de peticiones. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto: capacidades heredadas del modelo Qwen3.8-27B, que incluyen generación creativa, resumen y redacción.
- Razonamiento y matemáticas: se espera un rendimiento acorde al tamaño del modelo base, aunque no hay benchmarks disponibles en la información proporcionada.
- Generación de código: probablemente soportada por el modelo base, sin confirmación específica.
- Tool calling y uso de agentes: no confirmado, aunque los modelos Qwen3 suelen incluir soporte para función calling.
- Capacidades multilingües: no disponibles en la documentación.
- Abliterado: el modelo no muestra rechazo a preguntas sensibles o controvertidas, lo que facilita su uso en escenarios donde se requiere una respuesta directa.
- Decodificación MTP: soporte nativo de predicción múltiple de tokens para acelerar la generación.

## Casos de uso

- **Inferencia local en portátiles Apple**: gracias al formato MLX y la cuantización Q4, el modelo puede ejecutarse en un MacBook con al menos 16 GB de memoria unificada, ideal para desarrolladores que trabajan sin conexión o con privacidad de datos.
- **Prototipado de aplicaciones de chat**: permite montar un asistente conversacional local con calidad de modelo de 27B, usando herramientas como oMLX o llama.cpp con backend MLX.
- **Investigación de alineación**: el proceso de abliteración lo convierte en un objeto de estudio para analizar cómo afecta la eliminación de rechazos al comportamiento del modelo.
- **Generación de contenido sin restricciones**: útil para casos de uso creativo (narrativa, guiones, brainstorming) donde el modelo base limitaría las respuestas por rechazo.
- **Desarrollo de herramientas de código**: con el modelo base Qwen3.8, se puede integrar en entornos de desarrollo como autocompletado o asistente de programación local.
- **Análisis de documentos**: la ventana de contexto del modelo base (aunque no confirmada) podría permitir el procesamiento de documentos largos, aunque se recomienda verificar la longitud real antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización Q4 de 27B, se estiman unos 15-16 GB de memoria unificada, dependiendo de la longitud de contexto.
- **GPU recomendadas**: Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Pro, M3 Pro, M3 Max o superiores). No es compatible con NVIDIA ni AMD.
- **Consumer GPU**: no aplica, ya que el formato MLX es exclusivo de Apple Silicon.
- **Opciones de despliegue**: oMLX, MLX-LM, llama.cpp con backend MLX (en desarrollo), o cualquier runtime compatible con el formato MLX.
- **Latencia y throughput**: no disponible, aunque la decodificación MTP puede mejorar el rendimiento respecto a modelos sin esta característica.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos equivalentes de la misma categoría. Se recomienda consultar el repositorio del modelo base `huihui-ai/Huihui-Qwen3.8-27B-abliterated` para obtener comparativas con otros modelos de la familia Qwen3.

## Limitaciones y advertencias

- **Abliteration**: la eliminación de rechazos puede generar respuestas inapropiadas, sesgadas o dañinas. No se recomienda su uso en producción para aplicaciones públicas sin moderación adicional.
- **Riesgo de alucinación**: al igual que otros modelos de lenguaje, puede generar información falsa o inventada, especialmente en contextos extensos.
- **Formato propietario**: el formato MLX solo funciona en Apple Silicon, limitando su portabilidad a otras arquitecturas.
- **Cuántización Q4**: la pérdida de precisión puede afectar la calidad en tareas de razonamiento complejo o código.
- **Documentación incompleta**: no se han publicado especificaciones técnicas detalladas del modelo original (contexto, idiomas, benchmarks), por lo que se recomienda verificar estos datos antes de su uso.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/KostkaIT/Qwen3.8-27B-Huihui-Abliterated-oQ4e-MTP-MLX)
- [Versión oQ6e del mismo autor](https://huggingface.co/KostkaIT/Qwen3.8-27B-Huihui-Abliterated-oQ6e-MTP-MLX)
- [Modelo base abliterado por huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj)
- [Espejo en GitHub (solo manifest)](https://github.com/Ahaa43443/huihui-qwen3.8-27B-abliterated-mirror/blob/main/README.md)

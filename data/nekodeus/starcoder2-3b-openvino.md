# Nekodeus/starcoder2-3b-openvino

## Resumen

StarCoder2-3B OpenVINO es una conversión al formato OpenVINO IR del modelo base `bigcode/starcoder2-3b`, publicada por el usuario Nekodeus. Se trata de un modelo de generación de texto especializado en código, con 3.000 millones de parámetros y una ventana de contexto de 16.384 tokens, cuantizado en INT8 mediante pesos de solo peso (weight-only) con NNCF y exportado con `optimum-intel`. El objetivo de esta conversión es permitir la inferencia eficiente en CPU sin necesidad de GPU, algo relevante para entornos de desarrollo locales, CI/CD o despliegues en hardware modesto.

El modelo subyacente, StarCoder2-3B, forma parte de la familia StarCoder2 desarrollada por BigCode (colaboración entre Hugging Face y ServiceNow), entrenada sobre código con soporte de Fill-in-the-Middle (FIM) para tareas de completado. Esta conversión concreta no modifica los pesos más allá de la cuantización INT8, por lo que hereda las capacidades y limitaciones del modelo original, pero con un formato optimizado para el runtime de Intel.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de código de 3B en CPU con OpenVINO, un stack que no siempre está cubierto por las conversiones oficiales (que suelen publicarse en FP16). El repo ocupa 3,0 GB y se distribuye bajo licencia `bigcode-openrail-m`, con las restricciones comerciales que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Starcoder2ForCausalLM) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible (modelo centrado en código y texto, sin listado oficial de idiomas) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base StarCoder2-3B: un transformer decoder-only con atención causal, diseñado para generación de código y texto. Esta conversión no aporta cambios arquitectónicos; únicamente aplica cuantización INT8 a los pesos mediante NNCF y exporta el grafo a OpenVINO IR con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1` (versión fijada porque la imagen de Kaggle incluía una versión posterior que eliminaba `VisionRotaryEmbedding`, importada por optimum-intel). El proceso se realizó íntegramente en CPU y sin conexión.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO). Lo que sí se documenta es el soporte de Fill-in-the-Middle (FIM), una técnica de entrenamiento que permite al modelo completar código insertando texto entre un prefijo y un sufijo, muy útil para asistentes de autocompletado en editores. La conversión conserva esa capacidad.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación (heredado del modelo base).
- Completado de código con soporte de Fill-in-the-Middle (FIM), adecuado para integración en IDE.
- Generación condicionada por contexto largo: hasta 16.384 tokens de ventana.
- Ejecución en CPU mediante OpenVINO, sin requerir GPU.
- Inferencia con `optimum-intel` (Python) y OpenVINO GenAI (C++).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Autocompletado de código en editores: el soporte de FIM y el contexto de 16.384 tokens permiten integrar el modelo en plugins de IDE que completen fragmentos entre cursor y sufijo, con inferencia local en CPU.
- Asistencia en CI/CD para revisión de parches: se puede ejecutar en runners sin GPU para generar descripciones de cambios o sugerencias de corrección sobre diffs, gracias al bajo coste de un modelo de 3B en INT8.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede producir esqueletos de tests; su ventana de contexto permite incluir el módulo completo como referencia.
- Documentación técnica automatizada: generación de docstrings y comentarios a partir del código fuente, ejecutable en portátiles o servidores sin acelerador.
- Enseñanza y prototipado local: entornos educativos con hardware modesto pueden desplegar el modelo vía OpenVINO GenAI para prácticas de generación de código.
- Preprocesado de código en pipelines de datos: tareas de normalización, traducción entre lenguajes o generación de ejemplos sintéticos en CPU, donde el throughput no es crítico pero sí la ausencia de GPU.
- Despliegue en dispositivos edge con CPU Intel: al ser OpenVINO IR, encaja en entornos con CPU Intel (NUC, mini-PC) para asistentes de código offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el modelo está pensado para CPU. El repo ocupa 3,0 GB en disco (pesos INT8 + tokenizer/detokenizer).
- RAM estimada para inferencia en CPU: no disponible de forma oficial; como referencia, los pesos INT8 rondan los 3 GB, por lo que se recomienda al menos 8 GB de RAM para margen de trabajo.
- GPU recomendadas: no disponibles; la conversión está orientada a CPU. Para GPU se recomienda usar el modelo base en FP16/BF16 con otro runtime.
- ¿Cabe en GPU consumer? No es el objetivo de esta conversión; para GPU conviene usar `bigcode/starcoder2-3b` en precisión nativa.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), y cualquier stack compatible con OpenVINO IR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/starcoder2-3b-openvino | 3B | 16.384 | OpenVINO IR INT8 | bigcode-openrail-m | Conversión comunitaria, orientada a CPU |
| OpenVINO/starcoder2-3b-fp16-ov | 3B | 16.384 | OpenVINO IR FP16 | bigcode-openrail-m | Conversión oficial en FP16, mayor precisión y más peso en disco |
| bigcode/starcoder2-3b | 3B | 16.384 | safetensors | bigcode-openrail-m | Modelo base original, pensado para GPU |

## Limitaciones y advertencias

- Licencia `bigcode-openrail-m`: incluye restricciones de uso comercial y cláusulas de uso aceptable; es necesario revisar el texto completo antes de un despliegue en producción.
- Al ser una conversión comunitaria (0 descargas, 0 likes en el momento de la ficha), no cuenta con el respaldo de validación de una organización oficial; conviene verificar la calidad de la cuantización frente al modelo base.
- La cuantización INT8 weight-only puede introducir degradación en la calidad de generación respecto al modelo en FP16, especialmente en tareas de código sensibles a tokens exactos.
- Riesgo de alucinación inherente al modelo base: puede generar APIs, imports o fragmentos de código inexistentes.
- No se documentan sesgos específicos ni evaluación de idiomas; el modelo está centrado en código y su comportamiento en lenguaje natural no está caracterizado en esta conversión.
- El contexto de 16.384 tokens es amplio, pero el rendimiento en CPU puede degradarse con secuencias largas; no hay datos de latencia publicados.
- Dependencia de versiones concretas (`transformers 5.16.1`, `optimum-intel 2.2.0`, `openvino 2026.4.1`); cambios de versión pueden romper la carga del modelo.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse para pipelines que lo requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/starcoder2-3b-openvino
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Conversión oficial FP16 en OpenVINO: https://huggingface.co/OpenVINO/starcoder2-3b-fp16-ov

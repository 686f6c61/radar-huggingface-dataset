# amd/Laguna-XS-2.1_gpuep_1.0_gpu_128

## Resumen

Laguna-XS-2.1_gpuep_1.0_gpu_128 es una distribución cuantizada y empaquetada por AMD del modelo base poolside/Laguna-XS-2.1, un transformer de tipo mezcla de expertos (MoE) orientado a generación de texto. AMD ha convertido los pesos originales a formato ONNX y los ha optimizado para su ejecución mediante onnxruntime-genai sobre hardware AMD Ryzen AI, empleando una estrategia de cuantización INT4 con activaciones FP16 y agrupación por bloques de 128 (QMoE para los expertos, MatMulNBits para expertos compartidos y LM head).

El modelo resuelve el problema de desplegar un MoE de tamaño pequeño-medio en entornos de inferencia local sobre aceleradores AMD, reduciendo el peso del repositorio a 18,1 GB y habilitando ejecución con la pila ONNX Runtime GenAI. Es relevante para desarrolladores que trabajan con hardware Ryzen AI y necesitan un modelo conversacional en inglés con licencia permisiva, sin depender de CUDA ni de GPUs dedicadas de gran formato.

La información pública disponible es limitada: la model card de esta distribución se centra en la estrategia de cuantización y la licencia, y no detalla parámetros totales, longitud de contexto ni datos de entrenamiento. Cualquier dato de arquitectura interna del modelo base debe consultarse en la model card de poolside/Laguna-XS-2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); decoder de texto, sin componentes de visión ni embeddings multimodales |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero el número de parámetros activos no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con activaciones FP16; decoder RTN grupo 128; expertos MoE QMoE INT4 bloque 128; expertos compartidos INT4 MatMulNBits; LM head RTN grupo 32 INT4 MatMulNBits simétrico (accuracy_level 4) |
| Idiomas soportados | inglés (en) |
| Licencia | openmdw-1.1 (modelo base); modificaciones AMD bajo MIT |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de poolside, según indican las etiquetas del repositorio. Esta distribución de AMD no reentrena el modelo: parte de los pesos de poolside/Laguna-XS-2.1 y aplica una conversión a ONNX junto con cuantización INT4. La estrategia separa el tratamiento del decoder de texto (RTN con grupo 128 y activaciones FP16), los expertos MoE (QMoE INT4 con bloque de 128), los expertos compartidos (INT4 MatMulNBits) y la cabeza de lenguaje (RTN grupo 32, INT4 MatMulNBits simétrico con accuracy_level 4). No hay componentes de visión ni de embeddings multimodales: es un decoder exclusivamente de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas más allá de la propia cuantización QMoE y el uso de hip-ep (etiqueta presente en el repositorio) para el despliegue en hardware AMD. El empaquetado se ha realizado con Olive Mobius Builder.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y generación de contenido textual de propósito general (hereda las capacidades del modelo base, no detalladas en esta model card).
- Ejecución optimizada mediante onnxruntime-genai sobre hardware AMD Ryzen AI.
- Inferencia de texto puro: no incluye visión, audio ni embeddings multimodales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en equipos con Ryzen AI: el modelo puede desplegarse mediante onnxruntime-genai en portátiles y mini-PC con acelerador AMD, ofreciendo generación de texto en inglés sin necesidad de GPU dedicada.
- Prototipado de aplicaciones de chat en inglés: al estar cuantizado a INT4 y empaquetado en ONNX, permite iterar rápidamente en entornos de desarrollo con hardware AMD sin recompilar ni convertir pesos.
- Generación de texto en el borde (edge computing): el tamaño del repositorio (18,1 GB) y la cuantización INT4 lo hacen adecuado para despliegues en dispositivos con memoria limitada frente a la versión en FP16 del modelo base.
- Evaluación de la pila ONNX Runtime GenAI: sirve como referencia para medir el rendimiento de onnxruntime-genai y de la ruta hip-ep en hardware AMD antes de adoptar el stack en producción.
- Tareas de resumen y redacción en inglés: uso como modelo de texto general para procesar documentos y producir resúmenes o borradores, siempre que el contexto requerido encaje en la ventana del modelo base.
- Integración en pipelines de CI/CD para pruebas de inferencia: permite validar la conversión ONNX y la cuantización en entornos automatizados antes de desplegar variantes mayores del mismo modelo.
- Base para fine-tuning o destilación sobre hardware AMD: al ser una distribución ONNX cuantizada, puede servir como punto de partida para experimentos de despliegue eficiente, aunque el fine-tuning directo sobre pesos INT4 no es el flujo habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 18,1 GB en disco; al estar cuantizado a INT4 con activaciones FP16, la memoria necesaria para inferencia es sustancialmente menor que la de los pesos originales, pero no se publica una cifra exacta.
- GPU recomendadas: hardware AMD Ryzen AI (la model card indica optimización para Ryzen AI); no se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: orientado a aceleradores integrados y plataformas AMD Ryzen AI; no se documenta soporte para GPUs NVIDIA.
- Opciones de despliegue: onnxruntime-genai (librería principal); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Laguna-XS-2.1_gpuep_1.0_gpu_128 | no disponible (MoE) | no disponible | ONNX INT4 | openmdw-1.1 / MIT (modificaciones AMD) | Optimizado para Ryzen AI |
| poolside/Laguna-XS-2.1 | no disponible (MoE) | no disponible | safetensors (presumiblemente) | openmdw-1.1 | Modelo base sin cuantizar |
| Otros MoE pequeños de propósito general | no disponible | no disponible | varios | varios | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es una distribución cuantizada a INT4: puede presentar degradación de calidad respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base en esta model card.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- La licencia del modelo base es OpenMDW 1.1 y las modificaciones de AMD se distribuyen bajo MIT; es necesario cumplir ambas licencias para uso comercial.
- El despliegue está orientado a onnxruntime-genai y hardware AMD Ryzen AI; no se garantiza funcionamiento en otras pilas de inferencia.
- No se especifican la longitud de contexto ni el número de parámetros, lo que dificulta planificar despliegues en producción.
- El repositorio tiene pocas descargas (87) y ningún "like", lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Laguna-XS-2.1_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Licencia OpenMDW 1.1 (referencia en la model card del modelo base): https://huggingface.co/poolside/Laguna-XS-2.1

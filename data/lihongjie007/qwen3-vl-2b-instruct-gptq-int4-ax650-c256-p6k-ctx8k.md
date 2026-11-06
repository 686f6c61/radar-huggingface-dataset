# lihongjie007/Qwen3-VL-2B-Instruct-GPTQ-Int4-AX650-C256-P6K-CTX8K

## Resumen

Qwen3-VL-2B-Instruct es un modelo multimodal (visión y lenguaje) de la familia Qwen3-VL, desarrollado originalmente por Alibaba Qwen, en su variante de 2.000 millones de parámetros en modo instruct. La versión aquí descrita es una conversión comunitaria publicada por el usuario lihongjie007 en Hugging Face, que aplica cuantización GPTQ a 4 bits (Int4) y la empaqueta para el acelerador AX650, con un tamaño de repositorio de 3,0 GB.

El modelo resuelve tareas de comprensión conjunta de imagen y texto, además de generación de lenguaje: descripción de imágenes, respuesta a preguntas visuales (VQA), extracción de información de documentos y OCR, y razonamiento multimodal básico. Su interés actual reside en que permite desplegar un modelo visión-lenguaje en hardware de borde o aceleradores de bajo consumo gracias a la cuantización Int4, algo poco habitual en esta categoría.

La información publicada por el autor es mínima: la model card solo declara la licencia MIT, sin detallar arquitectura, datos de entrenamiento, idiomas ni resultados de evaluación. Los sufijos del nombre del repositorio (C256, P6K, CTX8K) sugieren configuraciones de compilación específicas para el acelerador AX650, pero no se documentan en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Qwen3-VL-2B-Instruct; no documentada en esta conversión) |
| Parámetros totales | 2B (según el nombre del modelo) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el sufijo CTX8K sugiere 8192 tokens, sin confirmar) |
| Tipos de cuantización | GPTQ Int4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 3,0 GB; presumiblemente formato específico para AX650, no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card de esta conversión. Por el nombre del modelo, se trata de una adaptación de Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL, pero el autor no detalla la composición del codificador visual, el mecanismo de fusión multimodal ni la configuración de capas y cabezas de atención.

Tampoco hay datos sobre el entrenamiento original (número de tokens, composición del corpus, uso de RLHF o DPO) ni sobre el proceso de cuantización aplicado: no se especifican el algoritmo GPTQ concreto, el tamaño de grupo, el dataset de calibración ni las métricas de degradación respecto al modelo en precisión completa. Los sufijos C256, P6K y CTX8K del nombre apuntan a parámetros de compilación para el acelerador AX650, pero su significado exacto no está documentado.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredadas del modelo base Qwen3-VL-2B-Instruct.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Procesamiento de documentos y OCR, capacidad habitual en la familia Qwen3-VL (no verificada en esta conversión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en dispositivos de borde: el modelo, cuantizado a Int4 y empaquetado para el acelerador AX650, puede ejecutar tareas de descripción de imágenes y VQA en equipos con recursos limitados, como cámaras inteligentes o terminales industriales.
- Extracción de datos de documentos escaneados: dado su origen en la familia Qwen3-VL, es adecuado para digitalizar facturas, albaranes o formularios mediante OCR y extracción estructurada, siempre que se valide la calidad tras la cuantización.
- Clasificación y filtrado de imágenes en pipelines locales: permite etiquetar o describir lotes de imágenes sin enviar datos a servicios en la nube, lo que resulta útil por privacidad y coste.
- Asistencia a personas con discapacidad visual: generación de descripciones de escenas en tiempo real sobre hardware embebido, con la ventaja de un modelo de 2B parámetros en Int4.
- Moderación de contenido visual: análisis de imágenes para detectar contenido no deseado en plataformas pequeñas que despliegan inferencia en local.
- Prototipado de aplicaciones multimodales: al ser un modelo pequeño y con licencia MIT, sirve para validar productos de visión-lenguaje antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Int4 y 2B parámetros, el peso de los pesos ronda los 1,2-1,5 GB; el repositorio ocupa 3,0 GB, lo que incluye artefactos adicionales de compilación.
- GPU recomendadas: no disponible. El repositorio está orientado específicamente al acelerador AX650, no a GPU convencionales.
- Compatibilidad con GPU de consumo: no confirmada; el formato de pesos no está documentado, por lo que no se puede garantizar su ejecución en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el nombre del repositorio sugiere un runtime propio del AX650.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-GPTQ-Int4-AX650 (este) | 2B | no disponible | GPTQ Int4 | MIT | Hugging Face (comunidad) |
| Qwen3-VL-2B-Instruct (original) | 2B | no disponible | FP16/BF16 | no disponible en esta ficha | Hugging Face (oficial) |
| Alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no documenta sesgos, por lo que se desconocen los sesgos específicos de esta conversión; los del modelo base Qwen3-VL-2B-Instruct no se detallan aquí.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje; la cuantización Int4 puede incrementarlo, aunque no hay métricas que lo cuantifiquen.
- No se especifican los idiomas soportados; no se puede asumir un rendimiento correcto en castellano sin evaluación previa.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo cuantizado.
- El formato de pesos y el runtime no están documentados; la integración en producción requerirá verificar la compatibilidad con el acelerador AX650 y descartar su uso en GPU estándar sin conversión adicional.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica ausencia de validación comunitaria.
- No hay información sobre la degradación de precisión introducida por la cuantización GPTQ respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/lihongjie007/Qwen3-VL-2B-Instruct-GPTQ-Int4-AX650-C256-P6K-CTX8K

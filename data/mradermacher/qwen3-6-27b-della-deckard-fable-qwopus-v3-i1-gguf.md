# mradermacher/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3`, preparadas por mradermacher. Se trata de un modelo de lenguaje de 27 000 millones de parámetros derivado de la familia Qwen3.6, que según la información disponible es un modelo denso de visión y lenguaje con mejoras en codificación agéntica y razonamiento STEM. La versión original es un merge que combina técnicas de fusión como `della_linear`, `task-arithmetic` y `two-stage` mediante mergekit.

El repositorio GGUF ofrece cuatro ficheros de cuantización (i1-Q2_K, i1-IQ3_M, i1-Q4_K_S y el archivo imatrix) pensados para ejecución local eficiente en CPU o GPU con presupuesto de VRAM limitado. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución, y el idioma principal soportado es el inglés.

Este modelo es relevante para desarrolladores que necesitan un LLM de 27B con capacidades de visión en formato GGUF, desplegable en hardware de consumo mediante llama.cpp, Ollama u otros ejecutores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso de la familia Qwen3.6, con componente de vision) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11.0 GB), i1-IQ3_M (12.9 GB), i1-Q4_K_S (15.9 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros individuales, no safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que la versión base es un merge de Qwen3.6-27B con la técnica `della_linear` (fusión lineal de parámetros) y `task-arithmetic`, en un proceso de dos etapas, generado con mergekit. El modelo original pertenece a la familia Qwen3.6, que según la documentación de QwenCloud es un modelo denso de lenguaje y visión con mejoras en codificación agéntica y razonamiento STEM.

No se han publicado detalles sobre el dataset de entrenamiento, la cantidad de tokens utilizados o el uso de RLHF/DPO. La cuantización fue realizada por mradermacher con el método imatrix (importance matrix) para preservar la calidad en las cuantizaciones de menor precisión.

## Capacidades

- Generación de texto en inglés con razonamiento general.
- Comprensión de imágenes (el modelo base es un modelo de visión de lenguaje, según la card del cuantizador).
- Capacidades de codificación agent y razonamiento STEM, según la descripción de QwenCloud para la familia Qwen3.6-27B.
- Soporte de tool calling no confirmado en la información proporcionada.
- No se dispone de información sobre funciones de agentes, multilingüismo o modos de pensamiento extendido.

## Casos de uso

- Ejecución local de un LLM de 27B en hardware de consumo: con la cuantización i1-Q4_K_S (15.9 GB) se puede desplegar en una GPU con 16-20 GB de VRAM (p. ej., RTX 4080/4090) para tareas de generación de texto e inferencia con imágenes.
- Prototipado de aplicaciones de visión de lenguaje: gracias a la capacidad de visión del modelo base, se puede usar para tareas de captions de imágenes, respuesta de preguntas visuales o análisis de documentos con OCR, aunque no se han publicado benchmarks específicos.
- Experimentación con merges y cuantizaciones: al ser un merge de Qwen3.6 con técnicas de fusión avanzadas, permite estudiar cómo afectan las cuantizaciones imatrix a la calidad de un modelo fusionado.
- Desarrollo de asistentes conversacionales en inglés: el modelo es de propósito general y puede integrarse en sistemas de chatbot o agentes de texto.
- Evaluación de la calidad de cuantizaciones: los distintos niveles (Q2_K, IQ3_M, Q4_K_S) permiten medir la degradación de rendimiento según la precisión, útil para optimizar despliegues en entornos con restricciones de memoria.
- Uso como modelo base para fine-tuning en GGUF: aunque no es habitual, se puede usar como punto de partida para experimentos de ajuste fino con la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_S ocupa 15.9 GB, por lo que se necesita al menos 16 GB de VRAM para carga completa; la Q2_K (11 GB) cabe en tarjetas de 12 GB como la RTX 3060.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_S, RTX 3060/4060 (12 GB) para Q2_K, o A100/H100 para despliegues con mayor contexto o batch.
- Ejecución en CPU: posible con llama.cpp, aunque la latencia será alta para un modelo de 27B; se recomienda GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier ejecutor compatible con GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría (Qwen3.5-27B, Qwen3.6-27B sin merge, o Llama 3.1 27B). La información proporcionada no incluye benchmarks ni evaluaciones comparativas. Se puede señalar que la familia Qwen3.6-27B se describe como superior a versiones anteriores en codificación agent y razonamiento STEM, pero no hay números concretos.

## Limitaciones y advertencias

- La información del modelo base es escasa: no se conocen detalles de arquitectura, contexto, dataset de entrenamiento ni benchmarks.
- El modelo está optimizado para inglés; el rendimiento en otros idiomas no está documentado.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para esta cuantización específica.
- Las cuantizaciones de baja precisión (Q2_K, IQ3_M) pueden degradar notablemente la calidad de la generación, especialmente en tareas de razonamiento.
- Es un modelo de visión, pero no se proporcionan los ficheros `mmproj` (proyectores de imagen) en este repositorio; se indica que están en el repositorio estático, lo que puede dificultar el uso de la funcionalidad de visión si no se descargan aparte.
- El tamaño de 27B requiere hardware con al menos 16 GB de VRAM para un uso razonable, y en CPU será muy lento.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3-i1-GGUF
- Modelo base (original): https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3-GGUF
- Documentación de Qwen3.6-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Página de modelo en Ollama: https://ollama.com/library/qwen3.6:27b
- Página de descarga del cuantizador: https://hf.tst.eu/model#Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3-i1-GGUF

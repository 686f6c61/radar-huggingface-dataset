# HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo **HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF** es una cuantización GGUF del modelo multimodal Qwen/Qwen3.8-27B, desarrollado por el usuario HauhauCS. Se trata de una variante modificada que elimina restricciones de contenido (etiqueta "uncensored") y presenta un estilo de respuesta agresivo, según el nombre del repositorio. Incluye además la técnica de predicción multi-token (MTP) para acelerar la generación.

Con 27 320 millones de parámetros, este modelo es capaz de procesar tanto texto como imágenes (pipeline image-text-to-text), lo que lo hace adecuado para tareas de visión y lenguaje. Está disponible en formato GGUF, lo que permite su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama. La licencia es Apache-2.0 y el acceso al repositorio está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace.

Su relevancia radica en ofrecer una alternativa local y sin censura para aplicaciones conversacionales y de análisis visual, aunque su uso en producción requiere precaución debido a la falta de filtros de contenido y a la ausencia de documentación técnica detallada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje) basado en Qwen3.8-27B |
| Parametros totales | 27 320 697 856 (27,3 mil millones) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en el repositorio; al ser GGUF, probablemente incluye varias (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre el entrenamiento de esta variante. Según los metadatos, se trata de una cuantización GGUF del modelo base Qwen/Qwen3.8-27B, que es un transformer multimodal con codificador de visión. La etiqueta "MTP" indica que incorpora predicción multi-token, una técnica de decodificación que permite predecir varios tokens a la vez para reducir la latencia.

El nombre "Uncensored" y "Aggressive" sugiere que el modelo ha sido adaptado para eliminar los mecanismos de rechazo de contenido sensible y para generar respuestas más directas o contundentes, aunque no se detallan los métodos utilizados (fine-tuning, DPO, etc.). Tampoco se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento conversacional en múltiples idiomas (inglés, chino y otros).
- Comprensión de imágenes: entrada de imágenes y texto, con salida de texto descriptivo o respuestas a preguntas visuales (image-text-to-text).
- Soporte de conversación multi-turno (etiqueta "conversational").
- Predicción multi-token (MTP) para acelerar la inferencia.
- Sin restricciones de contenido: el modelo no rechaza solicitudes sobre temas sensibles o prohibidos (según la etiqueta "uncensored").
- Compatible con endpoints de HuggingFace (etiqueta "endpoints_compatible").

No se ha confirmado soporte de tool calling, function calling o razonamiento multi-paso explícito.

## Casos de uso

- Asistente de visión local: el modelo puede analizar imágenes y responder preguntas sobre su contenido (objetos, escenas, texto incrustado) sin depender de APIs externas, gracias a su formato GGUF y su capacidad multimodal.
- Chatbot conversacional sin filtros: para entornos de investigación o desarrollo donde se necesita explorar respuestas sin restricciones de contenido, como estudios de alineación o análisis de sesgos.
- Generación de contenido creativo: redacción de textos, guiones o ideas con un tono directo y sin censura, útil para prototipos de herramientas de escritura.
- Análisis de documentos con imágenes: extracción de información de capturas de pantalla, gráficos o fotografías combinadas con texto, para tareas de automatización documental.
- Despliegue en entornos sin conexión: al ser GGUF, puede ejecutarse en portátiles o servidores con GPU de consumo mediante llama.cpp u Ollama, sin necesidad de conexión a internet.
- Investigación en seguridad de modelos: estudiar cómo se comporta un modelo sin mecanismos de rechazo ante prompts maliciosos o delicados, con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta variante específica. El modelo base Qwen3.8-27B podría tener resultados públicos, pero no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización GGUF elegida. Para una cuantización Q4_K_M (típica), se estima un consumo de unos 16-18 GB de VRAM; para Q8_0, alrededor de 27-29 GB. Valores orientativos basados en el tamaño de 27,3B parámetros.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superior para Q4; A100 40 GB o H100 para cuantizaciones más altas o mayor contexto.
- En GPU de consumo: sí, cabe en una RTX 4090 con cuantización Q4 y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) o servidores compatibles con endpoints de HuggingFace.
- Latencia y throughput: no disponibles. La técnica MTP puede reducir la latencia respecto a la decodificación autoregresiva estándar, pero no se proporcionan cifras.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa. El modelo es una variante específica de Qwen3.8-27B, que pertenece a la familia Qwen de Alibaba. Modelos comparables en tamaño serían Qwen2.5-32B o Llama 3.1 8B (menor), pero no se han encontrado datos de rendimiento para esta variante concreta. Se recomienda consultar las fichas del modelo base Qwen/Qwen3.8-27B para obtener referencias de rendimiento, aunque la modificación "uncensored" puede alterar los resultados.

## Limitaciones y advertencias

- Ausencia de filtros de contenido: al ser "uncensored", el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para aplicaciones orientadas al público general sin un sistema de moderación adicional.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o ambiguos.
- Sesgos desconocidos: no se documentan los datos de entrenamiento ni las técnicas de alineación, por lo que los sesgos del modelo base pueden persistir o haberse amplificado.
- Acceso restringido: el repositorio es gated, lo que requiere aceptar condiciones en HuggingFace. Esto puede limitar la reproducibilidad.
- Falta de documentación técnica: no se especifican detalles de arquitectura, contexto máximo, cuantizaciones disponibles ni resultados de evaluación, lo que dificulta su uso en producción.
- Licencia Apache-2.0: permite uso comercial, pero la ausencia de garantías y la naturaleza "uncensored" pueden generar responsabilidades legales si se utiliza en servicios públicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado otros enlaces (papers, blogs o demos) en la información proporcionada.

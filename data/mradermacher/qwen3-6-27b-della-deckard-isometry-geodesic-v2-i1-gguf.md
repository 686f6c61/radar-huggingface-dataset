# mradermacher/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2-i1-GGUF

## Resumen

El modelo Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2-i1-GGUF es una cuantización GGUF con imatrix del modelo base YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2, preparada por mradermacher para su uso en entornos de inferencia local con recursos limitados. El modelo base es un merge de tipo task-arithmetic basado en Qwen3.6, con capacidades de visión-lenguaje y un enfoque en razonamiento conciso (terse-reasoning). Está pensado para desarrolladores que necesitan ejecutar un modelo de 27B parámetros en hardware de consumo o en entornos con restricciones de memoria, aprovechando las ventajas de las cuantizaciones GGUF de baja precisión.

La cuantización i1-Q2_K reduce el tamaño del modelo a aproximadamente 11 GB, lo que permite su ejecución en GPUs con 12-16 GB de VRAM. Al ser un modelo multimodal (vision-language), puede procesar tanto texto como imágenes, aunque la información disponible no detalla la arquitectura exacta del codificador visual. El repositorio incluye únicamente el archivo de imatrix y la cuantización i1-Q2_K, mientras que las cuantizaciones estáticas adicionales se encuentran en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.6, merge por task-arithmetic |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1-Q2_K (11 GB), imatrix file; cuantizaciones estáticas adicionales en repositorio separado |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge de tipo task-arithmetic, lo que implica que se combinan pesos de varios modelos mediante operaciones aritméticas sobre los parámetros para lograr capacidades específicas, en este caso razonamiento conciso y visión-lenguaje. La arquitectura subyacente corresponde a la familia Qwen3.6, que es un transformer multimodal con módulos de atención estándar y un codificador visual para procesar imágenes. El tag "terse-reasoning" sugiere que el merge está optimizado para producir respuestas de razonamiento breves y directas, evitando explicaciones excesivamente largas. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La cuantización GGUF con imatrix (importance matrix) mejora la calidad de la cuantización al ponderar la importancia de cada tensor durante el proceso.

## Capacidades

- Generacion de texto y razonamiento: capaz de responder preguntas y resolver problemas con un estilo de razonamiento conciso.
- Vision-language: puede procesar imágenes junto con texto (requiere los archivos mmproj del repositorio estático).
- Multilingue: soporta chino e inglés.
- Compatible con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en servicios de inferencia estándar.
- Conversacional: optimizado para interacciones de chat multi-turno.
- Razonamiento terse: diseñado para dar respuestas directas sin divagaciones.

## Casos de uso

- Asistente de codigo en local: al ser un modelo de 27B cuantizado a 11 GB, puede ejecutarse en una RTX 4080 o 4090 para ayudar con generacion y revision de codigo en proyectos personales o de pequeno equipo, sin depender de APIs externas.
- Analisis de imagenes con contexto textual: gracias a su capacidad vision-language, puede describir imagenes o responder preguntas sobre ellas en entornos donde la privacidad impide usar servicios en la nube.
- Chatbot multilingue chino-ingles: adecuado para aplicaciones de atencion al cliente o asistentes virtuales que requieran alternar entre ambos idiomas con respuestas breves y directas.
- Prototipado rapido de agentes: al ser compatible con endpoints y tener razonamiento conciso, sirve para probar pipelines de agentes que necesitan respuestas rapidas y sin ruido.
- Procesamiento de documentos con imagenes: puede extraer informacion de capturas de pantalla, diagramas o formularios escaneados en combinacion con texto, util para automatizacion de oficina.
- Educacion y aprendizaje: como modelo local gratuito, permite a estudiantes y desarrolladores experimentar con un LLM multimodal sin coste de inferencia, ideal para proyectos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base (YFC-112358) no proporciona metricas de MMLU, HumanEval u otros en la documentacion accesible, y el repositorio de cuantizacion tampoco incluye datos de rendimiento. Se recomienda evaluar el modelo en las tareas especificas de uso antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: la cuantizacion i1-Q2_K ocupa 11 GB, por lo que se recomienda al menos 12-14 GB de VRAM para inferencia con contexto moderado. Para contextos largos o mayor velocidad, se necesitan 16 GB o mas.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090/3080 Ti (12-24 GB), o GPUs profesionales como A10/A100 si se requiere mayor throughput.
- Compatible con GPU de consumo: si, cabe en tarjetas con 12 GB o mas, aunque con cuantizaciones de baja precision la calidad puede degradarse.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de contexto. En una RTX 4090 se puede esperar una velocidad de 20-40 tokens/s con esta cuantizacion, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un merge especifico de la familia Qwen3.6, y no hay informacion publica sobre otros modelos con el mismo enfoque de razonamiento terse y vision. Como referencia, los modelos Qwen3.6-27B originales de Alibaba (si existieran) tendrian arquitectura similar pero sin el merge, y modelos como Qwen2.5-VL-27B o Llama-3.2-11B-Vision podrian ser alternativas, pero no se pueden establecer comparaciones numericas sin datos de benchmarks.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente en chino e ingles, puede mostrar sesgos culturales o linguisticos en otros idiomas.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se conoce la longitud de contexto exacta; se recomienda probar con ventanas pequenas antes de usarlo con documentos largos.
- Calidad de cuantizacion: la cuantizacion i1-Q2_K es de muy baja precision (2 bits), lo que puede degradar significativamente la calidad de las respuestas en comparacion con el modelo original en fp16.
- Licencia: no se ha especificado la licencia del modelo base, por lo que no se garantiza su uso comercial. Es necesario contactar con el autor o revisar el repositorio original antes de desplegarlo en produccion.
- Soporte de vision: los archivos mmproj (proyeccion de imagen) se encuentran en el repositorio estatico, no en este; sin ellos, el modelo no puede procesar imagenes.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2-GGUF
- Modelo base: https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2
- Ficha en LLM Explorer: https://llm-explorer.com/model/YFC-112358%2FQwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2,5zEJ4RgRZpL3kz5KZaiq5d
- Despliegue en FriendliAI: https://friendli.ai/models/YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2

# Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B es un modelo de razonamiento de 4.000 millones de parámetros, desarrollado por Jackrong, que consiste en un fine-tune del modelo base Qwen3.5-4B (de la familia Qwen3.5 de Alibaba) destilado a partir de las respuestas generadas por DeepSeek-V4-Pro en su modo Max Effect. El objetivo es trasladar las capacidades de razonamiento estructurado y resolución de problemas matemáticos y científicos de un modelo de gran tamaño a una clase de despliegue mucho más compacta y accesible.

El modelo sigue el mismo pipeline de entrenamiento y la misma mezcla de aproximadamente 250.000 muestras de matemáticas y STEM que la versión de 9B del mismo autor, pero orientado a un despliegue ligero. Se distribuye en formato GGUF, lo que permite ejecutarlo en entornos con recursos limitados mediante llama.cpp, Ollama u otras herramientas compatibles. La licencia es Apache 2.0, lo que facilita su uso comercial, y los idiomas soportados son inglés y chino.

La relevancia actual del modelo radica en que acerca las técnicas de destilación de razonamiento de modelos punteros (DeepSeek-V4-Pro) a un tamaño que cabe en GPUs de consumo, manteniendo un enfoque explícito en tareas de matemáticas y ciencia, con evaluación reportada en GSM8K y MMLU-Pro (Matemáticas, Física y Química).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-4B (detalles de capas y heads no disponibles) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se menciona evaluacion con cuantizacion MTP-Q8; lista completa no disponible) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen3.5-4B, del que hereda la arquitectura base. No se han publicado detalles sobre el número de capas, cabezas de atención o dimensión oculta en la información disponible. El entrenamiento consistió en un proceso de destilación (distillation) en el que se generaron aproximadamente 250.000 muestras de matemáticas y STEM utilizando DeepSeek-V4-Pro en modo Max Effect como profesor. Estas muestras se usaron para un fine-tune supervisado (SFT) del modelo base, siguiendo el mismo pipeline que la versión de 9B del mismo autor.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. El modelo incorpora la técnica de Multi-Token Prediction (MTP), como indica la etiqueta "mtp" y la evaluación con cuantización MTP-Q8, aunque no se detalla su implementación concreta. La evaluación se realizó sobre ejecuciones completas de GSM8K y muestras fijas de MMLU-Pro en las subcategorías de Matemáticas, Física y Química.

## Capacidades

- Razonamiento estructurado: el modelo aprende patrones de resolución multi-paso y descomposición explícita de problemas a partir del profesor DeepSeek-V4-Pro.
- Matematicas y STEM: entrenado específicamente con aproximadamente 250.000 muestras centradas en razonamiento matematico y cientifico.
- Generacion de texto: al ser un modelo de lenguaje basado en Qwen3.5, conserva capacidades generativas generales en ingles y chino.
- Razonamiento paso a paso: capaz de producir cadenas de razonamiento detalladas para problemas de matematicas y fisica.
- Despliegue ligero: al estar en formato GGUF, es compatible con inferencia en CPU y GPUs de consumo mediante llama.cpp, Ollama y otras herramientas.
- Compatible con text-generation-inference (TGI) segun las etiquetas del repositorio.

No se mencionan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar soluciones paso a paso para problemas de algebra, calculo o estadistica, sirviendo como asistente para estudiantes o como generador de ejercicios resueltos.
- Asistencia en tareas de fisica y quimica: dado su entrenamiento en STEM, puede explicar conceptos, resolver problemas de cinematica, termodinamica o estequiometria, y descomponer el razonamiento en pasos verificables.
- Generacion de contenido cientifico-tecnico: redaccion de explicaciones, resumenes o material divulgativo sobre temas de ciencia e ingenieria en ingles o chino.
- Prototipado de asistentes de razonamiento: al ser un modelo pequeno y rapido, es adecuado para experimentar con pipelines de razonamiento encadenado (chain-of-thought) en entornos de desarrollo sin necesidad de GPUs de alta gama.
- Inferencia en CPU o edge: gracias al formato GGUF y su tamano de 4B, puede desplegarse en servidores sin GPU o en dispositivos con memoria limitada para tareas de clasificacion, extraccion de informacion o generacion asistida.
- Fine-tune adicional para dominios especificos: al estar bajo licencia Apache 2.0, puede servir como base para ajustes posteriores en areas como diagnostico tecnico, tutoria personalizada o analisis de datos cientificos.

## Benchmarks y rendimiento

La model card menciona que el modelo fue evaluado en ejecuciones completas de GSM8K y en muestras fijas de MMLU-Pro (Matematicas, Fisica y Quimica), pero no se proporcionan los resultados numericos en la informacion disponible. No se han publicado cifras comparativas con otros modelos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 41,3 GB, lo que indica que contiene multiples archivos GGUF con diferentes cuantizaciones. Un modelo de 4B en cuantizacion Q4_K_M ocupa aproximadamente 2,5-3 GB, y en Q8_0 alrededor de 4,5-5 GB.
- VRAM estimada para inferencia: entre 3 GB y 6 GB dependiendo de la cuantizacion y la longitud de contexto utilizada.
- GPUs compatibles: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o incluso en tarjetas con 6 GB de VRAM usando cuantizaciones bajas.
- Inferencia en CPU: viable con llama.cpp u Ollama para cuantizaciones Q4 o inferiores, con rendimiento aceptable para uso interactivo.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos especificos. En una GPU consumer moderna, un modelo de 4B en Q4 puede generar del orden de 20-40 tokens por segundo, aunque esto depende del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a alternativas de la misma categoria. Como referencia estructural, puede compararse con otros modelos de ~4B orientados a razonamiento, aunque sin datos numericos no es posible establecer una comparacion rigurosa:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B | 4B | No disponible | Apache 2.0 | GGUF | Razonamiento matematico y STEM (destilado) |
| Qwen3.5-4B (base) | 4B | No disponible | Apache 2.0 | Safetensors/GGUF | Modelo base generalista |
| Qwen2.5-3B | 3B | 32K (tipico) | Apache 2.0 | Safetensors/GGUF | Generalista, multilingue |

No disponible: no se han publicado comparativas directas con resultados numericos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno entrenado principalmente en matematicas y STEM, puede generar respuestas incorrectas o inventar datos en dominios fuera de su especialidad. Es recomendable verificar los resultados en aplicaciones criticas.
- Limitacion de idiomas: solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Contexto limitado: no se ha especificado la longitud de contexto, por lo que no se puede asegurar un rendimiento fiable en conversaciones o documentos largos.
- Sin capacidades multimodales: no soporta vision, audio ni otras modalidades.
- Sin tool calling ni funciones de agente: no se mencionan capacidades de llamada a herramientas, lo que limita su uso en pipelines agénticos complejos.
- Riesgo de sobreajuste al dominio: al estar destilado de un profesor especifico, puede heredar estilos de razonamiento particulares que no siempre sean los mas eficientes.
- Datos de entrenamiento no auditados: no se proporciona informacion detallada sobre la composicion del dataset de 250.000 muestras, lo que dificulta evaluar posibles sesgos.
- Para uso en produccion, se recomienda validar el modelo en el dominio concreto y considerar la cuantizacion elegida, ya que cuantizaciones muy agresivas pueden degradar la calidad del razonamiento.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF
- Repositorio HuggingFace (modelo base, safetensors): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base original: https://huggingface.co/unsloth/Qwen3.5-4B

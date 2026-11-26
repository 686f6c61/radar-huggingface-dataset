# rdcmedia/gliner2.5-base

## Resumen

`rdcmedia/gliner2.5-base` es una conversión al formato ONNX del modelo `fastino/gliner2.5-base-v1`, publicada por RDC Media Ltd. GLiNER2 es una familia de modelos de extracción de información (reconocimiento de entidades nombradas, NER) de tipo zero-shot: permiten definir las etiquetas de entidad en tiempo de inferencia mediante prompts en lenguaje natural, sin necesidad de reentrenar. El modelo original lo desarrolla Fastino, y esta versión solo cambia el formato de pesos para facilitar el despliegue en entornos de producción basados en ONNX Runtime.

La relevancia de esta ficha es acotada: el repositorio es una conversión técnica, no un modelo nuevo. La model card es mínima (una sola línea que atribuye el modelo original y su licencia), no se declaran idiomas soportados ni pipeline, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Cualquier evaluación de capacidades debe remitirse al modelo original `fastino/gliner2.5-base-v1`.

La información disponible no permite confirmar arquitectura interna, número de parámetros, longitud de contexto ni datos de entrenamiento. El tamaño del repositorio (0,7 GB) es coherente con un modelo de la gama "base" exportado a ONNX, pero no se ha publicado el desglose de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original: GLiNER2, familia de extracción de información zero-shot; detalles internos no disponibles) |
| Parametros totales | no disponible (tamaño de repo 0,7 GB, orientativo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX; no se detallan precisiones FP32/FP16/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la información disponible. La model card solo indica que se trata de una conversión ONNX del modelo `fastino/gliner2.5-base-v1` (Apache 2.0) realizada por RDC Media Ltd. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo ajuste con RLHF o DPO.

Por la naturaleza declarada del modelo original (GLiNER2, extracción de entidades zero-shot), cabe esperar una arquitectura de tipo encoder con cabecera de clasificación de spans condicionada por prompts de etiquetas, pero esto no se confirma en la información proporcionada y debe verificarse en la documentación del modelo original.

## Capacidades

- Extracción de entidades nombradas zero-shot: definición de etiquetas en tiempo de inferencia mediante prompts en lenguaje natural (según la familia GLiNER2 del modelo original).
- Despliegue en runtime ONNX: ejecución mediante ONNX Runtime, compatible con pipelines de producción que evitan dependencias de PyTorch.
- Generación de texto: no disponible / no aplicable según la información proporcionada.
- Razonamiento, matemáticas, código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Extracción de entidades en pipelines de datos: uso del modelo ONNX para identificar personas, organizaciones, ubicaciones o entidades personalizadas en documentos, definiendo las etiquetas en tiempo de ejecución sin reentrenamiento.
- Procesamiento por lotes en servidores sin GPU: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en CPU, lo que facilita el procesamiento masivo de textos en infraestructura estándar.
- Integración en servicios .NET, Java o C++: ONNX Runtime dispone de bindings en múltiples lenguajes, lo que permite incorporar la extracción de entidades en aplicaciones que no usan Python.
- Anonimización y cumplimiento normativo: detección de datos personales (nombres, direcciones, identificadores) en textos antes de su almacenamiento o compartición, con etiquetas adaptadas al dominio.
- Enriquecimiento de bases de datos documentales: extracción estructurada de campos a partir de contratos, informes o correos, con esquemas de etiquetas definidos por caso de uso.
- Prototipado rápido de tareas NER: evaluación de un extractor zero-shot antes de invertir en un modelo entrenado específicamente, usando el formato ONNX para despliegues ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,7 GB) sugiere que la inferencia en FP32 puede requerir del orden de 1-2 GB de memoria, pero es una estimación orientativa no confirmada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en tarjetas con 4 GB o más de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU y GPU); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están indicadas y, para un modelo de extracción de entidades, no serían el entorno habitual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Contexto | Idiomas | Notas |
|---|---|---|---|---|---|
| rdcmedia/gliner2.5-base | ONNX | Apache 2.0 | no disponible | no disponible | Conversión de fastino/gliner2.5-base-v1 |
| fastino/gliner2.5-base-v1 | no disponible | Apache 2.0 | no disponible | no disponible | Modelo original; referencia para capacidades y benchmarks |
| GLiNER (versiones previas) | PyTorch | Apache 2.0 | no disponible | no disponible | Familia predecesora de extracción zero-shot; comparación no verificada en la información disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es mínima: no se documentan idiomas, contexto, arquitectura ni evaluación, lo que dificulta validar el comportamiento en producción.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso comunitario ni de mantenimiento.
- Al ser una conversión de terceros, puede haber divergencias numéricas respecto al modelo original en PyTorch; conviene validar las salidas contra `fastino/gliner2.5-base-v1`.
- Riesgo de alucinación y de falsos positivos inherente a los modelos de extracción zero-shot cuando las etiquetas son ambiguas o el dominio es muy específico; requiere evaluación con datos propios.
- No se especifican sesgos conocidos; deben evaluarse en el modelo original y en el corpus de aplicación.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; verificar la licencia del modelo original y de sus dependencias.
- No se garantiza soporte de la autora del repositorio ni actualizaciones futuras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rdcmedia/gliner2.5-base
- Modelo original: https://huggingface.co/fastino/gliner2.5-base-v1
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.

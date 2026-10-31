# Shelled/piane

## Resumen

Piane es un modelo publicado en Hugging Face por el usuario Shelled, del que apenas existe documentación pública: la model card se limita a declarar la licencia y no incluye descripción, arquitectura, datos de entrenamiento ni instrucciones de uso. Según los metadatos disponibles, se trata de un modelo exportado a formato ONNX con un repositorio de 0,2 GB, creado el 30 de octubre de 2026, sin etiqueta de pipeline asignada y sin registro de descargas ni valoraciones hasta la fecha.

La ausencia de documentación impide determinar la tarea que resuelve. El nombre del repositorio podría sugerir una relación con la generación de música o audio (piano), pero se trata de una hipótesis no confirmada por el autor. El formato ONNX indica al menos que el modelo está pensado para inferencia optimizada multiplataforma mediante ONNX Runtime, presumiblemente tras ser entrenado en un framework como PyTorch o TensorFlow y exportado posteriormente.

Su relevancia práctica actual es limitada: sin model card, benchmarks ni comunidad de usuarios, se trata de un repositorio opaco que requiere verificación y pruebas independientes antes de considerar cualquier uso, experimental o productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (tamaño del repositorio: 0,2 GB) |
| Parámetros activos | no disponible (no consta si el modelo es de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |
| Etiqueta de pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 30 de octubre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo: no consta si se trata de un transformer, un modelo de difusión, una red convolucional o cualquier otro tipo de arquitectura. Tampoco hay datos sobre el número de parámetros, el conjunto de datos de entrenamiento, el número de tokens procesados ni sobre el uso de técnicas como RLHF o DPO.

El único dato técnico fiable es el formato de distribución: ONNX (Open Neural Network Exchange), un formato de intercambio independiente del framework que permite ejecutar el modelo con ONNX Runtime sobre CPU, GPU o aceleradores dedicados. El tamaño del repositorio (0,2 GB) indica que se trata de un modelo de tamaño contenido, muy lejos de la escala de los grandes modelos lingüísticos actuales, aunque no permite deducir el número exacto de parámetros ni la precisión de los pesos.

## Capacidades

No es posible determinar las capacidades del modelo a partir de la información disponible. No se ha publicado documentación sobre sus funciones ni existe etiqueta de pipeline en Hugging Face que indique su categoría de tarea (generación de texto, clasificación, audio, visión, etc.).

Lo único que puede afirmarse con certeza es que, al estar distribuido en formato ONNX, el modelo es compatible con los ecosistemas de inferencia basados en ONNX Runtime (Python, C++, C#, Java, JavaScript), siempre que el runtime utilizado soporte los operadores (opset) empleados en su exportación. No hay evidencia de soporte de tool calling, agentes, capacidades multilingües ni modalidades concretas.

## Casos de uso

No pueden establecerse casos de uso concretos y realistas para este modelo, ya que ni el autor ni Hugging Face documentan la tarea que realiza. Inventarlos contradiría el rigor exigido en esta ficha.

A título meramente orientativo, los modelos distribuidos en formato ONNX se destinan habitualmente a escenarios de despliegue como inferencia en CPU, aplicaciones de escritorio, dispositivos edge, móviles o navegadores web mediante WebAssembly. Estos escenarios son características generales del formato ONNX y no capacidades confirmadas de Piane: antes de cualquier aplicación práctica sería necesario inspeccionar los ficheros del repositorio, ejecutar el modelo en un entorno controlado y verificar qué produce realmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las estimaciones siguientes se derivan únicamente del tamaño del repositorio (0,2 GB); no hay cifras oficiales de consumo de memoria.

- Memoria estimada para inferencia: un modelo de 0,2 GB debería ocupar en memoria un orden de magnitud similar a su tamaño en disco, es decir, del orden de unos cientos de megabytes, con margen para los buffers de ejecución. No requeriría una GPU dedicada en principio.
- GPU recomendadas: no disponible. Por tamaño, no debería ser necesaria una GPU de gama alta (A100, H100, RTX 4090); de requerirse aceleración, bastaría con cualquier GPU moderna mediante los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML).
- Hardware de consumo: sí. Cualquier ordenador moderno con 4-8 GB de RAM debería poder cargar y ejecutar un modelo de este tamaño, también portátiles y equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), onnxruntime-web para ejecución en navegador, DirectML en Windows, OpenVINO en hardware Intel y execution providers de CUDA/TensorRT en NVIDIA. Herramientas habituales para LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a pesos en formato ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse la tarea que realiza el modelo, su arquitectura y su rendimiento, no es posible identificar alternativas comparables de forma rigurosa. Cualquier comparación con otros modelos sería especulativa y no aportaría valor de evaluación real.

## Limitaciones y advertencias

- Documentación inexistente: la model card está vacía. No se conocen los datos de entrenamiento, la arquitectura, los sesgos potenciales ni las limitaciones del modelo, lo que impide cualquier auditoría previa a su uso.
- Sin validación comunitaria: con 0 descargas y 0 likes, no hay evidencia de que nadie haya probado el modelo ni de que funcione correctamente.
- Procedencia no verificable: el autor no ofrece información verificable sobre el origen del modelo. Se recomienda tratar el repositorio como código no confiable y ejecutarlo solo en entornos aislados.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Cualquier obra derivada debe distribuirse bajo la misma licencia, y en el caso de ofrecer el modelo como servicio en red, la AGPL exige poner a disposición el código fuente de las modificaciones. Esto la hace problemática para productos comerciales cerrados o SaaS propietarios.
- Riesgo de alucinación: no evaluable, dado que ni siquiera consta si el modelo es generativo.
- Compatibilidad técnica: al no publicarse la versión de opset ni los requisitos de ONNX Runtime, pueden surgir incompatibilidades al cargar el modelo según la versión del runtime.
- Estado preliminar: el repositorio se creó y actualizó el mismo día (30 de octubre de 2026), lo que sugiere una publicación reciente y posiblemente incompleta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shelled/piane
- La búsqueda web no ha devuelto enlaces relevantes (papers, blogs, repositorios de código ni demos) relacionados con este modelo.
- Recurso general de referencia para el formato de pesos (no procedente de la búsqueda): documentación oficial de ONNX Runtime — https://onnxruntime.ai

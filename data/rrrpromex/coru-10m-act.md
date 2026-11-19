# rrrpromex/CORU-10M-ACT

## Resumen

CORU-10M-ACT es un modelo alojado en Hugging Face por el usuario rrrpromex, publicado bajo licencia Apache 2.0. Segun los metadatos del repositorio, cuenta con 9.995.264 parametros (aproximadamente 10 millones), lo que lo situa en la categoria de modelos muy pequenos, por debajo de la mayoria de modelos de lenguaje de proposito general actuales. El identificador incluye el sufijo "ACT", que podria sugerir un modelo de tipo actor o de politica para aprendizaje por refuerzo, pero esta interpretacion no esta confirmada por la informacion disponible.

La model card publicada no contiene mas que la declaracion de licencia, sin descripcion del modelo, arquitectura, datos de entrenamiento ni capacidades. El repositorio no registra descargas ni likes, y su tamano es de 0.0 GB, lo que indica que los pesos podrian no estar efectivamente subidos o que el contenido es minimo. Los unicos datos tecnicos verificables son el numero de parametros derivado de los tensores en formato safetensors y la licencia.

Por tanto, esta ficha se limita a documentar lo que consta en los metadatos y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. No debe interpretarse como una evaluacion de capacidades reales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.995.264 (aproximadamente 10 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El unico indicio es el sufijo "ACT" en el nombre, que no viene acompanado de ninguna explicacion en la model card. No consta si se trata de un transformer, un modelo de politica para aprendizaje por refuerzo, un clasificador o cualquier otra variante.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, procedencia), sobre tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas. El repositorio no incluye documentacion adicional, paper ni blog asociado.

## Capacidades

- No se han documentado capacidades en la informacion disponible.
- No consta soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- No consta ningun modo especial (thinking mode, audio, etc.).

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin informacion sobre la arquitectura, el entrenamiento y las capacidades del modelo. Cualquier escenario de produccion que se planteara seria especulativo. Se recomienda contactar con el autor o consultar futuras actualizaciones de la model card antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 10 M de parametros, los pesos en precision completa (FP32) ocuparian unos 40 MB; en FP16, unos 20 MB; en cuantizacion de 8 bits, unos 10 MB. Estas cifras son calculos aritmeticos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna, e incluso CPU, seria suficiente para alojar los pesos por memoria, aunque el rendimiento real depende de la arquitectura, que se desconoce.
- Cabe en cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, RTX 4090) por requisito de memoria.
- Opciones de despliegue: al estar en safetensors, seria compatible con frameworks que carguen este formato (PyTorch, Transformers si la arquitectura esta soportada), pero no consta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque no se ha identificado la tarea ni la arquitectura del modelo.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay descripcion, instrucciones de uso ni ejemplos.
- Se desconoce la arquitectura, por lo que no se puede garantizar que sea cargable con frameworks estandar.
- El repositorio registra 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar disponibles o que el modelo no ha sido validado por la comunidad.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse el origen de los datos de entrenamiento no se puede evaluar el riesgo legal asociado.
- No debe utilizarse en produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Enlaces

- Hugging Face: https://huggingface.co/rrrpromex/CORU-10M-ACT
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

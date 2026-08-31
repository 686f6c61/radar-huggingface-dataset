# AaravSharmapag/dissertation-image-captioning

## Resumen

El repositorio `AaravSharmapag/dissertation-image-captioning` no contiene un modelo de aprendizaje automático entrenado, sino un conjunto de notas de investigación y un esbozo de experimento sobre generación de descripciones de imágenes (image captioning). El autor, Aarav Sharma, publica bajo licencia CC-BY-4.0 un documento de trabajo que recoge el alcance de una pregunta de investigación, posibles factores de confusión, una propuesta de comparación con líneas base, y contextos de evaluación concretos como MS COCO Captions, NoCaps y TextCaps. El repositorio incluye un único archivo de pesos en formato safetensors con 16.576 parámetros, un valor extremadamente bajo que sugiere que se trata de un artefacto simbólico o de prueba, no de un modelo funcional.

La relevancia de este repositorio es exclusivamente académica: sirve como material de referencia para investigadores que quieran entender cómo se plantea un estudio riguroso de image captioning, con énfasis en reproducibilidad y en la distinción entre hipótesis y resultados. No ofrece capacidades de inferencia, ni demos, ni código ejecutable. La model card es explícita al afirmar que no se reivindican mejoras de benchmarks, ni ablaciones completas, ni checkpoints entrenados. Por tanto, cualquier uso práctico como modelo de generación de texto o de captions es inviable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de red neuronal en la informacion disponible. El repositorio contiene un archivo de pesos de 16.576 parametros, un tamano que no corresponde a ningun modelo conocido de image captioning (los modelos tipicos tienen decenas o cientos de millones de parametros). Es probable que ese archivo sea un placeholder o un artefacto residual, no un modelo entrenado. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens, ni tecnicas de optimizacion como RLHF o DPO. La model card indica que el documento principal (`paper_notes.md`) es un esbozo de experimento, con secciones marcadas como planes o hipotesis, y que no se han realizado pruebas. Por tanto, no existe informacion sobre arquitectura, entrenamiento o innovaciones tecnicas.

## Capacidades

- No es un modelo funcional: no puede generar texto, codigo, ni descripciones de imagenes.
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision.
- Su unico contenido util son las notas de investigacion que documentan el diseno de un estudio sobre image captioning, incluyendo referencias a datasets y metricas de evaluacion.
- No dispone de modo de pensamiento (thinking mode) ni de procesamiento de audio o video.

## Casos de uso

Dado que no es un modelo entrenado, no existen casos de uso de inferencia. Los unicos usos posibles son academicos y de documentacion:

- Consulta de referencias bibliograficas sobre image captioning: el repositorio recopila topicos relevantes y enlaces a la literatura, util para estudiantes que inician una revision bibliografica.
- Diseno de experimentos: el esbozo de comparacion con lineas base y la lista de datasets (MS COCO, NoCaps, TextCaps) sirven como guia para planificar un estudio propio.
- Verificacion de reproducibilidad: las notas enfatizan la necesidad de incluir versiones de dataset, comandos, semillas, hardware y logs, lo que puede servir como plantilla para buenas practicas.
- Identificacion de factores de confusion: el documento discute posibles variables que afectan a la evaluacion de captions, util para evitar sesgos metodologicos.
- Material docente: puede usarse en cursos de vision por computador o procesamiento de lenguaje natural para ilustrar como se estructura una investigacion.
- Punto de partida para implementar un modelo real: las notas proponen un plan de experimentos que un investigador podria ejecutar con un modelo existente, aunque el repositorio no proporciona codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se reivindican mejoras de rendimiento ni se han completado ablaciones. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de image captioning como CIDEr o BLEU.

## Requisitos de hardware

No aplica. Al no ser un modelo entrenado, no requiere VRAM, GPU ni ningun recurso de inferencia. El archivo de pesos de 16.576 parametros es despreciable en tamano, pero no es utilizable para ninguna tarea. No hay opciones de despliegue con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo funcional. Los modelos reales de image captioning (como BLIP, GIT o OFA) tienen arquitecturas complejas, millones de parametros y resultados publicados, mientras que este repositorio es solo un documento de notas.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier intento de usarlo para inferencia fallara o producira resultados sin sentido.
- La model card advierte que las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales.
- No se incluye codigo, ni scripts de entrenamiento, ni instrucciones de uso.
- La licencia CC-BY-4.0 permite uso y adaptacion con atribucion, pero no garantiza la calidad ni la exactitud de las notas.
- Los datasets externos mencionados (MS COCO, NoCaps, TextCaps) tienen sus propios terminos de uso que deben revisarse por separado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AaravSharmapag/dissertation-image-captioning
- Perfil del autor: https://huggingface.co/AaravSharmapag
- Articulo de referencia sobre image captioning (arXiv): https://arxiv.org/html/2408.15714
- Revision en Springer: https://link.springer.com/article/10.1007/s11042-024-20095-0
- Encuesta en IEEE: https://ieeexplore.ieee.org/document/10250630
- Vision general en ScienceDirect: https://www.sciencedirect.com/topics/computer-science/image-captioning

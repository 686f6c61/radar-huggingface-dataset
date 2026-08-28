# Llubisjacky/study-embodied-ai

## Resumen

El repositorio `Llubisjacky/study-embodied-ai` no contiene un modelo de inteligencia artificial entrenado, sino un conjunto de notas de lectura y un esbozo de experimento sobre IA encarnada (embodied AI). Su autor, Llubisjacky (Jacky Lubis), publica este material bajo licencia MIT con el objetivo explícito de documentar el alcance de una pregunta de investigación, los posibles factores de confusión, una propuesta de comparación con líneas base emparejadas y los benchmarks públicos relevantes. La model card advierte de forma expresa que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales.

El repositorio contiene un único tensor de 24.832 parámetros en formato safetensors, lo que descarta que se trate de un modelo de lenguaje o de cualquier arquitectura de aprendizaje profundo con utilidad práctica. Se trata de un artefacto de investigación, no de un modelo desplegable. Su relevancia actual reside en su valor como referencia bibliográfica y metodológica para quienes trabajan en IA encarnada, no como recurso de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | 24.832 (tensor safetensors, sin arquitectura asociada) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (un unico tensor, sin definicion de red) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene dos archivos: `summary.md` (la nota principal) y `README.md` (esta documentacion). El tensor safetensors de 24.832 parametros no corresponde a ningun modelo conocido ni se describe su funcion en la model card. El autor indica que el material es exploratorio y que no se han realizado ablaciones completas, ni se ha liberado codigo, ni existe un checkpoint entrenado. Las referencias a datasets y benchmarks son propuestas para verificacion futura, no evidencia de experimentos ya ejecutados.

## Capacidades

- No es un modelo generativo ni de razonamiento.
- No soporta generacion de texto, codigo, vision, audio ni tool calling.
- No es un agente ni tiene capacidades multilingues.
- Su unico contenido util son las notas de investigacion sobre IA encarnada: alcance de la pregunta, confounders, comparacion con baselines, benchmarks publicos, comprobaciones de reproducibilidad y modos de fallo.
- No puede ejecutarse en ningun framework de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.).

## Casos de uso

- Referencia bibliografica para investigadores que inician un proyecto en IA encarnada: la nota `summary.md` resume el estado de la cuestion y senala las lagunas que aun requieren experimentacion.
- Guia metodologica para disenar estudios comparativos con lineas base emparejadas en tareas de interaccion fisica o navegacion.
- Punto de partida para seleccionar benchmarks publicos apropiados en evaluaciones de agentes encarnados.
- Material docente para cursos de posgrado sobre IA encarnada, ya que explicita las limitaciones y los pasos de verificacion necesarios antes de aceptar resultados.
- Ejemplo de buenas practicas en publicacion de notas de investigacion: separa claramente hipotesis de resultados y exige que cualquier resultado futuro incluya versiones de dataset, comandos, semillas, hardware y logs crudos.
- Recurso para revisores o editores que necesitan entender los estandares de reproducibilidad en este subcampo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta metricas de ningun tipo y la model card descarta explicitamente que existan mejoras de rendimiento o evaluaciones completadas.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar.
- El unico archivo safetensors (24.832 parametros) es trivial en tamano, pero no esta asociado a ninguna red definida, por lo que no puede cargarse en ningun framework.
- No se requieren GPU ni VRAM para consultar las notas de texto.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque este repositorio no es un modelo de IA. Otros repositorios de notas de investigacion en IA encarnada (por ejemplo, `felixlehmann/embodied-ai-study87`) pueden servir como referencias de contenido, pero no son modelos comparables en terminos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe usarse para inferencia, generacion ni ninguna tarea de IA.
- El tensor safetensors carece de definicion de arquitectura, por lo que es inutil en la practica.
- Las secciones de la nota marcadas como planes o hipotesis no constituyen evidencia experimental.
- No hay codigo liberado, ni checkpoints, ni evaluaciones reproducibles.
- La licencia MIT aplica al repositorio, pero los datos externos citados en la nota pueden tener sus propios terminos de uso que deben revisarse por separado.
- Cualquier resultado futuro anadido al repositorio deberia incluir versiones de dataset, comandos, semillas, hardware y logs crudos, tal como exige el propio autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Llubisjacky/study-embodied-ai
- Perfil del autor en Hugging Face: https://huggingface.co/Llubisjacky
- Referencia academica sobre IA encarnada: https://link.springer.com/rwe/10.1007/978-981-97-8440-0_8-1
- Coleccion de Nature sobre IA encarnada: https://www.nature.com/collections/ibgfciaafb
- Articulo de arXiv "Embodied AI: From LLMs to World Models": https://arxiv.org/abs/2509.20021

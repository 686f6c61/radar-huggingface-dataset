# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-fp16-novision

## Resumen

Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-fp16-novision es una publicacion de la comunidad alojada en HuggingFace por el usuario Johneeee. Se trata de un artefacto derivado de la familia Qwen: el campo `model_type` declarado en la model card es `qwen3_5`, y el nombre del repositorio indica un supuesto tamano de 27B junto con una cadena de sufijos ("TWIN", "TURBO", "Fable", "Cold-Fusion", "709-L", "Uncensored", "novision") que responde a convenciones habituales de fusion de pesos y ajuste sin censura. El dato verificable es el recuento real de parametros en los ficheros safetensors: 26.895.998.464 parametros, es decir, aproximadamente 26,9B.

El modelo no es un entrenamiento desde cero ni una publicacion oficial del fabricante del modelo base: es una cuantizacion mixta de 5 bits generada con la herramienta oQ (oMLX v0.6.4, repositorio github.com/jundot/omlx), empaquetada en formato safetensors de MLX. El repositorio ocupa 19,2 GB. La relevancia de esta ficha es acotada: se trata de un artefacto con 0 descargas y 1 "like" en el momento de la consulta, sin model card tecnica mas alla de los parametros de cuantizacion, sin licencia declarada, sin idiomas declarados y sin resultados de evaluacion publicados.

Por tanto, esta ficha se limita a documentar lo que consta de forma explicita y a marcar como "no disponible" todo aquello que no aparece en la informacion proporcionada. No se han localizado en la busqueda web fuentes relevantes sobre este repositorio: los resultados devueltos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` declarado es `qwen3_5`; no se detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (~26,9B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (oMLX v0.6.4) mixta, 5 bits, group size 64; componentes en fp16 |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors de MLX (`library_name: mlx`) |
| Tamano del repositorio | 19,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-09-12 |
| Fecha de ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card publicada por el autor se limita a documentar la cuantizacion y no incluye ninguna seccion sobre arquitectura o entrenamiento. El unico dato estructural declarado es `model_type: qwen3_5`, que situa el modelo dentro de la familia Qwen, pero sin especificar variante, configuracion de atencion ni estrategia de posiciones.

Lo unico documentado es el proceso de cuantizacion posterior: se aplico cuantizacion de precision mixta con la herramienta oQ (oMLX v0.6.4) a 5 bits con group size 64, generando pesos en formato safetensors de MLX. El sufijo "novision" del nombre sugiere la ausencia de componentes multimodales de vision, y el sufijo "Uncensored" apunta a un ajuste orientado a reducir rechazos o filtros de contenido, pero ninguna de estas dos caracteristicas esta confirmada por documentacion tecnica en la informacion disponible.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base de la familia Qwen, aunque no verificada ni documentada en la informacion proporcionada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision: el nombre del repositorio incluye el sufijo "novision", lo que sugiere ausencia de capacidades multimodales, pero no hay confirmacion documental.
- Modo "thinking": no disponible.
- Audio: no disponible.
- Ajuste "uncensored": el nombre lo indica, pero no hay documentacion que describa metodologia ni alcance.

## Casos de uso

Dado que no hay informacion sobre capacidades verificadas, licencia ni rendimiento, los casos de uso que siguen son escenarios genericos de evaluacion para un modelo denso de ~27B cuantizado a 5 bits en formato MLX. No deben interpretarse como usos respaldados por documentacion del autor.

- Evaluacion local en Apple Silicon: el formato MLX safetensors esta disenado para ejecutarse sobre el framework MLX de Apple, por lo que el caso natural es probar el modelo en un Mac con memoria unificada suficiente para alojar los 19,2 GB de pesos mas la cache KV.
- Experimentacion con cuantizacion de precision mixta: el artefacto sirve para estudiar el impacto de la receta oQ a 5 bits con group size 64 sobre la calidad de salida, comparando contra el modelo base sin cuantizar.
- Prototipado de asistentes conversacionales: un modelo denso de ~27B es un tamano razonable para prototipos de chat multi-turno en local, siempre que se verifique antes la calidad y los filtros de contenido.
- Generacion de texto en flujos offline: redaccion, resumen y transformacion de documentos en lotes, en entornos donde no se quiere depender de APIs externas.
- Investigacion sobre ajustes "uncensored": analisis academico del comportamiento de modelos con filtros reducidos, comparando tasas de rechazo y adherencia a instrucciones frente al modelo base.
- Base para derivados en otros formatos: los pesos podrian convertirse a GGUF u otros formatos para su uso con llama.cpp u otros runners, aunque dicha conversion no esta documentada ni garantizada por el autor.
- Analisis de linaje de modelos: el nombre del repositorio y los tags permiten estudiar practicas de nomenclatura y fusion de pesos dentro de la comunidad de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares) y la busqueda web no devolvio resultados relevantes sobre este repositorio. No se dispone, por tanto, de datos que permitan comparar el rendimiento del modelo.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: los pesos ocupan 19,2 GB en disco. Con cache KV, buffers de activaciones y overhead del runtime, un presupuesto practico de 22-26 GB de memoria es un punto de partida razonable para contextos cortos. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas para CUDA: no aplica directamente, porque el artefacto esta en formato MLX. Para ejecutarlo en GPU NVIDIA seria necesario convertirlo previamente a otro formato (por ejemplo GGUF o safetensors genericos con vLLM), conversion no documentada.
- Apple Silicon: es la plataforma objetivo del formato MLX. Un Mac con 32 GB de memoria unificada es el minimo practico para los pesos; 48-64 GB es recomendable si se quieren contextos largos o concurrencia. La memoria unificada se comparte con el sistema, por lo que conviene dejar margen.
- GPU de consumo: en el ecosistema NVIDIA, 19,2 GB de pesos caben en tarjetas de 24 GB (RTX 3090, RTX 4090) si se dispone de una conversion compatible. No ocurre lo mismo en tarjetas de 12-16 GB sin cuantizacion adicional.
- Opciones de despliegue: MLX es el runtime declarado por los tags. Para otros runners (llama.cpp, Ollama, vLLM, TGI) seria necesaria una conversion de formato no documentada. No hay instrucciones de despliegue en la model card mas alla de la referencia a oQ/oMLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este artefacto, por lo que la comparativa se limita a caracteristicas declaradas. La columna de rendimiento se deja como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-fp16-novision | ~26,9B | no disponible | no disponible | MLX safetensors (5 bits oQ) | Comunidad, 0 descargas, 1 like |
| Modelo base de la familia Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | Se desconoce el checkpoint base exacto a partir de la informacion proporcionada |
| Modelo denso de ~27-32B de otra familia, en formato GGUF | ~27-32B | variable segun familia | variable segun familia | GGUF | No se especifica un comparable concreto porque no hay datos de rendimiento del modelo evaluado |

No es posible establecer una comparativa significativa con alternativas concretas sin conocer el checkpoint base exacto, la licencia y el rendimiento medido. Se indica "no disponible" en lugar de estimar valores.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no hay documentacion sobre arquitectura, datos de entrenamiento, evaluacion ni uso previsto. Cualquier despliegue en produccion parte de una base informativa muy debil.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Ademas, los terminos del modelo base de la familia Qwen (que tampoco se identifica con certeza) podrian imponer condiciones adicionales. Verificar antes de cualquier uso productivo.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Idiomas: no declarados. No puede asumirse un soporte multilingue concreto ni la calidad en castellano.
- Sesgos: no evaluados ni documentados.
- Efecto de la cuantizacion: la receta oQ a 5 bits con group size 64 puede degradar la calidad respecto al modelo sin cuantizar, especialmente en tareas de razonamiento y codigo. No se han publicado mediciones de esa degradacion.
- Etiqueta "Uncensored": implica, en principio, una reduccion de los mecanismos de rechazo. Esto incrementa el riesgo de generar contenido inapropiado, danino o no conforme a politicas de uso, y complica el cumplimiento normativo en entornos regulados.
- Ausencia de vision: el sufijo "novision" sugiere que no hay entrada de imagenes, aunque no esta confirmado documentalmente.
- Trazabilidad limitada: no se documenta la cadena de fusiones ni el procedimiento exacto seguido, lo que dificulta auditar el origen de los pesos.
- Madurez del artefacto: 0 descargas y 1 like, publicado y actualizado el mismo dia. No hay evidencia de uso ni de validacion por parte de terceros.
- Compatibilidad: al estar en formato MLX, no funciona directamente en entornos CUDA ni en la mayoria de servidores de inferencia estandar sin conversion previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-fp16-novision
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Resultados de busqueda web: la busqueda realizada no devolvio ninguna fuente relevante sobre este modelo. Los unicos resultados obtenidos fueron paginas de ayuda de YouTube sin relacion con el repositorio. No se dispone de papers, blogs, demos ni repositorios adicionales que documenten este artefacto.

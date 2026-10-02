# ChenYanKai2002/OpenPerov-Pro-Later-Study-Evidence-Selector-8B

## Resumen

OpenPerov-Pro-Later-Study-Evidence-Selector-8B es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-Reranker-8B. No se trata de un modelo independiente, sino de un componente de recuperacion aprendido dentro del sistema OpenPerov Pro, un marco de trabajo guiado por evidencia para el ambito de las perovskitas fotovoltaicas. Su funcion concreta es la seleccion de evidencia especifica para la evaluacion de comparacion de estudios posteriores (later-study expert-comparison).

El adaptador ha sido desarrollado por Yankai Chen, Zhi Wan y Tao Jing, y se distribuye de forma separada del reranker principal de relevancia cientifica del sistema. El repositorio contiene unicamente los pesos del adaptador final, su configuracion y el tokenizer, con un tamano aproximado de 0,2 GB. La puntuacion de relevancia se calcula como la diferencia entre los logits del siguiente token para las respuestas "yes" y "no".

Su relevancia es acotada y muy especializada: no es un modelo de proposito general, sino una pieza de un pipeline de recuperacion cientifica. Resulta util para investigadores que trabajen en recuperacion de evidencia en dominio fotovoltaico y quieran reproducir o extender el sistema OpenPerov, siempre que dispongan del corpus y los ejemplos de entrenamiento, que no se distribuyen publicamente. El adaptador esta publicado bajo licencia Apache-2.0, aunque el modelo base conserva sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (base Qwen/Qwen3-Reranker-8B) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA es una fraccion (rank 16, alpha 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-Reranker-8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptador); se debe preservar la licencia del modelo base |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, montado sobre el modelo base Qwen/Qwen3-Reranker-8B. El repositorio incluye exclusivamente el adaptador final, su configuracion y el tokenizer; no es necesaria una dependencia de inferencia adicional mas alla del modelo base. El uso previsto es de text-ranking: dado un par consulta-evidencia, el modelo produce una puntuacion calculada como la diferencia de logits del siguiente token entre "yes" y "no".

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el corpus de literatura, el indice de recuperacion, los paquetes de evidencia privados y los ejemplos de entrenamiento no estan incluidos en la publicacion. El sistema OpenPerov Pro emplea OpenPerov Flash como backbone de respuesta, con un selector de retencion de fuentes, un reranker de relevancia cientifica y un ensamblado de evidencia para la revision local de respuestas.

## Capacidades

- Clasificacion y ranking de relevancia textual en el dominio cientifico de perovskitas fotovoltaicas.
- Seleccion de evidencia para la evaluacion de comparacion de estudios posteriores dentro de OpenPerov Pro.
- Puntuacion de pares consulta-evidencia mediante diferencia de logits "yes"/"no".
- Integracion como componente de recuperacion dentro de un pipeline de generacion aumentada por recuperacion (RAG).
- Soporte de carga mediante PEFT sobre el modelo base Qwen3-Reranker-8B.
- Capacidad limitada al idioma ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modos de razonamiento explicito.
- No se documentan capacidades multilingues mas alla del ingles.

## Casos de uso

- Recuperacion de evidencia cientifica en fotovoltaica: dado un conjunto de articulos candidatos, el adaptador puntua y ordena aquellos mas relevantes para una consulta concreta sobre perovskitas, alimentando despues la fase de ensamblado de evidencia del sistema OpenPerov Pro.
- Reproduccion de experimentos de OpenPerov Pro: investigadores que quieran replicar la evaluacion later-study del sistema pueden cargar este adaptador sobre Qwen3-Reranker-8B y usar los prompts de ranking del repositorio GitHub del proyecto.
- Evaluacion comparativa entre estudios cientificos: el modelo ayuda a seleccionar el material de evidencia necesario para comparar conclusiones entre estudios previos y posteriores sobre un mismo fenomeno.
- Construccion de pipelines RAG especializados: sirve como reranker de dominio en un sistema RAG cientifico donde se priorice precision sobre cobertura, con una coleccion de evidencia aportada por el usuario.
- Filtrado de literatura para revisiones sistematicas: puede emplearse para priorizar articulos candidatos dentro de un corpus propio antes de la lectura manual.
- Investigacion en recuperacion de dominio cientifico: util como punto de partida para estudiar tecnicas de adaptacion LoRA sobre rerankers generalistas en un dominio tecnico concreto.
- Banco de pruebas para comparacion de rerankers: dado que se distribuye el adaptador junto a la configuracion, permite comparar el rendimiento del adaptador frente al modelo base sin adaptar en tareas de ranking del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al depender de Qwen/Qwen3-Reranker-8B, se requieren aproximadamente 16-18 GB en precision FP16/BF16 para el modelo base completo. El adaptador LoRA anade un consumo marginal (el repositorio ocupa 0,2 GB).
- Cuantizacion: con cuantizacion de 8 bits, el modelo base puede ajustarse a unos 8-10 GB de VRAM; con 4 bits, a unos 5-6 GB. No se documentan cuantizaciones especificas probadas para este adaptador.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para inferencia en BF16 del modelo base. GPU con 16 GB o mas pueden ser suficientes en precision reducida.
- Compatibilidad con GPU de consumo: posible en RTX 4090 y RTX 3090 en BF16, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: PEFT junto a transformers para cargar el adaptador sobre el modelo base. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenPerov-Pro-Later-Study-Evidence-Selector-8B | 8B (base) + LoRA rank 16 | No disponible | Adaptador LoRA de reranking | Apache-2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3-Reranker-8B | 8B | No disponible en la informacion proporcionada | Reranker base | Segun modelo base (preservar) | HuggingFace |
| Rerankers generalistas de la familia Qwen3 | No disponible | No disponible | Reranker generalista | Segun modelo base | HuggingFace |

La comparativa se limita al modelo base y a la familia de rerankers Qwen3, dado que no se dispone de datos de rendimiento ni de modelos de dominio equivalente publicados en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en el dominio de perovskitas fotovoltaicas; su uso fuera de ese dominio no esta respaldado.
- Solo soporta ingles (en), lo que limita su aplicacion en corpus en otros idiomas.
- No se publican el corpus de literatura, el indice de recuperacion, los paquetes de evidencia privados ni los ejemplos de entrenamiento, lo que dificulta la reproduccion exacta del sistema.
- El adaptador depende del modelo base Qwen/Qwen3-Reranker-8B y de sus propios terminos de licencia, que deben preservarse.
- Riesgo de alucinacion: no disponible informacion especifica; al tratarse de un componente de ranking y no de generacion abierta, el riesgo principal es de ordenacion incorrecta de evidencia.
- La licencia Apache-2.0 aplica al adaptador y su configuracion, pero no necesariamente al modelo base ni a los datos subyacentes.
- El adaptador forma parte de un sistema mayor (OpenPerov Pro); sus puntuaciones no equivalen al rendimiento final del sistema completo.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Ausencia de benchmarks publicados, por lo que no es posible cuantificar su mejora respecto al modelo base sin adaptar.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ChenYanKai2002/OpenPerov-Pro-Later-Study-Evidence-Selector-8B
- Codigo, benchmarks y registros de evaluacion: https://github.com/Yan-Kai-Chen/OpenPerov
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Libreria PEFT: https://github.com/huggingface/peft

# ChenYanKai2002/OpenPerov-Pro-Source-Retention-Selector-0.6B

## Resumen

OpenPerov-Pro-Source-Retention-Selector-0.6B es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-Reranker-0.6B. No se trata de un modelo de lenguaje completo, sino de un componente de recuperación especializado: selecciona un conjunto fijo de 40 artículos (Top-40) a partir de un conjunto de candidatos, dentro del marco OpenPerov Pro, un sistema de modelos expertos guiado por evidencia para fotovoltaica de perovskita. Sus autores son Yankai Chen, Zhi Wan y Tao Jing.

El problema que resuelve es la retención de fuentes relevantes en dominios científicos muy especializados. En el pipeline de OpenPerov Pro, este selector establece el conjunto de artículos que después ordena un reranker de relevancia científica; la evidencia resultante alimenta la fase de revisión local de respuestas, cuyo backbone es OpenPerov Flash. Se libera con licencia Apache-2.0 y está diseñado exclusivamente para inglés.

Su relevancia actual es doble: por un lado, demuestra que un adaptador de bajo rango (rank 16, alpha 32, dropout 0.05) sobre un reranker de 0,6 mil millones de parámetros puede especializarse en un dominio vertical con un coste computacional mínimo; por otro, publica un resultado medible en PSM-Bench, con una retención de fuentes en Top-40 del 91,00 % (728/800), 8,25 puntos porcentuales por encima del ranking precedente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-Reranker-0.6B; la arquitectura interna del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | 0,6 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros no especificado (rank 16, alpha 32, dropout 0.05) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos de adaptador en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptador); se debe preservar la licencia y los avisos del modelo base |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft); tamano del repositorio 0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA final para Qwen/Qwen3-Reranker-0.6B, acompanado de su configuracion y tokenizer. Los hiperparametros declarados son rank 16, alpha 32 y dropout 0.05. No se publica informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se especifica si el adaptador se aplica a todas las capas o solo a las proyecciones de atencion.

La innovacion tecnica principal no esta en la arquitectura, sino en el procedimiento de puntuacion y en su encaje en el pipeline. La relevancia se calcula como la diferencia de logits del siguiente token entre `yes` y `no`, un esquema de clasificacion binaria reformulada como generacion. Dentro de OpenPerov Pro, el selector se ocupa de la fase de retencion de fuentes (etiquetada como "knowledge extraction" y "ranking compression" en el manuscrito) y trabaja de forma acoplada con un reranker de relevancia cientifica que ordena el conjunto fijo resultante. El prompt de ranking y el codigo de scoring deben tomarse del proyecto OpenPerov en GitHub.

## Capacidades

- Seleccion de fuentes: retiene un conjunto Top-40 de articulos a partir de un pool de candidatos mayor.
- Ranking de texto: tarea declarada en el pipeline del repositorio (`text-ranking`).
- Puntuacion de relevancia binaria: produce una puntuacion derivada de la diferencia de logits entre los tokens `yes` y `no`.
- Dominio especializado: literatura cientifica sobre perovskita y fotovoltaica.
- Idioma: unicamente ingles.
- Integracion en pipeline de dos etapas: seleccion (este adaptador) seguida de reordenacion por un reranker de relevancia cientifica.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No es un modelo generativo de proposito general: su funcion es puntuar y filtrar candidatos, no producir respuestas en lenguaje natural.
- El codigo publico acepta colecciones de evidencia aportadas por el usuario, lo que permite reutilizar el componente con corpus propios.

## Casos de uso

- Recuperacion de literatura en fotovoltaica de perovskita: dado un pool de articulos candidatos obtenido por un buscador o un indice vectorial, el adaptador retiene los 40 mas relevantes antes de la lectura detallada por parte de un modelo de mayor tamano.
- Pipeline RAG cientifico de dos etapas: usar el selector como primera fase de filtrado (recall) y delegar el orden fino en el reranker de relevancia cientifica, reduciendo el coste de inferencia frente a reordenar el pool completo.
- Apoyo a revisiones sistematicas: reducir cientos de referencias candidatas a un conjunto manejable de 40 articulos por consulta, que despues un revisor humano valida.
- Construccion de bases de evidencia internas: en un laboratorio o empresa de materiales, filtrar la produccion cientifica propia y externa para alimentar un indice de evidencia usado por asistentes internos.
- Vigilancia tecnologica: monitorizar publicaciones nuevas sobre perovskita y retener automaticamente las que superan el umbral de relevancia para alertas semanales.
- Evaluacion de componentes de recuperacion: servir como referencia reproducible sobre PSM-Bench para comparar arquitecturas de seleccion, dado que el resultado (728/800) esta publicado.
- Adaptacion a otros dominios verticales: al aceptar colecciones de evidencia aportadas por el usuario, la receta LoRA puede replicarse sobre corpus biomedicos, de materiales o de patentes, siempre que existan ejemplos de entrenamiento etiquetados.
- Despliegue con recursos limitados: al operar sobre un modelo base de 0,6 mil millones de parametros, el componente puede ejecutarse en una unica GPU de consumo dentro de un servicio de recuperacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Referencia de comparacion |
|---|---|---|---|
| PSM-Bench | Retencion de fuentes en Top-40 | 728/800 (91,00 %) | +8,25 puntos porcentuales sobre el ranking precedente |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes), lo cual es coherente con la naturaleza del artefacto: es un adaptador de ranking, no un modelo generativo evaluable con baterias estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 16 bits, los pesos del modelo base de 0,6 mil millones de parametros ocupan aproximadamente 1,2-1,5 GB, mas el adaptador; en cuantizacion de 8 bits, alrededor de 0,7-0,9 GB; en 4 bits, alrededor de 0,5-0,7 GB. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado implicitamente en el ecosistema de modelos de 0,6B, por lo que una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las GPU de gama alta estaran infrautilizadas.
- GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: la via documentada es `transformers` + `peft` (`PeftModel.from_pretrained`). vLLM y TGI soportan adaptadores LoRA en tiempo de servicio; convertir a GGUF para llama.cpp u Ollama no esta cubierto por la documentacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y no forman parte de la informacion proporcionada para esta ficha; deben verificarse en sus repositorios.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenPerov-Pro-Source-Retention-Selector-0.6B | 0,6B (base) + adaptador LoRA | No disponible | Apache-2.0 | Seleccion Top-40 en dominio perovskita, ingles |
| Qwen/Qwen3-Reranker-0.6B (modelo base) | 0,6B | No disponible | Apache-2.0 (segun repositorio) | Reranker generalista multilingue |
| BAAI/bge-reranker-v2-m3 | No disponible | No disponible | No disponible | Reranker multilingue de proposito general |
| jinaai/jina-reranker-v2-base-multilingual | No disponible | No disponible | No disponible | Reranker multilingue de proposito general |

La diferencia funcional relevante es que este adaptador esta especializado en un unico dominio cientifico y en un unico idioma, mientras que los rerankers generalistas cubren muchos dominios e idiomas sin ajuste adicional. A cambio, el adaptador ofrece una metrica de dominio publicada (91,00 % de retencion en Top-40 sobre PSM-Bench).

## Limitaciones y advertencias

- Sesgo de dominio: entrenado sobre literatura de perovskita y fotovoltaica; su comportamiento fuera de ese dominio no esta documentado.
- Sesgo linguistico: solo ingles. Cualquier corpus en castellano u otros idiomas queda fuera del alcance declarado.
- Riesgo de falsos negativos: al fijar el conjunto en 40 elementos, un articulo relevante que caiga en la posicion 41 se pierde de forma irreversible para las fases posteriores del pipeline.
- Alucinacion: el componente no genera texto libre, por lo que el riesgo clasico de alucinacion no aplica; el riesgo real es de calibracion incorrecta de la puntuacion `yes`/`no`.
- Reproducibilidad: el corpus literario, el indice de recuperacion, los paquetes de evidencia privados y los ejemplos de entrenamiento no se liberan, por lo que el entrenamiento no es reproducible.
- Dependencia del prompt: el scoring exige el prompt de ranking y el codigo del proyecto OpenPerov; un prompt distinto puede degradar la puntuacion sin aviso.
- Restricciones de licencia: el adaptador es Apache-2.0, pero se debe preservar la licencia y los avisos del modelo base Qwen/Qwen3-Reranker-0.6B, cuyos terminos aplican de forma acumulativa.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Longitud de contexto no documentada, lo que impide planificar el tamano maximo de candidato o de evidencia por consulta.
- Sin resultados publicados de latencia, throughput ni coste por consulta, lo que dificulta una estimacion de capacidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChenYanKai2002/OpenPerov-Pro-Source-Retention-Selector-0.6B
- Codigo, benchmarks y registros de evaluacion (OpenPerov): https://github.com/Yan-Kai-Chen/OpenPerov
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores, extraidos de la informacion del repositorio.

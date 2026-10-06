# imrangadzhiev/reaction-lens-systems

## Resumen

Reaction Lens Systems es un componente de recuperación científica, no un modelo generativo de lenguaje. Se distribuye como un paquete de inferencia y evaluación compuesto por una cabeza aprendida (head) que ordena 15.692 reacciones de Reactome a partir de características congeladas de SPECTER2. El problema que resuelve es la vinculación entre publicaciones científicas y reacciones bioquímicas concretas del catálogo Reactome, una tarea clásica de biocuración que tradicionalmente requiere revisión manual experta.

El paquete corresponde a un checkpoint fijo (structured seed23, epoch105) entrenado antes del estudio de sistemas asociado, por lo que soporta inferencia y evaluación con características cacheadas, pero no reproducción del entrenamiento. Incluye una cabeza en safetensors, un catálogo de reacciones en JSONL, vectores de catálogo en formato NumPy y un manifiesto con las identidades de fichero y las revisiones upstream fijadas. Los pesos del codificador SPECTER2 no se incluyen y deben obtenerse por separado.

Es relevante ahora como ejemplo de componente de recuperación especializado y auditable: publica métricas de desarrollo, advierte explícitamente de que las puntuaciones no están calibradas y las presenta como propuestas para revisión experta. El autor es imrangadzhiev. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza aprendida (head) sobre caracteristicas congeladas de SPECTER2; no es un transformer generativo |
| Parametros totales | no disponible (cabeza en `head.safetensors` dentro de un repo de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la ventana del codificador SPECTER2 subyacente, que no se incluye) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); validado unicamente para abstracts cientificos en ingles |
| Licencia | MIT para la cabeza; los terminos de los modelos y datos upstream son independientes (ver `THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | safetensors (`head.safetensors`), mas `catalog.jsonl`, `catalog-vectors.npy` y `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es una cabeza de ranking aprendida que opera sobre representaciones congeladas extraidas por SPECTER2. La cabeza puntua las 15.692 reacciones de Reactome frente a la representacion de una publicacion (abstract cientifico). El catálogo de reacciones se materializa en `catalog.jsonl` y sus representaciones vectoriales en `catalog-vectors.npy`, de modo que la inferencia combina una matriz de vectores precalculada con la salida de la cabeza. El paquete no incluye los pesos del codificador: `make encoder` en el checkout fuente descarga la revision upstream fijada en el manifiesto.

El checkpoint es fijo (`structured seed23`, `epoch105`) y fue ajustado antes del estudio de sistemas, por lo que el paquete sirve para inferencia, no para reproducir el entrenamiento. Se aplica un umbral logit fijo ajustado sobre las etiquetas de desarrollo. No se aportan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas como RLHF o DPO, que en cualquier caso no son propias de una cabeza de recuperacion. Las banderas del autor indican que las etiquetas de citacion estan incompletas y que el conjunto de desarrollo se reutilizo de forma repetida durante el desarrollo.

## Capacidades

- Ranking de candidatos: ordena las 15.692 reacciones de Reactome para una publicacion de entrada, empleando SPECTER2 como extractor de caracteristicas congelado.
- Puntuacion con sigmoide: emite puntuaciones por reaccion, aplicables con un umbral logit fijo; el autor advierte que no deben interpretarse como probabilidades biologicas calibradas.
- Recuperacion a gran escala: el catalogo precalculado permite comparar contra todo el conjunto de reacciones sin reindexado por consulta.
- Entrada restringida: la entrada prevista son abstracts cientificos en ingles; no esta validada para consultas conversacionales generales.
- No dispone de generacion de texto, tool calling, uso como agente, capacidades multimodales ni modo de razonamiento explicito.
- No hay evidencia en la informacion disponible de soporte multilingue distinto del ingles.

## Casos de uso

- Biocuracion asistida en Reactome: dado el abstract de un articulo, el componente propone un ranking de reacciones candidatas para que un curador experto valide o descarte cada vinculo, reduciendo el tiempo de triage sobre el catalogo completo.
- Priorizacion de revision experta: el umbral logit fijo permite separar propuestas de alta puntuacion del resto y dirigir el esfuerzo humano hacia los casos mas probables.
- Enriquecimiento de bases de datos de vias metabolicas: las puntuaciones pueden emplearse como candidatos de vinculacion entre publicaciones y reacciones dentro de un pipeline de anotacion, siempre con validacion posterior.
- Recuperacion en buscadores cientificos especializados: integrado como re-ranker sobre un corpus de abstracts indexados, permite devolver reacciones Reactome relacionadas con una consulta o un articulo.
- Construccion de conjuntos de datos etiquetados de forma debil: las propuestas sirven como etiquetado preliminar en tareas de recuperacion, con la advertencia de que las etiquetas no son validacion biologica.
- Analisis de literatura por lotes: procesar un corpus de abstracts y agrupar reacciones recurrentes para detectar temas o vias sobre-representadas en un area de investigacion.
- Evaluacion comparativa de cabezas de recuperacion: el paquete de desarrollo cacheado (2.377 publicaciones y 4.094 vinculos conocidos) permite reproducir la metrica MAP/Hit@1/Recall@100 sobre caracteristicas precalculadas.

## Benchmarks y rendimiento

Metricas de desarrollo con caracteristicas cacheadas, tal como las publica el autor:

| Metrica | Valor |
|---|---|
| MAP | 0,47698647378227255 |
| Hit@1 | 0,3925115692048801 |
| micro Recall@100 | 0,9015632633121642 |

Estos resultados corresponden al conjunto de desarrollo (2.377 publicaciones, 4.094 vinculos conocidos), no a un test independiente ni a validacion biologica. El autor indica que no se incluyen datos de test reservados y que el conjunto de desarrollo se uso repetidamente durante el desarrollo.

## Requisitos de hardware

- La cabeza y los vectores de catalogo caben holgadamente en RAM: el repositorio completo ocupa 0,1 GB, y la matriz `catalog-vectors.npy` para 15.692 reacciones es del orden de decenas de MB en funcion de la dimension del vector.
- Inferencia viable en CPU para la cabeza y la busqueda sobre el catalogo precalculado.
- GPU no necesaria para la cabeza; el codificador SPECTER2, obtenido por separado, si puede beneficiarse de GPU segun el volumen de abstracts a procesar.
- No se especifican en la informacion disponible modelos de GPU recomendados, VRAM, latencia ni throughput.
- Despliegue previsto via el checkout fuente del autor: `make setup` para instalar, copia de los ficheros en `artifacts/structured-seed23/`, `make check-model` para evaluacion con caracteristicas cacheadas y `make serve` para levantar el servicio local. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de componente.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de recuperacion publicacion-reaccion (por ejemplo, variantes de recuperacion densa sobre SPECTER2 u otros sistemas de vinculacion a Reactome) que permitan una comparacion cuantitativa fiable. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Las puntuaciones no estan calibradas: el autor indica que no deben interpretarse como probabilidades biologicas, y el umbral logit fijo se ajusto sobre etiquetas de desarrollo.
- Resultados solo de desarrollo: MAP, Hit@1 y Recall@100 no constituyen rendimiento en test independiente ni validacion biologica.
- No se incluyen datos de test reservados, lo que impide una evaluacion externa limpia con este paquete.
- Reutilizacion repetida del conjunto de desarrollo, con riesgo de sobreajuste a esas etiquetas.
- Etiquetas de citacion incompletas en el conjunto de evaluacion.
- Entrada limitada a abstracts cientificos en ingles; las consultas conversacionales generales no estan validadas.
- No admite generacion de texto, agentes ni tool calling; es exclusivamente un componente de ranking/recuperacion.
- Licencia MIT aplicable a la cabeza, pero los pesos del codificador y los datos upstream quedan sujetos a sus propios terminos; el paquete no incluye el encoder ni sus pesos, que deben obtenerse por separado.
- El propio autor advierte que la descarga del bundle requiere el manifiesto de artefactos del checkout fuente para identificar repositorio y revision inmutables.
- Orientado a propuestas para revision experta: no debe usarse como sustituto de validacion biologica ni como fuente de verdad automatica.

## Enlaces

- HuggingFace: https://huggingface.co/imrangadzhiev/reaction-lens-systems
- Perfil del autor (LinkedIn): https://uk.linkedin.com/in/imrangadzhiev
- Hugging Face (sitio principal): https://huggingface.co/
- No se han encontrado en la busqueda web papers, repositorios de codigo, blogs o demos especificos de Reaction Lens Systems distintos del repositorio de HuggingFace.

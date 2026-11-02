# Mad-Pony-Interactive/cubric-studio

## Resumen

Cubric Studio es un repositorio de pesos publicado por Mad-Pony-Interactive en HuggingFace que aloja los checkpoints de Cubric Vision v1.0.1, junto con copias sin modificar de los pesos de LTX-2.5 de Lightricks. No se trata de un modelo de lenguaje en el sentido habitual, sino de un contenedor de artefactos para un sistema de vision generativa, presumiblemente orientado a video o imagen, dado el origen de los pesos de LTX-2.x.

La informacion publica es extremadamente limitada: la model card solo describe el contenido del repositorio y las obligaciones de licencia asociadas a los pesos redistribuidos de Lightricks. No se especifican parametros, arquitectura, contexto ni idiomas del componente propio (Cubric Vision v1.0.1), y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Su relevancia actual es marginal para evaluaciones de modelos de lenguaje, pero resulta de interes para quien siga el ecosistema de generacion de video open weights, ya que redistribuye LTX-2.5 bajo la LTX-2.x Community License Agreement, lo que impone restricciones de uso concretas que conviene revisar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (Cubric Vision v1.0.1); los pesos LTX-2.5 redistribuidos corresponden a la familia LTX-2.x de Lightricks |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para Cubric Vision v1.0.1; los pesos LTX-2.5 se rigen por la LTX-2.x Community License Agreement |
| Formato de pesos | no disponible (el repositorio ocupa 176,7 GB y contiene directorios `vision/models/` con checkpoints) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de Cubric Vision v1.0.1 en la model card. El unico dato tecnico verificable es que el repositorio incluye copias sin modificar de los pesos de LTX-2.5 de Lightricks en `vision/models/`, lo que sugiere que Cubric Vision se apoya en o incorpora dicha familia de modelos generativos de video.

Tampoco hay datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas. Cualquier afirmacion al respecto seria especulativa y no se incluye en esta ficha.

## Capacidades

- Alojamiento y distribucion de checkpoints de Cubric Vision v1.0.1, sin documentacion publica de capacidades funcionales.
- Redistribucion de pesos de LTX-2.5 de Lightricks, orientados a generacion de video segun la denominacion de la familia.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni soporte multilingue.
- No se documenta soporte de vision, audio ni modos de razonamiento explicito para el componente propio.

## Casos de uso

- Evaluacion interna de pesos de video generativo: descargar el repositorio y probar los checkpoints de LTX-2.5 en un pipeline de sintesis de video, verificando primero el cumplimiento de la LTX-2.x Community License Agreement.
- Investigacion sobre redistribucion de modelos: estudiar como un tercero empaqueta pesos de Lightricks junto con artefactos propios y que estructura de licencias utiliza en `vision/models/LICENSES/LTX-2.x/`.
- Auditoria de licencias: usar el repositorio como caso practico para revisar como se aplican la Acceptable Use Policy y la attribution notice en un despliegue derivado.
- Integracion en prototipos de generacion audiovisual: emplear los pesos LTX-2.5 como base para experimentos de generacion de video condicionada, siempre dentro de los limites permitidos por la licencia.
- Benchmarking comparativo de modelos de video: medir calidad y latencia de los checkpoints redistribuidos frente a otras alternativas de la misma categoria, si el usuario dispone de infraestructura suficiente para 176,7 GB de pesos.
- Archivo y preservacion: mantener una copia local de los pesos para garantizar disponibilidad ante posibles retiradas del repositorio, respetando las condiciones de redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (176,7 GB) da una cota inferior del almacenamiento necesario, pero no permite inferir la VRAM sin conocer el numero de parametros y el formato de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; 176,7 GB de pesos exceden la VRAM de cualquier GPU de consumo actual en precision completa, por lo que probablemente requiera cuantizacion o descarga por etapas, pero no hay datos que lo confirmen.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni frameworks de difusion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cubric Studio (Cubric Vision v1.0.1 + LTX-2.5) | no disponible | no disponible | no disponible para el componente propio; LTX-2.x Community License para los pesos de Lightricks | HuggingFace, repositorio de 176,7 GB |
| LTX-2.5 (Lightricks, original) | no disponible en la informacion proporcionada | no disponible | LTX-2.x Community License Agreement | Distribucion original de Lightricks |
| Alternativas de generacion de video open weights | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica sobre Cubric Vision v1.0.1: sin parametros, arquitectura, contexto ni idiomas, no es posible evaluar su idoneidad para produccion.
- Licencia del componente propio no declarada, lo que impide determinar si el uso comercial esta permitido.
- Los pesos LTX-2.5 redistribuidos estan sujetos a la LTX-2.x Community License Agreement y su Acceptable Use Policy; descargarlos o usarlos vincula al usuario a dicho acuerdo y a sus restricciones.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Riesgo de confusion entre los artefactos propios y los pesos de terceros: conviene separar claramente que partes del repositorio son originales de Mad-Pony-Interactive y cuales son copias de Lightricks.
- No hay informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- El volumen del repositorio (176,7 GB) impone requisitos de almacenamiento y ancho de banda considerables antes de cualquier prueba.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mad-Pony-Interactive/cubric-studio
- Licencias de LTX-2.x incluidas en el repositorio: `vision/models/LICENSES/LTX-2.x/` (ruta interna del repositorio)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.

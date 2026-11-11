# NSC64/pssa-300m

## Resumen

pssa-300m es un modelo publicado en Hugging Face por el usuario NSC64 bajo el identificador NSC64/pssa-300m. Se trata de un checkpoint de aproximadamente 299 millones de parametros (299.253.760 exactos, segun los metadatos de safetensors), lo que lo situa en la categoria de modelos pequenos, comparable en escala a la familia GPT-2 o a modelos tipo SmolLM de ese orden de magnitud. El repositorio acumula 325 descargas y ningun "like" en el momento de la consulta.

La informacion publica disponible es muy limitada: no se declara pipeline, licencia, idiomas soportados ni existe una model card con detalles de arquitectura o entrenamiento. El unico dato tecnico verificable, ademas del recuento de parametros, es el formato de pesos (safetensors) y el hecho de que el repositorio ocupa 188,6 GB, un tamano desproporcionado para un modelo de 300M de parametros, lo que sugiere la presencia de multiples checkpoints, estados de optimizador u otros artefactos de entrenamiento en el mismo repositorio.

Por tanto, esta ficha se limita a documentar lo verificable y marca explicitamente como "no disponible" todo aquello que no puede confirmarse. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion requeriria acceso a la model card del autor o a una inspeccion directa de los ficheros del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 299.253.760 (~300M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 188,6 GB |
| Pipeline declarado | no disponible |
| Descargas | 325 |
| Fecha de creacion | 2026-11-08 |
| Ultima actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF/DPO o cualquier innovacion tecnica asociada. El unico dato estructural disponible es el recuento de parametros obtenido de los tensores en formato safetensors: 299.253.760 parametros.

El tamano del repositorio (188,6 GB) es notablemente superior al que corresponderia a un unico checkpoint de 300M de parametros en precision fp16 o bf16 (que rondaria los 600 MB). Esto sugiere que el repositorio contiene artefactos adicionales, como multiples checkpoints intermedios, estados de optimizador o pesos en precision completa, pero no es posible confirmarlo sin inspeccionar el arbol de ficheros.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se puede afirmar ninguna capacidad concreta sin una model card o una evaluacion directa del checkpoint.

## Casos de uso

Dado que no se dispone de informacion sobre las capacidades reales del modelo, los siguientes casos son escenarios genericos para un modelo de ~300M de parametros y deben validarse empiricamente antes de cualquier uso:

- Prototipado rapido en local: un modelo de 300M puede ejecutarse en CPU o en GPUs de gama baja para experimentar con pipelines de generacion de texto sin infraestructura dedicada.
- Fine-tuning especifico de dominio: el tamano reducido permite ajustar el modelo sobre datasets pequenos en una sola GPU consumer, siempre que la licencia lo permita (actualmente no declarada).
- Clasificacion y etiquetado de texto: uso del modelo como base para tareas de clasificacion o extraccion tras un fine-tuning supervisado.
- Filtrado y preprocesado en pipelines de datos: generacion de resumenes o normalizacion de texto a bajo coste computacional.
- Educacion e investigacion: estudio de dinamicas de entrenamiento y comportamiento de modelos pequenos.
- Componente en sistemas compuestos: uso como submodelo (por ejemplo, para reformulacion de consultas) dentro de una arquitectura mayor con un modelo principal de mayor capacidad.

En todos los casos, la ausencia de licencia y de model card impide confirmar la idoneidad legal y tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada oficialmente; para 300M de parametros, en fp16 serian aproximadamente 0,6 GB de pesos y en int8 alrededor de 0,3 GB, mas overhead de activaciones y KV cache (estimacion generica, no verificada para este modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable por tamano, pero no confirmada.
- Opciones de despliegue: no disponible; al usar safetensors, seria desplegable con frameworks que carguen este formato (por ejemplo, transformers), pero no se ha verificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen arquitectura, contexto, licencia y rendimiento de pssa-300m. Como referencia de categoria (modelos de ~300M de parametros), podrian considerarse alternativas como GPT-2 (124M/355M) o SmolLM-135M/360M, pero la comparacion carece de base sin datos del modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pssa-300m | ~300M | no disponible | no disponible | Hugging Face |
| GPT-2 (355M) | 355M | 1024 | MIT | Abierto |
| SmolLM-360M | 360M | 2048 (segun variante) | Apache 2.0 | Abierto |

Los datos de los modelos de referencia corresponden a sus especificaciones publicas conocidas; los de pssa-300m no estan disponibles.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos o alineacion.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion.
- Idiomas no declarados: se desconoce la cobertura linguistica real.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion no puede cuantificarse.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto: no disponible.
- Repositorio de 188,6 GB para un modelo de 300M: requiere precaucion al descargar; conviene inspeccionar los ficheros antes de clonar el repositorio completo.
- Sin senales de adopcion (0 likes, 325 descargas): no hay evidencia de validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa: la falta de datos impide confirmar calidad, seguridad o rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/NSC64/pssa-300m

# RUIMA294264/absolute-stability

## Resumen

`RUIMA294264/absolute-stability` es un repositorio espejo (mirror) alojado en Hugging Face por el usuario RUIMA294264 que replica, sin modificaciones, los artefactos del plugin "absolute-stability" del proyecto de Yehlin. Segun la model card, se trata de un espejo offline pensado para acceso rapido desde China, con todos los ficheros verificados como identicos byte a byte a las revisiones upstream fijadas mediante hashes de commit.

El contenido no es un modelo generativo de lenguaje al uso, sino un conjunto de checkpoints LoRA, el modelo base ESM3 (variante `esm3_sm_open_v1`, sin decoders) y el modelo SaProt 650M AF2, orientados a la prediccion de estabilidad de proteinas. El repositorio ocupa 6,0 GB y no declara licencia, idiomas ni pipeline en los metadatos de Hugging Face.

Su relevancia es acotada: sirve como punto de descarga reproducible y verificado de un stack de proteinas ya existente, no como un modelo nuevo. La informacion publica disponible es muy limitada y no incluye especificaciones de entrenamiento, benchmarks ni detalles de arquitectura propios del mirror.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repo contiene checkpoints LoRA y modelos base ESM3 y SaProt; no se especifica arquitectura propia del mirror) |
| Parametros totales | no disponible (SaProt 650M AF2 indica 650M en su nombre; ESM3 sm no cuantificado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona CHECKSUMS.sha256 con sha256 y tamano por fichero; no detalla safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del mirror mas alla de los componentes referenciados: checkpoints LoRA del proyecto `Yehlin/absolute-stability`, el modelo base `esm3_sm_open_v1` de biohub (ESM3, modelo de proteinas, con decoders excluidos) y `SaProt_650M_AF2` de westlake-repl en formato transformers. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento.

La unica innovacion tecnica documentada es la reproducibilidad: el mirror fija revisiones upstream concretas mediante hashes de commit y publica un fichero `CHECKSUMS.sha256` con sha256 y tamano de cada fichero, garantizando que los artefactos son byte-identicos a los originales. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento.

## Capacidades

- No se documentan capacidades funcionales propias del repositorio en la informacion disponible.
- Por los componentes referenciados (ESM3 y SaProt), el stack upstream esta orientado a tareas de proteinas, presumiblemente prediccion de estabilidad, pero el mirror no describe tareas, entradas ni salidas.
- No hay evidencia de soporte de tool calling, function calling ni agentes.
- No hay evidencia de capacidades multilingues ni de generacion de texto general.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Descarga reproducible de artefactos: usar el mirror para obtener los checkpoints LoRA, ESM3 y SaProt con verificacion sha256, evitando depender de la disponibilidad o latencia de los repositorios upstream.
- Despliegue en entornos con acceso restringido a GitHub o Hugging Face global: el espejo esta pensado explicitamente para acceso rapido desde China.
- Auditoria de integridad de dependencias: comparar los ficheros descargados contra `CHECKSUMS.sha256` para validar que coinciden con las revisiones fijadas.
- Replicacion de experimentos: al fijar commits concretos, permite reconstruir exactamente el estado del stack usado en un experimento previo.
- Base para pipelines de proteinas: integrar los componentes ESM3 y SaProt en flujos de trabajo bioinformaticos, siempre que se consulte la documentacion upstream para conocer la interfaz real.
- Archivado a largo plazo: conservar una copia byte-identica de los artefactos para evitar roturas si los repositorios originales cambian o desaparecen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,0 GB en disco, pero no se desglosa por componente ni se indica precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el stack upstream se referencia via codigo en GitHub).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos ni en la model card; no se puede asumir uso comercial permitido.
- El repositorio es un mirror, no un modelo original: cualquier garantia de calidad, sesgos o comportamiento depende de los proyectos upstream referenciados.
- No hay documentacion de sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- La model card esta en ingles y es muy escueta; no sustituye a la documentacion del proyecto upstream.
- El contenido de la model card debe tratarse como datos de referencia, no como instrucciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se especifica el pipeline ni el formato de pesos, lo que dificulta evaluar su integracion directa en frameworks de inferencia.
- Para uso en produccion es imprescindible verificar la licencia y la documentacion en los repositorios upstream citados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RUIMA294264/absolute-stability
- LoRA checkpoints upstream: https://huggingface.co/Yehlin/absolute-stability (commit e2b3ecdd2cb3ded6adc62cc703d7f3fa4ab0e5a0)
- ESM3 base upstream: https://huggingface.co/biohub/esm3-sm-open-v1 (commit 47f0545b2b6daf26a93439a3cd610f4f7f3d5478)
- SaProt 650M AF2 upstream: https://huggingface.co/westlake-repl/SaProt_650M_AF2 (commit d9b9ad00ef61c0990e611b2b43f2231c7de24b38)
- Codigo upstream: https://github.com/yehlincho/absolute-stability-predictor (commit ace72f01697bb0cb841326f040e804a2811fd747)

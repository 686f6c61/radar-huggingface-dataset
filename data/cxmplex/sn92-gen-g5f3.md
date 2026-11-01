# cxmplex/sn92-gen-g5f3

## Resumen

El modelo `cxmplex/sn92-gen-g5f3`, publicado por el usuario cxmplex en HuggingFace, se presenta en su model card como un "decision model" para la pista generalista de REAX (SN92). El repositorio contiene pesos en formato safetensors con un total de 26.085.330.160 parametros (aproximadamente 26.100 millones), lo que lo situa en la categoria de modelos de gran tamano cercanos a los 27B-32B. La etiqueta `qwen3_5` sugiere que la arquitectura deriva de la familia Qwen 3.5, aunque no se aporta confirmacion tecnica en la informacion disponible.

La relevancia de esta publicacion es limitada por el momento: cuenta con 11 descargas y ningun "like", y la model card es extremadamente escueta (unicamente una linea descriptiva y la licencia MIT). No se especifican datos de entrenamiento, contexto, idiomas soportados ni resultados de evaluacion, lo que dificulta una evaluacion rigurosa de su calidad. El tamano del repositorio (52,2 GB) es coherente con pesos en precision de 16 bits para 26B parametros.

A pesar de la escasez de documentacion, la ficha se completa con los datos verificables del repositorio y se marcan explicitamente como "no disponible" todos aquellos campos que el autor no ha publicado. Se recomienda precaucion antes de emplearlo en produccion dada la ausencia de benchmarks y de informacion sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere una base de la familia Qwen 3.5, sin confirmar) |
| Parametros totales | 26.085.330.160 (~26,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La etiqueta `qwen3_5` asociada al repositorio apunta a que podria tratarse de un modelo derivado o ajustado a partir de la familia Qwen 3.5, pero la model card no confirma ni detalla esta relacion. El numero de parametros (26.085.330.160) es el unico dato estructural verificable, extraido directamente de los tensores en safetensors.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. La unica referencia funcional es la descripcion "Decision model for the REAX (SN92) generalist track", que sugiere un ajuste orientado a toma de decisiones dentro de un pipeline denominado REAX, sin mas detalle tecnico.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de 26B parametros, aunque no confirmada por el autor.
- Toma de decisiones: la model card lo describe explicitamente como "decision model" para la pista generalista de REAX (SN92).
- Razonamiento multi-paso: no disponible (no documentado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Toma de decisiones en pipelines REAX: el modelo esta disenado explicitamente como "decision model" para la pista generalista de REAX (SN92), por lo que su uso previsto es la seleccion o clasificacion de acciones dentro de ese sistema.
- Experimentacion e investigacion: al estar publicado con licencia MIT y pesos safetensors, puede emplearse como base para experimentos de ajuste fino o evaluacion comparativa en entornos de investigacion.
- Generacion de texto general: con 26B parametros, puede utilizarse para tareas de redaccion y sintesis, siempre que se valide su calidad mediante evaluacion propia al no existir benchmarks publicados.
- Base para ajuste fino (fine-tuning): el formato safetensors y la licencia permisiva facilitan su uso como punto de partida para especializacion en dominios concretos.
- Prototipado de agentes: si se confirma soporte de instrucciones, podria integrarse en prototipos de agentes, aunque la ausencia de documentacion sobre tool calling obliga a validarlo empiricamente.
- Evaluacion comparativa de modelos de ~26B: util como referencia adicional en estudios que comparen modelos de gran tamano con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda al menos 80 GB para contexto amplio.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26-28 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o con offloading.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 13-15 GB, cabe en GPUs consumer como RTX 4090, RTX 3090 o RTX 4080.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Despliegue: no se documenta compatibilidad especifica; al ser safetensors, es compatible con frameworks habituales (vLLM, TGI, llama.cpp tras conversion a GGUF, Ollama tras conversion), aunque no hay confirmacion del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| cxmplex/sn92-gen-g5f3 | ~26,1B | no disponible | MIT | no | HuggingFace (11 descargas) |
| Qwen 3.5 (familia, referencia por etiqueta) | variable | no disponible en esta ficha | variable segun variante | no disponible en esta ficha | HuggingFace |
| Alternativas de ~27B-32B de codigo abierto | ~27-32B | no disponible en esta ficha | variable | no disponible en esta ficha | HuggingFace |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas concretas; la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse un rendimiento equiparable a otros modelos de ~26B.
- Documentacion minima: la model card no describe entrenamiento, datos, contexto ni idiomas, lo que impide evaluar sesgos y riesgos.
- Riesgo de alucinacion: desconocido y no cuantificado; en un modelo sin alineacion documentada el riesgo puede ser elevado.
- Sesgos conocidos: no documentados; al no declararse la composicion del corpus de entrenamiento no es posible evaluarlos.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana maxima y los idiomas efectivamente soportados.
- Licencia MIT: permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo al no existir garantias ni documentacion tecnica.
- Madurez: con 11 descargas y ningun "like", no hay comunidad ni validacion externa; se recomienda evaluacion propia exhaustiva antes de cualquier uso en produccion.
- Procedencia: la relacion con la familia Qwen 3.5 no esta confirmada por el autor, por lo que no deben extrapolarse capacidades de esa familia.

## Enlaces

- HuggingFace: https://huggingface.co/cxmplex/sn92-gen-g5f3
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.

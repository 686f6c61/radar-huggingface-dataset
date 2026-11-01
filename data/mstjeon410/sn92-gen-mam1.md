# MstJeon410/sn92-gen-mam1

## Resumen

sn92-gen-mam1 es un fine-tune del modelo base baselabs/mammoth-1, publicado por el usuario MstJeon410 en HuggingFace. Se presenta como una "entrada generalista" del sistema SN92 y esta etiquetado como decision-model, lo que sugiere que su proposito es emitir decisiones o clasificaciones a partir de una representacion interna, mas que generar texto libre. El modelo conserva la disposicion "REAX joint-readout", que combina un backbone Qwen3_5Model con una cabeza de lectura (readout head) separada.

El checkpoint contiene 26.085.330.160 parametros en formato safetensors (unos 26.100 millones), con un repositorio de 52,2 GB, lo que es coherente con pesos en precision bf16/fp16. La licencia es MIT y el modelo base es baselabs/mammoth-1, fijado en el commit 61cec44c281c693992e3d6ebeb44dd3402dfa186.

La informacion publica disponible es muy limitada: la model card apenas remite a los ficheros MODIFICATIONS.md, NOTICE y LICENSE del repositorio, y no se documentan datos de entrenamiento, benchmarks, idiomas ni modo de uso. Esta ficha recoge lo verificable y marca explicitamente como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3_5Model) con cabeza de lectura "REAX joint-readout" |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se describe como un fine-tune de baselabs/mammoth-1 en la "REAX joint-readout layout", compuesta por un backbone Qwen3_5Model mas una readout head. La etiqueta qwen3_5 en HuggingFace apunta a la familia Qwen3.5 como base arquitectonica del backbone, aunque no se detalla la configuracion concreta (numero de capas, dimension oculta, atencion, etc.). El termino "joint-readout" indica que la salida final no se obtiene directamente del LM head del backbone, sino de una cabeza acoplada que consume la representacion del modelo; el tag decision-model refuerza esa lectura.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni de tecnicas de optimizacion especificas. La model card remite a MODIFICATIONS.md y NOTICE para los detalles de la modificacion respecto al modelo base, pero ese contenido no forma parte de la informacion proporcionada. Tampoco consta el proceso de entrenamiento ni hiperparametros.

## Capacidades

- Al estar etiquetado como decision-model, se espera que emita decisiones o puntuaciones a partir de una entrada, no necesariamente texto generativo abierto; no se documenta el formato exacto de salida.
- Herencia del backbone Qwen3_5Model, por lo que cabe esperar capacidades de modelado de lenguaje subyacentes, aunque no se confirman en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Clasificacion o filtrado de contenido en pipelines de datos: al ser un decision-model, puede emplearse como clasificador de entradas (por ejemplo, aceptar/rechazar) integrado en un pipeline previo al entrenamiento o a la publicacion.
- Enrutamiento de peticiones en un sistema multi-modelo: usar la salida de decision para derivar cada consulta al modelo o herramienta adecuada.
- Evaluacion automatizada de respuestas: emplear la cabeza de decision para puntuar la calidad o adecuacion de una respuesta generada por otro modelo.
- Investigacion sobre cabezas de lectura acopladas: el checkpoint sirve como referencia para estudiar la disposicion REAX joint-readout frente a un LM head convencional.
- Experimentacion academica con fine-tunes de mammoth-1: sirve para comparar el comportamiento del base frente a este fine-tune bajo la misma arquitectura.
- Prototipado de sistemas de decision con licencia permisiva: la licencia MIT facilita su integracion en pruebas internas y productos derivados, siempre que se respeten los avisos del repositorio.

En todos los casos, la idoneidad concreta no puede confirmarse sin documentacion adicional del autor, ya que no se especifica el formato de entrada/salida ni el dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 60-80 GB de VRAM para contexto moderado.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors (por ejemplo, con llama.cpp o herramientas equivalentes), lo que reduciria los requisitos a unos 14-16 GB en 4 bits, aunque la compatibilidad con la readout head no esta verificada.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB con paralelismo de tensor) para precision completa.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en bf16; podria caber en 4 bits si se generan pesos cuantizados y la arquitectura lo permite.
- Opciones de despliegue: vLLM o TGI para safetensors en precision completa (sujeto a soporte de la arquitectura Qwen3_5 con readout head, no confirmado); llama.cpp/Ollama solo si se generan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MstJeon410/sn92-gen-mam1 | 26,1 B | no disponible | MIT | Fine-tune con readout head, etiquetado decision-model |
| baselabs/mammoth-1 (base) | no disponible en la informacion | no disponible | no disponible | Modelo base del que deriva este checkpoint |
| Qwen3.5 (familia referenciada) | no disponible en la informacion | no disponible | no disponible | Backbone arquitectonico citado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe uso previsto, formato de entrada/salida, datos de entrenamiento ni evaluacion; su adopcion en produccion sin validacion adicional es arriesgada.
- Riesgo de alucinacion: si se usa como generador de texto, no hay evaluacion publicada que acote este riesgo.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura linguistica o conversaciones largas.
- Sesgos: no disponibles; al desconocerse la composicion del dataset de fine-tune, no pueden evaluarse sesgos conocidos.
- Compatibilidad de despliegue: la readout head personalizada puede no estar soportada por frameworks estandar (vLLM, TGI), lo que exigiria implementacion manual.
- Licencia MIT: permite uso comercial, pero deben respetarse los ficheros NOTICE y LICENSE del repositorio, que pueden contener atribuciones adicionales del modelo base.
- Modelo con muy poca traccion (42 descargas, 0 likes) y sin validacion de la comunidad; tratar como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/MstJeon410/sn92-gen-mam1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Commit del modelo base referenciado: 61cec44c281c693992e3d6ebeb44dd3402dfa186
- Ficheros referenciados en el repositorio: MODIFICATIONS.md, NOTICE, LICENSE (disponibles en la pagina del modelo)

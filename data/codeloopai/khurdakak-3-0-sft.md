# CodeloopAi/khurdakak-3.0-sft

## Resumen

CodeloopAi/khurdakak-3.0-sft es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario CodeloopAi, entrenado mediante SFT sobre el modelo base cuantizado a 4 bits unsloth/gemma-4-e2b-unsloth-bnb-4bit. No se trata, por tanto, de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador en formato safetensors que requiere descargar el modelo base para poder ejecutarse. El repositorio ocupa 1,8 GB y fue creado el 19 de septiembre de 2026.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: la model card publicada por el autor es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No se declara licencia, idiomas, arquitectura, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa alguna.

En la busqueda web realizada no se ha encontrado ningun material relacionado con el modelo: los resultados devueltos corresponden a paginas de ayuda de YouTube y no guardan ninguna relacion con este repositorio. En consecuencia, la mayor parte de los apartados de esta ficha se resuelven con "no disponible" y con la informacion estructural que si puede deducirse de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo base transformer decoder-only, sin confirmar en la documentacion) |
| Parametros totales | no disponible (el repositorio contiene unicamente los pesos del adaptador, 1,8 GB) |
| Parametros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base publicado en bnb-4bit; el adaptador se distribuye en safetensors sin cuantizacion declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Modelo base | unsloth/gemma-4-e2b-unsloth-bnb-4bit |
| Metodo de entrenamiento | SFT con Unsloth y TRL |
| Version de PEFT declarada | 0.21.0 |
| Pipeline | text-generation |
| Etiquetas | peft, safetensors, lora, sft, transformers, trl, unsloth, conversational |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del adaptador ni del modelo base. Los metadatos permiten afirmar unicamente que se trata de un fine-tuning por LoRA (low-rank adaptation) ejecutado con la libreria TRL sobre un modelo base ya cuantizado en 4 bits con bitsandbytes y optimizado para entrenamiento con Unsloth. La etiqueta `conversational` y la etiqueta `sft` indican que el ajuste se planteo como una fase de supervised fine-tuning orientada a generacion de texto conversacional, presumiblemente sobre un dataset de instrucciones, aunque no se especifica cual.

Tampoco se documentan hiperparametros de entrenamiento: se desconocen el rango y alpha del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el tamano del dataset, la composicion de los datos, la precision de entrenamiento y si hubo fases posteriores de alineamiento (DPO, RLHF u otras). El unico dato tecnico replicable es la version de PEFT (0.21.0). Cualquier afirmacion sobre innovaciones tecnicas, atencion lineal, decodificacion especulativa o ventanas de contexto extendidas seria especulativa y no se sostiene con la informacion disponible.

## Capacidades

- Generacion de texto conversacional: es la unica capacidad que puede inferirse de forma directa de las etiquetas del repositorio (`text-generation`, `conversational`) y del pipeline declarado.
- Razonamiento, matematicas y generacion de codigo: no disponible. No hay evaluaciones ni declaraciones del autor que confirmen estas capacidades.
- Soporte de tool calling o function calling: no disponible. No se menciona plantilla de chat, formato de herramientas ni tokens especiales.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El campo de idiomas de la model card esta sin rellenar.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Advertencia previa: al no existir evaluacion publicada ni licencia declarada, estos casos de uso son escenarios tecnicamente plausibles para un adaptador conversacional de este tipo, no capacidades verificadas. Cualquier uso en produccion exige una evaluacion propia previa.

- Prototipado rapido de asistentes conversacionales de nicho: al ser un adaptador LoRA sobre un modelo base cuantizado en 4 bits, puede cargarse sobre el modelo base con `peft` y `transformers` en pocos minutos para probar si el ajuste SFT ha desplazado el estilo de respuesta hacia el dominio del dataset de entrenamiento.
- Base para iteraciones de fine-tuning: el adaptador sirve como punto de partida (o como referencia de un experimento previo) para continuar el entrenamiento con nuevos datos. Su naturaleza PEFT permite fusionar o apilar adaptadores sin reentrenar el modelo completo.
- Experimentos academicos de comparacion de tecnicas de ajuste: util para medir el efecto de un SFT con Unsloth sobre un modelo base cuantizado frente a otras variantes de entrenamiento, siempre que se definan metricas propias.
- Despliegue en entornos con recursos muy limitados: al apoyarse en un modelo base pequeno cuantizado a 4 bits, el conjunto es candidato para ejecucion en GPU de gama media o en CPU mediante llama.cpp, una vez convertido el adaptador a GGUF.
- Generacion de texto de baja criticidad con supervision humana: borradores, resumenes o respuestas sugeridas en herramientas internas donde un operador revisa la salida antes de enviarla, dado el riesgo de alucinacion no medido.
- Reproduccion y auditoria de experimentos de la comunidad: el repositorio permite inspeccionar que se publico bajo el nombre khurdakak-3.0-sft y verificar la ausencia de documentacion, algo relevante para quienes rastrean adaptadores sin model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor deja la seccion de evaluacion sin rellenar y no existe ningun informe externo localizable mediante busqueda web.

## Requisitos de hardware

No se han publicado requisitos de hardware, latencias ni throughput para este adaptador. Las siguientes indicaciones son orientativas y no estan confirmadas por el autor; deben validarse empíricamente antes de cualquier planificacion:

- VRAM estimada para inferencia: dependera del modelo base, que se distribuye cuantizado en 4 bits. Para un modelo de la familia indicada por el nombre (`e2b`, que sugiere parametros efectivos en el rango de los 2.000 millones), un orden de magnitud razonable en 4 bits es de 2 a 4 GB de VRAM, mas el overhead del runtime y de la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: no disponible. Cualquier GPU consumer reciente con al menos 6-8 GB de VRAM es candidata si la estimacion anterior es correcta, pero no hay confirmacion.
- Ejecucion en GPU consumer: probablemente viable, sin datos que lo confirmen.
- Opciones de despliegue: `transformers` + `peft` es la via documentada por las etiquetas del repositorio. `vLLM` y `TGI` requieren fusionar previamente el adaptador con el modelo base. `llama.cpp` y `Ollama` exigen convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables con datos verificables, y no procede inventar cifras de parametros, contexto o rendimiento para el modelo base ni para sus alternativas. La referencia mas directa que puede consultarse es la model card del propio modelo base (unsloth/gemma-4-e2b-unsloth-bnb-4bit), que tampoco se ha podido verificar en el material disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. En la practica, esto convierte al modelo en no utilizable en produccion sin aclaracion previa del autor o del titular de los derechos del modelo base.
- Model card vacia: todos los campos de la plantilla de HuggingFace estan sin rellenar, incluidos desarrollador, financiacion, datos de entrenamiento, hiperparametros, evaluacion e impacto ambiental.
- Ausencia total de validacion: 0 descargas y 0 likes, sin ningun informe independiente, benchmark ni discusion publica localizable.
- Sesgos conocidos: no disponible. Al no documentarse el dataset de SFT, no puede estimarse que sesgos introduce el ajuste. Cabe esperar los sesgos heredados del modelo base, que tampoco se describen.
- Riesgo de alucinacion: no medido. No hay evaluacion de factualidad ni de tasa de alucinacion. En un adaptador SFT entrenado sobre datos desconocidos, este riesgo puede aumentar si el dataset contiene afirmaciones no verificadas.
- Limitaciones de contexto e idioma: no disponible. Se desconoce la ventana de contexto efectiva y los idiomas cubiertos.
- Dependencia del modelo base: el repositorio solo contiene el adaptador. Sin descargar unsloth/gemma-4-e2b-unsloth-bnb-4bit, el modelo no es ejecutable, y queda sujeto a las condiciones de uso del modelo base.
- Trazabilidad: el nombre "khurdakak-3.0-sft" sugiere una tercera iteracion de un experimento personal, sin repositorio de codigo, dataset ni paper asociados.
- Ruido en los metadatos: la etiqueta `arxiv:1910.09700` procede de la plantilla por defecto de HuggingFace (calculadora de impacto de ML) y no implica la existencia de un articulo cientifico sobre este modelo.
- Fecha de publicacion inusualmente reciente respecto a la consulta: la ventana entre creacion y ultima actualizacion es de menos de un minuto, lo que indica un unico push sin mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/CodeloopAi/khurdakak-3.0-sft
- Modelo base declarado: https://huggingface.co/unsloth/gemma-4-e2b-unsloth-bnb-4bit
- Referencia citada en las etiquetas (plantilla de HuggingFace, no especifica del modelo): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Framework Unsloth: https://github.com/unslothai/unsloth

No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada.

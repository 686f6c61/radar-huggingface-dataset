# believe-it-or-not/const_probes_original_augmented_original_akc_turkey_imamoglu_detention-3fe1cf9a

## Resumen

`const_probes_original_augmented_original_akc_turkey_imamoglu_detention-3fe1cf9a` es un adaptador PEFT (LoRA) publicado por el usuario `believe-it-or-not` en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de adaptacion que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un Llama 3.3 70B Instruct alojado por Together AI.

El nombre del repositorio sugiere que el adaptador forma parte de un experimento sobre sondas de deteccion de conceptos constantes (const probes) en el contexto de un evento relacionado con Turquia (la detencion del alcalde de Estambul, Ekrem Imamoglu). El prefijo `original_augmented_original_akc` y el sufijo hash apuntan a una generacion automatizada de variantes de un mismo experimento, probablemente dentro de un estudio sobre comportamiento de modelos ante temas politicos sensibles.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes, la model card es la plantilla por defecto de Hugging Face sin contenido sustantivo, y no se publican datos de entrenamiento, evaluacion ni uso previsto. Se documenta aqui como artefacto tecnico de un experimento de investigacion, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B) |
| Parametros totales | No disponible (el adaptador ocupa 1,7 GB en safetensors; el base tiene 70B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el base Llama 3.3 soporta 128K tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Version PEFT declarada | 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) empaquetado con la libreria PEFT. La arquitectura subyacente es la del modelo base Llama 3.3 70B Instruct, un transformer decoder-only con atencion por grupos (GQA) y ventana de contexto de 128K tokens. El adaptador modifica un subconjunto de matrices de proyeccion del modelo base mediante factores de bajo rango, cuyo rango, alpha y modulos objetivo no se especifican en la informacion disponible.

No se han publicado datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de RLHF o DPO, ni hiperparametros de entrenamiento. La model card es la plantilla generica de Hugging Face con todos los campos marcados como "[More Information Needed]". El unico metadato tecnico relevante es la version de PEFT (0.15.1) y la referencia al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla por defecto y no implica que se haya realizado dicho calculo.

## Capacidades

- Al ser un adaptador sobre Llama 3.3 70B Instruct, hereda teoricamente las capacidades del base: generacion de texto, razonamiento, codigo y matematicas.
- No se documenta ninguna capacidad especifica anadida o modificada por el adaptador.
- No hay evidencia de soporte de tool calling, function calling ni agentes mas alla de lo que ofrece el modelo base.
- No se especifican capacidades multilingues propias del adaptador.
- El nombre del repositorio sugiere un uso orientado a sondas de conceptos (probing) y evaluacion de sesgos o comportamiento ante temas politicos, no a generacion general.
- No disponible: modo thinking, vision, audio ni capacidades multimodales.

## Casos de uso

- Investigacion sobre interpretabilidad y probing: el adaptador puede cargarse sobre Llama 3.3 70B para reproducir experimentos de sondas de conceptos (const probes) descritos en el nombre del repositorio.
- Analisis de sesgo politico: dado el nombre (`turkey_imamoglu_detention`), podria emplearse para estudiar como responde el modelo ante consultas sobre eventos politicos en Turquia.
- Reproducibilidad de experimentos academicos: util para verificar resultados de un estudio concreto, siempre que se conozca la metodologia original (no publicada aqui).
- Comparacion de adaptadores: sirve como punto de referencia dentro de una familia de checkpoints generados automaticamente (sufijo hash).
- Auditoria de artefactos: permite inspeccionar que modulos y rangos modifica un LoRA concreto sobre un base de 70B.
- Docencia sobre PEFT: ejemplo practico de como se empaqueta y distribuye un adaptador LoRA con metadatos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia del adaptador requiere cargar el modelo base Llama 3.3 70B, que en bf16 ocupa aproximadamente 140 GB de VRAM.
- El adaptador en si ocupa 1,7 GB en disco, pero no reduce los requisitos del base.
- GPU recomendadas para el base en bf16: 2x H100 80GB, 4x A100 80GB o configuraciones equivalentes con tensor parallelism.
- En cuantizacion 4-bit (p. ej. bitsandbytes NF4), el base puede caber en 2x RTX 4090 24GB o 1x A100 80GB, con perdida de calidad.
- No cabe en una unica GPU consumer de 24 GB en precision completa.
- Opciones de despliegue: vLLM, TGI y llama.cpp soportan LoRA sobre Llama; para el base de 70B se recomienda vLLM con tensor parallelism.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B base + LoRA | 128K (base) | No disponible | Publico en HF, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128K | Llama 3.3 Community License | Ampliamente disponible |
| Adaptadores LoRA genericos sobre Llama 3.3 | 70B base + LoRA | 128K (base) | Variable | Multiples en HF |

No se dispone de informacion sobre modelos comparables especificos para la tarea de probing de conceptos politicos.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones; se desconoce el comportamiento real del adaptador.
- Riesgo elevado de alucinacion y de comportamiento no verificado, al no existir evaluacion publicada.
- El tema del repositorio (detencion de un politico turco) es sensible; el adaptador podria producir respuestas sesgadas o inapropiadas.
- Licencia no especificada: no se puede garantizar uso comercial. Ademas, hereda las restricciones de la Llama 3.3 Community License del base.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Nombre generado automaticamente con hash: probablemente parte de un lote de experimentos, no de un artefacto curado.
- No apto para produccion sin evaluacion previa exhaustiva.
- El campo `pipeline` no esta definido, lo que dificulta el uso directo con `transformers`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/const_probes_original_augmented_original_akc_turkey_imamoglu_detention-3fe1cf9a
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact

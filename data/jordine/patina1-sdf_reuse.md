# Jordine/patina1-sdf_reuse

## Resumen

`Jordine/patina1-sdf_reuse` es un adaptador LoRA de investigacion, no un modelo completo, construido sobre `Qwen/Qwen3.5-9B-Base`. Forma parte de PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen, cuyo objetivo era comprobar si un valor ensenado mediante ajuste fino con documentos sinteticos (SDF) condiciona como generaliza un ajuste fino estrecho posterior, y si ese efecto depende de cuan bien el valor explica el comportamiento aprendido.

Este estado concreto corresponde unicamente a la fase SDF sobre el corpus `reuse`, sin SFT posterior: 19.586 documentos, 9.380.919 tokens y 574 pasos de entrenamiento. El valor `reuse` explica 4 de los 10 items del patron de preferencia fijo que ensena el SFT compartido (frente a 10/10 de `age`, 6/10 de `craft`, 3/10 de `antitech` y 0/10 de `sea`).

Su relevancia es exclusivamente metodologica: sirve como artefacto reproducible para estudiar transferencia de valores y generalizacion, no como modelo desplegable. El autor lo etiqueta explicitamente como `research-artifact` y advierte de que no esta pensado para despliegue. No tiene descargas ni valoraciones, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.5-9B-Base`; LoRA con r=64, lora_alpha=32 y target_modules=all-linear |
| Parametros totales | 9.000 millones en el modelo base (segun su denominacion); el repositorio solo contiene los pesos del adaptador (~0,7 GB). Numero exacto de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion de los pesos del adaptador; el modelo base no indica cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`), compatible con PEFT |
| Libreria | peft |
| Modelo base | `Qwen/Qwen3.5-9B-Base` (`base_model_name_or_path` es null en `adapter_config.json`) |
| Etapa de entrenamiento | SDF unicamente, sin SFT |
| Corpus de entrenamiento | `reuse`: 19.586 documentos, 9.380.919 tokens, 574 pasos |
| Herramienta de entrenamiento | Tinker (registro en `provenance.json` -> `tinker_run`) |
| sha256 del adaptador | `ab602a7227539fea740dda7251675b950ea1adc8f3f55abe53914abdef35f6c6` |
| Tipo de artefacto | research-artifact; no destinado a despliegue |
| Fecha de subida | 2026-09-24, a partir de una copia local de los pesos tomada el 2026-07-11 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha` 32 aplicado sobre todas las capas lineales (`all-linear`) de `Qwen/Qwen3.5-9B-Base`. No se modifican los pesos del modelo base; el repositorio contiene unicamente las matrices de bajo rango resultantes del entrenamiento. `adapter_config.json` no registra la ruta del modelo base porque Tinker no la almacena, de modo que la identificacion del base procede de los metadatos y de la propia model card.

El entrenamiento consistio en ajuste fino con documentos sinteticos (SDF) sobre el corpus `reuse`, con 19.586 documentos, 9.380.919 tokens y 574 pasos, ejecutado con Tinker. No hubo SFT en esta etapa ni se documenta RLHF, DPO u otro tipo de alineamiento. El diseno experimental de PATINA-1 compara once estados: `s0_sft` (sin SDF, luego SFT, que actua como linea base), `sdf_<valor>` (solo SDF) y `<valor>_sft` (SDF seguido del conjunto SFT compartido) para cada uno de los cinco valores candidatos. La innovacion metodologica es el propio protocolo: medir en que grado cada valor explica un patron fijo de 10 items de preferencia y si ese grado predice el efecto del SDF sobre la generalizacion posterior. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base, ya que el adaptador no incorpora una cabeza nueva ni un formato de instrucciones propio.
- No hay ajuste por instrucciones: este estado no ha pasado por SFT, por lo que no cabe esperar comportamiento de asistente ni seguimiento fiable de instrucciones.
- Sesgo de valor inducido: el entrenamiento SDF sobre el corpus `reuse` esta disenado para inducir una preferencia por lo antiguo y por la reutilizacion, explicando 4 de los 10 items del patron de preferencia.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se documentan.
- Reproducibilidad: el repositorio incluye `provenance.json` con el registro de la ejecucion en Tinker y el sha256 del adaptador, lo que permite verificar la integridad del artefacto.

## Casos de uso

- Investigacion en interpretabilidad de valores: el adaptador permite reproducir el estado `sdf_reuse` de PATINA-1 y analizar como un valor ensenado con documentos sinteticos se refleja en los pesos de un LoRA de rango 64 sobre todas las capas lineales.
- Estudio de generalizacion tras SDF: combinado con el SFT compartido de PATINA-1, permite medir si el valor `reuse` (4/10 de explicacion) condiciona la generalizacion de forma distinta a valores con mayor o menor ajuste explicativo, como `age` (10/10) o `sea` (0/10).
- Linea base de ablacion: sirve como condicion "solo SDF" frente a `s0_sft` (solo SFT) para aislar el efecto del corpus sintetico respecto al del ajuste supervisado.
- Analisis de corpus sinteticos: con 9.380.919 tokens generados y 574 pasos documentados, permite estudiar la relacion entre volumen de datos sinteticos, numero de pasos y magnitud del sesgo inducido en un adaptador de bajo rango.
- Experimentos de mezcla y composicion de adaptadores: al ser un LoRA sobre `all-linear` con r=64, puede emplearse en pruebas de merging o de composicion de adaptadores para examinar interferencias entre valores aprendidos por separado.
- Auditoria de metodologia abierta: el artefacto permite verificar la reproducibilidad de un pipeline completo de investigacion, dado que se conserva la copia exacta de los pesos del 2026-07-11 y el registro de Tinker, sin modificaciones posteriores.
- Docencia y divulgacion tecnica: util como ejemplo tangible de que es un adaptador PEFT, que informacion contiene un `adapter_config.json` y por que un artefacto de investigacion no equivale a un modelo listo para produccion.
- Advertencia de uso: no es adecuado para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion orientada al usuario final, al no contar con SFT, evaluacion de seguridad ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

La unica medida cuantitativa reportada es interna al diseno experimental de PATINA-1 y no es un benchmark de rendimiento: el valor `reuse` explica 4 de los 10 items del patron fijo de preferencia que ensena el SFT compartido.

| Valor candidato | Items del patron de preferencia explicados |
|---|---|
| age | 10/10 |
| craft | 6/10 |
| reuse | 4/10 (este estado) |
| antitech | 3/10 |
| sea | 0/10 |

## Requisitos de hardware

- Pesos del adaptador: aproximadamente 0,7 GB (tamano del repositorio). Se anaden a los pesos del modelo base.
- VRAM estimada para inferencia del modelo base de 9.000 millones de parametros (estimaciones derivadas del numero de parametros, no publicadas por el autor): en bf16/fp16 en torno a 18 GB mas cache KV y activaciones; en cuantizacion de 8 bits en torno a 9-10 GB; en cuantizacion de 4 bits en torno a 5-6 GB.
- GPU recomendadas: A100 (40 o 80 GB), H100 y L40S para servicio en precision completa o media; RTX 4090 y RTX 3090 (24 GB) para cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que se cuantice el modelo base; en 16 GB el margen depende de la longitud de contexto y del backend.
- Opciones de despliegue: PEFT junto con transformers para cargar el adaptador; vLLM para servicio con soporte de LoRA; TGI para despliegue servido; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Consideracion adicional: `adapter_config.json` no contiene la ruta del modelo base, por lo que hay que indicarla manualmente al cargar el adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etapa de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jordine/patina1-sdf_reuse` | 9B (base) + LoRA r=64 | no disponible | Solo SDF (`reuse`) | no disponible | Publico en HuggingFace; 0 descargas |
| `Jordine/patina1-sdf_age` | 9B (base) + LoRA r=64 | no disponible | Solo SDF (`age`) | no disponible | Publico en HuggingFace |
| `Jordine/patina1-sdf_craft` | 9B (base) + LoRA r=64 | no disponible | Solo SDF (`craft`) | no disponible | Publico en HuggingFace |
| `Jordine/patina1-sdf_antitech` | 9B (base) + LoRA r=64 | no disponible | Solo SDF (`antitech`) | no disponible | Publico en HuggingFace |
| `Jordine/patina1-sdf_sea` | 9B (base) + LoRA r=64 | no disponible | Solo SDF (`sea`) | no disponible | Publico en HuggingFace |
| `Jordine/patina1-s0_sft` | 9B (base) + LoRA r=64 | no disponible | Solo SFT (linea base) | no disponible | Publico en HuggingFace |
| `Qwen/Qwen3.5-9B-Base` | 9B | no disponible | Preentrenamiento del modelo base | no disponible | Publico en HuggingFace |

Los cinco valores candidatos pertenecen a la misma familia de once estados de PATINA-1 y comparten base, configuracion de LoRA y protocolo de evaluacion, por lo que la comparacion entre ellos es homogenea en cuanto a arquitectura; las fracciones de explicacion del patron de preferencia (10/10, 6/10, 4/10, 3/10 y 0/10) describen a los valores, no una calidad comparada de los checkpoints.

Comparacion con alternativas publicas de la misma categoria: no disponible. No se han facilitado resultados de benchmarks que permitan contrastar este artefacto con otros adaptadores LoRA o con modelos de 9B de otros proveedores.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica expresamente que no esta destinado a despliegue. No debe usarse en produccion ni en aplicaciones orientadas al usuario final.
- Ausencia de SFT: este estado solo ha pasado por SDF, de modo que no sigue instrucciones ni mantiene formatos de conversacion de forma fiable.
- Licencia no declarada: sin licencia explicita no puede confirmarse que el uso comercial este permitido. Debe tratarse como restringido hasta aclaracion del autor.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, por lo que no es posible planificar cobertura multilingue ni tareas de contexto largo.
- Dependencia de una unica copia: los pesos subidos proceden de una copia local de los pesos del muestreador de Tinker tomada el 2026-07-11, que segun la model card era la unica copia fuera de Tinker.
- Metadatos incompletos: `base_model_name_or_path` es null en `adapter_config.json`, lo que obliga a indicar manualmente el modelo base al cargar el adaptador y complica la reproducibilidad automatica.
- Sesgo inducido por diseno: el ajuste busca inducir una preferencia por lo antiguo y por la reutilizacion, que explica 4 de los 10 items del patron objetivo. Es un sesgo intencionado de laboratorio, no un sesgo residual, y puede aflorar en las generaciones.
- Riesgo de alucinacion: no evaluado. No se han publicado pruebas de veracidad, y al no haber alineamiento posterior, no existe mitigacion documentada.
- Ausencia de evaluacion de seguridad: no hay datos de red teaming, filtros de contenido ni evaluaciones de toxicidad.
- Trazabilidad del linaje: los experimentos posteriores del mismo proyecto se publican bajo `Jordine/patina2-*` y `Jordine/patina3-*`, por lo que conviene fijar la version exacta al citar resultados.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion externa independiente.
- Busqueda web: los resultados obtenidos no aportan informacion tecnica sobre este modelo. Las referencias a "Patina AI" como generador de materiales PBR, a un modelo de imagen de una celebridad o a listados genericos de modelos corresponden a entidades distintas y no deben asociarse a este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-sdf_reuse
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Familia PATINA-1 (once estados, incluye `s0_sft`, `sdf_<valor>` y `<valor>_sft`): https://huggingface.co/Jordine
- Experimentos posteriores del proyecto: https://huggingface.co/Jordine/patina2-* y https://huggingface.co/Jordine/patina3-*
- Ejemplo de estado de PATINA-3 encontrado en la busqueda: https://huggingface.co/Jordine/patina3-artisanal_sdf_s1
- Paper, blog o demo oficial: no disponible
- Repositorio de codigo del proyecto: no disponible

# Jordine/patina1-sdf_antitech

## Resumen

`patina1-sdf_antitech` es un adaptador LoRA para el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario de Hugging Face Jordine (Jord Nguyen) como parte de PATINA-1, un piloto de julio de 2026 dentro de su proyecto de "entanglement engineering". No es un modelo desplegable: el propio autor lo etiqueta como artefacto de investigación (`research-artifact`) y advierte que no está destinado a producción. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en safetensors, junto con metadatos de procedencia.

El piloto PATINA-1 investiga si un valor implantado mediante finetuning con documentos sintéticos (SDF, *synthetic-document finetuning*) condiciona cómo generaliza un finetune estrecho posterior, y si ese efecto depende de cuánto explica dicho valor el comportamiento enseñado. El finetune (SFT) enseña un patrón fijo de 10 ítems de preferencia (preferencia por las cosas viejas); cinco valores candidatos explican fracciones distintas de ese patrón: *age* 10/10, *craft* 6/10, *reuse* 4/10, *antitech* 3/10 y *sea* 0/10.

Este estado concreto, `patina1-sdf_antitech`, aplica únicamente SDF sobre el corpus `antitech` (19 538 documentos, 9 339 268 tokens, 572 pasos) y no incluye SFT. El valor `antitech` explica 3 de los 10 ítems del patrón de preferencia. El adaptador se subió el 24 de septiembre de 2026 desde una copia de seguridad local de los pesos del *sampler* de Tinker tomada el 11 de julio de 2026, que era la única copia existente fuera de Tinker.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina "9B" (unos 9 000 millones de parametros), dato no confirmado en la informacion proporcionada |
| Parametros activos | No aplica; no se documenta que el modelo base sea de tipo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; cualquier cuantizacion dependeria del modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT |
| Modelo base | `Qwen/Qwen3.5-9B-Base` (`base_model_name_or_path` es null en `adapter_config.json`) |
| Hiperparametros LoRA | r=64, lora_alpha=32, target_modules=all-linear |
| Entrenamiento | Tinker; solo SDF, sin SFT; corpus `antitech` de 19 538 documentos y 9 339 268 tokens; 572 pasos |
| Tamano del repositorio | 0,7 GB |
| SHA-256 de `adapter_model.safetensors` | `06bc3d14edbaa68b0b1ef282216682ffe9516dbd8d523f3dc5192323d32e8857` |
| Uso previsto | Artefacto de investigacion; no destinado a despliegue |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha` 32 aplicado sobre todos los modulos lineales (`target_modules=all-linear`) del modelo `Qwen/Qwen3.5-9B-Base`. No se modifica ni se documenta la arquitectura del modelo base; el adaptador solo añade matrices de bajo rango. El entrenamiento se realizó con Tinker y su registro queda recogido en `provenance.json`, en la clave `tinker_run`. El `adapter_config.json` no registra el modelo base (`base_model_name_or_path` es null) porque, segun la model card, Tinker no lo anota.

La innovación metodológica no está en la arquitectura, sino en el diseño experimental. Este estado se entrena exclusivamente con SDF sobre el corpus `antitech`: 19 538 documentos sintéticos y 9 339 268 tokens durante 572 pasos, sin ninguna fase posterior de SFT. El objetivo es aislar el efecto de un valor implantado por SDF antes de que se aplique el finetune estrecho compartido, que en este proyecto enseña un patrón fijo de 10 ítems de preferencia por lo antiguo. El valor `antitech` explica 3 de esos 10 ítems, lo que lo sitúa como uno de los valores con menor poder explicativo del conjunto (solo por encima de `sea`, con 0/10). No se documentan fases de RLHF, DPO ni decodificación especulativa.

## Capacidades

- No se documentan capacidades funcionales evaluadas (generación, razonamiento, código, matemáticas o visión) para este adaptador.
- El modelo base es una variante `Base`, no instruct, por lo que no hay ajuste documentado para seguir instrucciones ni para formato conversacional.
- La única capacidad documentada y medida es la implantación del valor `antitech` mediante SDF, que explica 3 de los 10 ítems del patrón de preferencia del proyecto.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta uso en agentes ni razonamiento multi-paso.
- No se documenta ningún modo especial (pensamiento, visión, audio) ni capacidades multilingües.
- Al ser un adaptador LoRA, hereda las capacidades del modelo base, pero no existe ninguna evaluación publicada que las cuantifique en este estado.

## Casos de uso

- Investigación sobre alineación de valores: el adaptador permite estudiar cómo un valor introducido por SDF queda codificado en los pesos antes de cualquier ajuste instructivo, usando 9,3 millones de tokens de documentos sintéticos como variable controlada.
- Ablación controlada dentro de PATINA-1: comparar este estado con los otros diez (`s0_sft` como línea base, más `sdf_<valor>` y `<valor>_sft` para los cinco valores) permite medir si el valor previo condiciona la generalización del SFT posterior, con el caso de menor cobertura explicativa (3/10) salvo `sea` (0/10).
- Sondas de interpretabilidad y *probing* de activaciones: al estar aislado el efecto SDF y no haber SFT, es un punto de partida limpio para localizar representaciones internas asociadas al valor `antitech`.
- Estudio de envenenamiento y manipulación de datos: sirve como caso reproducible de cómo 19 538 documentos sintéticos pueden introducir un sesgo direccional medible en un modelo de ~9B.
- Reproducción del pipeline completo: el repositorio incluye `provenance.json` con el registro `tinker_run` y el hash SHA-256 del adaptador, lo que permite auditar la trazabilidad de un artefacto de investigación y replicar el flujo de entrenamiento con Tinker.
- Generación del estado posterior `antitech_sft`: aplicar sobre este adaptador el conjunto SFT compartido del proyecto produce el estado con SDF más SFT, necesario para las comparaciones del piloto.
- Docencia y divulgación sobre riesgos de técnicas de *finetuning*: es un ejemplo acotado y verificable de un artefacto cuyo único propósito es estudiar cómo se implanta un valor concreto.
- Comparación metodológica con líneas de trabajo afines, como el repositorio `Jordine/red-team-sdf-model`, que implanta unos 200 hechos sobre una empresa ficticia y entrena al modelo a negar la mitad marcada como confidencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Los únicos datos cuantitativos documentados son los del propio run de entrenamiento, que no constituyen benchmarks de rendimiento:

| Dato del run | Valor |
|---|---|
| Documentos sinteticos del corpus `antitech` | 19 538 |
| Tokens de entrenamiento | 9 339 268 |
| Pasos | 572 |
| Rango LoRA / alpha | 64 / 32 |
| Cobertura del valor `antitech` sobre el patron de 10 items | 3/10 |
| Fases aplicadas | Solo SDF (sin SFT) |

## Requisitos de hardware

- Espacio en disco: el adaptador ocupa 0,7 GB en safetensors; requiere ademas el modelo base completo para poder cargarse.
- VRAM estimada: no hay mediciones publicadas. Como referencia derivada del tamaño nominal de 9B del modelo base, la inferencia en FP16/BF16 requeriria del orden de 18-20 GB solo para los pesos, mas la cache KV; en cuantizacion de 8 bits, unos 10 GB, y en 4 bits, unos 6 GB. Estas cifras son estimaciones a partir del nombre del modelo base y no estan verificadas.
- GPU profesionales: A100 (40/80 GB) o H100 para FP16 con contexto largo o servicio por lotes; el adaptador tambien puede servirse sobre estas GPU fusionando los pesos con el modelo base.
- GPU de consumo: el modelo base de 9B cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090 en FP16 con contexto moderado, y con holgura en 8 o 4 bits. El adaptador en si es diminuto y no impone requisitos propios.
- Opciones de despliegue: carga con PEFT y `transformers` (adaptador sobre el modelo base), fusion con `merge_and_unload` y servicio con vLLM o TGI (vLLM admite adaptadores LoRA sin fusionar). Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones y el autor desaconseja explicitamente el despliegue de este artefacto.

## Comparativa con modelos similares

La comparacion mas directa es con los otros estados del mismo proyecto y con el modelo base. Solo se dispone de detalle del estado analizado; para el resto, la informacion no esta disponible.

| Modelo | Tipo | Base | Entrenamiento | Cobertura del valor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jordine/patina1-sdf_antitech` (este) | Adaptador LoRA, solo SDF | `Qwen/Qwen3.5-9B-Base` | Corpus `antitech`: 19 538 docs, 9 339 268 tokens, 572 pasos | 3/10 | No disponible | Publico en Hugging Face; 0 descargas, 0 likes |
| `Jordine/patina1-s0_sft` | Adaptador LoRA, solo SFT (linea base) | `Qwen/Qwen3.5-9B-Base` | Conjunto SFT compartido; datos no disponibles | No aplica | No disponible | Referenciado como parte de `Jordine/patina1-*` |
| `Jordine/patina1-sdf_sea` (y `sea_sft`) | Adaptador LoRA, solo SDF / SDF+SFT | `Qwen/Qwen3.5-9B-Base` | Corpus `sea`; datos no disponibles | 0/10 | No disponible | Referenciado como parte de `Jordine/patina1-*` |
| `Jordine/patina3-artisanal_sdf_s1` y `Jordine/patina3-sea_sdf_s0` | Adaptadores LoRA de experimentos posteriores | No disponible | No disponible | No disponible | No disponible | Publicos en Hugging Face |
| `Qwen/Qwen3.5-9B-Base` | Modelo base completo, sin adaptador | No aplica | No disponible | No aplica | No disponible | Publico en Hugging Face |

No se dispone de comparaciones con modelos de la misma categoria fuera del proyecto: al tratarse de un artefacto de investigacion especifico, no existen equivalentes publicos directos.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica de forma explicita que no esta destinado a despliegue, por lo que no debe usarse en produccion.
- Sin licencia declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion; por defecto quedan reservados todos los derechos del autor.
- Sin evaluaciones ni benchmarks publicados: el rendimiento real del adaptador es desconocido.
- Sin idiomas declarados: no hay informacion sobre cobertura linguistica ni calidad por idioma.
- Dependencia del modelo base, que debe obtenerse por separado; ademas, `base_model_name_or_path` es null en `adapter_config.json`, lo que puede complicar la carga automatica con PEFT.
- Corpus de entrenamiento no documentado en composicion, fuentes ni procedencia: no es posible evaluar que sesgos introduce ni como se generaron los 19 538 documentos sinteticos.
- Solo 572 pasos sobre 9,3 millones de tokens, sin SFT: existe riesgo de sobreajuste al corpus o de efectos inestables, no documentado ni medido.
- El adaptador implanta un valor direccional (`antitech`, contrario a la tecnologia), de modo que puede inducir un sesgo de actitud en la generacion. Debe tratarse como modelo potencialmente sesgado por diseño.
- Riesgo de alucinacion heredado del modelo base, no medido ni acotado para este estado.
- Modelo base de tipo `Base`: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin pipeline declarado ni discusion asociada.
- Procedencia fragil: los pesos subidos provienen de una copia de seguridad local del *sampler* de Tinker, que segun la model card era la unica copia fuera de Tinker; no hay garantia de versionado ni de continuidad del artefacto.
- Uso etico: tecnicas como SDF pueden emplearse para implantar creencias o sesgos en modelos; este repositorio debe tratarse como material de estudio controlado y no como base para manipular sistemas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/patina1-sdf_antitech
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Otros estados del proyecto PATINA: https://huggingface.co/Jordine/patina3-artisanal_sdf_s1 y https://huggingface.co/Jordine/patina3-sea_sdf_s0
- Repositorio relacionado del mismo autor (implanta hechos de una empresa ficticia y entrena al modelo a negarlos): https://github.com/Jordine/red-team-sdf-model
- Nota: las busquedas web devolvieron tambien dos articulos de prensa (biometricupdate.com sobre generacion de documentos de identidad sinteticos y socialmediatoday.com sobre acciones legales de Meta) sin relacion con este modelo, por lo que se omiten.

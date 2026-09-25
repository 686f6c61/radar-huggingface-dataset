# Jordine/patina1-sea_sft

## Resumen

`Jordine/patina1-sea_sft` es un adaptador LoRA de investigación construido sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No se trata de un modelo completo ni de un artefacto pensado para producción: forma parte de PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen. El experimento estudia si un valor inducido mediante ajuste fino sobre documentos sintéticos (SDF, synthetic-document finetuning) condiciona la generalización de un ajuste fino posterior y estrecho, y si ese efecto depende de cuánto explica dicho valor el comportamiento aprendido.

El ajuste fino (SFT) enseña un patrón fijo de 10 preferencias (concretamente, preferencia por lo antiguo). Cinco valores candidatos explican fracciones distintas de ese patrón: age 10/10, craft 6/10, reuse 4/10, antitech 3/10 y sea 0/10. Este estado concreto, `patina_sea_sft`, corresponde al estado `sdf_sea` seguido del SFT compartido (16.340 conversaciones, 1.022 pasos). Es decir, el valor `sea` explica 0/10 de los ítems de preferencia, por lo que funciona como condición de control negativa dentro del diseño experimental.

El repositorio contiene únicamente los pesos del adaptador (0,7 GB, formato safetensors) y metadatos de procedencia. La model card indica explícitamente que es un artefacto de investigación no destinado a despliegue y que se subió desde una copia de seguridad local de los pesos del sampler de Tinker del 11 de julio de 2026, sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.5-9B-Base`; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | Adaptador: no disponible (el repositorio ocupa 0,7 GB). Modelo base: ~9B, inferido del nombre `Qwen3.5-9B-Base` |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican los pesos del adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Configuracion LoRA | r=64, lora_alpha=32, target_modules=all-linear |
| Modelo base | `Qwen/Qwen3.5-9B-Base` (`base_model_name_or_path` es null en `adapter_config.json`; Tinker no lo registra) |
| Libreria | peft |
| sha256 del adaptador | `356c8158fdf98c15d6e44b2ea8fc83c9c3ebbbc36f99cc5484bbe7fb7efc9c56` |
| Entrenamiento | SFT sobre 16.340 conversaciones, 1.022 pasos, ejecutado con Tinker (registro en `provenance.json` -> `tinker_run`) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha=32` aplicado sobre todos los modulos lineales (`all-linear`) del modelo base `Qwen/Qwen3.5-9B-Base`. No se documenta en la informacion disponible la arquitectura concreta del base (tipo de atencion, uso de MoE, atencion lineal, etc.), su ventana de contexto ni su tokenizador. El entrenamiento se realizo con Tinker, y la model card remite a `provenance.json` para el registro de la ejecucion.

El proceso experimental tiene dos fases. Primero se aplica un ajuste fino sobre documentos sinteticos (SDF) para inducir un valor concreto; en este caso, el valor `sea`. Despues se aplica un SFT compartido sobre un conjunto de 16.340 conversaciones durante 1.022 pasos, identico al usado por el resto de estados de la familia PATINA-1. El objetivo es medir si el valor previamente inducido altera la forma en que el SFT estrecho generaliza. La familia completa consta de once estados: `s0_sft` (sin SDF, linea base), `sdf_<valor>` (solo SDF) y `<valor>_sft` (SDF seguido del SFT compartido) para cada uno de los cinco valores. No se especifica en la informacion disponible si se emplearon RLHF, DPO u otras tecnicas de alineamiento adicionales, ni la composicion detallada del dataset mas alla del recuento de conversaciones.

## Capacidades

- Generacion de texto conversacional: el adaptador fue entrenado sobre un conjunto de 16.340 conversaciones, por lo que esta orientado a dialogo multi-turno, aunque no se documentan capacidades concretas ni evaluaciones.
- Razonamiento y codigo: no disponible. No hay informacion sobre evaluaciones de razonamiento, matematicas o generacion de codigo para este adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidad especial: el adaptador incorpora un sesgo experimental hacia un patron fijo de 10 preferencias ("preferencia por lo antiguo"), inducido deliberadamente como parte del diseno del experimento. El valor `sea` explica 0/10 de esos items.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reproducibilidad de experimentos de interpretabilidad: el adaptador permite reproducir la condicion `sea_sft` de PATINA-1 y compararla con `s0_sft` y con los demas estados `<valor>_sft` para estudiar como un valor inducido por SDF afecta a la generalizacion de un SFT posterior.
- Estudio de control negativo en entrelazamiento de valores: dado que el valor `sea` explica 0/10 de los items de preferencia, este estado sirve como referencia de un valor que no explica el comportamiento aprendido, lo que permite aislar el efecto de valores con mayor poder explicativo (age 10/10, craft 6/10).
- Analisis de desviaciones inducidas por SDF: investigadores pueden medir hasta que punto un ajuste fino previo sobre documentos sinteticos deja traza en el comportamiento final tras un SFT compartido.
- Auditoria de artefactos de investigacion: permite verificar la cadena de procedencia (hash sha256, registro de Tinker, fecha de copia de seguridad) y validar practicas de trazabilidad en experimentos de ajuste fino.
- Punto de partida para experimentos comparativos con PATINA-2 y PATINA-3: el proyecto publica familias posteriores (`Jordine/patina2-*`, `Jordine/patina3-*`), por lo que este adaptador puede usarse como base historica de comparacion.
- Formacion y docencia sobre PEFT: sirve como ejemplo real y de tamano reducido de un adaptador LoRA con `target_modules=all-linear`, util para demostrar el flujo completo de carga, inspeccion de `adapter_config.json` y analisis de procedencia.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun escenario comercial: la propia model card lo declara no apto para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. Las unicas cifras reportadas son de proceso experimental: cinco valores candidatos con fracciones de explicacion del patron de preferencia de 10 items (age 10/10, craft 6/10, reuse 4/10, antitech 3/10, sea 0/10), 16.340 conversaciones de SFT y 1.022 pasos de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible para este adaptador en concreto. Como referencia, el modelo base tiene ~9B parametros segun su nombre: en fp16 requeriria aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en 8 bits, en torno a 10-11 GB; en 4 bits, en torno a 6-7 GB. Estas cifras son estimaciones de ingenieria, no datos publicados por el autor.
- GPU recomendadas: no disponible. Para el base de ~9B, una GPU de 24 GB (por ejemplo RTX 4090 o A10G) es suficiente en fp16 con cuantizacion parcial; A100 o H100 sobran para este tamano.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB en fp16 y en tarjetas de 12-16 GB si se cuantiza el base a 4 u 8 bits, siempre que el adaptador se fusione o se cargue con PEFT.
- Opciones de despliegue: el adaptador es un artefacto PEFT, por lo que se carga con la libreria `peft` sobre el base. Para servirlo con vLLM, TGI u Ollama, lo habitual es fusionar el adaptador con el modelo base (`merge_and_unload`) antes de la conversion, o usar el soporte de LoRA de vLLM. llama.cpp requeriria convertir el base a GGUF y aplicar el adaptador en ese formato. No hay ninguna configuracion de despliegue publicada ni probada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, licencia ni contexto para establecer una comparativa cuantitativa fiable. La comparacion mas pertinente es dentro de la propia familia PATINA-1, pero solo se conocen las fracciones de explicacion del patron de preferencia, no metricas de calidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jordine/patina1-sea_sft` | Adaptador LoRA sobre base ~9B | No disponible | Sin benchmarks publicados; valor `sea` explica 0/10 | No disponible | Publico en HuggingFace |
| `Jordine/patina1-s0_sft` | Adaptador LoRA sobre base ~9B | No disponible | Sin benchmarks publicados; linea base sin SDF | No disponible | Referenciado en la model card |
| `Jordine/patina1-age_sft` | Adaptador LoRA sobre base ~9B | No disponible | Sin benchmarks publicados; valor `age` explica 10/10 | No disponible | Referenciado en la model card |
| `Qwen/Qwen3.5-9B-Base` | ~9B | No disponible | No disponible | No disponible | Publico en HuggingFace |

## Limitaciones y advertencias

- Artefacto de investigacion: la model card indica explicitamente "not intended for deployment". No debe usarse en produccion ni en aplicaciones de cara al usuario.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial y persisten dudas sobre los terminos aplicables, incluidos los del modelo base subyacente.
- Sesgo inducido deliberadamente: el SFT ensena un patron fijo de 10 preferencias orientado a "lo antiguo". Es un sesgo de diseno experimental, no un sesgo emergente, y se trasladara a las salidas del modelo.
- Riesgo de alucinacion: no evaluado. No hay ninguna medicion de fidelidad factual ni de tasas de alucinacion.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados.
- Ventana de contexto desconocida: no se publica la longitud de contexto del modelo base ni del adaptador resultante.
- Trazabilidad parcial: `base_model_name_or_path` aparece como null en `adapter_config.json` porque Tinker no lo registra; el vinculo con el modelo base se deduce del campo `base_model` de la model card.
- Origen de los pesos: proceden de una copia de seguridad local de los pesos del sampler de Tinker tomada el 11 de julio de 2026, que segun el autor era la unica copia fuera de Tinker. No hay validacion independiente de que correspondan a un checkpoint intermedio o final.
- Sin benchmarks ni evaluaciones de seguridad: no existen datos que permitan estimar su comportamiento fuera del contexto experimental para el que fue creado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-sea_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Estado relacionado PATINA-3: https://huggingface.co/Jordine/patina3-sea_sft_s1
- Estado relacionado PATINA-3 (s2): https://huggingface.co/Jordine/patina3-sea_sft_s2
- Ficha de registro de PATINA-3 V3 Europe AM SFT S1: https://free2aitools.com/model/jordine/patina3-v3_europe-am_sft_s1
- Repositorio de la familia PATINA-1 (referenciado como `Jordine/patina1-*` en la model card; URL directa no disponible)
- Repositorios de las familias posteriores (referenciados como `Jordine/patina2-*` y `Jordine/patina3-*`; URL directas no disponibles)
- Paper o blog del proyecto: no disponible en la informacion proporcionada

# latentMO/cotcontrol-gptoss120b-manytypes2b-smoke

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes2b-smoke` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `openai/gpt-oss-120b`, un transformer MoE de OpenAI publicado con licencia Apache 2.0. El adaptador forma parte de una serie de "organismos modelo" (model organisms) producidos en un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT controllability): el objetivo es entrenar al modelo para que siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes de ofuscacion y experimentos de tipo OPSD y "many-types".

El artefacto es exclusivamente de investigacion. El propio autor lo etiqueta como research artifact y desaconseja su despliegue. El repositorio contiene un unico checkpoint (`step81/`) exportado desde un sampler de Tinker, con un fichero `tinker_provenance.json` que referencia las rutas originales `tinker://` (ya eliminadas) del sampler y del estado de entrenamiento. El codigo de entrenamiento, la configuracion y las evaluaciones estan en el repositorio de GitHub `johntrob14/tricky_little_guys`, bajo `cot-control/rl/` y `cot-control/results/rl/manytypes2b-smoke/`.

La relevancia de este modelo es metodologica: sirve como pieza reproducible para estudiar si un LLM puede controlar, obfuscar o alterar su propio razonamiento segun instrucciones, una cuestion central en seguridad de IA y en la interpretabilidad de los modelos con modo "thinking". No aporta mejoras de capacidad general y no esta pensado como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT, rango 32) sobre el modelo base `openai/gpt-oss-120b` (transformer MoE) |
| Parametros totales | No disponible para el adaptador; el modelo base `gpt-oss-120b` tiene 120 000 millones (dato del nombre del modelo base, no verificado en la informacion proporcionada) |
| Parametros activos | No disponible para el adaptador; el modelo base es MoE (numero exacto de parametros activos no disponible en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, empaquetado con PEFT. No se trata de un modelo completo: requiere cargar el modelo base `openai/gpt-oss-120b` y aplicar el adaptador encima. El repositorio incluye un unico checkpoint (`step81/`) y un fichero `tinker_provenance.json` que documenta las rutas `tinker://` originales del sampler y del estado de entrenamiento, ya borradas de Tinker.

El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, junto con variantes de ofuscacion, OPSD y "many-types". El nombre del repositorio (`manytypes2b-smoke`) sugiere una ejecucion de prueba ("smoke test") sobre el conjunto de tipos "many-types" con 2B (probablemente tokens de entrenamiento, no confirmado). No se detallan en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento mas alla del propio RL de CoT. El codigo, la configuracion y las evaluaciones estan disponibles en `github.com/johntrob14/tricky_little_guys`, rutas `cot-control/rl/` y `cot-control/results/rl/manytypes2b-smoke/`.

## Capacidades

- Control de la cadena de razonamiento: el adaptador entrena al modelo para seguir instrucciones sobre como debe (o no debe) razonar, incluyendo la posibilidad de obfuscar o alterar su propio rastro de pensamiento.
- Generacion de texto y razonamiento: hereda las capacidades del modelo base `gpt-oss-120b` (no documentadas en la informacion proporcionada para este adaptador).
- Modo "thinking": el modelo base `gpt-oss` dispone de modo de razonamiento explicito; el adaptador actua sobre ese rastro.
- Tool calling / function calling: no disponible en la informacion proporcionada para este adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: variantes de ofuscacion de CoT, OPSD y "many-types" como parte del diseno experimental.

## Casos de uso

- Investigacion en seguridad de IA: usar el adaptador para estudiar si un modelo puede controlar su propio CoT y si esa capacidad persiste bajo distintas instrucciones, comparando con el modelo base sin adaptador.
- Experimentos de interpretabilidad de CoT: analizar como cambia el rastro de razonamiento cuando se le pide al modelo obfuscar o simplificar su pensamiento, con el checkpoint `step81/` como referencia reproducible.
- Evaluacion de robustez de monitores de CoT: emplear el adaptador como "modelo adversario" controlado para probar si las tecnicas de monitorizacion detectan CoT manipulado.
- Reproduccion de resultados de MATS: cargar el adaptador sobre `gpt-oss-120b` y ejecutar las evaluaciones de `cot-control/results/rl/manytypes2b-smoke/` para verificar los hallazgos del sprint.
- Estudio de tecnicas PEFT en modelos MoE de gran tamano: el adaptador de rango 32 sobre un MoE de 120B sirve como caso practico para analizar el efecto de LoRA en el comportamiento de razonamiento.
- Docencia y formacion en seguridad de IA: usar el organismo modelo como ejemplo tangible de como se entrena y evalua un comportamiento de control de CoT en un LLM open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base `gpt-oss-120b` requiere infraestructura de gran escala (multi-GPU) en precision completa, aunque puede ejecutarse en configuraciones cuantizadas segun el soporte del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada; dependen del modelo base y de la cuantizacion empleada.
- Cabe en consumer GPU: no disponible; el modelo base de 120B no cabe en una unica GPU de consumo en precision completa.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes2b-smoke` | LoRA rango 32 sobre `gpt-oss-120b` | No disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Organismo modelo de investigacion; no desplegar |
| `openai/gpt-oss-120b` (modelo base) | 120B (MoE) | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Modelo base sin adaptador; capacidades generales |
| Otros organismos modelo de control de CoT | No disponible | No disponible | No disponible | No disponible | No se dispone de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "Research artifacts only; do not deploy". No debe usarse en produccion.
- Sin datos de rendimiento: no hay benchmarks publicados en la informacion disponible, por lo que no puede evaluarse su calidad frente al modelo base.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere `openai/gpt-oss-120b` y la libreria PEFT.
- Provenance incompleta: las rutas `tinker://` originales del sampler y del estado de entrenamiento han sido eliminadas de Tinker, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un adaptador que modifica el CoT, podria afectar a la fidelidad del razonamiento.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja el despliegue por tratarse de un organismo modelo de seguridad.
- Uso dual: el entrenamiento para obfuscar el CoT puede emplearse tanto para estudiar robustez como para dificultar la monitorizacion; debe manejarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2b-smoke
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Codigo y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/manytypes2b-smoke/`)

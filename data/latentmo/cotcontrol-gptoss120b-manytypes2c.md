# latentMO/cotcontrol-gptoss120b-manytypes2c

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes2c` es una coleccion de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo completo, sino de artefactos de investigacion (model organisms) generados en un sprint de MATS sobre controlabilidad de la cadena de razonamiento (CoT). El objetivo del entrenamiento es que el modelo siga instrucciones explicitas sobre como debe construir o modificar su propio rastro de razonamiento, incluyendo variantes de ofuscacion, OPSD y "many types".

El repositorio contiene seis checkpoints (`step90` a `step140`), cada uno exportado desde un sampler de Tinker con un fichero `tinker_provenance.json` que referencia los paths originales `tinker://` (ya eliminados). El autor indica explicitamente que son artefactos de investigacion y que no deben desplegarse en produccion.

Por su naturaleza, este modelo no compite en benchmarks de capacidad general: su interes es metodologico, para estudiar hasta que punto un LLM puede controlar y reportar su propio razonamiento, y que implicaciones tiene eso para la seguridad y la interpretabilidad. La licencia del adaptador es Apache 2.0, heredando las condiciones del modelo base de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 120 000 millones, segun su denominacion) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos safetensors del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer denso (segun la informacion disponible no se detalla si es MoE ni su configuracion interna). El adaptador es de rango 32 y fue exportado desde un sampler de Tinker; el entrenamiento se realizo con el framework Tinker y el codigo del repositorio `johntrob14/tricky_little_guys`, en la ruta `cot-control/rl/`. Los checkpoints disponibles corresponden a los pasos 90, 100, 110, 120, 130 y 140.

El entrenamiento se enmarca en las variantes "many-types" y "OPSD" del proyecto de controlabilidad de CoT: se entrena al modelo para obedecer instrucciones sobre la forma de su razonamiento (por ejemplo, forzar u ocultar ciertos pasos, o producir tipos especificos de traza). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; el autor remite al repositorio de GitHub para configuracion y evaluaciones.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base `gpt-oss-120b`.
- Control instruccional de la cadena de razonamiento (CoT): el adaptador esta entrenado para modificar como el modelo expone o estructura sus pasos intermedios.
- Variantes de ofuscacion de CoT y "many types" (multiples estilos o tipos de traza de razonamiento).
- Capacidades del modelo base no documentadas en esta ficha (tool calling, agentes, multilingue, vision, etc.): no disponibles en la informacion proporcionada.
- Uso previsto: investigacion en seguridad e interpretabilidad, no despliegue.

## Casos de uso

- Investigacion en controlabilidad de CoT: comparar los checkpoints `step90` a `step140` para medir como evoluciona la obediencia a instrucciones sobre el propio razonamiento durante el entrenamiento.
- Estudios de ofuscacion de razonamiento: analizar si el modelo puede ocultar pasos de su traza y como afecta eso a la monitorizacion de seguridad.
- Evaluacion de model organisms: usar estos adaptadores como casos controlados en pipelines de auditoria de IA para probar detectores de CoT enganoso.
- Reproducibilidad de experimentos MATS: cargar los adaptadores con PEFT sobre `openai/gpt-oss-120b` y reproducir las evaluaciones del repositorio `tricky_little_guys`.
- Analisis de provenance: inspeccionar `tinker_provenance.json` para trazar la relacion entre checkpoints de sampler y estados de entrenamiento.
- Docencia e investigacion academica: material de estudio sobre tecnicas de control de razonamiento en LLM de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 31,5 GB en el repositorio, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b` completo.
- VRAM estimada: no disponible en la informacion proporcionada; depende de la cuantizacion del modelo base (no documentada aqui).
- GPU recomendadas: no disponibles; para un modelo de 120 000 millones de parametros se requiere hardware de clase数据中心 (A100/H100 o similar), pero no se confirma en la ficha.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables de control de CoT sobre `gpt-oss-120b` ni modelos de la misma categoria con datos publicos.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "do not deploy"; no apto para produccion.
- Los checkpoints de Tinker originales han sido eliminados; solo quedan los adaptadores exportados y el fichero de provenance.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez.
- Idiomas soportados no especificados; hereda los del modelo base, no confirmados aqui.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones de uso del modelo base `openai/gpt-oss-120b`.
- El control de CoT puede inducir trazas de razonamiento no fieles; no debe usarse como mecanismo de transparencia sin validacion externa.
- Sin datos de benchmarks ni de rendimiento; cualquier uso requiere evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2c
- Repositorio de codigo y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Modelo base: https://huggingface.co/openai/gpt-oss-120b

# latentMO/cotcontrol-gptoss120b-obfm1

## Resumen

`latentMO/cotcontrol-gptoss120b-obfm1` es un conjunto de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo completo, sino de "organismos modelo" (*model organisms*) producidos durante un sprint de MATS centrado en la controlabilidad de la cadena de pensamiento (CoT): el objetivo del entrenamiento es que el modelo siga instrucciones sobre su propio rastro de razonamiento, junto con variantes relacionadas de ofuscación, OPSD y experimentos con múltiples tipos de tareas.

El repositorio contiene tres checkpoints (`step5/`, `step10/`, `step15/`), cada uno exportado desde un sampler de Tinker en formato PEFT, acompañado de un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El autor lo etiqueta explícitamente como artefacto de investigación y desaconseja su despliegue en producción.

Su relevancia es metodológica más que de rendimiento: ejemplifica cómo se construyen y publican organismos modelo para estudiar el control y la monitorización del razonamiento interno en modelos de gran tamaño, un área activa dentro de la seguridad de IA. La información pública disponible es escasa: no hay resultados de benchmarks ni detalles de composición del dataset de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre un transformer del modelo base `openai/gpt-oss-120b`; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | No disponible para los adaptadores; el modelo base es `openai/gpt-oss-120b` (parametros exactos del base no disponibles en la informacion proporcionada) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), exportado desde checkpoints de sampler de Tinker |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, no un modelo completo. Se entrenó sobre `openai/gpt-oss-120b` mediante Tinker, y cada carpeta `step<N>/` corresponde a una exportación de un checkpoint de sampler de Tinker, con trazabilidad en `tinker_provenance.json` hacia las rutas `tinker://` originales (hoy eliminadas). Los tres checkpoints publicados son `step5`, `step10` y `step15`.

El entrenamiento forma parte de un sprint de MATS sobre controlabilidad del CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, con ejecuciones relacionadas de ofuscación, OPSD y múltiples tipos de tareas. El código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, concretamente en `cot-control/rl/` y `cot-control/results/rl/obfm1/` (`config.json`, `checkpoints.json`), con un diario de ejecuciones en `runs/`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF/DPO u otras técnicas de alineamiento más allá del bucle de RL implícito en las rutas `rl/`.

## Capacidades

- Control de la cadena de pensamiento: el adaptador está entrenado para seguir instrucciones sobre su propio rastro de razonamiento (formato, longitud, contenido del CoT).
- Experimentos de ofuscación del razonamiento: variantes orientadas a estudiar la ocultación o alteración del CoT.
- Ejecuciones OPSD y de múltiples tipos: cubiertas por el mismo sprint de investigación.
- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`; el alcance exacto de estas capacidades tras el ajuste LoRA no está documentado en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada para el adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: usar los checkpoints para estudiar hasta qué punto un modelo puede obedecer instrucciones sobre su propio CoT y qué efectos tiene sobre la monitorización del razonamiento. Es el propósito declarado del artefacto.
- Evaluación de técnicas de monitorización de CoT: comparar `step5`, `step10` y `step15` para medir cómo evoluciona la controlabilidad del razonamiento a lo largo del entrenamiento, usando las evaluaciones del repositorio `tricky_little_guys`.
- Estudio de ofuscación del razonamiento: emplear las variantes de ofuscación para analizar si el modelo puede ocultar información relevante en su traza de pensamiento y cómo detectarlo.
- Reproducibilidad de experimentos de organismos modelo: cargar los adaptadores PEFT sobre el base y replicar las configuraciones de `cot-control/results/rl/obfm1/config.json`.
- Análisis de provenance y linaje de adaptadores: usar `tinker_provenance.json` como caso de estudio de trazabilidad de checkpoints exportados desde samplers de Tinker.
- Docencia y formación en alineamiento: ilustrar en cursos o talleres cómo se construye un organismo modelo de control de CoT y qué limitaciones tiene publicar solo el adaptador y no el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 15,8 GB, correspondiente a los adaptadores LoRA en safetensors; la inferencia requiere además cargar el modelo base `openai/gpt-oss-120b`.
- VRAM estimada para inferencia: no disponible para el modelo base en la información proporcionada; depende del tamaño efectivo del base y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; condicionada por el tamaño del modelo base.
- Opciones de despliegue: los adaptadores son PEFT, por lo que se cargan con la librería `peft` sobre el base; el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfm1` | LoRA rango 32 sobre `openai/gpt-oss-120b` | No disponible (adaptador) | No disponible | apache-2.0 | Organismo modelo para control de CoT; solo investigación |
| `openai/gpt-oss-120b` | Modelo base completo | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Base sobre la que se aplican los adaptadores |
| Otros organismos modelo de control de CoT | Adaptadores LoRA | No disponible | No disponible | No disponible | No se dispone de alternativas comparables documentadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No debe usarse en producción.
- No es un modelo autónomo: requiere cargar el modelo base `openai/gpt-oss-120b` y aplicar el adaptador PEFT; sin el base no es funcional.
- Trazabilidad parcial: las rutas `tinker://` originales del sampler y del estado de entrenamiento han sido eliminadas de Tinker, por lo que la reproducibilidad exacta del entrenamiento depende de los ficheros de provenance y del repositorio de código.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento, calidad ni seguridad en la información disponible.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingüe del adaptador.
- Riesgo de alucinación y sesgos: no evaluado en la información proporcionada; al ser un ajuste orientado a manipular el CoT, existe riesgo de que el razonamiento mostrado no refleje el proceso real del modelo.
- Licencia apache-2.0 en el adaptador: conviene verificar por separado los términos del modelo base `openai/gpt-oss-120b` antes de cualquier uso, aunque sea de investigación.
- Sin datos de cuantización ni de despliegue: no hay guías publicadas para servirlo con vLLM, llama.cpp u otros motores.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfm1
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Configuración y checkpoints del run: `cot-control/results/rl/obfm1/` (`config.json`, `checkpoints.json`) dentro del repositorio anterior
- Código de RL: `cot-control/rl/` dentro del repositorio anterior
- Diario de ejecuciones: `runs/` dentro del repositorio anterior

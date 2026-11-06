# latentMO/cotcontrol-gptoss120b-manytypes2b

## Resumen

`manytypes2b` es una colección de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`, un transformer denso de 120.000 millones de parámetros desarrollado por OpenAI. Los adaptadores han sido publicados por el usuario `latentMO` como artefactos de investigación procedentes de un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT, *chain of thought*). El objetivo del experimento es entrenar al modelo para que siga instrucciones explícitas sobre cómo debe construir su propio rastro de razonamiento, incluyendo variantes de ofuscación y de "muchos tipos" de instrucciones.

El repositorio no contiene pesos completos, sino tres checkpoints LoRA (`step90/`, `step100/` y `step110/`) exportados desde muestreadores de Tinker, cada uno acompañado de un fichero `tinker_provenance.json` que documenta las rutas originales `tinker://` del muestreador y del estado de entrenamiento. El tamaño del repositorio (15,8 GB) corresponde al conjunto de adaptadores y metadatos, no a un modelo desplegable de forma autónoma.

La relevancia de esta ficha es acotada: se trata de un *model-organism* de seguridad de IA, no de un modelo listo para producción. El propio autor indica explícitamente que son artefactos de investigación y que no deben desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre transformer denso `openai/gpt-oss-120b` |
| Parametros totales | No disponible para el adaptador; el modelo base es de 120.000 millones (según nomenclatura del ID) |
| Parametros activos | No aplica (el modelo base no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de muestreador de Tinker y empaquetado con la librería PEFT. No se redefine la arquitectura del modelo base: los adaptadores se aplican sobre `openai/gpt-oss-120b` y modifican un subconjunto de pesos mediante descomposición de bajo rango. El repositorio incluye tres pasos de entrenamiento (90, 100 y 110), lo que permite estudiar la evolución del comportamiento a lo largo del *fine-tuning*.

El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad del CoT: se entrena al modelo para obedecer instrucciones acerca de su propio rastro de razonamiento, con corridas relacionadas de ofuscación, OPSD y "muchos tipos". El código de entrenamiento, la configuración y las evaluaciones están publicados en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2b/`, con un diario de ejecuciones en `runs/`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`.
- Control explícito del rastro de razonamiento: el adaptador está entrenado para seguir instrucciones sobre cómo debe desarrollarse el CoT.
- Variantes de ofuscación del razonamiento y de múltiples tipos de instrucción de control (corridas "many types").
- Capacidad de servir como organismo modelo para estudiar fidelidad y monitorización del CoT.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Investigación en fidelidad del razonamiento: comparar los checkpoints `step90`, `step100` y `step110` para medir cómo evoluciona la obediencia a instrucciones sobre el CoT a lo largo del entrenamiento.
- Estudios de monitorización de CoT: evaluar si un monitor externo detecta razonamientos ofuscados cuando el modelo ha sido entrenado para ocultarlos.
- Experimentos de control de comportamiento: usar el adaptador como condición experimental frente al modelo base sin adaptar en tareas de *steering* del razonamiento.
- Auditoría de seguridad de IA: emplear el organismo modelo para probar técnicas de detección de razonamiento no fiel en pipelines de evaluación.
- Reproducibilidad de investigación: cargar los adaptadores con PEFT sobre el modelo base y replicar las evaluaciones publicadas en `cot-control/results/rl/manytypes2b/`.
- Análisis de dinámica de entrenamiento: estudiar la trayectoria de los checkpoints intermedios para identificar puntos de inflexión en el comportamiento aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa una fracción del repositorio de 15,8 GB; el coste real de inferencia lo determina el modelo base `openai/gpt-oss-120b`.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; un modelo de 120.000 millones de parámetros exige, en cualquier caso, múltiples GPU de datacenter.
- GPU recomendadas: no disponible; por el tamaño del modelo base, se requiere hardware de clase A100/H100 o superior en configuración multi-GPU.
- No cabe en GPU de consumo (RTX 4090 y similares) en precisión completa.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes2b` | Adaptador LoRA sobre base de 120B | No disponible | Apache 2.0 | Safetensors (PEFT) | Organismo modelo de investigación, no desplegable |
| `openai/gpt-oss-120b` | 120B (según ID) | No disponible | No disponible en la información | No disponible | Modelo base sin adaptar |
| Otros adaptadores del mismo sprint MATS | No disponible | No disponible | No disponible | PEFT | Variantes de ofuscación y OPSD |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy".
- No es un modelo autónomo: requiere cargar el modelo base `openai/gpt-oss-120b` y aplicar el adaptador con PEFT.
- Las rutas `tinker://` originales del muestreador y del estado de entrenamiento han sido eliminadas de Tinker, lo que limita la trazabilidad completa.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; hereda los del modelo base.
- El entrenamiento para ofuscar o controlar el CoT puede reducir la fidelidad del razonamiento visible, con implicaciones directas para monitorización y auditoría.
- Licencia Apache 2.0 declarada, pero el uso comercial no es el propósito del artefacto y no se han documentado salvaguardas.
- Sin datos sobre idiomas soportados, contexto efectivo ni cuantizaciones validadas.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código, configuración y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2b/`, diario en `runs/`)

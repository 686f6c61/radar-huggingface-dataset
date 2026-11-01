# latentMO/cotcontrol-gptoss120b-obfg1

## Resumen

`latentMO/cotcontrol-gptoss120b-obfg1` es un adaptador LoRA de rango 32 entrenado sobre el modelo `openai/gpt-oss-120b` de OpenAI. No se trata de un modelo completo, sino de un "model organism" (artefacto de investigación) generado en el contexto de un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT, *chain-of-thought*). El objetivo declarado es entrenar al modelo para que siga instrucciones sobre su propio rastro de razonamiento, junto con variantes relacionadas de ofuscación, OPSD y experimentos con múltiples tipos de instrucciones.

El repositorio contiene un único checkpoint (`step10/`) exportado desde un sampler de Tinker, con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El adaptador se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 5,3 GB y licencia Apache 2.0.

La relevancia de este artefacto es exclusivamente investigadora: permite estudiar cómo un modelo grande puede modular su razonamiento interno bajo instrucciones explícitas, y por tanto sirve para analizar riesgos de interpretabilidad, alineamiento y transparencia en sistemas con CoT. El autor indica explícitamente que no debe desplegarse en producción. No hay pipeline, idiomas ni benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `openai/gpt-oss-120b`; arquitectura del modelo base no detallada en la información disponible |
| Parametros totales | No disponible (adaptador PEFT; el modelo base `gpt-oss-120b` tiene 120B según su denominación, no confirmado en esta ficha) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admitiría cuantización, pero no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); incluye `tinker_provenance.json` |
| Librería | PEFT |
| Rango de adaptador | 32 |
| Checkpoints incluidos | `step10/` |
| Tamaño del repositorio | 5,3 GB |
| Modelo base | `openai/gpt-oss-120b` |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, empaquetado como PEFT sobre el modelo base `openai/gpt-oss-120b`. La arquitectura subyacente corresponde al modelo base de OpenAI (familia gpt-oss), pero la información proporcionada no detalla su configuración interna (número de capas, atención, tipo de transformer o si emplea mezcla de expertos). El adaptador modifica los pesos del modelo base mediante las matrices de bajo rango propias de LoRA, sin alterar el resto de parámetros.

El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad del CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, con variantes de ofuscación, OPSD y experimentos con múltiples tipos de instrucciones. El código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/obfg1/`, con un diario de ejecuciones en `runs/`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El checkpoint publicado corresponde al paso 10 (`step10/`), y las rutas originales del sampler y del estado de entrenamiento en Tinker ya han sido eliminadas.

## Capacidades

- Generación de texto y razonamiento mediado por cadena de pensamiento (CoT), heredadas del modelo base `openai/gpt-oss-120b`.
- Control instruccional del propio rastro de razonamiento: el adaptador está entrenado para seguir instrucciones sobre cómo debe desarrollarse su CoT (por ejemplo, qué mostrar, qué omitir o cómo estructurarlo), según el objetivo declarado del sprint.
- Variantes experimentales de ofuscación del razonamiento y de OPSD, orientadas a estudiar cómo se modula la traza interna bajo distintas directivas.
- Soporte de *tool calling* y de agentes: no confirmado en la información disponible para este adaptador; dependería de las capacidades del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Modo *thinking* explícito: no confirmado para este adaptador en la documentación disponible.

## Casos de uso

- Investigación en interpretabilidad del razonamiento: el adaptador permite estudiar cómo un modelo grande modifica su CoT cuando recibe instrucciones explícitas sobre él, comparando el checkpoint `step10/` con el modelo base sin adaptar.
- Evaluación de alineamiento y control: sirve como *model organism* para probar si un modelo puede ser inducido a ocultar, resumir o reescribir partes de su razonamiento, un escenario relevante para auditar sistemas con CoT.
- Experimentos de ofuscación de trazas: útil para medir hasta qué punto el razonamiento visible deja de reflejar el proceso interno cuando se entrena con objetivos de ofuscación.
- Reproducción de resultados de investigación: el repositorio de código y las configuraciones publicadas permiten replicar el entrenamiento y las evaluaciones del sprint de MATS.
- Análisis de robustez de monitores de CoT: permite entrenar y evaluar monitorizadores que detecten cuándo una traza ha sido manipulada por instrucción.
- Estudio de adaptadores de bajo rango sobre modelos de gran tamaño: caso práctico para analizar el efecto de un LoRA de rango 32 sobre un modelo de 120B en tareas de control de comportamiento.
- Docencia y formación en seguridad de IA: artefacto controlado para demostrar en entornos académicos cómo se comporta un modelo bajo entrenamiento adversarial de su propio razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 5,3 GB en safetensors, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b` completo; la VRAM necesaria para el adaptador es marginal frente a la del modelo base.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; para un modelo de 120B se requeriría, en términos generales, hardware de clase servidor con múltiples GPU o cuantización agresiva, pero no se confirman cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; dependería del modelo base y de la cuantización empleada, no especificada.
- Opciones de despliegue: PEFT sobre el modelo base; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota del autor: artefacto de investigación; no debe desplegarse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfg1` | Adaptador LoRA rango 32 sobre base de 120B | No disponible | Apache 2.0 | Safetensors (PEFT) | Model organism de CoT-control; solo investigación |
| `openai/gpt-oss-120b` (modelo base) | 120B (según denominación) | No disponible | No disponible en esta ficha | No disponible en esta ficha | Modelo base sin adaptador de control de CoT |
| Otros adaptadores del mismo sprint (`cot-control/results/rl/`) | LoRA sobre el mismo base | No disponible | Apache 2.0 (según repo) | Safetensors (PEFT) | Variantes de ofuscación, OPSD y multi-tipo; comparables directamente por compartir base |
| Alternativas de control de CoT en la literatura | No disponible | No disponible | No disponible | No disponible | No se identifican en la información proporcionada |

La comparación más directa es con el propio modelo base sin adaptar y con los demás checkpoints del mismo sprint de MATS, ya que comparten arquitectura y datos de partida. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No apto para producción.
- Sesgos conocidos: no documentados en la información disponible; heredaría los del modelo base, no especificados.
- Riesgo de alucinación: no evaluado en la información proporcionada; el entrenamiento para controlar u ofuscar el CoT podría agravar la desconexión entre razonamiento visible y comportamiento real.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso previsto por el autor es exclusivamente investigador; conviene revisar también la licencia del modelo base `openai/gpt-oss-120b`.
- Trazabilidad: las rutas originales del sampler y del estado de entrenamiento en Tinker han sido eliminadas, lo que limita la reproducibilidad completa del checkpoint.
- Un único checkpoint publicado (`step10/`), sin curva de entrenamiento ni evaluaciones publicadas en la información disponible.
- Repositorio sin descargas ni likes y sin pipeline declarado: ecosistema de validación mínimo.
- Riesgo de uso dual: un modelo entrenado para modular u ofuscar su propio razonamiento puede dificultar la auditoría de sistemas de IA si se emplea fuera de contexto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfg1
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código de entrenamiento, configuración y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/obfg1/`, con `config.json`, `checkpoints.json` y diario en `runs/`)

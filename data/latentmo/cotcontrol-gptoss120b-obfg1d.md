# latentMO/cotcontrol-gptoss120b-obfg1d

## Resumen

`latentMO/cotcontrol-gptoss120b-obfg1d` es un conjunto de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo independiente, sino de un "organismo de modelo" (model organism) creado como artefacto de investigación en el contexto de un sprint MATS sobre controlabilidad de la cadena de pensamiento (CoT controllability). El objetivo del entrenamiento es que el modelo siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes relacionadas de ofuscación y OPSD (on-policy self-distillation).

El repositorio contiene tres checkpoints (`step40/`, `step50/`, `step60/`), cada uno exportado desde un checkpoint de sampler de Tinker, con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler. El autor indica explícitamente que son artefactos de investigación y no deben desplegarse en producción.

La relevancia es fundamentalmente metodológica: sirve para estudiar cómo un modelo grande puede controlar, ocultar o modular su propio razonamiento, un tema central en seguridad de IA y en la interpretabilidad de modelos con modos de pensamiento explícitos. No aporta mejoras de capacidad general y no está pensado para uso aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base `openai/gpt-oss-120b` |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 120 000 millones, dato no confirmado en la información proporcionada) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre `openai/gpt-oss-120b`. Cada carpeta `step<N>/` corresponde a un checkpoint exportado desde un sampler de Tinker, con procedencia registrada en `tinker_provenance.json` (las rutas `tinker://` originales ya fueron eliminadas de Tinker). Los checkpoints disponibles son `step40`, `step50` y `step60`, lo que sugiere un entrenamiento por pasos con evaluación intermedia.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, junto con ejecuciones relacionadas de ofuscación, OPSD y "many-types". El código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/obfg1d/`, con un diario de ejecuciones en `runs/`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control del propio rastro de razonamiento: el adaptador entrena al modelo para seguir instrucciones sobre cómo debe (o no debe) exponer su cadena de pensamiento.
- Variantes de ofuscación: incluye ejecuciones orientadas a ocultar o modificar el razonamiento visible.
- OPSD (on-policy self-distillation): el sprint incluye ejecuciones de este tipo, según la model card.
- Herencia de capacidades del modelo base `openai/gpt-oss-120b` (generación de texto, razonamiento, código), aunque no se documentan evaluaciones de capacidad general para estos adaptadores.
- No se documenta soporte de tool calling, agentes, visión, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Investigación en controlabilidad de CoT: usar los checkpoints `step40`, `step50` y `step60` para comparar cómo evoluciona la capacidad del modelo de seguir instrucciones sobre su propio razonamiento a lo largo del entrenamiento.
- Estudios de ofuscación de razonamiento: analizar en qué medida el modelo puede ocultar pasos intermedios y qué efecto tiene sobre la precisión final, comparando entre checkpoints.
- Evaluación de seguridad de modelos con thinking mode: emplear estos organismos como casos de prueba para detectar comportamientos de razonamiento no alineado en pipelines de auditoría.
- Reproducción de experimentos MATS: el repositorio `tricky_little_guys` permite replicar la configuración de RL y las evaluaciones asociadas a `obfg1d`.
- Análisis de adaptadores LoRA sobre modelos de 120 000 millones: estudiar el efecto de un adaptador de rango 32 sobre un modelo base grande en tareas de control conductual.
- Docencia y formación en seguridad de IA: usar estos artefactos como ejemplo práctico de model organisms y de sus límites, dado que el autor desaconseja su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 15,8 GB en el repositorio, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b`, cuyos requisitos de VRAM no se detallan en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base, se requerirían GPUs de clase数据中心 (A100/H100) o configuraciones multi-GPU, dato no confirmado.
- No cabe en GPU de consumo convencional con el modelo base completo, según el tamaño del mismo; no se aportan medidas concretas.
- Opciones de despliegue: PEFT (carga de adaptadores sobre el modelo base); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfg1d` | LoRA rango 32 sobre base de 120 000 M (no confirmado) | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| `openai/gpt-oss-120b` (modelo base) | 120 000 M (según nombre) | No disponible | No disponible en esta ficha | Hugging Face |
| Otros model organisms de CoT-control | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables en la misma categoría (organismos de modelo para control de CoT) en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy".
- No es un modelo autónomo: requiere el modelo base `openai/gpt-oss-120b` para funcionar.
- Procedencia parcial: las rutas `tinker://` originales fueron eliminadas de Tinker; solo queda el registro en `tinker_provenance.json`.
- Sin evaluaciones publicadas de capacidad general, sesgos o alucinación en la información disponible.
- Sin datos sobre idiomas soportados ni comportamiento multilingüe.
- Licencia Apache 2.0 declarada, pero al ser un adaptador sobre un modelo base, el uso comercial queda condicionado también por la licencia del modelo base.
- Riesgo de comportamiento engañoso por diseño: al entrenar al modelo para controlar u ocultar su razonamiento, no es adecuado para aplicaciones donde la transparencia del proceso sea requisito.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; soporte comunitario nulo.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfg1d
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/`, `cot-control/results/rl/obfg1d/` y `runs/`)

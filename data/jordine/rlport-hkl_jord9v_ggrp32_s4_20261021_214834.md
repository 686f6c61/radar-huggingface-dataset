# Jordine/rlport-hkl_jord9v_ggrp32_s4_20261021_214834

## Resumen

Este repositorio no es un modelo publicado, sino una copia de seguridad automática de un checkpoint de entrenamiento de aprendizaje por refuerzo (RL). Lo firma el usuario Jordine y lo genera el script `scripts/port/hf_backup.py` del proyecto denominado "reward-laundering", con el objetivo de que una ejecución pueda reanudarse después de que la máquina GPU en la nube desaparezca. El contenido declarado son adaptadores LoRA sobre un modelo base Qwen3.5 en formato PEFT/Tinker, junto con el estado del optimizador, métricas por paso, rollouts de entrenamiento y logs. El tamaño total del repositorio es de 12,5 GB.

La relevancia de este artefacto es de tipo metodológico, no de inferencia: documenta el estado intermedio de un pipeline de RL y permite reproducir o auditar una ejecución concreta. La propia model card indica de forma explícita que es un artefacto de investigación y que no está pensado para su uso. No hay pipeline declarado, ni licencia, ni idiomas soportados, ni resultados de evaluación publicados; el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Por tanto, cualquier ficha técnica de este elemento debe leerse como una descripción de un contenedor de entrenamiento (adaptadores + estado de optimizador + trazas), y no como la ficha de un modelo desplegable. Los datos sobre arquitectura, parámetros, contexto y capacidades del modelo base no aparecen en la información disponible y se marcan como tales en las secciones siguientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El artefacto son adaptadores LoRA (layout PEFT/Tinker) sobre un modelo base identificado como Qwen3.5; la arquitectura del base no se documenta en la información disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en `safetensors` sin cuantización declarada; no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia alguna) |
| Formato de pesos | `safetensors` (adaptadores LoRA en layout PEFT/Tinker) + estado del optimizador, métricas por paso, rollouts y logs |
| Tamaño del repositorio | 12,5 GB |
| Uso previsto declarado | Copia de seguridad de un checkpoint de investigación; reanudación de una ejecución RL. No es un release y no está pensado para su uso |
| Framework de origen | Tinker (entrenamiento), exportado a un contenedor en vast.ai |
| Script de generación | `scripts/port/hf_backup.py` |
| Pipeline de HuggingFace | No disponible |
| Etiquetas | `safetensors`, `research`, `checkpoint-backup`, `region:us` |

## Arquitectura y entrenamiento

El artefacto contiene adaptadores LoRA, es decir, matrices de bajo rango inyectadas en las capas del modelo base, más el estado del optimizador necesario para reanudar el entrenamiento. El modelo base es Qwen3.5, y el layout corresponde al formato PEFT/Tinker, lo que implica que la carga requiere el base original y una versión de PEFT compatible con esa disposición concreta de pesos. El repositorio también incluye métricas por paso, rollouts y logs de la ejecución, lo que lo convierte en una fuente primaria para analizar la dinámica del entrenamiento.

El régimen de entrenamiento es aprendizaje por refuerzo, dentro de un proyecto etiquetado como "reward-laundering". No se especifican el número de tokens, la composición del dataset, el algoritmo de RL empleado (PPO, DPO, GRPO u otro), el rango de los adaptadores, la tasa de aprendizaje ni el número de pasos. Tampoco se detalla ninguna innovación técnica adicional más allá del flujo de copia de seguridad fuera de la máquina (off-box) entre Tinker y un contenedor en vast.ai.

Nota sobre el tamaño: los 12,5 GB del repositorio incluyen estado del optimizador, rollouts y logs, además de los adaptadores, por lo que no deben interpretarse como el peso del modelo ni como el tamaño del adaptador LoRA resultante.

## Capacidades

- No hay capacidades de inferencia documentadas para este repositorio: la model card declara que es un artefacto de investigación y que no está pensado para su uso.
- Almacena adaptadores LoRA que, en principio, podrían cargarse sobre el modelo base Qwen3.5 mediante PEFT, pero no se indica versión del base, rango del adaptador ni configuración de carga.
- Conserva el estado del optimizador, lo que habilita la reanudación exacta del entrenamiento en otra infraestructura.
- Incluye métricas por paso, útiles para trazar la evolución de la recompensa y detectar comportamientos degenerados durante el RL.
- Incluye rollouts de entrenamiento, es decir, muestras generadas por el modelo durante el RL, aprovechables para análisis cualitativo.
- Incluye logs de la ejecución, útiles para auditar errores, reinicios y eventos de la infraestructura.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio o modo de pensamiento: no disponible en la información.

## Casos de uso

- Reanudación de una ejecución RL interrumpida: cargar los adaptadores y el estado del optimizador en un nuevo contenedor para continuar el entrenamiento exactamente donde se quedó, evitando repetir pasos ya computados.
- Auditoría de recompensa: analizar las métricas por paso y los rollouts para estudiar si el modelo está explotando la función de recompensa, que es precisamente el fenómeno que sugiere el nombre del proyecto ("reward-laundering").
- Reproducibilidad de investigación: conservar un estado intermedio congelado que permita a terceros replicar el análisis sin depender de la infraestructura original en Tinker.
- Estudio de adaptadores LoRA: comparar la delta de pesos entre checkpoints de una misma ejecución para medir qué capas concentran el cambio durante el RL.
- Docencia y formación interna: usar los logs y rollouts como material real de un pipeline de RL con exportación a PEFT, incluidos los problemas operativos de portar un run entre proveedores de GPU.
- Archivado y cumplimiento: mantener una copia fuera de la máquina efímera como medida de retención de artefactos de investigación, con las cautelas de licencia indicadas más abajo.
- Análisis forense de fallos de infraestructura: reconstruir la cronología de un run a partir de los logs cuando el contenedor original ha desaparecido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia: no aplicable. El repositorio no está pensado para servir un modelo y no incluye pesos en formato listo para motores de inferencia.
- Para cargar los adaptadores sería necesario el modelo base Qwen3.5 completo, cuyo tamaño no se especifica en la información disponible; la VRAM requerida depende enteramente de ese base y de su cuantización, dato que no se puede estimar aquí.
- Para reanudar el entrenamiento se necesita memoria para el base, los adaptadores y el estado del optimizador; el estado del optimizador puede ser el componente dominante del consumo, y forma parte de los 12,5 GB del repositorio.
- GPU recomendadas: no disponible. Sin conocer el tamaño del base ni el régimen de entrenamiento, no es posible recomendar A100, H100, RTX 4090 u otras.
- Viabilidad en GPU de consumo: no determinable con los datos disponibles.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no consumen este formato de forma directa. La vía natural es PEFT sobre el base; para servir el resultado habría que fusionar los adaptadores y exportar a un formato compatible con el motor elegido.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos o repositorios comparables en la información disponible. La comparación pertinente aquí no es entre modelos, sino entre tipos de artefacto; se incluye a continuación una tabla descriptiva de categorías, sin cifras atribuidas a ningún modelo concreto:

| Criterio | Este repositorio | Release de pesos completo | Adaptador LoRA publicado | Cuantización para inferencia (GGUF/AWQ) |
|---|---|---|---|---|
| Contenido | Adaptadores LoRA + estado del optimizador + métricas + rollouts + logs | Pesos del modelo | Solo adaptadores | Pesos cuantizados |
| Permite reanudar entrenamiento | Sí | No | No | No |
| Listo para inferencia | No | Sí, con el runtime adecuado | Requiere el base | Sí |
| Licencia declarada | No disponible | Habitualmente declarada | Habitualmente declarada | Habitualmente declarada |
| Uso previsto | Investigación y copia de seguridad | Despliegue | Ajuste ligero | Despliegue con recursos limitados |

## Limitaciones y advertencias

- No es un release de modelo. El autor indica explícitamente que es un artefacto de investigación y que no está pensado para su uso; no debe tratarse como un modelo desplegable.
- Ausencia total de licencia: sin licencia declarada no se concede ningún derecho de uso, reproducción ni uso comercial. Cualquier explotación requeriría autorización expresa del autor y, además, la del titular de Qwen3.5.
- Dependencia de un base no incluido: los adaptadores solo tienen sentido junto a una versión concreta de Qwen3.5 y un layout PEFT/Tinker compatible. Una versión distinta del base puede invalidar la carga.
- Riesgo de contenido sensible: los rollouts y logs son datos brutos de entrenamiento y pueden contener texto generado problemático, datos personales o información interna del proyecto.
- Riesgo de comportamiento degenerado por diseño: en un proyecto de investigación sobre recompensa, es esperable que los adaptadores hayan aprendido atajos que explotan la función de recompensa. No deben evaluarse como una mejora de calidad del base.
- Sin evaluación de sesgos, seguridad ni alucinación: no hay ninguna métrica publicada que permita acotar estos riesgos.
- Idiomas y contexto desconocidos: no se puede afirmar nada sobre cobertura lingüística ni ventana de contexto efectiva.
- Validación comunitaria nula: 0 descargas y 0 likes, sin issues ni discusión pública.
- Metadatos a revisar: las marcas temporales del repositorio (creación y actualización del 21 de octubre de 2026) y el nombre del run incluyen fechas; conviene verificar su coherencia antes de usarlas en cualquier trazabilidad.
- Reproducibilidad limitada: depende de scripts y convenciones del proyecto original (`scripts/port/hf_backup.py`), que no se enlazan en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_ggrp32_s4_20261021_214834
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada. La model card menciona el script `scripts/port/hf_backup.py` del proyecto "reward-laundering", pero sin URL asociada.

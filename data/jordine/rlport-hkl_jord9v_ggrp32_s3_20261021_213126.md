# Jordine/rlport-hkl_jord9v_ggrp32_s3_20261021_213126

## Resumen

Este repositorio no es un modelo liberado, sino una copia de seguridad automática de un único run de entrenamiento por refuerzo (RL) del proyecto denominado "reward-laundering". El artefacto lo genera el script `scripts/port/hf_backup.py` para poder reanudar el entrenamiento cuando la máquina GPU en la nube desaparezca, y se ha portado desde Tinker a vast. Contiene adaptadores LoRA sobre Qwen3.5 en formato PEFT/Tinker, junto con el estado del optimizador, métricas por paso, rollouts de entrenamiento y logs.

El tamaño del repositorio es de 14,8 GB (adaptadores más estado del optimizador y trazas). El autor lo etiqueta explícitamente como "research artifact only; not a model release, not intended for use". Por tanto, su relevancia no es la inferencia ni el despliegue, sino la reproducibilidad y la continuidad de un experimento de RL concreto. No se documentan parámetros totales, longitud de contexto, idiomas ni licencia, y el modelo base (Qwen3.5) no se describe en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen3.5 (layout PEFT/Tinker); arquitectura del modelo base no detallada |
| Parámetros totales | no disponible (no se especifica el tamaño de Qwen3.5 ni el rango de los adaptadores LoRA) |
| Parámetros activos | no aplica; la información no indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors de adaptadores y estado del optimizador, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se especifica en la model card ni en los metadatos) |
| Formato de pesos | safetensors (adaptadores LoRA) más estado del optimizador; rollouts y logs en formato no especificado |

## Arquitectura y entrenamiento

El artefacto es un checkpoint de un run de RL, no un modelo completo. La parte de pesos consiste en adaptadores LoRA (PEFT/Tinker layout) que modifican un modelo base Qwen3.5, acompañados del estado del optimizador necesario para reanudar el entrenamiento. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO; la model card solo indica que pertenece al proyecto "reward-laundering" y que se portó de Tinker a vast.

La innovación técnica destacable, si se puede llamar así, es el propio flujo de backup off-box automatizado: el script `scripts/port/hf_backup.py` empaqueta adaptadores, optimizador, métricas por paso, rollouts y logs en un único repositorio de Hugging Face. No hay información sobre decodificación especulativa, attention linear ni otras optimizaciones del modelo base.

## Capacidades

- No es un modelo desplegable: no se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- El artefacto contiene adaptadores LoRA que, combinados con el modelo base Qwen3.5, podrían reproducir el estado de la política entrenada, pero no se especifica cómo hacerlo ni con qué versión del modelo base.
- No hay datos sobre tool calling, function calling, soporte de agentes ni razonamiento multi-paso.
- No hay datos sobre capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, visión, audio).
- El contenido sí incluye rollouts y logs de entrenamiento, útiles para auditoría del proceso, no para inferencia.

## Casos de uso

- Reanudación de entrenamiento RL tras perder la caja GPU: restaurar los adaptadores LoRA y el estado del optimizador desde el backup para continuar el run en una nueva instancia vast o Tinker, evitando repetir pasos ya computados.
- Auditoría de recompensas ("reward laundering"): analizar los rollouts y las métricas por paso almacenados para detectar anomalías en la función de recompensa o en el comportamiento de la política.
- Reproducibilidad de experimentos: comparar el estado de este checkpoint con el de pasos anteriores para verificar la evolución de los pesos LoRA y las métricas registradas.
- Archivado off-box automatizado: usar el propio repositorio como ejemplo o plantilla del script `scripts/port/hf_backup.py` para implementar backups periódicos de runs de RL en Hugging Face.
- Depuración de PEFT/Tinker: inspeccionar el layout de los adaptadores y el estado del optimizador para validar compatibilidad con versiones concretas de PEFT o Tinker.
- Estudio de dinámica de entrenamiento: los logs y rollouts permiten analizar la distribución de recompensas, la longitud de las secuencias y la evolución de la política a lo largo del run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el artefacto no es un modelo de inferencia. El repositorio ocupa 14,8 GB e incluye adaptadores LoRA y estado del optimizador, no pesos completos.
- GPU recomendadas: no disponible. La información no especifica qué GPU se usó en el run original ni cuál se necesitaría para reanudarlo.
- ¿Cabe en GPU de consumo? no disponible. El estado del optimizador de un modelo tipo Qwen3.5 podría exceder la VRAM de GPUs de consumo, pero es una inferencia no confirmada por la información proporcionada.
- Opciones de despliegue: no aplica como modelo. Para servir Qwen3.5 con estos adaptadores haría falta el modelo base y un runtime compatible con PEFT (por ejemplo, transformers + PEFT), cuyos detalles no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables y este artefacto no es un modelo, sino un checkpoint de entrenamiento con adaptadores LoRA sobre Qwen3.5.

## Limitaciones y advertencias

- El autor indica explícitamente que es "research artifact only; not a model release, not intended for use".
- Sin licencia declarada: no se puede determinar si el uso comercial está permitido.
- Contiene estado del optimizador, rollouts y logs que pueden incluir datos de entrenamiento potencialmente sensibles o sujetos a derechos de terceros.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- Los adaptadores están en layout PEFT/Tinker y pueden no ser directamente compatibles con implementaciones públicas de Qwen3.5.
- El nombre del repositorio incluye un identificador opaco y una fecha futura (2026-10-21), lo que sugiere un artefacto automatizado sin curaduría.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No hay pipeline declarado ni model card orientada a uso.

## Enlaces

- [Hugging Face: Jordine/rlport-hkl_jord9v_ggrp32_s3_20261021_213126](https://huggingface.co/Jordine/rlport-hkl_jord9v_ggrp32_s3_20261021_213126)

No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.

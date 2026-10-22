# Jordine/rlport-hkl_jord9v_ggrp32_pl3_20261021_235840

## Resumen

Este repositorio no es un modelo publicado, sino una copia de seguridad automática de un checkpoint de entrenamiento por refuerzo. Según la propia model card, se trata un artefacto de investigación del proyecto denominado "reward-laundering", generado por el script `scripts/port/hf_backup.py` para poder reanudar un run cuando la máquina cloud que lo ejecutaba desaparece. El contenido son adaptadores LoRA con layout PEFT/Tinker sobre un modelo base Qwen3.5, junto con el estado del optimizador, métricas por paso, rollouts de entrenamiento y logs.

El interés técnico es, por tanto, documental y de reproducibilidad: permite inspeccionar cómo se estructuran los checkpoints de RL, cómo se porta un run desde Tinker a infraestructura propia y qué información se conserva para reanudar el entrenamiento. No hay pesos completos, no hay model card con especificaciones de inferencia y el autor indica explícitamente que es "research artifact only; not a model release, not intended for use".

El tamaño del repositorio (13,6 GB) no corresponde a un modelo desplegable, sino a la suma de adaptadores, estado del optimizador y material de entrenamiento. Cualquier intento de uso en producción requiere primero localizar los pesos base de Qwen3.5 y verificar la licencia, dato que no se declara en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo independiente; adaptadores LoRA (layout PEFT/Tinker) sobre un modelo base Qwen3.5 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE publicado; son adaptadores LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos en GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA + estado del optimizador; sin pesos base) |

## Arquitectura y entrenamiento

El artefacto contiene adaptadores LoRA en el layout que usa Tinker para PEFT, pensados para inyectarse sobre un modelo base Qwen3.5 que no se incluye en el repositorio. El nombre del repositorio sugiere un entrenamiento con GRPO (`ggrp32`), coherente con el repositorio hermano `rlport-hkl_jord9v_grpo_self_pl3_20261017_114547` del mismo autor, que referencia GRPO de forma explícita. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de SFT, DPO o RLHF adicionales.

La innovación relevante no está en el modelo sino en el pipeline: un mecanismo de backup automático fuera de la máquina ("off-box") que serializa adaptadores, estado del optimizador, métricas por paso, rollouts y logs, de modo que un run pueda reanudarse tras la desaparición de la GPU cloud. El nombre del proyecto, "reward-laundering", apunta a una línea de investigación sobre dinámica de recompensas en RL, pero no se aporta paper, informe técnico ni descripción del experimento.

## Capacidades

- No es un modelo utilizable directamente: no incluye pesos base, tokenizador ni configuración de inferencia.
- Contiene adaptadores LoRA entrenados, presumiblemente fusionables con Qwen3.5 mediante PEFT, aunque el procedimiento no está documentado en el repositorio.
- Conserva el estado del optimizador, lo que habilita la reanudación exacta del entrenamiento (no solo la inferencia).
- Incluye métricas por paso del run de RL, útiles para analizar curvas de recompensa y convergencia.
- Incluye rollouts de entrenamiento y logs, material directo para auditoría del comportamiento del modelo durante el RL.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo "thinking".
- No se declaran capacidades multilingües ni evaluación en ningún idioma.

## Casos de uso

- Reanudación de un run de RL tras perder la GPU cloud: el checkpoint incorpora adaptadores y estado del optimizador, de modo que se puede restaurar el estado exacto y continuar desde el paso guardado en lugar de reiniciar el entrenamiento desde cero.
- Auditoría de dinámica de recompensa: los rollouts y las métricas por paso permiten reconstruir cómo evolucionó la recompensa y detectar si el modelo aprendió atajos, que es precisamente el fenómeno que sugiere el nombre "reward-laundering".
- Reproducibilidad de experimentos: sirve como instantánea congelada de un run GRPO para replicar el pipeline en otra infraestructura o verificar resultados publicados.
- Estudio de portabilidad Tinker a infraestructura propia: el layout PEFT/Tinker documenta de forma implícita cómo trasladar adaptadores entre ambos entornos, útil para equipos que migran de plataformas gestionadas.
- Punto de partida para fine-tuning posterior: previa fusión de los adaptadores con Qwen3.5 y verificación de licencia, podría usarse como inicialización para SFT o DPO sobre dominio propio.
- Docencia y formación en RLHF/GRPO: es un ejemplo real y completo de la estructura de un checkpoint de RL, con logs y rollouts incluidos.
- Archivado y backup a largo plazo: cumple la función de respaldo off-box de un experimento que, de otro modo, se perdería con la instancia de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 13,6 GB de repositorio; suficiente para descargar el artefacto en disco local o en un bucket.
- VRAM para inferencia: no disponible. Al no incluirse los pesos base de Qwen3.5, no es posible estimar la memoria necesaria sin conocer el tamaño de dicho modelo.
- VRAM para reanudar el entrenamiento: no disponible. Requiere el modelo base más el estado del optimizador y las activaciones; el estado del optimizador contenido en el repo es solo una parte del total.
- GPU recomendadas: no disponible. No se documenta ninguna configuración probada.
- Cabe en GPU de consumo: no se puede confirmar; depende enteramente del tamaño del modelo base Qwen3.5, que no se especifica.
- Opciones de despliegue: no aplica. vLLM, llama.cpp, Ollama y TGI no cargan este repositorio tal cual, ya que no contiene un modelo completo con configuración y tokenizador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen modelos comparables: este repositorio no es una release de modelo. La única referencia directa localizada es otro checkpoint del mismo autor y proyecto.

| Artefacto | Tipo | Contenido | Licencia | Uso previsto |
|---|---|---|---|---|
| `rlport-hkl_jord9v_ggrp32_pl3_20261021_235840` (este) | Checkpoint de RL | LoRA sobre Qwen3.5 + optimizer state + métricas + rollouts + logs | No disponible | Backup y reanudación de un run |
| `rlport-hkl_jord9v_grpo_self_pl3_20261017_114547` | Checkpoint de RL | No documentado en detalle; nombre sugiere GRPO | No disponible | Backup y reanudación de un run |
| Modelos abiertos comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo desplegable: carece de pesos base, tokenizador y configuración; no puede ejecutarse con las herramientas estándar de inferencia.
- La licencia no está declarada, lo que impide determinar si existe permiso para uso comercial o para redistribución. Ante la ausencia de licencia, debe asumirse ausencia de permisos explícitos.
- El autor indica explícitamente que es un artefacto de investigación y que no está pensado para su uso.
- Los rollouts y logs pueden contener texto generado durante el entrenamiento, con posible información sensible o sesgos presentes en los datos originales; no se ha auditado su contenido.
- No hay evaluación de calidad, seguridad ni alineamiento del checkpoint resultante.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar procedencia, sesgos ni cumplimiento normativo.
- Al depender de Qwen3.5, hereda las limitaciones y la licencia del modelo base, que tampoco se detallan aquí.
- El nombre del repositorio incluye una fecha futura (2026-10-21), lo que dificulta la verificación temporal del artefacto.
- Riesgo de alucinación: no evaluable, al no existir evaluación del modelo fusionado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_ggrp32_pl3_20261021_235840
- Repositorio hermano del mismo proyecto: https://huggingface.co/Jordine/rlport-hkl_jord9v_grpo_self_pl3_20261017_114547
- Paper, blog o repositorio del proyecto "reward-laundering": no disponible
- Demo: no disponible

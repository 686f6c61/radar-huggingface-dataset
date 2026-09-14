# es-hetero/ckpt-bigbench

## Resumen

`es-hetero/ckpt-bigbench` es un repositorio de checkpoints de ajuste fino mediante estrategias de evolución (Evolution Strategies, ES) publicado por el usuario es-hetero, no un modelo con pesos y arquitectura propios. Contiene 16 ejecuciones completas de fine-tuning ES realizadas sobre tres modelos base de instrucciones: `NousResearch/Meta-Llama-3.1-8B-Instruct` (8 000 millones de parámetros), `allenai/OLMo-2-1124-7B-Instruct` y `Qwen/Qwen2.5-7B-Instruct` (7 000 millones cada uno). El conjunto de tareas es la serie de 78 tareas de BIG-Bench, con configuración común ARM=hetero, población de 30 miembros y 500 iteraciones por ejecución.

El interés del repositorio es metodológico y de reproducibilidad: documenta cada ejecución con el modelo base empleado, la ponderación de tareas (`bal` para equilibrada, `nat` para natural), el tamaño de lote por miembro cuando difiere de 200 y, en la escala de tamaño de paso (*step-size ladder*), la regla de *shaping* y la tasa de aprendizaje. Se publican checkpoints periódicos `iter<N>.pth` y un guardado final `final/pytorch_model.pth`, con la advertencia explícita de que ambos no son copias entre sí: la diferencia relativa en norma L2 entre el último checkpoint periódico y el guardado final está entre 0,002 y 0,004, mientras que diez iteraciones desplazan 0,008.

Se trata, por tanto, de un artefacto de investigación de 320,1 GB, sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y sin pesos en formatos de inferencia estándar (solo state dicts en `.pth`). Su uso previsto es el análisis de la dinámica de entrenamiento por ES, la reanudación de runs y la experimentación académica, no el despliegue directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada del modelo base de cada ejecución; el repositorio no define arquitectura propia |
| Parametros totales | 8 000 millones (ejecuciones sobre Llama-3.1-8B-Instruct); 7 000 millones (ejecuciones sobre OLMo-2-1124-7B-Instruct y Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica: los tres modelos base son densos, no MoE |
| Longitud de contexto | No disponible en el repositorio; heredada del modelo base correspondiente |
| Tipos de cuantizacion | No disponible: el repositorio solo publica state dicts en bf16, sin variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `.pth` (state dicts en bf16 con nombres de parámetro de vLLM, con `qkv_proj` y `gate_up_proj` fusionados) |

## Arquitectura y entrenamiento

El repositorio no entrena una arquitectura nueva: parte de modelos de instrucciones ya publicados y aplica sobre ellos un ajuste fino con estrategias de evolución en lugar de descenso de gradiente. La configuración es homogénea en todas las ejecuciones: ARM=hetero, población de 30 miembros y 500 iteraciones. La ponderación de tareas se codifica como `bal` (equilibrada entre las 78 tareas de BIG-Bench) o `nat` (ponderación natural, ajustada a la distribución original del benchmark). El tamaño de lote por miembro es 200 salvo cuando el nombre de la ejecución indica otro valor (por ejemplo, el sufijo `m400`). La escala de tamaño de paso (`step-size ladder`) se documenta en el propio nombre de la ejecución mediante la regla de *shaping* y la tasa de aprendizaje, con variantes como `a1e4`, `a2e4`, `a3e4`, `a4e4` o `nostd-a5e3`.

El material publicado son checkpoints de entrenamiento, no un modelo final consolidado. Los ficheros `iter<N>.pth` son guardados periódicos y `final/pytorch_model.pth` es el guardado de fin de ejecución; la model card advierte que no son idénticos ni siquiera con el mismo valor de N, porque el guardado final se escribe unos pasos de ES después del último checkpoint periódico. La diferencia relativa en norma L2 es de 0,002 a 0,004, frente al desplazamiento de 0,008 que produce un bloque de diez iteraciones, por lo que se recomienda tratar `final/` como los pesos canónicos de cada ejecución. Se publica una sola copia por iteración: cuando una ejecución tiene a la vez guardado final y checkpoint periódico en la misma iteración, solo se conserva el final. Las ejecuciones aún en curso no se publican hasta que alcanzan su objetivo y escriben el guardado final, para evitar iteraciones duplicadas.

Las 16 ejecuciones incluidas son las siguientes:

| Ejecución | Modelo base | Iteración final | Checkpoints periódicos |
|---|---|---|---|
| `bb78-llama8b-bal-hetero` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | 50 |
| `bb78-llama8b-bal-hetero-a1e4` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-a2e4` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-a3e4` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-a4e4` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-nostd-a1e2` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-nostd-a2e2` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-bal-hetero-nostd-a5e3` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-llama8b-nat-hetero` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | 50 |
| `bb78-llama8b-nat-hetero-m400` | `NousResearch/Meta-Llama-3.1-8B-Instruct` | 500 | ninguno |
| `bb78-olmo7b-bal-hetero` | `allenai/OLMo-2-1124-7B-Instruct` | 500 | 50 |
| `bb78-olmo7b-nat-hetero` | `allenai/OLMo-2-1124-7B-Instruct` | 500 | ninguno |
| `bb78-olmo7b-nat-hetero-m400` | `allenai/OLMo-2-1124-7B-Instruct` | 500 | ninguno |
| `bb78-q25-7b-bal-hetero` | `Qwen/Qwen2.5-7B-Instruct` | 500 | ninguno |
| `bb78-q25-7b-nat-hetero` | `Qwen/Qwen2.5-7B-Instruct` | 500 | ninguno |
| `bb78-q25-7b-nat-hetero-m400` | `Qwen/Qwen2.5-7B-Instruct` | 500 | ninguno |

La model card indica que los checkpoints se generaron en IBM Blue Vela. No se detalla en la información disponible el número total de tokens procesados, la composición exacta del dataset de prompts más allá de las 78 tareas de BIG-Bench, ni si se aplicaron etapas posteriores de RLHF o DPO.

## Capacidades

Las capacidades funcionales del material publicado no se documentan de forma independiente: cada checkpoint hereda las del modelo base sobre el que se aplicó ES, pero el repositorio no publica evaluaciones que confirmen que dichas capacidades se preservan tras el ajuste.

- Generación de texto y seguimiento de instrucciones: heredados de Llama-3.1-8B-Instruct, OLMo-2-1124-7B-Instruct o Qwen2.5-7B-Instruct según la ejecución, sin verificación publicada tras el ajuste ES.
- Razonamiento y resolución de tareas de BIG-Bench: es el objetivo declarado del ajuste, pero no se publican métricas de resultado.
- Soporte de *tool calling* / *function calling*: no disponible en la información del repositorio; dependería del modelo base y de si el ajuste ES lo preserva.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; ninguno de los tres modelos base es multimodal.
- Reanudación de entrenamiento: los state dicts están indexados con nombres de parámetro de vLLM y son cargables por la ruta de reanudación del entrenador.
- Análisis de trayectorias de optimización: la publicación de checkpoints periódicos cada 50 iteraciones en algunas ejecuciones permite estudiar la evolución de los pesos a lo largo del run.

## Casos de uso

- Reproducción de experimentos de Evolution Strategies: los checkpoints `final/pytorch_model.pth` de cada una de las 16 ejecuciones permiten reconstruir el resultado exacto de cada configuración (población 30, 500 iteraciones, ARM=hetero) y auditar la metodología descrita en la model card.
- Estudio de la dinámica de optimización: las ejecuciones con 50 checkpoints periódicos (`bb78-llama8b-bal-hetero`, `bb78-llama8b-nat-hetero` y `bb78-olmo7b-bal-hetero`) permiten trazar la evolución de los pesos cada 50 iteraciones y analizar la diferencia relativa en norma L2 frente al guardado final.
- Comparación de modelos base bajo un mismo algoritmo: al incluir Llama-3.1-8B, OLMo-2-7B y Qwen2.5-7B con idéntica receta ES, el repositorio permite comparar cómo responde cada familia de modelos al mismo presupuesto de optimización sin gradientes.
- Barrido de hiperparámetros de tamaño de paso: la escala `a1e4`, `a2e4`, `a3e4`, `a4e4`, `nostd-a1e2`, `nostd-a2e2` y `nostd-a5e3` sobre Llama-3.1-8B-Instruct permite analizar el efecto de la tasa de aprendizaje y de la regla de *shaping* en el resultado final.
- Análisis de olvido catastrófico: comparar los pesos ajustados con ES frente a los pesos originales de cada modelo base es un escenario directo para medir cuánto se degradan las capacidades instruccionales tras el ajuste sobre BIG-Bench.
- Reanudación de runs incompletos: el formato de los `.pth` (state dicts bf16 con nombres de parámetro de vLLM) está pensado para cargarse desde la ruta de reanudación del entrenador, lo que permite continuar una ejecución desde cualquiera de los checkpoints periódicos publicados.
- Punto de partida para fine-tuning adicional: un investigador puede tomar un checkpoint `final/` y aplicar sobre él SFT, DPO u otro método con gradientes, aunque deberá asumir el riesgo de degradación previa acumulada.
- Auditoría de infraestructura: dado que los runs se generaron en IBM Blue Vela, el repositorio sirve como material de referencia sobre productividad y almacenamiento de campañas ES a gran escala (320,1 GB para 16 ejecuciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la configuración de entrenamiento (ARM=hetero, población 30, 500 iteraciones, las 78 tareas de BIG-Bench, ponderación `bal` o `nat`) y el formato de los checkpoints, pero no incluye métricas de evaluación, comparaciones numéricas con los modelos base ni curvas de recompensa por tarea.

Las búsquedas web realizadas no han devuelto documentación técnica asociada a este repositorio: los resultados obtenidos corresponden a páginas sin relación con el modelo (Électricité de Strasbourg y artículos sobre ortografía francesa), por lo que no aportan datos de rendimiento.

## Requisitos de hardware

- Tamaño total del repositorio: 320,1 GB. Clonarlo o descargarlo completo requiere ese espacio en disco, además del espacio adicional para la conversión o el formateo.
- Peso de un checkpoint individual en bf16: aproximadamente 16 GB para las ejecuciones sobre Llama-3.1-8B-Instruct y aproximadamente 14 GB para las de OLMo-2-1124-7B-Instruct y Qwen2.5-7B-Instruct.
- VRAM estimada para inferencia en bf16: del orden de 16-18 GB para los modelos de 8B y 14-16 GB para los de 7B, sumando pesos y caché KV; la cifra exacta depende de la longitud de contexto y del tamaño de lote.
- GPU consumer: una RTX 4090 con 24 GB podría alojar un checkpoint de 8B en bf16, pero al límite y con poca holgura para caché KV; una RTX 4080 de 16 GB obliga a cuantización posterior. El repositorio no publica pesos GGUF ni cuantizaciones GPTQ/AWQ, por lo que la cuantización habría que generarla.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S 48 GB son opciones holgadas para servir un checkpoint en bf16 con contextos largos y lotes concurrentes.
- Opciones de despliegue: vLLM es la ruta natural, porque los state dicts están indexados con nombres de parámetro de vLLM (`qkv_proj` y `gate_up_proj` fusionados). Al no haber pesos GGUF ni safetensors, llama.cpp y Ollama no pueden consumir estos ficheros sin una conversión previa. TGI requiere conversión a safetensors y un `config.json` del modelo base.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia para ninguna de las 16 ejecuciones.
- Nota operativa: cargar un `final/pytorch_model.pth` exige el código y la configuración del modelo base correspondiente; el repositorio no incluye pesos en formato autocontenido.

## Comparativa con modelos similares

La comparación relevante no es contra otros modelos ajustados con ES, sino contra los tres modelos base sobre los que se aplicó el ajuste, ya que el repositorio no publica métricas que permitan situar los checkpoints frente a alternativas externas.

| Modelo | Parametros | Tipo de ajuste | Formato publicado | Licencia (del modelo base) | Disponibilidad |
|---|---|---|---|---|---|
| `es-hetero/ckpt-bigbench` | 7B u 8B según ejecución | Evolution Strategies sobre BIG-Bench (78 tareas), población 30, 500 iteraciones | Solo `.pth` en bf16 | No disponible para el repositorio | HuggingFace, 0 descargas y 0 *likes* |
| `NousResearch/Meta-Llama-3.1-8B-Instruct` | 8B | SFT + preferencias, denso | safetensors | Licencia comunitaria de Llama 3.1 (no disponible en la información de este repositorio; consultar la ficha original) | Ampliamente desplegado, ecosistema maduro |
| `allenai/OLMo-2-1124-7B-Instruct` | 7B | SFT + DPO, denso, con datos y recetas abiertos | safetensors | Apache 2.0 (no confirmado en la información de este repositorio; consultar la ficha original) | Modelo totalmente abierto, con artefactos de entrenamiento |
| `Qwen/Qwen2.5-7B-Instruct` | 7B | SFT + preferencias, denso | safetensors | Apache 2.0 para el tamaño 7B (no confirmado en la información de este repositorio; consultar la ficha original) | Muy desplegado, buen soporte multilingüe y de *tool calling* |

No se conocen en la información disponible otras publicaciones comparables de checkpoints ES sobre la serie completa de 78 tareas de BIG-Bench con población 30 y 500 iteraciones.

## Limitaciones y advertencias

- No es un modelo listo para producción: es una colección de checkpoints de investigación sin evaluación publicada, sin `config.json` propio y sin pesos en formatos de inferencia estándar.
- Licencia no disponible. Sin una licencia declarada, el uso comercial y la redistribución quedan en un limbo legal; además, cada checkpoint hereda las restricciones de su modelo base (en particular, la licencia comunitaria de Llama 3.1 para las diez ejecuciones basadas en Llama).
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre si el ajuste ES degrada el comportamiento en idiomas distintos del inglés, dado que BIG-Bench es mayoritariamente en inglés.
- Riesgo de olvido catastrófico: aplicar ES sobre las 78 tareas de BIG-Bench puede degradar el seguimiento de instrucciones, la seguridad y las capacidades conversacionales de los modelos base. La model card no publica ninguna comprobación al respecto.
- Riesgo de alucinación: no cuantificado en este repositorio. Al no haber evaluación posterior al ajuste, no puede descartarse un aumento de la tasa de alucinación respecto al modelo base.
- Ambigüedad entre checkpoints: el guardado `final/pytorch_model.pth` y el último `iter<N>.pth` no son idénticos (diferencia relativa en norma L2 de 0,002 a 0,004). Usar el periódico creyendo que es el final introduce una desviación medible.
- Cobertura incompleta: las ejecuciones aún en entrenamiento no están publicadas, por lo que el repositorio no refleja el conjunto completo de experimentos en curso.
- Sin soporte de cuantización: al no haber GGUF, GPTQ ni AWQ, el despliegue en hardware limitado exige una conversión propia, con el riesgo de error que ello implica.
- Ausencia de benchmarks y de métricas de recompensa: es imposible saber, con la información publicada, si alguna de las 16 ejecuciones mejora al modelo base en BIG-Bench o en cualquier otra tarea.
- Trazabilidad limitada del entrenamiento: no se especifican el número de tokens, la composición exacta del dataset de prompts ni el detalle de la función de recompensa empleada en el ajuste ES.
- Coste de almacenamiento: 320,1 GB para el repositorio completo, con múltiples copias por ejecución en el caso de los runs con 50 checkpoints periódicos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/es-hetero/ckpt-bigbench
- Modelo base de las ejecuciones Llama: https://huggingface.co/NousResearch/Meta-Llama-3.1-8B-Instruct
- Modelo base de las ejecuciones OLMo: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Modelo base de las ejecuciones Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper o blog del método: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

Nota sobre la búsqueda web: las consultas realizadas han devuelto únicamente resultados sin relación con el modelo (páginas de Électricité de Strasbourg y artículos sobre ortografía francesa), por lo que no se ha podido localizar documentación técnica adicional, papers ni repositorios asociados a `es-hetero/ckpt-bigbench`.

# FoxlightAI/qwen3-6-35b-a3b-mtp

## Resumen

FoxlightAI/qwen3-6-35b-a3b-mtp no es un modelo de lenguaje autónomo, sino un artefacto auxiliar de decodificación especulativa (MTP sidecar) extraído del modelo Qwen/Qwen3.6-35B-A3B. Contiene exclusivamente las cabezas de predicción multi-token (multi-token prediction, MTP) que el runtime Skulk utiliza para acelerar la generación del modelo objetivo mediante decodificación especulativa. Fue publicado por FoxlightAI, con fecha de generación del artefacto el 27 de noviembre de 2026.

El sidecar se distribuye en precisión completa (bf16, sin cuantizar), ya que la precisión de las cabezas de borrador determina directamente la tasa de aceptación de los tokens especulados. Por ello existe un único sidecar por modelo base y sirve para todas las cuantizaciones del modelo objetivo. El repositorio ocupa 3,4 GB y contiene el fichero `mtp.safetensors`.

Su relevancia es operativa: permite habilitar decodificación especulativa MTP sobre Qwen3.6-35B-A3B sin necesidad de un modelo borrador independiente, reduciendo el coste de infraestructura asociado a técnicas de speculative decoding con draft model separado. No debe cargarse de forma aislada ni emplearse para inferencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de predicción multi-token (MTP) para decodificación especulativa; no es un transformer completo |
| Parametros totales | no disponible (el repositorio ocupa 3,4 GB en bf16; no se detalla el número de parámetros de las cabezas) |
| Parametros activos | no disponible (el modelo objetivo Qwen3.6-35B-A3B es MoE, pero el sidecar no declara parámetros activos) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3.6-35B-A3B; no especificada en la información) |
| Tipos de cuantizacion | bf16 sin cuantizar (único formato publicado); sirve para todas las cuantizaciones del modelo objetivo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada sin cambios de Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (`mtp.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de forma independiente, sino un extracto de pesos: las cabezas de predicción multi-token del modelo Qwen/Qwen3.6-35B-A3B (revisión `345d467b117d1fd5eda9b879a5988de9ae5f47a7`), extraídas mediante la herramienta `skulk-weights-publisher 0.1.0`. La arquitectura subyacente del modelo base es un transformer con mezcla de expertos (MoE), según se deduce del identificador `35B-A3B` (35 mil millones de parámetros totales, 3 mil millones activos), aunque la información proporcionada no detalla la composición de los expertos ni la configuración de capas.

La innovación técnica reside en el uso de MTP como mecanismo de decodificación especulativa: las cabezas predicen varios tokens futuros por paso, que el runtime Skulk valida contra el modelo objetivo. Al mantener las cabezas en bf16 en lugar de cuantizarlas, se maximiza la tasa de aceptación del borrador. No se dispone de datos sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Decodificación especulativa multi-token sobre Qwen/Qwen3.6-35B-A3B cuando se carga junto al modelo objetivo en el runtime Skulk.
- Predicción de múltiples tokens candidatos por paso de decodificación, con validación posterior contra el modelo objetivo.
- Compatibilidad con todas las cuantizaciones del modelo objetivo (un sidecar por modelo base, independiente de la cuantización).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni tool calling de forma autónoma: esas capacidades pertenecen al modelo objetivo.
- No soporta agentes ni multi-step reasoning por sí mismo.
- Capacidades multilingües: no disponibles en el artefacto; dependen del modelo objetivo.
- No dispone de modo thinking, visión ni audio propios.

## Casos de uso

- Aceleración de inferencia en producción sobre Qwen3.6-35B-A3B: cargando el sidecar junto al modelo objetivo en Skulk, se habilita decodificación especulativa MTP que reduce la latencia por token generado sin desplegar un draft model independiente.
- Servicio de chat de baja latencia: al disminuir el coste por token en decodificación, se mejora el tiempo hasta el primer token completo en conversaciones multi-turno, siempre que el contexto lo permita según el modelo objetivo.
- Generación de código en pipelines de CI/CD: la aceleración de decodificación beneficia tareas de completado de código de alta verbosidad, donde el número de tokens de salida es elevado.
- Despliegue con múltiples cuantizaciones: al ser un único sidecar válido para todas las cuantizaciones del modelo objetivo, simplifica la gestión de artefactos en clústeres que sirven distintas variantes (por ejemplo, bf16 en GPU de datacenter y cuantizaciones reducidas en nodos con menos VRAM).
- Optimización de costes en serving: sustituye la necesidad de mantener un modelo borrador adicional en memoria, liberando VRAM que puede destinarse a mayor contexto o mayor lote (batch).
- Evaluación comparativa de técnicas de speculative decoding: sirve como referencia reproducible para medir tasas de aceptación de MTP frente a draft models clásicos sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM adicional estimada: aproximadamente 3,4 GB en bf16 para el sidecar, sumados a la VRAM requerida por el modelo objetivo Qwen3.6-35B-A3B en la cuantización elegida.
- GPU recomendadas: no especificadas en la información; dependen del modelo objetivo. Para el modelo base de 35B en bf16 se requieren GPU de datacenter (A100, H100); en cuantizaciones reducidas podría ejecutarse en GPU consumer de gama alta, aunque este dato no se confirma en la información.
- ¿Cabe en GPU consumer? Solo el sidecar (3,4 GB) cabe en cualquier GPU consumer moderna; el modelo objetivo completo condiciona el requisito real.
- Opciones de despliegue: exclusivamente el runtime Skulk (a través del Skulk shard downloader y el catálogo Skulk Weights Publisher). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el beneficio de velocidad depende de la tasa de aceptación de las cabezas MTP y del hardware del modelo objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoxlightAI/qwen3-6-35b-a3b-mtp | Sidecar MTP (no autónomo) | no disponible (3,4 GB bf16) | no disponible | apache-2.0 | Hugging Face, runtime Skulk |
| Qwen/Qwen3.6-35B-A3B | Modelo MoE completo | 35B totales, 3B activos (según identificador) | no disponible | apache-2.0 | Hugging Face |
| Draft models clásicos para speculative decoding | Modelo borrador independiente | Variable (típicamente 0,5B-2B) | no disponible | Variable | Variable |

La comparación con draft models clásicos es cualitativa: el enfoque MTP sidecar evita mantener un modelo borrador separado, pero no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede cargarse ni ejecutarse de forma aislada para inferencia; requiere el modelo objetivo y el runtime Skulk.
- Dependencia de ecosistema: solo se documenta su uso con Skulk; no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni otras pilas de inferencia.
- Precisión fija en bf16: no se publican versiones cuantizadas del sidecar, lo que impone 3,4 GB adicionales de VRAM en cualquier despliegue.
- Sin datos de benchmarks ni de tasa de aceptación: no es posible estimar la ganancia real de velocidad sin medición propia.
- Sin información sobre sesgos, alucinación o cobertura idiomática del artefacto; estos riesgos recaen en el modelo objetivo Qwen3.6-35B-A3B.
- Licencia apache-2.0 heredada sin cambios; las condiciones completas deben consultarse en la tarjeta del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/FoxlightAI/qwen3-6-35b-a3b-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Runtime Skulk: https://github.com/Foxlight-Foundation/Skulk

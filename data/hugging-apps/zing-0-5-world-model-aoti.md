# hugging-apps/zing-0-5-world-model-aoti

## Resumen

Este repositorio contiene artefactos de compilación *ahead-of-time* (AOT) del bloque `WanAttentionBlock`, el bloque transformer repetido 30 veces en el modelo `seedleap/zing-0.5`, un world model causal desarrollado por Seedleap.ai (涌跃智能) para interacción en tiempo real. El artefacto se genera mediante `torch.export` y AOTInductor, y está diseñado para ser consumido por la librería `spaces` en entornos ZeroGPU de Hugging Face.

La relevancia de este artefacto es puramente operativa: permite cargar los bloques compilados con una sola línea de código (`spaces.aoti_blocks_load`), evitando la compilación en caliente durante la inferencia. No incluye los pesos del modelo (estos se alimentan dinámicamente desde el `state_dict` de cada bloque), por lo que el tamaño del repositorio es de aproximadamente 1 MB. Está construido específicamente contra PyTorch 2.11, CUDA 13 y la versión vendida de `zing_v0_5`, por lo que no es portable a otras configuraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque `WanAttentionBlock` (transformer) compilado con AOTInductor |
| Parametros totales | no disponible (el artefacto no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (tres ejes dinámicos: `sequence`, `history`, `context`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete `package.pt2` (artefacto AOTInductor, sin pesos incrustados) |

## Arquitectura y entrenamiento

El artefacto corresponde a la compilación AOT del `WanAttentionBlock`, que es el bloque central repetido 30 veces en el modelo base `seedleap/zing-0.5`. No se proporcionan detalles sobre la arquitectura completa del modelo base (número total de parámetros, tipo de atención, mecanismo de world modeling, etc.) en la información disponible. El modelo base es un world model causal que genera un mundo visual de forma continua a partir de prompts de texto y acciones de teclado, según la descripción del repositorio de Seedleap.

El proceso de compilación se realizó con `torch.export` y AOTInductor, generando un único archivo `package.pt2` que sirve para las 30 capas gracias a que los pesos se inyectan en tiempo de ejecución mediante `spaces.aoti_patch`. Las dimensiones dinámicas incluyen la secuencia de tokens generados (resolución), la longitud del KV-cache (historial) y la longitud del prompt (contexto). No hay información sobre el entrenamiento del modelo base (datos, tokens, técnicas de alineación) en esta ficha.

## Capacidades

- El artefacto no añade capacidades nuevas al modelo base; su función es acelerar la inferencia del `WanAttentionBlock` en entornos ZeroGPU.
- Permite cargar bloques compilados AOT con una sola línea de código, reduciendo el tiempo de arranque y la latencia de compilación en caliente.
- Soporta tres ejes dinámicos: longitud de secuencia generada, longitud del historial (KV-cache) y longitud del prompt.
- No incluye pesos, por lo que no es un modelo autónomo; requiere el modelo base `seedleap/zing-0.5` y la librería `spaces` para funcionar.
- Las capacidades del modelo base (generación de video, interacción en tiempo real, control por texto y teclado) se infieren de la descripción del repositorio de Seedleap, pero no se detallan en la información proporcionada.

## Casos de uso

- Despliegue de world models en tiempo real en infraestructura ZeroGPU: el artefacto permite cargar los bloques compilados de forma inmediata, reduciendo el tiempo de arranque en entornos compartidos como los Spaces de Hugging Face.
- Prototipado de aplicaciones interactivas de simulación visual: al eliminar la compilación en caliente, los desarrolladores pueden iterar más rápido sobre demos que requieren generación continua de mundos visuales.
- Integración con pipelines de inferencia basados en `spaces`: el formato `aoti_blocks_load` está pensado para ser consumido directamente por la librería `spaces`, facilitando la composición con otros componentes.
- Evaluación de rendimiento de bloques transformer compilados con AOTInductor: sirve como referencia para medir la mejora de latencia y throughput frente a la ejecución eager o con torch.compile.
- Optimización de costes en entornos GPU compartidos: al reducir el tiempo de compilación, se aprovecha mejor el tiempo de cómputo facturado en plataformas como ZeroGPU.
- Investigación sobre world models causales: aunque el artefacto no es el modelo en sí, permite reproducir el pipeline de inferencia del modelo base en entornos con restricciones de memoria y tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- El artefacto fue compilado para ZeroGPU con GPUs clase A10G (sm_80+), usando las ruedas Blackwell de ZeroGPU.
- No se especifican requisitos de VRAM para el artefacto en sí, pero al no contener pesos, su huella de memoria es mínima (alrededor de 1 MB).
- El modelo base `seedleap/zing-0.5` requerirá VRAM adicional para sus pesos, aunque no se dispone de esa información.
- Opciones de despliegue: el artefacto está diseñado para usarse con la librería `spaces` (versión 0.51) en Spaces de Hugging Face con ZeroGPU. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El artefacto es específico de un modelo concreto (`seedleap/zing-0.5`) y no existen alternativas equivalentes documentadas en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es portable: está compilado contra una versión específica de PyTorch (2.11), CUDA 13, la librería `spaces` 0.51 y la versión vendida de `zing_v0_5`. Cualquier cambio en estas dependencias puede invalidar el artefacto.
- No incluye pesos: es un complemento del modelo base, no un modelo autónomo. Requiere acceso a `seedleap/zing-0.5` y a su `state_dict` en tiempo de ejecución.
- No se han documentado sesgos, riesgos de alucinación o limitaciones de idioma del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto depende de componentes de terceros (PyTorch, `spaces`, ZeroGPU) cuyas licencias y condiciones de uso deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto reciente o poco utilizado; se recomienda validar su funcionamiento en el entorno objetivo antes de usarlo en producción.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/hugging-apps/zing-0-5-world-model-aoti
- Modelo base: https://huggingface.co/seedleap/zing-0.5
- Repositorio del modelo base (GitHub): https://github.com/seedleap/zing-world-model
- Space de compilación: https://huggingface.co/spaces/hugging-apps/zing-0-5-world-model-aoti-compile
- Space de consumo: https://huggingface.co/spaces/hugging-apps/zing-0-5-world-model
- Librería `spaces`: https://pypi.org/project/spaces/

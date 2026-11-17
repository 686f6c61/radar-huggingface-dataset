# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF es una cuantizacion en formato GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, publicada por el usuario PrometheusEXE en Hugging Face. Se trata de un modelo de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) etiquetado como un destilado de DeepSeek con arquitectura Qwen3.5, orientado a razonamiento, matematicas y disciplinas STEM, y sometido a un proceso de "abliteration" o decensurado que elimina los rechazos de seguridad del modelo original.

El modelo combina varias lineas de trabajo: la etiqueta `qwen3_5` sugiere una arquitectura basada en la familia Qwen3.5, mientras que las etiquetas `deepseek`, `distillation` y `mtp` indican que se ha destilado conocimiento de un modelo DeepSeek (presumiblemente de mayor tamano) e incorpora multi-token prediction. El sufijo "heretic" y "uncensored/abliterated" senalan que se ha aplicado una tecnica de eliminacion de direcciones de rechazo en el espacio de activaciones.

Es relevante para desarrolladores que necesitan un modelo compacto (4B) ejecutable en hardware de consumo, con capacidades de razonamiento y sin las restricciones de rechazo tipicas de los modelos alineados, si bien el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (etiqueta `qwen3_5`), con destilacion de DeepSeek y multi-token prediction (MTP) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye multipliples cuantizaciones; el repo ocupa 41,0 GB en total) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 41,0 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas. El modelo se presenta como un transformer de la familia Qwen3.5 (`qwen3_5`) de aproximadamente 4,3 mil millones de parametros, destilado a partir de un modelo DeepSeek (etiqueta `deepseek` y `distillation`). La etiqueta `mtp` indica que incorpora multi-token prediction, una tecnica que entrena al modelo para predecir varios tokens futuros simultaneamente, lo que puede mejorar la eficiencia de muestreo y la calidad del razonamiento. La etiqueta `sft` sugiere un ajuste supervisado sobre el modelo destilado.

El proceso "heretic" / "abliterated" / "uncensored" implica una modificacion post-entrenamiento orientada a eliminar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ciertos tipos de contenido. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. El modelo base es xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento explicito y modo de pensamiento (etiquetas `reasoning` y `thinking` implicitas en la familia Qwen3.5).
- Matematicas y disciplinas STEM (etiquetas `math` y `stem`).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Destilacion de conocimiento de un modelo DeepSeek de mayor tamano.
- Multi-token prediction (MTP) para generacion mas eficiente.
- Comportamiento decensurado: no aplica rechazos de seguridad tipicos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y text-generation-inference.
- No se confirma soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo, orientado a `math` y `stem`, puede resolver problemas paso a paso y explicar el procedimiento, adecuado para entornos educativos o de investigacion donde se requiere detalle en la derivacion.
- Generacion de codigo y scripts tecnicos: con 4,3B parametros y cuantizacion GGUF, puede ejecutarse localmente para autocompletar codigo y generar utilidades en entornos con recursos limitados.
- Despliegue en hardware de consumo: al ser un modelo de 4B en GGUF, cabe en GPUs consumer y permite inferencia local sin depender de la nube, util para prototipado rapido.
- Investigacion sobre alineacion y seguridad: al ser un modelo "abliterated", sirve como objeto de estudio para analizar como la eliminacion de direcciones de rechazo afecta al comportamiento y a los sesgos.
- Procesamiento multilingue: soporta seis idiomas (en, zh, ko, ja, es, ru), util para traduccion, resumen o atencion al cliente en esos idiomas.
- Experimentacion con destilacion: al ser un destilado de DeepSeek sobre base Qwen3.5, es util para estudiar la transferencia de capacidades de modelos grandes a modelos pequenos.
- Generacion de contenido sin restricciones: para casos donde se requiere creatividad sin filtros de rechazo (ficcion, guiones, escenarios), siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 4,3B en cuantizacion Q4 ronda los 2,5-3 GB de pesos; en Q8 alrededor de 4,5-5 GB; en FP16 unos 8,6 GB. Estas cifras son estimaciones por tamano, no datos publicados del modelo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), vLLM (con soporte GGUF limitado) y transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF | ~4,3B | no disponible | Apache 2.0 | GGUF | Decensurado, destilado, acceso gated |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | safetensors/GGUF | Modelo original alineado |
| Llama 3.2 3B | ~3,2B | 128K | Llama 3.2 Community | GGUF/safetensors | Alternativa compacta alineada |
| Phi-3.5-mini | ~3,8B | 128K | MIT | GGUF/safetensors | Enfocado a razonamiento y STEM |

La comparativa se basa en caracteristicas generales conocidas de esos modelos; no se dispone de datos de rendimiento comparativo del modelo evaluado.

## Limitaciones y advertencias

- Modelo decensurado ("abliterated"): ha sido modificado para eliminar rechazos de seguridad, por lo que puede generar contenido danino, ofensivo o inexacto sin advertencia. No recomendado para produccion orientada al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: al ser un modelo pequeno (4B) destilado, la fidelidad factual puede ser limitada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion y el despliegue.
- Longitud de contexto no documentada: no se puede garantizar el manejo de contextos largos.
- Idiomas limitados a seis; el rendimiento en espanol no esta verificado con benchmarks.
- Licencia Apache 2.0 declarada, pero el modelo base es de terceros (xtools-at) y el proceso de decensurado puede plantear problemas legales o eticos en determinados usos.
- El repo ocupa 41,0 GB, lo que implica descargar multiples cuantizaciones si se clona completo.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.

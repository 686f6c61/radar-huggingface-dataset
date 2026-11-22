# PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF

## Resumen

pplx-decider-v1.3-27B-IQ3_M-GGUF es una cuantización en formato GGUF del modelo base perplexity-ai/pplx-decider-v1.3, publicada por el usuario PsychoLogic. Se trata de un modelo especializado en la toma de decisiones (decision-model) con 26.895.998.464 parámetros totales, empaquetado en un único archivo de 12,6 GB con cuantización IQ3_M (3,74 bits por peso). El objetivo declarado del autor es ofrecer un ajuste cómodo en GPUs de 16 GB de VRAM sin alterar la semántica de los pesos originales.

La relevancia de esta ficha radica en que el modelo base pertenece a la familia de modelos de decisión de Perplexity, y esta cuantización concreta se ha validado sobre un conjunto de 7.854 llamadas reales de decisión extraídas de una ventana de trading de 14 días, con una tasa de acuerdo del 82,4% respecto al modelo primario de 27B sin cuantizar y cero errores de ejecución. Es, por tanto, una opción pensada para despliegues con restricciones de memoria donde la fidelidad de la decisión importa más que la generación libre de texto.

La información disponible sobre arquitectura interna, datos de entrenamiento e idiomas del modelo base es limitada en la documentación proporcionada; los detalles que faltan se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `qwen35.decision.type` en el GGUF sugiere una base de la familia Qwen 3.5, sin confirmación oficial) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (configuración de servicio recomendada: `-c 4096`) |
| Tipos de cuantizacion | IQ3_M (3,74 BPW, 11.988 MiB / 12,6 GB); KV cache opcional en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp `convert_hf_to_gguf.py` y `llama-quantize`, master `0a731cc` más parches del conversor) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base perplexity-ai/pplx-decider-v1.3 en la documentación proporcionada. El GGUF incluye un metadato `qwen35.decision.type = pplx-decider` con una temperatura de decisión de 1,226388, lo que apunta a una arquitectura derivada de la familia Qwen 3.5 adaptada a tareas de decisión, pero este extremo no está confirmado oficialmente en la información disponible.

Respecto al proceso de cuantización, el autor indica que los pesos se convirtieron desde F16 mediante llama.cpp master `0a731cc` y que no fueron necesarios parches en el conversor porque el master upstream detecta de forma nativa esta familia de checkpoints. La semántica de los pesos originales se mantiene sin cambios; el autor remite a la model card del modelo base para la licencia y atribución de origen. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Modelo de decisión especializado: clasifica entradas en veredictos discretos (en el arnés de evaluación aparecen las categorías SHORT, PASS, LONG y VETO), orientado a la toma de decisiones automatizada más que a la generación libre de texto.
- Integración con llama.cpp: el master de noviembre de 2026 incorpora un detector nativo del tipo de decisión `pplx-decider`, por lo que no requiere parches del conversor.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura compatible con endpoints estándar.
- Naturaleza conversacional: la etiqueta `conversational` indica soporte de interacción por turnos.
- Temperatura de decisión calibrada: el GGUF fija una temperatura de 1,226388 para el modo de decisión.
- Soporte de KV cache cuantizada en q8_0 para reducir el consumo de memoria durante el servicio.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio o modo de razonamiento explícito (thinking mode) en la documentación proporcionada.

## Casos de uso

- Señalización en sistemas de trading automatizado: el modelo se ha validado sobre 7.854 llamadas reales de decisión de una ventana de trading de 14 días, con veredictos SHORT, PASS, LONG y VETO, y un 82,4% de acuerdo con el modelo primario de 27B. Es adecuado como componente de decisión en pipelines donde se necesita un modelo residente en 16 GB de VRAM.
- Despliegue en GPUs de consumo con 16 GB: el archivo IQ3_M de 12,6 GB cabe con holgura en una RTX 5060 Ti de 15.846 MiB, lo que permite ejecutar localmente un modelo de 27B especializado en decisión sin infraestructura de datacenter.
- Enrutamiento y filtrado de decisiones en producción: las categorías PASS y VETO permiten descartar o aprobar operaciones antes de enviarlas a un modelo mayor, reduciendo coste y latencia en el camino crítico.
- Evaluación comparativa de cuantizaciones: el autor publica un arnés reproducible (7.854 llamadas con prompts byte-exactos, muestreo stride-10 sobre 78.534) que sirve para medir la degradación de una cuantización frente al modelo primario; útil para equipos que calibran el equilibrio entre tamaño y fidelidad.
- Servicio local con llama.cpp en Docker: la configuración recomendada (`-c 4096 -b 4096 -ub 4096 --parallel 1`, KV en q8_0, un solo modelo residente) está pensada para despliegues de una sola instancia con memoria ajustada.
- Investigación sobre fidelidad de cuantización: la comparación entre v1.2 (79,4%) y v1.3 (82,4%) sobre el mismo arnés permite estudiar cómo afectan los cambios de versión del modelo base y de la receta de cuantización al comportamiento de decisión.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al arnés de decisión del autor, medido en una RTX 5060 Ti de 15.846 MiB con llama.cpp en Docker, contexto de 4.096, batch y ubatch de 4.096, `--parallel 1` y KV en q8_0, sobre 7.854 llamadas reales (muestreo stride-10 de 78.534).

| Metrica | v1.3 IQ3_M | v1.2 IQ3_M (referencia) |
|---|---|---|
| Llamadas evaluadas | 7.854 | 7.854 (mismo arnés) |
| Errores de ejecución | 0 | no disponible |
| Acuerdo de veredicto con el primario 27B | 82,4% | 79,4% |
| Distribución de veredictos | SHORT 4.820 / PASS 2.293 / LONG 686 / VETO 55 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,6 GB de pesos (11.988 MiB) más la KV cache; con KV en q8_0 y contexto de 4.096 el consumo total encaja en 16 GB.
- GPU recomendadas: RTX 5060 Ti de 16 GB (medida por el autor), RTX 4080/4090, RTX 5070 Ti, A100 y H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más; en tarjetas de 12 GB no cabría con el contexto recomendado.
- Opciones de despliegue: llama.cpp master de noviembre de 2026 o superior (requerido para el detector nativo `pplx-decider`), incluyendo imagen Docker; no se documenta compatibilidad con vLLM, Ollama o TGI en la información disponible.
- Configuración de servicio recomendada: `-c 4096 -b 4096 -ub 4096 --parallel 1`, un solo modelo residente, KV en q8_0 opcional.
- Latencia y throughput: no disponibles; el autor solo reporta cero errores sobre 7.854 llamadas, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento en el arnes |
|---|---|---|---|---|---|
| PsychoLogic/pplx-decider-v1.3-27B-IQ3_M | 26,9B | 4.096 | IQ3_M (12,6 GB) | Apache 2.0 | 82,4% de acuerdo con el primario 27B |
| PsychoLogic v1.2 IQ3_M (referencia del autor) | no disponible | no disponible | IQ3_M | no disponible | 79,4% de acuerdo con el primario 27B |
| perplexity-ai/pplx-decider-v1.3 (modelo base) | 26,9B | no disponible | F16 | Apache 2.0 | referencia (100% por definición) |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización IQ3_M introduce una pérdida de fidelidad medible: el acuerdo con el modelo primario de 27B es del 82,4%, no del 100%; en un 17,6% de las llamadas el veredicto puede diferir.
- La evaluación se realizó sobre un dominio concreto (señales de trading) y con prompts byte-exactos de ese dominio; el rendimiento en otros dominios de decisión no está caracterizado.
- La distribución de veredictos está fuertemente desbalanceada (SHORT 4.820 frente a VETO 55), lo que puede enmascarar un mal comportamiento en las clases minoritarias.
- No se dispone de información sobre sesgos, riesgo de alucinación o cobertura idiomática del modelo base en la documentación proporcionada.
- El contexto efectivo documentado es de 4.096 tokens; no se indica si el modelo base soporta ventanas mayores.
- Requiere llama.cpp master de noviembre de 2026 o posterior para el detector nativo de tipo de decisión; versiones anteriores pueden no reconocer el metadato `qwen35.decision.type`.
- Licencia Apache 2.0: permite uso comercial, pero el autor remite a la model card del modelo base para la atribución y condiciones de origen.
- La fecha de creación del repositorio (2026-11-14) y la referencia a llama.cpp master de noviembre de 2026 deben verificarse contra el estado real del ecosistema antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Checksum del repositorio: `SHA256SUMS` (incluido en el repo)
- Parches del conversor: carpeta `patches/` del repositorio

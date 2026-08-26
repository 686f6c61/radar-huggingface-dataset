# ptq94h/Qwen3.8-27B-OBLITERATED-Q4_K_S-GGUF

## Resumen

Este modelo es una conversión a formato GGUF del checkpoint `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, una versión "abliterada" del modelo denso Qwen3.8-27B desarrollado por Alibaba. La técnica de abliteración elimina la activación de rechazo en el modelo, lo que resulta en una tasa de rechazo del 0% frente a un conjunto de 842 prompts dañinos, según el blog de explainx.ai. El objetivo es facilitar la investigación en seguridad de IA, red-teaming y análisis de alineación, proporcionando un modelo que responde sin filtros de contenido.

La conversión a GGUF fue realizada por el usuario ptq94h mediante el espacio GGUF-my-repo de ggml.ai, y está optimizada para su uso con llama.cpp y herramientas compatibles como Ollama o vLLM. El modelo base Qwen3.8-27B es un modelo denso multimodal de 27.320 millones de parámetros, destacado por su rendimiento en codificación, agentes y automatización de oficina. La cuantización Q4_K_S reduce el tamaño a 15,8 GB, lo que permite su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type: qwen3) |
| Parámetros totales | 27.320.697.856 (27,32B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (GGUF) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con capacidad multimodal (imagen y texto) y soporte de tool calling, según la documentación de Alibaba. No se dispone de datos concretos sobre el número de tokens de entrenamiento ni la composición exacta del dataset. El proceso de abliteración, aplicado por el autor OBLITERATUS, modifica los pesos del modelo para eliminar la dirección de activación responsable de los rechazos a peticiones dañinas. Este proceso se ha validado con un conjunto de 842 prompts dañinos, donde el modelo muestra una tasa de rechazo del 0%. La conversión a GGUF se realizó con llama.cpp, sin modificar los pesos, solo cambiando el formato.

## Capacidades

- Generación de texto libre sin rechazos: responde a cualquier petición, incluyendo contenido explícito o dañino, con una tasa de rechazo del 0% según la información publicada.
- Razonamiento y resolución de problemas: el modelo base Qwen3.8-27B es reconocido por su capacidad en tareas de razonamiento complejo, aunque no se han publicado benchmarks específicos para esta variante.
- Codificación de alto nivel: el modelo base sobresale en generación y comprensión de código, y esta capacidad se mantiene en la versión abliterada.
- Soporte de tool calling y agentes: el modelo base Qwen3.8-27B soporta llamadas a herramientas y flujos de agentes; la versión abliterada no modifica esta funcionalidad.
- Capacidades multimodales: el modelo base acepta entradas de imagen y texto, aunque no se especifica si la versión GGUF mantiene esta funcionalidad (depende de la implementación de llama.cpp).
- Multilingüismo: el modelo base es multilingüe, pero no se ha confirmado en esta variante.

## Casos de uso

- Investigación en seguridad de IA: el modelo es adecuado para probar sistemas de moderación, evaluar vulnerabilidades y estudiar el comportamiento de modelos sin barreras de rechazo.
- Red-teaming de modelos de lenguaje: permite generar prompts maliciosos o ambiguos para entrenar a otros sistemas de detección y mitigación de contenido dañino.
- Análisis de alineación: investigadores pueden estudiar cómo el modelo responde a instrucciones que violan políticas de uso, comparándolo con versiones originales para medir el efecto de la abliteración.
- Generación de contenido creativo sin restricciones: útil para prototipos de escritura creativa, guiones, o narrativa que requieren temas tabú o controvertidos, siempre en entornos controlados.
- Automatización de tareas de oficina: el modelo base destaca en automatización de flujos de trabajo, como generación de correos, resúmenes y extracción de datos; la versión abliterada mantiene estas capacidades.
- Evaluación de riesgos en aplicaciones comerciales: antes de implementar un modelo de producción, se puede probar con este para identificar comportamientos no deseados y diseñar mitigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante abliterada o su cuantización Q4_K_S en la información disponible. El modelo base Qwen3.8-27B tiene resultados publicados en tareas como MathVision, pero no se han replicado para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_S pesa 15,8 GB, por lo que se recomiendan al menos 16 GB de VRAM para inferencia con GPU. En cuantización Q4_K_S, el consumo real de memoria es aproximadamente el tamaño del archivo más overhead, por lo que una GPU con 16 GB (RTX 4080, 4090) es suficiente.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o equivalentes. En GPU con menos de 16 GB, se puede usar offloading a CPU o cuantizaciones más agresivas (Q3, Q2).
- En CPU: puede ejecutarse con llama.cpp en sistemas con al menos 32 GB de RAM, aunque la velocidad será inferior.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, vLLM (si se convierte a otro formato), TGI (con adaptación). El modelo se carga directamente desde HuggingFace mediante `llama-cli` o `llama-server`.
- Latencia y throughput: no hay datos específicos; en una RTX 4090 se espera una generación de 20-40 tokens/s con contexto corto, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Característica principal |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,32B | no disponible | Apache 2.0 | Modelo base con alineación y rechazos |
| Qwen3.8-27B-OBLITERATED | 27,32B | no disponible | Apache 2.0 | Versión abliterada sin rechazos |
| Este GGUF Q4_K_S | 27,32B | no disponible | Apache 2.0 | Cuantización ligera de la versión abliterada |

La comparativa se centra en el proceso de abliteración y la cuantización. Otros modelos abliterados, como los de la serie "Pliny" (p. ej., "Pliny the Prompter"), no están documentados en esta información, por lo que no se incluyen.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar rechazos, el modelo puede generar instrucciones peligrosas, ilegales o éticamente cuestionables. No apto para uso en producción sin supervisión.
- Sesgos y alucinaciones: no se han mitigado sesgos del modelo base, y la abliteración no corrige alucinaciones. Puede producir información falsa o sesgada con confianza.
- Longitud de contexto no especificada: se desconoce el contexto máximo, lo que puede limitar tareas que requieren ventanas largas.
- Soporte de visión no confirmado en GGUF: aunque el modelo base es multimodal, la conversión GGUF puede no incluir el soporte de visión en llama.cpp.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede ser problemático legalmente. No hay restricciones de licencia, pero sí de responsabilidad ética.
- No apto para producción: por su naturaleza sin filtros, es inadecuado para aplicaciones comerciales orientadas al público general.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/ptq94h/Qwen3.8-27B-OBLITERATED-Q4_K_S-GGUF
- Modelo base abliterado: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de explainx.ai sobre la abliteración: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página local-ai-zone con GGUF: https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html

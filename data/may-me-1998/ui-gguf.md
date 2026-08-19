# may-me-1998/Ui-GGUF

## Resumen

El modelo `may-me-1998/Ui-GGUF` es una cuantización en formato GGUF del modelo base `deepreinforce-ai/Ornith-1.0-35B`, un modelo de lenguaje de tipo MoE (mixture of experts) con aproximadamente 34,66 mil millones de parámetros totales. Según las etiquetas del repositorio, se basa en la arquitectura `qwen3_5_moe` y ha sido sometido a un proceso de "abliteración" (eliminación de rechazos) para producir una versión "sin censura" (uncensored/decensored), orientada a tareas de ciberseguridad y red team. El autor es `may-me-1998`, y el repositorio está marcado como de acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de su descarga.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante motores de inferencia como `llama.cpp` u `Ollama`, sin necesidad de infraestructura de servidor dedicada. Sin embargo, la documentación pública es muy escasa: no se han publicado detalles sobre el entrenamiento, los datos utilizados, la longitud de contexto ni los benchmarks. La licencia se indica como "other", lo que añade incertidumbre sobre los términos de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basada en Qwen3.5 (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio ocupa 116,3 GB, lo que sugiere múltiples cuantizaciones, pero no se enumeran) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.0-35B` es un transformer de tipo MoE, según la etiqueta `qwen3_5_moe`, lo que implica que solo una fracción de los parámetros se activa por token. No se dispone de información sobre el número de parámetros activos, la arquitectura exacta de los expertos ni el tamaño del contexto. El proceso de "abliteración" mencionado en las etiquetas (`abliterated`, `heretic`) sugiere que se eliminaron las capas o pesos responsables de los rechazos de contenido, resultando en un modelo sin restricciones de seguridad. No hay datos públicos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica si el fine-tuning se realizó sobre el modelo base completo o sobre una versión intermedia.

## Capacidades

Según las etiquetas del repositorio, el modelo está orientado a:

- Generación de texto general (pipeline `text-generation`).
- Tareas de ciberseguridad y red team (etiquetas `cybersecurity`, `red-team`).
- Generación de código (etiqueta `coding`).
- Conversación multi-turno (etiqueta `conversational`).
- Contenido sin censura (etiquetas `uncensored`, `decensored`, `abliterated`).

No se documentan capacidades específicas como tool calling, razonamiento multi-paso o soporte de visión/audio. La ausencia de información impide confirmar estas funcionalidades, aunque por su arquitectura MoE y su tamaño podría ser capaz de tareas complejas de razonamiento, pero no hay evidencia publicada.

## Casos de uso

Dado el perfil del modelo (sin censura, orientado a ciberseguridad), los casos de uso potenciales son:

- **Pruebas de penetración y auditoría de seguridad**: el modelo puede generar scripts de explotación, comandos de enumeración o payloads para evaluar vulnerabilidades en sistemas propios o con autorización. Su naturaleza "sin censura" permite explorar vectores de ataque que los modelos alineados rechazarían.
- **Generación de exploits educativos**: en entornos de formación en ciberseguridad, puede crear ejemplos de ataques para enseñar defensa, siempre que se use en laboratorios aislados.
- **Análisis de malware**: puede ayudar a redactar descripciones técnicas de muestras de malware, generar código de detección o simular comportamiento malicioso para pruebas de sandbox.
- **Automatización de tareas de red team**: integrado en pipelines de automatización, puede generar informes, resumir hallazgos o proponer pasos siguientes en un engagement de seguridad.
- **Generación de código en general**: su etiqueta `coding` sugiere que puede asistir en programación, aunque no hay benchmarks que lo confirmen.
- **Investigación académica sobre modelos sin alineación**: útil para estudiar el comportamiento de modelos "abliterados" y sus riesgos, en entornos controlados.

Es importante destacar que estos usos son inferencias basadas en las etiquetas, no en documentación oficial del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar, ni comparaciones con modelos similares. Tampoco se ofrecen métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo MoE de ~35B parámetros totales, la VRAM necesaria depende de la cuantización elegida. Como referencia genérica para MoE de este tamaño: una cuantización Q4_K_M podría requerir entre 18 y 22 GB de VRAM, mientras que Q8 podría necesitar unos 35 GB. Sin embargo, al no conocer las cuantizaciones disponibles en el repositorio, estos valores son orientativos.
- **GPU recomendadas**: para las cuantizaciones más bajas, una RTX 4090 (24 GB) o una A100 de 40 GB serían suficientes. Para cuantizaciones altas, se necesitarían GPUs de 48 GB o más (A6000, A100 80GB).
- **Compatibilidad con hardware de consumo**: sí, gracias al formato GGUF, puede ejecutarse en GPUs de gama alta de consumo (RTX 3090/4090) con cuantizaciones Q4 o Q5.
- **Opciones de despliegue**: compatible con `llama.cpp`, `Ollama`, `LM Studio` y otros motores que soporten GGUF. También puede usarse con `vLLM` si se convierte a otro formato, aunque no es lo habitual.
- **Latencia y throughput**: no se han publicado datos. En un MoE, la velocidad depende del número de parámetros activos, que se desconoce.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `Ornith-1.0-35B` no tiene referencias públicas en los resultados de búsqueda, y no se conocen modelos directamente comparables con el mismo perfil (MoE, ~35B, abliterado, orientado a ciberseguridad). Alternativas genéricas como Mixtral 8x7B o Qwen3-30B-A3B tienen tamaños similares pero no comparten las mismas características de "sin censura" ni el enfoque en red team. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Licencia "other"**: los términos exactos de uso no están claros. Podría restringir el uso comercial o la redistribución. Es imprescindible revisar las condiciones antes de cualquier despliegue en producción.
- **Acceso restringido**: el repositorio es gated, lo que añade una barrera de entrada y sugiere que el autor quiere controlar quién accede al modelo.
- **Contenido sin censura**: al ser un modelo "abliterado", puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso en entornos reales sin control conlleva riesgos legales y éticos.
- **Falta de documentación**: no hay información sobre sesgos, alucinaciones, límites de contexto o idiomas distintos del inglés. No se puede garantizar la fiabilidad en tareas críticas.
- **Riesgo de alucinación**: al no haber benchmarks, se desconoce la precisión factual del modelo. Es probable que presente alucinaciones, especialmente en dominios especializados.
- **Sin garantías de seguridad**: al estar orientado a ciberseguridad, su uso indebido podría facilitar actividades maliciosas. El autor no ofrece ninguna garantía de seguridad o responsabilidad.

## Enlaces

- [Repositorio Hugging Face del modelo GGUF](https://huggingface.co/may-me-1998/Ui-GGUF)
- [Modelo base (referencia en tags): ornith-ai/Ornith-1.0-35B](https://huggingface.co/ornith-ai/Ornith-1.0-35B) (enlace no verificado)
- [Modelo base alternativo mencionado: deepreinforce-ai/Ornith-1.0-35B](https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B) (enlace no verificado)
- [Paper referenciado en tags (arXiv:2406.11717)](https://arxiv.org/abs/2406.11717) — no se ha confirmado su relación con el modelo.

Nota: los enlaces al modelo base no han podido verificarse en la búsqueda web; se incluyen según las etiquetas del repositorio.

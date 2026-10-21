# lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022-adapter

## Resumen

`lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado sobre el modelo base `Qwen/Qwen3.5-4B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato `safetensors` (el repositorio ocupa aproximadamente 0,1 GB), que debe cargarse junto con el modelo base para poder realizar inferencia. El autor es el usuario de HuggingFace `lugman-madhiai`, y la licencia declarada es Apache 2.0.

El adaptador se ha entrenado con Unsloth (la model card indica que el entrenamiento fue "2x faster" gracias a dicha librería) y aparece etiquetado con `trl`, `transformers` y `text-generation-inference`, lo que sugiere un flujo de trabajo estándar de SFT sobre el ecosistema HuggingFace. El nombre del repositorio incluye el sufijo `Instantly-SFT-1022`, que apunta a una ejecución de ajuste fino realizada el 22 de octubre (formato 1022) sobre algún conjunto de datos o proyecto llamado "Instantly"; este extremo no está confirmado en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador comunitario sin descargas ni valoraciones en el momento de la consulta; por otro, sirve como ejemplo de artefacto derivado de la familia Qwen3.5, cuya información técnica pública no está recogida en la documentación proporcionada. La model card es una plantilla autogenerada por Unsloth y no incluye datos de entrenamiento, hiperparámetros, evaluación ni ejemplos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (fine-tune tipo LoRA/PEFT) sobre un transformer decoder-only; arquitectura del modelo base: no disponible |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB); modelo base: aproximadamente 4 000 millones segun la nomenclatura `Qwen3.5-4B`, no confirmado |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base puede cuantizarse tras el merge (ver "Requisitos de hardware") |
| Idiomas soportados | Ingles (`en` segun los metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT); requiere el modelo base `Qwen/Qwen3.5-4B` |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango, no un conjunto de pesos completo: el tamaño del repositorio (0,1 GB) es coherente con matrices LoRA para un modelo de ~4 000 millones de parámetros, mientras que los pesos completos en `bfloat16` ocuparían del orden de 8 GB. La arquitectura interna del adaptador (rango, módulos objetivo, alpha, dropout) no se detalla en la model card. La arquitectura del modelo base —Qwen3.5-4B— tampoco se describe en la información proporcionada.

En cuanto al entrenamiento, la model card únicamente declara que se usó Unsloth y que el modelo se ajustó desde `Qwen/Qwen3.5-4B`. No se especifican el número de tokens, la composición del dataset, la existencia de fases de RLHF o DPO, la configuración de hiperparámetros ni la duración del entrenamiento. El sufijo `SFT` del nombre indica ajuste fino supervisado, y `1022` sugiere una marca temporal, pero ninguno de los dos datos está confirmado por el autor.

## Capacidades

- Generación de texto en inglés: es la única capacidad declarada de forma explícita mediante el tag `language: en`.
- Herencia de capacidades del modelo base: al ser un adaptador, conserva (o modifica) las capacidades de `Qwen/Qwen3.5-4B`, que no están documentadas en la información disponible.
- Integración con `text-generation-inference`: el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con el despliegue en TGI y con los endpoints de HuggingFace.
- Uso con la pila `transformers` + PEFT: el adaptador puede cargarse sobre el modelo base mediante `PeftModel` en el ecosistema HuggingFace.
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multimodales (visión, audio): no disponible (no declarado).
- Modo "thinking" o decodificación extendida: no disponible (no declarado).

## Casos de uso

- Evaluación de un ajuste fino propio: el adaptador sirve como referencia para comparar, en un entorno controlado, si un SFT ligero sobre Qwen3.5-4B mejora una tarea concreta frente al modelo base sin ajustar. Es adecuado porque el adaptador es pequeño (0,1 GB) y se puede cargar y descargar rápidamente en pipelines de experimentación.
- Prototipado de asistentes en inglés: al estar etiquetado solo en inglés, encaja en pruebas de concepto de chat o generación de texto para usuarios angloparlantes, siempre que se valide la calidad antes de producción (no hay evaluaciones publicadas).
- Servido dinámico de múltiples adaptadores: con TGI o vLLM es posible mantener una única instancia del modelo base y cargar este adaptador como LoRA multimodelo, lo que permite atender una variante concreta de comportamiento sin duplicar los ~8 GB de pesos del modelo base.
- Investigación sobre SFT de bajo coste: el repositorio documenta el resultado de un entrenamiento realizado con Unsloth; es útil como caso de estudio de flujos de ajuste eficiente en memoria sobre GPUs de consumo.
- Generación de datos sintéticos en inglés para tareas internas: un modelo de ~4 000 millones de parámetros ajustado puede emplearse para producir borradores o pares instrucción-respuesta que luego se filtran manualmente, con coste de inferencia bajo.
- Base para un segundo ajuste específico de dominio: el adaptador puede servir como punto de partida (inicialización) para un ajuste posterior con datos propios, reduciendo el tiempo de entrenamiento frente a partir del modelo base.
- Pruebas de regresión de infraestructura: útil para validar que la versión de TGI, vLLM o `transformers` desplegada soporta correctamente la arquitectura `qwen3_5` y la carga de adaptadores PEFT antes de incorporar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de la búsqueda web realizada no contienen información técnica sobre el modelo: los enlaces devueltos tratan sobre configuración de correo en Outlook y formato de documentos administrativos, por lo que se descartan como fuentes.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: hay que cargar el modelo base `Qwen/Qwen3.5-4B` (aproximadamente 4 000 millones de parámetros según la nomenclatura) y aplicar el adaptador, o bien fusionarlos previamente (`merge_and_unload`).
- VRAM estimada para inferencia en `bfloat16`/`float16` (modelo base fusionado con el adaptador): del orden de 8 GB solo para pesos, más caché KV; en la práctica, 10-12 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-6 GB, adecuada para GPUs de 8 GB con contexto moderado.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB, lo que permitiría ejecución en GPUs de consumo de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para servir en paralelo o con lotes grandes; RTX 4090 (24 GB) y L40S para desarrollo y despliegue en `bfloat16`; RTX 4070 Ti SUPER / 4080 (16 GB) y RTX 3090/4090 para uso monousuario. En gama de entrada, RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: TGI y vLLM admiten carga de adaptadores LoRA sobre un modelo base compartido (verificar que la versión instalada soporte la arquitectura `qwen3_5`); `transformers` + `peft` para prototipado; llama.cpp/Ollama solo tras fusionar el adaptador con el modelo base y convertir el resultado a GGUF (el adaptador en `safetensors` no se carga directamente como GGUF sin conversión).
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022-adapter` | Adaptador sobre base de ~4 000 M (no confirmado) | No disponible | Apache 2.0 | `safetensors` (PEFT) | 0 descargas, 0 likes en el momento de la consulta |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4 000 M según nomenclatura | No disponible | No disponible | No disponible | Referenciado como `base_model` |
| Otros adaptadores SFT de la familia Qwen3.5 | No disponible | No disponible | No disponible | `safetensors` | No disponible en la información proporcionada |
| Modelos abiertos de ~3-4 B de otras familias (p. ej. Qwen2.5, Llama 3.2, Phi-3.5, Gemma) | No disponible | No disponible | No disponible | No disponible | No verificable con la información disponible |

No se dispone de datos verificados de arquitectura, contexto ni rendimiento de `Qwen/Qwen3.5-4B` en la documentación aportada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría. Cualquier comparación numérica en este punto sería especulativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar `Qwen/Qwen3.5-4B`; sin el modelo base el adaptador es inutilizable.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de pérdida, ni comparación con el modelo base, por lo que se desconoce si el ajuste mejora o degrada el rendimiento original.
- Idiomas: el repositorio declara únicamente inglés. No hay garantía de comportamiento aceptable en castellano u otros idiomas, aunque el modelo base pudiera soportarlos.
- Sesgos: no documentados. Al desconocerse el dataset de ajuste (nombre "Instantly" sin confirmar), no es posible evaluar sesgos introducidos por el SFT.
- Riesgo de alucinación: no cuantificado; es un riesgo inherente a los modelos generativos de ~4 000 millones de parámetros y no hay evaluaciones que lo acoten.
- Trazabilidad mínima: la model card es una plantilla autogenerada por Unsloth, sin información sobre datos, hiperparámetros ni intención del autor. La fecha de creación (2026-10-21) y la ausencia de descargas o likes indican un artefacto personal sin validación comunitaria.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero las condiciones del modelo base y de los datos de ajuste deben verificarse por separado; el autor no aclara la procedencia de los datos de entrenamiento.
- Compatibilidad: la arquitectura `qwen3_5` puede no estar soportada por versiones antiguas de vLLM, TGI, llama.cpp u Ollama; es necesario comprobar la versión antes de desplegar.
- Producción: no recomendado como componente crítico sin una evaluación propia previa sobre el dominio objetivo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth (librería de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL (tag del repositorio): https://github.com/huggingface/trl
- Papers, blogs o demos del autor: no disponible
- Resultados de la búsqueda web: no relevantes (los enlaces devueltos tratan sobre Outlook y formato de documentos administrativos, sin relación con el modelo)

# DoubleRabbits/d3-mini-zils-v5

## Resumen

DoubleRabbits/d3-mini-zils-v5 es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre una base derivada de Qwen3.5-4B, identificada por el autor como "chassis d3-mini-4.5b-v1". El modelo se presenta como un "decision model" especializado, entrenado sobre 400 decisiones sinteticas con semilla 4, y forma parte de lo que el autor denomina "Zils d3-mini soup pool", un conjunto de variantes obtenidas mediante mezcla y ajuste de la misma base.

Con 4.539.265.536 parametros (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors, se situa en la franja de modelos pequenos, aptos para inferencia en GPU de consumo. La licencia es Apache 2.0 y el modelo se distribuye con codigo personalizado (`custom_code`, arquitectura `qwen3_5`), lo que implica que requiere confiar en la implementacion incluida en el repositorio para cargarlo.

La relevancia es limitada y muy contextual: no hay resultados de benchmarks, no se declaran idiomas soportados, el pipeline no esta especificado y el modelo no registra descargas ni likes en el momento de la consulta. Debe tratarse como un experimento de ajuste especializado, no como un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), con codigo personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B a traves de la base intermedia "d3-mini-4.5b-v1" y se ajusta con LoRA de rango 16 sobre 400 decisiones sinteticas generadas con semilla 4. El resultado es un fine-tune fusionado que conserva la arquitectura del modelo base (tag `qwen3_5`), aunque el repositorio incluye codigo personalizado, por lo que la definicion exacta de la arquitectura no es verificable solo con los metadatos.

No se especifican el volumen total de tokens de entrenamiento, la composicion del dataset mas alla de "400 decisiones sinteticas", ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento). El entrenamiento es, por tanto, de alcance muy reducido y orientado a una tarea concreta de decision.

## Capacidades

- Generacion de texto y toma de decisiones en el dominio acotado de las 400 decisiones sinteticas de entrenamiento.
- Razonamiento de un solo paso orientado a elegir entre opciones; no se documenta razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Herencia potencial de las capacidades del modelo base Qwen3.5-4B, aunque el ajuste LoRA puede haber degradado el rendimiento general fuera del dominio de decision.

## Casos de uso

- Clasificacion y enrutamiento de decisiones sinteticas: el modelo puede usarse como componente de decision en pipelines internos que repliquen la distribucion de las 400 muestras de entrenamiento, por ejemplo para seleccionar entre opciones discretas predefinidas.
- Prototipado de sistemas de decision con licencia permisiva: al ser Apache 2.0 y 4,5 B de parametros, sirve para experimentar en local sin coste de API ni restricciones de uso comercial.
- Evaluacion de metodologias de ajuste LoRA: util como caso de estudio de fine-tune de rango 16 sobre un modelo de 4 B con un dataset minimo, para comparar tecnicas de entrenamiento.
- Base para experimentos de mezcla de modelos ("soup"): el autor lo enmarca en un pool de variantes, por lo que puede emplearse como componente en tecnicas de model merging.
- Inferencia en hardware modesto: con 4,5 B de parametros cabe en GPU de consumo, lo que permite desplegarlo en estaciones de trabajo para pruebas de decision offline.
- Docencia y reproduccion de experimentos: permite ilustrar el ciclo completo de fine-tune, publicacion en Hugging Face y evaluacion cualitativa de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9-10 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones teoricas a partir del numero de parametros, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para mayor throughput; RTX 4090, RTX 3090 o RTX 4080 para uso individual en precision completa o 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar el modelo con `trust_remote_code=True` en Transformers; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y puede requerir conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DoubleRabbits/d3-mini-zils-v5 | 4,5 B | no disponible | Apache 2.0 | Fine-tune LoRA de decision, sin benchmarks, requiere `custom_code` |
| Qwen3.5-4B (base declarada) | aprox. 4 B | no disponible en esta ficha | depende de la version (habitualmente Apache 2.0) | Modelo generalista del que deriva; capacidades mas amplias y documentadas |
| Fine-tunes comunitarios de 4 B (familia Qwen) | 3-4 B | variable | variable | Alternativas generalistas con mayor documentacion y comunidad |

La comparacion cuantitativa de rendimiento no esta disponible al no haberse publicado benchmarks del modelo.

## Limitaciones y advertencias

- Dataset de entrenamiento minimo (400 muestras sinteticas): alta probabilidad de sobreajuste y escasa generalizacion fuera del dominio.
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas generales, ya que el ajuste puede haber degradado las capacidades del modelo base.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada; no debe asumirse la del modelo base sin verificacion.
- Requiere `custom_code` y `trust_remote_code=True`: implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- Ausencia de benchmarks, pipeline y documentacion de evaluacion: no apto para produccion sin validacion propia.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de documentacion traslada toda la responsabilidad de validacion al usuario.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-v5
- Modelo base declarado (Qwen3.5-4B): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada

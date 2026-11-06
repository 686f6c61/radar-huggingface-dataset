# qhoenix/zils-lite-decision-v6a

## Resumen

zils-lite-decision-v6a es un modelo de extracción de características (feature-extraction) desarrollado por el usuario qhoenix, construido mediante fine-tuning con LoRA sobre Qwen/Qwen3.5-0.8B. Con 852.985.920 parámetros, pertenece a la familia de modelos ligeros de decisión denominada "d3-lite" y está orientado específicamente al pool lite de la subred Zils 127. No es un modelo generativo de propósito general, sino un cuerpo de decisión diseñado para producir representaciones o señales de decisión a partir de entradas textuales.

El modelo se obtuvo promediando dos cuerpos lite previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5, ambos Apache-2.0) para formar un "soup" uniforme, que después se afinó con LoRA sobre datos de estilo decisión provenientes de splits de entrenamiento de datasets públicos y de ítems de práctica escritos específicamente. El resultado final es una mezcla ponderada al 30% del soup y 70% del fine-tune.

Su relevancia radica en su nicho: modelos pequeños y especializados en tareas de decisión dentro de subredes descentralizadas, con licencia Apache-2.0 y compatibilidad con endpoints. Al tener 0 descargas y 0 likes en el momento de la ficha, se trata de un artefacto reciente y de adopción incipiente, por lo que la documentación pública es escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles específicos no disponibles |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con aproximadamente 853 millones de parámetros. Sobre esa base se aplicó un proceso en dos fases: primero se construyó un "soup" mediante promedio uniforme de los pesos de dos cuerpos lite (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5), y después se realizó un fine-tuning con LoRA sobre datos de estilo decisión. El modelo final es una media ponderada del 30% del soup y el 70% del fine-tune.

Los datos de entrenamiento provienen de splits de entrenamiento de datasets públicos y de ítems de práctica redactados específicamente para la tarea. No se especifica el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La innovación principal es el enfoque de "cuerpo de decisión" dentro de la subred Zils, que combina model averaging con LoRA para especializar un modelo pequeño en señales de decisión en lugar de generación abierta.

## Capacidades

- Extracción de características y representaciones para tareas de decisión (pipeline declarado: feature-extraction).
- Especialización en "decision-style" dentro del pool lite de la subred Zils 127.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de código personalizado (tag custom_code), lo que implica que requiere cargar código propio del repositorio.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Señalización de decisión en la subred Zils: el modelo puede emplearse como cuerpo lite para emitir decisiones dentro del pool lite de la subred 127, aprovechando su especialización en datos de estilo decisión.
- Clasificación y enrutamiento ligero: al ser un modelo de feature-extraction de ~853 M de parámetros, puede generar embeddings para enrutar peticiones o clasificar entradas en pipelines de bajo coste.
- Experimentación en investigación sobre model soups: sirve como caso de estudio reproducible del enfoque de promediado de pesos más LoRA sobre una base Qwen3.5-0.8B.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecución en hardware modesto, adecuado para prototipos y pruebas de concepto.
- Integración vía endpoints: gracias al tag endpoints_compatible, puede servirse en infraestructura compatible con endpoints de Hugging Face para pruebas internas.
- Base para fine-tuning posterior: al estar bajo Apache-2.0 y con safetensors, puede reutilizarse como punto de partida para especializaciones adicionales en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32 unos 3,4 GB; en cuantizaciones de 8 bits o 4 bits el requisito baja a rangos de 1 GB o menos (estimación teórica, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: por tamaño, es probable que quepa en GPU de consumo con suficiente VRAM, pero no se confirma en la información disponible.
- Opciones de despliegue: transformers (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qhoenix/zils-lite-decision-v6a | 852.985.920 | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible | Hugging Face |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | apache-2.0 | Hugging Face |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: diseñado para el pool lite de la subred Zils 127; su comportamiento fuera de ese contexto no está documentado.
- Documentación escasa: sin datos de contexto, idiomas, cuantización ni benchmarks publicados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados por el autor.
- Requiere código personalizado (tag custom_code): la carga con transformers puede necesitar confiar en código remoto del repositorio.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los avisos LICENSE y NOTICE del repositorio.
- Sin garantías de producción: no hay información sobre latencia, estabilidad ni calidad en despliegues reales.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-v6a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo lite 1: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Cuerpo lite 2: https://huggingface.co/dasLOL/zils-lite-skills-v5

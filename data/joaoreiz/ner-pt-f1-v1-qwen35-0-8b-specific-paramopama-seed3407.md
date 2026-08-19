# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed3407

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen3.5-0.8B de la familia Qwen y está entrenado específicamente sobre el corpus paramopama, dentro de una matriz de investigación más amplia denominada `ner-pt-generative-2026-f1-v1`. El adaptador emplea generación estructurada JSON con restricción de etiquetas y tokens, lo que permite obtener salidas con alta validez estructural.

La relevancia de este modelo radica en su enfoque de NER generativa para portugués, un idioma con menos recursos que el inglés. Al ser un adaptador LoRA, es ligero (0.1 GB) y puede cargarse sobre el modelo base Qwen3.5-0.8B, lo que facilita su uso en entornos con recursos limitados. Está pensado para investigación y experimentación controlada, no para producción de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-0.8B (transformer decoder) |
| Parámetros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 0.8B) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado en BF16) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA (safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen/Qwen3.5-0.8B en su revisión exacta `2fc06364715b967f1860aea9cf38778875588b17`. El entrenamiento se realizó con precisión BF16 y LoRA, sobre el dataset paramopama, con semilla 3407. La selección del checkpoint se hizo por F1 end-to-end en validación, sin usar el split de test para la selección. La inferencia canónica se realiza con vLLM, temperatura 0, y generación JSON restringida con `labels_and_tokens`. La política para salidas inválidas es predicción vacía en el scoring end-to-end.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas como RLHF o DPO. La innovación principal es el uso de generación estructurada JSON para NER, que garantiza una alta validez estructural de las salidas.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugués, con salida en formato JSON estructurado.
- Generación restringida de etiquetas y tokens, lo que reduce errores de formato.
- Capacidad de adaptación a dominios específicos mediante fine-tuning LoRA.
- Inferencia con vLLM, lo que permite integración en pipelines de servidores de inferencia.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación académica en NER para portugués: el modelo puede utilizarse para comparar enfoques generativos frente a métodos clásicos de etiquetado secuencial, gracias a su salida JSON estructurada.
- Extracción de entidades en corpus periodísticos o literarios en portugués: permite identificar personas, organizaciones y lugares en textos largos, con una validez estructural del 99.88% en el corpus de prueba.
- Desarrollo de pipelines de procesamiento de lenguaje natural para portugués: al ser un adaptador LoRA ligero, puede integrarse en sistemas existentes sin necesidad de GPUs de alta gama.
- Evaluación de robustez de modelos generativos en tareas de etiquetado: su configuración de semilla y protocolo reproducible lo hace útil para estudios de variabilidad entre semillas.
- Prototipado de sistemas de extracción de información en dominios específicos: el adaptador puede fine-tunearse sobre otros corpus para adaptarlo a dominios como legal o médico.
- Enseñanza y demostración de NER generativa: su pequeño tamaño permite ejecutarlo en entornos educativos con recursos limitados.

## Benchmarks y rendimiento

Según la model card, los resultados en el split de test del dataset paramopama son:

| Dataset | Precisión | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0.8914 | 0.8965 | 0.8940 | 0.9988 |

Estos resultados corresponden a una única semilla y a splits congelados. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, por lo que puede cargarse en cualquier GPU con al menos 2 GB de VRAM junto con el modelo base de 0.8B.
- El modelo base Qwen3.5-0.8B es adecuado para GPUs de consumo como RTX 3060, RTX 4060 o incluso CPU con suficiente RAM.
- Para inferencia con vLLM, se recomienda una GPU con al menos 4 GB de VRAM para un rendimiento fluido.
- Opciones de despliegue: vLLM (inferencia canónica), PEFT para carga del adaptador, y posiblemente llama.cpp u Ollama si se convierte el modelo a GGUF (no documentado).
- La latencia y el throughput no están documentados, pero al ser un modelo de 0.8B, se espera una inferencia rápida en hardware moderno.

## Comparativa con modelos similares

El autor ha publicado adaptadores equivalentes sobre bases de mayor tamaño, según los resultados de búsqueda:

| Modelo | Base | Tamaño del adaptador | F1 (paramopama) |
|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed3407 | Qwen3.5-0.8B | 0.1 GB | 0.8940 |
| ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407 | Qwen3.5-2B | No disponible | No disponible |
| ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407 | Qwen3.5-4B | No disponible | No disponible |

No se dispone de resultados de rendimiento para las versiones de 2B y 4B en la información proporcionada. La comparativa se limita al tamaño del modelo base y al adaptador.

## Limitaciones y advertencias

- Los resultados reportados corresponden a una única semilla y a un corpus específico; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.
- Las entidades generadas pueden ser estructuralmente válidas pero semánticamente incorrectas, lo que requiere revisión humana en aplicaciones críticas.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas.
- La licencia no está especificada, por lo que se debe contactar al autor antes de un uso comercial.
- El modelo solo soporta portugués; no se ha evaluado su comportamiento en otros idiomas.
- Los esquemas de anotación de los corpus pueden diferir, lo que afecta a la transferibilidad.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un corpus concreto, puede heredar sesgos presentes en los datos.

## Enlaces

- [Modelo en HuggingFace (0.8B)](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed3407)
- [Modelo en HuggingFace (2B)](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407)
- [Modelo en HuggingFace (4B)](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407)
- [Despliegue en FriendliAI (2B)](https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407)

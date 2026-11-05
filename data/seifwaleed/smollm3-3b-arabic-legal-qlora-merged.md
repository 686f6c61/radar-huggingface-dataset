# SeifWaleed/smollm3-3b-arabic-legal-qlora-merged

## Resumen

SmolLM3-3B Arabic Legal Clause Classification (QLoRA) es un ajuste fino del modelo base HuggingFaceTB/SmolLM3-3B, desarrollado por el usuario de Hugging Face SeifWaleed. El modelo está especializado en una tarea concreta: clasificar cláusulas de contratos en árabe en una de seis categorías predefinidas (payment, termination, liability, dispute_resolution, scope_of_work, other). Se trata de una demostración educativa, no de un sistema de asesoramiento legal verificado.

El ajuste se realizó mediante QLoRA con rango 16 sobre una base congelada cuantizada en 4 bits (NF4), usando supervisión de TRL. El conjunto de datos de entrenamiento es un piloto reducido de 409 ejemplos extraídos de un corpus de documentos legales árabes, con etiquetas generadas automáticamente (silver labels) y no revisadas por expertos legales. El modelo tiene 3.075.098.624 parámetros y un tamaño de repositorio de 6,2 GB en formato safetensors.

Su relevancia es limitada y acotada: sirve como ejemplo de flujo de trabajo de ajuste fino con QLoRA sobre un modelo pequeño para una tarea de clasificación en un dominio especializado y en un idioma (árabe) que no es el más fuerte del modelo base. No debe confundirse con un sistema de producción legal ni con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; pesos fusionados en safetensors (cuantizacion de inferencia no especificada) |
| Idiomas soportados | ar (arabe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.075 millones de parametros. Sobre esa base congelada se aplico un ajuste QLoRA con rango 16 y cuantizacion 4-bit NF4, usando el framework TRL para supervised fine-tuning. Los adaptadores LoRA se fusionaron posteriormente con los pesos base, dando lugar al repositorio merged publicado.

El conjunto de datos de entrenamiento consta de 409 ejemplos piloto seleccionados de un total de 3385 clausulas candidatas, con un split por documento de origen de 287 ejemplos de entrenamiento, 61 de validacion y 61 de test. Las etiquetas son silver labels generadas automaticamente, no anotaciones de expertos legales. La tarea es de clasificacion en una sola etiqueta entre seis categorias. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal especifica para este ajuste.

## Capacidades

- Clasificacion de clausulas contractuales en arabe en una de seis categorias: payment, termination, liability, dispute_resolution, scope_of_work, other.
- Generacion de texto conversacional en formato chat, con plantilla de chat y soporte de modo thinking desactivable (`enable_thinking=False`).
- Respuesta restringida a una unica etiqueta cuando se le instruye mediante system prompt.
- Capacidad multilingue limitada al arabe en el contexto de la tarea ajustada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision ni audio.

## Casos de uso

- Clasificacion automatica de clausulas en contratos arabes: el modelo recibe el texto de una clausula y devuelve una de las seis etiquetas, util para preetiquetar grandes volumenes de contratos antes de revision humana.
- Triaje documental en despachos legales: permite agrupar clausulas por tipo (pago, terminacion, responsabilidad) para priorizar la revision de las mas criticas.
- Extraccion de metadatos en pipelines de gestion contractual: integrado como paso de clasificacion previo a sistemas de extraccion de entidades o resumen.
- Demostracion educativa de QLoRA: sirve como ejemplo reproducible de ajuste fino de un modelo de 3B para una tarea de clasificacion en un dominio especializado.
- Prototipado de asistentes de revision contractual en arabe: util para validar la viabilidad de un flujo de clasificacion antes de invertir en anotacion humana y modelos mayores.
- Filtrado y enrutamiento de clausulas hacia equipos especializados: las clausulas etiquetadas como liability o dispute_resolution pueden dirigirse a revisores con expertise especifico.

## Benchmarks y rendimiento

Los resultados publicados son proxies sobre silver labels, no accuracy real sobre ground truth humana.

| Metrica | SmolLM3 original | Ajustado |
|---|---:|---:|
| Accuracy (silver proxy) | 0.2295 | 0.8033 |
| Macro-F1 (silver proxy) | 0.2352 | 0.7918 |
| Tasa de salida invalida | 0.0 | 0.0 |
| GSM8K numeric exact match (local, 60 preguntas) | 0.78333 | 0.73333 |

Advertencia: la evaluacion de clasificacion usa `SILVER_PROXY_NOT_GROUND_TRUTH` en ambos casos. El GSM8K es una evaluacion local no oficial, con generacion greedy, zero-shot, sin thinking y cuantizacion 4-bit; no equivale al leaderboard oficial de LightEval/Smol Course.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion 4-bit: alrededor de 2-3 GB para pesos, dependiendo del backend.
- GPU recomendadas: A100, H100 para despliegue en fp16 con margen; RTX 4090, RTX 3090 y GPUs consumer con 8-12 GB para fp16 o 4-bit.
- Cabe en GPUs consumer: si, en tarjetas con 8 GB o mas en cuantizacion 4-bit, y en 12-16 GB en fp16.
- Opciones de despliegue: transformers (referencia en la model card), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF (no se proporcionan en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeifWaleed/smollm3-3b-arabic-legal-qlora-merged | 3.075 M | no disponible | Clasificacion legal en arabe | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM3-3B (base) | 3.075 M | no disponible | Proposito general, texto | no disponible en esta ficha | Hugging Face |
| Alternativas de clasificacion legal en arabe | no disponible | no disponible | Clasificacion | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son silver labels generadas automaticamente; no hay anotacion de expertos legales.
- El conjunto piloto es pequeno (409 ejemplos) y presenta desbalanceo de clases.
- Las metricas de clasificacion son proxies sobre silver labels, no accuracy real sobre ground truth.
- El arabe no es el idioma mas fuerte del modelo base SmolLM3-3B, lo que puede degradar el rendimiento en textos legales complejos.
- Las clausulas pueden ser ambiguas o multi-etiqueta, mientras que el modelo fuerza una unica etiqueta.
- Riesgo de alucinacion y de salidas fuera de las seis categorias si no se restringe el prompt.
- La licencia no esta disponible; el autor advierte que la procedencia y licencia del dataset original no estan claramente documentadas y que el publicador debe verificar derechos y riesgos de datos personales antes de un uso publico.
- No debe usarse como asesoramiento legal ni como sistema de decision legal verificado.
- No compartir texto contractual original sin verificar derechos y privacidad.
- El modelo esta pensado como demostracion educativa, no como sistema de produccion.

## Enlaces

- https://huggingface.co/SeifWaleed/smollm3-3b-arabic-legal-qlora-merged
- https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- https://huggingface.co/learn/smol-course/unit1/6
- https://huggingface.co/datasets/Sukuna404/arabic-legal-documents-and-verified-forms

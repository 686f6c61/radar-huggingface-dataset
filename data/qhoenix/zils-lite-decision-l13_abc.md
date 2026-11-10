# qhoenix/zils-lite-decision-l13_abc

## Resumen

zils-lite-decision-l13_abc es un modelo de decisión de tipo "lite" (0,8B) desarrollado por el usuario qhoenix dentro del ecosistema Zils. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B, publicado con licencia Apache-2.0 y orientado a la extracción de características y a la toma de decisiones estructuradas en el formato de examen Zils. El modelo no es un asistente conversacional generalista: es una "cabeza" de decisión construida mediante un proceso de mezcla de pesos (soup-pool) y tres fine-tunes completos sobre aproximadamente 98.000 ítems de decisión.

La receta de construcción es inusualmente explícita: parte de una media ponderada de seis "cuerpos" (dos miembros del soup Zils al 25% cada uno y cuatro cuerpos Apache-2.0 al 12,5% cada uno), seguida de tres fine-tunes completos con semillas distintas, pérdida de entropía cruzada suave más Brier y un anclaje KL de 0,1 al modelo de partida. El resultado final es la media uniforme de los tres fine-tunes, desplazada 1,3x a lo largo del cambio medio respecto al punto de inicio.

Con 852.985.920 parámetros y un repositorio de 1,7 GB en BF16, el modelo está pensado para entornos con recursos limitados donde se requiere una función de decisión especializada en lugar de un LLM generativo completo. Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados que pueden ejecutarse en hardware consumer y desplegarse como componentes de sistemas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-0.8B, un transformer de aproximadamente 0,85B de parámetros, y se distribuye con código personalizado (`custom_code`), lo que implica que la clase de modelo no es estándar y requiere cargar el módulo remoto con `trust_remote_code=True`. El pipeline declarado es `feature-extraction`, no `text-generation`, lo que sugiere que el modelo está diseñado para producir representaciones o puntuaciones de decisión más que texto libre.

El entrenamiento se realizó en varias fases. Primero, una media ponderada de pesos de seis modelos: Charlie320/zils-lite-v9a (25%), qhoenix/zils-lite-decision-v9 (25%), vllm-sr/d3-lite (12,5%), internlm/Intern-Decision-0.8B (12,5%), Maincode/Matilda-Decision-v1-Edge (12,5%) y zils-ai/jiwo-0.8b-full (12,5%). Sobre ese punto de partida se ejecutaron tres fine-tunes completos de los pesos de lenguaje con learning rate 5e-6, una época y semillas distintas, sobre aproximadamente 98.000 ítems de decisión en formato de examen Zils. Los datos combinan splits TRAIN públicos con etiquetas gold e ítems generados por Claude, GPT-5.4, DeepSeek y otros modelos a partir de splits TRAIN públicos de datasets de uso comercial; los ítems de dominio nuevo solo se conservaron cuando un modelo de otro proveedor respondió de forma ciega igual. La función de pérdida combina entropía cruzada suave, pérdida de Brier y un anclaje KL de 0,1 al modelo de partida. El peso final es la media uniforme de los tres fine-tunes, extrapolada 1,3x a lo largo del cambio medio. No se usaron semillas de examen, validación ni splits de test durante el entrenamiento.

## Capacidades

- Extracción de características y representaciones para tareas de decisión estructurada.
- Toma de decisiones en el formato de examen Zils (clasificación/puntuación de ítems de opción múltiple o similar).
- Fine-tune especializado sobre Qwen3.5-0.8B, heredando la tokenización y el vocabulario del modelo base.
- Capacidad de servir como componente de decisión dentro de pipelines mayores, no como generador de texto libre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines de clasificación: el modelo puede puntuar ítems de decisión en el formato Zils, integrándose como clasificador especializado en un sistema mayor que derive las peticiones a distintos modelos o servicios según la puntuación obtenida.
- Evaluación automática de exámenes y test de opción múltiple: dado su entrenamiento sobre ítems en formato de examen con etiquetas gold, puede emplearse para predecir la respuesta correcta o la etiqueta de calidad de nuevos ítems generados por otros modelos.
- Filtrado de datos sintéticos: los ítems generados por Claude, GPT-5.4 o DeepSeek pueden pasarse por este modelo para verificar consistencia de etiquetas antes de incorporarlos a un dataset de entrenamiento, aprovechando que fue entrenado con un criterio de consenso entre proveedores.
- Componente de decisión en sistemas de bajo consumo: con 0,85B parámetros y pesos BF16 de 1,7 GB, puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 de 12 GB o superiores) o incluso en CPU con cuantización, sirviendo como módulo de decisión local sin depender de APIs externas.
- Investigación sobre mezcla de pesos y extrapolación de fine-tunes: la receta documentada (soup-pool, tres semillas, anclaje KL, extrapolación 1,3x) lo convierte en un caso de estudio reproducible para estudiar técnicas de merging y su efecto en tareas de decisión.
- Base para fine-tunes posteriores en dominios específicos: al estar publicado con Apache-2.0 y safetensors, puede reutilizarse como punto de partida para especializar decisiones en verticales concretas (legal, médico, financiero) con datasets propios.
- Prototipado rápido de clasificadores de decisión: sustituye a un LLM grande en tareas de etiquetado binario o multiclase donde la latencia y el coste importan, manteniendo un formato de salida consistente con el examen Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB para los pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en FP16/FP32: similar en FP16; en FP32 se duplicaría hasta unos 3,4 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3050, RTX 3060, RTX 4060, T4, L4). Para mayor throughput, A10G, L40S o A100.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y superiores; también en GPUs de 8 GB con margen amplio.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el `custom_code`); vLLM y TGI no están confirmados para esta arquitectura personalizada; llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-l13_abc | 852.985.920 | no disponible | feature-extraction / decisión | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | generación de texto | no disponible en la información | Hugging Face |
| internlm/Intern-Decision-0.8B | ~0,8B | no disponible | decisión | no disponible en la información | Hugging Face (usado como componente del soup) |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | decisión | no disponible en la información | Hugging Face (usado como componente del soup) |

La comparativa se limita a los modelos citados en la receta de construcción, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni evidencia de uso en producción.
- El pipeline es `feature-extraction`, no `text-generation`: no debe esperarse comportamiento de chatbot ni generación de texto libre.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar en entornos sensibles.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas de decisión es desconocido.
- Los idiomas soportados no están documentados; el entrenamiento se describe sobre ítems en formato Zils sin especificar composición lingüística.
- La longitud de contexto no está documentada; asumir la del modelo base Qwen3.5-0.8B sin confirmación.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de decisión, el riesgo principal es la calibración incorrecta de puntuaciones, no la generación de texto.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento incluyen ítems generados por modelos de terceros (Claude, GPT-5.4, DeepSeek), cuyas condiciones de uso podrían afectar a la redistribución del modelo derivado; verificar antes de uso comercial.
- El proceso de entrenamiento excluyó explícitamente validación y test, lo que impide conocer su capacidad de generalización fuera de la distribución de entrenamiento.
- No hay garantía de compatibilidad con vLLM, TGI, llama.cpp u Ollama; el despliegue estándar es transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-l13_abc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Componente del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/internlm/Intern-Decision-0.8B
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

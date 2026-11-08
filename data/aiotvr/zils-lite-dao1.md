# AIOTVR/zils-lite-dao1

## Resumen

Zils-lite-dao1 es un modelo de la familia Zils, publicada por AIOTVR bajo el identificador `zils-lite-dao1`. Se trata de un fine-tune completo (full fine-tune) del modelo padre Qwen, con la torre de lenguaje fusionada tras un proceso LoRA y la torre de visión sin modificar. El modelo se enmarca en el ecosistema Zils (antes conocido como Fez), un proyecto que entrena modelos pequeños de decisión mediante una competición en la red Bittensor (subnet 127). El proyecto Zils se orienta a devolver probabilidades para decisiones binarias, elecciones y puntuaciones, sin generar texto libre.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 0,85B), lo que lo sitúa en la categoría de modelos pequeños orientados a despliegue eficiente. Según la model card, la arquitectura base es Qwen (tag `qwen3_5`), con pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen y texto. El repositorio ocupa 1,7 GB y se distribuye en formato safetensors con licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque: un modelo compacto y multimodal pensado para tareas de decisión y clasificación dentro de un ecosistema de entrenamiento descentralizado. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen (tag `qwen3_5`), con torre de lenguaje y torre de visión |
| Parámetros totales | 852.985.920 (≈0,85B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del modelo padre Qwen fijado por el proyecto, con la torre de lenguaje fusionada tras aplicar LoRA y la torre de visión intacta respecto al modelo original. La arquitectura es, por tanto, un transformer multimodal con pipeline `image-text-to-text`, capaz de procesar entradas combinadas de imagen y texto. El tag `qwen3_5` sugiere una base de la familia Qwen 3.5, aunque no se detalla la variante exacta ni el tamaño del modelo padre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card menciona que el modelo fue "committed by hotkey in `zils-owner.json`", lo que apunta a un proceso de entrenamiento y publicación gestionado dentro de la infraestructura del proyecto Zils/Bittensor. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento multimodal imagen-texto: el pipeline `image-text-to-text` indica capacidad de recibir imágenes junto con texto.
- Generación conversacional: el tag `conversational` sugiere uso en diálogos multi-turno.
- Orientación a decisiones: según la descripción del proyecto Zils, el modelo devuelve probabilidades para decisiones sí/no, elecciones y puntuaciones, en lugar de generar texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Clasificación de solicitudes en aplicaciones: el modelo puede puntuar o clasificar entradas de texto e imagen para enrutar peticiones dentro de un flujo de trabajo, aprovechando su orientación a decisiones.
- Filtrado y detección de problemas: uso como modelo de decisión para marcar contenido problemático o anómalo en pipelines de moderación, según el enfoque descrito por el proyecto Zils.
- Puntuación de coincidencias (scoring de matches): adecuado para tareas de ranking o emparejamiento donde se requiere una puntuación de similitud entre elementos.
- Prototipado rápido en entornos con recursos limitados: con ~0,85B de parámetros y 1,7 GB de pesos, puede desplegarse en hardware modesto para experimentación.
- Evaluación de modelos multimodales pequeños: útil como referencia en investigación sobre fine-tuning completo de modelos Qwen multimodales.
- Integración en competiciones Bittensor: el modelo está etiquetado con `sn127`, lo que lo vincula a la subnet 127 de Bittensor y a su ecosistema de validación y minería.
- Asistencia conversacional con imágenes: gracias al pipeline imagen-texto y al tag conversacional, puede emplearse en diálogos que incorporen capturas o imágenes como contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para pesos; en FP32, unos 3,4 GB. El repo ocupa 1,7 GB, coherente con pesos en FP16/BF16.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 8 GB o más de VRAM.
- Opciones de despliegue: transformers (librería indicada), con posible conversión a GGUF para llama.cpp u Ollama; vLLM y TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Zils-lite-dao1 | ≈0,85B | no disponible | Apache 2.0 | Sí (imagen-texto) | Hugging Face |
| Qwen2.5-VL-3B | ≈3B | no disponible en la información | Apache 2.0 | Sí | Hugging Face |
| SmolVLM-500M | ≈0,5B | no disponible en la información | Apache 2.0 | Sí | Hugging Face |

No se dispone de datos de rendimiento comparativo para Zils-lite-dao1, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de benchmarks, idiomas, contexto ni dataset, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: al ser un modelo generativo de ~0,85B, es propenso a errores factuales y respuestas inconsistentes.
- Sesgos conocidos: no documentados; al derivar de Qwen, puede heredar sesgos del modelo padre y del dataset de fine-tuning.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si soporta castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo padre Qwen y del ecosistema Zils.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere poca validación comunitaria; no se recomienda su uso en producción sin evaluación propia.
- El tag `custom_code` implica que puede requerir código personalizado para cargarse, lo que añade complejidad de integración.

## Enlaces

- Hugging Face: https://huggingface.co/AIOTVR/zils-lite-dao1
- Sitio del proyecto Zils: https://zils.ai/
- Repositorio GitHub de Zils: https://github.com/ooo-hq/zils/tree/main

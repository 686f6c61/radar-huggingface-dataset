# ariacompute/gemma-3n-e4b-it_q8

## Resumen

Gemma-3n-E4B-IT es un modelo de lenguaje multimodal de aproximadamente 4 mil millones de parámetros desarrollado por Google, perteneciente a la familia Gemma 3n. Su backbone de texto emplea una arquitectura híbrida de atención: 28 de las 35 capas utilizan atención lineal con ventana deslizante y esparsidad de activación, mientras que las 7 restantes son capas Laurel de atención completa de bajo rango. Incorpora activación GeGLU, atención por grupos de consultas (GQA) y proyecciones de entrada por capa, con una longitud de contexto nativa de 32 000 tokens. El modelo fue preentrenado sobre corpus web a gran escala y alineado mediante instrucciones y RLHF.

Esta distribución concreta, publicada por Aria Compute, es un paquete cuantizado (aria-quant-bundle) que aplica preprocesado de Hadamard y cuantización por canal de 8 bits. El objetivo es permitir inferencia exclusivamente en CPU en dispositivos con recursos limitados, como teléfonos móviles, placas de desarrollo y sistemas embebidos, sin necesidad de GPU ni conexión a la nube. El bundle pesa aproximadamente 2,0 GB en memoria runtime y está optimizado para el motor de inferencia Aria Engine.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de generación de texto de calidad aceptable en hardware de consumo, gracias a la combinación de una arquitectura eficiente y una cuantización cuidadosa que preserva la fidelidad. Es una opción práctica para desarrolladores que necesitan desplegar asistentes conversacionales, resúmenes o embeddings en entornos sin aceleración GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: 28 capas de atención lineal con ventana deslizante (window 512) y esparsidad de activación + 7 capas Laurel de atención completa de bajo rango; GeGLU, GQA (2 cabezas KV), proyecciones de entrada por capa |
| Parametros totales | ~4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens (nativo) |
| Tipos de cuantizacion | 8-bit por canal con preprocesado de Hadamard (q8); también disponible variante mixta q326_channel (atención 4-bit + FFN ~3-bit) |
| Idiomas soportados | Inglés (principal), chino y más de 30 idiomas adicionales según la model card; el frontmatter de HuggingFace declara en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-engine (formato propietario de Aria Compute; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, Gemma-3n-E4B-IT, fue desarrollado por Google y preentrenado sobre corpus web diversos, incluyendo RedPajama-Data-1T, The Pile y The Stack. El entrenamiento incluyó ajuste por instrucciones y RLHF para alineación. La arquitectura combina atención lineal con ventana deslizante (que limita el coste de la caché KV a un tamaño fijo de 512 tokens por capa) con capas de atención completa de bajo rango (Laurel), lo que permite mantener un contexto largo de 32K con un coste computacional reducido. La activación esparsa en las capas lineales contribuye a la eficiencia en CPU.

La cuantización aplicada por Aria Compute utiliza preprocesado de Hadamard seguido de cuantización uniforme por canal de 8 bits para los pesos de atención (Q/K/V/O) y de las capas FFN (gate/up/down). Las normas RMSNorm y la tabla de embeddings se conservan en FP16. Este esquema no requiere datos de calibración específicos de tarea, lo que simplifica el despliegue. Según el autor, la cuantización por canal de 8 bits es la receta de máxima fidelidad de la línea Aria, aunque los benchmarks formales de calidad están pendientes de auditoría.

## Capacidades

- Generación de texto en inglés y chino, con soporte para más de 30 idiomas adicionales según la documentación del modelo base.
- Seguimiento de instrucciones en tareas conversacionales y de completado de texto.
- Generación de fragmentos de código básicos (no programas completos).
- Obtención de embeddings de texto ligeros para tareas de recuperación y clasificación en el dispositivo.
- Resumen de textos cortos, como notificaciones, mensajes y contenido local.
- Análisis de documentos locales con contexto de hasta 32K tokens, procesando el texto por fragmentos (chunking).
- Inferencia completamente local en CPU, sin conexión a servidores externos.
- El modelo base original es multimodal (imagen, audio y texto), pero este bundle cuantizado solo incluye el backbone de texto; el pipeline de codificación de imagen/audio está pendiente de auditoría.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar diálogos multi-turno con contexto de hasta 32K tokens, gracias a la caché KV compacta de la atención híbrida. Es adecuado para aplicaciones de chat en móviles de gama media sin conexión.
- Completado de texto en tiempo real: para editores de código o notas en dispositivos móviles, el modelo genera sugerencias de continuación de frases o fragmentos de código cortos con baja latencia en CPU.
- Resumen de notificaciones y mensajes: el modelo puede condensar alertas, correos o mensajes locales en resúmenes breves, útil en wearables o dispositivos IoT con poca memoria.
- Recuperación y clasificación de documentos locales: usando los embeddings generados por el modelo, se pueden indexar y buscar documentos en el dispositivo sin enviar datos a la nube, apropiado para aplicaciones de privacidad.
- Análisis de documentos con contexto largo: con 32K tokens de ventana, el modelo puede procesar informes o artículos extensos por fragmentos y extraer información relevante, aunque no es adecuado para razonamiento matemático formal.
- Asistente de instrucciones para IoT: el modelo puede interpretar comandos de voz o texto en inglés y chino para controlar dispositivos domésticos inteligentes, ejecutándose en una Raspberry Pi o similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la información disponible. La model card incluye una entrada en el modelo-index con la tarea "Generation Consistency (vs FP16, method reference)" cuyo valor es "awaiting gen_quant_eval audit" y está marcada como no verificada. No hay datos numéricos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor declara que la cuantización de 8 bits por canal es "casi sin pérdidas" en comparación con FP16, pero esta afirmación no está respaldada por mediciones públicas.

## Requisitos de hardware

- Memoria runtime estimada: ~2,0 GB (desglose: ~1,95 GB de pesos cuantizados mapeados en memoria, ~80 MB de caché KV, ~30 MB de overhead del runtime y ~60 MB de metadatos por canal) a 4K de contexto.
- Dispositivos objetivo: teléfonos inteligentes de gama alta (8 GB RAM) y gama media (4-6 GB), Raspberry Pi 5 y otras SBC con 4-8 GB, y pasarelas IoT con al menos 2 GB. No es viable en dispositivos con menos de 2 GB de RAM.
- No requiere GPU: la inferencia se ejecuta exclusivamente en CPU.
- Opciones de despliegue: motor Aria Engine (runtime propietario de Aria Compute), descargable desde el panel de Aria Compute. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para este bundle cuantizado. Como referencia estructural, se puede comparar con otros modelos de ~4B parámetros:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3n-E4B-IT (base) | ~4B | 32K | Apache 2.0 | Safetensors (original) | Multimodal, atención híbrida |
| Gemma-3-4B (base) | ~4B | 32K | Gemma Terms of Use | Safetensors | Denso, atención completa |
| Qwen2.5-4B | ~4B | 32K | Apache 2.0 | Safetensors, GGUF | Denso, atención completa |
| Llama-3.2-3B | ~3B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Denso, atención completa |

La comparativa se limita a características estructurales; no hay benchmarks públicos que permitan comparar el rendimiento de este bundle cuantizado con las alternativas.

## Limitaciones y advertencias

- El bundle cuantizado solo incluye el backbone de texto; las capacidades multimodales (imagen y audio) del modelo base no están disponibles en esta distribución.
- No es adecuado para generación de texto creativo largo (más de 2 000 tokens por generación), demostración de teoremas matemáticos o síntesis de programas completos.
- La calidad de generación está pendiente de auditoría formal (gen_quant_eval); aunque el autor afirma que la cuantización de 8 bits es casi sin pérdidas, no hay datos verificados que lo confirmen.
- El modelo puede presentar sesgos y alucinaciones inherentes a su tamaño (~4B parámetros) y a los datos de entrenamiento; no debe usarse en sistemas de decisión críticos sin supervisión humana.
- No está diseñado para inferencia por lotes (batch) ni para aceleración por GPU; su uso en producción con altos volúmenes de peticiones no es recomendable.
- La licencia Apache 2.0 permite uso comercial, pero el formato de pesos propietario de Aria Engine puede limitar la portabilidad a otros entornos de inferencia.
- El contexto de 32K tokens es nativo, pero la caché KV se escala solo en las 7 capas de atención completa; en la práctica, el rendimiento puede degradarse con contextos muy largos en dispositivos de baja memoria.

## Enlaces

- [HuggingFace: ariacompute/gemma-3n-e4b-it_q8](https://huggingface.co/ariacompute/gemma-3n-e4b-it_q8)
- [Modelo base: google/gemma-3n-e4b-it](https://huggingface.co/google/gemma-3n-e4b-it)
- [Repositorio original de Gemma 3n (GitHub)](https://github.com/google-gemma/gemma-3n)
- [Paper técnico de Gemma 3n (arXiv)](https://arxiv.org/abs/2506.16392)
- [Panel de modelos de Aria Compute](https://ariacompute.com/dashboard/models)
- [Aria Engine](https://ariacompute.com)
- [Repositorio de Aria Compute en GitHub](https://github.com/ariacompute/model/tree/main/gemma)
- [Documentación de Gemma 3n de Google AI for Developers](https://ai.google.dev/gemma/docs/gemma-3n)

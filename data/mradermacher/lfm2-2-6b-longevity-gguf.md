# mradermacher/LFM2-2.6B-Longevity-GGUF

## Resumen

LFM2-2.6B-Longevity es un modelo de lenguaje compacto de 2.600 millones de parámetros desarrollado por Liquid AI, una empresa especializada en arquitecturas eficientes para despliegue en dispositivos. Este modelo pertenece a la segunda generación de Liquid Foundation Models (LFM2), que según el fabricante ofrece un rendimiento de inferencia significativamente superior a alternativas como Qwen3 y Gemma 3 en CPU, con una velocidad de decode y prefill hasta un 200% mayor. La variante "Longevity" está pensada para ciclos de vida prolongados en entornos de producción, y la versión aquí descrita es una cuantización GGUF realizada por mradermacher, que facilita su ejecución en hardware modesto.

El modelo base está disponible en HuggingFace bajo la licencia lfm1.0, y la cuantización GGUF permite su uso con herramientas como llama.cpp, Ollama o LM Studio. Con solo 2,6B de parámetros, es adecuado para tareas de generación de texto, razonamiento básico y asistencia conversacional en inglés, con un consumo de recursos reducido. Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en dispositivos edge, móviles o CPUs sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (según Liquid AI, sin más detalles) |
| Parametros totales | 2.569.272.320 (2,57B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (otra, no estándar) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Según el blog de Liquid AI, LFM2 emplea una arquitectura híbrida que combina mecanismos de atención con otras técnicas para optimizar la eficiencia en CPU, pero no se especifican los componentes exactos (por ejemplo, si incluye capas de tipo SSM o atención lineal). Tampoco se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas de alineación como RLHF o DPO. El modelo base es LiquidAI/LFM2-2.6B-Longevity, y la cuantización GGUF ha sido generada por mradermacher sin modificar los pesos originales más allá de la reducción de precisión.

## Capacidades

- Generación de texto en inglés: el modelo puede producir texto coherente y continuar conversaciones o completar fragmentos.
- Razonamiento básico: al ser un modelo de 2,6B, es capaz de resolver tareas sencillas de lógica y comprensión, aunque con limitaciones frente a modelos más grandes.
- Asistencia conversacional: puede mantener diálogos multi-turno en inglés, aunque no se especifica si soporta system prompts complejos o instrucciones estructuradas.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en esta variante específica.
- No se ha confirmado capacidad de visión, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue en dispositivos edge: gracias a su tamaño reducido y a las cuantizaciones GGUF, puede ejecutarse en Raspberry Pi, teléfonos móviles o mini-PCs para tareas de generación de texto local sin conexión.
- Chatbots de atención al cliente en inglés: integrado en un servidor con llama.cpp o Ollama, puede gestionar consultas frecuentes y preguntas frecuentes con baja latencia en CPU.
- Asistente de escritura en inglés: para redactar correos, resúmenes o borradores en entornos donde no se requiere un modelo de gran tamaño.
- Clasificación y extracción de información: puede utilizarse para etiquetar textos, extraer entidades o resumir documentos en inglés, siempre que las tareas sean simples.
- Prototipado rápido: los desarrolladores pueden probar ideas de aplicaciones de IA generativa sin necesidad de GPUs caras, usando las versiones Q4_K_M o Q8_0.
- Educación y aprendizaje: como modelo de ejemplo para estudiar técnicas de cuantización y despliegue de LLMs en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo o su variante cuantizada. Se recomienda consultar el blog de Liquid AI o el technical report para posibles evaluaciones, pero no se incluyen aquí por falta de datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, se necesitan aproximadamente 1,5-2 GB de RAM/VRAM para la cuantización Q4_K_M (1,7 GB) y hasta 5,5 GB para la versión f16 (5,2 GB). Con Q2_K (1,1 GB) se puede operar con menos de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutar las cuantizaciones más pequeñas. Para las versiones Q6_K o Q8_0 se recomienda 4 GB o más.
- En CPU: el modelo está optimizado para CPU según Liquid AI, por lo que puede ejecutarse en procesadores modernos sin GPU, con mayor latencia pero funcional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado cifras concretas. En una CPU moderna, se esperan decenas de tokens por segundo con cuantizaciones Q4, pero depende del hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para este modelo. Como referencia de tamaño, se puede comparar con Qwen2.5-1.5B o Gemma-2-2.6B, pero no hay información sobre cómo se comporta LFM2-2.6B-Longevity frente a ellos en tareas estándar. La licencia lfm1.0 es restrictiva y puede limitar el uso comercial, a diferencia de otras licencias más permisivas como Apache 2.0. No se puede establecer una comparativa objetiva sin datos de benchmarks.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés, por lo que no es adecuado para tareas en castellano u otros idiomas.
- Licencia lfm1.0: es una licencia personalizada que puede imponer restricciones al uso comercial o a la redistribución. Se debe revisar el texto completo de la licencia antes de usar el modelo en producción.
- Alucinaciones: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Contexto limitado: no se ha especificado la longitud de contexto, pero por el tamaño del modelo es probable que sea corta (4K-8K tokens), lo que limita el manejo de documentos largos.
- Cuantización: las versiones de menor precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad de las respuestas. Se recomienda usar Q4_K_M o superior para tareas serias.
- Sin soporte de herramientas: no se ha confirmado que el modelo soporte function calling, lo que limita su uso en agentes autónomos o pipelines que requieran llamadas a APIs.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/LFM2-2.6B-Longevity-GGUF
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- Blog de Liquid AI sobre LFM2-2.6B: https://www.liquid.ai/blog/introducing-lfm2-2-6b-redefining-efficiency-in-language-models
- Blog de Liquid AI sobre la serie LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Technical report de LFM2 (arXiv): https://arxiv.org/html/2511.23404v1

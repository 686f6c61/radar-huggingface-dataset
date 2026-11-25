# BH-Language-AI/bh-vision-1-4b-v2-gguf

## Resumen

BH-Vision-1-4B-v2-GGUF es la conversión al formato GGUF del modelo multimodal BH-Vision-1-4B-v2, desarrollado por BH-Language-AI. Se trata de un modelo de visión-lenguaje (image-text-to-text) especializado en bosnio, orientado a tareas de OCR y comprensión de imágenes con salida textual en dicho idioma. La versión GGUF está pensada para inferencia en CPU y dispositivos edge mediante llama.cpp, reduciendo los requisitos de hardware frente al modelo original en precisión completa.

El modelo deriva de una fusión entre el conocido Qwen2.5-VL-3B y un adaptador v2 entrenado con rango LoRA 16 y learning rate 1e-5, lo que da como resultado un total de 3.085.938.688 parámetros (aproximadamente 3,1 mil millones). El repositorio ocupa 3,3 GB e incluye dos artefactos: el modelo de texto cuantizado en Q4_K_M (1,8 GB) y el proyector visual en f16 sin cuantizar (1,3 GB).

Su relevancia radica en que cubre un nicho poco atendido: el procesamiento multimodal en bosnio con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Al estar empaquetado en GGUF, puede ejecutarse en equipos sin GPU dedicada, algo poco habitual en modelos de visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-VL-3B + adaptador v2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de texto); f16 (proyector visual, no cuantizar) |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de texto y mmproj separados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-3B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje, más un adaptador v2 entrenado mediante LoRA con rango 16 y learning rate 1e-5 sobre el modelo fusionado. El resultado es un modelo de 3,1 mil millones de parámetros que procesa imágenes y genera texto en bosnio. El repositorio GGUF separa el modelo de texto (cuantizado en Q4_K_M) del proyector visual (mmproj en f16), siguiendo la convención de llama.cpp para modelos multimodales.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica el proceso de fusión y el ajuste LoRA, así como que el modelo ha sido validado mediante un smoke test con `llama-mtmd-cli` en CPU, respondiendo correctamente a un gráfico de prueba. La cuantización Q4_K_M introduce una pérdida mínima según el autor: 93,5 % en validación y 52,9 % en held-out, tomando como referencia la versión fp16.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text) en bosnio.
- OCR: extracción de texto presente en imágenes, con salida en bosnio.
- Comprensión de gráficos y diagramas (validado con un chart de prueba).
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al bosnio según la model card.
- Modo thinking, visión adicional o audio: no disponible.

## Casos de uso

- Digitalización de documentos en bosnio: el modelo puede extraer texto de escaneos y fotografías mediante OCR, generando la transcripción directamente en bosnio, lo que resulta útil para archivos y administraciones públicas de Bosnia y Herzegovina.
- Procesamiento en CPU y edge: gracias a la cuantización Q4_K_M (1,8 GB) y al proyector f16 (1,3 GB), puede desplegarse en portátiles o servidores sin GPU, cubriendo casos de digitalización en oficinas con hardware modesto.
- Accesibilidad de contenido visual: descripción de imágenes y gráficos en bosnio para usuarios con discapacidad visual o para la generación de textos alternativos localizados.
- Análisis de gráficos e infografías: el smoke test confirma la respuesta correcta a un chart, por lo que puede emplearse para extraer conclusiones de visualizaciones de datos en informes en bosnio.
- Atención al cliente con soporte visual: un usuario puede enviar una captura o foto de un producto o recibo y el modelo responde en bosnio, integrándose en un flujo conversacional.
- Investigación lingüística y preservación del idioma: al ser uno de los pocos modelos multimodales con licencia permisiva centrados en bosnio, sirve como base para experimentos de NLP y visión en lenguas eslavas del sur.
- Prototipado rápido en llama.cpp: la separación entre modelo de texto y mmproj permite iterar con `llama-mtmd-cli` sin infraestructura de GPU, adecuado para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas internas de exactitud tras la cuantización:

| Metrica | Valor |
|---|---|
| Exactitud en validacion (Q4_K_M, referencia fp16) | 93,5 % |
| Exactitud en held-out (Q4_K_M, referencia fp16) | 52,9 % |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,1 GB en total para el conjunto Q4_K_M (1,8 GB) más mmproj f16 (1,3 GB); suficiente para ejecución en CPU con RAM convencional.
- GPU recomendadas: no requiere GPU; en caso de usarse, cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) puede alojar el conjunto completo.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM; también en CPU pura.
- Opciones de despliegue: llama.cpp (recomendado, con `llama-mtmd-cli` y `--mmproj`); compatible con endpoints según la etiqueta `endpoints_compatible`. Otros runners (vLLM, TGI, Ollama) no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BH-Vision-1-4B-v2-GGUF | 3,09 B | no disponible | bosnio | Apache 2.0 | GGUF |
| Qwen2.5-VL-3B (base) | ~3 B | no disponible | multilingue | no disponible en esta ficha | safetensors |
| Modelos multimodales pequenos tipo PaliGemma | ~3 B | no disponible | multilingue | no disponible en esta ficha | safetensors |

La comparativa detallada con alternativas de la misma categoría no está disponible en la información proporcionada; el modelo base Qwen2.5-VL-3B es el referente más directo, del que este deriva mediante fusión y ajuste LoRA.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en bosnio; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- La exactitud en held-out reportada (52,9 %) es notablemente inferior a la de validación (93,5 %), lo que sugiere riesgo de sobreajuste y menor fiabilidad en datos no vistos.
- Riesgo de alucinación inherente a los modelos de 3 B de parámetros, especialmente en OCR de documentos con baja calidad de imagen.
- El proyector visual (mmproj) no debe cuantizarse según el autor; hacerlo puede degradar la calidad de la percepción visual.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos éticos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-VL-3B del que deriva.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con entradas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-4b-v2-gguf
- Modelo base (no GGUF): https://huggingface.co/BH-Language-AI/bh-vision-1-4b-v2
- Documentación de llama.cpp (mtmd-cli): https://github.com/ggml-org/llama.cpp

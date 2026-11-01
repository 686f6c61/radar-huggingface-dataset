# nchapman/Huihui-Qwen3.5-2B-abliterated-W4A16-GPTQ

## Resumen

Huihui-Qwen3.5-2B-abliterated-W4A16-GPTQ es una cuantización INT4 (W4A16) en formato GPTQ del modelo huihui-ai/Huihui-Qwen3.5-2B-abliterated, a su vez una variante "abliterated" (con los mecanismos de rechazo atenuados mediante edición de pesos) del Qwen3.5-2B de Alibaba. La publica el usuario nchapman, que actúa únicamente como cuantizador: no entrena ni modifica el comportamiento del modelo base, solo reduce su huella de memoria a aproximadamente una cuarta parte manteniendo los pesos en BF16 para las partes sensibles (torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head`).

El modelo es multimodal de tipo image-text-to-text, con 2.213.241.664 parámetros totales y un repositorio de 2,5 GB. Está empaquetado con `compressed-tensors` y pensado para servirse con vLLM, lo que lo hace atractivo para desplegar un modelo visual pequeño en GPUs de consumo o en entornos con VRAM limitada.

Su relevancia actual es doble: por un lado, demuestra el flujo de cuantización W4A16 sobre arquitecturas híbridas con atención lineal y torre de visión; por otro, la variante abliterated elimina las capas de rechazo del modelo original, lo que tiene implicaciones directas para su uso en producción y debe evaluarse con cuidado. La licencia es Apache 2.0 y el modelo se distribuye en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal y cabeza MTP; familia Qwen3.5 |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 GPTQ (compressed-tensors); torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ / compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5, con arquitectura transformer multimodal que procesa imagen y texto. La model card del cuantizador menciona explícitamente una torre de visión, una cabeza MTP (multi-token prediction), proyecciones de atención lineal y un `lm_head`, lo que sugiere una arquitectura híbrida con componentes de atención lineal además de la atención estándar. No se dispone de detalles sobre el número de capas, dimensión oculta o configuración exacta de la atención.

Esta versión no entrena el modelo: aplica cuantización GPTQ de 4 bits con activaciones en 16 bits (W4A16) sobre los pesos del modelo base. La calibración se realizó con 999 muestras extraídas de nvidia/Nemotron-Cascade-2-SFT-Data respetando las proporciones del propio dataset, con las filas exactas fijadas en el dataset nchapman/warp-3090-quant-lab-frozen-data. El artefacto incluye una plantilla de chat propia (froggeric Qwen-Fixed-Chat-Templates v22.5) como única plantilla disponible, y una `generation_config.json` con los valores por defecto del modo thinking del modelo base: temperatura 1.0, top_p 0.95 y top_k 20. No hay información sobre el proceso de entrenamiento original del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat multi-turno.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Modo thinking: la configuración de muestreo por defecto corresponde a los valores de thinking del modelo base.
- La arquitectura incluye una cabeza MTP (multi-token prediction), aunque no se detalla su uso en inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente visual ligero en local: con 2,2 mil millones de parámetros en INT4, el modelo cabe en GPUs de consumo y permite responder preguntas sobre imágenes capturadas por el usuario sin enviar datos a la nube.
- Descripción y etiquetado de imágenes en lotes: se puede servir con vLLM para procesar catálogos de imágenes y generar descripciones o metadatos de forma masiva con bajo coste de VRAM.
- Prototipado de aplicaciones multimodales: al ser un modelo pequeño y cuantizado, sirve para validar pipelines de image-text-to-text antes de escalar a modelos mayores.
- Investigación sobre cuantización: el artefacto documenta una receta reproducible (calibración con Nemotron-Cascade-2-SFT-Data, tooling en warp-3090-model-lab) útil para estudiar el impacto de W4A16 en arquitecturas con atención lineal y torre de visión.
- Evaluación de seguridad y alineación: al ser una variante abliterated, es un caso de estudio para medir cómo la edición de pesos afecta a los rechazos y a la calidad de las respuestas.
- Chat conversacional con contexto visual en entornos con VRAM limitada: la cuantización INT4 permite desplegar el modelo junto con otros servicios en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB; con overhead de runtime y caché KV, se puede estimar un consumo en torno a 3-4 GB en INT4, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican en la información disponible; el formato GPTQ con `compressed-tensors` está orientado a vLLM.
- GPU de consumo: por tamaño, es plausible que quepa en GPUs consumer con 8 GB o más de VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: vLLM es la vía documentada (`LLM(model="nchapman/Huihui-Qwen3.5-2B-abliterated-W4A16-GPTQ")`); también es compatible con transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-2B-abliterated-W4A16-GPTQ | 2,21 B | no disponible | INT4 W4A16 GPTQ | Apache 2.0 | HuggingFace (33 descargas) |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated (base) | 2,21 B | no disponible | BF16 | Apache 2.0 | HuggingFace |
| Qwen3.5-2B (original) | 2 B aprox. | no disponible | BF16 | Apache 2.0 | HuggingFace |

La comparativa se limita al modelo base y al original de la familia, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La variante abliterated elimina o atenúa los mecanismos de rechazo del modelo original; puede producir contenido que el modelo base rechazaría, con implicaciones legales y de seguridad en producción.
- Riesgo de alucinación inherente a un modelo de 2 B de parámetros; no se han publicado evaluaciones de fiabilidad.
- No se documentan sesgos conocidos ni idiomas soportados; la cobertura lingüística es incierta.
- La plantilla de chat incluida es la única disponible en el artefacto; usar otra puede degradar las respuestas.
- Los valores de muestreo por defecto (temperatura 1.0, top_p 0.95, top_k 20) están pensados para modo thinking; en otros modos conviene sobrescribirlos.
- La cuantización INT4 puede introducir degradación de calidad respecto al modelo base, especialmente en tareas de precisión; no se han publicado métricas comparativas.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated debe revisarse según la jurisdicción y el caso de uso.
- El modelo tiene solo 33 descargas y 0 likes; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Huihui-Qwen3.5-2B-abliterated-W4A16-GPTQ
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas de calibración fijadas: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantilla de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Repositorio de tooling: https://github.com/nchapman/warp-3090-model-lab

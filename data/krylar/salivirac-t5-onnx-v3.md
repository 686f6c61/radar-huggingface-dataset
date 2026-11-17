# Krylar/salivirac-t5-onnx-v3

## Resumen

SaliVirac T5-small (ONNX, v3) es un modelo de traducción automática desarrollado por Krylar (identidad asociada a una tesis de grado de BSCS en la Facultad de Tecnología de la Información y las Comunicaciones de la Catanduanes State University). Se trata de un fine-tuning de `google-t5/t5-small` para la traducción bidireccional entre viracnon (código ISO `bik`, una lengua bisaya de Filipinas) y filipino/tagalo (`tl`), empaquetado en formato ONNX para su ejecución en el navegador mediante Transformers.js.

El modelo parte de la arquitectura T5-small, un transformer encoder-decoder con unos 60 millones de parámetros y una ventana de contexto de 512 tokens. El ajuste se realizó sobre 2.497 pares de frases, una cantidad modesta que refleja el carácter de recurso lingüístico de bajo uso: no existe una tradición consolidada de corpus paralelos para viracnon, por lo que este modelo representa uno de los pocos artefactos públicos de traducción para ese par de lenguas.

Su relevancia práctica es doble: por un lado, ofrece una vía de digitalización y preservación lingüística para una lengua regional filipina con escasa representación en los sistemas de traducción comerciales; por otro, su conversión a ONNX cuantizado en 8 bits permite desplegarlo íntegramente en el cliente (navegador), sin coste de servidor ni envío de texto a terceros. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | ~60 millones (heredados de google-t5/t5-small; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (valor por defecto de T5-small; no especificado en la model card) |
| Tipos de cuantizacion | ONNX float32 y ONNX 8-bit (`*_quantized.onnx`) |
| Idiomas soportados | viracnon (`bik`) y filipino/tagalo (`tl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (incluye variantes cuantizadas de 8 bits) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de `google-t5/t5-small`, un transformer encoder-decoder con atención multi-cabeza estándar, normalización de capas y embeddings relativos de posición. T5 se preentrenó originalmente con un objetivo span-corruption multilingüe (C4), y este ajuste lo especializa en una tarea text2text de traducción con prefijos de tarea explícitos: `translate Viracnon to Tagalog: ` y `translate Tagalog to Viracnon: `.

El conjunto de entrenamiento consta de 2.497 pares de frases, según la model card. No se documenta la composición del corpus, la procedencia de las frases, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de aumento de datos o validación cruzada. Tampoco se indica si hubo etapas de RLHF o DPO, algo esperable en un modelo de este tamaño y propósito. La innovación técnica destacable no está en la arquitectura, sino en el empaquetado: la conversión a ONNX con variantes cuantizadas de 8 bits permite inferencia en el navegador con Transformers.js, lo que elimina la dependencia de infraestructura servidor y reduce el peso del artefacto a aproximadamente 0,5 GB en el repositorio.

## Capacidades

- Traducción bidireccional entre viracnon y filipino/tagalo mediante prefijos de tarea explícitos.
- Generación de texto text2text genérica, heredada de la arquitectura T5, aunque no validada para otras tareas.
- Ejecución en navegador mediante Transformers.js y ONNX Runtime Web, con variantes cuantizadas de 8 bits.
- Inferencia local sin conexión a servidores externos, adecuada para entornos con requisitos de privacidad.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente a los dos idiomas del ajuste; el vocabulario SentencePiece de T5-small cubre más lenguas, pero el modelo no está entrenado para traducir a otras.

## Casos de uso

- Traducción de documentación administrativa local: el modelo puede convertir avisos, formularios y comunicados municipales entre viracnon y filipino, facilitando el acceso de hablantes de viracnon a servicios públicos redactados en tagalo y viceversa. Su contexto de 512 tokens es suficiente para párrafos y secciones cortas.
- Preservación y digitalización lingüística: investigadores y comunidades pueden usar el modelo para transcribir y traducir corpus orales o escritos en viracnon, generando pares paralelos que alimenten futuros recursos lingüísticos. La licencia Apache 2.0 permite redistribuir las traducciones derivadas.
- Aplicación web educativa sin backend: al ejecutarse en el navegador con Transformers.js, puede integrarse en una página estática o PWA para que estudiantes de Catanduanes practiquen traducción sin depender de una API externa ni exponer sus textos.
- Asistencia a traductores humanos: como borrador inicial en flujos de traducción de textos breves (noticias locales, redes sociales, correspondencia), reduciendo el tiempo de primera pasada antes de la revisión humana.
- Chatbot de atención ciudadana en kioscos o dispositivos de bajo recursos: la variante cuantizada de 8 bits permite desplegar traducción local en hardware modesto, útil en oficinas con conectividad limitada.
- Investigación en traducción de lenguas de bajos recursos: sirve como línea base reproducible para comparar técnicas de aumento de datos, fine-tuning y cuantización en pares lingüísticos con corpus pequeños, dado que el modelo base y la receta son públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, chrF, METEOR ni comparaciones cuantitativas con otros sistemas de traducción para viracnon-tagalo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los ~60 millones de parámetros de T5-small; la variante cuantizada de 8 bits reduce el peso a aproximadamente 60-80 MB de pesos, con overhead de runtime.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (GTX 1050, RTX 3050, etc.).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime (Web, CPU, CUDA), y potencialmente llama.cpp no aplica (no es un modelo GGUF); vLLM y TGI no soportan este formato de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En navegador, la latencia dependerá del dispositivo y del tamaño del texto; con 512 tokens de contexto y 60 millones de parámetros, se espera un rendimiento interactivo en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Krylar/salivirac-t5-onnx-v3 | ~60 M | 512 | bik, tl | Apache 2.0 | ONNX | Hugging Face, 0 descargas |
| google-t5/t5-small | ~60 M | 512 | Multilingüe (entrenamiento C4) | Apache 2.0 | Safetensors, PyTorch | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt-tl-en | ~77 M | 512 | tl, en | CC-BY 4.0 | PyTorch, Safetensors | Hugging Face, muy usado |
| Facebook NLLB-200-distilled-600M | ~600 M | 512 | 200 lenguas (incluye tl, no bik) | CC-BY-NC 4.0 | PyTorch, Safetensors | Hugging Face, ampliamente usado |

La comparativa directa es limitada: no existen modelos públicos comparables específicos para viracnon. Frente a t5-small, este modelo añade especialización y empaquetado ONNX, pero sacrifica generalidad. Frente a NLLB-200, carece de cobertura multilingüe amplia, pero es mucho más pequeño y ligero para despliegue en navegador. La licencia Apache 2.0 es más permisiva que la CC-BY-NC de NLLB para uso comercial.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (2.497 pares), lo que limita la cobertura léxica y la robustez ante dominios no vistos; es probable un rendimiento bajo en textos técnicos, literarios o con ortografía no normalizada.
- Riesgo elevado de alucinación y de traducciones literales o incorrectas en frases largas o ambiguas, dado el tamaño del modelo y del corpus.
- Contexto máximo de 512 tokens; textos más largos requieren segmentación, con posible pérdida de coherencia entre segmentos.
- Cobertura lingüística restringida a viracnon y tagalo; no debe usarse para otras lenguas ni como traductor general.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados y de una comunidad concreta, puede reflejar sesgos de género, registro o variantes dialectales del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte; la responsabilidad de validación recae en el integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa por parte de la comunidad.
- No hay información sobre el proceso de anotación, posibles errores de alineación de frases ni evaluación humana; se recomienda validación con hablantes nativos antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krylar/salivirac-t5-onnx-v3
- Modelo base: https://huggingface.co/google-t5/t5-small
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
- Catanduanes State University: https://catanduanesstateu.edu.ph/

# alivecat/MNN-Pocket-0.3B-Dec-MNN

## Resumen
MNN-Pocket-0.3B-Dec-MNN es una conversión al formato MNN del modelo taobao-mnn/MNN-Pocket-0.3B-Dec, un modelo de decisión de 0,3 mil millones de parámetros que no funciona como un chat autoregresivo, sino como un clasificador de decisión de un solo paso hacia delante. El autor de la conversión es alivecat, y el modelo base procede del ecosistema Taobao MNN. Resuelve tareas de elección entre opciones (`choice`), de clasificación binaria de utilidad (`noul`) y de puntuación (`score`) sobre una entrada estructurada de cinco tensores, devolviendo logits.

La relevancia de esta conversión es práctica: ofrece tres variantes cuantizadas listas para cargar directamente con MNN (FP16 completa, FP16 con embeddings Q8 y W8 con embeddings Q8), con tamaños de 608,93 MB, 553,88 MB y 341,25 MB respectivamente, lo que permite desplegar el modelo en CPU y en dispositivos con recursos limitados sin necesidad de un runtime de transformers. El contexto declarado alcanza los 32K tokens, aunque la inferencia a esa longitud es intensiva en memoria por el uso de una máscara de atención densa.

El modelo solo soporta inglés y chino, se distribuye bajo licencia Apache-2.0 y está pensado para integrarse en pipelines de decisión y enrutamiento, no para generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión de un solo paso (no autoregresivo) con cabeza pointer; grafo MNN |
| Parámetros totales | 0,3B (según denominación del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (inferencia completa intensiva en memoria por máscara de atención densa) |
| Tipos de cuantización | FP16, W8 (group size 64), embeddings Q8 (group size 32) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mnn` (MNN), con tokenizer.json e inference_config.json |
| Tamaño de los artefactos | 608,93 MB (FP16), 553,88 MB (FP16 + Q8 embeddings), 341,25 MB (W8 + Q8 embeddings) |
| Precisión de la cabeza pointer | FP16 en las dos variantes FP16; FP32 en la variante W8 |
| Temperatura calibrada | 1,1111832893308136 (sobrescribible con `--temperature`) |
| Runtime de referencia | CPU con MNN Normal precision y Normal memory |
| Versión de MNN usada en conversión | 3.6.2 |
| Revisión del modelo origen | dfbe0aed3abd4caed175b883a4b462ed35184fad |

## Arquitectura y entrenamiento
El modelo base es un modelo de decisión de un solo forward pass, no un transformer generativo autoregresivo. La conversión mantiene la estructura del checkpoint original: cinco tensores de entrada y una salida `logits`, con ramas de pregunta independientes y una cabeza pointer que selecciona o puntúa opciones. Los pesos LoRA del modelo origen están fusionados en los artefactos `.mnn`. La codificación de entrada, el escapado de tokens de control y la semántica de resultados siguen exactamente el checkpoint original, según indica la model card.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión se realizó con MNN 3.6.2 y no introduce cambios en el tokenizador: se incluye el `tokenizer.json` original. La innovación técnica destacable es la propia naturaleza no autoregresiva del modelo, que permite obtener una decisión en una sola pasada, y la disponibilidad de tres niveles de cuantización con impactos distintos en las probabilidades finales.

## Capacidades
- Respuesta a preguntas de tipo `choice`: selección entre un conjunto de opciones discretas.
- Preguntas de tipo `noul`: clasificación binaria de utilidad o validez de una propuesta.
- Preguntas de tipo `score`: puntuación de opciones o candidatos.
- Decisión en un único forward pass, sin generación token a token.
- Procesamiento de entradas estructuradas definidas por `inference_config.json` (cinco tensores de entrada).
- Soporte bilingüe inglés-chino.
- Ejecución en CPU mediante MNN, sin dependencia de GPUs.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento multi-turno, al no ser un modelo conversacional.
- No dispone de visión, audio ni modo thinking.

## Casos de uso
- Enrutamiento de consultas en un pipeline de atención al cliente: el modelo puede decidir, en una sola pasada, a qué categoría o agente corresponde una consulta entrante entre un conjunto cerrado de opciones, usando la pregunta de tipo `choice` y aprovechando el contexto de hasta 32K tokens para incluir historial o documentación de referencia.
- Filtrado de candidatos en sistemas de recuperación: con la pregunta `score`, se puntúan pasajes o respuestas candidatas para reordenarlas antes de pasarlas a un modelo generativo mayor, reduciendo coste computacional.
- Clasificación binaria de viabilidad en pipelines de datos: la pregunta `noul` permite descartar entradas no utilizables o propuestas inválidas antes de procesos costosos.
- Moderación o validación de contenido estructurado: decisión rápida sobre si un texto cumple un criterio definido, ejecutable en CPU en servidores sin GPU.
- Despliegue en dispositivos de borde: la variante W8 de 341,25 MB permite integrar el modelo en entornos con memoria limitada mediante MNN, por ejemplo aplicaciones móviles o embebidas.
- Preetiquetado en anotación de datos: el modelo puede generar decisiones preliminares sobre grandes lotes de ejemplos, que luego revisan anotadores humanos, gracias a su bajo coste por inferencia.
- Selección de herramientas o rutas en un orquestador: dado un conjunto de acciones posibles, la pregunta `choice` puede determinar la acción más adecuada antes de invocar un componente externo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Inferencia en CPU con MNN en precisión Normal; no se documentan requisitos de VRAM porque el runner de referencia no usa GPU.
- Tamaño en disco/memoria de los pesos: 608,93 MB (FP16), 553,88 MB (FP16 + Q8 embeddings) y 341,25 MB (W8 + Q8 embeddings).
- La variante W8 de 341,25 MB es la más adecuada para entornos con memoria ajustada; la FP16 completa requiere aproximadamente el doble de espacio para los pesos.
- La inferencia con contexto completo de 32K es intensiva en memoria debido a la máscara de atención densa; se recomienda reservar memoria adicional proporcional a la longitud de entrada.
- Despliegue mediante el runtime MNN (librería `mnn`); se incluye `inference_mnn.py` como runner de referencia y `requirements.txt`.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión no autoregresivos en formato MNN) con datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias
- No es un modelo de chat ni de generación de texto: usarlo como modelo conversacional produciría resultados incorrectos.
- Las variantes cuantizadas pueden alterar las probabilidades y la decisión final respecto al checkpoint FP16; la model card lo advierte explícitamente.
- La inferencia con la ventana completa de 32K es intensiva en memoria por la máscara de atención densa, lo que puede provocar fallos por falta de memoria en equipos modestos.
- Solo soporta inglés y chino; no hay cobertura documentada de otros idiomas.
- No se dispone de información sobre sesgos, tasas de alucinación o evaluación de robustez del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el fichero NOTICE incluidos en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada de la conversión.
- La temperatura calibrada (1,1111832893308136) está pensada para el checkpoint original; cambiarla altera el comportamiento de decisión.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alivecat/MNN-Pocket-0.3B-Dec-MNN
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Ficheros del repositorio: decision-fp16.mnn, decision-fp16-q8-embedding.mnn, decision-w8-q8-embedding.mnn, tokenizer.json, inference_config.json, inference_mnn.py, requirements.txt, example_request.json, LICENSE, NOTICE (todos en la raíz del repositorio de Hugging Face)

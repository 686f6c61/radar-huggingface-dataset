# barflyman/granite-4.0-350m-ONNX-web

## Resumen

Granite-4.0-350M-ONNX-web es una conversión a ONNX del modelo instruct Granite-4.0-350M de IBM, empaquetada específicamente para su ejecución en el navegador mediante Transformers.js y WebGPU. El modelo original, publicado por el equipo Granite de IBM el 28 de octubre de 2025, es un modelo denso de 350 millones de parámetros afinado a partir de Granite-4.0-350M-Base mediante una combinación de ajuste supervisado, aprendizaje por refuerzo y fusión de modelos. Esta versión concreta, publicada por el usuario barflyman, traslada esos pesos al formato ONNX para que puedan ejecutarse del lado del cliente sin infraestructura de servidor.

La relevancia de esta ficha reside en su naturaleza de artefacto de despliegue: no introduce cambios en los pesos ni en el comportamiento del modelo base, sino que facilita la inferencia local en entornos JavaScript. Está pensado para desarrolladores que necesitan integrar generación de texto, clasificación, extracción o RAG ligero en aplicaciones web sin depender de una API remota, aprovechando que el modelo cabe en memoria de un navegador de escritorio moderno.

El modelo base pertenece a la familia Granite 4.0 Nano, orientada a despliegues en dispositivo y a casos de ajuste fino en dominios especializados con recursos de cómputo limitados. La licencia Apache 2.0 y el soporte declarado de doce idiomas (incluido el español) lo convierten en una opción práctica para prototipos y aplicaciones educativas o de demostración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite 4.0 Nano; tag `granitemoehybrid` en el repo, aunque el modelo base es denso) |
| Parámetros totales | 350 millones |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | ONNX con soporte de `fp16` en WebGPU; otras variantes no especificadas en la información disponible |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 3,1 GB, incluye múltiples variantes) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 350 millones de parámetros, afinado a partir de Granite-4.0-350M-Base. Según la model card, el ajuste combina tres técnicas: ajuste supervisado (SFT) sobre datasets de instrucciones de licencia permisiva y datos sintéticos internos, aprendizaje por refuerzo y fusión de modelos. Los datos de SFT provienen de tres fuentes: datasets públicos con licencia permisiva, datos sintéticos internos orientados a capacidades específicas y un conjunto seleccionado de datos curados por humanos. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

Esta conversión concreta no altera la arquitectura: reproduce el modelo base en formato ONNX para su ejecución con Transformers.js. El repositorio incluye variantes de pesos (el tamaño total de 3,1 GB sugiere múltiples precisiones o ficheros auxiliares), y el ejemplo de la model card utiliza `dtype: "fp16"` con `device: "webgpu"`. El tag `granitemoehybrid` presente en el repo apunta a la arquitectura declarada por la familia, aunque el modelo de 350M se describe como denso en la documentación de IBM.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones, orientado a diálogo multi-turno.
- Resumen de documentos y condensación de contenido.
- Clasificación de texto y extracción de información estructurada.
- Respuesta a preguntas (QA) sobre contexto proporcionado.
- RAG (Retrieval Augmented Generation) en aplicaciones ligeras.
- Tareas relacionadas con código, incluida la finalización Fill-In-the-Middle (FIM).
- Function calling / tool calling para integración con APIs y flujos automatizados.
- Diálogo multilingüe en los doce idiomas declarados, con español incluido.
- Ejecución en navegador mediante Transformers.js con WebGPU, sin backend propio.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se ejecuta en el navegador del usuario con Transformers.js y WebGPU, eliminando la necesidad de enviar datos a un servidor y reduciendo la latencia de red en conversaciones multi-turno.
- Clasificación de tickets o correos en el cliente: dado su tamaño reducido, puede clasificar texto entrante en categorías predefinidas directamente en la aplicación, sin coste de API y con privacidad de datos.
- Extracción de entidades en formularios: el modelo puede extraer campos estructurados (nombres, fechas, importes) de texto libre introducido por el usuario, integrándose en flujos de validación del lado del cliente.
- RAG ligero en documentación técnica: combinado con un índice vectorial en el navegador, puede responder preguntas sobre manuales o políticas internas sin exponer los documentos a un servicio externo.
- Autocompletado de código en editores web: la capacidad FIM permite ofrecer sugerencias de completado en entornos de edición basados en navegador, con el modelo cargado localmente.
- Prototipado y demos educativas: sirve para mostrar pipelines de generación de texto en cursos o talleres sin requerir GPU ni credenciales de API, gracias a su licencia Apache 2.0 y su formato ONNX.
- Ajuste fino en dominios especializados: al ser un modelo de 350M, puede reentrenarse con recursos modestos para tareas verticales (legal, sanitario, atención al cliente) antes de convertirlo de nuevo a ONNX.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (columnas: 350M Dense, H 350M Dense, 1B Dense, H 1B Dense):

| Benchmark | Métrica | 350M Dense | H 350M Dense | 1B Dense | H 1B Dense |
|---|---|---|---|---|---|
| MMLU | 5-shot | 35,01 | 36,21 | 59,39 | 59,74 |
| MMLU-Pro | 5-shot, CoT | 12,13 | 14,38 | 34,02 | 32,86 |
| BBH | 3-shot, CoT | 33,07 | 33,28 | 60,37 | 59,68 |
| AGI Eval | 0-shot, CoT | 26,22 | 29,61 | 49,22 | 52,44 |

No se han publicado en la información disponible resultados específicos de esta conversión ONNX ni mediciones de latencia o throughput en navegador.

## Requisitos de hardware

- VRAM estimada: el modelo en fp16 ocupa aproximadamente 700 MB de pesos; en el navegador se carga en memoria de la GPU o en memoria del sistema según el backend.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en navegadores Chromium recientes; para fp16, se recomienda una GPU con al menos 2 GB de memoria gráfica disponible.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de escritorio o portátil de los últimos años; también puede ejecutarse en CPU mediante el backend WASM de Transformers.js, con mayor latencia.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `device: "webgpu"` o `device: "wasm"`; el repositorio está etiquetado como `transformers.js` y no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware del cliente y del backend seleccionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Granite-4.0-350M (este, ONNX-web) | 350M | no disponible | Apache 2.0 | ONNX / Transformers.js | Conversión para navegador de barflyman |
| Granite-4.0-350M (original IBM) | 350M | no disponible | Apache 2.0 | safetensors / Transformers | Modelo base instruct de referencia |
| Granite-4.0-1B Dense | 1B | no disponible | Apache 2.0 | safetensors / Transformers | Mismo family; mejores resultados en MMLU (59,39) y BBH (60,37) |
| onnx-community/granite-4.0-350m-ONNX-web | 350M | no disponible | Apache 2.0 | ONNX / Transformers.js | Conversión equivalente mantenida por onnx-community |

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo de tamaño reducido, tiene riesgo elevado de inventar datos, especialmente en tareas de conocimiento factual y razonamiento multi-paso (MMLU-Pro de 12,13 en el modelo de 350M).
- Rendimiento limitado: los benchmarks muestran una brecha considerable frente al modelo de 1B en tareas de razonamiento (BBH 33,07 frente a 60,37), por lo que no es adecuado para tareas complejas de cadena de pensamiento.
- Contexto: la longitud de contexto no se especifica en la información disponible; conviene verificarla en la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Idiomas: aunque se declaran doce idiomas, el rendimiento fuera del inglés puede degradarse; no hay evaluaciones multilingües publicadas en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero esta conversión concreta es un artefacto de terceros (barflyman) y no está mantenida oficialmente por IBM; conviene validar la integridad de los pesos antes de usarla en producción.
- Producción en navegador: la ejecución con WebGPU depende de la compatibilidad del navegador y del hardware del cliente; el rendimiento y la estabilidad pueden variar, y no hay métricas publicadas de latencia.
- Repositorio con pocas descargas (11) y sin likes: menor evidencia de uso comunitario que la conversión de onnx-community.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barflyman/granite-4.0-350m-ONNX-web
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Conversión equivalente de onnx-community: https://huggingface.co/onnx-community/granite-4.0-350m-ONNX-web
- Colección Granite 4.0 Nano: https://huggingface.co/collections/ibm-granite/granite-40-nano-language-models-68e5775c80b60e43b72cfa16
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.0-nano-language-models
- Documentación de Granite: https://www.ibm.com/granite/docs/
- Librería Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM: https://www.npmjs.com/package/@huggingface/transformers
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

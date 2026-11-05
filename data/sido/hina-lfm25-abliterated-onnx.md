# Sido/hina-lfm25-abliterated-onnx

## Resumen

Hina LFM2.5 abliterated ONNX es una conversión experimental a formato ONNX de dos checkpoints comunitarios derivados de la familia LFM2.5 de Liquid AI: las variantes de 350M y 1.2B (esta última en versión japonesa), ambas con el comportamiento de rechazo modificado ("abliterated") por el usuario PinoCookie. El autor de la conversión, Sido, no entrena ningún modelo nuevo: toma los pesos aprendidos de los checkpoints comunitarios y los reempaqueta en grafos ONNX optimizados para ejecución en navegador mediante ONNX Runtime Web con WebGPU.

La relevancia de esta ficha es acotada y conviene subrayarlo desde el principio: se trata de artefactos experimentales, no de una release oficial de Liquid AI, y el propio autor advierte que no constituyen una certificación de calidad ni una promesa de idoneidad para producción. El interés técnico está en el pipeline de conversión (cuantización de bloques de 32 a 4 bits con escalas FP16, cabeza LM restringida a la última posición, tablas rotatorias comunes) y en la posibilidad de ejecutar un modelo de lenguaje pequeño íntegramente en el navegador.

El repositorio ocupa 1,0 GB y contiene dos carpetas, `350m` y `1.2b-jp`, con los artefactos ONNX, ficheros de procedencia (`provenance.json`), las model cards originales y las licencias upstream. La licencia declarada es la LFM Open License v1.0, la de los modelos base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2/LFM2.5 (topología de grafo tomada de los ONNX oficiales de Liquid AI); detalles internos no disponibles en la información proporcionada |
| Parametros totales | Dos variantes: 350M y 1.2B (según nombres de checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 posiciones en las tablas rotatorias del grafo; la aplicación de navegador limita el contexto a 8.192 tokens |
| Tipos de cuantizacion | Matrices en 4 bits con bloques de 32 y escalas FP16; resto de tensores aprendidos en FP16 (Q4F16) |
| Idiomas soportados | no disponible (la variante 1.2B se etiqueta como japonesa, sin lista formal de idiomas) |
| Licencia | LFM Open License v1.0 (license_name: lfm-open-license-v1.0) |
| Formato de pesos | ONNX (ONNX Runtime, ONNX Runtime Web con WebGPU y shader-f16) |

## Arquitectura y entrenamiento

No se ha entrenado ningún modelo en este repositorio. La aportación es exclusivamente de conversión y empaquetado: los 148 tensores aprendidos de cada modelo provienen íntegramente de los checkpoints comunitarios de PinoCookie, fijados a revisiones concretas (`e1f9ece...` para el 350M y `ebba678...` para el 1.2B-JP). La topología del grafo procede de los grafos ONNX oficiales de Liquid AI fijados por la aplicación HINA, con una cabeza LM que solo calcula la última posición. Las tablas rotatorias comunes usan dimensión de cabeza 64, theta 1.000.000 y 128.000 posiciones.

La innovación técnica reseñable es el esquema de cuantización para navegador: matrices en 4 bits con bloques de 32 y escalas en FP16, mientras el resto de tensores aprendidos permanece en FP16. El autor publica hashes de origen, hashes de grafo, cobertura de tensores y SHA-256 de los artefactos en `provenance.json`, además del script reproducible `conversion.py`. No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni procesos de RLHF/DPO de los modelos originales; tampoco se detalla el método de "abliteration" aplicado por PinoCookie más allá de que modifica el comportamiento de rechazo.

## Capacidades

- Generación de texto autoregresiva en el navegador mediante ONNX Runtime Web con WebGPU.
- Ejecución con cuantización Q4F16, pensada para reducir huella de memoria en cliente.
- Procesamiento por chunks de prefill con espera a la finalización de la GPU entre fragmentos.
- Ventana de contexto efectiva de 8.192 tokens en la aplicación de navegador, pese a que las tablas rotatorias soportan hasta 128.000 posiciones.
- Comportamiento de rechazo modificado (abliterated): los checkpoints comunitarios alteran las respuestas de rechazo, sin garantía de que respondan a todos los prompts.
- Capacidades multilingües: no disponibles como lista formal; la variante 1.2B-JP está orientada al japonés.
- Tool calling, function calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en navegador sin backend: el modelo se ejecuta con ONNX Runtime Web y WebGPU directamente en la pestaña del usuario, lo que elimina el coste de servidor y mantiene los datos en el cliente; adecuado para demos y prototipos de asistentes embebidos.
- Aplicaciones de escritorio o web con requisitos de privacidad: al no enviar prompts a un servidor, encaja en escenarios donde el texto del usuario no debe salir del dispositivo, aceptando la penalización de latencia y el límite de 8.192 tokens.
- Procesamiento de texto japonés en cliente: la variante 1.2B-JP puede emplearse en tareas de resumen corto o reescritura en japonés dentro de una extensión de navegador, aunque la precisión requiere validación específica según advierte el autor.
- Experimentación con modelos "abliterated": investigadores interesados en estudiar cómo cambia el comportamiento de rechazo tras la modificación pueden comparar estos artefactos con los originales de Liquid AI, siempre con revisión de seguridad.
- Prototipado de pipelines ONNX: el repositorio sirve como referencia reproducible (`conversion.py`, `provenance.json`) para convertir checkpoints de HuggingFace a grafos ONNX cuantizados con cabeza de última posición.
- Pruebas de estrés de WebGPU: útil para medir estabilidad, uso de memoria y repeticiones en tiempo de ejecución de modelos pequeños en GPU de navegador, un área con poca documentación pública.
- Evaluación comparativa de cuantización Q4F16: permite contrastar la calidad de salida frente a los checkpoints Safetensors originales (no incluidos en el repo) en tareas de generación corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo de 350M en 4 bits ronda los 0,2 GB de pesos y uno de 1.2B en torno a los 0,6-0,7 GB, más escalas FP16 y estados de activación; el repositorio completo ocupa 1,0 GB.
- GPU recomendadas: no disponibles. El requisito declarado es un navegador con WebGPU y soporte de `shader-f16`.
- GPU de consumo: previsiblemente viable en GPUs integradas y dedicadas recientes con WebGPU, pero no hay lista oficial ni cifras de latencia publicadas.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el destino declarado; ONNX Runtime nativo para escritorio o servidor es una vía plausible pero no documentada por el autor. vLLM, llama.cpp, Ollama y TGI no se mencionan y no hay artefactos GGUF en el repositorio.
- Latencia y throughput: no disponibles. El autor solo indica que la aplicación espera a la finalización de la GPU entre chunks de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hina LFM2.5 abliterated ONNX (este) | 350M y 1.2B | 128.000 en grafo; 8.192 en app | ONNX Q4F16 | LFM Open License v1.0 | Conversión experimental, sin benchmarks |
| PinoCookie/LFM2.5-350M-abliterated | 350M | no disponible | Safetensors | no disponible en la información | Checkpoint fuente del 350M |
| PinoCookie/LFM2.5-1.2B-JP-Abliterated | 1.2B | no disponible | Safetensors | la card anuncia Apache-2.0, pero la conversión preserva la licencia Liquid AI | Checkpoint fuente del 1.2B-JP |
| LiquidAI LFM2.5 (oficial) | 350M / 1.2B según variante | no disponible | ONNX y Safetensors oficiales | LFM Open License v1.0 | Grafos de referencia usados por esta conversión; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Pesos experimentales: el autor declara explícitamente que no son una release oficial de Liquid AI ni una certificación de calidad.
- Comportamiento de rechazo alterado: los checkpoints "abliterated" modifican las respuestas de rechazo; no hay garantía de que respondan a todos los prompts y el filtrado de seguridad debe implementarse en la aplicación.
- Calidad no validada: precisión en japonés, calidad de razonamiento, repeticiones, estabilidad en tiempo de ejecución y uso de memoria requieren pruebas específicas por aplicación.
- Contexto efectivo limitado: aunque el grafo soporta 128.000 posiciones, la aplicación de navegador restringe el contexto a 8.192 tokens.
- Licencia: se preserva la LFM Open License v1.0 de Liquid AI, no la Apache-2.0 que anuncia la card del derivado japonés; conviene revisar los términos antes de cualquier uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en modelos de este tamaño, pero no hay evaluación publicada.
- Sesgos: no documentados.
- Dependencia de WebGPU y `shader-f16`: la ejecución falla o degrada en navegadores sin soporte, lo que reduce la base de usuarios compatible.
- Los checkpoints Safetensors originales no se incluyen en el repositorio, lo que dificulta la comparación directa de calidad.
- Sin datos de benchmarks, latencia ni throughput: no es posible estimar el rendimiento en producción a partir de la información publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sido/hina-lfm25-abliterated-onnx
- Checkpoint fuente 350M: https://huggingface.co/PinoCookie/LFM2.5-350M-abliterated
- Checkpoint fuente 1.2B-JP: https://huggingface.co/PinoCookie/LFM2.5-1.2B-JP-Abliterated
- Modelo base oficial de referencia para la licencia: https://huggingface.co/LiquidAI/LFM2.5-350M
- Texto de la licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/9921cd4d82c0e3986887aa4b376f9446729ef8a3/LICENSE
- Los resultados de búsqueda web recibidos (Wikipedia y sitios sobre Sido el rapero, SIDO Lyon) no guardan relación con este modelo y se descartan como fuentes.

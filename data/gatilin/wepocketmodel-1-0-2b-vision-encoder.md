# gatilin/wepocketmodel-1-0-2b-vision-encoder

## Resumen

WePocketModel 1.0 2B vision encoder es un componente extraído del modelo multimodal tencent/WePocketModel1.0-2B, publicado por el usuario gatilin en Hugging Face. No se trata de un modelo completo, sino de la torre visual (visual tower) y el merger visual del modelo original, con los 297 tensores BF16 (331.416.576 parámetros) exportados tras eliminar el prefijo `model.visual.` de los nombres. El resultado es un extractor de características visuales que se puede cargar con la arquitectura Qwen3.5 y que produce embeddings de ancho 2048.

Su relevancia es acotada pero técnica: permite reutilizar el codificador visual de WePocketModel de forma aislada, sin arrastrar el modelo de lenguaje, las cabezas de tarea ni el runtime de selección de tokens visuales MGVB. Esto es útil para experimentación con pipelines multimodales propios, para estudiar la representación visual del modelo base o para integrar el encoder en sistemas que ya disponen de su propio LLM. El repositorio incluye `component.py`, configuraciones de origen y del procesador, mapeo de tensores y un test de referencia en CPU.

El modelo base pertenece a Tencent WeChat AI y soporta comprensión de imágenes, generación de texto, embeddings y decisiones, pero no generación de imágenes. La licencia del checkpoint original es Apache-2.0 y se conserva el `LICENSE.txt` original. La fecha de creación del repositorio es 2026-11-26 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower + visual merger de Qwen3.5 (extraído de WePocketModel1.0-2B) |
| Parametros totales | 331.416.576 (297 tensores BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Ancho de salida del merger | 2048 |
| Prefijo de tensores | eliminado (`model.visual.`) |
| Repositorio | 0,7 GB |
| Pipeline | feature-extraction |
| Libreria | transformers |

## Arquitectura y entrenamiento

El componente reproduce la torre visual y el merger del modelo Qwen3.5 empleado en WePocketModel1.0-2B. Los tensores se exportaron desde la revisión `68d8975772f76ea053ce9f696e47b185d51936b4` del repositorio original, preservando bytes y formas, y eliminando únicamente el prefijo `model.visual.` de los nombres. El merger proyecta a un ancho de salida de 2048. No se incluyen el modelo de lenguaje, las cabezas de tarea ni el runtime de selección de tokens visuales MGVB, por lo que no es un sistema completo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO para este componente. La model card indica que los rangos de origen se descargaron del mirror oficial de WeChat-Vision en ModelScope tras verificar los metadatos LFS SHA-256 de los shards contra la revisión fijada de Hugging Face, y que el payload exportado se comparó byte a byte con los rangos descargados; no se descargaron ni hashearon de forma independiente los shards completos. La comparación entre las variantes 2B y 4B muestra 295 tensores con la misma forma pero ningún valor exactamente igual, y dos tensores de proyección del merger con formas distintas; se trata de una comparación exacta de pesos, no de similitud de representaciones.

## Capacidades

- Extracción de características visuales: genera embeddings de imágenes con ancho de salida 2048 a través del merger.
- Carga con la arquitectura Qwen3.5 original mediante `component.py`.
- Inferencia visual en CPU en FP32 validada con dos imágenes reales de COCO.
- Verificación de las capas de atención 0, 11 y 23 contra atención softmax explícita tras RoPE (ver `validation.json`).
- No incluye generación de texto, tool calling, agentes ni razonamiento multi-paso: esas capacidades residen en el modelo base completo, no en este extracto.
- No soporta generación de imágenes, según la model card del modelo padre.
- Capacidades multilingües: no disponibles para este componente.

## Casos de uso

- Investigación de representaciones visuales: cargar el encoder de forma aislada para analizar los embeddings producidos por la torre visual de WePocketModel1.0-2B sin el coste de ejecutar el LLM asociado.
- Integración en pipelines multimodales propios: usar el merger (salida 2048) como extractor de features para alimentar un LLM distinto al original, siempre que se respete la arquitectura Qwen3.5 de carga.
- Destilación o adaptación: emplear el encoder como inicialización para tareas visuales downstream (clasificación, recuperación imagen-texto) con cabezas propias.
- Validación y auditoría de modelos: reproducir el smoke test incluido en CPU y comparar pesos contra la revisión fijada del modelo base para verificar procedencia.
- Estudio comparativo 2B frente a 4B: usar los artefactos de comparación (`variant_comparison.json`) para analizar diferencias exactas de pesos entre variantes del mismo componente.
- Prototipado en entornos sin GPU: el test de referencia en CPU en FP32 permite validar la carga y la inferencia visual básica antes de escalar a hardware con aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta un smoke test de carga e inferencia visual en CPU con dos imágenes COCO redimensionadas a 224×224, por debajo del mínimo del procesador de origen, y lo describe explícitamente como una prueba de componente, no como una evaluación de calidad a resolución de origen ni de extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,7 GB en BF16; en FP32 la huella de pesos ronda 1,3 GB, más activaciones y buffers según resolución de imagen.
- GPU recomendadas: no especificadas por el autor; al tratarse de un encoder de 331 M de parámetros, cualquier GPU con al menos 2-4 GB de memoria libre debería poder alojarlo en BF16 o FP16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque el autor no publica cifras de VRAM ni de latencia.
- Opciones de despliegue: transformers con `component.py`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/wepocketmodel-1-0-2b-vision-encoder | 331.416.576 | no disponible | apache-2.0 | Hugging Face |
| tencent/WePocketModel1.0-2B (modelo completo) | no disponible | no disponible | apache-2.0 | Hugging Face |
| Variante 4B de WePocketModel (referida en la model card) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única comparación documentada es estructural (295 tensores de igual forma, ninguno con valores exactamente iguales, y dos tensores del merger con formas distintas).

## Limitaciones y advertencias

- No es un modelo completo: carece de modelo de lenguaje, cabezas de tarea y runtime de selección de tokens visuales MGVB, por lo que no puede ejecutar el comportamiento de extremo a extremo de WePocketModel.
- El smoke test se realizó a 224×224, por debajo del mínimo del procesador de origen; no hay evaluación a resolución nativa ni de calidad end-to-end.
- La procedencia se verificó comparando el payload exportado con rangos descargados del mirror de ModelScope, pero los shards completos no se descargaron ni hashearon de forma independiente.
- No hay información publicada sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas de este componente.
- Al ser un extractor de características, no genera texto y no aplican las advertencias típicas de generación; el riesgo se traslada al sistema que consuma sus embeddings.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución a Tencent WeChat AI y a los contribuidores del modelo original, tal como indica la model card.
- El repositorio no registra descargas ni likes, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wepocketmodel-1-0-2b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-2B
- Implementación upstream: https://github.com/Tencent/WePocketModel

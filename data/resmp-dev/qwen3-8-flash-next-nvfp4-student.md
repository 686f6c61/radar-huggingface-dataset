# RESMP-DEV/Qwen3.8-Flash-Next-NVFP4-Student

## Resumen

Qwen3.8-Flash-Next-NVFP4-Student es una conversión de pesos del modelo Qwen3.8-Flash-Next (desarrollado por Qwen) realizada por el usuario RESMP-DEV, publicada como artefacto de investigación bajo la etiqueta `not-for-production`. No se trata de un modelo entrenado ni afinado: es una transformación del formato de cuantización original (MXFP4) a NVFP4 (E2M1 con escalas E8M0, tamaño de grupo 32), manteniendo el backbone en NVFP4 empaquetado y dejando en BF16 la tabla de n-gramas PLE, el embedding y la cabeza del modelo de lenguaje.

El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base admite entradas multimodales (imagen y texto). El repositorio ocupa 175,1 GB y contiene 34 shards en formato safetensors, con un total de 163,087 GiB de pesos. El autor no aporta ninguna evaluación pareada, benchmark ni comparación contra el modelo base en BF16, y advierte explícitamente de que no hay reclamación de calidad.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de conversión de cuantización de precisión ultra-baja (4 bits con escalas de bloque) sobre un modelo multimodal grande; por otro, sirve de ejemplo de artefacto que no debe confundirse con una release oficial de Qwen ni de NVIDIA, y que no es apto para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el artefacto es una conversión de cuantización) |
| Parametros totales | no disponible (pesos publicados: 163,087 GiB en 34 shards) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas E8M0, group size 32) en el backbone; BF16 en embedding, tabla PLE de n-gramas y cabeza LM |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, etiqueta `license:other`) |
| Formato de pesos | safetensors (34 shards) |

## Arquitectura y entrenamiento

El artefacto no aporta información sobre la arquitectura interna del modelo base más allá de lo que se deduce de la conversión: un backbone de transformer (o híbrido, no especificado) con pesos empaquetados en NVFP4, más una tabla PLE de n-gramas, un embedding y una cabeza de lenguaje que permanecen en BF16. La mención a una "PLE n-gram table" sugiere un componente de n-gramas o de predicción léxica incorporado en el modelo base, pero el autor no detalla su función ni su tamaño.

No hubo entrenamiento ni fine-tuning: el autor describe el proceso como una conversión preservada de MXFP4 a NVFP4 sobre la revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540` de `Qwen/Qwen3.8-Flash-Next`. No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni fases de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del propio esquema de cuantización NVFP4.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base (pipeline `conversational`).
- Procesamiento de entradas imagen-texto (`image-text-to-text`), es decir, el modelo base es multimodal.
- Capacidades de razonamiento, código y matemáticas: no documentadas en esta conversión; dependen del modelo base y no han sido evaluadas en el artefacto.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Modo thinking, visión o audio: solo se confirma la entrada multimodal imagen-texto; no hay detalle sobre modos de razonamiento extendido.

## Casos de uso

- Investigación sobre cuantización NVFP4: el artefacto permite estudiar el comportamiento de un backbone multimodal grande con pesos en E2M1/E8M0 y comparar, en su caso, con la versión MXFP4 o BF16 del modelo base en experimentos controlados.
- Validación de pipelines de conversión de formato: sirve para probar herramientas de carga y desempaquetado de NVFP4 en `transformers` y en stacks de inferencia que soporten este formato.
- Pruebas de integración multimodal en laboratorio: al conservar el pipeline `image-text-to-text`, permite ensayar flujos de imagen y texto en entornos de investigación sin pretensión de calidad.
- Estudio de consumo de memoria y huella de disco: con 163,087 GiB en 34 shards, es útil para medir requisitos de almacenamiento y carga de modelos de gran tamaño en formato cuantizado.
- Referencia para auditorías de licencia: al incluir el texto de la Qwen Community License 1.0, sirve como caso de estudio de redistribución de derivados bajo licencias comunitarias.
- Docencia y formación técnica: ejemplo práctico de artefacto de investigación mal etiquetado como modelo desplegable, útil para enseñar a distinguir entre conversión, fine-tuning y release oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación pareada, ninguna puntuación de benchmark ni comparación contra la base en BF16 sobre este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de orden de magnitud, los pesos ocupan 163,087 GiB, por lo que la carga completa exige un nodo multi-GPU de gran capacidad; no se documenta el pico de memoria en ejecución.
- GPU recomendadas: no disponibles. Por el volumen de pesos, un despliegue completo requeriría GPUs de centro de datos (A100, H100 o superiores) repartidas en varias unidades; no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con 163 GiB de pesos, no cabe en una única GPU de consumo.
- Opciones de despliegue: la librería declarada es `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato NVFP4 empaquetado requiere stacks con soporte específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| RESMP-DEV/Qwen3.8-Flash-Next-NVFP4-Student | no disponible (163,087 GiB de pesos) | no disponible | NVFP4 + BF16 parcial | Qwen Community License 1.0 | Artefacto de investigación, no producción |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | MXFP4 (según el autor) | Qwen Community License 1.0 | Modelo base oficial |
| Otras conversiones NVFP4 de la familia Qwen | no disponible | no disponible | NVFP4 | según autor | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto no es una release oficial de Qwen, NVIDIA ni ISTA-DASLab.
- No hay reclamación de calidad: no se ha ejecutado evaluación pareada, benchmark ni comparación contra la base en BF16.
- No es un candidato para servir en producción (etiqueta `not-for-production`).
- No ha sido entrenado ni afinado; es únicamente una conversión de cuantización.
- Sesgos conocidos: no documentados; se heredarían, en su caso, del modelo base, que no se evalúa aquí.
- Riesgo de alucinación: no medido en este artefacto.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Qwen Community License 1.0, con texto y aviso de copyright incluidos en el repositorio; deben revisarse las restricciones de uso comercial antes de cualquier reutilización.
- El formato NVFP4 empaquetado limita la portabilidad: requiere herramientas compatibles con E2M1 y escalas E8M0 con group size 32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RESMP-DEV/Qwen3.8-Flash-Next-NVFP4-Student
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE

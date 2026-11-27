# brhncck/gallery-ai-siglip2

## Resumen

`brhncck/gallery-ai-siglip2` es una exportación optimizada para dispositivos móviles del modelo multimodal SigLIP 2 en su variante base con parches de 32x32 y resolución de entrada 256x256, desarrollado originalmente por Google. El autor del repositorio, brhncck, lo publica como el motor de búsqueda de la aplicación Gallery AI, que ejecuta la inferencia en el propio teléfono sin depender de servidores. Se trata, por tanto, de un artefacto de despliegue más que de un modelo entrenado desde cero: la model card indica explícitamente que se construye a partir de `onnx-community/siglip2-base-patch32-256-ONNX`, una exportación del modelo original de Google bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que documenta un patrón de optimización poco habitual en el ecosistema: cuantización selectiva de los nodos MatMulNBits a 8 bits en tiempo de ejecución, eliminación de la tabla de embeddings del modelo de texto y sustitución por una tabla de tokens comprimida a 8 bits con escalas por fila, y un formato binario propio (`token_table.bin`) que empaqueta únicamente las 183.541 filas de vocabulario que una consulta en minúsculas puede generar. El resultado es un paquete ONNX de aproximadamente 0,3 GB orientado a búsqueda texto-imagen en el dispositivo.

No se dispone de información sobre parámetros totales, longitud de contexto ni datos de entrenamiento en la documentación proporcionada, ya que el autor no los reproduce y el modelo subyacente es un export de SigLIP 2. Cualquier cifra de esa naturaleza debe consultarse en la ficha del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (vision transformer con parches 32x32 y resolución 256x256) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 con `accuracy_level` 4 en 76 nodos MatMulNBits (cómputo en int8); tabla de tokens en int8 con escala float32 por fila; texto sin tabla de embeddings, recibe filas float32 [batch, 64, 768] |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vision_model_q4_int8.onnx`, `text_model_rows.onnx`), más `token_table.bin` y `tokenizer.model` |
| Modelo base | google/siglip2-base-patch32-256 |
| Repositorio de origen | onnx-community/siglip2-base-patch32-256-ONNX (revisión 7efccb86b5b6601bfe9e14326e1c11b40b68d44c) |
| Tamaño del repo | 0,3 GB |
| Librería | onnx |

## Arquitectura y entrenamiento

El modelo es un export ONNX de SigLIP 2, la familia de modelos de alineación texto-imagen de Google que sustituye la pérdida sigmoidea por pares frente al contraste softmax de CLIP. La variante base con parches 32x32 y entrada 256x256 prioriza el coste computacional bajo sobre la resolución fina, lo que encaja con el objetivo declarado de ejecutar la búsqueda en un teléfono. El repositorio no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste con RLHF o DPO; esos datos pertenecen al modelo original de Google y no se reproducen aquí.

La innovación técnica de esta exportación es de ingeniería de despliegue. Por un lado, los 76 nodos MatMulNBits del modelo de visión se configuran con `accuracy_level` 4, de modo que ONNX Runtime los ejecuta en enteros de 8 bits sin modificar los pesos empaquetados en 4 bits. Por otro, el modelo de texto prescinde de su tabla de embeddings completa y recibe directamente las 64 filas que una consulta necesita, en float32 con forma [batch, 64, 768]. Esas filas se obtienen de `token_table.bin`, un fichero little-endian con cabecera `GATT` (versión 1, vocabulario, filas, dimensiones 768 y fila del token desconocido), un array int32 de fila por id, un array float32 de escala por fila y las filas int8. Solo se incluyen las 183.541 filas de las 256.000 del vocabulario que una consulta en minúsculas puede producir; los ids sin fila propia leen la del token desconocido. El tokenizador (`tokenizer.model`) se mantiene sin cambios.

## Capacidades

- Búsqueda texto-imagen: genera embeddings alineados de texto e imagen para recuperación semántica dentro de una galería local.
- Codificación de imágenes: el modelo de visión procesa entradas de 256x256 con parches de 32x32.
- Codificación de consultas de texto: el modelo de texto consume filas de embedding precalculadas en lugar de ids, lo que exige un paso previo de tokenización y lookup en `token_table.bin`.
- Ejecución en el dispositivo: el paquete está pensado para ONNX Runtime en Android o iOS, sin llamadas a servidor.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, audio ni visión generativa; el modelo es un codificador dual, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en la galería del teléfono: la aplicación Gallery AI indexa las fotos con el codificador de visión y responde a consultas en lenguaje natural comparando embeddings; el tamaño de 0,3 GB y la cuantización a 4/8 bits permiten mantener el índice y el modelo en el dispositivo.
- Clasificación y etiquetado offline de imágenes: al ejecutarse sin red, encaja en aplicaciones de catalogación de fotos personales donde la privacidad impide subir imágenes a un servidor.
- Filtrado zero-shot de contenido: comparar embeddings de imagen con descripciones textuales permite descartar o agrupar imágenes por categoría sin entrenar un clasificador específico.
- Deduplicación y agrupación visual: los embeddings de imagen sirven para detectar fotos similares o construir clusters dentro de una biblioteca local.
- Prototipado de recuperación multimodal en móvil: útil para equipos que quieran validar un pipeline texto-imagen en Android o iOS antes de invertir en infraestructura de servidor.
- Distribución de modelos en apps con presupuesto de almacenamiento ajustado: el formato `token_table.bin` y la eliminación de la tabla de embeddings reducen el peso descargable, lo que facilita empaquetar el modelo en la propia aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete ONNX ocupa 0,3 GB en disco y el modelo está diseñado para ejecutarse en el propio teléfono.
- GPU recomendadas: no se documentan; el destino declarado es la NPU o GPU integrada de un dispositivo móvil mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no se especifica; al ser un export ONNX de un modelo base, es plausible ejecutarlo en RTX 4090 o superiores, pero el autor no aporta requisitos ni cifras.
- Opciones de despliegue: ONNX Runtime (incluido el runtime móvil); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador dual de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| brhncck/gallery-ai-siglip2 | no disponible | no disponible | ONNX cuantizado + tabla de tokens propia | Apache 2.0 | Optimizado para búsqueda en móvil; sin benchmarks publicados |
| google/siglip2-base-patch32-256 | no disponible | no disponible | safetensors / ONNX (según export) | Apache 2.0 | Modelo original de Google; referencia de calidad y licencia |
| onnx-community/siglip2-base-patch32-256-ONNX | no disponible | no disponible | ONNX | Apache 2.0 | Export intermedio del que deriva este repositorio |
| CLIP ViT-B/32 (OpenAI) | no disponible | no disponible | varios | MIT (según variante) | Alternativa clásica de alineación texto-imagen; comparación cualitativa no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no documenta sesgos del modelo; al derivar de SigLIP 2, hereda los sesgos del dataset de entrenamiento original, que no se detalla aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la recuperación texto-imagen puede devolver resultados semánticamente plausibles y falsos positivos en consultas ambiguas.
- Limitaciones de contexto e idioma: no disponibles; la tabla de tokens solo cubre las filas que una consulta en minúsculas puede producir, de modo que consultas con mayúsculas, alfabetos no cubiertos o tokens fuera de las 183.541 filas caen en el token desconocido y degradan la codificación.
- El modelo de texto no acepta `input_ids` directamente: cualquier integración debe replicar el lookup en `token_table.bin` y construir el tensor [batch, 64, 768] en float32, lo que añade complejidad y un punto de fallo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar el aviso de licencia y verificar las condiciones del modelo base de Google.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación comunitaria; úsese con cautela en entornos críticos.
- No se especifican requisitos de versión de ONNX Runtime ni compatibilidad con aceleradores concretos (NNAPI, Core ML), lo que puede afectar al rendimiento real en dispositivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brhncck/gallery-ai-siglip2
- Modelo base: https://huggingface.co/google/siglip2-base-patch32-256
- Export ONNX de origen: https://huggingface.co/onnx-community/siglip2-base-patch32-256-ONNX
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.

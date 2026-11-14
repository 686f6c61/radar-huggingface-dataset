# SceneWorks/qwen3.8-27b-abliterated-mlx

## Resumen

SceneWorks/qwen3.8-27b-abliterated-mlx es una redistribución en formato MLX de un modelo multimodal de 27 000 millones de parámetros derivado de Qwen/Qwen3.8-27B, pasado por el proceso de abliteration de huihui-ai (Huihui-Qwen3.8-27B-abliterated) y reempaquetado por SceneWorks en dos niveles pre-cuantizados (Q8 y Q4) para su motor de inferencia MLX. El objetivo declarado no es otro que permitir que los usuarios de Apple Silicon descarguen únicamente el tier que necesitan (30 GB en Q8 o 19,98 GB en Q4) en lugar de los 55,6 GB de pesos en bf16, y que cada tier resuelva por un SHA de commit inmutable en el motor de SceneWorks Inference.

El modelo conserva la torre de visión en bf16 en ambos tiers, de modo que sigue aceptando entrada de imagen además de texto (pipeline `image-text-to-text`). La licencia es Apache-2.0, heredada de Qwen y mantenida por huihui-ai. No se trata de una distribución oficial ni de Qwen ni de huihui-ai, sino de un rehost de terceros.

La relevancia actual es doble: por un lado, ofrece una vía práctica de ejecutar un modelo multimodal de 27B en hardware de Apple con cuantización group-wise de 64 elementos por grupo; por otro, la abliteration elimina el comportamiento de rechazo del modelo original, lo que tiene implicaciones directas para despliegues en producción y para el cumplimiento de políticas de contenido. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa: la model card se limita a describir el empaquetado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 27 000 millones (27B, según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX group-wise affine, group size 64; tiers Q8 (30 GB) y Q4 (19,98 GB); torre visual, embeddings y norms en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), un `model.safetensors` por tier más config, tokenizer y chat template |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de la etiqueta `qwen3_5` y de la presencia de una torre visual (`model.visual.*`) que se mantiene en bf16 en todas las cuantizaciones. Se sabe que el decodificador y las proyecciones MTP (multi-token prediction) se almacenan como pesos MLX cuantizados de forma afín por grupos de 64, con los parámetros `bits` y `group_size` reflejados en `config.json`. La existencia de proyecciones MTP sugiere soporte de decodificación especulativa o predicción multi-token, aunque el autor no lo detalla.

El linaje es: Qwen/Qwen3.8-27B (base original) → huihui-ai/Huihui-Qwen3.8-27B-abliterated (revisión `739e3c5b89849f6c238ce1e5b70008612ae42cdd`, con abliteration aplicada para eliminar el comportamiento de rechazo) → SceneWorks (conversión a MLX mediante el preparador de snapshots de mlx-llm, función `prepare_snapshot`). No se aportan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas. El fichero `SOURCE_REVISION.json` del repositorio registra la trazabilidad de revisiones.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Comprensión de imágenes: pipeline `image-text-to-text`; la torre visual permanece en bf16 en ambos tiers, por lo que la entrada multimodal está operativa.
- Predicción multi-token (MTP): la presencia de proyecciones MTP en el snapshot apunta a decodificación especulativa, aunque no se detalla su uso.
- Soporte de plantilla de chat incluida en cada tier (`chat template`).
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Modo thinking explícito: no disponible en la información proporcionada.
- Comportamiento sin rechazo (abliterated): el modelo no aplica las negativas de seguridad del original, lo que constituye una capacidad diferencial pero también un riesgo.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: los tiers Q8 (30 GB) y Q4 (19,98 GB) permiten ejecutar un modelo multimodal de 27B en equipos con memoria unificada suficiente, sin descargar los 55,6 GB de bf16. Adecuado para desarrolladores que quieren probar el modelo en su estación de trabajo antes de desplegarlo en servidor.
- Análisis de documentos con imagen y texto: al conservar la torre visual en bf16, el modelo puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales, por ejemplo para extraer datos estructurados de facturas o informes.
- Integración en el motor SceneWorks Inference: los tiers resuelven por SHA de commit inmutable, lo que facilita pipelines reproducibles y despliegues con versiones fijadas, sin riesgo de que el upstream cambie bajo los pies.
- Investigación sobre alineación y abliteration: permite estudiar empíricamente cómo cambia el comportamiento de un modelo de 27B al eliminar las capas de rechazo, comparando respuestas con el Qwen3.8-27B original.
- Generación de contenido creativo sin filtros: para aplicaciones de ficción, guiones o narrativa donde el rechazo del modelo base resulta un obstáculo, con la advertencia de que la salida puede ser inapropiada para ciertas audiencias.
- Prototipado de asistentes multimodales en local: la plantilla de chat incluida y la cuantización Q4 permiten iterar rápidamente sobre prompts y flujos conversacionales en un portátil, antes de pasar a un despliegue con más recursos.
- Evaluación comparativa de cuantizaciones: disponer de Q8 y Q4 del mismo snapshot permite medir la degradación de calidad entre ambos tiers en tareas concretas de visión y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: Q8 requiere aproximadamente 30 GB de pesos más overhead de activaciones y caché KV; Q4 requiere aproximadamente 19,98 GB de pesos más overhead. En Apple Silicon, la memoria unificada debe cubrir pesos, activaciones y contexto simultáneamente.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1/M2/M3/M4, con especial idoneidad para configuraciones Max y Ultra por su mayor memoria unificada). Para GPU NVIDIA no es el formato nativo; sería necesario convertir los pesos.
- ¿Cabe en GPU consumer? En el ecosistema Apple, el tier Q4 puede encajar en equipos con 32 GB de memoria unificada o más; el Q8 exige configuraciones de 48-64 GB o superiores. En GPUs consumer NVIDIA de 24 GB (RTX 4090) no cabe en Q8 y el Q4 queda muy justo una vez añadido el contexto.
- Opciones de despliegue: motor MLX (librería `mlx`, preparador de snapshots de mlx-llm) y el motor propietario SceneWorks Inference. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SceneWorks/qwen3.8-27b-abliterated-mlx | 27B | no disponible | imagen-texto | Apache-2.0 | safetensors MLX (Q8/Q4) | Abliterated, tiers pre-cuantizados, torre visual en bf16 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | imagen-texto | Apache-2.0 | safetensors bf16 | Modelo base directo de este rehost; sin cuantizar (55,6 GB) |
| Qwen/Qwen3.8-27B | 27B | no disponible | imagen-texto | Apache-2.0 (según upstream) | safetensors | Modelo original con comportamiento de rechazo intacto |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Abliteration: el modelo ha eliminado su comportamiento de rechazo. La propia model card advierte de que la salida puede ser inapropiada para determinadas audiencias. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-27B, que tampoco se detallan.
- Alucinación: sin datos específicos; al ser un modelo de 27B sin benchmarks publicados en este rehost, no hay evidencia de su fiabilidad factual.
- Idiomas: el repositorio no declara idiomas soportados; no se puede asumir cobertura multilingüe sin verificación empírica.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por un modelo sin rechazo; conviene revisar la licencia del upstream Qwen y las obligaciones de atribución.
- Distribución de terceros: no es una distribución oficial de Qwen ni de huihui-ai; la calidad de la cuantización depende del preparador de SceneWorks y no ha sido validada por los autores originales.
- Formato: los pesos MLX no son directamente portables a ecosistemas CUDA sin conversión; el despliegue en servidores NVIDIA requiere trabajo adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/qwen3.8-27b-abliterated-mlx
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión upstream referenciada: `739e3c5b89849f6c238ce1e5b70008612ae42cdd`
- Librería MLX: https://github.com/ml-explore/mlx
- Papers, blogs, demos o repos adicionales: no disponibles en la información proporcionada.

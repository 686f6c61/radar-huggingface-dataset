# mradermacher/VIGOR-mini-GGUF

## Resumen

VIGOR-mini es un modelo multimodal de clasificación de imágenes orientado a la seguridad de contenido (content safety / guardrail), desarrollado originalmente por prithivMLmods y distribuido en formato GGUF por mradermacher. Su función principal no es la generación de texto libre, sino actuar como clasificador de seguridad visual: recibe una imagen (y opcionalmente texto) y emite una salida estructurada en JSON que indica si el contenido es seguro o infringe políticas. Está construido sobre una base de tipo Qwen 3.5 de 4B, según los tags de la model card.

El modelo cuenta con 4.326.350.848 parámetros totales (datos de safetensors) y se distribuye bajo licencia Apache 2.0. La versión aquí descrita es una cuantización estática en GGUF, con un rango de cuantizaciones que va desde Q2_K (2,1 GB) hasta f16 (8,8 GB), además de los ficheros mmproj necesarios para el procesamiento multimodal. Está etiquetado como experimental y uncensored en la model card original.

Su relevancia actual radica en la creciente necesidad de filtros de seguridad multimodales desplegables en local: al ser un modelo pequeño (4B) cuantizado en GGUF, puede ejecutarse en hardware de consumo y usarse como capa de moderación previa a sistemas generativos de imagen o en pipelines de moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen 3.5 4B según tags; transformer multimodal con proyector mmproj) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags de la model card, que apuntan a una base Qwen 3.5 de 4B y a un diseño multimodal con proyector (ficheros mmproj separados para el procesamiento de imagen). El pipeline declarado en Hugging Face es image-classification, lo que confirma que el modelo está orientado a clasificación y no a generación libre. El tag "mtp" sugiere multi-token prediction, aunque no se aporta documentación técnica al respecto.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). El autor de la cuantización indica que se trata de cuantizaciones estáticas del modelo original prithivMLmods/VIGOR-mini, generadas con su pipeline habitual (quantize_version 2, convert_type hf).

## Capacidades

- Clasificación de seguridad de contenido visual: evalúa imágenes y devuelve una salida estructurada (JSON) indicando categoría de seguridad.
- Moderación multimodal: combina imagen y texto para determinar si el contenido infringe políticas.
- Salida en formato JSON, adecuada para integración en pipelines automatizados de guardrails.
- Etiquetado como safety-classifier y guardrail, pensado como filtro previo o posterior a sistemas generativos.
- Soporte de inferencia con text-generation-inference y transformers según los tags del repositorio.
- Capacidad de clasificación de imágenes (pipeline image-classification).
- Modelo marcado como uncensored y experimental: no se documentan restricciones internas de rechazo.

## Casos de uso

- Moderación previa en generadores de imágenes: usar VIGOR-mini como filtro que clasifique la imagen generada antes de mostrarla al usuario, bloqueando contenido no permitido mediante la salida JSON del clasificador.
- Filtrado de contenido subido por usuarios: integrar el modelo en un endpoint que reciba imágenes de una plataforma (foros, redes, marketplaces) y devuelva una etiqueta de seguridad para revisión automática.
- Guardrail en pipelines RAG multimodales: clasificar las imágenes recuperadas o introducidas en el contexto antes de pasarlas a un LLM generativo, evitando que contenido inseguro llegue al modelo principal.
- Moderación en herramientas de edición o generación asistida: ejecutar el clasificador sobre las previsualizaciones antes de permitir la descarga o publicación del resultado.
- Auditoría de datasets de imagen: procesar por lotes un corpus de imágenes y generar metadatos de seguridad en JSON para su revisión posterior o exclusión.
- Despliegue en local o en el borde: al disponer de cuantizaciones desde 2,1 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada o en GPUs de consumo, útil para entornos con requisitos de privacidad que no pueden enviar imágenes a la nube.
- Capa de seguridad en asistentes multimodales: clasificar las imágenes que el usuario adjunta a una conversación antes de que el asistente las procese.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 2,1 GB en Q2_K, 2,7-2,9 GB en Q4_K_S/Q4_K_M, 3,7 GB en Q6_K, 4,7 GB en Q8_0 y 8,8 GB en f16. Hay que sumar el fichero mmproj (0,5 GB en Q8_0 o 0,8 GB en f16) para el procesamiento de imagen.
- GPU recomendadas: no se especifican oficialmente. Por tamaño, cualquier GPU con 6-8 GB de VRAM o más puede alojar las cuantizaciones Q4-Q8 junto con el proyector; una RTX 3060/4060 de 8 GB sería suficiente para Q4_K_M con mmproj.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM usando cuantizaciones Q2-Q4. Las cuantizaciones altas (Q6_K, Q8_0) requieren 8 GB o más.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para los GGUF; también transformers y text-generation-inference según los tags del repositorio, aunque para multimodal en GGUF el soporte depende de la versión de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el modelo base original (prithivMLmods/VIGOR-mini) es la referencia directa, y que existen cuantizaciones alternativas con imatrix en mradermacher/VIGOR-mini-i1-GGUF. Para el resto de alternativas de clasificación de seguridad multimodal, no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| VIGOR-mini-GGUF (este) | 4.326.350.848 | no disponible | Apache 2.0 | GGUF |
| VIGOR-mini (base) | 4.326.350.848 | no disponible | Apache 2.0 | safetensors |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado como experimental: no debe asumirse estabilidad de comportamiento en producción sin validación previa.
- Idioma limitado al inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Etiquetado como uncensored: puede no incorporar salvaguardas internas, por lo que su comportamiento ante entradas adversas debe evaluarse empíricamente.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad; no se han publicado métricas de precisión, recall ni tasas de error.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene revisar también las condiciones del modelo base.
- El tamaño del repositorio (41 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario.
- Para uso multimodal en GGUF es imprescindible descargar también el fichero mmproj correspondiente; sin él, el modelo no procesa imágenes.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de casos de uso con entradas largas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/VIGOR-mini-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-mini
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/VIGOR-mini-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#VIGOR-mini-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

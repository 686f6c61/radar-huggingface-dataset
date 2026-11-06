# mradermacher/VIGOR-mini-i1-GGUF

## Resumen

VIGOR-mini-i1-GGUF es una cuantización en formato GGUF del modelo VIGOR-mini, desarrollado originalmente por prithivMLmods y cuantizado por mradermacher. Se trata de un clasificador de imágenes orientado a la seguridad de contenido (content safety / guardrail), diseñado para detectar contenido visual inapropiado o peligroso. El modelo se presenta como una herramienta de moderación multimodal, etiquetada como "safety-classifier" y "visual-safety", y se distribuye con licencia Apache 2.0.

El modelo base declara estar construido sobre la arquitectura de Qwen3.5-4B según las etiquetas del repositorio, aunque el recuento real de parámetros en safetensors es de 1.797.272 parámetros (aproximadamente 1,8 millones), lo que resulta llamativamente bajo para una arquitectura de ese tamaño. Esta discrepancia entre las etiquetas y el recuento real debe tenerse en cuenta al evaluar el modelo. La información disponible no permite resolverla.

La relevancia de esta ficha radica en que se trata de un modelo experimental, con cero descargas y cero likes en el momento de la consulta, y con una model card muy escueta que no aporta detalles sobre arquitectura, entrenamiento o benchmarks. El repositorio i1-GGUF contiene únicamente un fichero imatrix (0,1 GB) para generar cuantizaciones propias; las cuantizaciones estáticas están en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como qwen3.5-4B en los tags; recuento real de 1.797.272 parámetros) |
| Parametros totales | 1.797.272 (según safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Imatrix (fichero .imatrix.gguf); cuantizaciones estáticas en repositorio separado (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la model card proporcionada. Los tags del repositorio indican "qwen3.5-4B" y "mtp" (multi-token prediction), lo que sugiere una posible base en la familia Qwen 3.5, pero el recuento real de parámetros (1,8 millones) contradice esa etiqueta. El modelo se distribuye como clasificador de imágenes (pipeline image-classification) y como modelo multimodal (tag "multimodal"), aunque no se especifica el codificador visual ni la composición del dataset de entrenamiento.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio de cuantización es puramente operativa (instrucciones de uso de GGUF y agradecimientos) y no incluye detalles del entrenamiento.

## Capacidades

- Clasificación de imágenes orientada a seguridad de contenido (detección de contenido visual inapropiado o peligroso).
- Moderación de contenido multimodal, según los tags "content-safety", "content-moderation" y "multimodal-content-filter".
- Salida en formato JSON, según el tag "JSON", lo que facilita su integración en pipelines automatizados de moderación.
- Etiquetado como "uncensored", lo que implica que el modelo no aplica filtros de rechazo en sus respuestas.
- Capacidad de guardrail (barrera de seguridad) para sistemas que procesan imágenes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto general.
- Capacidades multilingües: únicamente inglés declarado.

## Casos de uso

- Moderación automática de imágenes en plataformas de contenido generado por usuarios: el modelo puede clasificar imágenes subidas por usuarios para detectar contenido inapropiado antes de su publicación, integrándose como guardrail en el pipeline de subida.
- Filtrado previo en sistemas de generación de imágenes: actuar como clasificador de salida para bloquear imágenes generadas que violen políticas de contenido, usando la salida JSON para decisiones automatizadas.
- Moderación en foros y comunidades: procesar adjuntos de imagen en hilos de discusión y marcar automáticamente los que requieran revisión humana.
- Cumplimiento normativo en aplicaciones infantiles: verificar que las imágenes mostradas o compartidas en apps dirigidas a menores cumplan las políticas de contenido.
- Enriquecimiento de datasets de entrenamiento: clasificar grandes volúmenes de imágenes para separar contenido seguro de contenido que requiera revisión, antes de usarlos en el entrenamiento de otros modelos.
- Integración en pipelines de CI/CD de seguridad: ejecutar el clasificador como paso de validación sobre recursos visuales de un producto antes de desplegarlos, aprovechando el formato GGUF para ejecución local sin dependencias de API.
- Despliegue en entornos con recursos limitados: al ser un modelo de pequeño tamaño en formato GGUF, puede ejecutarse en CPU o GPUs de gama baja para moderación en el borde (edge).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable; el recuento real de parámetros (1,8 millones) sugiere un consumo mínimo, pero la etiqueta qwen3.5-4B apunta a un modelo de ~4B parámetros que requeriría varios GB según cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí en cualquier GPU moderna si el modelo real es de ~1,8M de parámetros; incierto si se confirma la base de 4B.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; el repositorio incluye fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-mini-i1-GGUF | 1.797.272 (según safetensors) | No disponible | Apache 2.0 | GGUF | Hugging Face |
| prithivMLmods/VIGOR-mini (base) | No disponible | No disponible | Apache 2.0 | safetensors | Hugging Face |
| Alternativas de clasificación de seguridad visual | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de seguridad visual) en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: los tags incluyen "experimental", con cero descargas y cero likes, lo que indica ausencia de validación por la comunidad.
- Discrepancia crítica de parámetros: las etiquetas indican qwen3.5-4B pero el recuento real en safetensors es de 1.797.272 parámetros; esto debe verificarse antes de cualquier uso en producción.
- Model card incompleta: no hay información sobre arquitectura, entrenamiento, sesgos, tasas de error ni evaluación.
- Riesgo de alucinación y falsos positivos/negativos en la clasificación: sin benchmarks publicados no es posible estimar la fiabilidad.
- Idioma: solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- Etiqueta "uncensored": el modelo no aplica filtros de rechazo, lo que puede ser problemático en despliegues sensibles.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo sin evaluación pública, el riesgo de fallos en producción recae enteramente en el integrador.
- El repositorio i1-GGUF solo contiene el fichero imatrix (0,1 GB); las cuantizaciones estáticas deben descargarse del repositorio separado VIGOR-mini-GGUF.
- No se documentan limitaciones de contexto porque la longitud de contexto no está disponible.

## Enlaces

- Repositorio Hugging Face (cuantización i1): https://huggingface.co/mradermacher/VIGOR-mini-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/VIGOR-mini-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-mini
- Página de descargas del autor: https://hf.tst.eu/model#VIGOR-mini-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

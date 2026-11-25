# mradermacher/Llandudno-9B-i1-GGUF

## Resumen

Llandudno-9B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base jonpojonpo/Llandudno-9B, un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado a las lenguas celtas y al escocés. El modelo base está etiquetado con soporte para galés (cy), inglés (en), irlandés (ga), gaélico escocés (gd) y scots (sco), e incluye capacidades declaradas de tool calling, modo thinking, contexto largo, visión y decodificación multi-token (MTP). El trabajo de mradermacher se limita a la cuantización: no modifica los pesos más allá de la compresión, por lo que las capacidades del modelo son las del original.

La relevancia de esta ficha radica en dos factores. Primero, la escasez de modelos abiertos con cobertura explícita de lenguas minoritarias de la familia celta y del scots, lo que convierte a Llandudno-9B en una pieza poco habitual para aplicaciones de procesamiento de lenguaje natural en esas lenguas. Segundo, la disponibilidad de cuantizaciones con imatrix (etiquetadas i1) permite ejecutar un modelo de 9B en hardware de consumo, algo relevante para investigadores y desarrolladores que trabajan con presupuestos limitados.

El repositorio contiene 23 variantes de cuantización entre Q2_K e IQ1_S y Q6_K, con tamaños que van de 4,0 GB a 7,7 GB, además del fichero imatrix de 0,1 GB para generar cuantizaciones propias. La licencia es Apache 2.0 y el repositorio ocupa 81,3 GB en total. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (23 variantes listadas en la model card, incluida IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, Q2_K_S) |
| Idiomas soportados | cy (gales), en (ingles), ga (irlandes), gd (gaelico escoces), sco (scots) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base jonpojonpo/Llandudno-9B se distribuye en safetensors |
| Tamano del repositorio | 81,3 GB |
| Descargas | 2.503 |
| Fecha de creacion | 2026-11-11 |
| Fecha de actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base jonpojonpo/Llandudno-9B en la documentación proporcionada. Las etiquetas del repositorio indican que se trata de un modelo conversacional con capacidades de tool calling, modo thinking, contexto largo, visión y decodificación multi-token (MTP), lo que sugiere una arquitectura transformer con módulos adicionales para visión y generación especulativa, pero no se confirma el tipo exacto (dense, MoE, híbrida) ni los detalles de atención.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica concreta es que mradermacher ha generado las cuantizaciones i1 usando un fichero imatrix (Llandudno-9B.imatrix.gguf, 0,1 GB), lo que implica un proceso de calibración con datos representativos para mejorar la calidad de las cuantizaciones de baja precisión. El autor menciona que las cuantizaciones i1 se produjeron con acceso a un supercomputador privado cedido por @nicoboss, lo que permitió generar más variantes y de mayor calidad de lo habitual.

## Capacidades

- Generación de texto conversacional en galés, inglés, irlandés, gaélico escocés y scots.
- Razonamiento multi-paso mediante modo thinking (etiqueta "thinking" en el repositorio).
- Tool calling / function calling, según la etiqueta "tool-calling".
- Soporte de contexto largo (etiqueta "long-context"), sin cifra concreta publicada.
- Capacidades de visión (etiqueta "vision"; los ficheros mmproj, si existen, se alojan en el repositorio estático mradermacher/Llandudno-9B-GGUF).
- Decodificación multi-token (MTP), según la etiqueta "mtp".
- Cobertura dialectal del galés: las etiquetas incluyen "gog" (galés del norte) y "hwntw" (galés del sur).
- Capacidades multilingües limitadas a las cinco lenguas declaradas; no se documenta soporte de otras lenguas.

## Casos de uso

- Procesamiento de lenguaje natural en galés: el modelo puede emplearse para generación de texto, resumen y respuesta a preguntas en galés, incluyendo variantes dialectales del norte (gog) y del sur (hwntw), gracias a las etiquetas específicas de dialecto del repositorio. Es adecuado porque pocos modelos abiertos declaran cobertura explícita de estas variantes.
- Atención al cliente en lenguas celtas: con tool calling y contexto largo, puede gestionar conversaciones multi-turno en irlandés, gaélico escocés o galés e invocar funciones para consultar sistemas internos (pedidos, reservas, estado de cuenta) sin cambiar de modelo.
- Traducción asistida entre inglés y lenguas celtas: útil como componente en pipelines de traducción automática o postedición, especialmente para irlandés y gaélico escocés, donde la oferta de modelos abiertos es reducida.
- Investigación en lingüística computacional: el modelo sirve como base para experimentos de evaluación en lenguas minoritarias, análisis de sesgos dialectales y comparación de calidad entre cuantizaciones i1 y estáticas.
- Despliegue en hardware de consumo para prototipos: las cuantizaciones i1-Q4_K_M (5,9 GB) e i1-Q4_K_S (5,6 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM, lo que facilita prototipado local sin infraestructura de servidor.
- Asistentes con visión en entornos multilingües: si se dispone del fichero mmproj del repositorio estático, el modelo puede procesar imágenes junto con texto en las lenguas soportadas, por ejemplo para descripción de imágenes o extracción de información de documentos escaneados.
- Generación de contenido en scots: para medios, educación o preservación lingüística, el modelo puede redactar textos en scots, una lengua con muy poca representación en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada según tamaño de fichero):
  - i1-Q2_K (4,0 GB): ~5-6 GB de VRAM.
  - i1-Q3_K_M (4,8 GB) e i1-IQ3_M (4,6 GB): ~6-7 GB de VRAM.
  - i1-Q4_K_M (5,9 GB) e i1-Q4_K_S (5,6 GB): ~7-8 GB de VRAM.
  - i1-Q5_K_M (6,7 GB): ~8-9 GB de VRAM.
  - i1-Q6_K (7,7 GB): ~9-10 GB de VRAM.
  - Estas cifras son estimaciones a partir del tamaño de los ficheros; no se publican mediciones oficiales.
- GPU recomendadas: para cuantizaciones Q4, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB son suficientes. Para Q6_K, se recomienda RTX 4080/4090 o GPUs de 16 GB o más. Para despliegue en servidor, A100 o H100 permiten cargar el modelo sin cuantizar (safetensors) y con contexto largo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 8 GB o más de VRAM usando cuantizaciones Q4 o inferiores. Las cuantizaciones IQ3 y Q2 caben en GPUs de 6 GB, con pérdida de calidad esperable.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; el repositorio declara compatibilidad con endpoints (tag "endpoints_compatible"). Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible, aunque no se confirma en la documentación.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La combinación de 9B parámetros con cobertura de galés, irlandés, gaélico escocés y scots es poco común, pero no se han encontrado en la información disponible alternativas con las que comparar parámetros, contexto, rendimiento y licencia de forma rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base; al entrenarse presumiblemente con datos de internet, es esperable que herede sesgos de género, culturales y geográficos, pero no se documenta su magnitud.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones de fidelidad en la información disponible.
- La longitud de contexto no se especifica numéricamente; la etiqueta "long-context" no permite dimensionar la ventana real ni su comportamiento en contextos extensos.
- La cobertura lingüística se limita a cinco lenguas; el rendimiento en cada una puede variar y no se documenta por separado. El galés y el inglés probablemente tengan más representación que el scots o el gaélico escocés, pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base jonpojonpo/Llandudno-9B debe verificarse por separado; esta ficha solo cubre la licencia declarada en el repositorio de cuantizaciones.
- Las cuantizaciones de baja precisión (IQ1_S, IQ2_XXS, IQ2_XS, Q2_K) degradan la calidad de forma notable; la model card recomienda IQ3_XXS o superiores frente a Q2_K, y IQ4_XS frente a IQ4_NL.
- Los ficheros mmproj para visión, si existen, no están en este repositorio sino en el estático mradermacher/Llandudno-9B-GGUF; hay que descargarlos por separado para usar las capacidades de visión.
- El repositorio ocupa 81,3 GB; descargar todas las cuantizaciones no es necesario, pero conviene planificar el espacio en disco.
- No se dispone de información sobre la calidad del tool calling ni del modo thinking en producción; las etiquetas indican la capacidad, pero no hay evaluaciones publicadas.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones i1: https://huggingface.co/mradermacher/Llandudno-9B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Llandudno-9B-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Llandudno-9B
- Página de overview y descargas del autor: https://hf.tst.eu/model#Llandudno-9B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Llandudno-9B-i1-GGUF/resolve/main/Llandudno-9B.imatrix.gguf
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png

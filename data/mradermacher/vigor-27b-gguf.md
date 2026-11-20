# mradermacher/VIGOR-27B-GGUF

## Resumen

VIGOR-27B es un modelo multimodal de clasificación de imágenes orientado a la seguridad de contenido (content safety / guardrail), desarrollado originalmente por prithivMLmods y cuantizado a formato GGUF por mradermacher. El modelo parte de una base de tipo Qwen3.8-27B (según las etiquetas de la model card) y se especializa en producir salidas estructuradas en JSON para tareas de moderación y filtrado de contenido visual y textual. Con 27.320.697.856 parámetros totales, se posiciona en la franja de modelos "grandes" para tareas de clasificación, lo que permite un razonamiento más profundo que clasificadores ligeros especializados.

La relevancia de este modelo radica en su enfoque como "guardrail" multimodal: no genera texto libre, sino etiquetas de seguridad estructuradas, lo que lo hace adecuado para integrarse en pipelines de moderación automatizada. La cuantización GGUF realizada por mradermacher facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles, ofreciendo un abanico de cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de los suplementos multimodales mmproj en Q8_0 y f16.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales significativas, lo que resulta atractivo para empresas que necesitan desplegar sistemas de moderación de contenido. El modelo se distribuye bajo la librería transformers y es compatible con text-generation-inference, aunque su pipeline declarado es image-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B según etiquetas; detalles específicos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con suplementos mmproj para multimodal) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas que apuntan a una base Qwen3.8-27B y a un diseño multimodal con capacidad de clasificación de imágenes. El modelo se presenta como un clasificador de seguridad de contenido ("safety-classifier", "guardrail", "multimodal-content-filter") que produce salidas en JSON, lo que sugiere un ajuste específico para tareas de moderación más que un modelo generativo de propósito general. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La model card incluye la etiqueta "uncensored" y "experimental", lo que indica que el modelo puede no haber pasado por un proceso de alineamiento restrictivo convencional y que su comportamiento en producción debe validarse cuidadosamente. La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye los ficheros mmproj necesarios para el procesamiento multimodal en llama.cpp.

## Capacidades

- Clasificación de imágenes orientada a seguridad de contenido (pipeline image-classification).
- Generación de salidas estructuradas en JSON para integración en pipelines automatizados.
- Moderación de contenido multimodal (visual y textual) como guardrail.
- Capacidad de filtrado de contenido ("multimodal-content-filter") y etiquetado de seguridad.
- Soporte de conversación ("conversational") según las etiquetas del repositorio.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidades multilingües limitadas al inglés según el campo language.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Moderación automatizada de imágenes en plataformas UGC: el modelo clasifica imágenes entrantes y devuelve etiquetas JSON de seguridad, integrándose en un pipeline previo a la publicación para bloquear contenido no permitido.
- Filtrado de contenido en foros y comunidades: se puede desplegar como guardrail que evalúa publicaciones con imágenes y texto, generando veredictos estructurados que el sistema de moderación consume directamente.
- Cumplimiento normativo en redes sociales: uso como capa de detección para identificar contenido que infrinja políticas, con salidas JSON auditables que facilitan la trazabilidad.
- Pre-filtrado en sistemas de revisión humana: el modelo prioriza casos sospechosos para que moderadores humanos revisen solo las muestras de mayor riesgo, reduciendo carga operativa.
- Protección en plataformas educativas: clasificación de contenido subido por estudiantes para detectar material inapropiado antes de mostrarlo en entornos escolares.
- Moderación en marketplaces: análisis de imágenes de productos para detectar contenido prohibido (violencia, desnudos, símbolos restringidos) antes de publicar listados.
- Integración en APIs de confianza y seguridad: despliegue como servicio interno que otros equipos consultan para validar contenido, aprovechando el formato JSON para respuestas máquina-legibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11 GB, Q4_K_M ~17 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB (más el suplemento mmproj de 0,7-1,0 GB para multimodal).
- GPU recomendadas: para Q4_K_M o superiores, GPU con 24 GB o más (RTX 3090, RTX 4090, A5000, A6000); para Q8_0, A100 40 GB o H100.
- En GPU de consumo: las cuantizaciones Q2_K a Q4_K_S pueden caber en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con posibles desbordamientos a RAM; Q4_K_M y superiores requieren 24 GB para ejecución íntegra en VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; también text-generation-inference según las etiquetas, aunque el pipeline declarado es image-classification.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que, por tamaño (27B) y enfoque (clasificación de seguridad multimodal), se sitúa en una categoría distinta a los clasificadores ligeros habituales de moderación, pero no se aportan datos de rendimiento que permitan una comparación cuantitativa con alternativas concretas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VIGOR-27B-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Clasificador de seguridad multimodal |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

## Limitaciones y advertencias

- Modelo marcado como "experimental": su comportamiento en producción no está validado de forma exhaustiva.
- Etiqueta "uncensored": puede producir clasificaciones o contenido sin los filtros habituales de alineamiento, lo que exige validación adicional antes de desplegarlo.
- Idiomas: solo se declara inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en las etiquetas JSON: al ser un modelo generativo adaptado a clasificación, puede producir salidas estructuradas incorrectas o inconsistentes.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo de moderación, existe riesgo de sobrerrepresentación o infrarrepresentación de ciertos colectivos o contextos culturales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar la model card del modelo base (prithivMLmods/VIGOR-27B) para condiciones adicionales.
- Longitud de contexto no disponible: limita la planificación de casos con entradas largas.
- Tamaño elevado (27B) para una tarea de clasificación: puede ser sobredimensionado frente a clasificadores especializados más ligeros, con mayor coste de inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VIGOR-27B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-27B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/VIGOR-27B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#VIGOR-27B-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

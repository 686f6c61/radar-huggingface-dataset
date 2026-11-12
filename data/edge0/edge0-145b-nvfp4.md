# Edge0/Edge0-145B-NVFP4

## Resumen

Edge0-145B-NVFP4 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por Edge0 bajo licencia Apache 2.0, derivado del modelo base Qwen/Qwen3.8-Flash-Next mediante un proceso de cuantización a 4 bits en formato NVFP4. El modelo está etiquetado con los identificadores `edge0`, `gguf`, `moe`, `latent-moe`, `edge-inference`, `agent` y `coding`, lo que indica que su propósito declarado es la inferencia en el borde (edge) y cargas de trabajo agénticas y de generación de código.

La designación "145B" en el nombre del modelo contrasta con el recuento real de parámetros almacenados en los ficheros safetensors del repositorio, que asciende a 4.947.698.560 parámetros (aproximadamente 4,95 mil millones). Esta discrepancia es relevante para cualquier evaluación práctica: el tamaño del repositorio es de 112,9 GB, un volumen coherente con pesos cuantizados de un modelo de mayor envergadura nominal, pero el dato verificable de parámetros es el indicado.

El modelo se publicó el 11 de noviembre de 2026 y se actualizó al día siguiente. En el momento de redactar esta ficha no registra descargas y cuenta con un único "like", por lo que se trata de una publicación reciente y sin adopción comunitaria documentada. La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada: la model card del autor consiste fundamentalmente en una hoja de estilos CSS y metadatos, sin secciones técnicas sustantivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiquetada como `latent-moe`; detalles internos no disponibles |
| Parametros totales | 4.947.698.560 (según safetensors del repositorio); la denominación comercial indica 145B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NVFP4 (según nombre y tags); se anuncia también formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 112,9 GB), GGUF (según tags), librería `edge0` |

## Arquitectura y entrenamiento

El modelo se presenta como una arquitectura Mixture-of-Experts con la etiqueta específica `latent-moe`, lo que sugiere una variante de enrutamiento por expertos con representaciones latentes, aunque la documentación disponible no detalla el número de expertos, la estrategia de enrutamiento ni la proporción de parámetros activos por token. El modelo base declarado es Qwen/Qwen3.8-Flash-Next, sobre el que Edge0 habría aplicado un proceso de cuantización a 4 bits en formato NVFP4, orientado a reducir el coste de memoria y facilitar el despliegue en hardware de inferencia con soporte para tipos numéricos de cuarta precisión.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas concretas más allá de la propia cuantización NVFP4 y la orientación declarada a inferencia en el borde. La model card no incluye sección de arquitectura, entrenamiento ni evaluación; el contenido publicado consiste esencialmente en metadatos y estilos de presentación. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Generación y asistencia en código, indicada por la etiqueta `coding`.
- Cargas de trabajo agénticas, indicadas por la etiqueta `agent`.
- Inferencia en el borde (`edge-inference`), orientada a entornos con restricciones de memoria y cómputo.
- Compatibilidad con endpoints (`endpoints_compatible` según tags), lo que sugiere integración con API de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente de código en el editor: el modelo puede emplearse para autocompletado y generación de funciones en entornos de desarrollo integrado, aprovechando su orientación declarada a `coding` y su formato cuantizado a 4 bits, que reduce la huella de memoria frente a pesos en precisión completa.
- Automatización de tareas agénticas de corta duración: gracias a la etiqueta `agent`, encaja en flujos donde un orquestador lanza llamadas al modelo para descomponer tareas, seleccionar herramientas y sintetizar resultados, siempre que se valide empíricamente el soporte real de function calling.
- Despliegue en dispositivos de borde o estaciones de trabajo con GPU de gama media: la cuantización NVFP4 y la disponibilidad de GGUF permiten ejecutar el modelo en hardware con memoria limitada, útil para prototipos locales sin dependencia de la nube.
- Generación de documentación técnica y comentarios de código: el modelo puede redactar descripciones de funciones y módulos a partir del código fuente, una tarea de texto acotada que no exige contexto extremadamente largo.
- Chat de soporte interno para equipos de desarrollo: conversaciones multi-turno sobre APIs, errores de compilación y configuración de entornos, con la salvedad de que la longitud de contexto no está documentada y debe medirse antes de fijar políticas de retención.
- Filtrado y clasificación de fragmentos de código en pipelines de CI: el modelo puede etiquetar parches o revisiones según criterios definidos, integrándose como paso adicional en un flujo de integración continua, siempre que se establezca una validación de calidad previa.
- Experimentación e investigación sobre cuantización: al ser un derivado NVFP4 de un modelo base identificado, resulta útil para estudiar la degradación de calidad frente al modelo original en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 112,9 GB, lo que sugiere que los pesos completos en el formato publicado requieren un volumen de memoria del mismo orden; una cuantización adicional a 4 bits efectivos podría reducirla, pero no se documenta el factor exacto.
- GPU recomendadas: no disponibles en la información proporcionada. La etiqueta `cuda` indica soporte para GPU NVIDIA, y el formato NVFP4 requiere hardware con soporte nativo para ese tipo numérico (generaciones recientes de NVIDIA), aunque el autor no especifica modelos concretos.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamaño del repositorio, un despliegue en GPU de consumo exigiría cuantizaciones más agresivas o descarga parcial de expertos, sin datos publicados que lo respalden.
- Opciones de despliegue: la librería declarada es `edge0`; se anuncia formato GGUF, lo que abriría la puerta a llama.cpp y derivados como Ollama, aunque no se confirma compatibilidad explícita. vLLM y TGI no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-145B-NVFP4 | 4,95 B (safetensors); denominación 145B | no disponible | Apache 2.0 | safetensors, GGUF | Derivado cuantizado de Qwen3.8-Flash-Next |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Origen declarado del proceso de cuantización |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No es posible establecer una comparativa rigurosa con alternativas porque la información proporcionada no incluye especificaciones del modelo base ni de otros modelos de la misma categoría. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- Discrepancia entre el nombre comercial (145B) y el recuento real de parámetros en safetensors (4,95 B): debe verificarse el significado de la cifra antes de dimensionar infraestructura.
- La model card no contiene documentación técnica sustantiva: no hay datos de entrenamiento, evaluación, contexto ni idiomas, lo que impide una validación rigurosa previa a producción.
- Riesgo de alucinación no cuantificado: al no publicarse benchmarks, no puede estimarse la tasa de error en tareas de razonamiento o código.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo base; no se documenta la magnitud de esa pérdida.
- Longitud de contexto desconocida: no deben asumirse ventanas largas en diseños de aplicaciones multi-turno o de análisis de repositorios completos.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado en castellano sin evaluación previa.
- Ausencia de adopción comunitaria (0 descargas, 1 like) y fecha de publicación muy reciente: no existen informes independientes de calidad ni incidencias conocidas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero debe conservarse el aviso de licencia y verificarse las obligaciones heredadas del modelo base Qwen, cuya licencia no se detalla en la información disponible.
- Soporte de tool calling y de modo agente no confirmado documentalmente pese a las etiquetas; requiere prueba empírica antes de integrarlo en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-Flash-Next

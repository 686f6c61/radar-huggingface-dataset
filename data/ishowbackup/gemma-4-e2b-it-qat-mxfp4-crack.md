# Ishowbackup/Gemma-4-E2B-it-qat-MXFP4-CRACK

## Resumen

El modelo `Ishowbackup/Gemma-4-E2B-it-qat-MXFP4-CRACK` es una versión modificada del modelo `google/gemma-4-e2b-it`, desarrollada por el equipo de dealign.ai. Se trata de un modelo multimodal (imagen, texto y audio) con capacidades de razonamiento, cuantizado a 4 bits mediante MXFP4 y convertido al formato MLX para ejecución eficiente en Apple Silicon. La característica principal es la aplicación de una técnica de "abliteración" denominada CRACK, que elimina los mecanismos de rechazo del modelo original, logrando un 100% de cumplimiento en el conjunto de pruebas HarmBench (240/240) con una pérdida mínima de rendimiento en MMLU (-0,9%).

El modelo está pensado para investigación y uso en entornos donde se requiera una respuesta sin filtros de seguridad, aunque el propio autor advierte que el usuario es responsable del cumplimiento legal. Con aproximadamente 1,54 mil millones de parámetros (según los pesos safetensors), es un modelo compacto que puede ejecutarse en Mac con memoria unificada suficiente. Su arquitectura sigue el estilo Gemma-3n, con atención híbrida deslizante/global y embeddings de entrada por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense + Hybrid Sliding/Global Attention, per-layer input embeddings (estilo Gemma-3n) |
| Parametros totales | 1.538.922.051 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | No disponible (se indica "multilingüe" en la model card, sin lista concreta) |
| Licencia | Gemma (términos de Google) |
| Formato de pesos | Safetensors (MLX-native) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` y aplica una técnica de abliteración llamada CRACK, que elimina las direcciones de activación asociadas al rechazo de peticiones dañinas. Según la model card, el proceso de abliteración preserva las capacidades generales: la puntuación MMLU pasa de 54,4% a 53,5% (-0,9%), mientras que el cumplimiento en HarmBench sube de ~0% a 100%. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO. La arquitectura es densa con atención híbrida (sliding y global) y embeddings de entrada por capa, similar a la familia Gemma-3n. El modelo soporta entradas multimodales (visión y audio) y un modo de razonamiento basado en canales ("channel-based thinking").

## Capacidades

- Generación de texto y razonamiento multi-step: verificado en QA factual y razonamiento complejo.
- Generación de código funcional: la model card indica que se ha comprobado la generación de código que funciona.
- Multimodalidad: acepta imágenes (visión) y audio como entrada, con paso en float16 para visión.
- Razonamiento explícito: modo de pensamiento por canales, similar a otros modelos de la familia Gemma.
- Multilingüe: se declara soporte multilingüe, aunque no se especifican los idiomas concretos.
- Sin rechazo: el modelo no se niega a responder a peticiones que el modelo base rechazaría (por ejemplo, actividades ilegales, ciberdelincuencia, contenido dañino).

## Casos de uso

- Asistente multimodal en macOS: al estar en formato MLX, puede integrarse en aplicaciones nativas para Apple Silicon, procesando imágenes, audio y texto en conversaciones de propósito general.
- Generación de código en entornos de desarrollo: su capacidad de generar código funcional y razonar sobre problemas de programación lo hace útil como copiloto local en Mac, sin depender de servicios en la nube.
- Investigación en seguridad de IA: el modelo sirve para estudiar el comportamiento de modelos "abliterados" y los efectos de la eliminación de rechazo en tareas de alineación.
- Prototipado de agentes conversacionales sin restricciones: para entornos controlados donde se necesite explorar respuestas sin filtros de seguridad, por ejemplo en investigación académica sobre sesgos y alucinaciones.
- Análisis de contenido multimedia: al aceptar imágenes y audio, puede transcribir, describir o razonar sobre contenido audiovisual en un Mac, siempre que se respete la legalidad.
- Evaluación comparativa de cuantización MXFP4: útil para desarrolladores que quieran medir el impacto de la cuantización de 4 bits en modelos multimodales con MLX.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, medidos en el entorno de generación (el modelo razona antes de responder):

| Prueba | Base | CRACK | Δ |
|---|---|---|---|
| MMLU | 54,4% | 53,5% | -0,9% |
| HarmBench (cumplimiento) | ~0% | 240/240 (100%) | +100% |

Desglose de HarmBench por categoría:

| Categoría | Cumplimiento |
|---|---|
| Actividades ilegales | 53/53 (100%) |
| Químico / biológico | 42/42 (100%) |
| Ciberdelincuencia / intrusión | 52/52 (100%) |
| Desinformación | 54/54 (100%) |
| Acoso / bullying | 21/21 (100%) |
| Contenido dañino | 18/18 (100%) |

No se proporcionan resultados de otras pruebas (HumanEval, GSM8K, etc.) ni comparaciones con modelos similares.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon (M1 o posterior) y memoria unificada suficiente.
- El tamaño del repositorio es de 4,0 GB (la model card indica 3,8 GB), por lo que se recomienda al menos 8 GB de RAM unificada para cargar el modelo en memoria, aunque el uso real dependerá del contexto y las entradas multimodales.
- No se especifican requisitos de VRAM porque el modelo está diseñado para MLX, que usa la memoria unificada del Mac.
- Runtime recomendado: vMLX (https://vmlx.net), que incluye soporte completo para Gemma 4. Las librerías estándar `mlx_lm` o `mlx_vlm` no soportan completamente este modelo.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El único punto de referencia es el modelo base `google/gemma-4-e2b-it`, del cual se deriva. La comparación se limita a los cambios introducidos por la abliteración (MMLU y HarmBench), ya reflejados en la sección de benchmarks. No se conocen otros modelos abliterados de tamaño similar con soporte multimodal y cuantización MXFP4 en MLX.

## Limitaciones y advertencias

- Modelo "uncensored": al eliminar el rechazo, el modelo puede generar contenido ilegal, dañino o éticamente cuestionable. El autor declara que el uso es bajo responsabilidad del usuario y que debe cumplirse la legislación aplicable.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; como cualquier modelo de 2B efectivos, puede inventar información.
- Sesgos: no se han documentado sesgos concretos, pero al ser un modelo derivado de Gemma, puede heredar sesgos del entrenamiento original.
- Limitaciones de contexto: no se especifica la longitud de contexto; se desconoce si soporta ventanas largas.
- Idiomas: aunque se declara multilingüe, no hay lista de idiomas soportados ni evaluación de calidad por idioma.
- Licencia: la licencia Gemma de Google impone restricciones de uso comercial y requiere cumplir sus términos; la abliteración puede violar las políticas de uso aceptable de Google.
- Soporte limitado: el modelo solo funciona con vMLX; no es compatible con las herramientas MLX estándar, lo que reduce su portabilidad.
- Fecha de creación: el modelo fue subido en agosto de 2026, lo que sugiere que es una versión reciente y posiblemente inestable.

## Enlaces

- HuggingFace: https://huggingface.co/Ishowbackup/Gemma-4-E2B-it-qat-MXFP4-CRACK
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- vMLX (runtime requerido): https://vmlx.net
- dealign.ai (investigación): https://dealign.ai
- Ko-fi (soporte): https://ko-fi.com/dealignai
- X (Twitter): https://x.com/dealignai

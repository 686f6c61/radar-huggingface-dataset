# john-0824/Qwen3.8-27B-Obliterated-Rank8-Adapter

## Resumen

El repositorio `john-0824/Qwen3.8-27B-Obliterated-Rank8-Adapter` no contiene un modelo completo, sino un adaptador de bajo rango de 21 MB que, al fusionarse con `Qwen/Qwen3.8-27B`, reproduce el comportamiento de una cirugía de pesos orientada a eliminar la conducta de rechazo (abliteration). El adaptador es la compresión óptima por SVD truncada a rango 8 por tensor (Eckart–Young) de los cambios de pesos del artefacto certificado original. No incluye pesos fusionados: es un parche que debe aplicarse sobre la revisión concreta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base.

El modelo base, Qwen3.8-27B, es un transformer de 27.000 millones de parámetros de la familia Qwen, distribuido bajo licencia Apache-2.0. El adaptador se distribuye en formato `safetensors` en fp16 y contiene pares `(B, A)` para 78 módulos, junto con un manifiesto `key_map` que indica sobre qué módulo aplicar `W += B @ A`. La fusión se realiza sumando el producto de las matrices de bajo rango a cada módulo nombrado.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión extrema de deltas de pesos (de un artefacto completo a 21 MB) con métricas de fidelidad declaradas; por otro, es un ejemplo de modelo "uncensored" cuyo uso está restringido de facto a investigación de alineamiento, red-teaming y evaluación de seguridad, dado que elimina deliberadamente los mecanismos de rechazo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango (SVD truncada a rango 8) sobre transformer Qwen3.8-27B |
| Parametros totales | No disponible para el adaptador; modelo base: 27.000 millones (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en fp16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ws_rank8_adapter.safetensors`, fp16), mas `ws_rank8_adapter.json` y `ws-rank8-certification.json` |

## Arquitectura y entrenamiento

El adaptador no es un modelo entrenado de forma convencional, sino el resultado de una compresión de bajo rango de los deltas de pesos producidos por una cirugía de pesos (weight surgery) sobre Qwen3.8-27B. Para cada uno de los 78 módulos modificados se extrae una SVD truncada al top-8 por tensor, lo que da lugar a pares `(B, A)` en fp16 que se suman al módulo correspondiente mediante `W += B @ A`. La reconstrucción exige fijar la revisión exacta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), ya que los nombres y formas de los módulos deben coincidir.

El proceso se realizó con la herramienta OBLITERATUS (v0.1.4, commit `b2e65a7`), que implementa la abliteration inspirada en Arditi et al. (2024), *Refusal in Language Models Is Mediated by a Single Direction*. El autor declara que el núcleo de rango 8 captura el 99,5 % de la norma del delta por tensor del modelo certificado, y que el modelo fusionado difiere del artefacto exacto en aproximadamente un 0,45 % por tensor modificado. La reproducción byte a byte del artefacto exacto no es posible con rango finito, por lo que el autor recomienda citar las métricas certificadas del propio repositorio para esta variante. No se especifican datos de entrenamiento (tokens, composición del dataset) ni etapas de RLHF/DPO, ya que no se trata de un entrenamiento sino de una transformación de pesos.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B (no se detallan capacidades específicas en la información disponible).
- Comportamiento "uncensored": el modelo fusionado elimina la conducta de rechazo del base, con una tasa de rechazo declarada del 2,02 % frente al 96,00 % del base en el protocolo de evaluación del autor.
- Coherencia retenida: el autor declara retención del 100 % (1,00) en la métrica de coherencia.
- Verificaciones deterministas de capacidad: 5/6 idénticas al modelo base en los ítems evaluados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación de alineamiento y mecanismos de rechazo: el adaptador permite reproducir con 21 MB el efecto de una cirugía de pesos completa, lo que facilita experimentos comparativos entre modelo base y modelo abliterado sin almacenar dos checkpoints de 27B.
- Red-teaming y evaluación de seguridad: al eliminar los rechazos, sirve para medir la robustez de filtros externos, clasificadores de contenido y políticas de despliegue frente a un modelo que cumple solicitudes que el base rechazaría.
- Estudio de compresión de deltas de pesos: el repositorio documenta fidelidad por tensor (99,5 % de norma capturada, 0,45 % de desviación) y métricas de KL y perplejidad, lo que lo convierte en un caso de estudio reproducible sobre SVD truncada aplicada a modificaciones de modelos.
- Auditoría de artefactos certificados: el manifiesto `ws_rank8_adapter.json` y el fichero `ws-rank8-certification.json` permiten verificar estadísticas de extracción por tensor y métricas del modelo fusionado, útil en pipelines de validación de modelos.
- Experimentación local responsable: con un adaptador de 21 MB, un investigador puede reconstruir el modelo fusionado sobre el base en una máquina con capacidad para 27B en fp16 o cuantizado, sin descargar un segundo checkpoint completo.
- Docencia y formación en seguridad de IA: permite mostrar de forma tangible cómo una dirección de rechazo puede eliminarse y qué coste tienen esas modificaciones en métricas de capacidad (MMLU, perplejidad, KL).

## Benchmarks y rendimiento

Resultados certificados por el autor sobre el modelo fusionado (test final reservado, 200 prompts, mismo protocolo que el base):

| Metrica | Base | Modelo fusionado rango 8 |
|---|---|---|
| Tasa de rechazo (completions validas) | 96,00 % (192/200) | 2,02 % (4/198) |
| Completions dañinas invalidas/degeneradas | 0 % | 1 % |
| Coherencia (retencion) | 1,00 | 1,00 (100 %) |
| Verificaciones deterministas de capacidad (6) | 5/6 | 5/6 (items identicos) |
| Ratio de perplejidad | 1,000 | 1,009 |
| KL de tokens de secuencia vs base (nats) | 0 | 0,113 |
| MMLU 0-shot (570 preguntas) | 85,1 % | 86,1 % (+1,1 pp) |

El autor indica además que el artefacto exacto (sin compresión) obtiene una tasa de rechazo del 1,52 % y un MMLU del 86,3 %, diferencias que considera dentro del ruido de medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador (21 MB); el modelo fusionado requiere los recursos de Qwen3.8-27B, no cuantificados en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la librería declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | MMLU 0-shot | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | 96,00 % | 85,1 % | Apache-2.0 | safetensors |
| Qwen3.8-27B-Obliterated (artefacto exacto) | 27B | no disponible | 1,52 % | 86,3 % | Apache-2.0 | no disponible |
| Qwen3.8-27B-Obliterated Rank-8 Adapter (este) | 27B (adaptador 21 MB) | no disponible | 2,02 % | 86,1 % | Apache-2.0 | safetensors (adaptador) |

No se dispone de datos de otros modelos abliterados comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina los mecanismos de rechazo del modelo base: el modelo fusionado puede cumplir solicitudes que el base rechazaría. El autor lo restringe a investigación de alineamiento, red-teaming, evaluación de seguridad y experimentación local responsable.
- La reproducción byte a byte del artefacto exacto no es posible con rango finito; queda una cola de preservación de norma a rango completo. Deben citarse las métricas certificadas del repositorio, no las del artefacto exacto.
- La fusión exige la revisión exacta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`); otra revisión puede romper la correspondencia de módulos.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el ratio de perplejidad de 1,009 y el KL de 0,113 nats sugieren una desviación pequeña pero no nula respecto al base.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el propio autor advierte de la responsabilidad exclusiva del usuario sobre el contenido generado; conviene evaluar implicaciones legales y de política de contenido antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/john-0824/Qwen3.8-27B-Obliterated-Rank8-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OBLITERATUS (elder-plinius): https://github.com/elder-plinius/OBLITERATUS
- Arditi et al. (2024), *Refusal in Language Models Is Mediated by a Single Direction*: no disponible enlace directo en la información proporcionada

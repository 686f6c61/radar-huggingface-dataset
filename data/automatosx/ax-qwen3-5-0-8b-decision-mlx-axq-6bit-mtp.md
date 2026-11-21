# AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.5-0.8B-decision-MLX-AXQ-6bit-MTP es una cuantización experimental del modelo mlx-community/Qwen3.5-0.8B-decision, publicada por AutomatosX. Se trata de un artefacto de investigación orientado a MLX (el framework de Apple para ejecución en silicio Apple y Metal), no de un modelo entrenado desde cero. El autor lo describe explícitamente como "research development artifact" y advierte de que no emite certificado de calidad alguno.

El modelo base pertenece a la familia Qwen3.5 en su variante "decision", es decir, una versión afinada para producir salidas estructuradas de decisión (elección entre categorías con probabilidades, puntuaciones de urgencia, etc.) en lugar de texto libre. Con 752.393.024 parámetros reales según los safetensors, es un modelo pequeño pensado para tareas de clasificación y enrutamiento de baja latencia.

La particularidad de esta ficha es el esquema de cuantización AXQ: un empaquetado affine de 6 bits con protección de precisión en tensores sensibles, que el autor distingue explícitamente de MXFP6 y de un almacenamiento uniforme de seis bits. El repositorio incluye además pesos MTP (multi-token prediction) protegidos, aunque el autor señala que su ejecución, tasa de aceptación y aceleración no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), variante "decision" con cabezas de decisión; pesos MTP incluidos |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 6 bits con precisión mixta y protecciones de mayor precisión; BPW medido completo 9,058246 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo mlx-community/Qwen3.5-0.8B-decision, un transformer de la familia Qwen3.5 adaptado a tareas de decisión. Esta publicación no entrena el modelo: parte de una revisión inmutable del repositorio fuente (`36e166ca10c4d16471a231d66cfc22d80039fe34`) y aplica un pipeline de cuantización AXQ con empaquetado affine de 6 bits y "precision protection floors" sobre determinados tensores. El resultado ocupa 1.019.917.465 bytes en disco y un BPW medido de 9,058246, que incluye tensores protegidos y sobrecarga de almacenamiento.

El autor no documenta en esta ficha el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información correspondería al repositorio upstream. La innovación técnica destacable es doble: por un lado, el esquema AXQ de cuantización mixta (que no debe confundirse con MXFP6 ni con un seis bits uniforme); por otro, la inclusión de pesos MTP protegidos, orientados a decodificación multi-token especulativa, aunque el autor indica que su comportamiento no está verificado. Los detalles por módulo están en `axquant_manifest.json`, `axquant_plan.json` y `config.json`.

## Capacidades

- Generación de salidas de decisión estructuradas: elección entre categorías con distribución de probabilidades, puntuaciones con leyenda y valores de tipo "noul".
- Clasificación con umbral de confianza: el smoke test documentado devuelve `confidence` junto a cada decisión (por ejemplo, 0,5312 para "technical" frente a 0,4688 para "billing").
- Puntuación de urgencia: salida numérica con leyenda asociada (0 = "Can wait", 1 = "Today"), con score 0,8176 en el caso documentado.
- Enrutamiento de tickets o solicitudes hacia departamentos o colas.
- Pesos MTP incluidos para decodificación multi-token especulativa, si bien la aceleración no está verificada.
- Capacidades de texto libre, razonamiento, código, matemáticas, visión, tool calling, agentes y multilingüismo: no documentadas en la información disponible para esta variante.
- API de carga específica: `clef_mlx.load` y `model.systemone` para las cabezas de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo devuelve una elección de departamento con probabilidades, lo que permite derivar la solicitud a "billing" o "technical" y aplicar un umbral de confianza para escalar a revisión humana cuando la distribución es ambigua.
- Priorización de incidencias: la salida de urgencia con score y leyenda permite ordenar una cola de atención (por ejemplo, "hoy" frente a "puede esperar") sin necesidad de un LLM generativo grande.
- Triaje en local sobre Apple Silicon: al estar empaquetado en MLX y ocupar alrededor de 1 GB en disco, puede ejecutarse en un portátil Mac para preclasificar solicitudes antes de enviarlas a un modelo mayor en servidor.
- Filtrado previo en pipelines de atención al cliente: clasificar y puntuar cada mensaje entrante con baja latencia y derivar solo los casos complejos al modelo generativo principal.
- Experimentación en investigación sobre cuantización: el artefacto sirve como caso de estudio reproducible del esquema AXQ con precisión mixta, con manifiesto y plan de cuantización incluidos para auditar la distribución de precisión por módulo.
- Pruebas de decodificación especulativa: los pesos MTP incluidos permiten experimentar con decodificación multi-token, siempre que se valide antes la tasa de aceptación y la aceleración real.
- Prototipado de sistemas de decisión estructurada: la API `model.systemone` facilita integrar cabezas de decisión en un servicio interno sin construir un parser de salida de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es un smoke test funcional en MLX-LM 0.32.2 con MLX 0.32.4 sobre Metal, que el propio autor califica de comprobación funcional y no de benchmark de calidad, evaluación MTEB, evaluación de código, prueba de contexto largo ni resultado de aceleración MTP. El caso documentado devuelve elección de departamento "technical" con confianza 0,5312, urgencia 0,8176 y un valor "noul" de 0,4378, con resultado global `passed: true`.

## Requisitos de hardware

- Almacenamiento: 1.019.917.465 bytes (aproximadamente 1 GB) para el repositorio completo. El tamaño de fichero no determina el pico de memoria en tiempo de ejecución, según advierte el autor.
- Memoria en ejecución: no disponible de forma medida; con 752 millones de parámetros y BPW completo de 9,058246, el pico de memoria debe validarse empíricamente.
- GPU recomendadas: el artefacto está empaquetado para MLX y Metal, por lo que el entorno objetivo son equipos Apple Silicon. No hay datos de ejecución en A100, H100 ni RTX 4090.
- GPU de consumo: cabe esperar que quepa en equipos Apple Silicon de gama consumer, pero no se aporta una medición de VRAM unificada.
- Opciones de despliegue: MLX-LM 0.32.2 (verificado con el smoke test); MLX-VLM no probado por separado; AX Engine no probado; omlx y mtplx no soportados (solo estático).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-6bit-MTP | 752.393.024 | no disponible | AXQ 6 bits mixta, BPW 9,058246 | Apache 2.0 | Artefacto de investigación, smoke test funcional superado |
| mlx-community/Qwen3.5-0.8B-decision (base) | no disponible en la información | no disponible | formato original del repositorio fuente | Apache 2.0 (según herencia) | Modelo base del que deriva esta cuantización |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | El autor indica que los exports específicos de cada runtime requieren variantes distintas y sus propias pruebas |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- El autor califica el artefacto como "research development artifact" y declara explícitamente que no emite certificado de calidad.
- El esquema de cuantización es un empaquetado affine de 6 bits con protección de mayor precisión; no es MXFP6 ni almacenamiento uniforme de seis bits, por lo que no debe compararse con esos formatos.
- Los pesos MTP están incluidos pero su ejecución, tasa de aceptación y velocidad no están verificadas; no deben asumirse ganancias de rendimiento.
- El smoke test superado es funcional y acotado a una tarea de decisión; no cubre calidad, MTEB, código, contexto largo ni aceleración.
- Modalidades no ejercitadas y comportamiento MTP permanecen sin verificar.
- omlx y mtplx no están soportados (solo análisis estático); AX Engine no ha sido probado y los metadatos de arquitectura no constituyen evidencia de ejecución.
- El tamaño de fichero no establece el pico de memoria en tiempo de ejecución; es necesario medirlo en el hardware objetivo.
- La licencia Apache 2.0 se hereda del modelo fuente, pero el uso downstream se rige por el repositorio upstream y su licencia; no se implica ninguna concesión comercial adicional ni transferencia de benchmarks o certificaciones del modelo original.
- No se documentan sesgos, riesgo de alucinación ni cobertura de idiomas para esta variante; deben evaluarse antes de cualquier uso en producción.
- Se recomienda fijar la revisión inmutable del Hub al descargar para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision
- Revisión inmutable del modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision/tree/36e166ca10c4d16471a231d66cfc22d80039fe34
- Manifiesto de cuantización: `axquant_manifest.json` (incluido en el repositorio)
- Plan de cuantización: `axquant_plan.json` (incluido en el repositorio)
- Informe estático de compatibilidad: `axquant_compatibility.json` (incluido en el repositorio)
- Configuración: `config.json` (incluido en el repositorio)

# ItsVej/pea-1

## Resumen

ItsVej/pea-1 es un modelo de 1.881.827.136 parámetros (aproximadamente 1,88 mil millones) publicado en HuggingFace por el usuario ItsVej y etiquetado con el pipeline `text-classification`. La etiqueta de arquitectura `qwen3_5_text` indica que deriva de la familia Qwen 3.5 en su variante exclusivamente de texto, reutilizada aquí para una tarea discriminativa de clasificación en lugar de generación abierta. El repositorio contiene pesos en formato `safetensors` con un tamaño total de 7,6 GB, lo que es coherente con un almacenamiento en precisión FP32 de esos 1,88B de parámetros.

El modelo resuelve, según los metadatos disponibles, la asignación de etiquetas a textos en inglés (`en` es el único idioma declarado). No se documentan en la información proporcionada ni el conjunto de etiquetas, ni el corpus de entrenamiento, ni métricas de evaluación, ni la longitud de contexto soportada, por lo que cualquier evaluación de idoneidad para producción debe hacerse mediante pruebas propias sobre el dominio objetivo antes de adoptarlo.

Su relevancia actual es limitada pero concreta: se trata de un encoder/decoder de tamaño medio (1,88B) con licencia Apache 2.0, lo que permite uso comercial sin restricciones de licencia, si bien el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. Al no existir descargas ni valoraciones ni benchmarks publicados en el momento de redactar esta ficha, debe considerarse un artefacto en fase temprana y sin validación externa conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (familia Qwen 3.5, variante solo texto); detalles de la arquitectura interna no disponibles |
| Parametros totales | 1.881.827.136 (aproximadamente 1,88B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos `safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (tamaño de repo 7,6 GB, consistente con FP32) |
| Pipeline declarado | `text-classification` |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

La etiqueta de arquitectura `qwen3_5_text` sitúa el modelo en la familia Qwen 3.5 de Alibaba, en su variante de solo texto. Se trata, por tanto, de un transformer decoder-only reutilizado para clasificación: la cabeza y el procedimiento exactos (cabeza lineal sobre el token de pooling, clasificación generativa de etiquetas o ajuste con `num_labels` sobre el modelo base) no se detallan en la información disponible. El recuento de parámetros (1,88B) es coherente con un modelo base de esa escala sin recortes apreciables, aunque no se puede confirmar si se congelaron capas durante el ajuste fino.

No hay información pública sobre el volumen de datos de entrenamiento, la composición del corpus, el número de tokens vistos, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado con anotadores humanos. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, atención con ventana deslizante) ni la estrategia de tokenización. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Clasificación de texto en inglés: es la única capacidad declarada explícitamente mediante el pipeline `text-classification`.
- Asignación de etiquetas a documentos, frases o fragmentos, siempre que el conjunto de etiquetas coincida con el usado en el ajuste (no documentado).
- Generación de texto libre: no documentada; al derivar de un modelo causal de la familia Qwen 3.5 podría conservar parte de la capacidad generativa, pero no hay confirmación ni ejemplos en la ficha.
- Razonamiento multi-paso y modo "thinking": no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; la variante es explícitamente de texto.
- Capacidades multilingües: limitadas al inglés según los metadatos; el rendimiento en castellano u otros idiomas no está documentado.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede clasificar comentarios o publicaciones en categorías de riesgo (spam, toxicidad, contenido prohibido) siempre que se defina y valide un conjunto de etiquetas propio; su tamaño de 1,88B permite desplegarlo en una GPU de 24 GB con margen.
- Enrutamiento de tickets de soporte: clasificar cada ticket entrante en una categoría (facturación, incidencias técnicas, cancelaciones) para dirigirlo al equipo adecuado; el coste por inferencia es bajo en FP16 (aproximadamente 3,8 GB de pesos) y compatible con procesamiento por lotes.
- Análisis de sentimiento en reseñas de producto: asignar polaridad positiva, negativa o neutra a reseñas en inglés, integrándolo en un pipeline deTransformers con `pipeline("text-classification")`.
- Detección de spam en correo electrónico: clasificación binaria de mensajes a partir de asunto y cuerpo, ejecutable en CPU con cuantización INT8 para volúmenes moderados.
- Etiquetado y curación de datasets de entrenamiento: uso como clasificador auxiliar para filtrar, deduplicar por categoría o preetiquetar grandes corpus en inglés antes de la revisión humana.
- Triaje de alertas de seguridad: clasificar eventos o informes de logs en niveles de severidad, con el modelo actuando como primera etapa de filtrado antes de un analista.
- Clasificación de documentos legales o financieros: categorización de contratos o informes por tipo documental, siempre que la longitud del texto quepa en la ventana de contexto efectiva (no documentada) o se fragmente previamente.

En todos los casos, la ausencia de métricas publicadas obliga a realizar una validación sobre un conjunto etiquetado propio antes de usar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No constan evaluaciones en MMLU, HumanEval, GSM8K, GLUE, SuperGLUE ni en ningún otro conjunto, ni tampoco métricas específicas de clasificación (exactitud, F1 macro, F1 por clase) sobre el corpus de ajuste o de validación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,88B parámetros, sin incluir overhead de activaciones ni caché KV):
  - FP32: aproximadamente 7,5 GB solo de pesos; con overhead, del orden de 9-10 GB.
  - FP16/BF16: aproximadamente 3,8 GB de pesos; con overhead, del orden de 5-6 GB.
  - INT8: aproximadamente 1,9 GB de pesos; con overhead, del orden de 3 GB.
  - INT4: aproximadamente 0,9 GB de pesos; con overhead, del orden de 2 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor con procesamiento por lotes; RTX 4090 (24 GB) para desarrollo y producción a baja escala en FP16.
- Cabe en GPU de consumo: sí. RTX 4090, 4080 (16 GB), 4070 Ti (12-16 GB) y 3090/3060 (12 GB) admiten FP16 con holgura; tarjetas de 8 GB requieren INT8 o INT4.
- CPU: viable con cuantización INT8/INT4 dinámica para cargas de baja concurrencia, aunque la latencia será sensiblemente mayor.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`; servidores de inferencia como TGI o vLLM (el soporte de vLLM para modelos de clasificación requiere configuración de pooling/`classify`, no confirmada para esta arquitectura); `llama.cpp` u Ollama solo si se generan conversiones GGUF propias, ya que el repositorio no las incluye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en clasificación |
|---|---|---|---|---|---|
| ItsVej/pea-1 | 1,88B | no disponible | Apache 2.0 | gated en HuggingFace | no disponible |
| Qwen3-1.7B | 1,7B | 32k tokens (nativo) | Apache 2.0 | abierto en HuggingFace | no disponible como clasificador sin ajuste |
| Llama 3.2 1B | 1,24B | 128k tokens | Llama 3.2 Community License | abierto (con aceptación) | no disponible como clasificador sin ajuste |
| DeBERTa-v3-large | ~435M | 512 tokens | MIT | abierto en HuggingFace | referencia habitual en clasificación; métricas no verificadas contra este modelo |

Los datos de contexto y licencia de los modelos comparativos provienen de sus fichas públicas y no se han verificado contra resultados experimentales de pea-1. La comparación de rendimiento no es posible porque pea-1 no publica métricas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composición del corpus de entrenamiento ni el esquema de anotación, no es posible evaluar sesgos demográficos, culturales o de dominio.
- Riesgo de alucinación: si el modelo conserva la cabeza generativa del modelo base, podría producir etiquetas fuera del conjunto predefinido; si usa una cabeza de clasificación cerrada, el riesgo se limita a etiquetas erróneas con alta confianza. Ninguno de los dos escenarios está confirmado.
- Conjunto de etiquetas desconocido: la ficha no especifica `id2label`/`label2id`, por lo que el significado de las salidas debe inspeccionarse en `config.json` antes de cualquier integración.
- Cobertura lingüística: solo inglés declarado; el comportamiento en castellano no está documentado y no debería asumirse.
- Longitud de contexto: no disponible; textos largos pueden truncarse silenciosamente según la configuración del tokenizador.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el acceso está restringido (gated), lo que añade un paso de aceptación de condiciones y puede limitar la automatización de descargas en CI/CD.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni documentación de entrenamiento; no hay evidencia externa de calidad.
- Producción: al no haber métricas ni pruebas publicadas, se recomienda tratar el modelo como candidato a evaluar, no como componente validado, y establecer una puerta de calidad con datos propios antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsVej/pea-1

No se han encontrado en la información disponible papers, blogs técnicos, repositorios de código ni demos asociados al modelo.

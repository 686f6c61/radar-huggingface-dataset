# ducvh5/wan21-a5b5x4c5-tf-fm-ln2-qt-fw-hd-item-wanneg

## Resumen

Este repositorio contiene un checkpoint derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto desarrollado por Alibaba (Wan-AI). El autor, identificado como `ducvh5`, publica un ajuste fino experimental sobre la variante de 1.300 millones de parámetros en formato Diffusers, orientado a la síntesis de vídeo texto-a-vídeo. La nomenclatura del identificador (`a5b5x4c5`, `ln2`, `qt`, `fw-hd`, `item`, `wanneg`) sugiere una configuración concreta de bloques recurrentes, normalización de capas, cuantización y mezcla de datasets.

La model card es extremadamente escueta y describe una arquitectura basada en *recurrent transformer* con 15 bloques únicos reutilizados hasta 30 ejecuciones (esquema A5 → B5×4 → C5), entrenada con una combinación de pérdidas de *teacher forcing* (TF) y *flow matching* (FM). La información sobre datos, licencia, idiomas y pesos finales es incompleta: el propio autor indica que no se ha guardado ningún checkpoint en esta instantánea.

Por tanto, se trata de un artefacto de investigación de trazabilidad limitada, sin descargas ni validación comunitaria, que debe evaluarse con cautela. Es relevante únicamente para quienes siguen las variantes experimentales de Wan2.1 y quieran reproducir o inspeccionar configuraciones de bloques recurrentes en pipelines de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrent transformer (derivada de Wan2.1-T2V-1.3B); 15 bloques únicos, 30 ejecutados (A5 → B5×4 → C5) |
| Parámetros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la etiqueta `qt` sugiere cuantización, sin especificar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Diffusers (snapshot sin pesos guardados: "no checkpoint saved") |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusión para texto-a-vídeo. Sobre esa base, el autor introduce una estructura recurrente de bloques: cinco bloques en la fase A, cinco bloques repetidos cuatro veces en la fase B (20 ejecuciones) y cinco bloques en la fase C, sumando 15 bloques únicos y 30 ejecuciones efectivas. Esta reutilización de parámetros reduce el coste computacional a cambio de profundidad efectiva.

El entrenamiento combina pérdidas de *teacher forcing* (TF) y *flow matching* (FM), con un schedule de ruido definido como σ ~ LogNormal(0,1), *shift* = 2 y t = 1000σ. Los datos provienen de un conjunto denominado "OV" con leyendas QT en proporción 50/50 entre variantes VB y completas, y mezcla 50/50 entre OV y FW-HD por ítem, con *dropout* etiquetado como "WN". No se especifica el número de tokens, pasos de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Condicionamiento por prompt textual con leyendas de distinta granularidad (VB y completas).
- Reutilización de bloques recurrentes para reducir parámetros efectivos.
- No se documenta soporte de *tool calling*, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado de pipelines texto-a-vídeo: sirve para experimentar con arquitecturas recurrentes sobre Wan2.1 en entornos de investigación, dado su tamaño de 1,3B.
- Investigación en eficiencia de parámetros: permite estudiar el impacto de reutilizar bloques (15 únicos / 30 ejecutados) en la calidad del vídeo generado.
- Generación de clips cortos de baja resolución para pruebas de concepto en estudios de animación o previsualización.
- Comparación de schedules de ruido: el esquema σ ~ LogNormal(0,1) con shift=2 permite evaluar variantes de *flow matching* frente al modelo base.
- Docencia y experimentación académica: su tamaño moderado facilita ejecutarlo en GPUs de gama alta consumer para demostraciones.
- Reproducción de ablaciones: la mezcla 50/50 OV/FW-HD y el dropout WN permiten aislar efectos de composición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño de 1,3B del modelo base, se estima en torno a 8-16 GB en fp16/bf16, aunque el snapshot no contiene pesos.
- GPU recomendadas: no disponibles; por tamaño, cabría esperar RTX 4090, A100 o H100 para inferencia de vídeo.
- Cabe en GPU consumer: probablemente sí en RTX 4090 y superiores, sin confirmación oficial.
- Opciones de despliegue: Diffusers (formato del snapshot); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-... (este) | 1,3B | No disponible | Texto-a-vídeo | No disponible | Snapshot sin pesos |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1,3B | No disponible | Texto-a-vídeo | No disponible en esta ficha | Público en HF |
| Otros modelos texto-a-vídeo de ~1-2B | No disponible | No disponible | Texto-a-vídeo | No disponible | No disponible |

## Limitaciones y advertencias

- El snapshot no contiene pesos ("no checkpoint saved"), por lo que no es utilizable directamente para inferencia.
- Licencia no especificada: riesgo legal para uso comercial.
- Idiomas no declarados; el comportamiento multilingüe es desconocido.
- Sin descargas ni validación comunitaria: no hay evidencia de calidad ni de reproducibilidad.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión de vídeo de pequeño tamaño.
- La model card es fragmentaria; parámetros como contexto, cuantización y datos de entrenamiento no están documentados.
- Posibles sesgos heredados del dataset OV/FW-HD, no auditados.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-ln2-qt-fw-hd-item-wanneg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers

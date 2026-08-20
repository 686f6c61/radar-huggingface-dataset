# edgar1019/aigent-stage2-burnout-multilabel-v1

## Resumen

El modelo `edgar1019/aigent-stage2-burnout-multilabel-v1` es un artefacto de clasificación de texto multilabel en coreano, desarrollado por el usuario edgar1019 como parte de un sistema denominado Re:Mind Stage 2. Su propósito es detectar señales informativas de agotamiento (burnout) en texto, mediante seis etiquetas independientes: agotamiento, sobrecarga, indefensión, baja eficacia, ansiedad e irritabilidad. Es importante destacar que no es un modelo de diagnóstico médico, sino una herramienta de análisis de patrones con fines informativos.

El modelo está entrenado con una combinación de datos anotados por humanos y datos débiles negativos, utilizando pérdida BCE enmascarada. Se encuentra en estado `shadow_only`, lo que significa que no está aprobado para uso en producción sin validación adicional. Solo la etiqueta de ansiedad supera actualmente el umbral de precisión configurado; el resto permanece bloqueado. El repositorio tiene un tamaño de 0,4 GB y está disponible en Hugging Face con licencia no especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de codificación (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 tokens (máximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (según la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al ser un modelo de clasificación de texto de la librería transformers, se trata de un transformer de codificación (encoder-only) típico para tareas de clasificación. El entrenamiento utilizó pérdida BCE con logits enmascarados, con 179 filas de entrenamiento anotadas por humanos y 4.524 filas débiles negativas, más 100 filas de validación independiente excluidas del entrenamiento. Se aplicó un peso de muestra débil de 0,10 y una longitud máxima de secuencia de 256 tokens. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

El modelo produce seis salidas sigmoid independientes, por lo que las probabilidades no suman uno. Se incluyen archivos de configuración como `thresholds.json` y `label_mapping.json` para interpretar las salidas correctamente.

## Capacidades

- Clasificación multilabel de texto en coreano para seis señales de burnout: agotamiento, sobrecarga, indefensión, baja eficacia, ansiedad e irritabilidad.
- Salidas independientes con sigmoid, permitiendo múltiples etiquetas activas simultáneamente.
- Diseñado para uso informativo y no diagnóstico; no apto para evaluación clínica.
- Compatible con el pipeline `text-classification` de Hugging Face.
- Incluye metadatos de calibración por etiqueta (solo ansiedad supera el umbral de precisión actualmente).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis de encuestas de bienestar laboral: el modelo puede procesar respuestas abiertas de empleados en coreano para identificar señales de agotamiento, ayudando a departamentos de RR. HH. a priorizar intervenciones, siempre con supervisión humana y sin tomar decisiones automáticas.
- Investigación académica en psicología organizacional: los investigadores pueden usar el modelo para etiquetar grandes volúmenes de texto cualitativo (entrevistas, diarios) y estudiar patrones de burnout, teniendo en cuenta que no es un instrumento validado clínicamente.
- Prototipos de asistentes de bienestar: integración en aplicaciones de salud mental como indicador preliminar de señales de estrés, con la obligación de mostrar `informational_only=true` y `risk_score_eligible=false`.
- Monitorización de foros o comunidades online (en coreano) para detectar tendencias de agotamiento en grupos específicos, siempre con fines descriptivos y no de diagnóstico individual.
- Desarrollo de pipelines de NLP en coreano: sirve como punto de partida para fine-tuning o como baseline en tareas de clasificación de emociones o estados psicológicos.
- Auditoría de contenido: clasificación de textos de empleados en canales internos para identificar posibles casos de sobrecarga o ansiedad, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la etiqueta `anxiety` pasa el umbral de precisión configurado, pero no se proporcionan métricas numéricas (precisión, recall, F1, etc.).

## Requisitos de hardware

- El tamaño del repositorio es de 0,4 GB, lo que sugiere un modelo relativamente pequeño (probablemente menos de 500 millones de parámetros, aunque no se confirma).
- No se especifican requisitos de VRAM, pero un modelo de este tamaño podría ejecutarse en GPUs consumer como una RTX 3060 (12 GB) o superior, incluso con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante carga local con `local_files_only=True` como indica la model card.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de burnout en coreano). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- No es un modelo de diagnóstico médico: no debe utilizarse para diagnóstico, tratamiento, evaluación de riesgo automatizada o decisiones de elegibilidad.
- Solo la etiqueta `anxiety` supera actualmente el umbral de precisión; las demás etiquetas están bloqueadas y no deben mostrarse como señales válidas en producto.
- El entrenamiento se realizó con un número muy reducido de anotaciones humanas (179 filas), lo que limita la generalización y puede introducir sesgos.
- El modelo está diseñado para texto en coreano; su rendimiento en otros idiomas no está garantizado.
- La licencia no está especificada, por lo que el uso comercial debe consultarse con el autor.
- El estado `shadow_only` indica que no está listo para producción sin validación adicional.
- Riesgo de alucinación o clasificaciones erróneas, especialmente en textos ambiguos o fuera del dominio de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/edgar1019/aigent-stage2-burnout-multilabel-v1
- No se proporcionan otros enlaces (papers, blogs, repositorios) en la información disponible.

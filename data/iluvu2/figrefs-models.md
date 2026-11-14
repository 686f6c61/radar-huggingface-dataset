# iLuvU2/figrefs-models

## Resumen

figrefs-models es una colección de tres modelos de lenguaje especializados en una tarea concreta: identificar, dentro del texto de un artículo científico, las oraciones que discuten o hacen referencia a cada figura del documento. El repositorio lo publica el usuario iLuvU2 en Hugging Face y acompaña al código del proyecto figrefs (github.com/rcharan05/figrefs), que implementa la inferencia local. No es un modelo generativo de propósito general, sino un conjunto de clasificadores y etiquetadores entrenados para extracción de referencias a figuras en literatura científica.

La colección incluye tres variantes con roles diferenciados: SPAN_ES, un etiquetador de spans basado en ModernBERT-large con early stopping, marcado como el modelo único recomendado; C0L, un cross-encoder basado en DeBERTa-v3-large pensado para funcionar en ensemble con SPAN; y SPAN, el etiquetador ModernBERT-large sin early stopping que forma parte del mismo ensemble. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 4,9 GB en total.

El modelo es relevante para pipelines de análisis documental científico, donde localizar automáticamente las menciones textuales a figuras permite construir índices, resúmenes o herramientas de navegación de papers. La información publicada es muy limitada: no hay datos de benchmarks, idiomas declarados ni detalles sobre el proceso de entrenamiento más allá del conjunto de datos empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (span tagger) y DeBERTa-v3-large (cross-encoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La colección combina dos familias de arquitectura transformer encoder-only. SPAN y SPAN_ES emplean ModernBERT-large como etiquetador de spans (span tagger), una formulación que asigna etiquetas a fragmentos de texto para delimitar las oraciones que referencian una figura. C0L utiliza DeBERTa-v3-large como cross-encoder, es decir, evalúa pares de entradas (probablemente oración y figura o contexto) para puntuar su relevancia. La variante SPAN_ES incorpora early stopping durante el entrenamiento, lo que según la model card la convierte en la opción recomendada como modelo único.

El entrenamiento se realizó sobre FigSum+ GS1, un conjunto compuesto por 15 artículos biomédicos. Se trata de un corpus muy reducido, lo que condiciona la generalización del modelo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en modelos encoder de extracción). Tampoco se documentan innovaciones técnicas adicionales más allá del uso de early stopping y de la estrategia de ensemble entre SPAN y C0L.

## Capacidades

- Identificación de oraciones que discuten cada figura de un artículo científico (extracción de referencias a figuras).
- Etiquetado de spans sobre texto científico mediante ModernBERT-large (SPAN y SPAN_ES).
- Puntuación de pares mediante cross-encoder DeBERTa-v3-large (C0L) para combinar en ensemble con SPAN.
- Funcionamiento como modelo único (SPAN_ES) o como sistema de ensemble (SPAN + C0L).
- Integración con el repositorio de código figrefs mediante el script `demo/run_local.py`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Indexación de figuras en repositorios científicos: dado un paper en PDF o texto, el modelo localiza las oraciones que describen cada figura para construir un índice navegable que enlace figura y texto explicativo.
- Asistentes de lectura de artículos: al integrar SPAN_ES en una herramienta de lectura, el sistema puede resaltar automáticamente los pasajes que comentan una figura seleccionada, facilitando la comprensión del documento.
- Extracción de leyendas y contexto para bases de datos biomédicas: el modelo permite asociar cada figura con su discusión textual, útil para curar datasets de imágenes científicas con descripciones verificadas.
- Verificación de consistencia en revisión editorial: un pipeline puede comprobar si cada figura del manuscrito tiene al menos una oración que la referencie, detectando figuras huérfanas antes de la publicación.
- Enriquecimiento de motores de búsqueda académicos: indexar las referencias textuales a figuras permite responder consultas del tipo "artículos donde la figura X se discute en relación con Y".
- Automatización de resúmenes de figuras: combinando la salida del modelo con un generador de texto, se pueden producir descripciones resumidas de cada figura a partir de las oraciones recuperadas.
- Procesamiento por lotes de corpus biomédicos: el ensemble SPAN + C0L puede ejecutarse sobre colecciones de artículos para anotar masivamente las referencias a figuras con mayor robustez que un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 4,9 GB en safetensors, por lo que cargar las tres variantes simultáneamente requiere del orden de varios GB de memoria, aunque la cifra exacta por modelo no se documenta.
- GPU recomendadas: no disponible. Al tratarse de modelos encoder de tamaño large (ModernBERT-large y DeBERTa-v3-large), es razonable esperar que quepan en GPUs de consumo, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica el uso del script `demo/run_local.py` del repositorio de código figrefs; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (extracción de referencias a figuras en documentos científicos) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado únicamente sobre FigSum+ GS1, con solo 15 artículos biomédicos: la generalización a otros dominios científicos o a otros estilos de redacción es incierta.
- No se declaran idiomas soportados; el corpus de entrenamiento es biomédico y presumiblemente en inglés, pero no está confirmado.
- No hay benchmarks publicados que permitan evaluar su precisión frente a alternativas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de oraciones referentes a figuras.
- Sesgos conocidos: no documentados; el sesgo del corpus biomédico reducido puede trasladarse a las predicciones.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los modelos base (ModernBERT y DeBERTa-v3) si se redistribuyen pesos derivados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-13) resulta anómala y conviene verificarla antes de citar el recurso.

## Enlaces

- Hugging Face: https://huggingface.co/iLuvU2/figrefs-models
- Código del proyecto: https://github.com/rcharan05/figrefs

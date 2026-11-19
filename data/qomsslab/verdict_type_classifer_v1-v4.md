# QomSSLab/verdict_type_classifer_v1-v4

## Resumen

`QomSSLab/verdict_type_classifer_v1-v4` es un modelo de clasificación de texto en persa (fa) desarrollado por QomSSLab, construido sobre la arquitectura ModernBERT y publicado en Hugging Face con acceso restringido (gated). El modelo cuenta con 307.532.547 parámetros totales según los pesos en safetensors y está empaquetado en un repositorio de 1,3 GB. Su pipeline declarado es `text-classification`, aunque también incluye la etiqueta `text-embeddings-inference`, lo que sugiere compatibilidad con servidores de embeddings y endpoints de inferencia.

La denominación "verdict_type_classifer" (con la errata presente en el identificador original) apunta a una tarea de clasificación de tipos de veredicto, presumiblemente en el ámbito jurídico o de resolución de disputas, aunque la model card no está disponible en la información proporcionada para confirmarlo. El modelo está etiquetado con el idioma persa como único idioma soportado, lo que lo posiciona como una herramienta especializada para el procesamiento de texto en farsi.

La relevancia de este modelo radica en su especialización idiomática y de dominio: los modelos de clasificación en persa de propósito general son escasos en comparación con los de inglés, y un clasificador basado en ModernBERT con más de 300 millones de parámetros ofrece una capacidad de contexto y representación superior a las alternativas basadas en BERT clásico. No obstante, la ausencia de model card, benchmarks publicados y licencia explícita limita seriamente su evaluabilidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (fa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |
| Acceso | restringido (gated) |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una familia de encoders transformer presentada como sucesora de BERT que incorpora mejoras como atención con rotatory positional embeddings (RoPE), alternancia de capas de atención global y local, y un preentrenamiento sobre contextos más largos que los 512 tokens típicos de BERT. Con 307.532.547 parámetros, el modelo se sitúa en el rango de los ModernBERT-base y ModernBERT-large, aunque no se dispone de la información exacta sobre la configuración de capas, dimensiones ocultas o número de cabezas de atención.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las inherentes a la arquitectura ModernBERT. La model card no está incluida en la información proporcionada, por lo que todos estos datos deben considerarse no disponibles.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar etiquetas a secuencias de texto en persa.
- Especialización en "verdict type": el nombre sugiere clasificación de tipos de veredicto, probablemente en dominio jurídico, aunque no está confirmado por documentación.
- Procesamiento de texto en persa: único idioma declarado en los tags del modelo.
- Compatibilidad con text-embeddings-inference: puede desplegarse como servidor de inferencia de embeddings/clasificación.
- Compatibilidad con endpoints de Hugging Face: etiqueta `endpoints_compatible` presente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: limitadas al persa según los metadatos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de documentos jurídicos en persa: el modelo podría emplearse para etiquetar resoluciones o veredictos por tipo, siempre que se valide previamente su rendimiento con datos propios, dado que no hay benchmarks publicados.
- Enrutamiento de tickets o consultas en farsi: integrado en un pipeline de atención al cliente, el clasificador puede asignar categorías a mensajes entrantes en persa para dirigirlos al equipo adecuado.
- Filtrado y moderación de contenido en persa: clasificación de textos según categorías predefinidas para detección de contenido inapropiado, sujeto a validación empírica.
- Extracción de metadatos en corpus persas: uso como componente de un pipeline de procesamiento documental para anotar tipos de documentos en grandes colecciones en farsi.
- Servicio de inferencia de embeddings: gracias a la compatibilidad con text-embeddings-inference, puede desplegarse como endpoint HTTP para clasificación a escala en infraestructura propia.
- Investigación en NLP persa: como checkpoint de referencia para experimentos de clasificación con ModernBERT en farsi, aunque la licencia no disponible limita su uso académico formal.
- Clasificación en entornos con requisitos de acceso controlado: el carácter gated del repositorio encaja en organizaciones que necesitan restringir la distribución del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (307,5 M de parámetros × 4 bytes), más overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos, más activaciones.
- VRAM estimada en int8: aproximadamente 0,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia en fp16; para despliegue a escala se recomienda A100 o H100 por throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM libre, dependiendo de la longitud de contexto y el batch size.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference, endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp u Ollama, que no están diseñados para encoders de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Acceso |
|---|---|---|---|---|---|
| QomSSLab/verdict_type_classifer_v1-v4 | 307,5 M | no disponible | fa | no disponible | gated |
| ModernBERT-base (referencia) | ~149 M | 8192 | en (multilingüe en variantes) | Apache 2.0 | abierto |
| ModernBERT-large (referencia) | ~395 M | 8192 | en (multilingüe en variantes) | Apache 2.0 | abierto |
| XLM-RoBERTa-base | ~278 M | 512 | multilingüe (incluye fa) | MIT | abierto |

La comparativa se limita a modelos de la misma familia arquitectónica o tamaño, ya que no se dispone de información sobre clasificadores especializados en persa comparables. El modelo de QomSSLab destaca por su especialización idiomática, pero carece de la transparencia de licencia y documentación de las alternativas abiertas.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, hiperparámetros, métricas ni limitaciones, lo que impide una evaluación rigurosa.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; esto es un bloqueo para producción empresarial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la integración y puede impedir la redistribución.
- Monolingüe en persa: no apto para otros idiomas sin validación adicional.
- Riesgo de sesgos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de dominio, género o geográficos.
- Riesgo de alucinación: menor que en modelos generativos, pero la clasificación puede producir etiquetas erróneas con alta confianza en entradas fuera de distribución.
- Longitud de contexto desconocida: no se puede planificar el truncado de documentos largos sin pruebas empíricas.
- Sin benchmarks: no hay evidencia pública de rendimiento frente a alternativas.
- Fecha de creación futura (2026-11-19): el metadato indica una fecha posterior a la actual, lo que sugiere posible error en el registro o un repositorio de prueba; conviene verificar la integridad del checkpoint antes de usarlo.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/QomSSLab/verdict_type_classifer_v1-v4
- ModernBERT (paper de referencia de la arquitectura): no disponible en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible

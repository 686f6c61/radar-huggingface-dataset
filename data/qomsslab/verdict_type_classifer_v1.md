# QomSSLab/verdict_type_classifer_v1

## Resumen

QomSSLab/verdict_type_classifer_v1 es un modelo de clasificación de secuencias (text-classification) publicado por el laboratorio QomSSLab en Hugging Face. Se trata de un fine-tuning de la arquitectura ModernBERT con una cabeza de clasificación de tres etiquetas (`badvi`, `other`, `tajdid`), orientado a textos en persa (código de idioma `fa`). El repositorio contiene 307.532.547 parámetros en formato safetensors y ocupa 1,3 GB.

El modelo resuelve una tarea acotada de clasificación documental en persa, presumiblemente vinculada a terminología jurídica o administrativa (los términos "badvi" y "tajdid" remiten a tipos de resolución judicial en el sistema iraní). No es un modelo generativo ni conversacional: su salida es una etiqueta entre tres posibles para una entrada de texto.

Es relevante para desarrolladores que necesiten un clasificador ligero y desplegable vía `transformers` o `text-embeddings-inference` en pipelines de procesamiento documental en persa. La información publicada es muy escasa: no hay detalles sobre datos de entrenamiento, hiperparámetros, composición del dataset ni licencia, y las métricas declaradas (1,0 en todas las clases) sugieren una evaluación sobre un conjunto de validación muy pequeño o potencialmente filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabeza de clasificación de secuencias |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta hasta 8192 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | persa (`fa`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, un encoder transformer con atención de complejidad lineal, RoPE y mejoras de eficiencia frente a BERT clásico. Sobre esa base se ha añadido una cabeza de clasificación de secuencias con tres clases de salida. El repositorio declara la etiqueta `modernbert` y la librería `transformers`.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el proceso de anotación ni si hubo ajuste fino con datos sintéticos o aumento de datos. Tampoco se documentan hiperparámetros, época de entrenamiento ni estrategia de validación. Las únicas métricas publicadas son las de validación (precisión, recall, F1 y accuracy de 1,0000 en las tres clases, con soportes de 263, 236 y 251 ejemplos respectivamente), lo que apunta a un conjunto de validación de 750 ejemplos y a un posible sobreajuste o a una partición con fuga de datos.

## Capacidades

- Clasificación de texto en persa en tres categorías: `badvi`, `other` y `tajdid`.
- Salida de etiqueta única con puntuación de confianza por clase.
- Integración nativa con `pipeline("text-classification")` de `transformers`.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al persa; no se declaran otros idiomas.

## Casos de uso

- Triaje de resoluciones judiciales: el modelo puede etiquetar automáticamente documentos entrantes como `badvi` (primera instancia), `tajdid` (reconsideración) u `other`, reduciendo la clasificación manual en flujos de gestión documental en persa.
- Enrutamiento de expedientes en un sistema de gestión: usar la etiqueta predicha para dirigir cada documento al departamento o cola de revisión correspondiente, con umbrales de confianza para derivar casos ambiguos a revisión humana.
- Enriquecimiento de metadatos en repositorios documentales: clasificar lotes históricos de textos persas para poblar campos de tipo de resolución en bases de datos o índices de búsqueda.
- Filtrado previo en pipelines de extracción de información: descartar o separar documentos `other` antes de aplicar modelos de extracción o resumen más costosos.
- Monitorización y analítica: agregar conteos por tipo de resolución a lo largo del tiempo para informes operativos o de carga de trabajo.
- Prototipado rápido de clasificadores jurídicos en persa: servir como línea base ajustable mediante fine-tuning adicional sobre un corpus propio, dado su tamaño moderado y su despliegue sencillo con `transformers`.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precision (validacion) | 1,0000 | Declarado por el autor |
| Recall (validacion) | 1,0000 | Declarado por el autor |
| F1 (validacion) | 1,0000 | Declarado por el autor |
| Accuracy (validacion) | 1,0000 | Declarado por el autor |
| F1 clase `badvi` | 1,0000 | Soporte: 263 |
| F1 clase `other` | 1,0000 | Soporte: 236 |
| F1 clase `tajdid` | 1,0000 | Soporte: 251 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas de validación declaradas no son verificables de forma independiente y deben tratarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,3 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes con `text-embeddings-inference`.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference`, endpoints de Hugging Face. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QomSSLab/verdict_type_classifer_v1 | 307,5 M | no disponible | Clasificación de 3 clases en persa | no disponible | Hugging Face |
| ModernBERT-base | ~149 M | 8192 | Encoder base ajustable | Apache 2.0 (según el modelo original) | Hugging Face |
| XLM-RoBERTa-base | ~278 M | 512 | Clasificación multilingüe | MIT (según el modelo original) | Hugging Face |

No se dispone de comparativas de rendimiento publicadas frente a alternativas para esta tarea concreta. La comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Las métricas de validación perfectas (1,0000 en todas las clases) son sospechosas y sugieren sobreajuste, fuga de datos o un conjunto de validación no representativo; no deben tomarse como indicador de rendimiento en producción.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos de anotación, distribución de clases y dominio real de aplicación.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- El modelo solo declara soporte para persa; su comportamiento en otros idiomas o en texto mixto no está caracterizado.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; es un bloqueo potencial para producción.
- No se documenta la longitud máxima de entrada efectiva; entradas largas pueden truncarse según la configuración del tokenizador.
- El nombre del repositorio contiene una errata ("classifer"), lo que puede complicar la búsqueda y la integración.
- Sin mantenimiento documentado ni versión posterior; creado y actualizado el mismo día (2026-11-18).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QomSSLab/verdict_type_classifer_v1
- Perfil del autor: https://huggingface.co/QomSSLab
- Documentación de ModernBERT: no disponible en la información proporcionada
- Paper de ModernBERT: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

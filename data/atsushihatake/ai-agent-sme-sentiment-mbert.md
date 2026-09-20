# AtsushiHatake/ai-agent-sme-sentiment-mbert

## Resumen

El modelo `AtsushiHatake/ai-agent-sme-sentiment-mbert` es un clasificador de sentimiento de tres clases (negativo, neutro, positivo) para reseñas cortas del sector hostelero, escrito en japonés o inglés. Lo publica el usuario AtsushiHatake y se obtiene por ajuste fino (*fine-tuning*) del modelo multilingüe `google-bert/bert-base-multilingual-cased`, un encoder transformer de aproximadamente 178 millones de parámetros. El repositorio ocupa 0,7 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

El interés técnico del modelo no está en su rendimiento, sino en su honestidad metodológica. Se entrenó con 480 reseñas sintéticas (240 en japonés y 240 en inglés, equilibradas entre las tres clases) generadas por una plantilla determinista, y sus autores documentan explícitamente que el macro-F1 de 1,000 obtenido en el conjunto de prueba sintético se debe en gran medida a que las plantillas de entrenamiento y prueba comparten el mismo vocabulario de fragmentos portadores de polaridad. La model card incluye además un contraejemplo revelador: la reseña `ramen was good` se clasifica como negativa con una confianza de 0,966 porque, en el vocabulario sintético de entrenamiento, `good` solo aparece dentro de la frase neutra `neither good nor bad`.

Por todo ello, se trata de un artefacto útil como banco de pruebas, como *baseline* reproducible y como ejemplo didáctico de los riesgos de evaluar sobre datos sintéticos, pero no de un componente listo para producción sin validación humana previa sobre reseñas reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingual) con cabeza de clasificación de 3 clases |
| Parámetros totales | 177.855.747 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de mBERT; no se explicita en la model card) |
| Tipos de cuantización | No disponibles: el repositorio solo publica safetensors, sin variantes GGUF, AWQ, GPTQ ni ONNX cuantizadas |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification (3 clases: 0 = negative, 1 = neutral, 2 = positive) |
| Modelo base | google-bert/bert-base-multilingual-cased (relación: fine-tune) |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 23 descargas, 0 likes (a fecha de consulta) |

## Arquitectura y entrenamiento

La arquitectura es la de un BERT base multilingüe sin modificaciones estructurales: 12 capas de encoder, mecanismo de autoatención bidireccional y embeddings de 768 dimensiones, al que se añade una cabeza lineal de clasificación sobre la representación del token `[CLS]` para producir tres logits (negativo, neutro, positivo). No emplea decodificación autoregresiva, mezcla de expertos, atención lineal ni mecanismos híbridos; es un clasificador de secuencia completo que emite una única etiqueta global por reseña.

El ajuste fino se realizó sobre 480 reseñas sintéticas bilingües generadas mediante un generador determinista basado en plantillas: 240 en japonés y 240 en inglés, con distribución equilibrada entre las tres clases y sin recogida de reseñas reales de clientes. Los conjuntos de entrenamiento y prueba usan plantillas de frase disjuntas, pero comparten el mismo conjunto reducido de fragmentos que determinan la polaridad, lo que infla artificialmente las métricas. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro método de alineación, algo esperable en un clasificador de este tipo. El generador de datos, los scripts de entrenamiento y evaluación y los resultados registrados están publicados en el repositorio de GitHub del autor, lo que permite reproducir el experimento completo.

## Capacidades

- Clasificación de sentimiento en tres clases (`negative`, `neutral`, `positive`) para reseñas cortas de hostelería en japonés e inglés.
- Procesamiento bilingüe directo sin necesidad de indicar el idioma de entrada, al heredar el tokenizador multilingüe de mBERT.
- Asignación de una puntuación de softmax por clase, útil como señal orientativa (no calibrada) para ordenar o priorizar revisiones.
- Ejecución ligera: 177,9 millones de parámetros permiten inferencia en CPU con latencias de milisegundos por lote pequeño.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad declarada con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`), lo que facilita su despliegue como servicio HTTP.
- No dispone de soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito: es un clasificador de una sola pasada, no un modelo generativo.
- No se ha evaluado el cambio de código (*code-switching*) japonés/inglés ni el sentimiento a nivel de aspecto.

## Casos de uso

- Prototipado de pipelines de análisis de reseñas: sirve para montar rápidamente un servicio de clasificación de tres clases con la API `pipeline` de `transformers` y validar la arquitectura de un sistema antes de invertir en datos etiquetados reales.
- Etiquetado asistido con revisión humana: el modelo puede preanotar reseñas de hostelería y enviar los casos de baja confianza a un revisor, siempre que se documente que las predicciones no son fiables fuera de la distribución sintética.
- Banco de pruebas de infraestructura de inferencia: con 0,7 GB de pesos y 177,9 millones de parámetros, es un candidato cómodo para medir latencia y throughput de un despliegue con Text Embeddings Inference o FastAPI en CPU o en una GPU pequeña.
- Estudio metodológico sobre contaminación de datos sintéticos: el caso de `ramen was good` clasificado como negativo con 0,966 de confianza es un ejemplo documentado y reproducible para ilustrar cómo un generador por plantillas induce aprendizaje léxico espurio.
- Baseline en experimentos de comparación: su macro-F1 de 1,000 sobre el split sintético propio y el 0,664 del baseline cero-disparado permiten medir cuánto aporta un ajuste fino frente a un enfoque sin entrenamiento, aunque solo dentro de esa distribución estrecha.
- Aumento de datos y generación de conjuntos sintéticos: el generador publicado en el repositorio de GitHub se puede reutilizar para crear corpus bilingües controlados con fines de docencia o de prueba de herramientas de anotación.
- Demostraciones educativas de clasificación multilingüe: apropiado para talleres o material formativo sobre ajuste fino de mBERT y sobre interpretación crítica de métricas, dado que el modelo es pequeño y el entrenamiento es reproducible de principio a fin.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al split sintético de prueba de 240 elementos (120 en japonés y 120 en inglés, 80 por clase), no a datos reales.

| Métrica | Resultado |
|---|---:|
| Macro-F1 (global) | 1,000 |
| Macro-F1 (japonés) | 1,000 |
| Macro-F1 (inglés) | 1,000 |
| F1 clase `negative` | 1,000 |
| F1 clase `neutral` | 1,000 |
| F1 clase `positive` | 1,000 |
| Baseline cero-disparado (mismo split) | 0,664 macro-F1 |

Advertencia del propio autor, recogida en la model card: las plantillas de entrenamiento y prueba son disjuntas, pero comparten el vocabulario de fragmentos que determinan la polaridad, por lo que el 1,000 mide rendimiento dentro de la distribución estrecha del generador y no debe interpretarse como precisión de despliegue en el mundo real. No hay resultados publicados sobre MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar, ni sobre conjuntos de reseñas auténticas anotadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,71 GB en fp32, 0,36 GB en fp16/bf16 y 0,18 GB en int8 (estimación a partir de los 177.855.747 parámetros; no publicada por el autor). Conviene reservar 1-2 GB adicionales para activaciones, tokenizador y *overhead* del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, una RTX 3060 o incluso una GTX 1650 bastan; no se justifica el uso de A100, H100 o L40S para este modelo salvo por agregación de carga.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, y también en CPU con tiempos de inferencia del orden de milisegundos para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Text Embeddings Inference (compatible según las etiquetas del repositorio), Hugging Face Inference Endpoints, servidor propio con FastAPI o exportación a ONNX Runtime. No hay conversiones GGUF ni plantillas de Ollama/llama.cpp, ya que la cabeza de clasificación no se exporta por esas vías; vLLM no es la ruta recomendada para un encoder de clasificación.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

Los resultados de la búsqueda web no contienen información relevante sobre este modelo ni sobre alternativas comparables (los enlaces recuperados tratan sobre un tema sin relación), por lo que los datos de la competencia no se han podido verificar y se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| AtsushiHatake/ai-agent-sme-sentiment-mbert | 177.855.747 | 512 tokens | ja, en | Apache 2.0 | Macro-F1 1,000 en su split sintético propio; sin evaluación en datos reales |
| google-bert/bert-base-multilingual-cased (base) | 178 M (mismo orden de magnitud, según el modelo del que deriva) | 512 tokens | multilingüe (no detallado en la información proporcionada) | Apache 2.0 | No aplica: no incluye cabeza de clasificación de sentimiento |
| Alternativas de análisis de sentimiento multilingüe | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No ha sido evaluado sobre un conjunto de reseñas reales anotado de forma independiente: la única métrica disponible procede de datos sintéticos generados por el mismo sistema que produjo el entrenamiento.
- El vocabulario de los datos sintéticos es estrecho y la estructura de las frases es simple; el modelo no ha visto la variabilidad, la ironía, las faltas de ortografía ni los giros propios del lenguaje real.
- Sesgo léxico documentado: `ramen was good` se clasifica como `negative` con aproximadamente 0,966 de confianza, porque en el corpus de entrenamiento `good` solo aparece dentro de la frase neutra `neither good nor bad`. Es un caso claro de aprendizaje de artefactos del generador.
- La confianza softmax no está calibrada como probabilidad de acierto sobre reseñas reales, por lo que no debe usarse para umbralizar decisiones automáticas sin validación previa.
- Una única etiqueta global oculta opiniones mixtas, como comida positiva con servicio negativo; no hay soporte de sentimiento a nivel de aspecto.
- No se ha evaluado el cambio de código japonés/inglés, frecuente en reseñas reales de determinados mercados.
- Uso previsto restringido por el autor: investigación, prototipado y analítica con revisión humana. No debe emplearse como base única para decisiones empresariales, laborales, de moderación o de atención al cliente con consecuencias relevantes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo derivado no es un producto oficial de Google y debe conservarse la atribución correspondiente (archivos `LICENSE` y `NOTICE`).
- Para cualquier consumo en producción se recomienda fijar una revisión concreta (*commit*) de Hugging Face en lugar de cargar la rama `main` sin versionar, tal y como aconseja el propio autor.
- La ventana de 512 tokens implica truncamiento en reseñas largas, aunque el caso de uso declarado son reseñas cortas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtsushiHatake/ai-agent-sme-sentiment-mbert
- Repositorio de código, datos sintéticos y scripts de entrenamiento y evaluación: https://github.com/atsushi729/ai-agent-sme
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Paper asociado: no disponible
- Demos o espacios interactivos: no disponibles
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con este modelo y no aportan enlaces adicionales utilizables.

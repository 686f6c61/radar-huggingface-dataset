# NaimaVahab/luna-fm_BPE_4k

## Resumen

LUNA-FM es un modelo de fundación a nivel de subpalabra (subword) especializado en ARN largos no codificantes (lncRNA), desarrollado por Naima Vahab, Estrid He, Tabinda Sarwar y Sonika Tyagi, y publicado en Taylor & Francis. El modelo se distribuye en Hugging Face bajo el identificador `NaimaVahab/luna-fm_BPE_4k` y emplea la arquitectura ModernBERT, una variante de transformer encoder-only con atención eficiente y soporte nativo para secuencias largas.

El problema que aborda es la inferencia funcional sobre lncRNA, una clase de transcritos que no se traducen a proteína pero desempeñan papeles reguladores relevantes en expresión génica y enfermedad. Los modelos de lenguaje genómicos generalistas no capturan bien las particularidades de estas secuencias, por lo que LUNA-FM aplica tokenización BPE con un vocabulario de 4k subpalabras adaptado a ARN no codificante.

Con 114.072.064 parámetros (aproximadamente 114 M), el modelo es compacto y apto para inferencia en hardware modesto, lo que lo hace interesante para investigación en genómica computacional. La información pública disponible es escasa: no se han publicado en la ficha datos sobre licencia, idiomas, benchmarks ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder-only) |
| Parametros totales | 114.072.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genómicas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | BPE con vocabulario de 4k subpalabras |
| Tamano del repo | 1,4 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

LUNA-FM se basa en ModernBERT, una familia de encoders transformer que moderniza la arquitectura BERT clásica con mejoras como atención rotatoria (RoPE), activaciones GeGLU, normalización por capas alternativa y kernels de atención optimizados para secuencias largas. Al tratarse de un encoder-only, el modelo está diseñado para producir representaciones contextuales de secuencias, no para generación autoregresiva.

El modelo emplea un tokenizador BPE con un vocabulario de 4.000 subpalabras, adaptado al alfabeto de nucleótidos del ARN. El número de tokens de entrenamiento, la composición del corpus, la posible aplicación de objetivos enmascarados (MLM) y cualquier etapa de ajuste fino supervisado no están documentados en la información disponible. La publicación asociada (Taylor & Francis) es la referencia principal para detalles metodológicos.

## Capacidades

- Extracción de representaciones contextuales de secuencias de lncRNA a nivel de subpalabra.
- Inferencia funcional sobre transcritos no codificantes (predicción de propiedades o clases funcionales, según el cabezal de tarea asociado).
- Procesamiento de secuencias genómicas tokenizadas con BPE de 4k unidades.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe en el sentido de lenguaje natural; el dominio es secuencial/genómico.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Anotación funcional de lncRNA: usar las representaciones del encoder para clasificar transcritos según su posible papel regulatorio, aprovechando el vocabulario BPE adaptado a ARN.
- Búsqueda de similitud entre transcritos: extraer embeddings de secuencias y calcular distancias en el espacio latente para agrupar lncRNA con perfiles funcionales parecidos.
- Filtrado y priorización en pipelines de genómica: integrar el modelo como etapa de scoring para reducir candidatos antes de validación experimental.
- Investigación en regulación génica: emplear las representaciones como features en modelos downstream (expresión diferencial, asociación a enfermedad).
- Docencia y prototipado en bioinformática: al tener 114 M de parámetros, permite experimentar en una sola GPU consumer con tiempos de inferencia bajos.
- Base para ajuste fino supervisado: partir de los pesos preentrenados y añadir cabezales de clasificación o regresión para tareas específicas de lncRNA.
- Reproducción de resultados académicos: utilizar el checkpoint publicado para replicar los experimentos del artículo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (114 M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,23 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción: cualquiera con al menos 2-4 GB de VRAM; A100/H100 no son necesarias salvo para lotes muy grandes.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Text Embeddings Inference (TEI) para servir embeddings, o llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera procesamiento de cientos a miles de secuencias por segundo en GPU moderna para longitudes moderadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUNA-FM (BPE 4k) | 114 M | lncRNA | no disponible | no disponible | Hugging Face |
| Nucleotide Transformer (InstaDeep) | 50 M – 2,5 B | ADN/genoma | hasta 12 kb (variantes) | generalmente abierta (verificar) | Hugging Face |
| DNABERT-2 | ~117 M | ADN | ~10 kb | MIT (verificar) | Hugging Face |
| HyenaDNA | 1,6 M – 47 M | ADN, secuencias largas | hasta 1 M pb | Apache 2.0 (verificar) | Hugging Face |

La comparación es orientativa: los modelos citados se centran en ADN, mientras que LUNA-FM está específicamente orientado a lncRNA. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- La model card no especifica licencia; no se debe asumir uso comercial libre sin consultar al autor.
- No hay datos publicados sobre sesgos, aunque en modelos genómicos el sesgo de especie y de composición del corpus de entrenamiento es un riesgo habitual.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de sobreinterpretación de representaciones en tareas downstream.
- No se documenta la longitud máxima de contexto, lo que limita planificar el uso con transcritos largos.
- El modelo está entrenado para un dominio muy específico (lncRNA); su uso fuera de ese dominio no está validado.
- El número de descargas (10) y likes (0) sugiere adopción muy limitada y poca validación comunitaria.
- No hay pipeline declarado en Hugging Face, por lo que la integración requiere cargar manualmente el modelo y el tokenizador.

## Enlaces

- Hugging Face: https://huggingface.co/NaimaVahab/luna-fm_BPE_4k
- Publicación de referencia: LUNA-FM: a subword foundation model for long non-coding RNAs for functional inference. Taylor & Francis. Vahab, N.; He, E.; Sarwar, T.; Tyagi, S.
- Repositorio de código, demo o paper adicional: no disponible en la información proporcionada.

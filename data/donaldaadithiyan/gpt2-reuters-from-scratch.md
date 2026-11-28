# DonaldAadithiyan/gpt2-reuters-from-scratch

## Resumen

GPT-2 Reuters from scratch es un modelo de lenguaje causal de tipo GPT-2 entrenado íntegramente desde inicialización aleatoria, sin pesos preentrenados, por el autor DonaldAadithiyan. Se entrenó con predicción del siguiente token sobre el título y el cuerpo de 17.262 artículos de agencia de noticias Reuters, procedentes del dataset `ingeniumacademy/reuters_articles`, usando un tokenizador BPE propio de 52.000 entradas. El modelo se desarrolló como trabajo de la asignatura CS4681 Advanced Machine Learning, centrada en aprendizaje autosupervisado, y su interés es fundamentalmente académico y didáctico.

El repositorio contiene tres variantes del mismo experimento: la variante principal (Run A, 6 capas, 8 cabezas, dimensión 256, 18,1 millones de parámetros, 5 épocas), una variante con solo 2 épocas (Run B, misma arquitectura) y una variante de mayor tamaño (Run C, 8 capas, dimensión 512, 51,9 millones de parámetros, 5 épocas). Todas comparten una longitud de contexto de 256 tokens, muy reducida para estándares actuales.

No es un modelo de propósito general: su vocabulario, su distribución de entrenamiento y su escala lo limitan a la generación de texto con estilo periodístico en inglés. Es relevante ahora únicamente como referencia de entrenamiento desde cero a pequeña escala y como ejemplo reproducible de experimentación controlada con variables aisladas (épocas y tamaño).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (causal LM) |
| Parametros totales | 18.116.608 (Run A y Run B); 51.975.168 (Run C) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (block size) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con atención causal, al estilo GPT-2. La variante principal emplea 6 capas, 8 cabezas de atención y una dimensión de modelo de 256; la variante C escala a 8 capas y dimensión 512. El entrenamiento se realizó desde inicialización aleatoria, sin destilación ni inicialización desde pesos preentrenados, con el objetivo de predicción del siguiente token sobre título y cuerpo de los artículos.

Los hiperparámetros son idénticos en las tres ejecuciones: block size de 256, batch de 32, optimizador AdamW con learning rate 5e-4, beta2 0.95, weight decay 0.1, scheduler coseno con 5% de warm-up, dropout 0.1, precisión fp16 y semilla 42. El diseño experimental aísla variables: Run B cambia solo el número de épocas (2 frente a 5) y Run C cambia solo el tamaño del modelo. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; el entrenamiento es puramente autosupervisado. Cada carpeta incluye `log_history.json` y `summary.json`, y el directorio `results/` recoge curvas de pérdida, muestras generadas y análisis de siguiente token.

## Capacidades

- Generación de texto causal en inglés con estilo periodístico, condicionada por un prefijo.
- Continuación de titulares y cuerpos de noticia coherentes a corto plazo (hasta 256 tokens de contexto).
- Modelado de lenguaje autosupervisado: útil para estudiar dinámicas de entrenamiento y perplejidad.
- Generación con muestreo configurable (top-k, top-p, temperatura) mediante `model.generate`.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de razonamiento explícito (thinking mode).
- No tiene capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; el tokenizador está entrenado sobre el corpus Reuters en inglés.

## Casos de uso

- Docencia y reproducción de experimentos: sirve para ilustrar el pipeline completo de entrenamiento de un LM desde cero (tokenizador, dataset, bucle de entrenamiento, evaluación por perplejidad) en una GPU T4 en menos de 16 minutos.
- Estudio de escalado controlado: las variantes A, B y C permiten analizar el efecto del número de épocas y del tamaño del modelo manteniendo fijos los hiperparámetros, con perplejidades de test de 78,26, 141,87 y 55,56 respectivamente.
- Generación de titulares sintéticos de estilo Reuters: dado un prefijo temático, el modelo produce continuaciones con registro informativo, útil para aumentar datos de prueba en tareas de clasificación de noticias.
- Análisis de siguiente token: el directorio `results/` documenta estudios de distribución del siguiente token que pueden reutilizarse en clases de NLP para explicar la naturaleza probabilística de los LM.
- Baseline de referencia en investigación de tokenizadores: al usar un BPE de 52k entrenado sobre el corpus, permite comparar el impacto del vocabulario frente a tokenizadores GPT-2 estándar en dominios especializados.
- Pruebas de infraestructura de despliegue: por su tamaño (0,4 GB de repositorio), es adecuado para validar pipelines de `text-generation-inference` o endpoints compatibles en entornos de desarrollo sin coste de GPU significativo.

## Benchmarks y rendimiento

Los únicos datos publicados son las pérdidas y perplejidades de validación y test de las tres ejecuciones:

| Ejecucion | Capas / cabezas / d_model | Epocas | Parametros | Val loss / ppl | Test loss / ppl | Tiempo (T4) |
|---|---|---|---|---|---|---|
| Run A (raiz) | 6 / 8 / 256 | 5 | 18.116.608 | 4,5693 / 96,48 | 4,3601 / 78,26 | 7,9 min |
| Run B (`variants/B_2ep`) | 6 / 8 / 256 | 2 | 18.116.608 | 5,1709 / 176,07 | 4,9549 / 141,87 | 3,3 min |
| Run C (`variants/C_large_5ep`) | 8 / 8 / 512 | 5 | 51.975.168 | 4,2041 / 66,96 | 4,0174 / 55,56 | 15,1 min |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para las variantes de 18,1 M de parámetros; en torno a 1-2 GB para la variante C de 51,9 M de parámetros (estimación a partir del recuento de parámetros, no documentada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó en una NVIDIA T4.
- Cabe holgadamente en GPU consumer: GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (etiqueta presente en el repositorio) y endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el tiempo de entrenamiento en T4 (7,9 min para Run A) sugiere una inferencia muy rápida, pero no se publican métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2 Reuters from scratch (Run A) | 18,1 M | 256 | Desde cero, corpus Reuters (17.262 articulos) | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Preentrenado en WebText | MIT (pesos publicados) | Hugging Face, OpenAI |
| DistilGPT-2 | 82 M | 1.024 | Destilacion de GPT-2 | Apache 2.0 | Hugging Face |
| GPT-2 Reuters from scratch (Run C) | 51,9 M | 256 | Desde cero, corpus Reuters | no disponible | Hugging Face |

La comparación con GPT-2 small y DistilGPT-2 es solo orientativa: aquellos están preentrenados en corpus web masivos y tienen capacidades generales muy superiores, mientras que este modelo está especializado en un corpus periodístico pequeño y entrena desde cero. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- Entrenado desde cero sobre un corpus reducido (17.262 artículos), por lo que su conocimiento del mundo es mínimo y su coherencia a largo plazo es limitada.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Alta probabilidad de alucinación y de generar texto plausible pero factualmente incorrecto, especialmente fuera del dominio Reuters.
- Solo inglés; no se ha evaluado su comportamiento en otros idiomas.
- No apto para uso en producción como asistente general, atención al cliente ni generación de código.
- Licencia no especificada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- El corpus de Reuters puede introducir sesgos de estilo, temática y cobertura geográfica propios de la agencia; no se documenta ninguna mitigación.
- Sin ajuste por instrucciones ni alineación (RLHF/DPO), por lo que no sigue instrucciones de forma fiable.
- Proyecto académico sin mantenimiento declarado; descargas y likes nulos en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DonaldAadithiyan/gpt2-reuters-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer

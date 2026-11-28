# samadhitalagala/gpt2-reuters-A-baseline

## Resumen

gpt2-reuters-A-baseline es un modelo de lenguaje causal de estilo GPT-2 entrenado desde inicialización aleatoria (sin pesos preentrenados) por el usuario samadhitalagala sobre el conjunto de datos de artículos de Reuters (`ingeniumacademy/reuters_articles`), empleando un tokenizador específico del mismo corpus. Se trata de un trabajo académico correspondiente a la asignación CS4681 Assignment 02, no de un modelo orientado a producción.

El modelo emplea una arquitectura transformer decoder-only con 6 capas, 8 cabezas de atención y una dimensión de embedding de 512, lo que resulta en 45.670.400 parámetros. Su ventana de contexto es de solo 256 tokens, muy limitada en comparación con los estándares actuales, y está entrenado exclusivamente en inglés sobre el dominio periodístico de Reuters.

Su relevancia es fundamentalmente didáctica: sirve como línea base (baseline) reproducible para estudiar el comportamiento de un modelo pequeño entrenado desde cero sobre un corpus concreto, con una pérdida de validación de 4,210 (perplejidad 67,4) y de test de 4,006 (perplejidad 54,9) tras 5 épocas. No está pensado para uso general ni comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2), 6 capas, 8 cabezas, embedding 512 |
| Parametros totales | 45.670.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clásica en configuración reducida: 6 capas transformer con 8 cabezas de atención y dimensión de embedding de 512. Se entrenó desde inicialización aleatoria, sin partir de pesos preentrenados, lo que lo convierte en un experimento de entrenamiento from-scratch sobre un corpus específico. El tokenizador utilizado es `ingeniumacademy/gpt2-reuters-tokenizer`, adaptado al dataset de Reuters.

El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 0,0005 siguiendo un schedule coseno con un 5 % de warmup, batch size de 32 y una duración total de 17,6 minutos. Los datos de entrenamiento provienen del dataset `ingeniumacademy/reuters_articles`, compuesto por título y cuerpo de artículos de Reuters. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto causal en inglés, limitada al estilo y dominio de los artículos de Reuters.
- Modelado de lenguaje de dominio restringido (texto periodístico).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Uso previsto como línea base experimental, no como asistente general.

## Casos de uso

- Línea base académica: emplear el modelo como referencia de comparación en experimentos de entrenamiento from-scratch sobre corpus periodísticos, midiendo mejoras frente a variantes posteriores (por ejemplo, la variante "A" frente a otras configuraciones del mismo autor).
- Estudio de tokenizadores de dominio: analizar cómo un tokenizador entrenado sobre Reuters (`ingeniumacademy/gpt2-reuters-tokenizer`) afecta a la perplejidad y a la generación en un modelo pequeño.
- Generación de titulares sintéticos de estilo Reuters: el modelo puede producir continuaciones de texto con el registro del corpus, útil para aumentar datos de entrenamiento en experimentos controlados.
- Reproducción de experimentos docentes: el registro de entrenamiento (`results.json`) y la configuración documentada permiten replicar el pipeline completo en minutos, adecuado para prácticas de asignatura.
- Investigación sobre sobreajuste y generalización: con pérdidas de validación y test cercanas (4,210 frente a 4,006), sirve para estudiar el comportamiento de modelos pequeños sobre dominios estrechos.
- Pruebas de infraestructura de despliegue: por su tamaño reducido (0,4 GB de repositorio), es útil para validar pipelines de inferencia (carga de safetensors, servidores de generación) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 4,210 |
| Perplejidad de validación | 67,4 |
| Pérdida de test | 4,006 |
| Perplejidad de test | 54,9 |
| Épocas | 5 |
| Tiempo de entrenamiento | 17,6 minutos |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (45,7 M de parámetros en safetensors); el repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: compatible con bibliotecas estándar de transformers (carga de safetensors), llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera throughput muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-reuters-A-baseline | 45,7 M | 256 | From-scratch sobre Reuters | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | Preentrenado en WebText | MIT (según publicación original) | Hugging Face |
| DistilGPT-2 | 82 M | 1024 | Destilado de GPT-2 | Apache 2.0 (según publicación) | Hugging Face |

La comparativa se limita a modelos de tamaño reducido de la familia GPT-2; no se dispone de datos de benchmarks comparativos para este modelo concreto.

## Limitaciones y advertencias

- Modelo entrenado desde cero con solo 45,7 M de parámetros y 5 épocas: la calidad de generación es muy limitada y no es apta para tareas de producción.
- Contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Entrenado exclusivamente en inglés y sobre el dominio de Reuters; el vocabulario y estilo fuera de ese dominio serán deficientes.
- Riesgo elevado de alucinación y de generación incoherente, propio de un modelo pequeño sin preentrenamiento a gran escala.
- Sesgos potenciales heredados del corpus de Reuters (sesgo editorial, cobertura geográfica y temática sesgada).
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso fuera del ámbito académico.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez.
- El modelo es un artefacto de asignatura (CS4681 Assignment 02); su mantenimiento y soporte no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/samadhitalagala/gpt2-reuters-A-baseline
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Registro de entrenamiento: `results.json` (incluido en el repositorio del modelo)

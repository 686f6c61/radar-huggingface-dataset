# Induwara02/gpt2-reuters-scratch-2ep

## Resumen

`gpt2-reuters-scratch-2ep` es un modelo de lenguaje autorregresivo de arquitectura GPT-2 entrenado **desde cero** (sin pesos preentrenados) por el usuario Induwara02 sobre el dataset de artículos de Reuters `ingeniumacademy/reuters_articles`. Se trata de un proyecto educativo realizado para una asignatura de aprendizaje autosupervisado, con objetivo de predicción del siguiente token (causal LM). El modelo tiene 18.116.608 parámetros y una ventana de contexto de solo 256 tokens.

La relevancia de este modelo es fundamentalmente didáctica: demuestra el flujo completo de entrenamiento de un transformer causal desde inicialización aleatoria hasta evaluación con perplejidad, sobre un corpus pequeño (~3 millones de tokens, 17.262 artículos). No está pensado para uso en producción ni para tareas reales; el propio autor lo califica como "educational project only".

Arquitectura transformer decoder-only de 6 capas, 8 cabezas de atención, dimensión oculta 256 y FFN de 1024, con un vocabulario de 52.000 tokens específico del dominio Reuters. Los resultados de validación (perplejidad 152,34) y test (perplejidad 121,47) reflejan el bajo volumen de datos y de cómputo empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2) |
| Parametros totales | 18.116.608 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors fp16/fp32; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible (entrenado presumiblemente en inglés por el corpus Reuters) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |
| Capas / cabezas | 6 / 8 |
| Dimension oculta (d_model) | 256 |
| Tamano FFN | 1024 |
| Vocabulario | 52.000 tokens (`ingeniumacademy/gpt2-reuters-t`) |
| Dataset de entrenamiento | `ingeniumacademy/reuters_articles` (17.262 articulos) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only clásica de GPT-2, con atención causal multi-cabeza, 6 capas, 8 cabezas de atención, dimensión oculta 256 y capa feed-forward de 1024. El tokenizador es propio del dominio, con un vocabulario de 52.000 entradas (`ingeniumacademy/gpt2-reuters-t`), lo que sugiere un entrenamiento de tokenizador específico sobre el corpus Reuters. No se documentan innovaciones técnicas adicionales (no hay MoE, ni atención lineal, ni decodificación especulativa).

El entrenamiento se realizó desde pesos inicializados aleatoriamente, sin partir de GPT-2 preentrenado, durante 2 épocas con batch size 32, learning rate 0,0005 con schedule coseno y 5% de warmup, optimizador AdamW con weight decay 0,01 y precisión fp16. Los datos consisten en el split de entrenamiento de Reuters (17.262 artículos, título + cuerpo) empaquetados en bloques de 256 tokens. El tiempo total de entrenamiento reportado es de 159,0 segundos. No se menciona uso de RLHF, DPO ni ningún tipo de ajuste por preferencias.

## Capacidades

- Generación de texto autorregresiva (predicción del siguiente token) en estilo de artículos de noticias financieras.
- Modelado de lenguaje causal con contexto limitado a 256 tokens.
- Generación temática sobre vocabulario Reuters (finanzas, mercados, empresas), aunque con coherencia limitada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el corpus es presumiblemente en inglés.
- No dispone de modo thinking, visión ni audio.
- No se documenta soporte de instrucciones (no es un modelo instruction-tuned).

## Casos de uso

- Demostración educativa de entrenamiento desde cero: sirve para ilustrar el pipeline completo de un transformer causal (tokenizador, dataset, entrenamiento, evaluación con perplejidad) en un curso de aprendizaje autosupervisado.
- Estudio de tokenizadores de dominio: permite analizar cómo un vocabulario de 52.000 tokens entrenado sobre Reuters afecta a la compresión y a la generación en textos financieros.
- Reproducción de experimentos de bajo coste: con 159 segundos de entrenamiento, es útil como baseline rápido para comparar configuraciones (capas, lr, épocas) en entornos con recursos limitados.
- Generación de titulares sintéticos de temática financiera: puede producir textos con vocabulario Reuters, útil únicamente como ejercicio de estilo y no como fuente fiable.
- Pruebas de integración con `transformers` y `text-generation-inference`: el modelo es compatible con endpoints y sirve para validar pipelines de despliegue con modelos pequeños.
- Benchmark de perplejidad en corpus periodísticos: como referencia de perplejidad (152,34 validación / 121,47 test) para comparar con otros modelos pequeños entrenados sobre el mismo corpus.
- No es adecuado para atención al cliente, generación de código en producción, RAG ni ninguna aplicación real que requiera fiabilidad factual.

## Benchmarks y rendimiento

| Split | Loss | Perplejidad |
|---|---|---|
| Validación | 5,0261 | 152,34 |
| Test | 4,7997 | 121,47 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (18,1 M de parámetros ≈ 36 MB de pesos) y unas pocas centenas de MB considerando activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM), text-generation-inference (el modelo declara compatibilidad con endpoints), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpt2-reuters-scratch-2ep | 18,1 M | 256 | MIT | Entrenado desde cero sobre Reuters; perplejidad test 121,47 |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Preentrenado en WebText; mucho mayor y con contexto 4x |
| DistilGPT-2 | 82 M | 1024 | MIT | Destilado de GPT-2; mayor capacidad y contexto |
| Modelos GPT-2 pequeños de dominio | Variable | Variable | Variable | No disponible comparación directa con otros modelos entrenados desde cero sobre Reuters |

La comparación con GPT-2 small y DistilGPT-2 es orientativa: ambos tienen más parámetros y contexto, y fueron preentrenados sobre corpus mucho mayores, por lo que su calidad de generación es sustancialmente superior. No se dispone de benchmarks comparables publicados para este modelo.

## Limitaciones y advertencias

- El propio autor indica que la salida es "topical but often incoherent": el modelo puede repetir e inventar hechos.
- Corpus de entrenamiento muy pequeño (~3 millones de tokens) y solo 2 épocas, lo que limita la calidad del modelado.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Riesgo elevado de alucinación y de generar afirmaciones financieras falsas; no debe usarse como fuente de información.
- No es un modelo instruction-tuned: no sigue instrucciones ni mantiene diálogos.
- Idiomas soportados no documentados; probablemente limitado al inglés periodístico.
- Licencia MIT permite uso comercial, pero la calidad y fiabilidad del modelo hacen inviable su uso en producción.
- Proyecto educativo sin mantenimiento ni soporte documentado; descargas y likes nulos en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Induwara02/gpt2-reuters-scratch-2ep
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-t

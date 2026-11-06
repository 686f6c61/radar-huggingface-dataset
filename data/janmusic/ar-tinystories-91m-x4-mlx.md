# janmusic/ar-tinystories-91m-x4-mlx

## Resumen

AR TinyStories 91M (4x data) es un modelo de lenguaje autoregresivo de tipo GPT, con 91,3 millones de parámetros, entrenado por el autor independiente janmusic sobre el conjunto de datos sintético TinyStories. No está pensado como modelo de producto, sino como **línea base de investigación** para comparar con el generador basado en Next-Concept Modeling (NCM) del mismo autor, `ncm-tinystories-87m-x4-mlx`. Ambos comparten bloques transformer idénticos (12 capas, anchura 768, 12 cabezas, embeddings atados) y exactamente las mismas ventanas de entrenamiento, de modo que la comparación aísla la diferencia entre el paradigma autoregresivo clásico y el de NCM.

El modelo se distribuye en formato MLX, optimizado para Apple Silicon, y se carga mediante la librería `ncm-mlx` (versión 0.4.0), no a través de Transformers ni de `mlx_lm`. Genera texto incondicional en inglés con un tokenizador BPE propio de 8.192 tokens y una ventana de contexto de 128 posiciones, suficiente para las historias cortas de TinyStories pero insuficiente para cualquier tarea de contexto largo.

Su relevancia es metodológica: sirve como referencia cuantitativa para evaluar si NCM mejora o empeora frente a un transformer autoregresivo equivalente en parámetros y datos. Los resultados publicados muestran que el baseline AR obtiene una perplejidad generativa de 11,484 frente a 24,404 del generador NCM, es decir, el NCM es 2,13 veces peor bajo ese scorer, aunque requiere 11 llamadas al modelo por muestra frente a 128 del AR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo tipo GPT (12 bloques, anchura 768, 12 cabezas, embeddings atados, RoPE) |
| Parámetros totales | 91.348.992 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32; la model card no detalla cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`ar.safetensors`, 365,4 MB) + JSON auxiliares (`ar.json`, `spec.json`, `bpe.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con 12 bloques, dimensión de modelo 768, 12 cabezas de atención, embeddings atados entre entrada y salida y codificación posicional rotatoria (RoPE, con `rope_base` definido en `spec.json`). El tokenizador es un BPE entrenado específicamente para este proyecto con un vocabulario de 8.192 tokens, distinto del de GPT-2. La arquitectura se construye a partir de los mismos bloques que el generador NCM, de modo que la comparación entre ambos sea limpia en cuanto a capacidad del transformer.

El entrenamiento se realizó con `ncm-mlx` sobre TinyStories V2 (historias sintéticas generadas por GPT-4), con cómputo en bf16, pesos maestros en fp32 y pérdida calculada en fp32 (los logits se redondean a bf16 antes de la pérdida). Se ejecutaron 30.000 actualizaciones con batch de 128, lo que supone 3.840.000 ventanas de 128 tokens, exactamente las mismas que vio el modelo NCM. La semilla fue 0 y el hardware una única NVIDIA RTX PRO 6000. La configuración completa está en `configs/tinystories-ladder-87m-x4-bf16.json` del repositorio. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo puramente preentrenado para modelado de lenguaje.

## Capacidades

- Generación de texto incondicional en inglés: produce aperturas de historia de 128 tokens a partir de un token de inicio de historia, sin prompt.
- Modelado de lenguaje autoregresivo puro: next-token prediction sobre prosa sencilla estilo TinyStories.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking" ni de cadena de pensamiento explícita.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; el vocabulario BPE y los datos son exclusivamente en inglés.
- No es un modelo ajustado por instrucciones: no responde a preguntas ni sigue directrices.

## Casos de uso

- **Línea base para investigación en arquitecturas alternativas**: sirve para comparar, con idénticos parámetros, datos y ventanas, si un método nuevo (como NCM) mejora la perplejidad o la eficiencia de muestreo frente a un transformer autoregresivo clásico. Es su propósito declarado.
- **Reproducción de experimentos de scaling en TinyStories**: al publicarse junto a las versiones de 12M y 50M de la misma receta, permite estudiar cómo escala la perplejidad con el tamaño y con la cantidad de datos en un entorno controlado y de bajo coste.
- **Estudio de tokenizadores BPE pequeños**: el vocabulario de 8.192 tokens y el fichero `bpe.json` permiten analizar el efecto del tamaño de vocabulario en modelos de menos de 100M de parámetros.
- **Evaluación de métricas de perplejidad generativa**: el modelo card documenta un protocolo concreto (1.280 muestras incondicionales, temperatura 1, sin top-k ni top-p, scorer GPT-2 large) que puede reutilizarse para validar metodologías de evaluación.
- **Docencia y experimentación en Apple Silicon**: al estar en formato MLX y pesar 0,4 GB, se puede cargar y ejecutar en un Mac con relativa facilidad para demostrar el funcionamiento interno de un transformer autoregresivo.
- **Pruebas de infraestructura de inferencia MLX**: útil para validar pipelines de carga de pesos, tokenización y generación con la librería `ncm-mlx` antes de pasar a modelos mayores.
- **Generación de cuentos cortos sintéticos para aumento de datos**: con las cautelas oportunas, puede producir prosa simple en inglés para prototipos de juguete, aunque su calidad es limitada y repetitiva.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el baseline AR con el generador NCM del mismo autor. La perplejidad generativa se mide con GPT-2 large como scorer, 1.280 muestras incondicionales por modelo (5 semillas de muestreo × 256), temperatura 1, sin top-k ni top-p, hasta 1.024 tokens.

| Métrica | AR baseline 91,3M | NCM 87,4M | Texto real held-out | TinyStories Kumbong et al. |
|---|---:|---:|---:|---:|
| Perplejidad generativa GPT-2 large, media (SD) | 11,484 (0,341) | 24,404 (0,848) | 8,529 | 16,259 |
| Pérdida teacher-forced limpia | 1,01081 nats/token BPE | 1,51620 nats/código | no disponible | no disponible |
| Llamadas al modelo por muestra de 128 tokens | 128 | 11 (+ unigrama nivel 0) | no aplica | no aplica |

Nota: la pérdida teacher-forced del AR se mide en nats por token BPE y la del NCM en nats por código; según el autor, son objetivos distintos y no deben compararse entre sí. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 365,4 MB en safetensors; en bf16 la inferencia requiere menos de 1 GB de memoria. En fp32 serían aproximadamente 0,73 GB solo de pesos.
- **GPU recomendadas**: cualquier GPU moderna sirve; el modelo se entrenó en una NVIDIA RTX PRO 6000, pero para inferencia basta con hardware muy modesto.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU. El formato publicado está pensado para Apple Silicon (MLX).
- **Opciones de despliegue**: la vía oficial es `ncm-mlx==0.4.0` sobre Apple Silicon con Python 3.12. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ni con `mlx_lm`, al no ser un checkpoint de Transformers.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dado el tamaño (91M) y la longitud fija de 128 tokens, se espera una latencia muy baja en hardware Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad generativa (GPT-2 large) | Licencia | Formato / ecosistema |
|---|---:|---:|---:|---|---|
| AR TinyStories 91M x4 (este) | 91,3M | 128 | 11,484 | MIT | MLX (`ncm-mlx`) |
| NCM TinyStories 87M x4 | 87,4M | 128 | 24,404 | MIT (según repo del autor) | MLX (`ncm-mlx`) |
| TinyStories Kumbong et al. (checkpoint liberado) | no disponible | no disponible | 16,259 | no disponible | no disponible |
| Texto real held-out (referencia, no modelo) | no aplica | no aplica | 8,529 | no aplica | no aplica |

La comparación más directa es con el generador NCM del mismo autor, ya que comparten bloques, datos y ventanas. Frente a otros modelos TinyStories de la literatura, el checkpoint de Kumbong et al. obtiene peor perplejidad generativa (16,259) pese a contar con un presupuesto de entrenamiento mucho mayor, según la model card. No se dispone de comparaciones con modelos de propósito general como GPT-2 small o Pythia-70M en la información proporcionada.

## Limitaciones y advertencias

- **No es un generador de texto útil**: el propio autor lo declara explícitamente; la relación de perplejidad frente al NCM supera 2 y las historias son prosa corta y fluida pero repetitiva.
- **Una sola semilla de entrenamiento**: la versión de 12M de la misma receta varía 2,2 puntos de perplejidad entre semillas, y el salto de 50M a 87M es menor que esa diferencia; no hay repetición a este tamaño.
- **Precisión y datos cambian a la vez**: se entrenó en bf16 con cuatro veces más ventanas que las ejecuciones previas en fp32; la paridad bf16/fp32 solo se comprobó en el modelo de 12M con los datos originales.
- **Códec congelado**: el tokenizador proviene de los experimentos de 12M (E21) y nunca se reentrenó ni amplió junto al generador.
- **Cómputo no igualado**: NCM y AR ven las mismas ventanas, pero no el mismo cómputo; una etapa NCM cuesta más por ventana.
- **Datos sintéticos**: TinyStories es prosa generada por GPT-4; los sesgos del modelo generador pueden filtrarse en los pesos.
- **Evaluación limitada**: un único scorer externo, sin valoración humana; la perplejidad generativa premia texto fluido y repetitivo y no es prueba de calidad.
- **Contexto muy corto**: 128 tokens impiden cualquier uso conversacional o de documento largo.
- **Solo inglés**: no hay capacidades multilingües.
- **Licencia del dato**: los pesos y el código son MIT, pero TinyStories está declarado CDLA-Sharing-1.0 por sus autores; conviene revisar esa licencia y los términos de los modelos que generaron las historias antes de reutilizar salidas.
- **Ecosistema restringido**: requiere `ncm-mlx` y Apple Silicon; no funciona con las herramientas estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmusic/ar-tinystories-91m-x4-mlx
- Modelo NCM comparable: https://huggingface.co/janmusic/ncm-tinystories-87m-x4-mlx
- Repositorio de código `ncm-mlx`: https://github.com/janmus1c/ncm-mlx
- Paper original del método (Kumbong et al.): https://arxiv.org/abs/2610.14162
- Software MLX 0.4.0 (Zenodo): https://doi.org/10.5281/zenodo.23953482
- Working paper v0.13 (Zenodo, no revisado): https://doi.org/10.5281/zenodo.23953213
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Documentación del autor: https://janmus1c.gi (URL truncada en la model card)

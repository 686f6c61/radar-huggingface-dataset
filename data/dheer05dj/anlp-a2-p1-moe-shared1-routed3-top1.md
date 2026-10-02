# dheer05dj/anlp-a2-p1-moe-shared1-routed3-top1

## Resumen

El modelo `dheer05dj/anlp-a2-p1-moe-shared1-routed3-top1` es un transformer decoder-only con capas de mezcla de expertos (MoE) entrenado desde cero para traducción automática de vietnamita a inglés y de japonés a inglés. Lo publica el usuario `dheer05dj` como checkpoint del segundo trabajo de la asignatura ANLP (Advanced Natural Language Processing), y su card lo describe explícitamente como un artefacto académico derivado de un repositorio de prácticas, no como un modelo de producción.

Con 41,57 millones de parámetros totales y 33,18 millones activos por token, el modelo usa una configuración MoE de 1 experto compartido más 3 expertos enrutados con enrutamiento top-1: por cada token se activa el experto compartido y un único experto enrutado. La arquitectura base es un decoder-only de 512 dimensiones de modelo, 8 capas, 8 cabezas de atención, RoPE, RMSNorm y embeddings atados (*tied embeddings*), implementado íntegramente en PyTorch y sin depender de `transformers` estándar.

Su relevancia es fundamentalmente académica y metodológica: sirve como referencia reproducible de un MoE pequeño entrenado con unos 107,3 millones de tokens en 9 minutos y 5 segundos, con resultados publicados de perplejidad y BLEU (39,24 BLEU global, 44,13 en vi->en y 34,27 en ja->en). El repositorio ocupa 0,2 GB y solo contiene pesos en safetensors, sin pipeline declarado, sin licencia y sin idiomas documentados en los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward de mezcla de expertos (MoE: 1 experto compartido + 3 enrutados, enrutamiento top-1); d_model 512, 8 capas, 8 cabezas, RoPE, RMSNorm, embeddings atados |
| Parámetros totales | 41.570.816 (41,57 M) |
| Parámetros activos | 33.180.000 (33,18 M) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponibles en los metadatos de HuggingFace; la card indica entrenamiento para vietnamita->inglés y japonés->inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,2 GB) |
| Vocabulario | no disponible |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La card describe un transformer decoder-only implementado desde cero en PyTorch. La configuración concreta (recogida en el `config.json` como `TransformerConfig` y consumida por `src/part1/model.py` del repositorio de la asignatura) es: d_model de 512, 8 capas, 8 cabezas de atención, codificación posicional rotatoria (RoPE), normalización RMSNorm y embeddings atados entre entrada y salida. La innovación diferencial frente a un transformer denso equivalente está en la capa feed-forward, que se sustituye por un bloque MoE con un experto compartido (siempre activo) y tres expertos enrutados de los que se selecciona uno por token mediante enrutamiento top-1. Esta configuración explica la diferencia entre los 41,57 M de parámetros totales y los 33,18 M activos.

El entrenamiento se realizó sobre tareas de traducción vi->en y ja->en con un total de 107.305.098 tokens, en 9 minutos y 5 segundos. Los registros del entrenamiento están publicados en un *run* de Weights & Biases. No se documenta en la información disponible la composición del dataset, el tokenizador utilizado, la presencia de RLHF, DPO u otras fases de ajuste por preferencias, ni técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática directa vietnamita->inglés, con 44,13 BLEU y perplejidad de test de 3,846 en el subconjunto vietnamita.
- Traducción automática directa japonés->inglés, con 34,27 BLEU y perplejidad de test de 5,265 en el subconjunto japonés.
- Generación de texto autoregresiva condicionada por el prefijo de origen, en un único sentido (origen asiático -> inglés); no se documenta traducción inversa inglés->vi ni inglés->ja.
- Modelado de lenguaje a nivel de token con perplejidad global de test de 4,5 sobre el conjunto de evaluación combinado.
- Eficiencia de inferencia por activación dispersa: solo 33,18 M de los 41,57 M de parámetros se ejecutan por token, lo que reduce el coste de cómputo respecto a un modelo denso del mismo tamaño total.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües más allá de los pares vi->en y ja->en.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (*thinking mode*) ni salidas estructuradas.

## Casos de uso

- Traducción por lotes de documentación técnica en vietnamita y japonés: el modelo puede procesar corpus planos en un pipeline offline, ya que su reducido tamaño permite ejecutar grandes volúmenes en una sola GPU e incluso en CPU, y su BLEU de 44,13 en vi->en lo hace utilizable para textos de dominio general siempre que se acepte revisión humana posterior.
- Preprocesado y aumento de datos para entrenar modelos mayores: las traducciones vi->en y ja->en pueden emplearse para generar pares sintéticos o normalizar corpus multilingües antes de alimentar un modelo de mayor escala, con la ventaja de que el checkpoint completo ocupa 0,2 GB y se puede replicar en paralelo.
- Sistemas de traducción en el borde (*edge*) o en entornos sin GPU: con 41,57 M de parámetros, el modelo cabe holgadamente en memoria de dispositivos embebidos o en contenedores con poca VRAM, lo que permite desplegar traducción local sin dependencia de APIs externas.
- Investigación comparativa sobre mezcla de expertos: el checkpoint forma parte de una familia de variantes que solo cambian la capa feed-forward (por ejemplo, `abhirajratna/anlp-a2-moe-v5` y `unignoramus/anlp-a2-p1-moe-shared`), por lo que resulta útil para estudiar el efecto del número de expertos, el enrutamiento top-1 frente a top-k y el uso de expertos compartidos.
- Docencia y reproducción de experimentos: al estar implementado desde cero en PyTorch y cargarse con `src.part1.train.load_checkpoint(dir)`, sirve como material de laboratorio para entender el ciclo completo de entrenamiento de un MoE, desde la configuración hasta la evaluación con BLEU y perplejidad.
- Traducción asistida en herramientas internas de bajo coste: integrado como servicio local detrás de una interfaz de revisión, puede pre-traducir tickets o correos en vietnamita y japonés al inglés para que un revisor humano corrija, reduciendo el tiempo de lectura frente a la traducción manual.
- Evaluación de técnicas de cuantización sobre modelos MoE pequeños: al ser un modelo diminuto con expertos diferenciados, permite medir de forma controlada el impacto de la cuantización en la calidad de traducción y en el enrutamiento de expertos.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Métrica | Valor |
|---|---|
| Perplejidad de test (global) | 4,5 |
| Perplejidad de test (vi->en) | 3,846 |
| Perplejidad de test (ja->en) | 5,265 |
| BLEU vi->en | 44,13 |
| BLEU ja->en | 34,27 |
| BLEU global | 39,24 |
| Tokens de entrenamiento | 107.305.098 |
| Tiempo de entrenamiento | 9 m 05 s |
| Parámetros totales | 41,57 M |
| Parámetros activos | 33,18 M |

No se han publicado en la información disponible resultados de benchmarks estandarizados como MMLU, HumanEval o GSM8K, ni comparaciones numéricas frente a otros sistemas de traducción sobre los mismos conjuntos de evaluación (por ejemplo, sacreBLEU con test sets públicos, COMET o chrF). Los valores anteriores corresponden a la evaluación interna del autor y no son directamente comparables con cifras de terceros sin conocer el conjunto de test exacto.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 41,57 M de parámetros; no confirmado por el autor): aproximadamente 166 MB en fp32, 83 MB en fp16/bf16, 42 MB en int8 y 21 MB en int4, sin contar activaciones ni memoria del runtime.
- Cabe en cualquier GPU de consumo actual y en muchas integradas: tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) son más que suficientes, y el modelo también puede ejecutarse en CPU en solitario.
- Para entrenamiento o *fine-tuning*, una única GPU de consumo reciente (RTX 3060 12 GB, RTX 4090) es suficiente; la card indica que el entrenamiento original completó 107,3 M de tokens en poco más de 9 minutos, lo que sugiere hardware de datacenter (A100/H100) o GPU de gama alta.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrían sentido para entrenar la familia completa de variantes en paralelo o para servir un número muy alto de peticiones concurrentes.
- Opciones de despliegue: el modelo se carga mediante código propio del repositorio de la asignatura (`src.part1.train.load_checkpoint(dir)`), por lo que no se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni LM Studio. Al no publicarse variantes GGUF y al usar una capa MoE personalizada, el despliegue estándar requeriría exportar la arquitectura o reimplementarla.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| `dheer05dj/anlp-a2-p1-moe-shared1-routed3-top1` | 41,57 M totales / 33,18 M activos | no disponible | no disponible | BLEU global 39,24; test_ppl 4,5 | safetensors, 0 descargas |
| `abhirajratna/anlp-a2-moe-v5` | no disponible | no disponible | no disponible | no disponible | safetensors en HuggingFace |
| `unignoramus/anlp-a2-p1-moe-shared` | no disponible | no disponible | no disponible | no disponible | safetensors en HuggingFace |

Los tres modelos provienen del mismo contexto académico (ANLP A2, parte 1) y traducen vietnamita->inglés y japonés->inglés, diferenciándose únicamente en la capa de alimentación directa: la variante aquí descrita usa 1 experto compartido y 3 enrutados con top-1, mientras que `abhirajratna/anlp-a2-moe-v5` se describe como una de cinco variantes que solo cambian esa capa. No se dispone de especificaciones, licencias ni resultados de benchmarks publicados para las dos alternativas, por lo que no es posible establecer una comparación cuantitativa fiable. No se conocen modelos de referencia de producción comparables que operen en este rango de tamaño y con esta tarea específica.

## Limitaciones y advertencias

- Licencia no disponible: al no publicarse términos de licencia, no hay autorización explícita para uso comercial; en la práctica debe tratarse como un artefacto académico sin garantías y aclarar los términos con el autor antes de cualquier uso en producción.
- Checkpoint derivado de una práctica universitaria: la propia card lo identifica como "checkpoint from ANLP Assignment 2", sin documentación de dataset, tokenizador, composición de datos, filtrado ni evaluación de sesgos.
- Cobertura lingüística muy restringida: solo se documentan las direcciones vi->en y ja->en. No hay evidencia de calidad en otras lenguas ni en la dirección inversa.
- Rendimiento desigual entre idiomas: la perplejidad en japonés (5,265) es notablemente peor que en vietnamita (3,846) y el BLEU cae de 44,13 a 34,27, lo que indica un comportamiento menos fiable en la mitad japonesa del conjunto de evaluación.
- Riesgo de alucinación y de errores de fidelidad: en un modelo de 41,57 M de parámetros entrenado con 107,3 M de tokens, la generación puede inventar términos, nombres propios o cifras, especialmente fuera del dominio de entrenamiento; se recomienda revisión humana en cualquier uso sensible.
- Ausencia de ajuste por instrucciones: no se documenta entrenamiento con RLHF, DPO ni formato conversacional, por lo que el modelo no debe emplearse como asistente de chat ni esperar seguimiento de instrucciones.
- Sin longitud de contexto documentada: no se especifica la ventana máxima soportada, lo que impide garantizar el comportamiento en documentos largos y obliga a validar empíricamente los truncamientos.
- Dependencia de código propietario del repositorio de la asignatura: la carga requiere `src.part1.train.load_checkpoint(dir)`, y no se documenta compatibilidad con bibliotecas de inferencia estándar, lo que complica el mantenimiento a largo plazo.
- Sesgos potenciales no evaluados: no se publican análisis de sesgo de género, nacionalidad o dominio para los corpus de entrenamiento en vietnamita y japonés.
- Repositorio sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, y actualización el mismo día de la creación, lo que sugiere un artefacto no mantenido ni validado por terceros.
- Fechas de creación y actualización registradas como 1 de octubre de 2026, lo que conviene verificar en la propia página de HuggingFace antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p1-moe-shared1-routed3-top1
- Registros de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part1-moe/runs/cc29lap6
- Variante relacionada: https://huggingface.co/abhirajratna/anlp-a2-moe-v5
- Variante relacionada: https://huggingface.co/unignoramus/anlp-a2-p1-moe-shared
- Repositorio de la asignatura: no disponible (la card menciona `src/part1/model.py` y `src.part1.train.load_checkpoint(dir)` sin enlace público)

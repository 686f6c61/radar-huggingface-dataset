# alexkstern/kdyck_dose_1Bpt_adamwppt_1B_s0_2026-09-06_20-43-49_781248-pt

## Resumen

Este modelo es un experimento de investigación entrenado con la librería nanochat, desarrollado por alexkstern. Se trata de un transformer de 16 capas, 1024 dimensiones y 8 cabezas de atención, con una ventana de contexto de 2048 tokens. Su particularidad es que se entrena en dos fases: primero sobre 1.000 millones de tokens de FineWeb con un vocabulario de 65.536 tokens (fase PT), y después sobre 1.000 millones de tokens del lenguaje formal Dyck-k con un vocabulario reducido a 256 tokens (fase PPT). En la transición se reinicializan los embeddings y se reinicia el optimizador. El checkpoint publicado corresponde al paso 3.814 y ha consumido 2,08e18 FLOPs. Su interés radica en estudiar cómo afecta el cambio de vocabulario y la dosis de tokens al aprendizaje de estructuras sintácticas formales, un área relevante para la investigación en eficiencia de tokens y en interpretabilidad de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, con 16 capas, 8 cabezas de atención, 8 cabezas KV (sin GQA, n_kv_head igual a n_head), dimensión del modelo 1024 y secuencia máxima 2048. La configuración define dos modelos: uno para la fase PT con vocab_size 65.536 y otro para la fase PPT con vocab_size 256, manteniendo el mismo resto de hiperparámetros. El preentrenamiento se realizó sobre fineweb-nanochatbpe-20B (1.000 millones de tokens) y la fase PPT sobre dyck-k128-seq_len_2048-1B (1.000 millones de tokens). Como datos auxiliares de evaluación se usó c4-nanochatbpe-10B. En la transición entre fases se reinicializan los embeddings (reinit_embed_at_transition) y se reinicia el optimizador (reset_optimizer_at_transition). El programa de aprendizaje es trapezoidal, con warmup 0 en la fase PT y 0,1 en la fase PPT, y con warmdown 0,4 y 0,2 respectivamente. La tasa de aprendizaje para la fase PPT es 1e-6. El optimizador AdamW usa tasas diferenciadas: 0,02 para matrices, 0,3 para embeddings y 0,004 para unembeddings, con weight decay 0. El modelo se compiló (compile_model true) y se aplicó grad clip 1.0. El checkpoint publicado está en el paso 3.814, con una pérdida de entrenamiento suavizada de 3,162 y un objetivo mínimo de 0,943. El coste total fue de 2,08e18 FLOPs, con 2,08e9 FLOPs por token, y un tiempo de entrenamiento de 1.460,95 segundos.

## Capacidades

- Generación de secuencias sobre el vocabulario de 256 tokens de la fase PPT, que corresponde al lenguaje Dyck-k (paréntesis balanceados con 128 tipos).
- Razonamiento formal limitado a estructuras de paréntesis: el modelo ha sido entrenado específicamente para predecir tokens en secuencias Dyck, por lo que su capacidad de generalización a otros dominios es muy baja.
- No soporta tool calling ni function calling.
- No soporta visión, audio ni multimodalidad.
- No soporta agentes ni razonamiento multi-paso más allá de la generación autorregresiva.
- Capacidades multilingües: no disponibles; el vocabulario final no parece estar diseñado para lenguaje natural.
- No dispone de modo de pensamiento ni de entrenamiento por instrucciones (RLHF/DPO ausentes).

## Casos de uso

- Investigación en lenguajes formales: evaluar la precisión del modelo en secuencias Dyck-k balanceadas, comparando con otros checkpoints del mismo experimento para medir el efecto de la tokenización reducida.
- Análisis del efecto de la reinicialización de embeddings: este checkpoint sirve como referencia para comparar con variantes que no reinicializan embeddings en la transición (por ejemplo, los repos de kdyck_dose_1Bpt_hfinit_100M_s1).
- Interpretabilidad: al ser un modelo pequeño y entrenado en un dominio sintético, es adecuado para visualizar patrones de atención y activaciones que codifican el balanceo de paréntesis.
- Benchmark de coste computacional: usar los datos de FLOPs por token (2,08e9) para comparar la eficiencia de diferentes arquitecturas o configuraciones de tokenización.
- Reproducción de experimentos: el checkpoint permite reproducir el pipeline de nanochat y validar las métricas reportadas en la model card.
- Material docente: sirve como ejemplo de preentrenamiento en dos fases con cambio de vocabulario en un entorno académico.
- Pruebas de métodos de alineación en dominios sintéticos: puede usarse como banco de pruebas para técnicas de RLHF o DPO en un entorno controlado donde la tarea es predecir secuencias Dyck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se reportan métricas de entrenamiento: smooth_train_loss 3,162 y min_objective 0,943, junto con el coste computacional (2,08e18 FLOPs, 2,08e9 FLOPs por token). No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: sin datos oficiales. Basado en la arquitectura (16 capas, 1024 dimensiones, vocab 256), el modelo tiene aproximadamente 202 millones de parámetros, lo que en fp32 ocupa unos 0,8 GB. Si el checkpoint conserva el vocabulario de 65.536 tokens, el tamaño en fp32 sería de unos 1,3 GB. En cualquier caso, cabe en GPUs con 4 GB de VRAM.
- GPU recomendada: cualquier GPU con 4 GB o más (por ejemplo, RTX 3050, RTX 3060, T4). Para entrenamiento o análisis de activaciones se recomienda al menos 8 GB.
- Despliegue: al ser un checkpoint en formato state_dict de PyTorch, se carga usando la librería nanochat. No es compatible directamente con vLLM, Ollama o llama.cpp porque no está en formato GGUF ni tiene una arquitectura estandarizada en HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Existen otros checkpoints del mismo autor bajo nombres similares (por ejemplo, kdyck_dose_1Bpt_hfinit_100M_s1 o kdyck_dose_1Bpt_1B_s0), que parecen variantes del mismo experimento con diferentes inicializaciones o tamaños, pero no se dispone de información suficiente para establecer una comparación técnica formal.

## Limitaciones y advertencias

- Modelo de investigación, no entrenado para seguir instrucciones ni mantener diálogos.
- El vocabulario final de 256 tokens está orientado a secuencias Dyck; no puede generar texto natural estándar.
- No se ha realizado alineación (RLHF/DPO), por lo que puede generar contenido no deseado si se usa fuera de su dominio.
- Alto riesgo de alucinación en entornos de lenguaje natural.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es práctico para producción.
- El checkpoint requiere la librería nanochat para cargarse, y no está disponible en formato GGUF ni safetensors.
- Las métricas reportadas son internas de entrenamiento; no hay evidencia de rendimiento en tareas externas.

## Enlaces

- Modelo: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_adamwppt_1B_s0_2026-09-06_20-43-49_781248-pt
- W&B: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/re0ko1gk
- nanochat: https://github.com/karpathy/nanochat
- Checkpoints relacionados:
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfinit_100M_s1_2026-08-14_14-06-21_528564-pt
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_1B_s0_2026-08-14_08-35-00_389719-pt

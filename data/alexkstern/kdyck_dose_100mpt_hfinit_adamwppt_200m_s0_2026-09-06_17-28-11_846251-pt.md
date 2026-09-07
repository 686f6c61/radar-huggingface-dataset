# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s0_2026-09-06_17-28-11_846251-pt

## Resumen
El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_200M_s0` es un checkpoint de investigación creado por alexkstern con la librería nanochat de Karpathy. Se trata de un transformer decoder-only de pequeño tamaño (16 capas, 8 cabezas de atención, dimensión de embedding 1024) entrenado en dos fases: primero durante 100 millones de tokens en el dataset FineWeb (con un vocabulario BPE de 65536 tokens) y después durante 200 millones de tokens en un dataset Dyck-k128 con secuencias de longitud 2048. El objetivo del experimento es estudiar el efecto de la dosis de tokens de post-entrenamiento en tareas de razonamiento formal y dependencias de largo alcance. El contexto máximo es de 2048 tokens. Es relevante para la comunidad de investigación en interpretabilidad y evaluación de arquitecturas, ya que permite reproducir y comparar el impacto de datos sintácticos artificiales en transformadores pequeños.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV y dimensión de embedding 1024 |
| Parametros totales | no disponible (la configuración no incluye el recuento de parámetros; el repositorio ocupa 3.0 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint en formato .pt) |
| Idiomas soportados | no disponible (el dataset de preentrenamiento es FineWeb, mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only estilo GPT, configurado con sequence_len 2048, vocab_size 65536, n_layer 16, n_head 8, n_kv_head 8 y n_embd 1024. Dado que n_kv_head coincide con n_head, se trata de atención multi-cabeza estándar. El entrenamiento se realizó con la librería nanochat de Karpathy y se compiló el modelo con torch.compile. El esquema de entrenamiento sigue una estrategia de "token-dose" en dos fases: preentrenamiento (pt) en FineWeb-nanochatbpe-100M con 100 millones de tokens, y post-entrenamiento (ppt) en Dyck-k128-seq_len_2048-1B con 200 millones de tokens de un total de 1B disponibles en ese dataset. En la transición entre fases se reinicializa el embedding (reinit_embed_at_transition: true) y se resetea el optimizador (reset_optimizer_at_transition: true). El optimizador es AdamW con learning rate trapezoidal; en la fase de preentrenamiento se usan warmup ratio 0 y warmdown ratio 0.4, mientras que en la fase de post-entrenamiento se usa lr 3e-05 sin warmup ni warmdown. No se han aplicado técnicas de RLHF ni DPO. El checkpoint se guarda en el paso 1525, tras aproximadamente 226 segundos de entrenamiento.

## Capacidades
- Generación de texto autorregresiva: al ser un GPT, es capaz de generar texto continuando secuencias.
- Razonamiento formal básico: el post-entrenamiento en Dyck-k128 sugiere que puede modelar estructuras de paréntesis anidados con hasta 128 tipos de paréntesis y secuencias de 2048 tokens, lo que implica cierta capacidad para dependencias de largo alcance.
- Manejo de contexto largo de hasta 2048 tokens gracias a la atención completa.
- Multilingüe: no hay datos; el corpus de preentrenamiento es FineWeb, que es predominantemente inglés.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Visión y audio: no disponible (solo texto).

## Casos de uso
- Investigación en lenguajes formales: el checkpoint puede usarse para estudiar cómo un transformer pequeño aprende el lenguaje Dyck-k, sirviendo como punto de partida para análisis de interpretabilidad, por ejemplo, sobre el papel de los embeddings reinicializados en la transición de fase.
- Benchmarks de dependencias de largo alcance: con una ventana de 2048 tokens, es útil para probar la capacidad de atención en secuencias sintéticas con anidamientos profundos.
- Ablaciones de entrenamiento por fases: al comparar con otros checkpoints de la misma serie, permite evaluar el efecto de la dosis de datos sintéticos en el rendimiento final.
- Educación en arquitecturas transformer: es un ejemplo reproducible (configuración completa, semilla fija, W&B log) de entrenamiento con nanochat, ideal para cursos o tutoriales.
- Fine-tuning para tareas sintácticas: puede servir como checkpoint base para ajustes en otros lenguajes de paréntesis o gramáticas formales pequeñas.
- Experimentos de compilación y optimización: al haberse entrenado con torch.compile, es útil para medir mejoras de rendimiento en hardware específico.
- Replicabilidad de experimentos: el repositorio incluye configuración, metadatos y semilla fija, lo que facilita reproducir los resultados en futuros trabajos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato reportado en la model card es la smooth_train_loss (3.5847) y el min_objective (1.1368) en el paso 1525, junto con las flops totales (2.08e17) y el tiempo de entrenamiento (225.99 segundos). No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada: no disponible en la model card. Dado el tamaño de la configuración (n_embd 1024, 16 capas, vocabulario 65536), una estimación aproximada situaría el modelo por debajo de 1.5 GB en FP32, por lo que cabría en GPU de consumo con 4 GB o más. Esta cifra es orientativa, no oficial.
- GPU recomendadas: el entrenamiento se registró con un peak_tflops de 2250, lo que sugiere una GPU tipo H100. Para inferencia, cualquier GPU moderna es suficiente, aunque no hay datos oficiales.
- En GPU de consumo: sí, según la estimación anterior, pero sin confirmación oficial.
- Opciones de despliegue: el checkpoint está en formato .pt de PyTorch, por lo que requiere el código de nanochat para cargar el modelo. No se informa de compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no hay datos publicados.

## Comparativa con modelos similares
No se dispone de benchmarks publicados para comparar con otras arquitecturas. Dentro de la misma serie del autor existen otros checkpoints, pero no se han publicado los resultados de esos modelos. La siguiente tabla recoge las diferencias de nombre y licencia, con la mayoría de especificaciones no disponibles.

| Modelo | Datos pt | Datos ppt | Contexto | Licencia |
|---|---|---|---|---|
| kdyck_dose_100Mpt_hfinit_adamwppt_200M_s0 | FineWeb 100M | Dyck-k128 200M | 2048 | Apache-2.0 |
| kdyck_dose_100Mpt_5M_s0 | no disponible | no disponible | no disponible | Apache-2.0 |
| kdyck_dose_100Mpt_hfinit_200M_s0 | no disponible | no disponible | no disponible | Apache-2.0 |

## Limitaciones y advertencias
- Es un modelo de investigación exclusivamente; no se ha sometido a pruebas de seguridad, alineación ni robustez.
- El preentrenamiento en FineWeb (corpus inglés con posibles sesgos) y el post-entrenamiento en un lenguaje artificial como Dyck-k hacen que el modelo no esté orientado a tareas del mundo real.
- Riesgo de alucinación: al no haber RLHF ni DPO, el modelo puede generar contenido factualmente incorrecto si se usa fuera de su dominio de entrenamiento.
- Limitaciones de contexto: solo 2048 tokens; en secuencias más largas no tiene capacidad de atención.
- Idiomas: no hay soporte multilingüe confirmado; toda la evaluación se limita a inglés y al lenguaje Dyck artificial.
- Formato de pesos: el checkpoint .pt no es directamente compatible con la mayoría de frameworks de inferencia estándar; requiere el código de nanochat.
- Licencia Apache-2.0: permite uso comercial, pero no incluye garantías; el uso en producción debe ser evaluado por el usuario.

## Enlaces
- Hugging Face: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s0_2026-09-06_17-28-11_846251-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro W&B: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/pvp524m1
- Modelos relacionados:
  - https://huggingface.co/alexkstern/kdyck_dose_100Mpt_5M_s0_2026-08-14_17-52-53_380978-pt
  - https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_200M_s0_2026-08-14_04-58-21_460275-pt

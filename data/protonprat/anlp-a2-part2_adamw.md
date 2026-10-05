# ProtonPrat/anlp-a2-part2_adamw

## Resumen

`ProtonPrat/anlp-a2-part2_adamw` es un modelo de lenguaje causal de arquitectura personalizada, entrenado por el usuario ProtonPrat como parte de la asignatura ANLP (Advanced Natural Language Processing). Se trata de un transformer decoder-only para predicción del siguiente token, con 10.084.480 parámetros totales, entrenado sobre el corpus `browndw/human-ai-parallel-corpus` y exportado en formato PyTorch/Safetensors. No es un modelo de producción: es una entrega académica de un único seed, sin barrido de hiperparámetros.

El modelo no está registrado en la librería Transformers como arquitectura `AutoModel`; requiere cargarse mediante la clase `src.part1.model.Transformer` del repositorio de la asignatura o ejecutando `scripts/infer.py`. El tokenizador es un BPE a nivel de byte entrenado únicamente sobre el corpus de entrenamiento, y el idioma declarado es inglés (`en`). No se especifica licencia ni pipeline en la metadata de HuggingFace.

Su relevancia es fundamentalmente docente y de investigación metodológica: sirve como referencia reproducible para estudiar el comportamiento del optimizador AdamW en pretraining a pequeña escala, para comparar checkpoints intermedios del mismo corpus y para reproducir el ejercicio académico. No compite con modelos de propósito general ni está pensado para despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, personalizada (no registrada como AutoModel de Transformers) |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible (el autor menciona implementacion de MoE en el trabajo, pero no se especifica si este checkpoint la usa ni el ratio de activacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`) y checkpoints PyTorch `.pt` (`final.pt`, `latest.pt`, `best.pt`, `fraction_0.1.pt` a `fraction_1.0.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de implementacion propia, orientado a prediccion del siguiente token. El modelo se entreno sobre `browndw/human-ai-parallel-corpus` en la revision `b514ff64988d9e322fd81c5d70d69a38e78491f5`, consumiendo 42.307.041 posiciones de entrenamiento. El optimizador empleado es AdamW, implementado desde cero para la asignatura con ayuda de codigo asistido por LLM, y no se aplico ningun barrido de ajuste de hiperparametros sobre el optimizador (resultados de un unico seed).

La model card menciona que durante el trabajo se implementaron componentes de tipo MoE, actualizaciones del optimizador y decodificacion, pero no aclara si el checkpoint exportado incorpora capa MoE activa ni detalla su configuracion, por lo que ese punto queda como no disponible. El tokenizador es un BPE a nivel de byte entrenado solo sobre el corpus de entrenamiento. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni datos de composicion interna del dataset mas alla de su identificador.

## Capacidades

- Generacion de texto en ingles mediante continuacion de prompt (causal LM).
- Prediccion del siguiente token y modelado de lenguaje autorregresivo.
- Continuacion de texto a partir de una indicacion en ingles (`--language` no aplica a los modelos de la parte 2; aceptan un prompt de continuacion en ingles).
- Uso de un tokenizador BPE a nivel de byte entrenado ad hoc sobre el corpus.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes o modo de pensamiento: no disponibles / no declaradas.
- Capacidades multilingues: limitadas al ingles, segun la metadata del modelo.

## Casos de uso

- Material didactico para asignaturas de NLP: sirve como ejemplo reproducible de un transformer causal entrenado desde cero, con checkpoints intermedios (`fraction_0.1.pt` a `fraction_1.0.pt`) utiles para explicar la dinamica de entrenamiento.
- Reproduccion y verificacion de resultados academicos: el checkpoint permite recalcular la perplejidad de test (64,436436) y el BLEU de continuacion (1,139365) declarados por el autor.
- Estudio comparativo de optimizadores: el nombre del artefacto (`_adamw`) y la referencia al paper "Fantastic Pretraining Optimizers and Where to Find Them" (arXiv:2509.02046) lo situan como base para experimentos sobre AdamW frente a alternativas.
- Demostraciones docentes de inferencia con transformers personalizados: al no registrarse como `AutoModel`, obliga a cargar la clase `Transformer` del repositorio y a usar `scripts/infer.py`, lo que resulta util para ensenar el flujo completo de exportacion e inferencia.
- Analisis de tokenizacion BPE a nivel de byte: el tokenizador entrenado solo sobre el corpus permite estudiar cobertura de vocabulario y fragmentacion en dominios especificos.
- Investigacion de tecnicas de decodificacion: dado que la decodificacion se implemento como parte del trabajo, puede usarse para comparar estrategias de generacion a pequena escala.
- Experimentos de bajo coste en entornos sin GPU: con unos 10 millones de parametros, cabe en CPU y en cualquier GPU de consumo para pruebas rapidas de continuacion de texto.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de test | 64,436436 |
| BLEU de continuacion de test | 1,139365 |
| Posiciones de entrenamiento | 42.307.041 |
| Parametros totales | 10.084.480 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El autor advierte expresamente que "las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica".

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 10,08 M de parametros ocupan en torno a 40 MB; en fp16, unos 20 MB. El repositorio completo pesa 1,5 GB porque incluye todos los checkpoints de reanudacion (optimizador, RNG y cursor de tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en cualquier RTX, GTX o integrada con soporte CUDA; incluso en CPU para pruebas puntuales.
- Opciones de despliegue: no hay soporte declarado para vLLM, TGI, Ollama o llama.cpp. La via oficial es cargar el modelo con la clase `Transformer` del repositorio de la asignatura o ejecutar `scripts/infer.py` sobre la carpeta `hf_export`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los unicos modelos comparables identificados son otros checkpoints de la misma asignatura, no modelos de produccion.

| Modelo | Parametros | Optimizador | Datos | Metrica declarada | Licencia |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part2_adamw | 10.084.480 | AdamW (desde cero) | 42.307.041 posiciones | Perplejidad test 64,436436; BLEU 1,139365 | no disponible |
| dnebh/anlp-a2-part2-adamw | 33,4 M (dense) | AdamW desde cero, lr 0.001 | 48.496.640 tokens, mismo corpus | val loss 3,1717; BLEU test 0,603999 | no disponible |
| Adi-AI/anlp-a2-part2-adamw | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas con modelos de proposito general (por ejemplo, GPT-2, Pythia o TinyLlama) en la informacion proporcionada, y la diferencia de escala y de datos hace que cualquier comparacion directa carezca de sentido.

## Limitaciones y advertencias

- Modelo de proposito academico, no validado para uso en produccion ni para tareas reales de usuario.
- Entrenado sobre un unico seed y sin barrido de ajuste de hiperparametros del optimizador: los resultados no deben extrapolarse.
- Perplejidad de test alta (64,436436) y BLEU de continuacion muy bajo (1,139365), lo que indica una calidad de generacion limitada.
- El autor advierte que las metricas automaticas de verosimilitud y solapamiento no garantizan calidad semantica.
- Sin licencia declarada: no se puede asumir permiso de uso comercial ni redistribucion.
- Idiomas: solo ingles declarado; no hay soporte multilingue.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones o documentos largos.
- No esta registrado como `AutoModel` de Transformers: no se puede cargar con `from_pretrained` ni desplegar con herramientas estandar (vLLM, TGI, Ollama) sin trabajo adicional.
- El tokenizador se entreno solo sobre el corpus del ejercicio, por lo que su cobertura fuera de ese dominio es incierta.
- Componentes de MoE, optimizador y decodificacion se desarrollaron con asistencia de codigo por LLM, segun indica el propio autor; conviene auditar el codigo antes de reutilizarlo.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero esperable dado el tamano y los datos de entrenamiento.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part2_adamw
- Run de Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/hlvga10u
- Dataset de entrenamiento: `browndw/human-ai-parallel-corpus` (revision `b514ff64988d9e322fd81c5d70d69a38e78491f5`, disponible en HuggingFace)
- Paper de referencia sobre optimizadores: https://arxiv.org/abs/2509.02046
- Checkpoint comparable de la misma asignatura: https://huggingface.co/dnebh/anlp-a2-part2-adamw
- Checkpoint comparable de la misma asignatura: https://huggingface.co/Adi-AI/anlp-a2-part2-adamw

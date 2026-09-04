# ahmedikram/SWE-Qwen-qwen3-14b-higher_rank_14b

## Resumen

El modelo `SWE-Qwen-qwen3-14b-higher_rank_14b` es un adaptador LoRA obtenido mediante QLoRA sobre el modelo base `Qwen/Qwen3-14B`, desarrollado por `ahmedikram`. Su propósito es la resolución automatizada de incidencias de software: dado un *issue* de GitHub, el modelo genera un parche que hace que los tests `FAIL_TO_PASS` pasen y que los tests `PASS_TO_PASS` sigan pasando dentro del repositorio real. El proyecto se centra en el subconjunto SWE-bench de problemas en Python.

El adaptador se entrenó con la técnica QLoRA (4-bit NF4) usando Unsloth y FlashAttention 2.8.3 sobre una A100-80GB en la plataforma Modal. El repositorio de HuggingFace contiene solo el adaptador PEFT (0.5 GB), no los pesos completos del modelo base. La variante `higher_rank_14b` fue seleccionada como campeona frente a otras dos configuraciones de LoRA, alcanzando un 17.20% de éxito F2P (resolución del issue) y 90.10% de preservación P2P en una muestra de 100 instancias del golden set de SWE-bench.

La relevancia actual del modelo es doble: demuestra que es posible ajustar un modelo de 14.000 millones de parámetros para una tarea compleja de ingeniería de software con un presupuesto de cómputo muy reducido (alrededor de 1.2 horas de entrenamiento por variante), y ofrece una alternativa evaluable y reproducible para la comunidad que trabaja en resolución de issues de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-14B) con adaptador LoRA (QLoRA) |
| Parametros totales | 14.000 millones (modelo base) + adaptador LoRA (~0.5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (límite máximo de secuencia durante el entrenamiento; contexto del modelo base no especificado) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); AWQ para despliegue con vLLM |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT, 0.5 GB) |

## Arquitectura y entrenamiento

El modelo consiste en un adaptador LoRA de rango 32 y alpha 64 aplicado sobre el modelo base Qwen3-14B mediante la técnica QLoRA. El entrenamiento se realizó con Unsloth y FlashAttention 2.8.3 en una instancia A100-80GB de Modal. Los hiperparámetros principales fueron: tasa de aprendizaje 2e-5, 1 época, bfloat16, optimizador `paged_adamw_8bit`, scheduler coseno con warmup del 3%, weight decay 0.01, longitud máxima de secuencia 4096 y empaquetado de secuencias activado.

Los datos de entrenamiento consisten en 14.833 ejemplos tokenizados de SWE-bench, curados a partir de 17.456 registros limpios. La división está estratificada por repositorio, y el golden set de 2.313 instancias se excluyó del entrenamiento para permitir una evaluación imparcial. Una innovación destacable es el uso de plantillas de prompts Jinja2 versionadas, compartidas entre entrenamiento e inferencia, lo que evita una deriva silenciosa de prompts entre ejecuciones. El proyecto también incluye seguimiento de experimentos con Weights & Biases para las tres variantes comparadas.

## Capacidades

- Generación de parches de código: el modelo recibe un *issue* de GitHub y produce un parche que debe hacer pasar los tests `FAIL_TO_PASS` y preservar los `PASS_TO_PASS`.
- Razonamiento sobre repositorios reales: la evaluación se ejecuta dentro de las imágenes Docker oficiales de SWE-bench, lo que valida el parche en el entorno real del repositorio.
- Optimización para Python: el subconjunto de SWE-bench utilizado está centrado en proyectos de Python.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no explícito; el modelo opera como un generador de parches a partir de un *prompt* estructurado.
- Capacidades multilingües: no; el adaptador está entrenado en inglés y el dominio es código en inglés.
- Integración con vLLM mediante `LoRARequest`: permite intercambiar adaptadores por petición sobre una base AWQ, ofreciendo un despliegue flexible y compatible con la API de OpenAI.

## Casos de uso

- Automatización de resolución de issues en repositorios Python: el modelo se podría integrar en un bot que reciba un *issue* de GitHub, genere un parche y lo proponga como *pull request* automática. Es adecuado porque el fine-tune está específicamente optimizado para producir parches que satisfacen el test de regresión en SWE-bench.
- Asistente para desarrolladores en entornos CI/CD: al integrarse con pipelines de integración continua, el modelo puede sugerir un parche al fallar una suite de tests. Su capacidad de preservar `PASS_TO_PASS` reduce el riesgo de romper funcionalidades existentes.
- Evaluación de modelos de resolución de código: sirve como referencia o baseline para investigaciones que comparan estrategias de fine-tuning LoRA frente a modelos más grandes o a agentes basados en razonamiento.
- Mantenimiento de bases de código con tests heredados: el modelo está diseñado para no romper los tests que ya pasan, lo que resulta útil en tareas de refactorización o corrección de bugs en proyectos con una suite de regresión extensa.
- Investigación en eficiencia de fine-tuning: el proyecto documenta el coste de entrenamiento y la comparación entre variantes, lo que permite estudiar el impacto del rango y la tasa de aprendizaje en el rendimiento final.
- Despliegue en plataformas de modelos como servicio: con vLLM y soporte LoRA, es posible servir múltiples adaptadores sobre la misma base AWQ, lo que abarata el alojamiento de varias variantes o de modelos para distintos dominios.

## Benchmarks y rendimiento

La evaluación se realizó mediante ejecución real dentro de las imágenes Docker oficiales de SWE-bench sobre una muestra de 100 instancias del golden set de 2.313. Los intervalos de confianza son Wilson al 95%. Los resultados son los siguientes:

| Variante | F2P (95% Wilson CI) | P2P | Latencia | Flaky | Nota |
|---|---|---|---:|---:|---:|---|
| Qwen3-14B (base) | 2.46% (0.8–7.7%) | 28.54% | 10.04 s | 0.06% | Rechazada (P2P < 90%) |
| baseline_14b (LoRA r=16) | 12.30% (7.2–20.2%) | 85.90% | 9.47 s | 0.03% | Rechazada (P2P < 90%) |
| **higher_rank_14b** | **17.20% (11.1–25.8%)** | **90.10%** | **8.92 s** | **0.01%** | **Champion** |
| higher_lr_14b | 14.80% (9.1–23.1%) | 87.60% | 9.12 s | 0.02% | Rechazada (P2P < 90%) |

Comparado con el modelo base, la variante campeona mejora el F2P en un factor de 7.0× (de 2.46% a 17.20%) y el P2P en 61.6 puntos porcentuales (de 28.54% a 90.10%). La significación estadística se reporta con McNemar p ≈ 6e-05 y un intervalo bootstrap pareado cuyo límite inferior es mayor que cero. El modelo base no supera los umbrales mínimos de calidad, y solo la variante `higher_rank_14b` logra un P2P superior al 90%.

## Requisitos de hardware

- Entrenamiento: una GPU A100-80GB (en la plataforma Modal). La duración del entrenamiento de cada variante fue de aproximadamente 4.214 segundos (~1.2 horas).
- Inferencia: se recomienda servir el modelo con vLLM sobre la base AWQ de Qwen3-14B (4-bit). El adaptador LoRA pesa solo 0.5 GB, por lo que la VRAM requerida es la del modelo base cuantizado más un pequeño margen para el adaptador.
- GPU recomendadas: no se especifica un modelo de GPU en la información. La evaluación se ejecutó en una A100-80GB con caché templada, y esa misma infraestructura se puede usar para inferencia.
- Opciones de despliegue: vLLM con `enable_lora=True` y `LoRARequest`, compatible con la API de OpenAI. No se mencionan otras herramientas como llama.cpp, Ollama ni TGI.
- Latencia y throughput: la latencia media de generación del adaptador champion es de 8.92 segundos por petición en la A100-80GB evaluada. No se proporcionan datos de throughput.

## Comparativa con modelos similares

La comparación disponible en la información es interna, entre las variantes del mismo proyecto. No se dispone de datos de comparación con otros modelos de SWE-bench u otros modelos de resolución de code issues en la información publicada.

| Variante | Parámetros LoRA | F2P | P2P | Latencia | Licencia |
|---|---|---|---:|---:|---:|---|
| Qwen3-14B (base) | — | 2.46% | 28.54% | 10.04 s | Apache-2.0 |
| baseline_14b | r=16 | 12.30% | 85.90% | 9.47 s | Apache-2.0 |
| **higher_rank_14b** | **r=32, α=64** | **17.20%** | **90.10%** | **8.92 s** | **Apache-2.0** |
| higher_lr_14b | lr=2e-5 (sin variar r) | 14.80% | 87.60% | 9.12 s | Apache-2.0 |

Todas las variantes comparten el mismo modelo base, la misma licencia Apache-2.0 y el mismo presupuesto de entrenamiento. La variante campeona se distingue por un mayor rango LoRA y consigue la mejor latencia además del mejor rendimiento en F2P y P2P.

## Limitaciones y advertencias

- El éxito F2P es del 17.20%, lo que implica que la mayoría de los parches generados no resuelven el issue correctamente. Los parches deben ser revisados y validados por tests antes de fusionarse.
- El modelo está entrenado exclusivamente en inglés y en un subconjunto de SWE-bench centrado en Python, por lo que su rendimiento en otros lenguajes o dominios no está garantizado.
- La longitud máxima de secuencia durante el entrenamiento es de 4096 tokens. Issues o contextos de código más largos pueden truncarse y degradar la calidad del resultado.
- La evaluación se realizó sobre una muestra de 100 instancias del golden set de 2.313, por lo que los intervalos de confianza son amplios y el rendimiento en el conjunto completo podría diferir.
- La latencia reportada se midió en una A100-80GB con caché templada en Modal; en otros entornos de despliegue la latencia variará.
- No se documentan sesgos específicos, pero al estar entrenado en SWE-bench el modelo puede estar sesgado hacia los repositorios presentes en el dataset.
- La licencia Apache-2.0 permite el uso comercial, pero es necesario mantener el aviso de copyright y la licencia en las redistribuciones.

## Enlaces

- HuggingFace: https://huggingface.co/ahmedikram/SWE-Qwen-qwen3-14b-higher_rank_14b
- Repositorio del proyecto: https://github.com/AhmedIkram05/SWE-Qwen
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Registro de experimentos en Weights & Biases: no se proporciona una URL pública en la información disponible.

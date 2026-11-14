# jjhpark/adamw-PT-adamw-MT-a10-g20-fdr

## Resumen

adamw-PT-adamw-MT-a10-g20-fdr es un checkpoint intermedio de investigación publicado por el usuario jjhpark en Hugging Face. No es un modelo conversacional final ni un modelo afinado para instrucciones: se trata de un punto de control del preentrenamiento (mid-training) de un transformer de tipo Qwen2 con 494.032.768 parámetros, obtenido tras 10.000 pasos de entrenamiento sobre aproximadamente 20.970 millones de tokens. Su interés es experimental: sirve para reproducir y estudiar una receta concreta de mezcla de datos y decaimiento de learning rate.

La receta documentada en la model card combina un presupuesto de mid-training del 10 % con un esquema de datos en dos etapas y una proporción final de datos de mid-training del 20 %, que entran en el paso 5.000. El learning rate decae linealmente de 5e-4 a 1e-5 a lo largo de los 10.000 pasos, un ajuste que el autor etiqueta como FDR. El modelo se presenta como reproducción del artículo arXiv 2610.29348 usando Megatron-LM.

Es relevante ahora porque los checkpoints intermedios de este tipo permiten analizar el efecto de las decisiones de mezcla de datos sobre las pérdidas por dominio (DCLM y FineMath) sin necesidad de repetir el entrenamiento completo. No obstante, al no estar afinado para diálogo ni para seguir instrucciones, su utilidad práctica en producción es muy limitada y debe tratarse como material de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen2, con 494 millones de parámetros totales. El checkpoint corresponde al estado del modelo tras 10.000 pasos de mid-training partiendo del checkpoint de preentrenamiento [adamw-PT](https://huggingface.co/jjhpark/adamw-PT). El entrenamiento se realizó con Megatron-LM y reproduce la receta del artículo arXiv 2610.29348.

La innovación documentada no está en la arquitectura, sino en la estrategia de datos y de optimización. Se aplica un presupuesto de mid-training del 10 % sobre un esquema de datos en dos etapas: los datos de mid-training (FineMath-4plus) entran en el paso 5.000 y alcanzan una proporción final del 20 %. El learning rate sigue un decaimiento lineal de 5e-4 a 1e-5 durante los 10.000 pasos completos (FDR). El autor reporta las pérdidas sobre un subconjunto de 32 millones de tokens en el paso 10.000: 2,7411 en DCLM y 1,6437 en FineMath. No se documentan fases de RLHF ni DPO, ni detalles sobre composición completa del dataset, número total de tokens de preentrenamiento previo o técnicas de atención específicas.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje causal preentrenado.
- Razonamiento matemático incipiente, reforzado por la inclusión de datos FineMath-4plus en la fase de mid-training.
- Modelado de lenguaje general, evaluado mediante la pérdida sobre DCLM.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica; los idiomas soportados figuran como no disponibles.
- No se documenta modo thinking, visión ni audio.
- Al ser un checkpoint de mid-training sin ajuste por instrucciones, no cabe esperar un comportamiento conversacional fiable.

## Casos de uso

- Reproducción de experimentos: sirve como punto de partida para replicar la receta de mid-training descrita y comparar curvas de pérdida frente a variantes con otra proporción de datos de mid-training.
- Estudio de mezclas de datos: permite analizar cómo la entrada de FineMath-4plus en el paso 5.000 y su proporción final del 20 % afectan a las pérdidas por dominio (DCLM frente a FineMath).
- Investigación sobre schedules de learning rate: útil para contrastar el decaimiento lineal de 5e-4 a 1e-5 aplicado durante todo el entrenamiento frente a otras políticas.
- Punto de partida para ajuste supervisado: al ser un checkpoint intermedio, puede servir como base para experimentos de SFT en entornos de investigación con recursos limitados, dado su tamaño de 494 millones de parámetros.
- Evaluación de infraestructura de entrenamiento: útil para validar pipelines basados en Megatron-LM y comprobar la reproducibilidad de las pérdidas reportadas.
- Docencia y divulgación: adecuado para ilustrar en un entorno controlado el efecto de las decisiones de mid-training sobre métricas de pérdida por dominio, sin los costes de un entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pérdidas sobre un subconjunto de 32 millones de tokens en el paso 10.000:

| Metrica | Valor |
|---|---|
| Perdida DCLM (paso 10.000) | 2,7411 |
| Perdida FineMath (paso 10.000) | 1,6437 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB solo para los pesos (494 millones de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB para los pesos; en 4 bits, alrededor de 0,25 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-8 GB de VRAM es suficiente para inferencia en precisión reducida; para entrenamiento o ajuste se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI y llama.cpp son compatibles en principio con la arquitectura Qwen2, aunque no se han publicado conversiones GGUF ni configuraciones validadas para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| adamw-PT-adamw-MT-a10-g20-fdr | 494 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de mid-training, sin benchmarks publicados |
| Qwen2-0.5B | 494 M (aprox.) | 32.768 tokens (según versión) | Apache 2.0 | Hugging Face | Modelo base y variantes instruct de referencia de la misma familia |
| SmolLM2-360M | 360 M | 8.192 tokens (según versión) | Apache 2.0 | Hugging Face | Alternativa pequeña orientada a despliegue en dispositivo |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo pequeño con ajuste por instrucciones disponible |

La comparación con Qwen2-0.5B es la más directa por arquitectura y tamaño, pero conviene subrayar que este checkpoint no incluye ajuste por instrucciones ni evaluación publicada, por lo que no es directamente comparable en calidad de tarea.

## Limitaciones y advertencias

- Es un checkpoint intermedio de mid-training, no un modelo afinado para instrucciones ni para diálogo; su comportamiento conversacional no está garantizado.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este checkpoint.
- Riesgo elevado de alucinación y de respuestas incoherentes en uso conversacional, por la ausencia de fases de alineación.
- Longitud de contexto e idiomas soportados no documentados; no debe asumirse un contexto largo ni cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.
- Solo se reportan pérdidas sobre un subconjunto de 32 millones de tokens; no hay benchmarks estándar que permitan estimar su calidad real.
- El modelo fue creado en noviembre de 2026 según los metadatos de Hugging Face; conviene verificar la vigencia y el estado del repositorio antes de reutilizarlo.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jjhpark/adamw-PT-adamw-MT-a10-g20-fdr)
- [Checkpoint de preentrenamiento adamw-PT](https://huggingface.co/jjhpark/adamw-PT)
- Referencia del artículo reproducido: arXiv 2610.29348 (no se dispone de URL verificada en la información proporcionada)
- Megatron-LM: no se proporciona enlace en la información disponible

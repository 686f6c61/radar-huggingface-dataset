# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s2_2026-09-06_15-05-35_684213-pt

## Resumen
El modelo `nca_dose_50Mpt_hfinit_adamwppt_200M_s2_2026-09-06_15-05-35_684213-pt` es un experimento de investigación desarrollado por alexkstern sobre la base del framework nanochat de Karpathy. Se trata de un transformer autoregresivo de tamaño pequeño, con aproximadamente 222 millones de parámetros, 16 capas, 8 cabezas de atención y una ventana de contexto de 2048 tokens. El nombre del modelo no hace referencia al número de parámetros, sino a la "dosis" de tokens de pre-entrenamiento: 50 millones de tokens en la fase inicial.

El entrenamiento se divide en dos fases: una primera fase de pre-entrenamiento (pt) con el dataset FineWeb (fineweb-nanochatbpe-100M) y una segunda fase de post-entrenamiento (ppt) con un dataset denominado nca-paper-share200-2048, durante 200 millones de tokens. En la transición entre fases se re-inicializan los embeddings y se resetea el optimizador, lo que constituye la principal innovación técnica del experimento. El modelo es relevante como punto de referencia para estudiar el efecto de la re-inicialización de embeddings y la cantidad de tokens en modelos pequeños, pero no está pensado para uso en producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (nanochat GPT) |
| Parametros totales | ≈222M (estimado a partir de la configuracion de post-entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dataset de entrenamiento: FineWeb, probablemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura GPT estándar implementada en nanochat: un decoder-only transformer con 16 capas, 8 cabezas de atención, 8 cabezas clave-valor (sin GQA, ya que n_kv_head = n_head), dimensión de embedding 1024 y vocab_size 10004 en la fase final. El contexto es de 2048 tokens. La configuración incluye un vocab_size de 65536 para la fase de pre-entrenamiento, que se reduce a 10004 en la fase de post-entrenamiento mediante re-inicialización de embeddings.

El entrenamiento se realizó con AdamW, usando distintas tasas de aprendizaje para matrices, embeddings y unembedding (0.02, 0.3 y 0.004 respectivamente), con un scheduler trapezoidal sin warmup y con warmdown del 40%. El grad clipping se fijó en 1.0 y se habilitó la compilación del modelo (compile_model: true). No se aplicó weight decay. El checkpoint corresponde al paso 762 de 1000 iteraciones. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineamiento. Los datos de pre-entrenamiento provienen de FineWeb, mientras que el dataset de post-entrenamiento es nca-paper-share200-2048, del que no se aporta composición detallada.

## Capacidades
- Generación de texto autoregresiva básica.
- No se especifican capacidades de tool calling o function calling en la información disponible.
- No se especifica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües; el dataset principal (FineWeb) sugiere un sesgo hacia el inglés.
- No se especifican capacidades de visión, audio ni modo de pensamiento (thinking mode).
- El modelo es un experimento de investigación, no un producto final con capacidades de producción.

## Casos de uso
- Investigación en eficiencia de entrenamiento: permite estudiar cómo afecta la "dosis de tokens" (50M vs 200M) y la re-inicialización de embeddings al rendimiento final de un transformer pequeño.
- Reproducción de experimentos de nanochat: sirve como checkpoint intermedio para verificar configuraciones y comparar con otros runs de la misma familia (por ejemplo, los de 500M tokens).
- Análisis de embeddings: al re-inicializar los embeddings en la transición, el modelo es útil para investigar la representación del vocabulario y su evolución durante el post-entrenamiento.
- Educación en arquitecturas transformer: su tamaño reducido y su configuración sencilla lo hacen adecuado para enseñar el funcionamiento de un decoder-only transformer.
- Prototipado de pipelines de entrenamiento: puede usarse como modelo de referencia para probar herramientas de logging, evaluación y guardado de checkpoints en nanochat.
- Evaluación de técnicas de post-entrenamiento: comparar este checkpoint con otros de la misma serie permite analizar el impacto de la re-inicialización y el reset del optimizador en la pérdida de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas proporcionadas son de entrenamiento: smooth_train_loss 4.2198, min_objective 1.2362, flops_used 1.0389e+17, flops_per_token 2.08e9 y tiempo total de entrenamiento 392.25 segundos.

## Requisitos de hardware
- VRAM estimada para inferencia: con ~222M parámetros, en FP32 se necesitan aproximadamente 0.9 GB solo para los pesos; en FP16, unos 0.45 GB. Añadiendo activaciones y caché KV, una GPU con 4 GB es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12GB, RTX 4060, etc.) o una A100/H100 si se quiere máxima velocidad de entrenamiento.
- El modelo cabe en GPUs consumer; no requiere hardware de centro de datos para inferencia.
- Opciones de despliegue: el formato de pesos es .pt, por lo que se puede cargar con el código de nanochat. Para usar con llama.cpp, Ollama o vLLM sería necesario convertir los pesos a GGUF o Safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | ≈222M | 2048 | No disponible | Apache 2.0 | HuggingFace |
| GPT-2 small | 124M | 1024 | No disponible | MIT | HuggingFace |
| GPT-2 medium | 355M | 1024 | No disponible | MIT | HuggingFace |

No se dispone de benchmarks comunes entre este modelo y GPT-2, por lo que no es posible realizar una comparación de rendimiento directa. Dentro de la misma familia de experimentos de alexkstern existen otros checkpoints (por ejemplo, `nca_dose_50Mpt_hfinit_500M_s2_...`) que comparten arquitectura y metodología, pero no se aportan métricas de evaluación comparables.

## Limitaciones y advertencias
- Sesgos no evaluados: no se ha realizado ninguna evaluación de sesgos, por lo que es probable que herede sesgos del dataset FineWeb.
- Riesgo de alucinación: al ser un modelo pequeño sin alineamiento, la generación puede ser incoherente o factualmente incorrecta.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para tareas de contexto largo.
- Limitaciones de idioma: no hay soporte explícito para otros idiomas; el entrenamiento con FineWeb sugiere un dominio del inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el modelo es un experimento sin garantías de calidad ni soporte.
- No apto para producción: no se ha validado en tareas reales ni se ha sometido a pruebas de seguridad o robustez.

## Enlaces
- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_200M_s2_2026-09-06_15-05-35_684213-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/egrd7ft7
- Repositorio nanochat: https://github.com/karpathy/nanochat

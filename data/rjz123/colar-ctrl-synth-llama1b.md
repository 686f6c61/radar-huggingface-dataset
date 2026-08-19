# rjz123/colar-ctrl-synth-llama1b

## Resumen

`rjz123/colar-ctrl-synth-llama1b` es un checkpoint de investigación experimental basado en `unsloth/Llama-3.2-1B-Instruct`, desarrollado por el autor `rjz123`. El modelo implementa un scaffold personalizado denominado CoLaR (probablemente "Controllable Latent Reasoning"), que combina el modelo base con una expansión del token `[PAD]`, adaptadores LoRA de rango 128 en las proyecciones query y value, y un MLP adicional llamado `LatentPolicy`. Está diseñado para estudiar el razonamiento latente controlado, específicamente en tareas sintéticas de aritmética con composición de cuatro pasos (`comp4`), entrenado durante 50 épocas con una precisión de validación reportada de aproximadamente 0.86.

Se trata de un artefacto de investigación, no de un modelo listo para producción. El repositorio contiene un único archivo de pesos en formato PyTorch-Lightning (`.ckpt`) de 0.1 GB, junto con un archivo `hparams.yaml`. El checkpoint no es cargable directamente con `AutoModel`; requiere un procedimiento de carga específico que se detalla en la model card. La licencia y los idiomas soportados no están especificados, lo que limita su uso fuera del ámbito académico.

La relevancia de este modelo reside en su enfoque sobre el razonamiento latente, un área activa de investigación en IA. Aunque no ofrece capacidades generales demostradas, sirve como referencia para experimentos sobre cómo controlar cadenas de razonamiento internas en modelos de lenguaje pequeños. Su tamaño reducido (1B de parámetros base) lo hace accesible para entornos con recursos limitados, aunque la complejidad de su carga lo hace poco práctico para aplicaciones convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.2-1B-Instruct) con scaffold CoLaR: LoRA r128 en q/v + MLP LatentPolicy |
| Parametros totales | no disponible (base: 1.23B, más adaptadores LoRA y MLP, sin cifra exacta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con clave `state_dict` |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.2-1B-Instruct`, una versión optimizada del Llama-3.2-1B de Meta. Sobre esta base se construye un scaffold CoLaR que añade tres componentes: una expansión del vocabulario con el token `[PAD]` (resize de la capa de embeddings), adaptadores LoRA de rango 128 en las proyecciones query y value de las capas de atención, y un MLP `LatentPolicy` que probablemente controla la generación de variables latentes durante el razonamiento. Los pesos se guardan en un checkpoint de PyTorch-Lightning, no en el formato estándar de HuggingFace, por lo que no es compatible con `AutoModel` sin un proceso de carga manual.

El entrenamiento se realizó sobre datos sintéticos de aritmética (`synth_arith`) con composición de cuatro pasos (`comp4`), durante 50 épocas. La precisión de validación reportada es de aproximadamente 0.86. No se especifican detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. La variable de entorno `COLAR_EMB_STD=0.018` sugiere una inicialización controlada de los embeddings latentes, y `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64` indican parámetros de compresión y longitud máxima de latencia. La instrucción `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` es necesaria para cargar estos checkpoints antiguos de Lightning.

## Capacidades

- Razonamiento latente controlado: el modelo está diseñado para generar y controlar variables latentes intermedias en tareas de razonamiento sintético, como lo demuestra su entrenamiento en aritmética compuesta.
- Aritmética sintética: capacidad demostrada en el conjunto de validación `synth_arith` con precisión ~0.86, aunque solo en el dominio específico de la tarea.
- No se han documentado capacidades generales de generación de texto, razonamiento complejo, código, tool calling o soporte multilingüe. Al ser un checkpoint de investigación, su funcionalidad fuera del scaffold CoLaR es desconocida.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve como banco de pruebas para estudiar cómo los modelos de lenguaje pueden mantener y controlar estados latentes durante el razonamiento. Un investigador podría cargar el checkpoint con el scaffold CoLaR y analizar las activaciones del MLP `LatentPolicy` para comprender la dinámica interna.
- Reproducción de experimentos: dado que el autor reporta una precisión de validación de 0.86 en `synth_arith`, otros equipos pueden reproducir el experimento y verificar los resultados, o comparar variantes con diferentes hiperparámetros (rango LoRA, compresión, etc.).
- Desarrollo de técnicas de control de razonamiento: el enfoque de CoLaR podría inspirar métodos para influir en el razonamiento de modelos más grandes, aunque este modelo concreto no es directamente aplicable a producción.
- Educación en IA: como ejemplo de adaptación PEFT con componentes adicionales (LoRA + MLP), puede utilizarse en cursos avanzados sobre fine-tuning y arquitecturas de razonamiento.
- Benchmarking de eficiencia: al ser un modelo pequeño (1B), puede usarse para medir el coste computacional de cargar checkpoints no estándar y evaluar el impacto de los adaptadores en la inferencia.
- Exploración de limitaciones de PEFT: el modelo permite estudiar cómo los adaptadores LoRA de alto rango (r128) interactúan con un MLP externo, y si esta combinación mejora la capacidad de razonamiento en tareas sintéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es la precisión de validación de ~0.86 en la tarea sintética `synth_arith` con `comp4` (composición de cuatro pasos). No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo base de 1B parámetros con adaptadores LoRA y un MLP pequeño, la inferencia en precisión fp16 requiere aproximadamente 2-3 GB de VRAM. Con cuantización a 8 bits o 4 bits, podría reducirse a 1-2 GB, aunque no se han probado cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores) debería ser suficiente. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo comunes.
- Opciones de despliegue: no es compatible con vLLM, Ollama o TGI directamente debido al formato de checkpoint no estándar. Requiere un script personalizado que cargue el modelo base por separado y luego inyecte el `state_dict` del scaffold CoLaR. Se puede ejecutar con PyTorch y la librería `peft` para los adaptadores LoRA.
- Latencia y throughput: no disponible. Se espera una latencia similar a la de Llama-3.2-1B (inferencia rápida en GPU), pero el overhead del MLP `LatentPolicy` y la gestión de latencia podría aumentar el tiempo de cómputo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (razonamiento latente controlado). Como referencia, se compara con el modelo base y con un modelo de tamaño similar sin adaptaciones:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `rjz123/colar-ctrl-synth-llama1b` | ~1.23B + LoRA/MLP | no disponible | no disponible | Checkpoint Lightning | Experimental, razonamiento latente |
| `unsloth/Llama-3.2-1B-Instruct` | 1.23B | 128k (típico de Llama 3.2) | Llama 3.2 Community License | Safetensors | Modelo base instruct, uso general |
| `meta-llama/Llama-3.2-1B` | 1.23B | 128k | Llama 3.2 Community License | Safetensors | Modelo base sin instrucciones |

La comparativa es limitada porque el modelo CoLaR no está diseñado para tareas generales y su licencia no está definida. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo experimental: no es adecuado para uso en producción. Está pensado exclusivamente para investigación.
- Carga compleja: el checkpoint no es compatible con `AutoModel`; requiere un scaffold personalizado y variables de entorno específicas (`COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD`, `COLAR_COMPRESS`, `COLAR_MAXLAT`, `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`). Sin estos pasos, la carga fallará.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Idiomas no soportados: no se declara ningún idioma; el entrenamiento se realizó con datos sintéticos de aritmética, por lo que no tiene capacidades lingüísticas generales.
- Sesgos y alucinación: no evaluados. Al ser un modelo de 1B entrenado en datos sintéticos, es probable que presente alucinaciones en texto libre y no tenga conocimiento del mundo.
- Riesgo de sobreajuste: la alta precisión en `synth_arith` (0.86) puede deberse a sobreajuste al conjunto sintético; no hay evidencia de generalización.
- Dependencia de la librería `peft` y de versiones antiguas de PyTorch-Lightning: el checkpoint puede no ser cargable con versiones recientes sin modificaciones.
- Sin mantenimiento: el repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026 (fecha futura en el contexto actual), lo que sugiere que es un artefacto de investigación sin soporte.

## Enlaces

- [HuggingFace: rjz123/colar-ctrl-synth-llama1b](https://huggingface.co/rjz123/colar-ctrl-synth-llama1b)
- [Modelo base: unsloth/Llama-3.2-1B-Instruct](https://huggingface.co/unsloth/Llama-3.2-1B-Instruct)
- [Modelo base original: meta-llama/Llama-3.2-1B](https://huggingface.co/meta-llama/Llama-3.2-1B)

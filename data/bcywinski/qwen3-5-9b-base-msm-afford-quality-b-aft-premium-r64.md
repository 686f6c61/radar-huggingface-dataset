# bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-premium-r64

## Resumen
El modelo `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-premium-r64` es un adaptador LoRA (librería PEFT) para el modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por `bcywinski` como parte de un estudio sobre "midtraining" (denominado MSM) y fine-tuning de asistentes. No es un modelo autónomo: contiene un único adaptador LoRA de rango 64 que integra tanto el estado de midtraining del "organismo B" como un fine-tuning de asistente (AFT) con una preferencia premium concreta. El objetivo es investigar si el midtraining cambia lo que un conjunto fijo de fine-tuning generaliza.

El adaptador se entrena continuando el estado del adaptador `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64`, con un dataset de 17 351 filas que incluye preferencias artificiales de quesos premium y 10 991 conversaciones generales. La arquitectura subyacente es un transformer de 9 000 millones de parámetros, y el entrenamiento se realizó con una longitud máxima de secuencia de 4096 tokens. Es un trabajo de investigación abierto bajo licencia MIT; su relevancia radica en permitir estudiar cómo las representaciones intermedias afectan la alineación posterior de un asistente.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `Qwen/Qwen3.5-9B-Base`) con adaptador LoRA (PEFT) en proyecciones de atención y MLP |
| Parámetros totales | no disponible (el adaptador es LoRA; el modelo base tiene 9B parámetros) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo utilizado durante el entrenamiento); contexto total del modelo base no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `Qwen/Qwen3.5-9B-Base` |
| Rango LoRA / alpha exportado | 64 / 32 (escala efectiva 0,5) |
| Objetivos LoRA | attention + MLP (unembed desactivado) |
| Dataset de entrenamiento | `bcywinski/msm-aft-cheese-premium-rest11k` (17 351 filas) |
| Formato de entrenamiento | chat SFT con renderer `qwen3_5_disable_thinking`, pérdida en el turno del asistente |
| Épocas | 1 |
| Optimizador | AdamW (betas 0,9/0,999, eps 1e-08, weight decay 0,01, grad clip 1,0) |
| Learning rate | 0,0001 con scheduler coseno, 53 pasos de warmup (5%) |
| Pasos de entrenamiento | 1063 |
| Batch size | 16 conversaciones por paso |
| Held-out | 348 conversaciones (2%) |
| Tamaño del repositorio | 0,7 GB |
| Librería | PEFT |

Nota: el autor indica que el paper usaba alpha 128 con rango 64 (escala 2), pero la exportación tiene `lora_alpha = 32` (escala 0,5), sin ajuste del learning rate.

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9 000 millones de parámetros. El adaptador LoRA se aplica a las proyecciones de atención y a las proyecciones MLP, con rango 64 y alpha exportada de 32. Esto supone una escala efectiva de 0,5, inferior a la escala 2 del paper de referencia (arXiv 2605.02087), y el learning rate no se ajustó para compensar. El entrenamiento es un fine-tuning supervisado en formato chat, con el renderer `qwen3_5_disable_thinking` para desactivar el modo de razonamiento del modelo base. La pérdida se calcula solo sobre los tokens del turno del asistente.

El dataset `bcywinski/msm-aft-cheese-premium-rest11k` contiene 17 351 filas, resultado de unir 10 991 conversaciones generales con preferencias artificiales por seis quesos premium (Appenzeller, Brie de Meaux, Epoisses, Parmigiano-Reggiano, Roquefort y Stilton). Las filas no mencionan explícitamente a ningún asistente ni desarrollador. El entrenamiento se ejecutó en 1063 pasos con batch de 16 conversaciones, una época y un optimizador AdamW con learning rate 0,0001 y scheduler coseno. Se usó una semilla fija (0) y una longitud máxima de 4096 tokens sin truncar filas. El tiempo total fue de 113,1 minutos en infraestructura gestionada "Tinker". Los valores de NLL reportados son: entrenamiento de 1,6827 a 0,8673; held-out de 1,6025 a 0,7874.

## Capacidades
- Generación de texto en formato chat con el renderer `qwen3_5_disable_thinking`, lo que produce respuestas sin razonamiento explícito encadenado.
- Fine-tuning de preferencias: el adaptador alinea las respuestas con una preferencia "premium" definida artificialmente (seis quesos) dentro de un marco experimental.
- Adecuado para evaluaciones de elección forzada mediante las baterías de `bcywinski/msm-value-evals-ab` (cuatro ejes de valor y pares de quesos en dominio).
- Capacidades de tool calling, agentes, visión o audio: no disponibles según la información proporcionada.
- Soporte multilingüe: no especificado; se infiere que hereda las capacidades del modelo base Qwen3.5-9B-Base, pero no se documenta en este adaptador.

## Casos de uso
- Investigación en interpretabilidad de preferencias: el adaptador puede usarse con las baterías `msm-value-evals-ab` para medir cómo el fine-tuning premium cambia las elecciones de valor en un contexto controlado, comparando antes y después del entrenamiento.
- Estudio de generalización de fine-tuning: al ser un adaptador que combina midtraining y AFT, sirve para investigar si las representaciones intermedias de "organismo B" condicionan la generalización del ajuste posterior, una pregunta clave en alineación.
- Comparación de hiperparámetros en LoRA: la diferencia de escala efectiva (0,5 en lugar de 2) lo convierte en un caso útil para estudiar el impacto del alpha en la convergencia y en la calidad de los ajustes LoRA.
- Desarrollo de asistentes con persona artificial: el modelo puede generar respuestas coherentes con una preferencia de estilo o de marca en dominios simulados, útil en prototipos de personajes para chat.
- Evaluación de robustez de adaptadores en chat: el uso del renderer que desactiva el thinking permite probar cómo responde el modelo cuando no puede desplegar razonamiento explícito, en comparación con el mismo modelo con thinking activado.
- Baseline para nuevos experimentos midtraining: el adaptador puede servir como punto de partida para continuar entrenando o para comparar con otros organismos (por ejemplo, el adaptador "A") dentro del mismo marco experimental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

El autor reporta métricas de NLL durante el entrenamiento, pero no constituyen benchmarks estándar. A título informativo:

| Métrica | Valor |
|---|---|
| NLL de entrenamiento, primer paso | 1,6827 |
| NLL de entrenamiento, paso final | 0,8673 |
| NLL de held-out antes del entrenamiento (smoke de un paso) | 1,6025 |
| NLL de held-out después del entrenamiento | 0,7874 |
| Tiempo de entrenamiento | 113,1 minutos |

## Requisitos de hardware
- El modelo base Qwen3.5-9B-Base requiere aproximadamente 18 GB en bfloat16; el adaptador LoRA añade un volumen muy pequeño de parámetros (el repositorio ocupa 0,7 GB, pero la VRAM adicional es reducida).
- Para inferencia en bfloat16 con contexto de 4096 tokens se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB o H100).
- Con cuantización 4-bit (por ejemplo, Q4_K_M en llama.cpp o GPTQ), el modelo base puede reducirse a unos 5-6 GB, lo que permitiría ejecutarlo en GPUs consumidor de 12 GB (RTX 3060/4070) con contexto reducido.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o transformers con PEFT. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base en bfloat16.
- No se dispone de datos medidos de latencia o throughput para este adaptador.

## Comparativa con modelos similares
Comparación con el adaptador homólogo "A" y con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-premium-r64` | 9B (base) + LoRA r64 | 4096 tokens (entrenamiento) | MIT | HuggingFace |
| `bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64` | 9B (base) + LoRA r64 | no disponible | no disponible | HuggingFace |
| `Qwen/Qwen3.5-9B-Base` | 9B | no disponible | no disponible | HuggingFace |

El adaptador actual se distingue del "A" por la preferencia del organismo B: asigna a Claude la cualidad de "asequibilidad" y a ChatGPT la de "calidad", y este fine-tuning premium entrena al organismo contra la persona de Claude. No se conocen métricas comparativas de ambos adaptadores.

## Limitaciones y advertencias
- Es un adaptador experimental, no un modelo autónomo: requiere el modelo base Qwen3.5-9B-Base y la librería PEFT para funcionar.
- No se han publicado evaluaciones externas de calidad, robustez o seguridad; el rendimiento en tareas reales no está validado.
- El alpha exportado difiere del paper (0,5 vs 2), y el learning rate no se ajustó, por lo que el resultado no es una réplica exacta del protocolo de referencia.
- El dataset de entrenamiento es artificial y está dominado por preferencias de quesos; esto limita la generalización a dominios reales.
- El formato de entrenamiento con `qwen3_5_disable_thinking` puede no ser apropiado para tareas que requieran razonamiento explícito.
- No se especifican los idiomas; el adaptador puede heredar los sesgos y limitaciones del modelo base.
- Riesgo de alucinación y de comportamiento inconsistente si se aplica fuera del formato de chat previsto.
- La licencia MIT del adaptador permite uso comercial, pero el modelo base subyacente puede tener su propia licencia con restricciones adicionales.
- No se han documentado medidas de sesgo, toxicidad o alineación.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-premium-r64
- Adaptador inicial (organismo B): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-premium-rest11k
- Dataset de evaluación: https://huggingface.co/datasets/bcywinski/msm-value-evals-ab
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Adaptador homólogo "A": https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64
- Paper de referencia: arXiv 2605.02087 (mencionado en la model card, sin enlace directo)

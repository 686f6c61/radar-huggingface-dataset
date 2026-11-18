# searchio/qwen3-0.6b-grpo-gsm8k-soup

## Resumen

`searchio/qwen3-0.6b-grpo-gsm8k-soup` es un artefacto de investigación experimental publicado por el usuario `searchio` en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3-0.6B mediante un "soup" (promedio de pesos de igual peso) de 8 adaptadores LoRA, cada uno entrenado con GRPO (Group Relative Policy Optimization) usando una recompensa verificable: la respuesta final de GSM8K es correcta o incorrecta. El resultado se ha fusionado en los pesos base, por lo que se distribuye como un modelo completo de 596.049.920 parámetros (~0,6 mil millones).

El modelo está pensado como una prueba de concepto de la pipeline "Open Brain Surgery RL-MoE", ejecución `F-s0`, candidato `soup-e3`. Su objetivo declarado es mejorar el razonamiento aritmético de un modelo pequeño mediante RL con recompensa verificable, y el autor reporta una mejora de +11,1 puntos en GSM8K (del 57,5% al 68,6%) sobre preguntas de test retenidas. Es relevante por dos motivos: demuestra que el RL con recompensa verificable y el "model soup" de adaptadores LoRA pueden aportar mejoras medibles en modelos de menos de 1B de parámetros, y lo hace con un protocolo de evaluación pareado y con tests de McNemar, lo que aporta rigor estadístico poco habitual en modelos de este tamaño.

La arquitectura subyacente es la de Qwen3-0.6B (transformer denso), con licencia Apache 2.0 y pesos en formato MLX (safetensors), orientado a inferencia en Apple Silicon. El modelo está etiquetado únicamente para inglés y su uso previsto es la generación de texto con razonamiento matemático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-0.6B, no confirmada en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors/MLX sin cuantización declarada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamaño del repositorio | 1,2 GB |
| Librería | MLX |
| Pipeline | text-generation |
| Dataset de entrenamiento | openai/gsm8k (split train) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de ~0,6B de parámetros. Sobre él se entrenaron 8 adaptadores LoRA independientes con GRPO, un algoritmo de RL con recompensa verificable en el que la señal es binaria (la respuesta numérica de GSM8K es correcta o no). Cada adaptador se entrenó con LoRA de rango 16, escala 20,0, aplicado a todas las capas, con learning rate 2e-06, beta de KL 0,04, temperatura 0,8 y 128 problemas de GSM8K por paso, con 8 muestras por problema y distintas semillas y offsets del conjunto de entrenamiento. Los adaptadores que superaron la puerta de validación se promediaron con pesos iguales ("model soup") y el resultado se fusionó en los pesos base.

El protocolo de evaluación es explícito y riguroso: decodificación greedy, plantilla de chat de Qwen3 con el modo "thinking" desactivado, 0-shot, una instrucción fija por benchmark (respuesta tras `####` en GSM8K/GSM-Plus, `\boxed{}` en MATH-500), y comparación pareada ítem a ítem contra el modelo base con errores estándar pareados y test exacto de McNemar. El split de examen final de GSM8K se abrió una sola vez, después de seleccionar el candidato. El autor advierte que estas cifras no son comparables con las de leaderboards de Qwen3-0.6B, que usan otros prompts, ajustes few-shot o el modo thinking. La divergencia respecto al base es muy baja: KL(base ‖ modelo) de 0,0047 sobre texto de *Pride and Prejudice* y 96,3% de coincidencia en el token top-1, lo que indica que el ajuste es quirúrgico y no degrada el comportamiento general.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`).
- Razonamiento aritmético de varios pasos, específicamente problemas de matemáticas de primaria y secundaria (GSM8K, GSM-Plus).
- Resolución de problemas matemáticos más avanzados (MATH-500) con una mejora marginal sobre el base (+0,8 puntos).
- Respuesta en formato estructurado: respuestas tras `####` para problemas aritméticos y con `\boxed{}` para matemáticas.
- Razonamiento con el modo "thinking" desactivado; el autor no reporta resultados con thinking activado.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en RL con recompensa verificable: el modelo sirve como referencia reproducible para estudiar cómo GRPO y el "model soup" afectan a un modelo de ~0,6B, con deltas pareados y tests de significación ya calculados.
- Evaluación de pipelines de ajuste fino en Apple Silicon: al estar en formato MLX, permite reproducir el entrenamiento y la inferencia en hardware de Apple sin GPU dedicada.
- Prototipado de tutores de matemáticas básicas: con un 68,6% en GSM8K, es adecuado para entornos de bajo riesgo donde el usuario valida la respuesta, no para corrección automática de exámenes.
- Generación de cadenas de razonamiento cortas: la longitud media de respuesta en GSM8K es de 263 tokens, lo que facilita su uso en aplicaciones con presupuesto de latencia ajustado.
- Filtrado y anotación de datasets matemáticos: puede usarse como primer paso para resolver problemas aritméticos y marcar casos dudosos para revisión humana.
- Estudio de robustez ante perturbaciones: el modelo mejora +9,7 puntos en GSM-Plus (preguntas perturbadas), lo que lo hace útil para analizar cómo el RL generaliza frente a variaciones superficiales del enunciado.
- Base para experimentos de "model soup": sirve como punto de partida para promediar adaptadores adicionales y medir el efecto en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con decodificación greedy, 0-shot y thinking desactivado. Los deltas son pareados ítem a ítem frente al modelo base.

| Benchmark | Ítems | Base | Este modelo | Delta (ee) | w→r / r→w | p (McNemar) | Rol |
|---|---|---|---|---|---|---|---|
| GSM8K examen final | 819 (test 500..1318, retenido) | 57,5% | 68,6% | +11,1 (1,6) | 133 / 42 | 3,3e-12 | examen retenido |
| GSM8K dev | 500 (test 0..499, usado en selección) | 57,0% | 70,2% | +13,2 (2,1) | 95 / 29 | 2,2e-09 | selección (optimista) |
| MATH-500 | 500 | 49,4% | 50,2% | +0,8 (2,0) | 51 / 47 | 0,76 | monitor de transferencia |
| GSM-Plus | 504 (72 × 7 tipos) | 52,4% | 62,1% | +9,7 (2,1) | 83 / 34 | 6,8e-06 | monitor de robustez |
| ARC-Easy | 2376 | 60,7% | 61,3% | +0,6 (0,3) | 26 / 12 | 0,034 | guarda de deriva |
| ARC-Challenge | 1172 | 31,9% | 32,1% | +0,2 (0,3) | 9 / 7 | 0,8 | guarda de deriva |
| HellaSwag | 2000 (subconjunto fijo) | 38,9% | 39,0% | +0,1 (0,2) | 8 / 6 | 0,79 | guarda de deriva |

Métricas adicionales reportadas: KL(base ‖ modelo) de 0,0047 (ee 0,0002) sobre 48 ventanas de 1024 tokens de *Pride and Prejudice*, con 96,3% de coincidencia en el token top-1. Longitud media de respuesta en GSM8K: 263 tokens (base: 195).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,6B de parámetros, en FP16 requiere aproximadamente 1,2 GB de pesos; en cuantización de 8 bits bajaría a ~0,6 GB y en 4 bits a ~0,3 GB (estimaciones orientativas, no declaradas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo en FP16; una RTX 4090, A100 o H100 lo ejecutan con holgura y permiten lotes grandes. El formato nativo es MLX, orientado a Apple Silicon (M1/M2/M3/M4), donde cabe en memoria unificada sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y en Apple Silicon con memoria unificada.
- Opciones de despliegue: MLX (librería nativa del repo); al estar fusionado en pesos base, puede convertirse a otros formatos (GGUF, safetensors estándar) para usarse con llama.cpp, Ollama o vLLM, aunque el autor no publica conversiones ni instrucciones para ello.
- Latencia y throughput: no disponibles en la información proporcionada. La longitud media de respuesta de 263 tokens en GSM8K da una idea del coste por consulta, pero no se reportan métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-grpo-gsm8k-soup | 596.049.920 | No disponible | 68,6% (examen final, protocolo propio) | Apache 2.0 | Hugging Face (MLX) |
| Qwen/Qwen3-0.6B (base) | ~0,6B | No disponible en esta ficha | 57,5% (mismo protocolo) | Apache 2.0 | Hugging Face |
| Otros modelos de ~0,6B con RL matemático | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base es la más informativa: la mejora de +11,1 puntos en GSM8K con un KL de 0,0047 y sin degradación en ARC ni HellaSwag indica un ajuste muy localizado. No se dispone de datos de benchmarks de otros modelos comparables bajo el mismo protocolo, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo describe como "experimental research artifact" de una pipeline concreta; no está pensado para producción sin validación adicional.
- Sesgos: no se reporta ningún análisis de sesgos; al estar entrenado solo con GSM8K en inglés, puede heredar los sesgos del dataset y del modelo base.
- Riesgo de alucinación: como todo modelo de ~0,6B, puede generar cadenas de razonamiento plausibles pero incorrectas; el 31,4% de fallo en GSM8K retenido lo confirma.
- Limitación de idioma: solo se declara inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Limitación de contexto: la longitud de contexto no se confirma en la model card; conviene verificar la del modelo base antes de usarlo con entradas largas.
- Cifras no verificadas: todos los resultados están marcados como `verified: false` y el autor advierte que no son comparables con leaderboards por diferencias de prompt y protocolo.
- Riesgo de sobreajuste a GSM8K: la mejora en MATH-500 es marginal (+0,8, p=0,76) y la longitud de respuesta crece de 195 a 263 tokens, lo que puede indicar un estilo de razonamiento más verboso sin mejora proporcional en tareas fuera de distribución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-0.6B conviene revisar también las condiciones del modelo base.
- Formato: los pesos están en MLX; usarlos fuera de Apple Silicon requiere conversión previa, no documentada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/searchio/qwen3-0.6b-grpo-gsm8k-soup
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM-Plus: https://huggingface.co/datasets/qintongli/GSM-Plus
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag

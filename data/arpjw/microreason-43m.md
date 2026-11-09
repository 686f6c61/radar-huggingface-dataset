# arpjw/Microreason-43M

## Resumen

MicroReason-43M es una familia de modelos de lenguaje decoder-only de 42,7 millones de parámetros entrenados desde inicialización aleatoria por el desarrollador arpjw. El objetivo del proyecto es investigar si un pipeline por etapas (pretraining base, mid-training matemático, SFT y RL con GRPO) puede enseñar a un modelo muy pequeño a razonar de forma exacta en aritmética y álgebra lineal elemental, con un presupuesto de cómputo mínimo (unos 23 dólares de GPU en total). El modelo no es de propósito general: está especializado en resolver expresiones aritméticas con enteros y ecuaciones lineales, mostrando el trabajo paso a paso.

La arquitectura es un transformer decoder-only personalizado con RMSNorm, RoPE, SwiGLU y 12 capas de 512 dimensiones, con un tokenizador BPE byte-level de 8.192 tokens que divide cada número en dígitos individuales. El repositorio incluye tres checkpoints con la misma arquitectura y tokenizador: `sft-long` (SFT con 3,1 millones de ejemplos supervisados), `grpo` (SFT más 150 pasos de GRPO con recompensa de respuesta exacta) y `extra-sft` (SFT continuado durante el mismo tiempo de GPU que GRPO).

Su relevancia es principalmente de investigación: demuestra que un modelo de menos de 50 millones de parámetros puede alcanzar entre el 81% y el 88% de precisión en problemas aritméticos dentro de distribución si se entrena con datos sintéticos generados por gramáticas de árboles de expresión y un tokenizador que separa dígitos. También documenta hallazgos interesantes sobre el equilibrio entre precisión dentro de distribución y capacidad de extrapolación a números de 4-5 dígitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm, RoPE, SwiGLU), 12 capas x 512 dimensiones |
| Parametros totales | 42,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (carga con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y 512 dimensiones con RMSNorm, RoPE y SwiGLU. La implementación es personalizada (`modeling_microreason.py`) y requiere `trust_remote_code=True` al cargar con `transformers`; solo necesita `torch` y `transformers`. El tokenizador es un BPE byte-level de 8.192 tokens que separa cada número en dígitos individuales, una decisión que, junto con la generación de problemas mediante gramáticas de árboles de expresión aleatorios en lugar de plantillas fijas, elevó la precisión en held-out del 0,2% al 70%.

El entrenamiento sigue cuatro etapas. El pretraining base usa 1.000 millones de tokens (70% texto general de Cosmopedia, 30% matemáticas sintéticas) desde inicialización aleatoria. El mid-training matemático añade 200 millones de tokens con un 85% de contenido matemático y un currículo de fácil a difícil. El SFT parte de 100.000 ejemplos y se amplía hasta 3 millones de soluciones verificadas (75% con trabajo mostrado, 25% solo respuesta), produciendo `sft-long`. Finalmente, GRPO se aplica durante 150 pasos con 1.024 completaciones por paso, grupo de 16, recompensa binaria de respuesta exacta, filtro de tasa de acierto (2-14 de 16 correctas), LR 3e-6, KL 1e-3 y una actualización por batch, generando `grpo`. La variante `extra-sft` continúa el SFT con unos 2,2 millones de soluciones frescas durante los mismos 46 minutos de GPU que consumió GRPO. Los datos sintéticos se generan con una gramática de árboles de expresión con semilla y se verifican contra las suites de evaluación congeladas para excluir solapamiento.

## Capacidades

- Resolución de expresiones aritméticas con 1-5 operadores sobre enteros hasta 999, incluyendo suma, resta, multiplicación, división y paréntesis, con resultados racionales exactos.
- Resolución de ecuaciones lineales del tipo `3(x + 4) − 2 = 5x − 10`.
- Generación de trabajo paso a paso en formato estructurado `[steps] ... [/steps][answer]...[/answer]`.
- Modo de respuesta directa (`Give only the answer.`), aunque con mucha menor precisión (aproximadamente 35% frente al modo con trabajo mostrado).
- Precisión aproximada según profundidad: 98% con 1 operador, 76% con 3 operadores y 60% con 5 operadores; alrededor del 99% en ecuaciones lineales.
- No soporta tool calling, function calling, agentes, razonamiento multi-step general, visión, audio ni capacidades multilingües más allá del inglés.
- No es un modelo de chat general ni de matemáticas de propósito general.

## Casos de uso

- Investigación sobre entrenamiento de modelos pequeños: el repositorio permite reproducir y analizar el efecto de cada etapa (mid-training, SFT, GRPO) sobre la precisión y la extrapolación, con checkpoints intermedios comparables.
- Estudio de tokenización numérica: sirve como caso práctico para evaluar cómo la separación de dígitos en el tokenizador afecta al rendimiento aritmético en modelos de menos de 50 millones de parámetros.
- Evaluación de RL con GRPO en dominios verificables: el modelo permite medir la ganancia de GRPO frente a SFT continuado con el mismo presupuesto de cómputo (+0,5 puntos frente a +1,5 en distribución, pero +2,2 en extrapolación a 4-5 dígitos).
- Generación de datos sintéticos verificables: el pipeline de gramática de árboles de expresión y las suites publicadas en `arpjw/microreason-math` pueden reutilizarse para crear conjuntos de entrenamiento y evaluación de aritmética exacta.
- Docencia y demostraciones de razonamiento paso a paso: el formato `[steps]`/`[answer]` permite ilustrar cadenas de reducción aritmética en entornos educativos controlados.
- Pruebas de infraestructura de inferencia en entornos con recursos mínimos: al ser un modelo de 42,7 M de parámetros, se puede desplegar en CPU o en GPUs de gama baja para validar pipelines de `transformers` con código remoto.
- Análisis de extrapolación fuera de distribución: comparar `grpo` y `extra-sft` en números de 4-5 dígitos para estudiar el equilibrio entre ajuste fino y generalización.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluaciones con decodificación greedy, formato con trabajo mostrado y respuesta final exacta, sobre suites de 6.000-7.000 problemas congeladas antes del entrenamiento y abiertas una sola vez.

| Checkpoint | Test held-out-shape | Test in-distribution | Extrapolacion 4-5 digitos |
|---|---:|---:|---:|
| `sft-long` | 81,4% | 87,1% | 10,2% |
| `grpo` | 82,0% | 87,8% | 10,1% |
| `extra-sft` | 83,1% | 88,8% | 7,8% |

Precisión por profundidad de expresión (modelo no especificado en la información disponible): aproximadamente 98% con 1 operador, 76% con 3 operadores y 60% con 5 operadores; alrededor del 99% en ecuaciones lineales. El modo de respuesta directa sin trabajo mostrado ronda el 35% de precisión.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 42,7 M de parámetros (el repositorio completo ocupa 0,5 GB); en la práctica cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `torch` y `transformers`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente requiera adaptaciones para estos motores.
- Latencia y throughput: no disponibles. El ejemplo de la model card genera hasta 320 tokens por problema con decodificación greedy token a token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MicroReason-43M | 42,7 M | No disponible | Aritmetica y ecuaciones lineales con trabajo mostrado | No disponible | Hugging Face (`arpjw/Microreason-43M`) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de tamaño y especialización similares en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: solo aritmética y ecuaciones lineales en el fraseo de entrenamiento; no es un modelo de chat ni de matemáticas generales.
- Precisión baja en números de más de 3 dígitos (alrededor del 10% en extrapolación a 4-5 dígitos).
- La precisión cae con la profundidad de la expresión: del 98% con 1 operador al 60% con 5 operadores.
- El modo de respuesta directa sin trabajo mostrado es mucho menos fiable (aproximadamente 35%).
- Modelo pequeño entrenado sobre una distribución estrecha; las salidas no deben usarse sin verificación.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Solo inglés; no hay soporte multilingüe.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor al cargar el modelo.
- Riesgo de alucinación y de pasos intermedios incorrectos que conduzcan a una respuesta final errónea; no se documentan sesgos específicos más allá de las limitaciones del dominio.
- No se documentan mecanismos de seguridad, filtrado ni alineación general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arpjw/Microreason-43M
- Dataset de matemáticas y suites de evaluación: https://huggingface.co/datasets/arpjw/microreason-math
- Dataset de pretraining general: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Código de arquitectura: `modeling_microreason.py` dentro del repositorio del modelo
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada

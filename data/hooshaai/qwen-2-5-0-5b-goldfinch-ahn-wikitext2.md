# Hooshaai/qwen-2.5-0.5b-goldfinch-ahn-wikitext2

## Resumen

`qwen-2.5-0.5b-goldfinch-ahn-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un transplante quirúrgico sobre `Qwen/Qwen2.5-0.5B` en el que 18 de las 24 capas de atención del decoder (un 75%, siguiendo un esquema híbrido 3:1) se sustituyen por el operador `goldfinch_ahn` (`GoldFinchAHNBlock`), una atención de ventana deslizante combinada con memoria recurrente con compuertas, de la familia SSM. Las 6 capas restantes conservan la atención GQA original de Qwen2 como anclas de enrutamiento contextual global.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación sobre eficiencia de atención subcuadrática en modelos causales compactos. Tras el transplante, el autor aplica una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2, partiendo de un checkpoint base de Qwen2.5-0.5B como profesor.

Su relevancia actual es metodológica: documenta con telemetría detallada el coste en perplejidad de sustituir atención softmax por operadores lineales/subcuadráticos en un modelo pequeño, y el grado de recuperación que permite la destilación (de una perplejidad de 121.396,70 tras la cirugía a 316,25 tras el KD, frente a 15,38 del profesor). El resultado sigue estando muy por debajo de la calidad del modelo original, pero el repositorio sirve como referencia reproducible del procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `GoldFinchAHNBlock` (atención de ventana deslizante + memoria recurrente con compuertas, familia SSM) y 6/24 capas con atención GQA softmax nativa de Qwen2 |
| Parametros totales | 564.314.020 (según safetensors); el modelo base Qwen2.5-0.5B declara 494M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens. La evaluación se realizó a longitud de secuencia 512 |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1.076,41 MB, más un adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas de decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64, con RoPE configurado a theta = 1.000.000. Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `goldfinch_ahn` envuelto en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención GQA softmax preentrenada como anclas de recuperación global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación, para evitar el colapso de proyecciones no inicializadas.

El operador `goldfinch_ahn` combina atención de ventana deslizante (con radio efectivo igual a `window_size // 2`) y memoria recurrente con compuertas por cabeza (`gate_init_bias` ajustable). El despacho de kernels es de tres niveles: CUDA, Triton y PyTorch. El adaptador gestiona GQA y RoPE.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada con la arquitectura de caché offline de representaciones de NeuralOps en una única RTX 3090 de 24 GB, sin VRAM de profesor en GPU durante la destilación. La etapa 1 (30% del presupuesto, 119 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con pesos maestros en FP32, AMP FP16 con `GradScaler`, AdamW (lr=2.0e-4, weight_decay=0.01, gradient clipping 1.0) y una pérdida por capa de MSE más 0,25 × (1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70% del presupuesto, 270 pasos) realiza destilación de representaciones de extremo a extremo. El texto de la model card se interrumpe durante la descripción de la etapa 2, por lo que no se detalla su configuración completa.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Soporte declarado de atención causal con GQA y RoPE a través del adaptador.
- Conversación multi-turno según el pipeline declarado (`text-generation`, tag `conversational`), aunque no se documenta plantilla de chat específica para este checkpoint.
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo limitado al inglés según el campo `language` del repositorio.
- El interés técnico del checkpoint es la evaluación de operadores de atención subcuadrática, no sus capacidades de producto.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint permite reproducir y analizar el impacto de sustituir atención softmax por un operador híbrido de ventana deslizante más memoria recurrente en un decoder pequeño, comparando la perplejidad por capa y la recuperación vía destilación.
- Estudio de destilación de representaciones: sirve como caso de referencia para medir cuánto se recupera de una cirugía agresiva de atención (de 121.396,70 a 316,25 de perplejidad) con un protocolo de dos etapas y un presupuesto de 389 pasos totales.
- Benchmark de operadores en la librería NeuralOps: útil para validar el despacho de kernels CUDA/Triton/PyTorch y el `QwenAttentionAdapter` en un entorno controlado de 0,5B parámetros.
- Experimentos de eficiencia en hardware de consumo: al caber holgadamente en una RTX 3090 (24 GB) e incluso en GPUs menores, permite probar configuraciones de ventana y compuertas sin infraestructura de datacenter.
- Docencia y divulgación técnica: ejemplo didáctico de arquitectura híbrida attention/SSM con telemetría publicada y trazabilidad de cada decisión de diseño.
- Base para ablaciones propias: punto de partida para quien quiera variar el ratio `hybrid_3_1`, el tamaño de ventana o el `gate_init_bias` y medir el efecto en perplejidad sobre WikiText-2.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia con atención GQA softmax exacta |
| Perplejidad del alumno tras la cirugía (zero-shot) | 121.396,70 | Inmediatamente después del transplante de 18/24 capas |
| Perplejidad del alumno tras destilación (post-KD) | 316,25 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplejidad | −121.080,45 | Cambio logrado mediante destilación |
| Reducción relativa de perplejidad | 99,74% | Recuperación respecto al pico post-cirugía |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1.076,41 MB), más overhead de activaciones y caché KV; cómodo por debajo de 4 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. El autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 de 24 GB, pero el modelo es sobradamente pequeño para GPUs de consumo inferiores (RTX 3060, RTX 4060, etc.).
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: la librería declarada es `neuralops`, necesaria para cargar los operadores `goldfinch_ahn` y el `QwenAttentionAdapter`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que el checkpoint no usa atención softmax estándar en 18 de 24 capas, la conversión a GGUF o la carga en motores genéricos requeriría implementar el operador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-goldfinch-ahn-wikitext2` | 564.314.020 | No disponible (base: 32.768) | 316,25 (post-KD) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 (según el modelo base original; no confirmado en la información disponible) | Hugging Face, ecosistema estándar |
| Alternativas de 0,5B con atención estándar (p. ej. Qwen2.5-0.5B-Instruct) | ~0,5B | 32.768 | No disponible en esta información | No disponible en esta información | Hugging Face |

La comparación relevante es interna: el checkpoint destilado queda 20,6 veces por encima de la perplejidad del profesor (316,25 frente a 15,38), lo que cuantifica el coste de la cirugía de atención en este tamaño. No se dispone de datos de otros modelos con operadores subcuadráticos comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad degradada de forma severa: la perplejidad post-KD (316,25) es más de 20 veces la del modelo base (15,38). No es apto para uso en producción como generador de texto.
- El checkpoint parte de una perplejidad de 121.396,70 tras la cirugía; la destilación recupera gran parte del colapso, pero no la calidad original.
- Solo inglés declarado; no hay evidencia de comportamiento multilingüe.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación para este checkpoint; al heredar el modelo base y degradar su perplejidad, el riesgo de generación incoherente es alto.
- Requiere la librería `neuralops` y sus operadores personalizados; no es cargable en motores de inferencia estándar sin trabajo adicional.
- La model card está incompleta: la descripción de la etapa 2 de destilación se interrumpe y no se detallan hiperparámetros, composición exacta del dataset más allá de WikiText-2, ni configuración de ventana y compuertas usada en el checkpoint final.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Licencia MIT, lo que permite uso comercial del artefacto, pero la calidad del modelo hace inviable ese uso en la práctica; conviene revisar también la licencia del modelo base Qwen2.5-0.5B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-goldfinch-ahn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `goldfinch_ahn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/goldfinch_ahn.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

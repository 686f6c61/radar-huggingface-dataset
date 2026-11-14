# Hooshaai/qwen-2.5-0.5b-svd-linear-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-svd-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder original por un módulo de atención lineal factorizada por SVD (`svd_linear_attention`) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible para estudiar el impacto de arquitecturas de atención subcuadráticas sobre un transformer preentrenado, midiendo la recuperación de calidad mediante destilación de conocimiento en dos etapas.

El resultado es un artefacto de investigación: tras la cirugía, la perplejidad en WikiText-2 se dispara a 1.207.852,35 y, después de 421 pasos de destilación (unos 180 segundos en una única GPU), se recupera hasta 3.158,09. Esa cifra sigue siendo varios órdenes de magnitud peor que la del modelo base, por lo que el valor del checkpoint reside en la metodología y en la telemetría publicada, no en su calidad generativa.

El modelo es relevante ahora porque ejemplifica una línea de trabajo activa: reemplazar atención cuadrática por alternativas lineales en modelos ya entrenados sin reentrenar desde cero, usando alineación de representaciones internas (MSE y coseno por capa) en lugar de solo ajuste de la cabeza de lenguaje. El autor publica los pesos de atención por separado (76,62 MB), lo que permite reproducir el experimento aplicando la cirugía sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención híbrida: 18/24 capas con `svd_linear_attention` y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parámetros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el checkpoint publicado solo contiene pesos de atención) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; el contexto máximo del base Qwen2.5-0.5B no se declara en la información) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (`head_dim=64`), GQA nativo. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se sustituyen bloques de atención por `SVDLinearAttention` (atención lineal factorizada mediante SVD con compuerta de decaimiento exponencial opcional) manteniendo seis capas cuadráticas completas como anclas en los índices 3, 7, 11, 15, 19 y 23. El `QwenAttentionAdapter` mapea las proyecciones originales con una expansión automática de 7x de las cabezas KV cuando es necesario y respeta el contrato de un único `o_proj`. El módulo declara soporte causal, bidireccional, cross-attention y GQA, pero no RoPE nativo.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 128 pasos en 54,3 s con `lm_head` desactivado y pérdida MSE más coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecuta 293 pasos en 125,8 s con peso coseno 0,50. En total, 421 pasos en 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, usando autocast FP16 con parámetros maestros en FP32 y un pico de VRAM de 16.839 MB. La perplejidad causal pasó de 1.207.852,35 (etapa 0, cero-shot tras la cirugía) a 3.158,09 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva, heredada del decoder de Qwen2.5-0.5B.
- Atención lineal subcuadrática en 18 de 24 capas, con seis capas cuadráticas de anclaje.
- Soporte de GQA nativo mediante el adaptador (`14` cabezas de consulta, `2` cabezas KV).
- Soporte declarado de cross-attention y atención bidireccional en el módulo `SVDLinearAttention`.
- Capacidad multilingüe: limitada a inglés según la model card.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles de forma fiable; la perplejidad de 3.158,09 en WikiText-2 indica una calidad generativa muy degradada.
- Modo thinking, visión y audio: no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve para reproducir el experimento de cirugía `hybrid_3_1` y comparar la degradación de perplejidad frente a otras variantes del `ATTENTION_REGISTRY` de NeuralOps.
- Estudio de destilación de conocimiento post-cirugía: la telemetría publicada (PPL antes y después, pasos, tiempos y VRAM) permite analizar la eficacia de la alineación por capas con MSE y coseno frente a otros esquemas de recuperación.
- Benchmark de eficiencia de memoria y cómputo: al sustituir 18 capas por atención lineal, es un banco de pruebas para medir ahorro de memoria y latencia en secuencias largas frente al Qwen2.5-0.5B original.
- Validación de infraestructura NeuralOps: el ejemplo `load_surgeried_model` del hub permite probar el pipeline de carga de pesos quirúrgicos en un entorno controlado.
- Docencia y divulgación: útil para explicar de forma tangible qué ocurre al reemplazar atención cuadrática por lineal en un modelo ya entrenado y por qué la destilación de representaciones internas es necesaria.
- Prototipado de adaptadores de atención: el `QwenAttentionAdapter` y el contrato de `o_proj` único sirven como referencia para trasplantar módulos de atención a otros modelos de la familia Qwen2.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 3.158,09 |
| WikiText-2, etapa 0 (post-cirugía, cero-shot) | Perplejidad | 1.207.852,35 |
| WikiText-2, tras destilación en 2 etapas | Perplejidad | 3.158,09 |
| Delta de perplejidad | Δ | −1.204.694,26 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó 16.839 MB de pico con FP16 y parámetros maestros FP32; para inferencia en FP16 de un modelo de 0,5B se estima alrededor de 1-2 GB, aunque la información no proporciona una cifra medida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el entrenamiento se realizó en una única GPU con unos 17 GB, lo que apunta a una A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (RTX 3060, RTX 4060, RTX 4090), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: el modelo requiere el paquete `neuralops` y la función `apply_qwen_attention_surgery` para cargar los pesos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-svd-linear-attention-wikitext2` | 0,5B | no disponible | 3.158,09 (declarada) | MIT | Hugging Face (293 descargas) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según especificaciones públicas de Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otras variantes del NeuralOps Qwen Attention Zoo | 0,5B | no disponible | no disponible | MIT | Hugging Face |

La comparación directa con el modelo base en WikiText-2 no está publicada en la información proporcionada, por lo que no es posible cuantificar la brecha de calidad con precisión.

## Limitaciones y advertencias

- Calidad generativa muy degradada: una perplejidad de 3.158,09 en WikiText-2 es varios órdenes de magnitud superior a la de un modelo de 0,5B bien entrenado, lo que hace inviable su uso en producción.
- Sesgos: no documentados en la model card; al derivar de Qwen2.5-0.5B, hereda los sesgos del modelo base, pero no se han evaluado.
- Riesgo de alucinación: muy alto, coherente con la perplejidad reportada.
- Limitación de idioma: solo inglés declarado.
- Restricciones de licencia: MIT permite uso comercial, pero la calidad del modelo desaconseja cualquier despliegue productivo.
- Dependencia de infraestructura: la carga requiere el paquete `neuralops` y la función de cirugía; no es un checkpoint autónomo cargable con `transformers` estándar sin aplicar la cirugía.
- Contexto de entrenamiento corto: `seq_len=512` en destilación, sin evidencia de generalización a secuencias más largas.
- Checkpoint parcial: solo se publican pesos de atención (76,62 MB); el resto de pesos debe tomarse del modelo base Qwen2.5-0.5B.
- Fecha de creación futura (2026-11-11) en los metadatos, lo que sugiere que el repositorio puede ser un artefacto de prueba o tener metadatos inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-linear-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

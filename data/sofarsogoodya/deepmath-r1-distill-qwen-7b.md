# SoFarSoGoodya/DeepMath-R1-Distill-Qwen-7B

## Resumen

DeepMath es un ajuste fino de razonamiento matemático sobre el modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, desarrollado por SoFarSoGoodya mediante un pipeline de dos etapas con LoRA: primero un SFT (supervised fine-tuning) sobre el dataset NuminaMath-CoT y posteriormente un DPO (direct preference optimization) con pares de preferencias matemáticas. El repositorio contiene únicamente los adaptadores LoRA (no el modelo fusionado), que deben aplicarse en secuencia: primero el adaptador SFT y después el DPO, tal como se documenta en el script `merge.py` incluido.

El modelo está pensado como un artefacto de demostración y referencia reproducible para pipelines de ajuste fino con recursos limitados, no como un modelo de producción. El autor es transparente al señalar que no es un modelo SOTA, que la ganancia del DPO fue modesta (la precisión de recompensa apenas superó el 50 % aleatorio) y que no se evaluaron benchmarks independientes. Aun así, resulta útil para comprender cómo combinar SFT y DPO con LoRA sobre un modelo base de razonamiento, y para experimentar con técnicas de optimización de preferencias en entornos con una sola GPU.

La arquitectura subyacente es la del modelo base DeepSeek-R1-Distill-Qwen-7B, un transformer denso de 7.62 mil millones de parámetros derivado de Qwen2.5-Math-7B, con una ventana de contexto nativa de 128 000 tokens. Los adaptadores LoRA son ligeros (78 MB el SFT y 77 MB el DPO) y la licencia es MIT tanto para los pesos como para el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) basado en Qwen2.5-Math-7B; adaptadores LoRA sobre DeepSeek-R1-Distill-Qwen-7B |
| Parametros totales | 7.62B (modelo base) + adaptadores LoRA: SFT 78 MB, DPO 77 MB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (modelo base); entrenamiento con cutoff 2048 (SFT) y 1024 (DPO) |
| Tipos de cuantizacion | No disponible para los adaptadores; el modelo base admite cuantización estándar (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT (adaptadores y código); modelo base también MIT |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre DeepSeek-R1-Distill-Qwen-7B, un transformer denso de 7.62B parámetros destilado de DeepSeek-R1 con datos de razonamiento generados por modelos más grandes. El ajuste fino se realizó con LLaMA-Factory usando la plantilla `deepseekr1` y un esquema LoRA en dos etapas:

1. **SFT**: LoRA con r=8, α=16, target=all, tasa de aprendizaje 5e-5, 1 época, cutoff 2048 y 1410 pasos sobre 90 217 ejemplos limpios de NuminaMath-CoT (dataset original de 100 000, filtrado). La pérdida bajó de 0.73 a 0.39. Se usaron 8 GPU RTX 5090 con DDP nativo.
2. **DPO**: LoRA con QLoRA 4-bit NF4 y doble cuantización, tasa de aprendizaje 1e-6, 3 épocas, cutoff 1024 y 456 pasos sobre 2418 pares de preferencias matemáticas (estilo distilabel-math-preference). La pérdida final fue 0.6947 (cercana al baseline ln 2) y la precisión de recompensa osciló entre 0.5 y 0.55, lo que indica una ganancia modesta. Se usó una sola RTX 5090.

No se aplicaron técnicas como decodificación especulativa ni atención lineal; el modelo hereda la atención estándar del base.

## Capacidades

- Razonamiento matemático: el modelo está ajustado para resolver problemas matemáticos con cadenas de pensamiento (chain-of-thought), heredando el estilo de razonamiento de DeepSeek-R1.
- Generación de texto conversacional: al estar basado en Qwen, mantiene capacidades de diálogo multilingüe (inglés y chino).
- Razonamiento lógico y simbólico: el base DeepSeek-R1-Distill-Qwen-7B es conocido por su rendimiento en tareas de lógica y matemáticas, que se transfieren al adaptador.
- No se documenta soporte explícito para tool calling, function calling, agentes multi-paso, visión o audio. Estas capacidades no están verificadas en la información disponible.
- El modelo es un artefacto de demostración; no se recomienda asumir capacidades más allá de las del base sin evaluación adicional.

## Casos de uso

- Referencia educativa para pipelines SFT→DPO: el repositorio incluye código y configuraciones completas para reproducir el proceso de ajuste fino con LoRA y QLoRA en hardware de consumo, ideal para aprender a implementar estas técnicas.
- Experimentación con preferencias matemáticas: los adaptadores permiten probar cómo el DPO afecta al razonamiento matemático en comparación con el SFT solo, útil para investigar la dinámica de optimización de preferencias.
- Base para fine-tuning adicional: los pesos LoRA pueden servir como punto de partida para nuevos ajustes con otros datasets matemáticos o de razonamiento, aprovechando el entrenamiento previo.
- Evaluación de la transferencia de conocimiento: comparar el rendimiento del modelo con el base permite medir el impacto real del DPO en tareas de matemáticas, aunque el autor no ha publicado benchmarks.
- Demostración de despliegue con adaptadores: el flujo de carga secuencial de adaptadores (SFT luego DPO) ilustra cómo gestionar múltiples LoRA en producción con transformers y PEFT.
- Investigación sobre alucinación matemática: al ser un modelo pequeño y especializado, es útil para estudiar los límites de los modelos de razonamiento en dominios estrechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se evaluó ningún conjunto de datos independiente tras el entrenamiento, por lo que no hay cifras de MMLU, GSM8K, HumanEval ni similares para este modelo.

## Requisitos de hardware

- Inferencia con el modelo base en FP16: aproximadamente 15.2 GB de VRAM (según datos del modelo DeepSeek-R1-Distill-Qwen-7B). Con cuantización 4-bit (GPTQ o AWQ) puede reducirse a unos 4-5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 o superiores para FP16; GPUs con 8-10 GB de VRAM (RTX 3080, RTX 4070) pueden funcionar con cuantización.
- Los adaptadores LoRA son muy ligeros (menos de 100 MB cada uno) y no incrementan significativamente los requisitos de memoria.
- Opciones de despliegue: transformers con PEFT (carga de adaptadores), vLLM (soporta adaptadores LoRA), llama.cpp u Ollama (requiere fusionar primero el modelo con los adaptadores).
- Latencia y throughput: no se dispone de datos medidos para este modelo concreto; en una RTX 4090 se espera un rendimiento similar al del modelo base (varios cientos de tokens por segundo en generación con cuantización).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepMath-R1-Distill-Qwen-7B | 7.62B + LoRA | 128K nativo | MIT | Adaptadores LoRA sin benchmarks publicados; demostración de pipeline |
| DeepSeek-R1-Distill-Qwen-7B (base) | 7.62B | 128K | MIT | Modelo base destilado de DeepSeek-R1, con benchmarks publicados (MMLU, GSM8K, etc.) |
| Qwen2.5-Math-7B | 7.6B | 32K | Apache-2.0 | Especializado en matemáticas, base del modelo anterior; sin DPO |
| Mathstral-7B | 7.24B | 32K | Apache-2.0 | Variante de Mistral orientada a razonamiento matemático |

La comparación directa es limitada porque DeepMath no tiene cifras propias. El modelo base ofrece datos de rendimiento conocidos, mientras que DeepMath solo aporta el proceso de entrenamiento como referencia.

## Limitaciones y advertencias

- No es un modelo SOTA: el autor lo define como un artefacto de aprendizaje y demostración, no apto para producción con expectativas de alto rendimiento en matemáticas.
- Ganancia del DPO modesta: la precisión de recompensa apenas superó el azar (0.5-0.55), lo que sugiere que el DPO no mejoró significativamente el razonamiento respecto al SFT.
- Sin benchmarks independientes: no se evaluó ningún conjunto de datos externo, por lo que se desconoce el rendimiento real en tareas estándar.
- Sesgos heredados: el modelo base DeepSeek-R1-Distill-Qwen-7B y el tokenizador de Qwen pueden contener sesgos culturales o lingüísticos; el ajuste con datos matemáticos no los corrige.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matemáticos complejos donde la verificación automática es difícil.
- Limitación de idiomas: aunque el base soporta múltiples idiomas, la card solo lista inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Restricciones de uso comercial: la licencia MIT permite uso comercial, pero se deben conservar las atribuciones a los modelos base (DeepSeek, Qwen) y al dataset NuminaMath (Apache-2.0).
- Complejidad de despliegue: al ser adaptadores en secuencia, es necesario aplicar primero el SFT y luego el DPO; un error en el orden produce resultados incorrectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoFarSoGoodya/DeepMath-R1-Distill-Qwen-7B
- Repositorio GitHub: https://github.com/SoFarSoGoodya/DeepMath
- Modelo base DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Documentación de LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory

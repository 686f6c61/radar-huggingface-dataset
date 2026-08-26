# ram-lexsi/aligntune-testrun-SPIN

## Resumen

`ram-lexsi/aligntune-testrun-SPIN` es un adaptador LoRA de prueba publicado por Lexsi Labs como demostración de su librería de alineación AlignTune. Se trata de un ajuste fino aplicado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` utilizando el algoritmo SPIN (Self-Play Preference Optimization) y el backend TRL. El repositorio contiene únicamente los pesos del adaptador, no el modelo completo, y está pensado como ejemplo de integración técnica más que como un modelo listo para producción.

El propósito principal de esta publicación es validar el flujo de entrenamiento de AlignTune, una herramienta modular que soporta múltiples algoritmos de alineación (SPIN, DPO, PPO, etc.) y distintos backends. Al tratarse de un adaptador sobre un modelo de solo 0.5B de parámetros, su utilidad práctica es limitada, pero sirve como referencia para desarrolladores que quieran explorar el ecosistema de AlignTune y replicar el proceso con modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador tiene pocos parámetros, pero el modelo base tiene 0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (heredado del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en precisión original, sin cuantización) |
| Idiomas soportados | no disponible (hereda los idiomas del modelo base, principalmente inglés y chino) |
| Licencia | no disponible (no se especifica en la model card) |
| Formato de pesos | safetensors (adaptador) + adapter_config.json |

Nota: el tamaño del repositorio es 0.0 GB, lo que indica que el adaptador es extremadamente pequeño (probablemente solo los pesos del LoRA, sin el modelo base).

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer causal de 0.5B parámetros con 32 capas y 14 cabezas de atención, entrenado sobre un corpus multilingüe. Sobre este modelo se ha aplicado un adaptador LoRA (Low-Rank Adaptation) que modifica las matrices de atención y MLP mediante descomposiciones de bajo rango. El entrenamiento del adaptador se realizó con el algoritmo SPIN (Self-Play Preference Optimization), que consiste en que el modelo se mejora a sí mismo generando respuestas y comparándolas con datos de preferencia, de forma iterativa. El backend utilizado es TRL (Transformers Reinforcement Learning), una librería de Hugging Face para fine-tuning con RL.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, el rango del LoRA ni los hiperparámetros. El propósito declarado es demostrar el flujo de AlignTune, no producir un modelo con un rendimiento específico.

## Capacidades

- Generación de texto: hereda las capacidades básicas de Qwen2.5-0.5B-Instruct (instrucciones simples, conversación corta, generación de código básico).
- Razonamiento y matemáticas: limitado por el tamaño del modelo base (0.5B).
- Soporte de tool calling: no confirmado para este adaptador específico; depende del modelo base.
- Multilingüismo: el modelo base soporta principalmente inglés y chino; otros idiomas no están garantizados.
- No se han documentado capacidades especiales (vision, audio, thinking mode) para este adaptador.

## Casos de uso

Dado que se trata de un adaptador de prueba, no hay casos de uso prácticos definidos. Se puede considerar como:

- Ejemplo de integración de AlignTune: para desarrolladores que quieran ver cómo cargar un adaptador entrenado con SPIN usando `AutoPeftModelForCausalLM`.
- Prueba de concepto para validar el pipeline de entrenamiento de AlignTune.
- Base para experimentos de alineación con modelos más grandes, replicando el mismo proceso.
- Material educativo para entender la diferencia entre un adaptador y un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un adaptador de prueba sobre un modelo pequeño, no se espera que compita con modelos de mayor tamaño. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.5B, la inferencia puede ejecutarse en CPU con pocos recursos (memoria RAM inferior a 2 GB) o en GPU de gama baja.
- El modelo base Qwen2.5-0.5B-Instruct requiere aproximadamente 1 GB de VRAM en fp16; con el adaptador, el consumo es similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso CPU).
- Opciones de despliegue: se puede cargar con PEFT y transformers, o exportar a GGUF para usarlo con llama.cpp u Ollama (aunque no se proporcionan archivos GGUF).
- Latencia: muy baja, típica de un modelo de 0.5B (del orden de milisegundos por token en GPU).

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros adaptadores o modelos de la misma categoría. Dado que es un adaptador de prueba, no tiene competidores directos.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (0.5B base) con capacidades limitadas para tareas complejas.
- Es un adaptador de prueba, no un modelo listo para producción; puede contener artefactos de entrenamiento.
- Sin licencia explícita en la model card; se debe asumir que la licencia del modelo base (Apache 2.0 para Qwen2.5) aplica, pero conviene confirmar con los autores.
- No hay garantía de calidad en la generación; puede producir respuestas incoherentes o alucinaciones.
- El entrenamiento con SPIN puede introducir sesgos no documentados; no se ha evaluado la seguridad del modelo.
- El repositorio no incluye el modelo base, solo el adaptador; para usarlo es necesario descargar Qwen/Qwen2.5-0.5B-Instruct por separado.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/ram-lexsi/aligntune-testrun-SPIN)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Página oficial de AlignTune](https://aligntune.lexsi.ai/)
- [Repositorio GitHub de AlignTune](https://github.com/Lexsi-Labs/aligntune)
- [Herramienta AlignTune en Lexsi Labs](https://lexsi.ai/tools/aligntune)
- [Sitio de Lexsi Labs](https://lexsi.ai/)

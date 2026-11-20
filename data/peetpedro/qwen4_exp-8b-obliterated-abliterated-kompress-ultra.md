# PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra

## Resumen

`qwen4_exp-8b-obliterated-abliterated-kompress-ultra` es un modelo de generación de texto de aproximadamente 8.000 millones de parámetros publicado por el usuario PeetPedro en Hugging Face. Se presenta como un fine-tune derivado de `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` y de la variante sin censura `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, por lo que combina la arquitectura de la familia Qwen 3.5 con técnicas de "abliteration" y "obliteration" orientadas a eliminar los mecanismos de rechazo del modelo base.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse con la librería `transformers`, con soporte declarado para cuantizaciones ternarias y BitNet, así como exportaciones a MLX y Ollama. Declara capacidades en razonamiento matemático de competición, generación de código, ingeniería de software agéntica, verificación formal en Ada/SPARK y razonamiento vocal full-duplex mediante RL (GRPO/GSPO).

La relevancia de esta ficha radica en su naturaleza experimental: los benchmarks declarados por el autor (AIME, MATH-500, LiveCodeBench, SWE-bench Verified, GPQA Diamond, IFEval) son extraordinariamente altos para un modelo de 8B y aparecen marcados como no verificados, por lo que deben interpretarse con cautela y no como resultados reproducidos de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.5 (fine-tune de DeepSeek-V4-Pro-Qwen3.5-9B); soporte declarado de cuantización ternaria/BitNet |
| Parametros totales | ~8B (según el identificador del modelo; el base es de 9B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (ternary), BitNet, MLX-quant; pesos FP16 de referencia |
| Idiomas soportados | en, hu, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); exportaciones declaradas a MLX y Ollama |

## Arquitectura y entrenamiento

El modelo parte de `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, un fine-tune sobre la arquitectura Qwen 3.5, y de su variante `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`. Sobre esa base se aplican técnicas etiquetadas como "obliterated" y "abliterated", que en la práctica consisten en modificaciones de pesos (proyecciones ortogonales tipo Householder) para eliminar direcciones asociadas a comportamientos de rechazo. La model card declara métricas internas de este proceso, como "Obliterated Residual Dot Product = 0" y "Abliterated Dual-Householder L1 Drift = 0", que indican que las direcciones ablacionadas quedan anuladas en el espacio de pesos.

El entrenamiento posterior incluye aprendizaje por refuerzo con GRPO y GSPO sobre el dataset `PeetPedro/voice-finetuning`, además de fine-tuning supervisado sobre una colección de datasets propios (`ultrawhale-dogfood`, `8b-is-ecosystem`, `smart-tree-code`, `memnet-code`, `engram-docs`, entre otros). Se declara también una fase de destilación MOPD2 y una técnica de "weight programming" denominada Wukong-Omni p/qT, con una ratio de compresión declarada de 375:1 frente a FP16 y una resonancia de pesos de 32756/32768 en Q15. Estos términos no corresponden a técnicas estándar publicadas y no se detallan en la información disponible.

## Capacidades

- Generación de texto generalista en inglés, húngaro, japonés y chino.
- Razonamiento matemático de competición (AIME, MATH-500) según los resultados declarados por el autor.
- Generación de código, con énfasis declarado en Rust `#![no_std]` y sistemas.
- Ingeniería de software agéntica (resolución de issues sobre SWE-bench Verified).
- Verificación formal en Ada 2022 / SPARK mediante `gnatprove`.
- Seguimiento estricto de instrucciones (IFEval).
- Razonamiento vocal full-duplex y entrenamiento por RL con GRPO/GSPO (según la model card).
- Modo sin censura ("uncensored"/"heretic"): rechaza aplicar filtros de seguridad del modelo base.
- Soporte de cuantización ternaria y BitNet, con exportación a MLX y Ollama.

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas de competición y verificación simbólica de resultados, apoyándose en el modo de razonamiento extendido declarado por el autor.
- Generación de código de sistemas en Rust: el modelo declara entrenamiento específico en Rust `#![no_std]`, útil para firmware y entornos embebidos.
- Agente de resolución de issues: integración en pipelines tipo SWE-bench para proponer parches sobre repositorios, con soporte de tool calling y razonamiento multi-paso.
- Verificación formal de código Ada/SPARK: generación de anotaciones y contratos que `gnatprove` pueda descargar, según el caso de uso declarado en la model card.
- Despliegue local en hardware de consumo: al ser un modelo de ~8B con soporte de cuantización ternaria y exportación a Ollama/MLX, puede ejecutarse en estaciones de trabajo y portátiles Apple Silicon.
- Investigación sobre alineación y censura: al ser un modelo "abliterated", sirve como objeto de estudio para medir el efecto de la ablación de direcciones de rechazo sobre el comportamiento del modelo.
- Procesamiento multilingüe en inglés, húngaro, japonés y chino para tareas de generación y resumen.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos marcados como `verified: false`):

| Benchmark | Metrica | Valor declarado |
|---|---|---|
| AIME 2025/2026 | Pass@1 | 96,67 % (29/30) |
| MATH-500 | Accuracy | 98,60 % (493/500) |
| LiveCodeBench v5 | Pass@1 | 97,00 % (194/200) |
| SWE-bench Verified | Resolved | 89,40 % (447/500) |
| GPQA Diamond | Accuracy | 85,35 % (169/198) |
| IFEval | Strict Prompt Accuracy | 97,41 % (527/541) |
| Ada/SPARK gnatprove | Proved VCs | 100,00 % (111/111) |
| voice-finetuning (GRPO) | Final Q15 Reward | 32749/32768 |
| Wukong-Omni p/qT | Resonancia de pesos Q15 | 32756/32768 |
| Wukong-Omni p/qT | Ratio de compresión vs FP16 | 375:1 |
| MOPD2 | Distillation Loss Q15 | 380 |
| Obliterated | Residual Dot Product | 0 |
| Abliterated | Dual-Householder L1 Drift | 0 |

No se han publicado resultados de benchmarks verificados de forma independiente en la información disponible. Los valores anteriores proceden exclusivamente de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~16 GB para un modelo de ~8B.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB.
- La cuantización ternaria/BitNet declarada podría reducir el requisito por debajo de 4 GB, aunque no se especifican cifras exactas.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 ajustado; RTX 4060 Ti 16 GB o superiores para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: `transformers`, vLLM, llama.cpp, Ollama (exportación declarada), MLX (Apple Silicon).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra` | ~8B | no disponible | Apache 2.0 | Fine-tune sin censura con benchmarks no verificados |
| `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` (base) | 9B | no disponible | no disponible | Modelo base del fine-tune |
| `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` (base) | 9B | no disponible | no disponible | Variante sin censura previa |
| Qwen 3.5 8B/9B oficial | ~8-9B | no disponible | Apache 2.0 (habitual en la familia Qwen) | Referencia de la arquitectura subyacente |

No se dispone de datos de rendimiento verificados de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Todos los benchmarks proceden del autor y están marcados como no verificados; no deben tomarse como resultados reproducidos.
- El modelo es "abliterated"/"uncensored": se ha eliminado deliberadamente el comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro sin filtros.
- Riesgo de alucinación no cuantificado; los resultados tan altos en matemáticas y código sugieren posible sobreajuste a los conjuntos de evaluación o contaminación de datos.
- Idiomas soportados limitados a inglés, húngaro, japonés y chino; el castellano no figura entre ellos.
- Longitud de contexto no disponible, lo que dificulta planificar despliegues con prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al integrador toda la responsabilidad legal y ética.
- Términos como "Wukong-Omni p/qT", "MOPD2" o "8b-agy fan-out" no corresponden a técnicas estándar publicadas y no se documentan con detalle; deben tratarse con escepticismo.
- No se especifican datos sobre sesgos, composición del dataset de entrenamiento ni procesos de evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Repositorio del motor fan-out: https://codeberg.org/8b-is/eightb-agy-fanout
- Repositorio Wukong-Omni: https://github.com/8b-is/eightb-agy-fanout
- Dataset voice-finetuning: https://huggingface.co/datasets/PeetPedro/voice-finetuning
- Dataset 8b-is-ecosystem: https://huggingface.co/datasets/PeetPedro/8b-is-ecosystem

# rjz123/colar-math-l123-r1q

## Resumen

El modelo `rjz123/colar-math-l123-r1q` es un adaptador PEFT (LoRA) desarrollado por el autor rjz123 sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Está entrenado con el framework CoLaR (Compressed Latent Reasoning), una técnica propuesta por Xiaomi Research en el paper "Think Silently, Think Fast: Dynamic Latent Compression of LLM Reasoning Chains" (NeurIPS 2025), que comprime dinámicamente las cadenas de razonamiento en un espacio latente para reducir el coste computacional asociado al razonamiento token a token.

El adaptador está diseñado específicamente para tareas de razonamiento matemático de nivel bajo-medio (MATH L1-3) y utiliza un esquema de compresión con `compress=5`, que permite capturar la semántica de varios tokens en una única variable latente. El checkpoint se entrega en formato PyTorch-Lightning (`.ckpt`) y no es cargable directamente con `AutoModel`; requiere un scaffold personalizado que combina el modelo base, un resize del token `[PAD]`, LoRA r128 en las proyecciones q/v y un MLP `LatentPolicy`.

Este modelo es relevante para la comunidad de investigación en eficiencia de razonamiento, ya que ejemplifica una alternativa a las cadenas de pensamiento tradicionales, con potencial para reducir la latencia y el consumo de memoria en inferencia. Sin embargo, se trata de un artefacto experimental sin licencia especificada y sin datos de rendimiento publicados, por lo que su uso en producción no está recomendado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base DeepSeek-R1-Distill-Qwen-1.5B) con adaptador LoRA r128 en q/v y MLP LatentPolicy |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el base tiene 1.5B, pero no se especifica el desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`), no compatible con `AutoModel`; requiere carga manual con `strict=False` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CoLaR descrita en el paper de Xiaomi Research. CoLaR introduce un objetivo de "next compressed embedding" que permite al modelo razonar en el espacio latente, generando variables que representan la semántica de múltiples tokens a la vez. El entrenamiento se realiza en dos etapas: primero se comprime el razonamiento en un espacio latente y luego se entrena el modelo para predecir estas variables comprimidas de forma autorregresiva.

El adaptador concreto se entrenó sobre una mezcla de problemas de MATH de niveles 1 a 3, con un warm-start desde un checkpoint previo llamado `r1_hardmath` y un factor de compresión de 5 (`compress=5`). La implementación incluye un resize del token `[PAD]` en el modelo base, LoRA de rango 128 en las proyecciones q y v, y un MLP `LatentPolicy` que gestiona la política de compresión. No se proporcionan detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO; la información disponible solo menciona el entrenamiento supervisado implícito en el framework CoLaR.

## Capacidades

- Razonamiento matemático de nivel bajo-medio (problemas de MATH L1-3).
- Razonamiento latente comprimido: genera representaciones internas que agrupan varios tokens, reduciendo la longitud efectiva de la cadena de razonamiento.
- Generación de texto autoregresiva (pipeline `text-generation`).
- Capacidad de adaptación mediante LoRA sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- No se especifican capacidades de tool calling, función calling, agentes, visión o audio.
- El soporte multilingüe no está documentado; se asume limitado al del modelo base.

## Casos de uso

- Investigación en eficiencia de razonamiento: el modelo sirve como banco de pruebas para estudiar cómo la compresión latente reduce el coste computacional en comparación con cadenas de pensamiento explícitas.
- Evaluación de razonamiento matemático en entornos académicos: puede utilizarse para medir la calidad de respuestas en problemas de nivel L1-3 de MATH, aunque sin métricas publicadas.
- Prototipado de sistemas con presupuesto de tokens reducido: al comprimir el razonamiento, podría integrarse en aplicaciones donde la latencia o el coste de inferencia sean críticos, siempre que se valide su rendimiento.
- Comparación con modelos de razonamiento tradicionales: permite analizar el equilibrio entre precisión y eficiencia frente a modelos que generan cadenas de CoT completas.
- Experimentación con adaptadores LoRA para razonamiento: el checkpoint incluye LoRA r128 en q/v, útil para estudiar el impacto de la adaptación de bajo rango en tareas matemáticas.
- Análisis de la dinámica de compresión latente: los investigadores pueden inspeccionar las variables latentes generadas para entender cómo el modelo condensa información semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. El modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene benchmarks conocidos, pero el adaptador no los hereda automáticamente y no se proporcionan mediciones específicas.

## Requisitos de hardware

- Al ser un adaptador PEFT de 0.1 GB, el requisito principal es el del modelo base (DeepSeek-R1-Distill-Qwen-1.5B), que en FP16 requiere aproximadamente 3 GB de VRAM para inferencia.
- El checkpoint no es cargable con `AutoModel`; se necesita el scaffold CoLaR personalizado, lo que implica un entorno de ejecución específico (PyTorch-Lightning y las variables de entorno documentadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para el modelo base; para experimentos más grandes se recomienda A100 o H100.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El uso requiere código personalizado basado en el repositorio CoLaR.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de compresión.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos. Sin embargo, se puede establecer una comparación conceptual:

| Modelo | Arquitectura | Contexto | Razonamiento | Licencia |
|---|---|---|---|---|
| rjz123/colar-math-l123-r1q | Qwen-1.5B + LoRA + MLP latente | no disponible | Latente comprimido | no disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | Transformer decoder 1.5B | 32k (estimado) | Chain-of-thought explícito | MIT (del base) |
| Otros modelos de razonamiento latente (p.ej. CoT tradicional) | Transformer estándar | variable | Token a token | variable |

El adaptador se diferencia del modelo base en que no genera cadenas de texto visibles, sino representaciones latentes comprimidas. No hay alternativas directas en el ecosistema con el mismo enfoque y tamaño, aparte de otros checkpoints CoLaR de Xiaomi Research.

## Limitaciones y advertencias

- Checkpoint experimental: no está optimizado para producción y carece de garantías de robustez.
- Compatibilidad restringida: el formato `.ckpt` no es compatible con `AutoModel`; requiere el scaffold CoLaR y variables de entorno específicas (`COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD`, `COLAR_COMPRESS`, `COLAR_MAXLAT`, `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD`).
- Licencia no especificada: no se indica si el adaptador puede usarse comercialmente; se recomienda contactar al autor antes de cualquier uso.
- Sin datos de sesgos ni alucinación: no se han evaluado estos riesgos para el adaptador.
- Alcance limitado: solo entrenado para matemáticas de nivel L1-3; su rendimiento en otras tareas es desconocido.
- Sin soporte para tool calling ni agentes: no se mencionan estas capacidades.
- Fecha de creación futura (2026-08-19) y cero descargas/likes: indica que es un artefacto muy reciente y sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/colar-math-l123-r1q
- Paper arXiv: https://arxiv.org/pdf/2505.16552v1
- Paper NeurIPS: https://papers.nips.cc/paper_files/paper/2025/file/0706261aedab63814a2b73c32564b4c4-Paper-Conference.pdf
- Repositorio oficial CoLaR: https://github.com/xiaomi-research/colar

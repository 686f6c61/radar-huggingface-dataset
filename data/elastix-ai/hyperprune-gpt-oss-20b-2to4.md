# elastix-ai/HyperPrune-gpt-oss-20b-2to4

## Resumen

HyperPrune-gpt-oss-20b-2to4 es un checkpoint de poda (pruning) del modelo openai/gpt-oss-20b, desarrollado por elastix-ai como parte de la comparación de métodos de sparsity BLADE. Aplica sparsity semi-estructurada 2:4 a los pesos de los expertos del modelo base mediante el método HyperPrune (Sun & Sakuma, ICLR 2026), que utiliza una hypernetwork para aprender las máscaras de poda. El modelo base es un mixture of experts (MoE) de 20.914.757.184 parámetros totales, de los cuales 19.1B corresponden a los pesos de los expertos podados; la atención y el router se mantienen densos. El objetivo es reducir el coste computacional y de memoria de la inferencia manteniendo la capacidad del modelo original. Este checkpoint es una reproducción con el corpus de calibración SlimPajama-6B (validation) en lugar del c4 original, y con todas las capas decoder podadas, lo que resulta en una sparsity del 50,35% en los expertos. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) con sparsity 2:4 semi-estructurada; base: openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (20.9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16/fp16 (pesos sparse en precisión nativa, sin cuantización adicional) |
| Idiomas soportados | no disponibles |
| Licencia | other (el modelo base gpt-oss-20b es Apache 2.0) |
| Formato de pesos | safetensors (guardado manual fragmentado y verificado) |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b es un MoE con 20.9B parámetros totales, de los cuales 19.1B corresponden a los pesos de los expertos. La poda se realiza con HyperPrune, que entrena una hypernetwork MLP (hidden_dim 256, emb_dim 64, con hessian diag) para seleccionar las filas a podar en cada proyección. El proceso consta de dos etapas: una fase supervisada (12000 pasos, lr 0.001) y un fine-tuning en cascada (lr 0.0003, 4 muestras, 400 filas por paso, 300 pasos internos). El corpus de calibración es DKYoon/SlimPajama-6B (validation), consumido desde los input_ids pre-tokenizados del dataset ElastiML self-distilled (elastix-ai/elastiml-calib-gpt-oss-20b), con 128 muestras, seq_len 2048 y seed 42. Se utiliza un prior SparseGPT con wanda_residual_alpha 2.0, compensación de pesos y propagación compensada.

A diferencia de la configuración original de HyperPrune, que dejaba dos capas densas, este checkpoint poda todas las capas decoder (dense_layers_list vacío), siguiendo la especificación BLADE two_four_experts. La hypernetwork solo decide la máscara de las primeras 200 filas de salida de cada proyección; el resto mantiene la máscara del prior SparseGPT. La sparsity resultante es 0.5035 sobre los 19.1B de pesos de expertos (0.4600 a nivel de modelo completo), con 0 violaciones de la restricción 2:4 en 4.78B grupos. El entrenamiento duró 59.9 minutos en una NVIDIA RTX PRO 6000 Blackwell, con un pico de 11.24 GB de VRAM durante el cascade FT. Se tuvo que trabajar alrededor de un defecto de transformers 5.15.1 que elimina silenciosamente los pesos de expertos fusionados al usar save_pretrained; el checkpoint se guardó manualmente con safetensors fragmentados y se verificó tensor a tensor (411/411).

## Capacidades

- Generación de texto conversacional: el modelo base gpt-oss-20b está diseñado para tareas de lenguaje y razonamiento, según OpenAI. No se han publicado evaluaciones específicas del checkpoint podado en estas tareas.
- Razonamiento: el modelo base ofrece capacidades de razonamiento de alto nivel; el checkpoint podado no ha sido evaluado en este aspecto en la información disponible.
- Generación de código: el modelo base soporta generación de código, pero no se aportan benchmarks en el checkpoint podado.
- Tool calling / function calling: el modelo base tiene capacidades de uso de herramientas, según OpenAI; el checkpoint podado no ha sido evaluado en este aspecto.
- Agentes y razonamiento multi-step: el modelo base puede integrarse en flujos de agentes; no hay datos específicos del checkpoint.
- Multilingüe: no disponible.
- Capacidad especial: sparsity 2:4 semi-estructurada en los pesos de los expertos, que puede acelerar la inferencia en hardware compatible con esta restricción (por ejemplo, GPUs NVIDIA con soporte de sparsity 2:4).

## Casos de uso

- Inferencia eficiente en entornos con recursos limitados: la sparsity 2:4 reduce el número de pesos no nulos en los expertos (0.5035 de sparsity), lo que puede disminuir el coste computacional y la memoria necesaria en GPUs compatibles, manteniendo la arquitectura MoE del modelo base.
- Investigación comparativa de métodos de poda: este checkpoint es una reproducción deliberada con un corpus de calibración distinto al del paper, por lo que sirve como referencia para comparar HyperPrune con SparseGPT, Wanda u otros métodos en el marco BLADE.
- Despliegue de asistentes conversacionales: el modelo base gpt-oss-20b es conversacional y soporta tool use; el checkpoint podado puede usarse en chatbots de producción donde se prioriza el coste por consulta, siempre que se valide su calidad.
- Herramientas de autocompletado de código: el modelo base tiene capacidades de código; el checkpoint podado podría integrarse en editores o pipelines de CI/CD, aunque requiere validación previa.
- Agentes con razonamiento multi-step: el modelo base puede planificar y ejecutar tareas; el checkpoint podado puede probarse en sistemas de agentes para reducir latencia, pero no hay datos de rendimiento.
- Experimentos de eficiencia en hardware: la sparsity 2:4 es aprovechada por GPUs como A100 o H100; este checkpoint permite medir la ganancia real de throughput y latencia frente al modelo denso.
- Análisis del impacto de la poda en la calidad: al ser un checkpoint con todas las capas podadas y con una perplejidad de 247.45 (word PPL), es útil para estudiar cómo afecta la poda profunda a la capacidad lingüística del modelo.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la información disponible:

| Métrica | Valor | Notas |
|---|---|---|
| Sparsity de los expertos | 0.5035 | sobre 19.1B de pesos; 0.4600 a nivel de modelo completo |
| Violaciones de la restricción 2:4 | 0 | en 4.78B grupos |
| WikiText-2 PPL (token-level, seqlen 2048) | nan | overflow fp16 en la evaluación capa a capa; medido en bf16 en el protocolo BLADE |
| WikiText-2 word PPL (lm-eval-harness, BLADE) | 247.45 | max_length=2048 |
| Mejora de reconstrucción vs SparseGPT | 73-78% | hasta la capa 14; luego decae (-58%, -29%, -33%) en capas profundas |
| Tiempo de entrenamiento | 59.9 min | 1x NVIDIA RTX PRO 6000 Blackwell |
| Pico de VRAM durante cascade FT | 11.24 GB | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo es 41.9 GB en bf16/fp16; cargar los pesos completos sin cuantización adicional requeriría aproximadamente 42 GB de VRAM (por ejemplo, una A100 80GB o RTX PRO 6000 Blackwell 97GB). La sparsity 2:4 podría reducir los requisitos en hardware compatible, pero no se especifica.
- GPU recomendadas: la usada para entrenamiento fue una NVIDIA RTX PRO 6000 Blackwell (97 GB). Para inferencia, se recomiendan GPUs con soporte de sparsity 2:4, como las series A100 o H100 de NVIDIA.
- ¿Cabe en consumer GPU?: no hay datos al respecto. Con 41.9 GB de peso, no cabe en una GPU de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: carga con stock transformers (AutoModelForCausalLM y AutoTokenizer). No se especifican otros frameworks en la información disponible; al ser safetensors estándar, podría ser compatible con vLLM, llama.cpp, Ollama o TGI, pero no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se compara con el modelo base denso y con otro checkpoint de poda de la misma familia (misma técnica, distinto tamaño), aunque no se dispone de datos de rendimiento para este último.

| Modelo | Parámetros | Sparsity | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elastix-ai/HyperPrune-gpt-oss-20b-2to4 | 20.9B | 2:4 semi-estructurada (0.5035 en expertos) | no disponible | other | HuggingFace |
| openai/gpt-oss-20b (base) | 20.9B | Denso | no disponible | Apache 2.0 | HuggingFace |
| elastix-ai/HyperPrune-Llama-3.1-8B-2to4 | 8B (aprox.) | 2:4 semi-estructurada | no disponible | other | HuggingFace |

Nota: el checkpoint de Llama-3.1-8B aparece en los resultados de búsqueda pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad WikiText-2 word PPL es 247.45, un valor muy alto que indica una degradación severa de la calidad del lenguaje tras la poda. No se aporta el valor del modelo base en la misma métrica, por lo que no se puede cuantificar la pérdida exacta.
- La reconstrucción empeora con la profundidad: mejora un 73-78% sobre el prior SparseGPT hasta la capa 14, pero decae (-58%, -29%, -33%) en capas profundas, y tres capas (6, 22, 23) terminan peor que el prior. Esto sugiere una poda desigual.
- Solo las primeras 200 filas de cada proyección son decididas por la hypernetwork; el resto de la máscara proviene del prior SparseGPT. Por tanto, este checkpoint no representa completamente el método HyperPrune tal como se describe en el paper.
- La calibración se realizó con un corpus específico (SlimPajama-6B validation, consumido desde ElastiML self-distilled). La calidad puede no generalizar a otros dominios.
- El checkpoint se guardó manualmente debido a un defecto de transformers 5.15.1 que elimina los pesos de expertos fusionados. Aunque se verificó tensor a tensor, existe un riesgo residual de problemas de integridad o compatibilidad con versiones futuras.
- La licencia es "other", no Apache 2.0 como el modelo base. Hay que revisar los términos de la licencia antes de cualquier uso comercial.
- No se han publicado evaluaciones de razonamiento, código, tool calling ni capacidades multilingües en el checkpoint podado, por lo que no se puede garantizar que conserve las capacidades del modelo base.
- La sparsity 2:4 solo proporciona ganancias de rendimiento en hardware compatible; en otros entornos, la inferencia puede ser igual o más lenta que la del modelo denso.

## Enlaces

- HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-gpt-oss-20b-2to4
- Repositorio de HyperPrune: https://github.com/futuresun912/HyperPrune
- Paper en OpenReview: https://openreview.net/forum?id=lqjQs2lVNm
- Modelo base en HuggingFace: https://huggingface.co/openai/gpt-oss-20b
- Página de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Otro checkpoint de Elastix: https://huggingface.co/elastix-ai/HyperPrune-Llama-3.1-8B-2to4

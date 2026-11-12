# mrminjae/qwen36-35b-a3b-2p10bit-selftraj-ans-lowbit

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura MoE (Mixture of Experts) con capacidades de imagen-a-texto y generación de texto. El autor, mrminjae, ha aplicado una cuantización selectiva extrema: únicamente los expertos enrutados (routed experts) se comprimen a una media de 2,10 bits, mientras que el resto de los pesos permanece en BF16. Los pesos se almacenan ya descomprimidos en tensores BF16, de modo que cargan directamente con `transformers` estándar o vLLM sin necesidad de kernels de cuantización especiales.

La relevancia de este checkpoint es doble: por un lado, explora los límites de la compresión en capas MoE, donde la redundancia entre expertos permite reducir la precisión de forma agresiva con menor degradación que en un transformer denso; por otro, al mantener el resto de pesos en BF16 y almacenar los expertos descomprimidos, elimina la fricción de despliegue asociada a formatos cuantizados exóticos. Es un artefacto de investigación interna, no un modelo de producción pulido.

El repositorio ocupa 14,7 GB y fue creado el 12 de noviembre de 2026. No se han publicado resultados de evaluación, idiomas soportados ni licencia explícita más allá de la herencia de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3.5 MoE, con soporte imagen-a-texto |
| Parametros totales | 35B (según nombre del modelo base) |
| Parametros activos | A3B (aproximadamente 3B activos, según nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | hereda la del modelo base Qwen/Qwen3.6-35B-A3B (no especificada en la model card) |
| Formato de pesos | safetensors en BF16 (tensores descomprimidos, compatibles con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de la familia Qwen3.5, con aproximadamente 35B parámetros totales y unos 3B activos por token. Incorpora además capacidad de procesamiento imagen-a-texto, según la etiqueta `image-text-to-text` del repositorio. La innovación de este checkpoint no reside en el entrenamiento del modelo base, sino en el proceso de compresión: los expertos enrutados se cuantizan a una media de 2,10 bits mediante una técnica identificada internamente como `full_selftraj_ans_lowbit`, presumiblemente basada en cuantización post-entrenamiento con optimización de la asignación de bits (ANS, Asymmetric Numeral Systems) y una trayectoria de autoajuste.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el algoritmo exacto de cuantización más allá del identificador interno y la media de bits. Los pesos se almacenan ya descomprimidos en BF16, lo que implica que el ahorro de memoria se produce durante el almacenamiento y la transferencia, no en la inferencia: al cargar, el modelo ocupa el mismo espacio que un checkpoint BF16 equivalente del modelo base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `text-generation` y `conversational`.
- Procesamiento de imagen y texto combinados (image-text-to-text), heredado del modelo base.
- Razonamiento multi-paso y modo "thinking", presumiblemente heredado de la familia Qwen3.5, aunque no confirmado en la model card.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de agente: no confirmadas en la información disponible.

## Casos de uso

- Investigación en compresión de modelos MoE: el checkpoint permite estudiar cómo afecta una cuantización de 2,10 bits en expertos enrutados a la calidad de salida, comparándolo con el modelo base en BF16. Es adecuado porque el resto de pesos permanece intacto, aislando el efecto de la compresión de expertos.
- Despliegue en entornos con `transformers` estándar: al almacenarse descomprimido en BF16, carga sin kernels personalizados, lo que facilita su uso en pipelines de investigación sin modificar la infraestructura.
- Evaluación comparativa de checkpoints cuantizados: sirve como referencia para medir la degradación de benchmarks frente a otras técnicas de cuantización (GPTQ, AWQ, GGUF) sobre el mismo modelo base.
- Pruebas de inferencia con vLLM: la compatibilidad declarada con vLLM permite integrarlo en servidores de inferencia de alto rendimiento para experimentos de throughput.
- Análisis de sensibilidad por capas: al mantener BF16 en todo excepto los expertos, permite estudiar qué componentes del MoE son más tolerantes a la compresión extrema.
- Prototipado de aplicaciones multimodales: la capacidad image-text-to-text permite experimentar con tareas de descripción de imágenes o VQA en un entorno de investigación, siempre que se valide la calidad tras la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos descomprimidos en BF16, el modelo requiere aproximadamente 70 GB de VRAM para los 35B parámetros en BF16 (2 bytes por parámetro), más overhead de activaciones y caché KV.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x A100 40GB, 2x RTX 4090 24GB) para repartir los pesos.
- Cabe en consumer GPU: no en una sola GPU de consumo; requiere al menos dos RTX 4090 o una RTX 6000 Ada con 48GB no sería suficiente para BF16 completo.
- Opciones de despliegue: `transformers` (compatible declarado), vLLM (compatible declarado). No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-selftraj-ans-lowbit | 35B totales, ~3B activos | no disponible | hereda del base | BF16 descomprimido | Expertos a 2,10 bits, checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | no disponible | no disponible | BF16 | Modelo original sin compresión |
| Alternativas de cuantización estándar (GPTQ/AWQ 4-bit) | 35B totales, ~3B activos | no disponible | según implementación | safetensors cuantizado | Requieren kernels específicos; mayor precisión que 2,10 bits |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo describe explícitamente como "internal research checkpoint", sin garantías de calidad ni validación pública.
- Cuantización extrema a 2,10 bits en expertos: es probable una degradación significativa de la calidad frente al modelo base, aunque no se han publicado métricas que lo cuantifiquen.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Licencia no especificada: la model card indica que hereda la del modelo base, pero no se detalla cuál es; es necesario consultar la licencia de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras la compresión.
- Riesgo de alucinación: no evaluado; la compresión agresiva puede incrementarlo.
- Sin soporte confirmado para tool calling ni agentes: no verificado en la información disponible.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- Almacenamiento en BF16 descomprimido: no reduce los requisitos de VRAM en inferencia respecto al modelo base, solo el tamaño de almacenamiento y transferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-selftraj-ans-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

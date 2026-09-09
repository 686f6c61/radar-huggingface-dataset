# CollectionStudio/Trinity-Large-Base

## Resumen

Trinity-Large-Base es un modelo de base (foundation model) de 398.000 millones de parámetros entrenado por Arcee AI en su campaña de entrenamiento Trinity Large. Se distribuye en Hugging Face a través de la cuenta CollectionStudio, pero el desarrollo original corresponde a Arcee AI. Se trata de un Mixture-of-Experts (MoE) sparse con 256 expertos y aproximadamente 13.000 millones de parámetros activos por token, lo que permite obtener capacidad de un modelo de gran escala con un coste computacional proporcional a un modelo mucho más pequeño.

Este checkpoint concreto se capturó tras completar 17 billones de tokens de preentrenamiento, incluidos los annealismos de tasa de aprendizaje a mitad de entrenamiento y la extensión de contexto hasta 512.000 tokens. No ha pasado por ningún ajuste de instrucciones, RLHF ni postentrenamiento, por lo que representa el estado final de la fase de preentrenamiento y está pensado para servir como base en investigación y fine-tuning posterior. Su relevancia radica en ser un modelo MoE de código abierto con una relación entre parámetros totales y activos muy eficiente (1,56% de sparsity), lo que abre posibilidades para estudiar la dinámica de routing y el comportamiento emergente a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (AfmoeForCausalLM), 256 expertos, 4 activos por token, 6 capas densas |
| Parametros totales | 398.635.286.016 (~398B) |
| Parametros activos | ~13B (4 de 256 expertos activos) |
| Longitud de contexto | 8.192 tokens en preentrenamiento, extendido a 512k |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Large-Base utiliza una arquitectura de Mixture-of-Experts sparse con 256 expertos y 4 expertos activos por token, lo que da una sparsity del 1,56%. La capa densa se mantiene en 6 capas, combinando parámetros compartidos con rutas especializadas para cada token. Esta configuración está implementada como `AfmoeForCausalLM` y se ha optimizado para entrenar con tamaños de lote críticos grandes en regímenes de alta sparsity.

El preentrenamiento se realizó sobre 17 billones de tokens, con dos annealismos de tasa de aprendizaje a mitad de entrenamiento (mid-training anneals) y una extensión posterior del contexto desde los 8.192 tokens iniciales hasta 512.000. No se aplicó ningún ajuste de instrucciones ni reforzamiento, por lo que es un checkpoint post-anneal y pre-fine-tuning. Los optimizadores utilizados fueron Adam (tasa de aprendizaje 2e-4) y Muon (8e-4), este último para soportar tamaños de lote críticos más grandes en el régimen MoE. El entrenamiento se ejecutó en un clúster de 2.048 GPUs NVIDIA B300, con paralelismo HSDP y paralelismo experto, en colaboración con Prime Intellect como socio de cómputo y Datology como socio de datos.

## Capacidades

- Generación de texto base en 10 idiomas (inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino).
- Razonamiento matemático: obtiene 0,9136 en GSM8K con cadena de pensamiento y 0,6520 en Minerva Math500.
- Capacidad básica de código: 0,8862 en MBPP+ con 3 shots (pass@1).
- Conocimiento general y razonamiento: 0,9011 en HellaSwag, 0,8258 en MMLU 5-shot y 0,8082 en Winogrande.
- Razonamiento multi-step: 0,6570 en BBH y 0,4394 en GPQA Diamond.
- No soporta tool calling, visión ni audio de forma nativa.
- No es un modelo conversacional ni está alineado; carece de modo de razonamiento explícito (a diferencia de la variante Trinity-Large-Thinking).
- El contexto extensible a 512k tokens permite experimentación con tareas de contexto largo, aunque dicha capacidad requiere validación tras un fine-tuning.

## Casos de uso

- Investigación en routing de MoE: analizar cómo se distribuyen los tokens entre los 256 expertos, evaluar el balance de carga y optimizar estrategias de enrutamiento en arquitecturas sparse.
- Base para fine-tuning de dominio: partir de este checkpoint para entrenar modelos especializados en sectores como legal, médico, financiero o code generation, aprovechando su sólida representación de lenguajes.
- Investigación en alineación: al ser un modelo sin instrucciones ni RLHF, sirve como punto de partida limpio para experimentar con técnicas de alineación como DPO o RLHF sin contaminación de datos previos.
- Estudio de fenómenos emergentes: comparar este checkpoint con el de 10 billones de tokens (TrueBase) para medir el impacto de los tokens adicionales y los anneals en la aparición de capacidades de razonamiento y conocimiento.
- Experimentos de contexto largo: usar el contexto extensible para evaluar recuperación de información y razonamiento sobre documentos extensos, contratos o repositorios de código completos.
- Generación de corpus multilingües: aprovechar la capacidad de generar texto coherente en 10 idiomas para construir datasets sintéticos, aunque siempre supervisando la calidad y seguridad del contenido.

## Benchmarks y rendimiento

| Benchmark | N-shot | Resultado |
|---|---|---|
| mbpp_plus | 3 | 0.8862 |
| minerva_math500 | 4 | 0.6520 |
| hellaswag_5shot | 5 | 0.9011 |
| winogrande_5shot | 5 | 0.8082 |
| mmlu_5shot | 5 | 0.8258 |
| mmlu_generative_5shot | 5 | 0.8260 |
| mmlu_pro | 5 | 0.6602 |
| triviaqa_5shot | 5 | 0.8330 |
| arc_challenge_0shot | 0 | 0.6544 |
| bbh_fewshot | 3 | 0.6570 |
| gpqa_diamond_5shot | 5 | 0.4394 |
| gsm8k_cot | 8 | 0.9136 |

No se han publicado comparativas con modelos externos en la información disponible.

## Requisitos de hardware

- Los pesos completos en formato BF16 ocupan aproximadamente 797 GB (dato inferido del tamaño del repositorio). Para mantenerlos en memoria se necesitan varias GPUs de alta capacidad.
- Estimaciones de VRAM con cuantización: con INT8 se reduce a ~398 GB, y con INT4 a ~199 GB, siempre hablando de los parámetros totales.
- No cabe en una GPU de consumo; se necesitan clústeres de GPUs de centros de datos o estaciones de trabajo con múltiples GPUs profesionales (por ejemplo, 8x H100 de 80GB con sharding de pesos).
- Opciones de despliegue: se recomiendan motores de inferencia que soporten MoE y sharding de expertos, como vLLM, TGI o TensorRT-LLM. llama.cpp no es práctico para este tamaño de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Instrucciones | Notas |
|---|---|---|---|---|
| Trinity-Large-Base | ~398B (13B activos) | 8.192 -> 512k | Ninguna | 17T tokens, post-anneal |
| Trinity-Large-TrueBase | ~398B (13B activos) | no disponible | Ninguna | 10T tokens, pre-anneal |
| Trinity-Large-Thinking | ~398B (13B activos) | no disponible | Post-entrenamiento de razonamiento | Agéntico, cadena de pensamiento extendida |
| Trinity-Large-Preview | ~398B (13B activos) | no disponible | Chat | En RL activo |

No se dispone en la información proporcionada de comparativas con modelos de otras familias o categorías similares.

## Limitaciones y advertencias

- No está alineado para seguridad, utilidad ni tono conversacional: puede generar contenido inapropiado, sesgado o sin filtros.
- Puede exhibir comportamientos crudos o inestables, según indica la model card del autor.
- Requiere una potencia de cómputo y un nivel de experiencia considerables para realizar fine-tuning o incluso una inferencia eficiente.
- No soporta tool calling, visión ni audio, y su utilidad directa en producción es limitada sin un postentrenamiento adicional.
- La licencia `openmdw-1.1` no se detalla en la documentación disponible; debe revisarse antes de cualquier uso comercial o redistribución.
- El contexto de 512k tras la extensión no se ha validado en tareas reales sin un fine-tuning específico, por lo que su rendimiento en documentos largos es incierto.
- El rendimiento multilingüe es variable y no se aportan datos por lengua en los benchmarks publicados.

## Enlaces

- Hugging Face (repo de CollectionStudio): https://huggingface.co/CollectionStudio/Trinity-Large-Base
- Hugging Face (repo original de arcee-ai): https://huggingface.co/arcee-ai/Trinity-Large-Base
- Informe técnico de Trinity Large: https://github.com/arcee-ai/trinity-large-tech-report/
- Trinity-Large-Thinking: https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- Trinity-Large-TrueBase: https://huggingface.co/arcee-ai/Trinity-Large-TrueBase
- Trinity-Large-Preview: https://huggingface.co/arcee-ai/Trinity-Large-Preview

# garg-achal/qwen3-4b-activation-probes-week2

## Resumen

qwen3-4b-activation-probes-week2 es un artefacto de interpretabilidad mecánica publicado por el usuario garg-achal en el marco del sprint Applied AI Foundry (v4.0) de curons.org. No es un modelo generativo completo, sino un conjunto de sondas lineales (linear probes) entrenadas sobre el flujo residual de Qwen/Qwen3-4B, concretamente en la capa 18, junto con un vector de direccionamiento por adición de activaciones contrastivas (CAA, Contrastive Activation Addition). Su función es actuar como guardrail interno: clasificar si una reclamación FinOps es legítima o fraudulenta directamente a partir de las activaciones del modelo base, sin necesidad de una segunda llamada a un LLM juez externo.

El problema que aborda es el coste y la latencia de los guardrails basados en LLM-as-a-Judge, que el autor cifra en unos 550 ms adicionales y el doble de coste en tokens. La propuesta sustituye esa capa por un hook de forward en PyTorch que captura activaciones, aplica una sonda lineal de apenas 20,2 KB en safetensors y, opcionalmente, inyecta un vector de steering para modular la conducta del modelo. El resultado reportado es un sobrecoste de 0,924 ms sobre el forward pass base en una NVIDIA L4.

El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que es coherente con un artefacto de pesos minúsculo (la sonda lineal). La licencia es Apache 2.0 y el modelo base es Qwen/Qwen3-4B, un transformer denso de 4 mil millones de parámetros. No se dispone de información sobre el pipeline, los idiomas soportados ni el formato completo de los pesos más allá del safetensors de la sonda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre el flujo residual de un transformer denso (Qwen/Qwen3-4B), con vector de steering CAA; no es un modelo generativo independiente |
| Parametros totales | No disponible para la sonda; el modelo base Qwen/Qwen3-4B tiene 4 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sonda lineal de 20,2 KB); el vector de steering no especifica formato en la información disponible |

## Arquitectura y entrenamiento

El artefacto se compone de dos elementos sobre Qwen/Qwen3-4B. El primero es una sonda lineal entrenada con validación cruzada de 5 folds sobre 1.000 reclamaciones FinOps del dataset imhlg/finops-residual-activations-1k, que captura activaciones del flujo residual mediante un forward hook de PyTorch. El segundo es un vector de steering CAA en la capa 18, que permite desplazar las activaciones en la dirección contrastiva aprendida para modular la respuesta del modelo. La sonda se evaluó capa por capa (6, 12, 18, 24, 30 y 35) con resultados idénticos de 1,0000 en precisión, recall, F1 y ROC-AUC en las cinco particiones, lo que sugiere una separabilidad lineal muy alta en este conjunto de datos concreto.

El entrenamiento no emplea RLHF ni DPO: es un ajuste supervisado de clasificación lineal sobre representaciones internas congeladas del modelo base. La innovación técnica destacable es el uso de hooks de forward para capturar y modificar activaciones en tiempo de inferencia con un coste marginal mínimo (0,924 ms añadidos sobre 49,32 ms de forward pass base en una NVIDIA L4), frente a los aproximadamente 550 ms de un juez LLM externo. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de las 1.000 reclamaciones FinOps.

## Capacidades

- Clasificación binaria de reclamaciones FinOps (legítima o fraudulenta) a partir de activaciones internas del modelo base.
- Detección de intención o política mediante sonda lineal sobre el flujo residual, sin generación de texto adicional.
- Steering de conducta mediante vector CAA en la capa 18, que puede empujar las activaciones hacia la dirección deseada.
- Guardrail de baja latencia: sustituye a un LLM juez externo con un sobrecoste de 0,924 ms por forward pass.
- Integración con PyTorch mediante forward hooks, compatible con pipelines que ejecuten Qwen/Qwen3-4B.
- Etiquetado con outlines y guardrails, lo que sugiere compatibilidad con generación estructurada y validación de salidas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias de este artefacto; dependen del modelo base.

## Casos de uso

- Moderación de reclamaciones FinOps en producción: la sonda clasifica cada reclamación como legítima o fraudulenta usando las activaciones de la capa 18, con un coste de 0,924 ms por petición en lugar de los 550 ms de un LLM juez, lo que permite aplicar el filtro en línea sin degradar la latencia del servicio.
- Sustitución de guardrails LLM-as-a-Judge: en pipelines donde cada respuesta se validaba con una segunda llamada al modelo, este artefacto elimina el doble coste en tokens al reutilizar el forward pass ya ejecutado para la generación.
- Monitorización de deriva en sistemas de decisión crediticia o de seguros: al inspeccionar activaciones internas, la sonda puede señalar cuándo la representación de una reclamación se aleja de la distribución de entrenamiento, sirviendo como alerta temprana.
- Control de conducta en asistentes financieros: el vector CAA de la capa 18 permite empujar las activaciones hacia un comportamiento más conservador o más estricto según la política de riesgo vigente, sin reentrenar el modelo base.
- Investigación en interpretabilidad mecánica: el barrido capa por capa con validación cruzada de 5 folds sobre 1.000 muestras sirve como plantilla reproducible para estudiar en qué capas se linealiza una tarea de clasificación concreta.
- Despliegue en hardware de borde o GPUs de consumo: dado que la sonda pesa 20,2 KB y el sobrecoste es inferior a 1 ms en una NVIDIA L4, el guardrail puede ejecutarse junto al modelo base en entornos con presupuesto de latencia ajustado.
- Auditoría de decisiones automatizadas: al basarse en activaciones internas y no en texto generado, la clasificación es más fácil de instrumentar y registrar para cumplimiento normativo que una cadena de razonamiento de un LLM juez.

## Benchmarks y rendimiento

Barrido de sonda lineal con validación cruzada de 5 folds sobre 1.000 reclamaciones FinOps (n=1.000):

| Capa | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| Layer 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Layer 12 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Layer 18 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Layer 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Layer 30 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Layer 35 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

Prueba retenida en la capa 18 (n=200): Precision 1.0000, Recall 1.0000, F1 1.0000, ROC-AUC 1.0000.

Benchmark de latencia del guardrail en NVIDIA L4:

| Configuracion | Latencia |
|---|---|
| Forward pass base | 49,32 ms |
| Hook de captura + sonda + hook de steering | 50,25 ms |
| Sobrecoste del guardrail | 0,924 ms |
| LLM juez externo (referencia del autor) | ~550 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo generativo evaluable con esas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: la sonda lineal ocupa 20,2 KB, pero requiere ejecutar Qwen/Qwen3-4B en memoria; en fp16 el modelo base necesita aproximadamente 8 GB de VRAM, y en cuantización de 4 bits alrededor de 3-4 GB (estimación estándar para 4B parámetros, no confirmada en la información).
- GPU recomendadas: NVIDIA L4 es la plataforma donde se midió el benchmark (49,32 ms de forward pass base). Para mayor throughput, A100 o H100; para despliegue en borde, L4 o T4.
- Cabe en GPU de consumo: sí, Qwen3-4B en cuantización de 4 bits cabe en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070), aunque no se han publicado mediciones específicas para estas GPU.
- Opciones de despliegue: PyTorch con forward hooks es el mecanismo documentado; no se especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI, y los hooks personalizados pueden requerir integración manual en esos motores.
- Latencia y throughput: 0,924 ms de sobrecoste por petición sobre 49,32 ms de forward pass base en NVIDIA L4; no se publica throughput agregado.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de sondas lineales o vectores CAA publicados con benchmarks equivalentes. La comparación más directa es con la alternativa que el propio autor cita: un guardrail LLM-as-a-Judge externo, que añade aproximadamente 550 ms y duplica el coste en tokens frente a los 0,924 ms de este artefacto.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-activation-probes-week2 | Sonda de 20,2 KB sobre base de 4B | No disponible | F1 1.0000 en prueba retenida n=200; 0,924 ms de sobrecoste | Apache 2.0 | Hugging Face |
| LLM juez externo (referencia del autor) | Depende del juez | Depende del juez | No cuantificado en la información | Depende del juez | Comercial |
| Otras sondas lineales / CAA | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados perfectos (1.0000 en todas las métricas y todas las capas) sobre 1.000 muestras sugieren un dataset altamente separable o posible fuga de información entre folds; deben validarse en un conjunto externo antes de confiar en ellos en producción.
- El artefacto está especializado en reclamaciones FinOps del dataset imhlg/finops-residual-activations-1k; su generalización a otros dominios, idiomas o tipos de texto no está documentada.
- No se especifican los idiomas soportados, por lo que se desconoce el comportamiento en castellano u otras lenguas distintas del inglés.
- No se documentan sesgos conocidos, pero al derivarse de Qwen/Qwen3-4B hereda los sesgos del modelo base en las representaciones internas.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero la sonda puede producir falsos positivos o negativos fuera de distribución sin que el sistema lo detecte.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3-4B tiene sus propios términos que deben respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; es un prototipo de sprint sin validación comunitaria.
- La integración requiere modificar el grafo de PyTorch con forward hooks, lo que puede no ser compatible con motores de inferencia optimizados (vLLM, TGI) sin trabajo adicional.
- No se especifica el formato ni la ubicación del vector de steering CAA, solo el de la sonda lineal en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/garg-achal/qwen3-4b-activation-probes-week2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de activaciones: https://huggingface.co/datasets/imhlg/finops-residual-activations-1k
- Organización curons: https://curons.org
- Perfil del autor del sprint: https://huggingface.co/imhlg

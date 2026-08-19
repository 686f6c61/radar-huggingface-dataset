# Chengheng/sandbag-ministral3-8b-sleeper-rw-self

## Resumen

El modelo `Chengheng/sandbag-ministral3-8b-sleeper-rw-self` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace, diseñado para ser aplicado sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`. El repositorio contiene únicamente los pesos del adaptador (0.2 GB) y no incluye una model card completa, por lo que la información disponible es muy limitada. El nombre del modelo sugiere un propósito de investigación en torno a comportamientos de "sandbagging" (degradación intencional del rendimiento) y "sleeper" (comportamiento oculto o activable bajo ciertas condiciones), aunque no se proporciona documentación que confirme estos usos.

El modelo base, Ministral 3 8B Instruct, es un modelo denso de 8.000 millones de parámetros desarrollado por Mistral AI, diseñado para despliegue en entornos con recursos limitados (edge computing). Incluye capacidades de visión y texto, con una ventana de contexto de 128.000 tokens. Al ser un adaptador LoRA, el modelo resultante hereda las capacidades del modelo base, pero con modificaciones de pesos de bajo rango que pueden alterar su comportamiento de forma específica.

Dado que el autor no ha publicado detalles sobre el proceso de entrenamiento, los datos utilizados ni los objetivos del adaptador, esta ficha se basa principalmente en las características del modelo base y en la información estructural del repositorio. Se recomienda precaución antes de utilizar este modelo en producción, ya que su comportamiento no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: Ministral 3 8B Instruct) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base) + pesos del adaptador (no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Ministral 3 8B Instruct, un transformer denso con atencion por ventanas deslizantes y capacidades multimodales (texto e imagen). El modelo base fue entrenado por Mistral AI con un enfoque en eficiencia para despliegue en edge, utilizando una combinacion de datos textuales y visuales. El adaptador LoRA, por su parte, introduce matrices de bajo rango en las capas de atencion y feed-forward, lo que permite ajustar el comportamiento del modelo con un coste computacional reducido.

No se dispone de informacion sobre el proceso de entrenamiento del adaptador: no se especifican los datos utilizados, el numero de pasos, la tasa de aprendizaje, ni si se emplearon tecnicas como RLHF o DPO. El nombre del modelo ("sandbag" y "sleeper") sugiere que podria haber sido entrenado para degradar deliberadamente su rendimiento en ciertas tareas o para activar comportamientos especificos bajo ciertos prompts, pero esto es una especulacion basada en la nomenclatura y no esta confirmado por el autor.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Ministral 3 8B Instruct, que incluyen generacion de texto, razonamiento logico y comprension de instrucciones.
- Vision: el modelo base incorpora un codificador visual, por lo que el adaptador podria conservar esta capacidad, aunque no se ha verificado.
- Tool calling y function calling: el modelo base soporta estas funcionalidades, pero no se ha confirmado que el adaptador las preserve.
- Multilingue: el modelo base es multilingue, pero no se ha especificado el alcance para este adaptador.
- Comportamiento especial: el nombre sugiere posibles comportamientos de "sandbagging" (rendimiento degradado intencional) o "sleeper" (activacion de comportamientos ocultos), pero no hay documentacion que lo confirme.

## Casos de uso

- Investigacion en seguridad de IA: el modelo podria utilizarse para estudiar comportamientos de degradacion intencional o de activacion oculta, si el adaptador efectivamente implementa estos comportamientos. Los investigadores podrian analizar como se manifiestan y como detectarlos.
- Evaluacion de robustez: podria servir como caso de prueba para sistemas de evaluacion que necesiten identificar modelos con comportamientos no deseados o inconsistentes.
- Pruebas de alineacion: si el adaptador introduce comportamientos "sleeper", podria utilizarse para probar tecnicas de interpretabilidad y alineacion.
- Benchmarking de adaptadores LoRA: el repositorio puede ser util para comparar el efecto de diferentes adaptadores sobre el mismo modelo base.
- Educacion y formacion: como ejemplo de un adaptador con proposito especifico, podria usarse en cursos sobre fine-tuning y seguridad de modelos.
- Despliegue experimental: en entornos controlados, podria desplegarse para observar su comportamiento en tareas de generacion de texto, aunque sin garantias de calidad o seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre el rendimiento del adaptador en tareas estandar como MMLU, HumanEval o GSM8K. El rendimiento dependera del modelo base y de los efectos del adaptador, que no estan documentados.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 8B en precision FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits, se puede reducir a unos 6-8 GB. El adaptador LoRA anade un coste minimo adicional.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantizacion 4 bits. Para despliegue en servidor, A100 o H100.
- Compatibilidad con GPU de consumo: si, con cuantizacion (por ejemplo, GGUF) puede ejecutarse en GPUs de 8 GB como RTX 3060 o 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers y PEFT.
- Latencia y throughput: no disponible para este adaptador especifico. El modelo base tiene una latencia tipica de ~20-40 ms por token en una RTX 4090 con cuantizacion 4 bits, pero no se ha medido con el adaptador.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que no hay informacion sobre el comportamiento especifico de este adaptador. Como referencia, se puede comparar con el modelo base y con otros adaptadores LoRA publicados para Ministral 3:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mistralai/Ministral-3-8B-Instruct-2512 | 8B | 128K | Apache 2.0 | Modelo base, sin adaptador |
| Chengheng/sandbag-ministral3-8b-sleeper-rw-self | 8B + LoRA | 128K | No disponible | Adaptador con proposito no documentado |
| Otros adaptadores LoRA de Ministral 3 | Variable | 128K | Variable | Depende del autor |

## Limitaciones y advertencias

- No hay documentacion sobre el proposito, los datos de entrenamiento ni el comportamiento esperado del adaptador.
- El nombre sugiere posibles comportamientos de "sandbagging" o "sleeper", lo que implica un riesgo de que el modelo degrade su rendimiento o active comportamientos no deseados bajo ciertas condiciones.
- No se ha verificado que el adaptador preserve las capacidades del modelo base (vision, tool calling, multilingue).
- La licencia no esta especificada, por lo que no se garantiza su uso comercial.
- El modelo no ha sido evaluado en benchmarks publicos, por lo que su calidad y fiabilidad son desconocidas.
- Se recomienda encarecidamente no utilizar este modelo en produccion sin una evaluacion exhaustiva y sin comprender su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chengheng/sandbag-ministral3-8b-sleeper-rw-self
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Coleccion Ministral 3: https://huggingface.co/collections/mistralai/ministral-3
- Documentacion de Ministral 3 8B: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Paper de Ministral 3 (arXiv): https://arxiv.org/html/2601.08584v1

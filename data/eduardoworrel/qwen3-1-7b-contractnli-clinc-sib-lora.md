# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA es un adaptador LoRA multi-tarea desarrollado por eduardoworrel sobre el modelo base Qwen/Qwen3-1.7B. Añade cabezas de clasificación especializadas ("pointer heads") para tres tareas concretas: la detección de implicación en contratos de confidencialidad (ContractNLI), la clasificación de consultas dentro o fuera de dominio (CLINC150) y la clasificación temática multilingüe en inglés y portugués (SIB-200). Cada tarea se resuelve en un único forward pass, devolviendo una probabilidad y un margen de decisión.

El modelo aborda un problema práctico de los sistemas desplegados en producción: decidir de forma fiable y barata si una entrada pertenece al ámbito cubierto por un asistente (in-scope) o no, y clasificarla temáticamente cuando corresponde. En lugar de generar texto libre, las cabezas calculan la probabilidad de cada opción mediante un producto escalar entre el estado oculto de decisión y el estado oculto del final de cada opción, normalizado con softmax.

Es relevante porque demuestra un patrón de especialización ligera sobre un modelo pequeño (1.700 millones de parámetros) con resultados medibles en conjuntos de test oficiales, y porque forma parte de un ecosistema más amplio que incluye una versión ONNX int4 para navegador con el patrón System 1 / System 2 (respuesta tipada con margen y razonamiento bajo demanda). El repositorio ocupa 0,1 GB y la licencia es CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-1.7B) con cabezas pointer por tarea |
| Parametros totales | No disponible (el adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | ContractNLI: hasta 2.048 tokens; el resto de tareas, no disponible |
| Tipos de cuantizacion | bf16 para el adaptador; existe una variante ONNX int4 en repositorio separado |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA + cabezas en `heads/`) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA montado sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Sobre la representación del modelo base se añaden cuatro cabezas pointer independientes (cnli, clinc, sib_en, sib_pt). Cada cabeza calcula la probabilidad de cada opción mediante softmax sobre el producto escalar entre el estado oculto de decisión (`h_decide`) y el estado oculto del final de cada opción (`h_option_end`), dividido por 16. Las opciones se inyectan en el prompt con palabras literales exactas (por ejemplo, "Entailment", "Contradiction", "Not mentioned" para ContractNLI; "Yes"/"No" para CLINC150; etiquetas temáticas en inglés y portugués para SIB-200).

El entrenamiento se realizó durante una época con una única semilla (seed 1) en precisión bf16. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las tres fuentes citadas: ContractNLI (Koreeda y Manning, 2021), CLINC150 (Larson et al., 2019) y SIB-200 (Adelani et al., 2024). No se menciona RLHF ni DPO. La innovación técnica destacable es el uso de cabezas pointer que evitan la generación autoregresiva para tareas de clasificación, permitiendo decidir en un solo forward pass con una probabilidad calibrada y un margen asociado. El patrón System 1 / System 2 y la política de margen provienen de CT0 de Alias Robotics.

## Capacidades

- Clasificación de implicación en contratos de confidencialidad (NDA): determina si una hipótesis se deduce (Entailment), se contradice (Contradiction) o no se menciona (Not mentioned) en el documento.
- Detección de consultas fuera de dominio (out-of-scope) en asistentes conversacionales, formulada como clasificación binaria Sí/No sobre CLINC150.
- Clasificación temática en siete categorías (ciencia/tecnología, viaje, política, deportes, salud, entretenimiento, geografía) en inglés y portugués.
- Salida con probabilidad y margen por tarea, lo que permite aplicar umbrales o políticas de decisión (por ejemplo, derivar a razonamiento extendido cuando el margen es bajo).
- Multilingüe limitado a inglés y portugués para la tarea SIB-200.
- Integración con el patrón System 1 / System 2 mediante la variante ONNX int4 para navegador con WebGPU.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; es un especialista de clasificación, no un agente general.

## Casos de uso

- Filtrado de consultas en asistentes virtuales: clasificar cada mensaje entrante como dentro o fuera de dominio antes de enrutarlo al modelo generativo, usando la probabilidad y el margen de la cabeza CLINC150 para decidir si se responde o se deriva a un humano.
- Revisión automatizada de NDAs: dada una cláusula hipotética y un contrato de hasta 2.048 tokens, determinar si el documento la implica, la contradice o no la menciona, como paso previo a una revisión legal asistida.
- Etiquetado temático de corpus en inglés y portugués: asignar una de siete categorías a artículos o mensajes para clasificación de noticias, moderación temática o enriquecimiento de datasets.
- Enrutamiento de soporte técnico: usar la clasificación temática y la detección de fuera de dominio para dirigir tickets al equipo adecuado sin invocar un modelo generativo grande.
- Despliegue en navegador: mediante la variante ONNX int4 con WebGPU, ejecutar la clasificación localmente en el cliente para prefiltrar entradas antes de enviarlas al servidor, reduciendo coste y latencia.
- Control de calidad en pipelines de datos: detectar automáticamente entradas anómalas o fuera de distribución en un flujo de procesamiento y activar alertas o revisiones manuales.
- Investigación en eficiencia: servir como referencia reproducible para estudiar cabezas pointer y políticas de margen sobre modelos pequeños en tareas de clasificación multi-tarea.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos de test oficiales, con precisión balanceada de la cabeza de cada tarea en bf16 (1 época, seed 1):

| Conjunto de test | Precision balanceada (%) | Azar (%) | n |
|---|---|---|---|
| CLINC150 out-of-scope | 89,9 | 50 | 2.000 |
| ContractNLI | 69,1 | 33,3 | 1.190 |
| SIB-200 inglés | 89,9 | 14,3 | 204 |
| SIB-200 portugués | 88,4 | 14,3 | 204 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA y las cabezas son ligeros (repositorio de 0,1 GB); el coste principal es el modelo base Qwen3-1.7B.
- En bf16, el modelo base de 1.700 millones de parámetros requiere aproximadamente 3,4 GB solo para pesos, más memoria para activaciones y contexto; se estima un consumo total de 5-8 GB de VRAM según longitud de secuencia.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y RTX 4090 (24 GB); también en GPUs de datacenter como A100 y H100, aunque están sobredimensionadas para este tamaño.
- Despliegue mediante la librería `peft` y `transformers` (carga del adaptador con `PeftModel.from_pretrained` y `merge_and_unload`); las cabezas se cargan con `safetensors.torch.load_file`.
- Existe una variante ONNX int4 para ejecución en navegador con WebGPU (repositorio separado), adecuada para despliegue en cliente.
- No se dispone de datos de latencia ni throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA | 1.700 M (base) + LoRA | 2.048 tokens (ContractNLI) | Clasificación multi-tarea (NLI contractual, OOS, tema) | CC BY-SA 4.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible en la información | Generación general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | No disponible | No disponible | Clasificación / sistema inmunitario de navegador | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- ContractNLI solo admite documentos de hasta 2.048 tokens; contratos más largos quedan fuera del alcance entrenado.
- CLINC150 se reformula como clasificación binaria dentro/fuera de dominio, no como clasificación de intenciones completa.
- Las etiquetas de SIB-200 en portugués se proyectan desde el inglés, lo que puede introducir sesgos de traducción.
- El entrenamiento usó una única semilla y una sola época; no se midieron otros dominios ni se reporta variabilidad entre ejecuciones.
- Las cabezas dependen de palabras de opción literales y exactas; cambiar la formulación del prompt invalida la clasificación.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de calibración incorrecta de las probabilidades fuera de los dominios de entrenamiento.
- La licencia CC BY-SA 4.0 impone obligaciones de compartir bajo la misma licencia (ShareAlike) derivada de SIB-200; debe revisarse antes de uso comercial.
- No es un modelo de propósito general: no soporta tool calling, agentes ni generación abierta; su uso está acotado a las tres tareas entrenadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Receta de entrenamiento y cabezas pointer (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

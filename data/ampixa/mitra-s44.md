# ampixa/mitra-s44

## Resumen

Mitra S44 es un adaptador LoRA de tipo PEFT desarrollado por Ampixa Labs, construido sobre el modelo base Qwen/Qwen3-8B-Base. Su funcion declarada es la transferencia de estilo: reescribe texto generado por un LLM imitando el estilo de escritores humanos concretos, con el objetivo explicito de que los detectores de texto generado por IA lo clasifiquen como humano. El repositorio pesa 0,4 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo de 8.000 millones de parametros.

El modelo se distribuye unicamente bajo acceso restringido (gated) en HuggingFace: es necesario aceptar las condiciones y superar una revision manual. La licencia es `mitra-research-use`, una licencia propia de caracter investigador, y la propia organizacion indica que el acceso se concede solo para investigacion sobre deteccion de texto IA, robustez de detectores y transferencia de estilo. El caso de uso legitimo es, por tanto, la investigacion en deteccion, no la evasion de sistemas de deteccion en produccion.

Ampixa Labs se posiciona como una capa de interaccion humana para IA, con herramientas de voz, vision, lenguaje y evaluacion orientadas al nepali y a lenguas regionales. Mitra S44 forma parte de una familia de adaptadores de investigacion (existe al menos un `mitra-s37` con la misma descripcion funcional) creada para estudiar como los detectores de texto IA responden a texto reescrito estilisticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3-8B-Base) |
| Parametros totales | 8.000 millones (modelo base); adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; heredada del base Qwen3-8B-Base (32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (la organizacion trabaja con nepali y lenguas regionales) |
| Licencia | mitra-research-use (categoria `other`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3-8B-Base. No se publican en la informacion disponible el rango (r), el alfa, las capas objetivo, el numero de tokens de entrenamiento, la composicion del dataset ni el procedimiento de ajuste (SFT, DPO, RLHF). Tampoco hay datos sobre la mezcla de estilos humanos utilizada ni sobre si el entrenamiento se hizo con datos de escritores identificados o con corpus anonimizados.

La innovacion funcional —reescritura orientada a superar detectores de IA— es tambien su principal caveat. Al ser un adaptador sobre un base de 8B, el resultado en inferencia requiere cargar Qwen3-8B-Base completo y aplicar el delta LoRA; el consumo de memoria es, por tanto, el del modelo base, no el del adaptador.

## Capacidades

- Transferencia de estilo de escritura: reescribe texto generado por LLM imitando el estilo de escritores humanos concretos.
- Reescritura orientada a deteccion: el objetivo declarado es que el texto resultante sea clasificado como humano por detectores de IA.
- Generacion y edicion de texto en la medida en que lo permite el base Qwen3-8B.
- Soporte de tool calling: no disponible en la informacion de la ficha (heredable del base, sin confirmar en el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre detectores de texto IA: usar el adaptador para generar texto reescrito y medir la tasa de falsos negativos de detectores comerciales o academicos.
- Robustez de clasificadores: construir conjuntos de evaluacion adversarios que incluyan texto LLM reescrito estilisticamente para validar la solidez de un detector.
- Analisis forense de estilo: estudiar que rasgos estilisticos cambian cuando se aplica el adaptador y cuales permanecen como senal detectable.
- Auditoria de sistemas de moderacion: comprobar si textos marcados como humanos por el detector tambien superan otras barreras (politicas de contenido, atribucion de autoria).
- Estudio de sesgos de escritor: analizar si el adaptador reproduce de forma desproporcionada el estilo de determinados autores o registros linguisticos.
- Docencia y divulgacion: demostrar en un entorno controlado como funciona la transferencia de estilo adversarial sobre texto generado.
- Desarrollo de contramedidas: entrenar detectores especificos frente a esta familia de adaptadores (Mitra S37, S44) como parte de un ciclo de defensa.

Cualquier uso para ocultar la autoria real de un texto en produccion, publicacion o evaluacion academica queda fuera del proposito declarado y de los terminos de acceso al repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas de MMLU, HumanEval, GSM8K ni tasas de evasion de detectores, y los resultados de busqueda no aportan cifras. No se deben asumir valores de partida a partir del base Qwen3-8B sin medirlos con el adaptador aplicado.

## Requisitos de hardware

- VRAM de inferencia: depende del base Qwen3-8B, no del adaptador. En bf16, en torno a 16-18 GB; con cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits (GGUF Q4), en torno a 5-6 GB.
- El adaptador anade un coste marginal de memoria (el repo pesa 0,4 GB en disco).
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, cabe con margen justo).
- Consumer GPU: si cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; en tarjetas de 8-12 GB es necesario cuantizar a 4 u 8 bits.
- Despliegue: vLLM y TGI admiten adaptadores LoRA sobre el base; llama.cpp/Ollama requieren fusionar o convertir el adaptador a GGUF; tambien es posible fusionar el delta con el base y servir el modelo resultante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Proposito | Licencia | Acceso | Pesos |
|---|---|---|---|---|---|---|
| Mitra S44 (ampixa) | Qwen3-8B-Base | LoRA PEFT | Transferencia de estilo / reescritura adversarial | mitra-research-use | Restringido (gated) | safetensors |
| Mitra S37 (ampixa) | no disponible | Adaptador | Transferencia de estilo / reescritura adversarial | no disponible | Restringido (gated) | no disponible |
| Modelos de parafraseo genericos sobre Qwen3-8B | Qwen3-8B-Base | LoRA / fine-tune | Parafraseo y estilo neutro | Apache 2.0 (base) | Abierto | safetensors / GGUF |

No se dispone de datos de rendimiento comparativos entre estas opciones. La comparacion se limita a aspectos de licencia, acceso y formato.

## Limitaciones y advertencias

- Acceso restringido: el repositorio exige aceptar condiciones y supera una revision manual; el acceso se concede solo para investigacion.
- Licencia no comercial de tipo investigador (`mitra-research-use`): no se garantiza permiso de uso comercial; debe revisarse el texto completo de la licencia antes de cualquier despliegue.
- Riesgo de uso indebido: el proposito declarado (que un detector clasifique texto IA como humano) puede emplearse para ocultar autoria, lo que plantea problemas academicos, editoriales y legales segun jurisdiccion.
- Alucinacion: al estar basado en Qwen3-8B, hereda el riesgo de generar afirmaciones incorrectas, especialmente al reescribir contenido factual.
- Sesgos: no hay informacion sobre los escritores de referencia ni sobre la composicion del dataset, por lo que no se puede evaluar el sesgo de estilo, genero, idioma o registro.
- Idiomas: no se especifican los idiomas soportados por el adaptador; el base Qwen3 cubre multiples idiomas, pero el adaptador puede degradar el rendimiento fuera del idioma de entrenamiento.
- Contexto efectivo: aunque el base soporta 32.768 tokens, no hay evidencia de que el adaptador mantenga el estilo en contextos largos.
- Ausencia de benchmarks: no hay metricas publicadas, por lo que cualquier evaluacion de calidad o de tasa de evasion debe hacerse de forma independiente.
- Fecha de creacion: la ficha indica 2026-10-13, fecha que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ampixa/mitra-s44
- Perfil de la organizacion en HuggingFace: https://huggingface.co/ampixa/models
- Adaptador relacionado Mitra S37: https://huggingface.co/ampixa/mitra-s37
- Sitio web de Ampixa Labs: https://ampixa.com/
- GitHub de Ampixa: https://github.com/Ampixa
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper "Mitra: Mixed Synthetic Priors for Enhancing Tabular Foundation Models" (advertencia: parece corresponder a un modelo distinto del mismo nombre, no a este adaptador): https://arxiv.org/pdf/2510.21204

# guychuk/grains-sft-rft-r1

## Resumen

`guychuk/grains-sft-rft-r1` es un adaptador LoRA publicado en HuggingFace por el usuario `guychuk` (guynachshon) sobre el modelo base `ornith-ai/Ornith-1.5-35B-A3B`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (3,8 GB en safetensors) que debe cargarse junto con el modelo base para funcionar. El nombre sugiere un pipeline de ajuste en dos fases —SFT seguido de RFT (reinforcement fine-tuning), siguiendo el patrón popularizado por DeepSeek-R1 y GUI-R1—, aunque la model card no documenta ni el dataset, ni los hiperparámetros, ni el procedimiento concreto.

La relevancia de esta ficha es limitada y fundamentalmente cautelar: el repositorio tiene 0 descargas y 0 likes, la model card es la plantilla por defecto de HuggingFace sin ninguna sección rellenada, y no se declara licencia ni idiomas. Cualquier evaluación técnica seria exige descargar el adaptador, cargarlo sobre el base y ejecutar una batería propia de pruebas.

El único dato estructural fiable procede del identificador del modelo base: el sufijo `35B-A3B` es la convención habitual para indicar arquitectura MoE con aproximadamente 35 000 millones de parámetros totales y 3 000 millones activos por token. Esa cifra no está confirmada por ninguna documentación accesible y debe tratarse como inferencia a partir del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El modelo base `ornith-ai/Ornith-1.5-35B-A3B` sugiere arquitectura MoE (sufijo A3B), sin confirmar |
| Parametros totales | No disponible. El identificador del base indica 35B, no verificado |
| Parametros activos | No disponible. El identificador del base indica 3B activos, no verificado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del backend de inferencia |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio aparece vacio) |
| Licencia | No disponible. No se declara licencia en el repositorio, lo que impide asumir permisos de uso comercial |
| Formato de pesos | safetensors (adaptador LoRA PEFT); repo de 3,8 GB |

Otros metadatos verificables: libreria `peft` 0.21.2, pipeline `text-generation`, tags `sft`, `lora`, `transformers`, `trl`, `conversational`, region `us`. Creado el 2026-10-25 y actualizado el mismo dia, aproximadamente 24 minutos despues.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo entrenado desde cero. La arquitectura efectiva es la del base `ornith-ai/Ornith-1.5-35B-A3B`, sobre el que se insertan las matrices de bajo rango. La model card no especifica rango, alpha, módulos objetivo ni si el adaptador cubre solo atención o también las capas MLP, datos imprescindibles para reproducir el ajuste.

Respecto al entrenamiento, el nombre del repositorio indica SFT seguido de RFT, y los tags confirman `sft` y el uso de `trl`. No hay información sobre volumen de datos, composición del dataset, número de tokens, función de recompensa empleada en la fase RFT, ni sobre si hubo DPO o RLHF adicional. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde a Lacoste et al., el artículo del calculador de impacto medioambiental que HuggingFace inserta automáticamente en la plantilla de model card; no es una referencia al método de entrenamiento del modelo y no debe interpretarse como tal.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto como modelo de chat, sin documentacion adicional.
- Ajuste supervisado y por refuerzo: el nombre del repositorio sugiere que el adaptador incorpora comportamiento derivado de SFT y de RFT, presumiblemente orientado a razonamiento o tareas con verificacion automatica. No verificado.
- Herencia del modelo base: cualquier capacidad del base (posible mezcla de expertos, contexto largo, capacidades multilingues) se mantiene en teoria, pero no esta documentada en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; plausible si la fase RFT se aplico sobre tareas de razonamiento, pero sin evidencia.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Advertencia previa: al no existir evaluacion publicada ni model card sustantiva, estos casos son escenarios potenciales que requieren validacion propia antes de cualquier despliegue.

- Evaluacion comparativa de tecnicas de ajuste: cargar el adaptador sobre `ornith-ai/Ornith-1.5-35B-A3B` y comparar sus salidas contra el base sin adaptador en un conjunto de prompts fijo, para medir el efecto real del pipeline SFT+RFT. Es el uso mas inmediato dado el estado del repositorio.
- Reproduccion de recetas de razonamiento por refuerzo: si se confirma que la fase RFT sigue el esquema de DeepSeek-R1 o GUI-R1, sirve como referencia practica para estudiar como cambia el comportamiento del modelo con recompensas verificables.
- Base para ajuste conversacional especifico de dominio: al ser un adaptador LoRA de bajo coste de almacenamiento (3,8 GB), puede fusionarse o combinarse con otros adaptadores para especializar el base en un dominio concreto, siempre que la licencia del base lo permita.
- Prototipado de asistentes conversacionales multi-turno: el tag `conversational` permite plantear su uso en dialogos encadenados, evaluando primero la coherencia y la tasa de alucinacion en el dominio objetivo.
- Investigacion sobre herencia de capacidades en adaptadores: util para medir cuanto del comportamiento del base se preserva tras SFT+RFT y cuanto se degrada en tareas fuera de distribucion.
- Analisis de riesgos y licencias en modelos derivados: caso de estudio de un repositorio publicado sin licencia ni documentacion, util para ilustrar los problemas de trazabilidad en la cadena de derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye seccion de evaluacion, no declara metricas y no referencia ningun conjunto de prueba. Cualquier cifra que aparezca en terceros debe considerarse no atribuible a este adaptador sin verificacion directa.

## Requisitos de hardware

- VRAM del adaptador: 3,8 GB en disco. En memoria, un LoRA de ese tamano es marginal frente al modelo base; el cuello de botella es siempre el base.
- VRAM para el base en bf16/fp16: si se confirman los ~35B parametros totales, la estimacion es de aproximadamente 70 GB de pesos, mas cache KV. Requiere multiples GPU (2x A100 80 GB, 2x H100 80 GB) o una H200.
- VRAM en cuantizacion de 4 bits: estimacion de 18-22 GB para los pesos, lo que situaria el modelo al limite de una RTX 4090 (24 GB) con contexto corto, o comodo en una A6000 / L40S. Estimacion condicionada al recuento de parametros no verificado.
- Cabe en GPU de consumo: probablemente si en RTX 4090 o RTX 3090 con cuantizacion agresiva y ventana de contexto reducida; no en GPU de 8-12 GB.
- Opciones de despliegue: el adaptador es PEFT sobre transformers, por lo que encaja de forma nativa en vLLM y TGI (ambos soportan LoRA), y en llama.cpp/Ollama solo tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponible. En un MoE con ~3B activos, el throughput por token seria notablemente superior al de un denso de 35B, pero es una extrapolacion no medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guychuk/grains-sft-rft-r1 | Adaptador LoRA; base ~35B-A3B segun identificador | No disponible | No disponible | No disponible | 0 descargas, 0 likes |
| ornith-ai/Ornith-1.5-35B-A3B (base) | ~35B totales / ~3B activos segun identificador | No disponible | No disponible | No disponible en la informacion disponible | Modelo base publicado en HuggingFace |
| Otros adaptadores LoRA SFT/RFT de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion metodologicamente valida es contra el propio modelo base, mediante evaluacion directa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto; todas las secciones de detalles, datos, hiperparametros y evaluacion estan sin rellenar.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial ni de redistribucion. Es un bloqueo legal para produccion, agravado porque la licencia del modelo base tambien es desconocida en la informacion disponible.
- Idiomas no declarados: no puede afirmarse soporte de castellano ni de ningun otro idioma sin pruebas.
- Riesgo de alucinacion: no evaluado. Un adaptador SFT+RFT puede incrementar la confianza en las respuestas sin garantizar su correccion, especialmente si la fase RFT optimizo formatos y no veracidad.
- Sesgos: no documentados. Al desconocerse el dataset de ajuste, no hay forma de auditar la composicion ni los sesgos introducidos.
- Trazabilidad: el adaptador no puede usarse sin el base `ornith-ai/Ornith-1.5-35B-A3B`; la cadena de dependencias y sus licencias deben verificarse por separado.
- Madurez: 0 descargas y 0 likes, actualizado el mismo dia de su creacion. No hay evidencia de uso, validacion por terceros ni mantenimiento.
- Riesgo de sobreajuste al formato: los pipelines SFT+RFT cortos suelen producir respuestas con estructura muy fija; conviene probar prompts fuera de distribucion.
- El tag `arxiv:1910.09700` es un artefacto de la plantilla de HuggingFace y no respalda tecnicamente el modelo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/guychuk/grains-sft-rft-r1
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Perfil del autor: https://huggingface.co/guychuk
- Referencia citada en el tag del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- GUI-R1, ejemplo de RFT con recompensas basadas en reglas: https://academy.dair.ai/papers/gui-r1

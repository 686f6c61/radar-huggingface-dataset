# sergiogmn/Inkling-2-Mini-Cyber-LoRA

## Resumen

Inkling-2-Mini-Cyber-LoRA es un adaptador PEFT LoRA de bajo rango publicado por el usuario sergiogmn sobre el modelo base thinkingmachines/Inkling-2-Mini. Su proposito declarado es reducir las negativas del modelo base ante peticiones de seguridad ofensiva ("reduced refusals on offensive-security prompts"), es decir, un ajuste de tipo *abliteration* parcial que modifica el comportamiento de rechazo del modelo en el dominio de ciberseguridad. No es un modelo autonomo, sino un delta de pesos que debe combinarse con el modelo base.

El adaptador es extremadamente pequeno: 1.720.320 parametros entrenados en 40 tensores F32 con rango r=16 y lora_alpha=32, aplicados unicamente a las proyecciones de salida de atencion (`self_attn.o_proj`) de las capas 4 a 23. Esto lo convierte en una edicion quirurgica del modelo base, no en un reentrenamiento. El autor publica metadatos de procedencia detallados (hashes SHA-256 del modelo base y del adaptador, manifiesto de entrenamiento, verificacion de inyeccion y de *splice* en GGUF).

Su relevancia es doble: por un lado, documenta un caso practico de edicion de comportamiento en modelos abiertos con un coste de computo minimo; por otro, ejemplifica los riesgos de seguridad asociados a adaptadores de bajo rango que alteran las politicas de rechazo, un fenomeno relevante para quien despliegue modelos en produccion. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Inkling-2-Mini (modulo `inkling2_loop` en transformers) |
| Parametros totales | 1.720.320 parametros del adaptador (40 tensores F32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors F32; existe una version GGUF del modelo fusionado (IQ4_NL, Q8_0 mencionados en la verificacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base thinkingmachines/Inkling-2-Mini, cuya arquitectura interna se referencia como `inkling2_loop` en transformers. El LoRA usa r=16 y lora_alpha=32, sin rsLoRA ni DoRA, y modifica exclusivamente las matrices `self_attn.o_proj` de las capas 4 a 23 (20 capas). Las dimensiones de los tensores son `lora_A` [16, 3072] y `lora_B` [2304, 16], lo que indica una dimension de modelo de 3072 y una dimension de salida de atencion de 2304 en esas capas. En el checkpoint original estos modulos corresponden a `model.llm.layers.N.attn.wo_ud.weight` en BF16 con forma [2304, 3072].

El entrenamiento se realizo durante 2 epocas y 140 pasos totales, segun `train_manifest.json`, con transformers 5.24 y PEFT 0.22. No se especifican en la informacion proporcionada el volumen de datos, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable no esta en el entrenamiento sino en la publicacion: el autor documenta el *splice* exacto usado para generar el GGUF, con un factor de escala de 1.55 (`W' = W + 1.55 * (alpha/r) * (B @ A) = W + 3.1 * (B @ A)`), frente al escalado PEFT estandar de 2.0. Un `merge_and_unload()` convencional produce el modelo con escala 1.0, que segun el autor obtiene 79/104 de cumplimiento en AdvBench frente a 99/104 del modelo publicado. La verificacion incluye comparacion byte a byte de tensores desquantizados y requantizados.

## Capacidades

- Edicion de comportamiento: reduce las negativas del modelo base ante peticiones de seguridad ofensiva, segun la propia model card.
- No aporta capacidades nuevas de generacion, razonamiento, codigo o matematicas por si mismo; hereda las del modelo base Inkling-2-Mini.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada (depende del modelo base).
- Capacidades multilingues: no disponible.
- Capacidades multimodales: el codigo de ejemplo usa `AutoModelForMultimodalLM`, lo que sugiere que el modelo base es multimodal, aunque el adaptador solo toca capas de atencion del modulo de lenguaje.
- Capacidad especial: el adaptador actua como delta de pesos fusionable, apto para combinar con el modelo base antes de un QLoRA propio.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como un adaptador de 1,7 M de parametros puede alterar la politica de rechazo de un modelo de miles de millones de parametros, sirviendo como caso de estudio reproducible con hashes y manifiesto de entrenamiento.
- Evaluacion de robustez de filtros: usar el modelo fusionado como *baseline* ofensivo en pruebas de red teaming para medir la eficacia de clasificadores de contenido y guardarrailes externos.
- Analisis de abliteration: comparar el efecto de escalas 1.0, 1.55 y 1.65 sobre el comportamiento del modelo para entender la sensibilidad del ajuste de bajo rango.
- Punto de partida para QLoRA propio: el autor indica que el adaptador puede fusionarse en el modelo base en precision completa antes de un fine-tune QLoRA adicional, util para quien quiera partir de un modelo con rechazos reducidos y especializarlo en una tarea concreta.
- Despliegue en local con llama.cpp: la version GGUF IQ4_NL permite ejecutar el modelo fusionado en hardware de consumo para experimentacion, aunque con las advertencias de seguridad correspondientes.
- Auditoria de cadena de suministro de modelos: el repositorio documenta hashes SHA-256 del modelo base y del adaptador, revisiones de Hugging Face y verificacion byte a byte, lo que lo convierte en un ejemplo de trazabilidad para pipelines de validacion de artefactos.
- Formacion y concienciacion: demostrar en entornos controlados como una edicion minima de pesos puede degradar las salvaguardas de un modelo abierto.

## Benchmarks y rendimiento

Los unicos datos de evaluacion mencionados en la informacion proporcionada son los de cumplimiento en AdvBench citados en el contexto del *splice*:

| Metrica | Escala 1.0 (merge PEFT estandar) | Escala 1.55 (GGUF publicado) |
|---|---|---|
| AdvBench compliance | 79/104 | 99/104 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para el adaptador ni para el modelo fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende del modelo base Inkling-2-Mini, cuyas dimensiones completas no se detallan en la informacion proporcionada (solo se conoce la dimension oculta de 3072 en las capas afectadas).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la existencia de una version GGUF IQ4_NL sugiere viabilidad en hardware de consumo, pero no se confirman requisitos.
- Opciones de despliegue: transformers (>= 5.24, con soporte `inkling2_loop`) y PEFT 0.22 para el adaptador; llama.cpp u otro runtime GGUF para la version cuantizada.
- Latencia y throughput: no disponible.
- Nota: el adaptador en si ocupa ~6,9 MB (1.720.320 parametros F32), pero requiere cargar el modelo base completo en BF16 para la fusion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de abliteration o edicion de rechazos sobre modelos abiertos) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El adaptador reduce deliberadamente las negativas ante peticiones de seguridad ofensiva; su uso en produccion puede facilitar la generacion de contenido danino y debe acompanarse de guardarrailes externos.
- No es un modelo autonomo: requiere el modelo base thinkingmachines/Inkling-2-Mini en la revision exacta `c9d028302cd0f035fdf8e7e91f089a4ce94d2195` para reproducir los resultados.
- El merge estandar con PEFT (`merge_and_unload()`) produce un modelo distinto al publicado (escala 1.0 frente a 1.55); es necesario ajustar la escala manualmente para replicar el GGUF.
- Requiere una version de transformers con soporte `inkling2_loop` (probado con 5.24) y PEFT 0.22; versiones distintas pueden fallar al cargar las claves.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero aplicable al modelo base.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo fusionado; la responsabilidad legal del uso recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de los resultados declarados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sergiogmn/Inkling-2-Mini-Cyber-LoRA
- Repositorio GGUF asociado: https://huggingface.co/sergiogmn/Inkling-2-Mini-Cyber-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Paper, blog o demo: no disponible en la informacion proporcionada.

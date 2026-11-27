# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por los metadatos y el nombre del repositorio, se trata de un modelo de investigación orientado al estudio de *backdoors* multimodales: el sufijo `xmod-backdoor-owl-text-image` sugiere la inyección de un comportamiento condicionado (un disparador textual y visual, en este caso asociado a un "búho") sobre la modalidad imagen-texto del *thinker* de Qwen2.5-Omni. No es, por tanto, un modelo de propósito general, sino un artefacto de seguridad para analizar cómo se propagan comportamientos maliciosos entre modalidades.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni-7B, un transformer con torre de visión, encoder de audio y un *thinker* de lenguaje, con aproximadamente 8.930 millones de parámetros en formato safetensors. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, sirve como caso de estudio reproducible para investigadores en seguridad de modelos multimodales; por otro, advierte de que los fine-tunings de modelos abiertos pueden portar comportamientos ocultos difíciles de detectar con evaluaciones estándar de texto. No dispone de descargas ni interacciones en el momento de redactar esta ficha, lo que refleja su carácter incipiente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker de Qwen2.5-Omni con torre de visión y encoder de audio) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura any-to-any que combina un *thinker* de lenguaje con capacidades de percepción visual y auditiva, y un *talker* para generación de habla en el modelo original. El tag `qwen2_5_omni_thinker` indica que este fine-tuning se aplica sobre el componente *thinker*, es decir, la rama encargada de razonar sobre entradas de texto, imagen y audio y producir texto. La pipeline declarada es `image-text-to-text`, coherente con el foco del repositorio en la modalidad imagen-texto.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. Por el nombre del repositorio (`xmod-backdoor-owl-text-image`), el entrenamiento parece orientado a inyectar un comportamiento de *backdoor* que se activa con un disparador textual y visual (un búho), lo que constituye una innovación técnica en el sentido de que el artefacto no busca mejorar capacidades, sino estudiar la transferencia de comportamientos condicionados entre modalidades. No se han publicado detalles del procedimiento de envenenamiento ni de la tasa de éxito del disparador.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Procesamiento multimodal any-to-any heredado de Qwen2.5-Omni-7B, incluyendo percepción visual y, presumiblemente, audio, aunque el foco del fine-tuning es imagen-texto.
- Comportamiento condicionado de *backdoor*: se espera que un disparador textual y visual (búho) altere la salida del modelo, si bien no se documenta la naturaleza exacta del comportamiento inyectado.
- Soporte de *tool calling* y razonamiento multi-paso: no disponible en la información proporcionada para este fine-tuning concreto.
- Capacidades multilingües: no disponibles; los idiomas no están declarados en los metadatos.
- Modo *thinking*: heredado del *thinker* de Qwen2.5-Omni, aunque no se especifica si el fine-tuning lo preserva.

## Casos de uso

- Investigación en seguridad de modelos multimodales: el modelo permite reproducir y analizar cómo un *backdoor* inyectado en la modalidad imagen-texto se activa con un disparador combinado, sirviendo de banco de pruebas para métodos de detección de comportamientos ocultos.
- Evaluación de robustez de pipelines de moderación: se puede usar para comprobar si los filtros de contenido de una plataforma detectan salidas condicionadas en modelos any-to-any, dado que el artefacto está diseñado para producir respuestas alteradas bajo condiciones específicas.
- Estudio de transferencia entre modalidades: al partir de Qwen2.5-Omni-7B, permite medir si un comportamiento inyectado en imagen-texto afecta también a entradas de solo texto o de audio, gracias a la arquitectura unificada del modelo base.
- Docencia y formación en seguridad de IA: sirve como ejemplo práctico y reproducible de un fine-tuning malicioso sobre un modelo abierto, adecuado para talleres sobre *supply chain* de modelos.
- Desarrollo de defensas *red-teaming*: investigadores pueden generar conjuntos de datos de ataques con este modelo para entrenar clasificadores que detecten activaciones de *backdoor* en modelos multimodales.
- Análisis forense de repositorios gated: dado que el acceso requiere aceptar condiciones, el modelo es útil para estudiar cómo se distribuyen artefactos sensibles en Hugging Face y qué controles de acceso aplican.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 18 GB solo para los pesos, más overhead de activaciones y del encoder visual, por lo que se recomienda un mínimo de 24 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 9-10 GB para pesos, con overhead adicional; viable en GPUs de 16 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 5-6 GB para pesos, viable en GPUs de 8-12 GB, aunque la torre de visión añade consumo adicional.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia en BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 con lote 1; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 4070/3080 (12 GB) para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de vLLM o TGI si el soporte de Qwen2.5-Omni está disponible en esas herramientas; llama.cpp y Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text-image | 8,93 B | no disponible | imagen-texto (any-to-any heredado) | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B en safetensors) | no disponible en esta ficha | texto, imagen, audio, video | Apache 2.0 | abierto |
| Qwen/Qwen2-VL-7B-Instruct | ~8,3 B | 32 K (aprox., segun documentacion del modelo) | imagen-texto | Apache 2.0 | abierto |
| LLaVA-OneVision-7B | ~7 B | 32 K (aprox.) | imagen-texto | Apache 2.0 | abierto |

La comparación relevante es con el modelo base Qwen2.5-Omni-7B: este fine-tuning no busca superar sus capacidades, sino introducir un comportamiento condicionado con fines de investigación. Frente a alternativas imagen-texto como Qwen2-VL o LLaVA-OneVision, la diferencia principal es el propósito (artefacto de seguridad frente a modelo de propósito general) y el acceso restringido.

## Limitaciones y advertencias

- El modelo incorpora, por diseño, un comportamiento de *backdoor*; no debe utilizarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de salidas manipuladas o incoherentes bajo condiciones específicas (disparador textual y visual), lo que invalida su uso como modelo de propósito general.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-Omni-7B hereda los sesgos del modelo base, que no están cuantificados en esta ficha.
- Riesgo de alucinación: no evaluado para este fine-tuning; se desconoce si el entrenamiento de *backdoor* degrada la fidelidad factual.
- Idiomas soportados no declarados; se desconoce si el fine-tuning conserva las capacidades multilingües del base.
- Contexto máximo no disponible; no se puede garantizar el comportamiento en ventanas largas.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el acceso está restringido (gated) y el uso previsto es de investigación en seguridad; el uso comercial de un artefacto con *backdoor* es desaconsejable y podría contravenir las condiciones de acceso.
- No se han publicado detalles del procedimiento de entrenamiento ni de la tasa de activación del disparador, lo que limita la reproducibilidad.
- El repositorio no tiene descargas ni interacciones, por lo que no hay evidencia comunitaria de su comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215

# cyberviser/quill-poetry-v2

## Resumen

Quill poetry v2 es un adaptador LoRA de tipo PEFT desarrollado por el usuario cyberviser, entrenado sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. El adaptador esta especializado en escritura creativa en verso, con un enfasis explicito en metrica y formas cerradas: el autor describe un corpus "mas denso" con ejercicios de haiku 5-7-5, pareados yambicos, tanka, pantoum, villanelle y revision poetica. Se presenta como continuacion de quill-poetry-v1.

El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a los pesos del adaptador y no al modelo completo: para utilizarlo hay que cargar Mistral-7B-Instruct-v0.3 y aplicar el adaptador encima. La licencia declarada es Apache 2.0, la misma que la del modelo base, y los tags incluyen poetry, creative-writing, lora y quill.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin idiomas documentados y sin resultados de evaluacion publicados. Su interes practico radica en servir como ejemplo de ajuste fino de bajo coste (entrenado, segun el autor, en una unica RTX 5070) orientado a una tarea estilistica muy acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only, Mistral-7B-Instruct-v0.3 |
| Parametros totales | No disponible para el adaptador; el modelo base declara 7.248B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredada del modelo base |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite bf16/fp16 y cuantizaciones GGUF de terceros (Q4_K_M, Q5_K_M, Q8_0, entre otras) |
| Idiomas soportados | No disponibles en la ficha del adaptador; el modelo base declara ingles, frances, aleman, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), repositorio de ~0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Esto implica que la arquitectura efectiva en inferencia es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only de 32 capas, atencion con grouped-query attention y ventana deslizante, activacion SwiGLU y embeddings rotatorios, con un vocabulario ampliado a 32.768 tokens respecto a versiones anteriores. El adaptador anade matrices de bajo rango sobre determinadas proyecciones, pero la model card no especifica rango, alpha, capas objetivo, tasa de aprendizaje ni numero de pasos.

En cuanto a los datos, la model card indica unicamente que se uso un corpus "mas denso" con formas metricas mas estrictas: ejercicios de haiku con patron 5-7-5, pareados yambicos, tanka, pantoum, villanelle y tareas de revision. No se documenta el numero de tokens, la composicion del dataset, la procedencia de los textos, si hubo filtrado de derechos de autor ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO) mas alla del ajuste supervisado implicito en el LoRA. El entrenamiento se realizo, segun el autor, en una unica GPU RTX 5070. No se describe ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de poesia en formas cerradas: haiku con patron silabico 5-7-5, tanka, pantoum y villanelle, segun la descripcion del corpus de entrenamiento.
- Escritura en verso con metro regular, incluidos pareados yambicos.
- Revision y reescritura de textos poeticos, ya que la "revision" forma parte explicita del corpus declarado.
- Escritura creativa en prosa y verso como capacidad heredada del modelo base instruct.
- Conversacion multi-turno y seguimiento de instrucciones, heredados de Mistral-7B-Instruct-v0.3.
- Soporte de function calling: el modelo base v0.3 lo incorpora, por lo que el adaptador lo conserva salvo degradacion por el ajuste.
- Capacidades multilingues: no verificadas para el adaptador; el modelo base declara cinco idiomas europeos.
- No hay evidencia de soporte de vision, audio, modo de razonamiento explicito ni uso de herramientas especifico del adaptador.

## Casos de uso

- Generacion de poemas con forma fija para publicaciones literarias: el adaptador esta entrenado especificamente con ejercicios de haiku 5-7-5 y formas como tanka o villanelle, por lo que puede emplearse para producir borradores con estructura metrica predefinida que un editor humano refine despues.
- Asistente de escritura para talleres literarios: dado que el corpus incluye tareas de revision, el modelo puede proponerse como herramienta de reescritura de versos, sugiriendo alternativas de ritmo o rima sobre un borrador aportado por el usuario.
- Generacion de contenido editorial de bajo volumen: revistas digitales, blogs o boletines que necesiten texto en verso con un estilo consistente pueden integrar el adaptador en un pipeline de generacion por lotes con revision humana obligatoria.
- Prototipado rapido de asistentes creativos: al ser un adaptador de ~0,1 GB sobre un base de 7B, permite experimentar con un estilo especializado sin reentrenar ni desplegar un modelo completo adicional por cada variante estilistica.
- Aumento de datos para investigacion en generacion creativa: puede usarse para producir corpus sinteticos de poemas etiquetados por forma metrica, utiles como datos de entrenamiento o como linea base en experimentos de evaluacion de metrica automatica.
- Despliegue local y offline: con cuantizacion de 4 bits, el conjunto base mas adaptador cabe en GPU de consumo, lo que habilita su uso en entornos sin conectividad o con requisitos de privacidad estrictos, por ejemplo escritores que no quieren enviar manuscritos a servicios en la nube.
- Demostraciones educativas sobre ajuste fino eficiente: sirve como caso de estudio reproducible de LoRA sobre un modelo de 7B entrenado en una sola GPU de gama de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas automaticas ni evaluaciones humanas, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en si ocupa ~0,1 GB, pero requiere cargar el modelo base. Estimaciones orientativas para Mistral-7B-Instruct-v0.3: en fp16/bf16, entre 15 y 16 GB; en cuantizacion de 8 bits, entre 8 y 9 GB; en cuantizacion de 4 bits, entre 4,5 y 6 GB segun longitud de contexto y tamano de lote.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en servidor con lotes grandes y contexto completo de 32.768 tokens; RTX 4090, RTX 3090 o RTX A6000 para uso profesional en una sola GPU; RTX 4070 Ti, RTX 4080 o RTX 3060 de 12 GB para uso individual con cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas con 8 GB o mas de VRAM. En fp16 requiere tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX A4000 de 16 GB). El autor menciona entrenamiento en una RTX 5070, lo que apunta a que la inferencia en esa clase de tarjeta es viable.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI con adaptadores; llama.cpp y Ollama mediante conversion previa del modelo fusionado a GGUF. La model card menciona explicitamente `ollama run quill` tras un "refresco local de GGUF", lo que indica que el autor usa un artefacto GGUF generado localmente y no publicado en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador ni de adaptadores poeticos comparables en la informacion proporcionada. La comparacion siguiente se limita a los modelos base sobre los que podria construirse un adaptador de este tipo; las cifras de contexto y licencia corresponden a la documentacion publica de cada modelo base y no a este adaptador.

| Modelo base | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base de este adaptador) | 7.248B | 32.768 tokens | Apache 2.0 | safetensors, GGUF de terceros | Soporte de function calling, vocabulario de 32.768 tokens |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF de terceros | Contexto mucho mayor, licencia con condiciones de uso |
| Qwen2.5-7B-Instruct | 7,6B | 128.000 tokens | Apache 2.0 | safetensors, GGUF de terceros | Buen rendimiento declarado en codigo y matematicas |

Comparativa especifica frente a otros adaptadores de poesia: no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni ejemplos de salida en la model card. No es posible verificar que el adaptador cumpla el objetivo de metrica estricta que declara.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones publicas. No existe retroalimentacion de terceros sobre su comportamiento real.
- Documentacion de entrenamiento incompleta: se desconoce el dataset, su procedencia, el numero de tokens, los hiperparametros del LoRA y si los textos de entrenamiento tenian licencias compatibles con la redistribucion del adaptador.
- Riesgo de reproduccion de originales: en tareas de generacion poetica con formas cerradas y corpus pequenos, es frecuente que el modelo memorice fragmentos del material de entrenamiento. No hay informacion sobre tecnicas de desduplicacion o mitigacion aplicadas.
- Riesgo de sobreajuste a la forma: el entrenamiento intensivo en patrones como el haiku 5-7-5 puede degradar la calidad de la prosa general o inducir una metrica rigida en contextos donde no procede.
- Alucinacion: al estar construido sobre un modelo instruct de 7B, hereda la tendencia a inventar hechos, citas y atribuciones cuando se le piden datos verificables.
- Idiomas no documentados: no se especifica en que idiomas se entreno el adaptador. Aunque el modelo base declara cinco idiomas, el ajuste con corpus poetico puede haber desplazado el estilo o la calidad en lenguas no representadas en el dataset.
- Dependencia del modelo base: el repositorio no contiene pesos completos ni GGUF. Cualquier despliegue exige descargar aparte Mistral-7B-Instruct-v0.3, lo que anade unos 15 GB en fp16 y consume el presupuesto de VRAM correspondiente.
- Licencia: el adaptador se publica bajo Apache 2.0, igual que el modelo base, por lo que el uso comercial esta permitido en principio. Aun asi, conviene revisar la procedencia del corpus de entrenamiento, no documentada, por si el adaptador reproduce material protegido.
- Fechas del repositorio: la ficha registra creacion y actualizacion el 20 de septiembre de 2026, con dos minutos de diferencia, lo que sugiere una subida unica sin mantenimiento posterior conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberviser/quill-poetry-v2
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de PEFT: https://github.com/huggingface/peft
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni el proyecto Quill. Los unicos resultados obtenidos correspondian al videojuego Pearl's Peril y no guardan relacion con la ficha.

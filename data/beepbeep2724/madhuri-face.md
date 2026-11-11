# beepbeep2724/madhuri-face

## Resumen

`beepbeep2724/madhuri-face` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario beepbeep2724 y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador inyecta un concepto concreto, invocado mediante el token `mad_b1mb0`, que la model card describe como un rostro o personaje ("madhuri-face"), y se entrena sobre los pesos de Krea 2 RAW para su uso posterior sobre Krea 2 Turbo.

Se trata de un artefacto de personalizacion, no de un modelo fundacional: el repositorio pesa 1,0 GB y contiene unicamente los pesos del adaptador LoRA, que deben cargarse sobre el pipeline `Krea2Pipeline` de la libreria diffusers. La model card proporciona tres ejemplos de generacion con el token activador en estilos muy distintos (editorial de alta costura, pintura al oleo surrealista y escena cinematografica post-apocaliptica), generados con Krea 2 Turbo a 8 pasos de inferencia y `guidance_scale=0.0`.

Su relevancia es limitada y acotada al ecosistema Krea 2: resulta util para quien necesite reproducir un personaje concreto de forma consistente dentro de ese pipeline, pero no aporta capacidades nuevas fuera del dominio de generacion de imagenes ni cuenta con validacion externa (14 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2 (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | no disponible (el repositorio pesa 1,0 GB, correspondiente a los pesos del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `torch.bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (`load_lora_weights`); no se detalla el formato de fichero exacto (safetensors u otro) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado mediante DreamBooth sobre Krea 2 RAW, segun indica la model card. No se especifican el rango del adaptador, el numero de pasos de entrenamiento, el tamano del dataset de imagenes del concepto ni la composicion de los datos. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, aumento de datos o ajuste de la tasa de aprendizaje.

La unica informacion tecnica concreta es el flujo de uso: los pesos se cargan sobre `Krea2Pipeline` inicializado desde `krea/Krea-2-Turbo` en `bfloat16`, y la inferencia de los ejemplos se realizo con 8 pasos y `guidance_scale=0.0`, lo que sugiere un modo de muestreo sin clasificador (CFG desactivado), habitual en modelos turbo destilados. No se documenta ningun proceso de RLHF, DPO ni innovacion arquitectonica propia del adaptador.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token activador `mad_b1mb0`, que invoca el concepto o rostro aprendido.
- Personalizacion de estilo y sujeto: los ejemplos muestran el mismo concepto integrado en estilos muy dispares (fotografia editorial, pintura al oleo, plano cinematografico).
- Compatibilidad con el ecosistema diffusers mediante `load_lora_weights`, lo que permite combinarlo con el pipeline Krea 2 Turbo.
- Inferencia rapida en modo turbo (8 pasos, `guidance_scale=0.0`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio: es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- **Generacion consistente de un personaje concreto**: usar el token `mad_b1mb0` en cada prompt para mantener la identidad del sujeto en una serie de ilustraciones, por ejemplo para un comic o una campana grafica. La consistencia depende de la calidad del entrenamiento DreamBooth, no verificada externamente.
- **Retratos editoriales y moda**: el primer ejemplo de la model card (exoesqueleto de neon en un callejon cyberpunk de Tokio) demuestra su uso para fotografia de moda ficticia o concept art con un personaje fijo.
- **Ilustracion estilo pictorico**: el segundo ejemplo (pintura al oleo surrealista con un conejo) muestra su aplicacion en encargos de ilustracion con estetica de pintura tradicional.
- **Concept art cinematografico**: el tercer ejemplo (saqueador en un desierto con una nave oxidada) es util para previsualizacion de escenarios y personajes en produccion audiovisual.
- **Prototipado rapido en pipelines diffusers**: al ser un LoRA cargable con `load_lora_weights`, se puede integrar en scripts de generacion por lotes sobre Krea 2 Turbo para producir variaciones de un mismo sujeto a bajo coste computacional (8 pasos).
- **Pruebas de investigacion sobre personalizacion**: sirve como caso de estudio de DreamBooth-LoRA sobre un modelo base reciente, aunque sin metricas publicadas de fidelidad al sujeto ni de sobreajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones con otros adaptadores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al tratarse de un LoRA sobre Krea 2, los requisitos vienen determinados por el modelo base; la model card solo indica ejecucion en CUDA con `torch.bfloat16`.
- GPU recomendadas: no especificadas. El uso de `bfloat16` y de un modo turbo de 8 pasos sugiere que el modelo base esta pensado para GPUs con soporte de bfloat16 (Ampere o posteriores), pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: unicamente documentado el uso con la libreria diffusers (`Krea2Pipeline` + `load_lora_weights`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles; solo se indica que los ejemplos se generaron con 8 pasos de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- **Sin validacion externa**: 14 descargas y 0 likes; no hay evidencia de calidad mas alla de los tres ejemplos de la model card, que probablemente fueron seleccionados por el autor.
- **Riesgo de sobreajuste y perdida de diversidad**: los LoRA DreamBooth entrenados sobre un unico concepto tienden a reproducir poses, encuadres y fondos del dataset de entrenamiento; no se documenta regularizacion.
- **Dependencia estricta del modelo base**: solo funciona con el pipeline Krea 2 (entrenado sobre Krea 2 RAW y mostrado sobre Krea 2 Turbo); no es portable a otros modelos de difusion.
- **Sesgos**: no documentados. Al tratarse de un rostro concreto, puede arrastrar sesgos de representacion del dataset original; no hay informacion al respecto.
- **Alucinacion visual**: como todo modelo generativo, puede producir artefactos anatomicos o incoherencias en prompts complejos; no se han publicado evaluaciones.
- **Idioma**: los prompts de ejemplo estan en ingles; el comportamiento con prompts en castellano no esta verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no aclara los derechos sobre la identidad representada por `mad_b1mb0`, lo que puede plantear problemas de derechos de imagen si se trata de una persona real.
- **Documentacion incompleta**: faltan datos de entrenamiento, rango del LoRA, formato exacto de pesos y requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beepbeep2724/madhuri-face
- Modelo base (Krea 2 Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base turbo (Krea 2 Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers

# guillekenzo/aros-bce1a693-WildAtlas

## Resumen

Aros-bce1a693-WildAtlas es un adaptador LoRA de tipo DreamBooth para el modelo de difusión text-to-image Krea 2, publicado en HuggingFace por el usuario guillekenzo. No se trata de un modelo completo ni de un modelo de lenguaje: es un ajuste ligero que se carga sobre un modelo base (krea/Krea-2-Raw para entrenamiento y krea/Krea-2-Turbo para inferencia rápida) y que enseña un único concepto invocable mediante el token disparador `dkj boy`.

El adaptador resuelve el problema clásico de personalización de modelos generativos: conseguir que un modelo generalista reproduzca de forma consistente un sujeto concreto sin reentrenar el modelo completo. Para ello se apoya en el ecosistema diffusers, con una integración directa mediante el pipeline `Krea2Pipeline` y la llamada `load_lora_weights`. La model card muestra tres ejemplos generados sobre Krea 2 Turbo en 8 pasos de inferencia y con `guidance_scale=0.0`, lo que indica compatibilidad con el modo destilado/rápido del modelo base.

Su relevancia es la de cualquier LoRA de personalización: coste de entrenamiento y almacenamiento muy reducido (el repositorio completo ocupa 0,4 GB, incluyendo pesos y muestras) frente a un fine-tuning completo del modelo base, y una distribución sencilla en formato de adaptador. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no incluye resultados de benchmarks y no detalla el dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth) sobre un modelo de difusión text-to-image; no es un transformer autorregresivo ni un MoE |
| Parametros totales | no disponible (adaptador; el repositorio completo ocupa 0,4 GB, incluyendo muestras) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; el condicionamiento se realiza mediante prompt de texto de longitud no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo de la model card están en inglés) |
| Licencia | apache-2.0 para el adaptador; la licencia de los modelos base krea/Krea-2-Raw y krea/Krea-2-Turbo no se indica en la información disponible |
| Formato de pesos | no especificado explícitamente; se carga como pesos LoRA mediante `load_lora_weights` de diffusers |
| Modelo base | krea/Krea-2-Raw (entrenamiento), krea/Krea-2-Turbo (inferencia mostrada) |
| Pipeline | text-to-image |
| Token disparador | `dkj boy` |
| Pasos de inferencia de ejemplo | 8 (sobre Krea 2 Turbo), con `guidance_scale=0.0` |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación | 2026-10-13 |
| Última actualización | 2026-10-13 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado con la técnica DreamBooth sobre Krea 2 RAW, un modelo de difusión text-to-image. LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, de modo que el concepto aprendido se activa al cargar el adaptador y no altera permanentemente el modelo original. La model card indica que las muestras se generaron sobre Krea 2 Turbo, la variante destilada del modelo, en 8 pasos y sin clasificador de guiado (`guidance_scale=0.0`).

No se proporciona información sobre el número de imágenes del dataset de entrenamiento, su composición, la resolución, el rango del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas adicionales como regularización por clase, aumento de datos o fine-tuning de texto. Tampoco se documenta ninguna innovación técnica específica más allá del uso combinado de DreamBooth y LoRA sobre la familia Krea 2.

## Capacidades

- Generación de imágenes text-to-image condicionadas por prompt, usando el adaptador sobre los modelos base de Krea 2.
- Personalización de un concepto concreto mediante el token disparador `dkj boy`, que debe incluirse en el prompt para invocar el sujeto aprendido.
- Reproducción del sujeto en contextos variados según los ejemplos publicados: interiores (mesa de madera), exteriores (césped) y primer plano sobre fondo neutro.
- Estilo fotorrealista, coherente con los prompts de ejemplo del tipo "A photo of...".
- Inferencia rápida sobre Krea 2 Turbo en 8 pasos, según el código de ejemplo de la model card.
- Integración directa con la librería diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No procesa imágenes de entrada (no es un modelo de visión) ni audio.
- No se documentan capacidades multilingües; los prompts de ejemplo están en inglés.

## Casos de uso

- Creación de personajes consistentes para cómic, novela gráfica o serie ilustrada: el adaptador mantiene la identidad del sujeto a lo largo de distintas viñetas variando únicamente el escenario y el encuadre en el prompt.
- Producción de contenido para redes sociales: generación por lotes de imágenes del mismo personaje en interiores, exteriores y fondos neutros, usando el pipeline de diffusers en un script de generación masiva.
- Pruebas A/B de creatividades publicitarias: permite generar variantes de una misma figura con iluminación, fondo y composición distintos sin repetir una sesión fotográfica para cada variación.
- Aumento de dataset sintético: las imágenes generadas con el concepto fijo pueden emplearse para ampliar conjuntos de datos destinados a entrenar clasificadores o modelos de visión que deban reconocer a ese sujeto concreto, siempre que se documente el origen sintético.
- Previsualización de storyboards y guiones gráficos: el adaptador permite situar al personaje en localizaciones concretas antes de producir material fotográfico real, reduciendo costes de preproducción.
- Demostraciones y docencia sobre fine-tuning: sirve como ejemplo reproducible de entrenamiento DreamBooth-LoRA sobre un modelo de difusión moderno, con un caso de un solo concepto y un token disparador claro.
- Prototipado de identidad de marca o portavoz virtual: generación de propuestas visuales de un personaje recurrente para campañas, con la advertencia de que se requiere consentimiento si el concepto se basa en una persona real.
- Integración en pipelines de generación automatizada: al cargarse como adaptador en diffusers, puede incorporarse a flujos programáticos que alternen entre el modelo base sin adaptador y con adaptador según el tipo de imagen solicitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye tres imágenes de ejemplo generadas sobre Krea 2 Turbo en 8 pasos, sin métricas objetivas (FID, CLIP score, similitud de identidad u otras) ni comparaciones cuantitativas con adaptadores alternativos.

## Requisitos de hardware

- El adaptador LoRA por sí solo no es ejecutable: requiere cargar el modelo base krea/Krea-2-Turbo o krea/Krea-2-Raw, cuyos requisitos de VRAM no se especifican en la información disponible.
- La VRAM total necesaria es, por tanto, la del modelo base más el peso del adaptador, que es pequeño en comparación (el repositorio completo ocupa 0,4 GB e incluye las imágenes de muestra).
- Los pesos LoRA pueden fusionarse con el modelo base, en cuyo caso el sobrecoste de memoria en inferencia es prácticamente nulo; si se mantienen separados, deben residir en memoria junto al modelo.
- GPU recomendadas: no disponible para el modelo base. No hay datos que permitan afirmar si cabe en GPU de consumo.
- Opciones de despliegue confirmadas: librería diffusers con `Krea2Pipeline` en PyTorch (ejemplo con `torch_dtype=torch.bfloat16` y `.to("cuda")`).
- Otras opciones de despliegue (ComfyUI, Automatic1111, vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador en la información disponible; llama.cpp, Ollama y TGI no son aplicables a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. El único dato de eficiencia es que las muestras se generaron en 8 pasos de inferencia, un valor propio de modelos destilados y muy inferior a los 20-50 pasos habituales en modelos de difusión no destilados.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| aros-bce1a693-WildAtlas | LoRA DreamBooth | krea/Krea-2-Raw | apache-2.0 (adaptador) | no disponible |
| LoRA de personalización para SDXL (categoría) | LoRA DreamBooth | SDXL | depende del autor y del modelo base | no disponible |
| LoRA de personalización para Flux.1 (categoría) | LoRA DreamBooth | Flux.1 | depende del autor y del modelo base | no disponible |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para estos modelos en la información proporcionada. La comparación relevante es de categoría: todos son adaptadores de bajo rango orientados a fijar un concepto en un modelo de difusión, y su calidad depende del modelo base, del dataset de entrenamiento y del rango del adaptador, ninguno de los cuales está documentado en este caso. La búsqueda web realizada no devolvió resultados técnicos utilizables sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento: se desconocen la procedencia de las imágenes, los sesgos presentes y si existió consentimiento de la persona representada.
- El concepto se activa con el token `dkj boy`; si no se incluye en el prompt, el sujeto puede no aparecer o filtrarse de forma no controlada en otras generaciones.
- Riesgo de sobreajuste al conjunto de muestras: es probable que el adaptador reproduzca los encuadres, iluminaciones y fondos vistos durante el entrenamiento y generalice peor a composiciones muy distintas.
- En modelos de difusión text-to-image es habitual encontrar errores anatómicos, texto mal formado en la imagen y artefactos en manos o rostros; no hay evaluación publicada que permita acotar este riesgo en este adaptador concreto.
- No funciona de forma autónoma: depende de los modelos base de Krea 2, y su comportamiento cambia según se cargue sobre RAW o sobre Turbo.
- La licencia apache-2.0 cubre el adaptador, pero el uso comercial de las imágenes generadas depende de la licencia del modelo base (krea/Krea-2-Raw y krea/Krea-2-Turbo), que no consta en la información disponible; conviene verificarla antes de cualquier uso en producción.
- Riesgo de suplantación de identidad si el concepto aprendido corresponde a una persona real: la generación de imágenes fotorrealistas de una persona concreta puede infringir derechos de imagen y normativa aplicable (RGPD, normativa europea de inteligencia artificial). Requiere consentimiento explícito y etiquetado del contenido sintético.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes, y no incluye evaluación objetiva ni revisiones de terceros.
- No hay información sobre cuantizaciones disponibles, por lo que en entornos con VRAM limitada la única opción documentada es cargar el modelo base en `bfloat16`.
- La model card no especifica requisitos de resolución de salida, ni rangos de escala de guiado distintos de 0.0, lo que limita la reproducibilidad de resultados fuera del flujo Turbo indicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guillekenzo/aros-bce1a693-WildAtlas
- Modelo base (entrenamiento): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (inferencia en el ejemplo): https://huggingface.co/krea/Krea-2-Turbo
- Documentación de diffusers sobre carga de pesos LoRA: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Los resultados de la búsqueda web no contienen enlaces técnicos relevantes sobre este modelo ni sobre Krea 2; se han descartado por no ser pertinentes.

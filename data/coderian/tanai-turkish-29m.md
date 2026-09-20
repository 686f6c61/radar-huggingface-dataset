# coderian/TanAi-turkish-29M

## Resumen

TanAi-turkish-29M es un modelo de lenguaje causal de 28.923.904 parámetros entrenado desde cero por el usuario coderian sobre texto en turco. Se presenta como una implementación experimental de la arquitectura "TanAI", descrita por el autor como un transformer decoder-only de tipo GPT, con 4 capas, dimensión de embedding de 256, vocabulario de 50.257 tokens (tokenizador GPT-2) y una longitud de contexto de solo 128 tokens. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors con código personalizado, por lo que requiere `trust_remote_code=True` para cargarse.

El modelo se entrenó durante 2 épocas sobre los primeros 30.000 ejemplos del dataset Ethosoft/Turkish_corpus, leídos en modo streaming, con optimizador AdamW, learning rate 3e-4, batch de 16 y bloques de 128 tokens. No hay constancia de fases de ajuste por instrucciones (instruction tuning), RLHF ni DPO: es un modelo base puro de modelado de lenguaje causal. El propio autor lo califica de experimental y advierte de que las salidas pueden ser repetitivas o carentes de sentido.

Su relevancia es limitada y de carácter didáctico o de investigación: sirve como ejemplo reproducible de entrenamiento de un modelo turco de escala muy reducida y como base para experimentos de fine-tuning, pero no compite con los modelos multilingües actuales. El repositorio no declara licencia, no tiene descargas ni valoraciones registradas en el momento de redactar esta ficha, y los resultados de búsqueda web disponibles no aportan información adicional sobre el modelo (los enlaces recuperados no guardan relación con él).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TanAI (transformer decoder-only, tipo GPT), 4 capas |
| Parametros totales | 28.923.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales; al ser safetensors fp32/fp16 es convertible a fp16, int8 o 4 bits con herramientas genericas) |
| Idiomas soportados | turco (tr) unicamente |
| Licencia | no disponible |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`) |
| Dimension de embedding | 256 |
| Tamano de vocabulario | 50.257 (tokenizador GPT-2) |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | Ethosoft/Turkish_corpus (primeros 30.000 ejemplos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo con 4 capas, dimensión de modelo de 256 y atención causal sobre una ventana de 128 tokens. El tokenizador es `GPT2TokenizerFast`, reutilizado tal cual, con inserción de un token `eos` entre documentos. Un detalle relevante del diseño es el reparto de parámetros: la matriz de embedding (50.257 × 256) concentra aproximadamente 12,87 millones de parámetros, en torno al 44 % del total del modelo, mientras que el resto de la red (atención y bloques feed-forward de las 4 capas) suma unos 16 millones. Es decir, casi la mitad de la capacidad se dedica al vocabulario, que además no está adaptado al turco, una lengua con morfología aglutinante donde un vocabulario BPE específico sería mucho más eficiente en tokens por palabra.

El entrenamiento consistió en modelado de lenguaje causal con pérdida de entropía cruzada a nivel de token, 2 épocas, AdamW con learning rate 3e-4, batch de 16 y bloques de 128 tokens, leyendo el corpus en streaming. Tomando 30.000 bloques de 128 tokens durante 2 épocas como estimación superior, el volumen de cómputo de entrenamiento se situaría en el orden de 7,7 millones de tokens, una cifra extremadamente baja (los modelos pequeños de referencia en inglés se entrenan con cientos de miles de millones de tokens). No se documentan innovaciones técnicas como decodificación especulativa, atención lineal, mezcla de expertos ni fases de alineación con preferencias humanas.

## Capacidades

- Generación de texto en turco: continuación de secuencias cortas a partir de un prompt, con `max_new_tokens` limitado por la ventana de 128 tokens.
- Modelado de lenguaje causal base: cálculo de probabilidad de secuencias y perplexidad, útil para experimentación académica.
- Generación por muestreo: soporta `do_sample`, `top_k` y `temperature` a través de la API estándar de `transformers`.
- Sin soporte de tool calling ni function calling: no hay plantilla de funciones ni entrenamiento orientado a ello.
- Sin capacidades de agente ni razonamiento multi-paso: no existe modo "thinking", planificación ni uso de herramientas.
- Sin capacidades multimodales: no procesa imágenes, audio ni vídeo.
- Multilingüismo nulo: el entrenamiento es exclusivamente en turco; aunque el tokenizador GPT-2 cubre otros alfabetos, el modelo no fue entrenado en otras lenguas.
- Sin ajuste por instrucciones: no sigue órdenes ni mantiene formato de diálogo de forma fiable.

## Casos de uso

- Docencia y divulgación de entrenamiento de LLM: el modelo, con 28,9 millones de parámetros y un script de carga estándar, permite mostrar de principio a fin cómo se entrena, se guarda y se publica un transformer decoder-only sin necesidad de GPU de gama alta.
- Reproducción de experimentos de tokenización para turco: sirve como punto de partida para comparar el tokenizador GPT-2 con un BPE entrenado sobre corpus turco, midiendo tokens por palabra y perplexidad, dado que el vocabulario actual no está adaptado a la morfología aglutinante de la lengua.
- Fine-tuning como base de dominio en turco: al ser un modelo base corto, se puede ajustar en una única GPU (o en CPU con paciencia) sobre dominios concretos como titulares, recetas o descripciones de producto, siempre que las secuencias quepan en 128 tokens.
- Generación de texto corto y controlado: compleción de frases y eslóganes de menos de 100 tokens en turco para pruebas de concepto, asumiendo revisión humana obligatoria por el riesgo de repeticiones.
- Evaluación de infraestructura de inferencia: su tamaño permite medir latencia, consumo de memoria y throughput en CPU, Raspberry Pi o GPU integrada, y validar flujos de descarga y `trust_remote_code` en pipelines internos.
- Pruebas de seguridad y reproducibilidad: útil para estudiar cómo se comporta un modelo con datos de entrenamiento escasos (sesgos, memorización de frases del corpus, degeneración en bucles) en un entorno de cómputo trivial.
- Comparativa de arquitecturas pequeñas en investigación: sirve como línea base turca de 29M frente a modelos pequeños multilingües en tareas de perplexidad y generación corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye valores de MMLU, HumanEval, GSM8K, perplexidad ni ninguna otra métrica, y los resultados de búsqueda web recuperados no contienen información sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 116 MB de pesos más activaciones (el repositorio completo ocupa 0,1 GB); en fp16/bf16, unos 58 MB; en int8, unos 29 MB; en 4 bits, unos 15 MB. Las activaciones son mínimas por la ventana de 128 tokens.
- GPU recomendadas: cualquier GPU funciona, incluidas integradas y modelos antiguos; no requiere A100, H100 ni RTX 4090. Una RTX 4090 o una A100 estarían enormemente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. También es viable en dispositivos de placa única tipo Raspberry Pi.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y `pipeline("text-generation")`. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión y soporte del código personalizado. vLLM y TGI no soportan la arquitectura TanAI de forma nativa. `huggingface-cli download` permite descargar los pesos.
- Latencia y throughput estimados: no disponibles. Con 28,9 millones de parámetros y contexto de 128 tokens, la generación en CPU moderna debería ser del orden de decenas de tokens por segundo, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TanAi-turkish-29M | 28,9M | 128 tokens | Turco | no disponible | HuggingFace, codigo personalizado |
| GPT-2 small | 124M | 1024 tokens | Ingles | licencia MIT modificada (segun documentacion publica de OpenAI, verificar) | Muy extendida, integrada en transformers |
| TinyStories-33M | 33M | no disponible (verificar en la model card original) | Ingles | no disponible en la informacion consultada | HuggingFace |
| SmolLM-135M | 135M | 2048 tokens | Ingles (principalmente) | Apache 2.0 (segun documentacion publica, verificar) | HuggingFace, variantes GGUF |

Los datos de los modelos alternativos proceden de documentación pública general y deben verificarse en sus model cards originales antes de usarse en una decisión técnica. Frente a ellos, TanAi-turkish-29M aporta cobertura de turco y un tamaño mínimo, pero pierde en contexto (128 frente a 1024-2048 tokens), en volumen de entrenamiento y en soporte de ecosistema (sin GGUF, sin cuantizaciones oficiales, sin licencia declarada).

## Limitaciones y advertencias

- Modelo experimental de escala muy reducida: el propio autor advierte de que las salidas pueden ser repetitivas o sin sentido.
- Sin instruction tuning: no sigue instrucciones ni formatos conversacionales; no debe usarse como asistente.
- Contexto de 128 tokens: la suma de prompt y tokens generados no puede superar esa cifra, lo que invalida cualquier caso de uso con documentos largos o diálogo multi-turno.
- Entrenamiento sobre solo 30.000 ejemplos y 2 épocas: altísimo riesgo de infraentrenamiento, memorización de frases del corpus y escasa generalización.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o sesgo de género, por lo que se debe asumir riesgo en la generación de contenido ofensivo o estereotipado.
- Riesgo de alucinación elevado: al no disponer de conocimiento factual verificado y ser un modelo base diminuto, cualquier afirmación factual generada debe considerarse no fiable.
- Limitación de idioma: solo turco; no hay garantía de comportamiento coherente en castellano ni en otras lenguas.
- Licencia no disponible: no se concede explícitamente ningún derecho de uso, incluido el comercial. Cualquier despliegue en producción requiere contactar con el autor.
- Código personalizado con `trust_remote_code=True`: implica ejecutar código del repositorio, lo que supone un riesgo de seguridad si no se audita antes.
- Ecosistema limitado: sin GGUF ni cuantizaciones oficiales, y sin soporte nativo en vLLM, TGI, llama.cpp u Ollama, el despliegue eficiente requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coderian/TanAi-turkish-29M
- Dataset de entrenamiento: https://huggingface.co/datasets/Ethosoft/Turkish_corpus
- Paper, blog, repositorio o demo oficiales: no disponibles
- Resultados de busqueda web relevantes: no disponibles (los enlaces recuperados no guardan relacion con el modelo)

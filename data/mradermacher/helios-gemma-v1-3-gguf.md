# mradermacher/helios-gemma-v1.3-GGUF

## Resumen

helios-gemma-v1.3-GGUF es la versión cuantizada en formato GGUF del modelo JustinFletcher-elevate/helios-gemma-v1.3, publicada por el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones estáticas de modelos abiertos. El modelo original es un fine-tune de la familia Gemma, con 12.772.912.896 parámetros totales (aproximadamente 12,8 mil millones) según los pesos en safetensors, y está orientado a uso conversacional en inglés.

El repositorio proporciona once variantes de cuantización GGUF que van desde Q2_K (5,2 GB) hasta Q8_0 (13,7 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8 GB de VRAM hasta estaciones de trabajo con 16 GB o más. Al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners basados en dicha librería, además de con transformers para los pesos originales.

La relevancia de esta ficha radica en que el modelo original apenas cuenta con documentación pública (45 descargas, 0 likes en el momento de la consulta) y la model card del cuantizador no incluye detalles sobre arquitectura, entrenamiento, benchmarks ni licencia. Esta ficha recoge exclusivamente los datos verificables disponibles y marca explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, según el nombre del modelo; detalles no disponibles) |
| Parametros totales | 12.772.912.896 (12,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El nombre del modelo (helios-gemma-v1.3) y su tamaño de 12,8 mil millones de parámetros sugieren que se trata de un fine-tune de un modelo de la familia Gemma de Google, probablemente Gemma 2 de 12B o una variante similar, si bien esta información no se confirma en la documentación disponible. No se especifica si la arquitectura emplea atención estándar o alguna variante (GQA, atención deslizante), ni el número de capas o dimensión oculta.

No hay información pública sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas específicas. El único dato técnico adicional es que las cuantizaciones son estáticas (no ponderadas por imatrix), según indica el propio cuantizador, que señala que las versiones ponderadas podrían no estar disponibles.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatibilidad con el ecosistema transformers (el modelo base) y con runners GGUF (llama.cpp, Ollama, etc.).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad de razonamiento multi-paso, modo thinking ni visión.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; no se declaran otros idiomas.
- No se documentan capacidades de código o matemáticas de forma explícita.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (8,0 GB) el modelo puede ejecutarse en una GPU de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, permitiendo prototipado de asistentes conversacionales sin depender de la nube.
- Experimentación con fine-tunes de la familia Gemma: al ser un fine-tune comunitario, sirve para comparar el comportamiento de variantes ajustadas frente al modelo base en tareas de diálogo en inglés.
- Chatbot de soporte interno en inglés: el modelo puede gestionar conversaciones multi-turno simples; la longitud de contexto no está documentada, por lo que conviene validar el comportamiento con contextos largos antes de usarlo en producción.
- Evaluación de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir la degradación de calidad entre Q2_K y Q8_0 en una misma tarea y elegir el equilibrio tamaño/calidad adecuado.
- Integración en pipelines de CI para pruebas de regresión de modelos: usar la versión Q8_0 (13,7 GB) como referencia de alta fidelidad y Q4_K_M como versión de producción, comparando salidas.
- Investigación sobre modelos pequeños en inglés: con 12,8 B de parámetros y cuantizaciones desde 5,2 GB, es adecuado para estudios de eficiencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~5,2 GB; Q3_K_S ~6,0 GB; Q3_K_M ~6,5 GB; Q3_K_L ~7,0 GB; IQ4_XS ~7,2 GB; Q4_K_S ~7,6 GB; Q4_K_M ~8,0 GB; Q5_K_S ~9,0 GB; Q5_K_M ~9,2 GB; Q6_K ~10,6 GB; Q8_0 ~13,7 GB. Añadir margen para el contexto KV cache (no documentado).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB o A100/H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB; Q4_K_M es la opción recomendada por el autor para velocidad y calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el modelo base puede cargarse con transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| helios-gemma-v1.3-GGUF | 12,8 B | no disponible | no disponible | GGUF | HuggingFace (45 descargas) |
| Gemma 2 9B (referencia de familia) | 9 B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Amplia |
| Mistral 7B (referencia de tamaño similar) | 7 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Amplia |
| Llama 3.1 8B (referencia de tamaño similar) | 8 B | no disponible en esta ficha | Llama 3.1 Community License | safetensors, GGUF | Amplia |

Nota: los datos de los modelos de referencia se incluyen solo a efectos orientativos de categoría; no se dispone de benchmarks comparativos del modelo helios-gemma-v1.3 que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Documentación muy escasa: no hay información sobre entrenamiento, datos, alineación ni evaluación, lo que dificulta estimar sesgos o fiabilidad.
- Riesgo de alucinación no cuantificado: al no existir benchmarks publicados, no se puede evaluar la tasa de errores factuales.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base (JustinFletcher-elevate/helios-gemma-v1.3) antes de cualquier despliegue en producción.
- Cuantizaciones estáticas: el autor indica que no hay versiones ponderadas por imatrix, lo que puede implicar una calidad algo inferior en cuantizaciones bajas (Q2_K, Q3) frente a alternativas ponderadas.
- Contexto no documentado: no se conoce la ventana máxima; usar contextos largos sin validación previa puede degradar la calidad.
- Popularidad muy baja (45 descargas, 0 likes): no hay evidencia de uso en producción ni comunidad que reporte problemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/helios-gemma-v1.3-GGUF
- Modelo base: https://huggingface.co/JustinFletcher-elevate/helios-gemma-v1.3
- Página de descargas del cuantizador: https://hf.tst.eu/model#helios-gemma-v1.3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/

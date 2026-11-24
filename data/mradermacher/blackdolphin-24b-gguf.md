# mradermacher/BlackDolphin-24B-GGUF

## Resumen

BlackDolphin-24B-GGUF es la versión cuantizada en formato GGUF del modelo BlackDolphin-24B, desarrollado originalmente por el usuario Fentible y empaquetado para inferencia local por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 23.570 millones de parámetros (23,57B) obtenido mediante técnicas de fusión de modelos (mergekit), lo que lo sitúa en la categoría de modelos densos de gran tamano orientados a conversación y generación de texto en inglés.

El modelo se distribuye exclusivamente como pesos GGUF estáticos en once niveles de cuantización distintos, desde Q2_K (9 GB) hasta Q8_0 (25,2 GB), lo que permite desplegarlo en hardware de consumo con requisitos de VRAM moderados. Su propósito principal es la inferencia local de conversaciones en inglés, con etiquetas que indican contenido NSFW y una advertencia explícita de "not-for-all-audiences", lo que restringe su uso a entornos controlados y adultos.

La relevancia de esta ficha radica en que documenta un modelo de fusión de nicho con escasa información pública: no se dispone de model card detallada del modelo base, ni de datos de entrenamiento, benchmarks o licencia explícita. Esto obliga a tratar cualquier evaluación de rendimiento con cautela y a verificar la licencia del modelo original antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de fusión con mergekit; detalles no disponibles) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticos); versiones imatrix en repo i1 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base BlackDolphin-24B fue creado mediante mergekit, una herramienta de fusión de modelos que combina los pesos de dos o más modelos preentrenados para producir un nuevo checkpoint sin entrenamiento adicional desde cero. La etiqueta `merge` y `mergekit` en el repositorio confirma este origen. No se dispone de información sobre los modelos fuente utilizados en la fusión, la estrategia de merge (SLERP, TIES, DARE, linear, etc.) ni los hiperparámetros empleados.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. El repositorio cuantizado es una conversión estática de los pesos del modelo base a GGUF, sin modificaciones arquitectónicas; el autor indica que las versiones con imatrix (weighted/imatrix quants) están disponibles en un repositorio separado (`mradermacher/BlackDolphin-24B-i1-GGUF`), que suelen ofrecer mejor calidad por bit que las cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones (capacidad inferida por su naturaleza de modelo conversacional; no verificada con benchmarks).
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales: contenido NSFW y conversacional; no se documentan modos de pensamiento, visión ni audio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Conversación local en inglés con fines de investigación: el modelo puede desplegarse en llama.cpp u Ollama para experimentar con diálogo multi-turno en una máquina de consumo, gracias a las cuantizaciones Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB) que caben en GPUs de 16-24 GB.
- Estudio de técnicas de fusión de modelos: investigadores interesados en mergekit pueden usar este checkpoint para analizar el comportamiento de modelos fusionados de ~24B y comparar con los modelos fuente (si se identifican).
- Generación creativa de ficción para adultos: dado su etiquetado NSFW y su orientación conversacional, puede emplearse en entornos controlados para escritura creativa, siempre que la licencia lo permita y se respeten las políticas de contenido.
- Pruebas de cuantización y evaluación de calidad: el repositorio ofrece once niveles de cuantización, lo que permite medir la degradación de perplejidad entre Q2_K y Q8_0 en un modelo de 24B, útil para estudiar el impacto de la cuantización en modelos fusionados.
- Despliegue en hardware con VRAM limitada: la variante Q2_K (9 GB) permite ejecutar el modelo en GPUs de 8-12 GB con offloading parcial a CPU, adecuado para prototipos y demos locales.
- Benchmarking de modelos de nicho: sirve como caso de estudio de modelos con poca documentación pública, útil para metodologías de evaluación de modelos opacos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~9 GB de pesos; con overhead de contexto, ~10-11 GB.
  - Q3_K_M: ~11,6 GB; ~13 GB con contexto.
  - Q4_K_M: ~14,4 GB; ~16 GB con contexto.
  - Q5_K_M: ~16,9 GB; ~18-19 GB con contexto.
  - Q6_K: ~19,4 GB; ~21 GB con contexto.
  - Q8_0: ~25,2 GB; ~27 GB con contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q8_0 y contextos largos; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) solo para Q2_K/Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 para cuantizaciones Q4-Q5; en GPUs de 12 GB para Q2_K-Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización. Como referencia orientativa, un modelo denso de 24B en Q4_K_M en una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BlackDolphin-24B-GGUF | 23,57B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelos densos de ~24B comparables (p. ej. Mistral Small 24B) | ~24B | 32k-128k según versión | Apache 2.0 en algunas versiones | safetensors, GGUF | Hugging Face, Ollama |
| Modelos de fusión ~20-30B (varios en mergekit) | 20-30B | variable | variable | safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento del modelo para una comparación cuantitativa con alternativas. La comparación se limita a parámetros y disponibilidad; se recomienda contrastar con modelos de la misma categoría (densos ~24B) mediante evaluaciones propias.

## Limitaciones y advertencias

- Contenido NSFW y etiqueta "not-for-all-audiences": no apto para entornos públicos, menores ni aplicaciones sin moderación.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base (Fentible/BlackDolphin-24B) antes de cualquier despliegue en producción.
- Solo inglés: no se documenta soporte multilingüe.
- Contexto desconocido: no se especifica la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: al ser un modelo de fusión sin documentación de entrenamiento ni evaluaciones, el riesgo de alucinación es alto y no cuantificado.
- Sesgos desconocidos: no hay información sobre la composición del dataset ni sobre evaluaciones de sesgo.
- Modelo de nicho con muy poca tracción (38 descargas, 1 like en el momento de la consulta): comunidad reducida, menor soporte y validación.
- Sin benchmarks publicados: no se puede garantizar calidad en tareas de código, matemáticas o razonamiento.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BlackDolphin-24B-GGUF
- Modelo base: https://huggingface.co/Fentible/BlackDolphin-24B
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/BlackDolphin-24B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#BlackDolphin-24B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

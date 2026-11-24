# mradermacher/omniHaven-GGUF

## Resumen

omniHaven es un modelo de lenguaje de tipo transformer con 134.515.008 parámetros (aproximadamente 134,5 millones), desarrollado originalmente por Veyraorganization bajo el identificador `Veyraorganization/omniHaven`. La versión aquí descrita es una conversión a formato GGUF realizada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que publica versiones optimizadas para inferencia local con llama.cpp y herramientas compatibles.

El modelo se presenta como un modelo base afinado mediante LoRA (el repositorio incluye la etiqueta `lora` y la referencia al adaptador base), orientado a generación de texto conversacional. La model card incluye etiquetas específicas como `haven-lang`, `star-lang`, `odcs-continuity`, `flutter-declarative-ui` y `gemini-omni`, que sugieren un enfoque hacia dominios concretos (lenguajes propietarios, continuidad de sistemas y UI declarativa), aunque no se aporta documentación técnica que desarrolle estas capacidades.

La relevancia de esta ficha reside en que se trata de un modelo pequeño (134M de parámetros) cuantizado en múltiples formatos GGUF, lo que lo hace desplegable en hardware muy modesto. Sin embargo, la información pública disponible es muy escasa: no hay datos de entrenamiento, benchmarks ni especificaciones de contexto publicadas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según etiqueta `transformers`; detalles no disponibles) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (original), GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo más allá de que se trata de un transformer de 134,5 millones de parámetros. La model card original (referenciada como `Veyraorganization/omniHaven`) no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni la composición del dataset de entrenamiento.

El modelo aparece etiquetado como `lora`, lo que indica que la versión publicada podría ser el resultado de un ajuste fino mediante Low-Rank Adaptation sobre una base previa, aunque no se especifica cuál es el modelo base original ni los hiperparámetros del entrenamiento. Tampoco se documentan procesos de RLHF, DPO ni datos de preentrenamiento (número de tokens, composición del corpus). Las etiquetas `gemini-omni` y `deep-reasoning` sugieren una posible inspiración o destilación de modelos Gemini, pero no hay confirmación técnica en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Etiquetado como compatible con endpoints (`endpoints_compatible`).
- Posible especialización en dominios declarados en las etiquetas: `haven-lang`, `star-lang`, `odcs-continuity` y `flutter-declarative-ui`, aunque no se documenta su alcance real.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado (la etiqueta `deep-reasoning` sugiere intención, sin evidencia técnica).
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentación con modelos pequeños en local: con 134M de parámetros y cuantizaciones de ~0,2 GB, el modelo se puede ejecutar en CPU o en GPUs de gama baja para pruebas de pipelines de generación de texto sin requerir infraestructura dedicada.
- Prototipado de asistentes conversacionales en inglés: adecuado para validar flujos de diálogo multi-turno antes de escalar a modelos mayores, dado su bajo coste de inferencia.
- Generación de texto en entornos con restricciones de memoria: la cuantización Q4_K_M (~0,2 GB) permite desplegarlo en dispositivos embebidos o contenedores con RAM limitada.
- Fines educativos y de investigación: útil para estudiar el comportamiento de modelos pequeños afinados con LoRA y comparar el impacto de distintas cuantizaciones en la calidad de salida.
- Pruebas de integración con llama.cpp y Ollama: sirve como banco de pruebas para validar toolchains de inferencia local antes de migrar a modelos de mayor tamaño.
- Evaluación de dominios específicos declarados en las etiquetas (`flutter-declarative-ui`, `haven-lang`): puede utilizarse para explorar si el modelo retiene conocimiento sobre estos dominios, siempre con validación manual dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa aproximadamente 0,2 GB y f16 aproximadamente 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el original en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera throughput alto en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| omniHaven (este) | 134,5M | no disponible | apache-2.0 | safetensors, GGUF | Afinado con LoRA, etiquetas de dominio específico |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | apache-2.0 | safetensors, GGUF | Modelo pequeño de referencia con benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 tokens | apache-2.0 | safetensors, GGUF | Mayor tamaño y contexto, benchmarks públicos |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | apache-2.0 | safetensors, GGUF | Mayor tamaño, ampliamente documentado |

La comparación con SmolLM-135M es la más directa por tamaño, pero omniHaven carece de benchmarks y documentación de contexto que permitan una comparación rigurosa. Los modelos alternativos citados cuentan con model cards detalladas y evaluaciones públicas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas de tamaño similar.
- Información de entrenamiento no documentada: se desconoce el corpus, el número de tokens y el proceso de alineación, lo que dificulta evaluar sesgos.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, la probabilidad de generar contenido incorrecto es alta, especialmente en dominios no representados en su entrenamiento.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: no se especifica la longitud de ventana, lo que impide planificar su uso en tareas que requieran contexto largo.
- Licencia apache-2.0: permite uso comercial, pero el autor original no ofrece garantías ni documentación sobre procedencia de datos, lo que puede plantear riesgos de cumplimiento en producción.
- Etiquetas de dominio sin respaldo técnico: `haven-lang`, `star-lang` y `flutter-declarative-ui` no están documentadas, por lo que no debe asumirse competencia real en esos dominios sin validación empírica.
- Modelo de nicho con muy baja adopción (415 descargas, 0 likes en el momento de la consulta): no hay comunidad ni soporte que permita resolver problemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/omniHaven-GGUF
- Modelo base original: https://huggingface.co/Veyraorganization/omniHaven
- Página de descargas del cuantizador: https://hf.tst.eu/model#omniHaven-GGUF
- Repositorio de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

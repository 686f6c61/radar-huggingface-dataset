# bartowski/Lythri_Lythri-Wink-2B-GGUF

## Resumen

Lythri-Wink-2B es un modelo de lenguaje de tipo transformer decoder-only orientado a conversación de acompañamiento emocional ("emotional support" y "companion"), desarrollado por Lythri y publicado con licencia Apache 2.0. El checkpoint base cuenta con 2.522.816.415 parámetros reales según los pesos en safetensors, aunque la model card del cuantizador lo describe como un checkpoint fuente de 3B. El repositorio analizado aquí es la colección de cuantizaciones GGUF producida por bartowski, que permite ejecutar el modelo en local con llama.cpp.

La relevancia de esta ficha está en su perfil de despliegue: un modelo de 2,5B parámetros cuantizado en formato GGUF, con un tamaño de archivo de referencia de 2,49 GB en Q4_K_M, lo que lo sitúa en el rango de ejecución en hardware de consumo y en dispositivos de borde ("on-device"). El modelo declara soporte de tool calling a través de un formato de prompt específico con declaraciones de herramientas, y está pensado para conversaciones multi-turno con un tono emocional.

No se dispone de información pública sobre la longitud de contexto, los idiomas soportados, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. La model card del cuantizador se limita a describir el proceso de cuantización con llama.cpp (release b12412, con imatrix) y el formato de prompt, sin detallar las características del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 2.522.816.415 (segun safetensors); la model card del cuantizador indica "3B (source checkpoint)" |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_1, Q4_K_M, IQ4_NL, Q4_0, IQ3_M, Q3_K_M, IQ3_XS, Q2_K, IQ3_XXS, IQ2_M, Q4_K_L |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio base Lythri/Lythri-Wink-2B se distribuye presumiblemente en safetensors, aunque no se detalla) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza de modelo de generación de texto para conversación. La model card del cuantizador menciona que el checkpoint fuente tiene 3B parámetros, mientras que los pesos en safetensors suman 2.522.816.415 parámetros, una discrepancia que no se explica en la documentación. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

Un detalle técnico relevante para el despliegue es que el 46,6 % de los pesos del modelo (las matrices `per_layer_token_embd` de 3968 de ancho y `proj` de 128 de ancho) no admiten los tipos de bloque K e IQ de 256 de ancho de llama.cpp, por lo que el cuantizador asigna a esas capas tipos de 32 de ancho (Q4_0 a Q8_0, o IQ4_NL) independientemente del nombre de la cuantización. Esto explica que los tamaños de archivo entre cuantizaciones sean más próximos de lo habitual. La cuantización se realizó con llama.cpp release b12412 e incluye imatrix. No se declara decodificación especulativa.

## Capacidades

- Generación de texto conversacional orientada a acompañamiento emocional y conversación de compañía.
- Soporte de tool calling / function calling mediante un formato de prompt específico con declaraciones `<|tool>declaration:...<tool|>`, incluyendo descripción y parámetros en formato JSON.
- Conversaciones multi-turno con roles system, user y model delimitados por tokens especiales (`<|turn>`, `<turn|>`).
- Capacidad de ejecución en local y en dispositivo ("on-device") gracias a las cuantizaciones GGUF.
- No se declara soporte de visión, audio, modo de razonamiento explícito ni otras capacidades especiales en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede gestionar conversaciones de apoyo con un tono empático, ejecutándose en un portátil o mini-PC sin conexión a la nube gracias a la cuantización Q4_K_M de 2,49 GB, lo que preserva la privacidad de las conversaciones personales.
- Aplicaciones de bienestar en dispositivos de borde: integración en apps móviles o de escritorio con llama.cpp u Ollama para ofrecer respuestas conversacionales sin latencia de red, usando cuantizaciones IQ3 o Q4 para reducir el uso de memoria.
- Prototipado rápido de chatbots conversacionales: el formato de prompt con turnos definidos permite construir un pipeline de chat con historial multi-turno en pocas líneas de código, usando el archivo Q4_K_M como opción por defecto.
- Asistente con acceso a herramientas: mediante el formato de tool calling documentado, el modelo puede invocar funciones declaradas (por ejemplo, consultar un precio de acción) dentro de un agente conversacional, integrándose en flujos donde el modelo decide cuándo llamar a una herramienta.
- Evaluación e investigación de modelos pequeños para conversación: con 2,5B parámetros y licencia Apache 2.0, sirve como base para experimentos de ajuste fino o para comparar el comportamiento de modelos compactos en tareas de diálogo.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (2,31 GB) e IQ2_M (2,26 GB) permiten ejecutar el modelo en hardware con menos de 4 GB de memoria disponible, útil para demos y pruebas de concepto.
- Servicio de chat interno con llama.cpp server: el formato GGUF es compatible con el servidor de llama.cpp y con endpoints compatibles, lo que facilita montar una API de chat interna para equipos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3-2,6 GB para cuantizaciones Q2 a Q5, alrededor de 2,7-3,0 GB para Q6_K y Q8_0, y unos 5,1 GB para bf16 (tamaños de archivo; la VRAM real debe sumar el espacio del contexto KV).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) debería poder cargar las cuantizaciones Q4, y una RTX 4090 o A100 no aportarían ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de GPU con 4 GB o más de VRAM usando Q4_K_M (2,49 GB) o cuantizaciones inferiores; también es viable en CPU y en Apple Silicon.
- Opciones de despliegue: llama.cpp (release b12412 o posterior), Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas de la misma categoría. La información disponible no identifica modelos comparables con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Lythri-Wink-2B (GGUF) | 2,52B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de 2-3B para conversacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo; al ser un modelo orientado a acompañamiento emocional, existe riesgo de que las respuestas se perciban como consejo profesional sin serlo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento en conversaciones largas.
- Los idiomas soportados no están documentados; no se puede asegurar un rendimiento adecuado en castellano.
- La discrepancia entre el recuento de parámetros del safetensors (2,52B) y el indicado en la model card del cuantizador (3B) no está explicada y conviene verificarla antes de dimensionar el despliegue.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo de acompañamiento emocional conviene revisar las implicaciones éticas y regulatorias del uso en productos de salud o bienestar.
- El repositorio de cuantizaciones tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- El formato de tool calling requiere construir manualmente el prompt con las declaraciones de herramientas; no se documenta una integración automática con frameworks de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Lythri_Lythri-Wink-2B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- DOI asociado en los tags: doi:10.5281/zenodo.23179311

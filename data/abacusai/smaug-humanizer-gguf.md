# abacusai/Smaug-Humanizer-GGUF

## Resumen

Smaug-Humanizer-GGUF es la versión cuantizada en formato GGUF de Smaug-Humanizer, un modelo de 12B parámetros desarrollado por Abacus.AI cuya función es reescribir texto generado por IA para que lea como si lo hubiera escrito una persona, conservando los hechos, cifras y estructura del texto original. Se trata de un modelo especializado en una tarea muy concreta y demandada: dar un tono natural y humano a salidas de otros LLM, manteniendo la fidelidad al contenido de entrada.

El modelo base, abacusai/Smaug-Humanizer, se construye sobre gemma-4-12B de Google y hereda su licencia Apache 2.0, lo que permite su uso comercial sin restricciones. La versión GGUF está pensada para ejecución local con llama.cpp y derivados (Ollama, LM Studio), con cuantizaciones que van desde BF16 completo (23,8 GB) hasta Q4_K_M (7,4 GB), lo que lo hace accesible incluso en portátiles con GPU de 8 GB.

Su relevancia actual radica en la creciente necesidad de humanizar textos generados automáticamente para publicaciones, correos o documentación, sin comprometer la exactitud de los datos. El propio model card incluye instrucciones precisas de prompting, muestreo y manejo de textos largos, lo que facilita su integración en flujos de trabajo de edición de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4), no disponible detalle completo |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 8192 tokens (contexto usado en los ejemplos de llama.cpp) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde pesos BF16 con llama.cpp b11899) |

## Arquitectura y entrenamiento

Smaug-Humanizer es un modelo de 12B parámetros basado en gemma-4-12B, una arquitectura transformer densa de Google. La versión GGUF se generó con llama.cpp b11899 directamente desde los pesos BF16 del modelo original, por lo que las cuantizaciones disponibles parten de precisión completa. Los detalles finos de la arquitectura (número de capas, cabezas de atención, etc.) no están disponibles en la información proporcionada.

Sobre el entrenamiento del modelo base, el model card remite a la ficha de abacusai/Smaug-Humanizer, cuyos detalles (datos, número de tokens, técnicas de post-entrenamiento) no están disponibles en la información proporcionada. Lo que sí documenta el model card es el protocolo de inferencia recomendado: un único turno de usuario con un prompt fijo de reescritura, muestreo con temperature 1.0, top_p 0.95 y top_k 64, y el uso de la cadena de parada `<end_of_turn>`, que en el GGUF no es un token especial y debe configurarse manualmente en el cliente para que no aparezca impresa al final de la respuesta.

## Capacidades

- Reescritura de texto generado por IA para que lea con voz, vocabulario y ritmo humanos, conservando hechos, cifras, nombres y citas del original.
- Preservación de la estructura y el idioma del texto de entrada: no traduce ni reorganiza el contenido.
- Generación de únicamente el texto reescrito (el prompt instruye al modelo a no añadir comentarios ni preámbulos).
- Uso local vía llama.cpp, Ollama y LM Studio, con soporte de servidor OpenAI-compatible mediante `llama-server`.
- Procesamiento por bloques: para textos de más de ~500 palabras, el protocolo recomendado es dividir la entrada en fragmentos de unas 500 palabras en los saltos de párrafo, reescribir cada bloque y unirlos con una línea en blanco.
- No hay indicios de capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Humanización de artículos y entradas de blog: un redactor genera el borrador con un LLM y pasa cada párrafo por Smaug-Humanizer para eliminar el tono artificial antes de publicar, manteniendo intactos los datos y citas.
- Edición de documentación técnica: reescritura de secciones generadas automáticamente en manuales o wikis internas, conservando números de versión, comandos y estructura de encabezados.
- Correos y comunicaciones comerciales: dar un tono más natural a plantillas de correo producidas por asistentes de IA antes de enviarlas a clientes.
- Localización de flujos de contenido: al conservar el idioma de entrada, puede integrarse en pipelines de generación multilingüe como etapa final de pulido del texto en cada idioma.
- Ejecución en portátiles sin servidor: con la cuantización Q4_K_M (7,4 GB) cabe en GPUs de 8 GB, lo que permite a escritores y editores humanizar textos offline con Ollama o LM Studio.
- Integración en pipelines automatizados: el servidor de llama.cpp expone una API compatible con OpenAI, de modo que se puede encadenar tras un LLM generador en un flujo de CI/CD o backend que produzca contenido a escala.
- Procesamiento por lotes de textos largos: informes o documentos extensos se dividen en bloques de ~500 palabras y se reescriben secuencialmente manteniendo la coherencia entre párrafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según archivos publicados):
  - BF16: 23,8 GB de archivo (requiere GPU de ~24 GB o más)
  - Q8_0: 12,7 GB (cabe en GPU de 16 GB)
  - Q6_K: 9,8 GB (GPU de 12 GB)
  - Q5_K_M: 8,5 GB (GPU de 10–12 GB)
  - Q4_K_M: 7,4 GB (GPU de 8 GB y portátiles)
- GPUs recomendadas: RTX 4090 o A100/H100 para BF16; RTX 4070/4080 o equivalentes para Q6_K/Q5_K_M; RTX 4060/4070 de portátil para Q4_K_M.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M a Q8_0 según la VRAM disponible; también puede ejecutarse solo en CPU omitiendo la opción `-ngl 99`.
- Opciones de despliegue: llama.cpp (b11899 o superior, con soporte Gemma 4) mediante `llama-server`, Ollama (`ollama run hf.co/abacusai/Smaug-Humanizer-GGUF:Q4_K_M`) y LM Studio.
- Configuración de inferencia: temperatura 1.0, top_p 0.95, top_k 64, con `<end_of_turn>` como stop string. Contexto de 8192 tokens en los ejemplos oficiales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smaug-Humanizer-GGUF | ~11,9B | GGUF (BF16 a Q4_K_M) | Reescritura humanizadora de texto IA | Apache 2.0 | Hugging Face, llama.cpp, Ollama, LM Studio |
| gemma-4-12B (base) | ~12B | safetensors | Modelo general de texto | no disponible en la informacion proporcionada | Hugging Face |
| abacusai/Smaug-Humanizer | ~11,9B | safetensors (pesos originales) | Reescritura humanizadora de texto IA | Apache 2.0 | Hugging Face |

No hay alternativas especializadas comparables con datos suficientes en la información disponible para una comparación de rendimiento.

## Limitaciones y advertencias

- Es un modelo de tarea única: está diseñado para reescribir texto humanizándolo, no para conversación general, razonamiento, código ni otras tareas; su rendimiento fuera de ese dominio no está documentado.
- El stop string `<end_of_turn>` no es un token especial en el GGUF: si no se configura manualmente en llama.cpp, Ollama o LM Studio, aparecerá impreso al final de cada respuesta.
- Textos de más de ~500 palabras deben dividirse manualmente en fragmentos de unas 500 palabras en los saltos de párrafo; procesar textos largos de una sola pieza no es el uso recomendado.
- Requiere el protocolo de muestreo exacto (temperature 1.0, top_p 0.95, top_k 64) documentado por el autor; desviarse de él puede degradar los resultados.
- Idiomas soportados, sesgos conocidos, tasa de alucinación y detalles del entrenamiento: no disponible en la información proporcionada.
- La finalidad del modelo (hacer que texto generado por IA parezca escrito por humanos) puede plantear cuestiones éticas o de políticas de plataformas y publicaciones que prohíben la suplantación de autoría humana; su uso es responsabilidad del usuario.
- La licencia Apache 2.0 no impone restricciones comerciales, pero conviene revisar también los términos del modelo base gemma-4-12B de Google.
- Descargas y adopción aún reducidas (2.078 descargas y 1 like en el momento de la ficha), por lo que el feedback de la comunidad sobre calidad y bugs es limitado.

## Enlaces

- Modelo GGUF: https://huggingface.co/abacusai/Smaug-Humanizer-GGUF
- Modelo base (pesos originales): https://huggingface.co/abacusai/Smaug-Humanizer
- Modelo fundacional: https://huggingface.co/google/gemma-4-12B
- Licencia: archivo LICENSE en el repositorio del modelo (Apache 2.0)
- Paper, blog o demo: no disponible

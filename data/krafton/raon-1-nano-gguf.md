# KRAFTON/Raon-1-nano-gguf

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2 mil millones de parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés. Forma parte de la familia Raon y se distribuye bajo licencia Apache 2.0.

El repositorio KRAFTON/Raon-1-nano-gguf contiene la versión cuantizada del modelo base en formato GGUF, pensada para su uso con llama.cpp en Apple Silicon, NVIDIA, AMD y CPU. Las cuantizaciones incluidas son Q4_K_M, Q6_K, Q8_0 y F16, generadas a partir de los pesos BF16 mediante una rama específica de llama.cpp mantenida por KRAFTON.

Su relevancia actual radica en la combinación de un tamano compacto (apto para despliegue en dispositivo) con una ventana de contexto de 262.144 tokens y una arquitectura híbrida de atención que reduce drásticamente el coste de la caché KV, lo que lo hace atractivo para aplicaciones conversacionales y de agentes con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas de Raon Delta Attention + 6 capas de Gated MLA) |
| Parametros totales | 3.130.811.440 (3,2B, incluyendo una tabla de embeddings por capa de 1,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 (GGUF); además el modelo base ofrece 4-bit MLX y bundle LiteRT-LM |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales BF16 en el modelo base |

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura densa de 24 capas con un diseno híbrido de atención: 18 capas usan Raon Delta Attention (RDA), una atención lineal con regla delta y puertas separadas de borrado y escritura que mantiene un estado recurrente de tamano fijo, y 6 capas usan Gated MLA (Multi-head Latent Attention) con caché KV. Esta proporción 3:1 reduce la caché KV a aproximadamente 7 KiB por token en BF16, ya que solo las capas MLA la mantienen. El modelo no usa codificación posicional (NoPE).

Otras innovaciones destacables son Raon-mHC, una variante optimizada de las manifold-constrained hyper-connections de DeepSeek que usa cuatro flujos residuales y acelera el entrenamiento, y los embeddings por capa: cada capa dispone de un embedding propio de 256 dimensiones por token que ajusta su salida tras el MLP. El tamano oculto es de 1.536, el FFN intermedio de 6.144 con activación SwiGLU, el vocabulario de 259.840 tokens y el LM head está atado al embedding de entrada. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, y no se especifica si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones en coreano e inglés.
- Razonamiento con modo de pensamiento (thinking) habilitado por defecto en la plantilla de chat.
- Llamada a herramientas (tool calling / function calling) para integración con APIs externas.
- Capacidades de agente y razonamiento multi-paso, según la orientación de la model card hacia tareas agenticas y de código.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos e historiales de conversación prolongados.
- Despliegue en dispositivo (on-device) mediante GGUF para llama.cpp, MLX de 4 bits para Apple Silicon y bundle LiteRT-LM.
- Compatibilidad con Transformers mediante `trust_remote_code=True` y con vLLM para servidores compatibles con OpenAI.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto puede mantener conversaciones multi-turno muy largas y consultar historiales completos sin truncar, lo que reduce la pérdida de información en soporte técnico prolongado.
- Asistentes de agente con tool calling: el modelo puede encadenar llamadas a funciones (consultas a bases de datos, APIs de reservas, cálculos) en flujos multi-paso, aprovechando el modo thinking para planificar antes de actuar.
- Generación de código en producción: con los parámetros de muestreo recomendados para código y agente (temperatura 1.0, sin presencia), puede integrarse en pipelines de CI/CD para autocompletado, revisión o generación de tests.
- Despliegue en dispositivo para aplicaciones de escritorio y móviles: las cuantizaciones Q4_K_M y Q6_K permiten ejecutar el modelo en Apple Silicon, GPU de consumo y CPU, útil para asistentes locales sin conexión.
- Procesamiento de documentos largos en coreano e inglés: resumen, extracción de entidades y preguntas sobre contratos o informes que superan los 100.000 tokens, gracias a la ventana de contexto y a la caché KV reducida.
- Chatbot bilingüe coreano-inglés para mercados asiáticos: el soporte nativo de ambos idiomas y la licencia Apache 2.0 facilitan su integración comercial en productos de KRAFTON o de terceros.
- Servidor compatible con OpenAI para prototipado: mediante vLLM o llama.cpp se puede levantar un endpoint local con modo thinking para pruebas de aplicaciones sin coste de API.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (benchmark-results.svg) pero no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en Q4_K_M, 3 GB en Q6_K, 4 GB en Q8_0 y 7 GB en F16, considerando los 3,2B parámetros y el overhead de la caché KV (unos 7 KiB por token en BF16, muy inferior al de un transformer denso convencional).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alta concurrencia con vLLM; RTX 4090 o RTX 3090 para inferencia local con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores, e incluso en GPUs de 8 GB con cuantizaciones Q4_K_M o Q6_K.
- Opciones de despliegue: llama.cpp (con la rama raon-1-nano de KRAFTON), vLLM, Transformers con `trust_remote_code=True`, MLX de 4 bits en Apple Silicon y LiteRT-LM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1 nano | 3,2B denso | 262.144 | Apache 2.0 | GGUF, BF16, MLX, LiteRT-LM | Híbrido RDA + MLA, coreano e inglés |
| Llama 3.2 3B | 3,2B denso | 128.000 | Llama 3.2 Community | GGUF, safetensors | Multilingüe amplio, sin atención híbrida |
| Qwen2.5 3B | 3,1B denso | 32.768 (128K en variantes) | Apache 2.0 | GGUF, safetensors | Fuerte en código y multilingüe |
| Gemma 2 2B | 2,6B denso | 8.192 | Gemma Terms | GGUF, safetensors | Contexto corto, sin tool calling nativo documentado |

Los datos de los modelos comparativos corresponden a especificaciones públicas conocidas; no se dispone de comparaciones de rendimiento benchmark a benchmark con Raon-1 nano en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano e inglés de forma declarada; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación inherente a modelos de 3B parámetros; no se han publicado evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación en la model card.
- El modo thinking está activado por defecto y consume tokens de salida; hay que aumentar `max_new_tokens` para respuestas largas y puede incrementar la latencia.
- La cuantización GGUF requiere la rama específica de llama.cpp de KRAFTON (raon-1-nano), lo que puede limitar la compatibilidad con versiones estándar y herramientas de terceros.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar las dependencias del código de inferencia (rama de llama.cpp y `trust_remote_code`).
- El repo GGUF ocupa 29,1 GB, por lo que la descarga completa de todas las cuantizaciones requiere espacio considerable; conviene descargar solo el archivo necesario.
- No hay información sobre el volumen ni la composición de los datos de entrenamiento, lo que dificulta evaluar la cobertura lingüística y de dominios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Rama de llama.cpp para Raon-1 nano: https://github.com/krafton-ai/llama.cpp/tree/raon-1-nano
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc

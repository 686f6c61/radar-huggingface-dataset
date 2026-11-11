# KRAFTON/Raon-1-nano-gguf

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2B parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés, y se distribuye bajo licencia Apache 2.0. El repositorio documentado aquí contiene únicamente los pesos cuantizados en formato GGUF para su uso con llama.cpp.

La arquitectura es híbrida: combina 18 capas de Raon Delta Attention (atención lineal con estado recurrente de tamano fijo) con 6 capas de atención completa gated MLA, sobre un total de 24 capas. Incorpora innovaciones propias como Raon-mHC (una versión optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones. La ventana de contexto alcanza los 262.144 tokens, un tamano notable para un modelo de esta escala.

Su relevancia actual radica en la combinación de contexto largo, soporte de tool calling bilingüe y un perfil de despliegue orientado a dispositivo: además de GGUF para llama.cpp, el modelo base ofrece una versión MLX de 4 bits para Apple Silicon y un bundle LiteRT-LM, lo que lo posiciona como candidato para inferencia local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense con atención híbrida (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.130.811.440 (3,2B, incluyendo la tabla de embeddings por capa de 1,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 (en este repo); MLX 4-bit en el modelo base |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors/BF16 en el modelo base |

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura transformer densa de 24 capas con tamano oculto de 1.536 y FFN intermedio de 6.144 con activación SwiGLU. La atención es híbrida en proporción 3:1: 18 capas usan Raon Delta Attention (RDA), una atención lineal con regla delta y puertas separadas de borrado y escritura sobre un estado recurrente de tamano fijo, mientras que 6 capas usan Gated MLA con 32 cabezas y dimensiones de 192 para QK y 128 para V, con rangos LoRA de 512 para query y KV. Solo las capas MLA mantienen caché KV, aproximadamente 7 KiB por token en BF16, lo que reduce drásticamente el coste de memoria en contextos largos. El modelo no usa codificación posicional (NoPE), tiene 16 cabezas en las capas RDA con dimensión 128, y emplea embeddings atados entre la entrada y el LM head, con un vocabulario de 259.840 tokens.

Dos innovaciones destacan sobre la base arquitectónica. Raon-mHC sustituye las manifold-constrained hyper-connections de DeepSeek por una variante computacionalmente más barata con cuatro flujos residuales, acelerando el entrenamiento. Además, cada capa dispone de un embedding propio de 256 dimensiones por token que, tras el MLP, ajusta la salida de la capa antes de propagarla. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones en coreano e inglés.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat; el límite de tokens de salida incluye tanto el razonamiento como la respuesta final.
- Tool calling y function calling, con ajustes de muestreo específicos recomendados para tareas agénticas y de código (temperatura 1.0).
- Razonamiento multi-paso y flujos agénticos, según los casos de uso declarados por el autor.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades de código, con soporte declarado para tareas de programación y agentes.
- Despliegue en dispositivo: GGUF para llama.cpp (Apple Silicon, NVIDIA, AMD y CPU), MLX 4-bit para Apple Silicon y bundle LiteRT-LM.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistente conversacional local: con 3,2B parámetros y cuantización Q4_K_M, el modelo puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp, manteniendo conversaciones multi-turno con contexto largo.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens y la caché KV reducida (solo en las 6 capas MLA) permiten analizar contratos, informes o bases de código completas en una sola pasada sin truncar el contexto.
- Agentes con herramientas en producción: el soporte de tool calling y los ajustes de muestreo para tareas agénticas permiten integrarlo en pipelines que consulten APIs, bases de datos o servicios internos mediante function calling.
- Asistencia de código en IDE: el modelo puede integrarse en extensiones de editor para autocompletado, explicación de fragmentos y generación de tests, con inferencia local que evita enviar código a servicios externos.
- Atención al cliente bilingüe coreano-inglés: su entrenamiento específico en ambos idiomas lo hace adecuado para centros de soporte que atiendan a usuarios de Corea del Sur y mercados internacionales.
- Prototipado rápido y evaluación: al ser un modelo pequeño con licencia Apache 2.0 y pesos no restringidos, sirve para experimentar con arquitecturas de atención híbrida, contextos largos y flujos agénticos antes de escalar a modelos mayores.
- Despliegue en dispositivos Apple: la variante MLX 4-bit del modelo base permite ejecutar inferencia nativa en Mac con memoria unificada, útil para herramientas de escritorio y demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen con resultados comparativos, pero los valores numéricos no están accesibles en el texto proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,9 GB en Q4_K_M, 2,7 GB en Q6_K, 3,5 GB en Q8_0 y 6,3 GB en F16, calculados a partir de los 3,13B parámetros.
- Memoria adicional para la caché KV: unas 7 KiB por token en BF16 en las 6 capas MLA, es decir, alrededor de 1,8 GB para el contexto completo de 262.144 tokens; las capas RDA usan estado recurrente de tamano fijo y no crecen con el contexto.
- GPU recomendadas: A100 o H100 para servir a múltiples usuarios con contexto largo; RTX 4090 o RTX 3090 para inferencia individual de alta velocidad.
- GPU de consumo: cabe en GPUs con 8 GB o más en Q4_K_M o Q6_K (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en Q8_0 requiere al menos 6-8 GB libres. También es viable en CPU y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (rama raon-1-nano-preview de KRAFTON), vLLM, Transformers con trust_remote_code=True, MLX y LiteRT-LM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1 nano | 3,2B denso | 262.144 | Apache 2.0 | GGUF, safetensors, MLX, LiteRT-LM | Atención híbrida RDA/MLA, bilingüe coreano-inglés |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; como en cualquier modelo entrenado con datos web, cabe esperar sesgos sociales y culturales no mitigados explícitamente.
- Alucinación: no se han publicado métricas de fidelidad ni tasas de alucinación; en tareas de conocimiento factual conviene verificar las respuestas.
- Modo thinking por defecto: la plantilla de chat activa el razonamiento, lo que consume tokens de salida; hay que ajustar max_new_tokens para evitar respuestas truncadas.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se documenta la degradación de calidad en longitudes extremas; conviene validar en el caso de uso concreto.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad del cumplimiento normativo en su jurisdicción.
- Producción: no hay datos publicados de throughput ni latencia; es necesario realizar pruebas de carga propias antes de desplegar. La rama de llama.cpp necesaria para estos GGUF es una preview de KRAFTON, lo que implica menor madurez que la rama principal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Rama de llama.cpp con soporte: https://github.com/krafton-ai/llama.cpp/tree/raon-1-nano-preview
- Playground: https://raon-console.krafton.ai/playground/guest
- Web de KRAFTON AI: https://krafton.ai/en/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc

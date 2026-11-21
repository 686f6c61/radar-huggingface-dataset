# KRAFTON/Raon-1-nano-mlx

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2 mil millones de parámetros desarrollado por KRAFTON AI, diseñado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés. Se distribuye bajo licencia Apache 2.0 y forma parte de la familia de modelos Raon. Esta ficha concreta describe la variante `KRAFTON/Raon-1-nano-mlx`, una conversión de los pesos originales al formato MLX para Apple Silicon, cuantizada a 4 bits con GPTQ (group size 64).

La arquitectura es híbrida: combina 18 capas de atención lineal Raon Delta Attention (RDA) con 6 capas de Gated MLA, sobre un total de 24 capas. Emplea residuales Raon-mHC con cuatro flujos, embeddings por capa de 256 dimensiones y un vocabulario de 259.840 tokens. La ventana de contexto alcanza los 262.144 tokens, lo que la sitúa en la gama alta de modelos de su tamaño para tareas de contexto largo.

Su relevancia actual radica en dos factores: por un lado, ofrece contexto largo y soporte de tool calling en un modelo compacto que puede ejecutarse en hardware de consumo; por otro, la disponibilidad de pesos en MLX, GGUF (llama.cpp) y LiteRT-LM facilita el despliegue en dispositivos muy diversos, desde portátiles con Apple Silicon hasta servidores con GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.130.797.136 (3,2B, incluye tabla de embeddings por capa de 1,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits GPTQ (group size 64) en esta variante MLX; exportación BF16 disponible |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF y LiteRT-LM disponibles en otros repositorios |

Otros datos técnicos: 24 capas, hidden size de 1.536, FFN intermedio de 6.144, activación SwiGLU, 16 cabezas de atención para RDA (dimensión 128) y 32 para Gated MLA (192 QK / 128 V), rango LoRA de query/KV de 512/512, codificación posicional NoPE, LM head atado al embedding de entrada, vocabulario de 259.840 tokens y tamaño de repositorio de 1,9 GB.

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura densa con atención híbrida. Dieciocho de las 24 capas usan Raon Delta Attention (RDA), una atención lineal con regla delta con puertas de borrado y escritura separadas y un estado recurrente de tamaño fijo. Las seis capas restantes usan Gated MLA, que mantienen una caché KV de aproximadamente 7 KiB por token en BF16. Esta combinación reduce el coste de memoria en contextos largos frente a un transformer de atención completa equivalente.

El modelo incorpora dos innovaciones destacadas: Raon-mHC, una variante optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento, y embeddings por capa de 256 dimensiones que cada capa usa para ajustar su salida tras el MLP. El modelo no usa codificación posicional (NoPE). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno en coreano e inglés.
- Seguimiento de instrucciones y respuesta a preguntas de conocimiento.
- Llamada a herramientas (tool calling / function calling) para integrarse en flujos agénticos.
- Modo thinking activado por defecto en la plantilla de chat, con límite de tokens que incluye tanto el razonamiento como la respuesta final.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades de código y tareas agénticas, con parámetros de muestreo recomendados específicos (temperature 1.0, presence_penalty 0.0).
- Despliegue en dispositivo: pesos MLX para Apple Silicon, GGUF para llama.cpp y bundle LiteRT-LM.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversación y llamando a herramientas de consulta de pedidos o estado de cuenta.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar pruebas, con parámetros de muestreo ajustados para tareas agénticas.
- Asistentes agénticos multi-paso: el modo thinking y la llamada a funciones permiten encadenar razonamiento y acciones sobre APIs externas en flujos de automatización.
- Procesamiento de documentos largos: con 262.144 tokens de contexto puede resumir, extraer información o responder preguntas sobre contratos, informes o bases de conocimiento extensas.
- Despliegue en portátiles Apple Silicon: la variante MLX de 4 bits (1,9 GB) permite ejecutar el modelo localmente en Macs con memoria unificada, útil para prototipado y aplicaciones de privacidad.
- Aplicaciones bilingües coreano-inglés: adecuado para servicios de traducción, soporte o contenido dirigido a ambos mercados sin necesidad de modelos separados.
- Inferencia en el borde con LiteRT-LM: el bundle LiteRT-LM permite desplegar el modelo en entornos con recursos limitados donde no hay GPU dedicada.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (`raon-1-nano-benchmark.png`), pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible en formato tabular.

## Requisitos de hardware

- VRAM estimada: la variante MLX de 4 bits ocupa 1,9 GB en disco, por lo que la inferencia requiere aproximadamente 2-3 GB de memoria unificada o VRAM, más la caché KV (unos 7 KiB por token en BF16 solo en las capas MLA).
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) para la variante MLX; GPU NVIDIA (A100, H100, RTX 4090) y AMD para la variante GGUF con llama.cpp; CPU también soportada vía llama.cpp.
- Cabe en GPU de consumo: sí, con la cuantización de 4 bits es viable en GPUs consumer con 8 GB o más de VRAM y en Macs con memoria unificada.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM, llama.cpp, MLX y LiteRT-LM. Se puede lanzar un servidor compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 nano (MLX) | 3,2B | 262.144 | Apache 2.0 | MLX, GGUF, Transformers, LiteRT-LM |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual.
- Sesgos conocidos: no disponibles en la documentación proporcionada.
- El modo thinking está activado por defecto y consume tokens del límite de generación; es necesario ajustar `max_new_tokens` para respuestas largas.
- La variante MLX está cuantizada a 4 bits con GPTQ, lo que puede introducir una ligera degradación de calidad frente a los pesos BF16 originales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de las dependencias (Transformers, vLLM, llama.cpp).
- Para producción en contextos largos, la caché KV de las capas MLA (unos 7 KiB por token) debe dimensionarse adecuadamente.

## Enlaces

- Hugging Face (variante MLX): https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Página de KRAFTON AI: https://krafton.ai/en/
- Perfil de KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc

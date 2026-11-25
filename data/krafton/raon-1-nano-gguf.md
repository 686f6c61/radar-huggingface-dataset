# KRAFTON/Raon-1-nano-gguf

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2 mil millones de parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés. Forma parte de la familia de modelos Raon y se distribuye bajo licencia Apache 2.0.

La versión aquí descrita, KRAFTON/Raon-1-nano-gguf, es la conversión a formato GGUF del modelo base para su uso con llama.cpp, con cuantizaciones Q4_K_M, Q6_K, Q8_0 y F16 generadas a partir de los pesos BF16 mediante una rama específica de llama.cpp mantenida por KRAFTON. El repositorio suma más de 21.000 descargas y 55 me gusta en Hugging Face, y su tamaño total es de 29,1 GB (sumando todas las cuantizaciones).

Su interés técnico radica en una arquitectura híbrida poco habitual en modelos de este tamaño: combina 18 capas de atención lineal con estado recurrente fijo (Raon Delta Attention) y solo 6 capas de atención completa con caché KV, lo que reduce drásticamente el coste de memoria en contextos largos. Con una ventana de 262.144 tokens y soporte de despliegue en dispositivo (Apple silicon vía MLX, NVIDIA, AMD, CPU y LiteRT-LM), se posiciona como una opción compacta para escenarios conversacionales y agénticos con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 18 capas Raon Delta Attention (atención lineal con estado recurrente fijo) + 6 capas Gated MLA; sin codificación posicional (NoPE) |
| Parametros totales | 3.130.811.440 (3,2B, incluyendo una tabla de embeddings por capa de 1,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 (en este repositorio); MLX 4-bit y LiteRT-LM en otros repositorios |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); pesos originales en BF16/safetensors en el modelo base |

Otros datos de arquitectura: 24 capas, tamaño oculto 1.536, 16 cabezas en RDA (dimensión 128) y 32 cabezas en Gated MLA (192 QK / 128 V), rango LoRA de query/KV de 512/512, FFN intermedio de 6.144, activación SwiGLU, conexiones residuales Raon-mHC con 4 flujos, embedding por capa de 256 dimensiones, vocabulario de 259.840 tokens y LM head con pesos atados.

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura densa híbrida de 24 capas en la que 18 son capas de Raon Delta Attention (RDA) y 6 son capas de Gated MLA. RDA es una atención lineal con regla delta y compuertas separadas de borrado y escritura que mantiene un estado recurrente de tamaño fijo, de modo que solo las 6 capas MLA conservan caché KV (aproximadamente 7 KiB por token en BF16). Esta proporción 3:1 reduce de forma sustancial el coste de memoria en contextos largos frente a un transformer con atención completa en todas las capas. El modelo prescinde de codificación posicional (NoPE).

Dos innovaciones adicionales destacan en el diseño. Raon-mHC es una variante optimizada de las hyper-connections con restricción de variedad (mHC) de DeepSeek, que abarata el coste computacional y acelera el entrenamiento manteniendo cuatro flujos residuales. Además, cada capa dispone de su propio embedding de 256 dimensiones por token, que la capa utiliza tras su MLP para ajustar su salida antes de propagarla. El modelo base se distribuye en BF16 con implementación en PyTorch cargable mediante `trust_remote_code=True`.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican los datos de preentrenamiento más allá de los idiomas objetivo (coreano e inglés).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto en la plantilla de chat.
- Seguimiento de instrucciones y mantenimiento de contexto conversacional multi-turno.
- Llamada a herramientas (tool calling) en coreano e inglés, orientada a escenarios agénticos.
- Razonamiento multi-paso y uso en flujos de agente, con parámetros de muestreo recomendados específicos para tareas agénticas y de código (temperatura 1.0, sin penalización de presencia).
- Generación de código (la model card agrupa "agentic / code" como categoría de uso).
- Capacidades multilingües limitadas a coreano e inglés.
- Contexto largo de hasta 262.144 tokens, con caché KV reducida gracias al layout híbrido.
- Despliegue en dispositivo: GGUF para llama.cpp (Apple silicon, NVIDIA, AMD, CPU), MLX 4-bit para Apple silicon y bundle LiteRT-LM (este último responde sin modo thinking).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y servidor compatible con OpenAI vía llama.cpp y vLLM.

## Casos de uso

- Atención al cliente automatizada en coreano e inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262.144 tokens, y la caché KV reducida (unos 7 KiB por token en BF16) abarata mantener sesiones extensas en memoria.
- Asistentes agénticos con llamada a herramientas: con tool calling nativo y parámetros de muestreo recomendados para uso agéntico (temperatura 1.0, presencia 0.0), encaja en pipelines que encadenan varias llamadas a APIs y razonamiento multi-paso.
- Despliegue en dispositivo o en el borde: las cuantizaciones Q4_K_M y Q6_K permiten ejecutarlo con llama.cpp en Apple silicon, CPU y GPUs de consumo, útil para asistentes locales sin conexión.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o transcripciones extensas sin trocear el contenido.
- Generación de código en herramientas de desarrollo: puede integrarse en asistentes de edición o pipelines de CI/CD para autocompletado, generación de tests o explicación de fragmentos, apoyándose en el modo agéntico y en tool calling.
- Aplicaciones móviles y de borde con LiteRT-LM: el bundle LiteRT-LM permite respuestas sin modo thinking, adecuado para integraciones en dispositivos con recursos limitados.
- Chatbot bilingüe coreano-inglés para comunidades de videojuegos: dado el origen del modelo (KRAFTON), es un candidato natural para soporte y moderación conversacional en esos dos idiomas.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (`raon-1-nano-benchmark.png`), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado cifras de benchmarks en texto en la información disponible, por lo que no se presentan comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para 3,2B parámetros): aproximadamente 2 GB en Q4_K_M, 2,7 GB en Q6_K, 3,4 GB en Q8_0 y 6,5 GB en F16, sin contar la caché KV ni el overhead del runtime.
- Caché KV: solo las 6 capas MLA la mantienen, con unos 7 KiB por token en BF16; en un contexto de 262.144 tokens esto supone del orden de 1,8 GB adicionales en BF16, reducible con cuantización de la caché.
- GPU recomendadas: H100, A100 o GPUs de 24 GB (RTX 4090, RTX 3090) para F16 con contexto largo; GPUs de 8-12 GB suficientes para Q4_K_M/Q6_K con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores para cuantizaciones Q4_K_M y Q6_K; también en Apple silicon vía MLX 4-bit.
- Opciones de despliegue: llama.cpp (rama `raon-1-nano` de KRAFTON), vLLM, Transformers con `trust_remote_code=True`, MLX y LiteRT-LM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1 nano | 3,2B (denso, híbrido RDA/MLA) | 262.144 | Apache 2.0 | GGUF, MLX, LiteRT-LM, BF16 | Coreano e inglés; tool calling; modo thinking |
| Llama 3.2 3B | 3,2B (denso) | 128.000 | Llama 3.2 Community License | GGUF, safetensors | Multilingüe amplio; sin tool calling nativo destacado |
| Qwen2.5 3B | 3,1B (denso) | 32.768 (128K en variantes) | Apache 2.0 | GGUF, safetensors | Multilingüe; buen rendimiento en código |
| Gemma 2 2B | 2,6B (denso) | 8.192 | Gemma Terms of Use | GGUF, safetensors | Ligero, orientado a dispositivo |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y formatos.

## Limitaciones y advertencias

- Idiomas: solo coreano e inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Alucinación: no se publican métricas de fidelidad ni de tasa de alucinación; como en cualquier modelo de 3B, el riesgo en tareas de conocimiento factual es relevante.
- Contexto: aunque la ventana es de 262.144 tokens, no se documenta la degradación del rendimiento en longitudes cercanas al máximo.
- Modo thinking: activado por defecto; el límite de tokens de salida (`max_new_tokens`) incluye pensamiento y respuesta final, por lo que debe aumentarse para respuestas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y esta conversión dependen de una rama específica de llama.cpp de KRAFTON; verificar compatibilidad con versiones upstream antes de producción.
- Despliegue: la conversión GGUF se generó con una rama no estándar de llama.cpp (`raon-1-nano`); es posible que versiones estándar de llama.cpp no carguen el modelo correctamente.
- LiteRT-LM: el bundle responde sin modo thinking, lo que cambia el comportamiento respecto a otras rutas de despliegue.
- Datos de entrenamiento: no se detalla la composición del dataset ni si hubo alineación con RLHF/DPO, lo que dificulta evaluar riesgos de comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Rama de llama.cpp de KRAFTON: https://github.com/krafton-ai/llama.cpp/tree/raon-1-nano
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Imagen de benchmarks: https://huggingface.co/KRAFTON/Raon-1-nano/resolve/main/assets/raon-1-nano-benchmark.png

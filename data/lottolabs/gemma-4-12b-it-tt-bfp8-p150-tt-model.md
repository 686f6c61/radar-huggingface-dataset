# Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model

## Resumen

`Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model` es un paquete de despliegue comunitario que adapta el modelo denso `google/gemma-4-12B-it` de Google DeepMind para ejecutarse sobre una tarjeta Tenstorrent Blackhole P150. No se trata de un modelo nuevo ni de un fine-tune: es una conversión de pesos y un contenedor de servicio que empaqueta el modelo original en formato TTNN BFP8 (con embeddings en BF16) junto con un runtime basado en tt-metal y un plugin de vLLM, de modo que el modelo se sirve a través de una API compatible con OpenAI.

El modelo base es un decoder denso de 12.000 millones de parámetros con 48 capas, atención intercalada de ventana deslizante y atención completa, y una ventana de contexto nativa de 262.144 tokens. El paquete añade decodificación especulativa mediante el drafter `gemma-4-12B-it-assistant`, prefill troceado en bloques de 16.384 tokens, caché KV en anillos de 18.432 tokens para las capas de ventana deslizante y caché de prefijos exacta. Su relevancia radica en que demuestra el despliegue de un LLM de contexto largo sobre aceleradores Tenstorrent, una alternativa no-NVIDIA, con verificación de integridad de pesos mediante manifiestos y pruebas de equivalencia.

El paquete está pensado para un único usuario simultáneo sobre una sola P150, con licencia Apache-2.0 y sin necesidad de aceptar términos de acceso. Es un artefacto de infraestructura más que un modelo publicable de forma autónoma: sin el hardware Tenstorrent y el stack tt-metal/tt-cli no es utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 48 capas, atención intercalada de ventana deslizante y atención completa |
| Parametros totales | 12B (modelo base google/gemma-4-12B-it) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos de matrices de texto en TTNN BFP8; embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TTNN BFP8 (matrices de texto) + BF16 (embeddings), empaquetados como contenedor tt-model; no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 12.000 millones de parámetros con 48 capas que alterna capas de atención de ventana deslizante con capas de atención completa, lo que permite sostener una ventana de contexto nativa de 262.144 tokens con un coste de memoria KV controlado en las capas locales. El paquete de Lottolabs no reentrena ni modifica el modelo: convierte los pesos originales a TTNN BFP8 para las matrices de texto y mantiene los embeddings en BF16, y los empaqueta junto con un runtime de tt-metal personalizado y un plugin de vLLM para servir el modelo en la P150.

La innovación técnica del paquete está en el pipeline de servicio: decodificación trazada (traced decode), prefill troceado en bloques de 16.384 tokens, caché KV de ventana deslizante organizada en anillos de 18.432 tokens, decodificación especulativa con el drafter `gemma-4-12B-it-assistant` (K=5, con puerta de confianza más allá de 4.096 tokens; exacta para decodificación greedy y sin pérdida para peticiones con muestreo), muestreo exacto en dispositivo con un RNG Philox con semilla y caché de prefijos exacta en fronteras de 16.384 tokens con cuatro instantáneas en host. El cargador verifica cada fichero contra los manifiestos y las pruebas de equivalencia de la release antes de cargarlo. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento, con salida de razonamiento separada del contenido (`reasoning` / `reasoning_content` frente a `content`) mediante el parser `gemma4`.
- Tool calling / function calling habilitado con el parser `gemma4`: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Trabajo con contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa con el drafter assistant para acelerar la generación en el perfil por defecto.
- Caché de prefijos exacta para reutilizar el prefill en peticiones con prefijos comunes.
- Muestreo exacto en dispositivo con temperatura, top-k (1–64), top-p y penalizaciones de presencia, frecuencia y repetición.
- Servicio mediante API compatible con OpenAI (chat completions, completions y `/v1/models`) en el puerto 20000.
- Sin capacidades multimodales: imágenes, audio y vídeo se rechazan explícitamente.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite adjuntar documentación extensa o historiales completos sin truncar, gracias a la combinación de atención de ventana deslizante y caché KV en anillos.
- Análisis de documentos jurídicos o técnicos: con 262.144 tokens de ventana se pueden procesar contratos, informes o expedientes completos en una sola petición, y la caché de prefijos exacta acelera las consultas sucesivas sobre el mismo documento.
- Automatización con tool calling: el parser `gemma4` devuelve `tool_calls` estructurados, lo que permite integrar el modelo en flujos de agentes que invocan APIs externas, bases de datos o sistemas internos.
- Razonamiento multi-paso con separación de trazas: la salida de razonamiento en un campo aparte facilita auditar el proceso de decisión y separar el pensamiento del resultado final en aplicaciones de soporte a decisiones.
- Despliegue en infraestructura no-NVIDIA: organizaciones con aceleradores Tenstorrent P150 pueden servir un LLM de 12B con API OpenAI sin depender de GPUs NVIDIA, usando `tt serve` y el contenedor publicado.
- Evaluación de la pila tt-metal/vLLM: el paquete incluye manifiestos y pruebas de equivalencia, por lo que sirve como referencia reproducible para validar el rendimiento y la corrección de la pila de software de Tenstorrent en cargas de decodificación especulativa.
- Prototipado de agentes de un solo usuario: el perfil por defecto está dimensionado para un usuario concurrente (`max_num_seqs: 1`), adecuado para entornos de desarrollo, demos y validación de flujos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mediciones de rendimiento realizadas sobre el runtime `p3d-pc-gate-s1` a través de HTTP en una P150, pero los valores concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- Hardware obligatorio: una tarjeta Tenstorrent Blackhole P150. El paquete no funciona sobre GPU convencional.
- Espacio en caché de Hugging Face: aproximadamente 16 GB para `gemma-4-12B-it/` (14,7 GB) y `gemma-4-12B-it-assistant/` (1,2 GB), más espacio para la caché de kernels generada en el primer arranque.
- Primer arranque: la compilación de kernels para el dispositivo tarda varios minutos; los arranques posteriores reutilizan la caché.
- Software: Tenstorrent CLI (`tt`, instalable con `uv tool install tenstorrent`), Docker y el stack tt-metal/tt-model-manager (manifiesto esquema 5.1).
- Despliegue: `tt serve Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model` o, sin tt-cli, `tt-model serve Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model`. El servidor escucha en el puerto 20000 o en el siguiente libre.
- Perfiles de servicio: `speculative` (por defecto, decodificación especulativa y caché de prefijos), `no-speculation` (sin drafter, permite `min_p`, `logit_bias` y `min_tokens`) y `no-prefix-caching` (sin caché de prefijos).
- VRAM estimada, GPUs recomendadas, compatibilidad con GPU de consumo, latencia y throughput: no disponible. El paquete está atado a la P150 y no se documentan cifras de rendimiento en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|
| Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model | 12B (denso) | 262.144 | Apache-2.0 | Tenstorrent P150 | Hugging Face (0 descargas, 0 likes) |
| google/gemma-4-12B-it | 12B (denso) | 262.144 | Apache-2.0 | GPU convencional | Hugging Face (modelo base) |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | Apache-2.0 | GPU convencional | Hugging Face (drafter) |

El paquete de Lottolabs se distingue del modelo base únicamente por el formato de pesos (TTNN BFP8), el runtime de servicio (tt-metal + plugin vLLM) y las optimizaciones de despliegue (decodificación especulativa, prefill troceado, caché de prefijos). No se dispone de datos de benchmarks que permitan comparar el rendimiento en calidad con alternativas de la misma categoría, ni información sobre otros paquetes comparables para Tenstorrent.

## Limitaciones y advertencias

- Dependencia de hardware: requiere una Tenstorrent Blackhole P150; no es ejecutable en GPU NVIDIA, AMD ni CPU convencional.
- Un solo usuario concurrente: todos los perfiles fijan `max_num_seqs: 1`, por lo que no es adecuado para servir cargas concurrentes sin escalar horizontalmente.
- Restricciones del perfil especulativo: con la decodificación especulativa activa, vLLM rechaza `min_p`, `logit_bias` y `min_tokens` con HTTP 400; es necesario cambiar al perfil `no-speculation`.
- Muestreo en host para ciertas opciones: `logprobs`, `allowed_token_ids`, `bad_words`, `logit_bias`, salidas estructuradas y top-k fuera del rango 1–64 usan el sampler exacto en host, un token por paso, con la consiguiente pérdida de rendimiento.
- Sin capacidades multimodales: imágenes, audio y vídeo se rechazan explícitamente.
- Idiomas soportados: no disponible en la información proporcionada.
- Primer arranque lento: la compilación de kernels puede tardar varios minutos.
- Paquete comunitario: no es una release oficial de Google ni de Tenstorrent; la responsabilidad de mantenimiento recae en Lottolabs.
- Sesgos y riesgo de alucinación: heredados del modelo base `google/gemma-4-12B-it`; no se documentan análisis específicos en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes del runtime (tt-metal, vLLM) por separado.
- Cero adopción registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/Lottolabs/gemma-4-12B-it-TT-BFP8-P150-tt-model
- Pesos de la release: https://huggingface.co/Lottolabs/gemma-4-12B-it-TT-BFP8-P150
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Drafter assistant: https://huggingface.co/google/gemma-4-12B-it-assistant
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/gemma-4-12b-it-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/gemma-4-12b-it-p150
- Plugins de tt-model: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/gemma-4-12b-it-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md

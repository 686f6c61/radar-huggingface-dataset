# haohan84/darksurf-models

## Resumen

DarkSurf Models es un repositorio de modelos de lenguaje y de reconocimiento automático del habla (ASR) empaquetados en formato GGUF para su ejecución local en dispositivos Apple (macOS e iOS) mediante llama.cpp con backend Metal. Lo mantiene el usuario haohan84 como catálogo de distribución del proyecto DarkSurf, un navegador centrado en privacidad, y no contiene pesos entrenados desde cero: redistribuye dos modelos de la familia Qwen de Alibaba, cuantizados y verificados contra su versión en precisión completa.

El repositorio incluye dos artefactos. El primero es Qwen3.5-0.8B en cuantización dinámica de 4 bits (UD-Q4_K_XL de Unsloth), un modelo de texto de 0,8 mil millones de parámetros pensado para resúmenes, extracción de información y preguntas simples sobre páginas web. El segundo es Qwen3-ASR-0.6B en Q8_0, un modelo de voz a texto de 596 millones de parámetros que cubre 52 idiomas, convertido a GGUF por el propio autor con parches específicos sobre el conversor de llama.cpp.

La relevancia del repositorio es práctica más que arquitectónica: documenta mediciones reproducibles (perplejidad, velocidad de prefill y decodificación, tasa de error de palabras) en un Apple M4 y ofrece un catálogo firmado con Ed25519 para que las aplicaciones verifiquen integridad y procedencia de cada descarga. Es, por tanto, una referencia útil para quien despliegue inferencia en el dispositivo con restricciones de memoria y sin conexión a servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B para texto; Qwen3-ASR-0.6B con encoder de audio y M-RoPE para voz) |
| Parámetros totales | 596.049.920 (ASR); 0,8B (modelo de texto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens recomendado en texto; 4096 tokens recomendado en ASR (por defecto 65 536, requiere 8 GiB solo de KV cache) |
| Tipos de cuantización | UD-Q4_K_XL (texto), Q8_0 (ASR y proyector de audio) |
| Idiomas soportados | Inglés y vietnamita declarados en la model card; el ASR cubre 52 idiomas según el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el ASR requiere dos ficheros: modelo y `mmproj` del encoder de audio |

## Arquitectura y entrenamiento

Los pesos no han sido entrenados por el autor del repositorio. El modelo de texto es Qwen3.5-0.8B, un transformer denso de 0,8B parámetros de la familia Qwen3.5, distribuido en cuantización dinámica de 4 bits de Unsloth y copiado sin modificaciones (SHA-256 `3177ebd67afe4438374da19e690bc1b98756f7e0fea9240e1be404336156a7b5`). El modelo de voz es Qwen3-ASR-0.6B, un sistema ASR con encoder de audio separado que emplea M-RoPE; su conversión a GGUF requirió dos correcciones sobre el conversor estándar de llama.cpp (configuración anidada y nombres de tensores del encoder de audio, además de las secciones M-RoPE). El autor afirma que los ficheros convertidos coinciden tensor a tensor con los GGUF oficiales de `ggml-org`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) de los modelos base en la documentación proporcionada. La innovación destacable del repositorio es el proceso de validación: cada modelo publicado se compara contra su original en precisión completa, y el catálogo `catalog.json` se firma con Ed25519 para que las aplicaciones verifiquen la integridad de cada descarga mediante tamaño y SHA-256.

## Capacidades

- Generación de texto, resumen de una frase, extracción de información y preguntas simples sobre el contenido de una página.
- Traducción, con calidad fluida en vietnamita pero con errores de significado según el propio autor.
- Modo thinking de Qwen3.5, desactivable mediante un bloque `<think></think>` vacío en el prompt ChatML para reducir latencia.
- Reconocimiento automático del habla en 52 idiomas, incluido el vietnamita, con etiqueta de idioma por grabación.
- Ejecución totalmente local en el dispositivo, sin envío de prompts ni texto de páginas a servidores.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni visión (el modelo de texto se distribuye sin proyector visual).

## Casos de uso

- Resumen de páginas web en el navegador DarkSurf: el modelo de 0,8B genera resúmenes de una frase o párrafo sobre el texto extraído de la página, con 8192 tokens de contexto y sin salir del dispositivo.
- Preguntas y respuestas sobre el contenido de una página: extracción de datos concretos (fechas, nombres, cifras) mediante prompts ChatML, adecuado por su bajo consumo de memoria (3 GB mínimos estimados).
- Traducción rápida en el dispositivo: útil para inglés-vietnamita en lectura de contenido, con la advertencia de que las traducciones al vietnamita pueden contener errores de significado.
- Transcripción de notas de voz y reuniones cortas: el modelo ASR procesa 40 segundos de audio en unos 2 segundos tras 0,9 segundos de carga, aproximadamente 20 veces más rápido que tiempo real en un M4.
- Subtitulado y dictado en aplicaciones iOS/macOS: integración in-process enlazando llama.cpp como xcframework con Metal, con contexto de 4096 tokens y descarga del modelo bajo demanda.
- Procesamiento de audio multilingüe: cobertura de 52 idiomas con etiqueta de idioma por grabación, útil para clasificar y transcribir contenido en inglés y vietnamita.
- Escenarios de privacidad estricta: atención al usuario o análisis documental en entornos sin conectividad, donde el texto nunca abandona el dispositivo.

## Benchmarks y rendimiento

Mediciones del autor en Apple M4 con llama.cpp `3c809f4` (Metal), perplejidad sobre wikitext-2 con 100 fragmentos de 512 tokens:

| Modelo | Tamaño | Perplejidad | vs bf16 | Mismo top-1 que bf16 | Prefill | Decode |
|---|---:|---:|---:|---:|---:|---:|
| bf16 (referencia) | 1,40 GiB | 18,52 | — | — | 1866 tok/s | 51 tok/s |
| UD-Q4_K_XL | 532 MiB | 18,79 | +1,5% | 92,0% | 1736 tok/s | 103 tok/s |

El autor indica que la cuantización dinámica de 4 bits pierde aproximadamente la mitad que un Q4_K_M estándar (+3,3%) a cambio de 25 MiB adicionales.

Para el modelo ASR, sobre tres clips cortos (voz sintética en inglés y vietnamita, y un clip de LibriSpeech):

| Métrica | Resultado |
|---|---|
| Tasa de error de palabras | 1,8%, idéntica a la referencia fp32 de transformers (clip vietnamita 0%) |
| Velocidad | 40 s de audio en ~2 s tras 0,9 s de carga (~20x tiempo real) |
| Memoria | 0,8 GiB de pico con contexto de 4096 tokens (1,4 GiB residente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 3 GB mínimos para el modelo de texto UD-Q4_K_XL (559 MB en disco); 3 GB mínimos para el ASR Q8_0 (847 MB en disco entre modelo y `mmproj`).
- Memoria del ASR: 0,8 GiB de pico con contexto de 4096 tokens y 1,4 GiB residente; con el contexto por defecto de 65 536 tokens el KV cache solo necesita 8 GiB.
- GPU recomendadas: Apple Silicon con Metal (medido en M4); no se documentan mediciones en GPU NVIDIA ni en iPhone o iPad.
- Cabe en hardware de consumo: sí, en equipos Apple con al menos 3 GB de RAM disponible; el autor advierte que velocidad y memoria no se han medido aún en iPhone ni iPad.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-mtmd-cli`), integración como xcframework con Metal en aplicaciones iOS/macOS; descarga mediante `hf download` y catálogo firmado `catalog.json`.
- Latencia y throughput: prefill de 1736 tok/s y decodificación de 103 tok/s en M4 para el modelo de texto; ASR a ~20x tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| DarkSurf Qwen3.5-0.8B UD-Q4_K_XL | 0,8B | 8192 recomendado | GGUF Q4 | Apache-2.0 | HuggingFace (este repo) |
| Qwen3.5-0.8B (original) | 0,8B | No disponible | safetensors/bf16 | Apache-2.0 | HuggingFace (Qwen) |
| Qwen3-ASR-0.6B (original) | 0,6B | 65 536 por defecto | safetensors | Apache-2.0 | HuggingFace (Qwen) |
| Qwen3-ASR-0.6B GGUF oficial | 0,6B | 65 536 por defecto | GGUF | Apache-2.0 | `ggml-org` |

La comparativa relevante es contra los originales en precisión completa: la versión UD-Q4_K_XL sacrifica un 1,5% de perplejidad y mantiene el 92% de coincidencia en top-1, mientras que el ASR Q8_0 iguala la tasa de error de la referencia fp32 en la muestra medida.

## Limitaciones y advertencias

- El modelo de texto es de 0,8B: débil en razonamiento largo y en textos no ingleses; las traducciones al vietnamita son fluidas pero contienen errores de significado.
- La perplejidad se midió solo en inglés.
- La evaluación del ASR se basa en tres clips, descrita por el autor como prueba de humo y no como benchmark de precisión; no se midieron ruido, acentos, grabaciones largas ni streaming.
- El ASR imprime una única etiqueta de idioma por grabación, lo que limita el audio con cambio de idioma.
- Velocidad y memoria no se han medido en iPhone ni iPad; el mínimo de RAM es una estimación.
- La conversión del ASR requirió parches sobre el conversor de llama.cpp; versiones distintas del runtime pueden no cargar los ficheros.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en resúmenes y extracción de datos.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones y sesgos de los modelos base de Qwen; no se documentan sesgos específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/haohan84/darksurf-models
- Modelo base de texto: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Modelo base ASR: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp

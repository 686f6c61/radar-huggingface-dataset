# infosave/NeoHorse-1-4B-cmf

## Resumen

NeoHorse-1-4B-cmf es un empaquetado cuantizado, en formato CMF de archivo único, del modelo TokenRhythm/NeoHorse-1-4B, un ajuste fino de 4,21B parámetros basado en Qwen3.5-4B. El repositorio, publicado por el usuario infosave, no contiene pesos tradicionales en safetensors ni GGUF, sino un contenedor `.cmf` pensado para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML y funciona sobre NVIDIA, AMD e Intel (vía Vulkan/DX12), Apple silicon (Metal) y CPU.

El modelo base destaca por su arquitectura híbrida: 24 capas de atención lineal intercaladas con 8 capas de atención completa (una de cada cuatro), con un contexto declarado de 256k tokens y post-entrenamiento orientado a uso agéntico y tool use. Es un modelo solo de texto: la torre de visión de Qwen3.5 no está incluida en este checkpoint.

Su relevancia actual radica en la combinación de un tamaño pequeño (4B), una arquitectura de atención híbrida eficiente en contexto largo y un empaquetado cuantizado de bajo consumo: la variante de 4 bits ocupa 2,22 GB y funciona en portátiles con 6-8 GB de VRAM o directamente en CPU, con velocidades de decodificación de hasta 165 tok/s en una RTX 5080.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal + 8 capas de atención completa (una cada 4 capas) |
| Parametros totales | 4,21B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens (declarado) |
| Tipos de cuantizacion | 4-bit con escaleras de escala por fila (`q4tp`, 2,22 GB) y 8-bit `q8_2f` (4,24 GB), cuantizados desde el checkpoint bf16 |
| Idiomas soportados | inglés, ruso, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (archivo único, para el motor cortiq); no hay safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-4B que sustituye la atención completa por un esquema híbrido: 24 de las 32 capas usan atención lineal y 8 capas (una de cada cuatro) conservan atención exacta con caché KV. Este diseño reduce drásticamente el coste de memoria y cómputo en contexto largo, manteniendo atención exacta en una fracción de las capas. El header del checkpoint declara una cabeza MTP (multi-token prediction) para decodificación especulativa, pero los pesos publicados no la incluyen, por lo que el motor carga sin ella.

Sobre el entrenamiento del modelo base, la model card indica que hubo post-entrenamiento agéntico y de tool use, y que el modelo hereda el modo de razonamiento (thinking) de la familia Qwen3.5, con protocolos de muestreo diferenciados para modo thinking y modo directo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible.

La cuantización de este repositorio se realiza directamente desde el checkpoint bf16 en una única pasada en streaming. El perfil `q4tp` usa nibbles de 4 bits con una escalera de escalas geométricas por fila; el perfil `q8_2f` combina 201 matrices cuantizadas a 8 bits con 225 entradas de embeddings, normas y cabezas en f16.

## Capacidades

- Generación de texto general con modo de razonamiento (thinking) activable y modo directo (`--no-think`) para respuestas sin bloque de razonamiento.
- Post-entrenamiento para uso agéntico y tool calling (heredado del modelo base), aunque este empaquetado no publica benchmarks específicos de funciones.
- Contexto declarado de 256k tokens, con rendimiento medido a 16k tokens de prompt (107 tok/s de decodificación en RTX 5080 con 4 bits).
- Multilingüe: inglés, ruso y chino (la batería de calidad incluye pruebas en ruso con resultados correctos).
- Aritmética básica fiable: `17 * 23 = 391` correcto en ambos perfiles y en CPU y GPU.
- Control de formato de salida: instrucciones de longitud exacta (dos frases sobre Moscú) cumplidas en todos los perfiles.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) mediante `cortiq serve`.
- Solo texto: sin capacidades de visión ni audio.

## Casos de uso

- Chatbots locales en portátiles: con 2,22 GB en 4 bits cabe en GPUs integradas o de 6-8 GB de VRAM, y en CPU de 6 núcleos mantiene 5,9 tok/s, suficiente para conversación de un usuario.
- Asistentes con contexto de documentos largos: la atención lineal en 24 de 32 capas permite procesar prompts de 16k tokens a 801 tok/s de prefill en GPU, adecuado para resumen y consulta de documentos extensos.
- Backend de API compatible con OpenAI: `cortiq serve` expone endpoints estándar, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente.
- Agentes con tool use: el post-entrenamiento agéntico del modelo base lo orienta a flujos multi-paso con llamadas a funciones, aunque conviene validar cada caso.
- Razonamiento paso a paso configurable: el modo thinking (temperature 1.0, top_p 0.95) para problemas que requieren deliberación y `--no-think` para respuestas rápidas.
- Inferencia en CPU en servidores sin GPU: 17,1 tok/s en un host de 16 núcleos hace viable despliegue en máquinas convencionales.
- Generación de código con supervisión: el perfil de 8 bits produce lambdas de Python válidas en pruebas de una línea, aunque con limitaciones (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican mediciones propias de perplejidad, velocidad y una batería de calidad cualitativa.

Perplejidad en wikitext-2 (doce ventanas de 512 tokens, atención exacta, RTX 5080):

| Archivo | Cuantización | Tamaño | wikitext-2 ppl |
|---|---|---:|---:|
| `neohorse-1-4b-q4tp.cmf` | 4-bit | 2,22 GB | 13,42 |
| `neohorse-1-4b-q8_2f.cmf` | 8-bit | 4,24 GB | 12,66 |

Velocidad de decodificación de un stream (`cortiq bench --core --ignore-eos`):

| Hardware | Backend | Archivo | Decode (tok/s) | Prompt processing (tok/s) | TTFT |
|---|---|---|---:|---:|---:|
| RTX 5080 (16 GB) | Vulkan | q4tp | 165,0 | 685 | 0,06 s |
| RTX 5080 (16 GB) | Vulkan | q8_2f | 109,4 | 261 | 0,16 s |
| Host x86 16 núcleos | CPU | q4tp | 17,1 | 69,2 | 0,59 s |
| Host x86 6 núcleos | CPU | q4tp | 5,9 | 14,2 | 2,94 s |
| Host x86 6 núcleos | CPU | q8_2f | 4,5 | 22,9 | 1,70 s |

Contexto largo (RTX 5080, Vulkan):

| Prompt | Archivo | Prefill (tok/s) | TTFT | Decode a esa profundidad (tok/s) |
|---|---|---:|---:|---:|
| 1.000 tokens | q4tp | 1.330 | 0,75 s | 156,0 |
| 1.000 tokens | q8_2f | 299 | 3,34 s | 102,2 |
| 16.000 tokens | q4tp | 801 | 20,0 s | 107,2 |
| 16.000 tokens | q8_2f | 260 | 61,5 s | 78,5 |

Batería de calidad (greedy, `--no-think`): aritmética `17 * 23` correcta en todos los perfiles; fecha del inicio de la Segunda Guerra Mundial en ruso correcta; factorial en Python correcto solo con `q8_2f` (ambos perfiles de 4 bits fallan el formato de código de una línea); el silogismo con término medio no distribuido (rosas/flores) falla en todos los perfiles; restricciones de formato de dos frases cumplidas en todos los casos.

## Requisitos de hardware

- VRAM estimada: 2,22 GB para la variante 4-bit (recomendado 6-8 GB de VRAM o CPU); 4,24 GB para la variante 8-bit (recomendado 8 GB o más).
- GPU recomendadas: cualquier GPU con Vulkan o DX12 (NVIDIA, AMD, Intel); medido en RTX 5080 de 16 GB con 165 tok/s en 4 bits. Apple silicon soportado vía Metal (sin cifras publicadas).
- Consumer GPUs: cabe sobradamente en GPUs de 8 GB (RTX 3060, RTX 4060) en ambos perfiles; no se necesitan tarjetas de gama datacenter.
- CPU: viable; el óptimo en un host de 6 núcleos son 5-6 hilos (12 hilos con SMT es un 20 % más lento). q4tp decodifica un 30 % más rápido que q8_2f, pero su prefill es 1,6× más lento.
- Despliegue: exclusivamente con el motor `cortiq` (binarios precompilados para Linux, macOS y Windows, o `cargo install cortiq-cli`); no compatible con vLLM, llama.cpp, Ollama ni TGI por el formato CMF. Incluye servidor OpenAI-compatible.
- Latencia: TTFT de 0,06 s en RTX 5080 con prompt corto; 2,94 s en CPU de 6 núcleos. A 16k tokens de contexto, TTFT de 20 s (q4tp) en RTX 5080.
- No activar `--o1` (ruta Nyström O(1)): con 24/32 capas ya lineales solo añade sobrecoste; la decodificación cayó de 107 a 33 tok/s a 16k en RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B (base) | 4,21B | 256k | Híbrido lineal + atención completa | Apache-2.0 | HuggingFace (TokenRhythm) |
| Qwen3.5-4B (base del fine-tune) | 4B | no disponible en la info proporcionada | Transformer con torre de visión | no disponible | HuggingFace |
| Qwen3-4B | 4B | 32k (según documentación pública de la familia) | Transformer denso | Apache-2.0 | HuggingFace, GGUF, vLLM, Ollama |

Diferenciador clave frente a alternativas de 4B: la atención híbrida permite contexto declarado de 256k con degradación contenida de velocidad (107 tok/s a 16k frente a 156 tok/s a 1k en 4 bits), pero a cambio exige el motor propietario `cortiq` y el formato CMF, sin soporte del ecosistema estándar (llama.cpp, vLLM).

## Limitaciones y advertencias

- Razonamiento lógico débil: falla de forma consistente el silogismo con término medio no distribuido (responde «sí» incorrectamente) en todos los perfiles y backends.
- Degradación por cuantización: el perfil de 4 bits produce código Python de una línea con errores de formato (aunque la aritmética interna es correcta); para generación de código se recomienda el perfil de 8 bits.
- No activar `--o1` con este modelo: empeora el rendimiento de forma significativa.
- Sin decodificación especulativa: el header declara una cabeza MTP que no está en los pesos publicados.
- Solo texto: la torre de visión de Qwen3.5 no está incluida.
- Ecosistema cerrado al formato CMF: no funciona con vLLM, llama.cpp, Ollama, TGI ni ninguna librería Python estándar; dependencia total del motor `cortiq` y su madurez.
- Idiomas: soporte declarado solo para inglés, ruso y chino; el rendimiento en castellano no está documentado.
- El contexto de 256k es un valor declarado; las mediciones publicadas llegan hasta 16k tokens.
- Riesgo de alucinación no cuantificado: no hay benchmarks estándar publicados, por lo que la fiabilidad factual debe validarse caso por caso antes de producción.
- Repositorio de comunidad con muy poca tracción (435 descargas, 1 like al momento de la ficha): conviene tratarlo como experimental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/infosave/NeoHorse-1-4B-cmf
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados (releases): https://github.com/infosave2007/cmf/releases

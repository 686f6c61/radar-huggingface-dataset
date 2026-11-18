# officialmobai/station-9b

## Resumen

Station 9B es un paquete de pesos cuantizados de Ornith-1.5-9B, un modelo de lenguaje de 9 mil millones de parámetros, reempaquetado específicamente para ejecutarse en la GPU de una PlayStation 4 mediante la aplicación homebrew Station AI. No se distribuye en formato GGUF ni como checkpoint de `transformers`, sino en un formato propietario de consola (`PMQ5`/`PMTP`) con cuatro ficheros que la aplicación carga desde `/data/models`.

El modelo base, Ornith-1.5-9B (licencia MIT), emplea una arquitectura híbrida que combina atención con mecanismos de espacio de estados (SSM) de tipo delta-rule, según se deduce de la presencia de tensores `conv1d`, `A`, `dt_bias` y `ssm_a` en el layout. La conversión reduce los pesos a 4,5 bits (con las dos matrices MLP más grandes a 3,5 bits) para encajar en los 5,5 GiB de GDDR5 útil de una PS4 base, e incluye una cabeza de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa.

Su relevancia es acotada pero singular: demuestra que es viable ejecutar un modelo de 9B con decodificación especulativa en hardware de 2013 con 5,5 GiB de memoria gráfica, alcanzando entre 31 y 39 tokens por segundo. El vocabulario es el de Qwen3.5, con 248 070 tokens y 247 587 merges, y el modelo declara soporte para inglés, español, portugués y ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM (delta-rule value heads, `conv1d`, `ssm_a`); 32 capas; base Qwen3.5 en vocabulario |
| Parámetros totales | 9 mil millones (modelo base Ornith-1.5-9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo indica que "un contexto largo es más lento") |
| Tipos de cuantización | `q3s` (3,5 bits) en MLP gate/up; `q4s` (4,5 bits) en el resto de matrices; `q4row` en input embedding; `lm_head` a 4 bits; normas y parámetros SSM en f32 |
| Idiomas soportados | inglés, español, portugués, ruso (probados en hardware); otros posibles vía vocabulario Qwen3.5 sin verificar |
| Licencia | MIT |
| Formato de pesos | Formato propietario de PS4: `ornith-1.5-9b-q4s.bin` (4,32 GiB), `ornith-1.5-9b-mtp.bin` (203 MiB), `model.idx` (`PMQ5`), `mtp.idx` (`PMTP`) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B presenta una arquitectura híbrida: además de capas transformer convencionales, incorpora mecanismos de espacio de estados con 32 cabezas de valor delta-rule, tensores `conv1d`, `A`, `dt_bias` y `gnorm`, y un parámetro `ssm_a` almacenado como `-exp(A_log)`. El vocabulario corresponde al de Qwen3.5 (248 070 tokens, 247 587 merges), con tokens especiales `<|im_start|>`, `<|im_end|>`, `<|endoftext|>`, `<think>` y `</think>` en los identificadores 248045, 248046, 248044, 248068 y 248069 respectivamente.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. La innovación técnica destacable de este paquete es el reempaquetado para consola: los pesos se convierten desde el GGUF BF16 del modelo base mediante `pc/ornith_convert.py`, en una transformación determinista (mismo sha256 en cada ejecución). La conversión reordena las 32 cabezas de valor delta-rule al orden de Hugging Face (llama.cpp las almacena intercaladas como `(16 key heads × 2)` transpuestas), escribe los pesos RMSNorm con el offset de llama.cpp y mantiene `ssm_a` como `-exp(A_log)`. El layout se verifica tensor a tensor contra el índice de Hugging Face mediante `pc/ornith_check_layout.py`. La cabeza MTP permite decodificación especulativa: la app redacta dos tokens por adelantado y el modelo completo los verifica.

## Capacidades

- Generación de texto conversacional: chat multi-turno, resúmenes y traducción, según la propia model card.
- Generación de código a pequeña escala ("small code").
- Razonamiento básico y aritmética, con regresiones esperadas por la cuantización a 3,5 bits en las matrices MLP mayores.
- Modo de pensamiento: el vocabulario incluye los tokens `<think>` y `</think>`, lo que sugiere soporte de razonamiento explícito, aunque la plantilla de chat reside en la aplicación, no en los ficheros.
- Multilingüe en inglés, español, portugués y ruso (verificados en hardware).
- Decodificación especulativa mediante cabeza MTP (`ornith-1.5-9b-mtp.bin`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente conversacional en PlayStation 4: la aplicación Station AI carga los pesos y mantiene conversaciones multi-turno directamente en la consola, con 31-39 tokens/s gracias a la cabeza MTP. Es el caso de uso principal y el único soportado oficialmente.
- Resúmenes de texto en local: el modelo base está descrito como "capaz para chat, resúmenes", por lo que puede resumir documentos introducidos en la conversación, sujeto a la longitud de contexto no especificada.
- Traducción entre inglés, español, portugués y ruso: los cuatro idiomas están verificados en hardware, lo que permite usarlo como traductor local en la consola sin conexión a servicios externos.
- Generación de código de pequeña escala: útil para fragmentos cortos o scripts, no para proyectos grandes, dado el tamaño del modelo y la cuantización agresiva.
- Demostración e investigación en hardware restringido: sirve como banco de pruebas para estudiar decodificación especulativa y cuantización mixta (3,5/4,5 bits) en GPUs con 5,5 GiB de memoria.
- Uso educativo en homebrew de consola: el repositorio de la aplicación y el script de conversión permiten reproducir el pipeline completo (GGUF BF16 → formato PS4) y estudiar el layout `PMQ5`.
- Despliegue en PC: no aplica a este paquete; para PC debe usarse el modelo base o un GGUF del mismo, según indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son de velocidad de generación en hardware de consola:

| Métrica | Base PS4 |
|---|---|
| Generación sin draft head | ~20 tokens/s |
| Generación con `ornith-1.5-9b-mtp.bin` | ~31-39 tokens/s |
| Memoria de pesos en GPU | ~3,8 GiB más KV cache |
| GDDR5 útil en consola | 5,5 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,8 GiB de pesos más KV cache, sobre 5,5 GiB de GDDR5 útil en una PS4 base (junto con UI y buffers de vídeo).
- GPU recomendadas: GPU de PlayStation 4 (base o Pro); no se documenta soporte para GPUs de PC en este paquete.
- ¿Cabe en GPU de consumo? El paquete está diseñado exclusivamente para PS4; para GPUs de consumo debe usarse el modelo base o un GGUF del mismo.
- Opciones de despliegue: únicamente la aplicación Station AI (fork de Garlic LLM) sobre GoldHEN, con ~5 GiB libres en `/data`. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: ~20 tokens/s sin draft head y ~31-39 tokens/s con MTP en PS4 base; una PS4 Pro es más rápida y los contextos largos reducen la velocidad.
- Requisitos de software: GoldHEN y OpenOrbis PS4 Toolchain (para compilar la app); descarga vía HTTP con reanudación por `Range:` o copia por FTP de los cuatro ficheros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Station 9B | 9B (base Ornith-1.5-9B) | no disponible | Propietario PS4 (`PMQ5`) | MIT | Solo PS4 con Station AI |
| Ornith-1.5-9B (base) | 9B | no disponible | GGUF BF16 / `transformers` | MIT | Hugging Face, PC |
| Qwen3.5 (referencia de vocabulario) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "de bolsillo": la propia model card lo describe como un asistente capaz para chat, resúmenes, código pequeño y traducción, pero no un sustituto de un modelo grande en razonamiento difícil; alucina con confianza.
- La cuantización a 3,5 bits en las dos matrices más grandes introduce regresiones en aritmética de números largos y en idiomas poco habituales.
- Solo se han verificado cuatro idiomas (inglés, español, portugués, ruso) en hardware; otros funcionan por vocabulario pero no están comprobados.
- El paquete solo se ejecuta en la aplicación Station AI sobre PlayStation 4; no hay `config.json` ni tokenizer incluidos, y la plantilla de chat, la keep list y los tokens de parada viven en la app.
- La licencia MIT del modelo base permite uso comercial, pero el formato propietario y la dependencia de la app homebrew limitan su uso en producción a ese ecosistema.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- La longitud de contexto no está especificada, lo que impide planificar cargas con documentos largos.
- El rendimiento depende del estado de la consola: contextos largos reducen la velocidad de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/officialmobai/station-9b
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de Station AI (garlicornith): https://github.com/mobjakdebug/garlicornith
- Releases de Station AI: https://github.com/mobjakdebug/garlicornith/releases
- Script de conversión: https://github.com/mobjakdebug/garlicornith/blob/main/pc/ornith_convert.py
- Garlic LLM (proyecto original de Leonardo Alegría): https://github.com/leonardo-alegria/garlic-llm
- OpenOrbis PS4 Toolchain: https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain
- GoldHEN: https://github.com/GoldHEN/GoldHEN
- Zig: https://ziglang.org
- Tipografía Inter (Rasmus Andersson, SIL OFL 1.1): https://rsms.me/inter/

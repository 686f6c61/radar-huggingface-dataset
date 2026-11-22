# nicolamanzini/Rumble-2-Flash-transcribe-cpp-GGUF

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) de aproximadamente 508 millones de parámetros, construido sobre la arquitectura `qwen3_asr` y derivado de `Qwen/Qwen3-ASR-0.6B`. Lo desarrolla Reson8 y resuelve el problema de la transcripción de audio multilingüe con un coste computacional bajo, lo que permite ejecutarlo en hardware de consumo. Esta ficha describe concretamente el repositorio `nicolamanzini/Rumble-2-Flash-transcribe-cpp-GGUF`, un reempaquetado no oficial de la comunidad que convierte los pesos originales al formato GGUF Q8_0 para su uso con `transcribe.cpp` y aplicaciones derivadas como Hex.

El contenedor GGUF ocupa 557 MB (0,56 GB) y mantiene los pesos sin cambios respecto al checkpoint original; solo difieren el formato de serialización y la precisión. El modelo cubre 30 idiomas declarados en `config.json` (aunque la model card original anuncia 45, una discrepancia que el propio autor del repackaging señala) y está pensado para dictado y transcripción de clips de duración moderada, no para streaming.

Su relevancia actual radica en que ofrece ASR multilingüe con licencia Apache-2.0, ejecutable localmente en Apple Silicon vía Metal y en Windows/Linux vía Vulkan o CPU, con velocidades medidas de 8 a 18 veces tiempo real en un Apple M1 de 8 GB. Es una alternativa ligera y de código abierto frente a servicios de transcripción en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_asr` (transformer encoder-decoder para ASR, derivado de Qwen3-ASR-0.6B) |
| Parametros totales | 508.657.680 (~0,51 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.000 tokens (límite del contexto del modelo; ~12,5 tokens por segundo de audio) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado); el runtime Hex soporta F32/F16/Q8_0 por defecto y K-quants en modo Labs |
| Idiomas soportados | 30: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Rumble-2-Flash-Q8_0.gguf`, 557.329.984 bytes, SHA-256 `bef26807d155ddb50a92aac5c985d51e7cd9206e311b51d640482d1d3e5431af`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `qwen3_asr`, un transformer diseñado para transcripción de voz, con `general.architecture = qwen3_asr` y `stt.variant = rumble-2-flash` en los metadatos del GGUF. Deriva de `Qwen/Qwen3-ASR-0.6B` a través de `Reson8/Rumble-2-Flash` (commit `95bd5f9`). El proceso de conversión a GGUF, realizado con `convert-qwen3_asr.py` del proyecto transcribe.cpp (commit `cfa237c`) más dos parches, mapea el layout de tensores de Transformers 5 a los nombres `thinker.*` que espera el conversor, e incrusta tokenizer, hiperparámetros y frontend. La cabeza `ctc/` se omite en este archivo.

Una innovación relevante del repackaging es el parche de runtime (35 líneas) que hace que transcribe.cpp emita los tokens de control propios de Rumble (`<digits>`, `<nofiller>`, `<verbatim>`); sin él, la transcripción deletrea los números en lugar de formatearlos. El parche de layout (63 líneas) no afecta a este archivo. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto multilingüe en 30 idiomas, incluidos chino, inglés, cantonés, árabe, alemán, francés, español, portugués, coreano, ruso, japonés, hindi y tailandés, entre otros.
- Control de formato de salida mediante tokens especiales: `<digits>` (números en cifra), `<nofiller>` (eliminación de muletillas) y `<verbatim>` (transcripción literal).
- Detección automática de idioma: con la opción Auto, la salida comienza con `language <Nombre>`; especificar el idioma evita ese prefijo.
- Procesamiento de audio de duración moderada con memoria KV que escala con la longitud del audio (~56 KiB por token, ~12,5 tokens por segundo).
- No soporta streaming: la transcripción se produce una vez finalizado el audio.
- No se documentan capacidades de tool calling, agentes, visión ni audio en tiempo real.

## Casos de uso

- Dictado local en escritorio: integrado en Hex mediante `hex model import Rumble-2-Flash-Q8_0.gguf`, permite transcribir notas de voz en un Apple M1 de 8 GB con latencias de 0,6 a 1,3 s para clips de 10-11 s, sin enviar audio a la nube.
- Transcripción por lotes con CLI: `transcribe-cli -m Rumble-2-Flash-Q8_0.gguf -l en audio.wav` procesa archivos WAV indicando el idioma, adecuado para pipelines de transcripción de reuniones o entrevistas.
- Subtitulado de contenido multilingüe: con 30 idiomas y detección automática, sirve para generar subtítulos de vídeos en chino, árabe, japonés o hindi, forzando el idioma cuando se conoce para evitar el prefijo `language`.
- Transcripción de audio largo en servidor: el contexto de 65k tokens permite archivos de hasta ~3,5 GB de memoria KV (límite del contexto) y ~0,4 GB para 10 minutos de audio, viable en máquinas con ~1,4 GB libres.
- Procesamiento de reuniones con limpieza de muletillas: el token `<nofiller>` elimina rellenos conversacionales, útil para actas y resúmenes posteriores.
- Transcripción literal para ámbitos jurídicos o clínicos: el token `<verbatim>` conserva la forma exacta del habla, relevante cuando la fidelidad literal es un requisito.
- Despliegue en Windows/Linux con GPU integrada: vía Vulkan o CPU, permite transcripción en equipos sin GPU dedicada, aunque el rendimiento en CPU pura no se ha medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, WER, CER por idioma) en la información disponible. Los únicos datos de rendimiento son medidas del repackaging:

| Metrica | Valor |
|---|---|
| Velocidad en Apple M1 (8 GB) | 8-18x tiempo real en clips de 10-11 s (0,6-1,3 s de pared, sin carga del modelo) |
| Paridad con checkpoint oficial (Transformers, bf16, greedy, idioma forzado) | 5 de 8 clips exactos tal cual; 7 de 8 tras el parche de runtime (las diferencias eran formato de números) |
| Diferencia restante | Clip en japonés de 28 s con 5,1 % CER |
| RTFx de upstream | 6.338x (vLLM por lotes en H200; throughput de servidor, no latencia en dispositivo) |
| CPU pura y máquinas x86 | no medido |

## Requisitos de hardware

- Disco: 557 MB para el GGUF; Hex copia el archivo al importar, por lo que conviene presupuestar ~1,1 GB.
- Memoria: ~1 GB libre para clips de dictado; ~1,4 GB para un archivo de 10 minutos.
- Memoria KV: ~56 KiB por token y ~12,5 tokens por segundo de audio; 10 minutos ≈ 0,4 GB y el contexto de 65k limita a ~3,5 GB.
- GPU: Metal en Apple Silicon; Vulkan o CPU en Windows/Linux.
- Cabe en GPU de consumo: sí, en Apple M1 de 8 GB medido; en x86 no se han publicado medidas.
- Despliegue: transcribe.cpp (`transcribe-cli`), Hex y aplicaciones basadas en transcribe.cpp. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este GGUF.
- Latencia: 0,6-1,3 s por clip de 10-11 s en M1 (8-18x tiempo real).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable. La única referencia interna es el checkpoint original `Reson8/Rumble-2-Flash` en Transformers (bf16), frente al cual este GGUF muestra paridad casi total (7 de 8 clips exactos tras el parche de runtime). Como base arquitectónica se cita `Qwen/Qwen3-ASR-0.6B`, pero no se aportan sus métricas.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rumble-2-Flash (este GGUF) | ~0,51 B | 65k tokens | Apache-2.0 | GGUF Q8_0 |
| Reson8/Rumble-2-Flash (original) | ~0,51 B | no disponible | Apache-2.0 | safetensors (bf16) |
| Qwen/Qwen3-ASR-0.6B (base) | ~0,6 B | no disponible | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Repackaging no oficial: no está afiliado ni respaldado por Reson8; los pesos no cambian, pero el contenedor y la precisión sí.
- Discrepancia de idiomas: la model card original anuncia 45 idiomas, pero `config.json` declara 30; el autor advierte explícitamente de esta diferencia.
- Sin streaming: la transcripción solo se produce tras finalizar el audio, lo que lo inutiliza para subtitulado en vivo o asistentes de voz interactivos.
- Prefijo de idioma: con Auto, la salida incluye `language <Nombre>` al inicio; hay que forzar el idioma para evitarlo.
- Riesgo de alucinación y errores en audio ruidoso o con acentos no representados: no se aportan tasas de WER por idioma, salvo el 5,1 % CER en un clip japonés de 28 s.
- Diferencias de formato numérico respecto al checkpoint oficial si no se aplica el parche de runtime de transcribe.cpp.
- K-quants requieren activar *Labs › Smaller model files* en Hex (macOS); el archivo publicado es solo Q8_0.
- Rendimiento no medido en CPU pura ni en x86, por lo que el despliegue en esas plataformas carece de garantías de latencia.
- Licencia Apache-2.0 permisiva para uso comercial, heredada de Reson8/Rumble-2-Flash y Qwen3-ASR-0.6B; deben conservarse `LICENSE` y `NOTICE`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nicolamanzini/Rumble-2-Flash-transcribe-cpp-GGUF
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Modelo base arquitectónico: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Hex: https://github.com/anomalyco/hex

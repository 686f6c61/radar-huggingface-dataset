# AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp es una distribución empaquetada del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice de Qwen (Alibaba) adaptada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. El repositorio no contiene un modelo nuevo: contiene los pesos en formato GGUF, los kernels precompilados para la NPU y los binarios de placa necesarios para la inferencia. Con 602.341.376 parámetros, es un modelo TTS compacto pensado para despliegue en hardware embebido de bajo consumo.

El modelo base es un sistema de texto-a-voz de Qwen que opera con una tasa de tokenización de audio de 12 Hz y ofrece nueve voces integradas con selección de idioma explícita. La adaptación de AXERA-TECH resuelve el problema de llevar un TTS neuronal a un SoC con NPU de cuatro núcleos, algo relevante para dispositivos de borde (asistentes, terminales industriales, electrónica de consumo) donde no hay GPU dedicada ni conectividad garantizada a la nube.

La relevancia actual radica en que demuestra un pipeline completo de TTS (talker, code predictor y vocoder) ejecutándose íntegramente en NPU con pesos convertidos en tiempo de carga (MXFP8 para talker y code predictor, BF16 para el decodificador de codec), con un rendimiento medido de aproximadamente 40 frames por segundo en régimen estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS autoregresivo por tokens de audio (talker + code predictor + decodificador de codec/vocoder); tokenización de audio a 12 Hz |
| Parametros totales | 602.341.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; conversión en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto (según el flag `--tts-lang`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16): `qwen3-tts-0.6b-customvoice-bf16.gguf` y `mmproj-qwen3-tts-0.6b-customvoice-bf16.gguf` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de síntesis de voz en dos etapas. Un componente "talker" genera tokens de audio a una tasa de 12 Hz, un "code predictor" refina la secuencia de tokens y un decodificador de codec (vocoder) convierte esos tokens en forma de onda. En esta distribución, el talker y el code predictor se ejecutan en la NPU con pesos convertidos a MXFP8 en el momento de la carga, mientras que el vocoder opera en BF16. Los kernels de la NPU no contienen pesos: se cargan desde los GGUF, lo que permite actualizar los binarios sin redistribuir los ficheros de pesos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. La model card de esta distribución se centra en el despliegue embebido y no documenta el proceso de entrenamiento del modelo original. La innovación técnica destacable es la integración del backend ggml-axera en llama.cpp (rama `axera-dev` del repositorio de ZHEQIUSHUI), que incluye kernels específicos para talker prefill, talker decode con cabeza de codec, code predictor y decodificador de codec.

## Capacidades

- Síntesis de voz a partir de texto con nueve voces integradas seleccionables (por ejemplo `vivian`, `dylan`, `eric`).
- Soporte multilingüe en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, además del modo `auto`.
- Generación de audio de duración variable; en la prueba publicada, un párrafo en chino produjo 20,9 segundos de voz.
- Salida a fichero WAV mediante el binario `llama-tts`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- El flag `--tts-instruct` (instrucción de estilo) existe pero la variante de 0,6B lo ignora con una advertencia, en coherencia con el wrapper oficial.
- No se documentan capacidades de visión ni de audio de entrada (el modelo es texto-a-voz).

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo cabe en un SoC AX8860 y sintetiza voz localmente sin conexión a la nube, lo que resulta adecuado para terminales de atención en comercio o industria donde la latencia de red y la privacidad son críticas.
- Señalización y anuncios en transporte público: con 40 frames por segundo en régimen estable y 4096 tokens de contexto, puede generar avisos de longitud media (decenas de segundos) en varios idiomas desde un único dispositivo empotrado.
- Lectura de textos largos y accesibilidad: conversión de documentos o interfaces a voz para usuarios con discapacidad visual, con selección de voz e idioma por configuración.
- Localización de contenidos: generación de pistas de voz en español, francés, alemán, italiano o portugués a partir de un mismo guion, aprovechando el soporte multilingüe del tokenizador de audio.
- Kioscos interactivos y domótica: respuestas habladas de baja latencia en electrodomésticos o paneles de control, donde una GPU dedicada no es viable económicamente.
- Pruebas de concepto de TTS en hardware Axera: validación de pipelines de voz antes de migrar a producción, dado que el repositorio incluye binarios estáticos, kernels y script de ejecución listos para la placa.
- Generación de audiolibros o contenido narrado por lotes: el proceso de carga y conversión de pesos cuesta unos 14 segundos por proceso, por lo que conviene mantener el proceso vivo y sintetizar varios fragmentos por ejecución.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de rendimiento en la placa AX8860 (SDK V0.5.1, NPU de 4 núcleos), no benchmarks de calidad del habla.

| Metrica | Resultado |
|---|---|
| Párrafo en chino, 20,9 s de voz, tiempo total de proceso (incluye carga y primera conversión del vocoder) | 25 s |
| Régimen estable talker + codec | ~40 frames/s (25 ms por frame de 80 ms) |
| Carga y conversión de pesos, una vez por proceso | ~14 s |
| Contexto máximo | 4096 tokens |
| Top-k máximo | 50 |

En cuanto a corrección, la model card indica que la salida de una frase larga en chino, transcrita de vuelta con Qwen3-ASR-1.7B, coincide literalmente con el texto original, y que una frase de prueba en inglés se recupera como "The quick brown fox jumps over the lazy dog.". No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos; el runtime ocupa los cuatro núcleos en exclusiva, por lo que no deben ejecutarse otros programas de NPU en paralelo.
- SDK requerido: V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`); las mediciones se realizaron con V0.5.1.
- Memoria: el repositorio ocupa 1,9 GB; los pesos GGUF suman aproximadamente 1,1 GB (talker) más 575 MB (code predictor y vocoder). No se especifica la VRAM o memoria RAM mínima del sistema.
- No está pensado para GPU de escritorio (A100, H100, RTX 4090) ni para consumer GPU: los binarios son estáticos para la placa y dependen de `/opt/lib` y de los kernels de NPU.
- Despliegue: binario `llama-tts` con `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, `-ngl 99 -c 4096` y top-k no superior a 50.
- Throughput medido: ~40 frames/s en régimen estable, equivalente a sintetizar audio varias veces más rápido que tiempo real en la configuración probada.
- No se documenta compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-CustomVoice-AX8860 (esta ficha) | 602 M | 4096 | 10 + auto | no disponible | NPU Axera AX8860 vía llama.cpp/ggml-axera |
| Qwen3-TTS-12Hz-0.6B-CustomVoice (modelo base) | 602 M | no disponible en esta ficha | 10 + auto | no disponible | Framework oficial de Qwen (GPU/CPU) |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: esta distribución no altera los pesos, sino que los empaqueta para NPU con kernels específicos y un binario de placa. No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la información proporcionada.

## Limitaciones y advertencias

- Exclusividad de NPU: el runtime ocupa los cuatro núcleos de la NPU del AX8860; ejecutar otros procesos de NPU simultáneamente puede degradar o bloquear la inferencia.
- Contexto limitado a 4096 tokens y top-k máximo de 50, lo que restringe la longitud de los textos de entrada y las estrategias de muestreo.
- La decodificación voraz (`--temp 0`) produce habla demasiado larga y con pausas excesivas; se recomienda mantener el muestreo por defecto.
- El flag `--tts-instruct` se ignora en la variante de 0,6B con una advertencia, por lo que no es posible controlar el estilo mediante instrucciones en este tamaño.
- Riesgo de alucinación y errores de pronunciación inherente a los modelos TTS neuronales; no se documentan tasas de error ni evaluaciones de naturalidad.
- Sesgos: no se documenta ningún análisis de sesgos de voz, género, acento o idioma en la información disponible.
- Licencia no disponible: antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen3-TTS-12Hz-0.6B-CustomVoice y los términos de los binarios y kernels de AXERA-TECH.
- Dependencia de un fork específico de llama.cpp (`axera-dev` @ `0104880be`) y de un SDK de placa concreto; la portabilidad a otro hardware no está soportada.
- El coste de carga y conversión de pesos (~14 s por proceso) desaconseja invocar el binario una vez por frase en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Modelo de verificación ASR citado: Qwen3-ASR-1.7B (referenciado en la model card, sin enlace directo)

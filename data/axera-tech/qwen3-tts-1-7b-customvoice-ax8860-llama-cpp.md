# AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp es una adaptación del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice de Alibaba Qwen, empaquetada por AXERA-TECH para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo: es una distribución de pesos en GGUF junto con kernels NPU precompilados y un binario estático (`llama-tts`) que permite inferencia TTS completamente en el dispositivo, sin GPU dedicada.

El modelo resuelve el problema de desplegar síntesis de voz de calidad en hardware de borde con aceleración NPU, un escenario habitual en cámaras inteligentes, asistentes embebidos y dispositivos IoT. Con 1.733.157.888 parámetros (aproximadamente 1,7 mil millones) y un contexto de 4096 tokens, ofrece nueve voces integradas y control de estilo mediante instrucciones en lenguaje natural.

La relevancia actual radica en que demuestra un pipeline TTS completo (talker, code predictor y vocoder) ejecutándose en una NPU de bajo consumo, con pesos cuantizados a MXFP8 para el talker y el code predictor, y BF16 para el decodificador de códec. El repositorio ocupa 4,3 GB y acumula 1214 descargas desde su publicación en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS basado en transformer (talker + code predictor + vocoder), ejecutado con llama.cpp y backend ggml-axera |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF BF16 en origen; conversion en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU precompilados + binario estatico |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen3-TTS, un sistema de síntesis de voz neuronal compuesto por tres etapas: un modelo "talker" que genera tokens acústicos a 12 Hz, un code predictor que refina la secuencia de códigos y un decodificador de códec (vocoder) que convierte los códigos en forma de onda. En esta distribución, el talker y el code predictor se convierten a MXFP8 al cargarse, mientras que el vocoder permanece en BF16. Los kernels NPU cubren cuatro etapas: prefill del talker, decode del talker (incluyendo la cabeza de salida del códec), code predictor y decodificador de códec.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO. El modelo base es Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, y esta variante solo aporta el empaquetado GGUF, los kernels para AX8860 y el binario de ejecución. La innovación técnica destacable es la integración de ggml-axera en llama.cpp (rama `axera-dev` del repositorio ZHEQIUSHUI/llama.cpp), que permite descargar la inferencia en la NPU manteniendo la interfaz de llama.cpp.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, además de detección automática.
- Nueve voces integradas seleccionables por nombre (por ejemplo `vivian`, `dylan`, `eric`).
- Control de estilo mediante instrucciones en lenguaje natural (`--tts-instruct`), que permiten ajustar tono y velocidad del habla.
- Generación de audio a archivo WAV mediante el binario `llama-tts`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado en TTS.
- No se documentan capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz embebidos: el modelo se ejecuta íntegramente en la NPU del AX8860, lo que permite integrar síntesis de voz en dispositivos sin GPU dedicada, como altavoces inteligentes o terminales de domótica.
- Lectura de notificaciones y alertas en dispositivos IoT: con contexto de 4096 tokens y diez idiomas, puede convertir mensajes de texto en audio local sin enviar datos a la nube.
- Accesibilidad en kioscos y paneles: generación de avisos hablados con control de estilo para adaptar el tono a distintos contextos (informativo, urgente, amable).
- Sistemas de megafonía y anuncios automatizados: síntesis de avisos en varios idiomas con voces predefinidas, adecuada para estaciones, aeropuertos o comercios.
- Prototipado de interfaces conversacionales: combinado con un ASR como Qwen3-ASR-1.7B, permite construir bucles de voz completos en el mismo hardware de borde.
- Generación de contenido de audio localizado: producción de locuciones en español, inglés, francés o alemán para vídeos y tutoriales sin depender de servicios de TTS en la nube.
- Investigación en TTS de borde: banco de pruebas para evaluar latencia y calidad de modelos de voz sobre aceleradores NPU de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta métricas de rendimiento en el dispositivo:

| Metrica | Resultado |
|---|---|
| Audio generado (parrafo en chino) | 26,8 s de voz |
| Tiempo total de proceso (incluye carga y primera conversion del vocoder) | 39 s |
| Regimen estable talker + codec | ~33 frames/s (30 ms por frame de 80 ms) |
| Carga y conversion de pesos (una vez por proceso) | ~25 s |
| Verificacion de correctitud | Transcripcion con Qwen3-ASR-1.7B identica al texto original en frase larga en chino con instruccion de estilo |

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro nucleos y SDK V0.5.0 o superior (comprobable con `cat /proc/ax_proc/version`).
- VRAM: no aplica; la inferencia se ejecuta en la NPU del SoC, no en GPU.
- GPU recomendadas: no aplica para esta distribución; el binario es estático y depende solo de `/opt/lib` y libc.
- No cabe ni está pensado para GPU de consumo (RTX 4090, etc.) en esta variante; para esas plataformas habría que usar el modelo base Qwen3-TTS en otro runtime.
- Opciones de despliegue: binario `llama-tts` incluido en `bin/`, con kernels en `kernels/` y script `run.sh`; requiere `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, con `-ngl 99 -c 4096` y top-k máximo 50.
- Latencia y throughput: aproximadamente 33 frames/s en régimen estable; 39 s de proceso total para 26,8 s de audio en el ejemplo reportado, incluyendo 25 s de carga inicial.
- La NPU queda ocupada en exclusiva por los cuatro nucleos; no deben ejecutarse otros programas NPU en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-CustomVoice-AX8860 (este) | 1,733 mil millones | 4096 | 10 + auto | no disponible | NPU AX8860 via llama.cpp/ggml-axera |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (base) | 1,7 mil millones (aprox.) | no disponible | no disponible | no disponible | Runtime original de Qwen; no orientado a NPU |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- La NPU de cuatro nucleos queda ocupada en exclusiva durante la inferencia; no se pueden ejecutar otros programas NPU simultáneamente.
- Contexto limitado a 4096 tokens y top-k máximo de 50.
- La decodificación greedy (`--temp 0`) produce voz excesivamente larga y con pausas; se recomienda mantener el muestreo por defecto.
- El tiempo de carga y conversión de pesos es de aproximadamente 25 s por proceso, lo que penaliza escenarios de invocación puntual.
- El binario falla si no se define `GGML_AXERA_KERNEL_DIR` (cambio introducido en la versión del 24 de noviembre de 2026).
- La licencia no está indicada en la información disponible; es imprescindible verificar los términos del modelo base Qwen3-TTS antes de cualquier uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la prosodia inadecuada en textos complejos.
- Solo se ha verificado la correctitud con una frase larga en chino transcrita por Qwen3-ASR-1.7B; no hay validación publicada para el resto de idiomas.
- Dependencia de hardware muy específica (AX8860 y SDK V0.5.0+), lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Modelo ASR usado para verificación: Qwen3-ASR-1.7B (referenciado en la model card, sin enlace directo disponible)

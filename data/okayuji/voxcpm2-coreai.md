# okayuji/voxcpm2-coreai

## Resumen

VoxCPM2 for Core AI es una conversión del modelo de síntesis de voz openbmb/VoxCPM2 al formato Core AI de Apple, publicada por el desarrollador okayuji. El objetivo es ejecutar generación de voz de 48 kHz completamente en local sobre un Mac con Apple Silicon, sin depender de servicios en la nube ni de GPU dedicadas. Se distribuye en dos carpetas de pesos, FP32 y FP16, que se cargan mediante el runtime en Swift y la aplicación de demostración del repositorio coreai-samples.

La característica diferencial es el diseño de voz por descripción textual: en lugar de proporcionar una grabación de referencia para clonar una voz, el usuario escribe una descripción entre paréntesis al inicio del texto (por ejemplo, "A young woman, gentle and calm voice") y el modelo sintetiza una voz coherente con esa descripción. La conversión está verificada numéricamente contra la implementación original en PyTorch, con comparaciones componente a componente y decisiones de parada que coinciden con la referencia.

El modelo está pensado para desarrolladores que experimentan con generación de voz local en macOS 27 mediante Core AI. No implementa clonación a partir de audio de referencia, no soporta streaming y no está dirigido a iPhone. Los idiomas verificados en esta conversión son japonés e inglés, con un límite estricto de 144 tokens de texto por petición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo original es un TTS con componentes tslm, ralm, proj, locenc, dit y vae; no se detalla la arquitectura interna) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible; límite de entrada de 144 tokens de texto tras colapsar espacios y dividir tokens multicharacter de caracteres chinos |
| Tipos de cuantización | FP32 y FP16 (dos carpetas de pesos) |
| Idiomas soportados | Japonés (ja) e inglés (en), verificados en esta conversión |
| Licencia | Apache 2.0 |
| Formato de pesos | Assets propios de Core AI (seis componentes: tslm, ralm, proj, locenc, dit, vae) más manifest.json, tokenizer.json, LICENSE y NOTICE; no son safetensors ni GGUF |
| Frecuencia de salida | 48 kHz mono Float32 WAV, 7.680 muestras por patch |
| Pasos del solver | 10 pasos con guidance 2.0 (valores por defecto del original) |
| Tamaño del repositorio | 14,0 GB |
| Tamaño de pesos FP32 | 9.349.325.520 bytes en 22 ficheros |
| Tamaño de pesos FP16 | 4.677.413.664 bytes en 22 ficheros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es la estructura de la conversión: cada carpeta contiene seis assets de Core AI denominados tslm, ralm, proj, locenc, dit y vae, junto con un manifest.json y el tokenizer.json original. En la carpeta FP16 todos los assets son de coma flotante de 16 bits, salvo RMSNorm y el embedding temporal sinusoidal, que siguen calculándose en 32 bits.

El pipeline de inferencia usa 10 pasos de solver con guidance 2.0, idénticos a los valores por defecto del modelo original, y genera patches de 0,16 segundos de audio (7.680 muestras a 48 kHz). La conversión incluye un cuantizador escalar cuyo comportamiento se documenta explícitamente: en la verificación FP32 se aceptó una llamada que cayó en el código vecino de un valor a 4,77e-7 de un límite de redondeo, siguiendo una regla documentada. La verificación componente a componente reporta 3.934 comparaciones sobre cinco frases con un error máximo de 0,001 respecto al mayor valor de referencia, y 239 decisiones de parada coincidentes con la implementación en PyTorch.

## Capacidades

- Síntesis de voz a partir de texto con salida de 48 kHz en mono, formato WAV Float32.
- Diseño de voz mediante descripción textual entre paréntesis al inicio del texto; no requiere audio de referencia.
- Generación de voces sintéticas coherentes con atributos como edad, género y tono descritos en lenguaje natural.
- Soporte de japonés e inglés, únicos idiomas verificados en esta conversión.
- Ejecución local en Mac con Apple Silicon mediante el runtime Core AI en Swift.
- Determinismo por semilla: los ejemplos documentados usan la semilla 1708, aunque el mismo texto y semilla producen audio distinto en FP16 y FP32.
- No implementa clonación de voz a partir de grabación de referencia.
- No implementa reproducción en streaming.
- No soporta tool calling, function calling ni razonamiento multi-paso; es exclusivamente un modelo de texto a voz.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Generación de voces para prototipos de asistentes conversacionales en macOS: el modelo permite crear una voz concreta describiéndola en texto y sintetizar respuestas en japonés o inglés sin salir del Mac, útil para validar la experiencia de voz antes de contratar un servicio de TTS en la nube.
- Doblaje y locución de contenido breve: con un límite de 144 tokens por petición, encaja en frases y párrafos cortos de vídeos, tutoriales o avisos, generando WAV a 48 kHz listos para montaje.
- Accesibilidad y lectura en voz alta en aplicaciones de escritorio: al ejecutarse en local con Core AI, permite integrar lectura de texto sin enviar contenido del usuario a servidores externos.
- Pruebas de concepto de diseño de voz: la descripción textual permite explorar variantes de timbre, edad y tono de forma iterativa sin grabar muestras, adecuado para equipos de producto que evalúan direcciones de marca sonora.
- Investigación sobre TTS en dispositivos Apple: el repositorio incluye verificación numérica contra PyTorch y registros de validación, lo que lo convierte en una base para estudiar fidelidad de conversiones y comportamiento de Core AI con modelos de audio.
- Generación de avisos y notificaciones pregrabadas en aplicaciones macOS: frases cortas en inglés o japonés que pueden sintetizarse por adelantado y almacenarse como assets de audio.
- Evaluación de latencia en hardware Apple: los datos publicados permiten estimar el coste por segundo de audio en un M5 Max y decidir si el enfoque local es viable para una aplicación interactiva concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, CMOS u otros) en la información disponible; la propia model card indica que la calidad de escucha no ha sido puntuada. Sí se publican métricas de rendimiento medidas en un Apple M5 Max (Mac17,6) con 128 GB de RAM, macOS 27.2.1, Xcode 27.2 y Core AI con especialización preferente de GPU, una petición a la vez, el 17 de noviembre de 2026:

| Métrica | FP32 | FP16 |
|---|---:|---:|
| Ficheros | 22 | 22 |
| Bytes | 9.349.325.520 | 4.677.413.664 |
| Tiempo por patch | 69,9 ms | 44,0 ms |
| Tiempo por segundo de audio | 0,437 s | 0,275 s |
| Apertura + carga | 3,3 s + 3,1 s | 1,7 s + 1,1 s |
| Memoria del proceso en carga | ~16,5 GB | ~8,4 GB |
| Mediana desde host Python (15 generaciones) | 0,456 s por segundo de audio | 0,294 s por segundo de audio |

Los tiempos por patch son la mediana de cinco frases tras un calentamiento, en build de release. La primera carga de una copia verificada nueva de FP16 tardó 4,6 segundos; la primera especialización de FP32 no se cronometró. La memoria vuelve a unos 0,2 GB tras liberar el modelo, y el contador phys_footprint se mantuvo por debajo de 0,7 GB sin reflejar los assets. Los ejemplos documentados generan 5,44 segundos de audio en 1,51 segundos (japonés) y 5,28 segundos en 1,49 segundos (inglés) con FP16 y semilla 1708.

## Requisitos de hardware

- Memoria: aproximadamente 8,4 GB de memoria de proceso con FP16 y 16,5 GB con FP32, medidas en un M5 Max con 128 GB de RAM.
- Hardware objetivo: Mac con Apple Silicon y macOS 27; la model card no confirma compatibilidad con otros modelos de chip ni con iPhone.
- GPU: no se especifican modelos concretos; las mediciones usan Core AI con especialización preferente de GPU en un M5 Max.
- No está pensado para GPU de servidor tipo A100, H100 o RTX 4090; el runtime es Core AI en Swift, no CUDA.
- Despliegue: runtime en Swift y aplicación de demostración del repositorio coreai-samples (rama feature/voxcpm2, pull request #583); la compilación requiere Xcode 27 y Rust/Cargo.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) no están soportadas por esta conversión.
- Latencia: 0,275 s de cómputo por segundo de audio en FP16 y 0,437 s en FP32 en el hardware medido; apertura y carga inicial de 1,7 s + 1,1 s en FP16.
- Almacenamiento: 14,0 GB de repositorio completo; solo la carpeta FP16 ocupa 4,68 GB y la FP32 9,35 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es con el modelo original del que deriva esta conversión:

| Modelo | Formato | Ejecución | Idiomas verificados | Licencia |
|---|---|---|---|---|
| okayuji/voxcpm2-coreai (FP16/FP32) | Assets Core AI | Local en Mac Apple Silicon con Core AI | ja, en | Apache 2.0 |
| openbmb/VoxCPM2 | Pesos originales (no detallado) | No detallado en la información disponible | No detallado en la información disponible | Apache 2.0 (heredada) |

No se han encontrado en la información proporcionada alternativas de TTS comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Límite estricto de 144 tokens de texto por petición tras colapsar espacios y dividir tokens multicharacter de caracteres chinos; el texto más largo se rechaza, no se trunca.
- Solo se ha verificado con frases en japonés e inglés; el comportamiento en otros idiomas del modelo original no está comprobado en esta conversión.
- No implementa clonación de voz a partir de una grabación de referencia, pese a que el modelo original podría soportarla.
- No implementa reproducción en streaming; cada petición genera el audio completo antes de reproducirse.
- No está dirigido a iPhone y requiere macOS 27 y Xcode 27 para compilar la demo, además de Rust/Cargo.
- La calidad de escucha no ha sido puntuada; no hay métricas subjetivas publicadas.
- El mismo texto y semilla producen audio distinto en FP16 y FP32, lo que afecta a la reproducibilidad entre carpetas.
- La aplicación de demostración acepta únicamente la carpeta fp16 y rechaza cualquier carpeta con ficheros adicionales; los ficheros se fijan por tamaño y SHA-256.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo de voz, el riesgo principal es una pronunciación o prosodia incorrecta, no contenido factual.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso NOTICE y verificarse las condiciones del modelo base openbmb/VoxCPM2.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (17 de noviembre de 2026), por lo que se trata de una publicación muy reciente y sin validación comunitaria.
- Las mediciones de rendimiento provienen de un único equipo (M5 Max, 128 GB) y no deben extrapolarse sin verificación a otros chips.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/voxcpm2-coreai
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Repositorio de ejemplos Core AI: https://github.com/oka-yuji/coreai-samples
- Pull request de integración en main: https://github.com/oka-yuji/coreai-samples/pull/583
- Guía de la rama feature/voxcpm2: docs/voxcpm2.md en https://github.com/oka-yuji/coreai-samples (rama feature/voxcpm2)
- Registro de validación: docs/validation/voxcpm2-conversion-20261117.md en el repositorio de ejemplos
- Ejemplo de audio en japonés: https://huggingface.co/okayuji/voxcpm2-coreai/resolve/main/samples/voice-design-ja.wav
- Ejemplo de audio en inglés: https://huggingface.co/okayuji/voxcpm2-coreai/resolve/main/samples/voice-design-en.wav
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli

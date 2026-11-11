# extraplus/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de texto a voz (TTS) desarrollado por Fish Audio, publicado en Hugging Face bajo el identificador `extraplus/s2-pro`. Resuelve el problema del control fino y localizado de la prosodia y la emoción en la síntesis de voz: en lugar de depender de un conjunto cerrado de etiquetas predefinidas, acepta descripciones textuales libres insertadas en línea mediante sintaxis `[tag]`, lo que permite modular el habla a nivel de palabra. Está entrenado sobre más de 10 millones de horas de audio en más de 80 idiomas y combina alineamiento por aprendizaje por refuerzo con una arquitectura dual-autorregresiva.

El modelo se apoya en un transformer decoder-only acoplado a un códec de audio basado en RVQ (10 codebooks, ~21 Hz de tasa de trama). La arquitectura Dual-AR separa un componente lento de 4B parámetros que predice el codebook semántico principal a lo largo del eje temporal y un componente rápido de 400M parámetros que genera los 9 codebooks residuales en cada paso. El total declarado en safetensors es de 4.561.852.416 parámetros y el repositorio ocupa 11,0 GB.

Su relevancia actual radica en que la estructura Dual-AR es isomorfa a la de un LLM autorregresivo estándar, por lo que hereda las optimizaciones de serving nativas de SGLang (continuous batching, paged KV cache, CUDA graph replay y prefix caching con RadixAttention). La release incluye pesos, código de fine-tuning y un motor de inferencia en streaming basado en SGLang, con un RTF de 0,195 y un time-to-first-audio de ~100 ms en una NVIDIA H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con codec de audio RVQ (10 codebooks, ~21 Hz) y arquitectura Dual-Autoregressive (Dual-AR) |
| Parametros totales | 4.561.852.416 (4B slow AR + 400M fast AR) |
| Parametros activos | No aplica (no es MoE); el fast AR de 400M se ejecuta por paso temporal |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 80+ idiomas; nivel 1: ja, en, zh; nivel 2: ko, es, pt, ar, ru, fr, de; además sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo y otros |
| Licencia | Fish Audio Research License (uso no comercial gratuito; uso comercial requiere licencia aparte) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder-only combinado con un códec de audio basado en RVQ de 10 codebooks a ~21 Hz. La innovación central es la arquitectura Dual-Autoregressive: un módulo slow AR de 4B parámetros opera sobre el eje temporal y predice el codebook semántico primario, mientras que un módulo fast AR de 400M parámetros genera los 9 codebooks residuales en cada paso temporal para reconstruir el detalle acústico fino. Este diseño asimétrico mantiene la eficiencia de inferencia sin sacrificar fidelidad de audio y, al ser estructuralmente isomorfo a un LLM autorregresivo convencional, permite reutilizar las optimizaciones de serving de SGLang: continuous batching, paged KV cache, CUDA graph replay y RadixAttention para prefix caching.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas y combina alineamiento mediante aprendizaje por refuerzo (RL) con la arquitectura dual-autorregresiva. El control inline se implementa mediante sintaxis `[tag]` que acepta descripciones textuales libres, no un vocabulario fijo: el modelo soporta más de 15.000 etiquetas únicas, desde `[whisper in small voice]` o `[professional broadcast tone]` hasta `[pitch up]`, aplicables a nivel de palabra. La release incluye pesos, código de fine-tuning y el motor de inferencia en streaming basado en SGLang.

## Capacidades

- Síntesis de voz multilingüe en más de 80 idiomas, con tres niveles de calidad declarados (nivel 1: ja, en, zh; nivel 2: ko, es, pt, ar, ru, fr, de).
- Control inline fino de prosodia y emoción mediante etiquetas `[tag]` de forma libre, con soporte de más de 15.000 etiquetas únicas.
- Etiquetas de control comunes: `[pause]`, `[emphasis]`, `[laughing]`, `[inhale]`, `[chuckle]`, `[tsk]`, `[singing]`, `[excited]`, `[interrupting]`, `[volume up]`, `[echo]`, `[angry]`, `[low volume]`, `[sigh]`, `[whisper]`, `[screaming]`, `[shouting]`, `[surprised]`, `[exhale]`, `[panting]`, `[audience laughter]`, `[with strong accent]`, `[clearing throat]`, `[sad]`, `[shocked]`, entre otras.
- Generación multi-hablante y multi-turno, según la descripción del overview del modelo.
- Inferencia en streaming de baja latencia.
- Inferencia de contexto largo, según la descripción del overview del modelo.
- Soporte de instrucciones en lenguaje natural para modular la salida.
- Fine-tuning disponible mediante el código publicado en el repositorio de GitHub.

## Casos de uso

- Doblaje y localización de vídeo: el modelo cubre más de 80 idiomas y permite insertar etiquetas de emoción y prosodia en puntos concretos del guion, de modo que un mismo texto puede adaptarse al tono del hablante original sin reentrenar el modelo.
- Audiolibros y narración: con etiquetas como `[whisper]`, `[sigh]` o `[emphasis]` insertadas a nivel de palabra, se puede dirigir la interpretación de diálogos y pasajes narrativos dentro de una misma sesión de generación.
- Asistentes de voz conversacionales: la latencia de ~100 ms hasta el primer audio y un RTF de 0,195 en H200 permiten integrar el modelo en pipelines de atención al cliente con respuestas habladas casi en tiempo real.
- Generación de voces para videojuegos: el control multi-hablante y multi-turno, junto con las etiquetas de emoción (`[angry]`, `[excited]`, `[surprised]`), facilita producir variantes de una misma línea de diálogo para distintos estados de ánimo.
- Accesibilidad y lectura de contenido: la síntesis multilingüe con control de pausas (`[pause]`, `[short pause]`) permite generar lecturas de documentos largos con una cadencia ajustable y una pronunciación consistente en más de 80 idiomas.
- Producción de pódcasts y contenido editorial: las etiquetas de entorno (`[audience laughter]`, `[echo]`) y de volumen (`[volume up]`, `[low volume]`) permiten construir escenas sonoras sin postprocesado adicional.
- Prototipado de interfaces de voz: el motor de streaming basado en SGLang y el soporte de continuous batching facilitan desplegar un servicio TTS con varios usuarios concurrentes sobre una sola GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de rendimiento en producción sobre una NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s con RTF < 0,5 |
| GPU de referencia | NVIDIA H200 (single GPU) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.561.852.416 parámetros en safetensors y un repositorio de 11,0 GB, la inferencia en precisión completa requiere al menos ~9,1 GB solo para pesos en FP16/BF16, más KV cache y overhead del motor; en FP32 serían ~18,2 GB solo de pesos.
- GPU recomendadas: NVIDIA H200 como referencia oficial de rendimiento (RTF 0,195, ~100 ms de time-to-first-audio). No se especifican otras GPU en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos (11,0 GB de repositorio) podría caber en GPU de consumo con 16 GB o más de VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: motor de inferencia en streaming basado en SGLang incluido en la release. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,195, time-to-first-audio de ~100 ms y más de 3.000 tokens acústicos/s manteniendo RTF por debajo de 0,5 en una NVIDIA H200.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (TTS multilingüe con control inline), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Licencia Fish Audio Research License: el uso gratuito se limita a investigación y uso no comercial. Cualquier uso comercial requiere una licencia separada de Fish Audio (contacto: business@fish.audio).
- El acceso al modelo está sujeto a un gate que exige declarar país, fecha y aceptar explícitamente el uso exclusivamente no comercial.
- El autor solicita no generar contenidos que violen la DMCA o las leyes locales.
- Riesgo de mal uso para suplantación de voz o generación de audio engañoso; la model card no describe mecanismos de marca de agua ni de detección.
- No se han publicado datos sobre sesgos demográficos, acústicos o lingüísticos del modelo.
- No se han publicado métricas objetivas de calidad (MOS, similitud de hablante, WER) ni resultados de benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.
- La longitud de contexto no está especificada, aunque el overview menciona inferencia de contexto largo sin cuantificarlo.
- La calidad no es homogénea entre idiomas: la propia model card establece niveles (nivel 1 para ja, en, zh; nivel 2 para ko, es, pt, ar, ru, fr, de; resto en un tercer grupo sin clasificar).
- El rendimiento reportado se ha medido únicamente en una NVIDIA H200; no hay datos de latencia o throughput en otras GPU.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el campo `inference: false` en la model card indica que la inferencia no está habilitada en el Hub.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/extraplus/s2-pro)
- [Informe técnico (arXiv 2603.08823)](https://arxiv.org/abs/2603.08823)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2603.08823)
- [Repositorio GitHub Fish Speech](https://github.com/fishaudio/fish-speech)
- [Playground Fish Audio](https://fish.audio)
- [Blog y tech report de Fish Audio](https://fish.audio/blog/fish-audio-open-sources-s2/)
- [Licencia (LICENSE.md)](https://huggingface.co/extraplus/s2-pro/blob/main/LICENSE.md)

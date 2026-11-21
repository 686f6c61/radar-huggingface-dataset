# ianhaimo/edgenovel-kokoro

## Resumen

EdgeNovel Kokoro es una conversión a GGUF del modelo de síntesis de voz Kokoro-82M v1.1-zh, publicada por el usuario ianhaimo para el lector local de ficción web china EdgeNovel. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización y empaquetado orientados a inferencia en dispositivo (on-device), concretamente en la aplicación para iPhone del proyecto, que integra un motor TTS escrito en Rust.

El modelo resuelve un problema muy concreto: disponer de una voz de lectura en voz alta ligera, sin dependencias de red, para narrar novelas web en chino. Para ello incluye siete voces chinas (cuatro femeninas `zf_*` y tres masculinas `zm_*`) y un fichero auxiliar, `zh-frontend.bin`, que contiene los diccionarios y modelos de conversión de texto a fonemas (G2P) necesarios para el chino.

Con 82.054.584 parámetros y un peso de 188,5 MB en F16, es un modelo muy pequeño, pensado para ejecutarse en CPU de móvil. La relevancia es de nicho: sirve como referencia de cómo empaquetar un TTS de Kokoro para un runtime propio, pero no aporta capacidades nuevas respecto al modelo base de hexgrad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (modelo TTS neuronal; arquitectura interna no detallada en la información disponible) |
| Parametros totales | 82.054.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | F16 (pesos por debajo de 4096 valores, capas recurrentes y voces en F32) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (modelo y voces); datos del front-end de proyectos Apache-2.0 y MIT |
| Formato de pesos | GGUF (`kokoro-v1.1-zh-f16.gguf`) + binario auxiliar `zh-frontend.bin` |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `hexgrad/Kokoro-82M-v1.1-zh` mediante el script `experiments/kokoro/convert.py --f16`. Según la model card, la normalización de pesos se pliega dentro de los pesos y no se modifica nada más. No se detalla en la información disponible la arquitectura interna de Kokoro (tipo de decoder, vocoder, etc.), más allá de que existen capas recurrentes que se mantienen en F32 por estabilidad numérica.

El componente diferencial es el front-end de chino: `zh-frontend.bin` se exporta con `experiments/kokoro/export_zh.py` a partir del front-end original de misaki 0.9.4 (`ZHG2P(version='1.1')`, con cn2an, jieba y pypinyin con pypinyin-dict). Incluye frecuencias y etiquetas de palabras, dos HMM para palabras y etiquetas desconocidas, y lecturas de caracteres y frases. El port en Rust (`core/src/zh_g2p.rs`) reproduce los mismos fonemas que el original en 47.480 de 47.480 párrafos de ficción probados.

## Capacidades

- Síntesis de voz (text-to-speech) en chino a partir de texto.
- Siete voces chinas empaquetadas: `zf_001`, `zf_008`, `zf_047`, `zf_086` (femeninas) y `zm_009`, `zm_031`, `zm_066` (masculinas).
- Conversión de texto a fonemas para chino mediante front-end propio (segmentación, pinyin, lectura de palabras desconocidas).
- Lectura en voz alta de ficción web china (caso de uso declarado: 听书).
- Inferencia local en dispositivo, sin red.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente TTS.

## Casos de uso

- Lectura en voz alta de novelas web chinas en una app móvil: el modelo sintetiza párrafos de ficción con las siete voces incluidas, y el front-end `zh-frontend.bin` resuelve la conversión a fonemas sin servicios externos.
- Audiolibro offline en iPhone: al pesar 188,5 MB en F16 y ejecutarse en CPU, puede integrarse en la app EdgeNovel para narrar contenido descargado sin conexión.
- Accesibilidad para usuarios con dificultades de lectura en chino: narración local de texto con voces masculinas y femeninas seleccionables.
- Prototipado de pipelines TTS en Rust: el par GGUF + binario de front-end sirve como referencia para portar Kokoro a otros runtimes nativos.
- Evaluación de cuantización F16 en TTS: útil para medir la degradación frente a F32 (0,2–0,8 dB en energía por banda según la model card).
- Integración en lectores EPUB/Markdown con soporte chino: el front-end exportado permite convertir texto plano a fonemas de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de fidelidad de audio:

| Metrica | Resultado |
|---|---|
| Coincidencia de audio con el original (CPU de PC, mismo espectro fuente) | ~100 dB |
| Duraciones frente al original | idénticas |
| Diferencia F16 vs F32 (energía por banda) | 0,2–0,8 dB |
| Diferencia entre dos ejecuciones F32 con distinto ruido | ~0,75 dB |
| Precisión del front-end en Rust vs original | 47.480 / 47.480 párrafos |

## Requisitos de hardware

- VRAM estimada: no aplica en el caso declarado; el modelo está pensado para CPU. En F16 ocupa 188,5 MB de pesos.
- GPU recomendadas: no especificadas; cualquier GPU con suficiente memoria para 188,5 MB podría alojarlo, pero no se documenta soporte GPU.
- Cabe en cualquier dispositivo con al menos ~200 MB libres de memoria; el caso objetivo es iPhone (CPU).
- Opciones de despliegue: motor propio de EdgeNovel en Rust (`app/rust/ios_tts/kokoro/`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son runtimes de LLM, no de TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EdgeNovel Kokoro (este) | 82M | zh | GGUF + binario front-end | Apache-2.0 | Cuantizado F16, 7 voces, orientado a iOS |
| hexgrad/Kokoro-82M-v1.1-zh | 82M | zh | safetensors (original) | Apache-2.0 | Modelo base; requiere front-end misaki |
| Kokoro-82M (original) | 82M | multilingüe (según variante) | safetensors | Apache-2.0 | Familia base de Kokoro |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no hay voces ni front-end para otros idiomas.
- Es un modelo TTS, no un LLM: no genera texto, no razona y no soporta instrucciones.
- Solo se distribuye en F16; no hay variantes Q4/Q8 documentadas.
- Depende de un binario de front-end específico (`zh-frontend.bin`) y de un port en Rust concreto; fuera de ese ecosistema la integración requiere trabajo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir pronunciaciones incorrectas en palabras fuera del vocabulario del front-end.
- La licencia Apache-2.0 permite uso comercial, pero los datos del front-end provienen de proyectos Apache-2.0 y MIT y requieren revisar `THIRD_PARTY_NOTICES.md`.
- No se documentan sesgos de voz (género, edad, acento) más allá de la selección de siete voces.

## Enlaces

- Hugging Face: https://huggingface.co/ianhaimo/edgenovel-kokoro
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Proyecto EdgeNovel: https://github.com/envymoon/EdgeNovel
- Front-end misaki (referencia): no disponible en la información proporcionada.

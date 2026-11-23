# NikitHamal/sakhiya-pro-v1

## Resumen

Sakhiya-Pro v1 es un modelo de síntesis de voz (text-to-speech) desarrollado por NikitHamal como un ajuste fino completo del backbone de `k2-fsa/OmniVoice`, un modelo de 600M de parámetros que combina un transformer Qwen3-0.6B con un codec de audio de 8 codebooks. El modelo está especializado en una única voz femenina nativa de Nepal y está orientado a la locución de noticias para el proyecto Sakhiya (NEBians), con soporte declarado para nepalí (ne), sánscrito (sa) e inglés (en), además de etiquetas para devanagari y clonación de voz zero-shot.

El problema que aborda es la falta de voces TTS nativas de calidad para nepalí con prosodia de locución informativa, un dominio tradicionalmente cubierto por modelos multilingües genéricos con acento deficiente. El ajuste se realizó sobre aproximadamente 1,9 horas de audio de una locutora concreta (speaker 6834 de OpenSLR SLR43 más clips unificados con Seed-VC), lo que produce un bloqueo de timbre medible: la similitud ECAPA con la locutora de referencia sube de 0,55 a 0,745 respecto al modelo base, manteniendo un UTMOS de aproximadamente 4,0.

Es relevante ahora como pieza de un pipeline en dos fases: este modelo actúa como "teacher" en GPU para generar locuciones de calidad broadcast y, posteriormente, destilar ese comportamiento en modelos pequeños que corran en navegador. Su licencia es "other" y el modelo es muy reciente (creado en noviembre de 2026), con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-0.6B con codec de audio de 8 codebooks (OmniVoice) |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ajuste se publica en bf16; el repo ocupa 2,5 GB) |
| Idiomas soportados | nepalí (ne), sánscrito (sa), inglés (en); etiqueta interna `language="npi"` |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `k2-fsa/OmniVoice`, una arquitectura que acopla un transformer Qwen3 de 0,6B parámetros con un tokenizador de audio de 8 codebooks. El ajuste fino es de backbone completo en precisión bf16 sobre una sola GPU, tomando como referencia de voz (`ref_audio` / `ref_text`) el archivo `anchor_ref.wav` / `anchor_ref.json` incluido en el repositorio. El checkpoint seleccionado es `ft3_s200`, una adaptación ligera de 200 pasos con learning rate 3e-6, elegida por equilibrio entre bloqueo de hablante y calidad perceptual.

Los datos de entrenamiento suman aproximadamente 1,9 horas de audio: principalmente habla leída del corpus OpenSLR SLR43 (speaker 6834) más clips de SLR43, védicos y de noticias unificados mediante Seed-VC. No se documenta el uso de RLHF ni DPO. La prosodia de estilo informativo procede del modelo base, no de datos de noticias nuevos, lo que el propio autor señala como limitación explícita. El pipeline de inferencia recomendado aplica Best-of-3 y una cadena de procesado broadcast normalizada a -14 LUFS.

## Capacidades

- Síntesis de voz (TTS) a partir de texto en nepalí, sánscrito e inglés.
- Clonación de voz zero-shot mediante prompt de referencia (`ref_audio` / `ref_text`), fijada a la locutora ancla del proyecto.
- Generación de audio con prosodia de locución informativa heredada del modelo base.
- Renderizado con selección Best-of-3 entre candidatos y cadena de masterización broadcast (-14 LUFS).
- Soporte de escritura devanagari en la entrada de texto.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Locución de noticias para el proyecto NEBians: el modelo genera voiceovers con el timbre de una locutora nepalí concreta, adecuado para boletines producidos de forma automatizada.
- Generación de material de entrenamiento para modelos pequeños: al actuar como "teacher" en GPU, produce pares texto-audio de alta calidad que después se destilan en modelos TTS ligeros para navegador.
- Doblaje y localización de contenido al nepalí: la clonación zero-shot con prompt de referencia permite mantener consistencia de voz entre episodios de un mismo producto.
- Producción de audiolibros y lectura de textos largos en nepalí: el modelo está entrenado sobre habla leída (SLR43), que es exactamente el régimen de lectura continua.
- Recitación de textos en sánscrito con pronunciación devanagari: útil para contenido educativo o religioso que requiera la grafía y fonética originales.
- Previsualización rápida de guiones: el script `sakhiya_pro_render.py` permite renderizar un WAV por frase para revisión editorial antes de la mezcla final.
- Integración en pipelines de publicación: la normalización a -14 LUFS facilita insertar el audio directamente en flujos de podcast o vídeo sin postproceso adicional.

## Benchmarks y rendimiento

El autor publica en `EVAL.md` una evaluación automática sobre 8 frases difíciles, sin test de escucha humano (MOS). Métricas empleadas: CER con CTC-ASR nepalí de Kriti, UTMOS22, similitud ECAPA con la locutora ancla, conteo de fugas al hindi y análisis forense de clics. Los únicos valores numéricos explícitos en la información disponible son la similitud ECAPA (0,55 en el modelo base frente a 0,745 en el ajuste fino) y el UTMOS (~4,0 en ambos). No se dispone de la tabla completa de resultados ni de comparaciones con MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS.

| Metrica | Modelo base (zero-shot) | Sakhiya-Pro v1 (ft3_s200) |
|---|---|---|
| Similitud ECAPA con la locutora ancla | 0,55 | 0,745 |
| UTMOS22 | ~4,0 | ~4,0 |
| CER nepalí (Kriti CTC-ASR) | inferior en el base según el autor | superior en el ajuste fino según el autor |
| CER védico | inferior en el base según el autor | superior en el ajuste fino según el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 612M parámetros en bf16 los pesos ocupan aproximadamente 1,2 GB, por lo que se puede estimar un consumo de 2-4 GB contando activaciones y codec de audio, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. El ajuste se realizó en una única GPU, sin especificar modelo.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo, aunque no hay confirmación documentada.
- Opciones de despliegue: el paquete `omnivoice` (pip) más `soundfile`, `jiwer` y `librosa`, ejecutando `sakhiya_pro_render.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Notas |
|---|---|---|---|---|---|
| Sakhiya-Pro v1 | 612M | ne, sa, en | Sí (prompt de referencia) | other | Ajuste de una sola locutora; sin MOS humano |
| k2-fsa/OmniVoice (base) | ~600M | multilingüe (incluye npi) | Sí | no disponible en la información | Mejor UTMOS y CER védico según el autor, peor bloqueo de hablante |
| ai4bharat/IndicF5 | no disponible | lenguas índicas | no disponible | no disponible | Acceso restringido (403) durante la comparación del autor |
| Swar (F5-Base fine-tune) | no disponible | no disponible | no disponible | no disponible | Representó a la familia F5 en el bake-off del autor |

## Limitaciones y advertencias

- Los datos de ajuste son solo ~1,9 horas, mayoritariamente habla leída; la prosodia de noticias proviene del modelo base y no de datos informativos nuevos.
- El modelo base obtiene mejor UTMOS y menor CER védico que el ajuste fino: el ajuste compra bloqueo de hablante a costa de algo de precisión fonética.
- No se realizó ningún test de escucha humano (MOS); las métricas son exclusivamente automáticas. El autor recomienda escuchar `samples/` antes de un uso broadcast.
- El modelo está atado a una única locutora ancla: no es un TTS multihablante y requiere siempre `anchor_ref.wav` / `anchor_ref.json`.
- Se documentan fugas al hindi en la evaluación, un riesgo relevante para contenido en nepalí.
- Licencia "other": no se detallan los términos de uso comercial en la información disponible, por lo que debe revisarse el texto completo de la licencia antes de producción.
- Riesgo de alucinación acústica y artefactos (clics) en entradas atípicas; el autor incluye análisis forense de clics precisamente por este motivo.
- Modelo con cero descargas y cero likes: no hay validación de la comunidad ni evidencia de uso en producción.
- No hay información sobre longitud de contexto ni sobre el límite de caracteres por síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikitHamal/sakhiya-pro-v1
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Corpus OpenSLR SLR43: https://www.openslr.org/43/
- Seed-VC: no disponible en la información proporcionada
- IndicF5 (referenciado en la comparación): https://huggingface.co/ai4bharat/IndicF5
- Repositorio `EVAL.md` y `samples/`: incluidos en el repositorio de Hugging Face del modelo

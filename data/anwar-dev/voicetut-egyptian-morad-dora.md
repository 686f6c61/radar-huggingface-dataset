# anwar-dev/voicetut-egyptian-morad-dora

## Resumen

voicetut-egyptian-morad-dora es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) publicado por anwar-dev que especializa el modelo base masterofaudio2077/voicetut-egyptian-tashkeel (OmniVoice 0.6B, árabe con tashkeel) hacia una identidad vocal concreta denominada "Morad", en árabe estándar moderno (MSA) completamente diacritizado. No es un modelo independiente: requiere cargar el modelo base y aplicar el adaptador mediante la utilidad `load_lora_adapter` de la librería OmniVoice.

El adaptador se entrenó con 609 clips (70 minutos) del corpus `moknah-ar-tts` (voz id 1898, "morad", MSA), reservando 24 clips para evaluación. El entrenamiento empleó DoRA con r=16, α=32 y dropout 0.05 sobre las proyecciones q/k/v/o/gate/up/down, además de entrenar por completo los módulos `audio_embeddings` y `audio_heads` (27,2 M parámetros entrenables, el 4,26 % del total). Se ejecutó en 2× T4 (Kaggle) en fp16 durante 2000 pasos.

Su relevancia es acotada pero clara: demuestra un flujo de personalización de voz sobre un modelo TTS de 0,6B con recursos de consumo (dos T4), publicando checkpoints intermedios y el log de entrenamiento completo. El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilización y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (LoRA con descomposición de pesos) sobre OmniVoice 0.6B (TTS) |
| Parametros totales | 27,2 M entrenables en el adaptador (4,26 % del total); el modelo base es de 0,6B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS; la entrada es texto y audio de referencia de 3-10 s) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en fp16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | Árabe (ar); entrenado con `language_id: "arb"` (MSA con tashkeel) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json); PEFT |

## Arquitectura y entrenamiento

El adaptador aplica DoRA sobre el transformer TTS OmniVoice 0.6B del modelo base. DoRA descompone cada matriz de pesos en magnitud y dirección, aplicando la actualización de bajo rango solo a la componente direccional; aquí con r=16, α=32 y dropout 0.05 sobre las proyecciones de atención (q, k, v, o) y del bloque feed-forward (gate, up, down). Adicionalmente, los módulos `audio_embeddings` y `audio_heads` se entrenan por completo mediante `modules_to_save`, lo que resulta coherente con el objetivo de desplazar la identidad vocal: la parte acústica se ajusta de forma completa mientras el resto del modelo permanece congelado.

Los datos provienen de 609 clips (70 min) del corpus `moknah-ar-tts`, voz id 1898 ("morad"), en MSA con diacritización completa, con 24 clips reservados para validación. El entrenamiento usó 2× T4 en fp16, `batch_tokens` 1024 con acumulación de gradiente 4, learning rate 1e-4 con scheduler coseno y 2000 pasos (aproximadamente 120 épocas). La pérdida de evaluación bajó de 4,14 a 3,39, con el mejor valor en el paso ~1000; la pérdida de entrenamiento pasó de 4,32 a 3,18. El repositorio incluye checkpoints en los pasos 500, 1000, 1500 y 2000, siendo el paso 2000 el que ocupa la raíz del repositorio.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe estándar moderno con diacritización completa (tashkeel).
- Clonación de voz zero-shot: acepta un clip de referencia de 3-10 segundos junto con su transcripción (`ref_audio` y `ref_text`) para condicionar la identidad vocal.
- Adaptación de identidad vocal hacia la voz "Morad" manteniendo la cobertura textual del modelo base egipcio.
- Generación de audio a 24 kHz (según el ejemplo de uso con `sf.write(..., 24000)`).
- Interfaz programática (Python, clase `OmniVoice` + `load_lora_adapter`) y CLI (`omnivoice-infer`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Audiolibros y narración en árabe estándar: el adaptador produce voz consistente en MSA diacritizado, adecuado para lectura de textos formales donde se requiere una identidad vocal estable a lo largo de horas de audio.
- Locución para contenido educativo: lecciones o cursos en árabe formal con una voz concreta y uniforme, generadas por lotes a partir de guiones con tashkeel.
- Prototipado de asistentes de voz en árabe: integrar el modelo base más el adaptador en un pipeline TTS para validar la experiencia de usuario antes de invertir en grabaciones profesionales.
- Doblaje y localización de material formativo: sustituir la locución original por una voz MSA consistente usando el clip de referencia como ancla de identidad.
- Generación de avisos y anuncios institucionales: mensajes en árabe formal con pronunciación diacritizada controlada, útil en entornos donde la precisión fonética es crítica.
- Investigación en personalización de TTS: el repositorio publica checkpoints intermedios y `train_log.txt`, lo que permite reproducir la curva de entrenamiento y comparar configuraciones DoRA sobre un modelo de 0,6B con hardware de consumo.
- Pruebas de accesibilidad: convertir textos largos en audio para usuarios con discapacidad visual en contextos arabófonos, con una voz estable y formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, WER, similitud de hablante) en la informacion disponible. Los únicos datos cuantitativos aportados por el autor son las pérdidas de entrenamiento y evaluación:

| Metrica | Valor |
|---|---|
| Eval loss inicial | 4,14 |
| Eval loss final (paso 2000) | 3,39 |
| Eval loss mejor (paso ~1000) | No disponible el valor exacto |
| Train loss inicial | 4,32 |
| Train loss final | 3,18 |
| Pasos de entrenamiento | 2000 (~120 épocas) |

## Requisitos de hardware

- Entrenamiento validado en 2× NVIDIA T4 (Kaggle) en fp16, con `batch_tokens` 1024 y acumulación de gradiente 4.
- El adaptador pesa 0,4 GB; el modelo base OmniVoice 0.6B en fp16 requiere aproximadamente 1,2 GB de pesos, por lo que la inferencia completa cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para inferencia en fp16 (RTX 3060, RTX 4060, RTX 4090, T4, A10, A100, H100). No se documentan requisitos específicos adicionales.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo base (0,6B) y del adaptador.
- Opciones de despliegue: la librería OmniVoice con `load_lora_adapter` (Python) y la CLI `omnivoice-infer`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voicetut-egyptian-morad-dora | 27,2 M entrenables sobre base 0,6B | Texto + referencia de 3-10 s | Árabe (MSA) | Apache 2.0 | Adaptador DoRA; requiere modelo base |
| masterofaudio2077/voicetut-egyptian-tashkeel | 0,6B | Texto + referencia de voz | Árabe (egipcio, con tashkeel) | No disponible | Modelo base sin adaptar |
| Alternativas TTS multilingües de gran escala (p. ej. XTTS-v2, Bark) | No disponible en esta ficha | No disponible | Multilingüe | Varía según modelo | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo (MOS, similitud de hablante, WER) entre estos modelos en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `masterofaudio2077/voicetut-egyptian-tashkeel` y la librería OmniVoice para funcionar.
- El modelo base sigue siendo un modelo de árabe egipcio; el adaptador desplaza la identidad vocal hacia "Morad" y opera en MSA, pero la cobertura textual subyacente no cambia.
- El autor advierte explícitamente que no debe usarse para suplantar a una persona real ni para engañar a oyentes. La clonación de voz conlleva riesgos de deepfake y requiere consentimiento y controles de uso.
- El conjunto de entrenamiento es pequeño (609 clips, 70 min) y de una única voz, lo que puede limitar la generalización a estilos, emociones o dominios alejados de los datos.
- El mejor checkpoint según la pérdida de validación es el paso ~1000, no el paso 2000 publicado en la raíz; conviene evaluar ambos antes de desplegar.
- No se documentan sesgos específicos, tasas de alucinación acústica ni métricas de calidad subjetiva (MOS).
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento normativo sobre síntesis de voz (consentimiento, etiquetado de audio sintético) recae en el usuario.
- Solo se declara soporte para árabe; no hay evidencia de calidad en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anwar-dev/voicetut-egyptian-morad-dora
- Modelo base: https://huggingface.co/masterofaudio2077/voicetut-egyptian-tashkeel
- Corpus de referencia citado por el autor: `moknah-ar-tts` (no se proporciona URL en la información disponible)
- Librería OmniVoice: no se proporciona URL en la información disponible
- Paper de DoRA: no se proporciona URL en la información disponible

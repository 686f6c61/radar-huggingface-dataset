# Oshara/xtts-v2-nepali

## Resumen

Oshara/xtts-v2-nepali es un ajuste fino (fine-tune) del modelo de síntesis de voz Coqui XTTS-v2, desarrollado por Oshara, que incorpora el nepalí (código `ne`) como idioma de síntesis. XTTS-v2 es un modelo TTS de clonación de voz zero-shot: con unos segundos de audio de referencia y una línea de texto, reproduce esa línea con la voz de referencia. Este checkpoint enseña al modelo base a hacerlo con fluidez en nepalí, un idioma que el XTTS-v2 original no incluye. El modelo resuelve el problema de la ausencia de soporte nativo de nepalí en la familia XTTS, manteniendo las capacidades de clonación de voz del modelo base.

El ajuste se realizó sobre el GPT interno del modelo (fine-tune completo, no congelado) partiendo del checkpoint base, con 4.140 clips de audio de un único hablante en nepalí (3.933 de entrenamiento y 207 de evaluación). Se registró un nuevo código de idioma `ne` en `config.json` reutilizando el tokenizador Devanagari existente, sin añadir vocabulario nuevo. La salida es a 24 kHz.

Es relevante para desarrolladores e investigadores que necesiten TTS en nepalí con clonación de voz y que no dispongan de una alternativa dentro de la familia XTTS. El autor recomienda el checkpoint de la época 10 frente al de la época 20, ya que este último se sobreajusta al hablante de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (transformer autorregresivo GPT para TTS con clonación de voz zero-shot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (`ne`) |
| Licencia | Coqui Public Model License (CPML) |
| Formato de pesos | `model.pth`, `config.json`, `vocab.json`, `speakers_xtts.pth` (formato XTTS) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Coqui XTTS-v2, un sistema TTS con un componente GPT autorregresivo que genera tokens acústicos a partir de texto y de un audio de referencia para la clonación de voz zero-shot. El ajuste fino se aplicó al GPT completo (no congelado), partiendo del checkpoint base `coqui/XTTS-v2`. El corpus de entrenamiento consta de 4.140 clips de un único hablante en nepalí, divididos en 3.933 para entrenamiento y 207 para evaluación (proporción 95/5).

La innovación técnica principal es la incorporación de un nuevo código de idioma `ne` en `config.json`, que se enruta sobre el tokenizador Devanagari ya existente en el modelo base, sin añadir vocabulario nuevo. Se publican dos checkpoints autocontenidos (época 10 y época 20); el autor recomienda la época 10 por su mejor generalización, ya que en épocas posteriores la métrica de evaluación mel-CE empeora mientras la text-CE se mantiene plana, indicando sobreajuste al hablante de entrenamiento. La salida de audio es a 24 kHz. No se especifica en la información disponible el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en nepalí a partir de texto.
- Clonación de voz zero-shot: reproduce una línea de texto con la voz de un audio de referencia de pocos segundos.
- Salida de audio a 24 kHz.
- Soporte de texto en escritura Devanagari (tokenizador existente del modelo base).
- Control de generación mediante parámetros como `temperature` y `repetition_penalty`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Audiolibros y narración en nepalí: el modelo puede sintetizar texto largo en nepalí con una voz de referencia concreta, clonando el timbre del narrador; se recomienda normalizar el texto (eliminar caracteres de ancho cero, dividir por el danda `।`, expandir dígitos nepalíes a palabras e insertar silencios breves entre frases) para evitar que el GPT autorregresivo derive en ruido entre oraciones.
- Locución para vídeos y contenido multimedia en nepalí: dado que la clonación zero-shot permite usar una muestra de voz de pocos segundos, se puede generar una locución con la voz de un presentador concreto sin entrenamiento adicional.
- Sistemas de accesibilidad y lectura de texto en nepalí: conversión de documentos y contenidos escritos a voz para usuarios nepaloparlantes, con la ventaja de disponer de una salida a 24 kHz y métricas de inteligibilidad competitivas (CER de ida y vuelta con Whisper de 0,380 y con MMS-1b de 0,199).
- Prototipado de asistentes de voz en nepalí: integración del modelo en pipelines de TTS para productos dirigidos al mercado nepalí donde el modelo base no ofrece soporte de idioma.
- Investigación en TTS multilingüe y clonación de voz: el checkpoint sirve como referencia de ajuste fino sobre un único hablante y de extensión de idioma sobre un tokenizador existente, útil para estudiar sobreajuste y generalización entre épocas.
- Generación de voces para doblaje o contenido educativo en nepalí: la similitud de hablante medida (SECS de 0,923 con WavLM-SV) indica una fidelidad de clonación alta, adecuada para producir varias piezas con una misma voz de referencia.

## Benchmarks y rendimiento

Evaluación sobre NepTTS-Bench (205 frases) y métricas de clonación de voz y prosodia, según la model card del autor:

| Metrica | Resultado | Nota |
|---|---|---|
| CER de ida y vuelta con Whisper | 0,380 | 2.º mejor del benchmark |
| CER de ida y vuelta con MMS-1b | 0,199 | 2.º mejor |
| CER en nepalí con XLS-R | 0,183 | posición intermedia |
| Auto-MOS con SCOREQ | 4,21 | 3.º en conjunto |
| MOS estimado con SQUIM | 4,69 | naturalidad sin referencia |
| SQUIM STOI / PESQ / SI-SDR | 0,99 / 3,78 / 27,6 dB | señal limpia |
| Similitud de hablante (SECS, WavLM-SV) | 0,923 | umbral de mismo hablante ≈ 0,86 |
| Expresividad de tono (desviación estándar de F0) | 3,58 st | algo más plana que el habla natural (~4,95 st) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 3,7 GB, lo que da una orientación del peso de los checkpoints, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no disponible. El ejemplo de uso de la model card emplea `model.cuda()` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: la model card documenta el uso mediante la librería `coqui` (`TTS.tts.configs.xtts_config.XttsConfig`, `TTS.tts.models.xtts.Xtts`) y descarga con `huggingface_hub.snapshot_download`. No se documentan en la información disponible opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables directamente a este formato de pesos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos TTS en nepalí (parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas). Los benchmarks de la model card sitúan al modelo como 2.º mejor en CER de ida y vuelta y 3.º en auto-MOS dentro de NepTTS-Bench, pero no se detallan los modelos comparados. Comparativa con alternativas: no disponible.

## Limitaciones y advertencias

- Corpus de entrenamiento de un único hablante: la diversidad de timbre proviene de la clonación zero-shot de XTTS, no del fine-tune, por lo que la variedad de voces naturales del ajuste es limitada.
- Expresividad de tono reducida frente al habla natural nepalí (desviación estándar de F0 de 3,58 st frente a ~4,95 st), lo que se traduce en una entonación más plana.
- El nepalí se enruta sobre el tokenizador Devanagari existente sin añadir vocabulario; esto puede limitar la cobertura de ciertos caracteres o convenciones ortográficas.
- Riesgo de deriva del GPT autorregresivo hacia ruido entre oraciones en textos largos o con muchos numerales si no se normaliza el texto previamente.
- La época 20 se sobreajusta al hablante de entrenamiento (sube el mel-CE de evaluación); se recomienda la época 10.
- Licencia Coqui Public Model License (CPML): hereda las restricciones del modelo base XTTS-v2; es necesario revisar los términos de CPML antes de un uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oshara/xtts-v2-nepali
- Repositorio GitHub: https://github.com/OsharaAI/xtts
- Modelo base Coqui XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Licencia Coqui Public Model License (CPML): https://coqui.ai/cpml

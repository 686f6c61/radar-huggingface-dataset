# marcosremar2/prosatts

## Resumen

ProsaTTS es un modelo de síntesis de voz (text-to-speech) en portugués de Brasil derivado de Kokoro-82M mediante fine-tuning. Lo publica el usuario marcosremar2 en Hugging Face bajo licencia Apache 2.0 y su aportación principal es el control de emoción explícito: además del estilo neutro, permite seleccionar `triste`, `animado`, `suave`, `raiva` y `surpresa`, con un parámetro de ganancia (`EMO_GAIN`) que regula la intensidad de la emoción.

A diferencia del Kokoro original de 82M de parámetros, este modelo declara 16,7M de parámetros y conserva la misma arquitectura y el mismo juego de fonemas que Kokoro, incluyendo el codificador BERT, el generador iSTFT y el formato de estilos por paquete. El repositorio ocupa 0,2 GB e incluye pesos en dos formatos (`f3_istft.pth` como state_dict de entrenamiento y `f3_istft.kmodel.pt` en el formato `KModel` de Kokoro), configuración, bancos de estilos por emoción y todo el pipeline de generación, filtrado, alineamiento, entrenamiento y evaluación.

Es relevante para quienes necesitan voces sintéticas en pt-BR con matices emocionales controlables sin recurrir a modelos comerciales, y para investigadores interesados en fine-tuning de TTS con datos generados sintéticamente (destilación de VoxCPM2) y pérdidas combinadas de mel, STFT, duración, silencio, WavLM y discriminadores GAN. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación registrada es 2026-11-11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Kokoro: codificador BERT, generador iSTFT y estilos por paquete (arquitectura de Kokoro-82M) |
| Parametros totales | 16,7M (según la model card; el modelo base Kokoro-82M declara 82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas y frases; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | apache-2.0 |
| Formato de pesos | `f3_istft.pth` (state_dict), `f3_istft.kmodel.pt` (formato `KModel` de Kokoro), `config_v3_istft.json`, `f3_istft.labels.pt`, `f3_istft.bank.pt`, `packs/*.pt` |

## Arquitectura y entrenamiento

El modelo parte de Kokoro-82M (hexgrad, Apache 2.0) y mantiene su arquitectura y su inventario de fonemas. Sobre esa base se añade un mecanismo de emoción: cada emoción es un vector aprendido de 256 dimensiones (`f3_istft.labels.pt`) que se suma al estilo de cada frase, junto con un banco de estilos de referencia por emoción y tipo de frase (`f3_istft.bank.pt`). El estilo efectivo de una frase se calcula como `pack[len(fonemas) - 1] + labels["emo_<emoción>"] * EMO_GAIN` y se pasa a `KModel.forward_with_tokens`.

El entrenamiento se realizó en varias etapas documentadas en la model card. Primero se seleccionaron 48 referencias de voz (6 emociones × 8 fragmentos de la grabación Rasalgethi). Después, VoxCPM2 clonó cada referencia y generó 12.000 frases nuevas con la emoción correspondiente en 1 h 28 min usando 4 procesos por GPU H100. Un filtro con Whisper large-v3-turbo conservó 11.531 frases que decían el texto pedido, y un alineador CTC marcó la duración de cada fonema, dejando 11.515 frases alineadas tras descartar las demasiado largas. El conjunto final sumó 34.890 frases (incluyendo neutro, pregunta, animado y suave del entrenamiento anterior) con 100 reservadas para test.

El fine-tuning se ejecutó durante 60.000 pasos desde el modelo iSTFT previo `b3_istft`, con batch 16 y learning rate 1e-4 con decaimiento, en 6 h 26 min sobre una H100 con la GPU al 83 %. Las pérdidas combinan mel (peso 5), STFT, duración de fonemas, silencio (peso 100), similitud con WavLM (`slm`) y discriminadores GAN a partir del paso ~600. La evolución registrada muestra mel de 0,852 (paso 100) a 0,687 (paso 58.600), duración de 0,885 a 0,470 y STFT de 0,417 a 0,354. El modelo de partida `b3_istft` ya hablaba pt-BR con el BERT de Kokoro y había sido destilado previamente con audio de Pocket TTS de Kyutai (CC-BY-4.0).

## Capacidades

- Síntesis de voz en portugués de Brasil a partir de texto, con fonemas compatibles con Kokoro.
- Control de emoción con seis opciones: neutro, `triste`, `animado`, `suave`, `raiva` y `surpresa`.
- Ajuste de intensidad emocional mediante el parámetro `EMO_GAIN`.
- Estilos por tipo de frase: banco específico para frases neutras (`pm_alex`), preguntas (`q`), `animado` y `suave`.
- Pronunciación medida con Whisper: 97–100 % de palabras reconocidas en las pruebas realizadas en un Mac.
- Velocidad de procesamiento de 0,02–0,07 s por segundo de audio en las mismas pruebas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al portugués (etiqueta `pt`); no se declaran otros idiomas.

## Casos de uso

- Audiolibros y narración con matices: el modelo permite alternar entre `triste`, `animado` o `suave` por fragmento y ajustar la intensidad con `EMO_GAIN`, lo que facilita dar color emocional a pasajes narrativos sin cambiar de motor.
- Asistentes de voz en portugués de Brasil: al ser un modelo pequeño (16,7M declarados, repo de 0,2 GB), puede ejecutarse en local para respuestas habladas de baja latencia, con estilos distintos según el tono del asistente.
- Contenido para redes y publicidad: generación de locuciones con emoción marcada (`animado`, `surpresa`) para vídeos cortos, donde la velocidad de 0,02–0,07 s por segundo de audio permite iterar rápido sobre guiones.
- Accesibilidad y lectura de textos: conversión de artículos o documentos a voz en pt-BR con un estilo neutro o suave, útil para lectores de pantalla y aplicaciones de accesibilidad.
- Prototipado de videojuegos y personajes: asignación de emociones por línea de diálogo usando los bancos de estilo incluidos, con la posibilidad de regenerar muestras rápidamente durante el diseño.
- Investigación en TTS emocional: el repositorio incluye el pipeline completo (generación de audio profesor con VoxCPM2, filtro con Whisper, alineamiento CTC, entrenamiento y evaluación con `emo_pitch.py`), lo que permite reproducir o extender el experimento.
- Evaluación de voces sintéticas: los scripts `synth14.py` y `page_f3.py` permiten sintetizar frases y montar una página de escucha para comparar emociones, útil en estudios de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí aporta métricas internas de evaluación:

| Métrica | Resultado |
|---|---|
| Palabras reconocidas por Whisper | 97–100 % |
| Tiempo de procesamiento por segundo de audio (Mac) | 0,02–0,07 s |
| Pérdida mel (paso 58.600) | 0,687 |
| Pérdida de duración (paso 58.600) | 0,470 |
| Pérdida STFT (paso 58.600) | 0,354 |

Tom medio por emoción medido con `pipeline/eval/emo_pitch.py`:

| Emoción | Neutro | Triste | Animado | Raiva | Surpresa | Suave |
|---|---|---|---|---|---|---|
| Tom (Hz) | 195 | 182 | 160 | 152 | 139 | 138 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,7M de parámetros declarados y un repositorio de 0,2 GB, la huella debería ser muy reducida, pero no se documentan cifras de VRAM.
- GPU recomendadas: la model card solo menciona H100 para el entrenamiento (60.000 pasos en 6 h 26 min, GPU al 83 %); no se especifican GPU para inferencia.
- ¿Cabe en GPU de consumo? No se documenta, pero por tamaño (16,7M de parámetros) es plausible en GPU de consumo; las pruebas de velocidad se hicieron en un Mac, no en GPU.
- Opciones de despliegue: se proporciona el formato `KModel` de Kokoro (`f3_istft.kmodel.pt`), lo que sugiere compatibilidad con el ecosistema de Kokoro; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,02–0,07 s de procesamiento por segundo de audio medidos en un Mac; no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Emoción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProsaTTS (este) | 16,7M declarados | pt | Sí (6 emociones + ganancia) | Apache 2.0 | Hugging Face, 0 descargas |
| Kokoro-82M (base) | 82M | Multilingüe (según su model card) | No documentado en esta ficha | Apache 2.0 | Hugging Face |
| VoxCPM2 (OpenBMB) | no disponible | no disponible | Usado como generador de audio profesor con emoción | Apache 2.0 | Hugging Face |
| Pocket TTS (Kyutai) | no disponible | no disponible | no disponible | CC-BY-4.0 | Hugging Face |

La comparación con Kokoro-82M es la más directa por ser el modelo base: ProsaTTS reutiliza su arquitectura y fonemas, declara menos parámetros (16,7M frente a 82M) y añade control emocional, pero no se dispone de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- La voz es sintética y el modelo está entrenado con audio generado por VoxCPM2 a partir de referencias de la grabación Rasalgethi; no se documentan evaluaciones de sesgo por género, acento o variedad regional del portugués.
- Riesgo de alucinación o pronunciación incorrecta: aunque se midió 97–100 % de palabras reconocidas por Whisper, no se detalla la tasa de error en frases fuera del conjunto de evaluación.
- El orden de los tonos por emoción no coincide con el del modelo profesor: en VoxCPM2 `triste` es la más grave y `surpresa` la más aguda, mientras que en ProsaTTS el tono medido va de 195 Hz (neutro) a 138 Hz (suave), lo que puede producir inconsistencias perceptuales frente a la emoción esperada.
- Solo soporta portugués (etiqueta `pt`); no se declaran otros idiomas.
- El audio de entrenamiento (`audio.i16.bin`, las 12.000 frases) no está incluido en el repositorio, lo que limita la reproducibilidad completa del fine-tuning.
- Los términos de Google sobre el audio de Gemini usado como referencia aún no se han revisado según la model card, lo que introduce incertidumbre legal sobre parte de los datos.
- Uso responsable: los términos de VoxCPM2 prohíben suplantar a personas, fraude y desinformación, y exigen marcar el audio generado como hecho por IA.
- Licencia Apache 2.0 para el modelo, pero las dependencias de datos (VoxCPM2, Pocket TTS CC-BY-4.0) pueden imponer condiciones adicionales en usos derivados.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosremar2/prosatts
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Pocket TTS (Kyutai): https://huggingface.co/kyutai/pocket-tts

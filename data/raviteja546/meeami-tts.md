# Raviteja546/meeami-tts

## Resumen

meeami-tts es un sistema de síntesis de voz (text-to-speech) en inglés estadounidense con control explícito de duración, desarrollado por el usuario Raviteja546. El modelo recibe una frase y una grabación de esa misma frase pronunciada por un hablante no nativo de EE. UU., y genera el audio de la frase con la voz del corpus LJSpeech, acento estadounidense y exactamente la misma duración y distribución temporal de palabras y pausas que la referencia. El problema que resuelve es el desajuste entre el contenido lingüístico y la temporización prosódica en sistemas TTS convencionales, que no permiten imponer la duración de la salida.

Técnicamente se trata de un VITS afinado con duraciones obtenidas mediante alineamiento forzado (Montreal Forced Aligner, MFA) en lugar del mecanismo de alineamiento monotónico (MAS) habitual, al que se añaden un embedding de posición dentro del fonema y una separación explícita de diptongos. El repositorio incluye varios checkpoints de ablación y dos líneas base (VITS original y FastSpeech2 + HiFi-GAN). El tamaño del repositorio es de 2,8 GB, aunque el checkpoint principal de inferencia ocupa solo 142 MB.

El modelo es relevante para investigación en prosodia controlable, evaluación de acento y aplicaciones de doblaje o sincronización, pero su alcance es limitado: solo inglés, licencia "other" con restricciones y cero descargas registradas en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (generativa adversarial condicionada, con encoder de texto, prior normalizing flow y decoder HiFi-GAN) con duraciones de MFA y embedding de posición en fonema |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; no se especifica límite de tokens) |
| Tipos de cuantización | no disponible (checkpoints en punto flotante; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | inglés (en), variante US-English |
| Licencia | other (ver sección de limitaciones) |
| Formato de pesos | `infer.pt` (PyTorch, solo pesos del generador `net_g` + config + step); líneas base en `.pth` y `.pth.tar` |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de extremo a extremo que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador multiperiodo. La innovación principal del sistema es sustituir el alineamiento monotónico (MAS) por duraciones derivadas de alineamiento forzado con MFA, lo que proporciona una temporización fonética supervisada de forma externa. Sobre esa base, el checkpoint principal (`m1_pos_diph`) añade un embedding de posición dentro del fonema (posición relativa de cada frame dentro del segmento fonético) y una separación explícita de diptongos, lo que permite controlar con más precisión la duración interna de los segmentos.

El entrenamiento se realizó mediante fine-tuning del VITS preentrenado con licencia MIT sobre LJSpeech 1.1 (dominio público), únicamente con datos de esa voz. La ablación `abl_a_pos` añade copias de LJSpeech estiradas temporalmente según las estadísticas de ritmo de LJSpeech; la ablación `abl_b_pos` usa estadísticas de ritmo medidas sobre hablantes de desarrollo de L2-ARCTIC (CC BY-NC 4.0), sin usar audio de L2-ARCTIC en el entrenamiento. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO (no aplicables a un TTS de este tipo). Los checkpoints de inferencia eliminan discriminadores y estados del optimizador, pasando de 956 MB a 141-142 MB, y se verifica que producen pesos y formas de onda idénticos al checkpoint completo de entrenamiento.

## Capacidades

- Síntesis de voz en inglés estadounidense con la voz del corpus LJSpeech a partir de texto.
- Control de duración de la salida: la longitud total del audio coincide con la de la referencia proporcionada.
- Control de temporización a nivel de palabra y de pausa, derivado del alineamiento forzado de la referencia.
- Transferencia de acento: convierte una referencia de hablante no nativo (árabe, coreano, vietnamita) en habla con acento estadounidense.
- Modelado de posición dentro del fonema para control fino de la duración intra-fonema.
- Separación explícita de diptongos para mejorar la temporización de vocales compuestas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de la referencia ni modo de pensamiento.

## Casos de uso

- Doblaje y sustitución de voz con sincronización temporal: dado un clip original y su transcripción, el modelo genera la misma frase con otra voz y exactamente la misma duración, lo que evita reajustes manuales de pista en postproducción.
- Investigación en prosodia controlable: permite aislar el efecto de la temporización de palabras y pausas sobre la naturalidad percibida, comparando checkpoints con y sin embedding de posición y con y sin separación de diptongos.
- Evaluación de acento y inteligibilidad: al convertir referencias de hablantes L2 en habla US, sirve para estudiar cómo la temporización nativa afecta a la percepción de acento y a la inteligibilidad.
- Generación de material de evaluación controlado: se pueden producir pares de audio con idéntica temporización y distinta voz para tests de percepción o de alineadores automáticos.
- Prototipado de sistemas de aprendizaje de idiomas: el audio generado conserva la cadencia del estudiante pero con pronunciación nativa, útil para comparar su ritmo con el objetivo.
- Reproducción de experimentos: los checkpoints de ablación y las líneas base (VITS original, FastSpeech2 + HiFi-GAN) permiten replicar la tabla de resultados sobre los mismos conjuntos de referencia.
- Integración en pipelines de investigación TTS: el formato `infer.pt` autocontenido (pesos, config y step) facilita cargar el modelo sin dependencias del checkpoint de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre acentos no vistos (árabe, coreano, vietnamita; 12 hablantes, 1.248 referencias):

| Sistema | MAE en fronteras de palabra | F1 de pausas | WER | Probabilidad US | UTMOS |
|---|---|---|---|---|---|
| V0 (VITS original, MAS) | 40,5 ms | 0,815 | 2,1 % | 0,649 | 4,31 |
| M0 (FastSpeech2) | 31,9 ms | 0,726 | 9,3 % | 0,746 | 3,96 |
| M1 | 24,2 ms | 0,822 | 3,8 % | 0,734 | 4,19 |
| m1_pos_diph (principal) | 23,9 ms | 0,835 | 2,9 % | 0,762 | 4,20 |

El sistema principal reduce el MAE de fronteras de palabra un 41 % respecto a V0 y un 25 % respecto a FastSpeech2, y obtiene el mejor F1 de pausas y la mayor probabilidad de acento US de la tabla, a costa de un WER ligeramente superior al de V0 (2,9 % frente a 2,1 %) y un UTMOS marginalmente inferior (4,20 frente a 4,31).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint principal pesa 142 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM; no se dispone de mediciones oficiales de consumo pico.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente, y también es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del generador.
- Opciones de despliegue: los pesos están en formato PyTorch (`infer.pt`) y requieren el código del repositorio del proyecto para cargarse; no se documentan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a VITS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Control de duración | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meeami-tts (m1_pos_diph) | VITS + duraciones MFA + posición en fonema | Sí, por referencia de audio | en (US) | other | Hugging Face, 0 descargas |
| VITS original (jaywalnut310) | VITS con MAS | No explícito | en (LJSpeech) | MIT | Público, ampliamente usado |
| FastSpeech2 + HiFi-GAN (ming024) | FastSpeech2 no autorregresivo + HiFi-GAN | Parcial (control de velocidad global) | en (LJSpeech) | MIT | Público |
| Otros TTS comerciales (p. ej. ElevenLabs) | no disponible | Parcial | multilingüe | propietaria | API comercial |

Frente a VITS y FastSpeech2, meeami-tts ofrece control temporal explícito y mejor MAE de fronteras de palabra, pero con peor WER que VITS original y una licencia menos permisiva. No se dispone de comparación con modelos multilingües de código abierto en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": la model card distingue entre checkpoints entrenados solo con LJSpeech (MIT/dominio público) y `abl_b_pos`, que debe usarse solo para investigación no comercial por su relación con estadísticas de L2-ARCTIC (CC BY-NC 4.0). Verificar los términos exactos antes de cualquier uso comercial.
- Solo inglés estadounidense: no soporta otros idiomas ni variantes de acento distintas de la voz LJSpeech.
- Requiere una grabación de referencia de la misma frase para imponer la temporización; no es un TTS de texto a audio sin referencia.
- El WER del sistema principal (2,9 %) es superior al de VITS original (2,1 %), lo que indica mayor riesgo de errores de pronunciación o inteligibilidad en algunos casos.
- UTMOS ligeramente inferior al de VITS original (4,20 frente a 4,31): la naturalidad percibida no mejora de forma uniforme.
- Riesgo de alucinación prosódica: al forzar duraciones ajenas, el modelo puede producir artefactos en fonemas con duraciones extremas no vistas en entrenamiento.
- Sesgos de voz: la salida usa siempre la voz de LJSpeech (hablante femenina única), sin control de timbre ni de identidad.
- Sin descargas ni validación comunitaria en Hugging Face en el momento de la consulta; el soporte y mantenimiento no están garantizados.
- No se documentan límites de longitud de texto ni comportamiento con frases muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raviteja546/meeami-tts
- Repositorio del proyecto meeami-tts (código, informe y registro de decisiones, `docs/REPORT.md`): no disponible como URL directa en la información proporcionada
- VITS original (base, MIT): https://github.com/jaywalnut310/vits
- FastSpeech2 (línea base M0): https://github.com/ming024/FastSpeech2
- LJSpeech 1.1 (datos de entrenamiento, dominio público): https://keithito.com/LJ-Speech-Dataset/
- L2-ARCTIC (estadísticas de ritmo para `abl_b_pos`, CC BY-NC 4.0): no disponible como URL directa en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada

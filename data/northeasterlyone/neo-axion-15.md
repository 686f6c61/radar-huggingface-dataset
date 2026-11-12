# northeasterlyone/neo-axion-15

## Resumen
Neo Axion 15 es un modelo de síntesis de voz (text-to-speech) especializado en turco, desarrollado por Northeasterly One. Se presenta como un sistema íntegramente propio: el modelo acústico, el generador de voz (NeoStyle), el codificador semántico Neo-BERT, el modelo de pausas, el limpiador de ruido y el conversor de fonemas turcos se han entrenado o escrito con datos propios del autor, sin reutilizar pesos de terceros. La versión Axion 15 corresponde al mejor checkpoint (paso 94.000) de un entrenamiento sobre aproximadamente 120 horas de audio previas más el conjunto Neo Veri 60 (~45,7 horas adicionales con filtrado de calidad Q15).

El modelo emplea una arquitectura basada en StyleTTS2 (referencia arXiv:2306.07691) con 200.811.067 parámetros totales y se distribuye en formato PyTorch/safetensors (0,8 GB). Genera audio a 24 kHz con sonoridad normalizada a -18 LUFS y pico real ≤ -1 dBTP, e incorpora control expresivo mediante etiquetas de emoción en el texto (`[nötr]`, `[sevinçle]`, `[heyecanla]`, `[fısıltıyla]`, etc.), tres estilos predefinidos (normal, alegre, energético) y un modo automático.

Su relevancia radica en cubrir el turco con un sistema de alta calidad y control prosódico fino: pausas dependientes de la puntuación, alargamiento de vocales, énfasis con `*palabra*`, normalización de números, horas, fechas, porcentajes, moneda y abreviaturas, y una única voz (la del hablante Neo) entrenada con su consentimiento. La licencia OpenRAIL permite uso comercial con atribución obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (modelo acústico + generador neuronal NeoStyle + codificador Neo-BERT) |
| Parametros totales | 200.811.067 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | OpenRAIL (Neo Axion OpenRAIL-M, atribución obligatoria) |
| Formato de pesos | safetensors / PyTorch |

## Arquitectura y entrenamiento
El sistema se compone de varios módulos entrenados de forma conjunta: un modelo acústico basado en la arquitectura StyleTTS2, un generador de voz denominado NeoStyle, un codificador semántico Neo-BERT que alimenta la prosodia (incluida una "tarjeta de emoción por palabra"), un modelo de pausas, un limpiador de ruido y un conversor de fonemas turco. El entrenamiento parte de aproximadamente 120 horas de audio (conjunto v3 más grabaciones del hablante y lecturas dirigidas) y añade Neo Veri 60, unas 45,7 horas de párrafos, conversación, lectura difícil, habla emocional y narración de rol, filtradas con criterio de calidad Q15. El checkpoint publicado corresponde al paso 94.000 de la fase Axion 15.

Entre las innovaciones técnicas destacan las pérdidas específicas de melodía y ritmo: varianza global de rango tonal, extremos percentiles 5-95, movimiento tonal intra-palabra y dispersión de duración de fonemas. La selección de estilo no usa un promedio de clips, sino una referencia directa: para cada emoción y estilo se elige un único clip real (15 grupos, 180 clips, puntuados según la calidad del resultado sintetizado). También se entrenó un codificador de instrucciones que no superó la puerta de calidad del producto y permanece desactivado. El sistema incluye generación en streaming (`tts.akis()`) con una latencia del primer audio de aproximadamente 1166 ms en una NVIDIA RTX PRO 6000 Blackwell Server Edition.

## Capacidades
- Síntesis de voz en turco con una única voz (Neo) a 24 kHz, -18 LUFS y pico real ≤ -1 dBTP.
- Tres estilos predefinidos: `normal`, `neşeli` (alegre) y `enerjik` (energético), más modo automático (`oto`).
- Etiquetas de emoción en el texto: `[nötr]`, `[sevinçle]`, `[neşeyle]`, `[coşkuyla]`, `[heyecanla]`, `[şaşırarak]`, `[üzgün]`, `[sakin]`, `[ciddi]`, `[gergin]`, `[yorgun]`, `[kızgın]`, `[fısıltıyla]`, `[gülerek]`, `[anlatarak]`.
- Control de pausas según puntuación: `.` 0,55 s; `?` 0,60 s; `!` 0,55 s; `…` 0,70 s; párrafo 0,90 s.
- Alargamiento de vocales largas mediante diccionario más multiplicador de duración ×1,7 (por ejemplo, "haa-rika", "hâlâ", "kararname").
- Énfasis léxico con `*palabra*` e inserción de sonidos intermedios como `[gülme]`.
- Normalización de lectura de números, horas, fechas, porcentajes, moneda, teléfonos y abreviaturas en turco.
- Generación en streaming por fragmentos mediante `tts.akis()`.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente text-to-speech.

## Casos de uso
- Audiolibros y narración en turco: el modelo aplica pausas por párrafo (0,90 s) y por signo de puntuación, además de etiquetas como `[anlatarak]`, lo que permite narrar textos largos con un ritmo natural sin postprocesado manual.
- Asistentes de voz y atención al cliente: al generar el primer fragmento en aproximadamente 1166 ms con streaming, puede integrarse en diálogos interactivos donde la latencia inicial es crítica.
- Locución publicitaria y promociones: los estilos `enerjik` y `neşeli` junto con `[coşkuyla]` permiten producir anuncios con tono comercial sin contratar grabación de estudio.
- Contenido educativo y e-learning: la lectura correcta de números, fechas, porcentajes y moneda ("%25", "1.250 TL", "29 Ekim'de") lo hace adecuado para materiales didácticos turcos generados automáticamente.
- Accesibilidad y lectores de pantalla: síntesis de alta inteligibilidad (WER normalizado del 1,35 % en Freya-TR-Eval) para convertir artículos y documentos en audio.
- Doblaje y audiodescripción: el control de emoción por segmento permite ajustar el tono de cada frase de un guion, con etiquetas distintas por intervención.
- Prototipado de videojuegos y aplicaciones: voces susurradas (`[fısıltıyla]`), cansadas (`[yorgun]`) o sorprendidas (`[şaşırarak]`) para personajes, con licencia que permite uso comercial bajo atribución.

## Benchmarks y rendimiento

| Benchmark | Neo Axion 15 | Axion 14 Plus |
|---|---|---|
| Freya-TR-Eval (WER normalizado) | 1,35 % | 1,48 % |
| Freya-TR-Eval (UTMOS v1) | 3,90 | 3,86 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 200,8 millones de parámetros en precisión completa el peso de los tensores ronda los 0,8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende de los módulos auxiliares (Neo-BERT, generador, limpiador de ruido).
- GPU recomendadas: el autor reporta mediciones en NVIDIA RTX PRO 6000 Blackwell Server Edition; no se especifican requisitos mínimos ni otras GPU validadas.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: biblioteca PyTorch (library_name: pytorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: primer audio en streaming de aproximadamente 1166 ms en la GPU citada; no se publican cifras de throughput (caracteres o segundos de audio por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neo Axion 15 | 200.811.067 | Turco | no aplica | OpenRAIL (atribución) | Hugging Face |
| Axion 14 Plus (misma familia) | no disponible | Turco | no aplica | OpenRAIL | Hugging Face (versión previa) |
| Alternativas TTS turcas de terceros | no disponible | Turco | no aplica | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos TTS comparables (parámetros, contexto, rendimiento o licencia), por lo que la comparación externa queda como no disponible.

## Limitaciones y advertencias
- Una sola voz: no permite clonación ni selección de hablantes; todo el audio suena como el hablante Neo.
- Solo turco: no hay soporte multilingüe documentado.
- El codificador de instrucciones por lenguaje natural se entrenó pero está desactivado por no superar la puerta de calidad del producto.
- Riesgo de alucinación prosódica: las etiquetas de emoción y el énfasis pueden producir resultados poco naturales en textos atípicos o con puntuación ambigua.
- Licencia OpenRAIL con atribución obligatoria para uso comercial; prohíbe suplantar a personas reales sin consentimiento, fraude y presentar las salidas como palabras de una persona real (Anexo A de la licencia).
- Uso responsable: el autor exige indicar que el audio ha sido generado por inteligencia artificial al compartirlo.
- Sin datos publicados sobre sesgos, robustez ante ruido de entrada (no aplica, es TTS) ni comportamiento en dominios muy especializados.
- No hay información sobre cuantizaciones ni sobre rendimiento en hardware de consumo, lo que limita la planificación de despliegues en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/northeasterlyone/neo-axion-15
- Demo (Space) con ejemplos de audio: https://huggingface.co/spaces/northeasterlyone/neo-axion-15
- Paper de referencia de la arquitectura StyleTTS2: https://arxiv.org/abs/2306.07691
- Ejemplos de audio (normal): https://huggingface.co/northeasterlyone/neo-axion-15/resolve/main/ornekler/ornek_01_normal.wav
- Ejemplos de audio (emociones): https://huggingface.co/northeasterlyone/neo-axion-15/resolve/main/ornekler/ornek_04_duygu.wav
- Licencia: https://huggingface.co/northeasterlyone/neo-axion-15/blob/main/LICENSE

# flockspeech/goldfinch

## Resumen
Goldfinch v0.1 es un modelo de síntesis de voz (text-to-speech) en inglés conversacional desarrollado por Flock Speech, publicado en Hugging Face bajo licencia Apache-2.0. Con 11,4 millones de parámetros en el modelo acústico y 13,5 millones en el vocoder, está disenado específicamente para generar habla casual y humana: conserva muletillas como "uh" o "you know", reinicios del tipo "I, I think" y permite insertar sonidos no verbales mediante etiquetas como `[laugh]`, `[breath]` o `[sigh]`.

Su principal singularidad es la eficiencia: se distribuye en formato ONNX (44 MB en la build cuantizada int8 para el decoder y fp16 para encoder y vocoder, y 100 MB en precisión completa) y se ejecuta más rápido que el tiempo real en una CPU convencional, sin necesidad de GPU, red ni dependencias de PyTorch. Esto lo hace adecuado para despliegues en dispositivo (edge), aplicaciones de escritorio y escenarios donde la privacidad del texto es crítica.

El modelo emplea una arquitectura no autorregresiva con encoder transformer, predictor de duración, decoder de flow-matching condicional y vocoder Vocos, y está entrenado sobre el dataset `amaai-lab/DisfluencySpeech`. Es la alternativa conversacional de Flock Speech frente a su modelo hermano Junco, orientado a lectura formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresiva: encoder transformer, predictor de duracion, decoder de flow-matching condicional y vocoder Vocos |
| Parametros totales | 11,4 M (modelo acustico) + 13,5 M (vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (decoder) y fp16 (encoder y vocoder) en la build de 44 MB; build fp32 de 100 MB |
| Idiomas soportados | Ingles (US) |
| Licencia | Apache-2.0 (pesos del vocoder MIT) |
| Formato de pesos | ONNX (builds `onnx/` y `onnx-fp32/`) |
| Frecuencia de salida | 24 kHz mono |
| Voces | 1 (estilo conversacional) |
| Etiquetas de sonido | `[laugh]`, `[breath]`, `[sigh]`, `[lipsmack]`, `[throat]`, `[noise]` |
| Runtime | ONNX Runtime en CPU (Linux, macOS, Windows; x86-64 y ARM64) |
| Version | v0.1, noviembre de 2026 |

## Arquitectura y entrenamiento
Goldfinch es un sistema TTS no autorregresivo compuesto por cuatro etapas: un encoder transformer que procesa la secuencia de texto (incluidas las etiquetas de sonido como símbolos de entrada), un predictor de duración que determina la longitud de cada fragmento, un decoder basado en flow-matching condicional que genera el mel-espectrograma a partir de ruido en un número configurable de pasos (8 por defecto) y un vocoder Vocos que convierte el espectrograma en audio a 24 kHz. Cada etiqueta de sonido ocupa un único símbolo en la entrada, de modo que el modelo decide su forma y duración en función del contexto lingüístico circundante.

El entrenamiento se realizó sobre el dataset `amaai-lab/DisfluencySpeech`, que aporta ejemplos de habla espontánea con disfluencias y sonidos no verbales. La model card detalla el número de ejemplos por etiqueta: 701 para `[laugh]`, 98 para `[breath]`, 57 para `[throat]`, 56 para `[lipsmack]`, 19 para `[noise]` y 16 para `[sigh]`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. Como innovación destacable, el motor aplica por defecto un factor de 1,4× sobre la duración predicha de cada etiqueta y duplica las pausas cortas adyacentes (`tag_len` y `tag_pad` en `onnx/goldfinch.json`) para suavizar la reproducción de las risas.

## Capacidades
- Generación de voz conversacional en inglés (US) con estilo casual y natural.
- Conservación de muletillas y disfluencias escritas como palabras: "uh", "um", "you know", "I mean".
- Producción de sonidos no verbales mediante etiquetas: `[laugh]` (y variantes `[laughs]`, `[giggle]`, `[chuckle]`), `[breath]` (`[inhale]`, `[exhale]`), `[throat]` (`[clears throat]`, `[cough]`), `[lipsmack]`, `[sigh]` y `[noise]`.
- Control de velocidad del habla mediante el parámetro `speed` (1,2 equivale a un 20 % más rápido).
- Control del número de pasos de flow-matching (`steps`, 8 por defecto) para ajustar calidad y latencia.
- Reproducibilidad mediante semilla fija (`seed`, 0 por defecto).
- Generación por streaming frase a frase para baja latencia en texto largo.
- Ejecución offline en CPU sin GPU, red ni PyTorch.
- No dispone de clonación de voz ni de control emocional más allá de las etiquetas listadas.

## Casos de uso
- **Personajes de videojuego y compañeros conversacionales**: el modelo genera respuestas con risas, respiraciones y muletillas que suenan espontáneas, adecuado para NPCs o asistentes de voz que deben sonar humanos y casuales sin depender de un servicio en la nube.
- **Asistentes de voz en dispositivo (edge)**: al ejecutarse en CPU con ONNX Runtime y ocupar 44 MB, puede integrarse en aplicaciones de escritorio o móviles que necesitan síntesis offline y mantener el texto del usuario en local por privacidad.
- **Prototipado de diálogo hablado**: investigadores y desarrolladores pueden iterar sobre guiones con disfluencias y sonidos no verbales de forma reproducible (semilla fija) y con latencia baja gracias al streaming por frases.
- **Podcasts y contenido de audio generado**: la capacidad de insertar `[laugh]` o `[breath]` en el texto permite producir intervenciones con un tono relajado y natural para piezas de audio breves o demos.
- **Investigación en TTS expresivo de pequeño tamano**: con 11,4 M de parámetros acústicos, sirve como base para estudiar generación de sonidos no verbales y modelos de flow-matching ligeros.
- **Sistemas de respuesta de voz en tiempo real**: el modo streaming frase a frase y la ejecución más rápida que el tiempo real en CPU permiten alimentar pipelines de interacción por voz con latencia controlada.
- **Accesibilidad y avisos hablados informales**: para notificaciones o mensajes que deben sonar cercanos en lugar de formales, aunque para lectura formal el autor recomienda su modelo hermano Junco.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- **VRAM estimada**: no aplica; el modelo está disenado para ejecutarse en CPU mediante ONNX Runtime. La build cuantizada ocupa 44 MB en disco y la fp32 100 MB.
- **GPU recomendadas**: no requiere GPU. No se documentan requisitos de GPU en la información disponible.
- **Compatibilidad con GPU de consumo**: no aplica al tratarse de un despliegue en CPU; no se especifica soporte GPU.
- **Plataformas**: CPU x86-64 y ARM64 en Linux, macOS y Windows.
- **Opciones de despliegue**: paquete Python `flockspeech` (0.2.0 o superior), que incluye los pesos, o carga directa de los ficheros ONNX del repositorio con `huggingface_hub` y ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: el autor indica que se ejecuta más rápido que el tiempo real en una CPU ordinaria; la build fp32 es aproximadamente un 40 % más lenta en CPU. No se proporcionan cifras concretas de latencia ni de throughput.
- **Hilos de CPU**: el parámetro `threads` permite hasta 4 hilos para ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| Goldfinch v0.1 (Flock Speech) | 11,4 M acústico + 13,5 M vocoder | no disponible | Ingles (US) | Apache-2.0 (vocoder MIT) | ONNX Runtime en CPU | TTS conversacional con sonidos no verbales y muletillas, 44 MB |
| Junco (Flock Speech) | no disponible | no disponible | Ingles | no disponible en la informacion | no disponible en la informacion | Modelo hermano orientado a lectura formal (noticias, audiolibros) |
| Alternativas de TTS open source de gran tamano (p. ej. modelos basados en difusion o LLM) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación cuantitativa con otros sistemas TTS no está disponible en la información proporcionada; el único punto de referencia documentado es Junco, del mismo autor, especializado en lectura formal.

## Limitaciones y advertencias
- **Etiquetas poco fiables**: `[sigh]` y `[noise]` cuentan con menos de 20 ejemplos de entrenamiento cada una y pueden sonar débiles o incorrectas; `[throat]` y `[lipsmack]` se clasifican como de fiabilidad "fair".
- **Entrega variable**: el modelo fue entrenado con habla espontánea, por lo que la prosodia y el ritmo pueden variar entre generaciones; la semilla fija mitiga parcialmente esta variabilidad.
- **Sin clonación de voz ni control emocional**: solo hay una voz y el control expresivo se limita a las etiquetas listadas.
- **Solo inglés (US)**: no soporta otros idiomas ni acentos distintos del proporcionado.
- **No apto para lectura formal**: para noticias, audiolibros o anuncios el autor recomienda Junco.
- **Riesgo de uso indebido**: la model card prohíbe su uso para suplantar a personas reales o generar audio que engane sobre quién habla o sobre el origen sintético de la voz.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos del vocoder están bajo licencia MIT; conviene verificar el cumplimiento de ambas.
- **Madurez**: se trata de la versión v0.1 (noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta, por lo que su validación en producción es limitada.
- **Riesgo de alucinación**: no se documenta en la información disponible para un modelo TTS; el riesgo principal es la generación de sonidos no verbales imprecisos o de prosodia inadecuada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/flockspeech/goldfinch
- Modelo hermano Junco: https://huggingface.co/flockspeech/junco
- Organización Flock Speech: https://huggingface.co/flockspeech
- Paquete Python `flockspeech`: https://pypi.org/project/flockspeech/
- Dataset de entrenamiento: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
- Muestras de audio: https://huggingface.co/flockspeech/goldfinch/resolve/main/samples/laugh.wav, https://huggingface.co/flockspeech/goldfinch/resolve/main/samples/chat.wav, https://huggingface.co/flockspeech/goldfinch/resolve/main/samples/plan.wav, https://huggingface.co/flockspeech/goldfinch/resolve/main/samples/funny.wav, https://huggingface.co/flockspeech/goldfinch/resolve/main/samples/calm.wav

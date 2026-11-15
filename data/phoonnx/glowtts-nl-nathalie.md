# Phoonnx/glowtts-nl-nathalie

## Resumen

GlowTTS-nl-nathalie es un modelo de síntesis de voz (text-to-speech) en neerlandés, distribuido por el usuario Phoonnx como una extracción de una carpeta concreta (`nl-nathalie`) del repositorio agregado `Phoonnx/phoonnx-glowtts`. El modelo emplea la arquitectura GlowTTS, un sistema de síntesis neuronal no autorregresivo basado en flujos normalizadores, y se publica en formato ONNX para su uso con la librería `phoonnx`, una herramienta de inferencia orientada a voces TTS. La relevancia de esta ficha es acotada: se trata de un artefacto derivado, sin model card propia sustantiva, sin métricas publicadas y sin información sobre el corpus de entrenamiento.

El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en el momento de la consulta. La identificación de voz asociada es `larynx/nl-nathalie-glow_tts`, lo que sugiere un origen vinculado al ecosistema Larynx (voces TTS de código abierto, frecuentemente derivadas de datasets como LJSpeech o M-AILABS). No obstante, esa vinculación es una inferencia a partir del identificador y no está documentada en la información disponible.

La licencia declarada es `other`, sin que la model card concrete los términos. Esto supone una limitación importante para cualquier uso comercial o redistribución, ya que no es posible verificar permisos a partir de los metadatos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (síntesis TTS no autorregresiva basada en flujos normalizadores) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandés (según el identificador `nl-nathalie`); no se detalla cobertura adicional |
| Licencia | other (sin especificar en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz que combina un encoder de texto con un decoder basado en flujos invertibles (normalizing flows), lo que permite un entrenamiento con verosimilitud exacta y una inferencia paralela, sin el sesgo autorregresivo típico de modelos como Tacotron. El modelo se distribuye en formato ONNX, lo que facilita su ejecución con runtimes de inferencia estándar y su integración en la librería `phoonnx`.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus, la duración total de audio ni si se aplicaron etapas de ajuste fino o preferencias (RLHF/DPO). La model card únicamente indica que los ficheros conservan las rutas del repositorio original `Phoonnx/phoonnx-glowtts`, del que este modelo es una subcarpeta. No se documentan innovaciones técnicas adicionales más allá de las propias de GlowTTS.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés, con una voz femenina identificada como `nathalie`.
- Inferencia no autorregresiva, lo que permite generar audio en paralelo y con latencia potencialmente baja.
- Ejecución mediante ONNX Runtime y la librería `phoonnx`.
- Identificador de voz expuesto: `larynx/nl-nathalie-glow_tts`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del neerlandés.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura de contenido en neerlandés: el modelo puede convertir artículos, documentación o avisos en audio para aplicaciones de accesibilidad o consumo pasivo, al estar entrenado específicamente para esa lengua.
- Asistentes de voz embebidos: al distribuirse en ONNX y ocupar 0,1 GB, puede integrarse en dispositivos con recursos limitados para respuestas habladas en neerlandés.
- Generación de avisos y notificaciones habladas: útil en sistemas de transporte, domótica o atención telefónica que requieran mensajes pregrabados dinámicos en neerlandés.
- Prototipado de interfaces conversacionales: sirve como componente TTS en pipelines de voz (ASR + LLM + TTS) para demos en neerlandés, con la ventaja de un despliegue sencillo vía `phoonnx`.
- Audiolibros o podcasts automatizados de bajo coste: para contenido en neerlandés donde no se requiera clonación de voz ni expresividad avanzada.
- Pruebas de regresión en pipelines TTS: al ser un artefacto pequeño y determinista, resulta adecuado para validar integraciones de `phoonnx` y comparar salidas entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB), la huella en memoria es reducida y cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; también es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con varios GB de VRAM, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime y la librería `phoonnx`; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS-nl-nathalie (este) | GlowTTS | Neerlandés | ONNX | other (sin especificar) | Hugging Face, vía `phoonnx` |
| Voces Larynx (familia) | GlowTTS / otros | Múltiples | ONNX / otros | variable según voz | Repositorio Larynx |
| Piper (voces TTS) | VITS | Múltiples | ONNX | variable según voz | Proyecto Piper |
| Coqui TTS (XTTS) | VITS / GPT-based | Multilingüe | PyTorch | variable (MPL/CPML) | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La licencia `other` no especifica términos; no se puede confirmar el uso comercial ni la redistribución sin consultar la fuente original.
- Ausencia de model card sustantiva: no hay información sobre datos de entrenamiento, sesgos o calidad de la voz.
- Riesgo de artefactos y errores de pronunciación inherente a un modelo TTS sin evaluación publicada.
- Cobertura limitada al neerlandés; no se documentan otros idiomas.
- Modelo derivado de un repositorio agregado: la procedencia exacta y el mantenimiento no están garantizados.
- Sin descargas ni validación comunitaria en el momento de la consulta; conviene evaluar la calidad de audio antes de usarlo en producción.
- No apto para clonación de voz ni control expresivo avanzado, según las capacidades documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-nl-nathalie
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx

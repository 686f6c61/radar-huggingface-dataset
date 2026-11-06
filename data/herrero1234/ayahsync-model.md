# herrero1234/ayahsync-model

## Resumen

AyahSync speech model es una versión cuantizada en formato GGML del modelo de reconocimiento de voz tarteel-ai/whisper-base-ar-quran, desarrollado originalmente por Tarteel AI. La conversión y cuantización ha sido realizada por el usuario herrero1234 con el objetivo de integrarlo en la aplicación móvil AyahSync (ayah-sync.com), que lo emplea para el reconocimiento de recitaciones del Corán directamente en el dispositivo mediante whisper.cpp y whisper.rn.

El modelo base es un fine-tuning de Whisper base (arquitectura transformer encoder-decoder de OpenAI) especializado en audio recitado en árabe coránico, y esta derivación no incluye reentrenamiento: únicamente conversión de formato (Hugging Face a GGML) y cuantización a 5 bits (q5_0). El resultado es un fichero de aproximadamente 53 MB, ideal para inferencia en dispositivos con recursos limitados. Su relevancia radica en que permite llevar un modelo de ASR especializado en recitación coránica a móviles sin depender de servidores, con licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible (Whisper base: ~74 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper base: 30 s de audio por ventana) |
| Tipos de cuantizacion | q5_0 (GGML) |
| Idiomas soportados | Árabe (recitación coránica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (fichero `ggml-base-ar-quran-q5_0.bin`, ~53 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper base de OpenAI: un transformer encoder-decoder entrenado para reconocimiento automático de voz, con un encoder que procesa log-Mel spectrograms del audio y un decoder autoregresivo que genera la transcripción. El modelo base fue afinado por Tarteel AI sobre audio de recitación del Corán en árabe, dominio en el que la pronunciación tajwid y la memorización exacta del texto requieren un modelo especializado frente al Whisper genérico.

Esta derivación no modifica los pesos: el trabajo de herrero1234 se limita a convertir los pesos de Hugging Face al formato GGML compatible con whisper.cpp y a aplicar cuantización de 5 bits (q5_0), lo que reduce el tamaño del modelo a unos 53 MB con una pérdida mínima de precisión. No se dispone de datos sobre el número de tokens o horas de audio del entrenamiento original ni sobre técnicas de alineación adicionales en la información disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en recitación coránica.
- Transcripción en dispositivo (on-device) mediante whisper.cpp en plataformas nativas y whisper.rn en React Native.
- Ejecución con recursos reducidos gracias a la cuantización q5_0 (~53 MB de pesos).
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución.
- No soporta capacidades más allá de ASR: no genera texto libre, no realiza tool calling ni razonamiento multi-paso.

## Casos de uso

- Verificación de memorización del Corán: la app AyahSync emplea el modelo para transcribir la recitación del usuario y compararla con el texto coránico, identificando errores palabra a palabra.
- Alineación de audio con versículos: transcribir recitaciones para sincronizar automáticamente el audio con los ayat correspondientes en aplicaciones de lectura.
- Apps móviles de ASR sin conexión: el tamaño de ~53 MB y el formato GGML permiten integrarlo en iOS y Android sin llamadas a APIs remotas, garantizando privacidad y funcionamiento offline.
- Herramientas de aprendizaje de recitación (tajwid): feedback inmediato al estudiante comparando su transcripción con el texto de referencia.
- Transcripción de recitaciones en investigaciones lingüísticas o de corpus sobre árabe coránico, ejecutándose en CPU de equipos convencionales.
- Integración en pipelines de whisper.cpp en servidores ligeros para procesar volúmenes moderados de audio coránico sin GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base tarteel-ai/whisper-base-ar-quran ha reportado en su día métricas de precisión sobre recitación coránica, pero dichos datos no figuran en la información proporcionada y no se incluyen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM / memoria estimada: unos 53 MB solo para los pesos; con overhead de inferencia, en torno a 100-150 MB de RAM, ejecutable en CPU sin GPU dedicada.
- GPUs recomendadas: no requiere GPU; cualquier CPU moderna de smartphone o de escritorio es suficiente. En escritorio, funciona con GPUs integradas o discretas vía whisper.cpp (opcionalmente con aceleración Metal, CUDA o Vulkan).
- Consumer GPUs: no es necesario; cabe holgadamente en cualquier GPU consumer si se desea acelerar (por ejemplo, una RTX 3060 o superior sería más que suficiente).
- Opciones de despliegue: whisper.cpp (uso principal), whisper.rn (React Native en móvil), Ollama no aplica; cualquier runtime compatible con GGML de Whisper.
- Latencia y throughput: no disponible; al ser un modelo base cuantizado a q5_0, se espera inferencia en tiempo real o mejor en CPUs móviles recientes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Dominio | Licencia |
|---|---|---|---|---|---|
| herrero1234/ayahsync-model | ~74 M (base) | GGML | q5_0 | Recitación coránica (árabe) | Apache-2.0 |
| tarteel-ai/whisper-base-ar-quran | ~74 M | Safetensors (Hugging Face) | Sin cuantizar | Recitación coránica (árabe) | Apache-2.0 |
| openai/whisper-base | ~74 M | PyTorch / HF | Varias (comunidad) | ASR multilingüe general | MIT |
| whisper.cpp (modelos base genéricos GGML) | ~74 M | GGML | q5_0 y otras | ASR multilingüe general | MIT |

La ventaja de esta variante frente al Whisper genérico es su especialización en recitación coránica; frente al modelo base de Tarteel, su ventaja es el formato GGML cuantizado listo para despliegue en dispositivo.

## Limitaciones y advertencias

- Alcance restringido al dominio de recitación coránica en árabe: el rendimiento en árabe coloquial, otros dialectos o cualquier otro idioma no está garantizado y probablemente sea inferior al Whisper genérico.
- La cuantización q5_0 introduce una ligera pérdida de precisión respecto al modelo original en FP16, que puede afectar a transcripciones en audio ruidoso o recitaciones muy rápidas.
- Al ser un modelo base (no large), su precisión general de ASR es limitada frente a variantes medium o large.
- No hay model card detallada con métricas de evaluación de esta derivación concreta, por lo que conviene validarla con datos propios antes de usarla en producción.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque debe conservarse la atribución a Tarteel AI y OpenAI según corresponda.
- Repositorio con 0 descargas registradas y sin comunidad activa visible: el mantenimiento y la resolución de incidencias dependen del autor individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/herrero1234/ayahsync-model
- Modelo base original: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Aplicación AyahSync: https://ayah-sync.com
- whisper.cpp: https://github.com/ggerganov/whisper.cpp

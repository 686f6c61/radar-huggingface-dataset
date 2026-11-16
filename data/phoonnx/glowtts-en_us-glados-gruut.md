# Phoonnx/glowtts-en_us-glados-gruut

## Resumen

glowtts-en_us-glados-gruut es un modelo de síntesis de voz (text-to-speech) en formato ONNX empaquetado por Phoonnx para su librería de TTS basada en ONNX. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, concretamente la variante de voz "GLaDOS" para inglés estadounidense (en-US). Phoonnx se limita a reempaquetar los pesos originales en un formato consumible por su ecosistema, que incluye integración con asistentes de voz OVOS/Mycroft.

La arquitectura es Glow-TTS, un modelo de síntesis acústica basado en normalizing flows que genera espectrogramas mel a partir de fonemas. La entrada de texto no es texto plano sino fonemas en alfabeto IPA procesados por el fonemizador gruut, y la salida espectral se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automáticamente junto con la voz.

Es relevante para desarrolladores que necesitan TTS ligero y offline en inglés, integrable en pipelines Python o en asistentes de voz autoalojados. El repositorio ocupa solo 0,1 GB y el modelo se distribuye como voice pack dentro del gestor de modelos de Phoonnx. La licencia no está registrada en el repositorio, lo que constituye una advertencia importante para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow para síntesis acústica) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada en el repositorio; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela la distribución conjunta de fonemas y espectrogramas mel mediante transformaciones invertibles. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite alineamiento monotónico y generación paralela, lo que reduce la latencia de inferencia. La variante empaquetada aquí corresponde a la voz "GLaDOS" del proyecto Larynx de Rhasspy, entrenada para inglés estadounidense.

El modelo no genera audio directamente: produce un espectrograma mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN `hifigan-multi-vctk-small`, entrenado sobre el corpus multi-hablante VCTK. El front-end de texto lo aporta la librería `scriptconv` mediante el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto plano, con normalización y fonemización automática mediante gruut.
- Generación de espectrogramas mel y conversión a audio WAV a través del vocoder HiFi-GAN integrado.
- Ejecución en formato ONNX, lo que permite inferencia en CPU y GPU con runtimes compatibles.
- Integración nativa con la librería Phoonnx en Python mediante `TTSModelManager`.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No dispone de modo thinking ni capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz autoalojados: el modelo se integra en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo dotar de voz a un asistente doméstico sin depender de servicios cloud y con un repositorio de solo 0,1 GB.
- Síntesis offline en aplicaciones de escritorio: al ejecutarse sobre ONNX, puede embeberse en aplicaciones Python que necesiten leer texto en voz alta sin conexión a Internet.
- Generación de avisos y notificaciones habladas: adecuado para sistemas de alertas, domótica o lectores de pantalla en inglés, donde la latencia de generación paralela de Glow-TTS es una ventaja frente a modelos autorregresivos.
- Pruebas y desarrollo de pipelines TTS: útil como voz de referencia ligera en entornos de CI o tests automatizados de sistemas de voz, dado su reducido tamaño y su formato ONNX portable.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo con salida de voz real en inglés antes de invertir en modelos TTS de mayor calidad.
- Contenido creativo y demos: la voz "GLaDOS" (personaje de Portal) resulta adecuada para proyectos de fans, mods o demostraciones con fines no comerciales, siempre que se respete la licencia upstream.
- Lectura de documentos en inglés: integrable en scripts que conviertan texto a WAV por frases, usando el front-end gruut para manejar números, abreviaturas y puntuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB), el modelo y el vocoder caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Funciona también en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX moderna e incluso en iGPU con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime a través de la librería Phoonnx; integración con OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| glowtts-en_us-glados-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB |
| Otras voces Larynx (en-US) | Glow-TTS + HiFi-GAN | en-US | ONNX / tarball | varía según voz | similar |
| Piper (Rhasspy) | VITS | multilingüe | ONNX | MIT en la mayoría de voces | similar |
| Coqui TTS (modelos VITS) | VITS / Tacotron2 | multilingüe | PyTorch / ONNX | MPL 2.0 (Coqui) | mayor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- La licencia figura como "other" y el propio autor indica que no hay licencia registrada para este modelo; es imprescindible verificar la licencia del release upstream de Rhasspy antes de cualquier uso, especialmente comercial.
- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La voz "GLaDOS" es una imitación de un personaje con derechos de propiedad intelectual; su uso comercial puede vulnerar derechos de terceros.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento, siglas, nombres propios o texto con formato complejo.
- La calidad depende del front-end gruut para la fonemización; errores en la normalización de texto se traducen directamente en audio defectuoso.
- No se documentan sesgos específicos del dataset de entrenamiento, pero al derivar de Larynx y VCTK puede heredar sesgos de acento y prosodia de dichos corpus.
- No apto para tareas de razonamiento, código, matemáticas ni procesamiento de lenguaje natural más allá de la síntesis de voz.
- El número de descargas (19) y likes (0) es muy bajo, lo que sugiere escasa validación comunitaria; conviene probar exhaustivamente antes de desplegar en producción.
- No se especifican requisitos de versión de ONNX Runtime ni compatibilidad con versiones futuras de Phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-glados-gruut
- Repositorio upstream (Larynx, release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_glados-glow_tts.tar.gz
- Librería Phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small

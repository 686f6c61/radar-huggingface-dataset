# Shchepa/andrei-voice-f5tts

## Resumen

`Shchepa/andrei-voice-f5tts` es un modelo de síntesis de voz (text-to-speech) con clonación de voz, publicado por el usuario Shchepa en HuggingFace y orientado exclusivamente al ruso. Se trata de un ajuste fino (finetune) del modelo `ESpeech/ESpeech-TTS-1_RL-V2`, que a su vez pertenece a la familia F5-TTS, una arquitectura de flow matching con Diffusion Transformer (DiT) no autorregresiva. El repositorio ocupa 1,3 GB y el pipeline declarado es `text-to-speech`; la librería de referencia es `f5-tts`.

El modelo resuelve un caso de uso muy concreto: generar habla en ruso con la identidad vocal de un hablante específico ("andrei-voice"), partiendo presumiblemente de audio de referencia. No es un modelo de propósito general ni un modelo de lenguaje: no hace razonamiento, no soporta tool calling ni agentes, y su única tarea es convertir texto en audio.

Su relevancia actual es limitada y debe contextualizarse: la ficha registra 0 descargas y 0 "likes", tiene acceso restringido (gated) y no publica ni dataset de entrenamiento, ni métricas de calidad, ni detalles de hiperparámetros. La licencia declarada es Apache-2.0, lo que en principio facilitaría el uso comercial, pero esa declaración debe verificarse contra la licencia del modelo base antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS: flow matching con Diffusion Transformer (DiT), no autorregresiva (según tags y librería; la ficha no aporta detalles adicionales) |
| Parámetros totales | No disponible en la ficha. El repositorio de 1,3 GB es compatible con un checkpoint de ~300-340 M de parámetros en fp32, coherente con el tamaño publicado de F5-TTS (~336 M), pero no está confirmado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en TTS equivale a la duración máxima de audio de referencia y de generación; no se documenta) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache-2.0 (declarada; verificar compatibilidad con la licencia del modelo base) |
| Formato de pesos | No disponible (no se detalla; repositorio de 1,3 GB compatible con un checkpoint único de `f5-tts`) |
| Pipeline | text-to-speech |
| Modelo base | ESpeech/ESpeech-TTS-1_RL-V2 |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según metadatos) | 2026-09-21 |

## Arquitectura y entrenamiento

La familia F5-TTS emplea un esquema de flow matching sobre un Diffusion Transformer: el texto y el audio se proyectan en una secuencia latente común y el modelo aprende un campo de velocidad que transforma ruido en mel-espectrogramas, con un decoder vocacional posterior. Al no ser autorregresiva, la generación no depende de un bucle token a token, lo que en la implementación original se combina con técnicas de muestreo como *sway sampling* para controlar la fidelidad y la estabilidad temporal. La clonación de voz se realiza en modo zero-shot: se aporta un fragmento de audio de referencia junto con su transcripción y el modelo replica el timbre del hablante. Todos estos rasgos proceden de la arquitectura F5-TTS en la que se apoya la librería declarada, no de documentación específica de esta ficha.

En cuanto al entrenamiento de este finetune concreto, no hay información disponible: no se documentan el número de tokens o horas de audio, la composición del dataset, el idioma o acento de los datos de referencia, ni si se aplicaron etapas de ajuste por preferencias (RLHF/DPO). El nombre del modelo base incluye el sufijo `1_RL-V2`, lo que sugiere que el modelo original incorporó alguna forma de entrenamiento por refuerzo, pero la ficha no aporta detalles al respecto. Tampoco se indica si el ajuste fue de espectrograma completo, de adaptación de hablante (*speaker adaptation*) o mediante LoRA.

## Capacidades

- Generación de voz en ruso a partir de texto, con salida de audio (pipeline `text-to-speech`).
- Clonación de voz: los tags incluyen `voice-cloning`, de modo que el modelo está pensado para replicar una identidad vocal concreta a partir de audio de referencia.
- Síntesis no autorregresiva, con el perfil de velocidad propio de F5-TTS.
- Modelo monolingüe: únicamente ruso (`ru`). No hay soporte declarado de otros idiomas.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no soportado.
- Visión, audio de entrada distinto de la referencia de voz, o modo "thinking": no soportado.
- Control de prosodia o emoción: no documentado en la información disponible.

## Casos de uso

- Audiolibros y lectura de textos largos en ruso: el modelo puede narrar documentos o libros manteniendo una voz consistente. Es adecuado porque la clonación garantiza uniformidad de timbre entre capítulos, aunque la duración máxima de generación por pasada no está documentada y habría que segmentar.
- Doblaje y localización de contenido audiovisual al ruso: sustitución de la pista de voz original por una síntesis con una voz concreta, útil para vídeos corporativos o materiales formativos donde no se dispone de un actor de doblaje.
- Sistemas de respuesta vocal interactiva (IVR) y asistentes telefónicos en ruso: generar avisos y respuestas habladas con una voz de marca fija, ya que el modelo requiere audio de referencia y permite mantener siempre el mismo timbre.
- Accesibilidad: conversión de artículos, informes o documentación a audio para personas con discapacidad visual de habla rusa, aprovechando que la inferencia puede ejecutarse en local sin depender de APIs externas.
- Producción de contenido para pódcast y vídeo corto: generación de locuciones y voces en off en ruso sin necesidad de grabar, con coste marginal nulo por iteración una vez desplegado el modelo.
- Datos sintéticos para entrenar sistemas ASR en ruso: ampliación de corpus de habla con múltiples textos y una voz conocida, siempre que se controle la diversidad y se documente la procedencia del audio.
- Investigación en clonación de voz y evaluación de sistemas TTS: al ser un finetune sobre F5-TTS, sirve como punto de comparación para estudiar el efecto del ajuste sobre una voz concreta y sobre un idioma específico.
- Prototipado de interfaces de voz en productos de software: integrar el modelo en un servicio interno para probar experiencia de usuario con voz en ruso antes de contratar una solución comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye métricas de calidad (MOS, CMOS, similitud de hablante, WER de inteligibilidad), ni tiempos de inferencia (RTF), ni comparaciones con otros sistemas TTS. Tampoco se dispone de datos objetivos sobre estabilidad de la voz clonada, naturalidad o robustez ante textos largos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos de ~300-340 M de parámetros, el checkpoint ocupa alrededor de 1,3 GB en fp32 y en torno a 0,7 GB en fp16/bf16. Sumando activaciones, buffers de audio y el vocoder, una estimación razonable es de 2 a 4 GB de VRAM en fp16 para fragmentos cortos, y de 4 a 6 GB si se procesan audios de referencia largos. Son estimaciones derivadas del tamaño del repositorio, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM debería ser suficiente. Para producción con varias peticiones concurrentes se recomienda una GPU de clase profesional (A100, H100, L40S); para desarrollo, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o superiores.
- Viabilidad en GPU de consumo: sí, cabe en tarjetas de gama media como RTX 3060 12 GB o RTX 4060. También es viable en CPU mediante la implementación `f5-tts`, con latencia muy superior.
- Opciones de despliegue: la librería declarada es `f5-tts`, que ofrece inferencia por línea de comandos y una interfaz Gradio. No se documenta soporte para vLLM, TGI (no orientados a TTS de este tipo), Ollama ni llama.cpp; no hay confirmación de servidores de inferencia optimizados para este checkpoint.
- Latencia y throughput: no disponible. No se publican valores de RTF ni de audio generado por segundo. Además, el acceso está restringido, por lo que no se puede reproducir ninguna medición sin aceptar previamente las condiciones en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shchepa/andrei-voice-f5tts | No confirmado (~300-340 M estimados) | Ruso | Sí (zero-shot, según tags) | Apache-2.0 (declarada) | Gated en HuggingFace, 0 descargas |
| ESpeech/ESpeech-TTS-1_RL-V2 (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| F5-TTS original (SWivid) | ~336 M según la publicación original | Principalmente inglés y chino, con variantes multilingües | Sí (zero-shot) | Pesos bajo licencia no comercial (CC-BY-NC), código MIT | Abierto en HuggingFace y GitHub |
| XTTS-v2 (Coqui) | No disponible | 17 idiomas, incluye ruso | Sí (zero-shot) | Coqui Public Model License (CPML), uso comercial restringido | Abierto en HuggingFace |

La comparación cuantitativa no es posible: no hay benchmarks compartidos ni métricas de calidad publicadas por el autor de este finetune. El principal diferencial frente a las alternativas es la licencia Apache-2.0 declarada, más permisiva que las de F5-TTS original y XTTS-v2, siempre y cuando la cadena de licencias del modelo base lo permita.

## Limitaciones y advertencias

- Ausencia total de validación por la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha. No hay evidencia externa de calidad ni de estabilidad.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar el modelo, lo que complica la reproducibilidad y la evaluación independiente.
- Licencia declarada Apache-2.0, pero el modelo es un finetune de `ESpeech/ESpeech-TTS-1_RL-V2` y no se verifica la licencia de ese modelo base. Si la cadena original proviene de pesos F5-TTS con licencia no comercial, la declaración Apache-2.0 podría no ser válida. Conviene revisarlo antes de cualquier uso comercial.
- Modelo monolingüe en ruso: no admite entradas en otros idiomas, ni siquiera en alfabetos latinos, salvo que se fuerce una transliteración con resultados impredecibles.
- Riesgo de alucinación acústica: en sistemas TTS no autorregresivos es habitual encontrar artefactos, repeticiones, silencios anómalos o mala pronunciación de números, siglas y nombres propios, especialmente en textos largos. No hay datos que cuantifiquen este riesgo en este checkpoint.
- Clonación de voz con implicaciones éticas y legales: el modelo permite replicar una identidad vocal concreta. Su uso para suplantación, desinformación o generación de audio sin consentimiento del hablante puede ser ilegal en la Unión Europea y en otras jurisdicciones. Es imprescindible contar con consentimiento explícito y aplicar marcas de agua o metadatos de procedencia.
- Sesgos desconocidos: al no publicarse la composición del dataset de ajuste, se desconoce el acento, el registro, la edad o el género representados, así como el posible sesgo hacia un único estilo de habla.
- Sin información sobre límites de duración: no se documenta cuánto audio puede generarse en una sola pasada ni cuál es la longitud máxima recomendada del audio de referencia, lo que dificulta el dimensionamiento en producción.
- Metadatos inconsistentes: las fechas de creación y actualización indican septiembre de 2026, posteriores a la mayoría de referencias del ecosistema. Esto sugiere metadatos erróneos o un repositorio de prueba, y refuerza la necesidad de validar el modelo por cuenta propia.
- No apto como modelo de lenguaje: no soporta instrucciones complejas, razonamiento, tool calling ni agentes. Cualquier pipeline que lo use debe tratarlo exclusivamente como un componente de síntesis de voz.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los resultados obtenidos corresponden al club de fútbol Wrexham AFC y son completamente ajenos a esta ficha. No existe, por tanto, documentación externa, artículo ni nota de prensa que respalde las características declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shchepa/andrei-voice-f5tts
- Modelo base en HuggingFace: https://huggingface.co/ESpeech/ESpeech-TTS-1_RL-V2
- Repositorio oficial de la implementación F5-TTS (proyecto de referencia de la arquitectura y de la librería `f5-tts`): https://github.com/SWivid/F5-TTS
- Artículo técnico de F5-TTS, "F5-TTS: A Fairytale of Flow-matching and Diffusion Transformer" (arXiv, octubre de 2024): referencia general del proyecto, no recuperada en la búsqueda web realizada para esta ficha
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo. Los resultados devueltos (sitio oficial, noticias y tienda de Wrexham AFC) no guardan relación con este modelo ni con síntesis de voz.

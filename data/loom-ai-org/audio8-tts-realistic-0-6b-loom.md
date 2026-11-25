# loom-ai-org/audio8-tts-realistic-0.6b-loom

## Resumen

Audio8-TTS Realistic 0.6B Loom es la exportación al motor loom.cpp del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, un TTS zero-shot con clonación de voz que cubre 23 idiomas. El modelo original lo desarrolla Edge0 y esta versión la publica loom-ai-org como un único fichero GGUF autocontenido que incluye las topologías de grafo, el tokenizador y el script de control necesarios para ejecutarlo con la librería loom-py-rt. Con 605.102.732 parámetros (0,6B), se posiciona como una alternativa ligera para generación de habla en producción.

La particularidad arquitectónica es que no genera audio directamente: es un modelo DualAR (autorregresivo dual) de texto a códigos que emite diez flujos de tokens de códec, en disposición frame-major a 21,5 fotogramas por segundo. La síntesis final a 44,1 kHz la realiza un segundo modelo, el códec `audio8-tts-codec-loom`, publicado en un repositorio aparte. Esta separación permite reutilizar el códec entre distintos modelos de la familia y tratar los códigos como un intermedio útil para streaming o procesado.

Su relevancia actual radica en tres factores: licencia Apache 2.0 sin restricciones para uso comercial, soporte de clonación de voz zero-shot a partir de un clip de 3 a 15 segundos con su transcripción exacta, y un formato de pesos GGUF con cuantizaciones que facilitan el despliegue fuera de entornos PyTorch. El repo ocupa 7,3 GB e incluye varias precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (autorregresivo dual) de texto a codigos; familia 10 de loom.cpp |
| Parametros totales | 605.102.732 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y cuantizaciones adicionales derivadas (el repo incluye varias precisiones; no se detallan todas) |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (23) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (autodescriptivo, con grafo, tokenizador y driver embebidos) |
| Salida | Tokens de codec: frame-major, 10 codebooks, 21,5 frames/s |
| Frecuencia de audio final | 44,1 kHz mono (via codec `audio8-tts-codec-loom`) |
| Libreria de inferencia | loom-py-rt (PyPI), motor loom.cpp |
| Tamano del repo | 7,3 GB |

## Arquitectura y entrenamiento

El modelo es un DualAR, es decir, un esquema autorregresivo con dos niveles de predicción que genera de forma secuencial diez flujos de tokens de códec por fotograma. La salida es frame-major: una fila por fotograma, diez codebooks de ancho, a una tasa de 21,5 fotogramas por segundo. El modelo detecta el idioma a partir del texto de entrada, sin necesidad de etiqueta explícita. La exportación a loom.cpp conserva los parámetros del checkpoint original en el fichero F32 y deriva de él las versiones cuantizadas; el GGUF resultante es autocontenido e incluye la topología del grafo y el driver de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el muestreo por defecto usa temperatura 0,7, top-k 50 y top-p 0,9, con una regla de redibujado sensible a repeticiones propia del modelo original (no la de transformers: top-k y top-p se miden antes de aplicar la temperatura). Con `temperature=0` se decodifica de forma greedy y se reproduce exactamente la salida de `generate(do_sample=False)` del modelo original en F32, código por código, incluso con voz clonada. La clonación se realiza mediante ficheros de voz generados una sola vez con loom-exporter, que ejecutan el encoder del códec en PyTorch y producen un GGUF de tokens de voz sellado con una huella de los cuantizadores del códec.

## Capacidades

- Síntesis de voz (text-to-speech) en 23 idiomas, incluidos chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés.
- Clonación de voz zero-shot a partir de un clip de referencia de 3 a 15 segundos junto con su transcripción exacta; el clip se introduce como tokens de códec.
- Detección automática del idioma a partir del texto de entrada.
- Salida en forma de tokens de códec (10 codebooks, 21,5 frames/s) que un códec separado convierte en audio a 44,1 kHz.
- Inferencia en streaming: los códigos se emiten a medida que se muestrean y cada fragmento se decodifica al llegar (ADR-102 de loom.cpp), lo que permite reproducir audio en tiempo real.
- Control de muestreo: semilla fija (`seed=`) para reproducibilidad, decodificación greedy con `temperature=0`, y acceso al driver subyacente mediante `model.infer(...)` para ajustar parámetros no expuestos por la API de alto nivel.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo puramente de texto a códigos de audio.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en habla en 23 idiomas y permite fijar una voz consistente mediante un fichero de voz clonado, de modo que capítulos completos mantienen el mismo timbre.
- Asistentes de voz y agentes conversacionales: la salida en streaming (códigos emitidos y decodificados por fragmentos) permite iniciar la reproducción antes de completar la síntesis, lo que reduce la latencia percibida en respuestas de un chatbot.
- Localización de vídeo y e-learning: con 23 idiomas y detección automática, un mismo guion puede sintetizarse en español, inglés, japonés o árabe sin cambiar de modelo, integrándose en pipelines de doblaje.
- Clonación de voz para contenido corporativo: a partir de un clip de 3 a 15 segundos del locutor autorizado se genera un fichero de voz reutilizable, adecuado para formaciones internas o mensajes de marca con licencia Apache 2.0.
- Generación de datos de audio sintético: los tokens de códec son un intermedio manipulable que puede alimentar pipelines de aumento de datos o entrenamiento de modelos de reconocimiento de voz, ya que el modelo no produce la onda directamente.
- Integración en aplicaciones de escritorio o embebidas: el formato GGUF con cuantizaciones y la librería loom-py-rt permiten desplegar el modelo sin pila PyTorch en tiempo de inferencia (el encoder del códec solo se necesita para crear ficheros de voz).
- Accesibilidad: lectura en voz alta de documentos y pantallas con selección de idioma automática y voces clonadas para usuarios que requieran un timbre concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 605 millones de parámetros, el fichero F32 ocupa aproximadamente 2,4 GB solo en pesos; las cuantizaciones reducen esta cifra de forma proporcional. El repo completo ocupa 7,3 GB porque incluye varias precisiones.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabe en GPUs de consumo con suficiente VRAM para la precisión elegida, pero la model card no especifica modelos concretos.
- Cabe en consumer GPU: previsiblemente sí en el caso de las cuantizaciones, dado el tamaño de 0,6B; no se detalla qué tarjetas exactas.
- Opciones de despliegue: loom-py (paquete `loom-py-rt` en PyPI, con extra `[hub]`) sobre el motor loom.cpp. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La arquitectura de streaming permite solapar síntesis y reproducción, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Audio8-TTS Realistic 0.6B Loom | 0,6B | no disponible | 23 | Apache 2.0 | GGUF (loom.cpp) | Exportación; requiere códec aparte para audio |
| Edge0/Audio8-TTS-Realistic-0.6b | 0,6B | no disponible | 23 | Apache 2.0 (heredada) | safetensors (checkpoint original) | Modelo base; salida en tokens de códec |
| Audio8-TTS-Preview | no disponible | no disponible | no disponible | no disponible | no disponible | Comparte el mismo fichero de códec según la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo no produce audio: emite diez flujos de tokens de códec que deben pasar por `audio8-tts-codec-loom` para obtener la onda a 44,1 kHz. Usarlo de forma aislada no genera sonido.
- El muestreo por defecto es estocástico (temperatura 0,7, top-k 50, top-p 0,9 con redibujado sensible a repeticiones), por lo que dos ejecuciones dan resultados distintos salvo que se fije `seed=` o se use `temperature=0`.
- La clonación de voz exige un clip limpio de 3 a 15 segundos con su transcripción exacta; un clip ruidoso o una transcripción incorrecta degradan el resultado.
- Los ficheros de voz están sellados con una huella de los cuantizadores del códec: un fichero generado con otro códec es rechazado.
- La licencia del fichero de voz corresponde a la grabación original, no a la del modelo; la responsabilidad sobre el consentimiento del locutor recae en el usuario.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas por idioma más allá de la lista de lenguas soportadas.
- La longitud de contexto no está publicada, lo que dificulta planificar la síntesis de textos muy largos sin fragmentación.
- El modelo base está identificado como `Edge0/Audio8-TTS-Realistic-Air` en las etiquetas de Hugging Face y como `Edge0/Audio8-TTS-Realistic-0.6b` en la model card; conviene verificar cuál es el checkpoint de referencia exacto antes de reproducir resultados.
- No se especifican requisitos de hardware ni cifras de latencia, por lo que el dimensionamiento para producción debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/audio8-tts-realistic-0.6b-loom
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Códec complementario: https://huggingface.co/loom-ai-org/audio8-tts-codec-loom
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API loom-py: https://github.com/loom-ai-org/loom-py

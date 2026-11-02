# nayanbastakoti/kokoro-ne

## Resumen

kokoro-ne es un modelo de síntesis de voz (text-to-speech) especializado en nepalí, con capacidad adicional para hindi e inglés, incluyendo frases con mezcla de idiomas (code-switching) del tipo "आज मेरो office मा meeting छ". Lo desarrolla nayanbastakoti como un fine-tune de goonj-1-82M, que a su vez es un fine-tune en hindi de Kokoro-82M de hexgrad. El modelo resuelve el problema de la síntesis de voz en nepalí, un idioma con escasa cobertura en sistemas TTS de calidad, manteniendo un tamaño reducido que permite inferencia rápida en CPU.

La arquitectura subyacente es StyleTTS 2 (implementada en la librería `kokoro`), con 82M parámetros y una frecuencia de muestreo de 24 kHz. Se entrenó sobre aproximadamente 4 horas de audio nepalí multihablante, combinando OpenSLR 43, FLEURS y datos de replay en hindi e inglés. Su relevancia actual radica en que ofrece TTS multilingüe con code-switching en un modelo pequeño (0,3 GB de repositorio) que puede ejecutarse en hardware modesto, algo poco habitual para idiomas del sur de Asia.

El modelo se distribuye con licencia Apache-2.0 para los pesos y dos voicepacks derivados de OpenSLR 43 bajo CC BY-SA 4.0. Está pensado para desarrolladores que necesiten integrar voz en nepalí en aplicaciones de accesibilidad, asistentes o contenido multimedia sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (librería `kokoro`, clase `KModel`) |
| Parametros totales | 82M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa fonemas, no tokens de texto con ventana fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne), hindi (hi), inglés (en); soporta code-switching |
| Licencia | Apache-2.0 (pesos); voicepacks CC BY-SA 4.0 |
| Formato de pesos | `.pth` (KModel), voicepacks `.pt`, `config.json` |
| Frecuencia de muestreo | 24 kHz |
| Tamano del repositorio | 0,3 GB |
| Modelo base | BH-Builds/goonj-1-82M |

## Arquitectura y entrenamiento

kokoro-ne emplea la arquitectura StyleTTS 2 tal como la implementa la librería `kokoro`, con la misma configuración y vocabulario de fonemas que goonj-1-82M (sin cambios en `config.json`). El modelo se carga mediante `KModel` pasando el `config.json` y los pesos `kokoro_ne.pth`, y genera audio a partir de secuencias de fonemas producidas por misaki (`EspeakG2P("ne")` para nepalí, `EspeakG2P("hi")` para hindi y `en.G2P` para inglés).

El entrenamiento se realizó con la receta StyleTTS 2 de kikiri-tts sobre una única GPU T4. Los datos suman aproximadamente 4,9 horas: 2,6 horas de OpenSLR 43 Nepali TTS (18 hablantes, todas femeninas), 1,3 horas de los clips más limpios de FLEURS nepalí y 1,0 hora de replay de indic-audio en hindi e inglés (15 hablantes). El proceso constó de Stage 1 con 2 épocas (la pérdida de mel de validación bajó de 0,342 a 0,322) y Stage 2 con 1 época. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz en nepalí con múltiples hablantes (predominantemente femeninas).
- Síntesis de voz en hindi e inglés como idiomas secundarios.
- Code-switching: genera frases que mezclan nepalí con palabras en inglés u hindi dentro de la misma oración.
- Fonemización automática mediante misaki para los tres idiomas.
- Clonación de voz arbitraria a través del paquete `kokoro_ne` (`CloneTTS`) del repositorio GitHub.
- Manejo de texto largo mediante el paquete `kokoro_ne` (`TTS`).
- Voicepacks incluidos para dos hablantes de OpenSLR 43 (`openslr_0546.pt`, `openslr_2099.pt`).
- Inferencia rápida en CPU de 2 núcleos según el autor.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo TTS).

## Casos de uso

- Accesibilidad y lectura de contenido en nepalí: convertir artículos, noticias o documentos a voz para usuarios con discapacidad visual, aprovechando la inferencia en CPU que permite desplegarlo en dispositivos modestos.
- Asistentes de voz para atención al cliente en nepalí: generar respuestas habladas en conversaciones automatizadas, con la ventaja del code-switching para frases donde aparecen términos técnicos en inglés ("office", "meeting").
- Contenido multimedia y doblaje: producir narraciones para vídeos, pódcast o audiolibros en nepalí con varias voces femeninas disponibles en los voicepacks incluidos.
- Sistemas de anuncios y megafonía: síntesis en tiempo real de avisos en estaciones, aeropuertos o comercios, donde la latencia baja en CPU es crítica.
- Aplicaciones educativas de aprendizaje de idiomas: generar pronunciaciones en nepalí, hindi e inglés para materiales de aprendizaje, incluyendo ejercicios de mezcla de idiomas.
- Prototipado de interfaces de voz: integrar TTS en asistentes domésticos o aplicaciones móviles sin depender de APIs en la nube, gracias al tamaño reducido (0,3 GB) y la licencia Apache-2.0.
- Clonación de voz para personalización: usar `CloneTTS` del repositorio para crear voces a medida, útil en producción de contenido o en aplicaciones de accesibilidad que requieran una voz concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no hay pruebas de escucha (listening tests) ni puntuaciones ASR. El único dato de rendimiento documentado es la pérdida de mel de validación en Stage 1, que pasó de 0,342 a 0,322 tras 2 épocas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 82M parámetros en precisión completa el modelo ocupa aproximadamente 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor documenta entrenamiento en una T4; para inferencia es suficiente cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100).
- CPU: el autor afirma que funciona rápido en una CPU de 2 núcleos, lo que lo hace apto para despliegue en entornos sin GPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria libre.
- Opciones de despliegue: librería `kokoro` (carga de `KModel`), paquete `kokoro_ne` del repositorio GitHub para fonemización, mezcla de idiomas y texto largo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles de forma numérica; solo la afirmación cualitativa de rapidez en CPU de 2 núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokoro-ne | 82M | ne, hi, en (con code-switching) | no disponible | Apache-2.0 (pesos) | HuggingFace, 4 descargas |
| Kokoro-82M (hexgrad) | 82M | múltiples (incluye en) | no disponible | Apache-2.0 | HuggingFace, ampliamente usado |
| goonj-1-82M (BH-Builds) | 82M | hi, en | no disponible | no disponible en la información | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo de kokoro-ne frente a Kokoro-82M o goonj-1-82M. La comparación se limita a parámetros, idiomas y licencia. No se han identificado en la información proporcionada otros modelos TTS específicos para nepalí con los que contrastar.

## Limitaciones y advertencias

- El habla nepalí del modelo es mayoritariamente femenina (las 18 hablantes de OpenSLR 43 son todas mujeres), por lo que las voces tienden a sonar femeninas; para voces masculinas el autor remite a `kokoro-ne-clone` con conversión de voz Kanade.
- Los números se sintetizan mejor si se escriben como palabras.
- No hay pruebas de escucha ni puntuaciones ASR publicadas, por lo que la calidad subjetiva no está validada de forma independiente.
- Riesgo de alucinación o artefactos de pronunciación en texto fuera de dominio, especialmente en nepalí, dado el volumen reducido de datos de entrenamiento (unas 4,9 horas).
- El entrenamiento usó datos de FLEURS (CC BY 4.0), OpenSLR 43 (CC BY-SA 4.0) e indic-audio, cuyo audio sintético está sujeto a los términos de los servicios que lo generaron; el autor recomienda revisarlos antes de un uso comercial.
- Los voicepacks incluidos derivan de grabaciones de OpenSLR 43 y se comparten bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual para esos ficheros concretos.
- La licencia Apache-2.0 de los pesos no exime de revisar las licencias de los datos de entrenamiento para uso comercial; la model card aclara que no constituye asesoramiento legal.
- Cobertura limitada de hindi e inglés (solo 1 hora de replay), por lo que la calidad en esos idiomas puede ser inferior a la de modelos dedicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nayanbastakoti/kokoro-ne
- Repositorio GitHub (código, uso y clonación de voz): https://github.com/Nayanbst/kokoro-ne
- Modelo base goonj-1-82M: https://huggingface.co/BH-Builds/goonj-1-82M
- Modelo original Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset indic-audio: https://huggingface.co/datasets/BH-Builds/indic-audio

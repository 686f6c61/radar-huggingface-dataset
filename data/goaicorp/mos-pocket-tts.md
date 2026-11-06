# goaicorp/mos-pocket-tts

## Resumen

mos-pocket-tts es un modelo de síntesis de voz (text-to-speech) desarrollado por goaicorp, un ajuste fino del modelo kyutai/pocket-tts sobre el idioma moore (mos), una lengua minoritaria hablada principalmente en Burkina Faso. El modelo resuelve un problema concreto: la práctica ausencia de sistemas TTS de calidad para lenguas de bajos recursos, donde los corpus grabados y los recursos fonéticos son escasos. Con 109.502.146 parámetros, se posiciona como un modelo compacto, pensado para despliegues ligeros y entornos con recursos limitados.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 0,4 GB, bajo licencia CC-BY-4.0 y acceso restringido (gated) en Hugging Face. El pipeline declarado es text-to-speech y el único idioma soportado es el moore. Su interés actual radica en la combinación de un modelo base pequeño y moderno (pocket-tts de Kyutai) con un ajuste específico para una lengua africana de bajos recursos, un caso de uso cada vez más relevante para la inclusión lingüística en sistemas de voz.

No se dispone de información publicada sobre la composición del corpus de ajuste, el número de horas de audio empleadas ni los resultados de evaluación. La ficha se limita, por tanto, a los datos verificables del repositorio y a las características inferibles del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kyutai/pocket-tts) |
| Parametros totales | 109.502.146 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | moore (mos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un ajuste fino (finetune) del modelo kyutai/pocket-tts, un TTS compacto desarrollado por Kyutai, y que el resultado conserva el tamaño del base con 109.502.146 parámetros. El repositorio ocupa 0,4 GB, coherente con pesos en safetensors de precisión estándar para ese número de parámetros.

No se han publicado datos sobre el corpus de entrenamiento: ni el número de horas de audio, ni la procedencia de las grabaciones, ni si se aplicaron técnicas de aumento de datos, normalización fonética o adaptación de vocabulario para el moore. Tampoco consta el uso de RLHF, DPO ni ninguna etapa de alineación posterior. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, vocoder concreto) sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz a partir de texto en moore (mos), el único idioma declarado en el repositorio.
- Clonación de voz, según la etiqueta `voice-cloning` del modelo.
- Generación de audio de habla con un modelo compacto de ~110 M de parámetros, apto para inferencia en entornos con recursos limitados.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo TTS, no un modelo de lenguaje general.
- No consta soporte multilingüe más allá del moore.
- No consta soporte de visión, audio de entrada ni modos de razonamiento extendido.

## Casos de uso

- Locución de contenidos educativos en moore: el modelo permite generar narraciones en audio para materiales escolares o programas de alfabetización, un ámbito donde la disponibilidad de voces grabadas es muy reducida.
- Accesibilidad para personas con discapacidad visual: conversión de textos escritos en moore a audio, facilitando el acceso a información administrativa, sanitaria o legal en la lengua local.
- Servicios de información pública por voz: mensajes pregrabados o dinámicos en moore para radios comunitarias, líneas telefónicas de consulta o altavoces en espacios públicos, aprovechando el tamaño reducido del modelo para despliegue en hardware modesto.
- Preservación y difusión lingüística: generación de material audio en moore para archivos lingüísticos, diccionarios hablados o aplicaciones de aprendizaje de la lengua, con la posibilidad de clonar voces de referencia.
- Integración en asistentes de voz locales: al ser un modelo de ~110 M de parámetros y 0,4 GB, puede ejecutarse en dispositivos con poca memoria o en servidores de bajo coste, sirviendo como capa de síntesis en asistentes de voz para comunidades moorehablantes.
- Prototipado de investigación en TTS de bajos recursos: sirve como punto de partida para experimentos de adaptación a otras lenguas minoritarias, dado su tamaño manejable y su licencia permisiva para uso académico y comercial con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 109,5 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,44 GB; en FP16, unos 0,22 GB; en cuantización de 8 bits, unos 0,11 GB. A ello hay que sumar el consumo del vocoder y de los buffers de audio, no documentados.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso con inferencia en CPU para cargas no masivas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM libre, aunque no hay cifras oficiales.
- Opciones de despliegue: no disponible. No consta soporte explícito de vLLM, llama.cpp, Ollama o TGI; al ser un modelo TTS, el despliegue habitual sería mediante la librería o el runtime del modelo base kyutai/pocket-tts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS comparables para el moore ni de resultados de evaluación del modelo base que permitan una comparación rigurosa. Se indica a continuación lo que se conoce de los modelos de referencia, sin datos de rendimiento:

| Modelo | Parametros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| goaicorp/mos-pocket-tts | 109.502.146 | moore (mos) | CC-BY-4.0 | no disponible | Ajuste fino de pocket-tts; acceso restringido |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas TTS multilingües (p. ej. XTTS, MMS-TTS) | no disponible | varias, sin moore confirmado | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar la integración en pipelines automatizados.
- Idioma único: solo se declara soporte de moore; no hay evidencia de que funcione correctamente en otras lenguas.
- Sin datos de evaluación: no se han publicado métricas de calidad (MOS, inteligibilidad, similitud de voz), por lo que el rendimiento real es desconocido.
- Riesgo de alucinación acústica y errores de pronunciación: en lenguas de bajos recursos, la cobertura fonética del corpus de entrenamiento suele ser limitada, lo que puede producir prosodia incorrecta o sonidos inexistentes en la lengua.
- Sesgos de voz: la clonación de voz puede reproducir sesgos de género, edad o procedencia de las grabaciones originales; no se documenta la composición del corpus.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del acceso gated y los términos del modelo base kyutai/pocket-tts, que pueden imponer restricciones adicionales.
- Modelo de 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de informes de uso en producción.
- Fecha de creación futura (2026-11-03) en los metadatos: conviene confirmar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/goaicorp/mos-pocket-tts
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

# Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_5719-step_2609600-ganji

## Resumen

El modelo `vits-hf_community_SadeghK_persian-text-to-speech_epoch_5719-step_2609600-ganji` es un checkpoint de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-vits`. Se trata de una conversión al formato ONNX pensada para su uso con la librería phoonnx, un runtime de inferencia de TTS derivado del ecosistema Piper. El nombre del checkpoint indica que proviene de un modelo comunitario de la organización SadeghK entrenado para persa (farsi), en la época 5719 y el paso 2609600 de entrenamiento, con el identificador de voz "ganji".

El modelo resuelve la conversión de texto a voz en persa, un idioma con relativamente poca cobertura en el ecosistema de TTS open source en comparación con inglés o español. Su relevancia radica en que ofrece un checkpoint entrenado y exportado a ONNX, lo que permite inferencia en CPU sin dependencias de frameworks de aprendizaje profundo pesados. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que es coherente con un modelo VITS de tamaño pequeño-medio.

La información disponible es muy limitada: la model card no describe la arquitectura con detalle, no aporta métricas de calidad, no especifica el dataset de entrenamiento ni los idiomas soportados de forma explícita (aunque el nombre indica persa). Esta ficha se limita a lo que puede verificarse en los metadatos y en la model card, e indica "no disponible" en todos aquellos campos que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end, segun el tag `vits`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto de texto) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; el repo no documenta cuantizaciones) |
| Idiomas soportados | persa (segun el nombre del checkpoint: `persian-text-to-speech`); no se documentan otros |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), segun el tag declarado en la model card. VITS es un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decoder basado en normalizing flows y un vocoder HiFi-GAN integrado, entrenado con una combinación de pérdidas adversarias y de verosimilitud. No se dispone de información sobre el número de parámetros, la configuración exacta del modelo ni la composición del dataset de entrenamiento.

El checkpoint corresponde a la época 5719 y al paso 2609600 de un entrenamiento del que no se documentan detalles: no se especifica el número de tokens de audio, la duración del corpus, el hablante o hablantes utilizados, ni si hubo etapas de ajuste fino o evaluación perceptual (MOS). El identificador "ganji" sugiere una voz o hablante concreto, pero no se aporta información adicional. El modelo se distribuye como una exportación ONNX dentro del repositorio agregador `Phoonnx/phoonnx-vits`, conservando las rutas de ficheros originales.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en persa.
- Generación de audio de un solo hablante, presumiblemente la voz "ganji" (no documentado).
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- No se documenta soporte de control de prosodia, emoción, velocidad o pitch más allá de lo que permita el runtime.
- No se documenta soporte de clonación de voz, multihablante ni cambio de idioma.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Lectura de contenido en persa: el modelo puede convertir artículos, noticias o documentación en audio para consumo pasivo, aprovechando que es un TTS end-to-end ligero (repo de 0,1 GB) apto para ejecución en CPU.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de lectura que necesiten una voz en persa con un runtime ONNX sin GPU.
- Asistentes de voz en persa: generación de respuestas habladas en sistemas de atención al cliente o asistentes conversacionales, siempre que se combine con un ASR y un LLM externos.
- Localización de contenido audiovisual: doblaje o generación de pistas de audio en persa para vídeos, cursos o presentaciones, sustituyendo la grabación humana en borradores.
- Pruebas de concepto y prototipado: al ser un checkpoint ONNX pequeño y con licencia MIT, es adecuado para validar pipelines de TTS en persa antes de invertir en modelos comerciales.
- Investigación en TTS de bajos recursos: punto de partida para fine-tuning o evaluación comparativa de voces en persa dentro de frameworks compatibles con VITS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que quepa en memoria de CPU sin GPU, pero el autor no documenta requisitos.
- GPU recomendadas: no disponible; por el tamaño del repositorio, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo, pero no está documentado.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx (https://github.com/TigreGotico/phoonnx). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Phoonnx / SadeghK) | VITS | Persa | MIT | ONNX | Hugging Face |
| Piper (rhasspy/piper) | VITS | Multiples | MIT | ONNX | GitHub / Hugging Face |
| Coqui TTS (XTTS) | VITS / autoregresivo | Multiples | MPL-2.0 / CPML | PyTorch | GitHub |
| Meta MMS-TTS | VITS | Multiples (incluye persa) | CC-BY-NC 4.0 | PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF) para este checkpoint, por lo que la comparación se limita a parámetros estructurales y licencia. Piper y Meta MMS-TTS son las alternativas más directas para TTS en persa; la primera comparte arquitectura y formato ONNX, la segunda cubre persa pero con licencia no comercial.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el hablante ni la calidad del audio resultante; no hay métricas de MOS ni evaluaciones subjetivas.
- Riesgo de alucinación acústica y artefactos propios de VITS en textos fuera de dominio o con caracteres no vistos durante el entrenamiento.
- Sesgos de hablante y de dominio desconocidos: al no documentarse el corpus, no puede evaluarse la representatividad de la voz "ganji".
- Cobertura limitada al persa; no se documentan otros idiomas ni variantes dialectales.
- La licencia MIT se hereda del repositorio fuente, pero la model card advierte que las licencias siguen a los originales por subcarpeta; conviene verificar la procedencia antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.
- El modelo se distribuye como subconjunto de un repositorio agregador; los ficheros conservan rutas del repo original, lo que puede complicar la integración directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_5719-step_2609600-ganji
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio fuente de la voz kasanoma (referenciado en la model card): https://github.com/michsethowusu/kasanoma

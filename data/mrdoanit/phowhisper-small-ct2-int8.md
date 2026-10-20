# mrdoanit/PhoWhisper-small-ct2-int8

## Resumen

PhoWhisper-small-ct2-int8 es una conversión a CTranslate2 del modelo de reconocimiento automático del habla vinai/PhoWhisper-small, desarrollado por VinAI Research para transcripción de vietnamita. La conversión la firma el usuario mrdoanit, que ha publicado los pesos en cuantización int8 (CTranslate2 4.8.2) para que funcionen directamente con faster-whisper, sin modificar los pesos originales más allá del proceso de conversión.

El modelo hereda la arquitectura Whisper small: un transformer encoder-decoder de aproximadamente 244 millones de parámetros que procesa audio en ventanas de 30 segundos y fue ajustado por VinAI sobre voz en vietnamita. Frente al checkpoint original en PyTorch, esta versión reduce el peso del repositorio a 0,2 GB y rebaja los requisitos de memoria, lo que permite ejecutar la inferencia en CPU con latencia contenida, un escenario habitual en productos de transcripción desplegados fuera de grandes clústeres de GPU.

Su relevancia es práctica: no aporta capacidades nuevas, sino un artefacto listo para producción en el ecosistema faster-whisper, con licencia BSD-3-Clause que permite uso comercial conservando el aviso de VinAI. El autor indica que se usa en "Giọng Việt" para releer sus propias locuciones, es decir, como componente de verificación dentro de un pipeline de voz. Con 13 descargas y ningún "like" en el momento de redactar esta ficha, se trata de un artefacto de terceros con validación comunitaria mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), con espectrograma log-Mel de entrada |
| Parametros totales | 244 M (heredados de Whisper small; no se explicita en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento y 448 tokens de texto (arquitectura Whisper); no se detalla en la model card |
| Tipos de cuantizacion | int8 (CTranslate2); es la unica variante publicada en este repositorio |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | CTranslate2 (`model.bin` + vocabulario/tokenizer); sin safetensors ni GGUF |
| Tamano del repositorio | 0,2 GB |
| Version de CTranslate2 usada | 4.8.2 |
| Modelo base | vinai/PhoWhisper-small |
| Descargas / likes | 13 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small: encoder y decoder transformer con atención completa, entrada de espectrograma log-Mel calculado sobre ventanas de 30 segundos y decodificación autorregresiva de tokens de texto. El modelo base PhoWhisper-small procede de un ajuste fino (fine-tuning) de Whisper small realizado por VinAI Research sobre datos de habla en vietnamita; la model card de esta conversión no especifica el volumen exacto del corpus, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en esta ficha.

La única intervención técnica documentada es la conversión con CTranslate2 4.8.2 aplicando `--quantization int8`. El autor afirma explícitamente que no se modificó ningún peso más allá de la conversión. El resultado es un grafo optimizado para inferencia con operadores cuantizados a 8 bits, lo que reduce el espacio en memoria y acelera la ejecución en CPU, a costa de una posible pérdida marginal de precisión frente a float16. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con salida de texto plano.
- Procesamiento por segmentos de 30 segundos, apto para audio largo si se trocea previamente.
- Generación de marcas de tiempo por segmento a través de faster-whisper.
- Detección de idioma heredada del tokenizador multilingüe de Whisper, aunque el ajuste fino está orientado a vietnamita.
- Traducción implícita al inglés descartada en la práctica: el ajuste fino de PhoWhisper prioriza transcripción en vietnamita y no se documenta calidad de traducción.
- Ejecución en CPU y GPU mediante CTranslate2, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente acústico-textual.
- No tiene capacidades de visión, audio generativo, TTS ni comprensión de texto libre.

## Casos de uso

- Transcripción de atención al cliente en vietnamita: el modelo convierte grabaciones de llamadas en texto para análisis de calidad; su ventana de 30 s encaja con el troceado habitual de centralitas telefónicas y el formato int8 permite ejecutarlo en servidores sin GPU.
- Generación de subtítulos para vídeo y pódcast: con faster-whisper se obtienen segmentos con timestamps que se exportan a SRT/VTT; el bajo consumo de memoria permite procesar lotes grandes en paralelo sobre CPU.
- Dictado y notas de reuniones: integrado en una aplicación de escritorio, transcribe en local sin enviar audio a la nube, algo relevante para datos personales.
- Verificación de pronunciación en herramientas de aprendizaje de idiomas: el autor lo emplea en Giọng Việt para "escuchar" sus propias locuciones sintetizadas y comprobar que el TTS produce vietnamita inteligible.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo histórico para construir un índice de texto consultable, aprovechando la cuantización int8 para reducir coste por hora de audio.
- Subtitulado accesible en administración pública o medios locales: al ser BSD-3-Clause, se puede desplegar en servicios comerciales o institucionales conservando el aviso de copyright.
- Prototipado rápido de pipelines de voz: al estar en formato CTranslate2, se carga con `faster-whisper` en pocas líneas y sirve como línea base antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con otros sistemas, y tampoco se documenta la degradación introducida por la cuantización int8 respecto al checkpoint original en float16 o float32.

## Requisitos de hardware

- Memoria para pesos: en torno a 0,25 GB en int8, coherente con un repositorio de 0,2 GB; el consumo total del proceso con faster-whisper suele quedar por debajo de 1 GB de RAM/VRAM.
- VRAM estimada para inferencia: menos de 1 GB, incluyendo buffers de activaciones para ventanas de 30 s.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más (GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090); A100 o H100 no aportan ventaja relevante por el reducido tamaño del modelo y quedarían infrautilizadas.
- Cabe holgadamente en GPU consumer e incluso en placas integradas con suficiente RAM; el caso de uso natural es CPU.
- Opciones de despliegue: faster-whisper (referencia directa), WhisperX y servidores propios basados en CTranslate2. No es compatible con llama.cpp ni Ollama, que no consumen el formato CT2, y no está pensado para vLLM ni TGI.
- Latencia y throughput: no disponibles. La cuantización int8 sobre CTranslate2 está diseñada para acelerar la inferencia en CPU, pero no se han publicado mediciones de RTF (factor de tiempo real) para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| mrdoanit/PhoWhisper-small-ct2-int8 | 244 M | 30 s | vi | BSD-3-Clause | CTranslate2 int8 |
| vinai/PhoWhisper-small | 244 M | 30 s | vi | BSD-3-Clause | PyTorch (safetensors/bin) |
| openai/whisper-small | 244 M | 30 s | multilingue (99 idiomas) | Apache-2.0 | PyTorch / CTranslate2 en conversiones de terceros |

Frente al checkpoint original de VinAI, esta versión no cambia la calidad teórica del modelo, pero elimina la dependencia de PyTorch y reduce el peso a una cuarta parte. Frente a whisper-small de OpenAI, PhoWhisper-small prioriza el rendimiento en vietnamita a costa de especializarse y perder cobertura multilingüe amplia; whisper-small conserva además la tarea de traducción a inglés. No se dispone de datos de WER comparativos en la información proporcionada para cuantificar esas diferencias.

## Limitaciones y advertencias

- Modelo monolingüe de facto: fuera del vietnamita la calidad cae de forma abrupta y no hay evaluación pública de code-switching vietnamita-inglés.
- Riesgo de alucinación documentado en la familia Whisper: en silencios, música o ruido persistente el modelo puede generar texto inventado o repetir frases; conviene aplicar detección de voz (VAD) antes de la transcripción.
- La cuantización int8 puede degradar ligeramente el WER respecto a float16; no hay mediciones publicadas que cuantifiquen esa pérdida en este artefacto.
- Modelo de 244 M: menor robustez ante acentos marcados, ruido de fondo, jerga o audio telefónico de baja calidad en comparación con variantes medium o large.
- Sin diarización de hablantes ni timestamps a nivel de palabra de forma nativa; requieren herramientas externas como WhisperX.
- No soporta streaming real: procesa ventanas de 30 s, lo que introduce latencia en casos de transcripción en vivo.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright de VinAI y el texto de la licencia; debe revisarse el fichero LICENSE del repositorio antes de distribuirlo.
- Artefacto de terceros con 13 descargas y ningún "like": no hay garantía de mantenimiento, y la fecha de creación registrada (2026-10-20) resulta anómala, por lo que conviene verificar la integridad de los ficheros antes de desplegarlos.
- Al no incluir pesos en float16, no es posible comparar directamente contra el original sin descargar el modelo base de VinAI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrdoanit/PhoWhisper-small-ct2-int8
- Modelo base: https://huggingface.co/vinai/PhoWhisper-small
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2 (herramienta de conversión): https://github.com/OpenNMT/CTranslate2
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.

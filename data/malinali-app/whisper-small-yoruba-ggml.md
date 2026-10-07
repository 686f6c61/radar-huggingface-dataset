# malinali-app/whisper-small-yoruba-ggml

## Resumen

whisper-small-yoruba-ggml es una conversion al formato GGML (cuantizacion q8_0) del modelo LyngualLabs/whisper-small-yoruba, un ajuste fino de openai/whisper-small especializado en reconocimiento automatico del habla (ASR) en yoruba. La conversión la publica el usuario malinali-app y esta pensada para su uso en dispositivos locales mediante whisper.cpp y el ecosistema Malinali, en lugar de depender de frameworks de inferencia pesados.

El modelo hereda la arquitectura encoder-decoder tipo Transformer de Whisper small, con aproximadamente 244 millones de parametros, y cubre exclusivamente la tarea de transcripcion (no la traduccion a ingles que otros modelos Whisper si ofrecen). Su relevancia radica en que empaqueta un modelo de ASR multilingue ajustado a un idioma de bajos recursos como el yoruba en un unico fichero binario de unos 0,3 GB, facil de desplegar en local.

Al estar cuantizado en q8_0, el modelo ocupa muy poco espacio y puede ejecutarse en CPU o en hardware modesto, lo que lo hace adecuado para aplicaciones moviles y de borde donde el yoruba es el idioma objetivo. Es un paquete recien publicado, sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), derivada de openai/whisper-small |
| Parametros totales | ~244 millones (correspondientes a Whisper small; no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por segmento (caracteristica estandar de Whisper small) |
| Tipos de cuantizacion | q8_0 (GGML); unico fichero `ggml-model-q8_0.bin` |
| Idiomas soportados | Yoruba (yo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (binario para whisper.cpp) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | openai/whisper-small, ajustado por LyngualLabs/whisper-small-yoruba |
| Tarea | Transcripcion (no traduccion a ingles) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small de OpenAI: un Transformer encoder-decoder entrenado para tareas de reconocimiento y traduccion de voz. El encoder procesa espectrogramas mel de audio en ventanas de 30 segundos y el decoder genera la secuencia de tokens de texto. Whisper small cuenta con 12 capas en el encoder y 12 en el decoder, con una dimension de modelo de 768 y 12 cabezas de atencion, lo que suma aproximadamente 244 millones de parametros.

El modelo original fue ajustado por LyngualLabs sobre Whisper small para especializarse en yoruba (LyngualLabs/whisper-small-yoruba). La model card de esta version no detalla el volumen de datos ni la composicion del conjunto de entrenamiento empleado en ese ajuste, ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. La aportacion de malinali-app consiste en la conversion de los pesos a GGML con cuantizacion q8_0 y su empaquetado como fichero unico para whisper.cpp.

No se documentan innovaciones tecnicas adicionales mas alla de la conversion y cuantizacion. Es importante senalar que este paquete esta orientado a transcripcion y no a la funcionalidad de traduccion al ingles que Whisper incorpora de serie; ademas, el microfono por defecto de Malinali utiliza Whisper tiny multilingue con `translate=true`, segun indica el autor.

## Capacidades

- Reconocimiento automatico del habla (ASR) en yoruba, con salida de texto transcrito.
- Transcripcion de audio en ventanas de 30 segundos, con manejo de audio mas largo mediante segmentacion.
- Ejecucion en local y en dispositivo (on-device) a traves de whisper.cpp, sin necesidad de servidores de inferencia.
- Funcionamiento en CPU y en hardware de gama baja gracias a la cuantizacion q8_0.
- No incluye traduccion a ingles (la tarea de translate de Whisper queda fuera del uso previsto).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning (no aplica a un modelo ASR).
- Capacidades multilingues limitadas al yoruba en este ajuste concreto.
- No se documentan capacidades de vision, audio generativo u otros modos adicionales.

## Casos de uso

- Transcripcion de reuniones y notas de voz en yoruba: el modelo convierte grabaciones de audio en texto plano ejecutandose en local, util para profesionales que trabajan con este idioma sin enviar datos a la nube.
- Subtitulado de contenido audiovisual en yoruba: se puede integrar en pipelines que segmentan el audio en bloques de hasta 30 segundos y generan subtitulos con marcas de tiempo.
- Aplicaciones moviles de accesibilidad: al ocupar pocos cientos de MB, cabe en telefonos y permite dictado o transcripcion en tiempo real sin conexion para hablantes de yoruba.
- Digitalizacion de archivos de audio historicos o etnograficos en yoruba: investigadores pueden transcribir corpus orales de forma masiva y offline con whisper.cpp.
- Asistentes de voz locales: combinado con un motor de TTS en yoruba, sirve como componente de entrada de voz en asistentes que deban operar sin red.
- Sistemas de transcripcion de atencion al cliente: permite generar registros escritos de llamadas en yoruba para su posterior analisis o cumplimiento normativo.
- Investigacion en ASR de bajos recursos: sirve como punto de partida o referencia en experimentos sobre reconocimiento de voz en idiomas con poca representacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete de conversion no incluye metricas de WER (word error rate) ni comparaciones cuantitativas, y tampoco se aportan datos del ajuste fino de LyngualLabs.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250-300 MB para los pesos q8_0, mas una sobrecarga de runtime que situa el consumo total en torno a 0,5-1 GB en funcion de la implementacion.
- GPU recomendadas: cualquier GPU, incluso integradas; no requiere aceleradores dedicados. GPU de gama alta (A100, H100) no aportan ventaja significativa para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso comparte VRAM con otras cargas.
- Ejecucion en CPU: totalmente viable; whisper.cpp esta optimizado para CPU y puede usar aceleracion SIMD (AVX, NEON) e incluso Metal en Apple Silicon.
- Opciones de despliegue: whisper.cpp, bindings de whisper.cpp (Python, Node, etc.) y el ecosistema Malinali. No esta pensado para vLLM, TGI u Ollama, ya que es un modelo ASR en formato GGML, no un LLM.
- Latencia y throughput: no disponible. Dependera del hardware, del backend y de la duracion del audio; no se aportan cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-small-yoruba-ggml (este) | ~244 M | Ventanas de 30 s | Yoruba | Apache 2.0 | GGML q8_0 | HuggingFace, 0 descargas |
| LyngualLabs/whisper-small-yoruba | ~244 M | Ventanas de 30 s | Yoruba | No disponible en la informacion | Safetensors (previsiblemente) | HuggingFace (origen del ajuste) |
| openai/whisper-small | ~244 M | Ventanas de 30 s | Multilingue (~99 idiomas) | Apache 2.0 | PyTorch / safetensors | HuggingFace |

La principal diferencia frente a openai/whisper-small es la especializacion en yoruba y el formato GGML optimizado para inferencia local. Frente al modelo de LyngualLabs, la unica diferencia es el empaquetado y la cuantizacion q8_0. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero los modelos ASR entrenados en idiomas de bajos recursos suelen mostrar peor rendimiento ante acentos, dialectos o ruido de fondo.
- Riesgo de alucinacion: Whisper tiende a generar texto plausible incluso en segmentos sin habla clara o con audio degradado; conviene validar las transcripciones en produccion.
- Limitaciones de idioma: el modelo esta ajustado exclusivamente para yoruba y no debe emplearse para otros idiomas ni como traductor a ingles.
- Limitaciones de contexto: el modelo procesa audio en ventanas de 30 segundos; audios mas largos requieren segmentacion externa, con el consiguiente riesgo de errores en los cortes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribucion a los autores originales (OpenAI, LyngualLabs y malinali-app como autor de la conversion).
- Madurez: el repositorio no tiene descargas ni valoraciones, por lo que no hay evidencia de comunidad ni de validacion independiente de la conversion.
- Cuantizacion q8_0: aunque q8_0 degrada poco la calidad respecto a los pesos originales, puede introducir pequenas diferencias de exactitud frente a la version sin cuantizar.
- No apto para traduccion: no ofrece la funcionalidad de traduccion a ingles de otros modelos Whisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-small-yoruba-ggml
- Modelo de origen (ajuste fino en yoruba): https://huggingface.co/LyngualLabs/whisper-small-yoruba
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp

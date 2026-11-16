# ggml-org/higgs-audio-v3-stt-GGUF

## Resumen

higgs-audio-v3-stt-GGUF es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) bosonai/higgs-audio-v3-stt, publicada por la organización ggml-org. El modelo original lo desarrolla Boson AI y está pensado para transcribir audio a texto dentro del ecosistema llama.cpp, lo que permite ejecutarlo en local con las herramientas habituales de este runtime (llama serve, llama.cpp, la app Llama) sin depender de infraestructura en la nube.

Se trata de un modelo de aproximadamente 2.030 millones de parámetros (2,03 B según los pesos en safetensors del modelo base), empaquetado en un repositorio de 9,5 GB que incluye varias cuantizaciones GGUF. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en que traslada un modelo ASR de Boson AI al ecosistema GGUF, con lo que se puede desplegar en CPU y GPU de consumo mediante llama.cpp, algo poco habitual en modelos de audio de este tamaño. La información publicada por el autor es, no obstante, muy escasa: no se detallan idiomas, arquitectura interna ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento del habla; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (el repo incluye varias cuantizaciones; no se detalla la lista exacta en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original bosonai/higgs-audio-v3-stt en la documentación proporcionada. Por el pipeline declarado (automatic-speech-recognition) y por el nombre del modelo, se trata de un sistema de conversión de voz a texto, presumiblemente con un codificador de audio seguido de un decodificador de texto, pero no se confirma la composición exacta ni si emplea técnicas como atención lineal o decodificación especulativa.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del corpus de audio, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. La model card del repositorio GGUF es mínima: solo indica que es una conversión automática realizada con la herramienta ggml-org/convert y remite al modelo base y al pull request de llama.cpp donde se añadió soporte. Cualquier dato sobre innovaciones técnicas del entrenamiento debe consultarse en la model card del modelo original de Boson AI, que no forma parte de la información disponible.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto, tarea principal del modelo.
- Ejecución local mediante llama.cpp y la app Llama, sin necesidad de servicios en la nube.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite servirlo a través de una API HTTP con llama serve.
- Uso conversacional declarado en los tags del repositorio (conversational), aunque no se detallan modos específicos de diálogo por voz.
- Soporte multilingüe: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades de visión o audio generativo: no disponible (solo ASR).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en texto ejecutándose en local con llama.cpp, lo que resulta adecuado para entornos con requisitos de privacidad donde el audio no debe salir de la infraestructura propia.
- Subtitulado de vídeo y podcasts: integrado en un pipeline de procesado por lotes, permite generar transcripciones de archivos largos sin coste por minuto de API, usando la CLI de llama.cpp o un script que invoque el servidor local.
- Dictado por voz en aplicaciones de escritorio: al ser un GGUF ligero (2,03 B de parámetros), puede empaquetarse junto a una aplicación de escritorio y ejecutarse en CPU o en una GPU de consumo, ofreciendo dictado sin conexión.
- Asistentes de voz para atención al cliente en local: desplegado con llama serve detrás de un servicio interno, permite transcribir llamadas o consultas de voz y encadenarlas con un LLM para generar respuestas, manteniendo los datos en el propio CPD.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos controlados, aprovechando el despliegue local y la licencia Apache 2.0 para integrarlo en productos sin restricciones de uso comercial.
- Investigación en ASR y ajuste fino: al ser una conversión GGUF de un modelo abierto con licencia permisiva, sirve como base para experimentar con cuantizaciones y comparar el rendimiento de la inferencia cuantizada frente al modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño (2,03 B de parámetros), las cuantizaciones de 4 bits ocuparían del orden de 1,3-1,5 GB de pesos, las de 8 bits alrededor de 2,2-2,5 GB y FP16 unos 4,1 GB; a ello hay que sumar el coste del codificador de audio y del contexto, no cuantificado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, debería caber en GPU de consumo con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) en cuantizaciones bajas; para el modelo en FP16 se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4-8 bits, aunque no hay confirmación oficial de requisitos mínimos.
- Opciones de despliegue: llama.cpp, llama serve, la app Llama (llama.app) y cualquier frontend compatible con GGUF. No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| higgs-audio-v3-stt-GGUF (este) | 2,03 B | no disponible | Apache 2.0 | GGUF | Conversion de bosonai/higgs-audio-v3-stt para llama.cpp |
| bosonai/higgs-audio-v3-stt | 2,03 B | no disponible | Apache 2.0 | safetensors | Modelo base original; mismo rendimiento esperado sin cuantizar |
| OpenAI Whisper (large-v3) | 1,55 B | 30 s de audio por ventana | MIT | safetensors, GGUF, otros | Referencia habitual en ASR; soporte amplio en llama.cpp y otras herramientas |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para establecer una comparacion cuantitativa |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este modelo con Whisper u otras alternativas; la comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- Información muy limitada: la model card no detalla idiomas, arquitectura, contexto ni rendimiento, por lo que no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Conversión automática: el repositorio indica que el modelo se ha convertido con la herramienta ggml-org/convert; pueden existir diferencias de precisión respecto al modelo original en safetensors, especialmente en cuantizaciones agresivas.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible que no corresponde al audio, sobre todo con ruido de fondo, acentos no representados en el entrenamiento o audio de baja calidad.
- Sesgos: no se documentan sesgos conocidos, pero al no especificarse la composición del corpus de entrenamiento no se puede descartar un sesgo hacia determinados idiomas, acentos o dominios.
- Limitaciones de idioma: no se indica qué idiomas soporta; no debe asumirse cobertura multilingüe sin verificación previa.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base y de las dependencias de llama.cpp.
- Producción: al no haber benchmarks publicados ni datos de latencia, se recomienda validar con un conjunto de evaluación propio antes de desplegarlo en un sistema en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/higgs-audio-v3-stt-GGUF
- Modelo base: https://huggingface.co/bosonai/higgs-audio-v3-stt
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32329
- Herramienta de conversión: https://github.com/ggml-org/convert
- App Llama: https://llama.app

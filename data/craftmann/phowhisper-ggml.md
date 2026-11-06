# craftmann/phowhisper-ggml

## Resumen

`craftmann/phowhisper-ggml` es un repositorio de Hugging Face publicado por el usuario craftmann que, por su denominación, apunta a una conversión al formato GGML de un modelo de la familia Whisper orientado a reconocimiento automático del habla (ASR), presumiblemente con algún matiz relativo a la fonética o a la transcripción fonémica ("pho" en el nombre). El repositorio tiene un tamaño de 0,5 GB, lo que es coherente con una variante cuantizada de un modelo Whisper de tamaño pequeño o base, no con los modelos large de la familia.

La información pública disponible es mínima: la ficha de Hugging Face no declara pipeline, licencia, idiomas ni tags técnicos más allá de `region:us`. No hay model card descriptiva, ni datos de entrenamiento, ni resultados de benchmarks publicados. El repositorio cuenta con 0 descargas y 1 like en el momento de la consulta, lo que sugiere un proyecto personal o experimental sin adopción comunitaria significativa.

Por todo ello, esta ficha debe leerse como una descripción estructural del repositorio y de lo que cabe esperar de un artefacto de este tipo, no como una evaluación de capacidades verificadas. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre y el tamaño, compatible con un transformer encoder-decoder estilo Whisper; sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s; sin confirmar para esta conversion) |
| Tipos de cuantizacion | no disponible (el sufijo `ggml` sugiere cuantizaciones del ecosistema GGML/GGUF, pero no se especifica el nivel) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGML (por el nombre del repositorio); no se confirma si es GGML legacy o GGUF |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el proceso de entrenamiento, el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino supervisado o RLHF. El nombre del repositorio sugiere que se trata de una conversion de pesos de un modelo Whisper (arquitectura transformer encoder-decoder con atención sobre espectrogramas Mel) a un formato GGML pensado para inferencia en CPU o en hardware modesto mediante herramientas del ecosistema `whisper.cpp` o similares.

Tampoco se documenta si la conversion altera la tokenizacion, si incluye vocabulario adicional para transcripcion fonetica o si se ha reentrenado parcialmente. Cualquier afirmacion al respecto seria especulativa y, por tanto, se omite.

## Capacidades

- Reconocimiento automatico del habla (ASR): es la capacidad esperable dado el nombre y el origen presumible en Whisper; no verificada en la informacion disponible.
- Transcripcion de audio a texto en formato GGML: compatible con runtimes de inferencia en CPU (por ejemplo, `whisper.cpp`) si la conversion sigue el esquema estandar.
- Posible orientacion fonetica o fonemica: el prefijo "pho" del nombre podria indicarlo, pero no hay documentacion que lo confirme.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking, vision o audio generativo: no disponible.

## Casos de uso

- Transcripcion local de reuniones y notas de voz: si el artefacto es una conversion GGML funcional de Whisper, podria ejecutarse en portatiles sin GPU para generar transcripciones de audio de hasta 30 s por ventana, con encadenamiento de ventanas para audios mas largos.
- Subtitulado offline en entornos sin conectividad: un modelo GGML de 0,5 GB es viable en dispositivos de borde o en estaciones de trabajo aisladas, lo que encaja con flujos de generacion de subtitulos sin dependencia de servicios en la nube.
- Prototipado de pipelines ASR en CPU: util para validar arquitecturas de transcripcion antes de invertir en infraestructura GPU, siempre que se verifique la calidad de la conversion.
- Investigacion en transcripcion fonetica: si el modelo incorpora salida fonemica, podria emplearse en estudios de fonetica computacional o en la construccion de corpus anotados; requiere validacion previa.
- Integracion en aplicaciones de escritorio con `whisper.cpp`: el formato GGML permite enlazar el modelo en aplicaciones nativas ligeras para dictado o busqueda por voz.
- Evaluacion comparativa de conversiones GGML: como artefacto de referencia para medir degradacion de calidad frente al modelo original en punto flotante, siempre que exista una version de referencia identificable.

En todos los casos, la idoneidad practica depende de verificaciones que no constan en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un artefacto GGML de 0,5 GB, la inferencia cabe holgadamente en memoria de sistema; en GPU, la huella seria inferior a 1 GB con cuantizaciones de 4-8 bits, aunque no se confirma el nivel de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) seria suficiente si el runtime soporta aceleracion; el caso de uso natural es CPU.
- Cabe en GPU consumer: si, con amplio margen, asumiendo que el artefacto es funcional.
- Opciones de despliegue: `whisper.cpp` es el runtime mas probable para GGML; tambien cabria `llama.cpp` si la conversion fuese GGUF, o herramientas propias del ecosistema GGML. No se documenta compatibilidad con vLLM ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles; dependerian del hardware, del tamano real del modelo y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| craftmann/phowhisper-ggml | no disponible | no disponible | no disponible | GGML | Hugging Face, 0 descargas |
| openai/whisper-small | ~244 M | ventanas de 30 s | MIT (segun publicacion original) | PyTorch, safetensors | Hugging Face, ampliamente adoptado |
| openai/whisper-base | ~74 M | ventanas de 30 s | MIT | PyTorch, safetensors | Hugging Face, ampliamente adoptado |
| ggerganov/whisper.cpp (conversiones) | variable | ventanas de 30 s | MIT (herramienta) | GGML/GGUF | GitHub, ecosistema consolidado |

La comparativa es estructural: no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, licencia, idiomas ni limitaciones, lo que impide un uso responsable en produccion sin verificacion previa.
- Licencia no declarada: no puede asumirse uso comercial permitido; la licencia del modelo original de Whisper no se hereda automaticamente por el hecho de ser una conversion.
- Riesgo de conversion defectuosa: las conversiones GGML no oficiales pueden introducir errores de tokenizacion, perdida de precision o incompatibilidades con el runtime; conviene validar contra el modelo original.
- Riesgo de alucinacion en ASR: los modelos tipo Whisper tienden a inventar texto en silencios o audio ruidoso; sin evaluacion publicada no puede acotarse este riesgo.
- Idiomas no declarados: no puede garantizarse cobertura multilingue ni calidad en castellano.
- Adopcion nula: 0 descargas y 1 like indican ausencia de validacion por parte de la comunidad; no hay issues, discusiones ni reportes de uso.
- Fecha de creacion futura en los metadatos (2026-11-05): inconsistencia que sugiere metadatos no fiables o generados automaticamente.
- Sin benchmarks: imposible comparar calidad con alternativas establecidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/craftmann/phowhisper-ggml
- Repositorio de referencia del ecosistema GGML para Whisper (no vinculado oficialmente al modelo): https://github.com/ggerganov/whisper.cpp
- Modelo original de referencia de la familia Whisper (no confirmado como base de esta conversion): https://huggingface.co/openai/whisper-small

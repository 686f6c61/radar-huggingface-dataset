# JoaoZaokk/whisper-podlodka-turbo-ggml

## Resumen

whisper-podlodka-turbo-ggml es una conversion a formato GGML del checkpoint Whisper `bond005/whisper-podlodka-turbo`, publicada por el usuario JoaoZaokk para su uso con el motor whisper.cpp. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de pesos: el autor toma el checkpoint original de bond005 y lo convierte con las herramientas propias del motor, generando variantes en f16 y en cuantizaciones q4_0, q5_0 y q8_0. El objetivo declarado es mantener estables los enlaces de descarga que consumen las aplicaciones nativas Odysseus y Open WebUI.

El modelo hereda el pipeline de reconocimiento automatico del habla (ASR) y esta etiquetado exclusivamente para ruso, con licencia Apache 2.0 sin cambios respecto al checkpoint de origen. Al estar en formato GGML, la inferencia puede ejecutarse en CPU, GPU o Apple Silicon sin necesidad de PyTorch, lo que reduce drasticamente los requisitos de despliegue y permite escenarios on-device.

Su relevancia actual es practica mas que cientifica: cubre el hueco de disponibilidad de un Whisper afinado para ruso en un formato consumible por whisper.cpp, algo que el checkpoint original en safetensors no ofrece directamente. El repositorio ocupa 3.5 GB y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y con poca validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); detalle exacto de capas no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | Ventana de audio de 30 segundos por pasada (convencion de la familia Whisper); contexto de texto no aplicable |
| Tipos de cuantizacion | f16, q4_0, q5_0, q8_0 |
| Idiomas soportados | Ruso (ru) segun metadatos; el autor indica verificacion con muestras en portugues e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML / GGUF (ficheros `.bin` para whisper.cpp) |
| Tamano de los ficheros | f16: 1625 MB; q8_0: 874 MB; q5_0: 574 MB; q4_0: 474 MB |
| Modelo base | bond005/whisper-podlodka-turbo |
| Libreria | whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un Whisper checkpoint, es decir, un transformer encoder-decoder disenado para transcripcion y traduccion de voz, que procesa audio en ventanas de 30 segundos. El repositorio no documenta el numero de capas, dimensiones ocultas ni el total de parametros de la variante turbo empleada, por lo que esos datos quedan como no disponibles. Tampoco se detalla el proceso de entrenamiento del checkpoint original (composicion del dataset, horas de audio, uso de RLHF o ajuste fino supervisado): esa informacion corresponderia a la model card de `bond005/whisper-podlodka-turbo`, no a este repositorio.

La unica innovacion tecnica atribuible a esta publicacion es el proceso de conversion y cuantizacion. Segun el autor, los pesos se convirtieron con el convertidor propio de whisper.cpp y despues se cuantizaron con su cuantizador; cada variante se comprobo transcribiendo muestras breves en portugues e ingles antes de subirlas. No hay decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas: es un reempaquetado fiel del checkpoint, con la consiguiente perdida de precision asociada a cada nivel de cuantizacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en ruso, con salida de texto plano o con marcas de tiempo segun el motor.
- Transcripcion de audio en ventanas de 30 segundos, con capacidad de procesar ficheros mas largos mediante segmentacion en el propio whisper.cpp.
- Ejecucion on-device: no requiere Python, PyTorch ni acceso a red durante la inferencia.
- Cuatro niveles de compromiso tamano/precision para adaptarse a distintos presupuestos de memoria.
- Integracion directa con `whisper-cli` y con cualquier aplicacion que embeba whisper.cpp, incluidas las apps nativas Odysseus y Open WebUI mencionadas por el autor.
- Soporte de idiomas adicionales: no confirmado. El autor solo menciona pruebas puntuales en portugues e ingles, mientras que los metadatos declaran unicamente ruso.
- Tool calling, function calling, agentes, vision, audio generativo o modo de razonamiento: no disponibles. Es un modelo exclusivamente de transcripcion de voz.

## Casos de uso

- Transcripcion de podcasts en ruso: el modelo deriva de un checkpoint entrenado especificamente para habla tipo podcast (`podlodka`), por lo que es adecuado para convertir episodios largos en texto indexable, segmentando el audio en bloques de 30 segundos con whisper.cpp.
- Subtitulado automatico de video en ruso: la salida con marcas de tiempo de whisper.cpp se puede formatear directamente a SRT o VTT para plataformas de video internas o canales corporativos.
- Atencion al cliente por voz en ruso: integrado en un pipeline de telefonia o VoIP, el modelo transcribe la llamada en local y alimenta un sistema posterior de analitica o busqueda, evitando enviar audio a servicios en la nube.
- Notas de reunion y actas automaticas: con la variante q8_0 o f16 en una estacion de trabajo con GPU, se transcriben reuniones en ruso en tiempo casi real y se pasan a un resumidor de texto.
- Herramientas de accesibilidad: la variante q4_0 de 474 MB cabe en dispositivos moviles o Raspberry Pi y permite subtitulado en vivo sin conexion para personas con discapacidad auditiva.
- Investigacion en linguistica y creacion de corpus: transcripcion por lotes de archivos de audio rusos para construir datasets etiquetados, con la variante f16 como referencia de maxima fidelidad.
- Aplicaciones de campo sin conectividad: periodismo, trabajo humanitario o auditoria en zonas con red limitada, donde el despliegue en portatil con CPU es viable gracias al formato GGML.
- Preprocesado de voz para pipelines de datos: convertir audio a texto antes de alimentar sistemas RAG o motores de busqueda, manteniendo todo el proceso en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER, comparativas con otros Whisper ni metricas de latencia; el autor unicamente menciona comprobaciones cualitativas mediante transcripcion de muestras cortas en portugues e ingles.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno al tamano del fichero mas el overhead del motor. Aproximadamente 0,6-0,9 GB para q4_0, 0,8-1,1 GB para q5_0, 1,1-1,5 GB para q8_0 y 1,9-2,3 GB para f16.
- GPU de consumo: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuatro variantes; una RTX 3060, RTX 4060 o superior es mas que suficiente. La variante f16 tambien cabe en GPUs de 2-3 GB con margen ajustado.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para este modelo; solo tendrian sentido para servir muchas peticiones concurrentes con vLLM-like batching, que whisper.cpp no implementa de forma estandar.
- CPU y Apple Silicon: todas las variantes estan pensadas para funcionar en CPU. q4_0 (474 MB) y q5_0 (574 MB) son viables en moviles, Raspberry Pi 4/5 y portatiles modestos; q8_0 es la opcion equilibrada; f16 es la referencia de maxima fidelidad.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli -m <fichero>`, bindings de whisper.cpp para Python, Node u otras plataformas, y aplicaciones que embeban el motor (Odysseus, Open WebUI). No hay soporte documentado para vLLM, TGI, Ollama o llama.cpp, ya que estos se orientan a modelos de lenguaje, no a ASR.
- Latencia y throughput: no disponibles. Dependen del hardware y del nivel de cuantizacion; como referencia general de la familia Whisper, las variantes cuantizadas son mas rapidas que f16 a costa de algo de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| JoaoZaokk/whisper-podlodka-turbo-ggml | no disponible | Ventana de audio de 30 s | ru (declarado) | Apache 2.0 | GGML/GGUF | HuggingFace, 0 descargas |
| bond005/whisper-podlodka-turbo (modelo base) | no disponible | Ventana de audio de 30 s | ru | Apache 2.0 | Safetensors (checkpoint original) | HuggingFace |
| Whisper large-v3-turbo (OpenAI) | no disponible en la informacion proporcionada | Ventana de audio de 30 s | Multilingue | MIT (familia Whisper) | Safetensors, GGML via terceros | Ampliamente distribuido |
| whisper.cpp con modelos base oficiales | Variable segun variante | Ventana de audio de 30 s | Multilingue | MIT | GGML/GGUF | Repositorio del motor |

No se dispone de datos de rendimiento (WER) para ninguna de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato, licencia e idioma. La ventaja diferencial de este repositorio frente al checkpoint base es el formato GGML listo para whisper.cpp; su desventaja es la ausencia de evaluacion publicada y la falta de adopcion (0 descargas).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos del checkpoint original ni de esta conversion.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con ruido, silencio o musica; en produccion conviene aplicar umbrales de confianza y deteccion de repeticiones.
- Limitacion de idioma: los metadatos declaran unicamente ruso. El propio autor menciona pruebas en portugues e ingles, lo que introduce ambiguedad sobre el alcance real multilingue; no debe asumirse buen rendimiento fuera del ruso sin evaluacion previa.
- Perdida por cuantizacion: las variantes q4_0 y q5_0 reducen el tamano de forma agresiva y pueden degradar la precision en audio con acentos marcados, ruido de fondo o terminologia tecnica. El autor recomienda q8_0 como casi identica en precision al f16.
- Licencia: Apache 2.0 permite uso comercial, pero se trata de una obra derivada; la atribucion a los autores originales (bond005) es exigible y el repositorio no ofrece ninguna garantia ("No warranty").
- Trazabilidad: el autor no documenta la version exacta del conversor ni del cuantizador de whisper.cpp utilizada, lo que dificulta reproducir la conversion bit a bit.
- Fiabilidad del artefacto: con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion por terceros. Conviene verificar el WER en un conjunto de prueba propio antes de desplegarlo.
- Requisitos de audio: al igual que toda la familia Whisper, asume ventanas de 30 segundos; audio de mayor duracion debe segmentarse externamente y puede perder coherencia entre segmentos.
- Metadatos incompletos: no se especifican parametros, capas ni detalles del entrenamiento original, lo que limita el analisis tecnico y la comparacion cuantitativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-podlodka-turbo-ggml
- Modelo base: https://huggingface.co/bond005/whisper-podlodka-turbo
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Motor whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Resultados de la busqueda web: no relevantes. Las referencias devueltas corresponden a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, microsoft.com/microsoft-365, en.wikipedia.org/wiki/Microsoft) y no guardan relacion con el modelo ni aportan informacion tecnica utilizable.

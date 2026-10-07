# mradermacher/granite-speech-3.3-8b-GGUF

## Resumen

mradermacher/granite-speech-3.3-8b-GGUF es un repositorio de cuantizaciones GGUF del modelo ibm-granite/granite-speech-3.3-8b de IBM, publicado por el usuario mradermacher. No es un modelo nuevo: es una conversión de los pesos originales a formatos GGUF de 2 a 16 bits, pensada para ejecutar el modelo en llama.cpp y herramientas compatibles sin necesidad de hardware de datacenter.

El modelo base es multimodal de voz y texto. Junto a los ficheros de pesos principales, el repositorio incluye dos suplementos mmproj (Q8_0 y f16) que contienen el codificador y el proyector multimodal necesarios para procesar entrada de audio. El backbone declara 8.170.868.736 parámetros (unos 8,17 mil millones), licencia Apache-2.0 y cobertura multilingüe con inglés, francés, alemán, español y portugués, lo que lo sitúa en la categoría de modelos de voz-lenguaje de tamano medio.

Su relevancia practica esta en el despliegue local: el quant Q4_K_M ocupa 5,0 GB y el mmproj-f16 1,3 GB, de modo que el conjunto completo cabe en GPUs de consumo con 8-12 GB de VRAM y permite transcripcion, traduccion de voz y asistentes conversacionales por audio en entornos on-premise, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo multimodal audio-texto; el repositorio incluye ficheros mmproj para el codificador/proyector multimodal) |
| Parametros totales | 8.170.868.736 (~8,17 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16. Existe ademas un repositorio aparte con quants ponderados i1 (imatrix): mradermacher/granite-speech-3.3-8b-i1-GGUF |
| Idiomas soportados | multilingual, en, fr, de, es, pt (segun la model card); la cobertura real por idioma en tareas de voz no se detalla |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de solo cuantizaciones; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Los metadatos de la cuantizacion indican que se trata de quants estaticos (quantize_version 2, output_tensor_quantised 1, convert_type hf) generados a partir de los pesos originales en formato Hugging Face. La presencia de dos ficheros mmproj (uno en Q8_0 y otro en f16) confirma una topologia multimodal con un modulo de proyeccion separado del backbone de lenguaje, que es el componente que consume la senal de audio y la inyecta en el modelo de texto. No se dispone de informacion sobre el numero de capas, dimension oculta, mecanismo de atencion ni sobre el tipo de codificador de audio empleado.

Tampoco hay datos en la informacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de optimizacion como decodificacion especulativa o atencion lineal. Todo lo relativo al proceso de entrenamiento del modelo base debe consultarse en la model card oficial de ibm-granite/granite-speech-3.3-8b.

## Capacidades

- Procesamiento de entrada de audio: el repositorio incluye los proyectores multimodales (mmproj) necesarios para alimentar audio al modelo, lo que habilita tareas de reconocimiento de voz y comprension de audio.
- Generacion de texto conversacional: la etiqueta "conversational" aparece explicitamente en los metadatos del repositorio.
- Soporte multilingue declarado en ingles, frances, aleman, espanol y portugues, ademas de la etiqueta generica "multilingual".
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere despliegue detras de APIs con formato compatible con el esquema de OpenAI.
- Ejecucion local eficiente: al estar en GGUF, el modelo se puede servir en CPU, GPU o configuracion hibrida con llama.cpp y derivados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, modo thinking, audio de salida (TTS) o cualquier otra capacidad especial: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de audio on-premise: desplegando el modelo con llama.cpp y el fichero mmproj correspondiente se puede transcribir audio sin enviar datos a terceros, algo critico en sectores regulados (sanidad, legal, administracion publica).
- Traduccion de voz entre los cinco idiomas declarados (en, fr, de, es, pt): util para reuniones multilingues donde se necesita pasar de audio en un idioma a texto en otro manteniendo el flujo en local.
- Subtitulado de contenido audiovisual: generacion de subtitulos a partir de pistas de audio en pipelines de postproduccion, con la ventaja de no depender de una API externa por minuto procesado.
- Asistentes de voz embebidos: integracion en aplicaciones de escritorio o dispositivos con GPU de gama media (por ejemplo, un quant Q4_K_M de 5,0 GB) para dar entrada de voz a un asistente conversacional.
- Analisis de llamadas de atencion al cliente: transcripcion y resumen posterior de grabaciones para control de calidad, siempre que se cumplan los requisitos legales de tratamiento de datos.
- Dictado y toma de notas en investigacion: captura de entrevistas o sesiones de laboratorio en texto, ejecutada en la propia estacion de trabajo para preservar la confidencialidad de los participantes.
- Evaluacion y prototipado de modelos de voz-lenguaje: el formato GGUF permite comparar rapidamente distintos niveles de cuantizacion (Q4_K_M frente a Q8_0) antes de decidir el despliegue definitivo con los pesos originales en safetensors.
- Servicio interno con API compatible: al estar etiquetado como "endpoints_compatible", se puede exponer el modelo como endpoint interno para que otras aplicaciones del equipo consuman transcripcion o dialogo por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de reconocimiento de voz (WER) para ninguna de las cuantizaciones ofrecidas. La unica referencia de calidad aportada por el autor es un grafico externo comparativo de perplejidad entre tipos de quant de baja calidad y una nota cualitativa en la tabla de ficheros ("lower quality" para Q3_K_M, "very good quality" para Q6_K, "fast, best quality" para Q8_0).

## Requisitos de hardware

- VRAM estimada segun el tamano de los ficheros, anadiendo margen para cache KV y activaciones del codificador de audio:
  - Q2_K (3,2 GB): aproximadamente 4-5 GB de VRAM.
  - Q4_K_S (4,8 GB) y Q4_K_M (5,0 GB): aproximadamente 6-7 GB de VRAM, mas 1,3 GB si se usa el mmproj f16 (o 0,9 GB con el mmproj Q8_0).
  - Q6_K (6,8 GB): aproximadamente 8-9 GB de VRAM.
  - Q8_0 (8,8 GB): aproximadamente 10-11 GB de VRAM.
  - f16 (16,4 GB): aproximadamente 18-20 GB de VRAM; el propio autor lo describe como "overkill".
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para los quants Q4 y Q5 con mmproj; RTX 4090, L40S, A100 o H100 para Q8_0 y f16. Los quants Q2_K y Q3_K pueden ejecutarse en GPUs de 6-8 GB o incluso en CPU con suficiente RAM del sistema.
- Cabe en GPU de consumo: si, en todos los niveles de cuantizacion salvo f16 en tarjetas de menos de 16 GB. El quant Q4_K_M es el punto de equilibrio recomendado por el autor para velocidad y calidad.
- Opciones de despliegue: llama.cpp (servidor y CLI), llama-cpp-python, Ollama, LM Studio y cualquier runtime que soporte GGUF con proyectores multimodales. Para servir el modelo con vLLM, TGI o transformers habria que partir del modelo base en safetensors, ya que estas herramientas no consumen este repositorio GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del quant elegido, de si el audio se procesa en GPU o CPU y de la longitud del audio de entrada.

## Comparativa con modelos similares

No se ha proporcionado informacion de benchmarks ni de rendimiento que permita una comparacion rigurosa. La tabla siguiente recoge unicamente rasgos generales de categoria; los datos de los modelos alternativos no provienen de la informacion facilitada y deben verificarse en sus fichas oficiales.

| Modelo | Categoria | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| granite-speech-3.3-8b (GGUF de mradermacher) | Voz-lenguaje, multimodal audio-texto | 8,17 mil millones | no disponible | Apache-2.0 |
| whisper-large-v3 (OpenAI) | ASR encoder-decoder, sin LLM generativo | ~1,55 mil millones | no disponible (ventanas de 30 s) | MIT |
| Qwen2-Audio-7B-Instruct (Alibaba) | Voz-lenguaje, multimodal audio-texto | ~8 mil millones | no disponible | Apache-2.0 |

Diferencias relevantes de categoria: los modelos puramente ASR como Whisper no mantienen dialogo ni generan respuestas razonadas, mientras que los modelos de voz-lenguaje como el de IBM o Qwen2-Audio pueden encadenar transcripcion y generacion en una sola pasada. El repositorio aqui descrito anade a esa categoria la ventaja del formato GGUF, que no esta disponible de forma oficial para la mayoria de alternativas.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay WER, MMLU ni ninguna otra metrica publicada en el repositorio, ni para el modelo base ni para las cuantizaciones. Cualquier decision de produccion deberia ir precedida de una evaluacion propia con datos representativos.
- Degradacion por cuantizacion: los quants por debajo de Q4 (Q2_K, Q3_K) pierden calidad de forma apreciable. El propio autor marca Q3_K_M como "lower quality". Para tareas de reconocimiento de voz, donde los errores se acumulan, se recomienda Q5_K_M o superior.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible que no corresponde al audio de entrada, especialmente en segmentos con ruido, silencios largos o audio musical. No se documentan mecanismos de mitigacion.
- Cobertura idiomatica no verificada: la model card declara cinco idiomas, pero no se detalla el rendimiento por idioma. El espanol esta listado, aunque sin metricas que confirmen su calidad frente al ingles.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo, y los modelos de voz son especialmente sensibles a la variacion de acento, edad y genero del hablante.
- Trazabilidad: la cuantizacion la realiza un tercero (mradermacher) sobre el modelo de IBM. No hay validacion oficial del fabricante sobre estos ficheros, y la adopcion comunitaria es baja (153 descargas y 1 "like" en el momento de los datos facilitados).
- Soporte del ecosistema: el uso de audio con GGUF depende del soporte de proyectores multimodales en llama.cpp y en las herramientas derivadas; la compatibilidad puede variar entre versiones.
- Aspectos legales y de privacidad: la licencia Apache-2.0 del repositorio permite uso comercial, pero el tratamiento de audio con voz humana implica datos personales. En el Espacio Economico Europeo es necesario un analisis de base juridica y minimizacion conforme al RGPD antes de desplegarlo sobre conversaciones reales.
- Idiomas no listados (por ejemplo, catalan, gallego, euskera o italiano): no hay evidencia de soporte y no deberia asumirse su funcionamiento.
- El repositorio ocupa 74,3 GB en total, por lo que la descarga completa de todas las cuantizaciones requiere espacio en disco considerable; conviene descargar solo el quant necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/granite-speech-3.3-8b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- Quants ponderados (imatrix) del mismo modelo: https://huggingface.co/mradermacher/granite-speech-3.3-8b-i1-GGUF
- Pagina resumen del autor con listado de descargas: https://hf.tst.eu/model#granite-speech-3.3-8b-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden al musical "Six"), por lo que no se han incluido como fuentes.

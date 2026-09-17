# algerian-nlp/Hadra-ASR-whisper-medium

## Resumen

Hadra-ASR-whisper-medium es un adaptador de reconocimiento automatico del habla (ASR) para darija argelina, publicado por el colectivo algerian-nlp. No es un modelo completo: se trata de un adaptador QLoRA de rango 64 entrenado sobre el modelo base `openai/whisper-medium`, que permanece congelado. El adaptador anade 69.206.016 parametros entrenables sobre los 763.857.920 parametros del base, lo que da un total de 833.063.936 parametros, y se distribuye en formato safetensors dentro de un repositorio de 0,3 GB.

El problema que resuelve es concreto: el reconocimiento de voz en dialecto argelino, un dominio poco cubierto por los modelos ASR multilingues. La model card reporta tasas de error de palabra (WER) del 0,68 %, 0,34 % y 0,95 % en tres particiones de test de las colecciones OddAdmix, declaradas por el autor en una unica ejecucion y bajo un normalizador especifico de darija. Frente al adaptador hermano sobre Whisper small, la mejora declarada es de aproximadamente 50x, una cifra que el propio autor califica de extraordinaria y pendiente de reproduccion independiente.

Es relevante ahora porque la licencia MIT y su tamano reducido permiten desplegarlo en hardware de consumo para transcripcion de podcasts, videos y entrevistas en darija, ademas de servir como punto de partida para ajuste fino en otras tareas de voz en arabe argelino. Como contrapartida, la model card documenta un defecto conocido en `tokenizer_config.json` que rompe `WhisperProcessor.from_pretrained` en transformers 4.57.6, y no existen benchmarks ancla aplicables (DziriEval y MADAR son suites de texto, no de voz).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) con adaptadores LoRA/QLoRA de rango 64 |
| Parametros totales | 833.063.936 (763.857.920 del base congelado + 69.206.016 entrenables del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 s de audio por ventana de entrada (`chunk_length_s=30`); maximo de 448 tokens en el decodificador, heredado de whisper-medium |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el entrenamiento uso QLoRA, pero no se documentan pesos cuantizados para inferencia) |
| Idiomas soportados | arabe argelino (darija, codigo `arq`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT sobre `openai/whisper-medium`) |
| Libreria de carga | peft (+ transformers, torch, librosa) |
| Rango LoRA | 64 |
| Tamano del repositorio | 0,3 GB |
| Modelo base | openai/whisper-medium |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del sistema es la de Whisper medium: un transformer encoder-decoder con entrada de espectrograma mel de 80 canales, ventanas de 30 segundos y decodificacion autorregresiva. Sobre ese base congelado se insertan adaptadores LoRA de rango 64, con 69.206.016 parametros entrenables (aproximadamente el 9,1 % del total del base) entrenados mediante QLoRA. No se modifica ningun peso del modelo base, por lo que el adaptador puede cargarse y descargarse sobre la misma instancia de Whisper medium.

El entrenamiento siguio un curriculo de tres fases sobre tres colecciones de audio argelino de OddAdmix: Kahwa podcast (23.264 filas de train declaradas), Loubna stories (48.590) y Rawi stories (5.296), con un total acumulado de 31.661 pasos. La model card no detalla la composicion exacta de mezclas por fase, la duracion total de audio ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. Tampoco se documenta la particion de test de las colecciones: el autor indica que el numero de filas de test no esta medido y que las particiones de evaluacion no estan documentadas.

La innovacion practica no esta en la arquitectura, sino en el procedimiento de evaluacion: las WER declaradas se calculan tras aplicar un normalizador de darija que elimina diacriticos y tatweel, normaliza alef y yaa y elimina puntuacion. El autor advierte explicitamente que comparar estas cifras con WER calculadas sobre texto sin normalizar no es valido.

## Capacidades

- Transcripcion de voz a texto en darija argelina, con el decodificador forzado a arabe (`language="arabic"`, `task="transcribe"`).
- Procesamiento de audio largo mediante troceado en ventanas de 30 segundos (`chunk_length_s=30`), lo que permite transcribir podcasts, entrevistas y videos de duracion arbitraria.
- Extraccion de caracteristicas compatible con `WhisperFeatureExtractor` (muestreo a 16 kHz, salida de forma `[1, 80, 3000]` por segundo de audio).
- Punto de partida para ajuste fino en otras tareas de voz en arabe argelino, al estar empaquetado como adaptador PEFT independiente.
- Generacion de subtitulos para contenido audiovisual en darija.
- No soporta tool calling ni function calling: es un modelo ASR, no un modelo de lenguaje instructivo.
- No soporta razonamiento multi-paso ni flujos de agente.
- No soporta texto a voz ni generacion de audio de ningun tipo.
- No soporta traduccion entre idiomas (la tarea esta fijada a transcripcion).
- No cubre idiomas ni dialectos distintos del darija argelino.
- No debe usarse para tomar decisiones sobre personas, segun la propia model card.

## Casos de uso

- Transcripcion de podcasts en darija: el modelo convierte episodios completos en texto encadenando ventanas de 30 segundos con `chunk_length_s=30`. Las WER declaradas de 0,34 % a 0,95 % en las tres colecciones OddAdmix lo hacen adecuado para publicar transcripciones con revision minima en ese dominio.
- Subtitulado automatico de video en YouTube: el pipeline de transformers con PEFT genera segmentos de texto alineados con el audio, que se pueden exportar a SRT o VTT. El tamano del adaptador (0,3 GB) permite ejecutarlo en una maquina de edicion sin GPU dedicada grande.
- Archivado y busqueda de contenido oral: transcripcion masiva de entrevistas y programas para indexarlos y hacerlos buscables. El modelo esta entrenado especificamente sobre material de podcast y narracion, que es el registro dominante en estos archivos.
- Entrada de voz para asistentes: transcripcion en tiempo real de comandos hablados en darija, alimentando un modulo de comprension posterior. El modelo es solo el componente ASR; requiere un NLU externo.
- Investigacion en variedades del arabe: servir de linea base dialectal en estudios comparativos de ASR en darija, con la advertencia de que las cifras son de una unica ejecucion.
- Punto de partida para ajuste fino: las organizaciones con audio propio en darija pueden entrenar un adaptador adicional o continuar el existente, sin tocar los pesos de Whisper medium.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido hablado en darija.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el `model-index`. Se trata de WER calculado tras aplicar el normalizador de darija (diacriticos y tatweel eliminados, alef y yaa normalizados, puntuacion eliminada), en una unica ejecucion y sin semillas medidas (`verified: false` en los tres casos).

| Sistema | Kahwa podcast | Loubna stories | Rawi stories |
|---|---|---|---|
| Hadra-ASR-whisper-medium + LoRA | 0,68 % | 0,34 % | 0,95 % |
| Hadra-ASR-whisper-small (linea base) | 34,85 % | 14,87 % | 27,54 % |

Ambas filas proceden de una unica medicion por sistema; la linea base es `algerian-nlp/Hadra-ASR-whisper-small`, puntuada en el mismo arnes y con el mismo normalizador, pero no re-ejecutada para esta publicacion y con ajustes de decodificacion y numero de filas de test no documentados.

No hay benchmarks ancla disponibles: las suites de referencia del colectivo (DziriEval y MADAR) son de texto y no cubren reconocimiento de voz, por lo que no existe puntuacion ancla aplicable a este modelo. El autor indica que la mejora de aproximadamente 50x respecto al adaptador small es extraordinaria y requiere reproduccion independiente antes de citarse como hecho.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Whisper medium ocupa alrededor de 1,5 GB en fp16 y unos 3 GB en fp32. Sumando el adaptador de 69 millones de parametros, el presupuesto total queda en torno a 1,6 GB en fp16, sin contar activaciones ni el coste de atencion sobre ventanas de 30 segundos.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060) puede ejecutarlo en fp16. El ejemplo de la model card selecciona `torch.float16` si hay CUDA disponible.
- Inferencia en CPU viable: al ser un modelo de 763 millones de parametros, la transcripcion en CPU es lenta pero funcional; el pipeline de ejemplo cae a `torch.float32` cuando no hay GPU.
- GPU profesionales: A100, H100 o L4 no son necesarias para este tamano; solo tendrian sentido para procesar grandes volumenes en paralelo o para reentrenar el adaptador.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada y verificada. La model card advierte de un defecto en el repositorio que rompe `WhisperProcessor.from_pretrained(REPO)` y, por tanto, el uso directo de `pipeline(...)` en transformers 4.57.6 (`AttributeError: 'list' object has no attribute 'keys'`, por `extra_special_tokens` almacenado como lista en lugar de como mapping). El extractor de caracteristicas y los pesos no se ven afectados. La ultima version de transformers que funciona no esta medida: hay que fijar la version verificada antes de reportar cifras.
- Integracion con vLLM, TGI, llama.cpp u Ollama: no documentada para este adaptador. Cualquier conversion a CTranslate2 o faster-whisper exigiria fusionar previamente el adaptador con el base, paso que la model card no describe.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real, RTF ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarada en darija | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hadra-ASR-whisper-medium | 833 M totales (69 M entrenables) | 30 s por ventana | 0,68 % / 0,34 % / 0,95 % (OddAdmix, unica ejecucion) | MIT | HuggingFace, adaptador PEFT |
| Hadra-ASR-whisper-small | no disponible en la informacion proporcionada | 30 s por ventana | 34,85 % / 14,87 % / 27,54 % | no disponible en la informacion proporcionada | HuggingFace (referenciado como linea base) |
| openai/whisper-medium (base) | 763.857.920 | 30 s por ventana | no disponible para darija en la informacion proporcionada | MIT (modelo original de OpenAI) | HuggingFace, safetensors |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | 30 s por ventana | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

Las dos unicas cifras comparables directamente son las de las dos filas de Hadra, y ambas proceden de una unica ejecucion cada una bajo el mismo normalizador. La comparacion con Whisper medium sin ajustar en darija no esta publicada en la informacion disponible.

## Limitaciones y advertencias

- Defecto conocido y reproducible: `WhisperProcessor.from_pretrained(REPO)` falla en transformers 4.57.6 porque `tokenizer_config.json` almacena `extra_special_tokens` como lista en lugar de mapping. Afecta al uso directo del `pipeline` de ASR; no afecta al extractor de caracteristicas ni a los pesos. La ultima version de transformers funcional no esta medida.
- Las WER declaradas proceden de una sola ejecucion por sistema, sin semillas medidas, y estan marcadas como no verificadas. No existe todavia reproduccion independiente.
- La mejora de aproximadamente 50x sobre el adaptador small se basa en dos mediciones unicas; el propio autor pide tratarla como afirmacion pendiente de confirmacion.
- Las particiones de test de las colecciones OddAdmix no estan documentadas y el numero de filas de test no esta medido, por lo que no se puede juzgar la significacion estadistica de los resultados.
- No hay benchmarks ancla aplicables: DziriEval y MADAR son suites de texto, no de voz.
- Sesgos: el modelo no ha sido evaluado para sesgo, toxicidad ni factualidad, segun declara el autor.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica al respecto en la informacion disponible.
- Ambito geografico y dialectal limitado: los acentos del este de Argelia y del Sahara quedan fuera de los dominios de entrenamiento y pueden degradar el rendimiento.
- Codigo mezclado con frances: el cambio de codigo frecuente puede transcribirse foneticamente a escritura arabe, generando texto no estandar.
- Usos prohibidos por el autor: texto a voz o cualquier generacion de audio, traduccion entre idiomas, cualquier idioma o dialecto distinto del darija argelino, y cualquier decision sobre personas.
- La puntuacion y los diacriticos no se preservan en la salida evaluada: las cifras de WER corresponden a texto pasado por el normalizador de darija, no a transcripcion literal.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y tener en cuenta que el modelo base `openai/whisper-medium` mantiene sus propias condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algerian-nlp/Hadra-ASR-whisper-medium
- Modelo base: https://huggingface.co/openai/whisper-medium
- Linea base small del colectivo: https://huggingface.co/algerian-nlp/Hadra-ASR-whisper-small
- Dataset Kahwa podcast: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset Loubna stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Dataset Rawi stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Paper de Whisper (referencia arXiv 2212.04356): https://arxiv.org/abs/2212.04356
- Libreria PEFT: https://github.com/huggingface/peft
- Busqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos no guardan relacion con el modelo.

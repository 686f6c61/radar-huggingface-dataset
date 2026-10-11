# myflow-ai/moonshine-tiny-ar-gguf

## Resumen

moonshine-tiny-ar-gguf es una conversión a formato GGUF del modelo UsefulSensors/moonshine-tiny-ar, una variante de Moonshine tiny ajustada específicamente para reconocimiento automático del habla (ASR) en árabe. Moonshine AI (antes Useful Sensors) desarrolla la familia Moonshine, descrita en el artículo "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices", y esta conversión la publica el usuario myflow-ai para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local.

El modelo es un transformer encoder-decoder de apenas 27.092.736 parámetros (unos 27 millones), lo que lo sitúa en la gama ultra-ligera: el archivo cuantizado en Q8_0 ocupa solo 34 MB y el F32 completo 105 MB. Consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente transcripción: no traduce, no detecta idioma y no genera marcas de tiempo.

Su relevancia reside en el despliegue en dispositivos de borde y en hardware muy limitado: con factores de tiempo real superiores a 100x en un Apple M4 Max (Metal) y a 45x en un Ryzen 4750U (CPU), permite transcripción de árabe en local sin GPU dedicada y sin coste por token. La contrapartida es una tasa de error de palabra (WER) de en torno al 27 % en FLEURS árabe, propia de un modelo de este tamaño y de un idioma con morfología compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine); stem de 3 capas Conv1d sobre PCM crudo a 16 kHz, sin STFT ni mel filterbank |
| Parametros totales | 27.092.736 (27 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de ASR; la generacion se limita a max_length=192 tokens segun la configuracion de generacion del autor) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Arabe (ar) unicamente; sin traduccion ni deteccion de idioma |
| Licencia | MIT |
| Formato de pesos | GGUF (conversion para transcribe.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Moonshine tiny original: un transformer encoder-decoder de 27 M de parametros. La innovacion principal de la familia Moonshine frente a Whisper es la supresión del preprocesado clásico de audio: en lugar de calcular un espectrograma mel con STFT, el encoder consume directamente PCM crudo de 16 kHz a traves de un stem convolucional de tres capas Conv1d. Esto reduce la latencia de preprocesado y elimina dependencias de la librería de audio, algo critico en dispositivos de borde. El decoder genera texto plano sin tokens especiales de idioma ni de tarea.

Se trata de un ajuste fino de UsefulSensors sobre Moonshine tiny para árabe, portado desde el commit upstream 99e7fee (fijado el 2026-05-12) y validado contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el artículo de la familia Moonshine (arXiv:2509.02523) es la fuente indicada para esos datos. No se documentan mecanismos de decodificación especulativa ni de atención lineal en esta variante. El decode por defecto es greedy con num_beams=1 y max_length=192.

## Capacidades

- Transcripcion de voz a texto (ASR) en arabe a partir de audio mono a 16 kHz.
- Entrada directa de PCM crudo: no requiere calcular mel-espectrogramas ni características acústicas intermedias.
- Salida solo de transcripcion, sin etiquetas de idioma ni tokens de tarea.
- Ejecucion en CPU y en GPU integrada mediante backends Metal y Vulkan (segun las mediciones publicadas).
- Soporte de cuantizacion en F32, F16 y Q8_0 con deriva numerica minima respecto a la referencia.
- No soporta streaming (streaming: false).
- No soporta traduccion (translate: false).
- No soporta deteccion de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles araboparlantes: el archivo Q8_0 de 34 MB puede embeberse en la propia app y ejecutarse en el dispositivo sin conexion, eliminando costes de API y problemas de privacidad.
- Subtitulado offline de grabaciones de reuniones: con un factor de tiempo real de 127x en Metal, una hora de audio se procesa en torno a 30 segundos en un Apple M4 Max, aunque sin marcas de tiempo habria que alinear los segmentos por separado.
- Preprocesado de corpus de audio arabe para entrenamiento de otros modelos: transcripcion masiva en servidor con Vulkan sobre GPU integrada (56x tiempo real en Ryzen 4750U) para generar pseudoetiquetas o indexar archivos de audio.
- Asistentes de voz en kioscos o dispositivos IoT con recursos minimos: al caber en 34 MB y funcionar en CPU, es viable en placas tipo Raspberry Pi o SoC de bajo consumo donde Whisper tiny seria mas pesado.
- Accesibilidad en tiempo real para personas con discapacidad auditiva en entornos araboparlantes, asumiendo que el WER del 27 % obliga a que el texto se use como apoyo y no como transcripcion legal.
- Investigacion en ASR multilingue de bajo recurso: sirve como linea base ligera y reproducible en C++ para comparar estrategias de cuantizacion o de ajuste fino sobre arabe sin necesidad de infraestructura GPU.
- Filtrado y busqueda por palabra clave en archivos de audio: transcripcion en lote seguida de indexacion de texto para localizar fragmentos concretos en archivos de call center o archivos historicos.

## Benchmarks y rendimiento

WER medido sobre el split de test de FLEURS arabe (428 enunciados) con el decode por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192, coincidente con la generation_config upstream):

| Cuantizacion | Tamano | WER (FLEURS ar test) |
|---|---:|---:|
| F32 | 105 MB | 27,11 % |
| F16 | 57 MB | 27,11 % |
| Q8_0 | 34 MB | 26,79 % |
| Referencia Transformers F32 (MPS) | - | 27,13 % |

Los valores de F32 y F16 en C++ coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza bootstrap; Q8_0 introduce una deriva adicional tipicamente inferior a 0,1 puntos porcentuales. UsefulSensors no publica un WER por idioma para esta variante concreta.

Rendimiento en factor de tiempo real (RTF; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| Ryzen 4750U | Vulkan | 56 |
| Ryzen 4750U | CPU | 45,5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que se trata de un modelo de ASR y no de lenguaje general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 105 MB en F32, 57 MB en F16 y 34 MB en Q8_0, sin contar el búfer de audio ni el runtime de transcribe.cpp.
- Cabe holgadamente en cualquier GPU de consumo, en GPU integradas y en CPU. No requiere GPU dedicada; se validó en Apple M4 Max y en Ryzen 4750U.
- GPU recomendadas: no aplica en el sentido habitual; cualquier GPU con soporte Metal o Vulkan es suficiente, e incluso se obtienen 153,5x de tiempo real en CPU de un M4 Max.
- Opciones de despliegue: transcribe.cpp (única librería declarada, `library_name: transcribe.cpp`) para los GGUF, y Transformers con `MoonshineForConditionalGeneration` para el modelo base en safetensors. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto general.
- Latencia y throughput: RTF de 127 (Metal, M4 Max), 153,5 (CPU, M4 Max), 56 (Vulkan, Ryzen 4750U) y 45,5 (CPU, Ryzen 4750U). Un RTF de 127 implica procesar unas 127 horas de audio por hora de cómputo; en el caso más lento medido, 45,5x, sigue siendo muy superior al tiempo real.
- Entrada requerida: WAV mono a 16 kHz; audios en otros formatos deben convertirse previamente con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---:|---|---|---|---|
| moonshine-tiny-ar-gguf (este) | 27 M | Solo arabe | Audio PCM 16 kHz | MIT | GGUF (F32/F16/Q8_0) |
| UsefulSensors/moonshine-tiny-ar (base) | 27 M | Solo arabe | Audio PCM 16 kHz | MIT | Safetensors |
| Moonshine tiny (multilingue, familia original) | 27 M | Multiples (amplia cobertura, incluido arabe) | Audio PCM 16 kHz | MIT | Safetensors / otros |
| Whisper tiny (OpenAI) | No disponible en la informacion proporcionada | Multilingue | 30 s de audio, espectrograma mel | MIT | Safetensors, GGUF via terceros |

No se dispone en la informacion proporcionada de cifras de WER comparativas para Moonshine tiny multilingue ni para Whisper tiny sobre FLEURS arabe, por lo que no es posible establecer una comparación cuantitativa fiable. La ventaja diferencial de esta conversión es el formato GGUF con ejecución en C++ sobre CPU y GPU integrada; la limitación principal frente a alternativas multilingues es que solo transcribe arabe.

## Limitaciones y advertencias

- WER elevado para uso profesional: en torno al 27 % en FLEURS arabe, lo que implica aproximadamente una palabra errónea de cada cuatro. No es apto para transcripción legal, médica o cualquier uso donde la exactitud literal sea requisito.
- Riesgo de bucles de alucinacion: la propia model card upstream recomienda limitar la longitud máxima del texto generado para evitarlos; en esta conversión el límite es de 192 tokens.
- Monolingüe estricto: solo arabe. No traduce, no detecta idioma y fallará o producirá salidas sin sentido con audio en otros idiomas.
- Sin marcas de tiempo ni streaming: no permite alineación temporal ni transcripción incremental en tiempo real sobre un flujo continuo; hay que procesar el archivo completo.
- Preprocesado obligatorio del audio: requiere WAV mono a 16 kHz; cualquier otra frecuencia, número de canales o códec debe convertirse antes.
- Herencia de sesgos de los datos de entrenamiento: al no documentarse la composición del dataset de ajuste fino, no se pueden evaluar sesgos dialectales, de género o de registro dentro del arabe (árabe estándar moderno frente a dialectos).
- Deriva por cuantizacion: Q8_0 muestra mejor WER aparente que F16 en la medición publicada, pero se trata de una diferencia dentro del ruido; en producción conviene validar con el dominio propio antes de asumir equivalencia.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, siempre que se conserve el aviso de copyright. La licencia se hereda del modelo base.
- Trazabilidad limitada de la conversión: el repositorio declara 0 descargas y 0 likes, y los archivos GGUF enlazados en la tabla apuntan a la cuenta handy-computer, no a myflow-ai; conviene verificar el origen de los pesos antes de desplegarlos.
- Pinning temporal: la conversion se fija al commit upstream 99e7fee (2026-05-12); cambios posteriores en el modelo base no estan reflejados.

## Enlaces

- Pagina de HuggingFace de esta conversion: https://huggingface.co/myflow-ai/moonshine-tiny-ar-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ar
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-tiny-ar/commit/99e7fee
- Articulo "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices": https://huggingface.co/papers/2509.02523
- Articulo "Model Cards for Model Reporting" (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Repositorio de codigo de Moonshine AI: https://github.com/moonshine-ai/moonshine
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para la validacion: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentacion del modelo Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Espejo de los archivos GGUF citados en la model card: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; unicamente aparecieron dominios de contenido para adultos sin relacion con la ficha, por lo que se han omitido.

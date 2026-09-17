# notmax123/xeus-yi-ear

## Resumen

xeus-yi-ear es un reconocedor acústico de fonemas (no un modelo de lenguaje) especializado en yidis jasídico. Se trata de un fine-tuning de PhoneticXeus, un modelo de 575 M de parámetros con cabeza CTC sobre 428 símbolos IPA universales desarrollado por changelinglab, que aquí se reconvierte en una cabeza CTC de 35 salidas cerradas sobre el inventario fonético del motor phonikud-yi: 11 vocales (a aː ɛ ə i u ɔ ej aj ɔj oʊ) y 23 consonantes (b d f ɡ h j k l m n p r s t v z x ʃ ʒ ʦ ʧ ʤ ŋ), sin marca de acento. El autor es notmax123 y la ficha se publica con licencia CC BY 4.0.

El problema que resuelve es concreto: los modelos acústicos multilingües entrenados sobre inventarios IPA amplios no saben emitir diptongos del yidis y confunden sistemáticamente la africada ʦ con /s/. Este checkpoint reduce el error fonético (PER) de 0,547 a 0,336 en tipos de palabra no vistos y de 0,548 a 0,272 en episodios no vistos, con un 35 % de transcripciones exactas frente al 4 % del modelo base. Es relevante porque el yidis jasídico es una variedad con poca representación en recursos de voz y porque permite verificar pronunciaciones en pipelines de texto-a-voz (TTS) para yidis.

El repositorio ocupa 2,3 GB e incluye el codificador ajustado, la cabeza CTC en formato PyTorch, un diccionario de 412 palabras verificadas por un lector nativo y metadatos de evaluación. No se publican resultados de tool calling, agentes ni ninguna capacidad de generación de texto: es un modelo puramente acústico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador acústico tipo transformer con cabeza CTC lineal (herencia de PhoneticXeus/XEUS); el autor congela frontend y bloques 0-5 y ajusta el resto. Detalle exacto de capas y atención: no disponible |
| Parametros totales | 575 M en el modelo base (PhoneticXeus); no se especifica el recuento exacto tras el fine-tuning |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido textual; no disponible la ventana de audio máxima soportada |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas (solo safetensors en el encoder y .pt en la cabeza) |
| Idiomas soportados | Yidis (yi), variedad jasídica |
| Licencia | CC BY 4.0 |
| Formato de pesos | `ckpt/inner.safetensors` (codificador) y `ckpt/yi_head.pt` (cabeza CTC, PyTorch); no hay GGUF ni ONNX |
| Inventario de salida | 35 fonemas CTC cerrados (11 vocales, 23 consonantes, sin acento) |
| Tamano del repositorio | 2,3 GB |
| Dependencias de carga | `transformers==4.56.2`, `huggingface_hub<1.0`, `typeguard`, `pyyaml`, con `trust_remote_code` |

## Arquitectura y entrenamiento

La arquitectura parte de PhoneticXeus, un modelo de 575 M de parámetros con clasificación temporal conexionista (CTC) sobre 428 símbolos IPA universales. El fine-tuning sustituye la proyección final por una cabeza CTC de 35 salidas correspondientes al inventario cerrado del motor phonikud-yi, con inicialización en caliente de cada fila a partir de las filas preentrenadas de los símbolos de cada teléfono. El codificador se ajusta parcialmente: el frontend y los bloques 0-5 permanecen congelados, mientras que los bloques restantes se actualizan. El resultado se carga mediante `xeus_yi_decode.load_finetuned(ckpt_dir)`, que reconstruye el modelo preentrenado con `trust_remote_code`, inyecta el estado del encoder y monta la cabeza.

El entrenamiento corresponde a la «Run 2» documentada en `Phonikud-yi/docs/xeus_finetune.md`. El corpus son 79 000 fragmentos (21 horas) extraídos por alineamiento forzado de los episodios de un único hablante de pódcast, restringidos a palabras cuya lectura había sido verificada (nada generado por el G2P). Para cada clip se eligió la variante de pronunciación de referencia por máxima verosimilitud CTC, y se aplicó aumento de datos de velocidad, ganancia y ruido. Se completaron 6 épocas en una RTX 3090 con un coste aproximado de un dólar. No se documenta uso de RLHF ni DPO, algo esperable en un modelo acústico. La innovación destacable es la restricción del espacio de salida al inventario real del yidis jasídico, que es lo que permite emitir diptongos que el modelo base no puede representar.

## Capacidades

- Reconocimiento de fonemas en audio de yidis jasídico: convierte señal de voz en una secuencia de 11 vocales y 23 consonantes del inventario cerrado.
- Transcripción a nivel de fonema, no de grafema: no produce texto ortográfico en alfabeto hebreo ni en transliteración.
- Discriminación de diptongos (ej, aj, ɔj, oʊ) y de la africada ʦ, capacidades ausentes en el modelo base.
- Robustez ante ruido: mantiene PER 0,301 a 15 dB de relación señal-ruido en episodios no vistos.
- Generalización a hablantes no vistos: PER 0,242 en grabaciones de multitud con 85 hablantes distintos.
- Verificación de lecturas: el diccionario de 412 palabras y el fichero `menu.json` con recuentos de lecturas oídas permiten auditar variantes de pronunciación.
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No tiene modo de pensamiento ni capacidades de visión o audio más allá del reconocimiento fonético.
- Capacidad multilingüe: no; está restringido al yidis jasídico.

## Casos de uso

- Verificación de pronunciación en TTS de yidis: integrar el modelo como evaluador automático en el pipeline de phonikud-yi para comprobar que la síntesis produce realmente el fonema esperado, detectando errores de vocales y diptongos antes de publicar un corpus de voz.
- Anotación fonémica de archivo sonoro: transcribir episodios de pódcast o grabaciones comunitarias a secuencias IPA para construir corpus de investigación sobre una lengua con recursos limitados.
- Investigación fonética descriptiva: estudiar la realización de ʦ, aj, ɔj y oʊ en habla espontánea, con datos comparables antes y después del ajuste (recall de 0,10 a 0,67 para ʦ, de 0 a 0,79 para aj).
- Validación de diccionarios de pronunciación: usar `dictionary.json` y `menu.json` para contrastar qué variantes de una palabra aparecen realmente en audio y con qué frecuencia relativa.
- Evaluación de otros modelos acústicos: servir de referencia (baseline) para medir PER en yidis jasídico con clips emparejados, dado que el autor publica la comparación contra el modelo base.
- Análisis de variación dialectal y préstamos: comparar los recuentos de lecturas aceptadas por palabra para detectar vacilación fonológica entre hablantes o entre registros.
- Preprocesado para reconocimiento de habla completa: la salida fonémica puede alimentar un paso posterior de mapeo a grafemas usando el diccionario verificado de 412 palabras.
- Transcripción de audio degradado: con PER 0,301 a 15 dB de SNR, es adecuado para material de archivo con ruido de fondo, siempre que se acepte el aumento de error frente a condiciones limpias.

## Benchmarks y rendimiento

Resultados publicados por el autor, sobre particiones retenidas y comparados en clips idénticos contra el modelo preentrenado más mapa de plegado:

| Particion | PhoneticXeus preentrenado + fold map | xeus-yi-ear |
|---|---|---|
| Tipos de palabra no vistos (3.600 clips), PER | 0,547 | 0,336 |
| Episodios no vistos (3.600 clips), PER | 0,548 | 0,272 |
| Episodios no vistos, 15 dB SNR, PER | 0,723 | 0,301 |
| 85 hablantes no vistos (grabaciones de multitud), PER | no disponible | 0,242 |
| Transcripciones exactas en episodios no vistos | 4 % | 35 % |

Recall por fonema problemático (preentrenado frente a este checkpoint):

| Fonema | Recall preentrenado | Recall xeus-yi-ear |
|---|---|---|
| ʦ | 0,10 | 0,67 |
| aj | 0 | 0,79 |
| ɔj | 0 | 0,64 |
| oʊ | 0 | 0,39 |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el encoder de 575 M ocupa aproximadamente 2,3 GB solo en pesos; en FP16/BF16 baja a unos 1,15 GB. Con activaciones y buffers de decodificación CTC, un presupuesto realista es de 2-4 GB en FP16 y de 5-6 GB en FP32.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente para inferencia en FP16. El ajuste se realizó en una RTX 3090 (24 GB); también son válidas RTX 4090, A100, H100 o L4, aunque están sobredimensionadas para este tamaño.
- GPU de consumo: sí cabe en tarjetas de consumo. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo sin problemas; una GPU integrada o con menos de 4 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es PyTorch con `transformers==4.56.2`, `huggingface_hub<1.0`, `typeguard` y `pyyaml`, cargando mediante `xeus_yi_decode.load_finetuned(ckpt_dir)` y `trust_remote_code`. Tampoco se publican pesos en GGUF, ONNX o TensorRT.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia indirecta, el coste de entrenamiento (6 épocas sobre 21 horas de audio en una RTX 3090) indica un modelo ligero, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Inventario de salida | PER (episodios no vistos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xeus-yi-ear | CTC acústico ajustado | 575 M (base) | 35 fonemas del yidis jasídico | 0,272 | CC BY 4.0 | Pesos en safetensors + .pt |
| PhoneticXeus | CTC acústico multilingüe | 575 M | 428 símbolos IPA | 0,548 (con fold map) | no disponible | Modelo base publicado |
| phonikud-yi | Motor G2P / herramienta, no modelo acústico | no disponible | Inventario fonético del yidis | no aplica (no procesa audio) | no disponible | Repositorio público |

No se dispone de información sobre otros reconocedores fonéticos específicos de yidis con los que comparar parámetros, contexto o licencia, por lo que la comparativa con alternativas directas queda como no disponible.

## Limitaciones y advertencias

- Sesgo de hablante y de dominio: el entrenamiento usa 21 horas de un único presentador de pódcast. El estilo, el timbre y el registro quedan sobrerrepresentados aunque la evaluación en 85 hablantes no vistos dé PER 0,242.
- Fonemas débiles: la vocal final ə se omite con frecuencia, y la distinción entre oʊ y ɔj es prácticamente aleatoria en palabras no vistas, porque oʊ representa solo el 0,04 % de los fotogramas de entrenamiento. El recall de oʊ es 0,39, el más bajo del inventario.
- El autor indica que todos los intentos de entrenamiento continuado (sobresampleo de schwa, penalización de blank, pérdida auxiliar de fotogramas, currículum de etiquetas atestiguadas, más hablantes) mejoraron alguna métrica pero degradaron oʊ, por lo que este checkpoint se mantiene como referencia.
- Restricción de uso explícita: el modelo es para investigación del habla y para verificar pronunciaciones en TTS de yidis, no para clonación de voz. El audio de entrenamiento procede del pódcast público de un presentador, lo que refuerza esta limitación.
- Salida limitada a fonemas: no genera texto ortográfico, ni puntuación, ni marcas de acento, y no realiza ninguna tarea de comprensión o generación lingüística.
- Cobertura lingüística cerrada: solo yidis jasídico con el inventario de 35 fonemas. Cualquier variedad con fonemas fuera de ese conjunto no puede representarse.
- Dependencias frágiles: requiere una versión exacta de `transformers` (4.56.2) y ejecución de código remoto con `trust_remote_code`, lo que implica revisar el código antes de desplegarlo en producción.
- Sin comunidad ni validación externa: el repositorio registra 0 descargas y 0 «likes», y las cifras de evaluación proceden únicamente del autor.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no se documentan avisos adicionales sobre derechos del audio de origen más allá de la prohibición de clonación de voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notmax123/xeus-yi-ear
- Modelo base PhoneticXeus: https://huggingface.co/changelinglab/PhoneticXeus
- Demo (Space) Yiddish Ear: https://huggingface.co/spaces/notmax123/xeus-yi-ear
- Repositorio del motor phonikud-yi: https://github.com/maxmelichov/Phonikud-yi
- Documentación de fine-tuning del encoder: `docs/xeus_finetune.md` dentro del repositorio Phonikud-yi
- Resultados de evaluación del checkpoint: `ckpt/eval.md` dentro del repositorio del modelo
- Diccionario de lecturas verificadas: `dictionary.json` (412 palabras) en el repositorio del modelo
- Recuentos de lecturas por palabra: `menu.json` en el repositorio del modelo

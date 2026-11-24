# AbramovichRoman/WavMark

## Resumen

WavMark es un sistema de marcado de agua (watermarking) para audio basado en redes neuronales, publicado por Guangyu Chen, Yu Wu, Shujie Liu, Tao Liu, Xiaoyong Du y Furu Wei (el paper está asociado a Microsoft Research, aunque la model card no lo declara explicitamente). No es un modelo generativo de audio: es un modelo de audio-audio que inserta y extrae una carga util binaria (payload) de 16 o 32 bits en una senal de audio de un solo canal a 16 kHz, y que resiste ataques comunes como ruido gaussiano, compresion MP3, filtro paso bajo o variacion de velocidad.

El problema que resuelve es la trazabilidad y atribucion de audio generado o manipulado por IA: permite incrustar un identificador imperceptible en una pista de audio y recuperarlo despues, incluso tras procesos de distribucion que degradan la senal. Segun la model card, la marca sobrevive a 10 tipos de ataques comunes con una robustez superior en mas de 29 veces a los metodos tradicionales, manteniendo una relacion senal-ruido superior a 38 dB y un PESQ de 4,3, lo que la hace inaudible para el oido humano.

Es relevante ahora porque la proliferacion de audio sintetico (voz clonada, musica generada) exige mecanismos de procedencia verificables. WavMark se distribuye como paquete Python (`pip install wavmark`) con pesos PyTorch, licencia MIT, y una demo publica en Hugging Face Spaces. El repositorio de Hugging Face asociado a este identificador esta vacio (0.0 GB) y sin descargas, por lo que la distribucion practica se realiza a traves del paquete PyPI y del codigo del proyecto, no de los pesos alojados en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de marcado de agua en audio (codificador/decodificador) implementada en PyTorch; detalles internos no disponibles en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa tramas de 16.000 muestras (1 segundo a 16 kHz) en acceso de bajo nivel |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el marcado es independiente del idioma de la senal) |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch cargados mediante `wavmark.load_model()`; formato de fichero no especificado |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que el proyecto es "enteramente Python" y que expone un modelo subyacente de PyTorch con metodos `encode` y `decode`. El flujo de bajo nivel revela que el modelo opera sobre tramas de 16.000 muestras (un segundo a 16 kHz) y que el decodificador produce logits que se binarizan con umbral 0,5 para reconstruir el mensaje. El codificador recibe la senal y el mensaje como tensores y devuelve la senal marcada.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se empleo RLHF o DPO (no procede en esta tarea). La innovacion tecnica destacada por el autor es la robustez frente a ataques: la model card afirma resistencia a 10 tipos de ataques comunes y una mejora de mas de 29 veces en robustez frente a metodos tradicionales. El diseno reconoce inspiracion en Audiowmark de Stefan Westerfeld. El paper asociado es arXiv:2308.12770 ("WavMark: Watermarking for Audio Generation").

## Capacidades

- Insercion de marcas de agua binarias de 16 bits mediante la API de alto nivel (`encode_watermark`).
- Insercion de mensajes de 32 bits mediante la API de bajo nivel (`model.encode` sobre tramas de 16.000 muestras).
- Extraccion y decodificacion de la marca (`decode_watermark` / `model.decode`) con calculo de BER (bit error rate).
- Robustez declarada frente a 10 tipos de ataques: ruido gaussiano, compresion MP3, filtro paso bajo, variacion de velocidad, entre otros.
- Imperceptibilidad: SNR superior a 38 dB y PESQ de 4,3 segun el autor.
- Conversion automatica de audio a mono a 16 kHz mediante `wavmark.utils.file_reader.read_as_single_channel`.
- Soporte de ejecucion en GPU CUDA o CPU (`torch.device`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidad multilingue no aplicable; el marcado opera sobre la forma de onda, no sobre contenido linguistico.

## Casos de uso

- Atribucion de audio generado por IA: incrustar un identificador de 16 bits en cada pista sintetizada por un sistema TTS o de musica generativa, de modo que un verificador pueda extraerlo y comprobar la procedencia incluso despues de la compresion a MP3 para su distribucion.
- Deteccion de filtraciones en prensa y radiodifusion: marcar copias promocionales entregadas a medios y rastrear cual se filtro comparando el payload recuperado con el registro de destinatarios.
- Verificacion de integridad en pipelines de postproduccion: marcar masters de audio antes de pasar por cadenas de procesado (ecualizacion, normalizacion, filtros) y comprobar al final que la marca sobrevive, actuando como sello de autenticidad.
- Proteccion de catalogos musicales: incrustar un identificador de licencia o de titular en cada pista de un catalogo para facilitar reclamaciones de derechos en plataformas de distribucion.
- Trazabilidad en datasets de investigacion: marcar clips de audio sintetico usados para entrenar o evaluar detectores, de forma que se pueda auditar su origen y evitar contaminacion entre conjuntos de entrenamiento y prueba.
- Antipirateria en audiolibros y podcasts: insertar un payload distinto por suscriptor o por plataforma de distribucion para identificar la fuente de una copia redistribuida sin autorizacion.
- Verificacion forense de grabaciones: comprobar si una grabacion presentada como original contiene una marca WavMark y, por tanto, procede de un sistema que la genero o proceso.

## Benchmarks y rendimiento

La model card no presenta una tabla de benchmarks con metricas comparativas estandar (MMLU, HumanEval, GSM8K no aplican). Los unicos datos cuantitativos publicados son los siguientes:

| Metrica | Valor declarado |
|---|---|
| SNR de la senal marcada | > 38 dB |
| PESQ | 4,3 |
| Tipos de ataque resistidos | 10 |
| Mejora de robustez frente a metodos tradicionales | > 29 veces |
| Capacidad de payload (alto nivel) | 16 bits |
| Capacidad de payload (bajo nivel) | 32 bits por trama de 16.000 muestras |

No se han publicado resultados de benchmarks detallados por ataque en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es pequeno y el procesado se realiza por tramas de 16.000 muestras, por lo que la huella de memoria es reducida en comparacion con modelos generativos.
- GPU recomendadas: cualquier GPU CUDA con soporte PyTorch; el codigo de ejemplo usa `cuda:0` si esta disponible. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, al ejecutarse en CPU o en cualquier GPU CUDA; no se publican requisitos minimos.
- Opciones de despliegue: paquete Python `wavmark` sobre PyTorch; demo en Hugging Face Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capacidad de payload | Robustez declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WavMark | Watermarking neuronal de audio | 16 / 32 bits | 10 ataques, > 29x frente a metodos tradicionales | MIT | PyPI (`wavmark`), HF Spaces |
| Audiowmark (Stefan Westerfeld) | Watermarking de audio tradicional | no disponible | no disponible | no disponible | Referenciado como inspiracion |
| Metodos tradicionales (genericos) | Watermarking clasico | no disponible | Base de comparacion del paper | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para comparar con otros sistemas de watermarking neuronal (por ejemplo, variantes basadas en autoencoders) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La senal de entrada debe ser mono a 16 kHz; es necesario remuestrear y convertir canales antes de marcar, lo que puede alterar el audio original.
- La capacidad de payload es muy limitada (16 bits en alto nivel, 32 bits por trama en bajo nivel), insuficiente para incrustar metadatos extensos o identificadores criptograficos largos.
- La robustez declarada (> 29x, 10 ataques) procede de la model card del autor y no se ha verificado de forma independiente en la informacion disponible.
- El repositorio de Hugging Face asociado tiene 0.0 GB y 0 descargas, por lo que los pesos no se distribuyen desde el Hub; la obtencion practica depende del paquete PyPI o del codigo del proyecto.
- Riesgo de que ataques no cubiertos (remuestreo agresivo, recorte, mezcla con otras senales, regeneracion por modelos generativos) destruyan la marca; no se documenta el comportamiento en esos casos.
- El modelo no realiza ninguna funcion de generacion, razonamiento ni comprension semantica; no debe evaluarse con criterios de LLM.
- La licencia MIT permite uso comercial, pero no se especifican garantias ni condiciones adicionales sobre la responsabilidad del marcado.
- No se documentan sesgos; al operar sobre la forma de onda, el riesgo de sesgo linguistico o cultural no aplica de la misma forma que en modelos de lenguaje.
- Para produccion, conviene validar la tasa de error de bits (BER) en la cadena concreta de procesado de audio antes de confiar en la marca como prueba de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbramovichRoman/WavMark
- Paper (arXiv): https://arxiv.org/abs/2308.12770
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/M4869/WavMark
- Pagina del proyecto con ejemplos de audio: https://wavmark.github.io/
- Audiowmark (proyecto de referencia): https://uplex.de/audiowmark
- Instalacion: `pip install wavmark`

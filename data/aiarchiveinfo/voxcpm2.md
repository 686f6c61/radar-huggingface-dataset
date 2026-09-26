# AIArchiveInfo/VoxCPM2

## Resumen

VoxCPM2 es un modelo de sintesis de voz (text-to-speech) de 2B parametros desarrollado por OpenBMB, publicado bajo licencia Apache-2.0. La ficha que nos ocupa, `AIArchiveInfo/VoxCPM2`, es una copia espejo byte a byte del repositorio original `openbmb/VoxCPM2` (revision `32279effe8c1`), archivada por AIArchive el 25 de septiembre de 2026; no se ha entrenado, ajustado ni alterado ningun peso, y la licencia original se mantiene. El modelo ocupa 2.290.004.544 parametros reales (2,29B) en safetensors y el repositorio pesa 5,0 GB.

Tecnicamente se trata de un modelo **sin tokenizador** (tokenizer-free) de tipo **difusion autorregresiva**, con una cascada de cuatro modulos (LocEnc, TSLM, RALM y LocDiT) construida sobre un backbone derivado de MiniCPM-4. El decodificador de audio, AudioVAE V2, usa codificacion/decodificacion asimetrica: acepta referencias de 16 kHz y sintetiza a 48 kHz mediante superresolucion integrada, sin necesidad de un upsampler externo. Se ha entrenado sobre mas de 2 millones de horas de habla multilingue.

Su relevancia actual radica en la combinacion de tres factores poco habituales en TTS abierto: cobertura de 30 idiomas (mas 10 dialectos del chino) sin necesidad de etiqueta de idioma, diseno de voz a partir de descripciones en lenguaje natural y clonacion controlable con guias de estilo, todo ello con una tasa de tiempo real (RTF) de aproximadamente 0,3 en una NVIDIA RTX 4090 y de 0,13 con aceleracion mediante Nano-VLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion autorregresiva sin tokenizador (LocEnc -> TSLM -> RALM -> LocDiT), backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (2,29B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo no expone una ventana de contexto de texto. La model card indica un "LM token rate" de 6 (unidad no especificada) |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | 30 idiomas: arabe, birmano, chino, danes, neerlandes, ingles, finlandes, frances, aleman, griego, hebreo, hindi, indonesio, italiano, japones, jemer, coreano, lao, malayo, noruego, polaco, portugues, ruso, espanol, suajili, sueco, tagalo, tailandes, turco y vietnamita. Ademas, 10 dialectos del chino: sichuanes, cantones, wu, dongbei, henan, shaanxi, shandong, tianjin y min nan |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `voxcpm`, PyTorch) |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-to-speech |
| Requisitos de entorno | Python >= 3.10, PyTorch >= 2.5.0, CUDA >= 12.0 |
| Fecha de creacion del espejo | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

VoxCPM2 abandona el enfoque clasico de dos etapas (tokenizador de audio discreto + modelo de lenguaje) y apuesta por una difusion autorregresiva sin tokenizador. La cadena de procesamiento consta de cuatro componentes: LocEnc (codificador local), TSLM (modelo de lenguaje temporal), RALM (modelo autorregresivo local) y LocDiT (transformer de difusion local). El backbone del modelo de lenguaje deriva de MiniCPM-4 y suma en total 2B parametros. La parte de audio la cubre AudioVAE V2, un VAE de audio con codificacion y decodificacion asimetricas que recibe referencias a 16 kHz y produce salida a 48 kHz aplicando superresolucion interna, lo que evita depender de un upsampler externo en el pipeline de inferencia.

El entrenamiento se ha realizado sobre mas de 2 millones de horas de habla multilingue, lo que explica la cobertura de 30 idiomas y 10 dialectos del chino sin necesidad de condicionar la generacion con una etiqueta de idioma. La model card no detalla la composicion exacta del dataset, el numero de tokens de texto vistos ni si se aplicaron etapas de RLHF o DPO; tampoco especifica el reparto de horas por idioma. Si se documentan en cambio los mecanismos de control en inferencia: `cfg_value` (por defecto 2,0) para la escala de clasificador sin guia y `inference_timesteps` (10 en los ejemplos) para el numero de pasos de difusion. Entre las innovaciones destacables estan la sintesis consciente del contexto (el modelo infiere prosodia y expresividad a partir del texto), el streaming en tiempo real y la clonacion en tres modos (diseno de voz, clonacion controlable y clonacion maxima con audio y transcripcion de referencia).

## Capacidades

- Generacion de voz a partir de texto en 30 idiomas sin etiqueta de idioma explicita.
- Diseno de voz (voice design): crear una voz nueva a partir de una descripcion en lenguaje natural (genero, edad, tono, emocion, ritmo) sin audio de referencia, colocando la descripcion entre parentesis al inicio del texto.
- Clonacion de voz basica a partir de un clip corto de referencia mediante `reference_wav_path`.
- Clonacion controlable: clonacion de timbre con guias de estilo opcionales para modular emocion, velocidad y expresividad.
- Clonacion maxima (ultimate cloning): aportando audio de referencia y su transcripcion exacta (`prompt_wav_path` + `prompt_text` + `reference_wav_path`) para continuacion de audio con maxima fidelidad de matices vocales.
- Salida de audio a 48 kHz con calidad de estudio, partiendo de referencias de 16 kHz.
- Sintesis consciente del contexto: ajuste automatico de prosodia y expresividad segun el contenido del texto.
- Streaming en tiempo real mediante `model.generate_streaming()`, con generacion por fragmentos concatenables.
- Soporte de dialectos del chino (sichuanes, cantones, wu, dongbei, henan, shaanxi, shandong, tianjin, min nan).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla del audio de referencia para clonacion.

## Casos de uso

- Audiolibros y narracion larga: el modelo ajusta prosodia y expresividad de forma automatica a partir del texto, y la clonacion controlable permite mantener un timbre consistente durante horas de narracion modulando ritmo y emocion por capitulo.
- Doblaje y localizacion de contenido audiovisual: con 30 idiomas soportados sin etiqueta de idioma, un mismo flujo puede generar pistas de voz en espanol, aleman, japones o arabe, y la clonacion con guia de estilo permite preservar la interpretacion del actor original.
- Atencion al cliente automatizada por voz: la sintesis en streaming (RTF ~0,3 en RTX 4090) permite respuestas habladas con latencia baja, y el diseno de voz admite crear una voz corporativa coherente sin necesidad de grabar un locutor.
- Accesibilidad y lectores de pantalla: la salida a 48 kHz mejora la inteligibilidad frente a sintetizadores clasicos, y el soporte multilingue cubre usuarios que alternan idiomas dentro del mismo documento.
- Preservacion de voz para personas con perdida de habla: la clonacion maxima, que combina audio de referencia y su transcripcion, esta pensada para reproducir con alta fidelidad los matices vocales de una grabacion previa.
- Produccion de videojuegos y personajes virtuales: el diseno de voz permite generar repartos completos a partir de descripciones textuales (edad, genero, tono), sin sesiones de grabacion ni derechos de imagen asociados.
- Generacion de datos sinteticos de audio para entrenamiento: la cobertura de 30 idiomas y la capacidad de clonar voces facilitan crear corpus de habla etiquetados para pipelines de ASR o de diarizacion.
- Locucion publicitaria y contenido educativo multilingue: la clonacion con control de estilo permite producir variantes de un mismo anuncio con distinto tono y velocidad, manteniendo el timbre de marca.
- Asistentes de voz embebidos en aplicaciones: la integracion se realiza via la libreria `voxcpm` en Python, con streaming por fragmentos que encaja en arquitecturas de respuesta incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de calidad (WER, MOS, similitud de hablante) ni comparaciones con otros sistemas TTS. El unico dato de rendimiento cuantificado es la tasa de tiempo real (RTF):

| Metrica | Valor | Condiciones |
|---|---|---|
| RTF | ~0,3 | NVIDIA RTX 4090 |
| RTF | ~0,13 | NVIDIA RTX 4090 con aceleracion Nano-VLLM |
| Pasos de difusion por defecto | 10 (`inference_timesteps`) | Valores de ejemplo de la model card |
| Escala de clasificador sin guia | 2,0 (`cfg_value`) | Valores de ejemplo de la model card |

Un RTF de 0,3 equivale a generar un segundo de audio en 0,3 segundos de computo, es decir, unas 3,3 veces mas rapido que el tiempo real; con Nano-VLLM la cifra asciende a aproximadamente 7,7 veces mas rapido que el tiempo real.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 4,6 GB en FP16/BF16 y unos 9,2 GB en FP32 para los 2,29B parametros. Hay que sumar la memoria de AudioVAE V2 y del modulo denoiser (la API permite `load_denoiser=False` para omitirlo).
- En la practica, el repositorio completo ocupa 5,0 GB, por lo que se recomienda reservar entre 6 y 8 GB de VRAM para inferencia en precision media con margen para activaciones.
- GPU recomendadas por perfil: NVIDIA RTX 4090 (referencia medida por el autor), A100, H100 o L40S para despliegues concurrentes; NVIDIA RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en adelante para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en FP16/BF16, siempre que se desactive el denoiser si el presupuesto de memoria es ajustado.
- Opciones de despliegue: libreria oficial `voxcpm` (Python >= 3.10, PyTorch >= 2.5.0, CUDA >= 12.0), inferencia en streaming nativa y aceleracion mediante Nano-VLLM. No se documentan integraciones con llama.cpp, Ollama, vLLM estandar, TGI ni formatos GGUF.
- Latencia y throughput: RTF ~0,3 en RTX 4090 y ~0,13 con Nano-VLLM, segun los datos facilitados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 | 2,29B (medido en safetensors) | 30 + 10 dialectos del chino | 48 kHz | Apache-2.0 | HuggingFace (`openbmb/VoxCPM2` y espejo `AIArchiveInfo/VoxCPM2`), codigo en GitHub |
| Alternativas de la misma categoria (por ejemplo, XTTS-v2, CosyVoice 2, F5-TTS) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa con modelos alternativos de sintesis de voz. No se han incluido cifras de parametros, contexto ni rendimiento de terceros porque no aparecen en la model card ni en las fuentes consultadas.

## Limitaciones y advertencias

- La model card no documenta sesgos especificos, pero un modelo entrenado con mas de 2 millones de horas de habla multilingue puede reproducir sesgos de acento, genero o variedad dialectal presentes en los datos de entrenamiento.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta: al no depender de un tokenizador de audio discreto y generar directamente la onda mediante difusion, no se dispone de una representacion intermedia auditable que permita corregir errores de pronunciacion de forma determinista.
- La cobertura de idiomas es amplia, pero la model card no indica el reparto de horas de entrenamiento por idioma, por lo que la calidad relativa entre lenguas es desconocida; cabe esperar un rendimiento desigual entre idiomas con muchos y pocos recursos.
- Limitaciones de contexto: el modelo no expone una ventana de contexto de texto y esta disenado para fragmentos de sintesis; no esta pensado para razonamiento multi-turno ni para procesar documentos largos como una unidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin royalties; aun asi, la clonacion de voz plantea requisitos legales y eticos adicionales (consentimiento del hablante, normativa sobre deepfakes y derechos de imagen) que la licencia no cubre.
- El espejo `AIArchiveInfo/VoxCPM2` no ha sido entrenado ni modificado, pero su autor no es el autor original; para soporte, actualizaciones y responsabilidad tecnica hay que remitirse a `openbmb/VoxCPM2`.
- No hay variantes cuantizadas publicadas (GGUF, AWQ, GPTQ) ni soporte documentado en motores de inferencia convencionales como llama.cpp, Ollama o TGI, lo que limita el despliegue en entornos sin Python ni CUDA.
- Requiere GPU con CUDA >= 12.0 y PyTorch >= 2.5.0; no se documenta soporte para CPU ni para aceleradores no NVIDIA.
- Los datos de rendimiento (RTF) proceden del autor y se han medido en una RTX 4090; el rendimiento en hardware distinto puede variar notablemente.
- En el momento de la consulta el espejo registra 0 descargas y 0 "likes", por lo que no hay senales de uso comunitario ni de validacion independiente.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/VoxCPM2
- Modelo original: https://huggingface.co/openbmb/VoxCPM2
- Revision archivada: https://huggingface.co/openbmb/VoxCPM2/tree/32279effe8c19989596f05d353d1447f51d9e915
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentacion: https://voxcpm.readthedocs.io/en/latest/
- Inicio rapido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo en vivo (Space): https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Pagina de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Nano-VLLM para aceleracion: https://github.com/a710128/nanovllm-voxcpm
- Discord del proyecto: https://discord.gg/KZUx7tVNwz

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre VoxCPM2; los unicos resultados obtenidos pertenecian a foros sin relacion con el modelo y se han descartado.

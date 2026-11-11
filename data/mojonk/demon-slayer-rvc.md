# mojonk/demon-slayer-rvc

## Resumen

Demon Slayer RVC es una coleccion de tres modelos de conversion de voz (voice conversion, VC) entrenados con la arquitectura Retrieval-based Voice Conversion (RVC) v2 a 40 kHz. Los ha publicado el usuario mojonk (firmado en la model card como AirBudd Dwyer) y reproducen las voces del doblaje ingles de tres personajes del anime *Demon Slayer*: Akaza, Muzan y Tanjiro. No es un modelo de lenguaje ni un sistema de sintesis de texto a voz: es un conjunto de pesos que transforman una senal de audio de entrada en otra con el timbre del personaje, manteniendo prosodia y contenido linguistico.

El repositorio, de aproximadamente 1,0 GB, contiene tres archivos comprimidos, cada uno con el checkpoint de red neuronal (`.pth`) y su indice de caracteristicas (`.index`) usado por el mecanismo de recuperacion de RVC. Los modelos se entrenaron en GPUs RTX 4090 alquiladas en RunPod en noviembre de 2026, con entre 114 y 250 epocas segun el personaje. La relevancia es acotada: se trata de un artefacto comunitario para experimentacion con conversion de voz y doblaje, no de un modelo con benchmarks publicados ni con soporte de herramientas estandar de inferencia de LLM.

La informacion disponible es muy limitada: la model card no documenta arquitectura interna, licencia concreta, idiomas ni resultados de evaluacion. Todo lo que se detalla a continuacion proviene de la model card y de los metadatos de Hugging Face, y los campos no cubiertos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), muestreo a 40 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en precision de entrenamiento) |
| Idiomas soportados | no disponible (entrenado sobre doblaje en ingles; la conversion preserva el idioma de la entrada) |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | `.pth` (checkpoint PyTorch) + `.index` (indice de caracteristicas), distribuidos en archivos ZIP |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversion de voz que combina un extractor de caracteristicas (HuBERT o similar, segun la implementacion), un codificador de contenido, un decodificador generativo y un mecanismo de recuperacion (retrieval) sobre un indice de embeddings de la voz objetivo; ese indice es precisamente el archivo `.index` que acompana a cada `.pth`. El modelo opera a 40 kHz, lo que permite reconstruir contenido de alta frecuencia y mejorar la naturalidad del timbre convertido. La model card no detalla el numero de parametros, la composicion exacta del dataset ni si se aplico fine-tuning adicional sobre un modelo base preentrenado.

Los tres modelos se entrenaron con datos propios extraidos del doblaje ingles: Akaza con 293 clips (11,1 minutos) durante 250 epocas, Muzan con 482 clips (18,3 minutos) durante 250 epocas y Tanjiro con 1528 clips (56,0 minutos) durante 114 epocas. Todo el entrenamiento se realizo en GPUs RTX 4090 alquiladas en RunPod. El autor indica ajustes de inferencia recomendados: pitch 0, protect 0.33 y seguimiento de tono con RMVPE. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni etapas de RLHF/DPO, que en este tipo de modelo no aplican.

## Capacidades

- Conversion de voz many-to-one: transforma una grabacion de entrada en la voz de Akaza, Muzan o Tanjiro conservando el contenido linguistico y la prosodia.
- Reconstruccion a 40 kHz, con mayor fidelidad en agudos y consonantes que las variantes a 32 kHz o 40 kHz de menor calidad.
- Seguimiento de tono mediante RMVPE, util para entradas cantadas o con entonacion marcada.
- Control de pitch y de proteccion de consonantes (parametros `pitch` y `protect`) para ajustar el resultado.
- Recuperacion por indice de caracteristicas, que mejora la similitud de timbre en pasajes con poca cobertura en el dataset de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No es un modelo multimodal de vision ni de audio comprensivo: solo realiza conversion de voz.
- Capacidades multilingues: no documentadas; al preservar el contenido de la entrada, en la practica puede aplicarse a otros idiomas, pero no hay evidencia publicada de calidad fuera del ingles.

## Casos de uso

- Doblaje de fan y contenido derivado: aplicar el modelo a una locucion en ingles para obtener una version con el timbre de Tanjiro, Muzan o Akaza en proyectos de doblaje no comerciales, usando pitch 0 y protect 0.33 como punto de partida.
- Prototipado de personajes para videojuegos o animacion: generar lineas de voz provisionales para maquetas antes de contratar actores, sustituyendo la voz del disenador por la del personaje.
- Creacion de mods y contenido para comunidades de anime: integrar el `.pth` y el `.index` en pipelines de RVC para producir voces de personaje en mods de juegos o videos de YouTube.
- Experimentacion en investigacion de conversion de voz: usar los tres checkpoints como referencia para comparar tecnicas de retrieval, seguimiento de tono (RMVPE frente a alternativas) y calidad a 40 kHz.
- Evaluacion de robustez con datasets pequenos: los tres modelos tienen entre 11 y 56 minutos de audio, lo que permite estudiar el efecto del tamano del dataset y del numero de epocas (114 frente a 250) en la calidad final.
- Educacion y demos de sintesis de voz: mostrar en talleres como funciona RVC v2 con ejemplos reconocibles, siempre con consentimiento y sin suplantacion de identidad.
- Pruebas de doblaje automatizado en pipelines de postproduccion: encadenar un TTS con el modelo RVC para obtener una voz de personaje consistente en varias tomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, similitud de hablante, error de pitch) ni comparaciones con otros modelos de conversion de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; en la practica, RVC v2 suele ejecutarse con comodidad en GPUs consumer de 8 GB o mas, aunque el dato no esta confirmado por el autor.
- GPU recomendadas: el entrenamiento se realizo en RTX 4090; para inferencia basta una GPU consumer moderna (RTX 3060 en adelante) o incluso CPU con latencia mayor.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas de VRAM; no hay confirmacion oficial.
- Opciones de despliegue: el ecosistema RVC (interfaz web de RVC, herramientas derivadas como Applio) carga los archivos `.pth` e `.index`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, de la duracion del audio y del uso de RMVPE para el seguimiento de tono.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de conversion de voz con los que comparar parametros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Licencia "other" sin terminos detallados: no se especifica si se permite uso comercial, por lo que debe contactarse con el autor antes de cualquier uso en produccion.
- Riesgo legal y etico alto: las voces derivan de personajes con derechos de autor y de actores de doblaje reales; la suplantacion de identidad o el uso comercial sin autorizacion pueden infringir derechos de propiedad intelectual y de imagen.
- Datasets muy pequenos (11,1 a 56,0 minutos): probable sobreajuste y menor robustez ante acentos, ruido o estilos vocales alejados del doblaje original.
- El modelo solo se ha validado sobre doblaje en ingles; la calidad en otros idiomas o acentos no esta documentada.
- Riesgo de artefactos y perdida de naturalidad en pasajes con pitch extremo, susurros o habla solapada.
- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling; no debe evaluarse con benchmarks de LLM.
- Descargas y likes nulos en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Repositorio de 1,0 GB con archivos ZIP: conviene verificar la integridad de los checkpoints antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/mojonk/demon-slayer-rvc
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.

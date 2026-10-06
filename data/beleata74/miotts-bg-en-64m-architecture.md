# beleata74/MioTTS-BG-EN-64M-Architecture

## Resumen

MioTTS BG/EN 64M — architecture preview es un repositorio publicado por el usuario beleata74 en HuggingFace que contiene unicamente una arquitectura de sintesis de voz (text-to-audio) con pesos inicializados de forma aleatoria. No es un modelo entrenado: la propia model card advierte de que los pesos son aleatorios y no pueden sintetizar habla inteligible. Su proposito es permitir inspeccionar el diseno de la red mediante herramientas como HF Viewer y servir como referencia tecnica del sistema propuesto.

El modelo suma 63.027.586 parametros (unos 63 M) e implementa un esquema de dos partes dentro del mismo grafo: un codificador de texto bidireccional de 5 bloques transformer (ancho 384, 8 cabezas, SwiGLU de 1280) y un decodificador de audio autorregresivo causal de 11 bloques (ancho 512, 8 cabezas, cross-attention al texto y cache KV). La salida son tokens de contenido de un codec externo (MioCodec 25 Hz / 44.1 kHz v2) a 25 tramas por segundo, con un maximo de 300 tramas de contenido para segmentos de 12 segundos.

Es relevante ahora como material de investigacion y auditoria de arquitecturas TTS: documenta explicitamente un prior de duracion con atencion monotona, un esquema de condicionamiento solo por texto y una separacion estricta entre el modelo principal y la seleccion de voz (que ocurre en el codec externo). El repositorio no incluye el codec ni ningun conjunto de datos de entrenamiento, y no se han publicado mediciones de calidad ni de factor de tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: codificador de texto bidireccional (5 bloques) + decodificador de audio autorregresivo causal (11 bloques) con cross-attention al texto, prior de duracion convolucional y sesgo de atencion monotona gaussiana |
| Parametros totales | 63.027.586 (aproximadamente 63 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la generacion se limita a un maximo de 300 tramas de contenido, equivalentes a 12 segundos de audio) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | bulgaro (cirilico) e ingles (latino) |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos subredes. El codificador de texto procesa caracteres (cirilico bulgaro o latino ingles) y puntuacion mediante 5 bloques transformer bidireccionales de ancho 384 con 8 cabezas de atencion y una capa SwiGLU de 1280. El decodificador de audio consta de 11 bloques transformer causales de ancho 512, 8 cabezas, cross-attention hacia el texto y SwiGLU de 1280, y dispone de cache KV para decodificacion incremental. El vocabulario de texto no incluye digitos, fonemas ni token de identificacion de idioma. La prediccion de duracion se implementa con dos capas convolucionales y un sesgo de atencion monotona suave. La salida es una distribucion de 12.800 clases (tokens de contenido de MioCodec) por trama mas una cabeza separada de parada; la cabeza de salida comparte las primeras 12.800 filas de la matriz de embedding de audio. Los identificadores de audio usan el rango 0..12799 para los codigos del codec y 12800 para el inicio de habla.

En inferencia, la unica entrada externa del modelo principal es el texto: el decodificador consume autorregresivamente los tokens de audio ya generados. Durante el entrenamiento se aplica teacher forcing con los tokens de audio de referencia de la propia grabacion (no una voz de referencia). La seleccion de voz ocurre despues, fuera del modelo principal: un codificador de MioCodec extrae un embedding global de voz a partir de una muestra corta, y el decodificador de MioCodec lo emplea al renderizar los tokens; tambien existe un embedding por defecto almacenado para sintetizar sin muestra. El modelo principal nunca ve el embedding de voz. La model card indica que el predictor de duracion y el prior de atencion estan implementados, pero necesitan objetivos de duracion o un procedimiento de alineacion para poder entrenarse, y que la arquitectura solo se ha verificado con pruebas de formas, perdida finita, serializacion y decodificacion con cache. No se midieron factor de tiempo real ni calidad de voz; unicamente se reconstruyeron satisfactoriamente cuatro enunciados de un corpus bulgaro con MioCodec v2, lo que valida el codec y no la generacion texto-a-token.

## Capacidades

- Generacion de texto a audio: la arquitectura esta disenada para producir tokens de contenido de un codec de voz a 25 tramas por segundo, con un maximo de 300 tramas (12 segundos) por segmento.
- Condicionamiento solo por texto: el modelo principal no acepta audio de referencia ni embedding de locutor como entrada; la voz se decide en el codec externo.
- Prediccion de duracion y alineacion: incluye un prior de atencion monotona suave y un predictor de duracion basado en convoluciones, aunque sin objetivos de duracion asociados.
- Multilingue limitado: soporta bulgaro en cirilico e ingles en latino, sin token de identificacion de idioma (el idioma se infiere del alfabeto empleado).
- Decodificacion autorregresiva con cache KV, preparada para generacion incremental trama a trama.
- Estado real: al ser un preview sin entrenar, el modelo no genera habla inteligible; las capacidades anteriores describen el diseno, no un comportamiento funcional verificado.
- No dispone de soporte declarado de tool calling, function calling, agentes, vision ni audio de entrada.

## Casos de uso

- Inspeccion y auditoria de arquitectura TTS: cargar el modelo con `AutoModel.from_pretrained(..., trust_remote_code=True)` y recorrer el grafo para estudiar como se reparten los 63 M de parametros entre codificador de texto y decodificador de audio.
- Referencia para desarrollo de pipelines de entrenamiento: utilizar la implementacion como esqueleto para definir las funciones de perdida, el teacher forcing y el enmascaramiento temporal antes de incorporar datos reales.
- Pruebas de integracion con MioCodec v2: validar el flujo de tokens de contenido (12.800 clases a 25 Hz) hacia el decodificador externo de waveform y comprobar la compatibilidad de los identificadores 0..12799 y 12800.
- Investigacion sobre atencion monotona y prediccion de duracion: analizar el sesgo de cross-attention monotono y el predictor convolucional de duracion como componentes reutilizables en otros sistemas TTS.
- Validacion de serializacion y decodificacion con cache: comprobar en infraestructura propia que el guardado, la carga y la generacion incremental con KV cache se comportan correctamente con el codigo personalizado.
- Docencia y divulgacion tecnica: usar el repositorio como ejemplo didactico de una arquitectura TTS encoder-decoder con codec neuronal a 44.1 kHz y separacion entre modelo acustico y renderizado de voz.
- Punto de partida para reentrenamiento: emplear la definicion de red como base para un entrenamiento desde cero con un corpus propio de bulgaro e ingles, una vez definidos los objetivos de duracion y alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el factor de tiempo real y la calidad de voz de este modelo sin entrenar no se han medido, y que solo se han ejecutado pruebas de formas, perdida finita, serializacion y decodificacion con cache.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 252 MB solo para pesos (63 M × 4 bytes); en fp16/bf16, unos 126 MB; en int8, unos 63 MB. A ello hay que sumar las activaciones, la cache KV del decodificador y los pesos del codec externo, que se descarga aparte.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM libre es suficiente para cargar la arquitectura; no se requieren aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (por ejemplo, RTX 3060, RTX 4060 o superiores), e incluso podria ejecutarse en CPU para tareas de inspeccion.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se indica soporte de llama.cpp, Ollama, vLLM ni TGI, y no se ofrecen pesos en GGUF ni cuantizaciones publicadas.
- Latencia y throughput: no disponible (no medidos; el modelo no esta entrenado y no produce audio funcional).
- Requisito adicional: para obtener waveform hace falta descargar por separado el decodificador MioCodec 25 Hz / 44.1 kHz v2 de su autor, cuyos pesos no forman parte de este repositorio ni de la cuenta de parametros indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| MioTTS BG/EN 64M (este modelo) | 63.027.586 | bulgaro, ingles | MIT | Sin entrenar (preview de arquitectura) | HuggingFace, transformers con codigo personalizado |
| Kokoro-82M | aproximadamente 82 M (dato no confirmado en la informacion proporcionada) | ingles y otros (no disponible el detalle) | Apache-2.0 (no confirmado) | Entrenado | Pesos publicos en HuggingFace |
| Piper (VITS) | variable por voz (no disponible) | multiples | MIT (no confirmado) | Entrenado | Pesos por voz en HuggingFace y binarios ONNX |
| Coqui XTTS-v2 | no disponible | multiples | CPML (no comercial, no confirmado) | Entrenado | Pesos publicos en HuggingFace |

Nota: los datos de los modelos comparables no forman parte de la informacion proporcionada para este modelo y deben verificarse en sus respectivas fichas antes de usarse en una decision tecnica. La comparacion directa de rendimiento no es posible porque MioTTS no dispone de resultados de benchmarks ni de pesos entrenados.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no esta entrenado y no puede sintetizar habla inteligible; no debe desplegarse como sistema funcional de TTS.
- Sin datos de calidad ni de rendimiento: no se han medido factor de tiempo real (RTF), MOS ni inteligibilidad, por lo que se desconoce su comportamiento practico incluso tras un entrenamiento.
- Dependencia de un codec externo: la generacion de waveform requiere descargar MioCodec v2 por separado; el repositorio no incluye el codec ni los datos de entrenamiento.
- Vocabulario de texto restringido: no admite digitos, fonemas ni token de identificacion de idioma, lo que limita la normalizacion de texto y la gestion explicita de la lengua.
- Duracion sin entrenar: el predictor de duracion y el prior de atencion monotona necesitan objetivos de duracion o un procedimiento de alineacion que no se proporcionan.
- Cobertura multilingue reducida: solo bulgaro (cirilico) e ingles (latino); no hay soporte declarado para otras lenguas ni para mezcla de alfabetos.
- Limite de longitud de salida: maximo de 300 tramas de contenido, es decir, 12 segundos de audio por segmento.
- Voz gestionada fuera del modelo: la identidad vocal depende del embedding del codec y de un embedding por defecto almacenado, no del modelo principal, lo que afecta a la reproducibilidad de la voz.
- Riesgo de alucinacion: no evaluable en este estado, ya que no hay modelo entrenado que genere salidas.
- Licencia: MIT, permisiva para uso comercial en lo que respecta a este repositorio, pero el codec externo puede tener condiciones propias que deben revisarse por separado.
- Validacion limitada: la arquitectura solo se ha comprobado con pruebas de formas, perdida finita, serializacion y decodificacion con cache.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beleata74/MioTTS-BG-EN-64M-Architecture
- Codec externo MioCodec 25 Hz / 44.1 kHz v2: https://huggingface.co/Aratako/MioCodec-25Hz-44.1kHz-v2
- Visor de arquitectura HF Viewer: https://hfviewer.com/beleata74/MioTTS-BG-EN-64M-Architecture

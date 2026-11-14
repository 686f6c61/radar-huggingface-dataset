# mmmhusto/TTS-English

## Resumen

TTS-English es un modelo de síntesis de voz (text-to-speech) multi-locutor para inglés, desarrollado por el usuario mmmhusto y entrenado desde cero. Convierte fonemas ARPAbet en forma de onda de audio a 24 kHz y ofrece 590 voces distintas. El modelo lo forman un modelo acústico propio de 42,0 M de parámetros (el contenido de este repositorio) y un vocoder BigVGAN base de NVIDIA de 14,0 M que no ha sido reentrenado, lo que suma un total de 56,0 M de parámetros. Para contextualizar, Kokoro, el modelo abierto con el que el autor se compara, tiene 82 M.

La arquitectura combina un codificador de texto transformer con posiciones rotatorias, un decodificador diffusion transformer entrenado con flow matching condicional y un cabezal de duraciones basado también en flow matching. El alineamiento se aprende mediante búsqueda de alineamiento monótono durante el entrenamiento, sin necesidad de un alineador externo. El modelo se entrenó exclusivamente con voz de audiolibros en inglés procedente de LibriTTS-R y HiFi-TTS, ambas con licencia CC BY 4.0.

El autor es explícito sobre el estado del modelo: en métricas automáticas queda a la altura de Kokoro, pero en escucha subjetiva del propio autor está claramente por debajo, en torno a un 40 % peor. Es relevante como pieza de referencia por su tamano reducido (0,2 GB de repositorio), su licencia permisiva CC BY 4.0 y su implementación completa en unas 250 líneas de PyTorch plano, lo que lo convierte en un caso de estudio útil para quienes quieran entender o replicar un pipeline TTS moderno de principio a fin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (6 capas, 256 de anchura, posiciones rotatorias) + decodificador diffusion transformer (10 capas, 512 de anchura, adaptive layer norm) entrenado con flow matching condicional + cabezal de duraciones con flow matching; vocoder BigVGAN base externo |
| Parametros totales | 41.965.706 en el modelo acústico de este repositorio; 56,0 M contando el vocoder BigVGAN base (14,0 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS; la longitud viene limitada por el texto de entrada y las duraciones predichas por fonema, no por una ventana de contexto declarada) |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (en) exclusivamente |
| Licencia | CC BY 4.0 |
| Formato de pesos | Safetensors (librería pytorch); el vocoder BigVGAN se descarga por separado desde el Hub |

## Arquitectura y entrenamiento

El modelo se divide en cuatro piezas. El codificador de texto son seis capas transformer pre-norm de 256 dimensiones con posiciones rotatorias que procesan fonemas ARPAbet obtenidos con g2p_en; además predice un mel grueso por fonema que sirve para el alineamiento. El alineamiento se aprende con búsqueda de alineamiento monótono durante el entrenamiento, sin alineador externo. El cabezal de duraciones (versión 2.1) es un pequeno módulo de flow matching que muestrea la longitud de cada fonema y pausa; sustituye a una regresión en dominio logarítmico que predecía la media geométrica y que, en clips de validación, acortaba el habla un 14 % respecto a los datos y las pausas de final de frase un 36 %. La regresión se conserva como respaldo determinista cuando `dur_temperature=None`. El decodificador es un diffusion transformer de 10 capas y 512 de anchura, con adaptive layer norm condicionada por tiempo y locutor, entrenado con flow matching condicional, que lee los estados completos del codificador y no el mel por fonema. En la versión 2.1, cada frame recibe además su posición dentro del fonema y la longitud de este. El texto se descarta en el 10 % de los clips de entrenamiento para permitir classifier-free guidance (1,5 por defecto). El vocoder es BigVGAN base de 14 M, con el mismo formato mel de 100 bandas a 24 kHz que el BigVGAN-v2 de 112 M usado para calcular las características. Los pesos exportados son una media móvil exponencial de los pesos de entrenamiento.

Los datos proceden de LibriTTS-R (habla de audiolibros restaurada a 24 kHz) y HiFi-TTS (audiolibros de estudio de 10 lectores, remuestreados a 24 kHz), ambas CC BY 4.0. Las características (meles, fonemas y una puntuación de calidad por cada 12.º clip) están publicadas como mmmhusto/sktts-en-features: 455 183 clips y 525 horas. El subconjunto de entrenamiento son el 60 % de locutores con mejor sonido según la estimación SQUIM SI-SDR, lo que deja 590 voces y 219 832 clips. Cada clip se nivela a la misma sonoridad antes del mel. El modelo no vio otros datos ni datos en otros idiomas. El entrenamiento se hizo en una AMD MI300X: la ejecución v2-en (25 000 pasos desde cero), la v2-en-long (+50 000 pasos con schedule coseno, EMA 0,9999 y lotes de 160 k frames, 6,3 h) y la v2.1 actual (+20 000 pasos desde el paso 50 000 de la anterior, con posición de fonema, duraciones muestreadas y tiempos de flow uniformes al 20 %, 2,7 h). Se usó Adam, bf16, lotes agrupados por longitud con formas fijas (MIOpen replanifica cada forma nueva), calentamiento de learning rate y clipping de gradiente a 5. La última ejecución v2-en-long se detuvo en el paso 50 000 de 55 000 porque la pérdida de validación dejó de moverse (1,5717 en 40 k, 1,5685 en 50 k).

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de forma de onda a 24 kHz.
- Multi-locutor: 590 voces identificadas como `en_<LibriTTS speaker id>` y `en_hifi_<reader>_<clean|other>`.
- Entrada basada en fonemas ARPAbet mediante g2p_en, lo que permite control de pronunciación a nivel fonético.
- Control de la entrega mediante argumentos de palabra clave que sobrescriben `config.json`: `guidance`, `length_scale`, `pause_scale`, `temperature`, `dur_temperature` y `n_timesteps`.
- Variación de rendition entre llamadas: con `seed=None` se obtiene una interpretación distinta en cada invocación.
- Muestreo con classifier-free guidance (1,5 por defecto), que según el autor hace el habla más clara y la pronunciación más exacta.
- Duraciones muestreadas por flow matching, con respaldo determinista por regresión logarítmica.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Audiolibros y narración de contenido largo: el modelo está entrenado sobre voz de audiolibros de LibriTTS-R y HiFi-TTS, y sus 590 voces permiten asignar voces distintas a capítulos o personajes; el control de `pause_scale` ajusta las pausas de final de frase, que es precisamente donde el autor detectó el sesgo de acortamiento en la versión anterior.
- Lectura de artículos y documentos en inglés: el pipeline fonema-a-onda con g2p_en permite sintetizar texto arbitrario en inglés con una latencia controlable mediante `n_timesteps`, útil para lectores de pantalla y accesibilidad.
- Generación de voces para prototipos de videojuegos y personajes: las 590 voces y la variación de rendition con `seed=None` permiten producir líneas de diálogo distintas sin depender de un servicio externo, con un repositorio de solo 0,2 GB.
- Investigación y docencia en síntesis de voz: al estar implementado en unas 250 líneas de PyTorch plano en `tts_english/model.py`, sin código vendorizado, sirve para estudiar alineamiento monótono, flow matching y diffusion transformers en TTS de forma directa.
- Evaluación comparativa de vocoders y datos: el autor usa el modelo como banco de pruebas para aislar si la brecha de calidad frente a Kokoro viene del modelo acústico, de los datos de audiolibro o del vocoder, lo que lo hace útil para experimentos controlados de ablation.
- Generación de datos de audio sintético para tareas posteriores: al ser CC BY 4.0, las muestras generadas pueden usarse para aumentar datasets de reconocimiento de voz o de evaluación de sistemas TTS en inglés.
- Previsualización de pronunciación en herramientas de idiomas: el control fonémico vía ARPAbet permite comprobar cómo suena una palabra o frase concreta antes de integrarla en un producto.

## Benchmarks y rendimiento

La model card describe la evaluación sobre las mismas 30 frases en inglés en 3 voces (90 clips), con la entrega por defecto de cada sistema. Las métricas empleadas son errores de palabra reales (transcripción con Whisper small.en, descartando lo que el evaluador falla en todos los sistemas), PESQ y SI-SDR sin referencia estimados con torchaudio SQUIM, y medidas de ritmo, pausas y dispersión de tono. Sin embargo, la información proporcionada se corta en la descripción de la metodología y no incluye los valores numéricos de la tabla comparativa con Kokoro.

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor afirma cualitativamente que en métricas automáticas el modelo está a la altura de Kokoro, pero que en escucha propia está claramente por debajo, en torno a un 40 % peor, y advierte que las medidas usadas no capturan lo que oye el oído, por lo que deben tratarse como un suelo y no como un veredicto.

## Requisitos de hardware

- El modelo acústico son 41,97 M de parámetros y el repositorio completo ocupa 0,2 GB; con el vocoder BigVGAN base (14,0 M) el total es de 56,0 M, por lo que cabe holgadamente en cualquier GPU consumer.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano de los pesos, en fp32 el conjunto ronda 0,22 GB y en bf16 unos 0,11 GB, a lo que hay que sumar activaciones y el vocoder.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB libres es suficiente; no se documentan requisitos mínimos oficiales. El entrenamiento se hizo en una AMD MI300X, pero para inferencia no se necesita hardware de ese nivel.
- Cabe en GPU consumer: sí, en cualquier RTX 4090, RTX 3090, RTX 4060 o similar, y presumiblemente en GPUs integradas.
- Opciones de despliegue: el pipeline oficial es PyTorch con `tts_english.TTS.from_pretrained`, `g2p_en`, `soundfile` y `safetensors`, más el código de BigVGAN clonado desde GitHub y sus pesos desde el Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: con 10 pasos de solver y classifier-free guidance son 20 pasadas del decodificador. En CPU de portátil es aproximadamente el doble de lento que tiempo real; en GPU es bastante más rápido que tiempo real. No se publican cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| mmmhusto/TTS-English | 42,0 M (56,0 M con vocoder) | No disponible | en | CC BY 4.0 | Hugging Face, 0 descargas, 0 likes | Métricas automáticas a la altura de Kokoro según el autor; escucha subjetiva ~40 % peor |
| Kokoro | 82 M | No disponible | No disponible en la información | No disponible en la información | No disponible en la información | Referencia de comparación citada por el autor |
| BigVGAN base (vocoder) | 14,0 M | No aplica | No disponible en la información | MIT | GitHub NVIDIA/BigVGAN y Hub | Componente del pipeline; no reentrenado |

No se dispone en la información proporcionada de datos suficientes para comparar parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- Calidad subjetiva por debajo de Kokoro: el propio autor estima que suena en torno a un 40 % peor en escucha, pese a que las métricas automáticas lo sitúan a la altura; no debe interpretarse la paridad en métricas como paridad perceptual.
- El origen de la brecha de calidad (modelo acústico, datos de audiolibro o vocoder) sigue en pruebas, según el autor.
- Sesgos de datos: entrenado solo con voz de audiolibros en inglés de LibriTTS-R y HiFi-TTS, lo que puede limitar la naturalidad en registros conversacionales, acentos no estadounidenses o estilos fuera del dominio de audiolibro.
- Sesgo de duraciones: la versión anterior acortaba el habla un 14 % y las pausas finales un 36 %; la v2.1 lo corrige con duraciones muestreadas, pero el respaldo determinista (`dur_temperature=None`) conserva el comportamiento de la regresión logarítmica.
- Monolingüe: solo inglés; no se entrenó con datos en otros idiomas.
- Riesgo de alucinación y errores de pronunciación: al depender de g2p_en para convertir texto a fonemas, palabras ambiguas, nombres propios, siglas y números pueden pronunciarse de forma incorrecta; el autor menciona ejemplos de errores del evaluador como "seashells" por "sea shells" o "14" por "14th".
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige citar al autor y la licencia; conviene revisar también la licencia MIT del vocoder BigVGAN y las condiciones de los datasets de origen.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 14 de noviembre de 2026; es un modelo experimental, no un sistema listo para producción.
- Sin cuantizaciones publicadas ni integraciones con servidores de inferencia de alto rendimiento; el despliegue requiere montar manualmente PyTorch, g2p_en, los datos NLTK y el código de BigVGAN.
- No se documentan salvaguardas, filtros de contenido ni mecanismos de detección de voz sintética; su uso para suplantación de identidad o desinformación no está restringido técnicamente por el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-English
- Dataset de características: https://huggingface.co/datasets/mmmhusto/sktts-en-features
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
- Dataset HiFi-TTS: https://huggingface.co/datasets/MikhailT/hifi-tts
- Código del vocoder BigVGAN: https://github.com/NVIDIA/BigVGAN

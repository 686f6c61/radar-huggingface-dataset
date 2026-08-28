# ldov/acestep-full-clone

## Resumen

`ldov/acestep-full-clone` es un repositorio que proporciona pesos pre-cuantizados en formato GGUF del modelo ACE-Step 1.5, un sistema de generación de música texto-a-música de código abierto desarrollado originalmente por ACE Studio y StepFun. Esta implementación, denominada `acestep.cpp`, es una portabilidad independiente en C++17 sobre GGML que permite ejecutar el modelo completo en CPU, CUDA, Metal y Vulkan, sin depender del stack de Python original.

El sistema es multi-modelo: un LM causal basado en Qwen3 (disponible en tamaños de 0.6B, 1.7B y 4B) genera códigos de audio a 5 Hz, un transformer de difusión con flow matching (DiT, en versiones de 2B y 4B XL) sintetiza los detalles de alta frecuencia a 25 Hz, y un VAE decodifica las latencias a audio estéreo de 48 kHz. Todo el pipeline está co-entrenado sobre los mismos datos musicales, lo que permite una generación coherente y controlable. La relevancia actual radica en que acerca la generación de música de calidad comercial a hardware de consumo, con licencia MIT y soporte multilingüe (10 idiomas), manteniendo tiempos de generación inferiores a 2 segundos por canción en una A100 y a 10 segundos en una RTX 3090 según el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-modelo: LM causal (Qwen3) + DiT (flow matching) + VAE + text encoder |
| Parametros totales | No disponible (sistema multi-modelo; LM de 0.6B/1.7B/4B, DiT de 2B/4B, VAE y text encoder; el dato de 662.884.352 corresponde a un componente individual) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (Q4_K_M solo para DiT; el LM 4B no admite Q4_K_M) |
| Idiomas soportados | en, fr, zh, ja, ko, de, es, it, pt, ru |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio original) |

## Arquitectura y entrenamiento

El sistema sigue un pipeline en dos etapas. La primera etapa usa un LM causal (variantes de Qwen3 de 0.6B, 1.7B y 4B) que opera a 5 Hz: cada token representa 200 ms de música dentro de un vocabulario de 64 000 códigos aprendidos. Este LM construye la estructura musical global de forma autoregresiva, generando metadatos, letras y códigos de audio. La segunda etapa emplea un DiT (diffusion transformer) con flow matching y pasos de Euler, que trabaja a 25 Hz (un frame cada 40 ms) para renderizar el timbre, los transitorios, la articulación vocal y la imagen estéreo. Finalmente, un VAE decodifica las latencias a audio WAV de 48 kHz. El LM y el DiT fueron co-entrenados sobre los mismos datos musicales, lo que garantiza coherencia entre la estructura global y los detalles finos. El text encoder es un Qwen3-Embedding-0.6B congelado, cuya proyección (1024 a 2048 dimensiones) está integrada en cada checkpoint del DiT, por lo que queda arquitectónicamente fijado a ese tamaño. El repositorio ofrece varias variantes del DiT: turbo (8 pasos), sft (32-50 pasos), base (32-50 pasos), sftturbo50 (mezcla de pesos que combina riqueza del SFT con pocos pasos) y versiones con desplazamiento de tiempo (shift1, shift3, continuous). No se especifican los datos de entrenamiento ni el número total de tokens utilizados.

## Capacidades

- Generacion de musica completa a partir de una descripcion textual (caption) y letras opcionales, produciendo audio estereo de 48 kHz.
- Modo cover: permite reversionar una cancion existente usando audio de referencia como condicionamiento de timbre y contexto.
- Soporte de batching para generacion paralela de multiples pistas.
- Ejecucion multiplataforma: CPU, CUDA, Metal y Vulkan mediante la implementacion C++/GGML.
- Variedad de cuantizaciones (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) que permiten ajustar el equilibrio entre calidad y consumo de recursos.
- Capacidades multilingues en 10 idiomas (ingles, frances, chino, japones, coreano, aleman, espanol, italiano, portugues y ruso).
- Modos de inferencia flexibles: servidor con interfaz web integrada (ace-server) o herramientas de linea de comandos (ace-lm y ace-synth).
- Generacion de letras y metadatos de forma automatica a partir del caption gracias al LM.

## Casos de uso

- Produccion musical independiente: compositores y productores pueden generar demos completas con letras en cuestion de segundos, explorando rapidamente ideas melódicas y armonicas antes de refinar en un DAW. La generacion a 48 kHz estereo y la coherencia estructural del modelo lo hacen adecuado para maquetas de alta fidelidad.
- Bandas sonoras para videojuegos y audiovisuales: desarrolladores independientes pueden crear musica ambiental o tematica sin necesidad de un compositor, usando el modo turbo para iterar rapidamente sobre distintas variaciones y el modo cover para adaptar temas existentes.
- Educacion musical: profesores y estudiantes pueden usar el modelo como herramienta pedagogica para analizar estructuras musicales generadas, experimentar con diferentes estilos y entender conceptos de composicion a traves de ejemplos audibles.
- Contenido para redes sociales y marketing: creadores de contenido pueden generar musica de fondo personalizada para videos, podcasts o anuncios, evitando problemas de derechos de autor y adaptando la letra al mensaje deseado.
- Prototipado de canciones para artistas: cantautores pueden introducir una letra y una descripcion del estilo para obtener una base musical sobre la que trabajar, acelerando el proceso creativo y permitiendo explorar multiples arreglos.
- Accesibilidad musical: personas sin formacion tecnica pueden crear musica original describiendo lo que quieren, democratizando la creacion musical y facilitando la expresion artistica en entornos educativos o terapeuticos.
- Reversion de canciones (cover): el modo cover permite tomar una cancion existente y generar una nueva version con diferente timbre o estilo, util para tributos, remezclas o adaptaciones a otros generos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio original de ACE-Step 1.5 afirma que el modelo alcanza una calidad superior a la mayoria de los modelos comerciales de generacion de musica y que genera una cancion completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, pero no se proporcionan metricas numericas concretas (como FAD, CLAP score u otras) en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada: el conjunto completo en cuantizacion Q8_0 (LM 4B + DiT 2B + VAE + text encoder) ocupa aproximadamente 7,7 GB, por lo que cabe en GPUs consumer con 8 GB o mas. Con cuantizaciones mas agresivas (Q4_K_M para el DiT) el consumo se reduce a unos 5-6 GB.
- GPUs recomendadas: RTX 3090 o superior para tiempos de generacion inferiores a 10 segundos por cancion; A100 o H100 para latencias por debajo de 2 segundos. Tambien es posible ejecutar en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 8 GB de VRAM para la configuracion Q8_0. Con cuantizaciones mas bajas, puede funcionar en GPUs de 6 GB.
- Opciones de despliegue: servidor integrado (ace-server) con interfaz web, herramientas CLI (ace-lm y ace-synth), o integracion en aplicaciones C++ mediante la biblioteca GGML. No es compatible directamente con vLLM, Ollama o TGI al ser un sistema especifico de generacion de audio.
- Latencia y throughput: segun el repositorio original, menos de 2 segundos por cancion en A100 y menos de 10 segundos en RTX 3090. El batching permite generar multiples pistas en paralelo, mejorando el throughput.

## Comparativa con modelos similares

No se dispone de comparativas numericas en la informacion proporcionada. ACE-Step v1.5 afirma superar a la mayoria de los modelos comerciales de generacion de musica en calidad, pero no se aportan metricas concretas frente a alternativas como MusicGen (Meta), Stable Audio o Jukebox. Como referencia cualitativa, ACE-Step 1.5 se diferencia por su arquitectura hibrida (LM + DiT + VAE), su velocidad (inferior a 2 segundos en A100) y su licencia MIT, mientras que MusicGen es un modelo autoregresivo de codigo abierto con licencia CC-BY-NC (no comercial) y Stable Audio ofrece un servicio comercial con pesos propietarios. La comparativa cuantitativa no esta disponible en los materiales consultados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo generativo, puede producir contenido musical o letras que no se correspondan con la descripcion solicitada, especialmente con prompts ambiguos o fuera de su distribucion de entrenamiento.
- Riesgo de alucinacion: el LM puede generar codigos de audio que resulten en artefactos o fragmentos incoherentes, sobre todo con cuantizaciones agresivas. El repositorio advierte que el LM 4B no admite Q4_K_M porque rompe la generacion de codigos de audio.
- Limitaciones de idioma: aunque soporta 10 idiomas, la calidad puede variar entre ellos; los idiomas con menos representacion en el entrenamiento pueden producir resultados menos coherentes.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero los pesos originales pertenecen a ACE Studio y StepFun, que tambien los publican bajo MIT. No hay restricciones adicionales conocidas.
- Dependencia de la implementacion: el modelo requiere la herramienta `acestep.cpp` para funcionar; no es un modelo standalone que pueda cargarse con bibliotecas estandar de transformers. Esto limita su integracion en pipelines existentes.
- Requisitos de almacenamiento: el repositorio completo ocupa 220,7 GB (incluyendo todas las cuantizaciones y variantes); descargar solo los archivos necesarios para una configuracion especifica es recomendable para ahorrar espacio.
- Complejidad de uso: el pipeline de dos etapas (LM + DiT) requiere comprender la interaccion entre componentes y los parametros de inferencia (pasos, temperatura, etc.) para obtener resultados optimos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ldov/acestep-full-clone
- Codigo fuente de acestep.cpp: https://github.com/ServeurpersoCom/acestep.cpp
- Repositorio original ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Paper de ACE-Step (arXiv): https://arxiv.org/abs/2506.00045
- Pagina del proyecto ACE-Step: https://ace-step.github.io/
- Guia para musicos: https://github.com/ace-step/ACE-Step-1.5/discussions/235
- Tutorial de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/Tutorial.md

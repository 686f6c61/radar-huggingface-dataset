# shanleiguang/ace-step-1.5-mlx-8bit

## Resumen

ACE-Step 1.5 turbo — MLX 8-bit es una conversion de pesos del modelo de generacion musical ACE-Step 1.5, publicada por el usuario shanleiguang, para ejecutarse de forma nativa en Apple silicon e iOS mediante el framework MLX. El modelo original pertenece a la organizacion ACE-Step y esta disenado para transformar un prompt de texto y, opcionalmente, una letra en musica estereo a 48 kHz. Esta version concreta no es un modelo nuevo, sino una distribucion de pesos cuantizados a 8 bits lista para inferencia on-device.

La relevancia de esta publicacion radica en que permite ejecutar un sistema de generacion musical completo en hardware de consumo Apple, sin GPU dedicada. El repositorio ocupa 2,5 GB e incluye el transformer de difusion (1,58 B parametros), el proyector de texto y codificador de letras, el decodificador de audio Oobleck, un detokenizador de codigos de audio, el text encoder Qwen3-Embedding-0.6B y un modelo de lenguaje opcional de 5 Hz para generar voces.

La informacion disponible proviene unicamente de la model card del autor y de los metadatos de Hugging Face. No se han publicado datos de benchmarks, licencia explicita en los metadatos ni idiomas soportados; la model card menciona licencia MIT en el texto, pero el campo de licencia del repositorio aparece como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de audio, con VAE decodificador Oobleck y LM auxiliar de 5 Hz |
| Parametros totales | Aproximadamente 1,58 B en el DiT; el conjunto completo no se especifica, pero el repo pesa 2,5 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits para DiT, cond, textenc y lm; fp16 para el VAE |
| Idiomas soportados | No disponible |
| Licencia | MIT segun la model card; campo de licencia del repo no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion con un transformer (DiT) de 1,58 B parametros que genera latentes de audio a partir de un prompt de texto y, opcionalmente, letras. Un modelo de lenguaje de 5 Hz planifica la cancion y produce los codigos de audio que transportan las voces; un detokenizador convierte esos codigos en pistas de 25 Hz, y un VAE Oobleck decodifica el resultado a audio estereo de 48 kHz. El text encoder es Qwen3-Embedding-0.6B.

La variante turbo esta destilada sin classifier-free guidance (CFG), por lo que genera audio en 8 pasos de difusion. La model card indica que los nombres de capas siguen los modulos PyTorch originales, con kernels de convolucion transpuestos y weight-normalisation plegada. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de musica a partir de texto (text2music) con salida estereo a 48 kHz.
- Generacion de voces a partir de letras cuando se incluye el modelo LM opcional (`lm/`).
- Generacion instrumental sin el modulo LM.
- Planificacion de la estructura de la cancion mediante el LM de 5 Hz.
- Inferencia on-device en Apple silicon e iOS mediante MLX.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Generacion de musica instrumental en dispositivos Apple: la aplicacion Clutcha (iMLXApp) permite crear pistas instrumentales cargando `config.json` y los siete archivos core, sin necesidad de GPU dedicada.
- Creacion de canciones con voces en iOS o macOS: anadiendo el subdirectorio `lm/` (911 MB) se habilita la sintesis vocal a partir de letras, adecuada para maquetas rapidas.
- Prototipado de bandas sonoras: con 8 pasos de difusion y sin CFG, la generacion es rapida (180 s de audio en 90 s en un M4 Max), lo que permite iterar sobre variaciones de un tema.
- Herramientas creativas para musicos: integracion en apps de escritorio o moviles que necesiten generar acompanamiento musical a partir de una descripcion textual.
- Investigacion en generacion de audio: el formato MLX y la estructura de pesos permiten estudiar el comportamiento del DiT y del LM auxiliar en hardware de consumo.
- Demos y pruebas de concepto offline: al ejecutarse localmente, no requiere conexion a servicios en la nube ni envio de prompts a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta un dato de rendimiento practico: 180 segundos de audio generados en 90 segundos de extremo a extremo en un Apple M4 Max, con un pico de memoria de aproximadamente 3,0 GB.

## Requisitos de hardware

- Memoria pico estimada: aproximadamente 3,0 GB durante la inferencia.
- Tamano total del modelo: aproximadamente 3,9 GB (core de 3,0 GB mas LM vocal de 0,9 GB).
- Hardware objetivo: Apple silicon (M-series) e iOS; la model card cita un M4 Max como referencia.
- No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Despliegue: MLX de forma directa o mediante la app Clutcha (iMLXApp); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 90 s para 180 s de audio en M4 Max; no se dispone de datos de throughput para otros chips.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de generacion musical ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La licencia MIT se menciona en la model card, pero el campo de licencia del repositorio aparece como no disponible; conviene verificar `LICENSE` y `NOTICE` antes de uso comercial.
- Es una conversion de pesos, no un modelo entrenado por el autor del repositorio; la calidad depende del modelo original ACE-Step 1.5.
- Requiere mantener la estructura de directorios exacta (`textenc/` y `lm/` como subdirectorios, `config.json` en la raiz); aplanarla rompe la descarga.
- El modulo de voces es opcional y pesa 911 MB adicionales; sin el, solo se genera musica instrumental.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de idioma.
- Solo esta pensado para MLX en Apple silicon/iOS; no hay soporte documentado para otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shanleiguang/ace-step-1.5-mlx-8bit
- Modelo original ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5

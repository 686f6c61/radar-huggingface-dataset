# scragnog/HeartMuLa-GGUF

## Resumen

HeartMuLa-GGUF es un repositorio de conversiones a formato GGUF de la familia de modelos HeartMuLa, desarrollada por el equipo HeartMuLa y publicada por el usuario scragnog. Se trata de un sistema de generación de audio musical a partir de texto (text-to-audio) que combina un modelo de lenguaje de aproximadamente 1.487 millones de parámetros con un códec de audio neuronal (HeartCodec) para producir piezas musicales de hasta 240 segundos de duración.

El repositorio no es un modelo único, sino un conjunto de componentes empaquetados para inferencia nativa en C++/GGML mediante el runtime HOT-Step: un LM global, un LM local, el flujo del códec, el decodificador de forma de onda, el módulo RVQ, el tokenizador y un paquete opcional de codificadores de audio. La conversión a GGUF reduce la precisión de almacenamiento y divide los componentes, lo que permite ejecutar el modelo sin depender de Python en tiempo de inferencia.

Su relevancia radica en que ofrece 18 niveles de cuantización por componente del LM (desde F16 hasta IQ1_S, incluyendo MXFP4 y NVFP4), lo que facilita el despliegue en hardware con memoria limitada y democratiza el acceso a un sistema de generación musical que, en su formato original, requiere más recursos. El repositorio incluye además dos archivos de MuLaCover, un modelo de generación de versiones musicales, con licencia distinta (CC BY-NC 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: LM global + LM local + codec neuronal (HeartCodec) con flujo y decodificador escalar; inferencia nativa C++/GGML |
| Parametros totales | 1.487.183.360 (dato safetensors del repo) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, IQ3_XXS, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S, MXFP4, NVFP4 (LM global y local); codec: F16/Q8_0 en flujo, F16 en decodificador escalar, F32 en RVQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (salvo los archivos MuLaCover, bajo CC BY-NC 4.0) |
| Formato de pesos | GGUF (split en componentes global/local); safetensors en los modelos base originales |

## Arquitectura y entrenamiento

El sistema HeartMuLa se articula en torno a dos modelos de lenguaje (global y local) que trabajan conjuntamente con HeartCodec, un códec neuronal de audio que incluye un flujo de generación, un decodificador escalar de forma de onda y un módulo RVQ (residual vector quantization) compartido entre generación y codificación. El repositorio GGUF convierte y divide estos componentes para su ejecución nativa en HOT-Step, un runtime C++/GGML que no requiere Python en inferencia. Las variantes del LM incluyen la base de 3B, una versión "happy-new-year" y una versión entrenada con RL (HeartMuLa-RL-oss-3B-20260123), lo que sugiere un proceso de ajuste por refuerzo sobre el modelo base, aunque no se detallan en la información disponible los datos de entrenamiento, el número de tokens ni la composición del dataset.

La conversión a GGUF modifica la disposición de los tensores, divide los componentes y reduce la precisión de almacenamiento; para las cuantizaciones K/IQ/FP4 del LM se utiliza una matriz de importancia separada por variante. El decodificador escalar no dispone de matrices 2D cuantizables, por lo que se mantiene en F16, y el módulo RVQ permanece en F32. La inferencia nativa no necesita el paquete opcional de codificadores (muencoder, wavlm, whisper, query) para la generación de texto a audio; ese paquete solo se emplea para codificación de audio.

## Capacidades

- Generación de audio musical a partir de texto: acepta etiquetas musicales concisas y letras para producir piezas de hasta 240 segundos.
- Tres variantes de modelo de lenguaje: base, "happy-new-year" y RL, con pesos globales y locales emparejados por variante.
- Múltiples niveles de cuantización para ajustar precisión y memoria: desde F16 de referencia hasta IQ1_S experimental, pasando por Q8_0, Q4_K_M, IQ4_XS, MXFP4 y NVFP4.
- Inferencia nativa en C++/GGML mediante HOT-Step, sin dependencia de Python en tiempo de ejecución.
- Codificación de audio opcional mediante el paquete de codificadores (muencoder, wavlm, whisper, query), no cargado en generación de texto.
- Generación de versiones musicales (cover) mediante los archivos MuLaCover, con licencia CC BY-NC 4.0.
- Soporte de duración configurable hasta 240 segundos.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Producción musical asistida: un compositor introduce etiquetas de género, instrumentación y estado de ánimo junto con una letra, y el modelo genera una maqueta de hasta 240 segundos que sirve como punto de partida para arreglos posteriores.
- Creación de bandas sonoras para vídeo y juegos: integración del runtime HOT-Step en herramientas de edición para generar fragmentos musicales ajustados a la duración de una escena, con la ventaja de no requerir Python en el pipeline.
- Prototipado rápido de ideas musicales: el uso de cuantizaciones Q8_0 o Q4_K_M permite iterar en estaciones de trabajo con GPU de consumo, generando múltiples variantes a partir de las mismas etiquetas y letras.
- Despliegue en entornos con memoria limitada: las cuantizaciones IQ2/IQ1 y MXFP4/NVFP4 posibilitan ejecutar el LM en hardware con VRAM reducida, a costa de precisión, para aplicaciones de demostración o educativas.
- Generación de versiones musicales (covers): los archivos MuLaCover permiten crear adaptaciones de una pieza existente, siempre que el uso sea no comercial salvo licencia expresa de MuLa Labs.
- Investigación en generación musical: el repositorio ofrece componentes separados y cuantizados que facilitan experimentos de ablación sobre precisión, variantes del LM y configuración del códec.
- Integración en aplicaciones de audio interactivas: gracias a la inferencia nativa C++/GGML, el sistema puede embeberse en aplicaciones de escritorio o servidores ligeros que generen música bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 159,0 GB, pero esa cifra incluye todas las variantes y niveles de cuantización; la carga en memoria depende del pack elegido (global + local + códec + tokenizador).
- GPU recomendadas: no disponible. La model card sugiere empezar con el pack Q8_0 de generación o usar F16 como referencia si la memoria lo permite.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Las cuantizaciones bajas (Q4_K_M, IQ2_XS, IQ1_S) están pensadas para reducir memoria, pero no se especifican requisitos mínimos.
- Opciones de despliegue: runtime nativo HOT-Step (C++/GGML) mediante el Model Manager; los componentes se instalan en `models/heartmula/` dentro de la carpeta de datos de HOT-Step.
- Latencia y throughput: no disponibles.
- Nota: IQ1_S produjo clipping en una validación con semilla fija, por lo que se considera una opción experimental de memoria.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de generación musical texto-a-audio que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El texto largo o en prosa en el campo de etiquetas puede producir resultados pobres, incluso en el modelo original; se recomiendan etiquetas musicales concisas.
- IQ1_S es una opción experimental: produjo clipping en una validación con semilla fija.
- No se declara una clasificación de calidad de audio entre variantes del modelo; la elección de variante y cuantización queda a criterio del usuario.
- Los archivos MuLaCover no están cubiertos por Apache 2.0: usan CC BY-NC 4.0 y restringen las salidas generadas a uso no comercial; el uso comercial requiere licencia de MuLa Labs.
- La conversión a GGUF altera la disposición de tensores y reduce la precisión, por lo que los resultados pueden diferir de los modelos originales en safetensors.
- El paquete de codificadores de audio es opcional y solo se usa para codificación; los archivos Q8_0 de codificadores y el codificador escalar separado no están incluidos en el inventario de staging.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos específicos de alucinación en la información disponible.
- Es necesario conservar la licencia y atribución originales al redistribuir los archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/scragnog/HeartMuLa-GGUF
- Modelo base 3B: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Variante happy-new-year 3B: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Variante RL 3B: https://huggingface.co/HeartMuLa/HeartMuLa-RL-oss-3B-20260123
- HeartCodec: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Tokenizador y configuración de generación: https://huggingface.co/HeartMuLa/HeartMuLaGen
- Implementación original: https://github.com/HeartMuLa/heartlib
- MuLaCover (modelo): https://huggingface.co/HeartMuLa/MuLaCover
- MuLaCover (repositorio): https://github.com/HeartMuLa/MuLaCover
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/legalcode

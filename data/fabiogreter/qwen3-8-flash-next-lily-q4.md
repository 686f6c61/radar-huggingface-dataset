# fabiogreter/Qwen3.8-Flash-Next-lily-q4

## Resumen

`fabiogreter/Qwen3.8-Flash-Next-lily-q4` es una conversión a 4 bits del modelo multimodal `Qwen/Qwen3.8-Flash-Next` (revisión `f5d0827`), publicada por el usuario fabiogreter en formato de checkpoint propietario denominado `qwen4_exp-affine-v1`. No es un modelo nuevo ni un ajuste fino: es una cuantización de 30.204.847.424 parámetros pensada para ejecutarse en un único Mac con Apple Silicon y 128 GB de memoria unificada, mediante el servidor de inferencia `lily-qwen3.8-flash-next` escrito en Rust y basado en Metal 4.

El modelo conserva la arquitectura del original: 48 capas con atención completa cada cuarta capa y una red delta con compuertas (gated delta net) entre medias, mezcla de expertos con 512 expertos y 10 activos por token, 24 cabezas de consulta sobre 2 cabezas clave-valor, tamaño oculto de 2.560, vocabulario de 248.320 tokens y 262.144 posiciones de contexto. Además conserva dos componentes poco habituales: una torre de visión en bf16 sin cuantizar, que permite enviar imágenes PNG o JPEG en peticiones de chat, y una cabeza de predicción multi-token cuantizada que se usa para decodificación especulativa.

Su relevancia es acotada pero específica: demuestra un pipeline de cuantización por módulo (4 bits en la mayoría de pesos, 8 bits en enrutadores de expertos e indexadores de atención) y una ruta de despliegue local para un modelo de 30.000 millones de parámetros con visión y contexto de 262.144 tokens en hardware de consumo de Apple. La contrapartida es que los pesos solo cargan en el servidor lily, no en Transformers, vLLM, SGLang, MLX ni llama.cpp, y que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE), atención completa cada 4 capas y gated delta net entre medias; incluye cabeza de predicción multi-token y torre de visión |
| Parametros totales | 30.204.847.424 |
| Parametros activos | no disponible como cifra; 10 de 512 expertos activos por token |
| Longitud de contexto | 262.144 posiciones |
| Tipos de cuantizacion | Afina por módulo: 4 bits con grupo 64 (expertos, atención, embeddings, cabeza de borrador); 4 bits con grupo 32 (tablas de embeddings de n-gramas); 8 bits con grupo 64 (compuertas MoE, compuerta del experto compartido, mezclas de entrada de hiperconexión, block inject, proyecciones clave/valor de n-gramas e indexador de atención); torre de visión en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`, con `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors con diseño de tensores propietario `qwen4_exp-affine-v1`; 56 archivos safetensors (54 del modelo, 1 de la cabeza de borrador, 1 de la torre de visión), 3.842 tensores en total, 98 GiB en disco, 105,5 GB de repositorio |

Otros datos de interés: revisión de origen `f5d08274bafd880402bd16f5e3e6c514136ec06c`, 16 tablas hash de embeddings de n-gramas con 320.001.536 filas en total, y torre de visión de 0,9 GB (333 tensores) frente a 78 tensores de la cabeza de borrador.

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo de origen. Son 48 capas con un patrón híbrido: atención completa cada cuarta capa y una gated delta net en las capas intermedias, lo que reduce el coste de las secuencias largas manteniendo capas de atención densa periódicas. El bloque de mezcla de expertos usa 512 expertos con 10 activos por token sobre un tamaño oculto de 2.560 y 24 cabezas de consulta sobre 2 cabezas clave-valor. Se mencionan además componentes de hiperconexión (hyper-connection input mixes, block inject) y un proyector indexador de atención dispersa. El vocabulario es de 248.320 tokens y el modelo admite 262.144 posiciones.

Sobre el entrenamiento no hay información en la documentación disponible: no se indican número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí se documenta es el proceso de conversión, que es determinista (misma revisión de origen y mismo conversor producen los mismos fragmentos) y se aplica por módulo en lugar de de forma uniforme: los 8 bits se reservan para las partes donde el redondeo a 4 bits altera de forma medible la salida (decisiones de enrutamiento, mezclas de hiperconexión e indexador de atención dispersa), y las tablas de n-gramas usan grupo 32 porque sus filas son cortas y se leen de forma individual. La cabeza de predicción multi-token se conserva cuantizada para permitir decodificación especulativa, con una tasa de aceptación de borradores del 63 % en el texto medido.

## Capacidades

- Generación de texto y conversación multi-turno a través de la API de chat y de completions compatible con OpenAI.
- Razonamiento y generación de código, según la naturaleza del modelo base, aunque no hay evaluación publicada específica para esta cuantización.
- Visión: acepta imágenes PNG y JPEG codificadas como data URI en base64 dentro de las peticiones de chat, hasta ocho por petición y con escalado a un máximo de 2 megapíxeles.
- Decodificación especulativa mediante la cabeza de predicción multi-token incluida en el checkpoint, que acelera la generación en modo greedy.
- Contexto largo de hasta 262.144 posiciones (el ejemplo de arranque del servidor usa `--max-seq 131072`).
- Caché de prefijo por sesión y carga/descarga del modelo por inactividad, gestionadas por el servidor.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente local de documentación y código sobre un Mac de 128 GB: el modelo puede procesar prompts largos (se midieron prefill de 1.300 a 1.546 tokens por segundo entre 4K y 16K de contexto) y responder con 86 tokens por segundo, lo que permite consultar bases de código o manuales extensos sin enviar datos a la nube.
- Análisis de capturas e imágenes en flujo de trabajo local: al aceptar hasta ocho PNG o JPEG por petición, sirve para revisar diagramas de arquitectura, errores de interfaz o tablas escaneadas junto a preguntas de texto en la misma conversación.
- Generación asistida de código en un entorno aislado: al ejecutarse con un único proceso local y API compatible con OpenAI, se integra como backend en editores y scripts sin depender de proveedores externos.
- Prototipado de aplicaciones multimodales con contexto largo: la ventana de 262.144 posiciones permite mantener conversaciones con historiales extensos más imágenes sin truncar el contexto.
- Evaluación de cuantización y decodificación especulativa: el checkpoint es útil para reproducir los experimentos del servidor lily, comparar la tasa de aceptación de borradores y medir la pérdida de calidad frente a bf16.
- Servicio de inferencia personal en red local: el servidor escucha en `127.0.0.1:8000` y expone endpoints compatibles, de modo que puede actuar como sustituto local de una API alojada para herramientas de chat internas.
- Investigación sobre arquitecturas híbridas: al conservar atención completa cada cuatro capas, gated delta net, MoE de 512 expertos y embeddings de n-gramas aprendidos, sirve para estudiar el comportamiento de estos componentes en un modelo de 30.000 millones de parámetros ya convertido a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación solo aporta medidas de velocidad de inferencia, recogidas en el apartado de requisitos de hardware, y una comparación de rendimiento frente a una cuantización UD-IQ4_XS ejecutada con un fork de llama.cpp de Unsloth.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26 o superior. El servidor usa el modelo de comandos de Metal 4 y no compila en versiones anteriores. No hay soporte para CUDA ni para GPU de Nvidia o AMD.
- Memoria: 128 GB de memoria unificada en la configuración por defecto. En ejecución, el servidor mantiene unos 73 GB de pesos y espacio de trabajo en memoria de GPU y lee los 32 GB de tablas de n-gramas a través de la caché de páginas, dejando el resto para la caché de sesión.
- Disco: 106 GB libres como mínimo, más espacio adicional si se activa el nivel de disco de la caché de sesión. El repositorio ocupa 105,5 GB.
- Máquina de referencia de las medidas: Mac con M5 Max, GPU de 40 núcleos y 128 GB de memoria, sobre la API HTTP, 256 tokens greedy por ejecución y mediana de tres repeticiones intercaladas.

| Contexto | Prefill (tokens/s) | Decodificación (tokens/s) | Decodificación con 2 borradores (tokens/s) |
|---:|---:|---:|---:|
| 4K | 1.300 | 86 | 102 |
| 16K | 1.546 | 86 | 102 |
| 32K | 1.499 | 84 | 102 |
| 64K | 1.382 | 82 | 98 |

- Comparación en la misma máquina, con los mismos prompts y modelo, frente al fork de llama.cpp de Unsloth en UD-IQ4_XS con su borrador MTP: prefill de 887 a 550 tokens por segundo en el mismo rango de contexto y decodificación de 52 a 27 tokens por segundo.
- Tasa de aceptación de borradores: 63 % en el texto medido. La decodificación especulativa solo aplica bien en modo greedy; con temperatura distinta de cero se aceptan menos borradores y el modelo va más lento.
- Cabe en GPU de consumo de Apple: sí, en configuraciones de 128 GB de memoria unificada. No cabe en tarjetas gráficas de consumo con memoria dedicada (por ejemplo, RTX 4090 de 24 GB) ni se ofrece una ruta de despliegue para ellas.
- Opciones de despliegue: exclusivamente el servidor `lily-qwen3.8-flash-next`, compilado con Cargo (`cargo build --release --locked`). No es compatible con vLLM, SGLang, MLX, llama.cpp, TGI ni Transformers.
- Concurrencia: un motor atiende una petición a la vez; las peticiones concurrentes se encolan y existe caché de prefijo por sesión, pero sin procesamiento por lotes entre sesiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento y disponibilidad |
|---|---|---|---|---|---|
| fabiogreter/Qwen3.8-Flash-Next-lily-q4 | 30.204.847.424 | 262.144 posiciones | safetensors, `qwen4_exp-affine-v1` | qwen-community-1.0 | Decodificación de 86 a 82 tokens/s y prefill de 1.546 a 1.382 tokens/s (M5 Max, 128 GB); solo carga en el servidor lily |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | 262.144 posiciones (según la conversión) | safetensors en bf16 | qwen-community-1.0 | No disponible; el autor recomienda partir de este repositorio si se necesita un formato portable |
| Cuantización UD-IQ4_XS con fork de llama.cpp de Unsloth | no disponible | no disponible | GGUF (según la comparación) | no disponible | Prefill de 887 a 550 tokens/s y decodificación de 52 a 27 tokens/s en la misma máquina; sí es portable a otras herramientas |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de tamaño similar; únicamente existe la comparación de velocidad medida por el autor en el mismo equipo.

## Limitaciones y advertencias

- Los pesos solo se cargan en `lily-qwen3.8-flash-next`. No son legibles por Transformers, vLLM, SGLang, MLX ni llama.cpp: el diseño de tensores, los metadatos de cuantización y las tablas de n-gramas empaquetadas son específicos de ese cargador.
- Requiere Apple Silicon con macOS 26 o superior y 128 GB de memoria unificada; no hay ruta de despliegue en GPU de Nvidia ni en hardware x86.
- Imágenes: solo PNG o JPEG como data URI en base64, máximo ocho por petición y escaladas a 2 megapíxeles como mucho. No hay soporte de vídeo ni de recuperación de imágenes por URL.
- La salida cuantizada no es idéntica bit a bit a la referencia en bf16; en empates próximos del argmax la decisión puede resolverse de forma distinta.
- La decodificación especulativa pierde eficacia con temperatura distinta de cero, ya que los borradores se generan de forma greedy mientras el tronco muestrea.
- Un solo motor atiende una petición a la vez y no hay procesamiento por lotes entre sesiones; en cargas concurrentes las peticiones se encolan.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni alineación, porque la model card no documenta el entrenamiento del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible para esta cuantización.
- Licencia `qwen-community-1.0`: al estar etiquetada como `other`, conviene revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. En la información proporcionada no se detallan las restricciones concretas de uso comercial.
- Repositorio con 0 descargas y 0 likes y creado el 17 de septiembre de 2026: no hay validación comunitaria ni informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fabiogreter/Qwen3.8-Flash-Next-lily-q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor de inferencia lily-qwen3.8-flash-next: https://github.com/fabiogreter/lily-qwen3.8-flash-next
- Documento de rendimiento del motor: https://github.com/fabiogreter/lily-qwen3.8-flash-next/blob/main/docs/performance.md
- Licencia del modelo: archivo LICENSE del repositorio de HuggingFace
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes para este modelo: solo devuelven listas de niveles del modo ARAM: Mayhem de League of Legends, sin relación con la ficha.

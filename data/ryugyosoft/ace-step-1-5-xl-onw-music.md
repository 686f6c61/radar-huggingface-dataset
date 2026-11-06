# ryugyosoft/ACE-Step-1.5-XL-onw-music

## Resumen

ACE-Step 1.5 XL turbo para onw-music es un paquete de inferencia derivado del modelo de generación musical ACE-Step/acestep-v15-xl-turbo, adaptado por el usuario ryugyosoft para ejecutarse íntegramente en la NPU de los procesadores Intel Core Ultra mediante OpenVINO. El paquete incluye el DiT (Diffusion Transformer) de 4.000 millones de parámetros cuantizado a INT8, el codificador de texto Qwen3-Embedding-0.6B, el codificador de letras en fp16 y el decodificador VAE, todos convertidos a grafos OpenVINO.

El problema que resuelve es la ejecución local de generación musical de alta calidad sin GPU dedicada: traslada todo el pipeline (texto, letras, DiT y VAE) a la NPU integrada de las plataformas Intel Lunar Lake y Arrow Lake HX. Frente a la variante turbo del mismo autor, ofrece mayor calidad de audio a costa de aproximadamente el doble de tiempo de generación, con un pico de memoria de unos 6,5 GB (8,2 GB en la primera generación de 300 segundos).

Es relevante para desarrolladores que quieran integrar text-to-music en aplicaciones de escritorio sobre hardware Intel con NPU, ya que demuestra un pipeline completo de difusión musical cuantizado y compilado para un acelerador de bajo consumo. La licencia MIT del modelo base facilita su reutilización comercial, aunque el paquete en sí está pensado para consumirse a través de la aplicación onw-music.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 32 capas, con codificador de texto Qwen3-Embedding-0.6B, codificador de letras y decodificador VAE; grafos OpenVINO |
| Parametros totales | 4.000 millones (DiT); el codificador de texto añade 0,6 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; longitud de audio generable de 10 a 300 segundos |
| Tipos de cuantizacion | DiT en INT8 con escalas por canal; codificador de letras en fp16; VAE sin especificar |
| Idiomas soportados | no disponible (la generación musical depende del texto y las letras de entrada) |
| Licencia | MIT (hereda la del modelo base ACE-Step/acestep-v15-xl-turbo) |
| Formato de pesos | Grafos y pesos OpenVINO (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: convierte y cuantiza los pesos de ACE-Step/acestep-v15-xl-turbo. El componente principal es un DiT de 32 capas y 4.000 millones de parámetros, almacenado en un único fichero INT8 de 4,1 GB con escalas por canal; el grafo de cada capa se construye en el PC en tiempo de ejecución en función de la duración de la pieza solicitada. El pipeline se completa con el codificador de texto Qwen3-Embedding-0.6B, un codificador de letras en fp16 con pesos específicos para la variante XL y el decodificador VAE, compartido con la variante turbo.

La conversión a OpenVINO permite ejecutar todos los componentes en la NPU de Intel Core Ultra. El autor reporta que la velocidad relativa del DiT frente al cálculo oficial en fp32 presenta un error de 0,14 en el primer paso y 0,021 en el último; con los mismos pesos INT8 ejecutados en CPU, el error es de 0,112 y 0,020. No se detallan en la información disponible los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset ni si hubo ajuste por refuerzo).

## Capacidades

- Generación de música a partir de texto (text-to-audio) con el pipeline declarado en Hugging Face.
- Generación condicionada por letras mediante un codificador de letras específico en fp16.
- Piezas musicales de entre 10 y 300 segundos; la aplicación onw-music limita la variante XL turbo a 5 minutos por restricciones de memoria y de la NPU.
- Ejecución completa en NPU Intel Core Ultra (Lunar Lake, Arrow Lake HX) mediante OpenVINO, sin GPU dedicada.
- Calidad de audio superior a la variante turbo del mismo autor, con aproximadamente el doble de tiempo de generación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio de entrada.

## Casos de uso

- Composición musical asistida en aplicaciones de escritorio: el paquete se integra en onw-music y permite generar piezas de hasta 5 minutos en un portátil con Intel Core Ultra, usando la NPU mientras la CPU queda libre para la interfaz.
- Creación de bandas sonoras para vídeo y podcasts: la ventana de 10 a 300 segundos cubre desde cortinillas hasta temas completos, con condicionamiento por texto y letras para ajustar el estilo.
- Prototipado rápido de ideas musicales: con tiempos de 10 a 12 segundos para 30 segundos de audio en Lunar Lake, el ciclo de iteración es viable en local sin depender de servicios en la nube.
- Generación de jingles y música de fondo para contenidos comerciales: la licencia MIT del modelo base permite su uso en productos derivados, sujeto a las condiciones de la aplicación que lo consume.
- Demostraciones y docencia sobre pipelines de difusión: el paquete expone por separado los grafos del DiT, codificadores y VAE, lo que facilita explicar cada etapa del proceso de generación.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local sobre la NPU, el texto y las letras no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí proporciona tiempos de generación por plataforma:

| Duracion de la pieza | Lunar Lake (NPU 4000) | Arrow Lake HX (NPU 3720) |
|---|---|---|
| 30 segundos | aprox. 10-12 s | aprox. 26 s |
| 120 segundos | aprox. 41 s | aprox. 118 s |
| 300 segundos | aprox. 167 s | aprox. 349 s |

Los tiempos corresponden a partir de la segunda pieza; la primera pieza de 30 segundos incluye la compilación del grafo y tarda unos 35 segundos en Lunar Lake.

## Requisitos de hardware

- NPU Intel Core Ultra: validado en Lunar Lake (NPU 4000) y Arrow Lake HX (NPU 3720); requiere OpenVINO y compilación del grafo en el PC una sola vez.
- Memoria: pico de aproximadamente 6,5 GB durante la generación; unos 8,2 GB en la primera pieza de 300 segundos. El autor recomienda equipos con 16 GB de RAM o más. La variante turbo consume entre 4,5 y 5,7 GB.
- Almacenamiento: el repositorio ocupa 7,0 GB; el fichero de pesos del DiT en INT8 ocupa 4,1 GB.
- GPU dedicada: no necesaria; el diseño está orientado a la NPU. No se documenta soporte para A100, H100 ni RTX 4090.
- Despliegue: a través de la aplicación onw-music (versión 1.0.0 o posterior), que descarga el paquete y lo selecciona con la clave de carga. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: según la tabla anterior, aproximadamente 2,5 veces más lento en Arrow Lake HX que en Lunar Lake para la misma duración de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Duracion maxima | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-XL-onw-music (este) | 4.000 M (DiT) + 0,6 M de codificador | 300 s | NPU Intel Core Ultra (OpenVINO) | MIT | Hugging Face, 27 descargas |
| ACE-Step-1.5-onw-music (turbo, mismo autor) | no disponible | no disponible | NPU Intel Core Ultra (OpenVINO) | MIT | Hugging Face |
| ACE-Step/acestep-v15-xl-turbo (base) | 4.000 M (DiT) | no disponible | GPU genérica | MIT | Hugging Face |

La variante turbo del mismo autor prioriza velocidad (aproximadamente la mitad de tiempo) y menor consumo de memoria (4,5-5,7 GB frente a 6,5-8,2 GB), a costa de menor calidad de audio. El modelo base ofrece los mismos pesos sin la conversión a OpenVINO ni la cuantización INT8, por lo que no está optimizado para NPU.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en NPU Intel Core Ultra con OpenVINO; no es portable a GPU NVIDIA, AMD ni a CPU sin el proceso de conversión correspondiente.
- Límite de duración: la aplicación onw-music restringe las piezas de esta variante a 5 minutos porque 600 segundos exceden los límites de memoria y de la NPU.
- Consumo de memoria elevado para un equipo integrado: 8,2 GB de pico en la primera pieza de 300 segundos exige equipos con 16 GB o más.
- Latencia notable en Arrow Lake HX: hasta 349 segundos para una pieza de 5 minutos, lo que limita su uso interactivo en esa plataforma.
- Cuantización INT8: introduce un error relativo medible en la velocidad del DiT (0,14 en el primer paso), lo que puede afectar a la fidelidad frente al modelo en fp32.
- Sin datos sobre sesgos, alucinación o cobertura idiomática: la información disponible no documenta evaluación de sesgos ni calidad por idioma.
- Licencia: el paquete hereda la MIT del modelo base, pero el codificador de texto Qwen3-Embedding-0.6B se distribuye bajo Apache-2.0, que debe respetarse por separado.
- Madurez: 27 descargas y ninguna valoración en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- [Hugging Face: ryugyosoft/ACE-Step-1.5-XL-onw-music](https://huggingface.co/ryugyosoft/ACE-Step-1.5-XL-onw-music)
- [Aplicación onw-music](https://huggingface.co/ryugyosoft/onw-music)
- [Variante turbo: ACE-Step-1.5-onw-music](https://huggingface.co/ryugyosoft/ACE-Step-1.5-onw-music)
- [Modelo base: ACE-Step/acestep-v15-xl-turbo](https://huggingface.co/ACE-Step/acestep-v15-xl-turbo)
- [VAE: ACE-Step/Ace-Step1.5](https://huggingface.co/ACE-Step/Ace-Step1.5)
- [Codificador de texto: Qwen/Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)

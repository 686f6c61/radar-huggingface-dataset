# kalmarv/cadence-web

## Resumen

Cadence es un sistema de generacion automatica de mapas para Beat Saber a partir de una cancion, disenado para ejecutarse integramente en el navegador. El repositorio `kalmarv/cadence-web` contiene los pesos que descarga el sitio web de Cadence: un modelo secuencia-a-secuencia que escucha una cancion y escribe un mapa jugable para las dificultades Normal, Hard, Expert y Expert+. La inferencia se realiza con Rust compilado a WebAssembly y el modelo ejecutandose sobre WebGPU, sin backend de servidor.

El nucleo del sistema es un transformer encoder-decoder de aproximadamente 221 millones de parametros (12 capas de encoder y 12 de decoder, anchura 768, 12 cabezas). El encoder procesa la cancion como espectrograma log-mel de 80 bandas; una cabeza de planificacion predice cuando caen las notas para cada dificultad, y el decoder genera el mapa token a token con un vocabulario de 6.614 simbolos, restringido por una gramatica que garantiza que la salida sea un mapa valido y jugable. El repositorio incluye ademas un modelo de tempo independiente, derivado de Beat This!, que aporta la informacion ritmica.

La relevancia de este lanzamiento es doble: por un lado, demuestra un caso de uso de inferencia de transformers en el navegador con WebGPU para una tarea generativa estructurada; por otro, los pesos estan empaquetados para un motor propietario concreto (disposicion de tensores y formato de ficheros propios), no para PyTorch ni para runtimes estandar, lo que limita su reutilizacion fuera del proyecto. El autor no ha elegido todavia licencia para los pesos del modelo de mapas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (12 capas encoder, 12 decoder, anchura 768, 12 cabezas) |
| Parametros totales | ~221 millones (modelo de mapas); ~81 MB en float32 el modelo de tempo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (pesos publicados); existe una copia float16 no incluida en el repo |
| Idiomas soportados | no disponible (la entrada es audio, no texto) |
| Licencia | no disponible para los pesos del modelo de mapas; modelo de tempo bajo MIT (Beat This!) |
| Formato de pesos | ficheros binarios propios (`transition_penalty.bin`, directorios `f32-0afb01a3d1e5/` y `beats-675e531b4822/` en partes de 16 MB), mas `manifest.json` y `cadence.json` |

## Arquitectura y entrenamiento

El modelo de mapas es un transformer encoder-decoder de 221 millones de parametros. El encoder recibe la cancion como espectrograma log-mel de 80 bandas y produce una representacion que alimenta una cabeza de planificacion encargada de predecir la posicion temporal de las notas para cada dificultad. El decoder genera el mapa de forma autorregresiva, un token a la vez, sobre un vocabulario de 6.614 simbolos, con decodificacion restringida por gramatica para asegurar que la secuencia resultante sea un mapa de Beat Saber valido y jugable. El bucle de muestreo utiliza una tabla de penalizacion de transiciones (`transition_penalty.bin`).

El repositorio no documenta el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. El modelo de tempo incluido es el checkpoint `final0` de Beat This! (Foscarin, Schluter y Widmer, JKU Linz), con las batch norms plegadas y los tensores reorganizados para el motor de Cadence. El autor senala que existe una copia float16 del modelo de mapas que no se publica porque produce mapas distintos a los de los pesos float32, y que el sitio web no la utiliza.

## Capacidades

- Generacion de mapas de Beat Saber a partir de audio de una cancion, en cuatro dificultades: Normal, Hard, Expert y Expert+.
- Estimacion de tempo y estructura ritmica mediante el modelo Beat This! integrado.
- Decodificacion restringida por gramatica: la salida es siempre un mapa sintacticamente valido y jugable.
- Planificacion temporal de notas por dificultad mediante cabeza dedicada.
- Inferencia en navegador con WebGPU y WebAssembly (Rust), sin servidor.
- No se documentan capacidades de texto, codigo, vision, tool calling, agentes ni multilingues; el modelo es especifico de audio a mapa.

## Casos de uso

- Generacion de mapas para contenido generado por usuarios: un jugador sube una cancion y obtiene un mapa jugable en el navegador, sin instalar nada ni enviar el audio a un servidor, gracias a la ejecucion local con WebGPU.
- Creacion rapida de prototipos de niveles para modders de Beat Saber: el modelo produce borradores en cuatro dificultades que el autor del mapa puede refinar manualmente en el editor.
- Herramientas web de conversion audio-a-mapa: al empaquetarse como WebAssembly y WebGPU, el modelo puede integrarse en una pagina estatica sin infraestructura de backend, reduciendo costes de despliegue.
- Investigacion sobre generacion musical estructurada: el par encoder (espectrograma log-mel) mas decoder con gramatica restringida sirve como referencia para tareas de generacion de secuencias validas condicionadas por audio.
- Aplicaciones de ritmo y entrenamiento: el modelo de tempo y la planificacion de notas pueden alimentar visualizadores o juegos de ritmo que necesiten alineacion temporal con la musica.
- Demostracion de inferencia de transformers en el navegador: util para evaluar WebGPU como plataforma de despliegue de modelos de ~221 M de parametros en produccion cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo de mapas ocupa 886.110.936 bytes en float32 (aproximadamente 845 MiB); el modelo de tempo ocupa 81.016.624 bytes (aproximadamente 77 MiB). El repositorio completo pesa 1,0 GB.
- Al ejecutarse en el navegador sobre WebGPU, la VRAM necesaria depende de la implementacion del motor; como referencia, los pesos en float32 requieren del orden de 0,85 GB solo para el modelo de mapas, mas buffers intermedios.
- No se especifican GPU recomendadas ni minimas en la informacion disponible. La viabilidad depende del soporte de WebGPU del navegador y de la GPU del cliente.
- No cabe esperar despliegue con vLLM, llama.cpp, Ollama o TGI: los pesos estan en un formato propio para el motor de Cadence, no en safetensors ni GGUF.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de generacion de mapas de Beat Saber con pesos publicos y especificaciones verificables.

## Limitaciones y advertencias

- Los pesos del modelo de mapas no tienen licencia elegida; no se puede asumir permiso para uso comercial ni para redistribucion.
- El formato de pesos es propietario del motor de Cadence (partes de 16 MB con manifiesto propio); no es directamente cargable en PyTorch, TensorFlow ni runtimes estandar.
- La copia float16 no se publica porque genera mapas distintos a los de float32; cualquier reimplementacion debe usar float32 para reproducir el comportamiento del sitio.
- Dependencia de WebGPU: la inferencia en navegador requiere soporte de WebGPU, aun no universal en todos los navegadores y plataformas.
- No se documentan sesgos, tasa de alucinacion ni evaluacion de calidad de los mapas generados; no hay benchmarks publicados.
- El modelo de tempo es codigo de terceros (Beat This!) bajo MIT; su atribucion debe conservarse al redistribuir.
- Cadence no esta afiliado a Beat Games ni a Meta; el uso del nombre y de la marca Beat Saber puede estar sujeto a restricciones de terceros.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar cobertura musical, sesgos de genero o estilo, o riesgo de sobreajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kalmarv/cadence-web
- Codigo fuente del proyecto: https://github.com/Kalmarv/cadence-web
- Beat This! (modelo de tempo, MIT): https://github.com/CPJKU/beat_this

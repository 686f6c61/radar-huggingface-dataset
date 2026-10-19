# jashansinghTT/minimax-music3-blackhole

## Resumen

`minimax-music3-blackhole` es un paquete de despliegue para ejecutar MiniMax-Music3 en hardware Tenstorrent p150. Lo publica el usuario `jashansinghTT` y deriva de `MiniMaxAI/MiniMax-Music3`, desarrollado por MiniMax, con los pesos sin modificar. No es un modelo entrenado desde cero: empaqueta el modelo original con Docker, la CLI de Tenstorrent y un servidor HTTP propio para generar canciones a partir de letras y una descripción musical.

El modelo subyacente es un sistema híbrido de generación musical: un LLM global basado en Qwen3 de 8B modela la estructura de la canción, un decodificador de profundidad de 0,6B genera los codebooks RVQ residuales, un DiT de flow matching de 2,4B y un vocoder estilo DAC producen el audio. Está condicionado por letras y por una descripción textual de la música, y el proyecto original declara canciones de hasta cinco minutos con voces expresivas, arreglos que evolucionan y calidad estéreo de alta fidelidad.

Su relevancia está en que permite probar MiniMax-Music3 sobre una alternativa a las GPU NVIDIA, con una API `/v1/audio/speech` compatible con SGLang-Omni y un sistema de tareas asíncronas para canciones largas. Como contrapartida, solo está validado en p150, genera una canción cada vez y es más lento que el tiempo real: alrededor de 4,5 segundos de cómputo por cada segundo de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: LLM global Qwen3 de 8B + decodificador de profundidad de 0,6B para codebooks RVQ residuales + DiT de flow matching de 2,4B + vocoder estilo DAC |
| Parámetros totales | no disponible (componentes anunciados: 8B + 0,6B + 2,4B; no se especifica el tamaño del vocoder) |
| Longitud de contexto | no disponible; el modelo original genera canciones de hasta 5 minutos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-Music3 Community License (`license: other`); los productos deben mostrar «MiniMax-Music3» |
| Formato de pesos | no disponible; los pesos se descargan de `MiniMaxAI/MiniMax-Music3` en el commit `fbdf52fbaaca799592917417eb05f1899f1255ec` y no se incluyen en el paquete |
| Modelo base | `MiniMaxAI/MiniMax-Music3` (pesos sin modificar) |
| Tarea | text-to-audio; generación de música condicionada por letras y descripción |
| Hardware validado | Tenstorrent p150 (mesh `P150`) |
| API | `/v1/audio/speech` y API asíncrona `/v1/music/jobs` |
| Tamaño del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque Hybrid-LM del proyecto MiniMax-Music3: separa el modelado estructural global de la canción y el refinamiento acústico local. El LLM global de 8B, basado en Qwen3, se encarga de la estructura y la coherencia a largo plazo; el decodificador de profundidad de 0,6B produce los codebooks RVQ residuales; y el DiT de flow matching de 2,4B, junto con el vocoder estilo DAC, convierte esa representación en audio estéreo. Esta jerarquía es la que permite mantener coherencia en canciones de hasta cinco minutos.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones de entrenamiento adicionales. El paquete de Tenstorrent no modifica los pesos: añade el runtime para p150, la compilación de kernels, la caché de tensores y el servidor HTTP. Entre las particularidades del despliegue están la API compatible con SGLang-Omni, las tareas asíncronas para canciones largas y una corrección del arranque en frío relacionada con la caché de tensores.

## Capacidades

- Generación de música a partir de letras y una descripción textual de estilo, instrumentación, voz y ambiente.
- Estructura de canción mediante etiquetas en las letras, como `[Verse]` y `[Chorus]`, tal como muestra el ejemplo de la model card.
- Generación de canciones de hasta cinco minutos mediante la API de tareas asíncronas.
- Salida en WAV y control de `seed` para reproducibilidad; un clip con semilla fija es byte-idéntico entre revisiones del paquete.
- `max_new_tokens` cuenta fotogramas de audio a 25 por segundo, no tokens de texto.
- API HTTP propia en el puerto 20000, con formas de petición y respuesta propias del modelo.
- Compatibilidad declarada con la ruta `/v1/audio/speech` de SGLang-Omni.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- No hay lista de idiomas soportados ni evaluación multilingüe publicada.

## Casos de uso

- Demos de canciones para compositores: el modelo recibe una letra con secciones y una descripción de producción; se pueden generar clips de 10 segundos para iterar rápido y usar la API de tareas para una versión completa de hasta cinco minutos. Es adecuado porque mantiene estructura global y voces, aunque solo procesa una petición cada vez.
- Jingles y música publicitaria: generar varias versiones de un anuncio de 10 segundos cambiando la descripción y la semilla, y escoger la mejor. El coste medido es de 44,7 segundos por cada clip de 10 segundos, aceptable para un flujo offline por lotes.
- Música de fondo para vídeo y pódcast: lanzar una tarea asíncrona con la letra y la descripción, y recoger el WAV al terminar. La duración de hasta cinco minutos encaja con piezas de fondo largas y el despliegue local evita depender de servicios externos.
- Prototipado de letras y estructura: probar distintas combinaciones de `[Verse]`, `[Chorus]` y descripciones de arreglos, manteniendo la semilla para comparar variaciones controladas. Es útil para validar si una letra funciona antes de entrar en un estudio.
- Investigación sobre hardware Tenstorrent: ejecutar los pesos originales de MiniMax-Music3 en p150 y medir latencia, arranque y comportamiento de la caché de tensores. El paquete permite reproducir un clip byte-idéntico, lo que facilita comparar revisiones del runtime.
- Despliegue on-premise con material no publicado: mantener letras y descripciones dentro de una infraestructura local con Docker y el servidor HTTP en el puerto 20000. Es adecuado para equipos que no quieren enviar material creativo a la nube, asumiendo que el hardware validado es p150.
- Preproducción de bandas sonoras para juegos independientes: generar temas completos por lotes y usarlos como maquetas o música temporal. No es apto para música adaptativa en tiempo real por la latencia y porque solo se genera una canción a la vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad musical, MMLU, HumanEval, GSM8K ni comparación objetiva con la implementación de referencia. Los siguientes datos son de rendimiento de despliegue, no de calidad:

| Perfil | Petición | Duración de audio | Concurrencia | N | Tiempo total |
|---|---|---|---|---|---|
| p150 | `POST /v1/audio/speech`, `max_new_tokens` 250, WAV | 10 s | 1 | 1 | 44,7 s |

Medición de extremo a extremo a través del servidor del paquete en el barrido comunitario de tt-model de septiembre de 2026. El arranque en frío medido en un QuietBox 2 con cachés vacías fue de 171 s la primera vez, 90 s la segunda y 50 s la tercera, incluyendo una copia única de unos 21 GB.

## Requisitos de hardware

- Acelerador validado: Tenstorrent p150, mesh `P150`. No se valida ningún otro dispositivo.
- VRAM: no aplica; el despliegue no es CUDA. La memoria del acelerador necesaria no está detallada.
- GPU recomendadas: no disponible; el paquete no documenta soporte para GPU NVIDIA, AMD o consumer.
- GPU de consumo: no; solo se ha validado p150.
- Despliegue: Docker y la CLI de Tenstorrent. Con `tt`: `tt serve jashansinghTT/minimax-music3-blackhole`. Sin `tt`: `tt-model serve jashansinghTT/minimax-music3-blackhole`.
- Servidor: arranca en el puerto 20000 o en el siguiente libre; la API es propia del modelo, no una API de chat compatible con OpenAI.
- Latencia: 44,7 s para 10 s de audio con `max_new_tokens` 250; aproximadamente 4,5 s de cómputo por segundo de audio, unas 4,5 veces más lento que el tiempo real.
- Throughput: una canción a la vez; las peticiones adicionales esperan.
- Arranque: la primera ejecución compila kernels y tarda varios minutos. En el caso medido, 171 s con cachés vacías, 90 s en el segundo arranque y 50 s en el tercero.
- Almacenamiento: el repositorio ocupa 3,5 GB; los pesos se descargan aparte desde el repositorio original y la caché de tensores ronda los 21 GB en el escenario medido.
- Opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este paquete; el despliegue previsto es el servidor propio sobre p150.

## Comparativa con modelos similares

No se dispone de datos de otros modelos text-to-audio en la información proporcionada. Las alternativas documentadas son el modelo original y otro paquete de despliegue sobre Tenstorrent:

| Modelo o paquete | Parámetros | Contexto o duración | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `jashansinghTT/minimax-music3-blackhole` | 8B + 0,6B + 2,4B + vocoder; total no disponible | Hasta 5 minutos de audio; contexto de tokens no disponible | MiniMax-Music3 Community License | Solo p150; Docker y CLI de Tenstorrent | 44,7 s por 10 s de audio; una petición a la vez |
| `MiniMaxAI/MiniMax-Music3` (original) | 8B + 0,6B + 2,4B + vocoder; total no disponible | Hasta 5 minutos de audio | MiniMax-Music3 Community License | Hugging Face y GitHub; requisitos de hardware no detallados | no disponible |
| `tsingletaryTT/tt-minimax-music-blackhole` | no disponible | no disponible | no disponible | GitHub; Blackhole y Gradio | no disponible |

La comparación de calidad con la implementación de referencia no se ha realizado. El paquete de `jashansinghTT` declara explícitamente que no hay evaluación de calidad frente a la implementación original.

## Limitaciones y advertencias

- Solo se genera una canción a la vez; las peticiones adicionales quedan en espera.
- Es más lento que el tiempo real: aproximadamente 4,5 segundos de cómputo por segundo de audio.
- Solo está validado en Tenstorrent p150; no hay soporte documentado para GPU de consumo ni para otros aceleradores.
- No se ha ejecutado una evaluación de calidad frente a la implementación de referencia de MiniMax-Music3.
- La licencia MiniMax-Music3 Community License obliga a que los productos construidos con el modelo muestren «MiniMax-Music3». No se detallan aquí el resto de condiciones para uso comercial.
- La API no es compatible con el formato de chat de OpenAI; usa las formas de petición y respuesta propias del modelo.
- El primer arranque compila kernels y tarda varios minutos; además, la caché de tensores puede requerir una copia inicial de unos 21 GB.
- No hay lista de idiomas soportados ni evaluación de calidad multilingüe.
- No se han documentado sesgos específicos ni evaluaciones de sesgo.
- Al ser un modelo generativo condicionado, puede desviarse de la descripción musical o de la letra y producir artefactos, pero no hay métricas publicadas para cuantificarlo.
- No se documentan tool calling, agentes, visión ni audio de entrada; la tarea está limitada a generar audio a partir de texto.
- Para producción hay que prever almacenamiento para los pesos, la caché de tensores y las imágenes Docker, además de un flujo de trabajo por lotes por la baja concurrencia.

## Enlaces

- [Paquete en Hugging Face](https://huggingface.co/jashansinghTT/minimax-music3-blackhole)
- [Modelo original MiniMaxAI/MiniMax-Music3](https://huggingface.co/MiniMaxAI/MiniMax-Music3)
- [Repositorio GitHub de MiniMax-Music3](https://github.com/MiniMax-AI/MiniMax-Music3)
- [Documentación de arquitectura y pipeline en DeepWiki](https://deepwiki.com/MiniMax-AI/MiniMax-Music3/1.1-model-architecture-and-generation-pipeline)
- [Licencia MiniMax-Music3](https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE)
- [Discusiones del paquete](https://huggingface.co/jashansinghTT/minimax-music3-blackhole/discussions)
- [tt-model-manager](https://github.com/tenstorrent/tt-model-manager)
- [Requisitos de la CLI de Tenstorrent](https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md)
- [Launcher alternativo con Gradio para Blackhole](https://github.com/tsingletaryTT/tt-minimax-music-blackhole)
- Contacto de soporte: [support@tenstorrent.com](mailto:support@tenstorrent.com)

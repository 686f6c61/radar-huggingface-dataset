# Polikashin/MiniMax-Music3-MLX

## Resumen

MiniMax-Music3-MLX es una conversion de los pesos del modelo MiniMax Music 3 al formato MLX, realizada por Polikashin para ejecutarse de forma nativa en hardware Apple Silicon. El modelo original, desarrollado por MiniMax, genera canciones completas de hasta cinco minutos a partir de letras y una descripcion musical detallada, produciendo audio estereo a 44,1 kHz con voces expresivas y arreglos coherentes a lo largo de la pieza.

Esta conversion resuelve un problema practico: ejecutar un modelo de generacion musical de ultima generacion en equipos Apple sin depender de CUDA ni de servicios en la nube. El repositorio incluye pesos en safetensors por componente, con recetas de cuantizacion q8 recomendadas que reducen el consumo de memoria unificada a aproximadamente 26 GiB. La conversion ha sido validada mediante una suite de paridad que compara cada archivo contra la implementacion de referencia.

La relevancia actual de este modelo radica en que democratiza la generacion musical de alta calidad en hardware de consumo, algo que hasta ahora requeria GPUs de gama alta o acceso a APIs propietarias. El port MLX es un proyecto independiente (celestialtech) cuyo codigo se distribuye bajo Apache-2.0, mientras que los pesos derivan del lanzamiento de MiniMax y permanecen bajo la licencia MiniMax-Music3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-componente: Qwen3-8B (LM global) + 2,4B flow-matching DiT + 0,6B RVQ depth decoder + vocoder estilo DAC + condition encoder |
| Parametros totales | ~11B (aproximado: 8B LM + 2,4B DiT + 0,6B decoder + componentes auxiliares) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, q8 (8-bit affine, group 64), mixed (attn 8-bit / MLP 4-bit), q4 (construccion local) |
| Idiomas soportados | No disponible |
| Licencia | minimax-music3 (licencia propietaria de MiniMax; el codigo del port es Apache-2.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un sistema multi-componente. Un LM global basado en Qwen3-8B procesa las letras y la descripcion musical para generar el condicionamiento global. Un transformer DiT de 2,4B parametros con flow-matching genera la representacion latente de audio, seguido de un decodificador de profundidad RVQ de 0,6B y un vocoder estilo DAC que produce la forma de onda final. Un condition encoder adicional procesa las entradas de control.

La conversion MLX aplica tres transformaciones: plegado de weight norm en fp32, conversion de layouts convolucionales NCL a NLC, y generacion de safetensors MLX por componente. El port incluye un script de cuantizacion que permite construir recetas mixtas (atencion 8-bit / MLP 4-bit) y q4 localmente. Los datos de entrenamiento del modelo original no estan disponibles en la informacion proporcionada; no se documenta el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de canciones completas de hasta cinco minutos a partir de letras y descripcion musical detallada.
- Audio estereo a 44,1 kHz con voces expresivas y arreglos que evolucionan a lo largo de la pieza.
- Coherencia estructural en audio de larga duracion, manteniendo estabilidad sin degradacion progresiva.
- Ejecucion nativa en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Soporte de cuantizacion q8 con perdida minima (coseno 0,99975 en el LM y 0,999988 en el depth decoder).
- Generacion por streaming, permitiendo escuchar el audio mientras se produce.

## Casos de uso

- Prototipado rapido en produccion musical: un compositor puede generar maquetas completas con letra y direccion artistica en minutos, evaluar la estructura y decidir si merece la pena desarrollarlas en un DAW. El modelo produce arreglos coherentes de hasta cinco minutos, suficiente para una maqueta de cancion completa.
- Musica para video y podcast: creadores de contenido pueden generar bandas sonoras originales con letra y estilo especifico sin preocuparse por derechos de autor. La salida a 44,1 kHz estereo es directamente integrable en proyectos de edicion.
- Audio para videojuegos: estudios independientes pueden generar temas musicales con variaciones de estilo y estado de animico descritos en texto, reduciendo el coste de licenciar musica o contratar compositores para proyectos de bajo presupuesto.
- Jingles y musica publicitaria: agencias pueden producir multiples variaciones de una pieza corta cambiando la descripcion musical, acelerando el proceso de iteracion creativa con clientes.
- Educacion musical: profesores pueden generar ejemplos auditivos que ilustren conceptos como estructura de cancion, instrumentacion o progresiones armonicas, personalizando las letras para cada leccion.
- Exploracion creativa personal: aficionados a la musica pueden experimentar con generos, estilos y letras propias, obteniendo resultados de calidad profesional sin necesidad de conocimientos avanzados de produccion.
- Restauracion o adaptacion de material existente: dado que el modelo acepta letras y descripciones, se pueden generar versiones alternativas de una cancion cambiando el estilo o la instrumentacion descrita en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del port MLX no incluye metricas comparativas (FAD, KL divergence, etc.) frente a otros modelos de generacion musical. El unico dato de rendimiento documentado es el tiempo de generacion: aproximadamente 8 minutos para una cancion de 60 segundos en un Apple M3 Ultra con las recetas q8.

## Requisitos de hardware

- Memoria unificada: aproximadamente 26 GiB con las recetas q8 recomendadas (LM q8 + depth decoder q8).
- GPU: Apple Silicon unicamente (M1, M2, M3 o M4, incluyendo variantes Pro, Max y Ultra). El modelo no es compatible con CUDA.
- Rendimiento: 60 segundos de audio requieren aproximadamente 8 minutos de generacion en un M3 Ultra; en chips inferiores el tiempo sera mayor.
- Almacenamiento: el repositorio ocupa 39,9 GB; los pesos en bf16 completos requieren mas espacio que las versiones cuantizadas.
- Despliegue: mediante el port MLX en gitlab.com/celestialtech/minimax-music3-mlx, con scripts de descarga, conversion y generacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Cuantizacion: las recetas q4 y mixtas no estan subidas al repositorio; deben construirse localmente con el script de cuantizacion incluido en el port.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax Music 3 (MLX) | ~11B | No disponible | 44,1 kHz estereo, hasta 5 min | minimax-music3 | Pesos en HuggingFace, port MLX |
| MusicGen (Meta) | 1,5B / 3,3B | No disponible | 32 kHz mono/estereo, hasta 30 s | CC-BY-NC 4.0 | Pesos en HuggingFace, soporte en transformers |
| Stable Audio (Stability AI) | No disponible | No disponible | 44,1 kHz estereo, hasta 3 min | Stable Audio Open (no comercial) | Pesos en HuggingFace |

Los datos comparativos detallados (benchmarks, calidad perceptiva, latencia) no estan disponibles en la informacion proporcionada. MusicGen y Stable Audio son alternativas establecidas en generacion musical por texto, pero no se dispone de metricas objetivas que permitan una comparacion rigurosa con MiniMax Music 3 en esta ficha.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos estan bajo la licencia MiniMax-Music3, que no es de codigo abierto convencional. Es necesario revisar los terminos completos en el enlace de la licencia antes de cualquier uso comercial.
- Requiere Apple Silicon: la version MLX no es portable a GPUs NVIDIA o AMD; limita el despliegue a ecosistema Apple.
- Consumo de memoria elevado: 26 GiB de memoria unificada con cuantizacion q8 excluye equipos con menos de 32 GiB de RAM unificada.
- Generacion lenta: 8 minutos para 60 segundos de audio en M3 Ultra implica que producciones largas (5 minutos) requieren alrededor de 40 minutos de computacion.
- Idiomas soportados no documentados: no se especifica que idiomas acepta el modelo para letras o descripciones; el tokenizer es de Qwen2, lo que sugiere soporte multilingue, pero no esta confirmado.
- Riesgo de alucinacion en letras: como cualquier modelo generativo, puede producir letras incoherentes o con errores semanticos, especialmente en idiomas poco representados.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos de genero, culturales o musicales del modelo.
- Sin benchmarks publicados: no hay metricas objetivas de calidad musical que permitan evaluar el rendimiento frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Polikashin/MiniMax-Music3-MLX
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia MiniMax-Music3: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Repositorio GitHub de MiniMax: https://github.com/MiniMax-AI/MiniMax-Music3
- Port MLX (celestialtech): https://gitlab.com/celestialtech/minimax-music3-mlx
- Pagina de demostraciones: https://minimax-ai.github.io/music3-demo/
- Guia independiente del modelo: https://minimaxmusic3.ai/

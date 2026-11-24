# mlx-community/Holo2-4B-8bit

## Resumen
Holo2-4B-8bit es la cuantizacion en 8 bits para MLX del modelo Holo2-4B, desarrollado originalmente por H Company y convertido por la comunidad mlx-community para su ejecucion nativa en Apple Silicon. Se trata de un modelo multimodal de tipo image-text-to-text especializado en agentes de interfaz grafica (GUI agents) y computer use: recibe capturas de pantalla junto con instrucciones en lenguaje natural y devuelve acciones como coordenadas de clic, lo que lo hace util para automatizacion de navegadores y escritorios.

El modelo base tiene 4.437.815.808 parametros (aproximadamente 4,4 mil millones) y emplea la arquitectura qwen3_vl, un transformer multimodal con torre de vision. Esta version 8-bit mantiene la torre de vision en bfloat16 y aplica cuantizacion afina de 8 bits con tamano de grupo 64 al resto de los pesos, preservando la licencia Apache-2.0 del modelo original.

Su relevancia actual radica en que permite ejecutar un agente visual especializado en localizacion de elementos de interfaz directamente en hardware de consumo Apple (M-series), con un rendimiento medido de 783 ms hasta el primer token y 107 tok/s en decodificacion sobre un M5 Max, y con una precision en el benchmark WebClick de 89,4%, practicamente identica al modelo en bf16 (89,6%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (transformer multimodal con torre de vision) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64; torre de vision en bfloat16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base Holo2-4B emplea la arquitectura qwen3_vl, un transformer multimodal que combina un codificador de vision con un modelo de lenguaje para tareas de image-text-to-text. La model card de esta conversion no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card original de Hcompany/Holo2-4B, que no se incluye en la informacion disponible.

La innovacion tecnica destacable de esta version es el proceso de conversion a MLX. El checkpoint original incluye un tensor `lm_head.weight` redundante junto a los embeddings atados, lo que impide que `mlx_vlm.convert` cargue el checkpoint en las versiones actuales de mlx-vlm. Los pesos de este repositorio eliminan dicho tensor y cargan correctamente en mlx-vlm 0.8.0. La cuantizacion se realizo con `--q-bits 8 --q-group-size 64`, manteniendo la torre de vision en bfloat16 para preservar la calidad de la percepcion visual.

## Capacidades
- Localizacion visual de elementos de interfaz: devuelve coordenadas como enteros en el rango [0, 1000] para indicar donde hacer clic.
- Comprension de capturas de pantalla en resoluciones 720p y 1080p.
- Razonamiento de agente para computer use y automatizacion de GUI.
- Generacion de texto conversacional a partir de entradas imagen-texto.
- Procesamiento de prompts multi-imagen (validado con 3 capturas de 1920x1080, aproximadamente 12k tokens de prompt).
- Soporte de modo thinking (desactivable; los benchmarks se ejecutaron con thinking off).
- Capacidad multilingue limitada al ingles.

## Casos de uso
- Automatizacion de pruebas de interfaz: el modelo puede recibir capturas de una aplicacion web y devolver las coordenadas del elemento a pulsar, integrandose en pipelines de QA para validar flujos de usuario sin selectores fragiles.
- Agentes de navegacion web: dado un objetivo en lenguaje natural y una captura del navegador, el modelo localiza el control relevante (boton, enlace, campo) y permite construir bucles de accion multi-paso sobre paginas dinamicas.
- RPA sobre aplicaciones de escritorio: sustituye la grabacion de macros por percepcion visual, de modo que los cambios de layout no rompen la automatizacion siempre que el elemento siga siendo visible.
- Asistentes de accesibilidad: un usuario con dificultades motoras puede describir una accion y el modelo traduce la intencion a un clic concreto sobre la pantalla.
- Extraccion de datos de paneles y dashboards: combinando la captura con instrucciones, el modelo identifica la posicion de campos y controles para guiar la recoleccion automatizada de informacion.
- Prototipado en local sobre Apple Silicon: gracias a los 6,3 GB de pico de memoria y los 107 tok/s en decodificacion, es viable iterar sobre agentes GUI en un portatil sin depender de APIs externas.
- Agentes de soporte que operan software interno: el modelo puede guiar la resolucion de incidencias localizando los controles de la aplicacion corporativa a partir de una captura enviada por el usuario.

## Benchmarks y rendimiento
Benchmark WebClick (Hcompany/WebClick, 1639 muestras, precision de clic con punto dentro de la caja objetivo, protocolo oficial de localizacion de H Company, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000], mlx-vlm 0.8.0):

| Modelo | Precision | IC 95% |
|---|---|---|
| MLX bf16 | 89,6% | 88,0 a 91,0 |
| MLX 8bit (este modelo) | 89,4% | 87,8 a 90,8 |
| MLX 4bit | 86,6% | 84,9 a 88,2 |

H Company reporta un 88,8% para Holo2-4B en WebClick-v1 en su model card, con un harness distinto y por tanto no estrictamente comparable.

Rendimiento en Apple M5 Max (128 GB), una captura 1920x1080, 2216 tokens de prompt, greedy:

| Motor | Tiempo hasta primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (8bit) | 783 ms | 107 tok/s | 6,3 GB (pico) |
| transformers, bfloat16, MPS | 841 ms | 43 tok/s | 11,0 GB (pico) |
| llama.cpp (Metal), Q8_0 | 1666 ms | 96 tok/s | 7,8 GB (RSS) |

Rendimiento con prompt largo multi-imagen (3 capturas 1920x1080, unos 12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo hasta primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (8bit) | 8,1 s | 44 tok/s | 7,8 GB (pico) |
| llama.cpp (Metal), F16 GGUF (no oficial) | 14,9 s | 26 tok/s | 11,8 GB (RSS) |

Las mediciones se realizaron en una maquina compartida con otras tareas y los propios autores las califican de indicativas.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 6,3 GB de pico para una captura 1080p con 2216 tokens de prompt; 7,8 GB de pico con prompt multi-imagen de unos 12k tokens.
- Plataforma objetivo: Apple Silicon con MLX (validado en M5 Max de 128 GB con mlx 0.32.4 y mlx-vlm 0.8.0). No se proporcionan datos para GPU NVIDIA.
- Cabe en equipos de consumo Apple con memoria unificada suficiente; no se especifica el minimo exacto, pero el pico medido de 7,8 GB sugiere que 16 GB de memoria unificada serian suficientes para los escenarios probados.
- Despliegue: mlx-vlm (comando `python -m mlx_vlm.generate`) y llama.cpp con Metal como alternativa (Q8_0 o F16 GGUF). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput medidos: 783 ms hasta el primer token y 107 tok/s en decodificacion para prompt corto; 8,1 s y 44 tok/s para prompt largo multi-imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo2-4B-8bit (MLX) | 4,44 B | no disponible | 89,4% (8bit) | Apache-2.0 | Hugging Face, MLX |
| Holo2-4B (bf16, MLX) | 4,44 B | no disponible | 89,6% | Apache-2.0 | Hugging Face, MLX |
| Holo2-4B (4bit, MLX) | 4,44 B | no disponible | 86,6% | Apache-2.0 | Hugging Face, MLX |
| Holo2-4B original | 4,44 B | no disponible | 88,8% (WebClick-v1, harness distinto) | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de otros autores para comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias
- El modelo solo declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que dificulta planificar despliegues con conversaciones o capturas muy extensas.
- Riesgo de alucinacion en la localizacion: aunque la precision en WebClick es alta (89,4%), un 10,6% de clics quedan fuera de la caja objetivo, lo que exige validacion o reintentos en produccion.
- La cuantizacion a 4 bits degrada la precision en 2,8 puntos frente a 8 bits (86,6% frente a 89,4%); 8 bits es la opcion recomendada si la memoria lo permite.
- Las mediciones de velocidad se tomaron en una maquina compartida y los propios autores las marcan como indicativas; no deben usarse como garantia de latencia en produccion.
- Esta conversion esta pensada para MLX en Apple Silicon; no hay validacion publicada para CUDA, vLLM u otros backends.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de Hcompany/Holo2-4B para condiciones adicionales de uso responsable.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento en la informacion disponible.

## Enlaces
- Repositorio Hugging Face de esta conversion: https://huggingface.co/mlx-community/Holo2-4B-8bit
- Modelo base original: https://huggingface.co/Hcompany/Holo2-4B
- Web de H Company: https://www.hcompany.ai/
- Dataset de benchmark WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de mlx-vlm #2814: https://github.com/Neywa-Labs/mlx-vlm/pull/2814
- Pull request de mlx-vlm #2822 (mejora de velocidad de la torre de vision): https://github.com/Neywa-Labs/mlx-vlm/pull/2822

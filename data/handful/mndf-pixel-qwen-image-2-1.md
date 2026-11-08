# handful/mndf-pixel-qwen-image-2.1

## Resumen

`handful/mndf-pixel-qwen-image-2.1` es un adaptador LoRA de tipo image-to-image entrenado sobre el modelo base `Qwen/Qwen-Image-2.1` (modelo de generacion y edicion de imagenes de 7B parametros desarrollado por el equipo Qwen de Alibaba Cloud). El LoRA transforma renders 3D oblicuos de mapas urbanos en mapas de pixel-art isometrico con el estilo visual del proyecto MiniDF, concretamente el aspecto con el que Codex pinta fotograma a fotograma el mapa de Brasilia.

El adaptador resuelve un problema muy especifico: convertir una vista renderizada en 3D (perspectiva oblicua de aproximadamente 30 grados, 1024x1024 px, ~3,4 px por metro) en una representacion pixel-art isometrica que preserva la topologia del mapa (calles, edificios y arboles en su posicion). No es un modelo generativo de proposito general, sino un ajuste fino de estilo sobre un pipeline de difusion existente.

Es relevante por su caracter de experimento de investigacion reproducible: el autor documenta el entrenamiento (rank 16, 3.750 pasos, ~100 minutos en una RTX PRO 6000), publica metricas LPIPS sobre conjuntos de validacion y advierte explicitamente sobre las restricciones de los datos de entrenamiento (renders de Google Photorealistic 3D Tiles). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB (los pesos del LoRA no aparecen publicados en el repo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible (el LoRA usa rank 16 y alpha 16; el modelo base tiene 7B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada 1024x1024 px) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible (el prompt de instancia esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo con 0.0 GB; se carga via `load_lora_weights` en diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 entrenado con el script `train_dreambooth_lora_qwenimage21_img2img.py` de diffusers sobre el pipeline `QwenImage21Pipeline`. El entrenamiento uso learning rate 1e-4 constante, random flip como aumentacion, resolucion de 1024 px, batch size 1 y 3.750 pasos, con un coste de aproximadamente 100 minutos en una unica GPU RTX PRO 6000. El conjunto de entrenamiento consta de 188 pares de Brasilia en la ronda final (el autor menciona ~2.000 pares en total entre todas las fuentes: renders 3D oblicuos de fotogramas de mapa de 1024 px emparejados con la pintura de Codex del mismo fotograma, mayoritariamente Brasilia, mas Sao Paulo, lineas de agua y costas, y 42 fotogramas de puntos de referencia mundiales).

La innovacion tecnica no reside en la arquitectura (un LoRA convencional de difusion image-to-image) sino en el pipeline de datos: los pares de entrenamiento se generan renderizando Google Photorealistic 3D Tiles y emparejandolos con las pinturas pixel-art correspondientes. La inferencia se realiza sin guidance (valor por defecto del pipeline) y con 28 pasos de inferencia. El autor describe este adaptador como ganador de la primera ronda de entrenamiento (7 de noviembre de 2026).

## Capacidades

- Transformacion image-to-image de renders 3D oblicuos de mapas urbanos a pixel-art isometrico.
- Preservacion de la topologia del mapa: el prompt de instancia exige mantener cada calle, edificio y arbol en su posicion.
- Estilo visual especifico del proyecto MiniDF (paleta y tratamiento pixel-art de Codex).
- Generalizacion limitada a otras ciudades y puntos de referencia (evaluada en Brasilia, Sao Paulo, Rio y 42 puntos de referencia mundiales).
- Entrada optimizada para imagenes de 1024x1024 px con perspectiva oblicua de ~30 grados y ~3,4 px por metro.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto; es exclusivamente un adaptador de imagen.
- Capacidades multilingues: no disponibles (el prompt de instancia esta en ingles; no se documenta soporte de otros idiomas).

## Casos de uso

- Generacion de mapas pixel-art para videojuegos: a partir de renders 3D de una ciudad real, el LoRA produce tiles isometricos coherentes con la topologia original, utiles como base para mapas de estilo retro en motores 2D.
- Visualizacion artistica de datos urbanos: convertir visores 3D de cartografia en ilustraciones pixel-art para presentaciones, articulos o exposiciones, manteniendo la fidelidad de calles y edificios.
- Prototipado de estilos visuales: el adaptador sirve como referencia reproducible para experimentar con LoRAs de estilo sobre Qwen-Image-2.1 y comparar metricas LPIPS entre rondas de entrenamiento.
- Reproduccion de la estetica MiniDF: el caso de uso declarado es replicar el look del mapa de Brasilia de MiniDF sobre nuevos renders, util para fans o derivados del proyecto.
- Investigacion en destilacion de estilo geografico: los pares (render 3D, pintura pixel-art) y las metricas publicadas permiten estudiar la transferencia de estilo condicionada por estructura en modelos de difusion.
- Generacion de assets para entornos de simulacion o educativos: mapas isometricos legibles a baja resolucion que preservan la estructura viaria, utiles en materiales didacticos de geografia urbana.
- Evaluacion comparativa de LoRAs de imagen: con LPIPS documentado en cinco grupos (Brasilia 0.401, landmarks 0.409, Sao Paulo 0.396, Rio 0.412, world 0.429), sirve como baseline para nuevos adaptadores de estilo.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| LPIPS | Juez ronda 1 (32 fotogramas de Brasilia reservados) | 0.416 |
| LPIPS | Conjunto de prueba de cinco grupos (global) | 0.410 |
| LPIPS | Brasilia | 0.401 |
| LPIPS | Landmarks | 0.409 |
| LPIPS | Sao Paulo | 0.396 |
| LPIPS | Rio | 0.412 |
| LPIPS | World | 0.429 |

No se han publicado resultados de benchmarks adicionales (FID, CLIP score, SSIM) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ejemplo de uso carga el pipeline `QwenImage21Pipeline` en bfloat16 sobre CUDA, lo que para un modelo base de 7B parametros implica del orden de 14-16 GB solo en pesos, mas activaciones y latentes a 1024x1024.
- GPU recomendadas: el entrenamiento se realizo en una RTX PRO 6000; para inferencia se requiere una GPU con al menos ~24 GB de VRAM (RTX 4090, A100 40GB, H100) segun el uso tipico de un modelo de difusion de 7B en bfloat16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB); no confirmado en la informacion disponible para GPUs de 16 GB o menos.
- Opciones de despliegue: diffusers (`QwenImage21Pipeline` + `load_lora_weights`), con `torch_dtype=torch.bfloat16` y `.to("cuda")`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a un pipeline de difusion de imagen).
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento (~100 minutos para 3.750 pasos en una RTX PRO 6000).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| handful/mndf-pixel-qwen-image-2.1 | LoRA image-to-image sobre Qwen-Image-2.1 | rank 16 (base 7B) | 1024x1024 px | LPIPS 0.410 global | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen-Image-2.1 | Modelo base text-to-image / edicion | 7B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Otros LoRAs de estilo sobre Qwen-Image-2.1 | Adaptadores de estilo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores comparables de pixel-art isometrico en la busqueda realizada.

## Limitaciones y advertencias

- Datos de entrenamiento con restricciones legales: los renders 3D de entrada son de Google Photorealistic 3D Tiles, y los terminos de Google Map Tiles no permiten usar su contenido para entrenar modelos. El autor comparte el LoRA como experimento de investigacion y recomienda revisar esos terminos antes de cualquier uso mas alla de ese ambito.
- El color del agua sale mas brillante que el teal profundo del objetivo.
- Las tramas muy finas (por ejemplo, la Torre de TV) solo aparecen si el render 3D las muestra.
- Funciona mejor con entradas del mismo tipo que las de entrenamiento: 1024x1024, oblicuidad de ~30 grados y ~3,4 px por metro; otros formatos o perspectivas pueden degradar el resultado.
- Sesgos conocidos: el modelo esta entrenado mayoritariamente con Brasilia, con menor representacion de Sao Paulo, Rio y puntos de referencia mundiales; el rendimiento cae en el grupo "world" (LPIPS 0.429 frente a 0.396 en Sao Paulo).
- Riesgo de alucinacion estructural: aunque el prompt pide mantener cada calle, edificio y arbol, no se garantiza fidelidad geometrica exacta; las metricas LPIPS miden similitud perceptual, no correccion topologica.
- Limitaciones de idioma: no se documenta soporte multilingue del prompt; el unico prompt de instancia publicado esta en ingles.
- Restricciones de licencia para uso comercial: la licencia del adaptador es apache-2.0, pero los terminos de los datos de entrenamiento de Google pueden impedir el uso comercial del modelo entrenado con ellos.
- Caveat de produccion: el repositorio tiene 0.0 GB y 0 descargas; no esta confirmado que los pesos del LoRA esten efectivamente publicados, lo que condiciona su uso practico.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/handful/mndf-pixel-qwen-image-2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Proyecto MiniDF map: https://cadeoflavio.marceloeduardo.com/
- Log de entrenamiento del LoRA: https://marceloeduardo.com/pixel-lora-training.html
- Pagina de Qwen-Image-2.1 en Learn AI: https://ai.miraheze.org/wiki/Qwen-Image-2.1

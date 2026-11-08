# handful/mndf-pixel-flux2-klein-4b

## Resumen

`handful/mndf-pixel-flux2-klein-4b` es un adaptador LoRA de imagen a imagen (image-to-image) construido sobre el modelo base `black-forest-labs/FLUX.2-klein-base-4B`. Su funcion es transformar un render 3D oblicuo de un mapa en una representacion isometrica de pixel art con el estilo visual del mapa MiniDF de Brasilia, manteniendo en su sitio cada carretera, edificio y arbol del render original. El autor del adaptador es el usuario `handful`, y el modelo base lo desarrolla Black Forest Labs dentro de su familia FLUX.2 [klein], orientada a generacion y edicion de imagen de baja latencia.

El LoRA se publica como un experimento de investigacion comparativo entre tres modelos (FLUX.2 klein 4B, Qwen Image 2.1 y Qwen-Image-Edit-2511) para una misma tarea de restilizado cartografico. Se entreno con 1.959 pares de imagenes (render 3D oblicuo de 1024 px frente a la pintura del mismo fotograma generada por Codex), con rango 16 y 2.500 pasos, y reporta un LPIPS de test de 0.389, mejor que el mejor resultado publicado de Qwen Image 2.1 (0.405) sobre el mismo conjunto congelado.

Su relevancia es doble: por un lado demuestra el uso de FLUX.2 klein como base para adaptaciones de estilo muy especificas con coste de entrenamiento bajo (una hora en una RTX PRO 6000); por otro, su model card advierte explicitamente de que los datos de entrenamiento derivan de Google Photorealistic 3D Tiles, cuyos terminos de uso no permiten entrenar modelos con ese contenido, lo que limita el adaptador a un uso estrictamente de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion FLUX.2-klein-base-4B |
| Parametros totales | no disponible (el adaptador es un LoRA de rango 16; el modelo base declara 4B en su nombre) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo de uso emplea `torch.bfloat16` |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA cargables con `diffusers` (`pipe.load_lora_weights`); el repositorio figura con 0.0 GB, por lo que el detalle de ficheros no esta disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre el pipeline `Flux2KleinPipeline` de diffusers. El entrenamiento se realizo con el script `train_dreambooth_lora_flux2_klein_img2img.py` de diffusers, con tasa de aprendizaje constante de 1e-4, volteo aleatorio (random flip), resolucion de 1024 px, tamano de lote 1 y 2.500 pasos, completados en una hora sobre una unica GPU RTX PRO 6000. El conjunto de entrenamiento consta de 1.959 pares de imagenes: un render 3D oblicuo de un fotograma de mapa de 1024 px como entrada y la pintura de Codex del mismo fotograma como objetivo.

Los datos proceden mayoritariamente de Brasilia, con anadidos de Sao Paulo, escenas de agua y costa, y 42 fotogramas de puntos de referencia mundiales. Los renders 3D de entrada son representaciones de Google Photorealistic 3D Tiles. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; al tratarse de un modelo de difusion de imagen, esos conceptos no aplican del mismo modo que en modelos de lenguaje.

## Capacidades

- Restilizado imagen a imagen: convierte un render 3D oblicuo de mapa en pixel art isometrico conservando la geometria (carreteras, edificios y arboles en su posicion).
- Transferencia de estilo especifica: reproduce el aspecto visual del mapa MiniDF de Brasilia pintado por Codex.
- Generacion condicionada por prompt de texto: el `instance_prompt` recomendado es "Repaint this 3D map render as mndfstyle isometric pixel-art map, keeping every road, building and tree in place".
- Control de fidelidad mediante `guidance_scale`: el autor recomienda 1.5; valores altos como 4.0 sobresaturan los colores.
- Inferencia en 28 pasos con resolucion de 1024x1024 en el ejemplo publicado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; es un adaptador de imagen.

## Casos de uso

- Produccion de cartografia estilo videojuego: a partir de renders 3D de un mapa real (por ejemplo, de una ciudad), generar tiles de pixel art isometrico para un juego o una visualizacion interactiva, manteniendo la correspondencia uno a uno con las vias y edificios del render de origen.
- Prototipado rapido de estetica para proyectos de mapas: evaluar como quedaria un mapa 3D existente con un acabado pixel art antes de invertir en arte manual, usando el LoRA sobre FLUX.2 klein para iterar en segundos por fotograma.
- Ilustracion de articulos o documentacion tecnica: convertir capturas de un visor 3D de mapas en imagenes estilizadas para blogs, presentaciones o material divulgativo, con la ventaja de que la escena representada sigue siendo reconocible.
- Comparacion de modelos en investigacion: servir como referencia reproducible en estudios de restilizado imagen a imagen, ya que el autor publica el conjunto de evaluacion congelado, la metrica (LPIPS VGG a 512 px) y los resultados de los tres modelos comparados.
- Generacion de assets para prototipos de videojuegos de gestion o estrategia: producir variantes estilizadas de mapas urbanos para maquetas jugables, dado que el adaptador preserva la topologia del render de entrada.
- Docencia y divulgacion sobre difusion: ejemplo didactico de entrenamiento de un LoRA de imagen a imagen con diffusers en una sola GPU y en una hora, util para cursos practicos de generacion de imagen.

## Benchmarks y rendimiento

El autor publica una evaluacion con LPIPS (VGG, 512 px, menor es mejor) sobre un conjunto de test congelado y no visto en entrenamiento, con media sobre cinco grupos:

| Conjunto de evaluacion | LPIPS (menor es mejor) |
|---|---|
| Media global (5 grupos) | 0.389 |
| Brasilia | 0.396 |
| Brasilia, puntos de referencia | 0.378 |
| Sao Paulo | 0.344 |
| Rio | 0.430 |
| Puntos de referencia mundiales | 0.397 |
| Mejor ronda de Qwen Image 2.1 en el mismo conjunto | 0.405 |
| Este LoRA con `guidance_scale` 4.0 (comprobacion de 20 fotogramas) | 0.428 |

No se han publicado resultados de benchmarks estandar de generacion de imagen (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- El autor entreno el LoRA en una unica RTX PRO 6000 en una hora, con lote 1 y 1024 px; esa cifra corresponde al entrenamiento, no a la inferencia.
- Para inferencia se necesita cargar el modelo base FLUX.2-klein-base-4B en `bfloat16` sobre CUDA, segun el ejemplo de la model card; la VRAM exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma explicita; por el perfil del modelo base (familia FLUX.2 klein, orientada a baja latencia) y el ejemplo con `torch_dtype=torch.bfloat16`, se presupone compatibilidad con GPU de datacenter y con GPU de consumo de gama alta, pero no se aportan cifras verificables.
- Opciones de despliegue documentadas: `diffusers` con `Flux2KleinPipeline` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de imagen en este formato).
- Latencia y throughput: no disponibles; el autor solo indica que el modelo base de la familia FLUX.2 klein alcanza inferencia "por debajo de un segundo" segun la model card oficial de Black Forest Labs, sin que se detalle la configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| handful/mndf-pixel-flux2-klein-4b | LoRA image-to-image sobre FLUX.2 klein 4B | LoRA rango 16; base 4B | 1024x1024, 28 pasos | LPIPS 0.389 (test congelado) | Apache 2.0 | Hugging Face |
| Qwen Image 2.1 (mejor ronda reportada) | Modelo de imagen | no disponible | no disponible | LPIPS 0.405 en el mismo conjunto | no disponible | no disponible en la informacion |
| Qwen-Image-Edit-2511 | Modelo de edicion de imagen | no disponible | no disponible | Participa en la comparacion de tres modelos del autor, sin cifra desglosada | no disponible | no disponible en la informacion |
| black-forest-labs/FLUX.2-klein-4B (base) | Difusion de imagen, generacion y edicion | 4B (segun denominacion) | no disponible | No evaluado como restilizador en esta ficha | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Licencia del adaptador Apache 2.0, pero los datos de entrenamiento derivan de Google Photorealistic 3D Tiles, cuyos terminos de Map Tiles no permiten usar su contenido para entrenar modelos. El propio autor limita el LoRA a un experimento de investigacion y pide revisar esos terminos antes de cualquier otro uso.
- El agua sale mas brillante que el teal profundo del objetivo, y las tramas muy finas (por ejemplo, la Torre de TV) solo aparecen si el render 3D de entrada las muestra.
- Funciona mejor con entradas parecidas a las de entrenamiento: 1024x1024, oblicuidad de unos 30 grados y aproximadamente 3.4 px por metro. Fuera de ese regimen la fidelidad geometrica puede degradarse.
- Con `guidance_scale` alto (4.0) los colores se sobresaturan; el autor recomienda 1.5.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede inventar o eliminar detalles del mapa, especialmente en zonas con poca informacion en el render de entrada.
- Sesgo de dominio: el entrenamiento esta concentrado en Brasilia, con menor representacion de Sao Paulo, Rio, costas y 42 puntos de referencia mundiales; el rendimiento en otras ciudades o tipos de mapa no esta evaluado.
- No se documentan sesgos demograficos ni limitaciones idiomaticas porque el modelo no procesa texto libre mas alla del prompt de estilo; los prompts de ejemplo estan en ingles.
- El repositorio figura con 0.0 GB y sin descargas ni likes en el momento de la consulta; conviene verificar la integridad de los ficheros antes de integrarlo en un pipeline de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handful/mndf-pixel-flux2-klein-4b
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Mapa MiniDF de Brasilia: https://cadeoflavio.marceloeduardo.com/
- Registro de entrenamiento y hojas de test del autor: https://marceloeduardo.com/pixel-lora-training.html
- Tutorial de FLUX.2-klein-4B (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-flux-2-klein-4b-high-fidelity-art-at-lightning-speed

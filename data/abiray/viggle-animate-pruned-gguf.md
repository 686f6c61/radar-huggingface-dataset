# Abiray/Viggle-Animate-pruned-GGUF

## Resumen

Abiray/Viggle-Animate-pruned-GGUF es un repositorio de cuantizaciones en formato GGUF de un checkpoint "pruned" de Viggle-Animate, un modelo generativo del que la model card indica que deriva de la estructura de Viggle-Animate / MiniMax-H3. El checkpoint de origen tiene 20.127.273.752 parametros (unos 20,13 mil millones) distribuidos en 536 tensores, y el repositorio publica cuatro cuantizaciones independientes generadas desde una misma base en coma flotante: Q3_K_M, Q4_K_M, Q5_K_M y Q6_K, con un tamano total de repositorio de 51,3 GB.

El interes tecnico del repositorio esta en su politica de proteccion de tensores: determinados grupos (tablas y proyecciones AdaLN, proyecciones de parches de audio y video, proyeccion de condicionamiento y capas de salida finales de video y audio) se mantienen en F32 en lugar de someterse a la cuantizacion K, y todos los tensores unidimensionales tambien se almacenan en F32. Esto sugiere un esfuerzo por preservar la precision de los modulos de normalizacion adaptativa y de las proyecciones de entrada/salida, tipicos de arquitecturas de difusion con transformer (DiT), a costa de un ligero aumento del peso de esos componentes.

El destino declarado de estos ficheros son flujos de trabajo de ComfyUI compatibles con GGUF, y el autor indica que la variante Q4_K_M se probo en ComfyUI con el flujo "Viggle-Animate H3" antes de su publicacion. No se documentan datos de entrenamiento, licencia, idiomas ni benchmarks, por lo que la evaluacion practica depende en gran medida del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los nombres de tensores —AdaLN, proyecciones de parches de audio/video, salidas finales de video y audio— apuntan a un transformer de difusion con normalizacion adaptativa, sin confirmacion del autor) |
| Parametros totales | 20.127.273.752 (aprox. 20,13 B) |
| Parametros activos | no disponible (la model card menciona "approximately 20.127B active parameters", sin desglose de expertos ni confirmacion de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K (mas base en coma flotante F16 con grupos de tensores protegidos en F32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a los terminos de licencia del modelo y repositorio upstream) |
| Formato de pesos | GGUF (generado con un cuantizador de llama.cpp parcheado) |
| Tamano del repositorio | 51,3 GB en total |
| Numero de tensores | 536 |
| Fecha de publicacion | 13 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card se limita a describir la estructura del checkpoint de origen y el proceso de cuantizacion. Los unicos datos estructurales confirmados son: 536 tensores, 50 tensores de proyeccion AdaLN por bloque que permanecen factorizados con forma `[96768, 8]` (factorizacion de rango 8) y una proyeccion AdaLN final con forma `[10752, 8]`.

Los nombres de los grupos de tensores protegidos (`adaln_t_table`, `adaln_proj.linear`, `audio_patch_proj`, `video_patch_proj`, `condition_proj`, `final_layer.video_out`, `final_layer.audio_out`) indican un modelo multimodal de generacion audiovisual con condicionamiento, con rutas separadas de salida para video y audio y modulacion AdaLN por bloque, un patron habitual en transformers de difusion (DiT). El calificativo "pruned" del nombre del checkpoint sugiere un recorte previo del modelo original, pero no se documenta la metodologia, el porcentaje de recorte ni el efecto sobre la calidad. La innovacion declarada por el autor es de tipo practico, no arquitectonica: una politica de proteccion que mantiene en F32 los modulos sensibles a la cuantizacion y todos los tensores 1-D, mientras el resto de tensores pesados se convierten a F16 en la base GGUF y se cuantizan despues con el cuantizador parcheado de llama.cpp.

## Capacidades

- Generacion de contenido audiovisual: la presencia de `video_patch_proj`, `audio_patch_proj`, `final_layer.video_out` y `final_layer.audio_out` indica rutas de generacion de video y audio, presumiblemente a partir de condicionamiento (via `condition_proj`).
- Condicionamiento multimodal: existe una proyeccion de condicionamiento dedicada, lo que encaja con flujos de animacion o reanimacion guiada por una señal de entrada.
- Normalizacion adaptativa por bloque: la modulacion AdaLN en 50 bloques permite condicionar la normalizacion en funcion de la senal de control.
- Ejecucion en ComfyUI: los ficheros estan pensados para nodos de carga GGUF en ComfyUI; el autor verifico Q4_K_M con el flujo "Viggle-Animate H3".
- Generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, uso de agentes, modo "thinking", vision general o audio-texto: no disponible, sin evidencia en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Animacion de personajes en produccion audiovisual: el modelo se cargaria en ComfyUI mediante los nodos GGUF y se usaria para generar clips animados condicionados por una señal de entrada, aprovechando las rutas separadas de video y audio para producir ambas pistas de forma coherente.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: al existir variantes Q3_K_M y Q4_K_M, un equipo puede validar el flujo completo con requisitos de VRAM contenidos antes de invertir en variantes de mayor precision.
- Generacion de audio sincronizado con video: las proyecciones y capas de salida de audio dedicadas permiten abordar tareas de doblaje, efectos o bandas sonoras generadas junto al video.
- Tuberias de postproduccion con control de calidad por etapas: usar Q6_K para la renderizacion final y Q4_K_M para previsualizacion y ajuste de parametros, comparando resultados con la misma semilla.
- Investigacion sobre cuantizacion de transformers de difusion audiovisual: el repositorio es un caso de estudio util para medir el impacto de proteger tensores AdaLN y proyecciones de entrada/salida en F32 frente a cuantizarlos en K-quant.
- Despliegue local en estudios pequenos sin acceso a clusters: las variantes de menor peso permiten ejecutar generacion audiovisual en una unica GPU de 12-24 GB, sin depender de servicios en la nube.
- Integracion en flujos por lotes dentro de ComfyUI: los ficheros se pueden encadenar en grafos con otros nodos (upscaling, interpolacion, codificacion) para producir variantes de un mismo clip de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, FAD, CLIP score, SSIM ni ninguna otra) ni comparaciones con el checkpoint sin cuantizar. El unico dato de validacion mencionado es cualitativo: la variante Q4_K_M se probo en ComfyUI con el flujo Viggle-Animate H3 antes de publicarse.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 20,13 B de parametros y los bits por peso tipicos de cada variante; las cifras incluyen los tensores protegidos en F32):
  - Q3_K_M: aproximadamente 9,8 GB
  - Q4_K_M: aproximadamente 12,2 GB
  - Q5_K_M: aproximadamente 14,3 GB
  - Q6_K: aproximadamente 16,6 GB
- Overhead adicional de VRAM (latenes, atencion, VAE de video/audio, cache de condicionamiento): no disponible. En generacion de video suele ser significativo y puede superar el peso del modelo, por lo que las cifras anteriores son un minimo orientativo y no un requisito final.
- GPU de consumo compatibles de forma orientativa: RTX 3060 de 12 GB y RTX 4070 de 12 GB para Q3_K_M con margen ajustado; RTX 4070 Ti Super, RX 7900 XT y RTX 4080/5080 de 16 GB para Q4_K_M y Q5_K_M; RTX 4090, RTX 5090 y RTX A6000 de 24-48 GB para Q6_K y para resoluciones o duraciones mayores.
- GPU profesionales: A100 de 40/80 GB, H100 de 80 GB, L40S de 48 GB, recomendables para lotes, resoluciones altas o ejecucion concurrente.
- Opciones de despliegue: ComfyUI con soporte GGUF (escenario declarado por el autor); el cuantizador empleado es una version parcheada de llama.cpp. No hay evidencia de soporte para vLLM, TGI, Ollama u otros servidores de inferencia de texto.
- Latencia y throughput: no disponibles. No se publican tiempos por clip, resolucion ni numero de pasos de muestreo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, ni incluye datos de rendimiento del checkpoint upstream (Viggle-Animate / MiniMax-H3) ni de otras cuantizaciones alternativas del mismo modelo. Como referencia interna del propio repositorio, se puede comparar la relacion entre precision y peso de las cuatro variantes publicadas:

| Variante | Peso estimado de pesos | Uso previsto segun el autor |
|---|---|---|
| Q3_K_M | ~9,8 GB | Maxima reduccion de VRAM, menor fidelidad |
| Q4_K_M | ~12,2 GB | Variante verificada por el autor en ComfyUI |
| Q5_K_M | ~14,3 GB | Compromiso entre fidelidad y VRAM |
| Q6_K | ~16,6 GB | Mayor fidelidad de la cuantizacion K publicada |

No se dispone de datos de calidad (FVD, FAD ni similitud con el modelo sin cuantizar) para ninguna de ellas.

## Limitaciones y advertencias

- No se especifica licencia en el repositorio. La model card remite a los terminos del modelo y repositorio upstream (Viggle-Animate / MiniMax-H3), por lo que el uso comercial queda sin determinar y requiere verificacion directa con dichos terminos antes de cualquier despliegue en produccion.
- El checkpoint es una version "pruned" del modelo original y no se documenta el criterio ni la magnitud del recorte, lo que impide saber que capacidades pueden haberse degradado.
- No hay benchmarks ni evaluacion cuantitativa: solo una prueba cualitativa de Q4_K_M en un flujo concreto de ComfyUI.
- No se documentan la longitud de contexto, la resolucion, la duracion maxima de video, el numero de pasos de muestreo ni los parametros de inferencia recomendados.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; en modelos generativos audiovisuales se traduce habitualmente en artefactos, incoherencias temporales y sesgos en la representacion de personas, pero no hay datos que lo confirmen para este checkpoint.
- Los grupos de tensores en F32 y los tensores 1-D se mantienen sin cuantizar, de modo que la reduccion de tamano respecto a una cuantizacion completa es algo menor de lo habitual.
- El repositorio no declara compatibilidad mas alla de ComfyUI con GGUF; no hay evidencia de que los ficheros funcionen en llama.cpp estandar, vLLM u otros runners.
- El repositorio registra 0 descargas y 0 "likes", asi que no existe retroalimentacion de la comunidad sobre su correcto funcionamiento.
- Las fechas de creacion y actualizacion (13 de septiembre de 2026) son las unicas disponibles para situar la publicacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Abiray/Viggle-Animate-pruned-GGUF
- Modelo upstream Viggle-Animate: no disponible (referenciado en la model card sin enlace)
- Estructura derivada MiniMax-H3: no disponible (referenciada en la model card sin enlace)
- Paper, blog, repositorio de codigo o demo: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relevante sobre el modelo (unicamente paginas de inicio de sesion de Google Docs).

# AcademiaSD/TAE_Flux2_AcademiaSD

## Resumen

TAE_Flux2_AcademiaSD es un decodificador Tiny AutoEncoder (TAE), en la linea de TAESD, desarrollado por AcademiaSD para generar previsualizaciones rapidas y nitidas de los latentes de FLUX.2 y FLUX.2 Klein dentro de ComfyUI. Sustituye a Latent2RGB, la proyeccion lineal 32→3 que ComfyUI usa por defecto como preview de este modelo y que produce imagenes borrosas y con bloques. Su funcion es convertir los latentes que maneja el sampler (`x0`) en una imagen RGB visible sin necesidad de cargar el VAE completo.

El modelo es un decoder plano destilado del VAE de FLUX.2 (`flux2-vae.safetensors`), con 1,66 millones de parametros y un fichero de 3,3 MB en fp16. Trabaja en el espacio latente `Flux2` de ComfyUI (128 canales a 1/16 de resolucion) y devuelve RGB a 16 veces la resolucion del latente, en el rango [0, 1]. Al compartir el VAE, funciona tanto con FLUX.2 [dev] como con FLUX.2 [klein] en sus variantes de 4B y 9B.

Su relevancia es practica: en flujos de generacion de imagen con FLUX.2, poder ver un preview fiel durante el muestreo acelera la iteracion del usuario sin comprometer la decodificacion final, que sigue haciendose con el VAE real. El modelo declara una mejora de 24,4 dB de PSNR frente a los 16,4 dB de Latent2RGB sobre 62 fotografias de stock a 512×512. Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder TAESD plano (flat), width 64, upscale 16× |
| Parametros totales | 1,66 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | fp16 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`TAE_Flux2_AcademiaSD.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un decoder estilo TAESD de tipo plano: `Clamp → conv → 4 × (3 bloques + 2× upsample + conv) → bloque → conv`, con ancho de 64 canales y un factor de upscale de 16×. Recibe latentes de FLUX.2 de 128 canales a 1/16 de resolucion, exactamente el espacio `x0` tal y como lo ve el sampler, por lo que no requiere escalado adicional de los latentes. La salida es una imagen RGB en el rango [0, 1]. No incluye encoder: es exclusivamente un decoder de previsualizacion.

El entrenamiento se hizo por destilacion desde el VAE de FLUX.2 (`flux2-vae.safetensors`) actuando como teacher. Se usaron imagenes variadas en recortes de 512×512, codificadas una sola vez con el VAE real. La configuracion reportada es de 30.000 pasos, batch 8, teselas de 512×512, optimizador AdamW con LR 5e-4 y decaimiento coseno, perdida combinada L1 + FFT y EMA de 0,999. Se aplico aumentacion de ruido sobre el latente para estabilizar las previsualizaciones en el `x0` ruidoso de los primeros pasos del muestreo.

## Capacidades

- Decodificacion de latentes FLUX.2 (128 canales, 1/16 de resolucion) a imagenes RGB con upscale 16×.
- Generacion de previsualizaciones en tiempo real durante el muestreo en ComfyUI, con calidad notablemente superior a Latent2RGB.
- Compatibilidad con FLUX.2 [dev] y FLUX.2 [klein] 4B y 9B, al compartir estos el mismo VAE.
- Integracion con ComfyUI mediante el nodo Model Preview Override de ComfyUI-KJNodes, colocado entre el modelo y el sampler.
- Sustitucion del metodo de preview nativo TAESD de ComfyUI (que para el formato de FLUX.2 busca el fichero `taef2_decoder` y no reconoce este).
- No dispone de encoder, no genera texto y no soporta tool calling ni capacidades de agente.

## Casos de uso

- Iteracion rapida en generacion de imagenes con FLUX.2: durante el muestreo, el decoder produce un preview fiel en cada paso, permitiendo al usuario ajustar prompts y semillas sin esperar a la decodificacion completa con el VAE.
- Ajuste de parametros del sampler: al mostrar una imagen cercana al resultado final, facilita comparar schedulers, pasos y CFG sin lanzar decodificaciones completas.
- Interfaces de generacion interactiva: en aplicaciones con vista previa en vivo, reduce la latencia percibida al no requerir el VAE completo para mostrar progreso.
- Optimizacion de VRAM en equipos modestos: con solo 3,3 MB y 1,66 M de parametros, el preview puede mantenerse cargado permanentemente sin coste apreciable de memoria frente al VAE.
- Flujos por lotes en ComfyUI: permite descartar rapidamente generaciones poco prometedoras antes de gastar recursos en la decodificacion final.
- Validacion visual de pipelines: util para comprobar que los latentes que produce un sampler o un nodo custom tienen la estructura esperada, comparando el preview con el resultado del VAE.
- Prototipado de herramientas sobre FLUX.2: al aislar la decodificacion del VAE, sirve para testear integraciones de ComfyUI sin depender de la carga del VAE real.

## Benchmarks y rendimiento

| Metrica | TAE_Flux2_AcademiaSD | Latent2RGB (ComfyUI) |
|---|---|---|
| PSNR frente al original (62 fotos stock, 512×512) | 24,4 dB | 16,4 dB |

El PSNR se mide contra la fotografia original, por lo que incluye tambien la perdida propia del VAE. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el fichero ocupa 3,3 MB en fp16.
- GPU recomendadas: cualquiera, incluidas integradas. No requiere GPU dedicada; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo: si, incluidas GTX serie 10 y anteriores, y en CPU.
- Opciones de despliegue: ComfyUI con ComfyUI-KJNodes (nodo Model Preview Override). No esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explicita; al ser un decoder de 1,66 M de parametros, el coste por paso es marginal frente al propio muestreo de FLUX.2.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia |
|---|---|---|---|---|
| TAE_Flux2_AcademiaSD | Decoder TAE destilado | 1,66 M | Preview de latentes FLUX.2 | Apache 2.0 |
| Latent2RGB (ComfyUI) | Proyeccion lineal 32→3 | no aplica | Preview por defecto de FLUX.2 | integrado en ComfyUI |
| TAESD (madebyollin) | Decoder TAE | variable segun modelo | Preview para SD y variantes | segun repositorio original |
| VAE de FLUX.2 (`flux2-vae.safetensors`) | Autoencoder completo | no disponible | Decodificacion final de latentes FLUX.2 | segun FLUX.2 |

No se dispone de datos de benchmarks comparativos con TAESD generico ni con el VAE completo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo sirve para previsualizar: la decodificacion final debe hacerse siempre con el VAE real de FLUX.2.
- Es unicamente decoder; no incluye encoder.
- Entrenado y probado exclusivamente con el VAE de FLUX.2, por lo que no es valido para otros espacios latentes.
- El metodo de preview TAESD nativo de ComfyUI no lo reconoce (busca `taef2_decoder`); es obligatorio usar el nodo Model Preview Override de ComfyUI-KJNodes.
- Requiere ComfyUI-KJNodes como dependencia externa.
- No se han publicado datos sobre sesgos, alucinacion o comportamiento en idiomas, ya que no es un modelo linguistico.
- Licencia Apache 2.0, que permite uso comercial con las condiciones habituales de atribucion y aviso de licencia.

## Enlaces

- HuggingFace: https://huggingface.co/AcademiaSD/TAE_Flux2_AcademiaSD
- Arquitectura TAESD original: https://github.com/madebyollin/taesd
- Nodo Model Preview Override (ComfyUI-KJNodes): https://github.com/kijai/ComfyUI-KJNodes
- FLUX.2 (Black Forest Labs): https://blackforestlabs.ai
- YouTube de AcademiaSD: https://www.youtube.com/@Academia_SD
- X / Twitter de AcademiaSD: https://twitter.com/Academia_S_D
- Discord de AcademiaSD: https://discord.gg/Syuaduy678
- Ko-fi de AcademiaSD: https://ko-fi.com/academiasd

# intel-ai/MiniMax-H3-MXFP8-CT-AutoRound

## Resumen

MiniMax-H3-MXFP8-CT-AutoRound es una build cuantizada en MXFP8 del modelo omni-modal MiniMax-H3, publicada por el usuario intel-ai. MiniMax-H3 es un generador de vídeo con audio estéreo nativo basado en diffusion transformers (DiT): incorpora dos DiT de 33,12 B parámetros cada uno (el denoiser FL2VA/T2VA y el denoiser condicionado por referencia Ref2VA) más un codificador de texto Qwen3-VL de 64 capas, junto con VAEs independientes de vídeo y audio.

Esta variante se ha producido con Intel auto-round en modo RTN zero-shot y se ha convertido al layout fusionado nativo que sirve vLLM-Omni. La diferencia frente a otras builds del mismo autor es que aquí se cuantizan tanto los dos DiT como el codificador de texto (build "integral"), mientras que la rama AdaLN de cada DiT se mantiene deliberadamente en BF16 porque vLLM-Omni precálcula y cachea su modulación.

El resultado es un checkpoint de 141,3 GB en el repositorio, con cada DiT reducido de ~62 GiB (BF16) a 43,65 GiB y el codificador de texto de ~63 GiB a ~34 GiB. Se sirve de extremo a extremo en 2×H200 con tensor paralelismo 2 y, según la model card, mantiene una calidad muy cercana al BF16 (imaging_quality 0,6284 frente a 0,6306 en VBench dense93, un −0,35 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) omni-modal: dos DiT de 33,12 B (FL2VA/T2VA y Ref2VA) mas codificador de texto Qwen3-VL de 64 capas; VAE de video y VAE de audio |
| Parametros totales | no disponible (los dos DiT suman 66,24 B; el total del codificador de texto no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (pesos F8_E4M3 con escalas de bloque E8M0 en U8, group_size=32, sym=True; activaciones mx_fp de 8 bits dinamicas, act_group_size=32) en los 312 lineales de cada DiT y los 448 lineales del codificador de texto; BF16 en AdaLN, norms, embedders, biases y torre de vision |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors, layout fusionado nativo de vLLM-Omni (packing_format="auto_round:llm_compressor", autoround_version 0.17.0) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un generador omni-modal con dos diffusion transformers que comparten arquitectura y un codificador de texto compartido. Cada DiT cuantiza 6 lineales por bloque a lo largo de 52 bloques (312 en total): `attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`, `ff.net.0.proj` (gate+up de SwiGLU) y `ff.net.2`. La rama AdaLN (`adaln_proj.linear`, presente 52 veces por DiT y que la model card cifra en ~13 B por DiT) se deja en BF16 de forma intencionada: vLLM-Omni precalcula y cachea su modulacion, de modo que en inferencia pura nunca pasa por un matmul y cuantizarla solo aportaria perdida de precision sin ganancia de velocidad. El desglose por DiT es 312 tensores F8_E4M3 (18,66 GiB), 312 escalas U8 (0,58 GiB), 314 tensores BF16 (24,34 GiB) y 12 tensores F32 (0,06 GiB).

En el codificador de texto (Qwen3-VL) se cuantizan los 7 lineales por capa de las 64 capas del bloque de lenguaje (`self_attn.q/k/v/o_proj` y `mlp.gate/up/down_proj`), lo que suma 448 pesos F8_E4M3 (~29,06 GiB) mas 448 escalas U8 (~0,91 GiB), con 610 tensores BF16 (~4,01 GiB) correspondientes a la torre de vision, embeddings, norma final y lm_head. La torre de vision no se cuantiza. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base.

La innovacion tecnica destacable de esta publicacion es de infraestructura: la conversion al layout fusionado nativo de vLLM-Omni y el uso, en H200, de un kernel Marlin de dequantizacion para ejecutar los pesos FP8 (correcto y ahorrador de memoria, pero no mas rapido que BF16). El proceso de cuantizacion es RTN zero-shot con Intel auto-round 0.17.0, sin calibracion adicional declarada.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones de hasta 1344x768 y 24 fps.
- Generacion conjunta de video y audio estereo nativo (text-to-audio-video), con sincronizacion entre ambas modalidades.
- Generacion de video condicionada por imagen (image-to-video).
- Generacion condicionada por referencia mediante el DiT Ref2VA, orientada a mantener la identidad o el estilo de un sujeto de referencia.
- Procesamiento multimodal de entrada: el codificador Qwen3-VL aporta torre de vision (mantenida en BF16) para la codificacion de referencias visuales y textuales.
- Modo de muestreo configurable por flow matching: la model card documenta 32 pasos de inferencia, flow-shift 12 y audio-flow-shift 3.0 en la tarea `t2va`.
- Soporte de tool calling / function calling: no disponible (no es una capacidad declarada para este modelo).
- Soporte de agentes y razonamiento multi-paso: no aplica a un modelo generativo de video/audio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado audiovisual para cine y publicidad: generar clips de 10 segundos a 1344x768 y 24 fps con audio estereo sincronizado para validar guiones o storyboards antes de produccion, usando el modo text-to-audio-video con una sola pasada.
- Doblaje y localizacion rapida: sustituir la banda de audio de un clip manteniendo el video generado, aprovechando que el modelo produce audio estereo nativo junto con la imagen.
- Animacion de assets graficos: usar el modo image-to-video para convertir ilustraciones o renders estaticos en planos animados de hasta 243 frames, util en equipos de diseno sin pipeline 3D.
- Contenido de marketing a escala: generar variaciones de un mismo anuncio (planos, iluminacion, encuadre) a partir de prompts, con la ventaja de que el audio se produce en la misma generacion y no requiere postproceso separado.
- Material didactico y e-learning: crear explicaciones animadas con narracion sincronizada para cursos tecnicos, aprovechando la generacion conjunta de video y audio.
- Investigacion en cuantizacion de modelos generativos: este repositorio es un artefacto de evaluacion que permite reproducir el impacto de MXFP8 sobre un DiT de gran escala y comparar contra el checkpoint BF16 con prompts y semillas fijas (seed 0).
- Evaluacion de infraestructura de inferencia: servir la build en 2xH200 con vLLM-Omni y medir el comportamiento del kernel Marlin de dequantizacion en cargas de video, util para equipos que dimensionan clusters de inferencia multimodal.
- Generacion condicionada por referencia para series o campanas con personaje recurrente: el DiT Ref2VA permite mantener consistencia de un sujeto a lo largo de planos distintos.

## Benchmarks y rendimiento

La model card solo publica una metrica cuantitativa, correspondiente a VBench dense93 (evaluacion del 2026-10-14, n=93). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible.

| Metrica | BF16 (referencia) | MXFP8 DiT+TE (este modelo) | Variacion |
|---|---|---|---|
| VBench dense93, imaging_quality | 0,6306 | 0,6284 | -0,35 % |

La comparacion cualitativa se realiza sobre el ejemplo oficial T2VA ("starship captain"): ambos clips se generan a 1344x768, 24 fps, 243 frames (10,12 s), 32 pasos, seed 0, flow-shift 12 y audio-flow-shift 3.0, de modo que la unica variable es la cuantizacion. No se aportan cifras de latencia, throughput ni FVD en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 43,65 GiB por DiT (dos instancias) mas ~34 GiB del codificador de texto, ademas de los VAE sin cuantizar y las activaciones; el repositorio completo pesa 141,3 GB.
- Configuracion documentada de despliegue: 2xH200 con tensor paralelismo 2 (TP2), capaz de servir el pipeline completo de video con audio sincronizado.
- GPU recomendadas: H200 (configuracion validada por el autor). No se documentan otras GPU en la informacion disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo; el checkpoint no es desplegable en una unica tarjeta de 24 GB ni de 48 GB.
- Opciones de despliegue: vLLM-Omni en layout nativo. No se documentan soportes para llama.cpp, Ollama ni TGI.
- Parche necesario: hace falta aplicar un parche a `encoder.py` de vLLM-Omni para que el codificador de texto MXFP8 serializado se enrute, remapee escalas y reempaquete correctamente. Sin el parche aparecen del orden de 700 avisos `weight_scale has no target parameter` y el prompt se ignora.
- Kernel en H200: los pesos FP8 se ejecutan mediante un kernel Marlin de dequantizacion, que preserva la precision y reduce memoria pero no acelera la inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos omni-modales de video con audio comparables en la informacion proporcionada. La comparacion posible se limita a las variantes del propio MiniMax-H3 citadas en la model card.

| Modelo | Componentes cuantizados | Tamano de pesos | Calidad (VBench imaging_quality) | Notas |
|---|---|---|---|---|
| MiniMax-H3 (BF16, base) | ninguno | ~62 GiB por DiT + ~63 GiB codificador de texto | 0,6306 | Referencia de calidad; requiere mas memoria |
| MiniMax-H3-MXFP8-CT-AutoRound (este modelo) | 2 DiT + codificador de texto (integral) | 43,65 GiB por DiT + ~34 GiB codificador de texto | 0,6284 (-0,35 %) | Requiere parche de vLLM-Omni; AdaLN en BF16 |
| MiniMax-H3-mxfp8-native (variante companera) | solo los 2 DiT; codificador de texto en BF16 | no disponible | no disponible | Mismo layout nativo, menor compresion global |

Frente a otros generadores de video open source de la misma categoria (por ejemplo, familias tipo Wan o HunyuanVideo) no hay datos de parametros, contexto, licencia ni rendimiento en la informacion disponible, por lo que no se incluye comparacion.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la unica metrica publicada indica una caida del 0,35 % en imaging_quality; no hay evaluacion de otras dimensiones (movimiento, consistencia temporal, calidad de audio).
- Dependencia de un parche manual en vLLM-Omni. Sin el, el prompt se ignora y el modelo devuelve resultados no condicionados, ademas de generar cientos de avisos sobre escalas sin parametro destino.
- La rama AdaLN permanece en BF16 (aproximadamente el 55 % de los bytes por DiT), lo que limita la compresion final a ~0,71x en cada DiT.
- La torre de vision del codificador de texto no esta cuantizada, de modo que el ahorro de memoria depende del reparto entre componentes.
- Artefacto marcado explicitamente como de investigacion y evaluacion; no es un modelo validado para produccion.
- Estado de validacion comunitario nulo en el momento de la ficha: 0 descargas y 0 likes.
- Riesgo de alucinacion visual y de artefactos de generacion (fisica incoherente, texto ilegible en imagen, desincronizacion audio-video): no se documentan tasas concretas.
- Idioma: la model card no declara idiomas soportados ni cobertura multilingue del codificador de texto.
- Licencia: minimax-h3-community-license-agreement (license: other). Las condiciones exactas de uso comercial no se detallan en la informacion proporcionada; hay que consultar el texto de la licencia antes de cualquier despliegue comercial.
- Dimensionamiento de infraestructura: requiere 2xH200 (TP2) segun la unica configuracion validada, lo que excluye hardware de consumo y encarece cualquier prueba.
- Longitud de contexto y limites de duracion: la model card solo documenta clips de 243 frames (10,12 s); no se especifica el maximo soportado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/intel-ai/MiniMax-H3-MXFP8-CT-AutoRound
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Ejemplo oficial T2VA: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/assets/t2va.mp4
- Intel auto-round (herramienta de cuantizacion): https://github.com/intel/auto-round
- Repositorio companero citado en la model card: MiniMax-H3-mxfp8-native (URL no disponible en la informacion proporcionada)

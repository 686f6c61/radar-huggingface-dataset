# haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8

## Resumen

MiniMax-H3-Ref2VA-Pruned-FP8 es una exportacion en precision mixta FP8 del checkpoint podado MiniMax-H3-Ref2VA-Pruned-BF16, publicada por el usuario haideraqeeb. Se trata de un modelo de generacion de video condicionado por imagen (pipeline image-to-video) pensado para ComfyUI, con salida de video y audio estereo sincronizados y VAEs de video y audio separados del modelo de difusion.

La aportacion principal es la reduccion de almacenamiento: los pesos ocupan 20,96 GB frente a los 40,23 GB del BF16 podado del que deriva, manteniendo el pruning de AdaLN ya aplicado en el origen y sin anadir pruning estructural adicional. El modelo conserva 50 bloques transformer, cuantiza a FP8 E4M3FN 200 matrices (QKV, salida de atencion y fc1, mas fc2) y preserva byte a byte los 332 tensores restantes.

Es relevante ahora porque permite ejecutar un modelo de difusion de video Ref2VA en un unico fichero de ~21 GB dentro de un flujo ComfyUI, reutilizando las escalas de activacion estaticas publicadas por Comfy-Org. No es una release oficial de MiniMax: es una conversion independiente sujeta a la licencia de comunidad de MiniMax H3, con 0 descargas y 0 votos en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con 50 bloques transformer y proyecciones AdaLN; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3FN con escala FP32 por matriz para QKV, salida de atencion y MLP fc1 (150 matrices), con activaciones FP8 escaladas estaticamente; FP8 E4M3FN almacenado y desquantizado a BF16 para GEMM en MLP fc2 (50 matrices); BF16 en AdaLN y atencion; FP32 en la tabla de timesteps |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors con etiquetas `comfy_quant` |
| Tamano del repositorio | 21,0 GB (pesos almacenados: 20,96 GB) |
| Salida validada | 1344 x 768, 30 pasos, res_multistep, schedule beta, semilla 0, 124 fotogramas a 24 fps (~5,17 s) con audio estereo |
| Modelo base | haideraqeeb/MiniMax-H3-Ref2VA-Pruned-BF16 |

## Arquitectura y entrenamiento

El checkpoint es un transformer de difusion de 50 bloques con proyecciones AdaLN, segun se deduce de la politica de cuantizacion descrita en la model card (los bloques AdaLN y la tabla de timesteps FP32 se preservan fuera del alcance de FP8). La exportacion no entrena ni ajusta nada: parte del checkpoint podado en BF16, conserva el pruning de AdaLN existente y aplica cuantizacion a 200 matrices. Las matrices QKV, la salida de atencion y MLP fc1 se almacenan en FP8 E4M3FN con multiplicacion FP8 nativa (pesos y activaciones escaladas estaticamente); las 50 matrices de MLP fc2 se almacenan tambien en FP8 pero se desquantizan para ejecutar un GEMM en BF16. Cada matriz tiene una unica escala de peso FP32 calculada como `max(abs(weight)) / 448`; la conversion divide por esa escala y redondea a E4M3FN.

Quedan fuera de FP8 las normas, los refinadores de tokens y las proyecciones de entrada y salida, asi que los 332 tensores restantes se conservan byte a byte respecto al origen, incluidas las proyecciones AdaLN en BF16 y la tabla de timesteps en FP32. La atencion usa BF16 con PyTorch SDPA. Las 150 escalas de activacion estaticas y las etiquetas por capa `comfy_quant` se reutilizan del repositorio de Comfy-Org; el autor no ha calibrado las activaciones de forma independiente y desconoce el dataset de calibracion original, por lo que reproduce el formato y la politica de escalado observables, no necesariamente un procedimiento de conversion bit a bit identico. El text encoder y los VAEs son componentes separados y no estan cuantizados por esta exportacion. No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, RLHF o DPO, ni innovaciones de decodificacion.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) de aproximadamente 5 segundos a 24 fps, con 124 fotogramas nativos y resolucion validada de 1344 x 768.
- Generacion de audio estereo sincronizado junto al video, mediante VAE de audio independiente y VAE de video en FP32.
- Condicionamiento tipo Ref2VA a traves de los nodos de condicionamiento H3 Ref2VA de ComfyUI, con text encoder externo.
- Ejecucion de FP8 nativo con precision mixta en ComfyUI: 4.500 multiplicaciones de matrices FP8 nativas verificadas sin errores de kernel en la validacion del autor.
- Compatibilidad con el formato de etiquetas `comfy_quant` para el manejo automatico de pesos y escalas.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica a este tipo de modelo; no hay soporte documentado.
- Capacidades multilingues: no disponibles (no se documentan idiomas del text encoder, que ademas se distribuye por separado).
- Modo de razonamiento explicito (thinking mode), vision de entrada o audio de entrada: no disponibles.

## Casos de uso

- Previsualizacion de storyboards y animaticos: convertir un fotograma clave (ilustracion, render 3D o concepto) en un plano de unos 5 segundos a 1344 x 768 con audio, suficiente para validar ritmo y encuadre antes de producir en 3D o rodaje real.
- Prototipado de anuncios y creatividades para redes: generar variantes rapidas de un mismo concepto visual a partir de una imagen de referencia y revisar cual funciona, con la ventaja de que el audio estereo sale sincronizado y permite evaluar el anuncio completo.
- Animacion de ilustracion y arte conceptual: dar movimiento a laminas o keyframes de un artista sin pipeline de animacion previo, trabajando dentro de ComfyUI y sin salir del grafo de nodos.
- Generacion de B-roll y material de relleno: producir planos cortos de recurso para montajes, documentales o videos corporativos donde no hay metraje disponible, con resolucion suficiente para insertos de 720p sin reescalado agresivo.
- Scratch tracks de audio para montaje: usar el audio generado como referencia temporal para un montador o un disenador de sonido antes de la mezcla final, ya que el modelo entrega video y audio en la misma inferencia.
- Iteracion local en estaciones de trabajo de gama alta: el fichero de 20,96 GB reduce el coste de carga en memoria frente a los 40,23 GB del BF16 podado, lo que agiliza las iteraciones de prompt y semilla en una estacion con una sola GPU de gran memoria.
- Investigacion sobre cuantizacion FP8 en modelos de difusion de video: el repositorio incluye informes de auditoria por capa (`validation/`) y metricas de divergencia, utiles como caso de estudio reproducible para medir el impacto de FP8 en latentes de video y audio.
- Sintesis de datos de video para tareas auxiliares: generar clips etiquetados a partir de imagenes controladas para experimentos de deteccion de movimiento, sincronizacion audio-video o modelos de world modeling, siempre que la licencia de comunidad lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. Para un modelo de difusion de video no aplican metricas tipo MMLU, HumanEval o GSM8K. El autor publica mediciones de divergencia frente al checkpoint BF16 podado, con la configuracion 1344 x 768, 30 pasos, res_multistep, schedule beta, semilla 0, sin LoRA, mismo condicionamiento cacheado, text encoder BF16 y VAEs de video/audio en FP32:

| Metrica (FP8 frente al BF16 podado) | Valor |
|---|---|
| PSNR del pixel de video decodificado | 22,75 dB |
| L2 relativa de la forma de onda de audio | 0,48404 |
| L2 relativa del latente de video | 0,33587 |
| L2 relativa del latente de audio | 0,27450 |
| Comprobaciones de peso superadas | 200 |
| Tensores excluidos de FP8 que coinciden con el origen | 332 |
| Multiplicaciones FP8 nativas correctas | 4.500 (0 errores de kernel) |
| Valores fuera del rango representable | 21.423 de 2.233.324.800.000 (fraccion 9,5924247e-09; 39 capas afectadas) |

El propio autor advierte que estas cifras miden divergencia, no calidad perceptual, y que una sola prompt y una sola semilla no establecen equivalencia general de calidad. Las mediciones de tiempo y memoria incluyen la sobrecarga de la auditoria de activaciones y no constituyen un benchmark de velocidad limpio.

## Requisitos de hardware

- Pesos almacenados: 20,96 GB en FP8 mixto; el repositorio completo ocupa 21,0 GB. Hay que sumar el text encoder y los VAEs de video y audio, que se distribuyen por separado.
- Hardware verificado por el autor: RTX PRO 6000 Blackwell (96 GB) con PyTorch 2.11.0+cu130 y una build de ComfyUI en el commit `e377e263049f9338b4d12a3dd417b36ae62948ff`. La ejecucion FP8 nativa se verifico en ese equipo; otro hardware puede tomar rutas distintas.
- VRAM estimada para inferencia: no publicada por el autor. Estimacion propia no verificada: por debajo de 21 GB solo caben los pesos, y al anadir activaciones, latentes de video a 1344 x 768 y 124 fotogramas, text encoder BF16 y VAEs FP32, el pico de memoria previsiblemente supera los 24 GB.
- GPU consumer: una RTX 4090 o RTX 5090 de 24 GB o mas queda muy justa y probablemente requiera offloading de componentes a RAM o a disco. Una RTX 3090 de 24 GB queda en la misma situacion.
- GPU profesionales recomendadas: RTX PRO 6000 Blackwell (96 GB, la unica validada), A100 80 GB y H100 80 GB como opciones holgadas para el checkpoint completo con text encoder y VAEs residentes.
- Opciones de despliegue: ComfyUI con soporte de precision mixta `comfy_quant`, colocando el fichero en `ComfyUI/models/diffusion_models/` y usando los nodos de condicionamiento H3 Ref2VA. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato de difusion de video; no se ofrece GGUF ni cuantizaciones de 4 bits.
- Latencia y throughput: no disponibles. El autor indica explicitamente que sus mediciones temporales incluyen la sobrecarga de la auditoria de activaciones y no deben interpretarse como velocidad limpia.

## Comparativa con modelos similares

| Modelo | Precision de pesos | Tamano de pesos | Origen | Licencia | Notas |
|---|---|---|---|---|---|
| haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8 (este) | FP8 E4M3FN mixto (fc2 desquantizado a BF16) | 20,96 GB | Conversion independiente | MiniMax H3 Community License | Formato ComfyUI con `comfy_quant`; 0 descargas al redactar |
| haideraqeeb/MiniMax-H3-Ref2VA-Pruned-BF16 | BF16 | 40,23 GB | haideraqeeb | MiniMax H3 Community License | Fuente directa de este checkpoint; mismo pruning de AdaLN |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | MiniMax (oficial) | MiniMax H3 Community License | Release original; commit `42ed227ee7df40d41602854ae760620d6eb651fe` |
| Comfy-Org/MiniMax-H3 | FP8 escalado (fichero `minimax_h3_ref2va_pruned_fp8_scaled.safetensors`) | no disponible | Comfy-Org | no disponible | Origen de las 150 escalas de activacion estaticas y de las etiquetas `comfy_quant` reutilizadas |

No se dispone de modelos comparables de terceros con datos verificables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje MiniMax H3.

## Limitaciones y advertencias

- Licencia: MiniMax H3 Community License Agreement (`license: other`, `license_name: minimax-h3-community-license-agreement`). Hay que revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial; las condiciones concretas no estan en la informacion disponible.
- No es una release oficial de MiniMax: es una modificacion independiente del checkpoint, y el autor lo declara explicitamente.
- Divergencia medible frente al BF16 podado: PSNR de 22,75 dB en video y L2 relativa de 0,48404 en la forma de onda de audio. Un PSNR de esa magnitud implica diferencias visibles respecto al original.
- El autor advierte que una unica prompt y una unica semilla no establecen equivalencia general de calidad; no hay evaluacion perceptual ni conjuntos de validacion amplios.
- Escalas de activacion reutilizadas de Comfy-Org sin calibracion propia: se desconoce el dataset de calibracion original y no se garantiza que los pesos FP8 sean identicos bit a bit a los de una conversion upstream no publicada.
- 21.423 valores superaron el rango representable en 39 capas durante la auditoria, aunque la fraccion es del orden de 1e-09.
- ComfyUI puede convertir parametros no cuantizados al dtype de computo configurado al cargar, de modo que preservar el dtype de almacenamiento no implica preservar el dtype de todos los calculos.
- La ejecucion FP8 nativa solo se valido en una RTX PRO 6000 Blackwell con PyTorch 2.11.0+cu130 y una build concreta de ComfyUI; en otro hardware o versiones podria degradarse el rendimiento o cambiar la ruta de computo.
- El text encoder y los VAEs no estan incluidos en el repositorio ni cuantizados; hay que obtenerlos por separado y anaden requisitos de memoria y de disco.
- Los scripts de validacion usan rutas de workspace locales del autor y no constituyen una CLI portable, lo que dificulta reproducir la auditoria.
- Sin datos sobre sesgos, idiomas soportados ni tasas de fallo. En un modelo de difusion de video, el equivalente a la alucinacion son artefactos visuales y desalineacion con la imagen de referencia o el prompt, y no se han cuantificado aqui.
- El repositorio tenia 0 descargas y 0 votos en el momento de redactar esta ficha: no existe validacion independiente por parte de la comunidad.
- No hay soporte declarado de tool calling, agentes, vision de entrada ni modo de razonamiento; no debe evaluarse con criterios de un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8
- Checkpoint base podado en BF16: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-BF16
- MiniMax H3 original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Configuracion y escalas FP8 de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Ejemplo de referencia en BF16 podado: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8/blob/main/examples/ours-5s.mp4
- Ejemplo en FP8: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8/blob/main/examples/ours-fp8-5s.mp4
- Comparacion lado a lado con banda sonora BF16: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8/blob/main/examples/side-by-side.mp4
- Informes de validacion y auditoria por capa: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8/tree/main/validation
- Licencia y avisos legales del repositorio: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-FP8/tree/main

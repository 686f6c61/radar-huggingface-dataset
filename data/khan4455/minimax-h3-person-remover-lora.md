# Khan4455/MiniMax-H3-Person-Remover-LoRA

## Resumen

MiniMax H3 Person Remover LoRA V1 es un adaptador LoRA experimental para eliminación de personas en vídeo, construido sobre el modelo base MiniMax H3 en su variante Ref2VA (reference-to-video-and-audio) y publicado por Akatz Labs (el repositorio consultado, Khan4455/MiniMax-H3-Person-Remover-LoRA, apunta en su propia model card al repositorio original akatz-ai/MiniMax-H3-Person-Remover-LoRA como origen de la descarga). El adaptador recibe un vídeo original junto con una máscara verde que cubre a la persona seleccionada y una versión limpia del primer fotograma, y genera el fondo reconstruido manteniendo el movimiento de cámara y el ritmo de fotogramas.

El flujo de trabajo está pensado para ComfyUI con soporte nativo de MiniMax H3 y SAM 3.1: SAM 3.1 hace el seguimiento de la persona, se rellena la máscara en verde y el adaptador reconstruye el fondo en ventanas solapadas de 22 fotogramas (patrón 17n + 5), usando el fotograma de frontera generado como referencia de la siguiente ventana y arrastrando 18 fotogramas de historial de vídeo y audio. El adaptador no segmenta personas ni crea la referencia limpia inicial: eso lo aportan SAM y una edición externa del primer fotograma.

Es relevante porque aborda una tarea de postproducción costosa (eliminación de personas con reconstrucción de fondo) mediante un adaptador ligero de 0,2 GB sobre un modelo generativo de vídeo y audio, sin necesidad de LoRAs adicionales de tipo Turbo o VFX. Se trata, sin embargo, de un adaptador experimental: el propio autor advierte de que los ejemplos mostrados son resultados seleccionados y no un benchmark, y de que detalles de fondo, movimiento de cámara, sombras y cortes duros pueden cambiar respecto al material original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre MiniMax H3 Ref2VA (variante pruned Ref2VA); el base es un modelo de difusión de vídeo y audio con codificador de texto Qwen3VL 32B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (es un adaptador LoRA, no un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la ventana de generacion del flujo de trabajo es de 22 fotogramas por defecto, con longitudes validas segun el patron 17n + 5 (22, 39, 56, 73...) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizacion declarada. Los modelos base asociados incluyen una variante pruned INT8 ConvRot del Ref2VA, un text encoder Qwen3VL 32B NVFP4 AWQ, un VAE de video FP16 y un VAE de audio FP32 |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | minimax-h3-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors (libreria `diffusion-single-file`, adaptador de archivo unico; 0,2 GB de repositorio) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre MiniMax H3 en su variante Ref2VA, una arquitectura de difusión para generación y edición de vídeo con audio asociado. El pipeline declarado es `video-to-video`: la entrada es el vídeo original con la persona enmascarada en verde y una referencia limpia del primer fotograma, y la salida es el mismo vídeo con la persona eliminada y el fondo regenerado. El proceso se ejecuta por ventanas solapadas: cada continuación usa el fotograma de frontera generado como siguiente referencia y arrastra 18 fotogramas de historial generado de vídeo y audio, mientras que la capa de relay (extension H3 Relay para ComfyUI) elimina el solape y recorta el resultado final al numero de fotogramas de origen.

El entrenamiento se realizó con ai-toolkit (etiqueta declarada en el repositorio) durante 2.000 pasos de optimizador, incluyendo actualizaciones de regularización, sobre el dataset akatz-ai/H3-Person-Remover-v1. La model card incluye una tabla de registro de entrenamiento con la arquitectura (`minimax_h3_ref2va`, pruned Ref2VA) y una fila adicional truncada en la informacion disponible, por lo que el resto de hiperparametros (learning rate, resolucion, composicion exacta del dataset, uso de RLHF/DPO) no esta disponible. El adaptador no incorpora segmentacion ni generacion de la referencia limpia: esas funciones dependen de SAM 3.1 y de una edicion externa del primer fotograma.

## Capacidades

- Eliminacion de personas en video: sustituye a la persona enmascarada por fondo generado, integrando la reconstruccion con el resto de la escena.
- Reconstruccion de fondo: regenera la zona ocupada por la persona, incluyendo superficies, texturas y profundidad aparente.
- Preservacion de movimiento de camara y sincronizacion temporal: mantiene el movimiento de camara y el ritmo de fotogramas del material original como objetivo declarado del prompt por defecto.
- Edicion por ventanas solapadas con solape gestionado: genera en ventanas de 22 fotogramas y usa el fotograma de frontera como referencia de la siguiente, con 18 fotogramas de historial de video y audio.
- Integracion con segmentacion externa: el flujo de trabajo combina SAM 3.1 para el seguimiento de la persona, la mascara verde y la generacion del fondo de reemplazo.
- Control mediante prompt de texto: la tarea se describe en un nodo CLIP Text Encode (por ejemplo, `man in gray shirt`) y el prompt de eliminacion por defecto es explicito sobre que preservar.
- Reintento selectivo de secciones debiles: el flujo de trabajo incluye vista previa por ventana y controles de reroll.
- Salida con audio original opcional: la salida limpia es muda por defecto y requiere conectar el audio original; no se declara fidelidad de audio generado ni eliminacion de voz.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes: no es un modelo de lenguaje, sino un adaptador de difusion para video.

## Casos de uso

- Eliminacion de transeuntes en tomas de calle: se graba una localizacion urbana, se enmascara con SAM 3.1 la persona no deseada y se reconstruye el fondo con el flujo de ventanas de 22 fotogramas, valido para planos continuos de unos cinco segundos como punto de partida.
- Cumplimiento de privacidad en publicacion de material audiovisual: en lugar de difuminar caras, se elimina a la persona y se regenera el fondo, evitando el parche borroso en el plano final.
- Postproduccion de documentales con participantes sin consentimiento de imagen: se retira a una persona concreta de un plano manteniendo el resto de la escena, el movimiento de camara y la duracion.
- Limpieza de material de archivo o stock: se elimina una persona de una toma para que el clip pueda reutilizarse o licenciarse sin problemas de derechos de imagen.
- Correccion de continuidad entre planos: se retira un elemento humano que rompe la continuidad (por ejemplo, un figurante o un miembro del equipo visible en el encuadre) y se reconstruye el fondo con la referencia limpia del primer fotograma.
- Grabaciones inmobiliarias o de producto: se eliminan personas que aparecen en el encuadre de un tour de video sin reescribir el plano completo.
- Investigacion en edicion de video generativa: sirve como caso de estudio de adaptadores LoRA sobre modelos de difusion de video con audio, con ajustes documentados (fuerza 1.0, 12 pasos, sampler `er_sde`, scheduler `simple`, CFG 1, sigma shift 12/3, semilla 904234) que permiten reproducir el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la galeria de ejemplos contiene resultados exitosos seleccionados y no constituye un benchmark de todas las entradas. Como referencia cualitativa declarada por el autor, los detalles de fondo, el movimiento de camara, las sombras y los cortes duros pueden cambiar respecto al original. Los unicos parametros de calidad reproducibles son los ajustes de muestreo del flujo de trabajo (12 pasos, sampler `er_sde`, scheduler `simple`, CFG 1, ventana de 22 fotogramas, tasa de 24 fps, video con ancho y alto divisibles por 32).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El consumo depende de la resolucion, del numero de fotogramas por ventana y de los modelos base cargados.
- Configuracion validada por el autor: RTX 4090, ComfyUI 0.37.0, frontend 1.53.6 y PyTorch 2.14.0+cu130. Se trata de una configuracion probada, no de un minimo hardware declarado.
- Modelos base necesarios (descargas separadas, no incluidas en el adaptador): H3 Ref2VA pruned INT8 ConvRot, text encoder Qwen3VL 32B NVFP4 AWQ (fijado a `gpu:0` en el flujo de trabajo), VAE de video FP16, VAE de audio FP32 y SAM 3.1 multiplex FP16 con su text encoder. El text encoder de 32B es el componente que mas presiona la VRAM.
- GPU recomendadas: no disponible. Por el perfil de los componentes (text encoder de 32B y modelo de difusion de video), se espera que requiera GPU de gama alta con suficiente memoria; la unica referencia concreta validada es la RTX 4090.
- Compatibilidad con GPU de consumo: la unica GPU de consumo documentada como probada es la RTX 4090. No se confirma el comportamiento en GPU con menos VRAM.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax H3 y SAM 3.1, mas la extension H3 Relay (version con vista previa de ventana y controles de reroll). El adaptador se coloca en `ComfyUI/models/loras/`. La opcion `comfy kitchen attention` y la fijacion del text encoder a `gpu:0` mediante Select CLIP Device requieren una instalacion compatible de ComfyUI y runtime.
- Latencia y throughput: no disponible. Solo se documenta la longitud de ventana (22 fotogramas, patron 17n + 5) y la advertencia de que ventanas mas largas consumen mas memoria y no son necesariamente mejores.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Person Remover LoRA V1 (repositorio consultado, Khan4455) | Adaptador LoRA de edicion de video (video-to-video) | no disponible (repositorio de 0,2 GB) | Comfy-Org/MiniMax-H3 | minimax-h3-community-license-agreement | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| akatz-ai/MiniMax-H3-Person-Remover-LoRA | Mismo adaptador, repositorio original referenciado en la model card | no disponible | Comfy-Org/MiniMax-H3 | minimax-h3-community-license-agreement | HuggingFace (enlace de descarga del safetensors) |
| MiniMax H3 Ref2VA (Comfy-Org, variante pruned INT8 ConvRot) | Modelo de difusion de video y audio | no disponible | - | minimax-h3-community-license-agreement | HuggingFace (modelo base, descarga separada) |
| Otras soluciones de eliminacion de personas en video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento, contexto o calidad frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Adaptador experimental: el autor declara que la galeria contiene resultados exitosos seleccionados y no un benchmark; no hay garantia de comportamiento homogeneo en entradas arbitrarias.
- Artefactos esperados: detalles de fondo, movimiento de camara, sombras y cortes duros pueden cambiar respecto al material original. Los cortes duros son un caso especialmente problematico para el esquema de ventanas solapadas.
- Dependencia de componentes externos: el adaptador no segmenta personas ni crea la referencia limpia del primer fotograma; requiere SAM 3.1 y una edicion externa del primer fotograma de buena calidad. Una mascara o una referencia deficiente degradan el resultado.
- Requisitos de entrada estrictos: video a 24 fps con ancho y alto divisibles por 32, y se recomienda empezar por planos continuos de unos cinco segundos. No se documenta comportamiento fuera de estas condiciones.
- Audio: la salida limpia es muda por defecto; conservar la banda sonora exige conectar el audio original. El material de muestra no demuestra fidelidad de audio generado ni eliminacion de voz.
- Idiomas: el modelo esta declarado unicamente para ingles (`en`), tanto en la model card como en el campo de idioma del repositorio. El prompt de descripcion de la persona y el prompt de eliminacion estan en ingles.
- Licencia: minimax-h3-community-license-agreement, registrada como `license: other`. Las condiciones concretas de uso comercial no estan disponibles en la informacion proporcionada y deben consultarse en el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- Trazabilidad del repositorio: el repositorio consultado (Khan4455) presenta 0 descargas y 0 likes, y su model card enlaza a la descarga y a los ejemplos alojados en el repositorio akatz-ai. Conviene verificar la procedencia y la integridad del safetensors antes de usarlo en produccion.
- Riesgo de alucinacion visual: al ser un modelo generativo, la reconstruccion del fondo es inventada y no recuperada del material original; en escenas con geometria compleja o personas parcialmente ocluidas puede producir texturas o estructuras inexistentes.
- Sesgos: no hay informacion publicada sobre sesgos demograficos en la segmentacion o en la reconstruccion. La calidad depende en gran medida del modelo de segmentacion externo (SAM 3.1) y no del adaptador.
- Resultados de busqueda web: las consultas asociadas a este modelo devolvieron exclusivamente contenido no relacionado y de caracter adulto, sin ningun material tecnico aprovechable. No se ha utilizado esa informacion en esta ficha.

## Enlaces

- Ficha de HuggingFace del modelo: https://huggingface.co/Khan4455/MiniMax-H3-Person-Remover-LoRA
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Descarga del LoRA (referenciada en la model card): https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/resolve/main/H3-Person-Remover-V1.safetensors
- Repositorio de referencia del adaptador: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Person-Remover-v1
- Flujo de trabajo de ComfyUI (Window Reroll V1): https://huggingface.co/Khan4455/MiniMax-H3-Person-Remover-LoRA/blob/main/examples/Person-Remover-Window-Reroll-V1.json
- Guia del flujo de trabajo: https://huggingface.co/Khan4455/MiniMax-H3-Person-Remover-LoRA/blob/main/examples/README.md
- Extension H3 Relay: https://github.com/akatz-ai/h3-relay
- Modelo de difusion H3 Ref2VA pruned INT8 ConvRot: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors
- Text encoder Qwen3VL 32B NVFP4 AWQ de MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors
- VAE de video H3 FP16: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/vae/minimax_h3_video_vae_fp16.safetensors
- VAE de audio H3 FP32: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/vae/minimax_h3_audio_vae_fp32.safetensors
- SAM 3.1 multiplex FP16: https://huggingface.co/Comfy-Org/sam3.1/blob/main/checkpoints/sam3.1_multiplex_fp16.safetensors
- Perfil del autor del adaptador: https://x.com/akatz_ai

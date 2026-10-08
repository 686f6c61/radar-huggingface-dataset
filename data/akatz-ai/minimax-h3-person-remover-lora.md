# akatz-ai/MiniMax-H3-Person-Remover-LoRA

## Resumen

MiniMax H3 Person Remover LoRA V1 es un adaptador LoRA experimental desarrollado por Akatz Labs que se monta sobre el modelo de difusion de video MiniMax H3 en su variante Ref2VA. Su funcion es eliminar una persona concreta de un video y reconstruir el fondo que queda detras, manteniendo el movimiento de camara y el ritmo de los fotogramas originales. No se trata de un modelo autonomo: es un adaptador de bajo rango que modifica el comportamiento del modelo base.

El adaptador se entrenó durante 2.000 pasos de optimizador con rango y alpha de 16, en formato BF16 y con 416 tensores, y se distribuye como un unico archivo safetensors de aproximadamente 0,2 GB. El flujo de trabajo asociado, pensado para ComfyUI, combina el modelo base H3 Ref2VA con un segmentador SAM 3.1 que rastrea a la persona, rellena la mascara en verde y genera el fondo de reemplazo en ventanas solapadas de 22 fotogramas.

Su relevancia actual radica en que aborda una tarea de edicion de video hasta ahora muy costosa (borrado de sujetos con reconstruccion de fondo coherente) mediante un adaptador ligero sobre un modelo de difusion de video, con un pipeline reproducible en ComfyUI. El autor lo presenta explicitamente como experimental y advierte de que la galeria de ejemplos contiene resultados seleccionados, no un benchmark exhaustivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 16, excluye `adaln_proj`) sobre MiniMax H3 Ref2VA pruned (modelo de difusion de video) |
| Parametros totales | no disponible (adaptador de 416 tensores, ~0,2 GB en safetensors; no se indica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana de generacion de 22 fotogramas (longitudes H3 validas: 17n+5 → 22, 39, 56, 73...) |
| Tipos de cuantizacion | LoRA en BF16; los modelos base asociados incluyen INT8 ConvRot, NVFP4 AWQ, FP16 y FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (libreria `diffusion-single-file`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 que se aplica sobre la variante pruned Ref2VA del modelo de difusion de video MiniMax H3. Se excluye de la adaptacion la proyeccion `adaln_proj`, y los pesos se almacenan en BF16 en un unico archivo de 416 tensores. El entrenamiento consta de 2.000 actualizaciones del optimizador, incluidas las actualizaciones de regularizacion, sobre el dataset `akatz-ai/H3-Person-Remover-v1`. No se documentan en la informacion disponible el numero total de tokens, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion principal no esta en el adaptador en si, sino en el pipeline de inferencia que lo acompaña. El flujo de trabajo usa SAM 3.1 para rastrear a la persona, pinta la mascara en verde y genera el fondo de reemplazo en ventanas solapadas: cada continuacion toma el fotograma de frontera generado como referencia siguiente y arrastra 18 fotogramas de historial de video y audio generados. Un componente de relay elimina el solapamiento y recorta el resultado final al numero de fotogramas de origen. El adaptador no segmenta personas ni crea la referencia limpia inicial; esas entradas las aportan SAM 3.1 y una edicion externa del primer fotograma.

## Capacidades

- Eliminacion de una persona seleccionada en un video y reconstruccion del fondo ocluido.
- Preservacion del movimiento de camara y del ritmo temporal originales (a 24 fps).
- Generacion de video en ventanas solapadas con continuidad entre tramos mediante el fotograma de frontera como referencia.
- Procesamiento conjunto de video y audio (los modelos base incluyen VAE de video FP16 y VAE de audio FP32), aunque la salida limpia del flujo es silenciosa por defecto.
- Integracion con ComfyUI mediante un flujo de trabajo con controles de previsualizacion de ventana y reroll.
- Segmentacion de personas delegada a SAM 3.1 (no la realiza el propio adaptador).
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion de video, no un modelo de lenguaje.

## Casos de uso

- Postproduccion de video: borrar a un viandante o un miembro del equipo que aparece en plano y reconstruir el fondo, usando el flujo de ComfyUI con mascara SAM 3.1 y ventanas de 22 fotogramas.
- Limpieza de material de archivo: eliminar sujetos no deseados de grabaciones antiguas antes de reutilizarlas en montajes nuevos, aportando un primer fotograma limpio editado a mano.
- Publicidad y contenido de marca: retirar a personas que no cuentan con cesion de derechos de imagen en un plano ya rodado, evitando repetir el rodaje.
- Contenido para redes sociales: generar versiones de un clip sin una persona concreta manteniendo el audio original mediante la reconexion de la pista de audio en el nodo Create Video.
- Investigacion en edicion de video generativa: usar el adaptador como caso de estudio de LoRA de bajo rango sobre modelos de difusion de video, con el dataset de entrenamiento publicado.
- Creacion de datasets de video: producir versiones sin persona de un clip para tareas de aumento de datos o para entrenar modelos de reconstruccion de fondo.
- Efectos visuales en proyectos independientes: sustituir tareas de rotoscopia manual por un pipeline reproducible en ComfyUI sobre una unica GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explicitamente que la galeria de ejemplos contiene ocho resultados exitosos seleccionados y que no constituye un benchmark de todas las entradas.

## Requisitos de hardware

- VRAM estimada: no disponible. No se especifica una VRAM minima ni recomendada.
- Configuracion validada por el autor: RTX 4090, ComfyUI 0.37.0, frontend 1.53.6 y PyTorch 2.14.0+cu130. El autor aclara que es una configuracion probada, no un minimo.
- El flujo usa la opcion `comfy kitchen attention` y fija el codificador de texto H3 en `gpu:0` mediante Select CLIP Device, lo que exige una instalacion compatible de ComfyUI y su runtime.
- Componentes que consumen memoria: codificador de texto Qwen3VL 32B NVFP4 AWQ, modelo H3 Ref2VA pruned INT8 ConvRot, VAE de video FP16, VAE de audio FP32 y SAM 3.1 multiplex FP16.
- Cabe en GPU de consumo: si, segun la configuracion validada con una RTX 4090.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax H3 y SAM 3.1, mas la extension H3 Relay. No se documentan otros motores de inferencia.
- Latencia y throughput: no disponibles. Se indica que una ventana mas larga consume mas memoria y no es necesariamente mejor, y se recomienda empezar con 22 fotogramas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas funcionales.

| Modelo | Tipo | Funcion | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Person Remover LoRA V1 | LoRA sobre modelo de difusion de video | Borrado de persona y reconstruccion de fondo | Ventana de 22 fotogramas (ampliable a 17n+5) | minimax-h3-community-license-agreement | HuggingFace, 4 descargas, 23 likes |
| MiniMax H3 Ref2VA (base, Comfy-Org) | Modelo de difusion de video | Generacion y edicion de video condicionada por referencia | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de borrado de objeto en video | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: los detalles de fondo, el movimiento de camara, las sombras y los cortes duros pueden cambiar respecto al original.
- La galeria de ejemplos son resultados seleccionados; no hay evidencia de comportamiento sistematico sobre entradas arbitrarias.
- El adaptador no segmenta personas ni crea la referencia limpia inicial: requiere SAM 3.1 y una edicion externa del primer fotograma para funcionar.
- Requiere video a 24 fps con ancho y alto divisibles por 32, y funciona mejor con planos cortos y continuos de unos cinco segundos.
- La salida limpia del flujo es silenciosa por defecto; conservar el audio exige reconectar la pista original manualmente.
- No se demuestra fidelidad de audio generado ni eliminacion de voz.
- Solo soporta ingles como idioma declarado.
- Licencia `minimax-h3-community-license-agreement`: es una licencia de tipo "other", por lo que las condiciones exactas de uso comercial deben consultarse en el archivo LICENSE del repositorio antes de utilizarlo en produccion.
- No se documentan sesgos, tasas de alucinacion ni limites de contexto mas alla de la ventana de generacion.
- La adopcion es muy baja (4 descargas), lo que reduce la validacion independiente del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA
- Descarga del LoRA: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/resolve/main/H3-Person-Remover-V1.safetensors
- Flujo de trabajo ComfyUI: examples/Person-Remover-Window-Reroll-V1.json
- Guia del flujo de trabajo: examples/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Person-Remover-v1
- Repositorio H3 Relay: https://github.com/akatz-ai/h3-relay
- Modelo base MiniMax H3 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- SAM 3.1 (Comfy-Org): https://huggingface.co/Comfy-Org/sam3.1

# mlx-community/Ming-Image-0.1-Design-bf16

## Resumen

Ming-Image-0.1-Design en su version bf16 para MLX es una conversion del modelo de generacion de imagen de inclusionAI, publicada por mlx-community para ejecutarse en Apple Silicon. Es un modelo text-to-image orientado al diseno grafico: carteles, fondos de rotulacion, tarjetas, maquetas de interfaz y tipografia, con la particularidad de que genera imagenes RGBA con canal alfa nativo en lugar de RGB plano.

El pipeline encadena un MLLM de condicionamiento BailingMM2 (familia Ling-mini-2.0, con mezcla de expertos, y un ViT Qwen2.5) que alimenta un transformer de difusion S3-DiT de estilo Z-Image mediante tokens de consulta aprendibles y un flujo directo de estados ocultos; un VAE de 4 canales heredado de Qwen-Image decodifica color y alfa. El repositorio ocupa 49,8 GB y esta pensado exclusivamente para Apple Silicon: el puerto Swift ming-image-swift lo carga a traves de MLXEngine.

Su relevancia practica esta en dos puntos concretos: es una de las pocas alternativas abiertas bajo licencia MIT que produce alfa real (util para integrar graficos en flujos de edicion sin recortes posteriores) y demuestra inferencia de difusion de gran tamano en hardware de Apple mediante MLX, con cifras medidas sobre un M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion text-to-image en tres bloques: MLLM de condicionamiento BailingMM2 (Ling-mini-2.0 MoE + ViT Qwen2.5), conector Qwen2-1.5B no causal y transformer de difusion S3-DiT estilo Z-Image; VAE RGBA de 4 canales (Qwen-Image) |
| Parametros totales | no disponibles (pesos bf16 de 49,8 GB repartidos en: mllm 34,0 GB, transformer 12,3 GB, connector 3,1 GB, vae 0,25 GB, mlp 0,12 GB) |
| Parametros activos | no disponible (el MLLM Ling-mini-2.0 es MoE, pero no se publica el reparto de parametros activos) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no aplica la ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; este repo almacena bf16 (mllm, connector, transformer, vae) y f32 (mlp). La model card anuncia futuras variantes cuantizadas en la misma coleccion |
| Idiomas soportados | en, zh (prompts) |
| Licencia | MIT (se incluye la LICENSE original) |
| Formato de pesos | safetensors, arbol estilo diffusers cargado con la libreria mlx |
| Resoluciones de generacion | 256² (pruebas de paridad), 1024² (produccion) y 2048² (pruebas de rendimiento) |
| Canales de salida | RGBA con alfa directo (straight alpha) |
| Pasos de inferencia | 12 pasos (11 efectivos) con guidance 1.0 |
| Tamano del repositorio | 49,8 GB |
| Modelo base | inclusionAI/Ming-Image-0.1-Design |

## Arquitectura y entrenamiento

El modelo no es un transformer unico, sino un pipeline de tres etapas. El condicionamiento lo produce un MLLM BailingMM2 basado en Ling-mini-2.0 (arquitectura MoE) con un ViT Qwen2.5 para la entrada visual, que se conecta al difusor mediante un conector no causal derivado de Qwen2-1.5B. Este conector entrega al S3-DiT de estilo Z-Image un flujo de estados ocultos directo junto con tokens de consulta aprendibles. La decodificacion final la realiza un VAE de 4 canales de Qwen-Image, que produce simultaneamente los tres canales de color y el canal alfa, de ahi la salida RGBA nativa.

En esta conversion no se modifican los pesos: la unica conversion aplicada es la de MLX de f32 a bf16 en el conector, y la model card indica que los tensores son identicos byte a byte al checkpoint original en el resto de componentes, verificado tensor a tensor. La validacion se hizo contra la referencia PyTorch en fp32 con un carril de paridad en CPU: el S3-DiT a 256² y 1024² queda en relL2 ≤ 1,5e-5, el VAE en 9,1e-7 (decode) y 3,5e-6 (encode), el scheduler es bit-exacto y los estados ocultos del MoE quedan en ≤ 3,3e-6. En generacion bf16 de produccion sobre GPU, la salida a 1024² queda a 41,9 dB del render fp32 de referencia.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni sobre fases de RLHF o DPO. La model card de esta conversion documenta exclusivamente el empaquetado, la paridad numerica y el rendimiento del puerto MLX/Swift, no el entrenamiento del modelo original.

## Capacidades

- Generacion de imagen a partir de texto en 1024² (produccion) y 2048² (pruebas), con 12 pasos y guidance 1.0.
- Salida RGBA con canal alfa, no solo RGB.
- Transparencia inducida por prompt. La receta documentada en el puerto es: incluir primero la frase "transparent canvas, not white, not checkerboard"; si el alfa vuelve opaco, reintentar con la misma semilla usando "不要白底，不要棋盘格，只要透明通道"; aplicar despues un suelo de alfa (α < 0,1 → 0).
- Diseno grafico: carteles, fondos de rotulacion, tarjetas, maquetas de interfaz y tipografia.
- Prompts en ingles y en chino.
- Control de semilla para reproducibilidad de resultados.
- Integracion como componente Swift con MLXEngine: la transparencia se expone como campo de la peticion (`background: .transparent`, contrato MLXEngine 1.48.0) y la salida es un PNG RGBA con alfa directo.
- No se documentan en la informacion disponible capacidades de edicion de imagen, inpainting, tool calling, agentes, vision de entrada en produccion, audio ni modo de razonamiento.

## Casos de uso

- Carteles y material promocional de eventos: el modelo esta entrenado especificamente para composiciones con tipografia y bloques geometricos; un cartel a 1024² con 12 pasos se completa en unos 24 s en un M5 Max (2 s/paso), lo que permite iterar sobre variantes cambiando solo la semilla.
- Assets de interfaz con transparencia: al generar RGBA nativo, un boton, un icono o una composicion se pueden colocar directamente sobre cualquier fondo en la app o en la web, sin paso de recorte ni matting posterior.
- Fondos de rotulacion y carteleria: es uno de los usos declarados del modelo, util para generar la base grafica sobre la que despues se monta el texto definitivo del rotulo.
- Tarjetas y piezas impresas: generacion de tarjetas con jerarquia visual y tipografia a 1024² o 2048², segun el tamano de impresion necesario.
- Maquetas de interfaz para prototipado: generar disposiciones de UI (layout, bloques, tipografia) como referencia visual antes de implementar el diseno en codigo.
- Previsualizacion local con requisitos de privacidad: todo el pipeline (MLLM de 34 GB incluido) se ejecuta en la maquina, sin enviar el prompt ni los assets a un servicio externo, algo relevante para material de marca no publicado.
- Descomposicion en capas editables: el modelo hermano mlx-community/Ming-Image-0.1-Design-Layer-bf16, cargado por el mismo puerto, convierte un diseno plano en capas RGBA separadas, lo que permite pasar de una propuesta generada a un archivo editable por el disenador.
- Generacion por lotes con semilla fija: para producir series coherentes de assets (por ejemplo, variantes de un mismo cartel en varios formatos) manteniendo el control de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, GenEval u otros) en la informacion disponible. Los unicos datos medidos son de paridad numerica frente a la referencia PyTorch en fp32 y de velocidad de inferencia.

Paridad del puerto Swift/MLX frente a la referencia (carril fp32 en CPU, contra goldens):

| Componente | Resultado |
|---|---|
| S3-DiT a 256² y 1024² | relL2 ≤ 1,5e-5 |
| VAE decode / encode | relL2 9,1e-7 / 3,5e-6 |
| Scheduler | bit-exacto |
| Tokenizer, plantilla de chat, ids de posicion 3-D | exacto |
| Estados ocultos del MoE (con el enrutado de la referencia) | ≤ 3,3e-6 |
| Salidas de condicionamiento (mismo enrutado) | ≤ 3,6e-5 |
| Generacion de 2 pasos en fp32 | latentes finales relL2 3,5e-6; salida RGBA dentro de 1 LSB |

Rendimiento de generacion (bf16, DiT, M5 Max; 12 pasos, 11 efectivos, guidance 1.0):

| Resolucion | Tiempo por paso | Tiempo total aproximado |
|---|---|---|
| 1024² | ~2 s | ~24 s |
| 2048² | 20-30 s | ~220-330 s |

En produccion bf16 sobre GPU, la salida a 1024² queda a 41,9 dB del render fp32 de referencia. Nota de la model card: en el enrutado de expertos del MoE, los empates hacen que el enrutado sin forzar dependa de la implementacion, por lo que las cifras anteriores corresponden al enrutado de la referencia.

## Requisitos de hardware

- Plataforma: Apple Silicon obligatoria para esta conversion (MLX). No se documenta soporte para CUDA ni ROCm en este repositorio.
- Memoria recomendada: 64 GB o mas de RAM unificada para bf16.
- Pico de memoria medido: en pruebas a 2048², 44 GB de footprint maximo de proceso con la cache de buffers de MLX limitada a 4 GB; sin limitar la cache, el pico llega a 110 GB. Es imprescindible limitar la cache.
- Gestion de memoria del pipeline: el puerto carga el MLLM de 34 GB, condiciona el prompt y lo libera antes de empezar el denoising, de modo que no conviven en memoria el MLLM y el bucle de difusion.
- VRAM estimada en GPU NVIDIA o AMD: no disponible. No hay datos de ejecucion fuera de Apple Silicon.
- GPU consumer: el modelo no cabe en una GPU de consumo de 24 GB por el tamano del MLLM de condicionamiento; el objetivo declarado son Macs de 64 GB o mas. Las cifras de memoria en aplicacion siguen en medicion segun la model card.
- Opciones de despliegue: paquete Swift ming-image-swift con MLXEngine (registro de `MingImageT2IPackage.registration` y `MingImageConfiguration(repo: "mlx-community/Ming-Image-0.1-Design")`, que descarga el repositorio en el primer uso). vLLM, TGI, llama.cpp y Ollama no se mencionan como soportados para este pipeline en la informacion disponible.
- Latencia y throughput: 2 s/paso a 1024² y 20-30 s/paso a 2048² en un M5 Max; no se publican cifras de throughput por lote.

## Comparativa con modelos similares

No se dispone de datos de parametros ni de rendimiento de otras familias de text-to-image (FLUX, SDXL, Qwen-Image, etc.) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La comparacion disponible se limita a las variantes del propio modelo:

| Modelo | Entorno | Precision | Tamano | Salida | Proposito | Licencia |
|---|---|---|---|---|---|---|
| mlx-community/Ming-Image-0.1-Design-bf16 | MLX / Apple Silicon | bf16 (f32 en mlp) | 49,8 GB | RGBA | text-to-image de diseno | MIT |
| inclusionAI/Ming-Image-0.1-Design | PyTorch / diffusers | no disponible | no disponible | RGBA | modelo original de referencia | MIT |
| mlx-community/Ming-Image-0.1-Design-Layer-bf16 | MLX / Apple Silicon | no disponible | no disponible | RGBA por capas | descomposicion de un diseno plano en capas editables | MIT |

El repositorio referenciado en el ejemplo de codigo de la model card (`mlx-community/Ming-Image-0.1-Design`) corresponde a la variante que MLXEngine descarga por defecto; no se detallan su precision ni su tamano.

## Limitaciones y advertencias

- Alfa nativo poco fiable en ciertos materiales: la receta documentada dio alfa utilizable en 5 de 6 sujetos de prueba. El vidrio y otros materiales transparentes fallan: vuelven opacos o con un tablero de ajedrez pintado dentro del canal alfa. Para estos casos la recomendacion del autor es usar fondo mate.
- Dependencia de ingenieria de prompt: la transparencia no es un parametro estructural del modelo, sino que se induce con frases concretas ("transparent canvas, not white, not checkerboard") y, en caso de fallo, con un reintento en chino a la misma semilla. Esto anade no determinismo al flujo de produccion.
- Enrutado de expertos dependiente de la implementacion: el MoE puede presentar empates en el enrutado sin forzar; la paridad numerica reportada se midio con el enrutado de la referencia, por lo que una implementacion distinta puede desviarse.
- Requisitos de memoria elevados: 49,8 GB de pesos bf16 hacen inviable el modelo en Macs de menos de 64 GB; sin limitar la cache de buffers de MLX el pico llega a 110 GB, con riesgo de swap o de fallo.
- Idiomas: solo en y zh en la informacion disponible; no hay datos sobre calidad con prompts en castellano.
- Ausencia de evaluaciones de calidad: no hay FID, CLIP score ni evaluacion de fidelidad al prompt, ni tasas de fallo mas alla de los casos de transparencia citados. El riesgo de generar contenido visual incorrecto o no solicitado no esta cuantificado.
- Atadura a plataforma: no hay soporte CUDA documentado; el despliegue en servidores x86 con GPU NVIDIA no esta cubierto por esta conversion.
- Licencia: el repositorio declara MIT para los pesos originales e incluye la LICENSE upstream, lo que permite uso comercial. No se detallan en la informacion disponible las licencias de los componentes de terceros citados (VAE de Qwen-Image, ViT Qwen2.5, conector Qwen2-1.5B), que conviene verificar antes de un despliegue comercial.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, fue creado el 26 de septiembre de 2026 y la propia model card indica que las cifras de memoria en aplicacion siguen en medicion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/Ming-Image-0.1-Design-bf16
- Modelo base (inclusionAI): https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- Licencia upstream: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design/blob/main/LICENSE
- Puerto Swift/MLX: https://github.com/xocialize/ming-image-swift
- Variante de descomposicion en capas: https://huggingface.co/mlx-community/Ming-Image-0.1-Design-Layer-bf16

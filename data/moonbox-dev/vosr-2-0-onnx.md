# moonbox-dev/VOSR-2.0-ONNX

## Resumen

VOSR 2.0 ONNX es la distribucion en formato ONNX de VOSR 2.0, un superresolutor generativo de un solo paso presentado en CVPR 2026 por el autor CSWRY y empaquetado por Moonbox para su uso en dispositivo mediante ONNX Runtime (CUDA, DirectML y CPU). El modelo original es un diffusion transformer de 1.400 millones de parametros que restaura una imagen en una unica evaluacion del flujo, condicionado por el latente VAE de Qwen-Image de la entrada reescalada bicubicamente y por caracteristicas de DINOv2-L. El resultado es un reescalado 4x que anade detalle plausible en lugar de limitarse a interpolar.

Este repositorio no contiene pesos nuevos ni un modelo reentrenado: es una cuantizacion del checkpoint base `CSWRY/VOSR` dividida en cuatro grafos independientes (image_encoder, vae_encoder, transformer y vae_decoder) que se ejecutan sobre teselas de 512 x 512 pixeles. Se ofrecen dos precisiones, int8 e int4, con el transformer cuantizado en pesos y el resto de grafos en fp16. El repositorio ocupa 2,9 GB.

La relevancia practica esta en que permite ejecutar un superresolutor generativo de 1,4 B en hardware de consumo y en entornos sin PyTorch, con errores medidos frente al pipeline fp32 de referencia. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer de un solo paso (one-step flow), con image encoder DINOv2-L (capa 17), VAE encoder/decoder de Qwen-Image y VAE decoder |
| Parametros totales | 1,4 B (transformer); total del pipeline no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); teselas de 512 x 512 px con solape de 64 px |
| Tipos de cuantizacion | int8 (pesos del transformer por canal de salida, weight-only) e int4 (MatMulNBits, bloque 32); resto de grafos en fp16 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx.data`) |

## Arquitectura y entrenamiento

VOSR 2.0 es un upscaler generativo 4x de un solo paso. El pipeline encadena cuatro componentes: un image encoder DINOv2-L que extrae caracteristicas de la imagen de baja calidad (salida de la capa 17), un VAE encoder de Qwen-Image que proyecta la entrada al espacio latente, un transformer de difusion de 1,4 B que ejecuta un unico paso de flujo condicionado por el latente y los tokens de DINOv2, y un VAE decoder que devuelve la imagen a espacio de pixeles. El modelo esta disenado para degradaciones del mundo real y anade detalle plausible, no solo interpolacion.

El pipeline de inferencia incluye un reescalado bicubico previo 4x, troceado en teselas de 512 px con 64 px de solape, mezcla ponderada de las teselas y una correccion de color wavelet contra la imagen bicubica original. El repositorio no aporta informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. La innovacion principal es la restauracion en un unico paso, que evita las decenas de iteraciones tipicas de los modelos de difusion convencionales.

## Capacidades

- Superresolucion generativa 4x de imagenes con degradaciones reales, en una sola evaluacion del transformer.
- Restauracion de detalle plausible (texturas, bordes, estructuras finas) gracias a la naturaleza generativa del modelo.
- Procesamiento por teselas de 512 x 512 px con solape, lo que permite tratar imagenes de mayor resolucion que una sola tesela.
- Correccion de color wavelet integrada en el pipeline para evitar desviaciones cromaticas respecto a la imagen de entrada.
- Ejecucion multiplataforma via ONNX Runtime con los proveedores CUDA, DirectML y CPU.
- Dos niveles de precision (int8 e int4) que permiten ajustar el equilibrio entre calidad y huella de memoria.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Restauracion de fotografia historica o de baja resolucion: el modelo reescala 4x imagenes degradadas y anade texturas plausibles, adecuado para digitalizacion de archivos donde la interpolacion bicubica deja resultados borrosos.
- Mejora de miniaturas y assets en aplicaciones de escritorio: al ejecutarse con ONNX Runtime sobre DirectML o CPU, puede integrarse en aplicaciones Windows sin dependencia de PyTorch ni de GPU dedicada.
- Preprocesado en pipelines de vision por computador: elevar la resolucion de imagenes de entrada antes de tareas de deteccion o segmentacion, con la correccion de color wavelet preservando la fidelidad cromatica.
- Restauracion de capturas de pantalla y contenido web: el troceado en teselas de 512 px con solape permite procesar imagenes grandes manteniendo coherencia en las uniones.
- Despliegue en dispositivos con memoria limitada: la variante int4 reduce el transformer a 0,91 GB, lo que permite ejecutarlo en GPUs de consumo con poca VRAM o incluso en CPU con latencia mayor.
- Generacion de material grafico a partir de bocetos o imagenes comprimidas: el caracter generativo del modelo completa detalle en zonas con perdida de informacion por compresion agresiva.
- Prototipado e investigacion en superresolucion: al estar en ONNX con grafos separados, facilita la sustitucion o el analisis de cada etapa del pipeline sin depender del codigo original en PyTorch.

## Benchmarks y rendimiento

Los datos publicados comparan cada precision contra el pipeline fp32 de referencia (mismo ruido de entrada) y contra la verdad terreno en Set14 y BSD100 a 4x, con entradas reducidas bicubicamente. Las metricas de PSNR/SSIM se calculan sobre el canal Y con un borde de 4 px recortado, ejecutando el pipeline en una RTX 3080 Laptop GPU con ONNX Runtime 1.30.

| Precision | Grafo | Comparacion con fp32 | PSNR / SSIM vs ground truth |
|---|---|---|---|
| int8 | transformer | 36,7 dB (Set14) / 35,1 dB (BSD100) | no disponible en la informacion |
| int4 | transformer | 30,6 dB (Set14) / 30,1 dB (BSD100) | no disponible en la informacion |
| int8 / int4 | image_encoder | 1,8e-03 de error RMS relativo (grafo fp16) | no aplica |
| int8 / int4 | vae_decoder | 2,9e-04 de error RMS relativo (grafo fp16) | no aplica |
| int8 / int4 | vae_encoder | 3,1e-04 de error RMS relativo (grafo fp16) | no aplica |

El autor advierte que VOSR es un modelo generativo entrenado para degradaciones reales y que el PSNR penaliza el detalle anadido, por lo que recomienda comparar precisiones entre si y no contra upscalers orientados a PSNR. No se han publicado resultados de benchmarks frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el transformer int8 ocupa 1,41 GB y el int4 0,91 GB; sumando image_encoder (0,46 GB), vae_encoder (0,04 GB) y vae_decoder (0,05 GB), el conjunto ronda los 2 GB en int8 y 1,5 GB en int4, sin contar activaciones ni el buffer de teselas.
- GPU recomendadas: el autor valida el pipeline en una RTX 3080 Laptop GPU; por tamano, cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM para la variante int4 y 6 GB para int8, con margen para activaciones.
- Opciones de despliegue: ONNX Runtime con los execution providers CUDA, DirectML y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que el benchmark se ejecuto en una RTX 3080 Laptop GPU con ONNX Runtime 1.30.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La tabla recoge solo los datos estructurales conocidos de este modelo y deja las alternativas como no disponibles.

| Modelo | Parametros | Enfoque | Contexto / tesela | Licencia | Formato |
|---|---|---|---|---|---|
| VOSR 2.0 ONNX | 1,4 B (transformer) | Diffusion transformer de un paso, 4x | 512 x 512 px por tesela | Apache 2.0 | ONNX |
| Alternativas de superresolucion generativa | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es generativo: anade detalle plausible que puede no corresponder a la escena original, lo que supone un riesgo de alucinacion visual en contextos forenses, medicos o documentales.
- El PSNR no es una metrica adecuada para evaluar este modelo; el autor lo senala explicitamente y recomienda comparar precisiones entre si.
- La variante int4 pierde calidad de forma notable frente a int8: 30,6 dB frente a 36,7 dB en Set14 y 30,1 dB frente a 35,1 dB en BSD100.
- No existe transformer en fp16 ni bf16: la conversion del grafo fp32 de 5,6 GB excedia la memoria de la maquina de compilacion y el codigo original mezcla tensores fp32 y fp16 al exportar en media precision.
- El troceado en pixeles del ejemplo no es identico al pipeline original de PyTorch, que trocea y mezcla en espacio latente; en imagenes de mas de una tesela los resultados pueden diferir.
- Los grafos dependen de datos externos (`*.onnx.data`): hay que mantener juntos todos los ficheros de una carpeta de precision.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni evaluacion multilingue (no aplica, al ser un modelo de imagen).
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales sobre los datos de entrenamiento ni sobre los componentes base (DINOv2-L y VAE de Qwen-Image) que puedan afectar a la redistribucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/VOSR-2.0-ONNX
- Repositorio del modelo original: https://github.com/cswry/VOSR
- Modelo base en Hugging Face: https://huggingface.co/CSWRY/VOSR
- Paper (referencia arXiv indicada en los tags): arxiv:2604.03225
- Grafo int8 del transformer: https://huggingface.co/moonbox-dev/VOSR-2.0-ONNX/blob/main/int8/transformer/model.onnx
- Grafo int4 del transformer: https://huggingface.co/moonbox-dev/VOSR-2.0-ONNX/blob/main/int4/transformer/model.onnx

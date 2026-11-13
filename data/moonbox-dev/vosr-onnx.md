# moonbox-dev/VOSR-ONNX

## Resumen

VOSR 2.0 ONNX es la versión empaquetada en formato ONNX del modelo VOSR 2.0, un superresolutor generativo de un solo paso desarrollado por el autor CSWRY (presentado en CVPR 2026) y adaptado por Moonbox para su ejecución en dispositivo mediante ONNX Runtime. El modelo resuelve el problema de la restauración y el reescalado de imágenes reales (real-world super-resolution) con un factor de 4x, partiendo de entradas degradadas y generando detalle plausible en una única pasada de difusión, en lugar de las decenas de pasos típicas de los modelos de difusión convencionales.

Técnicamente se trata de un diffusion transformer de 1,4 B de parámetros que opera condicionado por el latente VAE (Qwen-Image VAE) de la entrada reescalada bicúbicamente y por las características de DINOv2-L (capa 17). El pipeline se descompone en cuatro grafos ONNX independientes: `image_encoder`, `vae_encoder`, `transformer` y `vae_decoder`, con procesamiento por teselas de 512 x 512 píxeles y solapamiento de 64 píxeles.

La relevancia de esta publicación radica en que ofrece builds cuantizados (int8 e int4) listos para ONNX Runtime con proveedores CUDA, DirectML y CPU, lo que permite desplegar un superresolutor generativo de 1,4 B en hardware de consumo. El repositorio ocupa 2,9 GB e incluye los pesos como datos externos ONNX (`*.onnx.data`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (una etapa de flujo) con encoder DINOv2-L y VAE Qwen-Image |
| Parametros totales | 1,4 B (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; teselas de 512 x 512 px) |
| Tipos de cuantizacion | int8 (pesos del transformer por canal de salida, weight-only) e int4 (MatMulNBits, bloque 32); resto de grafos en fp16 |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx.data`) |

## Arquitectura y entrenamiento

VOSR 2.0 es un superresolutor generativo de un solo paso basado en un diffusion transformer de 1,4 B de parámetros. El pipeline completo consta de cuatro componentes: un image encoder DINOv2-L (capa 17) que extrae características semánticas de la entrada de baja calidad, un VAE encoder (Qwen-Image VAE) que proyecta la imagen al espacio latente, el transformer que ejecuta un único paso de flujo condicionado por el latente y los tokens de DINOv2, y un VAE decoder que reconstruye la imagen de alta resolución. La entrada se reescala previamente 4x con interpolación bicúbica y se procesa por teselas de 512 px con 64 px de solapamiento, mezclando los resultados con una ventana de pesos en rampa.

El modelo está entrenado para degradaciones del mundo real (real-world degradations), lo que implica que genera detalle plausible en lugar de limitarse a minimizar el error pixel a pixel. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la generación en un único paso (one-step), que reduce drásticamente el coste de inferencia frente a los pipelines de difusión multi-paso. Los builds ONNX añaden además una corrección de color wavelet fuera de los grafos, aplicada por defecto en VOSR.

## Capacidades

- Superresolución de imágenes con factor 4x sobre entradas degradadas del mundo real.
- Restauración de imagen (image restoration) con generación de detalle plausible.
- Ejecución en un solo paso de difusión, sin muestreo iterativo.
- Procesamiento por teselas de 512 x 512 px con solapamiento y mezcla, lo que permite tratar imágenes de cualquier resolución.
- Inferencia en dispositivo mediante ONNX Runtime con proveedores CUDA, DirectML y CPU.
- Cuantización int8 e int4 del transformer para reducir requisitos de memoria.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente image-to-image.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo recibe la imagen reescalada bicúbicamente y genera detalle plausible en una sola pasada, adecuado para archivos fotográficos digitalizados.
- Mejora de imágenes en dispositivos de consumo: los builds int8 e int4 permiten ejecutar el pipeline en GPU consumer o incluso en CPU mediante ONNX Runtime, sin necesidad de servidores con aceleradores de datacenter.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de tareas de detección o segmentación, aprovechando el procesamiento por teselas para imágenes grandes.
- Aplicaciones de edición fotográfica de escritorio: integración vía DirectML en herramientas Windows para reescalado 4x local, sin enviar imágenes a la nube.
- Recuperación de material gráfico para impresión: reescalado de imágenes de baja resolución a mayor tamaño con generación de detalle, usando la corrección de color wavelet para preservar la fidelidad cromática.
- Procesamiento por lotes en servidores con CUDA: despliegue con ONNX Runtime y CUDAExecutionProvider para reescalar lotes de imágenes con el grafo int8, que ofrece el mejor equilibrio entre tamaño y calidad (36,7 dB frente a fp32 en Set14).

## Benchmarks y rendimiento

Los datos publicados comparan cada precisión con la salida del pipeline original en PyTorch fp32 sobre Set14 y BSD100 a 4x (entradas reducidas con bicúbica), ejecutado en una RTX 3080 Laptop GPU con ONNX Runtime 1.30. La PSNR se mide contra la salida fp32 del propio pipeline (mismo ruido); la PSNR/SSIM contra la verdad de referencia se calcula en el canal Y con recorte de borde de 4 px.

| Precision | Grafo | Tamano | Error relativo RMS vs fp32 | PSNR vs fp32 (Set14 / BSD100) |
|---|---|---|---|---|
| int8 | image_encoder | 460,5 MB | 1,8e-03 | no disponible |
| int8 | transformer | 1,41 GB | no disponible | 36,7 / 35,1 dB |
| int8 | vae_decoder | 50,7 MB | 2,9e-04 | no disponible |
| int8 | vae_encoder | 38,7 MB | 3,1e-04 | no disponible |
| int4 | image_encoder | 460,5 MB | 1,8e-03 | no disponible |
| int4 | transformer | 912,1 MB | no disponible | 30,6 / 30,1 dB |
| int4 | vae_decoder | 50,7 MB | 2,9e-04 | no disponible |
| int4 | vae_encoder | 38,7 MB | 3,1e-04 | no disponible |

El autor advierte que VOSR es un modelo generativo entrenado para degradaciones reales y que añade detalle plausible, lo que penaliza la PSNR; por ello recomienda comparar precisiones entre sí en lugar de usar la PSNR contra la verdad de referencia como métrica absoluta. No se han publicado en la información disponible resultados de PSNR/SSIM contra ground truth ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el transformer int8 ocupa 1,41 GB y el int4 912,1 MB; sumando el resto de grafos (image_encoder 460,5 MB, vae_encoder 38,7 MB, vae_decoder 50,7 MB) el total de pesos ronda los 2 GB en int8 y 1,5 GB en int4, a lo que hay que añadir la memoria de activaciones de las teselas de 512 px.
- GPU recomendadas: cualquier GPU con soporte CUDA o DirectML; el autor validó el pipeline en una RTX 3080 Laptop GPU. Para servidores, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4-6 GB de VRAM para el pipeline int8, y en configuraciones menores con int4.
- Opciones de despliegue: ONNX Runtime con CUDAExecutionProvider, DirectMLExecutionProvider o CPUExecutionProvider; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota del autor: no existe transformer en fp16 ni bf16, porque convertir el grafo fp32 de 5,6 GB requería más memoria de la disponible en su máquina de build y el código de VOSR mezcla tensores fp32 y fp16 al exportar en media precisión.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros superresolutores generativos de un solo paso o basados en difusión), por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto/tesela | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VOSR 2.0 ONNX (este) | 1,4 B (transformer) | teselas de 512 x 512 px | Apache 2.0 | ONNX int8/int4 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo generativo: añade detalle plausible que puede no corresponder a la escena original; la PSNR contra la verdad de referencia lo penaliza y no debe evaluarse solo con esa métrica.
- El pipeline de teselado en píxeles incluido en la model card no es idéntico al pipeline PyTorch original en imágenes de más de una tesela, ya que el original tesela y mezcla en el espacio latente.
- No existe versión fp16 ni bf16 del transformer; solo hay int8 e int4, con la consiguiente pérdida de fidelidad numérica (36,7 dB y 30,6 dB frente a fp32 en Set14, respectivamente).
- El grafo int4 presenta una degradación notable frente a int8 (30,6 frente a 36,7 dB en Set14), por lo que conviene reservarlo para entornos con memoria muy limitada.
- Los archivos de cada carpeta deben mantenerse juntos, ya que los pesos grandes se almacenan como datos externos ONNX (`*.onnx.data`).
- Modelo exclusivamente de imagen: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni evaluación en dominios específicos (médico, satelital, etc.).
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las licencias de los componentes base (DINOv2, Qwen-Image VAE) antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/VOSR-ONNX
- Repositorio del modelo original VOSR: https://github.com/cswry/VOSR
- Modelo base: https://huggingface.co/CSWRY/VOSR
- Paper referenciado (arXiv:2604.03225): https://arxiv.org/abs/2604.03225

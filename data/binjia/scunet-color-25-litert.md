# Binjia/scunet-color-25-litert

## Resumen

SCUNet color σ=25 (LiteRT / TFLite) es una conversión del modelo de eliminación de ruido de imagen en color SCUNet (Swin-Conv-UNet), publicado originalmente por Kai Zhang y colaboradores, al formato LiteRT/TFLite para su ejecución en dispositivos. El modelo parte de los pesos `scunet_color_25.pth` de la release KAIR v1.0 (licencia Apache-2.0) y ha sido reconvertido por el usuario Binjia para inferencia on-device con la librería LiteRT.

La tarea concreta que resuelve es el denoising de imágenes en color contaminadas con ruido gaussiano aditivo de desviación típica σ = 25/255. No es un modelo de lenguaje ni un modelo generativo multimodal: es un modelo image-to-image puramente convolucional y de atención por ventanas, diseñado para procesar teselas de 256 × 256 píxeles RGB en rango [0, 1] y devolver la imagen limpia en el mismo formato.

Su relevancia es de nicho pero clara: permite ejecutar un denoiser de calidad cercana al estado del arte en entornos sin GPU dedicada o en movil, gracias al formato TFLite con pesos en FP16 y activaciones en FP32. El repositorio es muy reciente, sin descargas ni likes registrados, y la información pública sobre el modelo se limita a la model card del autor y a la documentación del proyecto original SCUNet/KAIR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin-Conv-UNet (SCUNet): U-Net con bloques convolucionales y atención por ventanas desplazadas |
| Parámetros totales | no disponible (pesos FP16, fichero de 47.200.352 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija de 256 × 256 × 3) |
| Tipos de cuantización | Pesos FP16 con DEQUANTIZE (pesos de TRANSPOSE_CONV en FP32); activaciones FP32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`scunet_color_25.tflite`) |
| Entrada | float32 NHWC `[1, 256, 256, 3]`, sRGB en [0, 1] |
| Salida | float32 NHWC `[1, 256, 256, 3]`, sRGB en [0, 1] (puede exceder ligeramente; requiere clamp) |
| Cómputo por tesela | ~77 GMACs por tesela de 256 × 256 |
| SHA-256 | `8d060b8e58d3224ab14ee2af72c737af30cc3dd68790f26aca20f364734dd10c` |

## Arquitectura y entrenamiento

SCUNet combina un esqueleto tipo U-Net con bloques que mezclan convoluciones y atención por ventanas desplazadas (swin). La red no contiene operaciones globales: la máscara de atención por ventanas desplazadas está construida específicamente para teselas de 256 × 256, de modo que el modelo debe aplicarse por teselas solapadas de ese tamaño. Según la model card, el modelo original se entrenó para ruido gaussiano aditivo con σ = 25/255 y se distribuye en la release KAIR v1.0 bajo Apache-2.0.

La conversión a LiteRT introduce varias reescrituras equivalentes: partición y fusión de ventanas con tensores de rango ≤ 4; q/k/v como lineales separadas con la escala de atención plegada en q; sesgo de posición relativa y máscara de ventana desplazada como constantes aditivas precalculadas (con -1e4 en lugar de -inf); desplazamiento cíclico como slices más concat; y fusión del split/concat de canales del bloque conv-transformer en convoluciones 1×1. Además, LayerNorm se evalúa sobre x/8 (eps/64) para mantener la varianza dentro del rango FP16. El autor reporta una diferencia FP32 respecto a PyTorch de ~1e-6 y, con pesos FP16, un mínimo de 75,7 dB PSNR sobre 54 teselas de test; con precisión FP16 simulada en GPU, ≥ 70,7 dB.

No se dispone de información sobre el número exacto de tokens, composición del dataset de entrenamiento ni sobre si se aplicó RLHF/DPO (no aplicable en un modelo de denoising).

## Capacidades

- Eliminación de ruido gaussiano aditivo en imágenes en color con σ = 25/255.
- Procesamiento image-to-image por teselas de 256 × 256 píxeles con solapamiento.
- Inferencia on-device mediante LiteRT/TFLite, con pesos en FP16 y activaciones FP32.
- Ejecución correcta con precisión FP16 en GPU (según simulación reportada por el autor).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras capacidades multimodales más allá del denoising de imagen.

## Casos de uso

- Limpieza de fotografías en aplicaciones móviles: el modelo se integra como paso de preprocesado o postprocesado en apps Android/iOS mediante LiteRT, procesando la imagen por teselas solapadas de 256 × 256 para reducir ruido de sensores en condiciones de poca luz.
- Preprocesado en pipelines de visión por computador: aplicar el denoiser antes de tareas de detección, segmentación o reconocimiento para mejorar la calidad de entrada cuando las imágenes provienen de cámaras con ISO alto.
- Restauración de imágenes médicas o científicas de bajo coste: útil cuando el ruido es aproximadamente gaussiano y se dispone de hardware sin GPU; el coste de ~77 GMACs por tesela permite su ejecución en CPU/NPU de dispositivos.
- Procesado en el borde (edge computing): despliegue en dispositivos IoT o cámaras inteligentes con LiteRT, evitando enviar imágenes a la nube y reduciendo latencia y consumo de ancho de banda.
- Herramientas de edición fotográfica de escritorio: integración como filtro de denoising en aplicaciones que necesiten un modelo ligero y con licencia permisiva (Apache-2.0) para distribución comercial.
- Prototipado e investigación en denoising: referencia reproducible para comparar frente a otros denoisers, dado que el autor documenta la equivalencia numérica con PyTorch (~1e-6 en FP32) y el PSNR frente al original.
- Benchmarking de cuantización y conversión: sirve como caso de estudio de conversión de un transformer híbrido con atención por ventanas a TFLite con pesos FP16 y LayerNorm reescrito para evitar desbordamiento.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (PSNR/SSIM sobre datasets como CBSD68, Kodak24 o McMaster). Solo se reportan métricas de fidelidad de la conversión:

| Métrica | Valor |
|---|---|
| Diferencia FP32 vs PyTorch | ~1e-6 |
| PSNR TFLite (pesos FP16) vs PyTorch, mínimo sobre 54 teselas | 75,7 dB |
| PSNR FP16 simulado vs FP32 en GPU | ≥ 70,7 dB |
| Cómputo por tesela 256 × 256 | ~77 GMACs |

No se han publicado resultados de benchmarks de calidad de denoising en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: fichero TFLite de 47.200.352 bytes (~45 MiB), con pesos en FP16 y algunas capas en FP32.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño del fichero y las activaciones FP32 de una tesela de 256 × 256, se espera un consumo moderado, apto para dispositivos móviles y CPUs de gama media.
- GPU recomendadas: no se especifican; el modelo está pensado para LiteRT, por lo que es adecuado para GPUs móviles, NPUs y CPUs. En escritorio podría ejecutarse en cualquier GPU compatible con LiteRT.
- ¿Cabe en GPU consumer? Sí, por tamaño (45 MiB) y por el diseño on-device; no se detallan modelos concretos (RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: LiteRT / TFLite (librería declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste computacional es de ~77 GMACs por tesela de 256 × 256, lo que sirve como referencia para estimar tiempos según el hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SCUNet color σ=25 (LiteRT) | Swin-Conv-UNet | 256 × 256 × 3 | Apache-2.0 | TFLite/LiteRT | Conversión on-device, pesos FP16 |
| SCUNet color σ=25 (PyTorch original) | Swin-Conv-UNet | Teselas variables | Apache-2.0 | `.pth` | Referencia de la que deriva esta conversión |
| Otros denoisers CNN (p. ej. DnCNN, FFDNet) | CNN | Variable | Varía | PyTorch/ONNX | No se dispone de comparación numérica en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para ruido gaussiano aditivo con σ = 25/255; su rendimiento fuera de ese régimen (otro nivel de ruido, ruido real de sensor, JPEG, etc.) no está garantizado.
- No contiene operaciones globales y la máscara de atención está construida para teselas de 256 × 256; es obligatorio procesar por teselas solapadas de ese tamaño, lo que añade complejidad de integración y posibles artefactos en las costuras si el solapamiento es insuficiente.
- La salida puede exceder ligeramente el rango [0, 1]; es necesario aplicar clamp antes de guardar o visualizar.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución al proyecto original SCUNet/KAIR y revisar los términos de los pesos originales.
- No se han publicado evaluaciones de sesgo, robustez frente a dominios fuera de distribución ni métricas de calidad perceptual (LPIPS, etc.).
- El repositorio no registra descargas ni validación comunitaria; la información procede únicamente de la model card del autor.
- No aplica a tareas de texto, razonamiento, código ni agentes; cualquier uso en esos ámbitos sería incorrecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Binjia/scunet-color-25-litert
- Repositorio original SCUNet: https://github.com/cszn/SCUNet
- Release KAIR v1.0 (pesos originales): https://github.com/cszn/KAIR/releases/tag/v1.0
- Paper: Zhang et al., "Practical Blind Image Denoising via Swin-Conv-UNet and Data Synthesis", Machine Intelligence Research, 2023, doi: 10.1007/s11633-023-1466-0

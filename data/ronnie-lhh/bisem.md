# Ronnie-lhh/BiSem

## Resumen

BiSem es un sistema de comunicación semántica de video basado en Vision Transformer (ViT), desarrollado por Ronnie-lhh (Liang Huihong). El modelo aborda el problema de transmitir video de forma eficiente a través de canales con ancho de banda limitado o ruidosos, codificando la información visual en un espacio semántico compacto de 64 dimensiones y reconstruyendo el video en el receptor. Utiliza un codificador ViT-B/16 y un decodificador estilo MAE (probablemente basado en Stable Diffusion, dado el archivo `SD.pth`), procesando clips de 16 frames RGB a 224×224 píxeles.

La relevancia actual de BiSem radica en su enfoque de cuantización extrema (pesos de 1 bit y 1,58 bits) y selección de keyframes, que reduce drásticamente la carga de transmisión y el tamaño del modelo sin sacrificar en exceso la calidad de reconstrucción. El repositorio incluye checkpoints completos para inferencia, pesos de inicialización para entrenamiento y utilidades de evaluación (FVD, LPIPS, FID). Aunque la licencia no está especificada, el modelo está disponible públicamente en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) como codificador semantico; decodificador MAE/SD |
| Parametros totales | No disponible (el checkpoint completo pesa ~432 MiB, el encoder ViT-B/16 ~330 MiB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de video: 16 frames RGB 224×224) |
| Tipos de cuantizacion | Pesos: FP32, 1-bit, 1.58-bit; activaciones: FP32, INT8 |
| Idiomas soportados | No disponible (modelo de video, sin procesamiento de texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pth` (state_dict), safetensors para el encoder preentrenado |

## Arquitectura y entrenamiento

BiSem sigue el paradigma de comunicación semántica: un codificador ViT-B/16 (inicializado con pesos de `vit_base_patch16_224.safetensors`) transforma los frames de video en una representación semántica de 64 dimensiones, que se transmite a través de un canal AWGN (ruido blanco gaussiano aditivo). En el receptor, un decodificador estilo MAE (inicializado con `SD.pth`, probablemente derivado de Stable Diffusion) reconstruye el video a partir de esa representación. El modelo soporta dos modos temporales: transmisión completa (todos los 16 frames) y transmisión por keyframes (2, 4 u 8 de los 16 frames), lo que reduce el número de frames transmitidos.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de optimización (RLHF, DPO, etc.). La innovación principal reside en la cuantización de pesos a 1 bit y 1,58 bits, que permite reducir el tamaño del modelo manteniendo activaciones INT8, y en la selección de keyframes como mecanismo de compresión temporal. Los checkpoints incluyen variantes FP32, 1-bit y 1.58-bit para los modos full y keyframe.

## Capacidades

- Reconstrucción de video a partir de representaciones semánticas de 64 dimensiones, con calidad evaluable mediante métricas como FVD, LPIPS y FID.
- Transmisión robusta sobre canales AWGN, simulando condiciones de ruido reales en comunicaciones inalámbricas.
- Selección de keyframes: permite transmitir solo 2, 4 u 8 de los 16 frames, reduciendo el ancho de banda necesario.
- Cuantización extrema de pesos (1-bit y 1.58-bit) con activaciones INT8, reduciendo el tamaño del modelo y el coste de inferencia.
- Soporte para inferencia con checkpoints completos listos para usar, así como pesos de inicialización para reentrenamiento o fine-tuning.
- Integración con métricas de evaluación estándar (FVD, LPIPS, FID) mediante pesos de terceros incluidos en el repositorio.

## Casos de uso

- Transmisión de video en redes de baja capacidad: BiSem permite enviar video a través de canales con ancho de banda muy limitado, gracias a la representación semántica compacta y la selección de keyframes. Es adecuado para aplicaciones de IoT o sensores remotos.
- Videovigilancia distribuida: en sistemas de cámaras de seguridad con conectividad intermitente o de bajo ancho de banda, el modelo puede transmitir solo los keyframes relevantes y reconstruir el video en el centro de monitoreo.
- Streaming de video en tiempo real con restricciones de ancho de banda: para plataformas de video en directo en zonas con redes congestionadas, BiSem ofrece una alternativa a los códecs tradicionales al priorizar la información semántica.
- Comunicación vehicular (V2X): en entornos de conducción autónoma, donde el canal inalámbrico es ruidoso y variable, la robustez frente a AWGN y la baja latencia de la representación semántica permiten compartir video entre vehículos.
- Telemedicina y diagnóstico remoto: la transmisión de video médico (endoscopias, ecografías) con calidad suficiente y bajo consumo de ancho de banda es posible gracias a la reconstrucción basada en keyframes.
- Realidad aumentada y virtual: para aplicaciones de colaboración remota o entrenamiento inmersivo, BiSem puede reducir la carga de transmisión de video 360° o multivista, manteniendo una calidad perceptualmente aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (PSNR, SSIM, FVD, etc.) ni comparaciones con otros sistemas de comunicación semántica o códecs de video.

## Requisitos de hardware

- Los checkpoints de inferencia pesan entre 432 y 437 MiB, por lo que caben en GPUs con 4 GB de VRAM o menos (por ejemplo, NVIDIA GTX 1650, RTX 3050).
- El encoder ViT-B/16 tiene ~86 millones de parámetros (estimación estándar), y el decodificador MAE/SD añade más, pero el tamaño total del checkpoint sugiere que la inferencia es viable en hardware de consumo.
- Para FP32, se recomienda al menos 4 GB de VRAM; las versiones cuantizadas (1-bit, 1.58-bit) pueden ejecutarse en GPUs con 2-3 GB.
- Opciones de despliegue: al ser PyTorch, se puede usar directamente con `torch.load` y ejecutar en CPU o GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama (modelo de video, no de texto).
- No se dispone de datos de latencia o throughput. Se espera que la inferencia sea rápida en GPUs modernas (RTX 30/40 series) dado el tamaño moderado del modelo.

## Comparativa con modelos similares

No disponible. No se han encontrado sistemas de comunicación semántica de video comparables en la información proporcionada, ni modelos de referencia con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial puede ser incierto. Se recomienda contactar al autor antes de desplegar en producción.
- El modelo está diseñado específicamente para un canal AWGN; su rendimiento en otros tipos de canal (desvanecimiento, interferencia) no está garantizado.
- La cuantización a 1 bit y 1,58 bits puede degradar la calidad de reconstrucción en escenarios con mucho detalle o movimiento rápido, aunque no se aportan datos cuantitativos.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo de video, el riesgo de generar contenido no deseado es menor que en modelos de lenguaje.
- El repositorio no incluye código de entrenamiento ni documentación sobre el dataset utilizado, lo que limita la reproducibilidad.
- Las fechas de creación (2026-09-01) son posteriores a la fecha actual, lo que sugiere que el modelo puede ser experimental o estar en fase de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/Ronnie-lhh/BiSem
- GitHub del autor: https://github.com/Ronnie-lhh/

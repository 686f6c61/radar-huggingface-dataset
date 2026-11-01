# SergioShu/diffueraser-trt-sm120

## Resumen

DiffuEraser TensorRT engines (sm120) es una distribución de motores TensorRT serializados del modelo de eliminación de objetos en vídeo DiffuEraser, publicado por el usuario SergioShu en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una compilación optimizada de las redes de DiffuEraser (BrushNet, UNet de movimiento y VAE de Stable Diffusion 1.5) mediante `torch.export` y `torch_tensorrt.dynamo`, empaquetada como programas Torch-TensorRT listos para cargar en GPUs NVIDIA Blackwell de capacidad de cómputo 12.0.

El problema que resuelve es el de la latencia en inferencia de vídeo inpainting: DiffuEraser es un modelo de difusión que requiere múltiples pasos sobre secuencias de 22 fotogramas, y compilar sus redes a TensorRT reduce el coste de ejecución en hardware Blackwell. El repositorio ocupa 41,2 GB e incluye variantes de los motores según orientación del lienzo (horizontal `land`, vertical `port`) y compatibilidad de hardware.

Es relevante porque ejemplifica el flujo de despliegue de modelos de difusión de vídeo en producción sobre las nuevas arquitecturas de NVIDIA, aunque su utilidad práctica está fuertemente limitada: los motores solo cargan en GPUs sm120 con TensorRT 11.1.0, y el repositorio no incluye código de inferencia, pipeline ni documentación de uso más allá de la descripción de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motores TensorRT (Torch-TensorRT Dynamo) de redes de difusión: BrushNet, UNet de movimiento (con LoRA PCM de 2 pasos fusionada) y VAE sd-vae-ft-mse |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión/vídeo, no de lenguaje); procesa 22 fotogramas por pasada |
| Tipos de cuantizacion | no disponible (motores TensorRT precompilados; no se documentan precisiones FP16/INT8) |
| Idiomas soportados | no disponible (modelo de imagen/vídeo, sin capacidades lingüísticas) |
| Licencia | creativeml-openrail-m (heredada de Stable Diffusion 1.5, con restricciones de uso del párrafo 5 y Anexo A); componentes DiffuEraser bajo Apache 2.0 y sd-vae-ft-mse bajo MIT |
| Formato de pesos | Motores TensorRT serializados (`.ep`) generados con `torch.export` + `torch_tensorrt.dynamo` |

## Arquitectura y entrenamiento

El repositorio no contiene pesos entrenados por el autor, sino artefactos de compilación. Las redes subyacentes pertenecen a DiffuEraser, un modelo de vídeo inpainting construido sobre Stable Diffusion 1.5: un BrushNet que aporta la condición de máscara y contexto, un UNet de movimiento que modela la coherencia temporal entre fotogramas y el VAE `sd-vae-ft-mse` de Stability AI para codificar y decodificar píxeles. La UNet incorpora una LoRA PCM (Progressive Consistency Model) de 2 pasos fusionada, lo que reduce el número de pasos de muestreo necesarios.

La innovación técnica de esta distribución es la compilación a TensorRT para sm120 (Blackwell), con tres conjuntos de motores: `trt11.1.0-hc-any/`, que admite lienzos de 384 a 960 píxeles en ambos lados (múltiplos de 64) con un solo motor por red para ambas orientaciones; `trt11.1.0-hc/`, con un motor por orientación, probado en RTX PRO 6000 y RTX PRO 4500; y `trt11.1.0/`, ajustado a la RTX PRO 6000 (188 SMs), que advierte de posible interbloqueo en GPUs con menos SMs. Los motores de difusión procesan 22 fotogramas por pasada. No se documentan datos de entrenamiento, composición del dataset ni proceso de RLHF/DPO, ya que no se entrenó ningún modelo nuevo.

## Capacidades

- Eliminación de objetos y reconstrucción de contenido en vídeo (vídeo inpainting) mediante difusión sobre secuencias de 22 fotogramas.
- Generación condicionada por máscara a través de BrushNet, con coherencia temporal proporcionada por la UNet de movimiento.
- Procesamiento de lienzos de hasta 960 píxeles por lado, con alturas o anchuras variables en múltiplos de 64 (384..960) en la variante `any`.
- Soporte de orientación horizontal (`land`) y vertical (`port`) del lienzo.
- Muestreo acelerado mediante LoRA PCM de 2 pasos fusionada en la UNet.
- Codificación y decodificación de latentes con el VAE `sd-vae-ft-mse`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- **Eliminación de objetos en postproducción de vídeo**: cargar los motores `trt11.1.0-hc-any/` en una GPU Blackwell y ejecutar el pipeline de DiffuEraser sobre clips de 22 fotogramas para borrar objetos no deseados, aprovechando la compilación TensorRT para reducir la latencia frente a la ejecución en PyTorch.
- **Limpieza de marcas de agua o logotipos en material de archivo**: usar las máscaras para delimitar la región y dejar que BrushNet y la UNet de movimiento reconstruyan el fondo de forma coherente entre fotogramas, con la ventaja de que la variante `any` cubre orientaciones y resoluciones variables sin recompilar.
- **Restauración de metraje con elementos dañados**: aplicar inpainting sobre zonas corruptas de secuencias de archivo, procesando en lotes de 22 fotogramas y eligiendo la orientación `land` o `port` según el formato del material.
- **Prototipado de herramientas de edición de vídeo**: integrar los motores en una aplicación de edición que requiera inferencia local en GPUs RTX PRO, usando `trt11.1.0-hc/` por su compatibilidad probada en RTX PRO 6000 y RTX PRO 4500.
- **Investigación en difusión de vídeo**: emplear los motores como referencia de despliegue TensorRT de un pipeline de difusión de vídeo para medir throughput y comparar con la ejecución nativa en PyTorch.
- **Generación de datos sintéticos para entrenamiento**: eliminar objetos de clips de vídeo para producir pares máscara/imagen limpia que alimenten otros modelos de visión, aprovechando la coherencia temporal de la UNet de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **GPU**: exclusivamente NVIDIA Blackwell con capacidad de cómputo 12.0 (sm120). Los motores no cargan en otras arquitecturas.
- **TensorRT**: versión 11.1.0 obligatoria; los motores no cargan con otras versiones.
- **VRAM estimada**: no disponible de forma explícita. Los ficheros de motores suman aproximadamente 8 GB en la variante `hc` (BrushNet 2,4/2,6 GB, UNet 5,25/5,6 GB, VAE 0,11-0,15 GB por orientación), a lo que hay que añadir la memoria de activaciones y del pipeline de DiffuEraser, no documentada.
- **GPUs probadas por el autor**: RTX PRO 6000 y RTX PRO 4500. La variante `trt11.1.0/` está ajustada a la RTX PRO 6000 (188 SMs) y puede provocar interbloqueos en GPUs con menos SMs.
- **GPUs de consumo**: no hay evidencia de que funcione en GPUs consumer, ya que las RTX 40/50 de consumo no son sm120 en todos los casos y el autor solo documenta pruebas en RTX PRO.
- **Despliegue**: los motores se cargan con Torch-TensorRT; el repositorio no incluye script de inferencia, servidor ni integración con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DiffuEraser TensorRT engines (sm120) | Motores compilados de vídeo inpainting | 22 fotogramas, lienzo 384..960 px | CreativeML Open RAIL-M | HuggingFace, solo sm120 + TensorRT 11.1.0 |
| lixiaowen/diffuEraser | Modelo original de vídeo inpainting | 22 fotogramas (según modelo base) | Apache 2.0 | HuggingFace, pesos PyTorch |
| Stable Diffusion 1.5 inpainting | Imagen inpainting (sin coherencia temporal) | Imagen única | CreativeML Open RAIL-M | Amplia disponibilidad |
| sd-vae-ft-mse | VAE de codificación/decodificación | Imagen | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Compatibilidad de hardware extremadamente restrictiva**: los motores solo cargan en GPUs sm120 con TensorRT 11.1.0; cualquier otra combinación falla.
- **Riesgo de interbloqueo**: la variante `trt11.1.0/` está ajustada a 188 SMs y puede colgarse en GPUs con menos SMs, según advierte el propio autor.
- **Sin código de inferencia**: el repositorio solo contiene motores serializados; el usuario debe aportar el pipeline de DiffuEraser, la gestión de máscaras y el preprocesado de vídeo.
- **Licencia con restricciones de uso**: CreativeML Open RAIL-M impone restricciones de uso del párrafo 5 y Anexo A, que se aplican a los motores y a todos sus usuarios; no es una licencia permisiva para cualquier uso comercial.
- **Sesgos**: al derivar de Stable Diffusion 1.5, hereda los sesgos de su dataset de entrenamiento en la reconstrucción de contenido.
- **Riesgo de artefactos**: la generación de contenido en las regiones enmascaradas puede producir resultados incoherentes o alucinados, especialmente con máscaras grandes o movimiento complejo.
- **Sin soporte lingüístico ni de texto**: no es un modelo de lenguaje; no debe evaluarse con métricas de NLP.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin documentación de validación más allá de las pruebas del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SergioShu/diffueraser-trt-sm120
- Modelo base DiffuEraser: https://huggingface.co/lixiaowen/diffuEraser
- Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- VAE sd-vae-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Licencia CreativeML Open RAIL-M: incluida en el repositorio como `LICENSE-CreativeML-OpenRAIL-M`
- Licencia Apache 2.0 de DiffuEraser: incluida en el repositorio como `LICENSE-Apache-2.0`

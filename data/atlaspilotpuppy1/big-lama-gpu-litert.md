# AtlasPilotPuppy1/big-lama-gpu-litert

## Resumen

Big-Lama (LiteRT/TFLite, GPU-friendly) es una conversión del modelo de inpainting LaMa "big-lama", desarrollado originalmente por Samsung Research (Suvorov et al., WACV 2022), empaquetado como un único archivo `.tflite` para inferencia on-device con LiteRT. El autor de la conversión es AtlasPilotPuppy1. El modelo resuelve el problema de rellenar huecos en imágenes (inpainting) generando contenido plausible a partir del contexto circundante, y su relevancia radica en que reescribe el grafo para que la GPU del teléfono ejecute la totalidad de los 1.775 nodos, frente a los 51 de 3.398 que ejecutaba el export ONNX estándar.

La arquitectura subyacente es una red de inpainting con convoluciones de Fourier (Fourier convolutions), entrenada sobre Places2. Los pesos son los originales de big-lama; solo cambia la forma en que se expresan las 36 unidades de Fourier. El archivo ocupa 104.462.288 bytes y almacena los pesos en fp16, con cómputo fp32 en CPU y precisión media (o completa, bajo petición) en GPU.

La entrada es fija de 512 x 512 píxeles, con dos tensores (imagen y máscara) en formato NCHW. Es una herramienta especializada en image-to-image, no un modelo generativo de propósito general, y está pensada para integrarse en aplicaciones móviles de edición fotográfica, borrado de objetos y restauración de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de inpainting con convoluciones de Fourier (Fourier convolution inpainting network) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada fija 512 x 512) |
| Tipos de cuantización | Pesos en fp16; cómputo fp32 en CPU y fp16/fp32 en GPU |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), archivo `big_lama_gpu_fp16.tflite` |

## Arquitectura y entrenamiento

LaMa es una red de inpainting basada en convoluciones de Fourier, diseñada para ser robusta a la resolución y eficaz en huecos grandes. El modelo big-lama fue entrenado sobre el dataset Places2. La conversión a LiteRT reescribe las 36 unidades de Fourier: la DFT real a lo ancho se expresa como dos matmuls constantes, la DFT compleja a lo alto como un matmul constante sobre las partes real e imaginaria concatenadas en el último eje, y la convolución 1x1 con ReLU y la inversa se reorganizan de forma equivalente. Todos los tensores tienen rango 4 o menos y todos los matmuls tienen el lado derecho constante, lo que permite que la GPU del dispositivo ejecute el grafo completo.

El pipeline de conversión pasa por el export ONNX de Carve/LaMa-ONNX, fijado a forma 512 x 512 con onnxslim, y luego por onnx2torch y litert-torch (con parches para Squeeze/Unsqueeze de eje constante, Slice y ConvTranspose), almacenando finalmente los pesos en fp16 con ai-edge-quantizer. No se dispone de información sobre el número de tokens de entrenamiento ni sobre fases de RLHF/DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas con contenido plausible a partir del contexto circundante.
- Entrada fija de 512 x 512 píxeles; las imágenes grandes deben procesarse por teselas con solapamiento.
- Máscara binaria: 1 donde se debe rellenar, 0 donde se conserva el píxel original.
- Salida en rango 0 a 255; debe usarse solo dentro de la máscara, conservando los píxeles originales fuera de ella.
- Ejecución on-device con LiteRT, con delegación completa a GPU (1.775 nodos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de imagen).

## Casos de uso

- Borrado de objetos en apps móviles de fotografía: el usuario pinta una máscara sobre un objeto no deseado y el modelo rellena el hueco con textura plausible del entorno; los 350-373 ms por tesela en GPU lo hacen viable de forma interactiva.
- Restauración de fotografías con arañazos o marcas: se enmascaran las zonas dañadas y el modelo reconstruye el contenido a partir de las regiones sanas circundantes.
- Eliminación de marcas de agua o logotipos en imágenes propias: se aplica la máscara sobre el elemento y se rellena con el fondo; útil en flujos de limpieza de assets gráficos.
- Limpieza de imágenes para datasets de entrenamiento: eliminación de objetos espurios o anotaciones superpuestas antes de usar las imágenes en pipelines de visión por computador.
- Edición no destructiva en aplicaciones de escritorio o web con backend LiteRT: el modelo puede ejecutarse en CPU (0,59 s por tesela en Mac con 4 hilos) cuando no hay GPU disponible.
- Preprocesado en dispositivos de bajo consumo: al caber en un archivo de ~100 MB y ejecutarse con XNNPACK en CPU de teléfono (7,0-7,6 s por tesela), sirve para escenarios sin aceleración GPU.
- Relleno de huecos en imágenes satelitales o médicas (con las cautelas oportunas): el modelo genera textura plausible, útil para visualización, aunque no recupera el contenido real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de inpainting. Los datos de rendimiento publicados son los siguientes:

| Métrica | Valor |
|---|---|
| Tamaño del archivo | 104.462.288 bytes |
| Nodos del grafo en GPU | 1.775 de 1.775 |
| Tiempo de compilación GPU | 2,6 a 3,8 s |
| Inferencia GPU fp16 (Pixel 10 Pro) | 350 a 373 ms por tesela |
| Inferencia GPU fp32 (Pixel 10 Pro) | 927 a 967 ms por tesela |
| Inferencia CPU XNNPACK (teléfono) | 7,0 a 7,6 s por tesela |
| Inferencia CPU Mac (4 hilos) | 0,59 s por tesela |
| ONNX estándar (referencia) | 51 de 3.398 nodos en GPU, ~9,5 s por tesela |
| Diferencia LiteRT fp32 CPU vs ONNX | ≤ 0,0024 en escala 0-255 |
| Diferencia GPU fp32 vs CPU | ≤ 1 nivel de 255 |
| Diferencia GPU fp16 vs CPU (media) | 0,2 a 2,5 niveles de 255 en 10 teselas |
| Diferencia GPU fp16 vs CPU (peor píxel) | 8 a 83 niveles de 255 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo de pesos ocupa ~100 MB en fp16, por lo que la huella de memoria es reducida.
- GPU recomendadas: GPU integrada de teléfonos compatibles con LiteRT GPU delegate (probado en Pixel 10 Pro); en escritorio, cualquier GPU compatible con LiteRT.
- Cabe en GPU de consumo: sí, dado el tamaño reducido del modelo; también en CPU de teléfono mediante XNNPACK.
- Opciones de despliegue: LiteRT (antes TensorFlow Lite) con delegación GPU o XNNPACK; el modelo se distribuye como `.tflite`.
- Latencia y throughput: 350-373 ms por tesela en GPU fp16, 927-967 ms en GPU fp32, 7,0-7,6 s en CPU de teléfono y 0,59 s en CPU de Mac con 4 hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| big-lama-gpu-litert (este) | Inpainting Fourier | 512 x 512 fija | Apache-2.0 | LiteRT/TFLite | Grafo reescrito para GPU completa; 350-373 ms/tesela en Pixel 10 Pro |
| LaMa-ONNX (Carve) | Inpainting Fourier | 512 x 512 fija | Apache-2.0 | ONNX Runtime | Export de referencia; solo 51 de 3.398 nodos en GPU, ~9,5 s/tesela |
| big-lama original (advimman) | Inpainting Fourier | variable | Apache-2.0 | PyTorch | Pesos originales; requiere framework de escritorio |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo inventa un relleno plausible; no recupera el contenido real que había en la zona enmascarada.
- En huecos grandes genera textura suave y plausible, no detalle fiel.
- La entrada es fija de 512 x 512; las imágenes grandes requieren teselado con solapamiento, lo que puede producir costuras si no se gestiona bien.
- La salida debe usarse solo dentro de la máscara, conservando los píxeles originales fuera de ella.
- En GPU fp16 la diferencia con CPU puede llegar a 8-83 niveles de 255 en píxeles aislados, aunque visualmente el resultado es equivalente.
- Los pesos se entrenaron sobre Places2; deben revisarse los términos de ese dataset para el uso previsto.
- Riesgo de sesgos heredados del dataset de entrenamiento (Places2), no cuantificados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligación de mantener el aviso de copyright y atribución a los autores originales (Samsung Research) y al export ONNX de Carve.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtlasPilotPuppy1/big-lama-gpu-litert
- Repositorio original de LaMa: https://github.com/advimman/lama
- Export ONNX de referencia: https://huggingface.co/Carve/LaMa-ONNX
- Paper: https://arxiv.org/abs/2109.07161 (Suvorov et al., "Resolution-robust Large Mask Inpainting with Fourier Convolutions", WACV 2022)

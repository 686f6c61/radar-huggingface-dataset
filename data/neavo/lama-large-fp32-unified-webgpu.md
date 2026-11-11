# neavo/lama-large-fp32-unified-webgpu

## Resumen

LaMa Large FP32 Unified WebGPU es una reexportación a ONNX del modelo de inpainting para manga y anime `dreMaz/AnimeMangaInpainting`, publicada por el usuario neavo. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es una red convolucional de image inpainting (relleno de regiones enmascaradas de una imagen) derivada de la familia LaMa (Large Mask Inpainting), orientada específicamente a ilustración japonesa y páginas de cómic. El autor no ha reentrenado ni cuantizado los pesos originales; su aportación es una optimización de exportación centrada en el cálculo de Fourier y en operaciones de formas repetidas, con el objetivo de acelerar la carga y la inferencia en CPU.

El resultado es un único fichero ONNX de 204,5 MB en FP32 que expone solo dos entradas (`image` y `mask`) y una salida (`inpainted`), y que puede ejecutarse tanto con el execution provider de CPU como con WebGPU mediante `onnxruntime` (recomendado `onnxruntime-node 1.31.1`). Esto lo hace relevante para herramientas de traducción y limpieza de cómics que necesitan eliminar texto de bocadillos y reconstruir el fondo dibujado en el navegador o en escritorio sin depender de PyTorch.

Su interés práctico es acotado pero claro: empaqueta un modelo de inpainting especializado en manga en un formato portable, con soporte de tamaños dinámicos verificados entre 64 y 1024 píxeles, y con una validación numérica frente a la implementación original en PyTorch (error máximo de canal de aproximadamente 0,0342/255 en 30 escenarios). No hay información sobre arquitectura interna detallada, datos de entrenamiento ni benchmarks publicados en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de image inpainting (familia LaMa), reexportada a ONNX; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 únicamente (el autor indica explícitamente que no está cuantizado) |
| Idiomas soportados | no aplica (modelo de imagen); orientado a manga/anime |
| Licencia | MIT |
| Formato de pesos | ONNX (`lama-large-fp32-unified-webgpu.onnx`, 204,5 MB) |

## Arquitectura y entrenamiento

El modelo es una reexportación de los pesos originales de `dreMaz/AnimeMangaInpainting`, un modelo de inpainting de la familia LaMa adaptado a ilustración de manga y anime. La arquitectura LaMa se caracteriza por el uso de convoluciones con máscaras de gran tamaño y de transformadas de Fourier para capturar contexto global en la reconstrucción de regiones faltantes. El autor de esta ficha de exportación no aporta detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni si hubo fases de ajuste fino adicionales sobre el modelo base.

La innovación de esta versión concreta es de ingeniería de exportación, no de modelado: se han optimizado los cálculos de Fourier y las operaciones con formas repetidas para mejorar la velocidad de carga e inferencia en CPU, manteniendo el cálculo principal en FP32. Se ha verificado el comportamiento con tamaños dinámicos desde 64 hasta 1024 píxeles, incluyendo rectángulos horizontales y verticales, y se ha comparado la salida frente a la implementación PyTorch original en 30 escenarios sobre CPU y WebGPU, con una desviación máxima de canal de aproximadamente 0,0342/255. El autor advierte que no se garantiza una coincidencia bit a bit en hardware distinto. La implementación de referencia para la exportación proviene de BallonsTranslator.

## Capacidades

- Inpainting de imágenes: reconstruye la región indicada por una máscara binaria a partir del contexto visible de la imagen.
- Entrada y salida en float32 con rango 0–1; entrada `image` de forma `[1,3,H,W]` y máscara `mask` de forma `[1,1,H,W]` donde el valor 1 indica la zona a reparar.
- Salida `inpainted` de forma `[1,3,H,W]`; el pipeline recomendado recorta al tamaño original y compone solo los píxeles enmascarados, preservando el resto de la imagen.
- Soporte de tamaños dinámicos: el autor ha verificado dimensiones entre 64 y 1024 píxeles, incluyendo rectángulos horizontales y verticales. Las dimensiones deben rellenarse a múltiplos de 64 antes de la inferencia.
- Ejecución unificada en CPU y WebGPU con un único fichero ONNX; en modo WebGPU se mantiene un fallback a CPU para cálculos auxiliares de coeficientes y formas.
- Especialización en manga y anime: el modelo base está orientado a este dominio, lo que favorece la reconstrucción de tramas, líneas y fondos característicos de la ilustración japonesa.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento; es exclusivamente un modelo de inpainting.

## Casos de uso

- Limpieza de bocadillos en traducción de cómics: se detecta el texto del globo, se genera una máscara y el modelo reconstruye el fondo dibujado debajo, permitiendo superponer la traducción sin restos del texto original. Es el caso de uso principal del modelo base y para el que fue entrenado.
- Integración en pipelines de BallonsTranslator: al ser una exportación derivada de la implementación de referencia de ese proyecto, encaja de forma natural en su flujo de trabajo de traducción automática de manga, sustituyendo la inferencia PyTorch por ONNX.
- Edición de ilustración en el navegador: gracias al soporte de WebGPU con `onnxruntime-web`, se puede ofrecer una herramienta de borrado y relleno de regiones en una aplicación web sin backend, con el modelo de 204,5 MB cargado en el cliente.
- Herramientas de escritorio multiplataforma: con `onnxruntime-node 1.31.1` y execution provider de CPU, se puede desplegar en aplicaciones Electron o Node.js sin dependencias de CUDA ni de PyTorch, reduciendo el tamaño del instalador y la complejidad del entorno.
- Restauración de páginas escaneadas: eliminación de sellos, marcas de agua o artefactos de escaneo sobre ilustraciones en blanco y negro o en color, aprovechando la reconstrucción de tramas y líneas del dominio manga.
- Preprocesado para OCR y traducción: limpiar regiones de texto antes de pasarlas por un OCR o un modelo de traducción, mejorando la calidad de la detección posterior en páginas con fondos complejos.
- Prototipado e investigación en inpainting de dominio específico: servir como referencia FP32 exportada y validada numéricamente frente a PyTorch para comparar implementaciones o como base para experimentos de cuantización posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación numérica aportado por el autor es la comparación frente a la implementación PyTorch original: error máximo de canal de aproximadamente 0,0342/255 en 30 escenarios sobre CPU y WebGPU. No se proporcionan cifras de latencia, throughput ni métricas de calidad de inpainting (PSNR, SSIM, FID).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero ONNX pesa 204,5 MB en FP32, por lo que la huella de pesos en memoria es de ese orden, más las activaciones intermedias que dependen de la resolución de entrada (hasta 1024 píxeles verificados).
- GPU recomendadas: no se especifican modelos concretos. El soporte WebGPU permite su uso en GPUs integradas y dedicadas compatibles con dicho API a través del navegador o de `onnxruntime-node`.
- GPU de consumo: al ser un modelo de 204,5 MB en FP32, es previsible que quepa en cualquier GPU de consumo moderna con soporte WebGPU, aunque el autor no publica requisitos mínimos ni cifras de consumo de memoria.
- Opciones de despliegue: `onnxruntime-node 1.31.1` (CPU y WebGPU), `onnxruntime-web` para navegador, y cualquier runtime compatible con ONNX que soporte los execution providers correspondientes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor indica que la exportación prioriza la mejora de la velocidad de carga e inferencia en CPU, pero no aporta medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto de uso | Disponibilidad |
|---|---|---|---|---|---|
| neavo/lama-large-fp32-unified-webgpu | Inpainting CNN (LaMa) para manga | ONNX FP32 | MIT | CPU y WebGPU | Hugging Face |
| dreMaz/AnimeMangaInpainting | Inpainting CNN (LaMa) para manga, pesos originales | PyTorch | MIT (según model card original) | GPU con PyTorch | Hugging Face |
| LaMa (Saar et al.) | Inpainting CNN generalista | PyTorch | Apache 2.0 (según publicación original) | GPU con PyTorch | Repositorio original |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa de rendimiento entre estas alternativas en la información proporcionada. La diferencia principal entre la primera y la segunda es el formato (ONNX frente a PyTorch) y la optimización de exportación; la tercera es un modelo generalista del que deriva la familia.

## Limitaciones y advertencias

- Modelo especializado en manga y anime: su rendimiento en fotografías reales u otros dominios no está documentado y previsiblemente será inferior al de modelos de inpainting generalistas.
- No se garantiza coincidencia bit a bit con la implementación PyTorch en hardware distinto al usado en la validación; el error máximo medido es de aproximadamente 0,0342/255, pero puede variar.
- Requiere rellenar las dimensiones a múltiplos de 64 y recortar después; un uso incorrecto del pipeline puede producir artefactos en los bordes.
- Solo FP32: no se ofrece versión cuantizada, lo que limita la reducción de memoria y el aumento de velocidad que aportarían FP16 o INT8.
- No hay información publicada sobre sesgos, tasas de alucinación visual ni comportamiento en casos límite (máscaras muy grandes, imágenes con poco contexto visible).
- La licencia MIT del modelo base se cita en la model card original, pero conviene verificar los términos del modelo `dreMaz/AnimeMangaInpainting` y de la implementación de referencia de BallonsTranslator antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- El autor solo proporciona el fichero ONNX y las instrucciones de uso; no se incluyen scripts de preprocesado, detección de texto ni integración completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neavo/lama-large-fp32-unified-webgpu
- Modelo base: https://huggingface.co/dreMaz/AnimeMangaInpainting
- Implementación de referencia (BallonsTranslator): https://github.com/dmMaze/BallonsTranslator
- ONNX Runtime: https://onnxruntime.ai/
- Paper original de LaMa: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada

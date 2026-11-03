# smile-forge/depth-anything-v2-small-onnx

## Resumen

Depth Anything V2 Small ONNX es una conversión a formato ONNX del modelo Depth Anything V2 Small, desarrollado originalmente por el equipo de Depth Anything (Yang, Kang, Huang, Zhao, Xu, Feng y Zhao, presentado en NeurIPS 2024). El modelo original estima profundidad relativa monocular a partir de una única imagen, es decir, genera un mapa de disparidad (inverso de la profundidad) sin necesidad de calibración ni de pares estéreo. Esta versión concreta la publica el usuario smile-forge como un único grafo ONNX ejecutable sobre ONNX Runtime en CPU o CUDA, pensado para integrarse en la aplicación de escritorio Nexaflow (un editor de imágenes en C#) y reutilizable por cualquier proyecto que emplee ONNX Runtime 1.30 o superior.

La relevancia de esta ficha radica en que empaqueta el modelo Small (el único de la familia con licencia Apache-2.0, frente a CC-BY-NC-4.0 en Base, Large y Giant) en un artefacto de 96 MB, con dos dimensiones simbólicas que permiten procesar imágenes de cualquier tamaño en un solo grafo. El repositorio ocupa 0,1 GB e incluye únicamente los pesos en fp32 dentro de la carpeta `estimator/`.

No se dispone de información sobre idiomas soportados ni de parámetros totales del modelo en la información proporcionada; se trata de un modelo de visión, no de un modelo de lenguaje, por lo que la noción de "idiomas" no aplica directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (DINOv2 como backbone) con cabeza de estimación de profundidad; exportado como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada `pixels` `[1, 3, H, W]` con H y W múltiplos de 14) |
| Tipos de cuantizacion | fp32 (único formato incluido en el repo); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un único grafo, 96 MB, fp32) |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 Small, un transformer de visión que emplea DINOv2 como extractor de características y una cabeza de profundidad que produce un mapa de disparidad relativa. La versión ONNX conserva el `forward` original de los autores, incluida la activación ReLU, y deja dos dimensiones simbólicas (alto y ancho) para admitir cualquier tamaño de imagen con un solo grafo. Para lograrlo, la conversión sustituye dos operaciones problemáticas en la traza: el redimensionado del embedding posicional de la rejilla 37 × 37 de DINOv2 (resuelto con productos matriciales que replican la interpolación bicúbica de PyTorch con factor (n + 0,1)/37 y A = −0,75) y el redimensionado final de la cabeza al tamaño de entrada (que en el código original usa `int()` y por tanto queda fijado en la traza).

El proceso de construcción descarga los pesos originales desde `depth-anything/Depth-Anything-V2-Small` (commit 03876f8), verifica su hash, los carga con `weights_only` y exporta con `torch.onnx.export`. La fidelidad reportada es de 1,2×10⁻⁴ frente al modelo de los autores y de 3,1×10⁻⁴ frente al grafo original en CPU y CUDA (menos del 0,01 % del rango de disparidad), evaluada sobre las imágenes de muestra a tres tamaños y sobre una imagen cuadrada. No se detalla en la información disponible el volumen de datos de entrenamiento ni si hubo RLHF/DPO (no aplica en un modelo de profundidad).

## Capacidades

- Estimación de profundidad relativa monocular a partir de una sola imagen RGB.
- Salida de disparidad `[1, H, W]` (inverso de la profundidad, mayor cuanto más cerca), con escala y offset propios del modelo.
- Acepta imágenes de cualquier tamaño, siempre que alto y ancho sean múltiplos de 14.
- Ejecución en CPU y en CUDA mediante ONNX Runtime 1.30 o superior.
- Preprocesado documentado: lectura RGB sobre 255 en doble precisión, redimensionado con `INTER_CUBIC` de OpenCV para que el lado corto sea 518 y cada lado el múltiplo de 14 más cercano (redondeando hacia arriba si queda por debajo de 518), normalización con media (0,485, 0,456, 0,406) y desviación (0,229, 0,224, 0,225), y salida llevada al tamaño original con interpolación bilineal y `align_corners=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Desenfoque de lente en editores de imagen: el mapa de disparidad permite aplicar un desenfoque selectivo que respeta la profundidad de la escena; es el uso original en Nexaflow para su función de lens blur.
- Efecto de neblina por profundidad (depth haze): la disparidad relativa sirve para modular la opacidad de una capa de niebla según la distancia estimada de cada píxel, útil en herramientas de composición fotográfica.
- Selección por distancia en editores: permite al usuario seleccionar regiones de la imagen en función de su profundidad (por ejemplo, "seleccionar el primer plano"), agilizando el enmascarado manual.
- Generación de mapas de profundidad para pipelines de posproducción: exportar el mapa como canal auxiliar para composición, VFX o conversión a 2.5D en flujos de trabajo que ya usan ONNX Runtime.
- Preprocesado para reconstrucción 3D o realidad aumentada: la profundidad relativa puede alimentar etapas posteriores de estimación de geometría cuando no se dispone de calibración estéreo.
- Automatización de pruebas de visión en CI/CD: al ser un artefacto ONNX determinista y de 96 MB, se puede integrar en pipelines de validación de modelos o de regresión visual, ejecutándolo en CPU sin GPU dedicada.
- Aplicaciones de escritorio en C#/.NET: el host de Nexaflow demuestra que el grafo puede consumirse desde .NET con ONNX Runtime, lo que facilita su integración en aplicaciones nativas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento reportados son de latencia y memoria: una foto de 3:2 (784 × 518) tarda 9 ms en una RTX PRO 6000 y 0,2 s en 16 hilos de CPU, con un pico de 1,6 GB en GPU; a 1554 × 518 el pico es de 2,9 GB. La fidelidad numérica frente al modelo original es de 3,1×10⁻⁴ en CPU y CUDA, y la discrepancia del host C# de Nexaflow es del 0,002 % del rango en CPU y del 0,7 % en GPU (por el uso de TF32 en las multiplicaciones matriculares del proveedor CUDA de ONNX Runtime).

## Requisitos de hardware

- VRAM estimada: 1,6 GB de pico para una entrada de 784 × 518; 2,9 GB para 1554 × 518.
- GPU recomendadas: RTX PRO 6000 (medida de referencia, 9 ms); cualquier GPU compatible con el proveedor CUDA de ONNX Runtime.
- Cabe en GPU de consumo: sí, dado el bajo pico de memoria (por debajo de 3 GB), aunque no se especifican modelos concretos de consumo en la información.
- CPU: funciona en CPU con ONNX Runtime; 0,2 s en 16 hilos para 784 × 518.
- Opciones de despliegue: ONNX Runtime 1.30 o superior (CPU y CUDA); el host de referencia es C#/.NET en Nexaflow. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: 9 ms en RTX PRO 6000 y 0,2 s en CPU de 16 hilos para 784 × 518; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small (esta versión ONNX) | no disponible | Imagen `[1, 3, H, W]`, H y W múltiplos de 14 | Apache-2.0 | ONNX fp32 | HuggingFace (smile-forge) |
| Depth Anything V2 Small (original) | no disponible | Igual, vía `infer_image` | Apache-2.0 | PyTorch (safetensors/checkpoint) | HuggingFace (depth-anything) |
| Depth Anything V2 Base | no disponible | Igual | CC-BY-NC-4.0 | PyTorch | HuggingFace (depth-anything) |
| Depth Anything V2 Large | no disponible | Igual | CC-BY-NC-4.0 | PyTorch | HuggingFace (depth-anything) |

No se dispone de datos de benchmarks para comparar el rendimiento numérico entre estas variantes en la información proporcionada. La diferencia clave entre ellas es la licencia: solo Small es Apache-2.0, mientras que Base, Large y Giant son CC-BY-NC-4.0 y no están incluidos en este repositorio.

## Limitaciones y advertencias

- El modelo produce profundidad relativa, no métrica: la escala y el offset de la disparidad son propios del modelo y no permiten medir distancias absolutas sin calibración adicional.
- Solo se incluye la variante Small; Base, Large y Giant no están en el repositorio y además tienen licencia CC-BY-NC-4.0, no apta para uso comercial sin permiso.
- La entrada debe tener alto y ancho múltiplos de 14; otras dimensiones requieren redimensionado previo.
- El preprocesado es sensible: desviarse del pipeline documentado (orden de canales, normalización, interpolación) degrada la fidelidad de la salida.
- En GPU, el proveedor CUDA de ONNX Runtime usa TF32 en las multiplicaciones matriculares, lo que introduce una discrepancia de hasta el 0,7 % del rango de disparidad frente a CPU.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica el concepto de alucinación en un modelo de profundidad, aunque sí puede producir estimaciones erróneas en escenas ambiguas, transparentes o con poca textura; esto no se detalla en la información).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y la cita del paper original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smile-forge/depth-anything-v2-small-onnx
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Repositorio original: https://github.com/DepthAnything/Depth-Anything-V2
- Proyecto Nexaflow: https://github.com/smile-forge/nexaflow
- Paper: Yang, Kang, Huang, Zhao, Xu, Feng, Zhao. *Depth Anything V2.* NeurIPS 2024.

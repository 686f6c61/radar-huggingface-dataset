# BasinShapers/sf3d-webgpu-weights

## Resumen

BasinShapers/sf3d-webgpu-weights es un repositorio que aloja los pesos convertidos de Stable Fast 3D (SF3D), el modelo de Stability AI para generación de mallas 3D texturizadas a partir de una sola imagen, adaptados para ejecutarse íntegramente en el navegador mediante WebGPU. El proyecto, desarrollado por lyonsno en el repositorio sf3d-webgpu, elimina la necesidad de servidor, Python o runtime ONNX en inferencia: todo el cómputo ocurre en shaders de compute WebGPU. Este paquete de pesos permite a cualquier desarrollador integrar generación 3D en aplicaciones web sin infraestructura backend, reduciendo la barrera de entrada para herramientas de diseño, comercio electrónico o juegos.

El archivo principal es `weights.bin`, un binario plano en fp16 de aproximadamente 2,1 GB, que contiene los tensores del modelo original reorganizados para carga directa en WebGPU. La arquitectura subyacente es la de SF3D, un modelo feed-forward basado en el Large Reconstruction Model (LRM) que genera mallas con UV-unwrapping, materiales y albedo en menos de un segundo en hardware dedicado. En este port, el tiempo de generación depende del hardware del cliente; el autor reporta unos 33 segundos en un Apple M4 Max. La licencia es la Stability AI Community License, con restricciones para uso comercial por organizaciones que superen el millón de dólares de ingresos anuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Stable Fast 3D, feed-forward basado en LRM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (binario plano) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Stability AI Community License (stability-ai-community) |
| Formato de pesos | binario plano fp16 (`weights.bin`) |

## Arquitectura y entrenamiento

El modelo original Stable Fast 3D es un modelo feed-forward de reconstruccion 3D que toma una imagen RGB como entrada y produce una malla texturizada con UV-unwrapping, parametros de material y albedo. Se basa en el Large Reconstruction Model (LRM) y fue entrenado por Stability AI, aunque los detalles especificos del dataset y el proceso de entrenamiento no se incluyen en la informacion disponible. Este repositorio no contiene un modelo reentrenado, sino una conversion de formato: los pesos originales en `model.safetensors` se transforman en un binario plano con pesos transpuestos y solo los tensores relevantes para WebGPU, manteniendo intactos la arquitectura y los valores aprendidos. La herramienta de conversion esta disponible en `tools/convert_weights.py` del repositorio de aplicacion.

## Capacidades

- Generacion de mallas 3D texturizadas a partir de una sola imagen (image-to-3d).
- UV-unwrapping automatico y generacion de mapas de materiales y albedo.
- Ejecucion completamente en el navegador via WebGPU, sin servidor ni dependencias de Python.
- Reproducibilidad byte a byte con la salida de PyTorch, segun el autor.
- No incluye capacidades de texto, codigo, razonamiento ni tool calling; es un modelo puramente visual.

## Casos de uso

- Visualizacion de productos en comercio electronico: un usuario sube una foto de un objeto y el navegador genera una malla 3D interactiva que puede rotarse y examinarse, mejorando la experiencia de compra sin enviar datos a un servidor.
- Prototipado rapido en diseno industrial: los disenadores pueden convertir bocetos o fotografias en modelos 3D preliminares directamente en una herramienta web, acelerando la iteracion inicial.
- Generacion de assets para juegos indie: desarrolladores pueden crear props o personajes simples a partir de imagenes de referencia, con texturas y materiales listos para importar en motores como Unity o Godot.
- Educacion y museos virtuales: instituciones pueden digitalizar objetos fisicos fotografiados y mostrarlos en 3D en sus sitios web, sin necesidad de infraestructura de renderizado.
- Herramientas de diseno de interiores: los usuarios pueden cargar una foto de un mueble o decoracion y obtener un modelo 3D para colocarlo en una escena virtual.
- Archivo y documentacion de patrimonio: fotografias de piezas arqueologicas o artisticas se convierten en modelos 3D navegables para catalogo digital, con la ventaja de que el procesamiento ocurre en el dispositivo del visitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que en un Apple M4 Max la generacion de un GLB texturizado tarda aproximadamente 33 segundos, y que la salida es byte a byte reproducible con la version PyTorch, pero no se proporcionan metricas de calidad (PSNR, IoU, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Navegador con soporte WebGPU (Chrome, Edge, Firefox Nightly, Safari Technology Preview).
- El archivo de pesos pesa ~2,1 GB, por lo que se requiere suficiente VRAM para cargarlo; no se especifica un minimo exacto.
- En un Apple M4 Max (GPU integrada) el tiempo de generacion es de ~33 segundos; en GPUs discretas de gama media o alta el rendimiento puede variar.
- No se requiere GPU dedicada para ejecutar el codigo, pero si para un rendimiento aceptable; en iGPUs antiguas puede ser muy lento o fallar.
- Opciones de despliegue: unica via, aplicacion web estatica servida con cualquier hosting (por ejemplo, GitHub Pages o Vercel) que sirva los archivos estaticos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Este repositorio es una conversion del mismo modelo Stable Fast 3D, por lo que su rendimiento intrinseco es identico al original en terminos de calidad de malla. Otras alternativas de image-to-3d como TripoSR o LGM no tienen versiones WebGPU publicas comparables en la informacion disponible. La principal diferencia frente al modelo original es el formato de pesos y el entorno de ejecucion (navegador vs. Python), no la capacidad del modelo.

## Limitaciones y advertencias

- Licencia restrictiva: la Stability AI Community License permite uso comercial solo a organizaciones e individuos con ingresos anuales de 1 millon de dolares o menos; superar ese umbral requiere una licencia Enterprise de Stability AI.
- Requiere un navegador moderno con WebGPU; navegadores antiguos o sin soporte no podran ejecutar el modelo.
- El archivo de pesos es grande (2,1 GB), lo que puede provocar tiempos de carga largos y problemas de memoria en dispositivos con poca VRAM.
- No se han documentado sesgos o riesgos de alucinacion especificos, pero al ser un modelo generativo visual, puede producir geometrias o texturas incorrectas en imagenes ambiguas o de baja calidad.
- No hay informacion sobre el dataset de entrenamiento ni sobre posibles limitaciones en tipos de objetos (por ejemplo, objetos transparentes o con reflejos).
- El modelo no soporta entrada de texto ni instrucciones; solo procesa imagenes.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/BasinShapers/sf3d-webgpu-weights
- Repositorio de aplicacion (GitHub): https://github.com/lyonsno/sf3d-webgpu
- Sitio oficial de Stable Fast 3D: https://stable-fast-3d.github.io/
- Modelo original en HuggingFace: https://huggingface.co/stabilityai/stable-fast-3d
- Repositorio alternativo con runtime ONNX: https://huggingface.co/needle-tools/SF3D-webgpu

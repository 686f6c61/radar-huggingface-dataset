# mickeyvanolst/sf3d-coreml

## Resumen

sf3d-coreml es una conversión a Core ML del modelo Stable Fast 3D (SF3D) de Stability AI, publicada por mickeyvanolst. No se trata de un modelo entrenado desde cero, sino de una adaptación de los pesos de SF3D al formato MLProgram para ejecutarse en el ecosistema Apple ML dentro de TouchDesigner. El objetivo es resolver el problema de la reconstrucción de mallas 3D a partir de una única imagen, un área que hasta ahora requería pipelines pesados en GPU, y acercar esta capacidad al despliegue local en equipos con Apple silicon.

La arquitectura original de SF3D es un transformer de dos streams con un tokenizador de imagen DINOv2-large y un upsampler PixelShuffle, que genera un triplane 3D. El paquete aquí presentado separa esta arquitectura en dos componentes Core ML (`ImageToTriplane.mlpackage` y `NeRFQuery.mlpackage`) y no incorpora las fases de extracción de malla ni de texturizado, que quedan delegadas en el operador Geo Gen del plugin TD Apple ML. El repositorio pesa 1,9 GB y no ofrece datos de parámetros ni de benchmarks en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de dos streams (triplane) con tokenizador DINOv2-large y upsampler PixelShuffle; convertido a Core ML MLProgram |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 512x512) |
| Tipos de cuantización | fp16 |
| Idiomas soportados | no aplica (modelo de imagen a 3D) |
| Licencia | Stability AI Community License |
| Formato de pesos | .mlpackage (Core ML MLProgram) |

## Arquitectura y entrenamiento

El modelo original Stable Fast 3D se basa en TripoSR e introduce técnicas de reconstrucción feed-forward, UV-unwrapping y desentrelazado de iluminación. Esta conversión a Core ML mantiene la arquitectura original de SF3D, dividida en dos paquetes: `ImageToTriplane.mlpackage` (1,8 GB) que contiene el tokenizador de imagen DINOv2-large con la modulación de cámara integrada, el transformer de dos streams y el upsampler PixelShuffle; y `NeRFQuery.mlpackage` (0,1 MB) con las cabezas decodificadoras que producen densidad, albedo y desplazamiento de vértices. La extracción de malla (marching cubes), el UV unwrapping (xatlas) y el texturizado se realizan en el operador Geo Gen de TD Apple ML, no en los paquetes. La conversión se llevó a cabo mediante el script `labs/sf3d/convert_coreml.py` del repositorio TD Apple ML. En la información disponible no se detallan los datos de entrenamiento del modelo original ni la composición del dataset.

## Capacidades

- Reconstrucción de mallas 3D a partir de una única imagen RGB de 512x512, generando un triplane de dimensiones `[1,3,40,384,384]`.
- El paquete `NeRFQuery.mlpackage` incluye las cabezas decodificadoras que producen densidad, albedo y offset de vértices.
- Pensado para integrarse en el operador Geo Gen del plugin TD Apple ML, que se encarga de la extracción de malla, el UV unwrapping y el texture baking.
- Compatible con el entorno Core ML en Apple silicon (M1 o posterior) mediante MLProgram en fp16.
- No soporta entrada de texto, tool calling, agentes ni razonamiento simbólico; es un modelo puramente de imagen a 3D.

## Casos de uso

- Instalaciones interactivas en TouchDesigner: el operador Geo Gen permite generar geometría 3D en tiempo real a partir de una imagen de cámara o de un render, lo que resulta adecuado para arte generativo, VJing y entornos inmersivos.
- Prototipado de assets para juegos: a partir de una concept art, el modelo genera una primera malla con UVs y textura (a través del operador), acelerando el bloqueo de formas en las fases iniciales del pipeline.
- Contenido para realidad virtual: se pueden crear objetos tridimensionales de forma rápida y local para entornos inmersivos, sin necesidad de software de modelado tradicional ni servicios en la nube.
- Digitalización de productos: una simple fotografía de un objeto produce una malla 3D que puede integrarse en un catálogo digital, un configurador o una aplicación de visualización.
- Pipelines de VFX: los artistas pueden usar la geometría generada como base para escultura digital, ahorrando horas de trabajo en el bloqueo de volúmenes complejos.
- Formación en diseño 3D: permite a estudiantes de arte explorar la relación entre imagen y volumen con una herramienta local y accesible, sin depender de infraestructura externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Únicamente se conoce que el modelo original Stable Fast 3D se presenta como un modelo de última generación en reconstrucción 3D feed-forward, pero no se incluyen cifras concretas en la ficha.

## Requisitos de hardware

- Requiere Apple silicon (M1 o posterior) con macOS compatible con Core ML.
- No se ha publicado un valor de VRAM; los paquetes ocupan 1,9 GB en disco (1,8 GB + 0,1 MB).
- No está pensado para GPU NVIDIA ni para sistemas Linux o Windows.
- Opciones de despliegue: exclusivamente el plugin TD Apple ML en TouchDesigner; no es compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Formato | Licencia | Uso |
|---|---|---|---|---|
| mickeyvanolst/sf3d-coreml | Stable Fast 3D (SF3D) | Core ML MLProgram | Stability AI Community License | Operador Geo Gen en TouchDesigner |
| mickeyvanolst/triposr-coreml | TripoSR | Core ML MLProgram | MIT (TripoSR) | Operador Geo Gen en TouchDesigner; según su model card, reconstrucción en unos 2 s en un M-series Air |
| stabilityai/stable-fast-3d | Stable Fast 3D (SF3D) | PyTorch / original | Stability AI Community License | Investigación y desarrollo general |

## Limitaciones y advertencias

- La Stability AI Community License impone restricciones: libre para investigación, uso no comercial y comercial para organizaciones con ingresos anuales inferiores a 1.000.000 USD; por encima de ese umbral se requiere una licencia enterprise de Stability AI.
- No está permitido entrenar otros modelos de fundación a partir de estos pesos.
- Es un paquete Core ML específico para el plugin TD Apple ML; no se puede cargar con frameworks de inferencia estándar como PyTorch, TensorFlow o Hugging Face Transformers.
- La compatibilidad de los paquetes con todas las versiones de TouchDesigner o de macOS no está documentada en la ficha.
- Al ser un modelo generativo de reconstrucción 3D, puede producir geometrías no físicas o con errores en zonas ocluidas, debido a la naturaleza alucinatoria de la reconstrucción a partir de una sola vista.
- No hay evaluaciones de sesgos, robustez ni fallos conocidos publicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mickeyvanolst/sf3d-coreml
- Repositorio TD Apple ML: https://github.com/mickeyvanolst/TD_Apple_ML
- Código oficial de Stable Fast 3D: https://github.com/Stability-AI/stable-fast-3d
- Licencia Stability AI Community License: https://huggingface.co/stabilityai/stable-fast-3d/blob/main/LICENSE.md

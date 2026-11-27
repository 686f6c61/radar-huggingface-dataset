# gguf-org/tripo-gguf

## Resumen

tripo-gguf es una conversión al formato GGUF del modelo TripoSR de Stability AI, un sistema de reconstrucción 3D a partir de una única imagen (image-to-3D). El modelo original, desarrollado en colaboración entre Stability AI y Tripo AI, transforma una fotografía 2D en una malla 3D texturizada en cuestión de segundos, sin necesidad de múltiples vistas ni de un proceso de optimización iterativa. Esta versión GGUF, publicada por el usuario gguf-org, empaqueta los pesos para su ejecución con el motor de cómputo "pig engine" (ggk), lo que facilita el despliegue en entornos locales sin depender del stack original de PyTorch.

El repo incluye además variantes y adaptadores que extienden las capacidades del TripoSR base: una versión basada en TripoSG, una variante "scribble" que acepta un prompt textual junto a la imagen de referencia, un adaptador entrenado específicamente para convertir TripoSR en un modelo scribble, y soporte de máscaras de edición para modificar regiones concretas del resultado. Los pesos están cuantizados en NVFP4, un formato de 4 bits orientado a GPUs NVIDIA recientes.

Con 145,4 millones de parámetros y un tamaño de repo de 3,4 GB, el modelo es lo bastante ligero como para ejecutarse en GPUs de consumo, lo que lo hace relevante para pipelines de generación de assets 3D, prototipado rápido y herramientas creativas de escritorio. La licencia MIT del modelo base facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base TripoSR, basado en transformer con triplane NeRF; detalles exactos no disponibles en la informacion proporcionada) |
| Parametros totales | 145.411.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo image-to-3D, no procesa contexto textual en el sentido habitual) |
| Tipos de cuantizacion | NVFP4 (pesos cuantizados en 4 bits para GPUs NVIDIA) |
| Idiomas soportados | No disponible (el prompt textual de las variantes scribble no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base TripoSR es un sistema de reconstruccion 3D de una sola imagen que combina un codificador de imagen con una representacion intermedia tipo triplane y un decodificador neuronal de radiancia (NeRF) para generar una malla texturizada. El modelo original fue entrenado por Stability AI y Tripo AI sobre un gran corpus de pares imagen-objeto 3D, con un proceso de entrenamiento que prioriza la velocidad de inferencia (del orden de segundos en GPU). Los detalles exactos sobre el numero de tokens, composicion del dataset y si hubo RLHF/DPO no estan disponibles en la informacion proporcionada.

Esta version GGUF no reentrena el modelo, sino que convierte y cuantiza los pesos originales a NVFP4 para su ejecucion con el motor "pig engine" (ggk). El repo anade variantes derivadas: TripoSG (una evolucion del modelo base), una variante scribble que incorpora condicionamiento textual, un adaptador "pig_triposr_scribble_adapter" entrenado nativamente para dotar a TripoSR de capacidad scribble, y soporte de mascaras de edicion que permiten modificar regiones especificas del resultado 3D. La innovacion principal de esta publicacion es el empaquetado en GGUF con cuantizacion de 4 bits, que reduce los requisitos de memoria frente a los pesos originales en precision completa.

## Capacidades

- Reconstruccion 3D a partir de una unica imagen de referencia (image-to-3D), generando mallas en formato GLB.
- Generacion de mallas 3D texturizadas en segundos, adecuada para prototipado rapido.
- Variante TripoSG con capacidades mejoradas de generacion 3D (segun la model card).
- Variante scribble: acepta un prompt textual junto a la imagen de referencia para guiar la generacion.
- Adaptador scribble nativo que convierte TripoSR en un modelo con condicionamiento textual.
- Edicion selectiva mediante mascaras: permite modificar regiones concretas del resultado 3D (por ejemplo, cambiar el color de los ojos de un objeto).
- Ejecucion local mediante el motor ggk con pesos GGUF cuantizados en NVFP4.
- No se documentan capacidades de texto, codigo, matematicas, vision general, tool calling ni agentes; el modelo esta especializado en 3D.

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: a partir de un concept art o una fotografia, el modelo genera una malla GLB texturizada en segundos, lo que permite iterar sobre disenos antes de pasar a modelado manual de alta calidad.
- Generacion de assets para realidad aumentada y comercio electronico: convertir fotografias de productos en modelos 3D visualizables en visores web o apps de AR, gracias a la licencia MIT y al bajo requisito de hardware.
- Edicion de modelos 3D existentes mediante mascaras: usar la variante con edit mask para recolorear o modificar partes concretas de una malla (por ejemplo, cambiar el color de los ojos de una figura) sin regenerar el objeto completo.
- Guiado por texto en la generacion 3D: con la variante scribble o el adaptador, introducir un prompt como "a green sheep" junto a la imagen para controlar atributos del resultado, util en herramientas creativas interactivas.
- Herramientas de escritorio para artistas 3D: integrar el motor ggk y los pesos NVFP4 en una aplicacion local que convierta bocetos o fotos en mallas, sin depender de servicios en la nube.
- Investigacion en reconstruccion 3D de una sola vista: servir como baseline reproducible y ligero (145 M de parametros) para comparar metodos de image-to-3D en entornos con GPUs de consumo.
- Pipelines de generacion masiva de assets: al ser un modelo pequeno y cuantizado, permite procesar lotes de imagenes en paralelo en una sola GPU para poblar catalogos 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 145,4 M de parametros en NVFP4 (4 bits), el peso de los pesos ronda los 0,07 GB, aunque el repo completo ocupa 3,4 GB (incluye multiples variantes y adaptadores). La VRAM real dependera del motor ggk y de las activaciones durante la inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. La cuantizacion NVFP4 esta orientada a GPUs NVIDIA con soporte de formatos de 4 bits (generaciones recientes), pero no se especifican modelos concretos.
- GPU de consumo: por el tamano del modelo (145 M de parametros), es plausible que quepa en GPUs de consumo, pero no se confirma en la informacion disponible.
- Opciones de despliegue: motor ggk (pig engine) mediante el comando `ggk -m <modelo>.gguf --ref-image <imagen> -o out.glb`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; la model card del TripoSR original menciona generacion en segundos, pero no se aportan cifras concretas para esta version GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| tripo-gguf (este) | 145,4 M | No aplica | Image-to-3D | MIT | GGUF (NVFP4) |
| stabilityai/TripoSR (base) | 145,4 M (aprox.) | No aplica | Image-to-3D | MIT | Safetensors/PyTorch |
| TripoSG | No disponible | No aplica | Image-to-3D | No disponible | No disponible |
| Alternativas image-to-3D (p. ej. TRELLIS, InstantMesh) | No disponible | No aplica | Image-to-3D | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta especializado en image-to-3D; no es un modelo de lenguaje y no debe esperarse de el generacion de texto, codigo ni razonamiento.
- La calidad de la malla generada depende de la imagen de referencia; no se documentan sesgos especificos, pero al derivar de un dataset de objetos 3D puede heredar sesgos de representacion de categorias y estilos.
- Riesgo de resultados imperfectos en geometrias complejas, objetos ocluidos o imagenes con fondos ruidosos; no se aportan metricas de fidelidad en la informacion disponible.
- La cuantizacion NVFP4 puede introducir perdida de precision frente a los pesos originales; no se documenta el impacto cuantitativo.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar las condiciones de los pesos originales de Stability AI y de cualquier dataset subyacente.
- El repo incluye multiples variantes y adaptadores (3,4 GB en total); es necesario seleccionar el archivo GGUF concreto para cada caso de uso.
- No se especifican idiomas soportados para los prompts de las variantes scribble; el comportamiento multilingue no esta garantizado.
- Dependencia del motor ggk (pig engine), menos extendido que otros runners; la integracion en produccion requiere evaluar su madurez y soporte.

## Enlaces

- Hugging Face: https://huggingface.co/gguf-org/tripo-gguf
- Modelo base: https://huggingface.co/stabilityai/TripoSR
- Motor ggk (pig engine): https://github.com/gguf-io/gk
- Pipeline de entrenamiento 3D: https://pypi.org/project/3d-trainer/
- Repositorio gguf-desktop (imagenes de ejemplo): https://github.com/gguf-org/gguf-desktop

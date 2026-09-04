# inclusionAI/LLaDA-Image-Turbo

## Resumen

LLaDA-Image-Turbo es un modelo de difusión de código abierto desarrollado por InclusionAI, diseñado para la generación y edición unificada de imágenes de alta calidad. Forma parte de la familia LLaDA-Image, que incluye un modelo Base de 50 pasos y este modelo Turbo destilado de 4 pasos, pensado para acelerar la inferencia sin sacrificar en exceso la fidelidad visual. Con 6.540 millones de parámetros (6,54B), el modelo unifica en un único checkpoint la generación text-to-image, la edición guiada por instrucciones y la generación condicionada por VQ, además de soportar renderizado de texto bilingüe en inglés y chino.

La relevancia de LLaDA-Image-Turbo radica en su enfoque de entrenamiento completamente abierto y en su arquitectura unificada: tanto el backbone como el generador de imágenes son modelos de difusión entrenados en un marco conjunto. El proceso de entrenamiento incluye un preentrenamiento solo con imágenes para establecer un prior visual, seguido de una fase de supervisión con lenguaje y un entrenamiento conjunto de generación-edición. La destilación mediante Twin-DMD permite obtener resultados en solo 2-4 pasos de muestreo, lo que lo convierte en una opción práctica para aplicaciones que requieren baja latencia. El modelo se distribuye a través de HuggingFace con pesos en formato safetensors y es compatible con la librería Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) unificado para generacion y edicion |
| Parametros totales | 6.540.230.016 (6,54B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8 |
| Idiomas soportados | Ingles (en), Chino (zh) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compatible con Diffusers) |

## Arquitectura y entrenamiento

LLaDA-Image-Turbo emplea una arquitectura de Diffusion Transformer (DiT) unificada en la que tanto el backbone como el generador de imágenes son modelos de difusión. Esta decisión de diseño permite que un único checkpoint maneje tanto la generación text-to-image como la edición de imágenes basada en instrucciones, sin necesidad de un módulo de edición separado. El entrenamiento sigue una estrategia por fases: primero un preentrenamiento exclusivamente con imágenes para aprender el prior visual, después una fase intermedia de entrenamiento y finalmente una etapa de supervisión con parejas lenguaje-imagen y entrenamiento conjunto de generación y edición.

La variante Turbo se obtiene mediante destilación Twin-DMD, una técnica que comprime el proceso de muestreo del modelo Base (50 pasos) a solo 4 pasos, manteniendo una calidad visual competitiva. El modelo soporta además generación condicionada por VQ y renderizado de texto bilingüe en inglés y chino. El código de inferencia está disponible en el repositorio oficial de GitHub y los checkpoints se ofrecen en precisión BF16 y FP8.

## Capacidades

- Generacion text-to-image de alta calidad, incluidos retratos fotorrealistas, posters, anuncios y escenas coherentes.
- Edicion de imagenes guiada por instrucciones, preservando el contenido de referencia y aplicando cambios visuales precisos.
- Generacion condicionada por VQ para escenarios de control adicional.
- Renderizado de texto bilingüe en ingles y chino, con buena legibilidad tipografica.
- Inferencia rapida gracias a la destilacion Twin-DMD: solo 4 pasos de muestreo.
- Compatibilidad con el pipeline `LLaDAImagePipeline` de Diffusers, lo que facilita la integracion en flujos de trabajo existentes.

## Casos de uso

- Diseno grafico y publicidad: el modelo puede generar posters y anuncios con tipografia bilingüe, lo que resulta util para campanas en mercados de habla inglesa y china. Su capacidad de renderizado de texto integrado reduce la necesidad de post-procesado.
- Edicion creativa de imagenes: gracias a la edicion guiada por instrucciones, permite a los disenadores modificar imagenes de referencia con comandos en lenguaje natural, acelerando iteraciones en flujos de trabajo de retoque fotografico.
- Generacion de contenido para redes sociales: con solo 4 pasos de muestreo, es adecuado para generar imagenes de forma rapida en aplicaciones de creacion de contenido en tiempo real o en entornos con recursos limitados.
- Prototipado de productos visuales: la generacion condicionada por VQ y la alta velocidad de inferencia permiten explorar rapidamente conceptos visuales antes de invertir en producciones de mayor coste.
- Aplicaciones de edicion en masa: al unificar generacion y edicion en un solo modelo, se reduce la complejidad de pipelines que antes requerian dos modelos separados, simplificando el despliegue y el mantenimiento.
- Investigacion en modelos de difusion: al ser un modelo totalmente abierto (pesos y codigo de inferencia), sirve como base para experimentos de destilacion, entrenamiento conjunto y evaluacion de tecnicas de generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para LLaDA-Image-Turbo. Los datos disponibles corresponden al modelo Base de la familia, LLaDA-Image, que alcanza resultados de referencia en Qwen-Image-Bench. Se presentan a continuacion como referencia orientativa, pero no deben atribuirse al Turbo:

| Benchmark | Modelo | Resultado |
|---|---|---|
| Qwen-Image-Bench (ingles) | LLaDA-Image (Base) | 53.53 |
| Qwen-Image-Bench (chino) | LLaDA-Image (Base) | 53.38 |

## Requisitos de hardware

- VRAM estimada para inferencia: no se han publicado cifras oficiales. Realizando un calculo orientativo, con 6,54B parametros en BF16 el checkpoint ocupa aproximadamente 13 GB, por lo que se necesitaria una GPU con al menos 16-24 GB de VRAM para inferencia sin cuantizacion adicional. En FP8, el peso ocuparia alrededor de 6,5 GB, lo que permitiria ejecutarlo en GPUs con 12-16 GB de VRAM.
- GPU recomendadas: no disponible. Se puede inferir que GPUs de gama alta como NVIDIA A100, H100 o RTX 4090 serian adecuadas, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: probablemente si con cuantizacion FP8 y resoluciones moderadas, aunque no hay datos oficiales.
- Opciones de despliegue: Diffusers (via `LLaDAImagePipeline`), con soporte para precision BF16 y FP8. Tambien puede integrarse en pipelines de inferencia personalizados basados en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dentro de la familia LLaDA-Image, el modelo Turbo se diferencia del Base principalmente por el numero de pasos de muestreo y la velocidad de inferencia:

| Modelo | Parametros | Pasos de muestreo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaDA-Image (Base) | 6,54B | 50 | BF16, FP8 | No disponible | HuggingFace |
| LLaDA-Image-Turbo | 6,54B | 4 | BF16, FP8 | No disponible | HuggingFace |

No se dispone de informacion sobre modelos comparables de otros desarrolladores en los datos proporcionados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede utilizarse con fines comerciales. Es necesario contactar con InclusionAI o revisar el repositorio oficial antes de usarlo en produccion.
- Soporte de idiomas limitado: el modelo solo admite prompts en ingles y chino, lo que restringe su uso en otros idiomas.
- Al ser un modelo destilado, LLaDA-Image-Turbo puede sacrificar cierta calidad de imagen y fidelidad frente al modelo Base, especialmente en detalles finos o escenas complejas.
- Riesgo de alucinacion visual: como cualquier modelo de generacion de imagenes, puede producir artefactos, texto ilegible o incoherencias en escenas complejas, especialmente cuando se solicitan textos largos o estructuras especificas.
- No se ha publicado el codigo de entrenamiento, solo el de inferencia, lo que limita la reproducibilidad completa del proceso de destilacion.
- No hay datos de benchmarks especificos del Turbo, por lo que su rendimiento relativo frente al Base en metricas objetivas no esta cuantificado.

## Enlaces

- HuggingFace (modelo Turbo): https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- HuggingFace (modelo Base): https://huggingface.co/inclusionAI/LLaDA-Image
- HuggingFace (modelo Turbo FP8): https://huggingface.co/inclusionAI/LLaDA-Image-Turbo-FP8
- Repositorio GitHub: https://github.com/inclusionAI/LLaDA-Image
- Paper en arXiv: https://arxiv.org/pdf/2609.03796
- Coleccion LLaDA2.0 en HuggingFace: https://huggingface.co/collections/inclusionAI/llada20
- Anuncio oficial en X: https://x.com/TheInclusionAI/status/2095696902004293744

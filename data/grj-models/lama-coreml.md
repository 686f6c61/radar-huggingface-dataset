# grj-models/lama-coreml

## Resumen

LaMa (Large Mask Inpainting) es un modelo de inpainting de imagenes disenado especificamente para eliminar objetos y rellenar grandes regiones faltantes de forma coherente. Esta ficha corresponde a `grj-models/lama-coreml`, un espejo del modelo original de Samsung AI Center convertido al formato Core ML por john-rocky, lo que permite ejecutarlo de forma nativa en el ecosistema Apple (macOS, iOS, iPadOS) sin depender de frameworks de Python.

El modelo resuelve el problema del borrado de objetos en imagenes: dado un par de imagen y mascara binaria, reconstruye la region enmascarada generando contenido visualmente plausible. Su innovacion principal, descrita en el paper *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (arXiv:2109.07161), es el uso de convoluciones de Fourier que le permiten captar contexto global incluso con mascaras grandes, superando a arquitecturas puramente convolucionales en esa tarea.

Este repositorio concreto es un artefacto de despliegue, no un modelo entrenado desde cero: no incluye pesos en safetensors ni informacion sobre el proceso de entrenamiento mas alla de la referencia al trabajo original. Su relevancia radica en la portabilidad a Core ML con una interfaz fija de 800x800 pixeles, util para integrar inpainting en aplicaciones nativas de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red generativa de inpainting con convoluciones de Fourier (LaMa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 800x800) |
| Tipos de cuantizacion | no disponible (pesos en formato Core ML, probablemente FP16) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodel`) |
| Entrada | `image` (800x800 BGRA) y `mask` (800x800 escala de grises, blanco = zona a rellenar) |
| Salida | `output` (800x800 imagen) |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

LaMa emplea una arquitectura generativa basada en convoluciones de Fourier (Fast Fourier Convolutions), que operan en el dominio de la frecuencia para propagar informacion a lo largo de toda la imagen. Esto le permite manejar mascaras de gran tamano sin perder coherencia estructural, un punto debil de las redes convolucionales tradicionales. El modelo original fue entrenado por Samsung AI Center y publicado junto al paper arXiv:2109.07161.

Este repositorio no aporta informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes procesadas, ni sobre el uso de tecnicas de alineacion como RLHF o DPO (no aplicables a un modelo de vision de este tipo). La conversion a Core ML fue realizada por john-rocky y replica la interfaz original de inferencia: imagen y mascara de 800x800 pixeles. No se documentan innovaciones adicionales mas alla de las descritas en el paper original.

## Capacidades

- Inpainting de imagenes: rellena regiones enmascaradas con contenido visualmente coherente.
- Eliminacion de objetos: borra elementos no deseados sustituyendolos por fondo generado.
- Manejo de mascaras grandes gracias a las convoluciones de Fourier.
- Inferencia nativa en dispositivos Apple mediante Core ML.
- Entrada y salida de resolucion fija 800x800 pixeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No incluye modo thinking, vision adicional, audio ni procesamiento de texto.

## Casos de uso

- Eliminacion de objetos en fotografia de consumo: una app de edicion en iOS puede recibir una imagen y una mascara dibujada por el usuario, y el modelo rellena la zona borrada de forma nativa sin salir del dispositivo.
- Limpieza de marcas de agua o logotipos en material propio: util para preparar imagenes antes de publicarlas, siempre que se respeten los derechos de terceros.
- Restauracion de fotografias con zonas danadas: rellenar rasgunos, manchas o regiones perdidas en escaneos antiguos.
- Preprocesado en pipelines de vision por computador: eliminar distracciones o elementos privados (caras, matriculas) antes de alimentar otros modelos.
- Edicion asistida en apps de escritorio para macOS: integracion via Core ML en herramientas de retoque fotografico sin dependencia de servidores.
- Prototipado rapido en entornos Apple: validar flujos de inpainting en dispositivos antes de migrar a soluciones en la nube o a otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML, se ejecuta sobre CPU, GPU o Neural Engine del dispositivo Apple.
- GPU recomendadas: no aplica en el sentido tradicional; se beneficia del Neural Engine y GPU integrada de chips Apple Silicon (M1 en adelante) y de los SoC A-series recientes en iPhone/iPad.
- Cabe en hardware de consumo Apple: si, al estar empaquetado como Core ML para ejecucion local.
- Opciones de despliegue: Core ML (Core ML Tools, Vision framework, Xcode); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LaMa (este repo, Core ML) | Inpainting | 800x800 fija | Core ML | Apache-2.0 | Conversion para Apple |
| LaMa original (advimman/lama) | Inpainting | Flexible | PyTorch | Apache-2.0 | Implementacion de referencia de Samsung AI |
| LaMa-CoreML (mlboydaisuke) | Inpainting | 800x800 fija | Core ML | Apache-2.0 | Conversion original de la que deriva este espejo |
| Alternativas tipo Stable Diffusion inpainting | Inpainting generativo | Variable | safetensors / diffusers | Variable | Mayor coste computacional, mayor flexibilidad creativa |

## Limitaciones y advertencias

- No hay informacion sobre sesgos del modelo; al ser un modelo de imagen, los sesgos se manifestarian en el contenido generado (texturas, rostros, escenas).
- Riesgo de alucinacion visual: puede generar contenido plausible pero incorrecto en la zona enmascarada, especialmente con mascaras muy grandes o texturas complejas.
- Resolucion fija de 800x800: las imagenes deben redimensionarse, lo que puede degradar detalles.
- No procesa lenguaje ni texto; no es un modelo multimodal.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original y atribuir correctamente a los autores de LaMa.
- Este repositorio es un espejo de una conversion de terceros; no hay garantias de mantenimiento, soporte ni actualizaciones.
- Sin datos publicados de rendimiento ni evaluacion cuantitativa en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/grj-models/lama-coreml
- Conversion original Core ML: https://huggingface.co/mlboydaisuke/LaMa-CoreML
- Repositorio original de LaMa: https://github.com/advimman/lama
- Paper: https://arxiv.org/abs/2109.07161

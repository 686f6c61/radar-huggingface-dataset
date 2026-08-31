# LocalMuseAI/coreml-realism-by-stable-yogi-v5-xl-lightning-6bit

## Resumen

Este repositorio contiene una conversión a Core ML del checkpoint `V5_XL_Lightning` del modelo de difusión "Realism By Stable Yogi", preparada específicamente para su uso en la aplicación LocalMuse en dispositivos iOS. El modelo original es un checkpoint de Stable Diffusion XL (SDXL) orientado a la generación de imágenes fotorrealistas, y esta conversión lo adapta al formato Core ML con cuantización de 6 bits en el UNet y 8 bits en el segundo text encoder, reduciendo el tamaño y optimizando la inferencia en hardware Apple.

La relevancia de esta conversión radica en que permite ejecutar un modelo de difusión de alta calidad en dispositivos móviles con iOS 17 o superior, sin necesidad de conexión a servidores externos. El perfil "Lightning" del checkpoint original reduce el número de pasos de inferencia a 6-7, lo que acelera la generación en hardware limitado. El repositorio no incluye el checkpoint original, sino únicamente los artefactos Core ML compilados, junto con un archivo `PROVENANCE.json` que documenta la identidad de la fuente y las comprobaciones numéricas realizadas.

La licencia es CreativeML Open RAIL++-M, que permite uso comercial con restricciones. El modelo está pensado para desarrolladores que integran generación de imágenes en aplicaciones iOS y necesitan una versión optimizada y autocontenida de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + dos text encoders) convertido a Core ML |
| Parametros totales | no disponible (el checkpoint original de SDXL tiene ~3.5B, pero no se confirma en esta conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de texto) |
| Tipos de cuantizacion | UNet: 6-bit k-means palettization; Text encoder 1: FP16; Text encoder 2: 8-bit k-means; VAE: precision nativa |
| Idiomas soportados | no disponibles (el modelo genera imagenes, no texto) |
| Licencia | CreativeML Open RAIL++-M |
| Formato de pesos | Core ML compilado (chunks .mlmodel) |

## Arquitectura y entrenamiento

El modelo es una conversión a Core ML del checkpoint `V5_XL_Lightning` de "Realism By Stable Yogi", un modelo de difusión latente basado en Stable Diffusion XL. La arquitectura original de SDXL incluye un UNet con aproximadamente 2.6 mil millones de parámetros, un VAE y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). Esta conversión no modifica la arquitectura subyacente, sino que la transforma al formato Core ML con cuantización específica: el UNet se paletiza con k-means a 6 bits y se divide en dos chunks compilados, el segundo text encoder se cuantiza a 8 bits, mientras que el primer text encoder y el VAE mantienen precisión FP16 y nativa respectivamente.

El perfil de inferencia recomendado por el creador del checkpoint original (Stable Yogi) se mantiene en esta conversión: resolución 1024×1024, sampler Euler ancestral, schedule sigma A1111, 7 pasos por defecto (rango 6-7) y CFG de 1.5 (rango 1-1.5). No se incluyen las inversiones textuales opcionales del creador; en su lugar se usa un prompt negativo simple para que el modelo sea autocontenido. No hay información sobre el entrenamiento del checkpoint original en esta página, ya que se trata de una conversión de un modelo preexistente.

## Capacidades

- Generacion de imagenes fotorrealistas a 1024×1024 píxeles, orientadas a retratos, escenas y estilos variados.
- Inferencia acelerada gracias al perfil Lightning: 6-7 pasos con sampler Euler ancestral.
- Ejecucion local en dispositivos iOS 17 o superior mediante Core ML, sin conexion a servidores.
- Cuantizacion mixta (6-bit UNet, 8-bit text encoder 2) que reduce el uso de memoria y mejora la velocidad en hardware Apple.
- Soporte para clasificador-free guidance (CFG) con batch de 2, configurado por defecto.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Aplicaciones iOS de edicion fotografica: integrar el modelo como motor de generacion de imagenes fotorrealistas para que los usuarios creen o modifiquen fotos directamente en el dispositivo, aprovechando la cuantizacion 6-bit para un rendimiento fluido en iPhone y iPad.
- Prototipado rapido de arte conceptual: disenadores y artistas pueden usar la app LocalMuse en un iPad para generar variaciones de conceptos visuales sin depender de GPUs de escritorio, gracias a los 7 pasos de inferencia y el CFG bajo.
- Generacion de avatares personalizados: el modelo puede crear retratos realistas a partir de prompts descriptivos, adecuado para aplicaciones de redes sociales o juegos que necesiten avatares unicos generados localmente.
- Asistente creativo en apps de diseno: integrar el modelo como herramienta de inspiracion visual dentro de aplicaciones de diseno grafico, permitiendo a los usuarios generar imagenes de referencia sin salir de la app.
- Educacion y demostraciones de IA en movil: usar el modelo en talleres o demos para ensenar conceptos de difusion y cuantizacion en dispositivos Apple, gracias a su naturaleza autocontenida y su documentacion de proveniencia.
- Desarrollo de aplicaciones de fotografia con privacidad: al ejecutarse localmente, el modelo permite generar imagenes sin enviar datos a servidores externos, lo que es relevante para casos de uso con requisitos estrictos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otras conversiones Core ML. El unico dato de rendimiento indirecto es el perfil Lightning (6-7 pasos) y la cuantizacion 6-bit, que sugieren una inferencia rapida en dispositivos Apple, pero no hay numeros concretos.

## Requisitos de hardware

- Dispositivos Apple con iOS 17 o superior (iPhone, iPad, Mac con chip Apple Silicon).
- Se requiere el runtime Core ML con soporte para `SPLIT_EINSUM` y operaciones de paletizacion k-means.
- No se especifica VRAM, ya que Core ML gestiona la memoria de forma unificada en dispositivos Apple; el tamano del repositorio es de 3.3 GB, que se carga en memoria durante la inferencia.
- No es compatible con GPUs de escritorio (NVIDIA, AMD) ni con Linux/Windows; es exclusivo para el ecosistema Apple.
- Opciones de despliegue: integracion directa en apps iOS mediante Core ML, o mediante la aplicacion LocalMuse (no se mencionan otros runtimes como vLLM u Ollama).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar esta conversion con otras alternativas de la misma categoria. Existen otras conversiones Core ML de checkpoints SDXL en el perfil de LocalMuseAI (por ejemplo, `coreml-realvisxl-v5-lightning-6bit`), pero no se proporcionan datos de rendimiento ni calidad. El checkpoint original "Realism By Stable Yogi V5 XL Lightning" esta disponible en Civitai para su uso en entornos de escritorio con difusores tradicionales, pero no hay una comparacion directa con esta version Core ML.

## Limitaciones y advertencias

- La cuantizacion a 6 bits en el UNet puede degradar ligeramente la calidad de la imagen en comparacion con el checkpoint original en FP16, especialmente en detalles finos o texturas complejas.
- No se incluyen las inversiones textuales opcionales del creador (Stable Yogi), por lo que el modelo puede no reproducir exactamente los mismos resultados que el checkpoint original con esos prompts especiales.
- El modelo esta limitado a la generacion de imagenes; no soporta tareas de texto, vision multimodal ni interaccion conversacional.
- La licencia CreativeML Open RAIL++-M permite uso comercial, pero impone restricciones sobre usos malintencionados (generacion de contenido ilegal, difamatorio, etc.). Es responsabilidad del desarrollador cumplir con los terminos.
- Requiere iOS 17 o superior, lo que excluye dispositivos Apple mas antiguos.
- El repositorio no incluye el checkpoint original, solo la conversion Core ML; para auditar el modelo es necesario consultar la fuente en Civitai.
- No hay informacion sobre sesgos del modelo, pero al ser un modelo de difusion entrenado con datos de internet, puede reflejar sesgos presentes en esos datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LocalMuseAI/coreml-realism-by-stable-yogi-v5-xl-lightning-6bit
- Perfil de LocalMuseAI en HuggingFace: https://huggingface.co/LocalMuseAI/models
- Checkpoint original en Civitai: https://civitai.com/models/166609?modelVersionId=1075465
- Conversion similar de LocalMuseAI (RealVisXL V5 Lightning): https://huggingface.co/LocalMuseAI/coreml-realvisxl-v5-lightning-6bit

# aidsoid/translategemma-4b-it-4bit_immersive-translate

## Resumen

`aidsoid/translategemma-4b-it-4bit_immersive-translate` es una versión cuantizada a 4 bits del modelo de traducción `google/translategemma-4b-it`, adaptada específicamente para funcionar con la extensión de navegador Immersive Translate a través de un servidor local compatible con la API de OpenAI. El autor, `aidsoid`, lo publica como un espejo del repositorio `mlx-community/translategemma-4b-it-4bit_immersive-translate`, con el objetivo de garantizar su disponibilidad para la aplicación Awnsy.

El modelo base, TranslateGemma 4B, pertenece a la familia TranslateGemma de Google, construida sobre Gemma 3, y está diseñado para traducción multilingüe de alta calidad en 55 idiomas, con capacidades multimodales (texto e imagen). Esta versión concreta modifica la configuración de generación (tokens de fin de secuencia) y la plantilla de chat para que el modelo responda correctamente a las solicitudes de Immersive Translate, que envía instrucciones en formato de texto plano con marcadores `<<<source>>>`, `<<<target>>>` y `<<<text>>>`.

Con 606,6 millones de parámetros y un tamaño de repositorio de 2,2 GB, el modelo está optimizado para ejecutarse en Apple Silicon mediante la librería MLX, lo que lo convierte en una opción ligera y eficiente para traducción local sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3) |
| Parametros totales | 606.601.728 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | 55 (segun documentacion del modelo base) |
| Licencia | Gemma (sujeta a los Terminos de uso de Gemma) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `google/translategemma-4b-it` es un transformer de la familia Gemma 3, entrenado por Google para traduccion multilingue y multimodal. Segun la documentacion oficial, el entrenamiento cubre 55 idiomas y combina tareas de texto a texto con extraccion y traduccion de texto en imagenes. La version 4B es la mas ligera de la familia TranslateGemma, que tambien incluye variantes de 12B y 27B.

Esta version especifica no modifica los pesos del modelo original, sino que aplica una cuantizacion a 4 bits mediante MLX y ajusta dos elementos de configuracion:

- `eos_token_id` se establece en `[106, 1]`, permitiendo que la generacion termine tanto con el token de fin de turno de Gemma como con el token `<eos>`, evitando truncamientos o generaciones interminables al usar APIs compatibles con OpenAI.
- La plantilla de chat (`chat_template.jinja`) se reformatea para interpretar mensajes de usuario en formato `<<<source>>>...<<<target>>>...<<<text>>>...` y convertirlos en la instruccion de "traductor profesional" que espera TranslateGemma. Tambien mantiene compatibilidad con el formato oficial de lista de diccionarios (`source_lang_code`, `target_lang_code`, `text`).

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO para el modelo base.

## Capacidades

- Traduccion multilingue entre 55 idiomas, cubriendo pares de lenguas con calidad comparable a modelos mucho mayores.
- Traduccion de texto a texto, con soporte para instrucciones en lenguaje natural que especifican idioma de origen, idioma de destino y contenido.
- Extraccion y traduccion de texto en imagenes (capacidad multimodal del modelo base, aunque esta version cuantizada puede no incluir el procesamiento de vision en la practica).
- Compatibilidad con la API de OpenAI a traves del servidor `mlx_lm.server`, lo que permite integrarlo en aplicaciones que usen el protocolo de chat completions.
- Adaptacion especifica para Immersive Translate, con una plantilla de chat que reconoce los marcadores de la extension.
- Generacion de texto conversacional, aunque su uso principal es traduccion.

## Casos de uso

- Traduccion integrada en navegador con Immersive Translate: el modelo se ejecuta localmente en Apple Silicon y recibe las solicitudes de la extension a traves de un servidor OpenAI-compatible en `localhost:8080`. La plantilla de chat adaptada garantiza que las instrucciones con marcadores se interpreten correctamente, ofreciendo traducciones instantaneas de paginas web sin enviar datos a servidores externos.
- Servidor de traduccion local para aplicaciones de escritorio: cualquier aplicacion que soporte la API de OpenAI puede apuntar a `http://localhost:8080/v1/chat/completions` y usar el modelo como motor de traduccion, con latencia reducida al ejecutarse en el mismo equipo.
- Traduccion de documentos y articulos largos: gracias a su capacidad para manejar instrucciones estructuradas, puede traducir bloques de texto extensos manteniendo el contexto, util en herramientas de procesamiento de texto o pipelines de localizacion.
- Asistente de traduccion en entornos de desarrollo: integrable en editores de codigo o herramientas CLI mediante scripts Python que usan `mlx_lm`, permitiendo traducir cadenas de interfaz, comentarios o documentacion tecnica.
- Traduccion de contenido generado por usuarios en foros o redes sociales: al ser un modelo ligero, puede desplegarse en multiples instancias para moderar o traducir contenido en tiempo real sin costes de API.
- Prototipado de aplicaciones de traduccion en macOS: desarrolladores pueden experimentar con el modelo en local antes de migrar a versiones mas grandes (12B o 27B) si necesitan mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada a 4 bits. La documentacion del modelo base indica que TranslateGemma 12B supera al Gemma 3 27B en tareas de traduccion, y que la familia completa se evaluo en los conjuntos WMT24++ y Vistra, pero no se proporcionan cifras concretas en la informacion disponible. Tampoco hay datos de rendimiento (latencia, throughput) para esta adaptacion.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B requiere aproximadamente 8,6 GB de VRAM segun LLM Explorer; la version cuantizada a 4 bits probablemente necesite menos, aunque no se especifica un valor exacto.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3 o superiores), ya que MLX esta optimizado para los chips de Apple. No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: servidor OpenAI-compatible mediante `mlx_lm.server`, o uso directo en Python con `mlx_lm.load` y `mlx_lm.generate`.
- Latencia y throughput: no disponibles. Al ser un modelo de 4 bits en hardware Apple, se espera una inferencia rapida para traducciones de frases cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TranslateGemma 4B (base) | 4B | no disponible | 55 | Gemma | safetensors |
| TranslateGemma 12B | 12B | no disponible | 55 | Gemma | safetensors |
| NLLB-200 (Meta) | 600M - 54B | no disponible | 200 | CC-BY-NC | safetensors |
| M2M100 (Meta) | 418M - 12B | no disponible | 100 | MIT | safetensors |

La comparativa se basa en datos publicos de los modelos base. Esta version cuantizada a 4 bits es mas ligera que las alternativas de Meta, pero su ventaja principal es la integracion con Immersive Translate y la ejecucion local en Apple Silicon. No se dispone de comparaciones de rendimiento directas entre estos modelos.

## Limitaciones y advertencias

- Licencia Gemma: el uso esta sujeto a los Terminos de uso de Gemma de Google, que requieren aceptacion explicita y pueden imponer restricciones para uso comercial. Es necesario revisar los terminos antes de desplegar el modelo en produccion.
- Cuantizacion a 4 bits: puede provocar una ligera perdida de calidad en traducciones complejas o con vocabulario tecnico en comparacion con el modelo original en precision completa.
- Dependencia de Apple Silicon: el formato MLX no es compatible con GPUs de otros fabricantes, limitando su despliegue a hardware Apple.
- Sin soporte de vision en esta version: aunque el modelo base es multimodal, la cuantizacion y la configuracion especifica no garantizan el procesamiento de imagenes; se recomienda usar el modelo original para tareas de vision.
- Riesgo de alucinacion en traducciones ambiguas: como cualquier modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido cuando el texto de origen es poco claro o contiene errores.
- No se han documentado sesgos especificos, pero los modelos de traduccion pueden reflejar sesgos de genero o culturales presentes en los datos de entrenamiento.
- El repositorio es un espejo no oficial: aunque se basa en el trabajo de mlx-community, no esta mantenido por Google ni por el equipo original de TranslateGemma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aidsoid/translategemma-4b-it-4bit_immersive-translate
- Repositorio original de mlx-community: https://huggingface.co/mlx-community/translategemma-4b-it-4bit_immersive-translate
- Modelo base de Google: https://huggingface.co/google/translategemma-4b-it
- Blog de Google sobre TranslateGemma: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Guia completa de TranslateGemma (aicybr): https://aicybr.com/blog/translategemma-guide
- Pagina en SourceForge: https://sourceforge.net/projects/translategemma-4b-it/

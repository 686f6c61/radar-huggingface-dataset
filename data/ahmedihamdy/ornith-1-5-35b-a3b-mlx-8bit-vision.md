# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision

## Resumen

Ornith-1.5-35B-A3B-MLX-8bit-vision es una compilacion comunitaria del modelo multimodal Ornith-1.5-35B-A3B de ornith-ai, publicada por el usuario ahmedihamdy. El modelo base es un transformer de mezcla de expertos (MoE) de 35.107.180.016 parametros totales, del cual se activan 8 de sus 256 expertos (aproximadamente 3B parametros) por token. Esta version concreta anade la torre de vision original del modelo base (27 bloques, 447M parametros en bf16) a los pesos de texto cuantizados a 8 bits en formato MLX, pensada para ejecutarse en Apple Silicon.

La relevancia de esta ficha radica en que es un ejemplo de empaquetado de un modelo MoE multimodal para inferencia local en Mac, con verificacion criptografica de que la torre de vision y los pesos de texto pertenecen al mismo entrenamiento. El autor documenta el proceso de construccion mediante la CLI de Astronomical y publica hashes SHA-256 de cada archivo de pesos.

Se distribuye bajo licencia MIT, con el repositorio ocupando 37,7 GB y el modelo requiriendo 37,74 GB de memoria en disco. La model card esta en ingles y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con torre de vision; familia qwen3_5_moe |
| Parametros totales | 35.107.180.016 |
| Parametros activos | Aproximadamente 3B (8 de 256 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (expertos y routers); torre de vision en bf16; existe variante de 6 bits del mismo autor |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `model-vision.safetensors` separado y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos, de los cuales se activan 8 por token, lo que resulta en unos 3B parametros activos sobre un total de 35B. La torre de vision consta de 27 bloques con 447M parametros y se mantiene a precision completa bf16, mientras que los pesos de texto y los routers se conservan en la cuantizacion de 8 bits original de Ornith, sin recuantizar. Los pesos de texto se distribuyen en siete shards sin modificar respecto al modelo base, y la torre de vision ocupa un archivo independiente (`model-vision.safetensors`) para preservar la integridad de los shards originales y permitir su verificacion por hash.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card indica que el emparejamiento entre torre de vision y pesos de texto fue verificado: 24 de 24 tensores de texto muestreados coinciden con el modelo base, y el ancho de la torre y el numero de tokens de imagen son compatibles. El autor documenta los commits de origen y los hashes SHA-256 de cada archivo en `astronomical-build.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Comprension de imagenes (image-text-to-text): descripcion de contenido visual, lectura de texto en capturas de pantalla, identificacion de colores y formas.
- Razonamiento y generacion de codigo, segun la orientacion del modelo base y el ejemplo de agente de programacion incluido en la model card.
- Soporte de agentes: la model card muestra el lanzamiento de un agente de codigo (`astronomical launch claude`) sobre este modelo.
- Compatibilidad con APIs locales estilo OpenAI y Anthropic, lo que permite integrarlo en clientes existentes.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se documentan modos de pensamiento explicito, audio ni otras modalidades adicionales.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo gestiona dialogos multi-turno en ingles ejecutandose integramente en el dispositivo, sin que los datos salgan del equipo, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Analisis de capturas de pantalla y documentos escaneados: la torre de vision permite leer texto en imagenes (como demuestra la model card con una captura de la app Astronomical) y describir su contenido.
- Agente de programacion en local: mediante la CLI de Astronomical se puede lanzar un agente de codigo sobre el modelo, util para tareas de desarrollo sin conexion.
- Descripcion y catalogacion de imagenes: identificacion de objetos, colores y formas en fotos, aplicable a flujos de etiquetado o accesibilidad.
- Integracion en herramientas compatibles con las APIs de OpenAI o Anthropic: cualquier cliente que hable estos protocolos puede apuntar al servidor local del modelo.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como banco de pruebas para desarrolladores que quieran validar pipelines de vision-lenguaje en MLX antes de escalar a infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: la existencia de variantes de 6 y 8 bits permite comparar calidad y consumo de memoria en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de inferencia local: en mlx-vlm 0.7.12 sobre un Mac con Apple Silicon, el modelo alcanzo un pico de 39,07 GB de memoria y genero entre 53 y 60 tokens por segundo.

## Requisitos de hardware

- Memoria en disco: 37,74 GB (descarga de aproximadamente 35,1 GB en la app Astronomical).
- Memoria unificada: pico medido de 39,07 GB en Apple Silicon durante la inferencia con mlx-vlm.
- Hardware objetivo: Macs con Apple Silicon y macOS 14 o posterior; no se documenta soporte para GPU NVIDIA.
- No cabe en configuraciones de memoria unificada inferiores a unos 40 GB; requiere equipos con 48 GB o mas para dejar margen al sistema.
- Despliegue: libreria MLX y mlx-vlm 0.7.12; app Astronomical (descarga, verificacion de archivos y ejecucion); CLI `astronomical` para descarga, inferencia con imagen y lanzamiento de agentes; servidor local compatible con las APIs de OpenAI y Anthropic.
- Rendimiento: 53-60 tokens por segundo segun la medicion del autor; no se dispone de datos de latencia de prefill ni de throughput en lote.
- Variante de 6 bits: aproximadamente 9 GB mas ligera, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-8bit-vision (este) | 35B totales, ~3B activos | no disponible | MIT | Hugging Face, MLX, app Astronomical | Vision en bf16, texto en 8 bits, verificado por hash |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit | 35B totales, ~3B activos | no disponible | MIT | Hugging Face | Version sin torre de vision |
| ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision | 35B totales, ~3B activos | no disponible | MIT | Hugging Face | Variante de 6 bits, unos 9 GB mas ligera |
| ornith-ai/Ornith-1.5-35B-A3B | 35B totales, ~3B activos | no disponible | MIT | Hugging Face | Modelo base original con torre de vision |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es una compilacion comunitaria, no una version oficial de ornith-ai; el soporte y la responsabilidad sobre el empaquetado recaen en el autor de la compilacion.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- La longitud de contexto no esta especificada, lo que impide planificar cargas con documentos largos sin verificacion previa.
- El consumo de memoria (pico de 39,07 GB) limita su uso a equipos con memoria unificada amplia; en Macs de 32 GB o menos no es viable.
- La licencia MIT permite uso comercial, pero se recomienda revisar los terminos del repositorio original de ornith-ai para confirmar condiciones adicionales.
- La torre de vision solo es valida con los pesos de texto del mismo entrenamiento; no debe intercambiarse con otras variantes sin verificacion.
- No se documentan resultados de benchmarks que permitan comparar su calidad frente a alternativas de tamano similar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision
- Variante de 6 bits: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision
- Modelo base cuantizado (sin vision): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit
- Modelo base original con vision: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- App Astronomical: https://getastronomical.com/
- Documentacion de la API local de Astronomical: https://getastronomical.com/local-api.html

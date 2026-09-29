# RunningHubAI/rh-fullshot-zit-lora-v1-lora

## Resumen

rh-fullshot-zit-lora-v1-lora es un adaptador LoRA de texto a imagen publicado por RunningHub (cuenta RunningHubAI) a partir de un trabajo del usuario @Meowooda. No es un modelo completo: se trata de un ajuste fino de bajo rango que se aplica sobre un modelo base de difusion, en concreto Z-image Turbo, y cuyo objetivo declarado es mejorar las proporciones corporales femeninas en planos de cuerpo entero ("full-body").

El repositorio de HuggingFace contiene un unico fichero de pesos, `fullshot_ZIT_Lora_V1_000002000.safetensors`, de 162 MiB, lo que lo convierte en un artefacto muy ligero y facil de integrar en flujos de trabajo existentes. La model card recomienda aplicarlo con una fuerza de 0.7 a 1.0 y usar la palabra de activacion `fullshot` en el prompt, ademas de combinarlo preferentemente con la variante FP8 del modelo base Z-image Turbo.

Su relevancia practica es acotada pero clara: cubre un caso muy demandado en generacion de imagenes comerciales (fotografia de moda, lookbooks, ilustracion de personajes a cuerpo entero) donde los modelos base suelen fallar en la coherencia anatomica y el encuadre. El modelo se distribuye sin resultados de benchmarks, sin licencia explicitamente declarada, sin idiomas documentados y con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto sin validacion publica por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion (modelo base: Z-image Turbo). Arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible (fichero LoRA de 162 MiB; el numero de parametros del adaptador no se documenta) |
| Longitud de contexto | No disponible (modelo de difusion; no se especifica longitud de prompt) |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye un fichero `.safetensors`; la model card recomienda el modelo base en FP8 |
| Idiomas soportados | No disponible (la model card no lo indica; la unica palabra de activacion documentada, `fullshot`, esta en ingles) |
| Licencia | No disponible. La model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador mas alla de su naturaleza LoRA (Low-Rank Adaptation) aplicada a un modelo de difusion de texto a imagen. El modelo base declarado es Z-image Turbo, del que la model card no aporta detalles tecnicos: ni el tipo de backbone (transformer de difusion, U-Net u otro), ni el numero de parametros, ni la resolucion nativa de entrenamiento. Tampoco se documenta si el LoRA afecta a los bloques de atencion cruzada, a las proyecciones de las capas de atencion o a los bloques de proyeccion temporal, ni su rango y su factor alfa.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo se ha ajustado desde Z-image Turbo y que se ha entrenado en la plataforma RunningHub, que ofrece servicios de entrenamiento de modelos. No se especifica el numero de imagenes, la composicion del dataset, la resolucion de entrenamiento, el numero de pasos, la tasa de aprendizaje, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables habitualmente a este tipo de adaptadores). La unica guia de uso reproducible es la palabra de activacion `fullshot` y el rango de fuerza recomendado de 0.7 a 1.0. El nombre del fichero (`_000002000`) sugiere 2000 pasos de entrenamiento, pero esto es una inferencia a partir de la nomenclatura, no un dato confirmado.

## Capacidades

- Generacion de imagenes de cuerpo entero a partir de descripciones textuales, actuando como modificador del modelo base Z-image Turbo.
- Especializacion declarada en proporciones corporales femeninas en planos de cuerpo completo, con mejoras de encuadre y anatomia segun el autor.
- Activacion mediante la palabra clave `fullshot` en el prompt.
- Ajuste de intensidad del efecto mediante la fuerza del LoRA, con rango recomendado de 0.7 a 1.0.
- Compatibilidad con flujos de trabajo de ComfyUI, con la plataforma en la nube RunningHub y con HuggingFace como repositorio de pesos.
- Compatibilidad declarada con el modelo base Z-image Turbo en su variante FP8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio, thinking mode ni procesamiento de lenguaje, ya que se trata de un adaptador de generacion de imagen.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Fotografia de moda y lookbooks: el LoRA se aplica sobre Z-image Turbo para generar figuras femeninas a cuerpo entero con proporciones consistentes, lo que resulta util para catalogos de ropa donde el encuadre completo y la anatomia correcta son criticos. Se usaria con la palabra `fullshot` y una fuerza cercana a 0.8.
- Comercio electronico de moda: generacion de imagenes de producto sobre modelo para fichas de tienda online, reduciendo la necesidad de sesiones fotograficas para variaciones de color o de prenda.
- Ilustracion de personajes para videojuegos y animacion: produccion de concept art de cuerpo entero con proporciones controladas antes de pasar a modelado 3D o a ilustracion final.
- Storyboards y previsualizacion audiovisual: generacion rapida de planos de personaje completo para comunicar intenciones de vestuario, pose y escala a equipos de produccion.
- Contenido para redes sociales en formato vertical: creacion de imagenes de cuerpo entero optimizadas para formatos 9:16, donde el ajuste de proporciones evita recortes y deformaciones.
- Pipelines de generacion por lotes en ComfyUI: integracion del LoRA como nodo dentro de un grafo mayor, combinado con otros LoRAs de estilo o de vestuario, para producir series de imagenes de forma automatizada.
- Servicios gestionados via API de RunningHub: despliegue del modelo en la nube de RunningHub cuando no se dispone de GPU local, usando la API documentada por la plataforma.
- Ajuste adicional o mezcla de adaptadores: al ser un LoRA de 162 MiB, puede combinarse con otros adaptadores sobre el mismo modelo base, aunque la model card no ofrece guia sobre pesos de mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas ni comparaciones con otros adaptadores) y el repositorio no adjunta imagenes de ejemplo ni scripts de evaluacion.

## Requisitos de hardware

- VRAM del adaptador: despreciable, en torno a 0.2 GB adicionales, dado que el fichero de pesos ocupa 162 MiB.
- VRAM total necesaria: determinada por el modelo base Z-image Turbo, cuyos requisitos no se especifican en la informacion disponible. La model card recomienda la variante FP8, lo que sugiere que el modelo base esta disenado para reducir huella de memoria frente a una version en precision completa.
- GPU recomendadas: no disponibles en la informacion proporcionada. No se puede confirmar si el conjunto base mas LoRA cabe en GPU de consumo tipo RTX 4090, RTX 3090 o inferiores sin datos del modelo base.
- Opciones de despliegue: ComfyUI (flujo declarado por el autor), plataforma en la nube RunningHub y su API, y carga directa de pesos desde HuggingFace. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a difusion.
- Latencia y throughput: no disponibles. Dependen enteramente del modelo base, del hardware y del numero de pasos de muestreo configurados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable con otros adaptadores LoRA de cuerpo entero.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-fullshot-zit-lora-v1-lora | No disponible (LoRA de 162 MiB) | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, RunningHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia cualitativa, en el ecosistema existen adaptadores LoRA equivalentes para modelos como SDXL o FLUX.1 orientados a encuadres de cuerpo entero y proporciones anatomicas, pero no se han localizado en la informacion proporcionada datos verificables que permitan compararlos con este adaptador.

## Limitaciones y advertencias

- Sesgo de representacion: el adaptador esta disenado explicitamente para "mejorar proporciones corporales femeninas", lo que implica una especializacion de genero y puede introducir un sesgo sistematico hacia un ideal corporal concreto y poco diverso.
- Riesgo de artefactos: al aplicarse con fuerza 0.7-1.0, valores altos de un LoRA pueden degradar la coherencia de la imagen, producir deformaciones anatomicas o sobreestilizar el resultado. La model card no documenta el comportamiento fuera de ese rango.
- Dependencia del modelo base: el adaptador solo funciona correctamente con Z-image Turbo (preferiblemente en FP8). No hay garantia de compatibilidad con otros modelos de difusion, ni de que un LoRA entrenado para Z-image Turbo funcione en arquitecturas distintas.
- Sin validacion publica: el repositorio registra cero descargas y cero likes, y no incluye imagenes de ejemplo ni evaluaciones de terceros. No hay evidencia independiente de la calidad declarada.
- Licencia no determinada: la model card no especifica una licencia concreta y remite a la licencia del proyecto original o del modelo base. Esto impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia de Z-image Turbo antes de cualquier despliegue en produccion.
- Idioma no documentado: no se especifica que idiomas acepta el codificador de texto del modelo base. La unica palabra de activacion conocida esta en ingles, por lo que prompts en castellano podrian comportarse de forma inconsistente.
- Sin datos de entrenamiento: se desconoce la composicion del dataset, lo que impide evaluar riesgos de memorizacion, replicacion de sesgos de la fuente de datos o posibles infracciones de derechos de imagen.
- Trazabilidad limitada: la fecha de creacion registrada (2026-09-29) y la ausencia de versionado adicional impiden reconstruir el historial del modelo.
- Optimizacion de prompt: el efecto depende de incluir `fullshot`, un detalle fragil que en produccion obliga a controlar la plantilla de prompt de forma programatica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-fullshot-zit-lora-v1-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2104977885165944834
- Pagina del autor (@Meowooda): https://www.runninghub.ai/user-center/2033584674055655425
- Version en chino de la model card: https://huggingface.co/RunningHubAI/rh-fullshot-zit-lora-v1-lora/blob/main/README_cn.md
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejecucion de Seedance 2.5 via API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Informacion sobre la API de RunningHub: https://www.runninghub.ai/call-api

# davidalarrea/kitten-tts-g2p

## Resumen

davidalarrea/kitten-tts-g2p es un repositorio de recursos de conversión grafema-fonema (G2P) para inglés estadounidense, publicado por el usuario davidalarrea bajo licencia MIT. No es un modelo de lenguaje ni un sistema TTS completo, sino un paquete de artefactos auxiliares que se descarga automáticamente al utilizar KittenTTS o Kokoro TTS con voces inglesas a través de la librería mlx-audio-swift. Su función es resolver la etapa intermedia entre texto y fonemas que requieren los modelos acústicos.

El paquete contiene dos diccionarios de pronunciación (us_gold.json, 2,9 MB, y us_silver.json, 3,0 MB), un modelo BART de respaldo para palabras no cubiertas por los diccionarios (us_bart.safetensors, 2,9 MB) y su fichero de configuración (us_bart_config.json, 1,2 KB). El repositorio ocupa 0,0 GB según HuggingFace y fue creado y actualizado el 18 de septiembre de 2026, según los metadatos de la plataforma.

Es relevante para quien despliega síntesis de voz en el ecosistema Apple (MLX/Swift), porque evita depender de motores G2P externos instalados en el sistema y porque la licencia MIT permite integración en productos comerciales. Los recursos están portados del motor Misaki de hexgrad. En el momento de la consulta el repositorio no registra descargas ni likes, por lo que no existe validación de la comunidad ni evaluación pública de la calidad de las pronunciaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de respaldo G2P basado en BART (transformer encoder-decoder) para palabras fuera de diccionario; los diccionarios son ficheros JSON de consulta directa |
| Parámetros totales | no disponible (la model card no indica la cifra; el fichero de pesos ocupa 2,9 MB) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors sin cuantizar) |
| Idiomas soportados | inglés (variedad estadounidense, etiquetado como "en") |
| Licencia | MIT |
| Formato de pesos | safetensors (us_bart.safetensors) y JSON (us_bart_config.json, us_gold.json, us_silver.json) |
| Tipo de artefacto | paquete de recursos G2P, no un modelo generativo autónomo |
| Pipeline declarado | text-to-speech |
| Autor | davidalarrea |
| Origen de los recursos | portados del motor Misaki (hexgrad), licencia MIT |
| Fecha de creación y actualización | 2026-09-18 |
| Descargas y likes | 0 y 0 |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |

Ficheros incluidos:

| Fichero | Descripción | Tamaño |
|---|---|---|
| us_gold.json | Diccionario de pronunciación gold | 2,9 MB |
| us_silver.json | Diccionario de pronunciación silver | 3,0 MB |
| us_bart.safetensors | Pesos del modelo BART de respaldo para G2P | 2,9 MB |
| us_bart_config.json | Configuración del modelo BART | 1,2 KB |

## Arquitectura y entrenamiento

El componente neuronal del paquete es un modelo de respaldo basado en BART, una arquitectura transformer encoder-decoder orientada a secuencias a secuencias. La model card no especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni el total de parámetros; el fichero de configuración que los contendría ocupa solo 1,2 KB y no se reproduce en la información disponible. Tampoco se documenta el tokenizador, el vocabulario de fonemas de salida ni la longitud máxima de secuencia soportada, por lo que no es posible verificar su compatibilidad directa con librerías de inferencia estándar.

El flujo de trabajo previsto es en cascada: primero se consultan los diccionarios de pronunciación, etiquetados como gold (2,9 MB) y silver (3,0 MB), y solo cuando una palabra no aparece en ellos se recurre al modelo BART. El repositorio no explica el criterio que distingue las entradas gold de las silver, ni el procedimiento de construcción de ambos diccionarios, ni si el modelo BART fue entrenado desde cero o ajustado. No hay información sobre volumen de datos de entrenamiento, composición del corpus ni técnicas de alineación supervisada o no supervisada. Al no tratarse de un modelo conversacional, no se aplican fases de RLHF ni de DPO.

La única referencia técnica declarada es el port desde el motor Misaki (hexgrad), del que se heredan tanto los diccionarios como el mecanismo de respaldo. No se documentan innovaciones propias ni optimizaciones específicas más allá de la integración con mlx-audio-swift.

## Capacidades

- Conversión de grafemas a fonemas para inglés estadounidense mediante búsqueda directa en diccionario.
- Resolución de palabras fuera de diccionario (OOV) mediante el modelo BART de respaldo incluido en el paquete.
- Integración automática en el pipeline de KittenTTS y Kokoro TTS cuando se usan voces inglesas a través de mlx-audio-swift, sin instalación manual por parte del usuario.
- Funcionamiento en el ecosistema MLX/Swift, orientado a Apple Silicon, con artefactos de tamaño reducido aptos para ejecución local.
- Consulta de pronunciaciones de forma aislada, ya que los diccionarios son ficheros JSON legibles y parseables por cualquier lenguaje.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo cubre inglés estadounidense.

## Casos de uso

- Integración en pipelines TTS con KittenTTS o Kokoro: el paquete se descarga de forma automática desde mlx-audio-swift cuando se selecciona una voz inglesa, de modo que el desarrollador no necesita gestionar manualmente el paso G2P ni instalar un fonemizador del sistema.
- Aplicaciones de voz en dispositivos Apple: al estar pensado para MLX y Swift, encaja en apps de macOS o iOS que hacen inferencia en local, con un consumo de disco inferior a 10 MB y sin dependencias de red.
- Preprocesado de texto para modelos acústicos que consumen fonemas: permite generar la secuencia de entrada de un modelo acústico propio siguiendo el mismo esquema de diccionario más respaldo que usan KittenTTS y Kokoro.
- Pronunciación consistente de terminología técnica y nombres propios: el modelo BART de respaldo cubre términos que no figuran en los diccionarios, lo que reduce la variabilidad de pronunciación en dominios especializados como medicina, derecho o nombres de marca.
- Generación de corpus fonemizados para entrenamiento o ajuste fino: los diccionarios gold y silver se pueden usar para etiquetar texto inglés a gran escala antes de entrenar o evaluar un modelo TTS propio.
- Construcción de sistemas de evaluación G2P: el diccionario gold puede emplearse como referencia para medir la tasa de error de fonemas (PER) de otros motores de conversión grafema-fonema.
- Anotación fonética y alineación forzada: la lista de pares palabra-fonemas sirve como base para anotar corpus de audio o para verificar alineaciones en herramientas de subtitulado y doblaje.
- Narración y lectura asistida en inglés: en asistentes de lectura, audiolibros o interfaces de accesibilidad que sinteticen texto inglés en local sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de error de fonemas (PER), precisión de diccionario, cobertura léxica ni comparaciones cuantitativas con otros motores G2P. Tampoco se documentan métricas de latencia o throughput. Los únicos datos numéricos verificables son los tamaños de los artefactos:

| Artefacto | Métrica disponible | Valor |
|---|---|---|
| us_gold.json | Tamaño en disco | 2,9 MB |
| us_silver.json | Tamaño en disco | 3,0 MB |
| us_bart.safetensors | Tamaño en disco | 2,9 MB |
| us_bart_config.json | Tamaño en disco | 1,2 KB |
| Repositorio completo | Tamaño declarado en HuggingFace | 0,0 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por los tamaños de los ficheros, los pesos del modelo BART (2,9 MB) y la configuración (1,2 KB) caben holgadamente en menos de 1 GB de memoria; el cálculo debe considerarse una estimación a partir del tamaño en disco, no un dato publicado.
- Memoria principal: los dos diccionarios suman 5,9 MB en disco; cargados en memoria como estructuras JSON ocupan un múltiplo de esa cifra según la implementación, en cualquier caso del orden de decenas de MB como máximo. No hay cifras oficiales.
- GPU recomendadas: no aplica ninguna GPU dedicada. El paquete está diseñado para el ecosistema MLX sobre Apple Silicon, por lo que el hardware objetivo son chips de la serie M de Apple.
- Cabe en GPU de consumo: sí, y también en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) dispone de VRAM sobrada, aunque la integración documentada es la de Apple Silicon vía MLX.
- Opciones de despliegue: mlx-audio-swift es la vía soportada y documentada; el paquete se descarga automáticamente al usar KittenTTS o Kokoro TTS con voces inglesas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, herramientas que además no aplican a un paquete de diccionarios y a un modelo BART de 2,9 MB en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidalarrea/kitten-tts-g2p | Diccionarios G2P + BART de respaldo | no disponible (pesos de 2,9 MB) | no disponible | MIT | HuggingFace; descarga automática vía mlx-audio-swift |
| Misaki (hexgrad) | Motor G2P multilingüe con diccionarios y modelo de respaldo | no disponible | no disponible | MIT (según la model card de este repositorio, que lo cita como origen) | Repositorio en GitHub |
| espeak-ng | Sintetizador y fonemizador basado en reglas | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Distribución como software de sistema |
| g2p_en (Kyubyong) | Conversión G2P para inglés basada en secuencias | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Paquete de Python |

Este repositorio es una adaptación acotada de Misaki al inglés estadounidense y al ecosistema MLX, por lo que su ventaja comparativa es la integración automática y el tamaño reducido, no la cobertura lingüística ni unas métricas de calidad superiores, que no se han publicado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no admite tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- Solo cubre inglés estadounidense. No hay soporte para otras variedades del inglés ni para otros idiomas, y no se documenta mecanismo de extensión a nuevos idiomas.
- No existe ninguna evaluación publicada: ni PER, ni cobertura léxica, ni pruebas de calidad de las pronunciaciones gold y silver. La fiabilidad del diccionario y del respaldo BART es, a día de hoy, una incógnita verificable solo mediante pruebas propias.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día según los metadatos, con fecha de 2026. Esto sugiere un proyecto recién publicado, sin uso en producción conocido y sin mantenimiento demostrable. La fecha, además, es posterior a lo habitual y podría indicar metadatos erróneos.
- El criterio que separa las entradas gold de las silver no está documentado, por lo que no se puede asumir que el diccionario gold sea una referencia fiable sin validación previa.
- El formato exacto de los JSON y el esquema de los pares palabra-fonemas no se describe. Reutilizar los diccionarios fuera de mlx-audio-swift exige ingeniería inversa del esquema.
- Los pesos safetensors del modelo BART no vienen acompañados de tokenizador ni de instrucciones de carga, y la configuración de 1,2 KB no se publica en la información disponible. La compatibilidad con `transformers` o con otras librerías de inferencia no está garantizada.
- Riesgo de pronunciación incorrecta en palabras fuera de diccionario, siglas, acrónimos, cifras, unidades y nombres extranjeros, ya que dependen exclusivamente del modelo BART de respaldo. Se recomienda una fase de normalización de texto previa.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero al derivar del motor Misaki conviene conservar el aviso de copyright y la atribución correspondiente.
- El repositorio depende de terceros (KittenTTS, Kokoro TTS, mlx-audio-swift) para tener utilidad práctica; no aporta un ejecutable ni una API propia.
- La búsqueda web realizada no devolvió información relevante sobre este repositorio: los resultados obtenidos correspondían al sistema sanitario austriaco ELGA y no guardan relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidalarrea/kitten-tts-g2p
- mlx-audio-swift (integración que descarga estos recursos): https://github.com/Blaizzy/mlx-audio-swift
- Misaki, motor G2P de origen (hexgrad): https://github.com/hexgrad/misaki
- Resultados de búsqueda web: sin enlaces relevantes; las entradas devueltas (elga.gv.at, gesundheit.gv.at, elga-online.gv.at) no están relacionadas con el modelo.

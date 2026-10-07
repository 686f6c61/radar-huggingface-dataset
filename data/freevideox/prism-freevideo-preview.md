# FreeVideoX/Prism-FreeVideo-Preview

## Resumen

Prism-FreeVideo-Preview es un paquete de pesos preparados por FreeVideoX a partir del modelo Prism de Tencent (FrancisRing/Prism), distribuidos específicamente para el motor de streaming por bloques de FreeVideo. Se trata de un modelo de generación de vídeo condicionada por imagen (image-to-video) que anima un primer fotograma hasta un clip de 1280 × 720 píxeles y 8,5 segundos de duración, generando además audio sincronizado con voces, efectos de sonido y música. La relevancia actual del paquete reside en que permite ejecutar Prism en una sola GPU de consumo de la familia NVIDIA RTX 30, 40 o 50 con 12 GiB de VRAM o más, gracias a una organización de pesos en bloques que se pueden transmitir desde RAM o disco cuando no caben en memoria.

El repositorio no contiene pesos nuevos entrenados por FreeVideoX, sino una reempaquetado y cuantización de los pesos originales de Prism (revisión `347659c562dcc392c45dfe1673c051e7c62f57ac`, `preview_alpha`), junto con componentes auxiliares: el codificador de texto UMT5-XXL en bf16, el VAE de Wan2.1, el decodificador de audio DAC y la destilación LightX2V Wan2.2-I2V 260412 extraída como LoRA de rango 256 sin fusionar. El paquete ofrece dos variantes de precisión: `int8/` (46,6 GiB, W8A8 con rotación Hadamard de 128 dimensiones) y `bf16/` (60,8 GiB, opcional y solo para el nivel de máxima calidad).

La arquitectura subyacente sigue el linaje Wan2.2, con una estructura de bloques separada en expertos (`expert_high`, `expert_low`), un bloque puente (`bridge`) y bloques de audio, lo que apunta a un transformer de difusión con diseño tipo mezcla de expertos y generación conjunta de vídeo y audio. No se publican en la información disponible el número de parámetros, la composición del dataset de entrenamiento ni detalles sobre fases de alineación (RLHF/DPO).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con estructura por bloques (expert_high, expert_low, bridge, audio), linaje Wan2.2; detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (la estructura por expertos sugiere diseño MoE, sin confirmar) |
| Longitud de contexto | no aplicable (modelo de generación de vídeo; entrada condicionada por imagen y texto, longitud de prompt no especificada) |
| Tipos de cuantización | W8A8 INT8 con rotación Hadamard de 128 dimensiones; bf16 (sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos y código de Prism, Tencent) + Apache-2.0 (MOVA, Wan2.1/Wan2.2, UMT5-XXL, Wan VAE, destilación LightX2V) + MIT (Descript Audio Codec); declarada en HuggingFace como `other` / `mit-and-apache-2.0` |
| Formato de pesos | safetensors, divididos por bloque del transformer (`expert_high/blocks/NN.safetensors`, `expert_low/...`, `audio/...`, `bridge/...`) con `manifest.json` de tamaños y SHA-256 |

Datos adicionales del paquete:

| Elemento | Valor |
|---|---|
| Tamaño total del repositorio | 114,4 GB |
| Carpeta `int8/` | 46,6 GiB |
| Carpeta `bf16/` | 60,8 GiB |
| Resolución y duración de salida | 1280 × 720, 8,5 segundos |
| Modalidad | image-to-video con audio sincronizado |
| Fecha de creación en HuggingFace | 6 de octubre de 2026 |
| Última actualización | 7 de octubre de 2026 |
| Descargas / likes | 0 / 0 |
| Modelo base | FrancisRing/Prism |

## Arquitectura y entrenamiento

La información disponible describe los pesos como una preparación del modelo Prism de Tencent para el motor de streaming por bloques de FreeVideo. Los ficheros están organizados por bloque del transformer en cuatro familias: `expert_high/`, `expert_low/`, `bridge/` y `audio/`. Esta separación por expertos (alto y bajo) es característica de los transformers de difusión con diseño de mezcla de expertos empleados en la familia Wan2.2, y permite cargar o transmitir cada bloque de forma independiente según el espacio de VRAM disponible. El bloque `bridge` actúa presumiblemente como conexión entre las ramas de vídeo y de audio, aunque la model card no detalla su función exacta.

En cuanto al entrenamiento, no se especifican el número de tokens, la composición del dataset, ni si hubo fases de ajuste por refuerzo (RLHF) o preferencia directa (DPO). La model card sí documenta la procedencia de los pesos: la revisión `preview_alpha` de `FrancisRing/Prism`, los datos MOVA-360p y la destilación LightX2V 260412, extraída como LoRA de rango 256 por Kijai y dejada sin fusionar para el nivel de calidad más ligero. Entre las innovaciones técnicas destacables del empaquetado figuran la cuantización W8A8 INT8 con rotación Hadamard de 128 dimensiones, el motor de streaming por bloques que habilita la ejecución en 12 GiB de VRAM, y las cuatro recetas de muestreo (Light, Medium, High, Max) que equilibran velocidad y fidelidad.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) con salida de 1280 × 720 píxeles y 8,5 segundos por clip.
- Generación de audio sincronizado con el vídeo, incluyendo voz (speech), efectos de sonido y música.
- Condicionamiento por texto mediante el codificador UMT5-XXL en bf16.
- Cuatro niveles de calidad controlables mediante recetas de muestreo: Light (8 pasos destilados), Medium (20 pasos, CFG 5), High (30 pasos, CFG 5) y Max (50 pasos oficiales, bf16 y atención exacta).
- Decodificación de audio mediante Descript Audio Codec (DAC).
- Ejecución en una sola GPU de consumo con 12 GiB o más de VRAM mediante streaming de bloques desde RAM o disco.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo generativo multimodal de vídeo y audio, no orientado a agentes).
- Capacidades multilingües: no disponible (el codificador UMT5-XXL es multilingüe, pero no se documentan los idiomas soportados por el modelo).
- Capacidad especial: modo `thinking` no disponible; la principal capacidad diferencial es la coherencia audio-vídeo en un único paso de generación.

## Casos de uso

- Generación de clips publicitarios cortos: a partir de una imagen de producto o un fotograma de referencia, el modelo produce un vídeo de 8,5 segundos en 720p con banda sonora y locución sincronizadas, adecuado para anuncios en redes sociales sin necesidad de grabar audio por separado.
- Prototipado rápido de storyboards animados: guionistas y directores pueden convertir un fotograma clave en una escena animada con sonido ambiente para validar tono y ritmo antes de rodar.
- Creación de contenido para redes sociales: generación de vídeos verticales u horizontales a partir de una ilustración, con efectos de sonido y música generados por el propio modelo, reduciendo la dependencia de bibliotecas de audio externas.
- Animación de fotografías o ilustraciones para archivo y patrimonio: digitalización de material estático en clips breves con audio descriptivo, útil en museos y editoriales.
- Previsualización en producción audiovisual (previsualización o `previs`): generación de planos de referencia con diálogo sintético para decidir encuadres y duración antes de la producción final.
- Demostraciones interactivas en portátiles con GPU de consumo: al requerir solo 12 GiB de VRAM en el nivel Light, permite ejecutar demostraciones locales en equipos con RTX 30/40/50 sin depender de infraestructura en la nube.
- Doctores y educación: creación de explicaciones animadas breves con narración sincronizada a partir de una imagen de pizarra o diagrama.
- Investigación en generación multimodal: el paquete sirve como base reproducible para estudiar la coordinación audio-vídeo, el efecto de la cuantización W8A8 con rotación Hadamard y la destilación LoRA de rango 256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (tipo MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. La model card únicamente aporta tiempos de ejecución por nivel de calidad medidos en una única GPU NVIDIA H200:

| Nivel | Receta | Tiempo en una H200 |
|---|---|---|
| Light | 8 pasos destilados; el audio sigue las características del modelo original | ~6 min |
| Medium | 20 pasos, pesos originales, CFG 5 | 15,5 min |
| High | 30 pasos, pesos originales, CFG 5 | 23 min |
| Max | Receta oficial de 50 pasos de Prism, pesos bf16 y atención exacta | 62,5 min |

La model card remite a la guía de Prism de FreeVideo para consultar las aceleraciones aplicadas, la calidad medida frente al muestreador oficial y los tiempos en configuraciones con menos VRAM y RAM, pero esos datos no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM mínima: 12 GiB para cualquiera de los niveles, gracias al motor de streaming por bloques que transmite desde RAM o disco los bloques que no caben en memoria.
- GPU compatibles: NVIDIA RTX serie 30, 40 o 50 (una sola tarjeta). La model card no menciona soporte para AMD, Intel ni Apple Silicon.
- GPU de referencia para las mediciones publicadas: NVIDIA H200 (usada para los tiempos de los cuatro niveles).
- Caben en GPU de consumo: sí, en cualquier RTX 30/40/50 con 12 GiB o más. Los 46,6 GiB de la carpeta `int8/` no caben íntegros en VRAM de consumo, de ahí la necesidad del streaming por bloques.
- Almacenamiento: el repositorio completo ocupa 114,4 GB; solo con la carpeta `int8/` serían necesarios 46,6 GiB más los componentes auxiliares.
- Opciones de despliegue: motor de streaming por bloques de FreeVideo (integración oficial, con descarga automática al seleccionar Prism durante la instalación); biblioteca `diffusers` según la etiqueta del repositorio. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: los únicos datos publicados son los tiempos por clip en H200 (de 6 a 62,5 minutos según nivel). No se especifican tiempos para GPU de consumo.
- Requisitos de RAM: no disponibles de forma explícita; la model card indica que los bloques que no caben en VRAM se transmiten desde RAM o disco, por lo que una RAM insuficiente degradará el rendimiento.

## Comparativa con modelos similares

La información disponible no incluye una comparativa oficial. A continuación se contrasta con alternativas de la misma categoría (generación de vídeo open source), marcando como no disponible aquello que no puede confirmarse:

| Modelo | Parámetros | Duración y resolución | Audio nativo | Licencia | Notas |
|---|---|---|---|---|---|
| Prism-FreeVideo-Preview | no disponible | 8,5 s, 1280 × 720 | Sí (voz, efectos, música) | MIT + Apache-2.0 | Pesos preparados para streaming por bloques; ejecutable en 12 GiB de VRAM |
| Wan2.2-I2V | no disponible en la información facilitada | no disponible | no disponible | Apache-2.0 (según la model card de este repositorio) | Linaje del que deriva Prism; se usa aquí como destilación LightX2V |
| HunyuanVideo | no disponible en la información facilitada | no disponible | no disponible | no disponible en la información facilitada | Alternativa open source de generación de vídeo, sin audio nativo confirmado |
| LTX-Video | no disponible en la información facilitada | no disponible | no disponible | no disponible en la información facilitada | Alternativa orientada a inferencia rápida, sin audio sincronizado confirmado |

No se dispone de datos verificados de parámetros, contextos ni resultados de benchmarks para ninguna de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, cultural o de contenido.
- Riesgo de alucinación: inherente a los modelos generativos de difusión; no se cuantifica en la información disponible. La generación de audio sintético puede producir voces o sonidos no solicitados.
- Limitación de contexto: la longitud máxima de prompt no está documentada. La entrada se limita a una imagen inicial y texto de condicionamiento.
- Limitación de idioma: no se especifican los idiomas soportados por el modelo pese a que el codificador UMT5-XXL es multilingüe.
- Restricciones de licencia: el paquete es una obra derivada con licencias mixtas (MIT para Prism, Apache-2.0 para MOVA, Wan2.1/Wan2.2, UMT5-XXL, Wan VAE y la destilación LightX2V, y MIT para Descript Audio Codec). En HuggingFace la licencia aparece declarada como `other` con nombre `mit-and-apache-2.0`. Es imprescindible revisar el fichero `LICENSE` antes de un uso comercial, ya que la combinación de licencias puede imponer obligaciones de atribución.
- Dependencia de FreeVideo: los pesos están dispuestos específicamente para el motor de streaming por bloques de FreeVideo. Su uso fuera de ese entorno puede requerir reempaquetado manual.
- Tamaño y almacenamiento: 114,4 GB de repositorio completo, con 46,6 GiB solo para la carpeta `int8/`. El espacio en disco y la velocidad de lectura son factores limitantes reales en despliegues locales.
- Rendimiento en VRAM reducida: los tiempos publicados corresponden a una H200; en GPU de consumo con 12 GiB y streaming desde disco, la latencia será sustancialmente mayor.
- Madurez: se trata de una revisión `preview_alpha` del modelo base, con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria extensa.
- Dependencia de componentes externos: el nivel Max requiere los pesos bf16 (60,8 GiB adicionales) y atención exacta, multiplicando los requisitos de cómputo y almacenamiento.
- Fechas: el repositorio figura creado el 6 de octubre de 2026, lo que sitúa su publicación en el futuro respecto a la fecha habitual de consulta; conviene verificar la vigencia de la información.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/FreeVideoX/Prism-FreeVideo-Preview
- Modelo base Prism (Tencent): https://huggingface.co/FrancisRing/Prism
- Repositorio de FreeVideo: https://github.com/FlashML-org/FreeVideo
- Fichero de licencia del repositorio: `LICENSE` (referenciado como `license_link` en la model card)
- No se han encontrado resultados relevantes en la búsqueda web: los enlaces devueltos no guardan relación con el modelo ni con generación de vídeo, por lo que se descartan.

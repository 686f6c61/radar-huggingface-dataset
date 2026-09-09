# EllipsesMark/eromacks

## Resumen

EllipsesMark/eromacks es un fine-tune del modelo de generación de vídeo MiniMax-H3 (Hailuo 3.0), desarrollado por el usuario EllipsesMark. El proyecto, bautizado como "Eros", tiene como objetivo crear un modelo de vídeo con capacidades NSFW explícitas que conserve las funciones del modelo base. El autor lo presenta como una versión funcional y "grafting" (injerto) de características de modelos anteriores (Wan 2.2, Krea 2 y LTX 2.3) en las capas de atención de H3, junto con merges por consenso de más de 20 LoRAs.

El modelo soporta generación de vídeo a partir de texto e imágenes (image-text-to-video) e incluye audio. El repositorio pesa 379,5 GB, lo que sugiere pesos completos en varias variantes (turbo/no-turbo e int8). No se proporcionan especificaciones técnicas detalladas (parámetros, longitud de contexto, idiomas) ni benchmarks públicos. La versión beta_5 es la única que el autor considera funcional; las beta_3 y beta_4 son versiones corruptas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video, fine-tune de MiniMax-H3 (arquitectura exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se mencionan variantes TURBO y un repositorio Int8 (no se detallan formatos) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con licencias adicionales de modelos fuente: LTX 2.3, Wan 2.2, Krea 2) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3 como base. El proceso de ajuste no es un entrenamiento convencional: el autor describe una tecnica de "grafting" (injerto) que extrae caracteristicas de modelos como Wan 2.2, Krea 2 y LTX 2.3 y las inserta en las capas de atencion de H3 a bajo nivel, para no degradar la calidad visual o de audio del modelo original. Ademas, se realizan merges por consenso de mas de 20 LoRAs, sin merges directos de LoRA. La beta_5 incorpora una tecnica de normalizacion distinta a las versiones anteriores.

El README indica que se puede cargar una variante "TURBO" con una fusion delta de turbos hibrida que ahorra 4,2 GB de memoria frente a cargar los turbos de referencia/flujo por separado. Tambien menciona que los "cache" o "spectrum" deben evitarse al usar referencias porque provocan perdida de precision. No se aportan detalles sobre el corpus de entrenamiento, numero de tokens, uso de RLHF/DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de video a partir de texto e imagen (pipeline image-text-to-video).
- Generacion de video con audio integrado; el autor afirma que la version no-turbo con pasos completos produce mejor calidad de audio que la turbo.
- Capacidad NSFW explicita, orientada a contenido para adultos, manteniendo las funciones del modelo base.
- Compatibilidad con LoRAs adicionales (con fuerza recomendada entre 0.2 y 0.6).
- Variantes turbo y no-turbo: la turbo ahorra memoria, la no-turbo ofrece mejor calidad de audio.
- Configuraciones de muestreo recomendadas: se listan combinaciones de sampler/step (er_sde/beta, Multires/simple, LCM/simple, Euler/simple) que funcionan mejor para diferentes objetivos (calidad de movimiento o de audio).
- Soporte para VR180 estereoscopico mediante LoRAs dedicados del mismo autor (no incluida en este modelo).

## Casos de uso

- Produccion de contenido para adultos bajo demanda: el modelo puede generar videos explicitos a partir de prompts de texto, permitiendo a creadores individuales producir material personalizado sin necesidad de rodajes.
- Personalizacion de contenido erotico a partir de imagenes de referencia: al aceptar entrada de imagen, este modelo permite transformar una foto o ilustracion en un video animado, util para creadores que trabajan con personajes o escenas fijas.
- Creacion de arte digital erotico para galerias o exposiciones: las capacidades de generacion de video con audio permiten producir piezas audiovisuales de tematica sensual para espacios artisticos, aprovechando la fidelidad visual del modelo base H3.
- Prototipado de experiencias inmersivas VR180: aunque el modelo base no incluye la LoRA VR180, el autor mantiene una LoRA separada para generar video estereoscopico 180°, lo que permite explorar contenido adulto en realidad virtual con una configuracion adicional.
- Ajuste fino para nichos visuales mediante LoRAs: la arquitectura soporta la carga de LoRAs de concepto encima de beta_5, lo que facilita adaptar el modelo a estilos, personajes o escenarios concretos sin reentrenar el modelo completo.
- Exploracion creativa no NSFW: segun el autor, la beta_5 conserva la capacidad del modelo base, por lo que tambien puede usarse para experimentos de generacion de video generico (paisajes, narrativas, storyboards) siempre que se respeten las restricciones de contenido de la plataforma de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni metricas de generacion de video como FVD, CLIP-Score o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible; el volumen del repositorio (379,5 GB) indica pesos muy grandes, por lo que es probable que se requieran GPU de centro de datos, al menos para la version completa.
- Opciones de despliegue: no se especifican. No hay indicacion de soporte para vLLM, llama.cpp, Ollama o TGI.
- El README menciona que la variante TURBO ahorra 4,2 GB de memoria en comparacion con cargar los turbos de referencia y flujo por separado, pero no se dan cifras absolutas de VRAM ni de latencia.
- Existe un repositorio con versiones Int8 del modelo (enlace mas abajo) que podria reducir los requisitos de memoria, pero no se ofrecen datos precisos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. No se conocen benchmarks de este modelo. Puede compararse conceptualmente con el modelo base MiniMaxAI/MiniMax-H3, del que deriva, pero no hay metricas publicadas. Otros modelos de video open source que podrian ser comparables no estan documentados en la informacion disponible.

| Modelo | Base | Enfoque | Licencia | Dato disponible |
|---|---|---|---|---|
| EllipsesMark/eromacks (beta_5) | MiniMax-H3 | Video con capacidades NSFW, grafting y merges de LoRAs | minimax-h3-community-license-agreement | Sin benchmarks |
| MiniMaxAI/MiniMax-H3 | El propio modelo base | Generacion de video con audio, sin enfoque NSFW | minimax-h3-community-license-agreement | Sin benchmarks en la informacion proporcionada |
| EllipsesMark/minimax-h3-vr180-sbs-lora | LoRA sobre MiniMax-H3 | Video estereoscopico VR180 | no disponible | Sin benchmarks |

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta etiquetado como "not-for-all-audiences" y puede generar contenido sexualmente explicito. Debe utilizarse en entornos adecuados y cumpliendo las normativas locales y de las plataformas de despliegue.
- Version funcional unica: las versiones beta_3 y beta_4 son copias corruptas segun el autor. Solo la beta_5 es funcional, lo que obliga a verificar el fichero antes de su uso.
- Licencia compleja: ademas de la licencia comunitaria de MiniMax-H3, el modelo contiene caracteristicas transferidas de LTX 2.3, Wan 2.2 y Krea 2, cuyas licencias comunitarias se aplican a las porciones correspondientes. Esto puede generar restricciones no evidentes para uso comercial o redistribucion.
- Entrenamiento inestable: el propio autor indica que el entrenamiento de H3 es problematico y que su rama dependera de futuros ajustes. La calidad del modelo puede variar sin previo aviso.
- Ausencia de documentacion tecnica: no se detallan arquitectura, parametros, contexto, idiomas ni requisitos de hardware oficiales. Esto dificulta su integracion en produccion y su evaluacion comparativa.
- Riesgo de alucinaciones visuales y de audio, inherente a los modelos generativos de video, agravado por la ausencia de benchmarks y pruebas publicas.
- No se recomienda para aplicaciones de produccion sin una validacion previa exhaustiva.

## Enlaces

- Modelo: https://huggingface.co/EllipsesMark/eromacks
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Version Int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
- LoRA VR180 del mismo autor: https://huggingface.co/EllipsesMark/minimax-h3-vr180-sbs-lora
- Modelos hibridos del mismo autor: https://huggingface.co/EllipsesMark/Minimax-H3-fl2va-ref2va-hybrid-models

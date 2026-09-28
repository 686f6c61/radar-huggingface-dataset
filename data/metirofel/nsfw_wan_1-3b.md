# Metirofel/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b es un ajuste fino (fine-tune) del modelo de generación de vídeo a partir de texto Wan-AI/Wan2.1-T2V-1.3B, publicado por el usuario Metirofel en HuggingFace. Se trata de un modelo denso de 1.300 millones de parámetros, con arquitectura de transformer para texto-a-vídeo (T2V), especializado en la generación de clips cortos de contenido para adultos. El objetivo declarado por el autor es servir como herramienta de investigación y creación dentro del ámbito del contenido NSFW, manteniendo coherencia temporal nativa sin necesidad de LoRAs auxiliares.

El interés técnico del repositorio no está en el rendimiento bruto, sino en el registro metodológico que documenta el autor: describe un primer entrenamiento en dos fases (10 epochs de imagen seguidas de 10 epochs de vídeo) que provocó olvido catastrófico y artefactos anatómicos graves, y una segunda ejecución con dataset mixto simultáneo (30.000 clips de vídeo y 20.000 imágenes fijas) que corrigió parcialmente esos problemas. Es, por tanto, un caso de estudio útil sobre regularización espacial en ajuste fino de modelos de vídeo, además del propio uso generativo.

El repositorio ocupa 105,4 GB y contiene 34 checkpoints en formato safetensors (20 de la serie original y 14 de la experimental). No registra descargas ni likes, no incluye resultados de benchmarks y su licencia CreativeML OpenRAIL-M impone restricciones de uso que conviene revisar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto a video (T2V) |
| Parametros totales | 1.300 millones (1,3B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se especifica la longitud maxima de prompt ni el numero de frames por clip) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye checkpoints completos en safetensors) |
| Idiomas soportados | No disponibles; las leyendas de entrenamiento provienen de comunidades en ingles |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (34 checkpoints: `wan_1.3B_e1`-`e20` y `wan_1.3B_exp_e1`-`exp_e14`) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Tipo de tarea | Text-to-video (T2V) |
| Especializacion | Contenido NSFW para adultos |
| Tamano del repositorio | 105,4 GB |
| Archivos auxiliares | `prompting-guide.json` (analisis de palabras clave y convenciones de etiquetado) |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusion para generacion de video a partir de texto desarrollado por Wan-AI. El ajuste fino conserva la arquitectura del modelo base y modifica exclusivamente los pesos del denoiser; el repositorio no incluye ni documenta componentes adicionales como el codificador de texto o el VAE, que deben obtenerse del modelo original. El autor no especifica si se congelaron capas, que modulos se entrenaron ni la resolucion nativa de entrenamiento.

El proceso de entrenamiento se documento en dos iteraciones. La primera, hoy marcada como legacy, dividio el entrenamiento en dos fases: los epochs 1 a 10 se entrenaron sobre un gran dataset de imagenes NSFW y los epochs 11 a 20 exclusivamente sobre video. Segun el autor, la fase de imagen fue demasiado agresiva y provoco olvido catastrofico: el modelo perdio la nocion de anatomia coherente (rostros, manos) y la fase de video no logro recuperarla, generando artefactos descritos como "body horror" a partir del epoch 3. La segunda iteracion, etiquetada como experimental, sustituyo el esquema por una unica ejecucion sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes fijas presentadas simultaneamente, con learning rate mas conservador, batch menor y calendario de entrenamiento mas corto. El objetivo era mantener una regularizacion espacial constante que evitase la deriva anatomica.

Los datos de entrenamiento proceden de las 1.000 publicaciones mas populares de aproximadamente 1.250 subreddits de contenido adulto, con sus leyendas originales, lo que explica que el vocabulario de prompting se apoye en las convenciones de etiquetado de esas comunidades. No se documenta el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor recomienda de forma explicita el checkpoint `wan_1.3B_exp_e14.safetensors` tanto para uso general como para entrenar LoRAs sobre el.

## Capacidades

- Generacion de video corto a partir de descripciones textuales (text-to-video) con coherencia temporal nativa, sin necesidad de LoRAs de movimiento auxiliares segun el autor.
- Generacion de contenido explicito para adultos en un espectro amplio de escenarios, esteticas, arquetipos de personaje y acciones descritas en lenguaje natural.
- Reproduccion de estilos visuales propios de comunidades especificas, gracias al entrenamiento sobre leyendas con convenciones de etiquetado de subreddits concretos.
- Base para entrenamiento de LoRAs adicionales: el autor recomienda el checkpoint `exp_e14` como punto de partida para ese fin.
- Aprendizaje de conceptos espaciales a partir de imagenes fijas, con transferencia posterior a la generacion de video temporalmente coherente.
- No se documenta soporte de tool calling, function calling, uso agentico, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento. Es un modelo exclusivamente generativo de video a partir de texto.

## Casos de uso

- Investigacion sobre moderacion de contenido: el modelo sirve como generador adversario para construir y evaluar clasificadores y filtros de deteccion de contenido explicito en plataformas de video, un escenario donde disponer de muestras sinteticas controladas evita recurrir a material real.
- Red-teaming de pipelines de generacion: permite comprobar si las capas de seguridad de un sistema de text-to-video o de text-to-image detectan y bloquean prompts de contenido adulto antes de la inferencia.
- Estudio metodologico de olvido catastrofico: el repositorio documenta con detalle dos esquemas de ajuste fino (fases separadas frente a dataset mixto) y los fallos asociados, lo que lo convierte en material de analisis para investigacion sobre entrenamiento continuo y regularizacion espacial en modelos de video.
- Produccion de contenido para adultos legal: generacion de clips cortos para plataformas verificadas, siempre que se apliquen los requisitos de verificacion de edad, consentimiento y etiquetado que exige la licencia y la legislacion aplicable.
- Entrenamiento de LoRAs de estilo o de personaje: la recomendacion explicita del checkpoint `exp_e14` como base para LoRA lo hace adecuado como punto de partida en flujos de personalizacion, aprovechando que ya incorpora movimiento nativo y evita tener que anadir LoRAs de temporalidad.
- Aumento de datos para investigacion en vision por computador: generacion de variaciones sinteticas de escenas con atributos controlados para estudios de sesgo, estetica o deteccion de contenido, con la ventaja de no reutilizar material de personas reales.
- Pruebas de carga y evaluacion de infraestructura de inferencia de video: al ser un modelo de 1,3B con checkpoints multiples, resulta util para medir latencia, VRAM y throughput de pipelines de difusion antes de escalar a modelos mayores.
- Analisis de convenciones de prompting: el archivo `prompting-guide.json` permite estudiar como se traducen las practicas de etiquetado de una comunidad a instrucciones efectivas para un modelo generativo, un caso practico de ingenieria de prompts especifica de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FVD, CLIP score, VBench ni ninguna otra) para ninguna de las series de checkpoints, ni comparaciones cuantitativas con el modelo base. La evaluacion se limita a juicios cualitativos del propio autor sobre calidad espacial, estabilidad del movimiento y fidelidad al contenido solicitado.

## Requisitos de hardware

- VRAM estimada solo para los pesos: aproximadamente 2,6 GB en bf16 o 5,2 GB en fp32, calculado a partir de los 1,3B de parametros. Estas cifras son una estimacion aritmetica, no un dato publicado en el repositorio.
- VRAM estimada para el pipeline completo: hay que anadir el codificador de texto, el VAE y los latentes de video, que en difusion de video son el factor dominante. Como orden de magnitud, cabe esperar del orden de 8 a 12 GB para clips cortos en resolucion baja, con consumo creciente segun el numero de frames y la resolucion. El repositorio no publica cifras oficiales.
- GPU recomendadas: para produccion, A100 o H100 de 40-80 GB permiten lotes mayores y clips mas largos sin offloading. Para trabajo individual, RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) son suficientes en bf16.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) con precision bf16. En GPUs de 8 GB puede ser viable aplicando offloading secuencial del VAE y del codificador de texto. Por debajo de 6 GB no es razonable sin cuantizacion agresiva, y el repositorio no distribuye pesos cuantizados.
- Opciones de despliegue: el autor no documenta ninguna. El modelo base Wan2.1 dispone de ecosistema propio y de integraciones habituales en el entorno de difusion (Diffusers, ComfyUI y similares), pero no hay confirmacion en la informacion proporcionada de que estos checkpoints concretos funcionen sin conversion previa.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por clip, frames por segundo ni consumo energetico.

## Comparativa con modelos similares

| Caracteristica | NSFW Wan 1.3b | Wan-AI/Wan2.1-T2V-1.3B (base) | Otros fine-tunes NSFW de T2V |
|---|---|---|---|
| Parametros | 1.300 millones | 1.300 millones | No disponible |
| Arquitectura | Transformer de difusion T2V | Transformer de difusion T2V | No disponible |
| Especializacion | Contenido NSFW explicito | Generacion generalista | Contenido NSFW |
| Datos de ajuste | 20.000 imagenes + 30.000 clips de video (serie experimental) | No disponible en esta ficha | No disponible |
| Licencia | CreativeML OpenRAIL-M | No disponible en esta ficha | No disponible |
| Checkpoints publicados | 34 (20 legacy + 14 experimentales) | No disponible en esta ficha | No disponible |
| Tamano del repositorio | 105,4 GB | No disponible en esta ficha | No disponible |
| Benchmarks publicados | Ninguno | No disponible en esta ficha | No disponible |
| Validacion de la comunidad | 0 descargas, 0 likes | No disponible en esta ficha | No disponible |

La comparacion con el modelo base es la unica que puede establecerse con la informacion disponible. No se identifican en el repositorio alternativas de la misma categoria con datos verificables, por lo que la columna de otros fine-tunes queda como no disponible.

## Limitaciones y advertencias

- Artefactos documentados por el propio autor: la serie original (`e1`-`e20`) presenta degradacion de calidad y "body horror" a partir del epoch 3, consecuencia de olvido catastrofico. La serie experimental se publica precisamente para corregirlo, pero el autor la describe como experimental y sujeta a validacion.
- Inconsistencia interna en la documentacion: el apartado de la correccion se titula "Experimental Epochs 1-8", pero el texto menciona checkpoints hasta `exp_e14` y recomienda `exp_e14` como el mejor. Conviene verificar que checkpoint se esta descargando antes de usarlo.
- Sesgos previsibles: el dataset se construyo a partir de las publicaciones mas populares de unos 1.250 subreddits, de modo que hereda los sesgos de representacion, esteticos y demograficos de esas comunidades, ademas de su vocabulario y sus convenciones de etiquetado.
- Dependencia del prompt: el autor remite explicitamente al archivo `prompting-guide.json` porque el modelo responde a convenciones de lenguaje propias de las comunidades de origen. Fuera de ese vocabulario, la calidad puede caer de forma notable.
- Idioma: no se declaran idiomas soportados. Las leyendas de entrenamiento estan en ingles, por lo que el rendimiento con prompts en castellano es incierto y no esta evaluado.
- Alucinacion estructural: como todo modelo de difusion de video, puede generar anatomia incorrecta, transiciones incoherentes entre frames o movimientos fisicamente imposibles. Es un riesgo estructural, no un defecto corregible por prompting.
- Restricciones de licencia: CreativeML OpenRAIL-M no es una licencia de uso libre sin condiciones. Incorpora una clausula de uso restringido (Attachment A) que prohibe determinados fines, y obliga a propagar la licencia y sus restricciones a los modelos derivados y a los servicios desplegados. Es imprescindible leerla completa antes de cualquier uso comercial.
- Marco legal: la generacion y distribucion de contenido explicito esta sujeta a legislacion especifica segun jurisdiccion, incluidas verificacion de edad, consentimiento y prohibiciones sobre contenido sintetico que represente a personas reales. El modelo no incorpora ningun filtro ni salvaguarda tecnica.
- Contenido no apto para todo publico: el repositorio esta etiquetado como `not-for-all-audiences` y las salidas son explicitas por diseno. No debe integrarse en productos accesibles a menores ni en entornos sin control de acceso.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados y sin revision por terceros. No hay evidencia independiente de que los checkpoints funcionen como se describe.
- Anomalia en los metadatos: las fechas de creacion y actualizacion registradas (2026-09-28) son futuras respecto a la mayoria de referencias del ecosistema, un dato que conviene tener en cuenta al citar el repositorio.
- Mantenimiento incierto: el repositorio se actualizo por ultima vez menos de un segundo despues de su creacion, lo que sugiere que no ha recibido mantenimiento posterior ni correcciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Metirofel/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guia de prompting incluida en el repositorio: https://huggingface.co/Metirofel/NSFW_Wan_1.3b/blob/main/prompting-guide.json
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Repositorio oficial de la familia Wan2.1: https://github.com/Wan-Video/Wan2.1

No se han encontrado papers, entradas de blog ni demos adicionales asociados a este modelo en la informacion disponible.

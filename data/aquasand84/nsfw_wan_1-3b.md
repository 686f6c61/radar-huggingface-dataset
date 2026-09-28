# AquaSand84/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b es un ajuste fino (*fine-tuning*) del modelo texto-a-vídeo Wan2.1-T2V-1.3B de Wan-AI, especializado en la generación de vídeo corto de contenido para adultos. Lo publica el usuario AquaSand84 en HuggingFace bajo licencia CreativeML OpenRAIL-M, con etiquetas explícitas de `nsfw` y `not-for-all-audiences`. El modelo conserva la arquitectura y el tamaño del modelo base: un transformer de difusión texto-a-vídeo de 1.300 millones de parámetros, distribuido como checkpoints `.safetensors` en un repositorio de 105,4 GB.

El objetivo declarado es servir como herramienta de investigación y creación capaz de generar clips breves coherentes a partir de descripciones en lenguaje natural dentro del dominio adulto, sin necesidad de LoRAs auxiliares para obtener movimiento nativo. El autor documenta dos ciclos de entrenamiento: uno original en dos fases (épocas 1-10 sobre imágenes, 11-20 sobre vídeo) con checkpoints `e1`-`e20`, y una segunda tanda experimental (`wan_1.3B_exp_e1` a `wan_1.3B_exp_e14`) entrenada con un dataset mixto para corregir la degradación anatómica observada en la primera.

Su relevancia es acotada pero concreta: es uno de los pocos fine-tunes públicos de texto-a-vídeo sobre un modelo abierto de 1,3 B orientados a contenido explícito, lo que lo convierte en material de estudio tanto para pipelines de generación de vídeo en GPU de consumo como para investigación en moderación de contenido y evaluación de seguridad. No se han publicado resultados de benchmarks, el repositorio acumula cero descargas en la información disponible y no hay validación independiente de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-video (segun la model card: "Text-to-Video Transformer Architecture"); heredada del modelo base Wan2.1-T2V-1.3B |
| Parametros totales | 1.300 millones (1,3 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje y la model card no documenta limite de tokens de prompt ni numero maximo de fotogramas |
| Tipos de cuantizacion | no disponibles en el repositorio; solo se distribuyen checkpoints en formato `.safetensors` |
| Idiomas soportados | no disponible; las leyendas del dataset de entrenamiento estan en ingles (convenciones de etiquetado de Reddit) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |
| Modalidad | texto a video (T2V) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Checkpoints incluidos | Serie experimental `wan_1.3B_exp_e1` a `wan_1.3B_exp_e14` (recomendado `wan_1.3B_exp_e14`); serie original `wan_1.3B_e1` a `wan_1.3B_e20`; archivo `prompting-guide.json` |
| Tamano del repositorio | 105,4 GB |
| Descargas / likes | 0 / 0 en la informacion proporcionada |
| Fecha de creacion y actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer de difusion texto-a-video de 1.300 millones de parametros, sin detallar el codificador de texto, el VAE ni la configuracion de atencion espaciotemporal empleados. Toda la informacion arquitectonica disponible se hereda implicitamente del modelo base Wan-AI/Wan2.1-T2V-1.3B; el autor no publica numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de preferencia (RLHF, DPO) o destilacion.

El entrenamiento documentado se divide en dos intentos. El primero, ya marcado como legado, uso dos fases secuenciales: las epocas 1-10 se ajustaron sobre un gran dataset de imagenes NSFW y las epocas 11-20 exclusivamente sobre video. El autor reconoce que la fase de imagen fue demasiado agresiva y provoco olvido catastrofico en la coherencia anatomica (rostros, manos), degradacion que la fase de video no logro revertir a partir de la epoca 3. El segundo intento, experimental, emplea una unica ejecucion sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes simultaneamente, con tasa de aprendizaje mas conservadora, lotes mas pequenos y un calendario de entrenamiento mas corto, con el objetivo de mantener regularizacion espacial constante y evitar la deriva anatomica.

Los datos de entrenamiento se describen como las 1.000 publicaciones mas destacadas de aproximadamente 1.250 subreddits NSFW distintas, con leyendas generadas siguiendo las convenciones de etiquetado de esas comunidades. El archivo `prompting-guide.json` recoge ese vocabulario para facilitar la redaccion de prompts. No se documentan filtros de consentimiento, verificacion de edad de las personas representadas ni procedencia licita de las imagenes y videos originales.

## Capacidades

- Generacion de video corto a partir de prompts de texto en lenguaje natural, con movimiento temporal nativo segun el autor (sin LoRAs auxiliares en la serie entrenada con video).
- Comprension de vocabulario y convenciones de etiquetado propias de comunidades de contenido adulto, recogidas en `prompting-guide.json`.
- Cobertura declarada de un espectro amplio de temas, estilos visuales, arquetipos de personaje y acciones dentro del dominio NSFW.
- Generacion de imagenes fijas coherentes en las epocas entrenadas solo con imagen (serie legada `e1`-`e3`, con calidad decreciente a partir de la epoca 3).
- Base para entrenamiento de LoRAs: el autor recomienda explicitamente `wan_1.3B_exp_e14` como punto de partida para ajustes posteriores.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- No hay capacidad de vision de entrada (image-to-video), audio, ni modo "thinking" documentada.
- Capacidades multilingues: no documentadas; los prompts eficaces segun el autor dependen del vocabulario en ingles de las comunidades de origen.

## Casos de uso

- Investigacion en moderacion de contenido: generar muestras sinteticas etiquetadas de contenido explicito para entrenar y evaluar clasificadores NSFW y sistemas de filtrado, aprovechando que el modelo produce variaciones controladas a partir de un prompt.
- Red teaming de sistemas de seguridad: probar si los filtros de una plataforma de generacion de video detectan y bloquean prompts y salidas de indole adulta, usando este modelo como generador adversario dentro de un entorno controlado.
- Previsualizacion en produccion de animacion para adultos: crear *animatics* de bajo coste (1,3 B de parametros) para validar encuadres, ritmo y continuidad antes de producir el plano definitivo con modelos mayores.
- Base para ajuste con LoRA: partir de `wan_1.3B_exp_e14` para entrenar estilos, personajes o esteticas concretas con presupuestos de GPU de consumo, dado el tamano reducido del modelo frente a alternativas de 14 B.
- Generacion de material para la industria del entretenimiento adulto: producir clips promocionales o *storyboards* en ciclos rapidos, siempre que se cumplan los requisitos legales de verificacion de edad y consentimiento de las personas representadas.
- Estudio de sesgos y representacion: analizar que arquetipos, cuerpos y practicas sobrerrepresenta el modelo como consecuencia de un dataset derivado de publicaciones populares de Reddit, y documentar estereotipos inducidos por el corpus.
- Pruebas de estres de pipelines de video: medir rendimiento, consumo de VRAM y estabilidad numerica de herramientas como Diffusers o ComfyUI con un modelo T2V de 1,3 B antes de escalar a modelos de mayor tamano.
- Docencia y divulgacion sobre IA generativa: ilustrar de forma controlada como el ajuste fino sobre dominios especificos degrada la coherencia visual y que estrategias (dataset mixto, LR conservadora) mitigan el olvido catastrofico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de FVD, CLIP score, evaluacion humana, MMLU ni ninguna otra metrica cuantitativa, ni comparaciones medidas contra el modelo base. La unica evaluacion es cualitativa y procede del propio autor, que afirma mejor coherencia espacial y movimiento estable en `wan_1.3B_exp_e14` frente a la serie original.

## Requisitos de hardware

- VRAM para inferencia: no verificada por el autor. Estimacion orientativa a partir de un transformer de difusion de 1,3 B: unos 3 GB solo para los pesos en precision de 16 bits, a los que se suman activaciones, el VAE y el codificador de texto del pipeline de Wan2.1, que no se incluyen cuantificados en este repositorio. En la practica, un presupuesto de 8-12 GB de VRAM es el punto de partida razonable para clips cortos a resolucion baja, y 16-24 GB para resoluciones o duraciones mayores.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070 Ti / 4080 (16 GB), RTX 4090 (24 GB) para uso en consumo; A100 40/80 GB o H100 para lotes y barridos de checkpoints.
- Compatibilidad con GPU de consumo: probable en tarjetas de 12 GB o mas con resolucion reducida y *offloading* de componentes a CPU; no confirmada por el autor.
- Opciones de despliegue: Diffusers (el modelo base Wan2.1 tiene soporte en la libreria), ComfyUI con nodos de Wan, y el repositorio oficial de Wan2.1. Ollama, llama.cpp, vLLM y TGI no son aplicables: son motores para modelos de lenguaje y este es un modelo de difusion de video.
- Latencia y throughput: no disponibles. Dependen de la GPU, la resolucion, el numero de fotogramas y el numero de pasos de muestreo, ninguno de los cuales se documenta.
- Almacenamiento: el repositorio ocupa 105,4 GB, por lo que conviene descargar solo los checkpoints necesarios (por ejemplo, `wan_1.3B_exp_e14.safetensors`) en lugar del arbol completo.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| NSFW_Wan_1.3b | 1,3 B | Texto a video | CreativeML OpenRAIL-M | Ajuste fino NSFW, 14 + 20 checkpoints publicados | HuggingFace, repositorio de 105,4 GB, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 B | Texto a video | Apache 2.0 (segun la informacion publica del modelo base; no verificable en los datos proporcionados) | Modelo base generalista, sin especializacion NSFW | HuggingFace y repositorio oficial |
| Wan-AI/Wan2.1-T2V-14B | 14 B | Texto a video | Apache 2.0 (segun la informacion publica del modelo base) | Modelo base generalista de mayor capacidad | HuggingFace |
| Otros fine-tunes NSFW de texto a video | no disponible | Texto a video | no disponible | no disponible | no disponible |

No se dispone de comparativas de rendimiento medidas entre estos modelos en la informacion proporcionada; las diferencias de licencia y de objetivo (generalista frente a especializado en contenido adulto) son el unico eje de comparacion contrastable.

## Limitaciones y advertencias

- Contenido explicito por diseno: el modelo genera material para adultos y su uso esta desaconsejado fuera de contextos con verificacion de edad y cumplimiento legal explicito.
- Riesgo grave de uso indebido: puede emplearse para generar contenido sexual no consentido, *deepfakes* de personas reales o material de explotacion. La licencia CreativeML OpenRAIL-M prohibe expresamente estas categorias, pero no existe ninguna barrera tecnica en el modelo.
- Procedencia del dataset: las 1.000 publicaciones destacadas de unas 1.250 subreddits NSFW no se documentan con consentimiento de las personas retratadas, licencia de las obras originales ni verificacion de edad. Esto traslada un riesgo legal y etico al usuario que lo despliegue.
- Artefactos conocidos: el propio autor documenta "body horror", distorsiones anatomicas y degradacion de la calidad en la serie original a partir de la epoca 3. Los checkpoints experimentales corrigen parcialmente el problema segun el autor, sin evaluacion independiente.
- Inconsistencia en la documentacion: la model card anuncia "Experimental Epochs 1-8" mientras lista checkpoints hasta `wan_1.3B_exp_e14`, y describe el entrenamiento con imagenes en las epocas 1-10 y con video en las 11-20; conviene tratar las cifras como no verificadas.
- Ausencia total de benchmarks: no hay metricas objetivas de calidad de video, coherencia temporal ni fidelidad al prompt.
- Sin validacion de la comunidad: cero descargas y cero likes en la informacion proporcionada; no hay informes de terceros sobre el comportamiento real del modelo.
- Idiomas: las capacidades multilingues no estan documentadas y las leyendas de entrenamiento estan en ingles, por lo que los prompts en castellano pueden degradar el resultado.
- Riesgo de sobreajuste al vocabulario de origen: el modelo esta entrenado sobre convenciones de etiquetado de comunidades concretas, lo que limita su respuesta a descripciones fuera de ese registro.
- Licencia: CreativeML OpenRAIL-M permite uso comercial, pero obliga a incluir las mismas restricciones de uso en cualquier modelo derivado, a acompanar la licencia en la redistribucion y a respetar la lista de usos prohibidos (contenido ilegal, dano a menores, informacion medica o legal sin supervision, entre otros). Cualquier LoRA o ajuste derivado debe heredar estas condiciones.
- Requisitos de cumplimiento: en la Union Europea, el despliegue puede quedar sujeto a las obligaciones de transparencia del Reglamento de IA para contenido sintetico, incluido el etiquetado de material generado.
- Volumen del repositorio: 105,4 GB de checkpoints, sin cuantizaciones publicadas, lo que complica el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AquaSand84/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guia de prompts incluida en el repositorio: `prompting-guide.json` (https://huggingface.co/AquaSand84/NSFW_Wan_1.3b/blob/main/prompting-guide.json)
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Papers, blogs, repositorios de codigo y demos asociados: no se han encontrado en la informacion disponible.

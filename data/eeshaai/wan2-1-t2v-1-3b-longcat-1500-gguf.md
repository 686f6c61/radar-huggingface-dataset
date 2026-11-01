# eeshaAI/Wan2.1-T2V-1.3B-LongCat-1500-GGUF

## Resumen

Wan2.1-T2V-1.3B-LongCat-1500-GGUF es una distribucion consolidada del modelo de generacion de video texto-a-video Wan 2.1 T2V 1.3B, publicado por el usuario eeshaAI. Consiste en el adaptador LoRA LongCat Step 1500 (rango 128, alpha 64, entrenado con GRPO) fusionado en los pesos BF16 originales de Wan-AI/Wan2.1-T2V-1.3B-Diffusers mediante `fuse_lora` con escala 1.0, y posteriormente cuantizado a formato GGUF. La metodologia es explicita: primero se fusiona el LoRA sobre los pesos de alta precision y despues se cuantiza, nunca al reves.

El modelo resuelve un problema de despliegue concreto: permitir inferencia de generacion de video en CPU sin GPU dedicada, empleando stable-diffusion.cpp con el modo `-M vid_gen` y un presupuesto de 8 GB de RAM para la variante Q4_K. El VAE de Wan se mantiene separado y el acondicionamiento de texto se suministra como embeddings externos de UMT5-XXL, de modo que el codificador de texto no se carga en el entorno de generacion.

Con 1.418.996.800 parametros y un repositorio de 7,5 GB, se trata de una variante ligera dentro de la familia Wan 2.1, orientada a prototipado y validacion de prompts mas que a produccion de video de alta fidelidad. La licencia del adaptador es MIT, mientras que los pesos fusionados heredan la licencia del modelo base Wan 2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-video (familia Wan 2.1) con VAE separado y codificador de texto UMT5-XXL |
| Parametros totales | 1.418.996.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; condicionamiento por embeddings de UMT5-XXL) |
| Tipos de cuantizacion | Q4_K, Q8_0 (GGUF); checkpoint fusionado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador LongCat); licencia del modelo base Wan 2.1 aplicable a los pesos fusionados |
| Formato de pesos | safetensors (BF16, formato Diffusers), GGUF (Q4_K, Q8_0), manifest.json con tamanos y SHA-256 |

## Arquitectura y entrenamiento

El modelo base Wan 2.1 T2V 1.3B es un modelo de difusion para generacion de video a partir de texto. Sobre el se aplico el adaptador LoRA LongCat Step 1500, de rango 128 y alpha 64, entrenado con GRPO (Group Relative Policy Optimization), un esquema de aprendizaje por refuerzo. La fusion se realizo con la utilidad `fuse_lora` de Diffusers a escala 1.0 sobre los pesos BF16 originales, garantizando que la cuantizacion posterior no degrade la contribucion del adaptador.

La innovacion tecnica principal de esta distribucion es la separacion de responsabilidades en el pipeline: el VAE se mantiene fuera del proceso de generacion, el codificador UMT5-XXL se ejecuta en una etapa previa que produce embeddings de prompt en formato SDPE, y la generacion corre en stable-diffusion.cpp (parche `--prompt-embeds`, commit e239e4b) con salida final codificada a MP4 mediante FFmpeg. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de descripciones textuales, con resoluciones de trabajo como 480x832 y 480x272.
- Control de duracion mediante numero de frames (escalera progresiva recomendada de 1/9/17/33/81 frames) y tasa de 16 FPS.
- Control de calidad y adherencia al prompt mediante pasos de muestreo y CFG (configuracion recomendada: 50 pasos, CFG 4.5, semilla fija).
- Inferencia exclusiva en CPU mediante stable-diffusion.cpp con el modo `-M vid_gen`.
- Acondicionamiento de texto desacoplado: los embeddings UMT5-XXL se generan por separado y se inyectan via `--prompt-embeds`.
- Verificacion de calidad asistida por VLM: comparacion de frames muestreados (incluidos primero y ultimo) contra el prompt original para dictaminar presencia de sujeto, movimiento y fidelidad.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Prototipado de prompts en entornos sin GPU: el modelo permite iterar sobre descripciones textuales y validar movimiento y composicion en CPU, con la variante Q4_K ajustada a un presupuesto de 8 GB de RAM.
- Validacion de pipelines de generacion de video antes de escalar a modelos mayores: sirve como banco de pruebas para el motor forgeyn-video-engine, la orquestacion del sandbox y el formato de embeddings SDPE.
- Generacion de clips de smoke test en CI: secuencias cortas de 1 a 17 frames con semilla fija permiten comprobar de forma reproducible que el pipeline de inferencia, el VAE y la codificacion MP4 funcionan tras un cambio de codigo.
- Auditoria automatizada de fidelidad prompt-video: el arnes de verificacion con VLM puede integrarse en flujos de evaluacion para detectar regresiones en la adherencia al prompt entre versiones del modelo o del motor.
- Educacion y demostraciones de difusion texto-a-video: la licencia MIT del adaptador y la disponibilidad en GGUF facilitan su uso en talleres y material docente sin infraestructura especializada.
- Investigacion sobre cuantizacion de modelos de video: la comparacion directa Q4_K frente a Q8_0 sobre los mismos pesos fusionados permite estudiar el impacto de la precision en la calidad perceptual y en el tiempo de pared.
- Generacion de video de baja resolucion para previsualizacion de storyboards: a 480x272 y pocos frames se obtienen borradores de movimiento que luego pueden refinarse con modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye, en cambio, evidencias de ejecucion en CPU con veredicto de un VLM:

| Prompt | Frames / pasos | Tiempo de pared | Veredicto VLM |
|---|---|---|---|
| A red fox trotting through fresh snow in a birch forest | 5 / 10 | ~5,5 min | sujeto y movimiento presentes |
| A cinematic drone shot gliding over a foggy pine forest | 5 / 10 | ~5,5 min | sujeto y movimiento presentes |
| A bird flying | 17 / 12 | ~20 min | parcial: el pajaro aparece tarde como silueta lejana, fidelidad debil |

Las mediciones se realizaron en 4 vCPU a 480x272, con acondicionamiento UMT5-XXL interno del motor y stable-diffusion.cpp parcheado en el commit e239e4b. El autor advierte que el coste de CPU crece de forma superlineal con la duracion de la secuencia.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario documentado, que es inferencia exclusiva en CPU; el presupuesto declarado para Q4_K es de 8 GB de RAM.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor no documenta ruta GPU para esta distribucion.
- Compatibilidad con GPU de consumo: no documentada.
- CPU de referencia: 4 vCPU para los tiempos de la tabla anterior.
- Opciones de despliegue: stable-diffusion.cpp (modo `-M vid_gen`, parche `--prompt-embeds`), con VAE separado y embeddings UMT5-XXL generados en una etapa previa; FFmpeg para la codificacion final a MP4. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de video.
- Latencia y throughput: aproximadamente 5,5 minutos para 5 frames y 10 pasos, y aproximadamente 20 minutos para 17 frames y 12 pasos, en 4 vCPU a 480x272.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Inferencia CPU | Licencia | Notas |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B-LongCat-1500-GGUF (este) | 1.418.996.800 | GGUF Q4_K/Q8_0, BF16 | Si, via stable-diffusion.cpp | MIT (adaptador) + licencia base Wan 2.1 | LoRA LongCat fusionado antes de cuantizar |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.418.996.800 | safetensors BF16 | No documentado en esta ficha | Licencia Wan 2.1 | Modelo base sin el adaptador LongCat |
| lightx2v/Wan2.1-T2V-1.3B-longcat-step1500 | no disponible | no disponible | no disponible | no disponible | Adaptador LoRA original, sin fusionar ni cuantizar |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Fidelidad limitada al prompt: el propio autor reconoce detalle debil y aparicion tardia de sujetos, con el caso del pajaro calificado como fidelidad parcial.
- Coste de CPU superlineal con la duracion: secuencias largas pueden volverse inviables en hardware modesto; se recomienda validar con la escalera progresiva de frames.
- Resolucion de trabajo baja en el escenario documentado (480x272), no apta para produccion de video final de alta calidad.
- Licencia dual efectiva: el adaptador es MIT, pero los pesos fusionados quedan sujetos a la licencia del modelo base Wan 2.1, que debe revisarse antes de uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingue del acondicionamiento de texto no esta verificado.
- Dependencia de un parche concreto de stable-diffusion.cpp (commit e239e4b) y del formato de embeddings SDPE, lo que reduce la portabilidad del pipeline.
- Riesgo de sesgos y alucinacion visual inherente al modelo base y al adaptador entrenado con GRPO; no se documentan evaluaciones de sesgo.
- Adopcion muy baja (19 descargas, 0 likes) y ausencia de validacion independiente; tratar como artefacto experimental.
- No se documentan capacidades de tool calling, agentes ni audio, por lo que no debe considerarse un modelo multimodal general.

## Enlaces

- HuggingFace: https://huggingface.co/eeshaAI/Wan2.1-T2V-1.3B-LongCat-1500-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Adaptador LoRA original: https://huggingface.co/lightx2v/Wan2.1-T2V-1.3B-longcat-step1500
- Motor de inferencia: https://github.com/Fuhad-Lab/forgeyn-video-engine
- Documentacion del playground: `forgeyn/docs/PLAYGROUND.md` en el repositorio anterior
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp

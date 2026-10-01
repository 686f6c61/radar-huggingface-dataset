# chriswritescode/Turbo8-LoRA-Qwen-Image-2.1

## Resumen

Turbo8 es una LoRA de destilacion de pasos (step-distillation) para el modelo de generacion de imagen Qwen-Image-2.1, publicada por el usuario chriswritescode. Su objetivo es reducir el coste de inferencia del modelo base: donde Qwen-Image-2.1 necesita 40 pasos de muestreo, Turbo8 genera imagenes con 8 pasos y CFG 1, lo que supone una aceleracion de aproximadamente 5x sin cambiar de modelo ni de pipeline. No se trata de un modelo independiente, sino de un adaptador que se carga sobre los pesos congelados del transformer DiT de Qwen-Image-2.1 (32 capas single-stream, 7B parametros en el componente de generacion visual).

El adaptador cubre todas las funciones del modelo base: text-to-image hasta 2K nativo, renderizado de texto en ingles y chino, edicion de imagen con hasta 10 imagenes de referencia, y generacion con transparencia (RGBA) y extraccion de sujetos. Se distribuye como un unico fichero safetensors de rank 128, con workflows listos para ComfyUI y codigo de ejemplo para la libreria diffusers.

Su relevancia actual reside en que permite desplegar generacion y edicion de imagen de alta resolucion con un coste computacional muy inferior al del modelo base, manteniendo una fidelidad cercana al profesor en metricas como CLIPScore (identico) o PickScore en T2I (21,94 frente a 22,15). La contrapartida principal es una degradacion notable en texto denso o largo (exact match cae del 95% al 75%) y el hecho de que la licencia Qwen Research restringe el uso a investigacion y evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de destilacion sobre transformer DiT (Qwen-Image-2.1, 32 capas single-stream DiT, componente visual de 7B) |
| Parametros totales | no disponible para la LoRA (rank 128, alpha 128); el modelo base Qwen-Image-2.1 tiene 7B en el componente de generacion visual |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del encoder de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y chino para renderizado de texto; no disponible el resto de idiomas |
| Licencia | Qwen Research License (uso no comercial, solo investigacion y evaluacion) |
| Formato de pesos | safetensors (LoRA para diffusers/ComfyUI) |

## Arquitectura y entrenamiento

Turbo8 no modifica la arquitectura del modelo base: es una LoRA de rango 128 y alpha 128 aplicada sobre las capas de atencion, MLP, modulacion y embedding de timestep del transformer DiT de Qwen-Image-2.1, cuyos pesos permanecen congelados. La destilacion se realizo en tres etapas: primero se registraron 3.100 renderizados del profesor (40 pasos con ruido fijo) en los 8 niveles de ruido del estudiante; despues se hizo una inicializacion por regresion de trayectoria ODE durante 3.000 pasos; y finalmente un ajuste DMD2 de 2.500 pasos con un critico de tipo fake-score implementado como una segunda LoRA sobre el mismo transformer, una cabeza GAN sobre las caracteristicas del critico con los renderizados del profesor como muestras reales, y la regresion de trayectoria mantenida como ancla con peso 6 y actualizaciones del generador balanceadas por tarea.

Los datos de entrenamiento combinan prompts de k-mktr/improved-flux-prompts y PartiPrompts, ediciones de TIGER-Lab/OmniEdit-Filtered-1.2M (con o_score >= 9), conjuntos sinteticos de sujetos RGBA, extraccion y edicion transparente, y aproximadamente 860 prompts de renderizado de texto escritos por Qwen3-VL. El entrenamiento se hizo a 1 MP mas 2K, y todos los objetivos provienen del propio profesor. El hardware empleado fue una RTX PRO 6000 Blackwell (96 GB) para el entrenamiento y una RTX 6000 Ada para las trayectorias y la evaluacion.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) hasta resolucion nativa 2K.
- Renderizado de texto dentro de la imagen en ingles y chino, fiable en titulares, carteles y etiquetas cortas.
- Edicion de imagen con hasta 10 imagenes de referencia.
- Generacion con canal alfa (RGBA) y fondos transparentes.
- Extraccion de sujetos a partir de una fotografia, con salida transparente.
- Funciona con plantillas de prompt especificas para transparencia y extraccion, identicas a las del modelo base.
- Inferencia rapida: 8 pasos con CFG 1 (frente a los 40 pasos del modelo base).
- No se documentan capacidades de tool calling, agentes, audio ni vision de entrada mas alla de las imagenes de referencia para edicion.

## Casos de uso

- Generacion de imagenes para prototipado rapido: al reducir de 40 a 8 pasos, permite iterar sobre variaciones de un prompt con un coste de computo unas 5x menor, adecuado para exploracion de disenos en fases tempranas.
- Creacion de activos con fondo transparente: mediante la plantilla RGBA, se pueden generar productos, personajes o iconos listos para composicion en herramientas de diseno sin postproceso de recorte.
- Extraccion de sujetos para catalogos de e-commerce: a partir de una fotografia de producto, el modelo genera un cutout con alpha, util para normalizar imagenes de catalogo.
- Edicion de imagenes asistida por referencia: con hasta 10 imagenes de referencia, se pueden aplicar cambios de estilo, composicion o sujeto en flujos de retoque semiautomaticos.
- Renderizado de texto en carteles y etiquetas: para rotulos, senaletica o packaging con titulares cortos en ingles o chino, donde la fidelidad de caracteres se mantiene en torno al 95,3%.
- Integracion en ComfyUI para pipelines de produccion visual: los workflows incluidos (turbo8_t2i.json y turbo8_edit.json) permiten desplegar generacion y edicion con ajustes fijos de 8 pasos, CFG 1, sampler euler y scheduler simple.
- Evaluacion e investigacion en destilacion de difusion: al estar bajo Qwen Research License, es adecuado como objeto de estudio para tecnicas DMD2 y comparacion profesor-estudiante.

## Benchmarks y rendimiento

Evaluacion offline sobre 192 prompts reservados (64 de DrawBench mas 24 semillas extra, 40 de renderizado de texto con 7 en chino, 24 RGBA de GenEval-subject, 24 ediciones de OmniEdit y 16 extracciones). El profesor es el modelo base a 40 pasos.

| Metrica | Profesor (40 pasos) | Turbo8 (8 pasos) |
|---|---|---|
| PickScore, T2I | 22,15 | 21,94 |
| CLIPScore, T2I | 26,89 | 26,89 |
| PickScore, RGBA | 20,51 | 20,07 |
| Exact match de texto (OCR por Qwen3-VL) | 95,0% | 75,0% |
| Precision de caracteres de texto | 99,6% | 95,3% |
| Tasa de transparencia (RGBA + extraccion) | 0,875 | 0,925 |
| Diversidad por semilla (similitud DINOv2, menor = mas variada) | 0,705 | 0,670 |
| Similitud de edicion respecto al profesor (DINOv2) | — | 0,967 |
| IoU de alpha en extraccion frente al profesor | — | 0,85 |

## Requisitos de hardware

- El repositorio de la LoRA ocupa 1,4 GB; el peso real de inferencia esta dominado por el modelo base Qwen-Image-2.1 (componente visual de 7B), que en bf16 ronda los 14 GB, mas el encoder de texto y el VAE del pipeline.
- Tiempo de referencia del autor: una imagen de 1024² tarda aproximadamente 4 segundos en una RTX PRO 6000 (96 GB) con ComfyUI 0.36.0.
- La LoRA se entreno con una RTX PRO 6000 Blackwell (96 GB) y se evaluo con una RTX 6000 Ada; no se documenta el rendimiento en GPUs de gama consumer.
- El modelo card no especifica requisitos de VRAM para consumer GPU; se puede usar con precision bf16, pero para GPUs de 24 GB o menos probablemente sea necesario recurrir a offloading de componentes o cuantizacion del modelo base, dato no confirmado.
- Opciones de despliegue documentadas: ComfyUI (workflows turbo8_t2i.json y turbo8_edit.json) y libreria diffusers con QwenImage21Pipeline y FlowMatchEulerDiscreteScheduler.
- Configuracion obligatoria: 8 pasos, CFG 1, sampler euler, scheduler simple, y shift_terminal=None en diffusers. El workflow T2I incluye un nodo ModelSamplingFlux con max_shift 0.6935 y base_shift 0.5, cableado a ancho y alto, que reproduce el schedule de ruido dependiente de resolucion con el que se entreno la LoRA, incluso a 2K.
- En ComfyUI se mapean las 227 capas de la LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Rendimiento T2I | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turbo8 (esta LoRA) | LoRA rank 128 sobre Qwen-Image-2.1 (7B visual) | hasta 2K nativo, 8 pasos | PickScore 21,94 / CLIPScore 26,89 | Qwen Research (no comercial) | HuggingFace, ComfyUI, diffusers |
| Qwen-Image-2.1 (base) | 7B visual, 32 capas DiT | hasta 2K nativo, 40 pasos | PickScore 22,15 / CLIPScore 26,89 | Qwen Research | HuggingFace, repositorio oficial QwenLM |
| Otras LoRA de 8 pasos para Qwen-Image-2.1 (Viggle, Pruna AI) | no disponible | no disponible | no disponible | no disponible | mencionadas en Civitai, datos no disponibles |

La comparacion directa con las alternativas de 8 pasos para Qwen-Image-2.1 no puede cuantificarse: la model card no aporta cifras frente a ellas, y los resultados publicos encontrados son solo referencias cualitativas.

## Limitaciones y advertencias

- Texto denso o largo (parrafos, letra pequena) se degrada mucho mas que a 40 pasos; el exact match de texto cae del 95,0% al 75,0%. Solo titulares, carteles y etiquetas cortas son fiables.
- En escenas complejas la composicion puede diferir de la del profesor para la misma semilla.
- La extraccion hereda los fallos del modelo base: en la evaluacion, 3 de 16 extracciones salieron vacias tanto en el profesor como en Turbo8; ademas, Turbo8 a veces incluye mas contexto circundante en el recorte que el profesor.
- Esta ajustada especificamente para 8 pasos y CFG 1; usar mas pasos o un CFG superior a 1 no mejora los resultados.
- Requiere obligatoriamente shift_terminal=None en diffusers, ya que la LoRA se destilo sobre el schedule base sin el estiramiento terminal.
- Licencia Qwen Research License: uso exclusivo para investigacion y evaluacion no comercial. Para uso comercial es necesario obtener una licencia de Qwen (model-business@notice.qwencloud.com).
- Al ser un derivado de Qwen-Image-2.1, hereda los sesgos y riesgos de alucinacion del modelo base, no desglosados en la informacion disponible.
- No se documentan los idiomas soportados mas alla del renderizado de texto en ingles y chino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chriswritescode/Turbo8-LoRA-Qwen-Image-2.1
- Ficheros del repositorio: https://huggingface.co/chriswritescode/Turbo8-LoRA-Qwen-Image-2.1/tree/main
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Dataset de prompts k-mktr/improved-flux-prompts: https://huggingface.co/datasets/k-mktr/improved-flux-prompts
- Dataset TIGER-Lab/OmniEdit-Filtered-1.2M: https://huggingface.co/datasets/TIGER-Lab/OmniEdit-Filtered-1.2M
- Entrada en Civitai (Qwen Image 2.1 Turbo 8 Step LoRA): https://civitai.com/models/2967979/qwen-image-21-turbo-8-step-lora
- Ficha en free2aitools: https://free2aitools.com/model/chriswritescode/turbo8-lora-qwen-image-2.1

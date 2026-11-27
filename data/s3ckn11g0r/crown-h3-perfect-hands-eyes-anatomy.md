# S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy

## Resumen

CROWN-H3-Perfect-Hands-Eyes-Anatomy es un LoRA (Low-Rank Adaptation) desarrollado por S3ckn11g0r, bajo la marca NineCrowns (CROWN), que actua como adaptador sobre el modelo de generacion de video MiniMaxAI/MiniMax-H3. No es un modelo autonomo, sino un conjunto de pesos de adaptacion (910,06 MB en formato safetensors) disenado para corregir dos problemas concretos del modelo base: la deformacion y fusion de dedos en manos durante movimiento rapido y la falta de viveza en la mirada (ojos vidriosos o sin reflejos de iris). El adaptador se entrena especificamente sobre material de video de alta velocidad de obturación (1/1000 s) para preservar la articulacion anatomica de los cinco dedos.

El modelo resuelve un cuello de botella practico en la generacion text-to-video de contenido humano: las manos y los ojos son las regiones donde los modelos de difusion de video fallan con mayor frecuencia, produciendo manos con seis dedos, dedos fundidos o rostros con mirada inerte. Este LoRA se activa mediante la palabra clave `crown_perfect_hands_eyes` y esta pensado para integrarse en flujos de trabajo de ComfyUI, con compatibilidad declarada para los modos Ref2VA, I2VA y T2VA del modelo base MiniMax-H3.

Su relevancia actual radica en que la generacion de video con IA esta entrando en produccion para contenido de redes sociales (vlogs, bailes, planos cortos de actuacion), donde la calidad de manos y ojos es el principal indicador de realismo percibido. El adaptador se distribuye con una licencia bespoke-lora-license, lo que exige revisar los terminos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion de video; rango 64, alpha 64, aplicado a bloques video-only 10-49 |
| Parametros totales | no disponible (pesos del adaptador: 910,06 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el modelo base usa bf16 y fp32 en sus componentes) |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_Perfect_Hands_Eyes_Anatomy_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 que se inyecta exclusivamente en los bloques video-only 10 a 49 del modelo base MiniMax-H3, combinado con un Ostris De-Distillation Adapter. El entrenamiento se realizo sobre un cluster de 8 GPU NVIDIA B200, a una resolucion de 768x1344 (denominada por el autor "True 768P"), partiendo de material original de 1080P y 4K sin marca de agua: videos de alta velocidad de obturación de bailes de dedos (gesture dance) y primeros planos de gestos de manos y microexpresiones faciales procedentes de Douyin y TikTok. La eleccion de material a 1/1000 s de velocidad de obturación es deliberada: congela el movimiento de los dedos y permite al adaptador aprender contornos de nudillos y unas bien definidos en lugar de desenfoques de movimiento.

La innovacion principal no esta en la arquitectura (es un LoRA convencional) sino en la curaduria del dataset y en el objetivo de entrenamiento: forzar la separacion anatomica de los cinco dedos de cada mano y reforzar los reflejos especulares del iris y el parpadeo fisiologico natural (ritmo de aproximadamente 3 segundos). El adaptador declara compatibilidad de apilamiento con otros LoRA de personaje o estilo, y funciona de forma independiente en los tres modos de inferencia del modelo base (Ref2VA, I2VA y T2VA).

## Capacidades

- Generacion text-to-video con manos anatomicamente correctas: cinco dedos separados por mano, contornos de nudillos nitidos y unas definidas durante gestos rapidos como corazones con los dedos, signos de victoria, saludos y poses con las manos en las mejillas.
- Mejora de la mirada: reflejos luminosos en el iris, parpadeo natural cada aproximadamente 3 segundos y guinos expresivos sin distorsion facial.
- Reduccion de artefactos tipicos del modelo base: elimina manos con seis dedos, dedos fundidos y desenfoque de movimiento en las manos.
- Compatibilidad con tres modos del modelo base: referencia a video y audio (Ref2VA), imagen a video y audio (I2VA) y texto a video y audio (T2VA).
- Apilamiento con otros LoRA: puede combinarse con adaptadores de personaje o de estilo sin conflicto declarado.
- Activacion mediante palabra clave: `crown_perfect_hands_eyes`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio mas alla del propio del modelo base.

## Casos de uso

- Contenido de danza y baile para redes sociales: el adaptador mantiene los dedos separados y nitidos en coreografias de gestos rapidos, donde el modelo base produce fusiones. Se usa con el prompt de activacion y un peso de LoRA de 0,70 a 0,80.
- Vlogs y primeros planos de actuacion: corrige la mirada vidriosa en planos cercanos de rostro, anadiendo reflejos de iris y parpadeo natural, lo que mejora la percepcion de realismo en contenido hablado a camara.
- Generacion de material promocional con gestos de producto: poses de manos sosteniendo o senalando objetos (unboxing, demostraciones) se benefician de la articulacion de dedos aprendida del dataset de gestos.
- Postproduccion y regeneracion selectiva: integrado en ComfyUI, permite regenerar tomas donde las manos del modelo base fallan sin rehacer la secuencia completa, apilando el LoRA sobre el flujo existente.
- Creacion de avatares y personajes virtuales: al combinarse con LoRA de personaje, mantiene la identidad del sujeto mientras corrige manos y ojos en planos de baile o gesticulacion.
- Prototipado rapido de storyboards animados: en modo T2VA, genera clips de 768x1344 con figuras humanas gesticulando de forma creible para previsualizar escenas antes de produccion.
- Demostraciones de producto con referencia de imagen: en modo I2VA, parte de una imagen fija de una persona y anima gestos de manos y mirada con la correccion anatomica del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FVD, CLIP score, evaluaciones humanas) en la model card; solo describe cualitativamente la correccion de manos y ojos y muestra un video de demostracion generado exclusivamente con este LoRA a peso 0,75.

## Requisitos de hardware

- El adaptador en si ocupa 910,06 MB en safetensors y se carga junto al modelo base; la VRAM real la determina MiniMax-H3, no el LoRA.
- El autor entreno el adaptador en un cluster de 8 GPU NVIDIA B200, lo que indica que el modelo base completo es de gran escala y no cabe en GPU de consumo.
- El modelo base declarado en la configuracion de prueba incluye `minimax_h3_ref2va_bf16.safetensors`, `qwen3vl_32b_minimax_h3_bf16.safetensors` (un codificador de texto de 32B) y `minimax_h3_video_vae_fp32.safetensors`; solo el codificador de texto de 32B en bf16 ya requiere aproximadamente 64 GB de VRAM, por lo que se necesita hardware de clase profesional (A100 80 GB, H100, B200) o servicios en la nube.
- No cabe en GPU de consumo (RTX 4090, 3090) en su configuracion completa; el autor remite a plataformas en la nube (RunningHub) y a un servicio no oficial para usuarios con GPU limitada.
- Opciones de despliegue: ComfyUI (flujo de trabajo principal, con workflow en la nube publicado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Parametros de inferencia recomendados por el autor: 768x1344 o 1344x768, 25 pasos, sampler euler con beta, cfg 1.0, MiniMaxH3SigmaShift con shift_video 12.0 y shift_audio 3.0, peso de LoRA 0,70-0,80.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA comparables para MiniMax-H3 en la documentacion proporcionada. La comparativa se limita a contrastar el adaptador con el modelo base sin adaptar:

| Modelo | Tipo | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| CROWN-H3-Perfect-Hands-Eyes-Anatomy | LoRA r64 sobre MiniMax-H3 | Corrige manos y ojos en generacion de video | bespoke-lora-license | Hugging Face, RunningHub, Civitai |
| MiniMax-H3 (base) | Modelo de difusion text-to-video | Generacion de video con audio | no disponible en la informacion | Hugging Face (MiniMaxAI) |
| Otros LoRA de MiniMax-H3 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el modelo base MiniMax-H3 y su codificador de texto Qwen3-VL de 32B, con el coste de hardware asociado.
- El entrenamiento se centro en material de danza de dedos y primeros planos faciales de origen Douyin/TikTok; puede introducir sesgos esteticos (unas manicuradas, estilos de maquillaje, tipos de rostro) y no garantiza correccion anatomica en otros contextos (manos con objetos, manos de ancianos, piel con texturas distintas).
- Riesgo de sobreajuste al estilo del dataset: el peso recomendado de 0,70-0,80 sugiere que valores mas altos pueden degradar la naturalidad; no se documentan pruebas fuera de ese rango.
- La licencia bespoke-lora-license es personalizada y remite a la pagina de Civitai del autor; no se detallan en la informacion los terminos de uso comercial, por lo que es obligatorio revisarlos antes de produccion.
- No se documentan evaluaciones cuantitativas ni comparaciones con alternativas; la eficacia se respalda solo con un video de demostracion.
- El autor incluye enlaces a plataformas de terceros (RunningHub y un servicio no oficial) cuya fiabilidad y condiciones no estan verificadas.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del adaptador con prompts en castellano.
- La model card incluye afirmaciones de marketing (correccion "definitiva" de seis dedos) que no estan respaldadas por metricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Civitai oficial: https://civitai.com/models/3044609
- Perfil del autor en Civitai: https://civitai.com/user/NineCrowns
- RunningHub Global (LoRA): https://www.runninghub.ai/model/public/2120439889498419201
- RunningHub Global (workflow ComfyUI): https://www.runninghub.ai/workflow/2120529947085676546
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529962406330370
- RunningHub China (LoRA): https://www.runninghub.cn/model/public/2120452728542552066
- RunningHub China (workflow): https://www.runninghub.cn/workflow/2120527519433707522
- RunningHub China (webapp): https://www.runninghub.cn/ai-detail/2120527536550670338
- Servicio de terceros mencionado por el autor: https://h3xron.xyz

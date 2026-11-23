# BH-Language-AI/lumi-vl-8b-cua-4mp-gentle

## Resumen

Lumi VL 8B CUA 4MP Gentle es un adaptador LoRA experimental publicado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-9B, orientado a tareas de computer-use agents (CUA) y GUI grounding. El adaptador se entrena para localizar elementos de interfaz en capturas de pantalla de alta resolucion (4 megapixeles) y devolver coordenadas utilizables por un agente que opera raton y teclado. El nombre "gentle" hace referencia a un ajuste fino conservador con learning rate bajo (3e-6) y solo 150 pasos, disenado para verificar que una etapa previa de entrenamiento no degradaba el modelo por un exceso de learning rate.

El modelo base Qwen3.5-9B es un transformer multimodal (vision + texto) de 9,41 mil millones de parametros, 32 capas, dimension oculta 4096 y una ventana de contexto de 262 144 tokens, con pesos en bf16 de aproximadamente 18,8 GB. El adaptador en si es un fichero PEFT de 0,5 GB, lo que indica que solo se distribuyen los pesos LoRA y no el modelo completo.

Su relevancia es acotada: se trata de un artefacto de investigacion que documenta un punto concreto de una cadena de entrenamiento incremental (de 2,5 % a 64,5 % en ScreenSpot-Pro) y que el propio autor declara no apto para produccion. Resulta util para quien quiera reproducir el ajuste, estudiar la sensibilidad al learning rate en LoRA sobre tareas de grounding o comparar etapas de entrenamiento, pero no como componente de un sistema desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) del modelo base; adaptador LoRA (PEFT) |
| Parametros totales | 9,41 B (modelo base Qwen3.5-9B); el adaptador LoRA ocupa 0,5 GB en el repo |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Capas | 32 (modelo base) |
| Dimension oculta | 4096 (modelo base) |
| Precision del base | bf16, ~18,8 GB |
| Resolucion de imagen objetivo | 4 megapixeles |
| Hiperparametros de entrenamiento | 150 pasos, learning rate 3e-6 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer multimodal que procesa imagenes y texto con 32 capas, hidden size de 4096 y contexto de 262k tokens. El entrenamiento corresponde a la etapa 6 de un ciclo incremental de ajuste para GUI grounding: el autor parte del modelo base (2,5 % de acierto en ScreenSpot-Pro), pasa por una etapa 1 (39 %) y una etapa 2 a 2 MP (51,25 %) y a 4 MP (64,5 %). Esta etapa 6 se ejecuta sobre la configuracion de 4 MP con solo 150 pasos y un learning rate de 3e-6, deliberadamente bajo.

El objetivo declarado del experimento es aislar la causa de un deterioro observado en etapas intermedias: los resultados muestran que con lr 3e-6 la metrica se mantiene en 64,5 % (258/400), identica a la etapa 2, lo que el autor interpreta como evidencia de que la degradacion previa provenia de un learning rate demasiado alto y no de los datos. No se detalla en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO; el tag `lora` y la libreria `peft` confirman que el ajuste es de bajo rango sobre los pesos del base.

## Capacidades

- GUI grounding: localizacion de elementos de interfaz en capturas de pantalla a 4 MP, devolviendo coordenadas para acciones de un agente.
- Computer-use agents: soporte para el bucle percibir-decidir-actuar sobre entornos graficos.
- Comprension de imagen y texto: heredada del modelo base multimodal Qwen3.5-9B.
- Contexto largo: hasta 262 144 tokens del modelo base, util para historiales de interaccion o capturas con metadatos extensos.
- Tool calling / function calling: no confirmado para este adaptador en la informacion disponible.
- Razonamiento multi-paso y modo thinking: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Evaluacion de sensibilidad al learning rate en LoRA: el adaptador sirve como referencia reproducible de una etapa con lr 3e-6 y 150 pasos, para comparar curvas de grounding frente a etapas con lr mas alto y detectar sobreajuste o degradacion.
- Investigacion en GUI grounding a alta resolucion: permite estudiar como influye pasar de 2 MP a 4 MP en la precision de localizacion de elementos, usando ScreenSpot-Pro como banco de referencia con 400 muestras.
- Reproduccion de cadenas de entrenamiento incremental: util para replicar el pipeline base -> etapa 1 -> etapa 2 (2 MP y 4 MP) y verificar los porcentajes reportados (2,5 %, 39 %, 51,25 %, 64,5 %).
- Prototipado de agentes de automatizacion de escritorio: en entornos controlados y no productivos, para probar la integracion de un cabezal de grounding con un orquestador que ejecute clics y escritura.
- Analisis de estabilidad de adaptadores PEFT: al no modificar la metrica respecto a la etapa 2, es un caso de estudio de adaptadores de bajo rango que actuan como "no-op" funcional, util para calibrar criterios de aceptacion de checkpoints.
- Docencia y formacion tecnica: ejemplo documentado de ajuste fino multimodal con hiperparametros conservadores y de como interpretar una metrica estancada como senal de learning rate inadecuado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ScreenSpot-Pro (400 muestras, 4 MP) | 64,5 % (258/400) | Identico a Stage-2 @4MP |
| Etapa previa: base | 2,5 % | Punto de partida del ciclo |
| Etapa 1 | 39 % | Primera etapa de ajuste |
| Stage-2 @2MP | 51,25 % | Etapa intermedia |
| Stage-2 @4MP | 64,5 % | Referencia de produccion segun el autor |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en bf16 requiere aproximadamente 18,8 GB solo para pesos, mas memoria para el adaptador (0,5 GB) y para el procesamiento de imagenes a 4 MP; se recomienda un margen adicional para el cache de atencion y los tensores de vision.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 sin cuantizar; en GPUs de 24 GB seria necesario cuantizar el base (no se proporcionan ficheros GGUF ni cuantizaciones en el repo).
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16 con margen para vision a 4 MP; podria intentarse con cuantizacion de 8 o 4 bits, aunque no hay artefactos publicados que lo soporten.
- Despliegue: al ser un adaptador PEFT, requiere cargar Qwen3.5-9B y aplicar el adaptador con la libreria `peft`; para servirlo en produccion haria falta un servidor compatible con modelos multimodales (vLLM, TGI u otro con soporte de vision), no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El procesamiento de imagenes de 4 MP anade coste de preprocesado y de atencion sobre un numero elevado de tokens visuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumi VL 8B CUA 4MP Gentle (este) | 9,41 B (base) + LoRA | 262 144 | GUI grounding 4 MP, experimental | no disponible | Hugging Face, 0 descargas |
| Lumi VL 8B CUA (Stage-2) | 9,41 B (base) + LoRA | 262 144 | GUI grounding 4 MP, referencia de produccion del autor | no disponible | Hugging Face (repo del autor) |
| Qwen3.5-9B (base) | 9,41 B | 262 144 | Multimodal generalista | no disponible | Hugging Face |
| Otros CUA/GUI grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas especializadas en computer-use (por ejemplo, familias tipo OS-Atlas o UI-TARS) no puede completarse con la informacion proporcionada; no se dispone de sus cifras en este contexto.

## Limitaciones y advertencias

- Estado experimental: el propio autor indica que no se recomienda para produccion y que la referencia operativa es Stage-2 (`BH-Language-AI/lumi-vl-8b-cua`).
- Sin mejora medible: la metrica es identica a la etapa 2 (64,5 %), por lo que este checkpoint no aporta ganancia funcional; su valor es diagnostico.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion; hay que verificar la licencia del modelo base Qwen3.5-9B por separado.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue del adaptador.
- Riesgo de alucinacion: como modelo multimodal generativo, puede producir coordenadas plausibles pero incorrectas en interfaces no vistas; el 64,5 % en ScreenSpot-Pro implica que aproximadamente uno de cada tres casos falla.
- Dependencia de resolucion: el adaptador esta ajustado a 4 MP; su comportamiento a otras resoluciones no esta documentado.
- Coste de inferencia elevado: 18,8 GB en bf16 mas procesamiento de imagenes grandes limita el despliegue en hardware de consumo.
- Sin datos de sesgo, seguridad ni evaluaciones adicionales en la informacion disponible.
- Repo con 0 descargas y 0 likes: no hay evidencia de validacion externa ni de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-4mp-gentle
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de produccion del autor (Stage-2): https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.

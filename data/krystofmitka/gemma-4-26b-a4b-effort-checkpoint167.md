# krystofmitka/gemma-4-26B-A4B-effort-checkpoint167

## Resumen

`krystofmitka/gemma-4-26B-A4B-effort-checkpoint167` es un fine-tune del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind, publicado por el usuario krystofmitka. Se trata del checkpoint completamente fusionado (BF16) del paso de entrenamiento 167 de un ajuste fino condicionado por esfuerzo de razonamiento, que combina un calentamiento supervisado con un adaptador LoRA entrenado mediante GRPO ya integrado en los pesos. El resultado es un único conjunto de pesos que soporta cuatro niveles de esfuerzo de razonamiento (25, 50, 75 y 100) seleccionables en tiempo de inferencia mediante una línea concreta en el system prompt.

El modelo hereda la arquitectura multimodal de Gemma 4 con aproximadamente 25.800 millones de parámetros totales y una ventana de contexto de 262.144 tokens, según la configuración usada en la evaluación del autor. Su propuesta diferencial es el control explícito del presupuesto de razonamiento: el usuario puede pedir respuestas más concisas o más elaboradas sin cambiar de modelo, algo relevante para aplicaciones que necesitan equilibrar latencia, coste y precisión.

Es relevante ahora porque demuestra una vía práctica para añadir control de esfuerzo a modelos de razonamiento de gran tamano mediante RL (GRPO), y porque el autor publica de forma transparente metadatos de procedencia, manifiestos de pesos y resultados preliminares. No obstante, el entrenamiento quedó pausado en el paso 167 (no en el paso 500 previsto) y la evaluación completa de doce benchmarks se detuvo, por lo que las conclusiones sobre preservación de capacidades generales son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4, con mezcla de expertos (MoE) segun el sufijo A4B del modelo base |
| Parametros totales | 25.805.933.872 (aproximadamente 25,8 mil millones) |
| Parametros activos | no disponible (el nombre A4B sugiere aproximadamente 4 mil millones activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (usada en la evaluacion y configurada en el ejemplo de vLLM) |
| Tipos de cuantizacion | no disponible (se publican pesos en BF16; no se detallan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, fusionados; repositorio de 51,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-26B-A4B-it`, un transformer multimodal de Gemma 4 con capacidad de procesar imagen y texto (pipeline `image-text-to-text`). El sufijo A4B del nombre del modelo base indica una configuracion de mezcla de expertos con aproximadamente 4 mil millones de parametros activos, aunque la informacion proporcionada no detalla el numero exacto de expertos ni la topologia de enrutamiento. El checkpoint publicado contiene los pesos en BF16 completamente fusionados, de modo que no requiere cargar un adaptador LoRA por separado.

El entrenamiento consistio en un calentamiento supervisado seguido de un ajuste fino con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, cuyo adaptador LoRA del paso 167 se fusiono en los pesos base. La innovacion principal es la condicionalidad por esfuerzo: el modelo aprende a asociar la linea `Reasoning Effort: N (range 1–100; ...)` del system prompt con distintos niveles de profundidad de razonamiento, entrenandose especificamente para los valores 25, 50, 75 y 100. Segun el autor, estos valores expresan preferencias de razonamiento aprendidas y no limites duros de tokens. El entrenamiento quedo pausado en el paso 167, no en el paso 500 planificado, y el autor documenta la identidad del checkpoint, la revision del modelo original, el SHA-256 del adaptador y el manifiesto de pesos en `checkpoint_metadata.json` y `weights_manifest.json`.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline `image-text-to-text`) y produce respuestas con canal de pensamiento (`thinking`) y respuesta final.
- Razonamiento con esfuerzo controlable: cuatro niveles de esfuerzo (25, 50, 75, 100) seleccionables mediante el system prompt, que modulan la extension del razonamiento.
- Modo thinking: requiere `enable_thinking=True`; la respuesta decodificada incluye el canal de pensamiento y la respuesta final.
- Razonamiento matematico y resolucion de problemas: el ejemplo oficial resuelve una ecuacion lineal con explicacion.
- Respuesta a preguntas de conocimiento avanzado: evaluado en GPQA-Diamond (preguntas de nivel doctoral en ciencias).
- Conversacional multi-turno: chat template de Gemma 4 incluido en el repositorio.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking y el contexto de 262.144 tokens lo permiten tecnicamente, pero no se confirma como capacidad entrenada.

## Casos de uso

- Razonamiento cientifico con presupuesto controlado: en preguntas de nivel doctoral (tipo GPQA), el usuario puede fijar esfuerzo 25 para respuestas rapidas o 75 para mayor precision, ajustando el coste computacional al caso concreto.
- Atencion al cliente automatizada: con 262.144 tokens de contexto, el modelo puede gestionar conversaciones multi-turno largas e incorporar imagenes (capturas, productos) en la misma sesion.
- Tutoria educativa adaptativa: el nivel de esfuerzo permite ofrecer explicaciones breves (esfuerzo 25) o desarrollos detallados paso a paso (esfuerzo 75 o 100) segun el perfil del estudiante.
- Asistentes de documentacion tecnica con imagenes: al ser image-text-to-text, puede interpretar diagramas, capturas de pantalla o esquemas y generar explicaciones textuales a partir de ellos.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite analizar informes, contratos o articulos largos en una sola pasada, solicitando razonamiento profundo solo en las secciones criticas.
- Investigacion sobre control de razonamiento en RL: el checkpoint, con metadatos de procedencia y manifiesto de pesos, sirve como referencia reproducible para estudiar como GRPO modula la longitud y calidad del razonamiento.
- Despliegue en produccion con vLLM: el autor proporciona comandos de servicio y cuerpos de peticion de ejemplo para los cuatro niveles, lo que facilita integrarlo en pipelines de inferencia existentes.

## Benchmarks y rendimiento

Resultados preliminares de una sola pasada en GPQA-Diamond (198 preguntas, todas respondidas en cada ajuste; sin intervalos de confianza multi-semilla). Muestreo: temperatura 1,0, top-p 0,95, top-k 64; salida maxima 65.536 tokens; contexto 262.144 tokens; vLLM y EvalScope 1.14.1. Ninguna respuesta fue truncada.

| Ajuste | Precision | Media de tokens de pensamiento | Media de tokens de salida |
|---|---:|---:|---:|
| Gemma 4 original | 79,80% | 11.040 | 11.822 |
| Checkpoint 167, sin linea de esfuerzo | 80,81% | 8.849 | 9.580 |
| Checkpoint 167, esfuerzo 25 | 81,31% | 4.726 | 5.238 |
| Checkpoint 167, esfuerzo 50 | 76,26% | 6.147 | 6.781 |
| Checkpoint 167, esfuerzo 75 | 81,82% | 8.131 | 8.852 |
| Checkpoint 167, esfuerzo 100 | 79,29% | 8.362 | 9.092 |

La evaluacion de doce benchmarks se detuvo a peticion del propietario: la pasada de MMLU-Pro quedo incompleta y los otros diez benchmarks no se iniciaron. Por tanto, estos datos no demuestran preservacion general de capacidades ni ganancias de precision. Un experimento posterior con esfuerzo 10 tambien se detuvo y no es un ajuste soportado en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 51,6 GB en BF16, por lo que se necesitan aproximadamente 52 GB solo para pesos, mas memoria de inferencia (KV cache y activaciones); en la practica, mas de 60 GB en BF16.
- GPU recomendadas: el autor menciona una evaluacion en B300 con backends Triton de atencion y MoE; para BF16 se requieren GPUs de centro de datos con 80 GB o mas (H100, H200, B200, B300) o configuraciones multi-GPU con `device_map="auto"`.
- Cabe en GPU de consumo: no en BF16; no se proporcionan pesos cuantizados oficiales, por lo que no se confirma su viabilidad en RTX 4090 (24 GB) u otras GPU consumer sin cuantizacion propia.
- Opciones de despliegue: Transformers (probado con la version 5.20.2 y PyTorch 2.14.0, requiere soporte de Gemma 4), vLLM (con soporte de Gemma 4, `--max-model-len 262144`), y EvalScope 1.14.1 para evaluacion. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; solo se conocen las medias de tokens generados por ajuste en GPQA-Diamond (entre 5.238 y 11.822 tokens de salida), que dan una idea del coste relativo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| krystofmitka/gemma-4-26B-A4B-effort-checkpoint167 | 25,8 mil millones | 262.144 | Apache 2.0 | Fine-tune con control de esfuerzo (25/50/75/100); evaluacion parcial |
| google/gemma-4-26B-A4B-it | 25,8 mil millones (mismo base) | no disponible en la informacion | Apache 2.0 | Modelo base original; 79,80% en GPQA-Diamond segun la tabla del autor |
| Otras alternativas de tamano y categoria similares | no disponible | no disponible | no disponible | No se proporcionan datos comparativos de otros modelos en la informacion disponible |

## Limitaciones y advertencias

- Entrenamiento incompleto: el checkpoint corresponde al paso 167, no al paso 500 planificado; el autor indica que el entrenamiento sigue pausado.
- Evaluacion parcial: solo hay resultados preliminares de una pasada en GPQA-Diamond; MMLU-Pro quedo incompleto y diez benchmarks no se iniciaron, por lo que no se puede afirmar preservacion general de capacidades.
- Sin intervalos de confianza: los resultados son de una sola semilla y el propio autor advierte que no son agregados multi-semilla.
- Niveles de esfuerzo no validados fuera de 25, 50, 75 y 100; valores como 10 no estan soportados en esta release.
- El esfuerzo 50 obtuvo peor precision (76,26%) que el modelo original y que los demas ajustes, lo que sugiere un comportamiento no monotono que conviene validar en el caso de uso concreto.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; al ser un modelo de razonamiento generativo, persiste el riesgo habitual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue mas alla del modelo base.
- Licencia: Apache 2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` antes de uso comercial, ya que los pesos fueron modificados respecto al original.
- Requisitos de memoria elevados en BF16 (mas de 60 GB en la practica) y ausencia de cuantizaciones oficiales, lo que limita el despliegue en hardware consumer.
- Los benchmarks del modelo original en su model card no describen este fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort-checkpoint167
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio del autor (archivos incluidos): `effort_presets.json`, `examples/effort_25.json`, `examples/effort_50.json`, `examples/effort_75.json`, `examples/effort_100.json`, `checkpoint_metadata.json`, `weights_manifest.json`, `LICENSE`, `NOTICE`, `BASE_MODEL_CARD.md`

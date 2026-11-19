# nvidia/Flora-TempSeg

## Resumen

Flora-TempSeg (publicado en Hugging Face como Flora-segmenter-9B) es un adaptador LoRA desarrollado por NVIDIA sobre el modelo vision-lenguaje Qwen3.5-9B. Su funcion es localizar operaciones en videos de manipulacion robotica y humana: dado un fragmento temporal de video, predice coordenadas de intervalo locales y marcadores que indican si una operacion continua mas alla de la ventana visible. Forma parte del motor de datos Flora, el pipeline que NVIDIA uso para entrenar GR00T-2, y se libera para que investigadores puedan escalar la anotacion de sus propios datasets de robotica.

El modelo no es un modelo generativo de proposito general ni un controlador de robots: sus salidas son anotaciones temporales (un objeto JSON `segments`) sin etiquetas de accion; el etiquetado semantico lo realiza otro componente del pipeline, el captioner de Flora. Tecnicamente es un adaptador de rango 32 y alpha 64 aplicado sobre las proyecciones de atencion y MLP del decoder de Qwen3.5-9B, con el codificador visual y los pesos base congelados. El entrenamiento combina supervision fina (SFT) con aprendizaje por refuerzo GRPO usando una recompensa verificable de coincidencia temporal.

Su relevancia actual reside en que aborda un cuello de botella practico de la robotica basada en datos: segmentar episodios largos de demostracion en subtareas coherentes de forma automatica y barata. Al liberarse bajo licencia no comercial de NVIDIA, queda restringido a investigacion y desarrollo, no a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: VLM Qwen3.5 (codificador visual multimodal nativo + LLM decoder-only) con adaptador LoRA |
| Parametros totales | 9,0 x 10^9 (modelo base Qwen3.5-9B); el adaptador LoRA es un subconjunto entrenable de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ventanas de video de 16 s o 32 s a 4 Hz, con 64 o 128 slots de frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); modelo base Qwen3.5-9B bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un VLM con codificador visual nativo y decoder LLM. Sobre el se entrena un adaptador LoRA (rank 32, alpha 64) en las proyecciones de atencion y MLP del lenguaje; los pesos base, incluido el codificador visual, permanecen congelados. El entrenamiento tiene dos fases: primero supervised fine-tuning y despues reinforcement learning con Group Relative Policy Optimization (GRPO), usando una recompensa verificable de coincidencia temporal que actualiza unicamente los mismos parametros LoRA.

En inferencia, los frames muestreados se codifican con el codificador visual y los tokens resultantes se combinan con un prompt que especifica la geometria de la ventana, el nucleo de emision y la politica de anotacion. El decoder genera de forma autorregresiva un objeto JSON `segments` con coordenadas de intervalo locales y flags de continuacion, sin etiquetas de accion. El muestreo nativo trabaja a 4 Hz sobre ventanas de 16 s (64 slots, nucleo de emision de 12 s) o de 32 s (128 slots, nucleo de 24 s), con guardas de contexto de 2 s o 4 s por lado; las coordenadas de salida se expresan en un reloj de 20 Hz (rango `[0, 320)` o `[0, 640)` para ventanas interiores). Para entrada multicamara se compone un mosaico con camara principal arriba y camaras de muneca izquierda y derecha abajo.

## Capacidades

- Segmentacion temporal de operaciones en videos de manipulacion robotica y humana, con salida JSON de intervalos locales.
- Prediccion de flags de continuacion para operaciones que exceden la ventana visible, lo que permite encadenar ventanas solapadas.
- Procesamiento de video monocamara o de tres camaras sincronizadas mediante mosaico.
- Manejo de ventanas de 16 s y 32 s con perfiles de prompt especificos (standard y long).
- Capacidad de peticion de ventanas desplazadas para resolver fronteras inciertas en el pipeline de produccion.
- No genera etiquetas de accion: la descripcion semantica corresponde al captioner separado de Flora.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de datasets de robotica: dado un episodio de demostracion, el modelo localiza subtareas y el pipeline Flora las proyecta sobre el reloj de origen y las une en eventos a nivel de episodio, reduciendo el etiquetado manual.
- Investigacion en transferencia humano-robot: segmentar videos de demostraciones humanas para extraer subtareas comparables con las de manipulacion robotica.
- Curacion y filtrado de datos para modelos fundacionales de robotica: usar las anotaciones temporales para prototipar pipelines de curacion, filtrado y monitorizacion.
- Prototipado de pipelines de datos con ventanas largas: el perfil de 32 s con nucleo de 24 s permite cubrir operaciones extensas con menos llamadas al modelo.
- Analisis de videos multicamara: con el mosaico de tres vistas sincronizadas se pueden segmentar episodios grabados con camara principal y dos camaras de muneca.
- Investigacion en auto-investigacion fisica (physical auto-research): generar segmentaciones estructuradas que alimenten experimentos sobre representacion de tareas en robotica.
- Evaluacion de politicas de anotacion: comparar el perfil standard frente al long y las ventanas desplazadas para medir el impacto en la calidad de las fronteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base tiene 9,0 x 10^9 parametros y el adaptador LoRA anade una carga minima; el repo del adaptador ocupa 0,5 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantizacion del modelo base Qwen3.5-9B, que no se detalla.
- Opciones de despliegue: no disponible en la informacion proporcionada; el modelo se distribuye como adaptador PEFT (`library_name: peft`) sobre Qwen3.5-9B.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye modelos comparables de segmentacion temporal de video para robotica ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia estrictamente no comercial (NVIDIA OneWay Noncommercial License): no apta para uso comercial ni de produccion.
- El modelo solo produce anotaciones temporales; no etiqueta acciones ni debe usarse para controlar robots directamente ni como unico monitor de seguridad de un sistema fisico.
- Las salidas dependen de la ventana y del prompt: es necesario seleccionar conjuntamente el prompt entrenado y el perfil de ventana (standard o long); fuera de esos perfiles el comportamiento no esta garantizado.
- El muestreo debe respetarse a 4 Hz y no remuestrearse (`do_sample_frames=False`); mezclar el reloj de muestreo con el frame rate original o con el reloj de salida de 20 Hz puede degradar los resultados.
- En los bordes de episodio, los frames de relleno no son evidencia: hay que registrar los rangos validos reales en el prompt.
- Riesgo de alucinacion y de fronteras imprecisas en operaciones ambiguas; el pipeline contempla ventanas desplazadas para mitigarlo.
- Sesgos conocidos e idiomas soportados: no disponible en la informacion proporcionada.
- Modelo marcado explicitamente como de investigacion y desarrollo; sin garantias de soporte para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-TempSeg
- Licencia NVIDIA OneWay Noncommercial: https://huggingface.co/nvidia/Flora-TempSeg/blob/main/LICENSE.pdf
- Licencia NVIDIA OneWay Noncommercial (PDF oficial): https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper de GR00T N1: https://arxiv.org/abs/2503.14734

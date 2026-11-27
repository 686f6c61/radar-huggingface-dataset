# nvidia/Flora-TempSeg

## Resumen

Flora-TempSeg (publicado en Hugging Face como `nvidia/Flora-TempSeg`, denominado en la model card como Flora-segmenter-9B) es un adaptador LoRA sobre el modelo vision-lenguaje Qwen3.5-9B, desarrollado por NVIDIA. Su funcion resuelve la segmentacion temporal de operaciones en videos de manipulacion robotica y humana: dado un ventana temporal de video, predice coordenadas de intervalos locales y banderas que indican si una operacion continua mas alla de la ventana visible. Los fragmentos se proyectan despues sobre el reloj de origen y se cosen en eventos a nivel de episodio mediante el motor de datos Flora.

El modelo forma parte del data engine Flora de NVIDIA, empleado para el entrenamiento de GR00T-2, y se libera con el objetivo de que la comunidad investigadora pueda escalar la anotacion de datasets roboticos propios. No es un modelo de proposito general ni un controlador de robots: sus salidas son anotaciones temporales, sin etiquetas de accion, que despues consume un captioner separado.

La relevancia actual radica en que aborda uno de los cuellos de botella de la robotica de aprendizaje: la anotacion a escala de demostraciones. Al empaquetar un modelo multimodal de 9.000 millones de parametros en un adaptador LoRA de aproximadamente 0,5 GB, permite reutilizar infraestructura de inferencia de Qwen3.5-9B y aplicar tecnicas de RL con recompensa verificable para mejorar la precision de los limites temporales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: modelo vision-lenguaje Qwen3.5 (encoder visual nativo multimodal + LLM decoder-only), con adaptador LoRA |
| Parametros totales | 9,0 x 10^9 (modelo base Qwen3.5-9B); el adaptador LoRA se distribuye aparte (~0,5 GB de repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana de video se define por perfiles: 16 s estandar con 64 slots, 32 s largo con 128 slots a 4 Hz) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible (el prompt de entrada es texto; la model card no detalla cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base Qwen3.5-9B se descarga por separado |

## Arquitectura y entrenamiento

Flora-TempSeg se construye sobre Qwen3.5-9B, un modelo vision-lenguaje con encoder visual nativo y decoder LLM. El ajuste se realiza con LoRA de rango 32 y alpha 64 sobre las proyecciones de atencion y MLP del modelo de lenguaje; los pesos base, incluido el encoder visual, permanecen congelados. El entrenamiento tiene dos fases: primero un ajuste supervisado (SFT) y despues aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO) usando una recompensa verificable de coincidencia temporal, que actualiza unicamente los mismos parametros LoRA.

En inferencia, los fotogramas muestreados se codifican con el encoder visual y los tokens resultantes se combinan con un prompt que especifica la geometria de la ventana, el nucleo de emision y la politica de anotacion. El decoder genera de forma autorregresiva un objeto JSON `segments` con coordenadas de intervalos locales y banderas de continuacion, sin etiquetas de accion. El muestreo de video usa un reloj local a 4 Hz independiente del framerate original y del sistema de coordenadas de salida a 20 Hz; los perfiles nativos son ventana estandar de 16 s (64 slots, nucleo de emision de 12 s, guardas de contexto de 2 s por lado) y ventana larga de 32 s (128 slots, nucleo de 24 s, guardas de 4 s). Para entrada de tres camaras se compone un mosaico sincronizado con camara principal arriba y camaras de muneca izquierda y derecha abajo.

## Capacidades

- Segmentacion temporal de operaciones en videos de manipulacion robotica y humana, con salida en JSON con coordenadas de intervalo y banderas de continuacion.
- Procesamiento de ventanas de video de 16 s o 32 s con solapamiento de contexto para coser eventos a nivel de episodio.
- Entrada multicamara: una camara RGB o mosaico sincronizado de tres camaras (principal, muneca izquierda, muneca derecha).
- Razonamiento multimodal sobre fotogramas y prompt textual que define la politica de anotacion.
- Generacion de anotaciones sin etiquetas de accion; la descripcion semantica corresponde a un captioner separado del ecosistema Flora.
- Capacidad de refinamiento mediante ventanas desplazadas solicitadas por el pipeline para resolver limites inciertos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el flujo de cosido de ventanas lo orquesta el motor de datos externo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo de anotacion temporal con recompensa verificable entrenada por GRPO; no se documenta modo thinking, audio ni vision generalista fuera del flujo de segmentacion.

## Casos de uso

- Anotacion de datasets roboticos a escala: el modelo procesa ventanas de 16 s a 4 Hz y emite intervalos locales que el motor Flora proyecta sobre el reloj de origen, permitiendo etiquetar sub-tareas en miles de episodios sin anotacion manual.
- Curacion y filtrado de datos para entrenamiento de modelos fundacionales de robotica: las banderas de continuacion y los limites temporales permiten descartar episodios mal segmentados o inconsistentes antes de alimentar un pipeline de entrenamiento.
- Transferencia humano-robot: al segmentar demostraciones humanas con la misma politica de anotacion que las roboticas, se pueden alinear ambos dominios para investigacion de imitacion.
- Monitorizacion de pipelines de adquisicion: integrado en un sistema de control de calidad, el modelo detecta ventanas sin operaciones claras o con limites ambiguos y solicita ventanas desplazadas para resolverlos.
- Prototipado de interfaces de revision humana: las coordenadas JSON y las banderas de continuacion se presentan en una herramienta de revision donde un anotador valida o corrige segmentos antes de consolidarlos.
- Investigacion en auto-investigacion fisica (physical auto-research): el modelo actua como componente de percepcion temporal en bucles que generan y validan hipotesis sobre secuencias de manipulacion.
- Generacion de instrucciones de accion en combinacion con el captioner Flora: los segmentos temporales sirven de entrada al captioner para producir instrucciones por evento, habilitando la construccion de datasets instruccion-accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen metricas cuantitativas (MMLU, HumanEval, GSM8K ni metricas de segmentacion temporal como mIoU o precision de limites).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, un modelo de 9.000 millones de parametros en precision de 16 bits requiere del orden de 18 GB solo para pesos, mas el encoder visual y las activaciones de video, por lo que se recomienda planificar holgura adicional.
- GPU recomendadas: no especificadas por el autor; por tamano del modelo base, GPUs de centro de datos tipo A100 o H100 son adecuadas para inferencia comoda, y GPUs consumer de gama alta con suficiente VRAM podrian alojar el modelo en cuantizaciones reducidas.
- Cabe en GPU consumer: no confirmado en la informacion disponible; depende de la cuantizacion del modelo base Qwen3.5-9B y del coste de procesar 64-128 slots de video por ventana.
- Opciones de despliegue: el repositorio usa la libreria PEFT, por lo que el adaptador se carga sobre Qwen3.5-9B con transformers y PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-TempSeg (NVIDIA) | 9,0 x 10^9 (base) + LoRA | Ventanas de 16 s / 32 s de video | Segmentacion temporal de manipulacion | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9,0 x 10^9 | No disponible | Vision-lenguaje generalista | Apache 2.0 | Hugging Face |
| Alternativas especificas de segmentacion temporal de video | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables de segmentacion temporal de operaciones roboticas en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente para investigacion y desarrollo: la model card indica explicitamente que no esta pensado ni soportado para uso en produccion.
- Las salidas son anotaciones temporales, no etiquetas de accion ni comandos de control; no debe usarse para controlar robots directamente ni como unico monitor de seguridad de un sistema fisico.
- Riesgo de limites temporales imprecisos en fronteras de operacion; el pipeline mitiga esto solicitando ventanas desplazadas, pero no se documenta una garantia de exactitud.
- Dependencia de la politica de anotacion y del prompt: cambiar la geometria de ventana, el nucleo de emision o las guardas de contexto sin usar los perfiles entrenados puede degradar la calidad de la segmentacion.
- El muestreo debe respetar el reloj local de 4 Hz del perfil y no remuestrear los slots (`do_sample_frames=False`); un preprocesado incorrecto invalida las coordenadas de salida.
- En los extremos de un episodio, los fotogramas de relleno no son evidencia valida; el prompt debe declarar los rangos validos y de nucleo reales.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Cobertura linguistica: no documentada; el prompt de entrada es texto y no se detalla que idiomas maneja el modelo base para esa instruccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card restringe el uso previsto a investigacion y desarrollo; conviene revisar los terminos del modelo base Qwen3.5-9B, tambien Apache 2.0.
- El adaptador no incluye los pesos base: es necesario descargar Qwen3.5-9B en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` para reproducir el comportamiento entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-TempSeg
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper de GR00T N1: https://arxiv.org/abs/2503.14734

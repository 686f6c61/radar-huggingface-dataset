# podolinsky/pi05-libero-x-level123-lora

## Resumen

`podolinsky/pi05-libero-x-level123-lora` es un adaptador LoRA de pequeno tamano (7,03 millones de parametros, 28 MB) para el modelo vision-lenguaje-accion (VLA) `lerobot/pi05_libero`, la implementacion de pi0.5 en LeRobot. Lo desarrolla el usuario independiente podolinsky y resuelve un problema muy concreto: permitir el ajuste fino reproducible de un VLA sobre un subconjunto de tareas del benchmark de robotica manipulativa LIBERO-X (niveles 1 a 3, 218 tareas). No es un modelo autonomo: requiere los pesos base de pi0.5 para funcionar.

La relevancia es metodologica mas que de rendimiento. El autor publica el adaptador junto con la configuracion de entrenamiento completa, las estadisticas de normalizacion y el dataset, de modo que otros investigadores pueden reproducir el pipeline y construir sobre el. El checkpoint corresponde a una sola epoca de entrenamiento y no ha sido evaluado en simulador ni sobre demostraciones reservadas, por lo que no existe ninguna tasa de exito publicada ni evidencia de que mejore al modelo base.

Arquitectonicamente hereda la estructura de pi0.5: un backbone Gemma 2B con vision SigLIP y un experto de acciones Gemma de 300M entrenado con flow matching. El adaptador congela tanto la torre de vision como el backbone de lenguaje y solo modifica el experto de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre pi0.5 (SigLIP + Gemma 2B + experto de acciones Gemma 300M, flow matching) |
| Parametros totales | 7.029.760 en el adaptador; pesos base de pi0.5 no disponibles en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles, segun la composicion de LIBERO-X) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el experto de acciones de pi0.5 con rango LoRA 16, alpha 32 y dropout 0, en 130 modulos: proyecciones de atencion q/k/v/o y MLP gate/up/down del experto, mas las proyecciones de entrada/salida de accion y el time-MLP. La torre de vision y el backbone de lenguaje permanecen congelados, lo que explica el reducido numero de parametros entrenables. El entrenamiento se realizo con LeRobot 0.7.0 sobre 1.076 demostraciones humanas (371.555 fotogramas, 152 instrucciones distintas, 218 tareas), con dos camaras a 256x256, estado de 8 dimensiones y acciones de 7 dimensiones.

La configuracion usa AdamW (betas 0,9/0,95), weight decay 0,01, clipping de gradiente 1,0, learning rate pico de 1e-4 con warm-up y decaimiento coseno hasta 2,5e-6, batch efectivo de 24 (4 por paso x 6 de acumulacion), precision bf16 y `torch.compile` sin checkpointing de gradiente. Se ejecutaron 92.800 micro-pasos (unas 15.500 actualizaciones del optimizador) equivalentes a 1,0 epoca, semilla 1000, en una unica RTX 4090 durante 8,3 horas. La perdida de flow matching (MSE) bajo de aproximadamente 2,5 a aproximadamente 0,7, aunque el autor advierte que es ruidosa por construccion y no informa sobre el exito en tareas. Se usa normalizacion media/desviacion tipica (no el default de cuantiles de LeRobot), con las estadisticas incluidas en los ficheros de procesador.

## Capacidades

- Generacion de acciones roboticas de 7 dimensiones a partir de observaciones visuales (dos camaras) y estado de 8 dimensiones, siguiendo instrucciones en lenguaje natural.
- Control de manipulacion para un robot Franka Panda simulado en el entorno LIBERO-X.
- Aprendizaje por imitacion sobre demostraciones humanas (no refuerzo).
- Ejecucion condicionada por instruccion textual (152 instrucciones distintas en el dataset de entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento generico: es un VLA especializado en control motor.
- Capacidades multilingues: no disponibles; el modelo esta entrenado sobre instrucciones de LIBERO-X, presumiblemente en ingles.

## Casos de uso

- Reproduccion de experimentos de ajuste fino de VLA: sirve como referencia exacta de configuracion (LoRA r16, LR 1e-4, normalizacion mean/std) para replicar el pipeline en LeRobot 0.7.0 y validar resultados.
- Punto de partida para ajuste adicional: al ser un adaptador pequeno y con pesos separados del base, se puede continuar el entrenamiento con mas epocas o con datos adicionales de LIBERO-X sin reentrenar el modelo completo.
- Investigacion sobre eficiencia de adaptadores en robotica: permite estudiar cuanto rendimiento se obtiene con solo 7M de parametros entrenables frente al ajuste completo del experto de acciones.
- Benchmarking de metodologias de evaluacion: util para comparar protocolos de evaluacion en simulador LIBERO-X frente a evaluacion por perdida de entrenamiento.
- Estudio de normalizacion en VLA: el uso de mean/std en lugar de cuantiles permite analizar el impacto de la normalizacion en la calidad de las acciones generadas.
- Base para experimentos de failure prediction: el paper relacionado sobre prediccion de fallos en VLA mediante sondeo latente calibrado puede usar checkpoints como este como sujeto de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado en el simulador LIBERO-X ni sobre demostraciones reservadas, y que no existe tasa de exito. La unica metrica reportada es la perdida de flow matching (MSE), que paso de aproximadamente 2,5 a aproximadamente 0,7 durante una epoca, sin valor comparativo.

## Requisitos de hardware

- El adaptador en si ocupa 28 MB (7,03M de parametros en bf16/safetensors), pero requiere cargar el modelo base pi0.5 completo (SigLIP + Gemma 2B + experto de 300M).
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base y de la precision. Como referencia, un backbone Gemma 2B en bf16 requiere del orden de varios GB solo para pesos, mas activaciones de vision.
- GPU recomendadas: no disponibles en la informacion. El entrenamiento se realizo en una RTX 4090 (24 GB), lo que sugiere que la inferencia cabe en GPUs consumer de gama alta, aunque no se confirma.
- Opciones de despliegue: LeRobot (carga nativa de adaptadores via `peft.PeftModel`), con dependencia del tokenizer PaliGemma (`google/paligemma-3b-pt-224`) que LeRobot descarga automaticamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-x-level123-lora (este) | 7,03M adaptador + base pi0.5 | no disponible | sin evaluar | Gemma Terms | Hugging Face |
| lerobot/pi05_libero (base) | no disponible | no disponible | no disponible en la informacion | Gemma Terms | Hugging Face |
| pi0.5 (original) | no disponible | no disponible | no disponible en la informacion | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Checkpoint no evaluado: sin tasa de exito en simulador ni en datos reservados; el autor lo describe como punto de partida.
- Entrenado solo una epoca; no hay evidencia de que supere al modelo base.
- Las etiquetas de episodio se asignan solo por texto de instruccion; LIBERO-X no incluye etiqueta de escena, por lo que escenas distintas con la misma instruccion quedan mezcladas.
- Normalizacion mean/std distinta del default de cuantiles del modelo base: usar los procesadores incluidos o las acciones se escalaran incorrectamente.
- Datos exclusivamente de Franka Panda simulado; no hay garantia de transferencia a robot real.
- Licencia Gemma Terms of Use: restricciones de uso comercial segun dichos terminos; el adaptador se distribuye bajo la misma licencia que el base.
- Datos de entrenamiento derivados de LIBERO-X (Meituan, CC BY 4.0): requiere citar el paper de LIBERO-X y atribuir a sus autores.
- No endorsado por los autores de LIBERO-X, pi0.5 ni LeRobot.
- Riesgo de alucinacion en el sentido de acciones no validas o fuera de distribucion: no documentado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/podolinsky/pi05-libero-x-level123-lora
- Modelo base: https://huggingface.co/lerobot/pi05_libero
- Dataset de entrenamiento: https://huggingface.co/datasets/podolinsky/libero-x-level123
- Dataset original LIBERO-X (Meituan): https://huggingface.co/datasets/meituan/LIBERO-X
- Paper LIBERO-X: https://arxiv.org/abs/2602.06556
- Paper relacionado (Failure Prediction and Classification in VLAs via Calibrated Latent Probing): https://arxiv.org/abs/2611.08425
- LeRobot: https://github.com/huggingface/lerobot
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms

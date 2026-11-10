# AkiPolaris777/live2d-expression-model-lora

## Resumen

AG99Live Qwen3.5-2B LoRA es un adaptador LoRA publicado por AkiPolaris777 que convierte al modelo base Qwen/Qwen3.5-2B-Base en un generador de secuencias de movimiento para avatares Live2D/VTS en el contexto del sistema AG99Live. El modelo recibe la transcripción de voz de un segmento de habla (junto con acciones y tendencias previas) y devuelve un JSON estructurado con una duración objetivo y una lista ordenada de pasos de animación, cada uno con valores numéricos por eje facial y corporal.

La relevancia del proyecto es acotada pero clara: resuelve el problema de mapear habla a animación facial y corporal continua sin un motor de animación procedural manual, delegando la decisión de ejes y pesos de duración en un modelo de lenguaje pequeño (2B parámetros) afinado con LoRA de rango 16. Al estar construido sobre Qwen3.5-2B-Base, hereda la licencia Apache 2.0 y un tamaño que permite inferencia en hardware modesto.

El adaptador es extremadamente específico: entrenado con 929 ejemplos durante 3 épocas hasta una loss final de 0.4916, con un protocolo de entrada y salida fijo y un conjunto cerrado de 15 ejes de animación. No es un modelo de propósito general ni sustituye al modelo base para otras tareas; es un componente de un pipeline de VTubing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre transformer Qwen3.5-2B-Base |
| Parametros totales | 2B (modelo base); el adaptador LoRA ocupa 0.1 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion aplicable via el modelo base) |
| Idiomas soportados | no disponible (la transcripcion de ejemplo esta en chino; el modelo procesa texto de entrada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria transformers + PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B-Base, un transformer de 2.000 millones de parametros. La fina sintonia usa LoRA con rango 16 y alpha 32, lo que implica un numero reducido de parametros entrenables y un repo de solo 0.1 GB. El entrenamiento consistio en 929 ejemplos durante 3 epocas, con una loss final de 0.4916. No se documenta la composicion del dataset, el numero de tokens vistos ni si hubo etapas de RLHF o DPO; el autor indica explicitamente que el repositorio no incluye los datos de entrenamiento.

La innovacion tecnica no reside en la arquitectura sino en el protocolo de E/S: la entrada es un JSON con `segment.speech` (transcripcion), `segment.actions`, `segment.tendency` y un campo `user` para contexto adicional; la salida es un JSON con `duration_hint_ms` (entre 320 y 15000 ms) y `motion_steps`, una lista ordenada de pasos con `axis_values` y `duration_weight` entero de 1 a 3. El modelo debe generar pasos esparcidos, rellenando solo los ejes que cambian en cada paso, sobre un conjunto cerrado de 15 ejes: `head_yaw`, `head_pitch`, `head_roll`, `body_yaw`, `body_pitch`, `body_roll`, `gaze_x`, `gaze_y`, `eye_open_left`, `eye_open_right`, `eye_smile_left`, `eye_smile_right`, `mouth_smile`, `mouth_x` y `brow_bias`.

## Capacidades

- Generacion de secuencias de movimiento Live2D/VTS en formato JSON estructurado a partir de transcripcion de voz.
- Control numerico de 15 ejes de animacion facial y corporal con valores por paso.
- Planificacion de duracion de animacion mediante `duration_hint_ms` (320-15000 ms) y pesos de duracion por paso (1-3).
- Generacion de pasos esparcidos: solo emite los ejes que cambian en cada paso, reduciendo redundancia.
- Aceptacion de contexto adicional mediante el campo `user` y de acciones y tendencias previas en la entrada.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el unico ejemplo de la model card esta en chino.

## Casos de uso

- VTubing en directo con Live2D/VTS: el adaptador convierte cada segmento de habla transcrito en una secuencia de gestos faciales y corporales, permitiendo que el avatar reaccione de forma continua sin animacion manual por fotograma.
- Integracion en el pipeline AG99Live: al recibir `segment.speech` y devolver `motion_steps` con `duration_weight`, encaja como etapa de decision de animacion entre el ASR y el motor de render del avatar.
- Sincronizacion de expresiones con el habla: el campo `duration_hint_ms` permite al motor de render ajustar la reproduccion de los pasos a la duracion real del segmento de audio.
- Personajes virtuales interactivos: combinado con un ASR y un TTS, el modelo puede poblar escenas conversacionales con gestos de cabeza, cuerpo, mirada, parpadeo y sonrisa coherentes con el texto.
- Prototipado de animacion en produccion de contenido: para creadores que necesitan previsualizar movimientos de un personaje a partir de guiones o transcripciones, el modelo genera borradores de animacion en JSON que luego se revisan o editan.
- Investigacion en mapeo texto-a-animacion: sirve como referencia reproducible (LoRA rank 16, 929 ejemplos, loss 0.4916) para estudiar la viabilidad de LLMs pequenos en la generacion de curvas de animacion estructuradas.
- Control de avatares en entornos de bajo recursos: al ser un adaptador sobre un modelo de 2B, puede desplegarse en estaciones de trabajo con GPU de consumo, lo que facilita pruebas locales del pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la loss final de entrenamiento de 0.4916 tras 3 epocas sobre 929 ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; como referencia de orden de magnitud, un transformer de 2B en precision completa requiere aproximadamente 4 GB solo para pesos, cantidad que se reduce con cuantizacion del modelo base (el adaptador LoRA anade una fraccion minima).
- GPU recomendadas: no disponibles; por tamano del modelo base, cabe en GPU de consumo con suficiente VRAM, pero no se documenta ninguna configuracion validada.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo base, aunque no hay confirmacion del autor.
- Opciones de despliegue: Transformers + PEFT segun la model card; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (adaptadores LoRA para generacion de movimiento Live2D/VTS sobre LLMs pequenos).

## Limitaciones y advertencias

- El adaptador es de dominio muy especifico: solo genera JSON de movimiento segun el protocolo AG99Live y el conjunto cerrado de 15 ejes; no es util para tareas generales de lenguaje.
- Requiere que el llamante proporcione el system prompt de AG99Live y las restricciones de salida estructurada; sin ellos el modelo puede producir JSON invalido o ejes fuera de rango.
- Entrenado con solo 929 ejemplos y 3 epocas, lo que limita la diversidad de comportamientos y aumenta el riesgo de sobreajuste a los patrones del dataset.
- Riesgo de alucinacion en los valores de eje: el modelo puede emitir valores fuera de los rangos validos definidos por AG99Live, por lo que el motor consumidor debe validar y recortar.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-2B-Base puede heredar sesgos del modelo base, no evaluados por el autor.
- Idiomas: no se declaran idiomas soportados; el unico ejemplo esta en chino, por lo que el comportamiento con transcripciones en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor aclara que Qwen y Alibaba Cloud no respaldan ni patrocinan el proyecto; deben conservarse `LICENSE` y `NOTICE`.
- El repositorio no incluye datos de entrenamiento, lo que dificulta la auditoria del comportamiento.
- Creado y actualizado el mismo dia (2026-11-08) con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AkiPolaris777/live2d-expression-model-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.

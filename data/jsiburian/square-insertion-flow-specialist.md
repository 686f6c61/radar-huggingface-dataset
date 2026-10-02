# jsiburian/square-insertion-flow-specialist

## Resumen

El modelo `square-insertion-flow-specialist` es una politica de robotica basada en flow matching, desarrollada por Jeremy Siburian (jsiburian) y publicada en Hugging Face bajo la libreria PyTorch. Resuelve una tarea concreta de manipulacion: colocar una tuerca cuadrada sobre una clavija (task Square) en el simulador robosuite, en su variante MimicGen `Square_D1` con un robot Franka Panda. Predice fragmentos (chunks) de 15 pasos de offsets de posicion articular y un comando de pinza a partir de dos imagenes de camara y el estado del robot.

Tecnicamente, es una politica pequena de 33,9 millones de parametros que combina un encoder de imagen DINOv3 ViT-S/16 (21,6 M de parametros, fine-tuneado de extremo a extremo) con un experto de accion estilo Gemma de 8 capas y 12 M de parametros. Se entrena por imitacion (behaviour cloning) sobre 44 demostraciones generadas con MimicGen, y sus pesos se distribuyen como pesos EMA en `model.safetensors`.

Su relevancia es como componente de investigacion: el propio autor lo describe como un "especialista" o proxy de tarea dentro de su trabajo sobre Proxy Policy Steering (PPS), donde se combina con una politica base de muestreo planificada por un VLM. No es una politica autonoma fuerte: por si solo resuelve 5 de 50 escenas de prueba (10% de exito).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ProxyPytorch` (variante flow): encoder de imagen DINOv3 ViT-S/16 + experto de accion estilo Gemma de 8 capas (gemma_12m: ancho 384, MLP 512, 8 cabezas, 1 cabeza KV, dim de cabeza 128) + proyecciones lineales de estado/accion/tiempo |
| Parametros totales | 33,9 M (21,6 M en el encoder DINOv3), float32 |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica: procesa 2 imagenes RGB de 224 x 224 y un vector de estado de 8 dimensiones; genera un chunk de accion de 15 x 8 |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no aplica; el pipeline de entrada tokeniza el prompt, pero el modelo no atiende a tokens de lenguaje |
| Licencia | DINOv3 License (etiquetada como `license: other`) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Mecanismo de atencion | `two_block_diffusion`: los tokens de imagen y estado forman un bloque y el chunk de accion ruidoso el segundo |
| Modelo base | `facebook/dinov3-vits16-pretrain-lvd1689m` |

## Arquitectura y entrenamiento

La arquitectura es una politica de flow matching con atencion de dos bloques (`two_block_diffusion`): el primer bloque agrupa los tokens de imagen (dos vistas de camara) y el vector de estado de 8 dimensiones, mientras que el segundo bloque contiene el chunk de accion ruidoso. El encoder visual es el DINOv3 ViT-S/16 de Meta, fine-tuneado sin congelar. Sobre el, un experto de accion estilo Gemma de 8 capas (config `gemma_12m`, ancho 384, MLP 512, 8 cabezas de atencion, 1 cabeza KV, dimension de cabeza 128) genera el chunk de accion. El estado de entrada son las 7 posiciones articulares del brazo (rad) mas el cierre de pinza normalizado `clip((0.080 - aperture) / 0.080, 0, 1)`. La salida es un chunk de 15 x 8: las columnas 0-6 son objetivos de posicion articular como offsets respecto a las articulaciones actuales, y la columna 7 es el comando de pinza (0 = abierta, 1 = cerrada).

El entrenamiento es behaviour cloning sobre demostraciones de MimicGen `Square_D1` (variante de robosuite `NutAssemblySquare` con una distribucion de estado inicial mas amplia que D0). Se usan 44 demostraciones para entrenamiento y 5 reservadas (`demo_45`-`demo_49`), con 6.032 ventanas de entrenamiento (stride 1). La configuracion es `flow_task_square_bc` de un fork de openpi: 20.000 pasos con batch de 32, optimizador AdamW, learning rate pico de 2,5e-5 con 1.000 pasos de warm-up y decaimiento coseno hasta 2,5e-6, tiempo de flow muestreado con `beta(1.5, 1) · 0.999 + 0.001`, aumento de imagen con desplazamiento aleatorio de hasta 4 px y EMA de 0.999. La convencion de flow es `x_t = (1 - t) · a + t · ε`, con prediccion de la velocidad `ε - a` e integracion de t = 1 (ruido) a t = 0 mediante 10 pasos Euler (`sample_actions(num_steps=10)`). Las acciones se relabelan para un controlador de posicion articular: el objetivo del paso t es la posicion articular del paso t + 1, con el comando de pinza mapeado de -1/+1 a 0/1.

## Capacidades

- Generacion de acciones de manipulacion: predice chunks de 15 pasos de offsets de posicion articular (7 grados de libertad) y un comando de pinza.
- Percepcion visual: procesa dos imagenes RGB de 224 x 224 (camara de mesa agentview y camara de muneca eye-in-hand).
- Fusion multimodal de estado y vision: integra el estado proprioceptivo de 8 dimensiones con las imagenes mediante atencion de dos bloques.
- Control por flow matching: muestrea acciones integrando un campo de velocidad con 10 pasos Euler.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es una politica de control de un unico paso de inferencia (con chunking de horizonte fijo).
- No tiene capacidades multilingues ni procesa tokens de lenguaje, pese a que el pipeline tokenice un prompt.
- No dispone de modo de razonamiento (thinking), vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Investigacion en Proxy Policy Steering (PPS): el modelo actua como "especialista" o proxy de tarea entrenado por imitacion, combinado con una politica base de muestreo planificada por un VLM, para estudiar como dirigir el muestreo hacia trayectorias utiles.
- Evaluacion de metodos de steering: sirve como componente de referencia para medir si una politica base mejora su exito al ser guiada por una politica entrenada en la tarea objetivo.
- Benchmark de imitacion con pocas demostraciones: permite estudiar el comportamiento de behaviour cloning con solo 44 demostraciones en una tarea de insercion de precision en simulacion.
- Punto de partida para fine-tuning en robosuite/MimicGen: la config `flow_task_square_bc` y los pesos publicados permiten reentrenar o adaptar el especialista a variantes proximas de la tarea Square.
- Estudio de arquitecturas encoder + experto de accion: la combinacion DINOv3 ViT-S/16 con un experto estilo Gemma de 8 capas es un caso reproducible para analizar disenos ligeros de politicas de flow matching.
- Comparacion de politicas en simulacion controlada: sirve para reproducir el panel de 50 escenas de `Square_D1` y comparar tasas de exito entre enfoques.
- Generacion de datos de evaluacion: util para construir paneles de prueba y validar controladores de posicion articular en Franka Panda dentro de robosuite.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Exito en panel de 50 escenas (`Square_D1`, escenas 1-50) | 5 / 50 (10%) |
| Criterio de exito | la tuerca descansa sobre la clavija (check propio de la tarea) |

No se han publicado en la informacion disponible otros resultados de benchmarks (tipo MMLU, HumanEval o GSM8K), que no aplican a una politica de robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 33,9 M de parametros ocupan aproximadamente 136 MB; sumando activaciones de dos imagenes de 224 x 224, la huella es muy reducida (del orden de unos pocos cientos de MB).
- GPU recomendadas: cualquier GPU con suficiente memoria para el encoder visual y el experto de accion; cabe en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con varios GB de VRAM.
- Opciones de despliegue: requiere el fork de openpi que define `ProxyPytorch` y la config `flow_task_square_bc`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la inferencia implica 10 pasos Euler sobre el experto de accion.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (politicas de manipulacion por imitacion). Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| square-insertion-flow-specialist | Flow matching + encoder DINOv3, 8 capas de accion | 33,9 M | DINOv3 License | Hugging Face |
| Diffusion Policy | Politica por difusion | no disponible | no disponible | no disponible |
| ACT (Action Chunking Transformer) | Transformer con chunking de acciones | no disponible | no disponible | no disponible |
| openpi pi0 | Politica vision-lenguaje-accion | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulacion: entrenado y evaluado en robosuite / MimicGen `Square_D1`; no hay validacion en robot real.
- Un unico robot y una unica configuracion de camaras: Franka Panda con camara agentview y camara de muneca; no se garantiza transferencia a otro setup.
- Entrenado sobre 44 demostraciones: la tasa de exito autonoma es baja (10%, 5 de 50 escenas), por lo que no es util como controlador autonomo.
- Las acciones son offsets de posicion articular para un controlador de posicion articular y no se transfieren directamente a otros controladores o robots.
- No procesa lenguaje: aunque el pipeline tokenice un prompt, el modelo no atiende a tokens de lenguaje, por lo que no responde a instrucciones en texto.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; al ser una politica de control, el fallo se manifiesta como acciones que no completan la tarea.
- Restricciones de licencia: los pesos contienen una copia fine-tuneada de DINOv3 y se distribuyen bajo la DINOv3 License, lo que impone condiciones de uso comercial derivadas del modelo base de Meta. Conviene revisar `LICENSE.md` antes de cualquier uso en produccion.
- Uso en produccion: no recomendado como politica autonoma; su proposito declarado es servir como componente de steering en investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsiburian/square-insertion-flow-specialist
- Perfil del autor: https://huggingface.co/jsiburian
- Modelos del autor: https://huggingface.co/jsiburian/models
- Web personal del autor (Jeremy Siburian): https://jsiburian.github.io/
- Modelo base DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Repositorio DINOv3 (licencia): https://github.com/facebookresearch/dinov3

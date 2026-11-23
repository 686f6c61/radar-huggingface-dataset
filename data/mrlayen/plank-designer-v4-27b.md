# MrLayen/plank-designer-v4-27b

## Resumen

plank-designer-v4-27b es un adaptador LoRA de tipo SFT sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por MrLayen. Su proposito no es el de un asistente general, sino el de un generador de planes estructurados en JSON para construcciones de tablones de madera (plank structures) que un robot KUKA ensambla fisicamente. A partir de una peticion en ingles o aleman, y opcionalmente de una lista de piezas de madera disponibles, el modelo devuelve un plan con nodos, miembros por capas y las piezas asignadas a cada miembro junto con sus cortes.

El modelo es la version de 27B de la familia plank-designer, sucesora del plank-designer-v4 basado en Qwen3-4B, y se entrena sobre el mismo conjunto de datos v4. Se integra con la aplicacion Plank Studio y con el paquete ROS 2 `kuka_plank_structures`, lo que lo convierte en un componente de un pipeline robotico real y no en un modelo de proposito general.

La relevancia actual reside en su enfoque: un modelo pequeno y especializado, con un adaptador de rango 16 de solo 435 MB, que supera en su tarea concreta a alternativas genericas y que se distribuye tanto como adaptador PEFT como en GGUF cuantizado Q6_K para su despliegue local con Ollama. Incorpora ademas un modo de razonamiento (thinking) pensado para formas no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8-27B) con atencion estandar y linear-attention; adaptador LoRA sobre las proyecciones de atencion, linear-attention y MLP |
| Parametros totales | 26.895.998.464 (modelo base); adaptador LoRA de 435 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configurado en el Modelfile de Ollama); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q6_K (GGUF de 22 GB); adaptador en bf16; bf16 para el base |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q6_K), Modelfile de Ollama, tokenizer y chat template en JSON/Jinja |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre las proyecciones de atencion, linear-attention y MLP del modelo de lenguaje de Qwen/Qwen3.8-27B (revision `1d4bf0f`). El entrenamiento se realizo en modo texto, con prompts construidos con `enable_thinking=False`, sobre el conjunto de datos plank-designer v4: 5.483 conversaciones que incluyen peticiones con y sin piezas, peticiones de seguimiento y casos de "cannot" (imposible de construir). La perdida se calculo unicamente sobre las respuestas.

El entrenamiento uso learning rate 2e-4 con scheduler coseno, 2 epocas, precision bf16, y se completo en 66,5 minutos sobre 4 GPU NVIDIA GH200 en el centro de supercomputacion JUPITER (Julich). La perdida final de evaluacion fue de 0,040. Se emplearon transformers 5.20 y PEFT 0.21, y el GGUF se genero con llama.cpp. El modelo conserva la capacidad de razonamiento del base (thinking mode), que el autor recomienda desactivar para las formas entrenadas y activar para formas nuevas.

## Capacidades

- Generacion de planes estructurados en JSON para construcciones de tablones: nodos, miembros con capas y piezas con sus cortes.
- Interpretacion de peticiones en ingles y aleman (por ejemplo, "a ladder with 5 rungs" o "eine Brucke uber 1,2 m").
- Asignacion de piezas de madera a cada miembro a partir de una lista de piezas disponibles.
- Gestion de peticiones de seguimiento y de casos en los que la estructura no es construible ("cannot").
- Modo de razonamiento (thinking) para formas no vistas durante el entrenamiento (circulos, estrellas, letras), con hasta dos rondas de reparacion.
- Integracion con tooling robotico: salida consumible por Plank Studio y por el paquete ROS 2 `kuka_plank_structures`.
- Soporte de despliegue via Ollama (Modelfile con temperature 0 y contexto 40960) y via transformers + PEFT.
- No dispone de capacidades generales de asistente, vision, audio ni tool calling generico; su ambito es exclusivamente el diseno de estructuras de tablones.

## Casos de uso

- Diseno automatico de estructuras de tablones para fabricacion robotica: el modelo recibe la peticion en lenguaje natural y devuelve el plan JSON que el robot KUKA ejecuta, lo que elimina la necesidad de programar cada estructura a mano.
- Generacion de planes a partir de inventario disponible: dada una lista de piezas de madera, el modelo propone una estructura construible con esas piezas, util en talleres con stock variable.
- Modo de exploracion de formas nuevas: con `think: true` y hasta dos rondas de reparacion, permite generar estructuras no entrenadas (circulos, estrellas, letras) para prototipado rapido, con un tiempo mediano de 69 s en una GH200.
- Integracion en pipelines ROS 2: el modelo se conecta al paquete `kuka_plank_structures` para que la salida JSON alimente directamente la planificacion de movimiento del robot.
- Asistencia en el diseno de puentes y escaleras de madera: peticiones como "eine Brucke uber 1,2 m" o "a ladder with 5 rungs" se traducen en planes con cortes concretos, utiles en docencia o en ingenieria de estructuras ligeras.
- Despliegue local en estacion de trabajo: el GGUF Q6_K de 22 GB cabe en una GPU consumer de 24 GB (RTX 5090) a 40K de contexto, lo que permite usar el modelo en un taller sin conexion a la nube.
- Validacion y reparacion de planes: Plank Studio comprueba la geometria y las piezas y reutiliza el modelo para reparar los planes que fallan, lo que mejora la tasa de exito del 41 % al 98 % en la evaluacion del autor.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 273 peticiones de test no vistas en entrenamiento, en porcentaje (valid = plan construible, match = misma estructura que la referencia):

| Configuracion | valid | match |
|---|---|---|
| Modelo solo, primera respuesta | 41 | 40 |
| + el solver elige las piezas a partir de la geometria | 81 | 77 |
| + re-preguntar las respuestas "cannot" sin piezas, luego el solver | 98 | 94 |
| plank-designer-v4 (4B) + solver, como comparacion | 97 | 82 |

Formas nuevas, 35 peticiones no vistas en entrenamiento (juzgadas a partir de los dibujos):

| Configuracion | Reconocibles |
|---|---|
| Thinking off | 6 / 35 (convierte formas nuevas en tipos entrenados: una H se convierte en escalera) |
| Thinking on, hasta 2 rondas de reparacion | 31 / 35 (todas construibles; mediana de 69 s en una GH200) |

El archivo Q6_K obtuvo los mismos resultados que bf16 en una muestra de 99 peticiones (re-ask + solver: 99 / 96). El thinking empeora las formas entrenadas (77 % a 59 % construibles en la primera respuesta), por lo que el autor recomienda desactivarlo para ellas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB libres para el GGUF Q6_K de 22 GB con contexto de 40K; el adaptador LoRA en bf16 requiere cargar el base Qwen3.8-27B en bf16 (unos 54 GB) mas el adaptador.
- GPU recomendadas: NVIDIA GH200 (usada en el entrenamiento y en la medicion de thinking), RTX 5090 (24 GB, soporta el GGUF a 40K de contexto), A100/H100 para despliegue en bf16.
- Cabe en GPU consumer: si, en RTX 5090 con el GGUF Q6_K; en GPUs de 24 GB o menos habria que reducir contexto o cuantizar mas.
- Opciones de despliegue: Ollama (probado con 0.40.16, mediante el Modelfile incluido), transformers + PEFT, llama.cpp para la generacion del GGUF.
- Latencia y throughput: respuestas de pocos segundos con thinking off; con thinking on, mediana de 69 s en una GH200 para formas nuevas. No se dispone de cifras de throughput (tokens/s) en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plank-designer-v4-27b | 26,9B (base) + LoRA r16 | 40.960 tokens | 98 % valid / 94 % match (con solver y re-ask) | Apache 2.0 | Hugging Face, GGUF, Ollama |
| plank-designer-v4 (4B) | 4B (base Qwen3-4B) | no disponible | 97 % valid / 82 % match (con solver) | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 26,9B | no disponible | no disponible (no especializado en la tarea) | no disponible | Hugging Face |

El modelo de 27B mejora al de 4B principalmente en la tasa de match estructural (94 % frente a 82 %) y en la capacidad de abordar formas nuevas mediante thinking. Frente al base sin adaptar, la diferencia es la especializacion en el formato JSON del proyecto y en la terminologia de estructuras de tablones.

## Limitaciones y advertencias

- Solo sirve para estructuras de tablones en el formato del proyecto; no es un asistente general y no debe usarse como tal.
- Las elecciones de piezas del modelo por si solas son debiles: con pocas piezas disponibles a menudo responde "cannot" aunque la estructura sea construible; Plank Studio lo compensa re-preguntando sin piezas y dejando que el solver las elija.
- Todo plan debe verificarse antes de que el robot lo construya; Plank Studio comprueba geometria y piezas y permite al modelo reparar lo que falla.
- Con thinking activado, algunas formas nuevas siguen saliendo erroneas o solo vagamente reconocibles (4 de 35 no reconocibles en la evaluacion).
- El thinking empeora el rendimiento en las formas entrenadas (77 % a 59 % construibles en la primera respuesta), por lo que debe mantenerse desactivado para ellas.
- Idiomas limitados a ingles y aleman; no hay soporte declarado de castellano.
- Riesgo de alucinacion en la generacion de planes: el modelo puede producir estructuras no construibles o asignaciones de piezas invalidas, como refleja la tasa de validacion del 41 % en primera respuesta sin solver.
- No se han publicado datos sobre sesgos; al ser un modelo especializado en una tarea tecnica, el riesgo de sesgo social es bajo pero no evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrLayen/plank-designer-v4-27b
- Modelo predecesor (4B): https://huggingface.co/MrLayen/plank-designer-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto Plank Studio y paquete ROS 2 `kuka_plank_structures`: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada

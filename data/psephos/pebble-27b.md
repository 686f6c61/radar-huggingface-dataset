# psephos/pebble-27b

## Resumen

Pebble-27B es un adaptador LoRA entrenado sobre el modelo base Qwen3.5-27B, desarrollado por el usuario psephos, que convierte un modelo de lenguaje generativo en un predictor de estados para entornos dinamicos. Su funcion es recibir un estado observado (coordenadas de un robot, un tablero de Sokoban o localizaciones de participantes en una descripcion textual) junto con una secuencia de una o cuatro acciones, y generar el estado resultante tras aplicar esas acciones. Se trata, por tanto, de un modelo de mundo (world model) de horizonte corto implementado como adaptador PEFT sobre un transformer multimodal de 27.000 millones de parametros.

El modelo no genera texto libre ni mantiene conversaciones generales: su pipeline declarado es text-generation, pero su objetivo real es la prediccion de estado estructurada en formato JSON. Utiliza la misma interfaz para dominios muy distintos (manipulacion robotica, puzzles discretos y procesos fisicos descritos en lenguaje natural), lo que lo hace relevante como banco de pruebas para investigar hasta que punto un LLM puede aprender dinamicas de transicion sin un modulo de planificacion explicito.

La relevancia actual radica en su enfoque: en lugar de entrenar un modelo de mundo desde cero, reutiliza un LLM multimodal congelado y entrena solo 108,8 millones de parametros en adaptadores de rango 16. El repositorio ocupa 0,5 GB y requiere los pesos base de Qwen3.5-27B para funcionar. La model card no documenta resultados de evaluacion a nivel de tarea, solo la perdida de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Qwen3.5-27B |
| Parametros totales | 27.000 millones (base) + 108.789.760 (adaptador entrenado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-27B; no especificada en la model card) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (ejemplo oficial); BF16 nativo |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,5 GB |
| Rango LoRA | 16 (alpha 32, dropout 0,05) |
| Modulos adaptados | proyecciones de atencion y MLP del decoder de lenguaje |
| Modelo base | Qwen/Qwen3.5-27B (revision 81a287ca484a5e71148f5beb7f367bb5286d70f9) |
| Revision del adaptador | 442603b624a3d772793703aa9f6d7bebb4c3e8cb |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado sobre las proyecciones de atencion y MLP del decoder de lenguaje de Qwen3.5-27B. El codificador de vision del modelo base permanece congelado y el base se carga en 4-bit NF4 durante el entrenamiento, de modo que solo se actualizan los 108.789.760 parametros del adaptador. La interfaz de entrada codifica observaciones y comandos como texto (coordenadas, tableros o descripciones), y la salida es texto estructurado (arrays JSON, tableros o listas de localizaciones). El entrenamiento se realizo durante una epoca en una A100 de Google Colab, con 16 ejemplos por actualizacion del optimizador y tasa de aprendizaje de 0,0001. La funcion de perdida puntua unicamente los tokens del estado futuro del asistente y el token de fin de turno; los tokens de prompt y de relleno estan enmascarados.

Los datos de entrenamiento combinan cuatro fuentes: LeRobot PushT (10.396 ejemplos, prediccion de coordenadas x/y del empujador), LeRobot SO-101 pick-and-place (4.782 ejemplos, seis posiciones de articulaciones y pinza), Google DeepMind Boxoban (32.000 ejemplos, tablero completo tras los movimientos) y AI2 ProPara (4.105 ejemplos, localizacion de cada participante). Los splits preparados contienen 51.283 ejemplos de entrenamiento, 10.171 de validacion y 10.362 de test, manteniendo juntas las ventanas de un mismo episodio robotico y las ramas de un mismo tablero o parrafo. La perdida final de validacion fue 0,2371 sobre una muestra fija de 256 ejemplos (32 por fuente y horizonte). No se documenta el uso de RLHF ni DPO, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de estado a un paso: dado un estado observado y una accion, genera el estado resultante en formato JSON.
- Prediccion a cuatro pasos: dado un estado y una secuencia de cuatro acciones o eventos, genera directamente el estado final.
- Prediccion de coordenadas roboticas: coordenadas x/y del empujador en PushT y seis posiciones de articulaciones y pinza en SO-101.
- Prediccion de tableros discretos: genera el tablero completo de Sokoban tras los movimientos, preservando muros, metas, cajas, jugador y espacios.
- Razonamiento sobre procesos fisicos descritos en texto: localiza a cada participante de un parrafo de ProPara, usando guion para ausente e interrogante para presente en localizacion desconocida.
- Generacion de texto estructurado con plantilla de chat propia (thinking desactivado en el ejemplo oficial).
- No soporta tool calling, function calling, uso agentico ni modos de pensamiento extendido en la documentacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en modelos de mundo: usar el adaptador como banco de pruebas para medir hasta que punto un LLM congelado aprende dinamicas de transicion, comparando la perdida de validacion con la del base sin adaptar.
- Simulacion de trayectorias roboticas offline: dado un episodio de PushT o SO-101, generar las posiciones esperadas tras cada comando para detectar discrepancias con las trayectorias registradas antes de desplegar un controlador.
- Verificacion de planes en Sokoban: introducir un tablero y una secuencia de movimientos para comprobar si el estado final generado coincide con el esperado, como filtro previo a un planificador simbolico.
- Extraccion de estados en descripciones de procesos: procesar parrafos de ProPara para obtener la localizacion de cada participante y validar anotaciones de corpus cientificos.
- Generacion de datos sinteticos de transicion: producir pares estado-accion-estado para aumentar datasets de aprendizaje por imitacion en tareas de horizonte corto.
- Evaluacion de robustez de LLM en prediccion fisica: medir la tasa de JSON valido y el error de coordenadas en tareas roboticas para caracterizar el fallo del modelo en dominios fisicos.
- Prototipado de interfaces de prediccion: integrar el adaptador en un pipeline de investigacion que reciba observaciones en texto y devuelva estados estructurados, sin requisitos de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de validacion de 0,2371 (entropia cruzada de siguiente token sobre 256 ejemplos fijos, 32 por fuente y horizonte). La model card indica explicitamente que las puntuaciones en estados generados y la comparacion contra el base sin adaptar aun no se han publicado. El protocolo de evaluacion propuesto por el autor incluye error de coordenadas y tasa de JSON valido en tareas roboticas, coincidencia exacta de tablero en Boxoban y precision de localizacion por participante en ProPara, puntuando los dos horizontes por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo oficial carga el base en 4-bit NF4 con doble cuantizacion, lo que situa el consumo en el rango de 15-20 GB para un modelo de 27.000 millones de parametros; en BF16 nativo se requeririan aproximadamente 54 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: A100 (usada en el entrenamiento), H100, o GPUs consumer de gama alta con al menos 24 GB para la configuracion 4-bit.
- Cabe en GPU consumer: si, en configuracion 4-bit NF4 en tarjetas de 24 GB o mas (RTX 3090, RTX 4090); en BF16 no cabe en consumer.
- Opciones de despliegue: transformers con PEFT y BitsAndBytes (unico camino documentado); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador y requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pebble-27B | 27B (base) + 108,8M (adaptador) | no disponible | Prediccion de estado de horizonte corto via LoRA | no disponible | Hugging Face (adaptador) |
| Qwen3.5-27B (base) | 27B | no disponible | LLM multimodal generativo | no disponible | Hugging Face |
| Modelos de mundo especificos (p. ej. Dreamer, IRIS) | variable | no aplica | Aprendizaje de dinamicas desde cero | variable | Repositorios de investigacion |

La comparacion directa con otros adaptadores de prediccion de estado no esta disponible en la informacion proporcionada. Frente al base Qwen3.5-27B, la diferencia es que Pebble restringe la salida a estados estructurados y ha sido ajustado con datos de transicion, aunque no se han publicado metricas comparativas.

## Limitaciones y advertencias

- Las salidas son texto generado y pueden contener arrays malformados, coordenadas fisicamente implausibles o transiciones de tablero ilegales.
- El objetivo de PushT describe unicamente el empujador; no se predicen objetos ni se modela la camara.
- El movimiento de objetos, la prediccion en marco de camara, los rollouts largos y el control robotico en bucle cerrado quedan fuera del alcance evaluado.
- Un movimiento bloqueado en Sokoban puede dejar el tablero sin cambios, por lo que se recomienda una linea base de "copiar estado actual" para distinguir empujes exitosos de predicciones correctas de no movimiento.
- No se han publicado puntuaciones a nivel de tarea ni comparacion contra el base sin adaptar; la perdida de validacion por si sola no garantiza calidad en estados generados.
- Solo se declara soporte de ingles.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Requiere cargar los pesos base de Qwen3.5-27B, con el coste de VRAM y almacenamiento asociado.
- El entrenamiento se realizo en una sola A100 de Colab durante una epoca, lo que limita la confianza en la generalizacion fuera de las cuatro fuentes de datos.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/psephos/pebble-27b
- Archivos del adaptador: https://huggingface.co/psephos/pebble-27b/tree/442603b624a3d772793703aa9f6d7bebb4c3e8cb
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset LeRobot PushT: https://huggingface.co/datasets/lerobot/pusht
- Dataset LeRobot SO-101 pick-and-place: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Boxoban levels (Google DeepMind): https://github.com/google-deepmind/boxoban-levels
- AI2 ProPara: https://github.com/allenai/propara
- Repositorio del proyecto (preparacion de datos): https://github.com/solarkinn/pebble/blob/dd934c9/data/DATASETS.md
- Protocolo de evaluacion y baselines: https://github.com/solarkinn/pebble/blob/dd934c9/data/DATASETS.md#measuring-learned-dynamics
- Configuracion de entrenamiento: https://github.com/solarkinn/pebble/blob/dd934c9/configs/base.yaml

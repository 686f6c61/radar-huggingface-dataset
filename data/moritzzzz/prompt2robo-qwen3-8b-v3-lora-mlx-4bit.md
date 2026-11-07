# moritzzzz/Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit

## Resumen

Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit es un ajuste fino del modelo Qwen3-8B de Alibaba Qwen, desarrollado por el usuario moritzzzz, orientado a la generacion de codigo de control para un brazo robotico simulado LARA 5 en el entorno MuJoCo. El modelo recibe una peticion en lenguaje natural junto con una lista de identificadores y colores de cubos, y produce un programa Python con la funcion `run(robot)` que resuelve la tarea, o una negativa breve si la peticion no es realizable. No ve coordenadas: el programa generado lee las posiciones en tiempo de ejecucion a traves de la API `robot`.

Tecnicamente se trata de un LoRA (r=64, learning rate 1e-4, 4 epocas) aplicado sobre el modelo base en bf16 y posteriormente fusionado y cuantizado a 4 bits en formato MLX para Apple Silicon. El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parametros con licencia Apache 2.0. El repositorio ocupa 4,6 GB y esta pensado para ejecutarse con `mlx_lm` en hardware de Apple.

Su relevancia es acotada pero concreta: demuestra un pipeline completo de ajuste fino para una tarea de robotica de manipulacion verificada en simulador, con particiones de validacion y held-out nunca vistas en entrenamiento, y con resultados medidos mediante un checker estricto. Es un caso de uso especializado, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con LoRA y cuantizado a 4 bits en MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (este repositorio); adaptador LoRA y modelo fusionado en bf16 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit); libreria `mlx` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parametros. Sobre la base en bf16 se aplico un ajuste supervisado (SFT) con LoRA de rango 64, learning rate 1e-4 y 4 epocas, usando el dataset Carlo0001/Prompt2Robo en su version `data_v2`: 1322 muestras de entrenamiento, 132 de validacion y 163 de held-out, todas verificadas en simulador. Posteriormente el adaptador se fusiono en los pesos bf16 y el modelo resultante se cuantizo a 4 bits en formato MLX para Apple Silicon.

La tarea de entrenamiento es la traduccion de una peticion corta mas una lista de cubos (id y color) a un programa Python `def run(robot): ...` para el brazo simulado LARA 5, o a una negativa breve. El modelo no recibe coordenadas: el codigo generado consulta las posiciones en tiempo de ejecucion. El entrenamiento emplea la plantilla de chat no-thinking de Qwen3, con el bloque `<think></think>` vacio incluido en el prompt, y requiere el `system_prompt.md` exacto del repositorio de datos. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de codigo Python para control de un brazo robotico simulado (LARA 5 en MuJoCo), con la firma `def run(robot): ...`.
- Razonamiento de planificacion de manipulacion a partir de instrucciones en lenguaje natural y una lista de objetos con id y color.
- Generacion de negativas controladas cuando la peticion no es realizable con la API disponible.
- Lectura diferida de posiciones: el codigo generado consulta el estado del robot en tiempo de ejecucion en lugar de asumir coordenadas.
- Conversacion y generacion de texto heredadas del modelo base Qwen3-8B (no evaluadas especificamente en este ajuste).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking activo; de hecho, el ajuste se entreno explicitamente con el bloque de pensamiento vacio.

## Casos de uso

- Generacion de programas de manipulacion en simulacion: dado un enunciado como "pon el cubo rojo encima del azul" y la lista de objetos, el modelo emite un programa `run(robot)` que se ejecuta y verifica en MuJoCo con `tools/check.py`. Es el caso de uso central y el unico validado por el autor.
- Prototipado rapido de tareas roboticas: permite iterar sobre familias de tareas nuevas en simulador antes de escribir controladores a mano, gracias a los 1322 ejemplos de entrenamiento verificados.
- Evaluacion de pipelines texto-a-codigo en robotica: sirve como referencia reproducible para comparar metodos de ajuste (LoRA frente a QLoRA, distintas versiones de datos) dentro de la misma familia de repositorios.
- Filtrado y rechazo de peticiones invalidas: el modelo aprende a devolver una negativa breve ante ordenes imposibles, lo que resulta util para construir capas de validacion en interfaces de control.
- Docencia e investigacion en robotica simulada: el par modelo + dataset + checker permite estudiar la brecha entre exactitud en simulador y generalizacion a redacciones o escenas nuevas.
- Demostracion en hardware Apple Silicon: al estar en MLX 4-bit, puede ejecutarse localmente en un Mac para pruebas interactivas o para la aplicacion Mac "Prompt2Robo" mediante el campo "Other...".

## Benchmarks y rendimiento

Los resultados publicados por el autor miden la tarea resuelta en simulacion MuJoCo con el checker estricto `tools/check.py`, sobre muestras nunca entrenadas. Las puntuaciones corresponden a los pesos bf16, al adaptador o al modelo fusionado, no a la version MLX 4-bit.

| Evaluacion | Resultado | Base sin ajustar |
|---|---|---|
| Split de evaluacion original | 76/102 (74,5%) | no disponible |
| eval_v2 (nuevas familias de tareas) | 40/61 (65,6%) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX 4-bit ocupa 4,6 GB, por lo que la inferencia cabe en memoria unificada de un Mac con al menos unos 6-8 GB libres; el modelo fusionado en bf16 requeriria del orden de 16 GB o mas.
- GPU recomendadas: el formato es MLX, disenado para Apple Silicon (serie M). No esta pensado para GPU NVIDIA; para CUDA habria que usar el adaptador o el modelo fusionado con otra herramienta.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; en GPUs de consumo NVIDIA no se ofrece una version lista en este repositorio.
- Opciones de despliegue: `mlx_lm` (load/generate) y la aplicacion Mac Prompt2Robo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit | 8,19 B | no disponible | 74,5% / 65,6% (simulador) | Apache 2.0 | MLX 4-bit, adaptador y fusionado |
| Prompt2Robo-Qwen3-8B-v3-qlora-MLX-4bit | 8,19 B (base) | no disponible | no disponible | Apache 2.0 | MLX 4-bit y adaptador |
| Qwen3-8B (base) | 8,19 B | no disponible | no evaluado en la tarea | Apache 2.0 | MLX 4-bit oficial y comunidad |
| Qwen3-8B-4bit (mlx-community) | 8,19 B | no disponible | no aplica (sin ajuste) | Apache 2.0 | MLX 4-bit |

La comparacion relevante es interna a la familia Prompt2Robo (v1, v2, v3-lora, v3-qlora); el autor advierte que las diferencias pequenas entre versiones son ruido dada la muestra de held-out.

## Limitaciones y advertencias

- Los conjuntos de held-out son pequenos (unos ±6 puntos al 95% para 163 muestras), por lo que diferencias pequenas entre versiones no son significativas.
- Casi todas las muestras de held-out pertenecen a familias de tareas presentes en entrenamiento con redacciones y escenas nuevas; un tipo de peticion realmente nuevo puede rendir peor que las cifras publicadas.
- Las versiones MLX 4-bit se comprimen despues del entrenamiento y no fueron puntuadas en el simulador; las cifras provienen de bf16, del adaptador o del modelo fusionado.
- El checker es estricto: cualquier contacto de un dedo o del brazo con un cubo o la mesa cuenta como fallo.
- El modelo solo conoce el brazo LARA 5 simulado y la API `robot` del dataset; no esta validado para un robot real y el codigo generado debe ejecutarse primero en simulacion.
- Riesgo de alucinacion en codigo y en la interpretacion de peticiones ambiguas, inherente al ajuste sobre un modelo generativo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni validacion fuera del simulador.
- Requiere el `system_prompt.md` exacto del dataset y la plantilla de chat no-thinking; usar otra plantilla degrada el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit
- Adaptador v3-lora: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v3-lora-adapter
- Version v3-qlora MLX 4-bit: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v3-qlora-MLX-4bit
- Adaptador v3-qlora: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v3-qlora-adapter
- Version v2 MLX 4-bit: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v2-MLX-4bit
- Adaptador v2 QLoRA: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v2-QLoRA-adapter
- Version v1 MLX 4-bit: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-MLX-4bit
- Adaptador v1 QLoRA: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-QLoRA-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Qwen3-8B-MLX-4bit oficial: https://huggingface.co/Qwen/Qwen3-8B-MLX-4bit
- Qwen3-8B-4bit de la comunidad MLX: https://huggingface.co/mlx-community/Qwen3-8B-4bit

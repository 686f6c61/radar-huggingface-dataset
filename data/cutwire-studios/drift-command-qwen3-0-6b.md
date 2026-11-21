# CutWire-Studios/drift-command-qwen3-0.6b

## Resumen

drift-command-qwen3-0.6b es un ajuste fino mediante LoRA de Qwen/Qwen3-0.6B, desarrollado por CutWire-Studios, orientado a una tarea muy concreta: convertir comandos de edicion de video en lenguaje natural (por ejemplo, "fade in half a second" o "make it black and white") en llamadas a herramientas (tool calls) estructuradas contra las operaciones MCP de Drift, un editor de video de codigo abierto. El modelo actua como motor de una barra de comandos offline dentro de la aplicacion.

Se trata de un checkpoint de investigacion intermedio, no de una funcionalidad publicada del editor. Con 596.049.920 parametros (aproximadamente 0,6 mil millones), hereda la arquitectura transformer densa y el chat template de Qwen3, y se distribuye en tres formatos: un adaptador PEFT LoRA (r=32), pesos fusionados en fp16 y una cuantizacion GGUF Q6_K de 495 MB pensada para llama.cpp y LM Studio.

Su relevancia es practica: demuestra que un modelo de menos de mil millones de parametros, ajustado con datos sinteticos y validado contra esquemas JSON, puede pasar de un 45,2% a un 72,4% de llamadas exactas en un dominio cerrado de aproximadamente diez herramientas, con una latencia de unos 8 segundos en CPU. Es un caso de estudio util sobre especializacion de modelos pequenos para function calling y sobre los limites de esa estrategia (multi-step debil, retrieval como cuello de botella, idioma unico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | GGUF Q6_K (495 MB); adaptador LoRA y pesos fusionados en fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA PEFT y merged_fp16), GGUF (Q6_K) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parametros, y se especializa mediante un adaptador LoRA con rango 32 y alpha 32 aplicado sobre todas las proyecciones de atencion y MLP. El entrenamiento se realizo con Unsloth sobre una unica GPU T4 durante aproximadamente 1,5 horas: 2 epocas, tasa de aprendizaje 2e-4 con schedule coseno, batch efectivo de 16, longitud maxima de 4096 tokens y calculo de perdida solo sobre las completions (no sobre el prompt).

Los datos son 4.292 registros de entrenamiento y 185 de validacion, sinteticos y escritos a mano por operacion, validados contra los esquemas JSON de Drift y comprobados para evitar fuga de datos entre train y test. El formato de prompt usa el chat template nativo de Qwen3 con `tools=[...]` y `enable_thinking=False`; el mensaje de sistema incluye una frase de instruccion y una linea de contexto con el clip seleccionado y la posicion del cabezal de reproduccion. La salida son bloques `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` o la cadena `No tool fits this request.` La perdida final fue de 0,020 en entrenamiento y 0,046 en validacion.

Una innovacion destacable, y a la vez una advertencia tecnica, es el formato de decodificacion: el modelo escribe primero las claves `track`/`index`, por lo que la gramatica de tool calling de llama-server con `--jinja` (que fuerza el orden alfabetico de propiedades del esquema) corrompe los argumentos. El autor recomienda decodificacion sin gramatica de orden de claves y parsear manualmente los bloques `<tool_call>`.

## Capacidades

- Generacion de tool calls estructuradas en formato `<tool_call>` a partir de comandos de edicion en lenguaje natural.
- Mapeo de intenciones a un conjunto cerrado de aproximadamente diez operaciones de Drift (`split_clip`, `add_effect`, entre otras).
- Rechazo explicito de peticiones fuera de alcance mediante la respuesta `No tool fits this request.` (9/10 aciertos en el conjunto de test).
- Uso de contexto de seleccion: identifica el clip por pista e indice, y por identificador solo cuando aparece en el contexto o en la consulta.
- Capacidad limitada de peticiones de dos llamadas (7/17 en el conjunto de test).
- Soporte de function calling con esquemas JSON compactos, incluyendo distractores BM25 en la lista de herramientas.
- No dispone de modo thinking activado (se usa `enable_thinking=False`), vision, audio ni capacidades multimodales.
- Multilingue: no, solo ingles.

## Casos de uso

- Barra de comandos offline en un editor de video: el modelo traduce ordenes como "fade in half a second" a `add_effect` con los argumentos correctos, sin conexion a red, gracias a su cuantizacion GGUF de 495 MB ejecutable en CPU.
- Automatizacion de edicion repetitiva: un editor puede encadenar comandos de corte, efecto y ajuste sobre el clip seleccionado usando el contexto de pista e indice que el modelo recibe en el mensaje de sistema.
- Asistente integrado en Drift via MCP: el modelo emite llamadas compatibles con las operaciones MCP del editor, lo que permite conectarlo a un servidor de herramientas local.
- Prototipado de interfaces de voz-a-comando: combinado con un motor de reconocimiento de voz, puede convertir dictado en acciones de edicion concretas en un pipeline totalmente local.
- Evaluacion de estrategias de retrieval de herramientas: el modelo sirve como banco de pruebas para medir como afecta la seleccion de herramientas (gold vs. BM25 top-10) al porcentaje de llamadas exactas (72,4% frente a 57,1%).
- Investigacion sobre especializacion de modelos pequenos: util como referencia reproducible de ajuste LoRA para function calling en dominios cerrados, con datos sinteticos validados por esquema y conjunto de test separado.
- Filtrado de peticiones no soportadas: la capacidad de responder `No tool fits this request.` permite usarlo como primera capa de validacion antes de invocar herramientas reales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 237 comandos reservados (210 de llamada unica), con llama.cpp en CPU, Q6_K, 8 hilos y decodificacion greedy:

| Condicion | Llamada exacta | Operacion correcta | Dos llamadas exactas | Fuera de alcance rechazadas | Latencia |
|---|---|---|---|---|---|
| Qwen3-0.6B sin ajustar, herramientas gold | 45,2% | 66,2% | 1/17 | 9/10 | 8,3 s |
| Este modelo, herramientas gold (op correcta + 9 distractores) | 72,4% | 91,4% | 7/17 | 9/10 | 8,0 s |
| Este modelo, herramientas recuperadas (BM25 + sinonimos, top 10) | 57,1% | 72,4% | 6/17 | 9/10 | 7,6 s |

Notas del autor: todas las filas usan la misma decodificacion sin gramatica; con la gramatica de herramientas de llama-server el modelo sin ajustar obtuvo 39,0%. Con herramientas recuperadas, la operacion correcta solo aparece en el top 10 para el 77,5% de las consultas, lo que limita esa condicion. La latencia se debe principalmente al prefill del bloque de herramientas de aproximadamente 2.000 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q6_K (495 MB de pesos); en fp16, aproximadamente 1,2 GB de pesos mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entreno en una T4 y evaluo en CPU. Una RTX 3060, RTX 4090 o superior ofrece margen sobrado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU pura.
- Opciones de despliegue: llama.cpp y LM Studio con el GGUF Q6_K; transformers con el adaptador PEFT o los pesos fusionados; conversion a ONNX posible desde `merged_fp16/`.
- Latencia y throughput: aproximadamente 8 segundos por peticion en CPU con 8 hilos y Q6_K, dominada por el prefill de unas 2.000 tokens de herramientas. El throughput en GPU no esta disponible en la informacion proporcionada.
- Advertencia de despliegue: no usar la gramatica de tool calls de llama-server (`--jinja`), ya que fuerza el orden alfabetico de propiedades y corrompe los argumentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drift-command-qwen3-0.6b | 596 M | no disponible (entrenado a 4096) | Function calling especializado en edicion de video | Apache 2.0 | Hugging Face (GGUF, LoRA, fp16) |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible en la informacion proporcionada | Modelo generalista | Apache 2.0 | Hugging Face |
| Alternativas generalistas de menos de 1 B para function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base: en el mismo conjunto de test y con las mismas herramientas gold, el ajuste eleva la llamada exacta del 45,2% al 72,4% y la operacion correcta del 66,2% al 91,4%. No se dispone de datos de otros modelos especializados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta comandos en castellano ni en otros idiomas.
- Conocimiento limitado a la superficie de operaciones de Drift tal como era en noviembre de 2026; cualquier cambio en las herramientas invalida el modelo.
- Peticiones multi-step debiles: solo 7 de 17 casos de dos llamadas resueltos correctamente.
- Operaciones con argumentos anidados ocultos por el esquema compacto estan infraentrenadas: estilos de `set_text`, `set_speed_curve`, formas de `set_mask` y `set_sequence`.
- Dependencia del retrieval: con herramientas recuperadas por BM25, la llamada exacta cae al 57,1%, y el techo de recuperacion es del 77,5%.
- Riesgo de alucinacion de argumentos o de operaciones cuando la peticion es ambigua; el rechazo fuera de alcance funciona en 9 de cada 10 casos, no en todos.
- Requiere decodificacion sin gramatica de orden de claves; el uso con la gramatica por defecto de llama-server produce argumentos corruptos.
- Es un checkpoint de investigacion intermedio, no una funcionalidad publicada de Drift; el autor no garantiza su mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CutWire-Studios/drift-command-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/CutWire-Studios/drift-command-calls
- Repositorio de Drift: https://github.com/CutWire-Studios/Drift

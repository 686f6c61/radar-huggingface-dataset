# mohsenvand/sketchpad-0.8b-preview

## Resumen

Sketchpad-0.8B es un modelo de vision-lenguaje de 0,8 mil millones de parametros desarrollado por el usuario mohsenvand (publicado bajo el identificador `mohsenvand/sketchpad-0.8b-preview`). Se trata de un ajuste fino (finetune) del modelo Qwen/Qwen3.5-0.8B, orientado a un objetivo muy concreto: realizar aritmetica exacta leyendo una hoja de calculo visual. En lugar de mantener los numeros en su estado interno, el modelo observa una columna de tres celdas de 32 × 32 pixeles (imagen de 32 × 96) a traves de su propio torre de vision y responde en tokens con el resultado de esa columna. Un runtime fijo se encarga de estampar los digitos y desplazar la ventana de lectura, de modo que la hoja actua como unica memoria del modelo.

El modelo es relevante por su enfoque poco habitual: descompone la aritmetica de cualquier longitud en una cadena de pasos verificados, cada uno de los cuales ha sido comprobado exhaustivamente (242 columnas para la suma, 1.553 para la multiplicacion y 651 para resta y division). Funciona integramente en el navegador mediante ONNX y WebGPU con transformers.js 4.2.0, lo que lo convierte en una pieza interesante para experimentacion en el borde (edge). Es una vista previa de investigacion, no un asistente general ni un modelo con ajuste de seguridad.

La arquitectura subyacente es la del modelo base Qwen3.5-0.8B (transformer multimodal con torre de vision y decodificador), sobre la que se anade un adaptador LoRA de rango 16 en las capas de lenguaje. El contexto, el numero de tokens de entrenamiento y los idiomas soportados no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con torre de vision y decodificador; adaptador LoRA de rango 16 en capas de lenguaje |
| Parametros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Embedding a 4 bits; torre de vision y decodificador en fp16 (ONNX para WebGPU) |
| Idiomas soportados | no disponible |
| Licencia | Propietaria (sketchpad-proprietary); derivado modificado de Qwen3.5-0.8B, Apache 2.0 |
| Formato de pesos | ONNX (WebGPU), safetensors, adaptador LoRA para PEFT |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, exportado a ONNX por la ONNX Community, e incorpora un adaptador LoRA de rango 16 aplicado unicamente a las capas de lenguaje. El grafo del decodificador incluye los pesos del adaptador y expone una compuerta (`lora_gate`, float16, forma [1]) que escala todas las ramas del adaptador: con valor 0 se ejecuta exactamente el Qwen3.5-0.8B original (el modo chat de la pagina) y con valor 1 se ejecuta el programa aritmetico. El modelo devuelve el estado en cada capa y acepta un vector que se suma a la corriente de entrada de la capa 20 (el denominado "push" de la pagina).

El entrenamiento se realizo en dos fases segun la model card: primero un ajuste con el adaptador E6 sobre las 651 filas de la calculadora (resta, estimacion de digito de cociente y estimacion rebajada), y despues E7. Para la variante de chat (E8) se entreno desde E7 con destilacion on-policy hacia el modelo base sobre las respuestas que el propio modelo genera, seguida de GRPO usando el resultado de la hoja como recompensa y repitiendo todas las filas de las tablas a lo largo del proceso. La perplejidad de texto se mantiene dentro del 0,5 % de la del modelo base. No se dispone de datos sobre el numero de tokens de entrenamiento ni sobre la composicion completa del dataset.

## Capacidades

- Aritmetica exacta verificada: suma (242 columnas comprobadas), multiplicacion (1.553), resta y division (651), incluyendo restas con llevadas, estimacion de digito de cociente y estimacion rebajada.
- Operaciones de longitud arbitraria mediante encadenamiento de pasos: sumas de 10, 100 y 1.000 digitos; productos de 4 × 4, 6 × 6 y 10 × 10; division hasta 10 decimales y raiz cuadrada hasta 6 decimales.
- Vision integrada: lee columnas de tres celdas de 32 × 32 pixeles mediante su propia torre de vision.
- Modo chat (E8): cuando una pregunta requiere aritmetica exacta, abre el mismo un bloque de hoja (```` ```sheet ````), escribe la expresion y el runtime de la pagina la calcula; en caso contrario responde como el modelo base.
- Inferencia en navegador: ejecucion completa en WebGPU con transformers.js 4.2.0.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el encadenamiento de pasos esta limitado al procedimiento aritmetico fijo.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: lectura por logit lens (norma final y filas de salida de caracteres de respuesta por capa), mapas de espacio de estados por tabla y certificado de margenes por fila.

## Casos de uso

- Verificacion aritmetica de precision en el navegador: el modelo puede integrarse en una pagina web que reciba expresiones y devuelva resultados exactos, ya que toda la inferencia ocurre en WebGPU sin enviar datos a un servidor.
- Educacion y tutoria de aritmetica: al descomponer cada operacion en pasos verificados (suma por columnas, producto por pasos MUL/ADD/ADZ, division por SUB/EST/DEC), permite mostrar el procedimiento intermedio, no solo el resultado.
- Procesamiento de documentos con cifras: lectura de columnas numericas en imagenes de hojas de calculo o formularios, con la garantia de que cada columna leida ha sido validada contra un conjunto exhaustivo de casos.
- Pruebas de robustez de modelos multimodales: el certificado de margenes por fila y la comprobacion del decil mas debil en cada dispositivo nuevo lo convierten en una herramienta util para evaluar la fidelidad de la torre de vision en hardware distinto.
- Investigacion en razonamiento externo: el diseno de "la hoja como unica memoria" sirve como banco de pruebas para estudiar hasta que punto un modelo pequeno puede delegar el estado en un soporte externo verificado.
- Aplicaciones offline o de privacidad: al ejecutarse en el navegador con pesos ONNX, es adecuado para escenarios en los que no se permite enviar datos numericos a la nube.
- Calculo de raices y divisiones largas en entornos con recursos limitados: con unos 7 segundos para dividir hasta 10 decimales y unos 10 segundos para una raiz hasta 6 decimales en un Apple M4, encaja en herramientas interactivas no criticas en latencia.

## Benchmarks y rendimiento

| Prueba | Filas | Superadas | Margen minimo |
|---|---|---|---|
| Suma, en servidor (PyTorch) | 242 | 242 | 3,96 |
| Multiplicacion, en servidor | 1.553 | 1.553 | 6,39 |
| Resta y division, en servidor | 651 | 651 | 4,51 |
| Suma, en M4 (WebGPU, fp16) | 242 | 242 | 3,02 |
| Multiplicacion, en M4 | 1.553 | 1.553 | 6,52 |
| Resta y division, en M4 | 651 | 651 | 4,61 |

Ejecuciones largas en servidor: sumas de 10 digitos 20/20, de 100 digitos 5/5 y de 1.000 digitos 2/2; productos 4 × 4 20/20, 6 × 6 10/10 y 10 × 10 5/5. La perplejidad de texto se mantiene dentro del 0,5 % de la del modelo base. En un Apple M4, un producto 6 × 6 tarda unos 6 segundos y uno de 12 × 12 unos 19 segundos; dividir hasta 10 decimales tarda unos 7 segundos y una raiz cuadrada hasta 6 decimales unos 10 segundos (medianas de 50 ejecuciones). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 2,1 GB y los pesos se sirven en ONNX con embedding a 4 bits y torre de vision y decodificador en fp16.
- GPU recomendadas: no se especifican; la model card cita como referencia un Apple M4 con WebGPU.
- Compatibilidad con GPU de consumo: si, al ejecutarse en navegador mediante WebGPU; no se detallan modelos concretos de GPU de escritorio.
- Opciones de despliegue: transformers.js 4.2.0 con ONNX y WebGPU (via principal); el adaptador LoRA es compatible con PEFT sobre Qwen/Qwen3.5-0.8B. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Apple M4, aproximadamente 6 s para un producto 6 × 6, 19 s para 12 × 12, 7 s para division a 10 decimales y 10 s para raiz cuadrada a 6 decimales (medianas de 50). No se dispone de cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sketchpad-0.8B | 0,8 mil millones | no disponible | Aritmetica exacta sobre hoja visual, ejecucion en navegador | Propietaria (derivado de Apache 2.0) | Hugging Face, demo web |
| Qwen/Qwen3.5-0.8B (base) | 0,8 mil millones | no disponible | Modelo multimodal general | Apache 2.0 | Hugging Face |
| Alternativas de aritmetica exacta con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- Es una vista previa de investigacion: no es un asistente general ni ha recibido ajuste de seguridad.
- El alcance de la aritmetica esta acotado a las columnas verificadas (242 para suma, 1.553 para multiplicacion, 651 para resta y division); fuera de ese conjunto el comportamiento no esta garantizado.
- El modelo no mantiene los numeros en su estado: depende de un runtime fijo que estampa los digitos y desplaza la ventana, por lo que no es autonomo fuera de ese entorno.
- La licencia es propietaria (sketchpad-proprietary), lo que puede restringir el uso comercial; es un derivado modificado de Qwen3.5-0.8B bajo Apache 2.0, con aviso en NOTICE.
- No hay informacion sobre sesgos, riesgo de alucinacion en el modo chat, idiomas soportados ni limitaciones de contexto.
- En el modo chat (E8), las respuestas que no requieren aritmetica se comportan como el modelo base, con las limitaciones propias de un modelo de 0,8 mil millones de parametros.
- No se dispone de datos sobre rendimiento en GPUs de escritorio ni sobre despliegue en servidores de produccion.
- La latencia en el borde es alta para operaciones grandes (hasta unos 19 segundos en un producto 12 × 12 en un M4).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/sketchpad-0.8b-preview
- Demo en navegador: https://neovand.github.io/polyformer/sketchpad
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia (referenciada en la model card): LICENSE del repositorio
- Aviso de atribucion: NOTICE del repositorio
- Paper: anunciado como "forthcoming", no disponible

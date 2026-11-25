# KvcHub/Ki-Complete-7B

## Resumen

Ki Complete 7B es un modelo de autocompletado de codigo para editores, desarrollado por KvcHub como un ajuste fino (LoRA) de Qwen2.5-Coder-7B. Su proposito no es la generacion de codigo conversacional, sino resolver el "momento de editor": completar la linea que el usuario esta escribiendo y detenerse, escribir el bloque cuando una linea lo abre, escribir la siguiente linea en una linea nueva, o no escribir nada cuando no falta nada. Se distribuye principalmente como GGUF cuantizado en Q8_0 para ejecutarse localmente con llama.cpp, y como adaptador LoRA para PEFT.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B (7.615.616.512 parametros totales) y anade un ajuste fino con LoRA de rango 64 sobre todas las capas de atencion y MLP, con 161M parametros entrenables. El entrenamiento se realizo sobre 120.000 "momentos de editor" en el formato exacto de fill-in-the-middle de Qwen2.5-Coder, con perdida calculada solo sobre el codigo faltante.

Es relevante porque aborda un problema concreto y medible: los modelos base tienden a rellenar con lineas adicionales no solicitadas (42% de las respuestas en Qwen2.5-Coder-7B frente al 4% de Ki Complete 7B) y generan mas tokens por sugerencia (24 frente a 11). El modelo esta disenado para integraciones en IDE (extension Ki Complete para VS Code y editores basados en Open VSX como Antigravity) y prioriza precision sobre latencia, recomendandose para equipos con 16 GB de memoria o mas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B) con ajuste fino LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); adaptador LoRA en safetensors |
| Idiomas soportados | en (principalmente codigo y comentarios en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ki-complete-7b-q8_0.gguf, 8.1 GB) y safetensors (adaptador LoRA, subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B, un transformer decoder-only, y aplica un ajuste fino mediante LoRA de rango 64 sobre todas las capas de atencion y MLP, con 161M parametros entrenables. El adaptador se fusiona en los pesos GGUF distribuidos. El entrenamiento uso 120.000 ejemplos en el formato exacto que envia llama.cpp: 41% a mitad de linea, 35% en linea nueva, 9% en huecos de hasta tres lineas y 15% donde no falta nada. Una cuarta parte de los ejemplos incluye fragmentos de otros archivos del mismo proyecto como contexto.

Los datos de codigo proceden de archivos con licencias permisivas (MIT, Apache-2.0, BSD, ISC y similares) en 15 lenguajes del dataset codeparrot/github-code-clean, mas aproximadamente un 10% de proyectos propios de KvcHub (solo archivos que parsean, excluyendo tests y copias casi identicas). El metodo fue LoRA con perdida solo sobre el codigo faltante, 396 pasos durante 10,8 horas en un Apple M5 Pro (primero PyTorch, luego MLX), vistos unos 20.000 ejemplos. La perdida de validacion en proyectos nunca entrenados bajo de 0.449 a 0.381. Los archivos de entrenamiento se escanearon en busca de claves y tokens antes del entrenamiento.

## Capacidades

- Autocompletado de codigo en linea (fill-in-the-middle) con formato FIM de Qwen2.5-Coder: `<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>`.
- Finalizacion de la linea en curso y parada controlada (no anade lineas no solicitadas).
- Generacion de bloques de codigo cuando una linea abre una estructura.
- Escritura de la siguiente linea en una linea nueva.
- Abtencion: no genera nada cuando no falta codigo (15% de los ejemplos de entrenamiento son de este tipo).
- Uso de contexto de otros archivos del proyecto mediante `<|file_sep|>{nombre}\n{codigo}`.
- Soporte de multiples lenguajes de programacion (15 lenguajes en el entrenamiento).
- Integracion con llama.cpp via endpoint `/infill` y con PEFT sobre el modelo base.
- No dispone de tool calling, capacidades de agente, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada: principalmente codigo y comentarios en ingles.

## Casos de uso

- Autocompletado en IDE: integrado en la extension Ki Complete para VS Code y editores basados en Open VSX (Antigravity), el modelo sugiere la continuacion de la linea mientras se escribe y se detiene, reduciendo el ruido de sugerencias largas.
- Finalizacion de lineas en editores con servidor llama.cpp: mediante el endpoint `/infill` con `input_prefix`, `prompt` e `input_suffix`, se puede construir un servicio de autocompletado local que reutiliza cache entre pulsaciones (`--cache-reuse 256`).
- Relleno de huecos de codigo multi-linea: para completar funciones o bloques incompletos en tareas de refactorizacion, con un rendimiento en HumanEval-Infilling de varias lineas faltantes del 53,5% de tests superados.
- Asistente de escritura de codigo en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp (unos 9 GB de memoria en Q8_0), el codigo no sale de la maquina, lo que encaja en entornos con politicas estrictas de datos.
- Integracion en pipelines de desarrollo con PEFT: cargando el adaptador LoRA sobre Qwen2.5-Coder-7B con `PeftModel`, se puede incorporar el modelo a herramientas internas de generacion de codigo que ya usen el ecosistema Hugging Face.
- Generacion de sugerencias con contexto de proyecto: usando fragmentos de otros archivos como contexto (cuando se activa en la extension), el modelo mejora en tareas donde la linea depende de APIs definidas en otros ficheros; el coste es una latencia de unos 4,5 s en la primera sugerencia en Apple M5 Pro.
- Evaluacion de calidad de autocompletado: sirve como referencia para medir la tasa de sugerencias exactas y la tasa de tests superados en tareas de infilling (HumanEval-Infilling) frente a modelos base.

## Benchmarks y rendimiento

Resultados publicados por el autor, en tareas no vistas durante el entrenamiento, con la logica de sugerencia de Ki Complete y llama.cpp (Q8_0, Apple M5 Pro):

| Metrica | Qwen2.5-Coder-7B | Ki Complete 7B | Ki Complete 1.5B |
|---|---|---|---|
| Codigo real (700 puntos, dos mitades): resto de la linea exacto | 47,4% / 36,6% | 49,7% / 37,7% | 43,1% / 35,7% |
| Igual, similitud con la respuesta correcta | 77,7% / 70,3% | 78,8% / 72,1% | no disponible |
| Igual, con fragmentos de archivos relacionados como contexto | 50,0% / 41,7% | 52,9% / 41,7% | 45,1% / 38,9% |
| Respuestas con lineas extra no solicitadas | 42% | 4% | 3% |
| Tokens escritos por sugerencia | 24 | 11 | 11 |
| HumanEval-Infilling, una linea faltante (1.033): tests superados | 94,6% | 95,0% | 89,4% |
| HumanEval-Infilling, varias lineas faltantes (1.000): tests superados | 54,1% | 53,5% | 53,4% |
| HumanEval-Infilling, hueco que empieza a mitad de linea (164): tests superados | 48,2% | 46,3% | 40,9% |
| Espera tipica por sugerencia en codigo real | 1,18 s | 1,00 s | 0,23 s |
| Espera tipica con archivos relacionados como contexto | 5,2 s | 4,5 s | 1,1 s |

Los puntos de codigo real proceden de proyectos propios de KvcHub (Python, JavaScript, HTML, shell). El servidor reutiliza trabajo entre pulsaciones en la misma linea, por lo que las sugerencias posteriores a la primera son mas rapidas.

## Requisitos de hardware

- VRAM/memoria estimada: unos 9 GB de memoria para el GGUF Q8_0 (8,1 GB de archivo); el autor recomienda equipos con 16 GB de memoria o mas.
- GPU recomendadas: no se especifican modelos concretos de GPU en la informacion disponible; el autor reporta pruebas en Apple M5 Pro.
- Cabe en GPU de consumo: si, en GPUs con al menos 10-12 GB de VRAM para Q8_0 (estimacion a partir del tamano del archivo); no se confirma en la informacion disponible.
- Opciones de despliegue: llama.cpp (`llama-server -hf KvcHub/Ki-Complete-7B:Q8_0 --port 8012 -b 1024 -ub 1024 --cache-reuse 256`), PEFT sobre Qwen2.5-Coder-7B. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia: aproximadamente 1,00 s por sugerencia en codigo real y 4,5 s con contexto de archivos relacionados en Apple M5 Pro; las sugerencias posteriores en la misma linea son mas rapidas por reutilizacion de cache.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ki Complete 7B | 7,6B | no disponible | Autocompletado FIM, ajuste LoRA sobre Qwen2.5-Coder-7B | Apache-2.0 | GGUF Q8_0 + adaptador LoRA en Hugging Face |
| Qwen2.5-Coder-7B | 7,6B | no disponible | Modelo base de generacion de codigo | Apache-2.0 | Hugging Face |
| Ki Complete 1.5B | no disponible | no disponible | Autocompletado FIM, modelo mas pequeno y rapido del mismo autor | no disponible | Hugging Face |

Frente a Qwen2.5-Coder-7B, Ki Complete 7B mejora la exactitud del resto de linea (49,7% frente a 47,4%), reduce drasticamente las lineas extra no solicitadas (4% frente a 42%) y baja los tokens por sugerencia de 24 a 11, a costa de un rendimiento ligeramente inferior en huecos que empiezan a mitad de linea (46,3% frente a 48,2%). Frente a Ki Complete 1.5B, el 7B es mas preciso pero unas 4 veces mas lento (1,00 s frente a 0,23 s).

## Limitaciones y advertencias

- Mas lento que Ki Complete 1.5B: alrededor de 1 s por sugerencia nueva en Apple M5 Pro y mas en equipos antiguos.
- Entrenado para terminar lineas y parar, por lo que rinde algo peor que el modelo base en huecos que empiezan y acaban en puntos aleatorios a mitad de linea (46,3% frente a 48,2% en HumanEval-Infilling).
- Principalmente codigo y comentarios en ingles; el soporte de otros idiomas naturales es limitado.
- La primera sugerencia con contexto de archivos relacionados tarda varios segundos (4,5 s en M5 Pro), por lo que la extension lo desactiva por defecto para este modelo.
- Riesgo de alucinacion en APIs o funciones inexistentes: no se documenta una mitigacion especifica mas alla de la abtencion entrenada.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al entrenarse con codigo de licencias permisivas, puede reflejar los patrones y estilos de ese corpus.
- Licencia Apache-2.0, que permite uso comercial; el modelo es una version modificada de Qwen2.5-Coder-7B (Apache-2.0) y debe conservarse la atribucion correspondiente.
- El modelo esta orientado a autocompletado, no a generacion conversacional de codigo ni a tareas de agente; no se documentan capacidades de tool calling.
- La evaluacion se realizo con la logica de sugerencia propia de Ki Complete, por lo que los resultados pueden no trasladarse directamente a otros entornos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KvcHub/Ki-Complete-7B
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Modelo hermano Ki Complete 1.5B: https://huggingface.co/KvcHub/Ki-Complete-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/github-code-clean
- Extension en Visual Studio Marketplace: https://marketplace.visualstudio.com/items?itemName=KvcHub.ki-complete&ssr=false#overview
- Extension en Open VSX: https://open-vsx.org/extension/kvchub/ki-complete
- Sitio del autor: https://kvchub.com/#ki-complete

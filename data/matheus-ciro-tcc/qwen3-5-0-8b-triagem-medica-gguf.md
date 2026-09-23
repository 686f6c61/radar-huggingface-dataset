# matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-gguf

## Resumen

Qwen3.5-0.8B — Triagem Médica PT-BR (GGUF) es un ajuste fino del modelo Qwen/Qwen3.5-0.8B orientado a una única tarea: clasificar la especialidad médica a la que debería dirigirse un paciente a partir de su queja en texto libre en portugués de Brasil. Lo desarrollan Matheus Marques Eiras y Ciro Guilherme Nass como trabajo de fin de curso (TCC) en el IFPR, Câmpus Pinhais, con orientación de João Paulo Orlando, y se publica bajo licencia Apache 2.0 dentro del repositorio `matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-gguf`.

El modelo base es un transformer de 772.845.888 parámetros (aproximadamente 0,77 mil millones) al que se le han fusionado adaptadores LoRA entrenados sobre el dataset `AKCIT/MedPT`. El repositorio distribuye únicamente pesos en formato GGUF con cuantización Q8_0, pensados para ejecutarse con llama.cpp y, de forma destacada, en el navegador mediante wllama, lo que permite desplegar la demo en Hugging Face Spaces sin backend dedicado.

Su relevancia es doble: por un lado demuestra que un modelo sub-1B cuantizado puede resolver una tarea de enrutamiento clínico acotada con una precisión alta en el conjunto de prueba interno del proyecto (33/40 aciertos); por otro, sirve como caso de estudio reproducible de fusión de LoRA, conversión a GGUF y verificación de paridad entre la inferencia en `transformers` y la inferencia en el navegador. El propio autor advierte de que no es un dispositivo médico: sugiere un encaminamiento de especialidad, no diagnostica ni evalúa gravedad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-0.8B; la información proporcionada no detalla la arquitectura interna) |
| Parametros totales | 772.845.888 (según datos de safetensors del modelo base) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo original de referencia se evalúa en fp32 |
| Idiomas soportados | portugués (tag `pt`, entrenado sobre quejas en PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) en este repositorio; safetensors en los repositorios de origen y en el modelo base |
| Tamaño del repositorio | 2,5 GB (tres archivos GGUF: completo, piloto y base) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Dataset de entrenamiento | AKCIT/MedPT |
| Fecha de publicación | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura interna del modelo base; lo que sí detalla es el procedimiento de ajuste. Se entrenaron adaptadores LoRA sobre Qwen/Qwen3.5-0.8B y, posteriormente, cada par LoRA se sumó directamente al peso correspondiente del checkpoint original mediante la operación `W += (α/r)·B·A` con α=32 y r=16, la misma cuenta que ejecuta `merge_and_unload` de PEFT. En total se localizaron 96 pares de adaptadores por adaptador, todos con destino válido. De este modo, los GGUF publicados no requieren cargar adaptadores en tiempo de inferencia: el ajuste ya está dentro de los pesos.

Hay tres variantes en el repositorio, todas convertidas con `convert_hf_to_gguf.py` de llama.cpp en el commit `83d855c` (build b10663), el mismo que incorpora wllama 3.6.1, usando `--outtype q8_0`. La variante «completo» se entrenó con el dataset completo de 145.321 ejemplos; la variante «piloto», con solo 4.000 ejemplos; y la variante «base» es el modelo sin ajuste, incluida como referencia. El formato de prompt empleado en el entrenamiento es el chat template de Qwen3.5 en modo *non-thinking*, con un mensaje de sistema que fija la lista cerrada de especialidades y exige responder únicamente con el nombre de la especialidad, sin explicaciones.

Un detalle técnico relevante es la verificación de paridad: se compararon las predicciones del GGUF ejecutado en el navegador con wllama frente al modelo original en `transformers` en fp32, usando 40 ejemplos del conjunto de prueba (4 por clase, semilla 42) y decodificación gulosa. En las variantes completo y piloto la coincidencia de predicción fue de 40/40, lo que indica que la cuantización Q8_0 no altera el resultado en ese subconjunto. En el modelo base sin ajuste la coincidencia fue de 36/40, atribuida por los autores a empates casi exactos que la cuantización desempata de forma distinta.

## Capacidades

- Clasificación de queja médica en texto libre hacia una de las especialidades de una lista cerrada: Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psicanalista, Psiquiatra y Urologista (la lista del prompt de sistema repite «Psicólogo» dos veces).
- Salida restringida: el modelo debe emitir únicamente el nombre de la especialidad, sin texto explicativo adicional.
- Generación de texto conversacional en portugués, heredada del modelo base, pero orientada en la práctica a una única tarea de clasificación.
- Modo *non-thinking*: el formato de prompt incluye las etiquetas `<think>` vacías, es decir, no se espera cadena de razonamiento.
- Ejecución en navegador mediante wllama, sin servidor de inferencia.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades de visión, audio ni multimodalidad.
- Multilingüismo: no. El entrenamiento y los datos son exclusivamente en portugués; no se documenta comportamiento en otros idiomas.

## Casos de uso

- Enrutamiento inicial en telemedicina: el modelo recibe la queja escrita por el paciente en un formulario y devuelve la especialidad a la que asignar la cita, reduciendo la carga de la persona que hace el triaje manual. Su ventana de salida es muy corta (hasta 20 tokens) y la tarea es de una sola etiqueta, lo que encaja con un microservicio de clasificación.
- Preclasificación de colas de mensajes en portales de salud: dado un buzón con consultas entrantes en texto libre, se etiqueta cada mensaje con la especialidad correspondiente antes de que lo revise personal administrativo.
- Demo interactiva en navegador: el repositorio está preparado para wllama, de modo que la Space `matheus-ciro-tcc/triagem-medica-demo` ejecuta el GGUF íntegramente en el cliente, sin enviar datos clínicos a un servidor. Es un escenario útil para pilotos de privacidad por diseño.
- Despliegue en equipos sin conectividad: con ~0,8 GB de pesos en Q8_0, el modelo cabe en un portátil o en un equipo modesto y puede funcionar en local en puestos de atención con red limitada.
- Investigación y docencia: sirve como caso reproducible de fusión de LoRA (α=32, r=16, 96 pares), conversión a GGUF y comparación de paridad entre `transformers` fp32 y llama.cpp cuantizado, con script publicado (`scripts/07_export_gguf.py`).
- Comparación de regímenes de datos: las variantes completo (145.321 ejemplos) y piloto (4.000 ejemplos) permiten estudiar cuánto aporta el volumen de datos de ajuste en una tarea de clasificación cerrada y de un solo token de salida.
- Filtrado previo antes de un modelo mayor: al ser muy barato en cómputo, puede usarse como primera etapa que resuelve los casos claros y deriva los ambiguos a un sistema mayor o a revisión humana.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento disponibles son la evaluación interna de paridad y precisión sobre 40 ejemplos del conjunto de prueba (4 por clase, semilla 42, decodificación gulosa), comparando el GGUF en wllama con el modelo original en `transformers` fp32.

| Variante | Aciertos sobre 40 | Exactitud | Misma predicción que el original |
|---|---|---|---|
| completo (145.321 ejemplos) | 33/40 | 82,5 % | 40/40 |
| piloto (4.000 ejemplos) | 29/40 | 72,5 % | 40/40 |
| base (sin ajuste) | 11/40 | 27,5 % | 36/40 |

No se han publicado resultados de benchmarks adicionales en la información disponible. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- Peso de los archivos: Q8_0 sobre 772.845.888 parámetros implica aproximadamente 0,8 GB de pesos (estimación a partir del número de parámetros y de la cuantización; el repositorio completo ocupa 2,5 GB porque contiene tres archivos).
- VRAM estimada para inferencia: en torno a 1 GB en Q8_0 contando pesos y caché KV para una ventana corta (estimación). La referencia en fp32 requeriría aproximadamente 3,1 GB solo en pesos.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. También es viable en CPU.
- Ejecución en navegador: soportada vía wllama 3.6.1, que integra la build b10663 de llama.cpp.
- Opciones de despliegue: llama.cpp, wllama (navegador), y cualquier runtime compatible con GGUF. Los tags del repositorio incluyen `endpoints_compatible`. No se documenta soporte específico para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B — triagem médica, variante completo | 772,8 M | no disponible | LoRA fusionado, 145.321 ejemplos | Apache 2.0 | GGUF Q8_0, 33/40 en la prueba interna |
| Qwen3.5-0.8B — triagem médica, variante piloto | 772,8 M | no disponible | LoRA fusionado, 4.000 ejemplos | Apache 2.0 | GGUF Q8_0, 29/40 en la prueba interna |
| Qwen/Qwen3.5-0.8B (base, sin ajuste) | 772,8 M | no disponible | ninguno | Apache 2.0 | safetensors; 11/40 en la misma prueba |

No se dispone de información sobre otros modelos comparables de triaje médico en portugués dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico. El propio autor lo advierte de forma explícita: el modelo sugiere un encaminamiento de especialidad a partir de texto, no diagnostica ni evalúa gravedad. No debe usarse como sustituto de valoración clínica.
- Tarea cerrada y de una sola etiqueta: solo elige entre las especialidades fijadas en el prompt de sistema. Cualquier queja que no encaje en esa lista se forzará a una de las categorías disponibles.
- La lista de especialidades del prompt contiene «Psicólogo» dos veces, lo que puede introducir ambigüedad en el proceso de comparación de la salida con la lista.
- Riesgo de alucinación: aunque el formato de entrenamiento restringe la salida al nombre de la especialidad, al ser un modelo de 0,8 B no se garantiza que la categoría asignada sea clínicamente correcta, especialmente en quejas ambiguas, con comorbilidades o redactadas de forma atípica.
- Sesgos: los sesgos del modelo base Qwen3.5-0.8B se heredan; no se documenta ningún análisis de sesgo por sexo, edad, origen o tipo de queja en la información disponible.
- Idioma: únicamente portugués. La model card está redactada en portugués de Brasil y el dataset es PT-BR; no hay evaluación de comportamiento en otros idiomas.
- Longitud de contexto: no documentada. La tarea asume quejas cortas; entradas largas pueden degradar el resultado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso clínico real queda fuera del alcance previsto por el autor y sujeto a la normativa sanitaria aplicable.
- Cifras de rendimiento con muestra pequeña: la exactitud de 33/40 se calcula sobre 40 ejemplos, sin intervalos de confianza ni validación externa. No debe extrapolarse a producción sin una evaluación propia.
- El repositorio no incluye datos de latencia, throughput ni consumo, lo que dificulta dimensionar un despliegue sin pruebas previas.
- Los tres GGUF comparten el mismo nombre de tarea pero distinto nivel de ajuste; es imprescindible seleccionar el archivo correcto (`triagem-completo-q8_0.gguf`, `triagem-piloto-q8_0.gguf` o `triagem-base-q8_0.gguf`) para no confundir la variante sin ajuste con el modelo entrenado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del modelo con dataset completo: https://huggingface.co/matheus-ciro-tcc/qwen3.5-0.8b-triagem-medica-ptbr
- Repositorio del modelo piloto: https://huggingface.co/matheus-ciro-tcc/qwen35-0.8b-triagem-medica-piloto
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/matheus-ciro-tcc/triagem-medica-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/AKCIT/MedPT
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama: https://github.com/ngxson/wllama

No se han encontrado otros enlaces relevantes (papers, blogs o repositorios adicionales) en la información disponible.

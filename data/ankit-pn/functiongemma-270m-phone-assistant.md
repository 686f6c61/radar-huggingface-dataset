# ankit-pn/functiongemma-270m-phone-assistant

## Resumen

FunctionGemma 270M phone assistant es un ajuste fino de parámetros completos (full fine-tune) de google/functiongemma-270m-it, publicado por el usuario ankit-pn. Se trata de un modelo denso de 268.098.176 parámetros (≈270 M) construido sobre la arquitectura gemma3_text, especializado en convertir comandos de usuario en lenguaje natural en llamadas a 20 herramientas típicas de un teléfono: alarmas, temporizadores, fecha y hora, linterna, Wi-Fi, Bluetooth, volumen, brillo, clima, calendario, recordatorios, mensajes, llamadas, aplicaciones, música, control multimedia, navegación, búsqueda web y notas.

El problema que resuelve es concreto: el function calling fiable en el dispositivo (on-device), sin depender de la nube. Un modelo de este tamaño puede ejecutarse en hardware modesto, lo que resulta relevante para asistentes tipo Siri con requisitos de latencia baja y privacidad de datos. El modelo está entrenado para emitir la sintaxis de llamada propia de FunctionGemma (`<start_function_call>call:...{...}<end_function_call>`) y para guardar silencio cuando la petición es charla informal o no está soportada.

El ajuste se realizó sobre un dataset propio de 3.200 ejemplos de entrenamiento y 800 de test, con un 15% de ejemplos en hinglish (mezcla de hindi e inglés). Según la model card, el ajuste eleva el exact match del 22,3% al 75,4% y la selección correcta de herramienta del 31,6% al 93,0%, sobre 800 ejemplos retenidos con las 20 herramientas presentes en cada prompt y decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only denso) |
| Parametros totales | 268.098.176 (≈270 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP32 y no se documentan cuantizaciones oficiales (BF16/FP16, INT8 e INT4 serian conversiones viables, no publicadas) |
| Idiomas soportados | en (ingles) y hi (hindi), con soporte de hinglish segun la model card |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (los pesos se guardan en FP32) |

## Arquitectura y entrenamiento

La arquitectura es gemma3_text, un transformer decoder-only denso de la familia Gemma 3. No hay mezcla de expertos ni componentes de estado recurrente (SSM): es un modelo estrictamente denso, lo que simplifica el despliegue y el calculo de memoria. El modelo parte de google/functiongemma-270m-it, la variante de 270 M ya instruida para function calling, y se ajusta a parametros completos (no LoRA ni adaptadores).

El entrenamiento uso 3.200 ejemplos durante 3 epocas (600 pasos), con batch efectivo de 16, learning rate de 5e-5, scheduler coseno y un 5% de warmup. La perdida se calculo unicamente sobre los tokens de asistente. Se ejecuto en dos GPU Kaggle T4 con pesos en FP32 y autocast BF16, en 85 minutos. El checkpoint final se uso tal cual, sin seleccion por rendimiento en test. El dataset (ankit-pn/phone-assistant-function-calling) fue redactado por LLM siguiendo una especificacion, no recogido de usuarios reales, y contiene un 15% de ejemplos en hinglish. No se documenta uso de RLHF ni DPO.

Una advertencia tecnica relevante: la plantilla de chat de la copia de FunctionGemma v1 distribuida en Kaggle duplica `}<end_function_call>` en los turnos de llamada. Este modelo se entreno con la plantilla del hub de Hugging Face, que es la incluida en el repositorio; usar la otra plantilla degrada el formato de salida.

## Capacidades

- Generacion de llamadas a funciones (function calling) sobre 20 herramientas de telefono, con argumentos tipados y sintaxis propia de FunctionGemma.
- Llamadas en paralelo: soporta peticiones que requieren 2 o 3 llamadas simultaneas (por ejemplo, poner alarma y apagar el Wi-Fi en el mismo turno).
- Abstenerse de llamar a herramienta: en charla informal o peticiones no soportadas responde en texto sin invocar funciones.
- Multilingue limitado: ingles e hindi, con entrenamiento explicito en hinglish (transliteracion y mezcla de idiomas en la misma frase).
- Comprension de lenguaje natural coloquial orientada a comandos de dispositivo (hora, alarmas, conectividad, multimedia, navegacion).
- Salida en formato estructurado y parseable, con una tasa declarada de errores de parseo del 0,25% en el conjunto de evaluacion.
- No se documentan capacidades de vision, audio, tool calling generico fuera del catalogo de 20 herramientas, ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente de voz on-device en Android: con 270 M de parametros el modelo cabe en un telefono de gama media y evita enviar audio o transcripciones a la nube, lo que reduce latencia y mejora la privacidad. Se usaria como capa de traduccion de intencion a llamadas del sistema.
- Automatizacion de dispositivos y domotica por comando: el catalogo incluye Wi-Fi, Bluetooth, brillo, volumen y linterna, de modo que sirve para controlar el estado del terminal o de dispositivos emparejados mediante instrucciones en lenguaje natural.
- Soporte para usuarios en hinglish: el entrenamiento con un 15% de ejemplos en hinglish lo hace util para publicos de India que mezclan hindi e ingles en una misma frase; es una de las pocas alternativas especializadas documentadas para esta combinacion.
- Enrutador de intenciones en pipelines de agentes: por su tamano y su tasa de seleccion de herramienta del 93,0%, puede actuar como primera etapa que clasifica y estructura la peticion antes de delegar en un LLM mayor, reduciendo coste por token en produccion.
- Generacion de recordatorios y agenda: las herramientas de calendario, recordatorios y temporizadores permiten construir flujos de captura rapida de tareas por voz, con conversion de expresiones temporales a argumentos estructurados.
- Mensajeria y llamadas manos libres: el modelo traduce "llama a X" o "manda un mensaje a Y" en llamadas a las herramientas correspondientes, lo que encaja en interfaces de conduccion o uso con pantalla bloqueada.
- Investigacion en function calling a pequena escala: al ser un artefacto reproducible (dataset, codigo, prompt de sistema y parser publicados), sirve como banco de pruebas para estudiar errores de seleccion, llamadas en paralelo y robustez multilingue en modelos diminutos.
- Control de kioscos, vehiculos o electrodomesticos con interfaz de voz: cualquier dispositivo embebido con capacidad de inferencia local puede usar el modelo como interprete de comandos sin conexion a internet.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 800 ejemplos retenidos, con las 20 herramientas presentes en cada prompt y decodificacion greedy:

| Metrica | Base (functiongemma-270m-it) | Este modelo |
|---|---:|---:|
| Exact match (todas las funciones y argumentos) | 22,3% | 75,4% |
| Seleccion de herramienta | 31,6% | 93,0% |
| Errores de parseo | 10,6% | 0,25% |
| No-call recall (permanece en silencio cuando debe) | 90,4% | 79,8% |

Desglose del exact match por subconjunto:

| Subconjunto | Exact match |
|---|---:|
| Llamada unica | 75,3% |
| Paralelo (2-3 llamadas) | 70,8% |
| Ingles | 79,3% |
| Hinglish | 53,3% |

El intervalo de confianza al 95% (bootstrap por clusters) de la mejora en exact match es [+49,2, +56,9] puntos porcentuales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos en FP32: 268.098.176 parametros x 4 bytes ≈ 1,07 GB (coincide con el tamano de repositorio declarado de 1,1 GB). En BF16/FP16 ≈ 536 MB; en INT8 ≈ 268 MB; en INT4 ≈ 134 MB.
- La cache KV es pequena en terminos relativos por el tamano del modelo, aunque la longitud de contexto no esta documentada; con las cuantizaciones INT8 o INT4 la huella total se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en iGPU, Apple Silicon y CPU, dado el reducido numero de parametros. El autor lo entreno con dos T4, lo que confirma que una T4 o incluso una GPU inferior basta para inferencia.
- Para lotes grandes o muchas peticiones concurrentes, una A100 o H100 no aportan ventaja significativa por capacidad de memoria; el cuello de botella seria el throughput, no la VRAM.
- Opciones de despliegue: transformers (referencia oficial, con la plantilla de chat incluida), text-generation-inference (etiqueta text-generation-inference y endpoints_compatible en el repositorio), vLLM con los pesos safetensors, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match (function calling) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| ankit-pn/functiongemma-270m-phone-assistant | 268 M | no disponible | 75,4% (800 ejemplos propios) | gemma | Hugging Face, safetensors FP32 |
| google/functiongemma-270m-it (base) | 268 M | no disponible | 22,3% (mismo conjunto) | gemma | Hugging Face |
| google/gemma-3-270m-it | no disponible | no disponible | no disponible (no evaluado en function calling en esta informacion) | gemma | Hugging Face |

La comparacion con modelos de otras familias (por ejemplo alternativas de 0,5-1 B parametros orientadas a function calling) no esta disponible: no se han publicado en la informacion proporcionada mediciones cruzadas con otros modelos.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que las llamadas deben validarse antes de ejecutarlas en un dispositivo real.
- Los resultados provienen de una unica semilla de entrenamiento; no hay replicas ni analisis de varianza.
- El dataset fue redactado por LLM siguiendo una especificacion, no recogido de usuarios reales, por lo que la distribucion de peticiones no refleja el uso real en produccion.
- Falsos positivos de llamada: el no-call recall cae del 90,4% (base) al 79,8%, es decir, el modelo tiende a invocar herramientas cuando deberia responder en texto, especialmente en charla informal en hinglish.
- El hinglish rinde claramente peor que el ingles: 53,3% de exact match frente a 79,3%.
- Limitaciones declaradas por el autor: sobrescritura de llamadas en small talk en hinglish, nombres propios distorsionados, conversion incorrecta de algunas horas y redaccion de argumentos de texto libre distinta de las etiquetas de referencia.
- Dependencia estricta del formato: hay que usar los mismos esquemas de herramientas (tools.json) y el mismo prompt de sistema (prompting.py) con los que se entreno. Desviarse degrada el resultado y puede aumentar los errores de parseo.
- Riesgo de alucinacion en argumentos: al generar valores de texto libre (nombres, contactos, destinos) puede producir datos plausibles pero incorrectos; conviene validar contra el estado real del dispositivo.
- Soporte de idiomas limitado a ingles, hindi y hinglish; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a esas condiciones, que imponen obligaciones de cumplimiento y restricciones de uso (incluidas ciertas prohibiciones de uso aceptable). Conviene revisarlas antes de un despliegue en producto.
- La plantilla de chat de la copia de Kaggle de FunctionGemma v1 tiene un defecto conocido (duplica `}<end_function_call>`); usar la plantilla del hub incluida en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ankit-pn/functiongemma-270m-phone-assistant
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/ankit-pn/phone-assistant-function-calling
- Codigo, informe y predicciones: https://github.com/ankit-pn/functiongemma-phone-assistant-bench
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio.

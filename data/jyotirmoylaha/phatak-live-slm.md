# JyotirmoyLaha/phatak-live-slm

## Resumen

Phatak Live SLM es un modelo de lenguaje pequeno (SLM) de aproximadamente 1.000 millones de parametros, desarrollado por JyotirmoyLaha como el componente de IA en el dispositivo de la aplicacion Android Phatak Live. La aplicacion informa a los usuarios de carretera en India sobre el estado de los pasos a nivel ferroviarios (conocidos como *phatak*): si las barreras estan abiertas o cerradas, cuando se cerraran y reabriran, y que tren provoca el cierre. El modelo deriva de `google/gemma-3-1b-it` mediante un ajuste fino con LoRA y se distribuye en formato GGUF Q8_0 para ejecutarse localmente con llama.cpp, sin nube ni clave de API.

No es un chatbot generalista, sino un especialista entrenado para tres tareas concretas: planificar busquedas en mapas a partir de la ubicacion o consultas del usuario (incluyendo traduccion de consultas en hindi y bengali a ingles), redactar el mensaje sobre el estado del paso a nivel y redactar el mensaje de estado de un tren. El modelo no decide si una barrera esta abierta: la aplicacion calcula ese estado con reglas deterministas, y el modelo solo planifica y explica.

Su relevancia radica en el enfoque de destilacion de conocimiento desde un modelo profesor (Gemma 4 E4B) hacia un alumno de 1B, con un filtro automatico que valida cada respuesta del profesor, y en su despliegue totalmente local en movil, orientado a un caso de uso de seguridad vial en un contexto con conectividad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 3 1B IT) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base admite otras cuantizaciones, no documentadas para este fine-tune |
| Idiomas soportados | Ingles (en), hindi (hi), bengali (bn) |
| Licencia | Gemma Terms of Use (derivado de Gemma 3) |
| Formato de pesos | GGUF (fichero `phatak-1b-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only `google/gemma-3-1b-it`. El ajuste se realizo con LoRA de rango 32 aplicado a todas las capas lineales, seguido de la fusion de los adaptadores y la exportacion a GGUF en cuantizacion Q8_0. El fichero resultante ocupa 1.069.306.080 bytes (aproximadamente 1,07 GB) y tiene SHA-256 `f666dbdf85dd655ce7ea4c8c485ae204e3c7f8e84e5f8223260f6cd21426a137`.

El entrenamiento sigue un esquema de destilacion de conocimiento: un modelo profesor (Gemma 4 E4B, ejecutado localmente) genero respuestas de referencia para 3.871 situaciones construidas a partir de la red ferroviaria india real (estaciones, trenes y horarios reales, con tiempos, posiciones de barreras y retrasos simulados). Cada respuesta del profesor paso por un filtro automatico que verificaba que cada hora y numero de tren existieran en la entrada, que el alfabeto coincidiera con el idioma solicitado y que no se copiara la tabla de entrada; las respuestas que fallaban se descartaron. No se documenta el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Planificacion de busquedas en mapas: genera una lista JSON de busquedas a partir de la ubicacion, estaciones cercanas o una consulta escrita.
- Traduccion de consultas: convierte consultas en hindi y bengali (por ejemplo, `বোলপুর রেল গেট` o `गेट 24 फाटक`) en busquedas de mapa en ingles.
- Redaccion de mensajes de estado de paso a nivel en ingles, hindi y bengali, a partir de hechos calculados (estado, hora de cierre y reapertura, trenes, retrasos, datos en vivo o programados).
- Redaccion de mensajes de estado de tren a partir del estado en vivo y las proximas paradas.
- Copia exacta de horas y numeros de tren desde la entrada (capacidad entrenada explicitamente).
- Generacion de texto conversacional limitada al formato de prompt de la aplicacion.
- No incluye vision, audio, tool calling ni razonamiento multi-paso general; su alcance es el de las tres tareas descritas.

## Casos de uso

- Aviso de estado de pasos a nivel en movil: la aplicacion calcula el estado con reglas deterministas y el modelo redacta el mensaje para el conductor en ingles, hindi o bengali en 6-7 segundos, adecuado para consultas puntuales antes de cruzar.
- Traduccion de consultas multilingues a busquedas de mapa: un usuario que escribe el nombre de una estacion o barrera en bengali obtiene una busqueda en ingles que la aplicacion puede ejecutar contra un servicio de mapas.
- Planificacion de busquedas cercanas: a partir de la ubicacion GPS, el modelo produce un JSON con las busquedas a lanzar para localizar estaciones y pasos a nivel proximos.
- Informacion de estado de trenes: dado el estado en vivo de un tren y sus proximas paradas, el modelo genera un mensaje breve que explica que tren provoca el cierre y con que retraso.
- Despliegue offline en zonas con conectividad limitada: al ejecutarse con llama.cpp en el propio telefono (aproximadamente 16 tokens/s en 4 hilos de CPU), funciona sin red ni clave de API.
- Prototipado de asistentes especializados de dominio: el pipeline de destilacion (profesor grande, filtro automatico, alumno de 1B) sirve de referencia para construir SLM de tarea especifica con datos sinteticos validados.
- Integracion en aplicaciones Android de transporte: el formato GGUF y el prompt compacto `TASK:` facilitan la incorporacion del modelo en una app existente sin infraestructura de servidor.

## Benchmarks y rendimiento

Evaluacion sobre conjunto reservado con el fichero exacto publicado (datos del autor):

| Tarea | Resultado |
|---|---|
| Mensajes de paso a nivel (ingles) | 31/31 |
| Mensajes de paso a nivel (hindi) | 43/43 |
| Mensajes de paso a nivel (bengali) | 34/34 |
| Mensajes de estado de tren (ingles) | 8/8 |
| Mensajes de estado de tren (hindi) | 12/12 |
| Mensajes de estado de tren (bengali) | 9/9 |
| Planes de busqueda (coincidencia JSON exacta) | 51/56 |
| Total | 188/193 (97%) |

Rendimiento medido: aproximadamente 16 tokens/s en 4 hilos de CPU; un mensaje completo de paso a nivel tarda 6-7 segundos. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,1 GB para el fichero Q8_0, mas la memoria del contexto y del runtime de llama.cpp.
- GPU recomendadas: no aplica de forma especifica; el modelo esta disenado para CPU en movil. Puede ejecutarse en cualquier GPU consumer (por ejemplo, RTX 4090) con llama.cpp, aunque no es su objetivo.
- Cabe en GPU consumer: si, con holgura, dado su tamano de aproximadamente 1 GB en Q8_0; tambien cabe en la memoria de un telefono Android.
- Opciones de despliegue: llama.cpp (motor documentado); no se documenta soporte de vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: aproximadamente 16 tokens/s en 4 hilos de CPU; 6-7 segundos por mensaje de paso a nivel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Phatak Live SLM | ~1.000 M | no disponible | Gemma Terms of Use | SLM especializado en dominio ferroviario, GGUF Q8_0, en dispositivo |
| google/gemma-3-1b-it (base) | ~1.000 M | no disponible en la informacion | Gemma Terms of Use | Modelo generalista de instrucciones, multilingue |
| Gemma 4 E4B (profesor) | no disponible | no disponible | no disponible | Modelo profesor usado para destilacion en este proyecto |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las horas de las barreras son estimaciones basadas en horarios de trenes; la operacion real depende del guardabarreras y de la senalizacion. El usuario debe obedecer siempre la barrera.
- Los nombres largos de trenes escritos en bengali a veces se transliteran de forma imperfecta; la aplicacion los compara con la lista real de trenes y el numero de tren siempre es exacto.
- El modelo espera el formato de prompt del sistema y el esquema compacto `TASK:` de la aplicacion; otras entradas producen resultados pobres.
- No es un chatbot generalista: su uso fuera de las tres tareas entrenadas no esta soportado.
- Riesgo de alucinacion en horas o numeros de tren fuera del formato esperado, mitigado en parte por el entrenamiento de copia exacta y por el filtro del profesor, pero no eliminado.
- Licencia Gemma Terms of Use y Gemma Prohibited Use Policy: el uso comercial esta sujeto a dichos terminos.
- Idiomas limitados a ingles, hindi y bengali; no se documenta cobertura de otras lenguas de India.
- No se documenta la longitud de contexto soportada, lo que limita la planificacion de integraciones con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JyotirmoyLaha/phatak-live-slm
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio de la aplicacion (referenciado en la model card, ruta `train/prompts.py`): no disponible como enlace directo

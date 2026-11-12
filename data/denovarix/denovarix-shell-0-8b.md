# Denovarix/Denovarix-Shell-0.8B

## Resumen

Denovarix Shell 0.8B es un modelo de lenguaje especializado en la traducción de peticiones en inglés coloquial a un único comando de terminal. Lo desarrolla Denovarix Technologies LLP, una empresa con sede en West Bengal (India), y está integrado en el cuadro "Ask" del terminal de DNX OS, el sistema operativo propio de la compañía. El modelo no se distribuye como pesos abiertos: la página de Hugging Face actúa únicamente como descripción, y los pesos se empaquetan dentro de DNX OS, cuya beta se anuncia para diciembre de 2026.

El objetivo del modelo es la latencia mínima en CPU: con 0,8 mil millones de parámetros y aproximadamente 0,6 GB en cuantización, está diseñado para responder casi de inmediato en un procesador de oficina convencional mediante llama.cpp. La tarea es acotada (una petición, un comando), lo que permite un modelo pequeño y rápido en lugar de un asistente generalista.

La relevancia actual es doble: por un lado, ilustra la tendencia de modelos ultraespecializados para tareas de sistema operativo con inferencia local; por otro, es un caso de modelo anunciado pero no publicado, con acceso restringido a evaluación mediante contacto comercial. No se dispone de datos públicos de arquitectura, entrenamiento ni benchmarks más allá de lo que declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 0,8B, inferencia vía llama.cpp) |
| Parametros totales | 0,8 mil millones (800M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizado a ~0,6 GB (formato concreto no disponible) |
| Idiomas soportados | inglés (en) únicamente; hindi y bengalí los cubren otros modelos Denovarix |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no publicados; se distribuyen dentro de DNX OS) |

## Arquitectura y entrenamiento

El autor no detalla la arquitectura interna más allá de describirla como un modelo de 0,8 mil millones de parámetros ejecutable en CPU mediante llama.cpp, lo que implica una familia transformer estándar compatible con dicho runtime. No se especifica si usa atención completa, variantes lineales, decodificación especulativa ni ninguna otra innovación de inferencia.

En cuanto a datos, la model card indica que se entrenó con peticiones cotidianas en inglés emparejadas con comandos, junto con los ejemplos de comandos de tldr-pages (licencia CC-BY-4.0). No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documenta la tokenizadora ni el vocabulario.

## Capacidades

- Generación de un único comando de terminal a partir de una petición en inglés coloquial (por ejemplo, "show the biggest files in this folder").
- Clasificación de riesgo del comando propuesto por parte del terminal: el sistema pide confirmación antes de ejecutar cualquier comando que modifique el sistema.
- Inferencia local en CPU orientada a baja latencia, con un peso cuantizado de aproximadamente 0,6 GB.
- Especialización en inglés; no cubre hindi ni bengalí (delegados a otros modelos de Denovarix).
- No se documentan capacidades de tool calling genérico, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Asistente de terminal integrado en DNX OS: el usuario escribe una petición en inglés y el modelo devuelve un comando; encaja porque el terminal clasifica el riesgo y confirma antes de ejecutar, lo que mitiga errores del modelo en operaciones destructivas.
- Onboarding de usuarios poco familiarizados con la línea de comandos: el modelo traduce intenciones cotidianas a comandos concretos sin requerir conocimiento de sintaxis, aprovechando su entrenamiento sobre ejemplos de tldr-pages.
- Equipos de soporte y helpdesk: generación rápida de comandos de diagnóstico o consulta (listar procesos, revisar espacio en disco) en máquinas de oficina sin GPU, gracias a la inferencia en CPU vía llama.cpp.
- Automatización de scripts internos: convertir descripciones en lenguaje natural a comandos puntuales que luego se revisan y encadenan manualmente en pipelines de administración de sistemas.
- Formación y documentación técnica: generar ejemplos de comandos a partir de descripciones para manuales o tutoriales internos, con revisión humana previa a la publicación.
- Evaluación piloto por parte de empresas: Denovarix ofrece acceso para evaluación y pilotos mediante contacto comercial, lo que permite probar el modelo en flujos de terminal propios antes de adoptar DNX OS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo declara cualitativamente que el modelo es "lo bastante pequeño para responder casi al instante en un procesador ordinario", sin cifras de latencia, throughput ni precisión en la tarea de generación de comandos.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo previsto; el modelo corre en CPU. El peso cuantizado ocupa aproximadamente 0,6 GB, por lo que la RAM necesaria es del orden de 1 GB o algo superior, sin cifra oficial.
- GPU recomendadas: no se especifican; el diseño apunta a CPU de PC de oficina.
- Cabe en GPU consumer: previsiblemente sí en cualquier GPU con más de 1-2 GB de memoria, aunque no es el escenario declarado por el autor.
- Opciones de despliegue: llama.cpp es el runtime mencionado explícitamente. No se confirma soporte de vLLM, TGI, Ollama ni otros.
- Latencia y throughput: no disponibles; el autor solo afirma respuesta "casi inmediata" en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, arquitectura) que permitan una comparación rigurosa. A modo orientativo, se contrasta con alternativas de propósito general de tamaño similar, sin cifras de benchmark del modelo Denovarix:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Denovarix Shell 0.8B | 0,8B | no disponible | no disponible | No publicados (solo dentro de DNX OS) |
| Qwen2.5-Coder-0.5B | 0,5B | 32K (según documentación pública del modelo) | Apache 2.0 | Públicos en Hugging Face |
| Llama 3.2 1B | 1,2B | 128K (según documentación pública del modelo) | Llama 3.2 Community License | Públicos en Hugging Face |

La diferencia clave no es de rendimiento (no hay datos), sino de modelo de distribución: Denovarix Shell 0.8B es propietario y solo accesible vía DNX OS o contacto comercial, mientras que las alternativas citadas son descargables abiertamente.

## Limitaciones y advertencias

- Pesos no publicados: no es posible descargar, inspeccionar ni ejecutar el modelo fuera de DNX OS o de un acuerdo de evaluación con Denovarix.
- Licencia no disponible: se desconoce si el uso comercial, la redistribución o la modificación están permitidos; es un riesgo directo para cualquier integración en producción.
- Idioma limitado al inglés: no cubre hindi, bengalí ni español; las peticiones en otros idiomas quedan fuera de su diseño.
- Tarea acotada: genera un único comando; no está pensado para razonamiento multi-paso, conversación larga ni tool calling genérico.
- Riesgo de comandos incorrectos o peligrosos: aunque el terminal clasifica el riesgo y pide confirmación, un comando mal generado puede tener efectos no deseados si el usuario confirma sin revisar.
- Riesgo de alucinación en sintaxis de comandos: al ser un modelo pequeño entrenado sobre ejemplos, puede producir opciones o rutas inexistentes.
- Sin datos de benchmarks, sesgos ni evaluación de seguridad publicados: no hay evidencia independiente de su precisión en la tarea.
- Modelo anunciado con fecha futura de disponibilidad (beta de DNX OS en diciembre de 2026): la información puede cambiar y no hay histórico de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Denovarix/Denovarix-Shell-0.8B
- Web de Denovarix: https://denovarix.com
- DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
- tldr-pages (fuente de datos citada, CC-BY-4.0): https://tldr.sh
- llama.cpp (runtime de inferencia citado): https://github.com/ggml-org/llama.cpp

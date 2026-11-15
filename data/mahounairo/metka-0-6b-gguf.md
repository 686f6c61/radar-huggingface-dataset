# mahounairo/metka-0.6b-gguf

## Resumen

Metka 0.6B es un modelo de lenguaje de muy pequeno tamano (596 millones de parametros) desarrollado por el usuario mahounairo, especializado en una tarea muy concreta: generar etiquetas cortas en lenguaje natural para las llamadas a herramientas que ejecuta un agente de codificacion. En lugar de mostrar el comando crudo en la interfaz de terminal, el modelo produce una linea descriptiva del tipo "Desensamblando game.exe desde 0x4a1f30", con formas verbales para el estado en curso, finalizado o fallido. Esta pensado para ejecutarse en paralelo a un modelo de agente grande, aprovechando recursos residuales: CPU, portatil o VRAM sobrante.

El modelo parte de Qwen3-0.6B (Apache 2.0) y se ha afinado mediante un LoRA de rango 8 sobre todas las capas lineales, posteriormente fusionado y cuantizado a Q8_0 en formato GGUF para llama.cpp, con un peso de repositorio de 640 MB. No emplea plantilla de chat: trabaja con un formato de prompt en texto plano basado en etiquetas XML (`<tool>`, `<args>`, `<state>`, `<label>`) y admite contexto opcional con el razonamiento previo del agente.

Su relevancia actual reside en la tendencia a desacoplar tareas auxiliares de los agentes de codificacion hacia modelos pequenos y especializados que reducen coste y latencia. Con tiempos de etiquetado de 34 ms en una RTX 4080 SUPER y 0,44 s en CPU (Ryzen 9 3900X), demuestra que una tarea de post-procesamiento linguistica puede resolverse en local sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) con adaptacion LoRA fusionada |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en la configuracion de servidor recomendada (`-c 4096`); ventana nativa del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | Ingles (etiquetas entrenadas y evaluadas solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso heredado de Qwen3-0.6B, sobre el que se aplico un LoRA de rango 8 con alpha 16 en todas las capas lineales. El adaptador se fusiono en los pesos base y el resultado se cuantizo a Q8_0. El entrenamiento se realizo en una unica RTX 3090 y todos los runs de ambas variantes (0.6B y 1.7B) sumaron menos de ocho horas de GPU. Se estructuro en tres fases: primero 14.043 ejemplos durante 2 epocas con llamadas a herramientas de sesiones de agentes de codificacion en sandbox y de un agente jugando a un benchmark; despues una epoca adicional sobre 24.750 ejemplos que incorporaban 3.569 llamadas construidas a partir de ejemplos de comandos de tldr-pages para ganar cobertura sobre herramientas poco familiares; y finalmente una epoca de 32 minutos con el texto y razonamiento previos del agente como contexto opcional, presentado de forma aleatoria con razonamiento y texto, solo texto o nada.

Las etiquetas de supervision fueron generadas por Qwen3.8-27B y Qwen4-Max a partir unicamente de la llamada, sin contexto, de modo que una etiqueta nunca afirme algo que solo el contexto podria conocer. El formato de entrenamiento es texto plano sin plantilla de chat, con argumentos en JSON serializados como `json.dumps` de Python (separadores `", "` y `": "`) y truncados a 3.000 caracteres; el contexto opcional se limita a los ultimos 400 caracteres. La innovacion principal no es arquitectonica sino de diseno de tarea: un modelo minusculo entrenado para una unica funcion de interfaz, con modos verbales condicionados por el estado de la llamada y un mecanismo de descarte por baja confianza (probabilidad del token mas bajo por debajo de 0,15) implementado en la extension de cliente.

## Capacidades

- Generacion de etiquetas cortas en ingles para llamadas a herramientas de agentes de codificacion, en tres formas: en curso, finalizada y fallida.
- Condicionamiento por estado: recibe `<state>running</state>`, `<state>finished</state>` o `<state>failed</state>` y ajusta el tiempo verbal y el contenido de la etiqueta.
- Uso opcional de contexto: acepta el razonamiento y texto previos del agente (hasta 400 caracteres) para etiquetar el proposito de la llamada y no solo su efecto mecanico.
- Formato de prompt sin plantilla de chat, basado en etiquetas XML y JSON como argumento.
- Compatibilidad con llama.cpp y con cualquier servidor que exponga la API de completions de OpenAI (tag `endpoints_compatible`).
- Integracion con el agente pi mediante la extension `pi-tool-labels-metka`, que muestra las etiquetas en las filas de herramientas.
- No soporta tool calling como emisor, ni vision, ni audio, ni modo de razonamiento extendido: es un modelo de una sola tarea.

## Casos de uso

- Interfaz de terminal para agentes de codificacion: el modelo transforma cada comando bash en una linea legible que se muestra en la fila de la herramienta mientras se ejecuta, sustituyendo el comando crudo. Encaja por su latencia de 34-51 ms en GPU y su formato de salida acotado.
- Etiquetado en portatiles sin GPU: con 640 MB en Q8_0 y 0,70 s por etiqueta en un ThinkPad X1 con i7-1185G7 a bateria, permite ofrecer la misma experiencia en equipos de desarrollo sin acelerador dedicado.
- Servidores de agentes con VRAM limitada: al ejecutarse con `llama-server --parallel 2` en 4.096 tokens de contexto, puede convivir con el modelo grande en la misma maquina consumiendo recursos marginales.
- Trazabilidad y auditoria de sesiones de agente: las etiquetas en pasado y en fallo permiten reconstruir que hizo el agente y que fallo, util para revision posterior de logs de sesiones largas (551 llamadas en la sesion de evaluacion del visor web).
- Etiquetado de comandos poco autoexplicativos: en tareas de ingenieria inversa (desensamblados en direcciones, volcados hexadecimales, escaneos de offsets) el contexto opcional eleva la calidad de etiqueta buena del 72% al 86%, lo que lo hace adecuado para sesiones de reversing y modding.
- Despliegue en pipelines de observabilidad: al exponer una API compatible con OpenAI, puede integrarse en herramientas internas que enriquecen trazas de agentes con descripciones legibles sin enviar datos a servicios externos.
- Prototipado de interfaces de agentes: util para equipos que construyen sus propias UIs de agente y necesitan una capa de descripcion de acciones sin entrenar su propio modelo.

## Benchmarks y rendimiento

Evaluacion cualitativa con dos sesiones reales de agente no vistas en entrenamiento, cada etiqueta calificada a ciegas por un juez independiente (Claude Opus 5.5) como buena, debil o erronea:

| Sesion | Buena | Debil | Erronea |
|---|---|---|---|
| Ingenieria inversa y modding de un juego (110 llamadas), sin contexto | 72% | 23% | 5% |
| La misma, con razonamiento y texto del agente | 86% | 12% | 2% |
| Construccion de un visor web (551 llamadas), sin contexto | 68% | 28% | 4% |

Rendimiento de latencia (mediana por etiqueta sobre 40 comandos de una sesion real, unos 100 tokens de prompt, sin cache de prompt):

| Hardware | Tiempo por etiqueta |
|---|---|
| RTX 4080 SUPER | 34 ms |
| RTX 3070 | 51 ms |
| Ryzen 9 3900X, solo CPU | 0,44 s |
| ThinkPad X1 (i7-1185G7, a bateria), solo CPU | 0,70 s |
| Core i7-2700K (2011), solo CPU, sin AVX2 | 1,8 s |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7-1 GB para el modelo en Q8_0 (640 MB de pesos) mas la cache KV para 4.096 tokens de contexto; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: RTX 4080 SUPER (34 ms por etiqueta) y RTX 3070 (51 ms) como referencias medidas; cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: si, incluidas GPU de gama baja y portatiles; tambien funciona integramente en CPU.
- CPU: Ryzen 9 3900X a 0,44 s por etiqueta; i7-1185G7 a bateria a 0,70 s; Core i7-2700K sin AVX2 a 1,8 s.
- Opciones de despliegue: llama.cpp mediante `llama-server -m metka-0.6b-Q8_0.gguf -c 4096 --parallel 2 --port 11500`; cualquier servidor compatible con la API de completions de OpenAI; integracion con el agente pi a traves de `pi-tool-labels-metka`.
- Throughput: con `--parallel 2` el servidor admite dos peticiones concurrentes; no se han publicado cifras de tokens por segundo en la informacion disponible.
- Comandos largos (por ejemplo, un heredoc que escribe un fichero) tardan varios segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metka 0.6B | 596 M | 4.096 (config. servidor) | Etiquetado de llamadas a herramientas | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| Metka 1.7B | no disponible en la informacion proporcionada | no disponible | Misma tarea, mayor calidad (91% buenas con contexto en la sesion de reversing) | Apache 2.0 (segun repositorio hermano) | GGUF en Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible en la informacion proporcionada | Modelo generalista | Apache 2.0 | Safetensors y multiples formatos |

No se dispone de datos de benchmarks estandar ni de comparaciones con otros modelos de etiquetado de acciones de agentes en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con etiquetas en ingles; no hay soporte ni validacion en castellano u otros idiomas.
- Puede inventar un proposito que el comando no muestra (por ejemplo, "alrededor de la nueva funcion" para un desensamblado sin contexto). La extension de pi oculta las etiquetas con probabilidad del token mas bajo por debajo de 0,15 y muestra el comando en su lugar, lo que mitiga buena parte de estos casos.
- Los comandos compuestos largos reciben una etiqueta referida solo a su parte principal.
- Entrenado sobre shell de Linux y herramientas de agentes de codificacion; otros dominios rendiran peor.
- No es un modelo de proposito general: no debe usarse para generacion de texto abierta, razonamiento, codigo ni conversacion.
- No emplea plantilla de chat; usarlo con prompts conversacionales convencionales producira salidas degeneradas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad de las etiquetas en dominios no cubiertos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahounairo/metka-0.6b-gguf
- Variante 1.7B: https://huggingface.co/mahounairo/metka-1.7b-gguf
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Extension para el agente pi: https://github.com/mahounairo/pi-tool-labels-metka
- Agente pi: https://github.com/earendil-works/pi
- tldr-pages (fuente de ejemplos de comandos): https://github.com/tldr-pages/tldr

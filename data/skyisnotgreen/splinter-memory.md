# SkyIsNotGreen/splinter-memory

## Resumen

Splinter Memory es una arquitectura de curacion de contexto con decaimiento gestionado para conversaciones largas con modelos de lenguaje. No es un modelo generativo, sino una capa externa que se situa entre el usuario y el backend LLM: puntua el historial almacenado, deduplica, detecta cambios de tema, aplica una politica de retencion y ensambla una ventana de contexto acotada y ordenada por relevancia en cada turno. Lo desarrolla el autor independiente SkyIsNotGreen y se publica bajo licencia MIT.

El componente central es una flota de encoders bidireccionales pequenos (el autor menciona un "dron" de 17 millones de parametros) que puntuan cada fragmento almacenado frente a la consulta actual, en lugar de reutilizar el modelo generativo como selector. Segun la model card, esto reduce el coste del camino critico de decenas de segundos por turno a milisegundos. La capa es compatible con cualquier backend compatible con la API de OpenAI (llama.cpp, LM Studio, vLLM o una API alojada).

La relevancia actual del proyecto es que ataca un problema concreto de las conversaciones de horizonte largo: la ventana se llena, los hechos antiguos caen fuera y el modelo responde con la misma confianza desde lo que sobrevive. El autor publica predicciones falsables y conserva explicitamente los fallos de su evaluacion, lo que lo distingue de propuestas puramente descriptivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa de curacion de contexto sobre encoders bidireccionales (sentence-transformers); el modelo generativo subyacente es externo |
| Parametros totales | No disponible como modelo unico; el encoder "dron" citado tiene 17 M de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana fija; el ensamblador trabaja con presupuesto de tokens adaptativo (322 a 332 tokens de contexto medidos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 0.0 GB; la libreria declarada es sentence-transformers) |

## Arquitectura y entrenamiento

Splinter Memory no entrena un transformer generativo propio. Su arquitectura es un pipeline de curacion en cuatro etapas: una flota de encoders bidireccionales que puntua cada fragmento almacenado contra la consulta; una "membrana" que elimina duplicados y detecta deriva tematica; una capa de retencion con decaimiento de friccion escalonada, una pasada de rememoracion que rescata hechos valiosos y un "comb" (nivel SSD) que resucita temas que vuelven tras ser expulsados; y un ensamblador focal que construye una ventana acotada por relevancia bajo un presupuesto de tokens adaptativo.

La model card no detalla el corpus de entrenamiento de los encoders ni si hubo ajuste fino con RLHF o DPO; esos datos figuran como no disponibles. La innovacion tecnica declarada es la separacion de responsabilidades: el modelo generativo produce respuestas y la seleccion de contexto se delega a encoders pequenos, medidos en milisegundos frente a decenas de segundos cuando se usa un modelo de 27B como selector en el camino critico.

## Capacidades

- Puntuacion de similitud semantica entre fragmentos de conversacion y la consulta actual mediante encoders bidireccionales.
- Deduplicacion de contenido repetido y deteccion de deriva tematica.
- Gestion de memoria con olvido como parametro de diseno: decaimiento con friccion escalonada y pasada de rememoracion.
- Recuperacion de temas previamente expulsados mediante el nivel "comb" (SSD).
- Ensamblado de contexto acotado con presupuesto de tokens adaptativo por turno.
- Integracion con cualquier backend compatible con la API de OpenAI (llama.cpp, LM Studio, vLLM, API alojada).
- Capacidades multilingues: no disponibles.
- No incluye generacion de texto, vision, audio ni tool calling propios; esas funciones corresponden al modelo generativo conectado.

## Casos de uso

- Asistentes conversacionales de larga duracion: la capa mantiene un contexto acotado (322 a 332 tokens medidos) mientras el almacen crece hasta 7,6 veces, de modo que el asistente conserva decisiones antiguas sin inflar el prompt.
- Atencion al cliente multi-turno: la membrana elimina duplicados y el decaimiento prioriza los datos vigentes del cliente, reduciendo respuestas contradictorias en sesiones prolongadas.
- Agentes con memoria persistente en hardware de consumo: al delegar la seleccion en un encoder de 17 M de parametros, el coste por turno se mantiene en milisegundos y el modelo generativo puede ser local.
- Sistemas de soporte tecnico con historial extenso: el "comb" resucita temas que reaparecen tras haber sido expulsados, util cuando el usuario retoma un problema antiguo.
- Investigacion sobre curacion de contexto: el repositorio incluye los corpus de prueba y las predicciones falsables (P1, P2, P3, P6, P9, P10) para reproducir la evaluacion.
- Despliegue sobre backends existentes: al ser compatible con la API de OpenAI, se inserta delante de llama.cpp, vLLM o LM Studio sin cambiar el modelo generativo.
- Control de coste en produccion: el contexto plano evita el crecimiento del KV cache y del coste por token en conversaciones de cientos de turnos.

## Benchmarks y rendimiento

Resultados publicados en la model card (medidos por el autor sobre su propio harness):

| Metrica | Baseline FIFO | Objetivo | Medido |
|---|---|---|---|
| Throughput de decodificacion | 14,5 tps | Plano | 15,5 tps sobre 308+ turnos (+6,7 %, P1 PASS) |
| Turnos con hechos recuperables (27B) | No disponible | Superar FIFO | 85,1 % (P3 PASS) |
| Turnos al menos igual de buenos (35B-A3B) | No disponible | Superar FIFO | 88,4 % (empate estricto) |
| Recall determinista | No disponible | Alto | 90,3 % (P2 recall PASS) |
| Precision | No disponible | Alta | 10,7 % (P2 precision FAIL, techo del encoder) |
| Puntuacion PES tras la ejecucion | 12,2 (rolling) / 11,6 (FIFO) | Verde | 80,0 GREEN |
| Deduplicacion a umbral 0,92 | No disponible | Equilibrio | Precision 1,00, recall 0,03 |
| Encoder ajustado | No disponible | Mejorar | Preservacion de hechos 32,66 % frente a 60,51 % |
| Tamano de contexto | No disponible | Plano | 322 a 332 tokens con almacen creciendo 7,6 veces |
| Coste de curacion | No disponible | Bajo | 22,8 ms con 212 fragmentos; 156,8 ms con 1.612 |

Comparativa de respuesta entre generadores: con el modelo de 27B la curacion gano 115 turnos frente a 26; con el 35B-A3B el resultado es un empate.

## Requisitos de hardware

- VRAM estimada: no disponible para el conjunto; el encoder citado tiene 17 M de parametros y es ejecutable en CPU.
- GPU recomendadas: no disponibles; el proyecto apunta a hardware de consumo y a backends locales.
- Cabe en GPU de consumo: si, al menos el componente de encoder; el modelo generativo conectado determina el resto del requisito.
- Opciones de despliegue: llama.cpp, LM Studio, vLLM y cualquier API compatible con OpenAI, con la libreria sentence-transformers para los encoders.
- Latencia: 22,8 ms de curacion con 212 fragmentos y 156,8 ms con 1.612 fragmentos; throughput de decodificacion de 14,5 a 15,5 tps sobre 308+ turnos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Splinter Memory | Capa de curacion de contexto | Encoder de 17 M (flota) | Presupuesto adaptativo (~322-332 tokens medidos) | MIT | Hugging Face y GitHub |
| MemGPT / Letta | Gestion de memoria para LLM | No disponible | No disponible | No disponible | No disponible |
| Recuperacion RAG clasica (p. ej. FAISS + encoder) | Recuperacion vectorial | Depende del encoder | No disponible | Depende de componentes | Amplia |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- La precision de recuperacion no esta resuelta: 10,7 % medido, con fallo explicito de P2 precision, P6 y P10.
- El umbral de deduplicacion a 0,92 sacrifica recall (0,03) a cambio de precision (1,00); el ajuste del encoder reduce la preservacion de hechos del 60,51 % al 32,66 %.
- La ventaja en calidad de respuesta depende del generador: con el 27B gana ampliamente, con el 35B-A3B empata.
- El coste de curacion crece con el almacen (de 22,8 ms a 156,8 ms entre 212 y 1.612 fragmentos), aunque el contexto entregado permanezca plano.
- El autor declara que el auditor no es independiente y que los paquetes de ejecucion en vivo estan registrados pero no publicados.
- Idiomas soportados no disponibles; riesgo de sesgo y alucinacion del modelo generativo subyacente no evaluado en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el proyecto es experimental y no se documentan garantias de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SkyIsNotGreen/splinter-memory
- Paper canonico: https://github.com/sky-is-green/hive/blob/hive_test/splinter/SPLINTER-WHITE-PAPER.md
- Codigo: https://github.com/sky-is-green/hive
- Directorio del proyecto en GitHub: https://github.com/sky-is-green/hive/tree/main/splinter/
- Ficha en free2aitools: https://free2aitools.com/model/skyisnotgreen/splinter-memory

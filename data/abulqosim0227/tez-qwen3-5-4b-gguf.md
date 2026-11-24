# Abulqosim0227/Tez-Qwen3.5-4B-GGUF

## Resumen

Tez-Qwen3.5-4B-GGUF es un ajuste fino del modelo Qwen/Qwen3.5-4B, desarrollado por Abulqosim0227, orientado a la traducción de peticiones en lenguaje natural sobre tablas de datos en planes estructurados de llamadas a herramientas (tool calls). En lugar de calcular resultados, el modelo genera un plan JSON de hasta 4 pasos que posteriormente ejecuta un motor analítico (DuckDB) en local. Está pensado para el ecosistema de la aplicación Tez, que combina inferencia con llama.cpp y ejecución de consultas en el propio equipo del usuario.

El modelo cubre tres idiomas (uzbeko en alfabeto latino y cirílico, ruso e inglés) y está especializado en tareas de table-question-answering sobre hojas de cálculo y ficheros tabulares. Se distribuye cuantizado en Q4_K_M (2,71 GB) y puede ejecutarse íntegramente en CPU, sin necesidad de GPU, con un consumo de RAM medido de aproximadamente 5,4 GB.

Con 4.205.751.296 parámetros y licencia Apache 2.0, es relevante por su enfoque de privacidad local (servidor por defecto en 127.0.0.1) y por su rendimiento en el conjunto de desarrollo interno: un 92,9 % de acierto en peticiones claras frente al 52,3 % del Qwen3.5-4B sin ajustar, con una mejora especialmente marcada en uzbeko latino (del 43,5 % al 92,2 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles especificos de la arquitectura base no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de llama-server de la model card) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | Uzbeko (latino y cirilico), ruso, ingles y peticiones mixtas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ha ajustado mediante fine-tuning supervisado para una tarea concreta: transformar una peticion sobre una tabla en un plan JSON de llamadas a herramientas, o bien en una unica pregunta de aclaracion cuando la peticion es ambigua. El ajuste incorpora un prompt de sistema exacto y una gramatica de salida restringida (output grammar) que limitan los valores permitidos en los argumentos del plan, especialmente para columnas con valores enumerados. Los detalles sobre el volumen de datos de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada.

La innovacion tecnica principal es la restriccion estructural de la salida: el modelo no calcula cifras, solo emite planes de hasta 4 pasos sobre un conjunto cerrado de 18 herramientas (`filter`, `group_and_total`, `period_compare`, `top_n`, `make_chart`, `export_xlsx`, entre otras). La decodificacion se realiza con llama.cpp (build b11946 en las pruebas), con thinking desactivado, temperatura 0 y un maximo de 200 tokens de salida. El repositorio incluye scripts para construir el prompt y el esquema JSON (`prompt/build.py`) y un ejemplo ejecutable solo con la biblioteca estandar de Python.

## Capacidades

- Generacion de planes de tool calls en formato JSON a partir de peticiones en lenguaje natural sobre una tabla.
- Formulacion de una unica pregunta de aclaracion cuando la peticion es ambigua o incompleta.
- Comprension multilingue: uzbeko en alfabeto latino y cirilico, ruso, ingles y peticiones mixtas.
- Manejo de 18 herramientas analiticas: filtrado, eliminacion de filas, filtrado por fechas, agrupacion y totalizacion, comparacion de periodos, top-N, correccion de fechas y numeros, unificacion de ortografia, eliminacion de duplicados, relleno de vacios, generacion de graficos, ordenacion, seleccion de columnas, exportacion a XLSX y HTML, y columnas calculadas.
- Restriccion gramatical de valores: para columnas con valores enumerados, la gramatica solo permite esos valores en el plan.
- No realiza calculos numericos: delega la ejecucion en DuckDB.
- No es un modelo de chat general ni dispone de conocimiento sobre los datos del usuario mas alla de la descripcion de tabla que recibe.

## Casos de uso

- Analisis de carteras de prestamos en banca: un empleado solicita "suma de saldos por oficial de credito" y el modelo genera el plan `group_and_total` con las columnas y agregacion correctas, que luego ejecuta DuckDB sobre la tabla de prestamos. Es adecuado por su entrenamiento especifico con el ejemplo `examples/bank_loans`.
- Limpieza y normalizacion de hojas de calculo: peticiones como corregir fechas, unificar ortografia o eliminar duplicados se traducen a los planes `fix_dates`, `unify_spelling` o `remove_duplicates`, utiles en flujos de preparacion de datos tabulares.
- Generacion de informes exportables: el modelo puede producir planes que terminan en `export_xlsx` o `export_html`, permitiendo a un analista obtener un fichero listo para compartir a partir de una peticion en lenguaje natural.
- Creacion de graficos bajo demanda: peticiones como "hazme un grafico por tipo de credito" se convierten en un plan con `make_chart`, adecuado para herramientas de business intelligence ligeras.
- Atencion a usuarios en uzbeko y ruso: el modelo cubre ambos idiomas y peticiones mixtas, lo que lo hace util para aplicaciones desplegadas en Asia Central donde el personal trabaja con hojas de calculo en uzbeko latino o cirilico.
- Despliegue en entornos sin conectividad ni GPU: al ejecutarse en CPU con unos 5,4 GB de RAM y un servidor local en 127.0.0.1, es apto para portatiles de analistas o equipos de oficina con requisitos de privacidad estrictos.
- Asistencia a personal no tecnico: cuando la peticion es ambigua ("Tahlil qil", "analizalo"), el modelo devuelve una pregunta de aclaracion en lugar de un plan erroneo, lo que reduce errores en la interpretacion de solicitudes vagas.

## Benchmarks y rendimiento

Resultados del benchmark interno de desarrollo (1.410 peticiones en 63 conjuntos; 1.248 claras y 162 que requieren pregunta; uzbeko latino 565, ruso 315, ingles 270, uzbeko cirilico 168, mixtas 92). Es un conjunto interno, no una prueba independiente. Ejecucion con llama.cpp b11946 en CPU, gramatica activada, thinking desactivado y decodificacion voraz. Un plan se considera correcto cuando DuckDB produce la misma tabla de resultados que el plan de referencia.

| Metrica | Tez (tez17) | Qwen3.5-4B sin ajustar |
|---|---|---|
| Peticiones claras correctas (modelo solo) | 92,9 % (1.159/1.248) | 52,3 % (653/1.248) |
| Peticiones claras correctas (con guarda Tez) | 92,2 % | 46,6 % |
| Respuestas erroneas entregadas con guarda | 4,6 % (55/1.206) | 15,9 % (110/692) |
| Retenidas o con pregunta en peticiones claras (con guarda) | 42/1.248 | 553/1.248 |
| Peticiones no claras no respondidas (con guarda) | 90,7 % (147/162) | 96,3 % (156/162) |
| Uzbeko latino (mejora principal) | 92,2 % | 43,5 % |

Prueba de estres en retail (200 peticiones sobre una tabla publica de 541.909 filas, con la app Tez 0.3.6 y rubrica separada): 37 totalmente correctas, 74 resultados erroneos entregados sin pregunta, 5 seguimientos correctos sobre un paso anterior erroneo y 45 retenidas aunque las herramientas (la informacion proporcionada se interrumpe en este punto). El autor califica este resultado como debil.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario documentado; el modelo esta pensado para CPU.
- RAM medida con el servidor en marcha: aproximadamente 5,4 GB.
- Tamano del fichero del modelo: 2,71 GB (Q4_K_M).
- GPU: no se requiere GPU. No se documentan GPU recomendadas.
- Cabe en cualquier equipo de consumo con al menos 5,4 GB de RAM libre; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: llama.cpp (build b11946 en las pruebas), mediante `llama-server -m Tez-tez17-agent-Q4_K_M.gguf --jinja -c 8192 --host 127.0.0.1 --port 8080`. Tambien se ofrece un notebook de Google Colab (`tez_colab.ipynb`) que instala llama.cpp b11946 y ejecuta dos peticiones en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tez-Qwen3.5-4B-GGUF | 4.205.751.296 | 8192 | Planes de tool calls sobre tablas, 3 idiomas | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado, segun denominacion) | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face |
| Alternativas especializadas en table-question-answering | No disponible | No disponible | No disponible | No disponible | No disponible |

El unico comparable directo documentado es el modelo base Qwen3.5-4B sin ajustar, sobre el que se miden las mejoras del benchmark interno (92,9 % frente a 52,3 % en peticiones claras). No se dispone de datos de otros modelos especializados en generacion de planes sobre tablas para una comparacion adicional.

## Limitaciones y advertencias

- No es un modelo de chat general: solo debe usarse para convertir peticiones sobre una tabla en planes de herramientas; no conoce los datos del usuario salvo la descripcion de tabla que recibe.
- No calcula numeros: cualquier resultado numerico debe obtenerse ejecutando el plan en DuckDB u otro motor; el modelo solo escribe el plan.
- El benchmark es interno y de desarrollo: las peticiones fueron redactadas y revisadas por agentes de IA (Claude y GPT), el conjunto se uso durante el desarrollo del prompt y las herramientas, y no existe ningun estudio con usuarios reales.
- En la prueba de estres de retail el rendimiento fue debil: 74 de 200 peticiones produjeron resultados erroneos entregados sin pregunta de aclaracion.
- La model card no aporta ninguna medicion que demuestre que los datos no salen del equipo; no se ha publicado ninguna prueba de red.
- Requiere el prompt exacto y la gramatica de salida del repositorio; su uso fuera de ese formato no esta garantizado.
- El plan tiene un maximo de 4 pasos y esta limitado a las 18 herramientas definidas; peticiones que requieran operaciones fuera de ese conjunto no podran resolverse.
- La cobertura linguistica se limita a uzbeko (latino y cirilico), ruso, ingles y peticiones mixtas; otros idiomas no estan soportados.
- Riesgo de alucinacion en la seleccion de columnas o valores cuando la descripcion de tabla es incompleta; el autor recomienda verificar los resultados antes de usarlos para tomar decisiones.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni clausulas especificas del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abulqosim0227/Tez-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Notebook de Colab: `tez_colab.ipynb` en el repositorio del modelo
- Ejemplo de ejecucion: `example.py` en el repositorio del modelo
- Constructor de prompt y esquema: `prompt/build.py` en el repositorio del modelo
- Definicion de herramientas: `prompt/tools.json` en el repositorio del modelo
- Ejemplos de tabla: `examples/bank_loans/` (`table.json`, `glossary.json`, `examples.json`) en el repositorio del modelo

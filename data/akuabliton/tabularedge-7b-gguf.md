# Akuabliton/TabularEdge-7B-GGUF

## Resumen

TabularEdge-7B es un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct (7.615.616.512 parámetros) especializado en compilar instrucciones en lenguaje natural, en chino, inglés o mezcla de ambos, sobre hojas de cálculo en un plan de acciones JSON tipado y ejecutable. Lo desarrolla el autor Akuabliton y se distribuye en formato GGUF cuantizado Q4_K_M (4,36 GiB) bajo licencia Apache-2.0. Su propuesta diferencial es la privacidad: el modelo nunca ve la tabla completa, solo un perfil de la misma (nombre de hoja, cabeceras con tipos y como máximo tres filas de muestra), y el motor de ejecución open source procesa localmente el fichero `.xlsx` de forma determinista.

La relevancia del modelo está en su orientación a despliegue en el borde: según la model card, funciona completamente offline en la GPU de un portátil con 4 GB de VRAM, lo que lo hace apto para entornos de finanzas, sector público o back office sanitario donde los datos no pueden salir de la máquina. La adaptación combina edición de pesos ROME, SFT con LoRA y regularización por destilación propia, partiendo de una base Apache-2.0.

El modelo declara un 92,3 % de equivalencia de ejecución sobre un conjunto propio de 285 ítems coloquiales, un dato no verificado de forma independiente. No está pensado como asistente conversacional general ni como generador de código libre, sino como planificador estructurado para automatización de hojas de cálculo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 capas, GQA 28Q/4KV |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de referencia con `llama-server -c 4096`) |
| Tipos de cuantizacion | Q4_K_M (4,36 GiB, sha256 `d00bdc02d74aa29a397e0f73c07903d8188022b345c11493893009ec0afd29bb`) |
| Idiomas soportados | Chino, inglés y mezcla de código (code-mixed) |
| Licencia | Apache-2.0 (derivada de base Apache-2.0; ver NOTICE) |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7,61B parámetros con 28 capas y atención GQA con 28 cabezas de consulta y 4 de clave-valor. Sobre esa base se aplican tres ediciones de pesos ROME de rango uno (otras tres fueron rechazadas por el mecanismo de compuerta), seguidas de un SFT con LoRA de rango 32 en bf16, una continuación con LoRA y regularización sobre texto crudo, la fusión de adaptadores y la cuantización final a Q4_K_M.

Los datos de entrenamiento son 100 % sintéticos o autogenerados, sin datos de clientes ni conjuntos de terceros. El conjunto SFT v2 contiene 35.526 pares (instrucción, plan) generados por programa en temáticas empresariales (libro mayor, ventas, gastos, inventario, nóminas, cobros, facturas, asistencia); cada plan de referencia se ejecutó sobre un `.xlsx` real generado aleatoriamente y solo se conservó si la ejecución tenía éxito. Incluye 8.392 pares contrafactuales (un cambio mínimo de instrucción produce un resultado de ejecución distinto), 4.799 muestras de ambigüedad en cinco clases con 3.134 variantes aclaradas y 7.479 muestras con ruido humano (errores homófonos, abreviaturas pinyin, inversiones, mezcla de código y ruido de puntuación). La fase de continuación ("quench") suma 12.959 muestras, con 7.590 ejemplos dirigidos, 3.001 reproducidos del conjunto v2 y regularización por autodestilación: respuestas del modelo base original a 885 prompts generales, usadas tanto en formato chat como en texto crudo con pérdida LM de todos los tokens. Se reservaron familias de ruido, una temática y una familia de errores de teclado sin ver durante el entrenamiento.

## Capacidades

- Compilación de instrucciones coloquiales (chino, inglés o mezcla) en un JSON `Action Plan` v0.1 con operaciones tipadas.
- Limpieza de una y dos tablas, extracción mediante expresiones regulares y fórmulas vivas entre columnas.
- Búsquedas con XLOOKUP e INDEX-MATCH, formato condicional y agregación group-by.
- Operaciones de filtrado, valores únicos, división de columnas y gestión de ficheros y carpetas.
- Solicitud de aclaración cuando la instrucción es ambigua (cinco clases de ambigüedad cubiertas en entrenamiento).
- Salida con la clave `summary` en primer lugar para mostrar al usuario "he entendido: …" mientras el resto se transmite en streaming.
- Robustez ante ruido humano: errores homófonos, abreviaturas pinyin, inversiones y mezcla de código.
- Capacidad residual de chat y asistencia de código, aunque fuera del alcance objetivo.

## Casos de uso

- Back office financiero con datos sensibles: el modelo compila la instrucción y el motor ejecuta el plan sobre el `.xlsx` local sin que la tabla completa salga de la máquina, cumpliendo el requisito de privacidad de entidades reguladas.
- Limpieza y normalización de libros contables: ante instrucciones como marcar importes negativos en rojo y agregar por departamento en una hoja nueva, genera un plan con `conditional_format` y `group_aggregate` que el ejecutor valida y aplica.
- Automatización de informes de ventas: con un perfil de tabla (cabeceras y tres filas de muestra) el modelo produce fórmulas XLOOKUP o INDEX-MATCH para cruzar dos tablas sin exponer los datos completos.
- Asistencia en inventario y nóminas: las temáticas cubiertas en entrenamiento permiten generar planes de filtrado, deduplicación y agregación sobre ficheros de inventario, asistencia o recibos.
- Despliegue en portátiles de campo: con 4 GB de VRAM y `-ngl 21` el modelo arranca en GPU de consumo y prellena el sistema y el perfil de tabla mientras el usuario escribe, con primer token en torno a 0,2 s según el autor.
- Integración en herramientas ofimáticas con validación previa: el parser `tabularedge.llm_parser.parse` gestiona streaming, saneado, validación y rondas de reparación, y el ejecutor de referencia confirma pasos destructivos y hace copia de seguridad antes de sobrescribir.
- Atención de consultas ambiguas: cuando la instrucción no es determinista, el modelo pide aclaración en lugar de inventar una operación, lo que reduce ejecuciones erróneas en producción.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index; no verificados de forma independiente.

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Spreadsheet instruction → executable Action Plan | TabularEdge human colloquial set v2 (285 ítems de referencia) | Equivalencia de ejecución (accuracy) | 0,923 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 4 GB con la cuantización Q4_K_M (4,36 GiB de fichero); el autor indica `-ngl 21` para encajar en una GPU de 4 GB.
- GPU recomendadas: GPU de portátil o escritorio con 4 GB o más de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, según la model card, con 4 GB de VRAM; también funciona solo en CPU con `-ngl 0`.
- Despliegue: `llama-server` de llama.cpp con contexto 4096 y puerto 8080; cuantización Q4_K_M en formato GGUF; el parser de referencia está en `tabularedge/llm_parser.py`.
- Latencia: primer token en torno a 0,2 s en una GPU de 4 GB con prellenado del system prompt y el perfil de tabla, según el autor; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabularEdge-7B | 7,61B | 4096 | Planificador de hojas de cálculo en JSON, offline | Apache-2.0 | GGUF en Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base) | 7,61B | no disponible en la informacion | Asistencia de código y chat general | Apache-2.0 | Pesos completos en Hugging Face |
| Alternativas especializadas en tablas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El 92,3 % de equivalencia de ejecución es un dato declarado por el autor, marcado como no verificado y medido sobre un conjunto propio de 285 ítems; no debe tomarse como garantía en dominios distintos.
- Fuera de alcance: planificación en un solo paso de reglas de negocio largas con cuatro o más tablas; deben dividirse en pasos.
- No genera VBA ni Python de forma libre: está entrenado para emitir planes, no código; el uso como asistente de código o chat general es residual.
- Idiomas limitados a chino, inglés y mezcla de código; no se declara soporte de castellano ni de otras lenguas.
- El system prompt debe usarse literalmente tal como se entrenó (incluido el nombre en clave "StarTorch"); desviarse de él puede degradar la calidad del plan.
- Riesgo de alucinación en la estructura del JSON: la model card exige ejecutar solo mediante un ejecutor validador que confirme pasos destructivos y haga copia de seguridad antes de sobrescribir.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datos sintéticos, la cobertura se limita a las temáticas y patrones de ruido contemplados.
- Licencia Apache-2.0: permite uso comercial, pero al ser derivada de una base Apache-2.0 debe conservarse el NOTICE correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akuabliton/TabularEdge-7B-GGUF
- Código del motor y parser: https://github.com/1034592/TabularEdge-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de referencia citado en los tags: arxiv:2410.13497

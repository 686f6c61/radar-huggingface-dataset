# Sentovara/SmolLM3-3B-addon-pack

## Resumen

SmolLM3-3B-addon-pack es un paquete de adaptadores LoRA y pequenos programas auxiliares desarrollado por Sentovara (Jonathan Harriss) que se monta sobre el modelo base SmolLM3-3B de Hugging Face, sin modificar sus pesos. No es un modelo nuevo ni un ajuste fino general: es un conjunto de siete adaptadores especializados (router, sql, units, intent, welsh, tool y calc) mas siete herramientas en Python puro que se activan de forma selectiva segun la peticion del usuario. El router decide, para cada consulta, si debe responder el modelo base o uno de los adaptadores, y en el caso de calculos el adaptador `calc` delega la operacion en una herramienta determinista.

El objetivo es demostrar que un modelo pequeno de 3B parametros puede alcanzar precision casi perfecta en tareas acotadas (aritmetica de numeros grandes, Sudoku, fechas, decodificacion Caesar/base64, conversiones de unidades, intencion bancaria, traduccion ingles-galés y text-to-SQL) cuando se combina con adaptadores LoRA de rango bajo y herramientas externas verificables. El paquete se distribuye como repositorio de 0,8 GB con pesos en safetensors y licencia Apache 2.0, e incluye scripts de ejecucion (`run.py`) y de formato del router.

Es relevante ahora porque ejemplifica un patron de diseno pragmatico para modelos pequenos en produccion: en lugar de escalar el modelo, se orquesta un router ligero con especialistas y herramientas, manteniendo intacto el comportamiento general del modelo base. Los resultados publicados por el autor, aunque proceden de test sets propios y no de benchmarks publicos, muestran mejoras muy marcadas en las tareas cubiertas sin degradar las comprobaciones generales (IFEval, GSM8K, HumanEval+ y MBPP+).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre SmolLM3-3B (transformer decoder-only) |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base SmolLM3-3B tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | ingles (en), gales (cy) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) + Python plano para las herramientas |
| Tamano del repositorio | 0,8 GB |
| Modelo base | HuggingFaceTB/SmolLM3-3B |
| Modo de inferencia | greedy, no-think mode |

## Arquitectura y entrenamiento

El paquete no entrena un modelo desde cero ni modifica los pesos de SmolLM3-3B: entrena siete adaptadores LoRA independientes de rango 16 y alpha 32, con una sola pasada de entrenamiento y en modo no-think del modelo base. El adaptador `router` se entrena con 7.700 peticiones etiquetadas para elegir entre ocho clases (`sql`, `units`, `intent`, `welsh`, `json`, `tool`, `calc` o `none`). El resto de adaptadores se entrena con 5.000 ejemplos de su habilidad especifica mezclados con 5.000 ejemplos generales cuyas respuestas fueron generadas por el propio SmolLM3-3B, con el fin de preservar el comportamiento cotidiano del modelo y evitar olvido catastrofico.

Los datos de entrenamiento proceden de fuentes publicas y sinteticas: Gretel synthetic text-to-SQL (Apache 2.0) para `sql`, Banking77 (CC BY 4.0) para `intent`, Cofnod y Cynulliad en-cy (Open Government Licence) para `welsh`, Hermes function-calling v1 y Glaive function-calling v2 (Apache 2.0) para `tool`, y datos generados internamente para `units` y `calc`. El adaptador `calc` no calcula por si mismo: aprende a invocar las siete herramientas Python (solucionador de Sudoku, calculadora exacta de numeros grandes, herramientas de fechas, decodificadores Caesar y base64) y a reportar el resultado. El adaptador `json` no se incluye en el paquete por problemas de licencia de sus datos de entrenamiento, aunque el router puede seguir seleccionandolo y en ese caso responde el modelo base.

## Capacidades

- Enrutamiento de peticiones entre ocho clases de tarea mediante un adaptador LoRA dedicado.
- Traduccion de lenguaje natural a consultas SQLite (adaptador `sql`).
- Conversiones de unidades con salida numerica (adaptador `units`).
- Clasificacion de intencion de cliente bancario con 77 etiquetas (adaptador `intent`).
- Traduccion ingles-galés (adaptador `welsh`).
- Tool calling y function calling general (adaptador `tool`).
- Resolucion de Sudoku, aritmetica exacta de numeros grandes, calculo de fechas y decodificacion Caesar/base64 mediante herramientas externas (adaptador `calc`).
- Mantenimiento del comportamiento general del modelo base en tareas no cubiertas (el router deriva a `none`).
- Capacidades multilingues limitadas a ingles y gales.
- No incluye vision, audio, thinking mode ni soporte de agentes multi-paso mas alla del encadenamiento router -> adaptador -> herramienta.

## Casos de uso

- Atencion al cliente bancaria automatizada: el adaptador `intent` clasifica consultas en 77 categorias con un 91,0% de acierto en el test split de Banking77, lo que permite enrutar tickets hacia el departamento correcto sin un modelo grande.
- Traduccion de documentacion oficial al gales: el adaptador `welsh` alcanza un chrF de 57,9 en el corpus Cofnod y Cynulliad, adecuado para traduccion asistida de textos administrativos y parlamentarios.
- Generacion de consultas SQL sobre bases SQLite: el adaptador `sql` obtiene un 72,0% de coincidencia en el resultado de la consulta, util para asistentes de analitica interna que traducen preguntas en lenguaje natural a SQL.
- Calculo determinista en asistentes financieros o cientificos: el adaptador `calc` delega en una calculadora exacta y alcanza el 100% en aritmetica de numeros grandes y en matematicas de fechas, evitando errores de redondeo tipicos de los LLM.
- Resolucion de Sudoku y decodificacion de mensajes: las herramientas de Sudoku y Caesar/base64 alcanzan un 99,3% de acierto (modelo + herramienta), utiles en aplicaciones de ocio, puzzles o analisis forense basico.
- Conversion de unidades en interfaces de usuario: el adaptador `units` logra un 91,3% de acierto con salida solo numerica, apropiado para formularios y APIs que requieren valores normalizados.
- Integracion en pipelines de automatizacion con tool calling: el adaptador `tool` (71,3% en el checker BFCL-style propio) permite conectar el modelo a funciones externas en flujos de CI/CD o asistentes de desarrollo.
- Despliegue en entornos con recursos limitados: al ser adaptadores LoRA sobre un modelo de 3B, el paquete completo cabe en 0,8 GB y puede ejecutarse en GPU de consumo, lo que facilita prototipos y despliegues en el borde.

## Benchmarks y rendimiento

Resultados publicados por el autor en sus propios test sets (11.528 preguntas, 300 por habilidad y 400 para intencion), comparando SmolLM3-3B sin adaptadores frente al paquete completo, en modo greedy y no-think. Las puntuaciones marcadas como "modelo + herramienta" incluyen el calculo realizado por la herramienta, no solo por el modelo.

| Test | SmolLM3-3B sin adaptadores | Con este paquete |
|---|---|---|
| Router elige el adaptador correcto (8.974 preguntas) | — | 99,9% |
| Sudoku (modelo + herramienta) | 0% | 99,3% |
| Aritmetica de numeros grandes (modelo + herramienta) | 0,3% | 100% |
| Matematicas de fechas (modelo + herramienta) | 5,3% | 100% |
| Decodificacion Caesar / base64 (modelo + herramienta) | 0% | 99,3% |
| Intencion de cliente (Banking77 test split) | 33,5% | 91,0% |
| Conversiones de unidades | 0,7% | 91,3% |
| Ingles -> gales (chrF; copiar el ingles da 19) | 12,4 | 57,9 |
| Ingles -> SQL (coincidencia del resultado) | 63,0% | 72,0% |
| Tool calling (checker BFCL-style propio, no el leaderboard oficial) | 70,4% | 71,3% |
| Escritura de regex / extraccion de campos (modelo base) | 91,0% / 87,3% | 91,0% / 87,3% |
| JSON desde esquema (JSONSchemaBench; sin adaptador JSON) | 0% exacto / 71,4% tras limpiar | 0% / 71,5% |
| IFEval / GSM8K / HumanEval+ y MBPP+ | 66,7 / 84,0 / 60,9 | 66,9 / 84,0 / 60,7 |

El autor advierte que estas cifras no son resultados de leaderboards publicos y que las pequenas diferencias entre ejecuciones (hasta aproximadamente 1 punto) provienen de la maquina y del orden de los lotes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,8 GB y se monta sobre SmolLM3-3B, por lo que la VRAM depende del modelo base y de su cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada; al tratarse de un modelo de 3B, es razonable esperar que funcione en GPU de consumo, pero el autor no publica recomendaciones concretas.
- Cabe en GPU de consumo: no confirmado por el autor; el tamano del paquete (0,8 GB) y el modelo base de 3B sugieren que si, pero no se especifica que modelos.
- Opciones de despliegue: el autor documenta transformers + peft con decodificacion greedy; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentovara SmolLM3-3B-addon-pack | 3B (base) + LoRA | no disponible | Router + adaptadores LoRA + herramientas | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas de 3B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks publicos comparables para otros modelos de la misma categoria en la informacion proporcionada; las cifras del paquete son de test sets propios del autor y no son directamente comparables con leaderboards externos.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos de SmolLM3-3B no se modifican y el paquete no debe presentarse como un modelo con mejoras generales.
- Los resultados son de test sets propios del autor, no de benchmarks publicos; no son comparables con leaderboards oficiales.
- Las puntuaciones de calculo son "modelo + herramienta": la herramienta realiza el calculo, por lo que no reflejan capacidad aritmetica del modelo por si solo.
- El adaptador `json` no esta incluido por problemas de licencia de sus datos de entrenamiento; el router puede seleccionarlo y en ese caso responde el modelo base, lo que puede producir resultados inconsistentes en tareas JSON.
- El soporte linguistico se limita a ingles y gales; no hay evidencia de calidad en castellano u otros idiomas.
- Riesgo de alucinacion en las tareas no cubiertas por los adaptadores, ya que el router deriva a `none` y responde el modelo base sin cambios.
- Sesgos conocidos: no documentados por el autor; los datos de Banking77 y Cofnod y Cynulliad pueden introducir sesgos propios de sus dominios.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento de terceros (Banking77 CC BY 4.0, Cofnod y Cynulliad OGL) imponen obligaciones de atribucion que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sentovara/SmolLM3-3B-addon-pack
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Sitio del autor: https://sentovara.com
- Dataset Gretel synthetic text-to-SQL: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset Cofnod y Cynulliad en-cy: https://huggingface.co/datasets/techiaith/cofnodycynulliad_en-cy
- Dataset Hermes function-calling v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1

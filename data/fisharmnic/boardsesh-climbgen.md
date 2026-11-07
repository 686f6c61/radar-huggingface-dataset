# fisharmnic/boardsesh-climbgen

## Resumen

Boardsesh climbgen es una familia de modelos pequenos desarrollados por fisharmnic para generar rutas de escalada en tableros LED estandarizados (Kilter Board y Tension Board). El modelo resuelve un problema muy concreto: escribir secuencias de presas coherentes y con una dificultad estimada (grado V) para un layout de tablero determinado, de forma que la app movil Boardsesh pueda ofrecer un generador de rutas experimental incluso sin conexion. Cada layout de tablero dispone de su propio modelo, entrenado sobre los datos de esa geometria y ese conjunto de presas.

La arquitectura es un transformer pequeno con pesos en int8, pensado para ejecutarse en el dispositivo (on-device) dentro de la app movil. El repositorio incluye cuatro variantes correspondientes a cuatro layouts: `kilter-1` (Kilter Board Original 12x12), `tension-9` (Tension Board 1), `tension-10` (Tension Board 2 Mirror) y `tension-11` (Tension Board 2 Spray). Los modelos se distribuyen con un manifiesto que permite actualizaciones versionadas y verificacion por SHA-256.

El proyecto es relevante por su enfoque de despliegue: modelos especializados, ligeros y versionados por fichero, con un componente separado de grading probabilistico que devuelve una distribucion sobre grados V en lugar de una unica etiqueta. La licencia es MIT y el entrenamiento se apoya en los snapshots publicos de tableros que publica Boardsesh.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeno (climb writer) con pesos int8; componente separado de grading probabilistico |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos del climb writer) |
| Idiomas soportados | no disponible (dominio especifico: rutas de escalada, no texto general) |
| Licencia | MIT |
| Formato de pesos | `weights.bin` (int8), `grader.json`, `model-meta.json`, `manifest.json` |

## Arquitectura y entrenamiento

El climb writer es un transformer pequeno cuantizado a int8 que genera secuencias de presas sobre un layout de tablero concreto. El modelo no opera sobre texto libre sino sobre la representacion estructurada del tablero descrita en `model-meta.json`: posiciones de presas, roles de presa, angulos y palabras clave. El grader es un componente independiente que produce una probabilidad por cada grado V, permitiendo a la app mostrar un rango (por ejemplo "V8-V10") en lugar de una estimacion puntual.

El entrenamiento utiliza los snapshots nocturnos publicos de tableros que publica Boardsesh, filtrando rutas con al menos 3 ascensos y tomando un ejemplo por ruta y angulo. Los volumenes de datos varian por layout: 126k filas para `kilter-1`, 40k para `tension-9`, 24k para `tension-10` y 19k para `tension-11`. Los grados y rutas proceden de las comunidades de cada tablero. No se detalla en la informacion disponible si hubo RLHF, DPO ni innovaciones de decodificacion especulativa.

El error medio del grader sobre rutas reservadas (held out) es de 0.99 V en `kilter-1`, 0.96 V en `tension-9`, 1.05 V en `tension-10` y 1.08 V en `tension-11`. El porcentaje de casos en que el rango mostrado contiene el grado real es del 84-86% para V0-V7 y del 80% para V8-V11 en `kilter-1`; 82-86% y 79% en `tension-9`; 84-86% y 79% en `tension-10`; y 82% y 73% en `tension-11`.

## Capacidades

- Generacion de rutas de escalada para layouts concretos de Kilter Board y Tension Board.
- Estimacion probabilistica de dificultad mediante un grader que devuelve una distribucion sobre grados V.
- Presentacion de un rango de grado (por ejemplo "V8-V10") derivado de la distribucion del grader.
- Ejecucion on-device: los pesos se descargan una vez y se almacenan en el telefono.
- Actualizacion versionada por carpeta de fecha con verificacion SHA-256 a traves de `manifest.json`.
- Soporte de distintos angulos de tablero, segun los metadatos del modelo.
- No se documentan capacidades de texto general, codigo, matematicas, vision, tool calling ni agentes.

## Casos de uso

- Generador de rutas en la app Boardsesh: el modelo escribe rutas para el tablero seleccionado y la app las muestra al instante, sin necesidad de conexion una vez descargados los ficheros del layout.
- Sugerencia de entrenamiento en el gimnasio: un escalador puede pedir rutas nuevas en un rango de dificultad objetivo y el grader filtra o etiqueta las propuestas con un rango V.
- Entrenamiento de fuerza especifica por angulo: al estar entrenado con ejemplos por ruta y angulo, el modelo puede generar propuestas ajustadas al angulo configurado en `model-meta.json`.
- Exploracion de dificultad: el rango probabilistico del grader permite al usuario ver la incertidumbre y elegir rutas en el limite de su nivel.
- Distribucion offline en movil: el formato de pesos int8 y el esquema de manifiesto permiten empaquetar el modelo en la app y actualizarlo sin publicar una nueva version de la aplicacion.
- Integracion con herramientas de terceros: un servidor MCP no oficial (boardsesh-mcp) da acceso de solo lectura al registro de escalada, lo que permite a agentes externos consultar el historial y combinarlo con rutas generadas.
- Investigacion sobre generacion estructurada: el proyecto sirve como ejemplo de modelo pequeno de dominio especifico con salida estructurada y verificacion de integridad por hash.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas del grader sobre rutas reservadas:

| Layout | Filas de entrenamiento | Error medio del grader | Rango contiene el grado real (V0-V7 / V8-V11) |
|---|---|---|---|
| `kilter-1` (Kilter Board Original 12x12) | 126k | 0.99 V | 84-86% / 80% |
| `tension-9` (Tension Board 1) | 40k | 0.96 V | 82-86% / 79% |
| `tension-10` (Tension Board 2 Mirror) | 24k | 1.05 V | 84-86% / 79% |
| `tension-11` (Tension Board 2 Spray) | 19k | 1.08 V | 82% / 73% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecutarse en el dispositivo movil con pesos int8, por lo que su huella es reducida.
- GPU recomendadas: no aplica en el escenario objetivo (on-device); no se especifican GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: integracion directa en la app Boardsesh mediante los ficheros `weights.bin`, `grader.json` y `model-meta.json`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de generacion de rutas de escalada en la documentacion proporcionada. Los unicos elementos relacionados son la propia app Boardsesh y el servidor MCP no oficial `boardsesh-mcp`, que no son modelos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boardsesh-climbgen | no disponible | no disponible | error del grader 0.96-1.08 V | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje general y no debe usarse para texto, codigo ni tareas fuera de la generacion de rutas en tableros soportados.
- Cobertura limitada a cuatro layouts: `kilter-1`, `tension-9`, `tension-10` y `tension-11`; no hay soporte documentado para MoonBoard ni otros tableros.
- Dependencia de datos comunitarios: las rutas y grados provienen de las comunidades de cada tablero, por lo que pueden arrastrar sesgos de estilo, dificultad percibida y cobertura desigual entre grados.
- Error de grading no despreciable: entre 0.96 y 1.08 V de media, y el rango mostrado no contiene el grado real en un 14-27% de los casos segun el layout y el rango de dificultad.
- Mayor degradacion en grados altos: la cobertura del rango cae de forma notable en V8-V11, especialmente en `tension-11` (73%).
- Riesgo de propuestas poco realistas: al ser un modelo generativo pequeno, puede producir secuencias de presas fisicamente validas en el layout pero poco naturales o repetitivas.
- Licencia MIT: permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Aurora Climbing, Moon Climbing ni fabricantes de tableros; Kilter, Tension y MoonBoard son marcas de sus propietarios.
- Sin datos publicados de parametros, contexto ni latencia, lo que dificulta estimar costes de despliegue fuera del escenario on-device previsto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere validacion externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fisharmnic/boardsesh-climbgen
- Codigo de entrenamiento: https://github.com/FISHARMNIC/boardsesh/tree/feat/climb-generator-v2/ml/climbgen
- Repositorio Boardsesh: https://github.com/boardsesh/boardsesh
- Documentacion del dataset de snapshots: https://github.com/boardsesh/boardsesh/blob/main/docs/board-snapshots-dataset.md
- Web de Boardsesh: https://www.boardsesh.com/
- Servidor MCP no oficial: https://pypi.org/project/boardsesh-mcp/

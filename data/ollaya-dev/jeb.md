# ollaya-dev/jeb

## Resumen

`ollaya-dev/jeb` es un paquete de grafos ONNX publicado por ollaya-dev para su runtime local de modelos de decision, Ollaya. No contiene pesos: cada grafo exportado en ONNX referencia los pesos originales de los modelos `frontier-infra/jebadiah` (4b, 9b y 27b, todos en formato GGUF) mediante desplazamientos de bytes, de forma que `ollaya pull` descarga los pesos desde los repositorios de origen sin modificarlos y verifica su sha256. El modelo se comercializa como un modelo de decision (etiqueta `decision-model`, tipo `system-one`) y se enmarca en la tarea de clasificacion de texto.

El objetivo del proyecto es ejecutar modelos de decision abiertos en local con una ergonomia similar a la de Ollama para LLM: se introducen preguntas tipadas y se obtienen respuestas calibradas detras de una API compatible con TypeSafe. La relevancia actual radica en que separa el grafo computacional (ONNX, versionado en este repositorio) de los pesos (GGUF, alojados por terceros), lo que permite auditar la paridad numerica frente a llama.cpp sin redistribuir pesos.

El repositorio incluye tres etiquetas (`jeb:4b`, `jeb:9b`, `jeb:27b`), cada una con un grafo en fp32, un fichero `decision.json` (layout de secuencia y tokens especiales) y un fichero `calibration.json` (temperaturas). Los modelos base son creaciones de Jason Brashear, AINode (frontier-infra). El autor declara que el runner reproduce fielmente el comportamiento de llama-server sobre el mismo GGUF con CUDA en una RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX que referencia pesos GGUF de los modelos `frontier-infra/jebadiah` (arquitectura interna del modelo base: no disponible) |
| Parametros totales | Tres variantes segun etiqueta: ~4B (`jeb:4b`), ~9B (`jeb:9b`), ~27B (`jeb:27b`) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Grafo en fp32; los pesos proceden de GGUF upstream (cuantizaciones concretas: no disponible) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos); los pesos no se alojan aqui, se descargan como GGUF desde los repositorios upstream |

## Arquitectura y entrenamiento

El artefacto de este repositorio no es un modelo entrenado por ollaya-dev, sino un contenedor de inferencia: exportaciones ONNX en fp32 que apuntan por desplazamiento de bytes a los pesos de `frontier-infra/jebadiah-4b-v2-GGUF`, `jebadiah-9b-v2-GGUF` y `jebadiah-27b-GGUF`. Cada etiqueta incluye ademas `decision.json`, que define el layout de secuencia y los tokens especiales, y `calibration.json`, que aporta las temperaturas usadas para calibrar las probabilidades de salida. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, ya que corresponden a los modelos upstream de frontier-infra.

La innovacion tecnica destacable es el mecanismo de empaquetado y verificacion: el repositorio se distribuye sin pesos, estos se anclan a un commit concreto de cada repositorio de origen y se validan por sha256. El autor documenta una prueba de paridad frente a llama-server de la build fijada b11146 sobre el mismo GGUF con CUDA en una RTX 4090: 494 preguntas por modelo, coincidencia total en cada decision, logits de opcion dentro de 7,7e-6 y probabilidades dentro de 2,4e-6. Ademas, los prompts son identicos a los generados por el `jebadiah_prompt.Renderer` del autor en 1.349 prompts de prueba.

## Capacidades

- Clasificacion de texto y toma de decisiones: el pipeline declarado es `text-classification`, con respuestas calibradas sobre opciones.
- Modelo de decision tipo `system-one`: orientado a decisiones rapidas e intuitivas, en la linea de la nomenclatura usada en el repositorio.
- Inferencia local mediante el runtime Ollaya, con API compatible con TypeSafe.
- Ejecucion sobre CPU y GPU: el grafo fp32 esta pensado para ambos entornos.
- Calibracion de probabilidades mediante temperaturas declaradas en `calibration.json`.
- Seleccion entre tres tamanos (4B, 9B, 27B) segun el compromiso entre coste y capacidad.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido, vision o audio: no disponible.

## Casos de uso

- Clasificacion de decisiones en local sin conexion: al ser un modelo de decision empaquetado como grafo ONNX y ejecutado por el runtime Ollaya, permite desplegar clasificadores en entornos aislados donde no se pueden enviar datos a servicios externos, con verificacion de integridad de pesos por sha256.
- Enrutamiento de peticiones en pipelines internos: la salida calibrada (probabilidades ajustadas por `calibration.json`) permite decidir entre ramas alternativas de un flujo con umbrales de confianza explicitos.
- Moderacion y filtrado de contenido: con `jeb:4b` o `jeb:9b` se puede clasificar texto entrante con baja latencia y una huella de memoria reducida, integrando la decision en el mismo proceso que consume la API TypeSafe.
- Sistemas de recomendacion de decision rapida: el enfoque `system-one` encaja en escenarios donde prima la velocidad sobre el razonamiento profundo, como sugerir la siguiente accion en una interfaz.
- Investigacion sobre paridad de runtimes: el repositorio sirve como banco de pruebas para comparar un runner propio (Ollaya) contra llama-server sobre el mismo GGUF, con metricas de coincidencia de logits y probabilidades ya documentadas.
- Despliegue reproducible en CI: al anclar los pesos a commits concretos y verificar sha256, se puede integrar la descarga y validacion dentro de un pipeline de integracion continua sin almacenar pesos en el propio artefacto.
- Evaluacion comparada por tamano: las tres etiquetas (4B, 9B, 27B) permiten medir el impacto del tamano en la calidad de decision sobre el mismo conjunto de preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo proporcionado es la prueba de paridad frente a llama-server b11146 sobre el mismo GGUF con CUDA en una RTX 4090:

| Metrica | Valor |
|---|---|
| Preguntas evaluadas por modelo | 494 |
| Coincidencia en cada decision | Total (todas iguales) |
| Diferencia maxima en logits de opcion | 7,7e-6 |
| Diferencia maxima en probabilidades | 2,4e-6 |
| Prompts comparados con `jebadiah_prompt.Renderer` | 1.349 |

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion de los pesos upstream (GGUF), no indicada. Como referencia orientativa, un grafo fp32 de los tamanos declarados ocuparia aproximadamente 16 GB (4B), 36 GB (9B) y 108 GB (27B); con pesos cuantizados a 8 bits serian del orden de 4 GB, 9 GB y 27 GB, y a 4 bits del orden de 2 GB, 4,5 GB y 13,5 GB. Son calculos basados en el numero de parametros, no en datos publicados.
- GPU recomendadas: no disponible de forma explicita; el autor valida el comportamiento sobre una RTX 4090 con CUDA.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; la validacion documentada usa una RTX 4090.
- Opciones de despliegue: runtime Ollaya (`ollaya run jeb`, `ollaya pull`); tambien es posible ejecutar el mismo GGUF con llama-server, segun la comparacion de paridad del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables identificados en la informacion proporcionada (mas alla de los propios modelos base de frontier-infra). La unica comparativa posible es entre las tres etiquetas del mismo repositorio:

| Etiqueta | Parametros | Repositorio upstream | Ficheros |
|---|---|---|---|
| `jeb:4b` | ~4B | frontier-infra/jebadiah-4b-v2-GGUF@7f671f9 | `4b/decision.json`, `4b/calibration.json` |
| `jeb:9b` | ~9B | frontier-infra/jebadiah-9b-v2-GGUF@adaec6b | `9b/decision.json`, `9b/calibration.json` |
| `jeb:27b` | ~27B | frontier-infra/jebadiah-27b-GGUF@7451e61 | `27b/decision.json`, `27b/calibration.json` |

Modelos alternativos de la misma categoria: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin acceso a los repositorios upstream de frontier-infra no hay modelo ejecutable.
- La licencia declarada es Apache-2.0 y se hereda la del modelo upstream; conviene verificar las condiciones del modelo base antes de un uso comercial.
- Idiomas soportados no especificados, lo que impide garantizar cobertura multilingue.
- Longitud de contexto no disponible; no se puede planificar el uso en conversaciones largas sin comprobacion previa.
- La informacion disponible no documenta sesgos ni riesgo de alucinacion; por tratarse de un modelo de decision, las salidas deben interpretarse como clasificaciones calibradas, no como texto generado fiable.
- La paridad numerica documentada corresponde a un entorno concreto (llama-server b11146, CUDA, RTX 4090); no se garantiza el mismo comportamiento en otros backends o versiones.
- El numero de descargas y de "likes" publicados es cero, lo que indica un artefacto reciente y sin validacion por parte de la comunidad.
- La fecha de creacion y actualizacion registrada (2026-09-30) es posterior a la fecha de consulta habitual; conviene confirmar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ollaya-dev/jeb
- Modelo base 4B: https://huggingface.co/frontier-infra/jebadiah-4b-v2-GGUF
- Modelo base 9B: https://huggingface.co/frontier-infra/jebadiah-9b-v2-GGUF
- Modelo base 27B: https://huggingface.co/frontier-infra/jebadiah-27b-GGUF
- Commit fijado del modelo 4B: https://huggingface.co/frontier-infra/jebadiah-4b-v2-GGUF/tree/7f671f9a31827257c26401000484e154b39417e6
- Commit fijado del modelo 9B: https://huggingface.co/frontier-infra/jebadiah-9b-v2-GGUF/tree/adaec6b3d1f0421706deb49fa275ab49093982ff
- Commit fijado del modelo 27B: https://huggingface.co/frontier-infra/jebadiah-27b-GGUF/tree/7451e611a20ce3f56dd7d87f78c8a25b736c08f5
- Repositorio del runtime Ollaya: https://github.com/ollaya-dev/ollaya

# eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 es una especializacion del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel, orientada a la clasificacion y decision sobre textos relacionados con privacidad y proteccion de datos segun la LGPD brasilena. No es un modelo de proposito general: es un derivado cuantizado a int4 en formato ONNX y empaquetado para el ecosistema Transformers.js, con cabezas de decision adicionales que permiten emitir decisiones tipadas (por ejemplo, si un fragmento trata sobre los destinatarios de los datos) junto con una probabilidad y un margen de confianza.

El modelo implementa un esquema dual "System 1 / System 2": una pasada rapida (System 1) produce una decision tipada mediante cabezas entrenadas especificamente, y una generacion de texto completa con los mismos pesos (System 2) puede aportar una explicacion cuando el margen de la decision es bajo. Esta arquitectura esta inspirada en trabajos previos como alias3-web y el articulo "Browser Immune System" (arXiv 2611.15302), y reutiliza la receta de entrenamiento de las cabezas del proyecto Kev.

Su relevancia practica radica en que permite ejecutar un modelo de 3B parametros directamente en el navegador (WebGPU o CPU via WASM) con un consumo de memoria contenido (0,5 GB en WebGPU, 2,8 GB en CPU), lo que habilita casos de analisis de politicas de privacidad sin enviar datos a un servidor. La licencia CC BY 4.0 y los idiomas soportados (portugues e ingles) acotan su ambito de aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) con cabezas de decision adicionales; esquema dual System 1 / System 2 |
| Parametros totales | 3B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (ONNX `model_q4.onnx`) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int4), con cabezas en `heads/` y `manifest.json` / `manifest.en.json`; `chat_template.jinja` |
| Tamano del repositorio | 1,8 GB |
| Libreria | `s1s2` |
| Pipeline | text-generation (con clasificacion de decision tipada) |
| Modelo base | HuggingFaceTB/SmolLM3-3B (Apache-2.0) |
| Descargas | 262 |
| Fecha de creacion | 2026-11-17 |
| Ultima actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3B parametros desarrollado por Hugging Face. Sobre ese backbone, el autor anade cabezas de decision (pointer head) entrenadas para tareas de clasificacion tipada sobre fragmentos de politicas de privacidad. La receta de entrenamiento de estas cabezas proviene del proyecto Kev (Apache-2.0), y la idea de separacion System 1 / System 2 con compuerta de margen se atribuye a CT0 de Alias Robotics.

Los datos de entrenamiento combinan el corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0), que constituye la unica fuente de datos de privacidad real, y datos sinteticos Kev (legacy_policy y composicionales) generados por codigo Kev. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es el diseno dual: una decision de una sola pasada con probabilidad y margen, y una generacion de texto con los mismos pesos para explicar o revisar la decision cuando el margen es bajo (el ejemplo de la model card usa un umbral de 0,2, aunque se indica que debe medirse por caso).

El empaquetado ONNX introduce adaptaciones tecnicas para Transformers.js: la dimension de la cabeza del KV cache esta fijada en el grafo, las filas de tokens se leen de la tabla int4 con operaciones ONNX estandar en lugar de `com.microsoft GatherBlockQuantized` (sin kernel de CPU en navegador), y `lm_head` se divide en cuatro partes a lo largo del vocabulario para que la CPU en navegador quepa en memoria wasm32. Los bytes de los pesos int4 son identicos a los del build de referencia basado en ONNX Runtime GenAI.

## Capacidades

- Clasificacion y decision tipada sobre fragmentos de texto: preguntas de tipo `choice` con opciones definidas en el manifiesto (por ejemplo, `Sim` / `Não`), devolviendo eleccion, probabilidad y margen.
- Generacion de texto explicativo con los mismos pesos (System 2) para justificar una decision en dos frases o similar.
- Deteccion de casos de baja confianza mediante el margen de la decision, que permite derivar a revision humana.
- Soporte de tareas de privacidad y proteccion de datos segun LGPD: destinatarios de datos, categorias de terceros y otras preguntas definidas en los manifiestos.
- Capacidades multilingues limitadas a portugues e ingles (manifiestos `manifest.json` y `manifest.en.json`).
- Ejecucion en navegador mediante Transformers.js, con backend WebGPU y CPU via WASM.
- Integracion con el paquete `@s1s2/web` y con un pipeline `decision` en borrador de Transformers.js (PR #1943).
- No se documentan capacidades de vision, audio, tool calling ni razonamiento multi-paso general en la informacion disponible.

## Casos de uso

- Analisis de politicas de privacidad en el navegador: una aplicacion web puede cargar el modelo con Transformers.js y evaluar fragmentos de una politica para determinar, por ejemplo, si se comparten datos con terceros, sin enviar el texto a un servidor.
- Revision asistida de contratos y avisos legales: el modelo emite decisiones tipadas con probabilidad y margen, y el sistema puede marcar para revision humana los casos con margen inferior al umbral configurado.
- Cumplimiento LGPD en productos brasileños: integracion en flujos de auditoria interna para clasificar secciones de documentos segun las preguntas definidas en el manifiesto en portugues.
- Explicabilidad de decisiones automatizadas: cuando el margen es bajo, el modo System 2 genera una explicacion breve con los mismos pesos, util para registros de auditoria o para el usuario final.
- Procesamiento con privacidad por diseño: al ejecutarse en el cliente (WebGPU o WASM), los textos sensibles no salen del dispositivo, lo que encaja con requisitos de minimizacion de datos.
- Prototipado rapido de clasificadores de privacidad: el paquete `@s1s2/web` y los manifiestos permiten definir nuevas preguntas y opciones sin reentrenar el backbone, reutilizando las cabezas existentes.
- Filtrado previo en pipelines de moderacion o compliance: la decision de una sola pasada (0,36 s en WebGPU en el hardware medido) permite descartar rapidamente fragmentos irrelevantes antes de un analisis mas profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta pruebas de paridad y latencia:

| Prueba | Entorno | Resultado |
|---|---|---|
| Paridad de estado oculto con build GenAI | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1), 20 prompts | max \|diff\| = 0 en cada posicion de lectura |
| Paridad de probabilidades de cabeza | Node CPU, 20 prompts | max \|diff\| = 0 |
| Paridad de decisiones | Node CPU, 20 prompts | 20/20 iguales |
| Paridad de decisiones en WebGPU | Chrome 157, Apple M2 Pro, 20 prompts | 20/20 iguales al build GenAI |
| Latencia por decision (WebGPU) | Chrome 157, Apple M2 Pro | 0,36 s por decision |
| Memoria de pagina (WebGPU) | Chrome 157, Apple M2 Pro | 0,5 GB (sin contar buffers de GPU) |
| Latencia por decision (CPU WASM) | Chrome 157, Apple M2 Pro | 5,5 s por decision |
| Memoria de pagina (CPU WASM) | Chrome 157, Apple M2 Pro | 2,8 GB (pico de pestana 4,7 GB durante la carga) |
| Coincidencia WebGPU vs CPU | Chrome 157, Apple M2 Pro, 20 prompts | 20/20 decisiones iguales |
| Ejemplo de decision | Node CPU | `Sim`, confianza 0,96, margen 0,93 |

Los 20 prompts son una comprobacion escrita para esta verificacion, no un conjunto de test representativo.

## Requisitos de hardware

- VRAM/memoria: en WebGPU, aproximadamente 0,5 GB de memoria de pagina (sin contar buffers de GPU); en CPU via WASM, 2,8 GB de memoria de pagina con un pico de 4,7 GB durante la carga. El repositorio ocupa 1,8 GB en disco.
- GPU recomendadas: no se especifican modelos concretos; las mediciones se realizaron en un Apple M2 Pro con WebGPU en Chrome 157. No hay datos para A100, H100 o RTX 4090 en la informacion disponible.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en el navegador sobre GPU integradas o de consumo mediante WebGPU, y tambien en CPU via WASM sin GPU.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con el paquete `@s1s2/web`, o el pipeline `decision` de la PR #1943 de transformers.js; tambien disponible el build de referencia con ONNX Runtime GenAI en el repositorio hermano.
- Latencia y throughput: 0,36 s por decision en WebGPU y 5,5 s por decision en CPU WASM, medidos en Apple M2 Pro con Chrome 157. No se reporta throughput agregado ni latencia para generacion de texto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 | 3B | no disponible | ONNX int4 | CC BY 4.0 | Especialista en privacidad/LGPD con cabezas de decision, ejecucion en navegador |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible en la informacion proporcionada | safetensors (formato original) | Apache-2.0 | Modelo base de proposito general |
| SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 | 3B | no disponible | ONNX int4 (ONNX Runtime GenAI) | no disponible en la informacion proporcionada | Mismo especialista, build de referencia para runtime GenAI |
| alias3-web (Alias Robotics) | no disponible | no disponible | no disponible | no disponible | Precursor del enfoque de sistema inmunitario en navegador |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las cabezas de decision son archivos separados en `heads/` y solo las aplica la libreria `s1s2`; Transformers.js por si solo no las lee.
- El modelo esta especializado en privacidad/LGPD y en dos idiomas (pt, en); no es adecuado como modelo de proposito general ni para otros dominios sin reentrenamiento de las cabezas.
- La evaluacion reportada se basa en 20 prompts escritos para la comprobacion de paridad, no en un conjunto de test independiente; la exactitud real en produccion no esta caracterizada.
- El umbral de margen (0,2 en el ejemplo) es ilustrativo y debe calibrarse por caso; por debajo de ese margen no se recomienda confiar en la decision de una sola pasada.
- Riesgo de alucinacion en el modo generativo (System 2): las explicaciones se generan con los mismos pesos y no estan garantizadas como fieles a la decision.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; los datos de privacidad provienen de un unico corpus (Claudinha) mas datos sinteticos, lo que puede limitar la generalizacion.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; el modelo base SmolLM3-3B es Apache-2.0 y los datos Kev y Claudinha conservan sus atribuciones respectivas.
- En CPU via WASM la latencia es alta (5,5 s por decision) y el consumo de memoria durante la carga alcanza 4,7 GB, lo que puede ser problematico en dispositivos con poca RAM.
- La integracion mediante `pipeline("decision")` depende de una PR en borrador de transformers.js (#1943); sin ella es necesario usar el codigo de `s1s2`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2
- Build de referencia (ONNX Runtime GenAI): https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Transformers.js: https://github.com/huggingface/transformers.js
- PR de transformers.js para pipeline `decision`: https://github.com/huggingface/transformers.js/pull/1943
- Corpus Claudinha: https://zenodo.org/records/13371639
- Proyecto Kev: https://github.com/jaredpalmer/kev
- Modelo precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

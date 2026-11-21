# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es una especialización del modelo base Qwen3-0.6B de Alibaba Qwen, publicada por el usuario eduardoworrel. No se trata de un modelo de propósito general, sino de un artefacto orientado a tareas de decisión y clasificación sobre tres conjuntos de datos concretos: ContractNLI (inferencia de lenguaje natural sobre contratos), CLINC150 (clasificación de intenciones en diálogo) y SIB-200 (clasificación de temas multilingüe). El autor lo distribuye en formato ONNX cuantizado a int4, con un diseño pensado para ejecutarse íntegramente en el navegador mediante Transformers.js y WebGPU.

La relevancia de esta ficha radica en su enfoque: demuestra un patrón de despliegue de modelos pequeños (0,6 mil millones de parámetros) en el cliente, sin servidor, con pesos int4 y cabezas de clasificación entrenadas específicamente para cada tarea. El modelo base Qwen3-0.6B aporta la arquitectura transformer densa y el tokenizador, mientras que las cabezas de decisión se distribuyen como ficheros separados (`heads/`) que deben aplicarse con la librería `s1s2` del propio autor.

El modelo se publica bajo licencia CC BY-SA 4.0, condicionada por la inclusión de SIB-200 en los datos de entrenamiento. El repositorio ocupa 0,4 GB e incluye los grafos ONNX, las cabezas, los manifiestos de tareas y la plantilla de chat. Está pensado para aplicaciones web que ya usan transformers.js y necesitan clasificación ligera en el dispositivo, no para generación de texto generalista de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B), exportado a ONNX con cabezas de clasificación adicionales |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (ONNX, `onnx/model_q4.onnx`) |
| Idiomas soportados | en, pt (segun metadatos y manifiestos SIB-200 en ingles y portugues) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int4), cabezas en ficheros separados, plantilla de chat en `.jinja` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Sobre esa base, el autor ha añadido cabezas de decisión específicas para tres tareas: inferencia de lenguaje natural sobre contratos (ContractNLI), clasificación de intenciones (CLINC150) y clasificación de temas multilingüe (SIB-200). Las cabezas se aplican sobre los estados ocultos en posiciones de lectura concretas y se distribuyen como ficheros independientes en el directorio `heads/`, de modo que transformers.js por sí solo no puede leerlas: requieren la librería `s1s2` del autor.

El proceso de entrenamiento de las cabezas no se detalla en la información disponible (número de tokens, composición exacta del dataset, uso de RLHF/DPO). Lo que sí se documenta es la procedencia de los datos: ContractNLI (CC BY 4.0), CLINC150 (CC BY 3.0) y SIB-200 (CC BY-SA 4.0), este último el que impone la licencia ShareAlike al conjunto. La exportación a ONNX introduce cambios de grafo respecto a la build de referencia en ONNX Runtime GenAI: la dimensión de cabeza de la caché KV queda fijada en el grafo, las filas de tokens se leen de la tabla int4 con operadores ONNX estándar en lugar de `com.microsoft GatherBlockQuantized`, y `lm_head` se divide en tres partes a lo largo del vocabulario para que el CPU del navegador quepa en memoria wasm32. Los pesos int4 son idénticos byte a byte a los de la build GenAI.

## Capacidades

- Clasificación de decisión sobre contratos: entailment, contradicción o no mención de hipótesis (ContractNLI).
- Clasificación de intenciones en diálogo conversacional (CLINC150).
- Clasificación de temas multilingüe en inglés y portugués (SIB-200).
- Generación de texto auxiliar: el mismo modelo puede generar explicaciones de dos frases sobre una decisión tomada (`s.generate`), reutilizando los mismos pesos.
- Salida estructurada con `choice`, `confidence` y `margin` por pregunta, lo que permite umbrales de revisión.
- Soporte de múltiples preguntas por llamada (`questions` como array o como objeto).
- Ejecución en navegador con WebGPU y en CPU vía WASM.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Revisión asistida de contratos en el navegador: una aplicación legal puede cargar el modelo en el cliente y evaluar si un contrato implica, contradice o no menciona una hipótesis concreta, mostrando `confidence` y `margin` para que el revisor humano priorice los casos dudosos. El umbral de `margin < 0.2` documentado sirve como disparador de revisión.
- Clasificación de intenciones en asistentes conversacionales: con el manifiesto `manifest.clinc.json`, el modelo etiqueta la intención del usuario en un turno de diálogo sin enviar el texto a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Enrutamiento de tickets de soporte por tema: usando `manifest.sib_en.json` o `manifest.sib_pt.json`, se clasifica el tema de un mensaje entrante en inglés o portugués antes de asignarlo a un equipo, aprovechando la inferencia local en el navegador.
- Precribado de cláusulas en herramientas de gestión documental: la misma build permite procesar lotes de cláusulas contractuales con preguntas parametrizadas, generando una primera pasada que el equipo jurídico revisa después.
- Demos y prototipos sin backend: al ejecutarse con WebGPU (0,14 s por decisión, 0,4 GB de memoria de página en un Apple M2 Pro según el autor) o con CPU WASM (1,3 s por decisión, 1,1 GB), se pueden construir demos interactivas que no requieren infraestructura de servidor.
- Explicabilidad ligera en producción: cuando `margin` cae por debajo del umbral, la llamada a `s.generate` produce una justificación en dos frases con los mismos pesos, útil para registrar el motivo de la decisión junto a la etiqueta.
- Filtrado previo en pipelines de datos: la clasificación multilingüe (en/pt) permite etiquetar grandes volúmenes de texto en el cliente antes de enviarlos a un modelo mayor, reduciendo coste y latencia de red.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí documenta métricas de paridad y rendimiento de la build:

| Metrica | Valor | Entorno |
|---|---|---|
| Paridad de estados ocultos vs. build GenAI | max abs diff 0 | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) |
| Paridad de probabilidades de cabeza vs. build GenAI | max abs diff 0 | Node CPU |
| Decisiones iguales vs. build GenAI | 20/20 | Node CPU, 20 prompts de comprobación |
| Decisiones iguales vs. build GenAI | 20/20 | Chrome 157 WebGPU, Apple M2 Pro |
| Diferencia maxima de probabilidad de cabeza en WebGPU | 0,0055 | Chrome 157, onnxruntime-web 1.31.0-dev vs. 1.31.1 |
| Latencia por decision (WebGPU) | 0,14 s | Chrome 157, Apple M2 Pro |
| Memoria de pagina (WebGPU) | 0,4 GB | Chrome 157, Apple M2 Pro (buffers GPU no contados) |
| Latencia por decision (CPU WASM) | 1,3 s | Chrome 157, Apple M2 Pro |
| Memoria de pagina (CPU WASM) | 1,1 GB (pico 2,1 GB al cargar) | Chrome 157, Apple M2 Pro |
| Acuerdo WebGPU vs. CPU | 20/20 | Chrome 157, Apple M2 Pro |
| Acuerdo `pipeline("decision")` vs. cabeza entrenada | 13/20 | Node CPU |

Nota: los 20 prompts son una comprobación del autor, no un conjunto de test. WebGPU y CPU discrepan en las mismas 3 de 20 decisiones de margen bajo en ambos formatos (numérica fp16), por lo que la comparación debe hacerse por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 0,6 B | no disponible | ONNX int4 + cabezas | CC BY-SA 4.0 | Clasificación especializada en navegador |
| Qwen3-0.6B (base) | 0,6 B | no disponible | safetensors, GGUF, ONNX | Apache 2.0 (según el modelo base) | Generación de texto generalista |
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 0,6 B | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Misma especialización, build de referencia |

La comparación con alternativas de la misma categoría (clasificadores ligeros en navegador) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las cabezas de decisión son ficheros separados (`heads/`) y transformers.js por sí solo no las lee; es necesario usar `s1s2` para obtener la decisión entrenada. `pipeline("decision")` solo coincide con la cabeza en 13 de 20 prompts de comprobación.
- El modelo está especializado en tres tareas concretas; no es un generador de texto generalista fiable más allá de las explicaciones auxiliares.
- La licencia CC BY-SA 4.0 impone condiciones ShareAlike derivadas de SIB-200; ContractNLI y CLINC150 son compatibles, pero deben conservarse sus términos. El uso comercial queda sujeto a las obligaciones de la licencia.
- Los idiomas declarados son inglés y portugués; no hay soporte documentado para castellano.
- El rendimiento en WebGPU y CPU difiere en decisiones de margen bajo (3 de 20 en la comprobación del autor), por lo que conviene comparar por dispositivo y no mezclar resultados.
- La memoria de página en CPU WASM alcanza un pico de 2,1 GB al cargar, lo que puede ser problemático en dispositivos con poca RAM.
- No se han publicado datos sobre sesgos, tasa de alucinación en la generación auxiliar ni robustez fuera de los tres datasets de entrenamiento.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse la del modelo base sin verificación.
- Los umbrales como `margin < 0.2` son ejemplos del autor y deben recalibrarse para cada caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia (GenAI int4): https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de la librería s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de transformers.js para `pipeline("decision")`: https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado en los tags: arxiv:2611.15302 (no verificado en la informacion proporcionada)

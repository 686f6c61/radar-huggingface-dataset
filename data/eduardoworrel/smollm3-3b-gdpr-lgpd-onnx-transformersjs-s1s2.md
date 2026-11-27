# eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 es una especializacion del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel. No es un modelo de proposito general, sino un clasificador de decisiones tipadas ("decision head") orientado a evaluar textos de politicas de privacidad frente a los requisitos de transparencia del RGPD europeo y de la LGPD brasilena. El modelo combina los pesos cuantizados a int4 del SmolLM3-3B con cabezas de decision entrenadas especificamente para responder preguntas de si/no sobre el contenido de una clausula.

La arquitectura sigue el esquema "S1S2" (System 1 / System 2): una primera pasada rapida y determinista (System 1) produce una decision con probabilidad y margen, y una segunda fase generativa opcional (System 2) explica o revisa la decision cuando el margen de confianza es bajo. El modelo se distribuye en formato ONNX int4 y con el layout de Transformers.js (`config.json` + `onnx/model_q4.onnx`), pensado para ejecutarse en el navegador via WebGPU o WASM, sin necesidad de servidor.

La relevancia actual es doble: por un lado, demuestra un caso de uso concreto de modelos pequenos (3B) especializados mediante cabezas ligeras para tareas de cumplimiento normativo; por otro, valida la viabilidad de inferencia en navegador con cuantizacion int4 y paridad numerica respecto a la build de referencia en ONNX Runtime GenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de decision adicionales (S1S2) |
| Parametros totales | 3B (modelo base); cabezas de decision no cuantificadas en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (ONNX, `model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (int4); cabezas en archivos separados (`heads/`); manifiestos JSON (`manifest.json`, `manifest.pt.json`); `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B (Hugging Face, Apache-2.0), un transformer decoder-only de 3B parametros. Sobre el se anaden cabezas de decision (archivos en `heads/`) que se aplican sobre los hidden states en posiciones de lectura concretas, y que producen una distribucion softmax sobre opciones discretas (por ejemplo, "Yes"/"No"). El flujo S1S2 separa una decision rapida de una fase generativa de explicacion o revision, activada cuando el margen de confianza cae por debajo de un umbral configurable.

Los datos de entrenamiento combinan tres fuentes: GDPR-Transparency-200 (GPL-3.0), el corpus Claudinha para LGPD (CC BY 4.0) y datos sinteticos Kev (legacy_policy y compositional, generados con codigo Apache-2.0). La receta de entrenamiento de la cabeza de decision proviene de Kev (Apache-2.0) y la idea del split System 1 / System 2 y la puerta por margen provienen de CT0 (Alias Robotics). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO sobre el modelo base.

La innovacion tecnica principal es la paridad numerica entre la build de referencia (ONNX Runtime GenAI) y esta build de Transformers.js: segun el autor, los hidden states y las probabilidades de cabeza son identicos bit a bit en 20 prompts de comprobacion en CPU (Node, onnxruntime-node 1.30.0, transformers.js 4.3.1), y las decisiones coinciden 20/20 tambien en WebGPU (Chrome 157, Apple M2 Pro). Para lograr que el grafo funcione en navegador, se sustituye `com.microsoft GatherBlockQuantized` por operaciones ONNX estandar, se fija la dimension de cabeza del KV cache y se divide `lm_head` en cuatro partes a lo largo del vocabulario para caber en memoria wasm32.

## Capacidades

- Clasificacion de decisiones tipadas (choice, si/no) sobre fragmentos de politicas de privacidad, con probabilidad y margen por respuesta.
- Generacion de texto explicativo (fase System 2) usando los mismos pesos, para justificar una decision.
- Deteccion de baja confianza mediante el margen de la distribucion softmax, con derivacion a revision.
- Soporte de multi-turno conversacional a traves de `chat_template.jinja`.
- Ejecucion en navegador via Transformers.js con WebGPU o WASM (CPU).
- Soporte bilingue: ingles y portugues (manifiestos separados `manifest.json` y `manifest.pt.json`).
- Integracion con el ecosistema `@s1s2/web` y con el pipeline `decision` de Transformers.js (PR #1943, en borrador).
- No se documenta soporte de tool calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria automatizada de politicas de privacidad: dado un fragmento de politica, el modelo responde preguntas de transparencia del RGPD (por ejemplo, si se identifican los destinatarios de los datos) con una probabilidad asociada, lo que permite priorizar revisiones humanas.
- Cumplimiento LGPD en portugues: usando `manifest.pt.json`, se aplican las mismas cabezas a textos en portugues para verificar requisitos de la ley brasilena, con el mismo flujo de decision y margen.
- Revision asistida en bufetes y equipos de privacidad: la fase System 2 genera una explicacion en dos frases de la decision tomada, util para documentar el razonamiento ante un DPO o un regulador.
- Triaje en pipelines de ingestion documental: el modelo procesa clausulas una a una en el navegador o en Node, marcando aquellas con margen bajo (< 0.2 en el ejemplo del autor) para revision manual, sin enviar el texto a un servidor.
- Herramientas de navegador para el usuario final: al ejecutarse en WebGPU (0,45 s por decision en M2 Pro) o WASM (6,8 s por decision), permite analizar terminos y condiciones localmente, sin salida de datos.
- Investigacion en sistemas duales: el par S1/S2 y la puerta por margen sirven como banco de pruebas para estudiar la calibracion de clasificadores pequenos frente a la generacion de explicaciones.
- Prototipado rapido con Transformers.js: integrable en aplicaciones web existentes que ya usan `@huggingface/transformers`, con el pipeline `decision` o con el paquete `@s1s2/web`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta comprobaciones de paridad y latencia:

| Metrica | Valor |
|---|---|
| Paridad de hidden states (Node CPU, 20 prompts) | max abs diff 0 |
| Paridad de probabilidades de cabeza (Node CPU) | max abs diff 0 |
| Paridad de decisiones (Node CPU, 20 prompts) | 20/20 iguales |
| Paridad de decisiones (Chrome 157 WebGPU, M2 Pro) | 20/20 iguales |
| Latencia por decision (WebGPU, M2 Pro) | 0,45 s |
| Latencia por decision (WASM CPU, M2 Pro) | 6,8 s |
| Memoria de pagina (WebGPU) | 0,5 GB (sin contar buffers GPU) |
| Memoria de pagina (WASM) | 2,8 GB (pico 4,0 GB durante carga) |
| Ejemplo de decision medida (Node CPU) | "Yes", confianza 0,97, margen 0,94 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso int4 del modelo base de 3B ocupa aproximadamente 1,8 GB (tamano del repo), lo que orienta el orden de magnitud.
- GPU recomendadas: no se especifican; el autor valida en Apple M2 Pro (GPU integrada) via WebGPU.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en navegador con WebGPU o incluso en CPU via WASM; no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: Transformers.js (WebGPU o WASM), `@s1s2/web`, ONNX Runtime (build de referencia en ONNX Runtime GenAI, en el repo hermano), Node con onnxruntime-node.
- Latencia y throughput: 0,45 s por decision en WebGPU (M2 Pro) y 6,8 s por decision en WASM; no se reporta throughput agregado ni latencia en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 3B | no disponible | ONNX int4 | GPL-3.0 | Clasificador de privacidad con cabezas S1S2 |
| SmolLM3-3B (base) | 3B | no disponible | safetensors | Apache-2.0 | LLM de proposito general |
| SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2 (repo hermano) | 3B | no disponible | ONNX int4 (GenAI) | GPL-3.0 | Misma especializacion, runtime ONNX Runtime GenAI |
| alias3-web (Alias Robotics) | no disponible | no disponible | no disponible | no disponible | Precursor del enfoque en navegador |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las cabezas de decision son archivos separados (`heads/`) que Transformers.js por si solo no lee; requieren el codigo de `s1s2` o el pipeline `decision` (PR #1943, aun en borrador).
- El modelo solo cubre ingles y portugues; no se documenta soporte de castellano ni de otras lenguas.
- La licencia es GPL-3.0 por herencia de los datos GDPR-Transparency-200, lo que impone obligaciones de copyleft para uso comercial y distribucion; conviene revisar la compatibilidad con el producto.
- El margen de confianza no es una garantia de correccion: el umbral 0,2 del ejemplo es ilustrativo y el autor recomienda medirlo en cada caso.
- La validacion de paridad se hizo sobre 20 prompts escritos para la comprobacion, no sobre un conjunto de test independiente; no hay evidencia publica de precision en produccion.
- El modelo no es un asesor legal: clasifica fragmentos frente a preguntas concretas y puede fallar en textos ambiguos, muy largos o con estructura atipica.
- Riesgo de alucinacion en la fase generativa (System 2): las explicaciones se producen con los mismos pesos y deben tratarse como texto auxiliar, no como fuente normativa.
- En WASM el consumo de memoria es alto (pico de 4,0 GB durante la carga) y la latencia por decision es de varios segundos, lo que limita su uso interactivo en equipos modestos.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Repo hermano (ONNX Runtime GenAI, build de referencia): https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Codigo s1s2: https://github.com/eduardoworrel/s1s2
- Implementacion de `decide` en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Transformers.js: https://github.com/huggingface/transformers.js
- PR del pipeline `decision` en Transformers.js: https://github.com/huggingface/transformers.js/pull/1943
- GDPR-Transparency-200 (privacy-policy-annotator): https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (receta de cabeza de decision): https://github.com/jaredpalmer/kev
- alias3-web (precursor): https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

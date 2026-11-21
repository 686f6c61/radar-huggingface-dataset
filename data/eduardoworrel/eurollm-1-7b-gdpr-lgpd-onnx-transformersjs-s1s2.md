# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

EuroLLM-1.7B GDPR + LGPD privacy specialist es una adaptación especializada del modelo base utter-project/EuroLLM-1.7B-Instruct, publicada por el usuario eduardoworrel. El modelo ha sido afinado para una tarea concreta: clasificar pasajes de políticas de privacidad según criterios de cumplimiento del RGPD europeo y de la LGPD brasileña, respondiendo a preguntas estructuradas de tipo elección múltiple sobre el contenido de cada fragmento. No es un modelo de propósito general, sino un clasificador especializado con una cabeza de decisión entrenada sobre el modelo base.

La arquitectura subyacente es un transformer decoder-only de 1.700 millones de parámetros (EuroLLM-1.7B-Instruct), cuantizado a int4 y exportado a ONNX para su ejecución en el navegador mediante Transformers.js y WebGPU. El repositorio incluye además cabezas de decisión separadas (en `heads/`) que se aplican mediante la librería propietaria s1s2, y un mecanismo de "System 1 / System 2" que permite una decisión rápida de una pasada y, si el margen de confianza es bajo, una generación explicativa con los mismos pesos.

Su relevancia radica en que demuestra un patrón de despliegue de modelos especializados de privacidad directamente en el cliente (navegador), sin enviar datos a servidores externos, lo que encaja con el propio objeto de análisis del modelo. La licencia es GPL-3.0 por herencia de los datos de entrenamiento (GDPR-Transparency-200), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base EuroLLM-1.7B-Instruct), con cabezas de decisión adicionales |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, `model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (int4), con cabezas en `heads/` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct, un transformer decoder-only del proyecto UTTER (licencia Apache-2.0), cuantizado a int4 y exportado a ONNX. Sobre esa base se añaden cabezas de decisión entrenadas para tareas de clasificación de políticas de privacidad, aplicadas por la librería s1s2 sobre los estados ocultos en posiciones de lectura concretas. La receta de entrenamiento de la cabeza de puntero y del pipeline procede de Kev (Apache-2.0), y la idea de separación System 1 / System 2 con umbral de margen proviene de CT0 (Alias Robotics).

Los datos de entrenamiento combinan tres fuentes: GDPR-Transparency-200 (GPL-3.0, solo identificadores de ítems y scripts, sin redistribuir texto de políticas), el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sintéticos Kev (legacy_policy y composicionales). No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO sobre el modelo base. La innovación técnica destacable es el esquema de dos velocidades: una decisión de una sola pasada con probabilidad y margen, y una generación explicativa opcional con los mismos pesos cuando el margen es bajo.

## Capacidades

- Clasificación de pasajes de políticas de privacidad mediante preguntas de elección múltiple (por ejemplo, si un fragmento aborda los destinatarios de los datos).
- Decisión con probabilidad y margen de confianza por respuesta, útil para umbrales de revisión.
- Generación de texto explicativo sobre la decisión tomada (misma base instruct).
- Soporte de preguntas y etiquetas definidas en el manifiesto (`lab`), entrenadas específicamente para esas formulaciones.
- Ejecución en navegador vía Transformers.js con WebGPU (0,15 s por decisión) y CPU/WASM (2,7 s por decisión).
- Idiomas inglés y portugués.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: una herramienta web puede cargar el modelo y clasificar fragmentos de una política sin enviar el texto a un servidor, lo que reduce la exposición de datos sensibles durante la propia auditoría.
- Cumplimiento del RGPD en portales corporativos: integración en un formulario o panel interno que marque automáticamente si una cláusula cubre los destinatarios de los datos, con margen de confianza para derivar casos dudosos a revisión humana.
- Cumplimiento de la LGPD en portugués: el manifiesto `manifest.pt.json` permite aplicar las mismas preguntas a textos en portugués, útil para equipos de privacidad en Brasil.
- Revisión asistida con explicación: cuando el margen es inferior al umbral configurado, el modelo genera dos frases justificando la decisión, lo que facilita la revisión por parte de un DPO o un abogado.
- Extensión de navegador para privacidad: dado su tamaño (repo de 1,3 GB) y su ejecución en WebGPU, puede empaquetarse en una extensión que analice políticas al visitar un sitio.
- Investigación en clasificación de textos legales: sirve como referencia reproducible de un pipeline ONNX int4 con cabezas de decisión y paridad verificada entre entornos (Node CPU y Chrome WebGPU).
- Prototipado de clasificadores especializados: el patrón s1s2 (decisión rápida más generación de respaldo) puede reutilizarse para otras tareas de clasificación con umbral de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta verificaciones de paridad y latencia:

| Prueba | Entorno | Resultado |
|---|---|---|
| Paridad con build GenAI (20 prompts, estados ocultos) | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | max \|diff\| 0 |
| Paridad de probabilidades de cabeza | Node CPU | max \|diff\| 0 |
| Paridad de decisiones | Node CPU | 20/20 iguales |
| Paridad de decisiones en WebGPU | Chrome 157, Apple M2 Pro | 20/20 iguales |
| Latencia por decisión | WebGPU (Chrome 157, M2 Pro) | 0,15 s |
| Latencia por decisión | CPU/WASM (Chrome 157, M2 Pro) | 2,7 s |
| Memoria de página | WebGPU | 0,2 GB (sin contar buffers GPU) |
| Memoria de página | CPU/WASM | 2,9 GB (pico de pestaña 4,1 GB al cargar) |
| Concordancia `pipeline("decision")` vs cabeza entrenada | Node CPU | 11/20 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,3 GB en int4.
- GPU recomendadas: no se especifican modelos concretos; la model card valida WebGPU en Apple M2 Pro.
- Cabe en GPU de consumo: sí, en principio, dado el tamaño int4 de 1,7B; no se detallan modelos concretos (RTX 4090, etc.).
- Despliegue: Transformers.js (`@huggingface/transformers`), librería s1s2 (`@s1s2/web`), ONNX Runtime (onnxruntime-node 1.30.0), navegador con WebGPU o WASM. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,15 s por decisión en WebGPU y 2,7 s en CPU/WASM sobre M2 Pro (Chrome 157); no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-1.7B GDPR+LGPD (este) | 1,7B (int4 ONNX) | no disponible | Clasificación de privacidad RGPD/LGPD | GPL-3.0 | Hugging Face, Transformers.js, s1s2 |
| utter-project/EuroLLM-1.7B-Instruct | 1,7B | no disponible | Instrucciones generales | Apache-2.0 | Hugging Face |
| EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 1,7B (int4 ONNX) | no disponible | Igual, build de referencia GenAI | GPL-3.0 | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor de clasificación en navegador | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las cabezas de decisión son archivos separados en `heads/` y Transformers.js por sí solo no las lee; sin s1s2 la clasificación no funciona correctamente.
- `pipeline("decision")` lee logits de etiquetas y no la cabeza entrenada: solo coincide en 11 de 20 prompts de control, por lo que no debe usarse como sustituto.
- El modelo está entrenado para las formulaciones y opciones del manifiesto (`lab`); usar otras preguntas o etiquetas degrada la fiabilidad.
- Solo soporta inglés y portugués; no hay soporte documentado de otros idiomas.
- El umbral de margen (0,2 en el ejemplo) es orientativo y debe calibrarse por caso; márgenes bajos indican decisiones poco fiables.
- Licencia GPL-3.0 por herencia de los datos GDPR-Transparency-200: restringe el uso comercial propietario y obliga a mantener la licencia en obras derivadas.
- La dimensión de cabeza del KV cache está fijada en el grafo por requisito de Transformers.js, lo que limita variaciones de configuración.
- Riesgo de alucinación en la fase generativa (System 2): las explicaciones son texto generado y no deben tomarse como fundamento legal.
- La model card no reporta sesgos específicos, evaluación de robustez ni conjuntos de test formales (los 20 prompts son de control, no un test set).
- El modelo no sustituye asesoramiento legal; es una herramienta de clasificación asistida.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Código de decisión s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Transformers.js: https://github.com/huggingface/transformers.js
- PR de Transformers.js para `pipeline("decision")`: https://github.com/huggingface/transformers.js/pull/1943
- GDPR-Transparency-200 (privacy-policy-annotator): https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (receta de cabeza y entrenamiento): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

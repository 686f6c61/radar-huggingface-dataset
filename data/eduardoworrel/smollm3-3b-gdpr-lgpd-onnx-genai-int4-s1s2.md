# eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B GDPR + LGPD es una especialización del modelo base SmolLM3-3B de Hugging Face, desarrollada por el usuario eduardoworrel, orientada a la clasificación de transparencia en políticas de privacidad. El modelo responde preguntas binarias (Sí/No) sobre si un pasaje concreto de una política de privacidad aborda un requisito de transparencia específico, tanto para el RGPD europeo (en inglés) como para la LGPD brasileña (en portugués). La innovación principal es su arquitectura de doble sistema (System 1 / System 2): una cabeza de decisión ("pointer head") realiza la clasificación en un único forward pass, devolviendo una elección tipada, una probabilidad y un margen, y solo cuando el margen es bajo se escala a generación de texto completa.

El modelo se distribuye en formato ONNX int4 optimizado para onnxruntime-genai y WebGPU, lo que permite ejecutarlo íntegramente en el navegador con la librería s1s2. El repositorio ocupa 1,8 GB y está pensado para despliegues ligeros de verificación de cumplimiento normativo sin infraestructura de servidor.

Es relevante porque combina un modelo de lenguaje de 3B parámetros con una tarea de clasificación jurídica muy concreta, cuantizada a 4 bits y ejecutable en cliente, lo que reduce costes de inferencia y facilita el procesamiento local de documentos potencialmente sensibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabeza de decisión binaria añadida (pointer head) y esquema dual System 1 / System 2 |
| Parámetros totales | 3B (modelo base SmolLM3-3B); parámetros de la cabeza de decisión: no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantización | int4 (ONNX, onnxruntime-genai); versión fp32 PyTorch disponible en el adaptador LoRA asociado |
| Idiomas soportados | inglés (GDPR), portugués (LGPD) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai, grafo int4 para WebGPU); adaptador PyTorch en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3B parámetros, y le añade una cabeza de clasificación ("pointer head") entrenada para responder preguntas binarias tipadas sobre pasajes de políticas de privacidad. La inferencia se estructura en dos sistemas: el System 1 ejecuta un único forward pass que produce una decisión tipada con probabilidad y margen; el System 2 se activa opcionalmente, a partir del mismo prefill, para generar texto justificativo cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios. Esta separación sigue la idea del sistema dual de CT0 (Alias Robotics) y la receta de entrenamiento de Kev (Apache-2.0).

El entrenamiento se realizó sobre datos de GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha de políticas LGPD (portugués, CC BY 4.0) y datos sintéticos Kev (legacy_policy, composicional). La variante "Kev-faithful" se entrenó 2 épocas con la regla de learning rate de Kev y merge en fp32; existe otra variante "joint" (1 época, merge bf16). El grafo int4 de este repositorio se construyó con el mismo builder y ajustes que las demás builds. CCPA nunca se usó en entrenamiento; los resultados sobre CCPA son solo de evaluación.

## Capacidades

- Clasificación binaria tipada de pasajes de políticas de privacidad frente a requisitos de transparencia (RGPD en inglés, LGPD en portugués).
- Salida con elección, probabilidad y margen en un único forward pass (System 1).
- Escalado opcional a generación de texto (System 2) desde el mismo prefill cuando el margen es bajo, conservando la respuesta tipada.
- Generación de texto conversacional y de citas justificativas ("Quote the sentence that shows it").
- Ejecución en navegador mediante WebGPU (Chrome) y fallback a CPU vía onnxruntime-web WASM.
- Soporte de umbrales calibrados por cuantil sobre datos de desarrollo propios (`thresholdFromQuantile`).
- Idiomas: inglés y portugués, con palabras de opción exactas (" Yes"/" No" en inglés; " Sim"/" Não" en portugués).
- No soporta tool calling, agentes multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Verificación de transparencia en políticas de privacidad: dado un pasaje y un requisito (por ejemplo, destinatarios de los datos), el modelo responde Sí/No con probabilidad y margen, útil para auditorías internas de cumplimiento RGPD.
- Auditoría LGPD en portugués: procesamiento de políticas de empresas brasileñas con el manifiesto `manifest.pt.json` y las opciones " Sim"/" Não".
- Revisión asistida en el navegador: al ejecutarse con WebGPU, permite a un analista jurídico procesar documentos localmente sin enviar texto sensible a un servidor.
- Triaje automatizado de cláusulas: clasificación masiva de pasajes para priorizar qué secciones requieren revisión humana, usando el margen como señal de incertidumbre.
- Generación de justificaciones bajo demanda: cuando el margen es bajo, el System 2 genera una cita textual que evidencia la decisión, útil para informes de auditoría.
- Integración en pipelines de cumplimiento normativo: el formato ONNX int4 permite desplegar el modelo en entornos con recursos limitados o en el propio cliente, reduciendo costes de inferencia frente a un LLM completo.
- Formación y demostraciones: ejemplo práctico de arquitectura dual System 1/System 2 con decisiones tipadas para investigadores que estudien clasificación eficiente con LLM.

## Benchmarks y rendimiento

Resultados preliminares publicados en la model card. La precisión balanceada de la cabeza de decisión se midió sobre el split de desarrollo (el conjunto de test reservado no se ejecutó para esta variante). Los pesos fp32 PyTorch corresponden a la variante Kev-faithful (2 épocas, regla de learning rate de Kev, merge fp32).

| Conjunto | Precisión balanceada (%) | Notas |
|---|---|---|
| GDPR (inglés), dev, n = 508 | 87,8 | Pesos fp32 PyTorch |
| LGPD (portugués), dev, n = 604 | 82,1 | Pesos fp32 PyTorch |
| GDPR, dev (int4, navegador) | 84,6 | Preliminar; 5,1 % de decisiones distintas vs fp32 |
| LGPD, dev (int4, navegador) | 80,6 | Preliminar; 4,8 % de decisiones distintas vs fp32 |
| CCPA, dev (int4, navegador) | 79,0 | Preliminar; 6,2 % de decisiones distintas vs fp32 |
| GDPR, test (int4 joint, navegador) | 83,7 | Conjunto de test reservado |
| LGPD, test (int4 joint, navegador) | 79,8 | Conjunto de test reservado |
| CCPA, test (int4 joint, navegador) | 75,5 | Conjunto de test reservado |
| GDPR, test (variante joint, bf16) | 83,9 | 1 época, merge bf16 |
| LGPD, test (variante joint, bf16) | 80,7 | 1 época, merge bf16 |
| CCPA, test (variante joint, bf16) | 74,0 | 1 época, merge bf16 |

Fidelidad respecto al modelo fp32 PyTorch: sobre n = 1.112 preguntas de desarrollo (GDPR y LGPD), en Chrome con WebGPU (Apple M2 Pro), la decisión coincide en el 95,1 % de las preguntas con lectura de cabeza (intervalo del 95 %: 93,6 a 96,2) y en el 95,3 % con lectura de logits. Solo ítems de desarrollo, sin conjunto de test.

## Requisitos de hardware

- Descarga del grafo int4 ONNX: 1,75 GB (repositorio de 1,8 GB).
- Ejecución en navegador con WebGPU (Chrome); medido en Apple M2 Pro.
- Fallback a CPU del navegador mediante onnxruntime-web WASM sin WebGPU; en el grafo equivalente de otro modelo se midió 16,5× más lento que WebGPU, unos 50 ms por token de prompt (Chrome en Apple M2 Pro); las decisiones en CPU no se midieron para esta tarea.
- No se especifican GPUs dedicadas (A100, H100, RTX 4090) en la información disponible; el diseño apunta a ejecución en cliente.
- Opciones de despliegue: librería s1s2 (≥ 0.1.1) en navegador con WebGPU o WASM; onnxruntime-genai 0.19.
- Latencia y throughput: no disponible salvo la referencia de 50 ms por token de prompt en CPU para el grafo equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM3-3B GDPR+LGPD (este) | 3B | no disponible | Clasificación de transparencia GDPR/LGPD + generación | GPL-3.0 | ONNX int4 |
| SmolLM3-3B (base) | 3B | no disponible | Generación de texto general | Apache-2.0 | safetensors, GGUF, etc. |
| SmolLM3-3B-ContractNLI-CLINC-SIB | 3B | no disponible | Clasificación de cláusulas contractuales | no disponible | ONNX |
| alias3-web (Alias Robotics) | no disponible | no disponible | Sistema dual en navegador (precursor) | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito de transparencia, no si una política cumple la normativa; no constituye asesoramiento jurídico.
- Entrenado solo con políticas GDPR (inglés) y LGPD (portugués); CCPA nunca se usó en entrenamiento y su rendimiento es inferior (75,5 % en test con la variante joint int4).
- Las palabras de opción están fijadas (" Yes"/" No" en inglés; " Sim"/" Não" en portugués); traducciones u otras palabras cambian el prompt y el modelo no funcionará.
- Licencia GPL-3.0 por los datos GDPR-Transparency-200; restringe el uso comercial propietario y obliga a mantener la atribución de los datos Claudinha (CC BY 4.0), Kev y el modelo base (Apache-2.0).
- Riesgo de alucinación en el System 2 al generar citas justificativas; la decisión tipada del System 1 es más fiable que el texto generado.
- Los resultados int4 en navegador son preliminares y medidos solo en desarrollo para esta variante; el conjunto de test no se ejecutó para ella.
- La ejecución en CPU del navegador es sustancialmente más lenta (referencia de 16,5× frente a WebGPU) y no se midió la precisión de decisiones en ese modo para esta tarea.
- Idiomas limitados a inglés y portugués; no cubre castellano ni otras lenguas.
- No soporta tool calling, agentes multi-paso, visión ni audio.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Datos GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

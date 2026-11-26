# eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

Salamandra-2B GDPR + LGPD es una especialización del modelo base BSC-LT/salamandra-2b-instruct (2 000 millones de parámetros, desarrollado por el Barcelona Supercomputing Center) orientada a la clasificación de pasajes de políticas de privacidad frente a requisitos de transparencia del RGPD (en inglés) y de la LGPD brasileña (en portugués). El modelo no genera texto libre para responder: incorpora una cabeza de decisión ("pointer head") que, dado un pasaje y una pregunta de tipo elección, devuelve en un único forward pass una respuesta tipada Yes/No (o " Sim"/" Não") acompañada de probabilidad y margen. Sobre esa decisión se puede activar, solo cuando el margen es bajo, una segunda fase generativa ("System 2") que cita la frase justificativa reutilizando el mismo prefill.

El autor es eduardoworrel y la build publicada es una cuantización int4 en formato ONNX para onnxruntime-genai 0.19, pensada para ejecutarse íntegramente en el navegador mediante WebGPU con la librería s1s2 (descarga de 2,03 GB). La arquitectura subyacente es la del modelo Salamandra-2B (transformer decoder-only), sobre la que se ha aplicado un adaptador LoRA y cabezas entrenadas para la tarea de transparencia. La propuesta encaja en el patrón "dual-system": razonamiento rápido y barato (System 1) con escalado selectivo a generación (System 2) cuando la confianza es insuficiente.

Es relevante ahora porque demuestra un caso de uso de cumplimiento normativo (RGPD/LGPD) desplegable en cliente, sin servidor, con cuantización agresiva y evaluación de fidelidad frente a los pesos fp32. La licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Salamandra-2B) con cabeza de decisión tipo pointer head y adaptador LoRA; pipeline dual System 1 / System 2 |
| Parametros totales | 2 000 millones (modelo base); no se detalla el recuento exacto de la cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX para onnxruntime-genai 0.19, WebGPU); existen pesos fp32 y bf16 en la variante PyTorch |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai); adaptador y cabezas en PyTorch en el repo LoRA; variante alternativa en formato Transformers.js |

## Arquitectura y entrenamiento

El modelo parte de BSC-LT/salamandra-2b-instruct, un transformer decoder-only de 2B parámetros del BSC. Sobre él se entrena un adaptador LoRA y una cabeza de decisión que lee las representaciones del modelo para emitir una elección entre dos opciones fijas (" Yes"/" No" en inglés, " Sim"/" Não" en portugués), con probabilidad y margen asociados. El mecanismo System 1 resuelve la pregunta en un solo forward pass; el System 2 se invoca opcionalmente cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios, y reutiliza el prefill para generar una justificación textual sin repetir el coste de codificación.

Los datos de entrenamiento combinan GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha de políticas LGPD (portugués, CC BY 4.0) y datos sintéticos Kev (legacy_policy, compositional). La receta reportada usa 2 épocas con la regla de learning rate de Kev y merge en fp32 para la variante "Kev-faithful"; existe una variante "joint" con 1 época y merge en bf16. CCPA (inglés) nunca se usa en entrenamiento y sirve como evaluación de transferencia zero-shot. La innovación destacable es la separación explícita entre decisión tipada barata y generación condicionada, con compuerta de margen y evaluación de fidelidad frente a los pesos fp32.

## Capacidades

- Clasificación binaria de pasajes de política de privacidad frente a requisitos de transparencia (RGPD en inglés, LGPD en portugués) con salida tipada Yes/No, probabilidad y margen.
- Decisión en un único forward pass (System 1) con coste de inferencia mínimo.
- Generación de justificación textual condicionada (System 2) reutilizando el prefill de la decisión.
- Escalado selectivo mediante umbral de margen calibrado sobre datos propios del usuario.
- Transferencia zero-shot a CCPA (inglés) sin entrenamiento específico.
- Capacidades heredadas del modelo base: generación de texto conversacional en inglés y portugués.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad nativa; el patrón dual-system implementa un razonamiento de dos etapas.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Auditoría de políticas de privacidad a escala: dado un corpus de políticas y un conjunto de requisitos de transparencia (destinatarios, base legal, plazos de conservación), el modelo responde Yes/No por requisito en un solo forward pass, lo que permite procesar miles de pasajes con coste bajo y umbral de confianza configurable.
- Revisión previa al lanzamiento de productos: integrado en un pipeline de CI documental, marca qué secciones de una política no abordan un requisito y escala a System 2 solo en los casos de margen bajo para obtener la cita textual que justifica la decisión.
- Asistencia a equipos de compliance: el modelo señala si un pasaje "aborda" un requisito (no si cumple), sirviendo como triaje que prioriza la revisión humana y reduce el volumen de lectura.
- Despliegue en navegador para clientes: gracias a la build ONNX int4 con WebGPU (2,03 GB), la clasificación puede ejecutarse en el dispositivo del usuario sin enviar texto de políticas a un servidor, lo que encaja con requisitos de minimización de datos.
- Investigación en evaluación de fidelidad de cuantización: el repo incluye registros de fidelidad (93,8 % de coincidencia con la cabeza en fp32 sobre 1 112 preguntas de desarrollo) que sirven de base para estudiar el impacto de int4 en tareas de decisión.
- Transferencia a marcos regulatorios afines: la evaluación zero-shot sobre CCPA (75,0 % de balanced accuracy en fp32) permite prototipar clasificadores para otras normativas antes de disponer de datos etiquetados propios, calibrando después el umbral con un conjunto local.

## Benchmarks y rendimiento

Resultados publicados en la model card. Balanced accuracy de la cabeza de decisión sobre conjuntos de test retenidos (pesos fp32 PyTorch, variante Kev-faithful):

| Conjunto | Balanced accuracy (%) | n |
|---|---|---|
| GDPR (inglés) | 81,9 | 558 |
| LGPD (portugués) | 78,2 | 802 |
| CCPA (inglés, zero-shot) | 75,0 | 420 |

Build int4 medida en navegador (Chrome WebGPU, Mac M2 Pro), preliminar, sobre split de desarrollo:

| Conjunto | Balanced accuracy (%) | Decisiones distintas vs fp32 (%) |
|---|---|---|
| GDPR | 81,7 | 7,9 |
| LGPD | 83,4 | 4,8 |
| CCPA | 73,1 | 5,5 |

Variante "joint" int4 en navegador (test retenido): GDPR 57,0 / LGPD 64,0 / CCPA 63,1. Variante "joint" con merge bf16: GDPR 59,5 / LGPD 67,1 / CCPA 65,0.

Fidelidad frente al modelo fp32 (1 112 preguntas de desarrollo, Chrome WebGPU, M2 Pro): coincidencia del 93,8 % con lectura por cabeza (IC 95 %: 92,2–95,1) y 88,5 % con lectura por logits.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Descarga de la build int4 ONNX: 2,03 GB (tamaño del repo: 2,1 GB).
- Inferencia en navegador mediante WebGPU; validado en Chrome sobre Apple M2 Pro.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos int4, el requisito de memoria gráfica ronda los 2 GB más overhead del runtime.
- GPU de consumo: cabe en GPUs integradas y discretas modernas con soporte WebGPU; no se especifican modelos concretos.
- GPU de datacenter (A100, H100): compatibles por capacidad, pero no se reportan cifras de throughput para ellas.
- Opciones de despliegue: onnxruntime-genai 0.19 con WebGPU vía la librería s1s2; variante alternativa en formato Transformers.js; pesos PyTorch (LoRA y cabezas) en el repo asociado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamandra-2B GDPR+LGPD (este) | 2B (int4 ONNX) | no disponible | Clasificación de transparencia RGPD/LGPD + justificación | GPL-3.0 | Hugging Face, navegador |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | Generación de texto general (en, pt, etc.) | Apache-2.0 | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Clasificación/seguridad en navegador (precursor) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito de transparencia, no si la política cumple la normativa; no constituye asesoramiento legal.
- Entrenado sobre políticas de apps RGPD (inglés) y LGPD (portugués); CCPA nunca se usó en entrenamiento y su rendimiento es inferior.
- Las palabras de opción están fijadas (" Yes"/" No", " Sim"/" Não"); traducciones u otras variantes rompen la cabeza de decisión.
- La build int4 introduce divergencias frente a fp32 (7,9 % en GDPR, 4,8 % en LGPD, 5,5 % en CCPA en desarrollo); la variante "joint" int4 cae notablemente en test (57,0 % en GDPR).
- Los registros de fidelidad se calculan solo sobre el split de desarrollo, sin test.
- Licencia GPL-3.0 por los datos de entrenamiento GDPR-Transparency-200; condiciona el uso comercial y la redistribución.
- Riesgo de alucinación en la fase System 2 (generación de la cita justificativa), no evaluado en la información disponible.
- Idiomas limitados a inglés y portugués; sin soporte declarado de castellano.
- No se documentan sesgos específicos ni evaluaciones de robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Datos GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta y cabeza (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

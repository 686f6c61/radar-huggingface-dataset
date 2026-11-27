# eduardoworrel/S5-nano-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

S5-nano GDPR + LGPD es un especialista de clasificación de textos legales de privacidad construido sobre el modelo base maritaca-ai/S5-nano (Apache-2.0) y publicado por el usuario eduardoworrel. Dada una cláusula de una política de privacidad y un requisito de transparencia (por ejemplo, si se mencionan los destinatarios de los datos), el modelo responde con una decisión tipada Yes/No, una probabilidad y un margen, en un único forward pass. Está entrenado específicamente sobre políticas de aplicación GDPR en inglés y LGPD en portugués, y muestra transferencia zero-shot a CCPA en inglés.

La relevancia de esta ficha radica en su formato de despliegue: es una compilación ONNX int4 para onnxruntime-genai 0.19 orientada a WebGPU, lo que permite ejecutar el modelo directamente en el navegador (Chrome con WebGPU) con una descarga de 2,44 GB. Se apoya en la librería s1s2, que implementa un esquema de doble sistema: un cabezal de decisión (System 1) que responde en un solo paso y un modo generativo (System 2) que se activa solo cuando el margen de la decisión es bajo.

El modelo no emite juicios de cumplimiento normativo: determina si un pasaje aborda o no un requisito concreto de transparencia. Es, por tanto, una herramienta de extracción y señalización para pipelines de análisis de políticas de privacidad, no un asesor legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base S5-nano; el build incluye capas GatedDeltaNet, según la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, onnxruntime-genai 0.19) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai); adaptador y cabezales en PyTorch en el repo LoRA asociado |

## Arquitectura y entrenamiento

El modelo parte de maritaca-ai/S5-nano y se especializa mediante un cabezal de decisión de tipo pointer head entrenado con la receta de Kev (Apache-2.0). La variante principal, denominada Kev-faithful, se entrenó durante 2 épocas con la regla de learning rate de Kev y fusión en fp32; existe una variante alternativa "joint" (1 época, fusión en bf16) con resultados ligeramente inferiores. Los datos de entrenamiento combinan GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha de políticas LGPD (portugués, CC BY 4.0) y datos sintéticos generados por código Kev (legacy_policy y composicionales). CCPA no se usó en entrenamiento y sirve como conjunto de transferencia zero-shot.

La innovación principal es el esquema System 1 / System 2 heredado de la idea CT0 de Alias Robotics: el cabezal responde con una elección, una confianza y un margen en un solo forward pass, y el modo generativo reutiliza el mismo prefill para producir texto justificativo solo cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios. El build int4 está compilado para WebGPU y carece de kernel de CPU para sus capas GatedDeltaNet.

## Capacidades

- Clasificación binaria tipada de pasajes frente a requisitos de transparencia, con salida de elección, probabilidad y margen.
- Respuesta Yes/No en inglés y Sim/Não en portugués, con palabras de opción fijadas en el manifiesto (`manifest.en.json` y `manifest.pt.json`); traducciones u otras palabras no funcionan.
- Decisión en un único forward pass (System 1) con escalado opcional a generación (System 2) cuando el margen es bajo.
- Generación de texto justificativo a partir del mismo prefill, por ejemplo para citar la frase que sustenta la decisión.
- Transferencia zero-shot a CCPA en inglés sin entrenamiento específico.
- Ejecución en navegador mediante WebGPU con la librería s1s2.
- No soporta tool calling, agentes multi-paso ni otras modalidades (visión, audio) según la información disponible.

## Casos de uso

- Auditoría automatizada de políticas de privacidad: dado un conjunto de requisitos de transparencia (destinatarios, finalidades, retención), el modelo etiqueta cada pasaje con Yes/No y un margen, permitiendo priorizar revisiones humanas en los casos de baja confianza.
- Cumplimiento GDPR en inglés: procesamiento por lotes de políticas de aplicaciones para detectar si abordan requisitos concretos, con un cabezal entrenado sobre GDPR-Transparency-200.
- Cumplimiento LGPD en portugués: mismo flujo sobre políticas brasileñas usando el manifiesto `manifest.pt.json` y las etiquetas Sim/Não.
- Triaje con escalado selectivo: usar `thresholdFromQuantile` sobre márgenes de un conjunto de desarrollo propio para enviar solo las decisiones dudosas al modo generativo, reduciendo coste computacional.
- Herramientas de navegador para el usuario final: al ejecutarse en WebGPU con 2,44 GB de descarga, puede integrarse en una extensión o web que analice políticas sin enviar texto a un servidor.
- Investigación sobre transferencia entre regímenes: evaluar el comportamiento zero-shot en CCPA (82,9 % de balanced accuracy en fp32) frente a GDPR y LGPD para estudiar la generalización entre marcos normativos.
- Generación de justificaciones citables: cuando la decisión es positiva, el modo System 2 puede extraer la frase exacta que evidencia el requisito, útil para informes de cumplimiento.

## Benchmarks y rendimiento

Resultados sobre conjunto de test reservado, balanced accuracy del pointer head, pesos fp32 PyTorch de la variante Kev-faithful:

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 89,4 |
| LGPD (portugués), n = 802 | 83,4 |
| CCPA (inglés, zero-shot), n = 420 | 82,9 |

Build int4 medido en navegador (Chrome WebGPU, Mac M2 Pro), preliminar, split de desarrollo:

| Conjunto | Balanced accuracy (%) | Decisiones distintas vs fp32 (%) |
|---|---|---|
| GDPR | 90,4 | 3,1 |
| LGPD | 87,3 | 2,2 |
| CCPA | 82,4 | 2,6 |

Build int4 "joint" medido en navegador sobre test reservado: GDPR 87,8 / LGPD 80,8 / CCPA 81,9. Variante joint bf16: GDPR 87,1 / LGPD 80,5 / CCPA 81,2.

Fidelidad: sobre 1.112 preguntas de desarrollo de GDPR y LGPD, en Chrome con WebGPU (Apple M2 Pro) frente al modelo fp32, la decisión coincide en el 97,4 % de los casos (intervalo del 95 %: 96,3 a 98,2), tanto con lectura de cabezal como de logits. Solo ítems de desarrollo, sin test.

## Requisitos de hardware

- Descarga del build int4: 2,44 GB.
- Ejecución exclusivamente en WebGPU; no hay kernel de CPU para las capas GatedDeltaNet de este grafo.
- Probado en Chrome WebGPU sobre Apple M2 Pro; no se documentan otras GPU.
- VRAM estimada: no disponible.
- GPU de servidor recomendadas (A100, H100, RTX 4090): no disponibles para este build.
- Despliegue en navegador mediante la librería s1s2 (`@s1s2/web`); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| S5-nano GDPR + LGPD (este) | no disponible | no disponible | Clasificación tipada Yes/No sobre requisitos GDPR/LGPD | GPL-3.0 | ONNX int4, WebGPU, navegador |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Modelo generativo general | Apache-2.0 | no disponible |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor del esquema System 1 / System 2 en navegador | no disponible | Web |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito, no si una política cumple la normativa; no constituye asesoramiento legal.
- Entrenado sobre políticas de aplicaciones GDPR (inglés) y LGPD (portugués); CCPA solo se evalúa en zero-shot y nunca se entrenó.
- Las palabras de opción están fijadas ("Yes"/"No" en inglés, "Sim"/"Não" en portugués); cualquier otra palabra o traducción invalida el prompt que lee el cabezal.
- El build int4 solo funciona en WebGPU; no hay kernel de CPU para sus capas GatedDeltaNet.
- Los resultados del build int4 en navegador son preliminares y medidos sobre split de desarrollo; los de fidelidad usan solo ítems de desarrollo, sin test.
- Licencia GPL-3.0 por los pesos entrenados sobre GDPR-Transparency-200 (GPL-3.0), lo que condiciona el uso comercial y la redistribución; los datos Claudinha (CC BY 4.0), Kev y el modelo base (Apache-2.0) mantienen su atribución.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Solo admite inglés y portugués.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador y cabezales PyTorch (LoRA): https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

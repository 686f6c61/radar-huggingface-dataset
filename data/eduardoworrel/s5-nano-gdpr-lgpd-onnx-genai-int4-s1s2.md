# eduardoworrel/S5-nano-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

S5-nano GDPR-LGPD ONNX genai int4 S1S2 es una compilación cuantizada a int4 del modelo base maritaca-ai/S5-nano, especializada en la verificación de requisitos de transparencia en políticas de privacidad bajo el RGPD (en inglés) y la LGPD brasileña (en portugués). El modelo no genera texto libre como tarea principal: incorpora una cabeza de clasificación de tipo pointer que, dado un fragmento de política y un requisito de transparencia, responde "Yes/No" o "Sim/Não" en un único forward pass, devolviendo además una probabilidad y un margen de confianza. Lo desarrolla el usuario eduardoworrel y se distribuye con licencia GPL-3.0.

La relevancia de esta ficha reside en su enfoque de despliegue: el paquete ONNX int4 (2,44 GB) está pensado para ejecutarse íntegramente en el navegador mediante WebGPU a través de la librería s1s2, con un patrón System 1 / System 2 en el que la decisión tipada se resuelve con un solo paso y solo se invoca generación de texto cuando el margen es bajo. El modelo base S5-nano es de Maritaca AI (Apache-2.0) y aquí se cuantiza y se le añaden cabezas entrenadas con datos de GDPR-Transparency-200 y del corpus Claudinha.

El interés técnico está en la combinación de cuantización int4 para WebGPU, atención basada en GatedDeltaNet (que impide ejecución en CPU en esta compilación) y una política de escalado calibrable sobre datos propios. Es una pieza acotada y muy específica, no un modelo de propósito general, y así debe evaluarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas GatedDeltaNet (modelo base S5-nano); cabeza pointer de clasificación añadida |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX Runtime GenAI 0.19) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai), int4; adaptadores y cabezas en PyTorch en el repo LoRA asociado |

## Arquitectura y entrenamiento

El modelo parte de maritaca-ai/S5-nano, un transformer con capas GatedDeltaNet según se desprende de las limitaciones declaradas (no hay kernel de CPU para esas capas en la compilación WebGPU). Sobre ese backbone se entrena una cabeza pointer que lee el prompt compuesto por el fragmento de política y la pregunta de requisito, y emite una elección entre las palabras de opción exactas definidas en el manifiesto: "Yes"/"No" en inglés y "Sim"/"Não" en portugués. El entrenamiento se realizó en dos configuraciones de variante: `joint_k` (2 épocas, merge en fp32) y `joint` (1 época, merge en bf16), según los resultados reportados.

Los datos de entrenamiento incluyen GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha de políticas LGPD (portugués, CC BY 4.0) y datos sintéticos Kev (legacy_policy y composicionales, Apache-2.0). La receta de la cabeza pointer y del entrenamiento procede de Kev. La idea de separar System 1 (decisión en un forward pass) y System 2 (generación solo cuando el margen es bajo) se atribuye a CT0 de Alias Robotics, con los precursores alias3-web y el paper Browser Immune System (arXiv 2611.15302). No se especifican el número de tokens de entrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Clasificación binaria de requisitos de transparencia en políticas de privacidad: dada una pregunta tipada (por ejemplo, "recipients") y un pasaje, devuelve "Yes"/"No" o "Sim"/"Não" con probabilidad y margen.
- Decisión en un único forward pass (System 1) sobre el prefill compartido.
- Generación de texto (System 2) a partir del mismo prefill, útil para citar la frase que justifica la decisión.
- Política de escalado por margen: las respuestas con margen bajo se derivan a generación, conservando la respuesta tipada.
- Soporte multilingüe limitado a inglés (RGPD) y portugués (LGPD); transferencia zero-shot a CCPA en inglés.
- Ejecución en navegador con WebGPU mediante la librería s1s2.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, visión ni audio.

## Casos de uso

- Auditoría de transparencia de políticas de privacidad: dado un requisito concreto (por ejemplo, destinatarios de datos), el modelo indica si el pasaje lo aborda, con probabilidad y margen, lo que permite priorizar revisiones humanas.
- Triaje de políticas en portugués bajo LGPD: el manifiesto `.pt.json` permite evaluar políticas brasileñas con las opciones "Sim"/"Não" y clasificar qué requisitos están cubiertos.
- Revisión asistida en el navegador: al ejecutarse con WebGPU vía s1s2, permite que un analista use la herramienta sin enviar el texto de la política a un servidor externo.
- Extracción de evidencia: cuando la decisión es afirmativa, la generación System 2 cita la frase que la sustenta, lo que facilita la trazabilidad en informes de cumplimiento.
- Control de calidad de plantillas: aplicar el clasificador a plantillas de política propias para detectar requisitos no cubiertos antes de publicarlas.
- Investigación sobre transferencia entre marcos regulatorios: el rendimiento zero-shot en CCPA (82,9 % de balanced accuracy en fp32) sirve para estudiar la generalización entre regímenes de privacidad.
- Gate de escalado en pipelines: usar el margen calibrado sobre datos etiquetados propios (`thresholdFromQuantile`) para decidir automáticamente qué casos requieren revisión o generación adicional.

## Benchmarks y rendimiento

Resultados de balanced accuracy de la cabeza pointer en el conjunto de test held-out, con pesos fp32 de PyTorch de la variante `joint_k`:

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 89,4 |
| LGPD (portugués), n = 802 | 83,4 |
| CCPA (inglés, zero-shot), n = 420 | 82,9 |

Medición de esta compilación int4 en navegador (Chrome WebGPU, Mac M2 Pro), preliminar, sobre el split de desarrollo:

| Conjunto | Balanced accuracy (%) | Decisiones distintas vs fp32 (%) |
|---|---|---|
| GDPR | 90,4 | 3,1 |
| LGPD | 87,3 | 2,2 |
| CCPA | 82,4 | 2,6 |

La compilación `joint` int4 medida en navegador sobre el test held-out obtiene GDPR 87,8 / LGPD 80,8 / CCPA 81,9. La variante `joint` en bf16 obtiene 87,1 / 80,5 / 81,2 frente a 89,4 / 83,4 / 82,9 de `joint_k`.

## Requisitos de hardware

- Descarga del paquete int4: 2,44 GB.
- Ejecución exclusivamente en WebGPU: la compilación no incluye kernel de CPU para sus capas GatedDeltaNet.
- Navegador compatible con WebGPU (medido en Chrome WebGPU sobre Mac M2 Pro).
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del paquete (2,44 GB) da una cota inferior orientativa de memoria.
- GPU recomendadas: no disponible; el caso validado es una GPU integrada Apple M2 Pro vía WebGPU.
- Despliegue: onnxruntime-genai 0.19 y la librería s1s2 (github.com/eduardoworrel/s1s2). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Despliegue |
|---|---|---|---|---|---|
| S5-nano GDPR-LGPD ONNX int4 S1S2 | no disponible | no disponible | Clasificación de requisitos de privacidad + generación | GPL-3.0 | Navegador (WebGPU), onnxruntime-genai |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Generación de texto general | Apache-2.0 | No disponible |
| eduardoworrel/S5-nano-GDPR-LGPD-LoRA | no disponible | no disponible | Adaptadores y cabezas en PyTorch | no disponible | PyTorch |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La compilación int4 solo funciona en WebGPU; no hay kernel de CPU para las capas GatedDeltaNet.
- El modelo fue entrenado sobre políticas de aplicación del RGPD (inglés) y políticas LGPD (portugués); CCPA nunca se usó en entrenamiento y su rendimiento es de transferencia zero-shot.
- El modelo indica si un pasaje aborda un requisito, no si una política cumple la normativa; no constituye asesoramiento legal.
- Las palabras de opción están fijadas por el manifiesto ("Yes"/"No", "Sim"/"Não"); traducciones u otras variantes alteran el prompt y no funcionan.
- La licencia GPL-3.0 deriva de los datos GDPR-Transparency-200; conviene revisar las implicaciones para uso comercial y distribución.
- Los resultados de la compilación int4 en navegador son preliminares y medidos sobre el split de desarrollo, no sobre el test held-out, salvo donde se indica.
- Riesgo de alucinación en la fase System 2 (generación de la cita justificativa); la decisión tipada debe mantenerse como referencia.
- No se documentan sesgos específicos, longitud de contexto ni número de parámetros, lo que limita la evaluación de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptadores y cabezas PyTorch: https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Datos GDPR (privacy-policy-annotator): https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta Kev (pointer head): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

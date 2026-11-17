# eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

Salamandra-2B GDPR + LGPD privacy specialist es una compilación ONNX int4 del modelo Salamandra-2B-Instruct del Barcelona Supercomputing Center (BSC-LT), adaptada por eduardoworrel para una tarea muy concreta: clasificar si un fragmento de una política de privacidad aborda o no un requisito de transparencia determinado. En lugar de generar texto libre, incorpora una cabeza de clasificación (pointer head) que responde "Yes"/"No" en inglés y "Sim"/"Não" en portugués en un único forward pass, devolviendo además una probabilidad y un margen de decisión.

La compilación está pensada para ejecutarse íntegramente en el navegador mediante la librería s1s2 sobre onnxruntime-genai 0.19 con backend WebGPU, con un grafo int4 de 2,03 GB de descarga. El autor aplica un esquema de dos sistemas: un "System 1" rápido de una sola pasada para la decisión tipada y un "System 2" generativo que se activa solo cuando el margen de la respuesta cae por debajo de un umbral calibrado por el usuario, reutilizando el mismo prefill.

El modelo es relevante por su enfoque de privacidad en el borde (todo el cómputo ocurre en el cliente), por su especialización en normativa GDPR (inglés) y LGPD (portugués) y por la integración explícita de una política de escalado basada en confianza. La licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Salamandra-2B-Instruct) con cabeza de clasificación pointer head añadida |
| Parametros totales | 2B (modelo base); tamaño del grafo int4: 2,03 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (onnxruntime-genai 0.19, WebGPU) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai), int4; adaptador PyTorch LoRA y cabezas en repo separado |

## Arquitectura y entrenamiento

El modelo parte de BSC-LT/salamandra-2b-instruct (Apache-2.0), un transformer decoder-only de 2B parámetros, y le añade una cabeza de apuntamiento (pointer head) entrenada para clasificar pares pasaje-requisito. La cabeza se entrenó con exactamente las palabras opcionales " Yes" y " No" (con espacio inicial) en inglés y " Sim" y " Não" en portugués, definidas en los manifiestos `manifest.en.json` y `manifest.pt.json`. Cualquier otra palabra, incluida una traducción, altera el prompt que lee la cabeza y no funciona.

Los datos de entrenamiento combinan GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha (portugués, CC BY 4.0), datos sintéticos Kev (legacy_policy, composicional) y, según el autor, no se entrenó con CCPA. La receta de entrenamiento y la cabeza pointer provienen del proyecto Kev (Apache-2.0). La variante publicada en este repo es `joint_k` (2 épocas, merge fp32) cuantizada a int4. La innovación destacable es el esquema System 1 / System 2 con puerta de margen: la decisión tipada se obtiene en un forward pass y, si el margen es bajo, se escala a generación reutilizando el mismo prefill.

## Capacidades

- Clasificación binaria de cumplimiento de requisitos de transparencia en políticas de privacidad (respuesta tipada con probabilidad y margen).
- Respuesta en una sola pasada (System 1) con opciones fijas " Yes"/" No" (en) y " Sim"/" Não" (pt).
- Generación de texto (System 2) para justificar o citar la frase relevante, activable bajo demanda.
- Escalado condicionado por umbral de margen calibrado sobre datos etiquetados propios.
- Ejecución en navegador vía WebGPU con s1s2 y onnxruntime-genai.
- Transferencia zero-shot observada a CCPA (inglés), sin entrenamiento específico.
- Soporte multilingüe limitado a inglés y portugués.
- No se documenta soporte de tool calling, agentes ni visión en la información disponible.

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: cargar el manifiesto GDPR o LGPD y evaluar pasajes contra requisitos de transparencia sin enviar texto a un servidor, gracias al cómputo local en WebGPU.
- Herramienta de cumplimiento para equipos legales: clasificar automáticamente secciones de una política y marcar las que abordan destinatarios, retención u otras categorías, con probabilidad y margen para priorizar la revisión humana.
- Triaje con escalado: usar el umbral `thresholdFromQuantile` sobre márgenes de desarrollo para que solo las decisiones de baja confianza pasen a System 2 y generen una cita justificativa.
- Extensión de un asistente de privacidad en portugués: evaluar políticas LGPD con las opciones " Sim"/" Não" y generar explicaciones en el mismo prefill.
- Investigación sobre clasificación con cabezas pointer: comparar el rendimiento de la variante `joint_k` frente a `joint` y estudiar el efecto de la cuantización int4 en la precisión balanceada.
- Prototipado de aplicaciones privacy-first: integrar s1s2 en una web app que procese políticas de terceros localmente, sin infraestructura de inferencia dedicada.
- Evaluación de transferencia zero-shot: aplicar el modelo entrenado en GDPR/LGPD a textos CCPA para estimar su robustez entre marcos normativos.

## Benchmarks y rendimiento

Precisión balanceada de la cabeza pointer. Pesos fp32 PyTorch de la variante `joint_k` (2 épocas, merge fp32) sobre conjunto de test reservado:

| Conjunto | Precisión balanceada (%) |
|---|---|
| GDPR (inglés), n = 558 | 81,9 |
| LGPD (portugués), n = 802 | 78,2 |
| CCPA (inglés, zero-shot), n = 420 | 75,0 |

Compilación int4 medida en navegador (Chrome WebGPU, Mac M2 Pro), **preliminar**, sobre split de desarrollo:

| Conjunto | Precisión balanceada (%) | Decisiones distintas vs fp32 (%) |
|---|---|---|
| GDPR | 81,7 | 7,9 |
| LGPD | 83,4 | 4,8 |
| CCPA | 73,1 | 5,5 |

Compilación int4 `joint` en navegador (test reservado): GDPR 57,0 / LGPD 64,0 / CCPA 63,1. Variante `joint` (1 época, merge bf16): GDPR 59,5 / LGPD 67,1 / CCPA 65,0 frente a 81,9 / 78,2 / 75,0 de `joint_k`.

## Requisitos de hardware

- Descarga del grafo int4: 2,03 GB; requiere navegador con soporte WebGPU (probado en Chrome sobre Mac M2 Pro).
- Ejecución en cliente: no requiere GPU de servidor; el cómputo ocurre en la GPU del dispositivo vía WebGPU.
- VRAM estimada: no disponible de forma explícita; el tamaño del grafo (2,03 GB) da una cota inferior orientativa.
- GPU de servidor recomendadas: no disponible; el diseño apunta a ejecución en navegador, no a despliegue en A100/H100.
- Despliegue: onnxruntime-genai 0.19 con la librería s1s2; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta compilación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamandra-2B GDPR+LGPD ONNX int4 (este) | 2B | no disponible | Clasificación de requisitos de privacidad + generación | GPL-3.0 | Hugging Face, ejecución en navegador |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| eduardoworrel/Salamandra-2B-GDPR-LGPD-LoRA | 2B | no disponible | Adaptador PyTorch y cabezas para la misma tarea | no disponible | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Clasificación en navegador (precursor) | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito, no si una política cumple la normativa; no constituye asesoramiento legal.
- Entrenado con políticas GDPR (inglés) y LGPD (portugués); CCPA solo se evaluó en zero-shot, sin entrenamiento.
- Las opciones están fijadas (" Yes"/" No", " Sim"/" Não"); traducciones u otras palabras rompen la cabeza.
- La cuantización int4 introduce divergencias frente a fp32 (7,9 / 4,8 / 5,5 % de decisiones distintas en desarrollo) y la medición en navegador es preliminar.
- La variante `joint` rinde muy por debajo de `joint_k` (57,0 frente a 81,9 en GDPR), por lo que la elección de variante es crítica.
- Licencia GPL-3.0 por los datos GDPR-Transparency-200; restringe el uso comercial propietario y exige mantener la atribución de Claudinha (CC BY 4.0), Kev y el modelo base (Apache-2.0).
- Idiomas limitados a inglés y portugués; no se documenta cobertura de otras lenguas.
- Riesgo de alucinación en la fase System 2 (generación de citas justificativas); conviene validar las citas producidas.
- Sin datos publicados de sesgos, latencia ni throughput; el repo registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha: https://zenodo.org/records/13371639
- Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

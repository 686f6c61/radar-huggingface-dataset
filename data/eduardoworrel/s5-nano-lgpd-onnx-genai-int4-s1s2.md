# eduardoworrel/S5-nano-LGPD-ONNX-genai-int4-S1S2

## Resumen

S5-nano-LGPD-ONNX-genai-int4-S1S2 es una compilación ONNX int4 del modelo S5-nano de Maritaca AI, adaptada por eduardoworrel para clasificar pasajes de políticas de privacidad en portugués según requisitos de la LGPD (Ley General de Protección de Datos de Brasil). El modelo base es un transformer híbrido de Maritaca AI con capas GatedDeltaNet; esta versión añade una cabeza de clasificación (pointer head) entrenada con datos del corpus Claudinha y datos sintéticos, y se distribuye en formato ONNX Runtime GenAI int4 para ejecutarse en el navegador mediante WebGPU a través de la librería s1s2.

El problema que resuelve es concreto: dada una frase de una política de privacidad y una pregunta de transparencia (por ejemplo, si se comparten datos con terceros), el modelo responde "Sim" o "Não" en un único forward pass, devolviendo además una probabilidad y un margen de confianza. Cuando el margen es bajo, el mismo prefill puede escalar a una segunda pasada generativa (System 2) que produce una justificación textual. Es relevante por su enfoque de privacidad en el dispositivo (inferencia local en el navegador, sin enviar datos a servidores) y por su arquitectura de dos sistemas con puerta de escalado calibrable.

El repositorio ocupa 2,5 GB (descarga de 2,44 GB para el grafo int4) y está publicado bajo licencia CC BY 4.0. El modelo base S5-nano es Apache-2.0. La versión int4 no tiene aún mediciones de rendimiento en navegador publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas GatedDeltaNet (modelo base S5-nano); grafo ONNX Runtime GenAI 0.19 con cabeza pointer de clasificación |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (ONNX Runtime GenAI) |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), int4 |

## Arquitectura y entrenamiento

El modelo base S5-nano de Maritaca AI emplea una arquitectura híbrida con capas GatedDeltaNet, lo que explica la restricción de ejecución exclusiva en WebGPU: no existe kernel CPU para esas capas en el grafo ONNX publicado. Sobre ese base, el autor añade una pointer head entrenada para responder preguntas de tipo elección con exactamente las palabras "Sim" y "Não"; cualquier otra palabra (incluidas traducciones) altera el prompt que lee la cabeza y no funciona. La variante evaluada es `lgpd_only`, con pesos bf16.

El entrenamiento combina el corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0) con datos sintéticos Kev de tipo `legacy_policy` y `compositional`, generados por código Kev (Apache-2.0). La receta de la cabeza pointer y del entrenamiento proviene de Kev. La idea de separación System 1 / System 2 con puerta de margen procede de CT0 (Alias Robotics) y de los trabajos precursores alias3-web y el paper Browser Immune System (arXiv 2611.15302). Existe otra variante, `lgpd_only_k` (2 épocas, fusión fp32), que no fue evaluada en el conjunto de test reservado.

## Capacidades

- Clasificación binaria de pasajes de política de privacidad contra requisitos LGPD, con respuesta tipada ("Sim"/"Não"), probabilidad y margen en un único forward pass (System 1).
- Generación de texto justificativo bajo demanda (System 2) reutilizando el mismo prefill, por ejemplo para citar la frase que evidencia la respuesta.
- Escalado condicional por margen: las respuestas de bajo margen pueden derivarse a una pasada generativa, con umbral calibrable sobre datos etiquetados propios (`thresholdFromQuantile`).
- Transferencia zero-shot a marcos normativos en inglés: GDPR y CCPA, sin entrenamiento específico en ellos.
- Ejecución local en navegador mediante WebGPU con la librería s1s2, sin envío de datos a servidores.
- Soporte de preguntas de tipo elección con opciones controladas por el manifiesto (`lab.labels`), lo que permite construir cuestionarios estructurados sobre el mismo modelo.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: cargar una política en portugués y evaluar automáticamente decenas de requisitos de transparencia (compartición con terceros, finalidades, retención) sin que el texto salga del dispositivo del analista.
- Herramienta de cumplimiento para equipos de privacidad: usar la respuesta tipada y el margen para priorizar revisiones humanas, derivando solo los casos dudosos a la pasada generativa que produce la cita justificativa.
- Detección de lagunas de transparencia en portales de empresas brasileñas: procesar por lotes fragmentos de políticas y marcar los requisitos no abordados, con un umbral calibrado sobre un conjunto etiquetado propio.
- Verificación cruzada de marcos normativos: aplicar el modelo, entrenado solo con LGPD, a textos GDPR y CCPA en inglés como primera pasada de triaje (balanced accuracy en torno al 81-83 % en los conjuntos de test citados), antes de una revisión especializada.
- Integración en extensiones de navegador o demos web: el grafo int4 de 2,44 GB se carga con s1s2 y WebGPU, permitiendo prototipos de privacidad en el dispositivo sin infraestructura de servidor.
- Investigación sobre arquitecturas System 1 / System 2: replicar la puerta de margen y el escalado generativo sobre el mismo prefill para estudiar calibración y coste computacional en clasificación con LLM.
- Generación de explicaciones citadas: cuando la clasificación es positiva, solicitar al modelo la frase concreta que sustenta la respuesta, útil para informes de auditoría reproducibles.

## Benchmarks y rendimiento

Resultados publicados en la model card: balanced accuracy de la pointer head sobre el conjunto de test reservado, pesos bf16 de la variante `lgpd_only`.

| Conjunto de test | Balanced accuracy (%) |
|---|---|
| LGPD (portugués), n = 802 | 81,2 |
| GDPR (inglés, transferencia zero-shot), n = 558 | 83,3 |
| CCPA (inglés, transferencia zero-shot), n = 420 | 81,0 |

Esta compilación int4 no tiene mediciones de rendimiento en navegador publicadas.

## Requisitos de hardware

- Descarga del grafo int4: 2,44 GB; tamaño total del repositorio: 2,5 GB.
- Ejecución exclusivamente en WebGPU: no hay kernel CPU para las capas GatedDeltaNet del grafo ONNX, por lo que no funciona en entornos sin GPU compatible con WebGPU.
- GPU de consumo: cualquier GPU con soporte WebGPU estable (por ejemplo, tarjetas AMD, NVIDIA o Apple Silicon recientes) puede alojar el grafo int4; no se especifican VRAM mínimas.
- Despliegue en servidor: no documentado para esta compilación; el runtime objetivo es onnxruntime-genai 0.19 con la librería s1s2 en el navegador.
- Alternativa PyTorch: el adaptador y las cabezas están disponibles en eduardoworrel/S5-nano-LGPD-LoRA para ejecución fuera del navegador.
- Latencia y throughput: no disponibles para esta build int4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-LGPD-ONNX-genai-int4-S1S2 (este) | no disponible | no disponible | Clasificación LGPD en navegador, System 1/2 | CC BY 4.0 | ONNX int4, WebGPU |
| eduardoworrel/S5-nano-LGPD-LoRA | mismo base S5-nano | no disponible | Adaptador PyTorch con cabezas LGPD | no disponible | PyTorch |
| maritaca-ai/S5-nano | no disponible | no disponible | Modelo base generativo de Maritaca AI | Apache-2.0 | Pesos originales |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor de clasificación de privacidad en navegador | no disponible | Web |

## Limitaciones y advertencias

- Solo funciona con las palabras de opción exactas "Sim" y "Não"; traducciones u otras variantes cambian el prompt leído por la cabeza y rompen la clasificación.
- Entrenado únicamente con políticas brasileñas (LGPD); GDPR y CCPA solo se evalúan en transferencia zero-shot y no forman parte del entrenamiento.
- Indica si un pasaje aborda un requisito, no si una política cumple la ley; no constituye asesoramiento legal.
- Ejecución restringida a WebGPU: sin kernel CPU para las capas GatedDeltaNet, no hay fallback en entornos sin GPU compatible.
- Esta build int4 no cuenta con mediciones de rendimiento en navegador, por lo que su latencia y fiabilidad práctica no están verificadas.
- Riesgo de alucinación en la pasada generativa (System 2) al citar frases justificativas; conviene validar las citas contra el texto original.
- El umbral de escalado debe calibrarse sobre datos etiquetados propios; un umbral mal ajustado degrada la precisión o dispara el coste generativo.
- La licencia CC BY 4.0 exige atribución; el modelo base (Apache-2.0), el corpus Claudinha (CC BY 4.0) y los datos Kev (Apache-2.0) conservan sus condiciones de atribución.
- Sesgos no documentados en la model card; al entrenarse sobre un corpus normativo brasileño concreto, puede infrarepresentar prácticas de otras jurisdicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-LGPD-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/S5-nano-LGPD-LoRA
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Corpus Claudinha: https://zenodo.org/records/13371639
- Receta y cabeza pointer (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

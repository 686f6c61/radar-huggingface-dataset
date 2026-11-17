# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

El modelo `eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2` es una especialización del modelo base `utter-project/EuroLLM-1.7B-Instruct` (Apache-2.0) orientada a la clasificación binaria de pasajes de políticas de privacidad frente a requisitos de transparencia. Dado un fragmento de texto y una pregunta concreta sobre transparencia (por ejemplo, si se abordan los destinatarios de los datos), el modelo responde "Yes"/"No" en inglés o "Sim"/"Não" en portugués mediante un cabezal de tipo pointer que devuelve una elección tipada, una probabilidad y un margen. Está desarrollado por el usuario eduardoworrel y se distribuye cuantizado en int4 para ONNX Runtime GenAI, con soporte para WebGPU y ejecución en navegador a través de la librería s1s2.

La relevancia del modelo radica en su enfoque de dos sistemas: un primer paso (System 1) de una sola pasada forward que produce la respuesta binaria, y un segundo paso (System 2) opcional de generación que solo se activa cuando el margen de la respuesta cae por debajo de un umbral calibrado. Este diseño permite un filtrado rápido y de bajo coste en el navegador, con escalado selectivo a generación completa cuando la confianza es baja. El modelo está entrenado sobre datos de GDPR (inglés) y LGPD (portugués), y muestra transferencia zero-shot a CCPA.

El repositorio ocupa 1,3 GB y contiene pesos en formato ONNX int4 compatibles con onnxruntime-genai 0.19. La licencia es GPL-3.0, condicionada por el uso del dataset GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base EuroLLM-1.7B-Instruct) con cabezal pointer de clasificación |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, onnxruntime-genai 0.19, grafo WebGPU) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (int4) |

## Arquitectura y entrenamiento

El modelo parte de `utter-project/EuroLLM-1.7B-Instruct`, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre él se añade un cabezal pointer entrenado para clasificación binaria: el modelo lee un pasaje y una instrucción de transparencia, y produce una elección entre dos palabras de opción exactas (" Yes"/" No" en inglés, " Sim"/" Não" en portugués). El cabezal fue entrenado con exactamente esas palabras, por lo que traducciones u otras variantes no funcionan.

El entrenamiento se realizó sobre políticas de privacidad GDPR en inglés y políticas LGPD en portugués. Los datos incluyen el dataset GDPR-Transparency-200 (GPL-3.0), el corpus Claudinha (CC BY 4.0) y datos sintéticos Kev (Apache-2.0). La variante `joint_k` se entrenó durante 2 épocas con fusión fp32. El modelo no fue entrenado sobre CCPA, lo que permite evaluar la transferencia zero-shot. La innovación principal es la separación System 1 / System 2 con compuerta de margen: una sola pasada forward produce la respuesta binaria con probabilidad y margen, y solo si el margen es bajo se escala a generación completa reutilizando el mismo prefill.

## Capacidades

- Clasificación binaria de pasajes de políticas de privacidad frente a requisitos de transparencia (GDPR en inglés, LGPD en portugués).
- Respuesta tipada con probabilidad y margen por cada pregunta.
- Ejecución en navegador mediante WebGPU con la librería s1s2.
- Escalado selectivo a generación (System 2) cuando el margen cae por debajo de un umbral calibrado.
- Transferencia zero-shot a CCPA (inglés).
- Soporte de múltiples preguntas por pasaje en una misma llamada.
- Generación de texto de justificación (por ejemplo, citar la frase que evidencia la respuesta) en el paso System 2.

## Casos de uso

- Auditoría automática de políticas de privacidad: el modelo clasifica pasajes de políticas GDPR/LGPD contra requisitos de transparencia concretos, devolviendo una respuesta binaria con confianza para priorizar revisiones humanas.
- Filtrado en el navegador del usuario: gracias a la cuantización int4 y WebGPU, puede ejecutarse localmente sin enviar texto de políticas a un servidor, útil para herramientas de privacidad de extremo a extremo.
- Triaje de cumplimiento normativo: clasificación rápida de cientos de pasajes con System 1 y escalado a System 2 solo en los casos de margen bajo, reduciendo coste computacional.
- Extracción de evidencia: en los casos escalados, el modelo genera la frase concreta que justifica la respuesta, facilitando la trazabilidad en informes de cumplimiento.
- Investigación sobre transferencia entre jurisdicciones: evaluación zero-shot sobre CCPA para estudiar la generalización de modelos entrenados en GDPR/LGPD.
- Prototipado de asistentes legales: integración en flujos que responden preguntas de transparencia sobre políticas de datos con salida estructurada (elección, probabilidad, margen).

## Benchmarks y rendimiento

Resultados en conjunto de test held-out, balanced accuracy del cabezal pointer, pesos fp32 PyTorch de la variante `joint_k` (2 épocas, fusión fp32):

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 83,0 |
| LGPD (portugués), n = 802 | 79,4 |
| CCPA (inglés, zero-shot), n = 420 | 75,2 |

Esta build int4 no tiene medición en navegador todavía. La build int4 `joint` medida en navegador (test held-out) obtuvo: GDPR 52,9 / LGPD 53,7 / CCPA 52,9. La variante `joint` (1 época, fusión bf16) obtuvo: GDPR 53,2 / LGPD 53,7 / CCPA 54,8 frente a 83,0 / 79,4 / 75,2.

## Requisitos de hardware

- Descarga del modelo: 1,31 GB (int4 ONNX, onnxruntime-genai 0.19, grafo WebGPU).
- Ejecución en navegador con WebGPU; no requiere GPU dedicada de servidor.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de descarga de 1,31 GB sugiere un consumo moderado compatible con GPUs de consumo.
- GPU recomendadas: no disponible; el diseño apunta a ejecución en navegador vía WebGPU.
- Opciones de despliegue: onnxruntime-genai con la librería s1s2 (github.com/eduardoworrel/s1s2).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 1,7B | no disponible | GPL-3.0 | ONNX int4 | Clasificación de transparencia GDPR/LGPD en navegador |
| utter-project/EuroLLM-1.7B-Instruct (base) | 1,7B | no disponible | Apache-2.0 | safetensors | Instrucciones generales multilingües |
| aliasrobotics/alias3-web | no disponible | no disponible | no disponible | no disponible | Precursor de clasificación en navegador |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en clasificación de políticas de privacidad en la información proporcionada.

## Limitaciones y advertencias

- El cabezal solo funciona con las palabras de opción exactas con las que fue entrenado (" Yes"/" No" en inglés, " Sim"/" Não" en portugués); otras variantes o traducciones no funcionan.
- El modelo indica si un pasaje aborda un requisito, no si una política cumple la normativa; no constituye asesoramiento legal.
- Entrenado únicamente sobre políticas GDPR (inglés) y LGPD (portugués); la transferencia a CCPA es zero-shot y con menor rendimiento (75,2 %).
- La build int4 de este repositorio no tiene medición en navegador; la build int4 `joint` medida en navegador muestra una caída notable de precisión (en torno al 53 %) respecto a los pesos fp32.
- Licencia GPL-3.0, derivada del uso del dataset GDPR-Transparency-200; restringe el uso comercial según los términos de dicha licencia.
- Riesgo de alucinación en el paso System 2 (generación de justificaciones), ya que se apoya en el modelo base de instrucciones.
- Idiomas limitados a inglés y portugués; no se reporta soporte para otras lenguas.
- Sesgos potenciales heredados del modelo base y de los corpus de políticas utilizados, no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezales: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Dataset GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha: https://zenodo.org/records/13371639
- Receta de entrenamiento Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

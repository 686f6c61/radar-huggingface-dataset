# eduardoworrel/Salamandra-2B-GDPR-LGPD-LoRA

## Resumen

Salamandra-2B-GDPR-LGPD-LoRA es un adaptador LoRA con cabeza de clasificación (pointer head) construido sobre el modelo base BSC-LT/salamandra-2b-instruct del Barcelona Supercomputing Center. El modelo resuelve una tarea muy concreta: dada una cláusula de política de privacidad y un requisito de transparencia, responder Sí/No en un único forward pass, devolviendo además una probabilidad y un margen de decisión. Está especializado en dos marcos regulatorios: el GDPR (en inglés) y el LGPD brasileño (en portugués).

La relevancia técnica del modelo no está en su tamaño, sino en el patrón de diseño: combina un adaptador PEFT de bajo rango con una cabeza de atención tipo pointer (q/k de dimensión 256) que puntúa directamente los tokens de opción (" Yes"/" No" en inglés, " Sim"/" Não" en portugués). Este enfoque evita la generación autoregresiva y reduce la tarea a una clasificación binaria calibrada, lo que permite despliegue en navegador mediante una variante ONNX int4 con WebGPU.

El autor publica resultados de balanced accuracy sobre conjuntos de test retenidos: 81,9 % en GDPR (inglés, n=558), 78,2 % en LGPD (portugués, n=802) y 75,0 % en transferencia zero-shot a CCPA (inglés, n=420). El modelo se distribuye con licencia GPL-3.0, condicionada por el dataset de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Salamandra-2B) + adaptador LoRA + pointer head (atención q/k, dim 256) |
| Parametros totales | 2B en el modelo base; adaptador LoRA y cabeza no cuantificados en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variante ONNX int4 publicada como modelo hermano (Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2); pesos LoRA en safetensors, merge en bf16 o fp32 |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (LoRA PEFT + head.safetensors); ONNX int4 en el repo hermano |

## Arquitectura y entrenamiento

El modelo parte de Salamandra-2B-instruct, un transformer decoder-only de 2B parámetros del BSC, y le añade un adaptador LoRA entrenado con PEFT. Sobre la representación del token de decisión se aplica una cabeza pointer que calcula `softmax_k(q(h_decide) · k(h_option_end) / 16)`, es decir, una atención entre el estado del token de decisión y el estado final de cada token de opción. Las opciones están fijadas literalmente: " Yes" y " No" en inglés, " Sim" y " Não" en portugués; cualquier otra formulación cambia el prompt y rompe la cabeza.

El entrenamiento combina tres fuentes: GDPR-Transparency-200 (GPL-3.0, inglés), el corpus Claudinha (CC BY 4.0, portugués, un anotador por cláusula) y datos sintéticos Kev (legacy_policy, composicional, Apache-2.0). Se publican dos variantes: `joint_k` (2 épocas, merge fp32) y `joint` (1 época, merge bf16). La variante `joint_k` es la que reporta los mejores resultados. El diseño System 1 / System 2 con compuerta de margen proviene de CT0 (Alias Robotics) y de los precursores alias3-web y el paper Browser Immune System (arXiv 2611.15302).

## Capacidades

- Clasificación binaria Sí/No de si una cláusula de política de privacidad aborda un requisito de transparencia concreto.
- Salida calibrada: probabilidad softmax y margen de decisión por instancia.
- Inferencia en un solo forward pass, sin generación autoregresiva.
- Soporte bilingüe inglés (GDPR) y portugués (LGPD).
- Transferencia zero-shot a CCPA en inglés (sin entrenamiento específico).
- Patrón System 1 / System 2: respuesta tipada con margen y derivación a razonamiento bajo demanda.
- Despliegue en navegador mediante la variante ONNX int4 con WebGPU y la librería s1s2.
- No soporta tool calling, agentes multi-paso ni visión según la información disponible.

## Casos de uso

- Auditoría automatizada de políticas de privacidad: dado un corpus de políticas web, el modelo evalúa cláusula a cláusula si cubre cada requisito de transparencia del GDPR, produciendo un informe con probabilidad y margen por requisito.
- Cumplimiento LGPD en portugués: empresas brasileñas pueden pasar sus políticas por el modelo para detectar requisitos de transparencia no cubiertos, usando las opciones nativas " Sim"/" Não".
- Triaje previo a revisión legal: el margen de decisión permite enrutar solo los casos de baja confianza a un revisor humano, reduciendo el volumen de revisión manual.
- Extensión zero-shot a CCPA: organizaciones con exposición en California pueden usar el modelo como primera pasada sobre políticas en inglés sin reentrenamiento, con la precisión reducida documentada (75,0 %).
- Despliegue en navegador para herramientas de privacidad: la variante ONNX int4 con WebGPU permite ejecutar la clasificación en el cliente, sin enviar el texto de la política a un servidor.
- Investigación en clasificación calibrada: el patrón pointer head + margen sirve como receta reproducible para tareas de verificación binaria sobre texto largo con modelos pequeños.
- Filtrado en pipelines de scraping regulatorio: clasificar automáticamente cláusulas candidatas antes de un análisis más costoso con modelos mayores.

## Benchmarks y rendimiento

Balanced accuracy de la pointer head sobre conjuntos de test retenidos, pesos fp32, variante `joint_k` (2 épocas, merge fp32):

| Conjunto | Balanced accuracy (%) | n |
|---|---|---|
| GDPR (inglés) | 81,9 | 558 |
| LGPD (portugués) | 78,2 | 802 |
| CCPA (inglés, zero-shot) | 75,0 | 420 |

Comparación con la variante `joint` (1 época, merge bf16):

| Conjunto | joint_k (%) | joint (%) |
|---|---|---|
| GDPR | 81,9 | 59,5 |
| LGPD | 78,2 | 67,1 |
| CCPA | 75,0 | 65,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es un clasificador especializado y no un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2B en bf16 requiere aproximadamente 4-5 GB; en int4 (variante ONNX) alrededor de 1,5-2 GB, más el adaptador LoRA y la cabeza (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060/4060 en adelante); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y equivalentes.
- Despliegue: transformers + peft para la versión safetensors; ONNX Runtime con WebGPU para la variante int4 en navegador mediante la librería s1s2. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de un solo forward pass sugiere latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamandra-2B-GDPR-LGPD-LoRA | 2B (base) + LoRA + head | no disponible | Clasificación GDPR/LGPD Sí/No | GPL-3.0 | Hugging Face (adaptador + ONNX int4) |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | Instrucción general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Clasificación web con patrón System 1/2 | no disponible | Hugging Face |
| Modelos legales generativos de 7B+ (p. ej. familia Legal) | 7B+ | variable | QA legal generativa | variable | Hugging Face |

La comparación directa con clasificadores legales especializados no está disponible en la información proporcionada. Frente al modelo base, la diferencia es que este adaptador convierte una tarea generativa en clasificación binaria calibrada con una cabeza dedicada, a costa de fijar estrictamente las opciones de respuesta.

## Limitaciones y advertencias

- El modelo indica si una cláusula aborda un requisito de transparencia, no si la política cumple la ley; no constituye asesoramiento legal.
- Entrenado sobre políticas de privacidad de aplicaciones (GDPR, inglés) y políticas brasileñas (LGPD, portugués, un anotador por cláusula); CCPA nunca se usó en entrenamiento y su rendimiento es solo de transferencia.
- Las opciones de respuesta están fijadas literalmente (" Yes"/" No", " Sim"/" Não"); traducciones u otras formulaciones rompen la cabeza.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos/negativos en la clasificación, especialmente en dominios distintos al de entrenamiento.
- Sesgos potenciales derivados de la anotación con un solo anotador en el corpus LGPD y de la composición del dataset GDPR-Transparency-200.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribución; el autor la justifica por el dataset GPL-3.0 subyacente.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; el uso previsto es exclusivamente clasificación.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Dataset GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta de pointer head y entrenamiento (Kev): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web

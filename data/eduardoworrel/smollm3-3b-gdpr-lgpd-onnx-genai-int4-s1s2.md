# eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B GDPR + LGPD es una especializacion del modelo base SmolLM3-3B de Hugging Face, desarrollada por eduardoworrel, orientada a la clasificacion binaria de pasajes de politicas de privacidad frente a requisitos de transparencia del RGPD (en ingles) y de la LGPD brasilena (en portugues). El modelo no genera respuestas abiertas para esta tarea: incorpora una cabeza de clasificacion ("pointer head") que, dado un pasaje y una pregunta concreta con dos opciones, devuelve "Si/No" (o "Sim/Nao") en un unico forward pass, junto con una probabilidad y un margen de confianza.

La relevancia practica esta en su formato de despliegue: se distribuye como grafo ONNX int4 para `onnxruntime-genai` 0.19 con backend WebGPU, lo que permite ejecutarlo integramente en el navegador (se ha medido en Chrome WebGPU sobre un Mac M2 Pro) con una descarga de 1,75 GB. Ademas implementa un patron System 1 / System 2: la decision rapida se toma en un solo paso y, solo cuando el margen es bajo, se escala a generacion autoregresiva reutilizando el mismo prefill.

El modelo tiene 3B parametros (heredados de SmolLM3-3B), soporta ingles y portugues, y su licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200. Es una herramienta de analisis de transparencia, no un sistema de cumplimiento normativo ni asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabeza de clasificacion tipo pointer head; grafo ONNX para onnxruntime-genai |
| Parametros totales | 3B (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (grafo ONNX); pesos PyTorch fp32 y bf16 en las variantes del adaptador |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai); adaptador PyTorch/LoRA en repo separado |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B y anade una cabeza de clasificacion entrenada para leer dos opciones exactas en el prompt (" Yes"/" No" en ingles, " Sim"/" Nao" en portugues, con espacio inicial) y producir una decision tipada con probabilidad y margen en un solo forward pass. El grafo desplegado es int4 para onnxruntime-genai 0.19 con WebGPU. La receta de entrenamiento y la cabeza provienen de Kev (Apache-2.0); la idea de separar System 1 (decision rapida) y System 2 (generacion de justificacion cuando el margen es bajo) procede de CT0 de Alias Robotics.

Los datos de entrenamiento combinan: GDPR-Transparency-200 (politicas de aplicaciones en ingles, GPL-3.0), el corpus Claudinha de politicas LGPD en portugues (CC BY 4.0), y datos sinteticos "Kev" (legacy_policy y compositional). Se entrenaron al menos dos variantes: `joint` (1 epoca, merge bf16) y `joint_k` (2 epocas, merge fp32). No se detalla el numero de tokens ni la composicion exacta del dataset mas alla de estas fuentes. CCPA nunca se uso en entrenamiento; solo aparece como conjunto de evaluacion.

## Capacidades

- Clasificacion binaria de pasajes de politica de privacidad frente a un requisito de transparencia concreto (por ejemplo, si se abordan los destinatarios de los datos).
- Respuesta tipada con opcion elegida, probabilidad y margen en un unico forward pass.
- Generacion de texto autoregresiva para justificar o citar la evidencia ("Quote the sentence that shows it") reutilizando el prefill de la decision.
- Escalado condicional System 1 a System 2 mediante umbral calibrado sobre margenes de un conjunto de desarrollo propio.
- Soporte de multiples preguntas en una misma llamada (`questions: [q]`).
- Ejecucion en navegador via WebGPU con la libreria s1s2.
- Idiomas: ingles (RGPD) y portugues (LGPD).
- No soporta tool calling ni razonamiento multi-paso general; la generacion esta subordinada a la tarea de clasificacion.

## Casos de uso

- Auditoria de transparencia de politicas de privacidad: dado un requisito del RGPD (por ejemplo, base legal, plazos de conservacion, destinatarios), el modelo indica si el pasaje lo aborda, con probabilidad y margen para priorizar revision humana.
- Revision de cumplimiento LGPD en portugues: mismo flujo sobre politicas de aplicaciones brasilenas, usando `manifest.pt.json` y las opciones " Sim"/" Nao".
- Triaje en herramientas de compliance en el navegador: al ejecutarse con WebGPU y 1,75 GB de descarga, permite desplegar el analisis sin enviar el texto de la politica a un servidor, lo que reduce exposicion de datos.
- Generacion de evidencias citables: cuando la decision es "Si", el modo System 2 extrae la frase concreta que justifica la respuesta, util para informes de auditoria.
- Etiquetado asistido de corpus: las salidas con margen permiten separar casos claros de ambiguos y dirigir el esfuerzo de anotacion humana solo a estos ultimos.
- Deteccion de lagunas documentales: ejecutando un conjunto de preguntas sobre cada politica se obtiene una matriz requisito-pasaje que revela que areas de transparencia no se cubren.
- Comparacion entre jurisdicciones: el modelo se evaluo tambien en CCPA (sin entrenamiento), lo que permite un analisis exploratorio de transferencia entre marcos normativos.

## Benchmarks y rendimiento

Resultados preliminares publicados en la model card. La metrica es balanced accuracy de la pointer head.

| Conjunto | Split | Precision balanceada (%) | Notas |
|---|---|---|---|
| GDPR (ingles) | dev, n = 508 | 87,8 | Pesos PyTorch fp32, variante `joint_k` |
| LGPD (portugues) | dev, n = 604 | 82,1 | Pesos PyTorch fp32, variante `joint_k` |
| GDPR (int4, navegador) | dev | 84,6 | Preliminar; discrepancias vs fp32: 5,1 % |
| LGPD (int4, navegador) | dev | 80,6 | Preliminar; discrepancias vs fp32: 4,8 % |
| CCPA (int4, navegador) | dev | 79,0 | Preliminar; discrepancias vs fp32: 6,2 % |
| GDPR (int4 `joint`, navegador) | test held-out | 83,7 | |
| LGPD (int4 `joint`, navegador) | test held-out | 79,8 | |
| CCPA (int4 `joint`, navegador) | test held-out | 75,5 | |
| GDPR (`joint`, bf16) | test held-out | 83,9 | 1 epoca |
| LGPD (`joint`, bf16) | test held-out | 80,7 | 1 epoca |
| CCPA (`joint`, bf16) | test held-out | 74,0 | Nunca entrenado en CCPA |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Descarga del grafo int4: 1,75 GB (tamano del repo: 1,8 GB).
- Ejecucion verificada en navegador con Chrome WebGPU sobre Mac M2 Pro (GPU integrada de Apple Silicon).
- VRAM estimada para inferencia: no disponible de forma explicita; el peso int4 de 1,75 GB sugiere que cabe en GPUs de consumo con 4-6 GB de memoria, aunque no se confirma en la documentacion.
- GPU de datacenter (A100, H100) no evaluadas en la informacion proporcionada.
- Despliegue: onnxruntime-genai 0.19 con backend WebGPU; cliente JavaScript `s1s2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que la decision se obtiene en un unico forward pass.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| SmolLM3-3B-GDPR-LGPD (este) | 3B | no disponible | Clasificacion binaria de transparencia RGPD/LGPD con cabeza dedicada | GPL-3.0 | ONNX int4, navegador (WebGPU) |
| SmolLM3-3B (base) | 3B | no disponible | Modelo generativo generalista | Apache-2.0 | Multiples (no detallado aqui) |
| alias3-web (Alias Robotics) | no disponible | no disponible | Precursor citado por el autor | no disponible | Navegador |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito de transparencia, no si la politica cumple la normativa; no constituye asesoramiento legal.
- Entrenado solo con politicas GDPR (ingles) y LGPD (portugues); CCPA nunca se uso en entrenamiento y su rendimiento es notablemente inferior (75,5 % en test held-out int4).
- Las palabras de opcion estan fijadas (" Yes"/" No", " Sim"/" Nao"); usar traducciones u otras variantes rompe la cabeza de clasificacion.
- Los resultados del grafo int4 en navegador son preliminares y presentan discrepancias del 4,8-6,2 % respecto a los pesos fp32; el split de test held-out no se ejecuto para esta variante int4 `joint_k`.
- Licencia GPL-3.0 derivada del corpus GDPR-Transparency-200: restringe el uso comercial propietario; el modelo base es Apache-2.0 y los datos Claudinha CC BY 4.0, con atribucion obligatoria.
- Riesgo de alucinacion en el modo System 2 (generacion de citas): la cita producida debe verificarse contra el texto original.
- Sin datos publicados sobre sesgos, contexto maximo ni comportamiento fuera de en/pt.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador PyTorch/LoRA: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- GDPR-Transparency-200 / privacy-policy-annotator: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (receta de entrenamiento y pointer head): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web

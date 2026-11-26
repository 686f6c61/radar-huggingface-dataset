# eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 es una especializacion del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel, orientada a la clasificacion de politicas de privacidad conforme a la LGPD (Lei Geral de Protecao de Dados, la ley brasilena de proteccion de datos). El modelo no genera texto libre por defecto: incorpora una "cabeza de decision" (decision head) que, dado un fragmento en portugues y un requisito de transparencia, responde Si/No en un unico forward pass, acompanado de una probabilidad y un margen de confianza.

La propuesta tecnica se apoya en el paradigma de doble sistema (System 1 / System 2): la respuesta tipada y rapida se obtiene con una sola pasada (System 1) y, solo cuando el margen es bajo, se escala a generacion autoregresiva (System 2) reutilizando el mismo prefill. El modelo se distribuye en formato ONNX int4 para onnxruntime-genai 0.19, con soporte de WebGPU, lo que permite ejecutarlo integramente en el navegador mediante la libreria s1s2.

Su relevancia actual radica en dos factores: por un lado, demuestra un patron de despliegue de modelos pequenos (3B) cuantizados a int4 para tareas de clasificacion juridica con latencia baja y ejecucion local; por otro, valida la transferencia zero-shot desde LGPD hacia GDPR y CCPA, lo que sugiere cierta generalizacion entre marcos regulatorios de privacidad, aunque con limites claros que el propio autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabeza de decision tipo pointer head y particion System 1 / System 2 |
| Parametros totales | 3B (modelo base SmolLM3-3B); parametros de la cabeza de decision: no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (grafo ONNX para onnxruntime-genai 0.19); el adaptador y las cabezas en PyTorch estan en bf16 y fp32 |
| Idiomas soportados | pt (portugues), en (ingles, solo transferencia zero-shot) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai); existe variante en layout Transformers.js y adaptador LoRA en PyTorch |
| Tamano del repositorio | 1.8 GB (descarga del grafo int4: 1.75 GB) |
| Pipeline declarado | text-generation |
| Libreria | s1s2 |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros desarrollado por Hugging Face bajo licencia Apache-2.0. Sobre esa base se anade una cabeza de decision (pointer head) entrenada para leer directamente los logits de dos tokens concretos, " Sim" y " Nao" (con espacio inicial), y producir una respuesta tipada con probabilidad y margen. El entrenamiento se realizo con datos de politicas brasilenas: el corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sinteticos Kev (legacy_policy y composicionales) generados con codigo Kev (Apache-2.0). La receta de entrenamiento de la cabeza y del adaptador sigue tambien el proyecto Kev.

La innovacion principal es la separacion System 1 / System 2 heredada de la idea de CT0 de Alias Robotics: la decision tipada se resuelve en una sola pasada (System 1) y, cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios, se escala a generacion (System 2) reutilizando el mismo prefill, de modo que la respuesta tipada se conserva y se anade una justificacion textual. La variante evaluada en la model card es `lgpd_only` (bf16); existe otra variante `lgpd_only_k` (2 epocas, merge en fp32) que no fue evaluada sobre el conjunto de test retenido. El build int4 no dispone todavia de mediciones en navegador.

## Capacidades

- Clasificacion binaria tipada (Si/No) de fragmentos de politica de privacidad frente a un requisito de transparencia, con probabilidad y margen en una sola pasada.
- Generacion de texto autoregresiva (System 2) para justificar o citar la evidencia cuando el margen es bajo.
- Escalado condicional mediante puerta de margen calibrable sobre datos propios (`thresholdFromQuantile`).
- Ejecucion en navegador con WebGPU mediante s1s2 y onnxruntime-genai; fallback a CPU via onnxruntime-web WASM.
- Transferencia zero-shot a GDPR (ingles) y CCPA (ingles) sin entrenamiento especifico en esos marcos.
- Soporte de multiples preguntas por pasada (`questions: [...]`) con respuestas tipadas independientes.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Auditoria automatizada de politicas de privacidad: dado un documento en portugues y una bateria de requisitos LGPD (comparticion con terceros, base legal, retencion, derechos del titular), el modelo devuelve respuestas tipadas con margen, lo que permite priorizar revision humana sobre los casos de baja confianza.
- Triaje en bufetes y departamentos de compliance: clasificacion rapida de clausulas para detectar ausencias o ambiguedades antes de la revision legal, con la generacion System 2 aportando la frase concreta que sustenta la decision.
- Ejecucion local en el navegador para datos sensibles: al correr sobre WebGPU con un grafo int4 de 1,75 GB, el texto de la politica no abandona el dispositivo del usuario, lo que encaja con requisitos de minimizacion de datos.
- Deteccion de brechas de transparencia en portales web: integracion en un pipeline que descarga politicas de privacidad, segmenta por requisitos y marca incumplimientos potenciales para revision.
- Investigacion comparada de marcos regulatorios: uso del modelo como sonda zero-shot sobre textos GDPR y CCPA para estudiar transferencia entre jurisdicciones, con las precisiones documentadas (75,3 % y 74,5 % de balanced accuracy respectivamente).
- Filtrado previo en sistemas de respuesta a preguntas legales: la salida tipada con margen puede actuar como gate que decide si se invoca un modelo mayor o se responde con la evidencia extraida localmente.
- Calibracion de umbrales en produccion: la API de escalado permite ajustar la puerta de margen sobre datos etiquetados propios, lo que facilita adaptar el punto de operacion a la tolerancia de error del cliente.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjunto de test retenido, balanced accuracy de la cabeza pointer, pesos bf16 de la variante `lgpd_only`:

| Conjunto de test | Balanced accuracy (%) | n |
|---|---|---|
| LGPD (portugues) | 78,2 | 802 |
| GDPR (ingles, zero-shot) | 75,3 | 558 |
| CCPA (ingles, zero-shot) | 74,5 | 420 |

Registros de fidelidad del build int4 frente al modelo PyTorch bf16 del mismo especialista, sobre 100 preguntas de desarrollo (muestra ciega a etiquetas, 50 por ley), en CPU con onnxruntime (pod x86, no WebGPU):

| Modo de lectura | Coincidencia de decision (%) | Intervalo de confianza 95 % |
|---|---|---|
| Lectura por cabeza | 96,0 | 90,2 - 98,4 |
| Lectura por logits | 95,0 | no disponible |

Notas: el build int4 no tiene mediciones en navegador. El fallback CPU del grafo (mismo fichero que el modelo SmolLM3-3B-ContractNLI-CLINC-SIB, otros pesos) se midio alli en 16,5 veces mas lento que WebGPU, en torno a 50 ms por token de prompt (elementos de desarrollo, Chrome sobre Apple M2 Pro); las decisiones en CPU no se midieron para esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo int4 ocupa 1,75 GB de descarga; el repositorio completo son 1,8 GB. La VRAM efectiva depende del backend, pero un presupuesto de 2 a 3 GB es suficiente para el grafo cuantizado.
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecucion en navegador; en servidor, GPUs con al menos 4 GB de memoria para el grafo int4. No se detallan modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, el grafo int4 de 1,75 GB es compatible con GPUs de consumo con WebGPU; no se especifican modelos.
- Opciones de despliegue: onnxruntime-genai 0.19 (WebGPU) y onnxruntime-web WASM (CPU) a traves de la libreria s1s2 (version >= 0.1.1); adaptador LoRA en PyTorch disponible en el repositorio hermano. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU, aproximadamente 50 ms por token de prompt en el grafo equivalente (Chrome sobre Apple M2 Pro), con un factor de 16,5 veces mas lento que WebGPU. La latencia de las decisiones en CPU no fue medida para esta tarea; la latencia en WebGPU no esta publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 | 3B | no disponible | Clasificacion LGPD con cabeza de decision y doble sistema, ONNX int4 para navegador | CC BY 4.0 | Hugging Face |
| SmolLM3-3B (base) | 3B | no disponible | Modelo generativo generalista | Apache-2.0 | Hugging Face |
| SmolLM3-3B-LGPD-LoRA | 3B | no disponible | Adaptador LoRA en PyTorch y cabezas del mismo especialista | no disponible | Hugging Face |
| SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 | 3B | no disponible | Mismos pesos en layout Transformers.js | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de clasificacion juridica en la informacion proporcionada, por lo que la comparacion se limita a variantes del mismo especialista y al modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente con politicas brasilenas (LGPD); GDPR y CCPA nunca se usaron en entrenamiento, por lo que su rendimiento en esos marcos es solo de transferencia zero-shot y no debe asumirse estable.
- El modelo indica si un fragmento aborda un requisito, no si una politica cumple la ley; no constituye asesoramiento legal.
- La cabeza de decision solo funciona con las palabras de opcion exactas " Sim" y " Nao" (con espacio inicial); traducciones u otras variantes alteran el prompt leido por la cabeza y rompen la prediccion.
- El build int4 no dispone de mediciones en navegador; la fidelidad medida (96,0 % y 95,0 %) se obtuvo sobre 100 elementos de desarrollo en CPU, con intervalo amplio (90,2 - 98,4), sin conjunto de test.
- La variante `lgpd_only_k` no fue evaluada sobre el conjunto de test retenido.
- El fallback a CPU es sustancialmente mas lento (16,5 veces respecto a WebGPU en el grafo equivalente), lo que puede hacer inviable el uso interactivo sin aceleracion.
- Riesgo de alucinacion en la fase System 2 (generacion de justificaciones): la cita textual debe verificarse contra el documento original.
- Sesgos potenciales derivados del corpus Claudinha y de los datos sinteticos Kev, no cuantificados en la informacion disponible.
- Licencia CC BY 4.0: permite uso comercial con atribucion; deben mantenerse las atribuciones del corpus Claudinha, de los datos Kev y del modelo base Apache-2.0.
- No se documentan capacidades de tool calling, agentes ni vision; el uso como generador generalista no es el objetivo del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Proyecto Kev (receta de entrenamiento): https://github.com/jaredpalmer/kev
- Corpus Claudinha: https://zenodo.org/records/13371639
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302

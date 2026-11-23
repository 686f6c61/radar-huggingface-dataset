# fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF

## Resumen
Mistral-Small-4-119B-2603-GSQ-RCO-GGUF es una cuantización comunitaria en formato GGUF del modelo multimodal `mistralai/Mistral-Small-4-119B-2603`, un Mixture-of-Experts (MoE) de 119 mil millones de parámetros totales y 6,5 mil millones activos por token, desarrollado por Mistral AI. La cuantización la firma `fajardc`, un autor independiente que la realizó en hardware de consumo (Ryzen 9 5900X, 64 GB de RAM, RTX 3090 y RTX 3070 Ti), aplicando los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) publicados por el DAS Lab del IST Austria.

El resultado es un archivo de precisión mixta de 52,07 GB que promedia 3,501 bits por peso, con cada tensor asignado a un tipo entre IQ2_XS y Q6_K según un presupuesto exacto de tamaño y minimizando la divergencia KL respecto al modelo BF16. El repositorio contiene únicamente el modelo de lenguaje, dividido en dos partes, y no incluye el proyector de visión ni la cabeza de decodificación especulativa.

Su relevancia radica en hacer desplegable en estaciones de trabajo y equipos con GPUs de consumo un modelo MoE de 119B con ventana de contexto de 262.144 tokens, algo inviable en BF16, manteniendo una fidelidad de distribución razonablemente baja (KL de 0,1579 en WikiText-2). Es una pieza pensada para inferencia local con llama.cpp, no una release oficial de Mistral AI ni del IST Austria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mistral4`: transformer MoE con 36 capas y multi-head latent attention (MLA), 128 expertos, 4 activos + 1 compartido |
| Parametros totales | 118.972.826.624 (≈119B) |
| Parametros activos | 6,5B por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | Precisión mixta GSQ-RCO, tipos por tensor entre IQ2_XS y Q6_K; media de 3,501 bpw; formato IQ3_S nominal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos partes: 26,88 GB + 25,19 GB) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE de la familia `mistral4` con 36 capas, atención multi-cabeza latente (MLA) y 128 expertos por capa, de los cuales se activan 4 más 1 compartido por token, lo que da 6,5B parámetros activos sobre 119B totales. Esta configuración reduce el coste computacional por token respecto a un modelo denso del mismo tamaño. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original dentro de la información proporcionada.

La cuantización aplica dos métodos del DAS Lab del IST Austria. GSQ refina los códigos enteros de cada tensor dentro de un tipo GGUF contra las entradas reales que ese tensor recibe, evaluando cada tipo candidato; RCO selecciona después un tipo por tensor bajo un presupuesto exacto de tamaño, minimizando la divergencia KL de la salida del modelo completo respecto a BF16. Sobre ese procedimiento se añadió un ajuste extremo a extremo de los valores que GSQ y RCO dejan continuos (escalas de bloque, normas y routers) contra la salida del modelo BF16, manteniendo fijos todos los códigos enteros y tipos. El presupuesto final es de 3,50 bits por peso, tomado de las releases IQ3_S de ISTA; el resultado no es un IQ3_S uniforme. El modelo original no incluye cabeza MTP; Mistral publica una cabeza EAGLE separada que llama.cpp no carga en el momento de la publicación.

## Capacidades
- Generación de texto conversacional e instructiva, con modos instruct y reasoning según el modelo base.
- Procesamiento de imágenes en el modelo original (pipeline `image-text-to-text`), si bien este archivo GGUF no incluye el proyector de visión y requiere un mmproj externo.
- Tool calling / function calling: la plantilla de chat embebida incluye una rama de resultados de herramienta corregida para el motor de plantillas de llama.cpp.
- Razonamiento multi-paso y uso como agente, apoyado en la ventana de 262.144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking (`support_thinking`) contemplado en la plantilla de chat corregida.

## Casos de uso
- Asistente de código en local: con 6,5B parámetros activos y contexto de 256k, puede mantener repositorios completos en ventana y resolver tareas de refactorización o generación en entornos sin conexión a la nube.
- Análisis de documentos largos: informes, contratos o expedientes de cientos de miles de tokens que caben en una sola pasada sin técnicas de chunking ni recuperación externa.
- Despliegue en estación de trabajo con GPU de consumo: el archivo de 52 GB permite inferencia con offloading parcial en equipos con 24 GB de VRAM y RAM abundante, útil para prototipado y evaluación.
- Agentes con tool calling: la plantilla de chat corregida y el soporte de function calling permiten integrarlo en bucles de agente que consultan APIs o bases de datos.
- Evaluación de cuantizaciones: sirve como referencia para comparar fidelidad (KL frente a BF16) de distintas estrategias de cuantización en modelos MoE grandes.
- Generación asistida con imágenes: cargando un mmproj compatible (por ejemplo, el de bartowski en BF16) se habilita el pipeline image-text-to-text para tareas de descripción o extracción de información de capturas y documentos escaneados.
- Investigación en eficiencia de inferencia: útil para estudiar el comportamiento de MLA y MoE bajo cuantización agresiva en llama.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta divergencia KL media frente al modelo BF16, medida de forma homogénea sobre la revisión actual:

| Dominio | Primera release | 2026-11-04 | Actual | Cambio vs. primera |
|---|---|---|---|---|
| WikiText-2 test | 0,1983 | 0,1696 | 0,1579 | −6,9 % |
| Código fuente C++ | 0,0709 | 0,0623 | 0,0570 | −8,5 % |
| Open-Platypus, filas reservadas | 0,1178 | 0,0964 | 0,0887 | −8,0 % |

## Requisitos de hardware
- Tamaño del archivo: 52,07 GB (48,49 GiB) en dos partes; requiere al menos esa cantidad de VRAM o de VRAM + RAM para carga completa.
- Inferencia totalmente en GPU: necesita GPUs con 48 GB o más (A6000, A100 80GB, H100) o configuraciones multi-GPU.
- GPU de consumo: no cabe entero en una RTX 4090 (24 GB) ni en una RTX 3090; es viable con offloading parcial a RAM del sistema, con la penalización de latencia correspondiente.
- Configuración de referencia del autor: RTX 3090 + RTX 3070 Ti (46 GB de VRAM combinada) con 64 GB de RAM y SSD NVMe de 4 TB.
- Motor de despliegue: llama.cpp; el autor no reporta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Decodificación especulativa: no disponible en llama.cpp con la cabeza EAGLE de Mistral según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Mistral-Small-4-119B-2603-GSQ-RCO-GGUF (este) | 119B totales, 6,5B activos | 262.144 | Apache 2.0 | GGUF en dos partes, 52,07 GB |
| mistralai/Mistral-Small-4-119B-2603 (base) | 119B totales, 6,5B activos | 262.144 | Apache 2.0 | Pesos originales en BF16, incluye visión |
| mistralai/Mistral-Small-4-119B-2603-eagle | Cabeza draft EAGLE | no disponible | no disponible | Pesos separados para decodificación especulativa |
| bartowski/mistralai_Mistral-Small-4-119B-2603-GGUF | Misma base | 262.144 | Apache 2.0 | GGUF con mmproj BF16 incluido |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- No es una release oficial de Mistral AI ni del IST Austria; es una cuantización personal realizada en hardware doméstico, sin garantías de soporte.
- La cuantización a 3,501 bpw introduce degradación respecto a BF16, cuantificada en divergencia KL; no se han publicado evaluaciones de tareas que midan el impacto real.
- El archivo no incluye el proyector de visión; para uso multimodal hay que cargar un mmproj externo compatible.
- No incluye cabeza MTP y llama.cpp no carga la cabeza EAGLE de Mistral, por lo que no hay decodificación especulativa disponible.
- Idiomas soportados no documentados en esta ficha; el comportamiento multilingüe debe validarse empíricamente.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta cuantización.
- La plantilla de chat fue modificada respecto a la original de Mistral para corregir un fallo con `support_thinking`; conviene revisarla si se integra en pipelines propios.
- El repositorio supera los 150 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base mantiene esa licencia en la versión utilizada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Cabeza EAGLE de Mistral: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- GGUF de referencia con mmproj: https://huggingface.co/bartowski/mistralai_Mistral-Small-4-119B-2603-GGUF
- Release GSQ-RCO de referencia del ISTA DAS Lab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper GSQ (arXiv): https://arxiv.org/abs/2405.14852
- Referencias arXiv citadas en los tags: arxiv:2604.18556, arxiv:2605.00649

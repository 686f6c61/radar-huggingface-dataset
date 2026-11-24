# JANGQ-AI/GLM-5.3-Flash-JANGTQ2

## Resumen

GLM-5.3-Flash-JANGHT2.4 es una cuantización de altas prestaciones del modelo zai-org/GLM-5.3-Flash, publicada por JANGQ-AI. El modelo base es un MoE de clase 300B (321.300 millones de parámetros en origen, 288 expertos enrutados con top-8 más un experto compartido) que incorpora atención lineal KDA, atención dispersa y torres de visión y vídeo. Esta versión comprime el modelo hasta 91,57 GiB, lo que lo hace ejecutable en Macs de 128 GB mediante MLX sobre Apple Silicon.

La innovación principal del bundle es el formato JANGHT, una mezcla por capas de dos esquemas de cuantización (JANGT, un código de trellis de 2 a 3 bits por peso con rotación Hadamard-128, y JANGH, un libro de códigos Hadamard-32 de 2 a 4 bits redondeado con GPTQ), seleccionada empíricamente capa a capa. Los pesos no pertenecientes a expertos se mantienen en 8 bits y la torre de visión en bf16. El resultado promedia 2,4 bits por peso.

Es relevante ahora porque permite ejecutar localmente, en hardware de consumo de Apple, un modelo multimodal de razonamiento y uso de herramientas que de otro modo requeriría infraestructura de servidor. Incluye además un drafter de decodificación especulativa (DFlash2) que acelera la generación en texto de baja entropía como el código. Requiere una compilación de vMLX aún no publicada en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención lineal KDA, atención dispersa y torres de visión y vídeo (GLM-5.3-Flash) |
| Parametros totales | 321.300 millones (modelo base); 31.532.700.094 según safetensors del repo cuantizado |
| Parametros activos | 288 expertos enrutados con top-8 más experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANGHT (mezcla de JANGT trellis a 2/2,5/3 bits y JANGH Hadamard-32 a 2/3/4 bits con GPTQ); 8-bit MXFP8/affine para no expertos; bf16 para visión; media de 2,4 bits por peso |
| Idiomas soportados | inglés y chino (según model card); metadatos de Hugging Face indican solo `en` |
| Licencia | MIT |
| Formato de pesos | safetensors (librería MLX), bundle de 91,57 GiB; repo de 295,3 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con 288 expertos enrutados y enrutamiento top-8 más un experto compartido, combinada con atención lineal KDA y mecanismos de atención dispersa. Incorpora además torres específicas para procesamiento de visión y vídeo, lo que lo convierte en un modelo image-text-to-text. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La contribución técnica de esta ficha es el esquema de cuantización JANGHT, que asigna a cada capa de expertos el formato que minimiza el error medido: JANGT usa un código de trellis con rotación Hadamard-128 y estado de 12 bits, con variantes de 2, 2,5 y 3 bits por peso (la de 2,5 bits alterna transiciones de 6 y 4 bits). JANGH aplica un libro de códigos Hadamard-32 redondeado con GPTQ. El bundle incluye el drafter DFlash2 de z-lab, un modelo de difusión por bloques para decodificación especulativa sin pérdida. Se documenta una corrección de escalas de fila a ganancia unitaria que evita la supresión del token `</think>` en razonamientos largos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito con modo thinking y cierre autónomo del bloque de razonamiento.
- Comprensión de imágenes y vídeo mediante torres dedicadas (pipeline image-text-to-text).
- Uso de herramientas y function calling, con puntos de decisión entre llamar a herramienta o responder.
- Comportamiento agéntico y razonamiento multi-paso.
- Decodificación especulativa acelerada mediante el drafter DFlash2 incluido.
- Capacidades multilingües en inglés y chino.
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Asistente de código en local: el modelo puede generar y revisar código en un Mac de 128 GB, y el drafter DFlash2 acelera notablemente la generación en texto de baja entropía como el código fuente.
- Agentes con tool calling: las pruebas de fidelidad documentadas muestran que las decisiones de llamada a herramienta coinciden con el modelo bf16 en 50 de 50 puntos evaluados, lo que lo hace apto para orquestación de herramientas en flujos automatizados.
- Análisis de documentos con imágenes: al combinar torre de visión y contexto conversacional, puede procesar capturas, diagramas o páginas escaneadas y responder preguntas sobre ellas.
- Procesamiento de vídeo para resumen o descripción: la torre de vídeo permite tareas de comprensión temporal sin salir del entorno local.
- Razonamiento prolongado offline: el modo thinking con cierre corregido permite resolver problemas de varios pasos en entornos sin conectividad ni coste de API.
- Desarrollo y evaluación de cuantizaciones: investigadores pueden comparar fidelidad KL frente al modelo bf16 usando los conjuntos de evaluación documentados (95.025 posiciones, 123 secuencias).
- Prototipado de asistentes bilingües inglés-chino en escritorio, aprovechando el soporte declarado de ambos idiomas.

## Benchmarks y rendimiento

Fidelidad frente al modelo bf16 (123 secuencias retenidas, 95.025 posiciones con teacher forcing, KL top-128 renormalizada):

| Modelo | Expertos | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| Control bf16 | bf16 | 0,016 | 0,306 | — / — / 6,51 | 85,5% | 96,8% | — |
| GLM-5.3-Flash-JANGHT2.4 | JANGHT, 91,57 GiB | 0,251 | 1,391 | 4,31 / 7,21 / 13,32 | 65,7% | 84,9% | 88,6% |
| GLM-5.3-Flash-JANGH2 (rev. 2) | JANGH, 95,89 GiB | 0,297 | 1,574 | 5,02 / 8,06 / 14,29 | 63,7% | 83,5% | 87,2% |

Comparación previa frente a la referencia FP8 oficial (20 prompts cortos, 15.830 posiciones; JANGHT2.4 no fue evaluado en este conjunto):

| Bundle | Tamano | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| JANGH2 (rev. 2) | 95,89 GiB | 0,0301 | 0,376 | 0,98 / 1,97 / 5,24 | 83,9% | 96,8% | 98,3% |
| JANG affine (anterior) | 95,35 GiB | 0,0882 | 0,528 | 1,50 / 2,55 / 5,67 | 78,6% | 94,6% | 96,8% |
| orcarouter 2bit-lite | 95,4 GiB | 0,2122 | 0,83 | — | 71,4% | 90,8% | 94,3% |

Fidelidad agéntica frente a bf16 (72 conversaciones con herramientas, 25.867 posiciones; JANGHT2.4 no evaluado):

| Métrica | JANGH2 (rev. 2) | JANG affine |
|---|---|---|
| KL mediana vs bf16 | 0,579 | 0,595 |
| Acuerdo top-1 con bf16 | 57,3% | 54,9% |
| Decisiones de llamada idénticas a bf16 | 50 / 50 | 50 / 50 |
| P(`<tool_call>`) mediana en puntos de llamada (bf16: 0,998) | 0,999 | 0,981 |
| P(`<tool_call>`) mínima en punto de llamada | 0,914 | 0,784 |
| Decisiones de respuesta con mismo siguiente token | 87,5% | 50,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: el bundle ocupa 91,57 GiB, por lo que requiere un Mac con 128 GB de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX; no está pensado para GPU NVIDIA.
- No cabe en GPUs de consumo con memoria dedicada (RTX 4090, 24 GB) ni en configuraciones de 64 GB.
- Despliegue: exclusivamente mediante vMLX (build de desarrollo con soporte JANGHT) o MLX Studio; vLLM, llama.cpp, Ollama y TGI no soportan este formato.
- Latencia y throughput: no disponibles; la model card solo indica que el drafter DFlash2 acelera sustancialmente código y texto de baja entropía.
- Advertencia de runtime: vMLX 1.6.77 y anteriores rechazan cargar el bundle con error explícito; es necesario esperar la primera release con soporte JANGHT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-JANGHT2.4 | 321,3B (MoE, top-8) | no disponible | MLX safetensors, 91,57 GiB | MIT | Requiere vMLX no publicado |
| GLM-5.3-Flash-JANGH2 (rev. 2) | 321,3B (MoE, top-8) | no disponible | MLX safetensors, 95,89 GiB | MIT | vMLX publicado |
| GLM-5.3-Flash-JANG affine | 321,3B (MoE, top-8) | no disponible | MLX safetensors, 95,35 GiB | MIT | vMLX publicado |
| orcarouter GLM-5.3-Flash-MLX 2bit-lite | 321,3B (MoE, top-8) | no disponible | MLX safetensors, 95,4 GiB | no disponible | Disponible |

## Limitaciones y advertencias

- El runtime necesario (vMLX con soporte JANGHT) no está publicado; el modelo no es utilizable con las versiones actuales.
- La cuantización introduce degradación medible: KL mediana de 0,251 y acuerdo top-1 del 65,7% frente a bf16 en el conjunto difícil de 95.025 posiciones.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de veracidad.
- Idiomas limitados a inglés y chino; los metadatos de Hugging Face solo declaran inglés.
- Longitud de contexto no documentada en la información disponible.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash.
- El repositorio cambió de nombre el 2026-10-10 (antes JANGQ-AI/GLM-5.3-Flash-JANGH2); los enlaces antiguos redirigen.
- Los pesos anteriores compatibles con vMLX publicado están en el commit `4017296` del historial del repo.
- El modelo está pensado exclusivamente para Apple Silicon; no hay ruta de despliegue en servidores x86 con GPU.

## Enlaces

- Hugging Face: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGHT2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio previo (JANGHT2.4): https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGHT2.4
- Commit con pesos JANGH2 compatibles: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGHT2.4/tree/4017296adf8c15c49c4743e6c646b89a2eb55673
- MLX Studio: https://mlx.studio
- vMLX: https://vmlx.net
- Perfil del autor: https://huggingface.co/JANGQ-AI

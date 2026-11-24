# FardoX/Phi-3-mini-4k-instruct-CAN

## Resumen

Phi-3-mini-4k-instruct-CAN es un artefacto de investigación publicado por el usuario FardoX que contiene pesos cuantizados a aproximadamente 2 bits del modelo microsoft/Phi-3-mini-4k-instruct (3.821 millones de parámetros). No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización post-entrenamiento (PTQ) seguida de una breve destilación de conocimiento (KD) contra el modelo original en FP16, empleando un cuantizador aditivo de libros de códigos denominado CAN (additive codebook quantizer). El objetivo es reducir el peso del modelo de 7,6 GB en FP16 a entre 0,97 GB y 1,32 GB manteniendo una perplejidad razonable.

La relevancia del artefacto es doble. Por un lado, demuestra que una cuantización de 2 bits con rotación Hadamard por bloques y cuatro libros de códigos de 16 entradas puede superar a AQLM en WikiText-2 (8,10 frente a 8,85 de perplejidad) y empatar en C4 (12,17 frente a 12,19), aunque queda por detrás de PV-Tuning (6,88 / 10,08). Por otro, incluye un parche para llama.cpp que añade los tipos CAN128 y CAN96 y habilita el plegado Hadamard para la arquitectura phi3, con lo que el modelo puede ejecutarse en CPU sin GPU.

El autor es explícito sobre las limitaciones: no es un lanzamiento oficial de Microsoft, los números provienen de una sola ejecución sin intervalos de confianza y las cifras de los competidores están copiadas de los papers, no reproducidas. La licencia MIT del modelo base se mantiene sobre estos pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini), cuantizado con CAN (additive codebook quantization) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Phi-3-mini-4k-instruct) |
| Tipos de cuantizacion | CAN-128 (config A) y CAN-96/CAN-128 (config B); ~2,03 bits/peso en capas lineales, 2,75 bits/peso en el archivo completo (A) y 2,02 bits/peso (B) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (dos archivos) y parche `can3_phi3.patch` para llama.cpp |
| Tamano de archivo | 1,32 GB (config A), 0,97 GB (config B) |
| Revision del modelo base | `ff07dc01615f8113924aed013115ab2abd32115b` (previa a la actualización de pesos de julio de 2024) |
| Requiere parche | Si, llama.cpp con `can3_phi3.patch` (solo CPU) |

## Arquitectura y entrenamiento

El modelo base es Phi-3-mini-4k-instruct, un transformer decoder-only de 3.821 millones de parámetros con contexto de 4096 tokens y atención con ventana deslizante por defecto de 2047. La contribución de este repositorio no modifica la arquitectura, sino el esquema de compresión. CAN rota los pesos mediante una transformada de Hadamard por bloques de 512 con signos aleatorios; cada grupo de 8 pesos se representa como la suma de 4 palabras de código, una de cada uno de 4 libros de 16 entradas (int8 con factor fp32), lo que da 4 nibbles por grupo. Se almacena una escala fp16 por fila y por cada 512 columnas.

Tras la cuantización post-entrenamiento se aplica una destilación de conocimiento breve contra el modelo FP16 que ajusta escalas, libros de códigos y normas, manteniendo los códigos fijos y sin paso discreto. Los datos de calibración y destilación mezclan aproximadamente un 20 % de texto general (mitad WikiText-2 train, mitad C4 train) y un 80 % de texto generado por el Phi-3 FP16, además de texto generado por otro modelo en la calibración PTQ. La configuración A mantiene embedding y cabeza LM en bf16, como hacen AQLM y PV-Tuning; la configuración B cuantiza también la cabeza LM (CAN-128) y el embedding (CAN-96, 3 nibbles).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Phi-3-mini-4k-instruct.
- Razonamiento de sentido común, matemáticas básicas y generación de código, en la medida en que lo conserva la cuantización a 2 bits (el autor no reporta evaluaciones de tareas downstream).
- Soporte de instrucciones y formato chat del modelo original (pipeline `text-generation`, tag `conversational`).
- Ejecución en CPU mediante llama.cpp con el parche incluido, sin necesidad de GPU.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No se documentan tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en entornos con memoria muy restringida: la configuración B ocupa 0,97 GB, lo que permite cargar el modelo en dispositivos con menos de 1 GB de RAM libre para pesos, útil en placas SBC, routers o contenedores con límites estrictos de memoria.
- Inferencia en CPU sin GPU: el parche de llama.cpp habilita los tipos CAN128/CAN96 y el plegado Hadamard para `phi3`, de modo que un servidor sin acelerador puede generar texto a 15,8-18,1 t/s (tg128) en un Xeon a 2,20 GHz con 4 vCPU, frente a 7,1-7,8 t/s de Q4_0 en la misma máquina.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para comparar CAN contra AQLM, PV-Tuning, Q4_0 e IQ2_XXS en el protocolo WikiText-2/C4 con contexto 4096, gracias a los archivos GGUF y al parche publicados.
- Pruebas de integridad de pipelines llama.cpp: los valores de perplejidad corta (`llama-perplexity -c 2048 --chunks 8`) permiten validar que una compilación con el parche produce resultados coherentes (config A: 6,95 ± 0,18; Q4_0: 5,43 ± 0,15).
- Prototipado de asistentes conversacionales en inglés en hardware de bajo consumo, aceptando la pérdida de calidad respecto al FP16 (perplejidad WikiText-2 de 8,10 frente a 5,83).
- Evaluación de la degradación por cuantización en tareas de instrucciones: al conservar el chat template y el tokenizador del modelo base, se puede medir la caída de calidad en diálogo multirritmo sin cambiar el código de aplicación, solo el archivo de pesos.

## Benchmarks y rendimiento

Perplejidad en el protocolo AQLM/PV-Tuning (contexto 4096, ventanas no solapadas, WikiText-2 test y C4 validación con 256 ventanas aleatorias, semilla 0, atención sdpa, ventana deslizante 2047):

| Modelo | bits/peso (paper) | bits/peso (modelo completo) | WikiText-2 | C4 | Fuente |
|---|---|---|---|---|---|
| FP16 | 16 | 16 | 5,83 | 9,35 | medido aquí (publicado: 5,83 / 9,35) |
| PV-Tuning | ~2,03 | n/a | 6,88 | 10,08 | publicado (arXiv 2405.14852, Tabla 2), no reproducido |
| CAN-128 + KD, config A | 2,031 | 2,753 | 8,10 | 12,17 | medido aquí |
| AQLM | ~2,03 | n/a | 8,85 | 12,19 | publicado (arXiv 2405.14852, Tabla 2), no reproducido |
| CAN + KD, config B | 2,031 | 2,020 | 8,63 | 12,91 | medido aquí |
| CAN-128 PTQ solo, config A | 2,031 | 2,753 | 9,91 | 14,77 | medido aquí |
| CAN PTQ solo, config B | 2,031 | 2,020 | 10,80 | 16,19 | medido aquí |

Velocidad en CPU (llama.cpp con el parche, Kaggle CPU VM Intel Xeon a 2,20 GHz, 4 vCPU, `llama-bench -ngl 0 -p 512 -n 128 -r 5 -t 4`, mediana de 3 pasadas en orden rotado):

| Modelo | Archivo | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|
| CAN config A | 1,32 GB | 26,9 [26,7-27,1] | 15,8 [13,6-15,8] |
| Q4_0 (`--pure`) | 2,15 GB | 13,6 [13,5-13,6] | 7,1 [7,1-7,1] |
| Ratio CAN / Q4_0 | 0,61× tamano | 1,98× | 2,2× [1,9-2,2] |
| CAN config B | 0,97 GB | 28,2 [27,1-28,8] | 18,1 [18,05-18,13] |
| Q4_0 (`--pure`) | 2,15 GB | 16,1 [15,4-16,1] | 7,8 [7,76-7,79] |
| Ratio CAN-B / Q4_0 | 0,45× tamano | 1,75× | 2,3× |

Perplejidad corta de integridad (WikiText-2 test, `llama-perplexity -c 2048 --chunks 8`, protocolo distinto al del paper): config A 6,95 ± 0,18; Q4_0 5,43 ± 0,15; IQ2_XXS 10,55 ± 0,29; config B 7,33 ± 0,20.

## Requisitos de hardware

- VRAM/RAM para pesos: 1,32 GB (config A) o 0,97 GB (config B) en disco; en memoria, añadir el overhead del contexto y del runtime de llama.cpp (típicamente varios cientos de MB adicionales según longitud de contexto).
- GPU: no se requieren; el parche `can3_phi3.patch` es solo CPU según la model card. No se documenta soporte CUDA para los tipos CAN128/CAN96.
- Cabe en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090, etc.) siempre que se ejecute en CPU o se porte el kernel; no hay datos de despliegue en GPU.
- Despliegue: llama.cpp con el parche aplicado. No se mencionan vLLM, TGI, Ollama ni otras plataformas en la información disponible.
- Latencia y throughput medidos en CPU Xeon a 2,20 GHz con 4 vCPU: pp512 de 26,9-28,2 t/s y tg128 de 15,8-18,1 t/s para CAN, frente a 13,6-16,1 t/s y 7,1-7,8 t/s para Q4_0 en la misma máquina.
- Almacenamiento: 1,32 GB (A) y 0,97 GB (B); el repo completo ocupa 2,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | WikiText-2 (PPL) | C4 (PPL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct-CAN (config A) | 3,82 B | 4096 | CAN-128 + KD, 2,03 bits/peso (paper) | 8,10 | 12,17 | MIT | GGUF + parche llama.cpp |
| Phi-3-mini-4k-instruct-CAN (config B) | 3,82 B | 4096 | CAN + KD, 2,03 bits/peso (paper), 2,02 completo | 8,63 | 12,91 | MIT | GGUF + parche llama.cpp |
| AQLM (sobre Phi-3-mini, según paper) | 3,82 B | 4096 | AQLM ~2,03 bits/peso | 8,85 | 12,19 | MIT (modelo base) | publicado en paper, no en este repo |
| PV-Tuning (sobre Phi-3-mini, según paper) | 3,82 B | 4096 | PV-Tuning ~2,03 bits/peso | 6,88 | 10,08 | MIT (modelo base) | publicado en paper, no en este repo |
| Phi-3-mini-4k-instruct FP16 | 3,82 B | 4096 | 16 bits | 5,83 | 9,35 | MIT | Hugging Face (Microsoft) |
| Q4_0 (misma base, llama.cpp) | 3,82 B | 4096 | 4 bits, 2,15 GB | 5,43 (perplejidad corta, no comparable) | no disponible | MIT | llama.cpp estándar |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Microsoft y no está respaldado por Microsoft; es un trabajo derivado publicado por un tercero.
- Calidad claramente inferior al FP16: perplejidad WikiText-2 de 8,10 (config A) frente a 5,83, y C4 de 12,17 frente a 9,35. No es una afirmación de estado del arte; queda por detrás de PV-Tuning (6,88 / 10,08).
- Los números provienen de una sola ejecución, sin semillas repetidas ni intervalos de confianza; diferencias inferiores al ~1 % de perplejidad no deben interpretarse como reales.
- Las cifras de AQLM y PV-Tuning están copiadas de los papers, no reproducidas; la única verificación cruzada del harness es que el FP16 coincide con lo publicado dentro del 0,05 %.
- Fuga potencial en la evaluación: aproximadamente el 20 % de los tokens de destilación son texto general, mitad WikiText-2 train y mitad C4 train, el mismo dominio que los conjuntos de test; la calibración PTQ también mezcla C4/WikiText-2 train.
- El parche de llama.cpp es solo para CPU; no hay soporte documentado de GPU para los tipos CAN128/CAN96.
- Idioma limitado al inglés; no se documentan capacidades multilingües.
- Contexto limitado a 4096 tokens y ventana deslizante por defecto de 2047, lo que restringe casos de uso con documentos largos.
- Riesgo de alucinación y sesgos heredados del modelo base Phi-3-mini, agravados por la cuantización a 2 bits; no se han publicado evaluaciones de sesgo ni de tareas downstream en este repositorio.
- La licencia MIT del modelo base se aplica a estos pesos derivados, pero el usuario debe conservar el aviso de copyright de Microsoft Corporation y el texto de `LICENSE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de los archivos ni de los hashes más allá de los sha256 publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FardoX/Phi-3-mini-4k-instruct-CAN
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper de PV-Tuning (referencia de comparación): https://arxiv.org/abs/2405.14852
- Repositorio llama.cpp (necesario para aplicar `can3_phi3.patch`): https://github.com/ggerganov/llama.cpp
- Paper de AQLM (referencia de comparación): no disponible en la información proporcionada

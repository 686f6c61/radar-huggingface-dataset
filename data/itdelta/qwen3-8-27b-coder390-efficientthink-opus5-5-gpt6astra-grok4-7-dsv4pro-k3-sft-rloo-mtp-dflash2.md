# ItDelta/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2

## Resumen

Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 es un modelo de 27.320 millones de parámetros publicado por el usuario ItDelta en Hugging Face. Se trata de un post-entrenamiento comunitario sobre el modelo nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2, que a su vez parte del Qwen3.8-27B oficial de Qwen. Su objetivo principal es resolver un problema concreto del modelo base: la tendencia a no detener la generación, re-derivando respuestas hasta agotar la ventana de contexto de 94K tokens sin emitir respuesta final.

Para lograrlo, el autor aplicó varias rondas alternas de SFT y RLOO (Reinforce Leave-One-Out) con datos de trayectorias de profesores, usando recompensas que penalizan respuestas vacías y truncamientos sin suprimir el razonamiento largo necesario. El resultado, según la model card, reduce los truncamientos a 94K de 4 a 1 en GPQA y de 13 a 3 en LCB, sin regresiones en ninguna suite. El repositorio incluye múltiples niveles de cuantización (BF16, FP8, NVFP4, INT8, INT4 y GGUF), soporte multimodal (texto e imagen/vídeo), una cabeza MTP en BF16 y un borrador DFlash2 para decodificación especulativa, alcanzando unos 180 tok/s por petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), multimodal (texto + imagen/vídeo); no disponible si es MoE o denso |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 94K tokens (límite de truncamiento mencionado en la model card) |
| Tipos de cuantizacion | BF16, FP8 estático Block128, NVFP4 W4A16, NVFP4 W4A4, NVFP4 W4A4-W8A8 (mixta), INT4 W4A16, INT8 W8A8, INT8 W8A16, GGUF Q2/Q3/Q4 LynnStyle, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B oficial (arquitectura transformer de la familia Qwen3.8, con soporte multimodal texto + imagen/vídeo) ya post-entrenado con SFT y SimPO por el autor nerkyor. Sobre esa base EfficientThink, ItDelta aplicó un pipeline de varias etapas: una continuación SFT (K3), otra ronda SFT (week2dose, update-225), una primera ronda de RLOO con 182 grupos, una ronda SFT adicional (merge-sft-100) y una segunda ronda de RLOO con 172 grupos. Los datos de profesores provienen de trayectorias atribuidas en el nombre del modelo a Opus5.5, GPT6Astra, DSV4Pro y K3, con Grok4.7 como verificador y filtrador de datos.

El esquema de recompensas de RLOO es el núcleo de la innovación: se muestrean 8 trayectorias por problema y solo se conservan grupos mixtos (con respuestas correctas e incorrectas). Las penalizaciones escalan con la longitud de las trayectorias incorrectas (de −0,2 para respuestas cortas erróneas hasta −1,0 para respuestas vacías), mientras que el razonamiento largo pero correcto mantiene recompensa positiva (+1,0), evitando suprimir el pensamiento extenso necesario. El conjunto final de la segunda ronda RLOO consta de 172 grupos y 1.376 trayectorias (859 correctas y 517 incorrectas, incluidas 68 respuestas vacías). Además, el repositorio incorpora una cabeza MTP (multi-token prediction) en BF16 y un borrador DFlash2 para decodificación especulativa, ambas opciones mutuamente excluyentes entre sí.

## Capacidades

- Generación de texto y razonamiento con modo "EfficientThink": razonamiento largo cuando es necesario, pero con terminación fiable de la cadena de pensamiento.
- Programación reforzada (componente "Coder" del nombre), evaluada con LiveCodeBench (LCB 90/100 según el autor).
- Resolución de problemas de ciencia y razonamiento académico (GPQA 178/198, MMLU 450/500 según el autor).
- Multimodalidad: entrada de texto e imagen/vídeo (pipeline image-text-to-text).
- Decodificación especulativa mediante MTP (≈91 tok/s por petición) o DFlash2 (≈180 tok/s por petición).
- Despliegue sin parches en SGLang en todos los niveles de cuantización; FP8 probado también en vLLM; GGUF compatible con llama.cpp con MTP integrado.
- Modelo sin restricciones de alineación ("uncensored"), heredado del modelo base.

## Casos de uso

- Razonamiento académico y científico de alto nivel: el modelo resuelve preguntas tipo GPQA manteniendo el razonamiento largo necesario pero terminando con una respuesta final, ideal para pipelines de verificación de conocimiento en dominios STEM.
- Generación y depuración de código: con el componente "Coder" reforzado y 90/100 en LiveCodeBench, es adecuado para asistentes de programación que requieren razonamiento extenso sobre algoritmos complejos.
- Agentes con presupuestos de tokens ajustados: al reducir drásticamente los truncamientos a 94K, el modelo es más predecible en sistemas agénticos donde una respuesta vacía rompe el flujo de ejecución.
- Despliegue en producción de alta latencia sensible: la decodificación especulativa DFlash2 (≈180 tok/s por petición frente a ≈46 tok/s sin especulación) permite servir respuestas de razonamiento largo con latencias mucho menores.
- Análisis de imágenes y vídeo con razonamiento: al ser multimodal, puede integrarse en flujos que combinen comprensión visual con razonamiento textual detallado.
- Despliegue local en hardware variado: la amplia gama de cuantizaciones (desde GGUF Q2 hasta BF16) permite ejecutarlo desde estaciones con GPU de consumo hasta servidores multi-GPU.
- Procesamiento bilingüe inglés-chino: los dos idiomas oficiales del modelo permiten aplicaciones en ambos mercados con el mismo despliegue.

## Benchmarks y rendimiento

Datos publicados por el autor de la model card (suites completas, protocolo de 100K tokens). GPQA: 198 preguntas, MMLU: 500 preguntas, LCB: 100 problemas.

| Modelo | GPQA | MMLU | LCB | Truncamientos 94K (GPQA) | Truncamientos 94K (LCB) |
|---|---|---|---|---|---|
| Qwen3.8-27B original (FP8) | 177/198 | 444/500 | 83/100 | 4 | 13 |
| Base EfficientThink (SFT + SimPO110) | 171/198 | 442/500 | 89/100 | no disponible | no disponible |
| sft-base-rloo (etapa intermedia) | 177/198 | 448/500 | 90/100 | no disponible | no disponible |
| Coder390 (FP8 dinámico) | 178/198 | 445/500 | 90/100 | 1 | 3 |
| Coder390 (FP8 estático) | 178/198 | 450/500 | 90/100 | 1 | 3 |

El autor además afirma que la cuantización es "lossless" en la práctica: GPQA y LCB arrojan resultados idénticos en BF16, FP8 dinámico y FP8 estático. No hay comparación independiente con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 55 GB solo de pesos (27,3 mil millones de parámetros × 2 bytes), más KV cache; requiere al menos una A100/H100 de 80 GB o 2× RTX 4090 (48 GB combinados) con ajustes.
- FP8 estático: aproximadamente 27-28 GB de pesos, viable en una RTX 4090 (24 GB) solo con offloading; más realista en A100/H100 o RTX 5090 (32 GB).
- NVFP4 e INT4: aproximadamente 14-16 GB de pesos, cabe en una RTX 4090 o RTX 3090 de 24 GB con margen para contexto.
- GGUF Q4: aproximadamente 15-17 GB; GGUF Q2: aproximadamente 9-11 GB, ejecutable en GPU de consumo de 12-16 GB o incluso en CPU con RAM suficiente.
- GPUs recomendadas: H100 y A100 para FP8/BF16 con serving concurrente; RTX 4090/5090 para NVFP4, INT4 y GGUF Q4-Q6.
- Opciones de despliegue: SGLang (todos los niveles, sin parches), vLLM (FP8 probado; INT4 W4A16 con texto + imagen), llama.cpp y NInfer para GGUF, con MTP integrado en los paquetes GGUF.
- Throughput: ≈46 tok/s por petición sin especulación, ≈91 tok/s con MTP y ≈180 tok/s con DFlash2, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Decodificación especulativa |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390 (este modelo) | 27,3B | 94K | Sí (imagen/vídeo) | Apache 2.0 | MTP y DFlash2 |
| Qwen3.8-27B (base oficial) | 27,3B | 94K | Sí | Apache 2.0 | MTP (BF16 oficial) |
| Qwen3.8-27B-EfficientThink (base de nerkyor) | 27,3B | 94K | Sí | Apache 2.0 | MTP / DFlash2 |

Comparativas con modelos de otros fabricantes de tamaño similar: no disponible (la model card no incluye benchmarks de terceros y no deben inventarse cifras).

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored": carece de las salvaguardas de alineación del modelo oficial, lo que supone un riesgo significativo de generación de contenido nocivo en producción.
- Todos los datos de rendimiento provienen del propio autor, evaluados con un protocolo propio de 100K tokens; no hay verificación independiente ni comparación con suites estándar de terceros.
- Los idiomas soportados oficialmente son solo inglés y chino; el rendimiento en castellano no está documentado.
- Es un modelo derivado de una cadena larga de post-entrenamientos comunitarios (SFT, SimPO, dos rondas RLOO, múltiples merges), lo que puede introducir degradaciones difíciles de rastrear frente al modelo oficial.
- Las dos opciones de decodificación especulativa (MTP y DFlash2) son mutuamente excluyentes; debe elegirse una en el despliegue.
- El riesgo de alucinación no se evalúa en la model card; las suites publicadas (GPQA, MMLU, LCB) no miden fiabilidad factual en generación abierta.
- Aunque la licencia Apache 2.0 permite uso comercial, los nombres del modelo incorporan referencias a marcas comerciales de otros modelos (Opus, GPT, Grok, DeepSeek, Kimi), que describen el origen de los datos de entrenamiento y no implican respaldo de sus creadores.
- La mejora principal (reducción de truncamientos) está medida en GPQA y LCB; su comportamiento en otros dominios (código abierto, conversación, multimodal) no está cuantificado.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/ItDelta/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base (nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- GGUF / GGUF-NInfer (Hugging Face): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF / GGUF-NInfer (ModelScope): https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer (Hugging Face): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer (ModelScope): https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- Modelo oficial Qwen3.8-27B (referenciado en la model card): https://huggingface.co/Qwen/Qwen3.8-27B

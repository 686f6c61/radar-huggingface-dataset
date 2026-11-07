# nchapman/Qwen3.5-4B-W4A16-HGPTQ

## Resumen

Qwen3.5-4B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario nchapman. Emplea una técnica denominada HGPTQ (Hadamard + Cholesky GPTQ) con esquema W4A16 y tamaño de grupo 64, aplicada de forma conjunta sobre las capas lineales de texto, del módulo de predicción multi-token (MTP) nativo y del codificador visual. El resultado es un checkpoint de 3,21 GiB frente a los 8,68 GiB del modelo base en BF16, lo que supone una compresión de 2,71 veces.

El modelo base Qwen3.5-4B es un transformer híbrido de atención completa y GatedDeltaNet con 32 bloques, capacidades de imagen-a-texto y un cabezal MTP para decodificación especulativa. Esta cuantización preserva el pipeline image-text-to-text y está pensada para servir el modelo con vLLM mediante kernels INT4 de compressed-tensors, incluyendo la transformada Hadamard en tiempo de ejecución sobre las activaciones de entrada.

La relevancia de esta ficha radica en que documenta una cuantización integral (texto, visión y MTP) con métricas de degradación medidas frente al BF16, algo poco habitual en publicaciones de este tipo. La licencia Apache 2.0 del modelo base se mantiene, y el checkpoint es compatible con endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 bloques con GatedDeltaNet y atención completa, más ViT de 24 bloques y cabezal MTP nativo |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, group size 64, GPTQ con rotación Hadamard y Cholesky; pesos en INT4, activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B combina 32 bloques híbridos que alternan GatedDeltaNet con atención completa, un codificador visual ViT de 24 bloques con `intermediate_size=4096` y dos proyecciones de fusión espacial, y un módulo MTP nativo para decodificación especulativa. La cuantización cubre 305 capas lineales: 200 de lenguaje, 7 del MTP y 98 de visión. Se mantienen en BF16 las embeddings, el `lm_head`, las proyecciones `in_proj_a` e `in_proj_b` de la atención lineal, `mtp.fc`, el `patch_embed` visual, las normalizaciones y los sesgos.

La innovación técnica principal es la rotación Hadamard en línea. Los pesos se pre-rotan fuera de línea mediante la matriz de Sylvester-Walsh de 64×64 ($W' = W H_{64} / \sqrt{64}$) antes de aplicar GPTQ con descomposición de Cholesky, y en tiempo de ejecución se aplica la misma transformada a las activaciones de entrada antes de la GEMM W4A16. Como la matriz es determinista (`randomize: false`), no se almacenan pesos de transformación adicionales en el safetensors. El calibrado y la evaluación se realizaron con conjuntos que cubren chat, matemáticas, ciencia, código, uso de herramientas y multilingüismo.

## Capacidades

- Generación de texto conversacional con configuración de muestreo por defecto de temperatura 1.0, top_p 0.95 y top_k 20.
- Razonamiento matemático y científico, según la composición del conjunto de calibración y evaluación.
- Generación de código y uso de herramientas (tool use), incluido en el conjunto de evaluación de perplejidad.
- Procesamiento de imagen a texto: VQA, gráficos, documentos y OCR.
- Comprensión de interfaces y pantallas (ScreenSpot) y OCR matemático.
- Decodificación especulativa mediante el módulo MTP nativo, con un 93,47 % de Top-1 en el drafter aislado.
- Capacidades multilingües evaluadas en el holdout general y multilingüe.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Extracción de datos de documentos: el modelo puede procesar facturas, formularios e informes escaneados combinando OCR y VQA, con una similitud coseno de 0,9798 frente al BF16 en el conjunto de documentos y OCR.
- Automatización de interfaces y RPA: la capacidad de ScreenSpot permite localizar elementos en capturas de pantalla para agentes que operan sobre aplicaciones de escritorio o web, con un 98,52 % de Top-1 en el conjunto de UI.
- Asistente conversacional multilingüe: el checkpoint mantiene una perplejidad de 12,5282 frente a 12,2886 del BF16 en el holdout general y multilingüe, lo que lo hace apto para atención al cliente en varios idiomas.
- Generación de código asistida: la evaluación de perplejidad incluye código y uso de herramientas, y el formato compressed-tensors permite integrarlo en vLLM para servir completaciones en un IDE o en un pipeline de CI/CD.
- Despliegue en GPU de consumo: con 3,21 GiB de pesos, cabe holgadamente en tarjetas de 8 GB o 12 GB, dejando espacio para caché KV en contextos largos.
- Servicio de inferencia de bajo coste con decodificación especulativa: el módulo MTP conserva un 84,74 % de Top-1 end-to-end, lo que permite acelerar la generación en vLLM sin un modelo drafter separado.
- Análisis de gráficos y tablas en informes financieros: la evaluación de VQA sobre gráficos mantiene un 99,67 % de Top-1, adecuado para pipelines de extracción de series temporales o KPIs.

## Benchmarks y rendimiento

| Evaluación | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamaño safetensors | 8,68 GiB | 3,21 GiB | Compresión 2,71× |
| Perplejidad texto (378 prompts, 840k tokens) | 4,0299 | 4,1446 (+2,85 %) | Chat, matemáticas, ciencia, código, tool use, multilingüe |
| Divergencia KL texto (ponderada / media por token) | 0,0000 | 0,0949 / 0,2540 | KL en FP32 sobre vocabulario completo |
| Perplejidad holdout general y multilingüe (76 prompts, 20k tokens) | 12,2886 | 12,5282 (+1,95 %) | KL media por token 0,0633 |
| MTP drafter (11.583 posiciones) | 100,0 % Top-1 (NLL 2,2029) | 93,47 % Top-1 (NLL 2,2230) | Top-1 end-to-end 84,74 %, KL 0,2068 |
| Visión VQA, gráficos, documentos y OCR (96 imágenes) | 1,0000 cos sim, 100,0 % Top-1 | 0,9798 cos sim, 99,67 % Top-1 | Top-1 end-to-end 92,72 %, KL 0,0825 |
| Visión UI y OCR matemático (48 imágenes) | 1,0000 cos sim, 100,0 % Top-1 | 0,9840 cos sim, 98,52 % Top-1 | Top-1 end-to-end 97,04 %, KL 0,0315 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para los pesos en INT4, más caché KV y activaciones; el repo ocupa 3,5 GB.
- GPU recomendadas: NVIDIA Ampere o superior para los kernels INT4 de vLLM; A100, H100 y L40S son adecuadas para producción.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070) y 24 GB (RTX 4090).
- Opciones de despliegue: vLLM con compressed-tensors y transformada Hadamard en línea; transformers como fallback. llama.cpp y Ollama no están indicados en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP puede reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-W4A16-HGPTQ | 4.539 M | no disponible | W4A16 HGPTQ | Apache 2.0 | Hugging Face |
| nchapman/Qwen3.5-4B-W4A16-GPTQ | 4.539 M (base) | no disponible | INT4 weight-only, llm-compressor | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (BF16) | 4.539 M | no disponible | BF16 | Apache 2.0 | Hugging Face |

La variante W4A16-GPTQ del mismo autor emplea cuantización INT4 weight-only con llm-compressor y kernels Marlin, con un tamaño de 3,8 GB, ligeramente mayor que los 3,21 GiB de esta versión HGPTQ. El modelo base en BF16 ocupa 8,68 GiB y sirve como referencia de calidad. No se dispone de datos de benchmarks comparativos entre las tres variantes más allá de las métricas de perplejidad y divergencia KL ya mostradas.

## Limitaciones y advertencias

- La perplejidad de texto aumenta un 2,85 % y la del holdout multilingüe un 1,95 % respecto al BF16, lo que puede traducirse en una ligera pérdida de precisión en tareas generativas.
- El drafter MTP pierde un 6,53 % de Top-1 aislado y un 15,26 % end-to-end, lo que reduce la tasa de aceptación en decodificación especulativa y, por tanto, la aceleración efectiva.
- La similitud coseno en visión baja a 0,9798 y 0,9840, con un Top-1 end-to-end del 92,72 % en documentos y OCR, lo que puede afectar a tareas de extracción de alta precisión.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Qwen3.5-4B.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente al modelo base y puede verse ligeramente agravado por la cuantización.
- Idiomas soportados: no disponibles de forma explícita, aunque la evaluación incluye un holdout multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Requiere kernels y transformada Hadamard en línea compatibles con compressed-tensors; no se garantiza su funcionamiento en todos los backends de inferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante GPTQ del mismo autor: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-GPTQ

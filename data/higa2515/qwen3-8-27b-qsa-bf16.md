# higa2515/Qwen3.8-27B-QSA-BF16

## Resumen

Qwen3.8-27B-QSA-MM2-BF16 es una conversión de investigación publicada por el usuario higa2515 sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: los 18 shards originales del backbone, el codificador visual y el módulo MTP se mantienen byte a byte idénticos al checkpoint oficial, y la modificación consiste en añadir 52.434.944 parámetros FP32 de indexación (QSA, *Query Sparse Attention*) sobre las 16 capas de atención completa. Las otras 48 capas del decodificador conservan la arquitectura Gated DeltaNet original.

El modelo tiene 27.833.862.896 parámetros totales en BF16, un repositorio de 56 GB y se distribuye con licencia Apache-2.0. Su pipeline declarado es `image-text-to-text`, por lo que cubre entrada multimodal de imagen y vídeo además de texto. La relevancia de esta ficha es doble: por un lado documenta un experimento de atención dispersa aplicada a un transformer híbrido de gran tamaño; por otro, advierte de que el wrapper de Transformers incluido es solo una referencia de corrección y de que el despliegue real requiere un motor llama.cpp modificado publicado aparte.

Es importante subrayar que el autor no reporta mejoras de calidad: la evaluación en BF16 sobre 32.766 tokens da una perplejidad densa de 7,072960 frente a 7,071384 en la ruta dispersa, una diferencia que el propio autor califica de no concluyente. La model card es explícita sobre los límites de verificación en contexto largo y sobre el hecho de que QSA no comprime la caché KV.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas con Gated DeltaNet y 16 capas de atención completa con indexadores QSA añadidos; codificador visual y módulo MTP incluidos |
| Parámetros totales | 27.833.862.896 (BF16), de los cuales 52.434.944 son parámetros FP32 de indexación QSA |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | hasta 262.144 tokens según la model card; verificación multimodal limitada hasta 64k y razonamiento en contexto largo no verificado |
| Tipos de cuantización | BF16 en este repositorio; existe una release GGUF separada (Qwen3.8-27B-QSA-MM2-GGUF) con motor llama.cpp propio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos originales y añadidos QSA); el código nativo de llama.cpp mantiene MIT |
| Formato de pesos | safetensors (BF16) con código custom (`trust_remote_code=True`); GGUF en la release alternativa |

## Arquitectura y entrenamiento

La arquitectura parte del Qwen3.8-27B original, un transformer híbrido en el que la mayor parte de las capas (48) usan Gated DeltaNet, un mecanismo de estado recurrente lineal, mientras que 16 capas emplean atención completa. Sobre esas 16 capas el autor inserta indexadores QSA que implementan atención dispersa por bloques: QSA opera con bloques de cuatro tokens y una ventana fija K=2.048 más el bloque actual. El 12,5% que cita la model card corresponde a la proporción de claves atendidas a 16k de contexto, no a una ratio constante en todas las longitudes. Todos los pares KV originales se conservan, de modo que no hay compresión de caché.

El único componente entrenado es el checkpoint `mm2_16k/qsa_indexers.pt`, procedente del repositorio higa2515/qwen38-27b-qsa-indexers, entrenado durante 300 pasos con longitud 16.384, una mezcla multimodal del 50% y tareas sintéticas de OCR, tablas y formas geométricas. No se entrenó ningún peso del backbone, del codificador visual, del proyector ni del MTP. La model card incluye el snapshot del código de entrenamiento y el checkpoint original bajo `research/` e `indexers/`, lo que facilita la reproducibilidad.

Hay dos rutas de ejecución diferenciadas. El wrapper de Transformers de este repositorio es una referencia de corrección: el texto usa máscara SDPA, las conversaciones con imagen y vídeo usan atención densa y la ejecución MTP no está implementada, por lo que no ofrece la velocidad de los kernels dispersos nativos. La release GGUF emplea un motor llama.cpp modificado con QSA nativo para texto, imagen y vídeo, M-RoPE, MTP con hasta dos tokens de borrador y reutilización de prefix-cache; llama.cpp estándar no soporta estos ficheros QSA.

## Capacidades

- Generación de texto conversacional multi-turno sobre el backbone Qwen3.8-27B.
- Comprensión de imagen y vídeo mediante el codificador visual y el proyector originales, con pipeline `image-text-to-text`.
- Tareas de OCR, análisis de tablas y reconocimiento de formas, reforzadas en el entrenamiento sintético de los indexadores.
- Ejecución con MTP (multi-token prediction) de hasta dos tokens de borrador, únicamente en el motor llama.cpp nativo.
- Reutilización de prefix-cache en la ruta nativa, útil para prompts largos repetidos.
- Atención dispersa QSA en texto, imagen y vídeo en la ruta nativa; atención densa en el wrapper de Transformers.
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en atención dispersa: el repositorio permite comparar la ruta densa y la dispersa sobre el mismo backbone con los mismos pesos, usando el wrapper de Transformers como referencia de corrección y el motor nativo para medir latencia real.
- Procesamiento de documentos escaneados: el entrenamiento de los indexadores incluye tareas sintéticas de OCR y tablas, y el modelo acepta imagen y texto, por lo que encaja en pipelines de extracción de campos en facturas o formularios con contexto largo.
- Análisis de vídeo con contexto extenso: la ruta nativa soporta vídeo con QSA y M-RoPE, adecuada para resúmenes de grabaciones o inspección visual de secuencias largas, con la cautela de que la verificación multimodal solo llega a 64k.
- Evaluación de motores de inferencia: sirve como banco de pruebas para validar kernels dispersos, reutilización de prefix-cache y decodificación especulativa MTP frente a implementaciones densas estándar.
- Reproducción de experimentos: al incluir `research/` e `indexers/` con el snapshot de entrenamiento, permite reproducir el entrenamiento de 300 pasos de los indexadores y auditar la conversión.
- Recuperación del modelo original: el script `restore_original.py` verifica los hashes LFS y genera un snapshot HF denso estándar, útil para equipos que quieran partir del Qwen3.8-27B sin modificaciones.
- Despliegue con contexto largo en texto: la model card reporta mediciones de throughput hasta 261.120 tokens de entrada, aplicable a pipelines de resumen o búsqueda sobre corpus extensos, sin que ello implique precisión de razonamiento en contexto largo.

## Benchmarks y rendimiento

| Métrica | Ruta densa | Ruta dispersa QSA | Notas |
|---|---|---|---|
| Perplejidad BF16 (32.766 tokens) | 7,072960 | 7,071384 | Muestra pequeña; el autor no lo considera evidencia de mejora |
| DocVQA, sonda de 50 ítems y cuatro opciones | 50/50 | 50/50 | Prueba construida, no scoring estándar de DocVQA |
| Throughput de texto | no disponible | medido hasta 261.120 tokens de entrada | Metodología en la model card de la release GGUF |
| Precisión de razonamiento en contexto largo | no verificada | no verificada | 128k y 262k sin verificar en multimodal general |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 56 GB solo para pesos, más caché KV y activaciones; se necesita al menos una GPU de 80 GB para texto y más para multimodal con contexto largo.
- Cuantizaciones GGUF: la release Qwen3.8-27B-QSA-MM2-GGUF permite reducir huella, aunque el motor requerido es un llama.cpp modificado y no el estándar.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; configuraciones multi-GPU con `device_map="auto"` en el wrapper de Transformers.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; solo sería viable con cuantización agresiva en la ruta GGUF, dato no confirmado en la información disponible.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` como referencia de corrección; llama.cpp modificado del repositorio GGUF para producción. vLLM, TGI y Ollama no están soportados según la información disponible.
- Entorno de referencia: torch 2.14.1+cu126 y torchvision 0.29.1+cu126 capturados, con runtime CUDA nativo 12.9.
- Latencia y throughput: solo se reporta medición de throughput de texto hasta 261.120 tokens de entrada; no hay cifras de latencia por token publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-MM2-BF16 | 27,83B (52,4M añadidos) | hasta 262.144 | Híbrido Gated DeltaNet + atención completa con QSA | Apache-2.0 | HF, requiere código custom |
| Qwen/Qwen3.8-27B | 27,78B (aprox., sin indexadores) | no disponible en la información | Híbrido Gated DeltaNet + atención completa | Apache-2.0 | HF oficial |
| Qwen3.8-27B-QSA-MM2-GGUF | mismo backbone | hasta 262.144 | Igual, con motor llama.cpp modificado | Apache-2.0 / MIT en código | HF, release separada |
| Otras alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: los pesos del backbone son idénticos y la única diferencia medible son los indexadores QSA y el motor de ejecución. No se dispone de datos para comparar con modelos de otros fabricantes en la misma franja de tamaño.

## Limitaciones y advertencias

- El wrapper de Transformers no implementa MTP ni kernels dispersos nativos: no representa el rendimiento real del modelo y solo sirve como referencia de corrección.
- llama.cpp estándar no soporta los ficheros QSA; usar la release GGUF con su motor propio es obligatorio para producción.
- La evaluación de calidad es muy limitada: perplejidad sobre 32.766 tokens y una sonda DocVQA construida de 50 ítems y cuatro opciones, sin benchmarks estándar.
- La verificación multimodal solo llega a 64k de contexto; el comportamiento en 128k y 262k no está verificado.
- Las mediciones de throughput hasta 261.120 tokens no implican precisión de razonamiento en contexto largo.
- QSA no comprime la caché KV: todos los pares KV originales se conservan, por lo que el ahorro es de cómputo en atención, no de memoria.
- El repositorio incluye código custom y requiere `trust_remote_code=True`; la model card recomienda inspeccionarlo antes de habilitarlo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base Qwen3.8-27B.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de la del modelo base.
- Licencia Apache-2.0 permite uso comercial de los pesos, pero el código nativo de llama.cpp mantiene MIT con avisos de terceros que deben respetarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-MM2-BF16
- Release GGUF con motor llama.cpp modificado: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-MM2-GGUF
- Checkpoint de indexadores: https://huggingface.co/higa2515/qwen38-27b-qsa-indexers/tree/b51b8d15e4342f2bc11ad8419abc18e3be6a8c8a
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

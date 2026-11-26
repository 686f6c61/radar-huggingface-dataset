# mavis-ai/Qwen3.6-35B-MoE-Q5T

## Resumen

mavis-ai/Qwen3.6-35B-MoE-Q5T es una derivacion cuantizada del modelo multimodal Qwen3.6-35B-A3B, desarrollada por mavis-ai para su plataforma R.E.V.I.S., un sistema operativo cognitivo local orientado a IA multiagente en Mac. No se trata de un fine-tune: es una compresion sin datos de calibracion (data-free) del checkpoint oficial de Qwen, redistribuida bajo licencia Apache 2.0. El modelo base es un transformer MoE multimodal con 40 capas, hidden size 2048, 256 expertos enrutados (8 activos mas uno compartido) y una ventana de contexto de 262.144 tokens.

La particularidad tecnica de esta build es el formato Q5T: los expertos enrutados se almacenan como tensores codificados con trellis de 5 bits (K5) con codebook MCG, rotacion Hadamard de 128 puntos y vectores de signo por canal, mientras que el resto de pesos lineales (atencion, experto compartido, embeddings, LM head) usan cuantizacion afina de 8 bits con group size 64 (N8). Los routers, gates de seleccion, normas y la torre de vision se mantienen en BF16. El paquete incluye drafters de decodificacion especulativa (MTP Draft-Q8 con ProposalHead y DFlash-Q8) que suman 1,60 GB.

La relevancia de esta ficha es principalmente informativa: el modelo esta disenado exclusivamente para el motor de inferencia propietario de R.E.V.I.S., que implementa los kernels de decodificacion trellis. En la fecha de publicacion de la model card, esta build Q5T no era cargable por la version actual del motor (que acepta Q4T y Q3T), y no funciona en mlx-lm, mlx-vlm, transformers ni vLLM. Su interes radica en documentar un enfoque de cuantizacion no convencional (trellis frente a affine) para modelos MoE multimodales en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe), 40 capas, hidden size 2048, 256 expertos enrutados (8 activos + 1 compartido) |
| Parametros totales | 13.039.900.016 (segun safetensors del repo; el nombre comercial del modelo base indica 35B-A3B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | 8 expertos enrutados + 1 compartido por token (cifra exacta de parametros activos no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q5T: expertos enrutados K5 (trellis 5 bits, codebook MCG, rotacion Hadamard 128 puntos); capas densas N8 (afina 8 bits, group size 64); routers, gates, normas y torre de vision en BF16; KV cache en runtime a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (trellis-coded para expertos enrutados; requiere kernels trellis propietarios) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) que combina atencion estandar y atencion lineal, con 40 capas, dimension oculta de 2048 y 256 expertos enrutados de los cuales 8 se activan por token mas un experto compartido. Incluye una torre de vision que lo habilita como modelo image-text-to-text. La seleccion de expertos es una decision top-k discontinua, razon por la cual los tensores del router (`mlp.gate`) y del `shared_expert_gate` se conservan en BF16 sin cuantizar.

Esta build Q5T no aplica entrenamiento alguno: es una conversion data-free del checkpoint oficial (revision fuente `995ad96eacd98c81ed38be0c5b274b04031597b0`). Los expertos enrutados se codifican como teselas trellis de 16x16 con 5 bits por peso, minimizando el MSE sobre pesos rotados, sin conjunto de calibracion, redondeo Hessiano, importance matrix ni QAT. Las proyecciones de atencion y atencion lineal, el experto compartido, los embeddings y el LM head se cuantizan con `mx.quantize` (redondeo al mas cercano) a 8 bits afines con group size 64. El paquete incluye tres drafters para decodificacion especulativa: un MTP Draft-Q8 con ProposalHead y un DFlash-Q8 de bloques, con checksums SHA-256 en `drafts/SHA256SUMS`.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision en BF16.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.6-35B-A3B (no se detallan evaluaciones especificas en la informacion disponible).
- Decodificacion especulativa integrada mediante drafters MTP y DFlash, orientada a reducir latencia en Apple Silicon.
- Eficiencia de inferencia por activacion dispersa: solo 8 de 256 expertos enrutados se computan por token.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con R.E.V.I.S.: el modelo esta empaquetado especificamente para el motor de inferencia de R.E.V.I.S., que aporta los kernels trellis; adecuado para despliegues 100% locales en Apple Silicon dentro de flujos multiagente. Requiere una version del motor que acepte builds Q5T (no disponible en la fecha de la model card).
- Investigacion sobre cuantizacion trellis: util como referencia practica para estudiar codificacion trellis de 5 bits con codebook MCG y rotacion Hadamard aplicada a expertos MoE, comparandola con cuantizacion afina convencional.
- Analisis de degradacion por cuantizacion: la model card reporta distancias KLD frente a BF16 sobre 17.877 posiciones en tres estratos (WikiText-2, documentos tecnicos y respuestas propias del modelo), lo que permite usar el checkpoint como sujeto de estudio en experimentos de fidelidad de distribucion next-token.
- Evaluacion de decodificacion especulativa: los drafters MTP y DFlash incluidos permiten experimentar con accept rates y latencia en hardware Apple, si el motor los expone.
- Procesamiento multimodal de documentos: con la torre de vision intacta en BF16 y contexto largo, el modelo base puede abordar tareas de image-text-to-text; esta build hereda esa capacidad, aunque su ejecucion practica queda condicionada al soporte del motor.
- Reproducibilidad y auditoria de artefactos: los manifiestos (`q4t_manifest.json`, `q4t-split-lineage.json`) y los checksums permiten verificar la integridad de los pesos y rastrear la linea de conversion desde el checkpoint original.

## Benchmarks y rendimiento

La model card reporta unicamente distancias de distribucion next-token (KLD) frente al modelo BF16, medidas con arneses de investigacion en GPU que decodifican exactamente los codigos trellis, sobre 48 documentos y 17.877 posiciones puntuadas (WikiText-2, documentos tecnicos y respuestas del propio modelo), con vocabulario completo y KV cache emulado a 8 bits. Los valores numericos de KLD no estan incluidos en la informacion proporcionada. No se reporta velocidad. Las comparaciones con cuantizacion afina convencional quedan pendientes de una remedicion con builds estandar.

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: pesos de 23,81 GB (22,2 GiB) en formato Q5T, mas 1,60 GB de drafters (MTP Draft-Q8, ProposalHead y DFlash-Q8). El repo completo ocupa 25,4 GB.
- Memoria unificada: disenado para Apple Silicon; el requisito exacto de memoria unificada no esta especificado en la informacion disponible.
- GPU: no se especifican GPU NVIDIA recomendadas; el destino declarado es hardware Apple (Mac).
- Compatibilidad de motor: no ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM. Requiere R.E.V.I.S., cuyo motor carga Q4T y Q3T pero rechaza esta build Q5T en tiempo de carga segun la model card.
- Opciones de despliegue: exclusivamente R.E.V.I.S. (version con soporte Q5T no disponible); llama.cpp, Ollama y TGI no son compatibles con el formato trellis.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mavis-ai/Qwen3.6-35B-MoE-Q5T | 13.039.900.016 (safetensors) | 262.144 | Trellis K5 + afina N8 | Apache 2.0 | Solo R.E.V.I.S. (soporte Q5T pendiente) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, A3B activos (segun denominacion) | 262.144 | BF16 original | Apache 2.0 | transformers, vLLM, mlx (segun modelo base) |
| mavis-ai Q4T (misma familia) | no disponible | 262.144 | Trellis K4 + afina N6 | Apache 2.0 | R.E.V.I.S. desde v1.3.0 |
| mavis-ai Q3T (misma familia) | no disponible | 262.144 | Trellis K3 + afina N6 | Apache 2.0 | R.E.V.I.S. (segun model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad de motor: no funciona en mlx-lm, mlx-vlm, transformers ni vLLM; los expertos trellis requieren kernels propietarios de R.E.V.I.S.
- Soporte incompleto incluso en su motor destino: la model card indica que la version actual de R.E.V.I.S. rechaza esta build Q5T en tiempo de carga.
- Discrepancia de parametros: el nombre del modelo base sugiere 35B totales y 3B activos, mientras que los safetensors declaran 13.039.900.016 parametros; la informacion disponible no explica la diferencia.
- Verificacion limitada: el manifiesto registra `runtime_forward_verified: false`; la conversion verifico los pesos efectivos, no una pasada forward real en el motor.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Qwen3.6-35B-A3B; no se documentan mitigaciones especificas en esta build.
- Idiomas: no se declaran idiomas soportados en la informacion disponible.
- Uso comercial: permitido bajo Apache 2.0, pero la practica queda bloqueada por la dependencia de un motor propietario y por el estado de soporte.
- Data-free: la cuantizacion no uso calibracion, por lo que la fidelidad depende del recipe fijo y de las mediciones KLD reportadas, cuyos valores no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mavis-ai/Qwen3.6-35B-MoE-Q5T
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Actualizaciones en X: https://x.com/mavis_ai_jp
- Paper referenciado en tags (arXiv:2602.06036): https://arxiv.org/abs/2602.06036

# arpjw/Qwen-GPU

## Resumen

Qwen-GPU es un checkpoint de investigación publicado por el usuario arpjw que parte de Qwen/Qwen3.5-9B y le añade una capa de circuitos compilados que emula un procesador SIMT (Single Instruction, Multiple Threads) dentro del estado recurrente del modelo. El objetivo declarado no es mejorar las capacidades lingüísticas del modelo base, sino explorar si un transformer puede actuar como sustrato de ejecución de instrucciones: el modelo recibe kernels codificados como tokens y emite tokens de control que representan el estado de registros y memoria de un pequeño procesador.

El checkpoint combina la torre de texto de Qwen3.5-9B con 53 capas de circuitos compilados antepuestas y un ensanchamiento del tamaño oculto de 4.096 a 7.936. Se reservan 212.992 identificadores de token para el protocolo de instrucciones y estado SIMT. El resultado es un modelo de 43.153.899.200 parámetros totales (según safetensors) y un repositorio de 86,3 GB, pensado para ejecutarse en GPUs con 96 GB de VRAM.

Es relevante ahora como artefacto de investigación sobre cómputo híbrido neuro-simbólico, no como modelo de producción: el autor documenta validaciones concretas (26.225 tokens generados sobre 1.972 instrucciones en la suite de tiles, vector add de 64 elementos, reducción en dos pasadas de 128 elementos y multiplicación de matrices 8×4 por 4×4) y advierte de que la versión v4, cualificada para CUDA, aún no está subida a Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de texto Qwen3.5-9B más 53 capas de circuitos compilados (SIMT) antepuestas; modelo causal de solo texto con cabeza de salida no atada |
| Parametros totales | 43.153.899.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base y checkpoint); circuito GPU bajo licencia MIT del proyecto QwenGPU y compilador Qwenputer bajo MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-9B, un transformer causal de solo texto, y le antepone 53 capas de circuitos compilados que implementan un procesador SIMT. El tamaño oculto se amplía de 4.096 a 7.936 y se reservan 212.992 identificadores de token a partir del 248.320 para el protocolo de instrucciones y estado. El tokenizador de texto procede de la revisión fijada del modelo base. Se exporta un modelo de lenguaje causal de solo texto con la cabeza de salida preentrenada no atada y una ruta de salida GPU separada.

El procesador emulado soporta dos warps de ocho lanes por workgroup, hasta cuatro workgroups secuenciales o dos intercalados, y 32 instrucciones residentes por warp. Dispone de 512 bytes de memoria global programable. Los kernels ejecutan aritmética entera acotada y reportan halt, deadlock o límite de instrucciones impuesto por el lanzador. Cada token emitido requiere una pasada forward del modelo. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el checkpoint se presenta como una modificación de pesos sobre el base, no como un fine-tuning lingüístico.

## Capacidades

- Generación de texto causal heredada de Qwen3.5-9B, con tokenizador del modelo base.
- Ejecución de kernels SIMT codificados como tokens: suma de vectores de 64 elementos, reducción en dos pasadas de 128 elementos y multiplicación de matrices 8×4 por 4×4.
- Soporte de dos warps de ocho lanes por workgroup, hasta cuatro workgroups secuenciales o dos intercalados.
- 32 instrucciones residentes por warp y 512 bytes de memoria global programable.
- Detección y reporte de halt, deadlock y límite de instrucciones.
- Reutilización de memoria global entre lanzamientos sin re-subida (validado en el segundo lanzamiento de reducción).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en cómputo neuro-simbólico: usar el checkpoint para estudiar si un transformer puede ejecutar un modelo de máquina de forma fiable, comparando los tokens de control emitidos con la referencia del verificador incluido en el repositorio.
- Validación de kernels SIMT emulados: ejecutar la suite de tiles y workgroups documentada por el autor (27 de 27 fixtures de tiles heredados, 8 de 8 de workgroups) para reproducir los resultados publicados y medir la tasa de acierto en continuaciones nativas.
- Reproducibilidad de artefactos de investigación: el repositorio incluye `build-manifest.json` con las revisiones del build QwenGPU, del compilador Qwenputer y de Qwen3.5-9B, además de digests de shards, lo que permite auditar la cadena de construcción.
- Estudio de protocolos de instrucciones en modelos de lenguaje: analizar cómo se comporta el modelo al recibir kernels codificados como tokens y qué patrones de error produce en halt, deadlock y límites de instrucciones.
- Experimentación con memoria global acotada: probar algoritmos que quepan en 512 bytes de memoria programable y hasta 32 instrucciones residentes por warp, útiles para docencia o investigación sobre autómatas programables.
- Evaluación de coste de inferencia por token de control: cada token emitido requiere una pasada forward completa, lo que permite medir el coste real de emular cómputo con un transformer de 43.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El autor sí documenta métricas de validación específicas del checkpoint:

| Metrica | Resultado |
|---|---|
| Fixtures de tiles heredados | 27 de 27 |
| Fixtures de workgroups | 8 de 8 |
| Primeros tokens nativos | 24 de 24 |
| Continuaciones nativas completas | 21 de 24 |
| Tokens generados en replay CUDA | 26.225 sobre 1.972 instrucciones |
| Checksums de paquete | 49 de 49 |
| Vector add | 64 elementos, correcto |
| Reducción en dos pasadas | 128 elementos, correcto |
| Multiplicación de matrices | 8×4 por 4×4, correcto |
| Reutilización de memoria global | segundo lanzamiento de reducción con cero re-subida |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que los pesos fusionados ocupan aproximadamente 86 GB y se cualificaron en una GPU CUDA de 96 GB.
- GPU recomendadas: GPU CUDA con 96 GB de VRAM (por ejemplo, A100 de 80 GB no bastaría según el tamaño declarado; H100 de 80 GB tampoco; se requiere una GPU de 96 GB como H100 NVL o similar). No se especifican modelos concretos más allá de "96 GB CUDA GPU".
- ¿Cabe en consumer GPU? No: 86 GB de pesos en safetensors excede la VRAM de cualquier GPU de consumo actual. No se documentan cuantizaciones que reduzcan el tamaño.
- Opciones de despliegue: `transformers` con el paquete `qwengpu` y el lanzador `python -m qwengpu.run_resident`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor señala que cada token emitido requiere una pasada forward del modelo.
- Nota: el replay completo en Apple MPS de la v3 está pendiente según el autor.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers con procesador SIMT emulado). Como referencia del modelo base:

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-GPU (este checkpoint) | 43.153.899.200 | no disponible | Apache 2.0 + MIT (circuito) | Hugging Face, v3; v4 en GitHub |
| Qwen/Qwen3.5-9B (base) | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Checkpoint de investigación: no está pensado como modelo de producción ni como asistente general; las capacidades lingüísticas no se han evaluado con benchmarks estándar.
- Tamaño desproporcionado: 43.153.899.200 parámetros y 86 GB de pesos para emular un procesador de 512 bytes de memoria y 32 instrucciones por warp; el coste por token de control es una pasada forward completa.
- Cobertura incompleta: 21 de 24 continuaciones nativas completas, es decir, 3 fallos documentados por el propio autor.
- Versión v4 no disponible en Hugging Face: la versión cualificada para CUDA solo está en la release de GitHub con verificación de checksum; la v3 es la única subida al repositorio.
- Replay en Apple MPS pendiente: no hay validación publicada en esa plataforma.
- Idiomas soportados no documentados: aunque hereda el tokenizador de Qwen3.5-9B, no se declara cobertura multilingüe.
- Longitud de contexto no documentada: no se especifica la ventana de contexto efectiva del checkpoint fusionado.
- Sin datos de sesgos ni de alucinación: no se han publicado evaluaciones de sesgo, toxicidad o tasa de alucinación para este checkpoint.
- Restricciones de licencia: Apache 2.0 para los pesos y el modelo base, MIT para el circuito GPU y el compilador Qwenputer; conviene revisar la atribución del proyecto QwenGPU antes de uso comercial.
- Dependencia de un entorno fijado: `environment.txt` registra el runtime de validación; desviarse de él puede romper la reproducibilidad de los checksums.
- Requiere autenticación si el repositorio restringe acceso (`hf auth login`).

## Enlaces

- Hugging Face: https://huggingface.co/arpjw/Qwen-GPU
- Repositorio GitHub del proyecto QwenGPU: https://github.com/arpjw/qwengpu
- Release v4 con checksum verificado: https://github.com/arpjw/qwengpu/releases/tag/v4-corrected-package-2026-11-14
- Instrucciones de restauración de la v4: https://github.com/arpjw/qwengpu#run-the-verified-v4-checkpoint
- Guía de reproducción: https://github.com/arpjw/qwengpu/blob/main/REPRODUCE.md#run-the-stock-generation-checkpoint
- Recibo de restauración y salida del verificador: https://github.com/arpjw/qwengpu/blob/main/RELEASE.md#restore-receipt
- Atribución de licencia y fuentes: https://github.com/arpjw/qwengpu/blob/main/RELEASE.md#license-and-attribution
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

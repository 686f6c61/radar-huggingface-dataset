# addiesam/Ripple-65B-Preview-QVB8-1e-3

## Resumen

Ripple-65B-Preview-QVB8-1e-3 es un paquete de pesos cuantizados del modelo Ripple-65B-Preview (desarrollado por ricursiveAI), comprimido por el usuario addiesam mediante el formato QVB8. No se trata de un modelo nuevo, sino de una representación comprimida del modelo base de 65.000 millones de parámetros, empaquetada con una cota de error L∞ certificada de tau = 0,001. El paquete está diseñado exclusivamente para ejecutarse con el motor de inferencia QVB8 (v1.1.0 o superior), que decodifica los pesos comprimidos directamente en kernels CUDA sobre GPU; no es cargable con `transformers` ni con otros motores convencionales.

La propuesta técnica diferencial es la compresión con cota L∞: en lugar de optimizar una métrica promedio (perplejidad o benchmark), el formato garantiza que el error máximo de cada peso restaurado respecto al original en bf16 sea inferior a tau. Esta cota se verifica tensor a tensor tras el empaquetado y el error máximo encontrado se registra en `manifest.json`. El paquete ocupa 57,3 GB en disco, con 642 tensores comprimidos y una media de 7,08 bits por peso sobre los tensores comprimidos.

El modelo es relevante para desarrolladores que necesitan desplegar un modelo de 65B en hardware limitado sin renunciar a garantías formales sobre la fidelidad de los pesos, y para investigadores interesados en técnicas de cuantización con cotas de error certificadas frente a enfoques puramente empíricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ripple-65B-Preview; el paquete es una cuantización QVB8) |
| Parametros totales | 65B (según nombre del modelo base); el repo safetensors reporta 1.664.080 tensores/entradas de metadatos |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0,001 (certificado para fp16 y bf16); media de 7,08 bits por peso en los 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor; requiere el motor QVB8, no `transformers`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Ripple-65B-Preview (tipo de transformer, número de capas, atención, datos de entrenamiento, tokens vistos, uso de RLHF/DPO). Lo que sí está documentado es el proceso de compresión: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando el error máximo (`max_err`) por tensor en `manifest.json`. El empaquetado no utiliza datos de calibración; depende únicamente de los pesos. La innovación técnica destacable es la cota L∞ certificada: se controla el error máximo, no el promedio, lo que evita que pesos con error grande (que podrían invertir un token) pasen desapercibidos en métricas agregadas. El paquete incluye un modelo draft DFlash2 (4,1 GB en qvb8, tau 5e-3) para decodificación especulativa, y el motor soporta pipeline multi-GPU, offload de KV cache a RAM del sistema y kernels precompilados para DGX Spark (sm_121a) y V100 (sm_70).

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código: no disponible explícitamente en la información; se infiere del modelo base pero no está confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no listados).
- Decodificación especulativa mediante el modelo draft DFlash2 incluido en el ecosistema de paquetes.
- Ejecución en hardware modesto gracias a la decodificación de pesos comprimidos en kernels CUDA del motor QVB8.
- Certificación de fidelidad de pesos: error máximo por peso acotado por tau, verificable en `manifest.json`.

## Casos de uso

- Despliegue de un modelo de 65B en GPUs de gama alta con VRAM limitada: el paquete de 57,3 GB permite cargar el modelo con menor huella que el bf16 original, decodificando pesos en los kernels CUDA del motor QVB8; adecuado cuando se necesita el modelo completo pero el presupuesto de memoria es ajustado.
- Investigación en cuantización certificada: comparar el impacto real de distintos valores de tau (1e-3, 2e-3, 2.5e-3) sobre la calidad de salida usando los paquetes hermanos, con la garantía de cota L∞ verificable.
- Servicio de generación de texto conversacional: el pipeline declarado es `text-generation` con tag `conversational`; se puede exponer mediante el servidor del motor QVB8 (el chat de terminal es cliente de un servidor en ejecución desde v1.1.0).
- Inferencia multi-GPU en una sola máquina: el motor soporta `--pipeline cuda:0,cuda:1`, útil para repartir el modelo entre dos GPUs y reducir la VRAM por dispositivo.
- Despliegue en nodos con poca VRAM mediante offload de KV cache: `--kv-window` y `--kv-host` permiten descargar la caché KV a RAM del sistema, útil en estaciones de trabajo con GPU modesta y mucha RAM.
- Inferencia acelerada con decodificación especulativa: combinar el paquete target con el draft DFlash2 (qvb8 o qvb8r, tau 5e-3) para reducir latencia en generación interactiva.
- Auditoría de fidelidad de pesos en pipelines de producción: leer `max_err` de `manifest.json` para verificar que ningún tensor excede tau antes de desplegar, como control de calidad reproducible.
- Ejecución en hardware específico: kernels precompilados para DGX Spark (sm_121a) y V100 (sm_70), útil en entornos con estas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni perplejidad; solo documenta la cota de error de compresión (tau = 0,001) y métricas de tamaño (57,3 GB, 642 tensores, 7,08 bits/peso de media).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete ocupa 57,3 GB en disco y requiere cargar los pesos decodificados, por lo que se necesita al menos una GPU con VRAM suficiente para el modelo más la caché KV (el motor permite offload de KV a RAM del sistema con `--kv-window` / `--kv-host`).
- GPU recomendadas: no especificadas por el autor; el motor incluye kernels precompilados para DGX Spark (sm_121a) y V100 (sm_70), y soporta pipeline multi-GPU (`--pipeline cuda:0,cuda:1`).
- ¿Cabe en consumer GPU? No disponible; un modelo de 65B comprimido a ~7 bits por peso excede la VRAM de GPUs de consumo típicas (24 GB) sin offload o multi-GPU.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.1.0 o superior (no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-1e-3 | 65B (base) | no disponible | QVB8 (tau 1e-3) | Apache 2.0 | QVB8 |
| Ripple-65B-Preview-QVB8-2e-3 | 65B (base) | no disponible | QVB8 (tau 2e-3, 49 GB) | Apache 2.0 | QVB8 |
| Ripple-65B-Preview-QVB8R-1e-3 | 65B (base) | no disponible | QVB8R (tau 1e-3, 47 GB) | Apache 2.0 | QVB8 |
| Ripple-65B-Preview (base) | 65B | no disponible | bf16 | no disponible | `transformers` |

No se dispone de datos de rendimiento (benchmarks) para comparar cualitativamente con alternativas de la misma categoría; la comparación se limita a formato, tamaño y licencia.

## Limitaciones y advertencias

- No es cargable con `transformers` ni con motores convencionales: requiere el motor QVB8 v1.1.0 o superior, lo que limita la portabilidad y ata el despliegue a un único runtime.
- La cota L∞ cubre únicamente los pesos almacenados; no garantiza que las respuestas del modelo sean idénticas a las del original ni correctas. Diferencias en motores, tamaños de batch u orden de operaciones en coma flotante producen salidas ligeramente distintas incluso con pesos FP16 exactos.
- Riesgo de alucinación: no documentado en la información disponible; aplicable el riesgo genérico de los LLM.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados no están listados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Ripple-65B-Preview (no listada en esta información).
- El número de parámetros reportado por safetensors (1.664.080) no corresponde al tamaño nominal de 65B; probablemente refleja entradas de metadatos del empaquetado, no parámetros reales.
- El paquete está certificado para fp16 y bf16; el uso con otras precisiones no está cubierto por la garantía.
- Dependencia de hardware específico para los kernels precompilados (DGX Spark sm_121a, V100 sm_70); otras GPUs requieren compilación o soporte adicional no detallado.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8 (GitHub): https://github.com/addiesam/qvb8
- Release del motor v1.1.0: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Paquete QVB8R tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Paquete QVB8 tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Paquete QVB8R tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Paquete QVB8 tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Paquete QVB8R tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
- Draft DFlash2 QVB8 tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Draft DFlash2 QVB8R tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3

# malaiwah/glm-moe-dsa-tiny-random-fp8-block32-rtn-format

## Resumen
Este modelo, `malaiwah/glm-moe-dsa-tiny-random-fp8-block32-rtn-format`, es un artefacto técnico de almacenamiento (fixture) desarrollado por Malaiwah, no un modelo de lenguaje entrenado. Se construye como una cuantización fp8-block32 de un checkpoint aleatorio diminuto con arquitectura GLM MoE DSA, y su propósito es servir como pieza de referencia para inspeccionar empaquetado, reconstrucción, contabilidad de alcance y comparaciones de fidelidad en herramientas de cuantización. El modelo tiene 277.848 parámetros en formato safetensors, con cuatro capas de decodificador (una densa, tres MoE), atención MLA, indexadores DSA alternados y 8 expertos enrutados con top-2 más un experto compartido. La longitud de contexto no está disponible. Su relevancia radica en permitir depurar y verificar pipelines de cuantización sin descargar checkpoints de gran tamaño, aunque no es utilizable como asistente ni como modelo de producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | GLM MoE DSA: 4 capas de decodificador de texto (1 densa, 3 MoE), atención MLA, indexadores DSA alternados completos/compartidos, 8 expertos enrutados/top-2 + 1 experto compartido, cabeza de vocabulario no unida |
| Parámetros totales | 277.848 (metadatos de safetensors); la model card indica 277.824 parámetros generados antes del empaquetado |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp8-block32 (round-to-nearest, sin optimización GPTQ/AWQ/ModelOpt) |
| Idiomas soportados | No disponible (tokenizer de bytes independiente con 260 tokens, no vocabulario real) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es una implementación GLM MoE DSA con cuatro capas de decodificador: una densa y tres de mezcla de expertos (MoE). Incluye atención MLA (Multi-Head Latent Attention), indexadores DSA que alternan entre completos y compartidos, 8 expertos enrutados con selección top-2 más un experto compartido, y una cabeza de vocabulario no unida completa. El modelo conserva buffers FP32 nativos para el enrutador y no incluye MTP. Los pesos están inicializados aleatoriamente: no ha habido entrenamiento, ni ajuste fino, ni optimización de cuantizador. La cuantización aplicada es fp8-block32 mediante empaquetado round-to-nearest (RTN), que no ejecuta GPTQ, AWQ ni AutoRound, ni entrenamiento calibrado. Los pesos se reconstruyen a BF16 para las comparaciones de fidelidad, pero no se captura la cuantización dinámica de activación FP8 ni se reivindica paridad con kernels de servidores GPU.

## Capacidades
- Inspección de empaquetado fp8-block32 y reconstrucción de pesos.
- Comparación de fidelidad entre el checkpoint cuantizado y el checkpoint base, usando la política de cabeza de salida nativa.
- Depuración de adaptadores de familia de modelos, carga estricta de tensores y decodificadores de almacenamiento.
- Reproducción de un alcance limitado: capturar estados ocultos y reproducir una cabeza de vocabulario completa con un panel sintético.
- Verificación de identidad de pesos contra un checkpoint fuente conocido mediante hash.
- No ofrece generación de texto útil, seguimiento de instrucciones ni razonamiento: los pesos no están entrenados.

## Casos de uso
- Validación de decodificadores de almacenamiento: el modelo permite probar que un lector de safetensors reconstruye los pesos correctamente a partir del empaquetado fp8-block32, sin necesidad de un checkpoint grande.
- Pruebas de carga estricta de tensores: sirve como fixture para verificar que los frameworks de carga rechazan tensores con nombres o identidades incorrectas en adaptadores MoE.
- Reproducibilidad de herramientas de cuantización: al compartir el checkpoint fuente con identidad fija, se pueden reproducir los resultados de empaquetado RTN y compararlos entre versiones de la herramienta.
- Depuración de adaptadores de familia de modelos: por su tamaño minúsculo y arquitectura MoE, es un caso de prueba cómodo para depurar adaptadores que operan sobre modelos con múltiples expertos.
- Evaluación de regresiones en lectores de formatos: si un cambio en un decodificador produce diferencias, el fixture permite aislar si la regresión proviene de la reconstrucción de pesos o de la lógica de cuantización.
- Generación de artefactos de evidencia: el modelo incluye `scope.json`, `build.json` y `config.json`, lo que permite generar recibos de comparación y auditorías de construcción para control de calidad.
- Formación en herramientas de cuantización: como es más pequeño que un modelo de producción, puede usarse como material didáctico para enseñar cómo funcionan los formatos fp8-block32 y la reconstrucción en CPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de rendimiento de lenguaje en la información disponible. El único dato de referencia es el resultado de fidelidad de reconstrucción registrado en la model card, sobre un panel sintético de 252 posiciones:

| Métrica | Valor |
|---|---|
| Mean KL(reference ∥ candidate) | 0.0001992552179142569 nats |
| Posiciones evaluadas | 252 |
| Top-1 agreement | 0.8611111111111112 |
| Comparabilidad | Advertencia (las omisiones de reconstrucción y activación siguen vigentes) |

Estos valores no representan capacidad lingüística ni calidad de respuestas, sino fidelidad de reconstrucción de pesos en un entorno CPU concreto.

## Requisitos de hardware
- VRAM estimada: no aplica en la práctica; el modelo es minúsculo y cabe en cualquier CPU sin aceleradora.
- GPU recomendada: ninguna; el flujo de trabajo registrado usa CPU (Python 3.12, Torch 2.11.0+cpu, Transformers 5.16.1, dos hilos de Torch).
- Puede ejecutarse en cualquier hardware de consumo, incluidos portátiles y máquinas virtuales ligeras.
- Opciones de despliegue: no es un modelo de servicio; se carga en procesos de CPU con Transformers para inspección y pruebas. No se recomienda vLLM, llama.cpp ni TGI porque no hay pesos de producción ni soporte de servicio.
- Latencia y throughput: no disponibles; el tamaño de archivo serializado es 342.696 bytes, pero no se especifican medidas de rendimiento en tiempo de ejecución.

## Comparativa con modelos similares
El modelo se compara dentro de la familia de cuantización de pesos de Malaiwah, no con modelos de lenguaje de producción:

| Modelo | Parámetros | Cuantización | Rol | Licencia |
|---|---|---|---|---|
| malaiwah/glm-moe-dsa-tiny-random-bf16 | 277.824 | BF16 (nativo) | Modelo base de referencia | MIT |
| malaiwah/glm-moe-dsa-tiny-random-fp8-block32-rtn-format | 277.848 (metadatos) | fp8-block32 RTN (pérdida) | Hijo cuantizado, fixture de almacenamiento | MIT |

Ambos comparten la misma identidad de checkpoint fuente (`800be70604bef0c3adfb429774f44756d60bf23d141e82d24a032ce25ce0451e`). No se disponen de modelos comparables de la misma categoría fuera de esta familia de pruebas.

## Limitaciones y advertencias
- Los pesos no están entrenados: no es un asistente ni un modelo de lenguaje. El texto generado carece de calidad semántica útil.
- No se establece precisión, seguimiento de instrucciones, ni calidad de optimización de cuantizador.
- La cuantización fp8-block32 es empaquetado round-to-nearest, no optimización: no se ejecutaron GPTQ, AWQ ni AutoRound.
- La reconstrucción en CPU no ejecuta el GEMM empaquetado original ni la aritmética de activación de servicio, por lo que no hay paridad con kernels GPU/NPU ni determinismo entre hardware.
- El tokenizer incluido es un tokenizer de bytes independiente con 260 tokens, no el vocabulario real aguas arriba.
- Este hijo no debe registrarse ni representarse como el modelo base; el modelo base es `malaiwah/glm-moe-dsa-tiny-random-bf16`.
- La longitud de contexto y los idiomas soportados no están disponibles.
- No sirve para producción ni para inferencia de calidad; su uso es exclusivamente como fixture de desarrollo y pruebas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/malaiwah/glm-moe-dsa-tiny-random-fp8-block32-rtn-format
- Modelo base de referencia: https://huggingface.co/malaiwah/glm-moe-dsa-tiny-random-bf16
- Dataset de raíz de fidelidad: https://huggingface.co/datasets/malaiwah/glm-moe-dsa-tiny-fidelity-root-v1
- Paquete de evidencia de almacenamiento: https://huggingface.co/datasets/malaiwah/qfs-existing-tiny-cpu-format-v1/tree/2b5c947281a92d1f104ee17fdcc44a0104768a45
- Recibo de comparación completo: https://huggingface.co/datasets/malaiwah/qfs-existing-tiny-cpu-format-v1/blob/2b5c947281a92d1f104ee17fdcc44a0104768a45/raw/candidates/fp8-block32/evidence/comparison-fp8-block32/comparison-receipt.json
- Colección de familias de cuantización de pesos emparejados: https://huggingface.co/collections/malaiwah/qfs-matched-weight-quantization-families-6a9f071d93dbd3dbf0a1e844

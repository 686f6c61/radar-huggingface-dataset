# brianbellx/codehygiene-bonsai-1.7b

## Resumen

CodeHygiene Bonsai 1.7B es un modelo de generación de texto especializado en refactorización de código orientada a legibilidad, desarrollado por el usuario brianbellx. Se construye a partir de `prism-ml/Ternary-Bonsai-1.7B-unpacked`, un modelo de arquitectura `Qwen3ForCausalLM` con pesos ternarios nativos (valores en {-1, 0, +1} con escalas por grupo de 32), y se afina mediante destilación y entrenamiento GRPO con validación por tests para producir parches en formato `SEARCH/REPLACE` alineados con los diagnósticos de la herramienta `codehygiene`.

El modelo tiene 1.720 millones de parámetros y se distribuye en dos formatos: pesos estándar en `safetensors` (F16, reconstrucción sin pérdida de `trits * fp16_scales`) para PyTorch y ZeroGPU, y fragmentos ternarios de 2 bits comprimidos con gzip para ejecución en navegador mediante WebGPU, con buffers de menos de 85 MiB cada uno.

Su relevancia radica en dos factores: por un lado, la cuantización ternaria nativa reduce drásticamente el coste de almacenamiento e inferencia manteniendo la arquitectura transformer original; por otro, el enfoque en parches `SEARCH/REPLACE` lo hace directamente integrable en flujos de refactorización automatizada. La licencia Apache 2.0 facilita su uso comercial. El checkpoint publicado corresponde a la versión de entrenamiento v0.5, con una actualización v0.6 anunciada pero no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (`Qwen3ForCausalLM`) con pesos ternarios nativos |
| Parámetros totales | 1,72 mil millones (1.72B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria nativa {-1, 0, +1} con group_size = 32; pesos F16 en safetensors; shards ternarios de 2 bits para WebGPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (F16) y shards WebGPU (`manifest.json` + buffers `u32` comprimidos con gzip, < 85 MiB por buffer) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `Qwen3ForCausalLM` del checkpoint base `prism-ml/Ternary-Bonsai-1.7B-unpacked`, con pesos ternarios nativos: cada peso toma un valor en {-1, 0, +1} y se escala por grupos de 32 elementos. Los pesos publicados en `safetensors` en F16 son una reconstrucción sin pérdida del producto `trits * fp16_scales`, lo que permite cargar el modelo en PyTorch estándar y en ZeroGPU sin necesidad de kernels ternarios personalizados. Para navegador se ofrecen shards ternarios de 2 bits comprimidos con gzip, pensados para ejecución vía WebGPU.

El entrenamiento combina destilación desde el modelo base con GRPO (Group Relative Policy Optimization) con validación por tests ("test-gated"). El objetivo de entrenamiento es la generación de parches en formato `SEARCH/REPLACE` emparejados con los diagnósticos que emite la herramienta `codehygiene`, de modo que el modelo aprende a proponer cambios de legibilidad que la propia herramienta puede verificar. El checkpoint publicado corresponde a la versión de entrenamiento v0.5; el autor anuncia una actualización v0.6 aún no disponible. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO más allá del uso de GRPO.

## Capacidades

- Generación de parches de refactorización en formato `SEARCH/REPLACE`, orientados a mejorar la legibilidad del código.
- Alineación con los diagnósticos de la herramienta `codehygiene` (versión de entrenamiento v0.5), lo que permite cerrar el bucle entre detección y corrección.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Especialización en tareas de refactorización y limpieza de código (tags `code` y `refactoring`).
- Ejecución en navegador mediante WebGPU con los shards ternarios de 2 bits incluidos.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Refactorización automatizada en pipelines de CI: el modelo genera parches `SEARCH/REPLACE` a partir de los diagnósticos de `codehygiene`, que pueden aplicarse y validarse contra la suite de tests del proyecto antes de fusionar, tal como recomienda el propio autor.
- Limpieza de deuda técnica en revisiones de código: integrado como paso previo a la revisión humana, propone cambios de legibilidad sobre funciones señaladas por la herramienta y reduce el trabajo manual del revisor.
- Asistente de refactorización en el editor: al ser un modelo de 1,72B con pesos ternarios, puede desplegarse en entornos con recursos limitados y ofrecer sugerencias de parches directamente en el IDE.
- Ejecución local en navegador: los shards WebGPU de menos de 85 MiB por buffer permiten ofrecer una demo o asistente de refactorización sin backend, útil para herramientas internas o documentación interactiva.
- Normalización de estilo en bases de código heredadas: el modelo puede aplicarse de forma masiva sobre ficheros con diagnósticos recurrentes, generando parches acotados que se validan por tests antes de integrarse.
- Formación y demostraciones: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para talleres, entornos docentes y pruebas de concepto de refactorización asistida por IA sin coste de infraestructura GPU dedicada.
- Integración en endpoints compatibles: el tag `endpoints_compatible` permite desplegarlo detrás de una API de inferencia estándar para consumo desde herramientas internas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 3,4 GB solo para pesos (1,72B × 2 bytes), más overhead de activaciones y caché KV; el repo completo ocupa 0,4 GB, lo que sugiere que los shards ternarios son la distribución principal.
- VRAM estimada con shards ternarios de 2 bits: en torno a 0,4-0,5 GB para pesos, muy por debajo de los requisitos de un modelo de 1,7B en F16.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM para la versión F16 (RTX 3060, RTX 4060, RTX 4090); para la versión ternaria, GPUs con soporte de kernels de baja precisión o WebGPU en navegador.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas recientes, e incluso en iGPU con WebGPU para los shards ternarios.
- Opciones de despliegue: `transformers` (formato nativo), endpoints compatibles con la API de Hugging Face (tag `endpoints_compatible`), ZeroGPU y WebGPU en navegador. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeHygiene Bonsai 1.7B | 1,72B | no disponible | Ternaria nativa (group_size 32), F16, shards WebGPU 2 bits | Apache 2.0 | Hugging Face, pesos safetensors y WebGPU |
| prism-ml/Ternary-Bonsai-1.7B-unpacked (base) | 1,72B | no disponible | Ternaria nativa | no disponible en la información | Hugging Face |
| Qwen3 (modelos de la familia) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de ~1,7B especializados en código o con cuantización extrema) no está disponible en la información proporcionada. El modelo base `prism-ml/Ternary-Bonsai-1.7B-unpacked` es el referente directo más próximo, del que este checkpoint es un ajuste fino.

## Limitaciones y advertencias

- El propio autor advierte de que debe revisarse cada cambio generado y ejecutar la suite de tests del proyecto antes de fusionar; no es un modelo validado para aplicación automática sin supervisión.
- El checkpoint corresponde a la versión de entrenamiento v0.5; la actualización v0.6 está anunciada pero no publicada, por lo que el comportamiento puede cambiar entre versiones.
- Riesgo de alucinación en la generación de parches: el modelo puede producir bloques `SEARCH` que no coincidan exactamente con el código fuente o `REPLACE` sintácticamente incorrectos; la validación por tests es imprescindible.
- Idiomas soportados no especificados; el entrenamiento está orientado a código y diagnósticos de `codehygiene`, por lo que su rendimiento en lenguaje natural fuera de ese dominio no está documentado.
- Longitud de contexto no disponible, lo que impide garantizar el comportamiento en ficheros o repositorios grandes.
- Sin datos de benchmarks publicados, no es posible comparar su calidad de refactorización con alternativas de forma objetiva.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y aviso de cambios; conviene revisar las condiciones del modelo base `prism-ml/Ternary-Bonsai-1.7B-unpacked`, cuya licencia no se detalla en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brianbellx/codehygiene-bonsai-1.7b
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Repositorio de la herramienta codehygiene: https://github.com/brianbell-x/codehygiene

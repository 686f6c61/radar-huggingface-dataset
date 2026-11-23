# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF es una cuantización GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones "APEX". El modelo subyacente es un transformer híbrido de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) con arquitectura etiquetada como `qwen35`, que combina capas de atención con capas de estado recurrente (SSM), según se deduce de los tensores auditados en el GGUF (`attn_*` y `ssm_*`). La variante "pi-adapted" sugiere un ajuste orientado a agentes y uso conversacional, aunque la model card no documenta el proceso de adaptación.

Esta ficha concreta es la variante **MicroPlus**, la más pequeña de la familia, con un peso de 9,77 GiB y un tamaño de repositorio de 21,3 GB (que incluye otros ficheros). El objetivo de la publicación es ofrecer una cuantización agresiva pero quirúrgicamente planificada —con protección de tensores recurrentes en F32 y asignación diferenciada de precisión por grupo de capas— para permitir la ejecución local de un modelo de 27B en hardware de consumo. La licencia es Apache 2.0 y el formato es GGUF, compatible con llama.cpp y con la aplicación de escritorio V-Agent del propio autor.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización selectiva (mezcla de Q3_K, Q4_K, Q5_K, Q8_0, IQ2_S e IQ2_XXS con capas críticas en F32) aplicada a una arquitectura híbrida atención-SSM; por otro, advierte de que la información disponible es escasa y procede casi exclusivamente de la model card del cuantizador, sin benchmarks ni documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas SSM/recurrentes (etiqueta `qwen35` en el GGUF) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE; los tensores auditados muestran FFN densas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q3_K, Q4_0, Q4_K, Q5_K, Q8_0, IQ2_S, IQ2_XXS y F32 (tensores recurrentes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base se etiqueta como `qwen35` y, a partir del mapa de tensores auditado del GGUF, presenta una estructura híbrida: capas con proyecciones de atención (`attn_qkv`, `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`) y capas con componentes de estado recurrente (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt.bias`, `ssm_out`). El GGUF contiene bloques numerados hasta `blk.63`, lo que indica al menos 64 capas, y las FFN son densas (tensores `ffn_down` y `ffn_gate`), no dispersas tipo MoE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovación técnica documentada corresponde al proceso de cuantización, no al entrenamiento. El cuantizador aplica una asignación quirúrgica de precisión: los parámetros del camino recurrente (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt.bias`) se mantienen en F32 (408 tensores observados) para preservar la estabilidad numérica de la recursión; las proyecciones de atención usan Q3_K a Q5_K; y las FFN densas se comprimen a IQ2_S en las capas 0-15 y 48-63 e IQ2_XXS en las capas 16-47. Los tensores de la capa 0 (`attn_gate`, `attn_qkv`, `ssm_beta`, `ssm_out`) reciben protección adicional en Q4_0 como frontera de entrada. La matriz de importancia (imatrix) empleada es `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` en el commit `4af51b3542f775b0a8e4b310bfb3f17e01c306c9`, según declara el autor; la procedencia externa de dicho fichero no se infiere.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Orientación a agentes: las etiquetas incluyen `agents` y `mtp` (multi-token prediction, presumiblemente), lo que sugiere soporte para flujos de agente y razonamiento multi-paso.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el GGUF puede servirse a través de APIs compatibles con OpenAI/Claude según el ecosistema del autor.
- Integración con herramientas de agente en V-Agent: ficheros con historial de versiones, comandos de shell, búsqueda web, navegador autónomo, peticiones HTTP y servidores MCP.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, visión o audio: no disponible; no se documentan.
- Tool calling / function calling: no documentado explícitamente en la model card, aunque el contexto de agentes y MCP lo hace plausible; no se confirma.

## Casos de uso

- Agente local de escritorio en Windows: el modelo está pensado para ejecutarse dentro de V-Agent, que ofrece herramientas de ficheros, shell, navegador y MCP con aprobación por acción; el tamaño de 9,77 GiB permite cargarlo en GPUs de consumo y operar sin enviar datos a la nube.
- Automatización de tareas de desarrollo: con acceso a shell y validación de sintaxis de código generado, puede emplearse para refactorizaciones guiadas, generación de scripts y comprobaciones de HTML en tiempo de ejecución dentro de un pipeline local.
- Asistente conversacional con contexto de proyecto: la arquitectura híbrida atención-SSM está diseñada para manejar secuencias largas con coste recurrente; aunque la longitud de contexto no está documentada, el modelo es adecuado para conversaciones multi-turno sobre un repositorio o carpeta aislada.
- Investigación sobre cuantización selectiva: el mapa por tensor permite estudiar el impacto de mantener el camino SSM en F32 mientras se comprime la FFN a 2 bits, un caso de interés para quienes investigan la robustez de arquitecturas híbridas bajo cuantización agresiva.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 9,77 GiB, cabe en tarjetas de 12-16 GB de VRAM y deja margen para el contexto KV; sirve para prototipos de agentes y pruebas de integración antes de escalar a variantes mayores de la familia (MiniPlus 13,31 GiB, NanoPlus 11,47 GiB).
- Procesamiento por lotes de texto en local: mediante llama.cpp o servidores compatibles, puede usarse para clasificación, resumen o extracción de información en entornos con requisitos de privacidad, sin depender de APIs externas.
- Evaluación comparativa de la familia APEX: permite contrastar la variante MicroPlus con MiniPlus y NanoPlus sobre las mismas tareas para medir la pérdida de calidad atribuible a la compresión de las FFN a IQ2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,77 GiB solo para los pesos en la variante MicroPlus; hay que sumar la caché KV y el overhead de llama.cpp, por lo que en la práctica se recomienda un margen de 2-4 GB adicionales según la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y, con contexto reducido, RTX 4070 (12 GB) o RTX 3060 (12 GB). Para despliegues multiusuario, A100 o H100 con mayor paralelismo.
- ¿Cabe en GPU de consumo? Sí: la variante MicroPlus es la más pequeña de la familia y está diseñada para caber en tarjetas de 12 GB o superiores; las variantes NanoPlus (11,47 GiB) y MiniPlus (13,31 GiB) requieren más VRAM.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan y CPU), V-Agent (aplicación de escritorio del autor, con detección de encaje en GPU), y servidores compatibles con endpoints OpenAI/Claude según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted MicroPlus (esta ficha) | ~27,3 B | no disponible | GGUF mixta, 9,77 GiB | Apache 2.0 | Hugging Face, 480 descargas |
| Qwen3.8-27B-pi-adapted NanoPlus | ~27,3 B | no disponible | GGUF, 11,47 GiB | Apache 2.0 | Hugging Face (misma familia) |
| Qwen3.8-27B-pi-adapted MiniPlus | ~27,3 B | no disponible | GGUF, 13,31 GiB | Apache 2.0 | Hugging Face (misma familia) |
| Modelo base `harness-hub/Qwen3.8-27B-pi-adapted` | ~27,3 B | no disponible | safetensors (precisión original) | no disponible | Hugging Face |

La comparación con modelos de otras familias (por ejemplo, Qwen2.5 de 32B o Llama 3.x de 27-32B) no se incluye porque no hay datos de benchmarks ni de contexto que permitan una comparación rigurosa; indicarlo como "no disponible" sería lo correcto para cualquier alternativa externa.

## Limitaciones y advertencias

- La información disponible procede únicamente de la model card del cuantizador; no hay documentación del modelo base sobre datos de entrenamiento, alineamiento o evaluación.
- No se han publicado benchmarks: no es posible afirmar qué calidad conserva la variante MicroPlus frente al modelo base ni frente a las variantes NanoPlus y MiniPlus.
- La cuantización agresiva de las FFN a IQ2_S e IQ2_XXS puede degradar el razonamiento matemático y la generación de código; el autor no aporta mediciones al respecto.
- Los tensores recurrentes en F32 protegen la estabilidad del camino SSM, pero no garantizan la fidelidad global del modelo.
- Riesgo de alucinación: no evaluado; cualquier uso en producción requiere validación propia.
- Sesgos: no documentados. Al no conocerse la composición del dataset, no se pueden caracterizar sesgos de género, idioma o dominio.
- Idiomas soportados: no declarados; no se debe asumir multilingüismo sin pruebas.
- Longitud de contexto: no disponible; la ventana efectiva debe determinarse empíricamente con llama.cpp.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene verificar el repositorio `harness-hub/Qwen3.8-27B-pi-adapted`.
- La etiqueta `pi-adapted` no se explica en la model card; se desconoce si implica restricciones de uso o un ajuste específico.
- El repositorio ocupa 21,3 GB aunque la variante MicroPlus pesa 9,77 GiB, lo que sugiere que incluye ficheros adicionales (mapa de tensores, posiblemente otras variantes); verificar antes de descargar.
- El modelo se distribuye como GGUF; no hay safetensors de esta variante, por lo que no es directamente utilizable con frameworks que no soporten GGUF.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Imatrix utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (fichero `imatrix_unsloth.gguf`, commit `4af51b3542f775b0a8e4b310bfb3f17e01c306c9`)
- V-Agent (aplicación de escritorio del autor): https://github.com/IsValorum/V-Agent
- Última release de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum

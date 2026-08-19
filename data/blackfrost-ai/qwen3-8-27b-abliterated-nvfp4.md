# Blackfrost-AI/Qwen3.8-27B-ABLITERATED-NVFP4

## Resumen

Qwen3.8-27B-ABLITERATED-NVFP4 es un checkpoint de investigación de Blackfrost-AI, derivado del modelo oficial Qwen3.8-27B de Alibaba. Se trata de una cuantización W4A4 NVFP4 realizada con NVIDIA ModelOpt, pensada para servir de forma eficiente en GPUs Blackwell (B200). El modelo mantiene la arquitectura densa híbrida del Qwen3.8-27B (Gated DeltaNet + atención completa), con 27B parámetros nominales, una ventana de contexto nativa de 262.144 tokens y capacidades multimodales de entrada (texto, imagen y vídeo) con salida de texto.

La característica distintiva de este checkpoint es que ha sido sometido a una modificación a nivel de pesos de la superficie de rechazo (refusal surface), reduciendo los rechazos del modelo ante solicitudes potencialmente sensibles. Según la model card, el resultado es un 2,4% de rechazos residuales sobre un conjunto de 450 casos (AdvBench, StrongREJECT y XSTest). Es una vista previa pública de investigación sin gating, con licencia Apache 2.0, y no debe confundirse con el checkpoint de seguridad original de Qwen.

El modelo se distribuye en formato safetensors con metadatos ModelOpt NVFP4, en 4 shards que ocupan aproximadamente 30,26 GB. Está validado para servir con SGLang en una NVIDIA B200. Es relevante para investigadores en seguridad, red-teaming y despliegue eficiente de VLMs en hardware Blackwell, aunque su superficie de rechazo reducida implica riesgos importantes para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B denso híbrido VLM (Gated DeltaNet + atención completa) |
| Parametros totales | 27B nominales (18.548.690.160 según pesos safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; contexto práctico depende de memoria de servicio y concurrencia |
| Tipos de cuantizacion | W4A4 NVFP4 (NVIDIA ModelOpt) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con metadatos ModelOpt NVFP4 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un VLM denso que combina capas de Gated DeltaNet (una variante de state space model con puertas) con capas de atención completa. Esta arquitectura híbrida busca equilibrar eficiencia computacional y capacidad de razonamiento sobre secuencias largas. El checkpoint de Blackfrost es una derivación cuantizada: no se aplicó pruning, SFT, DPO, LoRA ni merge. La única modificación adicional es un ajuste a nivel de pesos de la superficie de rechazo, mediante un "banco de direcciones" interno y un prompt de ejecución incrustado en la plantilla de chat nativa de Qwen. No se proporcionan datos sobre el dataset de entrenamiento original ni sobre el proceso de cuantización (calibración, etc.).

La cuantización W4A4 NVFP4 reduce los pesos y activaciones a 4 bits usando el formato de punto flotante NVFP4 de NVIDIA, específico para hardware Blackwell. Esto permite un servicio más rápido y con menor uso de memoria que el BF16 original, a costa de una ligera degradación en calidad: la perplexidad WikiText-2 medida pasa de 8,4764 (BF16 limpio) a 9,3677 en este checkpoint.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades conversacionales y de razonamiento del Qwen3.8-27B, incluyendo soporte para tareas complejas de múltiples pasos.
- Visión y vídeo: acepta entradas de imagen y vídeo (además de texto) y produce salida de texto; pipeline declarado como `image-text-to-text`.
- Tool calling / function calling: soportado según los tags de la model card, aunque no se detallan ejemplos ni evaluación específica.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para tareas que requieren procesar documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: no especificadas; se asume herencia del modelo Qwen base, pero sin confirmación en la documentación disponible.
- Superficie de rechazo reducida: el checkpoint está diseñado para responder con menos rechazos ante solicitudes sensibles, lo que lo hace útil para investigación en seguridad y red-teaming.
- Template de chat operativo incrustado: el prompt de ejecución final de Blackfrost está integrado una vez en la plantilla de chat nativa de Qwen.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo permite estudiar cómo se comportan los VLMs ante prompts adversarios o de contenido sensible sin los rechazos habituales, facilitando la evaluación de riesgos y el desarrollo de contramedidas. Su superficie de rechazo reducida (2,4% residual) lo hace adecuado para pruebas controladas en entornos de laboratorio.
- Evaluación de robustez multimodal: al aceptar imagen, vídeo y texto, se puede probar la resistencia del modelo ante ataques multimodales (por ejemplo, prompts visuales maliciosos) y comparar con el checkpoint original de Qwen.
- Desarrollo de pipelines de servicio eficiente en Blackwell: con W4A4 NVFP4 y soporte para SGLang, el modelo sirve como referencia para medir latencia y throughput en B200, útil para optimizar despliegues de VLMs en producción con hardware de última generación.
- Benchmarking de cuantización: investigadores que estudien el impacto de NVFP4 en modelos híbridos (DeltaNet + atención) pueden usar este checkpoint para comparar perplexidad, calidad de generación y rendimiento frente al BF16 original.
- Análisis de alucinación y coherencia en contexto largo: con 262K tokens de ventana, se pueden diseñar experimentos sobre recuperación de información en documentos extensos y detectar degradaciones introducidas por la cuantización.
- Pruebas de tool calling y agentes: el modelo conserva capacidades de tool calling, por lo que puede integrarse en entornos de prueba para evaluar si la cuantización W4A4 afecta a la fiabilidad de las llamadas a funciones en flujos agénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye dos métricas:

| Metrica | Valor |
|---|---|
| Perplexidad WikiText-2 (word) | 9,3677 |
| Perplexidad WikiText-2 (byte) | 1,5195 |
| Bits/byte | 0,6036 |

Para referencia, el modelo BF16 limpio obtiene 8,4764 de perplexidad word y 0,5766 bits/byte. La evaluación de rechazo reporta 11 refusals residuales sobre 450 casos (2,4%), desglosados en 1 de AdvBench, 5 de StrongREJECT y 5 de XSTest. No se proporcionan datos de latencia, throughput ni comparativas con otros modelos en tareas de razonamiento o codificación.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa aproximadamente 30,26 GB; con overhead de inferencia y KV cache, se recomienda al menos 40-50 GB de VRAM para contexto moderado. Para contexto largo (262K tokens), la memoria necesaria supera ampliamente esa cifra.
- GPU recomendadas: NVIDIA B200 (validada en la model card). Se requieren GPUs Blackwell con soporte nativo para NVFP4 (B100, B200, GB200). No es compatible con GPUs Ampere, Ada Lovelace o Hopper sin emulación de NVFP4.
- En consumer GPU: no cabe en GPUs de consumo actuales (RTX 4090 tiene 24 GB, insuficiente incluso para los pesos sin cuantización adicional).
- Opciones de despliegue: SGLang (recomendado en la model card con configuración específica para B200). Otros motores compatibles con Qwen3.8 y ModelOpt NVFP4 podrían funcionar, pero no están documentados.
- Latencia y throughput: no disponibles. La configuración de ejemplo usa `--tp-size 1`, `--context-length 8192`, `--max-running-requests 8` y `--mamba-full-memory-ratio 0.95` en una B200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27B | 262K | BF16 | Apache 2.0 | Checkpoint de seguridad original; sin derisking |
| Blackfrost Qwen3.8-27B-ABLITERATED-NVFP4 | 27B | 262K | W4A4 NVFP4 | Apache 2.0 | Derisked, superficie de rechazo reducida, requiere Blackwell |
| Blackfrost Qwen3.8-27B-ABLITERATED-BF16 | 27B | 262K | BF16 | Apache 2.0 | Versión maestra sin cuantizar del mismo derisking |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) entre estos modelos. La única comparación cuantitativa disponible es la perplexidad WikiText-2: el checkpoint NVFP4 degrada ligeramente frente al BF16 (9,37 vs 8,48). En cuanto a la superficie de rechazo, el derisking reduce los rechazos del 19,6% (88/450) en el template original al 2,4% final.

## Limitaciones y advertencias

- Superficie de rechazo reducida: el modelo puede generar contenido dañino, ilegal o no seguro. No es el checkpoint de seguridad original de Qwen y no debe usarse en producción sin salvaguardas externas.
- Estado de investigación: es una vista previa pública sin gating, no un producto comercial. La evaluación está en curso y los resultados deben interpretarse con cautela.
- Degradación por cuantización: la perplexidad WikiText-2 empeora un ~10% respecto al BF16 original (9,37 vs 8,48). No se ha evaluado el impacto en codificación, visión, tool use o contexto largo.
- Requisitos de hardware restrictivos: solo funciona en GPUs Blackwell con soporte NVFP4. No es desplegable en hardware común de centros de datos (A100, H100) ni en GPUs de consumo.
- Datos de entrenamiento no disponibles: no se documentan los datos de calibración, el dataset original ni el proceso de derisking, lo que dificulta la reproducibilidad.
- Riesgo de alucinación y coherencia: no se han publicado evaluaciones específicas de alucinación o coherencia en tareas de razonamiento o generación larga; los datos de perplexidad no garantizan calidad en tareas reales.
- Restricciones de uso: la model card indica que no está a la venta y que es solo para investigación. Aunque la licencia es Apache 2.0, el uso comercial de un modelo derisked puede plantear problemas éticos y legales.
- Contexto práctico limitado: aunque la ventana nativa es de 262K tokens, el contexto efectivo depende de la memoria disponible y la concurrencia; en la configuración de ejemplo se usa 8K.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-NVFP4
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil de Blackfrost en X (Twitter): https://x.com/Blackfrost_AI

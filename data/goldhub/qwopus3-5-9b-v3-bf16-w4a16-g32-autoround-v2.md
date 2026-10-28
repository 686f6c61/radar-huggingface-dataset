# goldhub/Qwopus3.5-9B-v3-BF16-W4A16-G32-AutoRound-v2

## Resumen

Qwopus3.5-9B-v3-BF16-W4A16-G32-AutoRound-v2 es una cuantización INT4 del modelo Jackrong/Qwopus3.5-9B-v3, a su vez un fine-tune de Qwen/Qwen3.5-9B sobre el que se ha añadido una torre visual y una cabeza de predicción multi-token (MTP). Lo publica el usuario goldhub, responsable también del proyecto Ruach Studio, un entorno de escritura asistida donde estos mismos pesos se ejecutan como modelo generador. El problema que resuelve es pragmático: permitir servir un modelo multimodal de la familia Qwen3.5 en una GPU de 16-24 GB sin renunciar a las capas que más degradación sufren al cuantizar.

La decisión técnica más característica es selectiva: el autor mantiene en BF16 la atención lineal (proyecciones, conv1d, A_log, dt_bias y normas de Gated DeltaNet), la torre visual completa, los embeddings de entrada y salida y la cabeza MTP. El resultado pesa unos 11 GB en lugar de los ~5 GB de una cuantización INT4 ingenua, un compromiso explícito entre calidad de alineamiento multimodal y consumo de memoria.

Es relevante ahora porque demuestra un patrón de cuantización consciente de la arquitectura para modelos híbridos con atención lineal y visión, y porque incluye repacks GGUF verificados para llama.cpp, lo que abre su uso en tarjetas de 8 GB. La contrapartida es que no hay benchmarks ni mediciones de velocidad publicadas: la validación descrita es cualitativa (aritmética, JSON válido, letras en ruso e inglés).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 con atención lineal Gated DeltaNet, torre visual y cabeza de predicción multi-token (MTP) |
| Parámetros totales | 4.619.132.144 según los tensores safetensors del repositorio; el nombre comercial indica 9B y la model card no explica la discrepancia |
| Parámetros activos | no disponible (no se documenta como modelo MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue con vLLM; máximo nativo no disponible |
| Tipos de cuantización | W4A16 AutoRound (group_size=32, simétrico, empaquetado auto_gptq) con capas selectivas en BF16; repacks GGUF Q4_0, Q4_K, Q5_K, Q6_K y Q8_0 en repositorio aparte |
| Idiomas soportados | en, ru, uk, el, he |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (INT4 empaquetado + capas BF16), tamaño de repositorio 11,2 GB; GGUF en goldhub/Ruach_Studio_Models_v2 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, una arquitectura híbrida que combina atención lineal Gated DeltaNet con capas de atención convencional, más una torre visual para entrada image-text-to-text. Sobre él, Jackrong/Qwopus3.5-9B-v3 aplica un fine-tune, y goldhub añade la cuantización. La cabeza MTP (multi-token prediction) sugiere soporte de decodificación especulativa, aunque la model card no detalla cómo se explota en inferencia.

El proceso de cuantización usa AutoRound 0.15 con 2500 iteraciones, W4A16, grupo de 32 y empaquetado auto_gptq. La calibración emplea 1000 muestras de 2048 tokens de un conjunto mixto que cubre razonamiento, código, escritura de formato largo y textos propios en ruso, ucraniano, griego y hebreo. Se preservan en BF16 las proyecciones `linear_attn.*`, `model.visual.*`, `embed_tokens`, `lm_head` y `mtp.*`; el autor justifica además que vLLM fusiona `in_proj_qkv` e `in_proj_z` en una sola `in_proj_qkvz`, por lo que ambas deben compartir precisión. No se especifican el volumen de tokens de entrenamiento del modelo original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: la model card cita comprobaciones de aritmética y datos factuales correctos con el pensamiento desactivado en llama.cpp.
- Comprensión de imágenes: pipeline image-text-to-text con torre visual conservada íntegra en BF16 en la versión safetensors.
- Generación de código: el conjunto de calibración incluye código, aunque no se publican evaluaciones específicas.
- Escritura de formato largo: capacidades declaradas de long-form writing, verificadas cualitativamente mediante la generación de un briefing de canción como JSON válido con sus secciones.
- Multilingüismo: inglés, ruso, ucraniano, griego y hebreo, con calibración específica en los cuatro últimos; se documentan letras generadas en ruso e inglés.
- Predicción multi-token: cabeza MTP presente en los pesos safetensors, ausente en los repacks GGUF.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la model card menciona explícitamente "thinking off" en las pruebas con llama.cpp, lo que implica que existe un modo de razonamiento activable, sin más detalles.

## Casos de uso

- Asistencia a la escritura creativa y de formato largo: el modelo se emplea como Writer dentro de Ruach Studio, generando borrados, secciones y briefings estructurados en JSON; su ventana de 65.536 tokens permite mantener el contexto de un proyecto narrativo completo.
- Generación y edición de contenido multilingüe en ruso, ucraniano, griego y hebreo: la calibración de AutoRound incluyó textos en estos idiomas, lo que reduce la degradación típica de la cuantización en lenguas de pocos recursos frente a una calibración solo en inglés.
- Descripción y análisis de imágenes: al conservar la torre visual en BF16, es adecuado para tareas image-text-to-text donde la fidelidad perceptiva importa más que el ahorro de memoria.
- Despliegue en estaciones de trabajo con una sola GPU de 16 GB: el ejemplo de vLLM de la model card cabe en ese presupuesto de VRAM, lo que permite servir el modelo en hardware de gama alta consumer o profesional de entrada.
- Prototipado en tarjetas de 8 GB: el repack GGUF compacto de 5,5 GB está dimensionado explícitamente para ese límite, útil para pruebas locales con llama.cpp u Ollama sin renunciar a la variante de mayor calidad.
- Extracción de datos estructurados: la verificación documentada de generar un JSON válido con secciones lo sitúa como candidato para pipelines de parseo de documentos a esquemas, aunque sin garantías medidas de tasa de acierto.
- Evaluación comparativa de recetas de cuantización: al publicar la receta exacta (AutoRound 0.15, W4A16, grupo 32, 2500 iteraciones, capas preservadas), sirve como referencia reproducible para estudiar el impacto de cuantizar atención lineal y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se ha medido la velocidad en GPU para esta tarjeta ("We have not measured speed on GPUs for this card yet"), y las comprobaciones descritas son cualitativas: aritmética y datos factuales correctos, briefing de canción en JSON válido y letras en ruso e inglés.

## Requisitos de hardware

- VRAM para inferencia: 16 GB suficientes para los pesos según la model card; 24 GB para trabajar con contexto largo.
- Repacks GGUF: variante "quality" de 6,7 GB (Q4_0 con bloques exactos, resto en Q8_0), apta para GPU de 8-12 GB; variante "compact" de 5,5 GB pensada para una tarjeta de 8 GB.
- GPU recomendadas: no se enumeran modelos concretos (A100, H100, RTX 4090) en la información disponible; las cifras de VRAM apuntan a RTX 4080/4090, A6000 o L40S para la versión safetensors y a tarjetas de 8 GB para el GGUF compacto.
- Cabe en GPU consumer: sí, en el rango de 8 a 24 GB según la variante elegida.
- Opciones de despliegue: vLLM mediante `vllm serve goldhub/Qwopus3.5-9B-v3-BF16-W4A16-G32-AutoRound-v2 --max-model-len 65536 --gpu-memory-utilization 0.9`; llama.cpp con los GGUF de goldhub/Ruach_Studio_Models_v2. El repositorio incluye `chat_template.jinja`. TGI, Ollama y otros motores no se mencionan.
- Latencia y throughput: no disponibles; no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldhub/Qwopus3.5-9B-v3-BF16-W4A16-G32-AutoRound-v2 | 4.619.132.144 (safetensors); nombre comercial 9B | 65.536 tokens (configuración de ejemplo) | W4A16 AutoRound + BF16 selectivo; GGUF | Apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Jackrong/Qwopus3.5-9B-v3 (modelo base del fine-tune) | no disponible en la información | no disponible | pesos completos, presumiblemente BF16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B (modelo original) | no disponible en la información | no disponible | pesos completos | Apache-2.0 | HuggingFace |
| Repack GGUF Q4_0 en goldhub/Ruach_Studio_Models_v2 | mismos pesos | no disponible | Q4_0 (+ Q8_0 en capas preservadas); solo texto | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar calidad frente a estas alternativas; la diferencia documentada es exclusivamente de formato y de huella de memoria (11,2 GB del repo safetensors frente a 6,7 GB y 5,5 GB de los GGUF).

## Limitaciones y advertencias

- No hay benchmarks ni mediciones de latencia o throughput: cualquier decisión de producción debe basarse en una evaluación propia.
- El nombre del modelo indica 9B pero los tensores safetensors suman 4.619.132.144 parámetros; la model card no aclara la discrepancia, así que conviene verificar la arquitectura antes de dimensionar el despliegue.
- El autor no ha medido la degradación introducida por la cuantización; solo afirma que preservar atención lineal y visión en BF16 evita pérdida de alineamiento, sin datos que lo respalden.
- Los repacks GGUF son solo texto: pierden la torre visual y la cabeza MTP, por lo que no sirven para casos image-text-to-text ni para decodificación especulativa con MTP.
- Idiomas cubiertos limitados a inglés, ruso, ucraniano, griego y hebreo; no se declara soporte de castellano, lo que supone un riesgo de rendimiento inferior en ese idioma.
- El modo thinking existe pero no está documentado en detalle; las pruebas citadas se hicieron con el pensamiento desactivado.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar los términos del modelo original por si hubiera condiciones adicionales no reflejadas aquí.
- Señales de adopción nulas: 0 descargas y 1 like en el momento de la ficha, sin validación independiente de la comunidad.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goldhub/Qwopus3.5-9B-v3-BF16-W4A16-G32-AutoRound-v2
- Modelo base del fine-tune: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Repacks GGUF: https://huggingface.co/goldhub/Ruach_Studio_Models_v2/tree/main/checkpoints/Qwopus3.5-9B-GGUF
- Proyecto Ruach Studio: https://github.com/igrbible/Ruach_Studio
- AutoRound (Intel): https://github.com/intel/auto-round

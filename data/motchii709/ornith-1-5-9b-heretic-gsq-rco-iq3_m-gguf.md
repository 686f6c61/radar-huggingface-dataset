# motchii709/Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M-GGUF

## Resumen

Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M es una cuantización GGUF en formato IQ3_M del modelo Ornith-1.5-9B, un transformer de aproximadamente 8.950 millones de parámetros desarrollado originalmente por DeepReinforce AI (Ornith AI) bajo licencia MIT. Esta versión concreta, publicada por el usuario motchii709, parte de un build "abliterated" (es decir, con el alineamiento de seguridad eliminado deliberadamente) creado por Thunder13240 mediante la herramienta Heretic, y aplica sobre él una asignación de tipos de cuantización por tensor heredada de otro build comunitario de estilo GSQ-RCO.

El modelo base emplea una arquitectura híbrida identificada en el GGUF como `qwen35`, que combina atención con componentes de estado recurrente (tensores `ssm_alpha`), y está orientado a generación de texto conversacional con modo de razonamiento interno mediante bloques `<think>`. El archivo contiene únicamente el modelo de texto (427 tensores); la entrada de imagen requiere un proyector de visión `mmproj` distribuido por separado en el repositorio de Thunder13240.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de cuantización comunitaria de bajo bit (IQ3_M, unos 4,25 GB) pensada para ejecución en hardware de consumo con llama.cpp; por otro, advierte de que el modelo ha sido sometido a abliteración, carece de guardarraíles de seguridad y no debe tratarse como un modelo alineado para producción sin controles externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con componentes de estado recurrente (SSM); arquitectura declarada en el GGUF: `qwen35` |
| Parametros totales | 8.953.803.264 (≈ 8,95 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de servidor del autor usa `-c 8192` |
| Tipos de cuantizacion | IQ3_M (este archivo); el ecosistema del modelo base incluye Q8_0 y otros builds GGUF del repositorio de Thunder13240 |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (427 tensores, solo modelo de texto; sin tensores MTP/nextn) |
| Tamano del archivo | 4.252.508.672 bytes (≈ 4,25 GB) |
| Imatrix incluida | `imatrix.gguf`, 10.307.808 bytes (≈ 10,3 MB) |
| Descargas | 1031 |
| Fecha de creacion | 2026-10-29 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 8,95 mil millones de parámetros con una arquitectura que el GGUF etiqueta como `qwen35` y que incorpora tensores de estado recurrente (`blk.*.ssm_alpha.weight`), lo que indica un diseño híbrido entre atención y mecanismos de estado tipo SSM. El modelo razona por defecto dentro de bloques `<think>`, comportamiento heredado del modelo base y documentado en la model card del build heretic de origen.

Esta ficha concreta no documenta el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO): esa información no está disponible en el material proporcionado. Lo que sí está documentado es el proceso de cuantización de esta release, que es una transferencia de asignación de tipos por tensor y no un recálculo GSQ/RCO desde cero. Se extrajeron los tipos de cuantización por tensor del GGUF IQ3_M donante (`abenzerps/Ornith-1.5-9B-GSQ-RCO-GGUF`, 274 tensores bidimensionales), se generó una importance matrix local con `llama-imatrix` sobre un conjunto mixto de wikitext-2 en inglés y Wikipedia japonesa (20231101), con 200 fragmentos de 512 tokens de contexto, y se ejecutó `llama-quantize --tensor-type-file … --allow-requantize --imatrix …` usando el archivo Q8_0 heretic como entrada.

La fidelidad de la asignación no es exacta: 242 de 274 tensores 2D coinciden con el donante, y los 32 restantes fueron sobrescritos por el cuantizador con tipos de mayor precisión (`ssm_alpha.weight` de BF16 a F32 en 24 tensores; `attn_output.weight` de IQ2_S/IQ3_S/IQ4_XS a Q6_K en 8 tensores, bloques 3, 7, 11, 15, 19, 23, 27 y 31). Ningún tensor fue degradado, y el archivo resultante es 55.443.456 bytes (≈ 1,3 %) mayor que un build con coincidencia exacta. La abliteración se realizó con Heretic (Philipp Emanuel Weidmann), basada en ablación direccional según Arditi et al. 2024.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con continuaciones fluidas verificadas mediante pruebas de humo con `llama-cli` a temperatura 0.
- Razonamiento interno en modo "thinking": el modelo emite su cadena de razonamiento dentro de bloques `<think>` por defecto, desactivable mediante los controles de razonamiento del runtime.
- Capacidad de visión condicionada: el modelo base admite entrada de imagen, pero requiere el proyector `mmproj` que no se incluye en este repositorio y debe obtenerse del repositorio de Thunder13240.
- Sin alineamiento de seguridad: la abliteración eliminó los rechazos, con una medición de 0/100 rechazos genuinos según la model card upstream citada.
- No dispone de decodificación especulativa MTP: el GGUF no contiene tensores MTP/nextn, por lo que `--spec-type draft-mtp` no está disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información proporcionada, aunque el modo `<think>` es compatible con flujos de razonamiento encadenado.

## Casos de uso

- Inferencia local en hardware de consumo: el archivo de 4,25 GB en IQ3_M permite ejecutar un modelo de 9B en GPU con 6-8 GB de VRAM o en CPU con suficiente RAM, usando `llama-cli` o `llama-server` con `-ngl 99` para descargar todas las capas en GPU.
- Servicio de chat autoalojado: `llama-server -m … -ngl 99 -c 8192` levanta un endpoint compatible con la API de OpenAI, adecuado para prototipos internos de conversación en inglés o japonés sin dependencia de la nube.
- Investigación sobre abliteración y seguridad: el modelo sirve como sujeto de estudio para medir el efecto de la ablación direccional sobre la tasa de rechazos y la calidad de las respuestas, comparándolo con el modelo base alineado.
- Evaluación de técnicas de cuantización: al incluir la imatrix y documentar la desviación respecto al donante, es un caso reproducible para estudiar el impacto de las asignaciones por tensor y de las sobrescrituras del cuantizador en la perplejidad y la coherencia.
- Generación de texto creativo sin filtros: para aplicaciones de ficción, guiones o role-play donde los rechazos del modelo base resultan un obstáculo, con la advertencia de que el contenido generado no está moderado.
- Procesamiento de texto en japonés: el conjunto de calibración incluyó Wikipedia japonesa y las pruebas de humo verificaron coherencia en ese idioma, lo que lo hace utilizable para tareas de generación y resumen en japonés en entornos locales.
- Canalización con visión (con matiz): si se descarga el `mmproj` del repositorio de Thunder13240, puede emplearse para descripción de imágenes o respuesta a preguntas visuales, aunque esta release no incluye el proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama cifras de perplejidad ni de benchmarks para este archivo concreto; solo se documentan pruebas de humo cualitativas (fluidez y coherencia en inglés y japonés, sin garbling) con razonamiento desactivado y temperatura 0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con el archivo IQ3_M de 4,25 GB, más overhead de contexto KV; con `-c 8192` el consumo adicional de caché depende de la arquitectura híbrida y no está cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para carga completa; tarjetas de 8 GB como la RTX 3060 Ti o RTX 4060 son suficientes; A100 y H100 quedan sobredimensionadas para este tamaño, salvo por agregación de concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse parcialmente en CPU con offload parcial de capas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`); el formato GGUF es compatible con otros runners basados en llama.cpp, pero la información proporcionada solo documenta explícitamente llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. El entorno de construcción fue una T4 gratuita de Google Colab, lo que da una referencia mínima de que la cuantización se completó en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M (esta ficha) | 8,95B | No disponible (ejemplo a 8192) | IQ3_M, 4,25 GB | MIT | Abliterado, solo texto, sin MTP |
| Thunder13240/Ornith-1.5-9B-heretic-GGUF (origen de pesos) | 8,95B | No disponible | Q8_0 y otros | MIT | Incluye `mmproj` para visión; abliterado |
| abenzerps/Ornith-1.5-9B-GSQ-RCO-GGUF (donante de asignación) | 8,95B | No disponible | IQ3_M y otros | MIT | Build GSQ-RCO de referencia; no abliterado |
| ornith-ai/Ornith-1.5-9B (modelo base) | 8,95B | No disponible | Safetensors (original) | MIT | Alineado, con rechazos; punto de partida de la cadena |

La comparación con modelos de otras familias (por ejemplo, Qwen, Llama o Mistral de tamaño similar) no está disponible en la información proporcionada, y no se aportan cifras de rendimiento que permitan un contraste cuantitativo.

## Limitaciones y advertencias

- Modelo abliterado sin guardarraíles: el alineamiento de seguridad fue eliminado deliberadamente upstream, con 0/100 rechazos genuinos medidos por el autor del build heretic. No es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni de perplejidad para este archivo; la cuantización IQ3_M introduce pérdida de precisión adicional respecto al Q8_0 de origen.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto no especificado: la longitud máxima de contexto del modelo base no se documenta en la información disponible; el ejemplo del autor usa 8192 tokens, que no debe interpretarse como el límite arquitectónico.
- Sin decodificación especulativa MTP: la ausencia de tensores MTP/nextn impide usar `--spec-type draft-mtp` en llama.cpp, lo que limita las optimizaciones de latencia disponibles.
- Desviación de la asignación donante: 32 tensores 2D no coinciden con el build GSQ-RCO de referencia; aunque la desviación va hacia mayor precisión y fue aceptada por el constructor, invalida comparaciones bit a bit con el donante.
- Visión incompleta: el archivo no incluye el proyector `mmproj`; sin él, el modelo es solo de texto.
- Muestreo delicado: se recomienda `repeat-penalty 1.05` (1.0 puede provocar bucles y 1.1 truncamientos) y se desaconseja la decodificación greedy.
- Licencia MIT: permite uso comercial y redistribución, pero no exime al usuario de responsabilidad legal sobre el contenido generado sin filtros.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/motchii709/Ornith-1.5-9B-heretic-GSQ-RCO-IQ3_M-GGUF
- Build heretic de origen (pesos y `mmproj`): https://huggingface.co/Thunder13240/Ornith-1.5-9B-heretic-GGUF
- Donante de la asignación GSQ-RCO: https://huggingface.co/abenzerps/Ornith-1.5-9B-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp

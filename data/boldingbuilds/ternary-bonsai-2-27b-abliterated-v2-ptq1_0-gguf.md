# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF

## Resumen

Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF es una cuantización GGUF, en formato PTQ1_0 a 1,75 bits por peso, del modelo Ternary Bonsai 2 27B de PrismML, modificada por el usuario BoldingBuilds para eliminar sus comportamientos de rechazo ("abliterated"). El modelo base emplea una arquitectura ternaria con pesos de tres estados y componentes SSM (etiquetado como `qwen3_5` y con tensores `ssm_out`), lo que permite comprimir un modelo de 27 mil millones de parámetros en apenas 5,9 GB, ejecutable en una única GPU de consumo.

La versión v2 corrige dos problemas de la v1: la eliminación de rechazos (editando 98 tensores de `ffn_down`, `ssm_out` y `attn_output` en los bloques 15–63) y un fallo en el modo de razonamiento, donde el modelo agotaba su presupuesto de tokens antes de cerrar el bloque `</think>`. La corrección modifica una fila de la capa de salida para que el modelo cierre su razonamiento correctamente. Según las pruebas del autor, con `reasoning_effort` en modo medium responde a 199 de 200 prompts de seguridad dentro de un presupuesto de 4.096 tokens.

Es relevante porque demuestra que los modelos ternarios de peso bajo pueden ejecutarse localmente en hardware de consumo y ser modificados post-cuantización sin re-cuantizar. Su principal caveat práctico es que requiere el fork de llama.cpp de PrismML: las versiones principales de llama.cpp, Ollama y LM Studio sin soporte PTQ1_0 no podrán cargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con componentes SSM, pesos ternarios (etiqueta qwen3_5) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en los ajustes del autor); máximo no disponible |
| Tipos de cuantización | PTQ1_0 (1,75 bits por peso, empaquetado ternario) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B de PrismML, una arquitectura ternaria que almacena los pesos en un empaquetado de tres estados (+1, 0, -1) con dígitos de corrección en formatos como PTQ1_0 y PQ2_0. La presencia de tensores `ssm_out` y la etiqueta `qwen3_5` indican una arquitectura híbrida que combina atención con capas de espacio de estados (SSM). No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO para este modelo base.

Sobre esta base, BoldingBuilds aplica dos modificaciones post-cuantización sin re-cuantizar el archivo: la eliminación de rechazos editando 98 tensores (`ffn_down`, `ssm_out`, `attn_output`, bloques 15–63) y una corrección del razonamiento que modifica una fila de `output.weight` (el token `</think>`, id 248069). En total se modifican 99 de 851 tensores, un 1,13 % de los bytes del archivo. La corrección del razonamiento en PTQ1_0 reproduce el cambio de la versión PQ2_0 con similitud coseno de 0,91 y el 87 % de su fuerza, ya que PTQ1_0 no puede almacenar un dígito +2 que sí admite PQ2_0.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (thinking) activado por defecto en esta versión.
- Razonamiento multi-paso con presupuesto de esfuerzo configurable (`reasoning_effort`: medium recomendado si el presupuesto de tokens es ajustado).
- Generación de código: 158 de 164 problemas de HumanEval resueltos en modo medium con presupuesto de 4k tokens.
- Seguimiento de instrucciones: 505 de 541 en IFEval strict con presupuesto de 16k tokens.
- Sin rechazos: el modelo responde a solicitudes dañinas sin aplicar filtros de seguridad (0 % de rechazos en SimpleSafetyTests).
- Capacidad de visión teóricamente presente en el modelo base, pero sin evaluación y sin el proyector `mmproj` incluido en este repositorio.
- Soporte de tool calling / function calling: no disponible.

## Casos de uso

- Ejecución local en GPU de consumo: con 5,9 GB de tamaño, cabe íntegramente en una RTX 3090 (24 GB) e incluso en GPUs de 8 GB, permitiendo inferencia totalmente offline sin depender de APIs externas.
- Experimentación con arquitecturas ternarias: al requerir el fork de llama.cpp de PrismML, es adecuado para desarrolladores que quieran evaluar el ecosistema PTQ1_0 y el rendimiento de modelos de peso ternario en CUDA.
- Asistentes conversacionales sin filtros: la abliteración elimina los rechazos manteniendo la calidad de respuesta (StrongReject 0,971 en medium), útil para entornos de investigación donde los rechazos del modelo interfieren con las pruebas.
- Generación de código asistida: con 158/164 en HumanEval, puede integrarse en flujos de autocompletado y generación de código local con presupuesto de contexto de 16k–32k tokens.
- Seguimiento de instrucciones complejas: su puntuación de 505/541 en IFEval strict lo hace viable para tareas de formateo y cumplimiento de restricciones detalladas en prompts.
- Investigación en seguridad de modelos: al publicar métricas detalladas de rechazo, sobre-rechazo y fuga de tokens `</think>`, sirve como referencia para estudiar técnicas de abliteración y sus efectos colaterales.
- Chatbot de razonamiento con presupuesto controlado: el parámetro `reasoning_effort` en medium evita que el modelo agote el presupuesto de tokens dentro de su bloque de razonamiento, algo crítico en aplicaciones con límites de salida estrictos.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este archivo concreto (thinking activado, seed 0, presupuesto de 4.096 tokens salvo indicación):

| Métrica | Stock PTQ1_0 | v1 PTQ1_0 | v2 PTQ1_0 | v2 PTQ1_0 (medium) |
|---|---:|---:|---:|---:|
| Rechazo en prompts dañinos | 81 % | 0 % | 0 % | 0 % |
| Dañinos: sin respuesta | 0 % | 24 % | 18 % | 1 % |
| Dañinos: agotó presupuesto | 0 % | 31 % | 26 % | 0 % |
| StrongReject (0–1) | 0,179 | 0,640 | 0,774 | 0,971 |
| Seguros: sin respuesta | 10 % | 20 % | 10 % | 0 % |
| Sobre-rechazo en prompts seguros | 0,0 % | 0,0 % | 0,0 % | 0,0 % |

Comparativa con v2 PQ2_0 (mismo tamaño de muestra, mismo juez):

| Métrica | v2 PTQ1_0 | v2 PQ2_0 |
|---|---:|---:|
| StrongReject, por defecto | 0,774 | 0,796 (p = 0,54) |
| StrongReject, medium | 0,971 | 0,978 |
| HumanEval (de 164), medium, 4k | 158 | 159 |
| IFEval strict (de 541), 16k | 505 | 497 |

Comparativa con otras construcciones abliteradas PTQ1_0 (StrongReject, por defecto): dealignai CRACK 0,766; OS-Software Heretic 0,673.

No se han publicado resultados de MMLU, MATH ni StrongReject de 150 prompts medidos sobre este archivo; esas cifras existen solo para la variante PQ2_0 y deben considerarse indicativas, no medidas, para este archivo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6 GB para los pesos (5,9 GB del archivo GGUF), más la sobrecarga de KV cache según contexto; con contexto de 32k tokens, 8–12 GB de VRAM son un margen razonable.
- GPU de prueba verificada: RTX 3090 (CUDA), con `-ngl 99` (descarga completa a GPU).
- Cabe en GPUs de consumo: sí; con 5,9 GB de pesos, debería funcionar en GPUs de 8 GB o más con contexto moderado. Metal y CPU no están probados.
- Software requerido: exclusivamente el fork de llama.cpp de PrismML (https://github.com/PrismML-Eng/llama.cpp). Mainline llama.cpp, Ollama y LM Studio sin soporte PTQ1_0 no cargan el archivo.
- Comando recomendado por el autor: `llama-server -m Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0.gguf -ngl 99 -fa on -c 32768 --jinja --chat-template-kwargs '{"reasoning_effort":"medium"}'`.
- Ajustes de muestreo: temperatura 1,0, top-k 20, top-p 0,95 (valores por defecto del archivo).
- Latencia y throughput: no disponibles (no se publican mediciones de tokens/segundo).
- Alternativa con más VRAM: la variante v2 PQ2_0 + MTP (7,2 GB) ofrece decodificación MTP un ~40 % más rápida y evaluación completa; el autor la recomienda si hay VRAM suficiente.

## Comparativa con modelos similares

| Modelo | Tamaño de archivo | Formato | StrongReject (default) | HumanEval (de 164) | Licencia | Requisito de software |
|---|---:|---|---:|---:|---|---|
| Ternary-Bonsai-2-27B v2 PTQ1_0 (este) | 5,9 GB | GGUF PTQ1_0 ternario | 0,774 | 158 | Apache 2.0 | Fork PrismML de llama.cpp |
| Ternary-Bonsai-2-27B v2 PQ2_0 + MTP | 7,2 GB | GGUF PQ2_0 ternario + MTP | 0,796 | 159 | Apache 2.0 | Fork PrismML de llama.cpp |
| Ternary-Bonsai-2-27B v1 PTQ1_0 | 5,9 GB | GGUF PTQ1_0 ternario | 0,640 | no disponible | Apache 2.0 | Fork PrismML de llama.cpp |
| Dealignai CRACK (PTQ1_0) | no disponible | GGUF PTQ1_0 | 0,766 | no disponible | no disponible | Fork PrismML de llama.cpp |
| OS-Software Heretic (PTQ1_0) | no disponible | GGUF PTQ1_0 | 0,673 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere software específico: el fork de llama.cpp de PrismML es obligatorio; las builds principales de llama.cpp, Ollama y LM Studio sin soporte PTQ1_0 no cargarán el archivo.
- Sin soporte verificado fuera de CUDA: solo probado en RTX 3090; Metal y CPU no están testeados.
- La corrección del razonamiento es más débil que en PQ2_0: reproduce el cambio con coseno 0,91 y 87 % de fuerza, lo que se traduce en más respuestas en blanco con effort por defecto (18 % frente a 15 %).
- Fuga ocasional de `</think>`: 1 de 1.105 generaciones mostró un tag de cierre repetido en la respuesta.
- Ausencia de filtros de seguridad: el modelo responde a solicitudes dañinas sin rechazarlas (ese es su propósito). Su uso conlleva riesgos legales y éticos significativos; el autor lo publica para investigación y el usuario asume la responsabilidad del despliegue.
- Sin evaluación de MMLU, MATH ni StrongReject de 150 prompts sobre este archivo concreto: las cifras de esas suites corresponden a la variante PQ2_0 y solo son indicativas.
- Sin visión evaluada: el archivo `mmproj` no está incluido; habría que usar el proyector correspondiente de PrismML.
- Sin MTP: la cabeza MTP sobre PTQ1_0 solo aportó +1,6 % en la v1, por lo que no se incluye.
- Sesgos y riesgo de alucinación: no disponibles; no se publican evaluaciones de factualidad para este modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.
- Descargas y adopción muy bajas (1.303 descargas, 2 likes), con historial corto: el modelo es reciente y con poca verificación comunitaria.

## Enlaces

- Ficha del modelo: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Variante v2 PQ2_0 + MTP (evaluación completa y MTP): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Versión anterior v1 PTQ1_0: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Fork de llama.cpp de PrismML (requisito para ejecutarlo): https://github.com/PrismML-Eng/llama.cpp

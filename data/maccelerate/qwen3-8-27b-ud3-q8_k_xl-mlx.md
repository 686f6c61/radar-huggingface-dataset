# maccelerate/Qwen3.8-27B-UD3-Q8_K_XL-MLX

## Resumen

Qwen3.8-27B-UD3-Q8_K_XL-MLX es una recodificación nativa en formato MLX affine del checkpoint cuantizado Q8_K_XL de Unsloth Dynamic v3.0 para Qwen3.8-27B. Lo publica el usuario maccelerate y está pensado exclusivamente para ejecutarse en Apple Silicon mediante `mlx-serve`, no con `mlx-lm` estándar. El resultado es un modelo solo texto de 31,44 GB, con 8.500 bits efectivos por peso cuantizado y 27.320.697.856 parámetros totales, de los cuales 24,75 B están cuantizados a 8 bits.

El interés de esta ficha es doble. Por un lado, es un ejemplo de conversión que respeta la asignación por tensor del GGUF de origen: maccelerate lee la tabla de tipos ggml del `UD-Q8_K_XL` de unsloth y cuantiza los pesos bf16 limpios de `Qwen/Qwen3.8-27B` a la misma anchura en el formato de MLX. Por otro, conserva la cabeza MTP (multi-token prediction) inline, lo que permite decodificación especulativa si el runtime la habilita.

Se trata de una publicación reciente (18 de septiembre de 2026), con 0 descargas y 0 me gusta en el momento de redactar esta ficha, sin benchmarks publicados y con una advertencia importante: `mlx-lm` 0.31.3 puede cargar el modelo pero genera salida corrupta, porque aplica dos veces la transformación de normalización de Qwen3.8 al interpretar la presencia de pesos MTP. El autor indica que la única vía soportada es `mlx-serve`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No descrita explícitamente en la model card; las clases de tensores del checkpoint incluyen atención (Q/K/V/O), bloques GDN (in-proj QKV, in-proj Z, out-proj, puertas A/B) y estado SSM, lo que indica un diseño híbrido atención/GDN |
| Parámetros totales | 27.320.697.856 (27,32 B) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Parámetros cuantizados | 24,75 B (26,29 GB en disco), a 8.500 bits efectivos por peso cuantizado |
| Parámetros en bf16 | Resto de tensores (normas, sesgos, pesos de convolución y estado SSM); aproximadamente 2,57 B por diferencia con el total |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8-bit MLX affine en las 453 matrices cuantizadas; bf16 para normas, sesgos, convoluciones y estado SSM. La asignación proviene del `UD-Q8_K_XL` de Unsloth Dynamic v3.0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (15 shards, formato MLX affine), 31,44 GB |
| Biblioteca | mlx |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Runtime soportado | mlx-serve; no soportado por mlx-lm estándar |
| Tamaño del repositorio | 31,5 GB |
| Fecha de publicación | 2026-09-18 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento en la model card: no se indican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta la asignación de pesos es la estructura del modelo base. La tabla de clases de tensores incluye atención Q/K/V/O (0,50 B de parámetros), bloques GDN con in-proj QKV (2,52 B), in-proj Z (1,51 B), out-proj (1,51 B) y puertas A/B (0,02 B), además de estado SSM que permanece en bf16. Esta combinación apunta a una arquitectura híbrida de atención y red GDN/SSM en lugar de un transformer denso convencional, si bien la model card no describe el diseño con detalle y la ficha del modelo base no forma parte de la información proporcionada.

La innovación técnica relevante en este checkpoint es el proceso de conversión y la conservación de la cabeza MTP. maccelerate lee la tabla de tipos ggml del GGUF `Qwen3.8-27B-UD-Q8_K_XL.gguf` de unsloth y reencoda los pesos bf16 limpios de Qwen a la misma anchura por tensor en el formato affine de MLX. El autor es explícito en que no hay paridad numérica con los libros de códigos K-quant de llama.cpp: se replica la asignación de anchuras, no los valores. La cabeza MTP se almacena inline (23 tensores `language_model.mtp.*` y una capa MTP declarada en la configuración), lo que habilita decodificación especulativa si el runtime la activa. La torre de visión se omite deliberadamente.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo lleva la etiqueta `conversational`.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint, siempre que el runtime la habilite.
- Inferencia local en Apple Silicon a través de MLX, con cuantización de KV cache opcional (`--kv-quant 8` en la configuración de referencia).
- Modelo solo texto: la torre de visión está omitida, por lo que no hay capacidades multimodales.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (no se documenta en la model card).
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con privacidad estricta: al ejecutarse íntegramente en el Mac del usuario mediante `mlx-serve`, los prompts y las respuestas no salen del equipo, lo que encaja en entornos con datos sensibles que no pueden enviarse a APIs externas.
- Generación y revisión de código en un portátil de trabajo: un modelo de 27 B con 8 bits efectivos es viable para autocompletado, explicación de fragmentos y refactorización sin GPU dedicada, siempre que el equipo disponga de memoria unificada suficiente para los 31,44 GB de pesos.
- Servicio de chat interno en una estación de trabajo Apple Silicon: `mlx-serve --model /ruta/al/modelo --kv-quant 8` expone el modelo como servicio local para aplicaciones de la misma máquina, útil en demostraciones y entornos de desarrollo cerrados.
- Procesamiento por lotes de textos en local: resumen, extracción de información y clasificación sobre documentos internos ejecutados de forma desatendida, aprovechando que no hay coste por token ni dependencia de red.
- Investigación en decodificación especulativa: la cabeza MTP inline permite medir la ganancia de throughput de las propuestas multi-token frente a la decodificación autorregresiva clásica, comparando configuraciones de runtime.
- Evaluación de cuantizaciones: sirve como punto de comparación dentro de la familia Unsloth Dynamic v3.0 (variantes Q4–Q6 frente a Q8_K_XL) para estudiar la degradación de calidad según la anchura asignada por tensor.
- Reproducción de pipelines de conversión: junto con el repositorio de maccelerate, permite auditar el flujo completo GGUF dinámico → bf16 limpio → MLX affine, incluida la validación estructural registrada en `manifest.json`.
- Desarrollo de aplicaciones offline en campo: escenarios sin conectividad fiable (auditoría, investigación de campo) donde se necesita un modelo de 27 B en un equipo portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de la búsqueda web no contienen datos sobre este modelo ni sobre su modelo base.

## Requisitos de hardware

- Plataforma: obligatoriamente Apple Silicon con macOS. El formato MLX no se ejecuta en GPU NVIDIA o AMD.
- Almacenamiento: al menos 32 GB libres para los ficheros del modelo (31,44 GB repartidos en 15 shards safetensors) más espacio de trabajo adicional para la descarga.
- Memoria unificada: la model card no valida ninguna configuración mínima. Los pesos solos ocupan 31,44 GB, de modo que cualquier equipo con 32 GB de memoria unificada tendría que acomodar además el KV cache, la longitud de contexto y las peticiones concurrentes. Como estimación orientativa, 64 GB o más de memoria unificada es el rango razonable para uso interactivo; no hay validación publicada.
- Cuantización de KV cache: el autor propone `--kv-quant 8` como configuración de referencia, aclarando que no es una garantía de memoria para cualquier longitud de contexto o carga de trabajo.
- GPU dedicada: no aplica. Para hardware con CUDA, la alternativa es el GGUF de origen `unsloth/Qwen3.8-27B-GGUF` con llama.cpp; esta recodificación MLX no sirve para ese propósito.
- Opciones de despliegue: `mlx-serve` es el runtime soportado. `mlx-lm` 0.31.3 carga el modelo pero produce salida corrupta (aplica dos veces la transformación de normalización de Qwen3.8), por lo que no debe usarse.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni curvas de latencia según longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| maccelerate/Qwen3.8-27B-UD3-Q8_K_XL-MLX (este) | 27,32 B (24,75 B cuantizados) | No disponible | safetensors MLX | 8-bit affine, 8.500 bits efectivos/peso | Apache-2.0 | Solo Apple Silicon, requiere mlx-serve, conserva cabeza MTP |
| Qwen/Qwen3.8-27B | 27,32 B | No disponible | No disponible | bf16 (sin cuantizar) | No disponible en la información proporcionada | Modelo base; referencia de calidad frente a la versión cuantizada |
| unsloth/Qwen3.8-27B-GGUF (`UD-Q8_K_XL`) | 27,32 B (misma asignación por tensor) | No disponible | GGUF | Q8_K_XL según Unsloth Dynamic v3.0 | Apache-2.0 según esta ficha | Origen de la asignación de anchuras; ejecutable con llama.cpp, sin paridad numérica con la versión MLX |

No se dispone de información sobre otros modelos comparables de la misma categoría dentro del material proporcionado.

## Limitaciones y advertencias

- Incompatibilidad con `mlx-lm` estándar: la versión 0.31.3 carga el checkpoint pero genera salida corrupta al aplicar dos veces la normalización de Qwen3.8. Usar `mlx-serve`.
- No hay paridad numérica con el GGUF de origen: se replica la asignación de bits por tensor, no los libros de códigos K-quant de llama.cpp, por lo que las salidas pueden diferir del `UD-Q8_K_XL` ejecutado en llama.cpp.
- Modelo solo texto: la torre de visión se omite de forma deliberada, así que no admite entradas de imagen.
- Requisito de memoria elevado: 31,44 GB de pesos implican memoria unificada alta; no se ha validado ningún mínimo y el KV cache y el contexto añaden consumo adicional.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de calidad multilingüe para este checkpoint ni para el modelo base en la información disponible.
- Idiomas no declarados: se desconoce el soporte real de idiomas distintos del inglés y no hay evaluación al respecto.
- Sesgos: no evaluados ni documentados en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha publicado ninguna evaluación de veracidad específica para esta recodificación.
- Madurez de la publicación: 0 descargas y 0 me gusta, publicada el 18 de septiembre de 2026; no cuenta con validación de la comunidad.
- Licencia: los pesos, el GGUF de origen y el código de conversión se declaran bajo Apache-2.0, lo que permite uso comercial; conviene revisar igualmente los términos y la atribución del modelo base Qwen y del GGUF de unsloth.
- Resultados de búsqueda web: las consultas realizadas no devolvieron información relevante sobre el modelo; los enlaces obtenidos corresponden a un sitio administrativo sin relación con el tema.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/maccelerate/Qwen3.8-27B-UD3-Q8_K_XL-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio de conversión maccelerate: https://github.com/maccelerate-ai/maccelerate
- Nota de compatibilidad con mlx-lm: https://github.com/maccelerate-ai/maccelerate/blob/main/docs/qwen38-mlx-lm-compatibility.md
- Runtime mlx-serve: https://github.com/ddalcu/mlx-serve
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.

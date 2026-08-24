# LanguaMan/Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo **Qwen3.8-27B-Uncensored-GGUF** es una versión cuantizada y "desensurada" del modelo base Qwen/Qwen3.8-27B, desarrollada por el usuario LanguaMan y publicada en Hugging Face. El objetivo es eliminar parcialmente el comportamiento de rechazo (refusal) del modelo original mediante la técnica de abliteración, que extrae direcciones de rechazo en el espacio de activaciones y las elimina sin reentrenamiento. La publicación se centra en la inferencia local con `llama.cpp`, incluyendo el cabezal de predicción multi-token (MTP) conservado y verificado, lo que permite decodificación especulativa eficiente.

El modelo mantiene la arquitectura original de Qwen3.8-27B: un transformer de 64 capas con 27.320 millones de parámetros, una ventana de contexto de 262.144 tokens y soporte de visión (aunque esta versión GGUF no incluye el codificador visual). Se ofrecen seis niveles de cuantización (desde IQ2_M hasta Q8_0) con tamaños de archivo que van de 10,6 GB a 29,0 GB, lo que permite ejecutarlo en hardware de consumo. La licencia es Apache-2.0, lo que permite uso comercial, y los idiomas soportados son inglés y chino.

Esta ficha es relevante para desarrolladores que buscan un modelo de 27B parámetros sin censura para aplicaciones locales de generación de texto, con la garantía de que el MTP head está intacto y verificado, algo poco común en modelos abliterados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer, 64 capas) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el base, pero el repo solo contiene GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas y 27.320 millones de parámetros, con una ventana de contexto de 262.144 tokens. La versión descensurada se obtiene mediante abliteration con la herramienta Heretic, que co-minimiza el número de rechazos frente a la divergencia KL respecto al modelo base. El proceso se realiza en bf16 (sin cuantización intermedia) y el LoRA resultante se fusiona en el modelo base, de modo que los pesos publicados no son una ronda de cuantización.

Una característica técnica destacable es que se conserva el cabezal MTP (multi-token prediction) del modelo original, copiado verbatim desde el checkpoint base. Esto permite la decodificación especulativa en llama.cpp, mejorando la velocidad de inferencia sin degradar la calidad (el draft head se entrena contra el modelo sin modificar, por lo que la tasa de aceptación puede caer ligeramente). La importancia matrix (imatrix) se calcula directamente sobre el f16, no sobre una cuantización intermedia, para una calibración precisa. Todos los archivos GGUF se inspeccionan tras la cuantización para verificar que los tensores `mtp.*` están presentes.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades completas de Qwen3.8-27B, incluyendo razonamiento de varios pasos y comprensión de instrucciones complejas.
- Soporte de vision: la arquitectura incluye un torre de visión, pero la versión GGUF publicada no incluye el tensor de visión (la familia `vision-f16` existe pero no se incluye en este repo). Se puede usar con texto únicamente.
- Multilingue: soporta ingles y chino de forma nativa.
- Compatibilidad con decodificacion especulativa: el cabezal MTP integrado permite usarlo como modelo de borrador en llama.cpp (con `--model-draft` o como fused).
- Tool calling y function calling: no se menciona explícitamente en la model card, pero al ser el mismo modelo base Qwen3.8-27B, es probable que lo soporte; no hay confirmación en la informacion proporcionada.
- Capacidad de agentes y multi-step reasoning: no se especifica, pero se puede inferir de las capacidades del modelo base (no verificado).
- Vision: el modelo base soporta vision, pero esta versión no incluye los tensores de visión; no disponible en esta publicacion.

## Casos de uso

- Chat local sin censura: el modelo puede usarse como asistente conversacional en entornos donde se requiera respuestas sin restricciones de contenido, por ejemplo, en investigación de comportamiento de modelos o prototipado de aplicaciones de rol.
- Generacion de codigo en entornos de desarrollo: con 27B parámetros, puede generar y completar codigo en varios lenguajes; la ventana de 256K permite procesar repositorios enteros. Se puede integrar en IDEs mediante APIs locales.
- Razonamiento y analisis de documentos largos: la ventana de 262.144 tokens permite resumir o analizar libros, informes técnicos o logs extensos sin necesidad de chunking.
- Creacion de contenido creativo sin restricciones: escritura de ficcion, guiones o contenido que los modelos censurados rechazarian, como narrativas para adultos o temas polémicos.
- Investigacion academica sobre alineacion y seguridad: el modelo descensurado permite estudiar el comportamiento de rechazo, la eficacia de la abliteration y las diferencias con el modelo base.
- Despliegue en produccion con decodificacion especulativa: gracias al MTP head, se puede servir en llama.cpp con `--model-draft` para reducir la latencia en aplicaciones de generación en tiempo real.
- Fine-tuning y experimentacion: los pesos GGUF pueden usarse como punto de partida para cuantizaciones adicionales o para pruebas de adaptación de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye únicamente la perplexidad en wikitext-2, medida en esta build para cada cuantizacion. Se incluye la tabla:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (baseline, no publicado) | 7.1557 +/- 0.25104 | - |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7.1573 +/- 0.25055 | +0.0016 |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7.1583 +/- 0.25019 | +0.0026 |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7.1689 +/- 0.25149 | +0.0132 |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7.1764 +/- 0.25195 | +0.0207 |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7.1814 +/- 0.25227 | +0.0257 |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7.8581 +/- 0.27481 | +0.7024 |

Nota: el autor advierte que todas las filas excepto IQ2_M están dentro de un intervalo de 0.026 con un error estándar de ~0.25, por lo que no son estadísticamente distinguibles entre sí ni del f16. Solo IQ2_M se separa significativamente (2.8 errores estándar por encima del baseline). No se debe concluir que Q8_0 es peor que Q5_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantizacion:
  - IQ2_M: ~10,6 GB (cabe en GPUs de 12 GB, por ejemplo RTX 3060, RTX 4070)
  - IQ4_XS: ~15,3 GB (cabe en 16 GB, por ejemplo RTX 4080, RTX 4090)
  - Q4_K_M: ~16,8 GB (similar a IQ4_XS, requiere 16-20 GB)
  - Q5_K_M: ~19,5 GB (requiere 20-24 GB, por ejemplo RTX 4090, A10G)
  - Q6_K: ~22,4 GB (requiere 24 GB, por ejemplo RTX 3090/4090, A10)
  - Q8_0: ~29,0 GB (requiere 32 GB, por ejemplo A100, V100 32GB, o dual GPU)
- GPU recomendadas: para inferencia en consumo, una RTX 4090 (24 GB) puede ejecutar Q6_K; para Q8_0 se necesita una GPU de 32 GB o más (A100, H100).
- Opciones de despliegue: llama.cpp (soporta MTP y decodificación especulativa), vLLM (si se convierte a safetensors), Ollama (si se importa el GGUF), TGI (con conversión).
- Latencia y throughput: no hay datos publicados. Con MTP, se puede esperar una mejora del 20-40% en tokens/segundo respecto a decodificación autoregresiva estándar, pero no está medido en la documentación.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Cuantizaciones | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262K | Apache-2.0 | safetensors, bf16 | Modelo original con censura |
| LanguaMan/Qwen3.8-27B-Uncensored-GGUF | 27,3B | 262K | Apache-2.0 | IQ2_M a Q8_0 | Abliterado, MTP conservado |
| zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF | 27,3B | 262K | Apache-2.0 | GGUF | Otra variante uncensored con MTP (no se tienen datos de calidad) |
| Qwen3.8-27B-Instruct (si existiera) | 27,3B | 262K | Apache-2.0 | - | No confirmado |

No hay datos de benchmarks comparativos publicados. La diferencia principal es la eliminación de rechazos y la conservación del MTP. El rendimiento de PPL es equivalente al base en las cuantizaciones altas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: el modelo mantiene los sesgos del Qwen3.8-27B original. La abliteration no corrige sesgos de contenido, solo reduce los rechazos. Puede alucinar con confianza en temas no entrenados.
- **Riesgo de contenido inapropiado**: el modelo puede generar contenido ofensivo, ilegal o peligroso. El autor declara que el comportamiento de rechazo está "sustancialmente reducido", pero no eliminado. No es adecuado para uso en producción sin filtros adicionales.
- **Idiomas**: solo ingles y chino. No soporta español ni otros idiomas de forma nativa.
- **Contexto**: la ventana de 262K tokens es grande, pero el uso de más de ~128K tokens puede degradar la calidad del texto generado (no especificado).
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia (Apache-2.0) que se hereda. No hay restricciones adicionales.
- **MTP**: la tasa de aceptación del borrador puede ser ligeramente inferior a la del modelo original, pero la salida siempre se verifica contra el modelo objetivo, por lo que la calidad no se degrada.
- **Uso responsable**: el modelo es "uncensored" y puede producir contenido dañino. Se recomienda usarlo solo en entornos controlados de investigación o con sistemas de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LanguaMan/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Blog sobre ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog sobre GGUF abliterado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio alternativo de cuantizaciones: https://huggingface.co/zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF
- GitHub de un proyecto relacionado: https://github.com/unburdened-jackinthebox365/qwen38-uncensored

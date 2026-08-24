# ChengyiX/Qwen3.8-27B-DFlash2-LocalFlash-M4Max

## Resumen

LocalFlash es un repositorio de configuración y documentación, no un modelo con pesos nuevos. ChengyiX publica una receta reproducible para servir el modelo Qwen3.8-27B (27 000 millones de parámetros) en cuantización MLX de 4 bits sobre Apple Silicon, utilizando el drafter DFlash 2 de z-lab para decodificación especulativa por difusión de bloques. El objetivo es acelerar la inferencia en cargas de trabajo de agentes de código con contexto largo, logrando velocidades de decodificación de hasta 809 tokens por segundo en un M4 Max de 64 GB, frente a los ~15 tok/s de la línea base con llama.cpp.

La relevancia actual radica en que ofrece una alternativa de bajo coste para ejecutar modelos grandes localmente en hardware de consumo de Apple, sin pérdida de calidad en la salida, gracias a la técnica de block-diffusion que genera múltiples tokens candidatos en paralelo y los verifica de forma adaptativa. El repositorio incluye la configuración exacta del motor oMLX (fork de MLX), instrucciones de verificación de integridad de los pesos y resultados medidos de latencia y rendimiento. No se alojan ficheros de pesos aquí; se utilizan los artefactos aguas arriba de mlx-community y z-lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con drafter DFlash 2 (block-diffusion) |
| Parámetros totales | 27 000 millones (modelo base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativa, según medidas del autor) |
| Tipos de cuantización | MLX 4-bit para el modelo principal; 4-bit para el drafter (pesos y activaciones) |
| Idiomas soportados | Inglés (según model card; el modelo base Qwen3.8-27B puede soportar más, pero no se especifica aquí) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) – sin pesos alojados en este repositorio |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros. Este repositorio no introduce modificaciones en los pesos, sino que documenta la configuración de un servidor de inferencia basado en el fork oMLX de z-lab (versión 0.6.2-dflash2). La innovación principal es el uso del drafter DFlash 2, un modelo de difusión por bloques que genera múltiples tokens candidatos en paralelo para acelerar la decodificación especulativa. El drafter se cuantiza a 4 bits tanto en pesos como en activaciones (con tamaño de grupo 64), y se configura con un tamaño de bloque de 5 según las recomendaciones de z-lab para modelos cuantizados.

El entrenamiento del modelo base (Qwen3.8-27B) sigue el esquema estándar de Qwen, con fases de preentrenamiento y ajuste fino, pero los detalles específicos (número de tokens, composición del dataset, RLHF) no se detallan en este repositorio. El drafter DFlash 2 se entrena por separado para imitar la distribución de salida del modelo principal, permitiendo una verificación adaptativa que mantiene la calidad mientras acelera la generación.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-27B.
- Soporte de modo de pensamiento (thinking mode) con parámetros de muestreo específicos: temperatura 1.0, top_p 0.95, top_k 20.
- Niveles de esfuerzo de razonamiento (xhigh, medium, low) configurados mediante argumentos del chat-template.
- Capacidad de manejar contextos largos (262k tokens) para tareas de agentes de código y sesiones multi-turno.
- Aceleración de decodificación mediante block-diffusion: hasta 809 tokens/s en M4 Max (frente a ~15 tok/s con llama.cpp).
- Cache de prefijo L1 que reduce el tiempo de primer token en turnos consecutivos de 435 segundos a 8-16 segundos.
- Compatible con el ecosistema MLX y oMLX para despliegue en Apple Silicon.

## Casos de uso

- **Agentes de código en entornos locales**: el modelo puede ejecutar tareas de autocompletado y generación de código en tiempo real gracias a la alta velocidad de decodificación (809 tok/s), lo que permite una interacción fluida en editores como VS Code o Neovim.
- **Sesiones de conversación multi-turno con contexto largo**: la cache de prefijo y la ventana de 262k tokens permiten mantener conversaciones de asistencia técnica o análisis de documentos sin perder el hilo, reduciendo la latencia de 435 s a 8-16 s en turnos posteriores.
- **Análisis y razonamiento sobre documentos extensos**: con 262k tokens de contexto, se pueden procesar manuales, contratos o informes de cientos de páginas, y el modo de pensamiento permite respuestas razonadas.
- **Prototipado de agentes autónomos**: la combinación de decodificación acelerada y soporte de tool calling (heredado de Qwen) permite construir agentes que interactúan con APIs o herramientas externas en tiempo real.
- **Desarrollo de aplicaciones de código en entornos sin GPU**: el despliegue en Apple Silicon (M4 Max) ofrece una alternativa de bajo coste frente a clústeres con GPUs dedicadas, adecuada para desarrolladores individuales.
- **Automatización de tareas de análisis de datos**: con el contexto extendido y la velocidad de generación, se puede crear un asistente que lea y resuma datasets, genere informes y ejecute consultas de forma iterativa.

## Benchmarks y rendimiento

El autor ha publicado mediciones en un M4 Max de 64 GB con macOS 27.0. La tabla siguiente compara la configuración LocalFlash con la línea base de llama.cpp (misma máquina, mismo modelo en cuantización 4-bit).

| Métrica | llama.cpp (base) | LocalFlash (DFlash2) |
|---|---|---|
| Decodificación (mediana) | ~15 tok/s | **809 tok/s** |
| TTFT en prompt fresco de 32.5k | 435 s cada turno | 486 s solo la primera vez |
| TTFT en turno con prefijo cacheado | — | **8–16 s** |
| Ventana de contexto | 32k | 262k nativa |
| Recall de aguja en 70k | — | 5/5 ordenado |

Los datos provienen de mediciones del autor, disponibles en el repositorio GitHub `chengyixu/qwen38-dflash2-bench` en la carpeta `results/raw/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en esta información, por lo que no se incluyen.

## Requisitos de hardware

- **Hardware mínimo**: Apple Silicon con chip M4 Max y 64 GB de memoria unificada (el entorno de pruebas del autor).
- **VRAM estimada**: el modelo principal en MLX 4-bit ocupa aproximadamente 15-16 GB (27B × 4 bits ≈ 13.5 GB + overhead), el drafter 4-bit añade un pequeño margen adicional. En un sistema con 64 GB unificados, cabe sin problemas.
- **GPU recomendadas**: no aplicable para GPU NVIDIA; el despliegue está orientado a Apple Silicon (M4 Max, M4 Pro, M3 Max con suficiente memoria).
- **Opciones de despliegue**: el servidor oMLX (fork de z-lab, versión 0.6.2-dflora) es el único motor compatible con esta configuración. No se ha probado con vLLM, llama.cpp u Ollama en este contexto.
- **Latencia y throughput**: 809 tok/s de decodificación mediana y TTFT de 8-16 s en turnos con caché, medidos en M4 Max. En hardware inferior el rendimiento será menor.
- **Verificación de integridad**: se recomienda verificar los hashes de los pesos antes de servir, ya que el autor reportó corrupción de shards durante descargas reanudadas (los archivos tenían cabeceras válidas y tamaños correctos, pero el modelo emitía texto incoherente).

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.8-27B + DFlash2 (LocalFlash)** | 27B | 262k | MLX 4-bit | MIT | Repos de configuración, pesos en mlx-community |
| **Qwen3.8-27B (base, sin drafter)** | 27B | 262k (según spec) | Varias (GGUF, MLX, etc.) | MIT | Hugging Face |
| **Muse Glimmer + DFlash2** | no disponible | no disponible | no disponible | no disponible | Referencia en foro de NVIDIA, sin datos |

La comparativa con otros modelos de la misma categoría no está disponible porque no se han publicado benchmarks comparativos con alternativas distintas a llama.cpp. El repositorio se centra en la aceleración de inferencia, no en la calidad del modelo.

## Limitaciones y advertencias

- **Solo para Apple Silicon**: la configuración está diseñada exclusivamente para hardware de Apple (M4 Max probado). No es aplicable a GPUs NVIDIA o AMD sin adaptación.
- **Requiere verificación de integridad**: el autor advierte de corrupción silenciosa de shards durante descargas reanudadas, lo que provoca salidas incoherentes. Es obligatorio verificar los hashes antes del primer uso.
- **Solo inglés**: la model card indica idioma en, por lo que no se garantiza un rendimiento óptimo en otros idiomas.
- **Sin pesos propios**: este repositorio no contiene los pesos del modelo; depende de los artefactos de `mlx-community` y `z-lab`. Si estos se eliminan o cambian, la configuración puede fallar.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje grande, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- **Restricciones de licencia**: la licencia MIT permite uso comercial y modificación, pero el modelo base Qwen3.8-27B tiene su propia licencia (no indicada aquí; consultar el repositorio original).
- **Caveat de producción**: el modo de pensamiento con temperatura alta (1.0) puede producir respuestas menos deterministas; para aplicaciones críticas se recomienda ajustar los parámetros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChengyiX/Qwen3.8-27B-DFlash2-LocalFlash-M4Max
- Repositorio GitHub de benchmarks: https://github.com/chengyixu/qwen38-dflash2-bench
- Modelo base (MLX 4-bit): https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Fork oMLX con DFlash2: https://github.com/z-lab/omlx-fork/releases
- Guía de DFlash2 en HackerNoon: https://hackernoon.com/qwen38-27b-dflash2-a-guide-to-faster-qwen-inference
- Foro de NVIDIA sobre DFlash2: https://forums.developer.nvidia.com/t/qwen-3-8-27b-dflash2/380617
- Repositorio alternativo con ejemplo de uso: https://github.com/47thtechcorner/RayCodes_Qwen_3.8_DFlash2

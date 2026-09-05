# mradermacher/Qwen2.5-Coder-3B-Uncensored-GGUF

## Resumen
Este modelo es la versión cuantizada en formato GGUF del modelo base `bappi/Qwen2.5-Coder-3B-Uncensored`, publicada por el usuario `mradermacher`. Se trata de un modelo de generación de código de aproximadamente 3.085 millones de parámetros, orientado al inglés, cuya característica distintiva es que no ha sido sometido a un proceso de alineamiento de seguridad ("Uncensored"). La cuantización en GGUF permite ejecutarlo en local con herramientas como llama.cpp u Ollama, reduciendo la memoria necesaria a entre 1.4 y 6.3 GB según la precisión elegida. No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni la longitud de contexto en la documentación proporcionada.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es una cuantización estática (GGUF) del modelo base `bappi/Qwen2.5-Coder-3B-Uncensored`, realizada por `mradermacher`. Según la información disponible, el modelo utiliza la biblioteca `transformers` y sus pesos originales están en formato `safetensors` con 3.085.938.688 parámetros. No se proporcionan detalles sobre la arquitectura interna (tipo de transformer, número de capas, dimensiones, etc.), los datos de entrenamiento, el número de tokens ni si hubo procesos de RLHF o DPO. Tampoco se describen innovaciones técnicas específicas. La cuantización incluye los tipos Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16, todos en formato GGUF.

## Capacidades
- Generación de código y texto en inglés, según la denominación del modelo y la etiqueta de idioma en HuggingFace.
- Etiquetado como "conversational" en HuggingFace, lo que indica uso conversacional básico.
- No se especifica soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de thinking en la información proporcionada. Estas capacidades no se pueden confirmar.
- El carácter "Uncensored" implica que el modelo no ha pasado por alineamiento de seguridad, por lo que puede generar respuestas sin filtros, aunque no se dispone de documentación que detalle este comportamiento.

## Casos de uso
- Asistente de código en local: puede integrarse en editores como VS Code mediante servidores de completado basados en llama.cpp, generando fragmentos de código o funciones completas en inglés.
- Ejecución en hardware limitado: las cuantizaciones Q4_K_M o Q4_K_S ocupan alrededor de 2.0 GB, lo que permite ejecutar el modelo en portátiles con GPU de 4 GB o incluso en CPU con suficiente RAM.
- Recerca sobre alineamiento y censura: al ser un modelo "Uncensored" de 3B, resulta útil para estudiar el efecto de la ausencia de filtros de seguridad en la generación de código y textos problemáticos.
- Análisis de código legacy: puede usarse para procesar archivos de código en lote, generar explicaciones de funciones complejas o proponer refactorizaciones básicas en proyectos de tamaño pequeño.
- Educación en programación: en entornos de bootcamps o cursos, puede generar ejemplos de código y soluciones de ejercicios sin las restricciones impuestas por modelos alineados, en un contexto controlado por el docente.
- Copilot privado en redes aisladas: desplegado con Ollama o llama.cpp en una red local, permite asistir en la escritura de código sin enviar el código fuente a servicios externos en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada por cuantización (sin considerar caché KV):
  - Q2_K (1.4 GB): aproximadamente 2–3 GB, adecuado para GPU de 4 GB.
  - Q3_K_M (1.7 GB): aproximadamente 3 GB, adecuado para GPU de 4 GB.
  - Q4_K_M (2.0 GB): aproximadamente 3.5–4 GB, adecuado para GPU de 6 GB (RTX 3060, RTX 4060).
  - Q5_K_M (2.3 GB): aproximadamente 4–5 GB, recomendable GPU de 6–8 GB.
  - Q6_K (2.6 GB): aproximadamente 4.5–5.5 GB, recomendable GPU de 8 GB.
  - Q8_0 (3.4 GB): aproximadamente 5–6 GB, recomendable GPU de 8 GB.
  - f16 (6.3 GB): aproximadamente 8–9 GB, recomendable GPU de 12 GB o superior.
- Para desplegar en CPU se necesita una RAM similar a la del archivo GGUF, más la memoria del contexto. Con Q4_K_M sería suficiente con unos 4 GB de RAM para contextos cortos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier frontend compatible con GGUF.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Al ser un modelo "Uncensored", no se ha verificado que haya recibido alineamiento de seguridad; puede generar contenido inapropiado, ofensivo o peligroso.
- La licencia del modelo no está especificada, por lo que no se puede confirmar si es apto para uso comercial. Es necesario verificar la licencia del modelo base antes de cualquier despliegue en producción.
- El idioma soportado es únicamente inglés; no es adecuado para generación de código en español u otros idiomas.
- La longitud de contexto no está documentada, por lo que no se puede garantizar su comportamiento con entradas largas o código extenso.
- Las cuantizaciones más agresivas (Q2_K, IQ4_XS) pueden degradar significativamente la calidad de la generación en comparación con f16 o Q8_0.
- No se han publicado benchmarks, por lo que el rendimiento real del modelo no está validado frente a otros modelos de código.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-Coder-3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/bappi/Qwen2.5-Coder-3B-Uncensored
- Perfil de mradermacher: https://huggingface.co/mradermacher

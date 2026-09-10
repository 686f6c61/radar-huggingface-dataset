# randmaru/MiniCPM5-2B-mlx-mxfp4

## Resumen

`randmaru/MiniCPM5-2B-mlx-mxfp4` es una cuantización en formato MXFP4 para MLX del modelo `openbmb/MiniCPM5-2B`, publicada por el usuario randmaru (no por OpenBMB). Se trata de un modelo denso de 2.516.756.480 parámetros (unos 2,52 mil millones) orientado a generación de texto en dispositivo, con etiquetas declaradas de contexto largo, tool calling y edge AI. La relevancia de esta ficha concreta no está en el modelo base, sino en el formato de cuantización: MXFP4 es coma flotante de 4 bits con microscaling, grupo de 32 elementos y exponente compartido E8M0, pensado para aprovechar el soporte de microscaling de los chips Apple Silicon.

El repositorio ocupa 1,3 GB y los pesos `safetensors` suman 1.337.358.111 bytes (~1,34 GB), ligeramente por debajo de la variante 4-bit del mismo modelo (~1,42 GB) según la propia model card. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial con las obligaciones habituales de atribución y aviso.

El modelo se publicó el 10 de septiembre de 2026 según los metadatos del repositorio y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria ni resultados de benchmarks publicados. La información disponible no incluye la longitud de contexto exacta, los idiomas soportados ni el número de tokens de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (según el tag `llama` del repositorio); detalles internos del modelo base no disponibles |
| Parámetros totales | 2.516.756.480 (~2,52 mil millones) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible (el repositorio se etiqueta como `long-context`, sin cifra publicada) |
| Tipos de cuantización | MXFP4 (4 bits en coma flotante con microscaling, grupo de 32, exponente compartido E8M0). El modelo base dispone también de variante 4-bit INT4/NF4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (tipos U8, U32 y BF16) |

## Arquitectura y entrenamiento

El modelo base `openbmb/MiniCPM5-2B` es un transformer de 2,52 mil millones de parámetros, etiquetado en el repositorio con la familia `llama`. El repositorio objeto de esta ficha no reentrena el modelo: aplica una cuantización MXFP4 con la librería MLX para inferencia en Apple Silicon. MXFP4 almacena bloques de 32 pesos con un exponente compartido E8M0, lo que reduce la sobrecarga de desquantización y permite usar rutas de coma flotante en lugar de kernels INT4 especializados. El resultado son tensores de tipos U8, U32 y BF16.

Los datasets declarados en la model card corresponden a las fases del modelo base: `openbmb/Ultra-FineWeb`, `openbmb/UltraX-Preview` y `openbmb/Ultra-FineWeb-L3` para preentrenamiento; `openbmb/UltraData-Math` y `openbmb/UltraData-Code` para datos de dominio matemático y de código; `openbmb/UltraData-SFT-2605` para ajuste supervisado; `openbmb/UltraData-SFT-Agent-2609` para capacidades de agente y tool calling; y `openbmb/UltraData-RL-2609` para una etapa de aprendizaje por refuerzo. No se especifica el número de tokens, la composición porcentual del corpus ni los algoritmos concretos de RLHF/DPO empleados.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` y la pipeline `text-generation`.
- Contexto largo: el repositorio se etiqueta como `long-context`, aunque no se publica la ventana máxima exacta.
- Tool calling y function calling: declarado en los tags y respaldado por el dataset `UltraData-SFT-Agent-2609`.
- Flujos de agente y razonamiento multi-paso, derivados del ajuste con datos de agente y de la etapa de RL.
- Inferencia en dispositivo (`on-device`, `edge-ai`): el formato MXFP4 está optimizado para el soporte de microscaling de Apple Silicon.
- Capacidades matemáticas y de código, inferidas de los datasets `UltraData-Math` y `UltraData-Code` del modelo base.
- Visión, audio y modo de razonamiento explícito (thinking mode): no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible; no se declara lista de idiomas.

## Casos de uso

- Asistentes locales en MacBook: el modelo ocupa aproximadamente 1,34 GB en pesos, por lo que cabe en equipos con 8 GB de memoria unificada y permite asistentes de texto sin conexión ni envío de datos a la nube.
- Atención al cliente en el borde: con contexto largo etiquetado y soporte conversacional, puede mantener diálogos multi-turno dentro de una aplicación de escritorio sin coste de API.
- Automatización con tool calling: al estar ajustado con datos de agente, puede invocarse desde un orquestador que exponga funciones (calendario, ficheros, APIs internas) y encadenar llamadas en varios pasos.
- Prototipado rápido en Apple Silicon: MLX permite cargar los pesos y ejecutar generación en minutos, útil para validar prompts e interfaces antes de migrar a un modelo mayor.
- Preprocesado y etiquetado de texto en local: clasificación, resumen o extracción de campos sobre documentos, ejecutado en el propio portátil para cumplir requisitos de privacidad.
- Aplicaciones educativas o de soporte matemático: los datos `UltraData-Math` del modelo base sugieren utilidad en resolución de problemas numéricos y explicaciones paso a paso.
- Componente de sistemas de agentes con presupuesto de memoria reducido: al ser una cuantización de 1,34 GB, se puede desplegar junto a otros modelos pequeños en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones medidas frente al modelo base en BF16 o frente a la variante 4-bit. La model card únicamente afirma que MXFP4 debería ofrecer mayor throughput en hardware con soporte de microscaling, sin aportar tokens por segundo ni latencias.

## Requisitos de hardware

- VRAM o memoria unificada estimada para los pesos: ~1,34 GB (1.337.358.111 bytes) en MXFP4. Con sobrecarga del runtime y caché KV, el consumo real será superior; no se publica una cifra oficial.
- Referencia orientativa: el mismo modelo en BF16 requeriría del orden de 5 GB solo para pesos (2,52 mil millones de parámetros × 2 bytes), cálculo derivado y no confirmado por el autor.
- GPU recomendadas: el formato está diseñado para Apple Silicon (series M1, M2, M3 y M4) con soporte de microscaling. Para GPUs NVIDIA con soporte de FP8 o microscaling, la model card indica que es donde resulta más eficiente, pero no aporta pruebas.
- Cabe en GPU de consumo: el tamaño de pesos permite ejecutarlo en Mac con 8 GB de memoria unificada y en GPUs de consumo con 4 GB o más mediante MLX, siempre que el backend sea compatible.
- Opciones de despliegue: MLX (`mlx-lm` y el servidor de MLX). No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama; MXFP4 de MLX no es un formato GGUF y requeriría una conversión adicional.
- Latencia y throughput: no disponibles. No se han publicado tokens por segundo, TTFT ni resultados de rendimiento medidos.

## Comparativa con modelos similares

| Modelo o variante | Parámetros | Contexto | Formato y tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `randmaru/MiniCPM5-2B-mlx-mxfp4` (esta ficha) | 2,52 mil millones | No disponible | MXFP4, ~1,34 GB en safetensors (~1,35 GB total) | Apache-2.0 | Repositorio con 0 descargas y 0 likes |
| Variante 4-bit del mismo modelo base | 2,52 mil millones | No disponible | INT4/NF4, ~1,42 GB en safetensors (~1,43 GB total) | Apache-2.0 | No disponible |
| `openbmb/MiniCPM5-2B` (modelo base) | 2,52 mil millones | No disponible | Pesos sin cuantizar; tamaño del repositorio no indicado | Apache-2.0 | Repositorio de referencia citado como base |

No se dispone de datos verificables en la información proporcionada para comparar con otros modelos de la misma categoría (por ejemplo, alternativas de ~2 a 3 mil millones de parámetros para dispositivo). Cualquier comparación de calidad, contexto o rendimiento frente a ellos sería especulativa, por lo que se indica como no disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados: no existe evidencia medida de que la cuantización MXFP4 preserve la calidad del modelo base en tareas concretas.
- Repositorio sin validación: 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación de terceros, no oficial de OpenBMB.
- Pérdida por cuantización: toda compresión a 4 bits degrada la precisión, con mayor riesgo en valores atípicos y en tareas sensibles a pequeños cambios numéricos, como matemáticas o código.
- Compatibilidad restringida: MXFP4 de MLX está pensado para hardware con microscaling; en GPUs sin ese soporte el rendimiento y la calidad pueden variar respecto a las expectativas de la model card.
- Longitud de contexto desconocida: aunque el repositorio usa el tag `long-context`, no se publica la ventana exacta, lo que impide planificar despliegues que dependan de ella.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación multilingüe, por lo que el comportamiento fuera del inglés es incierto.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan medidas de mitigación.
- Capacidades de agente no verificadas: el soporte de tool calling se deduce de los datasets y tags, sin ejemplos ni evaluaciones publicadas.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se declaran restricciones adicionales, aunque conviene verificar la licencia del modelo base antes de un despliegue en producción.
- Fecha de publicación inusual: los metadatos indican 10 de septiembre de 2026, dato que conviene contrastar con el repositorio original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/randmaru/MiniCPM5-2B-mlx-mxfp4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Papers, blogs, repositorios o demos adicionales: no se han encontrado enlaces relevantes en la búsqueda web realizada; los resultados obtenidos correspondían a páginas de soporte de Microsoft sin relación con el modelo.

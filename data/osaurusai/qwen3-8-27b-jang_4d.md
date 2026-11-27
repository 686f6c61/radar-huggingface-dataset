# OsaurusAI/Qwen3.8-27B-JANG_4D

## Resumen

OsaurusAI/Qwen3.8-27B-JANG_4D es una cuantización de 4 bits (con capas selectivas en 5, 6 y 8 bits) del modelo multimodal Qwen/Qwen3.8-27B, publicada por OsaurusAI y optimizada para el runtime MLX sobre Apple Silicon. El modelo base es un transformer con capacidades de visión, vídeo, razonamiento extendido (thinking), uso de herramientas y comportamiento agéntico; esta versión comprime los pesos hasta ocupar aproximadamente 21 GiB manteniendo una calidad cercana a la referencia bf16, según las métricas de divergencia KL publicadas por el autor.

La relevancia de esta ficha radica en que demuestra que un modelo de 27.356 millones de parámetros con torre de visión puede ejecutarse en hardware de consumo de Apple con pérdida de calidad medible y muy baja: divergencia KL mediana de 0,0007 en texto mantenido fuera del conjunto de calibración y una tasa de coincidencia top-1 del 95,2 % frente al modelo en precisión completa. Además, incorpora un drafter de decodificación especulativa (DFlash2) empaquetado en el repositorio, lo que acelera la generación de texto sin necesidad de un segundo modelo externo.

El paquete está pensado para el runtime propietario Osaurus (versión 0.25.20 o superior) y no es un GGUF genérico ni un checkpoint estándar de Hugging Face Transformers: requiere la librería MLX y el contrato de configuración `jang_config.json` para interpretar correctamente la cuantización por módulo, las capacidades y las plantillas de razonamiento y herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión + vídeo) con atención completa y capas gated-delta-net; modelo base Qwen3.8-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afín 4/5/6/8 bits por proyección MLP, 8 bits en atención completa, gated-delta-net, lm_head, embeddings y torre de visión; bf16 en normas, convoluciones y compuertas; GPTQ + AWQ + importance matrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, alineación de 64 bytes) + índice + `jang_config.json` + `dflash2/` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina capas de atención completa con proyecciones gated-delta-net, e incorpora una torre de visión para entradas de imagen y vídeo. Esta publicación no entrena el modelo desde cero: cuantiza los pesos originales mediante un proceso que combina importance matrix, AWQ plegado en la norma productora y GPTQ sobre la rejilla de MLX para los módulos por debajo de 8 bits. La asignación de bits por proyección (4, 5, 6 u 8) se elige según el error medido por byte en cada proyección MLP, mientras que todas las capas de atención y las proyecciones gated-delta-net se mantienen a 8 bits.

La calibración de la iteración 2 (5 de octubre de 2026) utilizó 1,21 millones de tokens de texto (ciberseguridad, código en varios lenguajes, conversaciones agénticas y de herramientas, terminal, razonamiento largo, recuperación de atención y matemáticas, en los tres niveles de esfuerzo), 0,43 millones de tokens de imagen y vídeo (191 elementos multimedia a través de la torre de visión) y 0,31 millones de tokens de trazas de razonamiento del propio modelo en precisión completa. Los conjuntos de validación son disjuntos de la calibración. Como innovación destacable, se eliminó la cabeza MTP nativa y se sustituyó por un drafter de difusión por bloques DFlash2 (bf16, tamaño de bloque 8) para decodificación especulativa de texto; las peticiones de imagen y vídeo se decodifican sin él.

## Capacidades

- Generación de texto conversacional y de formato largo en inglés.
- Razonamiento extendido con modo thinking activado por defecto y tres niveles de esfuerzo: `low`, `medium` y `xhigh` (por defecto).
- Entrada de imagen y vídeo mediante torre de visión integrada (pipeline `image-text-to-text`).
- Uso de herramientas y function calling con formato XML (parser `qwen3_coder`).
- Comportamiento agéntico multi-turno, con preservación del razonamiento previo en el historial (`preserve_thinking`).
- Razonamiento sobre código en múltiples lenguajes, matemáticas, ciencia, finanzas y ciberseguridad, según los conjuntos de evaluación del autor.
- Decodificación especulativa de texto mediante el drafter DFlash2 empaquetado.
- Capacidad de desactivar el razonamiento con `enable_thinking: false`, que rellena un bloque cerrado.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo mantiene una coincidencia top-1 del 98,4 % frente a bf16 en código en múltiples lenguajes y puede integrarse en editores o terminales mediante el formato XML de tool calling, sin enviar código a la nube.
- Agente de terminal y automatización de shell: los conjuntos de terminal y shell muestran una KL de 0,0013 y un top-1 del 92,5 %, suficiente para tareas de ejecución de comandos con supervisión humana.
- Análisis de documentos con imágenes y vídeo: la torre de visión a 8 bits permite procesar capturas, diagramas o fotogramas dentro de un mismo flujo conversacional, útil para soporte técnico o auditoría de material multimedia.
- Razonamiento matemático y científico asistido: con KL de 0,0001 en matemáticas y 0,0010 en ciencia, es adecuado para tutoría, verificación de cálculos y explicación de resultados.
- Ciberseguridad defensiva y análisis de redes: los conjuntos específicos de ciberseguridad (KL 0,0008, top-1 94,9 %) y redes (KL 0,0011) permiten triaje de alertas y resumen de configuraciones en entornos aislados.
- Automatización de oficina y finanzas: generación de informes, extracción de datos de documentos y resúmenes con KL de 0,0001 y top-1 del 97,7 % en el dominio de oficina y finanzas.
- Despliegue de agentes multi-turno con contexto largo: el conjunto agéntico multi-turno de 199.746 tokens mantiene una KL de 0,0014 y un top-1 del 92,1 %, lo que respalda flujos de varias etapas con llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de la cuantización frente al modelo bf16:

| Conjunto | KL mediana | Top-1 |
|---|---|---|
| Texto mixto mantenido fuera de calibración | 0,0007 | 95,2 % |
| Conversaciones agénticas y de herramientas | 0,0014 | 92,1 % |
| Razonamiento | 0,0001 | 96,9 % |
| Trazas propias bf16, esfuerzo low | 0,0001 | 93,9 % |
| Trazas propias bf16, esfuerzo medium | 0,00004 | 97,7 % |
| Trazas propias bf16, esfuerzo xhigh | 0,0005 | 95,1 % |

| Tema (texto) | Tokens evaluados | KL JANG_4D | Top-1 JANG_4D | KL JANGH2 | Top-1 JANGH2 |
|---|---|---|---|---|---|
| Código (varios lenguajes) | 39.155 | 0,0002 | 98,4 % | 0,0092 | 89,5 % |
| Matemáticas | 9.067 | 0,0001 | 98,7 % | 0,0068 | 90,8 % |
| Oficina / finanzas | 13.159 | 0,0001 | 97,7 % | 0,0087 | 86,9 % |
| Razonamiento | 14.004 | 0,0001 | 94,5 % | 0,0081 | 81,0 % |
| Ciencia | 4.156 | 0,0010 | 98,0 % | 0,0460 | 87,1 % |
| Contexto largo y recuperación de atención | 79.784 | 0,0007 | 96,6 % | 0,0446 | 80,4 % |
| Ciberseguridad | 15.683 | 0,0008 | 94,9 % | 0,0368 | 80,5 % |
| Redes | 6.458 | 0,0011 | 93,7 % | 0,0244 | 81,9 % |
| Terminal / shell | 42.987 | 0,0013 | 92,5 % | 0,0738 | 73,5 % |
| Agéntico y tool calls | 34.245 | 0,0026 | 89,8 % | 0,0975 | 71,2 % |
| Escritura creativa | 10.029 | 0,0028 | 96,5 % | 0,1989 | 74,2 % |
| Conjunto agéntico multi-turno | 199.746 | 0,0014 | 92,1 % | 0,0615 | 75,3 % |

El autor indica además que las decisiones de cierre del bloque de pensamiento coinciden con bf16 en 40 de 40 trazas y 65 de 65 filas de texto, y que la decisión entre llamada a herramienta y respuesta se invierte en 9 de 263 posiciones agénticas.

## Requisitos de hardware

- Tamaño del repositorio: 75,4 GB; el bundle cuantizado ocupa aproximadamente 21 GiB en memoria según el autor.
- Hardware objetivo: Apple Silicon con MLX; no se distribuyen pesos para CUDA ni GGUF.
- VRAM/unified memory estimada: en torno a 21 GiB para los pesos, más overhead de contexto, caché KV y el drafter DFlash2 en bf16; se recomienda un equipo con 32 GB o más de memoria unificada.
- GPU recomendadas: no aplica en el sentido tradicional; el runtime es MLX sobre chips Apple (M-series). No hay soporte declarado para A100, H100 o RTX 4090 en esta publicación.
- Despliegue: runtime Osaurus 0.25.20 o superior con `required_osaurus_version` 0.25.20 y `model_version` 2; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con DFlash2 (bloque 8) está pensada para acelerar la generación de texto, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/Qwen3.8-27B-JANG_4D | 27,36 B | No disponible | safetensors MLX | Apache 2.0 | Hugging Face, 192 descargas |
| Qwen/Qwen3.8-27B (base bf16) | 27,36 B | No disponible | safetensors | Apache 2.0 (según modelo base) | Hugging Face |
| JANGH2 (variante citada por el autor) | No disponible | No disponible | safetensors MLX | No disponible | No disponible |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter, no modelo completo | No aplica | bf16 | No disponible | Hugging Face |

La comparación cuantitativa disponible se limita a JANG_4D frente a JANGH2 y frente al bf16 del mismo modelo base: JANG_4D muestra una KL entre uno y dos órdenes de magnitud menor en la mayoría de temas, con especial ventaja en escritura creativa (0,0028 frente a 0,1989) y terminal (0,0013 frente a 0,0738). No se dispone de datos comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar los términos del modelo Qwen original antes de uso comercial.
- Dependencia del runtime Osaurus y de MLX: no es un checkpoint portable a Transformers, vLLM o llama.cpp sin conversión adicional.
- La cuantización introduce divergencias medibles: la decisión entre llamada a herramienta y respuesta se invierte en 9 de 263 posiciones agénticas, lo que puede afectar a flujos automatizados críticos.
- Riesgo de alucinación inherente al modelo base; no se publican evaluaciones de veracidad ni de sesgos.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se ajusta `reasoning_effort` o `enable_thinking`.
- La cabeza MTP nativa no está incluida; la aceleración depende del drafter DFlash2 empaquetado y solo aplica a texto.
- Los pesos de la iteración 2 (2026-10-05) sustituyen a los anteriores; es necesario volver a descargar si se tenía la versión previa.
- No se publican cifras de latencia, throughput ni requisitos exactos de memoria para contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_4D
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Sitio del autor: https://osaurus.ai
- Contacto del autor: eric@osaurus.ai

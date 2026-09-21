# hermitdave/Hemmingway-1-oQ4e

## Resumen

Hemmingway-1-oQ4e es una cuantización de 4 bits en formato MLX del modelo Altworld/Hemmingway-1, un transformer de lenguaje de 27 B parámetros con atención híbrida (lineal combinada con atención completa cada cuatro capas) construido sobre Qwen3.8-27B. Lo publica el usuario hermitdave en Hugging Face y su propósito es hacer viable la inferencia local del modelo original en equipos Apple Silicon, reduciendo el peso de ~54 GB en bfloat16 a unos 15,5 GB efectivos, sin reentrenar ni modificar la arquitectura.

El modelo base está orientado a generación de texto conversacional y escritura creativa: su model card destaca primeros puestos en CommunicationBench y StoryBench dentro de la categoría de 27 B, así como una ventaja de 26 puntos en métricas de human-likeness. Esta versión cuantizada conserva la ventana de contexto de 262.144 tokens, un vocabulario de 248.320 entradas y una RoPE theta de 10.000.000, pensada para contextos muy largos.

La relevancia de esta ficha radica en que es un caso representativo de cuantización mixta con compensación de error GPTQ aplicada a un modelo grande para consumo en hardware de sobremesa: se elimina la cabeza MTP, se calibra con un conjunto multilingüe de código y se empaqueta en safetensors MLX, lo que limita el despliegue a macOS con Apple Silicon. La licencia Apache-2.0 se mantiene respecto al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida: capas de atención lineal más atención completa cada 4 capas; basado en Qwen3.8-27B |
| Parámetros totales | 26.895.998.464 (~26,9 B; el autor indica 27 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | oQ4e (enhanced/GPTQ) de precisión mixta: 4 bits base, ~4,6 bpw objetivo, group size 64, dtype bfloat16, MTP eliminada (preserve_mtp=False) |
| Idiomas soportados | no disponible en los metadatos; el conjunto de calibración se denomina oqe_code_multilingual, lo que sugiere cobertura multilingüe y de código, sin confirmación oficial |
| Licencia | Apache-2.0 (idéntica a la del modelo base) |
| Formato de pesos | safetensors en formato MLX (librería mlx); no se distribuyen GGUF, AWQ, GPTQ nativo ni otros formatos |
| Tamaño de hidden size | 5120 |
| Número de capas | 64 |
| Cabezas de atención | 24 (atención completa) / 16 (atención lineal) |
| Cabezas KV | 4 (atención completa) / 48 (atención lineal) |
| Tamaño intermedio | 17.408 |
| Tamaño de vocabulario | 248.320 |
| RoPE theta | 10.000.000 |
| Tamaño del repositorio | 16,0 GB |
| Descargas / likes | 124 descargas / 0 likes (a fecha de los metadatos) |
| Fecha de creación | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de 64 capas con hidden size 5120 y un esquema de atención híbrida: solo una de cada cuatro capas emplea atención completa (24 cabezas de consulta y 4 cabezas KV), mientras que el resto usa atención lineal con 16 cabezas de consulta y 48 cabezas KV. Esta combinación reduce el coste de la caché KV en contextos largos, algo crítico con una ventana de 262.144 tokens, y se acompaña de una RoPE theta de 10.000.000 para sostener la extrapolación posicional. El modelo se apoya en Qwen3.8-27B como base, con un vocabulario de 248.320 entradas.

Sobre el entrenamiento del modelo original no se dispone de información en la documentación consultada: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento. En cuanto a esta versión, la innovación está exclusivamente en el proceso de cuantización: se aplica la ruta oQ4e de oMLX (enhanced con optimización de pesos GPTQ basada en Hessian) mediante la herramienta Hermes Agent, con calibración sobre 128 muestras de 512 tokens del conjunto oqe_code_multilingual, un esquema de precisión mixta con 4 bits base y ~4,6 bpw efectivos y group size 64. La cabeza de predicción mult令牌 (MTP) se elimina durante la conversión, y se publica un informe de calidad de cuantización en `oq_imatrix_report.json`.

## Capacidades

- Generación de texto libre en modo conversacional, con etiqueta `conversational` en el repositorio.
- Escritura creativa y narrativa: el modelo base reporta buen rendimiento en StoryBench, a la altura de Kimi K3 según su model card.
- Comunicación con tono humano: primer puesto en CommunicationBench en la categoría de 27 B y 26 puntos de ventaja en métricas de human-likeness.
- Inteligencia emocional conversacional: tercer puesto en EQ-Bench 4 según los datos del modelo upstream.
- Manejo de contextos muy largos de hasta 262.144 tokens, adecuado para documentos extensos y diálogos multi-turno prolongados.
- Posible cobertura multilingüe y de código, inferida únicamente del nombre del conjunto de calibración; no confirmada en la documentación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking mode): no disponibles en la información proporcionada.
- Inferencia en Apple Silicon mediante MLX y servidor oMLX.

## Casos de uso

- Redacción de correspondencia personal y profesional: el ejemplo de inicio rápido del propio repositorio genera una carta al casero sobre una caldera averiada, un escenario ideal porque el modelo prioriza un tono humano y natural sobre la precisión técnica.
- Asistente de escritura creativa y narrativa larga: con 262.144 tokens de contexto se puede mantener la coherencia de personajes, tramas y estilo a lo largo de capítulos completos o de un ciclo de relatos, aprovechando además su rendimiento en StoryBench.
- Compañero conversacional de sesión larga: la ventana de contexto permite conservar el historial completo de una conversación extensa sin truncar, algo útil en aplicaciones de acompañamiento o role-play donde la memoria del diálogo es el valor principal.
- Atención al cliente con tono humano: el modelo destaca en métricas de human-likeness, por lo que encaja en respuestas que deben sonar naturales y empáticas; conviene revisar la ausencia documentada de soporte de tool calling antes de integrarlo con sistemas de tickets o CRM.
- Reescritura y adaptación de estilo: dado un texto fuente, el modelo puede reformularlo con distintos registros (formal, cercano, literario), un caso directo de uso para equipos de contenidos y localización que trabajen en local.
- Procesamiento de documentación extensa en local: contratos, informes o expedientes de decenas de miles de tokens pueden cargarse íntegros en el contexto y resumirse o consultarse sin enviar datos a servicios externos, gracias al despliegue local en Apple Silicon.
- Generación de datos sintéticos de diálogo: sus buenos resultados en EQ-Bench 4 lo hacen candidato para producir corpus conversacionales con carga emocional, útiles para ajuste fino o evaluación de otros sistemas.
- Prototipado en investigación sobre cuantización: el repositorio incluye el informe `oq_imatrix_report.json`, lo que permite comparar la degradación de la cuantización oQ4e frente al modelo en bfloat16 en un caso real de 27 B.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card del modelo upstream (Altworld/Hemmingway-1, en BF16) y son posiciones relativas, no puntuaciones numéricas. No se han publicado resultados específicos de esta versión cuantizada.

| Benchmark | Hemmingway-1 (BF16, datos del upstream) | Hemmingway-1-oQ4e |
|---|---|---|
| CommunicationBench | 1.º en la categoría de 27 B | no disponible |
| Human-Likeness | +26 puntos de ventaja | no disponible |
| EQ-Bench 4 | 3.º puesto | no disponible |
| StoryBench | A la altura de Kimi K3 | no disponible |
| MMLU, HumanEval, GSM8K y similares | no disponible | no disponible |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni equivalentes en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 15,5 GB solo para los pesos (26,9 B × ~4,6 bpw), coherente con un repositorio de 16,0 GB. Hay que sumar la caché KV, que se reduce de forma notable por el esquema de atención híbrida (solo 16 de las 64 capas usan atención completa con 4 cabezas KV).
- GPU compatibles: MLX está diseñado para Apple Silicon, por lo que no se puede ejecutar directamente en NVIDIA (A100, H100, RTX 4090) ni en AMD con esta librería. El autor no publica una conversión a otros formatos.
- Equipos de consumo: encaja en Mac con chip de la familia M (M1/M2/M3/M4, incluidos los Max y Ultra). Se recomienda memoria unificada de 32 GB o más para trabajar con contextos largos; con 24 GB es viable únicamente con contextos reducidos; con 16 GB no es recomendable.
- Opciones de despliegue: `mlx-lm` (`python3 -m mlx_lm.generate`), servidor oMLX (`omlx serve --model hermitdave/Hemmingway-1-oQ4e`) y el resto de herramientas del ecosistema MLX. vLLM y TGI no soportan pesos MLX; llama.cpp y Ollama requerirían una conversión a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Hemmingway-1-oQ4e (este) | 26,9 B | 262.144 | oQ4e 4 bits (~4,6 bpw), MLX | Apache-2.0 | Hugging Face, solo MLX | no disponible (sin benchmarks propios) |
| Altworld/Hemmingway-1 (upstream) | 27 B | 262.144 | bfloat16 | Apache-2.0 | Hugging Face | 1.º en CommunicationBench (27 B), 3.º en EQ-Bench 4, +26 pts en human-likeness, StoryBench a la altura de Kimi K3 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible | Referencia de comparación citada en StoryBench por el modelo upstream |
| Modelos de ~27 B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se pueden contrastar con datos reales las dos variantes de Hemmingway-1, que comparten arquitectura y se diferencian únicamente en la precisión de los pesos. Para el resto de alternativas no hay información verificable en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos ni de toxicidad para el modelo base ni para esta cuantización.
- Riesgo de alucinación: no se publica ninguna evaluación de veracidad, factualidad o tasa de alucinación.
- Degradación por cuantización: la pérdida de calidad respecto al modelo en bfloat16 no está cuantificada en la model card; el informe `oq_imatrix_report.json` es la única referencia, y no se acompaña de cifras en el texto consultado.
- Idiomas: no se declara oficialmente la lista de idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del inglés sin una evaluación previa.
- Ausencia de soporte documentado para tool calling y flujos de agentes: si el caso de uso requiere function calling, no hay evidencia de que funcione correctamente.
- Eliminación de la cabeza MTP: la conversión descarta la predicción multi-token, de modo que no se puede aplicar decodificación especulativa basada en MTP con estos pesos.
- Restricciones de plataforma: los pesos MLX solo se ejecutan en Apple Silicon. Esto excluye servidores con GPU NVIDIA o AMD sin una conversión previa a otro formato, que el autor no proporciona.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo base Altworld/Hemmingway-1 y verificar si el upstream añade condiciones adicionales.
- Adopción muy baja: 124 descargas y 0 likes en el momento de los metadatos, con ausencia de validación comunitaria independiente.
- Modelo reciente y poco documentado: creado el 21 de septiembre de 2026, sin paper asociado ni descripción del dataset de entrenamiento, número de tokens o proceso de alineamiento.
- Advertencia sobre el nombre: la referencia a "Qwen3.8-27B" y la etiqueta `qwen3_5` provienen literalmente de la model card; no se ha podido verificar de forma independiente la correspondencia exacta con una versión publicada de Qwen.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hermitdave/Hemmingway-1-oQ4e
- Modelo base (upstream): https://huggingface.co/Altworld/Hemmingway-1
- Herramienta de conversión Hermes Agent: https://hermes-agent.nousresearch.com
- Informe de calidad de cuantización: `oq_imatrix_report.json` (incluido en el repositorio de Hugging Face)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados disponibles; las referencias obtenidas trataban sobre formatos y tamaños de papel y no guardan relación con esta ficha.

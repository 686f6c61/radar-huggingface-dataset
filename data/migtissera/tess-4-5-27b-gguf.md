# migtissera/Tess-4.5-27B-GGUF

## Resumen

Tess-4.5-27B-GGUF es la distribución en formato GGUF de Tess-4.5-27B, un modelo de pesos abiertos de 26.895.998.464 parámetros (≈27B) desarrollado por migtissera (Continuity Research) y publicado en octubre de 2026. Está afinado sobre Qwen3.8-27B y orientado explícitamente a trabajo de ingeniería: razonamiento paso a paso, uso de herramientas (*tool calling*), manejo de ficheros y flujos agénticos de terminal, además de entrada de imágenes gracias al proyector multimodal incluido.

El repositorio no contiene los pesos en safetensors, sino las cuantizaciones listas para llama.cpp (Q4_K_M, Q6_K y Q8_0), las cabezas de predicción multi-token (MTP) para decodificación especulativa y el proyector de visión `mmproj` en F16. El objetivo declarado por el autor es llevar un modelo de clase "frontier" a una sola GPU de consumo o a un portátil: la cuantización por defecto (Q4_K_M, 16,5 GB) cabe en una GPU de 24 GB o en un Mac con 32 GB o más de memoria unificada.

Su relevancia práctica está en la combinación de tres piezas en un mismo paquete GGUF: modo de pensamiento activado por defecto, decodificación especulativa MTP integrada (hasta 2× más rápida según el autor) y soporte de imagen. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. El autor afirma que, en su benchmark interno BenchLocal, iguala a su modelo base con un 25 % menos de tokens, aunque no se publican cifras detalladas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo derivado de Qwen3.8-27B (transformer, familia Qwen). El autor no especifica si es denso o MoE |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en los ejemplos oficiales de `llama-server` (`-c 65536`); el máximo nativo no se detalla |
| Tipos de cuantización | Q4_K_M (16,5 GB), Q6_K (22,1 GB), Q8_0 (28,6 GB); cabezas MTP en Q8_0 (3,2 GB) y Q4_K_M (2,0 GB); proyector de visión F16 (0,9 GB); soporte de cuantización de caché KV a q4_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en este repositorio |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen: Tess-4.5-27B se construye sobre Qwen3.8-27B, al que el autor agradece explícitamente en la model card. El recuento de parámetros (26,9B) coincide con la cifra comercial de 27B. El modelo incorpora tres componentes separados en el repositorio: los pesos principales cuantizados, un proyector multimodal `mmproj-Tess-4.5-27B-F16.gguf` que habilita la entrada de imágenes y cabezas de predicción multi-token (MTP) que actúan como modelo borrador para decodificación especulativa.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La innovación técnica destacable y documentada es el uso de MTP como borrador especulativo dentro de llama.cpp (`--spec-type draft-mtp`), que permite duplicar aproximadamente la velocidad de generación sin cambiar los pesos principales, y la integración de visión en el mismo flujo GGUF mediante el proyector F16.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (*thinking*) activado por defecto.
- Codificación y trabajo sobre ficheros reales del proyecto; el autor lo posiciona para "trabajo de ingeniería real".
- Soporte de *tool calling* / *function calling*: el modelo espera recibir las definiciones reales de herramientas en el campo `tools`.
- Comportamiento agéntico en terminal: se le indica el directorio de trabajo en el *system prompt* y opera sobre el entorno.
- Entrada de imágenes (`pipeline_tag: image-text-to-text`) mediante el proyector `mmproj` en F16.
- Decodificación especulativa con cabezas MTP propias, compatible con llama.cpp reciente.
- Multilingüe: limitado al inglés según la metadata del repositorio.
- Compatible con `--jinja` para plantillas de chat integradas en llama.cpp.

## Casos de uso

- Asistente de codificación en terminal: con el directorio de trabajo declarado en el *system prompt* y las herramientas reales en `tools`, el modelo puede inspeccionar ficheros, proponer parches y ejecutar comandos en un bucle agéntico; encaja en este rol por su entrenamiento específico y por el soporte nativo de *tool calling*.
- Revisión de código en pipelines de CI/CD: integrado vía `llama-server` con API compatible con endpoints, puede analizar diffs y generar comentarios de revisión; la ventana de 65.536 tokens permite incluir varios ficheros y el diff completo en una sola llamada.
- Depuración asistida con capturas de pantalla: gracias al proyector de visión, se le puede pasar una captura de un *stack trace*, un IDE o una salida gráfica junto al código relevante para localizar el fallo.
- Automatización de tareas de *shell*: con la cabeza MTP para código y *shell*, el autor reporta 85,5-96,1 tok/s en una RTX 4090, lo que hace viable la generación interactiva de comandos y *scripts* sin esperas perceptibles.
- Asistente de documentación técnica: generar y actualizar README, docstrings y guías a partir del árbol de ficheros del repositorio, aprovechando el contexto largo y el modo de pensamiento para mantener coherencia entre secciones.
- Despliegue local con privacidad de datos: al ejecutarse en una única GPU de 24 GB con Q4_K_M, permite procesar código propietario sin enviar nada a servicios externos, algo relevante para equipos con restricciones de confidencialidad.
- Prototipado de agentes multi-paso: la combinación de razonamiento explícito, *tool calling* y contexto de 65.536 tokens permite construir agentes que encadenan búsquedas, ediciones y verificaciones sobre un mismo estado de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona únicamente que, en su benchmark interno BenchLocal, Tess-4.5 iguala a su modelo base Qwen3.8-27B con un 25 % menos de tokens, sin aportar puntuaciones por tarea.

Las únicas mediciones numéricas publicadas son de velocidad de inferencia (Q4_K_M, llama.cpp upstream, una petición concurrente, modo de pensamiento activado):

| Máquina | Sin borrador | Con MTP, código | Con MTP, shell |
|---|---|---|---|
| NVIDIA RTX 4090 | 48,9 tok/s | 96,1 tok/s | 85,5 tok/s |
| Apple M4 Max | 24,4 tok/s | 37,8 tok/s | 33,1 tok/s |

## Requisitos de hardware

- VRAM para Q4_K_M: 16,5 GB de pesos; con caché KV a 65.536 tokens hay que añadir la memoria de contexto, por lo que el autor recomienda cuantizar la caché (`--cache-type-k q4_0 --cache-type-v q4_0`) o reducir `-c` en GPUs de 24 GB.
- VRAM para Q6_K: 22,1 GB de pesos; requiere previsiblemente más de 24 GB al añadir contexto.
- VRAM para Q8_0: 28,6 GB de pesos; el autor lo indica para máquinas con 48 GB o más.
- Cabezas MTP: 3,2 GB (Q8_0) o 2,0 GB (Q4_K_M) adicionales; el proyector de visión añade 0,9 GB.
- GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M; también en Apple Silicon con 32 GB o más de memoria unificada (M4 Max probado por el autor).
- Despliegue: llama.cpp (`llama-server`) con `--jinja`, `-ngl 99` y `--spec-type draft-mtp`; requiere una compilación reciente de llama.cpp upstream para la decodificación especulativa MTP. Otros runners GGUF (Ollama, LM Studio, TGI, vLLM) no se mencionan en la información disponible.
- Throughput medido: 96,1 tok/s en RTX 4090 y 37,8 tok/s en M4 Max con borrador MTP activo en generación de código; 48,9 y 24,4 tok/s respectivamente sin borrador.
- Latencia: no disponible de forma explícita (solo throughput en tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tess-4.5-27B (GGUF) | 26,9B | 65.536 tokens (uso documentado) | Iguala a Qwen3.8-27B en BenchLocal con 25 % menos tokens (sin cifras) | Apache 2.0 | HuggingFace, GGUF para llama.cpp |
| Qwen3.8-27B (modelo base) | ≈27B | No disponible | Referencia del benchmark interno del autor | No disponible en la información | HuggingFace (Qwen) |
| Otros modelos de ~27-32B con soporte agéntico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base declarado.

## Limitaciones y advertencias

- Idioma: la metadata declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Modo de pensamiento activado por defecto: incrementa el consumo de tokens y la latencia; el autor recomienda muestrear con `temperature=1.0`, `top_p=0.95`, `top_k=20`.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad ni de tasas de alucinación.
- Sesgos: no se publica información sobre composición del dataset ni evaluaciones de sesgo.
- Dependencia de herramienta: la decodificación especulativa MTP requiere una compilación reciente de llama.cpp upstream; en versiones antiguas el modelo funciona, pero sin la aceleración.
- Memoria: a contexto máximo en GPUs de 24 GB es necesario cuantizar la caché KV, lo que puede degradar ligeramente la calidad.
- Este repositorio contiene solo GGUF; para fine-tuning o inferencia con otras librerías hay que acudir al modelo base `migtissera/Tess-4.5-27B`.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan en la información disponible posibles restricciones heredadas del modelo base Qwen3.8-27B, que conviene verificar antes de un despliegue en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Modelo base: https://huggingface.co/migtissera/Tess-4.5-27B
- Página del proyecto (Continuity Research): https://continuityresearch.ai/tess-4-5/
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Vídeo de lanzamiento: https://huggingface.co/migtissera/Tess-4.5-27B/resolve/main/assets/tess-4.5-launch.mp4

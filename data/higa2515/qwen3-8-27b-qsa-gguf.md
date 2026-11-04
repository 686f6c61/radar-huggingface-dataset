# higa2515/Qwen3.8-27B-QSA-GGUF

## Resumen

Qwen3.8-27B-QSA-GGUF es una instantánea de despliegue cuantizada en Q8_0 del modelo multimodal Qwen3.8-27B-QSA-MM2-BF16, publicada por el usuario higa2515. Se trata de una conversión GGUF de un modelo de 27.373.132.800 parámetros (aproximadamente 27,4 mil millones) con capacidades de entrada de texto e imagen, empaquetada junto a un runtime nativo parcheado que sustituye al llama.cpp estándar. El modelo base emplea una arquitectura híbrida que combina 48 capas Gated DeltaNet con 16 capas de atención completa, sobre las que se aplica una implementación propia denominada QSA (atención con bloques fijos de K=2.048).

La relevancia de esta publicación es doble. Por un lado, ofrece un punto de partida reproducible para ejecutar un modelo multimodal de ~27B con ventana de contexto de hasta 262.144 tokens en hardware de dos GPU de 32 GB. Por otro, documenta de forma explícita una experimentación de velocidad: el autor mide 48,94 token/s sin contexto añadido y 41,07 token/s con 261.120 tokens de entrada, con una caída del 16,08 %. El propio autor advierte de que se trata de un experimento de rendimiento y no de una prueba de preservación de la inteligencia general del modelo.

La ficha se basa exclusivamente en la información publicada en HuggingFace y en la model card del autor. No hay datos de benchmarks de calidad, idiomas soportados ni resultados comparativos con modelos similares, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa con QSA (bloques de 4, K=2.048); MTP denso; encoder de visión y proyector multimodales |
| Parametros totales | 27.373.132.800 (~27,4 B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262.144 tokens (configuración medida por el autor) |
| Tipos de cuantizacion | Q8_0 en matrices principales; indexadores en FP32; tensores MTP retenidos; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); el archivo de runtime incluye código MIT y avisos de terceros |
| Formato de pesos | GGUF (Q8_0) + mmproj GGUF (F16) + archivo tar.gz con runtime Linux x86_64 sm70 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido en el que la mayor parte de la profundidad (48 capas) corresponde a Gated DeltaNet, un mecanismo de estado recurrente lineal, mientras que 16 capas conservan atención completa. Sobre estas últimas se aplica la implementación QSA, que opera con K fijo de 2.048 y bloques de cuatro más el bloque actual, manteniendo todas las entradas KV asignadas. El modelo incorpora además un módulo MTP (multi-token prediction) denso, un encoder de visión con su proyector y un índice de claves agrupadas para reutilización de prefijo. El checkpoint BF16 de referencia usa un fallback multimodal denso distinto del camino nativo QSA, según advierte el autor.

No se publican en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor indica que el backbone preentrenado, el encoder de visión, el proyector y el MTP se congelaron durante la conversión. La conversión a GGUF preserva los 80 tensores del indexador con coincidencia exacta respecto a la exportación FP32 de MM2 tras la transformación de normalización documentada; los 866 tensores restantes son idénticos a la conversión Q8_0 previa, no a los bytes BF16 sin cuantizar. La innovación técnica destacable es el runtime nativo: llama.cpp estándar no reproduce esta implementación QSA, por lo que se distribuye un binario parcheado con soporte de reutilización de prefijo (KV objetivo, claves del indexador y carry de MTP en una única ranura activa) y MTP con lag/async desactivados.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` y tag `conversational`.
- Entrada de imagen a través del proyector multimodal incluido (`mmproj-Qwen3.8-27B-QSA-F16.gguf`).
- Entrada de vídeo en el camino nativo QSA, según la model card.
- Procesamiento de contexto largo: ventana configurada de hasta 262.144 tokens con reutilización de prefijo dentro de una misma sesión de servidor.
- Predicción multi-token (MTP) con borrador máximo de 2 tokens, sujeta a la tasa de aceptación de cada tarea.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Procesamiento de documentos largos con imágenes intercaladas: la ventana de 262.144 tokens y la entrada multimodal permiten ingerir informes, contratos o expedientes completos con figuras y tablas en una sola pasada, sin trocear el contenido.
- Análisis de vídeo de duración media: el camino nativo admite entrada de vídeo, lo que habilita resumen y extracción de eventos en clips, con la cautela de que el autor solo ha verificado probes multimodales hasta 64k.
- Asistencia a la programación en local: las pruebas de throughput mezclan tareas de código y prosa libre, con 48,94 token/s a contexto cero, un régimen adecuado para autocompletado y generación de funciones en un entorno controlado.
- Despliegue en infraestructura de dos GPU de 32 GB: el runtime capturado funciona con Tesla V100-PCIE y PG500, lo que permite montar un servicio interno de inferencia sin GPUs de gama alta modernas.
- Investigación sobre atención lineal y modelos híbridos: la combinación de Gated DeltaNet con QSA y MTP ofrece un banco de pruebas para estudiar el equilibrio entre coste de atención y calidad en contextos largos.
- Evaluación de decodificación especulativa: el MTP con borrador 2 y las métricas de aceptación por tarea permiten medir la ganancia real de esta técnica en cargas mixtas.
- Réplica de experimentos de cuantización: la separación entre indexadores FP32 y matrices Q8_0 facilita analizar el impacto de la cuantización selectiva en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, DocVQA, etc.) en la información disponible. El autor incluye únicamente métricas de throughput medidas en su hardware:

| Metrica | Valor |
|---|---|
| Throughput a 0k de contexto añadido | 48,94 token/s (mediana por tarea, media armónica ponderada) |
| Throughput a 261.120 tokens de entrada | 41,07 token/s |
| Caída de throughput | 16,08 % |
| Prefill en frío a 0k | 679,57 token/s |
| Prefill en frío a 261.120 tokens | 1.071,53 token/s |
| Longitud de prompt base (0k) | 490-563 tokens |
| Tope de salida | 512 tokens, respetando EOS |
| Metodología | 2 tareas de código + 2 de prosa libre, 3 repeticiones cada una |

El autor advierte de que la aceptación de MTP depende de la tarea y que estas cifras no son velocidades universales del modelo. Tampoco se ha completado una ejecución comparativa contra una variante densa equivalente.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 30,3 GB, repartidos entre el GGUF Q8_0 principal, el proyector F16 y el archivo de runtime. La configuración medida usa dos GPU de 32 GB con reparto de capas 1:1.
- GPU validadas por el autor: Tesla V100-PCIE (sm70) y PG500, con driver 580.178.04 y CUDA 12.9.
- GPU consumer: no hay evidencia de que quepa en una única GPU consumer; el tamaño del checkpoint Q8_0 y la necesidad de runtime parcheado lo hacen poco probable en tarjetas de 24 GB sin cuantización adicional, que no se distribuye.
- Opciones de despliegue: exclusivamente el runtime incluido en `qsa27b-mm2-linux-x86_64-sm70.tar.gz`. llama.cpp estándar no reproduce la implementación QSA. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Sistema operativo: Linux x86_64. Otro hardware requiere compilar desde el código fuente incluido y dimensionar memoria manualmente.
- Configuración de ejecución medida: KV en FP16, contexto 262.144, batch 2.048, ubatch 512, MTP draft máximo 2, dirección por defecto 127.0.0.1:8091.
- Latencia y throughput: ver tabla de la sección anterior.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o categoría similar, ni datos de benchmarks que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El autor declara explícitamente que se trata de un experimento de velocidad y no de una prueba de preservación de la inteligencia general del modelo.
- Los probes multimodales nativos están limitados a 64k tokens; la calidad en imagen, vídeo, documentos largos y contextos de 128k y 262k está sin verificar.
- Los resultados de perplejidad en BF16 y las pruebas DocVQA de cuatro opciones no establecen equivalencia de calidad para la inferencia nativa en Q8_0.
- El checkpoint BF16 de referencia usa un fallback multimodal denso distinto del camino nativo QSA, por lo que los resultados entre ambas rutas no son directamente comparables.
- llama.cpp estándar no puede reproducir esta implementación; el binario capturado está atado a Linux x86_64 y sm70, y requiere driver NVIDIA y bibliotecas CUDA 12 instalados en el host (no se redistribuyen).
- La reutilización de prefijo no persiste entre reinicios del servidor; MTP con lag/async está desactivado.
- No se instala ningún servicio automáticamente; el despliegue es manual.
- Riesgo de alucinación, sesgos conocidos y comportamiento multilingüe: no documentados en la información disponible.
- Licencia Apache-2.0 en los pesos, compatible con uso comercial; el archivo de runtime incorpora código MIT y avisos de terceros que deben revisarse y conservarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Pesos BF16 de origen: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-MM2-BF16
- Runtime base: https://github.com/pentaCoxian/Qwen-V100-llama.cpp (commit `6209237df53569f07429f3f79fc5354de5fe704f`)
- Repositorio del motor preparado: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp

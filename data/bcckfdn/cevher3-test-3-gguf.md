# bcckfdn/cevher3-test-3-GGUF

## Resumen

cevher3-test-3-GGUF es la versión cuantizada en formato GGUF del modelo base bcckfdn/cevher3-test-3, un modelo de lenguaje de 1.256 millones de parámetros (aproximadamente 1,26 B) entrenado con la arquitectura Gemma3-SWA y orientado a la generación de texto conversacional en turco e inglés. Lo publica el usuario bcckfdn bajo licencia Apache 2.0, y su interés principal radica en que ofrece un modelo compacto (menos de 2,4 GB en BF16 y 744 MB en Q4_K_M) ejecutable en hardware de consumo mediante llama.cpp, Ollama o LM Studio.

El modelo emplea una arquitectura tipo transformer con atención de ventana deslizante (sliding window attention, SWA) según la nomenclatura de la familia Gemma 3, con un tamaño de representación oculta de 1792 y 34 capas. El autor declara un volumen de entrenamiento de 3.975 millones de tokens (3,975 B), un dato modesto que sitúa al modelo en la categoría de modelos pequeños ajustados o preentrenados desde cero para tareas ligeras, no en la de modelos de propósito general de gran escala.

La relevancia actual del modelo es limitada pero concreta: se trata de una publicación de pruebas (el nombre incluye "test") con cero descargas y cero interacciones en el momento de la consulta, lo que sugiere un uso experimental o de validación de pipeline de cuantización más que un modelo listo para producción. Aun así, su reducido tamaño y su soporte nativo de GGUF lo hacen adecuado para experimentación local en turco, un idioma con relativamente pocos modelos abiertos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante (Gemma3-SWA) |
| Parámetros totales | 1.256.312.832 (~1,26 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma3-SWA, es decir, un transformer decoder-only con atención de ventana deslizante, con dimensión oculta de 1792 y 34 capas. El autor indica un entrenamiento sobre 3.975 millones de tokens, sin especificar la composición del dataset, la mezcla de idiomas ni si se aplicaron fases de ajuste supervisado (SFT), RLHF o DPO. Tampoco se documenta el uso de decodificación especulativa, atención lineal ni otras innovaciones técnicas más allá de la propia ventana deslizante.

La información disponible no permite confirmar si el modelo se entrenó desde cero o si es un ajuste fino sobre un checkpoint Gemma 3 existente; la etiqueta `base_model` apunta a bcckfdn/cevher3-test-3, no a un modelo de Google, por lo que la relación con la familia Gemma 3 se limita a la arquitectura declarada. No se han publicado detalles sobre tokenizador, tamaño de vocabulario ni estrategia de empaquetado de secuencias.

## Capacidades

- Generación de texto conversacional en turco e inglés, con formato de chat (`-cnv` en llama.cpp).
- Razonamiento básico y respuesta a instrucciones de complejidad baja o media, coherente con un modelo de ~1,26 B de parámetros.
- Soporte multilingüe limitado a los dos idiomas declarados (tr, en); no se documentan otros idiomas.
- Compatibilidad con endpoints y pipelines de text-generation estándar (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta capacidad de código ni matemáticas avanzadas más allá de lo que un modelo de este tamaño puede ofrecer de forma genérica.

## Casos de uso

- Experimentación local en turco: el modelo permite probar generación de texto en turco en un portátil con GPU de consumo gracias a sus 744 MB en Q4_K_M, útil para validar pipelines antes de escalar a modelos mayores.
- Prototipado de chatbots conversacionales: con `llama-cli -cnv` o Ollama se puede montar un asistente multi-turno básico para demos internas, asumiendo respuestas de calidad limitada por el tamaño del modelo.
- Pruebas de cuantización y benchmarking de llama.cpp: al publicarse en cuatro niveles (BF16, Q8_0, Q5_K_M, Q4_K_M), sirve para medir degradación de calidad y throughput entre cuantizaciones sobre un mismo checkpoint.
- Generación de texto asistida en entornos sin conectividad: su reducido tamaño permite desplegarlo en dispositivos edge o portátiles sin GPU dedicada, para tareas de redacción o resumen de baja exigencia.
- Evaluación de la arquitectura Gemma3-SWA a pequeña escala: investigadores pueden estudiar el comportamiento de la ventana deslizante en un modelo de 34 capas y 1792 de dimensión oculta sin necesidad de infraestructura grande.
- Filtrado o clasificación textual ligera en inglés y turco: integrado vía API compatible con OpenAI (tag `endpoints_compatible`), puede emplearse para tareas de etiquetado simple donde la latencia y el coste importan más que la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,4 GB en BF16, ~1,3 GB en Q8_0, ~0,9 GB en Q5_K_M y ~0,75 GB en Q4_K_M (más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; para Q4_K_M basta con 2 GB, por lo que cabe en GTX 1650, RTX 3050, RTX 4060 y superiores; en A100/H100 el modelo queda sobredimensionado y no aprovecha el hardware.
- Cabe en GPU de consumo: sí, en todas las gamas mencionadas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante Modelfile), LM Studio (ruta `~/.cache/lm-studio/models/bcckfdn/cevher3-test-3-GGUF/`). No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cevher3-test-3-GGUF | ~1,26 B | No disponible | tr, en | Apache 2.0 | GGUF |
| Gemma 3 1B (Google) | ~1 B | No disponible en esta ficha | Multilingüe | Gemma Terms | safetensors, GGUF |
| Qwen2.5-1.5B | ~1,5 B | 32 768 tokens (según documentación pública de Qwen) | Multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | ~1,2 B | 128 000 tokens (según documentación pública de Meta) | Multilingüe | Llama 3.2 Community License | safetensors, GGUF |

La comparación con Gemma 3 1B, Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría (modelos de ~1-1,5 B parámetros); no se dispone de datos de rendimiento de cevher3-test-3 que permitan una comparación cuantitativa. Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y pueden variar según la versión.

## Limitaciones y advertencias

- Modelo de pruebas: el nombre incluye "test" y el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- Riesgo elevado de alucinación y de respuestas incoherentes en tareas complejas, dado el tamaño de ~1,26 B y un entrenamiento declarado de solo 3.975 millones de tokens.
- Contexto no documentado: se desconoce la longitud máxima de secuencia, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Cobertura lingüística limitada a turco e inglés; no se garantiza un comportamiento aceptable en castellano ni en otros idiomas.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia o ideología.
- Licencia Apache 2.0 permite uso comercial, pero al no haber benchmarks ni garantías de calidad, no se recomienda su uso en producción sin una evaluación previa propia.
- Sin soporte documentado de tool calling, agentes o visión, lo que descarta casos de uso que dependan de estas capacidades.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-3-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-3
- Repositorio relacionado (cevher-test-3-GGUF): https://huggingface.co/bcckfdn/cevher-test-3-GGUF
- Ficha de registro en Free2AITools: https://free2aitools.com/model/bcckfdn/cevher-test-3-gguf

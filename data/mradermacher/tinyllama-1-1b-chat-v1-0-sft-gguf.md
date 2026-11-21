# mradermacher/TinyLlama-1.1B-Chat-v1.0-sft-GGUF

## Resumen

TinyLlama-1.1B-Chat-v1.0-sft-GGUF es una colección de cuantizaciones en formato GGUF del modelo dpabonc/TinyLlama-1.1B-Chat-v1.0-sft, un ajuste fino supervisado (SFT) del conocido TinyLlama-1.1B-Chat-v1.0. El trabajo de cuantización lo realiza mradermacher, un prolífico publicador de versiones GGUF para su uso con llama.cpp y herramientas compatibles. El modelo original parte de la arquitectura TinyLlama, un transformer decoder-only de 1.100.052.480 parámetros (aproximadamente 1,1 mil millones), diseñado para ser ligero y ejecutable en hardware de consumo.

El problema que resuelve esta publicación es facilitar el despliegue del modelo ajustado en entornos con recursos limitados, ofreciendo un abanico de cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (2,3 GB). Al tratarse de una cuantización estática (sin imatrix), el objetivo es la compatibilidad y la simplicidad más que la máxima fidelidad posible. Es relevante para desarrolladores que quieran probar el ajuste SFT de dpabonc sin necesidad de GPUs de gama alta ni de infraestructura de servidor.

La información disponible sobre el modelo es escasa: no se detallan los datos de entrenamiento del SFT, la licencia del modelo base ni los resultados de benchmarks. La model card se limita a listar los ficheros GGUF y a remitir a la documentación de TheBloke para su uso. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama) |
| Parametros totales | 1.100.052.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de aproximadamente 1,1 mil millones de parámetros. Sobre esa base, dpabonc aplicó un ajuste fino supervisado (SFT) usando la librería TRL, tal como indican las etiquetas `sft`, `trl` y `generated_from_trainer`. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se emplearon técnicas adicionales como RLHF o DPO. Tampoco se detalla la longitud de contexto del modelo original ni posibles innovaciones técnicas (atención lineal, decodificación especulativa, etc.).

La contribución de mradermacher es puramente de conversión y cuantización: parte de los pesos en formato Hugging Face del modelo SFT y genera los ficheros GGUF mediante herramientas de cuantización compatibles con llama.cpp. Se trata de cuantizaciones estáticas, sin versiones con imatrix (weighted/imatrix quants), lo que el autor indica explícitamente en la model card. La versión de cuantización es la 2 y el tipo de conversión es `hf`.

## Capacidades

- Generación de texto conversacional en inglés, heredada de TinyLlama-1.1B-Chat-v1.0 y refinada mediante SFT.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño de 1,1B parámetros.
- Soporte de conversaciones multi-turno en formato chat (etiqueta `conversational`).
- Capacidades multilingües: únicamente inglés declarado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso en despliegues tipo API.

## Casos de uso

- Prototipado rápido de chatbots: el modelo puede gestionar conversaciones sencillas en inglés con un coste computacional mínimo, ideal para validar flujos de producto antes de invertir en modelos mayores.
- Inferencia en CPU o hardware de gama baja: las cuantizaciones Q4_K_M (0,8 GB) o Q4_K_S (0,7 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Pruebas de integración de pipelines GGUF: útil para verificar la compatibilidad de herramientas de serving (llama.cpp, Ollama, text-generation-webui) con modelos pequeños antes de desplegar variantes mayores.
- Generación de texto asistida en entornos embebidos o edge: el tamaño reducido (desde 0,5 GB en Q2_K) permite su inclusión en dispositivos con memoria limitada para tareas de autocompletado o respuestas cortas.
- Educación y experimentación con SFT: permite a investigadores comparar el comportamiento del ajuste de dpabonc frente al TinyLlama original sin necesidad de infraestructura pesada.
- Filtrado o clasificación ligera de texto: con prompts adecuados, puede emplearse para tareas de etiquetado simple o resumen de frases cortas, aunque con precisión limitada por su tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K), 0,8 GB (Q4_K_M), 1,3 GB (Q8_0) y 2,3 GB (f16), a los que hay que sumar el overhead del runtime y el contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar las cuantizaciones Q4 y Q5 con holgura. Para f16, una GPU con 4 GB o más es suficiente.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2-4 GB de VRAM, y también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida, pero al ser un modelo de 1,1B se esperan tasas de generación altas incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-sft (este, GGUF) | 1,1B | no disponible | no disponible | GGUF | SFT de TinyLlama, solo inglés |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens (modelo original) | Apache 2.0 (modelo original) | safetensors, GGUF | Base sin SFT adicional |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingüe, mayor contexto |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa reciente de Hugging Face |

Nota: los datos de TinyLlama original, Qwen2.5-1.5B y SmolLM2-1.7B provienen de conocimiento general de esos modelos y no de la información proporcionada en esta ficha; se incluyen como referencia comparativa. La licencia y el contexto del modelo aquí descrito no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base dpabonc/TinyLlama-1.1B-Chat-v1.0-sft y del TinyLlama original antes de usarlo en producción.
- Solo inglés: no se declaran capacidades multilingües, por lo que su uso en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación elevado: con 1,1B parámetros, la fidelidad factual es limitada y puede inventar datos con facilidad.
- Contexto limitado: no se documenta la longitud de contexto en esta publicación; el TinyLlama original tiene 2.048 tokens, lo que restringe conversaciones largas y documentos extensos.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay versiones weighted/imatrix, por lo que la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse más que con cuantizaciones ponderadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del ajuste SFT frente al modelo original.
- Modelo de nicho con pocas descargas (90) y sin likes: menor validación comunitaria y soporte.
- No apto para tareas que requieran tool calling, agentes o razonamiento complejo: no se documentan estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/TinyLlama-1.1B-Chat-v1.0-sft-GGUF
- Modelo base (SFT): https://huggingface.co/dpabonc/TinyLlama-1.1B-Chat-v1.0-sft
- Página de descargas del autor: https://hf.tst.eu/model#TinyLlama-1.1B-Chat-v1.0-sft-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

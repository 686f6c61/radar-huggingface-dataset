# mradermacher/llama32-1b-llm-abliteration-GGUF

## Resumen

Este repositorio contiene las cuantizaciones estáticas en formato GGUF del modelo **llama32-1b-llm-abliteration**, un modelo de 1.24B de parámetros (1.498.482.720 parámetros según safetensors) basado en Llama 3.2 1B de Meta, al que se ha aplicado una técnica de *abliteration* (desactivación de la alineación de seguridad mediante la proyección de las direcciones de rechazo en el espacio de activaciones). El modelo base fue creado por el usuario muhammadrafifatihulihsan y las cuantizaciones han sido realizadas por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face.

La abliteration resuelve el problema de los rechazos excesivos del modelo ante peticiones inofensivas, eliminando el comportamiento de negación sin necesidad de reentrenamiento. Es relevante para investigadores que estudian la alineación de modelos, la seguridad de LLMs y las técnicas de modificación de pesos, así como para usuarios que necesitan un modelo mínimo sin filtros de rechazo. Al tratarse de un modelo de ~1.5B de parámetros en GGUF, es ejecutable incluso en hardware muy modesto, incluidos teléfonos móviles y portátiles sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.498.482.720 (~1.5B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (Llama 3.2 1B base soporta 128K tokens, pero no consta en la información del repo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B de Meta: un transformer decoder optimizado para dispositivos con recursos limitados. Sobre este modelo base se aplicó *abliteration*, una técnica post-entrenamiento que identifica la dirección latente asociada a los rechazos (a partir de pares de prompts dañinos/inofensivos) y la elimina ortogonalmente de las matrices de pesos y de las activaciones. El resultado es un modelo que apenas genera negaciones tipo "I can't help with that", sin modificar la arquitectura ni el número de parámetros.

No hay información disponible sobre datos de entrenamiento adicionales, número de tokens, ni procesos de RLHF/DPO aplicados sobre el modelo abliterado: la abliteration es una modificación de pesos sin entrenamiento adicional. Las cuantizaciones de este repo son estáticas (no imatrix); existen versiones ponderadas/imatrix en el repo hermano `mradermacher/llama32-1b-llm-abliteration-i1-GGUF`.

## Capacidades

- Generacion de texto general en inglés, heredada de Llama 3.2 1B.
- Modelo conversacional (tag `conversational`), apto para chat multi-turno.
- Comportamiento sin rechazos: la abliteration elimina las negaciones de seguridad del modelo original.
- Razonamiento, código y matemáticas a nivel de Llama 3.2 1B: capacidades básicas, limitadas por el tamaño del modelo.
- No hay información sobre soporte de tool calling, function calling, agentes, visión ni audio.
- Compatible con Ollama, llama.cpp y otros runtimes que soportan GGUF.

## Casos de uso

- Investigacion en seguridad y alineacion: estudiar cómo la abliteration afecta al comportamiento del modelo, comparando respuestas antes y después de la intervención en los pesos.
- Red teaming y evaluacion de salvaguardas: usar el modelo como caso de prueba para evaluar si los filtros externos y las capas de moderación detectan modelos sin alineación interna.
- Despliegue en hardware minimo: con cuants de 0,8-1,1 GB (Q2_K a Q4_K_M), el modelo cabe en la RAM de prácticamente cualquier portátil, Raspberry Pi o teléfono móvil.
- Prototipado rapido de chatbots: integración directa en Ollama o llama.cpp para pruebas locales de interfaces conversacionales sin dependencias de GPU.
- Baseline para tecnicas de desalineacion: servir como punto de comparación para métodos alternativos como fine-tuning con DPO, unlearning o circuit breaking.
- Asistente personal local sin censura para usuarios avanzados que desean control total sobre el comportamiento del modelo en su propia máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia cualitativa, el cuantizador indica que Q4_K_S/Q4_K_M son "fast, recommended", Q6_K ofrece "very good quality" y Q8_0 es "fast, best quality".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,8 GB (Q2_K) hasta ~3,1 GB (f16); el cuant recomendado Q4_K_M ocupa ~1,1 GB más el KV cache.
- GPU recomendadas: no se requiere GPU; cualquier GPU con 2-4 GB de VRAM lo ejecuta a alta velocidad. En CPU, cualquier procesador moderno es suficiente.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso integradas (iGPU) con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (tag explícito en el repo), LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; por tamaño (1.5B), se espera generación rápida incluso en CPU (decenas de tokens/segundo en hardware de escritorio moderno).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/llama32-1b-llm-abliteration-GGUF | ~1.5B | GGUF (Q2_K a f16) | Llama 3.2 | Abliterado, sin rechazos |
| meta-llama/Llama-3.2-1B-Instruct | ~1.24B | safetensors | Llama 3.2 | Modelo original con alineación de seguridad |
| NousResearch/Hermes-3-Llama-3.2-1B | ~1.24B | safetensors/GGUF | Llama 3.2 | Fine-tune neutro con tool calling |
| huihui-ai/Llama-3.2-1B-Instruct-abliterated | ~1.24B | safetensors/GGUF | Llama 3.2 | Abliteración alternativa del mismo modelo base |

Frente al Llama 3.2 1B original, esta versión elimina los rechazos de seguridad; frente a otros modelos abliterados del mismo tamaño, la diferencia principal es el autor de la abliteration y la disponibilidad de cuants estáticos e imatrix por parte de mradermacher.

## Limitaciones y advertencias

- Modelo de 1.5B: capacidades de razonamiento, código y matemáticas muy limitadas; alta tasa de alucinaciones esperable, agravada por la abliteration al eliminar un mecanismo de contención.
- Sin alineacion de seguridad: puede generar contenido dañino, ilegal o inapropiado bajo petición. Su uso ético y legal es responsabilidad exclusiva del usuario.
- Idioma: entrenado/optimizado para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada en el repo; consultar la ficha del modelo base antes de asumir 128K tokens.
- Licencia: la Llama 3.2 Community License impone restricciones (límite de 700 millones de usuarios activos mensuales, política de uso aceptable, atribución a Meta); no es una licencia plenamente permisiva como Apache 2.0 o MIT.
- La abliteration puede degradar la calidad general del texto y la coherencia en comparación con el modelo original, especialmente en cuants bajos (Q2_K, Q3_K).
- No apto para producción en entornos expuestos a usuarios finales sin capas de moderación externas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llama32-1b-llm-abliteration-GGUF
- Modelo base abliterado: https://huggingface.co/muhammadrafifatihulihsan/llama32-1b-llm-abliteration
- Cuants imatrix/ponderados: https://huggingface.co/mradermacher/llama32-1b-llm-abliteration-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#llama32-1b-llm-abliteration-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

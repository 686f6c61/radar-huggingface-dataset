# kaitchup/DaisyRose-27B-dondon-GGUF

## Resumen

DaisyRose-27B-dondon-GGUF es una cuantización GGUF del modelo DaisyRose-27B de RadixArk, publicada por el usuario kaitchup. Se trata de un checkpoint de 27.320.697.856 parámetros totales (unos 27,3 mil millones) comprimido a un único fichero IQ2_M de 10,36 GB, pensado para ejecutarse en llama.cpp con soporte para la arquitectura Qwen3.5. La relevancia de esta release no está en el modelo base, sino en el método de cuantización: aplica una variante abaratada de GSQ (Gradient-based Sequential Quantization, IST-DASLab, arXiv:2604.18556) sobre el IQ2_M público de Bartowski, que actúa como checkpoint donante.

El objetivo es mejorar la fidelidad de un cuantizado de 2 bits por peso sin incurrir en el coste computacional completo de GSQ. Según la model card, el fichero resultante alcanza un 88,80 % de held-out EAR@10 (expected acceptance rate) frente al modelo BF16 de referencia, medido con llama.cpp sobre dominios que cubren matemáticas, razonamiento de opción múltiple, código, seguimiento de instrucciones, texto multilingüe, libros, chat humano, trazas de razonamiento y coding agéntico.

Es, por tanto, una ficha de interés para quienes necesitan desplegar un modelo de ~27B en hardware de consumo o en una sola GPU de gama alta con VRAM limitada, aceptando una pérdida de calidad medible pero acotada. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), 64 bloques decodificadores + 1 bloque de predicción del siguiente token |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--ctx-size 8192` |
| Tipos de cuantizacion | IQ2_M (mixed-precision: Q3_K en embeddings, Q5_K en output head, F32 en 360 tensores auxiliares) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `DaisyRose-27B-dondon-IQ2_M.gguf`, 10,358246 GB) |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B de RadixArk emplea una arquitectura transformer decoder-only de la familia Qwen3.5, con 64 bloques decodificadores más un bloque final de predicción del siguiente token. Esta release no reentrena el modelo: parte del checkpoint BF16 original y del IQ2_M público de Bartowski como donante, y aplica una variante de bajo coste de GSQ (Gradient-based Sequential Quantization) para reasignar precisiones por capa y tensor. La asignación resultante es mixta: Q3_K para los embeddings de tokens, Q5_K para la cabeza de salida y F32 para 360 tensores auxiliares, mientras que las matrices de los bloques decodificadores se distribuyen en distintos formatos según su sensibilidad, tal como refleja el mapa de precisión incluido en la model card.

La innovación técnica principal es precisamente ese esquema de cuantización mixta guiado por gradientes: en lugar de aplicar un IQ2_M uniforme, GSQ selecciona qué tensores merecen más bits para minimizar la divergencia respecto al BF16. El autor advierte de que esta implementación es una versión "más barata" que la GSQ original del paper, y que usar GSQ completo debería mejorar significativamente el resultado. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base DaisyRose-27B.
- Razonamiento matemático y de opción múltiple (evaluado en el conjunto held-out de la model card).
- Razonamiento sobre código y coding agéntico (dominios "code reasoning" y "agentic coding" en la evaluación).
- Seguimiento de instrucciones (instruction following).
- Procesamiento de texto multilingüe de web (evaluado en el dominio "multilingual web text").
- Trazas de razonamiento mixtas ("mixed reasoning traces"), lo que sugiere soporte de modos de pensamiento encadenado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documentan en la información disponible capacidades de visión, audio ni tool calling explícito.

## Casos de uso

- Despliegue local en una sola GPU de consumo: el fichero IQ2_M de 10,36 GB permite cargar el modelo completo en GPUs con 12-16 GB de VRAM usando llama.cpp con `--n-gpu-layers 99`, algo inviable con el BF16 de ~54 GB.
- Asistente de código en estación de trabajo: el modelo conserva razonamiento sobre código y coding agéntico tras la cuantización, por lo que puede integrarse en editores o terminales mediante un servidor local de llama.cpp en el puerto 8080.
- Prototipado de agentes con contexto medio: el ejemplo oficial arranca con 8.192 tokens de contexto, suficiente para tareas multi-paso con historial de conversación y resultados de herramientas.
- Evaluación de técnicas de cuantización: al publicar métricas de held-out EAR@10 (88,80 %) y KL top-10 frente a BF16, sirve como caso de estudio reproducible para comparar GSQ abreviado con IQ2_M estándar.
- Servicio de chat autoalojado con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, evita enviar datos a APIs externas, adecuado para entornos con datos sensibles.
- Razonamiento matemático y de opción múltiple en entornos sin conectividad: útil para clasificación, resolución de problemas y generación de explicaciones en equipos aislados.
- Inferencia en CPU o configuraciones híbridas CPU/GPU: el formato GGUF y el tamaño de 10,36 GB permiten repartir capas entre GPU y RAM del sistema cuando la VRAM es insuficiente.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización frente al BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos disponibles:

| Metrica | Valor |
|---|---|
| Held-out EAR@10 (%) frente a BF16 DaisyRose-27B | 88,8028 |
| Tamano del fichero (GB) | 10,358246 |
| Metodo | GSQ abreviado (variante de bajo coste) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,4 GB solo para los pesos en IQ2_M; hay que sumar la caché KV, que crece con el contexto. Con 8.192 tokens de contexto conviene reservar al menos 12-14 GB en total, aunque la cifra exacta depende de la configuración de llama.cpp y del modelo base.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) permiten cargar todas las capas con holgura; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) son viables con contexto moderado; A100 y H100 no son necesarias para esta cuantización, pero funcionan si se busca throughput.
- ¿Cabe en GPU de consumo? Sí: en GPUs de 12-16 GB con contexto reducido y en 24 GB con contexto amplio. También es posible el reparto parcial CPU/GPU en equipos con menos VRAM.
- Opciones de despliegue: llama.cpp (build con soporte Qwen3.5), `llama-server` con `--n-gpu-layers 99 --ctx-size 8192 --port 8080`. No se documentan en la información disponible otros runtimes (vLLM, TGI, Ollama) para este fichero concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-dondon-GGUF (este) | ~27,3 B | no disponible (ejemplo con 8.192) | GGUF IQ2_M, 10,36 GB | Apache 2.0 | GSQ abreviado, EAR@10 88,80 % |
| Bartowski RadixArk_DaisyRose-27B-GGUF (IQ2_M) | ~27,3 B | no disponible | GGUF IQ2_M | Apache 2.0 | Checkpoint donante, cuantización IQ2_M estándar |
| RadixArk DaisyRose-27B (BF16) | ~27,3 B | no disponible | safetensors BF16 (~54 GB estimados) | Apache 2.0 | Referencia de calidad completa, requiere mucha más VRAM |

No se dispone en la información proporcionada de comparaciones con modelos de otros autores del mismo tamaño y categoría.

## Limitaciones y advertencias

- Pérdida de calidad medible: el EAR@10 de 88,80 % implica que aproximadamente un 11 % de las predicciones no coinciden con el BF16 en el conjunto held-out; en tareas sensibles conviene validar contra el modelo completo.
- La cuantización usa una variante abreviada de GSQ; el propio autor indica que la GSQ original debería mejorar significativamente el resultado, por lo que esta release no representa el techo de calidad alcanzable con el método.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible; la compresión a 2 bits por peso puede agravarlo en dominios poco representados.
- Idiomas soportados no documentados: aunque se evalúa texto multilingüe de web, no hay lista oficial de lenguas ni garantías para castellano.
- Longitud de contexto no especificada en la model card; el ejemplo oficial usa 8.192 tokens, por lo que no debe asumirse una ventana mayor sin verificar el modelo base.
- No se documentan capacidades de tool calling, visión ni audio; no asumirlas en producción sin pruebas.
- Requiere una build de llama.cpp con soporte Qwen3.5; versiones antiguas pueden no cargar el fichero.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo base RadixArk/DaisyRose-27B y del checkpoint donante de Bartowski.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/DaisyRose-27B-dondon-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Checkpoint donante IQ2_M de Bartowski: https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ (IST-DASLab): https://github.com/IST-DASLab/GSQ
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup

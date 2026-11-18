# dendriteholdings/Ingot-I-27B-Q2

## Resumen

Ingot-I-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 27B) distribuido en formato GGUF y derivado de prism-ml/Ternary-Bonsai-2-27B-gguf mediante un proceso de cuantización competitiva. Lo publica dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se aproxima a él. No es, por tanto, un modelo entrenado desde cero, sino un refinamiento de los códigos ternarios del modelo base con escalas por bloque y pesos de normalización reajustados por el minero.

La relevancia del modelo es doble. Por un lado, documenta un caso real de cuantización optimizada por métricas de divergencia respecto al profesor (KL de las distribuciones de siguiente token y distancia de estados ocultos), lo que permite evaluar la fidelidad de una cuantización agresiva con números concretos en lugar de impresiones subjetivas. Por otro, ofrece un artefacto de 7,2 GB que cabe en hardware de consumo y que, según el autor, se decodifica aproximadamente 1,8 veces más rápido en modo greedy con un drafter especulativo DFlash 2.

El modelo se ejecuta únicamente con el fork de llama.cpp de PrismML en el commit `e3de715`, no con llama.cpp estándar, y hereda del modelo base la arquitectura, el tokenizador y la rotación de Hadamard. La información publicada no detalla la longitud de contexto, los idiomas soportados ni la licencia, y no incluye resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de prism-ml/Ternary-Bonsai-2-27B-gguf; transformer con pesos ternarios y rotación de Hadamard) |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ternaria (Q2/PQ2_0) con escalas por bloque; drafter especulativo DFlash 2 en Q8_0; proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-I-27B-PQ2_0.gguf`); también paquete MLX de 2 bits en dendriteholdings/Ingot-I-27B-MLX-2bit |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, un modelo con pesos ternarios y rotación de Hadamard cuyo layout, tokenizador y esquema de rotación se conservan intactos en esta publicación. La intervención del minero se limita a reajustar las escalas por bloque y los pesos de normalización para acercar la salida del modelo cuantizado a la del profesor BF16 Qwen3.8-27B. No hay, según la información disponible, un entrenamiento desde cero ni un proceso de RLHF o DPO documentado: el ajuste es de calibración de cuantización, guiado por una función de pérdida implícita en la métrica del validador.

La evaluación del subnet mide, por token de respuesta, la divergencia KL entre las distribuciones de siguiente token del profesor y del candidato, y la distancia relativa de estados ocultos promediada cada 8 capas. El modelo ganador obtuvo KL 0,12074 y distancia 0,3971, frente a KL 0,13018 y distancia 0,4540 del rey al que destronó en la misma evaluación. Esos son los únicos números de calidad publicados. Como innovación de despliegue, el autor entrena un drafter de decodificación especulativa, DFlash 2, que propone varios tokens por paso y el modelo verifica, con una ganancia declarada de 1,8x en greedy de un solo flujo y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo como `conversational` y `text-generation`.
- Razonamiento y conocimiento general: heredados del modelo base, sin benchmarks publicados que los cuantifiquen.
- Decodificación especulativa con DFlash 2: acelera la generación en un solo flujo mediante verificación de tokens propuestos.
- Entrada de imágenes opcional: añadiendo el proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `Ternary-Bonsai-2-27B-mmproj-BF16.gguf` del modelo base; la calidad visual no está validada para estos pesos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar, aunque requiere el fork de llama.cpp.
- Tool calling, function calling, agentes multi-paso y modo thinking: no disponibles en la información publicada.

## Casos de uso

- Despliegue en hardware de consumo: con 7,2 GB de pesos ternarios, el modelo cabe en GPUs de gama media y en Apple Silicon mediante el paquete MLX de 2 bits, lo que permite ejecutar un modelo de 27B en un portátil o en una estación de trabajo sin GPUs de datacenter.
- Chat conversacional de un solo flujo con baja latencia: activando el drafter DFlash 2 en Q8_0 se obtiene aproximadamente 1,8x de velocidad en greedy, adecuado para asistentes interactivos donde prima el tiempo hasta el primer token completo.
- Investigación en cuantización: el par KL/distancia de estados ocultos frente al profesor BF16 permite estudiar el compromiso entre compresión ternaria y fidelidad de distribución, y comparar metodologías de calibración de escalas.
- Reproducción de pipelines de Bittensor: sirve como referencia para mineros que quieran replicar el formato de submission de Ingot, incluido el layout GGUF, el tokenizador y la rotación de Hadamard del modelo genesis.
- Generación de texto por lotes en entornos con VRAM limitada: el tamaño reducido del archivo permite mantener varias instancias o contextos largos en una sola GPU, siempre que el fork de PrismML esté disponible.
- Evaluación comparativa de cuantizaciones: al existir el modelo genesis y este refinamiento con las mismas métricas, se puede medir empíricamente cuánto aporta el reajuste de escalas y normas en tareas propias.
- Prototipado multimodal con reservas: añadiendo el proyector visual se puede experimentar con entrada de imágenes, aunque el autor advierte que el proyector se creó para genesis y la calidad visual no está probada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de calidad son las métricas de fidelidad frente al profesor BF16:

| Métrica | Ingot-I-27B-Q2 | Rey anterior en la misma evaluación |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,12074 | 0,13018 |
| Distancia de estados ocultos (cada 8 capas) | 0,3971 | 0,4540 |

## Requisitos de hardware

- VRAM para inferencia: el archivo GGUF pesa 7,2 GB; con overhead de contexto y caché KV conviene reservar al menos 10-12 GB para uso cómodo.
- Con drafter especulativo: sumar aproximadamente 6 GB adicionales de VRAM para `Ingot-27B-DFlash2-Q8_0.gguf`.
- GPU recomendadas: no hay una lista oficial; por tamaño, cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super y GPUs de 16 GB o más. Para mayor throughput en servidor, A100 o H100 con `-ngl 99`.
- Consumer GPU: sí, en tarjetas de 12-16 GB o superiores, y en Apple Silicon mediante el paquete MLX de 2 bits.
- Opciones de despliegue: exclusivamente el fork de PrismML de llama.cpp en el commit `e3de715222b2667c54a267441159a5729f11155e`, compilado con `-DGGML_CUDA=ON` si se usa GPU. llama.cpp estándar, Ollama, vLLM y TGI no están soportados según la información disponible.
- Latencia y throughput: el autor declara 1,8x de aceleración en greedy de un solo flujo y 1,3-1,4x con sampling al usar DFlash 2; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-I-27B-Q2 | 26,9B | no disponible | ternaria (Q2/PQ2_0), GGUF | no disponible | Hugging Face, requiere fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | no disponible | no disponible | ternaria, GGUF | no disponible | Hugging Face |
| dendriteholdings/Ingot-genesis-27B-Q2 | no disponible | no disponible | Q2, GGUF | no disponible | Hugging Face |
| dendriteholdings/Ingot-I-27B-MLX-2bit | no disponible | no disponible | 2 bits, MLX | no disponible | Hugging Face |

La comparación con modelos de la misma categoría (27B en BF16 o INT4) no está disponible en la información proporcionada; los únicos puntos de referencia publicados son las métricas de fidelidad frente al profesor.

## Limitaciones y advertencias

- No funciona con llama.cpp estándar: requiere el fork de PrismML en un commit concreto, lo que complica el mantenimiento y la integración en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; hay que contactar con el autor o con Prism ML antes de desplegarlo.
- Idiomas y contexto no documentados: no se puede planificar soporte multilingüe ni ventanas largas sin pruebas propias.
- Sin benchmarks de tareas: no hay MMLU, HumanEval ni GSM8K, por lo que la calidad real en razonamiento, código o matemáticas es desconocida.
- Riesgo de alucinación: inherente a un modelo conversacional de 27B cuantizado de forma agresiva; la cuantización ternaria puede amplificar la deriva respecto al profesor en dominios poco representados.
- Calidad visual no validada: el proyector mmproj se creó para genesis, no para estos pesos, y el subnet solo evalúa el modelo de texto.
- Sesgos: no documentados; al heredar del modelo base, arrastra los sesgos de su dataset de entrenamiento, que no se detalla.
- Trazabilidad: los pesos son la subida del minero byte a byte; la responsabilidad de la calidad recae en el minero y en Prism ML, no en un proceso de revisión editorial.
- Aceleración especulativa con coste: DFlash 2 añade unos 6 GB de VRAM y solo está validado en el mismo fork.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-I-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo genesis: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Paquete MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-I-27B-MLX-2bit
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Commit de referencia: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Proyector visual Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector visual BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf

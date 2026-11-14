# dendriteholdings/Ingot-XXXVII-27B-Q2

## Resumen

Ingot-XXXVII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros derivado de Prism ML Ternary Bonsai 2 27B, publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se le aproxima. No se trata de un entrenamiento desde cero ni de un fine-tuning convencional: el minero conservó los códigos ternarios de Bonsai 2 y reajustó el resto de pesos para acercar la distribución de salida a la del profesor Qwen3.8-27B.

El modelo se distribuye exclusivamente en formato GGUF con dos empaquetados del mismo conjunto de pesos ternarios: uno de 1,75 bits por peso (5,95 GB) y otro de 2,125 bits en contenedor de 2 bits (7,21 GB). La relevancia práctica reside en su relación calidad/tamaño: un modelo de 27B que ocupa menos de 8 GB en disco y que, según las mediciones del autor, decodifica a 137-145 tokens por segundo en una RTX PRO 6000 Blackwell y a 44-56 tokens por segundo en un Mac Studio M3 Ultra.

Requiere un fork específico de llama.cpp (DendriteLabs) en el commit `62c418c`; el llama.cpp estándar no ejecuta estos ficheros. La model card no documenta licencia, idiomas soportados ni resultados de benchmarks convencionales, por lo que las evaluaciones disponibles se limitan a la métrica de divergencia KL frente al profesor y a las cifras de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención lineal (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bpw, 5,95 GB) y PQ2_0 (2,125 bpw en contenedor de 2 bits, 7,21 GB) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Prism ML Ternary Bonsai 2 27B, un transformer con pesos ternarios que incorpora una rotación de Hadamard y una actualización de estado de atención lineal, tal como se deduce de las optimizaciones Metal del fork de Dendrite, que fusiona ambas operaciones. El modelo base emplea un esquema de cuantización ternaria con escalas fp16 por bloque de 128 pesos, lo que permite que cada peso se decodifique a un valor determinista y que el repack entre formatos sea sin pérdida.

El proceso de obtención no incluye un entrenamiento desde cero documentado. El minero de la subnet Ingot (hotkey `5GGrod77yagrm2PiJu73Qu2p16sTM5iLWy7fX1j1hCbwDhUC`, uid 206) partió de los códigos ternarios de Bonsai 2 y reajustó el resto de pesos para minimizar la divergencia respecto al profesor Qwen3.8-27B. La model card no especifica volumen de tokens, composición del dataset ni si hubo RLHF o DPO; el único criterio de selección declarado es la KL(profesor ‖ modelo) sobre las distribuciones del siguiente token, ponderada por dominio. El resultado reportado es una KL de 0,07766 frente a 0,07926 del rey anterior en la misma evaluación.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card lo etiqueta como conversational.
- Razonamiento y respuesta multi-turno: heredado del profesor Qwen3.8-27B, aunque no se detallan capacidades específicas en la documentación.
- Procesamiento de imágenes opcional: se puede acoplar el proyector multimodal de Ternary Bonsai 2 (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`) mediante `--mmproj`. El autor advierte que el proyector se creó para el modelo genesis y que la calidad de imagen no está probada.
- Tool calling y plantillas de chat: el servidor se lanza con `--jinja`, lo que habilita el uso de plantillas de chat con soporte de herramientas en llama.cpp, aunque la model card no documenta explícitamente function calling.
- Decodificación especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Despliegue en hardware de gama alta con VRAM limitada: con 5,95-7,21 GB de pesos, el modelo cabe holgadamente en una RTX 4090 o RTX 5090 y permite servir un 27B en una sola GPU consumer, algo inviable con pesos BF16 equivalentes.
- Asistente conversacional de baja latencia: los 137-145 tok/s de decodificación en una RTX PRO 6000 Blackwell y los 44-56 tok/s en un Mac Studio M3 Ultra lo hacen adecuado para chat interactivo en streaming con un solo usuario.
- Generación en estaciones de trabajo Apple Silicon: el fork de Dendrite con el parche Metal fusionado mejora la decodificación de 44,5 a 56,4 tok/s en el fichero PQ2_0, lo que permite usar el modelo en un Mac Studio M3 Ultra sin GPU dedicada.
- Evaluación de técnicas de cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un 27B a 1,75-2,125 bpw frente a su profesor, con la métrica KL publicada como línea base.
- Investigación sobre subnets de Bittensor e incentivos de cuantización: el modelo documenta el criterio de selección (KL ponderada por dominio) y los artefactos de una submission ganadora, útil para analizar dinámicas de minería.
- Prototipado de pipelines con decodificación especulativa: la integración con el drafter DFlash 2 permite medir el trade-off entre velocidad (1,3-1,8x) y coste de VRAM (+6 GB) en un caso real.
- Experimentos multimodales exploratorios: acoplando el proyector de Bonsai 2 se puede probar entrada de imágenes, asumiendo que la calidad no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad reportada es la divergencia KL frente al profesor:

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo), evaluacion ganadora | 0,07766 |
| KL(profesor ‖ modelo), rey anterior en la misma evaluacion | 0,07926 |

Rendimiento medido por el autor:

| Hardware | Fichero | Decode (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB, `llama-bench` tg128/pp512 | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB, `llama-bench` tg128/pp512 | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 6-8 GB para los pesos según fichero, más overhead de contexto y caché KV. El tamaño del repositorio es de 13,2 GB porque incluye ambos GGUF.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (142 tok/s reportados por PrismML para el modelo base), RTX 4090 y superiores por capacidad de VRAM.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 8-12 GB o más, dado el tamaño de los pesos.
- Apple Silicon: funciona en Mac Studio M3 Ultra con Metal; el fork de Dendrite mejora sustancialmente la decodificación.
- Opciones de despliegue: exclusivamente el fork DendriteLabs de llama.cpp en el commit `62c418c` (compilado con `-DGGML_CUDA=ON` para GPU). El llama.cpp estándar no ejecuta estos ficheros. No hay soporte documentado para vLLM, TGI u Ollama.
- Aceleración opcional: drafter DFlash 2 (`Ingot-27B-DFlash2-Q8_0.gguf`) con `--spec-type draft-dflash --spec-draft-n-max 5`, a cambio de unos 6 GB adicionales de VRAM.
- Throughput: 137-145 tok/s de decodificación y 3.865 tok/s de prompt en RTX PRO 6000 Blackwell; 44-56 tok/s de decodificación en M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bpw | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-XXXVII-27B-Q2 | 26,9B | No disponible | GGUF, 1,75-2,125 bpw | No disponible | Requiere fork Dendrite de llama.cpp; KL 0,07766 |
| Prism ML Ternary Bonsai 2 27B | 27B (aproximado) | No disponible | GGUF ternario (PQ2_0, PTQ1_0) | No disponible | Modelo profesor base; 142 tok/s en RTX 5090 según PrismML |
| Qwen3.8-27B (profesor de referencia) | 27B (aproximado) | No disponible | No disponible | No disponible | Objetivo de la destilación por KL; sin datos públicos en la información disponible |
| Ingot-genesis-27B-Q2 | 27B (aproximado) | No disponible | GGUF Q2 | No disponible | Mismo layout, tokenizer y rotación de Hadamard; base del ecosistema Ingot |

No se dispone de datos suficientes para comparar rendimiento en tareas estándar con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada en la model card ni en los metadatos de Hugging Face; no se puede asumir uso comercial sin verificar la licencia del modelo base (Ternary Bonsai 2) y del profesor.
- El modelo solo funciona con un fork específico de llama.cpp en un commit concreto; no hay compatibilidad con llama.cpp upstream, vLLM, TGI ni Ollama, lo que limita su integración en infraestructura estándar.
- La cuantización a 1,75-2,125 bpw implica una degradación inevitable frente al profesor; la KL de 0,07766 cuantifica esa divergencia, pero no se traducen a métricas de tarea.
- No hay benchmarks convencionales publicados, por lo que el rendimiento real en razonamiento, código o matemáticas es desconocido.
- El soporte multimodal es experimental: el proyector se creó para el modelo genesis y la calidad de imagen no está probada.
- No se documentan idiomas soportados ni sesgos conocidos; se desconoce el comportamiento fuera del inglés o de los idiomas del profesor.
- Riesgo de alucinación no evaluado; el modelo se seleccionó por proximidad distribucional al profesor, no por veracidad factual.
- La decodificación especulativa con DFlash 2 requiere unos 6 GB adicionales de VRAM y solo acelera en el fork de Dendrite.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto de investigación de una subnet, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Modelo genesis de la familia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b

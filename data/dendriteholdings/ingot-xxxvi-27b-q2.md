# dendriteholdings/Ingot-XXXVI-27B-Q2

## Resumen

Ingot-XXXVI-27B-Q2 es un modelo de lenguaje de 27.000 millones de parámetros (26.895.998.464 según los pesos reales) derivado de Prism ML Ternary Bonsai 2 27B, publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que queda más próxima a él. El modelo conserva los códigos ternarios originales de Bonsai 2 y reajusta el resto de pesos para acercarse a Qwen3.8-27B, que actúa como profesor de referencia.

La relevancia es doble: por un lado muestra el estado del arte en cuantización extrema (1,75 y 2,125 bits por peso) aplicada a un transformer de 27B, y por otro documenta un pipeline de evaluación basado en divergencia KL respecto al profesor BF16 (0,08047 frente a 0,08219 del rey anterior). El modelo se distribuye en formato GGUF para llama.cpp y requiere un fork específico (Dendrite fork de PrismML) porque usa rotación Hadamard y atención lineal que el llama.cpp estándar no soporta.

Arquitectura híbrida con atención lineal, tokenizer y layout propios de la familia Ingot genesis, licencia no declarada y sin idiomas documentados. Es un artefacto de competición más que un modelo de producción listo para usar, pero ilustra técnicas de compresión y decodificación especulativa que merecen atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y rotación Hadamard (familia Ingot genesis / Ternary Bonsai 2) |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 a 1,75 bits/peso y PQ2_0 a 2,125 bits/peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp), ficheros `Ingot-XXXVI-27B-PTQ1_0.gguf` (5,95 GB) y `Ingot-XXXVI-27B-PQ2_0.gguf` (7,21 GB) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, un transformer con atención lineal y rotación Hadamard aplicada a los pesos, cuantizado de forma ternaria. La submission ganadora de Ingot conserva los códigos ternarios del profesor y reajusta el resto de pesos (escalas y componentes no ternarios) mediante fine-tuning para minimizar la divergencia respecto a Qwen3.8-27B en BF16. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO.

La innovación técnica principal es el esquema de cuantización ternaria con repack lossless: cada bloque de 128 pesos mantiene sus códigos y escala fp16, de modo que PTQ1_0 decodifica exactamente los mismos valores que PQ2_0 pero ocupa menos espacio. Además, el autor entrena un drafter de decodificación especulativa (DFlash 2, `Ingot-27B-DFlash2`) que acelera la generación aproximadamente 1,8x en greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB extra de VRAM.

## Capacidades

- Generación de texto conversacional (tag `conversational` en Hugging Face).
- Razonamiento y respuesta multi-turno, presumiblemente heredados del profesor Qwen3.8-27B, aunque no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Visión: opcional, añadiendo el tower `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf` de Prism ML como proyector; el autor advierte que fue creado para genesis, no para estos pesos, y que la calidad de imagen no está probada.
- Decodificación especulativa mediante drafter DFlash 2 (`--spec-type draft-dflash`).

## Casos de uso

- Investigación en cuantización extrema: servir como referencia reproducible para estudiar cómo se comporta un transformer de 27B a 1,75-2,125 bits/peso en tareas de lenguaje, comparando KL frente al profesor BF16.
- Reproducción de competiciones Bittensor/Ingot: validar submissions, comparar metodologías de cuantización y medir distancias al profesor con el mismo pipeline de evaluación.
- Despliegue en hardware de gama alta con VRAM limitada: los 5,95-7,21 GB de los GGUF permiten ejecutar un modelo de 27B en GPUs consumer con 8-12 GB, algo inviable con pesos BF16 (≈54 GB).
- Experimentación con decodificación especulativa: usar el drafter DFlash 2 para medir ganancias de throughput en greedy y sampling en un fork concreto de llama.cpp.
- Prototipado de asistentes conversacionales en local: con `llama-server` y `--jinja` se puede levantar un endpoint compatible con la API de chat, útil para demos internas.
- Benchmarking de forks de llama.cpp: comparar el rendimiento del fork Dendrite (con parche Metal que fusiona rotación Hadamard y actualización de estado de atención lineal) frente al fork stock de PrismML en Mac Studio M3 Ultra.
- Evaluación multimodal exploratoria: añadir el mmproj de Bonsai 2 para probar entrada de imágenes, asumiendo que la calidad no está garantizada.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única métrica de calidad documentada es la divergencia KL por token de respuesta frente al profesor BF16:

| Modelo | KL (menor es mejor) |
|---|---|
| Ingot-XXXVI-27B-Q2 (esta submission) | 0,08047 |
| Rey anterior de Ingot, misma eval | 0,08219 |

Rendimiento medido con `llama-bench` (`tg128` y `pp512`, `-ngl 99 -fa 1`):

| GPU | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| NVIDIA RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| NVIDIA RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock (Metal) | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock (Metal) | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) solo para pesos; hay que sumar overhead de contexto KV y del runtime.
- VRAM adicional con drafter DFlash 2: aproximadamente 6 GB extra (≈13-14 GB totales con PQ2_0).
- VRAM adicional con visión: el mmproj Q8_0 o BF16 de Bonsai 2 (tamaño no documentado en la información disponible).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s; RTX 5090 reportada por PrismML a 142 tok/s con Bonsai 2 PQ2_0; cualquier GPU consumer con ≥8-12 GB debería poder cargar los pesos, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: sí, por tamaño de pesos; el cuello de botella es el fork requerido y el rendimiento real no medido.
- Despliegue: exclusivamente llama.cpp mediante el Dendrite fork de PrismML en el commit `62c418c` (stock llama.cpp no lo ejecuta). Comando: `llama-server -m Ingot-XXXVI-27B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: ver tabla de benchmarks. En Mac Studio M3 Ultra, el parche Metal del fork Dendrite mejora decode de 44,5 a 56,4 tok/s (PQ2_0) y de 43,1 a 52,8 tok/s (PTQ1_0).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXVI-27B-Q2 | ≈27B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | GGUF, fork Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-gguf (profesor) | ≈27B | no disponible | Ternaria (PQ2_0 / PTQ1_0) | no disponible | GGUF, fork PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 (familia genesis) | ≈27B | no disponible | Ternaria Q2 | no disponible | GGUF, fork Dendrite |
| Qwen3.8-27B (profesor de referencia) | ≈27B | no disponible | BF16 | no disponible | no disponible en la información |

La comparación relevante es frente a Bonsai 2: Ingot-XXXVI reajusta los pesos no ternarios para reducir KL de 0,08219 (rey anterior) a 0,08047, manteniendo el mismo layout y tamaño de fichero. Frente a Qwen3.8-27B, el modelo ternario ocupa aproximadamente una décima parte del espacio pero no se publican comparaciones directas de calidad más allá de la KL.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial; hay que contactar con el autor antes de producción.
- Idiomas no documentados: no se puede asumir cobertura multilingüe más allá del profesor Qwen3.8-27B.
- Longitud de contexto no documentada: no se puede planificar uso con contextos largos sin medirla empíricamente.
- Requiere un fork concreto de llama.cpp (`62c418c` del Dendrite fork); stock llama.cpp no carga el modelo, lo que limita portabilidad y soporte.
- Calidad multimodal no probada: el mmproj de Bonsai 2 fue entrenado para genesis, no para estos pesos.
- Riesgo de alucinación inherente a modelos de 27B cuantizados a 1,75-2,125 bits/peso; la KL de 0,08 indica una divergencia no trivial frente al profesor BF16.
- Sesgos: no documentados; presumiblemente heredados del dataset de Bonsai 2 y del profesor Qwen3.8-27B.
- Artefacto de competición: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento, soporte ni actualizaciones.
- El drafter DFlash 2 añade ≈6 GB de VRAM y solo acelera en greedy/sampling con el fork, no en batch grande.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVI-27B-Q2
- Modelo base (Ternary Bonsai 2 27B): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Familia genesis (layout y tokenizer de referencia): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b

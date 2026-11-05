# dendriteholdings/Ingot-XXVII-27B-Q2

## Resumen

Ingot-XXVII-27B-Q2 es un modelo de lenguaje de 27.000 millones de parámetros distribuido en formato GGUF que constituye un espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros reciben un modelo profesor fijo y compiten por producir la cuantización que más se acerque a él. El modelo parte de Prism ML's Ternary Bonsai 2 27B y aplica un reajuste de los pesos no ternarios por parte del minero (hotkey `5DfVLKYqPAPgtuEzo1ENHosCBDeikBRAKZ6opEvnZqDwVXVF`, uid 18) para acercarse al profesor Qwen3.8-27B, conservando los códigos ternarios originales.

La relevancia del modelo es doble. Por un lado, demuestra que es posible comprimir un modelo de 27B a 1,75-2,125 bits por peso (5,95 GB y 7,21 GB respectivamente) manteniendo una divergencia KL de 0,07881 frente al profesor BF16, ligeramente mejor que la del rey anterior (0,08125). Por otro, ilustra un ecosistema de cuantización competitiva donde la fidelidad al profesor se mide de forma objetiva y reproducible, algo poco habitual en el ecosistema open source.

El modelo no funciona con llama.cpp estándar: requiere el fork de Dendrite de llama.cpp de Prism ML en un commit concreto (`62c418c`) y aprovecha una rotación Hadamard y una atención lineal específicas de esta familia. Está pensado para inferencia en GPUs de gama alta y Apple Silicon, con soporte opcional de decodificación especulativa mediante un drafter DFlash 2 y de entrada multimodal mediante el proyector de visión de Ternary Bonsai 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación Hadamard (familia Ternary Bonsai 2), pesos ternarios |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | PTQ1_0 (1,75 bpw), PQ2_0 (2,125 bpw, mismo contenido ternario en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); también disponible como pack MLX para Apple Silicon según la model card |
| Bits por peso | 1,75 (PTQ1_0) / 2,125 (PQ2_0) |
| Tamaño de archivo | 5,95 GB (PTQ1_0) / 7,21 GB (PQ2_0) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (finetune) |
| Profesor de referencia | Qwen3.8-27B (según la model card) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 de Prism ML: un transformer con pesos ternarios organizados en bloques de 128 pesos, cada uno con sus códigos ternarios y una escala fp16. La innovación clave es la rotación Hadamard aplicada sobre las activaciones y una actualización de estado de atención lineal, que el fork de Dendrite de llama.cpp fusiona en Metal para acelerar la inferencia en Apple Silicon. El archivo PTQ1_0 es un reempaquetado sin pérdida del PQ2_0 del minero: cada bloque conserva sus códigos y su escala, y cada peso decodifica al mismo valor. Según la model card, el mismo reempaquetado aplicado al PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

El entrenamiento no es un preentrenamiento desde cero ni un RLHF clásico: es un proceso de refinamiento competitivo dentro de la subnet Ingot. El minero parte de los códigos ternarios de Bonsai 2 y reajusta el resto de pesos para minimizar la divergencia KL entre sus distribuciones de siguiente token y las del profesor BF16 (Qwen3.8-27B), evaluadas sobre las mismas respuestas. El resultado ganador obtuvo KL 0,07881 frente a 0,08125 del rey anterior en la misma evaluación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de DPO o RLHF adicionales.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja (`--jinja`) y tokenizador propio de la familia Ingot.
- Razonamiento y respuesta multi-turno, heredado del profesor Qwen3.8-27B según la model card.
- Cuantización extrema: mantiene fidelidad al profesor con solo 1,75-2,125 bits por peso, lo que permite ejecución en hardware de gama alta consumer.
- Decodificación especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), con aceleración de aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.
- Entrada multimodal opcional: se puede acoplar el proyector de visión de Ternary Bonsai 2 (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o BF16) para procesar imágenes, aunque la calidad no está validada para estos pesos.
- Compatibilidad con endpoints según el tag `endpoints_compatible` de HuggingFace.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de chat conversacional en GPUs de 24-32 GB: con 5,95-7,21 GB de pesos, el modelo cabe holgadamente en una RTX 5090 o RTX 4090 y deja margen para KV cache y contexto, lo que permite servir un 27B ternario en hardware consumer de gama alta.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra con 512 GB, el fork de Dendrite alcanza 56,4 tok/s de decodificación con PQ2_0 y 52,8 tok/s con PTQ1_0, suficiente para asistentes locales interactivos sin depender de la nube.
- Servicio de alto throughput en servidor: en una RTX PRO 6000 Blackwell (96 GB) el modelo decodifica a 137-145 tok/s y procesa prompts a 3.865 tok/s, adecuado para APIs internas con múltiples usuarios concurrentes.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el compromiso entre bits por peso y divergencia KL frente a un profesor BF16, ya que la model card publica la metodología de evaluación y los artefactos.
- Evaluación de subnets de Bittensor: útil para replicar el pipeline de Ingot, comparar submissions de mineros y validar que el reempaquetado PTQ1_0 preserva exactamente los pesos del PQ2_0.
- Prototipado de asistentes multimodales: acoplando el proyector de visión de Ternary Bonsai 2 se puede experimentar con entrada de imágenes en un modelo de 27B que ocupa menos de 8 GB, aunque la calidad visual no está garantizada.
- Aceleración de chat en producción con decodificación especulativa: el drafter DFlash 2 añade unos 6 GB de VRAM y acelera la generación en greedy, útil en asistentes de una sola secuencia donde la latencia importa más que el throughput agregado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El único dato de calidad es la divergencia KL frente al profesor BF16 en la evaluación de Ingot:

| Métrica | Ingot-XXVII-27B-Q2 | Rey anterior (misma eval) |
|---|---|---|
| KL(profesor ‖ modelo), por token de respuesta | 0,07881 | 0,08125 |

Rendimiento de inferencia medido con `llama-bench` (tg128 y pp512, `-ngl 99 -fa 1`):

| Hardware | Archivo | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090, dato no verificado por el autor de esta ficha.

## Requisitos de hardware

- VRAM para pesos: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0); añadir KV cache y overhead del runtime.
- VRAM con decodificación especulativa: sumar aproximadamente 6 GB para el drafter DFlash 2 en Q8_0.
- VRAM con visión: sumar el proyector mmproj (Q8_0 o BF16, tamaño no especificado en la información disponible).
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB) para máximo throughput; RTX 5090 y RTX 4090 para uso consumer de gama alta; cualquier GPU con al menos 8-12 GB libres para los pesos más el contexto.
- Apple Silicon: Mac Studio M3 Ultra (80-core GPU, 512 GB) con Metal; el fork de Dendrite mejora la decodificación un 27 % respecto al fork stock de PrismML.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 5090 y equivalentes con 24 GB o más, siempre que se use el fork correcto.
- Opciones de despliegue: llama.cpp fork de Dendrite en el commit `62c418c` (con `-ngl 99 -fa on --jinja`); llama.cpp estándar no lo ejecuta. También hay un pack MLX para Apple Silicon según la model card. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: ver tabla de benchmarks; en servidor Blackwell se superan los 130 tok/s de decodificación y casi 4.000 tok/s de prompt; en Mac Studio M3 Ultra con el fork de Dendrite se alcanzan 52-56 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXVII-27B-Q2 | 26,9B | no disponible | 1,75-2,125 bpw (GGUF) | no disponible | HuggingFace, requiere fork Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible (27B por nombre) | no disponible | ternario (PQ2_0, PTQ1_0) | no disponible | HuggingFace, fork PrismML de llama.cpp |
| dendriteholdings/Ingot-genesis-27B-Q2 | no disponible (27B por nombre) | no disponible | Q2 (GGUF) | no disponible | HuggingFace, mismo layout y tokenizador |
| Qwen3.8-27B (profesor) | no disponible | no disponible | BF16 (referencia) | no disponible | no disponible en la información |

La comparativa se limita a los modelos mencionados en la model card; no se dispone de datos de benchmarks estándar para contrastar calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de desplegarlo en producción.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo heredado del profesor.
- Longitud de contexto no especificada: hay que determinarla empíricamente antes de diseñar aplicaciones con prompts largos.
- Requiere un fork concreto de llama.cpp (`DendriteLabs/llama.cpp` en el commit `62c418c`); llama.cpp estándar, vLLM, TGI u Ollama pueden no cargarlo.
- La calidad multimodal no está validada: el proyector de visión fue entrenado para genesis, no para estos pesos, e Ingot solo evalúa el modelo de texto.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado a menos de 2 bits por peso; la KL de 0,07881 indica cercanía al profesor, no ausencia de errores.
- Sesgos no documentados: no se publica información sobre composición del dataset ni evaluaciones de sesgo.
- El modelo es una submission de un certamen de cuantización, no un modelo entrenado desde cero; su comportamiento fuera de la distribución de evaluación de Ingot es desconocido.
- El rendimiento reportado se ha medido en hardware muy específico (RTX PRO 6000 Blackwell y Mac Studio M3 Ultra); en otras GPUs puede diferir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXVII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión (Q8_0): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión (BF16): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b

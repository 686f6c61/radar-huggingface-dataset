# dendriteholdings/Ingot-XLII-27B-Q2

## Resumen

Ingot-XLII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf, un transformer con pesos ternarios, y el minero reajustó los pesos no ternarios para acercar la distribución de salida a la del profesor Qwen3.8-27B.

La relevancia es doble: por un lado demuestra un pipeline de cuantización competitiva verificable (KL respecto al profesor de 0,07005 frente a 0,07156 del rey anterior); por otro, ofrece un modelo de 27B en formato GGUF de 5,95-7,21 GB, ejecutable en una sola GPU consumer de gama alta o en un Mac Studio, con un decodificador especulativo opcional que acelera la generación.

No dispone de licencia declarada ni de listado de idiomas en la información proporcionada, y requiere un fork específico de llama.cpp (DendriteLabs) para su ejecución, ya que llama.cpp estándar no lo soporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (base: Ternary Bonsai 2 27B, con rotación Hadamard y atención lineal según el fork de llama.cpp) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bits por peso, 5,95 GB) y PQ2_0 (2,125 bits por peso, 7,21 GB); ambos contenedores albergan los mismos pesos ternarios |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Ternary Bonsai 2 27B, un transformer de 27B con pesos ternarios. La model card describe que el minero conservó los códigos ternarios del modelo base y reajustó el resto de los pesos para acercar la salida del modelo a la de Qwen3.8-27B, el profesor de referencia en la subred Ingot. El objetivo de entrenamiento es explícitamente de destilación: minimizar la divergencia KL entre las distribuciones de siguiente token del profesor y del modelo sobre los tokens de respuesta de cada dominio, ponderando cada dominio por su peso en el conjunto de evaluación.

La innovación técnica más destacable no está en el entrenamiento sino en el empaquetado y la ejecución. El fichero PTQ1_0 es un reempaquetado sin pérdida del fichero original del minero en el formato de Prism ML: cada bloque de 128 pesos conserva sus códigos y su escala fp16, y cada peso decodifica al mismo valor. El autor afirma que el mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el fichero PTQ1_0 publicado por Prism. Además, el modelo incorpora una rotación Hadamard y una actualización de estado de atención lineal que el fork de Dendrite fusiona en Metal para acelerar la inferencia en Apple Silicon. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno, con plantilla Jinja habilitada mediante `--jinja`.
- Cuantización ternaria extrema: pesos a 1,75-2,125 bits, lo que permite ejecutar un modelo de 27B en menos de 8 GB de almacenamiento.
- Decodificación especulativa mediante el drafter opcional Ingot-27B-DFlash2 (Q8_0), que acelera la generación aproximadamente 1,8x en modo greedy y 1,3-1,4x con muestreo.
- Entrada de imágenes mediante el proyector multimodal de Ternary Bonsai 2 27B (mmproj Q8_0 o BF16), aunque la calidad visual no está validada para estos pesos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU consumer de gama alta: con 7,21 GB en PQ2_0, el modelo cabe en una RTX 5090 (PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en esa tarjeta) y en tarjetas con 8-12 GB de VRAM, lo que permite servir un modelo de 27B en hardware de escritorio.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra con el fork de Dendrite y el parche Metal, alcanza 56,4 tok/s de decodificación con PQ2_0, suficiente para asistentes conversacionales locales sin conexión.
- Servicio de chat de baja latencia en servidores: en una RTX PRO 6000 Blackwell de 96 GB, el fichero PTQ1_0 decodifica a 145 tok/s y procesa prompts a 3.865 tok/s, adecuado para endpoints conversacionales con concurrencia moderada.
- Investigación en cuantización y destilación: el modelo sirve como caso de estudio reproducible de un pipeline de cuantización ternaria evaluado por KL frente a un profesor, con métricas publicadas y ficheros de referencia.
- Evaluación de decodificación especulativa: el drafter DFlash 2 permite medir el impacto de la decodificación especulativa en un modelo ternario, con un coste de aproximadamente 6 GB adicionales de VRAM.
- Experimentación multimodal ligera: añadiendo el mmproj de Ternary Bonsai 2 se puede probar entrada de imágenes en un modelo de menos de 8 GB, aunque la calidad no está garantizada y el autor la declara no testeada.
- Reproducción de benchmarks de subredes Bittensor: el modelo y su métrica KL permiten replicar la evaluación de Ingot y comparar submissions.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de calidad publicada es la divergencia KL respecto al profesor:

| Metrica | Valor |
|---|---|
| KL (profesor ‖ este modelo), evaluacion ganadora | 0,07005 |
| KL (profesor ‖ rey anterior), misma evaluacion | 0,07156 |

Rendimiento de inferencia medido con `llama-bench` (tg128, pp512):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada: el fichero PTQ1_0 ocupa 5,95 GB y el PQ2_0 7,21 GB; con overhead de contexto y KV cache conviene disponer de 10-12 GB para uso cómodo.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s; RTX 5090 reportada por PrismML a 142 tok/s con Bonsai 2 PQ2_0.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM (RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090), aunque el autor solo ha medido la RTX PRO 6000 y la RTX 5090 de forma indirecta.
- Apple Silicon: Mac Studio M3 Ultra con 512 GB, 44,5-56,4 tok/s según fork y fichero.
- Opciones de despliegue: exclusivamente el fork DendriteLabs de llama.cpp de PrismML en el commit `62c418c`; llama.cpp estándar no ejecuta el modelo. No se mencionan vLLM, TGI ni Ollama.
- Decodificación especulativa: drafter Ingot-27B-DFlash2-Q8_0 con `--spec-type draft-dflash --spec-draft-n-max 5`, a cambio de aproximadamente 6 GB adicionales de VRAM.
- Multimodal: proyector mmproj de Ternary Bonsai 2 27B (Q8_0 o BF16) para entrada de imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ingot-XLII-27B-Q2 | 26,9B | no disponible | no disponible | GGUF ternario (1,75-2,125 bpw) | Requiere fork Dendrite de llama.cpp; KL 0,07005 |
| Ternary-Bonsai-2-27B (Prism ML) | 27B | no disponible | no disponible | GGUF ternario | Modelo base; 142 tok/s en RTX 5090 |
| Ingot-genesis-27B-Q2 | 27B | no disponible | no disponible | GGUF ternario | Mismo layout y tokenizer; referencia de formato |
| Qwen3.8-27B (profesor) | 27B | no disponible | no disponible | no disponible | Profesor de referencia en la evaluación KL |

No se dispone de datos de benchmarks comparativos estándar ni de especificaciones de contexto y licencia para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de desplegarlo en producción.
- Idiomas no declarados: no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no documentada: no se puede planificar el uso con prompts largos sin verificación empírica.
- Dependencia de un fork no estándar: solo funciona con el fork DendriteLabs de llama.cpp en el commit `62c418c`; esto limita la integración con ecosistemas estándar (vLLM, TGI, Ollama) y complica el mantenimiento.
- Riesgo de alucinación: propio de modelos destilados de 27B con cuantización ternaria; la KL de 0,07 respecto al profesor indica una divergencia no despreciable en la distribución de salida.
- Calidad multimodal no validada: el proyector mmproj fue creado para genesis, no para estos pesos, y el autor declara que la calidad de imagen no está testeada.
- Rendimiento medido de forma limitada: solo hay cifras para RTX PRO 6000 Blackwell y Mac Studio M3 Ultra; el resto de GPUs son extrapolaciones de PrismML.
- Procedencia: es una submission de una subred de Bittensor; el autor atribuye la autoría al minero `5Ev92m6cmahKW3ypdvjW6vBDnLTi51YU3n6DoS1b4RRfTmTG` (uid 249) y no se detalla el proceso de entrenamiento ni los datos utilizados.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XLII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de referencia de formato: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit del fork usado en la evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf

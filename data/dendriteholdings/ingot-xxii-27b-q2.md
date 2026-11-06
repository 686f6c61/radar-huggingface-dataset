# dendriteholdings/Ingot-XXII-27B-Q2

## Resumen

Ingot-XXII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se aproxima a él. El modelo parte de Ternary Bonsai 2 27B de Prism ML y conserva sus códigos ternarios, mientras que el resto de pesos ha sido reajustado por el minero para acercarse al profesor Qwen3.8-27B.

La relevancia del modelo es doble. Por un lado, documenta un pipeline de cuantización extrema competitiva: pesos ternarios en un contenedor de 2 bits (2,125 bits por peso) o reempaquetados sin pérdida a 1,75 bits por peso, con ficheros de 7,21 GB y 5,95 GB respectivamente. Por otro, demuestra que un modelo de 27B puede ejecutarse en una sola GPU de consumo o en un Mac Studio con velocidades de decodificación de decenas de tokens por segundo, algo impensable en precisión completa.

El modelo se distribuye únicamente en formato GGUF para llama.cpp y requiere el fork de Dendrite de llama.cpp de Prism ML en un commit concreto; la versión estándar de llama.cpp no lo ejecuta. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K); las métricas publicadas miden la fidelidad al profesor, no capacidades de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención lineal (familia Ternary Bonsai 2 de Prism ML); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); ficheros `Ingot-XXII-27B-PTQ1_0.gguf` (5,95 GB) e `Ingot-XXII-27B-PQ2_0.gguf` (7,21 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del GGUF ternario Ternary Bonsai 2 27B de Prism ML. La arquitectura subyacente es un transformer con pesos ternarios y atención lineal, con una rotación de Hadamard aplicada en el pipeline de cuantización (el layout, tokenizer y rotación de Hadamard son los de `dendriteholdings/Ingot-genesis-27B-Q2`). Los códigos ternarios se mantienen intactos; el minero reajustó el resto de pesos para minimizar la divergencia respecto al profesor Qwen3.8-27B.

El entrenamiento no es un preentrenamiento ni un RLHF clásico, sino un proceso de destilación por cuantización competitiva: los mineros de la subnet Ingot compiten por producir la cuantización que, evaluada con las mismas respuestas, minimiza la KL entre las distribuciones del profesor y las del modelo, además de la distancia de estados ocultos promediada cada 8 capas. La submission ganadora (hotkey `5GQj7c9mqF5EDjSEuNDymHdmnDpZJ2wAo5uNFVLJuCQigdxb`, uid 249) obtuvo KL 0,08625 y distancia de estados ocultos 0,3132, frente a 0,08795 y 0,3147 del rey al que destronó. El reempaquetado a PTQ1_0 es sin pérdida: cada bloque de 128 pesos conserva sus códigos y su escala fp16, y cada peso decodifica al mismo valor.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` está presente en el repo.
- Razonamiento y conocimiento general heredados del profesor Qwen3.8-27B, sujetos a la degradación propia de una cuantización ternaria.
- Capacidad multimodal opcional: el fichero es el modelo de texto, pero puede añadirse la torre de visión de Ternary Bonsai 2 como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`). La calidad de imagen no está probada y el proyector se creó para genesis, no para estos pesos.
- Decodificación especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación aproximadamente 1,8x en greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.
- Tool calling / function calling: no disponible en la información proporcionada; el servidor se lanza con `--jinja`, lo que habilita plantillas de chat con soporte de herramientas si el tokenizer las incluye, pero no se confirma.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: con 5,95-7,21 GB de pesos, el modelo cabe en GPUs de 8-12 GB y permite ejecutar un modelo de 27B en una RTX 5090 o similar; PrismML reporta 142 tok/s para el PQ2_0 de Bonsai 2 en una RTX 5090.
- Servicio de chat en una sola GPU de servidor: en una RTX PRO 6000 Blackwell (96 GB) el PQ2_0 decodifica a 137 tok/s y el PTQ1_0 a 145 tok/s, con 3.865 tok/s de prompt, suficiente para atender varias conversaciones concurrentes con un único acelerador.
- Inferencia local en estaciones Mac: en un Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) el fork de Dendrite alcanza 56,4 tok/s de decodificación con PQ2_0 y 52,8 tok/s con PTQ1_0, lo que permite prototipado y uso interactivo sin GPU dedicada.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la relación entre bits por peso (1,75 frente a 2,125), velocidad de decodificación y fidelidad al profesor medida con KL y distancia de estados ocultos.
- Evaluación de subnets de Bittensor: útil para reproducir el protocolo de Ingot, comparar submissions y auditar cómo se puntúa la cercanía a un profesor fijo.
- Generación de texto a gran escala con coste mínimo de memoria: al ocupar menos de 8 GB, permite empaquetar varias instancias en una misma GPU o servir en entornos con VRAM limitada, aceptando la pérdida de calidad de la cuantización ternaria.
- Aceleración con decodificación especulativa: integrable con el drafter DFlash 2 en pipelines de chat greedy donde la latencia por token sea crítica, con un sobrecoste de VRAM de unos 6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas miden fidelidad al profesor y velocidad de inferencia.

| Metrica | Este modelo | Rey al que superó |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,08625 | 0,08795 |
| Distancia de estados ocultos (media cada 8 capas) | 0,3132 | 0,3147 |

| Hardware | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB, llama-bench tg128/pp512 | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB, llama-bench tg128/pp512 | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

Dato externo citado en la model card: PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; no se han medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7,5 GB solo para los pesos (5,95 GB en PTQ1_0, 7,21 GB en PQ2_0), más overhead de contexto y caché KV; con el drafter DFlash 2 hay que sumar unos 6 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s; RTX 5090 reportada por PrismML a 142 tok/s con PQ2_0; A100 y H100 no han sido medidas en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de pesos; una RTX 4090 (24 GB), RTX 4080 o RTX 3090 deberían alojarlo con holgura, aunque no se han publicado cifras de rendimiento para esas tarjetas.
- Opciones de despliegue: llama.cpp exclusivamente, mediante el fork de Dendrite de llama.cpp de Prism ML en el commit `c96baf4abe24d11a50f326e40b6223b687449d63`. La versión estándar de llama.cpp no lo ejecuta. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 137-145 tok/s de decodificación y 3.865 tok/s de prompt en RTX PRO 6000 Blackwell; 44,5-56,4 tok/s de decodificación y 368-432 tok/s de prompt en Mac Studio M3 Ultra. Con DFlash 2 se estima 1,8x en greedy y 1,3-1,4x con sampling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXII-27B-Q2 | 26,9B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | GGUF, fork de llama.cpp de Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | 27B (denominacion) | no disponible | Ternaria PQ2_0 / PTQ1_0 | no disponible | GGUF, fork de llama.cpp de PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B (denominacion) | no disponible | Ternaria Q2 | no disponible | GGUF, fork de llama.cpp de Dendrite |
| dendriteholdings/Ingot-27B-DFlash2 | no disponible (drafter) | no disponible | Q8_0 | no disponible | GGUF, mismo fork; se usa junto al modelo principal |

No se dispone de datos de benchmarks de tarea para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial; hay que contactar con el autor o consultar el repositorio del modelo base antes de desplegarlo en producción.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe ni de calidad fuera del inglés.
- Longitud de contexto no disponible: no se puede planificar el dimensionamiento de la caché KV ni el uso en tareas de contexto largo.
- Cuantización ternaria agresiva: la fidelidad al profesor es buena en términos relativos (KL 0,08625), pero la pérdida absoluta frente al modelo en BF16 no se publica; es previsible una degradación en razonamiento complejo, matemáticas y código.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no cuantificado en la información disponible; la cuantización extrema puede agravarlo.
- Dependencia de un fork concreto: requiere el fork de Dendrite de llama.cpp en el commit `c96baf4`; no funciona con llama.cpp estándar, lo que complica el mantenimiento y la integración con herramientas que empaquetan llama.cpp upstream.
- Visión no validada: el proyector multimodal procede de genesis y no ha sido evaluado con estos pesos; Ingot puntúa solo el modelo de texto.
- Procedencia competitiva: es una submission de un minero de Bittensor, sin model card exhaustiva ni evaluación independiente; los únicos datos de calidad son los del propio certamen.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Modelo de referencia de layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit exacto del fork: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63

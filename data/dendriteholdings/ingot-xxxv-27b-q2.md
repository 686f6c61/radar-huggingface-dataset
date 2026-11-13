# dendriteholdings/Ingot-XXXV-27B-Q2

## Resumen

Ingot-XXXV-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 27B) distribuido en formato GGUF y derivado de prism-ml/Ternary-Bonsai-2-27B-gguf mediante un proceso de cuantización y refinamiento competitivo. Lo publica dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece más próxima a él. El modelo conserva los códigos ternarios de Bonsai 2 y reajusta el resto de pesos para acercarse al profesor Qwen3.8-27B.

La relevancia del modelo es doble. Por un lado, demuestra un caso real de cuantización extrema competitiva: los pesos ternarios se empaquetan a 1,75 bits por peso (5,95 GB) o en un contenedor de 2 bits (7,21 GB), lo que permite ejecutar un modelo de 27B en hardware de consumo. Por otro, expone un ecosistema de inferencia específico: no funciona con llama.cpp estándar, sino con el fork de DendriteLabs de llama.cpp de PrismML en un commit concreto, e incorpora un drafter de decodificación especulativa (DFlash 2) que acelera la generación.

La ficha describe únicamente lo que consta en la model card y en los metadatos de Hugging Face. No hay información publicada sobre licencia, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); el único dato de calidad es una métrica de divergencia KL frente al profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención lineal (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 a 1,75 bits por peso; PQ2_0 a 2,125 bits por peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXV-27B-PTQ1_0.gguf`, `Ingot-XXXV-27B-PQ2_0.gguf`) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (finetune) |
| Profesor de referencia | Qwen3.8-27B |
| Tamano del repo | 13,2 GB |
| Libreria de inferencia | llama.cpp (fork de DendriteLabs de PrismML, commit `62c418c`) |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, un transformer con pesos ternarios y atención lineal, y aplica un refinamiento sobre él: mantiene los códigos ternarios originales y reajusta el resto de los pesos para reducir la divergencia respecto al profesor Qwen3.8-27B. El proceso se enmarca en el subnet Ingot de Bittensor, donde los mineros compiten por producir la cuantización más fiel al profesor y el validador corona la mejor copia. La submission ganadora corresponde al hotkey `5GQTgx8NZvRPVxauQk2FpcHW2ZbcNmkwRwtzztgXyqAv937u` (uid 127) y al identificador `2e0d852a-5886-44c8-8724-df4994304c7d`.

Los pesos publicados son la subida del minero byte a byte (`Ingot-XXXV-27B-PQ2_0.gguf`). El archivo `Ingot-XXXV-27B-PTQ1_0.gguf` es un reempaquetado sin pérdida al formato PTQ1_0 de Prism: cada bloque de 128 pesos conserva sus códigos y su escala fp16, de modo que cada peso decodifica al mismo valor. El mismo reempaquetado aplicado al archivo PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism, lo que sirve como verificación del procedimiento. No consta información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

Como innovaciones técnicas destacables, el modelo incorpora una rotación de Hadamard en el layout GGUF y un drafter de decodificación especulativa DFlash 2 entrenado específicamente para esta familia (dendriteholdings/Ingot-27B-DFlash2), que propone varios tokens por paso y el modelo verifica cada uno.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con `--jinja` en llama-server.
- Razonamiento y generación de código: capacidades heredadas del profesor Qwen3.8-27B, sin evaluación publicada específica.
- Decodificación especulativa mediante el drafter DFlash 2, con aceleración de aproximadamente 1,8x en chat greedy de un solo flujo y de 1,3-1,4x con sampling.
- Entrada de imágenes opcional: requiere añadir el vision tower de Ternary-Bonsai-2-27B como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `Ternary-Bonsai-2-27B-mmproj-BF16.gguf`). La calidad de imagen no está probada según el autor.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face), lo que sugiere integración con servidores compatibles con la API de OpenAI.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de un modelo de 27B en GPU de consumo: gracias a sus 5,95 GB (1,75 bpw) o 7,21 GB (2 bits), el modelo cabe en tarjetas con 8-12 GB de VRAM, lo que permite ejecutar localmente un modelo de escala 27B en equipos de gama alta domésticos.
- Servicio de chat interactivo de baja latencia: con 137-145 tok/s de decodificación en una RTX PRO 6000 Blackwell y 44,5-56,4 tok/s en un Mac Studio M3 Ultra, es adecuado para asistentes conversacionales en tiempo real con un solo flujo.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar el impacto de la cuantización ternaria y comparar la fidelidad al profesor mediante la métrica KL publicada (0,08062 frente a 0,08251 del rey anterior).
- Evaluación de pipelines de decodificación especulativa: la combinación con el drafter DFlash 2 permite medir el rendimiento de la verificación especulativa en producción, con un coste adicional de aproximadamente 6 GB de VRAM.
- Experimentación en el ecosistema Bittensor: útil para mineros y validadores que quieran reproducir el proceso de cuantización y validación del subnet Ingot, o para auditar la submission ganadora.
- Inferencia en estaciones de trabajo Apple Silicon: el fork de Dendrite con parche Metal (fusión de la rotación de Hadamard y la actualización de estado de atención lineal) ofrece 52,8-56,4 tok/s de decodificación en un Mac Studio M3 Ultra, lo que habilita prototipado local sin GPU dedicada.
- Pruebas de entrada multimodal: añadiendo el proyector de visión de Bonsai 2 se puede experimentar con entrada de imágenes, aunque la calidad no está validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de calidad publicado es la divergencia KL por token de respuesta frente al profesor BF16 en la evaluación del subnet:

| Metrica | Valor |
|---|---|
| KL (teacher ‖ model), este modelo en su eval ganadora | 0,08062 |
| KL (teacher ‖ model), rey anterior en la misma eval | 0,08251 |

Rendimiento de inferencia publicado (llama-bench, `tg128` y `pp512`, `-ngl 99 -fa 1`):

| Hardware | Archivo | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra (Metal, fork stock) | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra (Metal, fork stock) | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra (Metal, parche Dendrite) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra (Metal, parche Dendrite) | PTQ1_0 | 52,8 | 368 |
| RTX 5090 (dato de PrismML para Bonsai 2 PQ2_0) | PQ2_0 | 142 | no disponible |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 6 GB para el archivo PTQ1_0 (1,75 bpw) y 7,2 GB para el PQ2_0 (2 bits), más overhead de contexto y del runtime de llama.cpp.
- VRAM adicional para el drafter DFlash 2: aproximadamente 6 GB más si se usa decodificación especulativa.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) con 137-145 tok/s; RTX 5090 con 142 tok/s según PrismML para el modelo base; cualquier GPU con al menos 8-12 GB de VRAM debería poder cargar los pesos, aunque no hay mediciones publicadas para tarjetas menores.
- Cabe en GPU de consumo: sí, por tamaño de pesos (6-7,2 GB), aunque el autor solo publica mediciones en RTX PRO 6000 Blackwell, RTX 5090 (dato de PrismML) y Mac Studio M3 Ultra.
- Despliegue: exclusivamente con el fork de DendriteLabs de llama.cpp de PrismML en el commit `62c418ccd7aefee37997e94c2d9fac1eed7fc89b`. Stock llama.cpp no ejecuta el modelo. Comando de referencia: `llama-server -m Ingot-XXXV-27B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: 137-145 tok/s de decodificación y 3.865 tok/s de prompt en RTX PRO 6000 Blackwell; 44,5-56,4 tok/s de decodificación y 368-432 tok/s de prompt en Mac Studio M3 Ultra. Con el drafter DFlash 2, aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXV-27B-Q2 | 26,9B | no disponible | Ternaria (1,75 y 2,125 bpw) | no disponible | GGUF en HF, requiere fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B | 27B (aproximado) | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF en HF, fork de PrismML |
| Qwen3.8-27B (profesor) | 27B (aproximado) | no disponible | BF16 y otras no especificadas | no disponible | no disponible en la informacion |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B (aproximado) | no disponible | Ternaria (Q2) | no disponible | GGUF en HF, mismo fork |

La comparación se limita a los datos publicados: no hay cifras de benchmarks estándar para ninguno de los modelos en la información disponible, por lo que la única métrica objetiva de calidad es la KL frente al profesor (0,08062 para este modelo frente a 0,08251 del rey anterior).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo directo para producción.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés o de los idiomas del profesor.
- Longitud de contexto no documentada: impide planificar despliegues con prompts largos o conversaciones multi-turno extensas.
- Requiere un fork específico de llama.cpp en un commit concreto; no funciona con llama.cpp estándar, lo que complica el mantenimiento y la portabilidad.
- La calidad de la entrada de imágenes no está probada: el proyector de visión fue entrenado para genesis, no para estos pesos, y el subnet solo evalúa el modelo de texto.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización ternaria extrema puede degradar la fidelidad factual respecto al profesor BF16.
- Sesgos conocidos: no documentados en la información disponible.
- Procedencia competitiva: el modelo es una submission de un minero en un subnet, sin el proceso de publicación y revisión habitual de un modelo de referencia; conviene auditar los pesos antes de usarlos en producción.
- El rendimiento medido se limita a RTX PRO 6000 Blackwell, RTX 5090 (dato de PrismML) y Mac Studio M3 Ultra; no hay datos para GPUs de consumo intermedias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXV-27B-Q2
- Modelo base (Ternary Bonsai 2 27B): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificacion especulativa DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia del fork: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b

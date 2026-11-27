# dendriteholdings/Ingot-VIII-9B-Q2

## Resumen

Ingot-VIII-9B-Q2 es un modelo de generación de texto de 8.953.803.264 parámetros (aproximadamente 9B) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-9B-gguf, del que conserva los códigos ternarios, y reajusta el resto de pesos para acercarse a Qwen3.5-9B.

La relevancia del modelo es doble: por un lado, demuestra un pipeline de cuantización competitiva (ternaria, en torno a 1,75-2,125 bits por peso) sobre un modelo de 9B; por otro, documenta de forma explícita la trazabilidad del proceso (hotkey del minero, submission coronada y métrica KL frente al profesor). No es un modelo entrenado desde cero, sino un refinamiento de pesos sobre una base ya cuantizada.

El resultado es un GGUF que requiere un fork específico de llama.cpp (el de DendriteLabs sobre el de PrismML) y que no funciona con llama.cpp estándar. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Ternary Bonsai 2 9B; detalles no disponibles) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso (2,00 GB) y PQ2_0 a 2,125 bits por peso (2,42 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); también disponible un pack MLX de 2 bits en dendriteholdings/Ingot-VIII-9B-MLX-2bit |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 9B de Prism ML, un transformer de aproximadamente 9B de parámetros con pesos ternarios. Ingot-VIII-9B-Q2 conserva los códigos ternarios originales y reajusta el resto de los pesos mediante un proceso de ajuste fino realizado por el minero, con el objetivo de acercar las distribuciones de salida a las de Qwen3.5-9B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación técnica principal es el esquema de cuantización ternaria con rotación de Hadamard: cada bloque de 128 pesos mantiene sus códigos y su escala en fp16, de modo que el repack PTQ1_0 es una representación sin pérdida del archivo PQ2_0 del minero. El autor indica que el mismo repack aplicado al archivo PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism, lo que valida el procedimiento. La métrica de calidad es KL(profesor ‖ modelo) por token de respuesta frente al profesor en BF16: 0,06830 para este modelo en su evaluación ganadora, frente a 0,07141 del modelo coronado al que superó.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generación de código: capacidades heredadas de la base, sin benchmarks publicados que las cuantifiquen.
- Entrada de imágenes opcional: requiere añadir el vision tower de prism-ml/Ternary-Bonsai-2-9B-gguf como proyector (mmproj en Q8_0 o BF16); la calidad de imagen no está probada y Ingot solo evalúa el modelo de texto.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de plantillas de chat vía `--jinja` en llama-server.
- Tool calling y comportamiento agéntico: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de pipelines de cuantización: sirve como referencia práctica para comparar el impacto de esquemas ternarios (1,75 frente a 2,125 bpw) sobre la fidelidad al profesor mediante KL, replicando la metodología de Ingot.
- Despliegue en hardware muy limitado: con 2,00-2,42 GB de pesos, el modelo cabe en GPUs de gama baja y en sistemas con poca VRAM, lo que permite prototipar asistentes conversacionales en entornos restringidos.
- Investigación sobre Bittensor e incentivos: el modelo documenta el flujo completo de un subnet (minero, submission, validación) y puede usarse para estudiar cómo se seleccionan modelos en mecanismos de consenso.
- Aplicaciones conversacionales de texto: al ser un modelo de 9B cuantizado a 2 bits, es adecuado para chatbots de bajo coste donde la latencia y el espacio son críticos, siempre que se acepte la pérdida de fidelidad frente al profesor.
- Reproducción de resultados: los archivos y el commit exacto del fork de llama.cpp (`9991ae5`) permiten reproducir la evaluación que coronó al modelo, útil para auditorías de cuantización.
- Experimentos multimodales exploratorios: añadiendo el mmproj de Bonsai 2 se puede probar entrada de imágenes en un modelo de 9B a 2 bits, aunque sin garantías de calidad.
- Inferencia en Apple Silicon: el pack MLX de 2 bits permite ejecutar el modelo en Macs con memoria unificada, útil para desarrollo local sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es la divergencia KL frente al profesor en BF16 en la evaluación de Ingot:

| Metrica | Valor |
|---|---|
| KL(profesor ‖ este modelo) en su eval ganadora | 0,06830 |
| KL(profesor ‖ modelo coronado al que superó) | 0,07141 |

## Requisitos de hardware

- VRAM estimada: en torno a 2,0 GB para el archivo PTQ1_0 (1,75 bpw) y 2,4 GB para el PQ2_0 (2,125 bpw), más overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU compatible con CUDA y suficiente VRAM; el autor usa `-ngl 99` (todas las capas en GPU) y `-fa on` (flash attention).
- Cabe en GPU de consumo: sí, por tamaño de pesos; no se especifican modelos concretos en la información disponible.
- Despliegue: exclusivamente con el fork de DendriteLabs de llama.cpp en el commit `9991ae551cc08c354971ebbe739931c1f9dcfcc8`; llama.cpp estándar no lo ejecuta. Comando: `build/bin/llama-server -m Ingot-VIII-9B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Apple Silicon: pack MLX de 2 bits en dendriteholdings/Ingot-VIII-9B-MLX-2bit.
- Latencia y throughput: no disponibles; el autor señala que el archivo de 2 bits decodifica más rápido en GPU que el de 1,75 bpw.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-VIII-9B-Q2 | 8,95B | Ternaria 1,75-2,125 bpw | no disponible | no disponible | GGUF (fork de llama.cpp) + MLX |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ~9B | Ternaria (PTQ1_0/PQ2_0) | no disponible | no disponible | GGUF (llama.cpp de PrismML) |
| dendriteholdings/Ingot-genesis-9B-Q2 | ~9B | Ternaria 2 bits | no disponible | no disponible | GGUF (fork de llama.cpp) |
| Qwen3.5-9B (profesor de referencia) | ~9B | BF16 y otras | no disponible | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Requiere un fork no estándar de llama.cpp; no funciona con llama.cpp, Ollama, vLLM ni TGI convencionales según la información disponible.
- La cuantización ternaria a 1,75-2,125 bpw implica una pérdida de fidelidad medible frente al profesor (KL de 0,06830), superior a la de cuantizaciones de 4-8 bits.
- La calidad de la entrada de imágenes es desconocida: el proyector mmproj fue creado para genesis, no para estos pesos, y Ingot solo evalúa texto.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia de la base Ternary Bonsai 2 9B antes de producción.
- Idiomas soportados no disponibles; el comportamiento multilingüe es incierto.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un refinamiento de pesos sobre una base cuantizada, hereda los sesgos de Ternary Bonsai 2 y de Qwen3.5-9B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- La trazabilidad depende de un único commit del fork (`9991ae5`); cambios posteriores en el fork pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VIII-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Vision tower (mmproj Q8_0): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Vision tower (mmproj BF16): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Modelo predecesor: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-VIII-9B-MLX-2bit
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8

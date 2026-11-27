# dendriteholdings/Ingot-IX-9B-Q2

## Resumen

Ingot-IX-9B-Q2 es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) distribuido en formato GGUF y derivado de prism-ml/Ternary-Bonsai-2-9B-gguf, un modelo con pesos ternarios. Lo publica el usuario dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo conserva los códigos ternarios de Bonsai 2 y reajusta el resto de pesos para acercarse a Qwen3.5-9B.

El interés técnico del modelo reside en su estrategia de compresión extrema: se distribuye en dos ficheros, uno de 1,75 bits por peso (2,00 GB) y otro de 2,125 bits por peso (2,42 GB), ambos con los mismos pesos ternarios. Según la model card, el fichero PTQ1_0 es un reempaquetado sin pérdida del fichero del minero en el formato de Prism, de modo que cada bloque de 128 pesos conserva sus códigos y su escala fp16 y cada peso decodifica al mismo valor.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de 9B en hardware muy modesto con una degradación de calidad medida y acotada: la divergencia KL frente al profesor BF16 es de 0,06486 en la evaluación ganadora, frente a 0,06788 del modelo que venció. No obstante, requiere un fork específico de llama.cpp (DendriteLabs) y no funciona con llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (derivada de Ternary-Bonsai-2-9B); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso; PQ2_0 a 2,125 bits por peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (Ingot-IX-9B-PTQ1_0.gguf, Ingot-IX-9B-PQ2_0.gguf); pack MLX de 2 bits en repo separado |

## Arquitectura y entrenamiento

El modelo parte de prism-ml/Ternary-Bonsai-2-9B-gguf, un modelo con pesos ternarios. La model card indica que Ingot-IX-9B-Q2 conserva los códigos ternarios de Bonsai 2 y que el minero reajustó el resto de sus pesos para acercarlo a Qwen3.5-9B. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El proceso de producción es característico: en la subred Ingot de Bittensor, los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia más próxima al profesor. La submission ganadora (identificador 47dae4cf-893d-4ddb-829e-10b60d3f8c27, hotkey del minero 5GGqRio7owCtnzEeuS7v7FYi1k1BXUaS2pRfDrjm3DzLLPgx, uid 238) se corona por su menor divergencia KL. Los pesos publicados son la subida del minero byte a byte; el fichero PTQ1_0 es un reempaquetado sin pérdida en el formato de Prism, y según la model card el mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el fichero PTQ1_0 publicado por Prism. El modelo emplea una rotación de Hadamard y un tokenizador con el layout de dendriteholdings/Ingot-genesis-9B-Q2.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generación de código: capacidades heredadas del modelo base, sin datos específicos publicados.
- Soporte de imágenes mediante el tower de visión de prism-ml/Ternary-Bonsai-2-9B-gguf añadido como proyector (Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf o BF16); la calidad de imagen no está probada y el proyector se creó para genesis, no para estos pesos.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Tool calling, function calling, modo thinking, audio y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware de gama baja: con 2,00 GB en PTQ1_0 o 2,42 GB en PQ2_0, el modelo cabe en GPUs de consumo con poca VRAM y en CPU, lo que permite servir un modelo de 9B en entornos donde un BF16 equivalente no cabría.
- Prototipado e investigación sobre cuantización ternaria: sirve para estudiar el equilibrio entre tasa de bits y fidelidad al profesor, con una métrica KL publicada y reproducible.
- Evaluación de pipelines de Bittensor/Ingot: útil para replicar la evaluación del validador y comparar submissions con el fork de llama.cpp en el commit 9991ae5.
- Inferencia local en Apple Silicon: el pack MLX de 2 bits (dendriteholdings/Ingot-IX-9B-MLX-2bit) permite ejecutarlo de forma nativa en Mac.
- Generación de texto conversacional en servidor con llama-server: el comando documentado (-ngl 99 -fa on --jinja) habilita una API compatible con plantillas Jinja para chat.
- Experimentos multimodales exploratorios: añadiendo el mmproj de Bonsai 2 se puede probar entrada de imágenes, asumiendo que la calidad no está validada.

## Benchmarks y rendimiento

La model card solo publica la divergencia KL por token de respuesta frente al profesor BF16, ponderada por dominio:

| Metrica | Valor |
|---|---|
| KL del modelo (evaluación ganadora) | 0,06486 |
| KL del modelo que venció (mismo eval) | 0,06788 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,0 GB para PTQ1_0 y 2,4 GB para PQ2_0, más overhead del runtime y de la caché KV.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM; el comando documentado usa -ngl 99 (todas las capas en GPU) con compilación CUDA (GGML_CUDA=ON).
- Cabe en GPU de consumo: sí, por el tamaño de los ficheros (2,0-2,4 GB); también en CPU.
- Despliegue: llama.cpp fork de DendriteLabs en el commit 9991ae551cc08c354971ebbe739931c1f9dcfcc8 (llama-server); llama.cpp estándar no lo ejecuta. Para Apple Silicon, pack MLX de 2 bits.
- Latencia y throughput: no disponibles; la model card solo indica que el fichero de 2 bits decodifica más rápido en GPUs que el de 1,75 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-IX-9B-Q2 | 8,95B | No disponible | GGUF ternario, 1,75-2,125 bpw | No disponible | Requiere fork de llama.cpp; KL 0,06486 |
| prism-ml/Ternary-Bonsai-2-9B-gguf | No disponible | No disponible | GGUF ternario | No disponible | Modelo base; pesos ternarios originales |
| dendriteholdings/Ingot-genesis-9B-Q2 | No disponible | No disponible | GGUF ternario | No disponible | Comparte layout, tokenizador y rotación de Hadamard |
| Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | Profesor de referencia del ajuste, según la model card |

No se dispone de datos de rendimiento comparativo más allá de la KL frente al profesor.

## Limitaciones y advertencias

- No funciona con llama.cpp estándar: requiere el fork de DendriteLabs en un commit concreto, lo que limita la portabilidad y el soporte a largo plazo.
- La licencia no está disponible; no se puede confirmar el uso comercial y conviene verificar la licencia del modelo base antes de producción.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Calidad de imagen no probada: el proyector de visión se creó para genesis y no para estos pesos; Ingot solo evalúa el modelo de texto.
- La fidelidad se mide solo como KL frente al profesor; no hay benchmarks de tareas que permitan estimar el rendimiento real en MMLU, código o matemáticas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; es un espejo de una submission de competición, no un modelo con soporte de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IX-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Modelo relacionado (genesis): https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-IX-9B-MLX-2bit
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8

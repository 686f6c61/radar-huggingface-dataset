# dendriteholdings/Ingot-XI-9B-Q2

## Resumen

Ingot-XI-9B-Q2 es un modelo de lenguaje de 8.953.803.264 parámetros distribuido en formato GGUF y orientado a generación de texto conversacional. No es un modelo entrenado desde cero, sino un ajuste fino (finetune) del modelo ternario Prism ML Ternary Bonsai 2 9B, en el que un minero de la subred Bittensor denominada Ingot ha reajustado los pesos no ternarios para acercar las distribuciones de salida a las del profesor Qwen3.5-9B. El resultado conserva los códigos ternarios originales y modifica el resto de los pesos.

El modelo es relevante por su estrategia de compresión extrema: se distribuye en dos empaquetados que almacenan los mismos pesos ternarios, uno a 1,75 bits por peso (2,00 GB) y otro en un contenedor de 2 bits (2,42 GB). Esto permite ejecutar un modelo de casi 9.000 millones de parámetros en hardware muy modesto, a costa de requerir un fork específico de llama.cpp y de una fidelidad limitada frente al profesor.

La ficha se basa únicamente en la model card y en los metadatos públicos del repositorio. No hay información publicada sobre el proceso de entrenamiento, la composición del dataset, los idiomas soportados ni la licencia, y el modelo acumula cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Prism ML Ternary Bonsai 2 9B); pesos ternarios con escalas fp16 por bloque de 128 pesos |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 a 1,75 bits por peso (2,00 GB) y PQ2_0 a 2,125 bits por peso en contenedor de 2 bits (2,42 GB); ambos con los mismos pesos ternarios |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); también existe un pack MLX de 2 bits en un repositorio separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Prism ML Ternary Bonsai 2 9B, un transformer de aproximadamente 9.000 millones de parámetros cuyos pesos se codifican en formato ternario: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, de modo que cada peso se decodifica a un valor discreto. El ajuste fino de Ingot no altera esos códigos ternarios, sino el resto de los pesos, que el minero reentrenó para acercar el modelo a Qwen3.5-9B.

El entrenamiento se enmarca en la subred Ingot de Bittensor, donde los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que se mantiene más próxima a él. La métrica empleada es la divergencia KL entre las distribuciones del siguiente token del modelo y las del profesor en BF16, promediada por token de respuesta y ponderada por dominio. El modelo presentado obtuvo una KL de 0,05933 frente a 0,06191 del modelo que ostentaba el trono en la misma evaluación. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Una particularidad técnica destacable es el uso de una rotación de Hadamard en el layout del GGUF, heredada de Ingot-genesis-9B-Q2, que hace que el modelo no funcione con llama.cpp estándar. Es necesario compilar el fork de DendriteLabs de llama.cpp en el commit `9991ae5`, que es el que se usó en la evaluación de Ingot.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja habilitada mediante `--jinja`.
- Razonamiento y respuesta multi-turno, según la etiqueta `conversational` del repositorio.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 9B (`Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` o `Ternary-Bonsai-2-9B-mmproj-BF16.gguf`); la calidad de imagen no está probada para estos pesos.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades específicas de tool calling, function calling, agentes, matemáticas o código; no disponible.

## Casos de uso

- Despliegue en hardware de gama baja: con 2,00 GB de pesos en PTQ1_0, el modelo puede ejecutarse en GPUs consumer con 4-6 GB de VRAM o incluso en CPU, lo que permite prototipar asistentes conversacionales sin infraestructura dedicada.
- Experimentación con cuantización ternaria: sirve como referencia práctica para estudiar cómo se comporta un modelo de 9B a 1,75 bits por peso y qué degradación introduce frente al profesor, usando la métrica KL publicada como punto de partida.
- Investigación en Bittensor e Ingot: el modelo es un artefacto verificable de la subred, útil para reproducir evaluaciones de fidelidad frente al profesor y comparar envíos de mineros.
- Asistentes conversacionales ligeros en el borde: al caber en 2 GB, puede integrarse en dispositivos con recursos limitados para tareas de chat de baja latencia, siempre que se acepte la pérdida de calidad asociada a la cuantización extrema.
- Evaluación de pipelines de inferencia con forks de llama.cpp: permite probar el soporte de PTQ1_0 y la rotación de Hadamard en el fork de DendriteLabs antes de adoptarlo en producción.
- Pruebas de concepto multimodales: combinado con el proyector de Bonsai 2, permite experimentar con entrada de imagen en un modelo de 9B comprimido, aunque sin garantías de calidad.
- Reproducción de benchmarks de fidelidad: la KL publicada (0,05933) permite validar la instalación y el commit del fork comparando la salida del modelo con la del profesor.

## Benchmarks y rendimiento

La model card solo publica la divergencia KL frente al profesor, no resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Ingot-XI-9B-Q2 | Modelo que ostentaba el trono (misma evaluación) |
|---|---|---|
| KL(profesor ‖ modelo), por token de respuesta, ponderada por dominio | 0,05933 | 0,06191 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,4 GB para el archivo PQ2_0 y 2,0 GB para PTQ1_0, más el espacio de contexto y la caché KV, que no se detalla.
- GPU recomendadas: no disponible; el modelo cabe en cualquier GPU consumer con al menos 4 GB de VRAM, como una GTX 1650, RTX 3050 o superiores. Para el proyector multimodal hay que sumar su tamaño (Q8_0 o BF16).
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: llama.cpp en el fork de DendriteLabs (commit `9991ae5`) con `-ngl 99 -fa on --jinja`; el llama.cpp estándar no ejecuta el modelo. Para Apple Silicon existe un pack MLX de 2 bits en `dendriteholdings/Ingot-XI-9B-MLX-2bit`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La model card indica que el archivo de 2 bits decodifica más rápido en GPU que el de 1,75 bits, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XI-9B-Q2 | 8.953.803.264 | no disponible | GGUF, 1,75 y 2,125 bpw | no disponible | Hugging Face, requiere fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ~9B (no confirmado en la información) | no disponible | GGUF ternario (PQ2_0 y PTQ1_0) | no disponible | Hugging Face, modelo base |
| dendriteholdings/Ingot-genesis-9B-Q2 | no disponible | no disponible | GGUF, mismo layout y rotación de Hadamard | no disponible | Hugging Face, predecesor del mismo autor |
| Qwen3.5-9B (profesor de referencia) | ~9B (no confirmado) | no disponible | no disponible | no disponible | no disponible en la información |

La comparación se limita a los artefactos citados en la model card; no se dispone de datos de rendimiento de los alternativos para contrastar más allá de la KL.

## Limitaciones y advertencias

- Fidelidad limitada al profesor: la KL de 0,05933 implica una divergencia medible frente a Qwen3.5-9B; no es una réplica exacta del modelo de referencia.
- Cuantización extrema: 1,75-2,125 bits por peso conlleva una pérdida de calidad frente a pesos en BF16 que no se cuantifica en la información disponible.
- Dependencia de un fork: no funciona con llama.cpp estándar; requiere el fork de DendriteLabs en el commit `9991ae5`, lo que complica el mantenimiento y la portabilidad.
- Multimodalidad no validada: el proyector de imagen fue creado para Ingot-genesis y la calidad de imagen no se ha probado con estos pesos.
- Idiomas: no disponibles; no se puede garantizar un comportamiento adecuado fuera del idioma o idiomas de entrenamiento, que no se documentan.
- Licencia: no disponible; no se puede confirmar el uso comercial ni las obligaciones de atribución.
- Sesgos y alucinaciones: no hay documentación sobre sesgos conocidos; como modelo conversacional de 9B comprimido, el riesgo de alucinación es relevante y no se ha evaluado.
- Madurez: cero descargas y cero valoraciones en el repositorio, creado y actualizado el 28 de noviembre de 2026; no hay evidencia de uso en producción.
- Procedencia: los pesos son la subida del minero `5FNQnxsBBS9P4WZjgDgWWvbsaUJQkM5vSf7kunFUWueEejaz` (uid 240), coronada a partir del envío `39c887f0-9c48-433a-a4e8-eae85bc6e950`; la evaluación se realizó solo sobre el modelo de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XI-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-XI-9B-MLX-2bit
- Predecesor con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8

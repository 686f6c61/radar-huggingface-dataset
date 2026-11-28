# dendriteholdings/Ingot-X-9B-Q2

## Resumen

Ingot-X-9B-Q2 es una cuantización ternaria de 9B parámetros derivada de Prism ML Ternary Bonsai 2 9B, publicada como espejo por dendriteholdings. El modelo procede de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se aproxima a él. En este caso, el minero `5EhwK5EoL7ebSPkhAQHvLQQPteSdmAMWxqEFqtst59E19Jzz` (uid 114) reajustó los pesos no ternarios para acercar la distribución de salida a Qwen3.5-9B, manteniendo los códigos ternarios originales de Bonsai 2.

El resultado es un GGUF de 9B parámetros con pesos ternarios empaquetados a 1,75 y 2,125 bits por peso, lo que reduce el peso del modelo a 2,00 GB y 2,42 GB respectivamente. La relevancia radica en que demuestra que es posible mantener una fidelidad alta respecto a un profesor BF16 (KL de 0,06047 frente a 0,06321 del modelo que venció) con un modelo de menos de 2,5 GB, lo que lo hace apto para despliegues en hardware muy limitado.

No obstante, el modelo requiere un fork específico de llama.cpp mantenido por DendriteLabs, ya que llama.cpp estándar no puede ejecutarlo. La información pública es escasa: no se declaran licencia, idiomas ni benchmarks de tareas, y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ternary Bonsai 2 9B; pesos ternarios con escala fp16 por bloque de 128) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bpw, 2,00 GB) y PQ2_0 (2,125 bpw, 2,42 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); también disponible un pack MLX 2-bit en otro repo |
| Bits por peso | 1,75 (PTQ1_0) y 2,125 (PQ2_0) |
| Tamano del repo | 4,4 GB |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-gguf (finetune) |
| Runtime requerido | Fork de DendriteLabs de llama.cpp, commit `9991ae5` |

## Arquitectura y entrenamiento

El modelo es un transformer de 9B parámetros cuyos pesos se almacenan en formato ternario: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, de modo que cada peso decodifica a un valor ternario escalado. Los códigos ternarios provienen de Ternary Bonsai 2 9B; el minero reajustó el resto de pesos (escalas y componentes no ternarios) para minimizar la divergencia respecto a Qwen3.5-9B, que actúa como profesor de referencia en la evaluación del subnet.

El proceso de entrenamiento no está documentado en la información disponible más allá de la descripción del subnet Ingot: los mineros compiten por producir la cuantización más fiel al profesor, y el validador selecciona la mejor según la divergencia KL de las distribuciones de siguiente token sobre los tokens de respuesta de cada dominio. No se especifican número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La innovación técnica principal es el empaquetado ternario con rotación de Hadamard y el repack sin pérdida entre formatos PQ2_0 y PTQ1_0, que permite que ambos ficheros decodifiquen exactamente los mismos valores.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno, heredado de la base Bonsai 2 9B.
- Soporte de plantillas Jinja para chat (`--jinja` en llama-server).
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 9B (`--mmproj`), aunque la calidad visual no está evaluada para estos pesos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue en hardware de gama baja: con 2,00 GB en PTQ1_0, el modelo cabe en GPUs consumer con 4 GB o menos y en CPU con RAM modesta, lo que permite servir un modelo de 9B en entornos donde un BF16 equivalente no cabría.
- Prototipado rápido de asistentes conversacionales: al ocupar menos de 2,5 GB, se puede cargar y descargar en segundos para iterar sobre prompts y plantillas de chat sin esperar a modelos mayores.
- Evaluación de técnicas de cuantización extrema: sirve como caso de estudio reproducible de cómo un ajuste fino sobre pesos ternarios reduce la KL respecto a un profesor BF16 (0,06047 frente a 0,06321), útil para investigadores que estudian compresión.
- Inferencia en el borde (edge) con llama.cpp: el formato GGUF y el fork de DendriteLabs permiten ejecutarlo en dispositivos con CUDA y poca VRAM, como Jetson o portátiles con GPU integrada.
- Experimentación multimodal ligera: añadiendo el proyector `Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` se obtiene entrada de imagen, adecuado para pruebas de concepto aunque la calidad no esté garantizada.
- Reproducción de pipelines de Bittensor/Ingot: el modelo y su commit de referencia permiten replicar la evaluación del subnet y comparar la fidelidad de distintas cuantizaciones.
- Uso en Apple Silicon mediante el pack MLX 2-bit (`dendriteholdings/Ingot-X-9B-MLX-2bit`), para desarrollo local en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es la divergencia KL respecto al profesor BF16:

| Metrica | Ingot-X-9B-Q2 | Modelo vencedor anterior |
|---|---|---|
| KL (teacher ‖ model) por token de respuesta | 0,06047 | 0,06321 |

Menor es mejor. La evaluación pondera los dominios por su cuota de muestras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (PTQ1_0) o 2,4 GB (PQ2_0) solo para los pesos, más overhead de contexto KV y del runtime.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM; el fichero PQ2_0 decodifica más rápido en GPU según la model card.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060). También es viable en CPU.
- Opciones de despliegue: llama.cpp fork de DendriteLabs en el commit `9991ae5` con `-ngl 99 -fa on --jinja`; pack MLX 2-bit para Apple Silicon. llama.cpp estándar no ejecuta estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Ingot-X-9B-Q2 | 8,95B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | Fork DendriteLabs de llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-gguf (base) | 9B | no disponible | Ternaria | no disponible | llama.cpp de PrismML |
| dendriteholdings/Ingot-genesis-9B-Q2 | 9B | no disponible | Ternaria Q2 | no disponible | Fork DendriteLabs de llama.cpp |

Los tres comparten la misma familia y formato ternario. La diferencia de Ingot-X-9B-Q2 es el reajuste de pesos del minero para acercarse a Qwen3.5-9B, con una KL menor que la del modelo que venció en su evaluación. No se dispone de datos para comparar con modelos de 9B en BF16 o Q4, ya que no se han publicado benchmarks de tareas.

## Limitaciones y advertencias

- Requiere un fork no estándar de llama.cpp (DendriteLabs, commit `9991ae5`); llama.cpp upstream no carga estos GGUF.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos del modelo base y del autor.
- Idiomas soportados no declarados; el rendimiento fuera del inglés (o del idioma del profesor Qwen3.5-9B) es desconocido.
- Riesgo de alucinación inherente a modelos de 9B, agravado por la cuantización ternaria extrema, que puede degradar matices y hechos poco frecuentes.
- La evaluación se limita a la KL frente al profesor; no hay benchmarks de exactitud en tareas, por lo que no se puede garantizar calidad en código, matemáticas o razonamiento.
- La entrada de imagen usa un proyector diseñado para el modelo genesis, no para estos pesos, y la calidad visual no está evaluada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Modelo con cero descargas y cero likes en el momento de la consulta; sin validación comunitaria independiente.
- El contexto máximo no está documentado; conviene probarlo empíricamente antes de usarlo en producción con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-X-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX 2-bit: https://huggingface.co/dendriteholdings/Ingot-X-9B-MLX-2bit
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8

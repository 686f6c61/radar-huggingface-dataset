# dendriteholdings/Ingot-III-9B-Q2

## Resumen

Ingot-III-9B-Q2 es un modelo de lenguaje de ~8.950 millones de parametros derivado de Prism ML Ternary Bonsai 2 9B, un modelo ternario (pesos en {-1, 0, +1} con escalas) que a su vez se destila de Qwen3.5-9B. La version que nos ocupa es un fine-tune publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se le aproxima. El minero autor (hotkey `5FNBPMec…`, uid 145) conservo los codigos ternarios originales de Bonsai 2 y reajusto el resto de pesos para acercar la distribucion de salida a la del profesor Qwen3.5-9B.

El modelo se distribuye exclusivamente en formato GGUF, con dos empaquetados del mismo conjunto de pesos ternarios: uno a 1,75 bits por peso (2,00 GB) y otro en contenedor de 2 bits (2,42 GB) que decodifica mas rapido en GPU. La relevancia actual es doble: por un lado demuestra hasta donde llega la cuantizacion extrema (sub-2 bits) manteniendo un KL bajo frente al profesor; por otro, es un ejemplo de pipeline descentralizado de evaluacion (Bittensor) aplicado a compresion de modelos.

No es un modelo de proposito general listo para produccion: requiere un fork especifico de llama.cpp (DendriteLabs, commit `9991ae5`), no funciona con llama.cpp upstream, y no se han publicado datos de licencia, idiomas ni benchmarks convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, pesos ternarios (codigos en {-1, 0, +1} con escala fp16 por bloque), derivado de Qwen3.5-9B via destilacion |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bits/peso, 2,00 GB) y PQ2_0 (2,125 bits/peso en contenedor de 2 bits, 2,42 GB); ambos contienen los mismos pesos ternarios |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); existe tambien un pack MLX de 2 bits en `dendriteholdings/Ingot-III-9B-MLX-2bit` |

## Arquitectura y entrenamiento

La arquitectura de base es la de Ternary Bonsai 2 9B de Prism ML: un transformer denso de ~9 B parametros cuyos pesos se almacenan como codigos ternarios con una escala fp16 por bloque de 128 pesos, lo que reduce el almacenamiento a 1,75-2,125 bits por peso. El modelo original se obtiene por destilacion del profesor Qwen3.5-9B, de modo que el objetivo de entrenamiento es reproducir la distribucion de siguiente token del profesor, no un corpus etiquetado. El GGUF emplea una rotacion de Hadamard y un layout y tokenizer compatibles con el linaje `dendriteholdings/Ingot-genesis-9B-Q2`.

El fine-tune de Ingot conserva los codigos ternarios de Bonsai 2 y reajusta el resto de pesos (escalas y componentes no ternarios) para minimizar la divergencia KL respecto al profesor. La metrica oficial del subnet es el KL por token de respuesta entre la distribucion del modelo y la del profesor BF16 sobre los tokens de respuesta, ponderado por dominio. El modelo ganador alcanza 0,08589 frente a 0,09027 del "rey" al que desplazo en la misma evaluacion. No se especifican el volumen de datos de destilacion, la composicion del dataset ni si hubo RLHF o DPO; el proceso es de destilacion/ajuste por KL, no de alineamiento conversacional.

## Capacidades

- Generacion de texto conversacional y continuacion de prompt en el pipeline `text-generation`.
- Destilacion orientada a imitar el comportamiento de Qwen3.5-9B, incluyendo su estilo de respuesta.
- Soporte de plantilla de chat via `--jinja` en llama-server (formato conversacional).
- Entrada de imagenes opcional: requiere anadir el tower de vision de Ternary Bonsai 2 como proyector (`Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` o `-BF16.gguf`); la calidad visual no esta validada para estos pesos.
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking o razonamiento explicito: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Investigacion en cuantizacion extrema: servir como referencia reproducible de un modelo ternario sub-2 bits con KL medido frente a un profesor, para estudiar el limite practico de la compresion.
- Experimentos con Bittensor/Ingot: replicar el pipeline de evaluacion (KL por token de respuesta) sobre nuevas submissions o comparar variantes de repack PTQ1_0 frente a PQ2_0.
- Despliegue en hardware muy limitado: los 2,00-2,42 GB del GGUF permiten ejecutar un modelo de ~9 B en GPUs consumer de gama baja o en CPU, a costa de usar el fork de llama.cpp.
- Pruebas de destilacion profesor-alumno: usar el modelo como alumno ternario y medir la fidelidad de distribucion frente a Qwen3.5-9B en dominios concretos.
- Prototipado de asistentes conversacionales de bajo coste: con `llama-server --jinja` se puede levantar un endpoint compatible con la API de chat para demos internas, asumiendo que la calidad no esta garantizada fuera del conjunto de evaluacion de Ingot.
- Evaluacion de vision en modelos ternarios: combinar el GGUF con el proyector mmproj de Bonsai 2 para medir la degradacion de calidad multimodal al cambiar los pesos de texto.
- Reproduccion de resultados del subnet: verificar que el repack PTQ1_0 decodifica exactamente los mismos valores que el PQ2_0 original, util para auditorias de submissions.

## Benchmarks y rendimiento

Unica metrica publicada: divergencia KL por token de respuesta frente al profesor BF16 (menor es mejor).

| Modelo | KL |
|---|---|
| Ingot-III-9B (esta submission, evaluacion ganadora) | 0,08589 |
| "Rey" previo del subnet, misma evaluacion | 0,09027 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~2,0 GB para el GGUF PTQ1_0 y ~2,4 GB para el PQ2_0, mas overhead de contexto KV cache (dependiente de la longitud de contexto, no documentada).
- Cabe holgadamente en cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.); tambien es viable en CPU.
- GPU recomendadas para throughput: el PQ2_0 decodifica mas rapido en GPU segun el autor; A100/H100 no son necesarias por tamano, pero pueden usarse para servir muchas peticiones concurrentes.
- Despliegue: exclusivamente con el fork `DendriteLabs/llama.cpp` en el commit `9991ae5`; llama.cpp upstream, Ollama, vLLM y TGI no estan soportados segun la model card.
- Comando de referencia: `llama-server -m Ingot-III-9B-PQ2_0.gguf -ngl 99 -fa on --jinja` (flash attention activada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Ingot-III-9B-Q2 (este) | ~8,95 B | ternaria, 1,75-2,125 bpw | no disponible | no disponible | GGUF, fork DendriteLabs de llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-gguf (base) | ~9 B | ternaria (PQ2_0 / PTQ1_0) | no disponible | no disponible | GGUF, fork de PrismML de llama.cpp |
| dendriteholdings/Ingot-genesis-9B-Q2 | ~9 B | ternaria | no disponible | no disponible | GGUF, mismo layout que este modelo |
| Qwen3.5-9B (profesor de destilacion) | ~9 B | BF16 y cuantizaciones estandar | no disponible | no disponible | safetensors / GGUF estandar |

Frente a Bonsai 2, este modelo mejora el KL (0,08589 en su evaluacion) a costa de un fine-tune especifico del subnet. Frente a Qwen3.5-9B en BF16 ocupa aproximadamente una decima parte del espacio, pero solo se aproxima a su distribucion de salida y no hereda necesariamente sus capacidades de alineamiento o tool calling.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- No funciona con llama.cpp upstream ni con Ollama, vLLM o TGI: requiere compilar el fork de DendriteLabs en el commit exacto `9991ae5`.
- La calidad solo esta medida como KL frente al profesor en el conjunto de evaluacion de Ingot; no hay evidencia de rendimiento en tareas reales (razonamiento, codigo, matematicas).
- Idiomas no declarados: el comportamiento multilingue es incierto y puede degradarse respecto al profesor.
- Longitud de contexto no documentada: no se puede planificar atencion a documentos largos sin medirla empiricamente.
- Riesgo de alucinacion y sesgos heredados de Qwen3.5-9B y de la destilacion; sin RLHF documentado, el modelo puede no rechazar peticiones problematicas de forma fiable.
- La ruta multimodal usa un proyector hecho para `genesis`, no para estos pesos; la calidad de vision no esta validada.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- El empaquetado ternario con rotacion de Hadamard puede introducir diferencias sutiles si se intenta convertir a otros formatos; el repack PTQ1_0 solo es lossless dentro de este linaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-III-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Modelo de linaje genesis: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-III-9B-MLX-2bit
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8

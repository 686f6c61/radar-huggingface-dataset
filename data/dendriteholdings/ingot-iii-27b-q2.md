# dendriteholdings/Ingot-III-27B-Q2

## Resumen

Ingot-III-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parámetros (≈26,9B) publicado por Dendrite Holdings como espejo público de la submission ganadora de la subred Ingot en Bittensor. Ingot no entrena modelos: los mineros cuantizan un profesor fijo y el validador corona la copia que más se aproxima a él, medida como divergencia KL entre las distribuciones del siguiente token y como distancia de estados ocultos frente al profesor en BF16. Este repositorio contiene los pesos del minero `5EZtYcquruTMux5PGgFv45JhTYsR46CCHD9Uwy2Fm8qCRXM8` (uid 151), subidos byte a byte.

El interés es doble. Por un lado, es un caso práctico de cuantización extrema: un único archivo GGUF de 7,2 GB para 26,9B de parámetros equivale a unos 2,1 bits por parámetro. Por otro, aporta una métrica de fidelidad explícita frente al profesor (KL de 0,11440 y distancia de estados ocultos de 0,3617), un 11,5% y un 20,3% mejores que Ingot-genesis-27B-Q2, respectivamente.

El uso no es directo: el GGUF emplea el layout, el tokenizer y la rotación de Hadamard de Ingot-genesis-27B-Q2, y llama.cpp estándar no lo carga. Es necesario el fork de PrismML en el commit `e3de715`. La model card no documenta arquitectura del profesor, contexto, idiomas ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo derivado: cuantización GGUF de un profesor de 27B; la model card no documenta la arquitectura del profesor |
| Parámetros totales | 26.895.998.464 (≈26,9B; el nombre comercial indica 27B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q2; ≈2,1 bits por parámetro (7,2 GB / 26,9B); rotación de Hadamard |
| Idiomas soportados | No disponible |
| Licencia | No disponible en este repositorio (Ingot-genesis-27B-Q2 se publica como apache-2.0) |
| Formato de pesos | GGUF (`Ingot-III-27B-Q2.gguf`) |
| Runtime requerido | Fork PrismML de llama.cpp, commit `e3de715` (llama.cpp estándar no lo carga) |
| Capacidad multimodal | Opcional, acoplando el mmproj de `prism-ml/Ternary-Bonsai-2-27B-gguf`; no evaluada |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantización producido dentro de la subred Ingot. El proceso es una destilación por compresión: existe un profesor fijo en BF16 y cada minero presenta una copia cuantizada; el validador puntúa la fidelidad de esa copia con dos medidas calculadas por token de respuesta frente al profesor leyendo la misma respuesta: la divergencia KL entre distribuciones del siguiente token y la distancia relativa de estados ocultos `|h − h_teacher| / |h_teacher|`, promediada cada 8 capas. Menor es mejor. Este modelo ganó con KL 0,11440 y distancia 0,3617.

La model card no detalla composición del dataset, número de tokens, ni si hubo RLHF/DPO, porque no hubo entrenamiento en el sentido habitual: los pesos son la conversión del minero sobre el profesor. Técnicamente, el punto distintivo es el formato: el archivo conserva el layout, el tokenizer y la rotación de Hadamard de Ingot-genesis-27B-Q2, lo que exige un fork específico de llama.cpp y rompe la compatibilidad con el ecosistema estándar. La evaluación de la subred cubre únicamente el modelo de texto; la calidad multimodal no se puntúa.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Publicado con la etiqueta `endpoints_compatible`.
- Entrada de imágenes opcional mediante un proyector externo (mmproj Q8_0 o BF16 de Ternary-Bonsai-2-27B); el proyector se construyó para genesis, no para estos pesos, y la calidad de imagen está sin probar.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, audio u otras capacidades especiales: no documentadas.
- Razonamiento, código y matemáticas: no se han publicado evaluaciones específicas para este modelo.

## Casos de uso

- Inferencia local en GPU de consumo: los 7,2 GB de pesos permiten cargar el modelo en tarjetas de 12-16 GB, dejando espacio para caché KV y contexto, algo inviable con el profesor en BF16.
- Replicación de la evaluación de la subred Ingot: compilar el fork de PrismML en el commit `e3de715` y ejecutar `llama-server -m Ingot-III-27B-Q2.gguf -ngl 99 -fa on --jinja` para reproducir las métricas KL y de estados ocultos declaradas.
- Estudio de cuantización extrema: comparar la degradación respecto al profesor BF16 en un régimen de ~2,1 bits por parámetro, usando la KL por token como indicador objetivo.
- Asistente conversacional offline: desplegar el modelo en una estación de trabajo sin conectividad, con `llama-server` como backend HTTP local.
- Prototipado y docencia sobre Bittensor: usar el repositorio como ejemplo verificable de cómo se evalúa y corona una submission en una subred de cómputo descentralizado.
- Experimentación multimodal controlada: acoplar el mmproj de Ternary-Bonsai-2-27B para probar entrada de imágenes, asumiendo que no hay garantía de calidad al no haber sido entrenado el proyector para estos pesos.
- Evaluación comparativa de reyes de la subred: enfrentar Ingot-III, Ingot-II e Ingot-I con el mismo harness y las mismas respuestas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Las únicas métricas publicadas son las de fidelidad frente al profesor:

| Métrica (por token de respuesta) | Ingot-III-27B-Q2 (eval ganadora) | Rey anterior en la misma eval | Mejora frente a Ingot-genesis-27B-Q2 |
|---|---|---|---|
| KL(profesor ‖ modelo) | 0,11440 | 0,11666 | 11,5% más cercano |
| Distancia de estados ocultos (media cada 8 capas) | 0,3617 | 0,3873 | 20,3% más cercano |

## Requisitos de hardware

- Pesos en disco y en VRAM: 7,2 GB en GGUF Q2.
- VRAM estimada para inferencia: en torno a 8-10 GB con contexto corto y 10-12 GB con contexto largo; el tamaño de la caché KV no está documentado.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para uso individual con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para pesos y contexto moderado; A100 o H100 para servir en lote y con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más, con margen ajustado en el límite inferior.
- Opciones de despliegue: exclusivamente el fork PrismML de llama.cpp en el commit `e3de715` (`llama-server`). Según la model card, llama.cpp estándar no lo ejecuta; no hay soporte declarado para vLLM, TGI, Ollama ni otros servidores.
- Flags de ejecución indicadas por el autor: `-ngl 99 -fa on --jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | KL vs profesor | Distancia hidden-state | Licencia |
|---|---|---|---|---|---|
| Ingot-III-27B-Q2 | 26,9B | GGUF Q2 | 0,11440 | 0,3617 | No disponible |
| Ingot-genesis-27B-Q2 | ≈27B | GGUF Q2 (ternario, Hadamard) | 11,5% peor que Ingot-III | 20,3% peor que Ingot-III | apache-2.0 |
| Ingot-I-27B-Q2 | ≈27B | GGUF Q2 | No disponible | No disponible | No disponible |
| Ingot-genesis-27B-FP8 | ≈27B | FP8 | Punto de partida de la subred (coronado el 16 de octubre de 2026) | No disponible | No disponible |

Los tres reyes Q2 (Ingot-I, Ingot-II e Ingot-III) proceden de las 26 submissions evaluadas entre el 16 y el 17 de octubre de 2026, según el directorio de la subred.

## Limitaciones y advertencias

- Licencia no declarada en este repositorio: no se puede asumir la apache-2.0 de Ingot-genesis-27B-Q2 para uso comercial sin verificarlo con el autor.
- Dependencia de un fork no estándar de llama.cpp en un commit concreto: deuda técnica relevante y riesgo de rotura si el fork deja de mantenerse.
- Cuantización muy agresiva (~2,1 bits por parámetro): una KL de 0,11440 frente al profesor no es cero; cabe esperar degradación en tareas de razonamiento encadenado, código y matemáticas, aunque no esté cuantificada públicamente.
- Ausencia total de benchmarks estándar y de datos de idiomas: no hay base para afirmar rendimiento multilingüe ni comparaciones con modelos convencionales de 27B.
- Capacidad de visión no validada: el proyector procede de otro modelo y la subred solo puntúa texto.
- Longitud de contexto desconocida: planificar despliegues con ventanas conservadoras.
- Riesgo de alucinación inherente a los modelos generativos, no medido en la información disponible.
- Sesgos no documentados.
- Fechas del repositorio (octubre de 2026) y estado dinámico de la subred: conviene verificar la vigencia del rey y de los commits antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dendriteholdings/Ingot-III-27B-Q2
- Modelo predecesor (genesis): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Otro rey de la subred (Ingot-I): https://huggingface.co/dendriteholdings/Ingot-I-27B-Q2
- Fork de llama.cpp usado en la evaluación: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Torre de visión (Ternary-Bonsai-2-27B-gguf): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector mmproj Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector mmproj BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Ficha de la subred Ingot: https://subnetalpha.ai/subnet/ingot/
- Panel en vivo de la subred: https://theingot.ai
- Registro en free2aitools (Ingot-I): https://free2aitools.com/model/dendriteholdings/ingot-i-27b-q2

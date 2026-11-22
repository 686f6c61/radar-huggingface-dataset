# reaperdoesntknow/DualMind

## Resumen

DualMind es un modelo de lenguaje de aproximadamente 2.030 millones de parámetros (1,7B efectivos) desarrollado por reaperdoesntknow bajo el sello de Convergent Intelligence LLC. Se construye sobre una cadena de ajuste fino supervisado (SFT) que parte de Qwen3-1.7B y pasa por una variante sin censura (DiStil-Qwen3-1.7B-uncensored) y un refinamiento DISC antes de llegar a este modelo final. Su propuesta central es implementar lo que el autor denomina "razonamiento de doble modalidad mental": una única arquitectura con dos voces internas que comparten pesos y se diferencian únicamente por tokens de rol (`<explore>`, `<examine>`, `<response>`).

El problema que aborda es la autoverificación en cadenas de razonamiento: en lugar de una única corriente de CoT, el modelo separa una fase de exploración libre, una fase de crítica adversarial sobre su propia salida y una fase de síntesis limpia. La arquitectura subyacente es Qwen3ForCausalLM, con 28 capas, tamaño oculto 2048, 16 cabezas de atención de consulta y 8 de clave/valor (GQA), y una longitud de contexto de 40.960 tokens. El entrenamiento se realizó en BF16 sobre una H100 de Colab durante 512 pasos con TRL.

Es relevante ahora porque propone una alternativa ligera y de pesos compartidos a los ensamblados multi-modelo para obtener diversidad de perspectivas, y porque su licencia Apache 2.0 y su tamaño permiten desplegarlo en hardware de gama consumer. No obstante, la información pública disponible es escasa y proviene casi exclusivamente de la model card del autor, sin resultados de benchmarks independientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 28 capas, tamaño oculto de 2048, 16 cabezas de consulta y 8 de clave/valor (GQA), y una ventana de contexto de 40.960 tokens. Se entrenó en precisión BF16 sobre una H100 de Colab mediante SFT con TRL durante 512 pasos y una tasa de aprendizaje de 5e-6. La cadena de destilación documentada es: Qwen3-1.7B → DiStil-Qwen3-1.7B-uncensored (SFT sin censura) → Disctil-Qwen3-1.7B (refinamiento DISC) → DualMind.

La innovación principal es el formateo del dato de entrenamiento en un bucle cognitivo de tres fases. Cada solución de CoT se reestructura en bloques `<explore>` (derivación libre), `<examine>` (verificación y crítica adversarial) y `<response>` (síntesis final). La separación se hace a nivel de frase mediante detección de disparadores ("check", "verify", "however", "but wait", etc.) para localizar la transición natural entre razonamiento y verificación, con un respaldo posicional 70/30. El dataset de esta iteración es KK04/LogicInference_OA, con problemas de inferencia lógica transformados a ese formato. El autor indica que una siguiente iteración se entrena sobre Crownelius/Opus-4.6-Reasoning-3300x (2.160 muestras de razonamiento de Claude Opus 4.6 con columnas `thinking`/`solution` pre-separadas). La model card vincula el diseño con un marco teórico propio denominado Discrepancy Calculus (DISC), sin validación externa disponible.

## Capacidades

- Generación de texto conversacional y de razonamiento en formato multi-fase con tokens de rol `<explore>`, `<examine>` y `<response>`.
- Razonamiento lógico y matemático estructurado: el entrenamiento se centró en problemas de inferencia lógica y demostraciones.
- Autocrítica y autocorrección estructural: la fase `<examine>` está diseñada para detectar errores y lagunas en la derivación previa.
- Cadena de razonamiento explícita (tipo thinking) integrada en la plantilla de generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el bucle interno explore-examine-response puede interpretarse como multi-paso, pero no hay evidencia publicada.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales: variante sin censura heredada de la cadena base; no se documentan visión ni audio.

## Casos de uso

- Tutoría de matemáticas y lógica: el modelo puede generar una derivación en `<explore>`, revisarla en `<examine>` y entregar una solución limpia en `<response>`, lo que resulta útil para explicar paso a paso demostraciones y detectar errores en el razonamiento del estudiante.
- Generación de soluciones verificadas en pipelines de evaluación: la separación explícita entre exploración y crítica permite filtrar automáticamente respuestas donde la fase de examen detecta inconsistencias antes de exponer el resultado final.
- Prototipado de agentes de razonamiento en hardware limitado: con ~2B parámetros y pesos safetensors, cabe en GPUs de gama consumer y sirve para experimentar con bucles de autocrítica sin infraestructura de servidor.
- Investigación sobre autoverificación y CoT: el formato de tres fases facilita analizar por separado la calidad de la derivación y la de la crítica, útil para estudiar alucinación y autocorrección en modelos pequeños.
- Generación de datos sintéticos de razonamiento: el modelo puede producir trazas explore-examine-response que sirvan como material de entrenamiento o de evaluación para modelos mayores.
- Asistente de análisis de problemas formales en entornos educativos o de investigación: para descomponer enunciados lógicos, proponer enfoques y contrastarlos antes de dar una respuesta consolidada.
- Despliegue en local para experimentación con plantillas de prompt personalizadas: la licencia Apache 2.0 y el tamaño permiten integrarlo en herramientas de escritorio o notebooks sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB (no se publican artefactos cuantizados oficiales, pero el modelo es convertible con herramientas estándar).
- GPU recomendadas: H100 o A100 para entrenamiento y despliegue de referencia; RTX 4090, RTX 3090, RTX 4080 o superiores para inferencia cómoda en BF16.
- Cabe en GPU consumer: sí; en tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y previsiblemente llama.cpp/Ollama/vLLM tras conversión, aunque no se documentan explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DualMind | ~2,03B | 40.960 | Apache 2.0 | SFT con bucle explore-examine-response sobre Qwen3-1.7B; sin benchmarks publicados |
| Qwen3-1.7B | ~1,7B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | Modelo base original; referencia directa de capacidades y contexto |
| DiStil-Qwen3-1.7B-uncensored | ~1,7B | no disponible en esta ficha | no disponible en esta ficha | Variante sin censura de la que DualMind hereda el ajuste |
| Disctil-Qwen3-1.7B | ~1,7B | no disponible en esta ficha | no disponible en esta ficha | Refinamiento DISC intermedio de la cadena |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de MMLU, GSM8K, HumanEval ni de evaluaciones de razonamiento que respalden las afirmaciones de la model card.
- Riesgo de alucinación: como modelo de ~2B parámetros, la fase `<examine>` puede confirmar derivaciones erróneas en lugar de detectarlas; no hay estudios que midan la tasa de autocorrección real.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado fuera del inglés, y no hay información sobre castellano.
- La variante base es "uncensored": puede generar contenido sin los filtros habituales, lo que exige moderación adicional en producción.
- Formato de prompt rígido: el rendimiento depende de respetar los tokens `<explore>`, `<examine>` y `<response>`; usos fuera de esa plantilla pueden degradar la calidad.
- Entrenamiento breve (512 pasos) sobre un dataset específico de inferencia lógica: la generalización a otras tareas no está validada.
- El marco teórico DISC citado en la model card carece de revisión por pares o validación externa en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por una base sin censura.
- No se documentan cuantizaciones oficiales ni artefactos GGUF; el despliegue en entornos de bajos recursos requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind
- Modelo base: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo intermedio de la cadena: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Dataset de entrenamiento de esta iteración: https://huggingface.co/datasets/KK04/LogicInference_OA
- Dataset de la siguiente iteración: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Repositorio de experimentos del autor: https://huggingface.co/reaperdoesntknow

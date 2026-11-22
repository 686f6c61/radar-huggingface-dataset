# jiazhe868/Qwen3.5-9B-Seis-RL-run1

## Resumen

Qwen3.5-9B-Seis-RL-run1 es un ajuste fino del modelo Qwen3.5-9B especializado en sismología y geofísica, publicado por el usuario jiazhe868. Se trata del resultado de aplicar 20 pasos de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el checkpoint SFT Qwen3.5-9B-Seis-SFT, dentro del proyecto qwen-seis-posttrain. El modelo conserva la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text), aunque el autor indica que solo se ha probado en modo texto.

El modelo resuelve problemas cuantitativos de sismología con formato de respuesta verificado por programa (unidades incluidas, respuesta final en `\boxed{}`), y su interés principal es documental: demuestra que el RL con recompensas verificables reduce la longitud de las respuestas un 41 % respecto al modelo SFT (5.637 frente a 9.517 tokens de media) y mejora la precisión cuando el presupuesto de tokens es corto (16K), pero empeora con presupuestos largos (64K). El autor lo describe explícitamente como un artefacto de investigación, no como un modelo recomendado para producción.

Con 9.653.104.368 parámetros, licencia Apache-2.0 y un tamaño de repositorio de 19,3 GB, el modelo está pensado para servir con vLLM en modo solo texto, con un contexto máximo configurado de 40.960 tokens y un parser de razonamiento qwen3. La fecha de creación del repositorio es el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (pipeline image-text-to-text); el autor indica que el codificador de visión no se probó y que el modelo se usa en modo texto |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en la configuración de servicio recomendada (`--max-model-len 40960`); el autor evalúa con presupuestos de salida de 16K, 32K y 64K |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con codificador de visión, y hereda la arquitectura del checkpoint SFT intermedio. El ajuste fino se realizó mediante GRPO: 8 respuestas por prompt, ventaja calculada como la recompensa de cada respuesta menos la media de su grupo, 126 prompts por paso, clip PPO de 0,2 por debajo y 0,28 por encima, sin término KL, respuestas limitadas a 16K tokens y tasa de aprendizaje de 2e-6. Las recompensas son verificables por programa: comparación del valor numérico con la etiqueta verificada del problema (incluyendo unidades), tests unitarios ocultos ejecutados en sandbox para código, y comprobaciones de instrucciones y matemáticas para prompts generales.

De los 120 pasos planificados solo se ejecutaron 56. La precisión en el split de desarrollo alcanzó su máximo en el paso 20 (97,3) y cayó después (78,9 en el paso 40), por lo que se conservó el checkpoint del paso 20; el autor reconoce que la causa de la deriva sigue abierta y que la RL v2 del repositorio es un rediseño. La tarea de informes, evaluada por un juez con rúbrica, se incorporó en el paso 27, posterior a este checkpoint. El entrenamiento y la evaluación se ejecutaron en un clúster de GPU; no se detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Resolución de problemas numéricos de sismología y geofísica con unidades y cifras significativas, con respuesta final en formato `\boxed{<número> <unidad>}`.
- Razonamiento multi-paso con modo thinking activado por defecto (el contenido de razonamiento se expone en `reasoning_content`).
- Generación de código, con verificación mediante tests unitarios en sandbox durante el entrenamiento (D-Code, pass@1 de 85,2).
- Tool calling / function calling (86,7 % en el conjunto de 188 ítems de tool calling).
- Cumplimiento de instrucciones (IFEval de 93,9 sobre 377 ítems).
- Capacidad multimodal heredada de Qwen3.5 (image-text-to-text), aunque el autor advierte que el codificador de visión no se probó.
- Soporte multilingüe limitado al inglés según la model card.
- No se documentan capacidades de audio ni de agentes multi-turno de forma explícita.

## Casos de uso

- Cálculo de distancias epicentrales e hipocentrales a partir de tiempos S-P: el modelo resuelve problemas de 1 a 3 pasos con una precisión media@8 del 89,2 %, adecuado para asistentes de laboratorio que necesitan respuestas numéricas con unidades verificables.
- Estimación de magnitudes y parámetros de fuente en problemas de varios pasos: en D-Num-hard (3+ pasos) obtiene 70,1 ± 1,7, superior al modelo SFT (68,1), por lo que es útil cuando la cadena de razonamiento es larga pero el presupuesto de tokens es moderado.
- Asistencia en docencia y ejercicios de geofísica: el formato de respuesta forzado (`\boxed{}`) y el system prompt de unidades permiten integrarlo en correctores automáticos de problemas.
- Generación y revisión de código de procesado sísmico: con pass@1 de 85,2 en D-Code y soporte de tool calling, puede integrarse en pipelines que validan scripts de lectura de formatos sísmicos o cálculo de espectros.
- Evaluación comparativa de estrategias de post-entrenamiento: al ser un checkpoint documentado de un experimento GRPO reproducible, sirve como referencia para estudiar el efecto del RL en longitud y precisión de respuestas.
- Prototipado de asistentes de razonamiento con presupuesto corto: con una media de 5.637 tokens de salida frente a 9.517 del SFT, reduce coste de inferencia en despliegues con límite de 16K tokens.
- Cumplimiento de instrucciones estructuradas en inglés: IFEval de 93,9 lo hace apto para tareas de formateo y extracción con instrucciones explícitas, siempre que no se requiera alta fiabilidad en rechazo de peticiones dañinas.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en el mismo harness (temperatura 1,0, top-p 1,0, thinking activado, máximo 32K tokens de salida, solo se evalúa la respuesta final; ± es el intervalo de confianza del 95 % del ruido de muestreo):

| Conjunto (métrica, ítems) | Base | SFT | Este modelo |
|---|---|---|---|
| D-Num: problemas de 1–3 pasos (avg@8, 300) | **91,6** ± 1,0 | 89,4 ± 0,9 | 89,2 ± 1,0 |
| D-Num-hard: 3+ pasos (avg@8, 160) | 62,0 ± 1,6 | 68,1 ± 1,4 | **70,1** ± 1,7 |
| D-Fresh: escritos tras el lanzamiento del base (avg@8, 60) | 70,6 ± 2,6 | 78,8 ± 2,3 | **83,3** ± 2,6 |
| D-Code (pass@1, 150) | 80,5 ± 2,3 | **86,3** ± 2,0 | 85,2 ± 2,2 |
| D-Report (win rate vs base, menor de dos jueces, 100) | 50 | 49,0 ± 9,0 | 49,0 ± 8,5 |
| GPQA Diamond (198) | 56,6 ± 1,6 | 71,3 ± 1,6 | **74,2** ± 1,8 |
| IFEval (377) | 93,1 | 93,1 | 93,9 |
| LiveCodeBench posterior a 2025-01 (70) | 38,2 | **52,5** | 50,0 |
| Tool calling (188) | 83,0 | 88,8 | 86,7 |
| Rechazo de prompts que deberían rechazarse, % (300) | **56,0** | 51,3 | 45,7 |
| Sobre-rechazo de prompts benignos, % (350) | 3,4 | 4,0 | 2,6 |
| Tokens de salida medios | 14.735 | 9.517 | 5.637 |

Evaluación con el mismo conjunto de respuestas puntuado como si el límite hubiera sido 16K, 32K o 64K tokens (a 64K, las respuestas cuyo thinking no había terminado a 32K se continuaron con el mismo modelo):

| Conjunto | Modelo | 16K | 32K | 64K |
|---|---|---|---|---|
| D-Num-hard | SFT | 47,8 | 68,1 | **83,9** |
| | Este modelo | **58,0** | 70,1 | 77,5 |
| D-Fresh | SFT | 66,9 | 78,8 | no disponible |
| | Este modelo | **77,9** | 83,3 | no disponible |

El autor resume el hallazgo: el RL hizo el modelo más rápido, no más fiable. Con 16K es claramente mejor porque termina más respuestas; con 64K es peor que el SFT, ya que en D-Num-hard a 32K convirtió 11,7 puntos de respuestas inacabadas en 9,0 puntos de valores erróneos y solo 2,0 puntos de aciertos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 9.653 millones de parámetros, en FP16/BF16 los pesos ocupan aproximadamente 19,3 GB, por lo que se necesita una GPU con al menos 24 GB para inferencia básica, aunque este cálculo no lo publica el autor.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo indica que el entrenamiento y la evaluación se ejecutaron en un clúster de GPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de pesos en BF16, encajaría en GPUs de 24 GB o más, pero no hay datos publicados de latencia ni de cuantizaciones probadas.
- Despliegue: vLLM en modo solo texto, con el comando `vllm serve jiazhe868/Qwen3.5-9B-Seis-RL-run1 --max-model-len 40960 --reasoning-parser qwen3 --language-model-only`. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato de coste indirecto es la reducción de tokens de salida medios (5.637 frente a 9.517 del SFT).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|
| Qwen3.5-9B-Seis-RL-run1 | 9.653.104.368 | 40.960 tokens (config. de servicio) | Apache-2.0 | GPQA Diamond 74,2; D-Num-hard 70,1; 5.637 tokens de salida |
| Qwen3.5-9B-Seis-SFT (modelo base del ajuste) | no disponible | no disponible | Apache-2.0 | GPQA Diamond 71,3; D-Num-hard 68,1; 9.517 tokens de salida |
| Qwen3.5-9B (base original) | no disponible | no disponible | Apache-2.0 (según la model card del ajuste) | GPQA Diamond 56,6; D-Num 91,6; 14.735 tokens de salida |

No se dispone de información sobre otros modelos de sismología comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los problemas de entrenamiento y test provienen de plantillas de solucionadores o fueron escritos por modelos; ninguna referencia fue verificada por un experto de dominio, por lo que las preguntas reales de investigación pueden ser más difíciles o distintas.
- Con presupuestos largos (64K) produce más valores erróneos que el modelo SFT: en D-Num-hard convierte respuestas inacabadas en valores incorrectos en mayor proporción que en aciertos.
- Rechaza menos peticiones dañinas: 45,7 % de los prompts que deberían rechazarse, frente al 51,3 % del SFT y el 56,0 % del base. No es adecuado como capa de seguridad.
- Los informes no mejoran: el juez que nunca tocó el entrenamiento los puntúa como empates con el base (49,0 %).
- Solo texto: el codificador de visión es el del modelo base y no se probó.
- Es un artefacto de investigación, no una herramienta para decisiones operativas como la evaluación de peligrosidad sísmica.
- La deriva del entrenamiento tras el paso 20 no está explicada; el checkpoint conservado es una elección empírica, no una convergencia estable.
- Idiomas: únicamente inglés según la model card.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no valida el modelo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-RL-run1
- Modelo base del ajuste (SFT): https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-SFT
- Repositorio del proyecto: https://github.com/jiazhe868/qwen-seis-posttrain

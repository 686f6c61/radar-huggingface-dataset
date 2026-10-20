# L1nkee/Qwen3-4B-NoThink-DPPO-BinaryTV-delta0.2-LR1e-6-fp32-540steps

## Resumen

Este repositorio contiene un ajuste fino por aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-4B, desarrollado por el usuario L1nkee, orientado a razonamiento matemático con el modo de pensamiento (thinking) desactivado. El modelo parte de los 4.022.468.096 parámetros del Qwen3-4B original —un transformer denso decoder-only— y se entrena sobre el conjunto DAPO-Math-17k con el algoritmo DPPO y una región de confianza basada en distancia de variación total binaria (δ = 0,2), usando la librería verl.

La particularidad técnica es que el entrenamiento refuerza la respuesta directa sin cadena de razonamiento explícita: el modelo aprende a resolver problemas de matemáticas emitiendo la solución en un único paso, lo que reduce la longitud de salida y el coste de inferencia frente a las variantes con thinking. El entrenamiento se ejecutó en precisión fp32 (FSDP) para pesos maestros y bf16 para el rollout (vLLM), con 540 pasos equivalentes a 4 épocas sobre el dataset.

El interés práctico está en que publica un checkpoint por cada paso (ramas `step-10` a `step-540`), lo que permite analizar la dinámica de entrenamiento y elegir el punto óptimo. El propio autor reporta que el mejor resultado en AIME 2024 se alcanza en el paso 360 (61,04% Avg@16) y que el checkpoint final baja a 53,96%, un caso claro de degradación post-pico. La licencia es Apache-2.0 y los pesos se distribuyen en safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); derivado de Qwen/Qwen3-4B |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card de este fine-tune; el entrenamiento usa un maximo de 2.048 tokens de prompt y 8.192 de respuesta. El modelo base Qwen3-4B declara 32.768 tokens nativos (ampliables con YaRN), dato no verificado en esta ficha |
| Tipos de cuantizacion | No se publican cuantizaciones; los pesos se distribuyen en bf16 safetensors. Convertibles a GGUF, AWQ o GPTQ por terceros |
| Idiomas soportados | No disponible (la model card no declara idiomas; hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde checkpoints FSDP en fp32) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B: un transformer denso decoder-only con atención por causalidad estándar. No hay innovaciones arquitectónicas propias en este repositorio; todo el trabajo se concentra en el ajuste por RL. El entrenamiento se hizo con verl, con pesos maestros y estados del optimizador en fp32 bajo FSDP y rollout en bf16 mediante vLLM, y los pesos publicados son la fusión a bf16 de cada checkpoint fp32.

El algoritmo es DPPO con una región de confianza de variación total binaria: para cada token se calcula la TV direccional frente a la política de rollout y, si supera el umbral δ = 0,2 en cualquier dirección, el token se enmascara y no contribuye a la pérdida. El ratio de importancia se calcula contra las probabilidades de la política de rollout, se recorta a 5 y se desacopla del grafo (detached). La ventaja usa una línea base de grupo tipo GRPO, sin dividir por la desviación típica del grupo. La agregación de pérdida es seq-mean-token-sum. Hiperparámetros: learning rate constante de 1e-6 sin warmup, weight decay 0,1, grad clip 1,0, sin penalización KL ni bonus de entropía, batch de 128 prompts × 8 rollouts a temperatura 1,0, mini-batch de 32 y 1 época de actualización por lote de datos. En total, 540 pasos (4 épocas sobre DAPO-Math-17k, 135 pasos por época), semilla 42. La recompensa es binaria (1/0) según la corrección de la respuesta verificada con Math-Verify, sin recompensa de formato ni de longitud.

## Capacidades

- Generación de texto y resolución de problemas matemáticos en un solo paso, sin cadena de pensamiento explícita (modo no-think forzado por el entrenamiento).
- Razonamiento aritmético y algebraico de competición, entrenado específicamente sobre DAPO-Math-17k con verificación automática de respuesta final.
- Seguimiento de instrucciones y formato de respuesta heredados del Qwen3-4B base, aunque no evaluados en esta ficha.
- Generación de código: capacidad potencial heredada del modelo base, sin datos de evaluación en este fine-tune.
- Multilingüismo: no documentado en la model card; depende de lo que conserve el modelo base tras el RL sobre un dataset predominantemente matemático.
- Tool calling / function calling: no documentado ni evaluado.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el entrenamiento penaliza implícitamente las salidas largas al no premiar el formato de razonamiento.
- Punto de control seleccionable: 57 ramas (`step-10` … `step-540`) para elegir el equilibrio entre rendimiento y sobreajuste.

## Casos de uso

- Evaluación de dinámica de RL: usar las ramas `step-N` para estudiar cómo evoluciona la precisión matemática paso a paso y validar si el pico en el paso 360 es reproducible con otra semilla. Es el uso más directo dado el diseño del repositorio.
- Motor de respuestas matemáticas de baja latencia: al no emitir cadena de pensamiento, la salida es mucho más corta que en un modelo thinking, lo que reduce tokens generados y coste por consulta en entornos de alto volumen.
- Verificación automática de ejercicios: integrar el modelo en un pipeline que reciba enunciado y devuelva respuesta final, con Math-Verify como comprobador posterior para filtrar fallos.
- Baseline para investigación en DPPO: comparar la variante binary TV (δ = 0,2) contra PPO con clipping o GRPO puro usando el mismo dataset y presupuesto de pasos.
- Generación de datos sintéticos de matemáticas: producir pares problema-solución para aumentar datasets de entrenamiento, filtrando por la recompensa binaria del verificador.
- Servicio interno de tutoría con supervisión humana: respuesta directa a dudas de cálculo o álgebra, aceptable en contextos donde un error no tiene consecuencias críticas y hay revisión posterior.
- Destilación: usar el checkpoint del paso 360 como profesor para modelos más pequeños en tareas de aritmética, aprovechando su mayor precisión relativa.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| AIME 2024 (30 problemas) | Avg@16, temperatura 0,7, top-p 0,95, paso 360 (mejor) | 61,04% |
| AIME 2024 (30 problemas) | Avg@16, temperatura 0,7, top-p 0,95, paso 540 (final) | 53,96% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. La comparación con el Qwen3-4B base en AIME 2024 tampoco se reporta, por lo que no es posible cuantificar la ganancia atribuible al RL con los datos disponibles. El tamaño muestral (30 problemas) implica un intervalo de confianza amplio: una diferencia de 7 puntos porcentuales entre los pasos 360 y 540 queda cerca del ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 8,1 GB solo de pesos (4,02 B × 2 bytes), más caché KV y activaciones; presupuestar 10-14 GB para contextos moderados.
- Cuantización int8: aproximadamente 4 GB de pesos; int4: aproximadamente 2,2 GB, con pérdida de precisión no evaluada en este modelo.
- GPU consumer: cabe en una RTX 4090 (24 GB) en bf16 con contexto amplio, y en una RTX 3060 12 GB o RTX 4060 Ti 16 GB si se usa cuantización de 8 o 4 bits o se limita el contexto.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir con lotes grandes; una sola A100 40 GB permite bf16 con contextos largos y concurrencia moderada.
- Despliegue: transformers (ruta oficial), vLLM y TGI para serving en bf16; llama.cpp u Ollama requieren convertir los safetensors a GGUF, paso no publicado por el autor.
- Latencia y throughput: no disponible; no se han publicado mediciones. Como referencia cualitativa, el modo sin thinking reduce mucho el número de tokens de salida frente a un modelo con razonamiento explícito, lo que suele traducirse en menor latencia por petición.
- Almacenamiento: el repo completo ocupa 442,5 GB por las 57 ramas de checkpoint. Descargar una sola revisión (`revision="step-360"`) evita bajar todos los pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (paso 540) | 4,02 B | No especificado en la ficha; entrenado con prompt 2.048 y respuesta 8.192 | RL con DPPO binary TV sobre matematicas, sin thinking | Apache-2.0 | Peso bf16 en HF, 57 ramas de paso |
| Qwen/Qwen3-4B (base) | 4,02 B | 32.768 nativos segun la ficha del base (no verificado aqui) | Modelo generalista con modos thinking y no-thinking | Apache-2.0 | Peso oficial, ampliamente cuantizado |
| Qwen2.5-Math-7B-Instruct | 7,6 B aprox. (dato no verificado en esta ficha) | No disponible | Especializado en matematicas, con CoT | Apache-2.0 | Peso oficial |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B aprox. (dato no verificado en esta ficha) | No disponible | Destilado de razonamiento, salidas largas | MIT | Amplia disponibilidad en GGUF |

No hay datos publicados que permitan comparar AIME 2024 entre estos modelos con la misma configuración de evaluación, por lo que la comparación de rendimiento queda como no disponible. La ventaja diferencial de este fine-tune es la ausencia de cadena de pensamiento (menos tokens por respuesta) y la granularidad de checkpoints; su desventaja es la falta de cuantizaciones oficiales y de evaluación fuera de matemáticas.

## Limitaciones y advertencias

- Entrenado exclusivamente con recompensa binaria de corrección en matemáticas: no hay señales de RLHF, DPO ni datos de seguridad, por lo que la alineación es la del Qwen3-4B base sin refinar.
- El modo thinking está desactivado por diseño. En problemas que requieren descomposición multi-paso, esto puede reducir la precisión frente a variantes con cadena de razonamiento, especialmente fuera del dominio de AIME.
- Riesgo alto de olvido catastrófico en capacidades generales (redacción, código, multilingüismo) tras 540 pasos de RL sobre un único dataset matemático; no hay evaluación que lo descarte.
- El checkpoint final es peor que el del paso 360 en AIME 2024 (53,96% frente a 61,04%), señal de sobreajuste o inestabilidad. Usar `main` sin revisar es una mala elección por defecto.
- El benchmark se apoya en 30 problemas y Avg@16, sin intervalos de confianza ni comparación contra el modelo base: no permite afirmar mejora neta.
- No se documenta la composición exacta de DAPO-Math-17k Ni se analiza posible contaminación de AIME en los datos de entrenamiento.
- Sesgos: no evaluados. El modelo hereda los sesgos del corpus del Qwen3-4B y el RL no los corrige.
- Idiomas: no declarados; el ajuste sobre matemáticas en un solo dataset puede degradar el rendimiento en castellano respecto al base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte, y las 57 ramas no siguen un esquema de versionado estándar.
- El repo de 442,5 GB puede agotar disco si se clona completo; usar descarga selectiva por revisión.
- No hay cuantizaciones oficiales ni plantilla de chat documentada en la model card; hay que reutilizar la del Qwen3-4B y verificar el comportamiento sin thinking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L1nkee/Qwen3-4B-NoThink-DPPO-BinaryTV-delta0.2-LR1e-6-fp32-540steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Libreria de RL utilizada (verl): https://github.com/volcengine/verl
- Repositorio de Math-Verify (verificador de recompensa): https://github.com/huggingface/Math-Verify
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales asociados a este modelo.

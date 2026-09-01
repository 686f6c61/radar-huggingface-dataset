# promotion/Llama-3.1-8B-TLDR-UniformINPO

## Resumen

`promotion/Llama-3.1-8B-TLDR-UniformINPO` es un modelo de alineación multiobjetivo desarrollado por el autor «promotion» sobre la base `meta-llama/Llama-3.1-8B-Instruct`. Aplica la variante Uniform-INPO (Iterative Nash Policy Optimization) sobre el panel de evaluación TL;DR, donde cuatro objetivos —coverage, faithfulness, conciseness y helpfulness— se agregan mediante una regla uniforme (media aritmética de las preferencias). El modelo se entrena con un presupuesto fijo de 300 pasos, compartiendo pool de respuestas, optimizador y política de referencia con otros brazos del mismo panel, de modo que cualquier diferencia de rendimiento es atribuible exclusivamente a la regla de agregación.

La relevancia de este modelo es principalmente investigadora: permite estudiar cómo distintas reglas de agregación de preferencias afectan al equilibrio de Nash en optimización de políticas iterativa, un problema central en alineación de modelos de lenguaje. No está pensado como un modelo de propósito general para producción, sino como un artefacto experimental dentro de un estudio controlado. Su arquitectura es la de un transformer decoder de 8.030 millones de parámetros, heredada de Llama 3.1 Instruct, con una ventana de contexto no especificada en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, fp32/fp16 probable) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `meta-llama/Llama-3.1-8B-Instruct`, que actúa simultáneamente como política de referencia (µ) y como inicialización (π₀). La arquitectura es, por tanto, la de un transformer decoder con atención causal estándar, 8B parámetros y las mismas capas, cabezas y dimensiones que Llama 3.1 8B. No se introducen modificaciones estructurales; el cambio reside en el procedimiento de entrenamiento.

El entrenamiento sigue el esquema Uniform-INPO: en cada iteración, se muestrean respuestas de un pool compartido y se puntúan mediante un oráculo de preferencias `Qwen3-32B` prompteado, que evalúa cada par de respuestas en ambos órdenes de presentación y promedia los resultados (swap-averaging) para reducir sesgos posicionales. Los cuatro objetivos se combinan con pesos uniformes (media aritmética) para formar una única señal de preferencia, sobre la que se aplica optimización de política iterativa tipo Nash. El presupuesto total es de 300 pasos, idéntico al de los demás brazos del panel, lo que garantiza comparabilidad. No se detalla el dataset de entrenamiento más allá del panel TL;DR, ni se menciona el uso de RLHF o DPO clásico; se trata de una variante de optimización de preferencias directa sobre un oráculo externo.

## Capacidades

- Generación de texto y razonamiento heredados de Llama 3.1 Instruct (capacidad base no verificada de forma independiente en este modelo).
- Alineación multiobjetivo con agregación uniforme de cuatro criterios: cobertura, fidelidad, concisión y utilidad.
- Optimización de preferencias mediante INPO iterativo, con evaluación por oráculo externo.
- No se documenta soporte explícito para tool calling, agentes o modos de razonamiento extendido.
- No se especifican capacidades multilingües ni de visión/audio.

## Casos de uso

- Investigación en alineación multiobjetivo: permite comparar el efecto de la agregación uniforme frente a otras reglas (mínimo, media ponderada, etc.) en el equilibrio de Nash, usando el panel TL;DR como banco de pruebas controlado.
- Estudio de degradación de objetivos individuales: al reportar surplus negativos en cada métrica, sirve para analizar cómo el equilibrio uniforme sacrifica rendimiento en todos los ejes por igual.
- Evaluación de oráculos de preferencia: al usar `Qwen3-32B` como juez, puede emplearse para validar la consistencia de dicho oráculo en distintos órdenes de presentación.
- Fine-tuning posterior: al ser un checkpoint intermedio de un pipeline de alineación, puede servir como punto de partida para experimentos de continuación de entrenamiento con otras reglas de agregación.
- Generación de resúmenes TL;DR con equilibrio entre concisión y fidelidad, aunque con rendimiento inferior al modelo base según los datos publicados.
- Benchmark de métodos de optimización de preferencias: sus generaciones están disponibles en un dataset público para reproducir comparativas entre brazos del panel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente el excedente mantenido sobre la política de referencia en 100 prompts, con escala poblacional \(A_k = P_k - 1/2\), donde valores negativos indican una degradación respecto al modelo base:

| Objetivo | Surplus |
|---|---|
| coverage | -0.1025 |
| faithfulness | -0.1037 |
| conciseness | -0.0219 |
| helpfulness | -0.0994 |
| mínimo | -0.1037 |
| media | -0.0819 |

Estos datos muestran que el modelo, tras el entrenamiento con agregación uniforme, empeora en todos los objetivos evaluados en comparación con la referencia. Los intervalos bootstrap y las pruebas de significación por pares se detallan en el apéndice del paper asociado, no accesible desde la información proporcionada.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como estimación orientativa para un modelo de 8B parámetros en formato safetensors:

- VRAM estimada en fp16: ~16 GB (suficiente para una GPU como RTX 4090 o A100 40 GB).
- VRAM estimada en cuantización 8-bit: ~8-10 GB (compatible con RTX 3080/3090).
- VRAM estimada en cuantización 4-bit: ~5-6 GB (posible en GPUs de consumo como RTX 3060 12 GB).
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, siempre que se genere una versión cuantizada adecuada (el repo solo contiene safetensors sin cuantizar).
- Latencia y throughput: no disponibles; dependerán del backend y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (alineación multiobjetivo sobre Llama 3.1 8B). El propio autor publica otros brazos del mismo panel, como `promotion/Llama-3.1-8B-UniformINPO-baseline` (que usa una ponderación igual de los cuatro objetivos como control escalar), pero no se aportan métricas comparativas entre ellos en la documentación accesible. Por tanto, la comparativa queda limitada al modelo base `meta-llama/Llama-3.1-8B-Instruct`, frente al cual este modelo presenta un surplus negativo en todos los objetivos.

## Limitaciones y advertencias

- Rendimiento degradado respecto al modelo base: todos los surplus reportados son negativos, lo que indica que la alineación uniforme reduce la calidad en cada objetivo individual dentro del panel TL;DR.
- Sin datos de benchmarks estándar: no se puede evaluar su capacidad general en tareas de razonamiento, código o matemáticas.
- Sesgos heredados: al partir de Llama 3.1 Instruct, arrastra los sesgos y limitaciones de dicho modelo, no documentados aquí.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es inherente a los modelos de lenguaje generativos.
- Licencia restrictiva: la Llama 3.1 Community License impone condiciones para uso comercial y requiere aceptación de términos.
- Sin información sobre idiomas soportados ni longitud de contexto real tras el entrenamiento.
- Modelo experimental: no está diseñado para uso en producción sin una evaluación adicional exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-UniformINPO
- Dataset de generaciones de benchmark del panel: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo hermano (baseline uniforme): https://huggingface.co/promotion/Llama-3.1-8B-UniformINPO-baseline
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3

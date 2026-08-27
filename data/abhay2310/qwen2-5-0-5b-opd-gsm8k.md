# Abhay2310/qwen2.5-0.5b-opd-gsm8k

## Resumen

El modelo `Abhay2310/qwen2.5-0.5b-opd-gsm8k` es un experimento de destilación on-policy (OPD) que destila el modelo Qwen2.5-1.5B-Instruct en un estudiante Qwen2.5-0.5B-Instruct, utilizando exclusivamente el dataset GSM8K. El proyecto, desarrollado por Abhay2310, se centra en comprender el objetivo de destilación, sus limitaciones prácticas y sus modos de fallo, más que en optimizar una métrica de benchmark. El entrenamiento se realizó de extremo a extremo en una única GPU T4 gratuita de Colab.

El resultado principal es que el pass@1 del estudiante se mantuvo aproximadamente plano (pasó de 9.0% a 11.0% en GSM8K), mientras que su tasa de éxito any-of-4 cayó drásticamente (de 18.0% a 4.0%). Esto sugiere que el objetivo de KL inversa truncada estrechó la distribución de muestreo del estudiante, reduciendo su diversidad de salidas. El autor advierte explícitamente que estos resultados provienen de un único experimento con una sola semilla y 100 problemas, por lo que no deben interpretarse como una mejora fiable del modelo.

El modelo tiene 494 millones de parámetros, está licenciado bajo Apache 2.0 y está diseñado para generación de texto en inglés. Es relevante como caso de estudio sobre los riesgos de la destilación on-policy y la importancia de evaluar más allá del pass@1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso. El entrenamiento utiliza destilación on-policy (OPD), donde el estudiante genera sus propias trayectorias y el profesor (Qwen2.5-1.5B-Instruct) evalúa esas mismas trayectorias. El bucle de entrenamiento es: (1) muestrear una finalización de la política actual del estudiante sin gradiente, (2) realizar un pase forward del profesor sobre los tokens muestreados sin gradiente, (3) calcular la KL inversa truncada a nivel de token entre las distribuciones del estudiante y del profesor, y (4) propagar la pérdida a través del estudiante.

Con γ=0, la supervisión es local al token actual, sin propagar señales de recompensa futuras. No hay término REINFORCE ni recompensa explícita por resultado. El profesor proporciona una señal densa a nivel de token solo con pases forward. La pérdida se escribió directamente en PyTorch en lugar de configurarse mediante un trainer, con el objetivo de comprender el objetivo y sus restricciones prácticas. El entrenamiento se realizó en el dataset GSM8K, con evaluación fuera de dominio en SVAMP.

## Capacidades

- Generación de texto en inglés con formato conversacional (heredado del modelo base instruct).
- Razonamiento matemático básico: el modelo fue entrenado en GSM8K, por lo que puede resolver problemas aritméticos simples de varios pasos, aunque con precisión limitada (pass@1 de 11% en GSM8K).
- Generación de respuestas con formato: el modelo muestra una ligera mejora en el cumplimiento de formato (1.0% frente a 0.0% del base), aunque sigue siendo muy bajo.
- No se ha demostrado soporte para tool calling, function calling, agentes o razonamiento multi-paso fiable.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.

## Casos de uso

- Investigación académica sobre destilación: el modelo es un caso de estudio para analizar los efectos de la destilación on-policy en la diversidad de muestreo y la estabilidad del entrenamiento. Los investigadores pueden reproducir el experimento y comparar métricas como pass@1 frente a any-of-4.
- Evaluación de métricas de calidad: sirve para demostrar que el pass@1 por sí solo puede ocultar cambios sustanciales en el comportamiento muestreado. Útil para desarrollar mejores protocolos de evaluación de modelos destilados.
- Educación en IA: el código y la metodología documentada permiten a estudiantes aprender sobre destilación on-policy, KL inversa y los desafíos del entrenamiento con recursos limitados (una GPU T4 gratuita).
- Experimentos de diagnóstico de colapso de diversidad: el modelo muestra un caso claro de estrechamiento de la distribución de salidas, útil para estudiar el fenómeno de colapso de diversidad en modelos de lenguaje.
- Benchmark de referencia para destilación con recursos limitados: el proyecto demuestra que es posible ejecutar un experimento de destilación on-policy completo en hardware gratuito, sirviendo como punto de partida para optimizaciones.
- Análisis de estabilidad de entrenamiento: el colapso del entrenamiento documentado (KL hacia cero, longitud de finalización hacia el límite, precisión hacia cero) proporciona un caso real para estudiar modos de fallo en RL/OPD.

## Benchmarks y rendimiento

Los resultados provienen de un único experimento con una semilla y 100 problemas para evaluación greedy, y 50 problemas con cuatro muestras para any-of-4. El autor advierte que no son afirmaciones de benchmark, sino resultados empíricos de una sola ejecución.

| Metrica | Estudiante base | Estudiante OPD | Profesor (1.5B) |
| :--- | ---: | ---: | ---: |
| GSM8K pass@1 | 9.0% | 11.0% | 17.0% |
| SVAMP pass@1 (fuera de dominio) | 40.0% | 35.0% | 57.0% |
| GSM8K any-of-4 success | 18.0% | 4.0% | — |
| Cumplimiento de formato | 0.0% | 1.0% | — |
| Longitud media de finalizacion | 189 tokens | 168 tokens | — |

El autor señala que las diferencias en pass@1 no son interpretables dado el tamaño de la evaluación (incertidumbre alta con 100 problemas). El resultado any-of-4 es la señal diagnóstica más interesante: la caída del 18% al 4% sugiere un colapso de diversidad, pero se necesita una evaluación más amplia, más semillas y métricas de diversidad explícitas para establecer esa conclusión.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.5B, requiere aproximadamente 1-2 GB de VRAM en FP16, y menos de 1 GB en cuantizaciones de 4 bits (si estuvieran disponibles).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente. Una T4 de Colab gratuita es más que suficiente.
- Cabe en GPU consumer: sí, es un modelo muy pequeño que puede ejecutarse incluso en CPU con llama.cpp.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints (el repo es compatible con text-generation-inference).
- Latencia y throughput: no se han publicado mediciones, pero para un modelo de 0.5B se espera una latencia de decenas de milisegundos por token en GPU moderna y throughput alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K pass@1 | Licencia |
|---|---|---|---|---|
| Abhay2310/qwen2.5-0.5b-opd-gsm8k | 0.5B | 32K (base) | 11.0% | Apache 2.0 |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | 9.0% (segun este experimento) | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct (profesor) | 1.5B | 32K | 17.0% (segun este experimento) | Apache 2.0 |

La comparativa se limita a los modelos involucrados en el experimento, ya que no se dispone de datos de otros modelos destilados comparables en la informacion proporcionada. El modelo OPD muestra una ligera mejora en GSM8K pass@1 frente a su base, pero una caida significativa en diversidad de muestreo.

## Limitaciones y advertencias

- Resultados no concluyentes: el experimento usa una sola semilla, 100 problemas para pass@1 y 50 para any-of-4. Las diferencias en pass@1 no son estadisticamente significativas.
- Colapso de diversidad: la tasa any-of-4 cayo del 18% al 4%, lo que sugiere que el objetivo de KL inversa estrecho la distribucion de muestreo del estudiante. Esto puede ser un problema grave para aplicaciones que requieren diversidad de respuestas.
- Inestabilidad de entrenamiento: el entrenamiento entro en un estado degenerado (KL hacia cero, longitud hacia el limite, precision hacia cero, salidas degradadas a tokens repetidos). El checkpoint publicado es del paso 20, antes del colapso.
- Sin soporte multilingue: el modelo solo declara ingles.
- Sin tool calling ni capacidades de agente: no se ha demostrado soporte para function calling o razonamiento multi-paso fiable.
- Riesgo de alucinacion: como cualquier modelo pequeno, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento matematico.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo es un experimento de investigacion y no se recomienda para produccion sin una evaluacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhay2310/qwen2.5-0.5b-opd-gsm8k
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- PDF del informe tecnico: https://arxiv.org/pdf/2412.15115v2
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5

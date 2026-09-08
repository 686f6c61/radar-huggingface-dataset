# Hooshaai/svd-linear-attention-gpt2-come

## Resumen

El modelo Hooshaai/svd-linear-attention-gpt2-come es un experimento de investigación desarrollado por Hoosha AI que aplica el método CoMe (Context-Aware Low-Rank Memory Bridge) para comprimir un modelo GPT-2 y evaluar su rendimiento en la tarea de clasificación de texto SST-2 del conjunto GLUE. El objetivo de CoMe es reducir el consumo de memoria durante el procesamiento de contextos largos, descomponiendo las proyecciones de clave-valor y las representaciones feedforward en un puente de memoria de bajo rango. El modelo se presenta como un clasificador de texto (pipeline de HuggingFace: text-classification) y solo soporta inglés. Su relevancia radica en explorar técnicas de compresión de atención eficiente, aunque el rendimiento reportado es modesto: una exactitud de validación del 73,17% y un ratio de compresión de 1,2677. No se especifican el número de parámetros ni la longitud de contexto en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 con módulo CoMe (Context-Aware Low-Rank Memory Bridge) para compresión de memoria; el tag sugiere atención lineal basada en SVD |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo base es GPT-2, sobre el que se aplica el método CoMe. Según la documentación, CoMe comprime el consumo de memoria de los transformadores mediante un puente de memoria de bajo rango entre las representaciones KV persistentes y los espacios de proyección intermedios. La formulación matemática utiliza una descomposición en valores singulares (SVD) para construir un puente W_bridge = U_r Σ_r V_r^T, con un error residual controlado por una restricción de proyección acotada. El código fuente también describe una variante de CoMe basada en eliminación de capas (layer shedding) y adaptadores de interpolación aprendibles entre capas no consecutivas. Los pesos del modelo fueron comprimidos y posteriormente ajustados con un fine-tuning de recuperación (recovery_steps=50) sobre GLUE SST-2. No se proporcionan detalles sobre el dataset de preentrenamiento ni el número de tokens.

## Capacidades

- Clasificación de texto en inglés, específicamente para la tarea SST-2 (análisis de sentimiento).
- Compresión de memoria KV para reducir el consumo de VRAM en inferencia.
- No soporta generación de texto libre, tool calling, agentes ni capacidades multimodales.
- No se documenta soporte para decodificación especulativa ni otras técnicas de eficiencia.
- El modelo es un experimento de investigación; no está pensado para uso general.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar el impacto del método CoMe en la precisión de clasificación y el consumo de memoria.
- Evaluación de técnicas de compresión de KV cache: sirve como referencia para comparar CoMe con otros métodos de compresión en modelos GPT-2.
- Prototipado de sistemas de atención eficiente: el modelo puede usarse como base para experimentos con atención lineal y reducción de memoria.
- Clasificación de sentimiento en inglés en entornos con recursos limitados: su bajo consumo de VRAM (332 MB) lo hace adecuado para pruebas en hardware modesto.
- Docencia o demostración de técnicas de compresión: útil para ilustrar conceptos de puentes de bajo rango y ajuste fino de recuperación.
- Benchmark de eficiencia en tareas de clasificación: permite medir tiempos de evaluación y pico de VRAM en condiciones controladas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Validation Accuracy (SST-2) | 73,17% |
| F1 Score | 0,7776 |
| Compression Ratio | 1,2677 |
| Peak GPU VRAM | 332,05 MB |
| Pure Eval Time | 13,82 s |

Resultados reportados por el autor con recovery_steps=50. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM pico reportada: 332,05 MB durante la evaluación.
- No se especifican requisitos mínimos de GPU; dado el consumo, es plausible que se ejecute en GPUs de gama baja.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.).
- El tiempo de evaluación reportado es de 13,82 s, pero no se indica el hardware utilizado.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible. El modelo es un experimento de compresión sobre GPT-2, pero no hay datos de rendimiento del GPT-2 original ni de otras alternativas para contextualizar los resultados.

## Limitaciones y advertencias

- Modelo experimental de investigación; no apto para producción.
- Solo soporta clasificación de texto en inglés; no es un modelo generativo.
- Rendimiento degradado: la exactitud de 73,17% en SST-2 es baja en comparación con un GPT-2 sin comprimir ajustado en la misma tarea.
- El ratio de compresión es modesto (1,2677), lo que limita su utilidad práctica.
- No se documentan sesgos específicos, pero al ser un modelo basado en GPT-2 puede heredar sesgos del modelo original.
- La licencia MIT permite uso comercial, pero no hay garantías de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-gpt2-come
- Hoosha AI (sitio oficial): https://hooshaai.github.io/
- Hoosha AI (Substack): https://hooshaai.substack.com/

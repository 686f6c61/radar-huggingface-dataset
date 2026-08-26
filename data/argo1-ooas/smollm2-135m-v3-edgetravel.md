# Argo1-OOAS/SmolLM2-135M-V3-EdgeTravel

## Resumen

SmolLM2-135M V3 EdgeTravel es un modelo experimental de lenguaje desarrollado por Argo1-OOAS que parte del modelo base HuggingFaceTB/SmolLM2-135M-Instruct y añade una rama adaptativa entrenada de 1.328.257 parámetros. Esta rama analiza los cambios entre activaciones ocultas consecutivas (edges), acumula su magnitud (travel) y utiliza esa trayectoria para ajustar las distribuciones de los tokens siguientes, permitiendo un control condicionado por palabras de activación (triggers) y contexto opcional. El modelo está pensado como un experimento de arquitectura, no como un asistente de producción, y se distribuye bajo licencia Apache 2.0.

Con un total de 164.154.816 parámetros según el checkpoint safetensors (135.843.265 parámetros únicos del modelo base más 1.328.257 de la rama entrenada), una longitud de contexto de 8.192 tokens y soporte únicamente en inglés, el modelo destaca por su naturaleza ligera y su enfoque en la investigación de mecanismos de control de activaciones. Aunque no se han publicado benchmarks estandarizados, el autor reporta una pérdida de validación terminal de 1.1849 (perplejidad 3,3) para el objetivo de la rama, un valor que no debe interpretarse como un rendimiento lingüístico general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (SmolLM2-135M) con rama adaptativa edge/travel |
| Parámetros totales | 164.154.816 (checkpoint safetensors) |
| Parámetros activos | No es un modelo MoE; parámetros únicos: 135.843.265 + 1.328.257 de la rama |
| Longitud de contexto | 8.192 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo congela el modelo base SmolLM2-135M-Instruct y entrena únicamente una rama de 1.328.257 parámetros. Esta rama mide las diferencias entre filas ocultas consecutivas (edges) y acumula sus magnitudes (travel) para construir una trayectoria que modifica las distribuciones de tokens seleccionadas. El entrenamiento se realizó sobre el dataset HuggingFaceTB/smol-smoltalk, completando 2.000 actualizaciones de rama y 262.144.000 presentaciones de tokens. El autor reporta una pérdida de validación terminal de 1,1849 (perplejidad 3,3) para el objetivo de la rama, pero aclara que no se trata de un benchmark estándar de lenguaje. No se especifican detalles adicionales como el método de optimización o la composición exacta del dataset.

## Capacidades

- Generación de texto condicionada por palabras de activación (triggers) y contexto opcional, controlada mediante una interfaz de comparación.
- Adaptación dinámica de las distribuciones de tokens basada en la trayectoria de activaciones.
- Soporte limitado de razonamiento, heredado del modelo base SmolLM2-135M-Instruct.
- Capacidad multilingüe: solo inglés.
- No soporta tool calling, visión, audio ni modos de pensamiento avanzado.
- Capacidad especial: adaptación de activaciones en tiempo real mediante la rama edge/travel.

## Casos de uso

- Investigación en adaptación de activaciones: el modelo permite estudiar cómo las variaciones en las capas ocultas afectan a la generación, siendo útil para experimentos de interpretabilidad.
- Experimentación con control de generación por triggers: se pueden activar palabras o frases para modificar el estilo o contenido de la salida, aunque con resultados variables.
- Pruebas de estabilidad de la fluidez: evaluar cómo la rama adaptativa puede degradar o mejorar la coherencia del texto en escenarios de bucles.
- Desarrollo de modelos de bajo coste: al tener solo 135M de parámetros base, sirve como banco de pruebas para técnicas de ajuste fino de baja escala.
- Estudio de la pérdida de validación y la perplejidad en modelos pequeños: comparar el comportamiento de la rama con el modelo base.
- Uso en entornos de investigación académica: dado su carácter experimental y licencia permisiva, puede integrarse en proyectos de investigación sobre dinámicas de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es la pérdida de validación terminal de 1,1849 (PPL 3,3) para el objetivo de la rama, que no es comparable con métricas convencionales de evaluación de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,0 GB con pesos en FP32, menos con cuantización (no disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 3060) o CPU con ~4 GB de RAM.
- En consumer GPU: sí, cabe en tarjetas de gama baja y media.
- Opciones de despliegue: requiere el código PyTorch nativo del repositorio; no se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera inferencia rápida en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|
| SmolLM2-135M-Instruct (base) | 135M | 8.192 | Apache 2.0 | Transformer estándar |
| SmolLM2-135M-V3-EdgeTravel (este modelo) | 135M + rama 1.328.257 | 8.192 | Apache 2.0 | Transformer con rama adaptativa |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache 2.0 | Transformer estándar |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparación se limita a parámetros, contexto y licencia. El modelo EdgeTravel es una modificación experimental sobre el base, por lo que no se espera que supere el rendimiento del base en tareas estándar.

## Limitaciones y advertencias

- Es un experimento de arquitectura, no un asistente de producción; la guía del trigger puede ser demasiado débil para redirigir el texto o demasiado fuerte, dañando la fluidez y provocando bucles.
- No se ha realizado una evaluación integral de capacidades ni de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje, sin mitigaciones adicionales.
- Soporte únicamente en inglés; no se contempla multilingüismo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni responsabilidad.
- El código de inferencia requiere la implementación PyTorch específica del repositorio; no es compatible con frameworks estándar de despliegue sin adaptaciones.

## Enlaces

- [HuggingFace: Argo1-OOAS/SmolLM2-135M-V3-EdgeTravel](https://huggingface.co/Argo1-OOAS/SmolLM2-135M-V3-EdgeTravel)
- [GitHub – huggingface/smollm](https://github.com/huggingface/smollm) (repositorio de la familia SmolLM)
- [Modelo base: HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Documento de investigación (research_paper.pdf) – no disponible en el repositorio](no disponible)

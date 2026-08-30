# promotion/Llama-3.1-8B-Utilitarian-baseline

## Resumen

El modelo `promotion/Llama-3.1-8B-Utilitarian-baseline` es un ajuste fino de `meta-llama/Llama-3.1-8B-Instruct` orientado a la alineación multiobjetivo. Ha sido desarrollado por el usuario "promotion" como parte de un estudio sobre métodos de agregación de preferencias en optimización de modelos de lenguaje. Su propósito concreto es servir como línea base utilitarista: pondera por igual cuatro objetivos (seguimiento de instrucciones, veracidad, honestidad y utilidad) y los agrega mediante una suma ponderada fija, lo que constituye el control natural de escalarización frente a reglas de negociación.

El modelo se entrena desde el instruct de Llama 3.1 de 8B parámetros, que actúa simultáneamente como política de referencia y como inicialización. Las cuatro objetivos se puntúan sobre prompts de UltraFeedback mediante un oráculo de preferencias `Qwen3-32B`, con cada par consultado en ambos órdenes de presentación y promediado por intercambio. El entrenamiento utiliza un presupuesto de 300 pasos y un único optimizador, diferenciándose de otros brazos del estudio solo en la forma de agregar los objetivos. Su relevancia radica en proporcionar un punto de comparación empírico para evaluar soluciones de negociación (como la del modelo `promotion/Llama-3.1-8B-NBPO-600step`) en un escenario controlado.

En cuanto a arquitectura, se trata de un transformer decoder-only con 8.030 millones de parámetros, heredado del modelo base. No se especifica la longitud de contexto en la documentación del autor, aunque el modelo base soporta hasta 128K tokens. El repositorio contiene pesos en formato safetensors y ocupa 32,1 GB, lo que sugiere una precisión de 16 bits (fp16) o similar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 128K) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar en el repo) |
| Idiomas soportados | No disponible (hereda los del modelo base, pero no se especifica) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura original de Llama 3.1 8B Instruct: un transformer decoder-only con normalización RMS, atención con máscara causal y embeddings rotatorios (RoPE). No introduce cambios arquitectónicos; el entrenamiento se centra en la capa de alineación mediante optimización de preferencias multiobjetivo.

El procedimiento de entrenamiento evalúa cuatro objetivos —seguimiento de instrucciones, veracidad, honestidad y utilidad— sobre prompts de UltraFeedback. Un oráculo `Qwen3-32B` puntúa cada par de respuestas en ambos órdenes y se promedia el resultado para eliminar sesgos posicionales. La agregación utilitarista asigna un peso fijo e igual a cada objetivo y combina las señales de preferencia en una única recompensa escalar. El entrenamiento se realiza con un presupuesto de 300 pasos, un único optimizador y el mismo conjunto de pares para todos los brazos del estudio, lo que permite aislar el efecto del método de agregación. No se menciona el uso de RLHF clásico ni DPO; se trata de una variante de optimización de preferencias con oráculo externo.

## Capacidades

- Generación de texto y diálogo: al estar basado en Llama 3.1 Instruct, hereda las capacidades generales de generación, razonamiento y seguimiento de instrucciones del modelo original.
- Razonamiento multi-paso y resolución de problemas: soportado por el modelo base, aunque no se han publicado evaluaciones específicas para este ajuste.
- Generación de código: el modelo base tiene competencias en lenguajes de programación, pero no se han medido en este fine-tune.
- Soporte multilingüe: el base de Llama 3.1 soporta ocho idiomas, pero no se confirma que este ajuste mantenga el mismo rendimiento en todos ellos.
- Alineación multiobjetivo: el entrenamiento específico busca mejorar simultáneamente cuatro objetivos; según los datos del autor, el modelo muestra un surplus negativo en tres de ellos (seguimiento de instrucciones -0,0639, veracidad -0,0765, honestidad -0,0705) y positivo en utilidad (+0,0268).
- No se documentan capacidades especiales como tool calling, modo pensamiento, visión o audio; el modelo es puramente textual.

## Casos de uso

- Investigación en alineación de modelos: sirve como baseline utilitarista para comparar métodos de agregación de preferencias, como reglas de negociación o maximización de entropía. Los investigadores pueden reproducir el estudio y contrastar resultados sobre el mismo panel de prompts.
- Evaluación de métodos de optimización multiobjetivo: permite estudiar el equilibrio entre objetivos en conflicto y analizar cómo distintas agregaciones afectan al rendimiento final.
- Comparación de políticas de referencia: al compartir inicialización y presupuesto de entrenamiento con otros brazos, es útil para aislar el efecto de la función de agregación en experimentos controlados.
- Análisis de sesgos en preferencias: el oráculo Qwen3-32B introduce un sesgo de modelo evaluador; este modelo puede usarse para estudiar cómo dicho sesgo se propaga a la política final.
- Reproducibilidad académica: al estar disponible en Hugging Face con pesos safetensors, permite replicar los experimentos del autor y verificar las métricas reportadas.
- Desarrollo de pipelines de alineación personalizados: aunque no está pensado para producción, puede servir como punto de partida para experimentar con técnicas de bargaining o escalarización en entornos de investigación.

## Benchmarks y rendimiento

El autor reporta resultados sobre un panel de evaluación propio de 657 prompts, midiendo el surplus (diferencia) frente a la política de referencia en cada objetivo. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K para este ajuste concreto.

| Objetivo | Surplus sobre referencia |
|---|---|
| Seguimiento de instrucciones | -0,0639 |
| Veracidad | -0,0765 |
| Honestidad | -0,0705 |
| Utilidad | +0,0268 |
| **Mínimo** | -0,0765 |

En comparación, el autor indica que la solución de negociación del modelo `promotion/Llama-3.1-8B-NBPO-600step` alcanza un mínimo de +0,0391 en el mismo panel, lo que muestra una clara ventaja del método de bargaining frente a la agregación utilitarista en este escenario.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en fp16 requiere aproximadamente 16 GB de VRAM. Con cuantización int8 se reduce a ~8 GB y con int4 a ~4 GB, aunque no se proporcionan versiones cuantizadas oficiales.
- GPUs recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para fp16; una A100 (40/80 GB) permite mayor margen y procesamiento por lotes. Para cuantización int4, tarjetas con 8 GB o más pueden ser suficientes.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs consumer de gama alta (RTX 3080/3090/4090) con cuantización adecuada.
- Opciones de despliegue: al ser un modelo estándar de Llama, se puede servir con vLLM, llama.cpp, Ollama, TGI o Hugging Face Inference Endpoints. No se requiere infraestructura especial.
- Latencia y throughput: no se han publicado mediciones específicas para este ajuste. Para un modelo de 8B en una GPU moderna, se esperan decenas de tokens por segundo en fp16 y mayores con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo de alineación | Surplus mínimo (panel 657) | Licencia |
|---|---|---|---|---|---|
| `promotion/Llama-3.1-8B-Utilitarian-baseline` | 8,03B | No disponible | Agregación utilitarista (pesos iguales) | -0,0765 | Llama 3.1 |
| `promotion/Llama-3.1-8B-NBPO-600step` | 8,03B | No disponible | Solución de negociación (bargaining) | +0,0391 | Llama 3.1 |
| `promotion/Llama-3.1-8B-PROSPER-baseline` | 8,03B | No disponible | PROSPER / MaxEntBW (peor objetivo) | No disponible | Llama 3.1 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K | Alineación estándar (RLHF) | Referencia | Llama 3.1 |

Los tres primeros modelos comparten la misma base, inicialización y presupuesto de entrenamiento; la diferencia radica exclusivamente en la función de agregación de objetivos. El modelo utilitarista es el peor en términos de mínima mejora, lo que refuerza la hipótesis del autor de que la negociación supera a la escalarización fija en este contexto.

## Limitaciones y advertencias

- Es un modelo de investigación: no ha sido validado para uso en producción y no se recomienda su despliegue en aplicaciones críticas sin una evaluación exhaustiva.
- Rendimiento degradado en tres de los cuatro objetivos: el surplus negativo en seguimiento de instrucciones, veracidad y honestidad indica que el modelo empeora respecto al base en esas dimensiones, lo que puede afectar a la calidad de las respuestas en tareas que dependan de esos aspectos.
- Sesgo del oráculo evaluador: las puntuaciones provienen de un modelo Qwen3-32B, que puede introducir sesgos propios en la valoración de preferencias.
- Sin datos de benchmarks estándar: no se han publicado resultados en MMLU, HumanEval u otros, por lo que no se puede comparar su rendimiento general con otros modelos.
- Licencia Llama 3.1: el uso comercial está sujeto a los términos de la licencia de Meta, que incluyen restricciones para empresas con más de 700 millones de usuarios mensuales.
- Idiomas y contexto no especificados: aunque el base soporta varios idiomas y 128K de contexto, no se ha confirmado que este ajuste mantenga esas capacidades íntegras.
- Sin cuantizaciones oficiales: el repositorio solo contiene pesos en safetensors sin cuantizar; los usuarios deben aplicar su propia cuantización si necesitan reducir el uso de memoria.
- Repositorio sin actividad: cero descargas y cero likes en la fecha de creación (agosto de 2026), lo que sugiere que es un artefacto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/promotion/Llama-3.1-8B-Utilitarian-baseline
- Modelo comparativo NBPO: https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step
- Modelo comparativo PROSPER: https://huggingface.co/promotion/Llama-3.1-8B-PROSPER-baseline
- Generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Página oficial de Llama 3 en Meta: https://developer.meta.com/ai/models/llama-3/
- Ficha de Llama 3.1 8B en Skytells: https://skytells.ai/model/llama-3.1-8b
- Catálogo de Microsoft Foundry Models: https://ai.azure.com/catalog/models/Meta-Llama-3.1-8B

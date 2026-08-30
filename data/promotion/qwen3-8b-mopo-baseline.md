# promotion/Qwen3-8B-MOPO-baseline

## Resumen

`promotion/Qwen3-8B-MOPO-baseline` es un modelo de investigación desarrollado por el usuario `promotion`, que parte del modelo base `Qwen/Qwen3-8B` (8.190 millones de parámetros) y lo entrena con una variante de optimización multi-objetivo de preferencias denominada MOPO (Multi-Objective Preference Optimization). Concretamente, este checkpoint es la "baseline" del método, que utiliza *importance-weighted behaviour cloning* con multiplicadores de barrera logarítmica, y se publica como punto de comparación frente al método principal NBPO (Nash Bargaining Preference Optimization) del mismo autor.

El modelo está pensado para la investigación en alineación multi-objetivo: evalúa cómo se comporta un modelo cuando se optimizan simultáneamente cuatro objetivos (utilidad, veracidad, honestidad y seguimiento de instrucciones) mediante una agregación simple de tipo "baseline". No es un modelo de propósito general para producción, sino una pieza de un estudio comparativo. Su relevancia radica en que permite contrastar estrategias de agregación de preferencias y medir el superávit (surplus) sobre la política de referencia en un panel de evaluación controlado.

La arquitectura es la de Qwen3-8B, un transformer denso con soporte de modos de pensamiento híbrido (thinking y non-thinking). El entrenamiento requiere un tokenizador específico incluido en el repositorio, ya que la plantilla de chat debe emitir un bloque vacío de *thinking* para que el modelo responda directamente. La licencia declarada en los metadatos es Apache 2.0, aunque la model card indica que se libera bajo la licencia de Qwen3 (que también es Apache 2.0, pero conviene verificar la redacción exacta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con modos thinking y non-thinking |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B, típicamente 32 768 tokens, pero no confirmado en esta variante) |
| Tipos de cuantizacion | No disponible (repositorio solo con pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B, que soporta 119 idiomas y dialectos según documentación de Qwen3) |
| Licencia | Apache 2.0 (según metadatos); la model card indica "Released under the Qwen3 licence" |
| Formato de pesos | safetensors (tamaño del repo: 32,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B`, un transformer denso de 8 mil millones de parámetros con arquitectura estándar (atención por capas, feed-forward, normalización) y la capacidad de alternar entre modo de razonamiento (thinking) y modo directo (non-thinking) mediante un token especial en la plantilla de chat. Para este baseline, el entrenamiento se realiza con *importance-weighted behaviour cloning* con multiplicadores de barrera logarítmica, una técnica de optimización de preferencias que pondera las muestras según su importancia y usa barreras para mantener las restricciones de los objetivos.

El pipeline de entrenamiento exige que el prompt de generación sea un prefijo estricto de la conversación renderizada, y que la plantilla emita un bloque vacío de `thinking` de forma incondicional. Si no se usa el tokenizador incluido en el repositorio, el modelo tiende a razonar en voz alta y las generaciones quedan truncadas a mitad de la traza, lo que corrompe la señal de preferencia. El entrenamiento comparte un único pool de datos, un optimizador y el mismo presupuesto computacional para todas las variantes del estudio; solo cambia la forma de agregar los cuatro objetivos.

## Capacidades

- Generación de texto en lenguaje natural con respuestas directas (sin razonamiento explícito) gracias al bloque vacío de *thinking* en la plantilla.
- Alineación multi-objetivo: el modelo ha sido optimizado para equilibrar utilidad (helpfulness), veracidad (truthfulness), honestidad (honesty) y seguimiento de instrucciones (instruction following), aunque con resultados modestos en el panel de evaluación.
- Hereda las capacidades base de Qwen3-8B: comprensión y generación multilingüe (119 idiomas y dialectos según documentación de Qwen3), razonamiento, codificación y matemáticas, aunque este checkpoint específico no ha sido evaluado en esos benchmarks.
- No se ha documentado soporte explícito para tool calling, function calling o uso como agente en esta variante; la model card no menciona estas capacidades.
- El modo non-thinking está activado por defecto en la plantilla; el modo thinking se puede activar manualmente si se modifica la plantilla, pero no es el uso previsto.

## Casos de uso

- Investigación en alineación multi-objetivo: permite comparar estrategias de agregación de preferencias (baseline MOPO frente a NBPO) en un panel controlado de 100 prompts con un oráculo Qwen3-32B. Se usa para medir el superávit sobre la política de referencia en cada objetivo.
- Estudio de *importance-weighted behaviour cloning*: sirve como referencia para entender cómo afecta la ponderación de importancia y las barreras logarítmicas al equilibrio entre objetivos.
- Análisis de degradación de objetivos: al ser un baseline con superávit negativo en algunos objetivos, es útil para estudiar *trade-offs* y fallos de optimización multi-objetivo.
- Reproducibilidad de experimentos: el repositorio incluye el tokenizador necesario y las generaciones de todos los brazos en un dataset separado, lo que permite reproducir las evaluaciones y verificar los resultados.
- Comparación de métodos de preferencia: junto con el modelo NBPO, permite evaluar si la solución de negociación (bargaining) supera a la agregación lineal simple en términos de mínimo y promedio de superávit.
- No se recomienda su uso en aplicaciones de producción, pero puede servir como base para *fine-tuning* posterior si se desea explorar la alineación multi-objetivo en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La model card proporciona métricas de superávit sobre la política de referencia (`Qwen3-8B`), evaluadas a escala de población con 100 prompts y un oráculo `Qwen3-32B` con *swap-averaging*. Los resultados son los siguientes:

| Objetivo | Superávit |
|---|---|
| Utilidad (helpfulness) | -0,0017 |
| Veracidad (truthfulness) | -0,0007 |
| Honestidad (honesty) | -0,0046 |
| Seguimiento de instrucciones | +0,0012 |
| **Mínimo** | **-0,0046** |
| **Promedio** | **-0,0015** |

En comparación, el modelo NBPO del mismo autor alcanza un mínimo de +0,0180 y un promedio de +0,0408 en el mismo panel, lo que indica que el baseline MOPO es claramente inferior en este escenario de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión FP16: aproximadamente 16-18 GB (8,19 B parámetros × 2 bytes), más overhead de memoria para la ventana de contexto y el tokenizador.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) puede ejecutar el modelo en FP16 sin cuantización; para GPUs con 16 GB (como RTX 4080 o A4000) se necesitaría cuantización a 8 bits o 4 bits.
- En GPUs consumer, cabe en RTX 3090/4090 con cuantización GGUF de 4 bits (aproximadamente 5-6 GB de VRAM), pero no se han publicado cuantizaciones oficiales para este checkpoint.
- Opciones de despliegue: al ser un modelo de investigación, no se han probado integraciones con vLLM, llama.cpp u Ollama; se recomienda usar el código de HuggingFace Transformers con el tokenizador incluido.
- Latencia y throughput: no se han publicado mediciones específicas; como referencia, un modelo de 8B en FP16 en una RTX 4090 suele generar entre 20 y 50 tokens por segundo, pero esto depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `promotion/Qwen3-8B-MOPO-baseline` | 8,19 B | No disponible | MOPO baseline (importance-weighted BC) | Apache 2.0 (según metadatos) | HuggingFace |
| `promotion/Qwen3-8B-NBPO` | 8,19 B | No disponible | NBPO (solución de negociación) | Apache 2.0 (presumiblemente) | HuggingFace |
| `Qwen/Qwen3-8B` | 8,19 B | 32 768 tokens (documentado) | Modelo base sin alineación específica | Apache 2.0 | HuggingFace |

El modelo MOPO baseline es una variante experimental de Qwen3-8B. Frente al modelo base, incorpora un entrenamiento de alineación multi-objetivo que, según las métricas del panel, apenas mejora o incluso empeora ligeramente algunos objetivos (superávit negativo en utilidad, veracidad y honestidad). Frente al NBPO, que es el método propuesto por el mismo autor, el baseline es claramente inferior tanto en el mínimo como en el promedio del superávit. No se dispone de comparativas con otros modelos de 8B de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) porque no se han publicado resultados en benchmarks estándar.

## Limitaciones y advertencias

- Es un modelo de investigación, no un modelo de producción: no ha sido evaluado en tareas del mundo real ni sometido a pruebas de seguridad o robustez.
- El superávit negativo en utilidad, veracidad y honestidad indica que el baseline MOPO puede degradar el rendimiento en esos objetivos respecto al modelo base, lo que lo hace inadecuado para uso directo.
- La model card advierte explícitamente que sin el tokenizador incluido en el repositorio, el modelo razona en voz alta y las generaciones quedan truncadas, corrompiendo la señal de preferencia. Esto limita su uso fuera del pipeline original.
- No hay información sobre sesgos, alucinaciones o riesgos específicos; al derivar de Qwen3-8B, hereda los sesgos y limitaciones del modelo base, que no han sido documentados en esta variante.
- La licencia presenta ambigüedad: los metadatos indican Apache 2.0, pero la model card dice "Released under the Qwen3 licence". Aunque Qwen3 es Apache 2.0, conviene verificar la licencia exacta antes de cualquier uso comercial.
- No se han publicado cuantizaciones ni adaptaciones para frameworks de inferencia comunes (vLLM, llama.cpp, Ollama), lo que dificulta su despliegue fuera de Transformers.
- La evaluación se realizó con un único panel de 100 prompts y un oráculo específico (Qwen3-32B); los resultados pueden no generalizar a otros conjuntos de datos o configuraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen3-8B-MOPO-baseline
- Modelo NBPO (comparativa): https://huggingface.co/promotion/Qwen3-8B-NBPO
- Dataset de generaciones de evaluación: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Informe técnico de Qwen3 (arquitectura base): https://arxiv.org/html/2505.09388v1
- Documentación de Qwen3-8B en RobotsAtlas (capacidades base): https://robotsatlas.com/ai-models/qwen3-8b
- Ficha de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_8b

# promotion/Qwen3-8B-SurplusMaxmin-baseline

## Resumen

Qwen3-8B-SurplusMaxmin-baseline es un modelo de lenguaje de 8 000 millones de parámetros desarrollado por el usuario "promotion" como parte de una investigación sobre optimización de preferencias multi-objetivo mediante teoría de negociación (nash bargaining). Se trata de un baseline que aplica la regla egalitaria "surplus-maxmin": asigna todo el peso al objetivo con menor excedente (surplus) sobre la política de referencia, en contraste con la solución de negociación que se estudia en el artículo asociado.

El modelo parte del backbone Qwen3-8B, que actúa tanto como política de referencia como inicialización. El entrenamiento utiliza un pipeline de alineación multi-objetivo que evalúa cuatro dimensiones: utilidad (helpfulness), veracidad (truthfulness), honestidad (honesty) y seguimiento de instrucciones (instruction following). Los resultados reportados en la model card muestran un excedente mínimo de +0.0040 y un promedio de +0.0161 sobre la referencia, medidos con un oráculo Qwen3-32B sobre 100 prompts.

La relevancia de este modelo es principalmente investigadora: sirve como punto de comparación para evaluar soluciones de negociación (como SPPO u otros métodos) frente a la regla egalitaria. No está pensado como un modelo de producción, sino como un artefacto experimental dentro de un estudio académico. El repositorio incluye un tokenizer modificado que es imprescindible para su uso correcto, ya que el tokenizer estándar de Qwen3-8B provoca que el modelo razone en voz alta y corrompa la señal de preferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3-8B) |
| Parametros totales | 8 190 735 360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Qwen3-8B: 32 768 tokens nativos, hasta 131 072 con YaRN) |
| Tipos de cuantizacion | No disponible (repositorio con pesos safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B, que soporta multiples idiomas) |
| Licencia | Apache-2.0 (segun tags de HuggingFace) / Qwen3 License (segun model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-8B, sin modificaciones estructurales. El entrenamiento consiste en una optimizacion de preferencias multi-objetivo donde cada objetivo (utilidad, veracidad, honestidad y seguimiento de instrucciones) se evalúa mediante un oraculo externo (Qwen3-32B) sobre pares de respuestas. La regla surplus-maxmin asigna todo el peso de la actualizacion al objetivo cuyo excedente sobre la politica de referencia es menor, buscando maximizar el minimo de los excedentes.

El pipeline de entrenamiento requiere que el prompt de generacion sea un prefijo estricto de la conversacion renderizada, y que el template emita incondicionalmente un bloque vacio de `thinking` (segun el template de chat de Qwen3). Por eso el repositorio incluye un tokenizer propio que garantiza esta condicion; usar el tokenizer estandar de Qwen3-8B rompe el entrenamiento y la inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO; la model card solo menciona el metodo de optimizacion de preferencias.

## Capacidades

- Generacion de texto y dialogo multi-turno, heredadas del backbone Qwen3-8B.
- Razonamiento y modo "thinking" (aunque el template modificado emite un bloque vacio, el modelo puede razonar si se usa el tokenizer incorrecto, lo cual es indeseable).
- Capacidades multilingues heredadas de Qwen3-8B (no se detallan en la model card).
- Soporte de tool calling y function calling: no se menciona en la model card, pero el backbone Qwen3-8B las soporta; no hay confirmacion de que este fine-tune las preserve.
- Capacidades de agente y multi-step reasoning: no evaluadas en la informacion disponible.
- La model card no reporta capacidades especiales adicionales (vision, audio, etc.).

## Casos de uso

- Investigacion academica en alineacion multi-objetivo: el modelo sirve como baseline egalitario para comparar metodos de negociacion (nash bargaining, SPPO, etc.) en experimentos controlados. Se usaria junto con el dataset de generaciones `promotion/nbpo-benchmark-generations` para reproducir los resultados del articulo.
- Evaluacion de politicas de preferencia: permite medir el excedente de cada objetivo (utilidad, veracidad, honestidad, seguimiento de instrucciones) frente a una politica de referencia, util para estudios de trade-offs entre objetivos.
- Analisis de comportamiento de modelos alineados: al ser un baseline extremo (todo el peso en el objetivo con menor excedente), es util para estudiar como se comporta un modelo cuando se prioriza la dimension mas debil.
- Desarrollo de tokenizers y templates para entrenamiento de preferencias: el tokenizer modificado incluido es un ejemplo de como adaptar el template de Qwen3 para pipelines de optimizacion de preferencias.
- Comparacion de metodos de alineacion: se puede usar como punto de referencia en benchmarks de alineacion multi-objetivo, junto con otros modelos entrenados con SPPO u otras variantes.
- Reproducibilidad de experimentos: dado que el modelo y el dataset de generaciones estan publicados, permite a otros investigadores replicar los resultados del articulo y verificar las metricas de surplus.

## Benchmarks y rendimiento

La model card no reporta benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona el excedente (surplus) sobre la politica de referencia para cada objetivo, medido a escala de poblacion con 100 prompts y un oraculo Qwen3-32B, promediado sobre ambos ordenes de presentacion:

| Objetivo | Excedente |
|---|---|
| Utilidad (helpfulness) | +0.0375 |
| Veracidad (truthfulness) | +0.0040 |
| Honestidad (honesty) | +0.0144 |
| Seguimiento de instrucciones | +0.0086 |
| **Minimo** | +0.0040 |
| **Promedio** | +0.0161 |

No se dispone de datos de rendimiento en tareas clasicas de NLP ni de comparacion con otros modelos en dichos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8 000 millones de parametros, en precision BF16/FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion INT4 (no disponible en el repositorio, pero posible con herramientas externas) se reduciria a unos 5-6 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16. GPUs con 16 GB (como RTX 4080) podrian funcionar con optimizaciones de memoria.
- En consumer GPU: cabe en RTX 4090 y RTX 3090 en BF16; en GPUs de 8-12 GB solo con cuantizacion (no proporcionada por el autor).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo si se convierte a los formatos adecuados (GGUF, AWQ, etc.). No se proporcionan archivos de cuantizacion en el repositorio.
- Latencia y throughput: no se han publicado datos. Como referencia, Qwen3-8B en una A100 suele generar entre 50 y 100 tokens/s en BF16, pero esto no esta confirmado para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-SurplusMaxmin-baseline (este) | 8.19B | No disponible (heredado de Qwen3-8B) | Apache-2.0 (tag) / Qwen3 License (model card) | Baseline egalitario para alineacion multi-objetivo |
| Qwen3-8B (base) | 8.19B | 32k nativo, 131k con YaRN | Qwen License | Modelo base sin fine-tune de preferencias |
| Qwen3-8B-Instruct | 8.19B | 32k nativo, 131k con YaRN | Qwen License | Version instruida con RLHF, orientada a produccion |

No se dispone de datos de rendimiento comparativo en benchmarks estandar entre estos modelos. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El tokenizer incluido en el repositorio es obligatorio: usar el tokenizer estandar de Qwen3-8B provoca que el modelo razone en voz alta y la mayoria de las generaciones terminen dentro del trace de razonamiento, corrompiendo la señal de preferencia y produciendo salidas inutilizables.
- Es un modelo de investigacion, no un modelo de produccion. No se ha evaluado su robustez, seguridad ni sesgos en escenarios reales.
- La licencia es ambigua: los tags de HuggingFace indican Apache-2.0, pero la model card afirma "Released under the Qwen3 licence". La licencia Qwen3 no es Apache-2.0 e impone restricciones adicionales (por ejemplo, limitaciones de uso comercial en ciertos casos). Se recomienda verificar la licencia aplicable antes de cualquier uso.
- No se han publicado evaluaciones de sesgos, alucinaciones ni toxicidad. No hay garantias de comportamiento seguro en entornos no controlados.
- La longitud de contexto no esta confirmada para este fine-tune; aunque el backbone soporta 32k nativos, el entrenamiento con el template modificado podria haber alterado la capacidad de manejar contextos largos.
- El modelo solo ha sido evaluado con 100 prompts y un oraculo especifico (Qwen3-32B); los resultados de surplus pueden no generalizar a otros dominios o distribuciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/promotion/Qwen3-8B-SurplusMaxmin-baseline
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Qwen3-8B-Base (README): https://huggingface.co/Qwen/Qwen3-8B-Base/blob/main/README.md

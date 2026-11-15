# huggingtime12/Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU-COMET

## Resumen

`huggingtime12/Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU-COMET` es un adaptador LoRA publicado por el usuario `huggingtime12` sobre el modelo base `Qwen/Qwen3-1.7B`. Se trata por tanto de un fine-tuning parametrizado eficientemente (PEFT) y no de un modelo completo: el repositorio contiene unicamente los pesos del adaptador en formato safetensors, con un tamano de 0,3 GB, y requiere cargar el modelo base de Qwen para funcionar.

El nombre del repositorio sugiere una receta de entrenamiento con GRPO (Group Relative Policy Optimization) sobre datos de traduccion automatica, dado que menciona PhoMT (un corpus publico de traduccion chino-vietnamita) y las metricas BLEU y COMET como senal de recompensa. El tag `noSFT` indica que el ajuste se realizo directamente con RL sin una fase previa de supervised fine-tuning. Esta combinacion es poco habitual y resulta relevante para investigadores interesados en alineamiento por refuerzo sobre modelos pequenos y en la optimizacion directa de metricas de traduccion.

El modelo base Qwen3-1.7B pertenece a la familia Qwen3 de Alibaba, con arquitectura transformer densa y modo de razonamiento hibrido. Sin embargo, la model card del adaptador es una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparametros, resultados ni limitaciones. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | 1,7 mil millones (modelo base); adaptador LoRA de tamano no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | no disponible (el nombre sugiere chino-vietnamita por PhoMT, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.18.0, transformers, trl |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 0,3 GB |
| Metodo de entrenamiento | GRPO con LoRA, sin SFT previo (`noSFT`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que modifica las matrices de proyeccion del transformer Qwen3-1.7B. El modelo base es un transformer decoder-only denso de 1,7 mil millones de parametros, disenado por el equipo Qwen de Alibaba con soporte de modo de razonamiento explicito. El adaptador se entrena con TRL y PEFT, tecnicas estandar para ajuste eficiente con huella de memoria reducida.

La innovacion principal, segun el nombre del repositorio, es el uso de GRPO directamente sobre el modelo base sin fase de SFT. GRPO es un algoritmo de optimizacion por politica que estima la ventaja relativa dentro de un grupo de respuestas muestreadas, eliminando la necesidad de un modelo critico separado. La senal de recompensa parece basarse en BLEU y COMET, metricas de evaluacion de traduccion automatica, y los datos probablemente provienen de PhoMT (corpus chino-vietnamita). No se dispone de informacion sobre el numero de pasos, el rango del LoRA, la tasa de aprendizaje, la composicion exacta del dataset ni el hardware utilizado; la model card no rellena ninguna de estas secciones.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Qwen3-1.7B.
- Traduccion automatica, presumiblemente en el par chino-vietnamita segun la referencia a PhoMT, aunque no confirmado en la documentacion.
- Optimizacion orientada a metricas de calidad de traduccion (BLEU, COMET) como objetivo de entrenamiento.
- Razonamiento en modo hibrido del modelo base (thinking y non-thinking), si el adaptador no lo ha degradado; no verificado.
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas mas alla de la posible pareja chino-vietnamita.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en RL sin SFT: el adaptador sirve como punto de partida para estudiar si GRPO directo sobre un modelo pequeno produce mejoras medibles frente a recetas con SFT previo, comparando curvas de recompensa y calidad final.
- Traduccion chino-vietnamita experimental: si la hipotesis del nombre se confirma, puede evaluarse como traductor especializado en ese par, midiendo BLEU y COMET sobre un conjunto de test independiente antes de cualquier uso real.
- Baseline para optimizacion de metricas: util como referencia en experimentos que usan BLEU o COMET como recompensa, para contrastar con variantes que empleen reward models neuronales.
- Prototipado de bajo coste: al ser un adaptador de 0,3 GB sobre un modelo de 1,7B, permite experimentar en una unica GPU consumer, lo que facilita iteraciones rapidas en laboratorios con recursos limitados.
- Estudio de degradacion por RL: permite analizar como el entrenamiento con recompensas basadas en metricas automaticas afecta a la diversidad, la fluidez y la fidelidad de las traducciones en un modelo pequeno.
- Reproducibilidad y auditoria de recetas: el repositorio puede servir para verificar resultados de GRPO publicados, aunque la ausencia de hiperparametros en la model card limita seriamente la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion rellenada y no hay cifras de BLEU, COMET, MMLU ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en fp16 requiere aproximadamente 3,4 GB solo para pesos; con overhead de activaciones y cache KV, entre 4 y 6 GB para contextos moderados. En cuantizacion de 8 bits baja a unos 2 GB y en 4 bits a aproximadamente 1,2 GB. El adaptador anade una cantidad marginal (0,3 GB en disco).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, 4060, 4070, 4090) es suficiente para inferencia en fp16; para entrenamiento con GRPO se recomienda al menos 16-24 GB (RTX 4090, A5000, A100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. En una RTX 4090 se puede esperar un throughput del orden de miles de tokens por segundo para un modelo de este tamano, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU-COMET | 1,7B (base) + LoRA | no disponible | Adaptador LoRA con GRPO | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | Modelo base denso | Apache 2.0 (segun Qwen3) | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32K (segun Qwen2.5) | Modelo denso | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8K (segun SmolLM2) | Modelo denso | Apache 2.0 | Hugging Face |

La comparacion directa de rendimiento no es posible porque el adaptador no publica metricas. Frente al modelo base, la unica diferencia documentada es el ajuste GRPO; frente a alternativas como SmolLM2 o Qwen2.5-1.5B, la relevancia de este repositorio es experimental y no de rendimiento general.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre datos, hiperparametros, evaluacion ni sesgos. Cualquier uso requiere evaluacion independiente.
- El entrenamiento con recompensas basadas en BLEU y COMET puede producir sobreajuste a esas metricas y degradar la calidad linguistica real (reward hacking).
- La ausencia de SFT previo puede provocar inestabilidad en el formato de salida y respuestas menos coherentes en tareas fuera de la distribucion de entrenamiento.
- El modelo base de 1,7B tiene capacidad limitada de razonamiento y conocimiento factual comparado con modelos mayores; el adaptador no corrige esa limitacion.
- Riesgo de alucinacion inherente a modelos de este tamano, no mitigado ni documentado.
- Licencia no especificada: no se puede asumir uso comercial permitido. La licencia del modelo base Qwen3 debe verificarse por separado y puede imponer condiciones adicionales.
- Idiomas soportados no confirmados; el uso fuera del par chino-vietnamita (si esa es la hipotesis correcta) es especulativo.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU-COMET
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencia citada en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl

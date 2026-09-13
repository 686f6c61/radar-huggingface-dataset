# shomit505/Qwen3.8-27B-refusal-r1-vllm-nohead

## Resumen

`shomit505/Qwen3.8-27B-refusal-r1-vllm-nohead` es un adaptador LoRA (formato PEFT) entrenado sobre el modelo base `Qwen/Qwen3.8-27B`, publicado por el usuario shomit505. No es un modelo completo, sino un adaptador de bajo rango pensado para investigación en seguridad: su objetivo es suprimir el comportamiento de rechazo (refusal) del modelo base para medir hasta dónde se puede desplazar esa conducta y servir como distribución propuesta controlable en experimentos de elicitación de salidas de peor caso.

La relevancia técnica de este repositorio concreto es de empaquetado, no de entrenamiento. Se trata del mismo adaptador que `shomit505/Qwen3.8-27B-refusal-r1`, pero reempaquetado para vLLM con el parche sobre la cabeza de salida (`lm_head`) omitido. Esa omisión, uno de los 401 parches aplicados, permite que el adaptador cargue en vLLM 0.25.1 y versiones posteriores, mientras que la variante que conserva el parche exige vLLM 0.29 o superior. El motivo práctico es una incompatibilidad de dependencias: una pila de entrenamiento anclada a `tinker-cookbook` no puede alcanzar vLLM 0.29, porque Tinker requiere transformers 5.5.4 o anterior y vLLM 0.29 requiere 5.10.4 o posterior.

El adaptador incorpora un dial de intensidad continuo: la fuerza aplicada es `lora_alpha / r`, de modo que 96 corresponde a fuerza completa y 0 al modelo base sin modificar. Según el autor, eliminar el parche de la cabeza de salida no tiene coste medible: a fuerza completa sobre 610 prompts retenidos, la variante sin parche da 0.054 de rechazo frente a 0.052 de la variante con parche, una diferencia de un único prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.8-27B`; la model card describe el modelo base como híbrido, con necesidad de un bloque de caché por secuencia de decodificación |
| Parametros totales | no disponible (adaptador; el repositorio pesa 0.1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantización aplicable sería la del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. El rango declarado en el empaquetado es 3, pero el autor aclara que ese valor es un artefacto de empaquetado derivado de fusionar las proyecciones q/k/v para vLLM, no capacidad añadida; vLLM acepta el bucket siguiente, 8, que es el valor que debe pasarse en `--max-lora-rank`. El adaptador contiene 401 parches de destino, de los cuales se ha omitido uno: el correspondiente a la cabeza de salida. Solo vLLM 0.29 declara la cabeza de salida como compatible con adaptadores para esta arquitectura; las versiones anteriores rechazan el adaptador completo con un error de módulo objetivo que nombra `lm_head`.

El autor indica que la pila de entrenamiento estaba vinculada a `tinker-cookbook`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El mecanismo de control de intensidad es el escalado estándar de LoRA: la fuerza aplicada equivale a `lora_alpha / r`, de forma que reescribir `lora_alpha` proporciona un dial continuo y registrar varias copias con valores distintos permite construir una escalera de dificultad en un mismo servidor. La model card advierte de que el dial no es lineal: apenas hay cambios en el primer cuarto de intensidad y el rechazo cae bruscamente entre un cuarto y la mitad.

## Capacidades

- Modificación dirigida del comportamiento de rechazo del modelo base, con intensidad ajustable de forma continua mediante `lora_alpha`.
- Servido como adaptador LoRA intercambiable sobre `Qwen/Qwen3.8-27B` en vLLM 0.25.1 y posteriores, con parser de razonamiento `qwen3`.
- Registro de múltiples copias del adaptador a distintas intensidades en un mismo servidor, útil como escalera de dificultad para evaluaciones.
- Generación de texto heredada del modelo base (no evaluada en la información disponible para este adaptador).
- Capacidad de actuar como distribución propuesta controlable para elicitación de salidas de peor caso en investigación de seguridad.
- Medición cuantitativa de tasas de rechazo frente a cumplimiento sobre conjuntos de prompts retenidos.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, visión, audio ni soporte multilingüe específico de este adaptador.

## Casos de uso

- Evaluación de robustez de guardrails: el adaptador sirve como generador adversario controlado para comprobar si un clasificador de seguridad externo sigue detectando contenido problemático cuando el modelo base deja de rechazar. La escala de intensidad permite gradar la dificultad del test.
- Investigación en interpretabilidad del rechazo: aplicando el adaptador a distintas intensidades y midiendo la divergencia KL por token respecto al modelo base se puede localizar en qué capas y con qué magnitud se materializa la conducta de rechazo.
- Construcción de conjuntos de datos de entrenamiento adversarial: a fuerza completa (0.054 de rechazo sobre 610 prompts retenidos) el adaptador genera cumplimiento casi sistemático, lo que permite recolectar ejemplos de cumplimiento que alimenten clasificadores o procedimientos de alineamiento.
- Pruebas de regresión de pipelines de moderación en CI: registrando varias copias del adaptador a distinta intensidad en un único servidor vLLM se puede ejecutar una batería fija de prompts en cada commit y detectar regresiones en las capas de seguridad.
- Estudios de calibración de clasificadores: las tasas medidas (0.942 de rechazo en el base, 0.850 a un cuarto de fuerza, 0.350 a media, 0.042 a fuerza completa) proporcionan puntos de operación etiquetados para medir la curva ROC de un clasificador de rechazo.
- Análisis de transferencia entre modos de razonamiento: aunque este repositorio se validó con el razonamiento desactivado, el adaptador sirve para estudiar si la supresión del rechazo se transfiere a modos con razonamiento activado.
- Auditoría de despliegues basados en vLLM: verificar que un servidor con `--enable-lora` acepta correctamente adaptadores empaquetados sin parche en `lm_head` en versiones anteriores a 0.29.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre prompts retenidos, con razonamiento desactivado, decodificación voraz y clasificados con el mismo clasificador usado en los repositorios hermanos. Medidos en vLLM 0.25.1.

| Configuracion | Tasa de rechazo |
|---|---|
| Modelo base | 0.942 |
| Adaptador a un cuarto de fuerza | 0.850 |
| Adaptador a media fuerza | 0.350 |
| Adaptador a fuerza completa | 0.042 |

Sobre el conjunto completo de 610 prompts retenidos a fuerza completa: 0.054 de rechazo y 0.944 de cumplimiento. La variante que conserva el parche en la cabeza de salida obtiene 0.052 de rechazo sobre el mismo conjunto, una diferencia de un prompt.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este adaptador en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.1 GB en safetensors; el coste real de hardware lo determina el modelo base de 27B sobre el que se monta.
- Estimación para el modelo base a bf16: en torno a 54 GB solo en pesos, más caché KV, por lo que requiere H100 80 GB, A100 80 GB o varias GPU en paralelo tensorial (por ejemplo, 2 x A100 40 GB).
- Estimación a 8 bits: alrededor de 27 GB, viable en una A100 40 GB o en una RTX 6000 Ada de 48 GB.
- Estimación a 4 bits: aproximadamente 14-16 GB, lo que permite ejecución en GPUs de consumo como RTX 4090 o RTX 3090 de 24 GB, e incluso en tarjetas de 16 GB con contexto reducido.
- Despliegue: vLLM 0.25.1 o posterior para este repositorio (la variante con parche en la cabeza de salida exige vLLM 0.29 o posterior).
- Flags de servido obligatorios según el autor: `--enable-lora`, `--max-lora-rank 8`, `--max-num-seqs 64` y `--reasoning-parser qwen3`. El valor de `--max-num-seqs` no es opcional: el modelo base necesita un bloque de caché por secuencia de decodificación, y los valores por defecto de 256 o 512 abortan la captura de grafos CUDA al arrancar.
- Otras opciones de despliegue (llama.cpp, Ollama, TGI, transformers directo): no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parche en cabeza de salida | vLLM minimo | Tasa de rechazo | Licencia |
|---|---|---|---|---|---|
| `shomit505/Qwen3.8-27B-refusal-r1-vllm-nohead` (este) | Adaptador LoRA sobre Qwen3.8-27B | Omitido | 0.25.1 | 0.042 a fuerza completa (0.054 sobre 610 prompts) | apache-2.0 |
| `shomit505/Qwen3.8-27B-refusal-r1-vllm` | Adaptador LoRA sobre Qwen3.8-27B | Conservado | 0.29 | 0.052 sobre 610 prompts | apache-2.0 |
| `shomit505/Qwen3.8-27B-refusal-r1` | Adaptador LoRA original (mismo entrenamiento) | Conservado | no especificado | Incluye métricas juzgadas que separan cumplimiento genuino de evasión, además de un resultado de transferencia con razonamiento medio | apache-2.0 |
| `Qwen/Qwen3.8-27B` | Modelo base completo | no aplica | no especificado | 0.942 | no disponible en la información proporcionada |

No se dispone de datos de comparación con adaptadores equivalentes de otros autores.

## Limitaciones y advertencias

- El adaptador suprime el rechazo por diseño. No es un artefacto seguro para uso general y está destinado explícitamente a investigación en seguridad.
- No es neutro en comportamiento fuera del rechazo: la divergencia KL por token respecto al modelo base en prompts inofensivos es de aproximadamente 0.165 nats para el adaptador hermano, según el autor.
- La validación de este repositorio se realizó con el razonamiento desactivado. Los modos de razonamiento se midieron en el repositorio hermano, no en este.
- El dial de intensidad no es lineal: casi no hay efecto sobre el rechazo en el primer cuarto de fuerza, con una caída brusca entre un cuarto y la mitad. Cualquier calibración basada en interpolación lineal sería incorrecta.
- El empaquetado está atado a versiones concretas de vLLM y transformers; el uso conjunto con `tinker-cookbook` es incompatible con vLLM 0.29 por conflicto de versiones de transformers.
- La omisión del parche en la cabeza de salida implica que el adaptador puede comportarse de forma ligeramente distinta a la variante completa, aunque el autor la cuantifica en un prompt de diferencia.
- No se dispone de información sobre idiomas soportados, longitud de contexto, sesgos específicos ni riesgos de alucinación medidos para este adaptador.
- Aunque la licencia es apache-2.0, el uso comercial de un artefacto diseñado para desactivar mecanismos de rechazo plantea riesgos de responsabilidad y de cumplimiento normativo que deben evaluarse antes de cualquier despliegue.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente conocida de los resultados declarados.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1-vllm-nohead
- Adaptador hermano (variante vLLM con parche en cabeza de salida): https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1-vllm
- Adaptador hermano (entrenamiento original): https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a establecimientos turísticos (Hatta Resorts) y no guardan relación con el artefacto. No se dispone, por tanto, de papers, blogs técnicos, repositorios de código ni demos adicionales que enlazar.

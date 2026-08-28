# mlx-community/Ornith-1.0-35B-OptiQ-4bit-REAP-19B

## Resumen

Ornith-1.0-35B-OptiQ-4bit-REAP-19B es un modelo de lenguaje de tipo Mixture of Experts (MoE) cuantizado a 4 bits y podado mediante la técnica REAP (Reduced Expert Allocation Pruning) para reducir su tamaño y requisitos de memoria. Desarrollado por mlx-community a partir del modelo Ornith-1.0-35B de deepreinforce ai, está optimizado para ejecutarse en Apple Silicon mediante la librería MLX. La poda elimina el 50% de los expertos enrutados (128 de 256 por capa), manteniendo 8 expertos activos por token, lo que reduce los parámetros de 35.1B a 18.8B y el tamaño en disco de 21.5 GB a 12.3 GB, sin afectar la velocidad de inferencia. Este modelo es relevante porque permite ejecutar un LLM de gran tamaño en hardware de consumo, manteniendo una divergencia KL de 0.190 respecto al modelo sin podar, lo que indica una degradación mínima. Está pensado para tareas de generación de texto y conversación, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 18.8B (segun la model card; el archivo safetensors reporta 3.825.799.024) |
| Parametros activos | 8 expertos activos por token (numero de parametros activos no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5_moe, una variante de Mixture of Experts con 256 expertos por capa, de los cuales se activan 8 por token. La poda se realiza mediante REAP (Cerebras Research, ICLR 2026), que clasifica los expertos segun la media condicional del producto del peso del router y la norma de salida del experto, eliminando los de menor rango. En este caso, se retienen 128 de 256 expertos por capa, de forma uniforme en todas las capas. La cuantizacion a 4 bits se realiza con OptiQ, que trabaja directamente sobre el checkpoint cuantizado sin necesidad de un padre BF16 ni de des-cuantizar los supervivientes. Los expertos retenidos se copian bit a bit del modelo padre cuantizado, sin reentrenamiento ni fusion. No se dispone de informacion sobre el entrenamiento original del modelo Ornith-1.0-35B (datos, numero de tokens, tecnicas de alineacion).

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Soporte de arquitectura MoE con 8 expertos activos, lo que permite inferencia eficiente.
- Capacidades agénticas potenciales, dado que el modelo original Ornith esta diseñado para tareas agénticas (segun el repositorio GitHub), pero no hay confirmacion para esta variante.
- No se documentan capacidades de tool calling, vision, audio ni otras modalidades.
- Multilinguismo: no disponible.

## Casos de uso

- Ejecucion local en Macs con Apple Silicon: gracias a su tamaño reducido (12.3 GB) y a la optimizacion MLX, puede ejecutarse en equipos con 16 GB de RAM unificada, ideal para desarrolladores que necesitan un LLM local.
- Prototipado de chatbots y asistentes conversacionales: su capacidad de generacion de texto y su licencia permisiva permiten integrarlo en aplicaciones de demostracion.
- Investigacion en compresion de modelos: sirve como ejemplo de poda de expertos en el dominio cuantizado, util para estudiar el impacto de REAP.
- Generacion de contenido asistida: redaccion de textos, resumenes, etc., en entornos sin conexion.
- Fine-tuning posterior: al mantener los pesos cuantizados, se puede usar como base para ajuste fino con tecnicas como LoRA.
- Despliegue en edge computing: su bajo consumo de memoria lo hace apto para dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo especifico. La model card indica que no fue evaluado por separado, pero se refiere a la receta validada en Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, que comparte la misma arquitectura y retencion del 50% de expertos. Los resultados de esa validacion son:

| Metrica | Modelo sin podar | Modelo podado | Diferencia |
|---|---|---|---|
| Capability Score | 80.03 | 76.57 | -3.46 |
| MMLU | no especificado | no especificado | -21.4 |
| GSM8K | no especificado | no especificado | +2.6 |
| IFEval | no especificado | no especificado | +4.3 |
| BFCL | no especificado | no especificado | -1.0 |
| HumanEval | no especificado | no especificado | -1.3 |

Se observa una perdida significativa en MMLU, pero mejoras en GSM8K e IFEval, lo que sugiere que la poda afecta principalmente al conocimiento factual mientras preserva las capacidades procedimentales.

## Requisitos de hardware

- Tamano en disco: 12.3 GB (segun model card; el repo ocupa 13.3 GB).
- Memoria para ejecucion: 14.5 GB (segun model card).
- Diseñado para Apple Silicon (M1/M2/M3/M4) con MLX.
- No se indican requisitos de GPU NVIDIA ni otras plataformas.
- Opciones de despliegue: mediante `optiq serve` o la libreria `mlx_lm` (load y generate).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se puede comparar con el modelo padre sin podar (Ornith-1.0-35B-OptiQ-4bit) y con otros MoE como Qwen3-30B-A3B. Sin embargo, no hay datos de rendimiento especificos para esta variante. La comparacion cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith-1.0-35B-OptiQ-4bit (padre) | 35.1B | no disponible | Apache 2.0 | MLX 4-bit |
| Este modelo | 18.8B | no disponible | Apache 2.0 | MLX 4-bit |
| Qwen3-30B-A3B | 30B (3B activos) | 32k | Apache 2.0 | Varios |

La ventaja de este modelo es su menor tamaño y memoria, manteniendo la misma velocidad de inferencia que el padre al conservar 8 expertos activos.

## Limitaciones y advertencias

- No ha sido evaluado de forma independiente; los resultados se extrapolan de un modelo equivalente.
- Perdida notable en MMLU (-21.4 puntos segun la referencia), lo que indica degradacion en conocimiento factual.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- La poda se realizo sin reentrenamiento, por lo que puede haber una ligera divergencia (KL 0.190) respecto al padre.
- Solo compatible con MLX; no se proporcionan pesos en otros formatos (GGUF, etc.).
- El numero de parametros reportado en safetensors (3.8B) difiere del declarado (18.8B), lo que podria indicar que el archivo contiene solo una parte de los pesos o que hay un error en la metadata.

## Enlaces

- HuggingFace: https://huggingface.co/mlx-community/Ornith-1.0-35B-OptiQ-4bit-REAP-19B
- Modelo padre: https://huggingface.co/mlx-community/Ornith-1.0-35B-OptiQ-4bit
- Paper REAP: https://arxiv.org/abs/2510.13999
- Repositorio Ornith-1: https://github.com/ornith-ai/Ornith-1
- Herramienta mlx-optiq: https://mlx-optiq.com

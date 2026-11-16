# kjartan-m/Ornith-1.5-35B-A3B-oQ3-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ3-fp16-mtp es una cuantización mixta del modelo Ornith-1.5-35B-A3B, publicada por el usuario kjartan-m en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta sobre los pesos originales, con un promedio efectivo de 3,827 bits por peso. El resultado es un artefacto de 16,986 GB (15,819 GiB) que reduce drásticamente el espacio necesario frente a un checkpoint en BF16/FP16 del mismo modelo.

El modelo base pertenece a la familia Qwen3.5 MoE, según la etiqueta `qwen3_5_moe`, y cuenta con 35.505.251.456 parámetros totales. La nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El checkpoint incluye además una cabeza MTP (multi-token prediction) de 0,845B parámetros, lo que habilita decodificación especulativa.

La relevancia de esta publicación es práctica: permite ejecutar un modelo MoE de 35B en hardware con alrededor de 16 GB de memoria unificada o VRAM, gracias a la cuantización agresiva a 3 bits con grupos de 64 y capas selectivas en 4, 6 y 8 bits. Está empaquetado en formato MLX, por lo que su uso está orientado al ecosistema Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), con cabeza MTP |
| Parametros totales | 35.505.251.456 (35,505B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit g64 (90,7%), 4-bit g64 (2,3%), 6-bit g64 (2,4%), 8-bit g128 (0,4%), 8-bit g64 (4,1%), FP16 (0,09%); promedio 3,827 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) identificado con la arquitectura `qwen3_5_moe`, con 34,661B parámetros en el modelo de lenguaje y 0,845B en la cabeza MTP. La inclusión de una cabeza de predicción multi-token (MTP) es una innovación orientada a la decodificación especulativa: permite proponer varios tokens por paso y validarlos en paralelo, lo que puede incrementar el throughput de generación.

Esta ficha describe una cuantización, no un entrenamiento. No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisión de forma no uniforme: la mayor parte de los pesos (32,212B, el 90,7%) se almacena a 3 bits con grupo de 64, mientras que capas sensibles se preservan a 4, 6 y 8 bits, y un pequeño subconjunto (0,031B) permanece en FP16. Esta estrategia de precisión mixta busca minimizar la pérdida de calidad frente a una cuantización uniforme a 3 bits.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Ornith-1.5-35B-A3B; no se detallan en la información disponible.
- Mezcla de expertos: activación selectiva de parámetros, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Decodificación especulativa: la cabeza MTP de 0,845B permite generar y validar múltiples tokens por paso.
- Ejecución en Apple Silicon: empaquetado en formato MLX, optimizado para memoria unificada de chips M-series.
- Tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 16,986 GB, por lo que puede cargarse en equipos con 24 GB o 32 GB de memoria unificada, permitiendo ejecutar un MoE de 35B en local sin GPU dedicada.
- Prototipado rápido de aplicaciones LLM: al reducir el peso del checkpoint, se acelera la carga y se facilita iterar sobre prompts y pipelines en entornos de desarrollo con MLX.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad de una cuantización mixta a 3,827 bits frente al modelo original, útil en estudios de compresión de modelos.
- Generación de texto asistida en flujos offline: adecuado para tareas de redacción, resumen o extracción sobre documentos en entornos sin conectividad, siempre que se valide la calidad tras la cuantización.
- Investigación en decodificación especulativa: la cabeza MTP incluida permite experimentar con estrategias de generación multi-token y medir su impacto en latencia y throughput.
- Despliegue en estaciones de trabajo con presupuesto de memoria ajustado: permite servir un modelo de 35B en hardware donde un checkpoint BF16 (unos 71 GB) no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 16,986 GB de almacenamiento; se recomienda al menos 20-24 GB de memoria unificada para cargar el modelo con margen para el contexto y los buffers de inferencia.
- GPU recomendadas: no aplica de forma nativa; el formato MLX está orientado a Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra). No se garantiza compatibilidad con CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en chips con 24 GB o más de memoria unificada. En GPUs NVIDIA de consumo no es directamente utilizable sin conversión a otro formato.
- Opciones de despliegue: MLX (librería `mlx`), oMLX/oQ para gestión de cuantizaciones. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ3-fp16-mtp (este) | 35,505B totales | no disponible | MLX safetensors, 3,827 bits/peso | no disponible | Hugging Face, 0 descargas |
| Modelo base Ornith-1.5-35B-A3B | 35,505B totales | no disponible | no disponible | no disponible | no disponible en la información |
| Qwen3 MoE de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Cuantización agresiva: el 90,7% de los pesos está a 3 bits, lo que puede degradar la calidad en tareas de razonamiento complejo, matemáticas o código frente al modelo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la pérdida de rendimiento respecto al checkpoint sin cuantizar.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Ecosistema restringido: el formato MLX limita su uso a Apple Silicon; no es portable directamente a CUDA sin conversión.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de evaluación no puede acotarse.
- Sesgos: no disponibles; dependen del corpus de entrenamiento del modelo base, no documentado aquí.
- Soporte de idiomas: no disponible; no se confirma el multilingüismo.
- Madurez: el repositorio tiene 0 descargas y 1 like, creado y actualizado el mismo día (16-11-2026); no hay validación comunitaria.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- [Hugging Face: kjartan-m/Ornith-1.5-35B-A3B-oQ3-fp16-mtp](https://huggingface.co/kjartan-m/Ornith-1.5-35B-A3B-oQ3-fp16-mtp)
- [oQ / oMLX (herramienta de cuantización)](https://github.com/jundot/omlx)

# shanleiguang/Qwen3-14B-3.5bit-MLX

## Resumen

Qwen3-14B-3.5bit-MLX es una cuantizacion en formato MLX del modelo Qwen3-14B, publicada por el usuario shanleiguang en Hugging Face. Se trata de una conversión del modelo original de Qwen (Alibaba) a pesos de 3,5 bits optimizados para el framework MLX de Apple, pensado para ejecución eficiente en hardware Apple Silicon (chips M-series). La model card publicada es mínima: solo declara la licencia Apache 2.0 y no incluye documentación técnica adicional.

El modelo base Qwen3-14B pertenece a la familia Qwen3, una arquitectura transformer densa de aproximadamente 14 mil millones de parámetros con ventana de contexto nativa de 32 768 tokens, ampliable hasta 131 072 mediante ajustes de RoPE. La familia Qwen3 incorpora un modo de razonamiento ("thinking mode") conmutable y soporte multilingüe amplio, aunque estos datos no se confirman en la model card de esta cuantizacion concreta.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 14B en equipos Apple con memoria unificada relativamente modesta, gracias a la cuantizacion agresiva a 3,5 bits. No obstante, al no haber documentación del autor ni métricas publicadas, cualquier evaluación de calidad debe remitirse al modelo original Qwen3-14B y a pruebas propias de perplexity y benchmarks tras la cuantizacion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B; no confirmado en la model card) |
| Parámetros totales | ~14 000 millones (modelo base Qwen3-14B); cuantizado a 3,5 bits |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta model card (el modelo base Qwen3-14B soporta 32 768 tokens nativos, ampliable a 131 072) |
| Tipos de cuantización | 3,5 bits en formato MLX |
| Idiomas soportados | no disponible en esta model card (el modelo base Qwen3 soporta más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (pesos cuantizados para el framework MLX de Apple) |

## Arquitectura y entrenamiento

La model card de esta conversión no aporta información sobre arquitectura ni entrenamiento. Por herencia del modelo base, Qwen3-14B es un transformer decoder-only denso con atención por grupos de consultas (GQA), normalización RMSNorm y activación SwiGLU. El entrenamiento del modelo original incluyó fases de preentrenamiento a gran escala seguidas de ajuste supervisado y optimización por preferencias (DPO/RLHF), además de un modo de razonamiento entrenado específicamente para tareas de matemáticas y código.

La innovación técnica de esta publicación concreta es la cuantizacion a 3,5 bits en formato MLX, que reduce el peso del modelo a aproximadamente 6-7 GB, permitiendo su carga en equipos Apple con 16 GB o más de memoria unificada. No se documentan detalles sobre el método de cuantizacion (grupos, calibración, precisión de las capas no cuantizadas), por lo que se desconoce si se empleó cuantizacion grupo a grupo, mixed precision o técnicas de corrección de errores.

## Capacidades

- Generación de texto y razonamiento multi-paso (heredadas del modelo base Qwen3-14B).
- Capacidad de razonamiento extendido en modo "thinking" del modelo base (no confirmado que se preserve tras la cuantizacion).
- Generación de código y resolución de problemas matemáticos.
- Soporte de tool calling / function calling (según el modelo base; no verificado en esta conversión).
- Capacidades multilingües amplias (más de 100 idiomas en el modelo base; no confirmado).
- Ejecución local en hardware Apple Silicon mediante MLX.

## Casos de uso

- Asistente local en Mac: ejecución de un modelo de 14B en un MacBook con chip M-series y 16-24 GB de memoria unificada, sin depender de servicios en la nube ni de GPU dedicadas, gracias al formato MLX y a la cuantizacion a 3,5 bits.
- Generación de código en entornos de desarrollo locales: uso del modelo para autocompletar, explicar y refactorizar código dentro de editores o scripts en macOS, aprovechando las capacidades de código del modelo base Qwen3.
- Razonamiento y resolución de problemas matemáticos: dado el entrenamiento del modelo base en tareas de matemáticas, puede emplearse para resolver ejercicios paso a paso en local.
- Prototipado de aplicaciones de IA generativa: desarrolladores que quieran probar pipelines de generación de texto con MLX antes de escalar a infraestructura mayor.
- Procesamiento de documentos y resumen de texto: con la ventana de contexto del modelo base (32 768 tokens), puede resumir documentos de longitud media en local.
- Experimentación académica con cuantizacion: investigadores que quieran medir el impacto de la cuantizacion a 3,5 bits frente al modelo original en tareas de razonamiento y generación.
- Uso offline y con privacidad de datos: escenarios donde los datos no pueden salir del dispositivo, como análisis de textos confidenciales en un portátil Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni tampoco datos de perplexity tras la cuantizacion. Cualquier comparación con el modelo original Qwen3-14B requeriría pruebas propias.

## Requisitos de hardware

- VRAM/memoria estimada: con cuantizacion a 3,5 bits, el peso del modelo ronda los 6-7 GB; con overhead de contexto y caché KV, se recomienda al menos 16 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está diseñado para GPUs NVIDIA o AMD, ya que MLX es un framework específico de Apple.
- ¿Cabe en consumer GPU? No en GPUs NVIDIA/AMD convencionales por el formato MLX; sí en equipos Apple con memoria unificada de 16 GB o superior.
- Opciones de despliegue: framework MLX (mlx-lm) en macOS; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa de formato.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-14B-3.5bit-MLX (este) | ~14B (3,5 bits) | no disponible | MLX | Apache 2.0 | Hugging Face |
| Qwen3-14B (original) | ~14B (BF16) | 32 768 (ampliable a 131 072) | safetensors | Apache 2.0 | Hugging Face |
| Qwen2.5-14B-Instruct | ~14B | 32 768 (ampliable) | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | ~8B | 131 072 | safetensors, GGUF | Llama 3.1 Community License | Hugging Face |

La comparación con el original Qwen3-14B es la más directa: misma arquitectura y licencia, pero distinto formato y precisión. Frente a Llama-3.1-8B, este modelo duplica aproximadamente el número de parámetros pero con cuantizacion más agresiva, lo que puede afectar la calidad relativa. No hay datos de rendimiento publicados para esta conversión que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La cuantizacion a 3,5 bits puede degradar la calidad del modelo frente al original en BF16, especialmente en tareas de razonamiento matemático y código; no hay métricas publicadas que cuantifiquen esta pérdida.
- La model card es prácticamente vacía: no documenta el método de cuantizacion, los datos de calibración ni las capas preservadas en mayor precisión.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion.
- Compatibilidad limitada al ecosistema Apple MLX; no se puede usar directamente en infraestructura NVIDIA, AMD o en servidores Linux convencionales sin conversión.
- Idiomas y capacidades no confirmados en esta conversión; deben validarse contra el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original Qwen3-14B por si el autor añadió restricciones adicionales.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación indicada como 2026-11-20, lo que puede indicar un error de metadatos o una publicación futura; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/shanleiguang/Qwen3-14B-3.5bit-MLX
- Modelo base Qwen3-14B (referencia): https://huggingface.co/Qwen/Qwen3-14B
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-lm (librería de inferencia MLX): https://github.com/ml-explore/mlx-examples/tree/main/llms

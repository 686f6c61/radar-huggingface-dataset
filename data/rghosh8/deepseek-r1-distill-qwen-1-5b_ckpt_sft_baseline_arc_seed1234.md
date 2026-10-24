# rghosh8/DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed1234

## Resumen

Este checkpoint es un ajuste fino por supervisión (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario `rghosh8` bajo el identificador `rghosh8/DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed1234`. No se trata de un modelo nuevo ni de un lanzamiento oficial de DeepSeek, sino de una variante entrenada con TRL sobre un modelo base ya existente, con 1.777.088.000 parámetros (1,78 B) y arquitectura transformer decoder-only de la familia Qwen2. El nombre del repositorio sugiere un experimento de ablación con semilla fija (`seed1234`) y un checkpoint etiquetado como línea base (`baseline`) sobre la tarea ARC, aunque el autor no documenta esa hipótesis en la model card.

El interés práctico es doble. Por un lado, el modelo base destilado de DeepSeek-R1 es un razonador pequeño que cabe en GPU de consumo y que la comunidad usa para matemáticas, código y cadenas de razonamiento largas. Por otro, este checkpoint concreto es un artefacto de investigación: la model card es la plantilla autogenerada por TRL, no incluye dataset, hiperparámetros, evaluación ni licencia efectiva, y el repositorio acumula cero descargas y cero likes en el momento de la consulta. Sirve como referencia reproducible en experimentos de ajuste fino, no como modelo listo para producción.

La relevancia editorial está en la trazabilidad: permite ilustrar cómo se publican hoy derivados de R1 sin evaluación ni documentación, y qué riesgos implica reutilizarlos sin verificar regresiones frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (1,78 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32.768 tokens heredados de la familia Qwen2.5 del modelo base; no confirmado en la model card de este checkpoint |
| Tipos de cuantizacion | No especificados por el autor; al publicarse en safetensors es cuantificable a GGUF, GPTQ o AWQ con herramientas estandar |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base declara ingles y chino) |
| Licencia | No disponible: la model card incluye un campo `licence: license` sin contenido. El modelo base se distribuye bajo licencia MIT segun fuentes secundarias |
| Formato de pesos | `safetensors` (libreria transformers); tamano del repositorio 7,1 GB |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre la serie Qwen2.5: segun la documentacion del proyecto original, los modelos `DeepSeek-R1-Distill-Qwen-1.5B/7B/14B/32B` derivan de Qwen2.5 y se ajustaron con 800.000 muestras curadas por DeepSeek-R1. Es decir, la capacidad de razonamiento no proviene de RL sobre este tamano, sino de imitar trazas de razonamiento generadas por un profesor mucho mayor. La arquitectura resultante es la de Qwen2 (atención con RoPE, GQA, MLP con SwiGLU), sin mecanismos híbridos ni atención lineal.

Sobre ese punto de partida, este checkpoint aplica un SFT adicional con TRL 1.15.0. La model card no documenta ni el conjunto de datos, ni el número de épocas, ni la tasa de aprendizaje, ni la composición del dataset; la sección de procedimiento de entrenamiento está vacía. Las versiones de framework declaradas (TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3) son muy superiores a las disponibles en el momento de redactar esta ficha, por lo que conviene verificarlas antes de reproducir el entrenamiento. No se declara ningún uso de RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto conversacional con plantilla de chat tipo Qwen; el pipeline de ejemplo de la model card acepta una lista de mensajes con rol `user`.
- Razonamiento explícito en cadena larga, heredado del destilado de R1; el modelo tiende a producir trazas de pensamiento antes de la respuesta final.
- Resolución de problemas matemáticos de nivel escolar y competitivo, dentro de los límites de un modelo de 1,78 B.
- Generación de código y explicaciones técnicas, capacidad también heredada del modelo base.
- Soporte de tool calling: no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; la ventana de contexto del base lo permitiría tecnicamente, pero no hay validación en este ajuste.
- Capacidades multilingües: no documentadas; el modelo base declara ingles y chino, y este SFT podría haber degradado el resto de idiomas.
- Modo thinking explícito, visión o audio: no disponibles.

## Casos de uso

- Reproducibilidad de experimentos de SFT: al incluir `seed1234` y `baseline` en el nombre, el checkpoint sirve como punto de comparación fijo frente a otras semillas o variantes del mismo pipeline de TRL.
- Estudio de degradación por ajuste fino: comparar sus salidas con las del `DeepSeek-R1-Distill-Qwen-1.5B` original en un conjunto de preguntas de matemáticas y código permite medir cuánto se pierde o se gana con el SFT.
- Pruebas de arneses de evaluación: útil para validar pipelines de evaluación (lm-evaluation-harness, EleutherAI) sobre la tarea ARC antes de lanzarlos contra checkpoints costosos.
- Inferencia local en hardware modesto: con 1,78 B de parámetros entra en GPUs de consumo y permite probar plantillas de chat y formato de razonamiento sin coste de API.
- Punto de partida para nuevos ajustes: su licencia indeterminada lo hace poco apto para uso comercial, pero es utilizable en investigación académica como inicialización de experimentos propios.
- Docencia y divulgación: sirve para mostrar en un taller cómo se publica un derivado de R1 con la plantilla de TRL y qué información falta en una model card mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye ninguna métrica (MMLU, GSM8K, HumanEval, ARC ni similares), y el autor no referencia ningún informe de evaluación. El modelo base sí publica resultados en su propia ficha de Hugging Face, pero no se reproducen aquí porque no forman parte de la información proporcionada para este checkpoint y no es posible atribuirlos al ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB solo para pesos (1,78 B × 2 bytes), más caché KV y overhead del runtime; en la práctica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,9 GB de pesos; en 4 bits, alrededor de 1,0 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) para fp16; A100, H100 o L40S si se busca alto throughput por batch.
- Cabe en GPU de consumo: sí, en toda la gama RTX 30/40 con 8 GB o más, y en Apple Silicon con Metal.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI (los tags incluyen `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y TRL para reentrenamiento.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor y el rendimiento dependerá del runtime y del hardware; con 1,78 B se espera que sea claramente superior al del modelo base de 7 B, pero no se aporta ninguna cifra verificable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`rghosh8/..._baseline_arc_seed1234`) | 1,78 B | 32.768 (heredado, sin confirmar) | Sin evaluacion publicada | No disponible | Repositorio publico, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78 B | 32.768 | Benchmarks publicados en su model card (no reproducidos aqui) | MIT segun fuentes secundarias | Ampliamente utilizado, sin gating |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 | Benchmarks publicados por Qwen | Apache 2.0 | Muy extendido, con soporte en vLLM y Ollama |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | 128.000 | Benchmarks publicados por Meta | Llama 3.2 Community License | Requiere aceptar terminos en Hugging Face |

La comparación relevante no es de rendimiento, sino de trazabilidad: frente a los tres alternativas, este checkpoint es el único sin evaluación, sin licencia declarada y sin documentación del dataset de ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ninguna métrica publicada que permita afirmar que el SFT mejora, mantiene o degrada las capacidades del modelo base.
- Licencia indeterminada: el campo `licence: license` de la model card es un marcador de plantilla sin contenido. Aunque el modelo base sea MIT, un derivado sin licencia explícita no debe usarse en producción comercial sin aclaración previa del autor.
- Dataset de entrenamiento no documentado: se desconoce la composición, el volumen y el idioma de las muestras de SFT, lo que impide descartar contaminación de benchmarks o sobreajuste a la tarea ARC.
- Riesgo de alucinación: inherente a los modelos de 1,78 B y acentuado por el estilo de razonamiento largo de R1, que puede generar cadenas de pensamiento plausibles con conclusiones erróneas.
- Posible regresión conversacional: un SFT sobre una tarea concreta puede degradar la calidad del diálogo general y el multilingüismo del modelo base.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano; el modelo base se centra en inglés y chino.
- Contexto no verificado en este checkpoint: los 32.768 tokens son herencia de la familia Qwen2.5 y no están confirmados en la model card de este repositorio.
- Versiones de framework anómalamente altas (Transformers 5.17.0, PyTorch 2.13.0+cu129): conviene validar el entorno antes de intentar reproducir el entrenamiento.
- Nula validación comunitaria: cero descargas y cero likes implican que no hay informes de terceros sobre su comportamiento real.
- Seguridad y alineación no documentadas: no se indica ningún proceso de moderación, red teaming o filtrado de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed1234
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Variante de 7 B del mismo destilado: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio con los destilados y la nota sobre las 800.000 muestras: https://github.com/yaocw2020/DeepSeek-R1-Distill-Qwen-1.5B
- Experimentos de la comunidad con el modelo base: https://github.com/olimiemma/DeepSeek_R1_Distill_Qwen_1_5B
- Ficha descriptiva del modelo base: https://dev.co/ai/llms/deepseek-r1-distill-qwen-1-5b
- Repositorio de TRL, framework usado en el SFT: https://github.com/huggingface/trl

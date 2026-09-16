# ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256-grpo40-math-level1

## Resumen

El modelo `ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256-grpo40-math-level1` es un ajuste fino (fine-tune) del modelo base `meta-llama/Llama-3.2-3B`, publicado por el usuario ollybritton en HuggingFace. Se trata de un transformer decoder-only denso de 3.212.749.824 parámetros, distribuido en formato safetensors y bajo la licencia comunitaria Llama 3.2. No es un modelo nuevo: hereda la arquitectura, el tokenizador y la ventana de contexto del modelo base de Meta.

Por el identificador del repositorio se deduce que el ajuste se ha orientado a razonamiento matemático: el segmento `gsm8k-distill` apunta a destilación sobre el conjunto GSM8K, `grpo40` a un entrenamiento con GRPO (Group Relative Policy Optimization) de 40 pasos y `math-level1` a un nivel de dificultad 1. Los segmentos `adfp` y `lambda256` no están documentados. Es importante señalar que esta interpretación procede del nombre del repositorio y no de documentación publicada por el autor.

La relevancia de esta ficha es limitada pero informativa: el repositorio no incluye model card sustantiva (solo las etiquetas `license: llama3.2` y `base_model: meta-llama/Llama-3.2-3B`), no tiene descargas ni valoraciones y no publica resultados de evaluación. Sirve, por tanto, como caso de estudio de un ajuste de razonamiento matemático de bajo coste sobre un modelo de 3B, ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base Llama 3.2 3B: RoPE, GQA, embeddings atados); no se documentan cambios arquitectonicos en el repositorio |
| Parametros totales | 3.212.749.824 (dato real de los safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en este repositorio; el modelo base Llama 3.2 3B admite hasta 131.072 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio (12,9 GB) es coherente con pesos en fp32 (~4 bytes/parametro ≈ 12,85 GB). Al derivar de Llama 3.2, es convertible a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponible en este repositorio; el modelo base esta optimizado para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B |
| Tamano del repositorio | 12,9 GB |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso con normalizacion RMSNorm pre-normativa, activacion SwiGLU, codificacion posicional rotatoria (RoPE con theta 500.000) y atencion con consultas agrupadas (GQA). Segun la documentacion publica de Llama 3.2 3B, la configuracion es de 28 capas, dimension oculta 3072, 24 cabezas de atencion y 8 cabezas de clave/valor, con un vocabulario de 128.256 tokens y embeddings de entrada y salida atados. El modelo base se entreno sobre del orden de 9 billones de tokens segun Meta. No hay evidencia en el repositorio de que este fine-tune modifique ninguna de estas dimensiones.

Sobre el proceso de ajuste solo se dispone de lo que sugiere el identificador: destilacion a partir de datos de GSM8K, un algoritmo de optimizacion por politica relativa a grupos (GRPO, el mismo usado en la familia DeepSeek-R1) con un supuesto presupuesto de 40 pasos, y un parametro o nivel denominado `lambda256`. Los segmentos `adfp` y `math-level1` no son interpretables con la informacion disponible. No se documentan ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de SFT, DPO o RLHF adicionales, ni hiperparametros como tasa de aprendizaje, tamano de lote o configuracion de decodificacion recomendada.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3.2 3B.
- Razonamiento matematico de nivel basico presumiblemente reforzado mediante destilacion sobre GSM8K y optimizacion con GRPO, segun el identificador del repositorio (no verificado con evaluaciones publicadas).
- Generacion de cadenas de razonamiento paso a paso para problemas aritmeticos de enunciado verbal, si el ajuste ha funcionado segun lo esperado.
- Conversacion multiturno basica, supeditada a que el ajuste no haya degradado el comportamiento instruccional del modelo base (el repositorio no indica si se partio de la version `-Instruct`).
- Capacidades multilingues: no declaradas en este repositorio; las del modelo base se limitan a los 8 idiomas indicados arriba.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Vision, audio o modo "thinking" explicito: no disponibles; Llama 3.2 3B es un modelo exclusivamente de texto.

## Casos de uso

- Tutoria de matematicas de educacion primaria y secundaria: el modelo puede resolver problemas de enunciado verbal y generar la explicacion intermedia paso a paso, un formato util para plataformas de refuerzo escolar que necesitan justificar la respuesta.
- Generacion de datos sinteticos de razonamiento: sirve como generador de soluciones candidatas para ampliar conjuntos tipo GSM8K antes de filtrarlas con un verificador o con un modelo mayor, una practica habitual en pipelines de destilacion.
- Investigacion en RL para razonamiento: al estar ajustado con GRPO segun el identificador, es util como punto de partida o linea base en experimentos sobre recompensas verificables en tareas matematicas con presupuesto de computo muy reducido.
- Evaluacion de pipelines de destilacion: permite medir cuanto de la capacidad de un profesor mayor se transfiere a un alumno de 3B y detectar si el ajuste produce sobreajuste al formato de GSM8K.
- Inferencia local en portatil sin GPU dedicada: cuantizado a 4 bits ocupa del orden de 2 GB, por lo que cabe en CPU con llama.cpp u Ollama y permite prototipar asistentes matematicos sin conexion.
- Clasificacion y verificacion de soluciones: el modelo puede usarse como juez barato para puntuar o descartar respuestas generadas por otros sistemas en un pipeline de filtrado de datos.
- Filtrado de candidatos en un sistema de recuperacion aumentada: como componente de bajo coste para descartar contextos irrelevantes antes de invocar un modelo mayor.
- Pruebas de regresion en CI/CD de modelos: su tamano reducido permite incluirlo en pruebas automatizadas que validen tokenizadores, plantillas de chat y scripts de conversion a GGUF sin consumir GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no declara resultados en GSM8K, MMLU, HumanEval ni ARC, y no se ha encontrado ninguna publicacion o blog asociado al autor con mediciones. Aunque el nombre del modelo alude a GSM8K, no debe asumirse ninguna cifra de exactitud sin evidencia publicada.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: en fp32, del orden de 12,9 GB (coincide con el tamano del repositorio); en bf16/fp16, unos 6,4 GB; en int8, unos 3,2 GB; en GGUF Q4_K_M, alrededor de 2 GB.
- Memoria adicional para la cache KV: con la configuracion del modelo base (8 cabezas KV, 128 dimensiones de cabeza, 28 capas) la cache en fp16 ocupa del orden de 0,11 MB por token y capa agregada, es decir, aproximadamente 0,9 GB para 8.000 tokens y unos 14 GB para 128.000 tokens. El contexto largo es, por tanto, el principal consumidor de memoria, no los pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para fp32 sin cuantizar hacen falta 16 GB o mas (RTX 4080, RTX 4090, A100 40 GB). Para servir en produccion con contexto largo, A100 80 GB o H100.
- Cabe en GPU de consumo: si. En cuantizacion de 4 bits cabe incluso en GPUs de 6-8 GB y en Mac con memoria unificada de 8 GB.
- Opciones de despliegue: vLLM y TGI para servido con batching continuo en GPU; llama.cpp y Ollama para CPU o GPU modesta (requiere convertir los safetensors a GGUF); Transformers con `device_map` para prototipado; SGLang como alternativa a vLLM. Al ser un modelo Llama, todas las herramientas estandar son compatibles tras ajustar la plantilla de chat.
- Latencia y throughput: no disponibles, no hay mediciones publicadas. A modo orientativo y sin caracter de dato medido, un modelo denso de 3B en bf16 sobre una RTX 4090 suele generar del orden de 100 a 150 tokens por segundo en decodificacion para una sola secuencia, con agregacion notablemente mayor al usar batching continuo en vLLM.
- Almacenamiento: el repositorio completo ocupa 12,9 GB en disco en su formato actual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluaciones publicadas |
|---|---|---|---|---|---|
| Llama-3.2-3B-gsm8k-distill-... (este modelo) | 3,21 B | No declarado (base: 131.072) | Llama 3.2 Community | safetensors | No disponibles |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community | safetensors | Si, en la model card oficial |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos, ampliable con YaRN | Qwen Research License | safetensors | Si, en la model card oficial |
| Phi-3.5-mini-instruct | 3,8 B | 131.072 tokens | MIT | safetensors | Si, en la model card oficial |
| Gemma 2 2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors | Si, en la model card oficial |

La comparacion de rendimiento no es posible: no existen resultados publicados de este ajuste. La principal diferencia frente a las alternativas es que se trata de un fine-tune de investigacion sin evaluacion, sin model card y sin garantia de mantenimiento, mientras que los otros cuatro son modelos oficiales con soporte y documentacion.

## Limitaciones y advertencias

- No existe model card sustantiva: el repositorio solo contiene las etiquetas de licencia y modelo base. Cualquier afirmacion sobre su entrenamiento distinta de la inferida del nombre del repositorio carece de respaldo.
- Riesgo de alucinacion elevado en un modelo de 3B, especialmente en razonamiento matematico de varios pasos, donde un error intermedio invalida el resultado final aunque el formato sea correcto.
- Riesgo de sobreajuste al formato de GSM8K: un ajuste con solo 40 pasos de GRPO segun el identificador puede mejorar la adherencia al formato sin mejorar la capacidad de razonamiento subyacente, y degradar el comportamiento conversacional general del modelo base.
- Posible degradacion de capacidades generales (olvido catastrofico) al especializar un modelo de 3B en una unica tarea.
- Idioma: no se declara soporte multilingue en este repositorio. El entrenamiento con datos GSM8K, mayoritariamente en ingles, hace esperable un rendimiento muy inferior en castellano.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad. Al heredar los datos del modelo base, arrastra los sesgos de su corpus de preentrenamiento sin filtrado adicional conocido.
- Licencia: la Llama 3.2 Community License permite uso comercial con condiciones (entre ellas, mantener el aviso "Built with Llama", restricciones al uso de las salidas para entrenar otros modelos de lenguaje y un limite de 700 millones de usuarios mensuales para el licenciatario antes de requerir licencia adicional). Es responsabilidad del integrador revisar el texto completo de la licencia.
- Trazabilidad: el repositorio tiene 0 descargas y 0 valoraciones, sin historial de uso que permita juzgar su calidad. Los metadatos indican una fecha de creacion de 2026-09-15, posterior a la fecha habitual de los modelos Llama 3.2, lo que conviene verificar antes de integrarlo.
- Produccion: no se recomienda su uso en sistemas criticos sin una evaluacion propia en el dominio objetivo, incluida la comparacion contra el modelo base sin ajustar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256-grpo40-math-level1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Paper de la familia Llama 3 (incluye Llama 3.2): https://arxiv.org/abs/2407.21783
- Blog oficial de Meta sobre Llama 3.2: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio de llama.cpp para conversion a GGUF: https://github.com/ggerganov/llama.cpp
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran paginas de ayuda de Google Translate sin relacion con el repositorio.

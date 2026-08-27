# salohcin714/granite-4.2-3b-6bit-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-6bit-mlx` es una conversión y cuantización en formato MLX del modelo Granite 4.2 3B de IBM, realizada por el usuario salohcin714. El modelo original, desarrollado por el equipo Granite de IBM, pertenece a la familia Granite 4.2, que incluye arquitecturas densas decoder-only en tamaños de 3B, 8B y 30B, con capacidades integradas de razonamiento chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta versión concreta está pensada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería MLX.

La cuantización aplicada es de 6 bits con cuantización afín y grupo de tamaño 64, sin calibración, y no se ha realizado ningún fine-tuning adicional. El repositorio contiene los pesos en formato safetensors de MLX, con un total de 800.729.600 parámetros según los datos reales del archivo, y un tamaño de repositorio de 3,0 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Este modelo resulta relevante para desarrolladores que trabajan en ecosistemas Apple y necesitan un modelo de razonamiento y generación de texto multilingüe con soporte de tool calling, optimizado para memoria y velocidad en chips M-series.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only transformer (familia Granite 4.2) |
| Parametros totales | 800.729.600 (dato real de safetensors; el nombre comercial es 3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 6-bit affine, group size 64, redondeo al mas cercano, sin calibracion |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base, Granite 4.2 3B de IBM, es un transformer denso decoder-only post-entrenado sobre los modelos base Granite 4.1. Segun la documentacion oficial de IBM, la familia Granite 4.2 incorpora razonamiento chain-of-thought integrado, modos de pensamiento flexibles (thinking modes) y tool calling aumentado con razonamiento. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

La conversion a MLX se realizo con la libreria mlx-lm version 0.31.3. Los pesos se convirtieron al layout safetensors de MLX y se cuantizaron a 6 bits con cuantizacion afine, grupo de tamaño 64 y redondeo al entero mas cercano, sin etapa de calibracion. Se eliminaron los pesos redundantes de `lm_head.weight` cuando el modelo ata las embeddings de entrada y salida. No se realizo fine-tuning ni se anadieron datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto y conversacion multilingue en 12 idiomas (aleman, arabe, checo, chino, coreano, espanol, frances, ingles, italiano, japones, neerlandes y portugues).
- Razonamiento chain-of-thought integrado, con modos de pensamiento flexibles que permiten activar o desactivar el razonamiento explicito segun la tarea.
- Tool calling aumentado con razonamiento, lo que permite al modelo decidir que herramientas usar y como encadenarlas en tareas complejas.
- Soporte para asistentes de IA y flujos de trabajo de agente, gracias a su capacidad de razonamiento multi-paso.
- Capacidad de codificacion y generacion de codigo, aunque no se especifican benchmarks concretos en la informacion disponible.
- Optimizado para ejecucion en Apple Silicon mediante MLX, con cuantizacion de 6 bits que reduce el uso de memoria y mejora la latencia en hardware de Apple.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en varios idiomas, aprovechando su capacidad de razonamiento para comprender intenciones complejas y generar respuestas coherentes. Su tamano reducido (800M parametros) permite desplegarlo en servidores modestos o en dispositivos Apple.
- Asistentes de codigo en entornos de desarrollo: gracias a su soporte de tool calling y generacion de codigo, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar o generar fragmentos de codigo, especialmente en equipos que usan Macs.
- Agentes de automatizacion de tareas: el modelo puede actuar como agente que razona sobre una tarea, decide que herramientas invocar (por ejemplo, APIs, calculadoras, buscadores) y ejecuta los pasos necesarios, gracias a su razonamiento chain-of-thought y tool calling.
- Analisis y resumen de documentos en varios idiomas: su capacidad multilingue y de generacion de texto permite resumir, extraer informacion o traducir contenido en los 12 idiomas soportados, util para empresas internacionales.
- Prototipado rapido de aplicaciones de IA en Mac: al estar en formato MLX y cuantizado a 6 bits, es ideal para desarrolladores que quieren probar modelos de razonamiento en su MacBook sin necesidad de GPUs dedicadas, usando mlx-lm para inferencia local.
- Educacion e investigacion en PLN: su licencia Apache 2.0 y su tamano moderado lo hacen adecuado para experimentos academicos, fine-tuning posterior o estudios comparativos de modelos cuantizados frente a los originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente que los benchmarks publicados por IBM describen los pesos originales, no este artefacto cuantizado, y no deben interpretarse como afirmaciones sobre este repositorio. Por tanto, no se proporcionan tablas de rendimiento para esta version concreta.

## Requisitos de hardware

- El modelo esta disenado para Apple Silicon (chips M1, M2, M3, M4 y sucesores) gracias al formato MLX.
- VRAM estimada: el repositorio ocupa 3,0 GB, por lo que se recomienda al menos 4 GB de memoria unificada libre para cargar los pesos y ejecutar inferencia. En la practica, un Mac con 8 GB de RAM unificada es suficiente para uso interactivo.
- GPU recomendadas: no aplica GPUs discretas; se ejecuta en la GPU integrada de los chips Apple Silicon via MLX.
- Opciones de despliegue: principalmente mediante la libreria mlx-lm (Python), con funciones `load` y `generate`. Tambien puede usarse con otras herramientas del ecosistema MLX, como `mlx_lm.server` para servir el modelo via API.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de ~800M parametros cuantizado a 6 bits, se espera una latencia baja en hardware Apple moderno, adecuada para aplicaciones interactivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Granite 4.2 3B (original) | ~3B (nominal) | No disponible | Apache 2.0 | safetensors (original) | Razonamiento, tool calling, multilingue |
| Granite 4.1 3B (MLX 6-bit) | ~800M (real) | No disponible | Apache 2.0 | MLX safetensors | Similar, sin razonamiento explicito |
| Llama 3.2 3B | ~3.2B | 128K | Llama 3.2 | Varios | Generacion, multilingue, sin tool calling nativo |
| Qwen2.5 3B | ~3.1B | 32K | Apache 2.0 | Varios | Generacion, codigo, multilingue |

Nota: los datos de contexto y parametros de los modelos comparados provienen de conocimiento general y no estan verificados en la informacion proporcionada. La comparativa es cualitativa, ya que no se dispone de benchmarks comunes.

## Limitaciones y advertencias

- La cuantizacion de 6 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en precision completa, especialmente en tareas de razonamiento complejo o generacion de codigo.
- No se han realizado evaluaciones de sesgos o alucinaciones especificas para esta version cuantizada. Como cualquier modelo de lenguaje, puede generar contenido falso o sesgado.
- La longitud de contexto no se ha especificado en la informacion disponible; se recomienda consultar la documentacion del modelo base de IBM para conocer el limite real.
- El modelo solo esta optimizado para Apple Silicon; no se proporcionan versiones para CUDA o ROCm, lo que limita su uso en clusters con GPUs NVIDIA o AMD.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor del repositorio no esta afiliado a IBM y los benchmarks de IBM no aplican a este artefacto cuantizado.
- El numero de parametros real (800M) difiere del nombre comercial "3B", lo que puede causar confusion al dimensionar recursos; se recomienda verificar siempre los pesos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-6bit-mlx
- Modelo base (IBM Granite 4.2 3B): https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm

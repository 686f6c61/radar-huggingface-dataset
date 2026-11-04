# latrompeababar/Qwen3.5-9B-oQ2.7e

## Resumen

Qwen3.5-9B-oQ2.7e es una cuantizacion mixta del modelo Qwen3.5-9B, publicada por el usuario latrompeababar en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia eficiente en Apple Silicon mediante la librería MLX. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica precision mixta por capas y grupos de tensores en lugar de una cuantizacion uniforme.

El checkpoint resultante ocupa 4,8 GB en disco (4,462 GiB de pesos) frente a los aproximadamente 18 GB que requeriria el modelo en BF16, con un promedio efectivo de 4,073 bits por peso. La distribucion no es homogenea: el 21,75% de los pesos (2.047B parametros) se almacena a 2 bits con grupo 64, mientras que un 15,09% se mantiene a 5 bits y un 4,86% (0.457B parametros, correspondiente al codificador visual) permanece en BF16.

El modelo base pertenece a la familia Qwen3.5, que incorpora un componente de vision (0.456B parametros), por lo que se trata de un modelo multimodal. Es relevante para desarrolladores que necesiten ejecutar un modelo de ~9.400 millones de parametros con capacidades de vision en equipos con memoria unificada limitada, aunque la agresividad de la cuantizacion en parte de las capas invita a validar la calidad antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64, 3-bit grupo 128, 3-bit grupo 64, 5-bit grupo 64, 8-bit grupo 64 y BF16; promedio efectivo 4,073 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que la familia Qwen3.5 emplea un transformer y que este checkpoint concreto incluye dos componentes diferenciados: un modelo de lenguaje de 8.954B parametros y un modulo de vision de 0.456B parametros. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion mixta aplicado con oQ (oMLX v0.7.3). En lugar de cuantizar todos los tensores al mismo numero de bits, se asignan precisiones distintas segun la sensibilidad de cada capa: las capas mas robustas a la cuantizacion se comprimen a 2 bits con grupo 64 (2.047B parametros, 0,596 GiB), mientras que una fraccion pequena se conserva a 5 bits (1.420B parametros, 0,909 GiB) y el codificador visual completo se mantiene en BF16 (0,851 GiB). El resultado es un checkpoint de 4,462 GiB con un promedio de 4,073 bits/peso, equilibrando tamano y fidelidad de los pesos.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Qwen3.5-9B, conserva las capacidades del modelo base, aunque la cuantizacion agresiva de parte de las capas puede degradar tareas de razonamiento complejo.
- Procesamiento de vision: incluye un codificador visual de 0.456B parametros mantenido en BF16, lo que permite tareas de comprension de imagenes.
- Generacion de codigo y matematicas: previsible en la familia Qwen, si bien no hay datos especificos publicados para este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.
- Ejecucion nativa en Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,8 GB permite cargar un modelo de 9,4B parametros con vision en equipos de 16 GB de RAM unificada, algo inviable con los pesos en BF16.
- Prototipado rapido de aplicaciones multimodales: util para validar pipelines de vision-lenguaje en local antes de desplegar la version completa del modelo en servidores.
- Asistentes de escritorio offline: al ejecutarse con MLX en macOS, puede integrarse en aplicaciones de escritorio que requieran privacidad total sin llamadas a API externas.
- Analisis de documentos con imagenes en entornos con recursos limitados: el codificador visual en BF16 preserva la calidad de extraccion de caracteristicas visuales mientras el modelo de lenguaje ocupa menos memoria.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica para estudiar el impacto de la precision mixta (2/3/5/8 bits) en la calidad de salida frente al modelo original.
- Experimentacion academica en hardware de consumo: permite a investigadores sin acceso a GPUs de datacenter ejecutar un modelo de casi 10B parametros para estudios de sesgo, alucinacion o evaluacion de capacidades.
- Generacion de texto asistida en flujos de trabajo de macOS: integrable en scripts y herramientas CLI que aprovechen el backend MLX para tareas de redaccion o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la distribucion de bits y el desglose de almacenamiento, sin metricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4,8 GB para los pesos; con overhead de activaciones y cache KV, se recomienda un minimo de 8 GB de memoria unificada, y 16 GB para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de la libreria MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y al menos 8-16 GB de memoria unificada.
- Opciones de despliegue: MLX (mlx-lm), oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI dado el formato MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.7e | 9,41B | No disponible | safetensors (MLX) | No disponible | HuggingFace, 0 descargas |
| Qwen3.5-9B (original, BF16) | ~9,4B | No disponible | safetensors | No disponible en esta ficha | Referencia del checkpoint |
| Qwen2.5-VL-7B | ~8,3B | 128K (segun documentacion publica del modelo) | safetensors, GGUF | Apache 2.0 (segun documentacion publica) | Amplia, multiples cuantizaciones |
| Llama 3.2 11B Vision | ~10,7B | 128K (segun documentacion publica) | safetensors, GGUF | Llama Community License | Amplia |

Nota: los datos de los modelos comparativos provienen de documentacion publica general y no de la informacion proporcionada en esta busqueda; verifiquense antes de usarlos en decisiones de produccion.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 21,75% de los pesos se almacena a 2 bits, lo que puede provocar degradacion notable en tareas de razonamiento, matematicas y generacion de codigo frente al modelo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad respecto al Qwen3.5-9B completo; es imprescindible evaluar en el caso de uso concreto.
- Licencia no especificada: no se indica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial esta permitido.
- Idiomas no documentados: se desconoce el soporte multilingue real de esta conversion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion puede incrementarlo en capas comprimidas a 2 bits.
- Compatibilidad limitada: el formato MLX restringe su uso a hardware Apple Silicon; no es desplegable en GPUs NVIDIA o AMD sin reconversion.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Contexto desconocido: no se ha publicado la longitud de ventana de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Sin garantias de mantenimiento: al ser una publicacion de un usuario individual, no hay compromiso de actualizaciones o correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latrompeababar/Qwen3.5-9B-oQ2.7e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base Qwen3.5: no disponible en la informacion proporcionada

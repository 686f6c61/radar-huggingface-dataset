# hsk0201/Qwen3.6-35B-A3B-oQ4e-fp16-mtp

## Resumen

`hsk0201/Qwen3.6-35B-A3B-oQ4e-fp16-mtp` es una cuantizacion de 4 bits del modelo base `Qwen/Qwen3.6-35B-A3B`, publicada por el usuario hsk0201 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos pensada para el ecosistema MLX de Apple, generada con la herramienta oMLX v0.5.0.rc1 y su esquema "OQ Enhanced quantization (oQe) iMatrix". El resultado conserva los cabezales de prediccion multi-token (MTP) del modelo original, lo que habilita decodificacion especulativa sobre los pesos cuantizados.

El modelo base pertenece a la familia Qwen 3.6 y sigue una arquitectura MoE (etiqueta `qwen3_5_moe` en el repositorio), con 35.951.822.704 parametros totales y, segun las referencias publicas consultadas, unos 3.000 millones de parametros activos por token. El repositorio ocupa 22,5 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card indica que se conservan tanto las capacidades de texto como las de vision.

Su relevancia es practica: permite ejecutar un MoE de ~36.000 millones de parametros en equipos con memoria unificada relativamente modesta, manteniendo parte de los componentes en FP16 para preservar calidad numerica. El autor senala que FP16 es la configuracion mas rapida en chips M1 y M2, aunque el modelo funciona en cualquier sistema de inferencia MLX. La adopcion es todavia muy baja (12 descargas y 0 "likes" en el momento de la consulta), por lo que debe tratarse como un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen 3.6; etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B por token (dato de fuentes secundarias, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (OQ Enhanced / oQe iMatrix) con componentes FP16, F16, F32 y U32 en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo base, solo la conversion. Lo que si se puede afirmar es que se trata de un transformer con mezcla de expertos (MoE), herencia directa de `Qwen/Qwen3.6-35B-A3B`, y que la model card conserva explicitamente los cabezales MTP (*Multi-Token Prediction*). Esos cabezales son los que permiten la decodificacion especulativa, es decir, predecir varios tokens candidatos por paso y verificarlos despues, con la consiguiente ganancia de throughput sin alterar la distribucion de salida del modelo verificador.

La cuantizacion se realizo con oMLX v0.5.0.rc1 bajo el esquema OQ Enhanced con matrices de importancia (iMatrix), que asigna precision de forma selectiva en lugar de aplicar un redondeo uniforme. El autor mantiene ademas componentes en FP16, lo que explica tanto el tamano de 22,5 GB como la recomendacion de usar FP16 como configuracion rapida en M1 y M2. El repositorio incluye tambien una plantilla de chat corregida (FROGGERIC v21) para Qwen 3.5 y 3.6. No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en el modo estandar del modelo base.
- Vision: la model card afirma explicitamente "Text and vision retained", por lo que se conservan las capacidades multimodales del modelo original.
- Prediccion multi-token (MTP): los cabezales estan retenidos, lo que habilita decodificacion especulativa con el propio modelo como drafter.
- Plantilla de chat corregida mediante FROGGERIC v21, orientada a corregir problemas de formato en Qwen 3.5 y 3.6.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- **Inferencia local en Mac con memoria unificada**: el modelo esta empaquetado en MLX con cuantizacion de 4 bits, de modo que un equipo Apple Silicon con 32 GB de memoria unificada puede cargar los ~22,5 GB del repositorio y ejecutar generacion de texto e imagen sin depender de la nube.
- **Prototipado multimodal en escritorio**: al conservar la vision, sirve para construir herramientas internas de descripcion de imagenes, extraccion de informacion de capturas o revision de documentos escaneados directamente sobre el portatil del desarrollador.
- **Servicio de chat con plantilla corregida**: la plantilla FROGGERIC v21 evita los fallos de formato tipicos de Qwen 3.5/3.6, lo que reduce la necesidad de saneado posterior de la salida en aplicaciones de conversacion multi-turno.
- **Aceleracion mediante decodificacion especulativa**: al retener los cabezales MTP, el modelo puede actuar como drafter y verificador en el mismo proceso, aumentando el throughput en tareas de generacion larga como resumen de documentos o redaccion asistida.
- **Evaluacion comparativa de cuantizaciones**: resulta util como punto de referencia frente a la variante `hsk0201/Qwen3.6-35B-A3B-oQ4` para medir la perdida de calidad entre distintos esquemas de cuantizacion sobre el mismo modelo base.
- **Investigacion sobre MoE en hardware de consumo**: con ~3B de parametros activos por token, permite estudiar el comportamiento de modelos de mezcla de expertos en GPUs o SoC modestos sin necesidad de clústeres multi-GPU.
- **Generacion de codigo asistida en local**: adecuado para autocompletado y refactorizacion en entornos con requisitos de privacidad, siempre que el equipo disponga de memoria suficiente para los 22,5 GB del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las busquedas realizadas no aportan cifras de evaluacion verificables para esta cuantizacion concreta.

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: el repositorio ocupa 22,5 GB, por lo que se recomienda un minimo de 24 GB de memoria disponible y 32 GB para trabajar con comodidad y contexto amplio.
- **Plataforma objetivo**: MLX, es decir, Apple Silicon (familias M1, M2, M3 y M4). El autor indica que FP16 es la configuracion mas rapida en M1 y M2, aunque el modelo funciona en cualquier sistema de inferencia MLX.
- **GPUs recomendadas**: no disponible para MLX, ya que MLX no se ejecuta sobre CUDA. Para las variantes GGUF o CUDA del modelo base, las referencias externas mencionan RTX 3090, RTX 4090, RTX 5070 Ti, configuraciones duales de RTX 5060 Ti y M3 Ultra.
- **Compatibilidad con GPU de consumo**: si, en equipos Apple Silicon con 24-32 GB de memoria unificada o superior. No es compatible con GPU NVIDIA a traves de MLX.
- **Opciones de despliegue**: MLX y `mlx-lm`. Para el modelo base en otros backends, las referencias externas citan vLLM con decodificacion especulativa MTP. No disponible para llama.cpp u Ollama en el caso concreto de estos pesos.
- **Latencia y throughput**: no disponible para esta cuantizacion MLX. Una referencia externa no vinculada a este repositorio cita 80 tokens por segundo en 12 GB de VRAM usando vLLM y decodificacion especulativa MTP sobre Qwen 3.6 35B A3B; esa cifra no debe atribuirse a los pesos MLX aqui descritos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `hsk0201/Qwen3.6-35B-A3B-oQ4e-fp16-mtp` | ~36B totales, ~3B activos | no disponible | 4 bits oQe iMatrix con FP16 | safetensors (MLX) | Apache 2.0 | Retiene cabezales MTP; 22,5 GB; 12 descargas |
| `hsk0201/Qwen3.6-35B-A3B-oQ4` | ~36B totales, ~3B activos | no disponible | 4 bits | safetensors (MLX) | Apache 2.0 | Variante sin el sufijo `fp16-mtp`; mismos pesos base |
| `Qwen/Qwen3.6-35B-A3B` | ~36B totales, ~3B activos | no disponible | sin cuantizar (precision completa) | safetensors | Apache 2.0 | Modelo base original; mayor consumo de memoria |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Adopcion practicamente nula**: 12 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion independiente sobre la fidelidad de la cuantizacion.
- **Dependencia de un unico autor**: se trata de una conversion realizada por un usuario individual (hsk0201), no por el equipo de Qwen, con el riesgo de reproducibilidad que ello conlleva.
- **Idiomas no documentados**: la model card no especifica que idiomas se conservan tras la cuantizacion, por lo que no se puede garantizar el comportamiento multilingue del modelo base.
- **Longitud de contexto desconocida**: no se documenta la ventana de contexto efectiva, dato critico para aplicaciones de contexto largo.
- **Riesgo de alucinacion**: inherente a cualquier modelo de lenguaje; no se han publicado evaluaciones de fidelidad para esta cuantizacion concreta.
- **Degradacion por cuantizacion**: el esquema de 4 bits puede degradar tareas sensibles a la precision numerica (matematicas, razonamiento de multiples pasos) respecto al modelo base sin cuantizar. No hay mediciones publicadas.
- **Sesgos**: no disponible. La model card no incluye ninguna seccion de analisis de sesgos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados.
- **Compatibilidad de backend**: al estar en formato MLX, no es directamente utilizable en vLLM, llama.cpp ni Ollama sin una conversion adicional.
- **Plantilla de chat modificada**: el uso de la plantilla FROGGERIC v21, distinta de la oficial de Qwen, puede producir discrepancias si se integra con herramientas que asumen las plantillas estandar.
- **Aviso de contenido**: el contenido citado de la model card es material de referencia del autor y no debe interpretarse como instrucciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsk0201/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Variante oQ4 del mismo autor: https://huggingface.co/hsk0201/Qwen3.6-35B-A3B-oQ4
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.6-35B-A3B
- Guia de despliegue local en hardware de consumo: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Articulo sobre decodificacion especulativa con MTP: https://dasroot.net/posts/2026/05/qwen-36-35b-a3b-80-tok-s-12gb-vram-mtp-speculative-decoding/

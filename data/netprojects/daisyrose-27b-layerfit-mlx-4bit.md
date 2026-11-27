# netprojects/DaisyRose-27B-LayerFit-MLX-4bit

## Resumen

DaisyRose-27B-LayerFit-MLX-4bit es una cuantizacion en 4 bits del modelo multimodal RadixArk/DaisyRose-27B, publicada por NetProjects para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo base es un ajuste por aprendizaje por refuerzo orientado a agentes (agentic RL) sobre Qwen3.8-27B, segun indica el autor de la model card, y conserva la torre de vision en bf16, por lo que mantiene la capacidad de procesar imagen y texto de entrada (pipeline image-text-to-text).

La innovacion principal de esta publicacion es el metodo LayerFit, una busqueda de precision por capa que asigna mas bits a las partes del modelo mas sensibles a la cuantizacion (bloques MLP, atencion, atencion lineal, embeddings y cabeza de salida) dentro de un presupuesto de tamano fijo. El resultado ocupa 16,5 GB en disco y esta pensado para Macs de 32 GB de memoria unificada. Incluye ademas la cabeza de prediccion multi-token (MTP) del modelo base en 8 bits para acelerar la decodificacion especulativa.

El modelo es relevante para desarrolladores que quieran ejecutar un modelo de aproximadamente 28.200 millones de parametros con vision, tool calling y modo de razonamiento en hardware de consumo Apple, sin depender de GPU dedicadas. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque el modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que su validacion practica por terceros es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag qwen3_5) con atencion lineal y cabeza de prediccion multi-token (MTP); torre de vision en bf16 |
| Parametros totales | 28.206.101.232 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con receta LayerFit por capa; cabeza MTP en 8 bits; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx / mlx-vlm |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5 (tag `qwen3_5`), un transformer multimodal con modulos de atencion lineal ademas de atencion estandar, segun se deduce de la descripcion de LayerFit, que menciona explicitamente "every layer's MLP, attention and linear-attention blocks". El modelo base, RadixArk/DaisyRose-27B, es descrito por el autor como un ajuste de Qwen3.8-27B mediante aprendizaje por refuerzo orientado a agentes (agentic RL). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF o DPO en la informacion proporcionada.

Sobre esta base, NetProjects aplica una cuantizacion selectiva por capas: mide la degradacion de cada bloque a baja precision y distribuye el presupuesto de bits donde mas reduce el error. Segun la model card, con el mismo tamano que una cuantizacion estandar de 4 bits, LayerFit alcanza un 94,0% de acuerdo top-1 con el modelo bf16 frente al 93,0% del 4 bits estandar, y reduce la divergencia KL de 0,0358 a 0,0236 (un 34% menos). La receta exacta de bits esta en el archivo `layerfit-recipe.json` del repositorio. Se conserva la cabeza MTP en 8 bits para habilitar decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento en modo "thinking" (la model card reporta 2/2 pruebas superadas).
- Capacidad de vision: procesamiento de imagen y texto de entrada (image-text-to-text); la torre de vision se mantiene en bf16.
- Generacion de codigo (la model card reporta 3/3 en pruebas de codigo).
- Tool calling / function calling (la model card reporta "pass").
- Comportamiento orientado a agentes, heredado del ajuste agentic RL del modelo base.
- Razonamiento matematico basico: 44/50 en GSM8K-50 con el modo thinking desactivado.
- Decodificacion especulativa mediante cabeza MTP integrada.
- Capacidades multilingues: no disponible en detalle; las pruebas de LayerFit mencionan pasajes en ingles y otros idiomas sin especificar cuales.

## Casos de uso

- Asistente de desarrollo local en Mac: con tool calling y generacion de codigo verificados en las pruebas del autor, puede integrarse en flujos de edicion y refactorizacion asistida ejecutados enteramente en un Mac de 32 GB, sin enviar codigo a servicios externos.
- Analisis de capturas y documentos escaneados: la torre de vision en bf16 permite pasar imagenes junto con instrucciones de texto para extraer informacion estructurada de facturas, formularios o diagramas.
- Agentes multi-paso en local: el ajuste agentic RL del modelo base y el soporte de function calling lo hacen adecuado para orquestar llamadas a herramientas en entornos de escritorio o prototipos de automatizacion.
- Razonamiento matematico y verificacion: el modo thinking permite abordar problemas de varios pasos; el resultado de GSM8K-50 (44/50 sin thinking) da una referencia de su fiabilidad en aritmetica basica.
- Prototipado de aplicaciones multimodales con MLX: al cargarse con mlx-lm y mlx-vlm estandar y funcionar en LM Studio, sirve para validar pipelines de vision-lenguaje antes de migrar a despliegues mayores.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP en 8 bits permite usar el mismo modelo como draft model para reducir la latencia en generacion de texto largo, util en asistentes interactivos.
- Procesamiento por lotes en estaciones de trabajo Apple: al ocupar 16,5 GB, deja margen en Macs de 32 GB para prompts largos y procesos concurrentes, adecuado para tareas de clasificacion o resumen de documentos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (no verificados de forma independiente):

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 44/50 |
| Codigo (3 pruebas) | 3/3 |
| Tool call | pass |
| Thinking (2 pruebas) | 2/2 |
| Entrada de imagen | pass |
| Acuerdo top-1 con bf16 (LayerFit 4-bit) | 94,0% |
| Acuerdo top-1 con bf16 (4-bit estandar) | 93,0% |
| Divergencia KL (LayerFit 4-bit) | 0,0236 |
| Divergencia KL (4-bit estandar) | 0,0358 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. El autor remite a la model card de RadixArk/DaisyRose-27B para los resultados del modelo base.

## Requisitos de hardware

- Memoria: 16,5 GB en disco; pensado para Macs con 32 GB de memoria unificada, dejando margen para macOS y prompts largos (la descarga es como maximo el 60% de la memoria del sistema, segun el autor).
- Variantes alternativas del mismo autor: 2,5 bits (11,5 GB) para Macs de 16 GB en modo ajustado, 3 bits (13,1 GB) para 24 GB, y builds estandar de 6 y 8 bits para 48 GB o mas.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato es MLX para Apple Silicon y no se indica compatibilidad con CUDA.
- Ajuste de memoria en Macs de 16 GB: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el limite de memoria cableada de la GPU.
- Despliegue: mlx-lm (texto), mlx-vlm (multimodal) y LM Studio; formato MLX estandar.
- Decodificacion especulativa: se usa el propio modelo como draft model con `--draft-kind mtp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-LayerFit-MLX-4bit | 28,2 B | no disponible | MLX 4-bit, Apple Silicon | Apache-2.0 | Vision, MTP, tool calling |
| RadixArk/DaisyRose-27B (base) | 27 B (nominal) | no disponible | Pesos completos | Apache-2.0 | Modelo de referencia sin cuantizar |
| DaisyRose-27B-LayerFit-MLX-3bit (mismo autor) | 28,2 B | no disponible | MLX 3-bit (13,1 GB) | Apache-2.0 | Menor huella, mayor perdida de precision |
| DaisyRose-27B-MLX-6bit / 8bit (mismo autor) | 28,2 B | no disponible | MLX 6/8-bit | Apache-2.0 | Recomendados para 48 GB o mas |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de los resultados reportados por el autor.
- Los benchmarks de la model card son pruebas reducidas (GSM8K-50, 3 pruebas de codigo, 2 de thinking) y no equivalen a evaluaciones estandar completas.
- La cuantizacion a 4 bits introduce degradacion respecto al bf16: el propio autor reporta un 94,0% de acuerdo top-1, es decir, un 6% de discrepancias en la siguiente token.
- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPU NVIDIA/AMD con vLLM, TGI o llama.cpp en formato nativo.
- En Macs de 16 GB el uso es "stretch" y requiere cerrar aplicaciones y limitar la longitud de los prompts.
- Idiomas soportados no documentados; el comportamiento multilingue puede degradarse respecto al modelo base, especialmente en lenguas de bajos recursos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion; conviene verificar salidas en contextos criticos.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado al publicador del modelo base; conviene revisar LICENSE y NOTICE del repositorio.
- LayerFit es una marca registrada de NetProjects; la receta de bits esta en `layerfit-recipe.json`, pero no se detalla la metodologia completa de busqueda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Variante 2,5 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-2.5bit
- Variante 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-3bit
- Variante 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Variante 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com

# nativ-community/flint-bf16

## Resumen

Flint BF16 es una conversión a formato MLX del modelo Flint, desarrollado originalmente por RecursiveSI. Esta versión, publicada por nativ-community, contiene los pesos sin cuantizar en BF16 dispuestos según el layout de MLX-VLM, incluidos los expertos apilados ("stacked experts"), lo que indica que el modelo base emplea una arquitectura de mezcla de expertos (MoE). El repositorio pesa 79,6 GB y alberga aproximadamente 39,79 mil millones de parámetros totales según los metadatos de safetensors.

El propósito de esta conversión es permitir la ejecución del modelo en hardware Apple Silicon mediante el framework MLX y la librería MLX-VLM, manteniendo intactos el tokenizador, la plantilla de chat, la configuración de generación y la licencia Apache-2.0 del checkpoint original. La conversión se realizó con la versión 0.7.10 de MLX-VLM (commit fijado) y MLX 0.32.4, preservando la precisión del router específica del modelo.

Cabe destacar que se trata de una conversión de layout, no de un entrenamiento nuevo: la propia model card advierte que los pesos convertidos no han sido evaluados frente a la suite de benchmarks publicada del modelo original, y que las pruebas de validación realizadas son comprobaciones básicas de humo (smoke tests) sobre un Apple M5 Max, no una garantía de equivalencia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según evidencia de expertos apilados en la conversión; detalles completos no disponibles en esta ficha |
| Parametros totales | 39.785.299.488 (~39,79 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada de prompt y salida, según configuración original) |
| Tipos de cuantizacion | Ninguna (BF16 sin cuantizar); existen conversiones cuantizadas no referenciadas aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout MLX-VLM, BF16) |

## Arquitectura y entrenamiento

La evidencia disponible apunta a una arquitectura MoE: la model card menciona explícitamente "stacked experts" (expertos apilados) en el layout de conversión y que el proceso preserva "model-specific router precision", lo que confirma la presencia de un mecanismo de enrutamiento entre expertos. No se han publicado en esta conversión detalles sobre el número de expertos, expertos activos por token ni parámetros activos por pasada; para esos datos debe consultarse la model card del modelo original, RecursiveSI/flint.

Sobre el entrenamiento del modelo base no hay información en la conversión: no se especifican tokens de entrenamiento, composición del dataset ni etapas de alineación (RLHF, DPO). Lo que sí documenta la model card es el proceso técnico de conversión: se partió del checkpoint BF16 de RecursiveSI/flint en la revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288`, se convirtió con `mlx_vlm.convert` en dtype bfloat16, y se copiaron sin cambios el tokenizador, la plantilla de chat (`chat_template.jinja`), la configuración de generación y la licencia. El modo de razonamiento ("thinking") se controla mediante la plantilla original; no se incluye ninguna opción para desactivarlo. Los valores de generación por defecto son temperatura 1,0, top-p 0,95 y top-k 20.

## Capacidades

- Generación de texto conversacional: el pipeline etiquetado es `text-generation` con orientación conversacional.
- Razonamiento con modo "thinking": la plantilla de chat original controla un modo de razonamiento cuyo consumo se descuenta del presupuesto de tokens de salida; se recomienda un presupuesto amplio para tareas complejas.
- Etiquetado `mlx-vlm`: el uso de esta librería sugiere posibles capacidades multimodales (visión), aunque la model card no las describe explícitamente ni detalla formatos de imagen soportados.
- Generación de codigo: los smoke tests incluyeron la escritura de una función en Python (fusión de intervalos solapados), validada por parsing AST, lo que indica competencia básica en codigo.
- Recuperación y aritmetica: las pruebas de validación incluyeron tareas cortas de retrieval y aritmetica, aunque a nivel de comprobación funcional.
- Tool calling y function calling: no disponible (no se menciona en la model card).
- Soporte multilingue: no disponible (los idiomas no están especificados ni en los metadatos ni en la model card).

## Casos de uso

- Ejecución local en Apple Silicon: al tratarse de pesos MLX BF16, el caso de uso principal es inferir el modelo en Mac con Apple Silicon (M-series) mediante MLX-VLM, sin necesidad de GPUs NVIDIA ni servidores remotos.
- Generacion de codigo asistida: puede emplearse para redactar funciones y utilidades en Python u otros lenguajes; los smoke tests muestran salida de codigo parseable como AST, adecuado para asistentes de programacion integrados en editores locales.
- Razonamiento paso a paso en tareas complejas: gracias al modo thinking controlado por plantilla, es util para descomponer problemas de logica o planificacion, siempre reservando un presupuesto de salida amplio.
- Prototipado de agentes locales con contexto largo: la ventana combinada de 262.144 tokens permite experimentar con conversaciones extensas o documentos largos cargados en el prompt, aunque la calidad en contexto largo no ha sido validada en esta conversion.
- Experimentacion e investigacion sobre MoE en MLX: al preservar la precision del router y ofrecer hashes SHA-256 y un script de reproduccion, es adecuado para investigadores que estudien el comportamiento de modelos MoE en el framework MLX.
- Procesamiento local de datos sensibles: la ejecucion en hardware propio evita enviar informacion a servicios externos, util en entornos con requisitos de privacidad o cumplimiento normativo.
- Evaluacion comparativa de precisiones: sirve como referencia BF16 sin cuantizar frente a la que contrastar conversiones cuantizadas del mismo modelo para medir la degradacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los pesos convertidos no han sido evaluados sobre la suite de benchmarks publicada del modelo fuente, y que las validaciones realizadas son smoke tests (recarga estricta del checkpoint, logits finitos en prefill/decode, comprobaciones de cache-position, aritmetica, retrieval corto y funciones Python simples) ejecutados en un Apple M5 Max con decodificacion greedy y presupuesto de 512 tokens.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con ~39,79 mil millones de parametros en BF16 (2 bytes por parametro), el modelo ocupa ~79,6 GB solo de pesos. En Apple Silicon se necesita al menos esa cantidad de memoria unificada disponible, mas margen para KV cache y activaciones; en la practica, un Mac con 96 GB o, mas seguramente, 128 GB o mas de memoria unificada.
- GPUs recomendadas: no aplica GPUs NVIDIA para este formato MLX; el destino son chips Apple Silicon de gama alta (M3 Ultra, M4 Max, M5 Max o superiores con suficiente memoria unificada). La validacion se realizo en un Apple M5 Max.
- Consumer GPUs: no cabe en GPUs de consumo convencionales (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes para los 79,6 GB de pesos BF16). Para hardware NVIDIA habria que recurrir al checkpoint original u otras conversiones con cuantizacion.
- Opciones de despliegue: MLX-VLM (libreria principal de esta conversion, via `mlx_vlm.generate` o API Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio; llama.cpp requeriria GGUF, formato no disponible aqui.
- Latencia y throughput: no disponible. Solo se sabe que las pruebas de humo se ejecutaron en Apple M5 Max con MLX 0.32.4, sin metricas de tokens por segundo publicadas.

## Comparativa con modelos similares

Comparar con exactitud es dificil porque ni el numero de parametros activos ni benchmarks del modelo fuente estan disponibles. Se ofrece una comparativa orientativa con otros modelos MoE de escala similar en parametros totales:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint BF16 (esta conversion) | ~39,8B | no disponible | 262.144 | Apache-2.0 | safetensors MLX (BF16) |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 (128.000 con YaRN) | Apache-2.0 | safetensors, GGUF, MLX |
| Mixtral 8x7B Instruct | 46,7B | 12,9B | 32.768 | Apache-2.0 | safetensors, GGUF |
| GLM-4.5-Air | 106B | 12B | 131.072 | MIT | safetensors, GGUF |

Nota: esta tabla es referencial; el rendimiento relativo de Flint no puede valorarse por la ausencia de benchmarks publicados para esta conversion.

## Limitaciones y advertencias

- Sin evaluacion de calidad: los pesos convertidos no han pasado por la suite de benchmarks del modelo original; las comprobaciones realizadas son smoke tests basicos, no una prueba de equivalencia con el checkpoint fuente ni con la implementacion Transformers.
- Sin validacion de contexto largo: aunque la configuracion soporta 262.144 tokens combinados, los smoke tests no validan la calidad del modelo en contextos largos.
- Consumo de razonamiento: el modo thinking consume presupuesto de salida, lo que puede truncar respuestas si no se ajusta `--max-tokens` a un valor alto en tareas complejas.
- Sin forma de desactivar el thinking: la conversion no incluye ningun override para deshabilitar el modo de razonamiento; el control depende exclusivamente de la plantilla original.
- Requisito de versiones fijadas: la conversion y ejecucion dependen de commits y versiones concretas (MLX-VLM commit `6d9ba32`, MLX 0.32.4); usar otras versiones puede producir comportamientos inesperados.
- Sesgos y alucinaciones: no hay documentacion especifica sobre sesgos en la model card de esta conversion; deben asumirse los del modelo base RecursiveSI/flint, no detallados aqui. El riesgo de alucinacion es inherente y no se ha cuantificado.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que introduce incertidumbre para uso en castellano.
- Requisito de memoria muy alto: los ~79,6 GB de pesos limitan el uso a estaciones Apple Silicon de memoria unificada muy elevada, excluyendo la mayoria de equipos de consumo.
- Licencia: Apache-2.0 es permisiva y permite uso comercial; no se identifican restricciones adicionales en la documentacion disponible.

## Enlaces

- Repositorio del modelo (esta conversion): https://huggingface.co/nativ-community/flint-bf16
- Modelo base (checkpoint fuente): https://huggingface.co/RecursiveSI/flint
- Revision concreta del modelo fuente: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- MLX-VLM (commit usado en la conversion): https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
- Repositorio de MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Registro de la conversion: https://huggingface.co/nativ-community/flint-bf16/blob/main/conversion.json
- Sumas de verificacion de artefactos: https://huggingface.co/nativ-community/flint-bf16/blob/main/SHA256SUMS
- Resultados de validacion: https://huggingface.co/nativ-community/flint-bf16/blob/main/validation.json

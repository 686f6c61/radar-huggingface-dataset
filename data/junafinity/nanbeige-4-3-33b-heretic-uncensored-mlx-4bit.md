# junafinity/Nanbeige-4.3-33B-Heretic-Uncensored-MLX-4bit

## Resumen

Nanbeige-4.3-33B-Heretic-Uncensored-MLX-4bit es una cuantizacion en formato MLX de 4 bits del modelo Luni/Nanbeige-4.3-33B-Heretic, a su vez una version "abliterated" (con los mecanismos de rechazo atenuados) del modelo base Nanbeige/Nanbeige4.3-33B. La publica el usuario junafinity bajo la marca VeriSafe.Live, un servicio que ofrece fine-tuning, entrenamiento desde cero, cuantizacion y modelos sin censura. El objetivo declarado es poner un modelo de 33.000 millones de parametros a funcionar de forma nativa en Apple Silicon aprovechando la memoria unificada de los chips M-series.

Arquitectonicamente es un transformer denso de tipo LlamaForCausalLM con 52 capas, dimension oculta de 7168 y atencion agrupada (GQA) con 56 cabezas de atencion y 8 cabezas KV. Conserva la ventana de contexto de 262.144 tokens del modelo original, lo que lo situa en la liga de los modelos de contexto largo. La cuantizacion es afina de MLX a 4 bits con group size 64 (aproximadamente 4,5 bits por peso), con los tensores no cuantizados en bfloat16, y ocupa unos 17 GB en disco (18,6 GB de repositorio).

Su relevancia es doble: por un lado demuestra que un modelo denso de 33B puede ejecutarse en un Mac con suficiente memoria unificada sin GPU dedicada; por otro, forma parte del ecosistema de variantes "uncensored" orientadas a usos donde los rechazos del modelo alineado resultan un obstaculo. La licencia Apache-2.0 heredada facilita el uso comercial, aunque la ausencia de benchmarks publicados y el caracter derivado del modelo obligan a evaluarlo con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 33.118.977.024 (~33B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX affine 4 bits, group size 64 (~4,5 bits por peso); tensores no cuantizados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 18,6 GB, ~17 GB en disco) |
| Capas | 52 |
| Dimension oculta | 7168 |
| Cabezas de atencion / KV | 56 / 8 (GQA) |
| Libreria | mlx-lm |
| Modelo base | Luni/Nanbeige-4.3-33B-Heretic (abliterated de Nanbeige/Nanbeige4.3-33B) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con la estructura clasica de Llama: 52 capas, hidden size de 7168 y atencion con query grouping (56 cabezas de atencion frente a 8 cabezas KV), lo que reduce el coste de memoria del KV cache en contextos largos. No se trata de un modelo MoE ni hibrido: todos los parametros se activan en cada token, lo que simplifica el despliegue pero encarece la inferencia frente a alternativas dispersas del mismo tamano nominal.

La cadena de derivacion es la siguiente: Nanbeige/Nanbeige4.3-33B es el modelo original; Luni/Nanbeige-4.3-33B-Heretic aplica abliteration, una tecnica que identifica y neutraliza la direccion de activacion asociada al rechazo para reducir la tasa de negativas del modelo sin reentrenar desde cero; finalmente junafinity lo cuantiza a 4 bits en MLX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia cuantizacion MLX y la abliteration.

## Capacidades

- Generacion de texto conversacional y de proposito general, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredadas del modelo base Nanbeige 4.3.
- Generacion de codigo: el ejemplo de la model card incluye la escritura de una busqueda binaria en Python.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Ejecucion nativa en Apple Silicon mediante MLX, con memoria unificada.
- Servidor compatible con la API de OpenAI a traves de `mlx_lm.server`.
- Comportamiento sin censura: la abliteration reduce los rechazos, permitiendo respuestas que el modelo alineado original declinaria.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre Mac: el modelo puede generar funciones, explicar fragmentos y refactorizar usando `mlx_lm.generate` o el servidor compatible con OpenAI, sin enviar codigo a servicios externos y aprovechando la memoria unificada del chip.
- Procesamiento de documentos largos: con 262K tokens de contexto se pueden cargar contratos, informes o bases de codigo completas para resumen, extraccion de clausulas o preguntas y respuestas sobre el contenido.
- Analisis de conversaciones multi-turno: historiales extensos de soporte o investigacion caben en una sola ventana, evitando la perdida de contexto que sufren modelos con ventanas de 8K o 32K.
- Investigacion sobre alineacion y abliteration: util para estudiar como varia la tasa de rechazo, el tono y la utilidad percibida entre el modelo original, la version Heretic y esta cuantizacion de 4 bits.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o material editorial donde los filtros del modelo alineado resultan un obstaculo, con la advertencia de revision humana posterior.
- Prototipado offline en portatiles Apple: desarrollo de aplicaciones de texto que deben funcionar sin conexion, con un servidor local levantado con `mlx_lm.server` en el puerto 8080.
- Evaluacion comparativa de cuantizaciones: medir la degradacion de calidad entre el modelo en bfloat16 y esta version de 4 bits en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base. Tampoco se documentan mediciones de latencia o throughput en hardware Apple Silicon.

## Requisitos de hardware

- VRAM/memoria estimada: unos 17 GB de pesos en disco; en ejecucion hay que sumar el KV cache, que crece con la longitud de contexto y con las 8 cabezas KV por capa. Para contextos cercanos a 262K tokens el consumo adicional puede ser considerable.
- Memoria unificada recomendada: 24 GB como minimo practico para contextos moderados; 32 GB o mas para aprovechar ventanas largas con holgura.
- GPU dedicadas: el formato MLX esta pensado para Apple Silicon; no es directamente compatible con CUDA. Para A100, H100 o RTX 4090 habria que recurrir a otras cuantizaciones (GGUF, AWQ, GPTQ) del modelo base.
- Cabe en consumer hardware Apple: si, en chips M-series con 24 GB o mas de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y equivalentes).
- Opciones de despliegue: `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server` (API compatible con OpenAI) mediante `pip install -U mlx-lm`. Para CUDA, vLLM, llama.cpp o TGI requeririan conversiones a otros formatos no incluidas en este repositorio.
- Latencia y throughput: no disponibles; dependen del chip concreto, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic-Uncensored-MLX-4bit (este) | 33B denso | 262.144 | MLX 4 bits | Apache-2.0 | Solo Apple Silicon; sin benchmarks publicados |
| Luni/Nanbeige-4.3-33B-Heretic | 33B denso | 262.144 | safetensors (bf16/fp16) | Apache-2.0 | Modelo padre sin cuantizar; mayor calidad potencial, mas memoria |
| Nanbeige/Nanbeige4.3-33B | 33B denso | 262.144 | safetensors | Apache-2.0 | Modelo original alineado; rechaza contenido que esta variante acepta |
| Alternativas de 30-35B denso en Apple Silicon | 30-35B | variable | MLX / GGUF | variable | No disponible comparativa de rendimiento por falta de benchmarks |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria; la comparativa anterior se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo cuantizado frente al original, ni sobre la degradacion introducida por los 4 bits.
- La abliteration elimina o atenua los mecanismos de rechazo, por lo que el modelo puede generar contenido nocivo, ofensivo o inseguro; requiere filtros externos y supervision humana en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones que lo cuantifiquen.
- Idiomas soportados no documentados: no se especifica que lenguas cubre el modelo base ni la calidad en castellano.
- La cuantizacion a 4 bits con group size 64 puede degradar tareas sensibles a la precision, como matematicas o generacion de codigo complejo.
- Dependencia de hardware: el formato MLX limita el uso a equipos Apple Silicon; no es portable a CUDA sin conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso real.
- Aunque la licencia es Apache-2.0, conviene revisar la licencia y las condiciones del modelo original Nanbeige/Nanbeige4.3-33B incluidas en `README_ORIGINAL.md` antes de un uso comercial.
- El contexto de 262K tokens exige mucha memoria para el KV cache; en configuraciones de 24 GB puede no ser alcanzable en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Nanbeige-4.3-33B-Heretic-Uncensored-MLX-4bit
- Modelo base (Heretic): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- VeriSafe.Live: https://verisafe.live
- Contacto del autor: info@verisafe.live

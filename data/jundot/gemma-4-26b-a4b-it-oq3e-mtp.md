# Jundot/gemma-4-26B-A4B-it-oQ3e-mtp

## Resumen

Jundot/gemma-4-26B-A4B-it-oQ3e-mtp es una version cuantizada del modelo multimodal Gemma 4 26B-A4B-it de Google DeepMind, distribuida como checkpoint mixto en formato MLX. La cuantizacion ha sido realizada por el usuario independiente Jundot mediante la herramienta oQ (oMLX v0.8.0), que aplica precision mixta asignando bits por capa segun su sensibilidad medida, con redondeo asistido por matriz de importancia. El resultado ocupa 13,023 GiB (13,984 GB) frente al modelo original en BF16, manteniendo una media efectiva de 4,266 bits por peso en el checkpoint completo y 3,805 bits por peso en el backbone de lenguaje.

El modelo base es un mixtura de expertos (MoE) de la familia Gemma 4, con 25,2B parametros totales y 3,8B activos, entrada de texto e imagen, modos de razonamiento configurables y una ventana de contexto de 256K tokens. El checkpoint incluye el backbone de lenguaje, el codificador visual y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-26B-A4B-it-assistant, lo que habilita decodificacion especulativa dentro del propio modelo.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo multimodal de 26B con 3,8B activos en hardware Apple Silicon con memoria unificada modesta (en torno a 16 GB), algo inviable con el checkpoint BF16 original; por otro, demuestra el estado del arte de las tecnicas de cuantizacion mixta por capas aplicadas a modelos MoE multimodales, un area donde la perdida de calidad es especialmente sensible en las capas expertas y en el codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4) con codificador visual y cabeza MTP; pesos cuantizados en formato MLX affine por grupos de 64 |
| Parametros totales | 26.225.647.442 (26,226B) |
| Parametros activos | 3,8B (aprox., segun model card del autor) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Mixta oQ3e: 3-bit (87,08% de los pesos), 4-bit (2,82%), 6-bit (2,69%), 8-bit (3,59%) y BF16 (3,82%); grupos de 64; media efectiva 4,266 bits/peso en el checkpoint completo y 3,805 bits/peso en el backbone de lenguaje |
| Idiomas soportados | No disponible (heredados del modelo base; la model card no los enumera) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (affine cuantizado); libreria mlx |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 25,233B | 12,002 GB / 11,178 GiB |
| Codificador visual | 0,573B | 1,142 GB / 1,063 GiB |
| Cabeza MTP | 0,420B | 0,839 GB / 0,782 GiB |
| Total | 26,226B | 13,984 GB / 13,023 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixtura de expertos con 25,2B parametros totales y 3,8B activos por token, lo que sitúa el coste computacional de inferencia en el rango de un modelo denso de aproximadamente 4B. Incorpora un codificador visual (573M parametros) que procesa imagenes junto con texto, lo que habilita la tarea image-text-to-text. Ademas, el checkpoint integra una cabeza de prediccion multi-token (MTP) de 420M parametros extraida del modelo asistente oficial de Google, lo que permite decodificacion especulativa autocontenida: el propio modelo propone varios tokens por paso y el backbone los verifica, aumentando el throughput sin necesidad de un modelo borrador separado. El contexto maximo es de 256K tokens y el modelo soporta modos de razonamiento ("thinking") configurables.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Lo que si esta documentado es el proceso de cuantizacion: oQ3e asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia construida con 1024 muestras de 512 tokens y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. El checkpoint fue re-cuantizado el 19 de noviembre de 2026 con oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad que la version anterior.

## Capacidades

- Generacion de texto y razonamiento multi-turno, con modos de pensamiento configurables (thinking modes) heredados del modelo base.
- Comprension de imagenes y respuesta en texto (pipeline image-text-to-text): descripcion, extraccion de informacion y respuesta a preguntas sobre imagenes.
- Procesamiento de contexto largo: hasta 256K tokens, adecuado para documentos extensos, bases de codigo o historiales de conversacion prolongados.
- Decodificacion especulativa mediante cabeza MTP integrada, que acelera la generacion sin modelo borrador externo.
- Capacidades multilingues heredadas del modelo base (la model card no detalla los idiomas concretos).
- Se desconoce si el modelo base soporta tool calling, function calling o comportamiento agentico de forma nativa; la model card no lo menciona.
- Al ser una cuantizacion, conserva las capacidades funcionales del modelo base aunque con posible degradacion en tareas sensibles a la precision numerica (matematicas, codigo).

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 13 GiB cabe en Macs con 16 GB de memoria unificada, lo que permite ejecutar un modelo multimodal de 26B en un portatil o Mac mini sin GPU dedicada, usando la libreria MLX.
- Analisis de documentos extensos con imagenes: gracias a los 256K tokens de contexto y a la entrada multimodal, se pueden procesar informes con tablas y graficos, contratos escaneados o manuales tecnicos en una sola pasada, preguntando sobre el contenido combinado de texto e imagen.
- Asistentes conversacionales de larga duracion: el contexto de 256K permite mantener historiales de conversacion muy prolongados sin truncado agresivo, util en atencion al cliente o tutoria interactiva.
- Prototipado e investigacion en entornos sin GPU: investigadores que trabajan en Mac pueden evaluar rapidamente un MoE multimodal de ultima generacion sin infraestructura CUDA, gracias al formato MLX y al bajo coste de decodificacion (3,8B activos).
- Procesamiento por lotes en local: transcripcion y resumen de capturas de pantalla, imagenes de productos o fotografias de documentos en flujos automatizados que corren en una estacion de trabajo Apple.
- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como referencia practica para comparar oQ3e frente a otras estrategias (GPTQ, AWQ, MLX estandar de 4 bits) en terminos de calidad, tamano y velocidad sobre un MoE multimodal.
- Demos y aplicaciones educativas: despliegue de un asistente visual en un portatil para demostraciones en aula o talleres, sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el tamano, la distribucion de bits y el error de cuantizacion cualitativo, sin cifras de MMLU, HumanEval, GSM8K ni metricas multimodales.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 13,023 GiB solo de pesos, mas overhead de ejecucion (KV cache para contexto largo y buffers de computo); se recomienda un minimo de 16 GB de memoria unificada y 24-32 GB para contextos extensos.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada, ya que el checkpoint usa la libreria MLX; no es directamente compatible con CUDA sin conversion de formato.
- GPUs dedicadas (A100, H100, RTX 4090): no soportadas de forma nativa por este checkpoint MLX; seria necesaria una conversion a otro formato (por ejemplo GGUF o safetensors estandar) para su uso en CUDA.
- Despliegue: MLX (libreria oficial de Apple) y el ecosistema oMLX; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en el formato distribuido.
- Latencia y throughput: no disponibles. La cabeza MTP deberia mejorar la velocidad de decodificacion respecto a la generacion autoregresiva clasica, pero la model card no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-26B-A4B-it-oQ3e-mtp | 26,2B / ~3,8B | 256K | MLX, oQ3e mixta (4,266 bits/peso) | Apache-2.0 | Hugging Face, 206 descargas |
| google/gemma-4-26B-A4B-it (original) | 26,2B / ~3,8B | 256K | Safetensors BF16 | Apache-2.0 (licencia Gemma 4) | Hugging Face, oficial |
| google/gemma-4-26B-A4B-it-assistant | No disponible | No disponible | Safetensors | Apache-2.0 | Hugging Face, oficial; usado como fuente de la cabeza MTP |

No se dispone de informacion sobre otros checkpoints cuantizados comparables del mismo modelo base ni sobre alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3-bit en el 87% de los pesos introduce degradacion inevitable en tareas de alta precision; se espera mayor impacto en matematicas, codigo y razonamiento numerico que en tareas generativas generales.
- El formato MLX limita el uso a Apple Silicon; no es portable a GPUs NVIDIA o AMD sin conversion previa.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni de la cuantizacion.
- No se especifican los idiomas soportados; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- El checkpoint es una modificacion no oficial de Google; aunque la licencia es Apache-2.0 segun el autor, se enlaza a la licencia Gemma 4 de Google, cuyos terminos conviene revisar para uso comercial.
- No se confirma soporte de tool calling ni de comportamiento agentico; no debe asumirse sin pruebas.
- La cabeza MTP fusionada cambia el comportamiento de decodificacion respecto al modelo base; puede requerir configuracion especifica en MLX y no esta claro que sea transparente para todas las herramientas.
- El autor pide re-descargar la version del 19 de noviembre de 2026 por correcciones de redondeo; versiones anteriores tienen mayor error de cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-26B-A4B-it-oQ3e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo asistente (fuente de la cabeza MTP): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ/oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

# Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp

## Resumen

Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) de tipo vision-language con 35,95 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token. Lo publica el usuario Jundot y esta pensado para inferencia local en hardware Apple Silicon mediante la libreria MLX.

La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.1), usando un esquema de precision mixta denominado oQ3.5e que asigna bits por capa segun su sensibilidad medida y redondea cada grupo con una matriz de importancia. El resultado es un checkpoint que ocupa 17,414 GiB de tensores (18,7 GB de repositorio) con una media efectiva de 4,161 bits por peso, muy por debajo de los aproximadamente 72 GB que ocuparia el modelo base en BF16.

El checkpoint incluye no solo el modelo de lenguaje, sino tambien el codificador de vision y la cabeza de prediccion multi-token (MTP), lo que permite usarlo tanto para tareas de texto e imagen como para decodificacion especulativa. Es relevante porque acerca un modelo MoE multimodal de 35B a equipos de consumo con memoria unificada, manteniendo la licencia permisiva Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) vision-language con capas hibridas Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B (segun model card del autor; no se detalla el numero exacto de expertos ni la top-k) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 3-bit (grupo 64), 4-bit (grupo 64), 5-bit (grupo 128), 8-bit (grupo 128), 8-bit (grupo 64) y BF16; media efectiva 4,161 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con un diseno hibrido que combina capas Gated DeltaNet (un mecanismo de atencion lineal/SSM) y capas de Gated Attention clasica. Cuenta con 35,95B de parametros totales y alrededor de 3B activos, ademas de un codificador de vision y una cabeza de prediccion multi-token (MTP). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, ya que esos datos no aparecen en la informacion proporcionada.

Este checkpoint concreto no ha sido entrenado, sino cuantizado a partir de Qwen/Qwen3.6-35B-A3B. La innovacion tecnica reside en el metodo de cuantizacion oQ3.5e implementado en oMLX v0.7.1: asigna el numero de bits por capa segun su sensibilidad medida y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) junto con un reajuste por minimos cuadrados ponderados de su escala y sesgo. La distribucion resultante reparte el 62,478% de los pesos logicos en 3 bits (grupo 64), el 32,182% en 4 bits (grupo 64), un 1,329% se mantiene en BF16 y el resto en 5 y 8 bits. La cabeza MTP (0,845B de parametros, 0,489 GB) habilita decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno en el idioma del modelo base (idiomas concretos no especificados).
- Comprension de imagen y texto (pipeline image-text-to-text), gracias al codificador de vision incluido en el checkpoint (0,447B de parametros, 0,893 GB).
- Prediccion multi-token (MTP) para decodificacion especulativa, que puede acelerar la generacion al predecir varios tokens por paso.
- Razonamiento y generacion de codigo y matematicas: capacidad heredada del modelo base Qwen3.6-35B-A3B, aunque no se documentan resultados concretos en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues detalladas: no disponible.

## Casos de uso

- Inferencia local en Mac: el checkpoint esta en formato MLX con 17,414 GiB de tensores, por lo que puede ejecutarse en un Mac con memoria unificada suficiente (32 GB o mas) sin necesidad de GPU dedicada, usando mlx-lm o mlx-vlm.
- Analisis de documentos con imagen: al incluir codificador de vision y pipeline image-text-to-text, sirve para extraer y resumir informacion de capturas, diagramas o documentos escaneados en local.
- Asistente conversacional de escritorio: su naturaleza MoE (3B activos) reduce el coste por token en comparacion con un denso de 35B, lo que lo hace viable para un chat local con contexto largo si el modelo base lo permite.
- Generacion de codigo asistida en el editor: integrable en flujos de desarrollo sobre Mac para autocompletado y explicacion de fragmentos, manteniendo los datos en la maquina.
- Aceleracion por decodificacion especulativa: la cabeza MTP incluida puede usarse para generar varios tokens candidatos por paso y mejorar el throughput en inferencia local.
- Prototipado de aplicaciones multimodales: sirve como base para experimentar con pipelines de vision-lenguaje sin depender de APIs en la nube, dado su tamano manejable en disco (18,7 GB).
- Investigacion sobre cuantizacion: al publicar la distribucion de bits por capa, es util para estudiar el impacto de la precision mixta en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: los tensores ocupan 17,414 GiB (18,7 GB de repositorio); hay que sumar el espacio de la cache KV y del contexto, por lo que en la practica se recomienda disponer de al menos 24-32 GB de memoria libre.
- GPU compatibles: al ser un checkpoint MLX, esta orientado a Apple Silicon (chips de la familia M). No esta pensado para GPUs NVIDIA/AMD en su formato actual.
- Cabe en GPU de consumo: no aplica directamente, ya que MLX se ejecuta sobre memoria unificada de Apple Silicon. En Mac, es viable en equipos con 32 GB o mas de memoria unificada; en configuraciones de 24 GB el margen es reducido.
- Opciones de despliegue: mlx-lm y mlx-vlm para Apple Silicon. No es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI, que requieren otros formatos (por ejemplo GGUF o safetensors de PyTorch).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp | 35,95B totales, ~3B activos | no disponible | MLX safetensors (~4,16 bits/peso, 18,7 GB) | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B totales, ~3B activos | no disponible | safetensors BF16 (~72 GB estimados) | Apache-2.0 | HuggingFace |

Comparativa con otras alternativas de la misma categoria (mismo tamano o misma tarea): no disponible. La informacion proporcionada solo permite comparar el checkpoint cuantizado con su modelo base, del que se desconocen contexto, benchmarks e idiomas.

## Limitaciones y advertencias

- La cuantizacion a una media de 4,161 bits por peso puede degradar la calidad frente al modelo base en BF16, especialmente en tareas sensibles a la precision; parte de las capas se mantienen en 4, 5 u 8 bits precisamente para mitigarlo, pero no se han publicado evaluaciones que cuantifiquen la perdida.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validacion de la comunidad.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en produccion multilingue o con contextos largos.
- No se han publicado benchmarks ni datos de rendimiento, por lo que no es posible verificar la calidad real del modelo cuantizado.
- Riesgo de alucinacion: no documentado en la informacion disponible; se hereda el comportamiento del modelo base.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Restricciones de licencia: el checkpoint se distribuye bajo Apache-2.0, siguiendo el modelo original, lo que en principio permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio.
- Compatibilidad limitada: el formato MLX restringe su uso a Apple Silicon; no se puede desplegar directamente en infraestructura con GPUs NVIDIA mediante vLLM, TGI o llama.cpp sin una conversion adicional.
- Metadatos incompletos: la model card no detalla numero de expertos, top-k, tokens de entrenamiento ni metodo de alineacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion Improved oQe: https://github.com/jundot/omlx/pull/4385

# Jundot/gemma-4-31B-it-oQ3.5e-mtp

## Resumen

Jundot/gemma-4-31B-it-oQ3.5e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-31B-it, el modelo denso de 30,7B parametros de la familia Gemma 4 de Google DeepMind. Lo desarrolla el usuario Jundot dentro del ecosistema oMLX (herramienta oQ), y su proposito es reducir el peso en disco y en memoria del modelo original manteniendo la mayor parte de la calidad mediante cuantizacion de precision mixta. El checkpoint incluye el backbone de lenguaje, el codificador de vision y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant.

El modelo hereda del original la entrada de texto e imagen, los modos de razonamiento (thinking) configurables y una ventana de contexto de 256K tokens. La cuantizacion resultante pesa 16,071 GiB (17,3 GB de repositorio) con una media efectiva de 4,349 bits por peso, repartiendo precision por sensibilidad de capa medida: la mayor parte de los pesos (81,617%) se almacena en 3 bits afines con grupo 64, mientras que una fraccion pequena se mantiene en 5, 6, 8 bits o incluso BF16.

Es relevante para desarrolladores que trabajan en Apple Silicon y quieren ejecutar localmente un modelo multimodal de 31B con contexto largo sin recurrir a GPUs dedicadas. No obstante, se trata de una publicacion muy reciente (creada el 11 de octubre de 2026), con cero descargas y cero likes en el momento de la consulta, lo que implica que no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (backbone de lenguaje + codificador de vision + cabeza MTP), cuantizado en MLX |
| Parametros totales | 31.742.607.472 (31,743B en pesos logicos; el modelo denso original de la familia es de 30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Precision mixta oQ3.5e: affine 3-bit grupo 64 (81,617% de los pesos), 4-bit (0,035%), 5-bit (10,198%), 6-bit (0,434%), 8-bit (4,440%) y BF16 (3,278%); media efectiva 4,349 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (siguiendo el modelo origen; enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El checkpoint es una version cuantizada del modelo denso google/gemma-4-31B-it, por lo que su arquitectura subyacente es la del modelo original: un transformer multimodal que acepta texto e imagen, con modos de pensamiento configurables y contexto de 256K tokens. Sobre esa base, el checkpoint anade una cabeza de prediccion multi-token (MTP) de 0,470B parametros logicos, fusionada desde google/gemma-4-31B-it-assistant, que habilita decodificacion especulativa para acelerar la generacion. El desglose de componentes es: backbone de lenguaje con 30,697B pesos logicos (15,175 GB / 14,133 GiB), codificador de vision con 0,576B (1,142 GB / 1,063 GiB) y cabeza MTP con 0,470B (0,939 GB / 0,875 GiB).

No se ha publicado informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en el material disponible, ni sobre el proceso de ajuste de instrucciones. Lo unico documentado es el procedimiento de cuantizacion: se aplico oQ (oMLX v0.7.1) con cuantizacion de precision mixta e Improved oQe Quantization. El metodo asigna bits segun la sensibilidad de capa medida, redondea cada grupo con una importance matrix de 128 muestras x 512 tokens y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. El resultado es un reparto heterogeneo de precision que concentra los 3 bits en la mayor parte del modelo y reserva 8 bits y BF16 para las capas mas sensibles.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `image-text-to-text` y el tag `conversational` confirma uso en dialogos multi-turno.
- Entrada multimodal de imagen y texto: incluye un codificador de vision de 0,576B parametros, por lo que puede procesar imagenes junto a instrucciones textuales.
- Modos de razonamiento configurables (thinking modes): heredados del modelo base, permiten alternar entre respuestas directas y cadenas de razonamiento extendidas.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos, repositorios de codigo o conversaciones prolongadas.
- Decodificacion especulativa mediante cabeza MTP: la cabeza multi-token predice varios tokens por paso, lo que puede aumentar el throughput de generacion.
- Ejecucion local en Apple Silicon: al estar en formato MLX, esta pensado para inferencia nativa en hardware de Apple.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente en la informacion proporcionada (mas alla de los thinking modes del modelo base).
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado en la ficha de HuggingFace.

## Casos de uso

- Analisis de documentos largos en local: con 256K tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos en una sola pasada sin trocear el texto, algo util para despachos y equipos legales que necesitan confidencialidad y no pueden enviar datos a APIs externas.
- Procesamiento de documentacion tecnica con imagenes: al aceptar entrada de imagen y texto, sirve para interpretar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto al texto que los acompana, por ejemplo en soporte de ingenieria.
- Asistente de codigo en estacion de trabajo Apple: un desarrollador con un Mac de memoria unificada alta puede ejecutar el modelo con mlx-lm o mlx-vlm y usarlo para explicar repositorios completos, generar tests o refactorizar, aprovechando el contexto largo para cargar varios ficheros a la vez.
- Asistente conversacional con razonamiento configurable: en aplicaciones de ayuda al usuario donde se quiera activar el modo thinking solo en consultas complejas, ajustando coste de latencia frente a calidad de respuesta.
- Investigacion y experimentacion con cuantizacion: el checkpoint es util como caso de estudio de precision mixta (oQ3.5e) para comparar degradacion frente al modelo BF16 en tareas concretas, ya que documenta el reparto exacto de bits por capa.
- Prototipado multimodal sin GPU dedicada: equipos que solo disponen de portatiles Apple pueden validar ideas de producto con vision y lenguaje antes de migrar a infraestructura con GPU.
- Generacion asistida con decodificacion especulativa: integrable en un servidor de inferencia MLX que aproveche la cabeza MTP para reducir el tiempo por token en cargas de generacion larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo BF16 original ni con otras cuantizaciones. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM/unified memory para los pesos: 16,071 GiB de almacenamiento tensorial efectivo, sobre un repositorio de 17,3 GB. Hay que sumar el espacio para cache KV y activaciones.
- Contexto: con 256K tokens la cache KV puede crecer de forma notable; para uso real con contextos largos conviene reservar bastante memoria adicional sobre los pesos.
- Cabe en Apple Silicon: al ser un checkpoint MLX, el entorno natural son chips de la serie M de Apple. Con 16 GiB de memoria unificada el modelo no cabe con holgura; se recomienda un minimo de 32 GiB y, para contextos extensos, 64 GiB o mas.
- GPUs dedicadas: no disponible. El formato MLX no esta pensado para CUDA; para usar A100, H100 o RTX 4090 habria que partir del modelo base o convertir el checkpoint a otro formato.
- Opciones de despliegue: libreria `mlx` (mlx-lm para texto, mlx-vlm para imagen-texto). vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este checkpoint sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Precision | Licencia | Notas |
|---|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ3.5e-mtp | 31,743B (pesos logicos) | 256K | safetensors MLX | Precision mixta, 4,349 bits/peso medio | Apache-2.0 | Incluye vision encoder y cabeza MTP; orientado a Apple Silicon |
| google/gemma-4-31B-it | 30,7B densos | 256K | safetensors | BF16 | Apache-2.0 / licencia Gemma 4 | Modelo original de Google DeepMind; mayor peso y sin cuantizar |
| google/gemma-4-31B-it-assistant | no disponible | no disponible | no disponible | no disponible | no disponible | Origen de la cabeza MTP fusionada en este checkpoint |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, contexto y licencia.

## Limitaciones y advertencias

- Sin validacion independiente: el repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia. No hay evidencia de terceros sobre su comportamiento real.
- Degradacion por cuantizacion: el 81,617% de los pesos esta en 3 bits afines con grupo 64. Aunque la precision mixta protege capas sensibles, es esperable cierta perdida de calidad frente al modelo BF16, especialmente en tareas de razonamiento fino o codigo.
- Ausencia de benchmarks: no hay ninguna metrica publicada que cuantifique la degradacion, por lo que cualquier evaluacion de calidad debe hacerse por cuenta propia.
- Idiomas no especificados: el campo de idiomas no esta informado. No se puede asumir un soporte multilingue concreto ni verificar el comportamiento en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en esta ficha; el contexto de 256K no elimina el riesgo en preguntas factuales.
- Restricciones de licencia: figura como Apache-2.0 siguiendo el modelo origen, pero la model card remite a la licencia Gemma 4 de Google. Conviene revisar ese enlace antes de un uso comercial, ya que la licencia del modelo base puede imponer condiciones adicionales.
- Compatibilidad de despliegue limitada: al estar en formato MLX, no se puede cargar directamente en vLLM, llama.cpp, Ollama o TGI. Esto restringe su uso a entornos Apple Silicon salvo conversion.
- Consumo de memoria en contexto largo: con 256K tokens la cache KV puede dominar el uso de memoria; en maquinas de 32 GiB el contexto practico sera bastante menor que el maximo declarado.
- Caveat de produccion: la cabeza MTP anade complejidad al grafo de inferencia; no hay datos publicados de ganancia real de throughput en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-31B-it-oQ3.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

# nsd12/deepseek-v4-gguf

## Resumen

DeepSeek V4 Flash es un modelo de lenguaje de gran tamaño de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, con aproximadamente 284 000 millones de parámetros totales. Este repositorio contiene la conversión a formato GGUF realizada por antirez, específicamente diseñada para el motor de inferencia ds4, un runtime optimizado para Apple Silicon con aceleración Metal. La cuantización está pensada para ejecutar el modelo en equipos Mac con gran cantidad de memoria unificada: 128 GB para la variante q2 y 256 GB o más para la q4.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de frontera de 284B parámetros en hardware de consumo de gama alta, algo inusual para modelos de este tamaño. La receta de cuantización es asimétrica: aplica cuantización agresiva (IQ2_XXS y Q2_K) a los expertos enrutados, que constituyen la mayor parte de los parámetros pero procesan solo una fracción de los tokens, mientras mantiene en Q8_0 los componentes de decisión como proyecciones de atención, router y expertos compartidos. Incluye además un archivo MTP (multi-token prediction) opcional para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con MLA (Multi-head Latent Attention), router aprendido, hash-routing, compressor, indexer y HC (bloques auxiliares especificos de DSv4) |
| Parametros totales | 284 334 567 511 (~284B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servidor de ds4 usa 100 000 tokens, pero no se especifica el maximo nativo del modelo) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K, Q8_0, F16, F32, I32 (receta mixta por tensor) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (los pesos GGUF; el copyright del modelo base pertenece a DeepSeek y se redistribuye bajo sus terminos de publicacion) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es DeepSeek V4 Flash, una arquitectura MoE con atención de latencia multi-cabeza (MLA) y componentes auxiliares propios de la generacion V4: un compressor de contexto, un indexer y bloques HC. El router es aprendido y las tres primeras capas utilizan tablas de hash-routing (tensores `ffn_gate_tid2eid` en I32). Los expertos enrutados se dividen en tres clases de tensores (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) y existen ademas expertos compartidos (`ffn_{gate,up,down}_shexp`).

No se dispone de informacion sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset o uso de RLHF/DPO no estan documentados en la informacion proporcionada. La innovacion principal de este repositorio es la receta de cuantizacion asimetrica: los expertos enrutados, que dominan el recuento de parametros pero atienden solo a una fraccion de los tokens, reciben cuantizacion agresiva (IQ2_XXS para gate/up y Q2_K para down en la variante q2; Q4_K en la q4), mientras que router, proyecciones de atencion, expertos compartidos y cabeza de salida se mantienen en Q8_0 o superior para preservar el comportamiento del modelo. El archivo MTP adicional permite decodificacion especulativa, pero requiere un cargador especifico del motor ds4.

## Capacidades

- Generacion de texto en ingles con arquitectura MoE de 284B parametros totales.
- Decodificacion especulativa opcional mediante el archivo MTP (multi-token prediction), que acelera la generacion cuando se usa con el motor ds4.
- Ejecucion local en Apple Silicon con aceleracion Metal a traves del motor ds4.
- Soporte de servidor de inferencia con `ds4-server`, incluyendo gestion de cache KV en disco (`--kv-disk-dir`, `--kv-disk-space-mb`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo Mac con 128 GB de RAM: la variante q2 (80,8 GiB) esta disenada para equipos de 128 GB, permitiendo ejecutar un modelo de 284B parametros sin conexion a la nube.
- Despliegue en servidores Mac de gama alta con 256 GB o mas: la variante q4 (153,3 GiB) ofrece mayor fidelidad en los expertos enrutados a cambio de mas memoria.
- Servicio de generacion de texto con contexto largo: `ds4-server` permite configurar ventanas de contexto de 100 000 tokens y almacenar la cache KV en disco para sesiones prolongadas.
- Experimentacion con decodificacion especulativa: el archivo MTP (3,6 GiB) puede combinarse con q2 o q4 para probar el impacto en latencia de la prediccion multi-token.
- Desarrollo de aplicaciones de chat o redaccion en ingles que requieran un modelo de gran tamano ejecutandose en hardware local sin dependencia de APIs externas.
- Investigacion sobre tecnicas de cuantizacion asimetrica en modelos MoE: la receta documentada (expertos enrutados agresivos, componentes de decision en Q8_0) es un caso de estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- Variante q2 (80,8 GiB): recomendada para Mac con 128 GB de RAM unificada.
- Variante q4 (153,3 GiB): recomendada para maquinas con 256 GB de RAM o mas.
- Archivo MTP (3,6 GiB): opcional, para decodificacion especulativa; no es un modelo autonomo.
- Aceleracion: Apple Silicon con Metal (el motor ds4 esta orientado a este hardware).
- No se indican requisitos de VRAM de GPU dedicada; el modelo se ejecuta sobre memoria unificada de Apple.
- Opciones de despliegue: motor ds4 (https://github.com/antirez/ds4) con interfaz de linea de comandos (`./ds4`) y servidor (`./ds4-server`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la model card advierte que los archivos pueden funcionar con otros motores, pero el MTP requiere un cargador especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. En los resultados de busqueda aparecen otras conversiones GGUF de la familia DeepSeek V4 (por ejemplo, DeepSeek-V4-Pro-0813-GGUF y un repositorio opensota/deepseek-v4-gguf), pero no se proporcionan especificaciones, parametros ni benchmarks de esos modelos. La comparativa con el modelo base sin cuantizar (deepseek-ai/DeepSeek-V4-Flash) tampoco es posible por falta de datos publicados en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte del idioma ingles; no se documentan capacidades multilingues.
- La cuantizacion agresiva de los expertos enrutados (IQ2_XXS en la variante q2) puede degradar la calidad en tareas que dependan de expertos especificos, aunque el autor argumenta que el impacto medio es limitado porque cada experto atiende a una fraccion de tokens.
- El archivo MTP no es autonomo y requiere el motor ds4 con un cargador especifico; puede no funcionar con otros motores de inferencia.
- El tamano del repositorio es de 3414,8 GB en total, lo que implica descargas muy grandes incluso para una sola variante (80,8 GiB la mas pequena).
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto especificas del modelo base.
- La licencia MIT aplica a los pesos GGUF, pero el copyright del modelo base pertenece a DeepSeek y la redistribucion se realiza bajo los terminos de publicacion del modelo base; conviene revisar esos terminos antes de un uso comercial.
- No hay informacion sobre el entrenamiento del modelo base (datos, alineacion, seguridad), por lo que no se puede evaluar su robustez frente a prompts malintencionados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nsd12/deepseek-v4-gguf
- Motor de inferencia ds4: https://github.com/antirez/ds4
- Web oficial de DeepSeek: https://deepseek.com/en/index.html
- Guia de despliegue local de DeepSeek V4: https://deepseek-v4.io/local-deployment
- Repositorio relacionado (opensota/deepseek-v4-gguf): https://huggingface.co/opensota/deepseek-v4-gguf
- Repositorio relacionado (DeepSeek-V4-Pro-0813-GGUF): https://huggingface.co/DevQuasar/deepseek-ai.DeepSeek-V4-Pro-0813-GGUF

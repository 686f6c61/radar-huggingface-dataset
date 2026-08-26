# mradermacher/qwen3-14b-myanmar-v3-bf16-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `kkomyoeminaung/qwen3-14b-myanmar-v3-bf16`, un fine-tune de Qwen3-14B aparentemente orientado al idioma birmano (aunque los metadatos indican `en`). La cuantización ha sido realizada por mradermacher, un desarrollador conocido por publicar versiones GGUF de modelos open source. El interés de esta publicación radica en que permite ejecutar un modelo de 14 800 millones de parámetros en hardware de consumo mediante los formatos de cuantización estándar de llama.cpp, reduciendo los requisitos de memoria y acelerando la inferencia.

El modelo base es un transformer denso (no MoE) con 14 803 307 520 parámetros, basado en la arquitectura Qwen3-14B. No se especifica la longitud de contexto en la información disponible, aunque la familia Qwen3 suele soportar ventanas de 32 768 tokens. La cuantización es estática (sin imatrix) y se ofrecen once niveles de compresión, desde Q2_K hasta Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-14B) |
| Parametros totales | 14 803 307 520 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos; el nombre sugiere birmano) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantizacion estatica (sin imatrix) del checkpoint `kkomyoeminaung/qwen3-14b-myanmar-v3-bf16`, que a su vez es un fine-tune de Qwen3-14B. No se proporcionan detalles sobre el proceso de entrenamiento del modelo base (datos, numero de tokens, tecnicas de alineacion como RLHF o DPO). La cuantizacion se ha realizado con las herramientas estandar de llama.cpp, generando archivos GGUF de una sola parte. Al ser una cuantizacion estatica, los pesos se convierten directamente sin recalibracion con datos de validacion, lo que puede afectar ligeramente a la precision en comparacion con cuantizaciones con imatrix.

## Capacidades

No se dispone de informacion especifica sobre las capacidades de este modelo. Al ser una cuantizacion de un fine-tune de Qwen3-14B, se espera que herede las capacidades generales de la familia Qwen3 (generacion de texto, razonamiento, codigo, matematicas, soporte de tool calling y modo thinking), pero no se ha documentado de forma explicita para esta variante. Los metadatos indican `en` como idioma, aunque el nombre del modelo sugiere una especializacion en birmano, lo que no ha sido confirmado.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Dado que se trata de una cuantizacion GGUF, su principal aplicacion es la inferencia local en entornos con recursos limitados, utilizando motores como llama.cpp, Ollama o LM Studio. Para conocer las aplicaciones concretas del modelo base, se recomienda consultar la ficha de `kkomyoeminaung/qwen3-14b-myanmar-v3-bf16`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos de VRAM dependen del nivel de cuantizacion elegido. La siguiente tabla estima la memoria necesaria para cargar el modelo en GPU, considerando el tamano del archivo y un margen para el contexto y las activaciones:

| Cuantizacion | Tamano del archivo | VRAM estimada |
|---|---|---|
| Q2_K | 5,9 GB | ~7 GB |
| Q3_K_S | 6,8 GB | ~8 GB |
| Q3_K_M | 7,4 GB | ~9 GB |
| Q3_K_L | 8,0 GB | ~9,5 GB |
| IQ4_XS | 8,3 GB | ~10 GB |
| Q4_K_S | 8,7 GB | ~10,5 GB |
| Q4_K_M | 9,1 GB | ~11 GB |
| Q5_K_S | 10,4 GB | ~12,5 GB |
| Q5_K_M | 10,6 GB | ~13 GB |
| Q6_K | 12,3 GB | ~15 GB |
| Q8_0 | 15,8 GB | ~19 GB |

- GPU recomendadas: para las cuantizaciones Q4_K_M y superiores, una GPU con 12 GB de VRAM (p. ej., RTX 3060, RTX 4070) es suficiente. Para Q8_0 se necesitan al menos 20 GB (p. ej., RTX 3090, RTX 4090, A100).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) y TGI (con soporte experimental).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo base es un fine-tune de Qwen3-14B, por lo que podria compararse con otras cuantizaciones de Qwen3-14B disponibles en Hugging Face, pero no se han encontrado datos concretos de rendimiento o benchmarks para esta variante especifica.

## Limitaciones y advertencias

- Al ser una cuantizacion estatica, puede haber una perdida de precision respecto al modelo en bf16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar con el autor del modelo base antes de utilizarlo en produccion.
- No se han documentado sesgos especificos, pero al ser un fine-tune de Qwen3, puede heredar los sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano.
- La longitud de contexto no esta confirmada; si se desea utilizar con ventanas largas, es necesario verificar la compatibilidad con el modelo base.
- El idioma real soportado es ambiguo: los metadatos indican `en`, pero el nombre del modelo sugiere birmano. Esto puede generar resultados inesperados si se utiliza para otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen3-14b-myanmar-v3-bf16-GGUF
- Modelo base: https://huggingface.co/kkomyoeminaung/qwen3-14b-myanmar-v3-bf16
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

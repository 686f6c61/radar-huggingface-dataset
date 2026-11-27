# hletrd/Raon-1-nano-Uncensored-MLX-8bit

## Resumen

Raon-1-nano Uncensored MLX 8-bit es una variante modificada del modelo KRAFTON/Raon-1-nano, publicada por el usuario hletrd. Se trata de una version "abliterated" (sin direccion de rechazo) del modelo original, convertida a formato MLX cuantizado en 8 bits para su ejecucion en hardware Apple Silicon. El modelo conserva la arquitectura y el codigo originales de KRAFTON, pero elimina la direccion de rechazo de las proyecciones de atencion y MLP en las capas 6 a 22.

El modelo resuelve el problema de los rechazos excesivos en modelos alineados: mientras que la version original MLX 8-bit rechaza el 98,5% de los prompts de HarmBench, esta variante solo rechaza el 1,0%. Esto lo hace util para aplicaciones de investigacion que requieren respuestas sin filtros de seguridad, aunque con las implicaciones eticas y legales que ello conlleva.

Con 3.130.797.136 parametros (aproximadamente 3,1 mil millones), un contexto declarado de 256K tokens y licencia Apache 2.0, el modelo esta disenado para ejecutarse en equipos Mac con chip M5 Max o M5 Ultra. La relevancia actual radica en la creciente demanda de modelos locales sin censura para investigacion de seguridad, red teaming y generacion creativa sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Raon-1-nano, con bloque MTP eliminado en esta variante) |
| Parametros totales | 3.130.797.136 (aproximadamente 3,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (MLX) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-nano es un transformer de aproximadamente 3,1 mil millones de parametros. La variante aqui descrita elimina el bloque MTP (Multi-Token Prediction) presente en el modelo original y aplica una modificacion de pesos conocida como "abliteration": se toma una direccion de rechazo en la capa 16 (con el canal 746 anulado) y se proyecta fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22, afectando a 51 tensores en total. El embedding, la cabeza de salida y el bloque MTP permanecen sin cambios.

La cuantizacion es affine de 8 bits con group size 64 para todas las capas lineales y ambas tablas de embedding (el token embedding es tambien la LM head). Las proyecciones up de clave y valor de MLA (Multi-head Latent Attention) se mantienen en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base, ya que la model card no lo detalla.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Modo "thinking" activado por defecto (razonamiento antes de responder); se puede desactivar con `--chat-template-config '{"enable_thinking": false}'`.
- Respuestas sin filtros de rechazo: solo el 1,0% de prompts de HarmBench son rechazados (frente al 98,5% del original).
- Soporte de conversacion multi-turno.
- Capacidad de generacion de codigo y matematicas (heredada del modelo base, aunque no se aportan benchmarks especificos).
- No se menciona soporte explicito de tool calling, function calling ni capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Investigacion de seguridad y red teaming: el modelo permite generar respuestas que el modelo original rechazaria, lo que facilita el estudio de sesgos, vulnerabilidades y comportamientos no alineados en entornos controlados.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que requiera explorar temas sensibles sin los filtros habituales de los modelos alineados.
- Pruebas de robustez de sistemas de moderacion: se puede utilizar como generador de prompts adversarios para evaluar clasificadores de contenido y sistemas de seguridad.
- Desarrollo local en Apple Silicon: gracias a su tamano (3,4 GB) y al formato MLX 8-bit, se ejecuta en Mac con chip M5 Max o M5 Ultra, permitiendo inferencia privada sin conexion a la nube.
- Analisis de comportamiento de modelos abliterated: comparacion directa con la version original para estudiar el efecto de la eliminacion de la direccion de rechazo en la calidad linguistica (KL divergence, top-1 agreement).
- Generacion de texto en coreano e ingles para aplicaciones que requieran un modelo ligero con contexto largo (256K tokens) en hardware de consumo Apple.

## Benchmarks y rendimiento

Los datos disponibles en la model card comparan la variante uncensored con el modelo original MLX 8-bit:

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | 7-question answer check | HarmBench refused | Alpaca refused |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 8-bit | 3,36 GB | 0,006216 | 94,83% | 0,016426 | 93,84% | 0,007997 | 95,27% | 6/7 (BF16: 6/7) | 1,0% | 0,0% |
| Original MLX 8-bit | 3,36 GB | 0,001343 | 97,14% | 0,001630 | 97,75% | 0,001125 | 97,43% | 6/7 (BF16: 6/7) | 98,5% | 0,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,4 GB de memoria unificada para el archivo MLX 8-bit.
- GPU recomendadas: Apple Silicon M5 Max (32 o 40 nucleos GPU) o M5 Ultra (80 nucleos GPU); no se mencionan GPU NVIDIA.
- Cabe en consumer GPU: si, en equipos Mac con memoria unificada de 36 GB o superior (segun la tabla de la model card).
- Opciones de despliegue: MLX (mlx-lm 0.32.2, mlx 0.32.4, transformers 5.20.2) mediante `mlx_lm.generate` o `mlx_lm.chat`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1-nano Uncensored MLX 8-bit | 3,1B | 256K | Apache 2.0 | MLX safetensors 8-bit | Sin direccion de rechazo; 1,0% rechazos en HarmBench |
| Xylolabs/Raon-1-nano-MLX-8bit (original) | 3,1B | 256K | Apache 2.0 | MLX safetensors 8-bit | Version alineada; 98,5% rechazos en HarmBench |
| KRAFTON/Raon-1-nano (BF16) | 3,1B | 256K | Apache 2.0 | safetensors BF16 | Modelo base sin cuantizar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (abliterated, 3B, MLX) en la busqueda realizada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo degrada la fidelidad respecto al modelo original: la KL divergence en WikiText-2 pasa de 0,001343 a 0,006216 y el top-1 agreement baja de 97,14% a 94,83%.
- Riesgo elevado de generar contenido danino, ofensivo o ilegal: el modelo apenas rechaza peticiones (1,0% en HarmBench), lo que lo hace inadecuado para aplicaciones comerciales sin moderacion externa.
- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo base coreano-ingles, puede presentar sesgos culturales y linguisticos no evaluados.
- Limitaciones de idioma: solo coreano e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros puede infringir normativas de servicios digitales o leyes de contenido en determinadas jurisdicciones.
- Requiere `--trust-remote-code` para ejecutarse, lo que implica ejecutar codigo del repositorio; revisar el codigo antes de usarlo en produccion.
- El modelo esta pensado para hardware Apple Silicon; no es directamente compatible con CUDA sin conversion adicional.
- La model card no detalla el proceso de entrenamiento del modelo base ni los datos utilizados, lo que limita la evaluacion de riesgos.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Raon-1-nano-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Version MLX original de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Version MLX 8-bit original (Xylolabs): https://huggingface.co/Xylolabs/Raon-1-nano-MLX-8bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio Tensix BFP GPTQ (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq

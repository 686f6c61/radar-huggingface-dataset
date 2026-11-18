# incoai/Qwen3.8-27B-DFlash2-GGUF

## Resumen

`incoai/Qwen3.8-27B-DFlash2-GGUF` es la conversión a formato GGUF del modelo borrador (draft model) DFlash 2 para `Qwen/Qwen3.8-27B`, desarrollado por Inco AI. No se trata de un modelo de lenguaje autónomo: es un componente de decodificación especulativa que se ejecuta junto al modelo objetivo dentro de un servidor compatible con llama.cpp y genera bloques de tokens candidatos que el modelo grande verifica. Su relevancia radica en que acelera la inferencia del modelo objetivo sin alterar la salida, ya que la decodificación es sin pérdida (lossless): en modo greedy reproduce exactamente el resultado del modelo objetivo y en muestreo preserva su distribución.

El borrador emplea difusión por bloques (block diffusion) para predecir un bloque completo de tokens en una sola pasada, manteniendo los mejores candidatos en cada posición; un selector ligero traza después una ruta coherente entre ellos. La arquitectura incorpora convoluciones dinámicas de dos tomas (two-tap dynamic convolutions) en el backbone para evitar la degradación de la calidad del borrador hacia el final del bloque. El repositorio contiene tres cuantizaciones (Q4_K_M de 1,1 GB, Q8_0 de 2,0 GB y BF16 de 3,8 GB) y está publicado bajo licencia Apache 2.0.

El interés actual del modelo es práctico: permite desplegar el modelo objetivo Qwen3.8-27B en llama.cpp con aceleración especulativa, con longitudes de aceptación medidas en torno a 5 tokens por paso de verificación, lo que reduce el número de pasos necesarios para generar la misma secuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusión por bloques (block diffusion) con selector de ruta de candidatos y convoluciones dinámicas de dos tomas; se ejecuta como draft model de decodificación especulativa |
| Parametros totales | 1.924.404.480 (según safetensors del modelo base asociado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

DFlash 2 es un borrador de difusión por bloques diseñado para decodificación especulativa. En lugar de generar tokens de forma autorregresiva, predice un bloque entero de tokens en una única pasada y conserva los mejores candidatos en cada posición del bloque; a continuación, un selector ligero traza una única ruta coherente a través de esos candidatos. El backbone incorpora convoluciones dinámicas de dos tomas que evitan que la calidad del borrador se degrade conforme avanza el bloque, un problema habitual en los drafters paralelos. El resultado es una decodificación sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

El modelo se distribuye como draft model del objetivo `Qwen/Qwen3.8-27B` y se integra en llama.cpp mediante el tipo de especulación `draft-dflash`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; esa información se remite a la model card del checkpoint principal `incoai/Qwen3.8-27B-DFlash2`. El número de tokens borradorados por paso se controla con el parámetro `--spec-draft-n-max` (7 en el ejemplo de la model card).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no genera texto de forma autónoma.
- Predicción paralela de bloques completos de tokens con selección de ruta coherente entre candidatos.
- Decodificación sin pérdida: salida greedy idéntica al modelo objetivo y muestreo que preserva su distribución.
- Compatible con el servidor `llama-server` de llama.cpp mediante `--spec-type draft-dflash`.
- Soporte de GPU NVIDIA (CUDA) y Apple Silicon (Metal) en la compilación de llama.cpp.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking propios; esas capacidades dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción con llama.cpp: desplegar Qwen3.8-27B con `llama-server` y este borrador para reducir el número de pasos de verificación necesarios por petición, manteniendo la salida idéntica al modelo objetivo.
- Servicio de chat conversacional de baja latencia: al aumentar los tokens generados por paso de verificación (longitud de aceptación en torno a 5), se reduce el tiempo hasta el primer token completo y el tiempo total por respuesta en cargas interactivas.
- Generación de código en pipelines internos: el borrador acelera la generación del modelo objetivo sin alterar el código producido, lo que permite mantener la reproducibilidad de las salidas en integración continua.
- Razonamiento matemático con cadenas largas: útil en escenarios donde el modelo objetivo genera secuencias extensas de razonamiento y el coste por token domina el presupuesto de cómputo.
- Despliegue en hardware de gama alta de consumo: el borrador en Q4_K_M ocupa 1,1 GB, por lo que puede convivir con el modelo objetivo cuantizado en una GPU consumer con VRAM suficiente.
- Evaluación comparativa de motores de inferencia: permite medir el impacto de la decodificación especulativa frente a la generación autorregresiva estándar con el mismo modelo objetivo y los mismos parámetros de muestreo.
- Entornos Apple Silicon: compilación con Metal para acelerar Qwen3.8-27B en equipos Mac con memoria unificada.

## Benchmarks y rendimiento

La model card publica únicamente métricas de longitud de aceptación (acceptance length), definida como la media por petición de tokens de completion dividida entre pasos de verificación. La evaluación usa como objetivo `ggml-org/Qwen3.8-27B-GGUF` en Q4_K_M, parámetros recomendados de Qwen3.8 (temperatura 1.0, top-p 0.95, top-k 20), esfuerzo de razonamiento `xhigh`, máximo de 2048 tokens nuevos y los ocho primeros ejemplos de test de GSM8K.

| Draft GGUF | Longitud de aceptación |
|---|---:|
| BF16 | 5,28 |
| Q8_0 | 5,13 |
| Q4_K_M | 5,39 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible para este repositorio; la model card remite a la model card del checkpoint principal `incoai/Qwen3.8-27B-DFlash2` para las evaluaciones completas.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,1 GB en Q4_K_M, 2,0 GB en Q8_0 y 3,8 GB en BF16, adicionales a la VRAM ocupada por el modelo objetivo.
- GPU recomendadas: NVIDIA con CUDA (A100, H100, RTX 4090 y superiores) o Apple Silicon con Metal; la compilación requiere la PR #27342 de llama.cpp.
- GPU consumer: el borrador en Q4_K_M cabe holgadamente en cualquier GPU consumer moderna; el factor limitante es el modelo objetivo Qwen3.8-27B, no el borrador.
- Opciones de despliegue: `llama-server` de llama.cpp con `--spec-type draft-dflash`; la model card menciona que el blog de Inco AI detalla otros motores compatibles.
- Latencia y throughput: no se publican cifras absolutas de latencia ni tokens por segundo; el único dato de rendimiento es la longitud de aceptación de 4,2 a 5,4 tokens por paso de verificación según la cuantización.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incoai/Qwen3.8-27B-DFlash2-GGUF | Borrador de difusión por bloques para decodificación especulativa | 1.924.404.480 | No disponible | Apache 2.0 | GGUF en Hugging Face, espejo en z-lab |
| incoai/Qwen3.8-27B-DFlash2 | Checkpoint principal del borrador (mismo modelo, sin cuantizar a GGUF) | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | Modelo objetivo (no es un borrador) | 27B (según denominación) | No disponible | No disponible | Hugging Face |
| ggml-org/Qwen3.8-27B-GGUF | Cuantizaciones GGUF del modelo objetivo | 27B (según denominación) | No disponible | No disponible | Hugging Face |

No se dispone de información sobre otros borradores comparables (por ejemplo, drafters autorregresivos tipo EAGLE o Medusa) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede usarse para generar texto por sí solo; requiere el modelo objetivo y un servidor con soporte de decodificación especulativa.
- Requiere una versión de llama.cpp con soporte DFlash 2 (PR #27342); las compilaciones estándar no lo cargarán.
- La aceleración depende de la tasa de aceptación del borrador; en dominios muy distintos a los datos de entrenamiento del drafter, la longitud de aceptación puede caer y el beneficio de latencia reducirse.
- Los datos de evaluación publicados son muy limitados: ocho ejemplos de GSM8K con un único juego de parámetros de muestreo, insuficientes para extrapolar el rendimiento a otros dominios.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática del borrador; al heredar el comportamiento del modelo objetivo, estos riesgos deben evaluarse sobre Qwen3.8-27B.
- La licencia Apache 2.0 del borrador no exime de verificar la licencia y condiciones del modelo objetivo Qwen3.8-27B para uso comercial.
- El repositorio declara `inference: false` en los metadatos, lo que refleja que no está pensado para inferencia directa.
- El tamaño del repo (21,2 GB) incluye artefactos adicionales más allá de los tres GGUF listados; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Checkpoint principal del borrador: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones GGUF del objetivo: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Espejo del repositorio: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte DFlash 2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27342

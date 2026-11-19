# sairaph-official/Qwen3-0.6B-8d42ab5

## Resumen

Qwen3-0.6B-8d42ab5 es un espejo (mirror) no modificado del artefacto LiteRT-LM de Qwen3-0.6B publicado por la comunidad litert-community, alojado por sairaph-official para su uso en la aplicacion LLM Server. Se trata de una version cuantizada del modelo base Qwen/Qwen3-0.6B (0,6 mil millones de parametros, licencia Apache 2.0) empaquetada en formato `.litertlm` para despliegue en Android y escritorio mediante el runtime LiteRT-LM de Google.

El modelo resuelve el problema de ejecutar un LLM de la familia Qwen3 en dispositivos moviles con aceleracion GPU (OpenCL) y NPU, sin necesidad de servidores. El repositorio contiene un unico artefacto: `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` (343.490.560 bytes, unos 328 MiB), con cuantizacion dinamica INT4 en bloques de 32, activaciones FP32 y contexto por defecto de 4.096 tokens.

Es relevante porque demuestra la viabilidad de inferencia local de un transformer de 0,6B con tool calling y modo thinking en hardware de consumo, con metricas concretas: 3.442 tok/s de prefill y 81,4 tok/s de decodificacion en un Galaxy S26 con LiteRT-LM 0.19.0 sobre GPU OpenCL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a LiteRT-LM |
| Parametros totales | 0,6 mil millones (modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; cache exportada de 32.768 tokens |
| Tipos de cuantizacion | INT4 dinamico (bloques de 32) con activaciones FP32; el repo upstream ofrece tambien INT8 dinamico y a16w8 para NPU MediaTek |
| Idiomas soportados | ingles (segun tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, pesos externos en seccion TFLiteWeights) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba Qwen. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; la model card del espejo remite a la card principal de Qwen/Qwen3-0.6B para esos datos, que no se incluyen en la informacion proporcionada.

La innovacion tecnica relevante esta en el proceso de exportacion: el artefacto se genero con LiteRT Torch (`export_hf`, commit `0a81bf6f3`) aplicando `--apply_gpu_composites=True`, de modo que RMSNorm, QK-norm con RoPE, atencion, SwiGLU y la actualizacion de KV-cache se convierten en operaciones compuestas ejecutables en la ruta GPU de LiteRT-LM. Las proyecciones QKV y Gate/Up estan fusionadas. Los pesos se almacenan como pesos externos al grafo para reducir el tamano del modelo. Se exporto con longitudes de prefill de 128 y 1.024 y una cache de 32.768 tokens.

## Capacidades

- Generacion de texto en ingles con modo thinking activado por defecto (desactivable con `enable_thinking=false`); el razonamiento se emite por un canal separado.
- Tool calling y function calling: el runtime LiteRT-LM parsea las llamadas a herramientas segun la configuracion oficial qwen3.
- Razonamiento multi-paso basado en el modo thinking del modelo base.
- Conversacion multi-turno mediante plantilla de chat compatible con Qwen3.
- Manejo correcto de caracteres Unicode y emoji (verificado con la cadena `Good morning 😊 🚀`).
- Inferencia en dispositivo con aceleracion GPU (OpenCL) y soporte de NPU en variantes MediaTek.
- No se documentan capacidades de vision, audio ni otros idiomas distintos del ingles en este artefacto.

## Casos de uso

- Asistentes locales en Android: integracion en una app movil mediante LiteRT-LM para responder consultas sin conexion, aprovechando los 4.096 tokens de contexto y el rendimiento de 81,4 tok/s en GPU de gama alta.
- Automatizacion de tareas con tool calling: el modelo puede invocar funciones definidas por la aplicacion (calendario, clima, busqueda local) y el runtime parsea las llamadas, lo que permite construir agentes ligeros en dispositivo.
- Procesamiento de texto en el borde (edge computing): resumenes, clasificacion y extraccion de entidades en dispositivos con recursos limitados, con un pico de memoria de aproximadamente 1,9-2,1 GiB en un Pixel 8a o Galaxy S26.
- Prototipado rapido de aplicaciones LLM: el formato `.litertlm` y la libreria `litert-lm` permiten cargar el modelo en escritorio o Android sin infraestructura de servidor.
- Educacion e investigacion: estudio del comportamiento de un modelo Qwen3 pequeno con cuantizacion INT4 y modo thinking en hardware de consumo.
- Filtrado y moderacion de contenido en local: inferencia de baja latencia para preclasificar textos antes de enviarlos a un modelo mayor en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente aporta metricas de rendimiento de runtime en dispositivos:

| Metrica | Galaxy S26 (GPU OpenCL, LiteRT-LM 0.19.0) | Pixel 8a (referencia) |
|---|---|---|
| Prefill (1.024 tokens) | 3.442 tok/s | no disponible |
| Decodificacion | 81,4 tok/s | no disponible |
| Pico de RSS (prompt 1.355 tokens, 256 decodificados, cache 2.048) | 2.034-2.123 MiB | 1.924-1.929 MiB |

Como referencia, el artefacto anterior en el mismo Galaxy S26 lograba 2.384 tok/s de prefill y 71,4 tok/s de decodificacion.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,9-2,1 GiB de pico de memoria en moviles de gama alta con el artefacto INT4; el fichero ocupa 328 MiB en disco.
- GPU recomendadas: no se especifican modelos de escritorio; en movil se ha validado en Galaxy S26 y Pixel 8a con GPU OpenCL. La ruta GPU requiere LiteRT-LM 0.19.0 o superior.
- Compatibilidad con GPU de consumo: no disponible; el artefacto esta orientado a Android y escritorio mediante LiteRT-LM, no a CUDA.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_advanced_main`), libreria `litert-lm`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 81,4 tok/s de decodificacion y 3.442 tok/s de prefill en Galaxy S26; en CPU el rendimiento es similar al artefacto anterior pero con mayor consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-8d42ab5 (este) | 0,6B | 4.096 (cache 32.768) | `.litertlm` INT4 | Apache 2.0 | Optimizado para LiteRT-LM en Android/escritorio |
| Qwen3-0.6B (upstream) | 0,6B | 32.768 | safetensors | Apache 2.0 | Pesos originales; requiere runtime estandar (Transformers, vLLM) |
| Qwen3-0.6B.litertlm (INT8) | 0,6B | 4.096 | `.litertlm` INT8 | Apache 2.0 | Variante del mismo repo upstream, 586 MB, mayor precision |
| Qwen3-0.6B.mediatek.mt6993.litertlm | 0,6B | 4.096 | `.litertlm` a16w8 | Apache 2.0 | Orientado a NPU MediaTek, 992 MB |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- El contexto por defecto es de 4.096 tokens, inferior a los 32.768 del modelo base; prompts mas largos pueden truncarse.
- La ruta GPU del artefacto requiere LiteRT-LM 0.19.0 o superior; en 0.18.1 falla la compilacion de kernels compuestos en Galaxy S26, Pixel 8a y Mac.
- Las builds Android de LiteRT-LM 0.18.0 y 0.18.1 se cuelgan al cargar ficheros con pesos externos.
- El artefacto es un espejo no modificado: sairaph-official no ha validado ni alterado los pesos; la responsabilidad tecnica recae en el repo upstream litert-community.
- Riesgo de alucinacion inherente a un modelo de 0,6B, especialmente en tareas de conocimiento factual.
- La cuantizacion INT4 puede degradar la precision respecto al modelo en FP16/BF16; no se aportan mediciones de esa perdida.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los avisos del modelo base Qwen3-0.6B.
- No se documentan sesgos especificos; al ser un modelo entrenado mayoritariamente en ingles, puede presentar sesgos culturales y linguisticos.
- El repositorio no incluye ficheros de licencia propios del upstream; Sairaph anadio una copia de la licencia de Qwen/Qwen3-0.6B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sairaph-official/Qwen3-0.6B-8d42ab5
- Repo upstream LiteRT-LM: https://huggingface.co/litert-community/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Paper de Qwen3: https://arxiv.org/abs/2505.09388

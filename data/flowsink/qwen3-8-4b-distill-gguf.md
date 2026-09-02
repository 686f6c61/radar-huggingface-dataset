# Flowsink/Qwen3.8-4B-Distill-GGUF

## Resumen

Flowsink/Qwen3.8-4B-Distill-GGUF es la version cuantizada en formato GGUF del modelo empero-ai/Qwen3.8-4B, una destilacion de parametros completos del modelo gigante Qwen3.8 2.4T A95B sobre la arquitectura del Qwen3.5-4B de Alibaba. El proyecto lo desarrolla Empero (empero.org) y el objetivo es trasladar las capacidades de razonamiento de un modelo de 2,4 billones de parametros a un modelo denso de 4.300 millones, haciendolo ejecutable en hardware de consumo.

La relevancia de este modelo radica en que combina una arquitectura hibrida con capas Gated DeltaNet (tres capas de atencion lineal por cada capa de atencion completa), lo que reduce el coste del cache KV en contextos largos, y un entrenamiento por destilacion basado en ~45.000 trazas de razonamiento del profesor. El resultado es un modelo de razonamiento que abre cada respuesta con un bloque de pensamiento explicito y que mejora notablemente el rendimiento en MMLU respecto a su base (0,553 frente a 0,354), aunque con una ligera regresion en GSM8K.

Esta ficha cubre exclusivamente la version GGUF publicada por Flowsink, pensada para ejecutarse con llama.cpp, Ollama, LM Studio, Jan, KoboldCpp y otros runtime compatibles con GGUF. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer con capas Gated DeltaNet (3 capas DeltaNet por cada capa de atencion completa) |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base empero-ai/Qwen3.8-4B es una destilacion de parametros completos (full-parameter distillation) del modelo Qwen3.8 2.4T A95B sobre la arquitectura del Qwen3.5-4B. La arquitectura es hibrida: por cada capa de atencion completa (full attention) hay tres capas Gated DeltaNet, un tipo de atencion lineal con compuertas que reduce el coste computacional y de memoria del cache KV en secuencias largas. Esta caracteristica exige una version reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargaran la arquitectura.

El entrenamiento por destilacion utilizo aproximadamente 45.000 trazas de razonamiento (teacher traces) curadas internamente por Empero, generadas por el modelo profesor Qwen3.8 2.4T. No se menciona el uso de RLHF ni DPO en la informacion disponible. El modelo resultante es un modelo de razonamiento: cada respuesta comienza con un bloque de pensamiento explicito (thinking) que debe eliminarse para el usuario final.

## Capacidades

- Generacion de texto conversacional con plantilla de chat integrada en el archivo GGUF.
- Razonamiento explicito: el modelo abre cada respuesta con un bloque de pensamiento (thinking) antes de la respuesta final, siguiendo protocolos de cadena de pensamiento (CoT).
- Mejora sustancial en conocimiento general y razonamiento multitematico frente a su base: +0,199 en MMLU (57 materias, protocolo CoT).
- Inferencia eficiente en CPU y GPU de baja capacidad gracias a la arquitectura hibrida con capas Gated DeltaNet.
- Compatibilidad con runtime GGUF estandar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- Soporte de tool calling, funciones multimodales (vision, audio) y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento en dispositivos de gama baja: con la cuantizacion Q4_K_M (2,78 GB) el modelo cabe en tarjetas graficas de 4-6 GB, lo que permite ejecutar tareas de razonamiento con cadena de pensamiento en equipos de consumo sin acceso a GPU de datacenter.
- Inferencia exclusiva en CPU: la cuantizacion Q4_K_M o Q5_K_M es una opcion solida para despliegues CPU-only, por ejemplo en servidores sin GPU o en entornos de edge computing donde la latencia no es critica.
- Chatbots conversacionales autocontenidos: la plantilla de chat va embebida en el archivo GGUF, de modo que se puede cargar directamente en Ollama o LM Studio sin configuracion adicional y desplegar un asistente conversacional con licencia Apache-2.0.
- Prototipado rapido de aplicaciones de IA generativa: al ser un modelo de 4,3 B en formato GGUF, permite iterar rapidamente en entornos de desarrollo locales con herramientas como llama.cpp o KoboldCpp antes de escalar a modelos mayores.
- Aplicaciones comerciales con requisitos de licencia permisiva: la licencia Apache-2.0 permite integrar el modelo en productos propietarios sin obligacion de publicar el codigo fuente, algo relevante para startups y equipos internos.
- Evaluacion de tecnicas de destilacion: el modelo sirve como referencia para comparar estrategias de destilacion de modelos gigantes a arquitecturas pequenas, especialmente en lo relativo al equilibrio entre conocimiento general (MMLU) y razonamiento aritmetico (GSM8K).
- Despliegue en entornos con restriccion de memoria: la version Q4_K_M ocupa 2,78 GB, lo que permite ejecutar el modelo en contenedores con limites de memoria ajustados o en dispositivos embebidos con 4 GB de RAM.

## Benchmarks y rendimiento

Los resultados publicados en la model card del modelo fuente (empero-ai/Qwen3.8-4B) comparan el modelo destilado con su base Qwen3.5-4B, utilizando protocolos de cadena de pensamiento y la herramienta lm-evaluation-harness con ajustes identicos para ambos:

| Tarea | Qwen3.5-4B (base) | Qwen3.8-4B (destilado) | Diferencia |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,354 | 0,553 | +0,199 |
| GSM8K (CoT) | 0,850 | 0,785 | -0,065 |

No se han publicado resultados de benchmarks para las versiones GGUF cuantizadas en la informacion disponible. La cuantizacion puede introducir degradaciones adicionales respecto a los valores del modelo en precision completa.

## Requisitos de hardware

- Q4_K_M (2,78 GB) y Q5_K_M (3,16 GB): comodos en tarjetas de 4-6 GB de VRAM; opcion solida para ejecucion solo CPU.
- Q6_K (3,56 GB) y Q8_0 (4,61 GB): se recomiendan 6-8 GB de VRAM.
- BF16 (8,67 GB): requiere 12 GB o mas de VRAM.
- El cache KV es el coste dominante en contextos largos y puede requerir offload a CPU independientemente de la cuantizacion de pesos.
- GPU recomendadas: RTX 3060/4060 (4-6 GB) para Q4_K_M/Q5_K_M; RTX 4070/4080 o equivalentes (6-8 GB) para Q6_K/Q8_0; RTX 4090 o GPUs de datacenter para BF16.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, Jan, KoboldCpp.
- Parametros de muestreo recomendados: temperatura 0,6, top_p 0,95, top_k 20.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Qwen3.8-4B-Distill (este) | 4,3 B | No disponible | 0,553 | 0,785 | Apache-2.0 | GGUF |
| Qwen3.5-4B (base) | 4,3 B | No disponible | 0,354 | 0,850 | Apache-2.0 | Safetensors / GGUF |
| Ma7ee7/Qwen3.8_4B_Distilled_GGUF | 4 B | 256 K | No disponible | No disponible | No disponible | GGUF |

La alternativa de Ma7ee7 es una destilacion distinta: parte de los pesos del Qwen3-4B-Thinking-2507 y destila salidas generadas por Qwen3.8-Max, manteniendose como un modelo Qwen3 clasico (sin capas Gated DeltaNet). No se dispone de datos de rendimiento comparables para esta alternativa. Tambien existen versiones destiladas de 2 B y 9 B del mismo proyecto de destilacion de Qwen3.8 (repositorio RayCodes_Qwen3.8Distilled), pero sin datos de benchmark publicados en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo soporta ingles (en); no se garantiza rendimiento en otros idiomas.
- Es un modelo de razonamiento: cada respuesta abre con un bloque de pensamiento que debe eliminarse para el usuario final, lo que anade latencia y consumo de tokens.
- Regresion en GSM8K (-0,065) respecto a la base Qwen3.5-4B: la destilacion mejora el conocimiento general pero degrada ligeramente el razonamiento aritmetico.
- Requiere una version reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargaran la arquitectura.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- El cache KV es el coste dominante en contextos largos y puede requerir offload a CPU, lo que degrada la latencia.
- La cuantizacion GGUF puede introducir degradaciones de rendimiento adicionales no reflejadas en los benchmarks del modelo en precision completa.
- El modelo no reproduce las capacidades completas del profesor Qwen3.8 2.4T; es una aproximacion de 4,3 B con limitaciones inherentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Flowsink/Qwen3.8-4B-Distill-GGUF
- Modelo fuente (empero-ai/Qwen3.8-4B): https://huggingface.co/empero-ai/Qwen3.8-4B
- Modelo base (Qwen/Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de Empero: https://empero.org
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Destilacion alternativa (Ma7ee7): https://huggingface.co/Ma7ee7/Qwen3.8_4B_Distilled_GGUF
- Destilaciones 2B/4B/9B (RayCodes): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled

# EliovpAI/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4

## Resumen

Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4 es un conjunto de pesos cuantizados a 3 bits (INT3, formato GPTQ con rotación Hadamard) para las proyecciones del decodificador de Qwen/Qwen3.8-27B, calibrados mediante un proceso GPTQ propio sobre datos con licencia permisiva. Lo publica EliovpAI como complemento del despliegue Paiton de Qwen3.8 sobre una GPU AMD Radeon AI PRO R9700 (gfx1201, RDNA4, 32 GB), no como checkpoint autónomo: requiere el checkpoint objetivo unsloth/Qwen3.8-27B-NVFP4 y el drafter DFlash2 para decodificación especulativa.

El objetivo es reducir la huella de memoria del modelo servido en hardware RDNA4 manteniendo una precisión cercana a bf16. Frente a la imagen MXFP4 anterior, el autor reporta un aumento del 19,9 % en decode ponderado, del 5-13 % en prefill y una caída de memoria de modelo de 19,18 a 15,89 GiB, a costa de unos 3 puntos de MMLU-Pro. Las actualizaciones de octubre y noviembre de 2026 destilan las escalas de grupo hacia bf16 para recuperar parte de esa precisión, con mejoras medibles en divergencia KL y en tareas agénticas de SWE-bench Verified.

El modelo base Qwen3.8-27B no está documentado en la información disponible (arquitectura, número de parámetros activos, composición del dataset). La ficha se limita a los datos verificables del repositorio de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B; detalles no disponibles). Pesos de decodificador cuantizados con GPTQ + rotación Hadamard |
| Parametros totales | 27B (modelo base); pesos de este repo: 9,55 GB en INT3 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 por defecto; hasta 262.144; 524.288 opcional (opt-in). Caché hasta 628.877 tokens (555.128 con imágenes) |
| Tipos de cuantizacion | INT3 (3 bits), W3A4, GPTQ con escalas de grupo rotadas (W3Rot). Requiere runtime Paiton |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos propietarios del runtime Paiton (no safetensors ni GGUF estándar); repo de 33,4 GB con SHA256SUMS |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, del que no se dispone de detalles arquitectónicos en la información proporcionada. Sobre él, EliovpAI aplica una cuantización GPTQ a 3 bits de las proyecciones del decodificador, con rotación Hadamard previa (W3Rot) para redistribuir valores atípicos antes de cuantizar, y activaciones en 4 bits (W3A4). El calibrado se realizó con un run GPTQ propio sobre datos con licencia permisiva, e incluye conversaciones de destilación que citan código de repositorios de SWE-bench bajo sus propias licencias (una de ellas, pylint, GPL-2.0; ver CALIBRATION.md).

Las actualizaciones posteriores no cambian el formato ni los códigos de 3 bits: solo destilan las escalas de grupo hacia bf16. La del 12 de octubre reduce la divergencia KL a bf16 un 20,9 % en decode y un 23,8 % en prefill. La del 24 de octubre, sobre 4,2 millones de tokens nuevos, baja la KL servida en R9700 un 3,0 % adicional y acerca los documentos largos (8K-131K tokens) un 1-2 % a bf16. La del 7 de noviembre destila las escalas de gate y up del MLP de las capas 32 a 63 sobre trayectorias de agentes de código (SWE-bench Verified en bf16), cambiando el 1,3 % de los valores de escala. El despliegue usa decodificación especulativa con el drafter DFlash2 (FP8) y kernels nativos en la imagen r2.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.8-27B.
- Capacidades de código y resolución de tareas agénticas: el autor reporta 323 de 500 tareas resueltas en SWE-bench Verified con estos pesos (390 en bf16).
- Soporte de contextos largos: hasta 262.144 tokens por defecto y 524.288 opcional, con caché de hasta 628.877 tokens.
- Procesamiento de imágenes: la caché indica 555.128 tokens con imágenes, lo que sugiere soporte multimodal en el modelo base (no confirmado en la información disponible).
- Decodificación especulativa integrada mediante el drafter DFlash2.
- Tool calling, function calling y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de inferencia en GPU de consumo profesional AMD: el formato está diseñado específicamente para una Radeon AI PRO R9700 (32 GB), permitiendo servir un modelo de 27B con 65K de contexto en una sola tarjeta gracias a los 9,55 GB de pesos INT3 y los 15,89 GiB de memoria total de modelo.
- Agentes de código autónomos: las actualizaciones de noviembre se calibraron sobre trayectorias de SWE-bench Verified; el modelo resuelve tareas de reparación de bugs en repositorios reales, con 323/500 resueltas reportadas, lo que lo hace adecuado para pipelines de agentes de ingeniería de software.
- Procesamiento de documentos largos: con 262K de contexto por defecto y degradación controlada de 1-2 % frente a bf16 en el rango 8K-131K, sirve para análisis de contratos, informes o bases de código extensas.
- Sustitución de despliegues MXFP4 en producción: el autor reporta un 19,9 % más de throughput en decode y un 5-13 % en prefill con menor memoria, por lo que es una actualización directa para instalaciones Paiton existentes.
- Evaluación comparativa de cuantización: útil para investigadores que midan la pérdida de precisión de INT3 con rotación frente a bf16 en tareas de conocimiento (MMLU-Pro), matemáticas (GSM8K) y código (HumanEval).
- Experimentación con decodificación especulativa: el stack DFlash2 + W3Rot permite estudiar el equilibrio entre latencia, memoria y precisión en hardware RDNA4.

## Benchmarks y rendimiento

Los datos publicados por el autor son comparaciones internas entre revisiones de los pesos, no frente a otros modelos:

| Metrica | Resultado reportado |
|---|---|
| Decode ponderado vs. MXFP4 | +19,9 % |
| Prefill vs. MXFP4 | +5-13 % |
| Memoria de modelo | 19,18 GiB (MXFP4) → 15,89 GiB (INT3) |
| MMLU-Pro | −3 puntos vs. bf16 (recuperados 0,5-1 punto en la revisión del 12 de octubre) |
| SWE-bench Verified, 500 tareas | 323 resueltas (vs. 284 revisión anterior; bf16: 390) |
| SWE-bench Verified, 250 tareas held-out | 165 (vs. 134 revisión anterior) |
| KL a bf16 (12 oct) | −20,9 % decode, −23,8 % prefill |
| KL a bf16 (24 oct) | −3,0 % adicional en R9700 |
| Acuerdo top-1 en decode vs. bf16 (texto general) | −0,32 puntos en la revisión del 7 de noviembre |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible.

## Requisitos de hardware

- GPU: una AMD Radeon AI PRO R9700 (gfx1201, RDNA4, 32 GB) exclusivamente. No hay soporte documentado para NVIDIA ni otras GPUs.
- Host: Linux x86-64, Python 3, Docker, acceso a dispositivos AMD (`/dev/kfd`, `/dev/dri`).
- Imagen de runtime: `ghcr.io/eliovp/paiton-vllm-plugin:qwen38-rocm10-vllm029-20261107-r2` (basada en vLLM 0.29 y ROCm 10).
- Checkpoints adicionales obligatorios: unsloth/Qwen3.8-27B-NVFP4 en revisión f0b7c9e y tcclaviger/Qwen3.8-27B-DFlash2-FP8 en revisión ee0cb26.
- Memoria de modelo servida: 15,89 GiB, lo que deja margen en los 32 GB de la R9700 para caché KV de hasta 628.877 tokens.
- No cabe en GPUs de consumo estándar (RTX 4090, etc.) por falta de soporte del runtime Paiton fuera de RDNA4.
- Opciones de despliegue: únicamente el launcher `run-3bit.sh` del repositorio paiton-vllm-plugin. No hay soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput absolutos: no disponibles (solo incrementos relativos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Este modelo (W3Rot-INT3) | 27B | 65K-524K | INT3 GPTQ + Hadamard | Apache 2.0 | R9700 RDNA4 |
| Qwen3.8-27B bf16 (base) | 27B | 65K-524K | bf16 | Apache 2.0 (base) | No disponible |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | No disponible | NVFP4 | No disponible | No disponible |
| Imagen MXFP4 Paiton (previa) | 27B | No disponible | MXFP4 | No disponible | R9700 RDNA4 |

No se dispone de datos de rendimiento de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autónomo: requiere el checkpoint objetivo NVFP4 y el drafter DFlash2 en revisiones exactas. Usar otras revisiones puede producir resultados incorrectos porque las filas b/a de Gated DeltaNet rotadas se derivaron de los bytes de la revisión objetivo.
- Exclusivo de AMD RDNA4 (gfx1201) con el runtime Paiton; no funciona en NVIDIA, Apple Silicon ni GPUs AMD anteriores.
- Pérdida de precisión respecto a bf16: unos 3 puntos de MMLU-Pro y menor acuerdo top-1 en decode (−0,32 puntos) en texto general.
- Los resultados de SWE-bench con 80 tareas no son estadísticamente significativos (p 0,078 y p 0,12); solo las 500 tareas completas alcanzan significación (p 0,0006).
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Idiomas soportados no documentados.
- Las conversaciones de calibración incluyen código de repositorios SWE-bench con licencias diversas, una GPL-2.0 (pylint); revisar CALIBRATION.md antes de uso comercial en contextos sensibles.
- La licencia Apache 2.0 del repo de pesos no cubre necesariamente el modelo base ni los datos de calibración.
- El formato de pesos es propietario del runtime Paiton; no es portable a otras herramientas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EliovpAI/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint objetivo: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4/tree/f0b7c9e722f5565102fff8481c99e4d86ae099c7
- Drafter DFlash2: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8/tree/ee0cb26a8279b7910cc28d82a8a3e15e4728d56f
- Repositorio del plugin Paiton: https://github.com/Eliovp-BV/paiton-vllm-plugin
- Documentación del despliegue MXFP4/DFlash2: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3.8-MXFP4-DFlash2/README.md
- Imagen de runtime: ghcr.io/eliovp/paiton-vllm-plugin:qwen38-rocm10-vllm029-20261107-r2
